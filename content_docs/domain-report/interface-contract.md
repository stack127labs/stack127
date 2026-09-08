# Interface contract: Domain Registration Report

Status: ready
Tool: Domain Registration Report
Route: `/domain-report`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:22ec1f4bb48539fd29d76d38d50e1a032bd907d811935ca901a057597b2a2d0d`

## User task

- Primary user: A domain operator investigating whether public registration facts and live nameserver delegation agree.
- Question: What did the registration and nameserver checks find, which observations need action, and which checks could not produce an answer?
- Lead answer: One natural summary of the completed checks, the most consequential finding, and any missing half of the report.
- Next decision: The operator can investigate a named mismatch in the focused tool, act on a registration risk, or retry an unavailable check without treating missing evidence as a clean result.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name | Which domain should this snapshot check? | User input normalized independently by `lookupDomain` and `checkDelegation` | input | One domain is the only user-controlled value supported by the current engine. | Do not add registrar, resolver, record-type, or TLD controls. |
| Run action | When should both remote checks start? | User submission | input | The checks are expensive and need one deliberate start and retry point. | No request while typing and no second primary action. |
| Snapshot summary | What is the report's answer? | `registration`, `delegation`, `findings`, `ranChecks`, and `skippedChecks` | lead | The user needs one honest conclusion before evidence or navigation. | Show one sentence block. Do not add an answer pill, count badge, hostname header, or second prose summary. |
| Completed and unavailable checks | Which halves of the report produced evidence? | `ranChecks`, `skippedChecks`, `registrationError`, `delegationError`, and registration status | supporting | A partial combined report is useful only when its missing scope is unmistakable. | Show each check once in a two-row table. Do not repeat the same list in summary metadata or a separate `What did not run` section. |
| Registration status | Did the registry publish a current record? | `registration.status` | supporting | Registered, not registered, no service, and request failure change how every registration finding reads. | State it in the summary or check table, not as a pill and repeated finding. Never equate not registered with available to buy. |
| Registrar | Which registrar does the completed registration check name? | `registration.registrar.name` | supporting | It makes the snapshot more useful and provides context for registration findings. | Include it once in the lead only when published. The full record belongs to Domain Registration Lookup. |
| Registry expiry | Is a published expiry close enough to require attention? | `registration.registryExpiryDate` and the `expiry-soon` finding | supporting | A near or passed registry date can require immediate account action. | Keep the exact date in the finding evidence. The lead may say it is close or passed but must not repeat the date. |
| Registry nameserver set | What nameservers are recorded with the registration? | `registration.nameservers[].hostname` | supporting | This is one of the three sets whose agreement is the report's main cross-source value. | Show each visible hostname once in the source comparison. A finding refers to the set rather than copying every name again. |
| Parent delegation set | Where does the parent zone direct resolvers? | `delegation.parentDelegatedNameservers` | supporting | It is the live handoff between the parent and the child zone. | Show once in the source comparison. Do not repeat it in a separate nameserver list. |
| Child-published set | What nameservers does the child zone publish about itself? | `delegation.childPublishedNameservers` | supporting | A difference from the registration or parent set exposes a partial nameserver change. | Show once in the source comparison. Do not repeat it in a separate nameserver list. |
| Nameserver-set agreement | Do the registration record, parent referral, and child zone agree? | Normalized set comparison plus `ns-match`, `ns-mismatch`, and `parent-mismatch` findings | supporting | This is the cross-source relationship unique to the combined report. | The diagram owns exact set membership. The lead and finding title may state the consequence without duplicating the lists. |
| Nameserver reachability | Did the discovered nameserver addresses answer over UDP and TCP? | `delegation.reachability` and delegation findings | supporting | Failure can explain broken or intermittent resolution. | Summarize exceptions as findings. Keep per-address transport records in the download rather than building a second diagnostic tool here. |
| Hold status | Does a registration hold explain absent DNS? | `registration.statuses` and the `hold` finding | supporting | This directly connects registration state to a DNS symptom. | Show once as a finding with the returned status in evidence. Do not copy the full status list. |
| DNSSEC delegation flag | Does the registration record say a DS record exists? | `registration.dnssecSigned`, `dsRecordCount`, and the `dnssec-signed` or `dnssec-unsigned` finding | supporting | It tells the operator whether validating resolvers are expected to check signatures. | Label it `DNSSEC delegation`, never `DNSSEC valid`, `working`, or `secure`. State once that this engine did not validate the chain. |
| Attention findings | What observation is likely broken or time-sensitive? | Findings with `state: attention` | supporting | These observations are the report's first action queue. | Use one ordered finding row per unique ID. No count pill, severity color panel, score, or repeated group intro. |
| Decision findings | What observation depends on the operator's intended configuration? | Findings with `state: decide` | supporting | These are choices rather than faults. | Use one ordered finding row per unique ID and no duplicated state label inside the row. |
| Context findings | What completed check confirmed useful background? | Findings with `state: context` | supporting | Context proves the check ran and records expected agreement without competing with action items. | Keep after action and decision findings. Omit generic context that only restates the check table. |
| Finding evidence source | Which system supports this observation? | Finding ID mapped to registration, DNS delegation, or both, plus `finding.evidence` | evidence | A combined report must keep source boundaries visible. | Add one source label and one evidence line to the finding. Do not repeat the full detail in metadata. |
| Focused investigation link | Where can the operator diagnose this observation properly? | `finding.tool` | supporting | The report locates issues; the dedicated tool performs the deeper check. | One text link in the matching finding only. Do not add a global button row with the same links. |
| Registration source freshness | When and from which RDAP services did the registration evidence come? | `registryFetch`, `registrarFetch`, their `fetchedAt`, URL, and cache state | evidence | Registration data can change and two providers may have different freshness. | One row per existing RDAP response. Do not repeat `registration.checkedAt` or the same host elsewhere as metadata. |
| DNS snapshot time and zone | What live DNS scope did the server observe? | `delegation.zone`, `parentZone`, and `delegation.checkedAt` | evidence | It defines the DNS snapshot and distinguishes it from worldwide resolver behavior. | One metadata row. Do not repeat the report completion time when it formats to the same visible value. |
| Snapshot vantage limitation | Is this worldwide propagation or monitoring? | Brief-backed limitation | evidence | The live result is one server-side snapshot, not history or every resolver's view. | State once beside source metadata. Do not repeat it in the lead and public supporting prose. |
| Report duration | How long did the request take? | `durationMs` | omit | Latency does not change the result and can distract from missing checks. | Do not put milliseconds in the answer or check table. |
| Combined completion time | When did report composition end? | `checkedAt` | omit | Source-specific times are more precise. The combined time is retained in the download. | Do not show a third timestamp when it duplicates DNS `checkedAt`. |
| Downloadable complete report | How can the operator retain normalized and raw evidence? | Complete `DomainReport` through `reportJson` | evidence | The report carries raw RDAP and DNS responses for tickets and later review. | Keep one secondary download action. Do not add copy, CSV, or a second report format. |
| Raw responses in the page | Can every nested provider payload stay open in the main reading flow? | RDAP and DNS raw response objects | omit | The combined payload is large and better preserved in the JSON download. | Do not render always-open JSON or duplicate the downloaded report in disclosures. |
| DNSSEC validation verdict | Does the DNSSEC chain validate? | Not produced by `buildDomainReport` | omit | The current engine reads only RDAP delegation state and does not run the DNSSEC validator. | Link a signed-delegation finding to `/dnssec-checker`; never invent a verdict. |
| CAA policy | Which certificate authorities may issue? | Not produced by `buildDomainReport` | omit | The current engine does not run the CAA checker. | Do not show CAA as run, skipped, or passed. Supporting content may link to `/caa-checker`. |
| Optional check selection | Which slow checks should be skipped? | Mentioned in `README.md`, absent from the API and engine contract | omit | A checkbox would imply control the request cannot honor. | Run the two current checks together until product planning and the engine define selectable checks. |
| Health score, grade, percentage, or security verdict | Is this domain healthy or secure overall? | No defensible source | omit | The report covers only registration and nameserver delegation, and valid setups vary. | Never summarize findings into a score, grade, progress bar, success shield, or `healthy` claim. |

Finding source rules:

- `ns-match`, `ns-mismatch`, and `parent-mismatch` are sourced to `Registration and DNS`.
- `dnssec-signed`, `dnssec-unsigned`, `hold`, and `expiry-soon` are sourced to `Registration record`.
- IDs beginning with `dns-` are sourced to `DNS delegation`.
- Keep an engine-provided evidence string when it adds an exact returned value. If it repeats the source-comparison diagram exactly, the diagram is the evidence and the row does not repeat the string.
- Deduplicate findings by stable `id`. Do not merge different IDs merely because their titles are similar.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name | required | yes | No default on the clean route. An explicit `?name=` may prefill from the opened URL. | visible | `ToolTextField` with `type="text"`, `inputMode="url"`, no capitalization, no autocomplete, and no spellcheck | It identifies the one registration record and DNS zone to check. The persistent label is `Domain name *` and the example is `example.com`. | Full width above the action. Its error stays directly below the field. |
| 2 | Run registration and DNS checks | primary action | not applicable | No default | visible | `ToolButton` primary submit labelled `Run the report` | It deliberately starts both expensive checks and remains the retry action. | Full width below the field with a stable hit height. |
| 3 | Investigate a finding | secondary action | no | `finding.tool` | result | Ordinary internal text link with the focused tool name | It continues the task for one specific observation. | Full-width link under the matching finding. Long labels wrap. |
| 4 | Download report | secondary action | no | Available after a structured report, including a partial report | result | `ToolDownloadAction` | It saves the complete normalized report and raw provider evidence. | Full width after interpreted findings and source metadata. |

Validation, URL, and keyboard behavior:

- Blank, no-TLD, suffix-only, IP, malformed, overlong, and invalid IDN input shows the precise shared domain-normalization error once below the field before the remote request starts.
- A submitted input error marks the field invalid, associates the message programmatically, focuses the field, and preserves the entered value. Editing clears that field error.
- Enter submits. Tab order is the field, primary action, returned finding links, and download action.
- The primary action retains its width, changes to `Running registration and DNS checks...`, exposes busy state, and blocks duplicate submission while loading.
- A later submission clears the old report immediately, so the previous domain's conclusion cannot be mistaken for the pending one.
- Opening `/domain-report` leaves the URL unchanged through server render and hydration. Opening an explicit `?name=` prefills the field without running a report. Submitting or editing does not rewrite the URL, and there is no Share action.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Snapshot summary | What did the completed checks conclude, and is any half missing? | Normalized domain, registration status, registrar name when published, most consequential attention finding, `ranChecks`, and `skippedChecks` | One page-owned lead sentence block or `ToolResultLead`. For two completed checks with no attention findings, say `No attention findings were found in the completed registration and nameserver-delegation checks for DOMAIN.` For partial or zero-check reports, name the unavailable scope before any positive statement. | Do not say `Nothing needs attention`, `healthy`, `secure`, or `all clear`. No hostname header, favicon, count badge, status pill, exact expiry date, or second summary. |
| 2 | Check coverage | Which checks completed and which could not produce evidence? | Fixed checks `Registration record` and `Nameserver delegation`, completion state, safe reason, and available source | `ToolDataTable` with `Check`, `State`, `Source`, and `Note`. Use `Completed`, `Unavailable`, or `Not run`; never call an upstream failure a user-skipped check. | Exactly two rows in current scope. CAA and DNSSEC validation do not appear because this engine never attempted them. The summary may name missing scope but must not repeat the reasons. |
| 3 | Nameserver source comparison | Do the registration record, parent referral, and child zone publish the same set? | Registry nameservers, parent-delegated nameservers, child-published nameservers, and normalized set differences | One page-owned semantic three-stage diagram: `Registration record`, `Parent referral`, `Child zone`. Each stage lists its distinct sorted names, or `Not published` / `Unavailable`. Connect stages in lookup order and mark agreement or difference in words. | Render only when at least two sources completed. Lines encode the real delegation path, not time or severity. Do not duplicate exact hostname sets in findings. |
| 4 | Needs attention | Which observations are likely broken or time-sensitive? | Deduplicated `attention` findings in engine order | A plain section with ordered page-owned finding rows. Each row has title, concise consequence, one source annotation, non-duplicate evidence, and an optional `Investigate with ...` link. | Omit the section when empty. No cards, colored backgrounds, left borders, pills, icons, severity labels, or group count. |
| 5 | Needs a decision | Which completed observations depend on intended configuration? | Deduplicated `decide` findings in engine order | Same finding-row structure under `Needs a decision` | Omit when empty. A DNSSEC delegation row says the report did not validate the chain and links to the validator. Do not imply a fault. |
| 6 | Context | What useful facts did completed checks confirm? | Deduplicated `context` findings in engine order | Same finding-row structure under `Context` | Omit when empty. Do not repeat check completion or exact source-comparison lists. |
| 7 | Source snapshot | Where and when was this evidence observed? | Existing RDAP source host, fetched time, cache state, DNS zone, parent zone, DNS checked time, and server-vantage limitation | Quiet page-owned metadata `dl`, one row per existing source followed by one sentence: `This is a snapshot from the stack127 server, not propagation history or every resolver's view.` | Source dates and hostnames appear here once. Do not repeat duration, combined `checkedAt`, application internals, or privacy copy. |
| 8 | Report action | How can the operator save the complete evidence? | Report version 1 with the complete `DomainReport` object | One secondary `Download report` action | It is available for complete and partial reports, never uses primary accent styling, and has no neighboring copy or format action. |

