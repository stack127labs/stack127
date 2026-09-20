# Interface contract: Domain Registration Lookup

Status: ready
Tool: Domain Registration Lookup
Route: `/domain-lookup`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A domain owner, buyer, investigator, or operator who needs the complete current registration record for one domain and must know who published each fact.
- Question: What is the current registration record for this domain, and which registry or registrar response supports each part of it?
- Lead answer: One composed registration verdict that names the checked domain, registration state, registrar when known, and the most consequential returned status.
- Next decision: The person can act on a lock or lifecycle state, contact the registrar, inspect delegation or DNSSEC, or use the source evidence to verify a disputed fact.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name | Which domain should I check? | User input normalized by `normalizeDomainInput` | input | One domain is the only value needed to request the record. | Do not add a TLD, record type, resolver, provider, or registrar input. |
| Lookup action | When should stack127 query RDAP? | User submission | input | The remote request needs one deliberate start and retry point. | No automatic request while typing and no second primary action. |
| Composed registration verdict | What is the current registration state of this domain? | `status`, `query.unicode`, registrar identity, and the most consequential status | lead | This is the answer the person came for and it sets the meaning of every detail that follows. | Render one lead result only. Do not repeat it in a result header, favicon row, pill, or second summary paragraph. |
| Normalized query and reduction | What exact name did stack127 ask the registry about? | `query.input`, `query.domain`, `query.unicode`, `query.reduced`, `query.isIdn`, and `query.guessedSuffix` | supporting | A URL, hostname, or IDN can produce a different registry query than the entered text. That change must stay visible. | Keep the normal Unicode name in the lead. Add a normalization note only when reduction, A-label conversion, or a guessed suffix occurred. |
| Provider boundary | Which facts came from the registry and which came from the registrar? | Actual registry and registrar hosts plus field provenance from events, entities, and response bodies | supporting | The two responses have different authority and can disagree. The brief requires this relationship to be visible. | Show one source map. Row-level source labels verify individual facts but do not repeat the ownership explanation. |
| Registration date | When was the current registration created? | Chosen `registrationDate` matched to the corresponding source event | supporting | It is part of the current record and provides age context. | Show once in the sourced dates table. Do not repeat the date in the lead. |
| Re-registration date | Was the name dropped and registered again? | `reregistrationDate` matched to its event source | supporting | A published re-registration date changes how the original creation date should be read. | Omit the row when absent. Do not translate absence into `Never re-registered`. |
| Registry expiry date | What expiry date will the registry act on? | `registryExpiryDate` matched to an `expiration` event source | supporting | This is the expiry fact that governs registry deletion behavior. | Show once in the sourced dates table. Do not repeat it in the lead or merge it with registrar expiry. |
| Registrar expiry date | What separate expiry date did the registrar publish? | `registrarExpiryDate` matched to a `registrar expiration` event source | supporting | A disagreement can expose renewal synchronization or billing timing. | Keep a separate dates row. Do not pick the later date or call it the deletion date. |
| Transfer date | When did the latest published registrar transfer occur? | `transferDate` matched to its event source | supporting | A returned transfer date is a meaningful part of the current record. | Omit the row when absent. Absence is unknown, not proof that no transfer happened. |
| Record last changed | When did the stored record itself last change? | `lastChangedDate` matched to its event source | supporting | This is the useful current-record timestamp and must not be confused with provider refresh time. | Show once in the dates table. Do not repeat it in metadata. |
| Registry database update | When did the RDAP service refresh its own data? | `registryDatabaseUpdated` matched to its event source | supporting | It explains provider freshness without implying that this domain changed then. | Show once as a quiet dates row. Do not present it as the record change time. |
| Registrar facts | Who sponsors the registration and how can abuse be reported? | `registrar`, supporting `entities`, and `registrarFetch.url` | supporting | Registrar name, IANA ID, abuse contacts, website, and RDAP endpoint are part of a complete record. | Each fact appears once. Contact fields that already appear here stay out of the general contacts table. |
| Status codes | What restrictions or lifecycle states are active? | Normalized `statuses` plus `lookupStatus` and the source response that supplied them | supporting | Each returned status can change transfer, update, deletion, renewal, or DNS behavior. | The lead may mention only the most consequential status. The table owns the complete set and plain meanings. |
| Nameservers | Which nameservers and glue addresses are on record? | `nameservers` and the source response that supplied them | supporting | These are registry registration facts and can be checked against live DNS later. | Show one nameserver table. Do not repeat a comma-separated nameserver list in the lead. |
| DNSSEC delegation | Did the parent publish a DS record for this domain? | `dnssecSigned`, `dsRecordCount`, and the source response that supplied `secureDNS` | supporting | Delegation signing is part of the current record, but it is not a validation verdict. | Show one value and optional DS count. Do not call it a valid DNSSEC chain. |
| Published contacts | What registrant, administrative, or technical contact fields are public? | Non-empty `entities` fields with their `source` | supporting | The flagship record must show public contact facts without hiding their provider. | Exclude registrar and abuse fields already shown in the registrar section. Do not render empty contact cells. |
| Redaction | Which contact fields did a provider say it withheld? | `redactions`, `redactionDeclared`, and per-response parsing for source attribution | supporting | A missing contact can be policy-driven. The interface must distinguish declared redaction from an unexplained absence. | Do not repeat the same field in prose and the redaction table. Do not claim that every missing field was redacted. |
| Source fetch time and cache state | When did stack127 retrieve each response? | `registryFetch.fetchedAt`, `registrarFetch.fetchedAt`, and `fromCache` | evidence | The record can change, so each provider needs its own freshness evidence. | Show one metadata row per existing source. Do not repeat `checkedAt` or the registry database timestamp. |
| Lookup notes | Did normalization, provider disagreement, or a failed registrar hop qualify the record? | Deduplicated `notes` | evidence | Engine notes preserve facts that change how the result should be trusted. | Remove notes already expressed by the normalization note, dates table, or provider recovery. Omit the disclosure when empty. |
| Downloadable report | How can I keep the normalized record and evidence? | `reportJson` over the complete `DomainRegistration` | evidence | The full JSON record is useful for support and later verification. | Keep one secondary download action after interpreted results. Do not add copy or another file format. |
| Raw registry and registrar responses | What did each service return without interpretation? | Separate `registryFetch` and `registrarFetch` bodies or errors | evidence | Raw payloads are the final proof and preserve the provider boundary. | One closed disclosure per existing source. Never merge the bodies or open them by default. |
| Coverage routing details | How did the engine locate the RDAP endpoint? | `coverage.source`, `operator`, `url`, and `unknownTld` | omit | Endpoint discovery belongs in the report and TLD directory unless it prevents a lookup. | For `no_service`, name the TLD and link to coverage. Do not add a coverage card on successful records. |
| Application completion time and latency | When did the app finish, and how long did the request take? | `checkedAt` and `durationMs` | omit | Provider fetch times are the useful freshness evidence. Request latency does not change the record. | Do not add performance metrics or a second checked time. |
| Raw event list and unused events | What other RDAP event actions were returned? | `events`, including locked, deletion, reinstantiation, and unknown actions | omit | The normalized named dates cover the useful current record. The complete list remains in the report and raw payload. | Do not build a generic event dump or call it a history. |
| Favicon | What website icon can be fetched for the domain? | External favicon service | omit | A site icon is not registration evidence and creates a third-party request unrelated to RDAP. | Remove it from the result header and do not reserve empty space for it. |

