# Keep the shared OVH job checkout current

An hourly cron job fast-forwards `/srv/stack127` to `origin/main`. It runs as
`ubuntu` at minute 25 UTC, away from verification at minute 40. A missed or
skipped update is retried next hour, including after a restart. Both cron and
manual runs start only at UTC minutes **15–28**. The ten-minute timeout plus
30-second kill period then finishes before verification at :40, with at least
30 seconds to spare. Other shared-checkout cron starts are at :00 and 00:10.
This prevents the updater's non-blocking locks from costing a monthly or weekly
job its only scheduled turn. Recheck this window against OVH's crontab whenever
a shared-checkout schedule changes. Cron must be enabled. This updates job code; it does not deploy the website or publish data.
The separate self-host checkout and installed supervisor are unchanged.

The installed updater lives outside Git at
`/srv/stack127-data/checkout/run-job.sh`. It takes its own OS lock, checks the
maintenance hold, live `/tmp/adn-pending-*` PIDs (including six-hour retry
wrappers), every known ad-network job lock and existing `/tmp/adn-*.lock`, the
launch-directory lock, the cache-worker lock, and readable `/proc/*/cwd` links
pointing into `/srv/stack127`. It rechecks the hold, PIDs and cwd after locking.
All locks stay held through Git and dependency installation. Keep the known job
list in `update.sh` current when adding a job; a new job may not have created its
lock yet. It never deletes job lock files or pending markers.

The cache worker already takes `/srv/stack127-data/cache-worker.lock` before
starting Node. This path works with its systemd `PrivateTmp`. A worker that loses
the lock exits normally. If it sees the update journal, it fails visibly as
described below. Either way it retries on its next 30-second timer. No service
change or sudo is needed. There remains a small race
where systemd opens the checkout-owned shell wrapper while Git replaces it;
the lock prevents Node and its dependencies from running during the update.
An invocation failing during that shell-start race recovers on the next timer.
Already running wrappers and commands are caught by the cwd scan. Other users'
unreadable cwd links cannot be inspected without sudo. Manual operators must
use the hold; the scan is an extra guard, not a substitute.

The updater refuses ordinary dirty files, untracked files, unpublished commits,
a branch other than `main`, or a non-fast-forward. It never stashes, rebases,
force-fetches, or resets an ordinary dirty tree. An atomic journal records the
phase, base and target before Git starts. Fetch records the current HEAD as both
base and target. It fetches only `origin/main`, without tags, pruning,
`FETCH_HEAD` writes or auto-maintenance. After an interrupted fetch, recovery
removes only `refs/remotes/origin/main.lock`; it never resets the index or
working tree. HEAD must still equal the recorded base. Any edits then fail the
ordinary clean-tree check and remain untouched.

After fetch and ancestry checks, the updater prepares the target packages in
`/srv/stack127-data/checkout/staging/new`, using `package.json` and
`package-lock.json` read directly from the fetched commit. It runs
`npm ci --omit=dev --ignore-scripts --no-audit --no-fund` there when the lockfile
hash differs from the last successful install, or `node_modules` is absent.
The first run with no hash installs once to establish that baseline. A failed
staging install leaves live code, dependencies and the old success marker
unchanged. A code-only change does not reinstall packages.

Staging and `/srv/stack127` must be on the **same filesystem**. The updater
checks this before touching live code. It rejects absolute dependency symlinks
and links escaping the staged `node_modules`, including local linked packages.
Relative `.bin` symlinks survive the rename. Install as `ubuntu`, the same user
as the cron jobs and cache worker; staged files must belong to that user.
`--ignore-scripts` prevents install hooks from embedding the staging path.
The staging tree is private (the updater uses umask 077); jobs running as
`ubuntu` can still read and execute it after the rename. Allow disk space for
both the old and new dependency trees during an update.

An `apply` journal records the base and target before the live fast-forward.
The updater then renames live `node_modules` to `staging/old-node_modules` and
renames the staged tree into place. Renames cannot fall back to copying across
filesystems. It writes the new dependency marker **last**, keeps the old tree
and marker available until it removes the journal, then deletes staging.

Any ordinary error or TERM/INT signal during the live update runs recovery
**before releasing the job locks**. Recovery rolls back to the recorded base,
restores the old dependency folder and marker, and removes the journal only
after the tree is clean. It first resets the index to target without checking
out files, then resets to base, so files created by an interrupted Git checkout
are removed too. A hard kill or power loss can interrupt that recovery; the
next safe-window updater run repeats it before fetching. Every rename boundary
is recoverable. A failed cleanup after the journal has gone leaves the new code
and new dependencies consistent; the next run clears leftover staging.

