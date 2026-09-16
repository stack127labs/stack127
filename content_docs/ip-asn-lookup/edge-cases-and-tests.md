# Edge cases and tests: IP and ASN registration lookup

Status: ready
Tool: IP and ASN registration lookup
Route: `/ip-asn-lookup`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:daf132c7da35fd0d6b68059903dcda6b6e6c1232c70c5c01a0647244510992c4`
Input fingerprint: `implementation-report.md sha256:ef5577306cf52712f610dcc77c9bab54af8bfda940e19eb855884bf678022063`
Input fingerprint: `interface-contract.md sha256:994bbf11eb20c9a0defa7de3111b8034bbd8906ea86f7ff3fe6f1463efb4d60b`
Input fingerprint: `brief.md sha256:94d430dc139b637fef92f0a66ed08c87f2036c38f9a1e8433e458619b81e399a`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | A wrong RIR, fabricated holder, merged registration and route answer, unsafe outbound request, leaked query, or inaccessible primary lookup would materially damage trust or safety. |
| P1 | A common input, error, retry, stale-result, focus, cache, or narrow-layout failure would break the normal investigation flow. |
| P2 | An uncommon provider variation, cosmetic detail, or resilience issue would reduce polish without changing the answer. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Server-rendered title, introduction, supporting content, and clean initial state | EC-026, EC-028, EC-030 |
| R2 | IPv4, IPv6, and three ASN spellings normalize correctly | EC-002, EC-003, EC-004 |
| R3 | Invalid, CIDR, private, reserved, and private ASN inputs never call upstream | EC-005, EC-006, EC-007, EC-008, EC-009 |
| R4 | Committed IANA data selects the correct RIR without user-controlled endpoints | EC-010, EC-011, EC-012 |
| R5 | RDAP response statuses remain distinct and safe | EC-013, EC-014, EC-015, EC-016 |
| R6 | IP result normalizes allocation facts and abuse contact | EC-017, EC-018 |
| R7 | ASN result normalizes ASN facts and abuse contact | EC-019 |
| R8 | BGP is separate, optional, and non-authoritative for registration | EC-020, EC-021 |
| R9 | Missing and conflicting data remain unknown or separate | EC-018, EC-021, EC-022 |
| R10 | Cache, source, fetched time, raw data, and privacy boundaries hold | EC-023, EC-024, EC-025 |
| R11 | Loading, repeat, edit, retry, reset, keyboard, focus, and live result work | EC-026, EC-027, EC-028, EC-029 |
| R12 | No document overflow across narrow and wide themes | EC-030, EC-031 |
| R13 | Manifest, unpublished route state, no route metadata, and static policy hold | EC-032, EC-033 |
| UI-001 | Lead answer is the first clear result and names the RIR record | EC-026, EC-030 |
| UI-002 | Registration and BGP facts are not duplicated or merged | EC-020, EC-021, EC-026 |
| UI-003 | Exact facts use tables and relationship uses a plain strip | EC-026, EC-030 |
| UI-004 | Narrow layout has no page overflow | EC-030, EC-031 |
| UI-005 | Clean URL remains unchanged and query prefill does not auto-submit | EC-028 |
| UI-006 | Invalid and failed requests clear stale state and recover focus | EC-005, EC-027, EC-029 |
| UI-007 | Sources and fetched or cached time are visible | EC-023, EC-026 |

## Coverage checklist

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-001, EC-002, EC-003, EC-004, EC-005, EC-006, EC-009 |
| Numeric boundaries | EC-004, EC-008, EC-009. Decimal, exponent, locale separator, and negative forms are invalid ASN grammar, not numeric calculations. |
| Configuration dependencies | Not applicable: the user has no selectable configuration; bootstrap service selection is tested as resolution data in EC-010 to EC-012. |
| Technical truth | EC-010 through EC-022 and RF-001 through RF-010 |
| Submission and concurrency | EC-026, EC-027, EC-028, EC-029 |
| Network and upstream | EC-013, EC-014, EC-015, EC-016, EC-020, EC-021, EC-023 |
| Persistence and sharing | EC-023, EC-028, EC-033. No automatic result serialization is allowed. |
| Accessibility | EC-026, EC-027, EC-028, EC-029, EC-030, EC-031 |
| Responsive and themes | EC-030, EC-031 |
| Security and privacy | EC-006, EC-007, EC-008, EC-009, EC-024, EC-025, EC-033 |
| SSR and SEO | EC-028, EC-032, EC-033 |
| Performance | EC-009, EC-015, EC-016, EC-023, EC-027, EC-033 |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P1 | Input | Empty string or whitespace | Return `empty_query`; do not call bootstrap or upstream | One inline field error, input focused, no result | None | Pure and API: `tests/pages/ip-asn-lookup/ip-asn-lookup.test.mjs`, `api.test.mjs` | R3, UI-006 |
| EC-002 | P0 | Input | `1.1.1.1` | Classify as IPv4 and canonicalize unchanged | Submit is accepted and result uses the normalized input | One RIR request after validation | Pure engine and Browser | R2 |
| EC-003 | P0 | Input | `2001:4860:4860::8888` and an equivalent expanded IPv6 literal | Classify as IPv6; equivalent values use one bootstrap match and safe path | Result shows a readable IPv6 value without page overflow | One RIR request | Pure engine and Browser | R2, R12 |
| EC-004 | P0 | Input | `13335`, `AS13335`, `as13335` | Classify all as ASN 13335 and display `AS13335` | Same result shape and no type selector | One RIR request per independent test | Pure engine and Browser | R2, R7 |
| EC-005 | P0 | Input | `1.1.1.0/24` | Return `cidr_not_supported` before bootstrap | Explain that launch checks one IP or ASN and keep the input for correction | No request, no cache access | Pure and API | R3, UI-006 |
| EC-006 | P0 | Security | `https://example.com`, `1.1.1.1/../../x`, CRLF, HTML, or a query containing a NUL | Reject grammar and never interpolate the value into a URL | One safe input error, no upstream detail | No request or analytics event | Pure and API | R3 |
| EC-007 | P0 | Security | `10.0.0.1`, `127.0.0.1`, `169.254.169.254`, `192.168.1.1`, `::1`, `fe80::1`, `192.0.2.1`, multicast | Return `private_or_reserved` using shared address policy | Explain that no RIR request was made; preserve input | No request, no DNS or BGP enrichment | Pure, API, and Browser | R3, UI-006 |
| EC-008 | P0 | Security | ASN 0, 64512, 65534, 4200000000, 4294967295 | Return `private_or_reserved` or `invalid_asn` according to IANA range policy | Explain that the value is not a public RIR ASN | No request | Pure and API | R3 |
| EC-009 | P1 | Input and abuse | 257-character query, 4097-byte request body, Unicode confusables, decimals, signs, exponent notation, or repeated tokens | Reject within bounded parser and body reader | Recoverable input error without slow work | No upstream or persistent storage | Pure and API | R3, R12 |
| EC-010 | P0 | Bootstrap | IPv4 values from AFRINIC, APNIC, ARIN, RIPE NCC, and LACNIC fixture ranges | Select the service declared by committed `rdap-bootstrap-ip.json` | Result source names the selected RIR | No live bootstrap fetch | Pure fixture test | R4 |
| EC-011 | P0 | Bootstrap | IPv6 values in all five fixture service ranges | Select the correct IPv6 service using CIDR membership | Same result behavior as IPv4 | No live bootstrap fetch | Pure fixture test | R4 |
| EC-012 | P0 | Bootstrap | ASN values at the first, middle, and last boundary of a fixture range | Inclusive boundary match selects the expected RIR; adjacent value selects the next range or no service | No guessed RIR when there is no match | No live bootstrap fetch | Pure fixture test | R4 |
| EC-013 | P0 | Upstream | HTTP 200 with valid IP or autnum RDAP JSON | Normalize only expected object class and fields | Lead result and supporting facts render | Bounded cache write permitted | Pure normalizer and API fixture test | R5, R6, R7 |
| EC-014 | P1 | Upstream | HTTP 404 with empty body and HTTP 404 with an RDAP error body | Classify both as `not_registered` | Say no registered record was found, not that the registry failed | Cache negative response per policy | API fixture and Browser | R5 |
| EC-015 | P0 | Upstream | HTTP 403, 429, 500, 502, and 503 | Map to blocked, rate-limited, or registry error; never registered or not registered | Show a safe recovery message and preserve input | No answer cache write; throttle state may update | API fixture test | R5, R10 |
| EC-016 | P0 | Upstream | Timeout, invalid JSON on 200, oversized body, closed stream | Map to timeout or registry error; never parse partial data | `Cannot determine`, no plausible holder, retry available | No answer cache write | HTTP client and API test | R5 |
| EC-017 | P0 | Normalization | APNIC IP fixture with range, name, handle, country, type, event, and nested abuse entity | Preserve all published fields and source provenance | Lead names holder; table shows exact allocation and abuse contact | Cache write permitted | Pure normalizer | R6 |
| EC-018 | P1 | Normalization | Successful IP fixture missing country, dates, parent, or abuse role | Keep missing fields null | Render `Not published` or omit the optional row, never infer | No derived field writes | Pure normalizer and Browser | R6, R9 |
| EC-019 | P0 | Normalization | ASN fixture with start and end ASN, name, handle, country, status, and abuse role | Normalize ASN fields without pretending it is an IP allocation | Lead names ASN holder and registry; no IP route panel | Cache write permitted | Pure normalizer and Browser | R7 |
| EC-020 | P0 | Routing | Public IP with Team Cymru TXT `13335 | 1.1.1.0/24 | AU | ... | CLOUDFLARENET` | Attach routing context with source `Team Cymru` and keep RIR object unchanged | Separate Current BGP route section | Bounded DoH calls; no persistent route cache | Pure routing fixture and Browser | R8 |
| EC-021 | P0 | Routing | RIR holder APNIC-LABS and BGP origin Cloudflare, or no BGP TXT | Preserve both values or show unavailable context | Explain that registration and current route answer different questions | BGP failure cannot clear RIR result | Pure and Browser | R8, R9, UI-002 |
| EC-022 | P1 | Partial data | RIR registered, BGP timed out, abuse contact absent, raw notices malformed | Keep valid RIR fields and discard malformed optional fragments | Lead and allocation remain; optional areas say unknown or disappear | No retry loop | Pure normalizer and Browser | R8, R9 |
| EC-023 | P1 | Cache | First registered lookup, second lookup within TTL, stale cache, cache table unavailable | First fetches; second returns `fromCache`; stale or unavailable cache falls back to fetch | Source row says cached when true; cache failure is invisible to answer | Cache read/write only; requester not stored | Cache/API tests | R10 |
| EC-024 | P0 | Privacy | Request carries client headers and query `1.1.1.1` | Rate limiter may derive transient client key; result and cache row contain no requester identity | No privacy claim beyond actual behavior | In-memory limiter only | API and cache inspection | R10 |
| EC-025 | P0 | Security | Bootstrap fixture includes an untrusted or HTTP URL, or upstream redirects to an unreviewed host | Reject service or redirect and return safe failure | No arbitrary host request; no upstream URL shown as trusted | Throttle may record failure | Pure bootstrap and HTTP client test | R4, R10 |
| EC-026 | P1 | Browser | Submit valid IP by click and Enter | One request; result replaces empty state; result regions render in order | Lead is visible and announced; source and time are visible | One request, no URL mutation | Playwright: `ip-asn-lookup.spec.ts` | R1, R6, UI-001, UI-007 |
| EC-027 | P1 | Browser concurrency | Double-click submit, submit while loading, edit query during request | Ignore duplicate submit; abort or ignore stale response; new submit owns state | No duplicate result and no old holder beside new input | At most one active request per form | Playwright with delayed route mock | R11, UI-006 |
| EC-028 | P1 | Browser state | Open clean route, then open `?query=1.1.1.1`, reload, back, and forward | Clean URL stays unchanged; explicit query pre-fills only; no automatic API call | Input state follows explicit query; result is empty until submit | URL read only, no history mutation | Playwright | R1, R11, UI-005 |
| EC-029 | P1 | Browser recovery | Invalid submit, API 502, retry, reset, and edit after successful result | Validation has field focus; failure clears stale result; retry works; reset clears all | Recovery remains obvious and keyboard usable | No automatic retry or analytics payload | Playwright | R11, UI-006 |
| EC-030 | P1 | Browser layout | Successful IP result at 1440, 760, 375, and 320 in dark mode | Result hierarchy and tables remain readable | No document overflow; raw data is the only permitted inner scroll | No requests beyond the mocked lookup; screenshots only | Screenshot and DOM measurement | R12, UI-001, UI-003, UI-004 |
| EC-031 | P1 | Browser layout and theme | Long IPv6, long organization, long abuse email at 375 and 320 in dark and light | Values wrap inside their owners and controls remain stable | No clipping, overlap, or horizontal page scroll | No persistent state; screenshots only | Screenshot and DOM measurement | R12, UI-004 |
| EC-032 | P0 | SSR and publication | Request route with no published page row and inspect page source | Route follows the repository's unpublished behavior and never claims public publication | No public indexed page or sitemap entry | No publication-row mutation | Database fixture and static policy | R1, R13 |
| EC-033 | P1 | Static architecture | Inspect route files, manifest, content row, and metadata sources | No route-owned metadata, canonical, robots, JSON-LD, or analytics lookup payload | Ownership and content sources are inspectable | Development row may remain unpublished | Static policy and manifest test | R13 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| RF-001 | `1.1.1.1`, committed IPv4 bootstrap, APNIC IP response with `1.1.1.0` to `1.1.1.255`, `APNIC-LABS`, AU, `ASSIGNED PORTABLE`, nested abuse entity | `type=ip`, `registry=APNIC`, `status=registered`, `range=1.1.1.0 to 1.1.1.255`, `name=APNIC-LABS`, country AU, abuse email preserved | IANA IPv4 bootstrap, https://data.iana.org/rdap/ipv4.json; APNIC RDAP response shape | Lead is holder; raw source remains available; no BGP merge. |
| RF-002 | `8.8.8.8`, ARIN service, response with `NET-8-8-8-0-2`, GOGL, `8.8.8.0` to `8.8.8.255`, Google abuse entity | `registry=ARIN`, registered IP object, holder Google LLC or GOGL according to fixture entity, range preserved | ARIN RDAP guide and documented example at https://www.arin.net/resources/registry/whoisrws/rdap/ | Parent and abuse may be present; missing fields remain null. |
| RF-003 | `91.239.6.69`, RIPE service, response with `AL-HOSTAL-20240807`, AL, assigned range | `registry=RIPE NCC`, registered IP object, range and name preserved | RIPE RDAP documentation and documented client example | IPv4 matching and non-ARIN field shape. |
| RF-004 | Public IPv4 fixture in a LACNIC range with a valid network object | `registry=LACNIC`, registered IP object, RIR source URL is the committed LACNIC service | IANA IPv4 bootstrap plus fixture response | LACNIC optional fields do not become required fields. |
| RF-005 | Public IPv4 fixture in an AFRINIC range with a valid network object | `registry=AFRINIC`, registered IP object, RIR source URL is the committed AFRINIC service | IANA IPv4 bootstrap plus fixture response | AFRINIC optional fields do not become required fields. |
| RF-006 | `AS13335`, ARIN or committed responsible RIR autnum fixture with Cloudflare name and abuse entity | `type=asn`, display `AS13335`, registered ASN range and holder preserved, no IP route section | IANA ASN bootstrap, https://data.iana.org/rdap/asn.json; observed ASN result from Toolblink | ASN normalization accepts all three prefixes and excludes BGP enrichment. |
| RF-007 | IPv6 `2001:4860:4860::8888`, RIPE or ARIN fixture selected by committed range data | `type=ip`, IPv6 source selected, exact returned range and holder preserved | IANA IPv6 bootstrap, https://data.iana.org/rdap/ipv6.json | IPv6 canonicalization must not alter the registry's returned range strings. |
| RF-008 | Any valid input with HTTP 404 and empty body | `status=not_registered`, `body=null`, no holder | RFC 9082 and shared RDAP HTTP status contract | Empty 404 and structured 404 are equivalent negative states. |
| RF-009 | Any valid input with HTTP 429 or 403 | `status=rate_limited` or `blocked`, no answer body, no cache write as a result | Existing `lib/domain/rdap.ts` status mapping | Never render either as unregistered. |
| RF-010 | Team Cymru TXT for `1.1.1.1` with ASN, prefix, country, and network description | `routing.asn=13335`, `routing.prefix=1.1.1.0/24`, `routing.networkName=CLOUDFLARENET`, source Team Cymru | https://www.team-cymru.com/ip-asn-mapping | Routing is optional, separately labeled, and may disagree with RF-001. |

