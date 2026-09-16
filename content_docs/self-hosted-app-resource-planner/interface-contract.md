# Interface contract: self-hosted app resource planner

Status: ready
Tool: Self-hosted app resource planner
Route: `/self-hosted-app-resource-planner`
Mode: pipeline
Depends on: `brief.md`, `implementation-report.md`
Input fingerprint: `brief.md sha256:891670c28e434711521196a48d7fe72ac355af8193e1fa7f64cd9d5d345339fc`
Input fingerprint: `implementation-report.md sha256:42cf89821fa32e407542fc947b0b1db74527b62ef489423a0c59537efdd5523c`

## User task

- Primary user: A self-hosting builder comparing a chosen app mix with an existing or planned host.
- Question: Will the selected apps fit within this host's RAM and app-storage budget, based on the evidence Stack127 has for each app?
- Lead answer: The known resource envelope and its budget state, with an explicit unknown state when any selected app lacks a range.
- Next decision: Keep the host, add headroom, remove or verify an app, or investigate the app's own requirements.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| App rows | Which apps and quantities are in the plan? | User input and published catalogue | input | The plan cannot exist without the workload mix. | Do not repeat the entire row in the result lead. |
| Custom row bounds | What do I know about an unlisted app? | User input | input | It keeps partial coverage useful without inventing a value. | Source status must say user supplied, not reviewed. |
| Host RAM budget | How much RAM can the apps use? | User input | input | It defines the comparison denominator. | Show it once in the budget controls and once only in the result comparison. |
| Host app-storage budget | How much app storage can the host provide? | User input | input | It answers the second resource question. | Do not repeat it in every row. |
| Headroom reserve | How much budget stays unused? | User input with visible 20% default | input | It changes the available budget and must remain visible. | Do not hide it in a formula paragraph. |
| Budget state | Is the known envelope within, tight, or over the available budget? | Formula engine | lead | It is the decision the user came for. | One lead sentence; bars and table support it. |
| RAM and storage envelope | What are the low and high known totals? | Formula engine | supporting | It gives the exact relationship behind the lead. | Do not repeat both ranges in multiple metric blocks. |
| Binding known resource | Which complete dimension is closest to its budget? | Formula engine | supporting | It tells the user what to investigate first. | Use one label, not a second verdict paragraph. |
| Allocation bars | How much of the reserved budget does each dimension consume? | Formula engine | supporting | A two-part bar is truthful when its denominator is available budget. | Exact values stay in the legend; no chart duplicates. |
| Per-app contribution table | Which row creates the total? | Formula engine and catalogue | evidence | Repeated app facts need a table for comparison. | Do not make the table a second lead. |
| Unknown list | Which requirement prevents a complete fit verdict? | Formula engine | supporting | Unknown is a meaningful result, not zero. | Show names once in an unknowns region. |
| Evidence metadata | How strong and fresh is each curated range? | Catalogue provenance | evidence | Source, confidence, basis, and check date make the estimate auditable. | Keep metadata quiet and do not restate it in the lead. |
| Runtime verification note | What should I do next? | Supporting content and Docker docs | supporting | It prevents the planning result from reading as a runtime guarantee. | One short handoff; no Docker inspection control. |
| Per-app CPU total | Can the tool sum CPU? | Not available in current reviewed data | omit | A visible number would be fabricated precision. | Mention only in supporting limitations if needed. |
| Provider or hardware recommendation | What should I buy? | Competitor pattern, not Stack127 evidence | omit | It changes the tool into a commercial recommendation and does not answer the neutral budget question. | No vendor card or affiliate result. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | App chooser | Required before a valid plan | Yes | No default | Visible, workbench first | `ToolComboBox` with a custom option | The app mix is the primary planning input. | Full width, then rows stack. |
| 2 | App quantity | Required for each row, default 1 | Yes | Product default | Visible, inside each app row | `ToolNumberField` | Quantity changes both range totals. | Full width below the app name. |
| 3 | Custom app name | Required only for a custom row | Yes | User supplied | Conditional, inside the custom row | `ToolTextField` | The unknown list needs a stable name. | Full width above custom bounds. |
| 4 | Custom RAM lower and upper | Optional as a pair; required together when started | Yes | User supplied | Conditional, inside the custom row | Two `ToolQuantityInput` fields | It lets an unlisted app contribute without claiming review. | Stack the pair. |
| 5 | Custom storage lower and upper | Optional as a pair; required together when started | Yes | User supplied | Conditional, inside the custom row | Two `ToolQuantityInput` fields | It makes custom storage assumptions explicit. | Stack the pair. |
| 6 | Host RAM budget | Required | Yes | No default | Visible, host budget group | `ToolQuantityInput` | A fit answer needs a denominator. | Full width. |
| 7 | Host app-storage budget | Required | Yes | No default | Visible, host budget group | `ToolQuantityInput` | Storage is a separate resource with a separate budget. | Full width. |
| 8 | Headroom reserve | Defaulted but visible at 20% | Yes | Product planning choice | Visible, host budget group | `ToolNumberField` with `%` suffix | It changes available budget and must not be hidden. | Full width. |
| 9 | Add app | Secondary action | No, until a row is added | None | Visible, beside the app group heading | `ToolButton` | It creates another repeatable input group. | Full width below current rows. |
| 10 | Remove row | Secondary action | Yes, after a plan exists | None | Visible, fixed end of each row | `ToolButton` with text `Remove` | The user must be able to correct the mix. | Stays below row fields, never wraps off-screen. |
| 11 | Calculate plan | Primary action | Yes | None | Visible, after the host budget | `ToolButton` | One explicit action makes a multi-row plan easy to validate. | Full width. |
| 12 | Reset plan | Secondary action | Yes, it clears the lead result | None | Visible, beside or below the primary action | `ToolButton` | Recovery is useful after comparing a different host. | Full width below calculate. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Plan lead | Is the known plan within its available budget? | RAM and storage state, or unknown state | `ToolResultLead` sentence at the top of the result | Never say fit when an affected dimension has unknown rows. |
| 2 | Resource summaries | What exact range is known, and how much budget is available? | Min/max known totals, available budgets, units | Two compact key/value rows with exact text | One row for RAM and one for storage; no duplicate metric cards. |
| 3 | Allocation bars | What share of each available budget does the known maximum use? | Known max and available budget | `ToolAllocationBar` with an exact text legend | Omit or use neutral unknown treatment when the dimension is incomplete; never use color as verdict. |
| 4 | Binding resource | What should I investigate first? | Highest complete max/available ratio | Short supporting line | Show `unknown` when neither dimension is complete. |
| 5 | Unknown requirements | What prevents a complete fit answer? | App names, quantities, and missing dimension | Ordered list or compact table | Do not show unknown as zero or bury it under source metadata. |
| 6 | Per-app contributions | Which rows make up the known total? | Row names, quantities, RAM range, storage range, evidence kind | `ToolDataTable` with real headers | Own horizontal overflow inside the table wrapper on narrow screens. |
| 7 | Evidence and next check | How should I verify the plan? | Source count, basis, confidence, check date, app docs handoff | Quiet metadata and one connected sentence | Do not add Docker socket, live host, or deployment controls. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Two-part allocation bar | Known maximum versus available budget for one dimension | Yes, when both values are known and the denominator is available budget | Use with exact legend and accessible text. |
| Per-app contribution table | Repeated rows with the same resource fields | Yes | Use; table is clearer than prose or cards. |
| Line or area chart | Change over time or across scenarios | No, the tool has no time series or scenario axis | Omit. |
| Hardware diagram | Physical topology or component relationship | No, the tool does not model hardware topology | Omit. |
| Marker art | Conceptual explanation of headroom | No, it is not needed for the working answer | Omit at launch; supporting prose is enough. |
| Stacked chart of min and max | Range plus total | No, min and max are bounds, not additive categories | Replace with text ranges and one bar for the known maximum. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | No app rows, empty host budgets, headroom 20% | `Add an app and a host budget to calculate a plan.` | No bars or table | Calculate remains available to reveal precise validation | Focus starts at app chooser; no automatic announcement. |
| App rows, not calculated | One or more rows and edited inputs | `Plan not calculated` or no result lead | Rows remain visible | Mark a previous result stale after a result-driving edit | No focus jump; status may say `Changes not calculated`. |
| Invalid submit | Any missing or invalid field | No result | No stale result | Inline errors below the narrowest field; preserve input | Focus first invalid control; announce one summary. |
| Calculating | Valid form submitted | `Calculating...` for the short synchronous action | Inputs remain visible, action width fixed | Prevent duplicate submit | Polite live announcement. |
| Complete known result | All selected rows have RAM and storage ranges | One sentence: `Within the available budget`, `Tight`, or `Over budget` with binding resource | RAM/storage rows, bars, table, evidence | Calculate again after edits | Focus result lead; announce `Plan calculated`. |
| Partial result | At least one selected row lacks a RAM or storage range | `Known plan; some requirements are unknown` | Known subtotal, affected dimension unknown, named unknown list | User can add custom bounds or verify source | Focus result lead; announce unknown dimension. |
| Empty/no-data result | No rows after reset | `Add an app to start` | No resource totals | Add app is the recovery | Focus app chooser after reset. |
| Catalogue failure | Server cannot provide the published catalogue | Page-level `App catalogue unavailable` | No fake empty state | Retry route or use site navigation; no client fallback with invented data | Error status is announced; no input form claims success. |
| Reset | User activates reset | Initial lead | Empty controls | Restore headroom 20% and remove result | Focus app chooser; announce reset. |
| Restored URL | Not supported at launch | N/A | N/A | Clean canonical URL stays unchanged | No URL state or hydration announcement. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Filter a published app catalogue and choose custom | `ToolComboBox` | The app list is longer than a visible choice row and needs typing. | A large select would slow repeat use; a free text field would lose curated provenance. |
| Edit bounded numeric quantities | `ToolNumberField` | Preserves keyboard-safe numeric semantics and validation. | Bare text inputs would duplicate number behavior. |
| Edit value plus unit | `ToolQuantityInput` | Keeps number and unit as one decision. | Separate label and unit controls can drift visually. |
| Repeat app rows | `ToolRepeatableList` behavior with page-owned row layout | Add, remove, focus, and stable row semantics belong together. | Independent ad hoc div rows risk unstable focus. |
| Primary and recovery actions | `ToolActionRow` and `ToolButton` | Keeps one primary action and predictable loading width. | Icon-only controls would obscure `Calculate plan` and `Reset plan`. |
| Lead answer and result status | `ToolResultLead` plus `ToolStatus` | Gives the decision a semantic heading and one announcement path. | A panel of equal metric cards would dilute the answer. |
| Budget relationship | `ToolAllocationBar` | Exact denominator and two-part relationship are truthful here. | A chart would imply trends; color-only status would imply unsupported safety. |
| Repeated contributions | `ToolDataTable` | Preserves headers, row comparison, and narrow scrolling. | Cards would repeat labels and make comparison harder. |
| Source and unknown detail | Semantic list/table with native links | Evidence is structured and needs readable text. | Tooltip-only provenance hides the reason for the number. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| 1440 px desktop | App rows and host budget align to the normal tool measure. Result follows one divider. | `Paperless-ngx with OCR and document indexing` | None at page level. |
| 760 px tablet | All controls stack by group; result lead stays before detail. | `Source unavailable for this selected app` | Contribution table only if needed. |
| 375 px mobile | App chooser, rows, budget fields, action, lead, summaries, bars, unknowns, table, then evidence. | `Open WebUI with local model` and `Unknown storage requirement` | Table wrapper has deliberate horizontal scroll and a visible focusable region. |
| 320 px narrow mobile | Same order; row actions take their own line; no two-column metric grid. | `self-hosted app resource planner` | Only the contribution table may scroll. |
| Long unknown list | Keep each app name and missing dimension on its own line. | Twenty unknown app names | Vertical page flow, never horizontal page overflow. |
| Light theme | Same geometry and semantic hierarchy with light tokens. | Same as dark theme | None. |

