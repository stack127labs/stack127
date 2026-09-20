# Interface contract: KDP page count estimator

Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: KDP page count estimator
Route: `/kdp-page-count-estimator`
Mode: pipeline
Review scope: Contract refresh within the unfinished new-tool pipeline, using its ready research and product inputs. This refresh reviews planning and source evidence only. Runtime state operation, rendered component consistency, and final tool acceptance remain separate required checks.
Depends on: `brief.md`, `implementation-report.md`

## User task

- Primary user: A self-publishing author or formatter with a word count and a rough paperback layout, but no final typeset PDF.
- Question: What paperback page range should I plan for with this word count and layout?
- Lead answer: A low to high estimated print-page range after KDP-style even-page rounding.
- Next decision: Keep the trim and layout assumptions for cover planning, or revise them before typesetting.

The result is a planning estimate. The submitted interior file remains the source of the final KDP page count.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Word count | How much body text needs a page estimate? | User input | input | It is the main quantity the typography model converts into body pages. | Show it once as the first field and do not repeat it in the result as a second input summary. |
| Paperback trim size | Which page width and height should the model use? | User input and `lib/kdp/specs.ts` | input | Trim changes text capacity and is a core planning decision. | Show the selected trim in the form and once in the model details. |
| Font width class | How wide should the model treat the typeface? | User input and local model constants | input | KDP does not publish named-font metrics, so a width class makes the assumption explicit. | Call it a width class, not an exact installed font. |
| Font size | How tall and wide is each line of body text? | User input | input | It changes both characters per line and lines per page. | Show it once in the typography group and once in the model details only when interpreting the result. |
| Line spacing | How much vertical space does each line use? | User input | input | It changes the number of lines available on each page. | Do not add a separate density preset that restates the value. |
| Inside margin | How much gutter space does the text block leave? | User input | input | It changes text width and can be compared with KDP's page bands. | Keep the value visible; do not silently replace it with a KDP default. |
| Outside margin | How much outer edge space does the text block leave? | User input | input | It changes text width and remains independent from the gutter. | Do not combine it into an unlabeled `normal margins` preset. |
| Top and bottom margin | How much vertical space does the text block leave? | User input | input | It changes lines per page. One value keeps the first version small and clear. | Show one labelled field and describe it as applying to both edges. |
| Chapter starts | How many chapter-opening pages should the plan allow? | User input | input | It accounts for a known page addition without pretending to place real chapter headings. | Show it once in the added-pages group and once in the additions table. |
| Image or table pages | How many full pages will visual material occupy? | User input | input | The word model cannot infer artwork, tables, or layout-breaking images. | Keep it separate from body text and from front or back matter. |
| Front matter pages | How many opening pages should the plan allow? | User input | input | It changes the total without changing body-text capacity. | Show it once in the added-pages table, not as a generic `other pages` total only. |
| Back matter pages | How many closing pages should the plan allow? | User input | input | It changes the total without changing body-text capacity. | Show it once in the added-pages table, not as a generic `other pages` total only. |
| Calculate page range | What action produces the estimate? | Local synchronous engine | input | An explicit submit gives the user a stable answer while several related inputs are being edited. | This is the only primary action. |
| Reset | How can I return to the documented defaults? | Local form state | input | It provides predictable recovery without clearing the page or changing the URL. | Render one Reset action beside the primary action only. |
| Total page range | What page range should I plan around? | `estimateKdpPageCount` total pages | lead | This is the one answer the user came to get. | Render it once as the dominant result. |
| Range midpoint | What single planning anchor sits inside the range? | Rounded midpoint of displayed total range | supporting | It helps with early cover or pricing discussions without replacing the range. | Keep it as detail under the lead, never as a second primary result. |
| Body text range and added-page total | How much of the total comes from text versus planned additions? | Engine text pages and addition sum | supporting | This explains the main source of uncertainty without repeating every addition row. | Show the total additions here, then show its parts in the next region. |
| Added-page parts | Which allowances create the non-body pages? | Engine addition fields | supporting | Repeated page categories are easier to audit as rows. | Do not also render a separate `other pages` metric. |
| Words per page and text-block capacity | What typography assumptions produced the body range? | Engine model values | supporting | These values let a formatter test the inputs instead of trusting a hidden coefficient. | Keep all model measurements in one region. |
| KDP minimum and inside-margin bands | Which official page rules affect this plan? | `lib/kdp/specs.ts` and KDP guidance | evidence | The rules qualify the estimate and can change the next formatting decision. | Do not present them as a universal maximum or an acceptance verdict. |
| Final-file authority | Which number does KDP ultimately use? | KDP submission guidance | evidence | It prevents the estimate from sounding like a typesetting or acceptance promise. | State it beside KDP guidance and once in supporting content, not in every result row. |
| Formula version and source links | What contract supports this estimate? | Engine version and official source links | evidence | A compact receipt makes the local assumptions and KDP facts auditable. | Keep it inside one collapsed calculation-details disclosure. |
| Binding, ink, and paper selection | Which other print format is being estimated? | Deferred product scope | omit | Version 1 is paperback-oriented and cannot show format-specific limits without these choices. | Do not add hidden defaults or a false universal maximum. |
| Custom trim dimensions | Can I estimate a size outside the supported KDP presets? | Deferred product scope | omit | The product contract uses supported paperback presets only. | Do not add width and height inputs beside the preset selector. |
| Share URL, saved inputs, and export | How do I persist this estimate? | Deferred product scope | omit | The first version is browser-local and has no share or storage contract. | Keep the canonical route clean and do not add a save action. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Word count | Defaulted input; required for a meaningful estimate | yes | `getKdpPageCountDefaults` uses `50,000` | Visible first in the Manuscript group | `ToolNumberField` with whole-number step and word-count label | It is the main user quantity and should be the first thing the eye finds. | Full width before every other field. |
| 2 | Trim size | Defaulted input | yes | `getKdpPageCountDefaults` uses `6 × 9 in` | Visible in the Manuscript group | `ToolSelect` | The selected page dimensions change capacity and must not be hidden. | Full width with the complete trim label. |
| 3 | Font width | Defaulted input | yes | `getKdpPageCountDefaults` uses `Serif` | Visible in the Typography and margins group | `ToolChoiceGroup` with Serif, Sans, and Monospaced | All three model choices are common enough to compare directly; the label must not imply a named-font calculation. | Choices wrap as authored labels; each remains a full hit target. |
| 4 | Font size | Defaulted input | yes | `getKdpPageCountDefaults` uses `11 pt` | Visible in the Typography and margins group | `ToolNumberField` with `pt` suffix | It changes both line height and character capacity. | Full width with the suffix kept beside the value. |
| 5 | Line spacing | Defaulted input | yes | `getKdpPageCountDefaults` uses `1.15` | Visible in the Typography and margins group | `ToolNumberField` with decimal step | It is a direct model assumption, not a hidden style preset. | Full width. |
| 6 | Inside margin | Defaulted input | yes | `getKdpPageCountDefaults` uses `0.5 in` | Visible in the Typography and margins group | `ToolNumberField` with `in` suffix | It affects the text block and the KDP gutter comparison. | Full width. |
| 7 | Outside margin | Defaulted input | yes | `getKdpPageCountDefaults` uses `0.375 in` | Visible in the Typography and margins group | `ToolNumberField` with `in` suffix | It is a separate horizontal constraint and must not disappear into a margin preset. | Full width. |
| 8 | Top and bottom margin | Defaulted input | yes | `getKdpPageCountDefaults` uses `0.75 in` | Visible in the Typography and margins group | `ToolNumberField` with `in` suffix | It controls vertical capacity while keeping the first version compact. | Full width. |
| 9 | Chapter starts | Defaulted input | yes | `getKdpPageCountDefaults` uses `20` | Visible in the Added pages group | `ToolNumberField` with whole-page step | It makes the local chapter-opening allowance explicit. | Full width. |
| 10 | Image or table pages | Defaulted input | yes | `getKdpPageCountDefaults` uses `0` | Visible in the Added pages group | `ToolNumberField` with whole-page step | It covers layout-breaking visual pages the word model cannot infer. | Full width. |
| 11 | Front matter pages | Defaulted input | yes | `getKdpPageCountDefaults` uses `4` | Visible in the Added pages group | `ToolNumberField` with whole-page step | It keeps opening matter separate from body text. | Full width. |
| 12 | Back matter pages | Defaulted input | yes | `getKdpPageCountDefaults` uses `2` | Visible in the Added pages group | `ToolNumberField` with whole-page step | It keeps closing matter separate from body text. | Full width. |
| 13 | Calculate page range | Primary action | not applicable | No default | Visible after all input groups in `ToolActionRow` | `ToolButton` with primary variant | It is the one action that produces a new answer. Enter in any form control submits the same action. | Full width and first in the stacked action row. |
| 14 | Reset | Secondary action | not applicable | No default | Visible beside the primary action on wide screens and after it on narrow screens | `ToolButton` with secondary or ghost variant | It restores the documented defaults and clears the result without changing the URL. | Full width below Calculate page range. |

