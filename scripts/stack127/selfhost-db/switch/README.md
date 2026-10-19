# Database switch scripts

SQL that must run at one exact moment of the move from managed Supabase to the self-hosted Postgres on the OVH server. These files are not migrations. The release workflow never applies them. Run each one by hand, in number order, with `psql` against the database named in its header, and keep the verification output.

| File | Runs on | When |
| --- | --- | --- |
| `010_retire_supabase_cache_worker_wake.sql` | The new database, right after the restore. Also the old Supabase database once traffic has moved. | Before the cache worker cron job starts. |

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/stack127/selfhost-db/switch/010_retire_supabase_cache_worker_wake.sql
```

## Cache worker after the switch

The Supabase Edge Function `cache-worker` is woken by pg_cron and pg_net from inside the database. Neither exists after the move, so the same work runs as a Node job from cron on the OVH server: `scripts/stack127/cache/worker.mjs`.

Order at switch time:

1. Stop writes and restore the database on OVH.
2. Run `010_retire_supabase_cache_worker_wake.sql` on the new database. The verification row must show `false`, `false`, `false`, `0`.
3. Point the app and jobs at the new database.
4. Install the cron line below. The first run refuses to work until step 2 is done, so the order cannot be skipped by mistake.
5. Run the same SQL on the old Supabase database, then remove the function secrets there.

Cron line on OVH, as the `ubuntu` user, with the env file at mode 600:

```cron
CRON_TZ=UTC
* * * * *  cd /srv/stack127 && set -a && . /srv/stack127-data/cache-worker.env && set +a && flock -n /tmp/stack127-cache-worker.lock node --experimental-strip-types scripts/stack127/cache/worker.mjs >> /srv/stack127-data/logs/cache-worker.log 2>&1
```

Environment for `/srv/stack127-data/cache-worker.env`:

| Variable | Needed | Use |
| --- | --- | --- |
| `DATABASE_URL` | Always | The self-hosted Postgres. `DATABASE_POOLER_URL` is accepted as a fallback. |
| `STACK127_SITE_URL` | Optional | Defaults to `https://stack127.com`. |
| `STACK127_FRONTEND_HOSTING` | Match the GitHub variable | `cloudflare` makes the worker dispatch `stack127-frontend-refresh.yml`. Anything else is legacy mode. |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` | Legacy mode | Purges Cloudflare tags after the origin verified fresh content. |
| `GITHUB_FRONTEND_TOKEN`, `GITHUB_FRONTEND_REPO` | Cloudflare mode | Checks for active runs and dispatches the frontend refresh. Repo defaults to `stack127labs/stack127`. |
| `GITHUB_ALERT_TOKEN`, `GITHUB_ALERT_REPO` | Optional | Opens a GitHub issue when updates wait too long, and closes it on recovery. Without the token the alert is logged and skipped. |
| `CACHE_WORKER_DRY_RUN=1` | Optional | Reports ready events and whether the Edge Function wiring is gone. Takes no lease and changes nothing. |

The signing key for `/api/cache/revalidate` and `/api/cache/refresh` is read from `public.stack127_cache_credentials`, as before. It is never an environment variable.

Check it after the first minute:

```bash
CACHE_WORKER_DRY_RUN=1 node --experimental-strip-types scripts/stack127/cache/worker.mjs
node scripts/stack127/cache/status.mjs
```

`status.mjs` still reports `enabled` from `function_url`, which is now null. Update it after the switch so the GitHub backup gates read `last_run_at` instead.
