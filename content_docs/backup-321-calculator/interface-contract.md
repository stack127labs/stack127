# Interface contract: 3-2-1 backup calculator

Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: 3-2-1 backup calculator
Route: /backup-321-calculator
Mode: pipeline
Review scope: current interface-contract refresh; no browser verification claimed
Depends on: brief.md, implementation-report.md
Input fingerprint: `brief.md sha256:a7b09add3ef2e573f30b86010e92f81b83788fe8b0d762e86b5bf878c72119a9`
Input fingerprint: `implementation-report.md sha256:b646b8db3031b022255c8b6288cb2024bff1b65c98d9889945ca9bda1b2f95fa`

## User task

- Primary user: A homelab owner sizing one local backup target and one off-site target for the same protected data set.
- Question: How much capacity does each target need under this retention and backup model, and do optional recovery goals fit?
- Lead answer: The estimated capacity required for one backup target.
- Next decision: Allocate or buy two targets of that size, or revise the data, growth, retention, headroom, or recovery assumptions.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Protected data | How much data is being protected? | User input | input | It is the baseline for the projected full copy. | Show one quantity input in the first form group. |
| Source unit | Which unit describes that data? | User input | input | It prevents decimal TB and binary TiB from being mixed at entry. | Keep the unit selector joined to protected data. |
| Annual growth | How fast might the source grow? | User input | input | It changes the source value the target must fit at the planning horizon. | Show once beside the horizon. |
| Planning horizon | How far ahead should the target fit? | User input | input | It determines the projected source size. | Do not show a second year-by-year growth result. |
| Backup model | How is each retained point represented? | User input | input | Full-only and full-plus-incremental plans have different capacity shapes. | Name the selected model once in the result detail. |
| Retained points | How many restore points remain? | User input | input | It controls the number of fulls or additional incremental allowances. | Show one count, not a calendar timeline. |
| Changed data per additional point | How much changes in each additional retained point? | User input | input | It controls the incremental estimate without pretending to know vendor behavior. | Show it in the form and formula receipt, not the lead sentence. |
| Headroom | How much extra capacity should each target have? | User input | input | It changes the target capacity and must remain auditable. | Show it once in the storage breakdown. |
| Recovery check toggle | Should recovery goals be checked? | User input | supporting | It keeps optional RPO and RTO work out of the first task until requested. | Show the toggle once before conditional recovery fields. |
| Recovery assumptions | Will cadence and full restore fit the selected goals? | User input | supporting | These inputs affect recovery interpretation, not target capacity. | Reveal them only when the toggle is enabled. |
| Display unit | How should capacity be displayed? | User preference | input | It changes only presentation. | Keep one unit choice for every capacity value. |
| Per-target capacity | What capacity does one target need? | Engine | lead | This is the primary buying or allocation answer. | It appears once as the dominant result. |
| Combined target capacity | How much capacity is needed across both repositories? | Engine | supporting | It prevents planning only one repository. | Do not repeat it in the breakdown. |
| Capacity anatomy | How does the target estimate divide between repository data and headroom? | Engine | supporting | Repository data and headroom explain the lead value. | The allocation bar and its legend own these values. |
| Projected source and model | What source value and retention model produced the estimate? | Engine | supporting | These facts make the result interpretable without competing with capacity. | Show each once in labeled rows. |
| Recovery status | Does the chosen cadence and restore path meet the goals? | Engine | supporting | It turns optional RPO and RTO inputs into the next action. | Use separate labeled statuses, never a score. |
| 3-2-1 copy relationship | Which copy is the source and which are the targets? | Product rule and user assumptions | supporting | It resolves copy-count ambiguity without claiming physical verification. | Show one sentence and one labeled relationship. |
| Formula receipt | Which version, assumptions, sources, and uncertainty produced this result? | Engine metadata and primary sources | evidence | Advanced verification belongs after the decision. | Keep all receipt details in one disclosure. |
| Copy and share actions | Can the user preserve or move the plan? | Shared state codec and clipboard | evidence | Repeat use is useful only after a valid result. | Show actions once below the result. |

