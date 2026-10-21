# Launch directories release and monthly metrics

The coordinator runs these commands after the merge.

## Before merging

Done on 2026-10-21: the compare Copy link and the visible Ahrefs credit beside every DR value are fixed, Sol review round 4 passed, and both development publisher plans (`plan-dev-1.json`: 156 unchanged; `plan-parent-dev-1.json`: parent date touched, verify passed) were applied and verified.

PR CI can read production before the new columns exist. The fact projection uses nullable JSON keys during that compatibility window. The release workflow applies both additive migrations before the production build. No migration-only release is needed for these reads.

## Production order

1. **Wait for the merge release and check the exact revision.** Work from the clean released checkout. Keep the ignored manifests and plans from this task. Do not create or switch branches here.

   ```sh
   git fetch origin main
   export LAUNCH_RELEASE_SHA="$(git rev-parse origin/main)"
   test "$(git rev-parse HEAD)" = "$LAUNCH_RELEASE_SHA"
   gh run list --repo stack127labs/stack127 --workflow stack127-release-e2e.yml \
     --commit "$LAUNCH_RELEASE_SHA" --limit 5
   gh run watch <release-run-id> --repo stack127labs/stack127 --exit-status
   node --input-type=module <<'NODE'
   const expected = process.env.LAUNCH_RELEASE_SHA;
   const health = await (await fetch('https://stack127.com/api/health?scope=deploy')).json();
   const frontend = await (await fetch('https://stack127.com/frontend-release.json')).json();
   if (!health.ok || health.build?.sha !== expected || frontend.sha !== expected) throw Error('Live revision differs from released main');
   console.log('Backend and Cloudflare frontend match released main');
   NODE
   ```

   Use the run ID printed for this exact commit, and require the workflow's deployed-image check to pass too. Stop if main advances or the release fails. Confirm both migrations `20261021120000` and `20261021120100` were applied. No local build.

2. **Check production schema access and update the OVH job checkout.** This query is read-only. The existing table-wide app grants cover added columns, and `stack127_backend_access` covers their rows. No new table is added, so rerunning `app-role.sql` is unnecessary.

   ```sh
   node --input-type=module <<'NODE'
   import pg from 'pg';
   import {resolveDatabaseUrl} from './scripts/stack127/tool-pages/lib.mjs';
   const pool = new pg.Pool({connectionString:resolveDatabaseUrl({environment:'production'}),max:1});
   try {
     const {rows} = await pool.query(`select current_user,
       (select relrowsecurity from pg_class where oid='public.launch_directories'::regclass) rls,
       has_column_privilege(current_user,'public.launch_directories','domain_rating','SELECT,UPDATE') dr_access,
       has_column_privilege(current_user,'public.launch_directories','traffic_bucket','SELECT,UPDATE') traffic_access,
       has_column_privilege(current_user,'public.launch_directories','price_tiers','SELECT,UPDATE') price_access,
       (select count(*) from pg_trigger where tgrelid='public.launch_directories'::regclass
         and tgname like 'stack127_touch_launch_children_%' and tgenabled='O') child_triggers,
       (select count(*) from public.launch_directories where is_published) published`);
     const r=rows[0];
     if(r.current_user!=='stack127_app'||!r.rls||!r.dr_access||!r.traffic_access||!r.price_access||Number(r.child_triggers)!==3||Number(r.published)!==155) throw Error('Launch backend gate failed');
     console.log('App role, RLS, new columns, triggers and 155 source records pass');
   } finally {await pool.end();}
   NODE
   ssh ovh 'cd /srv/stack127 && git pull --ff-only origin main && git rev-parse HEAD && node --input-type=module -e '\''await Promise.all([import("pg"),import("tldts")]); console.log("Dependencies present")'\'''
   ```

   OVH's checkout must report the same released main SHA. Both dependencies are already production dependencies; no package install is added by this feature. Stop if its checkout is dirty or cannot fast-forward. The Node cache worker now reads the released cache map. Its systemd timer remains as configured.

3. **Publish the 155 child pages and compare through the directory publisher.** Use the reviewed child manifest already in `tmp/page-publishing/launch-directories/manifest.json`. The identical `manifest-final.json` is a second frozen copy. New plans need unused filenames.

   ```sh
   npm run stack127:directories:publish -- prepare --environment production \
     --manifest tmp/page-publishing/launch-directories/manifest.json \
     --out tmp/page-publishing/launch-directories/plan-prod-1.json
   npm run stack127:directories:publish -- preview --environment production \
     --plan tmp/page-publishing/launch-directories/plan-prod-1.json
   npm run stack127:directories:publish -- dispatch --environment production \
     --plan tmp/page-publishing/launch-directories/plan-prod-1.json \
     --confirm stack127-production --release-sha "$LAUNCH_RELEASE_SHA"
   gh run list --repo stack127labs/stack127 --workflow stack127-publish-pages.yml --commit "$LAUNCH_RELEASE_SHA" --limit 5
   gh run watch <child-publication-run-id> --repo stack127labs/stack127 --exit-status
   ```

   Expect 156 new published directory rows, all `is_indexable:false`, with reviewed development titles/search fields, empty paired cards, and null card keys. Wait for the new dispatch's run to appear; never watch an older run for the same SHA. The workflow checks noindex, canonical, absence from sitemap/JSON-LD, and live content after rebuilding Cloudflare. Never use `sync-pages.mjs` in production.

