# Interface contract: Docker Compose checker

Status: ready
Tool: Docker Compose checker
Route: `/docker-compose-checker`
Mode: pipeline
Depends on: `brief.md`, `implementation-report.md`
Input fingerprint: `brief.md sha256:cdddc1c8a8dea42aa26848b792fd2874159f87cb63c7bb996cd8be187aeeda92`
Input fingerprint: `implementation-report.md sha256:1c4ef6b5fc05c53b4c82dfb2ebef07201cc004724bb9ee85d31bdea0081ada97`

## User task

- Primary user: A homelab operator or developer has one Compose file and wants to find what will fail before running `docker compose config` or `docker compose up`.
- Question: What does this pasted Compose file say structurally, and what still needs the real Compose project or Docker runtime to verify?
- Lead answer: Whether the pasted document has YAML, Compose-model, or static advisory findings, with the exact source location and repair direction.
- Next decision: Fix the named source location, run the real Compose command with the project files, or accept that the remaining advisory is a review clue rather than a Compose failure.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Compose file | What should be checked? | User input | input | The checker cannot answer without one pasted YAML document. | Do not repeat the full source in the result. |
| Interpolation environment | Which values are known for interpolation analysis? | User input | input | It changes token states and may change model diagnostics. | Do not call it `.env` or use it as a service `env_file`. |
| Completeness/verdict | Can I act on this result, and what remains unknown? | Derived engine result | lead | This is the first answer the user needs. | Layer rows explain why; they do not repeat the full verdict sentence. |
| YAML syntax layer | Is the document parseable? | Parser result | supporting | Separates syntax recovery from model checks. | Do not call the whole file valid because this layer passes. |
| Compose model layer | Does the pasted one-file model have structural errors or warnings? | Normalized model checks | supporting | Shows references, types, ports, healthchecks, profiles, and interpolation consequences. | Counts show exact totals; the layer row shows only its state. |
| Static advisories layer | Which accepted declarations deserve review? | Reviewed static rules | supporting | Keeps advisory clues separate from Compose validity. | Never turn advisories into a security score or safety verdict. |
| Diagnostic records | Where is each issue and how should it be repaired? | Parser and engine diagnostics | evidence | Repeated fields justify a table or stacked list. | Each record appears once, ordered by severity layer and source order. |
| Counts | How large is the parsed model and how many findings exist? | Normalized summary | supporting | Exact integers make the result scannable. | Layer rows do not repeat the exact count values. |
| Normalized model | What did the checker understand from this file? | Normalized model | evidence | Shows service names, resources, profiles, ports, dependency edges, interpolation states, and completeness reasons. | Do not render a canonical Compose file or claim this is Docker's final merged model. |
| Provenance | Which rule and specification snapshot produced this result? | Engine metadata | evidence | Makes copied results traceable. | Keep it quiet metadata; do not put it beside the lead answer. |
| Limitations | What did the browser not verify? | Product boundary | supporting | Prevents a static result from being read as runtime proof. | State the boundary once in the result and explain it in supporting page content. |
| Local-only notice | Does this checker upload or read project files? | Product behavior | supporting | The privacy boundary affects how the input should be trusted. | Keep it beside the inputs; do not repeat it in every finding. |
| Graph, formatter, chart, security score, runtime badge, file picker, downloads, share state | Does the tool need another view or input? | Upstream scope | omit | These are deferred or non-goals and compete with source-anchored repair. | No alternate result view, score, or hidden file input. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Compose file | Required UTF-8 text, one YAML document, 256 KiB and 4,000 physical lines maximum | yes, it supplies the checked document | User supplied, empty on clean load | visible, first and widest field in the workbench | `ToolTextArea`, native multiline `textarea` semantics | It is the file being checked and has the highest editing cost | Full width, minimum 12 rows, vertical resize only. |
| 2 | Interpolation environment | Optional `KEY=VALUE` lines, 64 KiB and 2,000 lines maximum | yes, when interpolation is present | User supplied, empty on clean load | visible, directly below Compose file | `ToolTextArea`, native multiline `textarea` semantics | It changes known, defaulted, required, and unresolved interpolation states | Full width, minimum 5 rows, stacked below the Compose field. |
| 3 | Load example | Secondary action; replaces both inputs and clears any result | no, it changes the draft but not the answer until submit | Fixed local example | visible, in the action row below the local-only notice | `ToolButton` with `type="button"` | Gives a fast, reproducible starting point | Full-width or natural-width button in the secondary group. |
| 4 | Reset | Secondary action; clears both inputs, errors, notices, and result | no, it returns to the initial state | Empty state | visible, in the action row beside Load example | `ToolButton` with `type="button"`; use the existing reset icon pattern with a text label | Provides recovery without hiding or deleting the current input unexpectedly | Natural-width button; remains before the primary action. |
| 5 | Check Compose file | Required explicit submit and the only primary action | yes, it produces the lead answer | No automatic submission | visible, on the right side of the desktop action row and last in source order | `ToolButton` with `type="submit"`, `variant="primary"` | Makes the check deliberate and keeps multiline editing stable | Full width below the secondary actions. |
| 6 | Copy report | Secondary result action; copies schema-versioned plain text only after an explicit request | no, it preserves the existing lead answer | No result means no action | result, in the result header after the lead answer | `ToolCopyAction`, label `Copy report`, success label `Report copied`, failure label `Copy failed` | Lets the user carry stable codes, counts, and fixes into an issue or terminal session | Full-width or natural-width action below the lead answer. |

