# Interface contract: DNSSEC Chain Checker

Status: ready
Tool: DNSSEC Chain Checker
Route: `/dnssec-checker`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:01faeb4a0206cee0eb6457c32a538f3b4e50eaffdbc8e320f741cebf61a2d35a`

## User task

- Primary user: A domain or DNS operator checking whether one exact DNS answer or signed denial validates from the root trust anchor.
- Question: Does DNSSEC cryptographically validate this requested answer or denial proof through the chain to the DNS root?
- Lead answer: One verdict sentence that says secure, insecure, bogus, or indeterminate and names the exact positive answer, no-data proof, name-error proof, unsigned delegation, failed chain, or incomplete check.
- Next decision: The operator can trust the answer, decide that the answer is intentionally unsigned, repair the first failed chain step, or retry an incomplete check.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain or hostname | Which exact name should the validator check? | User input normalized by `normalizeDiagnosticName` | input | DNSSEC validates a question about one name. | Do not add separate domain, URL, or zone fields. |
| Record type | Which answer or denial proof should the validator check? | User choice from `DNSSEC_RECORD_TYPES` | input | DNSSEC validates a record set or proof, not a domain-wide state. | Keep the nine supported types in one visible choice group. Do not add `ANY`, `DS`, or `DNSKEY`. |
| Validate action | When should stack127 run the remote lookups and local cryptographic walk? | User submission | input | Validation can take several seconds and needs one deliberate start and retry point. | Do not auto-run while typing or add another primary action. |
| Verdict and exact outcome sentence | Does this exact answer or denial validate through the DNS root? | `verdict`, `validation.outcome`, `query.name`, and `query.recordType` | lead | This is the answer the operator came for. | Render one verdict sentence. Do not repeat it as a status badge, hostname heading, or summary card. |
| Ordered validation steps | Which trust link passed, failed, or proved an unsigned boundary? | `validation.steps` in returned order | supporting | The steps identify where trust starts, changes zones, reaches the answer, or fails. | Keep one ordered chain. Do not repeat it as cards, a timeline, or a second diagram. |
| Step name, zone, state, and detail | What did the validator test at this link, and what happened? | Each `WalkStep` | supporting | Each step explains one dependency in the final verdict. | One heading and detail per step. Do not add a separate status pill for the same `ok` value. |
| Requested answer records | What record values did the evidence lookup return for the requested question? | `answer.records` | supporting | Positive records verify the data that was checked. An empty set confirms that no positive record row was returned. | Show each normalized record once. Do not copy the same values into the lead or metric cards. |
| Requested response code and AD flag | What did the public evidence lookup report? | `answer.responseCode` and `answer.authenticatedData` | evidence | These facts help inspect the resolver response, but neither determines the local verdict. | Keep them with requested-answer evidence and label the AD flag as resolver evidence. Never turn AD into a verdict. |
| Requested-answer lookup error | Why is requested-answer evidence absent? | `answer.error` | evidence | A lookup can fail even when the validator returns a result, so the missing evidence needs a precise reason. | Show it once in the requested-answer region. Do not repeat it as a page failure. |
| Signature rows | Which RRSIGs were used, and when is each one valid? | `signatures`, sorted by expiration | supporting | Operators need the covered type, signer, algorithm, key tag, inception, expiration, and current status for each signed set. | One table owns every signature. Never invent or display one domain-wide expiry date. |
| First signature to expire | Which current signature needs attention first? | First valid row after sorting `signatures` by expiration | supporting | Ordering the table by expiration makes the operational priority clear without inventing an aggregate expiry. | Do not repeat the timestamp as a metric or warning above the table. |
| DS and DNSKEY records by zone | Which resolver records support each delegation and key step? | `chain[].zone`, `chain[].ds`, and `chain[].dnskey` | evidence | Zone-scoped records let an operator verify the material behind a failed or surprising step. | Keep this evidence in one disclosure. Do not repeat full records inside the ordered step summary. |
| DS and DNSKEY response state | Did an evidence lookup fail or return no matching rows for a zone? | Evidence `responseCode`, `authenticatedData`, and `error` fields | evidence | Missing evidence must stay distinguishable from an empty successful response. | Show one state per zone and record type. Unknown stays unknown. |
| Complete structured report download | How can the operator keep the full validator result and raw evidence? | `diagnosticReportJson` over the complete result | evidence | The JSON file preserves the result, validator report, captured responses, and chain evidence. | Offer one download action. Do not also render the complete page-level JSON by default. |
| Run time | When did this validation run, and how long did it take? | `checkedAt` and `durationMs` | evidence | Quiet timing helps distinguish a fresh check from saved evidence. | Show each value once after the evidence, never as a metric card. |
| Validator method | Did stack127 perform local validation, and which validator did it use? | `validator.name` and `validator.performedLocalValidation` | evidence | This prevents the result from being mistaken for a resolver AD-flag guess. | Show one quiet method line. Do not repeat the method in the verdict. |
| Validator exit code | What process-style state did the library return? | `validator.exitCode` | omit | The user-facing verdict and step states already interpret it. | Keep it only in the downloaded report. |
| Engine explanation | How did the engine summarize its own outcome? | `explanation` | omit | The more precise outcome sentence and ordered steps already answer this. | Do not render a second verdict paragraph. Preserve it in the download. |
| Complete validator raw report on the page | What captured validator JSON produced the result? | `validator.rawReport` | omit | The download already preserves it, while the ordered chain gives readable evidence. | Do not add a second page-level raw report disclosure. |
| Raw requested answer | What full resolver payload sits behind the normalized requested records? | `answer.rawResponse` and answer evidence fields | evidence | It can resolve a discrepancy without crowding the default result. | Keep one collapsed raw disclosure inside the requested-answer region. |
| Website favicon | Which website icon responds for the checked hostname? | Third-party favicon request | omit | It is not DNSSEC evidence, may fail independently, and repeats the hostname identity. | Do not reserve a favicon slot in the result. |
| Resolver choice, trust anchor choice, and algorithm choice | Which validation infrastructure should the operator select? | Fixed engine behavior | omit | The engine uses a fixed DNS-over-HTTPS resolver and root trust anchor. Algorithm support follows the records. | Do not expose controls the engine cannot honor. |
| Rate-limit counters and internal query captures | How did the server bound the request? | API response headers and validator internals | omit | These execution details do not change the verdict or next step. | Keep captures in the download and show rate-limit errors only when they occur. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain or hostname | required | yes | No default on the clean route. An explicitly opened `name` query parameter may prefill it. | visible | `ToolTextField` with text input, URL input mode, no capitalization, no autocomplete, and no spellcheck | It supplies the exact DNS name. The persistent label is `Domain or hostname *`, and the example is `cloudflare.com`. | Full width first. Its error stays directly below the field. |
| 2 | Record type | defaulted | yes | `A` on the clean route. A supported explicit `type` query parameter may preselect another type. | visible | `ToolChoiceGroup` with nine radio options | The type changes the exact question and can change positive, no-data, and bogus outcomes. | Wrap in source order across as many rows as needed. Keep every radio target at a comfortable size. |
| 3 | Validate DNSSEC | primary action | not applicable | No default. The user submits the form. | visible | Primary `ToolButton` submit | It starts one local validation and provides the retry path. | Full width below the choices. Keep the loading width stable. |
| 4 | Download report | secondary action | no | Generated only from a successful API result | result | Secondary `ToolDownloadAction` | It preserves the complete structured report after a result exists. | Full width below the lead on narrow screens. |

Enter in the hostname field submits the form. Arrow keys move through the record-type radio group. Blank or whitespace submission shows `Enter a domain or hostname.` below the hostname field and focuses it. Server-side name and type errors use the same field scope when they identify one field. Request, timeout, and rate-limit errors appear once below the action through `ToolStatus`.

During a request, the primary action keeps its width, changes to `Validating DNSSEC...`, exposes busy state, and blocks duplicate submission. Editing either result-driving input after an error clears that error. The entered name and selected type survive every failure.

Opening `/dnssec-checker` leaves the address unchanged through server render and hydration. Opening an explicit `name` or supported `type` query parameter may prefill the form, and the opened query string remains unchanged. Editing and submission do not serialize state to the URL. There is no Share action because a saved DNSSEC result goes stale and the report download already preserves evidence.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | DNSSEC verdict | Does this exact answer or denial proof validate to the DNS root? | `verdict`, `validation.outcome`, `query.name`, and `query.recordType` | One `ToolResultLead` sentence. The verdict word uses semantic text color, then the sentence names the exact outcome and query. | No separate hostname heading, favicon, badge, engine explanation, or summary card. |
| 2 | Validation chain | Which cryptographic dependency produced that verdict? | Ordered `validation.steps` | One page-owned semantic `ol` with a neutral connector. Each step has a clear heading, detail sentence, and success or failure state available to assistive technology. | Document order means dependency order, not elapsed time. Do not use `ToolTimeline`, equal cards, or a second chain summary. |
| 3 | Requested answer | What normalized records and resolver facts came back for the requested question? | `answer.records`, `responseCode`, `authenticatedData`, `error`, and `rawResponse` | A small evidence summary followed by `ToolDataTable` when records exist. A no-row or lookup-error sentence replaces the table when needed. `ToolRawOutput` stays collapsed below it. | Label the AD flag as resolver evidence. Do not call it validation. Do not repeat positive record values in the lead. |
| 4 | Signature validity | Which signatures cover the checked sets, and when is each one valid? | `signatures` sorted by `expiration` | One `ToolDataTable` with record set, signer, algorithm, key tag, valid from, valid until, and status. The earliest expiration is the first row. | Do not show a domain-wide expiry. Do not repeat the earliest time in a separate metric or warning. Omit this region when no signatures exist. |
| 5 | Zone key evidence | Which DS and DNSKEY records support each zone transition? | `chain` evidence grouped by zone | One `ToolDisclosure` labeled `DS and DNSKEY evidence by zone`. Inside, each zone has compact response facts and repeated-record tables only where rows exist. | Keep it collapsed by default. Errors and empty responses stay distinct. Do not dump unlabeled JSON as the only evidence view. |
| 6 | Complete report | How can the operator save the complete machine-readable evidence? | Full result serialized by `diagnosticReportJson` | One secondary `ToolDownloadAction` associated with the lead | Claim success only after the browser starts the download. Do not render the same full report in another page-level raw disclosure. |
| 7 | Validation metadata | When did the check run, how long did it take, and what validated it? | `checkedAt`, `durationMs`, `validator.name`, and `performedLocalValidation` | Quiet page-owned `dl` in small mono text after result evidence | State local validation only when `performedLocalValidation` is true. Never infer it from the AD flag or validator name. |

Read without the internal reports, a positive result says: `Secure. The A answer for cloudflare.com is signed and validates through the chain to the DNS root.` The ordered chain shows which root, DS, DNSKEY, and answer checks support that verdict. The requested-answer and signature tables show the exact returned data and validity windows. The zone disclosure verifies deeper key evidence. The download preserves the complete report, and the last row quietly identifies the validator and run time.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large verdict sentence | The one conclusion for this exact DNS question | Not applicable. Reading order and type hierarchy make the sentence dominant. | Use one `ToolResultLead`. Color only the verdict word with a semantic text token. |
| Ordered vertical validation chain | Dependency from root trust anchor through DS and DNSKEY to an answer, denial, or unsigned boundary | Yes. Document order encodes the returned `WalkStep` order. A neutral connector shows dependency and makes no duration claim. | Use a page-owned semantic ordered list. Label each step state in text or accessible copy. |
| Timeline | Time between validation steps | No. The response has no timestamp or duration for each step. Equal spacing would imply timing that the engine does not provide. | Omit. Do not use `ToolTimeline`. |
| Progress bar | Completion toward a valid chain | No. The engine does not know the final number of zones, aliases, or denial steps before it finishes. | Omit. Do not show a percentage or estimated remaining work. |
| Requested-record table | Repeated normalized records with the same owner, type, value, and TTL fields | Yes. Columns align like facts across records. | Use `ToolDataTable` only when rows exist. Its viewport owns horizontal overflow. |
| Signature table | Repeated RRSIG facts and ordered expiration times | Yes. Rows repeat one schema, and source order encodes earliest expiration first. | Use one `ToolDataTable`. Do not encode time as an unscaled bar. |
| Zone evidence tables | DS and DNSKEY records repeated within one zone and record type | Yes. Rows share record fields and stay grouped under their real zone. | Use contained tables inside one disclosure. Keep empty and failed evidence as sentences, not blank tables. |
| Metric cards | Verdict, record count, step count, signature count, and runtime | No. Counts do not answer whether the chain validates, and equal cards make metadata compete with the verdict. | Omit. Keep time as metadata and evidence in its owning region. |
| Domain-wide expiry value | One expiration for the entire checked name | No. Each RRSIG has its own inception and expiration. | Omit. Sort real signature rows by expiration instead. |
| Favicon | Website identity as DNSSEC evidence | No. A favicon can fail or change without saying anything about DNSSEC. | Omit from the result. Keep the checked name in the verdict sentence. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean route | Empty hostname, visible A default, and enabled `Validate DNSSEC` | Absent | All result regions absent | No instructional or empty-state panel | Normal document focus order. Nothing announces on load. The URL stays `/dnssec-checker`. |
| Initial explicit query state | Prefilled hostname and supported record type from the opened URL | Absent | All result regions absent | Unsupported type falls back visibly to A. The tool does not submit automatically. | Normal focus order. Do not announce prefilled values or rewrite the query string. |
| Invalid blank input | Preserve the blank or whitespace value and selected type | Absent | Absent | Show `Enter a domain or hostname.` once below the hostname field | Focus the hostname field. Connect the message through field error semantics. |
| Invalid hostname or type from server | Preserve both visible inputs | Absent | Clear any previous result | Show the precise server message once at the matching field, or once below the action when no field matches | Focus the matching field for a field error. Announce a request-scope error through `ToolStatus`. |
| Loading first check | Preserve inputs, disable duplicate submission, and label the button `Validating DNSSEC...` | Absent | Absent | The same primary action becomes the retry point after failure | Announce `Validating DNSSEC...` politely and expose busy state. Do not move focus. |
| Loading later check | Preserve the edited inputs and disable duplicate submission | Clear the prior lead because it describes another submitted question | Clear all prior evidence and metadata | Never leave a stale verdict beside new result-driving inputs | Announce loading politely. Keep focus on the initiating control. |
| Secure positive | Preserve inputs and re-enable submit | Say that the selected answer is signed and validates through the chain to the root | Show passing chain, requested records, signatures, zone evidence disclosure, download, and metadata | The form remains ready for another check | Announce the verdict sentence politely. Do not force focus into results. |
| Secure no data | Preserve inputs and re-enable submit | Say that the name exists, the selected record does not, and DNSSEC validated the signed absence proof | Show the denial step, an empty requested-answer state, signatures when present, zone evidence, download, and metadata | Another record type can be selected and retried | Announce the verdict sentence. Do not label the domain broken. |
| Secure name error | Preserve inputs and re-enable submit | Say that the exact name does not exist and DNSSEC validated the signed denial | Show the denial chain, empty requested-answer state, signatures when present, zone evidence, download, and metadata | The hostname can be corrected and retried | Announce the verdict sentence. Do not treat a proved name error as a request failure. |
| Insecure | Preserve inputs and re-enable submit | Say where the chain proved an unsigned delegation and that DNSSEC does not protect this answer | Show the completed chain to the unsigned boundary, requested records, available evidence, download, and metadata | The operator can decide whether the zone should be signed | Announce the verdict sentence as a warning. The word `Insecure` may use warning text color. |
| Bogus | Preserve inputs and re-enable submit | Say that the answer should validate but a chain step failed and validating resolvers may return `SERVFAIL` | Show every completed step and the first failed step, then requested records and available evidence | Keep retry available. The first failed step is the repair starting point. | Announce the verdict as an error. The word `Bogus` and failed step state may use danger text color. |
| Indeterminate with partial evidence | Preserve inputs and re-enable submit | Say that the validator could not gather enough evidence for a safe verdict | Show every returned step, requested-answer state, available signatures, zone evidence, download, and metadata | Missing and failed evidence stay explicit. Retry uses the same primary action. | Announce the verdict as a warning. Do not hide a valid partial prefix chain. |
| Indeterminate with no steps | Preserve inputs and re-enable submit | Say that the validator could not complete the check | Show `No validation steps were returned.` once, then any requested-answer or zone evidence that exists | The report download preserves the raw failure. Retry remains available. | Announce the verdict as a warning. Leave focus in the form flow. |
| Request, timeout, or rate-limit failure | Preserve both inputs and re-enable submit | Absent | Clear any previous result so it cannot be mistaken for this request | Show the server message once below the action. `Validate DNSSEC` remains the retry path. | Announce through `ToolStatus` with error semantics. Do not move focus away from input and retry controls. |
| Requested-answer evidence failure | Inputs and verdict remain unchanged | Remains visible | The requested-answer region names the lookup failure while validation and other evidence remain visible | Do not turn a supporting lookup failure into a request failure | Announce the lead once. The evidence error remains readable in its region without a second assertive announcement. |
| Empty signature set | Inputs and verdict remain unchanged | Remains visible | Omit the signature table. Keep the chain, requested answer, zone evidence, download, and metadata | The chain or report explains whether absence is expected or part of an indeterminate result | No separate announcement for an omitted optional region. |
| Expanded requested raw answer | Inputs, lead, and other evidence remain unchanged | Remains visible | Reveal JSON in a contained raw viewport under requested-answer evidence | The summary closes it. Long payloads never widen the page. | Native disclosure semantics announce expansion. Focus stays on the summary until the person tabs into the raw output. |
| Expanded DS and DNSKEY evidence | Inputs, lead, and default evidence remain unchanged | Remains visible | Reveal zone groups in returned order, with response facts, record tables, empty states, and errors | The same disclosure summary collapses the evidence | Native disclosure semantics announce expansion. Every table and raw viewport owns its own overflow. |
| Download success or failure | Inputs and result remain unchanged | Remains visible | The action reports download state only after the browser starts the download | Failure leaves all visible evidence selectable and the disclosure usable | Announce the verified action state through the action label or nearby status. |
| Long values and increased text size | Inputs remain operable and controls wrap in task order | The verdict wraps without clipping or changing meaning | DNS names, TXT values, DNSKEY material, tables, disclosures, and raw data remain reachable | Inner table and raw viewports may scroll. The page must not scroll horizontally. | Focus rings stay visible. Magnified text does not overlap controls, headings, or evidence. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One DNS name | `ToolTextField` | It keeps a required label, native text entry, field error, and focus target together. | `ToolSearchField`, because the person submits one DNS question rather than filtering a collection. |
| Visible record type | `ToolChoiceGroup` | Radio semantics expose every supported result-driving choice and make the A default explicit. | `ToolSelect`, because a dropdown would hide an active assumption and nine short choices that wrap cleanly. |
| One validation action | Primary `ToolButton` submit | It supplies one deliberate remote action with stable loading and disabled states. | Auto-run, resolver buttons, and another primary action, because none matches the fixed validation engine. |
| Request status | `ToolStatus` below the action | It announces loading and request failure without competing with a completed verdict. | Repeating one message below the field, button, and result region. |
| One result conclusion | `ToolResultLead` | A sentence can combine verdict, query identity, and exact validation outcome without splitting the answer. | `ToolPrimaryResult`, hostname result header, favicon, metric cards, and a status pill, because each would split or repeat the verdict. |
| Ordered trust path | Page-owned semantic `ol` with a neutral connector | The returned steps form a dependency chain with variable kinds and no time axis. | `ToolTimeline`, because it represents dated events rather than cryptographic dependencies. |
| Requested and signature records | `ToolDataTable` | Each collection has repeated fields that benefit from aligned headers and cells. | Equal record cards, because they use more space and make comparison harder. |
| Compact response facts and metadata | `ToolKeyValueList` or an equivalent page-owned `dl` | Labels keep response code, resolver AD evidence, checked time, duration, and validator method explicit. | Prose paragraphs and metric cards, because they either blur labels or overstate metadata. |
| Requested raw response | `ToolRawOutput` inside a disclosure | It keeps complete JSON near its normalized answer while containing long unbroken data. | Always-open `pre`, a modal, or page-level raw JSON, because each crowds the answer or widens the page. |
| Zone evidence | `ToolDisclosure` with page-owned zone groups and `ToolDataTable` | Deep DS and DNSKEY records stay available without competing with the readable chain. | An unlabeled raw JSON dump, nested cards, or default-open records for every zone. |
| Complete report download | Secondary `ToolDownloadAction` | It preserves the full structured report without giving a secondary task primary styling. | The unchecked custom download button and a second page-level raw report disclosure. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench band spans the main column. Inside it, hostname comes first, record choices wrap below, and the primary action follows. Results stack as verdict, download, chain, requested answer, signatures, zone evidence, then metadata. | A 253-character DNS name, a TXT value near the DNS response limit, and an ECDSA or RSA signature record | No page overflow. Each record table and raw output viewport owns horizontal overflow. |
| Narrow mobile, 320px to 640px | Keep the same task order. Hostname, wrapped choices, and full-width primary button stack. Put download below the verdict. Chain steps, evidence, disclosure, and metadata stay in document order. | Four DNS labels near the 63-character label limit, `ECDSAP384SHA384`, and a long TXT policy value | Names and readable values wrap anywhere when safe. Tables and raw output alone may scroll horizontally. |
| Expanded requested raw answer at any width | The disclosure grows below normalized requested-answer evidence and pushes later regions down. | A resolver response with long TXT data and signature fields | The raw viewport owns horizontal and vertical overflow. It never changes the workbench or page width. |
| Expanded zone evidence at any width | Zones stack in chain order. DS comes before DNSKEY within a zone. Tables remain under their own headings. | Root plus every delegated zone in a maximum-length hostname, with long key and digest values | Each table viewport owns horizontal overflow. Zone wrappers and the page do not. |
| Increased text size or long localization | Keep controls and result regions in document order. Buttons and rows grow vertically. Move actions below text before space becomes cramped. | `The validator could not finish with enough evidence to classify this answer.` at 200 percent text size | Text wraps within its owner. No control, table column, or disclosure is covered by a sibling. |

## Interface wireframes

### Desktop result

```text
Domain or hostname *
[cloudflare.com                                                        ]

