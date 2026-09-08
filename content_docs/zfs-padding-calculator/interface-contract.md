# Interface contract: ZFS padding calculator

Status: ready
Tool: ZFS padding calculator
Route: `/zfs-padding-calculator`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:85b9fa919ca901c93ffb9cf12b9f8a992ad774425cbdf709a8ccf7106399ce8a`

## User task

- Primary user: A ZFS administrator checking one block on a known RAIDZ vdev.
- Question: How much physical space will this logical block occupy on this RAIDZ layout?
- Lead answer: The physical allocation for one block.
- Next decision: Keep or change the block size after comparing its efficiency and nearby allocation steps.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| RAIDZ level | How many parity columns does this layout use? | User input | input | It changes every allocation result. | Do not repeat it in a result summary while the control remains visible. |
| Vdev width | How many members share this RAIDZ stripe? | User input | input | It changes data-column count and the lead answer. | Do not add a topology card. |
| Workload | Is the block a dataset record or a zvol block? | User input | input | It controls the property name and valid block-size ceiling. | Do not explain the two modes inside the workbench. |
| Logical block size | What block is being allocated? | User input | input | It is the logical quantity compared with physical allocation. | Show it once in the lead context and once as the current comparison row only. |
| `ashift` | What physical sector size should the model use? | User input | input | It changes rounding and allocation. The default is an active assumption. | Keep all four choices visible. Do not hide it in advanced settings. |
| Physical bytes | How much space does this block occupy? | Exact engine result | lead | This is the answer the user came for. | Render it once as the large answer. Remove the separate Physical metric. |
| Logical efficiency | How much of the allocation holds the requested logical block? | Integer basis points | supporting | One percentage makes the lead answer easier to judge and compare. | Do not also show allocation multiplier. |
| Logical data, sector rounding, parity, and padding bytes | Where does the physical allocation go? | Exact engine result | supporting | The four reconciled categories explain the allocation without prose. | Do not add a separate Overhead total. The non-logical segments already show it. |
| Nearby block sizes | Does allocation change sharply around this block size? | Independently calculated comparison rows | supporting | The current size and up to four neighbors reveal allocation steps without claiming an optimum. | The selected row may repeat the lead values only as the comparison baseline. |
| Sector counts and integer derivation | How did the calculator reach the answer? | Engine derivation | evidence | Exact steps let technical users audit the result. | Keep these inside one calculation disclosure. Remove the separate visible sector equation. |
| Formula version, assumptions, exclusions, and sources | What contract supports this calculation? | Engine metadata | evidence | These facts qualify and verify the result. | Keep them quiet inside the calculation disclosure. Do not turn them into badges or callouts. |
| Overhead bytes | How much is not logical data? | Physical bytes minus logical bytes | omit | The allocation legend already exposes each overhead category more clearly. | Never render an Overhead metric beside the same category values. |
| Allocation multiplier | How many physical bytes are used per logical byte? | Integer millionths | omit | It restates logical efficiency in another scale and adds no new decision. | Keep efficiency only. |
| Input summary row | Which settings produced this result? | Current editor state | omit | The complete inputs remain visible directly above the result. | Do not duplicate the five controls as tags or result metadata. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | RAIDZ level | required and defaulted | yes, changes parity count | Product default `RAIDZ2` | visible in Geometry group | `ToolChoiceGroup` | The user must see the protection model used by the answer. | Three choices wrap within one row. |
| 2 | Vdev width | required and defaulted | yes, changes data-column count | Product default `6` members | visible in Geometry group | `ToolTextField` with numeric input mode and raw string state | Exact invalid text must survive validation without browser coercion. | Full width below RAIDZ level. |
| 3 | Workload | required and defaulted | yes, changes valid size range and result terminology | Product default `Filesystem` | visible in Block model group | `ToolChoiceGroup` | The property name and maximum size depend on it. | Two choices stay on one row. |
| 4 | `recordsize` or `volblocksize` preset | required and defaulted | yes, changes logical bytes | Product default `128 KiB` | visible in Block model group | `ToolSelect` | The preset list is long, but the active value must remain visible. | Full width. |
| 5 | Custom block size and unit | conditionally required | yes, replaces the preset bytes | Existing custom editor value and `KiB` | conditional directly after selecting Custom | `ToolQuantityInput` | Number and unit form one decision and must appear together. | One full-width combined control. |
| 6 | `ashift` and sector size | required and defaulted | yes, changes sector rounding | Product default `12, 4 KiB` | visible in Block model group | `ToolChoiceGroup` | All four result-driving assumptions fit on screen and should not be hidden in a dropdown. | Choices wrap in source order with value and sector size intact. |
| 7 | Calculate allocation | primary action | not applicable | no default | visible after all inputs | `ToolButton` primary inside `ToolActionRow` | It produces the one answer and remains available after edits or errors. | Full width and first in visual priority. |
| 8 | Reset | secondary action | not applicable | no default | visible beside Calculate | `ToolButton` ghost inside `ToolActionRow` | It restores defaults and clears shared state. | Full width below Calculate. |
| 9 | Copy summary | secondary action | no, acts on a valid result | no default | result action after evidence regions | `ToolCopyAction` | It lets the user carry the exact result elsewhere. | Full width in a stacked action row. |
| 10 | Share configuration | secondary action | no, serializes valid inputs only | no default | result action after evidence regions | `ToolButton` secondary with explicit share behavior | It creates a reproducible URL only after deliberate action. | Full width below Copy. |

Opening `/zfs-padding-calculator` must not change the URL during server render or hydration. Input edits and calculation keep the URL clean. Only Share may add the versioned `state` query. Reset and invalid-state recovery return to the clean route.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Physical allocation | How much physical space does this block occupy? | Physical bytes, logical block bytes, efficiency basis points | One `ToolPrimaryResult` labeled `Physical allocation`, with the physical value large and one detail sentence such as `For one 128 KiB logical block at 66.66% efficiency.` | No separate Physical, Overhead, or Multiplier metrics. Announce this result once and move focus to it after submit. |
| 2 | Allocation composition | Which bytes are logical data, sector rounding, parity, and padding? | Four exact byte counts reconciled to physical bytes | `ToolAllocationBar` with categorical palette and explicit stable tones, followed by its exact legend | Zero categories retain legend rows but receive no invented bar width. Color never replaces labels or values. |
| 3 | Nearby block sizes | How do neighboring power-of-two sizes compare? | Up to five rows with block size, physical allocation, efficiency, and selected state | `ToolDataTable` with `Block size`, `Physical allocation`, and `Efficiency` columns; append `Current` to the selected row label | No winner, recommendation, rank, generic bar track, or duplicate summary above the table. |
| 4 | Calculation details | How was the result derived and what does the model exclude? | Sector counts, ordered derivation, formula version, uncompressed assumption, pool-effects exclusion, dated source links | `ToolDisclosure` labeled `Calculation details`; use a compact repeated-field table for steps and quiet metadata below | No derivation sentence or sector equation outside the disclosure. Long source URLs never control page width. |
| 5 | Result actions | How can the valid result be reused? | Copy text and versioned input state | One secondary action row with Copy summary and Share configuration | Do not repeat Reset here. The persistent form Reset remains the sole reset action. |

Read alone, the result says: one 128 KiB logical block occupies 192 KiB physically at 66.66% efficiency. The allocation bar explains where those bytes go, the nearby-size table shows whether adjacent sizes cross an allocation step, and Calculation details provides the audit trail.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large primary result | One physical-allocation answer must dominate supporting data. | not applicable, hierarchy rather than quantity geometry | use `ToolPrimaryResult` |
| Allocation bar | Four exact byte categories partition one physical total. | yes, segment width is proportional to exact bytes and zero stays zero | use `ToolAllocationBar` with categorical tones |
| Nearby physical-size bars | Compare physical allocation across exponentially changing logical block sizes. | no, longer bars mostly restate that larger input blocks use more bytes and obscure efficiency cliffs | replace with an exact table |
| Progress bar | Show completion toward a bounded target. | no, the calculation has no progress denominator | omit |
| Timeline | Show ordered changes over time. | no, the result has no time axis | omit |
| Metric-card row | Give equal weight to Physical, Overhead, Efficiency, and Multiplier. | not applicable, and it repeats the answer and one ratio in several forms | replace with one lead answer and its efficiency detail |
| Calculation table | Audit repeated steps with an expression and result. | yes, rows share the same fields and preserve sequence | use inside the disclosure |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Five valid defaults and Calculate and Reset are visible. | absent | absent | none | Normal document focus and no announcement. URL stays clean. |
| Edited, not submitted | Preserve the exact editor value and keep both form actions visible. | clear any stale result | clear all stale result regions | none unless a dependency becomes invalid | Keep focus on the edited control. Announce `Inputs changed` only to assistive technology. |
| Invalid submit | Preserve every editor value. | absent | absent | Show one field-associated recovery per invalid control and one concise form status | Focus the first invalid control. Announce the recovery once. |
| Calculating | Inputs remain visible and calculation completes synchronously. | no separate loading state | no loading skeleton or progress indicator | none | Prevent duplicate work only for the current synchronous event. |
| Success | Inputs and persistent actions remain visible. | current physical allocation | allocation bar, nearby-size table, collapsed calculation details, then result actions | none | Focus the lead result and announce its sentence once. |
| Empty or no data | not applicable | not applicable | not applicable | The local exact formula has no empty-data state. | no announcement |
| Partial | not applicable | not applicable | not applicable | The local formula never returns a partial valid result. | no announcement |
| Unexpected failure | Preserve inputs and form actions. | absent | absent | Show `Calculation failed. Try again.` beside the form action area | Focus and announce the failure once. A later Calculate retries. |
| Valid shared state | Restore exact inputs and render the valid result immediately. | current restored answer | full current result | Quiet `Shared configuration loaded` status | Do not steal focus during hydration. Preserve the explicit query. |
| Invalid or foreign shared state | Restore documented defaults. | absent | absent | Show `Shared configuration could not be restored` and remove invalid state from the URL | Do not steal focus. Announce the recovery once. |
| Expanded calculation | Inputs and result stay unchanged. | unchanged | Calculation steps and source metadata appear below the comparison | Native disclosure closes without state loss | Focus stays on the disclosure summary. No extra announcement. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Short, important configuration choices | `ToolChoiceGroup` | RAIDZ, workload, and `ashift` choices benefit from being visible and keyboard navigable. | Native select, because it hides active result-driving assumptions. |
| Exact width editor | `ToolTextField` with numeric input mode | It can preserve invalid raw text required by the engine contract. | `ToolNumberField`, because browser number parsing could normalize text that the exact grammar must reject. |
| Long preset list | `ToolSelect` | Block-size presets exceed a useful radio row and still expose the active value. | A wall of sixteen choices. |
| Custom number and unit | `ToolQuantityInput` | The value and binary unit are one conditional choice. | Separate number and unit fields that split one decision. |
| Main answer | `ToolPrimaryResult` | One exact physical value deserves clear dominance. | A four-card metric row that repeats the answer. |
| Exact composition | `ToolAllocationBar` | The categories partition one total and retain exact legend values. | A page-owned bar with forced minimum segment widths. |
| Repeated comparisons | `ToolDataTable` | Each nearby block size has the same exact fields. | Decorative comparison bars whose length mostly tracks the input size. |
| Audit detail | `ToolDisclosure` containing `ToolDataTable` | The derivation is useful evidence but should not compete with the answer. | A permanently expanded calculation transcript. |
| Form and result actions | `ToolActionRow`, `ToolButton`, and `ToolCopyAction` | They keep one primary action and predictable secondary actions. | Repeated Reset buttons in both the form and result. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop beside sidebar | Geometry group first, then Block model, then actions. Result order is lead, allocation, nearby table, calculation disclosure, actions. Related controls may share rows without filling space for its own sake. | `17,604,608 B physical allocation` and `RAIDZ3 needs at least 4 members.` | None for the page. Calculation and comparison tables own horizontal overflow if their repeated schema cannot fit. |
| 768 CSS pixels | Keep source order. Use at most two control columns, then stack the result regions. Allocation legend may use two columns. | `Shared configuration could not be restored` | Only the table viewport may scroll horizontally. |
| 390 CSS pixels | Stack every labeled input. Choice groups wrap as authored rows. Calculate spans the width before Reset. | `16 MiB logical block at 95.30% efficiency.` | Only the table viewport may scroll horizontally. |
| 320 CSS pixels | Same order as 390. Values wrap inside the workbench. Result actions stack Copy then Share. | `volblocksize stops at 128 KiB.` | Only the table viewport may scroll horizontally. Document overflow stays at most 1 CSS pixel. |
| Long calculation/source value | Keep labels adjacent to values and allow whole-token wrapping. | `logical bytes rounded to sectors` and the full OpenZFS source URL | Calculation table or source list, never the page. |

## Interface wireframes

### Desktop result

```text
Geometry
RAIDZ level *  [RAIDZ1] [RAIDZ2] [RAIDZ3]    Vdev width *  [ 6 ]

