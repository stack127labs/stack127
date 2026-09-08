#!/usr/bin/env node

import { writeFileSync, mkdirSync } from "node:fs";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { validateSummary } from "./lib/summary-rules.mjs";
import { isManagedMediaUrl } from "../stack127/media/storage.mjs";

const dockerHighRiskPattern =
  /(^|\/)(\.github|\.ci|\.devcontainer|dev|vendor|test|tests|testing|ci|e2e(?:[-_][^/]*)?|fixtures?|examples?|docker-compose-examples|test-infrastructure|tests_integration)(\/|$)|devcontainer|dev-container|compose\.dev|docker-compose\.dev|docker-compose[-.]ci|compose[-.]ci|example|gitpod|\.ddev/i;
function iconBlockers(row) {
  return isManagedMediaUrl(row.icon_url, { directory: "self-host-apps", kind: "icons" })
    ? []
    : ["icon_not_managed"];
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
  if (
    row.docker_support === "official" &&
    !row.docker_image &&
    !row.docker_url &&
    !row.compose_url &&
    !row.install_docs_url
  ) {
    issues.push("official_docker_without_image_or_docs");
  }
  if (row.source_model === "closed_source" && (!row.website_url || !row.publisher_name)) {
    issues.push("closed_source_without_official_identity");
  }
  if (
    ["open_source", "source_available"].includes(row.source_model) &&
    (!row.source_code_url || !row.license || String(row.license).toLowerCase() === "unknown")
  ) {
    issues.push("source_project_without_code_or_license");
  }

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
          docker_image,
          compose_url,
          license,
          source_model,
          publisher_name,
          published,
          self_hosting_status,
          requires_database,
          database_types,
          docker_support
        from public.self_host_apps
        where published = true
          and self_hosting_status = 'self_hostable'
        order by slug
      `,
    );
    const excludedResult = await client.query(
      `
        select count(*)::integer as count
        from public.self_host_apps
        where published = true
          and self_hosting_status <> 'self_hostable'
      `,
    );
    const publishedRows = result.rows;
    const blockedRows = publishedRows
      .map((row) => ({ ...row, blockers: rowBlockers(row) }))
      .filter((row) => row.blockers.length > 0)
      .sort((a, b) => b.blockers.length - a.blockers.length || a.slug.localeCompare(b.slug));

    return {
      rows: publishedRows,
      blockedRows,
      published_not_self_hostable: excludedResult.rows[0]?.count ?? 0,
    };
  }, args["database-url"]);

  const blocked = rows.blockedRows;

  const report = {
    generated_at: new Date().toISOString(),
    published: rows.rows.length,
    blocked_count: blocked.length,
    excluded_published_count: rows.published_not_self_hostable,
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
