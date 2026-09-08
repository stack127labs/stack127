# Interface contract: RAID capacity calculator

Status: ready
Tool: RAID capacity calculator
Route: `/raid-calculator`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:075613278753ae898cca4d9d939ef02056021ef334100d40746c15ce813877f5`

## User task

- Primary user: Someone planning a conventional RAID array from a known set of equal or mixed-size drives.
- Question: How much theoretical capacity will this exact RAID layout make usable, and how are the drives grouped?
- Lead answer: The theoretical usable capacity in the chosen display unit.
- Next decision: The person can keep or reject the RAID level, drive set, and nested grouping before creating the array.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| RAID level | Which capacity and redundancy rule should the calculator apply? | `level` input | input | It changes minimum drive count, grouping, capacity, and failure tolerance. | Keep the selected value in the visible control. Name it once in the lead detail, with no result badge or input recap. |
| Drive capacity and unit | What capacity can each physical member contribute? | `drives[]` input | input | Every drive affects raw capacity, usable capacity, mismatch, and sometimes group capacity. | The inventory remains the only input summary. Do not repeat every drive in a metric grid. |
| Entered drive order | Which drives share a mirror or parity group? | `drives[]` order | input | Order changes RAID 10, RAID 50, and RAID 60 topology and may change capacity. | Show derived group markers in the inventory and exact members in the nested group result. Do not add a prose order summary. |
| Nested group size | How many drives belong to each RAID 5 or RAID 6 subgroup? | `groupSize` input | input | It changes subgroup membership, capacity, and the failure boundary for RAID 50 and RAID 60. | Show only for RAID 50 and RAID 60. Do not show the value as a separate result metric. |
| RAID 10 pair size | How large is each mirror pair? | Fixed engine rule, `groupSize: 2` | input | The version 1 model always uses adjacent pairs. | Derive it. Do not expose a control. Group markers and the nested group result provide the evidence. |
| Add drive | How can the person add another member? | Local editor action | input | Equal and mixed arrays use the same one-row-at-a-time inventory. | Put one Add drive action after the rows. Do not add count and capacity batch controls. |
| Remove drive | How can the person remove one member without rebuilding the inventory? | Local editor action | input | Each row needs a stable, local removal action. | Keep one labelled icon action in the fixed final row column. Do not add a second remove action elsewhere. |
| Calculate capacity | When should the calculator commit the visible editor state? | Form submission | input | One explicit action separates editing from a current answer. | Do not calculate automatically or add another primary action. |
| Reset | How can the person return to an empty clean calculator? | Local editor action | input | It clears the inventory, result, statuses, display unit, and query state. | Keep it beside the primary action as a ghost action. Do not place it beside Add drive. |
| Theoretical usable capacity | How much array capacity can hold data in this model? | `usableCapacityBytes` | lead | It is the answer the person came for. | Render it once in `ToolPrimaryResult`. Do not repeat it in a metric card or sentence. The allocation legend may repeat it only as one part of raw capacity. |
| Selected layout and drive count | Which submitted array produced the lead answer? | `levelLabel`, `driveCount` | supporting | This makes the answer identifiable without restating the whole input. | Put both in one short lead detail. Do not add pills or a separate scenario summary. |
| Raw capacity | What total supplied capacity is being allocated? | `rawCapacityBytes` | supporting | It is the denominator for usable, redundancy, and mismatch. | Show it once in the allocation figure heading. Do not repeat it in the lead detail or a metric row. |
| Redundancy capacity | How much raw capacity pays for the selected protection rule? | `redundancyBytes` | supporting | It explains the difference between raw and usable capacity. | Show it once as an allocation segment and exact legend value. |
| Size mismatch | How much paid capacity is unavailable because a group is clipped to its smallest member? | `sizeMismatchBytes` | supporting | It can change drive choice or grouping. | Show it once as an allocation segment and exact legend value. Do not repeat the same number in a warning sentence. |
| Raw capacity allocation | How do usable, redundancy, and mismatch reconcile to raw capacity? | `usableCapacityBytes`, `redundancyBytes`, `sizeMismatchBytes`, `rawCapacityBytes` | supporting | A proportional allocation bar communicates the exact whole-part relationship. | Keep exact names and values in its legend. Do not add a second capacity table or card row. |
| Nested group membership | Which exact drives share each mirror or parity failure boundary? | `groups[]` | supporting | RAID 10, RAID 50, and RAID 60 are incomplete without visible groups. | Show this region only for nested layouts. Group rows carry members, usable capacity, and mismatch once. |
| Single-group topology | Which drives form the array? | One `groups[]` record for RAID 0, RAID 1, RAID 5, RAID 6, Linear, or JBOD | omit | The visible inventory already shows every member and all of them form one group. | Do not render a one-row topology table that repeats the inventory. |
| Failure tolerance | What drive-loss boundary does this exact topology have? | `failureTolerance.statement` | supporting | Capacity alone is not enough to choose a RAID layout. Conditional nested tolerance must stay explicit. | Show one labelled value after capacity. Do not split guaranteed and conditional limits into competing cards. |
| Small random write reference | What classic backend operation count belongs to this layout? | `smallRandomWrite.operations`, `smallRandomWrite.statement` | supporting | It is a compact architecture reference for comparing levels, not a performance promise. | Show one concise labelled value. Keep the performance boundary in calculation details, not repeated prose. |
| Output unit | Should friendly result values use TB or TiB? | Local display state | supporting | It changes presentation without changing the submitted array or exact bytes. | One compact result control updates every friendly capacity. Do not place unit switches beside each value. |
| Total unavailable capacity | How much capacity is redundancy plus mismatch? | `unavailableCapacityBytes` | omit | The allocation figure already exposes both causes and their exact values. Their sum does not enable another decision. | Do not add an unavailable metric or sentence. |
| Minimum drive count | What makes the selected layout valid? | `minimumDriveCount`, level registry | evidence | It is useful only during validation. | Put the requirement in the inventory error when violated. Do not show it in a successful result. |
| Group raw and component capacities | How did each nested group resolve? | `groups[].rawCapacityBytes`, `componentCapacityBytes` | evidence | These values support technical checking but would overload the main group view. | Keep them in calculation details. The main nested group rows show only members, usable, and mismatch. |
| Capacity equation and derivation | Does the integer result reconcile? | `result.derivation` and formula contract | evidence | It lets a technical reader audit the model. | Keep one compact calculation disclosure. Do not add raw JSON or a second derivation section. |
| Model assumptions | What is deliberately outside the answer? | `result.assumptions` | evidence | Filesystem overhead and smallest-member behavior define what the result means. | Keep assumptions together in calculation details. Do not put a caveat panel above the answer. |
| Formula version and sources | Which rules support this result? | Calculator version and dated source records | evidence | They make restored or copied state auditable. | Keep them quiet at the end of calculation details. Do not add source cards. |
| Validation issues | What must change before a result is valid? | Input parsing and `result.issues` | evidence | Precise recovery is required. | Render each error once beside the responsible drive, group-size control, or inventory. Do not create a duplicate error result. |
| URL state | Can an edited array survive refresh or be copied from the address bar? | Versioned `state` serializer | evidence | Arrays take time to enter, and existing version 1 behavior persists valid deliberate edits. | Never serialize defaults or an initial result on a clean visit. Store normalized inputs only, not derived results or display unit. |
| RAID is not backup warning | Is array redundancy a backup strategy? | Generic safety guidance | omit | It does not interpret this result and supporting page content already answers it. | Remove it from the workbench. Keep the topic in supporting content only. |
| Performance, rebuild time, filesystem capacity, personal failure odds, and controller metadata | What will the real deployed system deliver? | Not supplied by the engine | omit | The calculator has no reliable data for these outcomes. | Do not invent scores, forecasts, progress, or fake precision. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | RAID level | required and defaulted | yes | Existing common baseline, `RAID 5` | visible | `ToolChoiceGroup` with all nine supported layouts | Every choice changes the calculation rule, so all remain visible instead of hiding in a select. | Full-width wrapping row. Labels keep at least a 44 px hit target. |
| 2 | RAID 50 or RAID 60 drives per subgroup | conditionally required and defaulted | yes | Engine minimum, `3` for RAID 50 and `4` for RAID 60 | conditional | `ToolNumberField` with integer steps and the RAID-specific minimum | Nested group size is an active assumption and must appear as soon as either nested parity level is selected. | Full width below the RAID level. Error stays below the field. |
| 3 | Drive capacities and units | required repeatable inputs | yes | Blank capacity and `TB` unit for each new row | visible | `ToolRepeatableList` whose row renders one required `ToolQuantityInput` and one labelled remove action | Every member can change the answer. Capacity and unit remain one joined control. | Each row uses `minmax(0, 1fr) 42px`. Long editor text scrolls inside its input, and the remove action never wraps below it. |
| 4 | Add drive | secondary action | yes, by adding an input | No default | visible | `ToolRepeatableList` Add drive action | It appends one blank row and focuses that row's capacity field. | Full-width after the current rows. At the 64-drive limit it disables and one status says `Maximum 64 drives.` |
| 5 | Calculate capacity | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It validates the current inventory and produces the one lead answer. | Full-width first action. |
| 6 | Reset | secondary action | not applicable | Restores RAID 5, no drives, and TiB display | visible | `ToolButton` with `variant="ghost"` | It provides one predictable recovery without competing with calculation. | Full-width after Calculate capacity. Hide only when the editor already equals the initial state. |
| 7 | Output unit | derived display control | no, presentation only | Existing result default, `TiB` | result | Compact `ToolChoiceGroup` with `TiB` and `TB` | It changes every friendly result value without changing bytes or URL state. | Stacks below the lead detail when it cannot fit beside the result label. |

Validation, focus, keyboard, and URL behavior:

- Mark RAID level, every drive capacity, every drive unit, and the conditional subgroup size as required in visible and programmatic form state.
- Keep exact capacity editor strings until submission. Do not clamp, round, or clear an invalid decimal while the person is editing.
- Enter in a capacity input submits unless input method composition is active. Choice groups, unit selects, number steps, and repeatable row actions keep their native keyboard behavior.
- Adding a drive focuses its capacity input. After removing the focused row, move focus to the next row's remove action, the previous row's remove action, or Add drive in that order.
- On submission, show a capacity parse error below its exact row. Show drive-count and group-divisibility errors once below the inventory or subgroup field. Focus the first invalid owner in source order.
- An edit removes the stale result and its announcement. It keeps all visible input, including invalid strings, so the person can recover.
- Opening `/raid-calculator` leaves the URL unchanged through server render and hydration. The default RAID level, empty inventory, and empty result never enter the query string.
- Preserve existing version 1 persistence after deliberate edits. A valid editor state may update `state` with `replaceState`; it stores normalized input only. Invalid editor state removes `state` without clearing the visible input.
- A valid versioned query restores the editor and calculates it. An invalid or unsupported query restores the clean initial editor, removes the query, shows one recovery status, and does not produce a result.
- Reset removes the query with `replaceState`, restores initial state, and focuses the RAID level group.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Theoretical usable capacity | How much capacity can this submitted layout use for data in the stated model? | `usableCapacityBytes`, `levelLabel`, `driveCount` | One `ToolPrimaryResult` labelled `Theoretical usable capacity`. The large value includes the selected display unit. Its detail reads, for example, `RAID 5 across 4 drives.` | This is the only dominant result. Do not add an answer sentence, capacity card grid, status badge, or verdict. |
| 2 | Output unit | How should every friendly capacity be displayed? | Local `TB` or `TiB` view state | Compact `ToolChoiceGroup` aligned with the result header. | Presentation only. It never changes exact bytes, the submitted input, or URL state. |
| 3 | Raw capacity allocation | Where does the supplied raw capacity go? | `rawCapacityBytes`, `usableCapacityBytes`, `redundancyBytes`, `sizeMismatchBytes` | Heading `Raw capacity allocation` with the raw total once, followed by `ToolAllocationBar` in `categorical` mode. Use explicit tones: chartreuse for Usable, cyan for Redundancy, and violet for Size mismatch. Each legend row shows its exact friendly value. | Geometry uses exact BigInt ratios. Zero and tiny parts keep a labelled legend row but receive no invented bar width. Do not repeat the values in a warning or metric list. |
| 4 | Nested drive groups | Which members share each nested capacity and failure boundary? | `groups[].label`, `kind`, `driveIds`, `usableCapacityBytes`, `sizeMismatchBytes` | Render only for RAID 10, RAID 50, and RAID 60. Desktop uses `ToolDataTable` columns `Group`, `Members`, `Usable`, and `Mismatch`. Narrow screens use authored group records with the same fields and order. | Do not render for single-group levels. Do not repeat group raw or component capacity here. Members use visible drive numbers, not internal IDs. |
| 5 | Array behavior | What failure boundary and classic write reference belong to this topology? | `failureTolerance.statement`, `smallRandomWrite.operations` and performance boundary | One `ToolKeyValueList` with `Failure tolerance` and `Small random write`. The second value is concise, for example `4 backend operations in the classic model.` | Do not turn these into equal metric cards, scores, colored statuses, or a performance prediction. Keep the longer boundary in calculation details. |
| 6 | Calculation details | Which exact rules and intermediate values support the answer? | Submitted level and capacities, group raw and component bytes, capacity equation, assumptions, formula version, and dated sources | One collapsed `ToolDisclosure` titled `Calculation details`. Use `ToolKeyValueList` for scenario and exact group facts, one code-formatted capacity equation, a short assumptions list, and linked sources. | Keep exact bytes and technical boundaries here. Do not render raw JSON, duplicate the friendly result, or add another disclosure for sources. |

Result readback: The result says `Theoretical usable capacity: 10.91 TiB. RAID 5 across 4 drives.` The allocation figure shows how the exact raw total splits into usable capacity, redundancy, and size mismatch. Nested layouts then identify the drives in each failure boundary. Array behavior adds the exact failure rule and one classic write reference. Calculation details provide audit evidence only.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large lead answer | The one theoretical usable-capacity result | Not applicable. Type hierarchy makes one exact conclusion dominant. | Use one `ToolPrimaryResult`. |
| Allocation bar | Usable, redundancy, and size mismatch as parts of raw capacity | Yes. Segment width uses each exact byte value divided by raw bytes. | Use `ToolAllocationBar` with BigInt values, categorical tones, visible labels, and exact values. |
| Nested group table and mobile records | Repeated membership and capacity facts for mirror or parity subgroups | Yes. Aligned fields compare the same facts without implying time or rank. | Use only for RAID 10, RAID 50, and RAID 60. |
| Topology strip for one group | Every drive belongs to the same array | No useful new relationship. The inventory already shows the complete member set. | Omit for RAID 0, RAID 1, RAID 5, RAID 6, Linear, and JBOD. |
| Metric-card grid | Raw, usable, redundancy, mismatch, tolerance, and write reference | No. Equal boxes flatten the answer hierarchy and repeat the allocation legend. | Omit. |
| Progress bar or gauge | Capacity quality, safety, or completion | No meaningful target or completion state exists. | Omit. |
| Timeline | Drive order or failure stages | No time axis exists. | Omit. |
| Marker art or screenshot | Exact calculated capacity and groups | No. A drawing would blur calculated values and a screenshot would duplicate the live tool. | Omit. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | RAID 5 selected, no drives, Add drive available, Calculate capacity available, Reset hidden | Absent | Absent | Inventory reads `No drives added.` with no second empty label | Normal document order. Nothing announces on load and the URL stays clean. |
| Editing | Preserve exact input strings and derived group markers; Reset visible | Remove any previous result immediately | Absent | Field errors clear only when their cause changes | Keep focus on the edited control. Announce no result while typing. |
| Empty submission | Preserve RAID level and empty inventory | Absent | Absent | One inventory error says `Add at least 3 drives for RAID 5.` using the active level's minimum | Focus Add drive and announce the error once. |
| Invalid drive capacity | Preserve every drive and exact string | Absent | Absent | One row error says the capacity must be a positive plain decimal | Focus the first invalid capacity field and announce its error. |
| Invalid drive count | Preserve all valid rows | Absent | Absent | One inventory error names the active level's minimum, even-count rule, or subgroup divisibility rule | Focus the inventory heading or subgroup field when that control owns the error. Announce once. |
| Calculating or loading | Not applicable. The bundled calculation is synchronous | No loading variant | No skeleton, spinner, busy label, or stale result | None | No busy announcement. |
| Success, single group | Preserve editor and actions | One dominant usable-capacity result | Allocation and array behavior only | Reset or any edit returns to editing | Announce the lead result once. Do not move pointer focus. Keyboard submit may focus the result label after announcement. |
| Success, nested groups | Preserve editor and derived group markers | One dominant usable-capacity result | Allocation, nested group result, then array behavior | Reset or any edit returns to editing | Announce the lead. Group result follows in document order. |
| Mixed-size result | Preserve all submitted capacities | Normal lead | Allocation shows a nonzero Size mismatch value. Nested rows identify any group-level mismatch | No duplicate warning sentence. Supporting content explains the smallest-member rule | Announce the lead only. The labelled allocation remains readable without color. |
| Empty or no-data result | Not applicable after valid submission | No special empty result | No result region | Input validation owns recovery | No extra announcement. |
| Partial result | Not applicable. The local engine returns either invalid or complete values | No partial variant | No partial result | Keep inputs for another submission | No partial announcement. |
| Calculation failure | Preserve all input and keep Calculate capacity enabled | Absent | Absent | One `ToolStatus` says `Unable to calculate this array. Check the inputs and try again.` | Announce as an alert. Focus remains on Calculate capacity so retry is immediate. |
| Restored valid state | Restore every input and calculate the explicit state | Normal lead | Normal supporting regions | One quiet status says `Restored saved array.` | Announce the restore status once after hydration. Do not move focus. |
| Invalid shared state | Restore clean initial input and remove the query | Absent | Absent | One status says `The saved array could not be restored.` | Announce once. Normal focus order remains. |
| Output unit changed | Inputs and URL state remain unchanged | Update the displayed lead value | Update allocation and nested group values from the same exact bytes | No recovery needed | Announce the new lead value once. Keep focus on the unit choice. |
| Calculation details expanded | Inputs and visible result remain unchanged | Remains visible | Exact group facts, equation, assumptions, version, and sources appear after array behavior | Disclosure trigger collapses the evidence | Native disclosure semantics announce expansion. Focus stays on the trigger. |
| Maximum drives | Keep all 64 rows editable and removable; disable Add drive | Any previous result is absent after the last add | Absent until a valid submission | One status says `Maximum 64 drives.` | Announce when the limit is reached. Focus remains on the disabled action's nearest stable owner. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Visible RAID choice | `ToolChoiceGroup` | All nine result-driving levels remain comparable and retain radio semantics. | Native select or custom dropdown, because hiding the core layout choice slows comparison. |
| Exact repeatable drive inventory | `ToolRepeatableList` with `ToolQuantityInput` rows | It provides stable add, remove, focus, joined capacity and unit behavior. | Separate capacity inputs and native selects, because they split one decision and duplicate control styling. |
| Conditional subgroup size | `ToolNumberField` | Integer step controls fit a bounded subgroup size and keep the active default visible. | Disclosure or hidden derived default, because group size changes the main result. |
| Primary and reset actions | `ToolButton` inside `ToolActionRow` | One accent action and one quiet recovery action preserve hierarchy. | Full-width primary plus Reset beside Add drive, because that separates related submission actions. |
| Validation and action feedback | Field errors plus one `ToolStatus` channel | Each error appears at its narrowest useful scope while restore and limit statuses remain singular. | A result error panel, because it repeats or separates errors from their controls. |
| Dominant capacity | `ToolPrimaryResult` | It gives one labelled, accessible, large numerical answer. | Result sentence plus metric cards, because both repeat the same capacity. |
| Exact whole-part capacity | `ToolAllocationBar` with categorical palette | It accepts exact BigInt values and keeps labels and values visible when a segment is zero or tiny. | Page-owned monochrome bar, pie chart, or progress bar, because those either duplicate the shared behavior or imply a target. |
| Nested group comparison | `ToolDataTable` on desktop with page-owned semantic group records on narrow screens | Repeated groups share the same fields, while the mobile records prevent a wide table from breaking the page. | A row of drive cards per group, because nested boxes consume space and hide field alignment. |
| Failure and write facts | `ToolKeyValueList` | Two different but compact facts need labels without equal visual cards. | `ToolMetricGroup`, because the values include conditional sentences rather than peer metrics. |
| Technical evidence | `ToolDisclosure` with `ToolKeyValueList` and code-formatted equation | Evidence stays available without competing with the lead answer. | Raw output, separate formula and source disclosures, or visible caveat panels. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench surface and top and bottom rules span the full main column. Its inner content uses one calm measure. RAID level, conditional subgroup size, inventory, Add drive, actions, divider, lead, allocation, nested groups when present, array behavior, and calculation details follow vertically. | `Any one drive can fail. Up to 16 can fail only when there is one failed drive in every RAID 5 group.` and 64 drive rows. | No page overflow. Nested group table may own horizontal overflow only before the authored mobile breakpoint. |
| Narrow mobile, 320px to 640px | RAID choices wrap. The subgroup field is full width. Each drive row keeps the joined quantity control beside one 42 px remove action. Calculate and Reset stack. Lead, unit, allocation, nested group records, behavior, and details keep desktop order. | `999999999999 TB`, `Drive 64 capacity`, and `The 64 drives do not divide into equal groups of 7.` | Long editor text scrolls inside the input. Result numbers wrap inside their region. The document never gains horizontal overflow. |
| Nested groups below the table breakpoint | Replace the table with one flat group record per subgroup. Each record orders Group, Members, Usable, then Mismatch and uses neutral dividers, not cards. | `Drives 57, 58, 59, 60, 61, 62, 63, 64`. | Member labels wrap inside the record. No horizontal scroller or clipped final field. |
| Large text or long translated labels | Let controls and rows grow vertically. Move Reset below the primary action and output unit below the lead before labels collide. | `Drives per RAID 6 subgroup` and the full conditional failure statement. | Each bounded region wraps its own text. Actions never fall into an accidental second line. |
| Expanded calculation details | Disclosure pushes following content down in normal flow. Exact byte values use wrapping mono text. | `999999999999000000000000 bytes` and full source URLs. | Links and exact values wrap within the disclosure. No page-level scroll. |

## Interface wireframes

### Desktop result

```text
RAID level *
[RAID 0] [RAID 1] [RAID 5] [RAID 6] [RAID 10] [RAID 50] [RAID 60] [Linear] [JBOD]

