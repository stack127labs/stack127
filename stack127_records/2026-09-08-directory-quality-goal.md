# Directory quality goal

Status: in progress. No complete-catalogue verification claim has been made.

## Scope

Fix former shortcut URLs and investigate intermittent directory failures. Review every published self-host and CLI app for identity, purpose, summary, categories, source model, licensing, installation, platforms, pricing, resources, maintenance, and evidence dates where those fields apply. Preserve the approved card layout.

Use deterministic checks to identify errors and review coverage. Write descriptions and decide factual classifications from primary evidence, not keyword-based generation. Missing publisher information remains a researched unknown, not an invented value. An unreachable source or unresolved contradiction remains pending and prevents a verified completion claim.

## Work log

- Verified the original shortcut route list against Git history. Added an explicit permanent redirect map for the hub and 26 former references, with regression tests. Not deployed yet.
- Confirmed production runs revision `8877b785d154baf288c975aa8c462544e4fd55ac`, while this working tree contains other work. Do not replace the working tree with production files or assume the two implementations match.
- Initial live checks confirmed ZooKeeper's incorrect source model, imported markup, incomplete summaries, and suspect component/duplicate records. These are not a complete catalogue audit.
- Five repeat production directory requests succeeded. This does not resolve the reported intermittent 500.
- Production log access remains unavailable: missing local SSH alias, host-key verification failure through the documented IP, and no locally configured Dokploy API key. Do not bypass host verification or automate dashboard password login.
- ZooKeeper's identity, summary, source model, repository, category, and license correction passed the production dry run, was applied, and was read back successfully. Review batch: `scripts/self-host-apps/batches/2026-09-08-zookeeper-identity-correction.json`. This is a partial record correction, not a completed full-record audit.
- Added a tested idle database connection error handler. It records a sanitized error code and pool counts without query text or credentials. This prevents unhandled pool error events; it is not evidence that the original 500 cause has been resolved. Code remains local.
- The live ZooKeeper search returned HTTP 200 with the corrected description, developer-tools category, and open-source label after the production change.
- Local HTTP checks returned 308 for `/shortcuts`, `/shortcuts/cursor`, `/shortcuts/pi-coding-agent`, and `/shortcuts/zed`; an invented old route returned 404. All 27 mappings are also covered by the unit test.
- Focused regression tests and TypeScript passed. Static policy passed for 291 routes. A later full quality run is still being checked; do not infer a full pass from these focused checks.
- Current automated summary checks flag imported markup in 85 self-host records and potentially unfinished endings in 220. CLI has zero in those two checks, but this does not verify CLI wording or facts. These are baseline counts before editorial correction, not confirmed error totals.
- Full-record review completion remains 0 of the original 5,370 records. Seven app records have partial editorial corrections, and one duplicate component is quarantined. Resource-only corrections across the catalogue do not count as complete app reviews.
- The full quality run stopped at unit tests with seven failing test files. One new script-index registration failure was corrected and its test now passes. The Dockerignore test passed when rerun outside the sandbox. The shortcut route-list test currently sees an unrelated `keycap-preview` route and manifest from other workspace work; do not delete them. Existing CLI icon and hardware data/image/affiliate failures also remain. SEO and build stages did not run.
- Next source-review candidates already inspected at repository-overview level: `1time`, `4ga-boards`, and `apache-apisix`. Their descriptions are truncated. 1time's stored `docker_support: none` and `compose_support: false` contradict the current upstream README. No corrections for these three have been applied yet; inspect install files, licenses, and remaining facts before preparing their reviewed batches.

### Reviewed corrections, September 8 continuation

