# Self-host app scripts

This folder owns discovery, enrichment, and QA for `/self-host-apps`. The shared records live in `open_projects`; the page reads published rows classified as `self_hostable`.

## Flow

```text
discover -> open_project_candidates -> dedupe -> select 100 -> research -> enrich -> QA -> publish -> refresh
```

All durable discovery commands write candidate rows. None can publish directly.

## Discovery

- `discover-awesome-selfhosted.mjs`
- `discover-selfhst.mjs`
- `discover-github-topic.mjs`
- `discover-html-directory.mjs`
- `dedupe-candidates.mjs`
- `select-candidate-batch.mjs`

External summaries, categories, and topics remain raw candidate metadata until reviewed.

## Enrichment

- `select-enrichment-batch.mjs`
- `enrich-github-batch.mjs`
- `validate-row.mjs`
- `upsert-app.mjs`
- `upsert-batch.mjs`
- `apply-qa-overrides.mjs`
- `cache-icons.mjs`
- `reset-categories.mjs`

The shared column contract is in `lib/schema.mjs`. Historical batch files using `repository_url` or `platforms` remain readable, but new records use `source_code_url` and `surfaces`.

## QA and production

- `qa-gate.mjs` reports publication blockers.
- `qa-report.mjs` ranks repair work.
- `audit-data-quality.mjs` reports risky facts.
- `audit-summaries.mjs` checks summary style.
- `audit-links.mjs` and `audit-links-fast.mjs` check links.
- `icon-integrity.mjs` checks local icons.
- `refresh-github.mjs` updates changing GitHub facts.
- `sync-local-to-prod.mjs` mirrors verified shared data to production.

QA scripts do not globally draft or publish projects. Production sync follows a schema migration and a dry run.

## Files

- Durable batch and review files: `scripts/self-host-apps/batches/`
- Temporary one-off scripts: `scripts/self-host-apps/temp/`
- Command manifest: `scripts/self-host-apps/scripts.json`
- Workflow docs: `content_docs/self-host-apps/data-workflow.md`

Delete one-off scripts after use. Do not add them to `package.json`.

## Automation

`.github/workflows/self-host-apps-discovery.yml` runs candidate discovery and dedupe twice daily.

`.github/workflows/self-host-apps-refresh-github.yml` refreshes changing GitHub facts every 12 hours without changing summaries, categories, self-hosting status, resource facts, links, or publication state.

Both workflows require the production `DATABASE_URL` secret. `VERSION127_GITHUB_TOKEN` is optional; GitHub Actions falls back to its workflow token.