## Interface wireframes

### Desktop result

```text
self-hosted app resource planner
Choose apps, compare their known ranges with a host budget, and keep unknowns visible.

APP MIX
[Choose a published app or custom row                              v] [Add app]
[Immich                                                     v] [1] [Remove]
  RAM 2.0-6.0 GiB (estimated)    Storage unknown
[Vaultwarden                                                v] [2] [Remove]
  RAM 0.2-0.5 GiB (estimated)    Storage 1-2 GB (estimated)

HOST BUDGET
[RAM budget                         ] GiB  [App storage budget      ] GB
[Headroom reserve                  ] %
[Calculate plan] [Reset plan]

--------------------------------------------------------------------------
RESULT
Known plan: some requirements are unknown. RAM is the closest known budget.

RAM       2.4-7.0 GiB known     6.4 GiB available       Unknown
Storage   2-4 GB known          80 GB available         Unknown
[known maximum versus available allocation bar]

Unknown requirements
  Immich: storage range

Per-app contribution
  App              Qty   RAM range              Storage range       Evidence
  Immich            1     2.0-6.0 GiB            Unknown              estimated
  Vaultwarden       2     0.2-0.5 GiB            1-2 GB               estimated

Sources and next check: verify the selected app's documentation and observe
running usage before treating this plan as a deployment decision.
```

