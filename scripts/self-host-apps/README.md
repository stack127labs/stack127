# Self-Host Apps Pipeline

This folder owns data collection and validation for `/self-host-apps`.

The public page stays minimal, but the pipeline keeps enough source metadata to audit every imported fact.

## Flow

1. Discover candidates from Awesome-style lists, selfh.st software data, GitHub topics, and other directories.
2. Store raw source payloads in `self_host_apps_sources`.
3. Normalize into the active `self_host_apps` schema.
4. Rewrite summaries using version127 rules.
5. Validate links, enums, categories, and summary quality.
6. Upsert rows, category links, and field source metadata.
7. Refresh GitHub facts separately for changing values.
8. Run the QA report, icon integrity audit, link audit, and summary audit before larger imports or production syncs.

## Summary Rule

`summary` replaces the old `description` field.

It must be one short original sentence that explains what the app actually does. Do not copy README, docs, marketing copy, or directory text.

Good:

```text
Photo and video backup app for building a private Google Photos-style library.
```

Bad:

```text
Open-source self-hosted photo management solution.
```

Avoid generic filler such as `open source`, `self-hosted`, `solution`, `powerful`, `ultimate`, and `all-in-one` unless it is truly essential to the app.

## Commands

See `scripts.json` in this folder for the command index.

Durable package scripts use the page slug prefix, for example `self-host-apps:refresh-github`.

Temporary one-off scripts belong in `scripts/self-host-apps/temp/` and should be deleted after use.

`self-host-apps:import-selfhst` imports only the selfh.st software directory, removes existing rows by repository, slug, website, and normalized name, and keeps new rows as draft for the normal enrichment pass.

Use `self-host-apps:qa-report` to rank published rows for field-level repair. Use `self-host-apps:apply-qa-overrides` only with reviewed JSON files in `scripts/self-host-apps/batches/`; do not use it for guessed facts.

Use `self-host-apps:icon-integrity` to verify that published icons are local PNG files with usable dimensions. Cache or repair icons before production syncs.

Use `self-host-apps:sync-local-to-prod -- --dry-run` after local QA passes. The sync mirrors local self-host app rows, taxonomy, category links, raw source payloads, and field provenance into production. Production-only app rows are drafted instead of deleted, so stale rows stop showing publicly without losing data.

## Scheduled Refresh

`.github/workflows/self-host-apps-refresh-github.yml` runs every 12 hours and refreshes changing GitHub facts for published rows only.

It updates stars, latest release, last commit date, maintenance status, GitHub checked time, and missing license values. It does not rewrite summaries, categories, Docker support, resource estimates, links, or published state.

Required GitHub secrets:

- `DATABASE_URL`: production Postgres connection string.
- `VERSION127_GITHUB_TOKEN`: optional personal token for higher GitHub API limits. The workflow falls back to GitHub Actions `GITHUB_TOKEN`.