## Field copy and example values

| Element | Exact visible copy or value |
| --- | --- |
| Compose label | `Compose file` with a visible required mark |
| Compose description | `Paste one Compose YAML document.` |
| Compose placeholder | `services:\n  web:\n    image: nginx:latest\n    ports:\n      - "8080:80"` |
| Interpolation label | `Interpolation environment` |
| Interpolation description | `Optional KEY=VALUE lines used only for Compose interpolation. This is not a service env_file.` |
| Interpolation placeholder | `APP_TAG=latest\nDB_HOST=db.internal` |
| Local-only notice | `Your inputs stay in this browser. This check does not read files or contact Docker.` |
| Loaded Compose example | `services:\n  web:\n    image: nginx:${APP_TAG}\n    depends_on:\n      - db` |
| Loaded environment example | `APP_TAG=latest` |
| Example purpose | The loaded example has one missing service reference and one floating image-tag advisory after interpolation. It does not submit automatically. |
| Submit button | `Check Compose file` |
| Secondary buttons | `Load example`, `Reset` |

The Compose field is the only required input. An empty submission shows `Paste a Compose file before checking.` below that field, marks it invalid, clears any prior result, and focuses the field. The optional environment field is valid when empty. Its malformed assignment and duplicate-key errors are shown below that field, with the first invalid environment line named when the parser has a location.

