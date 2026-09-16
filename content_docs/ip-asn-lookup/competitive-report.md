# Competitive report: IP and ASN registration lookup

Status: ready
Tool: IP and ASN registration lookup
Route: `/ip-asn-lookup`
Researched: 2026-09-10
Direct competitors reviewed: 8
Saturation exception: no

## Research scope

### Current stack127 state

The route is planned as a flat canonical URL. The existing domain collection README describes IP and ASN registration lookup as a related network lookup, but also notes that it is not a domain tool. The old planning note has been superseded by the flat route in `content_docs/domain-tools/README.md` and by this report.

The repository already has an RDAP engine for domain registration and committed IANA domain bootstrap data. `lib/domain/rdap.ts` provides bounded HTTP retrieval and cache-aware response handling. `lib/dns/network-enrichment.ts` already parses Team Cymru data for current BGP origin ASN, announced prefix, and network description. That source is useful context, but it must remain visibly separate from RIR registration data.

The implementation must therefore resolve two different facts:

- RIR RDAP: the current registered allocation or ASN record, its holder, contacts, dates, and registry.
- BGP context: the network currently announcing an IP route, when an IP lookup can resolve it.

The tool accepts one public IPv4 address, IPv6 address, or ASN. It rejects CIDR input at launch and rejects private, loopback, link-local, documentation, multicast, and other non-public IPs before any outbound request. An input that is neither an IP nor an ASN links to DNS Lookup rather than guessing a hostname lookup.

### Method and coverage

I searched the web connector for IP ASN lookup, who owns an IP address, RDAP IP lookup, and IP lookup with abuse contact or BGP context. Search results were screened for a directly usable lookup surface, not generic articles or API landing pages. I inspected eight direct competitors with standalone Playwright CLI and headless Chromium because the in-app Browser reported that no browser was available.

- Search backend: web connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI
- Accessed: 2026-09-10, Asia/Kolkata
- Viewports: 1280x900 and 375x812
- Operation probes: valid IPv4 `1.1.1.1` or `8.8.8.8`, valid ASN `AS13335` where supported, malformed input, and private IPv4 `192.168.1.1` where supported
- Access limits: WhatIsMyIP returned HTTP 403 from the research environment. client.rdap.org loaded, but its registry options did not finish loading before the interaction timeout, so its page-level behavior is documented and its successful result behavior is marked unknown.

### Search saturation evidence

