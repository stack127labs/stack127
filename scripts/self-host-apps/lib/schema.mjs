import { readFile } from "node:fs/promises";
import { selfHostAppCategorySlugs } from "./categories.mjs";
import { slugify, validateSummary } from "./summary-rules.mjs";

export const enumValues = {
  docker_support: ["official", "community", "none", "unknown"],
  license_type: ["permissive", "copyleft", "public_domain", "mixed", "custom", "unknown"],
  maintenance_status: ["active", "slow", "stale", "archived", "unknown"],
  publisher_type: ["company", "foundation", "community", "individual", "unknown"],
  self_hosting_status: ["self_hostable", "not_self_hostable", "unknown"],
  source_model: ["open_source", "source_available", "closed_source", "unknown"],
  pricing_model: ["free", "freemium", "paid", "subscription", "usage_based", "enterprise", "unknown"],
  resource_requirement_kind: [
    "official_minimum",
    "official_recommended",
    "measured",
    "community_estimate",
    "unknown",
  ],
  storage_profile: ["tiny", "low", "medium", "high", "depends", "unknown"],
  confidence: ["high", "medium", "low", "unknown"],
};

export const appColumnTypes = {
  slug: "text",
  name: "text",
  summary: "text",
  icon_url: "text",
  icon_source_url: "text",
  website_url: "text",
  source_code_url: "text",
  source_code_host: "text",
  docs_url: "text",
  install_docs_url: "text",
  docker_url: "text",
  license: "text",
  license_type: "public.self_host_app_license_type",
  license_spdx_id: "text",
  source_model: "public.self_host_app_source_model",
  publisher_name: "text",
  publisher_type: "text",
  publisher_url: "text",
  pricing_model: "text",
  published: "boolean",
  self_hosting_status: "public.self_host_app_self_hosting_status",
  maintenance_status: "text",
  github_owner: "text",
  github_repo: "text",
  github_repo_id: "bigint",
  github_project_id: "uuid",
  github_node_id: "text",
  github_full_name: "text",
  github_owner_type: "text",
  github_stars: "integer",
  github_forks: "integer",
  github_watchers: "integer",
  github_open_issues: "integer",
  github_primary_language: "text",
  github_languages: "jsonb",
  github_topics: "text[]",
  github_created_at: "timestamptz",
  github_updated_at: "timestamptz",
  github_pushed_at: "timestamptz",
  github_default_branch: "text",
  github_repo_size_kb: "bigint",
  github_archived: "boolean",
  github_disabled: "boolean",
  github_is_fork: "boolean",
  github_is_template: "boolean",
  source_repo_id: "text",
  source_full_name: "text",
  source_stars: "integer",
  source_forks: "integer",
  source_watchers: "integer",
  source_open_issues: "integer",
  source_primary_language: "text",
  source_languages: "jsonb",
  source_topics: "text[]",
  source_created_at: "timestamptz",
  source_updated_at: "timestamptz",
  source_pushed_at: "timestamptz",
  source_default_branch: "text",
  source_repo_size_kb: "bigint",
  source_archived: "boolean",
  source_disabled: "boolean",
  source_is_fork: "boolean",
  source_is_template: "boolean",
  source_latest_release: "text",
  source_latest_release_at: "timestamptz",
  source_last_commit_at: "timestamptz",
  source_checked_at: "timestamptz",
  github_latest_release: "text",
  github_latest_release_at: "timestamptz",
  github_last_commit_at: "timestamptz",
  github_checked_at: "timestamptz",
  docker_support: "text",
  deployment_methods: "text[]",
  docker_image: "text",
  compose_support: "boolean",
  compose_url: "text",
  requires_database: "boolean",
  database_types: "text[]",
  ram_mb: "integer",
  ram_min_mb: "integer",
  ram_recommended_mb: "integer",
  ram_default_limit_mb: "integer",
  storage_profile: "text",
  storage_min_gb: "numeric",
  persistent_storage: "boolean",
  resource_requirement_kind: "text",
  technical_facts_checked_at: "timestamptz",
  data_source_urls: "text[]",
  data_checked_at: "timestamptz",
  data_confidence: "text",
  technical_fact_status: "jsonb",
  popularity_score: "integer",
  popularity_basis: "text[]",
  popularity_checked_at: "timestamptz",
  release_version: "text",
  release_published_at: "timestamptz",
  release_checked_at: "timestamptz",
  release_url: "text",
  surfaces: "text[]",
  summary_source: "text",
  summary_confidence: "text",
};

