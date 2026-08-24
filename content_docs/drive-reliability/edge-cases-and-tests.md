# Drive Reliability Explorer: edge cases and tests

Status: ready
Tool: Drive Reliability Explorer
Route: /drive-reliability
Contract type: resolution
Researched: 2026-08-23
Input fingerprint: `competitive-report.md sha256:7175170108b3bd1afd11a7e376876b1bcf4ed811524405d07dd80da5e69bb954`
Input fingerprint: `implementation-report.md sha256:b44a2bb4e76319610e60c5524205189ae7b10dd1d99dfce6685a6fb1dd24d4b3`
Input fingerprint: `brief.md sha256:411c8ceaffbc5ee5440a3a8abec8d06931a7a4b20df2d09c6b879cb3555e45e1`

## Risk model

The largest risk is presenting a precise-looking AFR for the wrong cohort. Every test therefore treats period, normalized model, source inclusion rule, exposure, and failures as one resolution contract. A failure in period selection, model normalization, threshold handling, or formula parity is release-blocking. A failure in responsive behavior, restored share state, or announcement timing is P1 because it can make a correct answer unusable. Cosmetic drift is P2 unless it hides evidence strength or changes the selected result.

| Risk | Impact | Priority | Control | Evidence |
| --- | --- | --- | --- | --- |
| A model is matched across the wrong period | Wrong reliability conclusion | P0 | Exact period and normalized model fixture tests | RF-001, RF-004, EC-004 |
| AFR uses drive count or calendar days instead of drive days | Numerically false result | P0 | Pure-engine formula and chart/table parity tests | RF-001, RF-002, EC-009 |
| A tiny cohort is presented as comparable evidence | Overconfident buying decision | P0 | Source threshold metadata, default hiding, opt-in warning | RF-003, EC-008, EC-012 |
| Share state changes the query or injects markup | Misleading or unsafe restored state | P0 | Versioned allow-list parser and hostile URL tests | EC-017, EC-018 |
| Stale bundled data looks current | Misplaced trust | P1 | Snapshot freshness label and source link checks | EC-015, EC-016 |
| Mobile users cannot inspect repeated evidence | Tool fails at its primary job | P1 | 375px Browser checks and table overflow assertions | EC-021, EC-022 |
| SSR output omits useful content or exposes an unpublished route | Search and publication regression | P0 | Static route and sitemap checks | EC-024, EC-025 |
| Local-only snapshot refresh corrupts a valid dataset | Tool cannot build or becomes empty | P1 | Schema, atomic-write, and fixture validation | EC-026, EC-027 |

## Requirement traceability

| Requirement | Test coverage | Exit evidence |
| --- | --- | --- |
| R1 | EC-001, EC-002, EC-003, EC-004, EC-005 | Period, search, manufacturer, capacity, and small-cohort controls resolve deterministically |
| R2 | EC-006, EC-007, EC-008 | Snapshot metadata and inclusion rules are visible and source-linked |
| R3 | EC-009, EC-010, EC-011 | AFR and approximate evidence range are calculated from the specified exposure contract |
| R4 | EC-012, EC-013 | Small cohort policy is visible, reversible, and never silently mixed with normal cohorts |
| R5 | EC-014, EC-015 | Source period and checked date communicate freshness without fake precision |
| R6 | EC-016, EC-017 | Share state is versioned, bounded, and restored without changing the source contract |
| R7 | EC-018 | Invalid, unsupported, and hostile state is rejected safely |
| R8 | EC-019, EC-020 | Result cards and comparison selection remain bounded at three models |
| R9 | EC-021, EC-022 | Chart and table show the same selected records and survive narrow viewports |
| R10 | EC-023 | Reset clears filters, selection, and URL state to the documented default |
| R11 | EC-024, EC-025 | Server-rendered route content is useful and unpublished route behavior stays correct |
| R12 | EC-026, EC-027 | Bundled snapshot has a versioned schema and refresh validation |
| R13 | EC-028 | Keyboard and screen-reader operation exposes controls, result changes, and errors |
| R14 | EC-029 | Dark and light themes retain contrast, focus, and meaning |
| R15 | EC-030 | No user-entered model string becomes executable markup or an unbounded request |
| R16 | EC-031 | The route remains local-first and does not call a network service during interaction |
| R17 | EC-032 | Pure engine and Browser checks stay within the agreed performance budget |

