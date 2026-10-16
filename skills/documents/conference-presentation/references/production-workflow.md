# Production workflow and script interface

## Runtime and paths

Use the installed Presentations skill's current authoring instructions and `load_workspace_dependencies` to locate Node, Node packages and Python. Keep runtime/plugin paths in the **project configuration**, not this personal skill. The scripts resolve packages through `RUNTIME_NODE_MODULES`, or normal local Node resolution if packages are already present. No package install or symlink inside the skill is needed.

Example notation below:

- `SKILL_ROOT`: absolute directory of this personal skill.
- `RUNTIME_NODE`, `RUNTIME_NODE_MODULES`: executable and packages returned by workspace dependencies.
- `PRESENTATIONS_SKILL`: current installed Presentations skill directory, not a hardcoded cache version.
- `RUNTIME_PYTHON`: bundled Python executable.
- `UV`: available `uv` executable.

Run Python scripts with **uv run**. In a uv-managed project use its environment (`uv sync` if needed), with `uv add`/`uv remove` for dependencies. With the bundled runtime, use `uv run --no-project --offline --python "$RUNTIME_PYTHON" "$SKILL_ROOT/scripts/prepare_sources.py" ...`. Use a project-writable uv cache if required. `prepare_sources.py` needs `pypdfium2` and Pillow; other Python checks use the standard library. Do not install replacements for the bundled workspace dependencies.

Before actual PPTX creation/editing, follow any operation-start marker required by the installed Presentations skill. Source preparation, template inspection and outline drafting do not author the deck. Keep all inputs immutable, build under `.conference-build/`, and deliver under `output/`. Each candidate/final/report/preview folder gets a new path; scripts refuse overwriting existing outputs where applicable.

## 1. Prepare sources and inspect the template

```sh
"$UV" run --no-project --offline --python "$RUNTIME_PYTHON" "$SKILL_ROOT/scripts/prepare_sources.py" --paper paper.pdf --artwork-dir Artworks --template conference-template.pptx --out .conference-build/sources
RUNTIME_NODE_MODULES="$RUNTIME_NODE_MODULES" "$RUNTIME_NODE" "$SKILL_ROOT/scripts/inspect_deck.mjs" --deck conference-template.pptx --out .conference-build/template-preview
```

Preparation emits paper text with PDF page numbers, template size/slide order/elements/fonts/sizes, extracted original template media, prepared artwork files and an artwork manifest. It follows the presentation's relationship order, rather than assuming slide-file numbering equals speaking order. PDF source artwork is rasterized at scale 3 by default; originals remain untouched. Non-PDF files are copied intact; unsupported raster/vector source types can be converted with available format-specific tools only when needed. Multipage PDFs produce a separate image per page.

Inspect cover/content/closing individually. Identify safe rectangles and inherited elements, contrast, background images, current conference logos, fixed typography and any sample text to replace. Template inventory reports explicit native text styles; inherited/theme styles and embedded image text also need visual inspection. Select template slide numbers based on evidence, not a universal assumption that the second slide is always content.

Prepare the eight-section outline from `assets/outline-template.md`, with slide content, design, source evidence and estimated time allocations. Do not draft per-slide speaking notes, scripts, transitions or extended Q&A answers. Copy the full applicable style rules into its **Typography and layout** section, omitting the standalone guide title and demoting its subsection headings from `##` to `####`. Review the actual paper's figures and conclusions. Get the user-requested outline review before building unless it has already been approved or explicitly waived.

## 2. Build from the approved outline

Copy `assets/deck-spec.example.json` to the project and replace its specimen copy/layout with the approved outline. It is a schema demonstration, not an automatic content generator or a fixed five-slide talk.

```sh
RUNTIME_NODE_MODULES="$RUNTIME_NODE_MODULES" "$RUNTIME_NODE" "$SKILL_ROOT/scripts/build_deck.mjs" --spec .conference-build/deck-spec.json --out .conference-build/v1-candidate.pptx
```

All paths in the specification resolve **relative to the spec file**; `--out` resolves relative to the process working directory. Ensure the template and artwork paths reflect that.

Top-level fields:

| Field | Meaning |
|---|---|
| `template` | Required supplied PPTX path |
| `coverTemplateSlide`, `contentTemplateSlide` | 1-based selected template slides, default 1/2 only when these are the inspected layouts |
| `style` | Optional profile overrides, e.g. `fonts`, `colours`, `points`; record the reason in the outline |
| `pageNumbers`, `pageNumberOptions` | Optional native page numbers on non-cover slides, default off to avoid duplicating a template's existing numbers; options set the inspected position/size |
| `slides` | Ordered nonempty array; includes closing and hidden backups |
| `slidesApproved` | Defaults to false. Set true only after the user actually approves the finished slides; required if the build specification includes delivery prose. Prefer the notes-only workflow below for an approved deck. |

