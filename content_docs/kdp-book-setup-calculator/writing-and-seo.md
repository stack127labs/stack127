# Writing and SEO plan: KDP book setup calculator

Follow `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording.

Status: ready
Feasibility: feasible
Content review: 2026-09-19
Acceptance path: Main-agent review, then the retained Astra writing session; Luna integrates only accepted words.
Tool: KDP book setup calculator
Route: `/kdp-book-setup-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-09-16
Primary medium: Tool UI
Content depth: Give the author one setup receipt, enough explanation to choose inputs and read the warnings, and a clear final check path. Stop before cover design, PDF inspection, page-count estimation, royalties, non-US rules, and any claim of KDP acceptance.

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `KDP book setup calculator` with close cover-size, spine-width, bleed, and margins variants | Turn a binding, trim, interior, paper, bleed, and page count into the page and cover dimensions needed for a print handoff | A direct calculator with one full-cover answer, interior page size, margins, spine, page-range status, unit conversions, and a copyable receipt | Put the workbench first. Lead with the paperback cover file or the estimated hardcover cover file, then show the page, margin, eligibility, spine, diagram, table, caveats, and receipt action |

Current search check: the web search connector returned the official KDP calculator and template flow alongside specialist spine and cover calculators. The visible result shapes center on cover width and height, spine width, bleed, trim, paper, and page count. Search backend: web connector. Search engines: not individually available. Browser backend: blocked because no in-app Browser instance was available. Viewport: not available for the search connector. Queries checked: `KDP book setup calculator`, `KDP cover size calculator`, `KDP spine width calculator`, and `KDP book margins calculator`. The result-shape check was completed on 2026-09-16.

### Intent not targeted

- `KDP royalty calculator`, print cost, or book pricing: link to the related royalty tool instead of adding economics to this setup receipt.
- Page-count estimation from words, images, or layout: the tool needs an entered page count and does not estimate one.
- Cover design, barcode placement, safe-area overlays, PDF inspection, or generated templates: use KDP's template workflow or a later dedicated tool.
- Non-KDP printers, custom trims, marketplace-specific tables, or a general publishing calculator: the source boundary is KDP US print specifications checked on 2026-09-16.

## Page promise

Enter the KDP print choices you already know and get one local setup receipt for the interior page, minimum margins, spine, and full cover file. Paperback dimensions use the reviewed KDP inputs. Hardcover dimensions are estimates that need confirmation with KDP's calculator or final template. A page-range status compares the effective count with the checked KDP US table. It is not a KDP acceptance decision.

