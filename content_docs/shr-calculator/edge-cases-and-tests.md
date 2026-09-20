# Edge cases and tests: Synology SHR Capacity Calculator

Status: ready
Tool: Synology SHR Capacity Calculator
Route: `/shr-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `brief.md`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | A wrong tier result, stale credible answer, unsafe shared state, privacy leak, or inaccessible primary calculation would make the calculator untrustworthy. |
| P1 | A common edit, restore, keyboard, responsive, server-rendering, or recovery path would fail while the core formula remained correct. |
| P2 | Uncommon resilience or polish issue that does not change the answer or block the primary job. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Shared shell, visible h1, route ownership, and unpublished state are correct. | EC-038, EC-039, EC-040, EC-042 |
| R2 | Mode, individual drive rows, add/remove/edit, and separate primary action work. | EC-001, EC-011, EC-021, EC-028, EC-029, EC-032 |
| R3 | Exact unit parsing and hostile input rejection work. | EC-002, EC-003, EC-010, EC-011, EC-014, EC-035, EC-037 |
| R4 | The version 1 tier walk returns exact categories and preserves the accounting invariant. | EC-004, EC-005, EC-006, EC-007, EC-008, EC-009, EC-015, EC-016, EC-017, EC-018 |
| R5 | Result hierarchy, protection versus unused split, bar, table, and comparison are exact and visible. | EC-004, EC-005, EC-006, EC-007, EC-008, EC-009, EC-015, EC-032, EC-033 |
| R6 | Invalid state removes the result and provides a precise recovery path. | EC-001, EC-002, EC-003, EC-011, EC-012, EC-013, EC-014, EC-028 |
| R7 | Click, Enter, repeat, reset, and display-unit changes are deterministic. | EC-019, EC-020, EC-021, EC-022, EC-026, EC-031 |
| R8 | Copy and explicit share are honest, scoped, and local. | EC-023, EC-027, EC-036 |
| R9 | Valid state restores and malformed state is rejected and cleaned. | EC-014, EC-023, EC-024, EC-025, EC-026, EC-035, EC-037, EC-040 |
| R10 | Desktop and narrow layouts, themes, values, rows, and table reflow remain usable. | EC-031, EC-032, EC-033 |
| R11 | Server-rendered content and the final supporting guide answer the content contract without route metadata. | EC-038, EC-039, EC-040 |
| R12 | The maximum input is deterministic, fast, and dependency-light. | EC-010, EC-041, EC-042 |

## Coverage checklist

Every family is covered below. This calculator has no remote or upstream state, so network cases are explicitly not applicable rather than silently omitted.

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-001, EC-002, EC-003, EC-010, EC-011 |
| Numeric boundaries | EC-004, EC-005, EC-008, EC-009, EC-010, EC-011, EC-018 |
| Configuration dependencies | EC-012, EC-013, EC-014, EC-017 |
| Technical truth | EC-004, EC-005, EC-006, EC-007, EC-008, EC-009, EC-015, EC-016, EC-017, EC-018 |
| Submission and concurrency | EC-019, EC-020, EC-021, EC-022 |
| Network and upstream | Not applicable: the formula is synchronous and has no fetch, upstream source, timeout, cache, rate limit, or partial response. |
| Persistence and sharing | EC-023, EC-024, EC-025, EC-026, EC-027 |
| Accessibility | EC-028, EC-029, EC-030, EC-031 |
| Responsive and themes | EC-032, EC-033 |
| Security and privacy | EC-014, EC-023, EC-025, EC-035, EC-036, EC-037 |
| SSR and SEO | EC-038, EC-039, EC-040 |
| Performance | EC-010, EC-041, EC-042 |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Empty input | Open the clean route and attempt Calculate capacity with zero rows. | Calculate is disabled or refuses submission; no engine call and no values. | Empty editor has an obvious Add drive action; no result region or stale answer. | None. | Browser `shr-calculator.spec.ts` | R2, R6 |
| EC-002 | P0 | Input grammar | Enter whitespace, letters, commas, `1e3`, `+4`, `-1`, and `1 000` in separate capacity rows. | Parser rejects each value and returns a field-specific issue; no calculation values. | The text stays for correction, `aria-invalid` and `aria-describedby` identify the error, and the first bad field receives focus on submit. | None. | Unit and Browser `shr-capacity.test.mjs`, `shr-calculator.spec.ts` | R3, R6 |
| EC-003 | P0 | Input grammar | Enter a positive decimal that does not resolve to whole bytes for its unit, such as `0.1 GiB` if the parser rejects the fractional byte, plus unsupported unit text. | Conversion throws a structured invalid result; no rounding and no result. | Error says the value must resolve to whole bytes; other rows remain editable. | None. | Unit `shr-capacity.test.mjs` | R3, R6 |
| EC-004 | P0 | Formula minimum | SHR-1 with exactly `[4 TB, 4 TB]`. | Raw `8 TB`; data before system `4 TB`; protection `4 TB`; unused `0`; system reserve `20 GB`; estimated capacity `3.98 TB` before display rounding. | Answer says one drive fault tolerance and keeps the reserve caveat next to the number. | None. | Unit fixture FF-001 and Browser | R4, R5 |
| EC-005 | P0 | Formula minimum | SHR-2 with exactly `[4 TB, 4 TB, 4 TB, 4 TB]`. | Raw `16 TB`; data before system `8 TB`; protection `8 TB`; unused `0`; system reserve `40 GB`; estimated capacity `7.96 TB`. | Answer says two-drive fault tolerance; SHR-2 comparison is valid. | None. | Unit fixture FF-002 and Browser | R4, R5 |
| EC-006 | P0 | Mixed tier formula | SHR-1 with `[4 TB, 4 TB, 8 TB, 8 TB]`. | Raw `24 TB`; data before system `16 TB`; protection `8 TB`; unused `0`; estimated capacity `15.96 TB`. Bands are 0 to 4 TB with 4 active drives and 4 to 8 TB with 2 active drives. | Tier table makes the two protection bands visible; it does not call the protection space unused. | None. | Unit fixture FF-003 and Browser | R4, R5 |
| EC-007 | P0 | Mixed tier formula | SHR-2 with `[4 TB, 4 TB, 8 TB, 8 TB]`. | Raw `24 TB`; data before system `8 TB`; protection `8 TB`; unused `8 TB`; estimated capacity `7.96 TB`. | The result separates 8 TB unused from 8 TB protection and never hides the higher tier. | None. | Unit fixture FF-004 and Browser | R4, R5 |
| EC-008 | P0 | One-drive high tier | SHR-1 with `[4 TB, 4 TB, 4 TB, 8 TB]`. | Data before system `12 TB`; protection `4 TB`; unused `4 TB`; raw `20 TB`. The 4 TB high tier cannot form a SHR data tier. | Table says one drive reaches the high band and labels it unused, not parity. | None. | Unit fixture FF-005 | R4, R5 |
| EC-009 | P0 | Two-drive high tier | SHR-2 with `[4 TB, 4 TB, 4 TB, 8 TB]`. | Data before system `8 TB`; protection `8 TB`; unused `4 TB`; raw `20 TB`. | Result stays valid for four drives and explains why the lone 8 TB tail is unused. | None. | Unit fixture FF-006 | R4, R5 |
| EC-010 | P0 | Precision and maximum | Use capacities at the route byte limit, including `1,000,000 TB` if within the 10^24-byte contract, and calculate a 32-drive inventory. | No `Number` conversion, scientific notation, overflow, or nondeterministic rounding. Output remains finite and exact in `bigint` until display. | Result is readable with wrapped values and no crash. | CPU only. | Unit and performance `shr-capacity.test.mjs` | R3, R4, R12 |
| EC-011 | P1 | Bounds | Try zero, negative, 33 drives, empty capacity, more than 32 restored drives, and a capacity above 10^24 bytes. | Invalid inputs or add action are rejected; no partial values are returned. | Add is disabled at the limit with a count explanation; errors point to the relevant row or mode. | None. | Unit and Browser `shr-capacity.test.mjs`, `shr-calculator.spec.ts` | R2, R3, R6 |
| EC-012 | P0 | Mode dependency | Start with four valid SHR-1 drives, calculate, then select SHR-2 and remove one drive. | SHR-2 becomes invalid; selected and comparison results are cleared and no old SHR-1 answer remains. | Mode error says SHR-2 needs four drives; focus moves to the first recovery control on calculate. | None. | Browser `shr-calculator.spec.ts` | R4, R6 |
| EC-013 | P1 | Stale dependent controls | Calculate a valid four-drive result, remove a drive, change a unit, and edit a capacity without recalculating. | Result state becomes null on the first edit; a second edit cannot resurrect it. | User sees the inputs only and a quiet `Inputs changed` status, not a stale capacity. | `replaceState` may remove explicit share state. | Browser `shr-calculator.spec.ts` | R2, R6, R7 |
| EC-014 | P0 | Invalid serialized configuration | Decode a state with duplicate IDs, unknown mode, invalid capacity strings, non-object payload, or a future version. | Decoder rejects the whole envelope atomically; no row is partially restored and no engine result runs. | Clean editor plus one restore-failure status; raw payload is never rendered. | Remove `state` from URL only. | Unit and Browser `shr-capacity.test.mjs`, `shr-calculator.spec.ts` | R3, R6, R9 |
| EC-015 | P0 | Accounting invariant | Run FF-001 through FF-006 and random valid inventories. | `raw = dataBeforeSystem + protection + unused`; `estimated = max(0, dataBeforeSystem - systemReserve)`; no category is negative. | Exact table and bar agree with the headline and comparison values. | None. | Unit property tests `shr-capacity.test.mjs` | R4, R5 |
| EC-016 | P0 | Mode invariant | For every valid inventory with at least four drives, calculate both modes. | SHR-2 data capacity never exceeds SHR-1 data capacity; SHR-2 protection is not less than SHR-1 for the same band; fault tolerance is 2 versus 1. | Comparison row makes the tradeoff legible without a recommendation badge. | None. | Unit property tests and Browser | R4, R5 |
| EC-017 | P0 | Order invariant | Permute `[4 TB, 4 TB, 8 TB, 8 TB]` and `[2 TB, 3 TB, 4 TB, 4 TB, 8 TB]` across row IDs. | Calculation bytes and tier values are identical regardless of editor order. | Drive row order remains as entered, but result does not change. | None. | Unit fixture FF-007 and property tests | R4, R6 |
| EC-018 | P1 | System reserve floor | Use two 1 GB drives and calculate SHR-1. | Data before system is 1 GB, reserve is 20 GB, estimated capacity clamps to zero, and a warning is returned; no negative output. | Result explains that the planning reserve consumes the modeled data tier; it does not invent a positive answer. | None. | Unit `shr-capacity.test.mjs` and Browser | R4, R5 |
| EC-019 | P1 | Submission and repeat | Calculate by pointer, calculate again twice quickly, then submit the same form with Enter. | Each valid run returns the same immutable values; no duplicate rows, requests, history entries, or mixed result state. | Result heading is focused on the first valid submit; rapid repeat does not produce noisy duplicate announcements. | None. | Browser `shr-calculator.spec.ts` | R7 |
| EC-020 | P1 | Edit after result | Calculate `[4,4,8,8]`, then change one row to `12` and inspect the page before another submit. | Result and result-dependent status clear immediately; input remains in the editor. | No credible old capacity remains visible beside changed inputs. | Clean explicit share query if present. | Browser `shr-calculator.spec.ts` | R6, R7 |
| EC-021 | P1 | Inventory action separation | Add a blank drive, fill it, remove it, and add another row without calculating. | Add/remove only alter the inventory; Calculate remains the only action that creates values. | New row receives focus; remove does not submit; primary button stays visibly separate. | None. | Browser `shr-calculator.spec.ts` | R2, R7 |
| EC-022 | P1 | Reset recovery | Calculate a valid mixed result, click Reset calculator, then press Enter on the first mode or Add drive control. | Editor returns to empty default state, result/errors/share URL disappear, and no values remain in memory-backed rendered output. | Focus moves to the first expected recovery control and clean page is obvious. | `history.replaceState` removes query. | Browser `shr-calculator.spec.ts` | R2, R7, R9 |
| EC-023 | P0 | Explicit share privacy | Calculate a valid result on a clean base route, inspect URL and browser storage, then click Share configuration. | Calculation does not serialize state. Share creates a versioned envelope containing inputs and mode only, never formatted results or private DOM text. | Before sharing, the clean URL remains clean. After sharing, visible text says the URL contains the configuration and is not secret. | Explicit `replaceState` and clipboard attempt only. | Unit codec, Browser, and static source test | R8, R9 |
| EC-024 | P0 | Valid restore | Open a valid shared URL in a new page and reload it. | Exact normalized bytes, mode, and rows restore; result recalculates to the same bytes and version. | `Configuration restored` is polite and does not steal focus or duplicate the editor. | Read query only; no storage or network. | Unit and Browser `shr-calculator.spec.ts` | R8, R9 |
| EC-025 | P0 | Malformed restore | Use bad base64url, invalid JSON, missing fields, wrong calculator, future versions, invalid UTF-8, and truncated payloads. | Decoder rejects atomically and removes `state`; no result, row, raw decoder error, or console stack is visible. | One recovery status and a clean editor. | One `replaceState` query cleanup. | Unit and Browser | R6, R9 |
| EC-026 | P1 | History and reload | Share valid state, navigate to clean route, use back and forward, then reload the restored URL. | Browser history restores the intended URL state; clean route has no result; valid state recalculates deterministically. | No unexpected automatic new history entries during calculation or edit. | Explicit share and cleanup history operations only. | Browser `shr-calculator.spec.ts` | R7, R9 |
| EC-027 | P1 | Clipboard denial | Deny clipboard permissions and activate Copy result and Share configuration. | UI does not claim success; visible share URL remains selectable; result stays intact. | Status says copy failed or URL is ready to copy manually without an alert loop. | Clipboard attempt only. | Browser `shr-calculator.spec.ts` | R8 |
| EC-028 | P1 | Labels and errors | Use a screen-reader-like DOM inspection and submit an invalid row. | Every input has a programmatic label; error is linked by `aria-describedby`; mode and output unit groups have legends. | Focus order is mode, unit, rows, actions, then result; the first invalid target is focused. | None. | Browser accessibility assertions | R2, R6 |
| EC-029 | P1 | Keyboard-only flow | Tab through the clean form, use Enter on Add drive and Calculate, use Space on radio choices, and reach Reset and Share without a mouse. | No keyboard trap; Enter submits once; secondary buttons do not submit accidentally. | Visible focus remains within the expected control and the primary action is discoverable. | None. | Browser `shr-calculator.spec.ts` | R2, R7 |
| EC-030 | P1 | Live status | Calculate valid and invalid inputs, restore valid and invalid state, copy success/failure. | One polite status per state transition; the full result is not duplicated as live text. | Screen-reader announcements are concise and do not repeat each table cell. | None. | Browser and static DOM test | R6, R8, R9 |
| EC-031 | P1 | Theme and zoom | Render valid mixed result in dark and light themes at 200% browser zoom. | Text and controls retain contrast and order; no status meaning depends on color alone; result values remain visible. | Primary answer remains strongest and focus remains visible. | None. | Browser screenshots and measurements | R7, R10 |
| EC-032 | P1 | Narrow layout | Render clean, invalid, and valid maximum-common results at 320, 375, and 760 px in dark and light themes. | Document, page, tool, form, result, bar, and table have no page-level horizontal overflow. Drive identity, capacity, unit, and remove target stay aligned; remove is at least 44 px. | Calculate and result values are visible without horizontal table scrolling; the tool remains one workbench band. | None. | Browser layout assertions | R2, R5, R10 |
| EC-033 | P1 | Long value and table reflow | Use long valid capacities and the maximum distinct tier count, then inspect the longest labels and all result rows at 320 px. | No clipped child hidden by overflow; values wrap or reflow; tier rows become labelled blocks on narrow screens. | Every label, value, percentage, unit, and warning can be read without guessing. | None. | Browser measurements and screenshots | R5, R10 |
| EC-035 | P0 | Untrusted input rendering | Enter HTML, URL schemes, quotes, prototype keys, and shell metacharacters in capacity and state payloads. | Parser rejects unsafe values; output uses text nodes; no HTML executes, no navigation occurs, and no shell or fetch path exists. | Invalid state is clean and does not expose raw payload or stack traces. | Query cleanup only. | Unit and static source test | R3, R9 |
| EC-036 | P0 | Local privacy boundary | Instrument `fetch`, storage APIs, console capture, and any analytics hook during edit, calculate, copy, and share. | No network, local/session storage, cookies, analytics, or server action contains drive values. Only explicit share URL and clipboard may contain inputs. | Normal calculation stays local; share disclosure is visible beside Share configuration. | Explicit URL and clipboard only. | Browser instrumentation and static source test | R8 |
| EC-037 | P1 | Oversized hostile state | Decode payloads over the size limit, deeply nested arrays, huge drive counts, reserved JSON keys, duplicate IDs, and malformed byte strings. | Decoder rejects before rendering; no prototype pollution and no long blocking calculation. | Clean editor with one restore failure and no raw payload. | Query cleanup only. | Unit `shr-capacity.test.mjs` | R3, R9, R12 |
| EC-038 | P1 | Server rendering | Request the route with JavaScript disabled or inspect the server HTML before hydration. | H1, short purpose/limit content, form labels, empty-state action, and stable tool shell are in HTML. No blank client-only article shell. | Visitor can understand the job and boundary without a calculation; controls are present but not falsely interactive. | None. | Server/static test and Browser no-JS check | R1, R11 |
| EC-039 | P1 | Unpublished SEO state | Request clean `/shr-calculator`, `/shr-calculator?state=...`, and `/sitemap.xml`. | Route follows central unpublished behavior, has no public index signal, and does not appear in sitemap. Page file has no metadata/canonical/robots/JSON-LD logic. | No visible difference is required beyond the local preview and central noindex or 404 boundary. | No registry or migration write. | Static test and Playwright SEO test | R1, R11 |
| EC-040 | P1 | Hydration consistency | Compare server and hydrated clean state, valid restored state, and invalid restored state with console error capture. | No hydration mismatch, duplicate row editor, result flash, or restore error flash. | Restore status appears once and focus is not stolen during hydration. | Query cleanup for invalid state only. | Browser `shr-calculator.spec.ts` | R1, R9, R11 |
| EC-041 | P1 | Engine performance | Run 32 valid drives with distinct and repeated capacities across warm and cold samples. | Calculation is deterministic and each sample is below 10 ms on the recorded test baseline; no loading UI is needed. | Result appears synchronously without a spinner or layout jump. | CPU only. | Unit benchmark `shr-capacity.test.mjs` | R12 |
| EC-042 | P1 | Bundle and ownership policy | Inspect route client files and dependency graph after build. | No new runtime dependency, shared engine change, database client, fetch, or route-global CSS edit; route-owned files are all in the manifest. | No visible effect. | Build artifacts only. | Static source and build inspection `page.test.mjs` | R1, R12 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | `shr1`, `[4 TB, 4 TB]`, TB is 10^12 bytes | raw `8,000,000,000,000`; data `4,000,000,000,000`; protection `4,000,000,000,000`; unused `0`; reserve `20,000,000,000`; estimated `3,980,000,000,000` | Hand derivation from the version 1 tier equation and official one-drive reserve convention | Minimum SHR-1, one active band, raw reconciliation |
| FF-002 | `shr2`, `[4 TB, 4 TB, 4 TB, 4 TB]` | raw `16 TB`; data `8 TB`; protection `8 TB`; unused `0`; reserve `40 GB`; estimated `7.96 TB` | Hand derivation and official SHR-2 parity categories | Minimum SHR-2, two parity slices, equal-size invariant |
| FF-003 | `shr1`, `[4 TB, 4 TB, 8 TB, 8 TB]` | raw `24 TB`; data `16 TB`; protection `8 TB`; unused `0`; reserve `40 GB`; estimated `15.96 TB` | Hand derivation plus operated Synology result shape for 2 x 4 TB plus 2 x 8 TB | Two bands, active counts 4 and 2, no unused tail |
| FF-004 | `shr2`, `[4 TB, 4 TB, 8 TB, 8 TB]` | raw `24 TB`; data `8 TB`; protection `8 TB`; unused `8 TB`; reserve `40 GB`; estimated `7.96 TB` | Hand derivation plus operated Synology result shape | Two bands, high tier has active count equal to parity, explicit unused |
| FF-005 | `shr1`, `[4 TB, 4 TB, 4 TB, 8 TB]` | raw `20 TB`; data `12 TB`; protection `4 TB`; unused `4 TB`; reserve `40 GB`; estimated `11.96 TB` | Hand tier walk | High tier has one active drive, unused branch |
| FF-006 | `shr2`, `[4 TB, 4 TB, 4 TB, 8 TB]` | raw `20 TB`; data `8 TB`; protection `8 TB`; unused `4 TB`; reserve `40 GB`; estimated `7.96 TB` | Hand tier walk | High tier active count below parity, unused branch |
| FF-007 | `shr1`, permutations of `[2 TB, 3 TB, 4 TB, 4 TB, 8 TB]` | Same raw, data, protection, unused, reserve, and estimated capacity for every permutation | Sorting invariant and hand tier walk | Calculation order independent of editor order |
| FF-008 | `shr1`, `[4 TB, 4000 GB, 4 TiB converted to bytes, 4 TB]` | Equivalent byte values are equal only where units represent the same exact byte count; output preserves exact byte source and display unit only changes formatting | Exact unit-factor oracle | Unit normalization and display independence |
| FF-009 | `shr1`, `[1 GB, 1 GB]` | raw `2 GB`; data `1 GB`; protection `1 GB`; reserve `20 GB`; estimated `0` plus reserve warning | Hand clamp rule | No negative capacity and warning branch |
| FF-010 | 32 drives at mixed valid capacities under 10^24 bytes | Valid deterministic result, raw reconciliation, no `Number` conversion | Property generator and performance baseline | Maximum supported count and performance |

## Test plan

### Pure engine and unit tests

- `tests/pages/shr-calculator/shr-capacity.test.mjs`: start here. Cover EC-002 to EC-018, EC-023 to EC-025, EC-035, EC-037, EC-041, and FF-001 through FF-010 with exact `bigint` assertions, table-driven invalid parsing, permutation properties, mode invariants, codec size limits, and deterministic performance.
- Keep all formula code in `app/(site)/(tools)/shr-calculator/shr-capacity.ts` and import it directly from the Node tests. Do not add a shared `lib/storage` adapter for this route.
- Use a deterministic pseudo-random generator for property cases. Do not use wall-clock or external fixture data in formula tests.

### API or route tests

- Not applicable: the calculator has no API or route handler. `tests/pages/shr-calculator/page.test.mjs` owns server source, route metadata policy, ownership scope, and unpublished state checks instead.

### Browser tests

- `tests/pages/shr-calculator/shr-calculator.spec.ts`: cover EC-001, EC-011 to EC-013, EC-019 to EC-033, EC-036, EC-038 to EC-040, and valid result fixture workflows at desktop and narrow widths.
- Use the repository Playwright config and guarded local preview for the unpublished route. Exercise pointer and keyboard input, clipboard grant and denial, reload, back/forward, malformed state, real mixed result, both themes, and 320, 375, 760, and desktop widths.
- Measure `scrollWidth` and bounding boxes for document, page, tool, drive rows, primary result, allocation bar, and tier table. A clipped child inside `overflow: hidden` fails even when document scroll width is clean.

### Static and SEO tests

- `tests/pages/shr-calculator/page.test.mjs`: verify route-owned page files, no `metadata` or `generateMetadata`, no page JSON-LD, no fetch/storage/analytics/shell path, no global CSS change, no shared storage or registry writes, server-rendered h1 and labels, and the unpublished manifest reason.
- `tests/pages/shr-calculator/page.json`: route is `unpublished`, docs point only to `content_docs/shr-calculator`, tests point to route-owned files and shared SEO tests, scripts are route-local or the approved guarded preview helper, and `repositories` is empty.
- `tests/stack127/seo.spec.ts` or the route's local SEO coverage must verify clean route blocking or noindex and sitemap exclusion. It must not add a publication row or migration.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Clean empty editor | 1440 x 900, dark | Two-second scan of h1, mode, Add drive, and Calculate capacity | The job, first input, and primary action are obvious; no helper wall or nested dashboard. |
| Valid 2 x 4 TB SHR-1 | 1440 x 900, dark and light | Calculate and inspect answer, reserve, bar, comparison, and table | Headline is strongest, values match FF-001, and the fresh-pool caveat is adjacent. |
| Valid 4,4,8,8 TB SHR-2 | 1440 x 900, dark and light | Inspect protection versus unused high tier | FF-004 values agree across headline, bar, table, and comparison. |
| Invalid SHR-2 inventory | 375 x 900, dark | Remove one drive after a valid result, submit, recover with Add drive | Old result is absent, error is associated, focus moves correctly, and row targets remain usable. |
| Long tier result | 320 x 900, light | Use 32 drives with distinct capacities and inspect table, percentages, and warnings | No page or child clipping; tier rows reflow and all values remain readable. |
| Share and restore | 760 x 900, dark | Share valid state, open URL in a new context, deny clipboard, edit, reset | Only explicit share serializes inputs; restore is deterministic; failures do not claim success. |
| No JavaScript server view | 1440 x 900, dark | Disable JavaScript and inspect HTML | h1, purpose, tool labels, and boundary content are server-rendered without a blank shell. |
| Unpublished SEO boundary | Desktop and mobile | Request clean route, query route, and sitemap | Route follows central unpublished policy and never appears in sitemap. |

## Test data and mocks

- Use exact decimal byte constants, not floating-point expected values. Keep `TB`, `GB`, `TiB`, and `GiB` factors in the test file for hand-readable fixtures.
- Use FF-001 through FF-010 as stable fixtures. The operated Synology probe is evidence for the category shape, not a live test dependency.
- Mock `navigator.clipboard.writeText` to resolve and reject. Do not grant broad permissions in every test; grant only for the success case.
- Instrument `window.fetch`, `Storage.prototype.setItem`, `Storage.prototype.getItem`, `console`, and analytics globals to fail if the route sends or stores drive values.
- Generate malicious strings containing `<img src=x onerror=...>`, `javascript:`, quotes, newline, `__proto__`, `constructor`, `prototype`, and shell characters. Treat them as text and reject them before result rendering.
- Generate malformed base64url, invalid UTF-8, future versions, wrong calculator IDs, repeated keys, oversized JSON, nested arrays, duplicate IDs, and more than 32 rows.
- Freeze or clone engine inputs in tests to detect mutation. Verify calculations do not mutate editor-order arrays or caller-owned objects.
- Keep browser clocks and viewport sizes deterministic. Avoid network mocks because no network path exists.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- None. All required formula, state, privacy, accessibility, responsive, SSR, SEO, and performance decisions are locked by the implementation report.
