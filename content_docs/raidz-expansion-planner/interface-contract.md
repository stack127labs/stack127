# Interface contract: RAIDZ Expansion Planner

Status: ready
Tool: RAIDZ Expansion Planner
Route: `/raidz-expansion-planner`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A ZFS administrator with one healthy RAIDZ vdev who is deciding how far to widen it with sequential one-disk expansions.
- Question: How much modeled logical capacity will this RAIDZ vdev have after each planned disk addition, and how far will the final result remain below a freshly created vdev at the same width?
- Lead answer: The modeled logical capacity gained immediately at the final width.
- Next decision: The administrator can choose a final width, check the capacity tradeoff against a fresh vdev, and take the separate OpenZFS preflight steps before attaching a disk.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| RAIDZ level | Which unchanged parity geometry does this vdev use? | `level` input | input | RAIDZ1, RAIDZ2, and RAIDZ3 allocate the same block differently and set different minimum widths. | Show the selected level once in the lead detail. Do not add a parity badge or fault-tolerance card. |
| Current width | How many members does the vdev have now? | `currentWidth` input | input | The old block generation and every later step start from this width. | Use it in the lead detail. Do not add a separate input summary or current baseline row. |
| Final width | How many members should the plan reach? | `finalWidth` input | input | It sets the number of sequential one-disk steps and the final answer. | Use it in the lead detail and final row only. Do not add a standalone target-width metric. |
| Smallest existing member capacity | What common capacity can every existing member contribute? | `memberBytes` input | input | The smallest member sets the common raw envelope after sector alignment. | Keep the entered value in the control. Do not repeat it as a result metric. |
| Each added disk capacity | Does every planned disk meet the existing member size, and is any excess excluded? | `addedDiskBytes` input | input | A smaller disk makes the plan invalid. A larger disk creates excluded excess that the person needs to know about. | Show excess only when it is nonzero, inside calculation details. Do not count excess as capacity. |
| Current physical allocation | How much physical space is occupied in this vdev now? | `allocatedBytes` input | input | This required value fixes the old block generation and geometry gap. Its meaning is easy to confuse with logical file size. | Give it one short field description. Do not add an occupancy percentage or repeat the input above the result. |
| Workload | Should the block-size assumption use filesystem or zvol rules? | `workload` input | input | It changes the property name and valid block-size ceiling. The default suits the common filesystem case. | Keep it visible beside the block-size decision. Do not add a workload result label. |
| Representative block size | Which one-block-size assumption should drive RAIDZ allocation? | `blockSizeBytes` input | input | It materially changes the modeled capacity and gap. | Keep the required selector visible. Do not repeat it outside calculation evidence. |
| `ashift` | What sector size should the model use? | `ashift` input | input | Sector size changes alignment and block allocation. The default is `12`, or 4,096 B sectors. | Keep the required selector visible. Do not create a sector-size result metric. |
| Plan expansion | When should the local calculation run? | Form submission | input | One explicit action separates editing from a completed plan. | No automatic calculation while typing and no second primary action. |
| Reset | How can the person return to the documented clean state? | Local editor action | input | It clears errors, results, shared state, statuses, and display changes in one predictable action. | Keep it ghost-styled beside the primary action. Do not add separate clear actions to fields. |
| Final immediate gain | How much modeled logical capacity does the full plan add now? | `final.immediateGainBytes` | lead | This is the decision-driving answer named in the brief. | Render it once in `ToolPrimaryResult`. The final step row may repeat it only as the endpoint of a multi-row comparison. |
| Current and final immediate logical capacity | What does the model rise from and to? | `current.immediateLogicalBytes`, `final.immediateLogicalBytes` | supporting | These values give the lead gain a concrete baseline and destination. | Put both in the lead detail sentence. Do not add equal-weight metric cards for them. |
| Final fresh logical comparator | What would a freshly created vdev at the final width model? | `final.nativeLogicalBytes` | supporting | This is the correct same-width comparator for the expanded geometry. | Use it as the exact denominator and total of the final composition figure. Do not repeat it in a separate metric grid. |
| Final geometry gap | How far does the expanded result remain below the fresh comparator? | `final.geometryGapBytes` | supporting | It explains the durable effect of old blocks retaining their original geometry. | Show it as one bar segment and one exact legend value. Do not repeat it in a callout or verdict badge. |
| Old logical payload | How much modeled payload keeps the old-width allocation geometry? | `oldLogicalBytes` | supporting | It is one exact part of the final-width composition. | Show it once in the composition legend and exact evidence. |
| Final-width writable logical space | How much modeled logical data can still be written at final-width allocation geometry? | `final.newWritableLogicalBytes` | supporting | It is the second exact part of the final-width composition. | Label it `Writable at final width` so it cannot be mistaken for capacity gained only by expansion. |
| Sequential width results | What happens after each one-disk attach? | `steps[].width`, `immediateGainBytes`, `immediateLogicalBytes`, `nativeLogicalBytes`, `geometryGapBytes` | supporting | A repeated-field table makes every legal step and its comparison explicit. | Future steps only. Do not add an equal-distance timeline or repeat the current baseline as a data row. |
| Unchanged parity | Does expansion change RAIDZ level or fault tolerance? | `level`, fixed product rule | supporting | It blocks a common and dangerous misunderstanding. | State `RAIDZ2 stays RAIDZ2` in the lead detail. Do not add a second status treatment. |
| Reported capacity | What will `zfs list` or `df` report? | `reportedCapacity: null` | supporting | The honest answer is unknown because live accounting is outside this model. | State `Live reported capacity is not predicted` once below the lead. Never render a numeric sibling. |
| Display unit | How should friendly result capacities be formatted? | Local `TB` or `TiB` view state | supporting | It changes presentation without changing stored bytes or the submitted plan. | One compact result control changes all friendly values. Exact bytes remain in calculation evidence. |
| Block allocation and reconciliation trace | Can the person verify the integer model? | Current and step allocation fields, block counts, free physical bytes, native counts, gap, old count, and remainder | evidence | Exact values let a technical reader audit the model without competing with the answer. | Keep them in one collapsed `Calculation details` disclosure. Do not put exact byte columns in the main step table. |
| Added-disk excess | How much larger-disk capacity is excluded from the common-member model? | `addedDiskExcessBytes`, `totalAddedDiskExcessBytes` | evidence | Nonzero excess qualifies the answer and may change a hardware purchase decision. | Show only when nonzero, inside calculation details. Do not draw it in the final composition bar. |
| Assumptions | Which boundaries make the result a model rather than a live-pool prediction? | Engine assumptions | evidence | The never-expanded starting vdev, no writes between steps, and unknown live reporting are required audit facts. | Keep them together in calculation details. The reported-capacity boundary may appear once earlier because it directly changes interpretation. |
| Formula version and sources | Which model and OpenZFS references support the answer? | Calculation version and dated engine sources | evidence | They make a shared or copied plan verifiable after the implementation changes. | Keep version and source dates quiet at the end of calculation details. Do not add a provider card. |
| Copy summary | How can the person retain the exact plan in text? | Existing normalized copy serializer | evidence | It preserves the submitted inputs, exact results, assumptions, and formula version. | One secondary action after the visible result. Do not copy automatically. |
| Share plan | How can the person reopen the same submitted configuration? | Versioned `state` query serializer | evidence | An explicit share action is the only reason to create URL state. | Serialize submitted input only. Do not serialize derived results, display unit, statuses, or defaults on mount. |
| Common raw bytes, aligned member bytes, sector bytes, block physical bytes, native block counts, and free physical bytes | What exact intermediate values did the engine use? | Current and step engine records | evidence | They are useful for audit and fault diagnosis but too detailed for the main result. | Put them only in calculation details. Do not promote them to metrics or composition segments. |
| Status text for changed input, copy, share, restoration, and invariant failure | What just happened, and can I recover? | Local interface state | evidence | Concise status preserves feedback and recovery. | Render one status at a time at the narrowest useful scope. Do not duplicate a field error or result announcement. |
| Calculation derivation array | How did each width resolve internally? | `result.derivation` | omit | The proposed exact trace already exposes the useful fields with clearer labels. Rendering both would duplicate the same proof. | Do not add a second raw derivation disclosure. |
| Marker art, screenshot, performance prediction, duration, safety verdict, commands, and live pool data | Can this page prove a real operation or recommend one? | Not supplied by the engine | omit | None answers the capacity question with reliable data. | Do not fabricate live state, progress, risk, time, or command-ready devices. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | RAIDZ level | required and defaulted | yes | Common planning baseline, `RAIDZ2` | visible | `ToolChoiceGroup` with `RAIDZ1`, `RAIDZ2`, and `RAIDZ3` | Parity changes width validation and allocation. | Full-width row. Choices wrap without shrinking their 44 px hit targets. |
| 2 | Current width | required and defaulted | yes | Common planning baseline, `6` | visible | `ToolTextField` with `inputMode="numeric"`, no autocomplete, and no spellcheck | Exact editor strings and invalid input must remain recoverable, so a number control that normalizes values is unsuitable. | First field in the width pair, then full width below 520 px. Error stays below it. |
| 3 | Final width | required and defaulted | yes | One-disk expansion baseline, `7` | visible | `ToolTextField` with `inputMode="numeric"`, no autocomplete, and no spellcheck | It defines the planned attach count and must remain strictly greater than current width. | Second field in the width pair, then full width below 520 px. Error stays below it. |
| 4 | Smallest existing member | required and defaulted | yes | Representative planning value, `8 TB` | visible | `ToolQuantityInput` with exact text value and `GB`, `TB`, `GiB`, `TiB` unit choices | The smallest member limits the common envelope and exact decimal grammar must survive invalid edits. | Full width. Value and unit stay joined; the unit owns a fixed-width end cell. |
| 5 | Each added disk | required and defaulted | yes | Matches the default existing member, `8 TB` | visible | `ToolQuantityInput` with exact text value and the same unit choices | The disk must be at least as large as the smallest existing member, while larger excess stays excluded. | Full width below the smallest-member field. Do not place the two long quantity controls side by side at narrow widths. |
| 6 | Current physical allocation | required | yes | No default, user supplied from `zpool list -vp` | visible | `ToolQuantityInput` with description `Use this vdev's ALLOC value from zpool list -vp.` | This is the only intentionally incomplete input and its physical meaning prevents a likely logical-size mistake. | Full width. Error and short description wrap below the joined value and unit control. |
| 7 | Workload | required and defaulted | no, it sets terminology and the valid block-size ceiling | Common filesystem case | visible | `ToolChoiceGroup` with `Filesystem` and `Zvol` | Seeing both choices makes the property and block-size limit clear. | Full-width row after capacities. |
| 8 | `recordsize` or `volblocksize` | required and defaulted | yes | OpenZFS common default, `128 KiB` | visible | `ToolSelect` for powers of two and `Custom`; conditional `ToolQuantityInput` for exact custom size | Block allocation changes the modeled result, so the active assumption cannot be collapsed. | First field in a two-column model row, then full width below 760 px. Custom value appears directly below it. |
| 9 | Custom block size | conditionally required | yes | No default beyond the current selected block size | conditional | `ToolQuantityInput` | It replaces the preset only after the user chooses `Custom`. | Full width directly after the block-size selector. |
| 10 | `ashift` | required and defaulted | yes | Common 4 KiB sector baseline, `ashift 12` | visible | `ToolSelect` with `9 (512 B)`, `12 (4,096 B)`, `13 (8,192 B)`, and `14 (16,384 B)` | Sector size changes alignment and block allocation, so the assumption remains visible. | Second field in the model row, then full width below 760 px. |
| 11 | Plan expansion | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It runs the local model and names the answer that follows. | Full-width first action on narrow screens. |
| 12 | Reset | secondary action | not applicable | Restores documented defaults | visible | `ToolButton` with `variant="ghost"` | It restores all documented defaults and the clean URL without competing with the main action. | Full-width after `Plan expansion` on narrow screens. |
| 13 | Display unit | derived display control | no, presentation only | Derived from member unit family | result | Compact `ToolSelect` with `TB` and `TiB` in the result header | It changes friendly capacity labels without changing exact bytes or share state. | Stacks below the lead detail if it no longer fits beside the result label. |
| 14 | Copy summary | secondary action | no | Available after success | result | `ToolButton` or `ToolCopyAction` with secondary treatment and existing exact serializer | It saves a complete text receipt only after a valid result. | Full-width before Share on narrow screens. |
| 15 | Share plan | secondary action | no | Available after success | result | `ToolButton` with secondary treatment and existing versioned serializer | It creates and copies a stateful link only after a deliberate user action. | Full-width after Copy on narrow screens. If clipboard fails, the read-only link appears below. |

