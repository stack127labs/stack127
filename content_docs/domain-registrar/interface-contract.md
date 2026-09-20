# Interface contract: Registrar Lookup

Status: ready
Tool: Registrar Lookup
Route: `/domain-registrar`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A domain owner, administrator, or abuse reporter who needs to identify the registrar and choose the right next contact or transfer step.
- Question: Which registrar manages this domain, how can I contact it for the right purpose, and does the record identify a reseller or transfer date?
- Lead answer: The exact registrar name published by the registry, or an honest `Not published`, `No registrar`, or `Cannot determine` result.
- Next decision: The person can use the correct abuse contact, approach the registrar for account access, check transfer readiness, or account for a reseller that the public record may not name.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name | Which domain should I check? | User input normalized by `normalizeDomainInput` | input | One domain is the only value needed to request registrar facts. | Do not add a registrar, registry, reseller, TLD, or lookup-provider input. |
| Lookup action | When should stack127 request RDAP? | User submission | input | The remote lookup needs one deliberate start and retry point. | No automatic request while typing and no second primary action. |
| Registrar identity | Which registrar manages this domain? | Registry registrar entity first, then registrar-response fallback, with `registrar.name` and source | lead | This is the answer the person came for and the party that controls account access and transfer operations. | Show the selected name once as the lead value. Do not repeat it in a result header, pill, or details row. |
| Normalized query and reduction | What exact domain did stack127 query? | `query.input`, `domain`, `unicode`, `reduced`, `isIdn`, and `guessedSuffix` | supporting | A URL, hostname, or IDN can produce a different registry query than the entered text. | Keep the Unicode domain in the lead detail. Add a note only when reduction, A-label conversion, or suffix guessing occurred. |
| IANA registrar ID | What stable identifier did the registrar entity publish? | Registrar entity handle and normalized `registrar.ianaId` with source | supporting | Published names can vary, while the IANA ID identifies the accredited registrar record. | Show once in registrar details. Do not restate it in the lead. Unknown stays `Not published`. |
| Alternate published registrar names | Did the registry and registrar responses use different names for the same registrar ID? | All registrar-role entities with source | supporting | Naming differences can explain an unfamiliar brand without changing the sponsoring registrar. | Merge identical formatted names. When names differ but IDs match, keep the registry name as lead and show the registrar-response name once as an alternate. |
| Conflicting registrar IDs | Do the two responses identify different registrars? | Distinct non-empty handles from registrar-role entities | supporting | Different IANA IDs are a material provider conflict and must not be silently resolved. | Change the lead to `Cannot determine` and show both sourced values. Do not choose one by array order. |
| Registrar website | Is a registrar website published for customer access? | `registrar.url` and matching entity field source | supporting | A published website can be the first step for account access. | Show once in registrar details and once nowhere else. Do not turn the RDAP endpoint into a login link. |
| Registrar RDAP endpoint | What registrar service supplied the second response? | `registrar.rdapUrl` or `registrarFetch.url` | supporting | It identifies the data provider and helps verify the record. | Label it as an RDAP endpoint, not a customer website. The raw disclosure may repeat its host to preserve evidence boundaries. |
| Abuse contacts | Where should I send a report about phishing, malware, or spam? | Every abuse-role entity plus normalized registrar abuse fields, with source | supporting | Abuse reporting is one of the main jobs of this page and multiple providers may publish different routes. | Merge identical visible email or phone values with combined sources. Keep differing contacts as separate sourced rows. Do not present abuse contacts as account support. |
| Account access guidance | What can I do if I own the domain but cannot reach the account? | Registrar identity, optional website, and brief-backed limitation | supporting | The useful next step is to approach the registrar and expect identity verification. | Do not promise recovery, reveal an account email, or add an invented support URL. |
| Transfer readiness route | Where can I check whether the domain can move to another registrar? | Internal `/transfer-readiness` route | supporting | Transfer status needs a separate tool and current policy checks. | Link once after the registrar answer. Do not duplicate status or eligibility logic here. |
| Registry operator | Which organization operates the TLD registry? | Matching `lib/domain/data/tld-directory.json` row, then reviewed `coverage.operator`, then registry response host | supporting | Readers often confuse the registry with the registrar. Naming both parties makes the result actionable. | Show the registry name once in the role chain. Do not call it the registrar or repeat it in a details card. |
| Reseller identity | Does the public record name a reseller between the registrar and customer? | Entities whose roles include `reseller`, with source | supporting | A returned reseller explains why the registrar name may be unfamiliar. | Show every distinct returned reseller once. If none is returned, say `Not published`; do not claim that no reseller exists. |
| Registry, registrar, and reseller role chain | How do these parties relate? | Registry operator, selected registrar, and optional reseller entities | supporting | The relationship is the central confusion this page exists to fix. | Use one role diagram. Do not repeat the same explanation in a paragraph or separate cards. |
| Transfer date | When did the record say the domain last moved registrar? | `transferDate` matched to the corresponding event source | supporting | A published transfer event directly dates the registrar move. | Show one sourced row. Absence means `Not published`, never `Never transferred`. |
| Record last changed | When did the registration record last change for any reason? | `lastChangedDate` matched to its event source | supporting | It is useful context but cannot substitute for a missing transfer event. | Show one weaker sourced row and state that it is not a transfer date. Do not put it in the lead. |
| Registrar-hop failure | Which registrar-only details may be missing? | `registrarFetch.status`, `registrarFetch.error`, and lookup notes | supporting | A failed second hop can hide abuse contacts, website details, or an alternate name while the registry identity remains valid. | Keep a valid registry registrar lead. Name the missing registrar-only facts once in recovery, not as a second verdict. |
| Source fetch time and cache state | When did stack127 retrieve each provider response? | `registryFetch.fetchedAt`, `registrarFetch.fetchedAt`, and `fromCache` | evidence | Registrar and contact details can change, so each response needs separate freshness evidence. | Show one metadata row per existing source. Do not repeat `checkedAt` or request duration. |
| Lookup notes | What non-duplicate qualification did the engine return? | Deduplicated `notes` | evidence | Normalization and partial-fetch notes can affect trust. | Omit notes already expressed in the checked-name notice, conflict state, or registrar-hop recovery. |
| Downloadable report | How can I save the normalized record and raw evidence? | `reportJson` over `DomainRegistration` | evidence | A JSON report supports support tickets and later verification. | Keep one secondary download action. Do not add copy, CSV, or another report format. |
| Raw registry and registrar responses | What did each provider return without interpretation? | Separate fetch bodies or errors | evidence | Raw data is the final proof of names, IDs, contacts, roles, and dates. | One closed disclosure per source. Never merge the payloads or open them initially. |
| Canonical ICANN registrar name | What canonical name appears in the accredited registrar list? | Planned committed accredited-registrar dataset | omit | That dataset is not present in the current engine. The interface can answer with the exact published name and IANA ID without inventing a canonical alias. | Do not show a canonical-name row until a reviewed dataset exists and the product contract adds it. |
| Registration, expiry, status, nameservers, DNSSEC, contacts, and redaction | What is the wider registration record? | Other normalized registration fields | omit | These facts belong to Domain Registration Lookup or Domain Registrant Lookup. | Keep them in the report and raw evidence. Link to the appropriate tool rather than copying its result. |
| Coverage routing details | How did the engine locate RDAP? | `coverage` | omit | Endpoint discovery does not change a successful registrar answer. | For `no_service`, name the TLD and link to coverage. Do not add a successful-result coverage card. |
| Application completion time and latency | When did the app finish and how long did it take? | `checkedAt` and `durationMs` | omit | Provider fetch time is the useful freshness fact. Latency does not identify the registrar. | Do not add performance metadata or a second checked time. |
| Favicon | What icon belongs to the website on this domain? | External favicon service | omit | A website icon is not registrar evidence and creates an unrelated third-party request. | Remove it from the result. |