Editing either textarea immediately clears the previous result, counts, findings, copy status, and completeness state. It does not run validation. Enter inserts a newline in both textareas. Keyboard users submit with the focused `Check Compose file` button. The caret stays in place while editing.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Answer and completeness | What is the main conclusion for this pasted file? | Parse state, model blocking state, advisory state, and incomplete-model flag | Focusable result section with a page-owned `h2`, followed immediately by `ToolResultLead`; use plain state text and a restrained neutral border or background | Lead copy is one of `Input needs attention`, `YAML syntax needs fixing`, `Compose model needs fixing`, `Compose model has blocking issues`, `Cannot fully resolve this file`, or `No blocking static issues found`. Never use only `Valid YAML`, `safe`, `ready`, or `production-ready`. |
| 2 | Layer summary | Which of the three checks passed, found issues, or remains partial? | YAML syntax, Compose model, Static advisories | `ToolKeyValueList` in a labeled section with exactly three rows: `YAML syntax`, `Compose model`, `Static advisories`; values are state words, not repeated counts | The rows explain the lead answer. Exact counts belong only in the counts region. |
| 3 | Counts summary | How many services, resources, interpolation tokens, and findings did the checker count? | Services, published ports, named volumes, networks, secrets, configs, profiles, interpolation tokens, errors, warnings, advisories | `ToolMetricGroup` with an accessible label and exact integer values; route CSS controls the grid | Do not use a bar or percentage. Zero remains visible as `0`. |
| 4 | Diagnostic findings | What exactly should I inspect or fix? | Ordered diagnostics with severity, stable code, layer, Compose path, 1-based line and column when available, message, source excerpt when available, and fix | Native semantic `<table>` on desktop with six columns: Severity, Code, Path, Location, Finding, Fix. The Finding cell includes the capped source excerpt as a labeled code block line. At 760px and below, each row reflows into a labeled block in source order. | This is the only repeated-record region. No duplicate summary cards or per-finding cards. A syntax parse failure shows one or more syntax findings and no semantic model findings. |
| 5 | Normalized model summary | What did the checker understand from the pasted file? | Service names, profile names, published-port keys, dependency edge count, interpolation states, completeness flag, and incomplete-model reasons | Page-owned compact key/value rows using `ToolKeyValueList`; long lists wrap inside the value cell | Do not show a graph, canonical YAML, or runtime state. Counts already shown in region 3 are not repeated as separate rows unless the row adds names or states. |
| 6 | Copy action | Can I preserve the exact result? | Result schema version 1, engine version, counts, completeness, normalized summary, and every diagnostic | `ToolCopyAction` in the result header or directly after findings; result remains visible after success or failure | Copy is the only clipboard operation and is never automatic. |
| 7 | Provenance | Which reviewed implementation snapshot produced this result? | `compose-checker-resolution-1`, Compose Specification snapshot date, schema snapshot identifier, and YAML parser package/version supplied by the engine | Small metadata line under the normalized model and copy action | No invented parser or schema version in the interface contract. Values come from engine provenance. |
| 8 | Limitations | What can this browser check not prove? | No merged external files, real shell or project `.env`, service `env_file` contents, host files, registry, Docker daemon, image availability, host-port availability, engine support, process readiness, or runtime health | One concise paragraph under a `Limitations` heading, with an extra incomplete-model sentence only when applicable | Do not show a runtime badge, security score, or broad claim that the configuration is safe. |

## Lead state copy

| Condition | Lead copy | Supporting completeness text |
| --- | --- | --- |
| Input boundary failure | `Input needs attention` | `Fix the highlighted input, then check the file again.` |
| YAML syntax failure | `YAML syntax needs fixing` | `Fix the highlighted input, then check the file again.` |
| Compose root shape failure | `Compose model needs fixing` | `Fix the Compose root, then check the file again.` |
| Parsed model has one or more model errors | `Compose model has blocking issues` | `The findings below are based on the pasted file only.` |
| Parsed model includes `include` or `extends` | `Cannot fully resolve this file` | `The pasted file was checked, but referenced files were not read or merged.` |
| No model errors, warnings, or advisories | `No blocking static issues found` | `This result covers the pasted file only. Docker and runtime checks remain outside the browser tool.` |
| No model errors but warnings or advisories | `No blocking static issues found` | `Review the findings below. They are warnings or static clues, not runtime proof.` |
| Unexpected engine exception | `The checker could not finish` | `Your inputs are still here. Try the check again.` |

### Diagnostic fields and order

Every finding exposes these fields in the result and in copied text:

1. Severity: `Error`, `Warning`, `Advisory`, or `Info`.
2. Stable code: uppercase `YAML-`, `COMPOSE-`, or `INPUT-` identifier.
3. Layer: `Input`, `YAML syntax`, `Compose model`, or `Static advisories`.
4. Path: Compose-style path such as `services.web.depends_on.db.condition` or `services.web.ports[0]`.
5. Location: `line N, column M`, both 1-based when available, otherwise `line and column unavailable`.
6. Finding: concise message that says what the checker found and what it does not prove when that distinction matters.
7. Source excerpt: the trimmed source line, capped at 240 Unicode code points, when a stable source line exists. Render user text as text or code content, never HTML.
8. Fix: one concise repair direction. Do not auto-edit the source.