## Test plan

### Pure engine and unit tests

- `tests/pages/ip-asn-lookup/ip-asn-lookup.test.mjs`: input classification, public-address policy, ASN boundaries, CIDR rejection, bootstrap range matching, safe URL construction, status mapping, and result normalization.
- `tests/pages/ip-asn-lookup/fixtures/*.json`: five RIR IP shapes, IPv6, ASN, empty 404, structured 404, rate limit, blocked, malformed, and optional entity variants.
- `tests/pages/ip-asn-lookup/routing.test.mjs`: Team Cymru TXT parsing, absent fields, malformed values, mismatch preservation, and bounded optional behavior.
- `tests/pages/domain-tools/shared/rdap.test.mjs` or the existing shared RDAP test owner: verify the network source extension does not change domain source handling, cache TTL behavior, or throttle semantics.

### API or route tests

- `tests/pages/ip-asn-lookup/api.test.mjs`: same-origin and body-size checks, no-upstream invalid inputs, mocked RIR response states, cache headers, generic failure bodies, and no requester identifier in serialized output.
- `tests/pages/ip-asn-lookup/cache.test.mjs`: cache hit, stale row, cache table unavailable, and no cache write for 403, 429, timeout, invalid JSON, or oversized response.
- `tests/pages/ip-asn-lookup/ssrf.test.mjs`: committed HTTPS bases, rejected HTTP or arbitrary base, redirect host allowlist, and no user text in request host or path outside the fixed object segment.

