# Interface contract: Synology SHR capacity calculator

Status: ready
Tool: Synology SHR capacity calculator
Route: `/shr-calculator`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:7c4b0c3d48652afb116607eeefbedb6dff3ab3074c80d573367e5c24a653a2d3`

## User task

- Primary user: A homelab builder choosing drives and protection for a new Synology pool.
- Question: How much usable capacity will this mixed drive set provide in SHR-1 or SHR-2?
- Lead answer: Estimated pool capacity after the modeled per-drive system reserve.
- Next decision: Choose the protection mode and drive set to build or buy.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Protection mode | How many drive failures should the pool tolerate? | User input | input | It changes parity width and the lead answer. | Show once in the input flow and once as result context, not as a second answer. |
| Drive inventory | Which capacities make up the pool? | User input | input | Every drive changes the tier model. | Do not repeat the full inventory in the result. |
| Estimated pool capacity | How much modeled pool capacity remains? | Engine | lead | This is the reason to use the calculator. | Show once as the large answer. |
| Fault tolerance | What failure boundary did this mode model? | Engine | supporting | It qualifies the selected result. | Keep as one short value beside the lead context. |
| Capacity allocation | Where did raw drive space go? | Engine | supporting | Data, reserve, protection, and unused space form one exact whole. | The allocation legend owns these exact values; remove separate protection and unused metric cards. |
| Capacity bands | Why do mixed drive sizes produce this allocation? | Engine | evidence | Repeated bands share the same fields and make the estimate auditable. | Do not restate the band explanation inside the result. |
| Alternate SHR mode result | What would the other protection mode provide? | Engine | omit | It competes with the selected answer and the user can switch modes directly. | Do not render an unused comparison region. |
| Share state | Can I preserve this configuration? | Route serializer | evidence | It is useful after a valid calculation and must remain explicit. | Show only after success. |
| Fresh-pool caveat | What does this estimate exclude? | Product contract | supporting | The boundary prevents interpreting the result as existing-pool free space. | Keep one short sentence below the structured result; detailed prose remains below the workbench. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Protection mode | defaulted | yes | SHR-1 product default | visible | `ToolChoiceGroup` | The active protection assumption changes capacity. | Full-width wrapping choice row. |
| 2 | Drive capacity and unit rows | required | yes | user supplied | visible | `ToolRepeatableList` with `ToolQuantityInput` | The drive set is the calculation. | Each row keeps value, unit, and remove action on one authored row. |
| 3 | Add drive | secondary action | yes | no default | visible | `ToolButton` | Extends the required inventory. | Sits after the current rows at full width when needed. |
| 4 | Calculate capacity | primary action | not applicable | no default | visible | `ToolButton` | Produces the answer after the inventory is complete. | Full width before secondary actions. |
| 5 | Reset | secondary action | no | no default | visible | `ToolButton` | Restores a known clean state. | Follows the primary action. |
| 6 | Result unit | defaulted display preference | no | TB | result | `ToolChoiceGroup` | Changes formatting without changing source bytes. | Compact row above the lead answer. |
| 7 | Copy result | secondary action | no | no default | result | `ToolCopyAction` | Preserves a readable result. | Wraps below result details. |
| 8 | Share configuration | secondary action | no | no default | result | `ToolButton` | Creates an opt-in stateful URL. | Wraps after Copy result. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Capacity answer | How much modeled pool capacity is available? | `estimatedPoolCapacityBytes`, selected unit | `ToolPrimaryResult` with one short mode and drive-count detail | Do not repeat the value in a metric group. |
| 2 | Fault tolerance | What protection did this result use? | Selected mode and parity drive count | One compact key/value row | Do not add a sentence that restates the mode label. |
| 3 | Capacity allocation | Where did the raw capacity go? | Estimated pool, system reserve, protection, unused | `ToolAllocationBar` with categorical tones and exact values | The legend replaces the current duplicate protection and unused cards. |
| 4 | Capacity bands | How did mixed sizes create those totals? | Band range, active drives, data, protection, unused | `ToolDataTable` | The table owns repeated band facts and scrolls inside its viewport. |
| 5 | Boundary and actions | What can I trust or preserve? | Fresh-pool boundary, copy and share actions | One sentence followed by secondary actions | No paragraph about ordinary controls or repeated capacity facts. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Allocation bar | Each allocation category as a proportion of raw capacity | Yes, exact byte values share one denominator. | Use a categorical `ToolAllocationBar`; labels and exact values remain visible. |
| Capacity-band table | Repeated tier fields across mixed-size bands | Yes, rows and columns preserve exact comparisons. | Use `ToolDataTable`. |
| Progress bar | Completion toward a target | No target exists. | Omit. |
| Timeline | Ordered time or duration | No time sequence exists. | Omit. |
| Comparison cards | Selected and alternate SHR mode | No necessary relationship beyond a choice the user can switch. | Omit. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Visible mode, empty inventory, Add, Reset, disabled Calculate | Absent | Absent | No instructional panel | Focus follows normal document order. |
| Invalid capacity | Preserve all rows | Absent | Absent | One error below the affected field | Focus the first invalid capacity. |
| Too few drives | Preserve all rows and mode | Absent | Absent | One group error states the selected mode minimum | Focus the protection choice or first missing row action. |
| Success | Inputs remain editable; result unit and actions appear | Visible first | Allocation and bands follow | One short boundary sentence | Announce the lead answer and focus its heading. |
| Changed after success | Preserve edits | Removed as stale | Removed | No stale warning panel | Quietly return to input state. |
| Shared valid state | Restore inputs and calculate | Visible | Visible | One quiet restore status | Announce restore without stealing focus. |
| Shared invalid state | Clean input state | Absent | Absent | One restore failure with usable clean form | Remove invalid query state and announce failure. |
| Clipboard failure | Inputs and actions remain available | Result remains | Supporting result remains | Keep the share URL selectable | Announce that copy failed. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Protection decision | `ToolChoiceGroup` | Both important choices stay visible with radio semantics. | Select, because it would hide a result-driving assumption. |
| Drive inventory | `ToolRepeatableList` and `ToolQuantityInput` | They keep add/remove behavior and value/unit as one decision. | Separate native number and select controls. |
| Lead answer | `ToolPrimaryResult` | One value deserves clear dominance. | Equal metric cards, because they flatten hierarchy. |
| Allocation | `ToolAllocationBar` | Exact parts share one meaningful whole. | Page-owned bar and duplicate metric cards. |
| Tier evidence | `ToolDataTable` | Every band has the same fields. | Prose or stacked fact cards. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Mode, inventory, action row, divider, result unit, lead, fault tolerance, allocation, table, boundary, actions | `1,000,000,000,000.00 TiB` and 32 drive rows | Only the capacity-band table viewport. |
| 760px | Same order; rows use explicit value, unit, remove columns; actions wrap deliberately | `SHR-2, two-drive protection` | Only the table viewport. |
| 375px and 320px | Stack mode choices and actions; each drive row keeps its remove action reachable; legend becomes one column | Long decimal capacity and `Unused high tiers` | Quantity field and table own any internal clipping or scroll; page has none. |

## Interface wireframes

### Desktop result

```text
Protection mode  [SHR-1] [SHR-2]

