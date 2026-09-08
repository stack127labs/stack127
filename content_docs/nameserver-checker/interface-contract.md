# Interface contract: Nameserver Delegation Checker

Status: ready
Tool: Nameserver Delegation Checker
Route: `/nameserver-checker`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:fa7af65f3213be514cf0ed361126dc91a193fd7ba5979e14fe43790a45574079`

## User task

- Primary user: A domain operator finding why a parent delegation, child nameserver set, glue address, or authoritative server is not working.
- Question: Where does this delegation first disagree or fail between the parent zone, delegated zone, and each nameserver address?
- Lead answer: One diagnosis sentence that names the first actionable disagreement or failed server check, or confirms a complete healthy delegation when every required check passed.
- Next decision: The operator can update the registrar delegation or glue, update the zone NS or address records, repair one UDP or TCP endpoint, or retry a check that lacked usable evidence.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain or hostname | Which name should stack127 trace to its closest delegated zone? | User input normalized by `normalizeDiagnosticName` | input | One name is enough to discover the parent and delegated zone. | Do not add separate parent-zone, child-zone, or nameserver fields. |
| Check action | When should stack127 run delegation discovery and direct UDP and TCP probes? | User submission | input | The network work can take several seconds and needs one deliberate start and retry point. | Do not auto-run while typing or add another primary action. |
| First actionable diagnosis | Where does the delegation first disagree or fail? | Ordered `findings` plus guards over nameserver sets, checked reachability, transport authority, and SOA presence | lead | The first fix matters more than an undifferentiated list or a count. | Render one lead sentence. Remove the same finding from later issue rows. |
| Healthy evidence guards | Did every required delegation and server check pass? | Non-empty equal NS sets, no findings, at least one checked address, and successful authoritative SOA replies over UDP and TCP for every checked address | supporting | A healthy lead needs positive evidence, not two empty arrays or a reply on one transport. | These fields guard the healthy value of the single lead item. Do not render them as another result region. |
| Parent zone and delegated zone | Which handoff did stack127 discover? | `parentZone` and `zone` | supporting | The zones anchor registrar-side and DNS-provider-side fixes. | Show each zone once in the chain. Do not repeat them as metric cards. |
| Parent delegated NS set | Which nameservers does the parent hand off to? | `parentDelegatedNameservers` | supporting | This is the registrar-side list that resolvers see first. | Show each hostname once in the comparison table. The chain shows only the count. |
| Child published NS set | Which nameservers does the delegated zone publish about itself? | `childPublishedNameservers` | supporting | Comparing this set with the parent exposes incomplete provider moves and stale delegation. | Use the same comparison table. Do not add a second child list. |
| Nameserver-set agreement | Do the parent and child publish the same non-empty set? | Set comparison over parent and child names | supporting | Agreement is one required condition, but it is not a complete health verdict. | Show state in the comparison region. Do not repeat it as the lead unless no earlier issue exists. |
| Glue requirement | Does this hostname require parent glue, accept optional sibling glue, or need no glue in this referral? | `glueKind` from hostname, delegated zone, and parent zone | supporting | Bailiwick decides whether missing glue is an error. | Label one requirement per nameserver. Never call out-of-bailiwick absence missing glue. |
| Parent glue addresses | Which address records did the parent referral supply? | `parentGlue` with TTL | evidence | Required in-zone glue must exist and should match authoritative zone addresses. | Keep parent glue separate from resolved and authoritative-zone addresses. |
| Authoritative-zone addresses | Which A and AAAA records did the zone itself publish for an in-zone nameserver? | `authoritativeAddressObservations` | evidence | These records verify whether required glue is stale or wrong. | Show only when checked. `Not checked here` is not the same as no record. |
| Tested address inventory | Which public addresses did stack127 probe for each nameserver? | `nameserverAddresses` | supporting | Direct transport results are per address, not per hostname. | Each hostname and address pair appears once in the reachability table. |
| Address provenance | Where did a tested address appear? | Membership in parent glue, authoritative-zone observations, or resolver-discovered `nameserverAddresses` | evidence | Provenance separates referral glue from records resolved elsewhere. | Use source labels in the delegation evidence. Do not merge every address into a generic address cell. |
| UDP result | Did this exact address reply over UDP, with what response code and authority state? | `reachability[].udp` | supporting | Authoritative DNS must work over UDP, and a reply alone does not prove authority. | One UDP cell per address. Do not collapse it with TCP. |
| TCP result | Did this exact address reply over TCP, with what response code and authority state? | `reachability[].tcp` | supporting | Authoritative DNS must also work over TCP. | One TCP cell per address. Do not infer TCP from UDP. |
| SOA evidence | Did the probe receive an authoritative SOA for the delegated zone? | `reachability[].soa` and per-transport `authoritative` fields | supporting | A reachable service is not healthy unless it answers authoritatively for the zone. | Show owner and primary nameserver once. Leave serial comparison to the SOA checker. |
| IPv6 check scope | Did stack127 have a usable IPv6 route for the probe? | `ipv6Connectivity` and `skippedReason` | supporting | A checker-side skip must not become a domain failure. | Label each skipped IPv6 row as not run by this checker. Do not show `No reply`. |
| Network name, ASN, prefix, and country | Which network announces a tested address? | `addressDetails` | evidence | This gives operational context for shared failure risk without judging physical diversity. | Keep the data in the reachability table. Do not turn shared ASN or prefix into a score. |
| Exact shared IP finding | Do multiple nameserver hostnames use one address? | Engine `findings` | supporting | One server can fail all names even when hostnames differ. | Show the exact IP once as an issue. Do not infer shared machines from ASN or prefix. |
| Remaining findings | What else needs repair after the lead issue? | Remaining ordered `findings` | supporting | Every independent mismatch or failed address must remain visible. | Omit the finding already used by the lead. Preserve engine order for the rest. |
| Context notes | What limits or network facts change how the evidence should be read? | `notes` | supporting | IPv6 skips and shared network context can explain scope without blaming the domain. | Suppress any note already expressed by a skipped row or the lead. Do not style notes as failures. |
| Parent observation evidence | Which parent server returned the referral, NS set, glue, or error? | `parentObservations` and `parentNameservers` | evidence | It supports registrar-side diagnosis when parent replies differ or fail. | Keep detailed replies in the parent and child raw disclosure. |
| Child observation evidence | Which child address returned its own NS set or an error? | `childObservations` | evidence | It explains how stack127 built the child set and whether one child disagreed. | Keep detailed replies in the same delegation-evidence disclosure. |
| Authoritative address raw replies | What A and AAAA responses support the zone address comparison? | `authoritativeAddressObservations[].rawResponses` | evidence | Raw replies resolve discrepancies in normalized address rows. | Keep them contained with delegation evidence. |
| UDP and TCP raw replies | What complete SOA responses support each transport result? | `reachability[].rawResponses` | evidence | Raw transport replies verify response code and authority state. | Keep them in one reachability disclosure grouped by address. |
| Complete report download | How can the operator save all normalized and raw evidence? | `diagnosticReportJson` over the full `DelegationCheck` | evidence | The report preserves inputs, sets, glue, addresses, probes, SOA, context, findings, notes, and raw responses. | Offer one download action. Do not add another page-level full JSON dump. |
| Checked time and duration | When did stack127 run the check, and how long did it take? | `checkedAt` and `durationMs` | evidence | Quiet run metadata distinguishes current evidence from a saved result. | Show each once after the evidence, never as a metric card. |
| Input hostname result heading | Which submitted name led to this delegation? | `inputName` | omit | The input stays visible, and the lead names the delegated zone or affected server. | Do not add a second hostname heading above the diagnosis. |
| Website favicon | Which website icon responds for the submitted hostname? | Third-party favicon request | omit | A favicon is unrelated to delegation evidence and can fail independently. | Do not reserve a favicon slot in the result. |
| SOA serial comparison and DNSSEC status | Are server copies current and cryptographically valid? | Available raw SOA fields and separate tools | omit | These are separate diagnostic jobs with their own routes. | Do not add serial comparison or DNSSEC controls and conclusions here. |
| Rate-limit counter and trace internals | How did the server bound discovery? | API headers and internal trace state | omit | These details do not change the operator's diagnosis. | Show rate-limit errors only when they occur. Keep internals in the report when returned. |

The lead selection follows a fixed order. First handle missing usable delegation evidence. Then use the first parent-child mismatch, required glue problem, address-resolution failure, transport failure, non-authoritative reply, or missing SOA. Exact shared-IP findings follow server correctness failures. If no issue exists but no address was checked, the lead says the check is incomplete. Only a non-empty matching delegation with at least one checked address and authoritative SOA replies over both transports for every checked address earns the healthy sentence.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain or hostname | required | yes | No default on the clean route. An explicitly opened `name` query parameter may prefill it. | visible | `ToolTextField` with text input, URL input mode, no capitalization, no autocomplete, and no spellcheck | It supplies the one name used to discover the closest delegated zone. The persistent label is `Domain or hostname *`, and the example is `github.com`. | Full width first. Its error stays directly below the field. |
| 2 | Check nameservers | primary action | not applicable | No default. The user submits the form. | visible | Primary `ToolButton` submit | It starts discovery and every network probe, then provides the retry path. | Full width below the field. Keep its width stable while loading. |
| 3 | Download report | secondary action | no | Generated only from a completed API result | result | Secondary `ToolDownloadAction` | It preserves the complete normalized and raw evidence. | Full width below the lead on narrow screens. |

Enter in the hostname field submits. Blank or whitespace submission shows `Enter a domain or hostname.` below the field and focuses it. A server-side invalid-name message uses the same field scope. Timeout, rate-limit, service, and other request errors appear once below the action through `ToolStatus`.

During a request, the primary action keeps its width, changes to `Checking nameservers...`, exposes busy state, and blocks duplicate submission. Editing the hostname after an error clears the error. The entered value survives every failure.

Opening `/nameserver-checker` leaves the address unchanged through server render and hydration. An explicitly opened `name` query parameter may prefill the field, and that query string stays unchanged. Editing and submission do not serialize the name or result into the URL. There is no Share action because delegation evidence changes and the report download preserves a dated result.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Delegation diagnosis | Where does this check first disagree or fail, or did every required check pass? | Ordered findings plus guarded set, reachability, authority, and SOA checks | One `ToolResultLead` sentence. An issue lead names the first affected hostname, address, side, or transport. A healthy lead names the delegated zone and confirms non-empty set agreement plus authoritative UDP and TCP checks. | Do not add a hostname heading, favicon, health score, status badge, or generic sentence that claims every address was tested. |
| 2 | Delegation chain | Which parent zone hands off which delegated zone to how many nameservers and addresses? | `parentZone`, `zone`, unique parent NS count, and tested address count | One page-owned semantic ordered chain with three stages: parent referral, delegated zone, direct address checks. Use a neutral connector. | The chain shows scope, not health or elapsed time. Exact names and addresses belong in the tables. |
| 3 | Remaining issues and context | What else needs repair or changes how the evidence should be read? | Remaining `findings` and unique `notes` | A plain ordered issue list followed by a quiet context list when each has rows | Do not repeat the lead finding, skipped-row explanation, or exact table state. No boxed finding cards. |
| 4 | Delegation and glue comparison | Where do parent NS, child NS, glue, authoritative-zone addresses, and tested addresses differ? | Union of parent and child names, `parentGlue`, `authoritativeAddressObservations`, and `nameserverAddresses` | One `ToolDataTable` with nameserver, parent state, child state, glue rule, parent glue, zone addresses, and tested addresses. Use exact `Yes`, `No`, `Required`, `Optional sibling`, `Not required`, `No records`, `Not checked`, and error labels. | Never call absent out-of-bailiwick glue an error. Do not merge address sources into one unlabeled value. |
| 5 | Delegation raw evidence | Which parent, child, and zone-address replies support the comparison? | `parentNameservers`, `parentObservations`, `childObservations`, and authoritative address raw responses | One `ToolDisclosure` labeled `Parent, child, and address responses`, containing grouped `ToolRawOutput` views | Keep collapsed by default. Long replies scroll inside their own viewports. Do not show raw JSON as the only comparison. |
| 6 | Address checks | What happened at each nameserver address over UDP, TCP, and authoritative SOA lookup? | `reachability` joined to `addressDetails` | One `ToolDataTable` with nameserver and address, check scope, network, UDP, TCP, and authoritative SOA. Each transport cell includes reply state, response code, and authority state or error. | Keep one row per address. Do not collapse failures into one hostname boolean or describe checker-side IPv6 skips as no reply. |
| 7 | Reachability raw evidence | What complete UDP and TCP replies support each address row? | `reachability[].rawResponses` and per-transport errors | One `ToolDisclosure` labeled `UDP and TCP responses`, grouped by hostname and address with `ToolRawOutput` | Keep collapsed by default. Do not repeat normalized table facts as prose. |
| 8 | Complete report | How can the operator save every normalized result and raw response? | Full result serialized by `diagnosticReportJson` | One secondary `ToolDownloadAction` beside or below the lead | Report success only after the browser starts the download. Do not make it a second primary action. |
| 9 | Run metadata | When did this check run, and how long did it take? | `checkedAt` and `durationMs` | Quiet page-owned `dl` in small mono text after all evidence | Show each value once. Do not repeat duration in the lead or chain. |

Read without the internal reports, a faulty result says: `The delegation first fails at ns2.example.net: it appears at the parent but not in the zone's own NS records.` The chain identifies `com`, `example.com`, and the scope of direct address checks. The comparison table shows which list, glue rule, and address source produced the mismatch. The address table then keeps each UDP, TCP, SOA, and network fact separate. Remaining findings follow without repeating the lead. Raw disclosures verify the tables, and the download preserves the full result.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large diagnosis sentence | The first actionable problem or complete healthy conclusion | Not applicable. Reading order and type hierarchy make it dominant. | Use one `ToolResultLead`. Semantic text color may mark the issue phrase or healthy phrase. |
| Parent-to-child-to-address chain | Dependency from parent referral to delegated zone NS data to direct server probes | Yes. Document order and arrows encode a real DNS handoff. No segment claims duration or health. | Use a page-owned ordered chain. Use real zone names and scope counts, not equal cards or a server count as a verdict. |
| Delegation comparison table | Repeated nameservers with the same parent, child, glue, zone-address, and tested-address fields | Yes. Columns align the same evidence for every hostname. | Use `ToolDataTable`. Its viewport owns horizontal overflow. |
| Reachability table | Repeated address probes with the same scope, network, UDP, TCP, and SOA fields | Yes. One row maps one exact address to independent transport results. | Use `ToolDataTable`. Keep UDP and TCP in separate columns. |
| Timeline | Time spent at each handoff or server | No. The result has only total duration and no per-stage time axis. | Omit. Do not use `ToolTimeline`. |
| Progress bar | Completion across nameserver checks | No. Discovery does not know the final number of nameservers and addresses before it finishes. | Omit. Do not show a percentage or estimated remaining count. |
| Health score or gauge | Overall delegation quality | No. Glue, transport, authority, and network context are different facts without a valid shared denominator. | Omit. State the first issue and preserve exact evidence. |
| Finding cards | Relative importance of each engine finding and note | No. Equal boxes would make a checker-side IPv6 note compete with a failed parent handoff. | Omit. Use one lead, a plain remaining-issue list, and quiet context. |
| Network diversity chart | Failure independence across ASN, prefix, location, or machine | No. ASN and prefix do not prove physical or operational independence. | Omit. Show exact network facts as context only. |
| Favicon | Website identity as delegation evidence | No. It can load or fail independently of DNS delegation health. | Omit from the result. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean route | Empty hostname and enabled `Check nameservers` | Absent | All result regions absent | No instructional or empty-state panel | Normal document focus order. Nothing announces on load. The URL stays `/nameserver-checker`. |
| Initial explicit query state | Prefilled hostname from the opened URL | Absent | All result regions absent | The tool does not submit automatically | Normal focus order. Do not announce the prefill or rewrite the query string. |
| Invalid blank input | Preserve the blank or whitespace value | Absent | Absent | Show `Enter a domain or hostname.` once below the field | Focus the hostname field and connect the message through field error semantics. |
| Invalid hostname from server | Preserve the submitted value | Absent | Clear any previous result | Show the precise invalid-name message once below the field | Focus the hostname field. Do not add a second request error. |
| Loading first check | Preserve the input, disable duplicate submission, and label the button `Checking nameservers...` | Absent | Absent | The same primary action becomes the retry point after failure | Announce loading politely and expose busy state. Do not move focus. |
| Loading later check | Preserve the edited hostname and disable duplicate submission | Clear the prior diagnosis because it describes another submitted name | Clear prior chain, issues, tables, disclosures, and metadata | Never leave stale delegation evidence beside a changed hostname | Announce loading politely. Keep focus on the initiating control. |
| Complete healthy delegation | Preserve input and re-enable submit | Confirm that the non-empty parent and child sets agree and every checked address returned authoritative SOA replies over UDP and TCP | Show chain, comparison table, address table, raw disclosures, download, and metadata | The form remains ready for another check | Announce the diagnosis politely. Do not move focus into results. |
| Parent-child NS mismatch | Preserve input and re-enable submit | Name the first server present on only one side | Show full comparison, any further findings, address checks, evidence, and metadata | The parent side points to registrar settings. The child side points to DNS-provider NS records. | Announce the diagnosis as a warning. Leave retry available. |
| Missing or stale required glue | Preserve input and re-enable submit | Name the in-zone server and whether required glue is absent or differs from zone A and AAAA records | Show the bailiwick rule and both address sources in the comparison table | The parent glue is the registrar-side fix. The zone address record is the provider-side fix. | Announce the diagnosis as an error or warning. Do not label absent sibling or out-of-bailiwick glue as failure. |
| No public address | Preserve input and re-enable submit | Name the nameserver that did not resolve to a usable public address | Show it in the comparison table with no reachability row | The operator can repair its A or AAAA records and retry | Announce the diagnosis as an error. |
| UDP or TCP failure | Preserve input and re-enable submit | Name the exact hostname, IP address, and failed transport | Show independent UDP and TCP details, SOA evidence, remaining issues, and raw response disclosure | Retry remains available. The working transport must not hide the failed one. | Announce the diagnosis as an error. Do not focus the table. |
| Reply without authority or SOA | Preserve input and re-enable submit | Say that the exact address replied but did not return an authoritative SOA for the delegated zone | Show response codes and authority state for both transports, with `No SOA returned` when applicable | The operator can repair the authoritative service or remove the address from delegation | Announce the diagnosis as an error. Reachability alone never earns healthy status. |
| Shared exact IP | Preserve input and re-enable submit | If no earlier correctness problem exists, name the hostnames and exact shared address | Show the same address in each reachability row and retain network context | Treat this as shared failure risk, not proof of one physical machine | Announce as a warning. Do not infer the same issue from shared ASN or prefix. |
| IPv6 skipped with IPv4 checked | Preserve input and re-enable submit | Base the diagnosis only on completed checks and other issues | Keep each IPv6 row visible with `Skipped by checker: no IPv6 route`; keep IPv4 evidence unchanged | Do not add a domain failure for skipped IPv6 | Announce the result once. The skip note is ordinary context, not an alert. |
| Every address skipped by checker | Preserve input and re-enable submit | Say that the delegation sets were found but this checker could not test any address | Show comparison evidence and skipped rows | Retry may work from a checker with IPv6 connectivity | Announce an incomplete result as a warning. Never call it healthy. |
| Empty nameserver sets or no address rows | Preserve input and re-enable submit | Say exactly which usable delegation or address evidence is missing | Show any parent, child, or raw evidence that exists. Omit blank tables. | Report download and retry remain available | Announce an incomplete result as a warning. Two empty sets never count as agreement or health. |
| Partial result | Preserve input and re-enable submit | Name the first actionable issue while retaining successful checks | Show every returned set, address, completed probe, skipped probe, finding, and unique note | Missing evidence stays distinct from failure and checker-side skip | Announce the lead once. Supporting errors remain readable without repeated assertive announcements. |
| Request, timeout, or rate-limit failure | Preserve the input and re-enable submit | Absent | Clear any previous result so it cannot be mistaken for this request | Show the server message once below the action. `Check nameservers` remains the retry path. | Announce through `ToolStatus` with error semantics. Keep focus in the form flow. |
| Expanded delegation evidence | Input, lead, chain, and tables remain unchanged | Remains visible | Reveal grouped parent, child, and authoritative address JSON inside contained viewports | The summary closes the disclosure. Long records never widen the page. | Native disclosure semantics announce expansion. Focus stays on the summary until the person tabs inside. |
| Expanded transport evidence | Input, lead, chain, and tables remain unchanged | Remains visible | Reveal UDP and TCP raw replies grouped by exact hostname and address | The summary closes the disclosure. Null replies remain labeled. | Native disclosure semantics announce expansion. Each raw viewport owns overflow. |
| Download success or failure | Input and result remain unchanged | Remains visible | The action reports state only after the browser starts the download | Failure leaves visible evidence and raw disclosures usable | Announce the verified action state through the action label or nearby status. |
| Long values and increased text size | Input remains operable | The diagnosis wraps without clipping or changing meaning | Maximum DNS names, IPv6 addresses, network names, finding sentences, tables, and raw replies remain reachable | Inner table and raw viewports may scroll. The page must not scroll horizontally. | Focus rings remain visible. Magnified text does not overlap actions or evidence. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain name | `ToolTextField` | It keeps the required label, native text entry, field error, and focus target together. | `ToolSearchField`, because the person submits one name rather than filtering a collection. |
| One network action | Primary `ToolButton` submit | It provides one deliberate remote action with stable loading and disabled states. | Auto-run, reset, and another primary action, because none helps delegation diagnosis. |
| Request status | `ToolStatus` below the action | It announces loading and request failure without competing with a completed diagnosis. | Repeating one message below the field, button, and result region. |
| One result conclusion | `ToolResultLead` | A sentence can name the first list, glue, address, transport, authority, or evidence problem. | `ToolPrimaryResult`, hostname heading, favicon, score, badge, and count cards, because each would split or weaken the diagnosis. |
| Delegation handoff | Page-owned semantic `ol` with a neutral connector | Parent, delegated zone, and direct probes form a real dependency chain without a time axis. | `ToolTimeline`, because these are not dated events. |
| Remaining issues and context | Page-owned semantic lists | They preserve engine order and distinguish faults from scope notes without equal card weight. | Finding cards and alert panels, because they flatten priority and repeat table facts. |
| Nameserver and address comparisons | `ToolDataTable` | The collections repeat a stable schema and need aligned evidence. | Per-server cards, because they use more space and make parent-child and UDP-TCP comparison slower. |
| Deep DNS evidence | `ToolDisclosure` with grouped `ToolRawOutput` | It keeps raw replies near their normalized table while containing long values. | Always-open JSON, a modal, or one page-level dump, because each crowds the diagnosis or loses source context. |
| Complete report download | Secondary `ToolDownloadAction` | It preserves every normalized and raw field without becoming the primary task. | The custom unchecked download button, per-row downloads, and per-value copy actions. |
| Run metadata | Page-owned semantic `dl` | Checked time and duration are distinct quiet facts. | Metric cards, because metadata should not compete with the diagnosis. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench band spans the main column. Hostname and primary action come first. Results stack as diagnosis, download, chain, remaining issues and context, delegation table and raw evidence, reachability table and raw evidence, then metadata. | A 253-character DNS name, six nameservers, IPv6 addresses, and a long glue mismatch finding | No page overflow. Each data table and raw output viewport owns horizontal overflow. |
| Narrow mobile, 320px to 640px | Keep the same task order. Field and full-width action stack. Put download below the diagnosis. Chain stages stack vertically. Lists, tables, disclosures, and metadata follow in document order. | Four labels near the 63-character label limit, `2001:0db8:85a3:0000:0000:8a2e:0370:7334`, and a long network operator name | DNS names and readable findings wrap anywhere when safe. Tables and raw output alone may scroll horizontally. |
| Expanded delegation evidence at any width | Parent observations come first, then child observations, then authoritative address replies. Each source keeps a visible hostname and address label. | Many referral records plus long raw DNSKEY or TXT data included in a response | Each raw viewport owns horizontal and vertical overflow. The disclosure and page do not widen. |
| Expanded transport evidence at any width | Address groups stack. UDP comes before TCP inside each exact hostname and address group. Null replies show `No response captured`. | A long SOA response and long safe error message for every address | Each raw viewport owns overflow and caps height. Sibling groups remain in normal flow. |
| Increased text size or long localization | Keep input, diagnosis, chain, issues, and table headings in source order. Actions move below text before space becomes cramped. | `Skipped by checker because this runtime has no IPv6 route` at 200 percent text size | Text wraps inside its owner. No control, table column, disclosure, or focus ring is covered by a sibling. |

