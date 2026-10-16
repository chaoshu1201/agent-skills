#!/usr/bin/env python3
"""Inspect exported OOXML; report concrete defects and reviewable style exceptions."""
import argparse
import json
import posixpath
import re
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

NS = {"p": "http://schemas.openxmlformats.org/presentationml/2006/main", "a": "http://schemas.openxmlformats.org/drawingml/2006/main", "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
STYLE = Path(__file__).resolve().parent.parent / "assets/style-profile.json"


def audit(filename, expected_slides=None, expected_hidden=None, style_path=STYLE, require_notes=False):
    profile = json.loads(Path(style_path).read_text())
    errors, warnings, records = [], [], []
    with ZipFile(filename) as archive:
        names = set(archive.namelist())
        corrupt = archive.testzip()
        if corrupt:
            errors.append(f"Corrupt ZIP part: {corrupt}")
        for member in names:
            if not member.endswith(".rels"):
                continue
            parent = posixpath.dirname(posixpath.dirname(member))
            for rel in ET.fromstring(archive.read(member)):
                if rel.get("TargetMode") == "External":
                    continue
                target = rel.get("Target", "").split("#", 1)[0]
                resolved = target.lstrip("/") if target.startswith("/") else posixpath.normpath(posixpath.join(parent, target))
                if resolved not in names:
                    errors.append(f"Missing relationship target: {member} -> {target}")
        pres = ET.fromstring(archive.read("ppt/presentation.xml"))
        rels = {r.get("Id"): r.get("Target") for r in ET.fromstring(archive.read("ppt/_rels/presentation.xml.rels"))}
        slide_ids = pres.findall("p:sldIdLst/p:sldId", NS)
        if expected_slides is not None and len(slide_ids) != expected_slides:
            errors.append(f"Slide count {len(slide_ids)}, expected {expected_slides}")
        hidden = []
        for i, sid in enumerate(slide_ids, 1):
            target = rels[sid.get(f"{{{NS['r']}}}id")]
            member = target.lstrip("/") if target.startswith("/") else posixpath.normpath(posixpath.join("ppt", target))
            root = ET.fromstring(archive.read(member))
            if root.get("show", "1") == "0":
                hidden.append(i)
            shape_ids = {e.get("id") for e in root.findall(".//p:cNvPr", NS)}
            bullets, fonts, sizes, connectors = [], set(), set(), []
            for shape in root.findall("p:cSld/p:spTree/*", NS):
                nv = shape.find(".//p:cNvPr", NS)
                name = nv.get("name", "") if nv is not None else ""
                for para in shape.findall(".//a:p", NS):
                    pp = para.find("a:pPr", NS)
                    marker = pp.find("a:buChar", NS) if pp is not None else None
                    if marker is not None:
                        char = marker.get("char")
                        entry = {"shape": name, "marker": char, "marginLeft": pp.get("marL"), "indent": pp.get("indent")}
                        bullets.append(entry)
                        if char == profile["bullet"]["character"]:
                            margin, indent = int(pp.get("marL", "0")), int(pp.get("indent", "0"))
                            hanging = round(profile["bullet"]["hangingPt"] * 12700)
                            if margin < hanging or indent != -hanging:
                                errors.append(f"Slide {i}, {name}: incorrect native chevron geometry {margin}/{indent}")
                        elif char not in {"•", "○"}:
                            warnings.append(f"Slide {i}, {name}: bullet {char!r} differs from personal defaults")
                    raw = "".join(t.text or "" for t in para.findall("a:r/a:t", NS))
                    if marker is None and re.match(r"^\s*[›•○]\s+", raw):
                        warnings.append(f"Slide {i}, {name}: possible typed bullet instead of native paragraph formatting")
                for node in shape.iter():
                    if node.get("typeface"):
                        fonts.add(node.get("typeface"))
                    if node.get("sz"):
                        size = int(node.get("sz")) / 100
                        sizes.add(size)
                        # Source-image lettering is not native text and is never recased/restyled here.
                        if size < 20 and name not in {"slide-number", "footer"}:
                            warnings.append(f"Slide {i}, {name}: {size:g} pt native text needs an explicit template/cover exception")
                if shape.tag == f"{{{NS['p']}}}cxnSp":
                    start = shape.find(".//a:stCxn", NS)
                    end = shape.find(".//a:endCxn", NS)
                    endpoints = [n.get("id") if n is not None else None for n in (start, end)]
                    if any(v is not None and v not in shape_ids for v in endpoints):
                        errors.append(f"Slide {i}, {name}: connector references a missing shape")
                    if None in endpoints:
                        warnings.append(f"Slide {i}, {name}: connector has an unattached endpoint")
                    line = shape.find("p:spPr/a:ln", NS)
                    connectors.append({"shape": name, "endpoints": endpoints, "lineWidthEmu": line.get("w") if line is not None else None,
                                       "ends": [n.attrib for n in line if n.tag.endswith("End")] if line is not None else []})
            slide_rels = posixpath.join(posixpath.dirname(member), "_rels", posixpath.basename(member) + ".rels")
            has_notes = slide_rels in names and any("/notesSlide" in r.get("Type", "") for r in ET.fromstring(archive.read(slide_rels)))
            if require_notes and not has_notes:
                warnings.append(f"Slide {i}: no speaker notes relationship")
            allowed_fonts = set(profile["fonts"].values())
            for font in fonts - allowed_fonts:
                if not font.startswith("+"):
                    warnings.append(f"Slide {i}: native font {font!r} differs from personal font pairing; check template constraints")
            records.append({"slide": i, "part": member, "hidden": i in hidden, "fonts": sorted(fonts), "pointSizes": sorted(sizes), "bullets": bullets, "connectors": connectors,
                            "nativeTables": len(root.findall(".//a:tbl", NS)), "hasNotes": has_notes, "fillAlphaValues": [n.get("val") for n in root.findall(".//a:alpha", NS)]})
        if expected_hidden is not None and hidden != sorted(expected_hidden):
            errors.append(f"Hidden slides {hidden}, expected {sorted(expected_hidden)}")
        size = pres.find("p:sldSz", NS)
    return {"file": str(Path(filename).resolve()), "slideCount": len(records), "sizeEmu": dict(size.attrib), "hiddenSlides": hidden, "errors": errors, "warnings": sorted(set(warnings)), "slides": records}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--deck", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--expected-slides", type=int)
    parser.add_argument("--expected-hidden", help="Comma-separated 1-based slide numbers; empty string means none")
    parser.add_argument("--style", type=Path, default=STYLE)
    parser.add_argument("--require-notes", action="store_true", help="Check notes relationships after final slide approval; omitted during slide development")
    args = parser.parse_args()
    hidden = None if args.expected_hidden is None else [int(v) for v in args.expected_hidden.split(",") if v]
    result = audit(args.deck, args.expected_slides, hidden, args.style, args.require_notes)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("x", encoding="utf-8") as dest:
        json.dump(result, dest, indent=2)
    print(json.dumps({"report": str(args.out.resolve()), "slides": result["slideCount"], "errors": len(result["errors"]), "warnings": len(result["warnings"])}))
    raise SystemExit(1 if result["errors"] else 0)


if __name__ == "__main__":
    main()
