# Tool page data model migration

Status: repository implementation and managed-development rollout complete on 2 September 2026. Production rollout is pending.

This record tracks the move from code-owned tool-page copy to database-owned Markdown. Current operating rules live in `stack127_docs/tool-pages.md` and `stack127_docs/stack127-repos.md`.

## Decisions

- `public.stack127_pages` remains the only publication, indexing, sitemap, and SEO registry.
- The registry uses `row_created_at` and `row_updated_at` for internal timestamps. `published_at` and `updated_at` are deliberate public dates.
- `public.stack127_tool_pages` contains only interactive tools. Catalogs, directories, and references do not get rows.
- Tool introductions and supporting copy use Markdown stored in the database. Tool code, exact result visuals, diagrams, and controls stay in the repository.
- Content changes increment `content_revision` and update the parent page's public `updated_at`. They do not change `tool_version`.
- Functional tool changes update `tool_version`, `tool_version_updated_at`, and the parent page's public `updated_at`.
- Repositories owned by stack127 use the internal name "stack127 repos" and `stack127_repo_*` database columns. `github_projects` remains the third-party GitHub facts table.
- `/epp-status-codes` and `/tld-directory` keep their flat URLs but move to the catalog route group.
- The first production migration adds and backfills `row_created_at` while retaining `created_at` as
  a temporary compatibility column. A later release may remove `created_at` only after the new
  application has been deployed and verified independently.

## Implementation checklist

- [x] Add failing schema, route-family, content-loading, and repository-naming tests.
- [x] Migrate `stack127_pages` to a stable numeric ID and clear public/internal timestamps.
- [x] Add and secure `stack127_tool_pages`.
- [x] Backfill every real tool and no catalog/reference routes.
- [x] Render intro and supporting Markdown on the server.
- [x] Remove page copy from tool route code after parity checks.
- [x] Move the two catalog/reference routes out of the tools source group.
- [x] Rename stack127 repo docs, scripts, templates, and package commands.
- [x] Document content-only updates, functional tool releases, and stack127 repo synchronization.
- [x] Update the affected agent skills and ownership guidance.
- [x] Run focused tests, the full test suite, a production build, two rollback-only database checks, and two omission audits.
- [x] Reconcile managed-development migration history, apply the remaining chain, and verify the final schema and seed data.

## Rollout note

`20260902080436_add_stack127_tool_pages.sql` was first validated inside rolled-back transactions, then applied to managed development. It has not yet been applied to production.

Managed development already contained the exact effects of migrations `20260822090000`,
`20260822100000`, and `20260831132300` without their history entries. Their shortcut rows,
renamed root, table columns, constraints, and indexes were checked before the official Supabase
migration-repair command marked those three versions as applied. The remaining migrations were then
applied in order with `--include-all`.

Post-migration checks found 34 valid tool rows at content revision 1 and tool version 1.0.0, no tool
rows for `/epp-status-codes` or `/tld-directory`, no public-date violations, complete resource rows,
the expected anonymous/authenticated read policy, and a fully aligned migration history.