Per slide:

| Field | Meaning |
|---|---|
| `role` | `cover` selects the cover template; otherwise content is default |
| `templateSlide` | Explicit 1-based source slide override, useful for closing/backup |
| `removeTemplateElements` | Exact owned shape/image names approved for removal; default preserves all. Does not remove inherited master artwork. For a populated template, inspect and replace placeholders/sample text deliberately. |
| `title`, `titleOptions` | Optional title and geometry/style overrides. For a cover use a text element in its inspected title area instead of an automatic content heading. |
| `subtitle` | Adds the results title/subtitle/bar treatment; `title` can override the repeated results title |
| `hidden` | Actual PowerPoint slideshow visibility, default false |
| `pageNumber` | Optional explicit displayed number, or false to suppress; useful when approved hidden slides retain historical numbering |
| `elements` | Ordered list of content elements described below |
| `connections` | Attached links between named card/diagram/text/picture elements |
| `closing` | Optional `{email, acknowledgment}`; omit values when not verified |
| `notes` | During slide development, omit or use `{sources}` only. After final slide approval, may contain `{seconds, delivery, transition, preparation, sources}`; preparation/sources may be a string or array. Delivery fields require `slidesApproved: true`. |

Each element has a stable `name`; use unique names within the slide. Coordinates `x,y,w,h` are reference-canvas pixels on 1280×720. The toolkit adapts geometric positions to the preserved template frame; **point sizes remain physical points**. For a substantially different aspect ratio, recompose the approved layout instead of relying on automatic stretching of the grid.

| `type` | Required/useful fields |
|---|---|
| `text` | `text,x,y,w,h`; optional `options:{font,size,color,bold,align,vAlign}`; size in points. Text may be structured paragraphs/runs where rich formatting is needed. |
| `bullets` | `items,x,y,w,h`; `items` may be strings or `{label,text,level,size,character,spaceAfterPt,runs}`. Label is bold navy; text is regular black. `options.size` defaults to 22 pt; nested items use 20 pt. |
| `card` | `title,body` or `items`, `x,y,w,h`; optional `headerH` (70) and `bodyGap` (14). Body is the connector anchor. |
| `stat` | `value,label,x,y,w,h`; optional `size` (32), `valueH` (54), `labelSize` (20), `ruleWidth`. Use explicit line breaks for long labels. |
| `diagramBox` | `title,body,x,y,w,h`; `role` = support/light/central/optional; optional `colour,opacity`. Central/optional defaults to orange; other roles default to blue. Palette choices remain semantic. |
| `picture` | `file,x,y,w,h,alt`; supports PNG/JPEG/SVG/WebP, aspect-preserving contain. PDF must first be rendered. |
| `contribution` | `heading,items,y`; optional `x,w,h`; uses the original native check/divider and solid/hollow bullets |

Connections use `{from:"name",to:"name",fromSide:"right",toSide:"left",kind:"straight",arrow:true,dashed:false}`. Use `kind:"elbow"` for native orthogonal routing when appropriate. For multi-branch routes or return loops, a custom project builder may add invisible native junctions and link each segment with the same toolkit; only the final segment gets an arrowhead. Do not fake attachment with loose line endpoints.

For layouts beyond the JSON vocabulary, import `createKit(presentation, styleOverrides)` from `scripts/slide-kit.mjs` in a project builder. The same helper names are exposed as methods. Call `kit.materialize(Presentation)` **after all authoring** before exporting; it applies the supplied native card/check geometry to the placeholders and returns the completed presentation. Do not keep using old shape references after materialization. Source figures remain images by design; native text/diagrams remain editable.

## 3. Validate, render and repair

```sh
RUNTIME_NODE_MODULES="$RUNTIME_NODE_MODULES" "$RUNTIME_NODE" "$SKILL_ROOT/scripts/inspect_deck.mjs" --deck .conference-build/v1-candidate.pptx --out .conference-build/v1-review
"$UV" run --no-project --offline --python "$RUNTIME_PYTHON" "$SKILL_ROOT/scripts/audit_pptx.py" --deck .conference-build/v1-candidate.pptx --out .conference-build/v1-audit.json --expected-slides 12 --expected-hidden 12
```

Replace example counts with the approved total and hidden slide numbers; `--expected-hidden ''` requires no hidden slides. Audit reports package relationship defects, bullet geometry and hidden/count mismatches as errors. Fonts, small text, unattached connectors and typed bullets are review warnings because legitimate template/cover exceptions exist. Missing speaking notes are expected before final slide approval and are not a warning. The audit is read-only and does not repair or prove visual correctness. It records native tables, notes presence, point sizes, fonts, arrow ends and alpha values for inspection; compare to the actual approved design.

