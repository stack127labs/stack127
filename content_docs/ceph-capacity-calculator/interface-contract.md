# Interface contract: Ceph capacity and failure-domain planner

Status: ready
Tool: Ceph capacity and failure-domain planner
Route: `/ceph-capacity-calculator`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A small-cluster operator comparing a Ceph protection profile against a known OSD inventory.
- Question: What capacity should I plan to use, does the profile fit the entered failure domains, and what remains after losing the largest domain?
- Lead answer: Planning target after protection overhead and the selected reserve.
- Next decision: Change profile, reserve, or domain inventory before buying drives or writing a CRUSH rule.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Protection mode and profile | Which capacity ratio and placement minimum apply? | User input | input | Replication or EC and its active values change every result. | Keep all active profile inputs visible. |
| Failure-domain level | What does each label represent? | User input | input | It changes interpretation and result language. | Show once in form and contextual result labels. |
| Planning reserve | How much modeled usable capacity should remain unallocated? | User input | input | It changes the planning target. | Show once as input and once as allocation category. |
| OSD batches | What capacity exists in each named domain? | User input | input | Counts, sizes, and labels drive capacity and placement. | Do not repeat the input rows in result prose. |
| Planning target | How much capacity should the plan use after reserve? | Engine | lead | It is the actionable capacity number. | Show once as the large answer. |
| Capacity composition | Where does raw capacity go? | Engine | supporting | Target, reserve, and protection overhead exactly reconcile to raw. | One allocation legend owns exact category values. |
| Placement status | Does the profile fit the current domains? | Engine | supporting | It determines whether the plan is valid and how much domain headroom exists. | One compact status plus required and entered counts. |
| Largest-domain loss | What remains when the largest entered domain is unavailable? | Engine | supporting | It exposes the selected topology's immediate weak point. | Show one conclusion and surviving raw value; do not repeat a second modeled capacity dashboard. |
| Domain inventory | How is capacity distributed across domains? | Engine | evidence | Repeated domain facts require a table. | Table owns OSD count, raw capacity, share, and largest marker. |
| Share URL | Can I preserve this plan? | Serializer | evidence | Explicit share is useful and contains labels. | Show only after success and explicit action. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Protection mode | defaulted | yes | Replicated | visible | `ToolChoiceGroup` | It selects the active capacity model. | Two choices wrap. |
| 2 | Replica size | conditional required | yes | Three copies | conditional | `ToolChoiceGroup` | It changes ratio and required domains. | Visible below Replicated choice. |
| 3 | EC data chunks and coding chunks | conditional required | yes | k=4 and m=2 | conditional | `ToolNumberField` pair | Both change ratio and required domains. | Stack at narrow width. |
| 4 | Failure domain | defaulted | no | host | visible | `ToolChoiceGroup` | It changes topology interpretation and labels. | Four choices wrap. |
| 5 | Planning reserve | defaulted | yes | 20 percent | visible | `ToolNumberField` with suffix | It changes the lead planning target. | Full width. |
| 6 | OSD batch domain, count, capacity, unit | required | yes | user supplied | visible | `ToolRepeatableList`, `ToolTextField`, `ToolNumberField`, `ToolQuantityInput` | Every batch changes capacity and placement. | Fields stack within each row; remove remains reachable. |
| 7 | Add OSD batch | secondary action | yes | no default | visible | `ToolButton` | Extends required inventory. | Follows rows. |
| 8 | Plan capacity | primary action | not applicable | no default | visible | `ToolButton` | Validates and calculates. | Full width before Reset. |
| 9 | Reset | secondary action | no | no default | visible | `ToolButton` | Clears inventory and restores model defaults. | Full width after Plan. |
| 10 | Share plan | secondary action | no | no default | result | `ToolButton` | Creates explicit stateful URL. | Full width when needed. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Planning target | How much modeled capacity should this plan use? | `planningTargetBytes` | `ToolPrimaryResult` with selected profile detail | Do not repeat target in another metric card. |
| 2 | Capacity composition | How does raw split after protection and reserve? | Target, reserve, protection overhead, raw total | Categorical `ToolAllocationBar` | Exact legend replaces separate capacity cards and accounting table. |
| 3 | Placement | Does the profile fit and how much headroom exists? | Required, entered, extra domain counts | One `ToolResultLead` plus `ToolKeyValueList` | Avoid paragraph explanation of ordinary count math. |
| 4 | Largest-domain loss | What happens to placement and raw capacity after the largest domain is removed? | Largest label, loss raw, remaining raw, remaining domains, placement state | One sentence plus at most two key/value rows | Do not call this safe or show a second lead capacity. |
| 5 | Domain inventory | How is raw capacity distributed? | Grouped domains | `ToolDataTable` | Table owns repeated domain facts and internal overflow. |
| 6 | Actions and boundary | Can I share, and what must I verify live? | Share URL and live-cluster boundary | Action row plus one short sentence | Detailed commands remain below the workbench. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Capacity allocation | Planning target, reserve, and protection as parts of raw | Yes, exact byte categories share raw as denominator. | Use categorical `ToolAllocationBar`. |
| Domain table | Repeated domain capacity and share fields | Yes, aligned rows preserve exact comparisons. | Use `ToolDataTable`. |
| Loss timeline | Baseline to domain loss | No, no time axis exists. | Omit; use a sentence and values. |
| Progress bar | Domains entered toward requirement | No, a denominator exists but a bar would overstate a small count check. | Omit; use exact counts. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | All active defaults visible, empty inventory, Add and Reset available | Absent | Absent | No helper panel | Normal focus order. |
| Invalid batch | Preserve all rows | Absent | Absent | Local errors under fields | Focus first invalid field. |
| Insufficient domains | Preserve inventory and model | Absent | Absent | One group error states required distinct count | Focus first domain label or profile control. |
| Success | Inputs remain | Visible first | Composition, placement, loss, table | One live-cluster boundary sentence | Focus result heading and announce target. |
| Changed after success | Preserve edit | Remove stale result | Remove support and share URL | No stale panel | Keep focus. |
| Shared valid state | Restore inputs and result | Visible | Visible | One quiet restored status | Announce without stealing focus. |
| Shared invalid state | Restore clean form and URL | Absent | Absent | One restore failure | Announce once. |
| Clipboard failure | Result remains | Remains | Share URL remains selectable | One copy failure | Announce once. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Model choices | `ToolChoiceGroup` and `ToolNumberField` | Active result-driving assumptions remain visible. | Dropdowns or advanced disclosure. |
| OSD inventory | Shared fields inside `ToolRepeatableList` | Each repeated batch has a stable schema and add/remove behavior. | Floating native controls. |
| Lead | `ToolPrimaryResult` | One planning number deserves dominance. | Equal capacity cards. |
| Capacity whole | `ToolAllocationBar` | Three exact parts reconcile to raw. | Separate metric cards and narrative equation. |
| Domain evidence | `ToolDataTable` | Domains repeat the same fields. | Reflowed card per domain. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Model, active profile, failure domain, reserve, batches, actions, divider, lead, allocation, placement, loss, table | 32 batches and 48-character domain labels | Domain table only. |
| 760px | Model controls and batch fields stack deliberately | `datacenter-with-a-long-reviewed-label` | Table viewport only. |
| 375px and 320px | Choices wrap, each batch becomes a vertical group, actions full width, allocation legend one column | Large capacity and validation sentence | Table scrolls internally; page has none. |

