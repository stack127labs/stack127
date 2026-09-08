#!/usr/bin/env node
// Read-only inventory. Flags prioritize review; they never certify or edit records.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { parseArgs, parseEnv } from "node:util";
import { createHash } from "node:crypto";
import pg from "pg";
import { validateSummary } from "../../self-host-apps/lib/summary-rules.mjs";
import { readAuditCursor } from "./read-audit-cursor.mjs";

const { values } = parseArgs({ options: { env: { type: "string" }, out: { type: "string" } } });
if (!values.env || !values.out) throw new Error("Use --env <database env file> --out <inventory.json>");
const environment = parseEnv(await readFile(values.env, "utf8"));
if (!environment.DATABASE_URL) throw new Error("Selected env file has no DATABASE_URL");
const pool = new pg.Pool({ connectionString: environment.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000, query_timeout: 60000 });
try {
  const client = await pool.connect();
  try {
    await client.query("begin isolation level repeatable read read only");
    await client.query("set local statement_timeout = '20s'");
    await client.query("set local idle_in_transaction_session_timeout = '60s'");
    const selfHost = await readAuditCursor(client, "self_host_audit", `select app.*,
      to_jsonb(installs) as installation_record,
      to_jsonb(estimates) as resource_estimate_record,
      to_jsonb(repository) as repository_record,
      coalesce((select jsonb_agg(c.slug order by c.slug) from public.self_host_app_category_links l
        join public.self_host_app_categories c on c.id=l.category_id where l.app_id=app.id), '[]') as categories
      from public.self_host_apps app
      left join public.self_host_app_install_options installs on installs.app_id = app.id
      left join public.self_host_app_resource_estimates estimates on estimates.app_id = app.id
      left join public.github_projects repository on repository.id = app.github_project_id
      where app.published=true order by app.slug`);
    const cli = await readAuditCursor(client, "cli_audit", `select app.*,
      to_jsonb(repository) as repository_record,
      coalesce((select jsonb_agg(to_jsonb(evidence) order by evidence.field_name)
        from public.terminal_app_field_sources evidence where evidence.app_id=app.id), '[]') as field_sources
      from public.terminal_apps app
      left join public.github_projects repository on repository.id = app.github_project_id
      where app.published=true order by app.slug`);
    await client.query("commit");
    const records = [ ...selfHost.map(record => ({ directory: "self-host-apps", record })), ...cli.map(record => ({ directory: "cli-apps", record })) ].map(entry => {
      const { errors, warnings } = validateSummary(entry.record.summary);
      const flags = [...errors, ...warnings];
      if (entry.record.source_model === "closed_source" && !entry.record.license) flags.push("closed_source_without_license_evidence");
      if (/\b(?:helper|sidecar|template|container)\b/i.test(`${entry.record.name} ${entry.record.summary}`)) flags.push("review_app_vs_component_identity");
      return { ...entry, fingerprint: createHash("sha256").update(JSON.stringify(entry.record)).digest("hex"), review_status: "pending", flags };
    });
    const counts = { self_host: selfHost.length, cli: cli.length, total: records.length, flagged: records.filter(r => r.flags.length).length, reviewed: 0 };
    await mkdir(dirname(values.out), { recursive: true });
    await writeFile(values.out, JSON.stringify({ schema_version: 2, captured_at: new Date().toISOString(), counts, records }, null, 2) + "\n", { flag: "wx" });
    console.log(JSON.stringify({ output: values.out, counts }));
  } finally { client.release(); }
} finally { await pool.end(); }
