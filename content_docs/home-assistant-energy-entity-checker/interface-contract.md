# Interface contract: Home Assistant Energy Entity Eligibility Checker

Status: ready
Tool: Home Assistant Energy Entity Eligibility Checker
Route: `/home-assistant-energy-entity-checker`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A Home Assistant user whose sensor is missing from one Energy dashboard picker.
- Question: Do the current entity attributes match the chosen Energy field, and what still prevents a complete live-instance answer?
- Lead answer: Whether the attributes match the chosen Energy field.
- Next decision: Fix a failed attribute or check the named live-instance conditions in Home Assistant.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Intended Energy field | Which picker am I trying to use? | User-selected role | input | Device class, state class, and accepted units depend on this choice. | Keep all nine roles visible in one group; do not repeat the full role list near results. |
| Manual entity attributes | What does the entity report now? | Entity ID, state kind, device class, state class, and unit | input | These fields drive both conclusions and must remain inspectable after paste import. | Show each evaluated value once in the form and once only as received evidence in its rule row. |
| Counter behavior | Does `total_increasing` fit the real counter? | User-selected behavior plus state class and role | input | Home Assistant cannot infer physical reset or decrease behavior from copied attributes. | Hide it only for Power, where the engine marks it not applicable. Do not fold it into the Energy conclusion. |
| Pasted attributes | Can copied state attributes fill the form? | Optional local parser | input | Paste is a faster input method, not a separate evaluation mode. | Keep it in one disclosure and update the visible manual fields only after Import attributes. |
| Energy attribute conclusion | Do these attributes match the selected Energy field? | Energy conclusion plus selected role | lead | This is the user's immediate picker problem. | Render once as the first result sentence. Do not restate it in a second Energy card or table summary. |
| Statistics attribute conclusion | Do these attributes meet the long-term-statistics attribute contract? | Statistics conclusion | supporting | It is independent of the Energy picker result and can pass when Energy fails. | Keep one adjacent conclusion and do not merge it into an overall pass or fail. |
| Counter suitability | Does the declared counter behavior fit the chosen state class? | Counter status and reason | supporting | A matching attribute set can still have unknown or unsuitable counter behavior. | Show one sentence only when applicable. Do not create a third eligibility verdict. |
| Live-instance checks | What could this browser-only check not inspect? | Energy and statistics `instanceCheck`, plus fixed product boundaries | supporting | Picker validation, recorder state, statistics metadata, and stored-unit history need the real instance. | Attach each unchecked scope once to its conclusion. Remove the repeated standalone checklist. |
| Rule trace | Which exact fields passed or failed? | Ordered eligibility rules | evidence | Received and accepted values let the user correct failed metadata. | Keep one row per engine rule. Do not add separate cards for failed fields. |
| Deterministic correction | What exact replacement can the engine name? | `correction` field | omit | When present, it equals the table's single accepted value and would repeat that evidence. | The Accepted cell remains the sole correction source. Never invent a value for multi-option rules. |
| Rule reason | Why does the rule exist? | Rule `reason` field | omit | Field name, scope, and accepted values already make the compact trace actionable; the supporting guide owns explanations. | Do not add another table column or expandable prose row. |
| Provenance | Which pinned Home Assistant rules were checked? | Formula, Core, frontend, and source date | evidence | The local result is version-bounded. | Show one metadata line after the trace and nowhere else in the result. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Intended Energy field | defaulted input | yes | Grid import, from the current checker contract | visible first | `ToolChoiceGroup` with nine role options | It changes accepted device classes, state classes, and units. | Full-width wrapped group; options remain visible and keep source order. |
| 2 | Paste attributes | optional input | No until the explicit Import attributes action updates the evaluated fields | Empty | disclosure before manual fields | `ToolDisclosure` containing `ToolTextArea` | It speeds entry without hiding the values that will be evaluated. | Full-width disclosure and editor. |
| 3 | Import attributes | secondary action | yes, because it replaces supported evaluated fields | No default | disclosure below paste editor | `ToolButton` secondary | It makes paste parsing explicit and gives malformed input its own recovery step. | Full-width within the disclosure at 390px and below. |
| 4 | Entity ID | defaulted input | yes | `sensor.grid_import`, from the current checker | visible | `ToolTextField` | The domain before the first dot must be `sensor`. | Full-width field. |
| 5 | Current state | defaulted input | yes | Numeric, from the current checker | visible | `ToolSelect` | The current state must be numeric for both checks. | Full-width field. |
| 6 | Device class | defaulted input | yes | `energy`, from the current checker | visible | `ToolTextField` | Exact user-entered text must be checked, including wrong case and missing values. | Full-width field. |
| 7 | State class | defaulted input | yes | `total`, from the current checker | visible | `ToolTextField` | It affects both Energy and statistics conclusions. | Full-width field. |
| 8 | Unit | defaulted input | yes | `kWh`, from the current checker | visible | `ToolTextField` | Comparison is character-sensitive, so free text must remain possible. | Full-width field. |
| 9 | Counter behavior | conditional defaulted input, required outside Power | no, it affects only counter suitability | Never resets, from the current checker | conditional after Unit; omitted for Power | `ToolSelect` | The user must declare behavior that attributes cannot prove. | Full-width field when shown. |
| 10 | Reset | secondary action | yes, because it restores every default and clears results | Current checker defaults | visible in final action row | `ToolButton` secondary with reset icon | It provides full recovery from imported or edited values. | Full-width before the primary action. |
| 11 | Check entity | primary action | not applicable | No default | visible at the end of the form | `ToolButton` primary inside `ToolActionRow` | Explicit evaluation prevents transient results while users edit exact strings. | Full-width final action. |

