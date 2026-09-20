# Edge cases and tests: Storage Growth and TCO Planner

Status: ready
Tool: Storage Growth and TCO Planner
Route: `/storage-growth-planner`
Depends on: `competitive-report.md`, `implementation-report.md`, `brief.md`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | A wrong capacity, runway, or TCO answer; unsafe shared state; privacy leakage; or an inaccessible primary calculation flow. |
| P1 | A common invalid-input, restore, copy/share, keyboard, responsive, theme, or stale-result failure. |
| P2 | Uncommon resilience, wording, or presentation polish issue that does not change the modeled answer. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Clean route renders a labelled form with no result or serialized state. | EC-001, EC-022, EC-025 |
| R2 | Valid inputs produce capacity, reserve, demand, shortfall, cost, TCO, and formula-version output. | EC-002, FF-001, FF-002, FF-004 |
| R3 | Mirror, single-parity, dual-parity minimums and equations are exact. | EC-006, EC-007, FF-002 |
| R4 | Compound annual growth and whole-byte rounding are exact through the horizon bound. | EC-008, EC-009, FF-003 |
| R5 | Hardware, power, replacement, backup, and total cost use minor-unit arithmetic. | EC-010, EC-011, FF-004 |
| R6 | Invalid input or impossible layout prevents plausible or stale output and focuses recovery. | EC-003, EC-004, EC-005, EC-012 |
| R7 | Any edit clears a prior result without implicit recalculation. | EC-013 |
| R8 | Click and Enter submit the same action without duplicate state or announcements. | EC-014, EC-015 |
| R9 | Exact chart and year rows are legible at all required widths and themes. | EC-023, EC-024 |
| R10 | Explicit share restores supported state and rejects malformed or unsafe state. | EC-016, EC-017, EC-018, FF-006 |
| R11 | Copy/share feedback is visible and inputs never leave the browser or local storage. | EC-019, EC-020 |
| R12 | Formula engine is outside React and has no browser, network, or storage dependency. | EC-026 |
| R13 | Route is unpublished, owned by one manifest, and has no route-local metadata or registry mutation. | EC-021, EC-022, EC-027 |
| R14 | Supporting guide covers inputs, interpretation, limits, privacy, and next verification step without changing the formula. | EC-028 |
| R15 | Target-owned tests/build pass without touching shared storage surfaces. | EC-029 |

## Coverage checklist

