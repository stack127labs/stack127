# Interface contract: IP and ASN registration lookup

Status: ready
Tool: IP and ASN registration lookup
Route: `/ip-asn-lookup`
Mode: pipeline
Depends on: `brief.md`, `implementation-report.md`
Input fingerprint: `brief.md sha256:94d430dc139b637fef92f0a66ed08c87f2036c38f9a1e8433e458619b81e399a`
Input fingerprint: `implementation-report.md sha256:ef5577306cf52712f610dcc77c9bab54af8bfda940e19eb855884bf678022063`

## User task

- Primary user: An operator checking one public IP or ASN from a log or network result.
- Question: Who does the responsible RIR record this address or ASN to, and what separate route context is available?
- Lead answer: A single source-labeled sentence naming the allocation or ASN holder and registry.
- Next decision: Use the published abuse contact, inspect the raw record, or compare the registered holder with current BGP routing.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Query input | What should be checked? | User input | input | It is the only required decision and determines the lookup. | Do not repeat the input as a second result heading. |
| Registration lead | Who is this record registered to? | Normalized RIR RDAP | lead | This is the answer users came for and must dominate the result. | The holder is not repeated as a generic owner in other regions. |
| Allocation facts | What range, handle, type, country, and registry did the RIR publish? | RIR RDAP object | supporting | These facts qualify and verify the lead answer. | Do not repeat the same fields in prose below the table. |
| Abuse contact | Where can the reader report a network event? | RIR abuse entity | supporting | It changes the next action after the lookup. | Show the contact once, with its RIR source. |
| Current BGP route | Which ASN and prefix currently announce this IP? | Team Cymru origin data | supporting | It explains legitimate differences between registration and routing. | Never label this section owner or merge it into the lead. |
| Registry and freshness | Which server answered and when? | RDAP response and cache | evidence | Provenance determines how much trust to place in each field. | One metadata row can serve the whole RIR region. |
| Relationship strip | How do IANA, RIR, allocation, and route relate? | Product explanation | supporting | A compact relationship helps readers interpret the two sources. | It does not repeat exact range or ASN values. |
| Raw RDAP | What exact record produced the answer? | Upstream response body | evidence | Advanced readers need inspectable evidence without making JSON the lead. | Keep raw content in one disclosure only. |
| Geolocation, reputation, ports, subscriber identity | Is this a place, person, service, or threat? | Not in this tool | omit | These questions require different data and would create false confidence. | State the limits in connected guide prose instead. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | IP address or ASN | required text input | yes | user supplied | visible in the workbench | `ToolTextField` with a real label | It is the only lookup target and must stay in the main flow. | Full width; long IPv6 wraps only in the result, not the input. |
| 2 | Look up registration | primary action | yes | no default | visible beside or below input | `ToolButton` primary submit | It starts the one explicit network action. | Full-width button below the field. |
| 3 | Reset | secondary action, shown after a result or error | no | no default | visible near result actions | `ToolButton` secondary or native button | It gives a fast path back to the clean state. | Full-width or inline after the result, never before the first input. |
| 4 | Download report | optional secondary action | no | no default | result metadata area | `ToolDownloadAction` | It preserves an inspectable result for a manual incident record. | Full-width action after source metadata. |
| 5 | Raw RDAP response | optional evidence disclosure | no | collapsed | disclosure at result end | `ToolDisclosure` and `ToolRawOutput` | It verifies the answer without competing with the lead. | Full-width disclosure; raw JSON owns inner scroll if needed. |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Registration lead | Who is the RIR record for? | Input, object range, holder, registry, registered country when present | `ToolPrimaryResult` with one sentence and polite live announcement | Exactly one lead; no score, badge, or generic owner label. |
| 2 | Allocation or ASN facts | What exact object did the RIR publish? | Range, handle, name, type or status, country, registry, dates, parent, notices | Key/value table with unknown fields omitted or marked `Not published` | Repeated fields belong here, not in the guide prose. |
| 3 | Abuse contact | Where can the reader report the event? | Abuse role email, phone, contact form, entity name, RIR source | Dedicated contact block with mail and external links where safe | Render only published contact data; never infer an address from the holder. |
| 4 | Current BGP route | What network is announcing this IP now? | Current origin ASN, announced prefix, network name, source status | Separate supporting section, IP input only | Omit for ASN input or when unavailable; never change the RIR lead. |
| 5 | Source and freshness | Where and when did the answer come from? | Registry host, cache state, fetch time, HTTP status | Quiet metadata row near the result end | One source row for the RIR object; do not repeat source on every table cell. |
| 6 | Relationship strip | How do the two data layers relate? | IANA, RIR, allocation, current route labels | Plain ordered relationship with neutral connectors | Conceptual only; no dimensions, scores, or exact numbers. |
| 7 | Notes and limits | What could make this answer misleading? | Country caveat, BGP conflict, missing-field and partial notes | Connected text or restrained status message | Show only notes relevant to this response. |
| 8 | Raw RDAP evidence | What did the upstream return? | Bounded raw RDAP body and request URL | Collapsed disclosure and optional JSON download | Keep one raw disclosure; do not duplicate a formatted table inside it. |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Allocation key/value table | Repeated registry fields with stable labels | Yes, through row alignment rather than scale | Use. It is the clearest exact format. |
| Registration versus routing sections | Two source-owned answers | Yes, separation communicates different provenance | Use two labeled sections, not a merged card. |
| IANA to RIR to allocation to route strip | Conceptual hierarchy and relationship | Yes, ordered connectors communicate direction, not quantity | Use a simple semantic strip with text and neutral connectors. |
| Timeline for registration and last changed events | Optional dates without guaranteed interval meaning | No, equal spacing would imply a false timescale | Omit. Use a date table if those fields are present. |
| Map, gauge, score, chart, or progress bar | Location, risk, or completeness | No, the source data cannot support these claims | Omit. |
| Raw response region | Exact evidence text | Not applicable | Use a disclosure with an inner scroll region if necessary. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Empty input, submit enabled | None | Server-rendered explanation below workbench | Label and placeholder tell the user what is accepted | Input is the first keyboard stop; no live announcement. |
| Validating | Submit with empty, malformed, CIDR, or non-public value | None | None | Inline field error; no network call; preserve typed input | Focus returns to input and error is associated. |
| Loading | Valid submit, button disabled | None | No partial fields | Loading status says the registration lookup is in progress | Polite live status; repeated submits are ignored. |
| Registered IP with BGP | Valid public IP | Lead sentence names RIR record holder | Allocation facts, abuse, source metadata, route section | Notes explain registered country and any BGP mismatch | Lead result announced once; route does not replace it. |
| Registered IP without BGP | Valid public IP, route source empty or timed out | RIR lead remains | Allocation and source; brief unavailable routing note or omitted section | No retry loop or false route value | Lead announcement remains complete. |
| Registered ASN | Valid ASN | Lead sentence names ASN holder and registry | ASN facts, abuse, source metadata; no IP route section | No BGP section because the input is already an ASN | Lead announcement names AS form. |
| Not registered | RIR 404 | `No registered record found` | Registry and queried normalized value | Explain that 404 is not the same as a registry outage | Announce the negative result and keep input editable. |
| Upstream failure | 403, 429, timeout, invalid body, or 5xx | `Cannot determine` | No plausible allocation data | Show generic failure, retry through primary action, and preserve input | Focus stays on form; no stale result remains. |
| Expanded evidence | User opens notes or raw RDAP | Lead unchanged | Relevant details become visible | Inner raw region may scroll; page must not | Native disclosure semantics and keyboard focus. |
| Reset or edit | User clicks reset or changes input | Cleared before next submit | Cleared before next submit | Return to clean state | Reset focuses input; editing clears stale result without a live message per keystroke. |
| Explicit query prefill | Open `?query=1.1.1.1` | None until submit | None | Input prefilled, no automatic request | URL stays unchanged; no result announcement. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One text query with validation | `ToolTextField` | Preserves visible label, error association, and shared sizing | A type select would add a decision the parser can make. |
| One explicit request | `ToolButton` primary | Matches the one-action tool contract and loading semantics | Live lookup on every keystroke would create uncontrolled registry requests. |
| Lead answer | `ToolPrimaryResult` | Existing result component provides stable hierarchy and live announcement | A badge or health score would imply unsupported certainty. |
| Repeated registry fields | `ToolDataTable` or `ToolKeyValueList` | Exact fields remain scannable and stable across RIR variations | Prose paragraphs would hide missing fields and repeat values. |
| Source and partial state | `ToolStatus` | Gives semantic status without a colored left edge or decorative panel | A colored card or score would overstate the state. |
| Raw evidence | `ToolDisclosure` plus `ToolRawOutput` | Keeps exact upstream data available but quiet | Always-open JSON would bury the lead and widen the page. |
| Report export | `ToolDownloadAction` | Existing pattern provides a bounded, user-triggered export | Automatic downloads would be surprising and leak lookup data into files without consent. |
| Relationship strip | Page-owned semantic list and CSS | The relationship needs labels, not a generic chart component | A chart, SVG illustration, or marker art would add false scale or unnecessary decoration. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop, 1440px | Sidebar and main column; workbench form first; lead, facts, abuse, route, source, notes, raw evidence | `APNIC Research and Development`, `2001:4860:4860:0000:0000:0000:0000:8888` | No page overflow; only raw output or repeated table may scroll inside its own region. |
| Tablet or narrow desktop, 760px | Single main column after sidebar behavior; form stacks; allocation facts remain two columns where space permits | Long RDAP entity names and full HTTPS registry URLs | No page overflow; long text wraps with `overflow-wrap:anywhere`. |
| Mobile, 375px | Input, button, lead, allocation table, abuse, route, source, notes, raw evidence in that order | `2001:db8:ffff:ffff:ffff:ffff:ffff:ffff`, long abuse email, full holder name | The page never scrolls horizontally. Raw JSON and any wide table use a focusable inner scroll wrapper. |
| Small mobile, 320px | Same order, one-column facts, stacked actions, no side-by-side metadata | `AS4294967294`, `helpdesk@apnic.net`, long registry host | No page overflow; values wrap and action labels remain inside controls. |

