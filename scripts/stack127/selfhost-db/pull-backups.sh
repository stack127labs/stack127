#!/usr/bin/env bash
set -euo pipefail
umask 077
base=/srv/data/backups/stack127-db
if [[ ! -f "$base/PULL_ENABLED" ]]; then
  echo 'Backup copy disabled: destination has not been accepted after migration.'
  exit 0
fi
mkdir -p "$base/archives"
exec 9>"$base/.pull.lock"
flock -n 9 || { echo 'Another backup copy is running.'; exit 1; }
# Use homelab's existing OVH SSH identity. OVH needs no homelab private key.
rsync -rt --chmod=F600,D700 --include='/stack127-*.dump' --include='/stack127-*.dump.vault-key' --include='/stack127-*.dump.roles.sql' --exclude='*' -e 'ssh -o BatchMode=yes -o ConnectTimeout=20' ovh:/srv/stack127-db/backups/ "$base/archives/"
# Validate complete copies and acknowledge them before pruning either host.
python3 - "$base/archives" <<'PYCOPIED' | ssh -o BatchMode=yes -o ConnectTimeout=20 ovh /srv/stack127-db/prune-backups.py
from pathlib import Path
import sys
import json
from datetime import datetime, timezone, timedelta
archives = sorted(Path(sys.argv[1]).glob('stack127-*.dump'), reverse=True)
if not archives:
    raise SystemExit('No complete OVH backup is available.')
# Preserve previous copies if transport failed or the producer stopped working.
if datetime.now(timezone.utc) - datetime.fromtimestamp(archives[0].stat().st_mtime, timezone.utc) > timedelta(hours=36):
    raise SystemExit('Latest OVH backup is over 36 hours old.')
for path in archives:
    key = path.with_name(path.name + '.vault-key')
    if not key.is_file() or key.stat().st_size != 64:
        raise SystemExit('A copied archive is missing its Vault key; retention stopped.')
    roles = path.with_name(path.name + '.roles.sql')
    if not roles.is_file() or roles.stat().st_size == 0:
        raise SystemExit('A copied archive is missing its role definitions; retention stopped.')
print(json.dumps({file.name: file.stat().st_size for path in archives for file in [path, path.with_name(path.name + '.vault-key'), path.with_name(path.name + '.roles.sql')]}))
PYCOPIED
python3 - "$base/archives" <<'PYRETENTION'
from pathlib import Path
import sys
archives = sorted(Path(sys.argv[1]).glob('stack127-*.dump'), reverse=True)
for path in archives[7:]:
    path.unlink()
    path.with_name(path.name + '.vault-key').unlink()
    path.with_name(path.name + '.roles.sql').unlink()
print('Homelab backup copy complete; up to seven backup bundles retained.')
PYRETENTION
