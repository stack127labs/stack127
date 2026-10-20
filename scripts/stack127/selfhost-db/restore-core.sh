#!/usr/bin/env bash
# Initial EMPTY-target restore/refill only; core-restore.py is the final cutover.
set -euo pipefail
exec node --experimental-strip-types "$(dirname -- "$0")/restore-core.mjs" "$@"