- Queries tried: `IP ASN lookup`; `who owns an IP address ASN lookup`; `RDAP IP address lookup RIR`; `IP lookup RDAP abuse contact BGP`
- Repeated domains: RDAP clients and IP intelligence services recur, but the result shapes split into registry lookup, BGP exploration, geolocation, and abuse-oriented tooling.
- Exclusions: general WHOIS explainers, API-only products, DNS-only tools, reputation databases, and generic IP geolocation pages were not counted as direct competitors.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Find the registered holder | `who owns 1.1.1.1` | The allocation holder, range, registry, and country field with a clear warning about what country means | Registry lookup or IP intelligence summary |
| Find an abuse contact | `IP address abuse contact` | A usable abuse role contact and enough context to report the event | RDAP record, raw WHOIS, or abuse directory |
| Understand an ASN | `AS13335 lookup` | The ASN holder, registered range, registry, country, status, and dates | ASN registry result or BGP profile |
| Explain a mismatch | `IP registered owner different ASN` | The difference between registered allocation and current route origin | BGP table, IP intelligence page, or mixed report |
| Check a logged address | `IP lookup from firewall log` | A quick, trustworthy first read without pretending to identify a person or prove maliciousness | Compact lookup form with an explanatory result |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| A registry lookup and an ASN or BGP lookup answer different questions, and users need help choosing the right one. | A networking discussion explicitly contrasts an ASN lookup with an IP registry lookup and says the registry gets close to the owner: https://www.reddit.com/r/networking/comments/bxklyk/ | Repeated in community discussion | Name the source and question beside every result. Never flatten registered holder and announcing network into one owner field. |
| RDAP coverage, bootstrap discovery, and server availability produce confusing failures instead of a stable answer. | openrdap issues include missing RDAP servers and EU-domain coverage questions: https://github.com/openrdap/rdap/issues | Repeated across tooling issues | Use committed IANA bootstrap data, explicit unknown and unavailable states, bounded requests, and readable error recovery. |
| Raw structured data is useful but can be difficult to interpret, and incompatible paths can fail silently. | An openrdap issue reports that an IP or ASN query combined with an incompatible output option produced no output and a zero exit code: https://github.com/openrdap/rdap/issues/37 | Occasional but high-friction | Keep the primary result concise, preserve raw RDAP in a disclosure, and give every invalid or unsupported state a visible explanation. |
| IP lookup users often want an organization but may actually be seeking a person, location, service, or reputation verdict. | Community questions distinguish registry ownership, ASN ownership, and the identity behind a residential IP: https://www.reddit.com/r/OSINT/comments/hr0dqs/IP_address_Company_Name | Repeated in adjacent OSINT questions | State the scope close to the country and holder fields: registered organization is not a subscriber, geolocation, service inventory, or maliciousness verdict. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| IANA bootstrap maps IPv4 and IPv6 ranges to authoritative RIR RDAP base URLs. | https://data.iana.org/rdap/ipv4.json and https://data.iana.org/rdap/ipv6.json | Documented | Use committed files and longest-prefix or range matching locally; never fetch bootstrap metadata per request. |
| IANA bootstrap maps ASN ranges to authoritative RDAP base URLs. | https://data.iana.org/rdap/asn.json | Documented | Normalize `13335`, `AS13335`, and `as13335` to one integer before range matching. |
| RDAP network and autnum paths are structured registry queries, not free-form WHOIS strings. | RFC 9224, https://www.rfc-editor.org/rfc/rfc9224; APNIC RDAP documentation, https://www.apnic.net/about-apnic/whois_search/about/rdap/ | Documented | The route should query `/ip/<address>` or `/autnum/<number>` on the responsible RIR service and parse the response as untrusted input. |
| A successful IP response identifies the containing allocation, not necessarily the smallest customer assignment or current route origin. | RFC 9082, https://www.rfc-editor.org/rfc/rfc9082; ARIN RDAP guide, https://www.arin.net/resources/registry/whoisrws/rdap/ | Documented | Show range, handle, name, type, parent, and entity fields separately. |
| Team Cymru origin data describes current BGP route origin and is different from RIR registration. | https://www.team-cymru.com/ip-asn-mapping | Documented | BGP data can be absent or disagree with registration. Label it as routing context and make it best effort. |
| Registered country is not reliable geolocation. | IANA special-use registry, https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml; RIR record semantics | Inferred | Phrase as the country attached to the registered allocation record. Do not add a map or location claim. |
| Private, loopback, link-local, documentation, and multicast addresses should not be sent to an RIR lookup. | RFC 1918, https://www.rfc-editor.org/rfc/rfc1918; RFC 5737, https://www.rfc-editor.org/rfc/rfc5737; existing `lib/dns/` validation | Documented | Reject locally with a recovery message. Reserved records seen on generic competitors are not a reason to broaden this product. |

## Competitor reviews

### Competitor 1: rdap.com

