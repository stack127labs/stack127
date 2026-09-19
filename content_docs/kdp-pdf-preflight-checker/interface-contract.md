# Interface contract: KDP PDF preflight checker

Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: KDP PDF preflight checker
Route: `/kdp-pdf-preflight-checker`
Mode: pipeline
Review scope: Contract refresh within the unfinished new-tool pipeline, using its ready research and product inputs. This refresh reviews planning and source evidence only. Runtime state operation, rendered component consistency, and final tool acceptance remain separate required checks.
Depends on: `brief.md`, `implementation-report.md`, `competitive-report.md`, and the supplied KDP tool planning
Input fingerprint: `brief.md sha256:e64182e5bed956814f1727c8c65f044ab1609a6d3709d6a430154e73cfed093c`
Input fingerprint: `implementation-report.md sha256:a1275b12d752c5d4836c302f9d8efd458c9e05090bb9c2b3dcd0222529c074ed`

## User task

- Primary user: A self-publishing author or formatter has a finished KDP interior or paperback cover PDF and wants to investigate a warning before uploading it again.
- Question: What measurable issue, if any, does this PDF have against the KDP configuration I selected?
- Lead answer: The report says `No measurable issues found` or gives the number of possible issues that need review, without promising KDP acceptance.
- Next decision: The user can replace the file or change the stated KDP configuration, then run the check again.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Selected PDF file | Which file will the checker inspect? | Browser `File` and in-memory bytes | input | The parser cannot run without a local file, and the filename helps identify the report. | Show the filename once in the input summary and once in report metadata only. Do not expose PDF text or bytes. |
| Check scope | Am I checking an interior or a paperback cover? | User choice | input | The scope changes expected dimensions, page-count handling, and the available configuration. | The lead summary names the scope; result regions do not restate the scope as a separate verdict. |
| Binding | Which binding supplies the trim and page-limit rules? | User choice and KDP specification table | input | Paperback and hardcover interiors have different supported combinations. A cover check is paperback-only in v1. | Show binding in the form and once in the result summary. Do not offer a hardcover cover formula. |
| Trim size | What page dimensions should the PDF use? | User choice resolved through `lib/kdp/specs.ts` | input | It changes every expected interior or paperback-cover dimension. | Exact trim values belong to the configuration summary and expected column, not a second metric card. |
| Interior and paper | Which KDP page-limit and spine rules apply? | User choices resolved through the KDP specification table | input | Ink and paper affect supported combinations, page limits, and paperback spine coefficients. | Show the selected values in the summary and the rule trace, not in repeated result headings. |
| Interior bleed | Does the interior use KDP's asymmetric bleed dimensions? | User choice and KDP bleed rule | input | It changes expected interior width and height. It is not shown for cover scope. | The geometry table owns the exact width and height additions. Do not repeat them in the lead. |
| Book page count for cover | Which final book count drives the paperback spine? | User-supplied even count | input | A cover PDF has one page, but its expected spine depends on the book's final page count. | Show the count in the cover configuration summary and spine recipe. Do not treat it as the PDF page count. |
| PDF page count | How many pages did the parser find? | Resolved page tree | supporting | It checks cover-file cardinality and interior range or parity while keeping the PDF count separate from a cover's book count. | One page-count row owns the measured count. Issue rows may name an out-of-range condition without repeating the count. |
| Expected dimensions | What size should each page or cover be? | Trim, bleed, spine, and KDP formulas | supporting | The user needs an explicit comparison target rather than a generic pass message. | The geometry table owns actual, expected, difference, and status values. |
| Possible issue count or clean result | Does the file need attention? | Ordered parser findings | lead | This is the user's first decision after the check. | No score, acceptance verdict, or second overall status may compete with this sentence. |
| Actionable issue queue | Which page or property should I inspect first? | Parser findings and stable finding codes | supporting | A short ordered list turns the lead into a next action. | It names the page or property and issue type. Full numeric comparisons remain in the geometry table. |
| Page geometry evidence | Which page differs from the expected or dominant size? | MediaBox values for every usable page | evidence | Repeated page rows are the clearest proof of mixed sizes or a dimension mismatch. | Do not rebuild exact geometry values in the issue queue or a summary card. |
| PDF diagnostic evidence | What can the PDF expose about boxes, fonts, images, content, encryption, and file structure? | Local PDF parser | evidence | It separates measured, not declared, not measured, and unknown properties so an unavailable check is not mistaken for a pass. | Each property has one row in the diagnostics table. Page geometry remains in its own table. |
| Paperback cover recipe | How did the checker derive the expected cover width, height, and spine? | KDP paperback formula and selected setup | supporting | The cover case has a real dependency between trim, spine, and bleed that is faster to follow as one labelled relationship. | Use one compact formula strip for cover scope only. Exact values still live in the result rows. |
| Ruleset and review boundary | Which source date and limits apply, and what remains outside this check? | KDP and Adobe sources plus engine metadata | evidence | A local parse cannot reproduce Print Previewer, manual review, font licensing, or every visible-ink condition. | Keep one quiet provenance line and one boundary sentence after the evidence. |
| Check PDF | When should the local analysis run? | Explicit user action | input | An explicit submit prevents a file selection or transient edit from producing an unexpected parse. | This is the only primary action. Do not add live checking or a second check button. |
| Reset | How do I return to a clean default? | Product defaults | input | It clears the file and report and restores the default interior configuration. | Reset is secondary and never appears as a result conclusion. |
| Copy and download report | How can I hand off the measured receipt? | Deterministic result serialization | evidence | A plain-text copy and local download preserve the facts without sending the PDF anywhere. | Keep both actions beside the lead, and do not show a second raw report block in the page. |
| Local processing status | Is the file being read locally, and is the result current? | UI state | supporting | The user needs privacy and freshness boundaries during selection, checking, and edits. | Use one status region. Result text carries the final boundary. |
| Raw PDF contents, previews, repair controls, and acceptance score | Can I see or fix the whole document here? | Available bytes or deferred capabilities | omit | They add privacy risk or imply visual and repair coverage that the parser does not prove. | Do not render the PDF, expose dictionary text, create thumbnails, or score acceptance. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | PDF file | required input | yes | No default; user selects a local PDF | visible | `ToolFileDropzone` with an explicit Choose PDF action, plus `ToolFileList` for the selected file state | It supplies the bytes to inspect, supports browse and drag-and-drop, and keeps local processing explicit before the check starts. | Full width first. Wrap a long filename inside the selected-file row. |
| 2 | Check scope | defaulted input | yes | `Interior` from the product default | visible | `ToolChoiceGroup` with `Interior` and `Paperback cover` | The scope changes the expected geometry and which fields are required. | Full width, wrapping radio choices before the configuration fields. |
| 3 | Binding | defaulted input | yes | `Paperback` from the product default | conditional | `ToolChoiceGroup` for interior scope; a fixed `Paperback` summary for cover scope | Hardcover interiors remain supported, but a hardcover cover formula is deliberately not offered. | Full width when interior is selected. Cover scope shows a short fixed binding line instead of a second choice. |
| 4 | Trim size | defaulted input | yes | `6 × 9 in` from the shared KDP preset table | visible | `ToolSelect` | It is the expected-size target for every supported scope. | Full width below scope and binding. The option list may overlay without widening the page. |
| 5 | Interior | defaulted input | yes | `Black and white` from the shared KDP preset table | visible | `ToolSelect` | It selects supported page limits and, for a paperback cover, the spine coefficient family. | Full width. Keep the complete label visible without a clipped select value. |
| 6 | Paper | defaulted input | yes | `White` from the shared KDP preset table | visible | `ToolSelect` | It changes supported page limits and paperback spine thickness. | Full width below interior. Unsupported combinations disappear when binding or interior changes. |
| 7 | Interior bleed | defaulted input | yes | `Without bleed` for the initial interior configuration | conditional | `ToolChoiceGroup` or `ToolSelect` shown only for interior scope | It changes the expected page width and height. A full cover always uses its own cover-bleed formula. | Full width below paper when interior is selected. Hide it for cover scope rather than leaving a disabled control. |
| 8 | Book page count | defaulted input for cover; derived for interior | yes for cover; no for interior | `300` for paperback cover; PDF page count for interior | conditional | `ToolNumberField` shown only for paperback cover scope | It drives the cover spine and must be a final even count within the selected KDP range. The interior count must come from the PDF. | Full width below paper in cover scope. Show the range and parity error directly below the field. |
| 9 | Check PDF | primary action | not applicable | No default | visible | `ToolButton` with submit semantics inside `ToolActionRow` | It starts one explicit local analysis and names the result the user will receive. | Full width after all visible configuration fields. Disable during parsing. |
| 10 | Reset | secondary action | not applicable | Product defaults | visible | `ToolButton` with reset semantics inside `ToolActionRow` | It is the recovery path when the user wants to discard the file and current report. | Full width or first in a wrapping action row, before the primary action in source order. |
| 11 | Copy report | secondary action | not applicable | Derived after a report exists | result | `ToolCopyAction` | It copies the deterministic report for handoff without reading the clipboard. | Full width below the lead on narrow screens. |
| 12 | Download report | secondary action | not applicable | Derived after a report exists | result | `ToolDownloadAction` | It saves the same deterministic report locally for review or support. | Full width below Copy report when actions stack. |

