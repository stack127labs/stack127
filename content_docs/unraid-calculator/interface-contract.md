# Interface contract: Unraid Main Array calculator

Status: ready
Tool: Unraid Main Array calculator
Route: `/unraid-calculator`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:5ae019a3f1be087af75a4fb8c6d0dd33ce4814081f23ce3066d75383e34f667e`

## User task

- Primary user: A homelab builder assigning mixed disks to Unraid Main Array parity and data roles.
- Question: How much array-level data capacity will these assigned drives provide, and does one planned future drive fit the parity ceiling?
- Lead answer: Current array-level data capacity.
- Next decision: Keep or change the drive roles, then resolve any parity dependency before adding a future drive.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Parity protection | How many drive failures should parity cover? | User input | input | It determines required parity roles and the failure boundary. | Show the choice once and protection once in the result. |
| Parity drives | Which explicit drives hold parity? | User input | input | Their capacities validate the current array and set the future-drive ceiling. | Do not repeat IDs outside the assigned-drive evidence table. |
| Data drives | Which explicit drives hold data? | User input | input | Their sum is the lead answer. | Do not add a second inventory summary. |
| Proposed data drive | Will one future drive fit? | User input | supporting | It is optional and has no effect on current capacity. | Keep in a named disclosure; render growth only when supplied. |
| Data capacity | How much current array-level data capacity exists? | Engine | lead | This is the main planning answer. | Show once as the large result. |
| Capacity allocation | How much installed capacity is data versus parity? | Engine | supporting | Both categories form the exact raw installed whole. | The allocation legend owns data, parity, and raw accounting. |
| Protection and parity ceiling | What failure boundary and future size limit apply? | Engine | supporting | These values guide the next decision. | Omit largest-data and headroom rows when they do not add a distinct decision. |
| Assigned roles | Did the calculation preserve my intended role assignments? | Engine | evidence | A repeated-field table verifies every drive. | Put it in one disclosure after the readable result. |
| Growth result | Can the proposed data drive be added under the current parity ceiling? | Engine | supporting | It is a separate future scenario, not part of current capacity. | Never show a projected number when blocked. |
| Formula and sources | How can I audit the boundary? | Engine contract | evidence | Exact formula and unit definitions are useful but secondary. | Keep one concise disclosure; do not repeat supporting prose. |
| Rows-to-add control | Can I bulk-add blank rows? | Current UI | omit | It adds another control and is unnecessary beside Add data drive. | Remove it entirely. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Parity protection | defaulted | yes | Single parity product default | visible | `ToolChoiceGroup` | It changes visible required roles and result context. | Three choices wrap as authored rows. |
| 2 | Parity drive capacities and units | conditional required | yes | Derived from parity choice; values user supplied | conditional | `ToolQuantityInput` rows | Every selected parity role must validate against data drives. | Value, unit, and label stay in one row. |
| 3 | Data drive capacities and units | required | yes | user supplied | visible | `ToolRepeatableList` with `ToolQuantityInput` | Their sum is the lead answer. | Each row keeps value, unit, and remove action reachable. |
| 4 | Add data drive | secondary action | yes | no default | visible | `ToolButton` | Extends the required inventory. | Follows current rows. |
| 5 | Future data drive | optional | no | absent | disclosure | `ToolDisclosure` and `ToolQuantityInput` | It adds a distinct growth check without changing current capacity. | Disclosure and joined field stay within the form width. |
| 6 | Calculate capacity | primary action | not applicable | no default | visible | `ToolButton` | Produces the current answer and optional growth check. | Full width before Reset. |
| 7 | Reset | secondary action | no | no default | visible | `ToolButton` | Restores the known single-parity editor. | Full width after Calculate. |
| 8 | Result unit | defaulted display preference | no | TiB | result | `ToolChoiceGroup` | Changes display only. | Compact row before the lead. |
| 9 | Copy summary | secondary action | no | no default | result | `ToolButton` | Copies the readable result. | Stacks before Share. |
| 10 | Share configuration | secondary action | no | no default | result | `ToolButton` | Explicitly creates stateful URL input. | Stacks after Copy. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Data-capacity answer | How much current data capacity exists? | `dataCapacityBytes` | `ToolPrimaryResult` with drive-role count detail | Do not repeat data capacity in another metric group. |
| 2 | Array boundary | What protects the array and what is the future-drive ceiling? | `protection`, `parityFloorBytes` | `ToolKeyValueList` with at most two rows | Omit largest-data and parity-headroom rows from the default result. |
| 3 | Installed allocation | Where does raw installed capacity go? | Data capacity and assigned parity capacity against raw | Two-segment `ToolAllocationBar` using accent palette | Legend contains exact data and parity values; raw remains the denominator, not a third segment. |
| 4 | Future drive | Does the optional future drive fit? | `growth` | One finite status, then projected capacity or required dependency rows | Absent input means absent region; blocked means no projected value. |
| 5 | Assigned drives | Were explicit roles preserved? | `topology` | `ToolDisclosure` containing `ToolDataTable` | No duplicate role topology outside this disclosure. |
| 6 | Formula and actions | How can I audit or preserve the result? | Formula identifier, unit boundary, sources, copy and share | Concise `ToolDisclosure`, then action row | Remove prose fragments that repeat accounting or backup guidance. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Allocation bar | Data and parity as exact parts of raw installed capacity | Yes, both share one byte denominator. | Use accent palette with exact legend values. |
| Assigned-drive table | Repeated role, ID, and capacity fields | Yes, rows preserve explicit assignments. | Use a table inside a disclosure. |
| Growth sequence | Required parity upgrades before adding a blocked drive | Yes, order represents a real dependency, not time. | Use ordered dependency rows, not a timeline. |
| Progress bar | Progress toward a target | No target exists. | Omit. |
| Equal metric cards | Data, parity, raw, ceiling, headroom | No shared hierarchy or comparable job. | Replace with one lead, allocation, and two boundary rows. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Single parity visible, one blank parity row, no data rows, Add and Reset visible | Absent | Absent | No empty-state paragraph | Normal focus order. |
| Incomplete row | Preserve every role and value | Absent | Absent | One local error per affected row | Focus first invalid capacity. |
| No data drive | Preserve parity state | Absent | Absent | One group error beside Data drives | Focus Add data drive. |
| Undersized parity | Preserve roles | Absent | Absent | Each offending parity row states required minimum once | Focus first undersized parity input. |
| Success without future drive | Inputs remain editable | Visible first | Boundary, allocation, disclosures | No growth region | Focus result heading and announce data capacity. |
| Eligible future drive | Inputs remain | Current lead unchanged | Growth shows capacity gain and projected data capacity | No projected raw value unless needed for action | Announce current answer, not every supporting value. |
| Blocked future drive | Inputs remain | Current lead unchanged | Growth shows blocked status and each parity dependency | No projected capacity | Announce blocked growth after current result. |
| Changed after success | Preserve the edit | Remove stale answer | Remove stale support | No stale-result panel | Quietly return to input state. |
| Invalid shared state | Clean single-parity editor | Absent | Absent | One restore failure; remove query state | Announce without stealing focus. |
| Clipboard failure | Inputs and result remain | Remains | Keep generated URL or summary selectable when available | One copy failure | Announce once. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Parity decision | `ToolChoiceGroup` | All three important modes remain visible with radio semantics. | Dropdown. |
| Role rows | `ToolQuantityInput` and `ToolRepeatableList` | Capacity and unit stay joined; data roles support add and remove. | Separate inputs and native selects. |
| Optional future scenario | `ToolDisclosure` | Its absent state does not change the lead answer. | Always-visible optional panel. |
| Lead | `ToolPrimaryResult` | One current capacity answer deserves dominance. | Heading made from the formatted value and equal cards. |
| Allocation | `ToolAllocationBar` | Data and parity are exact parts of raw. | Page-owned bar plus duplicate definition list. |
| Evidence | `ToolDataTable` inside `ToolDisclosure` | Every drive repeats the same schema and remains available for audit. | Always-open topology and cards. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Parity choice, parity rows, data rows, future disclosure, actions, divider, result unit, lead, boundary, allocation, growth, evidence | 64 role rows and `1,000,000,000,000.00 TiB` | Assigned-drive table only. |
| 760px | Same order; role rows use explicit joined capacity controls; action row wraps deliberately | `SHR-2` is irrelevant; `Dual parity` and long capacity errors fit | Table viewport only. |
| 375px and 320px | Choices and actions stack; each remove action remains reachable; allocation legend is one column | `Parity 2 must be at least as large as the largest data drive` | Field error wraps; table scrolls internally; page has no overflow. |

## Interface wireframes

### Desktop result

```text
Parity protection *  [None] [Single] [Dual]