## Interface wireframes

### Desktop result

```text
Domain or hostname *
[example.com                                                          ]

[Check nameservers]

------------------------------------------------------------------------

The delegation first fails at ns2.example.net: it appears at the parent
but not in the zone's own NS records.                [Download report]

Delegation path

1  Parent referral              2  Delegated zone              3  Direct checks
   com                  ----->     example.com         ----->     2 nameservers
   2 NS records                                              3 addresses

Other issues
2. ns2.example.net did not resolve to a public IPv4 or IPv6 address.

Check context
IPv6 checks were skipped because this checker has no IPv6 route.

Delegation, glue, and addresses
Nameserver       Parent  Child  Glue rule    Parent glue   Zone A and AAAA  Tested addresses
ns1.example.com  Yes     Yes    Required     192.0.2.10    192.0.2.10       192.0.2.10
ns2.example.net  Yes     No     Not required None           Not checked      None

> Parent, child, and address responses

Nameserver address checks
Server and address         Scope   Network                    UDP                 TCP                 Authoritative SOA
ns1.example.com            Checked Example Network, AS64500  Answered, NOERROR   Answered, NOERROR   example.com
192.0.2.10                         192.0.2.0/24               Authoritative       Authoritative       primary ns1.example.com

ns1.example.com            Skipped Not reported               Not run              Not run              Not checked
2001:db8::53               No IPv6 route in checker

> UDP and TCP responses

Checked    5 September 2026 at 15:30 IST
Duration   1,240 ms
```

