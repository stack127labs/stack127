# Interface contract: Domain Expiry Checker

Status: ready
Tool: Domain Expiry Checker
Route: `/domain-expiry`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A domain owner or prospective buyer checking one domain before deciding whether to renew it, contact the registrar, or monitor it.
- Question: When does this domain expire, what expiry state is it in, and what can happen next?
- Lead answer: One state-aware verdict that shows time until or since registry expiry, an expiry lifecycle state, or an honest unavailable or unknown result.
- Next decision: The person can renew or contact the registrar, wait for a later lifecycle stage, or stop treating the published expiry date as an availability date.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name | Which domain should I check? | User input, normalized by the domain lookup engine | input | One domain is the only decision needed to run the lookup. | Do not add TLD, registrar, or lifecycle controls. |
| Lookup action | When should the checker query RDAP? | User submission | input | A remote request needs one explicit action and retry point. | No second primary action or automatic lookup while typing. |
| State-aware expiry verdict | What is true about this domain's expiry now? | `status`, expiry-related statuses, `registryExpiryDate`, and a fresh day difference | lead | This is the answer the person came for. It adapts to registered, expired, grace, redemption, pending delete, unknown, not registered, and request-unavailable outcomes. | Render one lead output only. Do not repeat its state in a pill, heading, or summary card. |
| Normalized Unicode domain | Which domain does the answer describe? | `query.unicode` | supporting | It ties the verdict to the normalized name, especially after URL or IDN normalization. | Keep it in the lead detail. Do not add a separate result header. |
| Registry expiry date | What exact date did the registry publish? | Registry `expiration` event as `registryExpiryDate` | supporting | The exact registry date anchors the relative duration without predicting deletion. | Show it in the lead detail. Repeat it only inside the conditional two-date comparison when the displayed registry and registrar dates differ. |
| Time until or since registry expiry | How far away is the registry date? | Fresh `daysBetween` and `humanDuration` calculation | supporting | The relative duration makes the date actionable. | It is part of the lead verdict, never a progress bar, timeline label, or second metric. |
| Current lifecycle stage | Is the domain in normal registration, auto-renew grace, redemption, or pending delete? | Derived from expiry-related RDAP statuses | supporting | The stage changes whether restoration or registration is possible. | Use it as the lead value when an expiry stage is present and as the sole `aria-current` marker in the stage list. |
| Registrar expiry date | Does the registrar publish a materially different date? | Registrar `registrar expiration` event as `registrarExpiryDate` | supporting | A different displayed calendar date can expose renewal synchronization risk. | Omit the comparison when either value is missing or both format to the same date. Do not treat the registrar date as the deletion date. |
| Conditional post-expiry stages | What may happen after expiry? | Policy-backed fixed content from the brief | supporting | The ordered stages explain consequences without pretending to predict a schedule. | Show one ordered stage list. Do not restate the same stages in prose, a diagram, or a timeline. |
| Expiry-related EPP statuses | What registry status supports the lifecycle answer? | Filtered `statuses` plus `lookupStatus` | evidence | These codes verify grace, hold, redemption, restore, or deletion conditions when returned. | Show only expiry-related rows. Do not show unrelated transfer, update, or delete locks here. |
| Registry source host | Who published the registry response? | Host parsed from `registryFetch.url` | evidence | The source lets the person judge provenance. | Show once in quiet metadata, not in the lead or page introduction. |
| Fetch date and cache flag | When did stack127 retrieve this answer? | `registryFetch.fetchedAt` and `registryFetch.fromCache` | evidence | Freshness matters for a changing lifecycle state. | Keep it in one metadata row. Do not repeat `checkedAt`. |
| Registry database update date | When did the registry last update its own data? | `registryDatabaseUpdated` | evidence | It separates provider data age from stack127 fetch time when available. | Show only in metadata and only when present. |
| Lookup notes | What qualification or partial-fetch issue affected this result? | `notes` | evidence | Notes preserve engine warnings without interrupting a valid lead answer. | Omit the disclosure when empty. Do not repeat a request error or ordinary lifecycle caveat here. |
| Downloadable report | How can I keep the returned evidence? | `reportJson` over the complete result | evidence | A JSON download supports later verification without crowding the reading path. | Keep it a secondary action after the answer, never a primary or accent action. |
| Raw registry and registrar responses | What did each RDAP server return? | `registryFetch.body`, `registrarFetch.body`, or fetch error | evidence | Contained raw responses are the final proof and help diagnose partial data. | One disclosure per existing source. Do not render raw JSON open by default. |
| Coverage source, operator, bootstrap URL, and unknown-TLD flag | How did the engine find RDAP coverage? | `coverage` | omit | These routing facts do not change the expiry decision and remain available in the report. | Do not create a coverage card or metadata row in the workbench. |
| Raw query fields other than normalized Unicode domain | How did normalization parse the input? | `query.input`, `domain`, `tld`, `suffix`, `reduced`, `isIdn`, and `guessedSuffix` | omit | They are useful to the engine and report, not to this result hierarchy. | Do not add normalization badges or a parsed-input table. |
| `checkedAt` and request duration | When did the whole application finish and how long did it take? | Lookup engine | omit | Registry fetch time is the clearer freshness fact, and latency does not affect the answer. | Do not add performance metadata. |
| Registration, re-registration, changed, transfer, locked, deletion, and other events | What else happened in the registration record? | `registrationDate`, `reregistrationDate`, `lastChangedDate`, `transferDate`, `lockedDate`, and `events` | omit | These belong to the broader domain registration lookup and would dilute the expiry task. | Do not add a registration timeline or event table. |
| Nameservers and DNSSEC | How is the domain delegated and signed? | `nameservers`, `dnssecSigned`, and `dsRecordCount` | omit | DNS configuration does not answer the expiry question. | Keep these facts in the downloadable and raw evidence only. |
| Registrar identity and contacts | Who sponsors the domain? | `registrar` and `entities` | omit | This tool cannot know the account's renewal settings, payment state, or internal grace policy. | Do not imply that displayed registrar data can confirm auto-renew. |
| Redaction records | What contact information did the service redact? | `redactions` and `redactionDeclared` | omit | Redaction does not affect the expiry answer. | Keep it in the report and raw evidence, not a visible result region. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name | required | yes | No default, user supplied | visible | `ToolTextField` with `type="text"`, `inputMode="url"`, no capitalization, no autocomplete, and no spellcheck | It identifies the one record to check. The persistent label is `Domain name *` and the example is `example.com`. | Full width above the button. The error stays directly below the field. |
| 2 | Check domain expiry | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It starts the remote lookup and names the answer it will produce. | Full width below the field with the same comfortable hit height. |
| 3 | Download report | secondary action | no | Available only after success | result | `ToolDownloadAction` | It saves evidence after a result exists. | Full width after result details and before raw disclosures. |
| 4 | Expand lookup notes or raw response | optional evidence action | no | Closed by default | disclosure | `ToolDisclosure` trigger | It exposes optional evidence without competing with the verdict. | One full-width row per disclosure. Expanded content stays within that row. |

