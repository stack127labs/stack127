# Writing and SEO plan: KDP PDF preflight checker

Follow `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording.

Status: ready
Feasibility: feasible
Content review: 2026-09-19
Acceptance path: Main-agent review, then the retained Astra writing session; Luna integrates only accepted words.
Tool: KDP PDF preflight checker
Route: `/kdp-pdf-preflight-checker`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-09-16
Search backend: web connector
Search engines: not individually available
Browser backend in competitive research: standalone Playwright CLI, 1280x900 desktop and 390x844 mobile
Primary medium: Tool UI
Content depth: The tool answers the immediate file question first. Supporting content explains the measured fields, local calculation rules, unknown states, privacy boundary, and the next KDP verification step. It stops short of visual PDF review, repair guidance, and acceptance claims.

## Search intent

The exact query and nearby results point to a finished-file diagnosis task, not a general KDP tutorial. The current result shape is a browser-local checker with a file picker, book configuration, page-level findings, measurements, and source-backed limits. Official KDP guidance remains the technical authority. Competitor claims are useful for intent and pain evidence only.

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `KDP PDF preflight checker` | Check a finished interior or paperback cover PDF before uploading again. | A local file check with a possible-issue lead, page-level evidence, and configuration summary. | The workbench accepts a PDF, applies the selected KDP setup, and shows measured facts, possible issues, and unknown checks. |
| Supporting | `check KDP PDF dimensions bleed fonts` | Find which measurable PDF property may explain a KDP warning. | Actual versus expected page geometry, mixed-size outliers, page boxes, font states, image DPI, page count, and file findings. | The issue list names the page or property. Tables own the exact comparison and diagnostic states. |
| Supporting | `KDP PDF mixed page sizes` | Find the page that differs from the rest of the manuscript. | Every readable page compared in source order, with outliers named by page number. | The geometry table shows actual, expected or dominant size, difference, and status for each page. |
| Supporting | `KDP cover PDF spine mismatch` | Check whether a one-page paperback cover matches trim, paper, ink, and final book page count. | A cover-size and spine calculation tied to the selected setup, plus the actual cover measurement. | Paperback cover scope shows the selected coefficient, formula relationship, exact result rows, and any possible mismatch. |

### Intent not targeted

- `KDP accepted PDF` or `will KDP accept my PDF`: the local report cannot reproduce Print Previewer or manual review and must not promise acceptance.
- `fix or repair KDP PDF`: v1 reports findings and does not rewrite, rasterize, or export a PDF.
- `hardcover cover spine calculator`: the reviewed KDP guidance does not provide a closed hardcover cover formula for this tool.
- `KDP safe margin or gutter checker`: the parser cannot prove live ink bounds, safe areas, or gutter placement from page geometry alone.
- `KDP PDF preview or mockup`: v1 does not render pages, thumbnails, or 3D covers.

## Page promise

Compare a local KDP interior or paperback cover PDF with the selected book setup, then see the measurable differences, unknown checks, and source rules behind the report. These local checks and calculations do not decide whether KDP accepts the file.

Reading flow: The user selects the scope and KDP assumptions, chooses a local PDF, and runs one explicit check. The result leads with either `No measurable issues found` or a count of possible issues. The issue list points to the next place to look, geometry and diagnostic tables supply the evidence, and the provenance line explains the ruleset date and the checks that remain with KDP. Supporting content then explains the result vocabulary and the next verification step without repeating table values.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Tool lead and `COPY-01` | Tool UI, Sentences | `brief.md`; `implementation-report.md` Product decision | Name the finished-file warning investigation once. Do not restate the whole feature list in the introduction. |
| Which inputs, modes, units, sources, or scope choices matter? | Workbench setup and `COPY-03` | Tool UI, Sentences | `interface-contract.md` Input contract; `implementation-report.md` Inputs and normalization | Let controls own selected values. Explain only why trim, bleed, paper, interior, binding, and cover book count change the check. |
| How should someone choose meaningful inputs and use it for the real task? | Workbench labels and `COPY-01` | Tool UI, Sentences | `interface-contract.md` Input contract and User task | Explain the selected KDP configuration and final book page count for a cover. Do not narrate ordinary button clicks. |
| How should the result and its important terms or uncertainty be interpreted? | Result lead, issue list, tables, and `COPY-02` | Tool UI, Table, Sentences | `interface-contract.md` Result contract and State contract; `edge-cases-and-tests.md` EC-026 | Keep exact values in tables. Explain `possible issue`, `measured`, `unknown`, `not measured`, and `not declared` once. |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Geometry table, diagnostic table, cover formula, and `COPY-03` | Table, Exact result visualization, Sentences | `implementation-report.md` Equations or resolution order; `edge-cases-and-tests.md` RF-001 to RF-014 | Cover interior bleed, cover geometry, page count, and PDF box semantics must stay separate. Do not turn every edge case into a paragraph. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Provenance line and `COPY-04` | Sentences | `implementation-report.md` Deferred and Non-goals; `interface-contract.md` Result contract | State the review boundary beside the interpretation. Do not repeat it after every finding. |
| How are user inputs handled? | File control, status text, and `COPY-01` | Tool UI, Sentences | `implementation-report.md` Non-goals and Technical plan; `edge-cases-and-tests.md` EC-007, EC-035 | Say that the PDF is checked in the current browser and is not uploaded or restored from a URL. Do not claim security beyond the documented local boundary. |
| What should the reader verify or do next? | `COPY-05` after provenance | Sentences | KDP Fix Formatting Issues; `implementation-report.md` Assumptions and exclusions | Send the reader to KDP Print Previewer and current KDP guidance. Do not add an unrelated stack127 link. |

## Heading and media outline

The interactive workbench remains the first and primary answer. The static sections below are supporting Markdown. No marker art, clean chart, screenshot, PDF preview, or 3D mockup is planned for v1.

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: KDP PDF preflight checker | What can I check before I upload this PDF again? | The tool checks a local interior or paperback cover PDF against one stated KDP setup and returns measurable findings without an acceptance verdict. | Tool UI | `brief.md`; `interface-contract.md` User task | The result lead, not a static paragraph, owns the immediate answer. | n/a |
| 2 | H2: What this checker measures | What does the report cover? | It reads page count, page geometry, mixed sizes, page boxes, font embedding states, measurable image DPI, content uncertainty, encryption, EOF, and file size when the PDF exposes them. | Sentences | `implementation-report.md` Scope and Assumptions and exclusions | Keep this as a scope map. Do not promise safe margins, gutter, licensing, visual ink, color, barcode, or manual review. | COPY-01 |
| 3 | H2: How to read a possible issue | What does the lead and issue list mean? | `Possible issue` means a local comparison or source-backed rule needs review. Exact actual, expected, and difference values belong in the geometry or diagnostic tables. | Sentences | `interface-contract.md` Result contract; `edge-cases-and-tests.md` EC-026 | Do not add a score, pass meter, acceptance label, or repeated table values. | COPY-02 |
| 4 | H2: Which settings change the expected size? | Why do trim, bleed, paper, interior, and page count matter? | Interior geometry uses the selected trim and asymmetric bleed rule. Paperback cover geometry also depends on book page count and the selected spine coefficient. | Sentences | `implementation-report.md` Formula and data contract; KDP trim, bleed, and cover sources | Explain dependencies, not ordinary form actions. Exact calculations stay in the result table and cover relationship. | COPY-03 |
| 5 | H2: What a local PDF check cannot prove | What remains outside the report? | A readable file and clean local measurements do not reproduce KDP Print Previewer, manual review, font licensing, visual safe areas, or every hidden or rendered condition. | Sentences | `implementation-report.md` Deferred and Non-goals; KDP Fix Formatting Issues | Put the caveat beside the meaning of the result. Do not make it a large warning panel. | COPY-04 |
| 6 | H2: What should I verify in KDP next? | What do I do after this report? | Recheck the final PDF after changes, then use current KDP Previewer and submission guidance. A possible issue is a lead for investigation, not a publishing decision. | Sentences | KDP Fix Formatting Issues; KDP Paperback Submission Guidelines | Keep the next step short and task-focused. Do not imply that a clean report replaces KDP's process. | COPY-05 |
| 7 | Result region: Paperback cover calculation | How did the expected cover size come from the setup? | The labelled back, spine, front, and bleed relationship explains the dependency. Exact values stay in the result rows, and the relationship is marked `not to scale`. | Exact result visualization | `interface-contract.md` Visual semantics and Cover configuration and result; `edge-cases-and-tests.md` RF-004 to RF-005 | Show only for paperback cover scope. No proportional measurement, second verdict, or hardcover recipe. | n/a |
| 8 | Result region: Page geometry and diagnostics | Which page or property needs attention? | Tables compare repeated facts and keep `unknown`, `not measured`, `not declared`, and `possible issue` distinct. | Table | `interface-contract.md` Result contract; `implementation-report.md` R6 to R12 | The issue queue names targets. Tables own repeated exact values. | n/a |
| Usage | H2: Use the tool for your task | Which inputs should I bring, and what should I do with the outcome? | Use the closed Usage Markdown handoff below. | Sentences | Accepted technical artifacts and route behavior | Explain meaningful choices and next action; no button narration or duplicate live results. | COPY-06 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Interior expected page size | No bleed uses trim width and height. Bleed adds `0.125 in` to width and `0.25 in` to height. | Short sentence beside the geometry result; exact values in the table. | For 6 x 9 in with bleed, expected size is 6.125 x 9.25 in. KDP [Set Trim Size, Bleed, and Margins](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6). | State that this is the selected KDP rule and that actual PDF dimensions are compared with a stack127 product tolerance. |
| Point and unit conversion | Page-box extents use `x1 - x0` and `y1 - y0`, then points divide by 72 for inches. Millimeters and points are display values. | Keep the conversion in the implementation-backed result explanation, not as a public tutorial. | `implementation-report.md` Equations or resolution order; Adobe [PDF Reference 1.7](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf). | Explain that a negative origin can still produce a valid extent. A malformed or non-positive box is not given a guessed size. |
| Paperback cover spine | `spine = book page count x selected paper and ink coefficient`. The coefficient is part of the selected KDP setup. | The cover formula strip names the coefficient and exact result rows carry the values. | KDP [Create a Paperback Cover](https://kdp.amazon.com/en_US/help/topic/G201953020); supported coefficients are recorded in `implementation-report.md`. | The user supplies the final even book page count. The one-page cover PDF count is separate. |
| Paperback cover dimensions | `cover width = bleed + back width + spine + front width + bleed`; `cover height = bleed + trim height + bleed`. | Exact result visualization marked `not to scale`, with the geometry table as the numeric source. | KDP [Create a Paperback Cover](https://kdp.amazon.com/en_US/help/topic/G201953020). | This full-cover formula is not the interior formula. Do not infer a hardcover formula. |
| Effective image DPI | When pixels and placement are measurable, `dpiX = pixel width / placed width in inches`, `dpiY = pixel height / placed height in inches`, and effective DPI is the lower axis. | Diagnostic table with value and state. | KDP [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950); `implementation-report.md` image rule. | Below 300 DPI is a possible issue. Above 600 DPI is advisory. Missing transforms or pixels are unknown or not measured, not a pass. |
| PDF page boxes | MediaBox is required. CropBox defaults to MediaBox. TrimBox and BleedBox can be absent, inherited, or defaulted under PDF semantics. | Diagnostics table with declaration provenance. | Adobe [PDF Reference 1.7](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf). | `not declared` is not an automatic KDP failure. Do not imply that an optional box proves or disproves bleed. |
| Page count and parity | Interior page count comes from the PDF. Paperback cover spine uses the supplied final even book count. Out-of-range or odd interior counts are possible issues. | One count row and targeted issue entries. | KDP [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950); `edge-cases-and-tests.md` EC-018 and EC-021. | Never silently round the supplied cover count or confuse PDF page count with book page count. |
| Tolerance and result vocabulary | The implementation compares each axis with a `0.02 in` stack127 tolerance and preserves unrounded values before display rounding. | Explain once near the geometry table and provenance. | `implementation-report.md` resolution order; `edge-cases-and-tests.md` EC-011 and RF-014. | This tolerance is a stack127 product rule, not an official universal KDP tolerance. A clean local result is not KDP acceptance. |

## Metadata proposal

- Registry label: `kdp pdf preflight`
- Meta title: `KDP PDF preflight checker for dimensions and bleed`
- Meta description: `Check a KDP interior or paperback cover PDF locally against selected trim, bleed, and cover settings. See page-level measurements and possible issues. It cannot guarantee KDP acceptance.`
- Page type: `WebPage`
- Publication recommendation: Unpublished until separately approved. This content handoff does not authorize a registry row, public publication, indexing, or sitemap inclusion.
- Metadata ownership: These are proposals for the central publication registry. No route-local metadata, canonical, robots, sitemap, or JSON-LD work belongs in this handoff.

## Internal links

No internal stack127 link is proposed for v1. The supplied source inventory does not identify a published stack127 page that continues the KDP PDF diagnosis task. Do not add unrelated links to fill a quota. Official KDP guidance belongs in the source ledger and the report provenance, not in an invented internal route.

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Outbound, external source | KDP [Fix Paperback and Hardcover Formatting Issues](https://kdp.amazon.com/en_US/help/topic/G201834260) | Continue from a local possible issue to KDP's own Previewer and manual-review guidance. | `KDP formatting and review guidance` | `COPY-05` and the result provenance line |
| Outbound, external source | KDP [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950) | Verify current file limits, page counts, fonts, images, and bleed requirements. | `KDP paperback submission guidelines` | `COPY-04` or `COPY-05`, only where the claim is made |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | What this checker measures | Orient an author or formatter who has a finished PDF and a warning to investigate. | Local browser processing; interior and paperback cover scope; selected KDP configuration; page count, dimensions, mixed sizes, boxes, fonts, measurable image DPI, empty-looking pages, encryption, EOF, and file-size checks only when exposed. Sources: `brief.md`; `implementation-report.md` Scope and Technical plan. | One connected explanation that names the task and the measurable scope. Stop before listing every diagnostic row or describing button mechanics. | Do not say the file is ready, safe, accepted, guaranteed, comprehensive, or private beyond the documented no-upload current-browser boundary. |
| COPY-02 | How to read the report | Explain how the lead, issue queue, geometry table, and diagnostics work together. | `No measurable issues found`; possible-issue count; actual versus expected; measured, unknown, not measured, and not declared; exact values live in tables. Sources: `interface-contract.md` Result contract; `edge-cases-and-tests.md` EC-026. | Explain the decision path from lead to target to evidence. Stop after the reader knows what to inspect next. | Do not repeat the geometry table, create a score, or turn unknown into pass. Do not use `accepted`, `ready for KDP`, or `will pass`. |
| COPY-03 | Which settings change the expected size? | Explain why the selected setup matters and prevent interior and cover formulas from being mixed. | Interior no-bleed and asymmetric bleed rules; paperback spine depends on final even book page count, paper, and ink; cover PDF count is one. Sources: KDP trim and bleed guidance; KDP paperback cover guidance; `implementation-report.md` Formula and data contract. | Explain dependencies and one representative example only if it resolves a misunderstanding. Stop before reciting values already visible in the result. | Do not invent a hardcover cover formula, claim safe-margin or gutter analysis, or call the product's tolerance a KDP tolerance. |
| COPY-04 | What a local PDF check cannot prove | Keep the report useful without letting a clean parse imply KDP approval. | KDP automated Print Previewer and manual review remain separate; no commercial font license, visual ink bounds, safe areas, gutter placement, color management, barcode, rendering, or hidden-content guarantee. Sources: KDP Fix Formatting Issues; `implementation-report.md` Deferred and Non-goals; `edge-cases-and-tests.md` EC-024 and EC-025. | Put the limits beside the result meaning. Use a short connected explanation, not a warning wall. Stop once the review boundary is clear. | Do not say the tool replaces KDP Previewer, validates every formatting condition, or proves a license or visual result. |
| COPY-05 | What to verify in KDP next | Give the reader a practical handoff after a local check. | Recheck the final file after corrections; use current KDP Print Previewer and submission guidance; verify current rules because the report carries a 2026-09-16 ruleset date. Sources: KDP Fix Formatting Issues; KDP Paperback Submission Guidelines; result provenance contract. | One short next-step section. It should point to official guidance and stop, without becoming a general publishing tutorial. | Do not imply that a clean local report is approval, that the ruleset never changes, or that stack127 can make the submission decision. |
| COPY-06 | Task-oriented usage | Explain input preparation, meaningful choices, states, and next verification. | Closed Usage Markdown handoff and accepted technical artifacts. | One concise connected guide; use steps only where order changes the outcome. | No live-result narration, unimplemented features, or duplicate supporting explanations. |

### Page constraints

- Keep local checks and calculations separate from KDP acceptance, Print Previewer, and manual review.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass. This plan also does not authorize publication, metadata writes, route changes, or changes to the tool contract.

## Source ledger

- Amazon KDP, [Fix Paperback and Hardcover Formatting Issues](https://kdp.amazon.com/en_US/help/topic/G201834260), checked 2026-09-16. Supports the automated Print Previewer and manual-review boundary, trim and bleed guidance, font and image warnings, blank-page guidance, and the instruction that cover dimensions can prevent approval.
- Amazon KDP, [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950), checked 2026-09-16. Supports PDF file size, page counts, page dimensions, bleed, fonts, image resolution, blank-page limits, and supported paperback configurations.
- Amazon KDP, [Set Trim Size, Bleed, and Margins](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6), checked 2026-09-16. Supports the asymmetric interior bleed calculation and page geometry explanation.
- Amazon KDP, [Create a Paperback Cover](https://kdp.amazon.com/en_US/help/topic/G201953020), checked 2026-09-16. Supports the one-page cover structure, paperback cover equations, paper-specific spine coefficients, spine-text threshold, and safe-space guidance.
- Amazon KDP, [Create a Hardcover Cover](https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6), checked 2026-09-16. Supports the deliberate exclusion of a universal hardcover cover formula from v1.
- Adobe, [PDF Reference 1.7](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf), checked 2026-09-16. Supports MediaBox, CropBox, TrimBox, BleedBox, defaults, inheritance, and page-box terminology.
- `competitive-report.md`, checked 2026-09-16. Supports query families, user pain evidence, competitor result shapes, search backend limitations, and the decision to foreground page-level measurements and uncertainty. It is planning evidence, not a public technical authority.
- `implementation-report.md`, checked 2026-09-16. Supports the closed resolution contract, local processing boundary, source date, product tolerance, result vocabulary, exclusions, and unpublished state.
- `interface-contract.md`, checked 2026-09-16. Supports the result hierarchy, exact media choices, copy and download boundary, no-score language, and responsive reading order.
- `edge-cases-and-tests.md`, checked 2026-09-16. Supports unknown, partial, malformed, page-count, tolerance, local-processing, hostile-input, URL, accessibility, and publication-state constraints.
- `brief.md`, checked 2026-09-16. Supports the audience, user job, tool-first format, exact result-table role, cover relationship visualization, and absence of marker art, clean charts, and screenshots in v1.

## Open questions and blockers

- The shared coefficient correction is accepted and reconciled. No content blocker remains. The route remains unpublished.

## Usage Markdown handoff

Disposition: Closed and feasible. The accepted shared coefficient correction is reconciled below.

### Assignment and reading order

COPY-06 owns `usage_markdown`: explain the real task, inputs worth preparing, meaningful mode choices, important state distinctions, and the next verification. The existing manual assignments own the introduction, supporting explanations, metadata, and identified interface review only. Where an older assignment discusses how to choose an input, move that instruction into this usage assignment and retain only its conceptual explanation below. Do not repeat it in both fields. Interface inventories are review-only; this plan does not authorize implementation or rewriting dynamic findings.

### Technical facts and meaningful inputs

Select an interior PDF for paperback/hardcover or a paperback cover PDF; hardcover covers are outside scope. Files must be recognizable PDFs within the 650 MB limit. A cover needs one page and the final even book page count; unlike setup, do not silently round this supplied count. Interior checks use actual PDF page count. MediaBox dimensions are compared with expected geometry using a tool-specific 0.02-inch tolerance, not an official KDP allowance. Missing optional boxes are informational. Font embedding is not a license check. Measurable image placements below 300 DPI can warn; above 600 is advisory.

### State interpretation and recovery

Explain loading/parsing, rejected file, interrupted work, unreadable or unsupported content, and completed findings separately. Unknown extraction results are not passes. Reports contain findings, not a repaired PDF. Do not promise thumbnails or a visual rendering review.

### Limitations and next action

No ink-bound inspection, safe-margin or gutter proof, color-space acceptance, barcode verification, PDF repair, font licensing, or KDP acceptance. Paperback-cover expectations use the corrected coefficients below.

### Input handling boundary

The chosen PDF is read locally for inspection. It is not a server-side upload workflow; copying or downloading a report is explicit. Do not generalize that statement to every site request or claim file persistence without evidence. The implementation and accepted technical evidence support only these route-specific statements. Do not infer a general retention, logging, analytics, cookie, or anonymity policy.

### Content, media, and list requirements

Keep the interactive tool first. Preserve all outline tables and exact result media; their repeated fields belong in tables, not comparison paragraphs. Existing output values, counts, findings, formulas, and captions stay in the live result rather than a second narrative. No new screenshot, marker drawing, generated illustration, or chart is required. If an ordered list is used, it must represent dependent task steps; use an unordered list only for genuinely independent checks. Do not add a generic FAQ or a list-shaped summary of every control. Every retained table must ship with useful headers and its limitation, not merely a heading placeholder.

### Source ledger and links

Use the existing source ledger for attributable claims, with links at the point of explanation. The ready implementation, interface, edge-case, and brief artifacts govern what this tool actually does; official sources govern external rules. Local assumptions must be labeled rather than attributed to a standards body or platform. Preserve the ledger's checked dates; a content review is not a claim that every source was freshly reverified. Conditional internal destinations: /kdp-book-setup-calculator; /kdp-page-count-estimator. Include them only when the exact route is published at integration; all new batch tools remain unpublished. If a destination is unavailable, omit the link rather than invent a URL or publish its target.

### Feasibility and ownership

The accepted implementation supports this plan without new implementation work. Astra supplies words only after acceptance. Luna performs content integration later. Neither this plan nor its validator result changes database content, registry publication, tool version, or deployment.

### Resolved source conflict: shared spine coefficients

The accepted technical correction uses 0.002252 inches per page for black-and-white white and standard color, 0.002347 for premium color, 0.00235 for groundwood, and 0.0025 for cream. The cover-specific KDP requirements at https://kdp.amazon.com/en_US/help/topic/G201953020 control cover geometry. The broader submission page's generic color row does not override its distinction between standard and premium color. Earlier research describing groundwood as a cream-paper approximation is superseded for this claim by the corrected implementation contract and shared specification. Preserve that research as historical evidence, not public formula guidance. Hardcover geometry remains an estimate; this correction does not remove its existing boundary. All five upstream fingerprints were refreshed after the correction.