## Coverage checklist

| Family | Covered cases and rationale |
| --- | --- |
| Input grammar | EC-001, EC-002, EC-003, EC-004, EC-005, EC-018 cover empty, Unicode, punctuation, whitespace, unknown, and encoded inputs. |
| Numeric boundaries | EC-006, EC-007, EC-008, EC-009, EC-010, EC-011, EC-012 cover zero failures, one failure, zero exposure, large exposure, rounding, and threshold boundaries. |
| Configuration dependencies | EC-003, EC-004, EC-005, EC-012, EC-013 cover period, manufacturer, capacity, and small-cohort configuration order. |
| Technical truth | EC-006, EC-007, EC-008, EC-009, EC-010, EC-011, EC-014 cover source fields, inclusion rules, AFR formula, and evidence range. |
| Submission and concurrency | EC-019, EC-020, EC-023 cover selection limits, rapid filter changes, and reset. |
| Network and upstream | EC-015, EC-016, EC-026, EC-027 cover stale source metadata, no-network operation, and refresh validation. |
| Persistence and sharing | EC-016, EC-017, EC-018, EC-023 cover versioned query state, malformed state, and reset. |
| Accessibility | EC-019, EC-020, EC-023, EC-028 cover labels, focus, result announcements, and keyboard-only recovery. |
| Responsive and themes | EC-021, EC-022, EC-029 cover 375px layout, table inspection, contrast, and focus appearance. |
| Security and privacy | EC-017, EC-018, EC-030, EC-031 cover query allow-lists, text escaping, no arbitrary URL fetch, and no entered-value logging. |
| SSR and SEO | EC-024, EC-025 cover useful server output, no route metadata duplication, 404 publication behavior, and sitemap exclusion. |
| Performance | EC-020, EC-026, EC-031, EC-032 cover bounded local filtering, bundled-data parsing, no network interaction, and initial rendering. |

## Edge-case matrix