The clean canonical route stays `/kdp-pdf-preflight-checker` through first render and hydration. The checker does not serialize the file, filename, configuration, findings, or result into the URL, and it does not use browser storage. Selecting a file only displays its local name and size. Parsing begins after `Check PDF`.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Preflight lead | Does this PDF have measurable issues against the selected configuration? | Clean state or count of possible issues, file kind, and selected scope | One focusable `ToolResultLead` sentence, `No measurable issues found` or `3 possible issues need review.` | This is the only overall conclusion. Never use `accepted`, `will pass`, `ready for KDP`, a score, or a progress meter. |
| 2 | Issue queue | Which page or file property needs attention first? | Ordered possible findings with stable code, page or file target, and short recovery-oriented message | A page-owned ordered list directly below the lead. Keep each item concise and use semantic text for severity where it carries meaning. | The list names the target and issue type. It does not repeat the full actual, expected, or difference values owned by the geometry table. Hide it when there are no findings. |
| 3 | Page geometry | Which pages differ from the expected or dominant dimensions? | Page number, actual MediaBox, expected or dominant size, difference, and status for every readable page | `ToolDataTable` with real headers. The table viewport owns horizontal overflow; rows remain in PDF source order. | This is the only region for repeated exact page-size comparisons. Omit unreadable rows only when the diagnostics table records the missing measurement. |
| 4 | PDF diagnostics | What measurable properties does the file expose beyond page size? | Page count and parity, page boxes, font embedding, image DPI, content streams, empty-looking pages, encryption, EOF marker, and file size | A second labelled table or key-value group with states `measured`, `not declared`, `not measured`, `unknown`, or `possible issue`. | Do not turn an absent optional TrimBox or BleedBox into a failure. Do not claim a font license, safe area, or visual-ink verdict. |
| 5 | Paperback cover recipe | How did the checker derive the expected cover size? | Trim width and height, selected page count, spine coefficient, spine width, side and vertical bleed additions, and final expected width and height | A compact page-owned formula strip with labelled back, spine, front, and bleed relationships, clearly marked `not to scale`; exact values remain in the supporting rows. Show only for paperback cover scope. | It explains dependency, not a second verdict. No hardcover cover recipe appears. |
| 6 | Rule boundary and report actions | Which ruleset produced this report, and what still needs KDP review? | Engine version, KDP ruleset date, source links, local-processing boundary, KDP manual-review caveat, Copy report, and Download report | One quiet mono metadata line and one short boundary sentence after evidence, with secondary actions beside the lead or immediately below it. | Keep provenance once. Do not repeat the disclaimer after every finding or turn it into a large warning panel. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Page geometry table | Repeated pages share actual, expected, difference, and status fields | yes. Aligned columns encode exact comparisons without implying a score. | Use `ToolDataTable`; let its inner viewport own overflow on narrow screens. |
| Diagnostic table | Repeated PDF properties have a state and a measurable value or reason | yes. Rows align the same property, value, and state fields. | Use a semantic table or labelled key-value rows. Keep unknown and not-declared text explicit. |
| Paperback cover formula strip | Bleed, back, spine, and front contribute to one expected cover size | yes. The labelled segments show dependency, not a scale claim, and the strip is marked `not to scale`. | Use only for paperback cover scope. Keep exact dimensions in text rows and do not use proportional bar lengths. |
| Issue count chart or pass meter | A count of findings might look like progress toward acceptance | no. There is no trustworthy denominator and a clean parse cannot represent KDP acceptance. | Omit charts, meters, percentages, colored fills, and pass scores. Use the lead sentence and issue list. |
| PDF preview, thumbnail wall, or 3D cover | A rendered page would suggest visual and safe-area coverage | no. The parser does not prove every rendered object, margin, barcode, or manual-review condition. | Omit previews and mockups from v1. |
| Timeline or loading progress bar | Local parsing has no user-meaningful duration or known work denominator | no. Equal progress would imply a false completion measure. | Replace with one busy action label and a polite status message. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Default interior scope and KDP fields are visible; no file is selected; Check PDF and Reset are available. | Hidden | Hidden; no placeholder verdict. | No error. | Keep normal document focus. The clean route remains unchanged. |
| Empty or no-data | No file is selected after first load or Reset. Configuration remains editable. | Hidden | No result region. | Selecting a PDF is the next action. | Do not announce an error for an empty starting state. |
| Invalid configuration | File and drafted configuration remain visible. Cover page count, unsupported combination, missing file, and malformed values show field-level errors. | Hidden; remove any stale result | Hidden; do not preserve stale measurements. | Focus the first invalid control and show the exact allowed range or required action. | Announce one concise recovery message through the status or alert region. |
| Loading | Valid file and configuration remain visible. Check PDF is disabled against duplicate submission; Reset remains available. | Not applicable while parsing | No new result; no stale result is presented as current. | Local parser failure transitions to Failure while preserving inputs. | Announce `Checking PDF locally.` and keep focus on the busy action. |
| Clean success | The parser returns a readable file with no measurable findings. Inputs stay available for another check. | `No measurable issues found.` | Geometry and diagnostics show measured facts, and provenance keeps the KDP review boundary visible. | No acceptance wording. The user can edit, replace, or reset. | Move focus to the lead and announce it once. |
| Success with possible issues | The parser returns a readable report with one or more findings. Inputs stay available. | `N possible issues need review.` | Issue queue, geometry, diagnostics, and any cover recipe appear in reading order. | Each issue names a page or property. The user can change inputs or run the same check again. | Move focus to the lead and announce only the lead sentence. |
| Partial result | The file parses, but EOF, fonts, images, page boxes, or content properties are unresolved or unavailable. | Lead uses the measurable finding count or clean wording only; it never calls unknown checks a pass. | Measured facts remain visible. Every unresolved property says `unknown` or `not measured` with a reason. | Treat the report as bounded, not broken. The user can replace the file or inspect the named unknown. | Focus the lead and announce that some checks are unknown when that state exists. |
| Parse failure | The bytes are not a readable PDF, contain no usable pages, or fail a bounded local parse. | Hidden; no stale result remains visible. | One failure message names the local recovery action. | Keep file and configuration so the user can choose another PDF or retry. Do not expose PDF contents. | Focus the failure message and announce `The PDF could not be checked locally.` |
| Retry | A parse failure or a changed file can be checked again with the same primary action. | Hidden until the retry completes | Previous failure message remains until the user submits again, then the loading state replaces it. | Keep selected configuration and file when retrying; allow file replacement without a page reload. | Focus stays on Check PDF after activation; announce loading once. |
| Stale-input | Any scope, binding, trim, interior, paper, bleed, page-count, or file edit occurs after a result. | Remove the old lead immediately. | Remove old issue, geometry, diagnostic, and formula regions. | Status says `Inputs changed. Check again.` | Keep focus on the edited control and announce the stale-result change politely. |
| Expanded evidence | The report contains long diagnostic values or a raw copied report. | Lead remains unchanged. | Tables or owned evidence viewports expose complete values without hiding the property state. There is no second acceptance summary. | Close or scroll the inner evidence region without losing the result. | Preserve keyboard position and keep overflow inside the table or raw-output owner. |
| Reset complete | The user activates Reset from any non-loading state. | Hidden | File, report, status, and conditional cover fields return to the initial defaults. | Clear the native file input and return focus to the visible Choose PDF action. | Announce `Checker reset.` and focus Choose PDF. |