Read without internal documentation, a complete result says: `No attention findings were found in the completed registration and nameserver-delegation checks for stack127.com. The registration record names HOSTINGER operations, UAB as registrar.` The coverage table proves both checks completed. The source diagram shows the same two Cloudflare nameservers at the registration record, parent referral, and child zone. `Needs a decision` says DNSSEC is delegated but not validated here, then links to the DNSSEC Chain Checker. Source metadata defines freshness and vantage, and the download retains the complete evidence.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Lead summary | One conclusion across completed and unavailable checks | Not applicable. Reading order and type hierarchy make one sentence dominant. | Use one lead sentence block. |
| Three-source nameserver diagram | Registration settings flow into the parent referral, which directs resolvers to the child zone; their published sets should agree | Yes. Three ordered stages encode the actual delegation path. Names remain exact text, while connectors show the relationship only. | Use one semantic diagram when at least two sources are present. Stack the same order on narrow screens. |
| Check coverage table | Two checks share state, source, and note fields | Yes. Rows make missing scope explicit and comparable. | Use one two-row `ToolDataTable`. |
| Finding cards | Findings as separate equal products | No. Findings form one reading queue and have different action weight. | Replace with divided rows under semantic group headings. |
| Severity colors and pills | Severity or pass state | No. The engine provides attention, decision, and context grouping, not a calibrated severity scale. | Omit. Use headings, order, and semantic warning text only where the words carry meaning. |
| Score, grade, progress bar, or gauge | Overall domain health | No denominator or universal valid configuration exists. | Omit. |
| DNSSEC chain diagram | Actual validation from root to child | No. The current report engine does not run the validator. | Omit and link to `/dnssec-checker`. |
| Timeline | Changes or checks over time | No. The report is one point-in-time snapshot. | Omit. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Empty required field, enabled `Run the report` action, and no automatic request. An explicit `?name=` may prefill. | Absent | All result regions absent | No helper paragraph or error before submission | Normal document focus. Nothing announces on load. |
| Incomplete or invalid | Preserve the entered value and keep the action enabled | Absent. Clear an older result after an attempted invalid submission. | Absent | Show one precise field error below the input without calling the API | Focus the field, associate its error, and announce it once. |
| Loading, first report | Preserve submitted input, block duplicate submission, and retain button width | Absent | Absent | The same form remains the recovery point | Announce `Running registration and DNS checks...` through `ToolStatus`. Keep focus stable. |
| Loading, later report | Preserve new input and clear every previous result as soon as the request begins | Absent, so an older domain cannot read as the pending result | Clear coverage, diagram, findings, metadata, and download | Keep only the form and busy status visible | Announce loading politely. Do not move focus from the submit action. |
| Complete, attention finding | Preserve input and re-enable the action | Name the most consequential attention finding and confirm both checks completed | Show coverage, source diagram when applicable, attention findings first, decisions, context, metadata, and download | Each actionable finding links to its focused tool when the engine provides one | Announce the lead once. Keep focus in normal reading order. |
| Complete, no attention finding | Preserve input and re-enable the action | Say no attention findings were found in the two named completed checks | Show coverage, source comparison, decision and context findings, metadata, and download | Do not upgrade limited scope to an overall health verdict | Announce the lead once without success-green styling. |
| Registration not found | Preserve input and re-enable the action | Say no registration record was found. State separately whether DNS delegation completed. | Show two-row coverage, any DNS findings, metadata, and download. Show the diagram only when two source sets exist. | Never say the domain is available to register | Announce the lead once. |
| Registration unavailable, DNS complete | Preserve input and re-enable the action | Say the registration half is unavailable and summarize DNS only as DNS evidence | Coverage names the RDAP limitation. Show DNS findings, DNS metadata, and download. Omit the three-source diagram unless two DNS source stages exist. | Link a no-service reason to the TLD directory when the ending is known. Retry remains available. | Announce a partial-result warning once. |
| Registration complete, DNS unavailable | Preserve input and re-enable the action | Say the nameserver delegation half is unavailable and summarize registration only as registration evidence | Coverage names the DNS failure. Show registration findings, RDAP metadata, and download. Omit the three-source diagram unless two source stages exist. | Link to a focused registration tool only when a finding warrants it. Retry remains available. | Announce a partial-result warning once. |
| No check completed | Preserve input and re-enable the action | Say no registration or DNS conclusion is available | Show coverage with both reasons, any source metadata, and the downloadable failure evidence. Omit diagram and finding groups. | Give one retry instruction. Do not show `Nothing needs attention`. | Announce one warning or danger result. Keep focus in the retry flow. |
| Request rejected, rate-limited, timed out, or malformed response | Preserve input and re-enable the action | Absent | Absent | Show one safe request error beside the form and one retry instruction. Do not expose upstream implementation detail. | Announce one error. Keep focus in the retry flow unless the field itself is invalid. |
| Long evidence and narrow screen | Controls and lead remain first | Remains fully visible | Source names, hostnames, reasons, and finding links wrap. The coverage table keeps all columns reachable. | No content is clipped or covered | Normal reading order remains unchanged. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain input | `ToolTextField` | It preserves a persistent required label, programmatic error, input ref, and domain-entry behavior. | `ToolSearchField`, because the person enters one value rather than filtering a collection. |
| One expensive report request | `ToolButton` primary submit | It gives the two checks one deliberate start and stable busy label. | Automatic lookup, reset, or optional-check controls that the engine cannot honor. |
| One honest combined conclusion | `ToolResultLead` or page-owned sentence block | It makes coverage-aware natural language the first and only answer. | `ResultHeader`, favicon, state pills, and attention-count badges, because they delay or duplicate the conclusion. |
| Completed-check coverage | `ToolDataTable` | The two fixed checks have the same state, source, and note schema. | Pills or separate failure cards, because they hide missing scope and repeat status. |
| Registration-parent-child relationship | Page-owned semantic source diagram | No shared component represents three exact nameserver sets along the real delegation path. | Timeline or equal cards, because the relationship is not time and the sources are ordered. |
| Grouped findings | Page-owned semantic sections with divided rows | Findings need title, consequence, source, evidence, and one optional next-tool link without card chrome. | Finding cards, metric tiles, or colored callouts, because they create a dashboard and imply calibrated severity. |
| Request and partial status | `ToolStatus` | It provides polite loading and warning or danger announcement at the narrowest useful scope. | Repeated pills or duplicated form and result errors. |
| Source freshness | Page-owned metadata `dl` | Each source has a role, host or zone, fetched time, and optional cache state. | Another table or card group, because this is quiet evidence rather than a primary comparison. |
| Saved evidence | `ToolDownloadAction` | It provides the standard secondary download behavior for the complete report. | The current custom button, copy action, or always-open raw JSON. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | Full-width workbench band. The field uses the flexible column and the action aligns with its control. Results stack summary, coverage, diagram, findings, metadata, and download. The three-source diagram may run horizontally only when each name remains readable. | A 253-character ASCII domain, `this-domain-does-not-exist.invalid`, `edward.ns.cloudflare.com`, and a long provider failure reason | No page overflow. `ToolDataTable` alone may own horizontal overflow. |
| Narrow mobile, 320px to 640px | Field, error, and full-width action stack first. Results keep the same order. Diagram stages stack `Registration record`, `Parent referral`, `Child zone`, with vertical connectors. Finding title, consequence, evidence, and link stack without detached badges. | A long IDN in Unicode and A-label forms, six nameservers, a long registrar name, IPv6 addresses, and an unbroken provider host | Domain names, hostnames, evidence, and links wrap anywhere. `ToolDataTable` owns table overflow. The page never scrolls horizontally. |
| Large nameserver sets | Each diagram stage grows vertically and lists sorted distinct names. Only mismatched names receive an adjacent text marker such as `Only here`. | Thirteen 63-character nameserver hostnames across three sets | The diagram wraps names within its stage. It never becomes a page-wide code block or horizontal scroller. |
| Increased text size or long translations | Move the action below the field when the row no longer fits. Table viewport, diagram stages, finding rows, and links grow vertically. | `Registration record unavailable because no RDAP service is known for this ending` at 200 percent text size | The table viewport owns table overflow. No sibling covers a cell, link, or action. |