A healthy result replaces the first sentence with: `example.com has a healthy delegation. The parent and child publish the same two nameservers, and every checked address returned an authoritative SOA over UDP and TCP.` It omits issue and context lists when neither has unique rows.

### Narrow mobile result

```text
Domain or hostname *
[example.com                     ]

[        Check nameservers       ]

----------------------------------

The delegation first fails at
ns2.example.net: it appears at the
parent but not in the zone's own
NS records.

[        Download report         ]

Delegation path

1  Parent referral
   com
   2 NS records
   |
2  Delegated zone
   example.com
   |
3  Direct checks
   2 nameservers, 3 addresses

Other issues
2. ns2.example.net did not resolve
   to a public IPv4 or IPv6 address.

Delegation, glue, and addresses    -> contained table scroll
NS | Parent | Child | Rule | Parent glue | Zone addresses | Tested

> Parent, child, and address responses

Nameserver address checks          -> contained table scroll
Server | Scope | Network | UDP | TCP | SOA

> UDP and TCP responses

Checked
5 September 2026 at 15:30 IST
Duration
1,240 ms
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL CLEAN ROUTE
Domain or hostname *
[github.com                     ]  example placeholder
[        Check nameservers       ]

INVALID
Domain or hostname *              <- focus
[                                  ]
Enter a domain or hostname.
[        Check nameservers       ]

LOADING FIRST CHECK
Domain or hostname *
[example.com                     ]
[      Checking nameservers...  ]  disabled, busy
Checking nameservers...              polite status

LOADING LATER CHECK
Domain or hostname *
[new-example.com                 ]
[      Checking nameservers...  ]
No prior diagnosis or evidence remains visible.

HEALTHY
example.com has a healthy delegation. The parent and child
publish the same two nameservers, and every checked address
returned an authoritative SOA over UDP and TCP.
1 com -> 2 example.com -> 3 direct checks

EMPTY OR NO USABLE DELEGATION
The parent referral for example.com did not provide a usable
nameserver set, so stack127 could not test an authoritative server.
Parent, child, and address tables appear only when they have rows.
[        Download report         ]

PARENT AND CHILD MISMATCH
The delegation first fails at ns2.example.net: it appears at the
parent but not in the zone's own NS records.
The comparison table keeps both complete sets.

REQUIRED GLUE FAILURE
The delegation first fails at ns1.example.com: the com referral
did not include the required glue address.
Glue rule       Required, nameserver is inside example.com
Parent glue     None
Zone addresses  192.0.2.10

TRANSPORT FAILURE
The delegation first fails at ns1.example.com, 192.0.2.10:
the server did not answer over TCP.
UDP  Answered, NOERROR, authoritative
TCP  No reply, timeout
SOA  example.com, primary ns1.example.com

REPLY WITHOUT AUTHORITATIVE SOA
ns1.example.com at 192.0.2.10 replied, but it did not return an
authoritative SOA for example.com.

PARTIAL WITH IPV6 SKIP
The delegation first fails at ns2.example.net: it appears at the
parent but not in the zone's own NS records.
IPv4 row  Checked
IPv6 row  Skipped by checker, no IPv6 route
The skip is not listed as a domain failure.

EVERY ADDRESS SKIPPED
The parent and child nameserver sets agree, but this checker could
not test any address because it has no IPv6 route.

REQUEST FAILURE
Domain or hostname *
[example.com                     ]
[        Check nameservers       ]
The nameserver check took too long and was stopped safely.
No prior diagnosis or evidence remains visible.

EXPANDED DELEGATION EVIDENCE
v Parent, child, and address responses

Parent response, a.gtld-servers.net at 192.5.6.30
+--------------------------------+
| { "Status": 0, ... }          |  -> contained scroll
+--------------------------------+

Child response, ns1.example.com at 192.0.2.10
+--------------------------------+
| { "AA": true, ... }           |  -> contained scroll
+--------------------------------+

EXPANDED TRANSPORT EVIDENCE
v UDP and TCP responses

ns1.example.com, 192.0.2.10, UDP
+--------------------------------+
| { "Status": 0, "AA": true } |  -> contained scroll
+--------------------------------+

ns1.example.com, 192.0.2.10, TCP
+--------------------------------+
| No response captured.          |
+--------------------------------+
```