All result-driving defaults stay visible. No required or defaulted value belongs in a disclosure. Field errors sit below their control, preserve the entered value, and prevent a result from rendering.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Estimated print pages | What paperback page range should I plan around? | `totalPages.min`, `totalPages.max`, and the displayed range midpoint | One focusable result section with one `ToolPrimaryResult` labelled `Estimated print pages`. The range is the only dominant value. The midpoint appears as a short detail below it. | Do not pair a `ToolResultLead` sentence with the same range. Do not render the range again in a metric row. |
| 2 | Page anatomy | How much of the estimate is body text and how much is added pages? | `textPages`, `addedPages.total`, and selected trim | `ToolKeyValueList` directly below the lead with rows for `Body text`, `Added pages`, and `Trim size`. | The added-page total may appear here because it answers the body-versus-additions relationship. Its four parts belong only in the next region. |
| 3 | Added pages | Which assumptions create the non-body pages? | Chapter starts, image or table pages, front matter, and back matter | `ToolDataTable` with one row per category and columns `Part` and `Pages`, preserving the form's order. | Do not add a second `Other pages` row or a proportional bar. The table owns the exact breakdown. |
| 4 | Typography model | What text-capacity assumptions produced the body range? | Low and high words per page, text-block width and height, characters per line, lines per page, font width, font size, line spacing, and margins | A compact `ToolKeyValueList`, with model values grouped under one heading. Use plain values, not a chart. | Keep model measurements together. Do not repeat them in the lead or in the added-pages table. |
| 5 | KDP guidance | Which official page rules should affect my next formatting decision? | Paperback minimum, KDP inside-margin bands touched by the range, above-table warning when applicable, even-page rule, and final-file authority | A short guidance section with a semantic warning only when needed, a compact band table when more than one band is touched, and one final-file sentence. | This is guidance, not a green pass. Never show a universal paperback maximum or claim KDP acceptance. |
| 6 | Calculation details | What does this model assume and leave out? | Formula assumptions, one-page chapter allowance, local calculation version, official KDP source links, and excluded layout behavior | One collapsed `ToolDisclosure` labelled `Calculation details`. Open content uses a short ordered list and source links. | Keep method and provenance out of the first-screen lead. Do not repeat the KDP guidance table inside the disclosure. |