Drives                                      4 / 32
01  [4             TB v] [remove]
02  [4             TB v] [remove]
03  [8             TB v] [remove]
04  [8             TB v] [remove]
[Add drive]

[Calculate capacity] [Reset]
------------------------------------------------------------
Result unit  [TB] [TiB]

Estimated pool capacity
15.96 TB
SHR-1 with 4 drives

Fault tolerance   1 drive

[estimated pool | reserve | protection | unused]
 exact allocation legend

Capacity bands
| Band      | Drives | Data  | Protection | Unused |
| 0 to 4 TB | 4      | 12 TB | 4 TB       | 0 TB   |
| 4 to 8 TB | 2      | 4 TB  | 4 TB       | 0 TB   |

Fresh-pool estimate. Filesystem overhead and expansion history are not modeled.
[Copy result] [Share configuration]
```

### Narrow mobile result

```text
Protection mode
[SHR-1]
[SHR-2]

Drives 4 / 32
01 [4       TB v] [remove]
02 [4       TB v] [remove]
03 [8       TB v] [remove]
04 [8       TB v] [remove]
[Add drive]
[Calculate capacity]
[Reset]
----------------------------
Result unit [TB] [TiB]
Estimated pool capacity
15.96 TB
SHR-1 with 4 drives
Fault tolerance  1 drive
[allocation]
[legend rows]
[scrollable band table]
[boundary]
[Copy result]
[Share configuration]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

The initial state shows the visible protection assumption and empty inventory with no result. Invalid rows keep their values and show one local error. A mode-count error appears once. Calculation is synchronous, so there is no loading or partial state. Success reveals the result in the order above. Sharing reveals only the selectable URL and copy action without widening the page.

## Removed or rejected

- Remove `Build the drive inventory`, its explanatory paragraph, the `2 to 32 drives` eyebrow, and the helper sentence above the rows. Labels and the count already communicate the input.
- Remove the result preamble `This is the modeled capacity...`; the lead detail carries mode and drive count.
- Remove separate Protection and Unused metric cards because the allocation legend contains those exact values.
- Remove percentages from the visible allocation legend. Exact capacity values and bar geometry are enough.
- Do not render the calculated alternate-mode result.
- Do not add a nested result card, progress bar, timeline, marker art, or repeated raw-capacity summary.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | The estimated pool capacity is the first and largest result value, shown once. | Browser and role assertion. |
| UI-002 | deduplication | Protection and unused capacities appear once in the allocation legend, not in separate metric cards. | Browser text counts and source test. |
| UI-003 | visual-truth | Allocation widths use exact byte values, and every category keeps a visible label and exact value. | Browser measurement and engine fixtures. |
| UI-004 | responsive | At 1280, 760, 375, and 320 pixels, controls and results stay inside the page; only the band table may scroll horizontally. | Browser bounds and overflow assertions. |
| UI-005 | url | Opening `/shr-calculator` leaves the URL unchanged through hydration; only Share creates query state. | Browser URL assertion. |
| UI-006 | inputs | SHR mode and every drive value and unit stay visible, and changing any of them clears stale results and changes the next answer. | Browser interaction test. |
| UI-007 | errors | Each validation or restore error appears once and preserves valid input. | Browser invalid-state tests. |

## Open questions and blockers

- No unresolved decisions. The builder can implement this contract without changing the information model.