Order findings by YAML syntax errors, Compose model errors, Compose model warnings, advisories, then info. Keep source order within each group. The table header is visible on desktop. On mobile, each cell has a visible `data-label` equivalent so the row remains understandable without the hidden header.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Diagnostic table | Repeated finding fields across source locations | Yes, columns align the same fields; mobile reflow preserves field labels without implying a numeric scale | Use a semantic table on desktop and a stacked labeled list below 760px. |
| Layer summary | Three discrete validation states | not applicable, no numeric geometry is needed | Use a key/value list with words and semantic text; do not use equal-width progress bars. |
| Counts summary | Exact independent integers | no, no useful ratio or denominator exists | Replace with `ToolMetricGroup`, not charts or bars. |
| Normalized model | Names, keys, states, and relationships that need inspection | no, mixed lists and unknown profile sets have no truthful shared geometry | Replace with key/value rows and wrapped code values. |
| Service graph | Dependency relationships | no, a graph could encode edges but would not locate the source repair and would add a second result model | Omit at launch. |
| Security score or runtime badge | Implied risk or runtime proof | no, the engine cannot establish either relationship | Omit. |
| Marker art, chart, screenshot, formatter, raw canonical YAML | Concept, exact trend, real interface, or transformed source | no, none is needed for this source-anchored checker result | Omit from the workbench. |

