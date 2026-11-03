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
- `discover-app-catalogs.mjs` for TrueNAS, Umbrel, Docker Hub, Unraid Community Applications, CasaOS, and YunoHost catalogs
- `discover-html-directory.mjs` for manual sources only
- `dedupe-candidates.mjs`

Discovery stores raw evidence. It cannot publish or assign final categories, summaries, resource facts, surfaces, or self-hosting status.

## Review movement

- `select-candidate-batch.mjs` atomically claims queued and name-review rows by rank, or exact IDs with `--ids` / `--ids-from <reviewed.json>`. `--match <name-or-repository>` is read-only lookup.
- `collect-github-evidence.mjs` collects official API evidence without editing apps.
- `apply-candidate-review.mjs` validates reviewed decisions and writes them transactionally.
- `release-candidate-batch.mjs` releases only abandoned enriching claims, through the shared environment and production confirmation gate.

`apply-candidate-review.mjs` requires source links for published records. Unknown values stay `null` or `unknown`; checked-but-unpublished facts use `technical_fact_status`.

## Refresh and QA

- `refresh-github.mjs`, `refresh-source-host.mjs`: mutable source-host facts only.
- `qa-gate.mjs`, `qa-report.mjs`, `audit-data-quality.mjs`: publication quality.
- `audit-summaries.mjs`, `audit-links*.mjs`, `icon-integrity.mjs`: content checks.
- `apply-qa-overrides.mjs`: researched corrections. Defaults to development; use `--environment production --confirm stack127-production` for production, including `--dry-run`. Preview rolls back; omit `--dry-run` to commit.

## Database direction

Production is canonical. `sync-prod-to-local.mjs` rebuilds the disposable local mirror. `sync-local-to-prod.mjs` is an exceptional guarded upsert, requires `--confirm-reviewed-push`, and does not draft missing production rows unless `--draft-missing` is also explicit.

For targeted additions, follow “Add one app on request” in `stack127_docs/self-host-apps-data.md`. Do not use `sync-local-to-prod` for single apps. Editorial commands (including claim release) use `--environment development` (default) or `--environment production --confirm stack127-production`, including production previews. GitLab/Codeberg and install-option refreshes accept `--slug`; scheduled refresh callers keep their existing environment behavior.

See `content_docs/self-host-apps/data-workflow.md` and `scripts/self-host-apps/scripts.json`.
