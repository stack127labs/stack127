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

Publisher evidence keeps `manager_domains`, `confirmed_networks`, the bounded `homepage` check outcome and `inconclusive_networks`, plus four homepage fields used by niche sorting: `title`, `description`, `h1`, and `language`. Relationship evidence keeps `manager_domain`, `matched_signal`, `checked_url`, `checked_at`, `parser_version`, `last_absence`, and `homepage_miss_correction`. `checked_url`, `checked_at`, and `parser_version` are required confirmation metadata. These preserve existing manager resolution, observations, and database constraints.

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

## Correct inconclusive homepage misses (November 2026)

A failed homepage must never count as an absent network. HTTP 200 can also be a bot challenge. The verifier now records that result as inconclusive for each network that needs the page. It preserves confirmation dates and misses. After 30 days without successful page evidence, a confirmed relationship becomes stale at its next check; failed requests never end it. Public checked dates use the last successful check, not the attempt time. It retries with backoff. A normal page without the network, or ads.txt without the required authorization, still counts as an absence.

The fault existed before OVH. Commit `c488b9cc` (October 1) already swallowed homepage failures in `verify.mjs`. Commit `763d5a33` (October 16) extracted the same behavior into `verify-publisher.mjs`. The retained homepage-method misses start on September 28. The correction therefore defaults to `--since 2026-09-28T00:00:00.000Z`. This is a conservative search boundary, not a claim that every miss since then was wrong. OVH cron began October 19; the large November 13 loss is a later symptom.

Read-only probes on November 13 used the same crawler identity and 15-second timeout on OVH and the Mac. Of 12 ended sites, all 12 returned normal HTTP 200 pages on the Mac. OVH returned nine normal pages, two HTTP 200 browser challenges (`tawcan.com`, `nomadicmatt.com`), and one HTTP 403 challenge (`iwandered.net`). A later four-site curl check still challenged the first two but loaded `iwandered.net` normally. Blocks vary by request. These probes establish a real failure mode; they do not establish the cause of every historical miss. The old logs and compact evidence did not retain homepage outcomes.

### Selection and limits

`scripts/ad-networks/correct-homepage-misses.mjs` defaults to a dry run. It repairs only a previously confirmed homepage-method relationship with misses inside the fault window. The latest check must be the miss itself, and either a 304 or a recorded inconclusive homepage must prove that check did not obtain absence evidence. A recorded valid `last_absence` excludes the row.

A fresh full check must confirm the exact original signal. For a review-promoted seller relationship, both the exact ads.txt seller line and the saved `page_signature` must match current evidence. If the stored original ads.txt hash exists, the current hash must match too. Changed signals, changed files, blocked checks, actual absences, incomplete evidence, and old full-fetch misses without homepage diagnostics remain untouched. Counts report each reason. This intentionally leaves unresolved damage for later evidence-based review.

The script preserves both original confirmation dates. It clears misses and the end date, restores `confirmed`, and queues priority 100 re-verification. It stores the original miss window and end date under `homepage_miss_correction`. Verification and compact sync preserve that marker.

`--limit` bounds distinct domains checked, default 100. `nextAfterDomain` supplies the next batch's `--after-domain` value. Use the same cursor for a preview and its apply. Advance only after that batch has applied. Failed or excluded rows remain unchanged; start again without a cursor to retry them later. History work has its own `--history-limit` domain bound (defaults to `--limit`). Both restoration and history selection honor `--after-domain`. Stats-only output uses `nextAfterDomain` for history progress. PostgreSQL records completed `(network, publisher, correction time, version)` repairs in `ad_network_homepage_miss_repairs`, in the same transaction as the history changes. This target-side checkpoint survives a later source sync. Interrupted source repair, sync and history stages can each be repeated without advancing their cursors. Completed history is skipped even when starting again without a cursor. Each store applies its batch in one write transaction. Network fetches happen before that transaction. Changed rows abort and roll back the batch.

### Release and apply order

The lead runs this only after review and release authorization. No production step below was run during implementation. Start with **25 domains**, verify the public result, then use **100-domain** batches. A dry run fetches fresh evidence; apply fetches again and may restore fewer rows if a page changes or challenges it.

