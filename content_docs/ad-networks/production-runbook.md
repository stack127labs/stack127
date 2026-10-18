# Ad-network production cutover

This is the coordinator's runbook after review and release authorization. This implementation round changed local code and development data only. Do not publish any ad-network page. No Wayback/history backfill is part of this cutover.

## 1. Resolve access and capacity before activating jobs

The available read-only checks could not reach Dokploy administration. Public API requests returned Cloudflare Access HTTP 302; the T3 preview also reached its sign-in page. An HTTPS origin connection timed out. The recovery VPS password was not used. CPU, RAM, disk, load, and the existing app inventory are therefore **unverified**.

Read-only GitHub secret-name checks found `DOKPLOY_API_KEY`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`, and `GHCR_DOKPLOY_TOKEN` in the protected production environment. Neither repository nor production scope listed an SSH secret. The current release workflow uses the Dokploy API, not SSH. Do not assume a downloadable SSH identity exists in GitHub.

The owner must supply either an approved SSH identity and secure file-transfer path, or an authenticated Dokploy server terminal plus an equivalent secure transfer path. Do not use `OVH_VPS_Password`, create Access tokens, expose a port, or change Access policy just to bypass this prerequisite. The commands below assume the owner supplies an identity as `OVH_JOBS_SSH_KEY` and can run Docker on the production host. Never commit that key.

On the coordinator's machine, after that access is available:

```bash
ssh -i "$OVH_JOBS_SSH_KEY" ubuntu@54.39.99.47 \
  'nproc; uptime; free -h; df -h / /var/lib/docker; sudo docker stats --no-stream --format "{{.Name}} CPU={{.CPUPerc}} RAM={{.MemUsage}}"; sudo docker ps --format "{{.Names}} {{.Image}}"'
```

Record actual numbers before proceeding. The repo limits the jobs container to 0.5 CPU, 1 GiB RAM, four fetch workers, and a 640 MiB JavaScript heap. These are provisional limits, not measured capacity. Plan at least 15 GiB free disk for the current approximately 792 MiB store, seven backups, online sync snapshots, an incoming RDAP snapshot, cached traffic files, image storage, and growth. Require enough spare RAM to give this container its full limit without squeezing the live app; 2 GiB currently available is a conservative starting gate. If capacity is tight, stop here and have the coordinator agree the sizing. Do not move any work to a different machine implicitly.

## 2. Review, merge, release, and verify migrations

1. Review the local implementation commit as Sol, including the production target guards, niche ownership, scheduler recovery, and Compose limits. Push only after authorization. Update PR [#53](https://github.com/stack127labs/stack127/pull/53) and wait for its required CI build. No local `npm run build`.
2. Merge through the normal release flow. Follow [production deployment](../../stack127_docs/production-deployment.md) and [Cloudflare hosting](../../stack127_docs/cloudflare.md). The release workflow applies the ten pending migrations before deploying the backend. Do not run publication manifests or the publishing workflow.
3. Require merge SHA = `origin/main` = deployed backend image SHA = live `/api/health?scope=deploy` SHA. In Cloudflare mode, `/frontend-release.json` must match too. Save this 40-character value as `RELEASE_SHA` for the following steps.
4. Run this read-only production SQL through the approved database client:

```sql
select version from supabase_migrations.schema_migrations
where version between '20261015183928' and '20261016144329'
order by version;
-- Must return exactly the ten versions carried by PR #53.

select to_regclass('public.ad_network_daily_counts'),
       to_regclass('public.ad_network_relationship_events'),
       to_regclass('public.ad_network_check_observations');

select count(*) as networks, count(*) filter(where slug='snigel') as snigel
from public.ad_networks;
-- 44 networks, no Snigel identity; current reviewed aliases/signatures.

select slug from public.stack127_pages
where (slug='ad-networks' or slug like 'ad-networks/%' or slug='ad-network-checker')
  and is_published;
