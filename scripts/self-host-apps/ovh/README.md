# Self-host app cron jobs on OVH

These seven data jobs and one catch-up job run as `ubuntu` on OVH. GitHub no
longer schedules them. Cron is already enabled on the server. No new daemon or timer is required. The wrapper
uses a transient systemd resource scope through ubuntu's enabled user manager
(`loginctl enable-linger ubuntu`) to cap the complete process tree at 2 GB RAM,
no swap, and one CPU. It also sets `nice -n 10`, a 1.5 GB V8 heap ceiling, a 16 GB
virtual address ceiling (V8 reserves about 10 GB), and a 20/30/45/60-minute timeout
matching each former workflow, including checkout update and lock waiting. The
resource scope also has the same RuntimeMaxSec limit, so children remain bounded
even if the outer supervisor is killed. The env launcher passes the checkout
lock descriptor to the step shell, so killing the launcher cannot unlock a
still-running child.

## Code and credentials

`/srv/stack127-self-host` is a separate, clean clone of
`https://github.com/stack127labs/stack127.git`. Every nominal run and hourly
catch-up fetches `origin/main` and merges with `--ff-only` before running the updated due module.
Unmarked local edits, diverged history, unpublished commits and unreachable
remotes fail visibly.

Cron calls a reviewed copy of `run-job.sh` installed outside that checkout at
`/srv/stack127-data/self-host-apps/run-job.sh`. Git cannot damage this supervisor
while updating job code. The supervisor runs the updated checkout's step wrapper;
a syntax error there is logged and the next hourly fetch can bring its repair.
After fetching, catch-up compares the installed supervisor with the repo copy.
A mismatch fails catch-up with a clear instruction to perform the reviewed,
syntax-checked reinstall by atomic rename below. Data jobs continue to run;
fetching still works so a later update can bring a repair. Do not point cron
back into the Git checkout.

Under the shared checkout lock, each update atomically records its starting
commit in both fields of `update-in-progress` before fetching. Before merging,
it atomically replaces the second field with the intended target commit. After
a crash, a remaining journal or Git lock triggers recovery. If any Git process owned by ubuntu is
still alive, recovery fails and retries next hour. Otherwise it logs changed
paths and stale lock names, removes those locks, and resets to the target commit.
This includes new files already created by an interrupted merge. The journal
stays until reset succeeds and the checkout is clean, then the updater fetches
and fast-forwards again. Older single-field journals reset to their recorded
commit; an old lock without a journal resets to HEAD. Recovery can be interrupted
and repeated. This clone is automation-owned: do not edit it by hand. During recovery, tracked edits and untracked files in
the way of tracked paths may be overwritten by `git reset --hard`; names, never
contents, are logged first. Other untracked files are kept and block the update.
Ordinary edits without a recovery journal or stale Git lock are never reset.

`npm ci --no-audit --no-fund` runs only if the lockfile hash changes or
node_modules is absent. Its success marker lives outside the checkout. An
interrupted install has no new marker and is retried. A per-job nonblocking
`flock -E 76` prevents overlap. A shared checkout lock covers update and execution,
so another job cannot change code or dependencies mid-run. `/srv/stack127` and
its ad-network jobs are untouched. The revision is recorded in the job log.

Infisical `stack127 /vps/self-host-apps` writes
`/srv/stack127-data/self-host-apps.env` through the Cockpit sync. The wrapper
requires a regular file, mode 600, owned by the job user. Values are parsed by
Node, never evaluated as shell code. Credentials:

- `DATABASE_URL`: production `stack127_app` on `127.0.0.1:5432/postgres`,
  `sslmode=disable`; use the same connection as launch-directory metrics.
- `GITHUB_TOKEN`: GitHub discovery, catalogs, facts and technical jobs. Copy an
  existing authorised Infisical credential; no interactive `gh` login is needed.
- `GITLAB_TOKEN`, `CODEBERG_TOKEN`: optional, for source-host refresh. Without them
  the job reads the public APIs anonymously, as it always did on GitHub Actions.
  Add them only if rate limits start to fail runs. Never fill them with placeholders.

