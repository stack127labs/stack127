#!/usr/bin/env node
// Compatibility command: collect research tasks without manufacturing numbers.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { buildResourceReviewQueue } from "./lib/resource-review.mjs";

const args = parseArgs();
const limit = numberArg(args, "limit", 5000);
const rows = await withClient(async client => (await client.query(`
  select slug, install_docs_url, docs_url, website_url, source_code_url,
    ram_min_mb, ram_recommended_mb, ram_default_limit_mb, storage_min_gb
  from public.self_host_apps
  where published = true and self_hosting_status = 'self_hostable'
  order by popularity_score desc, name asc limit $1`, [limit])).rows, args["database-url"]);
const records = buildResourceReviewQueue(rows);
const report = { generated_at: new Date().toISOString(), mode: "research_queue", apps_scanned: rows.length, records };
if (args.out) {
  await mkdir(path.dirname(args.out), { recursive: true });
  await writeFile(args.out, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
}
console.log(JSON.stringify({ mode: report.mode, apps_scanned: rows.length, review_tasks: records.length, out: args.out ?? null }));
