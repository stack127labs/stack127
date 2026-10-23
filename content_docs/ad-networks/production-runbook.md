# Ad-network production runbook

Ad-network collectors, syncs, snapshots, and backups run as cron jobs on OVH. Daily niche sorting runs on homelab. The directory, stats, 21 niche pages, 44 network pages, and checker were published on October 21, 2026. Snigel stays retired and returns 404. Automation updates existing pages; it does not publish new ones.

Cron is running again since October 20, 2026, 15:00 UTC, on self-hosted Postgres 17. It was paused from October 19, 12:15 UTC, until the sync sent only changed rows. History: [OVH cron plan](../../dev-space/ad-networks-ovh-cron-plan.md).

## Where things live

On OVH (`ssh ovh`, user `ubuntu`, UTC):

- `/srv/stack127`: checkout of released `main`, Node 22 or newer, production npm dependencies.
- `/srv/stack127-data/ad-networks.env`: mode 600, shell-sourced variables. Values may be double-quoted, for example `AD_NETWORKS_RUNTIME_ENVIRONMENT="production"`.
- `DATABASE_POOLER_URL`: direct connection to `127.0.0.1:5432`, database `postgres`, login `stack127_app`. There is no PgBouncer.
- `/srv/stack127-data/ad-networks.sqlite`: working store, including full evidence.
- `/srv/stack127-data/state/sync-state.sqlite`: hashes of committed batches, separated by database target. Keep this file between jobs.
- `/srv/stack127-data/state/`: progress, fetch throttle, and `backups/` with seven SQLite copies.
- `/srv/stack127-data/logs/<job>.log`: logs, rotated weekly by `/etc/logrotate.d/stack127-ad-networks`.

The env file also sets `GITHUB_ALERT_TOKEN`, `AD_NETWORK_DB_PATH`, and `AD_NETWORKS_STATE_DIRECTORY`. Never print it. Homelab owns env values; Mac copies must not be edited.

The wrapper is [`run-job.sh`](../../scripts/ad-networks/ovh/run-job.sh). The full schedule is [`crontab.txt`](../../scripts/ad-networks/ovh/crontab.txt). Homelab's `stack127-ad-network-niche.timer` runs daily at 06:00 UTC (11:30 IST), with up to 3,000 sites per run.

## Counts in titles and headings

The approved titles and headings use rounded site counts. The existing revalidation step refreshes only those count tokens from the target database, including decreases. The cache worker repeats this before processing ad-network events, so a stopped sync or direct data import can recover through the durable queue. No separate schedule is needed.

Editorial wording stays in the page tables. The count refresher recognizes only the approved page and phrase combinations. Descriptions use no site-count snapshots. Publir, EthicalAds, Concert, Sovrn, and Media.net keep their approved count-free titles and headings. The 20-niche taxonomy stays fixed. A refresh within the same rounding bucket makes no page-field update.

Before the new copy is published, older wording is skipped. If a page matches only part of the approved count phrases, the refresh fails and rolls back rather than rewriting its words. Counts below ten lose their numeric prefix and can regain it when the count recovers.

Before preparing a publication plan, render its desired count tokens from that target's current data. Keep the publisher's exact conflict checks: if a scheduled refresh changes a frozen row, prepare a new plan. Check the live page after publishing. A static rebuild still takes several minutes, so data and heading changes reach the public site through the normal verified refresh process.

Restoring an older plan also refuses to overwrite newer count changes. To recover old wording after that conflict, prepare a new plan with the previous wording and current counts. Do not force an old numeric snapshot back into the page tables.

## How a job runs

Collectors use HTTP and SQLite without holding a production connection. Sync then opens one connection, takes the existing runtime and reviewed-sync locks, and pins a read-only SQLite view. It sends only rows whose compact contents differ from the last successful sync. Before each target batch, its old hashes are durably invalidated. New hashes are saved after that batch commits. An interrupted sync cannot reuse an obsolete hash, even if the source later returns to its old value.

Sync captures daily counts and arrival observations, then closes its connection. `revalidate.mjs` refreshes the 70 ad-network paths. It leaves durable queue events for the Node cache worker to verify and acknowledge. Neither step publishes pages. A relationship batch checks and locks its target parents before writing. Missing parents fail the sync; use `sync --full` to repair them before retrying.

