# Development database recovery

Development uses the managed Supabase project in `.env.local`. Production, in `.env.database`, is the read-only source for recovery. Don't start a local Supabase Docker stack.

## Refresh development

Save a development backup before you replace its website records. Run commands from the repository root.

```bash
# Compare the 15 shared website tables without changing records.
node scripts/stack127/database/rebuild-development.mjs --verify

# Copy production website records and verify before committing the import.
node scripts/stack127/database/rebuild-development.mjs --apply --copy --verify

# Apply new forward migrations when development history is already aligned.
node scripts/stack127/database/rebuild-development.mjs --apply --migrate
```

The copy keeps:

- Development-only registry rows.
- The publication flags and dates for `platform-fees`, `ad-networks`, their child routes, and `launch-directories`. These routes can stay visible in development while unpublished in production.

It leaves the six draft directory tables alone, so unfinished directory records stay available for preview.

The script refuses to run if production and development are the same project. It reads a consistent production snapshot in small batches over a read-only connection. It can only write to development.

## Align old development history

Old development experiments can leave history that differs from production, even when the current shared schema is correct. `--migrate` stops when it finds this drift. It never fills old gaps by replaying historical data migrations.

Once the approved forward migrations have reached production, and production's schema matches development, run:

```bash
node scripts/stack127/database/rebuild-development.mjs \
  --apply --copy --verify --align-history \
  --history-backup /path/outside/repository/development-history-before.json
```

Pick a new backup filename. The script won't overwrite an existing file.

It checks the public tables, columns, constraints, indexes, functions, enums, triggers, views, grants, and access policies.

- The one extra development index, `open_projects_source_model_idx`, is allowed.
- Any other schema difference stops alignment.
- Repository migration versions must match production exactly.

The verified website copy and the history replacement commit in one development transaction. The old history is saved with private file permissions before it's replaced.

This updates the history record. It doesn't run old SQL. The script never changes production history.

## Data boundaries

| Data | Recovery behavior |
| --- | --- |
| Page registry, tool copy, tool catalogs | Copy production; keep development-only routes and draft previews. |
| Self-host apps, categories, estimates, installs, GitHub metadata, candidates | Copy current production records. |
| Terminal apps and their editorial sources | Copy current production records. |
| Platform fees, launch directories, ad networks, ad publishers and relationships | Keep development records. Use reviewed forward migrations for their schema. |
| Cache event queues | Clear during the development import. |
| RDAP cache | Leave alone. |
| Cache signing credential, Auth accounts, Vault secrets, media objects | Never copy from production. |
| Local ad network SQLite database and services | Leave alone. |

The import keeps production IDs and timestamps. While development is ahead, the copy accepts these specific column transitions: catalog card renames, catalog heading conversion to `title`, renamed `intro_markdown` and `display_order`, optional catalog `content_markdown`, removed catalog section headings and duplicate hero art, directory card additions, removed tool and directory `content_revision`, and added registry `is_indexable`. Legacy registry snapshots default to indexable. Other column and type differences still fail. Full schema checks for history alignment remain strict.

Development-only directory record comparison state is preserved and its page IDs are remapped during a copy. It is never copied from production. Before committing, it compares counts and full row content.

Only the draft routes' publication flags, publication dates, and update dates may differ. Their original preview settings are also checked before commit. Development-only registry rows stay intact.

Foreign keys are checked against the full imported dataset. Trigger states, constraint settings, and sequence changes are restored or advanced in the same transaction. If anything fails, both the records and the migration history roll back.

To reload reviewed fee records once their schema exists, run `scripts/platform-fees/sync-development.mjs --apply`. Add `--preview` to show the fee routes in development.

Its legacy `--migrate` option only validates the schema. All migration runs belong to the main recovery command above.

## Connections and preview

Use the configured session pooler when you can.

If the production direct hostname has a temporary DNS failure, set `STACK127_SOURCE_DATABASE_ADDRESS` to its freshly resolved address for one run. Don't save that address as permanent config.

After you switch database credentials:

1. Stop the preview.
2. Remove `.next/cache/fetch-cache`.
3. Rebuild.
4. Restart.

A restart alone can reuse old registry and directory records.

Production media URLs stay valid references. New uploads use development's own media bucket and credentials.
