# Production database move to OVH

Working plan and measured rehearsal for 19 October 2026. The owner has chosen self-hosted production Postgres. Managed development stays unchanged. The application still uses managed Supabase; the isolated OVH target contains rehearsal data only.

Build and rehearse beside the current Supabase project. Switch production consumers together during one write freeze. Keep Supabase running for rollback and existing Storage objects; the owner chose to retain Storage.

## 1. Verified production inventory

Checked the requested repo docs, live GitHub key names, OVH container env names, homelab env names and niche units, Supabase function/secret names, and read-only production SQL through `scripts/ad-networks/runtime-db.mjs` / `targetPool({environment:'production'})`, with `node --env-file=.env.deploy` on homelab. Values and project references are deliberately omitted. Public checks confirm Cloudflare static hosting is live: frontend and backend both report commit `c531ca6da91132a77d503b9c3c5ffb1aaeb00608`.

### Connections and credentials

| Surface and path | Names and consumers | Cutover action |
| --- | --- | --- |
| Homelab `/srv/data/projects/stack127/.env.database` | `DATABASE_URL`, `DATABASE_POOLER_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`. Production publishers, import/export scripts, recovery scripts and niche sorting. | Change both database URLs. Keep Supabase API keys only for Storage; prevent the production Data API fallback below. |
| Homelab `/srv/data/projects/stack127/.env.deploy` | `SUPABASE_ACCESS_TOKEN` manages the old project. `GITHUB_ALERT_TOKEN` supports jobs. | Keep for rollback/Storage administration. Do not repurpose the Supabase token as a Postgres credential. |
| Macs and other mirrored checkouts: `.env.database`, `.env.deploy` | Mirrors of homelab; running processes retain their old environment/connections. | Edit only the homelab source. Allow about two minutes for mirrors, verify target identity privately, and restart affected processes. Never edit the Mac mirrors. |
| Homelab `.env.local` | Same five database/API names, plus development `SUPABASE_ACCESS_TOKEN`. An old `.env.local.backup-20260926T030822Z` also exists. | Development and its backup are outside this migration. |
| GitHub repository secrets, `stack127labs/stack127` | Exactly `DATABASE_URL`, `DATABASE_POOLER_URL`. Several scheduled jobs read only the latter. | Replace both together. The pooler-named secret can point directly to OVH initially. |
| GitHub protected `production` environment secrets | Database/platform names: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_ACCESS_TOKEN`. Related existing names: `AD_NETWORKS_ALERT_TOKEN`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`, `CLOUDFLARE_API_TOKEN`, `DOKPLOY_API_KEY`, `GHCR_DOKPLOY_TOKEN`. No database URL overrides currently exist here. | Keep Storage/API management credentials where needed. Remove the Edge Function deployment step before retiring its access. Avoid introducing a stale environment-level database override. |
| GitHub `production` variables | `SUPABASE_PROJECT_REF`; also `STACK127_FRONTEND_HOSTING`, `STACK127_SITE_URL`, `STACK127_DOKPLOY_API_URL`, `STACK127_DOKPLOY_APPLICATION_ID`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, `GHCR_DOKPLOY_USERNAME`. Repository variables contain `STACK127_FRONTEND_HOSTING` only. | The project ref remains an old-project administration identifier, never a new Postgres host. Keep both hosting switches unchanged and equal. |
| Dokploy website app `app-navigate-1080p-matrix-3pmfy6`; identity in `scripts/stack127/deployment/targets.json` | Live container has `DATABASE_URL` only for database access. Other app names: `NEXT_PUBLIC_SITE_URL`, `GOOGLE_ANALYTICS_ID`, `UMAMI_URL`, `UMAMI_WEBSITE_ID`; image/runtime names include `STACK127_BUILD_SHA`, `NODE_ENV`, `PORT`, `NEXT_TELEMETRY_DISABLED`, `NODE_VERSION`, `YARN_VERSION`, `PATH`. Network: `dokploy-network`. | Update the saved Dokploy app environment and replace/restart the website task, so its existing pg pool closes. Changing a container alone is not persistent configuration. |
| GitHub build files: `.github/workflows/stack127-release-e2e.yml`, `Dockerfile` | Release creates an ephemeral `.env.database`; BuildKit secret `stack127-database-env` mounts it as `/app/.env.production` for prerendering. Frontend builds also inherit the workflow database/API keys. | Ensure both build paths use the new URLs. Preserve secret mounts and removal of env files from standalone output. |
| New target credentials: homelab `/srv/data/projects/stack127/.env.selfhost-db`, OVH `/srv/stack127-db/.env` | Both now contain `POSTGRES_PASSWORD`, `STACK127_APP_PASSWORD`, `SELFHOST_DATABASE_URL`, `SELFHOST_DB_ADMIN_URL`, `SELFHOST_DB_ADMIN_USER`, `SELFHOST_DB_APP_USER`, `SELFHOST_DB_HOST`, `SELFHOST_DB_NAME`, `SELFHOST_DB_PORT`. Created by the setup worker; not active production connections. | Stage these privately; use the appropriate Docker, loopback or `database.stack127.com` host when replacing each consumer URL. Do not blindly copy a loopback URL to GitHub. |
| OVH `/srv/stack127-data/ad-networks.env` | `DATABASE_POOLER_URL`, `AD_NETWORKS_RUNTIME_ENVIRONMENT`, `AD_NETWORK_DB_PATH`, `AD_NETWORKS_STATE_DIRECTORY`, `GITHUB_ALERT_TOKEN`. Loaded by `scripts/ad-networks/ovh/run-job.sh`. | Change its database URL to the OVH local endpoint. Keep mode 0600. OVH crontab is currently empty; the runbook records the pause at 12:15 UTC today. |
| Homelab `/home/teja/.config/systemd/user/stack127-ad-network-niche.service` and matching `.timer` | Service loads `.env.deploy`, runs `scripts/ad-networks/niche-sort.mjs --environment production` from `/srv/data/projects/stack127`; the runtime helper reads `.env.database`. Sunday 06:00 UTC timer is enabled/active; service was inactive. | Pause timer and drain any run for cutover. After env mirrors and connectivity checks, restart/resume against OVH. |

Live GitHub names differ from the older `stack127_docs/environment-inventory.md`: production API secrets, access token and project-ref variable are now present.

The project reference is also embedded in existing connection/API URLs, public media URLs, `next.config.ts`, `lib/hardware-directories/data/*.json`, and historical SQL. Keep existing asset URLs when retaining Storage. Development preview scripts under `scripts/{chmod-calculator,storage-tools,zigbee-devices}/` contain old production deny checks and explicit development allow checks; they do not connect production during normal previews.

### Every workflow that connects

All paths below are under `.github/workflows/`. Each database job, including the Docker BuildKit build, reaches `database.stack127.com` with a password over verified TLS. No network add-on is needed.

| Workflow files | Use |
| --- | --- |
| `stack127-ci.yml` | Production-backed PR builds and static frontend preview. The `verify-production-build` job uses the production environment. |
| `stack127-release-e2e.yml` | Migration push, production build, frontend snapshot/acknowledgement, deployment checks; currently also deploys `cache-worker` with `SUPABASE_ACCESS_TOKEN` / `SUPABASE_PROJECT_REF`. |
| `stack127-frontend-refresh.yml` | Queue snapshot, database-backed static export, API checks and queue acknowledgement. |
| `stack127-publish-pages.yml` | Writes publication batches and builds/verifies the frontend. |
| `stack127-cache-maintenance.yml` | Queue/worker checks, legacy backup processing or Cloudflare refresh dispatch. Has its own concurrency group, so the release lock alone does not freeze it. |
| `self-host-apps-discovery-github.yml`, `self-host-apps-discovery-directories.yml`, `self-host-apps-discovery-catalogs.yml`, `self-host-apps-discovery-lists.yml` | Scheduled discovery writes; each reads repository `DATABASE_POOLER_URL`. |
| `self-host-apps-refresh-github.yml`, `self-host-apps-refresh-source-hosts.yml`, `self-host-apps-refresh-technical.yml` | Scheduled facts/enrichment writes; each reads repository `DATABASE_POOLER_URL`. |
| `ad-network-verification.yml` | Manual Postgres verification preview; reads repository `DATABASE_POOLER_URL`. |