## Removed or rejected

- Remove the input hostname result heading and favicon. The lead identifies the affected zone, server, or address, and a favicon is not DNS delegation evidence.
- Replace the generic parent-list agreement sentence with one diagnosis that names the first actionable failure or proves a guarded healthy result.
- Never treat two empty NS sets as agreement or health. The current interface does both and shows zero address rows beneath a healthy claim.
- Clear a previous result when a new check starts or fails. The current tool leaves stale evidence visible beside a changed hostname and request error.
- Move blank-name validation below the hostname field and focus that field. The current form leaves focus on the submit button.
- Replace the three equal path cards with one semantic dependency chain. A server count alone does not describe health.
- Replace boxed finding and note cards with one lead, a remaining-issue list, and quiet context. Do not give checker-side limits the same weight as domain faults.
- Expand the delegation table into explicit glue rule, parent glue, authoritative-zone address, and tested-address columns. Do not merge sources or call every missing value glue failure.
- Expand UDP and TCP cells to show response code, authority state, and safe error. `Answered` alone is not enough.
- Replace the `Authoritative SOA` yes-or-no cell with the returned SOA owner and primary nameserver or a precise absent state. Do not compare serials here.
- Keep skipped IPv6 address rows visible, but label them as checker-side scope. Do not show them as `No reply` or count them as domain failures.
- Keep shared ASN, prefix, country, and network name as context. Do not infer physical diversity or turn them into a health score.
- Keep both raw disclosures collapsed and contained. They must not widen the workbench or page.
- Do not add metric cards for nameserver count, address count, issue count, runtime, or transport success.
- Do not add a progress bar, timeline, network map, diversity chart, or overall percentage score.
- Do not add resolver, transport, address-family, parent-zone, or nameserver controls that the API does not accept.
- Do not add SOA serial comparison, DNSSEC status, Share, per-cell copy, reset, or another primary action.
- Do not wrap the form, diagnosis, chain, tables, or disclosures in nested cards. Use the single workbench band, one divider, spacing, tables, and one structural connector.
- Preserve the supporting Markdown below the workbench. Do not copy its explanations into controls or results.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed result begins with one diagnosis sentence that names the first actionable mismatch or failed check, an incomplete evidence state, or a fully guarded healthy delegation. | Standalone Playwright with healthy, mismatch, glue, transport, authority, empty, and skipped fixtures |
| UI-002 | lead | Healthy appears only when both NS sets are equal and non-empty, at least one address was checked, and every checked address returned authoritative SOA replies over UDP and TCP. | Derived-state unit coverage and fixture-driven Browser inspection |
| UI-003 | deduplication | The finding used in the lead does not repeat in the remaining-issue list, and each nameserver-address pair appears once in the reachability table. | DOM text and row-count assertions |
| UI-004 | deduplication | No hostname result heading, favicon, generic agreement paragraph, health card, count card, or duplicate full-report JSON competes with the diagnosis. | Browser inspection and DOM assertion |
| UI-005 | visual-truth | The parent, delegated-zone, and direct-check stages form one semantic ordered chain with no time axis, health scale, progress percentage, or equal-duration claim. | DOM semantics and Browser inspection |
| UI-006 | visual-truth | Parent-child and UDP-TCP comparisons use tables with repeated fields. Network facts remain labeled context and never become a diversity score or chart. | Table header assertions and Browser inspection |
| UI-007 | input | The hostname has a persistent required label, Enter submits it, and there is exactly one primary action labeled `Check nameservers`. | Browser role and keyboard assertions |
| UI-008 | validation | Blank submission shows one hostname error and moves focus to the field. Server request errors appear once and preserve the entered hostname. | Standalone Playwright focus and error assertions |
| UI-009 | state | A later submission clears the prior result during loading. A failed later request does not restore or leave the prior diagnosis and tables visible. | Delayed and failed intercepted API responses in standalone Playwright |
| UI-010 | empty | Empty parent and child sets, no address rows, or only skipped address rows produce an incomplete lead and never a healthy claim. Blank tables stay absent. | Empty and all-skipped fixtures |
| UI-011 | delegation | Every nameserver comparison distinguishes parent membership, child membership, glue requirement, parent glue, authoritative-zone addresses, tested addresses, empty values, not-checked values, and errors. | Multi-source table fixture and cell assertions |
| UI-012 | reachability | Every exact address row keeps UDP and TCP separate and shows reply state, response code, authority state, safe error, SOA owner and primary server, check scope, and network context when known. | Mixed UDP, TCP, authority, SOA, and enrichment fixture |
| UI-013 | ipv6 | An IPv6 row skipped because the checker lacks a route remains visible as `Skipped by checker`, has no domain-failure wording, and does not affect completed IPv4 conclusions. | IPv6-skip fixture and DOM assertions |
| UI-014 | evidence | Parent, child, authoritative-address, UDP, and TCP raw replies remain grouped by their source hostname and address inside two collapsed disclosures. | Expanded-state Browser inspection |
| UI-015 | responsive | At widths from 320px through desktop, a 253-character input, maximum hostname labels, IPv6 addresses, long findings, and expanded raw responses create no page-level horizontal overflow. | Playwright equality assertion for document `scrollWidth` and `clientWidth` |
| UI-016 | responsive | Only the table or raw viewport that owns long content scrolls. No sibling covers a column, action, disclosure, or focus ring at narrow widths or 200 percent text size. | Browser inspection and element overflow measurements |
| UI-017 | accessibility | Loading, diagnosis, and request failure changes are announced. Checker-side context and per-row evidence do not trigger repeated assertive announcements. | Accessibility tree and live-region assertions |
| UI-018 | url | Opening `/nameserver-checker` leaves the URL unchanged through server render and hydration. An explicit `name` parameter remains as opened, and edits or submissions do not serialize state. | Standalone Playwright URL and history assertions |
| UI-019 | action | `Download report` appears only with a completed result, uses secondary styling, and saves every normalized field and raw response. | Download event and parsed JSON assertions |

## Open questions and blockers

- None. The engine fields, deterministic findings, brief, and current published behavior support a guarded lead diagnosis without adding a new data source or user control.