- Exit 75 means the sync lock is held. Scheduled jobs retry every minute for up to six hours, skipping the collector on retries.
- Verification yields while a scheduled job waits. Its local checkpoints will be picked up by the next sync.
- Exit 76 means the same job is already running under `flock`.
- Niche imports use the reviewed-sync lock and preserve existing labels during collector syncs. Model calls retry once, then split failed batches from 100 to 50 to 25 sites. Valid partial answers are saved before retrying the missing sites.
- Niche sorting stops on operator signals, database failures, login failures, or Claude usage limits. Wait for a subscription limit to reset; do not enable paid extra usage. Keep the existing checkpoint files when resuming.
- Niche status reports `candidates`, `classified`, `imported`, `withheld`, and `unresolved`. A run with unresolved sites reports `partial` and keeps its failure alert open; those sites remain eligible for the next run. CLI diagnostics are bounded and sanitized.
- Failures open one GitHub issue per job. The next successful run closes it.

Verification runs at minute 40 each hour, with four workers, a 1,000-site limit, and a ten-minute budget. Daily jobs start at 00:10, 01:00, 02:00, 03:00, and 05:00 UTC. Weekly discovery and publisher-name jobs, and monthly traffic, start at 04:00 UTC.

## What stays in production

Publisher evidence keeps `manager_domains` and `confirmed_networks`, plus four homepage fields used by niche sorting: `title`, `description`, `h1`, and `language`. Relationship evidence keeps `manager_domain`, `matched_signal`, `checked_url`, `checked_at`, and `parser_version`. The last three are required confirmation metadata. These preserve existing manager resolution, observations, and database constraints.

Full fetch diagnostics, redirects, seller records, parser errors, and traffic evidence stay in SQLite. `discovery_sources` keeps compact `source_key` attribution, which preserves the discovered/checker weekly chart. Source URLs, domain spellings, licenses, and collection dates stay local. Page facts, complete seller-domain summaries, bounded ads.txt previews, names, platforms, dates, traffic groups, and favicons keep their existing behavior. Existing target niches are never replaced by a collector sync.

Read-only checks on October 20 found `stack127_app` has the required table, identity-sequence, and function grants, with `stack127_backend_access` RLS policies. PostgreSQL planned all five sync write paths as that login without executing them. No change to `app-role.sql` is needed. Development tests execute the real upserts against temporary copies of the production schema, including checks and generated columns.

Production measured 627 MB: publishers 383 MB, relationships 116 MB. Its 107,146 publishers held 162 MB of check evidence; 114,284 relationships held 58 MB. Projecting existing values gives about 38 MB of publisher evidence and 25 MB of relationship evidence. Evidence alone can save about 157 MB of live column data. Full source lists occupied another 34 MB; compact attribution retains part of that, so source savings need a separate measurement. Table files and indexes are separate from this estimate.

The separate [`trim-production-evidence.sql`](../../scripts/ad-networks/trim-production-evidence.sql) clears existing unused values in batches. It preserves every retained field and never runs automatically. The first full sync also replaces evidence for its reviewed cohort; the SQL handles old rows outside that cohort and source lists. Neither has been run against production during implementation.

