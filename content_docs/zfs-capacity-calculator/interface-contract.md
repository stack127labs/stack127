# Interface contract: ZFS pool capacity calculator

Status: ready
Tool: ZFS pool capacity calculator
Route: `/zfs-capacity-calculator`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:779cb4973c1af794e440d8c5da8da209bfae043f36bd6762299ed7093d037faa`

## User task

- Primary user: A homelab or NAS builder planning a fresh OpenZFS pool before buying or assigning drives.
- Question: How much writable physical capacity will this planned ZFS topology provide?
- Lead answer: Estimated writable physical capacity after topology allocation losses and OpenZFS slop.
- Next decision: Decide whether the topology and drive sizes meet the capacity target without weakening the intended failure boundaries.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Workload | Which block-size model applies? | User input | input | It selects `recordsize` or `volblocksize` and changes allocation. | Do not repeat it outside formula details. |
| Block size | What block size should the allocation model use? | User input | input | It can change RAIDZ allocation and the lead answer. | Show the selected value once in the form and once in formula details only. |
| ashift | What sector alignment should the model use? | User input | input | It changes alignment and allocation. | Show the selected value once in the form and once in formula details only. |
| Slop shift | How much OpenZFS slop should the model reserve? | User input | input | Its default changes the lead answer, so it must stay visible. | Do not hide it under advanced assumptions. |
| Planning headroom | What safety margin should reduce the planning target? | User input | input | It changes the next-decision value but not physical writable capacity. | State the percentage with the planning target, not in another metric. |
| Data-vdev topology | Which top-level failure domains make up the pool? | User input | input | The topology and member sizes are the core calculation input. | Do not flatten vdevs into one drive-count field. |
| Equal-drive setup | How can I create a common vdev quickly? | Editor-derived input action | input | It is an editing shortcut that produces individually editable drive rows. | Do not render a second permanent representation of the generated drives. |
| Optional compression scenario | What logical capacity might a stated compression ratio imply? | User input and engine | supporting | It does not change physical capacity and is only meaningful when enabled. | Never label it usable or writable physical capacity. |
| Auxiliary devices | Which spare, SLOG, L2ARC, or special devices belong to the planned command? | User input | input | They affect inventory or the special envelope without increasing general data capacity. | Keep them out of the general capacity total and allocation bar. |
| Estimated writable physical capacity | How much physical data can the planned pool hold under this model? | `estimatedWritableBytes` | lead | This is the answer the user came for. | Render one dominant value. The allocation bar may include it only to show its share of entered capacity. |
| Planning target | How much data should I plan to store after headroom? | `planningTargetBytes` | supporting | It turns the estimate into a buying and sizing decision. | Show once beside the lead answer. Do not repeat it in allocation. |
| Conditional logical capacity | What might fit if the stated compression ratio is achieved? | `conditionalLogicalBytes` | supporting | It answers a separate hypothetical question. | Render only when compression is enabled. |
| Per-vdev contribution and failure boundary | What does each vdev contribute, and what failures can it tolerate? | `dataVdevs` | supporting | It preserves the real top-level failure domains behind the pool total. | Use one table. Remove decorative drive pips and duplicate topology summaries. |
| Raw data-device capacity | What amount is the allocation denominator? | `rawDataCapacityBytes` | supporting | It anchors the exact proportional allocation. | State it in the allocation heading only. |
| Capacity allocation | Where do entered data-device bytes go? | Writable, slop, redundancy, rounding, padding, mixed-size, alignment, and tail values | supporting | A proportional bar communicates the partition and its exact legend values. | Remove the separate accounting table and `Before slop` subtotal. |
| Auxiliary inventory | What optional device inventory was included? | `roleInventory` and `specialVdevs` | evidence | A table prevents optional roles from looking like added general capacity. | Show only configured roles. Do not repeat auxiliary totals elsewhere. |
| Dry-run command | How does this topology map to safe `zpool create` syntax? | `command` | evidence | It verifies topology and supports the next setup step without executing anything. | Show one command block with one copy action. |
| Formula version and sources | Which model and sources produced this estimate? | Result versions, selected model, and `sources` | evidence | They support audit and troubleshooting but should not compete with the answer. | Keep them in one formula-details disclosure. |
| Engine assumptions and derivation strings | What internal steps did the engine use? | `assumptions` and `derivation` | omit | The exact allocation figure and source details provide enough visible evidence. Supporting prose owns longer explanation. | Do not add an explanation panel or step list inside the workbench. |
| Status messages | Did the add, calculate, copy, share, restore, or reset action work? | Client interaction state | evidence | Short live status supports recovery and confirmation. | Render each outcome once in the shared status area. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Workload | defaulted | yes | Filesystem from the engine contract | visible | `ToolChoiceGroup` | It chooses the block-size model. | Full-width first row. |
| 2 | recordsize or volblocksize | defaulted | yes | 128 KiB for filesystem, 16 KiB for zvol | visible | `ToolSelect` | The selected size affects allocation. | Full width below workload. |
| 3 | ashift | defaulted | yes | 12 from the engine contract | visible | `ToolSelect` | The alignment assumption affects capacity. | Full width. |
| 4 | Slop shift | defaulted | yes | 5 from the engine contract | visible | `ToolNumberField` | The active slop assumption changes estimated writable capacity. | Full width. |
| 5 | Planning headroom | defaulted | no | 20 percent from the product contract | visible | `ToolNumberField` with fixed percent suffix | It changes the planning target used for the next decision. | Full width. |
| 6 | Add data vdev | secondary action | yes | no default | visible | `ToolButton` secondary | A pool cannot be calculated without a data vdev. | Full-width button beside or below the section heading. |
| 7 | Vdev layout | defaulted for each new vdev | yes | RAIDZ2 from current editor behavior | visible | `ToolSelect` | Layout controls redundancy, minimum width, and data contribution. | Full-width control above drive rows. |
| 8 | Equal-drive count, capacity, and unit | optional editing shortcut | yes after application | Current row count, blank capacity, TB | visible | `ToolNumberField`, `ToolQuantityInput`, secondary `Set drives` action | It creates a common topology quickly without hiding the resulting rows. | Stack count and quantity, then full-width action. |
| 9 | Individual drive capacity and unit | required for every created drive | yes | Blank capacity and TB unit | visible | `ToolQuantityInput` | Every member remains editable for mixed-size planning. | Drive number, joined capacity control, and 44 px remove action stay on one row. |
| 10 | Add drive | secondary action | yes | no default | visible | `ToolButton` secondary | It appends a member to the current vdev. | Full width after the current drive rows. |
| 11 | Duplicate, reorder, and remove vdev | secondary actions | yes | no default | visible | Named icon `ToolButton` actions | They edit whole failure domains without drag-only interaction. | Fixed action row below the vdev title and layout control. |
| 12 | Optional devices | optional | no | No auxiliary groups | disclosure | `ToolDisclosure` with configured-group count | The absent state has no effect on general writable capacity. | Full-width disclosure; child controls stack. |
| 13 | Auxiliary role and add action | optional | no | Spare selected only while the disclosure is open | conditional | `ToolSelect` and secondary `ToolButton` | They add inventory or a separate special envelope. | Role select above full-width add action. |
| 14 | Auxiliary layout and drive capacities | required after an auxiliary group is added | no | Role rules from the engine | conditional | `ToolSelect`, `ToolQuantityInput`, and named row actions | A configured optional group must be complete and editable. | Same row contract as data drives. |
| 15 | Logical compression scenario | optional | no | Disabled | disclosure | `ToolDisclosure` and `ToolCheckbox` | Its off state has no effect on the lead answer. | Full-width disclosure after pool inputs. |
| 16 | Compression ratio | required when compression scenario is enabled | no | 1.5 times from current editor behavior | conditional | `ToolNumberField` with fixed multiplication suffix | It defines the visible hypothetical logical-capacity result. | Appears directly below the enabling checkbox. |
| 17 | Calculate pool | primary action | not applicable | no default | visible | `ToolButton` primary | It produces the answer after deliberate input. | Full width and last in the sticky action row. |
| 18 | Reset | secondary action | not applicable | no default | visible | `ToolButton` secondary | It clears a long editor and restores the clean state. | Full width above Calculate. |
| 19 | Result unit | display-only action | no | TiB | result | `ToolChoiceGroup` | It reformats every result without changing the calculation. | Compact row above the lead result. |
| 20 | Copy summary | secondary action | no | no default | result | `ToolCopyAction` | It copies the lead and planning target. | Full width after result evidence. |
| 21 | Share configuration | secondary action | no | no default | result | `ToolButton` secondary | It explicitly creates versioned URL state. | Full width after Copy summary. |

The clean route stays `/zfs-capacity-calculator` through server render, hydration, editing, and calculation. Only `Share configuration` writes `state` with `history.replaceState`. Editing or resetting removes that query value. No default, derived value, or result is serialized on mount.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Estimated writable | How much writable physical capacity does this model estimate? | `estimatedWritableBytes` | One `ToolPrimaryResult` with output unit and the short detail `After allocation losses and OpenZFS slop`. | No second metric card or repeated answer sentence. |
| 2 | Planning target | How much should I plan to store after my headroom setting? | `planningTargetBytes` and `reserveBasisPoints` | One supporting `ToolKeyValueList` row directly below the lead. | Do not place planning headroom in the physical allocation bar. |
| 3 | Conditional logical capacity | What logical amount might fit if the chosen compression ratio is achieved? | `conditionalLogicalBytes` and compression ratio | A second key/value row only when enabled, labelled as conditional. | Omit entirely when compression is disabled. Never compete with the physical lead. |
| 4 | Vdev boundaries | What does each vdev contribute and tolerate? | Vdev label, type, drive count, smallest member, logical data bytes, and failure statement | One `ToolDataTable` ordered by editor position. | No drive pips, cards, pool-wide tolerance, or repeated pool totals. |
| 5 | Capacity allocation | How is entered data-device capacity divided? | Writable, slop, redundancy, sector rounding, RAIDZ padding, mixed sizes, alignment, and tails | One shared `ToolAllocationBar` with categorical palette, exact BigInt values, explicit stable tones, and raw capacity in the section heading. | No separate accounting table. Every category remains labelled even at zero; tiny values get no fake minimum width. |
| 6 | Auxiliary inventory | Which optional devices were included, and do they add general capacity? | Role, drive count, inventory bytes, general data bytes, special envelope, and special failure warning | One `ToolDataTable`, rendered only when auxiliary groups exist. | Special stays separate from general data. Omit the whole region when no optional devices exist. |
| 7 | Dry-run command | What safe command represents the planned topology? | Placeholder-only command tokens | `ToolCodeOutput` with one copy action. | It must start with `zpool create -n`, contain no real path or `-f`, and never execute. |
| 8 | Formula details | Which versioned assumptions and sources limit this estimate? | Calculation version, input version, ashift, block size, workload, fresh-pool scope, slop model, and dated sources | One `ToolDisclosure` containing a compact `ToolKeyValueList` and source links. | No prose panel, derivation timeline, or repeated result values. |
| 9 | Result actions and status | Can I copy or share this result, and did the action work? | Summary text, encoded state URL, and concise status | Secondary action row followed by one `ToolStatus`. | Clipboard failure leaves content selectable. Status appears once. |

Reading the result alone gives this answer: the planned pool is estimated to provide one stated amount of writable physical capacity, with a lower planning target after headroom. The vdev table explains failure boundaries, the allocation bar accounts for entered data-device bytes, optional inventory stays separate, and the command and formula details verify the calculation.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large answer | One physical capacity estimate dominates the result. | not applicable, hierarchy communicates priority rather than quantity | use `ToolPrimaryResult` for estimated writable only |
| Metric cards | Writable, planning, and logical values as equal answers. | no, equal cards falsely give three values equal importance | replace with one lead and supporting key/value rows |
| Vdev diagram with drive pips | Vdev width and failure boundary. | no, identical pips do not encode member size or failure behavior | replace with a repeated-field data table |
| Allocation bar | Entered data-device bytes divided into mutually exclusive categories. | yes, segment width is exact relative to raw entered capacity | use shared categorical `ToolAllocationBar` with exact legend values |
| Accounting table | Repeat every allocation segment and subtotal. | no additional relationship beyond the bar legend | omit |
| Auxiliary table | Compare the same inventory fields across configured roles. | yes, rows and columns preserve repeated facts | use only when roles exist |
| Timeline or progress bar | Calculation or pool lifecycle. | no, the calculation is synchronous and no time axis or completion denominator exists | omit |
| Dry-run code block | Preserve exact topology command syntax. | not applicable | use `ToolCodeOutput` |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Visible model inputs use documented defaults. Topology is empty. Add data vdev is visible and Calculate is disabled. Optional disclosures are closed with zero counts or off summaries. | absent | absent | No error. Empty topology is communicated by the section state, not a large panel. | Normal document focus; no announcement. |
| Incomplete | Existing topology and blank drive fields remain visible. Calculate is enabled once a vdev exists so precise errors can be shown. | absent | absent | One inline error at each invalid field or vdev plus one form summary. | First invalid field or vdev heading receives focus; one assertive summary is announced. |
| Calculating | Not applicable because calculation is local and synchronous. | not applicable | not applicable | No spinner or loading copy. | No loading announcement. |
| Success | Inputs remain editable. Result unit, reset, copy, and share actions are available. | visible first | Vdev table, allocation, optional inventory, command, and formula details follow in order. | No error. | Focus the lead-result label only on the first successful calculation; announce completion once. |
| Empty or no-data | Covered by the initial empty topology state. | absent | absent | Add data vdev is the recovery action. | Add data vdev remains in normal tab order. |
| Partial | Never render partial numeric output. | absent | absent | Invalid topology removes all numeric result regions. | Same behavior as incomplete or invalid state. |
| Failure | Only malformed, unsafe, wrong-version, or wrong-calculator shared state can fail outside validation. | absent | absent | Clear the payload, keep the clean editor, remove `state`, and show `Shared configuration could not be restored.` once. | Polite announcement without forced focus. |
| Retry | User corrects the marked input and activates Calculate again. | absent until valid | absent until valid | Preserve every valid input. | Keep normal input focus until success. |
| Restored | All decoded inputs and calculated output render from the recorded versions. | visible | visible in normal order | A concise restore status appears once. Editing removes the result and query state. | Do not steal focus on load. |
| Expanded | Optional devices, compression scenario, dry-run command viewport, or formula details are open. | remains visible | Expanded content stays below its owning heading. | Closing a disclosure preserves configured values and states the active summary. | Trigger retains focus and native disclosure semantics. |
| Long content | Up to 64 vdevs, 256 visible drive rows, a long encoded URL, and a long placeholder command remain usable. | visible after calculation | Only named table, code, or shared-URL viewports may scroll horizontally. | No clipped remove or primary actions. | Keyboard reaches all overflow regions and controls. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Visible binary workload choice | `ToolChoiceGroup` | Both important choices stay visible with radio semantics. | A select hides a two-option decision. |
| Bounded technical value | `ToolSelect` | Block size, ashift, layout, and roles use bounded option sets and custom listbox behavior. | Native-looking route-specific selects. |
| Editable counts and percentages | `ToolNumberField` | It preserves numeric keyboard behavior and clear increment controls. | Free-form text fields. |
| Joined capacity and unit | `ToolQuantityInput` | Size and unit remain one labelled decision. | Separate floating input and unit select. |
| Repeated drive rows | Page-owned topology editor using shared fields and buttons | Vdev nesting, focus restoration, and whole-group actions are domain-specific. | A generic card or a flat `ToolRepeatableList` that erases failure domains. |
| Optional settings with inactive defaults | `ToolDisclosure` | Optional devices and compression have no lead-answer effect while absent or off. | Hiding slop, ashift, workload, block size, or headroom. |
| Main answer | `ToolPrimaryResult` | It gives one conclusion clear priority. | Three equal result cards. |
| Supporting decision values | `ToolKeyValueList` | Planning and conditional logical values need exact labels, not competing cards. | Repeating them in the allocation figure. |
| Vdev and auxiliary comparisons | `ToolDataTable` | Each collection has repeated rows with the same fields. | Pips, prose sentences, or nested cards. |
| Exact raw-capacity partition | `ToolAllocationBar` | Exact BigInt segment widths encode a real whole-to-parts relationship. | Page-owned bar plus duplicate accounting table. |
| Safe command text | `ToolCodeOutput` and `ToolCopyAction` | It contains and copies long exact syntax in its own viewport. | Plain wrapping paragraph or executable control. |
| Quiet action feedback | `ToolStatus` | One live region handles add, calculate, copy, share, restore, and reset outcomes. | Repeating status near each action. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop at 1280 px beside the real sidebar | Model controls use a deliberate three-column grid over two rows. Data vdevs remain full width. Result reads lead, planning values, vdev table, allocation, optional inventory, command, details, actions. | `18,000,000.00 TiB`, 64 vdev rows, 256 drives, and a command containing every placeholder. | Vdev and auxiliary tables own their scroll only when required; code output owns command scroll. |
| Medium at 760 px | Model controls use two columns. Vdev title, layout, and group actions occupy authored rows. Drive rows preserve number, joined quantity, and remove action. Result order does not change. | `Data vdev 64 drive 64 capacity` and `Any 3 drives in this vdev`. | Named tables and code output only. |
| Narrow at 375 px | Every model control stacks. Section add actions become full width. Vdev controls sit below the title. Drive identity, quantity, and remove remain on one row. Result actions stack. | `<0.01 TiB`, `RAIDZ allocation padding`, and long special-vdev warning text. | Named tables and code output only; the page never scrolls horizontally. |
| Minimum at 320 px and 200 percent zoom | Same order as 375 px. Labels wrap above controls. Buttons retain 44 px targets and no sticky action covers the final row. | Full shared-state URL and a 256-drive placeholder command. | Shared-URL field and code viewport own their own overflow. |
| Dark and light themes | Borders, focus, text, categorical fills, and warning text retain meaning and contrast. | Eight allocation categories including zero and tiny values. | none beyond named inner regions |

## Interface wireframes

### Desktop result

```text
Pool model
Workload *        recordsize *      ashift *
[Filesystem Zvol] [128 KiB       v] [12 v]
Slop shift *      Planning headroom *
[5              ] [20             %]

