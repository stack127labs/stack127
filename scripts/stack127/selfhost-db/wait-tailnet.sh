#!/usr/bin/env bash
set -euo pipefail
# Scope boot ordering to this Compose project; do not delay/restart Dokploy Docker.
for attempt in {1..120}; do
  if ip -4 -o address show dev tailscale0 2>/dev/null | grep -q ' inet 100[.]117[.]88[.]8/'; then
    exit 0
  fi
  sleep 1
done
echo 'The configured database tailnet address is not assigned; leaving this project stopped.' >&2
exit 1