4. **Publish the parent metadata and content date touch.** Prepare this plan only after child publication finishes; children touch the parent's date.

   ```sh
   npm run stack127:directories:publish -- prepare --environment production \
     --manifest tmp/page-publishing/launch-directories/manifest-parent.json \
     --out tmp/page-publishing/launch-directories/plan-parent-prod-1.json
   npm run stack127:directories:publish -- preview --environment production \
     --plan tmp/page-publishing/launch-directories/plan-parent-prod-1.json
   npm run stack127:directories:publish -- dispatch --environment production \
     --plan tmp/page-publishing/launch-directories/plan-parent-prod-1.json \
     --confirm stack127-production --release-sha "$LAUNCH_RELEASE_SHA"
   gh run list --repo stack127labs/stack127 --workflow stack127-publish-pages.yml --commit "$LAUNCH_RELEASE_SHA" --limit 5
   gh run watch <parent-publication-run-id> --repo stack127labs/stack127 --exit-status
   ```

5. **Import the reviewed facts.** First preview the dataset transaction, then apply exactly the same file.

   ```sh
   node --experimental-strip-types scripts/launch-directories/import-facts.mjs \
     --environment production --confirm stack127-production \
     --input-file content_docs/launch-directories/facts-2026-10.json
   node --experimental-strip-types scripts/launch-directories/import-facts.mjs \
     --environment production --confirm stack127-production \
     --input-file content_docs/launch-directories/facts-2026-10.json --apply
   ```

   The importer touches only comparison facts. It preserves the overall editorial check date, sources, price labels, and evidence. Identical retries change no rows. The existing triggers queue all affected pages; the Node worker starts a normal frontend refresh.

6. **Apply the seven price/evidence corrections with fresh guarded versions.** Importing facts moves row timestamps, so do not use the earlier snapshot file unchanged after step 5. This helper checks the reviewed old price/evidence values before refreshing only the row versions.

   ```sh
   mkdir -p tmp/launch-directories
   node --experimental-strip-types scripts/launch-directories/prepare-record-corrections.mjs \
     --review-file content_docs/launch-directories/record-corrections-2026-10.json \
     --out tmp/launch-directories/record-corrections-after-facts.json
   node --experimental-strip-types scripts/stack127/database/update-launch-directories.mjs \
     --environment production --confirm stack127-production \
     --input-file tmp/launch-directories/record-corrections-after-facts.json
   node --experimental-strip-types scripts/stack127/database/update-launch-directories.mjs \
     --environment production --confirm stack127-production \
     --input-file tmp/launch-directories/record-corrections-after-facts.json --apply
   ```

   Expect seven changes on the first run, or zero if already applied. Stop on a changed reviewed field or row version. Do not regenerate values from development to bypass the guard. The two official pricing conflicts stay marked as conflicts.

7. **Prepare the two-key job env on homelab and copy it privately to OVH.** The owner must first add `AHREFS_API_KEY` to homelab `/srv/data/projects/stack127/.env.analytics`. Never edit a Mac env mirror. The helper reads the current production app URL, validates its identity, changes only the host/SSL mode for OVH loopback, and writes only the URL and API key. No value goes to chat or command output.

   ```sh
   ssh homelab 'cd /srv/data/projects/stack127 && git pull --ff-only origin main && node scripts/launch-directories/ovh/prepare-env.mjs'
   ssh homelab 'scp /srv/data/projects/stack127/.env.launch-directory-metrics ovh:/srv/stack127-data/launch-directory-metrics.env'
   ssh ovh 'chmod 600 /srv/stack127-data/launch-directory-metrics.env && test "$(stat -c %U /srv/stack127-data/launch-directory-metrics.env)" = ubuntu'
   ```

   If a prepared homelab file already exists, inspect its identity privately and prepare a new file with `--out .env.launch-directory-metrics.next`, then replace only this job's source file after review. Do not print either env. Keep homelab as source for future key/password changes.