Exactly one item is the lead: per-target capacity. Every other visible result region answers a different question.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Protected data and source unit | required, defaulted | yes | 2 TB product default | visible | ToolQuantityInput | Sets the projected full copy without losing the raw decimal string. | One full-width quantity row. |
| 2 | Annual growth | required, defaulted | yes | 20% product default | visible | ToolTextField with decimal input mode | Makes the compounding assumption explicit. | Full-width field. |
| 3 | Plan horizon | required, defaulted | yes | 3 years product default | visible | ToolTextField with numeric input mode | Preserves the integer string so the engine can report exact grammar and bounds errors. | Full-width field. |
| 4 | Backup model | required, defaulted | yes | Full plus incremental product default | visible | ToolChoiceGroup | Shows the material storage-model choice directly. | Options wrap in source order. |
| 5 | Retained points | required, defaulted | yes | 30 product default | visible | ToolTextField with numeric input mode | Preserves the integer string so the engine can report exact grammar and bounds errors. | Full-width field. |
| 6 | Changed data per additional point | required, defaulted | yes | 5% product default | visible | ToolTextField with decimal input mode | Names the average incremental allowance instead of hiding it. | Full-width field. |
| 7 | Headroom | required, defaulted | yes | 20% product default | visible | ToolTextField with decimal input mode | Makes extra target capacity an explicit user choice. | Full-width field. |
| 8 | Check recovery goals | optional, default off | no | Product default false | conditional | ToolCheckbox | Reveals a separate recovery decision without burdening the core capacity task. | One labelled row before conditional fields. |
| 9 | Backup interval, target RPO, target RTO, restore speeds, and efficiency | conditional, required when enabled | no | Product defaults in the formula contract | conditional | Numeric-mode ToolTextField fields | Preserves invalid recovery strings for field-level validation instead of clamping them before submission. | Stack in the same order as desktop. |
| 10 | Result unit | defaulted preference | no | TB product default | visible | ToolChoiceGroup | Keeps exact output units consistent and visible. | Options wrap. |
| 11 | Calculate backup plan | primary action | not applicable | No default | visible | ToolButton with `type="submit"` | Creates one intentional result state. | Full-width primary button. |
| 12 | Reset | secondary action | no | No default | visible | ToolButton | Returns to defaults and removes stale state. | Full-width secondary button. |
| 13 | Copy summary | secondary action | no | No default | result | ToolCopyAction | Gives the user a short, selectable handoff. | Full-width action below results. |
| 14 | Share plan | secondary action | no | No default | result | ToolButton in ToolActionRow | Creates a versioned URL only after explicit intent. | Full-width action below result. |

All inputs that affect the lead answer stay visible in the initial workbench. Recovery fields are conditional because the toggle is off and they do not affect capacity until enabled. The result unit is visible because it changes how the answer is read, but it never changes source bytes or formula values.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Per-target answer | What capacity does one target need? | `targetBytes` and `displayUnit` | ToolPrimaryResult with one sentence and one dominant value | The only large capacity value. Do not repeat it as a second metric. |
| 2 | Combined target summary | How much capacity is needed across both repositories? | `totalTargetBytes`, source copy count, target copy count | ToolKeyValueList with labeled rows | Does not repeat the per-target value. |
| 3 | Capacity anatomy | How does the target estimate divide between repository data and headroom? | `repositoryBytes`, `headroomBytes`, `targetBytes` | ToolAllocationBar with exact legend values and a short accessible description | Geometry is the target total. The legend owns the exact breakdown; no second breakdown table. |
| 4 | Model and projected source | What source value and retention model produced the estimate? | `projectedSourceBytes`, `changedPerPointBytes`, `retainedPoints`, `backupModel` | ToolKeyValueList with labeled values | No year-by-year chart or hidden model name. |
| 5 | Recovery check | Do backup cadence and estimated full restore fit the selected objectives? | RPO status, local restore seconds, off-site restore seconds, RTO statuses | ToolKeyValueList with separate exact durations and pass or miss text | Only present when enabled. No risk score or progress bar. |
| 6 | 3-2-1 relationship | What remains to be verified outside the calculator? | Source copy, local target, off-site target, placement and isolation limitation | One sentence plus labeled rows | Never present as a compliance badge or proof of isolation. |
| 7 | Formula receipt | Which conventions and sources produced this estimate? | Versions, normalized inputs, derivation, assumptions, sources, uncertainty | ToolDisclosure with readable evidence rows and links | One disclosure owns all method detail. |
| 8 | Preservation actions | How can the user carry this plan elsewhere? | Copy summary and encoded input state | ToolActionRow with copy status | Only available after a valid result. |