`Check entity` is the only accent-filled action. Enter may submit from single-line fields and selects, but it inserts a newline in the paste editor. Any evaluated input change clears the full result immediately. Editing pasted text also clears a result because a later import may replace the visible fields, but it does not alter those fields until Import attributes succeeds.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Energy field answer | Do the supplied attributes match the selected Energy field? | Energy status plus human-readable role | One focusable `ToolResultLead` sentence: `Attributes match Grid import.` or `Attributes do not match Grid import.` | This is the only Energy conclusion. Do not add an Energy summary card with the same status. |
| 2 | Long-term statistics answer | Do the attributes meet the local statistics contract? | Statistics status | A distinct supporting section beside the lead on wide screens: `Statistics attributes match.` or `Statistics attributes do not match.` | Never merge it with Energy into one overall status or give it the same visual weight as the lead. |
| 3 | Instance boundary | What remains unverified for each conclusion? | Fixed scope limits and `not_inspected` status | One concise line under each conclusion. Energy names live Energy validation; statistics names recorder inclusion, statistic metadata, and stored-unit history. | Remove the separate three-item `not checked` list and do not repeat `not checked` in the lead sentence. |
| 4 | Counter suitability | Does counter behavior fit the declared state class? | Counter status and reason | One `ToolStatus` sentence below the paired conclusions with neutral, success, warning, or danger tone | Omit when `not_applicable`. Never change the Energy or statistics conclusion from this status. |
| 5 | Attribute rule trace | Which checks passed or failed, and what values are accepted? | Ordered scope, field, received, accepted values, and pass or fail | One responsive semantic table with stable engine order; failed rows use text plus semantic tone | Do not sort failures first, truncate authoritative accepted values, or render correction and reason duplicates. |
| 6 | Rule provenance | Which pinned contract produced this result? | Core version, frontend version, formula version, and source date | One subdued metadata line after the rule table | Do not repeat provenance in both conclusion columns or every rule row. |