- Applied `scripts/self-host-apps/batches/2026-09-08-reviewed-install-corrections.json` after its production rollback dry run passed. This supersedes the preceding queue note for 1time, 4ga Boards, and Apache APISIX. All changed app fields matched on read-back, and their general and technical whole-record dates stayed unchanged.
- 1time now has a complete description, relevant categories, official backend and web images, Compose support, and Redis/persistent-storage facts from the publisher's deployment file. Unreviewed native installation and resource claims remain pending.
- 4ga Boards now has a complete description and a Docker link that opens the image page. Its database evidence notes that Redis is optional, supported by the publisher's no-Redis Compose file. The stored database-type list still includes PostgreSQL and Redis; conditional requirements need a clearer data/display contract before this record is considered fully reviewed.
- APISIX now has a complete description, its official website and documentation links, Docker and Compose support, and official installation options. Database evidence distinguishes etcd-backed deployment from standalone mode. Its conditional database display remains pending.
- The self-host correction writer now locks rows, checks prior values for changed fields and installation options, appends source URLs, and preserves whole-record review dates for partial corrections. Installation corrections replace only explicitly reviewed methods. Five direct unit tests pass.
- Applied `scripts/cli-apps/batches/2026-09-08-reviewed-description-corrections.json` after its production rollback dry run passed. Bash no longer claims to be the macOS default shell. Alacritty has a task-focused description and corrected display-name capitalization. Read-back confirmed the new values, field-level sources, and unchanged `last_verified_at` dates.
- CLI partial corrections have a separate allowlisted writer that defaults to rollback, rejects stale prior values, and cannot publish records or change whole-record review dates. Three direct unit tests pass. The two summaries are also updated in `curated-map.mjs` to prevent future rebuilds restoring the old copy.
- CLI publication now runs the same markup and unfinished-summary checks used by self-host publication. All five CLI provenance tests pass.
- Live searches for 1time, 4ga Boards, Apache APISIX, Bash, and Alacritty returned HTTP 200 and included the corrected server-rendered summaries. Response times ranged from about one to seven seconds; these successful samples do not resolve the intermittent-500 investigation. The script-index/page-structure tests also pass.
- The first ZooKeeper correction used the older writer, which advanced general review metadata and could replace the previous source list. Reconcile that metadata against the immutable baseline before closing the audit. Do not treat its current general date as a complete fact review.
- Remaining inventory gap: capture installation-option rows, resource-estimate rows, repository facts, icons, and CLI field-source rows in a supplementary read-only snapshot. The original baseline remains immutable.

### Resource evidence and component review

- Captured `scripts/stack127/directory-quality/temp/2026-09-08-production-inventory-full.json`, a version-2 snapshot of all 5,370 records including joined installation, resource, repository, icon, and CLI field-source data. This closes the preceding inventory gap. The original baseline remains unchanged. The collector now uses bounded cursor fetches and refuses to overwrite snapshot files.
- The first expanded snapshot attempt failed during connection establishment. The second reached the query but timed out. A subsequent `select 1` succeeded in 837 ms, and the bounded snapshot completed. These failures occurred from the audit host around 09:01 UTC on September 8; they do not prove the cause of the production website's intermittent 500s.
- Found 4,716 RAM ranges and 2,777 storage ranges generated by `deployment-shape-v1` from database counts and deployment flags. None had an independently documented estimate basis. Stopped the proposer from generating numbers; it now produces research tasks. The estimate writer requires a documented method, workload, and explanation and rejects the identified generated model, missing values, and reversed ranges.
- After a rollback-only production dry run, removed those 7,493 generated ranges from 4,735 resource rows. Exact before-values are recoverable from `scripts/self-host-apps/batches/2026-09-08-generated-resource-quarantine-backup.json`. No app rows were deleted or unpublished by this operation. A full comparison verified that all 5,061 captured apps retained their exact RAM minimum, RAM recommendation, appliance RAM default, and storage minimum. Aggregate read-back found zero generated ranges remaining.
- The enrichment skill and data workflow now require workload-specific resource evidence. Skill validation, four resource-review tests, two resource-quarantine tests, two inventory tests, twelve inclusive-data-model tests, page-structure tests, and TypeScript passed. This does not replace the still-pending full quality and browser gates.
- Applied `scripts/self-host-apps/batches/2026-09-08-wanderer-component-review.json` after its production dry run passed. Wanderer has a clearer summary and registry link. `wanderer-database` is unpublished, not deleted. Its source template explicitly identifies it as the database component, and its old repository redirects to the existing Wanderer project. Read-back confirmed the canonical app remains published and the component does not. The canonical app's remaining facts still need review.
- Live searches for Wanderer and 1time returned HTTP 200 with the corrected summaries, without the duplicate component or generated-estimate evidence. These samples do not constitute full-directory browser QA.
- Repaired ZooKeeper's general date, confidence, and source list using `scripts/self-host-apps/temp/2026-09-08-restore-zookeeper-review-metadata.mjs`, first with rollback and then commit. Read-back confirmed the original date and confidence were restored, original sources retained, and the corrected open-source/Apache-2.0 facts preserved. This resolves the earlier metadata-reconciliation item.

