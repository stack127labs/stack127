# Launch directory facts and child pages

Commands run from the repository root. Facts imports and metrics refreshes default to development and a dry run. Production requires `--environment production --confirm stack127-production`, including dry runs. Add `--apply` to commit. `sync-pages.mjs` stays development-only.

```sh
node --experimental-strip-types scripts/launch-directories/import-facts.mjs --environment development --input-file content_docs/launch-directories/facts-2026-10.json
node --experimental-strip-types scripts/launch-directories/sync-pages.mjs --environment development
```

The facts file is an array with one object per slug. Omitted facts stay unchanged; explicit `null` clears that fact's new columns. Unknown keys, duplicate or unknown slugs, invalid dates, numbers, and tier shapes stop the whole transaction. Traffic rank must agree with its bucket. Prices use USD with at most two decimal places. A source object must have all the keys in the reviewed format. Sources validate the input but are not written into the existing evidence or facts. Keep the reviewed file for provenance.

The importer writes only the new comparison columns and uses database JSON equality to skip identical values. An identical import does not update row or public dates. The snapshot and cache revision SQL include the complete row. Published record changes touch the parent and registered children, including compare. Private research-only changes do not touch public dates.

The page sync uses the shared directory insert helper. It inserts registry drafts and missing family rows, then publishes only newly inserted registry rows. Existing titles, metadata, cards, indexing settings, and publication choices stay as written. Card text is a paired empty value; icon and art keys are null. A child whose source record becomes unpublished or disappears is unpublished, never deleted. A later source republish does not override that child's draft state. Republish it explicitly through the directory publisher after review. Compare stays independent of the source records.

`sync-pages.mjs --apply` also updates `page-slugs.mjs`. Commit that runtime cache map with the rebuilt routes and rerun the sync after adding or retiring records. It includes retired registry paths so their old cached HTML gets removed. Dataset changes also queue exact child page events from the registry, covering new child identities before the map is regenerated. The cache target map refreshes all these paths for dataset or parent events, plus the dataset Next tag and each path's Cloudflare tag and warm path.

The frontend must enumerate published exact registry children for static export, including published noindex rows. Dataset slugs alone do not describe manually retired registry pages. The coordinator owns the routes, export params, and browser checks.

## Publication

`sync-pages.mjs` is a development bootstrap and cache-map generator. It must never publish production pages. After adding or retiring listings in development, run it with `--apply`, review its registry choices, and commit the generated `page-slugs.mjs`. Production publication and retirement use the directory publisher. A retired path stays in the cache map so old cached HTML can be removed.

Freeze reviewed development metadata into a manifest, then use the normal publisher:

```sh
mkdir -p tmp/page-publishing/launch-directories
node scripts/launch-directories/prepare-publication-manifest.mjs \
  --out tmp/page-publishing/launch-directories/manifest.json \
  --parent-out tmp/page-publishing/launch-directories/manifest-parent.json
npm run stack127:directories:publish -- prepare --environment development \
  --manifest tmp/page-publishing/launch-directories/manifest.json \
  --out tmp/page-publishing/launch-directories/plan-dev.json
npm run stack127:directories:publish -- preview --environment development \
  --plan tmp/page-publishing/launch-directories/plan-dev.json
```

The child manifest has 155 listing pages plus compare, all published and noindex. It freezes titles, search fields, paired empty cards, and null card keys from development. Each listing checks its published source record; compare checks that published records exist. The optional separate parent manifest includes the meaningful content date touch for this rebuild. Prepare it after any child batch has finished, because child publication moves the parent's date.

Keep manifests and plans under ignored `tmp/page-publishing/` until release verification finishes. Never use `sync-pages` against production. The [production runbook](../../content_docs/launch-directories/production-runbook.md) gives the prepare, preview, dispatch, import, and installation order.

## Reviewed record corrections

`content_docs/launch-directories/record-corrections-2026-10.json` freezes the seven reviewed price/evidence changes and their old values. `prepare-record-corrections.mjs --out <new-file>` reads production in a read-only transaction and makes an input file for `scripts/stack127/database/update-launch-directories.mjs`.

Facts imports move row timestamps. Prepare a fresh correction file after importing facts. The helper refreshes only row versions: it refuses if any reviewed old price/evidence field changed, unless every correction is already present. The updater then checks each exact production timestamp again in its write transaction. Neither helper publishes pages.

## Monthly metrics

`refresh-metrics.mjs` refreshes only DR, Tranco popularity, and their checked dates for published records. It never changes the overall editorial `checked_on`, price, sources, or evidence. Successful checks advance the metric date. Identical same-day checks make no writes. Failed lookups keep both the previous value and its date. Concurrent row edits are skipped and reported.

- [Ahrefs free DR endpoint](https://docs.ahrefs.com/en/api/reference/public/get-domain-rating-free): authenticated GET, explicit `version=dr3`, sequential requests at least three seconds apart. Floats round to the existing whole-number DR column. HTTP 429 backs off for 30 then 60 seconds, honors longer `Retry-After` values, and stops DR lookups after two retries or a requested wait over 60 seconds. HTTP 401/403 stops DR lookups immediately. Tranco can still finish. Exit 2 reports a partial run; successes can be saved without clearing failed metrics.
- [Tranco](https://tranco-list.eu/): resolve the latest standard list ID, then download its immutable top-million CSV. Validate all one million ordered rows, including Tranco's reserved wildcard placeholders, before treating an absent registrable domain as `below_1m`. Buckets match the reviewed facts importer. No extra ZIP dependency is needed.
- Fetches hold no database transaction or connection. A single short write statement updates changed metrics, guarded by exact row versions. Existing triggers move public dates, queue parent and child refreshes, and change source fingerprints. The Node cache worker starts the usual Cloudflare rebuild; the job never purges or deploys itself.
- The [Ahrefs license](https://ahrefs.com/legal/domain-rating-license) requires the visible linked credit "Domain Rating by Ahrefs" beside displayed DR data. The pages use `ahrefs-credit.tsx` for it; keep it beside any new place that shows DR.

```sh
node --experimental-strip-types scripts/launch-directories/refresh-metrics.mjs --environment development --limit 3
# OVH-only connection file; still a dry run without --apply:
node --experimental-strip-types scripts/launch-directories/refresh-metrics.mjs \
  --environment production --confirm stack127-production \
  --env-file /srv/stack127-data/launch-directory-metrics.env --limit 3
```

The OVH env file contains only `DATABASE_URL` and `AHREFS_API_KEY`. Homelab owns both source values. `ovh/prepare-env.mjs` runs only in its source checkout and privately creates `.env.launch-directory-metrics` with a loopback app URL. It never prints values. Node parses this file directly; the wrapper does not evaluate it as shell code.

`ovh/run-job.sh launch-directory-metrics` uses a host lock and writes the dashboard's start/end format to `/srv/stack127-data/logs/launch-directory-metrics.log`. Exit 76 means another copy is running. The existing OVH wildcard log rotation covers this file. Append `ovh/crontab.txt` to the existing `ubuntu` schedule: day 2, 06:00 UTC. Nothing has been installed or enabled by this implementation task.