Record type
( A ) (AAAA) (CNAME) (MX) (NS) (TXT) (CAA) (SOA) (SRV)

[Validate DNSSEC]

------------------------------------------------------------------------

Secure. The A answer for cloudflare.com is signed and validates
through the chain to the DNS root.                    [Download report]

What the validator checked

o  Start with the DNS root trust anchor
|  The root DNSKEY matches the configured trust anchor.
|
o  Verify the DS link for com
|  The parent DS matches key tag 19718.
|
o  Verify the DNSKEY set for cloudflare.com
|  The DNSKEY set has a valid signature.
|
o  Verify the A answer
   The requested record set has a valid RRSIG.

Requested answer
Response code   NOERROR
Resolver AD     Set. Supporting resolver evidence only.

Owner             Type  Value           Resolver TTL
cloudflare.com    A     104.16.132.229  300 seconds
cloudflare.com    A     104.16.133.229  300 seconds

> Raw requested answer

Signature validity
Record set       Signer            Algorithm          Key tag  Valid from       Valid until      Status
A cloudflare.com cloudflare.com    ECDSAP256SHA256   2371     1 Sep 2026      12 Sep 2026     7 days remaining

> DS and DNSKEY evidence by zone

Checked          5 September 2026 at 15:30 IST
Duration         842 ms
Validation       Local, Namefi DNSSEC Audit
```

### Narrow mobile result

```text
Domain or hostname *
[cloudflare.com                  ]