## Remaining

### Automated technical review safeguard

The current directory loader already combines simultaneous self-host reads into one in-flight request. Do not add a duplicate mechanism or claim its absence explains the reported 500s.

The weekly primary-technical refresh had a separate, verified data-quality problem. Its parser-derived values flowed into `applyRecord`, which rewrote technical evidence notes and both technical and general review dates across collected apps. A requirements file protected only some numeric inputs, not the other inferred facts or metadata.

The collector is now read-only with respect to app facts. Write flags fail before database access, parser output is explicitly pending evidence, and the full collected record list is retained in the report. The weekly workflow no longer applies primary facts or inferred installation destinations. Also fixed its schedule expression so scheduled runs pass `--refresh-all` rather than a bare Boolean. These changes are local, not yet active on GitHub.

The new subprocess safety tests pass outside the sandbox, which otherwise rejects child Node processes. All twelve inclusive-data-model tests, page-structure tests, and static policy pass. No new production record corrections were made in this continuation.

### Outstanding work

### ACE-Step model and resource evidence

The official Ace-Step1.5 Hugging Face model card declares MIT, supporting the repository-code review for that published model. Other optional variants remain outside this check. The project README describes model-dependent GPU VRAM and offload configurations; those values must not populate system RAM fields.

Applied `scripts/self-host-apps/batches/2026-09-08-ace-step-resource-evidence-correction.json` after rollback validation. Added model evidence and replaced unsupported completed RAM/storage review notes, including stale claims that planning estimates were shown, with explicit unchecked states. Read-back verified exact evidence states, unchanged null resource values, retained general dates, and added sources. Actual RAM, storage, model-variant terms, and remaining deployment facts still require review.

### Second MIT contradiction batch

Read the root MIT licenses and project introductions for ACE-Step 1.5, Active Streams, and actual-ical. Applied `scripts/self-host-apps/batches/2026-09-08-mit-license-corrections-002.json` after rollback validation. Corrected no-license text and source models, wrote purpose-focused descriptions, and corrected categories. ACE-Step's MIT classification is for repository code; model-weight terms remain separately pending.

Production read-back verified every changed field, retained and new evidence, and unchanged general and technical dates. Twenty-six apps now have partial editorial corrections. Deployment, resource, maintenance, and remaining metadata review is not complete for these records. No production code release occurred.

### First MIT contradiction corrections

Read complete root MIT license files for abs-kosync-bridge, accept-bot, and accessflow. Applied `scripts/self-host-apps/batches/2026-09-08-mit-license-corrections-001.json` after rollback validation. Replaced the incorrect no-license text with MIT and changed source_available to open_source. Existing MIT SPDX and permissive fields were preserved.

Read-back verified all license fields, source models, retained and new source URLs, and unchanged general and technical dates. Twenty-three apps now have partial editorial corrections. These three still need description, category, deployment, resource, maintenance, and remaining metadata review. No full-record completion or production code release is claimed.

### Batcharr source model and license triage

Read the complete current Batcharr LICENSE. Its Zlib license text, SPDX value, and permissive classification were already correct; only source_model incorrectly said source_available. Applied `scripts/self-host-apps/batches/2026-09-08-batcharr-source-model-correction.json` after rollback validation. Read-back verified open_source, unchanged license fields, and unchanged general and technical dates.

The immutable inventory has 617 source_available records whose SPDX field says MIT, Apache-2.0, Zlib, or BSD-3-Clause. This is a review queue, not proof of 617 classification errors. Examples include abs-kosync-bridge, accept-bot, accessflow, ace-step, active-streams, and actual-ical. Several simultaneously say no license file in their display text. Review current license files and license scope before correcting them; do not resolve conflicting fields by blindly trusting the SPDX value.

### Autoheal and Batcharr description corrections

Applied `scripts/self-host-apps/batches/2026-09-08-autoheal-batcharr-corrections.json` after rollback validation. Autoheal's description names the existing health-check requirement and restart action. Batcharr's description names list import, match review, and approved requests to Radarr and Sonarr. Removed unrelated AI, communication, and password-manager categories. Read-back verified summaries, categories, retained evidence, and unchanged general and technical dates.

