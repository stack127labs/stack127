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
- Published host socket: **127.0.0.1:5432 only**. No public database port or Traefik route.
- Network: `stack127-db-private`, an encrypted, attachable Swarm overlay.
  Future containers on that network use `stack127-db:5432`.
- The website is Swarm service `app-navigate-1080p-matrix-3pmfy6` on `dokploy-network`.
  At the authorized switch, add the private network to its persistent Dokploy/Swarm
  configuration. A one-time `docker service update --network-add stack127-db-private
  app-navigate-1080p-matrix-3pmfy6` also attaches it, but can be lost at redeploy.
  The website was not changed or attached during setup.
- PostgreSQL TLS is off inside the encrypted overlay / local loopback. The owner
  selected Tailscale for remote access, hostname `ovh-stack127`. Enrollment, a
  tailnet-only listener, HBA and tailnet ACLs remain a separate cutover step.
  The current configuration still publishes loopback only.

Memory is capped at 2 GiB, with 512 MiB shared buffers, 4 MiB work memory,
60 connections, two parallel workers, checksums, fsync and synchronous commits.
Initial empty idle memory was 75.53 MiB after container recreation and the backup check.
After refill and backup, warm idle memory was **613.5 MiB** (Docker), with an
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

All 16 source non-system roles exist with matching source attributes:
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
No credential values belong in Git. These names do not change the running app's URL.
`supabase_admin` is the superuser. `stack127_app` is a separate login with no
superuser, database/role creation, replication or RLS bypass rights. `app-role.sql`
grants public DML, sequence access, function execution and migration-history reads
through 38 explicit backend RLS policies. The seven source policies and object
owners are preserved. Signing credentials and wake configuration are directly
readable but writable only by the admin. The app cannot create schema objects or
perform migrations; use the separate admin credential for reviewed DDL.
Other image login passwords were cleared. Socket administration requires OS postgres.

## Backups

- OVH: `stack127-db-backup.timer`, nightly **02:40 UTC**; writes custom-format
  `pg_dump` archives, matching `.dump.vault-key` and password-free `.dump.roles.sql`
  files under `/srv/stack127-db/backups/`, mode 600. Seven complete bundles are
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
  `journalctl -u stack127-db-backup-pull.service` on homelab. Timers do not send alerts.

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

The source application dump omits data for the four large ad-network tables,
retains all other public data and migration history, and keeps owners/ACLs. Filter
only SCHEMA creation entries for `public` and `extensions` out of its use-list,
retaining their ACL/comment entries. Restore pre-data, then data, with
`pg_restore --exit-on-error`. Clear `stack127_cache_worker_wake.function_url`
before restoring post-data triggers. Apply `app-role.sql` and refill only from a
consistent SQLite snapshot, with the guarded process-local target URL described
in the plan. Never change the live collector env during rehearsal.

The separate observation-query optimization in commit `9ac15544` was tested and
committed for later review; it was not copied into OVH's `/srv/stack127` checkout.
The measured rehearsal refill uses the existing deployed query.

The private overlay and external config volume are created once before first startup:
`sudo docker network create --driver overlay --attachable --opt encrypted stack127-db-private`
and `sudo docker volume create stack127-db-config`.
Recreate with `cd /srv/stack127-db && sudo docker compose up -d`.
Never remove either volume. After file edits, `docker compose up -d` does not
restart a container for changed bind-mounted file contents; explicitly restart
only `postgres` when required. Do not print `docker compose config` or full
container environment inspection, which would expand credentials.