Block model
Workload *     [Filesystem] [Zvol]             Block size *  [128 KiB v]
ashift *       [9 · 512 B] [12 · 4 KiB] [13 · 8 KiB] [14 · 16 KiB]

[Reset]                                                [Calculate allocation]
----------------------------------------------------------------------------
Physical allocation
192 KiB
For one 128 KiB logical block at 66.66% efficiency.

Allocation composition
[ logical data ================= ][ parity ======== ]
Logical data       128 KiB      Sector rounding      0 B
Parity              64 KiB      Padding              0 B

Nearby block sizes
Block size           Physical allocation             Efficiency
64 KiB               96 KiB                          66.66%
128 KiB · Current    192 KiB                         66.66%
256 KiB              384 KiB                         66.66%

> Calculation details

[Copy summary] [Share configuration]
```

When Custom is selected, a combined `Custom block size * [128] [KiB v]` control appears directly after Block size and before `ashift`.

### Narrow mobile result

```text
Geometry
RAIDZ level *
[RAIDZ1] [RAIDZ2] [RAIDZ3]
Vdev width *
[ 6                         ]

Block model
Workload *
[Filesystem] [Zvol]
Block size *
[128 KiB                    v]
ashift *
[9 · 512 B] [12 · 4 KiB]
[13 · 8 KiB] [14 · 16 KiB]

