# Interface contract: DNS change checker

Status: ready
Tool: DNS change checker
Route: `/dns-change-checker`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:c36e397143d7385f1f2f7da6c23f768a290b5ebfe5e0f190bc29ffa1abfe9f71`

## Inspection evidence

- Browser backend: standalone Playwright CLI with the repository's installed Chromium 1223. The Codex in-app Browser was unavailable.
- Access: 5 September 2026 against the existing local preview at `http://127.0.0.1:3333/dns-change-checker`.
- Viewports and theme: 1440 by 1000 desktop, 390 by 873 mobile, and 320 by 780 minimum-width mobile in the default dark theme.
- Observed initial state: the clean URL stayed unchanged, the form exposed the hostname, all 11 record types, optional expected answer, and one submit action. The 1440px document had equal 1440px client and scroll widths. The main content box was 1,152px wide, the workbench was 936px wide, and the submit button was 864px wide.
- Observed invalid and loading states: empty submit showed `Enter a domain or hostname.`, but focus remained on the submit button. A delayed request changed the button to `Checking DNS...`, disabled it, and showed no new result.
- Observed success, empty, and partial states: the result kept authoritative sources before resolver caches, grouped matching answers, preserved raw-response disclosures, separated resolver failures from agreement counts, and showed the checker-side IPv6 note. The current expected-answer result appeared in a separate finding box.
- Observed failure: a 504 response preserved `example.com`, showed the API message once, and restored the submit action.
- Observed expanded and long-value state: raw JSON stayed within a 273px scroll viewport with a 360px height cap. A 4,096-character TXT result widened the 320px page to 351px. The contract therefore assigns overflow to inner evidence viewports and makes zero page overflow a release condition.
- Temporary screenshots: `/tmp/dns-change-initial-desktop.png`, `/tmp/dns-change-success-desktop.png`, `/tmp/dns-change-partial-mobile.png`, and `/tmp/dns-change-long-expanded-mobile.png`.

## User task

