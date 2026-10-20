# Ad networks: simple OVH cron plan

**Paused on October 19, 2026 at 12:15 UTC.** OVH cron is removed and no ad-network job runs. Pages stay unpublished.

## Pause: why and how to resume

The first day of syncing filled the production Supabase database. It grew to 709 MB, against the free plan's 500 MB, and about 540 MB of that is ad-network data. `ad_network_publishers` alone is 387 MB, mostly the stored check evidence. The jobs also ran back to back. Each one held two session-mode connections for about 20 minutes and pushed every row again. The session pool filled up, the instance was IO-throttled, and other work timed out: builds, the cache worker, and another session's page publication. The owner chose to move production to a self-hosted Postgres on the OVH server before resuming; see [self-hosted database plan](self-hosted-database-plan.md).

State at the pause:

- OVH: the crontab is saved at `/srv/stack127-data/crontab.paused-2026-10-19.txt` (the same as `scripts/ad-networks/ovh/crontab.txt`). The working store `/srv/stack127-data/ad-networks.sqlite` and its backups are intact. The last verification run was stopped mid-sync (exit 1); batches that committed are kept.
- Production data: 105,981 publishers and 113,788 relationships. No ad-network page is published.
- Homelab: the niche timer `stack127-ad-network-niche.timer` is installed and enabled (next run Sunday 06:00 UTC). Disable it, or let it fail harmlessly, until the database move is done. The RDAP pass and gather supervisor are still running and need the later merge.
- PR #58 (env sharing) is reviewed and green but held. After it merges, replace homelab's `~/.local/lib/stack127/shared-env.mjs`: stop the timer, copy the file, start the timer.
- Not yet deleted: Storage bucket `stack127-ad-networks-jobs` and GitHub secret `AD_NETWORKS_ALERT_TOKEN`. Both are unused; delete them only with the owner's OK.

Before resuming cron, against whatever database is production then:

1. Sync only changed rows instead of sending every row each run.
2. Don't hold a database connection while collectors run; take the lock only around the sync.
3. Keep the large check evidence in OVH's SQLite store and sync only the fields the pages need.
4. Run verification less often (for example hourly), and watch database size and connection count after the first day.

Earlier status (before the pause): cron ran on OVH, the first attempt was removed, and the homelab checkout tracked main again. The [production runbook](../content_docs/ad-networks/production-runbook.md) describes the cron setup; this file is the history.

## Goal

Run the ad-network jobs as plain cron jobs on the OVH server. Each job writes straight to the production database and refreshes the pages. No GitHub workflow, no Cloudflare Access rules, no Storage handoff, no container.

Weekly niche sorting stays on homelab.

## Why the first attempt was too complicated

We had no direct way into OVH: no SSH key, no Tailscale, and the Dokploy dashboard needs an email login through Cloudflare. GitHub held the only keys that reach Dokploy, so everything was built around a GitHub workflow. It then failed because Cloudflare Access lets the GitHub service token reach only three Dokploy paths. One SSH key removes all of that.

## Where things stand

Done on October 19:

- SSH: `ssh ovh` works from all three devices as `ubuntu`.
- OVH has Node 22 from nodejs.org in `/usr/local`, the checkout in `/srv/stack127`, and the env file `/srv/stack127-data/ad-networks.env`.
- The working store `/srv/stack127-data/ad-networks.sqlite` came from a homelab snapshot taken at 06:21 UTC.
- First run passed. Production now has 106,685 sites and 113,817 network links, with niche labels on 85,810 sites. The 70 ad-network paths were refreshed, and every page still returns 404.
- Cron is installed (`crontab -l` as `ubuntu`). Logs are in `/srv/stack127-data/logs/` and rotate weekly. Backups are in `/srv/stack127-data/state/backups/`.
- The first verification run checked 300 sites in its 5-minute budget. Most errors are 403s from sites that block bots. Homelab gets the same 403s.

Things to know:

- Every job ends with a full sync and a refresh. A sync with no changes still takes about 12 minutes, so verification runs about every 15 minutes, not every 5.
- `scripts/ad-networks/ovh/run-job.sh` wraps each job (it started as `/srv/stack127-data/run-job.sh`). A daily or weekly job that finds the database lock taken retries every minute for up to 6 hours. Verification skips its turn while one is waiting. Exit 75 means the lock was taken, and exit 76 means the same job is already running.
- Each sync used to leave two small temp files in `state/`. `snapshot-local.mjs` now removes them.

Not done:

- Homelab checkout: done. Its uncommitted env-sharing work went into PR #58, a backup is in `/srv/data/tmp/stack127-homelab-wip-2026-10-19/`, and the checkout now tracks main.
- Homelab niche timer is not installed. The first 2-site smoke run hit the sync lock and timed out; the import now waits for it.
- RDAP merge (step 7.5) and turning off the homelab backup timer.
- A clean export of `a4fd0397` sits in `/tmp/s127-adnet-a4fd0397` on homelab. Delete it when finished.
- Still running on homelab: the domain-age RDAP pass (pid 348650) and the gather supervisor (pid 4134573). Both run from `/tmp/s127-gather-2038dd94`.

## Steps

### 1. Get into OVH

Add homelab's `~/.ssh/devices_ed25519.pub` to the OVH server (54.39.99.47) through the OVH panel. Or the owner allows one use of `OVH_VPS_Password` to add the key. Then add an `ovh` alias to the device SSH config.

