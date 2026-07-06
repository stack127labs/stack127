# Self-Host App Data Workflow

This workflow is intentionally small for the current version127 direction, but it is built to scale into large imports without losing auditability.

## Source Of Truth

- Schema: `content_docs/self-host-apps/schema.md`
- Database migration: `supabase/migrations/20260629000000_create_version127_self_host_apps.sql`
- Seed data: `supabase/seeds/20260629_version127_self_host_apps.sql`
- Script index: `scripts/scripts.json`
- Page pipeline: `scripts/self-host-apps/scripts.json`

Do not recreate the old `content/apps` or `content/app-drafts` prose workflow. New collection and enrichment work belongs in `scripts/self-host-apps`.

## Data Rules

- Store facts that can be filtered, sorted, refreshed, or inferred.
- Keep one short `summary`; skip prose fields such as verdict, good fit, watch outs, install copy, and long descriptions.
- Use `null` or `unknown` when a fact is not verified.
- Prefer official websites, docs, repositories, and container links.
- Use only the controlled category slugs in `content_docs/self-host-apps/schema.md`.
- Do not import source-list headings as categories.
- Keep app details inside `/self-host-apps` through the in-page details panel.
- Keep `/self-host-apps` crawler-friendly by rendering complete app records in the server HTML, even when the human UI uses cards and a drawer.

## Summary Rules

Summaries must be original one-line descriptions of what the app does.

Avoid broad filler:

- `open source`
- `self-hosted`
- `solution`
- `platform`
- `powerful`
- `ultimate`
- `all-in-one`

Good:

```text
Bookmark manager for saving pages, preserving copies, and organizing research links.
```

Bad:

```text
Open-source self-hosted bookmark management solution.
```

## Pipeline

1. Discover candidates with `self-host-apps:import-awesome`, `self-host-apps:import-awesome-selfhosted`, `self-host-apps:import-selfhst`, or `self-host-apps:import-github-topic`.
2. Preserve raw imported payloads in `self_host_apps_sources`.
3. Normalize rows into the active schema.
4. Map imported categories into the controlled taxonomy.
5. Keep imported rows as draft until reviewed.
6. Select review batches with `self-host-apps:select-enrichment-batch`.
7. Enrich GitHub-backed batches with `self-host-apps:enrich-github-batch`.
8. Rewrite summaries with the version127 rules.
9. Validate records with `self-host-apps:validate`.
10. Upsert rows, category joins, source payloads, and field sources with `self-host-apps:upsert` or `self-host-apps:upsert-batch`.
11. Refresh GitHub facts with `self-host-apps:refresh-github`.
12. Run `self-host-apps:qa-gate`, `self-host-apps:qa-report`, `self-host-apps:icon-integrity`, `self-host-apps:audit-summaries`, and `self-host-apps:audit-links` before large batches or production syncs.

## Volatile GitHub Facts

Changing repository facts are refreshed separately from enrichment.

Use `npm run self-host-apps:refresh-github -- --published-only --limit 500` to update stars, latest release, last commit date, maintenance status, `github_checked_at`, and missing license values.

The scheduled workflow `.github/workflows/self-host-apps-refresh-github.yml` runs this every 12 hours against production. It must not change summaries, categories, Docker support, resource estimates, links, or publish state.

## Quality Repair Pass

Use `self-host-apps:qa-report` to rank published rows by risky facts, weak summaries, missing licenses, weak Docker proof, database uncertainty, and icon problems.

Use `self-host-apps:qa-gate` to separate hard publish blockers from soft review warnings. Production should not ship rows with gate blockers.

Use `self-host-apps:icon-integrity` to keep published app icons local, valid PNG files, and large enough for the UI.

Use `self-host-apps:apply-qa-overrides` only with reviewed batch files under `scripts/self-host-apps/batches/`. Each override should update only the verified fields and include `field_sources` for important facts such as summary, license, database requirement, Docker support, and install docs.

Do not let broad repository text infer database or Docker support. Use official install docs, compose files, package pages, or explicit project documentation. If a row cannot be verified, keep it draft.

Run `self-host-apps:reset-categories` when imports or old data need to be remapped into the current taxonomy.
Run `self-host-apps:draft-all` before a major review pass when only enriched rows should be visible.

Use `--dry-run` when the command supports it before writing large batches.

## Production Sync

Run `self-host-apps:sync-local-to-prod -- --dry-run` only after the local QA gate, icon integrity audit, and reviewed overrides are clean.

The sync copies the verified local state for:

- `self_host_apps`
- `self_host_apps_categories`
- `self_host_apps_categories_join_table`
- `self_host_apps_sources`
- `self_host_apps_field_sources`

It does not delete production-only app rows. It drafts them so stale or unverified rows stop appearing publicly while the data remains recoverable.

After a real sync, rerun `NODE_ENV=production self-host-apps:qa-gate` and an icon integrity check before calling the production data clean.

## selfh.st Import

`self-host-apps:import-selfhst` reads the selfh.st software directory JSON, dedupes against the current database, and writes a draft batch file.

Duplicate checks run in this order:

- canonical repository URL
- exact slug
- canonical website URL
- normalized name

The importer intentionally skips the selfh.st companion-app directory for now. Companion clients can become their own page or filter later, but they should not be mixed into the core self-host app import without review.

## Environment

Local self-host app scripts read `DATABASE_URL` from `.env.local` when no explicit database URL is provided. Production jobs should use the production `DATABASE_URL` from `.env.database`, either by loading that file in the process environment, running with `NODE_ENV=production`, or passing `--database-url`.

Do not add hardcoded local database connection strings to scripts. Missing database config should fail loudly.

## Local Updates

For broad resets, update the migration and seed together. For individual test apps, prefer a validated JSON record and `self-host-apps:upsert`; update the seed when the sample data should remain part of the local baseline.