Twenty apps now have partial editorial corrections. Batcharr's README describes a MIT-to-zlib license change that still needs coordinated license-field review. Autoheal's Docker access and remaining technical fields remain pending. The attempted AURA main-branch README URL returned 404; no conclusion about project availability or publication was drawn from that single failed URL. Full-record review and production code release remain incomplete.

### CLI assembly no longer claims completed review

Found that `build-curated-batch.mjs` derived general verification dates from repository push dates or today's date, treated URL presence as reachability, and automatically marked assembled records for publication. Removed those shortcuts. Assembly now outputs needs-review records with null verification dates, preserves the prior evidence collection timestamp separately, marks untested website reachability unchecked, and refuses to overwrite existing output files.

The regression test failed against the previous builder and passes after the change. All six CLI provenance tests and the builder syntax check pass. Updated the catalogue workflow to require source review and explicit approval between assembly and publication. No production records were changed in this continuation. Historical general dates remain subject to the full-record audit; this prevention does not retroactively verify them.

### Appliance collector safeguard

Found another active write path in `refresh-app-catalog-facts.mjs`. It replaced technical evidence states and advanced technical and general dates from parser output. Missing parser matches became `not_published`, and appliance memory limits were treated as RAM evidence. Removed its writer and generated review states. The collector now rejects write flags before database access, uses a read-only transaction, retains per-app evidence and candidate facts marked pending, and refuses to overwrite an existing report file.

The new test failed on the existing SQL writer before implementation. After the change, all four subprocess safety tests pass outside the sandbox. Updated the data workflow and script inventory. No production data was changed. Existing negative evidence states still need provenance review; identical generic wording alone is not enough to prove which records were generated. This code safeguard is local until release.

### 2048-cli installation correction

Resolved the pending package claim through primary sources. The README apt command installs ncurses headers. Debian's 2048 package links to a different project, mevdschee/2048.c. Homebrew's exact 2048-cli formula API returned 404. Removed the unsupported brew and apt methods, retaining the documented source build. This is not a claim that no third-party packages exist.

Added test-first support for removing unsupported installation methods through the guarded CLI correction workflow. The new path permits only a unique subset of the current methods and retains expected-value and evidence requirements. All four correction tests pass. Applied `scripts/cli-apps/batches/2026-09-08-2048-install-correction.json` after rollback validation, updated the curated expansion, and verified the saved list, field evidence/date, and unchanged general date. Remaining 2048-cli metadata and the full catalogue audit remain pending.

### age and 2048-cli description review

Applied `scripts/cli-apps/batches/2026-09-08-age-2048-description-corrections.json` after rollback validation. age now explains key/passphrase encryption and piped input directly instead of calling the interface composable. 2048-cli now names keyboard play, high scores, and adjustable board size. Both descriptions are supported by official README usage sections. Updated the curated expansion source to prevent later rebuilding from restoring the old wording.

Production read-back verified the descriptions, field-specific source URLs and dates, and unchanged whole-record verification dates. The README's apt command for 2048-cli installs build dependencies, not the game; its stored apt installation claim remains pending independent package verification. Eighteen apps now have partial editorial corrections. The full-record audit is still incomplete, and no code release occurred.

### Production route recheck

Fresh read-only checks on September 8 confirm that `/shortcuts/pi-coding-agent`, `/shortcuts/cursor`, and `/shortcuts/zed` still return 404 without Location headers. Their three `/keyboard-shortcuts/` replacements return 200. Both local redirect regression tests pass, but production remains unfixed until release.

The first `/self-host-apps` sample returned 200 after 7,122 ms to headers. Three subsequent full-body samples returned 200 in 3,584, 1,264, and 1,257 ms, each with 327,508 decoded bytes. No matching application-error text or Next error digest was found in those samples. `/cli-apps` returned 200 with headers in 1,683 ms. These are observations from the audit host, not a benchmark, availability guarantee, or proof of the original 500's cause. The result supports keeping the production log investigation open rather than claiming an outage is fixed from successful reloads. No production data or code was changed during these checks.

### Appdata Cleanup Plus, Arc Relay, and Audacious

Applied `scripts/self-host-apps/batches/2026-09-08-appdata-arc-audacious-corrections.json` after rollback validation. Replaced three truncated descriptions with source-reviewed sentences. The descriptions distinguish Unraid cleanup with selected folders, MCP connection management, and Audacious through an unofficial browser-accessible container. Corrected purpose categories without changing unrelated metadata.