-- Zero rows. Never turn publication on in this runbook.
```

Read-only comparison in this round found production at `20261010064142`; all ten new migrations were pending. `stack127_directory_record_value(text,jsonb)` matched migration `20261006105817`; `stack127_cache_source_revisions(text[],text[])` matched `20261006155027`. Both are security invoker. Unrelated projection and source-revision branches are preserved. All 15 new table/index/function names checked were absent, and the seven new publisher fact columns were absent. No conflicts were found. The old 45-network production roster, including Snigel, is expected before these migrations.

## 3. Build the jobs image on GitHub

From a coordinator checkout authenticated to GitHub:

```bash
gh workflow run ad-networks-runtime.yml --repo stack127labs/stack127 \
  --ref main -f release_sha="$RELEASE_SHA"
gh run list --repo stack127labs/stack127 --workflow ad-networks-runtime.yml --limit 1
# Watch the returned run ID:
gh run watch RUN_ID --repo stack127labs/stack127 --exit-status
```

The image is `ghcr.io/stack127labs/stack127-ad-networks:$RELEASE_SHA`. It contains scripts and their dependencies, not a Next.js build. Configure GHCR pull access with the existing approved read-packages identity if the package is private. Builds run only on GitHub; do not build this image on OVH.

## 4. Take a safe one-time seed while RDAP continues

On homelab, use the **released** snapshot script, or the already-running isolated gathering copy's equivalent. Do not restart the supervisor, replace its checkout, or stop PID 348650 merely to take this snapshot. Verify the live PID/progress first; PIDs in this document are observations, not future kill targets.

```bash
cd /srv/data/projects/stack127
# If this checkout is still old, use snapshot-local.mjs from the released code
# in a temporary script copy; do not modify the running isolated gathering copy.
node scripts/ad-networks/snapshot-local.mjs \
  --local-database "$HOME/.local/share/stack127/ad-networks.sqlite" \
  --output /tmp/ad-networks-seed.sqlite
```

This pins a consistent SQLite read view and checks the snapshot. Never copy an open SQLite main file alone; its WAL may hold the latest RDAP writes. The live source and RDAP pass continue unchanged.

Transfer that snapshot over the approved secure path. With the supplied SSH identity, from the coordinator's machine:

```bash
scp homelab:/tmp/ad-networks-seed.sqlite /tmp/ad-networks-seed.sqlite
scp -i "$OVH_JOBS_SSH_KEY" /tmp/ad-networks-seed.sqlite \
  ubuntu@54.39.99.47:/tmp/ad-networks-seed.sqlite
```

On OVH, set `RELEASE_SHA` to the verified value and seed the new volume once:

```bash
IMAGE="ghcr.io/stack127labs/stack127-ad-networks:$RELEASE_SHA"
sudo docker pull "$IMAGE"
sudo docker volume create stack127-ad-networks-data
sudo docker run --rm --user 0:0 \
  -v stack127-ad-networks-data:/data \
  -v /tmp/ad-networks-seed.sqlite:/seed.sqlite:ro \
  --entrypoint sh "$IMAGE" -ec \
  'test ! -e /data/ad-networks.sqlite; mkdir -p /data/state; cp /seed.sqlite /data/ad-networks.sqlite; chmod 700 /data /data/state; chmod 600 /data/ad-networks.sqlite; chown -R 1000:1000 /data'
sudo docker run --rm --user 1000:1000 -v stack127-ad-networks-data:/data \
  --entrypoint node "$IMAGE" --input-type=module -e \
  'import {DatabaseSync} from "node:sqlite"; const db=new DatabaseSync("/data/ad-networks.sqlite",{readOnly:true}); const result=db.prepare("pragma quick_check").get(); console.log(result); db.close(); if(result.quick_check!=="ok")process.exitCode=1;'
```

If the destination already exists, the copy fails. Inspect it instead of overwriting it. Retain the original seed snapshot until the cutover passes.

## 5. Create a separate, paused Dokploy Compose service

In the existing Stack127 production project on `https://dokploy.stack127.com`, create one **Docker Compose** service named `ad-networks-jobs`, using `stack127labs/stack127`, branch `main`, Compose path `scripts/ad-networks/runtime/compose.yml`. Use regular Docker Compose, not Docker Stack. It has no domain, published port, Docker socket, or build step. Check Preview Compose before deploying. Leave the live website application unchanged.