## Interface wireframes

### Desktop result

```text
Protection mode * [Replicated] [Erasure coding]
Replica size * [2] [3] [4] [5]
Failure domain * [OSD] [Host] [Rack] [Datacenter]
Planning reserve * [20 %]

OSD batches  3 / 32
[host-a] [4 OSDs] [4 TB v] [remove]
[host-b] [4 OSDs] [4 TB v] [remove]
[host-c] [4 OSDs] [4 TB v] [remove]
[Add OSD batch]
[Plan capacity] [Reset]
------------------------------------------------------------
Planning target
12.8 TB
Replicated · 3 copies · 20% reserve

[target | reserve | protection overhead]
[exact legend]

Placement minimum met
Required domains  3    Entered domains  3    Extra domains  0

Losing host-a leaves 2 of 3 required domains, so full placement is not possible.
Raw capacity lost 16 TB    Raw remaining 32 TB

Domain inventory
[table]
[Share plan]
Verify the entered inventory against the live CRUSH hierarchy and pool profile.
```

### Narrow mobile result

```text
[visible model inputs]
OSD batches 3 / 32
[stacked batch groups]
[Add OSD batch]
[Plan capacity]
[Reset]
----------------------------
Planning target
12.8 TB
[allocation]
[placement counts]
[loss conclusion]
[scrollable domain table]
[Share plan]
[boundary]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

The initial state shows every active assumption and no result. Invalid input keeps rows and shows one local error per field. Calculation is synchronous, so loading, partial, and upstream states do not apply. Share state appears only after explicit action and stays inside the result width.

## Removed or rejected

- Remove `Enter cluster shape`, the local/share helper sentence, `Group equal OSDs by domain`, and the empty-state paragraph.
- Remove duplicate raw, modeled usable, reserve, and target cards or tables; use one lead and one allocation legend.
- Remove any timeline or sequence for the largest-domain scenario.
- Do not show a second modeled usable number after loss as if it were another primary capacity answer.
- Keep live Ceph exclusions and commands below the workbench; the result gets one boundary sentence.
- Do not add PG, performance, nearfull, or durability verdict UI.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Planning target is the first and largest result and appears once. | Browser and text count. |
| UI-002 | deduplication | Target, reserve, and protection values have one visible owner in the lead or allocation legend. | Browser and source assertions. |
| UI-003 | visual-truth | Allocation widths use exact bytes; loss uses no timeline; domain rows preserve exact values. | Browser and engine fixtures. |
| UI-004 | responsive | At 1280, 760, 375, and 320 pixels, inputs and results remain inside the page; only the domain table may scroll. | Browser bounds and overflow assertions. |
| UI-005 | url | Clean load leaves the route unchanged; only Share creates state; edits and Reset clean it. | Browser URL assertions. |
| UI-006 | inputs | Every active profile input and reserve remains visible; changing each changes the next answer or validity. | Browser interaction matrix. |
| UI-007 | states | Invalid, minimum-met, extra-domain, largest-loss, restored, and copy-failure states retain one clear hierarchy. | Browser fixtures. |

## Open questions and blockers

- No unresolved decisions. The builder can implement this contract without changing the information model.