Read-back verified descriptions, summary source, category sets, retained source URLs, new evidence, confidence, and unchanged general and technical dates. All checks passed. Sixteen apps now have partial editorial corrections. Full-record review remains incomplete. Pending findings include Unraid version and plugin installation classification, Arc Relay's deployment requirements, and the difference between Audacious and its container publisher. No production code release occurred.

### Retired keyword category reset

Inspected `reset-categories.mjs` and found that its default execution deleted every category link, combined imported categories with keyword matches, assigned a system-administration fallback, and kept the first three results. Words such as model and image could influence editorial categories. This establishes an unsafe code path, not proof that it produced every observed incorrect category.

Replaced that legacy command with a fail-fast entry point that has no imports, database connection, or SQL. It directs callers to expected-value-guarded, source-reviewed partial corrections. Updated the script inventory and data workflow. The pre-fix subprocess test request was rejected on safety grounds because it included the old write-capable command; it was not executed. After replacement, all three technical-refresh safety tests passed, including default, dry-run, and apply invocations of the retired entry point. No production data changed in this continuation. This prevention is local until the code is released.

### Calendar and media descriptions

Applied `scripts/self-host-apps/batches/2026-09-08-calendar-media-description-corrections.json` to production after a successful rollback dry run. AgenDAV, Antennas, and ArrStalledHandler now have complete, purpose-focused descriptions checked against their official READMEs. Replaced unrelated categories with calendars and contacts, media servers, and automation as appropriate.

Read-back verified all three summaries and category sets, retained old and new source URLs, and unchanged general dates, technical dates, and confidence. Summary quality and guarded-correction tests pass, nine tests total. This is a partial correction, not a completed review of these apps.

Additional issues discovered and recorded in the batch remain pending. AgenDAV's README says its Compose file is for development and that it offers no official Docker image. ArrStalledHandler's README documents GPLv3, Compose, and SQLite, which conflict with existing license text and technical states. Inspect the license and installation records before applying a coordinated correction. Antennas documents Docker discovery limitations and needs an installation and repository identity review.

There are now ten apps with partial editorial corrections, plus the quarantined Wanderer database component and the separate generated-resource cleanup. Full-record review remains incomplete for every original inventory record. No production code release occurred in this continuation.

### Bridge description correction

Applied `scripts/self-host-apps/batches/2026-09-08-bridge-description-corrections.json` after a production rollback dry run. Airbridge, AirConnect, and Amcrest PTZ Bridge now have complete descriptions checked against their project READMEs. Audio direction is explicit for the two audio bridges. The camera bridge description distinguishes movement control from video transport. Removed unrelated AI, conferencing, and other categories, retaining music and audio for the audio bridges and home automation for the camera bridge.

Read-back verified all summaries, categories, retained and added evidence, and unchanged general and technical review dates and confidence. Four summary-quality tests pass. Remaining review notes include Airbridge's early-development warning, AirConnect's packaging relationship to upstream, and each app's installation and technical metadata. Thirteen apps now have partial editorial corrections. No app is counted as fully reviewed, and no production code release occurred in this continuation.

### ArrStalledHandler technical correction

Applied `scripts/self-host-apps/batches/2026-09-08-arrstalledhandler-technical-corrections.json` after rollback validation. Read the complete official GPLv3 license, README deployment instructions, and SQLite calls in `main.py`. Corrected the contradictory no-license text and source-available classification to GPL-3.0 and open source. Replaced template and issue-tracker documentation destinations with the project and deployment instructions. Docker is publisher-provided, Compose is documented, and SQLite is embedded rather than a separate server requirement.

Updated Docker and Compose installation options together with their app fields and technical evidence. Preserved the unreviewed Unraid option and all general, technical, and installation review dates. Read-back verified every changed field and both reviewed options. Five guarded-correction tests pass. Resource evidence, maintenance, surfaces, remaining installation options, and the meaning of the separate `requires_database` boolean still need review. This remains a partial record correction, not another completed app review.

The read-only production inventory contains 5,061 published self-host rows and 309 CLI rows, with a fingerprint and pending review status for every record. It lives under `scripts/stack127/directory-quality/temp/2026-09-08-production-inventory.json`. Automated flags are leads, not confirmed errors or completed reviews.

