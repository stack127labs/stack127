# Interface contract: Domain Availability Checker

Status: ready
Tool: Domain Availability Checker
Route: `/domain-availability`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:0f080ebd38640f3fc4f976571b32a2bbbeaccbe0b6b2150e1be3a98dc176ce6d`

## User task

- Primary user: Someone considering one domain name who wants a registry answer without entering it into a registrar sales search.
- Question: Does the registry currently have a record for this domain, or can stack127 not determine that?
- Lead answer: One registry verdict: `Registered`, `No registration found`, or `Cannot determine`.
- Next decision: The person can stop treating a registered name as available, try a registrar while accounting for reserved and premium names, or retry or use the coverage directory when no answer is possible.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name | Which domain should I check? | User input, normalized by the domain lookup engine | input | One registrable domain is the only value needed for the lookup. | Do not add a separate TLD field or registrar selector. |
| Lookup action | When should stack127 ask the registry? | User submission | input | The remote request needs one deliberate action and a clear retry point. | No automatic request while typing and no second primary action. |
| Registry verdict | Does the registry have a current record for this domain? | `status` from the registry RDAP fetch | lead | This is the one answer the person came for. It must keep a failed check distinct from no registration. | Render one lead output only. Do not repeat it in a pill, heading, result header, or summary card. |
| Normalized Unicode domain | Which domain does the verdict describe? | `query.unicode` | supporting | It ties the answer to the actual registrable domain, including IDN conversion and subdomain reduction. | Include it in the lead detail. Do not add a separate result title. |
| Input reduction notice | Did stack127 check a different registrable name than the text entered? | `query.reduced`, `query.input`, and `query.unicode` | supporting | A person who enters a URL or subdomain needs to see which registry record was checked. | Show one short notice only when `reduced` is true. Do not repeat the normalized domain in a parsed-input table. |
| No-registration limit | Does no registry record prove that I can buy the name? | `status === "not_registered"` plus the reviewed limitation in `brief.md` | supporting | Reserved, blocked, premium-priced, and just-released names can have no record but still be unavailable at checkout. | Keep the caveat in the lead detail. Do not label the name `Available`, use green success treatment, or repeat the same warning in a panel. |
| Registration date | When was the current registry record created? | `registrationDate` | supporting | It gives useful context for a registered name without turning this page into a full lookup. | Show once in `Registration facts` when present. |
| Registry expiry date | When does the registry record expire? | `registryExpiryDate` | supporting | It gives a useful next lead for someone interested in a taken name. | Show once in `Registration facts`. Do not calculate availability from it. |
| Registrar name | Which registrar sponsors the record? | `registrar.name` | supporting | It tells the person where the record is managed when the registry publishes the fact. | Show once in `Registration facts`; do not add registrar contacts or a registrar card. |
| Release-related lifecycle status | Is a registered name in redemption or pending delete? | Filtered `statuses` values for `redemption period` and `pending delete` | supporting | These states change what the person should do, but neither means the name is available. | Show one plain lifecycle row and one link to Domain Expiry Checker. Do not add a status pill or timeline. |
| Cannot-determine reason | Why is there no trustworthy verdict, and what can I do? | `no_service`, `rate_limited`, `blocked`, `timeout`, or `registry_error` | supporting | Recovery differs between missing RDAP coverage and a temporary request failure. | State one reason beneath the lead. Never reuse available or no-registration language. |
| Registry source host | Which registry service answered? | Host parsed from `registryFetch.url` | evidence | The source supports the page's registry-backed trust claim. | Show once in quiet metadata, not in the header or supporting facts. |
| Fetch time and cache flag | How fresh is this answer? | `registryFetch.fetchedAt` and `registryFetch.fromCache` | evidence | A cached no-registration result can be stale while a name is being registered. | Show one fetch timestamp and a cache label when applicable. Do not repeat `checkedAt`. |
| Registry database update date | When did the registry last update its published data? | `registryDatabaseUpdated` | evidence | It distinguishes registry data age from stack127 fetch time when present. | Show only in source metadata and only when present. |
| Lookup notes | Did normalization or a partial registrar fetch qualify the result? | `notes` | evidence | Engine notes preserve useful qualifications without competing with the verdict. | Show non-duplicate notes in a closed disclosure. A reduction notice stays visible and is removed from this list. |
| Raw registry and registrar responses | What did each RDAP service return? | `registryFetch` and `registrarFetch` body or error | evidence | Raw records prove the source and help diagnose partial data. | One disclosure per existing response. Do not render JSON open by default. |
| Downloadable report | Can I save all returned fields? | Existing `reportJson` output | omit | Saving the full lookup does not help the immediate availability decision, and raw evidence already supports verification. | Remove the download action from this focused checker. |
| Coverage operator, source, bootstrap URL, and unknown-TLD flag | How did the engine find the RDAP endpoint? | `coverage` | omit | Routing details belong in diagnostics and the TLD directory, not the main availability result. | Use only the no-service condition to offer the TLD directory link. |
| Query parser fields other than the displayed domain and reduction flag | How did normalization parse the input? | `query.input`, `domain`, `tld`, `suffix`, `isIdn`, and `guessedSuffix` | omit | They do not change the availability decision once the checked domain is named. | Do not add normalization badges or a key/value parser summary. |
| Request completion time and duration | How long did stack127 take? | `checkedAt` and `durationMs` | omit | Request latency does not make the registry verdict more useful. | Do not add timing metrics. |
| Registrar expiry date, changed date, transfer date, lock date, and full event list | What else has happened to the registration? | Remaining date and event fields | omit | These facts belong to Domain Registration Lookup or Domain Expiry Checker. | Do not create a history table or timeline. |
| Nameservers, DNSSEC, contacts, entities, and redactions | How is the domain configured and who appears in the record? | Remaining `DomainRegistration` fields | omit | They do not answer whether the registry has a record. | Keep them in the broader lookup tool and raw evidence only. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name | required | yes | No default on the clean route; an explicit `?name=` value may prefill it | visible | `ToolTextField` with `type="text"`, `inputMode="url"`, no capitalization, no autocomplete, and no spellcheck | It identifies the one registry record to check. The visible label is `Domain name *` and the example is `example.com`. | Full width above the button. The field error stays directly below it. |
| 2 | Check domain availability | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It starts the remote lookup and says what answer it produces. | Full width below the field with a comfortable hit height. |
| 3 | Check domain expiry | secondary action | no | Available for a registered result | result | Ordinary text link to `/domain-expiry?name=<normalized domain>` | It gives the useful next check for a taken name without competing with the verdict. | Wraps below registration facts. It never shares the primary button row. |
| 4 | Open lookup notes or a raw response | optional evidence action | no | Closed by default | disclosure | `ToolDisclosure` | It exposes optional qualifications and source proof after the interpreted result. | One full-width disclosure row per source. Expanded content stays contained. |

The clean `/domain-availability` route must remain unchanged through server render and hydration. An explicitly opened `?name=` query may prefill the field but must not submit automatically. Editing and submitting do not write defaults, normalized values, or results into the URL. This tool does not need a Share action.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Registry verdict | Does the registry currently have a record, or is the check inconclusive? | `status` and `query.unicode` | `ToolPrimaryResult` labeled `Registry result`, with one value and one concise detail sentence. Use `Registered`, `No registration found`, or `Cannot determine`. | Do not add a favicon, state pill, separate domain heading, or second answer paragraph. Never use `Available` for a 404 result. |
| 2 | Checked-name notice | Did stack127 reduce my input to another registrable domain? | `query.input`, `query.unicode`, and `query.reduced` | One conditional plain sentence directly after the lead | Omit when the entered and checked names refer to the same registrable domain. Remove the equivalent engine note from the notes disclosure. |
| 3 | Registration facts | What useful facts support a registered result? | Present values from `registrationDate`, `registryExpiryDate`, `registrar.name`, and filtered release-related `statuses` | `ToolKeyValueList` with the heading `Registration facts`; append one Domain Expiry Checker link when expiry or a release-related state is present | Render only for `registered`. Omit missing rows, unrelated statuses, contacts, DNS facts, and registrar expiry. |
| 4 | Recovery | Why can stack127 not determine the result, and what should I do next? | The specific unavailable `status`, `query.tld`, and coverage condition | One short sentence beneath the lead, plus either `Try again` through the same form action or a link to the TLD directory | Render only for cannot-determine states. Keep the valid input. Do not show raw provider wording as the main error. |
| 5 | Source and freshness | Which registry service answered, and when? | Registry host, `registryFetch.fetchedAt`, `registryFetch.fromCache`, and optional `registryDatabaseUpdated` | Quiet page-owned metadata `dl` after the interpreted result | Do not repeat `checkedAt`, duration, provider name, or the same date in another region. Omit host when no URL exists. |
| 6 | Lookup notes | What non-duplicate qualification came back with this result? | Filtered `notes` | Closed `ToolDisclosure` with an ordered or unordered list | Omit when no notes remain after deduplication. Do not repeat checked-name, availability, or request-failure copy. |
| 7 | Raw evidence | What exactly did each responding service return? | Registry and registrar response body or fetch error, kept separate | One closed `ToolDisclosure` and `ToolRawOutput` per existing source | Raw content comes last, stays closed initially, and owns its overflow. Do not merge sources or expose the download action. |

Read without this document, the result says: `example.com is registered`, `stack127-interface-contract-20260905-example.com has no registry record but may still be unavailable to buy`, or `stack127 cannot determine this result`. Registration facts explain why a taken name may still interest the person, recovery explains an inconclusive check, and source metadata plus raw responses prove where the answer came from.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large answer | One categorical registry verdict | Yes. Size and order make the single conclusion dominant without implying magnitude. | Use `ToolPrimaryResult` with one value and one detail sentence. |
| Timeline or progress bar | Time until a registered name might become available | No. Expiry, grace, redemption, pending delete, registry release, and drop catching do not form a predictable availability duration. | Omit. Link to Domain Expiry Checker for lifecycle detail. |
| Status comparison graphic | Registered, no registration found, and cannot determine | No. These are mutually exclusive states for one request, not quantities or stages. | Omit. Show only the current state as the lead answer. |
| Registration facts table | Creation, expiry, registrar, and lifecycle values for one domain | No. This is one record with unlike fields, not repeated records with a shared schema. | Replace with `ToolKeyValueList`. |
| Raw evidence table | Registry and registrar payloads | No. Their bodies vary and should retain source boundaries. | Replace with separate disclosures and raw output viewports. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Empty required field, enabled primary action, and no automatic request. An explicit `?name=` may prefill the field. | Absent | Absent | No error before submission | Normal document focus. No live announcement. |
| Incomplete or invalid | Preserve the entered value and keep submit enabled. | Absent | Absent | Show one precise error below the field, such as `Include the ending, such as .com or .org.` | Focus the domain field after submission. Associate the error and announce it once. |
| Loading | Keep the field visible, prevent duplicate submission, retain button width, and label it `Checking domain availability...`. Remove any previous result as soon as a new request starts. | Absent while the request is pending | Absent | A polite busy status states `Checking domain availability...` | Keep focus stable. Announce the busy state politely. |
| Registered success | Preserve the checked input and allow a new submission. | `Registered`, tied to the normalized domain | Present registration facts only, then source metadata and evidence | Domain Expiry Checker is available when relevant | Announce the lead result once through the result output. Move focus only when the existing application pattern requires it. |
| No-registration success | Preserve the checked input and allow a new submission. | `No registration found`, never `Available` | Lead detail names reserved, blocked, premium-priced, and just-released limits; then source metadata and evidence | No sales link or suggested alternative names | Announce the lead once. Semantic color must not make this look like guaranteed purchasing success. |
| No RDAP service | Preserve the checked input and allow another name. | `Cannot determine` | State that stack127 has no known RDAP service for the TLD | Link to the TLD directory. Do not suggest DNS as a fallback. | Announce the inconclusive result once. |
| Rate limited or blocked | Preserve the checked input. Re-enable the same primary action after the request ends. | `Cannot determine` | State that the registry refused or limited the request | Tell the person to try again shortly. Never show a no-registration result. | Announce the failure once without moving focus away from the retry path. |
| Timeout or registry failure | Preserve the checked input. Re-enable the same primary action. | `Cannot determine` | State that the registry did not return a usable answer | Tell the person to try again. Keep any provider detail in evidence. | Announce the failure once. |
| Partial registered result | Preserve the checked input and allow a new submission. | `Registered` | Omit missing registration fact rows. Show non-duplicate fetch or normalization notes in the disclosure. | Raw evidence remains available when returned | Announce the registered verdict. Do not replace unknown facts with estimates. |
| Expanded evidence or long value | Inputs and primary action remain above the result. | Unchanged | Open only the selected disclosure. Long Unicode names and URLs wrap or scroll within their owner. | The disclosure can close without losing the result | Disclosure semantics announce expanded state. Focus remains on its trigger unless the shared component specifies otherwise. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain input | `ToolTextField` | It keeps a visible required label, native text entry, field error, and focus behavior. | `ToolSearchField`, because the person enters one value rather than filtering a collection. |
| One remote lookup | `ToolButton` primary submit | It names the result and supports busy and disabled states. | Auto-submit, reset, and a second primary button, because they create requests or actions the task does not need. |
| Dominant categorical answer | `ToolPrimaryResult` | It gives one accessible label, one large verdict, and one plain detail sentence. | Existing result header plus favicon, state pills, and prose answer block, because they repeat the verdict and domain. |
| Registration facts for one record | `ToolKeyValueList` | The fields differ in meaning and may be absent, so key/value rows fit better than a repeated-record table. | `ToolMetricGroup` and cards, because equal visual weight would make dates and registrar identity look like competing answers. |
| Source and freshness | Page-owned semantic `dl` | A few provenance facts need quiet wrapping rather than a metric treatment. | State pills or a result card, because evidence must stay below the answer. |
| Optional notes and source proof | `ToolDisclosure` with `ToolRawOutput` for payloads | Native disclosure behavior keeps diagnostics reachable without opening them in the main reading path. | Always-open JSON, a modal, or downloadable report, because each adds friction or a second evidence path. |
| Registered next step | Ordinary text link | The next tool is navigation, not another action in this workbench. | Accent button or registrar sales link, because neither is the main action and the latter conflicts with the neutral checker. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | Full-width workbench band. Inside it, the labeled field takes the flexible column and the button aligns with the control. Results stack in contract order. | `this-is-a-deliberately-long-registered-domain-name.example` and `HOSTINGER operations, UAB` | No page overflow. Raw output viewports own their overflow. |
| Narrow mobile, 320px to 640px | Field, error row, and full-width button stack in task order. Lead, checked-name notice, facts, recovery, metadata, and disclosures keep the same order. Key/value rows stack when two columns no longer fit. | A 253-character ASCII domain, a long Unicode domain, and `stack127-interface-contract-20260905-example.com` | Domain text and metadata wrap anywhere. Raw output alone may scroll horizontally and vertically. |
| Expanded raw evidence at any width | Each disclosure remains in the normal result flow. Its viewport caps height and width without widening the workbench. | A complete RDAP response with nested notices and an unbroken 250-character URL | `ToolRawOutput` owns both horizontal and vertical overflow. The page never does. |
| Increased text size or long translations | Put the button below the field when a shared row no longer fits. Controls grow vertically and labels wrap without clipping. | `Checking domain availability...` at 200 percent text size | Text wraps within controls, facts, and metadata. No sibling covers an action or response. |

## Interface wireframes

### Desktop result

```text
Domain name *                              [Check domain availability]
[stack127.com                                                       ]

