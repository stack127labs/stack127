# Interface contract: SOA Consistency Checker

Status: ready
Tool: SOA Consistency Checker
Route: `/soa-checker`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:6635d4c44eb703f35f4321c3fe3ab8096f3b98489fa66a5bedef523f05b1d91c`

## User task

- Primary user: A DNS operator finding a stale secondary or conflicting SOA data across authoritative nameserver addresses.
- Question: Do all checked authoritative nameserver addresses return the same SOA values, and which serial is newest under RFC 1982 when they differ?
- Lead answer: One comparison sentence that confirms full agreement, names the newest serial and differing fields, or says why the comparison is incomplete or serial order is undefined.
- Next decision: The operator can wait for a normal transfer, repair a stale or unreachable secondary, reconcile changed SOA fields, or retry from a checker that can reach skipped addresses.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain or hostname | Which name should stack127 map to its authoritative zone? | User input normalized by `normalizeDiagnosticName` | input | One name is enough to discover the zone and its authoritative server addresses. | Do not add separate zone or nameserver inputs. |
| Compare action | When should stack127 discover the zone and query every available authoritative address? | User submission | input | Direct network checks can take several seconds and need one deliberate start and retry point. | Do not auto-run while typing or add another primary action. |
| SOA comparison sentence | Do the checked authoritative replies agree, which serial is newest, or why is the answer incomplete? | `query.zone`, checked observations, grouped SOA records, `summary`, and RFC 1982 comparisons | lead | This is the diagnosis the operator came for. | Render one lead sentence. Do not repeat it as a hostname heading, status badge, or summary card. |
| Discovered zone | Which zone did the input map to? | `query.zone` | supporting | The result concerns the zone apex, which may differ from the submitted hostname. | Name it in the lead and table caption. Do not add a separate zone card. |
| Submitted name | Which input produced this zone? | `query.inputName` | evidence | It remains visible in the form and belongs in the downloaded report. | Do not add a second result heading for it. |
| Observation hostname | Which authoritative nameserver did stack127 ask? | `observations[].server.hostname` | supporting | A stale copy is repaired at a specific server. | Show once in the comparison row. Do not repeat it as a card heading and table cell. |
| Observation addresses | Which IPv4 or IPv6 addresses returned this exact result? | `observations[].server.address` grouped by `groupSoaObservations` | supporting | Identical results from one hostname may share one row, while different values need separate rows. | Group only when hostname, authority state, SOA values, and error match. Never merge different serials or timing values. |
| Checker-side IPv6 skip | Which address was not queried because this runtime lacks IPv6 connectivity? | `ipv6Connectivity` and `skippedReason` | supporting | A checker limitation must not look like a domain failure or disappear from scope. | Keep a skipped row with no SOA values. Do not call it no reply. |
| Authoritative state | Did the responding address claim authority for the zone? | `observations[].authoritative` | supporting | A non-authoritative SOA cannot prove the authoritative copy. | Show one exact state per grouped row. Do not let a returned record hide a false authority state. |
| Observation error | Why did an address fail to return an SOA? | `observations[].error` | supporting | The operator needs the safe failure reason to repair or retry the server. | Show once in the row. Do not repeat the same error above and below the table. |
| SOA owner | Which zone name does the returned record cover? | `soa.ownerName` | evidence | It verifies that the response belongs to the expected zone apex. | Show one table column. Do not repeat it in prose for every matching row. |
| Serial | Which version marker did this source return? | `soa.serial` | supporting | Serial agreement and RFC 1982 order are the main stale-secondary evidence. | Show exact unsigned values once per grouped row. Do not plot them on a linear scale. |
| Newest serial | Which distinct serial is newer under RFC 1982? | `summary.newestSerial` verified against pairwise `compareSerials` results | supporting | A numerically smaller value may be newer after wraparound. | Name it only in the lead when ordering is defined. Do not add a newest-serial metric card. |
| Undefined serial order | Can RFC 1982 order the returned serials safely? | Pairwise `compareSerials` over distinct available serials | supporting | A difference of exactly 2,147,483,648 is undefined, and wider multi-value sets may lack one unambiguous newest value. | Say ordering is undefined. Never guess from ordinary numeric size or `summary.newestSerial` alone. |
| Primary nameserver | Which MNAME does each SOA record publish? | `soa.primaryNameserver` | supporting | A changed primary may explain transfer or maintenance differences. | Use the table label `Primary, MNAME`. Do not add a separate definition inside the workbench. |
| Responsible mailbox | Which RNAME does each SOA record publish? | `soa.responsibleMailbox` | supporting | Different contact data still means the SOA records disagree. | Use the table label `Mailbox, RNAME`. Keep the longer explanation in supporting Markdown. |
| Refresh | How often should a secondary ask for updates? | `soa.refreshSeconds` | supporting | A difference changes transfer behavior and must remain visible. | Show exact seconds once in the table. Do not score it against a universal ideal. |
| Retry | How long should a secondary wait after a failed refresh? | `soa.retrySeconds` | supporting | A difference changes recovery behavior. | Show exact seconds once in the table. Do not turn it into a recommendation. |
| Expire | How long may a secondary serve without reaching the primary? | `soa.expireSeconds` | supporting | A difference changes how long stale data may remain served. | Show exact seconds once in the table. Do not add a progress bar. |
| MINIMUM | What MINIMUM field did each source return? | `soa.minimumSeconds` | supporting | The raw field must remain visible and participates in negative-cache time. | Show `MINIMUM` separately. Do not relabel it as negative-cache time. |
| SOA TTL | What TTL did each source attach to the SOA record? | `soa.ttlSeconds` | supporting | The brief requires it, and it may be lower than MINIMUM. | Show `Not reported` for null. Do not omit the column because values match. |
| Negative-cache time | What is the upper cache time derived for negative answers? | `negativeCacheTtlSeconds` as the lower of SOA TTL and MINIMUM | supporting | This is the useful derived value, and MINIMUM alone is not the answer. | Show the derived value beside both source fields. Do not repeat it in another summary. |
| Differing fields | Which SOA fields differ across usable authoritative records? | `summary.differences` plus comparison of owner, serial, SOA TTL, and derived negative-cache time | supporting | The operator needs to know whether the issue is only serial or also record content and timers. | Name differing fields in the lead, then use table emphasis for exact cells. Do not add a second differences list. |
| Identical grouped observations | Which addresses returned the same complete record from one hostname? | `groupSoaObservations` | supporting | Grouping reduces duplicate rows without hiding address coverage. | List every grouped address in one cell. Never group across hostname, authority state, error, or any SOA field. |
| Raw UDP and TCP responses | What full replies support each normalized observation? | `observations[].rawResponses` | evidence | Raw evidence verifies the record and preserves transport-specific replies. | Keep one contained disclosure grouped by hostname and address. Do not show raw JSON by default. |
| Complete report download | How can the operator save every observation, summary field, and raw reply? | `diagnosticReportJson` over the full result | evidence | The report preserves skipped addresses and all raw evidence. | Offer one download action. Do not add a second page-level full JSON dump. |
| Checked time and duration | When did stack127 run the comparison, and how long did it take? | `checkedAt` and `durationMs` | evidence | Quiet timing separates fresh evidence from a saved report. | Show each once after the evidence. Do not use metric cards. |
| Website favicon | Which website icon responds for the submitted hostname? | Third-party favicon request | omit | It does not verify SOA consistency and may fail independently. | Do not reserve a favicon slot in the result. |
| UDP and TCP reachability detail | Did each transport answer independently? | Raw observation responses and separate nameserver checker | omit | This tool compares SOA content and authoritative state. The nameserver checker owns transport diagnosis. | Preserve raw replies and safe observation errors, but do not add UDP and TCP columns here. |
| Universal timing grades | Are refresh, retry, and expire values ideal? | No reliable source in the engine | omit | Zones choose timings for different operational needs. | Do not add healthy ranges, grades, or warning thresholds. |

The lead uses a fixed order. No usable authoritative SOA records means the comparison is incomplete. Any checked address with no authoritative SOA also makes it incomplete and is named first. When all checked addresses returned authoritative records, compare every SOA field. A serial mismatch names an unambiguous newest serial only after RFC 1982 pairwise checks succeed. Undefined order is stated plainly. Matching serials with another differing field still count as SOA disagreement. Full agreement requires every available authoritative record field to match. Skipped IPv6 addresses limit scope but do not count as failed domain replies.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain or hostname | required | yes | No default on the clean route. An explicitly opened `name` query parameter may prefill it. | visible | `ToolTextField` with text input, URL input mode, no capitalization, no autocomplete, and no spellcheck | It supplies the name used to discover the authoritative zone. The persistent label is `Domain or hostname *`, and the example is `cloudflare.com`. | Full width first. Its error remains directly below the field. |
| 2 | Compare SOA records | primary action | not applicable | No default. The user submits the form. | visible | Primary `ToolButton` submit | It starts zone discovery and the bounded comparison, then provides the retry path. | Full width below the field. Keep the loading width stable. |
| 3 | Download report | secondary action | no | Generated only from a completed API result | result | Secondary `ToolDownloadAction` | It preserves all normalized observations, summary fields, skipped addresses, and raw replies. | Full width below the lead on narrow screens. |

Enter in the hostname field submits. Blank or whitespace submission shows `Enter a domain or hostname.` below the field and focuses it. A server-side invalid-name message uses the same field scope. Timeout, rate-limit, service, and other request errors appear once below the action through `ToolStatus`.

During a request, the primary action keeps its width, changes to `Comparing SOA records...`, exposes busy state, and blocks duplicate submission. Editing the hostname after an error clears the error. The entered value survives every failure.

Opening `/soa-checker` leaves the address unchanged through server render and hydration. An explicitly opened `name` query parameter may prefill the field, and that query string stays unchanged. Editing and submission do not serialize the name or result into the URL. There is no Share action because SOA evidence changes and the dated report is the durable output.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | SOA comparison | Do all checked authoritative records agree, and which serial is newest when they do not? | Zone, checked observations, complete SOA field comparison, `summary`, and RFC 1982 ordering | One `ToolResultLead` sentence. It prioritizes missing authoritative evidence, then serial order, then other field differences, then full agreement. | No submitted-hostname heading, favicon, status badge, score, or separate newest-serial card. Never describe no data as different serials. |
| 2 | SOA comparison table | What exact record and source produced each agreement or difference? | Exact groups from `groupSoaObservations`, plus skipped observations | One `ToolDataTable` with source, addresses, check state, authority, owner, serial, MNAME, RNAME, refresh, retry, expire, MINIMUM, SOA TTL, and negative-cache time. Rows with differing values use semantic text and accessible difference labels. | Group only exact matches from one hostname. Keep skipped and failed observations as explicit rows. The table viewport owns horizontal overflow. |
| 3 | Raw response evidence | Which UDP and TCP replies support each normalized row? | Every observation's hostname, address, skipped state, error, and `rawResponses` | One `ToolDisclosure` labeled `Raw SOA responses`. Inside, group `ToolRawOutput` by exact hostname and address, with UDP before TCP. | Keep collapsed by default. A skipped or missing response says `No response captured` instead of showing unlabeled null. |
| 4 | Complete report | How can the operator save every normalized field and raw reply? | Full result serialized by `diagnosticReportJson` | One secondary `ToolDownloadAction` associated with the lead | Report success only after the browser starts the download. Do not make it a second primary action. |
| 5 | Run metadata | When did this comparison run, and how long did it take? | `checkedAt` and `durationMs` | Quiet page-owned `dl` in small mono text after result evidence | Show each value once. Do not repeat duration in the lead or a metric card. |

Read without the internal reports, a disagreement says: `SOA records for example.com disagree. RFC 1982 identifies serial 0 as newest; serial and refresh differ across the checked authoritative replies.` The table shows which nameserver addresses returned `4,294,967,295` and `0`, plus every MNAME, RNAME, timing, TTL, and derived negative-cache value. The raw disclosure verifies those rows, the download preserves the complete result, and the final metadata states when the check ran.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large comparison sentence | The one conclusion about completeness, agreement, and RFC 1982 order | Not applicable. Reading order and type hierarchy make it dominant. | Use one `ToolResultLead`. Semantic text may mark `Agree`, `Disagree`, `Incomplete`, or `Undefined order`. |
| Wide SOA comparison table | Repeated authoritative observations with the same source and SOA fields | Yes. Columns align every value and expose exact differences across rows. | Use one `ToolDataTable` with a contained horizontal viewport. |
| Equal record cards | One record per grouped source | No. Separate boxes make scanning twelve repeated fields harder and hide column differences. | Replace the current cards with the table. |
| Linear serial chart | Numerical distance or age between serial values | No. RFC 1982 serials wrap and have a partial order, so ordinary line or bar geometry can be false. | Omit. Use exact serials and a comparison sentence. |
| Timeline | Time between SOA versions | No. The result has no publication time for a serial and no per-version timestamps. | Omit. Do not imply that serial order measures elapsed time. |
| Progress bar | Transfer progress toward the newest copy | No. The checker receives no transfer start, end, or denominator. | Omit. |
| Timing-range gauge | Whether refresh, retry, or expire is good | No. The engine has no universal target range or policy context. | Omit. Show exact values without grades. |
| Favicon | Website identity as SOA evidence | No. It can load or fail independently of authoritative DNS consistency. | Omit from the result. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean route | Empty hostname and enabled `Compare SOA records` | Absent | All result regions absent | No instructional or empty-state panel | Normal document focus order. Nothing announces on load. The URL stays `/soa-checker`. |
| Initial explicit query state | Prefilled hostname from the opened URL | Absent | All result regions absent | The tool does not submit automatically | Normal focus order. Do not announce the prefill or rewrite the query string. |
| Invalid blank input | Preserve the blank or whitespace value | Absent | Absent | Show `Enter a domain or hostname.` once below the field | Focus the hostname field and connect the message through field error semantics. |
| Invalid hostname from server | Preserve the submitted value | Absent | Clear any previous result | Show the precise invalid-name message once below the field | Focus the hostname field. Do not add a duplicate request error. |
| Loading first comparison | Preserve input, disable duplicate submission, and label the button `Comparing SOA records...` | Absent | Absent | The same primary action becomes the retry point after failure | Announce loading politely and expose busy state. Do not move focus. |
| Loading later comparison | Preserve the edited hostname and disable duplicate submission | Clear the prior lead because it describes another submitted name | Clear the prior table, raw evidence, and metadata | Never leave stale SOA values beside a changed hostname | Announce loading politely. Keep focus on the initiating control. |
| Full agreement | Preserve input and re-enable submit | State that every checked address returned an authoritative SOA and all record fields agree, naming the shared serial | Show all exact groups, including every address, then raw evidence, download, and metadata | The form remains ready for another comparison | Announce the lead politely. Do not move focus into results. |
| Serial disagreement with defined newest | Preserve input and re-enable submit | Name the zone, newest serial under RFC 1982, and every other differing field | Show every record group. Mark cells that differ from the newest complete record without using color alone. | The operator can identify which server rows need to catch up | Announce the disagreement as a warning. |
| Serial wraparound | Preserve input and re-enable submit | State the RFC 1982 result even when the newest serial is numerically smaller, such as `0` after `4,294,967,295` | Show exact unsigned serials in the table | Do not use ordinary numeric sort or greater-than language | Announce the same disagreement lead. No extra wraparound alert is needed. |
| Undefined serial order | Preserve input and re-enable submit | Say that the returned serials differ but RFC 1982 cannot order them unambiguously | Show every serial and other SOA field. Do not mark one row newest. | The operator must inspect the update process and source configuration | Announce as a warning. Never guess from `summary.newestSerial`. |
| Same serial, other fields differ | Preserve input and re-enable submit | Say that serials match but name, mailbox, timer, TTL, or negative-cache values differ, naming the fields | Mark exact differing cells in the table | The operator can reconcile the conflicting SOA content | Announce as a warning. Never call matching serials full agreement. |
| One or more checked addresses failed | Preserve input and re-enable submit | Say the comparison is incomplete and name the first hostname, address, and safe failure reason | Show successful groups and explicit failed rows together | Retry remains available. Successful rows must not hide missing evidence. | Announce incomplete state as a warning or error. Leave focus in the form flow. |
| Reply is not authoritative | Preserve input and re-enable submit | Say the comparison is incomplete because the exact address did not return an authoritative SOA for the zone | Show the returned SOA when present, with `Not authoritative` in the same row | The nameserver checker is the focused follow-up for authority or reachability faults | Announce incomplete state as an error. |
| IPv6 skipped while checked rows succeed | Preserve input and re-enable submit | State agreement only across the addresses this checker could query | Keep each skipped IPv6 address visible with `Skipped by checker: no IPv6 route` and empty SOA cells | Do not count skipped rows as domain failures or hide them from scope | Announce the comparison once. The checker limitation is quiet context in the row. |
| Every address skipped | Preserve input and re-enable submit | Say that no SOA comparison could be completed because this checker lacked a route to every discovered address | Show skipped rows and no invented SOA values | Retry may work from a checker with IPv6 connectivity | Announce incomplete state as a warning. Never call the records equal. |
| No observations or no usable SOA | Preserve input and re-enable submit | Say that no authoritative SOA records were available and agreement is unknown | Omit a blank comparison table. Keep raw evidence, download, and metadata when present. | The form remains the retry path | Announce incomplete state as a warning. Never say that serials differ. |
| Request, timeout, or rate-limit failure | Preserve the input and re-enable submit | Absent | Clear any previous result so it cannot be mistaken for this request | Show the server message once below the action. `Compare SOA records` remains the retry path. | Announce through `ToolStatus` with error semantics. Keep focus in the form flow. |
| Expanded raw evidence | Input, lead, and table remain unchanged | Remains visible | Reveal observations in source order, grouped by exact hostname and address with UDP then TCP | The summary closes the disclosure. Long replies never widen the page. | Native disclosure semantics announce expansion. Focus stays on the summary until the person tabs inside. |
| Download success or failure | Input and result remain unchanged | Remains visible | The action reports state only after the browser starts the download | Failure leaves the table and raw evidence usable | Announce the verified action state through the action label or nearby status. |
| Long values and increased text size | Input remains operable | The lead wraps without clipping or changing meaning | Maximum DNS names, IPv6 addresses, mailbox names, twelve table columns, and raw responses remain reachable | The table and raw viewports may scroll. The page must not scroll horizontally. | Focus rings remain visible. Magnified text does not overlap actions or evidence. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain name | `ToolTextField` | It keeps the required label, native text entry, field error, and focus target together. | `ToolSearchField`, because the person submits one name rather than filtering a collection. |
| One comparison action | Primary `ToolButton` submit | It provides one deliberate network action with stable loading and disabled states. | Auto-run, reset, and another primary action. |
| Request status | `ToolStatus` below the action | It announces loading and request failure without competing with a completed comparison. | Repeating one message below the field, button, and result region. |
| One result conclusion | `ToolResultLead` | A sentence can state agreement, newest RFC 1982 serial, field differences, or incomplete evidence. | `ToolPrimaryResult`, hostname heading, favicon, score, badges, and metric cards, because each splits or weakens the comparison. |
| Repeated source comparison | `ToolDataTable` | Every usable, failed, or skipped source maps to the same source and SOA schema. | Record cards, because they hide cross-row differences and consume more vertical space. |
| Raw source evidence | `ToolDisclosure` with grouped `ToolRawOutput` | It keeps complete replies available near the normalized table while containing long values. | Always-open JSON, a modal, or one unlabeled dump. |
| Complete report download | Secondary `ToolDownloadAction` | It preserves all observations and summary fields without becoming the primary task. | The custom unchecked download button, per-row downloads, and per-value copy actions. |
| Run metadata | Page-owned semantic `dl` | Checked time and duration are distinct quiet facts. | Metric cards, because metadata should not compete with the comparison. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench band spans the main column. Hostname and primary action come first. Results stack as lead, download, comparison table, raw evidence, then metadata. | A 253-character zone, several nameserver addresses, and a twelve-column SOA row | No page overflow. The table and raw output viewport own horizontal overflow. |
| Narrow mobile, 320px to 640px | Keep the same task order. Field and full-width action stack. Put download below the lead. The table follows in its contained viewport, then raw evidence and metadata. | Four labels near the 63-character label limit, a long MNAME and RNAME, and `4,294,967,295` | Readable prose wraps. The comparison table alone scrolls horizontally and keeps a visible source column. |
| Expanded raw evidence at any width | Observation groups stack by source. Each hostname and address label stays outside its raw viewport. UDP comes before TCP. | Long DNS responses, base64 or wire fields, and safe error text | Each raw viewport owns horizontal and vertical overflow and caps height. The disclosure and page do not widen. |
| Increased text size or long localization | Keep field, action, lead, table heading, disclosure, and metadata in source order. Move actions below text before space becomes cramped. | `RFC 1982 cannot order these serial values unambiguously` at 200 percent text size | Text wraps inside its owner. No control, table column, disclosure, or focus ring is covered by a sibling. |

## Interface wireframes

### Desktop result

```text
Domain or hostname *
[example.com                                                          ]

