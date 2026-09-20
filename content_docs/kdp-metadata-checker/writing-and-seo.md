# Writing and SEO plan: KDP metadata checker

Status: ready
Feasibility: feasible
Content review: 2026-09-19
Acceptance path: Main-agent review, then the retained Astra writing session; Luna integrates only accepted words.
Tool: KDP metadata checker
Route: `/kdp-metadata-checker`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-09-16
Primary medium: Tool UI
Content depth: Keep the tool first, then add a short guide that explains the local counts, the difference between documented findings and review prompts, the safe preview boundary, privacy handling, and the KDP verification step. Stop before keyword research, copy generation, trademark review, cover matching, categories, or a full KDP submission guide.

## Search intent

Search discovery was checked on 2026-09-16 with the web connector. Search engine identity was not individually available. The competitive report used standalone Playwright CLI for public result inspection at 1440 x 1000 and 390 x 844. These observations are directional and do not support ranking or traffic claims.

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `KDP metadata checker` | Find obvious title, subtitle, description, and keyword problems before entering KDP. | A preflight workbench with field-specific findings, counts, and a qualified result lead. | Put the five field groups and the `Check metadata` action first. Explain that the result is a local check, not KDP acceptance. |
| Close | `KDP book details checker title subtitle keywords description` | Check the book-detail fields together instead of moving between separate formatters. | One result grouped by field, with exact source text preserved. | Explain the joined scope and keep the seven keyword slots visible. |
| Close | `Amazon KDP book description HTML tags checker` | Find unsupported or malformed description markup and inspect the rendered shape. | A source check, supported-tag count, and safe preview. | Explain the twelve-tag allowlist, malformed markup findings, and preview approximation. |
| Close | `KDP title subtitle character count` | Check the combined title and subtitle boundary. | An exact local count against the documented fewer-than-200-character rule. | Explain the separator and local Unicode code-point count without implying KDP's private counter is reproduced. |
| Close | `KDP metadata errors duplicate keywords description rejected` | Turn a possible issue into a field and recovery step. | A finding list that separates documented errors from heuristic review prompts. | Name the affected field and next edit. Never call a prompt a rejection or a clean result an approval. |

### Intent not targeted

- `KDP keyword research`, search-volume, or competitor-keyword queries: those require a separate research workflow and are outside a local text checker.
- `KDP title generator`, AI listing writer, or description-generation queries: the tool checks supplied copy and does not write or rewrite it.
- Trademark, copyright, category, cover-match, author, ISBN, or live-submission queries: these are outside the five-field input contract and cannot be established from text alone.
- A universal `50-byte KDP keyword limit` query: the reviewed official guidance does not state that numeric limit, so the page must not present it as a KDP fact.

## Page promise

Before an author pastes book metadata into KDP, this page checks the supplied title, subtitle, description, and seven keyword fields in the browser, names documented formatting problems and local review prompts, and keeps the result separate from KDP acceptance.