Identity and deduplication rules:

- Prefer the registrar-role entity from the registry response. Fall back to a registrar-response entity only when the registry did not publish one.
- Inspect every registrar-role and abuse-role entity, not only the flattened first match.
- Merge identical role, field, and formatted value rows across sources and label them `Registry and registrar`. Keep different visible values as separate sourced rows.
- A different name with the same IANA ID is an alternate published name. Different non-empty IANA IDs are a conflict and produce `Cannot determine` until the evidence is inspected.
- A reseller entity is not the registrar. A missing reseller entity means `Not published`, not `No reseller`.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name | required | yes | No default on the clean route. An explicit `?name=` may prefill from the opened URL. | visible | `ToolTextField` with `type="text"`, `inputMode="url"`, no capitalization, no autocomplete, and no spellcheck | It identifies the one registrar record to request. The persistent label is `Domain name *` and the example is `example.com`. | Full width above the action. Its error stays directly below the field. |
| 2 | Find the registrar | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It starts the remote lookup and names the answer it returns. | Full width below the field with the same comfortable hit height. |
| 3 | Open registrar website | secondary action | no | Conditional on a published `registrar.url` | conditional | Ordinary external link showing the destination host | It provides a real customer-access starting point only when the response published one. | Full-width text link. Long hosts wrap. |
| 4 | Check transfer readiness | secondary action | no | Internal route | result | Ordinary link to `/transfer-readiness` | It continues the transfer task without adding transfer rules to this workbench. | Full-width text link after registrar details and dates. |
| 5 | Download report | secondary action | no | Available after any structured result with report data | result | `ToolDownloadAction` | It saves the normalized registrar record and both provider payloads. | Full width after source metadata and before raw evidence. |
| 6 | Expand notes or raw response | optional evidence action | no | Closed by default | disclosure | `ToolDisclosure` or `ToolRawOutput` trigger | It exposes qualifications and raw source evidence without competing with the registrar identity. | One full-width row per disclosure. Expanded content stays inside it. |