## Interface wireframes

### Desktop result

```text
Domain name *                                           [Run the report]
[stack127.com                                                           ]

----------------------------------------------------------------------------

No attention findings were found in the completed registration and
nameserver-delegation checks for stack127.com. The registration record names
HOSTINGER operations, UAB as registrar.

Checks in this report
Check                    State       Source                    Note
Registration record      Completed   rdap.verisign.com         Cached response
Nameserver delegation    Completed   stack127 server           Live DNS snapshot

Nameserver sources agree
[Registration record]       -> [Parent referral]       -> [Child zone]
edward.ns.cloudflare.com       edward.ns.cloudflare.com   edward.ns.cloudflare.com
jill.ns.cloudflare.com         jill.ns.cloudflare.com     jill.ns.cloudflare.com

Needs a decision
DNSSEC is delegated
The registration record contains one DS record. This report did not validate
the DNSSEC chain.
Source: Registration record
[Investigate with DNSSEC Chain Checker]

Context
The registration record, parent referral, and child zone agree on nameservers.
Source: Registration and DNS

Source snapshot
Registry RDAP       rdap.verisign.com, fetched 5 September 2026, cached
Registrar RDAP      rdap.hostinger.com, fetched 5 September 2026, cached
DNS delegation      stack127.com via parent .com, checked 5 September 2026

This is a snapshot from the stack127 server, not propagation history or every
resolver's view.

[Download report]
```

