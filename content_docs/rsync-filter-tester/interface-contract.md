Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: Rsync filter tester
Route: /rsync-filter-tester
Mode: pipeline
Review scope: current interface-contract refresh; no browser verification claimed

## User task

Primary user: an operator debugging ordered rsync filters.

Question: which supplied paths are included, excluded, or never visited?

Lead answer: the tool shows counts and the first matching rule for each path.

Next decision: the operator can reorder a rule or add a parent include before a dry run.

## Information decisions

| ID | Information | User question | Disposition | Placement | Rationale |
|---|---|---|---|---|---|
| I1 | Path state | Will this path transfer? | lead | result | It is the main debugging answer |
| I2 | Winning rule | Which line decided it? | evidence | result | First-match semantics need proof |
| I3 | Parent traversal | Why is a child unvisited? | supporting | result | It separates traversal from exclusion |
| I4 | Remote host details | What server will rsync use? | omit | omitted | The checker is offline |

## Input contract

| ID | Control | Requirement | Affects lead | Default | Placement | Validation | Recovery | Notes |
|---|---|---|---|---|---|---|---|---|
| IN1 | Filter rules | required text | yes | none | visible | +, -, or ! lines | show line error | Preserve order |
| IN2 | Representative paths | required text | yes | none | visible | relative unique paths | show path error | Slash marks directories |
| IN3 | Unmatched default | optional result-driving choice | yes | include | visible | include or exclude | use include | Explicit for clarity |
| IN4 | Test filters | primary action | yes | enabled | visible | valid inputs required | retain text | Focus lead result |

## Result contract

| ID | Region | User question | Content | Priority | State behavior |
|---|---|---|---|---|---|
| OUT1 | Lead counts | How many paths reach each state? | included, excluded, unvisited counts | lead | focus after valid test |
| OUT2 | Path trace | Which rule wins for this path? | path, state, line, pattern, note | supporting | rows after valid test |
| OUT3 | Rule list | What order did the checker use? | numbered normalized rules | evidence | disclosure when useful |

## Visual semantics

| Element | Meaning | Truth test | Treatment |
|---|---|---|---|
| Included | path is sent by model | yes, final state comes from first match or default | success text and icon |
| Excluded | path is filtered | yes, winning rule has minus prefix | warning text and rule line |
| Unvisited | parent exclusion stops traversal | yes, ancestor is excluded | neutral text with parent note |

## State contract

| State | Trigger | Lead region | Recovery | Focus | Persistence |
|---|---|---|---|---|---|
| Empty | first visit | short prompt | paste sample | rules field | none |
| Editing | text changed | stale notice | test button | changed field | React state |
| Invalid | missing or malformed rule or path | no result region; error below its field | edit the marked field and test again | first error | inputs retained |
| Valid | path resolution complete | counts | edit and test | lead result | in memory |
| Copied | report copied | copy status | continue | copy button | temporary |

The engine runs locally and synchronously. Loading and service failure are not applicable; do not invent request states. Invalid submission retains input and permits correction followed by the same primary action. Clipboard failure preserves selectable report data and must not announce success. Included, excluded, and unvisited are distinct completed path states. No match uses the visible unmatched default. No disclosure or loading spinner is needed.

## Optional mode and state visibility

- Control mode: single
- Reason: Ordered rules, representative paths, and the unmatched default are one debugging task. None can disappear behind an advanced switch.
- Shared engine and normalized input mapping: testRsyncFilters receives rules, paths, and unmatched in one input object. No second calculation path or alternate rules are introduced.
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
| Rules and representative paths | `ToolTextArea` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextArea | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Keep separate labels, line order, directory slashes, and field-associated errors. Rejected: No syntax rewriting or filesystem access. |
| Unmatched default | `ToolChoiceGroup` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolChoiceGroup | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | Show include and exclude as a visible radio choice. Rejected: No hidden default. |
| Actions and copy | `ToolActionRow`, `ToolButton`, `ToolCopyAction` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolActionRow, ToolButton, and ToolCopyAction | Actions are explicit and keyboard accessible. Copy success follows a confirmed write; failure keeps text selectable. Downloads use the current report. Preserve focus, label actions, and wrap at narrow widths. Use secondary shared button tokens. | Test filters is the only primary action; example, reset, and copy remain secondary. Rejected: No shell runner. |
| Counts and recovery | `ToolResultLead`, `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolResultLead and ToolStatus | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | One sentence gives included, excluded, and unvisited counts; invalid input stays at its field. Rejected: No equal metric cards. |
| Path trace | `ToolDataTable` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolDataTable | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | Path, state, winning line, and excluded-parent note share a row. Rejected: No color-only outcome or pie chart. |

## Responsive contract

| View | Layout | Priority | Overflow behavior |
|---|---|---|---|
| Wide | two textareas then trace | counts and row explanation | full-width table |
| Narrow | stacked textareas | test action follows inputs | long patterns wrap |
| Very narrow | one column | state label before pattern | no horizontal page overflow |

## Interface wireframes

```text
DESKTOP
┌ Rules ┐ ┌ Representative paths ┐
└───────┘ └──────────────────────┘
             [ Test filters ]
      [ Included 4 | Excluded 2 | Unvisited 1 ]
      [ path | state | winning line ]
```

```text
MOBILE
[ Rules ]
[ Paths ]
[ Test filters ]
[ state counts ]
[ trace rows ]
```

## Removed or rejected

- A shell command runner is removed because the page must not access a remote host or execute user supplied commands.
- A pie chart is rejected because a path table is the exact visual truth.

## Acceptance criteria

| ID | Category | Criterion | Evidence |
|---|---|---|---|
| UI-001 | lead | Counts appear before the detailed trace | result test |
| UI-002 | deduplication | Each supplied path appears once | table test |
| UI-003 | visual-truth | Unvisited rows name an excluded ancestor | traversal fixture |
| UI-004 | responsive | Narrow layout keeps both textareas usable | browser test |
| UI-005 | url | Opening the clean canonical route leaves its address unchanged through hydration, input edits, submission, Reset, and example loading. No implicit query or storage persistence is added. | Browser URL and history assertions required before runtime acceptance. |
| UI-006 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

The model intentionally covers a documented glob subset. Version-specific daemon filters and shell expansion can be added after compatibility research; they do not block the first checker.
