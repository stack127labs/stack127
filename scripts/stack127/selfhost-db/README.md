# Isolated stack127 database on OVH

This is the isolated migration rehearsal database. It contains a reduced production
application copy and a refill from a consistent OVH SQLite snapshot. Managed Supabase
and the website still use their existing configuration. See measured results and
the final-copy procedure in `dev-space/self-hosted-database-plan.md`, section 4.

## Service and access

- OVH project: `/srv/stack127-db/compose.yaml`, Compose project `stack127-db`.
- Image: `supabase/postgres:17.6.1.178`, pinned to amd64 digest
  `sha256:49c938c7918f1543618b60568f5a995e52d98f19883075a14f89643e8b1571fe`.
- Source and destination: PostgreSQL **17.6**. Source is aarch64; OVH is x86_64.
- Volumes: `stack127-db-data` (database) and `stack127-db-config` (including the Vault root key).
- Published host socket: **0.0.0.0:5432** (IPv4), reached as `database.stack127.com`.
  Version127's Docker firewall drops public Docker ports except Cloudflare web traffic.
  `firewall.sh` puts a 5432 accept rule above it, from `stack127-db-firewall.service`
  at boot and the `11-stack127-db-firewall.conf` Docker drop-in after Docker restarts.
- Network: `stack127-db-private`, an encrypted, attachable Swarm overlay.
  Future containers on that network use `stack127-db:5432`.
- The website is Swarm service `app-navigate-1080p-matrix-3pmfy6` on `dokploy-network`.
  At the authorized switch, add the private network to its persistent Dokploy/Swarm
  configuration. A one-time `docker service update --network-add stack127-db-private
  app-navigate-1080p-matrix-3pmfy6` also attaches it, but can be lost at redeploy.
  The website was not changed or attached during setup.
- PostgreSQL TLS is on, with a Let's Encrypt certificate for `database.stack127.com`
  (a DNS-only Cloudflare record pointing at OVH). Certbot on OVH renews it through
  Cloudflare DNS, using `/etc/letsencrypt/stack127-cloudflare.ini`. Its deploy hook,
  `install-tls.sh` (installed as `/etc/letsencrypt/renewal-hooks/deploy/stack127-db.sh`),
  copies it to `/srv/stack127-db/tls` and reloads PostgreSQL.
  From the internet, HBA allows only `stack127_app` and migration owner `postgres`,
  only over TLS (`hostssl`), using SCRAM. Docker keeps the real client address for
  public IPv4 traffic, so plain-text and admin logins from outside are refused.
  Docker port forwarding presents a bridge gateway for loopback, so private Docker
  rules enforce the same role restriction. The bootstrap superuser uses only the
  local Unix socket. Remote URLs use `sslmode=verify-full`.
- `stack127-db.service` is enabled and starts this Compose project with health
  waiting/retries. It leaves other Docker services alone.

Memory is capped at 2 GiB, with 512 MiB shared buffers, 4 MiB work memory,
60 connections, two parallel workers, checksums, fsync and synchronous commits.
Initial empty idle memory was 75.53 MiB after container recreation and the backup check.
After refill and backup, warm idle memory was **613.5 MiB** (Docker); after networking tests it was **523.8 MiB**, with an
observed cgroup peak of **1.562 GiB**, including charged file cache.
Measure with
`sudo docker stats --no-stream stack127-db`.

## Compatibility and credentials

Production metadata was read through homelab in a read-only transaction.
Its shared preload list includes pg_stat_statements, pgaudit, plpgsql, plpgsql_check,
pg_cron, pg_net, pgsodium, auto_explain, pg_tle, plan_filter and supabase_vault.
Source settings include logical WAL, 60 connections, 224 MiB shared buffers,
2,184 KiB work memory, five WAL senders and five replication slots.

