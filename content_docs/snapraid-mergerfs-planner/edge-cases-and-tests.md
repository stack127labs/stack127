# Edge cases and tests: SnapRAID and mergerfs Config Planner

Status: ready
Tool: SnapRAID and mergerfs Config Planner
Route: `/snapraid-mergerfs-planner`
Depends on: `competitive-report.md`, `implementation-report.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:ebc4a669be6a6c45037818725eb87f42c6c2b2184ff846cece587fb594a9fd69`
Input fingerprint: `implementation-report.md sha256:a4bd1fb3be1d86c3ebd533af9a4d8096fe8b90b7c37a9e65f5d861626c48ffa8`
Input fingerprint: `brief.md sha256:bdd7d66e7d01a59c6d886c06da0480b4c274a3b7039138704698239e6880e226`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | Could emit a materially unsafe or misleading config, put parity into the mergerfs pool, lose a required parity/content directive, or make the primary generation job inaccessible. |
| P1 | Breaks a common invalid-input, edit, copy, keyboard, responsive, privacy, or unpublished-route flow. |
| P2 | Uncommon resilience or presentation issue that does not create a plausible valid configuration. |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | Valid mixed inventory produces deterministic SnapRAID and mergerfs output. | EC-001, FF-001, FF-002 |
| R2 | Strict decimal and POSIX path parsing rejects malformed, duplicate, unsafe, and nested inputs without partial output. | EC-005, EC-007, EC-009, EC-016, EC-026, FF-004 |
| R3 | Every parity row is compared with the largest data capacity and exact totals are shown. | EC-002, EC-017, FF-001, FF-003 |
| R4 | Content paths are unique, meet parity count plus one, and do not allow a plausible result when the minimum fails. | EC-006, EC-008, FF-002 |
| R5 | Mergerfs branches contain data paths in order and never parity or content paths. | EC-003, EC-004, FF-001, FF-002 |
| R6 | Policy presets render only approved option strings. | EC-010, EC-019 |
| R7 | Inventory actions remain separate from primary generation and edits clear stale output. | EC-011, EC-012 |
| R8 | Valid results lead with review status, audit rows, and independently copyable code blocks. | EC-001, EC-014, FF-001 |
| R9 | Reset restores clean defaults and no user path is persisted in URL, storage, analytics, or network. | EC-015, EC-023 |
| R10 | Identity and supporting content are server-rendered and route-owned SEO policy is absent. | EC-022 |
| R11 | Populated results fit at required widths and themes without page overflow. | EC-021, EC-024 |
| R12 | Route remains unpublished and ownership stays route-local. | EC-022, EC-023 |