8. **Install the wrapper and append the monthly cron without replacing existing jobs.** The checkout already has the released wrapper. Node 22.23.3 and `flock` were verified on OVH. The existing `/etc/logrotate.d/stack127-ad-networks` covers `/srv/stack127-data/logs/*.log` weekly, so no second log rotation rule is needed.

   ```sh
   ssh ovh 'chmod 755 /srv/stack127/scripts/launch-directories/ovh/run-job.sh && sh -n /srv/stack127/scripts/launch-directories/ovh/run-job.sh'
   ssh ovh 'set -eu
   launch_cron=$(mktemp)
   crontab -l > "$launch_cron"
   awk '\''index($0,"/scripts/launch-directories/ovh/run-job.sh launch-directory-metrics")==0'\'' "$launch_cron" > "$launch_cron.next"
   cat /srv/stack127/scripts/launch-directories/ovh/crontab.txt >> "$launch_cron.next"
   crontab "$launch_cron.next"
   rm "$launch_cron" "$launch_cron.next"
   crontab -l'
   ```

   Confirm exactly one `0 6 2 * * ... run-job.sh launch-directory-metrics` line and every existing ad-network entry. This runs as `ubuntu` on the UTC server.

9. **Run a small dry check, then the first full refresh through the wrapper.** The dry check makes three real API lookups and no database writes. The wrapper applies the full run and uses the same lock/log path as cron.

   ```sh
   ssh ovh 'cd /srv/stack127 && node --experimental-strip-types scripts/launch-directories/refresh-metrics.mjs --env-file /srv/stack127-data/launch-directory-metrics.env --environment production --confirm stack127-production --limit 3'
   ssh ovh '/srv/stack127/scripts/launch-directories/ovh/run-job.sh launch-directory-metrics'
   ssh ovh 'tail -30 /srv/stack127-data/logs/launch-directory-metrics.log'
   ```

   Exit 0 means complete, 2 means a partial run with failed sources, rate limits, or changed rows, 76 means another copy is running, and 1 means startup/database failure. Successful metrics remain saved on a partial run. Keep the last known failed metrics and their dates. Do not retry repeatedly after rate limiting.

10. **Verify cache refresh, live pages, and the dashboard.** Allow the normal Cloudflare refresh workflow to finish after the final database changes.

    ```sh
    gh run list --repo stack127labs/stack127 --workflow stack127-frontend-refresh.yml --commit "$LAUNCH_RELEASE_SHA" --limit 5
    gh run watch <final-frontend-refresh-run-id> --repo stack127labs/stack127 --exit-status
    node --env-file=.env.database scripts/stack127/cache/status.mjs
    npm run stack127:directories:publish -- verify --environment production \
      --plan tmp/page-publishing/launch-directories/plan-prod-1.json \
      --release-sha "$LAUNCH_RELEASE_SHA"
    ssh homelab 'cd /srv/data/projects/stack127 && node --input-type=module -e '\''import{readFileSync}from"node:fs"; const rows=JSON.parse(readFileSync("stack127_docs/monitoring.json")).automations; if(!rows.some(r=>r.key==="stack127-vps/launch-directory-metrics")) throw Error("Dashboard metadata missing"); console.log("Launch directory dashboard metadata present")'\'''
    ```

    Open `https://monitor.ravitejaknts.com`, choose **Launch directories**, and confirm the job name, day-2 06:00 UTC cadence, first run result, and log. The dashboard discovers the OVH `ubuntu` cron job by its `run-job.sh` name; it reads descriptions from the homelab main checkout. No dashboard deployment is needed.

    Check `/launch-directories`, two listing children, and compare at desktop and mobile widths. Confirm fresh facts, working selection/copy links, adjacent Ahrefs credit, noindex children with their own canonical, no JSON-LD, and absence from sitemap. Confirm an unregistered child returns 404. Keep the frozen publication plans until verification passes.

## Implementation checks

- Production read-only: `stack127_app`, RLS enabled, backend ALL policy, 155 published source rows, zero child rows before publication. Existing table DML grants cover future columns. No app-role change is needed.
- A temporary non-bypass development role with the same grants/policies updated the new DR column and queued all 156 child page events. Its role, membership, policies, row changes, dates, and events were rolled back. The new trigger worked without a direct EXECUTE grant on its trigger function.
- Exact fact projection passed against both production's old schema (all new values null) and development's new schema (7 DR, 155 popularity). Whole-row source fingerprints and meaningful-change triggers include the new columns.
- Development child batch: prepared and previewed, 156 unchanged published noindex pages. Parent batch: prepared and previewed, one intended public-date touch. No development publication changes were committed by this task.
- Facts re-import: 155 unchanged, rolled back. Development integration tests checked idempotence, exact row versions, evidence preservation, fingerprints, child dates, and queued page events, then rolled back.
- `npx tsc --noEmit` passed. `npm run quality` passed TypeScript and 108 core tests. The final focused suite passed 154 tests, including the development database tests. No build ran locally.
- Tranco list `262W9`: live download validated all one million rows, including its six reserved wildcard placeholders. Ahrefs request parsing/pacing/backoff is tested with simulated responses. A real authenticated DR request remains blocked until the key exists.
- Homelab `.env.analytics` had no `AHREFS_API_KEY` at the implementation check. Nothing has been installed or enabled on OVH by this task.