Source attribution rules:

- Date rows use the `source` of the event whose action and date produced the normalized field. When both responses publish the same visible date, keep the source chosen by the engine and do not create a duplicate comparison.
- Statuses, nameservers, and DNSSEC use the registry source when its response supplied the normalized value. Use the registrar source only when the engine fell back to it.
- Registrar and contact facts use the matching entity's `source`. The registrar RDAP endpoint uses `registrarFetch`.
- Parse redaction declarations per raw response so each redaction row can name its source. Do not infer a source from array order alone.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name | required | yes | No default on the clean route. An explicit `?name=` may prefill from the opened URL. | visible | `ToolTextField` with `type="text"`, `inputMode="url"`, no capitalization, no autocomplete, and no spellcheck | It identifies the one registration record to request. The persistent label is `Domain name *` and the example is `example.com`. | Full width above the action. Its error stays directly below the field. |
| 2 | Look up registration | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It starts the remote lookup and names the record it returns. | Full width below the field, with the same comfortable hit height. |
| 3 | Download report | secondary action | no | Available after any structured result with report data | result | `ToolDownloadAction` | It saves the complete normalized record and both source payloads. | Full width after source metadata and before raw disclosures. |
| 4 | Expand lookup notes or raw response | optional evidence action | no | Closed by default | disclosure | `ToolDisclosure` or `ToolRawOutput` trigger | It exposes qualifications and provider payloads without competing with the answer. | One full-width row per disclosure. Expanded content stays inside its row. |