The shortcut regression tests pass. Summary validation now rejects imported markup and obvious unfinished endings, and the unused automatic truncation/generation helpers were removed. The drawer label now says `repository checked` and uses only the repository check date. These code changes are not deployed.

### Gift tracker and Amarr corrections

### User-directed quick pass

The user deferred exhaustive record review and requested a quick pass on major mistakes. Do not continue treating full verification of 5,370 records as the current assignment. Preserve pending research for later. The outstanding redirect deployment and intermittent server errors remain important, unresolved work.

Applied `2026-09-08-quick-visible-corrections.json` after rollback validation. Official READMEs supported replacement summaries and purpose-based categories for gpodder2go, Ofelia, Stackyard, and youtube-dl-server. Removed visible imported markup and unfinished copy in those records. Production read-back confirmed all four summaries and category sets. Eleven focused correction, summary, and redirect tests passed. The 309 CLI records in the captured inventory had no summary-validator errors; that is not a factual certification.

Live checks returned HTTP 200 for both directories without the checked server-error text. The legacy Cursor shortcut still returned 404, confirming the local redirect fix remains undeployed. A successful request does not resolve an intermittent 500. Noti's old GitHub README now says the project moved to Codeberg; its identity needs follow-up before any destination or eligibility change. No broad hide or automatic description rewrite was applied.

The follow-up `2026-09-08-gift-deployment-corrections.json` was separately dry-run, applied, and read back in production. The gift tracker now has its proper name and project homepage, publisher-supported Docker and Compose destinations, and a publisher-provided Unraid template. Its database facts name embedded SQLite with PostgreSQL and MySQL as alternatives, and persistence is recorded from the deployment guide. RAM and storage remain null; their reviewed notes no longer claim that a generated estimate is displayed. The deployment guide and template were read directly. Every corrected field and installation option matched the batch on read-back, and general, technical, and installation review dates were preserved. This extends an existing partial review and does not increase the unique app count or complete a full-record review.

Applied `scripts/self-host-apps/batches/2026-09-08-gift-amarr-corrections.json` after rollback validation. Read both complete MIT licenses and official READMEs. Amarr's license is named LICENSE.md; a 404 for LICENSE was not treated as absence of a license. Corrected both no-license descriptions and source-available classifications, rewrote summaries, and replaced unrelated categories. Amarr's summary explicitly requires an existing aMule installation.

Production read-back verified changed fields, category sets, retained evidence, and unchanged general and technical review dates and confidence. These remain partial reviews, with deployment and remaining metadata pending. Thirty unique apps now have partial corrections, with no completed full-record reviews. No code release occurred.

### Alloy and Ambient Weather corrections

Applied `scripts/self-host-apps/batches/2026-09-08-alloy-weather-corrections.json` after a successful production rollback dry run. Read both complete root licenses and project README evidence. Grafana Alloy is Apache-2.0 and ambientweather2mqtt is MIT, replacing contradictory no-license text and source-available classifications. Rewrote both unfinished descriptions. Alloy now belongs to monitoring rather than unrelated AI and networking categories; the weather bridge retains home automation.

Production read-back verified the summaries, licenses, source models, categories, retained and added evidence, unchanged general and technical review dates, and unchanged confidence. Nine focused summary and correction tests pass. Installation, resources, maintenance, and remaining metadata still require review. There are now 28 unique apps with partial corrections and zero completed full-record reviews. No code deployment occurred.

### Review-date calendar validation

Added a failing regression test for impossible calendar dates in the CLI partial-correction workflow. JavaScript accepted February 31 by rolling it into March, so parse success alone was insufficient. The guard now requires an exact ISO date round trip. Invalid month lengths are rejected and valid leap days remain accepted. All five focused tests pass. This is a local validation change, with no production data changes or deployment.

- Verify redirect responses in the running app and production after an authorized release.
- Diagnose production errors with logs; add tested recovery without disguising outages as empty directories.
- Correct misleading check-date labels.
- Capture current production record inventories and evidence coverage for both directories.
- Review and rewrite all records in tracked batches, including records without obvious automated warnings.
- Strengthen publication validation and tests, apply reviewed corrections safely, and reconcile the resulting live data.
- Run full quality gates and browser checks. Report pending evidence and failures honestly.
