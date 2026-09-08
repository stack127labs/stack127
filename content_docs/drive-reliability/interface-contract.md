# Interface contract: Drive Reliability Explorer

Status: ready
Tool: Drive Reliability Explorer
Route: `/drive-reliability`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:411c8ceaffbc5ee5440a3a8abec8d06931a7a4b20df2d09c6b879cb3555e45e1`

## User task

- Primary user: A homelab or NAS builder checking one exact hard-drive model or a short purchase list against Backblaze fleet data.
- Question: What AFR did Backblaze observe for this drive model in the selected source period, and how much evidence sits behind that rate?
- Lead answer: One selection-aware answer that names the model or selected set, source period, observed AFR, and approximate 95% evidence range without turning fleet data into a home-drive prediction.
- Next decision: The person can keep or drop a model from the short list, then check SMART history, firmware, workload fit, warranty, and backups before buying or replacing a drive.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Source period | Which Backblaze cohort boundary am I checking? | `input.periodId` resolved against `snapshot.periods` | input | Quarterly, annual, and lifetime rows cannot be mixed. All three choices need to stay visible. | Show the selected period once in the lead and once in quiet source metadata. Do not add another period badge. |
| Model or manufacturer search | Which known cohort am I trying to find? | `input.search` and normalized model matching | input | The primary user usually arrives with an exact model, while manufacturer matching supports a short browse. | Search filters the locator list. It never selects or promotes the first sorted row by itself. |
| Manufacturer filter | Which vendor's model rows should remain? | `input.manufacturer` and period-specific snapshot values | input | It narrows a browse but is not needed for an exact model lookup. | Keep it inside `Filter model list`. Do not repeat the active vendor as a tag above the table. |
| Minimum and maximum capacity | Which decimal-TB range should remain? | `input.minCapacityTb`, `input.maxCapacityTb`, and `row.capacityTb` | input | Capacity narrows a purchase list when model text is not enough. | Keep the two values in one capacity group. Do not add a range slider or active-filter chips. |
| Show below-threshold cohorts | Should rows outside the active period's source threshold appear? | `input.showSmallCohorts`, period thresholds, `includedBySource`, and derived qualification | input | It is a useful opt-in only when the active snapshot period contains such rows. | Render it only when the active period has below-threshold rows. Do not show a control that changes nothing. |
| Select or remove cohort | Which one to three rows should the result inspect? | `input.selectedModelIds` and visible resolved rows | input | Deliberate selection creates the answer and comparison. | Search and filters never create a selected result. Use one select/remove action per locator row and no separate inspect action. |
| Reset explorer | How do I return to the known starting state? | Default input | input | It clears filters, selection, notices, and an opened share query. | One quiet reset action only. Do not add reset links to every empty region. |
| Share state | How can I send this exact period, filter, and selection? | `encodeDriveReliabilityState` | input | A bounded explicit share link is useful for a model shortlist. | The action copies a newly constructed URL. Ordinary edits do not change the current address. |
| Matching cohort count | Did the current scope return a manageable list? | `resolution.rows.length` after excluding the fleet summary where appropriate | supporting | A count confirms that filters took effect and helps explain an empty list. | Show once beside the locator heading. Do not repeat it in a status bar and table caption. |
| Selection count and limit | How many models are in the comparison? | `resolution.selected.length`, maximum 3 | supporting | The limit affects the next selection. | Show once near the locator actions. A fourth attempt announces the limit without another badge or panel. |
| Cohort identity | Which source row am I selecting? | `model`, `manufacturer`, `capacityTb`, `cohortType`, and `evidenceLabel` | supporting | These fields distinguish exact models from the fleet summary before selection. | The locator list shows identity only. AFR, failures, drive days, count, and age stay out of the locator list. |
| Selection-aware AFR answer | What rate did Backblaze observe for the selected model or selected set? | `afrPercent`, formatted AFR, selected rows, and active period | lead | This is the one conclusion the person came for. | Render one lead region. Do not keep the old model heading, standalone AFR block, metric grid, and comparison heading as competing answers. |
| Approximate 95% evidence range | How uncertain is each observed rate given failures and exposure? | `displayEvidenceRange` from `poisson-normal-v1` | supporting | The range changes how the point AFR should be read. | It may appear in the lead detail, the exact range plot, and the evidence table only. The plot and table repetition is required for visual comparison and accessible exact values. |
| Common-scale AFR range plot | How do the selected AFR point estimates and evidence ranges relate? | Selected rows' AFR and interval bounds | supporting | A zero-based numeric axis makes overlap and spread faster to see than prose. | Plot selected rows only. Do not plot every matching cohort, add ranks, or label any model best or worst. |
| Selected evidence table | What exact source facts support each selected rate? | Model, capacity, AFR, range, drive days, failures, drive count, age, and qualification | evidence | Repeated rows with the same exact fields belong in one comparison table, including a one-row selection. | This is the sole detailed metric region. Remove the separate metric grid and do not repeat the table as cards on desktop. |
| Thin or below-threshold qualification | Does this row need extra caution? | `evidenceLabel`, source thresholds, and warnings | supporting | A one-failure or below-threshold cohort can move sharply and should not look ordinary. | Put one plain warning directly after the lead. Do not use a colored panel, badge set, or generic warning elsewhere. |
| Missing average age | Did Backblaze report age for this row? | `averageAgeMonths` | evidence | `Not reported` is more honest than a value borrowed from another period. | Show `Not reported` in the evidence table. Do not add a separate missing-data notice. |
| Source name and links | Where did the cohort data come from? | `sourceName`, `sourceUrl`, and `sourceReportUrl` | evidence | The person needs the dataset and report for provenance. | One quiet metadata block with two plainly named links. Do not repeat provider copy in the form header. |
| Source checked date and snapshot version | How current is this bundled data? | `sourceCheckedAt` and `datasetVersion` | evidence | The local snapshot does not update during interaction, so its date and version matter. | Keep both in the source metadata. Remove the snapshot version from the form heading. |
| Active inclusion rule | Which minimum drive count and drive days qualify this period? | `period.driveCountMinimum` and `period.driveDaysMinimum` | evidence | It explains why a row is qualified or hidden. | State it once in source metadata or the adjacent below-threshold warning, not in every locator row. |
| Interval method version | How was the approximate range produced? | `DRIVE_RELIABILITY_INTERVAL_VERSION` and each range method | evidence | The named method keeps the approximation inspectable. | Keep it in quiet metadata. Do not expose standard error as another metric. |
| Restore warnings | Did an opened share link lose unsupported state? | `parseDriveReliabilityState().warnings` and dropped IDs | supporting | A partially restored link must not silently look complete. | One polite status after hydration. Do not repeat each parser warning in the result. |
| Snapshot validation errors | Can the bundled source produce a trustworthy result? | `resolution.status === "invalid"` and `errors` | supporting | Invalid source data blocks every answer. | Production shows one failure message and source recovery. Raw validation details stay out of the public interface. |
| Stable row IDs | How does state preserve selection? | `row.id` | omit | IDs are implementation data, not evidence a person needs to read. | Keep them in button state and share encoding only. |
| Schema, calculation, and input versions | Which internal contracts produced this result? | Engine constants | omit | The snapshot and interval versions are sufficient public provenance. The other versions belong in encoded state and tests. | Do not create a version wall in the workbench. |
| Standard error value | What intermediate number produced the evidence interval? | `evidenceRange.standardErrorPercent` | omit | The displayed interval already carries the useful relationship. | Keep it in the engine and report data. Do not add a metric or formula row. |
| AFR-sorted full catalog | Which model has the smallest point estimate? | Current engine row order | omit | Sorting a mixed fleet list by point AFR reads like a recommendation and ignores evidence strength. | The locator list orders fleet summary first, then manufacturer and model. No rank numbers, medals, or default best-drive framing. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Period | defaulted | yes | Latest supported Backblaze snapshot, `Q1 2026` | visible | `ToolChoiceGroup` with `Q1 2026`, `Annual 2025`, and `Lifetime` | The period changes the cohort boundary and available model rows. | Full-width choice row that wraps without changing option order. |
| 2 | Model or manufacturer | optional primary input | no, it filters candidates before selection | Empty search | visible | `ToolSearchField` with placeholder `WUH722222ALE6L4` | It filters the known local cohort list as the person types. | Full width below period choices. The clear action remains inside the field. |
| 3 | Filter model list | optional settings group | no, it filters candidates before selection | Closed with all candidates included | disclosure | `ToolDisclosure` | Manufacturer, capacity, and below-threshold controls help browsing but should not delay an exact lookup. | One full-width disclosure below search. Expanded fields stack in source order. |
| 3a | Manufacturer | optional | no, it filters candidates before selection | All manufacturers | disclosure | `ToolSelect` with an `All manufacturers` option | It narrows the active period to one vendor. | Full width inside the disclosure. |
| 3b | Minimum capacity | optional | no, it filters candidates before selection | No lower bound | disclosure | `ToolNumberField`, minimum 1, maximum 100, step 1, suffix `TB` | It sets the lower decimal-TB bound. | Shares a two-column row with maximum capacity at 375px and stacks below 340px. |
| 3c | Maximum capacity | optional | no, it filters candidates before selection | No upper bound | disclosure | `ToolNumberField`, minimum 1, maximum 100, step 1, suffix `TB` | It sets the upper decimal-TB bound. | Follows minimum capacity in the same row or stack. |
| 3d | Show below-threshold cohorts | optional | no, it filters candidates before selection | Off | disclosure | `ToolCheckbox` | It reveals excluded rows only when the active period contains them. | Full-width final row inside the disclosure. |
| 4 | Select or remove model | primary action | not applicable | No selection | visible | `ToolButton` with `variant="secondary"`, `aria-pressed`, and row-specific accessible name | It deliberately creates the lead result or changes the comparison. The same action family appears in each locator row. | Full-width row action in locator cards. On desktop it stays in the fixed final table column. |
| 5 | Reset | secondary action | not applicable | Restores documented defaults | visible | `ToolButton` with `variant="ghost"` | It restores the clean default state without competing with selection. | Full width only when the action row no longer fits. |
| 6 | Share selection | secondary action | no | Available after selection | result | `ToolCopyAction` with a computed versioned URL | It copies the current period, filters, and selected IDs after the person asks. | Full width after a selected result. It never sits above the lead. |

Validation, focus, and keyboard behavior:

- Typing filters the bundled snapshot without loading state or focus movement. Enter selects the row only when normalized search has one exact model match in the active period. Otherwise Enter leaves focus in the search field and announces the match count.
- Minimum and maximum capacity may both be blank. Values outside 1 to 100 TB show one field error. A minimum above the maximum shows `Minimum capacity must not exceed maximum capacity.` below the capacity group, withholds locator and result rows, and focuses the minimum field only after Enter or an attempted selection.
- Period changes preserve search and advanced filters, clear selected rows, and announce the new period and match count. A selected result from the old period disappears immediately.
- A fourth selection does not change the existing three. The attempted button retains focus and `ToolStatus` announces `Select up to three cohorts.`
- Removing the primary selected row makes the next selected row the lead. Removing the final row returns to the selection prompt without moving focus.
- Reset returns to Q1 2026, clears every filter and selection, removes an opened `state` query, focuses the period group, and announces `Explorer reset.`

URL behavior:

- Opening `/drive-reliability` leaves the URL unchanged through server render and hydration.
- Typing, filtering, changing period, and selecting rows never call `pushState` or `replaceState` and never serialize defaults into the current address.
- `Share selection` builds and copies a versioned `?state=` URL without navigating to it or changing the current address.
- Opening an explicit valid `?state=` URL restores its state and leaves that address intact. Later edits do not rewrite it. Pressing Share copies a new URL for the edited state.
- An invalid or unsupported share payload restores the clean default, removes the invalid query with one `replaceState`, and announces that some or all state could not be restored.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Selected AFR answer | What did Backblaze observe for my selected model or set in this period? | Selected rows, formatted AFR, formatted interval, and period label | For one row, use one `ToolPrimaryResult` labelled `Observed AFR`, with the model, period, and approximate range in its detail. For two or three rows, use one `ToolResultLead` sentence that states the selected set's displayed AFR span in the active period. | Exactly one lead region. Do not promote a row until selection or an exact-match Enter action. Do not call the smallest value best, safest, or recommended. |
| 2 | Qualification note | Should I treat one selected cohort as thin or below the source threshold? | Evidence label, failure count, source threshold, and engine warning | One plain sentence directly below the lead, only when a selected row needs it. Use semantic warning text on the key phrase without a tinted box. | Omit for ordinary qualified cohorts. Never turn zero failures into zero risk. |
| 3 | AFR and approximate range plot | How do point estimates and approximate evidence ranges overlap on one scale? | The one to three selected rows' AFR and interval bounds | Page-owned accessible figure with a shared zero-based percentage axis, labelled ticks, one point, and one interval line per selected row. Text labels show model, AFR, and range. | Use one common axis for all selected rows. Do not show unselected cohorts, animate rankings, truncate an interval, or use color as the only distinction. |
| 4 | Selected cohort evidence | Which exact counts and cohort facts produced each selected rate? | Model, manufacturer, capacity, AFR, range, drive days, failures, drive count, age, and qualification | `ToolDataTable` with one to three rows. Keep model first and the remove action last. `Not reported` is a cell value. | This table is the accessible exact counterpart to the plot. Remove the old metric grid and second comparison table. |
| 5 | Source and method | Which source, period rule, snapshot, and interval method support this result? | Source name, checked date, active period dates, inclusion thresholds, dataset version, interval version, dataset URL, and report URL | Quiet page-owned `dl`, followed by `Dataset` and `Source report` links. Use small mono metadata. | Do not repeat these facts in the form header, badges, or prose inside the workbench. |
| 6 | Share action and status | How can I preserve this selection, and did copying work? | Encoded state and clipboard outcome | One secondary `Share selection` action after metadata plus one polite status message. | Do not show Share before a selection. A copy failure leaves the result and inputs intact and says to copy the generated link manually. |

Read without internal reports, the result says: `Backblaze observed 0.38% AFR for WUH722222ALE6L4 in Q1 2026, with an approximate 95% evidence range of 0.27% to 0.50%.` The plot shows the point estimate inside its evidence range on the same scale as any other selected model. The table supplies the failures, exposure, drive count, capacity, age, and qualification behind the displayed rate. The final metadata identifies the source period, inclusion rule, snapshot, method, and links.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large lead answer | The selected model's observed AFR, or the selected set's AFR span | Not applicable. Type hierarchy makes one conclusion dominant. | Use one selection-aware lead region. |
| AFR and evidence-range plot | Point AFR and approximate interval for one to three rows on a common numeric scale | Yes. Position encodes AFR percentage on a zero-based labelled axis, and line length encodes interval width. | Use a page-owned exact figure backed by the same selected-row array as the evidence table. |
| Selected evidence table | Repeated exact source fields for one to three selected cohorts | Yes. Aligned columns compare the same fields and preserve exact accessible values. | Use one table after the plot. |
| Cohort locator table or list | Repeated row identity and one selection action | Yes. Rows align model, manufacturer, capacity, qualification, and action without implying a performance rank. | Use a table on desktop and authored locator cards on narrow screens. Sort by type, manufacturer, and model, not AFR. |
| Metric-card grid | AFR, range, counts, and age as equal boxes | No. Equal boxes flatten the answer hierarchy and duplicate the selected evidence table. | Omit. |
| Progress or allocation bar | Reliability or progress toward failure | No. AFR has no personal-drive denominator, target, or completion state. | Omit `ToolProgressBar` and `ToolAllocationBar`. |
| Timeline | Quarterly, annual, and lifetime scopes | No. These are source views, not stages on one time axis. | Omit `ToolTimeline`. |
| Marker art or screenshot | The exact selected evidence | No. A drawing would blur exact values and a screenshot would duplicate the live tool. | Omit. |
| Best-drive ranking or score | A universal purchase recommendation | No. Backblaze fleet evidence does not encode home workload, firmware, price, warranty, or individual failure probability. | Omit ranks, medals, scores, and recommendation labels. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Q1 2026 selected, empty search, advanced filters collapsed, reset quiet, no Share action | Absent | Qualified cohort locator is visible in type, manufacturer, and model order | Selection prompt only. No helper paragraph or error | Normal document order; nothing announces on load and the URL stays clean. |
| Filtering | Preserve active controls and update the local locator synchronously | Clear any selected result that is no longer in the visible scope | Match count and locator update without loading chrome | Clear search or Reset remains available | Keep focus in the changed control. Announce the new count after the update settles. |
| Invalid capacity | Preserve entered bounds and disable row selection while invalid | Absent | Locator and source result regions are withheld | One group-level error names the valid relationship or bound | Announce the error. Focus minimum capacity after Enter or an attempted selection, not on every keystroke. |
| Calculating or loading | Not applicable. Filtering and AFR resolution use the bundled snapshot synchronously | No loading variant | No skeleton, spinner, busy label, or stale result | None | No busy announcement. |
| One selected cohort | Preserve controls; selected row action becomes `Remove` | One dominant observed AFR with model, period, and approximate range | Conditional warning, one-row plot, evidence table, metadata, and Share action | The row action removes the selection. Reset clears all state | Announce the selected model and AFR. Pointer activation keeps focus on the row action; keyboard activation moves focus to the lead heading. |
| Two or three selected cohorts | Preserve controls and selection order; unselected actions remain available until three | One sentence states the displayed AFR span for the selected period | Common-scale plot, two or three evidence rows, metadata, and Share action | Remove any row. A fourth attempt leaves all three unchanged | Announce selection count and the comparison lead. Keep focus on the initiating row action. |
| No matches | Preserve all valid controls and remove selections that no longer belong to the scope | Absent | Show the active period and `0 matching cohorts`; no plot, evidence table, or metadata result block | Show `No cohorts match these filters.` with one `Reset filters` action that preserves period | Announce the empty state. Do not focus search automatically while typing. |
| Annual fleet summary only | Annual 2025 remains selected; exact model searches stay preserved | Fleet lead appears only after selecting `All analyzed drives` | Evidence table shows `Not reported` for missing drive count and age | If a model query has no row, say `Annual 2025 has a fleet summary but no model rows in this snapshot.` Offer Q1 2026 and Lifetime as period choices, not extra buttons | Announce the scope limitation. Focus remains on search or period control. |
| Thin qualified cohort | Controls and selection remain usable | Normal observed AFR lead | Plain caution says one failure can move the rate sharply. Plot and table still show exact evidence | Removing the row or choosing another model clears the caution | Announce the caution after the lead. |
| Below-threshold cohort | Conditional checkbox is on and the selected row remains explicit | Normal observed AFR lead without any recommendation language | Adjacent caution names the active drive-count and drive-day rule; table qualification reads `Below source threshold` | Turning the checkbox off removes the selected row and returns to the locator | Announce that the selected cohort falls below the source threshold. |
| Missing age | Inputs and selection remain unchanged | Normal lead | Evidence table cell says `Not reported` | No recovery is needed | No separate announcement for one missing cell. |
| Partially restored share | Restore valid period, filters, and IDs; drop unsupported or missing values | Show a lead only when at least one valid selected row remains | Normal evidence plus one restore notice | Reset returns to the clean route; Share creates a new valid URL | Announce one concise restore notice after hydration. Do not move focus. |
| Invalid shared state | Restore clean defaults and remove the bad query | Absent | Initial locator only | One notice says the shared state could not be restored | Announce once after hydration. Normal focus order remains. |
| Snapshot failure | Keep the period and search controls visible but disable selection and Share | Absent | No plot or evidence table. Keep fixed source links when their snapshot fields are safe | Show `Drive data is unavailable.` and direct the person to the Backblaze sources. Reset is not offered because it cannot repair bundled data | Use `ToolStatus` with danger semantics and role alert. Focus stays in place. |
| Share copied or failed | Inputs and result remain unchanged | Remains visible | All evidence remains visible | Status says `Share link copied.` or `Copy unavailable. Copy this link:` followed by a selectable generated URL | Announce the status. Keep focus on the Share action. |
| Advanced filters expanded | Current result and selection remain visible | Remains visible | Manufacturer, capacity, and any applicable below-threshold checkbox appear in normal input order | Disclosure trigger collapses the fields; chosen values appear in its summary | Disclosure semantics announce expansion. Focus stays on the trigger unless the person tabs inside. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Visible period scope | `ToolChoiceGroup` | Three short choices need to be compared at once and retain real radio semantics. | `ToolSelect`, because hiding the period boundary weakens the core decision. |
| Local collection filter | `ToolSearchField` | The field filters a known model collection and includes a labelled clear action. | `ToolTextField`, because this is a live collection search rather than a single remote lookup. |
| Optional browse controls | `ToolDisclosure`, `ToolSelect`, `ToolNumberField`, and conditional `ToolCheckbox` | The controls keep their native interactions and stay out of the exact-model path until needed. | Always-visible four-column filter grid, because it gives secondary browsing controls the same weight as model search. |
| Deliberate row selection | Page-owned semantic locator table with `ToolButton` row actions | The table needs stable identity columns, selected state, a fixed final action column, and an authored mobile card form. | `ToolDataTable` alone, because its present row API does not expose row state or a mobile locator-card contract. |
| Match, selection, restore, and share feedback | `ToolStatus` | One polite status channel covers changing counts and bounded action feedback. | Several helper paragraphs and notices, because they repeat state and disturb the result hierarchy. |
| One selected AFR answer | `ToolPrimaryResult` | It provides one accessible label, dominant value, and compact model, period, and interval detail. | Standalone model header, AFR block, evidence badge, and metric cards, because they split one answer into competing regions. |
| Multi-selection lead | `ToolResultLead` | One sentence can state the selected period and displayed AFR span without elevating one model as the winner. | A primary card per model, because equal cards turn the comparison into a dashboard. |
| Exact selected relationship | Page-owned accessible range figure | It needs a common numeric axis, interval lines, points, text labels, and one selected-row data source. | `ToolProgressBar`, because an AFR interval is not completion toward a target. |
| Exact repeated evidence | `ToolDataTable` | One to three rows share the same technical fields and need an accessible exact counterpart to the plot. | Metric grid and separate comparison table, because both repeat the same selected values. |
| Source details | Page-owned `dl` | A small metadata set should wrap quietly and remain subordinate to the answer. | `ToolMetricGroup`, because provenance should not look like another result. |
| Reset and Share | `ToolButton` ghost and `ToolCopyAction` secondary inside `ToolActionRow` | Both are useful reversible actions and neither should receive the accent fill. | Primary button styling or icon-only actions, because selection is the main action and both labels need to stay visible. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | Full-width workbench band. Period, search, and disclosure stack in task order. The expanded filter row uses manufacturer plus two capacity fields. Locator, lead, warning, plot, evidence table, metadata, then Share follow vertically. | `All analyzed drives`, `backblaze-q1-2026-reviewed-2026-08-23`, `529,968,464` drive days, and `Approx. 95% evidence range 0.00% to 10.68%`. | No page overflow. The selected evidence table owns horizontal overflow only when columns cannot keep their readable minimum width. |
| Narrow mobile, 320px to 640px | Period choices wrap. Search stays full width. Expanded filters stack below 340px. Locator rows become authored cards with identity first and one full-width select/remove action last. Lead, warning, plot, table, metadata, and Share keep desktop order. | `WUH722222ALE6L4`, `Minimum capacity must not exceed maximum capacity.`, and the full snapshot version. | Text wraps in cards, lead detail, warnings, and metadata. The selected evidence table alone may scroll horizontally, with a visible `Scroll for all evidence` caption. |
| Three-model comparison | Plot rows place model and exact text above the interval track when labels no longer fit beside it. Evidence rows keep one shared column schema. | Three 18-character model IDs, `0.27% to 0.50%`, and `Qualified cohort`. | Plot labels wrap inside the figure. Evidence table scroll stays inside its viewport. Sibling content never covers its final column. |
| Increased text size or long translated labels | Let controls and actions grow vertically. Stack action rows before labels collide. Do not truncate evidence or accessible names. | `Show cohorts below the Backblaze source threshold` and `Approximate 95% evidence range`. | Each bounded region wraps its own text. The document never gains horizontal overflow. |
| Expanded filters at any width | Disclosure stays in normal flow and pushes the locator down. Current filter values appear in a short trigger summary when collapsed. | `Manufacturer: All, capacity: 1 TB to 100 TB, below-threshold rows: hidden`. | Disclosure content wraps. It never becomes an overlay or drawer. |

## Interface wireframes

### Desktop result

```text
Explore Backblaze evidence                                      [Reset]

