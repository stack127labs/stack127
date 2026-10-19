#!/bin/sh
# Run one ad-network job against production. Usage: run-job.sh <job> [refresh.mjs options]
# Jobs share one database lock (refresh.mjs exits 75 when it is taken). Scheduled
# jobs retry for up to 6 hours, and verification steps aside while one waits.
set -u
job=$1; shift
cd /srv/stack127 || exit 1
set -a; . /srv/stack127-data/ad-networks.env; set +a
pending=/tmp/adn-pending-$job
if [ "$job" = verification ] && ls /tmp/adn-pending-* >/dev/null 2>&1; then exit 0; fi
exec >>"/srv/stack127-data/logs/$job.log" 2>&1
if [ "$job" != verification ]; then touch "$pending"; trap "rm -f $pending" EXIT; fi
echo "== $(date -u +%FT%TZ) start $job $*"
tries=0
while :; do
  rc=0
  nice -n 10 flock -n -E 76 "/tmp/adn-$job.lock" node --no-warnings --experimental-strip-types scripts/ad-networks/refresh.mjs \
    --job "$job" --environment production --confirm stack127-production --apply \
    --local-database "$AD_NETWORK_DB_PATH" --state-directory "$AD_NETWORKS_STATE_DIRECTORY" "$@" || rc=$?
  [ "$rc" = 76 ] && { echo "already running"; break; }
  [ "$rc" = 75 ] && [ "$job" != verification ] && [ "$tries" -lt 360 ] || break
  tries=$((tries + 1)); sleep 60
done
echo "== $(date -u +%FT%TZ) end $job exit $rc"
exit $rc
