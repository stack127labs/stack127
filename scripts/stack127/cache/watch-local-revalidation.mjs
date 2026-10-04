import { createHmac } from "node:crypto";
import pg from "pg";
import { targetsForEvents } from "./targets.mjs";

const siteFlag = process.argv.indexOf("--site");
const localSite = new URL(siteFlag === -1 ? "http://127.0.0.1:3333" : process.argv[siteFlag + 1]);
if (localSite.protocol !== "http:"
  || localSite.hostname !== "127.0.0.1"
  || !localSite.port
  || localSite.username || localSite.password
  || localSite.pathname !== "/" || localSite.search || localSite.hash) {
  throw new Error("--site must be an HTTP origin at 127.0.0.1 with the local preview port.");
}

const developmentRef = "yzasonowwlvritqicatj";
const direct = new URL(process.env.DATABASE_URL ?? "postgresql://invalid:invalid@invalid/invalid");
const api = new URL(process.env.SUPABASE_URL ?? "https://invalid/");
const connectionString = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
const connection = connectionString
  ? new URL(connectionString)
  : new URL("postgresql://invalid:invalid@invalid/invalid");
const connectionUser = decodeURIComponent(connection.username);
const developmentDirect = connection.hostname === `db.${developmentRef}.supabase.co`;
const developmentPooler = connection.hostname === "aws-0-ap-northeast-2.pooler.supabase.com"
  && connectionUser.includes(developmentRef);
if (process.env.NODE_ENV === "production"
  || direct.hostname !== `db.${developmentRef}.supabase.co`
  || api.hostname !== `${developmentRef}.supabase.co`
  || (!developmentDirect && !developmentPooler)) {
  throw new Error("Local cache watcher requires the managed development project in .env.local.");
}

const pool = new pg.Pool({ connectionString, max: 2, connectionTimeoutMillis: 10000 });
const delayMs = 5000;
let stopping = false;

process.on("SIGINT", () => { stopping = true; });
process.on("SIGTERM", () => { stopping = true; });

async function revalidatePending() {
  const result = await pool.query(`
    select id, entity_type, slug, created_at::text as created_at
    from public.stack127_revalidation_events
    order by created_at, id
    limit 50
  `);
  const events = result.rows;
  if (!events.length) return;

  let catalogSlugs = [];
  let toolSlugs = [];
  if (events.some((event) => event.entity_type === "page")) {
    const catalogs = await pool.query(`
      select page.slug, page.is_published, catalog.page_id is not null as has_content
      from public.stack127_pages page
      left join public.stack127_catalog_pages catalog on catalog.page_id = page.id
      where page.page_family = 'catalog'
    `);
    catalogSlugs = catalogs.rows.filter((row) => row.is_published && row.has_content).map((row) => row.slug);
    const catalogNames = new Set(catalogs.rows.map((row) => row.slug));
    if (events.some((event) => event.entity_type === "page" && catalogNames.has(event.slug))) {
      const tools = await pool.query(`
        select slug from public.stack127_pages
        where page_family = 'tool' and is_published
      `);
      toolSlugs = tools.rows.map((row) => row.slug);
    }
  }
  const targets = targetsForEvents(events, catalogSlugs, toolSlugs);
  const credential = await pool.query(
    "select signing_key from public.stack127_cache_credentials where id = true",
  );
  const signingKey = credential.rows[0]?.signing_key;
  if (!signingKey) throw new Error("Development cache signing key is missing.");
  const token = createHmac("sha256", signingKey)
    .update("stack127-cache-revalidation-v1")
    .digest("hex");
  const paths = targets.paths.filter((path) => !path.endsWith(".xml"));
  for (let index = 0; index < Math.max(paths.length, 1); index += 200) {
    const response = await fetch(new URL("/api/cache/revalidate", localSite), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ paths: paths.slice(index, index + 200), tags: index === 0 ? targets.nextTags : [] }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Local cache endpoint returned HTTP ${response.status}.`);
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const event of events) {
      await client.query(
        "delete from public.stack127_revalidation_events where id = $1 and created_at = $2",
        [event.id, event.created_at],
      );
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
  console.log(`Revalidated ${events.length} development changes.`);
}

console.log(`Watching managed-development cache changes for ${localSite.origin}.`);
try {
  while (!stopping) {
    try {
      await revalidatePending();
    } catch (error) {
      console.error("Local cache revalidation retry:", error instanceof Error ? error.message : error);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
} finally {
  await pool.end();
}
