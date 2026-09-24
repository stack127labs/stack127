import { createHmac } from "node:crypto";
import pg from "pg";
import { targetsForEvents } from "./targets.mjs";

const developmentRef = "phhrfvmncpqqmmgruktx";
const direct = new URL(process.env.DATABASE_URL ?? "postgresql://invalid:invalid@invalid/invalid");
const api = new URL(process.env.SUPABASE_URL ?? "https://invalid/");
const connectionString = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
if (process.env.NODE_ENV === "production"
  || direct.hostname !== `db.${developmentRef}.supabase.co`
  || api.hostname !== `${developmentRef}.supabase.co`
  || !connectionString) {
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
  if (events.some((event) => event.entity_type === "page")) {
    const catalogs = await pool.query(`
      select page.slug
      from public.stack127_tool_catalogs catalog
      join public.stack127_pages page on page.id = catalog.page_id
      where page.is_published
    `);
    catalogSlugs = catalogs.rows.map((row) => row.slug);
  }
  const targets = targetsForEvents(events, catalogSlugs);
  const credential = await pool.query(
    "select signing_key from public.stack127_cache_credentials where id = true",
  );
  const signingKey = credential.rows[0]?.signing_key;
  if (!signingKey) throw new Error("Development cache signing key is missing.");
  const token = createHmac("sha256", signingKey)
    .update("stack127-cache-revalidation-v1")
    .digest("hex");
  const response = await fetch("http://127.0.0.1:3333/api/cache/revalidate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      paths: targets.paths.filter((path) => !path.endsWith(".xml")),
      tags: targets.nextTags,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Local cache endpoint returned HTTP ${response.status}.`);

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

console.log("Watching managed-development cache changes for the local preview.");
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