## Optional mode and state visibility

- Control mode: single
- Reason: File, scope, compatible print options, and the active bleed or cover-page-count input stay visible. Interior and cover scopes are different checks, not expertise modes.
- Shared engine and normalized input mapping: The existing preflight flow derives expected geometry from the setup adapter and passes it with local PDF bytes to analyzeKdpPdf. No second calculation path or alternate rules are introduced.
- Active assumptions: Keep required and defaulted result-driving values in the input flow described above. Conditional fields appear beside the choice that activates them, before submission.
- Retention and recovery: Evidence expansion never changes input or result state. Retain edited values until the existing Reset, example, or branch action explicitly replaces them. Reveal and focus any invalid active conditional field; no collapsed region may hide a blocking error.
- URL, reload, and history restoration: Preserve the URL contract and existing explicit restoration behavior below. A clean canonical load must remain unchanged through hydration; this mode decision adds no query, storage, or history writes.
- Equivalent-input parity: There is one input model and one engine. A basic/advanced parity fixture is not applicable; disclosure state must not alter normalized inputs or computed output.

## Component contract

- Generic or native-looking fallback allowed: no
- Inspection: shared implementations in `app/tool-ui`, the source for `/tool-ui-lab`, this route, and sibling patterns in `/kdp-book-setup-calculator`, `/kdp-royalty-calculator`, and `/kdp-pdf-preflight-checker`. This is source inspection, not a new rendered-state verification receipt.
- Native form, input, radio, table, and file semantics may remain underneath the approved stack127 presentation. Missing behavior must receive a complete shared or justified route-specific contract; it must not become a bare native control, generic upload box, or unrelated dashboard component.
- All rows use `--text-body`, `--color-text`, `--color-border`, `--radius`, `--space-*`, and `--focus-ring` as applicable. Only metadata uses `--text-small`. Keep one accent primary action, semantic status text, both themes, and no colored left edges.
- Route-specific choices retain the behavioral reason in their row and use the existing route stylesheet. They do not introduce new controls or public behavior. Shared components own their internal appearance; route styles own placement and any stated reflow.

