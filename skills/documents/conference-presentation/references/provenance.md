# Provenance and generalisation

The personal requirements were distilled from the user's recorded **Typography and layout** preferences and approved presentation designs. The rules in this skill are self-contained. Each new project supplies its own paper, artwork and conference template.

## Preserved

Calibri/Corbel pairing; point-size hierarchy; navy/black emphasis; title and diagram heading case distinctions; native chevron indentation; readable caveats; navy/grey native cards; navy/gold statistic blocks; translucent diagram palette; attached black connectors with large triangular heads; results header/subtitle and figure composition; native solid/hollow contribution bullets with check/divider; and the blue thank-you/Q&A closing treatment.

The content-free native card body/header and check-icon shape definitions were extracted from the approved deck. These preserve native geometry without shipping old slide content or conference branding. Colours are recorded as sRGB, including the source-image palette conversion already documented in the original outline.

## Generalised intentionally

| Original project detail | Reusable rule |
|---|---|
| 15-minute slot, 11:30 speaking target, 17 file slides | Determine main-talk, Q&A and buffer budgets for the new request; no fixed slide count |
| Slides 7 and 17 hidden, delivery 1–6 then 8–16 | Record each new deck's explicit main route and backup visibility |
| Engineering audience and inquiry/GenAI explanation | Adapt terminology and mechanism to the new audience and paper |
| A previous cover's white title | Preserve supplied cover contrast and template-specific sizing; white only where appropriate |
| A previous paper's result figures | Cover relevant evidence in paper order unless a documented narrative choice warrants a change |
| Three named contributions | Choose the actual paper's useful contribution count and supported implications |
| Bloom-category colours | Conditional palette only for diagrams explicitly using those categories |
| Exact card positions and statistic labels in a previous deck | Preserve common styling; choose local counts, coordinates and concise labels |
| Previous conference reference decks | Self-contained style rules and native primitives; use the new conference template for branding |
| A previous study's aims, outcomes and evaluation baseline | General evidence rule: retain what was measured, reference conditions and evaluation limits |
| Delivery scripts drafted during outlining | Defer speaking notes until the user approves the finished slides; plan only content, design, sources and approximate timing earlier |

## Script consolidation

The project had dozens of incremental scripts. The package contains their reusable mechanisms with parameters instead of hardcoded slide indices, source paths and version-to-version edits:

- `build_deck.mjs` / `slide-kit.mjs`: `build_deck`, typography, reference bullets, cards, navy/gold statistics, results headers, contribution/closing styling, diagrams/arrows and delivery-note work.
- `prepare_sources.py`: `inspect_sources.py` paper/artwork preparation and PPTX inventory, using standard ZIP/XML parsing plus PDF rendering.
- `inspect_deck.mjs`: `inspect_decks.mjs`, `render_final.mjs` and visual inspection exports, with selected-slide support and contact-sheet QA.
- `add_speaking_notes.mjs`: adds delivery notes to an approved deck, with approval and slide-preservation checks.
- `audit_pptx.py`: exported native-bullet geometry, point sizes/fonts, transparency, connections, visibility, notes and package relationships; thresholds come from the shared profile.
- `finalize_deck.mjs`: parameterised `finalize_deck.mjs`, using current installed presentation validators rather than a fixed plugin-cache version.

Historical scripts that substitute specific prose, depend on a vNN predecessor, or calculate a paper-specific statistic are not reusable dependencies. They stay in the project history; replaying them is not part of this skill.
