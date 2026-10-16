---
name: conference-presentation
description: Produce an editable conference PowerPoint from a paper PDF, original figure artworks and a supplied PPTX template in the user's approved personal style. Review an evidence-backed outline before building, apply the recorded typography and visual rules, and write speaking notes only after the user approves the finished slides. Use for academic conference talks or revisions in this style, rather than unrelated business decks.
---

# Conference Presentation

Turn a research paper into a clear, timed conference talk using the user's established presentation style. The reusable specification is in this skill; previous papers, reference decks and revision scripts are not required inputs.

## Inputs and precedence

Start with the **paper PDF, its original figure artworks, and the current conference PPTX template**. Read supplied requirements and existing files before asking anything. Infer authors, affiliation and contact information from the paper when available. Artwork may be PDF, SVG, PNG or other supplied source formats. Extra datasets, notebooks and previous decks are optional, required only for a requested claim or reconstruction that the paper cannot support.

Use current user instructions first, conference/template constraints next, then this personal style. Preserve the template's actual dimensions, artwork, logos and reserved areas. Apply the personal font pairing and content rules unless the user or mandatory template constraints override them. Do not import old conference branding, prior paper content, fixed slide counts, hidden-slide numbers or old statistics.

## Outline first

1. Read the paper and inspect all artwork and the template. Map each planned figure and factual claim to a paper page/section. Use `scripts/prepare_sources.py` for text extraction, figure rasterization and template inventory; see [production workflow](references/production-workflow.md).
2. Copy [outline-template.md](assets/outline-template.md) into the project as `<Project>_Presentation_Outline.md`. Read [Typography and layout](references/typography-and-layout.md) and populate the outline's matching section with the full applicable rules and explicit exceptions. Nest the copied guide's subsections at heading level four or deeper so the outline retains its eight-section structure. Keep this project section current when the user changes a general preference; put local dimensions and colour assignments in the relevant slide's design notes.
3. Develop the talk's central message, audience framing, running order, slide copy, visual design, estimated time allocations and source/artwork map. Record likely Q&A topics or evidence limits only as needed to plan coverage. **Do not draft per-slide speaking notes, delivery scripts, transitions or extended delivery/Q&A prose at this stage.** Organise around the actual contribution. A practice talk may follow need → design → implementation → evidence → lessons; do not force this research topic or narrative onto every paper. Avoid a separate agenda or literature-review slide in a short talk unless useful or requested.
4. Ask the user to review the **concrete completed outline**, including its story, figure coverage, timing and design exceptions. **Wait for outline approval before authoring the deck.** This is the user's requested checkpoint. If they already approved a supplied outline or explicitly ask to skip this review, proceed. Missing talk length can be marked as a provisional assumption in the draft for review; do not invent conference rules.

## Build and check

After approval, follow [production workflow](references/production-workflow.md). Use the installed Presentations skill's current local PPTX/runtime/finalization instructions when available. The bundled JavaScript toolkit uses `@oai/artifact-tool`, with no project-specific paths or version chain. Resolve the runtime from `load_workspace_dependencies`; do not modify the installed skill or require a runtime installation in its folder.

- Reuse `scripts/slide-kit.mjs` for editable text, native chevron bullets, cards, attached connectors, navy/gold statistics, results headers, contributions and closing pages. The style constants and content-free native shape assets are included. Original evidence artwork stays intact; new conceptual diagrams remain native and editable.
- `scripts/build_deck.mjs` builds from a project JSON specification derived from the **approved outline**. The Markdown is a content/design record, not an automatically parsed layout language. Use the included example as a schema guide; custom layouts can import the same toolkit instead of rewriting the helpers.
- Preserve paper figure order unless the narrative justifies a recorded change. Explain results rather than reciting values. Distinguish measured outcomes, design aims, author interpretations and proposed future work. Put essential caveats on screen in readable text; record source citations now and reserve detailed delivery explanations for later notes.
- Keep speaking notes deferred throughout slide creation and design revisions. Source citations may be recorded for traceability; they are not delivery prose. Keep hidden backups explicit in both the outline and PPTX. Exclude them from the estimated main-talk budget. Budget Q&A and a transition/rehearsal buffer separately; never claim an estimated duration is measured.
- Finalize to a new versioned filename, reimport, render every slide and inspect each at full size. Use `scripts/inspect_deck.mjs` and `scripts/audit_pptx.py` for reproducible inspection. Check template fidelity, point sizes, native bullet indentation, genuine fill transparency, connector attachment, figure legibility, footer clearance, source citations, slide count and hidden flags. Automated checks supplement visual review.
- Repair causes: shorten copy, rebalance space or split content before shrinking body text. Keep approved content and unaffected slides stable during revisions. Update the project outline with accepted changes. Present the completed, checked PPTX and current outline for **final slide approval**, then wait before writing speaking notes. Outline approval or a successful export does not imply final slide approval.

## Speaking notes after final slide approval

Once the user approves the finished slides, write notes against that exact deck and its final speaking route. Use timed plain-language **Delivery Script**, one **Transition**, **Preparation and Q&A only**, and **Sources**, in that order. Develop detailed Q&A answers and rehearsal guidance at this stage. Keep hidden backups separate from the main script and verify timing through rehearsal.

Add notes with `scripts/add_speaking_notes.mjs` or the toolkit's guarded notes helper. Preserve approved slide text, artwork, geometry, visibility and order, and export to a new versioned file. Verify the exported notes and preservation of the slide content; if a content/design revision is needed, return that change for review before adapting its notes. Keep the outline's delivery material deferred until this stage, and then update it to match the approved slides. Deliver the deck with notes and the current outline; retain sources/build files for future edits.

## Resources

- [Typography and layout](references/typography-and-layout.md): authoritative reusable personal rules, including all exceptions; read before outlining or building.
- [Production workflow and script interface](references/production-workflow.md): runtime setup, input preparation, build schema and QA; read before executing scripts.
- [Outline template](assets/outline-template.md): eight-section project planning document with repeatable slide records.
- [Style profile](assets/style-profile.json): machine-readable colours, fonts, sizes and geometry shared by the toolkit.
- [Provenance and generalisation](references/provenance.md): what came from this project and which historical constraints were deliberately generalised; read when changing the skill or resolving a style ambiguity.