### Narrow mobile result

```text
Domain name *
[stack127.com                       ]
[           Run the report         ]

------------------------------------

No attention findings were found in
the completed registration and
nameserver-delegation checks for
stack127.com. The registration record
names HOSTINGER operations, UAB as
registrar.

Checks in this report
[scrollable table viewport]

Nameserver sources agree
[Registration record]
edward.ns.cloudflare.com
jill.ns.cloudflare.com
          |
[Parent referral]
edward.ns.cloudflare.com
jill.ns.cloudflare.com
          |
[Child zone]
edward.ns.cloudflare.com
jill.ns.cloudflare.com

Needs a decision
DNSSEC is delegated
The registration record contains one
DS record. This report did not validate
the DNSSEC chain.
Source: Registration record
[Investigate with DNSSEC Chain Checker]

Context
The three nameserver sources agree.

Source snapshot
Registry RDAP
rdap.verisign.com
Fetched 5 September 2026, cached

DNS delegation
stack127.com via parent .com
Checked 5 September 2026

This is a snapshot from the stack127
server, not propagation history or
every resolver's view.

[Download report]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain name *
[example.com                        ]
[           Run the report         ]

INVALID
Domain name *
[192.0.2.1                         ] <- focused, invalid
Enter a domain or hostname rather than an IP address.
[           Run the report         ]

LOADING, INCLUDING A LATER REPORT
Domain name *
[example.com                        ]
[ Running registration and DNS checks... ]
No earlier report remains visible.

NOT REGISTERED
No registration record was found for example.test. The nameserver delegation
check also found no live delegation. This does not prove the name is available.
[two-row coverage]
[source metadata]
[Download report]

PARTIAL
The registration check completed for example.com, but the nameserver delegation
check did not. No live DNS conclusion is available.
[coverage: Registration completed / Nameserver delegation unavailable]
[registration findings when present]
[RDAP source metadata]
[Download report]

NO CHECK COMPLETED
This report could not check example.invalid. No registration or DNS conclusion
is available.
[coverage with both safe failure reasons]
Try the report again.
[Download report]

REQUEST FAILURE
Domain name *
[example.com                        ]
The report could not run just now. Try again.
[           Run the report         ]
```