Drive inventory
01  Drive 1 capacity *  [4                              ][TB v]  [Remove]
02  Drive 2 capacity *  [4                              ][TB v]  [Remove]
03  Drive 3 capacity *  [4                              ][TB v]  [Remove]
04  Drive 4 capacity *  [8                              ][TB v]  [Remove]
[Add drive]

[Calculate capacity]  [Reset]

-------------------------------------------------------------------------------

Theoretical usable capacity                                      Result unit
10.91 TiB                                                        [TiB] [TB]
RAID 5 across 4 drives.

Raw capacity allocation                                      18.19 TiB raw
[================ usable ================][redundancy][mismatch]
Usable                                                        10.91 TiB
Redundancy                                                     3.64 TiB
Size mismatch                                                  3.64 TiB

Array behavior
Failure tolerance       Any one drive can fail.
Small random write      4 backend operations in the classic model.

> Calculation details
```

RAID 50 adds the conditional subgroup control and nested result:

```text
RAID level *
[RAID 0] [RAID 1] [RAID 5] [RAID 6] [RAID 10] [RAID 50] [RAID 60] [Linear] [JBOD]

Drives per RAID 5 subgroup *
[-] 3 [+]

Nested drive groups
GROUP              MEMBERS                   USABLE       MISMATCH
Group A, RAID 5    Drives 1, 2, 3            8.00 TB      0 TB
Group B, RAID 5    Drives 4, 5, 6            8.00 TB      2.00 TB
```

### Narrow mobile result

```text
RAID level *
[RAID 0] [RAID 1] [RAID 5]
[RAID 6] [RAID 10] [RAID 50]
[RAID 60] [Linear] [JBOD]

