# Self-Host Apps Page Docs

Page: `/self-host-apps`

This page is a structured directory of self-hostable apps. It should stay minimal, filterable, and crawler-friendly. App details stay inside the in-page drawer, not per-app routes.

## Docs

- `schema.md` documents this page's projection from the shared open-project model.
- `content-rules.md` documents row shape and copy rules.
- `data-workflow.md` documents discovery, validation, import, enrichment, and audit flow.

## Scripts

Durable scripts live in `scripts/self-host-apps/`.

Temporary one-off scripts for this page belong in `scripts/self-host-apps/temp/` and should be deleted when the work is done.

## Rules

- Keep summaries one sentence and original.
- Avoid generic filler like `open source`, `self-hosted`, `solution`, `platform`, `powerful`, `ultimate`, and `all-in-one`.
- Prefer official websites, docs, repositories, and container links.
- Use `unknown` or `null` for unverified facts.
- Preserve source payloads and field provenance for imported data.
- Read `version127_docs/open-projects.md` before changing the shared tables.
- Keep the page server-rendered enough for crawlers and AI agents to read app records without opening the drawer.