Every applicable risk family has one or more concrete cases. The local synchronous engine has no upstream or loading branch, so those families are explicitly marked rather than silently omitted.

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-003, EC-004, EC-005, EC-006, EC-007 |
| Numeric boundaries | EC-005, EC-006, EC-007, EC-008, EC-009, EC-010, EC-011 |
| Configuration dependencies | EC-006, EC-007, EC-012 |
| Technical truth | EC-002, EC-006, EC-008, EC-009, EC-010, FF-001 through FF-005 |
| Submission and concurrency | EC-013, EC-014, EC-015 |
| Network and upstream | Not applicable: v1 is a synchronous local calculation with no request, cache, upstream, timeout, retry, offline, rate-limit, or response-classification state. EC-020 still asserts no request is made. |
| Persistence and sharing | EC-016, EC-017, EC-018, EC-019, EC-020, FF-006 |
| Accessibility | EC-003, EC-012, EC-014, EC-022, EC-023, EC-024 |
| Responsive and themes | EC-023, EC-024 |
| Security and privacy | EC-018, EC-020, EC-026, EC-027 |
| SSR and SEO | EC-021, EC-022, EC-028 |
| Performance | EC-009, EC-015, EC-026, EC-029 |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Empty | Open `/storage-growth-planner` with no query. | Defaults are present; no calculation result, chart, cost total, or `state` query. | H1, short server-rendered introduction, labelled controls, and one primary Calculate action are visible. No result heading receives focus. | No request, history mutation, storage write, or analytics payload. | Browser: `tests/pages/storage-growth-planner/storage-growth-planner.spec.ts` | R1 |
| EC-002 | P0 | Valid formula | Use the default plan: 10 TB current, 20% growth, 5 years, 20% reserve, dual parity, 6 x 12 TB, $200 drives, $400 enclosure, 60 W, 24 hours/day, $0.15/kWh, zero replacement and backup budgets. | Result has 4 data members, 48 TB modeled usable, 9.6 TB reserve, 38.4 TB planning capacity, demand through year 5, no shortfall, $1,600 hardware, $394.20 power, $0 replacement, $0 backup, and $1,994.20 total. | Answer sentence says the plan clears the horizon; chart, exact year rows, breakdown, and calculation/input version are visible. | Synchronous calculation only; no URL or storage change. | Unit fixture FF-001 plus browser success path | R2 |
| EC-003 | P0 | Input grammar | Clear current data, enter whitespace; enter `1e2` growth; enter `20,5` reserve; enter `$200` drive price; submit. | Every malformed field is rejected; no result is returned; no numeric coercion or partial answer occurs. | Each invalid control has `aria-invalid=true`, an associated description, and an actionable message. Focus moves to the first invalid control. | No URL, request, storage, or analytics side effect. | Unit parser tests and browser invalid-state test | R6 |
| EC-004 | P0 | Input grammar/security | Put `<img src=x onerror=alert(1)>` or `javascript:alert(1)` into a text input or `state` value, then submit/restore. | Payload is rejected as grammar-invalid or unsupported; no markup is interpreted and no result is calculated. | The form remains usable and shows plain-text recovery guidance; no alert, injected node, or navigated URL appears. | No HTML insertion, network request, history update, or storage write. | Unit serialization/parser test and browser restore test | R6, R10 |
| EC-005 | P0 | Bounds | Exercise each numeric field at minimum, maximum, just inside, and just outside: current data 0/1000/1000.000001 TB; growth 0/100/100.01%; horizon 1/10/0/11; reserve 0/50/50.01%; drives 2/24/1/25; drive size 0.1/100/0.099999/100.000001 TB; price/enclosure 0/100000/negative/100000.01; watts 0/2000/-1/2001; hours 0/24/-1/25; rate 0/10/10.01; replacement 0/25/25.01%; backup 0/100000/negative/100000.01. | Valid boundary values calculate or remain editable; each out-of-range value produces a deterministic field issue and cannot enter the engine. | No stale result remains after invalid edit; first invalid control is focused on submit. | No request, URL, storage, or analytics side effect. | Pure validation tests and parameterized browser boundary smoke | R3, R6 |
| EC-006 | P0 | Layout dependency | Select mirror with 2 and 24 drives, then try odd 3 and 23; select single parity with 2 and 3; select dual parity with 3 and 4. | Mirror accepts only even counts >=2; single parity requires >=3; dual parity requires >=4. Valid equations use floor(N/2), N-1, and N-2 data members respectively. | Invalid layout/count combinations are explained beside the dependent control; no result is shown. A valid changed layout requires an explicit new calculation. | No implicit recalculation or URL mutation. | Unit layout tests with FF-002 and browser dependency test | R3, R6 |
| EC-007 | P1 | Input grammar/dependencies | Enter leading zeroes (`00010`, `000.50`, `002`), pasted surrounding whitespace, a negative sign, a plus sign, a thousands separator, or a third fractional digit in capacity, percent, or money fields. | Whitespace around a valid decimal is trimmed; unsupported signs, separators, exponent notation, and excess precision are rejected according to the input contract. Leading zeroes do not change the exact normalized value. | Accepted values remain readable in the field; rejected values receive one precise issue without replacing the user's text. | No coercive URL/storage side effect. | Unit parser table and browser representative paste test | R3, R6 |
| EC-008 | P0 | Growth boundary | Use 0% growth, 100% growth, 10-year horizon, and a result where current data exactly equals planning capacity at year 0. | 0% keeps all demand values equal; 100% doubles with whole-byte rounding; the engine produces 11 demand points for a 10-year horizon; equality is not a shortfall because shortfall is strict `>`. | Year labels are 0 through horizon and the verdict distinguishes “at capacity” from “over capacity.” | Synchronous only. | Unit fixtures and invariant assertions | R4 |
| EC-009 | P0 | Rounding/overflow | Use normalized current data `3` bytes (`0.000000000003 TB`), growth 50%, horizon 3, and a valid 4-drive dual-parity plan. Also run maximum accepted inputs together. | Demand bytes are exactly `[3, 5, 8, 12]` using round-half-up each year; maximum inputs stay within safe bigint/minor-unit arithmetic and complete deterministically without overflow or NaN. | Display rounds only at presentation; exact internal result remains stable after toggling TB/TiB. | No long task, network, or storage side effect. | Pure engine fixture FF-003 plus performance smoke | R4, R15 |
| EC-010 | P0 | Money arithmetic | Use 4 dual-parity drives, $1.01 each, $0 enclosure, 0 W power, 1 year, 12.5% replacement reserve, and $0.01 annual backup. | Hardware is 404 minor units; replacement is 51 minor units from half-up `404 * 1250 / 10000 = 50.5`; backup is 1 minor unit; total is 456 minor units ($4.56). No binary floating-point drift occurs. | Breakdown labels each line and total adds exactly; currency selector changes formatting only, not source minor units. | No currency conversion or price lookup. | Pure engine fixture FF-004 and browser breakdown test | R5 |
| EC-011 | P1 | Power/cost boundaries | Compare 0 W, 0 hours/day, 0 rate, and a half-cent rounding case with 500 W, 1 hour/day, 365 days, 1 year, and $0.01/kWh. | Zero energy inputs yield zero power cost; half-up gives 183 minor units ($1.83) for 182.5 minor units; hardware, replacement, and backup remain independent. | The result does not hide a zero line or invent cooling/PUE costs. | No external rate lookup. | Pure engine fixture FF-004 and browser cost table | R5 |
| EC-012 | P0 | Stale result/invalid recovery | Calculate a valid plan, then make one field blank, enter an invalid value, or select an impossible layout/count. | Result, chart, cost table, and share/copy actions are cleared immediately on edit; submit keeps them absent until all inputs are valid again. | The entered values stay in the form; one polite “result cleared” status appears only when appropriate, and the first invalid control is focused after submit. | Only local React state changes; no history or storage. | Browser state test | R6, R7 |
| EC-013 | P1 | Edit behavior | Calculate, change current data, then change display unit and currency separately. | Any input edit clears the old result; display-unit/currency edits do not calculate implicitly. A fresh explicit Calculate uses current values. | No stale verdict is visually paired with new fields; focus remains on the edited control. | No URL/history/storage change. | Browser interaction test | R7 |
| EC-014 | P1 | Submission | Submit by clicking Calculate, then reload and submit by pressing Enter from a labelled field. | Both paths run the same synchronous calculation and produce one result. Success focuses the result heading; invalid submit focuses the first invalid input. | Result heading is keyboard reachable and announced once through the live/status region. | No duplicate URL, request, or analytics event. | Browser interaction/accessibility test | R8 |
| EC-015 | P1 | Concurrency | Rapidly double-click Calculate and press Enter repeatedly on a valid form. | At most one deterministic result state and one success announcement exist; no duplicated result sections, timers, promises, or history entries are created. | The UI remains responsive and the result is unchanged. | Synchronous handler only; no request cancellation is needed. | Browser rapid-submit test and engine determinism test | R8 |
| EC-016 | P1 | Explicit share | Calculate valid inputs, click Share plan, and grant clipboard access. | A versioned normalized input envelope is encoded; a `state` query is added only after explicit share; the result remains visible. | A visible share-success status and select-able share URL appear; no focus is stolen from unrelated controls. | Clipboard write and `history.replaceState` are allowed; no storage or network. | Unit FF-006 and browser share/URL test | R10, R11 |
| EC-017 | P0 | Restore | Open a valid shared URL generated by EC-016, then reload it. | Supported calculator, calculation, and input versions decode; normalized inputs reproduce the same exact result; query state remains until edit or reset. | A concise restored status is present, result is rendered, and the form values match the shared plan. | No network, storage, or analytics. | Unit state test and browser reload/restore test | R10 |
| EC-018 | P0 | Malformed/unsafe restore | Open invalid base64, truncated JSON, wrong calculator id, unsupported versions, oversized state, duplicate/prototype keys, out-of-range numbers, and an injected string in `?state=`. | Decoder rejects the payload and never partially calculates; defaults remain clean; malformed state is not copied or re-serialized. | A recoverable restore message appears without a stack trace, unsafe markup, or plausible result. Focus moves to that status only for an explicit restore action, not an automatic load. | Read-only URL inspection; no history write, storage, request, or HTML insertion. | Unit state parser/security tests and browser restore matrix | R10, R13 |
| EC-019 | P1 | Copy | Calculate, stub clipboard success, click Copy summary; then stub clipboard rejection and repeat. | Summary contains the key verdict, capacity, horizon demand, TCO breakdown, and calculation version; success/failure are distinct. | Success is a visible polite confirmation; failure gives a recoverable instruction to select/copy visible text. Result remains. | Clipboard write only; no URL/history/storage. | Browser clipboard test | R11 |
| EC-020 | P0 | Privacy/network | Enter a marker such as `private-marker-7f31`, calculate, copy, share not clicked; inspect requests, URL, localStorage, sessionStorage, cookies, and analytics payloads. | Marker occurs nowhere outside live DOM/input state; no request is generated by calculation; URL stays clean until share. | Privacy note accurately says values stay in the browser; no consent or loading state suggests remote processing. | Clipboard only when explicitly invoked. | Browser request/storage inspection and static import scan | R11, R12 |
| EC-021 | P0 | Publication/ownership | Inspect route tree, route metadata, `tests/pages/storage-growth-planner/page.json`, publication rows, sitemap/robots/canonical behavior. | Manifest is `unpublished`; route code has no `metadata`, `generateMetadata`, JSON-LD, canonical, robots, sitemap, registry, migration, or shared-hub edit. | Normal production route remains 404/noindex unless the guarded local preview is explicitly enabled; supporting content remains server-rendered in route source. | No database write in tests; local preview helper may write only a guarded localhost row and must remove it. | Static policy/manifest tests and route inspection | R13, R15 |
| EC-022 | P1 | SSR/hydration | Render the route HTML without client interaction, with and without JavaScript enabled in a local preview. | H1, introduction, labels, tool purpose, and later guide prose are present in server HTML; client hydration adds controls/results without mismatch warnings. | A reader can understand the page purpose without a blank shell; no result is falsely SSR-rendered for a clean route. | No network request from the engine; no storage. | Browser DOM/SSR test and static page test | R1, R13, R14 |
| EC-023 | P1 | Responsive layout | Run a long valid result at 320x900, 375x900, 760x1000, and 1280x800 in dark and light themes. | Document, workbench, chart frame, table, and action row have no horizontal overflow; year rows reflow to labelled blocks at narrow widths; all values remain readable. | Touch targets are at least 44px; chart has text equivalents; no clipped headings, action buttons, or exact values. | No viewport-dependent calculation changes. | Browser responsive/theme test with screenshots and bounding-box assertions | R9 |
| EC-024 | P1 | Accessibility | Keyboard-only tab through the form and result; enable reduced motion; inspect labels, descriptions, fieldsets/legends, focus rings, live regions, chart text, table headers, and result order. | Every control has an accessible name and error relation; focus is visible; reduced motion is respected; live updates are concise and not duplicated. | A keyboard/screen-reader user can calculate, recover, copy, share, and reset without pointer or color-only cues. | No request/storage side effect. | Browser accessibility assertions plus manual screen-reader-oriented DOM review | R6, R8, R9 |
| EC-025 | P2 | Long presentation | Use maximum digits allowed, long currency labels, 10-year output, long restore status, and a failure copy message at narrow width. | Text wraps or scrolls only inside an intentionally labelled table/chart frame; no global overflow or overlapping controls. | Values and buttons stay actionable; no horizontal page scroll is required. | No calculation changes. | Browser responsive regression | R1, R9 |
| EC-026 | P0 | Engine boundary/performance | Import the route-local engine from a Node test without React/DOM, run maximum valid input 100 times, and scan imports/source for browser globals, network clients, and storage calls. | Engine is pure, deterministic, bounded, synchronous, and returns identical exact results; import has no side effects. | No user-visible loading or timeout state is needed. | No request, DOM, storage, clock, or random dependency. | Static import test and Node unit/performance test | R12, R15 |
| EC-027 | P1 | Untrusted output | Provide valid-looking values that include HTML-significant characters through every restored string field and inspect result, summary, and share URL. | All rendered values use text/value-safe APIs; no HTML or URL scheme is executed; share encoding is bounded and versioned. | The result remains calm and recoverable, with no injected link or event handler. | Clipboard/history only for explicit valid actions. | Unit encoding test and browser security test | R10, R13 |
| EC-028 | P1 | Supporting content | Inspect the server-rendered guide after the tool and compare it with `writing-and-seo.md` once produced. | Guide explains representative inputs, result interpretation, equal-drive/RAID-like limitations, privacy, and a next verification step; it does not add a second calculator, unsupported price claims, FAQ wall, or formula change. | Tool remains primary; prose is scannable and links the existing ZFS calculators for technology-specific questions. | Static links only; no data or registry change. | Static content test and browser content-flow test | R14 |
| EC-029 | P0 | Target scope/gates | Run focused engine, route, static policy, typecheck, full unit/static tests, Playwright, and production build from the worktree; inspect diff. | All target-owned tests and quality gates pass or an external environment blocker is recorded. Only route docs/tests/scripts/styles/engine/manifest change; storage hub/sidebar/count/registry/migrations/other tools remain byte-for-byte untouched. | Handoff names every changed file and any failed command with its cause. | No commit, push, PR, deploy, or publication. | Shell gate and final diff review | R15 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | `currentData=10 TB`, `annualGrowth=20%`, `horizonYears=5`, `reserve=20%`, `layout=dual-parity`, `driveCount=6`, `driveSize=12 TB`, `drivePrice=200`, `enclosureCost=400`, `averagePowerWatts=60`, `hoursPerDay=24`, `electricityRate=0.15`, replacement and backup budgets `0`, currency USD. | `dataMembers=4`; raw `72 TB`; usable `48 TB`; reserve `9.6 TB`; planning capacity `38.4 TB`; demand `[10, 12, 14.4, 17.28, 20.736, 24.8832] TB`; shortfall `null`; hardware `$1,600.00`; energy `2,628 kWh`; power `$394.20`; replacement `$0.00`; backup `$0.00`; total `$1,994.20`. | Direct integer derivation from implementation report equations; decimal TB is `10^12` bytes. | Valid default path, no shortfall, reserve floor, hardware/power/total addition, metadata version 1. |
| FF-002 | Compare equal-drive layouts with `driveSize=8 TB`, reserve `0`, and valid counts: mirror `4`, single parity `5`, dual parity `6`; also try mirror `3`, single parity `2`, dual parity `3`. | Mirror: members `2`, raw `32 TB`, usable `16 TB`, redundancy `16 TB`; single parity: members `4`, raw `40 TB`, usable `32 TB`, redundancy `8 TB`; dual parity: members `4`, raw `48 TB`, usable `32 TB`, redundancy `16 TB`. The three invalid combinations return structured validation errors and no result. | Hand-calculated layout equations in implementation report. | Covers all layout branches, minimums, mirror-even invariant, raw = usable + redundancy. |
| FF-003 | Normalized `currentDataBytes=3` (representable as `0.000000000003 TB`), growth `50%`, horizon `3`, and any valid plan. | Demand bytes are `[3, 5, 8, 12]`: round-half-up is applied after each yearly multiplication, not only at the end. | `roundHalfUp(n / d) = floor((n + floor(d/2)) / d)` for positive integers; `3*15000/10000=4.5 -> 5`, `5*15000/10000=7.5 -> 8`, `8*15000/10000=12`. | Whole-byte precision, compound order, half-up ties, horizon points, no floating point. |
| FF-004 | `driveCount=4`, dual parity, `drivePrice=$1.01`, enclosure `$0`, `averagePowerWatts=500`, `hoursPerDay=1`, `horizon=1`, `rate=$0.01/kWh`, replacement `12.5%`, backup `$0.01/year`. | Hardware `404` minor units; energy `182,500 Wh`; power numerator `182.5` minor units rounds to `183`; replacement numerator `50.5` minor units rounds to `51`; backup `1`; total `404+183+51+1=639` minor units (`$6.39`). A companion zero-power case returns power `0`. | Hand calculation from the minor-unit equations. | Half-up for power and replacement, independent cost lines, no binary floating-point drift. |
| FF-005 | Normalize `1 TB` and display it as TB and TiB; normalize `1 TiB` worth of bytes and display it as TiB and TB. | `1 TB` remains `1 TB` and is approximately `0.9094947018 TiB`; `1,099,511,627,776` bytes displays as exactly `1 TiB` and approximately `1.099511627776 TB`. Source bytes and result money do not change when display unit toggles. | Decimal `10^12` and binary `2^40` unit definitions in implementation report. | Display-only conversion, stable stored bytes, readable precision, no recalculation. |
| FF-006 | Encode normalized input envelope `{calculatorId:"storage-growth-tco", calculationVersion:1, inputVersion:1, input:<valid normalized fields>}`; decode it; mutate calculator id, version, bounds, JSON shape, prototype key, and payload length. | Exact supported envelope round-trips to the same normalized inputs and result. Any mutation or malformed/oversized payload returns a typed restore error and never a partial input/result. | Versioned state contract in implementation report; independent round-trip and rejection oracle. | Share is explicit, state is untrusted, no formatted result persistence, no prototype pollution, bounded payload. |
| FF-007 | Use a valid plan where current demand equals planning capacity exactly at year 0, then increase current data by one byte; use growth `0%` for both. | Equality yields `shortfallYear=null`; one byte over yields `shortfallYear=0`; zero growth preserves each demand point. | Strict `demandBytes[y] > planningCapacityBytes` rule. | Shortfall boundary, year-zero behavior, no “at capacity” false positive. |