| Need | Existing component inspected | Disposition | Chosen component | States, accessibility, responsive behavior, and tokens | Why it fits; rejected alternative |
| --- | --- | --- | --- | --- | --- |
| Local PDF selection | `ToolFileDropzone`, `ToolFileList` in `app/tool-ui/tool-uploads.tsx` | reuse shared | `ToolFileDropzone` with a visible Choose PDF button and `ToolFileList` | Browse and drag/drop select one local PDF; show name, size, checking, ready, and rejection state. Remove clears stale output; retry reruns explicitly. Announce rejection, retain browse focus, wrap long filenames, and show no invented upload progress. Use shared upload tokens. | The shared components preserve the native file picker, add drag-and-drop, validate type and size, and expose selected, checking, ready, and error states without uploading the file. Rejected: A drag-and-drop-only zone would hide the required browse action. The shared component keeps both paths visible. |
| Scope and binding choices | `ToolChoiceGroup` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolChoiceGroup` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | Two short, high-impact choices are easier to scan when the selected state is visible and keyboard accessible. Rejected: A tab bar would imply separate tools, and a custom segmented control would duplicate native radio behavior. |
| Trim, interior, and paper presets | `ToolSelect` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolSelect` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | These are bounded source-backed option sets that need filtering when binding or ink changes. Rejected: Free-text fields would permit unsupported combinations and make the formula source unclear. |
| Bleed choice | `ToolChoiceGroup`, `ToolSelect` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolChoiceGroup` or `ToolSelect` shown only for interior scope | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | It keeps the binary geometry choice explicit without offering an irrelevant cover toggle. Rejected: A disabled bleed control on cover scope suggests that the interior formula still applies to the cover. |
| Cover page count | `ToolNumberField` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolNumberField` | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | It needs integer, evenness, and selected-KDP-range validation while remaining editable. Rejected: A text field would make numeric recovery weaker; an interior page-count field would duplicate parser output. |
| Form actions and reset | `ToolActionRow`, `ToolButton` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolActionRow` with `ToolButton` | One submit is primary. Keyboard activation, disabled or busy state, and reset retain clear labels and visible focus. Keep input after failure and stack actions at narrow widths. Use shared button tokens. | Shared buttons provide one accent primary action, a secondary reset, submit semantics, and consistent focus states. Rejected: Live-on-change checking and multiple primary buttons make file analysis unpredictable. |
| Current processing and blocking errors | `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolStatus` plus field-level errors | Expose textual status and one concise live announcement. Keep recovery beside its input; no duplicate alert. Long messages wrap and status uses semantic text color only. | One status region can announce local progress or recovery, while the field retains the exact invalid value and correction. Rejected: A colored full-width callout or repeated alert text would compete with the next action. |
| Lead answer | `ToolResultLead` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolResultLead` in a focusable result section | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | A sentence can say possible issue without implying acceptance or a false score. Rejected: `ToolPrimaryResult`, a badge, or a pass meter would turn a bounded report into a verdict. |
| Issue queue | `ToolDataTable`, `ToolKeyValueList`, and `ToolDisclosure` in `app/tool-ui/tool-controls.tsx`; current route markup | route-specific | Page-owned ordered list | Preserve semantic headings, lists, or figures and the route-specific relationship described here. No interactive element loses its label or visible focus. Wrap long text, keep exact data accessible, and use site text, border, spacing, and focus tokens. | Findings are an action queue, not repeated metrics. A list can name page or file targets without inventing geometry. Rejected: A second table would repeat the geometry evidence and a card per issue would flatten severity and page context. |
| Repeated page facts | `ToolDataTable` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolDataTable` with real headers | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | Page rows share comparable fields, and the component provides a bounded table viewport. Rejected: Equal cards would repeat labels and make mixed-page comparison slower. |
| Diagnostics with unknown states | `ToolKeyValueList` in `app/tool-ui/tool-controls.tsx` | reuse shared | Page-owned semantic table or `ToolKeyValueList` | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | The properties have different value shapes, but each needs a visible state and reason. Rejected: A success-only checklist would hide unknown and not-declared distinctions. |
| Paperback cover dependency | `ToolDataTable`, `ToolKeyValueList`, and `ToolDisclosure` in `app/tool-ui/tool-controls.tsx`; current route markup | route-specific | Page-owned labelled formula strip | Preserve semantic headings, lists, or figures and the route-specific relationship described here. No interactive element loses its label or visible focus. Wrap long text, keep exact data accessible, and use site text, border, spacing, and focus tokens. | A small relationship view explains back, spine, front, and bleed while exact values remain textual and the strip is not to scale. Rejected: Marker art, a proportional chart, or a 3D mockup would imply geometry or rendering accuracy the parser cannot prove. |
| Report handoff | `ToolCopyAction`, `ToolDownloadAction` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolCopyAction` and `ToolDownloadAction` | Actions are explicit and keyboard accessible. Copy success follows a confirmed write; failure keeps text selectable. Downloads use the current report. Preserve focus, label actions, and wrap at narrow widths. Use secondary shared button tokens. | They keep deterministic output available without server processing or clipboard reads. Rejected: A share URL cannot restore a local File, and an always-open raw report would duplicate the evidence. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop beside the sidebar, at least 1024px | Full-width tool band. Form order is file, scope, conditional binding, trim, interior, paper, conditional bleed or book count, actions. Result order is lead, handoff actions, issue queue, geometry, diagnostics, cover recipe when relevant, provenance. | `my-very-long-paperback-interior-final-v12-with-bleed.pdf`, 999 pages, `6.1250 × 9.2500 in`, and a long unknown-property reason. | The geometry and diagnostic table viewports own horizontal overflow. The page does not scroll horizontally. |
| Tablet, 760px to 1023px | Keep the same source order. Use a two-column field grid only when labels and selected values remain readable; stack file, actions, lead, and result regions. | A long trim label and a full `unknown because the placement transform could not be resolved` message. | Table wrappers own overflow; filename and issue text wrap in their own regions. |
| Narrow mobile, 320px to 390px | Stack every input and action. Scope choices wrap, cover-only fields appear directly after paper, and results read lead, actions, issues, geometry, diagnostics, cover recipe, provenance. | The long PDF filename, `Page 999`, actual and expected dimensions, and a full source link label. | Table wrappers own horizontal scrolling. Long text wraps. No page-level horizontal overflow. |
| 200% zoom or long translated labels | Controls grow vertically, selected options remain visible, and the action row wraps without changing primary-action order. Result tables become labelled row blocks or an inner scroller. | `Paperback cover`, `Black and white`, and a full blocking validation message. | The workbench grows vertically. Only the table or raw evidence viewport may scroll horizontally. |