The lead result is the per-target value. The combined total, anatomy, model, recovery check, copy relationship, receipt, and actions each answer a separate question.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Per-target capacity | One target's required capacity | not applicable | Use a plain dominant answer, not a dashboard or chart. |
| Repository plus headroom allocation bar | Two non-negative parts that sum to one target's capacity | yes, the bar uses repository bytes plus headroom bytes against target bytes | Use ToolAllocationBar with exact legend values and a text fallback. |
| RPO or RTO progress bar | Actual duration compared with an allowed duration | no, two objectives and modeled throughput do not need a normalized progress shape | Omit. Use separate labeled status rows. |
| 3-2-1 diagram | Source, local target, and off-site target | not applicable, the relationship is simple and does not encode a measured value | Omit geometry. Use one accessible labeled sentence. |
| Retention timeline | Calendar spacing between restore points | no, version 1 has a point count rather than a calendar schedule | Omit. Show the count and model as text. |
| Year-by-year growth chart | Annual source values through the planning horizon | yes in principle, but it would create a second growth-planner surface without changing the target answer | Omit from version 1. Show the projected horizon value. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean | Defaults visible; no submit yet | Absent | Absent | No status panel | Normal form order and no focus jump. |
| Invalid submission | Preserve all entered values; Calculate remains available | Absent | Absent | Field errors and one concise recovery status | Focus the first invalid field and announce the summary. |
| Valid result | Inputs remain visible; Reset, copy, and share are available | Per-target capacity visible first | Combined total, anatomy, model, and copy relationship visible | Recovery rows appear only when enabled | Focus the result heading and announce the lead answer. |
| Recovery enabled | Toggle selected; conditional fields visible before Calculate | Absent until a new valid calculation | No stale recovery result | Invalid conditional values block the submission | Keep focus on the toggle; announce that recovery fields are available. |
| Changed after result | Any result-driving input changes | Cleared | Cleared | One result-cleared status may appear | Keep focus on the edited control. |
| Display unit changed after result | Unit preference changes | Same source and formula values, reformatted | Same result with new unit labels | No error | No focus jump and no implicit URL write. |
| Valid shared state | Explicit state query decodes and recalculates | Visible | Visible | One shared-plan-loaded status | Announce restoration without interrupting the result position. |
| Malformed shared state | Invalid, unsafe, oversized, future, or unsupported query | Absent | Absent | Defaults remain and one restore error explains recovery | Announce failure; do not focus an unrelated result. |
| Clipboard failure | Copy or share attempt fails | Remains | Remains | Selectable summary or URL stays visible with one failure status | Announce where the user can select text. |
| Recovery disabled partial | Capacity calculated without optional RPO or RTO inputs | Visible | Capacity support visible; recovery is labeled not checked | Do not show guessed durations or statuses | No extra announcement beyond the lead result. |
| Loading or upstream failure | Not applicable because the adapter is synchronous and local | Absent until submit | Absent | No spinner, request error, or provider fallback | No loading announcement. |
| Expanded formula receipt | User opens the receipt | Remains | Remains | Version, source, and uncertainty rows appear | Disclosure trigger retains focus. |

## Optional mode and state visibility

