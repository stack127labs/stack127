#!/usr/bin/env node

import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { parseRepo } from "./lib/github.mjs";
import { licenseTypeFromSpdx, projectColumns, projectSqlValue } from "./lib/schema.mjs";
import { rewriteSummaryFromInputs } from "./lib/summary-rules.mjs";

const githubApiBase = "https://api.github.com";
let cachedGithubToken;

function githubToken() {
  if (cachedGithubToken !== undefined) return cachedGithubToken;
  if (process.env.GITHUB_TOKEN) {
    cachedGithubToken = process.env.GITHUB_TOKEN;
    return cachedGithubToken;
  }

  try {
    cachedGithubToken = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    cachedGithubToken = "";
  }

  return cachedGithubToken;
}

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.apps)) return input.apps;
  if (Array.isArray(input.candidates)) return input.candidates;
  return [input];
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "version127-self-host-apps",
  };
  const token = githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function githubJson(pathName, searchParams) {
  const url = new URL(`${githubApiBase}${pathName}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${url.href}`);
  return response.json();
}

async function optionalGithubJson(pathName, searchParams) {
  try {
    return await githubJson(pathName, searchParams);
  } catch {
    return null;
  }
}

function decodeBase64(value) {
  if (!value) return "";
  return Buffer.from(value.replace(/\s+/g, ""), "base64").toString("utf8");
}

function latestStableRelease(releases) {
  return (
    releases?.find((release) => !release.draft && !release.prerelease) ??
    releases?.find((release) => !release.draft) ??
    null
  );
}

function cleanUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href.replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

function isDocsUrl(value) {
  if (!value) return false;
  return /docs|documen|readthedocs|gitbook|guide|manual|wiki/i.test(value);
}