- URL: https://rdap.com/
- Accessed: 2026-09-10
- Audience and promise: [Observed] A private browser RDAP client for domains, IPs, ASNs, URLs, and email-shaped inputs.
- Inputs and defaults: [Observed] One input accepts examples such as `example.com`, `8.8.8.8`, and `AS15169`; the page auto-detects type and offers simple, advanced, and DNS modes.
- Action and state behavior: [Observed] A Look up button changes the URL to a typed query and renders a result without leaving the page.
- Results and visuals: [Observed] `1.1.1.1` led with `1.1.1.0 - 1.1.1.255`, APNIC-LABS, APNIC, AU, an abuse email, and dates. The surface is compact and registry-first.
- Formula or data source: [Documented] The page presents itself as direct RDAP lookup; the visible result shape matches an authoritative IP RDAP response.
- Errors and edge behavior: [Observed] `192.168.1.1` returned a reserved IANA record instead of an early local rejection.
- Mobile and accessibility: [Observed] No horizontal overflow at 1280x900 or 375x812 in the tested route. The wide input and mode choices remain usable.
- Privacy: [Documented] The page states it is private and connects the browser directly to the relevant registry: https://rdap.com/
- Performance: [Observed] The landing page and the tested result became usable quickly enough for manual inspection; this is not a benchmark.
- Search-content structure: [Observed] The page leads with a single form and result, with little explanatory content around the result.
- What works: One input and auto-detection make the first lookup easy, and the registry result is not buried under geolocation fields.
- What fails: Reserved address behavior can make a user think a private address has a meaningful public registrant.
- Do not copy: Do not copy the broad any-input promise or treat a browser-direct privacy design as equivalent to stack127 server caching.

```text
[rdap.com]
  mode: simple | advanced | DNS
  [ example.com / 8.8.8.8 / AS15169                 ] [Look up]
  result: network range | holder | registry | country
           abuse contact | dates | raw RDAP
```

### Competitor 2: client.rdap.org

- URL: https://client.rdap.org/
- Accessed: 2026-09-10
- Audience and promise: [Observed] A private, browser-direct RDAP client aimed at people who need multiple RDAP object types.
- Inputs and defaults: [Observed] A type select includes Domain, TLD, IP, CIDR, AS Number, Entity, Registrar, URL, and JSON; the object input changes its placeholder.
- Action and state behavior: [Observed] The Submit button was disabled while registry options were loading during the probe; the page also exposes a Follow referral checkbox.
- Results and visuals: [Unknown] The page-level output area is present, but the successful IP and ASN result could not be completed before the interaction timeout.
- Formula or data source: [Documented] The repository says it connects directly to the relevant registry and bundles a client-side IP parser: https://github.com/rdap-org/client.rdap.org/blob/master/index.html
- Errors and edge behavior: [Observed] CIDR is an explicit mode, which is broader than the planned stack127 launch scope.
- Mobile and accessibility: [Observed] No horizontal overflow at the tested viewports. The visible form uses labels and a native select.
- Privacy: [Documented] The page says only the relevant registry sees the query because the browser connects directly over HTTPS.
- Performance: [Observed] Registry list loading delayed the interactive probe; no timing benchmark was recorded.
- Search-content structure: [Observed] The page has a tool-first layout and a short privacy and RDAP explanation below it.
- What works: The explicit type selector makes the supported RDAP object model clear and is useful for advanced users.
- What fails: A disabled action while registries load gives little recovery or progress information.
- Do not copy: Do not make an advanced type matrix the first decision for a reader who only needs one IP or ASN answer.

```text
[RDAP Lookup]
  [type: Domain v] [object: example.com                 ] [Submit]
  [x] Follow referral to registrar's RDAP record
  output: registry response / raw JSON
  explanation: private browser request
```

### Competitor 3: Checkbox Tools IP Whois