Drive inventory
Drive 1 capacity *
[4                     ][TB v] [x]
Drive 2 capacity *
[4                     ][TB v] [x]
Drive 3 capacity *
[4                     ][TB v] [x]
Drive 4 capacity *
[8                     ][TB v] [x]
[Add drive]

[      Calculate capacity      ]
[             Reset            ]

--------------------------------

Theoretical usable capacity
10.91 TiB
RAID 5 across 4 drives.

Result unit
[TiB] [TB]

Raw capacity allocation
18.19 TiB raw
[======== usable =====][red][mis]
Usable                 10.91 TiB
Redundancy              3.64 TiB
Size mismatch           3.64 TiB

Array behavior
Failure tolerance
Any one drive can fail.

Small random write
4 backend operations in the
classic model.

> Calculation details
```

Nested group record at narrow width:

```text
Nested drive groups

Group A, RAID 5
Members       Drives 1, 2, 3
Usable        8.00 TB
Mismatch      0 TB
--------------------------------
Group B, RAID 5
Members       Drives 4, 5, 6
Usable        8.00 TB
Mismatch      2.00 TB
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
RAID level *
[RAID 0] [RAID 1] [RAID 5] ...

Drive inventory
No drives added.
[Add drive]

[Calculate capacity]

EMPTY SUBMISSION
Drive inventory
No drives added.
Add at least 3 drives for RAID 5.
[Add drive]  <- focus