- Primary user: A domain operator who has changed one DNS record and wants to check the answers available now.
- Question: Do the authoritative nameservers and the checked public resolver caches show the DNS answer I expect?
- Lead answer: One sentence states whether usable authoritative answers agree, how many usable public resolver answers match the authoritative reference, and whether the expected value appears when one was supplied.
- Next decision: The operator can wait for caches, inspect an authoritative disagreement, or accept a deliberate location-aware difference.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain or hostname | What name should the checker query? | User input, normalized by `normalizeDiagnosticName` | input | The engine cannot discover the zone or query records without it. | Show the normalized name once in the result heading, not again in a summary row. |
| Record type | Which DNS record set should the checker compare? | User input from `CHANGE_RECORD_TYPES`, default `A` | input | It changes every queried answer and the comparison. | Keep the selected type in the result heading or lead only once. |
| Expected answer | Which new value is the operator looking for? | Optional user input, normalized by `normalizedChangeValue` | input | It enables a direct check without changing the DNS queries. | Fold the match finding into the lead sentence. Do not add a separate finding card. |
| Overall comparison | Do authoritative sources agree, and do resolver caches match their reference answer? | `summary.authoritativeServersAgree`, `matchingAuthoritativeSources`, `totalAuthoritativeSources`, `agreeingResolvers`, usable reply counts, and `expectedAnswerMatches` | lead | This is the decision the operator came for. | Do not repeat the counts in metrics, badges, or section introductions. |
| Authoritative answer groups | What does the zone publish at its reachable authoritative addresses? | `authoritative`, grouped by `groupDnsSources` | evidence | These answers establish the comparison reference and expose disagreements. | Show each record set once, followed by every source that returned it. |
| Resolver answer groups | What is present in each reviewed public resolver cache? | `resolvers`, grouped by `groupDnsSources` | supporting | These answers show which checked caches match or differ from the authoritative reference. | Show each record set once. Do not duplicate an identical value as a metric. |
| Source label and server address | Which source produced this answer? | `DnsSourceAnswer.label` and `server` | evidence | A grouped answer must still preserve source identity and authoritative address. | Keep names and addresses in the group source table, not in the lead sentence. |
| Record owner and alias | Which owner name produced each value? | `NormalizedDnsRecord.ownerName`, record type, and value | evidence | Owner names and CNAME answers prevent an alias chain from looking like one flat value. | Render each normalized record once inside its answer group. |
| Authoritative TTL | What TTL did the authoritative reply publish? | `records[].resolverTtlSeconds` on authoritative sources | evidence | It describes the published record and must stay distinct from cache time remaining. | Label it `Authoritative TTL`; never combine it with resolver TTL. |
| Resolver TTL | How long may this resolver keep its current cached answer? | `records[].resolverTtlSeconds` on resolver sources | supporting | It helps the operator decide whether waiting is reasonable. | Label it `Resolver TTL`; do not call it propagation time. |
| Unavailable source | Which checked source failed or returned no usable reply? | `error`, `responseCode`, and usable reply filters | supporting | A timeout is not a different DNS answer and must not enter the agreement denominator. | State unavailable counts in the lead and list the source once in its answer group. |
| Raw source response | Can the operator verify what the checker received? | `rawResponse`, `error`, source identity, and server | evidence | The brief requires complete evidence beside each source. | Keep it collapsed within the matching answer group. The download contains the same evidence without another visible block. |
| IPv6 connectivity state and skipped targets | Were any authoritative IPv6 checks skipped by this checker? | `ipv6Connectivity` and `skippedAuthoritativeTargets` | supporting | This explains missing checks without blaming the domain. | Show one quiet note and the affected sources. Do not repeat the note in each group. |
| Zone | Which zone owns the queried name? | Delegation result `zone` | evidence | It supplies the SOA follow-up target when authoritative answers differ. | Show it only in the follow-up link target or downloaded report. |
| Checked time and duration | When did this snapshot run? | `checkedAt` and `durationMs` | evidence | DNS cache answers change, so the result needs a timestamp. | Keep one quiet metadata line below the evidence. |
| Favicon | Does the hostname have a recognizable site icon? | Best-effort `/favicon.ico` load | omit | It does not help interpret DNS agreement and causes a shifting, unrelated visual identity. | Do not reserve an empty icon slot in the result heading. |
| Health score, world map, global propagation claim, and `ALL` query | Can the tool reduce distributed DNS behavior to one score or worldwide state? | Not supported by the engine or brief | omit | These formats imply coverage and certainty the checked sources do not provide. | Do not add them anywhere in the workbench or supporting result. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain or hostname | required | yes | User supplied, or explicit `name` query parameter | visible | `ToolTextField` with `required`, `autoCapitalize="none"`, `autoComplete="off"`, and `spellCheck={false}` | It identifies the DNS name to check. | Full width and first. Error stays directly below the field. |
| 2 | Record type | defaulted | yes | `A`, unless an explicit supported `type` query parameter was opened | visible | `ToolSelect` with all 11 supported types | Eleven choices do not scan well as a wrapping radio wall, but the active result-driving choice must remain visible. | Full width below the name. The listbox may overlay; it must not widen the page. |
| 3 | Expected answer | optional | yes when supplied; no when empty | No default | visible | `ToolTextField` labeled `Expected answer (optional)` | It turns the comparison into a direct check for the value the operator just changed. | Full width below record type. Long TXT values wrap or scroll inside the input, never at page level. |
| 4 | Check DNS change | primary action | not applicable | No default | visible | `ToolButton` with `variant="primary"` and submit semantics | It starts the network checks and names the result. | Full-width button below the fields. |
| 5 | Download report | secondary action | not applicable | Derived from the successful result | result | `ToolDownloadAction` labeled `Download report` | It preserves the complete comparison and raw evidence for handoff. | Full width only if the label would wrap; otherwise left-aligned below result metadata. |
| 6 | Expand raw response | secondary action | not applicable | Collapsed | result | `ToolRawOutput` per source, labeled with the source name | It exposes verification without putting JSON before the comparison. | The raw viewport owns both horizontal and vertical overflow. |

