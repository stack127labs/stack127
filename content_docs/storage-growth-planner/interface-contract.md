# Interface contract: Storage growth and TCO planner

Status: ready
Tool: Storage growth and TCO planner
Route: `/storage-growth-planner`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A homelab owner testing whether one planned array can hold current data and expected growth at an acceptable cost.
- Question: Does this plan cover the selected horizon, when does it cross the operating reserve, and what will the plan cost?
- Lead answer: The covered horizon or first shortfall year.
- Next decision: Change capacity, reserve, growth, horizon, or cost assumptions before buying the plan.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Demand and horizon inputs | What data curve should be tested? | User input | input | Current data, growth, horizon, and reserve define the runway. | Keep all four visible together. |
| Array inputs | What local capacity is available? | User input | input | Layout, count, and size define planning capacity. | Keep all active assumptions visible. |
| Cost inputs | What costs belong in the plan? | User input | input | User-owned prices and operating assumptions define TCO. | Group once under Costs. |
| Runway verdict | Does the plan cover the horizon? | Engine | lead | This is the decision the user came to make. | Show once as the large result. |
| Growth curve | When does demand approach or cross capacity? | Engine | supporting | Exact geometry makes the runway easier to scan than prose. | Chart owns the cross-over relationship. |
| Year evidence | What happens in each modeled year? | Engine | evidence | Repeated demand and headroom facts need rows. | Table owns exact yearly values and states. |
| Cost breakdown | Where does the total cost come from? | Engine | supporting | Separate categories make the total auditable. | One table owns category values and total. |
| Formula receipt | Which conventions produced this result? | Engine | evidence | Advanced verification is useful but not part of the main answer. | Keep in one disclosure. |
| Share URL | Can I preserve these inputs? | Serializer | evidence | Explicit sharing is useful. | Show only after Share. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Current data | defaulted | yes | 10 TB | visible | `ToolQuantityInput` | It sets year-zero demand. | Full width. |
| 2 | Annual growth | defaulted | yes | 20 percent | visible | `ToolNumberField` | It changes every future demand value. | Full width. |
| 3 | Horizon | defaulted | yes | 5 years | visible | `ToolNumberField` | It defines the decision window. | Full width. |
| 4 | Operating reserve | defaulted | yes | 20 percent | visible | `ToolNumberField` | It changes available planning capacity. | Full width. |
| 5 | Layout | defaulted | yes | dual parity | visible | `ToolChoiceGroup` | It changes data-member count. | Choices wrap. |
| 6 | Drive count | defaulted | yes | 6 | visible | `ToolNumberField` | It changes capacity, hardware cost, and layout validity. | Full width. |
| 7 | Drive size | defaulted | yes | 12 TB | visible | `ToolQuantityInput` | It changes capacity. | Full width. |
| 8 | Currency | defaulted | no | USD | visible | `ToolSelect` | It labels every cost input and result without conversion. | Full width. |
| 9 | Drive price and enclosure cost | defaulted | no | 200 and 400 | visible | `ToolNumberField` pair | They change hardware and total cost. | Stack. |
| 10 | Average draw, daily hours, and electricity rate | defaulted | no | 60 W, 24 hours, 0.15 | visible | `ToolNumberField` group | All three change power and total cost. | Stack. |
| 11 | Replacement reserve and backup budget | defaulted | no | zero | visible | `ToolNumberField` pair | Both are active cost assumptions even at zero. | Stack. |
| 12 | Calculate plan | primary action | not applicable | no default | visible | `ToolButton` | Validates and calculates once. | Full width before Reset. |
| 13 | Reset | secondary action | no | no default | visible | `ToolButton` | Restores documented defaults. | Full width after Calculate. |
| 14 | Copy summary and Share plan | secondary actions | no | no default | result | `ToolButton` | Preserve a successful result explicitly. | Wrap below result. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Runway answer | Does the plan cover my selected horizon? | `shortfallYear`, `horizonYears` | `ToolPrimaryResult` with one demand-versus-capacity detail | Do not repeat a dashboard of the same headline values. |
| 2 | Growth runway | When does projected demand meet capacity after reserve? | `demandBytes[]`, `planningCapacityBytes` | Exact responsive SVG chart | Label real years and values; no decorative timeline. |
| 3 | Year-by-year plan | What are demand and remaining headroom each year? | Demand, signed headroom, state | `ToolDataTable` with labelled mobile rows | Table is the exact receipt for the chart. |
| 4 | Cost breakdown | What produces total TCO? | Hardware, power, replacement, backup, total | `ToolDataTable` or compact key/value table | Total appears once inside this breakdown. |
| 5 | Actions and formula | Can I preserve and audit the plan? | Copy, share URL, model metadata | `ToolActionRow`, share field, `ToolDisclosure` | No extra Reset and no repeated prose. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Runway chart | Demand by exact year against one fixed capacity threshold | Yes, both axes and points map to exact engine values. | Use a clean SVG chart with labels and two distinguishable series. |
| Year table | Exact repeated yearly values | Yes, aligned rows preserve comparisons. | Use `ToolDataTable`; switch to labelled rows on narrow screens. |
| Cost allocation bar | Cost categories as portions of total | Yes, but it would repeat the clearer monetary table. | Omit to preserve one owner for the cost split. |
| Progress bar | Years completed toward horizon | No, this is a projection rather than elapsed progress. | Omit; do not imply time has passed. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | All defaults and active assumptions visible | Absent | Absent | No empty-state explanation | Normal form order. |
| Invalid | Preserve inputs | Absent | Absent | Local field errors and one short summary | Focus first invalid field. |
| Success within horizon | Inputs remain | `Covers N years` | Chart, yearly table, costs, formula | One short model boundary | Focus result heading and announce. |
| Success with shortfall | Inputs remain | `Shortfall in year N` | Same evidence with crossed state | No duplicate warning panel | Focus result heading and announce. |
| Changed after success | Preserve edit | Remove stale result | Remove chart, tables, and share URL | Quiet result-cleared status | Keep focus. |
| Shared valid state | Restore exact inputs and calculate | Visible | Visible | Quiet restored status | Announce without stealing focus. |
| Shared invalid state | Restore defaults and clean URL | Absent | Absent | One restore failure | Announce once. |
| Clipboard failure | Result remains | Remains | Share URL remains selectable | One copy failure | Announce once. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Numeric and unit input | `ToolQuantityInput` and `ToolNumberField` | Shared labels, required marks, errors, and sizing remain consistent. | Native mixed input/select controls. |
| Enum input | `ToolChoiceGroup` and `ToolSelect` | Layout is scan-worthy; currency is compact. | Native radios and select. |
| Runway answer | `ToolPrimaryResult` | One decision dominates the result. | Four equal metric cards. |
| Exact yearly evidence | `ToolDataTable` | Repeated values align and retain labels. | Prose list or clipped desktop table. |
| Advanced receipt | `ToolDisclosure` | Formula metadata is available without crowding the decision. | Always-open methodology block. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Demand, array, costs, actions, divider, answer, chart, yearly table, cost table | INR-formatted total and ten-year values | None outside optional table viewport. |
| 760px | Each input group becomes one or two columns; chart keeps labels | `Shortfall in year 10` | Chart frame, if needed, not page. |
| 375px and 320px | Inputs and actions stack; tables become labelled rows | Large signed TiB headroom and currency value | No page overflow. |

