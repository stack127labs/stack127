# Self-host apps data model

`public.self_host_apps` is the source of truth for `/self-host-apps`, and the page owns it. It includes open source, source-available, and closed-source software, as long as a self-hosted install is verified. A public repository is optional.

## Core tables

| Table | Holds |
| --- | --- |
| `self_host_apps` | Reviewed app facts and stable page data. |
| `self_host_app_categories` | The controlled category list. |
| `self_host_app_category_links` | Links between apps and categories. |
| `self_host_app_resource_estimates` | One row per app with RAM and storage planning ranges. |
| `self_host_app_install_options` | One row per app with destination columns and detailed link JSON. |
| `github_projects` | Shared GitHub repository facts used by self-host apps, terminal apps, and future directories. |
| `self_host_app_candidates` | The only lasting discovery and review queue. Candidate rows are never public. |

The streamline migration removed `self_host_app_import_runs`, `self_host_app_sources`, `self_host_app_field_sources`, and `self_host_app_curated_overrides`. Job logs and artifacts are now the run history. The old `open_project_*` compatibility views are gone too.

Every page-owned table keeps RLS on and isn't exposed to `anon` or `authenticated`. The page reads published records on the server.

## Publication boundary

An app qualifies when an official website, docs page, download, package, appliance, or container image proves you can run it on infrastructure you control. Hosted-only and client-only software doesn't qualify.

`source_model` is a legal fact about how the app is distributed:

| Value | Meaning |
| --- | --- |
| `open_source` | A verified open source license. |
| `source_available` | The source is visible, with extra restrictions. |
| `closed_source` | The publisher ships a self-hosted build without public source. |
| `unknown` | Research is incomplete. A new record with this value can't be published. |

## Requirements and estimates

Publisher requirements stay on `self_host_apps`: `ram_min_mb`, `ram_recommended_mb`, and `storage_min_gb`. Use them to calibrate the estimate ranges.

Appliance defaults go in `ram_default_limit_mb`. They aren't app minimums. `storage_profile` and `persistent_storage` describe the shape of the workload.

`self_host_app_resource_estimates` stores RAM and storage ranges for every app. Each row has:

- A `derived` or `estimated` kind.
- A confidence level.
- A short internal basis.
- Source URLs.
- An optional note.
- A check date.

The UI labels every range `Est. RAM` and `Est. Storage`. Package caps aren't app requirements.

## Install destinations

`self_host_app_install_options` has one row per app. Destination columns are arrays, so one app can have several Docker, Compose, NAS, or appliance links.

The `options` JSON list keeps labels, support levels, image references, source links, notes, and order. Docker URLs point to registry or install pages, never Dockerfiles.

## Shared GitHub facts

`github_projects` has one row per owner and repository pair. Stars, forks, languages, topics, releases, commits, license, and maintenance are refreshed there.

`self_host_apps.github_project_id` and `terminal_apps.github_project_id` are nullable links. Duplicate app rows can point to the same repository, so the repository table isn't unique per app.

The shared GitHub refresh combines self-host apps with published CLI apps,
selects each linked project once, and preserves every self-host membership for
updates. Unlinked self-host apps can join an existing matching GitHub project;
unlinked CLI apps stay outside this job until their repository links are reviewed.
The scheduled batch is 500 unique repositories twice a day. On 2026-11-02,
4,429 self-host projects plus 248 CLI-only projects made 4,677 total: 10 batches,
or about five days for one full pass. This is an attempt cycle; inaccessible
repositories remain stale and appear in the failure summary.

CLI maintenance uses the same helper as `scripts/cli-apps/build-curated-batch.mjs`:
archived first, unknown when the push date is missing or invalid, active below
110 days, slow below 395 days, then stale. Scheduled refreshes derive it from
GitHub without a curated override. Only changed maintenance values are written.
The existing terminal-app and GitHub-project triggers touch `/cli-apps` and queue
its cache refresh; the job does not write public page dates by hand.