Color supplements the words `Error`, `Warning`, `Advisory`, `Info`, and `Pass`. Use existing semantic tokens in both themes. Do not use the chartreuse accent for every status, and do not use a colored left rule on findings or callouts.

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean | Both textareas empty; `Check Compose file` enabled; `Load example` and `Reset` available | No result region rendered | No counts or findings | None | No unsolicited announcement. Compose textarea is the first normal tab stop. |
| Loading / non-applicable | The local bounded engine is synchronous in v1 | No loading result | No spinner, progress bar, or stale result | Not applicable in the product state model. If an implementation yields internally, preserve button width and prevent duplicate submission without adding a new result state. | No loading announcement. |
| Empty Compose input | Submit with Compose textarea empty | No result | No semantic findings | Inline error `Paste a Compose file before checking.` | Set `aria-invalid`, associate the error with `aria-describedby`, focus Compose textarea, announce `Fix the highlighted input`. |
| Invalid interpolation environment | Submit with malformed or duplicate `KEY=VALUE` line | No model result for that submission | Source-anchored input diagnostic only | Inline environment error with code and line when available; keep Compose text | Focus the first invalid environment line or environment textarea and announce the field error. |
| Input boundary failure | The pasted input exceeds a limit, contains a disallowed character, or the optional environment is malformed | `Input needs attention` | Input findings only; no Compose model, normalized summary, or advisory result | Show the targeted input, code, line when available, and fix. Previous result is removed. | Focus the invalid editor; result is not focused. |
| YAML syntax invalid | Parser rejects the Compose text, including multiple documents or unsafe tags | `YAML syntax needs fixing` | Syntax findings only; no Compose model, normalized summary, or advisory result | Show code, message, line/column when available, excerpt, and fix. Previous result is removed. | Focus the first invalid input; result is not focused because no semantic result exists. |
| Compose root invalid | The parsed YAML root is not a mapping | `Compose model needs fixing` | One Compose model finding; no normalized model | Show the root diagnostic and repair direction. | Focus the result section because this is a parsed model state. |
| Clean parsed result | No errors, warnings, or advisories | `No blocking static issues found` | Three layer rows, exact zero counts, normalized model, provenance, limitations | None | Focus `#compose-result` with `tabindex=-1`; announce the lead once through the live region. |
| Semantic findings | Parsed document has model errors, warnings, or info | `Compose model has blocking issues` when errors exist; otherwise `No blocking static issues found` | Layer summary, exact counts, ordered findings, normalized model | Fix guidance remains beside each finding. Advisories never change model validity. | Focus result section and announce only the lead plus incomplete status when applicable. |
| No-blocking issues with advisories | No model errors; one or more advisories | `No blocking static issues found` | Static advisories row identifies review clues; exact advisory count appears only in counts | Keep advisory language qualified. Do not say safe or secure. | Focus result section; announce the lead, not every advisory. |
| Incomplete model | `include`, `extends`, or another unresolved external composition boundary is present | `Cannot fully resolve this file` | Partial findings and normalized model remain visible; completeness reason names the path or service | Explain that referenced files were not fetched or merged; related missing references may be downgraded with that reason | Focus result section and announce incomplete resolution. |
| Clipboard failure | User activates `Copy report`; Clipboard API and fallback both fail | Result remains unchanged | Copy control remains available; source and result stay selectable | Button says `Copy failed`; show one local status `Copy failed. The result is still available to copy manually.` | Keep focus on Copy report and announce failure politely. |
| Clipboard success | User activates `Copy report` and copy succeeds | Result remains unchanged | Button says `Report copied` briefly | No extra result region | Keep focus on Copy report and announce `Report copied`. |
| Unexpected engine failure | Parser or engine throws after input passes UI limits | `The checker could not finish` | No stale result; both textareas remain intact | Danger status `Your inputs are still here. Try the check again.` and a `Try again` secondary button | Focus the failure region, announce the failure, and return focus to `Try again` after activation. |
| Malformed state query | URL contains `state` | No result; clean inputs | Neutral notice `Shared inputs are not supported` | Do not decode the value. Remove only `state`, preserve unrelated query parameters, and stay empty. | Announce the notice politely. Do not focus a result. |
| Changed input after result | User edits either textarea | No result | Counts, findings, copy status, and old completeness state are cleared immediately | Draft text remains; user can submit again | Keep caret focus in the edited textarea and announce `Inputs changed`. |
| Reset | User activates Reset | No result; empty inputs | Notices and field errors cleared | Remove only unsupported `state` query if present; no storage write | Focus Compose textarea and announce `Checker reset`. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Two labeled multiline inputs with descriptions and errors | Shared `ToolTextArea` from `app/tool-ui/tool-controls.tsx` | Provides persistent labels, optional descriptions, required semantics, `aria-invalid`, `aria-describedby`, and native textarea editing | A contenteditable editor or line-numbered custom editor would make keyboard and error semantics harder and is not required by the product contract. |
| Form and explicit submit | Native `<form>` with `ToolButton` | Preserves form semantics and makes submission observable; no hidden live validation | Input `onChange` validation is rejected because the report requires explicit submission. |
| Secondary and primary actions | `ToolActionRow` plus `ToolButton` | Matches existing checker controls, shared hit targets, focus ring, and variant tokens | Custom buttons or icon-only actions are rejected. Reset keeps its text label even when it has an icon. |
| Result answer | Page-owned result section plus `ToolResultLead` | The shared lead style gives the verdict visual priority while the page-owned section supplies the focusable heading and result anchor | `ToolPrimaryResult` is rejected because this is a sentence and state, not a numeric value/unit result. |
| Layer states | `ToolKeyValueList` | Three label/value pairs are discrete states and do not need a chart | `ToolAllocationBar` and `ToolProgressBar` are rejected because there is no truthful denominator or ordered scale. |
| Exact counts | `ToolMetricGroup` | Existing metric semantics support labeled exact integers and responsive auto-fit rows | Cards or colored count badges are rejected because they would equalize supporting facts and create nested containers. |
| Repeated diagnostics | Page-owned semantic `<table>` with route CSS reflow below 760px | The custom fields include excerpts, wrapped codes, and fix text. Desktop alignment helps scanning; stacked cells preserve labels on mobile | `ToolDataTable` is rejected because its shared scroll-only treatment does not provide the required 320px reflow. A horizontal viewport is not the primary recovery for findings. |
| Normalized summary | `ToolKeyValueList` with page-owned wrapping for code values | Mixed names, keys, states, and reasons are easier to read as labeled rows than as a fake canonical document | `ToolRawOutput` and `ToolCodeOutput` are rejected because the checker must not render a canonical Compose file or make long preformatted output the main summary. |
| Copy action | `ToolCopyAction` with explicit labels and a page-owned live status | Uses the existing Clipboard API and verified fallback behavior while preserving focus | Automatic clipboard writes, download, and share-link actions are rejected. |
| Status announcements | `ToolStatus` for notices and failure, plus one visually hidden concise live region for result transitions | Keeps field/result status associated with the workbench and prevents every diagnostic from being announced at once | Multiple live regions and repeated inline status messages are rejected. |
| Source excerpt | Plain text/code content inside the diagnostic cell | The required excerpt is visible evidence and should not need an extra click | A disclosure per finding is rejected because it hides evidence and adds repeated keyboard work. |
| Style ownership | `docker-compose-checker.module.css` for layout, result rows, reflow, overflow, and both themes; `app/tool-ui/tool-controls.module.css` remains the shared primitive owner | Keeps page behavior local and follows `css-architecture.md` | `app/globals.css` selectors and a new global token layer are rejected. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop, wider than 960px | Workbench spans the main content column. Compose textarea, environment textarea, local-only notice, actions, then result. Result order is answer, layers, counts, findings, normalized model, copy, provenance, limitations. Actions keep secondary buttons left and primary submit right. | `services.frontend.depends_on.database.condition`, `COMPOSE-INCOMPLETE-MODEL`, and a 240-code-point excerpt | No page overflow. Diagnostic table uses `table-layout: fixed`, `min-width: 0`, and `overflow-wrap: anywhere`. |
| 760px to 959px | Same reading order. Textareas remain stacked. Action row may wrap, with the primary action retaining a full comfortable target. Diagnostic table changes to reflowed rows at the 760px breakpoint. | Long service names, image references, and paths | Diagnostic rows own wrapping. No sibling overlaps and no page-level horizontal scrolling. |
| 375px | One-column workbench. Secondary actions stack before full-width primary submit. Counts use the shared metric grid, generally two columns when each label fits. Each diagnostic row displays visible labels in source order. | `services.web.ports[0]`, `line 4000, column 240`, long variable expressions, and a long fix sentence | Diagnostic row cells wrap with `overflow-wrap:anywhere`; source excerpts wrap as code text. The page remains at the viewport width. |
| 320px | Same reading order with one-column counts if the shared minimum cannot fit. Buttons become full width. No fixed side-by-side inputs or controls. | The same longest values as 375px | Route CSS owns all reflow. No horizontal scroll region is required for findings, and no text is clipped. |
| Both themes | Use shared surface, border, text, muted, danger, warning, success, and focus tokens. Severity words remain visible when color is unavailable. | Every code, path, excerpt, and button label | No theme-specific dimensions or contrast shortcuts. |

