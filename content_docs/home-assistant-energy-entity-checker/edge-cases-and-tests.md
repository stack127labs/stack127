# Edge cases and tests: Home Assistant Energy Entity Eligibility Checker

Status: ready
Tool: Home Assistant Energy Entity Eligibility Checker
Route: `/home-assistant-energy-entity-checker`
Depends on: `competitive-report.md`, `implementation-report.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:d2a2d93cc0b54c03db997f41b8b2db7804c0b33f282e047eefaac875a29829d4`
Input fingerprint: `implementation-report.md sha256:6577e618adfdcef489bcc050c3ecea0d06e9c212e90a3081c2d59ba427695991`
Input fingerprint: `brief.md sha256:1eaa3fd5444c83e5a4ac22414fe535672fcf72c6526a6dc1dbbd2d52cabec632`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | The checker reports a wrong Home Assistant rule, hides an invalid current entity behind a plausible result, leaks pasted attributes, executes untrusted text, or makes the primary check inaccessible. |
| P1 | A normal role, paste, submit, correction, reset, keyboard, responsive, or recovery flow breaks or leaves stale output visible. |
| P2 | An uncommon unsupported key, very long harmless label, or nonessential status polish is imperfect without changing the answer. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Flat unpublished route, docs, ownership, and architecture | EC-016, EC-017 |
| R2 | All nine roles use the pinned matrix | EC-003, EC-004, EC-005, EC-006, FF-001 to FF-009 |
| R3 | Separate bounded Energy and statistics conclusions | EC-003, EC-004, EC-007, FF-001 to FF-017 |
| R4 | Stable exact rule trace | EC-001 to EC-007, EC-019 |
| R5 | Gas has two branches and water one pinned branch | EC-005, FF-006 to FF-008 |
| R6 | Units compare exactly, including Unicode | EC-006, FF-010 to FF-012 |
| R7 | Counter suitability never invents a correction | EC-007, FF-013 to FF-016 |
| R8 | Invalid current input clears stale results and focuses recovery | EC-001, EC-002, EC-010, EC-011 |
| R9 | Paste accepts supported keys and rejects hostile/malformed input | EC-008, EC-009, EC-019 |
| R10 | Submit, reset, retry, and query cleanup follow the contract | EC-010, EC-011, EC-012, EC-018 |
| R11 | No input leaves the browser or enters persistence/analytics | EC-015, EC-017 |
| R12 | Longest result fits all required widths/themes and has 44px targets | EC-014, EC-019 |
| R13 | Pinned provenance is exact | EC-003, EC-016 |
| R14 | Local preview is guarded and removable | EC-016 |
| R15 | Focused and full quality gates pass without publication | EC-016, EC-017, EC-020 |

## Coverage checklist