#### 1. Open a maintenance window

Pausing collectors alone is insufficient. OVH's `stack127-cache-worker.timer` is enabled and dispatches `.github/workflows/stack127-frontend-refresh.yml` from queue changes. A sync commit can otherwise start a build before history repair finishes. The static builder correctly rejects a changing source revision. Leave database triggers enabled and keep their queue entries.

From the operator's local checkout, pause frontend dispatch and save the existing OVH crontab. These commands preserve unrelated cron entries. Use the same saved filename when resuming.

```bash
# Local shell. The implementation agent must not run these production mutations.
export ADN_WINDOW=$(date -u +%Y%m%dT%H%M%SZ)
ssh ovh "crontab -l > /srv/stack127-data/state/crontab-before-homepage-$ADN_WINDOW.txt"
ssh ovh "sed '/^[^#].*scripts\/ad-networks\/ovh\/run-job.sh/s/^/# homepage-maintenance /' /srv/stack127-data/state/crontab-before-homepage-$ADN_WINDOW.txt | crontab -"
ssh ovh 'sudo -n systemctl stop stack127-cache-worker.timer'
# Let a currently executing worker finish; do not kill it mid-dispatch.
ssh ovh 'while systemctl is-active --quiet stack127-cache-worker.service; do sleep 2; done'
```

Coordinate other writers and releases for the same window. The authorized operator pauses homelab niche imports with `ssh homelab 'systemctl --user stop stack127-ad-network-niche.timer'` and waits until `ssh homelab 'systemctl --user is-active stack127-ad-network-niche.service'` reports inactive. Do not kill an active importer. These are release instructions, not permission for the implementation agent to operate on homelab. Wait for existing OVH collectors, syncs and retry wrappers to finish; inspect with:

```bash
ssh ovh 'ps -eo pid,etime,args | grep -E "[s]cripts/ad-networks/(ovh/run-job.sh|refresh.mjs|verify.mjs|sync.mjs|niche-import.mjs)"'
gh run list --repo stack127labs/stack127 --status in_progress
gh run list --repo stack127labs/stack127 --status queued
```

Wait for all frontend refresh and production release runs (including waiting/pending runs in Actions) before changing data. For each active run, use `gh run view RUN_ID --repo stack127labs/stack127` and wait for `completed`. Do not cancel a build during its deployment step. Do not dispatch another release during this window. Stopping the timer cannot prevent a person or a separate release workflow from starting a build. If other writers cannot pause, postpone the correction. There is no global pause flag for manual or release dispatches. This is a coordinated manual window. A restart can reactivate the enabled timer, so recheck these conditions after any restart.

#### 2. Take and verify both backups

The nightly ad-network `backup` job at 05:00 UTC calls `backup-local.mjs`, uses SQLite's online backup API, checks `pragma integrity_check`, and retains seven daily copies under `$AD_NETWORKS_STATE_DIRECTORY/backups`. It is **not a PostgreSQL backup**. Keep a separate timestamped maintenance SQLite copy so a later nightly backup cannot replace it.

PostgreSQL has the separate enabled `stack127-db-backup.timer`. Its on-demand service calls `/srv/stack127-db/backup.sh`. The script requires `BACKUPS_ENABLED`, writes a custom dump plus the Vault root key and password-free roles, checks the archive contents and key size, then publishes the complete bundle. An exit 0 with a missing marker is only a skip, not a usable backup.

On OVH, in `/srv/stack127`, run:

```bash
set -euo pipefail
umask 077
set -a; . /srv/stack127-data/ad-networks.env; set +a
window=$(date -u +%Y%m%dT%H%M%SZ)
backup_dir=/srv/stack127-data/state/homepage-backup-$window
mkdir -m 700 "$backup_dir"
node scripts/ad-networks/backup-local.mjs --local-database "$AD_NETWORK_DB_PATH" --backup-directory "$backup_dir" --keep 7
node --input-type=module - "$backup_dir" <<'JS'
import {DatabaseSync} from 'node:sqlite';
import {readdirSync} from 'node:fs';
const folder=process.argv[2], files=readdirSync(folder).filter(f=>f.endsWith('.sqlite'));
if(files.length!==1)throw Error('Expected one maintenance backup');
const db=new DatabaseSync(folder+'/'+files[0],{readOnly:true});
if(db.prepare('pragma integrity_check').get().integrity_check!=='ok')throw Error('Bad SQLite backup');
console.log(db.prepare('select count(*) relationships from relationships').get());db.close();
JS
sudo -n test -f /srv/stack127-db/BACKUPS_ENABLED
sudo -n systemctl start stack127-db-backup.service
sudo -n systemctl show stack127-db-backup.service -p Result -p ExecMainStatus
sudo -n journalctl -u stack127-db-backup.service -n 15 --no-pager
# Require a NEW 'Backup complete' line from this invocation and Result=success.
pg_backup=$(ls -t /srv/stack127-db/backups/stack127-*.dump | head -1)
test -s "$pg_backup"
test -s "$pg_backup.roles.sql"
test "$(wc -c < "$pg_backup.vault-key")" -eq 64
sudo -n docker exec -i --user postgres stack127-db pg_restore --list < "$pg_backup" > "$backup_dir/postgres.toc"
# Decompress every affected table's archived rows, without executing them.
sudo -n docker exec -i --user postgres stack127-db pg_restore --data-only --schema=public \
  --table=ad_network_publishers --table=ad_network_publisher_relationships \
  --table=ad_network_relationship_events --table=ad_network_check_observations \
  --table=ad_network_daily_counts --file=- < "$pg_backup" > "$backup_dir/affected-tables.sql"
test -s "$backup_dir/affected-tables.sql"
chmod 600 "$backup_dir/postgres.toc" "$backup_dir/affected-tables.sql"
printf 'Keep SQLite folder %s and complete PostgreSQL bundle %s until acceptance.\n' "$backup_dir" "$pg_backup"
```

Verify the table list and archived rows are populated. This checks archive readability, not a fresh full restore. A full restore was tested by the existing backup workflow; if the archive check fails or its recovery evidence is no longer trusted, stop and validate a restore in an isolated database first. Never test restore into production. Keep the dump, key and roles together, with mode 600. Historical snapshot deletion is irreversible without these backups. Do not proceed with a skipped, old, empty or unreadable backup.

#### 3. Install reviewed code and the checkpoint schema

Install the reviewed release on OVH using the normal release procedure. Check its SHA. Apply migration `20261113120000_ad_network_homepage_miss_repairs.sql` through the normal release migration step only. Do not apply it by hand: a direct `psql` run creates the table without recording the migration, and a later migration push then fails because the table exists. If the release did not apply it, stop and fix the release.

Confirm the table exists first with `to_regclass('public.ad_network_homepage_miss_repairs')`. The table grants only backend access. SQLite write checks require the loaded `AD_NETWORKS_RUNTIME_ENVIRONMENT=production` and the canonical `AD_NETWORK_DB_PATH` to match `--sqlite`; production also requires the confirmation flag.

#### 4. Repair 25 domains, sync, then repair history

Still on OVH in `/srv/stack127`, with the env loaded and the maintenance window active:

```bash
node scripts/ad-networks/correct-homepage-misses.mjs --environment production --store sqlite --sqlite "$AD_NETWORK_DB_PATH" --limit 25
node scripts/ad-networks/correct-homepage-misses.mjs --environment production --store sqlite --sqlite "$AD_NETWORK_DB_PATH" --limit 25 --apply --confirm stack127-production
node scripts/ad-networks/sync.mjs --environment production --confirm stack127-production --sqlite "$AD_NETWORK_DB_PATH" --state-file "$AD_NETWORKS_STATE_DIRECTORY/sync-state.sqlite" --apply
node scripts/ad-networks/correct-homepage-misses.mjs --environment production --stats-only --limit 25 --history-limit 25
node scripts/ad-networks/correct-homepage-misses.mjs --environment production --stats-only --limit 25 --history-limit 25 --apply --confirm stack127-production
```

