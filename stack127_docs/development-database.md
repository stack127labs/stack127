# Development database recovery

Development uses managed Supabase in `.env.local`. Production in `.env.database`
is the read-only recovery source. Do not start a local Supabase Docker stack.

## Refresh development

Save a development backup before replacing its website records. Run commands
from the repository root.

```bash
# Compare the 15 shared website tables without changing records.
node scripts/stack127/database/rebuild-development.mjs --verify

# Copy production website records and verify before committing the import.
node scripts/stack127/database/rebuild-development.mjs --apply --copy --verify

# Apply new forward migrations when development history is already aligned.
node scripts/stack127/database/rebuild-development.mjs --apply --migrate
```

The copy keeps development-only registry rows and the publication flags for
`platform-fees`, `ad-networks`, their child routes, and `launch-directories`.
These routes can stay visible in development while unpublished in production.
The six draft directory tables are left alone, so unfinished directory records
remain available for preview.

The script refuses identical production and development projects. It takes a
consistent production snapshot through a read-only connection, reading in small
batches. Only development can be written.

## Align old development history

Old development experiments can leave history different from production even
when the current shared schema is correct. `--migrate` stops on this drift. It
never fills old gaps by replaying historical data migrations.

After the approved forward migrations have reached production and its schema
matches development, use:

```bash
node scripts/stack127/database/rebuild-development.mjs \
  --apply --copy --verify --align-history \
  --history-backup /path/outside/repository/development-history-before.json
```

Choose a new backup filename. The script will not overwrite an existing file.
It checks the public tables, columns, constraints, indexes, functions, enums,
triggers, views, grants, and access policies. The single extra development index
`open_projects_source_model_idx` is allowed. Any other schema difference stops
alignment. Repository migration versions must exactly match production.

The verified website copy and history replacement commit in one development
transaction. The old history is saved with private file permissions before it
is replaced. This updates the history record; it does not execute old SQL.
Production history is never changed by this script.

## Data boundaries

| Data | Recovery behavior |
| --- | --- |
| Page registry, tool copy, tool catalogs | Copy production; preserve development-only routes and draft previews. |
| Self-host apps, categories, estimates, installs, GitHub metadata, candidates | Copy current production records. |
| Terminal apps and their editorial sources | Copy current production records. |
| Platform fees, launch directories, ad networks, ad publishers and relationships | Preserve development records. Use reviewed forward migrations for their schema. |
| Cache event queues | Clear during the development import. |
| RDAP cache | Leave alone. |
| Cache signing credential, Auth accounts, Vault secrets, media objects | Never copy from production. |
| Local ad network SQLite database and services | Leave alone. |

The import preserves production IDs and timestamps. It compares counts and
complete row content before committing. Only the draft routes' publication
flags are allowed to differ. Their original preview flags are also checked
before commit. Development-only registry rows remain intact.

Foreign keys are checked against the complete imported dataset. Trigger states,
constraint settings, and sequence changes are restored or advanced in the same
transaction. A failure rolls back both records and migration history.

To reload reviewed fee records after their schema is present, use
`scripts/platform-fees/sync-development.mjs --apply`. Add `--preview` to show the
fee routes in development. Its legacy `--migrate` option only validates the
schema; all migration execution belongs to the canonical recovery command.

## Connections and preview

Prefer the configured session pooler. If the production direct hostname has a
temporary DNS failure, `STACK127_SOURCE_DATABASE_ADDRESS` can supply its freshly
resolved address for one run. Do not save that address as permanent configuration.

After switching database credentials, stop the preview, remove
`.next/cache/fetch-cache`, rebuild, and restart. Restarting alone can reuse old
registry and directory records. Production media URLs remain valid references;
new uploads use development's own media bucket and credentials.
