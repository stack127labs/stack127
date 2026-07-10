#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { validateSummary } from "./lib/summary-rules.mjs";

const dockerHighRiskPattern =
  /(devcontainer|dev-container|compose\.dev|docker-compose\.dev|\/test|testing|ci|e2e|vendor|\.github)/i;
const dockerWeakPattern = /(examples?|github\.com\/.+#readme)/i;
const vagueSummaryPattern = /\b(simple|modern|elegant|powerful|robust|seamless|easy-to-use|user-friendly)\b/i;

const issueWeights = {
  db_false_with_non_sqlite_types: 100,
  db_unknown_with_types: 90,
  docker_high_risk_url: 80,
  icon_missing_file: 80,
  icon_not_png: 75,
  license_missing: 65,
  docker_unknown: 60,
  docker_weak_url: 55,
  database_unknown: 55,
  remote_icon: 50,
  icon_tiny: 45,
  install_docs_readme_fallback: 40,
  docs_readme_fallback: 35,
  release_missing_recent_commit: 35,
  summary_generic: 35,
  summary_too_short: 30,
  summary_under_8_words: 25,
  summary_vague_adjective: 20,
  summary_article_start: 15,
  summary_name_colon: 15,
  release_missing: 10,
};

function iconIssues(row) {
  const issues = [];
  if (!row.icon_url) {
    issues.push("icon_missing_file");
    return issues;
  }

  if (!String(row.icon_url).startsWith("/app-icons/")) {
    issues.push("remote_icon");
    return issues;
  }

  const file = path.join(process.cwd(), "public", row.icon_url);
  if (!existsSync(file)) {
    issues.push("icon_missing_file");
    return issues;
  }

  const stat = statSync(file);
  if (stat.size < 200) issues.push("icon_tiny");

  const buffer = readFileSync(file);
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  if (!isPng) issues.push("icon_not_png");

  return issues;
}

function summaryIssues(row) {
  const issues = [];
  const result = validateSummary(row.summary);
  for (const error of result.errors) {
    if (error.includes("one sentence")) issues.push("summary_multiple_sentences");
    if (error.includes("em dash")) issues.push("summary_em_dash");
  }
  for (const warning of result.warnings) {
    if (warning.includes("too short")) issues.push("summary_too_short");
    if (warning.includes("at least 8")) issues.push("summary_under_8_words");
    if (warning.includes("too generic")) issues.push("summary_generic");
    if (warning.includes("name with a colon")) issues.push("summary_name_colon");
    if (warning.includes("start with")) issues.push("summary_article_start");
    if (warning.includes("weak phrase")) issues.push("summary_weak_phrase");
  }
  if (vagueSummaryPattern.test(row.summary ?? "")) issues.push("summary_vague_adjective");
  return issues;
}

function rowIssues(row) {
  const issues = [];

  if (!row.license || String(row.license).toLowerCase() === "unknown") issues.push("license_missing");
  if (row.requires_database === null) issues.push("database_unknown");
  if (row.requires_database === null && row.database_types?.length > 0) issues.push("db_unknown_with_types");
  if (
    row.requires_database === false &&
    row.database_types?.length > 0 &&
    !(row.database_types.length === 1 && row.database_types[0] === "sqlite")
  ) {
    issues.push("db_false_with_non_sqlite_types");
  }

  if (row.docker_support === "unknown") issues.push("docker_unknown");
  if (row.docker_url && dockerHighRiskPattern.test(row.docker_url)) issues.push("docker_high_risk_url");
  if (row.docker_url && dockerWeakPattern.test(row.docker_url)) issues.push("docker_weak_url");
  if (row.docs_url && /github\.com\/.+#readme/i.test(row.docs_url)) issues.push("docs_readme_fallback");
  if (row.install_docs_url && /github\.com\/.+#readme/i.test(row.install_docs_url)) {
    issues.push("install_docs_readme_fallback");
  }

  if (!row.github_latest_release) {
    issues.push("release_missing");
    if (row.github_last_commit_at) {
      const days = (Date.now() - new Date(row.github_last_commit_at).getTime()) / 86_400_000;
      if (days <= 365) issues.push("release_missing_recent_commit");
    }
  }

  issues.push(...summaryIssues(row));
  issues.push(...iconIssues(row));

  return [...new Set(issues)];
}

function scoreFor(issues) {
  return issues.reduce((total, issue) => total + (issueWeights[issue] ?? 10), 0);
}

function groupCounts(rows) {
  const counts = {};
  for (const row of rows) {
    for (const issue of row.issues) counts[issue] = (counts[issue] ?? 0) + 1;
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
          website_url,
          source_code_url,
          docs_url,
          install_docs_url,
          docker_url,
          license,
          maintenance_status,
          github_stars,
          github_latest_release,
          github_last_commit_at,
          github_checked_at,
          docker_support,
          compose_support,
          requires_database,
          database_types,
          ram_mb,
          storage_profile,
          surfaces,
          summary_source,
          summary_confidence
        from public.open_projects
        where published = true
          and self_hosting_status = 'self_hostable'
        order by slug
      `,
    );
    return result.rows;
  }, args["database-url"]);

  const queue = rows
    .map((row) => {
      const issues = rowIssues(row);
      return {
        slug: row.slug,
        name: row.name,
        score: scoreFor(issues),
        issues,
        github_stars: row.github_stars,
        summary: row.summary,
        source_code_url: row.source_code_url,
        website_url: row.website_url,
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || (b.github_stars ?? 0) - (a.github_stars ?? 0) || a.slug.localeCompare(b.slug));

  const report = {
    generated_at: new Date().toISOString(),
    published: rows.length,
    issue_counts: groupCounts(queue),
    queue_count: queue.length,
    top_queue: queue.slice(0, limit),
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