Validation and keyboard behavior:

- Blank, no-TLD, suffix-only, IP, malformed, overlong, and invalid IDN input shows the API's precise message once below the field.
- A submitted input error sets the field invalid, associates the message programmatically, focuses the field, and preserves the entered value. Editing clears that field error.
- Enter submits. Tab order is the domain field, primary action, interpreted result links and download, then disclosure triggers.
- The primary action retains its width, changes to `Looking up registration...`, exposes busy state, and blocks duplicate submission while loading.
- Do not disable the action before submission. A precise inline error explains what needs correction.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Registration verdict | What is the current registration state of this domain? | Normalized Unicode domain, `status`, registrar name, and the most consequential known status | One `ToolPrimaryResult` labelled `Registration record`. Use `Registered`, `No registration found`, or `Cannot determine` as its value. Its detail is the composed answer and omits unavailable clauses. | This is the only dominant answer. Exact dates belong only in the sourced dates table. Do not add a result header, favicon, state pill, duplicate domain heading, or second summary paragraph. Never translate a 404 into guaranteed availability. |
| 2 | Checked-name notice | Why is the queried name different from what I entered? | Input, Unicode display form, A-label query, reduction flag, and guessed-suffix flag | One concise page-owned note immediately after the lead, rendered only for reduction, IDN conversion, or a guessed suffix | Normal inputs get no note. Repeat the name only to show the transformation, not as another heading. |
| 3 | Registry and registrar source map | Which provider owns each group of facts in this result? | Existing source hosts and the actual visible fact groups attributed to each source | A page-owned semantic figure with one registry node, one optional registrar node, and one composed-record destination. Nodes list the facts contributed by that response. | The relationship must reflect this result, not a fixed claim. Omit the registrar node when no hop exists and name registrar failure outside the diagram. |
| 4 | Dates | Which registration dates were published, and by whom? | Registration, optional re-registration, registry expiry, registrar expiry, optional transfer, last changed, and registry database update | `ToolDataTable` with `Date`, `Published value`, and `Source`. Required record fields stay as `Not published`; optional event rows appear only when returned. | Registry and registrar expiry remain separate. Do not add a timeline, term bar, local-time conversion, or release prediction. |
| 5 | Registrar | Which registrar sponsors the domain, and what registrar contacts are available? | Registrar name, IANA ID, abuse email, abuse phone, website, and registrar RDAP URL with per-fact source | `ToolKeyValueList` under one heading. Each value includes a quiet source annotation. Omit a row only when the fact is absent. | Registrar abuse details stay here and do not repeat in the contacts table. Do not add an affiliate, sales, or transfer action. |
| 6 | Status codes | What restrictions or lifecycle states did the provider return? | Every normalized status, EPP spelling, RDAP spelling, known meaning, action when present, actor group, DNS effect, and source | `ToolDataTable` with `Status`, `Set by`, `Meaning and action`, and `Source`. Unknown codes remain verbatim with an honest unknown explanation. | The table owns the complete list. Omit only when no statuses were returned. The lead may name one consequential code without restating its full explanation. |
| 7 | Nameservers | Which nameservers and glue addresses are on record? | Hostname, optional addresses, and source | `ToolDataTable` with `Nameserver`, `Glue addresses`, and `Source`. Render one explicit `None published` row when the domain is registered but the list is empty. | This is registration data, not a live delegation check. Link once to Nameserver Checker after the table. |
| 8 | DNSSEC delegation | What did the registration record say about DS publication? | `dnssecSigned`, optional `dsRecordCount`, and source | `ToolKeyValueList` with `Delegation` and conditional `DS records`, followed by one link to DNSSEC Checker | `false` means no DS record was published. `null` means not reported. Never label either as a chain validation result. |
| 9 | Contacts and redaction | Which contact facts were public, and which fields were declared withheld? | Public non-registrar entities, per-response redactions, and `redactionDeclared` | Public contact fields use `ToolDataTable` with `Role`, `Field`, `Value`, and `Source`. Declared redactions use a second compact `ToolDataTable` with `Field`, `Treatment`, and `Source`. A plain unknown message covers no contact and no declaration. | Exclude empty values and registrar or abuse facts already shown. Do not treat absence as redaction without a declaration. Link once to Domain Owner Lookup. |
| 10 | Source freshness | When did stack127 fetch each provider response? | Source host, `fetchedAt`, and `fromCache` for registry and optional registrar | Quiet page-owned metadata `dl`, one row per existing response | Do not repeat `checkedAt`, duration, or registry database update. Source host may repeat in its raw disclosure label because that label preserves evidence boundaries. |
| 11 | Lookup qualifications | What unresolved issue affects trust in this otherwise usable result? | Notes left after normalization, expiry mismatch, and provider-failure deduplication | `ToolDisclosure` titled `Lookup notes`, omitted when no non-duplicate notes remain | Do not repeat checked-name transformation, source-map ownership, date mismatch already visible in the table, or request-failure copy. |
| 12 | Report action | How can I save the interpreted record and its evidence? | Report version 1 with complete `DomainRegistration` | One secondary `Download report` action | No copy action, CSV, or second download format. This action never receives primary accent styling. |
| 13 | Raw provider evidence | What did each RDAP service return? | Each existing source body or fetch error | One closed `ToolRawOutput` per source, labelled with role and host, after every interpreted region | Each raw viewport owns horizontal and vertical overflow. Never merge sources or open them automatically. |