[Compare SOA records]

------------------------------------------------------------------------

SOA records for example.com disagree. RFC 1982 identifies serial 0 as
newest; serial and refresh differ.                  [Download report]

SOA values by authoritative source                     -> contained table scroll
Source and addresses  Check state    Owner       Serial         Primary, MNAME  Mailbox, RNAME         Refresh  Retry  Expire     MINIMUM  SOA TTL  Negative cache
ns1.example.net       Authoritative  example.com 4,294,967,295  ns1.example.net hostmaster.example.com 3,600s   600s   1,209,600s 300s     900s     300s
192.0.2.10

ns2.example.net       Authoritative  example.com 0, newest      ns1.example.net hostmaster.example.com 7,200s   600s   1,209,600s 300s     900s     300s
198.51.100.20

> Raw SOA responses

Checked    5 September 2026 at 15:30 IST
Duration   420 ms
```

### Narrow mobile result

```text
Domain or hostname *
[example.com                     ]

[       Compare SOA records      ]

----------------------------------

SOA records for example.com
disagree. RFC 1982 identifies
serial 0 as newest; serial and
refresh differ.

[        Download report         ]

SOA values by authoritative source  -> contained table scroll
Source | State | Owner | Serial | MNAME | RNAME | Refresh | Retry | Expire | MINIMUM | TTL | Negative cache