Period
[Q1 2026] [Annual 2025] [Lifetime]

Model or manufacturer
[WUH722222ALE6L4                                              x]
> Filter model list

1 matching cohort                                              1 selected
MODEL                 MANUFACTURER    CAPACITY    EVIDENCE              ACTION
WUH722222ALE6L4       WDC             22 TB       Qualified cohort      [Remove]

-------------------------------------------------------------------------------

Observed AFR
0.38%
WUH722222ALE6L4 in Q1 2026. Approx. 95% evidence range 0.27% to 0.50%.

AFR and approximate evidence range
0%                 0.25%                 0.50%
WUH722222ALE6L4     |----------[-----●-----]|
                    AFR 0.38%    range 0.27% to 0.50%

Selected cohort evidence
MODEL              MAKER  TB  AFR    APPROX. RANGE   DRIVE DAYS  FAILURES  DRIVES  AGE    EVIDENCE
WUH722222ALE6L4    WDC    22  0.38%  0.27% to 0.50% 3,992,942   42        45,638  16.1m  Qualified

Source             Backblaze Drive Stats
Period             Q1 2026, 1 January to 31 March 2026
Inclusion rule     More than 100 drives and more than 10,000 drive days
Snapshot           backblaze-q1-2026-reviewed-2026-08-23
Range method       poisson-normal-v1
Checked            23 August 2026
[Dataset] [Source report]                                  [Share selection]
```

With two or three selected rows, the lead and plot become:

```text
The selected Q1 2026 cohorts span 0.38% to 1.05% observed AFR.