Validation and keyboard behavior:

- Blank, no-TLD, suffix-only, IP, malformed, overlong, and invalid IDN input shows the API's precise message once below the field.
- A submitted input error sets the field invalid, associates the message programmatically, focuses the field, and preserves the entered value. Editing clears that error.
- Enter submits. Tab order is field, primary action, returned registrar and abuse links, transfer link, report action, and disclosure triggers.
- The primary action retains its width, changes to `Finding the registrar...`, exposes busy state, and blocks duplicate submission while loading.
- Do not disable submission before the person tries it. The inline error explains what needs correction.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Registrar answer | Which registrar manages this domain? | Selected sourced registrar name, normalized domain, registration status, and conflict state | One `ToolPrimaryResult` labelled `Registrar`. Its value is the exact name, `Not published`, `No registrar`, or `Cannot determine`. Its detail names the checked domain and any IANA-ID conflict without adding dates. | This is the only dominant answer. Do not add a favicon header, state pill, duplicate name row, or second summary paragraph. |
| 2 | Checked-name notice | Why did stack127 query a different name from the entered text? | Input, Unicode form, A-label form, reduction, and guessed-suffix state | One concise page-owned note immediately after the lead, only when normalization changed or qualified the query | Normal inputs get no note. Repeat the domain only to show the transformation. |
| 3 | Registrar contacts and identifiers | What stable ID, contact routes, and endpoints were published? | IANA ID, all distinct abuse emails and phones, optional website, optional registrar RDAP endpoint, alternate published name, and source | Page-owned grouped key/value rows. Put IANA ID first, website second, abuse contacts with an abuse-only note, registrar RDAP endpoint last, and an alternate name only when it differs. | Do not repeat the lead name. Do not label the RDAP endpoint as support or login. Merge identical contacts and keep differing values with their source. |
| 4 | Role chain | How do the registry, registrar, and possible reseller relate? | Registry organization from the committed TLD directory or fallback, selected registrar, and returned reseller entities | A page-owned semantic diagram ordered `Registry`, `Registrar`, `Reseller when published`, then `Registrant account`. Each node names its job. When no reseller is returned, the diagram says `Reseller not published, one may still exist`. | Geometry encodes role linkage, not ownership or time. Never infer a reseller name or claim that the registrar sold the domain directly. |
| 5 | Registrar dates | Does the record publish a direct transfer date, and when did it otherwise last change? | Transfer date and last-changed date with event source | `ToolDataTable` with `Event`, `Published date`, `Source`, and `What it tells you`. Keep both rows, using `Not published` when absent. | Never substitute last changed for transfer. Do not add a timeline or registration history. |
| 6 | Practical next steps | What should I do for access, abuse, or transfer? | Registrar website availability, registrar name and ID, abuse contacts, and internal transfer route | Three short page-owned rows: `Account access`, `Report abuse`, and `Transfer`. Each names the matching route or limitation. | No generic primary button, affiliate link, registrar rating, support promise, username recovery, or guessed account email. Do not repeat contact values already shown above. |
| 7 | Source freshness | When did stack127 retrieve the registry and registrar evidence? | Provider role, host, fetch date, and cache state | Quiet page-owned metadata `dl`, one row per existing response | Do not repeat `checkedAt`, duration, or a host in another metadata block. Raw disclosure labels may repeat hosts to preserve evidence boundaries. |
| 8 | Lookup qualifications | Did normalization or a provider failure limit this result? | Notes left after checked-name, conflict, and hop-failure deduplication | `ToolDisclosure` titled `Lookup notes`, omitted when empty | The lead and practical recovery own material conflict or missing-hop wording. Do not repeat it here. |
| 9 | Report action | How can I save the registrar record and its evidence? | Report version 1 with complete `DomainRegistration` | One secondary `Download report` action | No copy action or second report format. It never receives primary accent styling. |
| 10 | Raw provider evidence | What did each service return without interpretation? | Each existing source body or fetch error | One closed `ToolRawOutput` per source, labelled with provider role and host, after interpreted results | Keep sources separate. Each raw viewport owns its overflow and never opens automatically. |

