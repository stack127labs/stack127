# Interface contract: Rebuild window and read-error exposure calculator

Status: ready
Tool: Rebuild window and read-error exposure calculator
Route: `/rebuild-calculator`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A NAS operator estimating one rebuild while an array is degraded.
- Question: How long is the modeled degraded window, and how much specified read-error exposure occurs during the rebuild?
- Lead answer: Total degraded window.
- Next decision: Set operational expectations and verify the model inputs against the live system.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| RAID level | Which reconstruction rule applies? | User input | input | It changes source reads and tolerance. | Show once as visible choices. |
| Drive count | How many members participate? | User input | input | It changes parity-layout source reads. | Do not restate outside result context. |
| Drive capacity and unit | How large is the failed member? | User input | input | It changes read bytes and time. | Use one joined control. |
| Rebuild throughput | What effective copy rate should the model use? | User input | input | It changes copy time and the lead. | Keep visible with fixed MB/s suffix. |
| Member read scope | What fraction of each source member is read? | User input | input | It changes time, bytes, and exposure. | Keep visible; no helper sentence in the workbench. |
| URE specification | Which per-bit read-error rate should be modeled? | User input | input | It changes exposure. | Keep visible as a custom select. |
| Replacement delay | How long before copying begins? | User input | input | It changes the lead window. | Keep visible even when zero. |
| Total degraded window | How long is the array degraded in this model? | Engine | lead | This is the main operational answer. | Show once as a large result. |
| Copy time and replacement delay | What composes the degraded window? | Engine | supporting | These are exact time parts of the lead. | Show as key/value rows, not a second timeline. |
| Source media read | How much media does the model read? | Engine | supporting | It explains time and exposure. | Show once. |
| Read-error exposure | What is the modeled probability of at least one specified error? | Engine | supporting | A bounded percentage has a truthful 0 to 100 scale. | One progress bar owns the exact percentage. |
| Error tolerance | How many additional specified read errors does the simplified layout model tolerate? | Engine | supporting | It prevents treating exposure as a data-loss verdict. | Show once as a compact value. |
| Source-drive equivalents and formula | How did the model derive read work? | Engine | evidence | Useful for audit, not the first result. | Put in one disclosure. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | RAID level | defaulted | yes | RAID 6 default | visible | `ToolChoiceGroup` | It changes reconstruction rules. | Four choices wrap deliberately. |
| 2 | Drive count | defaulted | yes | Six drives | visible | `ToolNumberField` | It changes source reads for parity layouts. | Full-width field. |
| 3 | Drive capacity and unit | defaulted | yes | 8 TB | visible | `ToolQuantityField` | It changes time and exposure. | Joined control. |
| 4 | Rebuild throughput | defaulted | yes | 150 MB/s | visible | `ToolNumberField` with suffix | It changes the lead time. | Full-width field. |
| 5 | Member read scope | defaulted | yes | 100 percent | visible | `ToolNumberField` with suffix | It changes read work. | Full-width field. |
| 6 | URE specification | defaulted | no | 1 per 10^15 bits | visible | `ToolSelect` | It changes an important supporting result. | Full-width custom select. |
| 7 | Replacement delay | defaulted | yes | 0 hours | visible | `ToolNumberField` with suffix | It changes the lead even when the default is zero. | Full-width field. |
| 8 | Calculate | primary action | not applicable | no default | visible | `ToolButton` | Recomputes after deliberate edits. | Full width before Reset. |
| 9 | Reset | secondary action | no | no default | visible | `ToolButton` | Restores documented defaults and result. | Full width after Calculate. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Degraded-window answer | How long is the full degraded window? | `degradedSeconds` | `ToolPrimaryResult` | Never repeat it in a metric group or timeline. |
| 2 | Window and read facts | What composes the window and how much is read? | Copy time, replacement delay, source media read, error tolerance | `ToolKeyValueList` | Keep each value once. |
| 3 | Read-error exposure | How large is modeled exposure on a 0 to 100 scale? | `readErrorProbability` | `ToolProgressBar` with exact percentage | No risk adjective, verdict, or data-loss wording. |
| 4 | Model evidence | Which reconstruction assumptions produced this? | Source-drive equivalents, normalized inputs, formula version, RAID 6 caveat | `ToolDisclosure` with `ToolDataTable` | No second result summary. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Exposure progress bar | Probability bounded by 0 and 100 percent | Yes, the denominator is fixed and meaningful. | Use `ToolProgressBar` with exact text. |
| Degraded-window timeline | Delay and copy duration | No, the current equal-spaced treatment does not encode their actual lengths. | Replace with exact key/value rows. |
| Duration allocation bar | Delay and copy as parts of total window | Yes, but it repeats the same two exact values without aiding the next decision. | Omit. |
| Metric cards | Several unlike facts | No shared comparison warrants equal cards. | Replace with lead plus key/value rows. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | All result-driving defaults visible | Valid default result | Visible | No unsolicited status sentence | No focus move or announcement. |
| Edited valid | Preserve edits | Prior result may remain until submit only if clearly unchanged | Prior result remains paired with prior inputs only if state is marked; preferred clear-on-edit | No error | Keep focus. |
| Invalid | Preserve every value | Absent | Absent | One local error per invalid field | Focus first invalid control. |
| Success | Inputs remain | Visible first | Facts, exposure, evidence | No generic success sentence | Focus result heading and announce lead. |
| Reset | Restore defaults | Recomputed default result | Recomputed | No reset panel | Focus RAID level and announce reset. |
| Unexpected local failure | Preserve inputs | Absent | Absent | One retry message | Focus or announce once. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Layout choice | `ToolChoiceGroup` | All supported RAID levels remain visible. | Native select. |
| Numeric decisions | `ToolNumberField` and `ToolQuantityField` | Shared controls keep units, steps, labels, and errors consistent. | Unrelated native input and select boxes. |
| Lead | `ToolPrimaryResult` | One duration deserves dominance. | Result heading made from the value. |
| Structured facts | `ToolKeyValueList` | The values answer different small questions. | Equal metric cards. |
| Exposure | `ToolProgressBar` | Probability has a real fixed denominator. | Risk badge or unlabeled bar. |
| Audit | `ToolDisclosure` and `ToolDataTable` | Repeated normalized facts stay available without competing with the result. | Always-open formula sentence list. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Choice, input grid, actions, divider, lead, facts, exposure, disclosure | `Less than 0.01%` and multi-day duration | Details table only if needed. |
| 760px | Two-column inputs collapse deliberately | `1 error per 10^16 bits` | None. |
| 375px and 320px | Choices wrap, inputs and actions stack, key/value rows remain readable | RAID-specific validation sentence | Evidence table viewport only; page has no overflow. |