## Interface wireframes

### Desktop result

```text
KDP PDF preflight checker

PDF file
[Choose file]  my-very-long-paperback-interior-final-v12-with-bleed.pdf
The file stays in this browser.

Check scope
( Interior )  ( Paperback cover )
Binding             [ Paperback                         ]
Trim size           [ 6 × 9 in                           ]
Interior            [ Black and white                    ]
Paper               [ White                               ]
Bleed               ( Without bleed )  ( With bleed )

[ Reset ]  [ Check PDF ]
Status: Checked locally.
-----------------------------------------------------------------------
3 possible issues need review.
interior.pdf · 302 pages · Interior · 6 × 9 in · bleed on
[ Copy report ]  [ Download report ]

Issues to review
1. Page 12 has a MediaBox size mismatch.
2. Font embedding could not be measured on page 88.
3. The PDF has no EOF marker in its final bytes.

Page geometry
Page   Actual MediaBox       Expected             Difference    Status
1      6.1250 × 9.2500 in    6.1250 × 9.2500 in   0.0000        Measured
12     6.0000 × 9.0000 in    6.1250 × 9.2500 in   -0.125/-0.25   Possible issue

PDF diagnostics
Page count       302, even
CropBox          Defaulted to MediaBox
TrimBox          Not declared
Fonts            87 embedded, 1 unknown
Images           14 measurable, 2 not measured
Empty pages      None measurable
Encryption       No

KDP rules checked 2026-09-16 · Engine kdp-pdf-preflight-1.0.0
KDP review can find issues this local report cannot.
```

