# Four-tool audit, 16 September 2026

The four tools are not ready. Each has confirmed correctness defects. Their examples and basic interactions work, but passing tests and pipeline documents did not establish the claimed end-to-end completion.

| Tool | Implementation verdict | Main remaining work |
|---|---|---|
| Restic retention simulator | Needs fixes | Read native snapshot hostnames, implement oldest-snapshot retention, repair validation and grouping collisions. |
| Rsync filter tester | Needs fixes | Apply first-match rules to ancestors, distinguish directories from files, reject unsupported syntax, improve performance. |
| Home Assistant MQTT discovery checker | Needs fixes | Avoid false valid results, validate topic IDs, recognize supported identity forms, preserve JSON values. |
| LXC ID mapping checker | Needs fixes | Detect host-side overlap, enforce valid ID bounds, check grants by full range, owner, and UID/GID type. |

All four lack development page/content records. Their real routes return 404 with noindex, as expected for unpublished pages. This is a content/integration gap, separate from the engine defects. No publication or deployment was performed.

## Scope and environment

- Commit reviewed: `827bdad494216dea94415f494e6cf7161b4b705b`.
- The four route, engine, documentation, and test directories were untracked working-tree additions. The shared tool inventory and data-model test had uncommitted changes. Existing Docker Compose and resource-planner changes were preserved.
- Node `v22.23.1`, Next.js `16.2.9`, repository Playwright Chromium, Linux. The audit used `.env.local`; a secret-free target check confirmed the managed development project and excluded production.
- Data access was a read-only transaction. It returned no `stack127_pages` rows for the four slugs, so no associated tool title, introduction, or supporting content could be reviewed. [Database evidence](2026-09-16-four-tool-audit-evidence/development-records.json).
- The in-app Browser runtime returned no available browsers. The repository Playwright installation was used instead.
- Browser evidence comes from an isolated Next.js fixture importing the unchanged real components, engines, shared controls, `PageCanvas`, global styles, actual site fonts, and `ThemeToggle`. The fixture has no registry, supporting article, sidebar, or sticky site header. It is component evidence, not full-page integration QA.
- Local HTTP checks against the production build with managed development data returned four 404 responses and no tool workbenches. [Route evidence](2026-09-16-four-tool-audit-evidence/routes.json).

## Confirmed findings, ordered by impact

### 1. Restic silently merges native snapshot hosts

High impact. [Engine](../lib/restic-retention-simulator/engine.ts:116), [normalization](../lib/restic-retention-simulator/engine.ts:172).