The clean canonical route remains `/dns-change-checker` through server render and hydration. The page may read explicit `name` and `type` parameters that the user opened. It does not serialize defaults, derived state, input edits, or a result into the URL. No Share action is needed because a shareable result is already covered by the downloadable report.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Comparison lead | Do the checked answers show the same current DNS change? | Authoritative agreement, majority reference counts, usable resolver match counts, unavailable resolver counts, and optional expected-answer matches | `ToolResultLead` as one direct sentence under a result heading such as `example.com A`. Use semantic text color only for the conclusion words. | No favicon, score, metric cards, badges, or second expected-answer finding. Never say `globally propagated`. |
| 2 | Authoritative answers | What record sets did authoritative nameserver addresses publish? | Grouped authoritative records, response codes, source names, addresses, authoritative TTLs, errors, and raw responses | Section titled `Published by authoritative nameservers`. Each record-set group shows values once, then a `ToolDataTable` of sources and TTLs, with a source-owned raw disclosure. | Keep this section before resolvers. Empty, failed, and non-authoritative replies remain explicit and do not silently become the reference answer. |
| 3 | Resolver cache answers | Which checked public resolver caches match, differ, return no record, or fail? | Grouped resolver records, response codes, source names, resolver TTLs, errors, and raw responses | Section titled `Seen in public resolver caches`, using the same group structure and source table as the authoritative section. Mark `Matches reference` in source status text when a reference exists. | A timeout is `No usable reply`, not `Different`. Do not imply that this set represents the world. |
| 4 | Conditional next check | What should the operator inspect when authoritative answers disagree? | `zone` and authoritative disagreement | One plain sentence with a link to `/soa-checker?name=<zone>` after the authoritative evidence | Omit when authoritative sources agree or no usable authoritative reference exists. Do not turn it into a prominent callout or primary action. |
| 5 | Snapshot and report | When was this comparison made, and how can it be saved? | `checkedAt`, `durationMs`, and complete report JSON | One mono, muted metadata line followed by the secondary download action | Do not repeat source counts or result wording here. |