Set only these service variables, through Dokploy's private environment editor:

| Name | Value/source |
| --- | --- |
| `AD_NETWORKS_RELEASE_SHA` | Exact verified `RELEASE_SHA` |
| `DATABASE_POOLER_URL` | Existing **production session pooler**, port 5432, from `.env.database` / approved config |
| `GITHUB_ALERT_TOKEN` | Existing issue alert token from `.env.deploy` |
| `AD_NETWORKS_ACTIVATED_AT` | Current UTC ISO timestamp, such as output from `date -u +%Y-%m-%dT%H:%M:%S.000Z`; set once |
| `AD_NETWORKS_ENABLED_JOBS` | Empty string for the first deployment |

Do not use a transaction pooler: the heavy-job and sync locks are session advisory locks. Do not paste development credentials. The runtime target marker is already fixed to production in Compose. Secrets are runtime variables, never Docker build arguments. The external volume name must remain `stack127-ad-networks-data` across redeploys and rollback.

Deploy the paused service. It must become healthy and write `/data/state/heartbeat.json`, with no jobs admitted while the enabled list is empty. Record its Compose project name from Dokploy. On OVH:

```bash
# Set this to the actual Compose project name shown by Dokploy:
JOBS_COMPOSE_PROJECT='ACTUAL_PROJECT_NAME'
JOB_CONTAINER="$(sudo docker ps -q \
  --filter "label=com.docker.compose.project=$JOBS_COMPOSE_PROJECT" \
  --filter label=com.docker.compose.service=jobs)"
test -n "$JOB_CONTAINER"
sudo docker exec "$JOB_CONTAINER" node scripts/ad-networks/scheduler.mjs --check
sudo docker exec "$JOB_CONTAINER" node scripts/ad-networks/catalog.mjs \
  --local-database /data/ad-networks.sqlite
# Expect 44 identities, the reviewed catalog, and retired_snigel=false.
```

## 6. Seed production, with publication still off

Take an ad-network-table production backup before the first write. From a coordinator checkout with a compatible `pg_dump` installed, supply credentials privately through the existing env file:

```bash
umask 077
node --env-file=.env.database --input-type=module <<'JS'
import { spawnSync } from 'node:child_process';
const tables = ['ad_networks', 'ad_network_publishers', 'ad_network_publisher_relationships',
  'ad_network_daily_counts', 'ad_network_relationship_events', 'ad_network_check_observations'];
const result = spawnSync('pg_dump', ['--format=custom', '--file=/tmp/ad-networks-before-seed.dump',
  ...tables.flatMap(table => ['--table', `public.${table}`])], {
  env: { ...process.env, PGDATABASE: process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL },
  stdio: ['ignore', 'ignore', 'pipe'],
});
if (result.error || result.status !== 0) throw new Error('Production backup failed; inspect pg_dump privately before proceeding');
console.log('Created /tmp/ad-networks-before-seed.dump');
JS
```

Keep that backup outside Git in the owner's private backup storage. Run the following inside the paused jobs container; no site checks or model job should be running yet:

```bash
sudo docker exec "$JOB_CONTAINER" node --experimental-strip-types scripts/ad-networks/refresh.mjs \
  --job sync --local-database /data/ad-networks.sqlite --state-directory /data/state \
  --environment production --confirm stack127-production
# Above is the printable plan. Apply the reviewed seed:
sudo docker exec "$JOB_CONTAINER" node --experimental-strip-types scripts/ad-networks/refresh.mjs \
  --job sync --local-database /data/ad-networks.sqlite --state-directory /data/state \
  --environment production --confirm stack127-production --apply
```

Full sync inserts seed niches for newly created publishers but preserves existing target niche values. If production already contained publisher rows, preview and apply the one-time reviewed classifications while both schedulers remain paused:

```bash
sudo docker exec "$JOB_CONTAINER" node scripts/ad-networks/sync.mjs \
  --sqlite /data/ad-networks.sqlite --niches-only \
  --environment production --confirm stack127-production
sudo docker exec "$JOB_CONTAINER" node scripts/ad-networks/sync.mjs \
  --sqlite /data/ad-networks.sqlite --niches-only \
  --environment production --confirm stack127-production --apply
sudo docker exec "$JOB_CONTAINER" node --experimental-strip-types scripts/ad-networks/revalidate.mjs \
  --environment production --confirm stack127-production --apply
```

Do not use `--niches-only` as a recurring OVH job. It is the explicit reviewed seed/correction path and can replace existing labels.

Sync automatically captures the current UTC day's counts and observed movements. No dates are backfilled. Compare source/target reviewed counts and accepted niche counts; candidates and never-confirmed departures deliberately stay in SQLite. Recheck the publication SQL in step 2 and public 404s. The schema/data import must not publish anything.

## 7. First-run checks, then enable the OVH schedules

Run one bounded check and one real collector, and capture the first OVH backup. Keep the installed homelab backup timer until the original RDAP pass and supervisor also finish:

```bash
for job in verification platform snapshot backup; do
  sudo docker exec "$JOB_CONTAINER" node --experimental-strip-types scripts/ad-networks/refresh.mjs \
    --job "$job" --local-database /data/ad-networks.sqlite --state-directory /data/state \
    --environment production --confirm stack127-production --apply \
    --concurrency 1 --limit 1 --time-budget-minutes 1 || break
done
sudo docker logs --tail 100 "$JOB_CONTAINER"
sudo docker stats --no-stream "$JOB_CONTAINER"
```

Stop rollout if any command fails. Each successful result must say `synced:true` and `revalidated:true`. The backup directory must contain a checked SQLite snapshot. Run two `refresh` commands concurrently as an explicit lock check only if needed: one must return exit 75 without admitting work. Do not mistake contention for completion.

In Dokploy, set this exact enabled list and redeploy:

```text
verification,snapshot,platform,domain-age,ads-txt-summary,backup,discovery,publisher-names,traffic
```

Keep `AD_NETWORKS_ACTIVATED_AT` unchanged. Refresh `JOB_CONTAINER` after every redeploy. The enabled schedules are:

| Job | UTC due time |
| --- | --- |
| Verification | Continuous five-minute/500-site batches between scheduled work |
| Snapshot | Daily 00:10 |
| Platform + favicon | Daily 01:00 |
| Domain age | Daily 02:00 |
| ads.txt summary | Daily 03:00 |
| Backup | Daily 05:00 |
| Discovery | Tuesday 04:00 |
| Publisher names | Wednesday 04:00 |
| Traffic | Day 5 of each month, 04:00 |

A due job waits for the active heavy job to finish; two heavy jobs never intentionally overlap. Long site batches yield after their budget, and source-feed jobs have a hard timeout. Failed jobs retry after five minutes. Persisted slots survive a restart. The first deployment runs only due slots at/after activation; the explicit first-run commands above supply the seed/count baseline.

Inspect `/data/state/scheduler.json` and progress files, host memory/load/disk, and the existing Supabase cache-worker state. Origin invalidation is synchronous. Edge/static refresh is verified by the existing worker, and may finish several minutes later. Existing delayed-cache alerts continue independently. Configure the owner's external uptime monitor against container/host health; a process cannot report its own powered-off host through GitHub.

## 8. Start homelab niche sorting and retire obsolete units

Only after production has its full seed and OVH is healthy, fast-forward the homelab checkout to the released main commit. Check its status first and preserve unrelated work. Do not modify or stop the isolated one-time gather/RDAP processes. Confirm the mirrored `.env.database` is production and `.env.deploy` contains `GITHUB_ALERT_TOKEN`; edit neither file on a Mac.

