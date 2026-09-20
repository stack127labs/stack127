Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: LXC ID mapping checker
Route: /lxc-idmap-checker
Mode: pipeline
Review scope: current interface-contract refresh; no browser verification claimed

## User task

Primary user: a Proxmox operator debugging an unprivileged container.

Question: which host ID results, and does the selected owner's matching subordinate grant cover the map?

Lead answer: the checker shows the mapped host ID or a clear unmapped result.

Next decision: the operator fixes a range or grant before restarting the container.

## Information decisions

| ID | Information | User question | Disposition | Placement | Rationale |
|---|---|---|---|---|---|
| I1 | Query mapping | Which host identity is visible? | lead | result | It is the immediate troubleshooting answer |
| I2 | Range validity | Are map lines contiguous and safe? | evidence | result | Arithmetic explains failure |
| I3 | Grant coverage | Is the mapped host range authorized for this owner and ID type? | supporting | result | It separates map arithmetic from delegation |
| I4 | Grant owner | Whose subordinate ranges should be checked? | input | form | Grant files can contain several owners |
| I5 | Live kernel state | Will the container start here? | omit | omitted | Static input cannot prove runtime state |

## Input contract

| ID | Control | Requirement | Affects lead | Default | Placement | Validation | Recovery | Notes |
|---|---|---|---|---|---|---|---|---|
| IN1 | UID map | required text | yes | sample map | visible | u lines and ranges | line finding | Keep map lines intact |
| IN2 | GID map | required text | yes | sample map | visible | g lines and ranges | line finding | Checked independently |
| IN3 | Grant owner | required text when grants are supplied | no | root | visible | one non-empty owner | field finding | Exact match against grant rows |
| IN4 | UID grants | optional result-driving text | no | none | visible | owner:start:length | line finding | Parsed as `/etc/subuid` rows |
| IN5 | GID grants | optional result-driving text | no | none | visible | owner:start:length | line finding | Parsed as `/etc/subgid` rows |
| IN6 | Query type and ID | required result-driving fields | yes | uid 1000 | visible | uid/gid and bounded integer | field finding | Selects map and grant source |
| IN7 | Check mapping | primary action | yes | enabled | visible | valid inputs required | retain text | Focus query result |

## Result contract

| ID | Region | User question | Content | Priority | State behavior |
|---|---|---|---|---|---|
| OUT1 | Query lead | What host ID does this map to? | mapped host ID or unmapped | lead | focus after valid check |
| OUT2 | Range table | Which ranges were parsed? | type, container, host, length | supporting | rows after check |
| OUT3 | Findings | What needs correction? | overlap, gap, grant, syntax messages | evidence | only when findings exist |

## Visual semantics

| Element | Meaning | Truth test | Treatment |
|---|---|---|---|
| Mapped | query falls inside one range | yes, arithmetic returns one host ID | success lead |
| Unmapped | query falls outside ranges | yes, no containing range exists | warning lead |
| Grant unknown | no grants were supplied | yes, coverage cannot be proven | neutral note |
| Grant covered | one selected-owner grant covers the complete matched host range | yes, range endpoints fit one matching UID or GID grant | supporting success text |
| Grant missing | supplied matching-type grants do not cover the complete matched host range | yes, no selected-owner row covers both endpoints | supporting warning text |

## State contract

| State | Trigger | Lead region | Recovery | Focus | Persistence |
|---|---|---|---|---|---|
| Empty | first visit | short prompt | load sample | UID map | none |
| Editing | text changed | stale notice | check button | changed field | React state |
| Invalid | syntax or overlap error | no result region; error below its field | edit the marked field and check again | first error | inputs retained |
| Valid mapped | query covered | host ID lead | copy or edit | lead result | result in memory |
| Valid unmapped | query outside ranges | unmapped lead | add range | query field | result in memory |
| Valid, grant missing | query maps but full range lacks delegation | host ID lead plus missing grant status | fix owner or grant | grant field | result in memory |

The engine runs locally and synchronously. Loading and service failure are not applicable; do not invent request states. Invalid submission retains input and permits correction followed by the same primary action. Clipboard failure preserves selectable report data and must not announce success. Mapped, unmapped, unknown grant, and missing grant are distinct completed results. No disclosure or empty-result success is needed.

## Optional mode and state visibility

- Control mode: single
- Reason: UID and GID maps, grant owner, separate grants, query type, and query ID stay visible. Grant omission must remain distinguishable from failed coverage.
- Shared engine and normalized input mapping: checkLxcIdmap receives the two maps, owner, two grant sources, and query fields. No second calculation path or alternate rules are introduced.
- Active assumptions: Keep required and defaulted result-driving values in the input flow described above. Conditional fields appear beside the choice that activates them, before submission.
- Retention and recovery: Evidence expansion never changes input or result state. Retain edited values until the existing Reset, example, or branch action explicitly replaces them. Reveal and focus any invalid active conditional field; no collapsed region may hide a blocking error.
- URL, reload, and history restoration: Preserve the URL contract and existing explicit restoration behavior below. A clean canonical load must remain unchanged through hydration; this mode decision adds no query, storage, or history writes.
- Equivalent-input parity: There is one input model and one engine. A basic/advanced parity fixture is not applicable; disclosure state must not alter normalized inputs or computed output.

