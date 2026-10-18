# Ad networks: simple OVH cron plan

Status on October 18, 2026: planned, not started. Pages stay unpublished.

## Goal

Run the ad-network jobs as plain cron jobs on the OVH server. Each job writes straight to the production database and refreshes the pages. No GitHub workflow, no Cloudflare Access rules, no Storage handoff, no container.

Weekly niche sorting stays on homelab.

## Why the first attempt was too complicated

We had no direct way into OVH: no SSH key, no Tailscale, and the Dokploy dashboard needs an email login through Cloudflare. GitHub held the only keys that reach Dokploy, so everything was built around a GitHub workflow. It then failed because Cloudflare Access lets the GitHub service token reach only three Dokploy paths. One SSH key removes all of that.

## Where things stand

Done:

- PR #53 merged (`a4fd0397`) and released. Main, backend health and the Cloudflare frontend all match.
- Production database: 10 ad-network migrations applied, 44 networks, 0 published pages.
- Production GitHub secret `AD_NETWORKS_ALERT_TOKEN` holds the issue-alert token. Not needed for the cron plan.
- A seed copy was uploaded to the private Storage bucket `stack127-ad-networks-jobs`. Not needed for the cron plan.

Not done:

- Nothing runs on OVH yet. The GitHub activation run failed at its read-only check and changed nothing on OVH.
- Homelab checkout `/srv/data/projects/stack127` is 98 commits behind main and has someone's uncommitted work from October 8–14 (shared env changes and an untracked `scripts/stack127/shared-env.mjs`). Decide what to do with it before updating.
- Homelab niche timer is not installed.
- A clean export of `a4fd0397` sits in `/tmp/s127-adnet-a4fd0397` on homelab. Delete it when finished.
- Still running on homelab: the domain-age RDAP pass (pid 348650, about 4.5 days left on October 18) and the gather supervisor (pid 4134573). Both run from `/tmp/s127-gather-2038dd94`.

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

`scripts/ad-networks/runtime.mjs` (`bootstrapSteps`) has the exact commands. Check the pages refresh and stay unpublished (404).

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

1. Resolve the uncommitted work in `/srv/data/projects/stack127`, then fast-forward it to main.
2. Smoke-test niche sorting on 2 sites:
   `node --env-file=.env.deploy --experimental-strip-types scripts/ad-networks/niche-sort.mjs --environment production --confirm stack127-production --apply --limit 2 --claude /home/teja/.local/bin/claude`
3. Install and enable `scripts/ad-networks/systemd/stack127-ad-network-niche.service` and `.timer` (Sunday 06:00 UTC).
4. After the first OVH sync, confirm the niche labels in production weren't overwritten.
5. When the RDAP pass and the gather supervisor finish: take a snapshot, copy it to OVH, and merge only the newer RDAP data with `scripts/ad-networks/merge-rdap.mjs`. Then sync once.
6. Then disable the homelab `stack127-ad-network-backup.timer`.

### 8. Clean up the first attempt

Once cron works, remove what is no longer used:

- `.github/workflows/ad-networks-runtime.yml`, `scripts/ad-networks/runtime/` (Dockerfile, compose, init-volume), `deploy-runtime.mjs`, `check-activation.mjs` if unused, the Storage parts of `handoff.mjs`/`handoff-storage.mjs`, and their tests.
- The private Storage bucket `stack127-ad-networks-jobs` and its seed upload.
- The GitHub secret `AD_NETWORKS_ALERT_TOKEN`.
- `content_docs/ad-networks/production-runbook.md`: rewrite it for cron.
- Update `content_docs/ad-networks/maintenance.md`, `stack127_docs/environment-inventory.md`, `AGENTS.md` and `dev-space/ad-networks-tracker.md`.
- `/tmp/s127-adnet-a4fd0397` on homelab.

Keep `scheduler.mjs` only if it still has a use. With cron it is not needed.

Then publish the pages in a separate round.
