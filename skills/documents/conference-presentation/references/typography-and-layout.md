# Typography and layout

This reusable specification captures the user's established typography, layout and visual preferences for conference presentations. Apply to main and backup slides. Current instructions and mandatory template constraints take precedence; record exceptions in the project outline. Coordinates below use a **1280 × 720 px reference canvas at 96 DPI**. Preserve the supplied template size, scale/adapt geometry to it, and inspect the result. Font sizes are **PowerPoint points**, not CSS pixels; 1 pt = 4/3 px, 1 px = 9,525 EMU, 1 pt = 12,700 EMU.

## Typography and colour

- Page titles: **Calibri Bold, 36–40 pt, navy #21376A**, upper left. Default to 36 pt.
- Titles and result subtitles: Title Case significant words, including cover and backup titles. Lowercase short articles, conjunctions and prepositions unless first or after a colon. Preserve acronyms, model/product spelling and significant hyphenated components, e.g. Research-Informed and LLM-Assisted. Do not recase embedded artwork.
- Diagram and card headings: capitalise the initial of **every word**, including And, A and Of. Preserve acronyms. Supporting sentences, body labels and captions use sentence case.
- Body: **Corbel 24 pt primary statements, 22 pt supporting text, 20 pt compact labels**. Shorten copy or increase space before reducing below 20 pt. Use black regular body text and navy headings/subheadings/ordinary bold emphasis. A restrained warm accent can indicate a review case; identify meaning in text as well as colour.
- Source/caveat text shown on slides: approximately **20 pt Corbel**. Necessary interpretation caveats must remain readable. Bibliographic metadata may be recorded in notes throughout; defer detailed delivery/preparation prose until final slide approval.
- **Cover exception:** follow the supplied cover's contrast, title area and sizing. Prefer a white title on a dark title area and black authors/affiliation on a light area; adapt colours to the actual template for readable contrast. A long paper title may use a documented smaller size in the template's title area. Emphasise the presenter, keep logos clear, and move contact/acknowledgment to closing unless the template requires otherwise.
- **Card-header exception:** centred **22 pt bold white Corbel** on navy bands, with **20 pt regular black Corbel** descriptions on light grey #F2F2F2. Bold body emphasis stays navy.
- Statistics and closing text have the explicit size/colour exceptions below. Template footer labels/page numbers can retain template sizing; they are not body copy.

## Bullet lists and tables

- Ordinary lists use **native chevron › (U+203A)** paragraphs, with **22.5 pt left margin and 22.5 pt hanging indent** (OOXML marL=285750, indent=-285750). Wrapped lines align with the text, not the chevron. Do not type the bullet into the text.
- Second level uses the same chevron, an additional indent and 20 pt supporting text. Nest only where it explains a parent category. For example, use 45 pt left margin and 22.5 pt hanging indent at level two.
- Keep a **bold navy label** and its **regular black explanation** in one native paragraph with run-level formatting.
- Avoid tables in projected main and backup slides. Prefer concise lists, diagrams or an appropriate composition. Tables remain useful in the outline/source map. If the user specifically requires an evidence table, preserve it and its readability instead of deleting information to satisfy this default.
- Contributions have a separate native **• main / ○ supporting** bullet exception.

## Reference-style cards

- An optional layout for concepts, process steps, inputs and outputs; choose counts and arrangement from the content.
- Two equal-width editable native shapes: a softly rounded **#F2F2F2 body** and a **#21376A top-corner-rounded header**, without visible outlines. Start the body halfway down the header and draw the header above it. The supplied `native-shapes.json` preserves the original corner geometry without old text or branding.
- Header: 22 pt bold white Corbel, centred. Body: 20 pt regular black Corbel, left aligned; navy bold emphasis. Capitalise every word in header headings.
- Use **16 px horizontal body padding** on the reference canvas and a clear gap below the header. Increase heights or shorten copy to retain font sizes. Cards in a group have equal widths and aligned edges. Use rows, columns or grouped rows as the relationship requires.
- Arrows belong only to sequences/directions. Related cards do not need arrows. Keep the title/footer clear and record exact group dimensions locally.

