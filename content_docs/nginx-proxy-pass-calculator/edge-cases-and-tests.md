# Edge cases and tests: NGINX proxy_pass URI Calculator

Status: ready
Tool: NGINX proxy_pass URI Calculator
Route: `/nginx-proxy-pass-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:f78bf0883e6c127eccafe1488f0478b657149d12435c901690727dde2dd2b281`
Input fingerprint: `implementation-report.md sha256:e1ec0f2ae6c975838c41c96583afad859e93748094407951ad7b951cc6f8e974`
Input fingerprint: `brief.md sha256:4c4ec377863d3627db8c4dc7aa78088a9bf569f21833c85d70656599c6603be3`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | A wrong upstream URL, plausible URL for an unknown case, leaked configuration input, script injection, stale answer, or inaccessible Calculate action could send a request to the wrong backend or mislead a deployment. |
| P1 | A common prefix, slash, query, validation, keyboard, copy, reset, narrow-layout, or publication flow breaks while the technical core remains bounded. |
| P2 | An uncommon resilience or presentation detail is imperfect without changing the answer or hiding recovery. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Authority-only target retains request path and arguments | EC-001, EC-006, FF-001, FF-006 |
| R2 | URI-bearing target replaces matched prefix literally | EC-002, EC-003, FF-002, FF-003, FF-004 |
| R3 | `/` differs from omitted URI | EC-001, EC-002, EC-007, FF-001, FF-002 |
| R4 | Exact locations require path equality | EC-004, EC-010, FF-005 |
| R5 | Regex and named locations return unknown without URL | EC-011, EC-012, FF-008, FF-009 |
| R6 | Variables, rewrites, proxy queries, and normalization-sensitive paths never get guessed | EC-013 to EC-019, FF-010 to FF-014 |
| R7 | Invalid and oversized inputs clear stale output and recover accessibly | EC-020 to EC-028 |
| R8 | Success shows URL, full trace, and version provenance | EC-001, EC-002, EC-029 |
| R9 | Slash comparison toggles only the terminal slash and makes no recommendation | EC-007, EC-008, FF-006, FF-007 |
| R10 | Any edit removes a prior result | EC-030 |
| R11 | Pointer, Enter, repeat, reset, and clipboard interactions are stable | EC-031 to EC-035 |
| R12 | All target widths and both themes have no page-level overflow | EC-036, EC-037 |
| R13 | One framed, answer-first tool matches the shared shell | EC-038 |
| R14 | No network, URL, storage, analytics, or log side effects contain inputs | EC-039, EC-040 |
| R15 | Server route owns H1 and fallback identity without route metadata | EC-041 |
| R16 | Route remains unpublished and excluded from sitemap | EC-042 |
| R17 | Real NGINX receipt pins version and fails on drift | EC-043, FF-001 to FF-007 |