Validation, focus, keyboard, and URL behavior:

- Mark every required field with a visible `*` and programmatic required state. Defaults do not remove the required meaning.
- Preserve exact editor strings. Do not clamp, swap, round, or normalize an invalid value while the person is editing.
- Enter in a text input submits the form unless input method composition is active. Radio groups and selects keep their native keyboard behavior.
- On submission, put each field error directly below its owner and focus the first invalid field in source order. Do not repeat the full list in a form-level summary. A single field may expose only one message at a time.
- An edit clears the previous result, result announcement, action status, and shared query because the old answer no longer matches the visible inputs. A dependent RAIDZ, workload, or unit edit may show its new field error immediately without showing a result.
- Opening `/raidz-expansion-planner` must leave the URL unchanged through server render and hydration. Defaults and the blank initial result never enter history or the query string.
- `Share plan` may replace the URL with a versioned `state` query only after a valid submitted result. It stores normalized input only. A valid shared query restores and calculates that explicit plan. An invalid query restores defaults, removes the query, shows one recovery notice, and produces no result.
- Reset clears query state with `replaceState`, restores the documented initial editor, and focuses `RAIDZ1`, matching the existing recovery contract.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Final modeled gain | How much modeled logical capacity does the complete expansion plan add immediately? | `final.immediateGainBytes`, current and final immediate capacity, final width, and level | One `ToolPrimaryResult` labeled `Modeled capacity gained`. Its value is the friendly gain. Its detail reads as one sentence, for example `Modeled logical capacity rises from 32.00 TB to 57.90 TB at 10 members. RAIDZ2 stays RAIDZ2.` | This is the only dominant answer. Do not add `Capacity plan`, a verdict pill, or equal-size answer cards. |
| 2 | Reporting boundary | Will live ZFS accounting match this number? | `reportedCapacity: null` | One plain supporting sentence after the lead: `Live reported capacity is not predicted by this model.` | Never show a numeric reported value, `Unknown` as a fifth metric, or a tinted caveat panel. |
| 3 | Final-width composition | Why is the expanded final capacity below a fresh vdev? | `oldLogicalBytes`, `final.newWritableLogicalBytes`, `final.geometryGapBytes`, and `final.nativeLogicalBytes` | Page-owned exact allocation figure. The heading names the fresh total. Three segments and adjacent values show `Old-width logical data`, `Writable at final width`, and `Geometry gap`. The accessible sentence states that the three exact values sum to the fresh comparator. | Derive widths with integer ratios from BigInt values. Adjacent text is authoritative for zero or tiny segments. Do not use the current number-based `ToolAllocationBar` unless it gains an exact BigInt contract. |
| 4 | Expansion steps | What does each sequential one-disk attach change? | Future `steps[]` only | `ToolDataTable` with `After attach`, `Width`, `Gain from current`, `Modeled capacity`, `Fresh comparator`, and `Gap`. The first column reads `Disk 1`, `Disk 2`, and so on. | Every row means one attach. No current baseline row, progress state, date, duration, or equal-distance connector. The final row may repeat the lead only because it closes the ordered comparison. |
| 5 | Calculation details | Which exact inputs and integer steps support the friendly result? | Submitted normalized inputs, old block count, old logical bytes, physical remainder, aligned member and sector bytes, per-width allocation fields, conditional disk excess, assumptions, formula version, and sources | One collapsed `ToolDisclosure` titled `Calculation details`. Use `ToolKeyValueList` for scenario and model facts, one contained exact-byte table for per-width derivation, then short assumption and source lists. | Keep exact byte values out of the main step table. The derivation table owns horizontal overflow. Omit total disk excess when zero. Do not render the engine derivation array again. |
| 6 | Result actions and status | How can the person keep or reopen this exact plan? | Existing copy summary, versioned shared input, clipboard outcome, and generated share URL | One `ToolActionRow` with secondary `Copy summary` and `Share plan`. A single `ToolStatus` follows it. Show a read-only share-link field only when clipboard copy fails or the person still needs the URL. | No primary styling, automatic clipboard access, download, or action before a valid result. Status never repeats the lead announcement. |