`checked_at` is the last successful GitHub fact refresh. `last_attempt_at` records
successful and failed attempts, and `consecutive_failures` resets after success.
The refresh queue orders by the later of the attempt and successful check dates,
so inaccessible repositories move behind older work without appearing fresh.
A failed repository with no project row gets a linked placeholder with a null
`checked_at`. Failed repository URLs appear in the Actions job summary.

The GitHub queue excludes unlinked apps without a usable GitHub repository URL,
including null and malformed URLs. A linked project can still supply the identity
when the app URL is missing. Missing identity or a failed attempt-metadata write
is logged and skipped without stopping the remaining refreshes.
GitHub, GitLab and Codeberg list every selected failure in the job summary.
They tolerate up to 20% failed rows, and fail above that limit or when a non-empty
batch refreshes nothing. Empty queues succeed. Failed GitLab/Codeberg sources
keep their successful check dates and are retried on later daily runs.

Other providers keep using the existing `source_*` columns until a provider table is worth adding. That's a planned transition, not a second source of truth for self-host apps.

## Evidence and QA

`data_source_urls`, `data_checked_at`, `data_confidence`, and `technical_fact_status` hold a short evidence summary for each app. They replace the old field-level provenance rows.

They still let QA tell unchecked data apart from an official source that published no value.

The Monday technical refresh collects evidence only. It lists all unreadable
sources in the artifact and job summary, tolerates up to 5% unreadable rows,
and fails if that limit is exceeded or every selected source is unreadable.
Install destinations stay in dry-run mode: the builder infers registry links
and support levels, and applying replaces existing options. Review the proposed
links and support levels before running an explicit apply. Use
`apply-qa-overrides.mjs` for reviewed editorial fact corrections.

## Reviewed artifact cleanup

The cleanup manifest records reviewed helper containers, image variants, and duplicate app rows. Preview it before a change:

```bash
npm run self-host-apps:apply-artifact-cleanup -- --environment development
```

Preview is read-only and is the default. It shows each target row's name, source, image, publication state, and whether it needs cleanup. The command stops if a target or canonical app no longer matches the expected slug, name, and source.

Apply to development with:

```bash
npm run self-host-apps:apply-artifact-cleanup -- --environment development --apply
```

The apply runs in one transaction. It keeps source links on canonical app rows, fixes reviewed product names, and unpublishes artifact rows. Re-running it accepts rows that are already clean. Production uses the same reviewed manifest, and needs `--confirm stack127-production` for both the preview and the apply:

```bash
npm run self-host-apps:apply-artifact-cleanup -- --environment production --confirm stack127-production
npm run self-host-apps:apply-artifact-cleanup -- --environment production --confirm stack127-production --apply
```

Review the production preview before running the apply command.

The migration `20260901060529_streamline_self_host_apps_data_model.sql` folds the old rows into these tables. It removes pipeline-only tables and compatibility views and keeps the candidate review queue.

## Add one app on request

This adds records to `/self-host-apps`. It does not create a route or page.

1. Find existing records first: `npm run self-host-apps:select-candidate-batch -- --environment development --match forgejo`. A name or repository substring lists candidate IDs, statuses, source and duplicate links, plus app IDs, slugs, publication and self-hosting status. Repeat the lookup in production before preparing that batch; app IDs must match that database.
2. Research the official website, repository, license, install docs and resource guidance. Write reviewed decisions and RAM/storage estimates using the enrichment skill formats. Include a managed icon, official evidence links, verified self-hosting and source model, and one to three controlled categories. Review every possible duplicate. Do not copy directory claims as verified facts.
3. Claim only the candidate IDs in the review file, preview first:

   ```bash
   npm run self-host-apps:select-candidate-batch -- --environment development --ids-from <reviewed.json> --dry-run --out /tmp/app-claim-preview.json
   npm run self-host-apps:select-candidate-batch -- --environment development --ids-from <reviewed.json> --out /tmp/app-claim.json
   npm run self-host-apps:apply-candidate-review -- --environment development --file <reviewed.json> --dry-run
   npm run self-host-apps:apply-candidate-review -- --environment development --file <reviewed.json>
   npm run self-host-apps:apply-resource-estimates -- --environment development --file <estimates.json> --dry-run
   npm run self-host-apps:apply-resource-estimates -- --environment development --file <estimates.json> --apply-reviewed
   ```