## Coverage checklist

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-009, EC-020 to EC-028 |
| Numeric boundaries | EC-024 to EC-028. There is no arithmetic number input; boundaries are string lengths and upstream port 1 to 65535. |
| Configuration dependencies | EC-004, EC-010 to EC-019, EC-043 |
| Technical truth | EC-001 to EC-019, FF-001 to FF-014 |
| Submission and concurrency | EC-030 to EC-035. Calculation is synchronous, so request abort and race behavior are not applicable. |
| Network and upstream | EC-039, EC-043. Runtime lookup, timeout, rate limit, partial response, offline, and upstream schema cases are not applicable because the browser engine makes no request. |
| Persistence and sharing | EC-035, EC-040. Share/export is deliberately absent in version 1. |
| Accessibility | EC-021, EC-031 to EC-038 |
| Responsive and themes | EC-036 to EC-038 |
| Security and privacy | EC-023 to EC-028, EC-039, EC-040 |
| SSR and SEO | EC-041, EC-042 |
| Performance | EC-044, EC-045 |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Formula | prefix `/api/`; request `/api/users?id=42`; `proxy_pass http://backend` | Success URL `http://backend/api/users?id=42`; trace says URI absent and path retained | URL is first result; no error | Clipboard only after explicit Copy | Unit and E2E: engine test and spec | R1, R3 |
| EC-002 | P0 | Formula | same, but `proxy_pass http://backend/` | Success URL `http://backend/users?id=42`; suffix `users`, replacement `/` | Trace exposes every segment | Clipboard only after Copy | Unit and E2E | R2, R3 |
| EC-003 | P0 | Formula | prefix `/api/`; request `/api/users`; target `https://backend:8443/v2` | Success URL `https://backend:8443/v2users` | Literal concatenation remains visible even if surprising | None | Unit | R2 |
| EC-004 | P0 | Formula | exact `/health`; request `/health?deep=1`; target `http://backend/status` | Success URL `http://backend/status?deep=1` | Exact match trace has empty suffix | None | Unit and E2E | R4 |
| EC-005 | P0 | Formula | prefix `/`; request `/`; authority-only target | Success URL ends `/`; empty query and suffix remain unambiguous | URL shown, no blank path | None | Unit | R1 |
| EC-006 | P0 | Query | request `/api/users?a=1&a=2&empty=&encoded=%2F` with authority-only target | Raw arguments remain byte-for-byte after `?` | Arguments row shows exact string | None | Unit | R1 |
| EC-007 | P0 | Comparison | primary target `http://backend/` and default case | Primary `/users`; comparison authority-only `/api/users` | Both labeled current/toggled, neither recommended | None | Unit and E2E | R3, R9 |
| EC-008 | P1 | Comparison | target `http://backend/v2`; request `/api/users` | Primary `/v2users`; toggled `/v2/users` | Full URLs visible, no page overflow | None | Unit and E2E | R9, R12 |
| EC-009 | P1 | Input grammar | outer whitespace around every input | Whitespace trims once; internal URI bytes stay unchanged | Success from normalized controls | None | Unit | R1, R2 |
| EC-010 | P0 | Dependency | exact `/health`; request `/health/` | Invalid location/request mismatch, no URL | Error linked to request and first invalid input focused | None | Unit and E2E | R4, R7 |
| EC-011 | P0 | Unknown | regex type `~ ^/api/(.*)$`; otherwise valid | Unknown reason `regex location`; no formula executes | Unknown heading replaces result position and receives focus | None | Unit and E2E | R5 |
| EC-012 | P0 | Unknown | named type `@fallback`; otherwise valid | Unknown reason `named location`; no URL | Verification step visible | None | Unit and E2E | R5 |
| EC-013 | P0 | Unknown | target `http://$backend/` | Unknown variable target; no URL | Field remains editable; no syntax lie | None | Unit and E2E | R6 |
| EC-014 | P0 | Unknown | target `http://backend$request_uri` | Unknown variable URI; no URL | Names variable boundary | None | Unit | R6 |
| EC-015 | P0 | Unknown | rewrite state `break` | Unknown because launch contract excludes changed URI behavior | No stale or comparison URL | None | Unit and E2E | R6 |
| EC-016 | P0 | Unknown | rewrite state `last` | Unknown because a new location search is required | Next step mentions full location set | None | Unit | R6 |
| EC-017 | P0 | Unknown | target `http://backend/base?fixed=1` | Unknown for target-owned arguments | No request arguments are silently combined | None | Unit | R6 |
| EC-018 | P0 | Unknown | request path contains `%2F`, `%2e`, raw `%`, `//`, `/./`, or `/../` | Each classifies normalization-sensitive or malformed as specified; no URL | Reason identifies real NGINX normalization requirement | None | Unit parameterized and E2E one representative | R6 |
| EC-019 | P0 | Unknown | location path contains `//` or dot segment | Unknown before prefix matching | No misleading mismatch error | None | Unit | R6 |
| EC-020 | P1 | Empty | whitespace-only location, request, or target | Invalid required field; no URL | Each error sits by its control; first gets focus | None | Unit and E2E | R7 |
| EC-021 | P1 | Error association | three simultaneous invalid fields | Structured field errors plus one live summary | `aria-invalid`, `aria-describedby`, one announcement, logical focus | None | E2E | R7, R11 |
| EC-022 | P1 | Scheme | `ftp://backend/`, `backend:3000`, or protocol-relative `//backend/` | Invalid supported scheme/URL | No result; exact recovery meaning | None | Unit | R7 |
| EC-023 | P0 | Security | `http://user:secret@backend/` | Invalid credentials; secret never appears in result, URL, logs, or analytics | Error does not echo password | None | Unit, static, and E2E | R7, R14 |
| EC-024 | P1 | Port | port `0`, `65536`, alphabetic, and empty after colon | Invalid authority | Proxy field error and no URL | None | Unit | R7 |
| EC-025 | P1 | Port | ports `1` and `65535`; IPv4 and `[2001:db8::1]:8443` | Valid exact authorities | Full URL wraps safely | None | Unit and E2E IPv6 | R7, R12 |
| EC-026 | P0 | Injection | `<img src=x onerror=alert(1)>`, quotes, CRLF, NUL, and U+2028 in inputs | Invalid controls or rendered inert text; no HTML execution | No dialog, DOM insertion, or layout break | None | Unit and E2E | R7, R14 |
| EC-027 | P1 | Bounds | exactly max location/request/target lengths | Accepted if otherwise valid and formula completes within budget | Long result remains readable | None | Unit, E2E, performance | R7, R12, R17 |
| EC-028 | P1 | Bounds | each field one character beyond its max | Invalid before formula; no truncated parsing | Field explains maximum and keeps recoverable text | None | Unit and E2E one representative | R7 |
| EC-029 | P1 | Provenance | any success | Structured result includes formula v1 and NGINX 1.30.4 receipt reference | Metadata is quiet but readable | None | Unit/static/E2E | R8 |
| EC-030 | P0 | Stale state | calculate success, then edit one character in any input or mode | Result, comparison, copy status, and unknown/error summary clear immediately | Focus remains in edited control; no plausible stale URL | None | E2E parameterized | R10 |
| EC-031 | P1 | Keyboard | submit valid form by Enter from each text input | One calculation and one announcement | Result heading receives focus | None | E2E | R11 |
| EC-032 | P1 | Repeat | click or press Enter repeatedly without edit | Deterministic same result, no duplicate panels, no noisy repeated live text | Result remains single and usable | None | E2E | R11 |
| EC-033 | P1 | Reset | from success, invalid, unknown, and copied state | Defaults restored and all derived state cleared | Location field focused | None | E2E | R11 |
| EC-034 | P1 | Clipboard | Copy succeeds, then simulated clipboard rejection | Success reports copied; failure keeps URL and offers retry meaning | Adjacent polite status, no modal | Clipboard write only | E2E | R11 |
| EC-035 | P1 | Browser state | reload, back, and forward after edits and result | Clean defaults with base route, no restoration | No malformed-state error | Browser history only | E2E | R11, R14 |
| EC-036 | P1 | Responsive | longest accepted success at 320, 375, 760, and 1280 CSS px | document and every page/tool/result container fit; exact URLs remain accessible | No clipped values or page horizontal scroll; 44px controls | None | E2E measurements | R12 |
| EC-037 | P1 | Themes and zoom | valid, invalid, and unknown at dark/light plus 200% zoom/reduced motion | Contrast, focus, semantic status, and order remain clear | No color-only meaning or motion dependency | None | E2E/manual | R12 |
| EC-038 | P1 | Hierarchy | clean and longest result compared with two sibling tools | One frame, form then answer, no nested cards, one accent action | Two-second scan identifies input, action, answer, recovery | None | Independent Browser QA | R13 |
| EC-039 | P0 | Privacy | calculate malicious and ordinary inputs while observing requests and analytics | No request after page assets; no analytics/log payload contains inputs | Local claim is true and scoped | None | E2E request/log inspection and static | R14 |
| EC-040 | P0 | State leakage | inspect route, query, hash, cookies, localStorage, sessionStorage after every action | No user input or derived URL stored or serialized | Base URL stays clean | None | E2E | R14 |
| EC-041 | P1 | SSR/static | fetch route source/render under guarded preview with JavaScript disabled | H1 and tool identity exist server-side; no route metadata exports | Meaningful page identity before hydration | None | Static route test | R15 |
| EC-042 | P0 | Publication | remove preview row, request route and sitemap; then use guarded local preview | 404 and sitemap exclusion when unpublished; local preview only when explicitly added; cleanup restores absence | No accidental indexable state | Local DB preview row only during guarded test | SEO/static/E2E | R16 |
| EC-043 | P0 | Oracle drift | run verifier against `nginx:1.30.4-alpine`, then compare committed receipt and fixture outputs | Version/digest and all supported outputs match; any drift fails | Script gives exact failing fixture | Disposable local containers/network only under explicit script | Integration script plus unit receipt test | R17 |
| EC-044 | P1 | Performance | 1,000 maximum-length deterministic engine calls | Median and worst case remain under stated 10ms per calculation without unbounded growth | No visible delay | None | Unit benchmark with generous aggregate ceiling | R17 |
| EC-045 | P2 | Bundle/layout | production build route asset and clean hydration | No new dependency, code editor, layout shift, or console error | Tool becomes interactive without visible jump | None | Page build/manual | R13, R17 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | prefix `/api/`; request `/api/users?id=42`; `http://127.0.0.1:18081` | `http://127.0.0.1:18081/api/users?id=42` | Real NGINX 1.30.4 echo upstream plus official no-URI rule | Authority-only preserves raw request target |
| FF-002 | same; `http://127.0.0.1:18081/` | `http://127.0.0.1:18081/users?id=42` | Real NGINX 1.30.4 plus official replacement rule | `/` is a URI and strips matched prefix |
| FF-003 | prefix `/api/`; request `/api/users`; target `/v2` | upstream path `/v2users` | Real NGINX 1.30.4 | Concatenation adds no slash |
| FF-004 | prefix `/api/`; request `/api/users`; target `/v2/` | upstream path `/v2/users` | Real NGINX 1.30.4 | Terminal slash changes exact target |
| FF-005 | exact `/health`; request `/health?deep=1`; target `/status` | upstream target `/status?deep=1` | Real NGINX 1.30.4 | Exact location has empty suffix; args preserved |
| FF-006 | prefix `/`; request `/a?x=1&x=2`; authority-only target | upstream target `/a?x=1&x=2` | Real NGINX 1.30.4 | Root prefix and duplicate args preserved |
| FF-007 | prefix `/app`; request `/app/users`; target `/` | upstream target `//users` | Real NGINX 1.30.4 | Literal double slash is an output, not silently corrected |
| FF-008 | regex location and URI-bearing target | `unknown: regex-location` with no URL | Official proxy_pass docs | Cannot determine replaced part |
| FF-009 | named location and URI-bearing target | `unknown: named-location` with no URL | Official proxy_pass docs | Cannot determine replaced part |
| FF-010 | static-looking target containing `$backend` | `unknown: variables` with no URL | Official proxy_pass docs and ticket 803 | Variables change URI interpretation |
| FF-011 | rewrite state `break` | `unknown: rewrite-break` with no URL | Official proxy_pass and rewrite docs | Launch excludes changed URI path |
| FF-012 | rewrite state `last` | `unknown: rewrite-last` with no URL | Official rewrite docs | New location search required |
| FF-013 | request `/api/a%2Fb` or `/api/a/../b` | `unknown: normalization-sensitive` with no URL | Official normalized URI rule | No hand-written raw normalization |
| FF-014 | target `http://backend/base?fixed=1` | `unknown: proxy-query` with no URL | Product v1 contract | Target arguments deferred; no silent merge |