Read alone, the result says whether the authoritative sources agree, whether the checked resolver caches match the reference answer, and whether the expected value appears. The authoritative section proves what the zone publishes. The resolver section shows what each reviewed cache currently returns. The conditional SOA link gives one recovery step, and the final metadata dates the snapshot.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Grouped source tables | Several sources share repeated fields while identical record sets should appear once | Yes. Rows preserve one source per row and columns preserve source, address, TTL, state, and evidence roles. | Use a table within each answer group. The table viewport owns overflow. |
| Timeline or progress bar | DNS answers may change as independent caches refresh | No. There is no shared start, end, denominator, or trustworthy worldwide time axis. | Omit both. State the snapshot and resolver TTLs as exact values. |
| World map | Public resolver answers might appear location-specific | No. The checker does not sample enough locations or expose location data to support map geometry. | Omit. Explain deliberate location-aware answers in supporting prose outside the workbench. |
| Agreement chart or allocation bar | Counts of matching and unavailable sources | No. Small denominators and mixed authoritative and cache roles would make length look like a health score. | Replace with exact counts in the lead and source rows as evidence. |
| Marker diagram | Relationship between authoritative publication and independent resolver caches | Not applicable to the direct result because no result value is encoded. | Omit from the workbench. Supporting content may use a conceptual diagram only if planned separately. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Name is empty unless an explicit query string supplies it. Record type is `A`. Expected answer is empty. Submit is available. | Hidden | Hidden | No error | Keep normal document focus. The clean URL stays unchanged through hydration. |
| Incomplete or invalid | Preserve all values and keep submit available so validation can explain the problem. | Hidden if there is no prior result | A prior successful result remains visible but is marked `Previous result`. | Show one error under the first invalid field. | Focus the first invalid field and announce the local error once. |
| Loading | Keep inputs visible. Disable duplicate submit and retain its width with `Checking DNS...`. | If no prior result, show `Checking authoritative sources and public resolver caches.` as status. If a prior result exists, keep it visible as `Previous result` until replacement. | Previous evidence remains visible but clearly stale. | The active request can end in success, partial success, or failure. | Announce loading through `ToolStatus`. Do not move focus. |
| Success with agreement | Preserve submitted values. Restore the submit label. | State authoritative agreement, usable resolver matches, unavailable count, and optional expected-answer presence in one sentence. | Show authoritative groups first, resolver groups second, then snapshot metadata and download. | No recovery prompt unless the evidence itself contains failures. | Announce the new lead result once. Move focus to the lead only when submission caused a large viewport jump. |
| Success with disagreement | Preserve submitted values. | State the majority authoritative reference count and resolver matches without calling minority answers broken. | Show every answer group and the conditional SOA link. | The SOA link is the next check if the difference was not expected. | Announce the lead. Keep the evidence reachable in document order. |
| Empty or no record | Preserve submitted values. | State that usable sources returned no record of the requested type, or that the empty answer differs from the reference when only some are empty. | Keep empty answer groups with source names, response codes, TTL when present, and raw evidence. | Suggest checking the name and type only when all usable answers are empty. | Announce `No <type> record returned by the checked sources.` once. |
| Partial result | Preserve submitted values. | Use only usable replies in agreement counts and state how many other sources had no usable reply. | Show successful, empty, failed, and checker-side IPv6-skipped sources separately. | A retry action is the same primary submit button. Keep valid input. | Announce the partial lead. Errors inside source rows remain readable but do not fire repeated alerts. |
| Service or network failure | Preserve all input and any prior result. Restore submit. | No new result. A prior result stays visible as `Previous result`. | Do not clear prior evidence. | Show the API message once beside the form and tell the user to retry. | `ToolStatus` uses danger tone and alert semantics. Focus the message only if focus would otherwise be lost. |
| Expanded raw evidence | Inputs and submit remain available. | Unchanged | One source disclosure opens in place. Its JSON preserves long unbroken values. | Closing returns focus to the same disclosure trigger. | Native disclosure semantics expose expanded state. The raw viewport is keyboard-scrollable. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Hostname and optional expected value | `ToolTextField` | Both are single text values with persistent labels, local errors, and DNS-safe input behavior. | A search field falsely suggests filtering a collection. |
| Eleven supported record types | `ToolSelect` | The set is bounded, and the selected result-driving value stays visible without a multi-line radio wall. | `ToolChoiceGroup` would turn 11 short codes into a large control block on narrow screens. |
| Primary request | `ToolButton` in a `ToolActionRow` | Native submit behavior supports Enter, loading, and one clear primary action. | A generic link or live-on-change request would obscure when network work starts. |
| Request and loading feedback | `ToolStatus` | It announces one scoped status and supports danger text without a tinted panel. | Repeating errors below the field, above the action, and in the result would compete with recovery. |
| Overall answer | `ToolResultLead` | A sentence can express agreement, usable denominators, unavailable sources, and the optional expected value more accurately than a single numeric tile. | `ToolPrimaryResult`, metric cards, and progress bars would imply one score or percentage is the answer. |
| Repeated source facts | `ToolDataTable` inside each record-set group | Sources share the same fields and need column alignment for name, address, TTL, and state. | Equal source cards would repeat the record set and give every fact the same weight. |
| Raw response | `ToolRawOutput` owned by each source row or its adjacent source evidence area | It keeps complete JSON available and gives long data an owned viewport. | Always-open `pre` blocks would bury the comparison and widen the result. |
| Downloaded evidence | `ToolDownloadAction` | It is a secondary result action with an accessible text label. | A primary-styled download button would compete with the DNS check. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop beside the real sidebar, at least 1024px viewport | Header, full-width workbench band, single measured input column, lead, authoritative evidence, resolver evidence, next check, metadata, download. Source tables use the available main-column width. | A 255-character hostname or owner name, a 4,096-character TXT value, a full IPv6 address, and a long nameserver hostname such as `a-very-long-authoritative-nameserver-name.example.net`. | The source table wrapper owns horizontal overflow. Raw evidence owns both axes. |
| Narrow mobile, 390px viewport | Keep the same order. Stack every input and action full width. Show record values above their source table. Keep disclosure triggers and source states on separate rows when needed. | The same DNS values and source names as desktop. Text wraps at safe boundaries without shrinking body text. | Source table and raw response viewports own overflow. The page never scrolls horizontally. |
| 320px minimum supported width | Preserve labels, required marks, selected record type, submit label, group headings, and evidence controls. Avoid side-by-side action placement. | Unbroken TXT, DNSKEY, and encoded raw-response strings. | Only the raw viewport may scroll for unbroken evidence. Table cells wrap where valid and otherwise scroll within the table wrapper. |
| Expanded raw response at any width | The disclosure stays in its source group and does not cover the lead or neighboring rows. Cap its visible height and allow keyboard scrolling. | Complete JSON report fragments with unbroken strings longer than 10,000 characters. | `ToolRawOutput` owns horizontal and vertical overflow. |

