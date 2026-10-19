# Production database move to OVH

Working plan for 19 October 2026. This agent ran read-only checks and wrote only this plan. The owner has chosen self-hosted production Postgres. Managed development stays unchanged.

Build and rehearse beside the current Supabase project. Switch production consumers together during one write freeze. Keep Supabase running for rollback and, unless the owner chooses a separate media move, for existing Storage objects.

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
| New target credentials: homelab `/srv/data/projects/stack127/.env.selfhost-db`, OVH `/srv/stack127-db/.env` | Both now contain `POSTGRES_PASSWORD`, `STACK127_APP_PASSWORD`, `SELFHOST_DATABASE_URL`, `SELFHOST_DB_ADMIN_URL`, `SELFHOST_DB_ADMIN_USER`, `SELFHOST_DB_APP_USER`, `SELFHOST_DB_HOST`, `SELFHOST_DB_NAME`, `SELFHOST_DB_PORT`. Created by the setup worker; not active production connections. | Stage these privately; use the appropriate Docker, loopback or tailnet host when replacing each consumer URL. Do not blindly copy a loopback URL to GitHub. |
| OVH `/srv/stack127-data/ad-networks.env` | `DATABASE_POOLER_URL`, `AD_NETWORKS_RUNTIME_ENVIRONMENT`, `AD_NETWORK_DB_PATH`, `AD_NETWORKS_STATE_DIRECTORY`, `GITHUB_ALERT_TOKEN`. Loaded by `scripts/ad-networks/ovh/run-job.sh`. | Change its database URL to the OVH local endpoint. Keep mode 0600. OVH crontab is currently empty; the runbook records the pause at 12:15 UTC today. |
| Homelab `/home/teja/.config/systemd/user/stack127-ad-network-niche.service` and matching `.timer` | Service loads `.env.deploy`, runs `scripts/ad-networks/niche-sort.mjs --environment production` from `/srv/data/projects/stack127`; the runtime helper reads `.env.database`. Sunday 06:00 UTC timer is enabled/active; service was inactive. | Pause timer and drain any run for cutover. After env mirrors and connectivity checks, restart/resume against OVH. |

Live GitHub names differ from the older `stack127_docs/environment-inventory.md`: production API secrets, access token and project-ref variable are now present.

The project reference is also embedded in existing connection/API URLs, public media URLs, `next.config.ts`, `lib/hardware-directories/data/*.json`, and historical SQL. Keep existing asset URLs when retaining Storage. Development preview scripts under `scripts/{chmod-calculator,storage-tools,zigbee-devices}/` contain old production deny checks and explicit development allow checks; they do not connect production during normal previews.

### Every workflow that connects

All paths below are under `.github/workflows/`. Add private connectivity before the first database step in each database job, including the Docker BuildKit build.

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

Host jobs use the existing loopback-bound port 5432. Remote clients need a new tailnet-IP-only binding on 5432 after enrollment. The worker's `pg_hba.conf` currently rejects Tailscale's 100.64.0.0/10 range; add a reviewed rule for approved tailnet access alongside the network ACL. Avoid Swarm's public routing-mesh publication and Docker's all-interface default. Verify IPv4 and IPv6 reachability from outside. BaseBuddy and Dokploy databases stay separate.

### Remote access choices

| Choice | Tradeoff |
| --- | --- |
| Public TLS port | Familiar URLs and no VPN client, but needs valid PostgreSQL TLS, SCRAM, firewall rules and stable client IPs. GitHub's default runners have large changing IP ranges; an allowlist is awkward. Do not solve that by opening Postgres worldwide. [GitHub runner networking](https://docs.github.com/en/actions/reference/runners/github-hosted-runners). |
| **Tailscale, recommended** | Existing homelab/Macs already use it. Join OVH once, allow only approved devices and a CI tag to database port 5432, and add `tailscale/github-action` to the 13 workflows above. No public database port or per-run firewall changes. Check runner and BuildKit-container connectivity. |
| Cloudflare Tunnel | Existing Dokploy tunnel does not expose PostgreSQL automatically. Arbitrary TCP needs a new route/Access policy plus client-side `cloudflared` or WARP on every runner/device. Extra daemons and local forwarding are less simple here. [Cloudflare TCP requirements](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/non-http/cloudflared-authentication/arbitrary-tcp/). |

