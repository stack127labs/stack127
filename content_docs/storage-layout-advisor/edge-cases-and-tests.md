# Edge cases and tests: Storage Layout Advisor

Status: ready
Tool: Storage Layout Advisor
Route: `/storage-layout-advisor`
Depends on: `competitive-report.md`, `implementation-report.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:13670c65262a5103590b065cbdf921b0322549cfda360870a9c3b252450b71b0`
Input fingerprint: `implementation-report.md sha256:3314e14ce0fa81c0a1624e5e406ae101983312e2205ec18d98b84fd57f251d3c`
Input fingerprint: `brief.md sha256:694ab3a3f44d47ec6e047c59962be38abd70dd32cca7189d8d6a4bb9c3fc0843`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | Wrong capacity, protection claim, state restoration, privacy behavior, or inaccessible comparison job. |
| P1 | Common editing, filtering, sharing, responsive, SSR, or recovery flow fails. |
| P2 | Uncommon resilience, long-input, visual polish, or performance regression. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Clean route has two 4 TB drives, default choices, and no result. | EC-001, FT-001, BR-001 |
| R2 | Add, edit, remove, and inspect drive rows without accidental comparison. | EC-002, EC-003, BR-002 |
| R3 | Decimal and binary inputs normalize to exact bytes and display in both units. | FF-001, EC-004, UT-001 |
| R4 | Mixed-size raw, usable, redundancy, and mismatch values reconcile exactly. | FF-002, FF-003, EC-005, UT-002 |
| R5 | Platform selection removes unsupported candidate families. | FF-004, EC-006, BR-004 |
| R6 | Workload changes only the named fit rubric, not capacity or tolerance. | FF-005, EC-007, UT-003 |
| R7 | Protection target filters candidates below guaranteed tolerance. | FF-006, EC-008, BR-005 |
| R8 | Valid submission shows a top fit, every eligible alternative, and exact values. | EC-009, BR-006 |
| R9 | Result includes topology and grouping-dependent failure boundary. | FF-003, EC-010, BR-007 |
| R10 | Invalid input clears stale values, associates errors, and focuses recovery. | EC-011, BR-008 |
| R11 | No eligible state has guidance and no plausible recommendation values. | EC-012, BR-009 |
| R12 | Explicit share uses safe versioned URL state and recalculates on restore. | EC-013, EC-014, UT-004, BR-010 |
| R13 | Reset returns to clean defaults and base URL. | EC-015, BR-011 |
| R14 | Important surrounding content is server-rendered and client island is operational UI. | EC-016, ST-001 |
| R15 | 320, 375, 760, and desktop views have no clipping or page overflow. | EC-017, MV-001 |
| R16 | Dark and light themes retain contrast and semantic meaning. | EC-018, MV-002 |
| R17 | Ownership is unpublished with no route-owned SEO metadata or shared registry edits. | EC-016, ST-002, ST-003 |
| R18 | Focused tests and final quality gates are ordered and disclose unrelated failures. | EC-019, QG-001 |

## Coverage checklist