Optional: put OVH on Tailscale.

### 2. Set up the checkout

On OVH, as a normal user (not root):

```bash
# Node 22 or newer (node:sqlite is required)
git clone https://github.com/stack127labs/stack127.git /srv/stack127
cd /srv/stack127 && npm ci --omit=dev --ignore-scripts
mkdir -p /srv/stack127-data/state /srv/stack127-data/backups /srv/stack127-data/logs
```

One env file, `/srv/stack127-data/ad-networks.env`, mode 600:

```bash
AD_NETWORKS_RUNTIME_ENVIRONMENT=production
DATABASE_POOLER_URL=   # production session pooler, port 5432
GITHUB_ALERT_TOKEN=    # same token as homelab .env.deploy
AD_NETWORK_DB_PATH=/srv/stack127-data/ad-networks.sqlite
AD_NETWORKS_STATE_DIRECTORY=/srv/stack127-data/state
```

Copy the values from homelab `.env.database` and `.env.deploy` over SSH. Never paste them into chat. Homelab stays the source for env files, so update this file when those values change.

### 3. Copy the working data file

The jobs keep a local SQLite working store. Take a safe copy on homelab and send it straight to OVH:

```bash
ssh homelab 'cd /srv/data/projects/stack127 && node --experimental-strip-types scripts/ad-networks/snapshot-local.mjs --output /srv/data/tmp/ad-networks-seed.sqlite'
ssh homelab 'scp /srv/data/tmp/ad-networks-seed.sqlite ovh:/srv/stack127-data/ad-networks.sqlite'
```

Never copy the open SQLite file directly. Use `snapshot-local.mjs`, then run `PRAGMA quick_check` on OVH.

### 4. First run, once

Run once, in this order, from `/srv/stack127`:

1. `catalog`
2. full `sync` to production
3. fill-only niche seed: `sync --seed-niches`. It fills only empty niche labels and never overwrites.
4. revalidate
5. `snapshot`
6. `platform` and `verification` on one site
7. `backup`

Done on October 19. The bootstrap script was removed with the first attempt. Pages refreshed and stayed unpublished (404).

### 5. Cron (UTC)

Each line runs one job through `scripts/ad-networks/refresh.mjs`. Every job takes a database lock, so overlapping runs skip instead of clashing. `flock` stops the same job from starting twice.

```cron
CRON_TZ=UTC
# J = cd /srv/stack127 && set -a && . /srv/stack127-data/ad-networks.env && set +a && nice -n 10 flock -n /tmp/adn-JOB.lock node --experimental-strip-types scripts/ad-networks/refresh.mjs --environment production --confirm stack127-production --apply --local-database /srv/stack127-data/ad-networks.sqlite --state-directory /srv/stack127-data/state --concurrency 4

*/5 * * * *  J --job verification --limit 500 --time-budget-minutes 5
10 0 * * *   J --job snapshot --limit 5000 --time-budget-minutes 30
0 1 * * *    J --job platform --limit 5000 --time-budget-minutes 30
0 2 * * *    J --job domain-age --limit 5000 --time-budget-minutes 30
0 3 * * *    J --job ads-txt-summary --limit 5000 --time-budget-minutes 30
0 4 * * 2    J --job discovery --limit 5000 --time-budget-minutes 30
0 4 * * 3    J --job publisher-names --limit 5000 --time-budget-minutes 30
0 4 5 * *    J --job traffic --limit 5000 --time-budget-minutes 30
0 5 * * *    J --job backup --limit 5000 --time-budget-minutes 30
```

Write the real crontab with the full command on each line, or a small `run-job.sh` wrapper that takes the job name. Append output to `/srv/stack127-data/logs/<job>.log` and rotate it.

Failures open a GitHub issue through `alerts.mjs` and close it on recovery.

### 6. Code updates

After a release, run `git -C /srv/stack127 pull --ff-only && npm ci --omit=dev --ignore-scripts` on OVH. A weekly cron can do it, but only when no job is running.

### 7. Homelab

1. Done: resolve the uncommitted work in `/srv/data/projects/stack127`, then fast-forward it to main.
2. Smoke-test niche sorting on 2 sites:
   `node --env-file=.env.deploy --experimental-strip-types scripts/ad-networks/niche-sort.mjs --environment production --confirm stack127-production --apply --limit 2 --claude /home/teja/.local/bin/claude`
3. Install and enable `scripts/ad-networks/systemd/stack127-ad-network-niche.service` and `.timer` (Sunday 06:00 UTC).
4. Done: after the first OVH sync, production had niche labels on 85,810 sites.
5. When the RDAP pass and the gather supervisor finish, follow "Merge the homelab RDAP pass" in the runbook.
6. Then disable the homelab `stack127-ad-network-backup.timer`.

### 8. Clean up the first attempt

Removed in the clean-up PR: the workflow, `runtime/`, `runtime.mjs`, `scheduler.mjs`, `deploy-runtime.mjs`, `check-activation.mjs`, `handoff.mjs`, `handoff-storage.mjs` and their tests. The docs were rewritten for cron. Still to remove after that PR merges:

- The private Storage bucket `stack127-ad-networks-jobs` and its seed upload.
- The GitHub secret `AD_NETWORKS_ALERT_TOKEN`.
- `/tmp/s127-adnet-a4fd0397` on homelab.

Then publish the pages in a separate round.