| Extension | Production | Destination |
| --- | --- | --- |
| pg_cron | 1.6.4 | 1.6.4 installed; jobs disabled |
| pg_net | 0.20.3 | 0.20.4 installed; worker not preloaded |
| pg_stat_statements | 1.11 | 1.11 installed |
| pg_trgm | 1.6 | 1.6 installed |
| pgcrypto | 1.3 | 1.3 installed |
| plpgsql | 1.0 | 1.0 installed |
| supabase_vault | 0.3.1 | 0.3.1 installed |
| uuid-ossp | 1.1 | 1.1 installed |

The official Supabase image matches the Postgres minor version and supplies the
extensions and baseline roles. Its pg_net 0.20.3 → 0.20.4 upgrade script has no SQL
changes. Installation and
restoration were rehearsed with HTTP processing disabled. All eight extension
inventory entries matched the source, with only that reviewed patch difference.

All 16 source non-system roles were restored and checked before intentional migration-login restrictions:
`anon`, `authenticated`, `authenticator`, `dashboard_user`, `pgbouncer`, `postgres`,
`service_role`, `supabase_admin`, `supabase_auth_admin`, `supabase_etl_admin`,
`supabase_functions_admin`, `supabase_privileged_role`, `supabase_read_only_user`,
`supabase_realtime_admin`, `supabase_replication_admin`, `supabase_storage_admin`.
The functions and realtime roles were added explicitly because the image does not
start those services. All 21 source memberships and per-role settings were
verified before application grants. Managed login passwords were not copied.

Credentials were generated on homelab in `/srv/data/projects/stack127/.env.selfhost-db`
(owner `teja`, mode 600), then copied directly to `/srv/stack127-db/.env`
(owner `ubuntu`, mode 600). The files contain `POSTGRES_PASSWORD`,
`STACK127_APP_PASSWORD`, connection metadata and `SELFHOST_*` connection URLs.
The staged files now also contain `DATABASE_MIGRATION_URL`,
`SELFHOST_DB_MIGRATION_USER`, `SELFHOST_DB_MIGRATION_PASSWORD`,
`SELFHOST_DATABASE_URL_REMOTE`, `SELFHOST_DATABASE_URL_LOOPBACK`,
`SELFHOST_DATABASE_URL_DOCKER` and `SELFHOST_DB_MIGRATION_URL_LOOPBACK`.
No credential values belong in Git. These names do not change the running app's URL.
The old staged `SELFHOST_DB_ADMIN_URL` is retained but its bootstrap login is now
blocked on network paths; use the migration URL for remote DDL, or the Unix socket
for emergency superuser administration.
`supabase_admin` is the superuser. `stack127_app` is a separate login with no
superuser, database/role creation, replication or RLS bypass rights. `app-role.sql`
grants public DML, sequence access, function execution and migration-history reads
through 38 explicit backend RLS policies. The seven source policies and object
owners are preserved. Signing credentials and wake configuration are directly
readable but writable only by the admin. The app cannot create schema objects or
perform migrations. The separate migration credential uses restored owner
`postgres`, NOSUPERUSER/NOCREATEDB/NOCREATEROLE/NOREPLICATION/BYPASSRLS, with all
nine source memberships revoked and a five-connection limit. `migration-role.sql`
reads its password privately from the process environment. Real remote app reads,
owner DDL with rollback, and CLI migration dry-run passed. Keep the app and migration
URLs separate. Defaults for objects created by migration owner `postgres` grant
public table DML and sequence USAGE/SELECT/UPDATE to the app. They do not enable
RLS or create policies. New tables must enable RLS and include reviewed backend
policies; re-run `app-role.sql` after migrations adding tables and check app access
before builds/consumers use them. Prefer policy SQL in the migration because the
automated release builds immediately after migration push. The app also has SELECT-only access to the single retired cache-job
name in `cron.job`, through an explicit RLS policy, so the Node worker can detect
legacy wiring without permission to schedule jobs. PUBLIC EXECUTE on cron
functions is revoked on this isolated cluster; only the migration owner retains
that access. An actual app scheduling attempt was denied.
Other image login passwords were cleared. Socket administration requires OS postgres.

## Backups

