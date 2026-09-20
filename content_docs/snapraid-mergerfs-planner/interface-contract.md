# Interface contract: SnapRAID and mergerfs config planner

Status: ready
Tool: SnapRAID and mergerfs config planner
Route: `/snapraid-mergerfs-planner`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A Linux homelab administrator preparing SnapRAID and mergerfs configuration files from known mount paths.
- Question: Do these paths and capacities form a structurally valid configuration, and what exact config text should I review?
- Lead answer: A valid, complete pair of generated configuration outputs or precise field errors.
- Next decision: Review the generated directives against the real host before writing either file under `/etc`.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Data disks | Which branches feed both configurations? | User input | input | Paths and capacities drive validation and both outputs. | IDs appear once in rows and only where required in generated config. |
| Parity disks | Where do parity files live and are they large enough? | User input | input | They drive validation and SnapRAID directives. | Do not repeat parity paths in a result summary. |
| Content files | Where are independent SnapRAID content copies stored? | User input | input | Their count and location determine validity. | Do not add a second content-copy table. |
| Pool mount | Where should mergerfs expose the pool? | User input | input | It changes the fstab output and overlap checks. | Show once in the form and generated line. |
| Mergerfs policy | Which approved option set should be generated? | User input | input | Its default changes the generated fstab line. | Keep visible; do not print the full option string under the control. |
| SnapRAID blocksize | Which blocksize directive should be generated? | User input | input | Its default changes the generated file. | Keep visible; explanation belongs below the tool. |
| Standard excludes | Should fixed exclude directives be generated? | User input | input | Its selected default changes the output. | Keep visible; generated lines are the only repeat. |
| Configuration status | Can the files be generated from these inputs? | Engine | lead | It is the one verdict before exact output. | Do not render a four-row table where every structural check says Pass. |
| Inventory totals | What did the generator validate? | Engine | supporting | Data total, parity total, and content-copy count help review the inputs. | Show each once in compact key/value rows. |
| SnapRAID config | What exact file should I review? | Engine | evidence | The generated text is authoritative. | One code region and one copy action. |
| mergerfs fstab line | What exact fstab entry should I review? | Engine | evidence | It is a separate artifact with a different destination. | One code region and one copy action. |
| Raw byte boundary | What integer values did the engine use? | Current UI | omit | It is implementation evidence without a user decision. | Remove `Review boundaries` raw-byte sentence. |
| Host checks | What remains unknown? | Product boundary | supporting | The generator cannot inspect mounts, permissions, versions, or physical disks. | Keep one short result note; detailed checklist remains below the workbench. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Data disk path, capacity, and unit rows | required and defaulted | yes | Deterministic example inventory | visible | Page-owned repeatable rows using `ToolTextField` and `ToolQuantityInput` | They drive both outputs and parity validation. | Path spans one row; joined capacity and remove action follow without overlap. |
| 2 | Add data disk | secondary action | yes | no default | visible | `ToolButton` | Extends a required input group. | Follows the current rows. |
| 3 | Parity disk path, capacity, and unit rows | required and defaulted | yes | One deterministic example parity row | visible | Page-owned repeatable rows using `ToolTextField` and `ToolQuantityInput` | They determine parity directives and validity. | Same authored row pattern as data disks. |
| 4 | Add parity disk | secondary action | yes | no default | visible | `ToolButton` | Adds another supported parity level. | Follows parity rows. |
| 5 | Content file paths | required and defaulted | yes | Two deterministic example paths | visible | `ToolRepeatableList` with `ToolTextField` | Their count and placement determine validity. | Each path and remove action remain reachable. |
| 6 | Add content file | secondary action | yes | no default | visible | `ToolButton` | Extends the required content group. | Follows current paths. |
| 7 | Mergerfs pool mount | required and defaulted | yes | `/mnt/storage` example | visible | `ToolTextField` | It changes the fstab line and overlap checks. | Full width. |
| 8 | Mergerfs policy | defaulted | yes | Balanced preset | visible | `ToolChoiceGroup` | Both supported policies are important and change output. | Two choices wrap. |
| 9 | SnapRAID blocksize | defaulted | yes | 256 KiB | visible | `ToolChoiceGroup` | The active assumption changes generated parity layout. | Three short choices wrap. |
| 10 | Include standard excludes | defaulted | yes | selected | visible | `ToolCheckbox` | It changes generated directives. | Full-width checkbox. |
| 11 | Check and generate | primary action | not applicable | no default | visible | `ToolButton` | Validates the form and produces both artifacts. | Full width before Reset. |
| 12 | Reset | secondary action | no | no default | visible | `ToolButton` | Restores deterministic examples and clears output. | Full width after primary action. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Configuration verdict | Are both outputs structurally ready for review? | Result status | `ToolResultLead` or result heading stating `Configuration ready for review` | Invalid input renders no code and no positive verdict. |
| 2 | Validated summary | What inventory did the generator accept? | Data count and total, parity count and total, content count | `ToolKeyValueList` with three rows | Do not repeat the same sentence above the list. |
| 3 | SnapRAID artifact | What goes into `/etc/snapraid.conf`? | Generated SnapRAID text | `ToolCodeOutput` with `ToolCopyAction` | Code stays exact, selectable, and horizontally contained. |
| 4 | mergerfs artifact | What goes into `/etc/fstab`? | Generated fstab line | `ToolCodeOutput` with `ToolCopyAction` | Keep separate from SnapRAID text. |
| 5 | Boundary | What must still be checked on the host? | Product exclusions | One short sentence after the artifacts | Do not repeat the full host checklist already below the workbench. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Validation table | Four checks and their states | No useful comparison; three rows always say Pass and one says Verify on success. | Omit; invalid fields own failures and the result has one clear verdict. |
| Code blocks | Exact generated artifacts | Yes, literal text is the result. | Use two `ToolCodeOutput` regions. |
| Allocation bar | Data versus parity capacity | Yes, exact capacities share a denominator, but this relationship does not answer the config-generation task. | Omit. |
| Diagram | Relationship between SnapRAID and mergerfs | Not applicable; supporting content already carries a compact comparison table. | Omit from the workbench. |
| Timeline or progress | Time or completion | No truthful axis or denominator. | Omit. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | All result-driving defaults visible and editable | Absent | Absent | No helper paragraphs inside the form | Normal focus order. |
| Invalid fields | Preserve every entered value | Absent | No generated code | One local error per field and one concise summary only when several groups fail | Focus first invalid control and announce failure once. |
| Invalid content minimum | Preserve paths and parity rows | Absent | No generated code | One content-group error states required count | Focus first content path or Add content file. |
| Success | Inputs remain editable | Ready verdict first | Summary and both code outputs | One short host-boundary note | Focus result heading and announce ready state. |
| Changed after success | Preserve the edit | Remove stale verdict | Remove both stale code blocks | No stale-output panel | Quietly return to input state. |
| Unexpected engine failure | Preserve all input | Absent | Absent | One retry message | Focus or announce the message. |
| Clipboard success | Result remains | Remains | Code remains selectable | One local `Copied` state on the used action | Announce once. |
| Clipboard failure | Result remains | Remains | Code remains selectable | One local copy failure beside the used artifact | Announce once. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Path and capacity rows | `ToolTextField`, `ToolQuantityInput`, and page-owned row grouping | Each disk has two different decisions that must stay explicit. | A single generic repeated component that hides role-specific limits. |
| Policy and blocksize | `ToolChoiceGroup` | Small important option sets stay visible. | Native selects or disclosures. |
| Boolean output switch | `ToolCheckbox` | It is a submitted independent choice. | Switch, because the output changes only after submit. |
| Generated artifacts | `ToolCodeOutput` | Exact selectable code with contained overflow is the result. | Raw-output disclosure or prose. |
| Copy | `ToolCopyAction` | It keeps copy behavior beside each artifact. | One ambiguous copy-all action. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | Data rows, parity rows, content paths, pool and visible options, actions, divider, verdict, summary, SnapRAID output, fstab output, boundary | 42 data paths and a long explicit mergerfs branch line | Each code viewport only. |
| 760px | Each disk path gets enough width; capacity and unit remain joined; remove action stays fixed | `/srv/storage/disk-with-a-long-reviewed-name` | Code viewports only. |
| 375px and 320px | Row fields stack deliberately; labels stay visible; actions become full width | Full fstab line with 42 data paths | Code viewport scrolls; page has no horizontal overflow. |