Review each preview. If history reports `history_limit`, repeat history with its `nextAfterDomain` as `--after-domain DOMAIN` until all pending corrections are repaired. Completed rows are checkpointed, so a restart without a cursor is also safe. Keep the **source apply's** `nextAfterDomain` for the next source batch; source and history cursors are separate. Never repair PostgreSQL alone: SQLite owns verification and would overwrite it. Production PostgreSQL apply therefore requires `--stats-only`.

If interrupted: repeat source selection without advancing its cursor, sync with the same state file, then rerun stats-only. Each write stage commits atomically; the PostgreSQL repair checkpoint commits with events and snapshots. A crash before commit rolls all of that stage back. A crash after commit leaves a checkpoint that the next run skips.

#### 5. Refresh and verify the first public result

Run the read-only verification SQL below. Require no remaining invalid departures for repaired markers, zero broken restorations immediately after source repair, and a checkpoint for every synced correction marker. Rebuild heading counts and origin data only after history is complete:

```bash
node scripts/ad-networks/revalidate.mjs --environment production --confirm stack127-production --apply
```

Keep the worker paused and collectors/imports stopped. From the local operator shell, dispatch **one** frontend refresh, then inspect its Actions run until it completes successfully:

```bash
gh workflow run stack127-frontend-refresh.yml --repo stack127labs/stack127 --ref main -f force=true
gh run list --repo stack127labs/stack127 --workflow stack127-frontend-refresh.yml --limit 3
gh run view RUN_ID --repo stack127labs/stack127
curl --fail --silent --show-error https://stack127.com/frontend-release.json
```

Verify the completed refresh SHA matches released `main`, open `/ad-network-checker` for restored sample domains, the affected network pages, and `/ad-networks/stats`. Check restored relationships and original first-confirmed dates, last successful checked dates, movement counts and missing historical days. Check a blocked sample stays unresolved; a dry run is not a restoration. Require the workflow's public verification/acknowledgement step to succeed. Do not start the next data batch until this refresh has completed.

#### 6. Continue in 100-domain batches, then resume

Use `--limit 100` for source preview/apply with the prior source apply's `--after-domain DOMAIN`. Use `--history-limit 100 --limit 100` for history preview/apply. For the next batch, set `source_cursor` to the source apply's actual `nextAfterDomain` (not the history cursor), then run:

```bash
source_cursor='DOMAIN_FROM_SOURCE_APPLY'
node scripts/ad-networks/correct-homepage-misses.mjs --environment production --store sqlite --sqlite "$AD_NETWORK_DB_PATH" --limit 100 --after-domain "$source_cursor"
node scripts/ad-networks/correct-homepage-misses.mjs --environment production --store sqlite --sqlite "$AD_NETWORK_DB_PATH" --limit 100 --after-domain "$source_cursor" --apply --confirm stack127-production
node scripts/ad-networks/sync.mjs --environment production --confirm stack127-production --sqlite "$AD_NETWORK_DB_PATH" --state-file "$AD_NETWORKS_STATE_DIRECTORY/sync-state.sqlite" --apply
node scripts/ad-networks/correct-homepage-misses.mjs --environment production --stats-only --limit 100 --history-limit 100
node scripts/ad-networks/correct-homepage-misses.mjs --environment production --stats-only --limit 100 --history-limit 100 --apply --confirm stack127-production
```

Repeat sync and history repair after each source batch. Keep dispatch paused during mutations. Repeat step 5 once all repairs are finished and wait for that refresh before resuming writers. To inspect any intermediate 100-domain batch publicly, finish its entire sync/history sequence, perform one refresh, and wait for completion before the next mutation.

Once public acceptance passes, restore the saved crontab from the local operator shell. If the niche timer was active before this window, the operator resumes it with `ssh homelab 'systemctl --user start stack127-ad-network-niche.timer'`. Preserve any unrelated cron edits made during the window; compare the saved and current crontabs before restoring.

```bash
ssh ovh "crontab /srv/stack127-data/state/crontab-before-homepage-$ADN_WINDOW.txt"
ssh ovh 'sudo -n systemctl start stack127-cache-worker.timer'
ssh ovh 'systemctl is-active stack127-cache-worker.timer'
```