Every row points to concrete cases or records a tool-specific non-applicability.

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-001, EC-002, EC-008, EC-009, EC-019 |
| Numeric boundaries | EC-002, EC-009, EC-020. The tool classifies current state as numeric/non-numeric and does not calculate the numeric magnitude, so rounding, exponent notation, locale separators, overflow, and precision do not alter a valid classification. |
| Configuration dependencies | EC-003, EC-004, EC-005, EC-006, EC-007 |
| Technical truth | EC-003 to EC-007, FF-001 to FF-016 |
| Submission and concurrency | EC-010, EC-011, EC-018 |
| Network and upstream | EC-015, EC-018. No network or upstream request is part of evaluation, so timeout, rate limit, partial response, schema drift, abort, and request races are not applicable. Runtime failure recovery remains covered. |
| Persistence and sharing | EC-012, EC-015. Sharing and saved state are intentionally unsupported. |
| Accessibility | EC-010, EC-011, EC-013, EC-014 |
| Responsive and themes | EC-014, EC-019 |
| Security and privacy | EC-009, EC-015, EC-019 |
| SSR and SEO | EC-016, EC-017 |
| Performance | EC-014, EC-020 |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Domain | Role grid import; entity `input_number.meter`; otherwise valid energy fields | Both conclusions fail first on domain; later received values remain auditable; no correction YAML | Result says a `sensor` entity is required and shows received domain | Focus answer; no request, storage, analytics, or URL update | Unit + E2E: engine test and `home-assistant-energy-entity-checker.spec.ts` | R4, R8 |
| EC-002 | P0 | Current state | For each of `non_numeric`, `unknown`, and `unavailable`, submit an otherwise valid power entity | Energy result fails current state; statistics result fails current-state eligibility; no previous result remains | Exact state problem appears before class/unit checks; answer heading receives focus | No request, persistence, or URL change | Unit + E2E | R4, R8 |
| EC-003 | P0 | Technical truth | Each electricity-energy role with `sensor`, numeric, `energy`, `total`, `kWh`, `never_resets` | Energy attributes match but live instance check is required; statistics attributes match but recorder check is required | Two conclusions remain visually separate; provenance names Core 2026.8.1/frontend 20260729.6/formula v1 | Focus answer only | Unit fixtures + E2E representative | R2, R3, R13 |
| EC-004 | P0 | Role dependency | Submit `power`/`measurement`/`W` for grid import, then submit it for optional power | Grid import fails only the Energy device/state/unit rules while statistics attributes match; optional power matches both contracts | Each trace row names Energy, Statistics, or Both; changing role cannot rewrite the statistics conclusion | No side effects | Unit + E2E | R2, R3, R4 |
| EC-005 | P0 | Gas/water branches | Gas as `gas`/`m³`, gas as `energy`/`GJ`, water as `water`/`gal`, and water as `energy`/`kWh` | First three match their pinned branches; water-energy fails device class/unit | Trace makes gas's two branches explicit without implying water accepts energy | No side effects | Unit fixtures | R2, R5 |
| EC-006 | P0 | Exact units | Probe `kWh`, `KWh`, `m³`, `m3`, `ft³`, `ft3`, leading/trailing whitespace, and a zero-width character | Outer whitespace trims; exact valid strings match Energy; case/ASCII/extraneous Unicode variants fail only the scoped Energy unit rule while statistics remains independently eligible | Received invalid string, exact accepted list, and affected conclusion are visible and safely wrapped | No side effects | Unit + E2E longest invalid list | R4, R6 |
| EC-007 | P0 | Counter semantics | `total_increasing` with each counter behavior; `total` with `can_decrease`; power with any hidden stale behavior | Picker/statistics attribute conclusions remain rule-based; separate suitability fails for decreasing `total_increasing`, is unresolved for unknown, passes deterministic compatible cases, and is ignored for power | No state-class correction is offered for unknown/decreasing behavior; stale hidden power value cannot affect result | No side effects | Unit + E2E | R3, R7 |
| EC-008 | P1 | Paste success | Paste a States-style block and a JSON-like object containing all supported keys in arbitrary order | Supported keys populate once; manual controls show parsed values; unsupported benign keys are ignored; no calculation occurs until submit | One polite “attributes imported” status; focus remains at paste control | No clipboard read, request, storage, URL, or analytics | Unit parser + E2E | R9 |
| EC-009 | P0 | Paste security | Empty, whitespace, 20,001 chars, malformed quote/bracket, duplicate supported key, `__proto__`, `constructor`, nested object, array, HTML/script, and URL payloads | Parser returns structured invalid; no object mutation, evaluation, HTML, or navigation; stale result clears | Paste field owns the error and receives focus on submit; hostile text renders only as escaped text when shown | No network, navigation, storage, analytics, or clipboard | Unit parser + static + E2E representative | R8, R9, R11 |
| EC-010 | P1 | Stale result | Calculate FF-001, then edit each evaluated control and the paste text | Result clears immediately on every edit; submit recreates only current result | Status is quiet during edits; no credible old answer remains | Unsupported query cleanup only; no other URL side effect | E2E | R8, R10 |
| EC-011 | P1 | Submit/repeat | Submit valid by primary button and Enter from each ordinary input; double-click and repeat submit; submit invalid | Each valid event performs one synchronous deterministic evaluation; invalid has no result; primary action remains visible | Valid focuses answer once; invalid focuses first invalid input; one polite announcement, no duplicate live noise | No request, persistence, or history entry | E2E | R8, R10 |
| EC-012 | P1 | Reset/query | Load base route, then `?state=malformed&keep=1`; interact and reset | Unsupported `state` is removed with `replaceState`, `keep=1` remains; reset restores defaults/clears result | Notice is non-destructive; reset focuses first role control | One `replaceState`; no push, storage, or analytics | Unit URL helper if pure + E2E | R10, R11 |
| EC-013 | P0 | Accessibility | Keyboard-only complete valid and invalid flows; inspect form names, groups, errors, result order, focus, zoom, reduced motion | Native radio/select/input semantics, associated errors, logical reading order, visible focus, no trap, no motion dependency | Primary job works without pointer; result is understandable without color | Focus only | E2E + manual screen-reader structure | R8, R10, R12 |
| EC-014 | P1 | Responsive/themes | Longest failure trace and valid gas result at 320, 375, 760, 1280px in dark/light; zoom to 200% | Document/body/page/tool/form/result have no horizontal overflow; rows reflow; all values visible; targets at least 44px | Primary input/action/answer are findable in two seconds; theme contrast and redundant status text hold | No side effects | E2E measurements + independent Browser QA | R12 |
| EC-015 | P0 | Privacy/network | Fill unique canary values, submit, reset, and inspect code/runtime activity | Engine/client contain no fetch/XHR/WebSocket/storage/sendBeacon; no canary appears in URL or analytics payload | Scoped local-browser statement is truthful | No side effects at all | Static architecture test + Browser network observation | R11 |
| EC-016 | P0 | Publication/preview | Inspect manifest and route; run guarded preview against local DB, then remove it | Manifest is unpublished with reason; preview refuses non-loopback DB; local row is removable; production registry untouched; public route remains 404 | Local route renders only during guarded review; cleanup is explicit | Local DB row only during preview | Static + script + SEO Playwright | R1, R13, R14, R15 |
| EC-017 | P1 | SSR/architecture | Disable client JavaScript and inspect source/static files | H1 and later supporting content are server-rendered after writing; route has no metadata/canonical/robots/JSON-LD; pure engine has no React/browser globals | Tool controls may require JS, but page identity and guide remain readable | No side effects | Static page test + existing site SEO tests | R1, R11, R15 |
| EC-018 | P1 | Runtime failure | Inject an evaluator throw in a controlled Browser test; click retry after restoring evaluator | Result is cleared; neutral failure state appears; retry recomputes current inputs | Failure heading receives focus; retry remains secondary and does not reset form | No request, storage, or URL change | E2E test seam or component-level test; do not expose seam in production | R10 |
| EC-019 | P1 | Long/untrusted display | Maximum legal entity ID, 64-char classes, 32-char unit, translated-like role/result text, `<img onerror>`, and bidi/zero-width characters | Inputs are bounded; rendered text is escaped; trace wraps without clipping; no DOM injection | Long values remain attributable to labels at narrow width | No side effects | Unit + E2E | R4, R9, R12 |
| EC-020 | P1 | Determinism/performance | Run all fixture branches 1,000 times and compare frozen structured results | Results are identical, no input mutation, and average/suite budget stays below 10ms per evaluation on the test machine | No visible loading state or layout shift is needed | No side effects | Unit performance test | R15 |

