# Writing and SEO plan: IP and ASN registration lookup

Status: ready
Feasibility: feasible
Content review: 2026-09-19
Acceptance path: Main-agent review, then the retained Astra writing session; Luna integrates only accepted words.
Tool: IP and ASN registration lookup
Route: `/ip-asn-lookup`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-09-10
Primary medium: Tool UI
Content depth: Explain how to read the registered allocation or ASN record, why current BGP data is separate, what the country and abuse fields do and do not mean, and what to verify next. Stop before geolocation, reputation, subscriber identity, CIDR analysis, or broad IP intelligence.

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `IP address lookup`, `ASN lookup`, `IP and ASN lookup` | Identify the registered organization for one public IP or ASN and inspect a useful abuse contact | One input, one source-labeled RIR result, allocation or ASN facts, optional current route context | The tool leads; the guide explains registry scope, BGP separation, field meaning, and verification limits |

Search backend: web connector. Search engines were not individually available. Browser backend: standalone Playwright CLI for competitor and visual checks because the in-app Browser was unavailable. Competitor and result-shape observations used 1280x900 desktop and 375x812 mobile viewports on 2026-09-10.

### Intent not targeted

- CIDR or subnet analysis: this launch accepts one public IP address or ASN; a future prefix tool would own range analysis.
- IP geolocation: the registered country is a registry field, not a map or physical-location answer.
- IP reputation, malware, port, or subscriber identity: no reputation or subscriber source is in the product contract.
- Reverse DNS or domain registration: link to the DNS and domain tools when the next question starts with a hostname or domain.

## Page promise

Resolve one public IP address or ASN to the responsible RIR record, show the published holder and abuse contact, and add current BGP context only as a separate, source-labeled answer.