## Coverage checklist

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | EC-005, EC-009, EC-016, EC-026 |
| Numeric boundaries | EC-002, EC-006, EC-016, EC-017, EC-018, FF-003 |
| Configuration dependencies | EC-003, EC-004, EC-006, EC-007, EC-008, FF-004 |
| Technical truth | EC-001, EC-002, EC-006, EC-019, FF-001, FF-002, FF-003 |
| Submission and concurrency | EC-011, EC-012, EC-013, EC-014, EC-015 |
| Network and upstream | Not applicable: version one is a synchronous local generator with no request, upstream source, cache, timeout, or retry boundary. |
| Persistence and sharing | EC-015, EC-023. Explicit share and URL state are not supported by the product contract. |
| Accessibility | EC-013, EC-014, EC-021, EC-024 |
| Responsive and themes | EC-021, EC-024 |
| Security and privacy | EC-003, EC-004, EC-009, EC-010, EC-023 |
| SSR and SEO | EC-022, EC-023 |
| Performance | EC-018, EC-024. The pure engine is synchronous and must complete within the focused unit-test budget for the maximum inventory. |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Valid baseline | Four data rows at 8 TB, one 12 TB parity row, two content paths, `/mnt/storage`, balanced policy, 256 KiB. | Return `ready`, exact totals, two deterministic config strings, and data-only branch expression. | Review heading and audit pass rows appear before selectable code. | None except explicit clipboard if clicked. | Unit and Browser: `snapraid-merfs-engine.test.mjs`, `snapraid-mergerfs-planner.spec.ts` | R1, R8 |
| EC-002 | P0 | Parity sizing | One parity row at 7 TB while the largest data row is 8 TB. | Return `invalid` with a parity field issue; no config or fstab string. | Keep 7 TB visible, explain that the parity row is smaller than the largest data disk, and focus it on submit. | No URL, storage, or request. | Unit and Browser: engine test and page spec | R3 |
| EC-003 | P0 | Parity exclusion | Data `/mnt/disk1`, parity `/mnt/disk1/parity`, pool `/mnt/storage`. | Return `invalid` because parity is nested under a data branch. | Show the exact overlapping roots and no generated branch list. | None. | Unit: engine test | R5 |
| EC-004 | P0 | Pool recursion | Data `/mnt/disk1`, parity `/mnt/parity1`, pool `/mnt/disk1/pool`. | Return `invalid` because pool is inside a data branch. | Explain the pool/data relationship and preserve the typed path. | None. | Unit and static security test | R2, R5 |
| EC-005 | P0 | Malformed inventory | Data field contains `8, nope` or a row with `8e1`; other valid rows remain. | Reject the whole form; never drop the bad token or generate a one-disk config. | Show field-scoped error and no plausible partial summary. | None. | Unit and Browser: malformed-input fixture | R2 |
| EC-006 | P0 | Content minimum | Two parity rows but only two content paths. | Return `invalid` because at least three content copies are required. | Tell the user the required count and keep both existing paths editable. | None. | Unit and Browser | R4 |
| EC-007 | P1 | Duplicate and nested data | Data rows `/mnt/disk1` and `/mnt/disk1/films`. | Return `invalid` with both relevant rows associated to one overlap issue. | No config text; focus first path error and announce the summary once. | None. | Unit and Browser | R2, R5 |
| EC-008 | P1 | Content root reuse | Three content paths, two under `/mnt/disk1` and one under `/mnt/disk2`, with two parity levels. | Return `invalid` when known mount roots leave fewer than three distinct content roots. | Explain that path count alone is not physical-disk separation and request another root. | None. | Unit | R4 |
| EC-009 | P1 | Path injection grammar | Path contains newline, `:`, `,`, backslash, `..`, or a leading directive such as `parity /tmp/x`. | Reject before rendering any config. | Error describes accepted path shape without echoing executable markup. | None. | Unit and static security test | R2, R6 |
| EC-010 | P1 | Policy injection | UI or engine receives policy value `balanced,exec=...` or an unknown enum. | Reject unknown policy and render only the two exact preset option lists. | No arbitrary option text is accepted or executed. | None. | Unit and Browser | R6 |
| EC-011 | P1 | Inventory actions | Click Add data disk, Add parity disk, Add content file, and remove a nonfinal row after a valid result. | Append/remove only the selected row; do not run validation or leave old output visible. | New control receives focus; primary `Check and generate` remains separate and visible. | None. | Browser: page spec | R7 |
| EC-012 | P1 | Stale result | Generate a valid result, then edit a path, capacity, policy, or checkbox. | Clear status, audit pass state, and both code blocks immediately. | Current values remain; a new submit is required. | None. | Browser: page spec | R7 |
| EC-013 | P1 | Keyboard submit | Focus a data path or capacity input and press Enter with a valid form, then with an invalid form. | Valid form generates once; invalid form does not navigate or submit twice. | Ready heading receives focus on success; first invalid field receives focus on error. | None. | Browser: keyboard spec | R7 |
| EC-014 | P1 | Clipboard failure | Mock `navigator.clipboard.writeText` to reject for config and fstab copy. | Leave result and code unchanged, record copy failure status. | Visible recovery says the code remains selectable; no exception escapes. | Clipboard mock only. | Browser: clipboard spec | R8 |
| EC-015 | P1 | Reset | Generate a result, click Reset, and inspect focus and URL. | Restore deterministic defaults and clear all result state. | First data path is focused; base route has no query or serialized paths. | History replace only if needed to keep the base route. | Browser: reset spec | R9 |
| EC-016 | P1 | Exact capacities | Use `0.5 TiB`, `1 TB`, `1,000`, `8e1`, `+8`, whitespace, and a fractional byte such as `0.0000000001 TB`. | Accept exact whole-byte values only; reject comma, exponent, sign, or fractional-byte cases. | Valid values show exact totals; invalid values keep the field and give one precise error. | None. | Unit: parser fixtures | R2, R3 |
| EC-017 | P1 | Data and parity bounds | One data row, four parity rows, zero capacity, and parity equal to largest data. | Reject fewer than two data rows and more than three parity rows; accept equality; reject zero. | Boundary messages name the relevant minimum or maximum. | None. | Unit and Browser | R3, R4 |
| EC-018 | P1 | Maximum inventory | Forty-two valid data rows, three parity rows, twelve content paths, and long but safe generated output. | Generate within the focused engine budget with stable ordering and no dropped rows. | Result remains usable and code is contained in the tool frame. | None. | Unit performance and Browser long-output spec | R1, R11 |
| EC-019 | P2 | Policy and blocksize variants | Generate with `most-free`, 512 KiB, 1024 KiB, and standard excludes off. | Output changes only the approved policy, blocksize, and exclude lines. | Result labels the chosen assumptions without duplicating the full config in prose. | None. | Unit snapshot-like fixture | R6 |
| EC-020 | P2 | Trailing slash normalization | Use `/mnt/disk1/`, `/mnt/parity1/`, `/mnt/storage/`, and content path with a trailing slash. | Normalize a single trailing slash except `/`; reject a root-only content path. | Show normalized output and preserve safe user intent. | None. | Unit | R2, R5 |
| EC-021 | P1 | Responsive populated result | Valid maximum-ish result at 320, 375, 760, and 1280 CSS px in dark and light themes. | Document and page container scroll widths are within one pixel of viewport; code regions may scroll internally only. | All actions, status, audit labels, result headings, and code copy buttons remain visible and touchable. | Screenshot and measurements only. | Browser: responsive spec | R11 |
| EC-022 | P1 | Unpublished route and SSR | Request the clean route through the guarded local preview and inspect HTML before JavaScript. | Route returns the explicit local-preview state, or 404 when the preview row is absent; route is not in sitemap and manifest says unpublished. | Server h1/tool identity and later guide content are present without relying on client code when previewed. | Guarded local database only. | Static and Browser: page test plus SEO request checks | R10, R12 |
| EC-023 | P1 | Privacy and no persistence | Fill paths, inspect URL, `localStorage`, `sessionStorage`, network requests, and analytics hooks before and after submit. | No path serialization, storage write, fetch/XHR, beacon, or external request. | The page states local handling in supporting content when writing is integrated; code remains selectable. | Clipboard only when explicitly requested. | Browser and static policy | R9, R12 |
| EC-024 | P2 | Long output and zoom | Forty-two data rows, long legal path segments within grammar, 200% browser zoom, reduced motion. | No clipped result heading, audit value, code control, or page-level overflow; code may scroll within its labeled region. | Focus remains visible and no motion is required to understand the result. | Screenshot and measurements only. | Browser manual plus responsive spec | R11 |
| EC-025 | P2 | Error collection | Submit with multiple invalid capacities, paths, content count, parity size, and pool overlap at once. | Return every independent issue in stable field order and no config. | One alert summary plus inline associations; focus first issue only. | None. | Unit and Browser | R2, R4, R8 |
| EC-026 | P2 | Output determinism | Run the same valid input twice and reorder only content paths. | Same input produces byte-for-byte identical output; content order changes only content line order, not data or policy lines. | Result has no timestamp or random identifier. | None. | Unit | R1, R6 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | Data: `d1 /mnt/disk1 8 TB`, `d2 /mnt/disk2 8 TB`, `d3 /mnt/disk3 4 TB`, `d4 /mnt/disk4 12 TB`; parity: `p1 /mnt/parity1 12 TB`; content: `/mnt/disk1/.snapraid.content`, `/mnt/disk2/.snapraid.content`; pool `/mnt/storage`; balanced, 256 KiB, excludes on. | `ready`; data total `32,000,000,000,000 B`; largest data `12,000,000,000,000 B`; parity total `12,000,000,000,000 B`; content minimum `2`; fstab branches exactly `/mnt/disk1:/mnt/disk2:/mnt/disk3:/mnt/disk4`; config contains `parity`, two `content`, four ordered `data`, `blocksize 256`, and four fixed excludes. | [Documented] [Debian snapraid(1)](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html) for directives and parity sizing; [Documented] [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/) for fstab shape. | Exact bytes; no parity or content path in branches; output ends with one newline; repeated run is byte-identical. |
| FF-002 | Data: two rows at `8 TiB`; parity rows at `8 TiB`, `8 TiB`, and `9 TiB`; four unique content paths on four known roots; most-free policy, 512 KiB, excludes off. | `ready`; directives are `parity`, `2-parity`, `3-parity` in order; content count is `4`; output contains `category.create=mfs`, `blocksize 512`, and no exclude lines. | [Documented] [Debian snapraid(1)](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html) for additional parity levels and content minimum; [Documented] [MergerFS](https://mergerfs.com/) for whole-file policy behavior. | Each parity capacity is at least the 8 TiB largest data disk; data branch list contains exactly two data paths. |
| FF-003 | Data capacities `0.5 TiB`, `1 TB`; parity `1 TB`; two valid content paths; balanced policy. | `ready`; exact byte values `549,755,813,888`, `1,000,000,000,000`, data total `1,549,755,813,888`; display may round but comparison uses bytes. | [Documented] [SnapRAID manual](https://www.snapraid.it/manual) for capacity as a file-system configuration boundary; independently derived integer-unit oracle. | No floating-point drift; parity equal to max data is valid; stable result under display-unit changes if later exposed. |
| FF-004 | Data `/mnt/disk1`, parity `/mnt/disk1/parity`, pool `/mnt/storage`, valid capacities and content. | `invalid`; one path-overlap issue; `snapraidConfig === null`, `fstabLine === null`. | [Documented] [mergerfs QuickStart](https://trapexit.github.io/mergerfs/2.41.1/quickstart/) branch/mount shape; [Inferred] nested data/parity roots are unsafe for this explicit-branch contract. | No partial output can coexist with a path-safety error. |
| FF-005 | Valid FF-001 plus policy value `balanced,cache.files=off\nparity /tmp/evil`, and a path with a newline. | `invalid`; unknown policy and unsafe path issues; no HTML, shell, or directive injection in rendered text. | [Documented] [Debian snapraid(1)](https://manpages.debian.org/unstable/snapraid/snapraid.1.en.html) configuration directives; local security oracle. | Input is text-only; no `dangerouslySetInnerHTML`, fetch, storage, or command execution. |

## Test plan

### Pure engine and unit tests

- `tests/pages/snapraid-mergerfs-planner/snapraid-merfs-engine.test.mjs`: FF-001 through FF-005, parser grammar, path segment relations, exact `bigint` capacity arithmetic, parity/content rules, policy allow-list, output ordering, and EC-025/EC-026.
- Keep the engine test independent of React, browser globals, filesystem, network, and environment variables. Assert structured status, issue paths, exact byte totals, output snippets, and null output on every invalid branch.
- Add a maximum inventory performance assertion for EC-018. The p95 pure engine calculation must remain below 50 ms on the local test runner for 42 data rows, 3 parity rows, and 12 content rows.

### API or route tests

Not applicable: the page has no API, server action, upstream source, cache, or host-resolution boundary. A static page test must still prove that the client engine does not import request or host-access APIs.

### Browser tests

- `tests/pages/snapraid-mergerfs-planner/snapraid-mergerfs-planner.spec.ts`: EC-001, EC-002, EC-006, EC-011 through EC-015, EC-017, EC-018, EC-021 through EC-024, and EC-025.
- Use the guarded local preview only. Grant clipboard permission for success tests and inject a rejecting clipboard for failure tests. Assert clean URL, no storage writes, no network requests, focus movement, alert association, result reading order, code containment, and all required viewport/theme measurements.
- Use a real valid result before judging layout. Measure document, body, tool frame, form, result, audit table, and code scroll widths. Inspect the longest generated config at 320 and 375 CSS px.

### Static and SEO tests

- `tests/pages/snapraid-mergerfs-planner/page.test.mjs`: page ownership, route-local file scope, absence of route metadata/canonical/robots/JSON-LD, server-rendered identity, shared shell imports, client/prose separation, no shared-sidebar edits, and no forbidden command execution or network calls.
- `tests/pages/snapraid-mergerfs-planner/page.json`: route `/snapraid-mergerfs-planner`, `state: "unpublished"`, concrete reason, exact docs/tests/scripts/skills arrays, and empty repositories array.
- `tests/pages/snapraid-mergerfs-planner/page.test.mjs` must verify that no storage hub/sidebar, collection count, registry, migration, or unrelated route path is listed as a changed owner. Publication checks use the existing Stack127 unpublished-route conventions without changing sitewide tests.
- Run `node skills/stack127/stack127-tool-build/scripts/validate-pipeline.mjs content_docs/snapraid-mergerfs-planner --stage=test` after this artifact and after any upstream fingerprint change.

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Clean form | 320, 375, 760, 1280; dark and light | Two-second scan and keyboard order | Data rows, primary action, and required groups are obvious; no decorative helper wall. |
| Valid maximum result | 320 and 375; dark and light | Scroll widths and code region | No page overflow; code scrolls only inside its labeled region; status and copy buttons remain visible. |
| Valid result | 760 and 1280; dark and light | Compare two established storage siblings | Same shell width, typography, spacing rhythm, border treatment, and answer-first hierarchy. |
| Invalid multi-error result | 375; dark and light | Submit all invalid fields | One result alert, inline associations, no stale config, first issue focused. |
| Copy failure | 375; dark | Deny clipboard | Code remains selectable and failure is visible without changing result. |
| Unpublished request | Chromium request and page | Clean route, query variant, sitemap | Local preview only; absent public registry entry stays unavailable and no sitemap entry is created. |
| SSR identity | Chromium with scripts disabled or initial HTML | H1 and static route content | Tool identity and later server-rendered guide do not depend on the client island. |

## Test data and mocks

- Use only synthetic POSIX paths under `/mnt`, no real device identifiers, hostnames, secrets, or user paths.
- Use exact decimal capacities from FF-001 through FF-003 and legal boundary values: 2 and 42 data rows, 1 and 3 parity rows, 2 and 12 content paths, equality and one-byte-below parity capacity, and zero or one data rows.
- Malicious strings include newline, colon, comma, backslash, `..`, HTML tags, shell metacharacters, `parity /tmp/x`, `content /tmp/x`, and a policy enum with a newline. Assert text inertness and no dynamic HTML.
- Mock only `navigator.clipboard.writeText`, `matchMedia` for theme/reduced motion if needed, and browser viewport. Do not mock or call a network or host API because none belongs in the contract.
- Use a fixed output string oracle, not snapshot files that conceal changed semantics. Preserve output line order and trailing newline explicitly.
- Visual evidence is standalone Playwright CLI in this homelab session. The in-app Browser is unavailable; no visible-tab handoff may be claimed.

## Plan completion criteria

- [x] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [x] Every formula branch and invariant has an oracle fixture specification.
- [x] The build stage has an ordered focused-test plan and a full-quality-gate plan.
- [x] Network, persistence, SSR, publication, accessibility, responsive, security, and privacy families are covered or explicitly not applicable.

## Open questions and blockers

- No upstream product decision blocks the test contract. The version-one limits and two policy presets are locked in `implementation-report.md`.
- The route will require a guarded local preview implementation before Browser tests can exercise the unpublished page. It must remain local-only and restore state.
- Specialist test-design delegation did not return an artifact and was closed; this test contract was written locally from the validated upstream fingerprints.