Parity drives  1
Parity 1  [8            TB v]

Data drives  4 / 63
01 [8                  TB v] [remove]
02 [8                  TB v] [remove]
03 [4                  TB v] [remove]
04 [4                  TB v] [remove]
[Add data drive]

> Plan a future data drive

[Calculate capacity] [Reset]
------------------------------------------------------------
Result unit [TiB] [TB]
Current data capacity
21.83 TiB
4 data drives · 1 parity drive

Protection       1 drive
Parity ceiling   7.28 TiB

[data | assigned parity]
Data 21.83 TiB       Assigned parity 7.28 TiB

> Assigned drives
> Formula and sources
[Copy summary] [Share configuration]
```

### Narrow mobile result

```text
Parity protection *
[None] [Single] [Dual]

Parity drives 1
Parity 1 [8       TB v]

Data drives 4 / 63
01 [8           TB v] [x]
02 [8           TB v] [x]
03 [4           TB v] [x]
04 [4           TB v] [x]
[Add data drive]
> Plan a future data drive
[Calculate capacity]
[Reset]
----------------------------
Result unit [TiB] [TB]
Current data capacity
21.83 TiB
4 data drives · 1 parity drive
Protection      1 drive
Parity ceiling  7.28 TiB
[allocation]
[legend]
> Assigned drives
> Formula and sources
[Copy summary]
[Share configuration]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