Reading flow: The workbench answers the immediate preflight question first. The supporting guide then explains how the title and description counts work, why markup can create a finding, how to read heuristic prompts, and what still needs checking in KDP. It ends with the source and privacy boundary rather than a second result summary.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Tool introduction and form | Tool UI | `brief.md`; implementation report Product decision | Do not add a generic KDP introduction or repeat the page promise below the form. |
| Which inputs and scope choices matter? | Five field groups and result counts | Tool UI | `interface-contract.md` Input contract; implementation report Scope | Keep exactly seven keyword slots visible. Do not add author, category, ISBN, cover, or live-submission controls. |
| How should someone use it for the real task? | Form action and brief workflow note | Tool UI and Sentences | `implementation-report.md` User flow; `interface-contract.md` State contract | Explain the submit and recheck sequence once. Do not narrate ordinary buttons. |
| How should the result and its uncertainty be interpreted? | Qualified result lead, finding severity, and guide | Tool UI and Sentences | `implementation-report.md` Rounding, display, and versioning; `edge-cases-and-tests.md` R11, UI-001 | Keep documented errors and heuristic warnings distinct. Do not introduce a score. |
| Which concepts and edge cases commonly surprise users? | Count and markup explanation | Sentences | KDP Metadata Guidelines; Write a Book Description; KDP troubleshooting | Explain raw source count, supported tags, malformed nesting, and normalization without listing every fixture. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Source and limitation disclosure plus guide boundary | Tool UI and Sentences | `implementation-report.md` Assumptions and exclusions; `edge-cases-and-tests.md` Risk model | State that a clean local result is not KDP acceptance. Do not soften this into a vague disclaimer. |
| How are user inputs handled? | Local-processing statement and copy behavior | Tool UI and Sentences | `implementation-report.md` Accessibility, privacy, security, and performance; R15 | Say metadata is checked in the browser and is not sent, stored, scraped, or rewritten. Do not promise sitewide privacy beyond this tool behavior. |
| What should the reader verify next? | Closing verification section and adjacent links | Sentences | KDP Book Detail Resources; KDP Metadata Guidelines | Send the reader to KDP and adjacent stack127 tools. Do not imply that the local result completes submission review. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: `KDP metadata checker: review title, description, and keywords` | What can I check before I enter this metadata in KDP? | The tool checks the supplied five field groups locally and returns a qualified result. | Tool UI | `brief.md`; implementation report Product decision | The workbench and its introduction own the first answer. No long preamble. | n/a |
| 2 | H2: `Review the fields before you paste them into KDP` | What should I do with my draft? | Enter one title, an optional subtitle, one description, and seven keyword slots, then run one stable check. | Tool UI | `interface-contract.md` Input and Result contracts | Do not add generation, live KDP submission, or a score. | n/a |
| 3 | H2: `What the local counts and findings mean` | Is this a KDP verdict? | Counts and findings describe the bundled rule set. Errors are deterministic checks; warnings are prompts to review. | Sentences | `implementation-report.md` Equations and display; `edge-cases-and-tests.md` R11 | Explain the distinction once. The result lead and findings remain the source of truth. | COPY-01 |
| 4 | H3: `Title and subtitle use one local count` | Why does the combined count differ from the two field counts? | The checker adds the two normalized code-point counts and one separator when both fields are populated, then flags 200 or more against the documented fewer-than-200 rule. | Sentences | KDP Metadata Guidelines; implementation report R3 | Do not claim to reproduce KDP's internal Unicode counter or confirm a title-cover match. | COPY-02 |
| 5 | H3: `Description markup uses part of the character budget` | Why can a short-looking description still have a length or tag finding? | The raw description count includes markup, while visible text and supported tags are shown separately. The preview is a safe approximation, not a KDP render guarantee. | Sentences | Write a Book Description; KDP troubleshooting; implementation report R4, R5, R12 | Do not repeat the twelve tag names in prose if the result disclosure already lists them. Do not promise cleaned output. | COPY-03 |
| 6 | H2: `A clean local result is not KDP acceptance` | What remains uncertain after the check? | The checker cannot reproduce private automated review or human judgment. Duplicate phrases, title overlap, promotions, reviews, and similar pattern matches need the wording review described by each finding. | Sentences | KDP Metadata Guidelines; implementation report Assumptions and exclusions | Keep this next to the acceptance boundary. Do not use `approved`, `compliant`, `safe`, `guaranteed`, or `rejected` for the local result. | COPY-04 |
| 7 | H2: `What to verify in KDP next` | What should I do after fixing the named issues? | Recheck the unchanged source, then use KDP's current book-detail guidance and submission flow. Confirm decisions the checker cannot see, including meaning, cover match, and current review behavior. | Sentences | KDP Book Detail Resources; KDP Metadata Guidelines | End with the next action and adjacent links. Do not become a general publishing tutorial. | COPY-05 |
| 8 | H2: `Your metadata stays in this browser check` | What happens to the text I paste here? | The implementation contract keeps metadata in the browser, does not write storage or URL state, and copies the original description only after an explicit action. | Sentences | `implementation-report.md` Accessibility, privacy, security, and performance; R13, R15 | State the implemented boundary only. Do not make a broader claim about every stack127 page or external KDP handling. | COPY-06 |
| Usage | H2: Use the tool for your task | Which inputs should I bring, and what should I do with the outcome? | Use the closed Usage Markdown handoff below. | Sentences | Accepted technical artifacts and route behavior | Explain meaningful choices and next action; no button narration or duplicate live results. | COPY-07 |