## Key statistics, numbers and information

- **Bold navy Corbel value → thin gold #CDA60C horizontal rule → navy Corbel label**. Centre all three within one aligned block; use equal rule widths and consistent gaps within a group.
- Values: **42–52 pt isolated**, **32–36 pt compact row**, normally **32 pt** on results pages. Labels stay **20–24 pt**; wrap long labels into two lines.
- Labels are brief and contextual. Retain units and reference/comparison definitions where needed, avoid repeating an established unit in every label. Put a shared explanation once above the relevant group.
- Several highlights on a figure slide form **one evenly spaced bottom row** with the enlarged figure above. With one or two, try placing the group beneath left-hand interpretations to give the right figure more space. Individual blocks remain centred.
- Omit a statistics row when it adds no useful evidence. Keep rules/labels clear of conference logos and footers.

## Diagrams and arrows

- Build new conceptual diagrams with native softly rounded boxes, genuine translucent fills, clear hierarchy and **attached native connectors**. Reuse original paper artwork intact when it is evidence; a diagram adaptation must preserve its meaning and be described as an adaptation in notes.
- Supporting palette (sRGB): **blue #2F7FCF**, **cyan #37BED1**, **mint #43D6AC**, normally **45% opacity / 55% transparency**. Text: navy headings, black supporting sentences.
- Main concept: **orange #E97132, 85% opacity**, solid orange **2 px outline**. Keep recurring concepts consistent.
- Lighter support: approved colour at **32% opacity**, optional matching outline **55% opacity**. Optional/secondary activities: orange at **25% opacity**, outline **55% opacity**. Identify optionality in words and connector semantics.
- Grouping surfaces: cyan **lightened by 92%**, then **92% opacity**, cyan outline **25% opacity**. This is different from unlightened cyan at 8% opacity; use the stored specification.
- Conditional Bloom category mapping, **only when those categories are actually present**: Analysing **#B1D983**, Evaluating **#FEE06E**, Creating **#F68E75**. Labels **90% opacity**, activity rows **18%**, corresponding stage headers **45%**. These encode categories, not measured gains.
- Extended extracted palette, for an actual additional distinction: sky blue #2BA0E2, lime #99E984, yellow #F9F473, orange #FF7946, violet #B23BCF, magenta #D22D8D, burnt orange #BD4E17. Blue/cyan/mint remain the default supporting colours.
- Diagram type: **22 pt bold navy headings**, **20 pt regular black descriptions**, **20 pt bold navy category labels**. Prominent central heading may be 24 pt. Dark header bands retain the white-text exception.
- Connectors: **black #000000 at 100% opacity**, continuous **2.5 px shaft (1.875 pt)**, closed filled triangular head at the destination with native **type=triangle, width=lg, length=lg**. A one-way connector has no origin head. These are stored reproduction settings, not native properties extracted from the raster reference.
- Arrowheads indicate direction/order; relationship-only links have none. Use solid/dashed lines consistently for explained semantics. Use straight or orthogonal routes; round elbows where supported and useful.
- Attach endpoints to shapes or invisible native routing junctions. Keep every segment continuous, use one destination head, and route through clear space rather than labels/box interiors. Allow enough gap for a visible shaft and full head. Align related labels with their associated nodes; record local colour assignments/dimensions in the slide's outline design record.

## Figures and charts

- Use supplied source artwork, preserving aspect ratio, axes, units, legends and embedded lettering. Prefer original vector artwork where the authoring/export path supports it; otherwise render at enough resolution for its final size (normally 2–3× the projected pixel dimensions).
- Use white behind plots when needed for contrast. Enlarge the complete figure; do not crop meaningful axes or labels for composition.
- Rebuild a chart as editable data only from supplied underlying data. Do not infer exact points from an image. Decorative images must not replace paper evidence.