function githubBlobUrl(repoUrl, branch, filePath) {
  return `${repoUrl}/blob/${encodeURIComponent(branch)}/${filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function findFirstFile(tree, patterns) {
  return tree.find((item) => {
    if (item.type !== "blob") return false;
    return patterns.some((pattern) => pattern.test(item.path));
  });
}

function detectDatabases(text) {
  const databases = [];
  if (/\bpostgres(?:ql)?\b/i.test(text)) databases.push("postgres");
  if (/\bmysql\b/i.test(text)) databases.push("mysql");
  if (/\bmariadb\b/i.test(text)) databases.push("mariadb");
  if (/\bmongo(?:db)?\b/i.test(text)) databases.push("mongodb");
  if (/\bredis\b/i.test(text)) databases.push("redis");
  if (/\bsqlite\b/i.test(text)) databases.push("sqlite");
  return [...new Set(databases)];
}

function storageProfile(app, text) {
  const categories = new Set(app.categories ?? []);
  if (categories.has("media-servers") || categories.has("photos-galleries") || categories.has("storage-backup")) return "high";
  if (categories.has("file-sharing-sync") || categories.has("documents-pdfs") || categories.has("ebooks-libraries")) return "medium";
  if (categories.has("bookmarks-read-it-later") || categories.has("knowledge-notes") || categories.has("wikis")) return "low";
  if (/\b(photo|video|media|backup|object storage|s3|archive)\b/i.test(text)) return "high";
  if (/\b(file|document|ebook|book|pdf)\b/i.test(text)) return "medium";
  return "low";
}

function summaryScore(value) {
  const text = String(value ?? "");
  let score = 0;
  if (!text.trim()) score += 100;
  if (text.length > 145) score += 20;
  if (/,\s+[A-Z]/.test(text)) score += 12;
  if (/[^\x00-\x7F]/.test(text)) score += 8;
  if (/\b(alternative to|mirror of|angular|nestjs|typescript|laravel \d+|for 20\d{2})\b/i.test(text)) score += 10;
  if (/\b(open[- ]source|self[- ]hosted|solution|platform|powerful|ultimate|seamless|robust)\b/i.test(text)) score += 8;
  return score;
}

function cleanSummary(value, name) {
  let text = rewriteSummaryFromInputs({
    name,
    description: value,
    topics: [],
  });

  text = text
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\bfor 20\d{2}\b/gi, "")
    .replace(/\s*\(mirror of [^)]+\)/gi, "")
    .replace(/\bfree\s+\(as in free speech\)\s+/gi, "")
    .replace(/\bfree\s+/gi, "")
    .replace(/\s*,\s*(It|This|The|A|An)\s+(is|allows|lets|can|has)\b.*$/i, "")
    .replace(/\s*-\s*\(mirror of .+$/i, "")
    .replace(/\s*-\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!/[.!?]$/.test(text)) text = `${text}.`;
  return text;
}

function ramEstimate(app, text) {
  const explicit = text.match(/\b(\d{3,5})\s*(?:mb|mib)\b/i);
  if (explicit) return Number(explicit[1]);
  const gb = text.match(/\b([1-9]\d?)\s*(?:gb|gib)\b/i);
  if (gb) return Number(gb[1]) * 1024;

  const categories = new Set(app.categories ?? []);
  if (categories.has("media-servers") || categories.has("photos-galleries") || categories.has("ai-ml")) return 1024;
  if (categories.has("databases") || categories.has("system-admin-hosting")) return 512;
  return 256;
}

function maintenanceStatus(repo, lastCommitAt) {
  if (repo.archived) return "archived";
  if (!lastCommitAt) return "unknown";
  const days = (Date.now() - new Date(lastCommitAt).getTime()) / 86_400_000;
  if (days <= 365) return "active";
  if (days <= 730) return "slow";
  return "stale";
}

function publisherType(owner) {
  if (owner?.type === "User") return "individual";
  if (owner?.type === "Organization") return "community";
  return "unknown";
}

function summaryFor(app, repo) {
  const existing = cleanSummary(app.summary ?? app.summary_raw, app.name);
  const github = cleanSummary(repo.description, app.name);
  return summaryScore(existing) <= summaryScore(github) ? existing : github;
}

function docsFor(app, repo) {
  const website = cleanUrl(repo.homepage) ?? cleanUrl(app.website_url);
  if (isDocsUrl(app.docs_url)) return cleanUrl(app.docs_url);
  if (isDocsUrl(website)) return website;
  if (isDocsUrl(app.website_url)) return cleanUrl(app.website_url);
  return null;
}

async function enrichApp(app) {
  const parsed = parseRepo(app.source_code_url);
  const repo = await githubJson(`/repos/${parsed.owner}/${parsed.repo}`);
  const repoUrl = repo.html_url;
  const languages = await optionalGithubJson(`/repos/${parsed.owner}/${parsed.repo}/languages`);
  const releases = await optionalGithubJson(`/repos/${parsed.owner}/${parsed.repo}/releases`, { per_page: 20 });
  const latestRelease = latestStableRelease(releases);
  const commits = await optionalGithubJson(`/repos/${parsed.owner}/${parsed.repo}/commits`, {
    per_page: 1,
    sha: repo.default_branch,
  });
  const readme = await optionalGithubJson(`/repos/${parsed.owner}/${parsed.repo}/readme`);
  const readmeText = decodeBase64(readme?.content);
  const treeData = await optionalGithubJson(`/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(repo.default_branch)}`, {
    recursive: 1,
  });
  const tree = Array.isArray(treeData?.tree) ? treeData.tree : [];
  const combinedText = `${repo.description ?? ""}\n${readmeText}\n${tree.map((item) => item.path).join("\n")}`;

  const composeFile = findFirstFile(tree, [/docker-compose[^/]*\.ya?ml$/i, /compose[^/]*\.ya?ml$/i]);
  const dockerFile = findFirstFile(tree, [/(^|\/)Dockerfile$/i, /(^|\/)Containerfile$/i]);
  const dockerFileUrl = composeFile
    ? githubBlobUrl(repoUrl, repo.default_branch, composeFile.path)
    : dockerFile
      ? githubBlobUrl(repoUrl, repo.default_branch, dockerFile.path)
      : null;
  const hasDocker = Boolean(dockerFileUrl) || hasAny(combinedText, [/\bdocker\b/i, /\bcontainer\b/i]);
  const dbTypes = detectDatabases(combinedText);
  const externalDbTypes = dbTypes.filter((db) => db !== "sqlite" && db !== "redis");
  const lastCommitAt = commits?.[0]?.commit?.committer?.date ?? null;
  const docsUrl = docsFor(app, repo);
  const installDocsUrl = app.install_docs_url && isDocsUrl(app.install_docs_url)
    ? cleanUrl(app.install_docs_url)
    : hasAny(combinedText, [/\binstall\b/i, /\bdeployment\b/i, /\bdocker compose\b/i])
      ? `${repoUrl}#readme`
      : `${repoUrl}#readme`;

  const iconPath = path.join("public", "app-icons", `${app.slug}.png`);
  const localIconUrl = existsSync(iconPath) ? `/app-icons/${app.slug}.png` : null;
  const licenseSpdxId = repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION"
    ? repo.license.spdx_id
    : app.license_spdx_id ?? null;

  return {
    _candidate_id: app.id ?? null,
    slug: app.slug,
    name: app.name,
    summary: summaryFor(app, repo),
    icon_url: app.icon_url ?? localIconUrl ?? repo.owner?.avatar_url ?? null,
    website_url: cleanUrl(repo.homepage) ?? cleanUrl(app.website_url) ?? repoUrl,
    source_code_url: repoUrl,
    source_code_host: "github",
    docs_url: docsUrl ?? installDocsUrl,
    install_docs_url: installDocsUrl,
    docker_url: app.docker_url ?? dockerFileUrl ?? (hasDocker ? `${repoUrl}#readme` : null),
    license: licenseSpdxId ?? app.license,
    license_type: licenseTypeFromSpdx(licenseSpdxId ?? app.license),
    license_spdx_id: licenseSpdxId,
    publisher_name: repo.owner?.login ?? app.publisher_name,
    publisher_type: publisherType(repo.owner),
    publisher_url: repo.owner?.html_url ?? app.publisher_url,
    published: true,
    self_hosting_status: app.self_hosting_status ?? "unknown",
    maintenance_status: maintenanceStatus(repo, lastCommitAt),
    github_owner: parsed.owner,
    github_repo: parsed.repo,
    github_repo_id: repo.id ?? null,
    github_node_id: repo.node_id ?? null,
    github_full_name: repo.full_name ?? `${parsed.owner}/${parsed.repo}`,
    github_owner_type: repo.owner?.type ?? null,
    github_stars: repo.stargazers_count,
    github_forks: repo.forks_count ?? null,
    github_watchers: repo.subscribers_count ?? repo.watchers_count ?? null,
    github_open_issues: repo.open_issues_count ?? null,
    github_primary_language: repo.language ?? null,
    github_languages: languages ?? {},
    github_topics: Array.isArray(repo.topics) ? repo.topics : [],
    github_created_at: repo.created_at ?? null,
    github_updated_at: repo.updated_at ?? null,
    github_pushed_at: repo.pushed_at ?? null,
    github_default_branch: repo.default_branch ?? null,
    github_repo_size_kb: repo.size ?? null,
    github_archived: repo.archived ?? null,
    github_disabled: repo.disabled ?? null,
    github_is_fork: repo.fork ?? null,
    github_is_template: repo.is_template ?? null,
    github_latest_release: latestRelease?.tag_name ?? app.github_latest_release,
    github_latest_release_at: latestRelease?.published_at ?? app.github_latest_release_at,
    github_last_commit_at: lastCommitAt,
    github_checked_at: new Date().toISOString(),
    docker_support: hasDocker ? "official" : "unknown",
    compose_support: composeFile ? true : hasDocker ? false : null,
    requires_database: externalDbTypes.length > 0 ? true : dbTypes.includes("sqlite") ? false : null,
    database_types: dbTypes,
    ram_mb: ramEstimate(app, combinedText),
    storage_profile: storageProfile(app, combinedText),
    surfaces: [...new Set([...(app.surfaces ?? app.surfaces_raw ?? app.platforms ?? []), "web"])],
    categories: app.categories ?? [],
    summary_source: "version127_enriched",
    summary_confidence: "medium",
    _field_sources: [
      "summary",
      "website_url",
      "source_code_url",
      "source_code_host",
      "docs_url",
      "install_docs_url",
      "docker_url",
      "license",
      "license_type",
      "license_spdx_id",
      "publisher_name",
      "publisher_type",
      "publisher_url",
      "self_hosting_status",
      "maintenance_status",
      "github_repo_id",
      "github_node_id",
      "github_full_name",
      "github_owner_type",
      "github_stars",
      "github_forks",
      "github_watchers",
      "github_open_issues",
      "github_primary_language",
      "github_languages",
      "github_topics",
      "github_created_at",
      "github_updated_at",
      "github_pushed_at",
      "github_default_branch",
      "github_repo_size_kb",
      "github_archived",
      "github_disabled",
      "github_is_fork",
      "github_is_template",
      "github_latest_release",
      "github_latest_release_at",
      "github_last_commit_at",
      "github_checked_at",
      "docker_support",
      "compose_support",
      "requires_database",
      "database_types",
      "ram_mb",
      "storage_profile",
      "surfaces",
      "categories",
    ],
    _source_url: repoUrl,
    _note: `GitHub API, README, and repository tree checked on ${new Date().toISOString().slice(0, 10)}.`,
  };
}