Read without internal reports, the result says: `stack127.com is registered through HOSTINGER operations, UAB. clientTransferProhibited currently blocks transfer.` The source map says which service contributed each fact group. The following tables give the complete sourced dates, registrar details, statuses, nameservers, DNSSEC delegation, contacts, and redactions. Metadata and raw responses prove when and where the record came from.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large composed answer | The one current registration conclusion | Not applicable. Hierarchy, wording, and order make the conclusion dominant. | Use one `ToolPrimaryResult`. |
| Registry and registrar source map | Two provider responses contribute different facts to one interpreted record | Yes. Directed connectors encode contribution, nodes name the real hosts, and the layout does not imply time or authority by distance. | Use a page-owned semantic figure. Stack its nodes on narrow screens while preserving labels and reading order. |
| Dates table | Repeated date facts with the same value and source fields | Yes. Rows support exact comparison without implying equal duration. | Use `ToolDataTable` and keep both expiry rows distinct. |
| Status table | Repeated status records with actor, explanation, action, and source | Yes. Each row applies the same schema to one returned code. | Use `ToolDataTable`. Do not reduce the complete set to pills. |
| Nameserver and contact tables | Repeated records with stable fields | Yes. Row and column alignment makes multiple records easier to scan. | Use `ToolDataTable` with contained overflow. |
| Registration term timeline or progress bar | Fraction of time between creation and registry expiry | No. It overstates a term model, duplicates the dates and days-left text, and can suggest progress toward release even though expiry does not predict availability. | Omit the existing term bar. Do not use `ToolTimeline` or `ToolProgressBar`. |
| Lifecycle history | A historical sequence of registration changes | No. RDAP returns current events, not a complete history, and missing events are unknown. | Omit. Keep named current dates without connecting them as a history. |
| Cards or pills for each fact | Relative importance of record fields | No. Equal boxes would make evidence compete with the composed answer and semantic tints would add noise. | Omit nested cards and the current headline pill. Use headings, rows, one divider, and semantic text. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Empty required field, enabled `Look up registration` action, and no automatic request. An explicit `?name=` may prefill the field. | Absent | All result regions absent | No helper paragraph or error before submission | Normal document focus. Nothing announces on load. |
| Incomplete or invalid | Preserve the entered value and keep the action enabled | Absent. Clear an older result after an attempted invalid submission. | Absent | Show one precise field error below the input | Focus the field, associate the error with it, and announce the error once. |
| Loading, first lookup | Preserve the submitted input, prevent duplicate submission, and keep the button width fixed | Absent | Absent | The same form remains the retry point | Announce `Looking up registration...` through `ToolStatus`. Keep focus stable. |
| Loading, later lookup | Preserve the new input and clear the previous submitted record as soon as lookup begins | Absent so stale facts cannot be read as the new answer | Clear all old tables, metadata, report, and raw evidence | Keep only the form and busy status visible | Announce loading politely. Do not move focus from the initiating action. |
| Registered success | Preserve the input and re-enable the action | Show one `Registered` result with only available registrar and consequential-status clauses | Show conditional checked-name notice, source map, all applicable record sections, source metadata, report, and raw evidence | The same form supports another domain | Announce the completed lead once. Keep focus on the initiating action unless the shared result pattern requires otherwise. |
| Registered partial result | Preserve input and re-enable the action | Still show `Registered` because the registry record is conclusive | Keep required date rows as `Not published`, omit absent optional events, preserve every available source section, and name a failed registrar hop | One concise recovery note says which registrar-only facts are missing. Do not fail the registry result. | Announce the lead, then expose optional evidence in normal tab order. |
| Not registered or empty record | Preserve input and re-enable the action | Show `No registration found` and state that the registry returned no record | Omit dates, registrar, statuses, nameservers, DNSSEC, contacts, and redaction sections. Keep source freshness, report, and raw registry evidence. | State that this is not a guarantee that the name can be bought | Announce the lead once. Do not use success-green styling. |
| No RDAP service | Preserve input and re-enable the action | Show `Cannot determine` and name the TLD with no known service | Omit record sections. Keep any structured report and raw fetch evidence returned by the engine. | Link to the TLD directory and keep the same form available | Announce the warning result once. Never imply that the name is unregistered. |
| Provider limited, blocked, timed out, or failed | Preserve input and re-enable the same action | Show `Cannot determine` with the specific safe reason available from the result or API | Omit registration sections. Preserve source evidence only when a structured response exists. | Give one retry instruction. Do not show upstream stack or socket details. | Announce one warning or danger result. Keep focus in the retry flow. |
| Client or network request failure | Preserve valid input and re-enable the primary action | Show `Cannot determine` for the submitted name | Clear the previous record and do not show stale evidence | Show one request error and use the same action for retry | `ToolStatus` announces the failure once. Do not focus the input unless the error is an input problem. |
| Expanded notes or raw evidence | Inputs and lead stay unchanged above the disclosure | Remains visible | Open only the selected disclosure. Long JSON stays contained. | The trigger closes it without losing the record | Native disclosure semantics announce expansion. Focus stays on the trigger unless the person tabs into the content. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain input | `ToolTextField` | It preserves a visible required label, native text entry, field-scoped error, input ref, and focus behavior. | `ToolSearchField`, because the person enters one value rather than filtering a collection. |
| One remote lookup | `ToolButton` primary submit | It names the returned record and supports busy and disabled states. | Auto-submit, reset, and a second primary button, because they create requests or actions the task does not need. |
| One registration conclusion | `ToolPrimaryResult` | It supports one accessible label, one dominant state, and a composed detail sentence. | The existing favicon header, state pill, and prose answer block, because they repeat the domain and verdict. |
| Provider contribution relationship | Page-owned semantic source map | No shared component represents two evidence providers contributing different fact groups to one record. | `ToolTimeline`, cards, or plain paragraph, because time geometry is false, cards imply equal independent answers, and prose hides the relationship. |
| Repeated dates, statuses, nameservers, contacts, and redactions | `ToolDataTable` | Each group contains repeated records with a stable schema and benefits from aligned source columns. | Generic cards or comma-separated prose, because they hide comparison and source boundaries. |
| Registrar and DNSSEC fields | `ToolKeyValueList` | Each section is one object with unlike named facts rather than repeated records. | `ToolMetricGroup`, because equal metric styling would imply comparable quantities. |
| Loading and recoverable request state | `ToolStatus` | It provides a polite live region and a danger alert when needed without adding a tinted panel. | Repeated form and result errors, because one narrow message is enough. |
| Optional notes and raw proof | `ToolDisclosure` and `ToolRawOutput` | They keep diagnostics reachable, closed by default, and contained at narrow widths. | Always-open JSON, a modal, or one merged response, because each obscures source boundaries or breaks the reading path. |
| Downloaded evidence | `ToolDownloadAction` | It is a secondary action with the shared download behavior and clear label. | The existing custom button and a copy action, because the shared action already covers the contracted job. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | Full-width workbench band. The field takes the flexible input column and the action aligns with the control. Results stack in contract order. The source map may use two provider columns flowing into one record node. Tables remain full width. | `stack127-interface-contract-20260905-example.com`, `HOSTINGER operations, UAB`, and a long registrar contact URL | No page overflow. Each `ToolDataTable` and `ToolRawOutput` owns its internal overflow. |
| Narrow mobile, 320px to 640px | Field, error, and full-width action stack first. Lead, normalization note, source map, dates, registrar, statuses, nameservers, DNSSEC, contacts, metadata, report, and disclosures keep the same order. The source map stacks registry, optional registrar, then composed record. | A 253-character ASCII domain, a long Unicode domain, a 63-character nameserver label, and an unbroken 250-character URL | Domain and metadata text wrap anywhere. Each table and raw output alone may scroll horizontally. The page never does. |
| Expanded table or raw evidence at any width | Tables and disclosures stay in normal flow and cannot widen the workbench. Raw JSON caps its height and remains keyboard-scrollable. | A response with many statuses, nested notices, contact URLs, and an unbroken registry identifier | `ToolDataTable` owns table overflow. `ToolRawOutput` owns horizontal and vertical raw overflow. |
| Increased text size or long translations | Move the primary action below the field when a shared row no longer fits. Source-map nodes, key/value rows, and action labels grow vertically without clipping. | `Looking up registration...` and `The registry last refreshed its own copy` at 200 percent text size | Text wraps inside its region. No sibling covers a control, table column, or disclosure trigger. |