## Interface wireframes

### Desktop result

```text
sidebar             IP and ASN registration lookup
                    Look up one public IP address or ASN.

                    IP address or ASN
                    [ 1.1.1.1                                      ]
                    [Look up registration]

                    1.1.1.1 is inside 1.1.1.0 to 1.1.1.255,
                    registered to APNIC Research and Development. APNIC.

                    Allocation
                    range                1.1.1.0 to 1.1.1.255
                    name                 APNIC-LABS
                    handle               [NET-...]     registry APNIC
                    registered country  AU             type ASSIGNED PORTABLE
                    registration        [date]         last changed [date]

                    Abuse contact
                    helpdesk@apnic.net                         APNIC RDAP

                    Current BGP route
                    origin AS13335       announced prefix 1.1.1.0/24
                    network Cloudflare
                    This is current routing context, not the registered holder.

                    IANA -> RIR -> allocation -> current route
                    Source APNIC | fetched [time] | [Download report] [Reset]
                    [Notes] [Raw RDAP response v]
```

### Narrow mobile result

```text
IP and ASN registration lookup
IP address or ASN
[ 1.1.1.1                         ]
[Look up registration]

1.1.1.1 is inside 1.1.1.0 to 1.1.1.255,
registered to APNIC Research and Development. APNIC.

Allocation
range               1.1.1.0 to 1.1.1.255
name                APNIC-LABS
handle              NET-...
registered country  AU
type                ASSIGNED PORTABLE
registry            APNIC

Abuse contact
helpdesk@apnic.net

Current BGP route
origin              AS13335
announced prefix    1.1.1.0/24
network             Cloudflare
separate from RIR registration

IANA -> RIR -> allocation -> current route
Source APNIC | fetched [time]
[Download report] [Reset]
[Notes]
[Raw RDAP response v]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

The initial state is the same workbench without a result. The invalid state keeps the query and places one field error below it. Loading replaces the primary action label with a busy state and shows no result. Empty or not-registered states show a lead that says the record is unknown, not a blank table. Partial state keeps the RIR result while marking BGP as unavailable. Failure clears any prior result and provides a retry through the primary action. Expanded state opens notes or raw data without changing result order or page width.

## Removed or rejected

- Type selector: auto-detection is enough and avoids a second decision.
- CIDR input: it changes the task to prefix exploration and is deferred.
- Geolocation map: the RIR country is not a location claim.
- Reputation score, threat badge, and health grade: no supported source or decision contract.
- Port, service, and hosted-domain panels: outside the registration job and privacy scope.
- Merged owner card: it would erase the distinction between RIR registration and BGP origin.
- Always-open raw JSON: evidence should remain available without taking over the first scan.
- Timeline and chart: the available dates and source relationships do not have truthful chart geometry.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | The first result sentence names the RIR registration holder and registry; no score or generic owner badge competes with it. | Browser result test and manual two-second scan |
| UI-002 | deduplication | The holder, registry, country, and BGP origin are each presented once in their own region, with no merged owner field. | DOM assertions and manual result review |
| UI-003 | visual-truth | Allocation facts use exact key/value rows and the hierarchy uses a labeled relationship strip; no map, chart, timeline, or score implies unsupported geometry. | Interface review and screenshot inspection |
| UI-004 | responsive | At 320px, 375px, 760px, and 1440px in both themes, the page has no document-level horizontal overflow; only raw evidence or a repeated table may scroll inside a focusable region. | Playwright measurements and keyboard scroll test |
| UI-005 | url | Opening clean `/ip-asn-lookup` leaves the URL unchanged through hydration, and an explicit `?query=` only pre-fills without auto-submitting. | Browser URL and request-count assertions |
| UI-006 | recovery | Invalid input focuses the field, upstream failure clears stale results, retry uses the same primary action, and reset returns focus to the input. | Playwright keyboard and error-state tests |
| UI-007 | source | The result visibly labels RIR registration, optional BGP route, registry host, and fetched or cached time. | Browser result test and screenshot inspection |

## Open questions and blockers

- None. The remaining choices are implementation details covered by the product and test contracts.