## Test plan

### Pure engine and unit tests

- `tests/pages/storage-growth-planner/storage-growth-planner-engine.test.mjs`: parser grammar, bounds, whitespace/leading zeroes, unit conversion, basis points, currency minor units, layout minima, result invariants, shortfall search, compound growth, half-up rounding, cost lines, formatting, and FF-001 through FF-007.
- The unit suite must import only the route-local engine. It must assert exact bigint/minor-unit fields before checking formatted strings, and it must run a deterministic maximum-input loop for EC-009 and EC-026.
- `tests/pages/storage-growth-planner/storage-growth-planner-state.test.mjs`: supported envelope round-trip, canonical version checks, malformed base64/JSON, wrong calculator/version, out-of-range values, oversized payload, duplicate/prototype keys, and safe rejection without evaluating or rendering payload strings.

### API or route tests

- Not applicable: the route has no API or server action. `tests/pages/storage-growth-planner/page.test.mjs` should instead assert route ownership, no route metadata/registry imports, server-rendered h1/introduction, local engine boundary, and unpublished manifest shape.
- The shared guarded `scripts/storage-tools/preview-local-pages.mjs` may be used only for managed-development browser runs. It must refuse production and any other `DATABASE_URL`, use `--remove`, and never be part of publication or production quality data.