The fixture verifier uses a disposable echo upstream that returns `$request_uri`, an NGINX container with one dedicated server per supported fixture family, loopback-only published ports, and `nginx -T` capture. It must store the image tag, image digest, `nginx -v`, access date, configuration SHA-256, expected request, and observed upstream request target in `tests/pages/nginx-proxy-pass-calculator/fixtures/nginx-1.30.4.json`. A mainline 1.31.3 spot-check receipt may be separate; stable 1.30.4 is the acceptance baseline.

## Test plan

### Pure engine and unit tests

- `tests/pages/nginx-proxy-pass-calculator/nginx-proxy-pass-calculator.test.mjs`: all FF fixtures, every parse and validation branch, comparison toggling, invariants, stale-result-independent pure outputs, malicious strings, length/port boundaries, and performance loop.
- Import TypeScript through the same lightweight transform convention used by sibling tool tests. Do not duplicate production formulas in the test harness.
- Invariants: result URL exists only for `success`; unknown/invalid never carry trace/comparison URL; authority-only preserves supported request target; URI-bearing output begins with the exact target URI; comparison does not change inputs; output is deterministic and input objects are not mutated.

### API or route tests

- No API route is permitted. Static tests fail if route-owned API handlers, fetch calls, server actions, or persistence are introduced.
- `scripts/nginx-proxy-pass-calculator/verify-nginx-fixtures.mjs` is the only external execution boundary and runs explicitly, never from the public page.