### Narrow mobile result

```text
self-hosted app resource planner

APP MIX
[Choose app                                 v]
[Add app]

Immich                                      [Remove]
Quantity [1]
RAM 2.0-6.0 GiB (estimated)
Storage unknown

HOST BUDGET
RAM [8] GiB
App storage [100] GB
Headroom [20] %
[Calculate plan]
[Reset plan]

RESULT
Known plan: some requirements are unknown.
RAM is the closest known budget.

RAM
2.4-7.0 GiB known of 6.4 GiB available
Unknown
[allocation bar]

Storage
2-4 GB known of 80 GB available
Unknown
[allocation bar omitted or marked unknown]

Unknown requirements
Immich: storage range

Per-app contribution  >
[focusable horizontal table region]

Sources and next check
short verification sentence
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
Initial / empty:
  APP MIX + empty chooser
  HOST BUDGET + three visible fields
  Calculate plan
  Add an app and a host budget to calculate a plan.

Invalid:
  exact field error directly below the field
  no lead result and no stale values

Loading:
  Calculate plan -> Calculating...
  stable button width, inputs retained, polite status

Partial:
  known subtotals remain visible
  affected dimension says Unknown
  named unknown requirements list

Failure:
  App catalogue unavailable
  retry or site-navigation recovery, no fabricated app choices

Expanded evidence:
  source link and basis appear under the relevant row or in a details region
  no duplicate source paragraphs in the lead result
```