Read without internal reports, the result says: `HOSTINGER operations, UAB manages stack127.com. Its IANA registrar ID is 1636.` The contact rows show the distinct abuse routes and data endpoints with their sources. The role chain separates Verisign, Hostinger, and an unnamed possible reseller. The date table says that no transfer date was published and does not mistake the record-change date for one.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large registrar name | One current registrar identity | Not applicable. Hierarchy and order make the exact published name dominant. | Use one `ToolPrimaryResult`. |
| Registry, registrar, reseller, and account chain | Each party's operational relationship to the next | Yes. Ordered connectors encode who operates the TLD, who manages the registration, and where an optional reseller may sit. Text marks the reseller as unpublished rather than absent. | Use one page-owned semantic diagram. Stack it in the same order on narrow screens. |
| Registrar dates table | Two event facts with date, source, and interpretation | Yes. Rows enable comparison without implying that the events form a complete history. | Use `ToolDataTable`. Keep the source and meaning columns. |
| Registrar or reseller cards | Equal independent parties | No. The parties have different roles and a reseller may be unknown. Equal cards would hide the chain and overstate missing data. | Omit. Use the role diagram and grouped details. |
| Transfer timeline | A history of registrar moves | No. RDAP may publish one transfer event and omits earlier history. | Omit. Never connect last changed to transfer as a substitute. |
| Registrar quality score | Whether the registrar is good or safe | No. The engine has no service, pricing, support, or reliability evidence. | Omit. Do not rate or recommend registrars. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Empty required field, enabled `Find the registrar` action, and no automatic request. An explicit `?name=` may prefill the field. | Absent | All result regions absent | No helper paragraph or error before submission | Normal document focus. Nothing announces on load. |
| Incomplete or invalid | Preserve the entered value and keep the action enabled | Absent. Clear an older result after an attempted invalid submission. | Absent | Show one precise field error below the input | Focus the field, associate its error, and announce the error once. |
| Loading, first lookup | Preserve submitted input, prevent duplicate submission, and retain button width | Absent | Absent | The same form remains the retry point | Announce `Finding the registrar...` through `ToolStatus`. Keep focus stable. |
| Loading, later lookup | Preserve the new input and clear the previous registrar result as soon as lookup begins | Absent so stale registrar data cannot be read as the new answer | Clear old contacts, role chain, dates, next steps, metadata, report, and evidence | Keep only the form and busy status visible | Announce loading politely. Do not move focus from the action. |
| Registrar identified | Preserve input and re-enable the action | Show the exact selected registrar name and checked domain | Show identifiers, all distinct abuse contacts, role chain, dates, next steps, metadata, report, and raw evidence | A failed optional registrar hop names the details that may be missing without invalidating the registry registrar | Announce the lead once. Keep focus in the normal flow. |
| Registrar name absent, IANA ID present | Preserve input and re-enable the action | Show `Not published` and state that the name is absent while the IANA ID is available | Show IANA ID, available contacts, role chain with an unnamed registrar, dates, next steps, metadata, report, and evidence | Use the ID in account or abuse contact. Do not invent a canonical name. | Announce the lead once. |
| Registrar identity absent | Preserve input and re-enable the action | Show `Not published` and state that no available response identifies the registrar | Show registry node, dates, source metadata, report, and raw evidence. Omit empty contact rows. | Link to Domain Registration Lookup for the wider record. Retry remains available. | Announce the lead once. |
| Conflicting IANA IDs | Preserve input and re-enable the action | Show `Cannot determine` and state that the responses identify different registrars | Show both sourced ID and name records, source metadata, report, and raw evidence. Suppress account guidance that chooses one provider. | Ask the person to inspect the raw evidence or retry. Keep abuse contacts sourced and separate. | Announce the warning result once. |
| Not registered | Preserve input and re-enable the action | Show `No registrar` and state that the registry has no current record | Omit registrar contacts, role chain, dates, and next steps. Keep registry freshness, report, and raw evidence. | Do not call the domain available to buy | Announce the lead once without success-green styling. |
| No RDAP service | Preserve input and re-enable the action | Show `Cannot determine` and name the TLD with no known service | Omit registrar sections. Keep any structured report or raw fetch evidence. | Link to the TLD directory and keep the same form available | Announce the warning result once. |
| Provider limited, blocked, timed out, or failed | Preserve input and re-enable the same action | Show `Cannot determine` with the safest specific reason available | Omit registrar sections unless a registry result still identifies the registrar. Keep available source evidence. | Give one retry instruction. Do not leak upstream implementation details. | Announce one warning or danger result. Keep focus in the retry flow. |
| Expanded notes or raw evidence | Input and lead remain above the disclosure | Remains visible | Open only the chosen disclosure. Long JSON stays contained. | The trigger closes it without losing the result | Native disclosure semantics announce expansion. Focus stays on the trigger unless the person tabs into content. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain input | `ToolTextField` | It preserves a visible required label, field error, input ref, and native text-entry behavior. | `ToolSearchField`, because the person enters one value instead of filtering a collection. |
| One remote lookup | `ToolButton` primary submit | It names the answer and supports a fixed busy state without adding another interaction. | Auto-submit, reset, or a second primary button, because they weaken the single deliberate request. |
| One registrar identity | `ToolPrimaryResult` | It supports one accessible label, one dominant published name or honest unavailable state, and one detail line. | The current favicon header, state pills, and repeated prose answer, because they compete with and duplicate the registrar. |
| Registrar identifiers and contacts | Page-owned grouped key/value rows | The facts have different meanings and need source annotations and link behavior. | `ToolMetricGroup` or cards, because the values are not comparable quantities or equal findings. |
| Party relationship | Page-owned semantic role-chain diagram | No shared component represents the registry, registrar, optional reseller, and customer-account relationship. | `ToolTimeline` or prose, because the chain is not time and prose hides the role boundary. |
| Transfer and change events | `ToolDataTable` | Both records use the same date, source, and meaning fields. | A timeline or two metric cards, because the data is incomplete history and the dates have different evidentiary weight. |
| Loading and recoverable errors | `ToolStatus` | It provides a polite live region and danger alert at the narrowest useful scope. | Repeated form and result errors. |
| Optional notes and raw proof | `ToolDisclosure` and `ToolRawOutput` | They keep diagnostics reachable, closed by default, and contained. | Always-open JSON, a modal, or one merged response, because each obscures source boundaries or breaks reading order. |
| Downloaded evidence | `ToolDownloadAction` | It provides the shared secondary download behavior and label. | The current custom download button or copy action, because neither adds another needed job. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | Full-width workbench band. The field uses the flexible column and the action aligns with the control. Results stack in contract order. The role chain may run horizontally from registry through optional reseller to account. | `stack127-interface-contract-20260905-example.com`, `HOSTINGER operations, UAB`, and a long registrar RDAP or website URL | No page overflow. `ToolDataTable` and `ToolRawOutput` own internal overflow. |
| Narrow mobile, 320px to 640px | Field, error, and full-width action stack first. Lead, checked-name notice, identifiers, role chain, dates, next steps, metadata, report, and evidence keep the same order. Role nodes stack vertically. | A 253-character ASCII domain, a long Unicode domain, a long registrar company name, and an unbroken abuse address | Domain, email, and metadata text wrap anywhere. Tables and raw output alone may scroll horizontally. The page never does. |
| Expanded table or raw evidence at any width | Dates and disclosures remain in normal flow. Raw JSON caps its height and remains keyboard-scrollable. | Conflicting long registrar names, many entity fields, nested notices, and a 250-character URL | `ToolDataTable` owns table overflow. `ToolRawOutput` owns horizontal and vertical raw overflow. |
| Increased text size or long translations | Move the primary action below the field when the row no longer fits. Role nodes, next-step rows, and links grow vertically without clipping. | `The registry and registrar publish different IANA registrar IDs` at 200 percent text size | Text wraps within its owner. No sibling covers a contact, table column, or disclosure trigger. |

