Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: Restic retention simulator
Route: /restic-retention-simulator
Mode: pipeline
Review scope: current interface-contract refresh; no browser verification claimed

## User task

Primary user: restic operators reviewing a retention policy.

Question: which snapshots will remain after the supplied rules run?

Lead answer: the tool states how many are kept and names the rule that kept each one.

Next decision: the operator can adjust grouping or counts before using a real command.

## Information decisions

| ID | Information | User question | Disposition | Placement | Rationale |
|---|---|---|---|---|---|
| I1 | Snapshot identity and time | Which snapshot is this? | lead | result | The trace needs a stable row anchor |
| I2 | Retained count | How many survive? | supporting | result | It summarizes the lead decision |
| I3 | Rule and bucket reason | Why was it kept? | evidence | result | It turns policy semantics into a trace |
| I4 | Repository connection status | Did the tool inspect restic? | omit | omitted | The tool is intentionally offline |

## Input contract

| ID | Control | Requirement | Affects lead | Default | Placement | Validation | Recovery | Notes |
|---|---|---|---|---|---|---|---|---|
| IN1 | Snapshot JSON | required text | yes | none | visible | object with snapshots | show parse finding | Paste output from restic |
| IN2 | Retention counts | required result-driving fields | yes | zero | visible | integer 0 through 365 | field message | At least one positive rule |
| IN3 | Grouping | optional result-driving select | yes | host | visible | host, paths, or tags | use default | One grouping at a time |
| IN4 | Timezone | optional result-driving text | yes | UTC | visible | IANA name or UTC | warn and use UTC | Date buckets need context |
| IN5 | Preview retention | primary action | yes | enabled | visible | valid form required | keep inputs | Focus result after submit |

## Result contract

| ID | Region | User question | Content | Priority | State behavior |
|---|---|---|---|---|---|
| OUT1 | Lead result | How many snapshots remain? | kept count, total, policy version | lead | focus after valid preview |
| OUT2 | Snapshot trace | Why is each snapshot kept or pruned? | identity, time, state, rule reason | supporting | rows appear only after valid preview |
| OUT3 | Policy note | What assumptions apply? | grouping, timezone, exclusions | evidence | disclosure below rows |

## Visual semantics

| Element | Meaning | Truth test | Treatment |
|---|---|---|---|
| Count lead | retained versus supplied snapshots | yes, count is derived directly from rows | prominent result with neutral success tone |
| Kept state | a rule selected this snapshot | yes, row has at least one rule reason | success text and label |
| Pruned state | no rule selected this snapshot | yes, row has no keeping rule | muted text and text label |

## State contract

| State | Trigger | Lead region | Recovery | Focus | Persistence |
|---|---|---|---|---|---|
| Empty | first visit | short prompt | paste sample or input | snapshot field | none |
| Editing | input changed | stale notice | preview button | changed field | local React state |
| Invalid | parse or policy error | no result region; error below its field | edit the marked field and preview again | first error | inputs retained |
| Valid | resolution complete | kept count | adjust and preview | lead result | result in memory |
| Copied | copy succeeds | copy status | continue editing | copy button | temporary |

The engine runs locally and synchronously. Loading and service failure are not applicable; do not invent request states. Invalid submission retains input and permits correction followed by the same primary action. Clipboard failure preserves selectable report data and must not announce success. Empty snapshots are invalid; a valid trace may contain pruned rows and timezone fallback warnings. Expand Assumptions without changing the active policy.

## Optional mode and state visibility

- Control mode: disclosure
- Reason: Snapshot JSON, all retention counts, grouping, and timezone remain visible. Assumptions is an evidence disclosure only.
- Shared engine and normalized input mapping: simulateResticRetention receives snapshots, policy, groupBy, and timezone. No second calculation path or alternate rules are introduced.
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
| Snapshot JSON | `ToolTextArea` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextArea | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Preserve pasted JSON and associate parsing errors with the editor. Rejected: No repository access or custom syntax editor. |
| Retention counts | `ToolNumberField` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolNumberField | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Five visible bounded integer fields preserve policy defaults and field errors. Rejected: No hidden active retention rule. |
| Grouping and timezone | `ToolChoiceGroup`, `ToolTextField` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolChoiceGroup and ToolTextField | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Show host, paths, tags, and the active timezone before preview. Rejected: No automatic repository timezone discovery. |
| Actions and copy | `ToolActionRow`, `ToolButton`, `ToolCopyAction` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolActionRow, ToolButton, and ToolCopyAction | Actions are explicit and keyboard accessible. Copy success follows a confirmed write; failure keeps text selectable. Downloads use the current report. Preserve focus, label actions, and wrap at narrow widths. Use secondary shared button tokens. | Preview is the only primary action; example, reset, and copy retain labels. Rejected: No prune or execution action. |
| Lead and recovery | `ToolResultLead`, `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolResultLead and ToolStatus | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | Retained count leads; field errors recover before a result exists. Rejected: No repository safety badge. |
| Snapshot decisions | `ToolDataTable` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolDataTable | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | One row per snapshot exposes identity, time, group, state, and keeping reasons. Rejected: No decorative chart. |
| Assumptions | `ToolDisclosure` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolDisclosure | Named evidence follows the answer. Enter or Space toggles disclosures with expanded state and retained focus. Escaped output remains selectable; a bounded inner viewport owns any code overflow. Use shared evidence and focus tokens. | Keyboard-operated evidence stays below the trace. Rejected: No duplicate result introduction. |

## Responsive contract

| View | Layout | Priority | Overflow behavior |
|---|---|---|---|
| Wide | two-column form then full result | lead count and trace | full-width table |
| Narrow | one column in task order | action stays after inputs | table rows stack with visible labels |
| Very narrow | stacked labels and controls | result lead first | no clipped code or buttons |

## Interface wireframes

```text
DESKTOP
┌ Snapshot JSON ┐ ┌ Policy and grouping ┐
└───────────────┘ └────────────────────┘
              [ Preview retention ]
        [ Kept 6 of 8 snapshots ]
        [ trace table with reasons ]
```

```text
MOBILE
[ Snapshot JSON ]
[ Policy ]
[ Grouping ]
[ Preview retention ]
[ Kept 6 of 8 ]
[ trace rows ]
```

## Removed or rejected

- Repository credentials and live prune execution are removed because a preview must not mutate or expose a repository.
- A chart is rejected because bucket rows and reasons carry the exact truth more clearly.

## Acceptance criteria

| ID | Category | Criterion | Evidence |
|---|---|---|---|
| UI-001 | lead | Kept count is the first result users can read | result lead test |
| UI-002 | deduplication | One snapshot row has one stable identity | table test |
| UI-003 | visual-truth | State and rule reason agree with engine output | fixture test |
| UI-004 | responsive | Mobile order keeps action and lead visible | browser test |
| UI-005 | url | Opening the clean canonical route leaves its address unchanged through hydration, input edits, submission, Reset, and example loading. No implicit query or storage persistence is added. | Browser URL and history assertions required before runtime acceptance. |
| UI-006 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

The launch contract does not model every restic flag or repository timezone discovery. A later version can add keep-within and tag selectors after a source review; no blocker prevents the v1 offline simulator.