Record type
( A ) (AAAA) (CNAME) (MX) (NS)
(TXT) (CAA)  (SOA)  (SRV)

[        Validate DNSSEC        ]

----------------------------------

Secure. The A answer for
cloudflare.com is signed and
validates through the chain to
the DNS root.

[        Download report        ]

What the validator checked

o  Start with the DNS root
|  trust anchor
|  The root DNSKEY matches the
|  configured trust anchor.
|
o  Verify the DS link for com
|  The parent DS matches key
|  tag 19718.
|
o  Verify the DNSKEY set for
|  cloudflare.com
|  The key set validates.
|
o  Verify the A answer
   The RRSIG validates.

Requested answer
Response code
NOERROR

Resolver AD
Set. Supporting resolver evidence.

Records                    -> contained table scroll
Owner | Type | Value | TTL

> Raw requested answer

Signature validity         -> contained table scroll
Set | Signer | Algorithm | Key | From | Until | Status

> DS and DNSKEY evidence by zone

Checked
5 September 2026 at 15:30 IST
Duration
842 ms
Validation
Local, Namefi DNSSEC Audit
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL CLEAN ROUTE
Domain or hostname *
[cloudflare.com                  ]
Record type  ( A ) (AAAA) ...
[        Validate DNSSEC        ]