--------------------------------------------------------------------

Registry result
Registered
stack127.com has a current registry record. It is not available to register.

Registration facts
Registered            20 August 2026
Registry expiry       20 August 2029
Registrar              HOSTINGER operations, UAB
Lifecycle              Redemption period, not available to register

Check the domain expiry and lifecycle

Registry               rdap.verisign.com
Fetched                5 September 2026, from our cache
Registry data          5 September 2026

> Lookup notes
> Registry response from rdap.verisign.com
> Registrar response from rdap.hostinger.com
```

The no-registration result replaces the result body with:

```text
Registry result
No registration found
stack127-interface-contract-20260905-example.com has no registry record.
It may still be reserved, blocked, premium-priced, or already being caught.

Registry               rdap.verisign.com
Fetched                5 September 2026

> Registry response from rdap.verisign.com
```

### Narrow mobile result

```text
Domain name *
[stack127.com                       ]
[     Check domain availability    ]

------------------------------------

Registry result
Registered
stack127.com has a current registry
record. It is not available to
register.

Registration facts
Registered
20 August 2026
------------------------------------
Registry expiry
20 August 2029
------------------------------------
Registrar
HOSTINGER operations, UAB

Check the domain expiry and lifecycle

Registry
rdap.verisign.com
Fetched
5 September 2026