Check the durable `ad_networks/all` queue event drains after a successful refresh and the next hourly verification exits successfully. Do not remove the backups until acceptance. The whole false-loss spike **will not disappear**: blocked checks, changed signals and historical misses without proof remain unresolved. Missing old snapshots mean unknown history, not zero losses.

For each restored relationship, history repair deletes only its exact invalid `left` event. An apparent return within that correction window becomes `baseline`. It adds the restored network to the existing observation so the next check cannot manufacture a join.

Old per-network daily snapshots inside the affected miss window are removed. Individual stale-transition times were never stored, so their confirmed/stale split cannot be reconstructed honestly. Today's counts are rebuilt from corrected relationships. Missing old days remain unknown. The stats page reads net change and switches from events, and history/coverage from daily counts. This correction changes both sources consistently, without invented history.

The existing relationship, event, and daily-count triggers update the source revision, touch published ad-network pages, and queue the `ad_networks/all` cache refresh. Keep those triggers enabled. No new job or cron schedule is needed. The monitoring descriptions mention the new inconclusive rule.

### Implementation measurements and limits

Read-only OVH fetches on November 13 reproduced HTTP 200 challenges from `tawcan.com` (338 ms) and `nomadicmatt.com` (181 ms), and an HTTP 403 challenge from `iwandered.net` (105 ms). The updated detector classifies all three as challenges. Separate paired ads.txt requests took 1,309 ms, 2,349 ms and 5,275 ms respectively. Tawcan's ads.txt was invalid; the other two returned parsed 6,808- and 6,806-character files. None supplied ETag or Last-Modified, so that sample could not demonstrate a 304 bandwidth reduction. Full production batch throughput, expiry counts and correction totals under the new code remain unmeasured. The ten-minute admission limit permits already-started requests to finish; it is not an immediate request cancellation deadline.

### Read-only verification

Run in a read-only transaction on the selected target:

```sql
begin read only;

select n.slug, r.status, count(*)
from public.ad_network_publisher_relationships r
join public.ad_networks n on n.id=r.ad_network_id
where r.evidence->'homepage_miss_correction'->>'version'='homepage-misses-v1'
group by n.slug,r.status order by n.slug,r.status;

-- Must be zero: exact invalid departures still affecting movements.
select count(*) as remaining_invalid_departures
from public.ad_network_publisher_relationships r
join public.ad_network_relationship_events e using(ad_network_id,publisher_id)
where r.evidence->'homepage_miss_correction'->>'version'='homepage-misses-v1'
and e.event='left'
and e.observed_at=(r.evidence->'homepage_miss_correction'->>'prior_ended_at')::timestamptz;

-- Must be zero immediately after correction; later real checks can change it.
select count(*) as broken_restorations
from public.ad_network_publisher_relationships r
where r.evidence->'homepage_miss_correction'->>'version'='homepage-misses-v1'
and (r.status<>'confirmed' or r.consecutive_misses<>0 or r.ended_at is not null
 or r.first_confirmed_at is distinct from
   (r.evidence->'homepage_miss_correction'->>'original_first_confirmed_at')::timestamptz);

select n.slug,d.snapshot_on,d.listed_count,d.confirmed_count,d.stale_count
from public.ad_network_daily_counts d join public.ad_networks n on n.id=d.ad_network_id
where d.snapshot_on=(now() at time zone 'UTC')::date
and exists(select 1 from public.ad_network_publisher_relationships r
 where r.ad_network_id=n.id and r.evidence ? 'homepage_miss_correction')
order by n.slug;

-- Must be zero before refresh/resume: uncheckpointed synced corrections.
select count(*) as pending_history_repairs
from public.ad_network_publisher_relationships r
where r.evidence->'homepage_miss_correction'->>'version'='homepage-misses-v1'
and not exists(select 1 from public.ad_network_homepage_miss_repairs h
  where h.ad_network_id=r.ad_network_id and h.publisher_id=r.publisher_id
  and h.version='homepage-misses-v1'
  and h.corrected_at=(r.evidence->'homepage_miss_correction'->>'corrected_at')::timestamptz);

select revision from public.stack127_ad_network_source_revision;
select entity_type,slug,attempts,last_error
from public.stack127_revalidation_events
where entity_type='ad_networks'
order by slug;

rollback;
```