4. Refresh only that app's repository facts: `self-host-apps:refresh-github -- --slug <slug>` for GitHub, `self-host-apps:refresh-gitlab -- --slug <slug>` for GitLab, or `self-host-apps:refresh-codeberg -- --slug <slug>` for Codeberg. Pass `--environment development`. Check the real directory at desktop and mobile width, including the app's icon, install links, estimates and filters.
5. After the owner authorizes production changes, run the same claim preview, claim, review preview, review apply, estimate preview, estimate apply and per-app refresh on homelab. Replace `--environment development` with `--environment production --confirm stack127-production` on every command. Use homelab because uploading to production from the MacBook is very slow. Check the live directory after cache refresh completes.

`new` means discovery has not run duplicate checks. `queued` means dedupe found no match; `needs_review` often means a possible name match. Exact-ID manual selection accepts all three because the reviewer checks duplicates. It also reports already `enriching` rows and leaves them alone. Missing, published, rejected or duplicate IDs stop the whole claim. `--ids <uuid,uuid>` is also supported. Claiming uses one transaction and touches no other candidates. Top-N selection still only claims `queued` and `needs_review`; it does not bypass dedupe. Re-running a claim is safe while rows are enriching. Before the review commits, claiming the same IDs again is safe. After the review commits, resume at estimates; do not reclaim or reapply that review. Estimates and repository refreshes can be re-run. Release an abandoned enriching claim with `npm run self-host-apps:release-candidate-batch -- --environment development --file <claimed.json> --to needs_review`; use `--environment production --confirm stack127-production` for production. Release leaves completed candidates alone.

Claims, claim releases, candidate reviews, resource estimates and single-app upserts default to development and use the shared environment resolver. They ignore `NODE_ENV` and inherited `DATABASE_URL`, reject `--database-url`, and require the production confirmation even for previews. Review application still writes unless `--dry-run` is present; estimates still need `--apply-reviewed` to write. Those flags cannot be combined. Candidate review previews use a read-only transaction; claim and estimate previews issue no data writes. A preview validates inputs and references but cannot prove that every write-time constraint or trigger will pass.

If there is no candidate, use the existing single-record path: put the same complete, officially researched app facts in `<app.json>` with `published: true`, then run `npm run self-host-apps:upsert -- --environment development --file <app.json> --dry-run` and repeat without `--dry-run`. This file is the app object, not a candidate-review wrapper. Find first: upsert merges by slug. No candidate ID or raw SQL is needed. Fill estimates with the commands above. Preview install destinations with `npm run self-host-apps:refresh-install-options -- --environment development --slug <slug>` and repeat with `--apply`. Then check the directory and repeat this single-app sequence on homelab with the production flags after authorization.

Do not use `sync-local-to-prod` for this. It mirrors whole tables and would send about 5,000 unrelated development differences along with the requested apps.

Caller check: the repo has npm wrappers in `package.json` and command examples in `scripts/self-host-apps/scripts.json`, `skills/self-host-apps/enrichment/SKILL.md`, this document and `content_docs/self-host-apps/data-workflow.md`. Examples now name development explicitly. No workflow, monitoring entry, checked-in OVH job or homelab job calls the gated editorial commands or supplies `NODE_ENV=production` / `--database-url` to them. Installed timers and scripts outside this repo were not checked. `upsert-batch` is a separate legacy command; its environment behavior was not changed by this work.