- URL: https://checkbox.tools/en/tools/ip-whois
- Accessed: 2026-09-10
- Audience and promise: [Observed] A simple public IP Whois lookup for readers who want the organization and abuse details behind an address.
- Inputs and defaults: [Observed] One text input accepts IPv4 or IPv6 examples, with example links and submit-on-enter behavior.
- Action and state behavior: [Observed] `1.1.1.1` updates the URL with `?ip=1.1.1.1` and displays the result on the same page.
- Results and visuals: [Observed] The result showed APNIC, APNIC Research and Development, AU, AS13335, `1.1.1.0/24`, netname, update date, abuse email, and raw WHOIS.
- Formula or data source: [Inferred] The page appears to use registry Whois or RDAP data because the result fields are registry-shaped, but the inspected copy did not expose a request-level source contract.
- Errors and edge behavior: [Observed] `192.168.1.1` received an explicit message that private, reserved, and cloud-metadata addresses are blocked.
- Mobile and accessibility: [Observed] No horizontal overflow at 1280x900 or 375x812. Headings such as About this tool, When to use, and FAQs support scanning.
- Privacy: [Unknown] The inspected page did not make a precise requester-retention or direct-registry privacy promise.
- Performance: [Observed] The valid result loaded in time for manual inspection; no benchmark was recorded.
- Search-content structure: [Observed] The page has a useful SEO body after the tool, including accuracy, use cases, and FAQs.
- What works: It combines a short result with the exact data a user reporting abuse wants and handles private input clearly.
- What fails: It does not visibly distinguish registered holder from current route origin or explain country semantics near the result.
- Do not copy: Do not call registry data Whois when the implementation uses RDAP, and do not hide source provenance behind a generic raw block.

```text
IP Whois lookup
  [ 8.8.8.8 or IPv6                              ] [enter]
  APNIC / organization / country / ASN
  range / registry / updated / abuse email
  [Raw WHOIS]
  About this tool | When to use | FAQs
```

### Competitor 4: Toolblink IP / ASN Lookup

- URL: https://toolblink.pro/ip-asn-lookup
- Accessed: 2026-09-10
- Audience and promise: [Observed] A combined IP and ASN lookup that promises registry allocation, current network, reverse DNS, and findings.
- Inputs and defaults: [Observed] One input accepts an IP or ASN such as `8.8.8.8` or `AS15169`; the query is kept in a `domain` URL parameter.
- Action and state behavior: [Observed] `AS13335` rendered a server-side result with a shareable query URL. Invalid text produced a clear type error, though the same error appeared twice.
- Results and visuals: [Observed] The ASN result showed Cloudflare, ARIN, US, allocation date, range, and raw or RDAP controls. Copy explains that RDAP and Team Cymru answer different questions.
- Formula or data source: [Documented] The page says it uses Team Cymru over DNS plus regional registry RDAP and intentionally keeps current network and registration distinct.
- Errors and edge behavior: [Observed] `not-an-ip` was rejected with a message explaining IPv4 shape and ASN syntax.
- Mobile and accessibility: [Observed] The desktop hierarchy is understandable, but both body and document overflow were about 562 pixels at 375px, so important content can be clipped or require page-level horizontal scrolling.
- Privacy: [Documented] The page makes server-side query and no-logs claims, but the inspected wording should be treated as a product promise that needs operational proof.
- Performance: [Observed] The valid ASN result was available for inspection after a server round trip; no benchmark was recorded.
- Search-content structure: [Observed] It uses findings, source sections, explanations, and raw output, giving it more depth than a bare lookup.
- What works: It is the clearest competitor about registered allocation versus current announcement and supports ASN input directly.
- What fails: Responsive layout and duplicate errors reduce trust at the smallest viewport.
- Do not copy: Do not expose a mixed "owner" or health finding that can be read as a reputation verdict.

```text
IP / ASN Lookup
  [ 8.8.8.8 or AS15169                             ] [lookup]
  result: operator | registry | country | allocation
  findings: current network / reverse DNS / caveats
  sources: RDAP | Team Cymru | raw output
```

### Competitor 5: BGP.Tools