Reading flow: the visitor gets the source-labeled answer first, then reads what the allocation and ASN fields mean, why a route can name a different network, how to use an abuse contact, and which claims require a different lookup or direct verification.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Introduction and lead result | Tool UI | `brief.md`, `implementation-report.md` | Do not repeat the holder sentence below the tool |
| Which inputs, modes, units, sources, or scope choices matter? | Tool input and `How RDAP chooses a registry` | Tool UI | `implementation-report.md`, IANA bootstrap files, RFC 9224 | Do not restate accepted IP and ASN syntax as a second control |
| How should someone choose meaningful inputs and use it for the real task? | Introduction and `How to verify a result` | Sentences | `brief.md`, `implementation-report.md` | Explain investigation context, not ordinary button clicks |
| How should the result and its important terms or uncertainty be interpreted? | Live allocation table, BGP section, source metadata, and `What the registered record means` | Sentences | `interface-contract.md`, RFC 9082, ARIN RDAP guide | Do not copy table values into prose |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | `Registration and current routing are different records` and `What this lookup does not identify` | Sentences | `implementation-report.md`, Team Cymru documentation, competitive report | Explain the boundary once; keep the relationship strip exact and compact |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | `What this lookup does not identify` | Sentences | `implementation-report.md`, RFC 9082, competitive report | Name geolocation, subscriber identity, reputation, service inventory, and CIDR scope without adding a warning panel |
| How are user inputs handled? | `How to verify a result` and `What this lookup does not identify` | Sentences | `implementation-report.md`, `edge-cases-and-tests.md` | State local validation, bounded upstream work, no result in the URL, and no analytics payload; do not promise anonymous networking beyond the implemented behavior |
| What should the reader verify or do next? | `How to verify a result` | Sentences | `implementation-report.md`, `tool-pages.md` | Point to the registry record, raw RDAP, `/dns-lookup`, or `/domain-lookup` without adding a generic links list |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: IP and ASN registration lookup | Who is this for and what answer will I get? | Submit one public IP or ASN to see the responsible RIR record, its published holder, and optional route context. | Tool UI | `brief.md`, `interface-contract.md` | The live lead answer owns the immediate result. | n/a |
| 2 | H2: What the registered record means | Which fields describe the RIR record? | Explain allocation or ASN range, handle, status, registered country, holder, events, source, and missing values. | Sentences | `implementation-report.md`, RFC 9082, ARIN RDAP guide | Do not list values already visible in the result. | COPY-01 |
| 3 | H2: How RDAP chooses a registry | Why did this result come from this RIR? | IANA bootstrap data selects a reviewed RIR service locally; the tool sends one fixed `/ip/<address>` or `/autnum/<number>` request. | Sentences | `implementation-report.md`, RFC 9224, IANA bootstrap files | Do not turn the guide into an RDAP implementation reference. | COPY-02 |
| 4 | H2: Registration and current routing are different records | Why can the RIR holder and route origin differ? | RIR registration describes a registry allocation; Team Cymru context describes a current BGP origin and announced prefix. Either can be absent, and neither is a subscriber or reputation verdict. | Sentences | `brief.md`, Team Cymru documentation, `interface-contract.md` | The relationship strip is the visual; prose explains the consequence without repeating its labels. | COPY-03 |
| 5 | H2: What an abuse contact is for | What should I do with the contact? | Use the published abuse role for a network report, and include the address, time, observed protocol or URL, and relevant logs. The contact does not prove who used the address. | Sentences | `competitive-report.md`, normalized abuse contract, RIR source links | Do not invent a universal response promise or identify a subscriber. | COPY-04 |
| 6 | H2: What this lookup does not identify | Is this a location, owner, reputation, or service inventory tool? | Registered country is not geolocation; a holder is not necessarily the current operator, subscriber, or person; no reputation, ports, or CIDR conclusions are provided. | Sentences | `competitive-report.md`, RFC 9082, `implementation-report.md` | Keep each boundary tied to the result question; no generic caveat block. | COPY-05 |
| 7 | H2: How to verify a result | What should I check before acting on it? | Use the linked registry record and raw RDAP response, compare the route section separately, and use DNS or domain lookup when the investigation begins with a name. | Sentences | `implementation-report.md`, `tool-pages.md` | Do not restate source metadata or create a second results table. | COPY-06 |
| Usage | H2: Use the tool for your task | Which inputs should I bring, and what should I do with the outcome? | Use the closed Usage Markdown handoff below. | Sentences | Accepted technical artifacts and route behavior | Explain meaningful choices and next action; no button narration or duplicate live results. | COPY-07 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Input classification | One public IPv4, IPv6, or ASN is normalized before any upstream work. Private, reserved, malformed, and CIDR values are rejected locally. | Sentences beside the scope explanation | `implementation-report.md`, RFC 1918, RFC 5737 | State before discussing registry selection. |
| Registry selection | The committed IANA bootstrap range data maps the input to one reviewed RIR base URL. | Sentences | IANA IPv4, IPv6, and ASN bootstrap files; RFC 9224 | Say that an unknown or unavailable service stays unknown. |
| RDAP request | The tool uses the fixed IP network or autnum path on the selected RIR service and normalizes the response as untrusted data. | Sentences | RFC 9082; ARIN and APNIC RDAP documentation | Keep request mechanics short and do not promise universal coverage. |
| Result state | `registered`, `not_registered`, `rate_limited`, `blocked`, `timeout`, `registry_error`, and `no_service` describe what the lookup established. | Tool UI | `implementation-report.md`, `edge-cases-and-tests.md` | Explain uncertainty beside failure states; never turn failure into a plausible holder. |
| Current route context | Team Cymru can add origin ASN, announced prefix, country code, and network name for a public IP. | Separate BGP result section and COPY-03 | Team Cymru IP to ASN mapping | State that routing context is optional and answers a different question. |

## Metadata proposal