Validation and keyboard behavior:

- Submitting blank or whitespace-only input shows `Enter a domain name.` once below the field and focuses that field.
- Editing the field clears the field error. Enter submits the form. Tab order is field, primary action, result actions, then disclosure triggers.
- The primary action retains its width, changes to `Checking domain expiry...`, exposes busy state, and blocks duplicate submission while loading.
- Do not disable submission before the person tries it. The precise inline error explains what is missing.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Expiry verdict | What is true about this domain's expiry now? | Domain, registry expiry date, fresh relative duration, lookup status, and derived lifecycle stage | `ToolPrimaryResult` as the only dominant output. Use `Time until registry expiry`, `Time since registry expiry`, `Expiry state`, `Registry expiry`, or `Domain expiry` as the accessible label. | One verdict only. It owns the exact registry date except for the justified date mismatch comparison. |
| 2 | Published expiry date difference | Why do the registry and registrar dates disagree? | Formatted registry and registrar expiry dates | `ToolMetricGroup` with two values followed by `Confirm the renewal deadline with your registrar.` Render only when both displayed dates exist and differ. | No comparison for equal displayed dates or missing values. Do not add a third date or choose the later value. |
| 3 | Typical path after expiry | What stages may follow expiry and what does each permit? | Grace period, redemption, pending delete, and released stage label, typical length, and consequence | Page-owned semantic ordered list with column headings on desktop and stacked rows on mobile. Mark the current returned stage with `aria-current="step"`. | This is not a schedule. No dates, connector line, equal-distance geometry, release prediction, or percentage. |
| 4 | Expiry status evidence | Which expiry-related EPP codes did the registry return? | Filtered EPP spelling and known meaning | `ToolDataTable` with `EPP status` and `Meaning`, only when at least one matching status exists. | Omit unrelated statuses and omit the whole table when there are no expiry statuses. |
| 5 | Source and freshness | Which registry answered, and how old is the evidence? | Registry hostname, fetch date, cache state, and optional registry database date | Quiet page-owned `dl` using small mono metadata. | Do not promote metadata into cards or repeat application `checkedAt`. |
| 6 | Lookup qualifications | Did the engine return a note that changes how I should trust this otherwise valid answer? | `notes` | `ToolDisclosure` titled `Lookup notes`, omitted when empty. | Notes do not repeat the lead, lifecycle explanation, or request error. |
| 7 | Report action | How can I save this lookup? | Complete normalized result serialized as report version 1 | One secondary `Download report` action. | No share, copy, or second download format unless a later product decision adds it. |
| 8 | Raw RDAP evidence | What did the registry or registrar actually return? | Each existing fetch body or fetch error | One collapsed `ToolRawOutput` per source, after all interpreted results. | Raw output owns its own horizontal and vertical overflow. It never opens automatically. |