Read alone, the result says: `100 to 138 pages` is the planning range. The anatomy separates body pages from additions, the additions table shows what the user supplied, the typography model exposes the capacity assumptions, and KDP guidance explains the limits of the estimate.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Dominant page-range value | One planning answer should outrank its assumptions. | Not applicable. This is hierarchy, not quantity geometry. | Use `ToolPrimaryResult` and no second range sentence. |
| Added-pages table | Four repeated page allowances contribute to one added-page total. | Yes. Rows preserve the same fields and exact integer values without inventing proportions. | Use `ToolDataTable`. |
| KDP inside-margin band table | Each touched page interval maps to one published minimum inside margin. | Yes. Repeated interval and margin columns encode a real mapping. | Use only when the range touches more than one band. |
| Typography model values | Text-block dimensions and capacity explain the formula inputs. | No. A bar would imply a comparison or scale that the result does not need. | Replace a chart with `ToolKeyValueList`; omit any bar. |
| Progress bar | Completion toward a bounded target. | No. The estimator has no progress denominator. | Omit it. |
| Timeline | A time-ordered process. | No. Pagination has no time axis. | Omit it. |
| Page-count comparison chart | Nearby trims or styles ranked by page count. | No. Version 1 estimates one selected layout and a chart would add an unrequested comparison task. | Omit it. |
| Marker art or conceptual book diagram | A vague explanation of pagination. | No. Exact page relationships are clearer as values and tables. | Omit it from the workbench. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | All documented defaults are visible. Calculate page range and Reset are available. | Absent | No result region or empty placeholder | None | No automatic focus or announcement. The clean route stays unchanged. |
| Edited after a result | Preserve every field value while the user edits any result-driving control. | Clear the old range immediately | Clear anatomy, tables, guidance, and calculation details | No stale warning or copy state remains | Keep focus on the edited control and remove the old live announcement. |
| Invalid submit | Keep all entered values and submit the current form. | Absent | Absent | Show one field-associated error per invalid input and one concise form status. | Focus the first invalid control and announce the recovery once. |
| Valid calculation | Keep the form visible and render the current result. | Show the low to high range once as the dominant value | Show anatomy, additions, model, guidance, and collapsed details in that order | None | Focus the result section or its heading and announce the range once. |
| Valid calculation with a KDP warning | Keep the valid estimate and all inputs. | Keep the range usable and neutral | Place a non-blocking warning in KDP guidance for a below-minimum or above-table range, or explain a crossed band | The warning does not become an error and does not hide valid values | Announce the range, then let the visible warning be read in source order. |
| Zero-word estimate | Accept zero words with any valid added-page counts. | Show a zero body range and the even-rounded total created by added pages | Keep the additions table and KDP guidance visible | Do not invent body pages or show a no-data error | Announce the valid result like any other calculation. |
| Calculating | The engine is synchronous and browser-local. Keep controls stable during the event. | No separate loading result | No spinner, skeleton, or progress bar | Not applicable | No loading announcement. Avoid a fake network state. |
| Empty or no-data | Before first submit, the form has no result. Zero words is a valid estimate, not an empty failure. | Absent before submit | Absent before submit | The Calculate page range action is the recovery from the clean state. | No empty-result panel or unsolicited message. |
| Partial result | The formula validates all inputs before returning values. | Absent | Absent | Suppress all derived regions when validation fails; never show a partly calculated range. | Follow invalid-submit focus and announcement rules. |
| Unexpected failure | Preserve inputs and keep Calculate page range available. | Absent or remove stale result | Absent or remove stale supporting regions | Show `Calculation failed. Try again.` and let the same primary action retry. | Focus the failure status once and announce it without clearing inputs. |
| Retry after failure | The user submits the unchanged or corrected form again. | Recalculate from current inputs | Render the full success or invalid state only after the new result | Do not require Reset to recover. | Use the normal success or invalid focus rule. |
| Expanded calculation details | Inputs and result values stay unchanged while the disclosure opens. | Unchanged | Formula assumptions and sources appear below the guidance | Close the native disclosure without losing result state. | Keep focus on the disclosure trigger and do not announce the unchanged range again. |
| Query or stored state present | Ignore unsupported query and storage state in version 1. | Absent on a clean load | Defaults remain visible | Do not restore an uncontracted result or write state back to the URL. | No forced focus. Keep the canonical URL unchanged. |

