#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const [packetPath, editorialPath, licensePath, outputPath] = process.argv.slice(2);
if (!packetPath || !editorialPath || !licensePath || !outputPath) {
  throw new Error("Usage: build-reviewed-candidate-batch.mjs <packet> <editorial> <licenses> <output>");
}

const packet = JSON.parse(await readFile(packetPath, "utf8"));
const editorial = JSON.parse(await readFile(editorialPath, "utf8"));
const licenseEvidence = JSON.parse(await readFile(licensePath, "utf8"));
const packetByNumber = new Map(packet.records.map((record, index) => [index + 1, record]));
const licenseByCandidate = new Map(licenseEvidence.records.map((record) => [record.candidate_id, record]));

function licenseType(spdx) {
  const value = String(spdx ?? "").toUpperCase();
  if (/^(MIT|APACHE-|BSD-|ISC|ZLIB|0BSD)/.test(value)) return "permissive";
  if (/^(AGPL-|GPL-|LGPL-|MPL-|EUPL-|CECILL-)/.test(value)) return "copyleft";
  if (/^(UNLICENSE|CC0-)/.test(value)) return "public_domain";
  if (/\b( OR | AND |\+)\b/.test(value)) return "mixed";
  return "unknown";
}

function fieldSource(fieldName, source, sourceUrl, confidence = "high", note = null) {
  return {
    field_name: fieldName,
    source,
    source_url: sourceUrl,
    confidence,
    checked_at: new Date().toISOString(),
    ...(note ? { note } : {}),
  };
}

function sourceFact(project, sources, field, value, apiUrl) {
  if (value === null || value === undefined) return;
  project[field] = value;
  sources.push(fieldSource(field, "github_api", apiUrl));
}

const reviews = [];