Owner action: enroll OVH and supply a tagged Tailscale OAuth client as **repository** secrets `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`, usable by jobs without the protected environment. Restrict the CI tag to this database, not the whole tailnet. Add `tailscale/github-action@v4`, pinned to a reviewed commit. Workload federation is an alternative if preferred. [Tailscale Action setup](https://tailscale.com/docs/integrations/github/github-action).

Use password authentication even over Tailscale. No public Postgres listener is needed. The overlay provides remote encryption; use verified PostgreSQL TLS too if provisioned, and avoid carrying over Supabase-specific TLS settings blindly.

No PgBouncer initially: the app already pools at four connections, scripts use one to four, and one cache process suffices. Start `max_connections=60`, monitor peaks, and serialize heavy jobs. If pooling becomes necessary, use session mode for ad-network advisory locks. `scripts/ad-networks/runtime-db.mjs` currently accepts only port 5432 for non-Supabase endpoints; a different local port needs a reviewed code change.

### Resource budget, backups and monitoring

OVH inspection: 7,746 MiB RAM, 4,963 MiB available, 53 GiB disk free; existing services already use swap.

Keep the worker's initial settings in `scripts/stack127/selfhost-db/{compose.yaml,postgresql.conf}`: 2 GiB memory cap, 2 CPUs, `shared_buffers=512MB`, `effective_cache_size=1536MB` (a planner estimate), `work_mem=4MB`, `maintenance_work_mem=128MB`, `max_connections=60`, `max_parallel_workers_per_gather=1`, `max_wal_size=1GB`, and 512 MiB container shared memory. Keep autovacuum and durability on. Measure peak host/container memory during restore and a collector run before increasing the cap.

The setup worker has prepared `scripts/stack127/selfhost-db/{backup.sh,pull-backups.sh}` and matching systemd units: OVH dump at 02:40 UTC into `/srv/stack127-db/backups/`, homelab pull at 03:10 UTC into `/srv/data/backups/stack127-db/archives/`. Keep seven daily dump/key pairs on each host and retain the cutover dump separately. Timers/marker guards remain disabled pending acceptance. Include the matching `.dump.vault-key`, and add a roles export without password hashes plus failure/freshness alerts; current scripts do not include those. Target recovery point: up to 24 hours; shorter recovery needs WAL archiving later.

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

### Rehearsal now

Do one serial dump from homelab using PostgreSQL 17 client tools and the source's direct or **session** connection, not transaction pooling. Resolve credentials privately into a 0600 libpq service/password file; do not put URLs in command output or shell tracing.

Example application-copy artifacts, with service names as placeholders:

```sh
umask 077
pg_dumpall --database=service=stack127_source --roles-only --no-role-passwords --file=roles.sql
pg_dump --dbname=service=stack127_source --format=custom --compress=6 --lock-wait-timeout=10s --schema=public --schema=extensions --schema=supabase_migrations --large-objects --file=stack127-test.dump
```

Do not pass `--no-owner` or `--no-acl`: keep ownership, grants, RLS, functions, triggers and sequences. Roles are a separate export; extension binaries and compatible versions must already exist. Schema-limited dumps do not pull in outside dependencies automatically. Check the restore manifest against the eight extensions and required roles. [PostgreSQL dump behavior](https://www.postgresql.org/docs/17/app-pgdump.html), [roles export](https://www.postgresql.org/docs/17/app-pg-dumpall.html).

This moves application data and the complete migration history; it deliberately leaves managed Auth, Storage metadata/services and platform logs on Supabase. Keep a full logical recovery export as well if source permissions allow, without overwriting the target's image-managed platform schemas. If roles export is denied by managed permissions, reproduce the required non-secret role attributes/memberships from catalog inventory and the image baseline; never omit them silently.

The worker has created the 16 source roles and a new `stack127_app` login, but memberships/settings still need review. **`stack127_app` currently has CONNECT only, no table grants and no RLS bypass. It cannot serve the site yet.** Grant required table/schema/sequence privileges and explicit trusted-backend RLS policies before testing; any BYPASSRLS alternative needs a deliberate privilege review. Keep source ownership and policies intact, and use new login credentials. Do not replay source login passwords or blindly promote platform roles. Restore into a clean target, with `pg_restore --exit-on-error`; restore schema, data and post-data in order. The chosen image has `pg_net` 0.20.4 available, not source 0.20.3; it is intentionally not installed/preloaded, and `cron.launch_active_jobs=off`. Rehearse installing compatible `pg_net` definitions with processing disabled, or remove the obsolete wake function dependency through reviewed target preparation. Do not treat extension restore as solved. Dump/restore across architectures is required; a physical data-directory copy is unsuitable.

Only one source dump at a time, no parallel dump, no concurrent heavy collection or source-wide exact-count sweeps. It reads the application data once and holds a consistent snapshot; the throttled source may make it slow. A long snapshot can retain dead rows, so watch it and stop if source pressure worsens. Archive size and duration are **not measured by this research**; 709.2 MiB is database disk size, not dump size. Record compressed bytes and elapsed dump/restore time during the test; reserve at least 5 GiB working space.

Validate the restored database:

1. Compare exact per-table row counts from the same source snapshot, plus sequence next values, primary/foreign keys, index validity, functions, triggers, grants and RLS. Reuse a `pg_export_snapshot()` / `pg_dump --snapshot` snapshot for counts if writes continue; otherwise label count differences caused by later writes. Avoid a second broad source scan today if it worsens throttling.
2. Compare all 219 migration rows including statements, and confirm latest version matches the repo. Do not replay historical data migrations into the populated clone. Use a migration dry-run to check pending work.
3. Compare the copied registry, page publication/indexing counts, directory facts, cache signing-key equality privately, and ad-network source revision tokens. Test trigram search and source fingerprints.
4. Run trusted GitHub CI/build against staged target credentials, with production REST fallback disabled. Do not replace shared live secrets for this test: use an isolated workflow/job environment. Preview without dispatching publication or acknowledging the production queue. Rehearse the actual runner and BuildKit network paths.
5. Start an isolated app against the clone. Run SQL-backed directory/search and RDAP checks, page/404 checks, and representative image loads. Test the Node worker and its lease/retry behavior without changing the live frontend. A successful deployment health endpoint is not proof of SQL reads.
6. Complete one backup/restore drill. Reset the rehearsal target before the final copy so stale rehearsal rows cannot survive.

### Final copy and write freeze

The rehearsal determines the window: final dump + restore/indexes + validation + app restart. Target **15 to 30 minutes** only if the measured rehearsal supports it; otherwise book the measured time plus a margin before starting. Do not promise a short window on an IO-throttled source.

Freeze publication/import/enrichment writes, migrations/releases, OVH collectors, homelab niche sorting, both cache processors and GitHub queue acknowledgements. Pause the 13 connecting workflows and drain running jobs; the shared release concurrency group does not cover every writer. Temporarily make the app's old SQL sessions read-only, or block the RDAP write route, then restart/drain old sessions. Freeze media uploads if keeping a full recovery snapshot.

Keep public static pages available. Drain source writes, record the freeze time, then take a **fresh** serial dump and source counts while frozen. Restore into the clean OVH target with the rehearsed role/extension setup. Disable copied HTTP wake configuration again before allowing writes. Do not rerun source migrations or modify source data to make the test pass.

## 5. One-go switch checklist

Only the coordinator applies this checklist after owner release authorization and Sol review. Updating many surfaces is not atomic; the write freeze and paused processes make it one controlled switch.

1. **Prepare privately.** Resolve the target app-role/RLS grants, `pg_net` restore difference, Tailscale binding/HBA access and backup alerts/roles export described above. Keep the old URLs, runtime configuration, worker wake configuration/schedule and rollback code/image available. Stage new target credentials for Docker, local host, tailnet and CI. Confirm extension/role compatibility, Node worker handoff, backup restore and no public database listener.
2. **Ship prerequisites while still on Supabase.** Add private networking to all database workflow jobs, disable production REST fallback, and replace the automatic Edge Function deploy step with the reviewed Node-worker delivery process. Preserve Supabase Storage config and development behavior. Rehearse CI against OVH separately.
3. **Enter the freeze above.** Stop/drain OVH jobs, pause `stack127-ad-network-niche.timer`, connecting Actions/manual runs and cache processing. Unschedule/disable Supabase wake and the Edge Function. Wait out the existing 150-second lease/in-flight work; prevent new invocations. Confirm no relevant write transaction remains.
4. **Copy and validate.** Take the final archive, restore fresh, compare counts/migration history/permissions and signing key, and ensure the target has no old HTTP wake or active copied cron job.
5. **Change all connection surfaces before resuming anything.** Homelab `.env.database`: both URLs; GitHub repository secrets: both URLs; saved Dokploy website env: `DATABASE_URL`; OVH `/srv/stack127-data/ad-networks.env`: `DATABASE_POOLER_URL`; new OVH Node worker env: its SQL URL and required worker config. Keep `SUPABASE_URL` / API keys/project ref only for the old Storage/admin scope. Check no production environment override still points at the source.
6. **Refresh consumers.** Wait for env mirrors, verify each Mac/homelab checkout resolves OVH, and restart the website, niche/manual processes and worker connections. Keep scheduled writers paused. Verify real reads independently from the website container, OVH host, homelab, a Mac and a GitHub runner.
7. **Verify the site and cache path.** Run a real registry/search SQL query, a representative SQL-backed API, the frontend build/preview, public pages, images, sitemap, robots and an unpublished 404. If deploying code, verify merge SHA = origin/main = image SHA = backend health SHA, plus `/frontend-release.json` in Cloudflare mode. A matching SHA alone does not validate the database.
8. **Open writes in order.** Enable the OVH Node worker and GitHub maintenance fallback. Test one controlled change through queue, build/refresh and acknowledgement, then resume publication, homelab niche timer and the existing OVH crontab from `scripts/ad-networks/ovh/crontab.txt`. Resume GitHub discovery/enrichment and API cache writes last. Verify job locks work across hosts and no writer/function still targets Supabase.
9. **Observe and retain recovery.** Watch errors, pool counts, queue age and memory through the first collector and nightly backup. Keep the old Supabase application tables frozen and the project online for at least seven days; independent Storage metadata may continue changing if media uploads resume. Retain Storage as long as live media URLs require it. Do not delete or downgrade it as part of today's switch.

### Rollback

**Before business writers resume:** stop the OVH worker and any target writes; restore both GitHub database secrets, homelab `.env.database`, saved Dokploy `DATABASE_URL`, and OVH ad-network env to the preserved Supabase values. Wait for mirrors, recreate app pools, verify real source SQL reads, remove the temporary source write freeze, restore the old cache wake URL/cron/function, then resume the old jobs. Rebuild/refresh public content from the source if the target changed what was served. Keep hosting mode unchanged.

**After OVH accepts business writes:** pointing back would lose those new writes. Freeze both sides, preserve an OVH dump and identify every changed table first. The coordinator must reconcile the new application rows/sequence state into Supabase or obtain explicit owner acceptance of lost writes before switching back. Disposable RDAP/cache state can be rebuilt; publication and research data cannot. Never run both writer sets at once.

## 6. Owner decisions

Decided on October 19, 2026:

1. **Remote access: Tailscale.** OVH joins the tailnet, and GitHub jobs use a tagged Tailscale OAuth client stored as repository secrets `TS_OAUTH_CLIENT_ID` and `TS_OAUTH_SECRET`. There is no public database port.
2. **Storage stays on Supabase** for this move. Only the database moves; media URLs keep working.

Still open: confirm the final freeze window after the timed rehearsal, and accept the nightly backups' maximum 24-hour recovery gap.
