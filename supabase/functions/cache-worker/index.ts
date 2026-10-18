// Refreshes Next.js and Cloudflare caches after database changes. The database
// wakes this function when a change is queued and every 30 seconds after that.
import postgres from "npm:postgres@3.4.7";
import { targetsForEvents } from "../../../scripts/stack127/cache/targets.mjs";
import { refreshTargets, cacheBodyDigest, selectRevalidationBatch } from "../../../scripts/stack127/cache/refresh.mjs";
import { launchDirectoryRevisionMatches } from "../../../lib/launch-directories-data.ts";
import { dispatchFrontendRefresh, frontendLatencyMinutes } from "../../../scripts/stack127/frontend/content-queue.mjs";

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

type QueueEvent = { id: string; entity_type: string; slug: string; created_at: string };
type Targets = ReturnType<typeof targetsForEvents>;

const env = (name: string) => Deno.env.get(name) ?? "";
const dryRun = env("CACHE_WORKER_DRY_RUN") === "1";
const siteUrl = (env("STACK127_SITE_URL") || "https://stack127.com").replace(/\/$/, "");
const alertRepo = env("GITHUB_ALERT_REPO") || "stack127labs/stack127";
const cloudflareFrontend = env("STACK127_FRONTEND_HOSTING") === "cloudflare";

const runBudgetMs = 90_000;
let deadline = Infinity;
const leaseSeconds = 150;
const alertAfterMinutes = cloudflareFrontend ? frontendLatencyMinutes : 5;

const sql = postgres(env("SUPABASE_DB_URL"), { max: 1, prepare: false, idle_timeout: 20, connection: { statement_timeout: 15000 } });

async function hmac(key: string, message: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}

async function signingKey() {
  const rows = await sql`select signing_key from public.stack127_cache_credentials where id = true`;
  const key = rows[0]?.signing_key as string | undefined;
  if (!key) throw new Error("Cache signing key is missing from the database.");
  return key;
}

async function request(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(Math.max(1, Math.min(20_000, deadline - Date.now()))) });
  if (!response.ok) throw new Error(`${new URL(url).pathname} returned HTTP ${response.status}`);
  return response;
}

