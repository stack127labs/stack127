# Edge cases and tests: NFS Firewall Rules Planner

Status: ready
Tool: NFS Firewall Rules Planner
Route: `/nfs-firewall-rules`
Depends on: `competitive-report.md`, `implementation-report.md`, `brief.md`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | A wrong port, service, endpoint, protocol, address family, direction, or command can expose an unintended listener or leave a plausible but incomplete NFS plan. P0 also includes input leakage, command injection, stale output, accidental publication, and an inaccessible primary action. |
| P1 | A common validation, incomplete-plan recovery, firewall translation, copy, reset, keyboard, theme, or narrow-layout flow breaks while the underlying service model remains bounded. |
| P2 | An uncommon resilience, wording, performance, or presentation detail is imperfect without changing the planned listeners or hiding required verification. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Locked flat route, one frame, clean initial state | EC-038, EC-039, EC-040 |
| R2 | Server NFSv4.1+ returns TCP/2049 | EC-001, FF-001 |
| R3 | Server NFSv4.0 returns TCP/2049 and a separate callback boundary | EC-002, FF-002 |
| R4 | Client NFSv4.1+ returns no additional inbound rule | EC-003, EC-037, FF-003 |
| R5 | Client NFSv4.0 requires one verified TCP callback listener | EC-004, EC-009, FF-004 |
| R6 | Server TCP NFSv3 returns exact core and verified helper rows | EC-005, EC-009, FF-005 |
| R7 | Explicit legacy UDP returns protocol-specific rows | EC-006, EC-023, FF-006 |
| R8 | Client NFSv3 returns client listeners only | EC-007, EC-046, FF-007, FF-008 |
| R9 | Optional rquotad is server-v3-only and verified | EC-008, EC-047, FF-009 |
| R10 | Missing dynamic ports return incomplete known rows and no translation/copy | EC-009, EC-018, FF-010, FF-014 |
| R11 | CIDR, port, collision, and hostile input failures remove plausible output | EC-010 to EC-017, EC-024, EC-032, FF-011, FF-015 |
| R12 | Firewalld translation requires a validated zone and explicit rich rules | EC-018 to EC-020, FF-001, FF-014 |
| R13 | UFW translation is source-scoped and exposes the IPv6 boundary | EC-021, FF-012 |
| R14 | Nftables output is an existing-chain expression with correct family selector | EC-022, FF-013 |
| R15 | Every ready plan has branch-correct verification | EC-044, FF-001 to FF-009 |
| R16 | Edits and browser navigation never preserve stale or restored plans | EC-024, EC-030, EC-045 |
| R17 | Submit, Enter, repeat, copy, and reset are deterministic | EC-025 to EC-030 |
| R18 | Labels, fieldsets, errors, live regions, focus, and reading order are accessible | EC-025, EC-026, EC-035, EC-036 |
| R19 | Longest result fits 320, 375, 760, and desktop widths in both themes | EC-033 to EC-036 |
| R20 | Engine is local, plain-text, and storage/network-free | EC-031, EC-032, EC-041, EC-049 |
| R21 | Ownership, preview, and publication remain unpublished | EC-039, EC-040 |
| R22 | Tool-only build has no explanatory page prose | EC-038, EC-049 |

