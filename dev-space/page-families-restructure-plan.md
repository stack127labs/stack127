# Page families restructure to-do

This plan joins directories and references, makes page family names match across the database and code, and moves tool code out of the catalog folders.

## Decisions

- Every page keeps the sidebar. Sidebars are for options, moving between related pages, or jumping to page sections. Reading content never goes in them. The rule is in `stack127_docs/design-system.md` under Sidebars.
- Page families are `tool`, `directory`, `course`, `catalog`, and `site`. `site` replaces `info` and `legal` and covers the homepage, about, privacy, terms, and labs. The code uses the same words.
- References join directories. There is no separate reference family.
- `stack127_pages` is only the registry for URL, publication, SEO, and dates.
- Each family has its own page table for page-specific columns:
  - `stack127_tool_pages` for tools.
  - `stack127_directory_pages` for directories: title, intro, Markdown content, card name, and card description.
  - `stack127_catalog_pages` for catalogs. This is the existing `stack127_tool_catalogs`, renamed, with card name and card description added.
- Directory page copy lives in the database. Directory records live in code when the set is small, edited by hand, and rarely changes. They live in a table when the set is large or a script updates it. Decide this in the directory's brief when it's created.
- Published, indexable directory child pages, such as `/ad-networks/adapex`, get their own `stack127_directory_pages` row.
- TLD and EPP keep the domain tools sidebar. They import it from its new place under `(tools)/(domain)/`.

- `site` pages live in one `(site-pages)` route group: home, about, privacy, terms, and labs.
- No compatibility views or old family values. Nothing else runs on the development database during this work, and the code and database ship together.

## To-do

### Phase 1: Move files. No visible change, no database work.

- [x] 1. Move the DNS tool files out of `(catalogs)/dns-tools/` into `(tools)/(dns)/`: `diagnostic-result-ui.tsx`, `dns-tools.css`, `dns-diagnostics.module.css`.
- [x] 2. Move the domain tool files out of `(catalogs)/domain-tools/` into `(tools)/(domain)/`: `domain-lookup-client.tsx`, `domain-tools.css`, `domain-tools-sidebar.tsx`, `domain-catalog-reference.tsx`.
- [x] 3. Move `(catalogs)/storage-tools/storage-tools.module.css` into `(tools)/(storage)/`.
- [x] 4. Move tool shell code from `app/ui/catalogs/` into `app/ui/tools/`: `tool-page-shell.tsx` and `tool-family-sidebar.tsx`. Leave the files that are really catalog files in place.
- [x] 5. Move `(catalogs)/_components/art/` to a shared folder such as `app/ui/art/`. Update its imports in `lib/tool-catalog-art.ts`, `app/marker-art-registry.ts`, the homepage, and the component gallery.
- [x] 6. Update the marker-art skill paths.
- [x] 7. Run `npm run quality` and `npm run build`.

### Phase 2: Join directories and references. No database work.

- [x] 8. Move `(references)/*` into `(directories)/`, and `app/ui/references/` into `app/ui/directories/`. URLs don't change.
- [x] 9. Point TLD and EPP at the moved domain sidebar and `StatePill`.
- [x] 9a. Move `(home)`, `labs`, and `(legal)/*` into one `(site-pages)` group. URLs don't change.
- [x] 10. Update `scripts/stack127/agents/lanes.mjs` if it maps the old folders.

### Phase 3: Sidebar cleanup. Opus.

- [x] 11. Take reading content out of the sidebars on `/ad-networks`, `/self-host-apps`, `/software-licenses-for-self-hosting`, and the `InfoPage` shell used by Labs. Give each sidebar a real job or use related-page links.

### Phase 4: Database. Sol, with a migration and backfill.

- [x] 12. Change the `page_family` check to `tool`, `directory`, `course`, `catalog`, `site`. Move existing rows over: directories and references go from `catalog` to `directory`, and `info` and `legal` go to `site`.
- [x] 13. Rename `stack127_tool_catalogs` to `stack127_catalog_pages`, and add `card_name` and `card_description`.
- [x] 14. Create `stack127_directory_pages` with `page_id`, `title`, `intro_markdown`, `content_markdown`, `content_revision`, `card_name`, `card_description`, and a row-update time.
- [x] 15. Backfill directory rows from the copy currently in code, including rows for published child pages.
- [x] 16. Keep `stack127_pages` as only the registry: slug, published flag, SEO, and dates. Check that no family-specific column is left in it.

### Phase 5: Code that reads families and content. Sol.

- [x] 17. Update `lib/page-registry.ts`, `lib/page-source.ts`, `lib/tool-catalogs.ts`, `lib/tool-pages.ts`, and `app/api/cache/refresh/route.ts` for the new family names and tables. That also removes the `has_catalog_content` workaround.
- [x] 18. Add a `lib/directory-pages.ts` reader. Directory pages render their title, intro, and Markdown from the database, and their records from code or a table.
- [x] 19. Make the homepage read card names and descriptions from the three page tables.
- [x] 20. Update scripts that write `page_family`, such as `scripts/platform-fees/sync-development.mjs` and the `preview-local-page.mjs` scripts. Update the development database rebuild too.
- [x] 21. Add a cache tag and revalidation for directory page edits.

### Phase 6: Docs and skills. Opus writes, Sol checks the tables.

- [x] 22. `page-families.md`: four content families plus `site`, the sidebar rule, and the code-or-table rule for directory records.
- [x] 23. `tool-pages.md` and `tool-catalogs.md`: new family names and the renamed catalog table.
- [x] 24. Add a new `directory-pages.md`, shaped like `tool-pages.md`.
- [x] 25. Update `CLAUDE.md`, `AGENTS.md`, `repo-structure.md`, `caching.md`, `seo.md`, and the `page-build` skill to remove `(references)` and the old family names.

### Phase 7: Release.

- [ ] 26. Sol review, then apply the migration in development and check the pages.
- [ ] 27. Production migration and deploy, after the user approves them.
  - The release workflow applies the migration, then builds and deploys the new image, then updates the `cache-worker` function. This release changes `supabase/functions` and `lib/cache-tags.ts`, so the worker update runs automatically.
  - For the few minutes between the migration and the new image going live, the old app still serves the site. Pages it already cached keep working. Uncached catalog and homepage requests fail, and page edit events fail in the old worker.
  - Release at a quiet time, and don't edit page data during the release. Once the release finishes, check the homepage, one catalog, one directory, and one tool page, and confirm the purge and warm step passed.

Phases 1 to 3 are low-risk and can ship first. Phases 4 and 5 should go out together, because the code and the database have to agree on the family names.