## Interface wireframes

### Desktop result

```text
Domain name *                                          [Find the registrar]
[stack127.com                                                               ]

----------------------------------------------------------------------------

Registrar
HOSTINGER operations, UAB
This registrar manages stack127.com.

Registrar contacts and identifiers
IANA registrar ID       1636                              Registry
Website                 Not published
Abuse email             abuse-tracker@hostinger.com      Registry
Abuse email             abuse@hostinger.com              Registrar
Abuse phone             +37064503378                      Registry
Registrar RDAP          rdap.hostinger.com                Registrar

Who does what
[Registry]
VeriSign Global Registry Services
Operates .com and holds the registry record
        |
[Registrar]
HOSTINGER operations, UAB
Manages registration, account access, and transfer
        |
[Reseller not published]
One may still have sold or supported the domain
        |
[Registrant account]

Registrar dates
Event                 Published date        Source       What it tells you
Last transferred      Not published         Registry     Move date is unknown
Record last changed   21 August 2026        Registry     Change, not proof of transfer

Next steps
Account access        Use the published registrar website when available.
Report abuse          Use the abuse contact above for phishing, malware, or spam.
Transfer              Check domain transfer readiness.

Registry response     rdap.verisign.com, fetched 5 September 2026, cached
Registrar response    rdap.hostinger.com, fetched 5 September 2026, cached

[Download report]
> Lookup notes
> Registry response from rdap.verisign.com
> Registrar response from rdap.hostinger.com
```