## Interface wireframes

### Desktop result

```text
DNS Change Checker: has your change propagated?
Check authoritative DNS answers against reviewed public resolver caches.

======================================================================
Domain or hostname *
[ example.com                                                   ]

Record type *
[ A                                                          v ]

Expected answer (optional)
[ 192.0.2.10                                                   ]

[ Check DNS change ]
----------------------------------------------------------------------
example.com A
The authoritative nameservers agree. 2 of 3 usable public resolver
replies match that answer, and the expected value appears in 4 sources.

Published by authoritative nameservers

192.0.2.10
+-------------------------+-------------+-------------------+----------+
| Source                  | Address     | Authoritative TTL | State    |
+-------------------------+-------------+-------------------+----------+
| ns1.example.net         | 192.0.2.53  | 300 seconds       | Answered |
| ns2.example.net         | 2001:db8::53| 300 seconds       | Answered |
+-------------------------+-------------+-------------------+----------+
> Raw response from ns1.example.net
> Raw response from ns2.example.net

Seen in public resolver caches

192.0.2.10
+-------------------+--------------+-------------------+
| Source            | Resolver TTL | State             |
+-------------------+--------------+-------------------+
| Cloudflare        | 241 seconds  | Matches reference |
| Google Public DNS | 188 seconds  | Matches reference |
+-------------------+--------------+-------------------+
> Raw response from Cloudflare
> Raw response from Google Public DNS

192.0.2.20
+-------------------+--------------+-------------------+
| Source            | Resolver TTL | State             |
+-------------------+--------------+-------------------+
| Quad9             | 120 seconds  | Different answer  |
+-------------------+--------------+-------------------+
> Raw response from Quad9

Checked 5 Sep 2026, 14:42 in 684 ms.
[ Download report ]
======================================================================
```

### Narrow mobile result

```text
DNS Change Checker: has your
change propagated?

================================
Domain or hostname *
[ example.com                  ]

Record type *
[ A                         v ]

Expected answer (optional)
[ 192.0.2.10                  ]

[ Check DNS change             ]
--------------------------------
example.com A
The authoritative nameservers
agree. 2 of 3 usable public
resolver replies match that
answer, and the expected value
appears in 4 sources.

Published by authoritative
nameservers

192.0.2.10
+----------------------------------->
| Source | Address | TTL | State     |
| ns1... | 192...  | 300 | Answered  |
+----------------------------------->
> Raw response from ns1.example.net

Seen in public resolver caches

192.0.2.10
+----------------------------------->
| Source | Resolver TTL | State      |
| Cloudflare | 241s | Matches        |
+----------------------------------->
> Raw response from Cloudflare

Checked 5 Sep 2026, 14:42 in 684 ms.
[ Download report               ]
================================
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL                INVALID
[ Domain ______ ]      [ Domain ______ ]
[ Type A      v ]      Enter a domain or hostname.
[ Expected ____ ]      [ Check DNS change ]
[ Check DNS change ]   Result hidden or marked Previous result

LOADING                         EMPTY
[ Checking DNS... disabled ]    No A record was returned by the
Checking authoritative          usable sources checked.
sources and resolver caches.    [ source rows and raw evidence ]
[ Previous result, if any ]

PARTIAL                          FAILURE
1 of 2 usable resolver replies   The DNS check took too long and was
matches. 1 other resolver did    stopped safely. Retry the check.
not return a usable reply.       [ Previous result, if any ]
[ answered and failed sources ]

EXPANDED RAW EVIDENCE
> Raw response from Cloudflare
+------------------------------------------+
| { "Status": 0, "Answer": [ ... ] }     |
| viewport scrolls without widening page  |
+------------------------------------------+
```