Stable dimensions: both textareas have a minimum block height and vertical-only resize; buttons retain the shared 44px minimum target and stable width through status changes; the result focus target has no layout shift; metric cells have a minimum content width until the authored breakpoint; diagnostic cells have `min-width: 0`.

## Accessibility and keyboard contract

- Use one semantic `<form>` with a programmatically associated `label` for each textarea. `Compose file` is required and marked with the shared visible `*` plus an accessible required state. `Interpolation environment` is optional.
- Set `spellCheck={false}`, `autoCapitalize="none"`, and the existing monospace textarea treatment for both inputs. Do not intercept normal text editing, selection, paste, undo, redo, arrow navigation, or newline insertion.
- Associate each field error with its control through `aria-describedby` and set `aria-invalid="true"` only while that field has an error. Focus the first invalid control after submission.
- Give the result section a stable `id="compose-result"`, `aria-labelledby` pointing to its page-owned `h2`, and `tabIndex={-1}`. Focus it after a parsed submission, including incomplete and semantic-finding results.
- Use `role="status"` for polite notices and result transition text. Use `role="alert"` only for the unexpected engine failure or an immediately actionable submission failure, and do not repeat the same message in multiple regions.
- Keep diagnostic severity, code, path, line, column, excerpt, message, and fix in the accessibility tree. The mobile reflow must not rely on CSS-generated labels alone; retain semantic table headers and explicit cell labels.
- `Copy report` is a real keyboard button. It announces `Report copied` only after the Clipboard API or fallback succeeds. On failure it keeps the result and focus available and announces `Copy failed`.
- Disclosures are not needed for required diagnostic evidence. If a future implementation adds one for optional detail, it must use the shared keyboard-reachable disclosure and never hide the fix.
- Do not expose user text through HTML injection, tooltips, browser storage, analytics, or network requests.