## Optional mode and state visibility

- Control mode: disclosure
- Reason: Word count, trim, font class, typography, margins, and page additions all affect the range and stay visible. Calculation details is an evidence disclosure.
- Shared engine and normalized input mapping: The page-count adapter receives the same complete typography and additions input object. No second calculation path or alternate rules are introduced.
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
| Whole and decimal numeric inputs | `ToolNumberField` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolNumberField` with explicit min, max, step, and suffixes | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | It preserves shared labels, step controls, field errors, and keyboard behavior for bounded numeric assumptions. Rejected: Page-owned number controls would repeat shared semantics and drift from the tool family. |
| Supported trim choices | `ToolSelect` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolSelect` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | The paperback trim list is long enough that a select is clearer than a wall of radio choices while the active value remains visible. Rejected: A free-text trim field would create unsupported custom dimensions and false precision. |
| Font width choices | `ToolChoiceGroup` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolChoiceGroup` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | Serif, Sans, and Monospaced are three important model assumptions that should be visible together. Rejected: A named-font selector would imply measurements the engine does not own. |
| Input grouping | `ToolDataTable`, `ToolKeyValueList`, and `ToolDisclosure` in `app/tool-ui/tool-controls.tsx`; current route markup | route-specific | Page-owned headings or fieldsets using the shared grid | Preserve semantic headings, lists, or figures and the route-specific relationship described here. No interactive element loses its label or visible focus. Wrap long text, keep exact data accessible, and use site text, border, spacing, and focus tokens. | Manuscript, Typography and margins, and Added pages are real task groups without adding another panel or card. Rejected: Nested cards and decorative labels would fragment one workbench. |
| Form actions | `ToolActionRow`, `ToolButton` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolActionRow` with `ToolButton` | One submit is primary. Keyboard activation, disabled or busy state, and reset retain clear labels and visible focus. Keep input after failure and stack actions at narrow widths. Use shared button tokens. | It keeps Calculate page range as the only primary action and gives Reset a quieter treatment. Rejected: Two primary buttons or a recalculating-on-every-keystroke form would blur the task. |
| Lead answer | `ToolPrimaryResult` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolPrimaryResult` inside a focusable result section | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | One range needs clear hierarchy and a stable focus target after submit. Rejected: `ToolResultLead` plus `ToolPrimaryResult` would render the same range twice. |
| Supporting relationships | `ToolKeyValueList` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolKeyValueList` | Use semantic labels and exact values with explicit unknowns. Supporting facts follow the lead, retain source order, and stack at narrow widths. Use shared text and metadata tokens. | Body text, added pages, trim, and model measurements are labelled values, not repeated records. Rejected: Equal-weight metric cards would repeat the lead and make assumptions look like separate answers. |
| Repeated additions and gutter bands | `ToolDataTable` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolDataTable` with a local scroll owner if ever needed | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | The rows share fields and exact values, and table headers keep the relationship readable without color. Rejected: Allocation bars and charts would add geometry without a useful comparison. |
| Method and sources | `ToolDisclosure` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolDisclosure` with a short ordered list and links | Named evidence follows the answer. Enter or Space toggles disclosures with expanded state and retained focus. Escaped output remains selectable; a bounded inner viewport owns any code overflow. Use shared evidence and focus tokens. | The calculation contract is useful evidence but should not compete with the estimate. Rejected: A permanently expanded formula transcript would push the answer down the page. |
| Status and recovery | `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolStatus` plus field-associated errors | Expose textual status and one concise live announcement. Keep recovery beside its input; no duplicate alert. Long messages wrap and status uses semantic text color only. | Shared live-region and semantic tone behavior covers valid notices, warnings, and invalid recovery. Rejected: A large alert panel or repeated errors above and below the form would overstate local validation. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop above 760px | Keep the three input groups in source order. Use a two-column form grid where fields remain readable. Result order is lead, anatomy, additions, model, KDP guidance, then collapsed details. | `10,000,000 words`, `1,234 to 1,998 pages`, and `701 to 828 pages uses 0.875 in` | No page-level overflow. A source link may wrap at word boundaries. |
| Tablet at 760px | Keep the same order and use one column when two columns would make labels or suffixes cramped. Stack the result regions rather than placing model and guidance beside the lead. | `Image or table pages 2,000` and `Monospaced 24 pt at 2.5 spacing` | Only a repeated-field table may own a local viewport if its headers cannot fit. |
| Narrow mobile at 390px and 375px | Stack every labelled input. Show Calculate page range before Reset at full width. Keep result values and warnings wrapped below the lead, followed by the additions table and details disclosure. | `Estimated print pages 1,234 to 1,998 pages` | Result text wraps. The additions table may scroll inside its own viewport; the document must not scroll horizontally. |
| Very narrow at 320px | Preserve the same DOM order and group headings. Let font choices wrap as authored labels. Keep the form and result padding inside the shared workbench. | `Inside-margin band: 701 to 828 pages uses 0.875 in` | Only an exact repeated table can scroll. Do not hide fields, clip values, or move the result beside the form. |