Recovery may remove only `index.lock`, `HEAD.lock`, `ORIG_HEAD.lock` and
`refs/heads/main.lock` for an apply/merge journal. It validates HEAD against the
recorded base and target. Older merge-only journals are still accepted: these
complete the recorded target after staging a fresh dependency install, because
the old supervisor may already have damaged the live dependencies. Startup
recovery refuses while an ubuntu Git process is alive. Same-run recovery has
already waited for its own synchronous Git child to exit. Locks outside the
journaled phase are preserved and fail for operator inspection, as does any
Git lock without a journal. Unrelated untracked files remain and block recovery;
the journal stays for review if recovery itself cannot finish.

The ad-network, launch-directory and cache-worker wrappers check
`/srv/stack127-data/checkout/update-in-progress` before starting, and check again
after acquiring their job lock. If it exists, they print
`ERROR: checkout update in progress or interrupted` and exit **1**, so the run
fails visibly instead of showing as skipped. Cron wrappers keep the dashboard's
start/end markers. The cache worker uses its existing service and journal;
there is no unit change. A hard-killed update therefore blocks jobs until the
updater recovers. These guards reach OVH with the merged checkout on its next
successful update; they do not protect an older checkout before that update.

As with the self-host journal, **apply/merge recovery** may overwrite tracked
files and untracked files in the way of tracked target paths. **Never edit this
checkout without first setting the hold and waiting for the updater to finish.**
After a crash, inspect the journal before making manual edits; do not leave
operator edits for automatic recovery to overwrite. An invalid journal or
unexpected HEAD fails without reset. Never delete the journal to bypass a guard.

Drift between the installed updater and the new repo copy fails visibly after
updating; the new code and dependencies are already consistent. Fetching
continues on later runs so a reviewed repair can still arrive. Reinstall the
reviewed copy by atomic rename below. It never rewrites itself.

The entire update has a ten-minute timeout, then 30 seconds to terminate its
process group. Git cannot prompt and has connection/low-speed timeouts. npm has
a 1 GB V8 heap cap, and the run uses low CPU priority. Output keeps its first
48 KiB and last 16 KiB. Logs use the dashboard's exact start/end markers in
`/srv/stack127-data/logs/stack127-checkout-update.log`; existing log rotation
covers this path. Exit 76 means outside the safe start window or held/busy, and
shows as skipped. Other nonzero exits are failures. An overlapping updater is silent to preserve the active
run's marker pair. A SIGKILL can leave a start without an end; OS locks release
when the remaining children stop, and cron retries.

## Install after review and merge

Run from the lead's local checkout containing the reviewed, merged source. Do
not install during a data-maintenance window, an active release, or while main
is advancing. Preserve every existing pause prefix in crontab. These commands
make no change to cron's other entries. Copying the supervisor from here also
bootstraps a stale OVH checkout without a manual Git pull. Run the install and
its **first updater invocation at UTC minutes 15–28**. Check the server's clock
with `ssh ovh 'date -u'`. If the install crosses the window boundary, the updater
exits 76; retry it in the next safe window before adding cron.

```sh
(
set -eu
ssh ovh 'set -eu
minute=$(date -u +%M)
case "$minute" in 1[5-9]|2[0-8]) ;; *) echo "Install and first run require UTC minutes 15–28" >&2; exit 76 ;; esac
test ! -e /srv/stack127-data/state/checkout-hold
[ "$(id -un)" = ubuntu ]
systemctl is-enabled cron
command -v git npm node python3 timeout flock sha256sum pgrep
install -d -m 700 /srv/stack127-data/checkout /srv/stack127-data/checkout/staging
install -d -m 755 /srv/stack127-data/logs
[ "$(stat -c %d /srv/stack127)" = "$(stat -c %d /srv/stack127-data/checkout/staging)" ] || { echo "Staging and checkout must share a filesystem" >&2; exit 1; }'
scp scripts/stack127/checkout/update.sh ovh:/srv/stack127-data/checkout/run-job.sh.new
scp scripts/stack127/checkout/crontab.txt ovh:/srv/stack127-data/checkout/crontab.reviewed
ssh ovh 'set -eu
bash -n /srv/stack127-data/checkout/run-job.sh.new
chmod 700 /srv/stack127-data/checkout/run-job.sh.new
mv /srv/stack127-data/checkout/run-job.sh.new /srv/stack127-data/checkout/run-job.sh
/bin/bash /srv/stack127-data/checkout/run-job.sh stack127-checkout-update
git -C /srv/stack127 rev-parse HEAD
tail -n 30 /srv/stack127-data/logs/stack127-checkout-update.log'
)
```

