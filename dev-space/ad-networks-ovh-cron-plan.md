# Ad networks: simple OVH cron plan

**Running again since October 20, 2026, 15:00 UTC.** It was paused on October 19 at 12:15 UTC. Production moved to self-hosted Postgres on October 20, and the sync now sends only changed rows (PR #69). Verification runs hourly at minute 40. Pages stay unpublished (404).

## Pause: why and how to resume

The first day of syncing filled the production Supabase database. It grew to 709 MB, against the free plan's 500 MB, and about 540 MB of that is ad-network data. `ad_network_publishers` alone is 387 MB, mostly the stored check evidence. The jobs also ran back to back. Each one held two session-mode connections for about 20 minutes and pushed every row again. The session pool filled up, the instance was IO-throttled, and other work timed out: builds, the cache worker, and another session's page publication. The owner chose to move production to a self-hosted Postgres on the OVH server before resuming; see [self-hosted database plan](self-hosted-database-plan.md).

State at the pause:

- OVH: the crontab is saved at `/srv/stack127-data/crontab.paused-2026-10-19.txt` (the old five-minute schedule). The working store `/srv/stack127-data/ad-networks.sqlite` and its backups are intact. The last verification run was stopped mid-sync (exit 1); batches that committed are kept.
- Production data: 105,981 publishers and 113,788 relationships. No ad-network page is published.
- Homelab: the niche timer `stack127-ad-network-niche.timer` is installed and enabled (next run Sunday 06:00 UTC). Disable it, or let it fail harmlessly, until the database move is done. The RDAP pass and gather supervisor are still running and need the later merge.
- PR #58 (env sharing) is reviewed and green but held. After it merges, replace homelab's `~/.local/lib/stack127/shared-env.mjs`: stop the timer, copy the file, start the timer.
- Not yet deleted: Storage bucket `stack127-ad-networks-jobs` and GitHub secret `AD_NETWORKS_ALERT_TOKEN`. Both are unused; delete them only with the owner's OK.

The resume changes are prepared:

1. Compare compact row hashes in OVH's persistent `state/sync-state.sqlite`; send only changed rows. Invalidate old hashes before target writes and save each committed batch.
2. Collect without a production connection. Sync takes both existing locks on one direct connection, then releases it before revalidation.
3. Keep full evidence and source lists in SQLite. Retain compact source attribution, manager/check facts, niche homepage text, and required confirmation metadata in production.
4. Verify hourly at minute 40, with four workers, at most 1,000 sites, and a ten-minute budget.

The [production runbook](../content_docs/ad-networks/production-runbook.md#resume-after-release) has the exact resume order. Keep cron and niche sorting paused until the reviewed release, optional reviewed evidence cleanup, full sync, no-change sync, small collector checks, backup, and cache checks pass. Install the new crontab last. Do not change publication rows or a publish manifest.

Read-only production checks found the `stack127_app` grants and RLS policies already cover sync and its triggers. No role migration is needed. Evidence alone can shed about 157 MB of live column values, with further savings from compact source attribution; this does not promise smaller files without later maintenance. The separate cleanup SQL is not automatic.

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

- Every job ends with an incremental sync and refresh. The old full sync took 12 minutes without changes. A local 107,146-site benchmark now takes 12.4 seconds with simulated database replies; measure OVH during resume.
- `scripts/ad-networks/ovh/run-job.sh` wraps each job (it started as `/srv/stack127-data/run-job.sh`). A daily or weekly job that finds the sync lock taken retries the sync every minute for up to 6 hours, without rerunning its collector. Verification skips its turn while one is waiting. Exit 75 means the lock was taken, and exit 76 means the same job is already running.
- Sync reads a pinned SQLite view without making a full-store copy. Checked snapshots remain available for backups and RDAP handoff.

Resumed on October 20:

- The first full sync took under 2 minutes. A sync with no changes takes about a minute, including the page refresh. The old one took about 12 minutes.
- The evidence trim found nothing left to trim, because the first sync already sent compact evidence. Live evidence is now about 72 MB, down from about 254 MB. Table files stay at their size until a separate maintenance window.
- The homelab RDAP pass and gather supervisor were stopped. 88 `.au` domains were still rate-limited; the daily OVH domain-age job retries them. The RDAP merge added 64 checkpoints and 1,674 domain dates. Those dates belong to sites that aren't reviewed yet, so they reach production only when the sites do.
- The homelab `stack127-ad-network-backup.timer` is disabled. The niche timer is enabled for Sunday 06:00 UTC.
- The homelab checkout tracks main. `/tmp/s127-adnet-a4fd0397` is already gone.

Still waiting on the owner:

- Delete the Storage bucket `stack127-ad-networks-jobs` and the GitHub secret `AD_NETWORKS_ALERT_TOKEN`.
- Publish the pages, in a separate round.

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
AD_NETWORKS_RUNTIME_ENVIRONMENT="production"
DATABASE_POOLER_URL="<direct stack127_app URL at 127.0.0.1:5432/postgres>"
GITHUB_ALERT_TOKEN="<same token as homelab .env.deploy>"
AD_NETWORK_DB_PATH="/srv/stack127-data/ad-networks.sqlite"
AD_NETWORKS_STATE_DIRECTORY="/srv/stack127-data/state"
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

Install [`scripts/ad-networks/ovh/crontab.txt`](../scripts/ad-networks/ovh/crontab.txt) through the resume steps in the runbook. Verification starts at minute 40 each hour. The daily, weekly, and monthly start times stay the same.

Each line calls `run-job.sh`. Only sync holds a production lock and connection. `flock` stops duplicate copies of the same job. The wrapper accepts the shell-sourced, double-quoted env values and writes `/srv/stack127-data/logs/<job>.log`.

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

Pages stay unpublished. Any future publication needs a separate task and authorization.
