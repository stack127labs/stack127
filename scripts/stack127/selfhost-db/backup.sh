#!/usr/bin/env bash
set -euo pipefail
umask 077
base=/srv/stack127-db
# A manual backup uses the same guard. Create it only after a verified restore.
if [[ ! -f "$base/BACKUPS_ENABLED" ]]; then
  echo 'Backups disabled: destination has not been accepted after migration.'
  exit 0
fi
mkdir -p "$base/backups"
exec 9>"$base/.backup.lock"
flock -n 9 || { echo 'Another backup is running.'; exit 1; }
stamp=$(date -u +%Y%m%dT%H%M%S%NZ)
partial="$base/backups/.stack127-$stamp.dump.partial"
archive="$base/backups/stack127-$stamp.dump"
partial_key="$partial.vault-key"
trap 'rm -f -- "$partial" "$partial_key"' EXIT
# This always addresses the new local container, never managed Supabase.
docker exec --user postgres stack127-db pg_dump --username=supabase_admin --dbname=postgres --format=custom --no-password > "$partial"
test -s "$partial"
docker exec -i --user postgres stack127-db pg_restore --list < "$partial" > /dev/null
# Vault/pgsodium needs its separate root key as well as the logical dump.
docker exec --user postgres stack127-db cat /etc/postgresql-custom/pgsodium_root.key > "$partial_key"
test "$(wc -c < "$partial_key")" -eq 64
chmod 600 "$partial" "$partial_key"
chown ubuntu:ubuntu "$partial" "$partial_key"
mv -- "$partial_key" "$archive.vault-key"
mv -- "$partial" "$archive"
# Homelab prunes OVH only after it has received complete archive/key pairs.
echo "Backup complete: $(basename "$archive")"