Ordinary vacuum makes dead space reusable; it does not generally shrink files on disk. A disk-reclaiming rewrite needs a separately reviewed maintenance window. See [Postgres vacuum behavior](https://www.postgresql.org/docs/17/routine-vacuuming.html).

## Resume after release

The coordinator performs these steps after review and release authorization. Keep cron removed and pause homelab's niche timer while doing the first sync.

1. Confirm the latest database backup and SQLite backup are usable. Wait for any old ad-network processes to stop. Keep the existing OVH working store.
2. Update OVH to the reviewed release:

   ```bash
   ssh ovh 'cd /srv/stack127 && git pull --ff-only && npm ci --omit=dev --ignore-scripts && git rev-parse HEAD'
   ```

   Check that SHA against the released revision. Check the env target privately: `AD_NETWORKS_RUNTIME_ENVIRONMENT=production`, loopback port 5432, and login `stack127_app`. Source it with `set -a; . /srv/stack127-data/ad-networks.env; set +a`. Do not use a parser that leaves surrounding quotes in values.
3. If the separate evidence cleanup is approved, run its SQL as the database administrator. Each pass selects at most 5,000 keys per table before projecting JSON. Temporary cursors advance in one database session, including through unchanged batches. Stop when both scanned counts are zero, even if earlier trimmed counts were zero. For example, on OVH from `/srv/stack127`:

   ```bash
   set -euo pipefail
   for pass in $(seq 1 30); do
     cat scripts/ad-networks/trim-production-evidence.sql
   done | sudo -n docker exec -i --user postgres stack127-db psql -X -U supabase_admin -d postgres -v ON_ERROR_STOP=1
   ```

   Thirty passes cover the measured table sizes. Require final `publishers_scanned=0` and `relationships_scanned=0`. If more rows exist, increase the pass count and rerun; reconnecting safely starts the scan over. Do not run each pass in a fresh session.

   After the final batch, run ordinary `VACUUM (ANALYZE)` on the two tables as the administrator. Do not run `VACUUM FULL` as part of resume.
4. Refresh the local catalog, then establish and check the new sync baseline:

   ```bash
   ssh ovh 'cd /srv/stack127 && node --experimental-strip-types scripts/ad-networks/catalog.mjs --local-database /srv/stack127-data/ad-networks.sqlite --apply'
   ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh sync --full'
   ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh sync'
   ```

   The second sync should report `publishers_sent:0` and `relationships_sent:0` if SQLite has not changed. Both must report `synced:true` and `revalidated:true`. There is no need to reseed niches from the old store.
5. Run the small collector checks and backup:

   ```bash
   ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh platform --limit 1 --time-budget-minutes 1'
   ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh verification --limit 1 --time-budget-minutes 1'
   ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh snapshot'
   ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh backup'
   ```

   Check the job logs and Node cache-worker service. The queue must drain without retries or permission errors. Check `/ad-networks`, `/ad-network-checker`, and an existing network child URL: all must return 200. `/ad-networks/snigel` must return 404.
6. Install the new schedule and re-enable the niche timer:

   ```bash
   ssh ovh 'crontab /srv/stack127/scripts/ad-networks/ovh/crontab.txt && crontab -l'
   ssh homelab 'systemctl --user enable --now stack127-ad-network-niche.timer && systemctl --user list-timers stack127-ad-network-niche.timer'
   ```

   Confirm verification starts at minute 40. Do not install the saved five-minute schedule.
7. Check connections, table sizes, queue age, logs, and disk space after the first hour and first day. Collectors should hold no production session; each sync uses one. Compare the live revision and publication responses again.

A local synthetic benchmark scanned 107,146 publishers and 114,284 relationships in 12.4 seconds with no changed rows, zero row payloads, and 12 SQL calls. PostgreSQL responses were simulated; this measures the SQLite scan and hash work. Measure actual OVH sync time during step 4. The old no-change sync took about 12 minutes.

## Routine checks and recovery

```bash
ssh ovh 'crontab -l; tail -3 /srv/stack127-data/logs/verification.log; ls -l /srv/stack127-data/state/backups'
ssh homelab 'systemctl --user list-timers stack127-ad-network-niche.timer; cat ~/.local/state/stack127/ad-networks-niche/niche-status.json'
```

Pause OVH with `crontab -r` and wait for running jobs to finish. Pause homelab with `systemctl --user disable --now stack127-ad-network-niche.timer`. Killed verification claims become available after their 70-minute leases expire.

After a code release, update the OVH checkout and reinstall the crontab if it changed. Keep `sync-state.sqlite`. If the target database was restored at the same address, run `run-job.sh sync --full` once to repair target drift. A changed host, database, or login gets a fresh baseline automatically. This reviewed sync projection also starts a new baseline, so older hash records cannot hide drift from the previous implementation. Losing the hash store safely causes a full replay; it never loses the working evidence.

To rebuild OVH, install Node and dependencies, restore a checked SQLite backup, load the env file, and follow the resume sequence. Keep existing target niches. Use a separately reviewed `sync.mjs --seed-niches` only for an empty target; never use `--niches-only` during routine recovery.

## Merge the homelab RDAP pass

When the original domain-age pass and gather supervisor have both finished:

```bash
ssh homelab 'cd /srv/data/projects/stack127 && node --experimental-strip-types scripts/ad-networks/snapshot-local.mjs --local-database /home/teja/.local/share/stack127/ad-networks.sqlite --output /srv/data/tmp/ad-networks-rdap.sqlite && scp /srv/data/tmp/ad-networks-rdap.sqlite ovh:/srv/stack127-data/state/rdap.sqlite && rm /srv/data/tmp/ad-networks-rdap.sqlite'
ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh rdap-import --source-sqlite /srv/stack127-data/state/rdap.sqlite && rm /srv/stack127-data/state/rdap.sqlite'
```

The importer copies only newer RDAP checkpoints and dates, then syncs and refreshes. After its successful backup, disable homelab's old `stack127-ad-network-backup.timer`. This does not affect the niche timer or change which pages are published.