| ID | Priority | Category | Setup or input | Exact expected outcome | UX, visibility, recovery, and focus | Side effects | Test level and file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Input grammar | Open the default route with no query or filters | Quarterly period is selected; no model is selected; results explain how to choose a model | The period control is visibly labelled and focusable; no error is shown | URL remains either empty or the canonical versioned default | Browser `drive-reliability.spec.ts` | R1 |
| EC-002 | P1 | Input grammar | Search with leading, trailing, and repeated spaces around a valid model token | Search is trimmed and matches the normalized model; displayed model name keeps source spelling | Search value remains stable; reset is available | No network request or mutation | Engine and Browser `drive-reliability.test.mjs`, `drive-reliability.spec.ts` | R1 |
| EC-003 | P0 | Resolution | Select annual, then lifetime, then quarterly | Each period resolves only records from that period and updates source period text | Result region announces the new period; focus stays on the period control | No stale selected record survives if absent in the new period | Engine and Browser | R1 |
| EC-004 | P0 | Resolution | Search a model with punctuation, hyphen, casing, and Unicode normalization variants | All supported variants resolve the same normalized model ID; an unknown variant gives a no-data state | No-data state gives a clear search/reset path and does not retain old AFR | No external lookup | Engine unit | R1 |
| EC-005 | P1 | Configuration | Choose a manufacturer and capacity interval that has zero matching records | Result area says no records match the current filters and preserves the filter values | Focus remains on the changed filter; reset clears the combination | No selected model is fabricated | Browser | R1 |
| EC-006 | P0 | Technical truth | Resolve the official aggregate Q1 2026 fixture: 30,203,180 drive days and 1,030 failures | AFR is `1,030 / (30,203,180 / 365) * 100`, displayed to two decimals as `1.24%`; raw exposure and failures remain visible | Formula explanation is available near the result; no probability wording is used | Same source row feeds chart and table | Engine fixture RF-001 | R2, R3 |
| EC-007 | P0 | Technical truth | Resolve annual 2025 fixture: 115,638,676 drive days and 4,317 failures | AFR is computed from annual drive days, displayed to two decimals as `1.36%`, with annual source period | Source label distinguishes annual from quarterly; old quarterly value is not shown | No client-side recalculation drift | Engine fixture RF-002 | R2, R3 |
| EC-008 | P0 | Evidence boundary | Resolve a valid record with one failure and a cohort below the source comparison threshold | Record is hidden by default or marked limited evidence per the implementation contract; no normal ranking claim is made | Warning is adjacent to result and names the source threshold; opt-in is reversible | No row is silently promoted into normal results | Engine fixture RF-003 and Browser | R2, R4 |
| EC-009 | P0 | Numeric boundary | Use a row with zero failures and positive drive days | AFR is exactly `0.00%`; approximate evidence range is non-negative and does not display a negative lower bound | Result explains zero observed failures is not a guarantee of zero future failures | No divide-by-zero path | Engine unit | R3 |
| EC-010 | P0 | Numeric boundary | Use positive failures and positive drive days with a fractional AFR | Internal result preserves enough precision for comparison; display rounds only at the presentation boundary | Chart label and table value use the same rounded display value | No sorting based on rounded text | Engine unit and Browser | R3, R9 |
| EC-011 | P0 | Numeric boundary | Supply zero, negative, non-integer, missing, or non-finite drive days/failures to the engine | Fixture is rejected as invalid data; UI shows unavailable evidence rather than a number | Error is visible and recoverable through reset; no exception reaches the page | Invalid rows cannot enter ranking or chart | Engine unit | R3, R12 |
| EC-012 | P0 | Evidence boundary | Toggle “show small cohorts” on and off around the exact source inclusion thresholds | Rows at or above the threshold are normal; rows below are excluded unless the opt-in is active and visibly labelled | Toggle label and warning are adjacent; changing it preserves period and search | Selected rows are removed if they become hidden | Engine and Browser | R4 |
| EC-013 | P1 | Configuration | Switch period while small-cohort display is enabled | Small-cohort policy remains explicit, but thresholds come from the selected period’s source rule | Warning text updates to the selected period; no stale rule remains | Filter state is retained only where valid | Engine and Browser | R4 |
| EC-014 | P1 | Freshness | Load a snapshot whose checked date is older than the configured freshness window | Page labels the data as stale and links to the source; it does not invent a newer date | Stale notice is calm, visible, and not a fake precision banner; retry is not offered because data is bundled | No background request starts | Static fixture and Browser | R5 |
| EC-015 | P1 | Freshness | Load the current bundled snapshot with source URL and source period metadata | Source name, period, snapshot version, and checked date are present and internally consistent | Source link is keyboard reachable and opens safely | No analytics payload contains entered search text | Static and Browser | R5 |
| EC-016 | P0 | Persistence | Create a share state with period, filters, and three selected model IDs | URL state round-trips to the same visible result and selection, with input version `drive-reliability-input-v1` | Restored state is announced once; focus moves to the explorer heading or first invalid control | No unsupported fields are persisted | Engine and Browser | R6 |
| EC-017 | P0 | Security | Load a share URL with unknown keys, oversized values, duplicate IDs, or more than three selected IDs | Unknown fields are ignored; invalid values are dropped; selection is capped at three; no request is made | UI shows the safe resolved state, optionally with a concise “some filters were not restored” message | No raw URL is rendered as HTML | Engine and Browser | R7, R15 |
| EC-018 | P0 | Security | Search and share state contain `<script>`, quotes, percent-encoded markup, and a `javascript:`-like string | Values render as text or are rejected; no element, handler, navigation, or network call is created from them | Error/no-data state remains usable and reset is focusable | No arbitrary source URL replaces the fixed source link | Engine, static scan, and Browser | R7, R15 |
| EC-019 | P1 | Interaction | Select one, two, then three valid model rows; attempt a fourth | First three selections remain; fourth action is disabled or gives an inline limit message | Limit is exposed in text and announced; focus stays on attempted control | Chart/table selection remains identical | Engine and Browser | R8, R9, R13 |
| EC-020 | P1 | Interaction | Rapidly change search and manufacturer filters while results update | Final state reflects the last input only; no intermediate result overwrites it | Busy state, if used, is announced; otherwise filtering remains synchronous and focus stable | No race, duplicate listener, or unbounded render loop | Browser and performance trace | R8, R17 |
| EC-021 | P1 | Responsive | Inspect default, filtered, and selected-result states at 375px width | Controls stack, result cards remain readable, and evidence table is horizontally inspectable without clipping the document | Table has an explicit overflow affordance; no control is off-screen | No horizontal document overflow outside the intentional table region | Playwright at 375px | R9, R14 |
| EC-022 | P1 | Responsive | Compare chart and table after selecting three models at 375px and 1280px | Same models, order, AFR, and evidence fields appear in both media; chart never becomes the sole evidence surface | Table remains the accessible source of repeated facts; tooltip is not required | No breakpoint changes the selection | Playwright at both viewports | R9 |
| EC-023 | P1 | Persistence | Press Reset after a shared, filtered, selected state | Period returns to default, filters clear, selection clears, and URL state is removed or canonicalized | Focus returns to the first meaningful control and result announcement describes reset | No browser reload or network call is required | Browser | R10, R13 |
| EC-024 | P0 | SSR and SEO | Inspect server-rendered HTML for the route source and the unpublished runtime path | Heading, purpose, controls’ labels, source note, and supporting explanation are present in SSR; runtime publication behavior remains controlled by the central registry | No client-only empty shell is shipped; no route-local metadata or JSON-LD is added | No publication registry or sitemap file is changed | Static source and route check | R11 |
| EC-025 | P0 | SSR and SEO | Request `/drive-reliability` while its exact slug is not in `public.stack127_pages` and inspect `/sitemap.xml` | Route is not publicly published and exact slug is absent from sitemap; route-owned code remains inspectable | No misleading 200/public result is asserted in the route manifest | No shared registry edit is made | Static and SEO test | R11 |
| EC-026 | P1 | Dataset | Parse the bundled JSON snapshot with the documented schema and version | Schema version, dataset version, source URL, periods, inclusion rules, and rows validate; malformed JSON fails clearly | Build/test output identifies the broken field; no silent empty dataset | No partial overwrite of a valid file | Engine and script test | R12, R17 |
| EC-027 | P1 | Refresh script | Feed refresh script a source-shaped fixture with duplicate IDs, missing fields, and a changed source schema | Script rejects or reports each invalid condition and never replaces the snapshot with partial data | Operator receives actionable error text; existing snapshot is left intact | Write is atomic and route-local | Script test | R12 |
| EC-028 | P1 | Accessibility | Navigate with keyboard only through period, filters, cohort toggle, rows, selection, reset, and source link | All interactive elements have labels, logical order, visible focus, and no keyboard trap; result changes use a polite live region | Focus is retained or intentionally moved as specified; errors are associated with controls | No mouse-only action is required | Playwright accessibility assertions | R13 |
| EC-029 | P1 | Themes | Render light and dark themes with selected results, warning, no-data, and error states | Text, borders, focus, chart marks, warning, and selected state meet the existing contrast/design tokens; meaning is not color-only | Focus remains visible in both themes; no accent misuse | Theme switch does not reset state | Playwright screenshots and computed styles | R14 |
| EC-030 | P0 | Security and privacy | Enter a long repeated search string within the input limit and inspect DOM, console, and requests | Input is bounded, escaped, and treated as data; no raw string is sent to an endpoint or inserted into markup | Validation says what limit was reached and remains recoverable | No logging/storage of the full entered string | Engine, Browser, and request inspection | R15, R16 |
| EC-031 | P0 | Network | Disable network after the page bundle is available, then filter and select models | All local exploration actions continue to work from the bundled snapshot; no fetch/XHR/WebSocket request is made | No offline error appears for local operations | Source link is the only deliberate external navigation and is not activated by filtering | Browser request inspection | R16 |
| EC-032 | P1 | Performance | Load the route at desktop and mobile with the full snapshot, then type a valid search | First useful UI is server-rendered; local filter interaction stays within the product budget and does not allocate one listener per row | No visible jank or delayed result state for ordinary queries | Dataset is parsed once and reused | Playwright timing and unit benchmark | R17 |

