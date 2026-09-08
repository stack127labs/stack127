# Interface contract: Storage layout advisor

Status: ready
Tool: Storage layout advisor
Route: `/storage-layout-advisor`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:24f576ee0a3fd88be13c2af9afa1c854d3b8030b3b60b1148bf3fe64b5dda6b9`

## User task

- Primary user: A homelab owner choosing a protected layout for a real drive inventory and workload.
- Question: Which eligible layout best fits the selected workload and protection target, and what exact capacity tradeoff does it make?
- Lead answer: The top-fit layout name and its usable capacity.
- Next decision: Choose that layout, compare an eligible alternative, or change inventory and goals.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Drive inventory | What hardware is available? | User input | input | Every drive changes candidates and capacity. | Keep one repeatable editor. |
| Platform | Which implementations can be considered? | User input | input | It filters candidates. | Show once as choices. |
| Workload | Which transparent fit rubric applies? | User input | input | It changes ranking without changing capacity. | Show once as choices. |
| Protected failures | What minimum tolerance must every result meet? | User input | input | It filters eligibility. | Keep visible; never hide a mandatory goal. |
| Best fit | Which layout ranks first? | Engine | lead | It is the main decision. | Show once as the large answer. |
| Top-fit allocation | Where does the selected raw capacity go? | Engine | supporting | Usable, redundancy, and mismatch reconcile exactly. | One allocation owns top-fit capacity facts. |
| Eligible alternatives | What other layouts meet the goal? | Engine | evidence | Repeated comparable facts need a table. | Exclude the top fit from alternative rows. |
| Topology | Where are drives grouped and where does failure tolerance depend on placement? | Engine | evidence | Spatial grouping communicates the boundary better than prose. | Draw only the top fit. |
| Share URL | Can I preserve the comparison? | Serializer | evidence | Explicit share is useful. | Show only after Share. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Drive capacity and unit rows | required | yes | two 4 TB drives | visible | `ToolRepeatableList` with `ToolQuantityInput` | Each drive changes all candidates. | Rows stack; remove stays reachable. |
| 2 | Add drive | secondary action | yes | no default | visible | `ToolButton` | Extends inventory up to 64 rows. | Follows rows. |
| 3 | Platform | defaulted | yes | any platform | visible | `ToolChoiceGroup` | It filters representable layouts. | Choices wrap. |
| 4 | Workload | defaulted | yes | general | visible | `ToolChoiceGroup` | It controls the disclosed ranking rubric. | Choices wrap. |
| 5 | Protected failures | defaulted | yes | one | visible | `ToolChoiceGroup` | It is the mandatory eligibility threshold. | Four compact choices wrap. |
| 6 | Display unit | defaulted | no | TiB | visible | `ToolChoiceGroup` | It changes display only and should not live inside results. | Two choices. |
| 7 | Compare layouts | primary action | not applicable | no default | visible | `ToolButton` | Validates and ranks. | Full width before Reset. |
| 8 | Reset | secondary action | no | no default | visible | `ToolButton` | Restores documented defaults. | Full width after Compare. |
| 9 | Share layout | secondary action | no | no default | result | `ToolButton` | Creates explicit versioned URL. | Full width when needed. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Best fit | Which layout ranks first and how much is usable? | Name, usable bytes, tolerance, efficiency, fit reason | `ToolPrimaryResult` with a compact detail | Do not repeat the top fit as an alternative row. |
| 2 | Capacity allocation | How does raw capacity split for the top fit? | Usable, redundancy, mismatch, raw | Categorical `ToolAllocationBar` | Exact legend owns these values. |
| 3 | Eligible alternatives | Which other layouts meet the target? | Remaining candidates and comparable facts | `ToolDataTable` | Render only alternatives; show a short none state when empty. |
| 4 | Top-fit topology | How are drives grouped? | Candidate groups, common size, drive IDs, tolerance statement | Compact semantic topology figure | Geometry must match engine groups; no generic decoration. |
| 5 | Action and boundary | Can I share, and what remains platform-specific? | Share URL and theoretical-model boundary | `ToolActionRow` plus one short sentence | Detailed platform caveats remain below the workbench. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Capacity allocation | Usable, redundancy, and mismatch as exact parts of raw | Yes, exact bytes share raw as denominator. | Use categorical `ToolAllocationBar`. |
| Topology | Engine-selected groups and their member drives | Yes, containment maps directly to candidate groups. | Use one compact topology for the best fit. |
| Candidate table | Repeated alternative capacity and tolerance facts | Yes, aligned rows enable exact comparison. | Use `ToolDataTable`. |
| Score progress bar | Relative fit score | No, the score has no stable user-facing denominator. | Omit; explain the fit with one short reason. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Defaults and all active goals visible | Absent | Absent | No empty-state panel | Normal focus order. |
| Invalid drive | Preserve inventory | Absent | Absent | Local error in the affected row | Focus first invalid control. |
| No eligible layout | Preserve inventory and goals | Absent | Absent | One concise recovery result | Focus no-result heading and announce. |
| Success | Inputs remain | Best fit visible first | Allocation, alternatives, topology | One theoretical-model boundary | Focus result heading and announce. |
| Changed after success | Preserve edit | Remove stale result | Remove support and share URL | No stale values | Keep focus. |
| Shared valid state | Restore and compare | Visible | Visible | Quiet restored status | Announce without stealing focus. |
| Shared invalid state | Restore defaults and clean URL | Absent | Absent | One restore failure | Announce once. |
| Share failure | Result remains | Remains | URL absent or selectable | One action failure | Announce once. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Drive inventory | `ToolRepeatableList` with `ToolQuantityInput` | Stable row schema, shared errors, deliberate add/remove behavior. | Native inputs and floating remove buttons. |
| Goals | `ToolChoiceGroup` | Few options remain visible and scannable. | Native selects that hide mandatory choices. |
| Best fit | `ToolPrimaryResult` | One decision and value dominate. | Text heading plus separate metric card. |
| Exact capacity whole | `ToolAllocationBar` | Three exact categories reconcile to raw. | Hand-built black-and-white bar. |
| Alternative comparison | `ToolDataTable` | Repeated fields stay aligned. | One card per layout. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Inventory, goals, actions, divider, lead, allocation, alternatives, topology | 64-drive inventory and long platform layout label | Alternatives table only. |
| 760px | Drive rows and choices wrap deliberately | `Striped mirrors / RAID 10` | Table viewport only. |
| 375px and 320px | Drive fields and actions stack; topology groups wrap; alternatives retain labels | Large TiB values and tolerance statement | Table scrolls internally; page has none. |

## Interface wireframes

### Desktop result

```text
Drives 4 / 64
[4 TB] [remove]  [4 TB] [remove]  [4 TB] [remove]  [4 TB] [remove]
[Add drive]
Platform * [Any] [Linux md] [OpenZFS] [NAS RAID]
Workload * [General] [Bulk files] [VMs and databases]
Protected failures * [0] [1] [2] [3]
Display unit * [TB] [TiB]
[Compare layouts] [Reset]
------------------------------------------------------------------
Best fit
RAID 6 / RAIDZ2
8 TB usable · protects against 2 drive failures