Read without internal reports, the result says: `25.90 TB of modeled logical capacity is gained immediately, rising from 32.00 TB to 57.90 TB after four disk additions while RAIDZ2 stays RAIDZ2.` The composition explains the 3.05 TB gap to a fresh 10-wide vdev, the step table shows each one-disk transition, and calculation details provide exact verification.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large lead answer | The single final gain that drives the planning decision | Not applicable. Hierarchy rather than geometry makes the answer dominant. | Use one `ToolPrimaryResult`. |
| Final composition bar | Old-width logical data plus final-width writable capacity plus the geometry gap equals the fresh final-width envelope | Yes. Every segment has an exact nonnegative byte value and the fresh comparator is a real denominator. | Use `ToolAllocationBar` with BigInt values and the categorical palette, an accessible sum sentence, and authoritative adjacent values. |
| Sequential step table | Repeated results after each one-disk attach | Yes. Rows share one fixed schema and their order encodes attach sequence without claiming elapsed time. | Use `ToolDataTable` with future steps only. |
| Timeline | Time or progress through RAIDZ expansion | No. The planner has no duration, dates, measured progress, or equal-time intervals. | Omit. Do not use `ToolTimeline` or call the step table a timeline. |
| Progress bar | How far a live reflow has advanced | No. The engine has no live operation, measured start, end, or progress denominator. | Omit. Do not use `ToolProgressBar`. |
| Five equal metric cards | Relative importance of current, immediate, fresh, gap, and reported values | No. Equal boxes would make a null reporting boundary compete with the answer and repeat values already used in the lead and composition. | Replace with one lead sentence, one composition figure, and one plain reporting boundary. |
| Exact derivation table | Repeated integer allocation fields at each width | Yes. Every row uses the same width and byte-count schema. | Use one contained table inside `Calculation details`. |
| Marker art or screenshot | Conceptual or real-interface proof | No. The exact composition and step table already express the useful relationships, and there is no live pool to prove. | Omit. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | RAIDZ2, widths 6 to 7, 8 TB members, 8 TB added disks, filesystem, 128 KiB recordsize, and ashift 12 are set. Physical allocation is blank. `Plan expansion` and Reset are enabled. | Absent | All result regions absent | No errors, restoration notice, status, or placeholder result | Normal document order. Nothing moves focus or announces on load. Clean URL stays unchanged. |
| Invalid or incomplete submission | Preserve every editor string and keep actions available | Absent, with any stale result already cleared | Absent | Show one precise message below every invalid field. Do not show a duplicate form summary. The primary action remains the retry path. | Focus the first invalid field in source order. Field semantics announce its error once. |
| Dependent invalid edit | Preserve the new RAIDZ level, workload, block size, or unit and every other editor string | Clear immediately | Clear immediately | Show the one new dependent error below current width, block size, or changed capacity field | Keep focus on the control that caused the dependency change. Announce the new error politely without moving focus. |
| Calculating | Keep inputs visible and prevent only duplicate submission if calculation spans a paint | No loading placeholder | No stale result | Not normally applicable because the calculation is local and tested under 50 ms. Do not add a spinner or artificial delay. | If a busy state becomes perceptible, announce `Planning expansion` politely and keep focus on the initiating action. |
| Success | Preserve submitted inputs. Enable Reset, display unit, Copy, and Share | Show exactly one final gain result with the from and to values and unchanged level in its detail | Show reporting boundary, composition, future step table, collapsed details, and result actions in contract order | The existing inputs and `Plan expansion` action allow another submission | Focus the lead output or its heading after explicit submission and announce one complete answer in screen-reader order. Do not steal focus when restoring a valid shared plan on load. |
| Zero occupancy or zero gap | Inputs remain visible and valid | Show a real zero or nonzero gain, never blank | Keep zero-valued legend and table entries. A zero composition segment may have no visible width, but its label and `0 TB` or `0 TiB` value remain | No empty-state message because zero is valid data | Announce exact zero meaning as part of the complete result. |
| Empty or no data | Not applicable | Not applicable | Not applicable | The local deterministic engine returns either a complete result or an error. Do not invent an empty state. | No announcement. |
| Partial result | Not applicable | Absent | Absent | The engine must not expose partly reconciled values. Any invariant fault becomes failure. | No partial announcement. |
| Engine or invariant failure | Preserve all valid submitted inputs and clear any stale result | Absent | Absent | One `ToolStatus` says `Planning failed. Try again.` The primary action remains the retry path. Never expose a plausible clamped result. | Focus the status only if the existing focus would otherwise be lost. Announce it once as an error. |
| Valid shared restoration | Restore normalized inputs, calculate the explicit saved plan, and expose result actions | Show restored result | Show all applicable regions | One quiet notice says `Shared plan loaded` | Do not move focus on load. Announce the restoration notice only if assistive technology would otherwise miss the state change. |
| Invalid shared restoration | Restore exact clean defaults and remove the query | Absent | Absent | One notice says `Shared plan could not load` and the primary action stays available | Do not move focus. Do not announce raw decoder details. |
| Copy or share success | Inputs and result remain unchanged | Remains visible | Remains visible | One status says `Copied` or `Share link copied`. A successful Share action updates the URL once. | Keep focus on the action. Announce one concise status. |
| Clipboard failure | Inputs and result remain unchanged | Remains visible | Remains visible | Copy says `Copy failed`. Share says `Link ready. Copy failed.` and reveals the selectable read-only link | Keep focus on the action, then let normal tab order reach the share-link field. |
| Expanded calculation details | Inputs, lead, composition, steps, and actions remain visible | Remains visible above | Open exact facts and derivation in normal flow | The same disclosure trigger closes it. Its tables scroll inside their own viewport | Expansion state uses native disclosure semantics. Focus stays on the trigger until the person tabs into the content. |
| Edited after result | Preserve the edit and clear result, share link, result statuses, and shared query immediately | Absent | Absent | Show dependent validation only when the edit creates one | Keep focus on the edited control. A quiet status may say `Inputs changed`, but it must not create a second live region. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Visible RAIDZ and workload choices | `ToolChoiceGroup` | It keeps real radio semantics and exposes all two or three meaningful choices. | `ToolSelect`, because hiding these short choices makes their effect harder to see. |
| Recoverable width text | `ToolTextField` with numeric input mode | It preserves invalid editor strings and field-scoped errors while offering a numeric mobile keyboard. | `ToolNumberField`, because it normalizes input and cannot preserve the tool's strict editor grammar reliably. |
| Exact capacity with unit | `ToolQuantityInput` | It joins the exact decimal string and unit as one decision without passing through JavaScript Number. | `ToolQuantityField`, because its number state would weaken exact byte parsing and invalid-string recovery. |
| Bounded block size and `ashift` | `ToolSelect` | Both have finite supported values and need native select behavior on mobile. | `ToolComboBox`, because the option sets are short enough that filtering adds work. |
| Required allocation settings | Visible `ToolChoiceGroup` and `ToolSelect` controls | Workload, block size, and `ashift` remain in the main form because active defaults shape validation or the answer. | `ToolDisclosure`, because a collapsed summary still conceals required assumptions before submission. |
| Primary and recovery actions | `ToolButton` inside `ToolActionRow` | It preserves one accent primary action and one quiet Reset action with consistent hit targets. | Hand-rolled route buttons and a disabled submit, because the shared controls already own focus and treatment. |
| Dominant gain | `ToolPrimaryResult` | It provides one accessible label, one dominant value, and one detail sentence. | A result heading plus verdict line plus metric grid, because those treatments repeat the answer. |
| Exact final composition | Page-owned BigInt allocation figure | Its three segments must use exact integer ratios and preserve zero or tiny text values. | Current `ToolAllocationBar`, because it accepts Number values and can lose precision at the supported 10 PB boundary. |
| Sequential widths | `ToolDataTable` | Every future step has the same six fields and benefits from aligned exact comparison. | `ToolTimeline`, because attach order is not a time axis and the planner knows no duration. |
| Compact scenario and trace facts | `ToolKeyValueList` plus a page-owned contained native table | Key/value rows suit the one-off facts, while the repeated exact width trace needs columns. | Equal cards or raw JSON, because neither supports fast audit. |
| Optional calculation evidence | `ToolDisclosure` | It keeps long exact proof available after the answer without making it the first task. | Always-open trace and modal detail, because both interrupt the reading path. |
| Copy result text | Existing exact copy serializer triggered by `ToolButton`, or `ToolCopyAction` only if it can report clipboard failure | The current serializer contains normalized inputs, exact bytes, assumptions, and formula version. | A generic copy of visible text, because it would lose exact evidence. |
| Share result state | Page-owned handler on a secondary `ToolButton` | It must encode validated input, update history, attempt clipboard write, and expose the link after clipboard failure. | Automatic URL updates, because defaults and edits are not explicit share actions. |
| Feedback | One `ToolStatus` plus field errors | It supplies one polite or error announcement at the narrowest useful scope. | Concurrent restore, action, and result status paragraphs, because they can produce duplicate announcements. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench band spans the main column. Its inner form uses task-shaped rows: RAIDZ choice, width pair, three capacity rows, visible workload and allocation controls, then actions. Results stack as lead, boundary, composition, steps, details, and actions. | `7.2759576141834259033203125 TiB`, `10,000 TB`, width 64, and exact byte value `640000000000000000 B`. | No page overflow. The step and derivation table viewports own horizontal overflow when needed. |
| Medium main column, about 521 px to 809 px | Width fields may remain paired if labels and errors fit. Capacity controls use one column. Result order does not change. Composition legend may use two columns and then one. | `Filesystem, 16 MiB recordsize, ashift 14` and `Live reported capacity is not predicted by this model.` | Text and values wrap in their region. Tables alone may scroll horizontally. |
| Narrow mobile, 320 px to 520 px | Every core field and action stacks in source order. `Plan expansion` comes before Reset and both fill the row. The result keeps desktop reading order. Composition legend becomes one column. | The exact converted capacity above, `Writable at final width`, and `Each added disk is too small.` | Quantity inputs wrap only below an authored minimum; value and unit remain one control. Tables own contained horizontal overflow. The page never scrolls horizontally. |
| Maximum 63 to 64 plan | The step table has one future row. The composition and lead remain full-width above it. | `640.00 PB`-scale friendly values and 18-digit exact byte counts | Friendly values wrap. Exact derivation table owns horizontal overflow. |
| Maximum multi-step plan | Up to 61 future rows remain in one table. Column headers stay semantic and every row remains reachable. Do not put the table beside the composition. | `Disk 61`, width `64`, and repeated 10 PB member outputs | Step-table viewport owns horizontal overflow. Normal page vertical scrolling owns row length. |
| Expanded calculation details at any width | Disclosure remains in normal flow. Key/value facts wrap before the exact table. Source links break safely. | Long OpenZFS source URLs, exact BigInt fields, and assumption sentences | The exact derivation table owns horizontal overflow. Links wrap. No sibling overlaps a column. |
| Increased text size or long translated labels | Fields and action groups move to one column before labels collide. Controls may grow taller than 44 px. | `Current physical allocation`, `Modeled capacity gained`, and `Fresh 64-member logical envelope` at 200 percent text size | Text wraps inside controls, legend rows, and result detail. The document keeps zero horizontal overflow. |