GitHub API reads follow at most five redirects within `https://api.github.com`.
A redirect to another origin, HTTP, or a URL containing credentials fails before
any request goes there. Renamed and transferred repositories remain readable.

Docker Hub needs no token. Sending a GitHub bearer to Docker Hub caused the old
401 failures. The catalog fetcher sends it only to `api.github.com`. Transient
HTTP/network failures retry three times with backoff; a permanent error fails
immediately and stays in the catalog report. Other catalogs still run, followed
by dedupe even on failure. No failed catalog is silently treated as success.

## Schedule and catch-up

| Job suffix (`self-host-…`) | Former intended IST time | New nominal UTC time | Whole-run limit |
| --- | --- | --- | --- |
| discovery-github | Daily 07:54 | Daily 07:02 | 20 min |
| discovery-lists | Sunday 09:11 | Sunday 08:10 | 20 min |
| discovery-catalogs | Sunday 09:47 | Sunday 09:14 | 45 min |
| discovery-directories | 1st 09:42 | 1st 10:18 | 30 min |
| refresh-github | Daily 05:30, 17:30 | Daily 07:06, 19:06 | 20 min |
| refresh-source-hosts | Daily 11:06 | Daily 11:22 | 30 min |
| refresh-technical | Monday 10:53 | Monday 12:26 | 60 min |

Each data job has its own cron line at the nominal times above, with `--due`.
The dashboard therefore sees the real schedule and can flag overdue work.
`self-host-catch-up` has its own line and log at minute 30 each hour, excluding
hours 05 and 06. It updates the checkout, checks supervisor drift, releases the
checkout lock, then calls the seven installed job wrappers in order with `--due`.
Each wrapper updates and rechecks due status under the shared lock, so a nominal
run racing catch-up cannot repeat a completed period. It compares the latest
nominal occurrence against the last successful start time. First install is due
immediately. Missed periods catch up once; failures retry next hour. Success
markers are renamed atomically only after all required steps succeed.

A completed-period check exits 0 without changing the data job log or success
marker. Checkout output is buffered until work starts, then streamed to the job
log with its start line. Setup or update failures flush that output with failure
start/end lines even when no steps could run. Catch-up always logs its own
start/end lines, including on drift or checkout failure. A failed child also
fails catch-up and names that child's log. No-op checks never appear as green
data runs on the dashboard.

Catch-up and its children wait at most 30 seconds for the shared checkout lock;
a busy lock exits 76 for retry next hour. A per-job overlap is also exit 76 and
does not add a data-job run. Nominal jobs wait until ten seconds before their whole-run deadline. If they
never acquire the checkout lock, they log a skipped run (76), not a failure.
A timeout after acquiring the lock remains a failure.
Catch-up runs due jobs sequentially; its whole-run limit is 240 minutes, covering
the seven job limits (225 minutes total) and bounded lock waits. Its own per-job
lock prevents overlapping catch-up sweeps. All cron starts avoid :35 to :50 and
the 05:35 to 06:45 release window.

GitHub facts still select the oldest attempts with `--max-age-hours 12`; source
hosts still use `--max-age-hours 24`. Discovery upserts candidates by source/key
and dedupe is repeatable. Install-options inspection remains dry-run; this job
never writes inferred editorial technical facts.

## Install after merge

The lead installs cron only after the reviewed code reaches main. First ensure
`DATABASE_URL` and `GITHUB_TOKEN` exist and the Infisical sync succeeds.
`GITLAB_TOKEN` and `CODEBERG_TOKEN` are optional. If the clone does not
exist, create it as ubuntu (sudo may be needed just for the directory):

```sh
sudo install -d -o ubuntu -g ubuntu -m 755 /srv/stack127-self-host
git clone --depth 1 https://github.com/stack127labs/stack127.git /srv/stack127-self-host
```

On OVH as ubuntu:

```sh
cd /srv/stack127-self-host
git fetch origin main
git merge --ff-only origin/main
systemctl is-enabled cron
loginctl show-user ubuntu -p Linger
systemctl --user is-active default.target
```

Install the reviewed supervisor as ubuntu, outside the checkout. Check syntax
before atomically replacing it. Re-run this step after reviewed supervisor changes:

```sh
install -d -m 700 /srv/stack127-data/self-host-apps
install -d -m 755 /srv/stack127-data/logs
install -m 700 scripts/self-host-apps/ovh/run-job.sh /srv/stack127-data/self-host-apps/run-job.sh.new
bash -n /srv/stack127-data/self-host-apps/run-job.sh.new
mv /srv/stack127-data/self-host-apps/run-job.sh.new /srv/stack127-data/self-host-apps/run-job.sh
cmp scripts/self-host-apps/ovh/run-job.sh /srv/stack127-data/self-host-apps/run-job.sh
```

Run one job by hand to check the update and dependencies:

```sh
/bin/bash /srv/stack127-data/self-host-apps/run-job.sh self-host-refresh-github
```

Append the block once, preserving all existing entries. This command refuses to
add a second copy. Review the saved crontab before installing:

```sh
crontab -l > /srv/stack127-data/self-host-apps/crontab.before
if ! grep -q '^# BEGIN stack127 self-host apps' /srv/stack127-data/self-host-apps/crontab.before; then
  cat /srv/stack127-data/self-host-apps/crontab.before /srv/stack127-self-host/scripts/self-host-apps/ovh/crontab.txt > /srv/stack127-data/self-host-apps/crontab.new
  crontab /srv/stack127-data/self-host-apps/crontab.new
fi
crontab -l
```

## Operate

Use the same command without `--due` to force one job. Logs are
`/srv/stack127-data/logs/<job>.log`; the dashboard reads the UTC `== … start …`
and `== … end … exit …` lines. Exit 76 means the job or checkout lock is busy;
catch-up logs a shared-lock skip. Nominal shared-lock deadlines also log a skip.
Per-job overlaps stay silent for every job, so they cannot interrupt the active
run’s marker pair. Catch-up children that find a busy shared lock stay silent.
Other nonzero exits are failures, including checkout, env, dependency and timeout
errors. Failure traps are installed before argument checks and setup. Cron also
redirects stderr to the job log, so even a damaged installed supervisor's Bash
startup or syntax error is visible. A broken updated step wrapper produces the
normal failure start/end lines from the separate installed supervisor.
Candidate storage stops at the first database write error, so a schema change
cannot produce a warning-only successful discovery run. A supervisor killed with
SIGKILL cannot write its end line; cron still
retries because no success marker is written. OS locks release when the last
child exits; the timeout kills the run's process group after 30 seconds of grace.

Technical evidence, QA and install-options steps print bounded counts, report
paths and at most five failure examples. Full evidence stays in JSON files;
install-options remains dry-run. Step stdout/stderr is capped at 128 KiB in the
job log, keeping the first part and the last 16 KiB, so a late failure reason
survives; the full step output is saved as `<run id>-console.log` in the job's
report folder, and the command exit status is preserved. Dependency output and
checkout update output each have a 32 KiB cap with the same head-and-tail rule. Keep other setup/catch-up output
small: each run must stay well below the dashboard's 250,000-byte tail. Dedupe
and discovery writes print counts; catalog and source-host errors and per-row
refresh messages are also covered by the step cap. Markdown job summaries
remain complete files and never enter stdout.

Catalog and technical JSON reports and Markdown summaries are dated under
`/srv/stack127-data/self-host-apps/reports/<job>/`. Report writers rename temporary
files atomically. Each run deletes only that job's reports older than 60 days.
Do not delete another job's files or use these evidence reports to apply facts
without source review. Technical failures now include attempted URLs and HTTP
errors, so dead sources can be distinguished from temporary network failures.
Docker Hub publisher READMEs use its public repository API, paced at two requests
per second. The collector avoids registry requests when a GitHub README or
Compose file is already readable. HTTP 429 respects Retry-After (capped at 60
seconds), or waits 30 seconds before retrying. It never treats throttling as a
negative factual claim.

For pre-merge validation only, a manual `--validation /absolute/checkout` uses a
working-tree copy, skips its Git update, and clearly labels the log. Cron never
uses this flag. Delete that temporary validation checkout after testing. No env
file belongs inside either checkout.