## Formula or resolution fixtures

These fixtures are contract fixtures. Aggregate rows use the published Backblaze Q1 2026 summary values recorded in the research report; model fixtures preserve the source row’s period and threshold metadata. The engine must calculate from integer failures and drive days, not trust a copied AFR display field.

| ID | Source and period | Input fixture | Expected resolution and calculation | Evidence assertion |
| --- | --- | --- | --- | --- |
| RF-001 | Backblaze Q1 2026 aggregate | `period=q1-2026`, `driveDays=30203180`, `failures=1030` | Resolve aggregate; `1030 / (30203180 / 365) * 100 = 1.244736...`; display `1.24%` | Source period is Q1 2026; drive days and failures are visible |
| RF-002 | Backblaze annual 2025 aggregate | `period=annual-2025`, `driveDays=115638676`, `failures=4317` | Resolve annual aggregate; `4317 / (115638676 / 365) * 100 = 1.362611...`; display `1.36%` | Annual source period cannot fall back to the quarterly row |
| RF-003 | Backblaze lifetime aggregate | `period=lifetime`, `driveDays=529968464`, `failures=20212` | Resolve lifetime aggregate; `20212 / (529968464 / 365) * 100 = 1.392041...`; display `1.39%` | Lifetime is clearly labelled and uses lifetime exposure |
| RF-004 | Backblaze lifetime model row | `period=lifetime`, `model=HUH728080ALE600`, `driveCount=1026`, `driveDays=3252052`, `failures=125` | Exact normalized model resolves; AFR `125 * 36500 / 3252052 = 1.402960...%`; display `1.40%` | Model, capacity, drive count, exposure, failures, threshold status, and range are present |
| RF-005 | Deterministic zero-failure boundary fixture | `period=q1-2026`, `driveCount=186`, `driveDays=16740`, `failures=0` | Resolve only if all required fields are valid; AFR `0.00%`; lower range clamps to `0` | Zero observed failures is described as limited evidence, not a guarantee |
| RF-006 | Deterministic no-match fixture | Valid period plus unknown normalized model ID | Resolve `no-data`; no AFR, range, model, or stale prior result is returned | Search/reset recovery is available and old result is cleared |