> Raw SOA responses

Checked
5 September 2026 at 15:30 IST
Duration
420 ms
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL CLEAN ROUTE
Domain or hostname *
[cloudflare.com                  ]  example placeholder
[       Compare SOA records      ]

INVALID
Domain or hostname *              <- focus
[                                  ]
Enter a domain or hostname.
[       Compare SOA records      ]

LOADING FIRST COMPARISON
Domain or hostname *
[example.com                     ]
[    Comparing SOA records...   ]  disabled, busy
Comparing SOA records...             polite status

LOADING LATER COMPARISON
Domain or hostname *
[new-example.com                 ]
[    Comparing SOA records...   ]
No prior lead, table, or evidence remains visible.

FULL AGREEMENT
All three checked addresses for example.com returned authoritative
SOA records and agree on every value, including serial 2,026,090,501.

SERIAL WRAPAROUND
SOA records for example.com disagree. RFC 1982 identifies serial 0
as newer than 4,294,967,295.

UNDEFINED SERIAL ORDER
SOA records for example.com use different serials, but RFC 1982
cannot order them unambiguously. No row is labeled newest.

SAME SERIAL, OTHER FIELD DIFFERS
The SOA serial is 2,026,090,501 on every checked address, but refresh
and SOA TTL differ.

PARTIAL FAILURE
The SOA comparison for example.com is incomplete because
ns2.example.net at 198.51.100.20 did not return an authoritative SOA.
The table keeps the successful ns1 row and the failed ns2 row.