0%                      0.50%                       1.00%             1.30%
WUH722222ALE6L4          [---●---]  0.38%, 0.27% to 0.50%
ST16000NM001G              [----●----]  0.52%, 0.37% to 0.67%
MG08ACA16TA                                  [------●------]  1.05%, 0.85% to 1.25%
```

### Narrow mobile result

```text
Explore Backblaze evidence
[Reset]

Period
[Q1 2026] [Annual 2025]
[Lifetime]

Model or manufacturer
[WUH722222ALE6L4        x]
> Filter model list

1 matching cohort
1 selected

+---------------------------+
| WUH722222ALE6L4           |
| WDC, 22 TB                |
| Qualified cohort          |
| [        Remove         ] |
+---------------------------+

-----------------------------

Observed AFR
0.38%
WUH722222ALE6L4 in Q1 2026.
Approx. 95% evidence range
0.27% to 0.50%.

AFR and approximate range
WUH722222ALE6L4
0%  |------[---●---]--|  0.50%
AFR 0.38%
Range 0.27% to 0.50%

Selected cohort evidence
Scroll for all evidence ->
+----------------------------->
| MODEL | TB | AFR | RANGE | ...
| WUH...| 22 |0.38%|0.27 to...
+----------------------------->

Source
Backblaze Drive Stats
Period
Q1 2026
Inclusion rule
More than 100 drives and
more than 10,000 drive days
Snapshot
backblaze-q1-2026-
reviewed-2026-08-23
Range method
poisson-normal-v1