async function invalidateNext(targets: Targets, key: string) {
  const token = await hmac(key, "stack127-cache-revalidation-v1");
  const paths = targets.paths.filter((path) => !path.endsWith(".xml"));
  for (let index = 0; index < Math.max(paths.length, 1); index += 200) {
    await request(`${siteUrl}/api/cache/revalidate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ paths: paths.slice(index, index + 200), tags: index === 0 ? targets.nextTags : [] }),
    });
  }
}

async function purgeCloudflare(tags: string[]) {
  const zone = env("CLOUDFLARE_ZONE_ID");
  const token = env("CLOUDFLARE_API_TOKEN");
  if (!zone || !token) throw new Error("Cloudflare credentials are missing.");
  for (let index = 0; index < tags.length; index += 100) {
    const response = await request(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tags: tags.slice(index, index + 100) }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(`Cloudflare rejected a tag purge: ${JSON.stringify(result.errors ?? [])}`);
  }
}

// Legacy refresh settles for 10 seconds with a 60-second maximum. A frontend
// build settles for a minute with a five-minute maximum to coalesce imports.
const ready = () => sql`
  next_attempt_at <= now()
  and (created_at <= now() - ${cloudflareFrontend ? 60 : 10} * interval '1 second'
    or first_queued_at <= now() - ${cloudflareFrontend ? 300 : 60} * interval '1 second')
`;

async function readyEvents(): Promise<QueueEvent[]> {
  // Related directory and page updates share one refresh. Keep app batches
  // separate because either batch can use most of the worker's time limit.
  const others = await sql<QueueEvent[]>`
    select id::text, entity_type, slug, created_at::text as created_at
    from public.stack127_revalidation_events
    where entity_type <> 'self_host_app' and ${ready()}
    order by first_queued_at, id
    limit 80
  `;
  if (others.length) return selectRevalidationBatch(others);
  // Large app imports still collapse into one catalog refresh.
  return await sql<QueueEvent[]>`
    select id::text, entity_type, slug, created_at::text as created_at
    from public.stack127_revalidation_events
    where entity_type = 'self_host_app' and ${ready()}
    order by first_queued_at, id
    limit 2000
  `;
}

async function secondsUntilNextReady(): Promise<number | null> {
  const rows = await sql`
    select extract(epoch from min(greatest(
      next_attempt_at,
      least(created_at + interval '10 seconds', first_queued_at + interval '60 seconds')
    )) - now())::float as seconds
    from public.stack127_revalidation_events
  `;
  return rows[0]?.seconds ?? null;
}

async function targetsFor(events: QueueEvent[]) {
  const apps = events.filter((event) => event.entity_type === "self_host_app");
  const targetEvents = apps.length > 20
    ? [...events.filter((event) => event.entity_type !== "self_host_app"), { entity_type: "self_host_catalog", slug: "all" }]
    : events;

  // Catalog sidebars appear on every catalog page. A catalog page event also
  // changes tool sidebars, so tool pages are refreshed when a catalog changes.
  let catalogSlugs: string[] = [];
  let toolSlugs: string[] = [];
  if (targetEvents.some((event) => event.entity_type === "page")) {
    const catalogs = await sql`
      select page.slug, page.is_published, catalog.page_id is not null as has_content
      from public.stack127_pages page
      left join public.stack127_catalog_pages catalog on catalog.page_id = page.id
      where page.page_family = 'catalog'
    `;
    catalogSlugs = catalogs.filter((row) => row.is_published && row.has_content).map((row) => row.slug);
    const catalogNames = new Set(catalogs.map((row) => row.slug));
    if (targetEvents.some((event) => event.entity_type === "page" && catalogNames.has(event.slug))) {
      const tools = await sql`select slug from public.stack127_pages where page_family = 'tool' and is_published`;
      toolSlugs = tools.map((row) => row.slug);
    }
  }
  return targetsForEvents(targetEvents, catalogSlugs, toolSlugs);
}

// Timestamps stay text until Postgres reads them. The driver would round them
// to milliseconds, and the stored values have microseconds.
const processedRows = (events: QueueEvent[], query = sql) => query`
  (select id, created_at::timestamptz as created_at
   from unnest(${events.map((event) => event.id)}::bigint[], ${events.map((event) => event.created_at)}::text[])
     as input(id, created_at)) done
`;

async function fingerprints(events: QueueEvent[]) {
  const revisions = await sql`select * from public.stack127_cache_source_revisions(
    ${[...new Set(events.map(event => event.entity_type))]}::text[], ${events.map(event => event.slug)}::text[])`;
  const source = new Map(revisions.map(row => [`${row.entity_type}:${row.slug}`, row.fingerprint]));
  return events.map(event => ({ ...event, fingerprint: source.get(`${event.entity_type}:${event.slug}`) ?? "deleted" }));
}

async function processBatch(events: QueueEvent[], key: string) {
  const targets = await targetsFor(events);
  const versions = await fingerprints(events);
  const token = await hmac(key, "stack127-cache-revalidation-v1");
  try {
    if (dryRun) {
      console.log(JSON.stringify({ dryRun: true, events: events.length, paths: targets.paths.length }));
      return 0;
    }
    await refreshTargets(targets, {
      invalidate: () => invalidateNext(targets, key),
      rebuild: async (paths: string[]) => {
        const response = await request(`${siteUrl}/api/cache/refresh`, {
          method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ paths }),
        });
        const result = await response.json();
        if (!Array.isArray(result.verified) || result.verified.length !== paths.length) throw new Error("Origin did not verify every path");
        return result.verified;
      },
      purge: purgeCloudflare,
      warm: async (proofs: Array<{ path: string; status: number; revision: string | null; digest: string | null; sourceRevision?: string | null; requestPath?: string }>) => {
        await Promise.all(proofs.map(async proof => {
          const response = await fetch(`${siteUrl}${proof.requestPath ?? proof.path}`, {
            signal: AbortSignal.timeout(Math.max(1, Math.min(20_000, deadline - Date.now()))),
          });
          const body = await response.text();
          if (response.status !== proof.status) throw new Error(`Public warm failed for ${proof.path}: HTTP ${response.status}`);
          if (proof.digest && await cacheBodyDigest(body) !== proof.digest) throw new Error(`Public API is stale: ${proof.path}`);
          if (proof.sourceRevision && !launchDirectoryRevisionMatches(body, proof.sourceRevision)) throw new Error(`Public launch directory data is stale: ${proof.path}`);
          if (proof.revision && !body.includes(`name="stack127-content-revision" content="${proof.revision}"`)) throw new Error(`Public content is stale: ${proof.path}`);
        }));
      },
    });
  } catch (error) {
    await sql`
      update public.stack127_revalidation_events event set
        attempts = event.attempts + 1,
        last_error = ${String(error).slice(0, 500)},
        next_attempt_at = now() + case event.attempts
          when 0 then interval '15 seconds' when 1 then interval '1 minute' else interval '5 minutes' end
      from ${processedRows(events)}
      where event.id = done.id and event.created_at = done.created_at
    `;
    throw error;
  }
  return await sql.begin(async tx => {
    // Both acknowledgement and fingerprint belong to the same processed version.
    const removed = await tx`
      delete from public.stack127_revalidation_events event
      using ${processedRows(events, tx)}
      where event.id = done.id and event.created_at = done.created_at
      returning entity_type, slug
    `;
    const acknowledged = new Set(removed.map(row => `${row.entity_type}:${row.slug}`));
    const done = versions.filter(version => acknowledged.has(`${version.entity_type}:${version.slug}`));
    if (done.length) await tx`insert into public.stack127_cache_processed (entity_type, slug, fingerprint)
      select * from unnest(${done.map(event => event.entity_type)}::text[], ${done.map(event => event.slug)}::text[], ${done.map(event => event.fingerprint)}::text[])
      on conflict (entity_type, slug) do update set fingerprint = excluded.fingerprint, processed_at = now()`;
    return removed.count;
  });
}

async function reconcile() {
  const [state] = await sql`select last_reconcile_at from public.stack127_cache_observation where id`;
  if (state.last_reconcile_at && Date.now() - new Date(state.last_reconcile_at).getTime() < 900_000) return;
  const recovered = await sql`
    with sources as materialized (select * from public.stack127_cache_source_revisions()),
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
        where event.entity_type = changes.entity_type and event.slug = changes.slug)
  `;
  const hadHistory = await sql`select 1 from public.stack127_cache_processed limit 1`;
  if (hadHistory.length && recovered.length) {
    await sql`update public.stack127_cache_observation set healthy_since = null, last_failure_at = now(),
      last_error = 'The revision check recovered an update missing from the queue.' where id`;
  }
  await sql`update public.stack127_cache_observation set last_reconcile_at = now() where id`;
}

async function observe(lastError: string | null) {
  if (cloudflareFrontend) {
    // A dispatch is not content verification. Clear the legacy health clock so
    // its two-minute and seven-day gates cannot describe the static frontend.
    await sql`update public.stack127_cache_observation set
      healthy_since = null, last_check_at = now(), last_error = ${lastError},
      last_failure_at = case when ${lastError}::text is not null or exists (
        select 1 from public.stack127_revalidation_events
        where first_queued_at <= now() - ${frontendLatencyMinutes} * interval '1 minute'
      ) then now() else last_failure_at end where id`;
    return;
  }
  // A late update, an error, or a gap in checks resets the seven-day clock.
  await sql`update public.stack127_cache_observation set
    healthy_since = case when ${lastError}::text is not null or
      exists (select 1 from public.stack127_revalidation_events where first_queued_at < now() - interval '2 minutes')
      then null
      when last_check_at is null or last_check_at < now() - interval '2 minutes' then now()
      else case when last_failure_at > healthy_since then now() else coalesce(healthy_since, now()) end end,
    last_failure_at = case when ${lastError}::text is not null or
      exists (select 1 from public.stack127_revalidation_events where first_queued_at < now() - interval '2 minutes')
      then now() else last_failure_at end,
    last_error = ${lastError}, last_check_at = now()
    where id`;
}

async function github(path: string, body: unknown) {
  const token = env("GITHUB_ALERT_TOKEN");
  if (dryRun || !token) {
    console.warn(`GitHub alert skipped (${dryRun ? "dry run" : "no token"}): ${path}`);
    return null;
  }
  const response = await request(`https://api.github.com/repos/${alertRepo}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await response.json();
}

// Opens one GitHub issue when changes wait too long, and closes it on recovery.
async function checkQueueAge(lastError: string | null) {
  const [queue] = await sql`
    select count(*)::int as pending, floor(extract(epoch from now() - min(first_queued_at)) / 60)::int as minutes
    from public.stack127_revalidation_events
  `;
  const [state] = await sql`select alert_issue_number from public.stack127_cache_worker_state where id = true`;
  const stale = queue.pending > 0 && queue.minutes >= alertAfterMinutes;

  if (stale && !state.alert_issue_number) {
    const issue = await github("/issues", {
      title: "Cache updates are delayed",
      body: [
        `${queue.pending} site changes have been waiting for ${queue.minutes} minutes.`,
        lastError ? `Last error: \`${lastError}\`` : "",
        "Check `public.stack127_revalidation_events` and the `cache-worker` Edge Function logs in Supabase.",
        "This issue closes itself when the queue catches up.",
      ].filter(Boolean).join("\n\n"),
    });
    if (issue?.number) {
      await sql`update public.stack127_cache_worker_state set alert_issue_number = ${issue.number} where id = true`;
    }
  } else if (!stale && state.alert_issue_number) {
    const number = state.alert_issue_number;
    if (!dryRun && env("GITHUB_ALERT_TOKEN")) {
      await github(`/issues/${number}/comments`, { body: "The cache queue has caught up." });
      await request(`https://api.github.com/repos/${alertRepo}/issues/${number}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${env("GITHUB_ALERT_TOKEN")}`, Accept: "application/vnd.github+json" },
        body: JSON.stringify({ state: "closed" }),
      });
    }
    await sql`update public.stack127_cache_worker_state set alert_issue_number = null where id = true`;
  }
}