Watch this first run to its end. The wrappers on OVH before this release do
not check the update journal, so only a hard kill of this one run (SIGKILL,
reboot) could let a job start on half-updated files. If the first run ends
without an `end stack127-checkout-update` line or leaves
`/srv/stack127-data/checkout/update-in-progress`, rerun it at once inside the
window: recovery rolls the checkout back and finishes the update. After the
first success, every wrapper carries the journal guard.

An outside-window, held or busy run exits 76. Wait for UTC minutes 15–28 and
for the existing job or hold to clear, then retry the first run:

```sh
ssh ovh '/bin/bash /srv/stack127-data/checkout/run-job.sh stack127-checkout-update && git -C /srv/stack127 rev-parse HEAD'
```

Never remove locks to force it through. Require exit 0 and compare its SHA with
the reviewed released main. Stop if main advanced unexpectedly. Then append cron once:

```sh
ssh ovh 'set -eu
crontab -l > /srv/stack127-data/checkout/crontab.before
if ! grep -q "^# BEGIN stack127 checkout update" /srv/stack127-data/checkout/crontab.before; then
  if grep -q "/srv/stack127-data/checkout/run-job.sh" /srv/stack127-data/checkout/crontab.before; then
    echo "Existing updater entry without managed block; inspect before installing" >&2
    exit 1
  fi
  cat /srv/stack127-data/checkout/crontab.before /srv/stack127-data/checkout/crontab.reviewed > /srv/stack127-data/checkout/crontab.new
  crontab /srv/stack127-data/checkout/crontab.new
fi
crontab -l
cmp /srv/stack127-data/checkout/run-job.sh /srv/stack127/scripts/stack127/checkout/update.sh'
```

Require one `25 * * * *` updater line, all prior entries and pauses, and a fresh
`end stack127-checkout-update exit 0` after the next cron run. The dashboard
probe derives the name from `run-job.sh stack127-checkout-update`, then reads
start/end markers from that job's log under its configured worker directory.
The name maps to `stack127-vps/stack127-checkout-update` in `monitoring.json`.
After homelab's main checkout receives this manifest, confirm the **Server
upkeep → Update OVH job code** row, hourly minute-25 schedule, result and log in
`https://monitor.ravitejaknts.com`. No dashboard code change is needed.

Reinstall future updater changes with the same syntax-check, chmod and atomic
rename. Use the hold below first if an updater is active; do not replace a
running supervisor. Do not install a different version from another branch.

## Maintenance hold and manual commands

For a manual update, use the command above only at UTC minutes 15–28, before
opening the maintenance hold. Outside that window the updater exits 76 without
taking job locks or changing code. After maintenance, remove your hold and let
the next minute-25 cron run catch up, or run manually in the next safe window.
Do not bypass the time guard for installation, recovery or a paused collector.

The hold survives a restart. It pauses only the updater, not collectors or cache
dispatch. Keep the exact cron-prefix and timer procedure in the [ad-network
runbook](../../../content_docs/ad-networks/production-runbook.md#1-open-a-maintenance-window).
Before touching code or starting manual work in `/srv/stack127`, create the hold
and wait for an already-running updater. Refuse an existing hold rather than
claiming another operator's window:

```sh
ssh ovh 'set -eu
install -d -m 755 /srv/stack127-data/state
(set -C; : > /srv/stack127-data/state/checkout-hold)
flock -w 660 /srv/stack127-data/checkout/updater.lock true'
```

If waiting fails, leave the hold and investigate. Verify the expected revision
before running commands. Keep the hold through the complete maintenance window,
including corrections, sync, history repair and acceptance. When that work is
complete, remove only the hold you created:

```sh
ssh ovh 'rm /srv/stack127-data/state/checkout-hold'
```

The next hourly run catches up. Never clear someone else's hold, delete a
journal to bypass recovery, or pull/install packages underneath active jobs.