```bash
cd /srv/data/projects/stack127
git status --short
git pull --ff-only origin main
/home/teja/.local/bin/claude auth status
# Read-only preview; no model execution or writes:
node --experimental-strip-types scripts/ad-networks/niche-sort.mjs \
  --environment production --confirm stack127-production --limit 2
# First real classification is bounded to two domains:
node --experimental-strip-types scripts/ad-networks/niche-sort.mjs \
  --environment production --confirm stack127-production --apply --limit 2 \
  --claude /home/teja/.local/bin/claude
install -m 644 scripts/ad-networks/systemd/stack127-ad-network-niche.{service,timer} \
  "$HOME/.config/systemd/user/"
systemd-analyze --user verify "$HOME/.config/systemd/user/stack127-ad-network-niche.service" \
  "$HOME/.config/systemd/user/stack127-ad-network-niche.timer"
systemctl --user daemon-reload
systemctl --user enable --now stack127-ad-network-niche.timer
systemctl --user list-timers stack127-ad-network-niche.timer
```

The timer is Sunday 06:00 UTC and persistent. A missed Sunday can run immediately on enable. Classification uses the existing subscription login, disables tools, validates each exact input set, withholds low confidence, and writes only still-unsorted niches. Results/attempts stay in homelab state. Watch `journalctl --user -u stack127-ad-network-niche.service`. A nonzero model/validation/import/revalidation exit opens a failure issue and fails the service. Systemd's stop/timeout kills its whole process group. Persistent scheduling retries on the next weekly occurrence; a coordinator can restart the failed service sooner after resolving its issue.

Disable these installed old units if present: `stack127-ad-network-verification.service`, `stack127-ad-network-discovery.service`, `stack127-ad-network-discovery.timer`, `stack127-ad-network-sync.timer`, `stack127-ad-network-platform.timer`, `stack127-ad-network-domain-age.timer`, `stack127-ad-network-ads-txt-summary.timer`, `stack127-ad-network-publisher-names.timer`, `stack127-ad-network-traffic.timer`, `stack127-ad-network-niche-export.timer`, and any active `stack127-ad-network-refresh@…service` instances. Use `systemctl --user disable --now UNIT` for each present unit. Remove only these retired files from `~/.config/systemd/user/`, including the old `stack127-ad-network-refresh@.service`, then daemon-reload. The repo already removes their templates. Keep the installed `stack127-ad-network-backup.service` and `.timer` until both original one-time processes finish: their loaded old code still starts that service before the next UTC day’s first write. Released code calls `backup-local.mjs` directly and has no systemd dependency. Once the old processes have finished and OVH’s first backup is checked, disable/remove those last two installed units too. Keep old backup files. Never stop an unrelated service or kill the original RDAP process through a broad process match.

After one accepted niche import, record its domain and label. Let an OVH sync run and read that same production row again: its label must stay unchanged. This is the key cross-host ownership check.

## 9. Merge the finished RDAP pass later, without reseeding

Keep the original homelab RDAP pass running to completion. Its supervisor may still finish development catch-up; it does not own production. At completion, take another consistent snapshot with `snapshot-local.mjs`, transfer it securely as `/tmp/ad-networks-rdap-finished.sqlite`, and copy it into `/data/state/rdap-finished.sqlite` in the existing jobs volume. A temporary helper sets the file's owner and private permissions; it does not change the working database:

```bash
sudo docker run --rm --user 0:0 \
  -v stack127-ad-networks-data:/data \
  -v /tmp/ad-networks-rdap-finished.sqlite:/incoming.sqlite:ro \
  --entrypoint sh "$IMAGE" -ec \
  'install -o 1000 -g 1000 -m 600 /incoming.sqlite /data/state/rdap-finished.sqlite'
sudo docker exec "$JOB_CONTAINER" node --experimental-strip-types scripts/ad-networks/refresh.mjs \
  --job rdap-import --source-sqlite /data/state/rdap-finished.sqlite \
  --local-database /data/ad-networks.sqlite --state-directory /data/state \
  --environment production --confirm stack127-production
sudo docker exec "$JOB_CONTAINER" node --experimental-strip-types scripts/ad-networks/refresh.mjs \
  --job rdap-import --source-sqlite /data/state/rdap-finished.sqlite \
  --local-database /data/ad-networks.sqlite --state-directory /data/state \
  --environment production --confirm stack127-production --apply
```

