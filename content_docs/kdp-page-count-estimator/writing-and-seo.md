# Writing and SEO plan: KDP page count estimator

Status: ready
Feasibility: feasible
Content review: 2026-09-19
Acceptance path: Main-agent review, then the retained Astra writing session; Luna integrates only accepted words.
Tool: KDP page count estimator
Route: `/kdp-page-count-estimator`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-09-16 (official KDP source review and competitive research)
Primary medium: Tool UI
Content depth: Explain the planning model, typography and margin effects, additions, even-page rounding, and why a typeset PDF determines the final count.

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `KDP page count estimator` and `book page count calculator` | Turn words and layout assumptions into a likely print-page range. | Range with text pages, words per page, and additions. | The estimator leads; the guide explains uncertainty. |
| Secondary | `how many words per page KDP` | Understand how trim, font, spacing, and margins move the range. | Words-per-page range and input controls. | Explain the model inputs without claiming a universal density. |
| Secondary | `KDP minimum page count` | Know why an estimate still needs a KDP setup check. | Even-page output and next verification link. | Link to book setup and official requirements. |

### Intent not targeted

- Exact final pagination from manuscript text or a Word file: this tool has no layout engine and does not upload a manuscript.
- Interior PDF inspection: use the preflight checker after export.

## Page promise

Enter words and layout assumptions to get a transparent, even-page range for KDP print planning, with the model's uncertainty visible instead of a false exact count.

Reading flow: inputs first; range and body-text result; additions table; model statement; next step to source-backed setup and final PDF checks.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool for? | Intro and workbench | Tool UI | `brief.md` | Keep the promise narrow. |
| Which inputs matter? | Form controls | Tool UI | Implementation report | Do not restate labels as a checklist. |
| How should inputs be chosen? | Layout guidance | Sentences | Product report | Explain meaningful assumptions only. |
| How is the range read? | Lead and additions table | Exact result visualization and Table | Interface contract | Table owns repeated additions. |
| Which edge cases surprise users? | Zero words, margins, chapter starts, even rounding | Table | Test contract | Keep model caveats near the result. |
| What does it not prove? | Model statement and limits | Sentences | Brief and product report | No exact pagination claim. |
| How are inputs handled? | Local calculation note | Sentences | Engine contract | State local processing once. |
| What next? | Setup and PDF tools | Sentences | Site tool plan | Link to the next production step. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: KDP page count estimator | What range can I plan for? | The tool estimates a range from words and layout assumptions. | Tool UI | Product report | The UI owns the result. | n/a |
| 2 | H2: Read the estimated range | What do body pages and additions mean? | Text pages and front, chapter, image, and back matter additions are shown separately. | Exact result visualization | Interface contract | Do not duplicate the table in prose. | n/a |
| 3 | H2: What changes words per page? | Why does the range move? | Trim, font, size, line spacing, and margins change the model density. | Table | Implementation report | Avoid universal words-per-page claims. | n/a |
| 4 | H2: Why the final PDF wins | When should this estimate be replaced? | Real layout, breaks, artwork, and KDP rules determine the final page count. | Sentences | Product report and KDP submission page | No exactness or acceptance promise. | COPY-01 |
| Usage | H2: Use the tool for your task | Which inputs should I bring, and what should I do with the outcome? | Use the closed Usage Markdown handoff below. | Sentences | Accepted technical artifacts and route behavior | Explain meaningful choices and next action; no button narration or duplicate live results. | COPY-02 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Usable text area | Trim dimensions minus inside, outside, top, and bottom margins determine the modeled text area. | One short equation. | Engine contract. | State that this is a model, not a typesetter. |
| Words per page range | Font width factor, font size, line spacing, and usable height create a low and high density range. | Result rows. | Implementation report. | Keep the range visible. |
| Non-body additions | Chapter starts, image pages, front matter, and back matter add pages after body text. | Additions table. | Interface contract. | Do not assume every chapter starts on a new page outside the model. |
| Even-page rounding | The result rounds each endpoint up to an even page count for print planning. | One result note. | KDP submission source and engine contract. | A final export can still differ. |

## Metadata proposal