### Browser tests

- `tests/pages/nginx-proxy-pass-calculator/nginx-proxy-pass-calculator.spec.ts`: clean state, FF-001 to FF-005 through the UI, invalid and unknown replacement, stale-result clearing, Enter, repeat, reset, clipboard success/failure, reload/history, focus, live region, privacy/state checks, and 320/375/760/1280 measurements in both themes.
- Exercise the longest URL and IPv6 result before measuring. Assert `document.documentElement.scrollWidth <= clientWidth` and also inspect page, frame, form, result, trace, comparison, and code value bounding/scroll widths.

### Static and SEO tests

- `tests/pages/nginx-proxy-pass-calculator/page.test.mjs`: ownership manifest, route path, server H1/tool identity, absent metadata/generateMetadata/canonical/robots/JSON-LD, client island boundary, no prose during build, no network/storage APIs, no dangerous rendering, and no banned recommendation claim.
- Existing `tests/version127/seo.spec.ts`: unpublished 404 and sitemap exclusion outside guarded preview.
- `tests/pages/nginx-proxy-pass-calculator/page.json`: exact flat route, unpublished reason, docs, tests, scripts, skills, and empty repositories.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Clean | 1280 dark and light | Shared shell, one frame, defaults, one primary action | Tool job understood in two seconds; no automatic result |
| FF-002 success | 1280 dark and light | final URL, trace, comparison, focus, version metadata | Every value agrees with fixture and answer is strongest |
| Long IPv6 success | 320, 375, 760 dark and light | wrapping, scroll widths, touch targets | No page overflow or clipped value; actions at least 44px |
| Invalid multi-field | 320 and 1280 dark/light | associations and focus | One announcement, first field focused, stale URL absent |
| Regex unknown | 375 and 1280 dark/light | reason and verification step | No URL or slash comparison anywhere |
| Keyboard-only complete flow | 1280 dark | order, Enter, Copy, Reset | No trap; focus movement follows contract |
| 200% zoom and reduced motion | desktop dark/light | reflow and focus | No lost content or motion dependency |

## Test data and mocks

- Commit only public loopback hostnames, paths, and fixture outputs. Never store real domains, private addresses beyond documentation ranges, credentials, or user configuration.
- Use stable hostnames `backend`, `127.0.0.1`, IPv4 documentation addresses, and IPv6 `2001:db8::/32` in unit/UI data.
- Clipboard tests grant write permission for success and stub rejection for failure without touching the user's clipboard.
- Browser privacy tests observe route requests after initial load, spy on storage methods, and inspect route/query/hash. They do not inspect browser profile data.
- Use a deterministic no-clock engine. Copy feedback may use a fake timer only to test clearing.
- The real-instance script creates uniquely named disposable containers/network, validates exact targets, and removes only those exact resources in `finally`.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- None in the test contract. Real NGINX fixture access remains a build gate and cannot be replaced with hand-derived fixtures if the container runtime is unavailable.