## General layout and delivery

- Preserve current conference background/artwork/branding. Prefer generous margins of about **0.5–0.6 inches**, adapted to the actual template; use **72 px** as the default title/content anchor on the reference canvas. Reserve every observed logo/footer region, especially the lower right. A recorded local margin change may make connectors or figures clearer.
- Give each slide one principal composition: a diagram, compact comparison, large figure with supporting numbers, or short list. Cards are a tool, not a mandatory grid on every page.
- Aim for roughly **35–55 visible explanatory words** on most slides, excluding figure lettering. This is a density guide, not a requirement to fill sparse slides. Explain supporting reasoning orally.
- Define unfamiliar terms and abbreviations at first use for the actual audience. Adapt the level of explanation to the audience and the paper's subject.
- Results interpretations retain units, comparison conditions and uncertainty. Separate correlation from agreement/causation; distinguish design aims from measured outcomes and reported estimates from instrumented timings. Preserve a paper's reference/baseline limitations.
- Draft speaking notes **only after the user approves the finished slide deck**. During outlining and slide design, record estimated time allocations and source citations without writing delivery scripts, transitions or extended Q&A prose. After approval, use notes order: timed plain-language **Delivery Script**, **Transition**, **Preparation and Q&A only**, **Sources**. Keep preparation detail separate from the main script.
- Agree a main speaking route and list hidden backups explicitly. Use separate presentation, Q&A and buffer budgets; rehearse rather than reporting estimates as measurements. Determine the talk length and slide count for each new presentation.
- Use simple appear/fade builds only when they guide explanation. Results figures stay static. Include a demo only when the new slot and user requirements justify it.

## Results and analysis pages

- Default repeated title **“Results and Discussions”**, **Calibri Bold 36 pt navy**, left aligned. Treat this as a personal section-label preference; replace only when the user/conference requests a different label.
- Separate subtitle: **Corbel Bold 24 pt navy**, Title Case, introduced by a small navy vertical bar **0.23 cm wide × 1.3 cm high**. Reference coordinates: main title **x=72, y≈36 px**, bar **x=72**, subtitle **x≈94, y≈104 px**. Keep a clear gap below the subtitle.
- Prefer the matching paper subsection name, qualified when pages share a subsection or a generic heading would obscure the subject.
- Left: concise native-chevron interpretations with navy bold labels/black explanations. Retain uncertainty language for suggested mechanisms. Vertically balance the block between subtitle and highlights.
- Right: corresponding original figure as large as possible without distortion or lost labels. Bottom: optional single highlight row using the statistic treatment above. One or two highlights may sit beneath the left text instead.
- With no useful numeric highlights, omit the row. A text-only discussion may use a full-width native list; do not invent a figure/statistic.
- Avoid redundant result footers restating context already established. Keep a caveat visible when needed to interpret the present slide independently; put repeated technical detail in notes.

## Contributions summary

- Matching stacked sections, each with an editable **navy check icon**, a **vertical navy divider**, and aligned heading/support to its right. Use as many sections as meaningful; the original three contributions are not a permanent template requirement.
- Title: Calibri Bold navy. Heading: **24 pt bold navy Corbel** with native **•**. Supporting points: **22 pt regular black Corbel** with native **○**, aligned wrapped lines.
- Retain the actual limitations and oversight implications supported by the paper.

## Closing page

- Retain current template background. Stack **THANK YOU** and **Q & A** centrally in **72 pt regular Corbel, #003399**.
- Verified email immediately below in **28 pt regular Calibri, black**. Use the paper/user's actual contact, never the previous presenter's address by default.
- Keep a supplied acknowledgment at the bottom within the template's safe area. Do not invent funding or acknowledgments. This page is the explicit exception to ordinary title/body styling.
