# Self-host app scripts

This folder owns discovery, reviewed candidate movement, refresh, and QA for `/self-host-apps`. Public records live in `self_host_apps`; the page reads published `self_hostable` rows.

```text
discover -> candidates -> dedupe -> claim -> Codex research -> reviewed decision -> QA -> refresh
```

## Discovery

- `discover-awesome-selfhosted.mjs`
- `discover-selfhst.mjs`
- `discover-github-topic.mjs`
- `discover-selfhostedworld.mjs`
- `discover-openalternative.mjs`
- `discover-app-catalogs.mjs` for the official TrueNAS and Umbrel app catalogs
- `discover-html-directory.mjs` for manual sources only
- `dedupe-candidates.mjs`

Discovery stores raw evidence. It cannot publish or assign final categories, summaries, resource facts, surfaces, or self-hosting status.

## Review movement

- `select-candidate-batch.mjs` atomically claims queued and name-review rows.
- `collect-github-evidence.mjs` collects official API evidence without editing apps.
- `apply-candidate-review.mjs` validates reviewed decisions and writes them transactionally.
- `release-candidate-batch.mjs` releases an abandoned claim.

`apply-candidate-review.mjs` requires provenance for known technical facts. Unknown values stay `null` or `unknown`.

## Refresh and QA

- `refresh-github.mjs`, `refresh-source-host.mjs`: mutable source-host facts only.
- `qa-gate.mjs`, `qa-report.mjs`, `audit-data-quality.mjs`: publication quality.
- `audit-summaries.mjs`, `audit-links*.mjs`, `icon-integrity.mjs`: content checks.
- `apply-qa-overrides.mjs`: researched corrections.

## Database direction

Production is canonical. `sync-prod-to-local.mjs` rebuilds the disposable local mirror. `sync-local-to-prod.mjs` is an exceptional guarded upsert, requires `--confirm-reviewed-push`, and does not draft missing production rows unless `--draft-missing` is also explicit.

See `content_docs/self-host-apps/data-workflow.md` and `scripts/self-host-apps/scripts.json`.
