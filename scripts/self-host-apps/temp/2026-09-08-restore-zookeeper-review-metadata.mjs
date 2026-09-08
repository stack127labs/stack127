// Repair metadata advanced by this audit's first, partial ZooKeeper correction.
import { readFile } from "node:fs/promises";
import { parseArgs, parseEnv, isDeepStrictEqual } from "node:util";
import pg from "pg";
const { values } = parseArgs({ options: { apply: { type: "boolean", default: false } } });
const original = JSON.parse(await readFile("scripts/stack127/directory-quality/temp/2026-09-08-production-inventory.json", "utf8")).records.find(item => item.directory === "self-host-apps" && item.record.slug === "apache-zookeeper").record;
const expected = JSON.parse(await readFile("scripts/stack127/directory-quality/temp/2026-09-08-production-inventory-full.json", "utf8")).records.find(item => item.directory === "self-host-apps" && item.record.slug === "apache-zookeeper").record;
const environment = parseEnv(await readFile(".env.database", "utf8"));
if (!environment.DATABASE_URL) throw new Error("Production DATABASE_URL required");
const pool = new pg.Pool({ connectionString: environment.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000, query_timeout: 15000 });
try {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const current = (await client.query("select * from public.self_host_apps where slug = 'apache-zookeeper' for update")).rows[0];
    for (const field of ["id", "summary", "source_model", "license_spdx_id", "data_confidence", "data_source_urls"]) {
      if (!isDeepStrictEqual(current[field], expected[field])) throw new Error(`ZooKeeper ${field} changed since snapshot`);
    }
    if (current.data_checked_at.toISOString() !== expected.data_checked_at) throw new Error("ZooKeeper review date changed since snapshot");
    const urls = [...new Set([...current.data_source_urls, ...original.data_source_urls])].sort();
    await client.query("update public.self_host_apps set data_checked_at=$2::timestamptz, data_confidence=$3, data_source_urls=$4::text[], updated_at=now() where id=$1", [current.id, original.data_checked_at, original.data_confidence, urls]);
    await client.query(values.apply ? "commit" : "rollback");
    console.log(JSON.stringify({ mode: values.apply ? "committed" : "dry_run_rolled_back", slug: current.slug, restored_general_date: original.data_checked_at, preserved_source_urls: urls.length }));
  } catch (error) { await client.query("rollback"); throw error; }
  finally { client.release(); }
} finally { await pool.end(); }
