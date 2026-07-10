---
name: version127-self-host-enrichment
description: Enrich Version127 self-host app candidates or draft projects in repeatable batches of 100, verify official sources, classify self-hosting status, and publish only reviewed rows.
---

# Version127 self-host enrichment

Use this skill in `/Users/ravitejaknts/projects/HomeLabHQ` for `/self-host-apps` data work.

Core rule: refine records in place. Do not globally draft or publish projects. A row becomes public only after its summary, categories, links, icon, open-source eligibility, and self-hosting classification are reviewed.

## First checks

- Read `AGENTS.md`.
- Read `version127_docs/open-projects.md`.
- Read `content_docs/self-host-apps/data-workflow.md`, `schema.md`, and `content-rules.md`.
- Check `scripts/scripts.json` and `scripts/self-host-apps/scripts.json`.
- Inspect the live schema and current counts instead of relying on old batch notes.

## Batch flow

1. Select 100 rows from `open_project_candidates`, or 100 existing draft `self_hostable` projects.
2. Create a reviewed overrides file beside the batch.
3. Verify official website, source code, install docs, release, container/package links, license, publisher, categories, surfaces, and icon.
4. Set `self_hosting_status` to `self_hostable` or `not_self_hostable`. Leave unresolved rows in `needs_review`.
5. Cache valid icons.
6. Dry-run `self-host-apps:enrich-github-batch`, inspect failures, then write.
7. Run QA, summary, link, icon, typecheck, and build checks.
8. Dry-run production sync before writing production.

## Standards

- Use official project sources first.
- Use `null` or `unknown` instead of invented facts.
- Assign one to three controlled categories by purpose. GitHub topics are not categories.
- Write one direct summary sentence, usually under 160 characters. Avoid hype and boilerplate about being open source or self-hosted.
- Treat Docker, database, RAM, and storage facts as unknown unless official evidence supports them.
- Keep field provenance for researched facts.
- New records use `source_code_url` and `surfaces`; historical batch aliases remain accepted.

## Minimum verification

```bash
npm run self-host-apps:qa-gate
npm run self-host-apps:audit-summaries
npm run self-host-apps:icon-integrity
npm run typecheck
npm run build
```

Report selected, enriched, published, needs-review, and failed counts plus the batch and overrides files used.
