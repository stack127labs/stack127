# Tool page data model migration

Status: repository implementation complete on 2 September 2026. Database rollout is pending.

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

## Rollout note

`20260902080436_add_stack127_tool_pages.sql` has been validated against managed development inside transactions that were rolled back. It has not been applied to development or production.

Managed development has older migration-history entries still marked pending, including shortcut, storage, self-host app, and resource-row migrations. At least one of those older migrations conflicts with data already present when replayed as a chain. Do not run a blanket migration push. Reconcile the older history first, then apply this migration in order and verify the 34 tool rows before deploying the application code.
