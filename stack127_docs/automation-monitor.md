# Automation monitor

`https://monitor.ravitejaknts.com` (tailnet only, signed in) shows every stack127 and Bloxodes automation in one place: what each job does, when it runs, its last result, 90 days of run history and its log. It also shows the OVH server, the homelab, the Macs, the production database and the live site. It only reads. Its code lives on the homelab at `/srv/data/projects/automation-dashboard`.

## Keep `monitoring.json` current

The dashboard takes each stack127 job's name and description from [`monitoring.json`](monitoring.json), read from the homelab main checkout. When a change adds, moves, renames or removes a scheduled job, a GitHub workflow, an Edge Function schedule or a server timer, update its entry in the same pull request.

One entry per job:

```json
{"key": "stack127-vps/verification", "group": "Ad networks", "name": "Ad network site checks",
 "about": "Every 5 minutes, checks up to 500 publisher sites to confirm which ad networks they use.",
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

- On OVH, the `ubuntu` account can't read Docker or the system journal, so containers aren't listed and timer logs are empty. Ad network jobs report through `/srv/stack127-data/logs/<job>.log`, using the `== <time> start <job>` and `== <time> end <job> exit <code>` lines that `run-job.sh` writes. Exit 76 (the previous run was still going) shows as skipped. Exit 75 (another job held the database lock) shows as skipped when the run gave up within an hour, as verification does, and as failed when a job gave up after hours of retries.
- GitHub often starts scheduled workflows late. The dashboard only calls a workflow "behind schedule" after three missed gaps plus an hour.
