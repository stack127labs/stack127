# Interface contract: KDP book setup calculator

Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: KDP book setup calculator
Route: `/kdp-book-setup-calculator`
Mode: pipeline
Review scope: Contract refresh within the unfinished new-tool pipeline, using its ready research and product inputs. This refresh reviews planning and source evidence only. Runtime state operation, rendered component consistency, and final tool acceptance remain separate required checks.
Depends on: `brief.md`, `implementation-report.md`

## User task

- Primary user: An author preparing a KDP paperback or hardcover after choosing a binding, trim, and approximate page count.
- Question: What interior page and full cover dimensions, margins, spine, and page-limit warnings belong to this KDP print setup?
- Lead answer: The full cover file size in the selected display unit, marked exact for paperback or estimated for hardcover.
- Next decision: Copy the setup into layout software, change a source choice, or confirm a hardcover estimate with KDP's own calculator or template.

The workbench answers one setup question. It does not estimate page count, price a book, inspect a PDF, or decide whether KDP will accept a file.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Binding | Is this a paperback or hardcover setup? | User input | input | Binding changes the supported trims, page range, cover construction, and estimate boundary. | Show it once as a form choice. Result labels name the selected binding only when needed. |
| Trim size | Which finished page size is being prepared? | User input and KDP trim table | input | Trim width and height feed the page and cover dimensions and filter the available choices. | Do not repeat the full trim label in every result row. |
| Page count | How many pages does the book have? | User input | input | It controls even-page normalization, margin band, spine, and eligibility. | Keep entered and effective counts together in the eligibility region. |
| Interior type | Which print interior is selected? | User input and KDP source table | input | Black and white, standard color, and premium color use different availability and spine rules. | Show the choice once; do not restate it in each warning. |
| Paper | Which paper stock is selected? | User input and KDP source table | input | Paper changes supported combinations, page limits, and spine coefficient. | Keep filtered options in the form and name the paper only in the spine caveat when it matters. |
| Interior bleed | Should the interior page include bleed? | User input and KDP submission guidance | input | It changes the interior page dimensions and outside, top, and bottom minimums. | Label this as interior bleed so it is not confused with the cover's required outer bleed. |
| Reading direction | Should the segment order read left to right or right to left? | User input and KDP scope note | input | It changes the diagram order and adds a conservative scope warning, but not the dimensions. | Do not infer language or repeat the direction in every result value. |
| Display unit | Which unit should lead the displayed dimensions? | User input | input | It changes how the lead answer is read without changing the inch calculation. | The lead uses this unit; the all-unit table owns the other conversions. |
| Pixel DPI | At what DPI should pixel values be shown? | User input and display convention | input | It changes pixel evidence and the copy receipt, while inches and millimeters remain unchanged. | Show the DPI once beside the field and in the pixel column heading. |
| Effective page count | What count does the calculation use after KDP's even-page rule? | Derived from page count | supporting | It prevents a hidden one-page difference in margins, spine, and eligibility. | One eligibility row owns both entered and effective counts. |
| Full cover dimensions | What complete cover file size should be used? | Derived from trim, spine, bleed, wrap, and hinge rules | lead | This is the handoff number the author came for. | Show one combined width by height lead, not separate equal-weight metric cards. |
| Interior page dimensions | What page size should the interior PDF use? | Derived from trim and interior bleed | supporting | It connects the finished trim to the uploaded page file. | Show it once in the page and margin region, then once in the all-unit table only for handoff. |
| Minimum margins | How much inside and outside space is required? | KDP margin bands and bleed rule | supporting | The author needs a page-layout constraint tied to the effective count. | Use one key/value group for inside, outside, top, and bottom. |
| Spine width | How wide is the spine or spine estimate? | KDP paperback coefficient, or documented hardcover estimate | supporting | It explains the cover width and is a separate production value. | Keep the spine value in the lead diagram and one labeled row. Do not make it a second lead. |
| Page eligibility | Does the selected combination fit the current KDP US page range? | KDP trim, binding, interior, and paper table | supporting | A valid geometry calculation can still be outside the publishable range. | One status region owns the range, count comparison, and eligibility wording. |
| Source caveats | Which limitations could make the result unsuitable as an upload template? | KDP hardcover, RTL, and groundwood notes | supporting | Hardcover geometry, RTL scope, and groundwood coefficient treatment need plain warnings. | Keep each caveat beside the affected result. Do not use a generic pass badge. |
| Cover segment relationship | How do bleed, back, spine, and front make the cover width? | Derived diagram model | evidence | A proportional relationship is faster to inspect than a sentence. | The diagram owns segment order and widths; the dimensions table does not repeat segment prose. |
| Setup receipt | How can the author carry all values and warnings into another tool? | Derived plain-text serialization | evidence | A copy action is useful after the result is verified. | Copy the full receipt once. Do not render a second raw-output panel by default. |
| Calculation version and source date | Which reviewed rule set produced these values? | Engine metadata and checked source date | evidence | A source boundary makes changing KDP rules visible. | Keep it as one quiet metadata line and include it in the receipt. |
| Validation and copy status | Is the form ready, and did the requested action finish? | Form and browser state | supporting | The author needs recovery without mistaking a warning for a result. | Use one status announcement per event; do not repeat it in every result region. |
| Share URL, saved project, or server record | Can this setup be restored later? | Not in launch scope | omit | Persistence is not needed for the one-time handoff and would add privacy and stale-rule problems. | No query string, storage value, cookie, analytics payload, or database record. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Binding | defaulted input | yes | `paperback` from the implementation report | visible | `ToolChoiceGroup` | It changes the available trim and paper choices and whether the cover is exact or estimated. | Two choices wrap in one row before the trim field. |
| 2 | Trim size | defaulted input | yes | `6 x 9 in` from the implementation report | visible | `ToolSelect` | It supplies the finished width and height and prevents unsupported custom dimensions. | Full-width select with the complete preset label. |
| 3 | Page count | defaulted input, whole number from 1 to 828 | yes | `300` pages from the implementation report | visible | `ToolNumberField` with step 1 | It changes the effective count, margin band, spine, and page-limit status. | Full-width numeric field; keep the entered value selectable. |
| 4 | Interior type | defaulted input | yes | `Black and white` from the implementation report | visible | `ToolChoiceGroup` | It changes the source table and spine coefficient, so the assumption cannot hide in an advanced panel. | Choices wrap below the page count. |
| 5 | Paper | defaulted conditional input | yes | `White` from the implementation report | visible | `ToolSelect` | Filter it after binding and interior changes, while keeping the active choice in the main flow. | Full-width select; unavailable combinations never appear as valid options. |
| 6 | Interior bleed | defaulted input | yes | Off from the implementation report | visible | `ToolCheckbox` | It changes the interior page size and three outside margins. The label must say interior. | One checkbox below paper, followed by its field error when needed. |
| 7 | Reading direction | defaulted input | no | `Left to right` from the implementation report | visible | `ToolChoiceGroup` | It changes the cover diagram order and the documented-scope warning without changing numeric dimensions. | Two choices wrap below the bleed control. |
| 8 | Display unit | defaulted input | yes | Inches from the implementation report | visible | `ToolChoiceGroup` | It controls the unit used by the single lead answer and keeps the handoff readable. | Two choices wrap; the selection remains visible beside the result. |
| 9 | Pixel DPI | defaulted input, whole number from 72 to 600 | no | `300` DPI from the implementation report | visible | `ToolNumberField` with step 1 and a short pixel-only description | Pixel output needs an explicit assumption, even though it does not change inch or millimeter math. | Full-width field with the range in its error, not in a separate panel. |
| 10 | Calculate setup | primary action | not applicable | No default | visible | `ToolButton` inside the form's `ToolActionRow` | It creates one stable result after the author finishes the choices. | Full-width accent action after the fields. Enter submits the form once. |
| 11 | Reset | secondary action | no | No default | visible | `ToolButton` inside the same action row | It returns from invalid or heavily edited combinations without a page reload. | Full-width secondary action below Calculate setup. |
| 12 | Copy setup receipt | secondary action | no | The current valid result | result | `ToolCopyAction` | It carries exact values, assumptions, warnings, version, and source date into layout software. | Full-width action directly after the result lead and receipt summary. |