- URL: https://bgp.tools/
- Accessed: 2026-09-10
- Audience and promise: [Observed] A BGP ecosystem explorer for operators, researchers, and people investigating route announcements.
- Inputs and defaults: [Observed] A search input accepts an IP, ASN, prefix, or related network object; the home page also shows current-client context and example links.
- Action and state behavior: [Observed] Searching `8.8.8.8` redirected to a prefix selector and showed multiple overlapping BGP prefixes and origin ASNs.
- Results and visuals: [Observed] The result is prefix- and routing-centric, showing route relationships rather than RIR allocation holder details.
- Formula or data source: [Documented] The service describes itself as free BGP data with monitoring, IRR, RPKI, and API offerings around the routing table.
- Errors and edge behavior: [Unknown] The inspected path did not exercise malformed input or private-address handling.
- Mobile and accessibility: [Observed] No meaningful horizontal overflow at the tested viewports and the primary search remains discoverable.
- Privacy: [Unknown] The inspected page did not provide a precise lookup retention policy.
- Performance: [Observed] The prefix result loaded for manual inspection; no benchmark was recorded.
- Search-content structure: [Observed] The page is a dense operational explorer with links to example ASNs, prefixes, and recent updates.
- What works: It gives strong evidence for what is currently announced and shows why a single IP can sit under multiple routing prefixes.
- What fails: It does not answer the registered-holder or abuse-contact question directly.
- Do not copy: Do not make a BGP table the primary result for a user asking who the RIR records as the allocation holder.

```text
Browse the Internet ecosystem
  [ Start here: IP / ASN / prefix                     ]
  current client context | examples | recent updates
  prefix selector
    origin AS | announced prefix | route relationships
```

### Competitor 6: Hurricane Electric BGP Toolkit

- URL: https://bgp.he.net/
- Accessed: 2026-09-10
- Audience and promise: [Observed] A dense operator-facing BGP report surface for IPs, ASNs, prefixes, and related network objects.
- Inputs and defaults: [Observed] The home form accepts a search value and submits to IP, ASN, or related report pages.
- Action and state behavior: [Observed] Searching `8.8.8.8` opened an IP report with origin announcements, prefix rows, and links to IP Info, Whois, RDAP, DNS, certificates, and RBLs.
- Results and visuals: [Observed] It leads with BGP origin and prefix data and provides many adjacent investigation links.
- Formula or data source: [Documented] The page labels itself BGP Toolkit and the result shape is an observed route report, not a registry allocation summary.
- Errors and edge behavior: [Unknown] Malformed input and private-address behavior were not tested.
- Mobile and accessibility: [Observed] The mobile viewport had about 539 pixels of horizontal overflow, with dense navigation and tables requiring page-level scrolling.
- Privacy: [Unknown] No precise lookup privacy statement was visible in the inspected path.
- Performance: [Observed] The IP report loaded for manual inspection; no benchmark was recorded.
- Search-content structure: [Observed] It is navigation-heavy and useful to experts, but the primary answer is harder for a casual reader to isolate.
- What works: It exposes useful adjacent network pivots without pretending that BGP and registration are the same record.
- What fails: The density and horizontal overflow make it a poor first result for a person reading one firewall log entry.
- Do not copy: Do not bring operator report density or page-wide tables into the primary stack127 result.

```text
BGP Toolkit Home
  [search                                      ] [Search]
  IP Info | Whois | RDAP | DNS | Certs | RBL
  origin AS | prefix table | route details
```

### Competitor 7: IPinfo

- URL: https://ipinfo.io/1.1.1.1
- Accessed: 2026-09-10
- Audience and promise: [Observed] A commercial IP intelligence profile combining location, ASN, company, privacy, hosted domains, and abuse context.
- Inputs and defaults: [Observed] The page accepts IP and ASN searches and presents a deep profile for the path address.
- Action and state behavior: [Observed] The direct path rendered without an extra form step and exposed multiple sections for the same address.
- Results and visuals: [Observed] `1.1.1.1` showed Brisbane, AU, AS13335 Cloudflare, range, company, hosted domains, privacy and anycast indicators, and abuse information.
- Formula or data source: [Documented] The product positions itself as IP data and intelligence, not just a direct RIR RDAP view.
- Errors and edge behavior: [Unknown] The inspected address page did not exercise malformed, private, or unallocated input.
- Mobile and accessibility: [Observed] The mobile layout was usable without meaningful content overflow in the tested page.
- Privacy: [Unknown] The inspected public profile did not establish the retention behavior for interactive lookups.
- Performance: [Observed] The profile was available for manual inspection; no benchmark was recorded.
- Search-content structure: [Observed] It uses a large profile with many sections and commercial API or product context.
- What works: It anticipates that users want a broader picture than a bare owner line and makes ASN and company relationships easy to scan.
- What fails: Geolocation and hosted-domain intelligence can make the registered country look like physical location and can over-answer a narrow registry question.
- Do not copy: Do not add geolocation, reputation, hosted-domain discovery, or a commercial intelligence surface to this focused tool.