## Test plan

### Pure engine and unit tests

`tests/pages/drive-reliability/drive-reliability.test.mjs` will import the route-owned engine and assert normalization, period filtering, manufacturer/capacity filtering, source threshold handling, exact resolution, AFR calculation, interval bounds, zero-failure behavior, sorting, selection limits, invalid-row rejection, and versioned share-state parsing. RF-001 through RF-006 are table-driven fixtures. The tests must not make network calls and must run against the checked-in route-owned snapshot.

The pure suite also checks invariants: AFR is independent of drive count when exposure and failures are fixed; adding a failure cannot lower AFR for fixed exposure; interval lower bounds are never negative; a result never contains a row from another period; and chart/table view models are generated from one selected-result array.

### Browser tests

`tests/pages/drive-reliability/drive-reliability.spec.ts` will run with standalone Playwright in the homelab CLI when the in-app Browser is unavailable. It will cover default, filtered, no-data, warning, selected, restored-share, reset, error, light-theme, and dark-theme states at 1280px and 375px. It will inspect visible labels, URL state, focus, live-region text, computed overflow, request events, console errors, and the equality of chart/table model labels. It will run against a guarded local preview mechanism that does not alter publication registry, sidebar, collection, or migration files.

### Static and SEO tests

`tests/pages/drive-reliability/page.test.mjs` will verify the route-owned manifest, route file ownership, no route-local `metadata`/`generateMetadata`/robots/canonical/JSON-LD declarations, the presence of server-rendered supporting copy, and that the route remains marked unpublished. It will verify that the exact route is not added to the sitemap or shared publication registry by this worktree’s diff. Existing sitewide SEO tests remain the owner of shared sitemap behavior and are not edited.