Exit 75 means another heavy job owns the lock; retry after it finishes. Newer OVH RDAP checkpoints win over older incoming ones. Successful prior dates are preserved when a newer incoming lookup lacks a date. Only RDAP checkpoints and domain dates merge; verification, relationships, sources, platform, traffic, and niches remain OVH/production-owned. The wrapper syncs and revalidates automatically. Verify age counts and a sample of newly filled domains, then remove only the transferred snapshots you created. Do not replace `/data/ad-networks.sqlite` with the finished homelab database.

## 10. Rollback

1. Pause admissions by clearing `AD_NETWORKS_ENABLED_JOBS` and redeploying the jobs service, or stop only that Compose service. Stop/disable the homelab niche timer and its running service. Leave the website application alone.
2. Keep the named volume, seed, backups, and niche checkpoints. Never use `docker compose down -v`, `docker volume rm`, or overwrite the store during rollback. A stopped collector's leases/checkpoints are resumable.
3. For a runtime-code regression, select the last reviewed working jobs image SHA in Dokploy, retaining the same volume, secrets, activation timestamp, and disabled list. Validate catalog compatibility before restarting; the catalog guard refuses older code over a newer catalog. First activation has no previous jobs image: leave the service stopped and fix forward.
4. Retain the ten additive migrations and collected data. They do not publish pages. Do not run destructive down-migrations or restore the whole production database over unrelated site work. If a data correction is necessary, the coordinator must review a scoped restoration from the pre-seed database backup separately. Replaying a local SQLite backup is not a complete Postgres/history rollback.
5. A website-release regression follows the normal release rollback procedure, including matching backend/frontend SHAs. Do not toggle publication or Cloudflare/DNS as a shortcut.
6. After repair, rerun the bounded first-run checks, verify the preserved-niche invariant, and re-enable only the agreed jobs. An existing failure issue closes when that job succeeds.

## Development verification from this round

- `npm run quality`: TypeScript and 80 core tests passed.
- All ad-network focused tests: 140 passed, with one optional database fixture skipped in the credential-free suite. That fixture also passed separately against managed development.
- Plans for all 13 runner jobs used `environment:development`, `applied:false`, and included sync/revalidation without contacting storage. Niche preview was read-only and returned zero eligible unsorted sites with the newly synced homepage evidence.
- Real development snapshot: `changed:44`. Reviewed sync: one publisher/relationship, no inserts or relationship changes. Revalidation: `origin_revalidated:true`, `durable_cache_queue:true`, `paths:70`.
- Real development homepage fetch for `100daysofrealfood.com`: `total:1`, `processed:1`, `platform_found:1`; sync `publishers_updated:1`, no relationship/history changes, then 70-path revalidation. Stored WordPress and the fetched page title. Target niche remained `food` while SQLite contained `gaming`.
- Development counts: 44 networks and 113,514 listed links in today's snapshots. Cache events remained durable with zero attempts at inspection.
- Real development lock test: second heavy job admitted `false`; after release admitted `true`.
- EthicalAds at 1280 and 390 CSS pixels: Top niches showed `Share of 3 sorted sites`, Tech 100%, and document width equalled viewport width.
- Homelab Haiku subscription CLI returned `OK` for a tiny tools-disabled prompt. Both original gather/RDAP PIDs remained alive. No API key was used.
- Public `/ad-networks`, `/ad-networks/ethicalads`, `/ad-networks/niches/food`, and `/ad-network-checker` each returned HTTP 404.

Runtime packaging and production build checks still belong to GitHub after the coordinator pushes. No local Docker/Next production build, production data write, server change, deployment, or timer activation was performed in this implementation round.

The Compose volume and deployment setup follow the official [Dokploy Compose example](https://docs.dokploy.com/docs/core/docker-compose/example) and [Docker external-volume reference](https://docs.docker.com/reference/compose-file/volumes/).
