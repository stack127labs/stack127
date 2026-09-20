# Edge cases and tests: Rebuild Window and Read-Error Exposure Calculator

Status: ready
Tool: Rebuild Window and Read-Error Exposure Calculator
Route: `/rebuild-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `brief.md`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | A wrong formula, plausible stale result, privacy leak, shared-state mutation, or inaccessible primary answer. |
| P1 | A common input, submission, recovery, keyboard, responsive, or publication-state failure. |
| P2 | Uncommon resilience or visual-polish issue that does not change a valid answer. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Valid defaults show the complete answer set. | EC-001, EC-002, EC-003, EC-004, EC-005 |
| R2 | All four supported layouts use their documented source and tolerance rules. | EC-002, EC-003, EC-004, EC-005, FF-001, FF-002, FF-003, FF-004 |
| R3 | Layout-specific drive bounds prevent invalid configurations and stale output. | EC-006, EC-007, EC-016 |
| R4 | Decimal capacity and throughput units normalize correctly. | EC-008, FF-005 |
| R5 | Scope changes read exposure and delay changes only the degraded window. | EC-009, EC-010, FF-006 |
| R6 | Probability is a stable modeled exposure percentage, never a data-loss verdict. | EC-011, EC-012, EC-013, FF-001, FF-002, FF-003 |
| R7 | RAID 6 minimum-read model and caveat are visible. | EC-004, EC-014, EC-023 |
| R8 | Reset and keyboard submission recover focus and state. | EC-017, EC-018, EC-019 |
| R9 | Inputs stay local and no state is persisted or shared. | EC-020, EC-021, EC-022 |
| R10 | All target viewports and themes remain usable without horizontal overflow. | EC-023, EC-024 |
| R11 | Supporting content is concise, visual-first, and tool-first. | EC-025, EC-026 |
| R12 | Ownership is complete while publication and shared files remain unchanged. | EC-027, EC-028 |

## Coverage checklist

Every applicable family is tied to cases below. Network and upstream behavior is explicitly not applicable because the v1 engine is synchronous and local.

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-030, EC-031, EC-032 |
| Numeric boundaries | EC-006, EC-007, EC-008, EC-009, EC-010, EC-011, EC-012 |
| Configuration dependencies | EC-002, EC-003, EC-004, EC-005, EC-006, EC-007 |
| Technical truth | EC-001, EC-002, EC-003, EC-004, EC-005, EC-009, EC-011, EC-012, EC-013, EC-014 |
| Submission and concurrency | EC-016, EC-017, EC-018, EC-019 |
| Network and upstream | Not applicable: v1 has no network, upstream, cache, timeout, or partial-response boundary. |
| Persistence and sharing | EC-020, EC-021, EC-022 |
| Accessibility | EC-017, EC-018, EC-023, EC-024 |
| Responsive and themes | EC-023, EC-024, EC-025 |
| Security and privacy | EC-020, EC-021, EC-022, EC-031 |
| SSR and SEO | EC-026, EC-027, EC-028 |
| Performance | EC-029, EC-033 |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Default formula | Defaults: RAID 6, 6 drives, 8 TB, 150 MB/s, 100%, 10^-15, 0 hours. | Source equals 4, read bytes equal 32 TB, copy time equals 59.259259 hours, probability equals 0.2258580312, tolerance equals 1, version equals `rebuild-exposure-v1`. | Complete answer is visible on first render with total degraded window first and an assumptions disclosure after it. | No request, storage, cookie, URL, or analytics value. | Unit `lib/rebuild-calculator/engine.test.ts`; Browser `tests/pages/rebuild-calculator/calculator.spec.ts` | R1 R6 |
| EC-002 | P0 | RAID 1 branch | RAID 1, 2 drives, 2 TB, 100 MB/s, 100%, 10^-14, 2 hours. | Source equals 1, read bytes equal 2 TB, copy time equals 5.555556 hours, degraded window equals 7.555556 hours, probability equals `1 - exp(-0.16)`, tolerance equals 0. | Result names one source drive and separates the two-hour replacement delay from copy time. | No external side effect. | Unit table test and Browser layout test | R2 R5 |
| EC-003 | P0 | RAID 5 branch | RAID 5, 4 drives, 4 TB, 200 MB/s, 50%, 10^-15, 0 hours. | Source equals 3, read bytes equal 6 TB, copy time equals 8.333333 hours, probability equals `0.04686621292249526`, tolerance equals 0. | Result exposes the reduced scope and says the probability is modeled exposure, not data loss. | No external side effect. | Unit fixture FF-002 and Browser result assertion | R2 R5 R6 |
| EC-004 | P0 | RAID 6 branch | RAID 6 at the minimum valid count of 4, 1 TB, 1000 MB/s, 100%, 10^-16, 0 hours. | Source equals `N - 2 = 2`, read bytes equal 2 TB, probability equals `1 - exp(-0.016)`, tolerance equals 1. | The result and disclosure call this the minimum reconstruction-read model and state that an implementation may read more. | No external side effect. | Unit fixture FF-003; DOM content test | R2 R6 R7 |
| EC-005 | P0 | RAID 10 branch | RAID 10, 6 drives, 6 TB, 250 MB/s, 100%, 10^-15, 0 hours. | Source equals 1, read bytes equal 6 TB, copy time equals 6.666667 hours, probability equals `1 - exp(-0.048)`, tolerance equals 0. | Result says one surviving mirror member is modeled as the source. | No external side effect. | Unit table test and Browser result assertion | R2 |
| EC-006 | P0 | Minimum counts | Try RAID 1 with 1, RAID 5 with 2, RAID 6 with 3, and RAID 10 with 3 drives. | Each input returns a layout-specific validation error; engine returns no result object. | Error is beside the count, first invalid field receives focus after submit, and no old numeric result remains. | No request or storage. | Unit invalid matrix and Browser invalid-submit test | R3 |
| EC-007 | P1 | Maximum and parity counts | Try 20 valid drives for RAID 5, 6, and 10 where even; try 21; try odd RAID 10 count 5. | 20 is valid for RAID 5 and RAID 6. RAID 10 accepts 20 but rejects odd 5. 21 is rejected for all. | Bounds explain the exact rule without replacing the user's text with a plausible default. | No external side effect. | Unit boundary tests and Browser count-change test | R3 |
| EC-008 | P0 | Unit equivalence | Compare 8 TB against 8000 GB and 0.008 PB with all other fields identical. | Normalized member bytes are equal within exact decimal arithmetic and all derived values match. | Result formatting may choose a different unit only if exact values remain equivalent. | No external side effect. | Unit fixture FF-005 | R4 |
| EC-009 | P0 | Scope boundary | Use scope 1%, 100%, 0%, and 101% with a valid RAID 5 scenario. | 1% and 100% calculate. 0% and 101% return no result and field errors. At 50% read bytes and copy time are exactly half of 100%. | Scope label remains visible as a model assumption; no zero-byte valid result is allowed. | No external side effect. | Unit boundary and invariant tests; Browser edit test | R5 R7 |
| EC-010 | P0 | Throughput and delay boundaries | Throughput 1 MB/s and 100000 MB/s; throughput 0, negative, blank, and 100001. Delay 0 and 8760 hours; delay negative and 8760.01. | In-range bounds calculate. Invalid values return field errors and no result. Delay changes only degraded seconds, not read bytes, copy seconds, or probability. | Error recovery is local and a valid prior result is cleared as soon as the invalid state exists. | No network or persistence. | Unit boundary tests; Browser result-clearing test; FF-006 | R3 R5 |
| EC-011 | P0 | URE probability extremes | Valid inputs with 10^-16, 10^-15, and 10^-14; a tiny exposure that is positive but below 0.01%; a very large exposure. | Probability is monotonic with worse rate and exposure, uses `-expm1`, never negative or above 1, and does not become NaN or Infinity. | Display uses the specified lower-bound phrase for tiny positive values and avoids a false data-loss or success label. | No external side effect. | Unit probability precision tests | R6 |
| EC-012 | P1 | Probability display rounding | Values below 1%, between 1% and 10%, at 10%, at 99.999%, and exactly zero. | Raw result remains unrounded; display follows the precision contract and only displays 0% for an actual zero. | Accessible exact value and visible rounded value do not contradict each other. | No external side effect. | Unit formatting tests; Browser result text test | R6 |
| EC-013 | P0 | Formula invariants | For valid scenarios, increase capacity, source count, scope, or URE rate severity one variable at a time. | Read bytes and copy time are non-decreasing with capacity, source count, scope, and lower URE exponent. Delay leaves read exposure unchanged. | Result updates only after a valid calculation and retains the model labels. | No external side effect. | Property-based or table-driven unit tests | R2 R5 R6 |
| EC-014 | P0 | Exact RAID 6 disagreement boundary | Compare RAID 6 N=6 with source count 4 against a deliberately computed N-1 alternative. | Engine uses only the documented N-2 minimum-read rule and never silently substitutes N-1. | Details show source count 4 and caveat, making the choice inspectable. | No external side effect. | Unit oracle FF-001; DOM text test | R2 R7 |
| EC-015 | P1 | Locale and grammar | Submit whitespace, letters, punctuation, comma decimal `1,5`, plus sign, negative sign, exponent `1e3`, leading zero `08`, fraction for count, and pasted mixed text. | Whitespace, letters, punctuation, locale comma, signs, exponent notation, and fractional counts are rejected according to normalization rules. Leading zeroes are accepted only when they parse as valid base-10 values. | Error is attached to the exact field; no coercion to zero or silent truncation. | No external side effect. | Unit parser tests; Browser paste/keyboard test | R3 R9 |
| EC-016 | P0 | Non-finite and hostile values | Engine receives `NaN`, `Infinity`, `-Infinity`, huge finite numbers, `__proto__`, unknown enum keys, and objects with extra keys. | All non-finite, out-of-range, unknown, and unexpected-shape values reject without throwing or mutating shared objects. | Generic local recovery state only if an unexpected internal exception occurs; never a partial result. | No request, storage, or log of raw values. | Unit trust-boundary test | R3 R9 R12 |
| EC-017 | P0 | Stale result clearing | Calculate a valid result, then change count to an invalid layout combination and submit. | Result is cleared immediately when current form state becomes invalid and remains absent after submit. | The invalid field and message are visible; old numbers cannot be mistaken for the new scenario. | No external side effect. | Browser `calculator.spec.ts` | R3 R8 |
| EC-018 | P1 | Keyboard submit | Focus a field, press Enter once, then use Tab order through every control. | One calculation occurs, controls are reached in logical order, and no duplicate submission is created. | Result heading is announced politely after success; focus stays predictable. | No network or URL update. | Browser keyboard test | R8 R10 |
| EC-019 | P1 | Rapid submit and reset | Double-click Calculate, then immediately click Reset. | Synchronous engine produces one stable result then reset restores defaults; no race, duplicate result, or stale custom result remains. | First field receives focus after reset and a concise restoration announcement occurs. | No asynchronous request or storage. | Browser interaction test | R8 |
| EC-020 | P0 | Privacy request boundary | Fill inputs with a marker string and observe requests, cookies, local/session storage, history, and analytics hooks during calculation. | No request carries calculator values; no storage, cookie, history, query parameter, or analytics event is created. | The page gives no impression that values were saved or shared. | Only same-document UI state is allowed. | Browser request/storage assertions and static `rg` policy test | R9 |
| EC-021 | P1 | Malicious input rendering | Paste HTML-like text, URL-like text, and long Unicode into numeric controls or simulated engine error strings. | Parser rejects it; any displayed error is text content, never HTML or navigation. | No markup executes, no layout escape occurs, and recovery remains available. | No outbound request. | Unit escaping test and Browser security test | R9 |
| EC-022 | P1 | No URL state | Load `/rebuild-calculator?raid=raid5` and use browser back/forward or reload after edits. | Query values do not restore or override inputs. The unpublished route still follows the site's publication behavior. | Inputs remain transient and reload returns the controlled default or 404 preview state, never a hidden saved scenario. | No URL writes or storage. | Static route test and Browser route-state test | R9 R12 |
| EC-023 | P0 | Labels and live result | Inspect the form with accessibility locators; trigger an invalid submit and then a valid submit. | Every input has a unique accessible name and description where needed; errors use `aria-describedby`; result heading uses a polite live region; no color-only meaning. | Screen-reader order is form, result, model disclosure, details. First invalid field receives focus. | No external side effect. | Browser accessibility assertions and manual keyboard review | R8 R10 |
| EC-024 | P1 | Viewports and themes | Render valid and invalid states at 320px, 375px, 760px, and 1280px in light and dark themes, including long results. | No horizontal document or body overflow; controls, buttons, table, and exposure visual remain readable and touch targets usable. | Result hierarchy survives stacking; no clipped labels or theme-only contrast loss. | No external side effect. | Browser responsive/theme test and screenshots | R10 |
| EC-025 | P1 | Reduced motion and zoom | Set `prefers-reduced-motion: reduce` and inspect at 200% browser zoom or equivalent narrow layout. | No essential transition depends on motion; content remains reachable without clipping or overlap. | Calculation remains understandable without animation. | No external effect. | Manual Playwright verification | R10 R11 |
| EC-026 | P0 | Server-rendered content | Request the page with JavaScript disabled or inspect raw response before hydration. | H1, intent-setting copy, tool heading or fallback, and supporting guide content are present in server HTML. The calculation island may require JavaScript for interaction. | A crawler and no-JS reader can understand what the page does and its limits. | No external request from the calculator. | Static render test and production build inspection | R11 R12 |
| EC-027 | P0 | Unpublished route | Run the route without a local guarded preview row and inspect the sitemap. | HTTP response is 404 under normal publication rules, and `/rebuild-calculator` is absent from sitemap. No page registry or migration change is made. | Manifest states unpublished with a clear reason. | No registry, database, or production state mutation. | Static policy and SEO tests | R12 |
| EC-028 | P0 | Ownership boundary | Review `git diff --name-only` after implementation. | Only route source, route-local lib engine, route-owned docs, tests, scripts, and colocated styles appear. Existing storage hub/sidebar/count, registry, migrations, and other tools are unchanged. | Handoff lists every changed file and calls out delegation blockers. | No shared-file writes allowed. | Static diff review and pipeline inspector | R12 |
| EC-029 | P1 | Deterministic performance | Run 10000 valid engine calculations with no DOM or network. | Results are deterministic and complete within the focused unit-test budget; no unbounded loop, allocation growth, or request is observed. | UI remains responsive for a normal single calculation. | No external side effect. | Unit benchmark or timed Node test | R10 R12 |
| EC-030 | P1 | Client bundle boundary | Inspect route imports and compiled output. | No chart, network, storage, or unrelated tool dependency is added; formatter stays in UI and engine remains pure. | Initial page remains small and server-rendered. | No package-lock or package.json change. | Static import test and build output review | R9 R12 |
| EC-031 | P2 | Missing browser APIs | Run engine tests in plain Node without `window`, `document`, `localStorage`, or `fetch`. | Engine computes or validates normally and has no browser global dependency. | The route may require a browser only for interaction, not for formula correctness. | No side effect. | Unit environment test | R9 R12 |
| EC-032 | P2 | Long accessible values | Use maximum valid capacity and low throughput to produce multi-day output and long exact values. | Time, bytes, and probability wrap or stack without overlap; exact details remain readable. | No scientific-notation surprise in the primary result; labels stay associated. | No external effect. | Browser visual review at narrow viewport | R10 R11 |
| EC-033 | P2 | No upstream failure branch | Attempt to simulate timeout, rate limit, malformed response, or offline request. | No such code path or mock is required because v1 makes no request. The test suite records the non-applicability instead of inventing a loading state. | The only unexpected failure path is a generic local recovery state. | No request is permitted. | Static review and unit exception test | R9 R12 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | RAID 6, N=6, 8 TB, 150 MB/s, 100%, URE 10^-15, delay 0. | `source=4`; `readBytes=32000000000000`; `copySeconds=213333.33333333334`; `lambda=0.256`; `p=0.22585803120775164`; `tolerance=1`. | Hand derivation from `N - 2`, SI units, and `-expm1(-lambda)`; Intel RAID 6 guide supports the double-parity boundary. | RAID 6 minimum-read branch, probability, and default result. |
| FF-002 | RAID 5, N=4, 4 TB, 200 MB/s, 50%, URE 10^-15, delay 0. | `source=3`; `readBytes=6000000000000`; `copySeconds=30000`; `lambda=0.048`; `p=0.04686621292249526`; `tolerance=0`. | Hand derivation from parity source count and SI units; Intel/Fujitsu RAID material supports parity reconstruction distinction. | RAID 5 branch, fractional scope, exact probability. |
| FF-003 | RAID 1, N=2, 2 TB, 100 MB/s, 100%, URE 10^-14, delay 2 hours. | `source=1`; `readBytes=2000000000000`; `copySeconds=20000`; `degradedSeconds=27200`; `lambda=0.16`; `p=0.14785621103378865`; `tolerance=0`. | Hand derivation from mirror source and replacement delay; Fujitsu whitepaper supports mirror rebuild contrast. | RAID 1 branch, delay only affects degraded window. |
| FF-004 | RAID 10, N=6, 6 TB, 250 MB/s, 100%, URE 10^-15, delay 0. | `source=1`; `readBytes=6000000000000`; `copySeconds=24000`; `lambda=0.048`; `p=0.04686621292249526`; `tolerance=0`. | Hand derivation from one surviving mirror source. | RAID 10 branch and even-count validation. |
| FF-005 | Same RAID 5 scenario computed once at 8 TB and once at 8000 GB. | `memberBytes`, `readBytes`, `copySeconds`, `lambda`, and `p` are exactly equal after normalization. | SI conversion contract: TB is 10^12 bytes and GB is 10^9 bytes. | Capacity-unit normalization invariant. |
| FF-006 | Any valid scenario with scope 100%, then scope 50%, then add 6 hours delay. | At 50%, read bytes and copy seconds are 0.5 of full scope and probability is `1 - sqrt(1 - p_full)` under the same model. Adding delay increases degraded seconds by exactly 21600 and leaves bytes, copy time, lambda, and p unchanged. | Algebraic invariant of the ordered derivation. | Scope, delay, and probability relationship. |

## Test plan

### Pure engine and unit tests

- `lib/rebuild-calculator/engine.test.ts`: implement FF-001 through FF-006, all layout branches, normalization, bounds, finite-number rejection, exact probability stability, formatting inputs, and monotonic invariants from EC-001 through EC-016.
- Keep engine tests deterministic and browser-independent. Use exact integer byte fixtures where possible and `toBeCloseTo` only for transcendental probability values with a documented tolerance of `1e-12`.
- Add a parser table for whitespace, letters, punctuation, comma decimals, signs, exponent notation, leading zeroes, fractions, pasted text, `NaN`, and `Infinity`.

### API or route tests

- Not applicable: there is no API or upstream resolver. Route tests should cover server response ownership and the pure engine import boundary instead of inventing an API contract.

### Browser tests

- `tests/pages/rebuild-calculator/calculator.spec.ts`: valid default result, all layout changes, invalid count recovery, stale-result clearing, Enter submission, reset focus and live announcement, local-only request/storage checks, long-result layout, and light/dark responsive screenshots.
- `tests/pages/rebuild-calculator/seo.spec.ts`: unpublished route 404 and sitemap exclusion under the normal test database policy; no route-local metadata or registry mutation.
- `tests/pages/rebuild-calculator/accessibility.spec.ts`: labels, descriptions, error association, result live region, keyboard order, focus ring, no color-only meaning, reduced motion, and narrow viewport overflow.

### Static and SEO tests

- `tests/pages/rebuild-calculator/page.json`: route ownership, `state: unpublished`, exact docs, tests, scripts, skills, and empty `repositories` array.
- A route-local static test must reject imports of `fetch`, `localStorage`, `sessionStorage`, `document`, `window`, analytics, and unrelated shared storage engines inside `lib/rebuild-calculator/engine.ts`.
- Run `node skills/stack127/stack127-tool-build/scripts/validate-pipeline.mjs content_docs/rebuild-calculator --tool-only` after the technical build and `node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs /rebuild-calculator --expect=handoff` before handoff.
- Run `npm run test` during iteration and `npm run quality` at handoff. If an environment or unrelated repository failure prevents a gate, preserve the exact command and output and run the focused route checks separately.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Valid default result | 1280x900, dark | Scan the first viewport for answer hierarchy and model trace. | Total degraded window is first, exact read/error values are adjacent, and no dashboard-card sprawl appears. |
| Valid default result | 375x844, light | Inspect stacked fields, buttons, result metrics, and disclosure. | No horizontal overflow, clipped label, or color-only meaning. |
| Invalid RAID 6 count | 320x844, dark | Enter 3 drives and submit by keyboard. | Error is attached to count, old result is gone, focus is recoverable, and the page remains readable. |
| Long result | 760x900, light | Use maximum capacity and minimum throughput. | Multi-day time and long byte values wrap in their own rows without overlapping. |
| Reset and focus | 1280x900, dark | Change several values, click Reset, then tab. | Defaults and result restore, focus begins at the first field, and tab order is logical. |
| No-JS/server render | 1280x900, either | Disable JavaScript or inspect response HTML. | H1, short explanation, tool context, limitations, and guide are present without calculator interaction. |
| Publication | normal route, either | Request route outside guarded local preview and open sitemap. | 404 response and no sitemap entry; no shared publication state changed. |

## Test data and mocks

- Use only deterministic numeric fixtures from FF-001 through FF-006. Keep decimal-unit conversions explicit in fixture names.
- Use a fixed date only for static artifact checks. The engine has no clock dependency.
- Browser request observation must fail the test if any request is made after form submission other than the page's own static resources. Ignore blocked images/fonts only when the test explicitly documents them.
- Storage checks must snapshot local and session storage, cookies, and history before and after calculation. Expected delta is empty.
- Malicious strings include `<img src=x onerror=alert(1)>`, `https://example.invalid/?x=1`, a 10000-character string, `__proto__`, and Unicode digits. They must remain text or be rejected.
- Responsive snapshots use the repository's light and dark theme controls and the exact widths in the manual table. Do not introduce a new visual snapshot dependency.
- Local preview, if needed for an unpublished Browser run, must be guarded to loopback hosts, use development credentials only, record the inserted row, and clean it in a finally block. Never use production database values.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- None in the test contract. Network/upstream, persistence, and sharing failure families are explicitly not applicable to the synchronous local v1 engine.
- The delegated test-design worker stalled and was closed; the main agent authored this ready contract from the validated product report and will validate it before implementation.