The two conclusions share one band because they answer related but independent questions. The Energy conclusion occupies the first and wider column. On narrow screens, Energy remains first and statistics follows. A neutral divider separates results from inputs; neither conclusion sits in a decorative card.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Paired conclusion band | Energy and statistics can differ for the same attributes | Yes. Separate adjacent regions communicate independence while shared alignment ties them to one evaluation. | Use an asymmetric two-column band, with the Energy lead wider; stack in the same order on narrow screens. |
| Rule trace table | Repeated scope, rule, received value, accepted values, and result | Yes. Rows preserve evaluation order and columns align comparable fields. | Use on desktop and turn each semantic row into labelled fields on narrow screens. |
| Overall pass meter | Progress toward eligibility | No. There is no meaningful denominator, and some checks remain unavailable in the browser. | Omit progress bars, percentages, scores, and pass-count summaries. |
| Energy versus statistics chart | Magnitude or change between conclusions | No. The outputs are categorical and independent, not numeric quantities. | Omit charts and allocation bars. |
| Flow diagram or marker art | Attribute dependency and live checks | No. Exact rule rows carry the decision better than approximate geometry. | Omit diagrams and marker art from the workbench. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Grid import and current valid defaults are visible; paste disclosure is closed; Reset and Check entity are available | Absent until explicit submission | Absent | No placeholder or unsolicited warning | Natural document focus and no announcement. Clean route stays unchanged through hydration. |
| Successful import | Paste disclosure remains open; only supported supplied fields update; role and counter behavior keep their values | Absent | `Attributes imported` notice names the fields that changed | Edit visible fields or paste again | Focus stays on Import attributes and a polite status announces the imported fields. |
| Invalid or empty paste | Manual fields retain their previous values; result is absent | Absent | Paste error only | Keep text, show exact parse recovery, and allow another Import | Focus paste editor, set invalid semantics, and announce the paste error once. |
| Matching attributes | All fields and actions remain visible | `Attributes match <role>.` | Statistics conclusion, scoped uninspected lines, applicable counter status, trace, provenance | Edit a field to clear results or reset | Focus the result band and announce the Energy lead once. |
| Energy fails, statistics matches | All fields remain visible | `Attributes do not match <role>.` | Statistics still says its attributes match; failed Energy rows show exact received and accepted values | Correct a field and recheck | Focus and announce only the Energy lead. Do not announce an overall failure. |
| Missing manual values | Empty strings remain visible and evaluation still runs | Energy does not match | Statistics may match or fail according to its own rules; trace says `missing` | Use Accepted values to fill the fields, then recheck | Treat as a valid calculated result, not a form syntax error. |
| Unknown counter behavior | Inputs remain visible | Energy result remains based only on attributes | Warning says counter behavior still needs verification | Choose known behavior if available or check the real sensor history | Focus stays on result; the lead announcement does not claim counter suitability. |
| Invalid form boundary | Drafts remain; all stale result content is absent | Absent | Absent | Show the first exact length or enum error instead of generic `Configuration is invalid` | Focus the first invalid visible control and announce one recovery summary. |
| Loading | Inputs remain unchanged | Not applicable | Not applicable | Evaluation is synchronous and local; show no spinner, skeleton, disabled wait state, or progress text | No loading announcement. |
| Partial | Inputs remain unchanged | Local Energy attribute answer is present | Statistics attribute answer and scoped `not inspected` lines make the boundary explicit | The tool cannot complete live checks; the named Home Assistant checks are the next step | Announce the Energy lead only. Partial is a valid bounded result, not an error. |
| Runtime failure | All inputs remain and all stale result regions are removed | Absent | One concise failure status and Try again action | `The check could not run. Your inputs are still here.` | Focus failure region and announce once with danger semantics. |
| Unsupported `state` query | Default inputs stay clean; only `state` is removed | Absent | Neutral `Shared inputs are not supported.` notice | Use the form normally | Preserve all other query keys and hash with `history.replaceState`; do not force focus. |
| Long received value | Input remains editable up to its field limit | Normal bounded answer | Trace shows at most 120 visible characters with an ellipsis and provides the safe full value to assistive technology | Edit or reset normally | Truncation has a programmatic full-value equivalent and never changes accepted values. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Nine visible Energy roles | `ToolChoiceGroup` | It preserves one labelled radio group, native selected state, wrapping, and shared focus treatment. | A select or combobox hides the role matrix and slows comparison between adjacent roles. |
| Optional paste importer | `ToolDisclosure` containing `ToolTextArea` and `ToolButton` | Paste is an optional shortcut; the visible manual fields remain the evaluated source of truth. | A permanent full-width paste editor competes with the fields on every visit; mode tabs would hide the values that import actually changes. |
| Exact manual strings | `ToolTextField` | It preserves wrong case and missing values so the checker can diagnose them. | Role-dependent selects would prevent users from testing the metadata they actually have. |
| State and counter enums | `ToolSelect` | Each has a small closed vocabulary and one current value. | Free-text inputs would create states the engine does not accept; many radio buttons would overload the already choice-heavy form. |
| Form actions | `ToolActionRow` and `ToolButton` | They keep one primary action, one secondary reset, shared target size, and predictable wrapping. | Custom buttons repeat shared styling and state behavior. |
| Energy lead and statistics support | Focusable page-owned conclusion band containing `ToolResultLead` for Energy and a quieter statistics section | The information model needs two independent conclusions with one clear lead. | Two equal `ToolPrimaryResult` blocks would create two leads; a single combined status would be technically false. |
| Counter result and failure | `ToolStatus` | Its semantic tones and live behavior fit a separate suitability status and a retryable failure. | A metric card implies a scored result; a colored paragraph without status semantics relies too much on color. |
| Rule evidence | Page-owned responsive semantic table using shared tokens | It keeps exact evaluation order and must stack rather than scroll at narrow widths. | `ToolDataTable` currently owns horizontal scrolling, which conflicts with the brief's labelled narrow rows. |