## Formula or resolution fixtures

All fixtures use domain `sensor`, current state kind `numeric`, and counter behavior `never_resets` unless stated otherwise. Every matching fixture must output `attributes_match_instance_check_required` for Energy and `attributes_match_recorder_check_required` for statistics, plus the pinned provenance.

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | Grid import; `energy`, `total`, `kWh` | Both attribute contracts match; counter suitable; instance checks not inspected | Core 2026.8.1 `energy/validate.py`; sensor `const.py` | Grid import energy branch |
| FF-002 | Grid export; `energy`, `total_increasing`, `Wh`; `resets_to_zero` | Both match; counter suitable | Same pinned sources | Grid export and reset branch |
| FF-003 | Solar; `energy`, `total`, `GJ` | Both match | Same | Solar energy branch and joule unit family |
| FF-004 | Battery charge; `energy`, `total`, `MWh` | Both match | Same | Battery charge |
| FF-005 | Battery discharge and individual device, each `energy`, `total`, `mWh` | Both match for each role | Same | Battery discharge and individual device |
| FF-006 | Optional power; `power`, `measurement`, `W` | Both match; counter check absent | Same plus frontend 20260729.6 power picker | Power branch |
| FF-007 | Gas; `gas`, `total`, `m³` | Both match | `GAS_USAGE_*` constants | Gas volume branch and superscript |
| FF-008 | Gas; `energy`, `total`, `GJ` | Both match | `GAS_USAGE_*` constants | Gas energy branch |
| FF-009 | Water; `water`, `total_increasing`, `gal`; `resets_to_zero` | Both match; counter suitable | `WATER_USAGE_*` constants | Water branch |
| FF-010 | Grid import with unit `KWh` | Energy fails unit; statistics attributes match; received `KWh`, accepted Energy units | Exact `UnitOfEnergy` enum; sensor recorder platform | Case sensitivity and conclusion separation |
| FF-011 | Water with unit `m3` | Energy fails unit; statistics attributes match; accepted water unit list includes `m³` | Exact `UnitOfVolume`, water subset, and sensor recorder platform | Unicode superscript and conclusion separation |
| FF-012 | Gas `gas` with `gal`; water `water` with `gal` | Gas fails Energy unit but matches statistics; water matches both | Gas/water pinned subsets; sensor recorder platform | Role-specific volume subsets |
| FF-013 | Grid import `total_increasing`, `can_decrease` | Attribute contracts match; counter suitability fails; no correction | Sensor developer docs | Separate semantic suitability |
| FF-014 | Grid import `total_increasing`, `unknown` | Attribute contracts match; suitability unresolved; no correction | Sensor developer docs | Unknown boundary |
| FF-015 | Grid import `total`, `can_decrease` | Attribute contracts and suitability match | Sensor developer docs | Preferred total branch |
| FF-016 | Optional power `measurement` with stale `can_decrease` value | Same as FF-006; counter input ignored | Product interaction contract | Hidden dependent input cannot affect result |
| FF-017 | Grid import role with `power`, `measurement`, `W` | Energy device/state/unit rules fail; statistics state-class rule passes; statistics requires recorder inspection | Core 2026.8.1 sensor `recorder.py` `DEFAULT_STATISTICS` and `_get_sensor_states` | Statistics-valid, Energy-role-invalid regression |