[usable | redundancy | mismatch]
[exact legend]

Eligible alternatives [table excluding top fit]
Top-fit topology [exact engine groups]
[Share layout]
Theoretical capacity; verify the platform's layout and expansion rules.
```

### Narrow mobile result

```text
[stacked drive rows]
[Add drive]
[wrapped goal choices]
[Compare layouts]
[Reset]
----------------------------
Best fit
RAID 6 / RAIDZ2
8 TB usable
[allocation and legend]
[scrollable alternatives]
[wrapped topology groups]
[Share layout]
[boundary]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

The initial state shows the complete editor and no placeholder result. Invalid and no-eligible states retain inputs and provide one recovery path. Calculation is synchronous, so loading, upstream, and partial states do not apply. The share URL appears only after explicit action.

## Removed or rejected

- Remove the duplicate top-fit row from the alternatives table.
- Remove display-unit control from the result and keep it with the inputs.
- Replace native controls and the hand-built allocation with shared components.
- Remove the standalone fit-reason paragraph; keep one concise detail inside the lead.
- Do not expose the internal fit score or draw it as progress.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Best-fit name and usable capacity are the first and largest result and appear once as a result region. | Browser and source assertions. |
| UI-002 | deduplication | The top fit is absent from alternatives; capacity values have one owner in lead or allocation. | Browser and text-count assertions. |
| UI-003 | visual-truth | Allocation widths use exact bytes and topology groups match engine output. | Browser and engine fixtures. |
| UI-004 | responsive | At 1280, 760, 375, and 320 pixels only the alternatives table may scroll and the page never does. | Browser bounds and screenshots. |
| UI-005 | url | Clean load stays unchanged; only Share creates state; edits and Reset clean it. | Browser URL assertions. |
| UI-006 | inputs | Every drive and mandatory goal remains visible; changing platform, workload, or tolerance affects the next comparison as contracted. | Browser interaction matrix. |
| UI-007 | states | Initial, invalid, no-eligible, success, restored, and share-failure states remain compact and recoverable. | Browser fixtures. |

## Open questions and blockers

- No unresolved interface decision blocks implementation. Ranking remains the transparent engine rubric, not a universal recommendation.