```text
1.1.1.1
  location | privacy | ASN | company | abuse
  range | hosted domains | anycast
  API / product context
```

### Competitor 8: WhatIsMyIP IP Whois Lookup

- URL: https://www.whatismyip.com/ip-whois-lookup/
- Accessed: 2026-09-10
- Audience and promise: [Unknown] The direct page could not be evaluated because the research environment received a Cloudflare 403 block page.
- Inputs and defaults: [Unknown] No lookup form was available through the blocked response.
- Action and state behavior: [Unknown] No result operation was possible.
- Results and visuals: [Observed] The only visible result was a blocked-access message, not the intended tool.
- Formula or data source: [Unknown] The live page could not establish whether the source is Whois, RDAP, or an aggregator.
- Errors and edge behavior: [Observed] The site returned an access block rather than a user-facing tool state.
- Mobile and accessibility: [Unknown] The blocked page did not represent the intended layout.
- Privacy: [Unknown] No lookup privacy policy was visible in the blocked response.
- Performance: [Observed] The block page returned during the probe; this is an environment access observation, not a service uptime claim.
- Search-content structure: [Unknown] The intended title was visible in the blocked page, but no tool content was available.
- What works: None could be judged from the accessible response.
- What fails: A blocked or opaque surface gives the user no useful recovery path.
- Do not copy: Do not rely on access-sensitive third-party aggregation without showing source and failure state.

```text
Sorry, you have been blocked
  intended tool unavailable
  no input | no result | no recovery details
```

## Comparison matrix

| Capability | rdap.com | client.rdap.org | Checkbox | Toolblink | BGP.Tools | HE BGP | IPinfo | User value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Single IP input | auto-detected | explicit type | yes | auto-detected | broad search | broad search | profile path | High |
| ASN input | auto-detected | explicit type | no observed | yes | broad search | broad search | yes | High |
| RIR allocation fields | yes | raw/client output | yes | yes | no observed | linked | partial | High |
| Abuse contact | observed | unknown | yes | source/result context | no observed | linked | yes | High |
| Current BGP origin | no observed | no observed | no observed | yes | primary | primary | partial | Medium |
| Private address handling | returned reserved record | unknown | blocked | unknown | unknown | unknown | unknown | High |
| Registered country caveat | not prominent | not prominent | not prominent | explained | not applicable | not applicable | location mixed in | High |
| Raw response or source trail | result shape | raw JSON | raw Whois | raw/RDAP | route data | linked reports | product profile | High |
| Mobile behavior | good | good | good | page overflow | good | page overflow | good | High |
| Explanatory content | light | light | strong | strong | operational | operational | broad | Medium |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Who owns an IP? | Registry tools show the registered allocation holder; IP intelligence tools may add company and location; BGP tools show the announcing network. | IANA bootstrap and RFC 9224, https://data.iana.org/rdap/ipv4.json; Team Cymru, https://www.team-cymru.com/ip-asn-mapping | No. Show separate labeled sections. |
| Should private IPs be looked up? | rdap.com returned a reserved IANA record; Checkbox Tools blocks private and reserved values; the planned stack127 behavior rejects them before outbound traffic. | RFC 1918, https://www.rfc-editor.org/rfc/rfc1918; Checkbox Tools observation | No. Reject non-public values locally because they do not answer the user question. |
| Should the user choose IP versus ASN? | client.rdap.org makes type explicit; rdap.com and Toolblink auto-detect. | Competitor probes; IANA ASN bootstrap, https://data.iana.org/rdap/asn.json | No. Use auto-detection, with a visible normalized type in the result. |
| Should BGP context be included? | BGP.Tools and HE BGP make it primary; Checkbox and direct RDAP tools omit it; Toolblink combines both. | BGP.Tools, https://bgp.tools/; Toolblink, https://toolblink.pro/ip-asn-lookup; Team Cymru documentation | No. Include best-effort BGP context only after the RIR result and label the question it answers. |
| Should CIDR be accepted? | client.rdap.org and some CLI clients support CIDR; the planned page is a single-address or ASN lookup. | RFC 9082, https://www.rfc-editor.org/rfc/rfc9082; existing page plan | No. Reject CIDR at launch and link to a future subnet or prefix tool. |
| What does a country field mean? | IPinfo puts physical-looking location next to registration and company fields; registry records attach country to an entity or allocation. | ARIN RDAP guide, https://www.arin.net/resources/registry/whoisrws/rdap/ | No. Use the phrase registered country and explain that it is not geolocation. |

