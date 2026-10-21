#!/bin/sh
# The job name is also the Automation Monitor identity and log filename.
set -eu
PATH=/usr/local/bin:/usr/bin:/bin
export PATH
job=${1:-}
[ "$job" = launch-directory-metrics ] || { echo "Usage: run-job.sh launch-directory-metrics [options]" >&2; exit 1; }
shift
cd /srv/stack127
job_env=/srv/stack127-data/launch-directory-metrics.env
[ -f "$job_env" ] && [ "$(stat -c '%a' "$job_env")" = 600 ] && [ "$(stat -c '%u' "$job_env")" = "$(id -u)" ] || {
  echo "Metrics env must exist, belong to the job user, and have mode 600" >&2; exit 1;
}
exec >>"/srv/stack127-data/logs/$job.log" 2>&1
echo "== $(date -u +%FT%TZ) start $job $*"
rc=0
nice -n 10 flock -n -E 76 /srv/stack127-data/launch-directory-metrics.lock \
  node --experimental-strip-types scripts/launch-directories/refresh-metrics.mjs \
  --env-file "$job_env" --environment production --confirm stack127-production --apply "$@" || rc=$?
echo "== $(date -u +%FT%TZ) end $job exit $rc"
exit "$rc"