- OVH: `stack127-db-backup.timer`, nightly **02:40 UTC**; writes custom-format
  `pg_dump` archives, matching `.dump.vault-key` and password-free `.dump.roles.sql`
  files under `/srv/stack127-db/backups/`, mode 600. The directory is explicitly
  recreated as `ubuntu:ubuntu`, mode 0700, by both the script and service.
  Before publishing a bundle, `check-backup.py` requires archived TABLE DATA
  for `stack127_pages` and `ad_network_publishers`, at least one page and
  1,000 publishers. These counts come from the archive snapshot. An empty/recreated
  volume or undersized snapshot fails the service and cannot enter retention.
  Review the publisher floor explicitly if intentionally shrinking that dataset.
  Seven complete bundles are
  retained after a successful homelab copy.
- Homelab: `stack127-db-backup-pull.timer`, nightly **03:10 UTC**; uses existing
  homelab-to-OVH SSH access to copy the bundles into
  `/srv/data/backups/stack127-db/archives/`, retaining seven bundles.
  OVH does not have a homelab SSH route or key, so homelab pulls the files.
  Only complete copied dump/key/roles bundles are pruned on OVH; a failed copy
  can leave more than seven local bundles until the next successful pull. The pull
  rejects a latest archive older than 36 hours.
- Both timers are installed, **disabled and inactive**. Both scripts also require
  marker files. A missing marker makes a manual invocation harmless.
- Role exports omit password hashes. During recovery, set the new admin/app login
  credentials privately from homelab's protected env file before reconnecting
  consumers; the role SQL alone does not restore login passwords.
- A populated **70,428,235-byte** backup was restored into an isolated scratch
  container: backup **15.145s**, restore **47.385s**, complete successful recovery
  **67.786s**. All table counts, migrations, sequences, grants/RLS, functions,
  triggers and both keys matched. Scratch resources were removed. The complete
  bundle was copied to homelab in **32.865s**, with exact byte equality and mode
  600 verified for all three files. Acceptance markers were removed afterward.
- Inspect failures with `journalctl -u stack127-db-backup.service` on OVH and
  `journalctl -u stack127-db-backup-pull.service` on homelab. Backup/copy failures exit nonzero; the copy also fails when its newest bundle
  is over 36 hours old, preserving retained archives, so a stopped OVH backup
  also fails the homelab copy.
- Failure alerts: when either job fails, its `OnFailure=` unit runs
  `backup-alert.py`, which opens a GitHub issue named
  `Database backup failed: <job>`. The next good run closes it. The script reads
  only `GITHUB_ALERT_TOKEN`: on OVH from `/srv/stack127-data/ad-networks.env`, on
  homelab from `/srv/data/projects/stack127/.env.deploy`. Install it as
  `/srv/stack127-db/backup-alert.py` on OVH and
  `/srv/data/backups/stack127-db/bin/backup-alert.py` on homelab, with
  `stack127-db-backup-alert.service` and `stack127-db-backup-pull-alert.service`
  beside the backup units.

After the coordinator has restored and accepted data, enable on each host:

```sh
# OVH
sudo touch /srv/stack127-db/BACKUPS_ENABLED
sudo systemctl enable --now stack127-db-backup.timer
# homelab (as teja)
touch /srv/data/backups/stack127-db/PULL_ENABLED
sudo systemctl enable --now stack127-db-backup-pull.timer
```

Keep `cron.launch_active_jobs=off` and pg_net out of preloads
until it is safe to run copied jobs and HTTP requests. Existing managed Vault
ciphertext requires its original key or a deliberate decrypt/re-encrypt migration;
the new local key cannot decrypt it. Keep each backup's root key and password-free role export with its dump.

## Empty-target preparation and restore

`install-pgnet.py` refuses a populated target. On an empty destination it temporarily
preloads pg_net, installs 0.20.4 and removes the preload again before application
rows are imported. `prepare-target.sql` then preserves the extension schema and
initdb public-schema baseline, while removing conflicting image helper functions.
Do not run these over rehearsal or live data.

The initial source application archive omits data for the four large ad-network
tables, retains other public data and migration history, and keeps owners/ACLs.
After the matching roles and pg_net SQL have been prepared, use the committed
entry point on an **empty** OVH target:

```sh
/srv/stack127-db/restore-core.sh \
  --archive /srv/stack127-db/rehearsal-reduced/source.dump \
  --work-directory /srv/stack127-db/initial-restore-NEW \
  --confirm stack127-empty-restore
```

Copy `restore-core.sh`, `restore-core.mjs`, `prepare-target.sql` and `app-role.sql`
from this directory into `/srv/stack127-db/` together. The script requires the
mode-0600 staged env file, a prepared PostgreSQL 17 target with pg_net 0.20.4 SQL
installed, no HTTP preload, cron off, matching roles and no public tables. It
compares `pg_control_system().system_identifier` through the app's loopback TCP
connection with the selected container's Unix socket before any database mutation.
It filters only the two conflicting SCHEMA creation entries, preserves ACL/owner
entries, and restores pre-data/data/post-data with `--exit-on-error`. The wake URL
is set NULL before post-data triggers. No roles/passwords are imported from the
archive.

It then applies app grants, rechecks target identity/isolation, creates a consistent
snapshot through `snapshot-local.mjs`, and runs `sync.mjs` against that snapshot.
The child receives only the target `DATABASE_POOLER_URL`, explicit production
marker and a small OS environment allowlist. Alternate URLs, administrator/API
credentials and Node injection options are excluded. Neither the live SQLite file
nor `/srv/stack127-data/ad-networks.env` is edited. The private work directory
contains stage logs, snapshot and measured timings. A failed restore is not
retried over partially populated data; the operator must prepare a fresh target.

For an isolated scratch test only, `--container stack127-db-rehearsal-scratch
--loopback-host 127.0.0.2 --sqlite-source <synthetic-store>` selects the dedicated
loopback test binding. The production invocation always uses 127.0.0.1:5432.
The populated rehearsal target is refused. The final cutover keeps the frozen
refill and uses `core-restore.py` below, rather than running this empty-target path.

The separate observation-query optimization in commit `9ac15544` was tested and
committed for later review; it was not copied into OVH's `/srv/stack127` checkout.
The measured rehearsal refill uses the existing deployed query.

The private overlay and external config volume are created once before first startup:
`sudo docker network create --driver overlay --attachable --opt encrypted stack127-db-private`
and `sudo docker volume create stack127-db-config`.
Start/restart this database with `sudo systemctl restart stack127-db.service`.
Never remove either volume. After file edits, `docker compose up -d` does not
restart a container for changed bind-mounted file contents; explicitly restart
only `postgres` when required. Do not print `docker compose config` or full
container environment inspection, which would expand credentials.

## Final core copy without refilling again

The accepted refill stays frozen. Follow section 5 of the plan, not the empty-target
instructions above. `make-services.mjs` prepares mode-0600 source/app/migration libpq
files on homelab without opening a database. `source-check.py` compares the source's
small ad-network revision token and optionally its catalog metadata against the
rehearsal; it never scans the four large tables. `snapshot-source.sql` writes a
private, secret-bearing source rollback script before the owner retires old wiring.

`ad-network-guard.py` compares all seven frozen tables and their two sequences with
a backup-derived private baseline. `core-restore.py` retains these tables and the
existing schema/ACL/RLS, replaces the other 31 public tables plus migration history
inside one transaction, verifies archive counts and 24 foreign keys, and preserves
the disabled wake. A failed data transaction also restores original core sequence
states, since `setval` itself does not roll back. An injected failure and successful
core replacement both passed on an isolated scratch container: 6.086s SQL, 30.035s
including frozen-data checks, all 219 migrations and the refill preserved. No final
source dump or main-target core replacement has been run yet.

The two branch PRs are opened by the owner. Merge order is #58, then
`refactor/ad-networks-cron`, then `feat/node-cache-worker`; #60 is outside this move.
The worker branch includes the separate migration secret fallback and independent
`STACK127_CACHE_WORKER_RUNTIME=node` activation. GitHub reaches the database at
`database.stack127.com` with a password over verified TLS; no network add-on is needed.