export const appColumns = Object.keys(appColumnTypes);
export const appArrayColumns = new Set([
  "database_types",
  "deployment_methods",
  "github_topics",
  "popularity_basis",
  "source_topics",
  "surfaces",
  "data_source_urls",
]);
export const appJsonColumns = new Set(["github_languages", "source_languages", "technical_fact_status"]);
export const appRecordsetColumns = appColumns.map((column) => `${column} ${appColumnTypes[column]}`);

export function appSqlValue(column, index) {
  const parameter = `$${index + 1}`;
  const type = appColumnTypes[column];
  if (type === "text[]" || type === "jsonb" || type.startsWith("public.")) {
    return `${parameter}::${type}`;
  }
  return parameter;
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined);
  return [];
}

export function sourceCodeHost(value) {
  if (!value) return "unknown";
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "github.com") return "github";
    if (host === "gitlab.com") return "gitlab";
    if (host === "codeberg.org") return "codeberg";
    return "other";
  } catch {
    return "unknown";
  }
}

export function licenseTypeFromSpdx(value) {
  const license = String(value ?? "").toUpperCase();
  if (!license || license === "NOASSERTION" || license === "OTHER") return "unknown";
  if (/COMMONS.CLAUSE|POLYFORM|SUSTAINABLE|LICENSEREF|-NC(?:-|$)|-ND(?:-|$)/.test(license)) return "custom";
  if (/^(MIT|APACHE-|BSD-|ISC|ZLIB|0BSD|POSTGRESQL)/.test(license)) return "permissive";
  if (/^(AGPL-|GPL-|LGPL-|MPL-|EUPL-|CECILL-|CC-BY-SA-)/.test(license)) return "copyleft";
  if (/^(UNLICENSE|CC0-)/.test(license)) return "public_domain";
  if (/\b( OR | AND |\+)\b/.test(license)) return "mixed";
  return "custom";
}

export function sourceModelFromSpdx(value) {
  const license = String(value ?? "").toUpperCase();
  if (!license || ["NOASSERTION", "OTHER"].includes(license)) return "unknown";
  if (/BUSL|SSPL|ELASTIC|POLYFORM|SUSTAINABLE|LICENSEREF|COMMONS.CLAUSE|-NC(?:-|$)|-ND(?:-|$)/.test(license)) {
    return "source_available";
  }
  return "open_source";
}