## Interface wireframes

### Desktop result

```text
KDP page count estimator

Manuscript
Word count          [ 50,000                         ]
Trim size           [ 6 × 9 in                       v ]

Typography and margins
Font width          [Serif] [Sans] [Monospaced]
Font size           [ 11                              ] pt
Line spacing        [ 1.15                              ]
Inside margin       [ 0.5                             ] in
Outside margin      [ 0.375                           ] in
Top and bottom      [ 0.75                            ] in

Added pages
Chapter starts      [ 20                              ]
Image or table pages[ 0                               ]
Front matter        [ 4                               ]
Back matter         [ 2                               ]

[Calculate page range]  [Reset]
-----------------------------------------------------------------------
Estimated print pages
100 to 138 pages
Planning midpoint: 119 pages. KDP-style even-page planning range.

Page anatomy
Body text           74 to 112 pages
Added pages         26 pages
Trim size           6 × 9 in

Added pages
Part                         Pages
Chapter starts                 20
Image or table pages            0
Front matter                    4
Back matter                     2

Typography model
Words per page       450 to 676
Text block           5.125 × 7.5 in
Font width           Serif, 11 pt, 1.15 spacing

KDP guidance
Inside-margin band   24 to 150 pages uses 0.375 in
Final pages come from the submitted manuscript file.

[>] Calculation details
```