## Interface wireframes

### Desktop result

```text
Data disks                                      4 / 42
d1  Mount path * [/mnt/disk1]  Capacity * [8 TB v] [remove]
d2  Mount path * [/mnt/disk2]  Capacity * [8 TB v] [remove]
d3  Mount path * [/mnt/disk3]  Capacity * [8 TB v] [remove]
d4  Mount path * [/mnt/disk4]  Capacity * [8 TB v] [remove]
[Add data disk]

Parity disks                                    1 / 3
parity  Mount path * [/mnt/parity1]  Capacity * [12 TB v] [remove]
[Add parity disk]

Content files                                   2 / 12
[/mnt/disk1/.snapraid.content] [remove]
[/mnt/disk2/.snapraid.content] [remove]
[Add content file]

Mergerfs pool mount * [/mnt/storage]
Mergerfs policy * [Balanced] [Most free]
SnapRAID blocksize * [256 KiB] [512 KiB] [1024 KiB]
[x] Include standard excludes

[Check and generate] [Reset]
------------------------------------------------------------
Configuration ready for review

Data       4 disks · 32 TB
Parity     1 disk · 12 TB
Content    2 copies

/etc/snapraid.conf                              [Copy]
[selectable code viewport]

/etc/fstab mergerfs line                        [Copy]
[selectable code viewport]

Verify mounts, permissions, installed versions, and physical disk separation on the host.
```