Every required family maps to deterministic cases below.

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-003, EC-004, UT-001 |
| Numeric boundaries | EC-005, EC-019, FF-001 |
| Configuration dependencies | EC-006, EC-007, EC-008, FF-004, FF-006 |
| Technical truth | EC-005, EC-010, FF-002, FF-003, FF-005 |
| Submission and concurrency | EC-002, EC-009, EC-011, EC-019, BR-002, BR-006 |
| Network and upstream | EC-013, ST-004 |
| Persistence and sharing | EC-013, EC-014, EC-015, UT-004, BR-010, BR-011 |
| Accessibility | EC-011, EC-017, BR-002, BR-008, MV-001 |
| Responsive and themes | EC-017, EC-018, MV-001, MV-002 |
| Security and privacy | EC-013, EC-014, ST-004 |
| SSR and SEO | EC-016, ST-001, ST-002, ST-003 |
| Performance | EC-019, QG-001 |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Clean state | Open the base route with no query. | State is two `4 TB` data rows, platform `any`, workload `general`, target `1`, and result is null. | Labels and first capacity input are visible; no recommendation is announced. | No request, storage write, cookie, analytics event, or URL mutation. | Browser, `tests/pages/storage-layout-advisor/storage-layout-advisor.spec.ts` | R1 |
| EC-002 | P1 | Row editing | Add a drive, edit its value and unit, remove it, then add again. | Row count and normalized input update atomically; no comparison runs until explicit submit. | New row receives focus; remove never removes a different row; result is cleared after any edit. | No URL mutation before share. | Browser, `storage-layout-advisor.spec.ts` | R2 |
| EC-003 | P0 | Input grammar | Try blank, whitespace, letters, comma grouping, `1e3`, `-1`, `0`, a fractional byte, and an unsupported unit. | Each invalid row has an error; valid rows remain intact; engine returns no values. `0` and negative are rejected even though shared byte parsing permits a non-negative zero. | `aria-invalid` and `aria-describedby` identify the row; first invalid capacity receives focus after submit; no stale result remains. | No network or persistence. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R3, R10 |
| EC-004 | P0 | Exact units | Enter `1.5 TB`, `1.5 TiB`, `0.000000001 GB`, and a value that cannot represent whole bytes. | Exact byte values are represented as `bigint`; the fractional-byte case is invalid; changing output unit changes labels only. | Values round only for display, not for later calculation. | No floating-point result storage. | Unit, `storage-layout-advisor.test.mjs` | R3 |
| EC-005 | P0 | Mixed accounting | Use `4 TB`, `8 TB`, `8 TB`, `4 TB` in entered order. | Every candidate satisfies `raw = usable + redundancy + mismatch`; striped mirrors pair adjacent rows and expose mismatch; no term is negative. | Table and accounting bar agree; mismatch is named, not hidden as generic waste. | None. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R4 |
| EC-006 | P0 | Platform filter | Run the same four-drive inventory as `any`, `linux-md`, `openzfs`, and `nas-raid`. | Candidate IDs are stable; OpenZFS may expose RAIDZ3 only when width permits; Linux md and NAS RAID do not expose RAIDZ-only families. | Platform names are implementation labels and unsupported rows disappear before ranking. | No live platform probe. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R5 |
| EC-007 | P0 | Workload rubric | Calculate one valid inventory for `general`, `bulk`, and `vm-db`. | Raw bytes, usable bytes, mismatch, tolerance, eligible set, and topology are byte-for-byte identical; only documented fit score/order/reason may change. | Result says fit is a rubric, not speed, IOPS, or safety evidence. | None. | Unit, `storage-layout-advisor.test.mjs` | R6 |
| EC-008 | P0 | Protection filter | Use four equal drives and targets `0`, `1`, `2`, and `3`; repeat with a two-drive inventory. | Target `1` excludes stripe; target `2` excludes stripe, mirror, and single parity; target `3` has no eligible four-drive candidate; two drives cannot satisfy target `2`. | No ineligible candidate is presented as a fallback; target control and recovery text remain clear. | None. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R7, R11 |
| EC-009 | P1 | Atomic submit | Start with a clean state, set a valid four-drive inventory, submit by click, then repeat with Enter on the form. | Exactly one calculation per action, one top fit and all eligible alternatives render, and no duplicate result sections are created. | Result heading receives focus and one concise live announcement is made. | No URL mutation. | Browser, `storage-layout-advisor.spec.ts` | R8 |
| EC-010 | P0 | Topology | Choose striped mirrors with `4, 4, 8, 8 TB` and inspect the result. | Pair IDs are `1-2` and `3-4` in entered order; grouping condition says one member per pair can fail, but both members of one pair cannot. | Topology is semantic and readable without color; labels show each drive and group. | None. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R9 |
| EC-011 | P0 | Stale result recovery | Produce a valid result, then replace one capacity with `-1` and submit. | Existing values and recommendation are cleared immediately on edit and remain null after invalid submit. | Error is adjacent to the field, first corrective control is focused, and live region does not announce the old result. | No URL mutation or persistence. | Browser, `storage-layout-advisor.spec.ts` | R10 |
| EC-012 | P1 | No eligible layout | Use one drive with target `1`, or four drives with target `3` on `linux-md`. | Result status is no-eligible with values null; engine returns a recovery issue naming add drives or lower target. | The page does not show a capacity number or “best” label; recovery action is plain language. | None. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R11 |
| EC-013 | P0 | Explicit sharing | Submit a valid inventory, click `Share layout`, then inspect URL and clipboard. | Query gains only a safe `state` value after explicit action; decoded payload contains normalized inputs and versions, not result values; no unsafe key can be revived. | Share success/failure is announced; visible URL can be copied; calculation stays local. | One URL mutation and clipboard write only after action. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R12 |
| EC-014 | P0 | Restore attack surface | Load malformed, wrong-calculator, oversized, unsupported-schema, reserved-key, and cyclic-equivalent encoded states. | Decoder rejects safely and route falls back to clean defaults; no exception reaches the page; no partial result is rendered. | Restoration failure is announced once, with a clean form and no scary stack text. | No fetch, storage API, cookie, or analytics. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R12 |
| EC-015 | P1 | Reset/history | Share a result, click reset, then use browser back and reload the clean route. | Reset removes `state`, restores defaults, clears result, and does not leave a stale shared URL; history is not polluted by ordinary edits. | First drive field receives focus and defaults are visibly restored. | One deliberate URL replacement on reset. | Browser, `storage-layout-advisor.spec.ts` | R13 |
| EC-016 | P1 | SSR and route policy | Inspect the server response and rendered HTML without JavaScript, then inspect ownership files. | H1, short intro, tool heading/labels, model boundary, and supporting guide prose are present in HTML; result is client-dependent and not falsely precomputed; manifest remains unpublished and no route-owned metadata or shared registry edit exists. | A crawler can understand purpose, inputs, and limitations before hydration; publication stays controlled by the parent task. | No client-only text required for key explanations; no database mutation. | Static plus route response, `storage-layout-advisor.test.mjs`, `page.test.mjs` | R14, R17 |
| EC-017 | P1 | Responsive layout | Run clean and result states at `320×900`, `375×900`, `760×900`, and `1280×900`. | `documentElement.scrollWidth - clientWidth <= 1`; result table becomes readable stacked rows or contained scroll; controls and values stay within viewport. | All controls remain usable with 44 px targets; no clipped topology or hidden labels. | None. | Browser/manual, `storage-layout-advisor.spec.ts` | R15 |
| EC-018 | P1 | Theme semantics | Run result state in dark and light themes and inspect text, borders, focus, bar labels, and topology. | Contrast and focus remain visible; meaning is carried by text/labels, not color; accent use stays within design tokens. | No color-only failure cue; no horizontal shift when theme changes. | Theme attribute/class only. | Browser/manual, `storage-layout-advisor.spec.ts` | R16 |
| EC-019 | P2 | Limits and budget | Calculate 64 positive rows at the maximum shared capacity; try 65 rows, long numeric strings, repeated submit, and rapid add/remove. | 64-row valid calculation completes within the agreed focused-test budget; 65 rows and oversized state are rejected; no UI freeze or duplicate results. | Limit errors are recoverable and no stale result survives; repeated actions remain deterministic. | No network or storage. | Unit plus Browser, `storage-layout-advisor.test.mjs`, `storage-layout-advisor.spec.ts` | R18 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | Two drives: `1.5 TB`, `1.5 TiB`; parse each with exact unit multipliers. | `1.5 TB = 1,500,000,000,000` bytes; `1.5 TiB = 1,649,267,441,664` bytes. `0.000000001 GB = 1` byte; exponent notation is invalid. | Hand derivation from `lib/storage/bytes.ts`; [OpenZFS bits and bytes](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Bits%20or%20Bytes.html). | No floating-point arithmetic; unit switch preserves byte values. |
| FF-002 | Four equal `4 TB` drives; candidates stripe, striped mirror, single, dual; target `1`. | Raw `16 TB`; stripe usable `16 TB`, redundancy `0`, mismatch `0`; striped mirror usable `8 TB`, redundancy `8 TB`; single parity usable `12 TB`, redundancy `4 TB`; dual parity usable `8 TB`, redundancy `8 TB`. | Hand application of product equations; [Linux MD RAID documentation](https://docs.kernel.org/admin-guide/md.html). | Each candidate reconciles raw exactly; tolerance is `0/1/1/2` respectively. |
| FF-003 | `4, 8, 8, 4 TB` in entered order; striped mirrors. | Pair minima `4 TB` and `4 TB`; usable `8 TB`, redundancy `8 TB`, mismatch `8 TB`, raw `24 TB`; topology pairs rows `(1,2)` and `(3,4)`. | Hand application of adjacent-pair contract; [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html). | Reordering to `4,4,8,8` changes mismatch to `0`; no silent sorting. |
| FF-004 | Four equal `4 TB` drives, platform variants. | `openzfs` exposes stripe, mirror/striped mirrors, RAIDZ1/2; RAIDZ3 absent below five drives. `linux-md` exposes common MD families, `nas-raid` exposes common RAID families, and no platform emits unsupported RAIDZ labels. | Platform matrix in implementation report; [OpenZFS RAIDZ](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html). | Filtering occurs before scoring; labels do not alter formula bytes. |
| FF-005 | Same valid inventory and platform with workloads `general`, `bulk`, `vm-db`. | `usable`, `redundancy`, `mismatch`, `tolerance`, topology, and eligible IDs are identical; only `fitScore`, rank, and reason may differ according to named rubric. | Product contract; no performance source is used as an oracle. | Workload cannot create an ineligible layout or claim IOPS/throughput. |
| FF-006 | Six equal `4 TB` drives with target `3`; repeat with four drives. | Six-drive `any/openzfs` may include triple parity with usable `12 TB`, redundancy `12 TB`, mismatch `0`, tolerance `3`; four-drive target `3` returns no eligible layout. | Hand application of `(N-P)×S`; [OpenZFS RAIDZ](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html). | `R = usable + redundancy + mismatch`; candidate minimum widths are enforced. |

## Test plan

### Pure engine and unit tests

- `tests/pages/storage-layout-advisor/storage-layout-advisor.test.mjs`: import the route-local engine with Node's TypeScript strip mode; cover FF-001 through FF-006, every invalid grammar branch, 1/2/3/4/5/64/65-drive thresholds, maximum capacity, mismatch reconciliation, platform filtering, workload invariance, target filtering, no-eligible state, safe state round-trip, and state rejection.
- Keep engine oracles in the test file as `bigint` literals and compare every candidate's accounting identity, not only the top result. Include a 64-row timing sample and assert no result contains a `number` where an exact byte is required.

### API or route tests

- No external API exists for this local calculator. `tests/pages/storage-layout-advisor/page.test.mjs` is the route boundary test: assert the route source imports only route-local UI/engine/docs and read-only shared storage helpers, has no metadata/registry edits, and keeps all important guide text outside the client island.
- `scripts/storage-tools/preview-local-pages.mjs` must be unit-inspected for managed-development allowlisting and `--remove`; do not connect to production or an unknown database in tests.

### Browser tests

- `tests/pages/storage-layout-advisor/storage-layout-advisor.spec.ts`: use the guarded local preview only when `STACK127_TEST_DATABASE_ENV=.env.local`; otherwise the route test is skipped with an explicit environment reason. Cover EC-001, EC-002, EC-006 through EC-019, pointer and Enter submits, focus, live region, clipboard, reload, reset, themes, and all four widths.
- Each submit assertion must prove result atomicity: stale result absent during invalid editing, one result heading after valid submit, and no second history entry for ordinary input edits.
- The independent QA pass must operate a valid mixed-size scenario at 1280 px, then repeat at 760/375/320 px and dark/light themes using standalone Playwright CLI if the in-app Browser is unavailable.

### Static and SEO tests

- `tests/pages/storage-layout-advisor/storage-layout-advisor.test.mjs` and `page.test.mjs`: assert server-rendered h1/intro/guide strings, `data` labels, no `dangerouslySetInnerHTML`, no fetch/XHR/WebSocket, no local/session storage, no route metadata, and no publication registry/shared sidebar changes.
- `tests/stack127/seo.spec.ts` and the flat-route policy must see the manifest as `state: unpublished`; production-style route checks must remain noindex/404 according to the existing policy until the parent integrates publication.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Clean editor | 1280×900, dark | Read first task and inspect controls. | Two 4 TB rows, defaults, labels, and no result are visually obvious; no decorative dashboard fragments. |
| Mixed result | 1280×900, dark | Use `4, 8, 8, 4 TB`, target 1, compare. | Top fit, alternatives, exact accounting, mismatch, topology, and fit rubric agree. |
| Mixed result | 760×900, dark | Inspect table and topology. | No page overflow; table remains readable and group conditions are visible. |
| Invalid edit | 375×900, light | Change a valid row to `-1` and submit by Enter. | Old result disappears, field error is adjacent, focus is corrective, and controls stay 44 px. |
| Shared restore | 320×900, light | Share, open URL in a new page, then reset. | State restores without network; URL is only added by Share; reset returns clean base route. |
| No eligible | 1280×900, dark | Four drives, target 3 on Linux md. | No capacity or best label; recovery guidance says what input change would help. |

## Test data and mocks

- Use deterministic exact-byte fixtures: `1 TB`, `1.5 TB`, `1.5 TiB`, `4 TB`, `8 TB`, `18 TB`, `0.000000001 GB`, and `MAX_DRIVE_CAPACITY_BYTES` from the shared storage types. Use only `bigint` for expected calculations.
- Use row IDs `drive-1` through `drive-64`; preserve input order. Include repeated values, alternating mixed values, a 64-row maximum, and a 65-row rejection.
- Malicious state fixtures include an invalid base64url string, valid JSON with the wrong schema, wrong calculator ID, `__proto__`, `constructor`, `$stack127BigInt` in user payload, a huge encoded payload, and a state with result-like keys. Never evaluate or inject fixture strings.
- Browser tests grant clipboard permissions only for the explicit share case. Mock no calculation API because the product contract requires no upstream request. Capture `page.on("request")` and fail if a calculation or navigation triggers a non-document network request.
- Use the current date only for source metadata in docs; formula tests have no clock, randomness, or external data dependency.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.
- [x] Every R1-R18 acceptance criterion is traced to at least one case or quality gate.

## Open questions and blockers

- The in-app Browser backend is unavailable in this environment and default Chromium sandbox launch is blocked. Independent visual QA is planned with repository-local Playwright CLI 1.60.0 and an escalated read-only Chromium launch when a guarded local preview is available.
- No local database preview has been confirmed yet; the route must remain unpublished and no production database may be used. If `.env.local` does not resolve to a loopback database, Browser tests remain skipped and the exact environment blocker must be reported at handoff.