async function replaceCategoryLinks(client, appSlug, categories) {
  const appResult = await client.query("select id from public.open_projects where slug = $1", [appSlug]);
  const appId = appResult.rows[0]?.id;
  if (!appId) throw new Error(`Missing app row: ${appSlug}`);

  await client.query("delete from public.open_project_categories_join_table where project_id = $1", [appId]);
  const categoryResult = await client.query(
    "select id, slug from public.open_project_categories where slug = any($1::text[])",
    [categories],
  );
  const ids = new Map(categoryResult.rows.map((row) => [row.slug, row.id]));
  const missing = categories.filter((slug) => !ids.has(slug));
  if (missing.length > 0) throw new Error(`Missing categories for ${appSlug}: ${missing.join(", ")}`);

  for (const slug of categories) {
    await client.query(
      `
        insert into public.open_project_categories_join_table (project_id, category_id)
        values ($1, $2)
        on conflict (project_id, category_id) do nothing
      `,
      [appId, ids.get(slug)],
    );
  }

  return appId;
}

async function writeFieldSources(client, appId, record) {
  for (const fieldName of record._field_sources) {
    await client.query(
      `
        insert into public.open_project_field_sources (
          project_id,
          field_name,
          source,
          source_url,
          confidence,
          checked_at,
          note
        )
        values ($1, $2, 'version127_enrichment', $3, 'medium', now(), $4)
        on conflict (project_id, field_name) do update set
          source = excluded.source,
          source_url = excluded.source_url,
          confidence = excluded.confidence,
          checked_at = excluded.checked_at,
          note = excluded.note
      `,
      [appId, fieldName, record._source_url, record._note],
    );
  }
}