async function run() {
  // A preview must not take a lease, change retry state, reconcile, or alert.
  if (dryRun) {
    const events = await readyEvents();
    console.log(JSON.stringify({ dryRun: true, hosting: cloudflareFrontend ? "cloudflare" : "legacy", events: events.length }));
    return;
  }
  const leaseId = crypto.randomUUID();
  const lease = await sql`
    update public.stack127_cache_worker_state
    set lease_id = ${leaseId}, lease_until = now() + ${leaseSeconds} * interval '1 second', last_run_at = now()
    where id = true and (lease_until is null or lease_until < now())
    returning 1
  `;
  if (!lease.length) return; // another run is working

  const started = Date.now();
  let processed = 0;
  let lastError: string | null = null;
  let keepDispatchLease = false;
  try {
    deadline = started + runBudgetMs;
    const key = await signingKey();
    if (!dryRun) await reconcile();
    if (cloudflareFrontend) {
      const events = await readyEvents();
      if (events.length) {
        try {
          const result = await dispatchFrontendRefresh({
            repo: env("GITHUB_FRONTEND_REPO") || "stack127labs/stack127",
            token: env("GITHUB_FRONTEND_TOKEN"),
          });
          keepDispatchLease = result.dispatched || result.active === true;
          console.log(JSON.stringify({ hosting: "cloudflare", ...result, acknowledged: 0 }));
        } catch (error) {
          // A failed dispatch never removes work or penalizes a newer edit.
          lastError = String(error).slice(0, 500);
          await sql`
            update public.stack127_revalidation_events event set
              attempts = event.attempts + 1, last_error = ${String(error).slice(0, 500)},
              next_attempt_at = now() + case event.attempts
                when 0 then interval '15 seconds' when 1 then interval '1 minute' else interval '5 minutes' end
            from ${processedRows(events)}
            where event.id = done.id and event.created_at = done.created_at
          `;
          await checkQueueAge(lastError);
          throw error;
        }
      }
      // GitHub owns API refresh, deployment verification, and acknowledgement.
      // Keep the existing alert path; dispatch does not open another alert.
      await checkQueueAge(null);
      return;
    }
    while (Date.now() - started < runBudgetMs) {
      const events = await readyEvents();
      if (events.length) {
        try {
          const removed = await processBatch(events, key);
          // Stop when every captured event was superseded while processing.
          if (!removed) break; // a newer edit remains queued, or this is a dry run
          processed += removed;
        } catch (error) {
          lastError = String(error).slice(0, 500);
          console.error(`Cache refresh failed: ${lastError}`);
          break;
        }
        // A second catalog refresh can exceed the remaining run budget. The
        // database wakes another run for updates left in the queue.
        break;
      }
      // Old warm-only rows come from the manual backup. They never acknowledge changes.
      // Wait for changes that are still settling, if they are close.
      const wait = await secondsUntilNextReady();
      if (wait === null || wait > 15 || Date.now() - started + wait * 1000 > runBudgetMs) break;
      await new Promise((resolve) => setTimeout(resolve, Math.max(wait, 0.5) * 1000));
    }
    await checkQueueAge(lastError);
  } catch (error) {
    lastError = String(error).slice(0, 500);
    console.error(`Cache worker failed: ${lastError}`);
  } finally {
    await observe(lastError);
    deadline = Infinity;
    await sql`
      update public.stack127_cache_worker_state set
        lease_id = null,
        lease_until = case when ${keepDispatchLease} then lease_until else null end,
        last_error = ${lastError},
        last_success_at = case when ${lastError}::text is null and not ${cloudflareFrontend} then now() else last_success_at end
      where id = true and lease_id = ${leaseId}
    `;
  }
  if (processed || lastError) {
    console.log(JSON.stringify({ processed, dryRun, error: lastError }));
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let key: string;
  try {
    key = await signingKey();
  } catch {
    return new Response("Worker unavailable", { status: 503 });
  }
  const expected = await hmac(key, "stack127-cache-worker-v1");
  const received = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!sameText(received, expected)) return new Response("Unauthorized", { status: 401 });

  // Answer the database at once and keep working in the background.
  EdgeRuntime.waitUntil(run());
  return new Response("Accepted", { status: 202 });
});