The desktop form may use two columns, but the groups and field order stay as shown. The result is one vertical reading path, not a row of equal cards.

### Narrow mobile result

```text
KDP page count estimator

Manuscript
Word count
[50,000                         ]
Trim size
[6 × 9 in                    v]

Typography and margins
Font width
[Serif] [Sans] [Monospaced]
Font size
[11] pt
Line spacing
[1.15]
Inside margin
[0.5] in
Outside margin
[0.375] in
Top and bottom
[0.75] in

Added pages
Chapter starts
[20]
Image or table pages
[0]
Front matter
[4]
Back matter
[2]

[Calculate page range       ]
[Reset                      ]
------------------------------
Estimated print pages
100 to 138 pages
Planning midpoint: 119 pages.

Page anatomy
Body text: 74 to 112 pages
Added pages: 26 pages

Added pages
[table viewport if needed]

Typography model
Words per page: 450 to 676
Text block: 5.125 × 7.5 in

KDP guidance
Final pages come from the submitted file.

[>] Calculation details
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
Initial: complete defaults and actions, no result.

Invalid
Word count [ -4 ]
Use a whole word count from 0 to 10,000,000.
[Calculate page range]
No result is shown. Focus is on the first invalid field.

Zero-word estimate
Estimated print pages
8 pages
Body text: 0 pages
Added pages: 8 pages

Failure
Calculation failed. Try again.
[Calculate page range]

Expanded
Estimated print pages stays unchanged.
[v] Calculation details
Assumptions, version, and KDP source links
```

