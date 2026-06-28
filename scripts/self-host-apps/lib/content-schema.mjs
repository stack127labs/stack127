import { readFile } from "node:fs/promises";
import path from "node:path";

export const repoRoot = process.cwd();
export const categoriesPath = path.join(repoRoot, "content/categories.json");

export const enumValues = {
  status: ["draft", "published", "archived"],
  docker_support: ["official", "community", "none", "unknown"],
  maintenance_status: ["active", "slow_but_alive", "possibly_stale", "archived", "unknown"],
  backup_difficulty: ["very_easy", "easy", "moderate", "hard", "expert", "unknown"],
  backup_criticality: ["low", "medium", "high", "critical", "unknown"],
  data_confidence: ["high", "medium", "low", "unknown"],
};

const manualRequiredTextFields = [
  "slug",
  "name",
  "description",
  "editorial.get_started",
  "editorial.verdict",
  "data.storage_and_data_notes",
  "data.backup_details",
  "data.raid_notes",
  "links.source_code_url",
  "links.install_docs_url",
  "links.docs_url",
  "notes",
];

const noEmDashTextFields = [
  "description",
  "editorial.get_started",
  "editorial.verdict",
  "data.storage_and_data_notes",
  "data.backup_details",
  "data.raid_notes",
  "notes",
];

const requiredArrays = [
  "categories",
  "editorial.good_fit",
  "editorial.watch_outs",
  "editorial.known_issues",
  "deployment.deployment_methods",
  "deployment.supported_platforms",
];

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function readCategories() {
  return readJson(categoriesPath);
}

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      args[rawKey] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[rawKey] = true;
      continue;
    }

    args[rawKey] = next;
    index += 1;
  }

  return args;
}

export function getPath(source, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => {
    if (value === null || value === undefined) return undefined;
    return value[key];
  }, source);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isEmptyText(value) {
  return typeof value !== "string" || value.trim().length === 0;
}

function containsPlaceholder(value) {
  return typeof value === "string" && /\b(TODO|TBD|RESEARCH|VERIFY|FILL_ME)\b/i.test(value);
}

function validateUrl(value, fieldName, errors, { allowNull = true } = {}) {
  if (value === null || value === undefined || value === "") {
    if (!allowNull) errors.push(`${fieldName} is required`);
    return;
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push(`${fieldName} must be an http(s) URL`);
    }
  } catch {
    errors.push(`${fieldName} is not a valid URL`);
  }
}

function validateEnum(app, dottedPath, values, errors) {
  const value = getPath(app, dottedPath);
  if (value === null || value === undefined) return;
  if (!values.includes(value)) {
    errors.push(`${dottedPath} must be one of: ${values.join(", ")}`);
  }
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function nullable(value) {
  return value === undefined ? null : value;
}

export function validateAppContent(app, categories, options = {}) {
  const strict = options.strict !== false;
  const errors = [];
  const warnings = [];
  const categorySlugs = new Set(categories.map((category) => category.slug));

  if (!isPlainObject(app)) {
    return { errors: ["App content must be a JSON object"], warnings };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app.slug ?? "")) {
    errors.push("slug must be lowercase URL-safe text");
  }

  for (const fieldName of manualRequiredTextFields) {
    const value = getPath(app, fieldName);
    if (strict && (isEmptyText(value) || containsPlaceholder(value))) {
      errors.push(`${fieldName} is required and cannot be placeholder text`);
    }
  }

  for (const fieldName of noEmDashTextFields) {
    const value = getPath(app, fieldName);
    if (typeof value === "string" && value.includes("—")) {
      errors.push(`${fieldName} contains an em dash`);
    }
  }

  if (typeof app.name === "string" && app.name === app.name.toLowerCase()) {
    warnings.push("name is fully lowercase; verify official product capitalization");
  }

  if (typeof app.description === "string") {
    if (app.description.length > 170) warnings.push("description is longer than 170 characters");
    if (/\b(open[- ]source|self[- ]hosted)\b/i.test(app.description)) {
      warnings.push("description mentions open source or self-hosted; only keep that if it is essential");
    }
  }

  for (const fieldName of requiredArrays) {
    const value = getPath(app, fieldName);
    if (strict && (!Array.isArray(value) || value.length === 0)) {
      errors.push(`${fieldName} must be a non-empty array`);
    }
  }

  if (Array.isArray(app.categories)) {
    for (const category of app.categories) {
      if (!categorySlugs.has(category)) errors.push(`Unknown category: ${category}`);
    }
  }

  validateEnum(app, "status", enumValues.status, errors);
  validateEnum(app, "deployment.docker_support", enumValues.docker_support, errors);
  validateEnum(app, "maintenance.maintenance_status", enumValues.maintenance_status, errors);
  validateEnum(app, "data.backup_difficulty", enumValues.backup_difficulty, errors);
  validateEnum(app, "data.backup_criticality", enumValues.backup_criticality, errors);
  validateEnum(app, "data_confidence", enumValues.data_confidence, errors);

  for (const fieldName of [
    "links.website_url",
    "links.source_code_url",
    "links.demo_url",
    "links.docker_url",
    "links.install_docs_url",
    "links.docs_url",
    "media.youtube_video_url",
    "media.icon_url",
  ]) {
    validateUrl(getPath(app, fieldName), fieldName, errors);
  }

  const screenshots = app.media?.screenshots;
  if (strict && (!Array.isArray(screenshots) || screenshots.length === 0)) {
    warnings.push("media.screenshots is empty; keep only if no official screenshots are available");
  }

  if (Array.isArray(screenshots)) {
    screenshots.forEach((screenshot, index) => {
      validateUrl(screenshot.url, `media.screenshots[${index}].url`, errors, { allowNull: false });
      if (isEmptyText(screenshot.caption)) warnings.push(`media.screenshots[${index}].caption is empty`);
      if (isEmptyText(screenshot.source)) warnings.push(`media.screenshots[${index}].source is empty`);
    });
  }

  if (Array.isArray(app.client_apps)) {
    app.client_apps.forEach((clientApp, index) => {
      if (isEmptyText(clientApp.platform)) warnings.push(`client_apps[${index}].platform is empty`);
      validateUrl(clientApp.url, `client_apps[${index}].url`, errors, { allowNull: false });
      if (typeof clientApp.official !== "boolean") {
        const message = `client_apps[${index}].official should be true or false`;
        if (strict) errors.push(message);
        else warnings.push(message);
      }
    });

    if (
      app.client_apps.length > 0 &&
      typeof app.notes === "string" &&
      /\bnot independently (fetched|verified|checked)\b/i.test(app.notes)
    ) {
      warnings.push("notes mention an unverified client app link; verify before promoting this record");
    }
  }

  if (app.links?.source_code_url?.includes("github.com/")) {
    if (isEmptyText(app.github?.owner) || isEmptyText(app.github?.repo)) {
      errors.push("github.owner and github.repo are required for GitHub source repos");
    }
  }

  if (app.deployment?.docker_support === "official" && isEmptyText(app.links?.docker_url)) {
    warnings.push("deployment.docker_support is official but links.docker_url is empty");
  }

  return { errors, warnings };
}

