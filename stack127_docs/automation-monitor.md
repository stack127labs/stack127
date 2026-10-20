# Automation monitor

`https://monitor.ravitejaknts.com` shows every stack127 and Bloxodes automation in one place. It is tailnet only, and you must sign in.

For each job it shows what the job does, when it runs, its last result, 90 days of run history and its log. It also shows the OVH server, the homelab, the Macs, the production database and the live site. It only reads. Its code lives on the homelab at `/srv/data/projects/automation-dashboard`.

## Keep `monitoring.json` current

The dashboard takes each stack127 job's name and description from [`monitoring.json`](monitoring.json), read from the homelab main checkout. When a change adds, moves, renames or removes a scheduled job, a GitHub workflow, an Edge Function schedule or a server timer, update its entry in the same pull request.

One entry per job:

```json
{"key": "stack127-vps/verification", "group": "Ad networks", "name": "Ad network site checks",
 "about": "Every hour, checks up to 1,000 publisher sites to confirm which ad networks they use.",
 "impact": "Network pages stop gaining newly confirmed sites."}
```

| Field | What to write |
| --- | --- |
| `key` | Where the job lives. `stack127-vps/<run-job.sh name or systemd unit>`, `homelab/<systemd unit>`, `github/stack127labs/<repo>/<workflow file>`, or `supabase/<function or pg_cron job>`. Leave out `.timer` and `.service`. |
| `name` | A short plain name, such as "Production health check". |
| `group` | The section it belongs to, such as "Ad networks" or "Site cache". Reuse an existing group when one fits. |
| `about` | One sentence on what it does and how often, written for the owner. |
| `impact` | Optional. What breaks if it stops. |

A job with no entry still shows up, marked "No description yet".

## What the dashboard can't see

- On OVH, the `ubuntu` account can't read Docker or the system journal. So containers aren't listed, and timer logs are empty.
- Ad network jobs report through `/srv/stack127-data/logs/<job>.log`. The dashboard reads the `== <time> start <job>` and `== <time> end <job> exit <code>` lines that `run-job.sh` writes.
- Exit 76 means the previous run was still going. It shows as skipped.
- Exit 75 means another job held the database lock. It shows as skipped when the run gave up within an hour, as verification does. It shows as failed when a job gave up after hours of retries.
- Database backups can't be read from the journal either. Instead, a failed backup opens a GitHub issue in `stack127labs/stack127` named `Database backup failed: <job>`, and the next good run closes it. `stack127-db-backup-alert.service` on OVH and `stack127-db-backup-pull-alert.service` on homelab send these. The logs are in `journalctl -u stack127-db-backup.service` on OVH and `journalctl -u stack127-db-backup-pull.service` on homelab.
- GitHub often starts scheduled workflows late. The dashboard only calls a workflow "behind schedule" after three missed gaps plus an hour.