Read without internal reports, the result says: `example.com expires 13 August 2027, with about 11 months remaining.` The date comparison explains a real provider disagreement, the stage list explains what may happen after expiry, the EPP table verifies a returned expiry state, and the final metadata and disclosures show provenance.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large lead answer | The single current expiry conclusion | Not applicable. Hierarchy, not geometry, makes the conclusion dominant. | Use one `ToolPrimaryResult`. |
| Ordered stage list | Conditional lifecycle order, typical duration, and consequence | Yes. Row order encodes sequence while text carries duration, so spacing makes no claim about elapsed time. | Use a page-owned ordered list with current-stage emphasis. |
| Two-value date comparison | A material difference between registry and registrar calendar dates | Yes. Aligned repeated fields support exact comparison without implying a timeline. | Use `ToolMetricGroup` only when both formatted dates differ. |
| EPP status table | Repeated status codes with the same two fields | Yes. Rows consistently map code to meaning. | Use `ToolDataTable` only when matching statuses exist. |
| Timeline | Uneven, conditional post-expiry stages | No. Equal positions or connector lengths would imply a reliable time axis and schedule. | Omit. Do not use `ToolTimeline`. |
| Progress bar | Progress toward expiry or release | No. There is no stable start point, denominator, or promised release event. | Omit. Do not use `ToolProgressBar` or the older registration-term bar. |
| Predicted release date | When a domain will become available | No. Registrar deletion timing, registry release behavior, and drop catching prevent a reliable prediction. | Omit the value and explain the limitation in supporting content. |
| Cards for each fact | Relative importance among result facts | No. Equal boxes would make evidence compete with the verdict. | Omit nested cards. Use spacing, rows, one divider, and type hierarchy. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Empty domain field and enabled `Check domain expiry` button | Absent | All result regions absent | No error or helper paragraph | Normal document focus order; nothing announces on load. |
| Invalid | Preserve entered whitespace or invalid value and keep submit enabled | Absent | Absent | Show one field-scoped message at the narrowest useful location | Focus the domain field and announce its error through the field semantics. |
| Loading, first lookup | Preserve the input, disable duplicate submission, and change the fixed-width button label to `Checking domain expiry...` | Absent | Absent | The same button is the retry point if the request later fails | Announce loading through busy state and a polite status. Do not move focus. |
| Loading, later lookup | Preserve the edited input and disable duplicate submission | Hide the previous verdict because it belongs to a different submitted query | Hide all previous supporting and evidence regions | Do not label old values as current or leave them visible beside a changed domain | Announce loading politely. Keep focus where the person initiated submission. |
| Registered success | Preserve the submitted normalized input and re-enable submit | Show time until registry expiry, or time since it when the date has passed without an expiry status | Show the conditional stage list, conditional date mismatch, conditional EPP evidence, metadata, report, and raw evidence | The same input and button support another check | Announce the result region politely, then leave focus on the initiating control. |
| Expiry-stage success | Preserve input and re-enable submit | Show `Auto-renew grace`, `Redemption period`, or `Pending delete` with the consequence in the detail | Mark exactly one matching stage, then show returned EPP evidence and normal source evidence | Do not claim registration availability during grace, redemption, or pending delete | Announce the verdict. Semantic danger or warning text conveys meaning without a tinted panel. |
| Empty or not registered | Preserve input and re-enable submit | Show `Not registered` and state that there is no current expiry date | Omit stage list, date comparison, and status table. Keep source metadata, report, and raw evidence when returned | Do not translate this result into `available`; registration eligibility is outside this tool | Announce the lead result. |
| No RDAP service | Preserve input and re-enable submit | Show `Unavailable` and name the missing RDAP service for the TLD | Omit lifecycle and status evidence. Keep report or raw evidence only when the engine returned it | Retry remains possible, but the message must not imply the domain is free | Announce the warning verdict. |
| Partial, registered without registry expiry | Preserve input and re-enable submit | Show `Unknown` and state that the registry does not publish an expiry date | Show the stage list, source metadata, any expiry statuses, notes, report, and raw evidence that exist. Do not substitute a lone registrar date for the registry date. | Lookup notes hold source-specific failures or qualifications | Announce the lead result, then allow disclosure triggers in normal order. |
| Request failure | Preserve valid input and re-enable the primary action | Absent | Clear the previous result and evidence so they cannot be mistaken for the failed query | Show the request error once below the form and keep `Check domain expiry` as retry | `ToolStatus` announces the error. Do not move focus away from the retry flow. |
| Expanded evidence | Inputs and lead remain unchanged | Remains visible above | Open only the chosen notes or raw response disclosure | Its trigger closes it. A long raw value scrolls inside the raw viewport | Disclosure semantics announce expansion; keyboard focus stays on the trigger unless the person tabs into content. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain input | `ToolTextField` | It keeps a visible required label, native text entry, field error, and focus behavior. | `ToolSearchField`, because the person is looking up one value rather than filtering a collection. |
| One lookup action | `ToolButton` primary submit | It names the result and supports disabled and busy states without adding another interaction. | Auto-submit and a second reset button, because they weaken the single deliberate action. |
| Dominant verdict | `ToolPrimaryResult` | It gives one accessible output label, one large value, and one plain detail sentence. | Status pill plus result header, because both would repeat the same state and domain. |
| Different registry and registrar dates | `ToolMetricGroup` | Two aligned values make a real mismatch easy to compare. | Timeline, because provider dates are not stages on one sequence. |
| Conditional lifecycle explanation | Page-owned semantic `ol` | The tool needs stage, typical length, consequence, and optional current-step semantics without time geometry. | `ToolTimeline`, because equal spacing would falsely encode duration and certainty. |
| Expiry status proof | `ToolDataTable` | Every returned code has the same status and meaning fields. | Cards, because repeated records compare better as rows. |
| Source details | Page-owned `dl` | A few metadata pairs need quiet wrapping rather than a result component. | `ToolMetricGroup`, because provenance should not look like another answer. |
| Optional notes and evidence | `ToolDisclosure` and `ToolRawOutput` | They keep diagnostic detail contained while preserving keyboard and expansion semantics. | Always-open JSON or a modal, because both interrupt the answer-first reading path. |
| Saved evidence | `ToolDownloadAction` inside `ToolActionRow` | It is a familiar secondary action and produces the existing JSON report. | Primary button styling, copy action, and multiple formats, because none helps answer the expiry question. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | Full-width workbench band. Inside it, the labeled field takes the flexible column and the button aligns with the control. Results stack in contract order, with the stage list using three columns. | `this-is-a-deliberately-long-registered-domain-name.example` plus `13 September 2027`; raw RDAP URLs may exceed 250 characters. | No page overflow. `ToolDataTable` and each raw viewport own their horizontal overflow. |
| Narrow mobile, 320px to 640px | Field, error row, and full-width button stack in task order. Result order does not change. Each stage row puts stage and typical length on the first row and consequence below. Metadata becomes a vertical list. | A 253-character ASCII domain, a long Unicode domain, `The registry returned this status without a known explanation.`, and an unbroken raw evidence URL. | Input, lead detail, metadata, and meanings wrap. The status table and raw viewport alone may scroll horizontally. |
| Expanded raw evidence at any width | Disclosure stays in the normal result flow. Its contained viewport caps height and scrolls without widening the workbench. | A complete registry JSON response with nested notices and unbroken self links. | The raw viewport owns both horizontal and vertical overflow. The page never does. |
| Increased text size or long translations | Keep the domain field above the action when a shared row no longer fits. Buttons may grow vertically but do not clip labels. | `Checking domain expiry...` and `Registrar may renew or delete` at 200 percent text size. | Text wraps within controls and rows. No sibling may cover a table column or action. |