The route-owned snapshot refresh test will validate JSON schema, source URL allow-list, period keys, numeric fields, thresholds, unique row IDs, and atomic replacement behavior. It will use temporary files under the route’s test temp directory and clean them after each test.

## Manual verification

| View or state | Check | Pass evidence |
| --- | --- | --- |
| Desktop default at 1280px | Tool UI is the primary visual; heading, controls, evidence explanation, and source note form a calm reading path | Screenshot plus visible text inspection |
| Mobile default at 375px | Controls stack, no document-level horizontal overflow, and the repeated-facts table has a clear inspection affordance | Screenshot plus scroll-width assertion |
| Selected comparison in both themes | Three selected models remain readable; chart is explanatory and table is authoritative; selected state is not color-only | Paired screenshots and keyboard pass |
| No-data and small-cohort warning | State explains why the result is absent or limited and offers a clear recovery action without a colored left rail | Screenshot plus live-region inspection |
| Restored share state | Versioned state restores only supported values, announces the result, and leaves focus in a predictable place | URL fixture plus keyboard pass |
| Unpublished route behavior | No public registry/sitemap change is present; a guarded local preview is used only for visual QA | Git diff and request check |

## Test data and mocks

The initial static dataset is route-owned and contains a small, reviewed fixture set for Q1 2026, annual 2025, and lifetime values, including normal, zero-failure, threshold, below-threshold, and no-match cases. Its records must retain source URL, source period, source checked date, inclusion rule, and dataset version. The pure tests may construct minimal records for mathematical boundaries, but every Browser result must come from the same snapshot loader used by the page.

No live API or remote data dependency is allowed in the page. Source links are fixed constants from the reviewed Backblaze source. Refresh input is a local source-shaped fixture; tests must not download or mutate production data. Browser request assertions fail if filtering, selection, sharing, or reset causes a fetch, XHR, WebSocket, or beacon.

## Plan completion criteria

- [ ] All P0 cases pass in the pure, static, and Browser suites.
- [ ] All P1 cases pass at desktop and 375px mobile widths in light and dark themes.
- [ ] RF-001 through RF-006 pass without changing expected values in the report.
- [ ] Every R1-R17 requirement has at least one passing edge case and a named test owner.
- [ ] Invalid, stale, no-data, warning, and restored states are visually inspected, not only asserted by DOM text.
- [ ] The route remains unpublished; no shared registry, hub/sidebar, collection count, migration, or other tool file changes exist.
- [ ] Final handoff records the standalone Browser backend, any in-app Browser blocker, changed files, commands, and residual risks.

## Open questions

The Backblaze source can change its quarterly schema and inclusion thresholds. The refresh script should fail closed and require a reviewed fixture update when that happens. Before final handoff, the implementation must also confirm the safest local-only preview path for visual QA without touching the central publication registry; if none is available, static source inspection and route-owned component rendering must be recorded as the residual QA boundary.
