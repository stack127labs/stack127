#!/usr/bin/env bash
set -euo pipefail
umask 077
base=/srv/stack127-db
# A manual backup uses the same guard. Create it only after a verified restore.
if [[ ! -f "$base/BACKUPS_ENABLED" ]]; then
  echo 'Backups disabled: destination has not been accepted after migration.'
  exit 0
fi
install -d -m 700 -o ubuntu -g ubuntu "$base/backups"
exec 9>"$base/.backup.lock"
flock -n 9 || { echo 'Another backup is running.'; exit 1; }
stamp=$(date -u +%Y%m%dT%H%M%S%NZ)
partial="$base/backups/.stack127-$stamp.dump.partial"
archive="$base/backups/stack127-$stamp.dump"
partial_key="$partial.vault-key"
partial_roles="$partial.roles.sql"
partial_toc="$partial.toc"
trap 'rm -f -- "$partial" "$partial_key" "$partial_roles" "$partial_toc"' EXIT
# This always addresses the new local container, never managed Supabase.
docker exec --user postgres stack127-db pg_dump --username=supabase_admin --dbname=postgres --format=custom --no-password > "$partial"
test -s "$partial"
docker exec -i --user postgres stack127-db pg_restore --list < "$partial" > "$partial_toc"
# Validate the archived snapshot, not a later live count. An empty replacement
# volume must never create a completed bundle that can evict real recovery data.
docker exec -i --user postgres stack127-db pg_restore --data-only --schema=public \
  --table=stack127_pages --table=ad_network_publishers --file=- < "$partial" \
  | python3 "$base/check-backup.py" --toc "$partial_toc"
# A database archive does not include role definitions or memberships.
docker exec --user postgres stack127-db pg_dumpall --username=supabase_admin --database=postgres --roles-only --no-role-passwords > "$partial_roles"
test -s "$partial_roles"
# Vault/pgsodium needs its separate root key as well as the logical dump.
docker exec --user postgres stack127-db cat /etc/postgresql-custom/pgsodium_root.key > "$partial_key"
test "$(wc -c < "$partial_key")" -eq 64
chmod 600 "$partial" "$partial_key" "$partial_roles"
chown ubuntu:ubuntu "$partial" "$partial_key" "$partial_roles"
mv -- "$partial_key" "$archive.vault-key"
mv -- "$partial_roles" "$archive.roles.sql"
mv -- "$partial" "$archive"
# Homelab prunes OVH only after it has received complete archive/key/roles bundles.
echo "Backup complete: $(basename "$archive")"
