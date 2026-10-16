#!/usr/bin/env python3
"""Extract paper text, render original PDF artwork, and inventory the PPTX template."""
import argparse
import json
import posixpath
import shutil
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

NS = {"p": "http://schemas.openxmlformats.org/presentationml/2006/main", "a": "http://schemas.openxmlformats.org/drawingml/2006/main", "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}


def presentation_inventory(filename, media_folder=None):
    with ZipFile(filename) as archive:
        pres = ET.fromstring(archive.read("ppt/presentation.xml"))
        rels = ET.fromstring(archive.read("ppt/_rels/presentation.xml.rels"))
        targets = {r.get("Id"): r.get("Target") for r in rels if r.get("TargetMode") != "External"}
        size = pres.find("p:sldSz", NS)
        slides = []
        for i, sid in enumerate(pres.findall("p:sldIdLst/p:sldId", NS), 1):
            target = targets[sid.get(f"{{{NS['r']}}}id")]
            member = posixpath.normpath(posixpath.join("ppt", target)) if not target.startswith("/") else target.lstrip("/")
            root = ET.fromstring(archive.read(member))
            shapes = []
            for element in root.findall("p:cSld/p:spTree/*", NS):
                nv = element.find(".//p:cNvPr", NS)
                shapes.append({"kind": element.tag.rsplit("}", 1)[-1], "id": nv.get("id") if nv is not None else None, "name": nv.get("name") if nv is not None else None,
                               "text": "\n".join(t.text or "" for t in element.findall(".//a:t", NS)),
                               "fonts": sorted({t.get("typeface") for t in element.findall(".//a:latin", NS) if t.get("typeface")}),
                               "pointSizes": sorted({int(t.get("sz")) / 100 for t in element.iter() if t.get("sz")})})
            slides.append({"slide": i, "packagePart": member, "hidden": root.get("show", "1") == "0", "elements": shapes})
        if media_folder:
            media_folder.mkdir(parents=True)
            for name in archive.namelist():
                if name.startswith("ppt/media/") and not name.endswith("/"):
                    (media_folder / Path(name).name).write_bytes(archive.read(name))
        return {"file": str(Path(filename).resolve()), "sizeEmu": {"cx": int(size.get("cx")), "cy": int(size.get("cy"))}, "slideCount": len(slides), "slides": slides}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--paper", type=Path, required=True)
    parser.add_argument("--artwork-dir", type=Path, required=True)
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--scale", type=float, default=3)
    args = parser.parse_args()
    if args.out.exists():
        parser.error("--out must be a new folder; original inputs and existing preparations are preserved")
    if not args.paper.is_file() or not args.template.is_file() or not args.artwork_dir.is_dir():
        parser.error("paper/template must be files, and artwork-dir must be a directory")
    if not 0 < args.scale <= 8:
        parser.error("scale must be >0 and <=8")
    import pypdfium2 as pdfium
    args.out.mkdir(parents=True)
    with pdfium.PdfDocument(args.paper) as paper:
        pages = []
        for i in range(len(paper)):
            page = paper[i]
            textpage = page.get_textpage()
            try:
                pages.append(f"# PDF page {i + 1}\n\n{textpage.get_text_range()}")
            finally:
                textpage.close()
                page.close()
    (args.out / "paper-text.md").write_text("\n\n".join(pages), encoding="utf-8")
    inventory = presentation_inventory(args.template, args.out / "template-media")
    (args.out / "template-inventory.json").write_text(json.dumps(inventory, indent=2), encoding="utf-8")
    assets = args.out / "artworks"
    assets.mkdir()
    entries = []
    for source in sorted(args.artwork_dir.rglob("*")):
        if not source.is_file() or source.name.startswith("."):
            continue
        relative = source.relative_to(args.artwork_dir)
        dest = assets / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix.lower() == ".pdf":
            with pdfium.PdfDocument(source) as doc:
                for i in range(len(doc)):
                    target = dest.with_name(dest.stem + f"-page-{i+1:02}.png")
                    page = doc[i]
                    try:
                        image = page.render(scale=args.scale).to_pil()
                        image.save(target)
                    finally:
                        page.close()
                    entries.append({"source": str(source.resolve()), "page": i + 1, "prepared": str(target.resolve()), "pixelSize": list(image.size), "scale": args.scale})
        else:
            shutil.copy2(source, dest)
            entries.append({"source": str(source.resolve()), "prepared": str(dest.resolve()), "treatment": "unchanged source file"})
    (args.out / "artwork-manifest.json").write_text(json.dumps(entries, indent=2), encoding="utf-8")
    print(json.dumps({"folder": str(args.out.resolve()), "paperPages": len(pages), "templateSlides": inventory["slideCount"], "artworkEntries": len(entries)}))


if __name__ == "__main__":
    main()