IPV6 SKIPPED
All addresses this checker could query agree on serial 2,026,090,501.
ns1.example.net
192.0.2.10       Authoritative
2001:db8::10     Skipped by checker, no IPv6 route

EMPTY OR NO USABLE SOA
No authoritative SOA records were available for example.com, so
serial and field agreement cannot be determined.
No blank comparison table appears.
[        Download report         ]

REQUEST FAILURE
Domain or hostname *
[example.com                     ]
[       Compare SOA records      ]
The SOA check took too long and was stopped safely.
No prior lead, table, or evidence remains visible.

EXPANDED RAW EVIDENCE
v Raw SOA responses

ns1.example.net, 192.0.2.10, UDP
+--------------------------------+
| { "Status": 0, "AA": true } |  -> contained scroll
+--------------------------------+

ns1.example.net, 192.0.2.10, TCP
+--------------------------------+
| { "Status": 0, "AA": true } |  -> contained scroll
+--------------------------------+

ns2.example.net, 198.51.100.20
No response captured. The nameserver did not answer before timeout.
```

## Removed or rejected

- Remove the submitted-hostname result heading and favicon. The lead names the authoritative zone, and a favicon is not SOA evidence.
- Replace the two-sentence generic summary with one guarded comparison sentence that prioritizes incomplete evidence, then RFC 1982 serial order, then other field differences.
- Never call an empty result different serials. The current interface does this when no observations exist.
- Clear a previous result when a new comparison starts or fails. The current tool leaves stale evidence visible beside a changed hostname and request error.
- Move blank-name validation below the hostname field and focus that field. The current form leaves focus on the submit button.
- Replace per-record cards with one side-by-side comparison table. Cards make matching and differing values harder to scan.
- Add the raw MINIMUM and SOA TTL columns. The current cards show only the derived negative-cache time and hide both inputs to that calculation.
- Surface every differing field, including serial, owner, MNAME, RNAME, timers, MINIMUM, SOA TTL, and derived negative-cache time. Matching serials alone do not prove full SOA agreement.
- Keep skipped IPv6 observations visible as checker-side scope. Do not hide them, call them no reply, or count them as domain failures.
- Do not label a serial newest when RFC 1982 ordering is undefined or does not yield one unambiguous value.
- Keep exact unsigned serial values. Do not use ordinary numeric sorting, subtraction, a bar, or a line chart.
- Keep raw UDP and TCP replies in one collapsed disclosure grouped by exact source. It must not widen the workbench or page.
- Do not add universal timing ranges, health grades, progress bars, timelines, version-age guesses, or transfer progress.
- Do not add nameserver selection, transport, address-family, timing target, or zone controls that the API does not accept.
- Do not add SOA editing, DNSSEC status, Share, per-cell copy, reset, or another primary action.
- Do not wrap the form, lead, table, or disclosure in nested cards. Use the single workbench band, one divider, table rules, and spacing.
- Preserve the supporting Markdown below the workbench. Do not repeat its field definitions inside the result.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed result starts with one sentence that states full agreement, field disagreement and RFC 1982 order, undefined order, or incomplete evidence for the discovered zone. | Standalone Playwright with agreement, wraparound, undefined, non-serial difference, partial, and empty fixtures |
| UI-002 | lead | Full agreement appears only when at least one checked address returned an authoritative SOA and every available record field matches across all checked observations. | Derived-state coverage and fixture-driven Browser inspection |
| UI-003 | deduplication | Each exact SOA group appears once, every contributing address appears in that row, and no submitted-hostname heading, favicon, badge, card summary, or newest-serial metric repeats the lead. | DOM row, address, and text count assertions |
| UI-004 | deduplication | Raw UDP and TCP replies appear only in the source-grouped disclosure and complete report, never as another default-open result region. | DOM disclosure inspection and download assertion |
| UI-005 | visual-truth | SOA observations use one comparison table. No serial chart, time axis, transfer progress, timing gauge, score, or ordinary greater-than comparison appears. | Browser inspection and DOM assertion |
| UI-006 | visual-truth | A newest label appears only when pairwise RFC 1982 comparisons yield one unambiguous newest serial. A half-range or otherwise undefined set states that order is undefined. | RFC 1982 boundary fixtures |
| UI-007 | input | The hostname has a persistent required label, Enter submits it, and there is exactly one primary action labeled `Compare SOA records`. | Browser role and keyboard assertions |
| UI-008 | validation | Blank submission shows one hostname error and moves focus to the field. Server request errors appear once and preserve the entered hostname. | Standalone Playwright focus and error assertions |
| UI-009 | state | A later submission clears the prior result during loading. A failed later request does not restore or leave the prior lead, table, or raw evidence visible. | Delayed and failed intercepted API responses in standalone Playwright |
| UI-010 | empty | No observations, no usable SOA records, or only skipped observations produce an incomplete lead, no blank table, and no claim that serials differ or agree. | Empty, all-failed, and all-skipped fixtures |
| UI-011 | comparison | The table shows source hostname, every grouped address, check state, authority, owner, serial, MNAME, RNAME, refresh, retry, expire, MINIMUM, SOA TTL, and derived negative-cache time. | Table header and value assertions |
| UI-012 | comparison | Exact matches from one hostname group into one row. Different serials, authority states, errors, or any SOA field remain separate rows. | Grouping fixtures with IPv4 and IPv6 observations |
| UI-013 | differences | Every field that differs across usable authoritative replies is named in the lead and has an accessible difference indication on its exact table cells. | Multi-field mismatch fixture and accessibility-tree assertion |
| UI-014 | ipv6 | An IPv6 observation skipped because the checker lacks a route stays visible as `Skipped by checker`, has no domain-failure wording, and does not affect conclusions about completed addresses. | IPv6-skip fixture and DOM assertions |
| UI-015 | responsive | At widths from 320px through desktop, a 253-character zone, long MNAME and RNAME, IPv6 addresses, twelve columns, and expanded raw responses create no page-level horizontal overflow. | Playwright equality assertion for document `scrollWidth` and `clientWidth` |
| UI-016 | responsive | Only the table or raw viewport that owns long content scrolls. No sibling covers a source column, action, disclosure, or focus ring at narrow widths or 200 percent text size. | Browser inspection and element overflow measurements |
| UI-017 | accessibility | Loading, comparison, and request failure changes are announced. Skipped-source context and table differences do not trigger repeated assertive announcements. | Accessibility tree and live-region assertions |
| UI-018 | url | Opening `/soa-checker` leaves the URL unchanged through server render and hydration. An explicit `name` parameter remains as opened, and edits or submissions do not serialize state. | Standalone Playwright URL and history assertions |
| UI-019 | action | `Download report` appears only with a completed result, uses secondary styling, and saves every observation, summary field, skipped state, and raw response. | Download event and parsed JSON assertions |

## Open questions and blockers

- None. The existing comparison functions, observation fields, brief, and RFC 1982 helper provide enough information for implementation without a new input or data source.