INVALID CAPACITY
Drive 2 capacity *
[0                     ][TB v] [x]
Capacity must be a positive plain decimal.  <- one error

INVALID NESTED GROUP
Drives per RAID 5 subgroup *
[-] 4 [+]
The 6 drives do not divide into equal groups of 4.  <- one error

LOADING OR CALCULATING
Not rendered. Calculation is synchronous.

EMPTY OR PARTIAL RESULT
Not rendered. Invalid input returns to the responsible field or inventory.

FAILURE
Unable to calculate this array. Check the inputs and try again.
[Calculate capacity]

EXPANDED CALCULATION DETAILS
v Calculation details
Layout                 RAID 5
Drive capacities       4 TB, 4 TB, 4 TB, 8 TB
Capacity equation      10.91 TiB + 3.64 TiB + 3.64 TiB = 18.19 TiB
Group component size   4 TB
Assumptions
- Smallest member sets each redundant group's common size.
- Filesystem and implementation overhead are excluded.
Formula version        1
Sources                 Linux kernel RAID documentation; mdadm(8); Dell Unity
```

## Removed or rejected

- Remove the outer card around the form. The shared workbench band provides the surface and full-column dividers.
- Replace native capacity and unit controls with the shared joined quantity input.
- Move Reset away from Add drive. Reset belongs with Calculate capacity because both act on the full editor.
- Remove `Empty array` above `No drives in this array yet.` Keep one empty message.
- Remove the form-level invalid result panel. Errors belong beside the drive, subgroup field, or inventory that can fix them.
- Remove the mixed-size warning sentence that repeats the Size mismatch value already shown in the allocation legend.
- Replace the page-owned monochrome capacity bar and duplicate value list with one shared categorical `ToolAllocationBar`.
- Remove the one-group drive arrangement strip. It repeats the inventory without adding a relationship.
- Replace nested drive cards or strips with a desktop comparison table and flat mobile group records.
- Remove the generic RAID backup callout from the workbench. Keep backup guidance in supporting page content.
- Remove the equal-weight result fact blocks. Failure tolerance and the small random write reference belong in one quiet key-value list.
- Keep one calculation disclosure. Do not create separate formula, assumptions, source, raw result, or diagnostic panels.
- Do not show raw capacity, usable capacity, redundancy, mismatch, unavailable capacity, and drive count as a dashboard grid.
- Do not use a pie chart, gauge, progress bar, timeline, marker drawing, screenshot, status badge, or colored warning panel.
- Do not add batch drive-count controls, presets, filesystem reserve, stripe size, rebuild time, performance estimates, or controller-specific options. The version 1 engine does not calculate them.
- Do not wrap the form, inventory, answer, allocation, group result, or evidence in nested cards.
- Do not serialize the RAID 5 default, empty inventory, display unit, or an initial result into the clean URL.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A valid submission renders exactly one dominant `Theoretical usable capacity` value before every other result region. | Browser role and text-order assertion at desktop and 320 px. |
| UI-002 | deduplication | Usable capacity appears as the lead and allocation segment only; raw, redundancy, mismatch, failure tolerance, and write reference each have one supporting home. | Browser text count plus contract-backed source inspection. |
| UI-003 | visual-truth | The allocation bar uses exact BigInt proportions for usable, redundancy, and mismatch; zero and tiny values receive no fake minimum width and remain labelled. | Engine fixture plus rendered segment-width and legend assertions. |
| UI-004 | responsive | At 320 px, every control and result stays inside the viewport; remove actions keep a stable final column; nested group records expose every field without page-level overflow. | Browser bounding-box and document scroll-width assertions with long values. |
| UI-005 | url | Opening `/raid-calculator` leaves the URL unchanged through hydration. URL state appears only after a deliberate valid edit, and Reset restores the clean route. | Browser history and URL assertions. |
| UI-006 | required-inputs | RAID level, every drive capacity and unit, and conditional subgroup size stay visible, marked required, and keyboard operable whenever they affect the result. | Browser accessibility snapshot and keyboard tests for RAID 5, RAID 50, and RAID 60. |
| UI-007 | validation | Empty, malformed, minimum-count, even-pair, and subgroup-divisibility failures render once beside their recovery owner and focus the first invalid owner. | Browser invalid-state tests mapped to engine fixtures. |
| UI-008 | stale-result | Editing RAID level, subgroup size, any drive capacity or unit, adding a drive, or removing a drive removes the old result before the next calculation. | Browser interaction tests for every result-driving input. |
| UI-009 | nested-topology | RAID 10, RAID 50, and RAID 60 show exact group membership and conditional failure tolerance; single-group layouts do not render a redundant topology region. | Browser tests across nested and single-group fixtures. |
| UI-010 | states | Initial, invalid, success, mixed-size, restored, failed, unit-changed, maximum-drive, and expanded states retain one primary action and one status or error message per event. | Browser state matrix in both themes. |
| UI-011 | accessibility | Add focuses the new capacity, remove returns focus to a stable row action, result changes announce once, and details use native disclosure semantics. | Keyboard and live-region browser tests. |
| UI-012 | design | The workbench spans the full main column with neutral rules, no outer form card, no nested result cards, 2 px bounded controls, and one accent-filled primary button. | Browser screenshot review in dark and light themes. |

## Open questions and blockers

- None. The version 1 engine and brief resolve every input, output, state, and scope decision needed for this retrofit.
