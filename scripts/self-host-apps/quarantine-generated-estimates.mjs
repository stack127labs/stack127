#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { parseArgs, parseEnv } from "node:util";
import pg from "pg";
import { generatedEstimatePlan } from "./lib/resource-quarantine.mjs";

const { values } = parseArgs({ options: { env: { type: "string" }, snapshot: { type: "string" }, backup: { type: "string" }, apply: { type: "boolean", default: false } } });
if (!values.env || !values.snapshot || (values.apply && !values.backup)) throw new Error("Use --env <env file> --snapshot <version-2 snapshot> [--apply --backup <new backup file>]. Default is rollback-only.");
const snapshot = JSON.parse(await readFile(values.snapshot, "utf8"));
const plan = generatedEstimatePlan(snapshot);
if (plan.length === 0) throw new Error("No identified generated estimates in this snapshot");
const counts = { apps: plan.length, ram: plan.filter(row => row.ram).length, storage: plan.filter(row => row.storage).length };
if (values.apply) {
  await mkdir(dirname(values.backup), { recursive: true });
  // Save exact before-values before opening a write transaction. Never overwrite a backup.
  const backup = { reason: "Unsupported deployment-shape-v1 resource ranges", snapshot: values.snapshot, snapshot_captured_at: snapshot.captured_at, prepared_at: new Date().toISOString(), counts, plan };
  await writeFile(values.backup, JSON.stringify(backup, null, 2) + "\n", { flag: "wx" });
}
const environment = parseEnv(await readFile(values.env, "utf8"));
if (!environment.DATABASE_URL) throw new Error("Selected env file has no DATABASE_URL");
const pool = new pg.Pool({ connectionString: environment.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000, query_timeout: 30000, application_name: "stack127-reviewed-resource-quarantine" });
const fields = {
  ram: ["ram_estimate_min_mb", "ram_estimate_max_mb", "ram_estimate_kind", "ram_estimate_confidence", "ram_estimate_basis", "ram_source_urls", "ram_note"],
  storage: ["storage_estimate_min_gb", "storage_estimate_max_gb", "storage_estimate_kind", "storage_estimate_confidence", "storage_estimate_basis", "storage_source_urls", "storage_note"],
};
const assignments = Object.entries(fields).flatMap(([kind, columns]) => columns.map(column => `${column} = case when expected.${kind} then ${column.endsWith("_urls") ? "'{}'::text[]" : "null"} else resource.${column} end`));
try {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("set local statement_timeout = '20s'");
    await client.query("set local lock_timeout = '5s'");
    for (let offset = 0; offset < plan.length; offset += 100) {
      const page = plan.slice(offset, offset + 100);
      const result = await client.query(`with expected as (
        select * from jsonb_to_recordset($1::jsonb) as x(app_id uuid, record jsonb, ram boolean, storage boolean)
      ) update public.self_host_app_resource_estimates resource
        set ${assignments.join(", ")}, updated_at = now()
        from expected where resource.app_id = expected.app_id and to_jsonb(resource) = expected.record
        returning resource.app_id`, [JSON.stringify(page)]);
      if (result.rowCount !== page.length) throw new Error(`Resource records changed since snapshot near offset ${offset}; all changes rolled back`);
      if (offset % 1000 === 0) console.log(`Checked ${Math.min(offset + 100, plan.length)} of ${plan.length} resource rows`);
    }
    await client.query(values.apply ? "commit" : "rollback");
    console.log(JSON.stringify({ mode: values.apply ? "committed" : "dry_run_rolled_back", counts, backup: values.backup ?? null }));
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally { client.release(); }
} finally { await pool.end(); }