Data vdevs                                      [Add data vdev]
----------------------------------------------------------------
Data vdev 1    Layout [RAIDZ2 v]       [copy] [up] [down] [remove]
Drives [6]     Same capacity [18][TB v]                 [Set drives]
01 [18][TB v] [remove]   02 [18][TB v] [remove]   ...
                                                   [Add drive]
----------------------------------------------------------------
> Optional devices, 0 groups
> Logical capacity scenario, off

[Reset]                                      [Calculate pool]
================================================================
Result unit [TiB] [TB]

Estimated writable
65.32 TiB
After allocation losses and OpenZFS slop

Planning target                         52.26 TiB at 20% headroom

Vdev boundaries
Vdev         Layout   Drives   Smallest   Data       Failure boundary
Data vdev 1  RAIDZ2   6        18 TB      65.45 TiB  Any 2 drives in this vdev

Capacity allocation                                  Entered: 98.23 TiB
[writable................][slop][parity........][loss]
Writable              65.32 TiB
Slop                    0.13 TiB
Redundancy             32.73 TiB
Sector rounding         0 TiB
RAIDZ padding            0 TiB
Mixed sizes              0 TiB
Alignment                0 TiB
Tails                   <0.01 TiB

[Dry-run command and Copy]
> Formula details
[Copy summary] [Share configuration]
```

### Narrow mobile result

```text
Pool model
Workload *
[Filesystem] [Zvol]
recordsize *
[128 KiB v]
ashift *
[12 v]
Slop shift *
[5]
Planning headroom *
[20 %]