### Browser tests

- `tests/pages/ip-asn-lookup/ip-asn-lookup.spec.ts`: clean route, valid IPv4 and ASN results, invalid and private recovery, keyboard submit, loading, duplicate submit, stale-result clearing, retry, reset focus, raw disclosure, source metadata, explicit query prefill, dark and light themes, and 320px to 1440px layout.
- `tests/pages/ip-asn-lookup/interface.test.mjs`: route source expectations for the shared workbench, tool content hooks, and stable data attributes used by browser tests.
- `tests/pages/tools/shared/tool-workbench.spec.ts`: add `/ip-asn-lookup` to the divider-bounded workbench representative route list if the shared test's route state supports an unpublished development row.

### Static and SEO tests

- `tests/pages/ip-asn-lookup/page.json`: exact route, docs, tests, scripts, skills, and empty repositories array.
- `tests/pages/tools/shared/tool-workbench.test.mjs`: explicit route inventory and workbench hook.
- `npm run test:static`: route ownership, metadata architecture, content source, and publication policy.
- `npm run typecheck` and `npm run build`: server/client boundary, route generation, and production compilation.
- Publication check: development row stays `is_published=false`, no sitemap entry is expected, and the route's public behavior follows the chosen unpublished policy.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Successful IP result without reports | 1440x900 and 375x812, dark and light | Say the lead answer aloud, then name the unique question answered by allocation, abuse, BGP, source, notes, and raw regions. | One clear registered-holder answer; no region repeats another; no map, score, or owner merge. |
| Long values | 320x812 and 375x812, dark and light | Inspect IPv6, long entity, long email, raw response disclosure, and buttons. | Values wrap within owners; buttons retain readable labels; page does not scroll horizontally. |
| BGP conflict | Desktop and mobile, both themes | Compare the RIR holder and current route values. | The page makes the disagreement legible without calling either value an error. |
| Failure and retry | Desktop keyboard-only | Trigger timeout, inspect focus, retry, edit, and reset. | No stale result remains; focus and recovery are obvious; no hidden upstream detail leaks. |
| SSR and clean route | View source and hydrated browser | Open clean route and explicit query route. | Guide copy is server-rendered; clean URL is unchanged; explicit query does not auto-submit. |

## Test data and mocks

Use fixed JSON fixtures copied from representative RIR response shapes and reviewed against the official RDAP field definitions. Do not make the default suite depend on live registries. Inject `fetch`, the current clock, cache adapter, IANA bootstrap data, and Team Cymru enrichment so each test can assert exact request count and URL. Include a response with nested abuse entity, missing country, long vCard fields, remarks and notices, unknown object class, and escaped HTML-looking strings. Assert that output is text or safe links, never interpreted HTML.

Use a deterministic request ID only inside test logs if needed, never in the public result or cache row. Ensure all tests run with analytics disabled and verify no query appears in the analytics mock. Browser tests use a temporary development database or in-memory route fixture that keeps the page unpublished.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every resolution branch and source disagreement has an authoritative or independently derived fixture specification.
- [x] Every `UI-` requirement covers hierarchy, distinct result purpose, truthful geometry, removal guards, and responsive behavior where applicable.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- None. Network fixtures and the route/API tests are implementation work, not unresolved product behavior.