INVALID
Domain or hostname *             <- focus
[                                  ]
Enter a domain or hostname.
Record type  ( A ) (AAAA) ...
[        Validate DNSSEC        ]

LOADING FIRST CHECK
Domain or hostname *
[cloudflare.com                  ]
Record type  ( A ) (AAAA) ...
[      Validating DNSSEC...     ]  disabled, busy
Validating DNSSEC...                polite status

LOADING LATER CHECK
Domain or hostname *
[example.com                     ]
Record type  ( A ) (AAAA) ...
[      Validating DNSSEC...     ]
No prior verdict or evidence remains visible.

SECURE NO DATA
Secure. example.com exists, but it has no MX record.
DNSSEC validated the signed proof of that absence.
o Root trust anchor
o DS link
o DNSKEY set
o Signed denial proof
Requested answer
No MX record rows were returned by the evidence lookup.

SECURE NAME ERROR
Secure. missing.example.com does not exist, and DNSSEC
validated the signed denial proof.
o Root trust anchor
o DS link
o DNSKEY set
o Signed denial proof

BOGUS
Bogus. The A answer for broken.example should validate,
but the DS link for broken.example failed.
o Root trust anchor, passed
x DS link for broken.example, failed
  The parent DS does not match the child DNSKEY.

INSECURE
Insecure. The chain proves that unsigned.example is not
DNSSEC-protected, but the chain is not broken.
o Root trust anchor
o Prove where the signed chain ends

