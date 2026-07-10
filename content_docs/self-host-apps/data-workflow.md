# Self-host app data workflow

The durable flow is:

```text
discover -> candidate staging -> dedupe -> select 100 -> research and classify -> enrich -> QA -> publish -> refresh
```

Discovery never publishes. Publication never happens from an external directory description alone.

## Source of truth

- Shared model: `version127_docs/open-projects.md`
- Page projection: `content_docs/self-host-apps/schema.md`
- Migration: `supabase/migrations/20260710111454_migrate_to_open_projects.sql`
- Local baseline: `supabase/seeds/20260629_version127_open_projects.sql`
- Script manifest: `scripts/self-host-apps/scripts.json`
- Skills: `skills/self-host-apps/discovery/` and `skills/self-host-apps/enrichment/`

## 1. Discover

Durable sources write normalized rows to `open_project_candidates`:

```bash
npm run self-host-apps:discover-awesome-selfhosted -- --limit 5000 --write
npm run self-host-apps:discover-selfhst -- --limit 5000 --write
npm run self-host-apps:discover-selfhostedworld -- --limit 2000 --write
npm run self-host-apps:discover-openalternative -- --limit 2000 --write
npm run self-host-apps:discover-github-topic -- --topic self-hosted --limit 100 --write
```

Store raw summaries, categories, topics, and payloads as discovery evidence. Do not reuse them as final copy or editorial classification.

## 2. Dedupe

```bash
npm run self-host-apps:dedupe-candidates -- --dry-run
npm run self-host-apps:dedupe-candidates
```

Match canonical source-code URL first, then slug and official homepage. Treat normalized-name matches as weak evidence and review them.

## 3. Select a batch

```bash
npm run self-host-apps:select-candidate-batch -- --limit 100 --out scripts/self-host-apps/batches/YYYY-MM-DD-candidate-enrichment.json
```

Keep reviewed overrides beside the batch. Historical batch files using `repository_url` or `platforms` still load, but new files use `source_code_url` and `surfaces`.

## 4. Research and classify

Use official project sources: repository, website, install docs, release page, package/container page, and configuration examples.

Before publication, decide `self_hosting_status`:

- `self_hostable` when official sources show a user-controlled install or service deployment.
- `not_self_hostable` when the open project is useful but not a self-host target.
- `unknown` when the evidence is incomplete. Unknown candidates stay in review.

Map one to three controlled categories by purpose. GitHub topics and source-list headings are not categories.

## 5. Enrich and upsert

```bash
npm run self-host-apps:enrich-github-batch -- --file <batch> --overrides <reviewed-overrides> --limit 100 --dry-run
npm run self-host-apps:enrich-github-batch -- --file <batch> --overrides <reviewed-overrides> --limit 100
```

The write updates `open_projects`, category links, field provenance, and candidate state in one transaction. A candidate with unknown self-hosting status is moved to `needs_review`, not published.

For reviewed non-GitHub rows, use `self-host-apps:validate` and `self-host-apps:upsert` or `self-host-apps:upsert-batch`.

## 6. Quality gates

Run the checks that match the batch:

```bash
npm run self-host-apps:qa-gate
npm run self-host-apps:qa-report
npm run self-host-apps:icon-integrity
npm run self-host-apps:audit-summaries
npm run self-host-apps:audit-links-fast
npm run typecheck
npm run build
```

QA scripts report issues. They do not globally draft or publish projects. Apply researched corrections with `self-host-apps:apply-qa-overrides`.

## 7. Production sync

```bash
npm run self-host-apps:sync-local-to-prod -- --dry-run
npm run self-host-apps:sync-local-to-prod
```

The sync mirrors the shared project rows, category taxonomy, category links, source payloads, and field provenance. It refuses to run when local and production URLs are identical.

Apply schema migrations before data sync. Verify row counts and the live `/self-host-apps` page afterward.

## 8. Scheduled work

`.github/workflows/self-host-apps-discovery.yml` runs twice daily. It fills candidate staging from directory and GitHub sources, then dedupes. It cannot publish.

`.github/workflows/self-host-apps-refresh-github.yml` runs every 12 hours. It refreshes changing GitHub facts for published projects without changing summaries, categories, self-hosting classification, resource estimates, links, or publication state.

## Summary rule

Write one direct sentence about what the project helps a user do. Avoid boilerplate such as `open source`, `self-hosted`, `solution`, `powerful`, or `all-in-one` unless a term adds necessary meaning.

Good:

```text
Bookmark manager for saving pages, preserving copies, and organizing research links.
```

Bad:

```text
Powerful open-source self-hosted bookmark management solution.
```