## Coverage checklist

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-011 to EC-017, EC-019, EC-032, EC-045 to EC-047 |
| Numeric boundaries | EC-010 to EC-012 cover ports 1, 65535, 0, 65536, signs, decimals, exponent notation, separators, and collisions. EC-013 to EC-017 cover CIDR prefix bounds. |
| Configuration dependencies | EC-003 to EC-010, EC-018 to EC-023, EC-044 to EC-047 |
| Technical truth | EC-001 to EC-009, FF-001 to FF-014 |
| Submission and concurrency | EC-024 to EC-030. Request abort, timeout, and edit-during-request are not applicable because calculation is local and synchronous. |
| Network and upstream | EC-031 and EC-044. Runtime upstream, offline, rate-limit, partial-response, caching, and schema-change states are not applicable because the engine makes no request. |
| Persistence and sharing | EC-030, EC-031, EC-045. Sharing and restoration are deliberately absent in formula version 1. |
| Accessibility | EC-025, EC-026, EC-033 to EC-036 |
| Responsive and themes | EC-033 to EC-036 |
| Security and privacy | EC-010 to EC-017, EC-019, EC-031, EC-032, EC-049 |
| SSR and SEO | EC-038 to EC-040 |
| Performance | EC-041, EC-042 |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Formula | Server, NFSv4.1+, IPv4 peer `192.0.2.0/24`, firewalld zone `home` | Ready with exactly one inbound TCP `nfs` row on port 2049 and one explicit rich rule | Answer names one listener; row says protocol-fixed; v3 fields absent | Clipboard only after Copy | Unit and E2E: engine test and spec | R2, R12, R15 |
| EC-002 | P0 | Formula | Server, NFSv4.0, same peer | Same one TCP/2049 row plus a separate client-callback boundary | No claim that server rule alone covers the client callback firewall | Clipboard after Copy | Unit and E2E | R3, R15 |
| EC-003 | P0 | Formula | Client, NFSv4.1+, server peer `192.0.2.10/32` | `no_additional_rule`; zero rows and zero translations | Answer explains callbacks use the client-established session; verification stays visible | None | Unit and E2E | R4, R15 |
| EC-004 | P0 | Formula | Client, NFSv4.0, callback port `32768` | Ready with only `nfs4_callback` TCP/32768 from server peer | Callback port is marked user-verified; no inbound 2049 row appears | Clipboard after Copy | Unit and E2E | R5, R15 |
| EC-005 | P0 | Formula | Server NFSv3 TCP; mountd 20048, statd 32765, lockd TCP 32766 | Five ready rows: TCP/111, 2049, 20048, 32765, 32766 with fixed versus verified provenance | Answer count, table order, and reason text match the exact branch | Clipboard after Copy | Unit and E2E | R6, R15 |
| EC-006 | P0 | Formula | EC-005 with `tcp_udp` and lockd UDP 32767 | Ten ready rows, including UDP lockd/32767 while TCP remains 32766 | Protocol is visible on every row; no universal-UDP claim | Clipboard after Copy | Unit and E2E | R7, R15 |
| EC-007 | P0 | Formula | Client NFSv3 TCP; statd 32765, lockd 32766 | Three rows only: rpcbind/111, statd/32765, lockd/32766; no nfs or mountd | Answer says protected NFS client and identifies server as peer source | Clipboard after Copy | Unit and E2E | R8, R15 |
| EC-008 | P0 | Dependency | Server NFSv3 with rquotad selected and verified at 875 | Adds rquotad TCP/875, and UDP/875 only under `tcp_udp` | Rquotad is labelled conditional and user-verified | Clipboard after Copy | Unit | R9, R15 |
| EC-009 | P0 | Incomplete | Server NFSv3 with helper ports empty; client v4.0 with callback empty; rquotad selected with empty port | Incomplete with fixed known rows for v3 or no rows for callback, exact missing list, no translation/copy | First missing field focused; incomplete announcement; no stale ready answer | None | Unit and E2E parameterized | R5, R6, R9, R10 |
| EC-010 | P0 | Collision | Server v3 TCP: mountd and statd both 20048; helper set to 111 or 2049; UDP-only collision across services | Invalid collision identifies both services, protocol, and port; no rows or translation | Error linked to the port group; first conflicting field focused | None | Unit and E2E representative | R11 |
| EC-011 | P1 | Port grammar | `0`, `65536`, `-1`, `+1`, `1.5`, `1e3`, `0x6f`, `1,024`, letters, punctuation, or inner whitespace | Invalid decimal port, never clamped or parsed partially | Field-specific recovery meaning and no result | None | Unit parameterized | R11 |
| EC-012 | P1 | Port boundaries | `1`, `65535`, `00001`, and outer whitespace | Boundaries valid; leading zeroes display as integers; outer whitespace trims | Exact port visible without surprise | None | Unit | R11 |
| EC-013 | P0 | IPv4 CIDR | `0.0.0.0/0`, `192.0.2.1/32`, and `192.0.2.0/24` | Syntactically valid; `/0` remains allowed but receives a broad-source warning in the result | Warning is text, not a blocked result or colored panel | None | Unit and E2E `/0` | R11 |
| EC-014 | P0 | IPv4 CIDR invalid | `192.0.2.999/24`, `192.0.2/24`, `192.0.2.1/33`, `01.2.3.4/24`, bare address, hostname, double slash | Invalid, no plan | Error names IPv4 CIDR requirement and first invalid field gets focus | None | Unit parameterized and E2E representative | R11 |
| EC-015 | P0 | IPv6 CIDR | `2001:db8::/64`, `::1/128`, `::/0`, and IPv4-embedded valid address | Valid in IPv6 mode; hex letters display lowercase; `/0` warns | Full CIDR remains visible and wraps | None | Unit and E2E | R11, R19 |
| EC-016 | P0 | IPv6 CIDR invalid | multiple `::`, nine expanded groups, bad hex, prefix 129, zone id, brackets, port suffix, bare address | Invalid, no plan | IPv6-specific error and no hidden fallback to IPv4 | None | Unit parameterized | R11 |
| EC-017 | P0 | Family mismatch | IPv6 CIDR in IPv4 mode or IPv4 CIDR in IPv6 mode | Invalid family mismatch | Exact expected family is stated; result absent | None | Unit and E2E | R11 |
| EC-018 | P1 | Firewalld context | Complete neutral plan with empty zone | Top-level result is ready; translation status is `missing_context`; neutral table remains valid and copy is unavailable | Zone receives focus; note says the active zone is required | None | Unit and E2E | R10, R12 |
| EC-019 | P0 | Zone injection | Zone includes whitespace, slash, quote, semicolon, newline, `$()`, backtick, 33+ chars, or non-ASCII | Invalid zone; no command interpolation | Input is preserved inertly, error does not echo dangerous syntax into a command | None | Unit, E2E representative, static | R11, R12, R20 |
| EC-020 | P0 | Firewalld translation | Ready IPv4 and IPv6 plans with valid zone | One rich-rule command per row, exact family/source/port/protocol; no service shortcut or apply claim | Commands follow neutral table and remain secondary | Clipboard after Copy | Unit fixtures | R12 |
| EC-021 | P0 | UFW translation | Ready IPv4 and IPv6 plans | One source-scoped `allow in` command per row; IPv6 result includes the UFW IPv6 configuration boundary | No firewalld zone or nftables context shown | Clipboard after Copy | Unit and E2E one branch | R13 |
| EC-022 | P0 | Nftables translation | Ready IPv4 v3 and IPv6 v4 plans | Existing-chain expressions use `ip saddr` or `ip6 saddr`, group sorted ports by protocol, and contain no table/chain creation | Boundary states where the expressions belong | Clipboard after Copy | Unit fixtures | R14 |
| EC-023 | P1 | Ordering | Input ports out of numeric order; same service port for TCP/UDP; repeated calculation | Rows sort TCP then UDP and numerically; same-service duplicates dedupe only within exact protocol | Stable table and copy output | Clipboard after Copy | Unit | R7, R17 |
| EC-024 | P0 | Stale state | Produce ready, incomplete, invalid, copied, and no-additional-rule states, then edit any visible control | All derived state and copy feedback clear immediately | Focus stays in edited control; no plausible old table survives | None | E2E parameterized | R11, R16 |
| EC-025 | P1 | Error association | Invalid CIDR, port, and zone together | Structured errors for all invalid visible fields and one error summary | `aria-invalid`, `aria-describedby`, first invalid control focused, one announcement | None | E2E | R18 |
| EC-026 | P1 | Keyboard | Submit every branch by Enter from a text input and by primary button | Same single deterministic outcome | Valid and no-rule results keep focus on submit with a polite announcement; incomplete focuses the first missing field; invalid focuses the first invalid field | None | E2E | R17, R18 |
| EC-027 | P1 | Repeat | Rapid clicks and Enter presses without edits | One result region, no duplicate rows, identical plan and copy text | No noisy repeated live content | None | E2E | R17 |
| EC-028 | P1 | Reset | Reset from ready, incomplete, invalid, no-additional-rule, and copied states | Defaults restored; conditional values and derived state cleared | NFS version group receives focus | None | E2E | R17 |
| EC-029 | P1 | Clipboard | Copy succeeds, then clipboard write rejects | Success reports copied; failure keeps full plan visible and offers retry meaning | Adjacent polite status, no modal | Clipboard write only | E2E | R17 |
| EC-030 | P1 | Browser state | Reload, back, and forward after editing and calculating | Clean defaults at the exact base route; no restoration | No malformed-state or stale-plan message | Browser history only | E2E | R16, R17 |
| EC-031 | P0 | Privacy | Use unique marker CIDR/ports while observing requests, URL, hash, cookies, localStorage, sessionStorage, IndexedDB calls, analytics, and logs | Marker appears only in current DOM and explicit clipboard content | Local-browser statement remains true | Clipboard after user action only | E2E request/storage spies and static | R20 |
| EC-032 | P0 | Injection | HTML tags, CRLF, NUL, U+2028, shell metacharacters, prototype keys, oversized object, array, and unknown enum values at engine boundary | Invalid or inert plain text; no DOM insertion, command execution, prototype mutation, or crash | No dialog or broken layout; errors do not produce commands | None | Unit, E2E, static | R11, R20 |
| EC-033 | P1 | Responsive | Longest IPv6 server-v3 TCP+UDP result with rquotad at 320, 375, 760, and 1280 px | Document, page, frame, form, answer, records, command block, and verification fit their containers | Every label/value visible; controls at least 44 px; no page horizontal scroll | None | E2E measurements | R19 |
| EC-034 | P1 | Result reflow | Five-plus-row table at 320 and 375 px | Desktop table becomes labelled records or an equally explicit reflow; no clipped hidden values or required table scroll | Service, source, direction, protocol, port, and provenance remain paired | None | E2E and independent Browser QA | R19 |
| EC-035 | P1 | Themes and zoom | Clean, ready, incomplete, invalid, and no-additional-rule in dark/light, 200% zoom, reduced motion | Contrast, semantic status, focus, and order remain clear | No color-only meaning, animation dependency, or new overflow | None | E2E and manual | R18, R19 |
| EC-036 | P1 | Accessibility | Keyboard-only complete flow and screen-reader tree | Logical fieldset order, one h1, result heading before table, verification after translation, no trap | Primary job and recovery are understandable without visual color | None | E2E and independent Browser QA | R18, R19 |
| EC-037 | P0 | Zero-row result | Client NFSv4.1+ under every firewall family and both address families | No command heading, empty table, or `0 rules allowed` success; exact no-additional-rule outcome | Verification and limitation remain visible | None | Unit and E2E | R4 |
| EC-038 | P1 | Hierarchy/tool-only | Compare clean and longest result with three sibling pages during build | One workbench band, answer first, no nested cards, no intro/guide/FAQ in tool-only stage | Two-second scan finds inputs, action, answer, and recovery | None | Static and independent Browser QA | R1, R22 |
| EC-039 | P1 | SSR/static | Inspect route source and guarded preview with JavaScript disabled | Server route owns h1 and tool identity; client island owns interaction; no route metadata | Meaningful identity before hydration | None | Static route test | R1, R21 |
| EC-040 | P0 | Publication | Outside preview request route and sitemap, then start/stop guarded preview | 404 and sitemap exclusion when unpublished; preview makes only local row and restores absence | No accidental indexable route | Local preview database row only during guarded test | Static/SEO/E2E | R21 |
| EC-041 | P1 | Performance | 10,000 longest deterministic engine calculations | Stable output; aggregate under 5 seconds on test host with no unbounded growth | No visible calculation delay | None | Unit benchmark with generous ceiling | R20 |
| EC-042 | P2 | Bundle/hydration | Production build and clean hydration | No new dependency; route client asset stays within budget; no console error or layout shift | Tool becomes interactive without visible jump | None | Build/manual | R19, R20 |
| EC-043 | P1 | Clipboard content | Copy every ready branch | Plain text contains formula version, answer, ordered neutral rows, bounded translation, verification, and source date; no hidden inputs | Copied result is reviewable outside the page | Clipboard after Copy | Unit | R17 |
| EC-044 | P0 | Verification | Every ready and no-additional-rule branch | Server v3 includes `rpcinfo -p`; all include `ss`; firewall command matches family; mount uses explicit version/transport; `findmnt` follows | Verification never claims success and distinguishes access denied from timeout | Clipboard after Copy | Unit fixtures and rendered test | R15 |
| EC-045 | P1 | Conditional state | Switch version, protected host, transport, address family, and firewall after entering branch-only data | Hidden branch values clear and cannot reappear in results; untouched default CIDR may change family but edited CIDR clears | No stale hidden port or zone is submitted | None | E2E | R16 |
| EC-046 | P0 | Client/server separation | Enter server mountd value, switch to client v3, calculate | Mountd and nfs server rows cannot appear; hidden mountd value is ignored and cleared | Client table remains exact | None | Unit and E2E | R8, R16 |
| EC-047 | P0 | Optional service scope | Select rquotad, switch to client or v4, calculate | Rquotad selection and port clear; no rquotad row outside server v3 | Conditional control absent; no hidden value leakage | None | Unit and E2E | R9, R16 |
| EC-048 | P2 | Unknown states | Offline mode, blocked network, system clock change | Calculation remains identical because no time or network dependency exists | No loading, timeout, retry, or stale-source chrome appears | None | Unit/E2E | R20 |
| EC-049 | P0 | Architecture | Static scan of engine/client/route | No `fetch`, XHR, WebSocket, storage API, analytics call, `dangerouslySetInnerHTML`, `eval`, shell execution, route metadata, or public prose in tool-only build | Local and plain-text boundaries are provable | None | Static test and tool-only validator | R20, R22 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | Server, v4.1+, IPv4 `192.0.2.0/24`, firewalld zone `home` | Ready row `server,inbound,nfs,tcp,2049,fixed`; one IPv4 rich rule | RFC 8881 ports plus firewalld rich-language syntax | v4.1+ server; fixed port; source scope |
| FF-002 | Server, v4.0, IPv4 peer, UFW | Ready row TCP/2049 plus callback boundary; one UFW inbound command | RFC 7530 port and callback model | v4.0 server versus client split |
| FF-003 | Client, v4.1+, server `2001:db8::10/128`, nftables | `no_additional_rule`; no rows/translation; v4.1 verification | RFC 8881 session backchannel | Zero-row branch must not become success with commands |
| FF-004 | Client, v4.0, server `192.0.2.10/32`, callback 32768, UFW | Ready only `nfs4_callback,tcp,32768,verified` | RFC 7530 plus RHEL 9 client firewall procedure | User-verified callback, no client 2049 |
| FF-005 | Server, v3 TCP, peer `192.0.2.0/24`, mountd 20048, statd 32765, lockd 32766 | Ready ordered rows TCP/111, 2049, 20048, 32765, 32766; fixed first two, verified rest | Current RHEL 9 NFS server procedure and nfs.conf | Complete server v3 TCP |
| FF-006 | FF-005 plus TCP+UDP and lockd UDP 32767 | Ten rows with UDP lockd 32767; firewalld/UFW commands per protocol | Current RHEL 9 NFS firewall procedure | Explicit legacy UDP and protocol collision space |
| FF-007 | Client, v3 TCP, server `192.0.2.10/32`, statd 32765, lockd 32766 | Ready TCP rows 111, 32765, 32766 only | Current RHEL 9 NFSv3 client firewall procedure | Client listeners, no server-only services |
| FF-008 | FF-007 plus TCP+UDP and lockd UDP 32767 | Six rows, separated TCP/UDP; no nfs/mountd | Current RHEL 9 NFSv3 client firewall procedure | Client legacy UDP |
| FF-009 | Server v3 TCP with rquotad 875 | FF-005 plus `rquotad,tcp,875,verified` | Current RHEL service table plus product explicit option | Conditional service only |
| FF-010 | Server v3 with empty helper ports | Incomplete; known TCP/111 and 2049; missing mountd/statd/lockd; no translation/copy | Current RHEL dynamic-port warning | Unknown is not guessed |
| FF-011 | Server v3 TCP with mountd and statd both 20048 | Invalid collision; no rows/translation | Socket listener exclusivity and Oracle/RHEL port-conflict warnings | Collision after branch resolution |
| FF-012 | Server v4.1+, IPv6 `2001:db8::/64`, UFW | Ready TCP/2049; exact UFW IPv6-capable syntax plus IPv6-enabled caveat | UFW manual plus RFC 8881 | Address-family translation |
| FF-013 | Server v3 TCP, IPv6 peer, nftables | Exact `ip6 saddr ... tcp dport { 111, 2049, 20048, 32765, 32766 } accept` expression | Netfilter nftables sets/families docs | Existing-chain fragment, numeric ordering |
| FF-014 | Complete FF-001 neutral input but empty firewalld zone | Ready neutral result with `translation.status = missing_context`; table retained; no commands/copy | Product contract and firewalld zone model | Translation context does not corrupt neutral facts |
| FF-015 | IPv4 mode with `2001:db8::/64`; IPv6 mode with `192.0.2.0/24`; malformed prefix | Invalid family/CIDR; no plan | IP grammar and product CIDR contract | No family guessing |