## Removed or rejected

- Per-app CPU input and total: no reviewed CPU source field exists.
- Provider or hardware recommendation: it would turn the answer into a buying funnel.
- Docker or Kubernetes limit generation: it confuses planning estimates with runtime configuration.
- Live host inspection: privacy and security risk, outside the local calculation contract.
- A chart of hypothetical scenarios: no real scenario axis exists at launch.
- A separate metric card for every result field: it would repeat the summary and weaken the lead answer.
- Hidden headroom or OS overhead: active assumptions must remain visible.
- Query-string serialization on mount: the clean canonical URL must stay clean.
- Nested cards around the form and result: the page uses one full-width workbench band.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | The first result sentence states the budget state and names the binding known resource, or states that the affected resource is unknown. | Browser result assertions and screenshot review |
| UI-002 | input | The app chooser, quantity, RAM, storage, and visible headroom controls appear in task order with persistent labels and units. | Browser semantic assertions |
| UI-003 | deduplication | Each exact RAM or storage range appears once in the summary and once in the contribution table only when the table is the needed row comparison; no repeated result cards appear. | Interface inspection and Browser text count |
| UI-004 | visual-truth | Allocation bars encode known maximum against available budget with exact legends and omit misleading bars for incomplete dimensions. | Browser DOM and screenshot review |
| UI-005 | unknown | A missing range produces a named unknown requirement and withholds the affected fit verdict instead of showing zero. | Engine plus Browser partial-state test |
| UI-006 | recovery | Invalid submission focuses the first invalid control, announces one error summary, and shows no stale result. | Keyboard Playwright test |
| UI-007 | repeat | Adding a row focuses its first useful control; removing a row returns focus to a stable neighboring control. | Keyboard Playwright test |
| UI-008 | responsive | At 320 and 375 px, the page has no horizontal overflow; only the contribution table may scroll inside its own focusable wrapper. | Browser measurements and mobile screenshot |
| UI-009 | hierarchy | There is exactly one accent-filled primary action in the workbench, and reset/remove actions are secondary. | CSS inspection and screenshot review |
| UI-010 | accessibility | Result changes are announced in one live region, bars have text equivalents, and table headers remain associated on narrow screens. | DOM accessibility assertions |
| UI-011 | url | Opening `/self-hosted-app-resource-planner` leaves the URL unchanged through server render and hydration. | Browser history and URL assertion |
| UI-012 | omission | No provider recommendation, CPU total, Docker output, or decorative chart appears in the workbench. | Browser text and DOM assertions |

## Open questions and blockers

- None. The interface implements the ready product contract and leaves CPU, sharing, provider matching, and workload-specific controls deferred.