export function appContentToDbRow(app) {
  return {
    slug: app.slug,
    name: app.name,
    description: app.description,
    status: app.status ?? "draft",
    screenshots: normalizeArray(app.media?.screenshots),
    youtube_video_url: nullable(app.media?.youtube_video_url),
    get_started: nullable(app.editorial?.get_started),
    verdict: nullable(app.editorial?.verdict),
    best_for: normalizeArray(app.editorial?.good_fit),
    not_best_for: normalizeArray(app.editorial?.watch_outs),
    good_fit: normalizeArray(app.editorial?.good_fit),
    watch_outs: normalizeArray(app.editorial?.watch_outs),
    known_issues: normalizeArray(app.editorial?.known_issues),
    website_url: nullable(app.links?.website_url),
    source_code_url: nullable(app.links?.source_code_url),
    demo_url: nullable(app.links?.demo_url),
    docker_url: nullable(app.links?.docker_url),
    install_docs_url: nullable(app.links?.install_docs_url),
    docs_url: nullable(app.links?.docs_url),
    deployment_methods: normalizeArray(app.deployment?.deployment_methods),
    docker_support: nullable(app.deployment?.docker_support),
    compose_support: nullable(app.deployment?.compose_support),
    requires_database: nullable(app.deployment?.requires_database),
    database_types: normalizeArray(app.deployment?.database_types),
    requires_redis: nullable(app.deployment?.requires_redis),
    requires_object_storage: nullable(app.deployment?.requires_object_storage),
    supported_platforms: normalizeArray(app.deployment?.supported_platforms),
    ram_required_mb: nullable(app.resources?.ram_required_mb),
    ram_recommended_mb: nullable(app.resources?.ram_recommended_mb),
    storage_required_gb: nullable(app.resources?.storage_required_gb),
    storage_and_data_notes: nullable(app.data?.storage_and_data_notes),
    cpu_notes: nullable(app.resources?.cpu_notes),
    gpu_notes: nullable(app.resources?.gpu_notes),
    backup_details: nullable(app.data?.backup_details),
    backup_difficulty: nullable(app.data?.backup_difficulty),
    backup_criticality: nullable(app.data?.backup_criticality),
    raid_notes: nullable(app.data?.raid_notes),
    actively_maintained: nullable(app.maintenance?.actively_maintained),
    maintenance_status: nullable(app.maintenance?.maintenance_status),
    last_release_at: nullable(app.maintenance?.last_release_at),
    last_commit_at: nullable(app.maintenance?.last_commit_at),
    license: nullable(app.license),
    icon_url: nullable(app.media?.icon_url),
    icon_source: nullable(app.media?.icon_source),
    github_owner: nullable(app.github?.owner),
    github_repo: nullable(app.github?.repo),
    github_stars: nullable(app.github?.stars),
    github_forks: nullable(app.github?.forks),
    github_open_issues: nullable(app.github?.open_issues),
    github_open_pull_requests: nullable(app.github?.open_pull_requests),
    github_latest_release: nullable(app.github?.latest_release),
    github_latest_release_at: nullable(app.github?.latest_release_at),
    github_last_commit_at: nullable(app.github?.last_commit_at),
    github_commit_count_90d: nullable(app.github?.commit_count_90d),
    github_release_count_90d: nullable(app.github?.release_count_90d),
    github_release_count: nullable(app.github?.release_count),
    github_updated_at: nullable(app.github?.updated_at),
    github_checked_at: nullable(app.github?.checked_at),
    alternative_app_ids: normalizeArray(app.alternative_app_ids),
    replaces_apps: normalizeArray(app.replaces_apps),
    client_apps: normalizeArray(app.client_apps),
    hardware_recommendations: normalizeArray(app.hardware_recommendations),
    data_confidence: nullable(app.data_confidence),
    notes: nullable(app.notes),
    published: Boolean(app.published),
    last_checked_at: nullable(app.last_checked_at),
  };
}
