import { readFile } from "node:fs/promises";
import { selfHostAppCategorySlugs } from "./categories.mjs";
import { slugify, validateSummary } from "./summary-rules.mjs";

export const enumValues = {
  docker_support: ["official", "community", "none", "unknown"],
  maintenance_status: ["active", "slow", "stale", "archived", "unknown"],
  publisher_type: ["company", "foundation", "community", "individual", "unknown"],
  storage_profile: ["tiny", "low", "medium", "high", "depends", "unknown"],
  confidence: ["high", "medium", "low", "unknown"],
};

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined);
  return [];
}

export function normalizeRecord(input) {
  const links = input.links ?? {};
  const github = input.github ?? {};
  const deployment = input.deployment ?? {};
  const resources = input.resources ?? {};
  const maintenance = input.maintenance ?? {};

  return {
    slug: slugify(input.slug ?? input.name),
    name: input.name,
    summary: input.summary ?? input.description,
    icon_url: input.icon_url ?? input.media?.icon_url ?? null,
    website_url: input.website_url ?? links.website_url ?? null,
    repository_url: input.repository_url ?? links.repository_url ?? links.source_code_url ?? null,
    docs_url: input.docs_url ?? links.docs_url ?? null,
    install_docs_url: input.install_docs_url ?? links.install_docs_url ?? null,
    docker_url: input.docker_url ?? links.docker_url ?? null,
    license: input.license ?? null,
    publisher_name: input.publisher_name ?? null,
    publisher_type: input.publisher_type ?? "unknown",
    publisher_url: input.publisher_url ?? null,
    published: Boolean(input.published),
    maintenance_status: input.maintenance_status ?? maintenance.maintenance_status ?? "unknown",
    github_owner: input.github_owner ?? github.owner ?? null,
    github_repo: input.github_repo ?? github.repo ?? null,
    github_stars: input.github_stars ?? github.stars ?? null,
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
    platforms: normalizeArray(input.platforms ?? deployment.supported_platforms),
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
  validateEnum(record.maintenance_status, "maintenance_status", enumValues.maintenance_status, errors);
  validateEnum(record.docker_support, "docker_support", enumValues.docker_support, errors);
  validateEnum(record.storage_profile, "storage_profile", enumValues.storage_profile, errors);
  validateEnum(record.summary_confidence, "summary_confidence", enumValues.confidence, errors);

  for (const field of ["icon_url", "website_url", "repository_url", "docs_url", "install_docs_url", "docker_url", "publisher_url"]) {
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
