// Refreshes Next.js and Cloudflare caches after database changes. The database
// wakes this function when a change is queued and every 30 seconds after that.
import postgres from "npm:postgres@3.4.7";
import { targetsForEvents } from "../../../scripts/stack127/cache/targets.mjs";

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

type QueueEvent = { id: string; entity_type: string; slug: string; created_at: string };
type Targets = ReturnType<typeof targetsForEvents>;

const env = (name: string) => Deno.env.get(name) ?? "";
const dryRun = env("CACHE_WORKER_DRY_RUN") === "1";
const siteUrl = (env("STACK127_SITE_URL") || "https://stack127.com").replace(/\/$/, "");
const alertRepo = env("GITHUB_ALERT_REPO") || "stack127labs/stack127";

const runBudgetMs = 100_000;
const leaseSeconds = 150;
const alertAfterMinutes = 5;

const sql = postgres(env("SUPABASE_DB_URL"), { max: 1, prepare: false, idle_timeout: 20 });

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
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
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

// A change is ready once it has been quiet for 10 seconds, so repeated changes
// during an import are grouped. No change waits more than 60 seconds.
const ready = () => sql`
  next_attempt_at <= now()
  and (created_at <= now() - interval '10 seconds' or first_queued_at <= now() - interval '60 seconds')
`;

async function readyEvents(): Promise<QueueEvent[]> {
  // Up to 2,000 app changes are taken at once so large imports collapse into
  // one catalog refresh. Other changes are taken 500 at a time, oldest first.
  const apps = await sql<QueueEvent[]>`
    select id::text, entity_type, slug, created_at::text as created_at
    from public.stack127_revalidation_events
    where entity_type = 'self_host_app' and ${ready()}
    order by first_queued_at, id
    limit 2000
  `;
  const others = await sql<QueueEvent[]>`
    select id::text, entity_type, slug, created_at::text as created_at
    from public.stack127_revalidation_events
    where entity_type <> 'self_host_app' and ${ready()}
    order by first_queued_at, id
    limit 500
  `;
  return [...others, ...apps];
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
  const targetEvents = apps.length > 100
    ? [...events.filter((event) => event.entity_type !== "self_host_app"), { entity_type: "self_host_catalog", slug: "all" }]
    : events;

  // Catalog sidebars appear on every catalog page. A catalog page event also
  // changes tool sidebars, so tool pages are refreshed when a catalog changes.
  let catalogSlugs: string[] = [];
  let toolSlugs: string[] = [];
  if (targetEvents.some((event) => event.entity_type === "page")) {
    const catalogs = await sql`
      select page.slug, page.is_published, catalog.page_id is not null as has_catalog_content
      from public.stack127_pages page
      left join public.stack127_tool_catalogs catalog on catalog.page_id = page.id
      where page.page_family = 'catalog'
    `;
    catalogSlugs = catalogs.filter((row) => row.is_published && row.has_catalog_content).map((row) => row.slug);
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

async function processBatch(events: QueueEvent[], key: string) {
  const targets = await targetsFor(events);
  try {
    if (dryRun) {
      console.log(JSON.stringify({ dryRun: true, events: events.length, paths: targets.paths.length, edgeTags: targets.edgeTags.length }));
    } else {
      await invalidateNext(targets, key);
      await purgeCloudflare(targets.edgeTags);
    }
  } catch (error) {
    // Retry after 15 seconds, then 1 minute, then every 5 minutes. A change
    // that arrived during this run is left alone so it is not delayed.
    await sql`
      update public.stack127_revalidation_events event set
        attempts = event.attempts + 1,
        last_error = ${String(error).slice(0, 500)},
        next_attempt_at = now() + case event.attempts
          when 0 then interval '15 seconds'
          when 1 then interval '1 minute'
          else interval '5 minutes'
        end
      from ${processedRows(events)}
      where event.id = done.id and event.created_at = done.created_at
    `;
    throw error;
  }

  // Only the processed version is removed. A change that arrived during this
  // run has a newer created_at and stays queued.
  return await sql.begin(async (tx) => {
    const removed = await tx`
      delete from public.stack127_revalidation_events event
      using ${processedRows(events, tx)}
      where event.id = done.id and event.created_at = done.created_at
    `;
    if (targets.warmPaths.length) {
      await tx`
        insert into public.stack127_cache_warm_events (path)
        select unnest(${targets.warmPaths}::text[])
        on conflict (path) do update set created_at = now(), attempts = 0
      `;
    }
    return removed.count;
  });
}

async function warmPages() {
  // Give up on a page after five failed loads. The next change queues it again.
  await sql`delete from public.stack127_cache_warm_events where attempts >= 5`;
  const pending = await sql`
    select path, created_at::text as created_at from public.stack127_cache_warm_events
    order by created_at limit 20
  `;
  for (let index = 0; index < pending.length; index += 4) {
    await Promise.all(pending.slice(index, index + 4).map(async ({ path, created_at }) => {
      try {
        if (!dryRun) {
          const response = await fetch(`${siteUrl}${path}`, { signal: AbortSignal.timeout(20_000) });
          if (!response.ok && response.status !== 404) throw new Error(`HTTP ${response.status}`);
        }
        await sql`delete from public.stack127_cache_warm_events where path = ${path} and created_at = ${created_at}::text::timestamptz`;
      } catch (error) {
        await sql`update public.stack127_cache_warm_events set attempts = attempts + 1 where path = ${path} and created_at = ${created_at}::text::timestamptz`;
        console.warn(`Warm failed for ${path}: ${String(error)}`);
      }
    }));
  }
  return pending.length;
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
  let warmed = 0;
  let lastError: string | null = null;
  try {
    const key = await signingKey();
    while (Date.now() - started < runBudgetMs) {
      const events = await readyEvents();
      if (events.length) {
        try {
          const removed = await processBatch(events, key);
          // Every event was just read, so removing none means the worker would
          // repeat the same batch forever.
          if (!removed) throw new Error("A processed batch removed no queued changes.");
          processed += removed;
        } catch (error) {
          lastError = String(error).slice(0, 500);
          console.error(`Cache refresh failed: ${lastError}`);
          break;
        }
        warmed += await warmPages();
        continue;
      }
      warmed += await warmPages();
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
    await sql`
      update public.stack127_cache_worker_state set
        lease_id = null,
        lease_until = null,
        last_error = ${lastError},
        last_success_at = case when ${lastError}::text is null then now() else last_success_at end
      where id = true and lease_id = ${leaseId}
    `;
  }
  if (processed || warmed || lastError) {
    console.log(JSON.stringify({ processed, warmed, dryRun, error: lastError }));
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