Reading flow: The author starts with the form and the full cover answer. The result then explains the interior page and margin constraints, separates eligibility from geometry, shows how the cover segments fit together, and gives the all-unit receipt. Supporting sentences explain the odd-page rule, bleed, coefficients, hardcover uncertainty, local handling, and the final KDP check without repeating the result table.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Intro before the workbench and H1 | Sentences, then Tool UI | `brief.md`; `implementation-report.md` product decision | State the author task once. Do not repeat the full feature list below the result. |
| Which inputs, modes, units, sources, or scope choices matter? | Form labels, filtered choices, and the supporting method section | Tool UI and Sentences in `COPY-02` | `interface-contract.md` input contract; `implementation-report.md` inputs and source boundary | Explain why a choice changes the answer only when the interface does not already make it clear. |
| How should someone choose meaningful inputs and use it for the real task? | Workbench reading order and `COPY-02` | Tool UI and Sentences | `brief.md`; `interface-contract.md` user task and input contract | Do not narrate ordinary button clicks or add software-specific margin advice. |
| How should the result and its important terms or uncertainty be interpreted? | Lead, page and margin region, eligibility region, spine row, and caveats | Tool UI and Exact result visualization | `interface-contract.md` result contract; `implementation-report.md` result semantics | Keep exact values in the result. The guide explains the difference between dimensions, estimates, and eligibility. |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Method section and cover diagram fallback | Sentences in `COPY-02` and Diagram | `implementation-report.md` equations; `edge-cases-and-tests.md` FF-001 through FF-010 | Explain odd-page normalization, interior versus cover bleed, and direction ordering once. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Limitations beside the affected result and final verification section | Tool UI and Sentences in `COPY-03` and `COPY-04` | `implementation-report.md` non-goals and assumptions; `interface-contract.md` caveats | Say that local geometry and table checks do not mean KDP accepted a file. Do not add a generic disclaimer block. |
| How are user inputs handled? | Final verification section | Sentences in `COPY-04` | `implementation-report.md` non-goals; `edge-cases-and-tests.md` EC-022 and EC-030 | State only the implemented launch boundary: synchronous local calculation with no automatic input persistence or input submission. |
| What should the reader verify or do next? | Hardcover caveat and final verification section | Sentences in `COPY-03` and `COPY-04`; external link | `implementation-report.md` primary sources and KDP cover calculator | Send the reader to KDP's calculator or template for final cover confirmation. Do not call the local result upload-ready. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: KDP book setup calculator for cover size and margins | What can I prepare from the print choices I already have? | Orient the author to one local setup receipt and cue the workbench. | Sentences | `brief.md`; `interface-contract.md` user task | Use `COPY-01` for the short introduction. Do not add a decorative intro panel or repeat the feature list below the result. | COPY-01 |
| 2 | H2: What cover file size belongs to this book? | What complete width and height should go into cover software? | The single lead gives the paperback file size as an exact calculated result or the hardcover file size as an estimate. | Tool UI | `interface-contract.md` result contract; `implementation-report.md` rounding and lead rules | The tool remains the page's first and dominant answer. Do not split width and height into equal-weight cards or repeat the selected-unit value in prose. | n/a |
| 3 | H2: Which interior page size and margins go with it? | What page dimensions and minimum margins should the interior use? | The result ties interior bleed and effective page count to page size and inside, outside, top, and bottom minimums. | Tool UI | `implementation-report.md` equations 2 to 4; `interface-contract.md` page and margin region | Keep entered and effective page counts together. Do not give layout-software presets or text-area advice. | n/a |
| 4 | H2: Does this setup fit the current KDP page range? | Is the selected tuple in the reviewed table? | The status distinguishes supported configuration, calculable geometry with a range warning, and no-result unsupported input. | Table | `implementation-report.md` page-limit records; `edge-cases-and-tests.md` EC-008 and FF-006 | A local range match is not KDP acceptance. Do not use a progress bar or a generic pass badge. | n/a |
| 5 | H2: How do the cover panels add up? | Where do bleed, back, spine, and front sit in the full width? | The exact diagram shows paperback segments in reading order and the hardcover wrap, hinge, and spine estimate without pretending to be a template. | Diagram | `interface-contract.md` visual semantics and result contract | The diagram owns the relationship. Supporting prose must not restate every segment value. | n/a |
| 6 | H2: How does the calculator turn these choices into dimensions? | Why do page count, bleed, paper, and DPI change the receipt? | Explain even-page normalization, margin bands, interior bleed, paper coefficients, cover bleed, and one-way unit conversion. | Sentences | `implementation-report.md` equations and conversion rules; `edge-cases-and-tests.md` FF-001 through FF-008 | Use one connected explanation in `COPY-02`. Do not narrate controls or reproduce the dimensions table. | COPY-02 |
| 7 | H2: Why is the hardcover cover size an estimate? | Which part still needs an official KDP check? | KDP documents wrap and hinge measurements but not one closed total-width formula in this scope, so the local result is a planning estimate. | Sentences | `implementation-report.md` hardcover resolution and assumptions; KDP hardcover requirements | Use `COPY-03` for the boundary and final KDP calculator or template link. Do not call the estimate exact or upload-ready. | COPY-03 |
| 8 | H2: What should I verify before uploading? | What does this check cover, and what remains outside it? | The tool checks local dimensions, source-table compatibility, and warnings. The author still needs KDP's current calculator or template and a real file review. | Sentences | `implementation-report.md` non-goals and primary sources; `edge-cases-and-tests.md` EC-029 through EC-031 | Use `COPY-04` for scope, privacy, source date, and the difference between local checks and KDP acceptance. Do not add a second FAQ section. | COPY-04 |
| Usage | H2: Use the tool for your task | Which inputs should I bring, and what should I do with the outcome? | Use the closed Usage Markdown handoff below. | Sentences | Accepted technical artifacts and route behavior | Explain meaningful choices and next action; no button narration or duplicate live results. | COPY-05 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Effective page count and margins | An odd entered count becomes the next even count before margin bands, spine, cover, and eligibility are resolved. Inside minimums are 0.375, 0.5, 0.625, 0.75, and 0.875 inches across the five page bands. Outside, top, and bottom minimums are 0.25 inches without interior bleed and 0.375 inches with it. | Sentences in `COPY-02`, with entered and effective counts in Tool UI | `effectivePages = pageCount + (pageCount % 2)`; `implementation-report.md` equations 2 and 3; KDP paperback submission guidelines | Put the odd-page rule beside the page-count interpretation. Say that a below-range count can still produce geometry with a warning. |
| Interior page and cover bleed | Interior bleed adds 0.125 inches to page width and 0.25 inches to page height. Paperback cover bleed remains 0.125 inches on every outer side, whether interior bleed is on or off. | Sentences in `COPY-02` and the exact diagram | `pageWidth = trimWidth + 0.125` and `pageHeight = trimHeight + 0.25` when bleed is on; `implementation-report.md` equation 4 and `edge-cases-and-tests.md` FF-005 | State the distinction next to the bleed explanation. Do not imply that the interior checkbox controls the cover file. |
| Spine and paperback cover | The selected coefficient multiplies effective pages. The paperback cover width is `2 × trim width + spine width + 0.25 in`, and height is `trim height + 0.25 in`. | Sentences in `COPY-02`, lead result, and Diagram | White black-and-white and standard color use 0.002252 inches per page, cream uses 0.0025 and groundwood uses 0.00235, and premium color uses 0.002347; KDP paperback cover requirements | Use the cover-specific source for spine coefficients. Keep display rounding out of the formula. |
| Hardcover estimate | The local estimate reuses the selected paper coefficient for spine thickness, then adds two 0.51-inch wrap regions and two 0.4-inch hinge spaces. It is not an official closed KDP total-width formula. | Sentences in `COPY-03`, estimate label, and Diagram | `estimatedWidth = 2 × trim width + spineEstimate + (2 × 0.51) + (2 × 0.4)`; `estimatedHeight = trim height + (2 × 0.51)`; KDP hardcover cover requirements | Keep `Estimated hardcover cover file` with the value and direct the author to KDP's calculator or template for final confirmation. |
| Unit conversion and source boundary | Millimeters come from inches × 25.4. Pixels are rounded from the inch source at the selected DPI. The checked source set is KDP US print specifications from 2026-09-16. | Tool UI table, pixel heading, and Sentences in `COPY-04` | `mm = inches × 25.4`; `pixels = roundHalfUp(inches × dpi)`; `implementation-report.md` rounding and versioning | Say that pixel targets do not make a PDF correct and that current KDP rules can change. The formula version and checked date are evidence, not a future guarantee. |