> Registry response
> Registrar response
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain name *
[example.com                         ]
[     Check domain availability     ]

INVALID
Domain name *
[example                             ]  <- focus
Include the ending, such as .com or .org.
[     Check domain availability     ]

LOADING
Domain name *
[example.com                         ]
[  Checking domain availability...  ]  disabled, busy
Checking domain availability...          polite status

EMPTY OR NO REGISTRATION
Registry result
No registration found
example.com has no registry record. It may still be reserved,
blocked, premium-priced, or already being caught.

PARTIAL REGISTERED RESULT
Registry result
Registered
example.com has a current registry record.
Registration facts
Registrar              Example Registrar
Unknown creation and expiry rows are omitted.
> Lookup notes

NO SERVICE
Registry result
Cannot determine
stack127 has no known RDAP service for .invalid.
See RDAP coverage in the TLD directory.

FAILURE
Registry result
Cannot determine
The registry did not return a usable answer. Try again shortly.
The domain field and primary action remain available above.

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

- Remove the existing favicon and domain result header. The lead detail already identifies the normalized domain.
- Remove the `Taken`, `No registration found`, `Check failed`, and lifecycle state pills. `ToolPrimaryResult` owns the one verdict, and semantic text can clarify a real warning without tinted badge treatment.
- Remove the downloadable JSON report from this focused checker. Separate raw registry and registrar disclosures provide the needed evidence.
- Replace the existing answer paragraphs with one lead detail, conditional registration facts, and a specific recovery sentence. Do not repeat the verdict in prose.
- Do not call a no-registration result `Available`, `Free`, or `Safe to buy`. RDAP cannot see reserved names, registry blocks, premium price, trademark risk, or a competing checkout.
- Do not add a registrar affiliate link, price, buy button, or alternative-name list.
- Do not show registrar contacts, nameservers, DNSSEC, redactions, unrelated statuses, all event dates, coverage routing, request duration, or parsing diagnostics in the interpreted result.
- Do not add a timeline, progress bar, comparison graphic, chart, or result table. None truthfully encodes this categorical answer or an availability schedule.
- Do not wrap the form, lead, registration facts, recovery, or evidence in separate cards. Keep one workbench band with one divider between input and result.
- Do not keep the previous domain verdict visible while a new request is pending. A stale result beside edited input can be mistaken for the current answer.
- Do not serialize a clean route, prefilled value, normalized name, or result into the URL during hydration or submission.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed lookup renders exactly one `ToolPrimaryResult` whose value is `Registered`, `No registration found`, or `Cannot determine`. | Browser tests with mocked registered, 404, no-service, rate-limited, blocked, timeout, and registry-error responses |
| UI-002 | deduplication | The normalized domain and verdict appear once in the interpreted result. There is no result-header favicon, state pill, duplicate answer paragraph, or repeated source timestamp. | Browser text-count assertions and inspection |
| UI-003 | visual-truth | The result contains no timeline, progress bar, chart, status-comparison graphic, or repeated-record table. Registration facts use key/value rows and raw sources stay separate. | DOM role assertions and Browser inspection |
| UI-004 | responsive | At 320px width and 200 percent text size, the task order remains field, primary action, lead, supporting facts or recovery, metadata, and evidence. The document has no horizontal overflow. | Browser measurements in dark and light themes |
| UI-005 | url | Opening `/domain-availability` leaves the URL unchanged through hydration. Opening an explicit `?name=` preloads without automatic submission, and later edits or results do not rewrite the URL. | Browser URL, history, and request-count assertions |
| UI-006 | input | Submitting empty, suffix-only, IP, malformed, and no-TLD values shows one precise field error, focuses the domain field, and preserves the entered text. | Browser keyboard and validation tests |
| UI-007 | loading | A lookup clears the previous result, keeps the input visible, prevents duplicate requests, retains button width, and announces `Checking domain availability...`. | Browser route interception and live-region assertion |
| UI-008 | no-registration | A registry 404 renders `No registration found`, names the checked domain, states the reserved, blocked, premium, and release limits, and never renders `Available` or success-green styling. | Browser test with an empty-body 404 fixture |
| UI-009 | registered | A registered result shows each available creation date, registry expiry date, registrar, and release-related lifecycle state once. Missing facts are omitted, and the result never predicts availability. | Browser tests with complete, partial, redemption, and pending-delete fixtures |
| UI-010 | failure | No-service, throttled, blocked, timeout, and registry-error states all render `Cannot determine`, preserve the input, give specific recovery, and never reuse no-registration wording. | Browser tests with one fixture per failure state |
| UI-011 | evidence | Source host, fetch time, cache state, and optional registry data date follow the interpreted result. Raw responses are closed by default and cannot cause page overflow when expanded. | Browser disclosure and overflow tests |
| UI-012 | accessibility | The required label is programmatic and visible, field errors are associated and announced once, loading and final results are announced, and every action works with a keyboard and visible focus. | Browser accessibility and keyboard checks |

## Open questions and blockers

- None. The existing engine and brief define the three verdicts, supporting registration facts, failure reasons, source evidence, URL input, and prohibited sales behavior needed for implementation.
