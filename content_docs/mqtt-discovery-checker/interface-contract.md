Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: Home Assistant MQTT discovery checker
Route: /mqtt-discovery-checker
Mode: pipeline
Review scope: current interface-contract refresh; no browser verification claimed

## User task

Primary user: a Home Assistant MQTT integration builder.

Question: will this topic and payload form a usable discovery message?

Lead answer: the checker returns valid, partial, or invalid with field-level findings.

Next decision: the builder fixes the named path before publishing to a broker.

## Information decisions

| ID | Information | User question | Disposition | Placement | Rationale |
|---|---|---|---|---|---|
| I1 | Validity status | Can I publish this shape? | lead | result | It answers the immediate task |
| I2 | Finding severity and path | What needs fixing? | evidence | result | Paths make JSON errors actionable |
| I3 | Recognized component | Which schema family applies? | supporting | result | Topic context changes checks |
| I4 | Broker connection result | Did Home Assistant receive it? | omit | omitted | No network access is part of v1 |

## Input contract

| ID | Control | Requirement | Affects lead | Default | Placement | Validation | Recovery | Notes |
|---|---|---|---|---|---|---|---|---|
| IN1 | Discovery topic | required text | yes | homeassistant/sensor/demo/config | visible | prefix and config suffix | topic finding | Keep segments visible |
| IN2 | JSON payload | required text | yes | valid sensor example | visible | object JSON | parse finding | Never store payload |
| IN3 | Prefix | optional result-driving text | yes | homeassistant | visible | non-empty segment | use default | Supports custom prefixes |
| IN4 | Check discovery | primary action | yes | enabled | visible | valid inputs required | retain text | Focus validity lead |

## Result contract

| ID | Region | User question | Content | Priority | State behavior |
|---|---|---|---|---|---|
| OUT1 | Validity lead | Is the discovery shape usable? | status, error count, warning count | lead | focus after check |
| OUT2 | Findings | What should I change? | severity, code, path, message | supporting | rows after valid parse |
| OUT3 | JSON preview | What payload did the checker read? | stable two-space JSON | evidence | disclosure after check |

## Visual semantics

| Element | Meaning | Truth test | Treatment |
|---|---|---|---|
| Valid | no structural errors | yes, error count is zero | success lead |
| Invalid | structural error blocks shape | yes, at least one error finding | inline error at the topic, prefix, or payload field |
| Warning | profile-specific uncertainty | yes, finding severity is warning | calm secondary text |

## State contract

| State | Trigger | Lead region | Recovery | Focus | Persistence |
|---|---|---|---|---|---|
| Empty | first visit | short prompt | load example | topic field | none |
| Editing | input changed | stale notice | check button | changed field | React state |
| Invalid | parse or topic error | no result region; error below its field | edit the marked field and check again | first error | inputs retained |
| Partial | only warnings or incomplete device | partial lead | review warnings | lead result | result in memory |
| Valid | no errors | valid lead | copy or edit | lead result | result in memory |

The engine runs locally and synchronously. Loading and service failure are not applicable; do not invent request states. Invalid submission retains input and permits correction followed by the same primary action. Clipboard failure preserves selectable report data and must not announce success. A valid result may have no findings; partial results keep their profile limitation visible. Expanding normalized JSON never changes the checked payload.

## Optional mode and state visibility

- Control mode: disclosure
- Reason: Topic, prefix, and payload remain visible. Only the normalized JSON evidence collapses after checking.
- Shared engine and normalized input mapping: checkMqttDiscovery receives topic, payload, and prefix unchanged by disclosure state. No second calculation path or alternate rules are introduced.
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
| Topic and discovery prefix | `ToolTextField` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextField | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Persistent labels preserve the exact topic segments and show associated errors. Rejected: No broker connection field. |
| JSON payload | `ToolTextArea` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextArea | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Preserve source text and associate parse errors with the payload. Rejected: No HTML injection or generic JSON editor. |
| Actions and copy | `ToolActionRow`, `ToolButton`, `ToolCopyAction` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolActionRow, ToolButton, and ToolCopyAction | Actions are explicit and keyboard accessible. Copy success follows a confirmed write; failure keeps text selectable. Downloads use the current report. Preserve focus, label actions, and wrap at narrow widths. Use secondary shared button tokens. | Check discovery is primary; example, reset, and copy are secondary. Rejected: No publish action. |
| Validity and recovery | `ToolResultLead`, `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolResultLead and ToolStatus | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | Valid or partial profile status leads; invalid source recovers at its field. Rejected: No guarantee of broker delivery. |
| Findings | `ToolDataTable` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolDataTable | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | Severity, JSON path, and finding text remain readable as repeated fields. Rejected: No color-only severity. |
| Normalized JSON | `ToolRawOutput` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolRawOutput | Named evidence follows the answer. Enter or Space toggles disclosures with expanded state and retained focus. Escaped output remains selectable; a bounded inner viewport owns any code overflow. Use shared evidence and focus tokens. | The evidence is selectable escaped text in its own bounded viewport. Rejected: No executable preview. |

## Responsive contract

| View | Layout | Priority | Overflow behavior |
|---|---|---|---|
| Wide | topic, payload, then findings | validity lead | JSON viewport scrolls |
| Narrow | stacked fields and preview | check action follows payload | finding text wraps |
| Very narrow | one column | severity before message | no clipped topic |

## Interface wireframes

```text
DESKTOP
[ Discovery topic ]
[ JSON payload textarea ]
          [ Check discovery ]
       [ Valid | 0 errors | 1 warning ]
       [ finding table ] [ JSON preview ]
```

```text
MOBILE
[ Topic ]
[ Payload ]
[ Check discovery ]
[ validity lead ]
[ findings ]
[ JSON preview ]
```

## Removed or rejected

- Broker credentials and publish controls are removed because the checker must keep payloads offline and private.
- A generic schema editor is rejected because topic and component context are the useful answer.

## Acceptance criteria

| ID | Category | Criterion | Evidence |
|---|---|---|---|
| UI-001 | lead | Validity is the first result after checking | result test |
| UI-002 | deduplication | Each finding path appears once per code | engine test |
| UI-003 | visual-truth | Severity text agrees with error and warning counts | fixture test |
| UI-004 | responsive | Mobile JSON and findings remain readable | browser test |
| UI-005 | url | Opening the clean canonical route leaves its address unchanged through hydration, input edits, submission, Reset, and example loading. No implicit query or storage persistence is added. | Browser URL and history assertions required before runtime acceptance. |
| UI-006 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

Component-specific schemas will evolve with Home Assistant. The v1 profile stays explicit and conservative; expanding it needs a source update rather than a hidden validation claim.