export function normalizeRecord(input) {
  const links = input.links ?? {};
  const github = input.github ?? {};
  const deployment = input.deployment ?? {};
  const resources = input.resources ?? {};
  const maintenance = input.maintenance ?? {};
  const sourceCodeUrl = input.source_code_url ?? input.repository_url ?? links.source_code_url ?? links.repository_url ?? null;

  return {
    slug: slugify(input.slug ?? input.name),
    name: input.name,
    summary: input.summary ?? input.description,
    icon_url: input.icon_url ?? input.media?.icon_url ?? null,
    icon_source_url: input.icon_source_url ?? input.media?.icon_source_url ?? null,
    website_url: input.website_url ?? links.website_url ?? null,
    source_code_url: sourceCodeUrl,
    source_code_host: input.source_code_host ?? sourceCodeHost(sourceCodeUrl),
    docs_url: input.docs_url ?? links.docs_url ?? null,
    install_docs_url: input.install_docs_url ?? links.install_docs_url ?? null,
    docker_url: input.docker_url ?? links.docker_url ?? null,
    license: input.license ?? null,
    license_type: input.license_type ?? "unknown",
    license_spdx_id: input.license_spdx_id ?? github.license_spdx_id ?? null,
    source_model: input.source_model ?? "unknown",
    publisher_name: input.publisher_name ?? null,
    publisher_type: input.publisher_type ?? "unknown",
    publisher_url: input.publisher_url ?? null,
    pricing_model: input.pricing_model ?? "unknown",
    published: Boolean(input.published),
    self_hosting_status: input.self_hosting_status ?? deployment.self_hosting_status ?? "unknown",
    maintenance_status: input.maintenance_status ?? maintenance.maintenance_status ?? "unknown",
    github_owner: input.github_owner ?? github.owner ?? null,
    github_repo: input.github_repo ?? github.repo ?? null,
    github_repo_id: input.github_repo_id ?? github.repo_id ?? null,
    github_project_id: input.github_project_id ?? null,
    github_node_id: input.github_node_id ?? github.node_id ?? null,
    github_full_name: input.github_full_name ?? github.full_name ?? null,
    github_owner_type: input.github_owner_type ?? github.owner_type ?? null,
    github_stars: input.github_stars ?? github.stars ?? null,
    github_forks: input.github_forks ?? github.forks ?? null,
    github_watchers: input.github_watchers ?? github.watchers ?? null,
    github_open_issues: input.github_open_issues ?? github.open_issues ?? null,
    github_primary_language: input.github_primary_language ?? github.primary_language ?? null,
    github_languages: input.github_languages ?? github.languages ?? {},
    github_topics: normalizeArray(input.github_topics ?? github.topics),
    github_created_at: input.github_created_at ?? github.created_at ?? null,
    github_updated_at: input.github_updated_at ?? github.updated_at ?? null,
    github_pushed_at: input.github_pushed_at ?? github.pushed_at ?? null,
    github_default_branch: input.github_default_branch ?? github.default_branch ?? null,
    github_repo_size_kb: input.github_repo_size_kb ?? github.repo_size_kb ?? null,
    github_archived: input.github_archived ?? github.archived ?? null,
    github_disabled: input.github_disabled ?? github.disabled ?? null,
    github_is_fork: input.github_is_fork ?? github.is_fork ?? null,
    github_is_template: input.github_is_template ?? github.is_template ?? null,
    source_repo_id: input.source_repo_id ?? input.github_repo_id ?? github.repo_id ?? null,
    source_full_name: input.source_full_name ?? input.github_full_name ?? github.full_name ?? null,
    source_stars: input.source_stars ?? input.github_stars ?? github.stars ?? null,
    source_forks: input.source_forks ?? input.github_forks ?? github.forks ?? null,
    source_watchers: input.source_watchers ?? input.github_watchers ?? github.watchers ?? null,
    source_open_issues: input.source_open_issues ?? input.github_open_issues ?? github.open_issues ?? null,
    source_primary_language: input.source_primary_language ?? input.github_primary_language ?? github.primary_language ?? null,
    source_languages: input.source_languages ?? input.github_languages ?? github.languages ?? {},
    source_topics: normalizeArray(input.source_topics ?? input.github_topics ?? github.topics),
    source_created_at: input.source_created_at ?? input.github_created_at ?? github.created_at ?? null,
    source_updated_at: input.source_updated_at ?? input.github_updated_at ?? github.updated_at ?? null,
    source_pushed_at: input.source_pushed_at ?? input.github_pushed_at ?? github.pushed_at ?? null,
    source_default_branch: input.source_default_branch ?? input.github_default_branch ?? github.default_branch ?? null,
    source_repo_size_kb: input.source_repo_size_kb ?? input.github_repo_size_kb ?? github.repo_size_kb ?? null,
    source_archived: input.source_archived ?? input.github_archived ?? github.archived ?? null,
    source_disabled: input.source_disabled ?? input.github_disabled ?? github.disabled ?? null,
    source_is_fork: input.source_is_fork ?? input.github_is_fork ?? github.is_fork ?? null,
    source_is_template: input.source_is_template ?? input.github_is_template ?? github.is_template ?? null,
    source_latest_release: input.source_latest_release ?? input.github_latest_release ?? github.latest_release ?? null,
    source_latest_release_at: input.source_latest_release_at ?? input.github_latest_release_at ?? github.latest_release_at ?? null,
    source_last_commit_at: input.source_last_commit_at ?? input.github_last_commit_at ?? github.last_commit_at ?? null,
    source_checked_at: input.source_checked_at ?? input.github_checked_at ?? github.checked_at ?? null,
    github_latest_release: input.github_latest_release ?? github.latest_release ?? null,
    github_latest_release_at: input.github_latest_release_at ?? github.latest_release_at ?? null,
    github_last_commit_at: input.github_last_commit_at ?? github.last_commit_at ?? null,
    github_checked_at: input.github_checked_at ?? github.checked_at ?? null,
    docker_support: input.docker_support ?? deployment.docker_support ?? "unknown",
    deployment_methods: normalizeArray(input.deployment_methods ?? deployment.methods),
    docker_image: input.docker_image ?? deployment.docker_image ?? null,
    compose_support: input.compose_support ?? deployment.compose_support ?? null,
    compose_url: input.compose_url ?? deployment.compose_url ?? null,
    requires_database: input.requires_database ?? deployment.requires_database ?? null,
    database_types: normalizeArray(input.database_types ?? deployment.database_types),
    ram_mb: input.ram_mb ?? resources.ram_mb ?? null,
    ram_min_mb: input.ram_min_mb ?? resources.ram_min_mb ?? null,
    ram_recommended_mb: input.ram_recommended_mb ?? resources.ram_recommended_mb ?? null,
    ram_default_limit_mb: input.ram_default_limit_mb ?? resources.ram_default_limit_mb ?? null,
    storage_profile: input.storage_profile ?? "unknown",
    storage_min_gb: input.storage_min_gb ?? resources.storage_min_gb ?? null,
    persistent_storage: input.persistent_storage ?? resources.persistent_storage ?? null,
    resource_requirement_kind: input.resource_requirement_kind ?? resources.requirement_kind ?? "unknown",
    technical_facts_checked_at: input.technical_facts_checked_at ?? null,
    data_source_urls: normalizeArray(input.data_source_urls ?? input.source_urls ?? [sourceCodeUrl, input.website_url ?? links.website_url, input.docs_url ?? links.docs_url, input.install_docs_url ?? links.install_docs_url]),
    data_checked_at: input.data_checked_at ?? null,
    data_confidence: input.data_confidence ?? "unknown",
    technical_fact_status: input.technical_fact_status ?? {},
    popularity_score: Number(input.popularity_score ?? 0),
    popularity_basis: normalizeArray(input.popularity_basis),
    popularity_checked_at: input.popularity_checked_at ?? null,
    release_version: input.release_version ?? maintenance.release_version ?? null,
    release_published_at: input.release_published_at ?? maintenance.release_published_at ?? null,
    release_checked_at: input.release_checked_at ?? maintenance.release_checked_at ?? null,
    release_url: input.release_url ?? maintenance.release_url ?? null,
    surfaces: normalizeArray(input.surfaces ?? input.platforms ?? deployment.supported_surfaces ?? deployment.supported_platforms),
    categories: normalizeArray(input.categories),
    summary_source: input.summary_source ?? "curated",
    summary_confidence: input.summary_confidence ?? "unknown",
  };
}