Data vdevs
[Add data vdev]
----------------------------------
Data vdev 1
Layout [RAIDZ2 v]
[copy] [up] [down] [remove]
Drives [6]
Same capacity [18][TB v]
[Set drives]
01 [18][TB v] [remove]
02 [18][TB v] [remove]
[Add drive]
----------------------------------
> Optional devices, 0 groups
> Logical capacity scenario, off
[Reset]
[Calculate pool]
==================================
[TiB] [TB]
Estimated writable
65.32 TiB
After allocation losses and OpenZFS slop

Planning target
52.26 TiB at 20% headroom

Vdev boundaries
[table scrolls inside this region]

Capacity allocation
Entered: 98.23 TiB
[exact proportional bar]
[label and value legend]

> Dry-run command
> Formula details
[Copy summary]
[Share configuration]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
Initial or empty
Data vdevs                         [Add data vdev]
No data vdevs configured.
[Reset]                  [Calculate pool disabled]

Invalid
Data vdev 1
Layout [RAIDZ2 v]
01 [18][TB v] [remove]
02 [18][TB v] [remove]
RAIDZ2 needs 3 drives.                         [Add drive]
Fix the marked inputs.              [Calculate pool]
No old result remains.

Calculating
No loading state. The local calculation completes synchronously.

Partial
No partial result is rendered.

