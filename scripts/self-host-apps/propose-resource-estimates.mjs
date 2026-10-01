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
  select app.slug, app.install_docs_url, app.docs_url, app.website_url, app.source_code_url,
    resource.ram_estimate_min_mb, resource.ram_estimate_max_mb,
    resource.ram_estimate_kind, resource.ram_estimate_confidence,
    resource.ram_estimate_basis, resource.ram_source_urls,
    resource.storage_estimate_min_gb, resource.storage_estimate_max_gb,
    resource.storage_estimate_kind, resource.storage_estimate_confidence,
    resource.storage_estimate_basis, resource.storage_source_urls
  from public.self_host_apps app
  left join public.self_host_app_resource_estimates resource on resource.app_id = app.id
  where app.published = true and app.self_hosting_status = 'self_hostable'
  order by app.popularity_score desc, app.name asc limit $1`, [limit])).rows, args["database-url"]);
const records = buildResourceReviewQueue(rows);
const report = { generated_at: new Date().toISOString(), mode: "research_queue", apps_scanned: rows.length, records };
if (args.out) {
  await mkdir(path.dirname(args.out), { recursive: true });
  await writeFile(args.out, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
}
console.log(JSON.stringify({ mode: report.mode, apps_scanned: rows.length, review_tasks: records.length, out: args.out ?? null }));