- Control mode: disclosure
- Reason: Capacity inputs stay visible. Recovery goals are opt-in, and enabling them reveals all recovery assumptions beside the checkbox. Only the formula receipt collapses.
- Shared engine and normalized input mapping: The existing backup adapter receives the same capacity and recovery fields in every state. No second calculation path or alternate rules are introduced.
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
| Calculate and reset | `ToolButton` and `ToolActionRow` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolButton in ToolActionRow | One primary submit, secondary Reset, keyboard activation, visible focus, and labeled hydration-disabled state. Stack actions on narrow screens with shared button tokens. | The explicit calculation is the commit point. Reject automatic calculation or a second primary action. |
| Protected data with a unit | `ToolQuantityInput` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolQuantityInput | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Joins the raw decimal value and unit while preserving exact text for validation. Rejected: Separate unrelated input and select controls. |
| Exact percentage and decimal-Mbps strings | `ToolTextField` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextField | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Preserves the documented decimal grammar instead of coercing values through floating-point state. Rejected: Native number input, which may normalize unsupported grammar. |
| Bounded integer hours and points | `ToolTextField` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextField with numeric input mode | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Preserves exact strings so engine bounds and grammar errors remain visible instead of being clamped by a native number state. Rejected: ToolNumberField, which can replace an invalid value on blur before the engine sees it. |
| Backup model and result unit choices | `ToolChoiceGroup` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolChoiceGroup | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | Short, material choices should remain visible and keyboard navigable. Rejected: A hidden select that makes the storage model harder to see. |
| Recovery opt-in | `ToolCheckbox` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolCheckbox | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | Represents a boolean submitted with the form and keeps the off state explicit. Rejected: Immediate switch behavior for a setting that is applied on Calculate. |
| Lead answer | `ToolPrimaryResult` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolPrimaryResult | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | Gives one result the strongest hierarchy without creating equal metric cards. Rejected: ToolMetricGroup with several equally weighted values. |
| Repository and headroom relationship | `ToolAllocationBar` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolAllocationBar | Use exact parts and denominator, preserve zero-value legend entries, and provide labels and exact values without relying on color. Wrap the legend within the workbench; shared data tokens encode the stated categories. | Its geometry has a truthful denominator and its legend keeps exact values available. Rejected: Progress bar, which would imply a goal or status. |
| Supporting facts and statuses | `ToolKeyValueList` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolKeyValueList | Use semantic labels and exact values with explicit unknowns. Supporting facts follow the lead, retain source order, and stack at narrow widths. Use shared text and metadata tokens. | Fits distinct labeled values and wraps cleanly on narrow screens. Rejected: Paragraphs that bury or repeat exact values. |
| Formula and source evidence | `ToolDisclosure` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolDisclosure | Named evidence follows the answer. Enter or Space toggles disclosures with expanded state and retained focus. Escaped output remains selectable; a bounded inner viewport owns any code overflow. Use shared evidence and focus tokens. | Keeps advanced verification available without competing with the answer. Rejected: An always-open methodology panel. |
| Copy and share actions | `ToolCopyAction`, `ToolButton`, `ToolActionRow` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolCopyAction and ToolButton in ToolActionRow | Actions are explicit and keyboard accessible. Copy success follows a confirmed write; failure keeps text selectable. Downloads use the current report. Preserve focus, label actions, and wrap at narrow widths. Use secondary shared button tokens. | Reuses tested clipboard, feedback, and action semantics. Rejected: Automatic clipboard or URL writes during editing. |
| Error and recovery feedback | `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolStatus plus field error props | Expose textual status and one concise live announcement. Keep recovery beside its input; no duplicate alert. Long messages wrap and status uses semantic text color only. | Provides one polite live region and field-associated recovery. Rejected: Repeating the same error in several result regions. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop, 1440 px | One full-width workbench band. Form order is planning, policy, optional recovery, display, action. Result order is lead, combined total, anatomy, model, recovery, copy relationship, actions, receipt. | `1,000 TB` source and a target around `1,536,000,000.00 TB` under maximum scalar inputs | None. The inner workbench uses `min-width: 0`. |
| 760 px | Form fields become one column; model and unit choices wrap; result rows stay lead first and the allocation legend may wrap below the bar. | `1,536,000,000.00 TiB` and `100,000 Mbps` | No page overflow. Values wrap inside their labeled row. |
| 375 px | Every field and action is one column. The allocation visual stays above its legend. Key/value rows reflow to label above value. | `Off-site restore exceeds target, 7,407 days versus 0.10 hours` | No horizontal scroll container is needed for the result. |
| 320 px | Labels wrap normally, values remain selectable and fully visible, radio choices wrap in source order, and the primary action fills the available width. | `Full plus incremental` and the longest formatted target value | Field and result owners wrap text; the route never clips or owns page-level overflow. |
| Narrow invalid state | Errors remain below their controls, the action stays in the same reading order, and later fields remain reachable. | A full bound message such as `Use 0.01 to 100,000 Mbps.` | The field owner wraps error text without shifting controls offscreen. |
| Long formula receipt | Source links and derivation expressions wrap at word boundaries inside the disclosure. | A long primary-source URL | The disclosure content wraps; it must not expand the page. |

## Interface wireframes

### Desktop result

```text
[storage tools sidebar]