## Interface wireframes

### Desktop result

```text
RAID level * [RAID 1] [RAID 5] [RAID 6] [RAID 10]
Drive count * [6]              Drive capacity * [8 TB v]
Rebuild throughput * [150 MB/s]  Member read scope * [100 %]
URE specification * [1 error per 10^15 bits v]
Replacement delay * [0 hours]
[Calculate] [Reset]
------------------------------------------------------------
Total degraded window
2 days 11 hours

Rebuild copy time       2 days 11 hours
Replacement delay       0 hours
Source media read       32.0 TB
Additional errors       1

Modeled read-error exposure                     22.6%
[======================------------------------------]

> Model details
```

### Narrow mobile result

```text
RAID level *
[RAID 1] [RAID 5]
[RAID 6] [RAID 10]
[stacked inputs]
[Calculate]
[Reset]
----------------------------
Total degraded window
2 days 11 hours
[key/value facts]
Modeled read-error exposure 22.6%
[progress]
> Model details
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

The initial state renders the valid default result without changing the URL. Invalid input removes numeric output and keeps one field error. Calculation is synchronous and local, so loading, empty, partial, and upstream states do not apply. The details disclosure contains long model evidence inside its own width.

## Removed or rejected

- Remove the current equal-spaced degraded-window and exposure sequence because it mixes time, bytes, and probability on one line.
- Remove duplicate cards for the lead and values already present in the key/value list.
- Remove the always-visible `Formula: rebuild-exposure-v1` metadata line; keep it in Model details.
- Remove generic success text and repeated explanations from the workbench.
- Keep the probability caveat and RAID 6 minimum-read caveat in the details disclosure or supporting content, not beside every value.
- Do not add risk labels, traffic-light colors, a recommendation, a data-loss verdict, or a timeline.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Total degraded window is the first and largest result and appears once. | Browser and text count. |
| UI-002 | deduplication | Copy time, replacement delay, source read, tolerance, and exposure each have one visible owner. | Browser and source assertions. |
| UI-003 | visual-truth | The exposure bar uses a fixed 0 to 100 denominator and exact percentage text; no timeline mixes units. | Browser and engine fixture. |
| UI-004 | responsive | At 1280, 760, 375, and 320 pixels, controls and results remain within the page; any evidence table scrolls inside itself. | Browser bounds and overflow assertions. |
| UI-005 | url | Opening and operating `/rebuild-calculator` never changes the clean URL. | Browser URL assertion. |
| UI-006 | inputs | Every defaulted result-driving field stays visible; changing each produces an observable result change or validation state. | Browser interaction matrix. |
| UI-007 | errors | Invalid fields render no numeric result, preserve valid inputs, and show each error once. | Browser invalid-state tests. |

## Open questions and blockers

- No unresolved decisions. The builder can implement this contract without changing the information model.