### What the code uses

- **SQL:** website `lib/db.ts` uses `pg`, max 4 connections per process, pooler URL first. Script clients include `scripts/stack127/tool-pages/lib.mjs`, `scripts/stack127/publishing/cli.mjs`, `scripts/self-host-apps/lib/db.mjs`, `scripts/cli-apps/lib/db.mjs`, `scripts/ad-networks/runtime-db.mjs`, `scripts/stack127/frontend/{build,content-queue}.mjs`, and `scripts/stack127/cache/*.mjs`. Some read only `DATABASE_URL`; replace both names everywhere.
- **REST/PostgREST:** `lib/public-data-api.ts` reads seven public page/catalog/course tables through `/rest/v1`. Development prefers it; production falls back to it after SQL failure. **Before switching, make production SQL-only here while preserving development behavior.** Otherwise an OVH failure could serve stale Supabase records, hidden by a successful build.
- **Storage:** `scripts/stack127/media/storage.mjs` uploads via `/storage/v1`, using `SUPABASE_URL` / `SUPABASE_SECRET_KEY`; `scripts/stack127/media/migrate-directory-icons.mjs` also connects SQL. Public images are allowed by `next.config.ts` and referenced in database rows and hardware JSON. Live buckets: public `stack127-media`, private `stack127-ad-networks-jobs`; the latter has no current repo consumer found. Storage objects are external files, not database dump contents. Keep the old project and Storage keys for now, or separately copy files and update URLs before retiring it. [Supabase restore scope](https://supabase.com/docs/guides/self-hosting/restore-from-platform).
- **Edge Functions:** only `supabase/functions/cache-worker/index.ts` is deployed. It uses the `postgres` driver and `SUPABASE_DB_URL`, not PostgREST.
- **Auth / Realtime:** no website application use found. Their managed schemas and roles exist; that alone does not require running their services on OVH. Exact auth-user count and replication/publication inventory did not complete within the read limits; do not claim those schemas are empty.
- **Other writers:** `lib/domain/cache.ts` writes `public.rdap_cache` during visitor lookups. Freeze these cache writes too, or explicitly accept discarding only those disposable cache additions.
- **Development helpers:** `scripts/platform-fees/sync-development.mjs` assumes a production `SUPABASE_URL`; `scripts/stack127/database/rebuild-development.mjs` supports non-Supabase SQL identities but checks API URLs differ. Keep Storage config for now and review those guards if it is later removed. `scripts/self-host-apps/sync-{prod-to-local,local-to-prod}.mjs` and `scripts/stack127/repos/export-dataset.mjs` read production URLs from `.env.database`.

### Database features observed

Production is **PostgreSQL 17.6**, aarch64, database `postgres`. Size: **743,607,443 bytes, 709.2 MiB** at inspection. There are 38 public tables and about 495,175 public rows from statistics, not exact counts. The largest relations are `ad_network_publishers` (387 MiB including indexes/TOAST) and `ad_network_publisher_relationships` (117 MiB).

| Extension | Installed version | Schema / relevance |
| --- | --- | --- |
| `plpgsql` | 1.0 | `pg_catalog`; functions and triggers |
| `pg_stat_statements` | 1.11 | `extensions`; query monitoring |
| `pg_trgm` | 1.6 | `extensions`; planner trigram indexes |
| `pgcrypto` | 1.3 | `extensions`; cache HMAC |
| `uuid-ossp` | 1.1 | `extensions`; preserve compatibility |
| `pg_cron` | 1.6.4 | `pg_catalog`; one active job |
| `pg_net` | 0.20.3 | `extensions`, with `net` schema; cache HTTP wake |
| `supabase_vault` | 0.3.1 | `vault`; **zero secrets** |

- `cron.job`: job 1, `stack127-cache-worker`, every `30 seconds`, active, database/user `postgres`. It calls `public.stack127_wake_cache_worker(true)`. That function is the only public function found calling `net.http*`.
- All 38 public tables have RLS enabled, none forced. Seven public SELECT policies name `anon, authenticated`. Public-table ACLs name `anon`, `authenticated`, `service_role`, and owner `postgres`. Preserve owners, policies, grants and role memberships; a new login with ordinary grants alone can still be blocked by RLS.
- Additional source roles: `authenticator`, `dashboard_user`, `pgbouncer`, `supabase_admin`, `supabase_auth_admin`, `supabase_etl_admin`, `supabase_functions_admin`, `supabase_privileged_role`, `supabase_read_only_user`, `supabase_realtime_admin`, `supabase_replication_admin`, `supabase_storage_admin`. Source `postgres` has BYPASSRLS but is not a superuser; `service_role` also has BYPASSRLS. Review imported privileges instead of granting every platform role a new password.
- Secrets also live in `public.stack127_cache_credentials.signing_key`; preserve privately. `public.stack127_cache_worker_wake.function_url` stores the old Edge Function endpoint. Dump files containing these rows are secret-bearing backups.
- `supabase_migrations.schema_migrations`: **219 rows**, versions `20260629000000` through `20261019103238` (`ad_network_cache_revision_tokens`). Copy `version,name,statements`, not just the application tables.
- Other schemas: `auth`, `cron`, `extensions`, `graphql`, `graphql_public`, `net`, `pgbouncer`, `public`, `realtime`, `storage`, `supabase_migrations`, `vault`. Storage statistics estimate 17,920 objects. A live joined object count timed out; no further full counts were run. Some later small checks also timed out, so exact counts, current wake-row state and replication state remain validation tasks.

## 2. Recommended target

### Image and Docker access

Use a **pinned `supabase/postgres` PostgreSQL 17 image**, not the full Supabase service stack. The parallel setup worker has selected `supabase/postgres:17.6.1.178`, pinned by amd64 digest in `scripts/stack127/selfhost-db/compose.yaml`. This matches production PostgreSQL 17.6. The official project also uses this image family. [Official compose](https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml).

This saves building `pg_net` and Vault and reduces restore/replay changes. Costs: a larger, vendor-specific image and initialization scripts to review. Plain `postgres:17` is simpler long term, but would need extra binaries or migrations removing those dependencies. That is more work today. Keep existing extension names/schemas for migration compatibility, with obsolete scheduling disabled.

The worker's `scripts/stack127/selfhost-db/README.md` describes OVH `/srv/stack127-db/compose.yaml`, container `stack127-db`, volumes `stack127-db-data` and `stack127-db-config`, and encrypted attachable overlay `stack127-db-private`. The website remains on `dokploy-network`; persistently attach its Dokploy/Swarm service to the private overlay at cutover. Its SQL URL then uses `stack127-db:5432`. Never use Dokploy's own Postgres or rely on a one-time network attachment that redeploy loses.

Host jobs use `127.0.0.1:5432`. Remote access uses `database.stack127.com:5432`, a DNS-only Cloudflare record for OVH, over IPv4 (no AAAA record). Compose publishes `0.0.0.0:5432`; `firewall.sh` keeps a 5432 accept rule above the Version127 Docker firewall, which otherwise lets only Cloudflare web traffic in. PostgreSQL TLS uses a Let's Encrypt certificate that certbot renews on OVH through Cloudflare DNS. From the internet, HBA permits only `stack127_app` and migration owner `postgres`, only over TLS (`hostssl`), using SCRAM; plain-text and admin logins are refused. Docker forwarding keeps the real client address for public IPv4 traffic, and reports the bridge gateway for loopback, so the private Docker rules enforce the same role restriction. The bootstrap superuser is socket-only. BaseBuddy and Dokploy databases stay separate.

### Remote access

On October 20, 2026 the owner chose a password-protected public port over Tailscale, the way Supabase works today. Clients use `sslmode=verify-full`. Long random SCRAM passwords protect the two remote logins. Tailscale was removed from OVH and from the workflows. The libpq service files from `make-services.mjs` verify the target against Node's CA list (`ca.pem`), because the `postgres:17` image has none.

No PgBouncer initially: the app already pools at four connections, scripts use one to four, and one cache process suffices. Start `max_connections=60`, monitor peaks, and serialize heavy jobs. If pooling becomes necessary, use session mode for ad-network advisory locks. `scripts/ad-networks/runtime-db.mjs` currently accepts only port 5432 for non-Supabase endpoints; a different local port needs a reviewed code change.

### Resource budget, backups and monitoring

OVH inspection: 7,746 MiB RAM, 4,963 MiB available, 53 GiB disk free; existing services already use swap.

Keep the worker's initial settings in `scripts/stack127/selfhost-db/{compose.yaml,postgresql.conf}`: 2 GiB memory cap, 2 CPUs, `shared_buffers=512MB`, `effective_cache_size=1536MB` (a planner estimate), `work_mem=4MB`, `maintenance_work_mem=128MB`, `max_connections=60`, `max_parallel_workers_per_gather=1`, `max_wal_size=1GB`, and 512 MiB container shared memory. Keep autovacuum and durability on. Measure peak host/container memory during restore and a collector run before increasing the cap.

The setup worker has prepared `scripts/stack127/selfhost-db/{backup.sh,pull-backups.sh}` and matching systemd units: OVH dump at 02:40 UTC into `/srv/stack127-db/backups/`, homelab pull at 03:10 UTC into `/srv/data/backups/stack127-db/archives/`. Keep seven daily dump/key/roles bundles on each host and retain the cutover dump separately. Timers/marker guards remain disabled pending acceptance. The producer now recreates its backup directory as `ubuntu:ubuntu`, mode 0700, and validates core TABLE DATA plus archived row counts (pages >= 1, publishers >= 1,000) before publishing a bundle. An empty/recreated cluster fails instead of rotating real recovery copies out. The scripts include matching `.dump.vault-key` and `.dump.roles.sql` files, with `--no-role-passwords`; retention requires a complete copy of all three files. The pull refuses a latest backup over 36 hours old. Backup failures and the existing over-36-hour copy freshness guard exit nonzero. GitHub notification delivery remains a follow-up. Target recovery point: up to 24 hours; shorter recovery needs WAL archiving later.

Restore practice: create a separate empty PostgreSQL 17 database/container, install matching extensions/roles, restore the dump with errors fatal, validate counts and migrations, then run a SQL-backed smoke check. Never test a restore over the live database. Restore the target's matching Vault root key from its private backup as well. Source Vault has zero secrets; its original root key must not be assumed to match OVH's new key. Measure recovery time in the rehearsal.

Use Docker health/restart handling, a real `SELECT 1` plus a page-table query from homelab every five minutes, and alerts for backup age over 26 hours, disk over 80%, sustained connection use over 45/60, restarts/OOMs, slow queries, and overdue cache events. Reuse the existing GitHub alert mechanism; no new monitoring platform is needed today. Deploy health alone is insufficient: `app/api/health/route.ts` only checks that `DATABASE_URL` exists.

## 3. Cache worker handoff

Today, the queue trigger and `pg_cron` call `stack127_wake_cache_worker`, which uses `pg_net` to invoke the Edge Function. In Cloudflare mode the function dispatches a frontend build; it does not acknowledge data merely because dispatch succeeded.

The Fable worker is porting this to a Node process on OVH. Confirm its final script, service/timer and env-file paths before cutover; proposed env file: `/srv/stack127-data/cache-worker.env`, mode 0600. Run every 30 seconds, with one database-backed lease, existing retries/reconciliation and alerts. Preserve Cloudflare dispatch and acknowledgement behavior; `scripts/stack127/cache/process-revalidation.mjs` alone explicitly rejects Cloudflare mode.

Live Edge Function secret names:

- Database/platform: `SUPABASE_DB_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`.
- Worker configuration: `STACK127_SITE_URL`, `STACK127_FRONTEND_HOSTING`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `GITHUB_ALERT_TOKEN`, `GITHUB_FRONTEND_TOKEN`, `GITHUB_FRONTEND_REPO`.
- `CACHE_WORKER_DRY_RUN` is supported by code but was not a stored secret name.

The Node worker needs a new SQL connection and only the worker configuration its port actually uses. Platform-generated API/JWT secrets are not needed. Preserve the database signing key; obtain the existing frontend-dispatch token privately from its owner rather than printing or extracting values into this plan.

At the switch, unschedule the old `stack127-cache-worker` cron job, clear its wake URL, drain in-flight function runs/leases, and disable/delete or otherwise prevent invocation of the old function. Do the same wake-URL/cron cleanup on the restored target **before any test mutation**, so it cannot call the old function. Keep ordinary event-queue triggers. Remove the release workflow's automatic Edge Function deployment so it cannot reactivate the retired worker. Keep the GitHub maintenance fallback, pointed to OVH, with the same shared lease.

## 4. Test copy, final copy and validation

### Measured two-part rehearsal, 19 October 2026

The reduced source archive and core restore completed. The target is isolated from production consumers: cron is off, pg_net is not preloaded, and the copied HTTP wake URL is NULL. Supabase settings, data, secrets and live connection files were unchanged. Storage stays on Supabase.

The original full application dump was stopped after source responsiveness degraded: 13,287,424 incomplete bytes after about 400 seconds. Its private `source.dump.partial` remains unusable under homelab `rehearsal-20261019/`. The coordinator then authorized exactly one reduced retry, excluding data for four large, SQLite-derived tables. That retry is the archive used below; there was no additional source dump.

| Stage | Measured result |
| --- | --- |
| Reduced serial source dump | **15,614,963 bytes (14.892 MiB), 1,368.992 seconds (22m 49s)** |
| Password-free roles export | **5,526 bytes** |
| Empty-target pg_net installation and worker shutdown | **13.177 seconds** |
| Core restore: pre-data / data / post-data | **0.540 / 4.839 / 1.538 seconds** |
| Restore helper total, including preparation and wake neutralisation | **7.718 seconds** |
| Consistent OVH SQLite snapshot | **840,163,328 bytes, 6.475 seconds** |
| SQLite refill with the existing deployed query | **3,598.758 seconds (59m 58.8s)**; no restart or deployed query change |
| Target `stack127_cache_source_revisions()` | **5,534 complete rows: 2,450.890 ms cold / 1,899.486 ms warm** |
| Populated-target backup and scratch restore drill | **70,428,235 bytes; backup 15.145s; scratch restore 47.385s; successful recovery run 67.786s** |
| Target memory after rehearsal / observed peak | **613.5 MiB warm idle** (Docker); **1,676,980,224 bytes (1.562 GiB) cgroup peak**, including charged file cache |

Source tools ran from official `postgres:17`, client **17.11**, on homelab. They used mode-0600 libpq service/password files, a read-only exported snapshot, a serial custom-format archive with compression level 6, and retained owners, ACLs and large objects. Credential files were removed and the snapshot transaction closed after the dump. A post-dump source count query timed out; the exact dump-snapshot counts and row comparisons therefore come from parsing the archive's COPY records offline, without another source table scan.

Private archives and inventory stay in `/srv/data/backups/stack127-db/rehearsal-20261019-reduced/` on homelab and `/srv/stack127-db/rehearsal-reduced/` on OVH (directories 0700, files 0600). They contain the signing-key row and must not enter Git or ordinary logs.

### Initial two-part rehearsal copy

Use the source's direct or **session** endpoint, never transaction pooling. Resolve the existing credentials privately; service names below are placeholders.

```sh
umask 077
pg_dumpall --database=service=stack127_source --roles-only --no-role-passwords --file=roles.sql
pg_dump --dbname=service=stack127_source --format=custom --compress=6 \
  --lock-wait-timeout=10s --schema=public --schema=extensions \
  --schema=supabase_migrations --large-objects \
  --exclude-table-data=public.ad_network_publishers \
  --exclude-table-data=public.ad_network_publisher_relationships \
  --exclude-table-data=public.ad_network_relationship_events \
  --exclude-table-data=public.ad_network_check_observations \
  --file=stack127-final.dump
```

Keep those four tables' schema, and retain all small-table data, including `ad_networks` and `ad_network_daily_counts`. Do not add `--no-owner` or `--no-acl`. Roles are exported separately without passwords. Managed Auth, Storage metadata/services and platform logs stay outside the application copy; no full-source recovery export was authorized in this rehearsal. [PostgreSQL dump behavior](https://www.postgresql.org/docs/17/app-pgdump.html), [roles export](https://www.postgresql.org/docs/17/app-pg-dumpall.html).

Prepare an **empty** target with the pinned image and existing 16 source roles. Source role attributes/settings and all 21 memberships matched. The source uses pg_net 0.20.3; the image supplies **0.20.4**, whose packaged upgrade script explicitly has **no SQL changes**. `scripts/stack127/selfhost-db/install-pgnet.py` temporarily preloads pg_net only on an empty target, installs 0.20.4, then removes the preload and restarts before application data is imported. Keep `cron.launch_active_jobs=off` throughout. HTTP signatures, extension schema and the wake function then restore unchanged; the HTTP worker remains absent.

Run the committed initial restore/refill procedure after matching roles and pg_net SQL have been prepared:

```sh
/srv/stack127-db/restore-core.sh \
  --archive /srv/stack127-db/rehearsal-reduced/source.dump \
  --work-directory /srv/stack127-db/initial-restore-NEW \
  --confirm stack127-empty-restore
```

Copy `restore-core.sh`, `restore-core.mjs`, `prepare-target.sql` and `app-role.sql` from `scripts/stack127/selfhost-db/` together. The script refuses a populated target and an existing work directory. It verifies the exact cluster through `pg_control_system().system_identifier` on both container socket and app loopback TCP before mutation. It preserves extension objects and initdb's public-schema baseline, filters only the conflicting public/extensions SCHEMA creation entries from the archive use-list, and restores **pre-data, data, post-data with `--exit-on-error`**, clearing the wake URL between data and post-data. It applies app grants and rechecks isolation/identity before snapshot/refill.

A consistent SQLite snapshot is created only by `snapshot-local.mjs`; the child `sync.mjs --sqlite <snapshot> --environment production --confirm stack127-production --apply` receives a clean environment with exactly the loopback app URL in `DATABASE_POOLER_URL` and `AD_NETWORKS_RUNTIME_ENVIRONMENT=production`. No alternate database/admin/API credentials are inherited. Neither the live collector file nor its env file is edited. Private stage logs and timings stay in the new mode-0700 work directory. This script is the initial empty-target fallback; the final switch below uses `core-restore.py` and retains the completed refill.

The snapshot contains **107,146 reviewed publishers and 114,284 reviewed relationships**, consistent with production's approximate catalog statistics of 106k and 114k. The completed target has exactly **107,146 publishers, 114,284 relationships, 114,587 rebuilt relationship events and 106,453 observations**. All 44 network rows and 44 daily-count rows remain. The snapshot and target both have **85,810 non-null niche labels**. The sync reported zero new arrivals; it seeded baseline/history from the reviewed relationship dates.

**Movement-history limit:** a fresh `sync.mjs` seeds baseline events and derives current observations from SQLite checks. It does not replay any PostgreSQL-only historical joined/left events from the excluded event table. Existing small daily-count rows are retained, and today's snapshot may be updated by the normal sync. The rehearsal proves the SQLite rebuild, not exact equality to the four excluded source payloads. Before final cutover, accept rebuilding that baseline or separately preserve any source-only history and niche labels that must survive; do not infer their absence from catalog statistics.

A separate reviewed change, commit `9ac15544`, materializes observation cohorts and their event history. Two real 500-row SELECT comparisons were identical: **5.741 → 1.232 seconds** and **5.589 → 0.994 seconds**. Its temporary-fixture PostgreSQL test passed, the ad-network suite passed **154 tests** (two existing opt-in tests skipped), and `npm run quality` passed typecheck and **80 core tests**. **It was not deployed to OVH, and the running refill was not restarted.** The refill timing above therefore measures the existing query. Do not project those batch improvements into an unmeasured full refill time.

The scripted initial path was integration-tested after review on a separate loopback-only scratch container: all 219 migrations restored, three synthetic publishers and three relationships refilled from a helper-created consistent snapshot, wake/cron/HTTP stayed disabled, and the populated-target guard refused a second run. A real empty-cluster archive was rejected by the backup checker; the populated archive passed with 441 pages and 107,146 publishers. A new migration-owner table/identity sequence inherited all required ACLs, RLS hid its rows before a policy was added, and app writes worked after that policy. Scratch resources were removed. The opt-in movements equivalence test also passed separately on PostgreSQL; its comment now states that CI skips it unless the disposable URL is provided.

### Privileges and database validation

Source `postgres` owns application objects and has BYPASSRLS. `stack127_app` instead remains **NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION, NOBYPASSRLS**, without owner/admin/service-role membership. It has schema USAGE, public DML, sequence USAGE/SELECT/UPDATE, public-function EXECUTE and read-only migration history. **38 explicit `stack127_backend_access` policies** give this trusted backend access through RLS; the seven original policies and source owners remain. Direct writes to signing credentials and HTTP wake configuration are revoked; those two tables have SELECT-only backend policies. This provides application/job access without a cluster-wide RLS bypass or DDL rights. Schema migrations require the separate owner credential. `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public` supplies table DML and sequence USAGE/SELECT/UPDATE for future owner-created objects. New tables still need enabled RLS and reviewed backend policies; re-run `app-role.sql` after migrations adding tables, before app/build access. Prefer including policy SQL in the migration, because release builds immediately follow migration push. Real app-login reads and a rolled-back worker-state UPDATE passed. Direct credential UPDATE and schema CREATE were denied with 42501; all eight checked elevation/membership/create flags were false.

Before applying backend grants or refilling, validation proved:

- Exact COPY row counts and unordered row-value multisets for **34 copied public tables, 54,306 rows**, plus **all 219 migration rows including statements**. The only intentional copied-data difference was the NULL wake URL. Registry, publication and directory rows are covered by these comparisons.
- All **43 public relation objects** (38 tables and five sequences), **241 constraints**, **119 indexes**, **50 functions**, **107 triggers**, **seven original policies**, schema ownership and semantic ACLs matched the source inventory. All five sequence `last_value`/`is_called` states matched the archive before refill; derived-table sequences advance normally during refill.
- The **one cache signing-key row** matched the dump privately. No key or credential value was printed. All eight extension identities/schemas matched, allowing only the reviewed pg_net patch difference.

After refill, all **38/38 public tables still have RLS**, all **38 backend policies** are present, no index is invalid, trigram similarity works, and the signing-key row still matches. There are **zero active cron jobs, zero queued HTTP requests, no wake URL and no pg_net preload**. Normal refill triggers increased `stack127_revalidation_events` from **88 to 118** rows; every other copied-table row count stayed unchanged. Both complete source-revision runs returned 5,534 valid fingerprints; fingerprint values were not printed.

The populated target backup is **70,428,235 bytes**, with its **64-byte Vault root key** and **5,846-byte password-free roles export**. A separate PostgreSQL 17.6 scratch container used the same pinned image, no network, no published ports, its own two temporary volumes and a 1.5 GiB cap. Roles and pg_net SQL were prepared before restoration, and the HTTP worker was removed before application rows were imported. `pg_restore --exit-on-error` finished in **47.385 seconds**; complete successful recovery, including startup, all comparisons and cleanup, took **67.786 seconds**. Adding the original backup gives **82.931 seconds** on the successful path. All 38 table counts, all migration statements, constraints/indexes/functions/triggers, semantic grants, policies, schema ownership, five sequence states, signing-key and Vault-key equality, app RLS access and disabled wake/cron matched. Scratch memory peaked at **1,446,944,768 bytes (1.348 GiB)**. The scratch container and both volumes were deleted. Initial scratch startup needed an explicit readable empty init directory; the validator also needed ACL member order normalisation. Neither correction changed the rehearsal database or required another dump. Homelab received the complete bundle in **32.865 seconds**; all three files matched OVH byte for byte, had mode 0600, and the roles export contained no passwords. Only the known obsolete empty-bootstrap smoke pairs were removed. Both scheduled timers remain **disabled/inactive**, and both marker files are absent; the manual rehearsal did not enable recurring backups. Failure alert delivery is still a cutover prerequisite.

The staged migration login is the restored object owner `postgres`, with a new random password, BYPASSRLS, no superuser/database-creation/role-creation/replication rights, a five-connection limit, and **all nine inherited memberships revoked**. This allows ownership-based application DDL and migration-history writes without the image superuser. `supabase_admin` remains available only through the local Unix socket. Homelab ran real reads and rolled-back DDL remotely; the app login remained unable to create schema objects. A real `supabase db push --dry-run --include-all` reported no pending migrations. That dry run used the old plain-text tailnet path, where homelab CLI 2.75.0 needed process-local `PGSSLMODE=disable`. The target now requires TLS, so don't set it; never set it globally. The release workflow now prefers `secrets.DATABASE_MIGRATION_URL` for this step, falling back to its existing `DATABASE_URL` when unset (worker-branch commit `ee09d821`). Commit `54488872` independently gates Edge Function delivery on `STACK127_CACHE_WORKER_RUNTIME != node`; transport selection no longer selects the cache runtime. No live GitHub secret or variable has been changed.

### Final core-only copy: retain the frozen refill

The owner chose to retain the completed refill at cutover. **Do not drop the target or run the hour-long SQLite refill again.** Dump fresh **data only** for the other 31 public tables and migration history, excluding every `public.ad_network*` object and `public.stack127_ad_network_source_revision`. Existing owners, definitions, ACLs, RLS, extension versions and the two derived-table sequences stay in place. This requires unchanged source schema/migration contents and no PostgreSQL large objects; the preflight checks both. Storage objects remain managed separately.

A cheap source revision-token check matched the original reduced-dump snapshot (**one row, 8.652 seconds**). It would detect a normal niche-sort or ad-network report update since that snapshot. Homelab's niche service was inactive and its timer had no recorded last trigger, which alone is not proof of no writes. Repeat the token check after freezing; abort and reconcile if it changes. Also compare the target's seven frozen tables and two sequence states against the private backup-derived baseline `/srv/stack127-db/frozen-ad-networks.json`. `ad-network-guard.py` hashes all rows privately; it never prints row values or hashes.

`core-restore.py` first checks that baseline and disabled cron/HTTP processing, then applies the approved wake-retirement script on the target. It selects only core TABLE DATA and SEQUENCE SET entries from the archive. One transaction truncates/copies the 32 core tables, keeps the wake URL NULL, checks every archive-derived row count and all **24 core foreign keys**, and commits with SQL errors fatal. It never truncates a frozen table or uses CASCADE. A failed COPY rolls back rows/triggers; because `setval` is not transactional, the helper explicitly restores the saved core sequence states on failure.

The populated-backup scratch drill tested this path without another source dump: **32 core tables, all 219 migrations, 6.086 seconds for the SQL transaction, 30.035 seconds including frozen-data checks**. An intentionally changed scratch row was restored; seven frozen tables and their two sequences were unchanged. An injected failure proved both the original row and the original sequence state survived. A repeat target backup was **70,428,365 bytes** and took **13.813 seconds**. Its scratch full restore took **47.534 seconds** and again passed all table/migration/definition/grant/RLS/key comparisons. Scratch resources were removed.

Networking survived a database service restart. Homelab connected in **0.273 seconds**, read **107,146 publishers and 219 migrations** with both app and migration logins, and was denied network access as the bootstrap superuser. The public IPv4 port **54.39.99.47:5432 timed out after five seconds** from homelab. Both explicit bind addresses remained after restart. Warm idle after these tests was **523.8 MiB** (earlier post-refill idle: 613.5 MiB).

The worker app can read only the legacy job name in `cron.job`; cron function EXECUTE was revoked from PUBLIC on this isolated cluster and retained for migration owner `postgres`. A rolled-back two-job fixture proved the app sees only the worker job and is denied an actual `cron.schedule` call.

`stack127-db.service` runs `compose up --wait`, retries on failure, and is enabled for boot. `stack127-db-firewall.service` and the Docker drop-in reapply the 5432 rule. A full host reboot was not performed. Backup timers are still disabled, wake is NULL, cron is off and pg_net is not preloaded. The main target still has the old wake trigger; only the authorized switch retires it.

Book **35 to 45 minutes** for the core-only path, provided all preflight gates pass. The source reduced dump previously took **22m 49s**; a fresh core-only dump is not yet timed. This estimate includes that measured source time, sub-minute target replacement, release/build and connection restart margin. It is not a guarantee on the throttled source. Any drift or source degradation stops the switch; rebuilding the refill adds roughly an hour with the measured existing code. Keep static pages online throughout the write freeze. Owner-provided worker tokens and backup alert delivery remain prerequisites.

## 5. Owner switch commands

Run only after release authorization and review. Commands below are for the **owner**, not automatic migration steps. No command in this section has been applied to the live source. Keep one homelab shell open for its variables/functions. Do not print env files, service files or full Docker inspection/config output.

1. **Before any freeze or merge, check the reviewed branches and credentials.** From the Mac infra worktree:

   ```sh
   cd /Users/ravitejaknts/.t3/worktrees/stack127/t3-fa7d0fc8
   export GH_REPO=stack127labs/stack127
   umask 077
   gh variable list --json name,value > /private/tmp/stack127-variables.before.json
   gh secret list --json name > /private/tmp/stack127-secret-names.before.json
   git fetch origin
   gh pr view 58 --json headRefName,state
   gh pr view refactor/ad-networks-cron --json number,state,mergeStateStatus
   gh pr view feat/node-cache-worker --json number,state,mergeStateStatus
   gh pr checks 58 --required
   gh pr checks refactor/ad-networks-cron --required
   gh pr checks feat/node-cache-worker --required
   test -z "$(git grep -l -i tailscale origin/feat/node-cache-worker -- .github/workflows)"
   git show origin/feat/node-cache-worker:.github/workflows/stack127-release-e2e.yml | rg 'DATABASE_MIGRATION_URL|STACK127_CACHE_WORKER_RUNTIME'
   test -z "$(git diff origin/main...origin/refactor/ad-networks-cron -- supabase/migrations)"
   test -z "$(git diff origin/main...origin/feat/node-cache-worker -- supabase/migrations)"
   gh secret list --json name --jq '.[].name'
   ```

   Owner opens both branch PRs first. All required checks/review must pass; resolve conflicts/stale bases before freezing. Confirm the migration step prefers `DATABASE_MIGRATION_URL`, with its existing URL fallback; the two Edge Function guards use `STACK127_CACHE_WORKER_RUNTIME`, independently of transport. The remote-access step below must pass before freezing. Also prepare owner-supplied Node-worker dispatch/alert tokens and backup failure notifications. Do not include PR #60.

2. **Remote access.** The target is `database.stack127.com:5432`. Verify real SQL from the Mac and homelab using the staged app credential, then check the refusals:

   ```sh
   ssh ovh 'systemctl is-active stack127-db.service stack127-db-firewall.service; sudo iptables -S DOCKER-USER | head -3; sudo docker port stack127-db 5432'
   ```

   `DOCKER-USER` must start with the 5432 accept rule. From the Mac, a plain-text login (`sslmode=disable`) and a `supabase_admin` login must both be refused by `pg_hba.conf`. URLs are `postgresql://stack127_app:<encoded-password>@database.stack127.com:5432/postgres?sslmode=verify-full`. The migration URL uses login `postgres` with its separate password. Keep Docker/loopback URLs below unchanged. GitHub runners and BuildKit need nothing extra; the first release run after step 4 is their real connection test, and its migration and build steps stop the release if they can't connect.

3. **Prepare private tools, connection files and rollback material.** Still on the Mac:

   ```sh
   ssh homelab 'umask 077; mkdir /srv/data/backups/stack127-db/cutover; mkdir /srv/data/backups/stack127-db/cutover/tools'
   scp /private/tmp/stack127-variables.before.json /private/tmp/stack127-secret-names.before.json homelab:/srv/data/backups/stack127-db/cutover/
   git archive origin/refactor/ad-networks-cron scripts/stack127/selfhost-db | ssh homelab 'tar -xf - -C /srv/data/backups/stack127-db/cutover/tools'
   git show origin/feat/node-cache-worker:scripts/stack127/selfhost-db/switch/010_retire_supabase_cache_worker_wake.sql | ssh homelab 'umask 077; cat > /srv/data/backups/stack127-db/cutover/010.sql'
   ssh homelab
   ```

   On homelab:

   ```sh
   cd /srv/data/projects/stack127
   umask 077
   export FINAL=/srv/data/backups/stack127-db/cutover
   export TOOLS="$FINAL/tools/scripts/stack127/selfhost-db"
   cp .env.database "$FINAL/env.database.before"
   scp ovh:/srv/stack127-data/ad-networks.env "$FINAL/ovh-ad-networks.env.before"
   node --env-file=.env.deploy "$TOOLS/make-services.mjs" --directory "$FINAL"
   pg17() { docker run --rm --network host --user "$(id -u):$(id -g)" --mount "type=bind,src=$FINAL,dst=/run/db" -e PGSERVICEFILE=/run/db/pg_service.conf postgres:17 "$@"; }
   python3 "$TOOLS/source-check.py" --directory "$FINAL" \
     --inventory /srv/data/backups/stack127-db/rehearsal-20261019-reduced/archive-copy-inventory.json \
     --metadata /srv/data/backups/stack127-db/rehearsal-20261019-reduced/source-inventory.json \
     --queries /srv/data/backups/stack127-db/rehearsal-20261019-reduced/inventory-queries.json
   install -m 600 /dev/null "$FINAL/source-rollback.sql"
   pg17 psql -X -v ON_ERROR_STOP=1 --dbname=service=stack127_source --file=/run/db/tools/scripts/stack127/selfhost-db/snapshot-source.sql > "$FINAL/source-snapshot.log" 2>&1
   test -s "$FINAL/source-rollback.sql"
   node --env-file=.env.selfhost-db --input-type=module <<'NODE' > "$FINAL/migration-dry-run.log" 2>&1
   import {spawnSync} from 'node:child_process';
   const url=process.env.DATABASE_MIGRATION_URL;
   if(new URL(url).host!==new URL(process.env.SELFHOST_DATABASE_URL_REMOTE).host)throw Error('Wrong migration target');
   if(spawnSync('supabase',['db','push','--dry-run','--include-all','--db-url',url],{env:{...process.env,PGSSLMODE:new URL(url).searchParams.get('sslmode')||'require'},stdio:'inherit'}).status)throw Error('Migration preflight failed');
   NODE
   pg17 psql -X -At -v ON_ERROR_STOP=1 --dbname=service=stack127_target --command 'select current_user,(select count(*) from public.ad_network_publishers),(select count(*) from supabase_migrations.schema_migrations);'
   scp "$TOOLS/"{ad-network-guard.py,core-restore.py,app-role.sql,backup.sh,check-backup.py,stack127-db-backup.service} ovh:/srv/stack127-db/
   ssh ovh 'chmod 755 /srv/stack127-db/backup.sh; sudo install -m 644 /srv/stack127-db/stack127-db-backup.service /etc/systemd/system/stack127-db-backup.service; sudo systemctl daemon-reload'
   scp "$FINAL/010.sql" ovh:/srv/stack127-db/010.sql
   ssh ovh 'python3 /srv/stack127-db/ad-network-guard.py --manifest /srv/stack127-db/frozen-ad-networks.json'
   ```

   Save Dokploy's **entire current environment and network configuration privately**, plus the current repo variables and production image SHA, before changing them. GitHub secret values cannot be read back: confirm the saved homelab URLs match the old repository secrets, or obtain their exact old values privately. Prepare homelab source-of-truth **`.env.cache-worker`**, mode 0600, with `DATABASE_URL` set to the staged **loopback** app URL, `STACK127_FRONTEND_HOSTING=cloudflare`, `STACK127_SITE_URL=https://stack127.com`, `GITHUB_FRONTEND_REPO=stack127labs/stack127`, owner-provided `GITHUB_FRONTEND_TOKEN` and `GITHUB_ALERT_TOKEN`. Do not print tokens or copy a remote URL unnecessarily into this OVH-host job. Its timer stays off. Check the staged migration credential with `supabase db push --dry-run --include-all`; on homelab CLI 2.75.0 use `PGSSLMODE=disable` only in that target child process and capture CLI output privately. Stop if migrations are pending.

4. **Freeze all writers; retire the source wake and drain.** On homelab, record/disable only currently enabled connecting workflows, then wait for existing runs to finish:

   ```sh
   gh workflow list --repo stack127labs/stack127 --json id,path,state > "$FINAL/workflows.before.json"
   node --input-type=module <<'NODE'
   import {readFileSync,writeFileSync} from 'node:fs'; import {spawnSync} from 'node:child_process';
   const names=new Set(['stack127-ci.yml','stack127-release-e2e.yml','stack127-frontend-refresh.yml','stack127-publish-pages.yml','stack127-cache-maintenance.yml','self-host-apps-discovery-github.yml','self-host-apps-discovery-directories.yml','self-host-apps-discovery-catalogs.yml','self-host-apps-discovery-lists.yml','self-host-apps-refresh-github.yml','self-host-apps-refresh-source-hosts.yml','self-host-apps-refresh-technical.yml','ad-network-verification.yml']);
   const paused=JSON.parse(readFileSync(process.env.FINAL+'/workflows.before.json')).filter(w=>w.state==='active'&&names.has(w.path.split('/').at(-1)));
   writeFileSync(process.env.FINAL+'/workflows.paused.json',JSON.stringify(paused),{mode:0o600});
   for(const w of paused){if(spawnSync('gh',['workflow','disable',String(w.id),'--repo','stack127labs/stack127'],{stdio:'inherit'}).status)throw Error('Workflow pause failed');}
   NODE
   gh run list --repo stack127labs/stack127 --status in_progress
   gh run list --repo stack127labs/stack127 --status queued
   systemctl --user stop stack127-ad-network-niche.timer
   systemctl --user is-active stack127-ad-network-niche.service
   ssh ovh 'crontab -l; pgrep -af "scripts/ad-networks/|scripts/stack127/cache/" || true'
   ```

   The niche service must be inactive, OVH crontab still empty and no collector/sync/processor running. Drain running GitHub jobs, manual scripts, media uploads and publication/enrichment work; prevent new manual starts. Pause any ad-network verification UI writes too. On homelab, delete only the old deployed Edge Function (local code and project/Storage stay):

   ```sh
   node --env-file=.env.deploy --env-file=.env.database --input-type=module <<'NODE' > "$FINAL/edge-disable.log" 2>&1
   import {spawnSync} from 'node:child_process';
   const ref=new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
   if(spawnSync('supabase',['functions','delete','cache-worker','--project-ref',ref,'--yes'],{stdio:'inherit'}).status)throw Error('Old function disable failed');
   NODE
   pg17 psql -X -v ON_ERROR_STOP=1 --dbname=service=stack127_source_switch --file=/run/db/010.sql > "$FINAL/source-retire.log" 2>&1
   pg17 psql -X -v ON_ERROR_STOP=1 --dbname=service=stack127_source_switch --command "ALTER ROLE postgres SET default_transaction_read_only=on; SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename='postgres' AND pid<>pg_backend_pid();" > "$FINAL/source-freeze.log" 2>&1
   date -u +%FT%TZ > "$FINAL/freeze-started-at"
   ```

   Wait at least **150 seconds** and confirm the Edge Function has no in-flight run and no relevant write transaction remains. Role-default read-only is an operational freeze, so all privileged/manual writers must also remain stopped. Existing website RDAP-cache writes may fail during this window; static pages stay online. Re-run `source-check.py` with `--directory` and `--inventory` only (the intentional wiring/role changes now differ from rehearsal metadata). Any source-token mismatch or target frozen-baseline mismatch stops the switch; reconcile niche/report changes instead of silently retaining stale data.

5. **One fresh, serial core-only source dump; replace only core target data.** On homelab:

   ```sh
   install -m 600 /dev/null "$FINAL/roles.sql"
   install -m 600 /dev/null "$FINAL/core.dump.partial"
   date -u +%s > "$FINAL/dump-started-at"
   pg17 pg_dumpall --database=service=stack127_source --roles-only --no-role-passwords --file=/run/db/roles.sql > "$FINAL/roles.log" 2>&1
   pg17 pg_dump --dbname=service=stack127_source --format=custom --data-only --compress=6 \
     --lock-wait-timeout=10s --schema=public --schema=extensions --schema=supabase_migrations \
     --exclude-table='public.ad_network*' --exclude-table=public.stack127_ad_network_source_revision \
     --file=/run/db/core.dump.partial > "$FINAL/dump.log" 2>&1
   mv "$FINAL/core.dump.partial" "$FINAL/core.dump"
   date -u +%s > "$FINAL/dump-finished-at"
   stat -c '%s' "$FINAL/core.dump"
   scp "$FINAL/core.dump" ovh:/srv/stack127-db/core-final.dump
   ssh ovh 'python3 /srv/stack127-db/core-restore.py --archive /srv/stack127-db/core-final.dump --manifest /srv/stack127-db/frozen-ad-networks.json --retire-sql /srv/stack127-db/010.sql --confirm stack127-core-cutover'
   ssh ovh 'sudo docker exec -i --user postgres stack127-db psql -X -q -v ON_ERROR_STOP=1 -U supabase_admin -d postgres < /srv/stack127-db/app-role.sql'
   ```

   Watch source health from a separate shell. Stop that one client if production latency degrades; do not retry automatically. No `--no-owner`/`--no-acl` overrides: this data-only replacement preserves the already-restored ownership/grants/schema. Do not import the source roles file over the target credentials. Do not run `prepare-target.sql`, truncate the ad-network tables, or change their sequences. Preserve the final dump and rollback files separately from seven-day retention. Require helper output `migration_rows=219`, `frozen_refill_unchanged=true`; counts/FKs must pass before commit. Before changing connections, run:

   ```sh
   pg17 psql -X -At -v ON_ERROR_STOP=1 --dbname=service=stack127_target --command 'select (select count(*) from public.stack127_cache_credentials)=1 and (select count(*) from supabase_migrations.schema_migrations)=219 and not exists(select from public.stack127_cache_worker_wake where function_url is not null);'
   pg17 psql -X -v ON_ERROR_STOP=1 --dbname=service=stack127_target --command '\timing on' --command 'select * from public.stack127_cache_source_revisions();' > "$FINAL/revision-timing.private.log"
   ```

   The boolean must be true; privately check 5,534 returned revision rows and full-query timing. These checks reveal no signing key. Inspect private logs on failure.

6. **Change every connection while processes remain paused.** On homelab, stage the Docker env and update only the three GitHub database secrets plus the two homelab URL names:

   ```sh
   node --env-file=.env.selfhost-db --input-type=module <<'NODE'
   import {readFileSync,writeFileSync,renameSync} from 'node:fs'; import {parseEnv} from 'node:util'; import {spawnSync} from 'node:child_process';
   const remote=process.env.SELFHOST_DATABASE_URL_REMOTE, migration=process.env.DATABASE_MIGRATION_URL;
   for(const [name,value] of Object.entries({DATABASE_URL:remote,DATABASE_POOLER_URL:remote,DATABASE_MIGRATION_URL:migration})){
     if(!value)throw Error('Missing staged '+name);
     if(spawnSync('gh',['secret','set',name,'--repo','stack127labs/stack127'],{input:value,stdio:['pipe','ignore','pipe']}).status)throw Error('Secret update failed: '+name);
   }
   const env=parseEnv(readFileSync('.env.database','utf8')); env.DATABASE_URL=remote;env.DATABASE_POOLER_URL=remote;
   writeFileSync('.env.database.cutover',Object.entries(env).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n')+'\n',{mode:0o600});renameSync('.env.database.cutover','.env.database');
   writeFileSync(process.env.FINAL+'/website-database.env','DATABASE_URL='+process.env.SELFHOST_DATABASE_URL_DOCKER+'\n',{mode:0o600});
   NODE
   gh secret list --repo stack127labs/stack127 --json name --jq '.[].name'
   ```

   In **https://dokploy.stack127.com**, app `_oKhy4YdVBc513i_qjVHC`, replace saved **DATABASE_URL** using the private `website-database.env`: `postgresql://stack127_app:<encoded-password>@stack127-db:5432/postgres?sslmode=disable`. Persistently add overlay **stack127-db-private** to this app's network configuration alongside `dokploy-network`; save both settings before redeploy. Do not edit Dokploy's own database/service. A one-time `docker service update --network-add` is insufficient unless its persistent Dokploy configuration also retains that network.

   On OVH, update only the host-job URL, retaining every other env value:

   ```sh
   ssh ovh 'node --env-file=/srv/stack127-db/.env --input-type=module' <<'NODE'
   import {readFileSync,writeFileSync,renameSync} from 'node:fs';import {parseEnv} from 'node:util';
   const file='/srv/stack127-data/ad-networks.env',env=parseEnv(readFileSync(file,'utf8'));
   env.DATABASE_POOLER_URL=process.env.SELFHOST_DATABASE_URL_LOOPBACK;
   writeFileSync(file+'.cutover',Object.entries(env).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n')+'\n',{mode:0o600});renameSync(file+'.cutover',file);
   NODE
   scp .env.cache-worker ovh:/srv/stack127-data/cache-worker.env
   ssh ovh 'chmod 600 /srv/stack127-data/cache-worker.env'
   ```

   Host jobs/Node worker use `127.0.0.1:5432`; GitHub, homelab and Mac use `database.stack127.com:5432` with `sslmode=verify-full`. The release migration secret uses `postgres`, all other consumers use `stack127_app`. Keep `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, existing Storage URLs and hosting variables unchanged. Confirm no protected-environment database secret overrides these repo secrets. Wait about two minutes for env mirrors; restart running Mac/homelab consumers instead of editing their mirrors.

7. **Merge exactly #58, infra branch, then worker branch.** Keep release/cache/data workflows disabled until the merges finish. Re-enable CI only if required for fresh merge checks; CI now reads OVH and must pass. On the Mac:

   ```sh
   gh pr merge 58 --merge
   gh pr view refactor/ad-networks-cron --json number,mergeStateStatus
   gh pr checks refactor/ad-networks-cron --required
   gh pr merge refactor/ad-networks-cron --merge
   gh pr view feat/node-cache-worker --json number,mergeStateStatus
   gh pr checks feat/node-cache-worker --required
   gh pr merge feat/node-cache-worker --merge
   git fetch origin main
   export SWITCH_SHA="$(git rev-parse origin/main)"
   ```

   Do not merge #60 or delete branches attached to worktrees. If a PR becomes blocked, resolve it through review; do not bypass protections. This order puts #58 before worker changes that already contain its commits. Before enabling release, set the cache runtime variable in the activation step below, so a source-function diff cannot redeploy the retired Edge Function.

8. **Install and activate the Node worker, then release the exact SHA.** On the Mac, suppress Edge Function delivery independently of transport:

   ```sh
   gh variable set STACK127_CACHE_WORKER_RUNTIME --body node
   ssh ovh 'cd /srv/stack127 && git pull --ff-only origin main && sudo install -m 644 scripts/stack127/cache/ovh/stack127-cache-worker.service scripts/stack127/cache/ovh/stack127-cache-worker.timer /etc/systemd/system/ && sudo systemctl daemon-reload'
   ssh ovh 'cd /srv/stack127 && CACHE_WORKER_DRY_RUN=1 scripts/stack127/cache/ovh/run-worker.sh'
   gh workflow enable stack127-release-e2e.yml
   gh workflow run stack127-release-e2e.yml --ref main -f commit_sha="$SWITCH_SHA"
   ```

   Do not reset the OVH checkout or deploy unreviewed branch code; stop if fast-forward fails. The dry run must report retired wake wiring and valid settings, without acquiring/acknowledging queue work. The ordinary queue triggers, lease, signing key and event versions remain intact. **After migrations that add tables, re-run `app-role.sql` (or its reviewed policy part) as the local target admin and check app access before builds/consumers.** New tables must enable RLS. Include those policies in the migration itself for automated releases; otherwise apply the migration and operator grant/policy step before dispatching release. Watch the release through completion; the release must use the new owner URL for migrations and the app URL for builds, prove runner and BuildKit networking, replace website pools, and retain its saved private overlay attachment. Require merge SHA = `origin/main` = deployed image SHA = `/api/health` SHA, and Cloudflare `/frontend-release.json` SHA. Check real SQL reads from the website container, OVH host, homelab, Mac and GitHub; check a directory/search API, RDAP, images, sitemap, robots and unpublished 404. Production SQL errors must not fall back to the old Data API.

   Then enable the frontend-refresh workflow needed by worker dispatch and the timer:

   ```sh
   gh workflow enable stack127-frontend-refresh.yml
   ssh ovh 'sudo systemctl enable --now stack127-cache-worker.timer; sudo systemctl start stack127-cache-worker.service; sudo journalctl -u stack127-cache-worker.service -n 30 --no-pager'
   ```

   Run one controlled cache/publication change through queue → dispatch → frontend verification → acknowledgement before allowing business writers. Check queue age/lease and that all source wake/Edge invocation remains disabled. If worker dispatch tokens or real GitHub connectivity fail, keep writers paused and fix or roll back.

9. **Enable backups, verify one offsite bundle, then resume only the previous writers.** On homelab:

   ```sh
   ssh ovh 'sudo touch /srv/stack127-db/BACKUPS_ENABLED; sudo systemctl enable --now stack127-db-backup.timer; sudo systemctl start stack127-db-backup.service'
   touch /srv/data/backups/stack127-db/PULL_ENABLED
   sudo systemctl enable --now stack127-db-backup-pull.timer
   sudo systemctl start stack127-db-backup-pull.service
   systemctl --user start stack127-ad-network-niche.timer
   ssh ovh 'cd /srv/stack127 && crontab scripts/ad-networks/ovh/crontab.txt'
   node --input-type=module <<'NODE'
   import {readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';
   for(const w of JSON.parse(readFileSync(process.env.FINAL+'/workflows.paused.json'))){
     if(spawnSync('gh',['workflow','enable',String(w.id),'--repo','stack127labs/stack127'],{stdio:'inherit'}).status)throw Error('Workflow resume failed');
   }
   NODE
   date -u +%FT%TZ > "$FINAL/writes-resumed-at"
   ```

   Confirm both backup services succeed, all three bundle files reach homelab, and failure/freshness alerts arrive. Resume scheduled/manual publications, niche sorting and discovery only after the SQL/cache checks. Monitor first collector, advisory locks, memory and nightly backup. Keep source application tables frozen and Supabase/Storage online for at least seven days. Retain Storage while media URLs require it. Remove only the temporary libpq credential files after acceptance; retain the secret-bearing rollback SQL, final dump and saved env files privately.

### Rollback commands

**Before business writes resume:** disable/drain the new worker, jobs and connecting workflows again. Keep both writer sets paused. On homelab restore `.env.database` from `$FINAL/env.database.before`, restore its old `DATABASE_URL` / `DATABASE_POOLER_URL` GitHub secrets through stdin as in step 6, and delete the newly introduced `DATABASE_MIGRATION_URL` secret if it did not previously exist (otherwise restore its saved old value). Restore saved Dokploy environment/network configuration and its old release image, and copy `$FINAL/ovh-ad-networks.env.before` back to `/srv/stack127-data/ad-networks.env` with mode 0600. Wait for mirrors and recreate website/script pools. Restore the previous `STACK127_CACHE_WORKER_RUNTIME` value; an unset runtime variable restores Edge Function delivery.

On homelab, restore the old function code before re-enabling its wake. Keep the old code snapshot/revision available:

```sh
ssh ovh 'sudo systemctl disable --now stack127-cache-worker.timer; sudo systemctl stop stack127-cache-worker.service'
cp "$FINAL/env.database.before" .env.database
node --input-type=module <<'NODE'
import {readFileSync} from 'node:fs';import {parseEnv} from 'node:util';import {spawnSync} from 'node:child_process';
const env=parseEnv(readFileSync('.env.database','utf8'));
for(const name of ['DATABASE_URL','DATABASE_POOLER_URL'])if(spawnSync('gh',['secret','set',name,'--repo','stack127labs/stack127'],{input:env[name],stdio:['pipe','ignore','pipe']}).status)throw Error('Secret rollback failed: '+name);
const oldNames=JSON.parse(readFileSync(process.env.FINAL+'/stack127-secret-names.before.json'));
if(!oldNames.some(x=>x.name==='DATABASE_MIGRATION_URL'))if(spawnSync('gh',['secret','delete','DATABASE_MIGRATION_URL','--repo','stack127labs/stack127'],{stdio:'inherit'}).status)throw Error('Migration secret removal failed');
const oldVars=JSON.parse(readFileSync(process.env.FINAL+'/stack127-variables.before.json'));
for(const name of ['STACK127_CACHE_WORKER_RUNTIME']){
 const old=oldVars.find(x=>x.name===name),args=old?['variable','set',name,'--body',old.value]:['variable','delete',name];
 if(spawnSync('gh',[...args,'--repo','stack127labs/stack127'],{stdio:'inherit'}).status)throw Error('Variable rollback failed: '+name);
}
NODE
scp "$FINAL/ovh-ad-networks.env.before" ovh:/srv/stack127-data/ad-networks.env
node --env-file=.env.deploy --env-file=.env.database --input-type=module <<'NODE' > "$FINAL/edge-restore.log" 2>&1
import {spawnSync} from 'node:child_process';
const ref=new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
if(spawnSync('supabase',['functions','deploy','cache-worker','--project-ref',ref,'--use-api','--no-verify-jwt'],{stdio:'inherit'}).status)throw Error('Old function restore failed');
NODE
pg17 psql -X -v ON_ERROR_STOP=1 --dbname=service=stack127_source_switch --file=/run/db/source-rollback.sql > "$FINAL/source-rollback.log" 2>&1
```

The private rollback SQL restores the two function definitions, wake trigger/URL/grants, prior cron schedule/active state and prior role read-only setting. Verify real source SQL reads and a controlled old queue/refresh before resuming the saved writers. Keep Storage/hosting configuration unchanged and retain the target for investigation.

**After OVH accepts business writes:** stop both writer sets and preserve a new OVH backup. Do not point consumers back: reconcile new publication/research rows and sequence states into Supabase, or obtain explicit owner acceptance of lost writes first. Rebuild disposable RDAP/cache state separately. Never run both writer sets concurrently.

## 6. Owner decisions

Decided on October 19, 2026:

1. **Remote access uses a password over verified TLS** at `database.stack127.com` (changed October 20, 2026). Tailscale is removed. Tested from the Mac and homelab; GitHub is tested by the first release run.
2. **Storage stays on Supabase** for this move. Only the database moves; media URLs keep working.

Still open: accept the estimated 35 to 45 minute core-only freeze (the final source dump is not yet timed), provide worker dispatch credentials, connect backup failure alerts, and accept the nightly backups' maximum 24-hour recovery gap.