## Interface wireframes

### Desktop result

```text
RAIDZ level *
[ RAIDZ1 ] [ RAIDZ2 selected ] [ RAIDZ3 ]

Current width *                  Final width *
[ 6                          ]  [ 10                         ]

Smallest existing member *
[ 8                                                ][ TB  v ]

Each added disk *
[ 8                                                ][ TB  v ]

Current physical allocation *
[ 32                                               ][ TB  v ]
Use this vdev's ALLOC value from zpool list -vp.

Workload *
[ Filesystem selected ] [ Zvol ]

recordsize *                      ashift *
[ 128 KiB                  v ]   [ 12 (4096 B)              v ]

[ Plan expansion ]  [ Reset ]

----------------------------------------------------------------

Modeled capacity gained                         Display [ TB  v ]
25.90 TB
Modeled logical capacity rises from 32.00 TB to 57.90 TB at
10 members. RAIDZ2 stays RAIDZ2.
Live reported capacity is not predicted by this model.

Fresh 10-member logical envelope: 60.95 TB
+--------------------------------------------------------------+
| old-width logical data | writable at final width | gap       |
+--------------------------------------------------------------+
Old-width logical data    21.33 TB
Writable at final width   36.57 TB
Geometry gap               3.05 TB

Expansion steps
+--------------+-------+--------------+-----------+--------+---------+
| After attach | Width | Gain current | Modeled   | Fresh  | Gap     |
+--------------+-------+--------------+-----------+--------+---------+
| Disk 1       | 7     | 5.33 TB      | 37.33 TB  | 37.33  | <0.01   |
| Disk 2       | 8     | 12.09 TB     | 44.09 TB  | 45.51  | 1.42    |
| Disk 3       | 9     | 19.81 TB     | 51.81 TB  | 54.86  | 3.05    |
| Disk 4       | 10    | 25.90 TB     | 57.90 TB  | 60.95  | 3.05    |
+--------------+-------+--------------+-----------+--------+---------+

> Calculation details

[ Copy summary ] [ Share plan ]
```