## Component contract

- Generic or native-looking fallback allowed: no
- Inspection: shared implementations in `app/tool-ui`, the source for `/tool-ui-lab`, this route, and sibling patterns in `/restic-retention-simulator`, `/rsync-filter-tester`, and `/lxc-idmap-checker`. This is source inspection, not a new rendered-state verification receipt.
- Native form, input, radio, table, and file semantics may remain underneath the approved stack127 presentation. Missing behavior must receive a complete shared or justified route-specific contract; it must not become a bare native control, generic upload box, or unrelated dashboard component.
- All rows use `--text-body`, `--color-text`, `--color-border`, `--radius`, `--space-*`, and `--focus-ring` as applicable. Only metadata uses `--text-small`. Keep one accent primary action, semantic status text, both themes, and no colored left edges.
- Route-specific choices retain the behavioral reason in their row and use the existing route stylesheet. They do not introduce new controls or public behavior. Shared components own their internal appearance; route styles own placement and any stated reflow.

| Need | Existing component inspected | Disposition | Chosen component | States, accessibility, responsive behavior, and tokens | Why it fits; rejected alternative |
| --- | --- | --- | --- | --- | --- |
| UID and GID maps and grants | `ToolTextArea` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextArea | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Four separate editors preserve line syntax, ID type, and field-associated recovery. Rejected: No host file read or mixed grant source. |
| Grant owner and query ID | `ToolTextField` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextField | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Exact owner text and numeric-mode query text preserve invalid values for recovery. Rejected: No implicit owner lookup or ID coercion. |
| Query type | `ToolChoiceGroup` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolChoiceGroup | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | UID and GID remain visible radio choices. Rejected: No hidden query branch. |
| Actions and copy | `ToolActionRow`, `ToolButton`, `ToolCopyAction` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolActionRow, ToolButton, and ToolCopyAction | Actions are explicit and keyboard accessible. Copy success follows a confirmed write; failure keeps text selectable. Downloads use the current report. Preserve focus, label actions, and wrap at narrow widths. Use secondary shared button tokens. | Check mapping is primary; example, reset, and copy retain text labels. Rejected: No restart or host mutation action. |
| Mapped answer and recovery | `ToolResultLead`, `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolResultLead and ToolStatus | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | The mapped host ID or unmapped state leads, with grant status separate. Rejected: No repeated host-ID metric. |
| Ranges and findings | `ToolDataTable` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolDataTable | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | Exact container and host endpoints stay aligned; findings name the affected range or grant. Rejected: No proportional range chart. |

## Responsive contract

| View | Layout | Priority | Overflow behavior |
|---|---|---|---|
| Wide | UID/GID map columns, UID/GID grant columns, then query and results | host ID lead | full-width table |
| Narrow | stacked maps, owner, grants, and query | check action in flow | long lines wrap |
| Very narrow | one column | lead before detail | no clipped numbers |

## Interface wireframes

```text
DESKTOP
┌ UID map ┐ ┌ GID map ┐
└─────────┘ └─────────┘
[ Grant owner ]
┌ UID grants ┐ ┌ GID grants ┐
└────────────┘ └────────────┘
[ Query type + ID ]
             [ Check mapping ]
          [ UID 1000 -> host 101000 ]
          [ grant verdict ]
          [ range table ] [ findings when present ]
```

```text
MOBILE
[ UID map ]
[ GID map ]
[ Grant owner ]
[ UID grants ]
[ GID grants ]
[ Query ]
[ Check mapping ]
[ query lead ]
[ ranges and findings ]
```

## Removed or rejected

- Host probing and container restart controls are removed because static text cannot prove live namespace behavior safely.
- A proportional range chart is rejected because inclusive endpoints and exact IDs belong in a table.
- A shared grant textarea is removed because it cannot distinguish `/etc/subuid` from `/etc/subgid`.
- A repeated host-ID metric is removed because the lead already states the mapped ID.

## Acceptance criteria

| ID | Category | Criterion | Evidence |
|---|---|---|---|
| UI-001 | lead | Query result appears before range details | result test |
| UI-002 | deduplication | Each map line becomes one stable range row | table test |
| UI-003 | visual-truth | Mapped and unmapped labels match arithmetic | fixture test |
| UI-004 | responsive | Narrow lines and numbers remain readable | browser test |
| UI-005 | url | Opening the clean canonical route leaves its address unchanged through hydration, input edits, submission, Reset, and example loading. No implicit query or storage persistence is added. | Browser URL and history assertions required before runtime acceptance. |
| UI-006 | grant truth | Grant status names the selected owner and uses only the matching UID or GID grant source | fixture and browser test |
| UI-007 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

Default namespace maps vary by runtime. The checker reports only supplied lines and optional grants; that limit is explicit and does not block the arithmetic validator.