All result-driving inputs stay visible. No active assumption belongs in a disclosure. Conditional filtering changes the available paper and trim options, but it never silently replaces the selected value with a nearby option.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Full cover file | What complete cover size should I prepare? | Cover width and height in the selected display unit, with exact or estimate status | One `ToolPrimaryResult` with the combined width by height value and a binding-specific label | This is the only dominant numeric answer. Do not render separate width and height metric cards or repeat the same selected-unit value in a second lead. |
| 2 | Interior page and margins | What page size and minimum margins should the interior use? | Page width and height, effective page count, inside, outside, top, and bottom margins | `ToolKeyValueList` below the lead, with the margin band named | The region owns page-layout constraints. It does not repeat full cover dimensions. |
| 3 | Eligibility | Does this binding, trim, interior, paper, and effective count fit the current KDP US table? | Eligible or ineligible state, entered and effective count, exact minimum and maximum, and unsupported-tuple errors | `ToolStatus` plus one compact key/value group; use words such as `Within the current KDP page range` or `Dimensions calculated, page eligibility needs attention` | Never call an out-of-range or unsupported result eligible. A status word and exact range remain visible without a progress bar. |
| 4 | Spine | What spine width should I reserve? | Spine width, coefficient label when useful, and estimate flag for hardcover | One labeled key/value row with a short adjacent caveat when it is an estimate | The diagram may label the spine segment, but this row owns the production value. Do not promote it above the cover-size lead. |
| 5 | Cover layout | How do the cover segments make up the full width? | Ordered segments with exact inches: paperback outer bleed, back, spine, front, outer bleed; hardcover wrap, back, hinge, spine estimate, hinge, front, wrap | Page-owned proportional diagram with accessible ordered text and exact values | Segment geometry uses one common width scale. If labels cannot fit at narrow width, keep the geometry and move exact labels into the adjacent text list. Do not equalize the spine or bleed visually. |
| 6 | Dimension handoff | What page and cover values can I copy into layout software? | Page and cover width by height in inches, millimeters, and pixels at the selected DPI | `ToolDataTable` with repeated `page` and `cover` rows and columns for all units | The table owns alternate units. It may repeat the lead in another unit, but it must not add a second sentence repeating the selected-unit lead. The table wrapper owns horizontal overflow. |
| 7 | Caveats | What should I verify before treating these dimensions as a production template? | Hardcover estimate, RTL scope warning, odd-page rounding, and source-date boundary | One quiet warning list or `ToolStatus` block after the exact values, with semantic text and no colored edge | Keep each caveat beside its affected fact. Do not use a universal `Pass` label or imply upload acceptance. |
| 8 | Handoff action | How do I carry the complete setup elsewhere? | Plain-text receipt containing inputs, entered and effective pages, dimensions, margins, spine, warnings, calculation version, and checked date | `ToolCopyAction` in an action row, with selectable receipt text available if clipboard copy fails | Copy status is feedback, not a second answer. Do not add auto-copy, download, URL sharing, or storage. |
| 9 | Method metadata | Which reviewed rule set produced this result? | Calculator ID, calculation version, input version, and `checked 2026-09-16` | One subdued monospace metadata line after the result evidence | Keep it quiet and singular. Source links and longer explanation belong in the server-rendered supporting content. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Cover segment diagram | How back, spine, front, and outer bleed add to total cover width | yes, every segment shares one width scale based on its inch value and the exact text names each segment | Use a page-owned diagram with an accessible ordered text fallback. Never give a segment a visual minimum that changes the comparison. |
| Dimensions table | Repeated page and cover records across inches, millimeters, and pixels | yes, aligned columns compare the same fields and the values are exact display conversions | Use `ToolDataTable` with a bounded inner overflow region on narrow screens. |
| Eligibility progress bar | How close the page count is to a KDP minimum or maximum | no, a range boundary is a rule, not a progress target, and a bar would suggest that proximity means quality | Omit and use an exact status with the selected range. |
| Margin illustration | How much page area remains after margin subtraction | no, the tool does not calculate text area or a page layout, and a drawing would imply more layout precision than the inputs support | Omit and use labeled margin values. |
| Unit comparison cards | How inches, millimeters, and pixels differ | no, cards would repeat the same dimension and compete with the handoff table | Omit and let the table own every conversion. |
| Warning color or icon | Whether a value is safe or unsafe | not applicable, color and icons cannot carry the estimate or eligibility meaning alone | Use words and exact values first. Semantic text color is optional and never a colored background or left edge. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial and empty | Defaults are visible, no submit has happened, and Calculate setup is available | Absent | Absent | No placeholder result and no generic helper panel | Normal document focus. Do not calculate on mount or change the URL. |
| Incomplete | A required control is blank or has not resolved after a dependent choice changes | Absent | Absent | Keep all entered values, show field-associated recovery, and block the calculation | Focus the first incomplete field and announce one concise form status. |
| Invalid input | Page count is not a whole number in range, DPI is outside 72 to 600, or an enum is malformed | Absent | Absent | Clear any old result before validation. Keep fields and show exact recovery beside them. | Focus the first invalid field; expose `aria-invalid` and `aria-describedby`. |
| Unsupported combination | Binding, trim, interior, or paper tuple is not in the source table | Absent | Absent | Name the selected combination and ask the author to choose a supported option. Never substitute a nearby preset. | Focus the first affected choice and announce the configuration error. |
| Loading or calculating | The local calculation runs synchronously after submit | Not applicable | Not applicable | No loading panel, skeleton, network retry, or upstream state. A transient busy state may prevent double submit. | Keep focus on the action during the event; no loading announcement is needed. |
| Success, eligible paperback | Inputs are valid and the effective count is within the selected table | One exact paperback cover size in the selected unit | Page, margins, spine, diagram, all-unit table, caveats, and copy action appear in order | No error. The result remains stable while the author reads or copies it. | Move focus to the result heading and announce the lead once. |
| Calculable with eligibility warning | Geometry is valid but the effective count is below or above the selected range, or it was odd before normalization | Cover dimensions remain visible, but the lead or status says `Dimensions calculated, page eligibility needs attention` | Exact range, entered and effective count, and relevant warnings remain visible | Do not use `eligible`, `ready`, or `will pass`. The author can edit the page count and calculate again. | Focus the result heading and announce the warning after the lead. |
| Hardcover estimate or other source caveat | Hardcover is selected or RTL is selected | The lead label says `Estimated hardcover cover file` when relevant | Estimate inputs and scope limits remain beside the affected values | Keep useful dimensions visible, but tell the author to confirm the hardcover file with KDP. | Announce the estimate or scope warning as part of the result status, not by color alone. |
| Changed after result | Any result-driving input changes, including binding, trim, pages, interior, paper, bleed, direction, unit, or DPI | Cleared immediately | Cleared immediately, including warnings, diagram, table, and copy state | Preserve the edited values. The next submit produces a new result from the new tuple. | Keep focus on the edited control and announce that the old setup was cleared. |
| Copy success | Author activates Copy setup receipt after a valid result | Remains unchanged | Remains unchanged | Button feedback says `Setup copied` only after the clipboard promise succeeds | Keep focus on the copy action and announce the success once. |
| Copy failure | Clipboard is blocked or the write fails | Remains unchanged | Show a selectable plain-text receipt or equivalent recovery control | Say `Copy failed` and never claim success. Do not write to storage as a fallback. | Keep focus on the copy action and announce the failure and selection recovery. |
| Reset | Author activates Reset from any form or result state | Absent | Absent | Restore documented defaults, clear errors and announcements, and discard the current result | Focus Binding and announce `Setup reset` once. |
| Unexpected local failure and retry | A defensive runtime catch handles a calculation exception | Absent and no stale result | Absent | Keep inputs, show one concise failure status, and offer the same Calculate setup action as recovery. There is no upstream retry state. | Focus the failure status and announce the recovery action. |
| Expanded result | Launch has no collapsible result panel or restored shared state | Remains unchanged | All required evidence is already in the reading order; the receipt is copied rather than hidden | No disclosure, URL restore, or auto-expanded panel is needed in version 1. | No focus movement beyond the action that was activated. |