## URL, privacy, and persistence contract

- Opening `/docker-compose-checker` leaves the canonical URL unchanged through server render and hydration.
- Do not serialize inputs, derived results, defaults, counts, or copy state into the URL, cookies, local storage, IndexedDB, analytics, server logs, or network requests.
- If `state` is present, never decode it. Remove only `state` with `replaceState`, preserve unrelated parameters and the hash, show `Shared inputs are not supported`, and start with empty inputs.
- `Load example`, `Reset`, edit, submit, and copy do not write URL state.
- The checker does not upload input, call a server action, read host files, fetch includes or remote URLs, contact a registry, read a Docker socket, or read clipboard input. Clipboard output is allowed only after `Copy report`.

## Interface wireframes

### Desktop clean state

```text
Docker Compose checker
Check one Compose file for YAML, Compose structure, and static clues.

+------------------------------------------------------------------------------+
| Compose file *                                                               |
| Paste one Compose YAML document.                                             |
| +--------------------------------------------------------------------------+ |
| | services:                                                                | |
| |   web:                                                                   | |
| |     image: nginx:latest                                                  | |
| |     ports:                                                                | |
| |       - "8080:80"                                                        | |
| +--------------------------------------------------------------------------+ |
|                                                                              |
| Interpolation environment                                                    |
| Optional KEY=VALUE lines used only for Compose interpolation.                |
| +--------------------------------------------------------------------------+ |
| | APP_TAG=latest                                                           | |
| +--------------------------------------------------------------------------+ |
|                                                                              |
| Your inputs stay in this browser. This check does not read files or contact  |
| Docker.                                                                      |
|                                                                              |
| [Load example] [Reset]                              [Check Compose file]     |
+------------------------------------------------------------------------------+
```

### Narrow semantic result

```text
Docker Compose checker

+--------------------------------------+
| No blocking static issues found      |
| Review the findings below. They are   |
| warnings or static clues, not runtime |
| proof.                                |
|                                      |
| YAML syntax       Pass               |
| Compose model     No blocking issues |
| Static advisories Review clues       |
|                                      |
| Services             2                |
| Published ports      2                |
| Named volumes        1                |
| Errors               0                |
| Warnings             1                |
| Advisories           2                |
|                                      |
| Findings                             |
| Severity  Warning                    |
| Code      COMPOSE-VERSION-OBSOLETE   |
| Path      services.web.ports[0]      |
| Location  line 6, column 9           |
| Finding   This key is accepted but   |
|           does not select a legacy   |
|           Compose schema.            |
| Excerpt   version: "3.8"             |
| Fix       Remove version when old    |
|           tooling no longer needs it.|
|                                      |
| Normalized model                     |
| Services  web, db                    |
| Profiles  none                       |
| Edges     1 depends_on edge           |
|                                      |
| [Copy report]                        |
| Engine and specification metadata    |
| Limitations: no Docker or runtime    |
| proof.                               |
+--------------------------------------+
```

### Syntax-error result

```text
YAML syntax needs fixing

Error  YAML-PARSE-ERROR
Location  line 5, column 13
Excerpt   ports: ["8080:80"
Fix       Close the sequence, then check the file again.

No Compose model or static advisories are shown.
```

## Removed or rejected