3-2-1 backup calculator
Size a local and off-site backup target from your data and retention policy.

===============================================================================
  Protected data and planning
  Protected data [ 2                 ] [TB v]   Annual growth [20] %
  Plan horizon  [ 3                 ] years

  Backup policy
  Backup model (o) Full-only  (.) Full plus incremental
  Retained points [30]       Changed data per additional point [5] %
  Headroom [20] %

  [ ] Check recovery goals
  Show capacities in [TB v]
  [Calculate backup plan]                                      [Reset]
-------------------------------------------------------------------------------
  Each backup target needs about 10.16 TB.
  [dominant per-target result: 10.16 TB]

  Both targets                  20.32 TB
  Planned copies                Source, local target, off-site target

  Capacity anatomy for one target
  [repository data ==============================][headroom =====]
  Repository before headroom    8.47 TB
  Headroom                      1.69 TB

  Projected source at horizon   3.46 TB
  Model                         Full plus incremental, 30 retained points
  Changed data per additional point  0.17 TB

  3-2-1 relationship             Source -> local target + off-site target
  Placement and isolation        Not verified by this calculator
  Recovery goals                 Not checked

  [Copy summary] [Share plan]
  Formula, assumptions, sources, and limits [details]
===============================================================================
```

When recovery is enabled, its fields appear before the display-unit choice and action. The result adds one recovery region with backup interval, RPO status, local and off-site estimated full-restore durations, and RTO statuses. It does not add a second capacity summary.

### Narrow mobile result

```text
3-2-1 backup calculator
Size a local and off-site backup target from your data and retention policy.
===============================================================================
  Protected data and planning
  Protected data [2] [TB v]
  Annual growth [20] %
  Plan horizon [3] years

  Backup policy
  Backup model
  (o) Full-only
  (.) Full plus incremental
  Retained points [30]
  Changed per additional point [5] %
  Headroom [20] %
  [ ] Check recovery goals
  Show capacities in [TB v]
  [Calculate backup plan]
  [Reset]
-------------------------------------------------------------------------------
  Each backup target needs about 10.16 TB.
  Per-target capacity  10.16 TB
  Both targets         20.32 TB
  Planned copies       Source, local target, off-site target

  Capacity anatomy
  Repository           8.47 TB
  Headroom             1.69 TB

  Projected source     3.46 TB
  Model                Full plus incremental, 30 points
  Changed per additional point  0.17 TB

  3-2-1 relationship   Source -> local target + off-site target
  Isolation            Not verified
  Recovery             Not checked

  [Copy summary]
  [Share plan]
  Formula and sources [details]