### Narrow mobile result

```text
Data disks 4 / 42
d1
Mount path * [/mnt/disk1]
Capacity * [8          TB v] [x]
...
[Add data disk]

Parity disks 1 / 3
parity
Mount path * [/mnt/parity1]
Capacity * [12         TB v] [x]
[Add parity disk]

Content files 2 / 12
[path] [x]
[path] [x]
[Add content file]

Pool mount * [path]
Policy * [Balanced] [Most free]
Blocksize * [256] [512] [1024]
[x] Include standard excludes
[Check and generate]
[Reset]
----------------------------
Configuration ready for review
[summary rows]
/etc/snapraid.conf [Copy]
[scrollable code]
/etc/fstab mergerfs line [Copy]
[scrollable code]
[host boundary]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

The initial state shows all active defaults and no result. Invalid input keeps each value, removes all generated text, and shows field-local errors. The engine is synchronous and local, so loading, upstream, partial, and URL-restoration states do not apply. Code stays expanded because it is the answer, and each code viewport owns its overflow.

## Removed or rejected

- Remove `Ordered branches`, `Parity mount; filename generated`, `Minimum exceeds parity count`, `Outside data and parity mounts`, and `Expert setting` helper lines.
- Remove the full mergerfs option string under the policy input. It belongs only in generated output.
- Replace native selects with shared visible choices or custom selects as contracted.
- Remove the success validation table. A valid result already means structural checks passed; host verification is one boundary sentence.
- Remove `Review both files before touching /etc` as a large sentence and use the shorter ready verdict.
- Remove the duplicate status sentence, raw byte `Review boundaries`, and separate code descriptions such as `Generated directives` and `Data branches only`.
- Do not add a capacity chart, allocation bar, progress bar, timeline, marker art, or nested cards.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Success begins with one `Configuration ready for review` verdict followed directly by validated summary and generated files. | Browser and role assertion. |
| UI-002 | deduplication | No pass-only check table, raw-byte boundary sentence, full option-string helper, or repeated ready sentence remains. | Source and Browser text assertions. |
| UI-003 | visual-truth | Each generated code block contains the exact engine output and its own copy action. | Engine fixture and Browser clipboard test. |
| UI-004 | responsive | At 1280, 760, 375, and 320 pixels, controls remain reachable and only code viewports scroll horizontally. | Browser bounds and overflow assertions. |
| UI-005 | url | Opening and using the tool leaves `/snapraid-mergerfs-planner` unchanged. | Browser URL assertion. |
| UI-006 | inputs | Every defaulted setting that changes generated output stays visible; changing each one changes the next output. | Browser interaction tests. |
| UI-007 | errors | Invalid inputs render no partial config, keep values, show each field error once, and focus the first invalid control. | Browser invalid-state tests. |
| UI-008 | clipboard | Copy success or failure is local to the selected artifact and code remains selectable. | Browser clipboard tests. |

## Open questions and blockers

- No unresolved decisions. The builder can implement this contract without changing the information model.