## Optional mode and state visibility

- Control mode: single
- Reason: Binding, trim, page count, interior, paper, bleed, reading direction, units, and DPI remain visible. The hardcover estimate is a product branch, not an advanced mode.
- Shared engine and normalized input mapping: The existing setup adapter receives one normalized KdpSetupInput with compatible binding-dependent choices. No second calculation path or alternate rules are introduced.
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
| Binding, interior, direction, and display unit choices | `ToolChoiceGroup` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolChoiceGroup` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | These are short, material choices. Keeping them visible shows which assumptions drive the result and preserves native radio semantics. Rejected: Hidden selects or an advanced disclosure would make an active calculation assumption easy to miss. |
| Trim and filtered paper choices | `ToolSelect` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolSelect` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | Trim has many presets, and paper options depend on binding and interior. A labeled select keeps the form compact without presenting invalid options. Rejected: A custom combobox adds behavior without helping this finite source table. |
| Page count and DPI | `ToolNumberField` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolNumberField` | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Native numeric semantics, bounds, step 1, field errors, and keyboard entry fit both integer inputs. Rejected: Sliders imply a continuous tuning task and make exact page entry harder. |
| Interior bleed | `ToolCheckbox` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolCheckbox` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | This is a boolean choice that applies when the author submits the setup. The label can distinguish interior bleed from cover bleed. Rejected: A switch would suggest an immediate system setting rather than a calculation input. |
| Form actions | `ToolActionRow`, `ToolButton` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolActionRow` and `ToolButton` | One submit is primary. Keyboard activation, disabled or busy state, and reset retain clear labels and visible focus. Keep input after failure and stack actions at narrow widths. Use shared button tokens. | They preserve one primary action, shared target sizing, keyboard behavior, and a clear Reset action. Rejected: Page-owned button copies could drift from the shared focus and disabled states. |
| One lead answer | `ToolPrimaryResult` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolPrimaryResult` with one combined dimension string | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | The full cover file is the one answer worth making dominant. A single width by height value prevents width and height from becoming competing cards. Rejected: Two `ToolPrimaryResult` cards or a metric group split one answer into equal leads. |
| Eligibility and caveats | `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolStatus` with a compact list or key/value rows | Expose textual status and one concise live announcement. Keep recovery beside its input; no duplicate alert. Long messages wrap and status uses semantic text color only. | The state needs words, exact ranges, and recovery. It does not need a numeric score or decorative alert panel. Rejected: Green or red badges, progress bars, and colored left borders hide the actual rule. |
| Page and margin facts | `ToolKeyValueList` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolKeyValueList` | Use semantic labels and exact values with explicit unknowns. Supporting facts follow the lead, retain source order, and stack at narrow widths. Use shared text and metadata tokens. | Labeled values wrap cleanly and keep inside, outside, top, and bottom margins together. Rejected: A paragraph would bury exact values, and cards would create unnecessary visual weight. |
| All-unit handoff | `ToolDataTable` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolDataTable` | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | Page and cover repeat the same fields across three units, which is a real table relationship. Rejected: Equal metric cards repeat values and make unit comparison slower. |
| Cover relationship | `ToolDataTable`, `ToolKeyValueList`, and `ToolDisclosure` in `app/tool-ui/tool-controls.tsx`; current route markup | route-specific | Page-owned accessible diagram plus ordered text fallback | Preserve semantic headings, lists, or figures and the route-specific relationship described here. No interactive element loses its label or visible focus. Wrap long text, keep exact data accessible, and use site text, border, spacing, and focus tokens. | The segment order and proportional widths are specific to this tool and must expose exact values. Rejected: Marker art is intentionally vague, and a decorative SVG would not prove the dimensions. |
| Copy handoff | `ToolCopyAction`, `ToolActionRow` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolCopyAction` in `ToolActionRow` | Actions are explicit and keyboard accessible. Copy success follows a confirmed write; failure keeps text selectable. Downloads use the current report. Preserve focus, label actions, and wrap at narrow widths. Use secondary shared button tokens. | It supplies shared clipboard feedback while keeping the receipt action explicit and local. Rejected: Auto-copy, download, URL sharing, or local storage are outside the one-time setup job. |
| Source metadata | `ToolDataTable`, `ToolKeyValueList`, and `ToolDisclosure` in `app/tool-ui/tool-controls.tsx`; current route markup | route-specific | Quiet monospace text after the result | Preserve semantic headings, lists, or figures and the route-specific relationship described here. No interactive element loses its label or visible focus. Wrap long text, keep exact data accessible, and use site text, border, spacing, and focus tokens. | Version and checked date matter as evidence but should not compete with dimensions. Rejected: An always-open source panel or a link wall would push the handoff below method detail. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop above 900px | One full-width workbench beside the shared sidebar. Form order is binding, trim, pages, interior, paper, bleed, direction, unit, DPI, actions. Result order is lead, page and margins, eligibility, spine, diagram, all-unit table, caveats, copy, metadata. | `Estimated hardcover cover file` and `Dimensions calculated, page eligibility needs attention` | No page overflow. The workbench and every grid child use `min-width: 0`. |
| Tablet around 760px | Form changes to two columns where labels fit, then stacks dependent selects and actions. The result keeps the lead first and lets the diagram and caveat text grow vertically. | `8.27 × 11.69 in` and `Pixels at 600 DPI` | Only the dimensions table may scroll inside its own bounded wrapper. |
| Narrow mobile at 375px | Every input is one column in source order. Calculate setup and Reset fill the available width. Lead, page facts, eligibility, spine, diagram text, table, caveats, and copy follow in that order. | `Hardcover measurements are an estimate; confirm them with KDP's cover calculator.` | The table owns horizontal overflow or reflows to stacked rows. The page never owns horizontal overflow. |
| Very narrow at 320px and 200 percent zoom | Choice groups wrap, labels and values break at words, the long warning remains selectable, and no control is clipped. Keep the selected unit next to the lead only through text, not a fixed-width badge. | `12.9256 × 9.2500 mm` and `5,100 × 6,600 px at 600 DPI` | Inputs, key/value values, status text, and diagram labels wrap inside their owners. The table wrapper is the only scroll region. |
| Long or estimate result | Do not compress the lead or hide the caveat. Keep the estimate label and exact values together before the table. | `Estimated hardcover cover file: 18.3125 × 10.0200 in` | Result text wraps; no horizontal page scroll and no clipped diagram labels. |

