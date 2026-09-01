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
const researchedNullOutcomes = new Set([
  "ram_not_published",
  "storage_not_published",
  "database_not_published",
  "docker_not_published",
  "docker_image_not_published",
  "compose_not_published",
  "ram_estimated",
  "storage_estimated",
]);

const issueWeights = {
  db_false_with_non_sqlite_types: 100,
  db_unknown_with_types: 90,
  docker_high_risk_url: 80,
  icon_missing_file: 80,
  icon_not_png: 75,
  license_missing: 65,
  ram_pending: 60,
  storage_pending: 55,
  pricing_unknown: 45,
  docker_image_missing: 40,
  source_model_unknown: 65,
  docker_pending: 60,
  compose_pending: 55,
  docker_weak_url: 55,
  database_pending: 55,
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

  if (
    row.source_model !== "closed_source" &&
    (!row.license || String(row.license).toLowerCase() === "unknown")
  ) {
    issues.push("license_missing");
  }
  if (row.source_model === "unknown") issues.push("source_model_unknown");
  if (
    row.ram_min_mb === null &&
    row.ram_recommended_mb === null &&
    row.ram_default_limit_mb === null
  ) {
    issues.push(row.ram_estimate_exists
      ? "ram_estimated"
      : factWasChecked(row, "ram") ? "ram_not_published" : "ram_pending");
  }
  if (
    row.storage_min_gb === null &&
    row.storage_profile === "unknown" &&
    row.persistent_storage !== true
  ) {
    issues.push(row.storage_estimate_exists
      ? "storage_estimated"
      : factWasChecked(row, "storage") ? "storage_not_published" : "storage_pending");
  }
  if (row.pricing_model === "unknown") issues.push("pricing_unknown");
  if (row.docker_support === "official" && !row.docker_image) {
    issues.push(factWasChecked(row, "docker_image") ? "docker_image_not_published" : "docker_image_missing");
  }
  if (row.requires_database === null) {
    issues.push(factWasChecked(row, "database") ? "database_not_published" : "database_pending");
  }
  if (row.requires_database === null && row.database_types?.length > 0) issues.push("db_unknown_with_types");
  if (
    row.requires_database === false &&
    row.database_types?.length > 0 &&
    !(row.database_types.length === 1 && row.database_types[0] === "sqlite")
  ) {
    issues.push("db_false_with_non_sqlite_types");
  }

  if (row.docker_support === "unknown") {
    issues.push(factWasChecked(row, "docker") ? "docker_not_published" : "docker_pending");
  }
  if (row.compose_support === null) {
    issues.push(factWasChecked(row, "compose") ? "compose_not_published" : "compose_pending");
  }
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

function factWasChecked(row, key) {
  const status = row.technical_fact_status?.[key]?.status;
  return status === "published" || status === "not_published";
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
          docker_image,
          license,
          source_model,
          pricing_model,
          maintenance_status,
          coalesce(github_project.stars, self_host_apps.source_stars, self_host_apps.github_stars) as github_stars,
          coalesce(github_project.latest_release, self_host_apps.source_latest_release, self_host_apps.github_latest_release) as github_latest_release,
          coalesce(github_project.last_commit_at, self_host_apps.source_last_commit_at, self_host_apps.github_last_commit_at) as github_last_commit_at,
          coalesce(github_project.checked_at, self_host_apps.source_checked_at, self_host_apps.github_checked_at) as github_checked_at,
          docker_support,
          compose_support,
          requires_database,
          database_types,
          ram_mb,
          ram_min_mb,
          ram_recommended_mb,
          ram_default_limit_mb,
          self_host_apps.technical_fact_status,
          self_host_apps.technical_facts_checked_at,
          resource.ram_estimate_min_mb is not null as ram_estimate_exists,
          storage_min_gb,
          storage_profile,
          persistent_storage,
          resource.storage_estimate_min_gb is not null as storage_estimate_exists,
          surfaces,
          summary_source,
          summary_confidence
        from public.self_host_apps
        left join public.github_projects github_project on github_project.id = self_host_apps.github_project_id
        left join public.self_host_app_resource_estimates resource on resource.app_id = self_host_apps.id
        where published = true
          and self_hosting_status = 'self_hostable'
        order by slug
      `,
    );
    return result.rows;
  }, args["database-url"]);

  const assessed = rows.map((row) => {
    const findings = rowIssues(row);
    const outcomes = findings.filter((finding) => researchedNullOutcomes.has(finding));
    const issues = findings.filter((finding) => !researchedNullOutcomes.has(finding));
    return {
      slug: row.slug,
      name: row.name,
      score: scoreFor(issues),
      issues,
      outcomes,
      github_stars: row.github_stars,
      summary: row.summary,
      source_code_url: row.source_code_url,
      website_url: row.website_url,
    };
  });

  const queue = assessed
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || (b.github_stars ?? 0) - (a.github_stars ?? 0) || a.slug.localeCompare(b.slug));

  const report = {
    generated_at: new Date().toISOString(),
    published: rows.length,
    issue_counts: groupCounts(queue),
    researched_null_counts: groupCounts(assessed.map((row) => ({ issues: row.outcomes }))),
    estimate_counts: groupCounts(assessed.map((row) => ({
      issues: row.outcomes.filter((outcome) => outcome.endsWith("_estimated")),
    }))),
    technical_pending_count: assessed.filter((row) =>
      row.issues.some((issue) => issue.endsWith("_pending") || issue === "docker_image_missing")
    ).length,
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