### Narrow mobile result

```text
KDP PDF preflight checker

PDF file
[Choose file]
my-very-long-paperback-interior-final-
v12-with-bleed.pdf

Check scope
( Interior )
( Paperback cover )
Binding
[ Paperback ]
Trim size
[ 6 × 9 in ]
Interior
[ Black and white ]
Paper
[ White ]
Bleed
( Without bleed )
( With bleed )

[ Reset ]
[ Check PDF ]
----------------------------------------------------------------
3 possible issues need review.
interior.pdf · 302 pages · bleed on
[ Copy report ]
[ Download report ]

Issues to review
Page 12 · MediaBox size mismatch
Page 88 · Font embedding unknown
File · EOF marker missing

Page geometry
Page 12
Actual: 6.0000 × 9.0000 in
Expected: 6.1250 × 9.2500 in
Difference: -0.125/-0.25 in
Status: Possible issue

PDF diagnostics
Page count: 302, even
TrimBox: Not declared
Images: 2 not measured

KDP review can find issues this report cannot.
```

### Cover configuration and result

```text
Check scope
( Interior )  ( Paperback cover )
Binding: Paperback
Trim size [ 6 × 9 in ]
Interior  [ Black and white ]
Paper     [ White ]
Book page count [ 300 ]

Expected paperback cover
back 6.0000 in + spine 0.6756 in + front 6.0000 in
+ two side bleeds 0.2500 in = 12.9256 in wide
trim height 9.0000 in + vertical bleed 0.2500 in = 9.2500 in high
```