Invariants:

- Changing only the visible role can change accepted classes/units but never mutates the submitted input.
- A failure never returns an unconditional eligibility claim.
- Exact unit comparison occurs after trimming outer whitespace and before display truncation.
- Rule order is shared domain/state, Energy device/state/unit, statistics state class, then counter suitability.
- Every result carries formula v1, Core `2026.8.1`, frontend `20260729.6`, and source date 2026-08-09.

## Test plan

### Pure engine and unit tests

- `tests/pages/home-assistant-energy-entity-checker/home-assistant-energy-entity-checker.test.mjs`: all FF fixtures, matrix cross-product, parser grammar, issue order, exact units, no mutation, deterministic corrections, provenance, and performance.
- Test red first for each P0 fixture before adding the engine at `lib/home-assistant-energy/eligibility.ts`.

### API or route tests

- Not applicable: the tool has no API or upstream request. The route's only data boundary is the centrally controlled page registry, covered by site SEO and guarded-preview tests.

### Browser tests

- `tests/pages/home-assistant-energy-entity-checker/home-assistant-energy-entity-checker.spec.ts`: clean load, role switching, valid/invalid manual flows, paste, stale clearing, keyboard/repeat submit, reset, query cleanup, focus/live region, retry, target sizes, overflow, and both representative conclusions.
- Use the guarded local preview only when `VERSION127_TEST_DATABASE_ENV=.env.local`; public SEO runs continue to assert unpublished 404 behavior.

### Static and SEO tests

- `tests/pages/home-assistant-energy-entity-checker/page.test.mjs`: route ownership, pure/local engine, no route metadata, server identity/content boundaries, banned claims, responsive CSS tokens, no untrusted HTML, and preview guard source.
- `tests/pages/home-assistant-energy-entity-checker/page.json`: unpublished state, reason, docs/tests/scripts/skills ownership.
- Existing `tests/version127/seo.spec.ts` and static policy own public 404, sitemap exclusion, query behavior, and route coverage.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Clean and FF-001 result | 1280px dark/light | Two-second scan, role/action/answer hierarchy, exact trace | Primary job is obvious and result is answer-first |
| FF-007 gas result | 760px dark/light | Conclusion stack and superscript unit | No clipping or ambiguous unit |
| FF-010 longest unit failure | 375px dark/light | Full accepted unit set and correction boundary | Values reflow, no page overflow |
| EC-019 hostile long values | 320px dark/light | Escaping, labels, target sizes, scroll widths | No execution, clipping, or target below 44px |
| Keyboard invalid then valid | Desktop dark/light | Focus, error associations, announcement count | One clear recovery path and no trap |
| Complete written page | Desktop and 390px dark/light | Intro, tool, guide rhythm, table behavior, internal/external links | Tool remains primary and content does not repeat result |

## Test data and mocks

- Copy the exact unit enums and gas/water subsets into frozen route-owned fixtures with a source receipt naming Core `2026.8.1`; do not import downloaded Home Assistant code at runtime.
- Use deterministic plain objects for the nine roles and FF cases. Freeze inputs in mutation tests.
- Include malicious strings, duplicate keys, prototype-shaped keys, bidi/zero-width text, maximum legal lengths, and a 20,001-character paste.
- Runtime failure uses a test-only injected evaluator boundary or component mock, never a production query flag or global hook.
- No clock, network, random, locale, production database, Home Assistant token, or user instance is required.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- None.