## Interface wireframes

### Desktop result

```text
KDP book setup calculator

Binding                 Trim size                 Page count
[ Paperback ] [Hardcover] [6 × 9 in             v] [300        ]

Interior                Paper                     Interior bleed
[ Black and white ]     [White                 v] [ ] Include bleed

Reading direction      Display unit             Pixel DPI
[ Left to right ]       [ Inches ] [Millimeters] [300         ]

[Calculate setup]  [Reset]
-------------------------------------------------------------------------------
Paperback cover file
12.9256 × 9.2500 in
Exact calculated size. 328.3122 × 234.9500 mm. 3878 × 2775 px at 300 DPI.

Interior page          6.0000 × 9.0000 in
Effective page count   300 entered, 300 used
Inside margin          0.5000 in
Outside, top, bottom   0.2500 in
Spine                  0.6756 in

Within the current KDP page range

Cover layout
Outer bleed 0.1250  ->  Back 6.0000  ->  Spine 0.6756  ->  Front 6.0000  ->  Outer bleed 0.1250

Dimensions
Part             Inches              Millimeters          Pixels at 300 DPI
Interior page    6.0000 × 9.0000     152.4000 × 228.6000   1800 × 2700
Full cover       12.9256 × 9.2500    328.3122 × 234.9500   3878 × 2775

[Copy setup receipt]
Formula 1. Checked 2026-09-16. KDP US print specifications.
```