## Interface wireframes

### Desktop result

```text
Domain name *                                      [Look up registration]
[stack127.com                                                               ]

----------------------------------------------------------------------------

Registration record
Registered
stack127.com is registered through HOSTINGER operations, UAB.
clientTransferProhibited currently blocks transfer.

Where this record came from
+ Registry: rdap.verisign.com +       + Registrar: rdap.hostinger.com +
| dates, status, nameservers,  |       | registrar expiry, contacts,  |
| DNSSEC, registrar identity   |       | redaction                     |
+---------------+--------------+       +---------------+---------------+
                +----------------------+
                           v
                  Current registration record

Dates
Date                         Published value          Source
Registered                   20 August 2026           Registry
Registry expiry              20 August 2029           Registry
Registrar expiry             20 August 2029           Registrar
Record last changed          21 August 2026           Registry
Registry database updated    5 September 2026         Registry

Registrar
Registrar                    HOSTINGER operations, UAB        Registry
IANA ID                      1636                              Registry
Abuse email                  abuse-tracker@hostinger.com      Registry
Registrar RDAP               rdap.hostinger.com               Registrar

Status codes
Status                    Set by          Meaning and action              Source
clientTransferProhibited  Registrar       Blocks transfer until removed  Registry

Nameservers
Nameserver                       Glue addresses       Source
edward.ns.cloudflare.com         Not published       Registry
jill.ns.cloudflare.com           Not published       Registry

DNSSEC delegation
Delegation                   DS record published               Registry
DS records                   1                                 Registry

Contacts and redaction
Role             Field          Value                              Source
Registrant       Contact form   https://www.hostinger.com/whois   Registrar

Field                    Treatment                              Source
Registrant Name          Value blanked                         Registrar
Registrant Email         Replaced with a contact method        Registrar

Registry response        rdap.verisign.com, fetched 5 September 2026, cached
Registrar response       rdap.hostinger.com, fetched 5 September 2026, cached

[Download report]
> Lookup notes
> Registry response from rdap.verisign.com
> Registrar response from rdap.hostinger.com
```

