# Clean local work and prepare production

Initial audit: 1 October 2026. This document records the starting state and the approved cleanup procedure.

## Recommended result

Commit the useful code, scripts, docs, and all three unfinished directory families. Keep platform fees, launch directories, and ad networks unpublished in production. Keep their current development previews.

After release, local `main` should match production and Git status should be clean. Further edits to the unfinished directories will then appear as new local changes.

## Starting state

| Area | Current state |
| --- | --- |
| Local Git | 18 commits behind `origin/main`. 1,299 changed or untracked files before this document. |
| Already released files | 272 files in that status already match `origin/main`. |
| Production migrations | All 185 migration versions match `origin/main`. No pending versions there. |
| Development migrations | 113 versions. 50 exist only in development; 122 production versions are missing from its history. |
| Shared database structure | Existing public columns, functions, indexes, constraints, and policies match where both databases have the same objects. Development also has six unfinished-directory tables and an extra self-host index. |
| Shared records | Self-host apps, estimates, installs, GitHub records, tool copy, and catalog records differ. Equal row counts do not mean equal data. |
| Production publication | 328 published registry rows. No registry rows for the three unfinished directory families. Their main URLs currently return 404. |
| Development publication | Platform fees: 50 published routes and 15 unpublished routes. Launch directories: one published route. Ad networks: 46 unpublished routes. |

Development has 543 platform-fee entries across 49 sections, 171 launch-directory entries, and 45 ad networks. Its ad publisher and relationship tables are empty. Ad discovery and verification continue separately in the homelab SQLite database.

## Work to do, in order

### 1. Save the current work

- Save tracked edits, untracked files, unfinished-directory records, and both migration histories before cleanup.
- Include the local ad-network SQLite database and its worker settings in the backup.
- Keep backups and real environment files outside Git. Check that the saved files can be read before removing anything.

### 2. Bring local code onto the released version

- Start from current `origin/main`, presently `425a0fb7`.
- Carry genuine local edits forward and resolve files changed on both sides.
- Preserve released SaaS and KDP tools, cache fixes, generated route layouts, and the self-host release.
- Keep the latest production versions of shared cache code, registry code, `package.json`, `next.config.ts`, `Dockerfile`, and release workflows. Merge only the intended new additions into them.
- Avoid copying the whole old local tree over current production. That would remove newer released work.

### 3. Keep useful files and remove leftovers

| Files | Action |
| --- | --- |
| Page code, required images, reusable scripts, focused tests, docs, and skills | Review and commit with their feature. |
| Self-host progress CSV and its source batches | Keep together. The tracker cites 213 currently untracked batch files. Preserve those references. |
| Superseded SQL and unused research outputs | Archive outside the active migration folder; remove only after checking references and unfinished research. |
| Generated logs, screenshots, temporary previews, and duplicate backups | Remove once their useful information is saved. Ignore future temporary output. |
| `dev-space/fee-icons` | It is a convenience symlink to real public icons. Keep the required icons; remove the duplicate shortcut if unused. |

Do not hide whole source, docs, or migration folders with `.gitignore`.

### 4. Keep one migration history

- Keep the 185 canonical production migration files unchanged.
- There are 140 untracked SQL migrations locally: 121 self-host, 18 unfinished-directory, and one cache-worker migration.
- 115 are exact copies of canonical production files, often under different timestamps. Three more self-host files differ only in comments or whitespace.
- Archive the old local copies instead of replaying them. Four remaining self-host files contain substantive differences, including old Locust guards, a license change, a separate install draft, and broken ddrescue links. Preserve them for review without applying them.
- Resolve the duplicate timestamp `20260930120000`, currently used by both platform fees and a self-host batch.
- Replace the 18 directory experiments with fresh migrations for the final ad-network, platform-fee, and launch-directory structures and saved draft data. Create their timestamps with the Supabase CLI.
- Build the final platform tables directly. Its old sequence creates and drops six retired tables and later requires non-null cards without filling them first.

Production's history is already consistent. It does not need a reset or a squash. Supabase's [migration documentation](https://supabase.com/docs/reference/cli/supabase-migration-squash) explains that squashing omits data changes, which these migrations rely on.

### 5. Align development and production data

- Compare shared record differences. Promote intentional, reviewed changes only; preserve newer production values. Self-host research stays paused.
- Save the six unfinished-directory tables and their development registry settings separately.
- Refresh shared development website records from the resulting production baseline, using the recovery script's explicit table scope.
- Update the recovery process to handle the canonical history and new directory migrations safely. Do not run its current `--migrate` option against the unreconciled folder: that would replay historical data changes.
- Align development history after verifying the restored data and schema. History repair changes bookkeeping only; it does not apply SQL. See [Supabase migration repair](https://supabase.com/docs/reference/cli/supabase-migration-repair).
- Restore development previews and draft records. Preserve Auth, environment secrets, Vault credentials, media, and the independent SQLite workers.
- Confirm both databases have the same canonical migration versions. Development can retain its explicit preview publication settings.

### 6. Deploy the unfinished directories while keeping them hidden

- Commit their pages, supporting libraries, icons, scripts, docs, and tests.
- Add their registry rows with `is_published=false` in production, including child routes. There are currently 112 development registry rows across these families.
- Preserve the existing 328 published production routes. Do not copy development publication flags into production.
- Keep draft tables private. The old platform-fee migration grants public API reads regardless of page publication; replace that policy before importing draft data.
- Remove automatic schedules from the two new ad-network workflows and keep them manual with writes disabled until the pipeline is deliberately activated. The current files schedule production database writes weekly and four times daily.
- Update hard-coded migration references in the development recovery and platform-fee sync scripts to the canonical workflow.

The pages already check the publication registry before reading content. The registry protects page visibility; database permissions and worker schedules need their own settings.

### 7. Check and release

- Review the complete release diff and pending migration list. Only the new approved migrations should be pending on production. A migration dry run lists files; it does not prove their SQL succeeds.
- Verify the new migrations and draft records in managed development first. Check grants, constraints, counts, and source links.
- Run `npm run quality`, focused checks for changed data handling, and one production build. Check affected pages at desktop and mobile widths.
- Run the production preflight, commit reviewed files, and push to `main` for the OVH release workflow.
- Confirm local `HEAD`, `origin/main`, deployed image SHA, and live health SHA match.
- Check live published pages, robots, and sitemap. Confirm all unfinished directory routes return 404, stay out of navigation and sitemap, and have no public draft-data access.

### 8. Finish local cleanup

- Put the main checkout on the verified released commit while preserving any edits made during the release.
- Confirm migration versions have no duplicates or missing entries, and neither database has unexplained pending migrations.
- Remove saved leftovers only after checking the backup, progress references, and draft previews.
- Restart the development preview with fresh database caches and give the current Tailscale link.
- Confirm Git status is clean. Keep the three directory projects unpublished until their separate launch review.

## Backups and completion checks

Backups and superseded files are saved in `/home/teja/backups/stack127/20261001-cleanup/`. The source archive and SQLite backup were checked. The database backups preserve the original 113 development and 185 production migration records.

The release adds three canonical directory migrations, giving 188 versions after alignment. Completion requires clean local Git, matching release revisions, 328 published production routes, 112 unpublished draft registry rows, and the original 51 development preview routes preserved. The six draft tables must have no public grants or read policies.

Self-host research remains paused. Publishing the unfinished directories and activating production ad-network workers are separate decisions.
