# Self-Host Apps Page Docs

Page: `/self-host-apps`

This page is a structured directory of self-hostable apps. It should stay minimal, filterable, and crawler-friendly. App details stay inside the in-page drawer, not per-app routes.

## Docs

- `schema.md` documents the page-owned self-host app model.
- `content-rules.md` documents row shape and copy rules.
- `data-workflow.md` documents discovery, validation, enrichment, refresh, and audit flow.

## Scripts

Durable scripts live in `scripts/self-host-apps/`.

Temporary one-off scripts for this page belong in `scripts/self-host-apps/temp/` and should be deleted when the work is done.

## Rules

- Keep summaries one sentence and original.
- Avoid generic filler like `open source`, `self-hosted`, `solution`, `platform`, `powerful`, `ultimate`, and `all-in-one`.
- Prefer official websites, docs, repositories, and container links.
- Use `unknown` or `null` for unverified facts.
- Keep source URLs and compact technical status on the app row; do not add a provenance table.
- Read `stack127_docs/self-host-apps-data.md` before changing the page-owned tables.
- Keep the page server-rendered enough for crawlers and AI agents to read app records without opening the drawer.