for (const edit of editorial.records) {
  const record = packetByNumber.get(edit.n);
  if (!record) throw new Error(`Missing packet record ${edit.n}`);

  if (edit.decision) {
    reviews.push({ candidate_id: record.candidate.id, decision: edit.decision, reason: edit.reason });
    continue;
  }

  const repository = record.github.repository;
  const repoUrl = record.github.repository_url;
  const apiUrl = record.github.repository_api_url;
  const licenseFiles = licenseByCandidate.get(record.candidate.id)?.files ?? [];
  const licenseUrl = licenseFiles.find((file) => file.html_url)?.html_url ?? `${apiUrl}/license`;
  const defaultLicense = repository.license?.spdx_id;
  const license = edit.license ?? {
    label: defaultLicense,
    type: licenseType(defaultLicense),
    spdx: defaultLicense,
  };
  if (!license.label || license.type === "unknown") {
    throw new Error(`${record.candidate.name} has no verified license classification`);
  }

  const selfHostingStatus = edit.status ?? "self_hostable";
  const installUrl = edit.install === "readme" ? repoUrl : edit.install ?? null;
  const websiteUrl = Object.hasOwn(edit, "website") ? edit.website : repository.homepage || null;
  const directoryIconUrl = record.candidate.payload?.detail?.image ?? null;
  const iconUrl = edit.icon_url ?? directoryIconUrl ?? repository.owner?.avatar_url ?? null;
  const iconSource = edit.icon_url
    ? fieldSource("icon_url", "official_repository", edit.icon_source_url ?? repoUrl)
    : directoryIconUrl
      ? fieldSource(
          "icon_url",
          "openalternative_directory",
          record.candidate.source_url,
          "medium",
          "Directory-hosted project icon; URL checked before publication.",
        )
      : fieldSource(
          "icon_url",
          "github_api",
          apiUrl,
          "medium",
          "Repository owner avatar used because no project-specific icon was published.",
        );
  const project = {
    slug: edit.slug ?? record.candidate.slug,
    name: edit.name ?? record.candidate.name,
    summary: edit.summary,
    icon_url: iconUrl,
    website_url: websiteUrl,
    source_code_url: repoUrl,
    source_code_host: "github",
    docs_url: null,
    install_docs_url: installUrl,
    docker_url: edit.docker_url ?? null,
    license: license.label,
    license_type: license.type,
    license_spdx_id: license.spdx,
    source_model: edit.source_model ?? "open_source",
    publisher_name: repository.owner.login,
    publisher_type: "unknown",
    publisher_url: repository.owner.html_url,
    published: true,
    self_hosting_status: selfHostingStatus,
    maintenance_status: edit.maintenance_status ?? (repository.archived ? "archived" : "active"),
    docker_support: edit.docker ? "official" : "unknown",
    compose_support: edit.compose ?? null,
    requires_database: Array.isArray(edit.database) ? true : edit.database_required ?? null,
    database_types: edit.database ?? [],
    ram_mb: edit.ram ?? null,
    storage_profile: edit.storage ?? "unknown",
    surfaces: edit.surfaces ?? [],
    categories: edit.categories,
    summary_source: "curated",
    summary_confidence: "high",
  };
  const sources = [
    fieldSource("summary", "stack127_curated", repoUrl, "high", "Written from the verified repository and official documentation."),
    fieldSource("categories", "stack127_curated", repoUrl, "high", "Assigned by project purpose after editorial review."),
    iconSource,
    fieldSource("source_code_url", "github_api", apiUrl),
    fieldSource("source_code_host", "github_api", apiUrl),
    fieldSource("license", "repository_license", licenseUrl),
    fieldSource("license_type", "repository_license", licenseUrl),
    fieldSource("source_model", "repository_license", licenseUrl),
    fieldSource("self_hosting_status", "official_repository", installUrl ?? repoUrl),
    fieldSource("summary_source", "stack127_curated", repoUrl),
    fieldSource("summary_confidence", "stack127_curated", repoUrl),
    fieldSource("publisher_name", "github_api", apiUrl),
    fieldSource("publisher_url", "github_api", apiUrl),
  ];

  if (project.license_spdx_id) sources.push(fieldSource("license_spdx_id", "repository_license", licenseUrl));

  if (project.website_url) sources.push(fieldSource("website_url", "github_api", apiUrl));
  if (installUrl) sources.push(fieldSource("install_docs_url", "official_documentation", installUrl));
  if (project.docker_url) sources.push(fieldSource("docker_url", "official_repository", installUrl ?? repoUrl));
  if (edit.docker) sources.push(fieldSource("docker_support", "official_repository", installUrl ?? repoUrl));
  if (edit.compose !== undefined) sources.push(fieldSource("compose_support", "official_repository", installUrl ?? repoUrl));
  if (project.requires_database !== null) sources.push(fieldSource("requires_database", "official_repository", installUrl ?? repoUrl));
  if (project.database_types.length) sources.push(fieldSource("database_types", "official_repository", installUrl ?? repoUrl));
  if (project.ram_mb !== null) sources.push(fieldSource("ram_mb", "official_repository", installUrl ?? repoUrl));
  if (project.storage_profile !== "unknown") sources.push(fieldSource("storage_profile", "official_repository", installUrl ?? repoUrl));
  if (project.surfaces.length) sources.push(fieldSource("surfaces", "official_repository", repoUrl));

  sourceFact(project, sources, "source_repo_id", String(repository.id), apiUrl);
  sourceFact(project, sources, "source_full_name", repository.full_name, apiUrl);
  sourceFact(project, sources, "source_stars", repository.stars, apiUrl);
  sourceFact(project, sources, "source_forks", repository.forks, apiUrl);
  sourceFact(project, sources, "source_watchers", repository.watchers, apiUrl);
  sourceFact(project, sources, "source_open_issues", repository.open_issues, apiUrl);
  sourceFact(project, sources, "source_primary_language", repository.primary_language, apiUrl);
  sourceFact(project, sources, "source_languages", record.github.languages, apiUrl);
  sourceFact(project, sources, "source_topics", repository.topics, apiUrl);
  sourceFact(project, sources, "source_created_at", repository.created_at, apiUrl);
  sourceFact(project, sources, "source_updated_at", repository.updated_at, apiUrl);
  sourceFact(project, sources, "source_pushed_at", repository.pushed_at, apiUrl);
  sourceFact(project, sources, "source_default_branch", repository.default_branch, apiUrl);
  sourceFact(project, sources, "source_repo_size_kb", repository.size_kb, apiUrl);
  sourceFact(project, sources, "source_archived", repository.archived, apiUrl);
  sourceFact(project, sources, "source_disabled", repository.disabled, apiUrl);
  sourceFact(project, sources, "source_is_fork", repository.is_fork, apiUrl);
  sourceFact(project, sources, "source_is_template", repository.is_template, apiUrl);
  sourceFact(project, sources, "source_latest_release", record.github.latest_release?.tag_name ?? null, apiUrl);
  sourceFact(project, sources, "source_latest_release_at", record.github.latest_release?.published_at ?? null, apiUrl);
  sourceFact(project, sources, "source_last_commit_at", record.github.latest_commit?.committed_at ?? null, apiUrl);
  sourceFact(project, sources, "source_checked_at", record.github.checked_at, apiUrl);

  reviews.push({ candidate_id: record.candidate.id, decision: "publish", project, field_sources: sources });
}

await writeFile(outputPath, `${JSON.stringify({ reviewed_at: new Date().toISOString(), records: reviews }, null, 2)}\n`);
console.log(JSON.stringify({
  records: reviews.length,
  publish: reviews.filter((review) => review.decision === "publish").length,
  reject: reviews.filter((review) => review.decision === "reject").length,
  needs_review: reviews.filter((review) => review.decision === "needs_review").length,
  output: outputPath,
}));