## Metadata proposal

- Registry label: `kdp book setup calculator`
- Meta title: `KDP book setup calculator for cover size, spine, and margins`
- Meta description: `Calculate KDP paperback or hardcover page, margin, spine, and full cover dimensions in inches, millimeters, and pixels. Paperback results use published inputs; hardcover results are estimates to confirm with KDP.`
- Page type: `WebPage`
- Publication recommendation: Keep `/kdp-book-setup-calculator` unpublished until separately approved in the central publication registry. This writing plan does not publish the route, add route-local metadata, or change its publication state.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Outbound | `/kdp-royalty-calculator` | Continue from physical setup to print or eBook royalty and price questions without expanding this page into economics. Link only when the destination is published. | `KDP royalty calculator` | Final verification section, after the setup boundary is clear |
| Inbound | `/kdp-book-setup-calculator` from `/kdp-royalty-calculator` | An author pricing a print book may need the page, trim, paper, and binding dimensions before treating the royalty result as a production plan. Add when the related tool's content is written and published. | `KDP book setup calculator` | Related next step in the royalty tool's supporting content |
| Outbound | `https://kdp.amazon.com/cover-calculator` | Confirm the final cover geometry with KDP's own calculator, especially for hardcover, instead of treating the local estimate as acceptance. | `KDP cover calculator` | Hardcover caveat and final verification section |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | What this setup calculator answers | Orient an author who already knows the binding, trim, and approximate page count. | One combined local receipt covers interior page size, minimum margins, spine, cover size, conversions, and source-table warnings. Use `brief.md`, `implementation-report.md` product decision, and `interface-contract.md` user task. | One short connected introduction that cues the workbench and says the lead is the full cover file. Stop before listing every control. | Do not say the result is upload-ready, guaranteed, official for every marketplace, or a replacement for KDP's final check. Do not repeat the result values. |
| COPY-02 | How page count, bleed, and paper change the receipt | Explain the decisions that are easy to carry incorrectly between separate calculators. | Even-page normalization, five inside-margin bands, bleed-dependent interior dimensions, separate cover bleed, paper coefficients, published groundwood coefficient, and inch-first conversion. Use `implementation-report.md` equations, KDP paperback submission guidelines, KDP paperback cover requirements, and `edge-cases-and-tests.md` FF-001 through FF-008. | One connected explanation with equations only where they answer a likely question. Stop after the reader can explain why page count and paper change spine and why interior bleed does not change cover bleed. | Do not write a button tutorial, duplicate the all-unit table, give layout-software presets, or turn the source table into a long list. |
| COPY-03 | Why the hardcover result needs a final KDP check | Keep the estimate boundary beside the value so the reader cannot mistake a planning number for a template. | KDP documents 0.51-inch wrap and 0.4-inch hinge inputs but does not provide one closed total-width formula in the reviewed scope. The local spine and cover values are estimates. Use `implementation-report.md` hardcover resolution and assumptions plus KDP hardcover cover requirements and the KDP cover calculator. | Explain the missing closed formula, name the estimate inputs, and give one next action to confirm the file. Stop before cover-design advice. | Do not call the result exact, official, guaranteed, accepted, or ready for upload. Do not repeat the estimate equation if the formula table or diagram already carries it. |
| COPY-04 | What the local check does not prove | Separate useful local checks from KDP's acceptance process and close the reader's workflow. | The tool compares the effective count and selected tuple with the checked KDP US table, calculates dimensions synchronously in the browser, and does not inspect PDFs or send or persist setup values under the launch contract. Source date and formula version are visible. Use `implementation-report.md` assumptions and non-goals, `edge-cases-and-tests.md` EC-022 and EC-029 through EC-031, and KDP's current cover calculator and submission guidelines. | One short limitations section with the source boundary, privacy behavior, what to verify next, and the external KDP link. Stop after final confirmation. | Do not claim privacy beyond the stated no-send and no-storage behavior, freshness beyond the checked date, KDP acceptance, PDF correctness, or support for non-US rules. Do not repeat the hardcover caveat or page-range values. |
| COPY-05 | Task-oriented usage | Explain input preparation, meaningful choices, states, and next verification. | Closed Usage Markdown handoff and accepted technical artifacts. | One concise connected guide; use steps only where order changes the outcome. | No live-result narration, unimplemented features, or duplicate supporting explanations. |