## Interface wireframes

### Desktop result

```text
Current data * [10 TB]   Annual growth * [20%]   Horizon * [5 years]
Operating reserve * [20%]
Layout * [Mirror] [Single parity] [Dual parity]
Drive count * [6]        Drive size * [12 TB]

Costs
Currency * [USD]  Drive price * [200]  Enclosure * [400]
Average draw * [60 W]  Hours/day * [24]  Electricity * [0.15]
Replacement reserve * [0%]  Backup budget * [0/year]
[Calculate plan] [Reset]
------------------------------------------------------------------
Storage runway
Covers 5 years
Year 5 demand 24.88 TB · Capacity after reserve 38.40 TB

Growth runway [exact chart]
Year-by-year plan [table]
Cost breakdown [table]
[Copy summary] [Share plan]
Formula receipt ▾
```

### Narrow mobile result

```text
[all active inputs, stacked]
[Calculate plan]
[Reset]
----------------------------
Storage runway
Covers 5 years
[exact chart in frame]
[labelled yearly rows]
[cost rows]
[Copy summary]
[Share plan]
Formula receipt ▾
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

The initial state ends after the actions with no helper panel. Invalid fields keep their values and show local recovery. Calculation is synchronous, so loading, upstream, and partial states do not apply. The formula receipt and explicit share URL are the only expanded states.

## Removed or rejected

- Remove the four equal summary cards because they repeat the lead, chart, and cost breakdown.
- Remove the local-browser helper sentence from the form; privacy belongs in supporting content below.
- Replace native controls with shared controls and keep every active default visible.
- Do not show total TCO outside the one cost breakdown that explains it.
- Do not turn forecast years into a progress bar or timeline.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | The covered horizon or first shortfall year is the first and largest result and appears once. | Browser and source assertions. |
| UI-002 | deduplication | Capacity, demand, and total cost each have one primary owner; no equal-card recap repeats them. | Browser and text-count assertions. |
| UI-003 | visual-truth | Chart positions use exact engine values and labelled axes; tables retain exact data. | Browser and engine fixtures. |
| UI-004 | responsive | At 1280, 760, 375, and 320 pixels the page has no horizontal overflow and chart labels remain legible. | Browser bounds and screenshots. |
| UI-005 | url | Clean load stays unchanged; only Share creates state; edits and Reset clean it. | Browser URL assertions. |
| UI-006 | inputs | Every active capacity and cost assumption remains visible and changing it changes the next relevant result. | Browser interaction matrix. |
| UI-007 | states | Initial, invalid, covered, shortfall, restored, and copy-failure states retain one hierarchy. | Browser fixtures. |

## Open questions and blockers

- No unresolved interface decision blocks implementation. The existing deterministic engine remains authoritative.
