# Ad-network production runbook

The ad-network jobs run as plain cron on the OVH server and write straight to the production database. Weekly niche sorting runs on homelab. All ad-network pages stay unpublished (404) until a separate publication round.

Set up on October 19, 2026. History: [OVH cron plan](../../dev-space/ad-networks-ovh-cron-plan.md).

## Where things live

On OVH (`ssh ovh`, user `ubuntu`, clock in UTC):

| Path | What |
| --- | --- |
| `/srv/stack127` | Plain checkout of `main` with `npm ci --omit=dev --ignore-scripts`. Node 22 from nodejs.org in `/usr/local`. |
| `/srv/stack127-data/ad-networks.env` | Mode 600. `AD_NETWORKS_RUNTIME_ENVIRONMENT=production`, `DATABASE_POOLER_URL` (session port 5432), `GITHUB_ALERT_TOKEN`, `AD_NETWORK_DB_PATH`, `AD_NETWORKS_STATE_DIRECTORY`. Never print it. |
| `/srv/stack127-data/ad-networks.sqlite` | Working SQLite store. |
| `/srv/stack127-data/state/` | Job progress files, fetch throttle, and `backups/` (seven daily copies). |
| `/srv/stack127-data/logs/<job>.log` | One log per job. `/etc/logrotate.d/stack127-ad-networks` rotates them weekly. |

The wrapper [`scripts/ad-networks/ovh/run-job.sh`](../../scripts/ad-networks/ovh/run-job.sh) and the crontab [`scripts/ad-networks/ovh/crontab.txt`](../../scripts/ad-networks/ovh/crontab.txt) are in the repo. Install the crontab with `crontab /srv/stack127/scripts/ad-networks/ovh/crontab.txt`.

On homelab, the user timer `stack127-ad-network-niche.timer` runs `niche-sort.mjs` from `/srv/data/projects/stack127` every Sunday at 06:00 UTC.

## How a job runs

Each cron line calls `run-job.sh <job>`, which loads the env file and runs `refresh.mjs` for that job against production. Every job collects, then syncs the reviewed data to production and refreshes the 70 ad-network paths. A sync with nothing to change still takes about 12 minutes, so verification runs about every 15 minutes even though cron starts it every 5.

All jobs share one database lock.

- `refresh.mjs` exits 75 when another job holds the lock. Scheduled jobs then retry every minute for up to 6 hours. Verification skips its turn while any scheduled job is waiting.
- `flock` stops the same job from starting twice; the wrapper exits 76 for that.
- Niche sorting waits up to 60 minutes for the sync lock before it imports.

Failures open one GitHub issue per job through `alerts.mjs` and close it when the job next succeeds.

## Check on it

```bash
ssh ovh 'crontab -l; tail -3 /srv/stack127-data/logs/verification.log; ls -l /srv/stack127-data/state/backups'
ssh homelab 'systemctl --user list-timers stack127-ad-network-niche.timer; cat ~/.local/state/stack127/ad-networks-niche/niche-status.json'
```

Each run writes `== <time> start <job>` and `== <time> end <job> exit <code>` to its log. Exit 0 is success. Most verification errors are 403 responses from sites that block bots; homelab gets the same.

## Update the code

After a release that changes ad-network scripts:

```bash
ssh ovh 'cd /srv/stack127 && git pull --ff-only && npm ci --omit=dev --ignore-scripts'
```

Running jobs keep their loaded code. If `crontab.txt` changed, run `crontab /srv/stack127/scripts/ad-networks/ovh/crontab.txt` too. Homelab's checkout follows `main` through T3 auto-pull, or `git pull --ff-only`.

## Run one job by hand

```bash
ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh platform --limit 50 --time-budget-minutes 10'
```

The output goes to that job's log.

## Pause and resume

Pause OVH with `crontab -r`, then wait for running jobs to finish (`pgrep -af scripts/ad-networks`). Resume by installing the crontab again. Pause homelab niche sorting with `systemctl --user disable --now stack127-ad-network-niche.timer`.

Nothing needs restoring after a pause. If a job is killed, its claimed rows free up again when their 70-minute leases expire.

## Rebuild OVH from scratch

1. Install Node 22 or newer, clone to `/srv/stack127`, and run `npm ci --omit=dev --ignore-scripts`.
2. Create `/srv/stack127-data/{state,logs}` and the env file at mode 600, with values copied from homelab `.env.database` and `.env.deploy` over SSH.
3. Restore the newest backup from `state/backups/`, or take a fresh homelab snapshot with `snapshot-local.mjs --output <file>` and copy it over. Never copy an open SQLite file directly. Run `PRAGMA quick_check`.
4. Run `run-job.sh sync` once, then install the crontab.

## Merge the homelab RDAP pass

The one-time domain-age pass and the gather supervisor on homelab write to homelab's SQLite store. When both have finished:

```bash
ssh homelab 'cd /srv/data/projects/stack127 && node --experimental-strip-types scripts/ad-networks/snapshot-local.mjs --local-database /home/teja/.local/share/stack127/ad-networks.sqlite --output /srv/data/tmp/ad-networks-rdap.sqlite && scp /srv/data/tmp/ad-networks-rdap.sqlite ovh:/srv/stack127-data/state/rdap.sqlite && rm /srv/data/tmp/ad-networks-rdap.sqlite'
ssh ovh '/srv/stack127/scripts/ad-networks/ovh/run-job.sh rdap-import --source-sqlite /srv/stack127-data/state/rdap.sqlite && rm /srv/stack127-data/state/rdap.sqlite'
```

`merge-rdap.mjs` copies only newer RDAP checkpoints and registration dates. The job then syncs and refreshes the pages as usual. After that, disable homelab's user timer with `systemctl --user disable --now stack127-ad-network-backup.timer`.