INDETERMINATE WITH PARTIAL EVIDENCE
Indeterminate. The validator could not gather enough evidence
to classify the A answer for slow.example.
o Root trust anchor, passed
o DS link for example, passed
x DNSKEY lookup, unavailable

INDETERMINATE WITH NO STEPS
Indeterminate. The validator could not complete the check for
slow.example.
No validation steps were returned.
[        Download report        ]

REQUEST FAILURE
Domain or hostname *
[cloudflare.com                  ]
Record type  ( A ) (AAAA) ...
[        Validate DNSSEC        ]
The DNSSEC check took too long and was stopped safely.
No prior verdict or evidence remains visible.

REQUESTED EVIDENCE FAILURE
Indeterminate. The validator could not gather enough evidence
to classify this answer.
Requested answer
The evidence lookup failed.
> DS and DNSKEY evidence by zone

EXPANDED RAW REQUESTED ANSWER
v Raw requested answer
+--------------------------------+
| {                              |
|   "responseCode": "NOERROR", |
|   "rawResponse": { ... }      |  -> contained scroll
| }                              |
+--------------------------------+

EXPANDED ZONE EVIDENCE
v DS and DNSKEY evidence by zone

. DNSKEY
Response code  NOERROR
Resolver AD    Set
Records                         -> contained table scroll