## Evidence-backed opportunities

1. **Lead with the allocation, not an intelligence score**: direct RDAP and Checkbox results prove that range, holder, registry, and abuse contact are the high-value first fields, while IPinfo and BGP products show how quickly extra fields can change the question. A stack127 result should state the registered record in one sentence and keep secondary context below it.
2. **Make provenance part of the result**: Toolblink is the strongest observed example of separating registry and BGP questions, while the openrdap issue shows that opaque unsupported states are costly. Name the registry, source type, fetched time, and optional Team Cymru context beside the field it supports.
3. **Handle private and malformed input before the network call**: Checkbox Tools demonstrates a clear blocked-private state, while rdap.com demonstrates the confusion caused by returning reserved registry records. Local classification can be deterministic, fast, and privacy-preserving.
4. **Give abuse reporting a useful next step**: Checkbox and direct RDAP clients put the abuse contact in reach. Show the role contact, the registry source, and a short checklist to include the timestamp, address, observed protocol or URL, and logs without implying that the contact identifies a subscriber.
5. **Keep the mobile result narrow**: Toolblink and HE BGP both overflow at 375px, while compact direct clients remain usable. Use a stacked result with an inner scroll only for raw data or repeated tables.
6. **Explain disagreement instead of hiding it**: BGP.Tools and HE BGP provide evidence that route origin is a real separate lookup. A small registration-versus-routing section can prevent the most common false conclusion without adding geolocation or reputation features.

## Table stakes

- Accept IPv4, IPv6, and ASN input with `AS` prefix optional.
- Auto-detect the input type and show the normalized type.
- Reject malformed, CIDR, private, loopback, link-local, documentation, multicast, and other non-public IPs before outbound calls.
- Resolve the responsible RIR from committed IANA IPv4, IPv6, and ASN bootstrap data.
- Show the allocation or ASN range, handle, name, registry, country, dates, status, and abuse contact when published.
- Keep missing registry fields as unknown and name the registry that answered.
- Keep a collapsed raw RDAP response or source evidence available.
- Show clear unavailable, rate-limited, malformed, and no-record states with recovery.
- Explain that registered holder, BGP origin, geolocation, subscriber identity, service inventory, and maliciousness are different questions.
- Work at 320px without page-wide horizontal overflow.

## Ideas to reject

- **IP reputation score or maliciousness badge**: no reputation source is in scope, and a registry record cannot support that conclusion.
- **Map or physical location result**: registered country is not geolocation and would invite a false reading.
- **Reverse DNS as an automatic owner field**: PTR is an optional separate DNS result and can contain an operator-chosen name.
- **CIDR explorer in this first route**: it changes the user task and belongs in a subnet or prefix tool.
- **Port scan, hosted-domain inventory, or person lookup**: these exceed the data contract, create privacy risk, and distract from the registration question.
- **One merged owner card**: it erases the distinction between RIR registration and current route origin.
- **Third-party RDAP aggregator as the primary source**: bootstrap resolution should be owned locally so source, caching, and failure behavior remain inspectable.

