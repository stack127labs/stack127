import { readFile } from "node:fs/promises";
import { selfHostAppCategorySlugs } from "./categories.mjs";
import { slugify, validateSummary } from "./summary-rules.mjs";

export const enumValues = {
  docker_support: ["official", "community", "none", "unknown"],
  license_type: ["permissive", "copyleft", "public_domain", "mixed", "custom", "unknown"],
  maintenance_status: ["active", "slow", "stale", "archived", "unknown"],
  publisher_type: ["company", "foundation", "community", "individual", "unknown"],
  self_hosting_status: ["self_hostable", "not_self_hostable", "unknown"],
  storage_profile: ["tiny", "low", "medium", "high", "depends", "unknown"],
  confidence: ["high", "medium", "low", "unknown"],
};

export const projectColumnTypes = {
  slug: "text",
  name: "text",
  summary: "text",
  icon_url: "text",
  website_url: "text",
  source_code_url: "text",
  source_code_host: "text",
  docs_url: "text",
  install_docs_url: "text",
  docker_url: "text",
  license: "text",
  license_type: "public.open_project_license_type",
  license_spdx_id: "text",
  publisher_name: "text",
  publisher_type: "text",
  publisher_url: "text",
  published: "boolean",
  self_hosting_status: "public.open_project_self_hosting_status",
  maintenance_status: "text",
  github_owner: "text",
  github_repo: "text",
  github_repo_id: "bigint",
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
  github_latest_release: "text",
  github_latest_release_at: "timestamptz",
  github_last_commit_at: "timestamptz",
  github_checked_at: "timestamptz",
  docker_support: "text",
  compose_support: "boolean",
  requires_database: "boolean",
  database_types: "text[]",
  ram_mb: "integer",
  storage_profile: "text",
  surfaces: "text[]",
  summary_source: "text",
  summary_confidence: "text",
};

export const projectColumns = Object.keys(projectColumnTypes);
export const projectArrayColumns = new Set(["database_types", "github_topics", "surfaces"]);
export const projectJsonColumns = new Set(["github_languages"]);
export const projectRecordsetColumns = projectColumns.map((column) => `${column} ${projectColumnTypes[column]}`);

export function projectSqlValue(column, index) {
  const parameter = `$${index + 1}`;
  const type = projectColumnTypes[column];
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
  if (/^(MIT|APACHE-|BSD-|ISC|ZLIB|0BSD)/.test(license)) return "permissive";
  if (/^(AGPL-|GPL-|LGPL-|MPL-|EUPL-|CECILL-)/.test(license)) return "copyleft";
  if (/^(UNLICENSE|CC0-)/.test(license)) return "public_domain";
  if (/\b( OR | AND |\+)\b/.test(license)) return "mixed";
  return "custom";
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
    website_url: input.website_url ?? links.website_url ?? null,
    source_code_url: sourceCodeUrl,
    source_code_host: input.source_code_host ?? sourceCodeHost(sourceCodeUrl),
    docs_url: input.docs_url ?? links.docs_url ?? null,
    install_docs_url: input.install_docs_url ?? links.install_docs_url ?? null,
    docker_url: input.docker_url ?? links.docker_url ?? null,
    license: input.license ?? null,
    license_type: input.license_type ?? "unknown",
    license_spdx_id: input.license_spdx_id ?? github.license_spdx_id ?? null,
    publisher_name: input.publisher_name ?? null,
    publisher_type: input.publisher_type ?? "unknown",
    publisher_url: input.publisher_url ?? null,
    published: Boolean(input.published),
    self_hosting_status: input.self_hosting_status ?? deployment.self_hosting_status ?? "self_hostable",
    maintenance_status: input.maintenance_status ?? maintenance.maintenance_status ?? "unknown",
    github_owner: input.github_owner ?? github.owner ?? null,
    github_repo: input.github_repo ?? github.repo ?? null,
    github_repo_id: input.github_repo_id ?? github.repo_id ?? null,
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
    github_latest_release: input.github_latest_release ?? github.latest_release ?? null,
    github_latest_release_at: input.github_latest_release_at ?? github.latest_release_at ?? null,
    github_last_commit_at: input.github_last_commit_at ?? github.last_commit_at ?? null,
    github_checked_at: input.github_checked_at ?? github.checked_at ?? null,
    docker_support: input.docker_support ?? deployment.docker_support ?? "unknown",
    compose_support: input.compose_support ?? deployment.compose_support ?? null,
    requires_database: input.requires_database ?? deployment.requires_database ?? null,
    database_types: normalizeArray(input.database_types ?? deployment.database_types),
    ram_mb: input.ram_mb ?? resources.ram_mb ?? resources.ram_recommended_mb ?? null,
    storage_profile: input.storage_profile ?? "unknown",
    surfaces: normalizeArray(input.surfaces ?? input.platforms ?? deployment.supported_surfaces ?? deployment.supported_platforms),
    categories: normalizeArray(input.categories),
    summary_source: input.summary_source ?? "curated",
    summary_confidence: input.summary_confidence ?? "unknown",
    field_sources: normalizeArray(input.field_sources),
    source_payload: input.source_payload ?? null,
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
  validateEnum(record.maintenance_status, "maintenance_status", enumValues.maintenance_status, errors);
  validateEnum(record.docker_support, "docker_support", enumValues.docker_support, errors);
  validateEnum(record.storage_profile, "storage_profile", enumValues.storage_profile, errors);
  validateEnum(record.summary_confidence, "summary_confidence", enumValues.confidence, errors);

  for (const field of ["icon_url", "website_url", "source_code_url", "docs_url", "install_docs_url", "docker_url", "publisher_url"]) {
    validateUrl(record[field], field, errors);
  }

  if (record.install_docs_url && record.website_url && record.install_docs_url === record.website_url) {
    warnings.push("install_docs_url should point to install or usage docs, not the homepage");
  }

  if (record.summary_source !== "curated" && !record.source_payload) {
    warnings.push("non-curated summaries should keep source_payload or field source metadata");
  }

  return { record, errors, warnings };
}
