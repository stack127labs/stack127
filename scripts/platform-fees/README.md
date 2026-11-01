# Platform fee records

Run from the repository root. `sync-dataset.mjs` validates `data/directory.json`
before connecting. It reports every section and entry as insert, update (with
changed field names), delete, or unchanged. Preview uses a read-only transaction.

```bash
node --experimental-strip-types scripts/platform-fees/sync-dataset.mjs --environment development
node --experimental-strip-types scripts/platform-fees/sync-dataset.mjs --environment production --confirm stack127-production
node --experimental-strip-types scripts/platform-fees/sync-dataset.mjs --environment production --confirm stack127-production --apply
```

Connections follow the shared importer: development reads `.env.local`, production
reads `.env.database`, preferring `DATABASE_POOLER_URL` over `DATABASE_URL`.
Production preview also requires the confirmation flag. No credentials are printed.

Apply locks both record tables, checks for deletions, and syncs in one transaction.
Any failure rolls back. Missing records cause a refusal before any write unless
`--allow-delete` is also passed. The wording release needs no deletions; stop and
check the preview if it shows any. This command never calls `ensurePlatformFeePages`
or inserts page rows. Existing triggers may update public dates and queue refreshes.

Changed records use the existing `stack127_touch_directory_records` triggers to
queue `platform_fees` events. The cache worker maps these to
`stack127-platform-fees` in `scripts/stack127/cache/targets.mjs`. Triggers stay enabled;
no separate tag refresh call is needed. Identical records don't queue changes.
In Cloudflare hosting mode, the worker dispatches `stack127-frontend-refresh.yml`;
wait for that run to finish and verify the changed public pages before calling the
release complete. A failed refresh leaves events queued. The import's success only
confirms the database commit. See [caching](../../stack127_docs/caching.md) and
[Cloudflare database edits](../../stack127_docs/cloudflare.md#database-edits-in-cloudflare-mode).

`sync-development.mjs` remains the development page setup command; it can create
missing page rows. Use the records-only command above for reviewed dataset imports.