There is no expanded in-page raw-evidence state. The complete nested evidence is available through `Download report`.

## Removed or rejected

- Remove the favicon and duplicate hostname result header. A website icon is not registration or DNS evidence, and the lead already names the checked domain.
- Remove `Nothing needs attention` and attention-count pills. They duplicate the summary and turn incomplete scope into a false all-clear state.
- Remove check-count, group-count, and per-finding state pills. Headings and order already communicate the three finding groups.
- Replace nested finding cards with divided rows in one result flow. Equal bordered cards make context compete with action items.
- Remove the generic group introductions such as `Things that usually mean something is misconfigured`. The group heading and each finding's consequence already explain the meaning.
- Remove the separate `What did not run` card group. The fixed two-row check coverage table owns completed and unavailable scope.
- Remove elapsed milliseconds from the visible result. Source freshness and completed-check coverage are more useful.
- Clear the old result when a new run begins. Do not leave a prior domain's summary below a loading button.
- Reject a DNSSEC validation verdict, chain diagram, CAA result, or optional checkboxes until the engine actually runs or accepts those checks.
- Reject a score, grade, percentage, gauge, success shield, `healthy` label, and severity color scale.
- Reject a timeline because the report is one snapshot and no history exists.
- Reject always-open or in-page duplicated raw JSON. The one JSON download preserves complete evidence.
- Do not add a reset, share, copy, print, compare, monitoring, or alert action.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every structured report begins with one coverage-aware natural summary before tables, diagrams, findings, metadata, or actions. | Browser success, partial, and zero-check state inspection |
| UI-002 | truth | A report with one or two unavailable checks never says `Nothing needs attention`, `healthy`, `secure`, or `all clear`. | Browser partial and zero-check fixtures |
| UI-003 | coverage | The result has exactly two check rows, one each for `Registration record` and `Nameserver delegation`, with completed or unavailable state and a safe reason. | Browser and DOM inspection |
| UI-004 | deduplication | The result has no favicon header, hostname heading, answer pill, attention-count badge, or second summary. | Browser and DOM inspection |
| UI-005 | finding-deduplication | Each stable finding ID appears once under exactly one of `Needs attention`, `Needs a decision`, or `Context`, without a count or state pill. | DOM inspection with complete and mixed fixtures |
| UI-006 | evidence | Every finding visibly names `Registration record`, `DNS delegation`, or `Registration and DNS`, and keeps its focused-tool link within the same row. | Browser and DOM inspection |
| UI-007 | visual-truth | The nameserver diagram appears only with at least two available source sets, keeps the order registration, parent, child, and marks agreement or mismatch in text. | Browser complete, mismatch, and partial fixtures |
| UI-008 | dnssec-scope | A signed-delegation finding states that the report did not validate the chain and links to `/dnssec-checker`; no validation verdict appears. | Browser signed-delegation fixture and link assertion |
| UI-009 | invalid | Invalid input is preserved, marked invalid, associated with one precise inline error, and focused after submission without a network request. | Browser keyboard and request-count test |
| UI-010 | loading | First and later requests announce busy status, retain button width, block duplicate submission, and show no old report while loading. | Browser delayed-response test |
| UI-011 | partial | Registration-only, DNS-only, and zero-check reports name missing scope, retain completed evidence, expose one retry path, and allow JSON download. | Browser partial fixtures |
| UI-012 | responsive | At 320 CSS pixels, the control order is unchanged, diagram stages stack, long hostnames wrap, and only the coverage table viewport may scroll horizontally. | Browser width and overflow measurements |
| UI-013 | accessibility | Enter submits; focus stays visible; loading, field error, partial warning, and result lead are announced once; finding links follow result order. | Browser keyboard and accessibility inspection |
| UI-014 | source | Visible freshness uses each RDAP fetch time and DNS check time once, identifies cache state, and states the server snapshot limitation once. | Browser result inspection |
| UI-015 | download | Complete and partial results expose one secondary `Download report` action whose JSON retains the full `DomainReport`. | Browser download assertion and JSON inspection |
| UI-016 | url | Opening `/domain-report` leaves the URL unchanged through hydration; explicit `?name=` only prefills and neither editing nor submitting rewrites the URL. | Browser history and URL assertion |

## Open questions and blockers

- None. This retrofit is ready for the current `buildDomainReport` contract. DNSSEC validation, CAA policy, and user-selectable checks remain outside this interface until a product and engine change explicitly adds them.
