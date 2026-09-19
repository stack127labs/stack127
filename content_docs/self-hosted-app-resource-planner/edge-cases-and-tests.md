# Edge cases and tests: self-hosted app resource planner

Status: ready
Tool: Self-hosted app resource planner
Route: `/self-hosted-app-resource-planner`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:e02d971f0055a8585daa4c8bd68f0ef3da388011d79571f0966e2c6bcddfa394`
Input fingerprint: `implementation-report.md sha256:42cf89821fa32e407542fc947b0b1db74527b62ef489423a0c59537efdd5523c`
Input fingerprint: `interface-contract.md sha256:3e2910010baceb8bfb5a27005141703dd9a2813f52b0de5384c56f2a4cfa20ce`
Input fingerprint: `brief.md sha256:891670c28e434711521196a48d7fe72ac355af8193e1fa7f64cd9d5d345339fc`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | Shows a materially wrong budget state, turns unknown data into a false fit, leaks user planning data, breaks the primary calculation, or exposes an unpublished route. |
| P1 | Breaks a common edit, validation, recovery, keyboard, result, or mobile flow. |
| P2 | Uncommon resilience, density, theme, or performance issue that does not change the calculation. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Published curated app can be added with quantity 1 and evidence visible. | EC-002, EC-026 |
| R2 | Custom row can be added without a source-backed claim. | EC-009, EC-010, EC-020 |
| R3 | Quantity is a bounded positive integer and preserves other inputs on error. | EC-011, EC-012 |
| R4 | Host budgets and headroom validate exactly. | EC-001, EC-004, EC-005, EC-012 |
| R5 | Known ranges multiply and sum without display rounding changing the result. | FF-001, FF-002, FF-005, EC-006 |
| R6 | Headroom changes available budget and fit status. | FF-002, FF-003, EC-004 |
| R7 | Complete known dimensions classify as within, tight, or over. | FF-003, EC-005 |
| R8 | Unknown rows keep known subtotal and withhold affected fit. | FF-004, EC-007, EC-008 |
| R9 | Binding known resource uses the highest complete ratio. | FF-002, EC-005 |
| R10 | RAM and storage have separate exact results and accessible legends. | EC-018, EC-023 |
| R11 | Invalid submit focuses the first invalid field and renders no stale result. | EC-001, EC-010, EC-014, EC-016 |
| R12 | Reset clears rows and restores headroom and focus. | EC-014, EC-016 |
| R13 | Clean route has no URL mutation, input network request, or page overflow. | EC-018, EC-019, EC-023 |
| R14 | Server catalogue is rendered while the exact route stays unpublished and returns 404. | EC-021, EC-024, EC-026 |
| R15 | Supporting prose is not duplicated in the client workbench and route owns no SEO metadata. | EC-024, EC-025 |
| UI-001 | Lead answer states budget state and binding or unknown. | EC-005, EC-007, EC-008, EC-017 |
| UI-002 | Inputs appear in task order with labels and units. | EC-016, EC-018 |
| UI-003 | Ranges are not duplicated across result regions. | EC-017 |
| UI-004 | Bars use truthful denominators and omit incomplete dimensions. | EC-007, EC-008, EC-018 |
| UI-005 | Unknown data withholds fit verdict and names the row. | EC-007, EC-008, EC-009 |
| UI-006 | Invalid submit focuses the first field and clears stale output. | EC-001, EC-010, EC-014 |
| UI-007 | Add/remove focus behavior is stable. | EC-016 |
| UI-008 | Narrow layouts avoid page overflow and isolate table scrolling. | EC-018 |
| UI-009 | One primary action remains visually primary. | EC-017, EC-023 |
| UI-010 | Live region, bar text, and table headers are accessible. | EC-017, EC-018, EC-023 |
| UI-011 | Clean canonical URL stays unchanged through hydration. | EC-019 |
| UI-012 | CPU total, provider recommendation, Docker output, and decorative chart stay omitted. | EC-017, EC-024 |

## Coverage checklist

Every row points to an executable case or gives a tool-specific reason.

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-001, EC-009, EC-010, EC-011, EC-012 |
| Numeric boundaries | EC-004, EC-005, EC-006, EC-011, EC-012 |
| Configuration dependencies | EC-003, EC-007, EC-008, EC-010, EC-013 |
| Technical truth | FF-001, FF-002, FF-003, FF-004, FF-005, FF-006, EC-026 |
| Submission and concurrency | EC-014, EC-015, EC-016 |
| Network and upstream | EC-019, EC-021, EC-026; runtime lookup is not used after hydration |
| Persistence and sharing | Not applicable: sharing, query state, and local storage are explicitly deferred; EC-019 verifies no accidental persistence. |
| Accessibility | EC-001, EC-016, EC-017, EC-018, EC-023 |
| Responsive and themes | EC-018, EC-023 |
| Security and privacy | EC-020, EC-025, EC-026 |
| SSR and SEO | EC-019, EC-024, EC-026 |
| Performance | EC-022, EC-023 |
| Control mode, switching, parity, and hidden-state recovery | EC-027. Single mode keeps app rows, quantities, host budget, and headroom visible; there is no mode switch, no hidden custom assumption, and no hidden-setting recovery path. Repeating the same normalized selection is the parity check. |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P1 | Empty submit | Clean state; activate `Calculate plan` with no rows and empty host budgets. | Return field and row errors; no result object. | App chooser receives focus; one live error summary names the missing app and budgets. | No request, URL change, storage, or analytics. | Browser `tests/pages/self-hosted-app-resource-planner/self-hosted-app-resource-planner.spec.ts` | R4, R11, UI-006 |
| EC-002 | P0 | Known single row | Catalogue row `vaultwarden`, quantity 1, RAM 256-512 MiB and storage 1-2 GB; host 8 GiB and 100 GB; headroom 20%. | RAM and storage totals equal the row ranges; both dimensions classify within when max <= available. | Lead result says the known plan is within budget; source kind and checked date remain visible in row evidence. | Local calculation only. | Engine plus Browser | R1, R5, R7, UI-001 |
| EC-003 | P0 | Quantity aggregation | Two curated rows with quantities 2 and 3, each known in both dimensions. | Each lower and upper bound is multiplied before sum; row order does not change totals. | Contribution table shows quantities and the lead remains one answer. | Local calculation only. | Engine `self-hosted-app-resource-planner.test.mjs` | R1, R5 |
| EC-004 | P0 | Headroom bounds | Same known rows with headroom 0%, 20%, 80%, then -1% and 81%. | 0% and 80% are valid; available budget is exact; outside values are invalid with no result. | Headroom stays visible; invalid value gets a field error and does not reuse the old result. | No persistence. | Engine and Browser | R4, R6 |
| EC-005 | P0 | Fit boundaries | Choose a complete range whose maximum is exactly equal to available budget, then one unit below and one unit above; test minimum exactly equal too. | Exact maximum is `within`; minimum <= available < maximum is `tight`; minimum > available is `over`; no floating-point drift changes the boundary. | Lead and binding resource match the classification; bars use the same denominator. | Local calculation only. | Engine truth table and Browser | R5, R7, R9, UI-001 |
| EC-006 | P1 | Precision and rounding | Use 0.05 GiB lower, 0.15 GiB upper, quantity 3, and host values that display as whole GiB. | Internal MiB calculation retains precision; display rounding does not alter fit. | Display is readable and never shows a positive value as zero when it affects the result. | No analytics. | Engine plus screenshot/manual inspection | R5, R10 |
| EC-007 | P0 | Unknown RAM | Select a published app with storage evidence but no RAM range, plus a fully known row. | Known RAM subtotal is returned; RAM fit and binding are `unknown`; storage can still classify if complete. | Unknown list names the app and RAM; no RAM allocation bar claims a fit. | Local calculation only. | Engine and Browser | R8, UI-001, UI-004, UI-005 |
| EC-008 | P0 | Unknown storage | Select a published app with RAM evidence but no storage range, plus a fully known row. | Known storage subtotal is returned; storage fit is `unknown`; RAM can still classify if complete. | Storage unknown is visible beside the row and in the result; RAM remains useful. | Local calculation only. | Engine and Browser | R8, UI-001, UI-004, UI-005 |
| EC-009 | P1 | Custom unknown row | Add custom name `My private service` with no bounds and quantity 1. | Row is retained as unknown for both dimensions and contributes zero only to the known subtotal, never to a fit verdict. | Result says custom requirements are unknown and labels the row user supplied. | No request containing the name. | Engine and Browser | R2, UI-005 |
| EC-010 | P1 | Custom bounds | Test custom lower only, upper only, lower > upper, equal bounds, and valid fractional pair. | Started bound pair requires both values; reversed pair is invalid; equal and valid fractional pairs calculate. | Error appears beside the row; valid values remain after correction. | No request. | Engine and keyboard Browser | R2, R11, UI-006 |
| EC-011 | P1 | Input grammar | Paste whitespace, letters, punctuation, locale comma `1,5`, exponent `1e3`, plus sign, leading zeroes, and unsupported unit text into numeric fields. | Only the accepted decimal grammar normalizes; unsupported or ambiguous values are rejected without silent coercion. | Error names the affected field; other rows and values stay intact. | No request or URL serialization. | Engine and Browser | R3, R4, UI-006 |
| EC-012 | P0 | Min/max numeric limits | Quantity 0, -1, 1.5, 99, 100; RAM below 0.25, at 0.25, above 4096; storage below 1, at 1, above maximum; headroom at -1 and 81. | Exact inclusive bounds pass; outside and non-integer values fail; no overflow or `Infinity`. | Field errors are precise; no plausible result appears. | No persistence. | Engine boundary table | R3, R4 |
| EC-013 | P1 | Duplicate rows and order | Add the same curated app twice with quantities 1 and 2; reorder by remove and re-add. | Duplicate rows are either preserved as separate quantities or merged deterministically; totals are identical and the decision is documented in code tests. | Table remains legible; evidence is not duplicated into a second result region. | Local only. | Engine and Browser | R5, UI-003 |
| EC-014 | P0 | Stale result after edit | Calculate a valid result, change quantity, budget, headroom, or selected app, then submit invalid data. | Old result is marked stale or removed immediately; invalid submission leaves no stale lead or bar. | User sees the edited inputs and a clear recalculation path. | No request, URL change, or analytics. | Browser | R11, UI-006 |
| EC-015 | P1 | Double submit | Press Enter and click `Calculate plan` rapidly, or click twice during calculating. | One calculation runs; button keeps width and prevents duplicate result announcements. | One `Plan calculated` announcement and one result update. | No duplicate network or analytics event. | Browser | R11, UI-009, UI-010 |
| EC-016 | P1 | Row focus recovery | Add a row with keyboard; remove focused row; submit invalid first and second rows. | Add focuses new chooser; remove moves focus to stable adjacent action; invalid submit focuses first invalid control. | Keyboard user can continue without a focus jump to page top. | No storage. | Keyboard Browser | R11, R12, UI-006, UI-007 |
| EC-017 | P1 | Result semantics | Render complete and partial results with long app names. | Exactly one lead result, distinct RAM/storage summaries, one live region, no CPU total/provider/Docker/chart output. | Result is scannable and repeated formatted values do not compete. | No analytics. | Browser DOM and manual comprehension review | R9, R10, R15, UI-001, UI-003, UI-009, UI-010, UI-012 |
| EC-018 | P1 | Mobile table and overflow | Render 320 px and 375 px with 20 rows, long names, source notes, and all result sections. | `documentElement.scrollWidth == clientWidth`; only the contribution table wrapper can scroll and has a focusable accessible name. | Inputs remain in order; table is usable without page-level horizontal scrolling. | No URL change. | Mobile Playwright | R10, R13, UI-002, UI-004, UI-008, UI-010 |
| EC-019 | P0 | SSR, hydration, and privacy boundary | Open clean route, observe requests through hydration, inspect history and query string. | Catalogue is server-rendered; clean URL remains unchanged; no user input request, local storage, or query serialization occurs. | No hydration jump or surprise result. | Catalogue request is allowed server-side; user values are not sent or logged. | Route test, Playwright network and history test | R13, R14, UI-011 |
| EC-020 | P0 | Untrusted custom text | Use HTML-like app name, source-looking text, quotes, newlines, and a very long string. | Text is escaped and length-bounded; no HTML, URL, or script execution; custom row stays user supplied. | Long text wraps or truncates safely without layout break. | No request or analytics containing raw text. | Engine validation and Browser | R2, UI-008 |
| EC-021 | P1 | Catalogue failure | Mock the server catalogue query to fail, return an empty list, or return a malformed resource field. | Route error is distinct from empty plan; malformed rows are rejected or marked unknown, never coerced to zero. | Recovery names the problem and offers retry or site navigation; no fake app catalogue. | No client fallback request loop. | Route test | R14 |
| EC-022 | P2 | Engine size and determinism | Calculate 50 valid rows, each quantity 99, with large but valid ranges. | Result is deterministic, finite, and completes under 100 ms in the Node test environment. | UI remains stable and does not add a loading delay for local arithmetic. | No request. | Performance unit test | R13 |
| EC-023 | P2 | Theme, zoom, motion, and touch | Check dark/light at 1440, 760, 375, and 320 px; keyboard-only; 200% zoom; reduced motion. | Contrast, focus ring, labels, hit targets, and order remain usable; no transition is required for comprehension. | Bars retain text labels; no status relies on color. | No analytics. | Playwright plus manual visual review | R10, UI-004, UI-009, UI-010 |
| EC-024 | P0 | Publication boundary | Request exact route in the production-style test server while slug is absent from `public.stack127_pages`; inspect sitemap and route source. | HTTP 404; slug absent from sitemap; no route-owned metadata, canonical, robots, or JSON-LD is added. | Unpublished page is not discoverable. | No production database writes. | Static and SEO tests | R14, R15, UI-012 |
| EC-025 | P0 | Input leakage | Enter a distinctive custom name, bounds, and budget; inspect request bodies, console logs, analytics calls, and storage. | No user planning value appears outside the in-memory client state; no analytics event is emitted. | User can plan privately in the browser. | Server catalogue fetch only. | Playwright network and console test | R2, R13 |
| EC-026 | P0 | Provenance and schema trust | Server fixture includes a reviewed estimate with source URLs, a null range, an invalid negative range, and a future unknown field. | Valid reviewed data retains evidence metadata; null becomes unknown; invalid row is rejected or quarantined; unknown schema fields do not change arithmetic. | The result distinguishes reviewed estimate, user supplied, and unknown. | No automatic data repair or publication mutation. | Route fixture and engine test | R1, R8, R14 |
| EC-027 | P1 | Control mode and hidden-state recovery | Select two catalogue apps with quantities and a custom host budget, calculate, Reset, then repeat the exact selection and submit again. Edit one quantity after a result and submit an invalid budget. | The planner remains single mode with no Basic/Advanced switch. The same normalized app rows, quantities, budget, and headroom produce equivalent output after Reset. All result-driving values stay visible; invalid budget recovery cannot be hidden behind a collapsed evidence area and no stale estimate remains. | Reset focuses the chooser. Editing keeps the changed control focused, clears the result, and associates the first invalid budget issue while preserving the other rows. | No catalogue mutation, URL state, storage, request, or analytics side effect beyond the documented catalogue load. | Engine determinism plus Browser state/accessibility test in `tests/pages/self-hosted-app-resource-planner/self-hosted-app-resource-planner.test.mjs` and `self-hosted-app-resource-planner.spec.ts` | R2, R8, R10, UI-013 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | One row: RAM 256-512 MiB, storage 1-2 GB, quantity 1; host 8192 MiB and 100 GB; headroom 20%. | Available RAM 6553.6 MiB and storage 80 GB; RAM 256-512 MiB and storage 1-2 GB; both `within`. | Hand derivation from implementation report formula. | Quantity 1 identity; min <= max; known result has no unknown rows. |
| FF-002 | Row A RAM 1024-2048 MiB, storage 4-8 GB, quantity 2; row B RAM 512-1024 MiB, storage 1-3 GB, quantity 3; host 8192 MiB, 100 GB, headroom 20%. | RAM 3584-7168 MiB; storage 11-25 GB; available 6553.6 MiB and 80 GB; RAM `tight`, storage `within`, RAM binding. | Hand multiplication and sum from implementation report. | Aggregation is associative and row order invariant. |
| FF-003 | A complete dimension with known 4-6 GiB, host 8 GiB and headroom 20%; vary max to 6.4 GiB, 6.399 GiB, and 6.401 GiB, then vary min above 6.4 GiB. | Max 6.4 is `within`; max above min but above available with min below is `tight`; min above available is `over`. | Exact inequality contract in implementation report. | Equality belongs to `within`; no display rounding changes classification. |
| FF-004 | Known RAM 1-2 GiB plus a selected app with `ram=null`; both storage ranges known. | RAM known subtotal 1-2 GiB and `fit=unknown`; storage still classifies; unknown list contains the app and RAM. | Unknown rule in implementation report and current Stack127 null policy. | Missing is never zero; dimensions remain independent. |
| FF-005 | Custom RAM 0.05-0.15 GiB, quantity 3, host 1 GiB, headroom 0%; storage omitted. | Internal RAM 51.2-153.6 MiB; display preserves a positive lower amount; RAM `within`; storage `unknown` only if a storage comparison is requested. | Unit conversion plus display rules in implementation report. | Internal precision precedes display rounding. |
| FF-006 | Custom row with RAM 2-1 GiB and storage 10-10 GB. | RAM validation error; no result; storage pair is independently valid but no combined result is emitted while any row error remains. | Input bounds contract and no-result-on-error invariant. | No result coexists with invalid input. |

## Test plan

### Pure engine and unit tests

- `tests/pages/self-hosted-app-resource-planner/self-hosted-app-resource-planner.test.mjs`: FF-001 through FF-006, EC-003 through EC-013, EC-020, EC-022, and EC-026. Test normalized values, exact inequalities, range aggregation, unknown state, finite output, duplicate-row policy, and provenance classification without React or a database.
- Add property-style fixed loops for quantity and row-order invariance. Do not use random tests without a recorded seed.

### API or route tests

- `tests/pages/self-hosted-app-resource-planner/page.test.mjs`: EC-019, EC-021, EC-024, and EC-026. Verify the server catalogue query is bounded to published self-hostable apps, malformed rows do not become zero, and the exact unpublished route is blocked.

### Browser tests

- `tests/pages/self-hosted-app-resource-planner/self-hosted-app-resource-planner.spec.ts`: EC-001, EC-002, EC-005, EC-007, EC-008, EC-009, EC-010, EC-014 through EC-020, EC-023, and EC-025. Cover click and keyboard submit, focus recovery, live-region meaning, result hierarchy, omission guard, mobile overflow, themes, and network privacy.
- Use Chromium and mobile projects at 1440, 760, 375, and 320 px. Use dark and light themes. Browser assertions must inspect the rendered result without reading the internal reports.

### Static and SEO tests

- `tests/pages/self-hosted-app-resource-planner/page.json`: route ownership, docs, test files, scripts, skills, and `published: false` state.
- `tests/pages/self-hosted-app-resource-planner/publication.test.mjs`: EC-024. Verify the route is unpublished, absent from the sitemap, and has no route-local metadata or JSON-LD.
- `npm run test:static`: verify the content folder, ownership manifest, route reference, and no global CSS ownership leak.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Successful complete result | 1440 px, dark and light | Read the result without opening reports. Name the lead answer, RAM question, storage question, binding question, and evidence question. | One lead answer; each region adds a distinct answer; no provider, CPU, Docker, or chart surface appears. |
| Partial result | 375 px, dark and light | Select one app with a missing dimension and one known app. | Known subtotal remains readable; unknown app and dimension are named; no affected fit verdict or misleading bar appears. |
| Invalid state | 320 px, keyboard only | Submit with missing budget and a reversed custom range. | First invalid control receives focus; errors sit below fields; no stale result or page overflow. |
| Contribution table | 375 px, both themes | Inspect long app names and source labels. | Only table wrapper scrolls; headers remain understandable; the page itself has no horizontal overflow. |
| Empty and reset | 1440 px, dark | Reset after a valid result and attempt an empty submit. | Headroom restores to 20%; result clears; app chooser receives focus; recovery is obvious. |
| Clean route | 1440 px, dark | Open the exact unpublished URL and wait for hydration. | HTTP 404 and no route discoverability; clean URL does not mutate in browser history. |

## Test data and mocks

- Curated catalogue fixtures include `vaultwarden` with RAM 256-512 MiB and storage 1-2 GB, `immich` with RAM 2048-6144 MiB and storage null, and `unknown-app` with both resources null.
- Every reviewed fixture includes `kind`, `confidence`, `basis`, one or more source URLs, a note, and a checked date. A user-supplied custom row has no reviewed source URL and is labelled separately.
- Include a published self-hostable app, a published app with null resource data, an unpublished app that must not cross the server boundary, an invalid negative estimate, and an extra unknown field.
- Malicious text fixture: `<img src=x onerror=alert(1)> "quoted"\nlong-name` with 200 characters after normalization.
- Numeric fixtures include decimal precision, leading zeroes, comma separators, exponent notation, signs, whitespace, maximum values, and just-outside values.
- Use a deterministic server fixture and fixed checked dates. No live external request is needed after route render. Do not include real secrets, email addresses, private hostnames, or Docker socket paths.
- Mock catalogue failure as a server exception and malformed row as a typed validation failure. Do not mock malformed data into a successful zero value.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] Every `UI-` requirement covers hierarchy, distinct result purpose, truthful geometry, removal guards, and responsive behavior where applicable.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- None. CPU totals, workload-specific controls, sharing, provider matching, and live host inspection are deferred by the ready product and interface contracts.
