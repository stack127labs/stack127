#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error("Usage: build-manual-source-host-reviews.mjs <editorial.json> <reviews.json>");
}

const input = JSON.parse(await readFile(inputPath, "utf8"));
const checkedAt = new Date().toISOString();

function fieldSource(fieldName, source, sourceUrl, confidence = "high", note = null) {
  return {
    field_name: fieldName,
    source,
    source_url: sourceUrl,
    confidence,
    checked_at: checkedAt,
    ...(note ? { note } : {}),
  };
}

function hasValue(value) {
  if (value === null || value === undefined || value === "unknown") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

const reviews = input.records.map((entry) => {
  if (entry.decision !== "publish") return entry;

  const project = {
    published: true,
    website_url: null,
    docs_url: null,
    docker_url: null,
    license_spdx_id: null,
    publisher_name: null,
    publisher_type: "unknown",
    publisher_url: null,
    maintenance_status: "unknown",
    docker_support: "unknown",
    compose_support: null,
    requires_database: null,
    database_types: [],
    ram_mb: null,
    storage_profile: "unknown",
    surfaces: [],
    summary_source: "curated",
    summary_confidence: "high",
    ...entry.project,
  };
  const editorialUrl = entry.evidence.summary ?? project.source_code_url;
  const sources = [
    fieldSource("summary", "stack127_curated", editorialUrl, "high", "Written from verified upstream project documentation."),
    fieldSource("categories", "stack127_curated", editorialUrl, "high", "Assigned by project purpose after editorial review."),
    fieldSource("summary_source", "stack127_curated", editorialUrl),
    fieldSource("summary_confidence", "stack127_curated", editorialUrl),
  ];

  const evidenceFields = [
    "icon_url",
    "website_url",
    "source_code_url",
    "source_code_host",
    "docs_url",
    "install_docs_url",
    "docker_url",
    "license",
    "license_type",
    "license_spdx_id",
    "source_model",
    "publisher_name",
    "publisher_type",
    "publisher_url",
    "self_hosting_status",
    "docker_support",
    "compose_support",
    "requires_database",
    "database_types",
    "ram_mb",
    "storage_profile",
    "surfaces",
    "source_repo_id",
    "source_full_name",
    "source_stars",
    "source_forks",
    "source_watchers",
    "source_open_issues",
    "source_primary_language",
    "source_languages",
    "source_topics",
    "source_created_at",
    "source_updated_at",
    "source_pushed_at",
    "source_default_branch",
    "source_repo_size_kb",
    "source_archived",
    "source_disabled",
    "source_is_fork",
    "source_is_template",
    "source_latest_release",
    "source_latest_release_at",
    "source_last_commit_at",
    "source_checked_at"
  ];

  for (const field of evidenceFields) {
    if (!hasValue(project[field])) continue;
    const evidence = entry.evidence[field] ?? entry.evidence.default;
    if (!evidence?.url) throw new Error(`${project.slug}: missing evidence URL for ${field}`);
    sources.push(fieldSource(field, evidence.source ?? "official_repository", evidence.url, evidence.confidence ?? "high", evidence.note ?? null));
  }

  return {
    candidate_id: entry.candidate_id,
    decision: "publish",
    project,
    field_sources: sources,
    sources: entry.sources ?? [],
  };
});

await writeFile(outputPath, `${JSON.stringify({ reviewed_at: checkedAt, records: reviews }, null, 2)}\n`);
console.log(JSON.stringify({ records: reviews.length, publish: reviews.filter((record) => record.decision === "publish").length, output: outputPath }));