### Browser tests

- `tests/pages/storage-growth-planner/storage-growth-planner.spec.ts`: EC-001 through EC-025 and EC-027 through EC-028. Use accessible labels and role queries; test success, invalid focus, stale-result clearing, click/Enter, rapid submit, clipboard stubs, explicit share/restore, clean URL/privacy, reset, and the guide-after-tool order.
- Include viewport loops for `320x900`, `375x900`, `760x1000`, and `1280x800`, and theme loops for `dark` and `light`. Assert document, tool, chart, table, and result bounding-box overflow independently. Capture representative desktop and narrow screenshots for final human review.
- Test keyboard-only flow, result heading focus, `aria-invalid`/`aria-describedby`, one polite live region, semantic table headers or labelled mobile rows, 44px targets, reduced motion, and no color-only distinction.

### Static and SEO tests

- `tests/pages/storage-growth-planner/page.json`: `route=/storage-growth-planner`, `state=unpublished`, route-owned docs/tests/scripts/skills, and no shared repository entry.
- `tests/pages/storage-growth-planner/page.test.mjs`: route file ownership, no `metadata`/`generateMetadata`/JSON-LD/canonical/robots/sitemap/registry/migration references, no imports from the storage hub/sidebar, engine contains no React/browser/network/storage imports, and the manifest lists every route-owned artifact.
- Existing sitewide static/SEO checks must continue to discover the route without adding it to a publication registry. A clean production request should remain outside the published surface; local preview is the only route-enablement mechanism.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Clean form | 1280x800, dark | Scan the first viewport. | Tool purpose is clear in two seconds; form labels and Calculate action dominate; no result is implied. |
| Long result | 1280x800, dark and light | Calculate FF-001 and inspect chart, year table, cost table, receipt. | Verdict, exact values, and model limits are hierarchically clear; no chart-only claim. |
| Narrow result | 320x900 and 375x900, dark and light | Inspect screenshots and scroll from form through guide. | No clipped text/control, no global horizontal scroll, labelled rows remain understandable. |
| Mid-width | 760x1000, dark and light | Inspect form grid, chart, action row, and table transition. | Layout is neither cramped desktop nor broken mobile; all controls remain reachable. |
| Invalid restore | 375x900, dark | Paste malformed `state` payload and reload. | Recoverable status is readable, form defaults remain safe, no stack trace or unsafe markup. |
| Keyboard/reduced motion | 1280x800, light with reduced motion | Tab through, calculate, edit, invalidate, copy, share, reset. | Focus is always visible and logical; live status is concise; no animation is required to understand state. |

## Test data and mocks

- Use FF-001 through FF-007 as immutable deterministic fixtures. Keep money assertions in integer minor units and capacity assertions in bigint bytes.
- Use marker strings `private-marker-7f31`, `<img src=x onerror=alert(1)>`, `javascript:alert(1)`, and `__proto__` only as hostile test data; never insert them into generated HTML or commit them as public content examples.
- Stub `navigator.clipboard.writeText` for success and rejection. Do not stub calculation time, randomness, or network because the engine must not depend on any of them.
- For browser URL tests, compare the pathname and query before and after explicit Share, edit, Reset, reload, and malformed restore. Assert no local/session storage values contain the marker.
- For publication tests, use the existing read-only route/manifest quality checks. If a local database preview helper is needed, use a loopback-only `DATABASE_URL`, record the row operation, and remove the row in teardown.
- Test the maximum valid horizon and accepted numeric ranges, but do not generate unbounded strings or payloads. Oversized restore data should be a bounded fixture just above the documented decoder limit.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- None. The product contract intentionally excludes exact technology-specific allocation, live provider prices, and upstream network states. The implementation must not widen the scope without returning to product planning.