### Narrow mobile result

```text
Domain name *
[stack127.com                       ]
[         Find the registrar       ]

------------------------------------

Registrar
HOSTINGER operations, UAB
This registrar manages stack127.com.

Registrar contacts and identifiers
IANA registrar ID
1636, Registry

Abuse email
abuse-tracker@hostinger.com, Registry

Who does what
[Registry]
VeriSign Global Registry Services
        |
[Registrar]
HOSTINGER operations, UAB
        |
[Reseller not published]
One may still exist
        |
[Registrant account]

Registrar dates                 -> table owns horizontal scroll

Next steps
Account access
Report abuse
Check domain transfer readiness

Registry response
rdap.verisign.com
Fetched 5 September 2026, cached

[       Download report             ]
> Registry response
> Registrar response
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain name *
[example.com                         ]
[          Find the registrar       ]

INVALID
Domain name *
[192.0.2.1                          ]  <- focus
That is an IP address. This tool looks up domain names.
[          Find the registrar       ]

LOADING AFTER AN OLDER RESULT
Domain name *
[example.org                         ]
[        Finding the registrar...   ]  disabled, busy
Finding the registrar...                 polite status
The older registrar result is gone.

NAME ABSENT, ID PRESENT
Registrar
Not published
The registrar name is absent for example.org. The record publishes IANA ID 9999.

CONFLICT
Registrar
Cannot determine
The registry publishes registrar ID 1111 and the registrar response publishes
ID 2222. Inspect the source evidence or retry.

PARTIAL REGISTRAR HOP
Registrar
Example Registrar
The registry identifies the registrar. Its own response could not be retrieved,
so website and additional abuse contacts may be missing.

NOT REGISTERED
Registrar
No registrar
example.com has no current registry record, so it has no current registrar.

NO SERVICE OR FAILURE
Registrar
Cannot determine
stack127 has no known RDAP service for .co. See the TLD directory.

EXPANDED EVIDENCE
v Registry response from rdap.example
+------------------------------------+
| {                                  |
|   "roles": ["registrar"],         |
|   "handle": "1636"                | -> contained horizontal scroll
| }                                  |
+------------------------------------+
```