- Registry label: `IP and ASN lookup`
- Meta title: `IP and ASN registration lookup`
- Meta description: `Look up the RIR record for a public IP or ASN, with source-labeled BGP context when available. Registration is not geolocation or reputation.`
- Page type: `WebApplication`
- Publication recommendation: Keep unpublished until the registry, source-provenance, and content review is approved.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/dns-lookup` | Resolve a hostname to an IP before checking its registry record | `DNS lookup` | COPY-06 when the starting point is a hostname |
| Out | `/domain-lookup` | Continue with domain registration facts when an IP investigation leads to a domain | `domain lookup` | COPY-06 when the starting point is a domain |
| In | `/dns-tools` | Give DNS-tool visitors a clear next step when they need IP registration context | `IP and ASN registration lookup` | Collection or related-tools placement after publication |
| In | `/domain-tools` | Give domain-tool visitors a path when the question has become network registration | `IP and ASN registration lookup` | Collection or related-tools placement after publication |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | What the registered record means | Help a reader interpret the exact fields after the lead answer | RIR allocation or ASN scope, holder entity, range, handle, status, registered country, dates, source, and `Not published` behavior from the implementation and interface contracts; RFC 9082 and ARIN RDAP guide | Define why the record is useful and why the registered country is a record field. Stop before geolocation. | Do not repeat the live table or call the holder a subscriber, person, or current route operator. |
| COPY-02 | How RDAP chooses a registry | Make source selection understandable without exposing implementation noise | IANA bootstrap files, RFC 9224, RFC 9082, fixed reviewed HTTPS bases, one IP or ASN scope | Explain the source path and unknown states in a few connected paragraphs. Stop before code or cache internals. | Do not claim every address has a usable public record or call RDAP a reputation service. |
| COPY-03 | Registration and current routing are different records | Prevent the most important interpretation error | RIR registration versus Team Cymru current BGP origin, prefix, country, and network name; optional and potentially disagreeing states | Explain the consequence for incident triage and leave exact route fields to the result section. | Do not merge the holder and origin ASN, call either answer ownership proof, or promise real-time freshness. |
| COPY-04 | What an abuse contact is for | Turn a published contact into a responsible next action | Abuse role fields, linked contact form or email, a report should include address, time, protocol or URL, and logs; source remains the RIR record | Give practical reporting context and say what the contact cannot establish. Stop before advice about a specific incident. | Do not promise a response, identify a subscriber, or invent a reporting policy. |
| COPY-05 | What this lookup does not identify | Set the limits beside the claims most likely to be overread | Not geolocation, subscriber identity, person identity, reputation, malware verdict, port list, service inventory, or CIDR analysis; private and reserved inputs are rejected | Use connected sentences with concrete boundaries. Stop once the reader knows which next question needs another tool. | Do not add a map, score, threat label, or broad IP intelligence promise. |
| COPY-06 | How to verify a result | Give the reader a short path from lookup to action | Registry record link, raw RDAP disclosure, source and fetched or cached time, separate BGP comparison, `/dns-lookup`, `/domain-lookup`, no clean-URL result restoration, bounded request and no analytics payload | Explain what to verify and which adjacent tool continues the job. Stop before a generic FAQ or troubleshooting catalog. | Do not repeat the source metadata, claim local-only processing, or serialize the query into the URL. |
| COPY-07 | Task-oriented usage | Explain input preparation, meaningful choices, states, and next verification. | Closed Usage Markdown handoff and accepted technical artifacts. | One concise connected guide; use steps only where order changes the outcome. | No live-result narration, unimplemented features, or duplicate supporting explanations. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` for public wording. This plan owns search intent and useful coverage, not a separate voice.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, freshness guarantees, or response behavior.
- Do not repeat a result, table, relationship strip, heading, or prior section.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The writer supplies them in the later content pass.

## Source ledger

- IANA IPv4 RDAP bootstrap: https://data.iana.org/rdap/ipv4.json, checked 2026-09-10. Supports local RIR selection for IPv4.
- IANA IPv6 RDAP bootstrap: https://data.iana.org/rdap/ipv6.json, checked 2026-09-10. Supports local RIR selection for IPv6.
- IANA ASN RDAP bootstrap: https://data.iana.org/rdap/asn.json, checked 2026-09-10. Supports local RIR selection for ASNs.
- RFC 9224: https://www.rfc-editor.org/rfc/rfc9224, checked 2026-09-10. Supports RDAP bootstrap discovery.
- RFC 9082: https://www.rfc-editor.org/rfc/rfc9082, checked 2026-09-10. Supports IP network and autnum query paths and result scope.
- ARIN RDAP guide: https://www.arin.net/resources/registry/whoisrws/rdap/, checked 2026-09-10. Supports network and autnum field interpretation.
- APNIC RDAP documentation: https://www.apnic.net/about-apnic/whois_search/about/rdap/, checked 2026-09-10. Supports standardized RDAP query behavior.
- Team Cymru IP to ASN mapping: https://www.team-cymru.com/ip-asn-mapping, checked 2026-09-10. Supports separate current BGP route context.
- RFC 1918: https://www.rfc-editor.org/rfc/rfc1918, checked 2026-09-10. Supports private IPv4 scope.
- RFC 5737: https://www.rfc-editor.org/rfc/rfc5737, checked 2026-09-10. Supports documentation IPv4 scope.
- Stack127 implementation contract: `content_docs/ip-asn-lookup/implementation-report.md`, checked 2026-09-10. Supports product boundaries, privacy behavior, caching, and result states.
- Stack127 interface contract: `content_docs/ip-asn-lookup/interface-contract.md`, checked 2026-09-10. Supports result hierarchy and visual ownership.