[Dataset] [Source report]
[      Share selection      ]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Period
[Q1 2026] [Annual 2025] [Lifetime]
Model or manufacturer
[WUH722222ALE6L4                                              ]
> Filter model list
34 available cohorts
[cohort locator, no AFR columns]
Select one to three cohorts to inspect their observed result.

INVALID CAPACITY
v Filter model list
Minimum capacity  [24]  <- focus after attempted selection
Maximum capacity  [16]
Minimum capacity must not exceed maximum capacity.
[locator and result withheld]

LOADING OR CALCULATING
Not rendered. The bundled snapshot filters synchronously.

EMPTY
0 matching cohorts
No cohorts match these filters.
[Reset filters]

PARTIAL, ANNUAL MODEL SEARCH
0 matching model cohorts
Annual 2025 has a fleet summary but no model rows in this snapshot.
[period choices remain visible]

PARTIAL, RESTORED SHARE
Some shared selections were not available in this snapshot.
[valid restored selection and evidence remain]

FAILURE
Drive data is unavailable.
Open the Backblaze dataset or source report.
[Dataset] [Source report]

EXPANDED FILTERS
v Filter model list
Manufacturer      [All manufacturers]
Minimum capacity  [16] TB
Maximum capacity  [22] TB
[ ] Show below-threshold cohorts   <- only when such rows exist
```

## Removed or rejected

- Remove automatic selection of `resolution.primary` after any search or filter intent. A filtered first row is not a deliberate answer and makes AFR sorting look like a recommendation.
- Stop ordering the locator by AFR. Put the fleet summary first, then order model rows by manufacturer and model.
- Remove AFR, failures, and drive days from the cohort locator. Those exact facts belong in the selected plot and evidence table.
- Remove the separate model answer heading, evidence badge, large AFR block, five-cell metric grid, and second comparison table. They repeat one selected result across too many regions.
- Keep one selection action per row. Do not split it into `Inspect` and `Compare` actions that create competing flows.
- Remove `Drive days, failures, and evidence range.` from the form heading. The selected result shows those facts and the page introduction already states the job.
- Move `Snapshot backblaze-q1-2026-reviewed-2026-08-23` out of the form header and into quiet result metadata.
- Hide the below-threshold checkbox when the active period has no rows it can reveal. The reviewed snapshot currently has no below-threshold rows in any period.
- Do not show the selected period, evidence label, source name, or match count in multiple badges, bars, and headings.
- Replace the current range strip with a zero-based labelled numeric axis. An unlabeled track does not let the reader verify position or compare ranges exactly.
- Do not use a progress bar, risk gauge, score, timeline, marker drawing, screenshot, or universal best-drive ranking.
- Do not turn warnings into colored panels or decorate them with a colored left edge.
- Do not offer Reset as recovery for an invalid bundled snapshot. Reset cannot repair source data.
- Remove the effect that serializes every input change into `?state=`. The clean route stays clean, and Share alone creates a stateful URL.
- Do not mutate an opened valid share URL as the person edits. Share copies a newly encoded state without changing browser history.
- Do not clear valid input after copy failure, no matches, or source failure.
- Do not wrap the form, locator, lead, plot, table, or metadata in separate cards. The full-width workbench and one result divider provide the structure.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | No lead appears on initial load or after broad filtering. One explicit row selection or one exact-match Enter action produces exactly one dominant selection-aware lead. | Browser role inspection and screenshots for initial, filtered, one-row, and three-row states. |
| UI-002 | deduplication | Selected technical facts appear in one evidence table. The locator has no AFR, range, failures, drive-days, count, or age columns, and no metric grid or second comparison table exists. | DOM column assertions and static source inspection. |
| UI-003 | visual-truth | The range figure uses one zero-based labelled percentage axis for all selected rows, plots point AFR and full interval bounds from the selected-row array, and never displays ranks or recommendation labels. | Fixture comparison between plotted coordinates, text labels, and evidence table values. |
| UI-004 | input | Period and model search remain visible. Manufacturer, capacity, and conditional below-threshold controls live inside `Filter model list`, and collapsed active values remain summarized. | Browser role and disclosure-state assertions. |
| UI-005 | validation | A minimum capacity above maximum, or a value outside 1 to 100 TB, shows one precise error, withholds locator and result rows, and focuses the first invalid field after Enter or attempted selection. | Keyboard-only Playwright fixtures. |
| UI-006 | selection | Selection is capped at three. A fourth attempt preserves the first three, keeps focus on the attempted action, and announces `Select up to three cohorts.` | Browser selection fixture and selected-row equality assertion. |
| UI-007 | stale-state | Changing period or applying a filter that excludes a selected row removes that row and its result before showing the new scope. No old AFR remains beside new controls. | Period and filter transition assertions. |
| UI-008 | partial-data | Annual 2025 exact-model searches state that this snapshot has only a fleet summary. Missing age reads `Not reported`. Below-threshold controls and warnings appear only when matching source rows exist. | Snapshot-backed annual, missing-age, and conditional-row fixtures. |
| UI-009 | metadata | Every selected result shows source name, active period and thresholds, checked date, snapshot version, interval method, dataset link, and report link once in quiet metadata. | Browser text and link assertions. |
| UI-010 | responsive | At 320px and 375px, task order matches desktop, locator actions remain reachable, the document has no horizontal overflow, and only the selected evidence table may scroll inside its named viewport. | Browser measurements with one and three selected rows in both themes. |
| UI-011 | accessibility | Period, search, disclosure, filters, row actions, plot description, evidence table, reset, Share, and all recovery paths work by keyboard with visible focus. Plot facts remain available as text and table values without relying on color. | Keyboard pass, accessible role assertions, and dark/light screenshots. |
| UI-012 | failure | Snapshot failure shows no AFR, plot, or table, does not offer Reset as repair, and keeps safe Backblaze source links available. | Invalid snapshot component fixture. |
| UI-013 | share | Share appears only after selection, copies a bounded versioned URL, announces success or failure, and leaves current inputs and result unchanged. | Clipboard success/failure fixtures and encoded-state unit assertions. |
| UI-014 | url | Opening `/drive-reliability` leaves the clean URL and history length unchanged through hydration. Ordinary edits and selection keep it clean. Only an explicit Share action creates a copied stateful URL, while an opened valid share URL remains intact until Reset. | Browser URL, history, and clipboard assertions. |

## Open questions and blockers

- None. The brief, current engine, reviewed snapshot, and existing share-state contract settle the visible inputs, selected result, comparison, failure behavior, and URL rules needed for implementation.
