#!/usr/bin/env bash
# Certbot deploy hook. Copies the database.stack127.com certificate where
# PostgreSQL reads it, then reloads PostgreSQL so new connections use it.
# Installed as /etc/letsencrypt/renewal-hooks/deploy/stack127-db.sh.
set -euo pipefail
lineage="${RENEWED_LINEAGE:-/etc/letsencrypt/live/database.stack127.com}"
[[ "$(basename "$lineage")" == database.stack127.com ]] || exit 0

target=/srv/stack127-db/tls
install -d -m 755 "$target"
# The image runs PostgreSQL as uid 100, gid 101. It refuses a key others can read.
install -m 644 -o 100 -g 101 "$lineage/fullchain.pem" "$target/fullchain.pem"
install -m 600 -o 100 -g 101 "$lineage/privkey.pem" "$target/privkey.pem"

if docker inspect --format '{{.State.Running}}' stack127-db 2>/dev/null | grep -qx true; then
  docker kill --signal HUP stack127-db >/dev/null
fi