Use two snapshots with different `hostname` values, different times, host grouping, and only `keepLast: 1`. Both should survive as separate host groups. The engine reads `host`, groups both under `(none)`, and marks the older snapshot pruned. Native restic snapshot JSON uses `hostname`. The interface contract explicitly invites pasted restic output. [Restic snapshot JSON specification](https://restic.readthedocs.io/en/stable/075_scripting.html#snapshots).

Accept and validate the native field, define any legacy alias deliberately, and test actual exported snapshot fixtures. The product contract itself needs this correction. Confirmed by the `native hostname` probe in [Restic evidence](2026-09-16-four-tool-audit-evidence/restic-retention-simulator-probes.jsonl).

### 2. Restic omits the oldest-snapshot fallback

High impact. [Selection logic](../lib/restic-retention-simulator/engine.ts:148).

Use two snapshots on 1 January, at 08:00 and 12:00 UTC, with only `keepDaily: 2`. The tool keeps noon and marks 08:00 pruned. Restic additionally retains the oldest snapshot when there are insufficient populated periods for the requested retention count. This changes a deletion recommendation. Implement and explain that fallback, with independent fixtures for daily, weekly, monthly, and yearly rules. [Official retention behavior](https://restic.readthedocs.io/en/stable/060_forget.html#removing-snapshots-according-to-a-policy).

Confirmed against the documented rule and the `oldest fallback` engine probe. A local restic binary was unavailable; no claim of binary differential testing is made.

### 3. Rsync ignores earlier includes when checking parent traversal

High impact. [Ancestor evaluation](../lib/rsync-filter-tester/engine.ts:160).

With `+ cache/` followed by `- cache/`, both `cache/` and `cache/keep.txt` should be visited and included. The tool includes the directory but labels the child unvisited because it searches for any matching exclusion. The usual sequence `+ */`, `+ *.txt`, `- *` also incorrectly makes `src/readme.txt` unvisited.

Evaluate every ancestor through the same first-match resolver as each supplied path. Apply the unmatched policy consistently: with default exclude and only `+ src/readme.txt`, the tool currently excludes `src/` but includes its child. Confirmed in the engine and rendered component. Real `rsync -rni` includes the child in both include-first examples. [CLI evidence](2026-09-16-four-tool-audit-evidence/rsync-cli.json), [rsync filtering rules](https://rsync.samba.org/ftp/rsync/rsync.1#FILTER_RULES).

### 4. Rsync confuses directory-only and ordinary name patterns

High impact. [Pattern compiler and matcher](../lib/rsync-filter-tester/engine.ts:85).

`- cache/` must leave a regular file named `cache` included. The tool excludes it by appending a slash during matching. Conversely, `- cache` must exclude a directory named `cache` and stop traversal into it. The tool includes `cache/` and its child.

The parser records whether each path is a directory, but the matcher does not use that fact. Match directory names without their display slash and enforce directory-only patterns explicitly. Both discrepancies were confirmed against `rsync --dry-run`; the fixtures only used temporary local files. [Engine probes](2026-09-16-four-tool-audit-evidence/rsync-filter-tester-probes.jsonl).

### 5. MQTT reports invalid discovery messages as valid

High impact. [Payload checks](../lib/mqtt-discovery-checker/engine.ts:64), [rendered verdict](../app/(site)/(tools)/mqtt-discovery-checker/mqtt-discovery-checker.tsx:113).

On a sensor discovery topic, `{"name":"Temperature"}` produces “Valid sensor discovery”, zero errors, and zero warnings. The required `state_topic` is absent. The common checks also accept clearly bad values such as `qos: 99`. The implementation contract promises warnings for component-specific omissions, but no such check exists. [MQTT sensor configuration](https://www.home-assistant.io/integrations/sensor.mqtt/#configuration-variables).

This does not require implementing every Home Assistant schema. Add the promised checks for supported components, and describe unvalidated components as incomplete checks rather than usable discovery messages. Confirmed in engine output and the rendered component. [MQTT probes](2026-09-16-four-tool-audit-evidence/mqtt-discovery-checker-probes.jsonl), [browser reproductions](2026-09-16-four-tool-audit-evidence/browser-extra.json).

### 6. LXC accepts overlapping host ranges and impossible IDs

High impact. [Overlap validation](../lib/lxc-idmap-checker/engine.ts:140), [integer validation](../lib/lxc-idmap-checker/engine.ts:68).

`u 0 100000 10` followed by `u 10 100005 10` overlaps host IDs 100005 through 100009. The checker reports valid with no findings because it compares only container intervals. It also accepts host ID `4294967295`, the reserved unmapped value, and can produce an endpoint beyond its own 64-bit input ceiling.

Check both container and host intervals independently. Validate starts, lengths, and resulting endpoints against Linux UID/GID bounds while keeping exact arithmetic. [Linux mapping constraints](https://man7.org/linux/man-pages/man7/user_namespaces.7.html). Confirmed by the `host overlap`, `reserved id`, and `overflow range` probes in [LXC evidence](2026-09-16-four-tool-audit-evidence/lxc-idmap-checker-probes.jsonl).

### 7. LXC grant coverage only checks the queried number

High impact. [Grant decision](../lib/lxc-idmap-checker/engine.ts:179).

Keep the example map `u 0 100000 65536` and query 1000, but supply only `root:101000:1`. The interface says “Grant status: covered” even though almost the entire map is outside the grant. A grant for `other-user` yields the same result. The engine parses owner names but never compares them; the interface has no caller-owner input and shares one grant list between UID and GID queries.

The contract promises host-interval coverage and exact owner matching. Validate the entire relevant map against the intended owner's grants, keep UID and GID grant sources distinct, and label query-only coverage separately if retained. Runtime access remains outside scope. [newuidmap grant checks](https://man7.org/linux/man-pages/man1/newuidmap.1.html). Engine and browser reproduction confirmed; no host mappings were changed.

### 8. Restic validation can throw or create duplicate identities

High impact for the thrown error; medium for normalization collisions. [Validation](../lib/restic-retention-simulator/engine.ts:80), [group keys](../lib/restic-retention-simulator/engine.ts:116).

- A snapshot with `host: 42` throws `snapshot.host?.trim is not a function`. The rendered tool shows no recovery alert.
- IDs `x` and ` x ` pass duplicate checking, become the same normalized ID, and both appear kept under `keepLast: 1`.
- Path sets `["/a, /b"]` and `["/a", "/b"]` collapse into the same comma-joined group. The tool then prunes one snapshot that belongs to a separate path set.

Validate optional field types before use, check uniqueness after normalization, and use collision-safe structured group keys. Confirmed by engine probes; the host-type exception was also reproduced in the browser.

### 9. MQTT topic and identity checks miss valid and invalid forms

Medium impact. [Topic checks](../lib/mqtt-discovery-checker/engine.ts:49), [identity checks](../lib/mqtt-discovery-checker/engine.ts:64).

`homeassistant/sensor/bad id/config` is accepted even though discovery object IDs have a restricted character set. A valid scalar `device.identifiers: "device-1"` incorrectly produces a missing-identity warning. A payload using supported `uniq_id` and `stat_t` abbreviations incorrectly asks for identity already present.

Validate discovery node/object IDs, normalize documented abbreviations before checking, and accept both documented identifier forms. [Discovery topic and abbreviation reference](https://www.home-assistant.io/integrations/mqtt/#discovery-topic), [device identifiers](https://www.home-assistant.io/integrations/sensor.mqtt/#identifiers). Engine reproductions are saved. Device-level discovery and removal messages are separate profile extensions; this audit does not require them for a clearly scoped first version.

### 10. Rsync silently evaluates unsupported syntax

Medium impact. [Rule parsing](../lib/rsync-filter-tester/engine.ts:54), [glob compiler](../lib/rsync-filter-tester/engine.ts:85).

`-p *.log` is treated as the literal pattern `p *.log`, so `error.log` is included. `- [!a].txt` reverses the intended character-class behavior: it excludes `a.txt` and includes `b.txt`. The compiler also silently turns an invalid regular-expression class into a non-match.

The stated initial subset can remain small. Reject unsupported modifiers and character-class forms with a clear message instead of returning a valid, misleading report. The contract already promises unsupported-modifier diagnostics. Real rsync dry runs confirm the modifier and negated-class differences.

### 11. Rsync's promised input size blocks synchronous work

Medium impact. The edge-case contract promises 1000 paths and rules in under one second. The resolver repeatedly constructs regular expressions for each candidate and ancestor, with no input cap. The first probe took about 13.5 seconds; isolated repeats after the build took 10.8 and 10.3 seconds, preserved in [isolated performance evidence](2026-09-16-four-tool-audit-evidence/rsync-performance-isolated.jsonl).

Compile patterns once, reuse a first-match resolver and ancestor results, and enforce a supported input limit. Because submission calls the resolver synchronously, this work occupies the browser's main thread. The timing is a Node measurement on this audit host, not a measured browser freeze duration.

### 12. Errors are not associated with their fields

Medium impact across all four. Source locations include [rsync recovery](../app/(site)/(tools)/rsync-filter-tester/rsync-filter-tester.tsx:112), [MQTT recovery](../app/(site)/(tools)/mqtt-discovery-checker/mqtt-discovery-checker.tsx:106), and [LXC recovery](../app/(site)/(tools)/lxc-idmap-checker/lxc-idmap-checker.tsx:135).

Submit an absolute rsync path, malformed MQTT JSON, or a nonnumeric LXC query ID. Each tool says “Fix the highlighted input”, but no field receives `aria-invalid` or an associated error. Focus stays on Submit. “Fix input” moves to Filter rules, Discovery topic, or UID map respectively, rather than the failing field. Restic's semantic date error also leaves focus on Submit. Each alert section contains another alert, risking repeated announcements.

Pass structured errors to the shared fields, focus the first failing control, and use one concise alert. These are rendered reproductions, not assumptions from source. [Browser state log](2026-09-16-four-tool-audit-evidence/browser.json).

### 13. Restic's trace omits dates; MQTT JSON can change values

Medium impact. [Restic table columns](../app/(site)/(tools)/restic-retention-simulator/restic-retention-simulator.tsx:164), [MQTT parsing and serialization](../lib/mqtt-discovery-checker/engine.ts:96).

The Restic contract requires snapshot time in the trace, but the table only shows ID, state, group, and reason. Exported text has a UTC timestamp; the visible table has none, making period decisions hard to inspect. Add a timestamp with explicit timezone treatment. The “first keeping rule” caption also contradicts rows listing several matching rules.

MQTT's normalized output changes JSON integer `9007199254740993` into `9007199254740992`. This is JavaScript number precision loss, contradicting the promised value-preserving preview. Preserve numeric tokens or flag unsupported precision before offering normalized output. The probe used an extra field to isolate serialization behavior; it is not a claim that this field is part of Home Assistant's schema.

## Interface and writing assessment

The four workbenches use shared controls, visible labels, one primary action, semantic table headings, and local styles. Their example submissions focus a visible result. Editing removes old results and copy buttons. Reset clears results, and copy success and forced copy failure produce feedback. These behaviors worked in the isolated fixture.

All four were exercised at 1440, 760, 375, and 320 pixels in both actual site themes. The inspected fixture had no horizontal page overflow for examples. Tables scroll inside their own containers; keyboard Tab reached the overflow region in Chromium, and ArrowRight scrolled it. A 400-character rsync path remained contained, though its table expanded to 4368 pixels and required substantial horizontal scrolling. This is a usability concern, not inaccessible content in the tested browser.

Results repeat the same answer in status text, a result heading, and a separate primary-value block. On narrow screens this pushes the useful trace down. MQTT shows a header-only findings table when there are no findings. Remove duplicated result regions and omit that empty table. The phrase “Errors block the shape” is unclear; explain the checked scope and the practical meaning of a finding. Fix incorrect certainty before polishing prose.

Representative inspected captures: [Restic mobile](2026-09-16-four-tool-audit-evidence/restic-retention-simulator-375-dark.png), [rsync narrow](2026-09-16-four-tool-audit-evidence/rsync-filter-tester-320-light.png), [MQTT desktop](2026-09-16-four-tool-audit-evidence/mqtt-discovery-checker-1440-dark.png), [LXC breakpoint](2026-09-16-four-tool-audit-evidence/lxc-idmap-checker-760-light.png). The evidence directory contains all 32 viewport/theme result captures plus invalid and expanded states.

The actual server-rendered titles, introductions, supporting guides, contextual source links, and related links are not verified. Writing plans exist, but are not live content. The MQTT plan's proposed home-automation link to `/domain-tools` also does not follow the reader's task. No second copy of supporting Markdown was created.

## Verification results and limits

| Area | Result | Evidence |
|---|---|---|
| Existing focused tests | Passed, 33 individual tests: 21 engine and 12 page-structure tests | Per-tool `*-unit-tests.log` and `*-page-tests.log` in the evidence directory |
| Shared inventory/data-model checks | Passed, both selected test files | [Shared log](2026-09-16-four-tool-audit-evidence/shared-tests.log) |
| TypeScript | Passed, exit 0 | [Typecheck log](2026-09-16-four-tool-audit-evidence/typecheck.log) |
| Static policy | Passed, 298 route files | [Static log](2026-09-16-four-tool-audit-evidence/static.log) |
| Pipeline/tool-only checks | Passed for all four | [Pipeline log](2026-09-16-four-tool-audit-evidence/pipeline.log) |
| Production build | Passed on retry, exit 0 | [Build log](2026-09-16-four-tool-audit-evidence/build-retry.log) |
| Independent correctness probes | Failed expectations recorded across all four; 26 targeted probes | Four `*-probes.jsonl` files |
| Actual rsync comparisons | Six mismatches confirmed; all six reference dry runs exited 0 | [CLI log](2026-09-16-four-tool-audit-evidence/rsync-cli.json) |
| Rendered components | Basic flows passed; recovery and correctness defects confirmed | [68 state observations](2026-09-16-four-tool-audit-evidence/browser.json), [additional cases](2026-09-16-four-tool-audit-evidence/browser-extra.json) |
| Route/publication gate | Passed for intentionally unpublished routes: four 404 responses | [HTTP log](2026-09-16-four-tool-audit-evidence/routes.json) |
| Full-page browser, copy, navigation, SSR content, live SEO | Not verified for a usable published page | No development registry/content records; fixture cannot establish these |
| Sticky-header clearance, screen-reader announcements, non-Chromium browsers | Not verified | Outside isolated fixture coverage |

The aggregate Node invocation reports eight test files, not eight individual cases. Direct execution of each file established the 33-case count. The existing tests miss the independent failures above, and some fixtures encode the mistaken assumptions. The rsync edge-case plan incorrectly says `*.conf` cannot match the basename in `etc/app.conf`; correct that expectation before adding tests. The plans also promise browser coverage that has no page-specific `.spec.ts` implementation. Shared browser tests list other representative routes and do not cover these four.

Initial build, database, local HTTP, and Chromium attempts hit sandbox restrictions. They were retried outside the sandbox under the approved execution boundary. The successful results above use completed retries, not partial logs. The unrelated historical CLI-app browser failure was not rerun or carried forward as a current finding. No full sitewide browser pass is claimed.

## Practical fix order

1. Correct Restic retention/grouping, rsync traversal/matching, LXC range/grant validation, and MQTT verdicts. Add specification-derived regression cases for every confirmed failure.
2. Repair structured input validation and error focus. Add explicit profile limitations and preserve JSON values.
3. Fix rsync performance, restore dates to the Restic trace, remove repeated summaries, and test the real controls with long input and invalid states.
4. Complete reviewed tool content and the intended development integration through the normal workflow, then run full-route browser and SEO checks. Publication remains a separate state; it cannot cure engine defects.

No product code, public copy, database records, publication state, versions, or Git history were changed. Only audit probes, logs, screenshots, and this report were added.