No chart, marker concept, screenshot, or exact comparison table is needed. Counts, findings, and the safe preview already show the relationships that matter. A table of all KDP restrictions would duplicate the result and make a rule list look more complete than the checker is.

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Title and subtitle count | Counts use Unicode code points after line-ending normalization. When both fields are populated, the local combined count adds one separator. A count of 200 or more is a documented local finding against KDP's fewer-than-200 rule. | Short explanatory sentences beside the result boundary. | KDP Metadata Guidelines: https://kdp.amazon.com/en_US/help/topic/G201097560; implementation report R3 and RF-002. | Say that the counter is local and does not confirm the cover or KDP's private counting implementation. |
| Description raw count | Every source code point counts, including tag names, brackets, and attributes. The 4,000 boundary is checked separately from visible-text and supported-tag counts. | Tool counts first, then one connected explanation. | Write a Book Description: https://kdp.amazon.com/en_US/help/topic/G201189630; implementation report R4 and RF-003. | Put the markup-cost explanation beside the 4,000 boundary. Do not call the visible count the KDP count. |
| Description tag resolution | The parser accepts only `br`, `p`, `b`, `em`, `i`, `u`, `h4`, `h5`, `h6`, `ol`, `ul`, and `li`. `br` is void. Unsupported names, attributes, incomplete tokens, and bad nesting create findings without changing the source. | Safe preview plus field-specific findings. | Write a Book Description: https://kdp.amazon.com/en_US/help/topic/G201189630; KDP troubleshooting: https://kdp.amazon.com/en_US/help/topic/GC4VASCGNQP6LQ7L. | Mark the preview as an approximation and keep the original source copyable. |
| Keyword comparisons | The seven keyword slots stay separate. Duplicate checks use NFKC, lower case, punctuation-to-space replacement, and collapsed whitespace. Title overlap is a warning only when every significant keyword word appears in the combined title and subtitle. | Findings by slot, with no similarity score or bar. | Keywords guidance: https://kdp.amazon.com/en_US/help/topic/G201298500; implementation report R9 and R10. | State that overlap and duplicates are review prompts because KDP does not publish its matcher. |
| Result status | `clean` means the bundled local checks found no findings. `possible-issues` includes documented errors and heuristic warnings. Invalid shape returns `input-error` with no metadata result. | One lead, followed by counts, grouped findings, preview, and sources. | `implementation-report.md` Equations or resolution order and R11; `interface-contract.md` Result contract. | The first sentence must say this is not KDP acceptance. |

## Metadata proposal

- Registry label: `kdp metadata checker`
- Meta title: `KDP metadata checker: review title, description, and keywords`
- Meta description: `Check a KDP title, subtitle, description, and seven keyword fields for documented formatting issues and local review prompts. A clean result is not KDP acceptance.`
- Page type: `WebApplication`
- Publication recommendation: Keep unpublished until the manual prose pass, rendered page QA, central registry review, and separate explicit publication approval are complete. This handoff does not add route-local metadata, publication state, sitemap state, or JSON-LD.