===============================================================================
```

The mobile result uses labeled rows rather than a multi-column table. The allocation bar can shrink to the available width, but its legend remains below it and preserves both exact values. No result depends on horizontal scrolling.

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
Initial:
Defaults visible. No result, no query state, no status panel.

Invalid:
Changed data per additional point [bad input]
Error: Use 0% to 100%.
Check the marked inputs. No result is shown.

Recovery enabled:
[x] Check recovery goals
Backup interval, target RPO, target RTO, restore speeds, and efficiency appear.

Shared state:
Shared plan loaded.
Inputs restored and result recalculated.

Malformed state:
Shared plan could not load. Defaults restored.
No result is shown.

Clipboard failure:
Summary copy failed. The result remains.
The summary or share URL stays selectable.

Loading and upstream failure:
Not applicable. The calculation is local and synchronous.

Partial:
Capacity result is visible. Recovery: Not checked.

Expanded:
Formula, assumptions, sources, and uncertainty appear below the actions.
```

## Removed or rejected

- Do not expose daily, weekly, monthly, and yearly retention fields. Version 1 uses one retained-point count; calendar schedules and GFS behavior are deferred.
- Do not expose local or off-site copy-count fields. The product fixes one local and one off-site target so the result stays comparable and the source remains copy 1.
- Do not expose local-device, off-site-mode, or isolation checkboxes. The calculator cannot verify those facts; show the limitation as a result sentence instead of inviting a false compliance state.
- Do not show a four-card metric dashboard. It repeats the lead and makes the exact model harder to audit.
- Do not show a retention timeline or year-by-year growth chart. Neither changes the first decision under the selected formula.
- Do not use a progress bar, risk percentage, compliance badge, safety score, or green pass treatment for 3-2-1 placement.
- Do not add provider prices, cloud offers, cost fields, compression, deduplication, synthetic fulls, or product-specific repository controls.
- Do not put an explanatory article, formula essay, or FAQ inside the workbench. Supporting content belongs below the tool through the content workflow.
- Do not create a wide result table that requires horizontal scrolling on mobile. The allocation legend and key/value rows must reflow.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | After a valid calculation, the per-target capacity is the first and strongest result and appears once as the dominant formatted value. | Playwright result-order and visible-text assertions. |
| UI-002 | deduplication | Combined capacity, anatomy, model, recovery, copy relationship, receipt, and actions each expose distinct facts without repeating the formatted per-target value. | DOM region and value-count assertions. |
| UI-003 | visual-truth | The repository-plus-headroom bar uses target capacity as its denominator, includes exact legend values, and has a text-accessible equivalent. RPO and RTO use labeled statuses. | Rendered semantics and visual inspection. |
| UI-004 | responsive | At 1440, 760, 375, and 320 pixels, controls and result rows remain readable, long values wrap, and document and body scroll widths do not exceed the viewport. | Browser bounding-box and scroll-width checks. |
| UI-005 | url | A clean canonical load leaves the URL unchanged through hydration; only Share creates `?state=`, editing or Reset removes it, and valid restored state preserves it. | Browser history and URL assertions. |
| UI-006 | inputs | Every lead-driving input is visible, labeled, bounded, and retains its value after invalid submission; recovery fields appear only when the toggle is enabled. | Browser interaction and accessibility assertions. |
| UI-007 | states | Initial, invalid, valid, changed, recovery-disabled, recovery-enabled, restored, malformed, clipboard-failure, and expanded states preserve the lead-first order and recovery path. | Browser state matrix. |
| UI-008 | accessibility | The first invalid field and result heading receive focus as contracted, errors are associated with controls, the recovery group has checkbox semantics, and status announcements are polite and concise. | Playwright focus and live-region assertions plus manual keyboard check. |
| UI-009 | narrow-actions | Primary, reset, copy, and share actions keep stable order and at least 44px targets at narrow widths. | Browser measurements and keyboard review. |
| UI-010 | privacy | No input or derived capacity value is written to local or session storage, sent in a request, or included in analytics payloads; the share state contains normalized inputs only. | Request inspection, storage inspection, and static review. |
| UI-011 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

- None. The interface follows the approved single-count retention model, optional recovery scope, exact allocation visual, state behavior, responsive order, and publication boundary.
