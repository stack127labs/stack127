// Processes the cache revalidation queue as a plain Node job. It is the port of
// the Supabase `cache-worker` Edge Function for the self-hosted database on the
// OVH server, where pg_cron and pg_net no longer wake a function.
//
// Run it with the OVH systemd timer every 30 seconds, only after the switch:
//   scripts/stack127/selfhost-db/switch/010_retire_supabase_cache_worker_wake.sql
// has removed the pg_cron schedule and the pg_net wake trigger. The worker
// refuses to run while the Edge Function wake URL, its trigger, or its cron job
// is still present, so two processors never work the same queue. A 150-second
// database lease is the overlap guard between runs, and it is shared with the
// GitHub backup processor. The OVH wrapper also takes a host flock.
//
// Environment: DATABASE_URL, STACK127_SITE_URL,
// CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID (legacy hosting),
// STACK127_FRONTEND_HOSTING=cloudflare with GITHUB_FRONTEND_TOKEN and optional
// GITHUB_FRONTEND_REPO (static hosting), GITHUB_ALERT_TOKEN (delay alerts),
// CACHE_WORKER_DRY_RUN=1 (report only).
import { createHmac, randomUUID } from "node:crypto";
import { targetsForEvents } from "./targets.mjs";
import { refreshTargets, cacheBodyDigest, selectRevalidationBatch } from "./refresh.mjs";
import { launchDirectoryRevisionMatches } from "../../../lib/launch-directories-data.ts";
import { dispatchFrontendRefresh, frontendLatencyMinutes } from "../frontend/content-queue.mjs";

export const runBudgetMs = 90_000;
export const leaseSeconds = 150;
// Leave time for the server to cancel a 15-second SQL statement before expiry.
export const hardLimitMs = 120_000;
export const switchScript = "scripts/stack127/selfhost-db/switch/010_retire_supabase_cache_worker_wake.sql";

export const revalidationToken = key => createHmac("sha256", key).update("stack127-cache-revalidation-v1").digest("hex");

export function workerSettings(env = process.env) {
  const cloudflareFrontend = env.STACK127_FRONTEND_HOSTING === "cloudflare";
  return {
    dryRun: env.CACHE_WORKER_DRY_RUN === "1",
    siteUrl: (env.STACK127_SITE_URL || "https://stack127.com").replace(/\/$/, ""),
    cloudflareFrontend,
    hosting: cloudflareFrontend ? "cloudflare" : "legacy",
    alertAfterMinutes: cloudflareFrontend ? frontendLatencyMinutes : 5,
    alertRepo: "stack127labs/stack127",
    alertToken: env.GITHUB_ALERT_TOKEN || "",
    cloudflareZone: env.CLOUDFLARE_ZONE_ID || "",
    cloudflareToken: env.CLOUDFLARE_API_TOKEN || "",
    frontendRepo: env.GITHUB_FRONTEND_REPO || "stack127labs/stack127",
    frontendToken: env.GITHUB_FRONTEND_TOKEN || "",
  };
}

// The Edge Function runs wherever the database still wakes it. Every signal of
// that wiring must be gone before this worker touches the queue.
export async function edgeFunctionWiring(client) {
  const { rows } = await client.query(`select wake.function_url is not null as wake_url,
      exists (select 1 from pg_trigger trigger
        where trigger.tgname = 'stack127_wake_cache_worker' and not trigger.tgisinternal
          and trigger.tgrelid = 'public.stack127_revalidation_events'::regclass) as wake_trigger,
      exists (select 1 from pg_extension where extname = 'pg_cron') as has_cron
    from public.stack127_cache_worker_wake wake where wake.id`);
  if (!rows[0]) throw new Error("The cache worker wake row is missing.");
  const wiring = { wakeUrl: rows[0].wake_url, wakeTrigger: rows[0].wake_trigger, cronJob: false };
  if (rows[0].has_cron) {
    const jobs = await client.query("select count(*)::int as count from cron.job where jobname = 'stack127-cache-worker'");
    wiring.cronJob = jobs.rows[0].count > 0;
  }
  return wiring;
}

export function edgeFunctionRetired(wiring) {
  return !wiring.wakeUrl && !wiring.wakeTrigger && !wiring.cronJob;
}

const retryDelay = "case event.attempts when 0 then interval '15 seconds' when 1 then interval '1 minute' else interval '5 minutes' end";
// Timestamps stay text until Postgres reads them. The driver would round them
// to milliseconds, and the stored values have microseconds.
const processedRows = `(select id, created_at::timestamptz as created_at
  from unnest($1::bigint[], $2::text[]) as input(id, created_at)) done`;