The title names the job and the fields it covers. The description promises findings, not acceptance. Do not add `online`, `best`, `complete`, `Amazon-approved`, `compliant`, `safe`, `guaranteed`, or a universal keyword-byte claim to registry copy.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/kdp-pdf-preflight-checker` | Move from metadata text to the separate interior PDF file check before uploading a book. | `KDP PDF preflight checker` | COPY-05, after stating that metadata and book files are separate checks. |
| Out | `/kdp-royalty-calculator` | Continue to list-price and royalty estimates after the metadata wording is ready. | `KDP royalty calculator` | COPY-05, only if the reader's next task is pricing. Label the output as an estimate, not a KDP earnings guarantee. |
| Out | `/privacy` | Give readers the sitewide privacy policy after the tool-specific local-processing statement. | `stack127 privacy policy` | COPY-06, after the narrow implementation claim. |
| In, deferred | `/kdp-tools` | A future KDP collection can group metadata, PDF, page-count, and royalty tools once the collection has a useful page of its own. | `KDP tools` | Collection navigation, not route copy, and only after the route is separately published. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | `What the local counts and findings mean` | Help the reader distinguish a local rule result from a KDP decision. | The result has `clean`, `possible-issues`, and `input-error` states. Deterministic documented findings use error severity. Pattern matches, duplicate phrases, and title overlap use warning severity. Sources: implementation report Equations and Rounding sections; edge cases R11, UI-001. | One short connected explanation. Stop after explaining why a warning asks for review instead of predicting rejection. | Do not write a score, approval label, or second summary of the findings list. |
| COPY-02 | `Title and subtitle use one local count` | Explain the combined field boundary without making the count sound like KDP's private implementation. | KDP requires fewer than 200 characters for title plus subtitle. The local check normalizes line endings, counts Unicode code points, and adds one separator only when both fields are populated. Sources: https://kdp.amazon.com/en_US/help/topic/G201097560 and implementation RF-002. | One compact explanation with the reason the two fields can differ from their sum. Stop before discussing cover or title truthfulness. | Do not say 199 is approved, claim exact KDP Unicode behavior, or repeat the visible count. |
| COPY-03 | `Description markup uses part of the character budget` | Explain why source markup, supported tags, malformed nesting, and preview output have separate jobs. | KDP's description limit is 4,000 characters including HTML tags. Launch allowlist is the twelve tags in the formula table. The source is preserved. Preview maps parsed allowlisted tags safely and approximates KDP's renderer. Sources: https://kdp.amazon.com/en_US/help/topic/G201189630 and https://kdp.amazon.com/en_US/help/topic/GC4VASCGNQP6LQ7L. | One or two short paragraphs. Stop after the reader knows to fix the named source finding and inspect the preview. | Do not promise exact Amazon rendering, a cleaned export, or silent tag repair. Do not repeat every count. |
| COPY-04 | `A clean local result is not KDP acceptance` | Keep the most important trust boundary visible. | The tool cannot reproduce KDP's private automated systems or human review. It cannot judge truthfulness, spoilers, trademarks, categories, cover matching, or the full meaning of promotional language. Obvious patterns are bounded heuristics. Sources: https://kdp.amazon.com/en_US/help/topic/G201097560 and implementation Assumptions and exclusions. | One direct paragraph beside the result limitation. Stop once the reader understands what the local check does and does not establish. | Do not use `approved`, `compliant`, `safe`, `guaranteed`, or `rejected` for the tool result. Do not turn the limitation into a large caveat panel. |
| COPY-05 | `What to verify in KDP next` | Give the reader a sensible handoff after fixing source findings. | Recheck the exact source, consult current KDP book-detail guidance, and complete the real KDP form review. Metadata and interior-file checks are separate. Link to KDP Book Detail Resources and the adjacent PDF checker. Sources: https://kdp.amazon.com/en_US/help/topic/G202105800 and the internal-link table. | One closing paragraph and the two relevant links. Stop before a general self-publishing guide. | Do not imply that a clean local result completes KDP review or that the adjacent tools share KDP's private decision system. |
| COPY-06 | `Your metadata stays in this browser check` | Explain the narrow privacy and source-preservation behavior. | Title, subtitle, description, and keywords are not sent to a server, stored in browser storage, serialized into the URL, scraped, or passed to an AI writer. `Copy source` requires an explicit user action and copies the unchanged description. Source: implementation report Accessibility, privacy, security, and performance; R13 and R15. | One short paragraph. Link to `/privacy` only after the tool-specific statement. Stop before making a sitewide or KDP privacy claim. | Do not claim that the page is a submission gateway, that KDP receives nothing during the user's later workflow, or that all stack127 pages process data the same way. |
| COPY-07 | Task-oriented usage | Explain input preparation, meaningful choices, states, and next verification. | Closed Usage Markdown handoff and accepted technical artifacts. | One concise connected guide; use steps only where order changes the outcome. | No live-result narration, unimplemented features, or duplicate supporting explanations. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Apply `skills/stack127/stack127-writing-voice/SKILL.md` and `skills/stack127/unslop/SKILL.md` to every later public sentence, heading, label, caption, and metadata field.
- Write `stack127` in lowercase and use sentence case headings.
- Use no em dash or en dash as punctuation. Use straight quotes and plain, direct wording.
- Keep local counts, local parser findings, and heuristic prompts distinct from KDP's acceptance decision.
- Do not invent rules, keyword limits, review outcomes, privacy behavior, source freshness, or implementation features.
- Do not repeat the result lead, counts, findings, preview, or source disclosure in supporting prose.
- Leave a changed official rule or unresolved KDP boundary as a review note. Do not make the copy sound certain to hide it.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The later content pass supplies them through the reviewed tool-page workflow. This plan does not authorize code, tests, manifests, scripts, database rows, route-local metadata, or publication changes.

## Source ledger

- [KDP Metadata Guidelines for Books](https://kdp.amazon.com/en_US/help/topic/G201097560), checked 2026-09-16. Supports title and subtitle limits, description restrictions, prohibited content categories, and the distinction between local checks and KDP review.
- [Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630), checked 2026-09-16. Supports the 4,000-character description limit, counting HTML tags, the twelve-tag allowlist, and description formatting boundaries.
- [Make Your Book More Discoverable with Keywords](https://kdp.amazon.com/en_US/help/topic/G201298500), checked 2026-09-16. Supports the seven keyword slots and documented keyword guidance. It does not support a universal 50-byte field limit.
- [Create a Book](https://kdp.amazon.com/en_US/help/topic/G202172740), checked 2026-09-16. Supports the finding for HTML-like input in title, subtitle, author, contributor, and keyword fields.
- [Fixing errors or formatting with book descriptions](https://kdp.amazon.com/en_US/help/topic/GC4VASCGNQP6LQ7L), checked 2026-09-16. Supports invisible-character, copied-markup, and missing or mismatched tag recovery guidance.
- [Book Detail Resources](https://kdp.amazon.com/en_US/help/topic/G202105800), checked 2026-09-16. Supports the next-step link for reviewing book details and metadata before submission.
- `competitive-report.md`, checked 2026-09-16. Supports the fragmented competitor shape, query families, observed description-only workflows, and the decision to join five field groups without generation or approval claims.
- `implementation-report.md`, checked 2026-09-16. Supports the local resolution order, normalization, statuses, privacy boundary, safe preview, result order, and unpublished route state.
- `interface-contract.md`, checked 2026-09-16. Supports the closed input inventory, result hierarchy, responsive behavior, and removal of score, live submission, storage, and AI writing.
- `edge-cases-and-tests.md`, checked 2026-09-16. Supports the warning versus error boundary, source preservation, preview security, no-network behavior, accessibility expectations, and publication-state checks.
- `brief.md`, checked 2026-09-16. Supports the audience, job, and tool-first show-versus-say direction.

## Open questions and blockers

- None blocks this handoff. The route remains unpublished until a separate publication decision.
- Before any later content or build release, recheck the five official KDP sources. A changed allowlist, limit, or policy interpretation requires a new rule-set review and refreshed upstream fingerprints.
- The official sources still do not establish a universal numeric keyword limit or KDP's internal Unicode counter. Keep both boundaries local and qualified.


## Usage Markdown handoff

Disposition: Closed and feasible for the retained Astra writing session after main acceptance.

### Assignment and reading order

COPY-07 owns `usage_markdown`: explain the real task, inputs worth preparing, meaningful mode choices, important state distinctions, and the next verification. The existing manual assignments own the introduction, supporting explanations, metadata, and identified interface review only. Where an older assignment discusses how to choose an input, move that instruction into this usage assignment and retain only its conceptual explanation below. Do not repeat it in both fields. Interface inventories are review-only; this plan does not authorize implementation or rewriting dynamic findings.

### Technical facts and meaningful inputs

Provide title and description; subtitle and seven keyword slots are optional. Counts use Unicode code points with normalized line endings. Combined title/subtitle includes one separating character when both exist; 200 or more produces a finding. The description's 4,000-character check counts raw markup. Twelve recognized tags are br, p, b, em, i, u, h4, h5, h6, ol, ul, and li; attributes and malformed nesting are flagged. The preview is sanitized and approximate. Keyword duplicate/title-overlap review uses normalized comparisons. A keyword over 50 Unicode characters receives an explicitly stack127-local warning, not an official KDP field or byte limit and not a pass/fail rule. The corrected implementation and 49/50/51 multibyte fixture govern this claim.

### State interpretation and recovery

Distinguish input-error from a completed clean or possible-issues review. The checked snapshot can remain visible after edits with a Check again state; do not call it a fresh result. Copying the description copies source text, not repaired HTML. Empty optional keyword slots are valid.

### Limitations and next action

No automated rewrite, AI policy judgment, trademark review, discoverability prediction, HTML repair, live KDP validation, or acceptance guarantee. Local 64 KiB field and 8 KiB keyword guards are implementation safeguards, not KDP rules.

### Input handling boundary

Text checking and safe preview are local to the browser. Do not request confidential account details or extend the input-handling statement into sitewide anonymity. The implementation and accepted technical evidence support only these route-specific statements. Do not infer a general retention, logging, analytics, cookie, or anonymity policy.

### Content, media, and list requirements

Keep the interactive tool first. Preserve all outline tables and exact result media; their repeated fields belong in tables, not comparison paragraphs. Existing output values, counts, findings, formulas, and captions stay in the live result rather than a second narrative. No new screenshot, marker drawing, generated illustration, or chart is required. If an ordered list is used, it must represent dependent task steps; use an unordered list only for genuinely independent checks. Do not add a generic FAQ or a list-shaped summary of every control. Every retained table must ship with useful headers and its limitation, not merely a heading placeholder.

### Source ledger and links

Use the existing source ledger for attributable claims, with links at the point of explanation. The ready implementation, interface, edge-case, and brief artifacts govern what this tool actually does; official sources govern external rules. Local assumptions must be labeled rather than attributed to a standards body or platform. Preserve the ledger's checked dates; a content review is not a claim that every source was freshly reverified. Conditional internal destinations: /kdp-book-setup-calculator; /kdp-royalty-calculator. Include them only when the exact route is published at integration; all new batch tools remain unpublished. If a destination is unavailable, omit the link rather than invent a URL or publish its target.

### Feasibility and ownership

The accepted implementation can support this plan without new controls, engines, media, data sources, or implementation work. Astra supplies words only after acceptance. Luna performs content integration later. Neither this plan nor its validator result changes database content, registry publication, tool version, or deployment.