async function upsertEnriched(client, record) {
  const values = projectColumns.map((column) => record[column]);
  const updates = projectColumns
    .filter((column) => column !== "slug")
    .map((column) => `${column} = excluded.${column}`)
    .join(",\n          ");

  const result = await client.query(
    `
      insert into public.open_projects (${projectColumns.join(", ")})
      values (${projectColumns.map(projectSqlValue).join(", ")})
      on conflict (slug) do update set
        ${updates},
        updated_at = now()
      returning id
    `,
    values,
  );

  const appId = await replaceCategoryLinks(client, record.slug, record.categories);
  await writeFieldSources(client, appId ?? result.rows[0].id, record);
  if (record._candidate_id) {
    await client.query(
      `
        update public.open_project_candidates
        set status = 'published',
            enriched_project_id = $2,
            self_hosting_status = $3::public.open_project_self_hosting_status,
            updated_at = now()
        where id = $1
      `,
      [record._candidate_id, appId ?? result.rows[0].id, record.self_hosting_status],
    );
  }
}

async function main() {
  const args = parseArgs();
  if (!args.file) {
    console.error("Usage: npm run self-host-apps:enrich-github-batch -- --file batch.json [--overrides reviewed.json] [--limit 100] [--dry-run]");
    process.exit(1);
  }

  const input = JSON.parse(await readFile(args.file, "utf8"));
  const overridesInput = args.overrides
    ? JSON.parse(await readFile(args.overrides, "utf8"))
    : {};
  const overrides = overridesInput.overrides ?? overridesInput;
  const records = recordsFromInput(input);
  const limit = numberArg(args, "limit", records.length);
  const selected = records.slice(0, limit);
  const enriched = [];
  const failed = [];

  for (const app of selected) {
    try {
      const record = await enrichApp(app);
      const override = overrides[app.slug] ?? {};
      if (override.summary) record.summary = override.summary;
      if (Array.isArray(override.categories)) record.categories = override.categories;
      if (override.storage_profile) record.storage_profile = override.storage_profile;
      if (override.ram_mb) record.ram_mb = override.ram_mb;
      for (const field of [
        "website_url",
        "docs_url",
        "install_docs_url",
        "docker_url",
        "publisher_name",
        "publisher_type",
        "publisher_url",
        "license",
        "license_type",
        "license_spdx_id",
        "self_hosting_status",
        "maintenance_status",
        "docker_support",
        "summary_confidence",
      ]) {
        if (override[field] !== undefined) record[field] = override[field];
      }
      for (const field of ["surfaces", "database_types"]) {
        if (Array.isArray(override[field])) record[field] = override[field];
      }
      for (const field of ["compose_support", "requires_database"]) {
        if (typeof override[field] === "boolean" || override[field] === null) record[field] = override[field];
      }
      if (record.self_hosting_status === "unknown") {
        throw new Error("self_hosting_status must be verified before publication");
      }
      if (override.note) record._note = `${record._note} ${override.note}`;
      enriched.push(record);
      console.log(`Enriched: ${app.slug}`);
    } catch (error) {
      failed.push({ id: app.id ?? null, slug: app.slug, error: error.message });
      console.warn(`warning ${app.slug}: ${error.message}`);
    }
  }

  await withClient(async (client) => {
    await client.query("begin");
    for (const record of enriched) {
      await upsertEnriched(client, record);
    }
    for (const failure of failed) {
      if (!failure.id) continue;
      await client.query(
        `
          update public.open_project_candidates
          set status = 'needs_review', updated_at = now()
          where id = $1
        `,
        [failure.id],
      );
    }

    if (args["dry-run"]) {
      await client.query("rollback");
    } else {
      await client.query("commit");
    }
  }, args["database-url"]);

  console.log(
    JSON.stringify(
      {
        mode: args["dry-run"] ? "dry-run" : "write",
        selected: selected.length,
        enriched: enriched.length,
        failed,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