### Page constraints

- Keep technical terms such as trim size, effective page count, spine coefficient, bleed, wrap, hinge, and DPI when they affect the reader's decision.
- Keep the distinction explicit between a local calculation or source-table check and KDP's acceptance of an uploaded file.
- Do not repeat a lead value in prose when the result, diagram, or table already shows it.
- Leave any changed KDP source rule as a review note and update the upstream reports and fingerprints before revising this plan.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate `COPY-01` through `COPY-04`. The later manual content pass supplies those sections. This document does not change the route, code, tests, manifests, scripts, database content, or publication state.

## Source ledger

- Amazon KDP paperback submission guidelines: https://kdp.amazon.com/en_US/help/topic/G201857950, checked 2026-09-16. Supports paperback trim and page-limit tables, even-page handling, margin bands, bleed page dimensions, and the KDP US print scope.
- Amazon KDP paperback cover requirements: https://kdp.amazon.com/en_US/help/topic/G201953020, checked 2026-09-16. Supports paperback spine coefficients, outer bleed, cover dimensions, and cover-file constraints.
- Amazon KDP hardcover trim and page specifications: https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6, checked 2026-09-16. Supports the hardcover trim set, 75 to 550 effective-page range, and supported interior and paper combinations.
- Amazon KDP hardcover cover requirements: https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6, checked 2026-09-16. Supports the wrap and hinge inputs, safe-area boundary, and need for final template confirmation.
- Amazon KDP cover calculator: https://kdp.amazon.com/cover-calculator, checked 2026-09-16. Provides the final external confirmation path for a cover template, especially for the hardcover estimate boundary.
- KDPage spine and cover calculator: https://www.kdpage.com/tools/spine-calculator, observed in the 2026-09-16 web search result shape. Supports the competitive observation that specialist results lead with spine width, full cover size, bleed, trim, paper, and page count. It is not a technical authority for this plan.
- Paperback Cover spine calculator: https://paperbackcover.com/spine-width-calculator/, observed in the 2026-09-16 web search result shape. Supports the competitive observation that unit conversions and a short formula explanation are common adjacent expectations. It is not a technical authority for this plan.
- Book Covers Lab cover-size calculator: https://bookcoverslab.com/kdp-cover-size-calculator, observed in the 2026-09-16 web search result shape. Supports the competitive observation that paperback and hardcover are often presented together and that cover size is the lead job. It is not a technical authority for this plan.

