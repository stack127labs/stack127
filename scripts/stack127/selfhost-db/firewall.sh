#!/usr/bin/env bash
# Opens the database port to the internet. Version127's Docker firewall drops
# every public Docker port except Cloudflare web traffic, so this rule must sit
# above its jump in DOCKER-USER. Run after that firewall, and after Docker starts.
set -euo pipefail
rule=(-i ens3 -p tcp --dport 5432 -j ACCEPT)
while iptables -C DOCKER-USER "${rule[@]}" 2>/dev/null; do
  iptables -D DOCKER-USER "${rule[@]}"
done
iptables -I DOCKER-USER 1 "${rule[@]}"