### Initial, invalid, loading, empty, partial, failure, retry, and expanded states

```text
Initial or empty
PDF file [Choose file]
No report yet. Choose a PDF, then check it locally.

Invalid cover configuration
Book page count [ 23 ]
Enter an even count from 24 to the selected KDP maximum.
[ Check PDF ]
The old report is hidden.

Checking locally
paperback-cover.pdf
[ Checking PDF... ]
The action is disabled until the local check finishes.

Parse failure and retry
The PDF could not be checked locally. Choose another PDF or try again.
[ Try again ]
Your configuration is still here.

Partial report
Some properties are unknown.
Measured: 302 pages, page boxes, and dimensions.
Unknown: image placement transform on page 88.

Expanded evidence
The full diagnostic value stays inside its table or raw-output viewport.
The page itself does not gain horizontal overflow.
```

## Removed or rejected

- Remove the current prototype's always-visible interior page-count field. Interior count comes from the parsed PDF; only paperback cover scope asks for the final book page count.
- Remove any hardcover cover option or inferred hardcover cover formula. Hardcover interior checks remain available, but cover scope is paperback-only until an official closed geometry rule is available.
- Remove automatic checking on file selection. Selection may show the local filename and size, but parsing starts only after `Check PDF`.
- Remove acceptance language such as `pass`, `accepted`, `ready for KDP`, or `will be accepted`. Use `No measurable issues found`, `possible issue`, `unknown`, and `not measured`.
- Remove a global score, percentage, progress bar, or equal-weight metric-card dashboard. The result is a bounded evidence report, not a KDP readiness score.
- Remove PDF rendering, page thumbnails, 3D mockups, automatic repair, safe-area overlays, and visual-ink claims from v1. They imply coverage the parser cannot prove.
- Remove permanent raw PDF text, dictionary dumps, or file uploads. Keep bytes in memory and expose only typed, deterministic findings.
- Remove a second primary action, live server fallback, sign-in, email capture, cross-sells, and share URLs. A local file cannot be restored from a URL.
- Remove repeated exact geometry from issue rows when the geometry table already owns actual, expected, and difference values.
- Remove a large warning panel with a colored edge. Use the lead, semantic status text, and one quiet review-boundary sentence.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | After a successful check, one focusable lead appears before evidence and says either `No measurable issues found` or a count of possible issues. It never promises KDP acceptance. | Browser result assertions and manual reading-order inspection |
| UI-002 | deduplication | The issue queue names each target and issue type, while the geometry table owns exact actual, expected, and difference values. No second summary repeats those full values. | Browser DOM inspection of issue and geometry regions |
| UI-003 | visual-truth | Page comparisons use rows and columns, and the paperback cover recipe is labelled not to scale. No chart, meter, preview, or colored fill implies acceptance or measurable progress. | Interface inspection and visual truth review |
| UI-004 | responsive | At 320px, 375px, 760px, and desktop widths, controls and result regions stay in source order, long values wrap or use an inner table viewport, and the document has no horizontal overflow. | Browser viewport measurements in both themes |
| UI-005 | url | Opening `/kdp-pdf-preflight-checker` leaves the clean URL unchanged through hydration, and file, configuration, and result values never enter the URL or browser storage. | Browser history, URL, and storage assertions |
| UI-006 | state | Invalid input focuses the first recovery control, loading disables duplicate submission, completion focuses the lead, and parse failure keeps inputs available for retry or replacement. | Browser keyboard and live-region assertions |
| UI-007 | local processing | Selecting a file does not trigger a request, and Check PDF produces a report from in-memory bytes without server upload or clipboard reads. | Browser request log and component inspection |
| UI-008 | unknown boundary | Partial results keep measured facts visible and label unresolved checks as `unknown`, `not measured`, or `not declared`; missing optional boxes do not become automatic failures. | Fixture result assertions and rendered diagnostic inspection |

| UI-009 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

- None for the v1 interface contract. The paperback-only cover scope and deferred hardcover cover geometry are deliberate product decisions recorded in the implementation report.
- If the parser cannot resolve a property, the interface must retain the `unknown` state and the builder must update the edge-case plan before widening the claim.
- Publication remains separate. This contract does not authorize a database row, sitemap inclusion, or public release.