The committed fixtures are hand-derived from the cited protocol and firewall specifications. No live NFS server is required because the planner does not claim to discover local RPC assignments. The user-entered helper values are treated as verified facts, and the test oracle verifies only their deterministic placement into the plan.

## Test plan

### Pure engine and unit tests

- `tests/pages/nfs-firewall-rules/nfs-firewall-rules.test.mjs`: FF-001 to FF-015, every branch, CIDR parser grammar, port boundaries, collision detection, ordering, conditional service clearing, firewall translations, verification steps, copy formatting, formula version, immutability, and performance.
- Parameterize hostile input, wrong enums, unknown object keys, arrays, null, prototype keys, long values, and IPv4/IPv6 edge grammar at the public engine boundary.
- Assert structural absence, not merely blank strings: incomplete and invalid results must not own `commands` or `copyText`; no-additional-rule must not own listener rows.

### API or route tests

- Not applicable: the tool has no API, route handler, external source, cache, or server calculation. Static route tests cover the server/client boundary; engine tests cover the input trust boundary.

### Browser tests

- `tests/pages/nfs-firewall-rules/nfs-firewall-rules.spec.ts`: clean state; FF-001, FF-003, FF-004, FF-005, FF-006, FF-007, FF-010, FF-012, FF-014; simultaneous errors; stale clearing; branch field reset; pointer and Enter; repeat; reset; clipboard success/failure; reload/history; privacy; focus and live regions.
- At 320, 375, 760, and 1280 px, calculate FF-006 with IPv6 and rquotad before measuring. Assert document, body, page, frame, form, result, table/records, command area, and verification have no clipped child or page-level overflow. Check at least 44 px controls.
- Verify dark and light themes with ready, incomplete, invalid, and no-additional-rule states. Include 200% zoom and reduced motion in the manual pass.

