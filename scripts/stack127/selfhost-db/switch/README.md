# Database switch scripts

These scripts belong at the authorized switch, not in `supabase/migrations`: a normal release must not stop the live managed worker before the replacement is ready. Apply them manually with a trusted database administrator, separately on each database. They never run as part of deployment.

`010_retire_supabase_cache_worker_wake.sql` unschedules only `stack127-cache-worker`, removes its HTTP wake trigger, replaces its wake function with a no-op, clears the wake URL, and deletes queued pg_net requests addressed to that function. It preserves ordinary event triggers, queue rows, credentials, fingerprints, and the existing lease. It works without pg_cron or pg_net and can be repeated. Verification occurs before commit and raises an error on incomplete retirement.

## Switch order

1. Prepare the OVH files and environment below, leaving the timer disabled. Rehearse the restore with copied cron jobs disabled and no outgoing pg_net processing.
2. At the authorized cutover, freeze writers, pause cache maintenance/acknowledgement workflows, and run the SQL on the source. Disable/delete the old Edge Function or otherwise prevent direct invocation. Drain in-flight requests and runs and wait out its 150-second lease. The SQL does not cancel requests already sent or stop manual function invocation.
3. Take the final copy and restore it on OVH. Run the SQL on the restored target before any test mutation or worker run. Expect `NOTICE: Cache worker wake retired; cron jobs: 0`. The old wake must also be disabled on every rehearsal copy before mutations.
4. Change the app, worker, and GitHub maintenance connections to OVH and validate real SQL reads. Preserve the signing key in `public.stack127_cache_credentials`. Do not reset or shorten a copied lease.
5. Run a dry run, then enable the timer only at the switch. Verify one controlled update through refresh/build and acknowledgement, then resume writers and the GitHub fallback. Keep the source frozen for rollback.

Apply the SQL from an administrator session without putting the connection string in shell history or output. For a configured libpq service:

```bash
psql 'service=stack127_target' -X -v ON_ERROR_STOP=1 -f scripts/stack127/selfhost-db/switch/010_retire_supabase_cache_worker_wake.sql
```

## OVH worker

The one supported schedule is the systemd timer under `scripts/stack127/cache/ovh/`. Do not also install a cron line. The Node process uses the same 150-second database lease as the Edge Function and maintenance fallback; the wrapper adds a host flock shared with manual invocations. Node stops after 120 seconds, before that lease expires, and the service provides another process limit.

Use the existing OVH checkout at `/srv/stack127`, with production dependencies installed and Node 22.6 or newer. Install the two unit files into `/etc/systemd/system/` and run `sudo systemctl daemon-reload`. Do not enable or start them during preparation. Nothing in this change installs or activates a service.

Create `/srv/stack127-data/cache-worker.env` privately, owned by `ubuntu:ubuntu` with mode `0600`. Use dotenv syntax; the wrapper passes it to Node rather than sourcing it as shell code. Never print its contents. The `ubuntu` user also needs write access to `/srv/stack127-data/cache-worker.lock`.

| Variable | Needed | Use |
| --- | --- | --- |
| `DATABASE_URL` | Always | OVH SQL URL for a trusted worker role with queue/state/observation/processed access, credential SELECT, source SELECT, sequence usage, and execution of revision/enqueue functions (plus `cron.job` SELECT if pg_cron remains installed). Preserve RLS access deliberately. |
| `STACK127_SITE_URL` | Optional | Defaults to `https://stack127.com`. |
| `STACK127_FRONTEND_HOSTING` | Match the app and GitHub | `cloudflare` dispatches the static frontend workflow; otherwise legacy mode. |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` | Legacy mode | Purges tags after verified origin refresh. |
| `GITHUB_FRONTEND_TOKEN` | Cloudflare mode | Scoped Actions read/write token for dispatch. |
| `GITHUB_FRONTEND_REPO` | Optional | Defaults to `stack127labs/stack127`. |
| `GITHUB_ALERT_TOKEN` | Needed for remote alerts | Scoped Issues write token for `stack127labs/stack127`; absent token logs skipped alerts. |
| `CACHE_WORKER_DRY_RUN=1` | Preview only | Reads ready events and wake wiring; no lease, writes, reconciliation, dispatch, or alerts. Remove for normal operation. |

Cloudflare mode does not need Cloudflare API credentials in this worker. GitHub owns build/deploy/API refresh/public verification and acknowledgement. Dispatch never counts as content success. No Supabase API/JWT secrets are used.

At step 5, as `ubuntu`:

```bash
CACHE_WORKER_DRY_RUN=1 /srv/stack127/scripts/stack127/cache/ovh/run-worker.sh
```

After validating the switch, the coordinator enables it:

```bash
sudo systemctl enable --now stack127-cache-worker.timer
sudo systemctl status stack127-cache-worker.timer
sudo journalctl -u stack127-cache-worker.service --since '5 minutes ago'
```

Legacy runs settle edits for 10 seconds, capped at 60; static frontend dispatch settles for 60 seconds, capped at five minutes. Both retain 15-second, one-minute, then five-minute retries and 15-minute source reconciliation. Alerts open after five minutes in legacy mode or 30 minutes in Cloudflare mode and close after recovery. Event IDs and microsecond timestamps remain text until SQL compares them, so newer edits remain queued.

`status.mjs` still derives legacy `enabled` and reliability gates from the retired wake URL. That is conservatively false after cutover and leaves the GitHub fallback enabled; it is not proof that the Node worker stopped. Use the timer journal and `last_run_at`/queue age for this handoff. Updating those legacy gates is separate work.