## Interface wireframes

### Desktop result

```text
Domain name *                                      [Check domain expiry]
[example.com                                                        ]

--------------------------------------------------------------------

Time until registry expiry
11 months
example.com, expires 13 August 2027.

Typical path after expiry
Stage                 Typical length        What it means
1 Grace period        Up to 45 days         Registrar may renew or delete
2 Redemption          30 days               Previous owner can restore
3 Pending delete      5 days                Cannot be restored
4 Released            No fixed time         May become registrable. Release time varies

Registry  rdap.verisign.com     Fetched  5 September 2026
Registry data  5 September 2026

                                                    [Download report]
> Registry response
```

When the two provider dates differ, insert this between the lead and stage list:

```text
Registry expiry                 Registrar expiry
13 August 2027                  2 September 2027
Confirm the renewal deadline with your registrar.
```

### Narrow mobile result

```text
Domain name *
[example.com                         ]
[        Check domain expiry        ]

-------------------------------------

Time until registry expiry
11 months
example.com, expires
13 August 2027.

Typical path after expiry
Grace period          Up to 45 days
Registrar may renew or delete
-------------------------------------
Redemption                 30 days
Previous owner can restore
-------------------------------------
Pending delete               5 days
Cannot be restored
-------------------------------------
Released              No fixed time
May become registrable.
Release time varies

Registry
rdap.verisign.com
Fetched
5 September 2026

[          Download report          ]
> Registry response
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain name *
[example.com                         ]
[        Check domain expiry        ]

INVALID
Domain name *
[                                    ]  <- focus
Enter a domain name.
[        Check domain expiry        ]

LOADING
Domain name *
[example.com                         ]
[      Checking domain expiry...    ]  disabled, busy
Checking domain expiry...                 polite status

EMPTY OR NO MATCH
Domain expiry
Not registered
example.com has no current expiry date.

PARTIAL
Registry expiry
Unknown
The registry for .example does not publish an expiry date.
[Typical path after expiry]
> Lookup notes
> Registry response

FAILURE
Domain name *
[example.com                         ]
[        Check domain expiry        ]
The registry did not answer properly. Try again shortly.

EXPANDED EVIDENCE
v Registry response
+------------------------------------+
| {                                  |
|   "objectClassName": "domain",   |
|   "self": "https://rdap..."      | -> contained horizontal scroll
| }                                  |
+------------------------------------+
```