## Open questions and blockers

- None. The content plan is ready for the manual prose pass. Publication remains a separate registry decision.


## Usage Markdown handoff

Disposition: Closed and feasible for the retained Astra writing session after main acceptance.

### Assignment and reading order

COPY-07 owns `usage_markdown`: explain the real task, inputs worth preparing, meaningful mode choices, important state distinctions, and the next verification. The existing manual assignments own the introduction, supporting explanations, metadata, and identified interface review only. Where an older assignment discusses how to choose an input, move that instruction into this usage assignment and retain only its conceptual explanation below. Do not repeat it in both fields. Interface inventories are review-only; this plan does not authorize implementation or rewriting dynamic findings.

### Technical facts and meaningful inputs

Start with one public IP address or ASN from the connection or log under investigation. Accept an ASN with or without AS; do not substitute a hostname, CIDR, private address, or reserved value. IANA bootstrap selects the RIR RDAP service. Registration records describe allocated resources; optional Team Cymru routing context for an IP is a separate observation. Missing fields mean Not published, not an empty organization or zero-valued fact.

### State interpretation and recovery

Distinguish registered, RDAP 404 not_registered, rate_limited, blocked, timeout, registry_error, and no_service. A routing lookup failure must not erase a successful registration record. Retry transient failures; correct invalid input before retrying. Do not interpret missing routing data as proof that an address is unrouted.

### Limitations and next action

No device location, household identity, reachability, ownership verification beyond registry data, reputation score, or guarantee that registration and observed routing organizations match.

### Input handling boundary

This is not a local-only tool: the query is sent to the site lookup service and upstream registration services, with optional routing-provider lookup. Do not promise anonymity, no logging, or no third-party processing. Do not serialize returned personal/contact records into sharing copy. The implementation and accepted technical evidence support only these route-specific statements. Do not infer a general retention, logging, analytics, cookie, or anonymity policy.

### Content, media, and list requirements

Keep the interactive tool first. Preserve all outline tables and exact result media; their repeated fields belong in tables, not comparison paragraphs. Existing output values, counts, findings, formulas, and captions stay in the live result rather than a second narrative. No new screenshot, marker drawing, generated illustration, or chart is required. If an ordered list is used, it must represent dependent task steps; use an unordered list only for genuinely independent checks. Do not add a generic FAQ or a list-shaped summary of every control. Every retained table must ship with useful headers and its limitation, not merely a heading placeholder.

### Source ledger and links

Use the existing source ledger for attributable claims, with links at the point of explanation. The ready implementation, interface, edge-case, and brief artifacts govern what this tool actually does; official sources govern external rules. Local assumptions must be labeled rather than attributed to a standards body or platform. Preserve the ledger's checked dates; a content review is not a claim that every source was freshly reverified. Conditional internal destinations: /dns-lookup; /whois-lookup. Include them only when the exact route is published at integration; all new batch tools remain unpublished. If a destination is unavailable, omit the link rather than invent a URL or publish its target.

### Feasibility and ownership

The accepted implementation can support this plan without new controls, engines, media, data sources, or implementation work. Astra supplies words only after acceptance. Luna performs content integration later. Neither this plan nor its validator result changes database content, registry publication, tool version, or deployment.