function validateUrl(value, field, errors) {
  if (!value) return;
  if (field === "icon_url" && String(value).startsWith("/")) return;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) errors.push(`${field} must be http(s)`);
  } catch {
    errors.push(`${field} is not a valid URL`);
  }
}

function validateEnum(value, field, values, errors) {
  if (!values.includes(value)) errors.push(`${field} must be one of: ${values.join(", ")}`);
}

export function validateRecord(input, { draft = false } = {}) {
  const record = normalizeRecord(input);
  const errors = [];
  const warnings = [];

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) errors.push("slug must be lowercase URL-safe text");
  if (!record.name) errors.push("name is required");
  if (!draft && record.categories.length === 0) errors.push("at least one category is required");
  if (record.published && record.source_model === "unknown") {
    errors.push("published apps require a reviewed source_model");
  }
  for (const category of record.categories) {
    if (!selfHostAppCategorySlugs.has(category)) {
      errors.push(`unknown category: ${category}`);
    }
  }

  const summaryResult = validateSummary(record.summary);
  errors.push(...summaryResult.errors);
  warnings.push(...summaryResult.warnings);

  validateEnum(record.publisher_type, "publisher_type", enumValues.publisher_type, errors);
  validateEnum(record.self_hosting_status, "self_hosting_status", enumValues.self_hosting_status, errors);
  validateEnum(record.license_type, "license_type", enumValues.license_type, errors);
  validateEnum(record.source_model, "source_model", enumValues.source_model, errors);
  validateEnum(record.pricing_model, "pricing_model", enumValues.pricing_model, errors);
  validateEnum(
    record.resource_requirement_kind,
    "resource_requirement_kind",
    enumValues.resource_requirement_kind,
    errors,
  );
  validateEnum(record.maintenance_status, "maintenance_status", enumValues.maintenance_status, errors);
  validateEnum(record.docker_support, "docker_support", enumValues.docker_support, errors);
  validateEnum(record.storage_profile, "storage_profile", enumValues.storage_profile, errors);
  validateEnum(record.summary_confidence, "summary_confidence", enumValues.confidence, errors);

  for (const field of [
    "icon_url",
    "icon_source_url",
    "website_url",
    "source_code_url",
    "docs_url",
    "install_docs_url",
    "docker_url",
    "compose_url",
    "publisher_url",
    "release_url",
  ]) {
    validateUrl(record[field], field, errors);
  }

  if (record.ram_min_mb !== null && record.ram_min_mb <= 0) errors.push("ram_min_mb must be positive");
  if (record.ram_recommended_mb !== null && record.ram_recommended_mb <= 0) {
    errors.push("ram_recommended_mb must be positive");
  }
  if (
    record.ram_min_mb !== null &&
    record.ram_recommended_mb !== null &&
    record.ram_recommended_mb < record.ram_min_mb
  ) {
    errors.push("ram_recommended_mb cannot be lower than ram_min_mb");
  }
  if (!Number.isInteger(record.popularity_score) || record.popularity_score < 0 || record.popularity_score > 100) {
    errors.push("popularity_score must be an integer from 0 to 100");
  }

  if (record.install_docs_url && record.website_url && record.install_docs_url === record.website_url) {
    warnings.push("install_docs_url should point to install or usage docs, not the homepage");
  }

  if (record.summary_source !== "curated" && !record.source_payload) {
    warnings.push("non-curated summaries should keep source_payload or field source metadata");
  }

  return { record, errors, warnings };
}