`inspect_deck.mjs` reimports and renders all slides, including hidden slides. It also writes a contact sheet, layout exports, full proto, inspection and notes. `--slides 2,4` limits full-size renders for a local repair; omit it for final deck review. `--scale 1` is the default. A contact sheet checks flow; inspect every individual slide at full size for clipping, unwanted wraps, near overlaps, figure legibility and footer collisions. If a chosen font is unavailable, resolve it rather than silently substituting.

Check factual coverage and source citations against the approved outline. Verify the expected slide count/route, source figures, statistics labels/units, consistent colours, 20–24 pt body hierarchy and applicable exceptions. Reimport alone cannot prove preservation; inspect the **exported** file. During revisions, compare changed slides and preserve unrelated slide content and artwork. Make a fresh candidate and fresh preview directory after repairs. Continue to defer speaking notes throughout these revisions.

## 4. Finalize to a versioned deliverable

The wrapper uses the current Presentations skill finalizer. Create a project JSON configuration like this, with **resolved local paths** and the actual inspected template dimensions/count:

```json
{
  "workspaceDir": "/absolute/project",
  "candidatePath": "/absolute/project/.conference-build/v1-candidate.pptx",
  "finalPath": "/absolute/project/output/Conference_Presentation_v1.pptx",
  "receiptPath": "/absolute/project/.conference-build/v1-validation.json",
  "presentationSkillDir": "/resolved/current/presentations-skill",
  "pythonExecutable": "/absolute/project/.conference-build/uv-python",
  "expectedSlideSizeEmu": "12192000,6858000",
  "explicitTotalSlideCount": 12,
  "requiredNativeTableOwnerSlides": [],
  "requiredNativeChartOwnerSlides": [],
  "fontPolicy": {"basis":"user_request", "families":["Calibri","Corbel"]}
}
```

For the user's personal-style request, the profile fonts come from user requirements; update the policy when a template or new instruction selects other fonts. Do not infer requirements for editable charts from supplied figure images. Add native chart/table owners only when actually required. Candidate and final must remain inside the declared workspace, in separate build/output folders. Keep validation reports out of output.

`pythonExecutable` can be a project-local executable shell wrapper so the finalizer's Python validators also run through uv:

```sh
#!/bin/sh
exec /resolved/path/to/uv run --no-project --offline --python /resolved/runtime/python3 python "$@"
```

Use quoted absolute paths in the generated wrapper if they contain spaces. Mark it executable. Then:

```sh
RUNTIME_NODE_MODULES="$RUNTIME_NODE_MODULES" "$RUNTIME_NODE" "$SKILL_ROOT/scripts/finalize_deck.mjs" --config .conference-build/finalization.json
```

Render the finalized file into a new directory and inspect it before delivery. Present this completed slide deck and current Markdown outline for **final slide approval**. Wait for the user's approval of the actual deck before generating speaking notes; outline approval and technical finalization are separate from this checkpoint. Keep the candidate scripts/assets and inspection records in the project. Claim PowerPoint or Google Slides checking only when it was actually performed there.

## 5. Add speaking notes after final slide approval

Draft the timed delivery script, transitions, extended preparation/Q&A answers and rehearsal guidance from the exact approved slides. Create a project notes JSON file:

```json
{
  "slidesApproved": true,
  "slides": [
    {
      "slide": 1,
      "seconds": 20,
      "delivery": "Introduce the approved paper and its central message.",
      "transition": "Introduce the need shown on the next slide.",
      "preparation": "Additional explanation for preparation and questions.",
      "sources": ["Paper, title and introduction"]
    }
  ]
}
```

`slidesApproved` records actual user approval, not approval inferred from a completed build. Include every slide that needs notes, using 1-based slide numbers. Omitted slides retain their existing notes; omitted `sources` retains existing source citations. Hidden backups get preparation material without adding their duration to the main route.

```sh
RUNTIME_NODE_MODULES="$RUNTIME_NODE_MODULES" "$RUNTIME_NODE" "$SKILL_ROOT/scripts/add_speaking_notes.mjs" --deck output/Conference_Presentation_v1.pptx --notes .conference-build/speaking-notes.json --out .conference-build/v2-with-notes-candidate.pptx
```

The helper requires recorded final slide approval, adds notes without rebuilding slide layouts, and checks slide content/geometry, order and visibility before and after export. It refuses an existing output. Custom code may call `kit.notes(slide, content, {slidesApproved: true})` after actual approval; the helper rejects delivery prose without that flag. Source-only metadata needs no final slide approval. Use the audit's optional `--require-notes` only at this stage when every slide is expected to have a notes relationship.

Finalize the notes candidate to a new versioned deliverable, inspect the exported notes and preserve the approved slide design. Add delivery sections to the outline only now, if they are being maintained there. Confirm note timings fit the final route and separate main script from preparation detail. If speaking-note preparation reveals a needed slide change, obtain review of that change before adapting the affected notes. No additional note-approval checkpoint is required unless requested.