Restore failure
Shared configuration could not be restored.
Clean editor remains available and the invalid query is gone.

Expanded optional compression
v Logical capacity scenario, 1.5 times
[x] Compression scenario
Compression ratio * [1.5 x]
```

## Removed or rejected

- Remove `Slop shift` from `Advanced assumptions`. Its default changes estimated writable capacity, so it stays visible.
- Remove the generic `Advanced assumptions` disclosure. Compression gets a precise optional disclosure and result-driving assumptions stay in the main flow.
- Move auxiliary devices into a count-bearing optional disclosure. No configured auxiliary group means no effect on the lead answer.
- Replace the three equal result cards with one dominant writable value and quieter planning rows.
- Remove the separate capacity accounting table. It repeats the allocation legend and adds the `Before slop` subtotal without answering a new question.
- Replace the page-owned allocation implementation with the shared exact BigInt `ToolAllocationBar` and brand data colors.
- Remove decorative drive pips. They do not encode drive size or failure tolerance.
- Do not add a pool-wide failure-tolerance number, progress bar, timeline, gauge, donut, marker art, or explanatory result paragraph.
- Do not expose engine derivation strings, zero-value disclosure, or source metadata as full-weight result regions.
- Do not put general data, special-vdev envelope, conditional logical capacity, and planning target into one total.
- Do not add automatic calculation, automatic URL state, local storage, device-path input, or an executable command.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A valid result has one dominant `Estimated writable` value. Planning target and conditional logical capacity are visually secondary. | Browser hierarchy and accessibility inspection |
| UI-002 | inputs | Workload, block size, ashift, slop shift, and planning headroom remain visible with required marks. Changing each documented result-driving input changes its owned result when the engine predicts a difference. | Browser interaction and engine fixtures |
| UI-003 | topology | Every vdev remains a distinct ordered group with a visible layout and editable member rows. Add, duplicate, reorder, and remove actions keep stable focus. | Browser keyboard test |
| UI-004 | optionality | Auxiliary devices and compression may be disclosed because their absent or disabled states do not affect estimated writable capacity. Active summaries remain visible while collapsed. | Browser disclosure test |
| UI-005 | deduplication | The result has no capacity-accounting table, duplicate pool-total card, drive-pip diagram, or second planning-target value. | Static source and Browser inspection |
| UI-006 | visual-truth | The categorical allocation bar uses raw entered data-device capacity as its denominator. Exact BigInt labels remain visible for zero and tiny categories without a fake minimum segment width. | Engine reconciliation and Browser measurement |
| UI-007 | table | One vdev table presents layout, member count, smallest member, data contribution, and failure boundary without sibling overlap. Auxiliary inventory appears in a separate table only when configured. | Browser table and long-value test |
| UI-008 | states | Invalid input clears stale output, shows each error once at the narrowest scope, keeps valid input, and focuses the first invalid control or vdev heading. No partial or loading result appears. | Browser invalid-state test |
| UI-009 | responsive | At 320, 375, 760, and 1280 px, the page has no horizontal overflow. Only named table, code, and URL viewports may scroll. Drive quantity and remove controls stay on one row. | Browser layout measurements in both themes |
| UI-010 | action | Calculate is the only accent-filled action. Reset, add, copy, share, duplicate, reorder, and remove remain secondary or icon actions with accessible names and 44 px targets. | Browser and accessibility inspection |
| UI-011 | evidence | The command is placeholder-only, selectable, copyable, and contained. Formula details contain versions and dated sources without repeating result values. | Static command test and Browser expanded-state test |
| UI-012 | url | Opening the clean canonical route leaves its URL unchanged through hydration, editing, and calculation. Only Share configuration adds versioned state. | Browser history and URL assertion |

## Open questions and blockers

- None for interface implementation. The separate OpenZFS 2.3 and 2.4 fixture-receipt requirement remains a production-evidence blocker, not an interface decision.