### Static and SEO tests

- `tests/pages/nfs-firewall-rules/page.test.mjs`: exact flat route, ownership manifest, server h1/tool identity, client island boundary, pure engine path, absent route metadata/canonical/robots/JSON-LD, no network/storage/dangerous APIs, no explanatory prose during build, and unpublished state.
- Existing `tests/stack127/seo.spec.ts`: route is 404 and absent from sitemap outside guarded preview.
- `tests/pages/nfs-firewall-rules/page.json`: route, unpublished reason, docs, tests, scripts, skills, and empty repositories.
- Tool-only validator: every route TS/TSX file stays within the technical-string boundary before writing begins.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Clean | 1280 dark and light | Shared shell, one frame, radio groups, CIDR, primary action | Job and required choices are obvious in two seconds; no result |
| FF-001 | 1280 dark/light | One TCP/2049 row, rich rule, verification | All facts and source scope agree with fixture |
| FF-006 longest | 320, 375, 760, 1280 dark/light | Ten-plus rows, labelled reflow, commands, touch targets | No clipped value, no page scroll, every relationship remains visible |
| FF-003 no rule | 375 and 1280 dark/light | Zero-row answer and v4.1 backchannel explanation | No empty table, command heading, or misleading success badge |
| FF-010 incomplete | 320 and 1280 dark/light | Known rows, missing fields, focus, disabled copy | No guessed helper port or command |
| Invalid collision | 375 and 1280 dark/light | Association, focus, stale clearing | Conflicting services/protocol/port understandable |
| Keyboard-only full flow | 1280 dark | fieldsets, Enter, Copy, Reset | No trap; focus and announcements follow contract |
| 200% zoom/reduced motion | Desktop dark/light | Reflow and focus | No lost content or motion dependency |

## Test data and mocks

- Use only documentation ranges: IPv4 `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`; IPv6 `2001:db8::/32`; sample ports 875, 20048, 32765, 32766, 32767, and 32768.
- No real hostnames, network details, credentials, exports, or user configuration enter fixtures.
- Clipboard success uses a stubbed writer; failure rejects without reading the user's clipboard.
- Browser privacy tests observe requests only after page load, spy on storage methods, and inspect route/query/hash. They do not inspect browser profile data.
- There is no clock, random number, request, or external service mock. Formula version and source date are constants.
- Long translated-like labels belong only to E2E layout fixtures and never change engine semantics.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- None. The contract intentionally treats locally verified ports as inputs instead of attempting a live NFS oracle. The builder must not replace this with distro-specific defaults.
