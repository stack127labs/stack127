#!/usr/bin/env node

import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { validateSummary } from "./lib/summary-rules.mjs";

const dockerHighRiskPattern =
  /(^|\/)(\.github|\.ci|\.devcontainer|dev|vendor|test|tests|testing|ci|e2e(?:[-_][^/]*)?|fixtures?|examples?|docker-compose-examples|test-infrastructure|tests_integration)(\/|$)|devcontainer|dev-container|compose\.dev|docker-compose\.dev|docker-compose[-.]ci|compose[-.]ci|example|gitpod|\.ddev/i;
function iconBlockers(row) {
  if (!row.icon_url?.startsWith("/app-icons/")) return ["icon_not_local"];
  const file = path.join(process.cwd(), "public", row.icon_url);
  if (!existsSync(file)) return ["icon_missing_file"];
  const stat = statSync(file);
  if (stat.size < 200) return ["icon_tiny_file"];
  const buffer = readFileSync(file);
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  return isPng ? [] : ["icon_not_png"];
}

function summaryBlockers(row) {
  const issues = [];
  const text = String(row.summary ?? "").trim();
  const result = validateSummary(text);

  if (!text) issues.push("summary_missing");
  if (result.errors.some((error) => error.includes("required"))) issues.push("summary_missing");
  if (/^(and|or)\s/i.test(text)) issues.push("summary_bad_start");
  if (/^the official (source code )?repository\b/i.test(text)) issues.push("summary_bad_start");
  if (/^mirror of\b/i.test(text)) issues.push("summary_mirror_text");
  if (/^[^A-Za-z0-9]+/.test(text)) issues.push("summary_broken_text");
  if (/\bis an? (app|tool|platform|solution)\.?$/i.test(text)) issues.push("summary_generic_tail");

  return issues;
}

function rowBlockers(row) {
  const issues = [];
  issues.push(...iconBlockers(row));
  issues.push(...summaryBlockers(row));

  if (
    row.requires_database === false &&
    row.database_types?.length > 0 &&
    !(row.database_types.length === 1 && row.database_types[0] === "sqlite")
  ) {
    issues.push("database_contradiction");
  }
  if (row.requires_database === null && row.database_types?.length > 0) issues.push("database_types_without_requirement");
  if (row.docker_url && dockerHighRiskPattern.test(row.docker_url)) issues.push("docker_high_risk_url");
  if (row.source_model === "unknown") issues.push("source_model_unknown");

  return [...new Set(issues)];
}

function groupCounts(rows) {
  const counts = {};
  for (const row of rows) {
    for (const issue of row.blockers) counts[issue] = (counts[issue] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 100);

  const rows = await withClient(async (client) => {
    const result = await client.query(
      `
        select
          slug,
          name,
          summary,
          icon_url,
          source_code_url,
          website_url,
          docs_url,
          install_docs_url,
          docker_url,
          license,
          source_model,
          requires_database,
          database_types,
          docker_support
        from public.open_projects
        where published = true
          and self_hosting_status = 'self_hostable'
        order by slug
      `,
    );
    const publishedRows = result.rows;
    const blockedRows = publishedRows
      .map((row) => ({ ...row, blockers: rowBlockers(row) }))
      .filter((row) => row.blockers.length > 0)
      .sort((a, b) => b.blockers.length - a.blockers.length || a.slug.localeCompare(b.slug));

    return { rows: publishedRows, blockedRows };
  }, args["database-url"]);

  const blocked = rows.blockedRows;

  const report = {
    generated_at: new Date().toISOString(),
    published: rows.rows.length,
    blocked_count: blocked.length,
    blocker_counts: groupCounts(blocked),
    blocked_rows: blocked.slice(0, limit).map((row) => ({
      slug: row.slug,
      name: row.name,
      blockers: row.blockers,
      summary: row.summary,
      source_code_url: row.source_code_url,
      website_url: row.website_url,
      docker_url: row.docker_url,
    })),
  };

  if (args.out) {
    mkdirSync(path.dirname(args.out), { recursive: true });
    writeFileSync(args.out, `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
