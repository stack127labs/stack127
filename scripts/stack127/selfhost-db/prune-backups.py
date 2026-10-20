#!/usr/bin/env python3
"""Prune only OVH archives confirmed copied by the homelab pull process."""
from pathlib import Path
import json
import re
import sys

base = Path('/srv/stack127-db/backups')
acknowledged = json.load(sys.stdin)
if not isinstance(acknowledged, dict):
    raise SystemExit('Expected copied archive names and sizes.')
archives = sorted(base.glob('stack127-*.dump'), reverse=True)
removed = 0
for path in archives[7:]:
    if not re.fullmatch(r'stack127-[0-9]{8}T[0-9]+Z[.]dump', path.name):
        continue
    key = path.with_name(path.name + '.vault-key')
    roles = path.with_name(path.name + '.roles.sql')
    if acknowledged.get(path.name) != path.stat().st_size:
        continue
    if not key.is_file() or key.stat().st_size != 64:
        continue
    if not roles.is_file() or roles.stat().st_size == 0:
        continue
    if acknowledged.get(key.name) != key.stat().st_size or acknowledged.get(roles.name) != roles.stat().st_size:
        continue
    path.unlink()
    key.unlink()
    roles.unlink()
    removed += 1
print(f'Pruned {removed} copied OVH backup bundles.')