There is no visible loading spinner, partial result, or empty-result panel. A synchronous calculation either returns a complete valid result or returns field issues. A valid warning remains in the KDP guidance region.

## Removed or rejected

- Remove the current duplicate lead pattern that renders the same range in both a `ToolResultLead` sentence and a `ToolPrimaryResult`.
- Remove the `Other pages` metric. The added-page total belongs in Page anatomy and the four exact parts belong in one table.
- Reject a single exact page count, an `accurate` claim, or any wording that makes the estimate sound like a KDP Previewer result.
- Do not hide word count, trim, typography, margins, or added-page defaults inside an advanced disclosure. Every default changes the lead answer.
- Do not add binding, ink, paper, custom trim, named-font metrics, document upload, or a real typesetting preview in this version.
- Do not use a genre preset as a substitute for trim, font width, font size, line spacing, margins, and page additions.
- Do not show a universal 828-page maximum. Format-specific limits are outside the paperback-only contract.
- Do not add a progress bar, timeline, marker art, page-count chart, or spine and royalty dashboard. They do not communicate a truthful relationship for this task.
- Do not add a separate copy, share, export, local-storage, or saved-draft action. The first version has no persistence contract.
- Do not repeat KDP caveats in every result row. One guidance region and one calculation-details disclosure are enough.
- Do not use a colored border, success badge, or green pass state to imply production acceptance. Warnings must remain readable as text.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | After a valid submit, the first result region shows one dominant low to high page range and a secondary midpoint detail. | Browser result-order and visible-text assertions. |
| UI-002 | deduplication | The range appears once as the dominant result, `Other pages` is absent, and the additions table is the only per-part breakdown. | DOM inspection and Browser text-count assertions. |
| UI-003 | visual-truth | Added pages use a labelled exact table, touched KDP bands use interval-to-margin rows, and no progress bar or chart implies unsupported geometry. | Source inspection plus representative result fixture. |
| UI-004 | responsive | At 320px, 375px, 760px, and desktop widths in both themes, the form and result preserve source order with no document-level horizontal overflow. | Browser measurements and screenshots. |
| UI-005 | url | Opening `/kdp-page-count-estimator` leaves the clean URL unchanged through hydration, and no input or result is written to query state or storage. | Browser history, URL, and storage assertions. |
| UI-006 | inputs | Word count, trim, font width, font size, line spacing, all three margin controls, chapter starts, image or table pages, front matter, and back matter are visible before submit. | Accessible-tree and control-count assertions. |
| UI-007 | action | Calculate page range is the only primary action, Reset appears once, and Enter submits the same form without recalculating on every keystroke. | Browser role, keyboard, and computed-style assertions. |
| UI-008 | invalid | Invalid values preserve the entered fields, show field-associated recovery, focus the first invalid control, and render no derived result. | Browser focus, error, and absence assertions. |
| UI-009 | zero | Zero words returns a valid zero body range, keeps user-supplied added pages, and never invents body pages. | Pure-engine fixture and Browser result assertion. |
| UI-010 | states | Synchronous calculation has no fake loading state; unexpected failure preserves inputs and offers retry; a KDP warning stays non-blocking. | State interaction test and source review. |
| UI-011 | evidence | The result order is anatomy, additions, model, KDP guidance, and collapsed calculation details, with official sources in the disclosure. | Browser order and disclosure-content assertions. |
| UI-012 | accessibility | Controls have persistent labels, errors are associated, the result receives focus after success, status changes are announced once, and no warning relies on color alone. | Accessibility tree, keyboard test, and manual theme review. |

| UI-013 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

- None. The paperback-only scope, supported trim presets, local formula assumptions, visible inputs, synchronous state model, and clean URL behavior are fixed by the ready implementation report and brief.