com DS
Response code  NOERROR
Records                         -> contained table scroll

com DNSKEY
Response code  NOERROR
Records                         -> contained table scroll
```

## Removed or rejected

- Remove the hostname result heading and favicon. The verdict sentence already identifies the checked name, and a favicon is not DNSSEC evidence.
- Replace the small verdict badge plus explanatory paragraph with one dominant verdict sentence.
- Remove the engine `explanation` from the visible result because the exact outcome sentence and chain steps say more precisely what happened.
- Clear a previous result when a new check starts or fails. The current tool leaves stale evidence visible beside a new name and an error.
- Move blank-name validation under the hostname field and focus that field. The current form leaves focus on the submit button.
- Replace the always-equal chain cards or timeline idea with one semantic ordered dependency list. The connector carries no time meaning.
- Replace the raw-only DS and DNSKEY disclosure with zone headings, response facts, and record tables. Raw evidence may remain nested inside its owning zone only when it adds data not represented in the table.
- Remove the page-level `Complete validator report` disclosure. The download preserves the same report without placing a second JSON dump in the reading path.
- Keep the requested raw answer contained inside its own disclosure. It must not widen the workbench or page.
- Do not add verdict, step-count, record-count, signature-count, or runtime cards.
- Do not add a domain-wide DNSSEC expiration value, progress bar, chart, or time-axis timeline.
- Do not add resolver, root trust anchor, DNSSEC algorithm, AD-flag, `ANY`, `DS`, or `DNSKEY` controls.
- Do not add Share, copy-per-cell, reset, or another primary action.
- Do not wrap the form, verdict, chain, tables, or disclosures in nested cards. Use the single workbench band, one divider, spacing, tables, and the structural chain connector.
- Preserve the supporting Markdown below the workbench. Do not copy its explanations into the form or result.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed API result starts with one verdict sentence that names secure, insecure, bogus, or indeterminate and the exact outcome for the submitted name and type. | Standalone Playwright against intercepted verdict fixtures and Browser inspection |
| UI-002 | lead | No hostname result heading, favicon, status badge, engine explanation, or summary card competes with the verdict sentence. | Browser inspection and DOM assertion |
| UI-003 | deduplication | Each validation step appears in one ordered chain, each requested record appears in one requested-answer table, and each signature appears in one signature table. | DOM count assertions against multi-row fixtures |
| UI-004 | deduplication | The complete validator JSON is available in one downloaded report and does not also appear in a page-level raw disclosure. | Download assertion and DOM inspection |
| UI-005 | visual-truth | The validation path is a semantic ordered list with a neutral dependency connector and no time axis, equal-duration spacing claim, progress bar, or metric-card summary. | DOM semantics and Browser inspection |
| UI-006 | visual-truth | Signature rows show their own inception, expiration, and status in expiration order. No domain-wide expiry appears. | Table assertions with fixtures containing different validity windows |
| UI-007 | input | The hostname label is persistent and required, all nine record types remain visible as radios, and there is exactly one primary action labeled `Validate DNSSEC`. | Browser role assertions |
| UI-008 | validation | Blank submission shows one hostname error and moves focus to the hostname field. Server request errors appear once and preserve both inputs. | Standalone Playwright focus and error assertions |
| UI-009 | state | A later submission clears the prior result during loading. A failed later request does not restore or leave the prior verdict and evidence visible. | Delayed and failed intercepted API responses in standalone Playwright |
| UI-010 | state | Secure positive, secure no-data, secure name-error, insecure, bogus, and both indeterminate forms have distinct lead sentences and retain every returned step. | Fixture-driven Browser or Playwright assertions |
| UI-011 | evidence | Requested response code and AD flag are labeled as resolver evidence and never determine or restate the local DNSSEC verdict. Empty and failed requested-answer evidence have different messages. | DOM text assertions against empty and failure fixtures |
| UI-012 | evidence | DS and DNSKEY evidence expands by zone, distinguishes empty responses from lookup errors, and keeps the verdict and chain visible above it. | Expanded-state Browser inspection |
| UI-013 | responsive | At widths from 320px through desktop, a 253-character name, long TXT value, long signature row, and expanded JSON do not create page-level horizontal overflow. | Playwright equality assertion for document `scrollWidth` and `clientWidth` |
| UI-014 | responsive | Only the table or raw viewport that owns long content scrolls. No sibling covers a column, disclosure summary, control, or focus ring at narrow widths or 200 percent text size. | Browser inspection and element overflow measurements |
| UI-015 | accessibility | Loading, verdict, and request failure state changes are announced; semantic status does not announce every supporting evidence error a second time. | Accessibility tree and live-region assertions |
| UI-016 | url | Opening `/dnssec-checker` leaves the URL unchanged through server render and hydration. Explicit query parameters remain as opened, and edits or submissions do not serialize defaults or results. | Standalone Playwright URL and history assertions |
| UI-017 | action | `Download report` appears only with a result, uses secondary styling, and saves the complete structured report without becoming a second primary action. | Download event assertion and Browser inspection |

## Open questions and blockers

- None. The existing engine, API response, brief, and current published behavior provide enough information for implementation without a new product or formula decision.