const eventColumns = events => [events.map(event => event.id), events.map(event => event.created_at)];

export async function runCacheWorker(client, {
  env = process.env, fetchImplementation = fetch, now = Date.now, log = console,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
} = {}) {
  const settings = workerSettings(env);
  const { dryRun, siteUrl, cloudflareFrontend } = settings;
  let deadline = Infinity;

  const timeout = () => {
    const remaining = deadline - now();
    if (remaining <= 0) throw new Error("Cache worker exceeded its run budget.");
    return AbortSignal.timeout(Math.min(20_000, remaining));
  };
  // Preserve the dispatch helper's timeout while applying this run's deadline.
  const budgetFetch = (url, init = {}) => fetchImplementation(url, {
    ...init, signal: init.signal ? AbortSignal.any([init.signal, timeout()]) : timeout(),
  });
  async function request(url, init = {}) {
    const response = await budgetFetch(url, init);
    if (!response.ok) throw new Error(`${new URL(url).pathname} returned HTTP ${response.status}`);
    return response;
  }

  async function signingKey() {
    const { rows } = await client.query("select signing_key from public.stack127_cache_credentials where id = true");
    if (!rows[0]?.signing_key) throw new Error("Cache signing key is missing from the database.");
    return rows[0].signing_key;
  }

  // Legacy refresh settles for 10 seconds with a 60-second maximum. A frontend
  // build settles for a minute with a five-minute maximum to coalesce imports.
  const ready = `next_attempt_at <= now()
    and (created_at <= now() - $1::int * interval '1 second' or first_queued_at <= now() - $2::int * interval '1 second')`;
  const settle = cloudflareFrontend ? [60, 300] : [10, 60];

  async function readyEvents() {
    // Related directory and page updates share one refresh. Keep app batches
    // separate because either batch can use most of the worker's time limit.
    const others = await client.query(`select id::text, entity_type, slug, created_at::text as created_at
      from public.stack127_revalidation_events
      where entity_type <> 'self_host_app' and ${ready}
      order by first_queued_at, id limit 80`, settle);
    if (others.rows.length) return selectRevalidationBatch(others.rows);
    // Large app imports still collapse into one catalog refresh.
    const apps = await client.query(`select id::text, entity_type, slug, created_at::text as created_at
      from public.stack127_revalidation_events
      where entity_type = 'self_host_app' and ${ready}
      order by first_queued_at, id limit 2000`, settle);
    return apps.rows;
  }

  async function secondsUntilNextReady() {
    const { rows } = await client.query(`select extract(epoch from min(greatest(
        next_attempt_at, least(created_at + interval '10 seconds', first_queued_at + interval '60 seconds')
      )) - now())::float as seconds
      from public.stack127_revalidation_events`);
    return rows[0]?.seconds ?? null;
  }

  async function targetsFor(events) {
    const apps = events.filter(event => event.entity_type === "self_host_app");
    const targetEvents = apps.length > 20
      ? [...events.filter(event => event.entity_type !== "self_host_app"), { entity_type: "self_host_catalog", slug: "all" }]
      : events;
    // Catalog sidebars appear on every catalog page. A catalog page event also
    // changes tool sidebars, so tool pages are refreshed when a catalog changes.
    let catalogSlugs = [];
    let toolSlugs = [];
    if (targetEvents.some(event => event.entity_type === "page")) {
      const { rows: catalogs } = await client.query(`select page.slug, page.is_published, catalog.page_id is not null as has_content
        from public.stack127_pages page
        left join public.stack127_catalog_pages catalog on catalog.page_id = page.id
        where page.page_family = 'catalog'`);
      catalogSlugs = catalogs.filter(row => row.is_published && row.has_content).map(row => row.slug);
      const catalogNames = new Set(catalogs.map(row => row.slug));
      if (targetEvents.some(event => event.entity_type === "page" && catalogNames.has(event.slug))) {
        const { rows: tools } = await client.query("select slug from public.stack127_pages where page_family = 'tool' and is_published");
        toolSlugs = tools.map(row => row.slug);
      }
    }
    return targetsForEvents(targetEvents, catalogSlugs, toolSlugs);
  }

  async function fingerprints(events) {
    const { rows } = await client.query("select * from public.stack127_cache_source_revisions($1::text[], $2::text[])",
      [[...new Set(events.map(event => event.entity_type))], events.map(event => event.slug)]);
    const source = new Map(rows.map(row => [`${row.entity_type}:${row.slug}`, row.fingerprint]));
    return events.map(event => ({ ...event, fingerprint: source.get(`${event.entity_type}:${event.slug}`) ?? "deleted" }));
  }

  async function scheduleRetry(events, error) {
    await client.query(`update public.stack127_revalidation_events event set
        attempts = event.attempts + 1, last_error = $3, next_attempt_at = now() + ${retryDelay}
      from ${processedRows}
      where event.id = done.id and event.created_at = done.created_at`, [...eventColumns(events), String(error).slice(0, 500)]);
  }

  async function invalidateNext(targets, token) {
    const paths = targets.paths.filter(path => !path.endsWith(".xml"));
    for (let index = 0; index < Math.max(paths.length, 1); index += 200) {
      await request(`${siteUrl}/api/cache/revalidate`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ paths: paths.slice(index, index + 200), tags: index === 0 ? targets.nextTags : [] }),
      });
    }
  }

  async function purgeCloudflare(tags) {
    if (!settings.cloudflareZone || !settings.cloudflareToken) throw new Error("Cloudflare credentials are missing.");
    for (let index = 0; index < tags.length; index += 100) {
      const response = await request(`https://api.cloudflare.com/client/v4/zones/${settings.cloudflareZone}/purge_cache`, {
        method: "POST", headers: { Authorization: `Bearer ${settings.cloudflareToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tags: tags.slice(index, index + 100) }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(`Cloudflare rejected a tag purge: ${JSON.stringify(result.errors ?? [])}`);
    }
  }

  async function processBatch(events, key) {
    const targets = await targetsFor(events);
    const versions = await fingerprints(events);
    const token = revalidationToken(key);
    try {
      await refreshTargets(targets, {
        invalidate: () => invalidateNext(targets, token),
        rebuild: async paths => {
          const response = await request(`${siteUrl}/api/cache/refresh`, {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ paths }),
          });
          const result = await response.json();
          if (!Array.isArray(result.verified) || result.verified.length !== paths.length) throw new Error("Origin did not verify every path");
          return result.verified;
        },
        purge: purgeCloudflare,
        warm: async proofs => {
          await Promise.all(proofs.map(async proof => {
            const response = await budgetFetch(`${siteUrl}${proof.requestPath ?? proof.path}`);
            const body = await response.text();
            if (response.status !== proof.status) throw new Error(`Public warm failed for ${proof.path}: HTTP ${response.status}`);
            if (proof.digest && await cacheBodyDigest(body) !== proof.digest) throw new Error(`Public API is stale: ${proof.path}`);
            if (proof.sourceRevision && !launchDirectoryRevisionMatches(body, proof.sourceRevision)) throw new Error(`Public launch directory data is stale: ${proof.path}`);
            if (proof.revision && !body.includes(`name="stack127-content-revision" content="${proof.revision}"`)) throw new Error(`Public content is stale: ${proof.path}`);
          }));
        },
      });
    } catch (error) {
      await scheduleRetry(events, error);
      throw error;
    }
    // Both acknowledgement and fingerprint belong to the same processed version.
    await client.query("begin");
    try {
      const removed = await client.query(`delete from public.stack127_revalidation_events event
        using ${processedRows}
        where event.id = done.id and event.created_at = done.created_at
        returning entity_type, slug`, eventColumns(events));
      const acknowledged = new Set(removed.rows.map(row => `${row.entity_type}:${row.slug}`));
      const done = versions.filter(version => acknowledged.has(`${version.entity_type}:${version.slug}`));
      if (done.length) {
        await client.query(`insert into public.stack127_cache_processed (entity_type, slug, fingerprint)
          select * from unnest($1::text[], $2::text[], $3::text[])
          on conflict (entity_type, slug) do update set fingerprint = excluded.fingerprint, processed_at = now()`,
        [done.map(event => event.entity_type), done.map(event => event.slug), done.map(event => event.fingerprint)]);
      }
      await client.query("commit");
      return removed.rowCount ?? removed.rows.length;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }

  // Every 15 minutes, compare source fingerprints with acknowledged revisions
  // to recover missed changes and deletions.
  async function reconcile() {
    const { rows } = await client.query("select last_reconcile_at from public.stack127_cache_observation where id");
    const last = rows[0]?.last_reconcile_at;
    if (last && now() - new Date(last).getTime() < 900_000) return;
    const recovered = await client.query(`with sources as materialized (select * from public.stack127_cache_source_revisions()),
      changes as (
        select coalesce(source.entity_type, done.entity_type) as entity_type,
          coalesce(source.slug, done.slug) as slug,
          case when source.slug is null then 'deletion_reconcile' else 'revision_reconcile' end as reason
        from sources source full join public.stack127_cache_processed done using (entity_type, slug)
        where coalesce(source.fingerprint, 'deleted') is distinct from done.fingerprint
      )
      select public.stack127_enqueue_revalidation(changes.entity_type, changes.slug, changes.reason)
      from changes
      where not exists (select 1 from public.stack127_revalidation_events event
        where event.entity_type = changes.entity_type and event.slug = changes.slug)`);
    const history = await client.query("select 1 from public.stack127_cache_processed limit 1");
    if (history.rows.length && recovered.rows.length) {
      await client.query(`update public.stack127_cache_observation set healthy_since = null, last_failure_at = now(),
        last_error = 'The revision check recovered an update missing from the queue.' where id`);
    }
    await client.query("update public.stack127_cache_observation set last_reconcile_at = now() where id");
  }

  async function observe(lastError) {
    if (cloudflareFrontend) {
      // A dispatch is not content verification. Clear the legacy health clock so
      // its two-minute and seven-day gates cannot describe the static frontend.
      await client.query(`update public.stack127_cache_observation set
        healthy_since = null, last_check_at = now(), last_error = $1,
        last_failure_at = case when $1::text is not null or exists (
          select 1 from public.stack127_revalidation_events
          where first_queued_at <= now() - $2::int * interval '1 minute'
        ) then now() else last_failure_at end where id`, [lastError, frontendLatencyMinutes]);
      return;
    }
    // A late update, an error, or a gap in checks resets the seven-day clock.
    await client.query(`update public.stack127_cache_observation set
      healthy_since = case when $1::text is not null or
        exists (select 1 from public.stack127_revalidation_events where first_queued_at < now() - interval '2 minutes')
        then null
        when last_check_at is null or last_check_at < now() - interval '2 minutes' then now()
        else case when last_failure_at > healthy_since then now() else coalesce(healthy_since, now()) end end,
      last_failure_at = case when $1::text is not null or
        exists (select 1 from public.stack127_revalidation_events where first_queued_at < now() - interval '2 minutes')
        then now() else last_failure_at end,
      last_error = $1, last_check_at = now()
      where id`, [lastError]);
  }

  const githubHeaders = { Authorization: `Bearer ${settings.alertToken}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" };
  async function github(path, body, method = "POST") {
    if (!settings.alertToken) {
      log.warn(`GitHub alert skipped (no token): ${path}`);
      return null;
    }
    const response = await request(`https://api.github.com/repos/${settings.alertRepo}${path}`, { method, headers: githubHeaders, body: JSON.stringify(body) });
    return await response.json();
  }

  // Opens one GitHub issue when changes wait too long, and closes it on recovery.
  async function checkQueueAge(lastError) {
    const { rows: [queue] } = await client.query(`select count(*)::int as pending,
        floor(extract(epoch from now() - min(first_queued_at)) / 60)::int as minutes
      from public.stack127_revalidation_events`);
    const { rows: [state] } = await client.query("select alert_issue_number from public.stack127_cache_worker_state where id = true");
    const stale = queue.pending > 0 && queue.minutes >= settings.alertAfterMinutes;
    if (stale && !state.alert_issue_number) {
      const issue = await github("/issues", {
        title: "Cache updates are delayed",
        body: [
          `${queue.pending} site changes have been waiting for ${queue.minutes} minutes.`,
          lastError ? `Last error: \`${lastError}\`` : "",
          "Check `public.stack127_revalidation_events` and `journalctl -u stack127-cache-worker.service` on OVH.",
          "This issue closes itself when the queue catches up.",
        ].filter(Boolean).join("\n\n"),
      });
      if (issue?.number) await client.query("update public.stack127_cache_worker_state set alert_issue_number = $1 where id = true", [issue.number]);
    } else if (!stale && state.alert_issue_number && settings.alertToken) {
      await github(`/issues/${state.alert_issue_number}/comments`, { body: "The cache queue has caught up." });
      await github(`/issues/${state.alert_issue_number}`, { state: "closed" }, "PATCH");
      await client.query("update public.stack127_cache_worker_state set alert_issue_number = null where id = true");
    }
  }

  // A preview must not take a lease, change retry state, reconcile, or alert.
  if (dryRun) {
    const events = await readyEvents();
    const wiring = await edgeFunctionWiring(client);
    const report = { dryRun: true, hosting: settings.hosting, events: events.length, edgeFunctionRetired: edgeFunctionRetired(wiring), wiring };
    log.log(JSON.stringify(report));
    return { ...report, processed: 0, error: null, leased: false };
  }

  const wiring = await edgeFunctionWiring(client);
  if (!edgeFunctionRetired(wiring)) {
    throw new Error(`The Supabase cache-worker is still wired to this database (${JSON.stringify(wiring)}). Run ${switchScript} first.`);
  }

  const leaseId = randomUUID();
  const lease = await client.query(`update public.stack127_cache_worker_state
    set lease_id = $1, lease_until = now() + $2::int * interval '1 second', last_run_at = now()
    where id = true and (lease_until is null or lease_until < now())
    returning 1`, [leaseId, leaseSeconds]);
  if (!lease.rows.length) return { processed: 0, error: null, leased: false, dryRun, hosting: settings.hosting }; // another run is working

  const started = now();
  let processed = 0;
  let lastError = null;
  let keepDispatchLease = false;
  try {
    deadline = started + runBudgetMs;
    const key = await signingKey();
    await reconcile();
    if (cloudflareFrontend) {
      const events = await readyEvents();
      if (events.length) {
        try {
          const result = await dispatchFrontendRefresh({ repo: settings.frontendRepo, token: settings.frontendToken, fetchImplementation: budgetFetch });
          keepDispatchLease = result.dispatched || result.active === true;
          log.log(JSON.stringify({ hosting: "cloudflare", ...result, acknowledged: 0 }));
        } catch (error) {
          // A failed dispatch never removes work or penalizes a newer edit.
          lastError = String(error).slice(0, 500);
          await scheduleRetry(events, error);
          await checkQueueAge(lastError);
          throw error;
        }
      }
      // GitHub owns API refresh, deployment verification, and acknowledgement.
      await checkQueueAge(null);
    } else {
      while (now() - started < runBudgetMs) {
        const events = await readyEvents();
        if (events.length) {
          try {
            const removed = await processBatch(events, key);
            // Stop when every captured event was superseded while processing.
            if (!removed) break;
            processed += removed;
          } catch (error) {
            lastError = String(error).slice(0, 500);
            log.error(`Cache refresh failed: ${lastError}`);
            break;
          }
          // A second catalog refresh can exceed the remaining run budget. The
          // next cron run picks up updates left in the queue.
          break;
        }
        // Wait for changes that are still settling, if they are close.
        const wait = await secondsUntilNextReady();
        if (wait === null || wait > 15 || now() - started + wait * 1000 > runBudgetMs) break;
        await sleep(Math.max(wait, 0.5) * 1000);
      }
      await checkQueueAge(lastError);
    }
  } catch (error) {
    lastError = String(error).slice(0, 500);
    log.error(`Cache worker failed: ${lastError}`);
  } finally {
    try {
      await observe(lastError);
    } finally {
      deadline = Infinity;
      await client.query(`update public.stack127_cache_worker_state set
          lease_id = null,
          lease_until = case when $2::boolean then lease_until else null end,
          last_error = $3,
          last_success_at = case when $3::text is null and not $4::boolean then now() else last_success_at end
        where id = true and lease_id = $1`, [leaseId, keepDispatchLease, lastError, cloudflareFrontend]);
    }
  }
  if (processed || lastError) log.log(JSON.stringify({ processed, hosting: settings.hosting, error: lastError }));
  return { processed, error: lastError, leased: true, dryRun, hosting: settings.hosting };
}

export async function cacheWorkerMain(env = process.env) {
  const settings = workerSettings(env);
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");
  if (!settings.dryRun) {
    if (settings.cloudflareFrontend && !settings.frontendToken) throw new Error("GITHUB_FRONTEND_TOKEN is required in Cloudflare hosting mode.");
    if (!settings.cloudflareFrontend && (!settings.cloudflareZone || !settings.cloudflareToken)) throw new Error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required in legacy hosting mode.");
  }
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    connectionString: databaseUrl, connectionTimeoutMillis: 15_000, statement_timeout: 15_000,
    application_name: "stack127-cache-worker",
  });
  // A hung network call must not outlive the lease and overlap the next run.
  const watchdog = setTimeout(() => {
    console.error("Cache worker exceeded its time limit and stopped.");
    process.exit(2);
  }, hardLimitMs);
  watchdog.unref();
  try {
    await client.connect();
    const result = await runCacheWorker(client, { env });
    if (result.error) process.exitCode = 1;
  } finally {
    try { await client.end(); } finally { clearTimeout(watchdog); }
  }
}

if (typeof process !== "undefined" && process.argv[1]) {
  const { pathToFileURL } = await import("node:url");
  if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    cacheWorkerMain().catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