- Registry label: `KDP page count estimator`
- Meta title: `KDP page count estimator from words and layout choices`
- Meta description: `Estimate a likely KDP print page range from words, trim, typography, margins, chapter starts, images, and front or back matter. Final pagination still comes from the typeset PDF.`
- Page type: `WebApplication`
- Publication recommendation: `Remain unpublished until the separate registry decision and final rendered QA are complete.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/kdp-book-setup-calculator` | The estimated count needs a trim, paper, bleed, and page-limit setup. | `KDP book setup calculator` | After the even-page explanation. |
| Out | `/kdp-pdf-preflight-checker` | A finished export can be checked for actual page dimensions and file issues. | `KDP PDF preflight checker` | In the final verification section. |
| Out | `/kdp-royalty-calculator` | Page count affects print cost and royalty. | `KDP royalty calculator` | As an optional pricing next step. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Why the final PDF wins | Explain when to replace the planning range with actual pagination. | Model statement from the engine; KDP paperback submission guidance; link to PDF preflight checker. | One compact paragraph and two next-step links. Stop before layout-software instructions. | Do not claim exact pages, automatic manuscript understanding, or KDP approval. Do not repeat the additions table. |
| COPY-02 | Task-oriented usage | Explain input preparation, meaningful choices, states, and next verification. | Closed Usage Markdown handoff and accepted technical artifacts. | One concise connected guide; use steps only where order changes the outcome. | No live-result narration, unimplemented features, or duplicate supporting explanations. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Read and apply `skills/stack127/stack127-writing-voice/SKILL.md`.
- Write `stack127`, lowercase, with no em dash or en dash.
- Do not invent typography densities, file behavior, or page guarantees.
- Do not repeat the range or additions table in prose.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass.

## Source ledger

- [KDP paperback submission guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950), checked 2026-09-16. Supports print page constraints and even-page context.
- [KDP paperback cover requirements](https://kdp.amazon.com/en_US/help/topic/G201953020), checked 2026-09-16. Supports the relationship between page count and spine planning.
- [KDP hardcover trim and page specifications](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6), checked 2026-09-16. Supports hardcover page boundaries when a reader switches formats.
- [KDP cover calculator](https://kdp.amazon.com/cover-calculator), checked 2026-09-16. Next verification path for the actual cover file.

## Open questions and blockers

- None for the content plan. The result is intentionally a planning range, not a final pagination engine.


## Usage Markdown handoff

Disposition: Closed and feasible for the retained Astra writing session after main acceptance.

### Assignment and reading order

COPY-02 owns `usage_markdown`: explain the real task, inputs worth preparing, meaningful mode choices, important state distinctions, and the next verification. The existing manual assignments own the introduction, supporting explanations, metadata, and identified interface review only. Where an older assignment discusses how to choose an input, move that instruction into this usage assignment and retain only its conceptual explanation below. Do not repeat it in both fields. Interface inventories are review-only; this plan does not authorize implementation or rewriting dynamic findings.

### Technical facts and meaningful inputs

Use manuscript words and proposed paperback trim, font class, point size, line spacing, inside/outside and shared top/bottom margins. Font classes are model factors, not installed fonts or actual typesetting. Add chapter count and image/front/back-matter pages separately. Zero words produce zero body pages and no chapter allowance, while explicit added pages still count. With words present, the model adds one page per chapter as an allowance, not a recto-start prediction. Each total endpoint rounds up to an even count. The range leads; midpoint is secondary.

### State interpretation and recovery

Reject malformed counts, impossible text areas, and out-of-range controls without a plausible-looking estimate. A valid estimate may include a gutter-band warning; it does not automatically choose new margins or solve a layout. Changing assumptions requires a new estimate.

### Limitations and next action

Average-width factors 0.50/0.52/0.60, five-character word slots, and the 0.8–1.2 density band are local modeling assumptions, not KDP formulas. No file upload, actual font metrics, text flow, pagination, typesetting, or exact final count. Export the real formatted PDF before final setup.

### Input handling boundary

Only local numeric/layout inputs are needed; no manuscript upload is involved. Keep privacy wording scoped to that input flow. The implementation and accepted technical evidence support only these route-specific statements. Do not infer a general retention, logging, analytics, cookie, or anonymity policy.

### Content, media, and list requirements

Keep the interactive tool first. Preserve all outline tables and exact result media; their repeated fields belong in tables, not comparison paragraphs. Existing output values, counts, findings, formulas, and captions stay in the live result rather than a second narrative. No new screenshot, marker drawing, generated illustration, or chart is required. If an ordered list is used, it must represent dependent task steps; use an unordered list only for genuinely independent checks. Do not add a generic FAQ or a list-shaped summary of every control. Every retained table must ship with useful headers and its limitation, not merely a heading placeholder.

### Source ledger and links

Use the existing source ledger for attributable claims, with links at the point of explanation. The ready implementation, interface, edge-case, and brief artifacts govern what this tool actually does; official sources govern external rules. Local assumptions must be labeled rather than attributed to a standards body or platform. Preserve the ledger's checked dates; a content review is not a claim that every source was freshly reverified. Conditional internal destinations: /kdp-book-setup-calculator; /kdp-pdf-preflight-checker. Include them only when the exact route is published at integration; all new batch tools remain unpublished. If a destination is unavailable, omit the link rather than invent a URL or publish its target.

### Feasibility and ownership

The accepted implementation can support this plan without new controls, engines, media, data sources, or implementation work. Astra supplies words only after acceptance. Luna performs content integration later. Neither this plan nor its validator result changes database content, registry publication, tool version, or deployment.
