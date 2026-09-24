import { createHmac } from "node:crypto";
import pg from "pg";
import { targetsForEvents } from "./targets.mjs";

const { DATABASE_URL, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = process.env;
const siteUrl = (process.env.STACK127_SITE_URL || "https://stack127.com").replace(/\/$/, "");
if (!DATABASE_URL || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
  throw new Error("Database, Cloudflare, and revalidation credentials are required.");
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 2, connectionTimeoutMillis: 15000 });

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${new URL(url).pathname} returned HTTP ${response.status}`);
  return response;
}

async function invalidateNext(targets) {
  const result = await pool.query("select signing_key from public.stack127_cache_credentials where id = true");
  const signingKey = result.rows[0]?.signing_key;
  if (!signingKey) throw new Error("Cache signing key is missing from the database.");
  const token = createHmac("sha256", signingKey).update("stack127-cache-revalidation-v1").digest("hex");
  await request(`${siteUrl}/api/cache/revalidate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ paths: targets.paths.filter((path) => !path.endsWith(".xml")), tags: targets.nextTags }),
  });
}

async function purgeCloudflare(tags) {
  for (let index = 0; index < tags.length; index += 100) {
    const batch = tags.slice(index, index + 100);
    const response = await request(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, {
      method: "POST",
      headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tags: batch }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(`Cloudflare rejected a tag purge: ${JSON.stringify(result.errors ?? [])}`);
  }
}

async function processEvents() {
  const result = await pool.query(`
    select id, entity_type, slug, created_at::text as created_at
    from public.stack127_revalidation_events
    order by created_at, id
    limit 50
  `);
  const events = result.rows;
  if (!events.length) return 0;
  const appCount = await pool.query("select count(*)::int as count from public.stack127_revalidation_events where entity_type = 'self_host_app'");
  let targetEvents = events;
  if (appCount.rows[0].count > 100) {
    const appEvents = await pool.query(`
      select id, entity_type, slug, created_at::text as created_at
      from public.stack127_revalidation_events
      where entity_type = 'self_host_app'
    `);
    const seen = new Set(events.map((event) => String(event.id)));
    events.push(...appEvents.rows.filter((event) => !seen.has(String(event.id))));
    targetEvents = [
      ...events.filter((event) => event.entity_type !== "self_host_app"),
      { entity_type: "self_host_catalog", slug: "all" },
    ];
  }
  const targets = targetsForEvents(targetEvents);
  try {
    await invalidateNext(targets);
    await purgeCloudflare(targets.edgeTags);
    const client = await pool.connect();
    try {
      await client.query("begin");
      for (const event of events) {
        await client.query(
          "delete from public.stack127_revalidation_events where id = $1 and created_at = $2",
          [event.id, event.created_at],
        );
      }
      for (const path of targets.warmPaths) {
        await client.query(`
          insert into public.stack127_cache_warm_events (path)
          values ($1)
          on conflict (path) do update set created_at = now(), attempts = 0
        `, [path]);
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
    return events.length;
  } catch (error) {
    await pool.query(`
      update public.stack127_revalidation_events
      set attempts = attempts + 1, last_error = $1
      where id = any($2::bigint[])
    `, [String(error).slice(0, 500), events.map((event) => event.id)]);
    throw error;
  }
}

async function warmPages() {
  const result = await pool.query(`
    select path, created_at::text as created_at from public.stack127_cache_warm_events
    order by created_at limit 20
  `);
  const pending = result.rows;
  for (let index = 0; index < pending.length; index += 4) {
    await Promise.all(pending.slice(index, index + 4).map(async ({ path, created_at }) => {
      try {
        const response = await fetch(`${siteUrl}${path}`, { signal: AbortSignal.timeout(20000) });
        if (!response.ok && response.status !== 404) throw new Error(`HTTP ${response.status}`);
        await pool.query("delete from public.stack127_cache_warm_events where path = $1 and created_at = $2", [path, created_at]);
      } catch (error) {
        await pool.query("update public.stack127_cache_warm_events set attempts = attempts + 1 where path = $1 and created_at = $2", [path, created_at]);
        console.warn(`Warm failed for ${path}: ${String(error)}`);
      }
    }));
  }
  return pending.length;
}

try {
  const processed = await processEvents();
  const warmed = await warmPages();
  const pending = await pool.query("select count(*)::int as count from public.stack127_revalidation_events");
  if (processed || warmed || pending.rows[0].count) {
    console.log(JSON.stringify({ processed, warmed, pending: pending.rows[0].count }));
  }
} finally {
  await pool.end();
}