[Calculate allocation       ]
[Reset                      ]
------------------------------
Physical allocation
192 KiB
For one 128 KiB logical block
at 66.66% efficiency.

[exact allocation bar       ]
Logical data       128 KiB
Sector rounding      0 B
Parity              64 KiB
Padding              0 B

Nearby block sizes
[table viewport             >]

[Calculation details         ]
[Copy summary                ]
[Share configuration         ]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
Initial:     visible defaults -> Calculate -> no result placeholder
Invalid:     preserved input -> field recovery -> no old result
Calculating: synchronous local calculation -> no spinner or progress bar
Empty:       not applicable
Partial:     not applicable
Failure:     inputs preserved -> "Calculation failed. Try again." -> Calculate retries
Expanded:    current result -> Calculation details table -> assumptions -> dated sources
Restored:    supported state -> current result; unsupported state -> defaults and recovery
```

## Removed or rejected

- Remove the separate Physical metric because it repeats the lead answer.
- Remove the Overhead metric because the exact non-logical allocation categories already show it.
- Remove Multiplier because it restates Efficiency in a second scale.
- Remove the visible sector equation because the allocation legend already names those categories and Calculation details owns the audit trail.
- Replace page-owned allocation colors and forced `min-width: 2px` segments with `ToolAllocationBar`. Tiny and zero values must stay mathematically honest.
- Replace nearby-size bar tracks with a repeated-field table. The old geometry mostly visualizes increasing input size, not the padding cliff the user is checking.
- Remove the result-level Reset action. Keep one persistent Reset beside Calculate.
- Do not add input-summary tags, badges, status pills, helper paragraphs, recommendation text, an optimum marker, a timeline, progress, marker art, or nested cards.
- Do not hide `ashift`, workload, RAIDZ level, width, or block size. Every default changes the result or its valid range.
- Do not change the engine, formula, valid ranges, share format, public supporting Markdown, or publication state during this retrofit.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A valid calculation renders one dominant Physical allocation value with the logical block and efficiency as its only lead context. | Browser heading and visible-text assertions. |
| UI-002 | deduplication | Physical, Overhead, Multiplier, the sector equation, and the second Reset do not appear as separate default result items. | Static source checks and Browser text counts. |
| UI-003 | visual-truth | The shared allocation bar uses exact BigInt proportions, keeps zero values in the legend without drawing false width, and labels every category without relying on color. | Engine reconciliation, DOM style assertions, and dark/light Browser review. |
| UI-004 | comparison | Nearby sizes render as one accessible table with block size, physical allocation, efficiency, and one Current marker, with no winner or optimum claim. | Table semantics and exact fixture assertions. |
| UI-005 | input-visibility | RAIDZ level, vdev width, workload, block size, and all four `ashift` choices are visible before calculation; selecting Custom reveals one combined value-and-unit control in the main flow. | Browser accessible-tree and interaction assertions. |
| UI-006 | action-hierarchy | Calculate is the only primary action, Reset appears once, and Copy and Share appear only after a valid result. | Browser role and count assertions. |
| UI-007 | states | Input edits clear stale results; invalid input remains intact with associated recovery; success focuses and announces the lead once; unexpected failure preserves inputs and supports retry. | Browser state, focus, and live-region assertions. |
| UI-008 | evidence | Calculation details is collapsed by default and exposes the ordered derivation, formula version, assumptions, exclusions, and dated sources when opened. | Native disclosure keyboard and content assertions. |
| UI-009 | responsive | At 1280, 768, 390, and 320 CSS pixels in both themes, the page has no overlap or document-level horizontal overflow; only repeated-field table viewports may scroll. | Browser measurements and screenshots. |
| UI-010 | url | Opening the clean canonical route leaves its URL unchanged through hydration; only Share creates valid query state, and Reset or invalid recovery returns to the clean route. | Browser history and URL assertions. |

## Open questions and blockers

- None. The existing engine, state format, controls, and result data are sufficient for this retrofit.
