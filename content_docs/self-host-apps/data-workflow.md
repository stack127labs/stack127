# Self-host app data workflow

```text
recurring discovery
  -> self_host_app_candidates
  -> exact dedupe / name review
  -> atomic claim
  -> official-source research
  -> self_host_apps + category links + source summary
  -> resource/install refresh
  -> QA
  -> provider refresh
```

Production is canonical. Local is a disposable mirror for development and QA.

## Discovery

Run the directory, registry, and appliance collectors with `--write` only after inspecting their reports. They write candidate evidence, never final categories or publication decisions. Keep the broad candidate queue because it prevents duplicate research and gives reviewers a clear handoff. Run logs and counts belong in the job output, not in a database import-run table.

```bash
npm run self-host-apps:discover-selfhostedworld -- --limit 5000 --details --concurrency 4 --out <report.json>
npm run self-host-apps:discover-openalternative -- --limit 5000 --details --concurrency 4 --out <report.json>
npm run self-host-apps:discover-app-catalogs -- --catalog all --limit 5000 --write
```

`discover-app-catalogs` supports `truenas`, `umbrel`, `docker_hub`, `unraid`, `casaos`, and `yunohost`. Docker Hub discovery is bounded by search terms and page size so registry search cannot flood the review queue. Unraid discovery excludes blacklisted and deprecated templates unless `--include-deprecated` is passed.

## Dedupe and review

```bash
npm run self-host-apps:dedupe-candidates -- --dry-run
npm run self-host-apps:dedupe-candidates
npm run self-host-apps:select-candidate-batch -- --limit 100 --out <batch.json>
npm run self-host-apps:collect-github-evidence -- --file <batch.json>
```

Selection uses `FOR UPDATE SKIP LOCKED` and marks claimed rows `enriching`, so two workers do not take the same work. Reviewers use `references/review-format.md`. Put supporting links in `sources` and `data_source_urls`; use `technical_fact_status` for checked-but-unpublished technical facts. There is no field-source table.

The review applier validates and moves data. Publication requires an official identity, a cached icon, one to three controlled categories, a verified self-hosting classification, install documentation, and at least one source URL. Open and source-available apps need a verified repository and license. Closed-source apps need an official website and publisher identity, but no repository.

## Technical refresh

Official primary and appliance sources can fill Docker, Compose, database, persistence, release, and appliance memory facts. Apply numeric requirements only from a separately reviewed requirements file. If the source has no RAM or storage value, leave the exact field null and set the status to `not_published`.

```bash
npm run self-host-apps:refresh-primary-technical-facts -- --refresh-all --requirements-file <reviewed-requirements.json> --out <report.json>
npm run self-host-apps:refresh-primary-technical-facts -- --refresh-all --apply-reviewed --requirements-file <reviewed-requirements.json> --out <report.json>
npm run self-host-apps:refresh-app-catalog-facts -- --truenas-dir <checkout> --umbrel-dir <checkout> --apply-reviewed
```

Planning estimates are separate reviewed records:

```bash
npm run self-host-apps:propose-resource-estimates -- --limit 5000 --out <resource-estimates.json>
npm run self-host-apps:apply-resource-estimates -- --file <reviewed-estimates.json> --apply-reviewed
```

Estimates must include a range, kind, confidence, basis, and source URL. They are always shown as `(estimated)`.

Install destinations are refreshed into one row per app:

```bash
npm run self-host-apps:refresh-install-options -- --limit 5000 --apply
```

Docker links point to a registry or install page. Dockerfiles, Compose files, repositories, and READMEs are not Docker install buttons. Appliance links are emitted only when a reviewed catalog or package source supplies them.

GitHub Actions runs the primary-facts refresh weekly and the catalog discovery job weekly. Each job uploads its JSON report as an artifact. A failed source or unreadable app is visible in the job output and report; it is not converted to an unverified value.

## QA

```bash
npm run self-host-apps:qa-gate
npm run self-host-apps:qa-report
npm run self-host-apps:icon-integrity
npm run self-host-apps:audit-summaries
npm run self-host-apps:audit-links-fast
npm run typecheck
npm run build
```

The QA report separates actionable gaps from researched null outcomes. `technical_pending_count` means a fact was not checked. `*_not_published` means an official source was checked and did not publish that value. Do not hide either state with a guess.

## Mutable provider facts

GitHub facts are stored in `github_projects` and shared by self-host and terminal app pages. GitLab and Codeberg facts remain in the provider-neutral `source_*` columns until provider-specific tables are added. Provider refreshes update stars, languages, topics, releases, maintenance, and licenses only; they do not change summaries, categories, self-hosting status, install support, or publication.

## Database direction

```bash
npm run self-host-apps:sync-prod-to-local -- --confirm-local-reset
```

The local-to-production mirror is exceptional and guarded:

```bash
npm run self-host-apps:sync-local-to-prod -- --confirm-reviewed-push --dry-run
```

Pass `--draft-missing` only when the reviewed local mirror is intentionally authoritative for publication. Without that flag, the script never drafts production rows. Normal enrichment writes directly to the selected database. GitHub Actions and VPS logs are the run history. No import-run table is needed.