### Narrow mobile result

```text
Domain name *
[stack127.com                       ]
[      Look up registration        ]

------------------------------------

Registration record
Registered
stack127.com is registered through
HOSTINGER operations, UAB.
clientTransferProhibited currently blocks
transfer.

Where this record came from
[Registry: rdap.verisign.com]
 dates, status, nameservers, DNSSEC
              |
[Registrar: rdap.hostinger.com]
 registrar expiry, contacts, redaction
              |
[Current registration record]

Dates                         -> table owns horizontal scroll
Registrar                     -> key/value rows stack
Status codes                  -> table owns horizontal scroll
Nameservers                   -> table owns horizontal scroll
DNSSEC delegation             -> key/value rows stack
Contacts and redaction        -> table owns horizontal scroll

Registry response
rdap.verisign.com
Fetched 5 September 2026, cached

[       Download report             ]
> Lookup notes
> Registry response
> Registrar response
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain name *
[example.com                         ]
[        Look up registration       ]

INVALID
Domain name *
[192.0.2.1                          ]  <- focus
That is an IP address. This tool looks up domain names.
[        Look up registration       ]

LOADING AFTER AN OLDER RESULT
Domain name *
[example.org                         ]
[      Looking up registration...   ]  disabled, busy
Looking up registration...              polite status
The older result is gone.

NOT REGISTERED
Registration record
No registration found
example.com has no current registry record. This does not guarantee that
the name can be bought.
Registry source and raw response follow. Record sections are absent.

PARTIAL REGISTERED RESULT
Registration record
Registered
example.de has a registry record. Its registrar and expiry dates were not
published.
Dates
Registered                   Not published       Registry
Registry expiry              Not published       Registry
Available status, nameserver, source, report, and raw sections remain.

NO SERVICE OR FAILURE
Registration record
Cannot determine
stack127 has no known RDAP service for .co. See the TLD directory.
The domain field and the same primary action remain available above.

EXPANDED EVIDENCE
v Registry response from rdap.example
+------------------------------------+
| {                                  |
|   "objectClassName": "domain",    |
|   "self": "https://rdap..."       | -> contained horizontal scroll
| }                                  |
+------------------------------------+
```