- Hidden live validation. It would make a multiline draft unstable and would make stale-result clearing unclear.
- A second Compose file, override selector, profile selector, file picker, or automatic include/extends resolver. These are deferred and would change the privacy and completeness contract.
- A `version: 2` or `version: 3` mode selector. Current Compose Specification behavior is the single model, and top-level `version` is only an obsolete informational warning.
- A separate service `env_file` input. The optional environment textarea is only for interpolation analysis and must keep that distinction visible.
- A graph, tree, canonical YAML formatter, JSON converter, download, share action, chart, progress bar, security score, runtime badge, or decorative art. None answers the source-location repair question better than the structured result.
- Nested cards for the verdict, counts, findings, or summary. Use the workbench band, spacing, neutral borders, and section headings.
- A generic green `Valid YAML` result. YAML syntax is one layer, not the Compose answer.
- A claim that advisories prove a configuration is insecure, that images exist, that ports are free, or that an application is ready.
- Page-level horizontal overflow. Only diagnostic content owns wrapping, and it reflows into labeled blocks below 760px.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | hierarchy | The clean workbench shows one required Compose textarea first, one optional interpolation textarea second, one primary `Check Compose file` action, `Load example`, `Reset`, and no result. | Browser inspection at 320px and desktop |
| UI-002 | submission | Editing either textarea does not run validation; submit is explicit and the primary action is the only accent-filled action. | Browser event and computed-style assertion |
| UI-003 | labels | Both textareas have persistent visible labels, exact descriptions, realistic placeholders, and correct required/optional semantics. | DOM accessibility inspection |
| UI-004 | lead | Parsed results begin with one focusable answer region that distinguishes syntax failure, blocking model issues, incomplete model, and no blocking static issues. | Browser result-state fixtures |
| UI-005 | deduplication | Every parsed result exposes exactly the named rows `YAML syntax`, `Compose model`, and `Static advisories`, while exact counts appear only in the counts region. | Browser and DOM assertion |
| UI-006 | visual-truth | Counts for services, published ports, named volumes, networks, secrets, configs, profiles, interpolation tokens, errors, warnings, and advisories use exact labeled values rather than a chart or progress geometry and retain zero values. | Result fixture and DOM assertion |
| UI-007 | diagnostics | Every rendered finding exposes severity, stable code, layer, path, line/column when available, excerpt when available, message, and fix. | Diagnostic fixture and accessibility snapshot |
| UI-008 | responsive | At 320px and 375px diagnostic rows reflow into labeled blocks with no page-level horizontal overflow, clipped code, or hidden fix text. | Browser `scrollWidth` and screenshot assertions |
| UI-009 | model summary | The normalized model shows names, keys, dependency-edge count, interpolation states, completeness, and incomplete reasons without a graph or canonical output. | Result fixture and DOM assertion |
| UI-010 | provenance | Provenance and limitations appear after the answer, findings, and normalized summary in small metadata treatment. | DOM order and computed-style inspection |
| UI-011 | focus | Valid parsed submission focuses `#compose-result`; invalid input focuses the first invalid textarea; reset and example focus the Compose textarea; engine failure focuses its retry region. | Keyboard browser test |
| UI-012 | status | Copy success announces `Report copied`, copy failure announces `Copy failed`, input edits announce `Inputs changed`, and unsupported state announces `Shared inputs are not supported` without repeating messages. | Live-region browser test |
| UI-013 | recovery | Parse failures remove the previous result and keep both inputs; engine failures keep both inputs and expose `Try again`; reset clears both inputs and the result. | Browser state test |
| UI-014 | copy | `Copy report` copies schema version 1, engine version, counts, completeness, normalized summary, and all ordered diagnostics; it is never automatic. | Clipboard unit and browser test |
| UI-015 | URL | Clean canonical URL remains unchanged through hydration. A `state` query is not decoded, is removed alone, preserves unrelated parameters, and leaves clean inputs. | Browser history and URL assertion |
| UI-016 | privacy | The checker path makes no request containing input and does not read files, storage, cookies, analytics payloads, Docker, registry, or clipboard input. | Production-like request audit |
| UI-017 | dimensions | Textareas, buttons, result focus target, metrics, and diagnostic rows keep stable dimensions; actions do not shift when copy status changes. | Computed-style and screenshot checks |
| UI-018 | themes | Dark and light themes keep readable contrast for labels, field errors, severity words, code, excerpts, focus, and borders. | Theme screenshots and contrast inspection |
| UI-019 | omission | No graph, formatter, chart, security score, runtime badge, nested card, decorative art, file picker, or hidden live validation exists in the rendered workbench. | DOM and visual inspection |
| UI-020 | ownership | Route-specific layout and table reflow live in `docker-compose-checker.module.css`; no selectors are added to `app/globals.css`. | Static source inspection |

## Open questions and blockers

- None for the interface stage. The implementation stage supplies the approved YAML parser package version and schema snapshot identifier as provenance values, while preserving the labels, result fields, states, and ownership in this contract.