### Narrow mobile result

```text
RAIDZ level *
[ RAIDZ1 ][ RAIDZ2 ][ RAIDZ3 ]

Current width *
[ 6                              ]

Final width *
[ 10                             ]

Smallest existing member *
[ 8                       ][ TB v ]

Each added disk *
[ 8                       ][ TB v ]

Current physical allocation *
[ 32                      ][ TB v ]
Use this vdev's ALLOC value from
zpool list -vp.

Workload *
[ Filesystem ][ Zvol ]

recordsize *
[ 128 KiB                       v ]

ashift *
[ 12 (4096 B)                  v ]

[        Plan expansion          ]
[              Reset             ]

----------------------------------

Modeled capacity gained
25.90 TB
Modeled logical capacity rises from
32.00 TB to 57.90 TB at 10 members.
RAIDZ2 stays RAIDZ2.

Display [ TB v ]
Live reported capacity is not
predicted by this model.

Fresh 10-member envelope: 60.95 TB
+--------------------------------+
| old data | writable      | gap |
+--------------------------------+
Old-width logical data
21.33 TB
Writable at final width
36.57 TB
Geometry gap
3.05 TB

Expansion steps
+--------------------------------+ -> table scrolls inside
| After | Width | Gain | ...      |
| Disk 1| 7     | 5.33 | ...      |
| Disk 4| 10    | 25.90| ...      |
+--------------------------------+

> Calculation details

[         Copy summary           ]
[          Share plan            ]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
RAIDZ2, 6 to 7, 8 TB members
Current physical allocation *
[                               ][ TB v ]
[        Plan expansion          ]
[              Reset             ]
No result or placeholder.

INVALID
Final width *
[ 6                              ]  <- focus
Must exceed current width.
Current physical allocation *
[                               ][ TB v ]
Enter physical allocation.
[        Plan expansion          ]
No duplicate form summary and no stale result.

CALCULATING
Not normally rendered. Local work completes under 50 ms.
If calculation spans a paint, keep the form and show:
[        Planning expansion      ]  busy, duplicate submit blocked

EMPTY OR PARTIAL
Not applicable. Zero is valid data. The engine returns a complete
reconciled result or no result.

FAILURE
[        Plan expansion          ]
Planning failed. Try again.
Inputs remain unchanged. No numeric result remains.

INVALID SHARED PLAN
Shared plan could not load.
Clean defaults, clean URL, and no result.

EXPANDED CALCULATION DETAILS
v Calculation details
Scenario
RAIDZ level                 RAIDZ2
Aligned member bytes        8000000000000 B
Physical remainder          4096 B
Formula                     v1

+-----------------------------------+ -> contained horizontal scroll
| Width | Sectors | Free bytes | ...|
| 7     | 48      | ...        | ...|
+-----------------------------------+

Assumptions
- The current vdev has not been expanded.
- No allocations change between planned steps.

Sources
- OpenZFS zpool-attach, checked 2026-08-13
```