## Open questions and blockers

- The existing domain RDAP cache and throttle contracts need a network-object extension without weakening the domain behavior.
- Network bootstrap files already have a refresh path in `scripts/domain-tools/refresh-datasets.mjs`; implementation must parse the committed range services and add tests for all five RIR families.
- Team Cymru enrichment should be best effort and must never prevent the RIR result from rendering.
- The route is flat and canonical at `/ip-asn-lookup`; collection sidebar placement remains a content-navigation decision. Do not publish an `/ip-tools` hub for one tool.

## Sources

- IANA IPv4 RDAP bootstrap: https://data.iana.org/rdap/ipv4.json, accessed 2026-09-10. Maps IPv4 ranges to RDAP services.
- IANA IPv6 RDAP bootstrap: https://data.iana.org/rdap/ipv6.json, accessed 2026-09-10. Maps IPv6 ranges to RDAP services.
- IANA ASN RDAP bootstrap: https://data.iana.org/rdap/asn.json, accessed 2026-09-10. Maps ASN ranges to RDAP services.
- RFC 9224: https://www.rfc-editor.org/rfc/rfc9224, accessed 2026-09-10. Defines the bootstrap registry and authoritative RDAP service discovery.
- RFC 9082: https://www.rfc-editor.org/rfc/rfc9082, accessed 2026-09-10. Defines RDAP query paths for IP networks and autonomous system numbers.
- ARIN RDAP guide: https://www.arin.net/resources/registry/whoisrws/rdap/, accessed 2026-09-10. Documents network and autnum response fields and behavior.
- APNIC RDAP documentation: https://www.apnic.net/about-apnic/whois_search/about/rdap/, accessed 2026-09-10. Documents standardized RDAP queries and `/ip` and `/autnum` paths.
- Team Cymru IP to ASN mapping: https://www.team-cymru.com/ip-asn-mapping, accessed 2026-09-10. Documents current BGP origin mapping and DNS-based lookup.
- rdap.com: https://rdap.com/, accessed 2026-09-10. Observed private auto-detected registry lookup.
- client.rdap.org: https://client.rdap.org/, accessed 2026-09-10. Observed explicit RDAP object modes and browser-direct privacy positioning.
- Checkbox Tools: https://checkbox.tools/en/tools/ip-whois, accessed 2026-09-10. Observed compact IP result and private-address rejection.
- Toolblink: https://toolblink.pro/ip-asn-lookup, accessed 2026-09-10. Observed combined RDAP and Team Cymru result with mobile overflow.
- BGP.Tools: https://bgp.tools/, accessed 2026-09-10. Observed prefix and route-origin explorer.
- Hurricane Electric BGP Toolkit: https://bgp.he.net/, accessed 2026-09-10. Observed operator-focused BGP report and mobile overflow.
- IPinfo: https://ipinfo.io/1.1.1.1, accessed 2026-09-10. Observed broad IP intelligence profile.
- WhatIsMyIP: https://www.whatismyip.com/ip-whois-lookup/, accessed 2026-09-10. Access blocked by HTTP 403 in the research environment.
- openrdap issue list: https://github.com/openrdap/rdap/issues, accessed 2026-09-10. Evidence for bootstrap, coverage, cache, and client-state pain.
- openrdap issue 37: https://github.com/openrdap/rdap/issues/37, accessed 2026-09-10. Evidence for silent or confusing unsupported output behavior.
- Reddit networking discussion: https://www.reddit.com/r/networking/comments/bxklyk/, accessed 2026-09-10. Evidence that users distinguish IP registry ownership from ASN lookup.
- Reddit OSINT discussion: https://www.reddit.com/r/OSINT/comments/hr0dqs/IP_address_Company_Name, accessed 2026-09-10. Evidence that users want an organization but may be asking about a person or service.