The initial state has no result or explanatory empty panel. Invalid values stay in place with one local error. Calculation is synchronous, so there is no loading or partial result. The future-drive disclosure expands inside the form. Assigned drives and formula disclosures expand inside the result and own their table or long links. Shared-state failure returns to the clean canonical URL.

## Removed or rejected

- Remove the Rows to add number field and Add rows action.
- Remove the `No data drives yet` empty panel and IDs displayed beside editable rows.
- Move Proposed data drive into `Plan a future data drive`; it is optional and does not change current capacity.
- Remove `Array-level result`, the raw-capacity sentence below the heading, and `Data plus parity equals raw`.
- Remove duplicate Data capacity and Raw installed capacity rows from the accounting region. The lead and allocation already show them.
- Remove Largest data drive and Parity headroom from the default result.
- Move Assigned roles into one evidence disclosure and remove its repeated visible heading/caption.
- Replace the paragraph-heavy growth block with a status, one projected value, or dependency rows.
- Keep backup and filesystem limitations in supporting content below the workbench, not in the result.
- Do not add cards, a timeline, a progress bar, or a generic RAID comparison.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Current data capacity is the first and largest result and appears once. | Browser and text count. |
| UI-002 | deduplication | Data, parity, and raw accounting are not repeated across a heading, metric list, and note. | Browser and source assertions. |
| UI-003 | visual-truth | Allocation widths use exact bytes and both segments keep visible labels and values. | Browser measurement and engine fixtures. |
| UI-004 | responsive | At 1280, 760, 375, and 320 pixels, all fields and results remain inside the page; only the assigned-drive table may scroll. | Browser bounds and overflow assertions. |
| UI-005 | url | Opening `/unraid-calculator` leaves the URL unchanged through hydration; only Share adds query state. | Browser URL assertion. |
| UI-006 | inputs | Parity mode and every active role capacity and unit remain visible; changing one clears stale results and changes or invalidates the next answer. | Browser interaction. |
| UI-007 | optional | With no proposed drive, no growth result appears; eligible and blocked inputs render mutually exclusive growth states. | Browser fixtures. |
| UI-008 | errors | Each invalid field or restore failure appears once and preserves other valid inputs. | Browser invalid-state tests. |

## Open questions and blockers

- No unresolved decisions. The builder can implement this contract without changing the information model.