## Open questions and blockers

- The shared coefficient correction is accepted and reconciled. No content blocker remains. The route remains unpublished.

## Usage Markdown handoff

Disposition: Closed and feasible. The accepted shared coefficient correction is reconciled below.

### Assignment and reading order

COPY-05 owns `usage_markdown`: explain the real task, inputs worth preparing, meaningful mode choices, important state distinctions, and the next verification. The existing manual assignments own the introduction, supporting explanations, metadata, and identified interface review only. Where an older assignment discusses how to choose an input, move that instruction into this usage assignment and retain only its conceptual explanation below. Do not repeat it in both fields. Interface inventories are review-only; this plan does not authorize implementation or rewriting dynamic findings.

### Technical facts and meaningful inputs

Choose binding, supported trim, interior/paper combination, page count, bleed, reading direction, output units, and DPI. Odd counts normalize to the next even count. Unsupported tuples block calculation; eligible-tuple page-range warnings may still accompany geometry. Interior bleed adds 0.125 inch width and 0.25 inch height; paperback cover bleed is separate. Inch-source calculations feed millimeters and pixel targets. Hardcover cover geometry remains an estimate requiring the official template.

### State interpretation and recovery

Distinguish invalid input, unsupported tuple, completed geometry with page-range warnings, and estimated hardcover geometry. Do not label an estimate upload-ready or treat pixel targets as PDF validation.

### Limitations and next action

No PDF inspection, design-software presets, print acceptance, or final official cover template. Use the corrected cover coefficients recorded below.

### Input handling boundary

Setup values are calculated locally; no file is read. Limit privacy wording to the verified tool input flow, not sitewide cookies, analytics, or logging. The implementation and accepted technical evidence support only these route-specific statements. Do not infer a general retention, logging, analytics, cookie, or anonymity policy.

### Content, media, and list requirements

Keep the interactive tool first. Preserve all outline tables and exact result media; their repeated fields belong in tables, not comparison paragraphs. Existing output values, counts, findings, formulas, and captions stay in the live result rather than a second narrative. No new screenshot, marker drawing, generated illustration, or chart is required. If an ordered list is used, it must represent dependent task steps; use an unordered list only for genuinely independent checks. Do not add a generic FAQ or a list-shaped summary of every control. Every retained table must ship with useful headers and its limitation, not merely a heading placeholder.

### Source ledger and links

Use the existing source ledger for attributable claims, with links at the point of explanation. The ready implementation, interface, edge-case, and brief artifacts govern what this tool actually does; official sources govern external rules. Local assumptions must be labeled rather than attributed to a standards body or platform. Preserve the ledger's checked dates; a content review is not a claim that every source was freshly reverified. Conditional internal destinations: /kdp-page-count-estimator; /kdp-pdf-preflight-checker. Include them only when the exact route is published at integration; all new batch tools remain unpublished. If a destination is unavailable, omit the link rather than invent a URL or publish its target.

### Feasibility and ownership

The accepted implementation supports this plan without new implementation work. Astra supplies words only after acceptance. Luna performs content integration later. Neither this plan nor its validator result changes database content, registry publication, tool version, or deployment.

### Resolved source conflict: shared spine coefficients

The accepted technical correction uses 0.002252 inches per page for black-and-white white and standard color, 0.002347 for premium color, 0.00235 for groundwood, and 0.0025 for cream. The cover-specific KDP requirements at https://kdp.amazon.com/en_US/help/topic/G201953020 control cover geometry. The broader submission page's generic color row does not override its distinction between standard and premium color. Earlier research describing groundwood as a cream-paper approximation is superseded for this claim by the corrected implementation contract and shared specification. Preserve that research as historical evidence, not public formula guidance. Hardcover geometry remains an estimate; this correction does not remove its existing boundary. All five upstream fingerprints were refreshed after the correction.