### Narrow mobile result

```text
KDP book setup calculator

Binding
[Paperback                         v]
Trim size
[6 × 9 in                          v]
Page count
[300                                ]
Interior
[Black and white                   v]
Paper
[White                             v]
Interior bleed
[ ] Include bleed
Reading direction
[Left to right                     v]
Display unit
[Inches                            v]
Pixel DPI
[300                                ]

[Calculate setup                  ]
[Reset                            ]
-----------------------------------
Paperback cover file
12.9256 × 9.2500 in
Exact calculated size
328.3122 × 234.9500 mm
3878 × 2775 px at 300 DPI

Interior page       6.0000 × 9.0000 in
Effective pages     300 entered, 300 used
Inside margin       0.5000 in
Outside margin      0.2500 in
Spine               0.6756 in

Within the current KDP page range

Cover layout
Outer bleed 0.1250
Back 6.0000
Spine 0.6756
Front 6.0000
Outer bleed 0.1250

Dimensions
[scrolls inside the table only]

[Copy setup receipt]
```

The desktop wireframe shows the compact form and the answer-first result. The narrow wireframe keeps the same source order and turns the exact segment relationship into a readable list below the diagram. The result does not appear until Calculate setup succeeds or returns a calculable warning.

## Removed or rejected

- Remove the two equal-weight cover width and cover height cards. One combined cover file dimension is the lead answer.
- Remove any automatic calculation on first render. Defaults are inputs, not an implicit result.
- Remove hidden result-driving controls from disclosures. Binding, trim, pages, interior, paper, bleed, unit, and DPI stay visible.
- Remove the implication that interior bleed controls the cover bleed. The interior page rule and cover-file rule are separate facts.
- Remove a universal pass or fail badge. The page-limit status must name the selected range and keep calculable warnings separate from invalid configurations.
- Remove exact wording for hardcover total width and spine. Those values are estimates that need KDP confirmation.
- Remove any proportional bar for page-range proximity, margin area, or conversion difference. None has a truthful progress denominator for this task.
- Remove generated cover templates, safe-area overlays, barcode placement, interior layout advice, and PDF inspection. They belong to later tools or KDP's own template workflow.
- Remove share URLs, saved projects, cookies, local storage, analytics payloads, and server-side setup records.
- Remove a source-link wall from the workbench. Keep version and checked date quiet in the result and explain sources in the server-rendered supporting content.
- Remove marker art, decorative illustrations, nested result cards, gradients, shadows, and colored left-edge callouts.
- Remove a second spine, margin, or cover calculator. This workbench owns the combined answer.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A valid submit focuses one combined full-cover dimension as the first result. Paperback says exact; hardcover says estimated. No other result has equal visual weight. | Browser result test checks focus, label, combined value, and result order. |
| UI-002 | deduplication | The selected-unit cover value appears once as the lead. The all-unit table owns alternate conversions, and no second metric card or sentence repeats the same selected-unit value. | Browser text-count and DOM-region assertions. |
| UI-003 | visual-truth | The cover diagram uses one common width scale for its segment values, exposes an ordered text fallback, and never uses a page-range bar or decorative illustration as evidence. | Browser inspection at desktop and narrow widths plus fixture comparison with segment widths. |
| UI-004 | responsive | At 320px, 375px, 760px, desktop, and 200 percent zoom, form order remains intact, long warnings wrap, result values remain selectable, and only the dimensions table may scroll. | Browser viewport measurements in both themes. |
| UI-005 | url | Opening `/kdp-book-setup-calculator` leaves the clean canonical URL unchanged through hydration, and calculation inputs never enter query parameters, history, storage, cookies, analytics payloads, or server records. | Browser URL, history, storage, request, and source inspection. |
| UI-006 | states | Initial, incomplete, invalid, unsupported, eligible, warning, hardcover estimate, changed, copy success, copy failure, reset, and unexpected local failure states preserve the specified lead and recovery order. | Browser state matrix and accessibility assertions. |
| UI-007 | inputs | Binding, trim, page count, interior, paper, bleed, direction, display unit, and DPI remain visibly labeled, keyboard reachable, and filtered without silent substitution. | Accessible-control inspection and dependent-option test. |
| UI-008 | handoff | Copy setup receipt includes inputs, entered and effective page counts, all dimensions, margins, spine, warnings, formula and input versions, and the checked source date. | Clipboard success and failure test with selectable fallback. |

| UI-009 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

None. The hardcover total is deliberately an estimate, the source boundary is KDP US print specifications checked on 2026-09-16, and the final implementation must keep both limits visible without presenting them as upload acceptance.