## Removed or rejected

- Remove the favicon and domain result header. The lead detail already names the checked domain, and a site icon is not registrar evidence.
- Remove the `Registrar identified`, `No registrar published`, and `Abuse contact published` pills. One lead answer and sourced contact rows carry the meaning without badge counts.
- Remove the paragraph that always calls an unfamiliar registrar a reseller explanation. A reseller is possible, not proven, unless an entity names one.
- Replace the broad `Details` list with a lead, sourced identifiers and contacts, a role chain, a two-row dates table, and practical next steps. Each region answers a different question.
- Inspect every registrar and abuse entity. Do not stop at the flattened first match when the registry and registrar publish different names or contacts.
- Do not use record last changed as a transfer date or connect the two events into a history timeline.
- Do not call the registrar RDAP endpoint a website, support page, account login, or recovery route.
- Do not show a canonical ICANN registrar name until the planned committed registrar dataset exists. Use the exact published name and stable IANA ID.
- Do not keep the previous registrar result visible while a new request is loading or after an invalid submitted value.
- Do not render a submitted input error as an unassociated form alert. Associate it with the field, focus the field, and announce it once.
- Do not let long domain names, registrar names, contacts, tables, diagrams, or raw responses cause page-level overflow at 320px or increased text size.
- Do not add a registrar rating, recommendation, affiliate offer, price, reseller guess, account username, account email, or access-recovery promise.
- Do not copy expiry, statuses, nameservers, DNSSEC, registrant fields, or redactions into this result. Link to the broader tools.
- Do not wrap the form, registrar answer, contacts, dates, or each role in separate cards. Keep one workbench band with one divider between input and result.
- Do not serialize defaults, normalized names, or results into a clean URL during server render, hydration, or submission.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed lookup renders exactly one `ToolPrimaryResult` whose value is the selected published registrar name, `Not published`, `No registrar`, or `Cannot determine`. | Browser tests with identified, ID-only, absent, conflicting, 404, no-service, blocked, and timeout fixtures |
| UI-002 | deduplication | The interpreted result has no favicon header, state pill, duplicate registrar name, duplicate abuse contact, duplicate entity value, or repeated source timestamp. Identical cross-source values merge with both sources named. | Browser text-count, row-count, and source-label assertions |
| UI-003 | visual-truth | The result shows one registry-to-registrar-to-optional-reseller role chain and one two-row event table. It contains no transfer timeline, registrar score, equal party cards, or registration history. | DOM role assertions and Browser inspection |
| UI-004 | responsive | At 320px width and 200 percent text size, the order remains field, primary action, lead, checked-name notice, contacts and identifiers, role chain, dates, next steps, metadata, report, and evidence. The document has no horizontal overflow. | Browser measurements in dark and light themes |
| UI-005 | url | Opening `/domain-registrar` leaves the URL unchanged through hydration. Opening an explicit `?name=` preloads without automatic submission, and later edits or results do not rewrite the URL. | Browser URL, history, and request-count assertions |
| UI-006 | input | Submitting blank, no-TLD, suffix-only, IPv4, IPv6, malformed, overlong, and invalid IDN values shows one precise associated field error, focuses the field, and preserves the entered text. | Browser keyboard and validation tests |
| UI-007 | loading | A later lookup clears the previous result at request start, retains button width, blocks duplicate requests, preserves the new input, and announces `Finding the registrar...`. | Browser route interception and live-region assertion |
| UI-008 | normalization | URL, hostname, mixed-case, trailing-dot, user-info, port, and IDN input resolves to the intended registrable domain. A visible notice shows reduction or A-label conversion only when it occurred. | Browser tests backed by shared normalization fixtures |
| UI-009 | identity | The lead prefers the registry registrar entity, falls back to the registrar response, shows an available IANA ID once, keeps alternate same-ID names sourced, and renders different IDs as `Cannot determine`. | Browser fixtures for registry-only, registrar fallback, alternate name, ID-only, absent, and conflicting identities |
| UI-010 | contacts | Every distinct abuse email and phone renders once with source and abuse-only wording. A published registrar website is a customer-access link, while an RDAP endpoint is never labelled support or login. | Browser fixtures with matching, different, missing, and long contacts and URLs |
| UI-011 | roles | The role chain names the committed registry organization, selected registrar, and returned reseller when present. Missing reseller data reads `Not published` and never proves that no reseller exists. | Browser fixtures for direct registrar, named reseller, missing registry organization, and narrow layout |
| UI-012 | dates | Transfer and last-changed dates remain separate sourced rows. Missing transfer reads `Not published`, and the interface never labels last changed as transfer or builds a history timeline. | Browser fixtures with both dates, each date alone, and neither date |
| UI-013 | partial | A failed registrar hop preserves a registry-published registrar lead, names the registrar-only details that may be missing, and gives retry. If no source identifies a registrar, it renders `Cannot determine`. | Browser fixtures for registrar timeout, block, error, and registry-only identity |
| UI-014 | no-record | Registry 404 renders `No registrar`, omits registrar-only regions, keeps registry evidence, and never calls the domain available. | Browser tests with empty-body and RDAP-error 404 fixtures |
| UI-015 | failure | No-service, rate-limited, blocked, timeout, registry-error, and network-failure paths render `Cannot determine`, preserve the input, give one useful recovery action, and never reuse no-registrar wording. | Browser test with one fixture per failure state |
| UI-016 | evidence | Each source shows its host, fetch time, and cache state once. Raw responses stay closed, separate, and contained. The report contains the normalized record and both raw responses. | Browser disclosure, download, and overflow tests |
| UI-017 | accessibility | The required label is visible and programmatic, input errors are associated and announced once, loading and results are announced, the role chain has a text equivalent, table headers are scoped, and every action works with keyboard and visible focus. | Browser accessibility and keyboard checks |

## Open questions and blockers

- None. The brief, current engine, entity and event types, committed TLD directory, live registration response, and prior rendered-state review define the input, lead identity, contacts, role relationship, date evidence, failure behavior, and removals needed for implementation. The missing canonical registrar dataset remains intentionally outside this interface until it exists.