The shared textarea must expose a textarea ref and developer-text props before adoption so invalid paste can focus the editor and spellcheck remains off. If that shared API is not ready, keep the page-owned native textarea until it is. Do not trade recovery behavior for superficial component reuse.

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop, above 760px | Visible role group, optional paste disclosure, three-column manual field grid, action row, asymmetric Energy and statistics band, counter status, trace table, provenance | A 120-character visible received value and the full Energy unit list | Paste editor owns its text overflow. Trace cells wrap; the page has no horizontal overflow. |
| Tablet, 391px to 760px | Roles wrap, paste stays full width, manual fields use one column, actions follow fields, conclusions stack Energy first, then trace rows | `individual_device`, `total_increasing`, and the accepted Energy-unit list | Text inputs own long entry; all result values wrap within the workbench. |
| Narrow mobile, 320px to 390px | Role choices and every control use full width; source order stays role, paste, manual fields, Reset, Check entity, Energy, statistics, counter, trace, provenance | A 255-character entity ID and a 64-character class string | Inputs scroll internally. Rule rows stack as Scope, Rule, Received, Accepted, Result without page overflow. |
| 200% zoom or long translated labels | Controls and conclusion content grow vertically; no label shares a fixed row with an input | The live-instance sentence under statistics | The workbench height grows; no clipping or document-level horizontal scroll. |

## Interface wireframes

### Desktop result

```text
Home Assistant Energy Entity Eligibility Checker
Check whether copied sensor attributes fit one Energy field.

Intended Energy field
[Grid import] [Grid export] [Solar] [Battery charge] [Battery discharge]
[Individual device] [Power] [Gas] [Water]

[>] Paste attributes

Entity ID                 Current state              Device class
[sensor.grid_import    ]  [Numeric                ]  [energy             ]
State class               Unit                       Counter behavior
[total                 ]  [kWh                    ]  [Never resets       ]
Inputs stay in this browser.                               [Reset] [Check entity]
--------------------------------------------------------------------------------
Attributes match Grid import.             Long-term statistics
Live Energy validation: not inspected     Statistics attributes match.
                                           Recorder, metadata, and stored units:
                                           not inspected

Counter behavior fits `total`.

Checks       Rule            Received        Accepted                    Result
Both         Domain          sensor          sensor                      Pass
Both         Current state   numeric         numeric                     Pass
Energy       Device class    energy          energy                      Pass
Energy       State class     total           total, total_increasing     Pass
Energy       Unit            kWh             J, kJ, MJ, ... Gcal         Pass
Statistics   State class     total           measurement, ...            Pass

Core 2026.8.1 | Frontend 20260729.6 | Formula v1 | Checked 2026-08-09
```

### Narrow mobile result

```text
Home Assistant Energy Entity
Eligibility Checker

Intended Energy field
[Grid import                 ]
[Grid export                 ]
[Solar                       ]
[Battery charge              ]
[Battery discharge           ]
[Individual device           ]
[Power                       ]
[Gas                         ]
[Water                       ]

[>] Paste attributes

Entity ID
[sensor.grid_import          ]
Current state
[Numeric                     ]
Device class
[energy                      ]
State class
[measurement                 ]
Unit
[W                           ]
Counter behavior
[Never resets               ]
[Reset                       ]
[Check entity                ]
------------------------------
Attributes do not match
Grid import.
Live Energy validation:
not inspected
------------------------------
Long-term statistics
Statistics attributes match.
Recorder, metadata, and stored
units: not inspected
------------------------------
Checks: Energy
Rule: Device class
Received: power
Accepted: energy
Result: Fail
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

Initial state shows the valid current defaults and no result placeholder. The paste disclosure is the only expanded state. It reveals the importer without hiding the manual fields:

```text
[v] Paste attributes
+--------------------------------------+
| entity_id: sensor.grid_import        |
| state: 42.1                          |
| device_class: energy                 |
| state_class: total                   |
| unit_of_measurement: kWh             |
+--------------------------------------+
[Import attributes]
Attributes imported: entity ID, current state, device class, state class, unit.
```

Empty manual strings are calculated missing values, not syntax errors:

```text
Attributes do not match Grid import.

Checks    Rule           Received    Accepted                  Result
Both      Domain         missing     sensor                    Fail
Energy    Device class   missing     energy                    Fail
Energy    State class    missing     total, total_increasing   Fail
Energy    Unit           missing     J, kJ, MJ, ...            Fail
```

Invalid paste and runtime failure remove every stale result:

```text
Paste attributes
+--------------------------------------+
| device_class: energy                 |
| device_class: power                  |
+--------------------------------------+
Remove duplicate supported keys.
[Import attributes]