## Removed or rejected

- Remove the old result header, state pill, and standalone answer paragraph. `ToolPrimaryResult` already owns the domain, state, and consequence.
- Do not show a registration-term progress bar. A registration start date is not a stable denominator for expiry risk.
- Do not draw the post-expiry path as a timeline. The stages are conditional and their durations are uneven.
- Do not predict a release or availability date. RDAP cannot establish registrar deletion timing, registry batching, or drop-catching outcome.
- Do not show a second registry date block when the registrar date is absent or formats to the same calendar date.
- Do not expose unrelated registration events, DNSSEC, nameservers, registrar contacts, coverage routing, redactions, or request duration in the interpreted result.
- Do not add lifecycle filters, registrar selection, auto-renew controls, reset, share, or copy actions. The engine cannot answer the hidden account questions those controls would suggest.
- Do not wrap the form, verdict, stage list, evidence table, or metadata in separate cards. The one workbench band and its internal divider supply the structure.
- Do not keep the previous domain's result visible during a new lookup. A stale verdict beside edited input can be mistaken for the new domain's answer.
- Do not duplicate request errors below the field, near the button, and in the result region. Each error appears once at its narrowest useful scope.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed lookup displays exactly one dominant lead result, and no state pill, result header, or second answer repeats it. | Browser role inspection and screenshot for registered, redemption, not registered, unknown, and unavailable fixtures. |
| UI-002 | deduplication | The registry expiry date appears only once for a normal single-date result. A two-value comparison appears only when both provider dates exist and their formatted dates differ. | Playwright fixtures for registry-only, same-day, and different-day values. |
| UI-003 | visual-truth | The lifecycle uses an ordered stage list, never a timeline, progress bar, predicted release date, or equal-distance connector. | DOM inspection and static source test. |
| UI-004 | interaction | Blank submission focuses the domain field and announces `Enter a domain name.` exactly once; a request failure preserves the valid input and exposes one retry path. | Keyboard-only Playwright test and accessible role assertions. |
| UI-005 | state | First and later loading states announce progress, block duplicate submission, and do not leave a previous domain result visible as if it belonged to the new input. | Delayed-response Playwright fixture with two different domain names. |
| UI-006 | responsive | At 320px wide, controls and result regions keep the same reading order, the page has no horizontal overflow, and any EPP table or raw JSON overflow stays inside its own viewport. | Browser measurement using long domain, long status meaning, and unbroken raw URL fixtures. |
| UI-007 | evidence | Expiry-related EPP evidence appears only when matching statuses exist, and unrelated domain statuses never enter the table. | Playwright fixtures with mixed and empty status arrays. |
| UI-008 | metadata | Source hostname and fetch date remain visible as quiet metadata after any returned result with a registry fetch; empty notes and absent registrar responses create no blank disclosure rows. | Browser role and text assertions across complete and partial fixtures. |
| UI-009 | accessibility | All controls, download action, disclosure triggers, contained raw output, and retry flow work by keyboard with visible focus in dark and light themes. | Keyboard pass and theme screenshots at desktop and mobile widths. |
| UI-010 | url | Opening `/domain-expiry` without a query string leaves the URL unchanged through hydration. | Browser URL and history assertion. |

## Open questions and blockers

- None. The brief and current engine settle the input, lead answer, evidence hierarchy, omissions, and state-specific copy needed for implementation.