## Removed or rejected

- Replace the existing three-column control grid with task-shaped rows. RAIDZ and width form one geometry group, the three capacities form a vertical input group, and the required allocation controls remain visible.
- Remove the form-level `Fix these inputs` summary. It repeats every field error and shows the same invalid state in two places.
- Remove the `Capacity plan` result heading and the five equal metric cells. The lead answer, one composition figure, and one reporting boundary establish a clearer hierarchy.
- Remove `Reported capacity: Unknown` from the metric comparison. A null live value is a boundary, not a quantity that belongs beside modeled capacities.
- Rename `New writable` to `Writable at final width`. The value includes all space available for final-width blocks, not only the capacity added by expansion.
- Do not call the ordered step comparison a timeline. There is no time axis, duration, or live reflow progress.
- Remove the current-width baseline from the step table. The lead already gives the starting capacity, and each table row should correspond to one planned disk attach.
- Use the shared allocation bar only with its BigInt path for exact capacity composition. Do not convert capacity values to Number.
- Keep workload, block size, conditional custom block size, and `ashift` visible in the main form. Their technical nature does not make their active defaults optional.
- Keep added-disk excess out of the composition bar and main metrics. It is excluded hardware capacity, so it belongs only in conditional calculation evidence.
- Do not add a loading skeleton, progress indicator, empty state, partial result, online request state, or data-source selector. The engine is synchronous and local.
- Do not add cards around the form, lead, composition, table, or details. The workbench band, spacing, headings, and one result divider own structure.
- Do not show raw engine JSON, a second derivation list, a marker-art diagram, or a screenshot. Each would duplicate clearer structured evidence.
- Do not add a duration estimate, safety verdict, parity recommendation, device command, live-pool import, performance forecast, or numeric `zfs list` or `df` prediction.
- Do not update the URL while editing or calculating. Only explicit Share, Reset, edit-after-share, and invalid-share recovery may replace URL state.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A valid plan renders exactly one dominant `Modeled capacity gained` output. Its detail names current and final immediate capacity, final width, and unchanged RAIDZ level without a second verdict or metric card. | Browser role inspection and screenshots for RAIDZ1, RAIDZ2, and RAIDZ3 plans. |
| UI-002 | deduplication | The result has no `Capacity plan` heading, five-cell metric grid, duplicate form error summary, or second visible lead value. `Reported capacity` appears once as a plain nonnumeric boundary. | Static source assertion plus Browser text counts in success and invalid states. |
| UI-003 | visual-truth | The final composition uses exact nonnegative BigInt segments whose sum equals the fresh comparator. A zero or tiny segment keeps its label and exact text value even when it has no visible width. | Unit fixture reconciliation plus Browser checks for FF-001, zero occupancy, full occupancy, and maximum input. |
| UI-004 | visual-truth | Expansion steps render as a repeated-field table with one future row per planned disk attach. No timeline, dates, duration, progress bar, or equal-distance connector appears. | DOM role assertions and static source test. |
| UI-005 | input | Core geometry, capacity, workload, block size, and `ashift` controls remain visible before submission. No disclosure contains a required or defaulted result-driving input. | Browser checks for initial visibility, workload change, custom block size, and result changes after block-size and `ashift` changes. |
| UI-006 | validation | Invalid submission preserves editor strings, clears stale output, shows each message once below its field, and focuses the first invalid field in source order. There is no form-level duplicate list. | Keyboard-only Playwright tests with invalid width, allocation, capacity, and dependent block size. |
| UI-007 | state | Editing any submitted or restored input clears the result, result status, share link, and shared query before another plan can appear. An invariant failure preserves inputs and exposes one retry status with no numeric result. | Playwright state, history, and injected-failure tests. |
| UI-008 | responsive | At 320 px and 200 percent text size, controls and result regions keep the contract reading order, all actions remain at least 44 px high, and the document has no horizontal overflow. | Browser measurements in dark and light themes with long exact converted values. |
| UI-009 | responsive | The main step table and expanded derivation table own any horizontal overflow. Every header and cell remains reachable without a sibling covering it. | Browser scroll-width and hit-testing checks for a 6 to 64 plan at 320 px and 760 px. |
| UI-010 | accessibility | Explicit submission focuses the lead and produces one complete polite result announcement. Shared restoration does not steal focus. Field errors, disclosure triggers, actions, and contained tables work by keyboard with visible focus. | Browser accessibility tree, keyboard pass, and live-region count assertions. |
| UI-011 | evidence | `Calculation details` stays collapsed by default and exposes submitted scenario facts, exact per-width allocation data, conditional nonzero disk excess, three assumptions, formula v1, and dated OpenZFS sources. It does not render the engine derivation array again. | Browser fixtures for equal and larger added disks plus exact trace assertions. |
| UI-012 | actions | Copy and Share appear only after success and remain secondary. Clipboard access occurs only from their explicit actions. Clipboard failure preserves the result and reveals a selectable share link when one exists. | Clipboard success and rejection fixtures with action and URL assertions. |
| UI-013 | url | Opening `/raidz-expansion-planner` leaves the URL and history unchanged through hydration. Only explicit Share creates `?state=`, while Reset, an edit after sharing, or invalid-state recovery returns to the clean route. | Browser URL and history assertions across clean, share, edit, reload, invalid restore, and Reset flows. |
| UI-014 | precision | Width and capacity controls preserve invalid text without Number coercion. Friendly unit changes never alter exact stored bytes, and the final composition does not convert capacity values to Number. | Unit tests for parser and conversions plus static source assertion against Number-based capacity geometry. |

## Open questions and blockers

- None. The current engine, brief, and test fixtures settle the inputs, lead answer, exact comparison, step ordering, evidence, URL behavior, and recovery states needed for implementation.