The check could not run. Your inputs are still here. [Try again]
```

Loading does not exist because the local formula returns synchronously. Partial is the normal successful boundary. Each conclusion states what the browser did not inspect. There is no partial-data placeholder, spinner, result skeleton, or automatic retry.

## Removed or rejected

- Remove the second Energy conclusion block because it repeats the lead answer.
- Remove the standalone `Statistics metadata`, `Stored units`, and `Energy validation` checklist. Attach each uninspected boundary once to the conclusion it limits.
- Move the optional paste importer into a disclosure. Keep all evaluated fields visible after import.
- Replace custom roles, fields, selects, actions, and status styling with shared tool controls where the required focus and exact-text behavior are available.
- Do not add an overall eligible or ineligible verdict. Energy attributes, statistics attributes, and counter suitability remain separate.
- Do not count passed rules, show a score, or use a progress bar. Live checks make any completion percentage false.
- Do not show the engine's deterministic correction beside a one-value Accepted cell. Those values are identical.
- Do not add YAML generation, a live Home Assistant connection, entity-registry import, saved history, share URLs, clipboard import, automatic update checks, charts, screenshots, diagrams, marker art, or decorative result cards.
- Do not use colored left borders or rely on green and red without the words Pass and Fail.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A valid submission puts one focusable Energy sentence first and names the selected role; no second region repeats that Energy status. | Browser focus, text, and duplicate-content assertions. |
| UI-002 | deduplication | Each live-instance limitation appears under only the conclusion it limits, the old standalone checklist is absent, and deterministic correction does not repeat a one-value Accepted cell. | DOM text counts and source inspection. |
| UI-003 | visual-truth | Energy and statistics remain separate; the rule table preserves engine order and full accepted values; no combined status, score, chart, or progress visual appears. | Fixture comparison and DOM inspection. |
| UI-004 | responsive | At 320px, 375px, 760px, desktop, and 200% zoom, the form and results keep the specified order, trace rows stack, and the page has no horizontal overflow. | Browser measurements and screenshots in both themes. |
| UI-005 | url | Opening `/home-assistant-energy-entity-checker` leaves the clean canonical URL unchanged through hydration; only an explicit unsupported `state` key is removed while other query keys and the hash remain. | Browser history and URL assertion. |
| UI-006 | inputs | All nine roles stay visible; every defaulted result-driving field stays visible; Counter behavior appears outside Power; paste stays an optional importer disclosure. | Accessible role and control assertions across role changes. |
| UI-007 | action | `Check entity` is the only accent action; Reset and Import attributes are secondary; Enter submits only outside the multiline paste editor. | Keyboard and computed-style Browser checks. |
| UI-008 | stale-state | Changing any evaluated field, role, counter behavior, or pasted text removes all conclusions, counter status, trace, and provenance before another check. | Browser interaction regression. |
| UI-009 | independence | A Grid import entity with `power`, `measurement`, and `W` shows Energy mismatch first while statistics still says its attributes match. | Engine fixture and Browser text assertion. |
| UI-010 | paste | Valid paste changes only supplied supported fields and announces which changed; malformed, duplicate, oversized, nested, or unsafe paste changes no manual field and focuses the paste editor. | Parser and Browser state assertions. |
| UI-011 | counter | Unknown or decreasing `total_increasing` behavior produces its own warning or failure without changing either attribute conclusion or suggesting a state class. | Engine fixture and Browser status assertion. |
| UI-012 | empty | Cleared manual strings produce a fresh result with `missing` received values; empty paste fails only when Import attributes is pressed. | Browser result and paste recovery tests. |
| UI-013 | evidence | The trace shows scope, rule, received, accepted, and text Pass or Fail for every rule in stable order, with safe long-value truncation and a programmatic full value. | Browser table, accessibility tree, and long-value fixture. |
| UI-014 | accessibility | Labels, errors, result focus, disclosure state, live announcements, textual statuses, 44px targets, and visible focus work without color. | Keyboard, accessibility tree, and manual screen-reader checks. |
| UI-015 | failure | An invalid form or runtime exception clears stale output, preserves inputs, focuses the correct recovery region, and never shows loading or partial rows. | Injected-boundary Browser tests. |
| UI-016 | components | Role, paste, text, select, action, and status behavior use shared tool controls without losing exact text entry or invalid-focus recovery. | Source inspection, shared component tests, and Browser recovery tests. |

## Open questions and blockers

- None. The existing engine and tests define every result state, input limit, role dependency, and live-instance boundary needed for this retrofit. The contract changes hierarchy and control presentation only; it does not change the formula or public content.