## Removed or rejected

- Remove the result favicon and its reserved empty slot because it does not help explain DNS agreement.
- Replace the 11-option wrapping record-type radio row with one visible bounded select.
- Remove the separate expected-answer finding card. The lead sentence already answers whether the value appeared.
- Avoid status badge backgrounds. Use direct state text with semantic text color where the meaning warrants it.
- Do not repeat grouped record values for every source address. Show the record set once and list its sources underneath.
- Do not combine authoritative TTL and resolver TTL under one `TTL` label.
- Do not add a progress bar, timeline, map, agreement chart, health score, `ALL` query, or global propagation claim.
- Keep raw responses collapsed beside their source evidence instead of opening large JSON blocks by default.
- Keep the SOA follow-up as a conditional text link. It must not become a second primary action.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | After a successful check, the first result sentence states authoritative agreement or unavailability, usable resolver matches, unavailable resolver count when nonzero, and expected-answer presence when supplied. | Browser with success, disagreement, unavailable, and expected-answer fixtures |
| UI-002 | deduplication | Each distinct normalized record set appears once per authoritative or resolver section, with every source that returned it listed below; the expected-answer result has no separate card. | Browser and grouped-source fixture inspection |
| UI-003 | visual-truth | The result has no progress bar, timeline, map, allocation chart, health score, or wording that claims worldwide propagation. | Browser inspection and static text assertion |
| UI-004 | responsive | At 390px and 320px, task order is unchanged and `documentElement.scrollWidth` does not exceed `clientWidth`; source tables and raw responses own their overflow. | Browser measurement with long TXT and raw-response fixtures |
| UI-005 | url | Opening `/dns-change-checker` leaves the address unchanged through server render and hydration; defaults and initial state are not added to the query string. | Browser history and URL assertion |
| UI-006 | inputs | Domain, record type, and expected answer remain visibly labeled; required controls expose required state; an invalid submission focuses the domain field and shows one local error. | Keyboard-only Browser check |
| UI-007 | loading | Submission retains the primary button width, prevents a duplicate request, announces `Checking DNS...`, and labels any retained result as previous until the new result arrives. | Browser with a delayed API fixture |
| UI-008 | partial | Resolver agreement excludes failed replies from its denominator, lists unavailable sources separately, and never labels a timeout as a different answer. | Browser with mixed success and timeout fixture |
| UI-009 | ttl | Authoritative source rows say `Authoritative TTL`, resolver rows say `Resolver TTL`, and neither value is presented as a worldwide propagation countdown. | Browser result inspection |
| UI-010 | evidence | Each checked source retains its label, server address when applicable, response state, records, TTL, error, and keyboard-reachable raw response; the JSON download preserves the complete result. | Browser expanded-state and download inspection |
| UI-011 | recovery | A failed request preserves valid input and any prior result, shows the API message once, and makes the same primary action available for retry. | Browser with failure after success fixture |
| UI-012 | order | Authoritative evidence always precedes resolver evidence, and the SOA follow-up appears only after authoritative disagreement with a usable reference. | Browser with agreement and disagreement fixtures |

## Open questions and blockers

- None. Standalone Playwright covered the current initial, invalid, loading, success, empty, partial, failure, long-value, narrow mobile, and expanded states. The current focus and 320px overflow defects are explicit acceptance requirements for the builder rather than unresolved product decisions.
