#!/bin/sh
# Shared entry point for the OVH timer and a manual dry run. Never trace secrets.
set -eu
PATH=/usr/local/bin:/usr/bin:/bin
export PATH
worker_env=/srv/stack127-data/cache-worker.env
if [ ! -f "$worker_env" ] || [ "$(stat -c '%a' "$worker_env")" != 600 ]; then
  echo "cache-worker.env must exist with mode 600" >&2
  exit 1
fi
if [ "$(stat -c '%u' "$worker_env")" != "$(id -u)" ]; then
  echo "cache-worker.env must belong to the worker user" >&2
  exit 1
fi
cd /srv/stack127
# The lock is outside /tmp so systemd PrivateTmp and manual invocations share it.
# Node reads dotenv directly; values are never evaluated as shell commands.
exec flock -n -E 0 /srv/stack127-data/cache-worker.lock \
  node --experimental-strip-types --env-file="$worker_env" scripts/stack127/cache/worker.mjs