## Removed or rejected

- Remove the existing favicon and domain result header. The lead already names the normalized domain, and a website icon is not registration evidence.
- Remove the headline state pill and the prose sentence that repeats every status code. One composed lead owns the verdict, and the status table owns the complete code set.
- Remove the current registration-term bar. It duplicates the dates, suggests progress toward release, and does not help the person interpret the current record.
- Replace the unsourced date and fact lists with the contracted sourced tables and key/value groups. A complete record must say which provider supplied each fact.
- Replace the custom form, download button, raw response disclosure, and result patterns with the shared tool components named in this contract.
- Do not keep the previous result visible while a later lookup is loading or after an invalid submitted value. The old record must not look like the answer for the new field value.
- Do not render the same validation message as an unassociated form alert. Input errors belong to the domain field, focus it after submission, and announce the message once.
- Do not let the form action, result sections, long domain names, tables, or raw responses cause page-level overflow at 320px or at increased text size.
- Do not merge registry and registrar responses, dates, entities, contacts, or raw JSON. A source label must survive every interpreted fact.
- Do not show absent optional events as `Never`, missing DNSSEC as `Unsigned`, or missing contact data as redacted without a declaration. Unknown stays unknown.
- Do not add a health score, legitimacy verdict, history view, registrar sales link, price, valuation, record-type selector, resolver selector, or provider picker.
- Do not wrap the form or each result group in separate cards. Keep one workbench band with one divider between input and result.
- Do not serialize defaults, normalized names, or results into a clean URL during server render, hydration, or submission.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed lookup renders exactly one `ToolPrimaryResult` with `Registered`, `No registration found`, or `Cannot determine`, followed by one composed detail sentence for that submitted name. | Browser tests with registered, partial, 404, no-service, throttled, blocked, timeout, and registry-error fixtures |
| UI-002 | deduplication | The interpreted result has no favicon header, state pill, duplicate domain heading, repeated all-status sentence, or repeated source timestamp. The domain repeats only inside a conditional normalization relationship. | Browser text-count assertions and inspection |
| UI-003 | visual-truth | The result contains no term bar, progress bar, lifecycle timeline, health score, or event history. The source map names actual providers, and every table uses a stable repeated schema. | DOM role assertions and Browser inspection |
| UI-004 | responsive | At 320px width and 200 percent text size, the order remains field, primary action, lead, checked-name notice, source map, record groups, metadata, report, and evidence. The document has no horizontal overflow. | Browser measurements in dark and light themes |
| UI-005 | url | Opening `/domain-lookup` leaves the URL unchanged through hydration. Opening an explicit `?name=` preloads the field without automatic submission, and later edits or results do not rewrite the URL. | Browser URL, history, and request-count assertions |
| UI-006 | input | Submitting blank, no-TLD, suffix-only, IPv4, IPv6, malformed, overlong, and invalid IDN values shows one precise field error, associates it with the field, focuses the field, and preserves the entered value. | Browser keyboard and validation tests |
| UI-007 | loading | A later lookup clears the previous result at request start, retains button width, blocks duplicate requests, preserves the new input, and announces `Looking up registration...`. | Browser route interception and live-region assertion |
| UI-008 | normalization | URL, hostname, mixed-case, trailing-dot, user-info, port, and IDN inputs resolve to the intended registrable domain. A visible notice shows reduction or A-label conversion only when it occurred. | Browser tests backed by shared normalization fixtures |
| UI-009 | source-map | Registered results show one semantic source map whose provider hosts and contributed fact groups match the returned data. A missing registrar hop does not leave an empty node. | Browser fixtures for registry-only, registry-plus-registrar, and registrar-failure results |
| UI-010 | dates | Dates render in one sourced table. Registry and registrar expiry stay separate, optional re-registration and transfer rows appear only when returned, missing required dates read `Not published`, and no value predicts release. | Browser fixtures with complete, missing, conflicting, transfer, and re-registration events |
| UI-011 | record-groups | Registrar, statuses, nameservers, DNSSEC, contacts, and redactions each render available facts once with correct source labels. Unknown codes remain verbatim, DNSSEC null stays unknown, and absent contacts are not called redacted without a declaration. | Browser fixtures covering registry and registrar fallbacks, unknown values, contacts, and RFC 9537 redaction |
| UI-012 | no-record | Registry 404 renders `No registration found`, omits registration-only groups, preserves registry evidence, and states that purchase availability is not guaranteed. | Browser test with empty-body and RDAP-error 404 fixtures |
| UI-013 | failure | No-service, rate-limited, blocked, timeout, registry-error, and network-failure paths render `Cannot determine`, preserve the input, give one useful recovery action, and never reuse no-registration wording. | Browser test with one fixture per failure state |
| UI-014 | evidence | Each source shows its host, fetch time, and cache state once in metadata. Its raw response stays closed, separately labelled, and contained when expanded. The report download contains the normalized result and both raw responses. | Browser disclosure, download, and overflow tests |
| UI-015 | accessibility | The required label is visible and programmatic, input errors are associated and announced once, loading and final results are announced, the source map has a text equivalent, table headers are scoped, and every action works with keyboard and visible focus. | Browser accessibility and keyboard checks |

## Open questions and blockers

- None. The brief, current engine, normalized result type, live API responses, shared fixtures, and prior rendered-state review define the inputs, provider boundary, complete record groups, failure behavior, and removals needed for implementation.
