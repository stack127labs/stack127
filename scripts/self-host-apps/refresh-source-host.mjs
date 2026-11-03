#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { licenseTypeFromSpdx } from "./lib/schema.mjs";
import { pathToFileURL } from "node:url";
import { jobSummary } from "./lib/job-summary.mjs";
import { refreshFailed } from "./lib/refresh-health.mjs";

import { derivedPatch, starRecipientCtes, starRecipientColumn } from "./lib/popularity.mjs";
import { refreshApps } from "./lib/app-refresh.mjs";

const supportedHosts = new Set(["gitlab", "codeberg"]);

function repositoryPath(value, host) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error(`Invalid ${host} repository URL`);
  const parts = url.pathname.split("/").filter(Boolean).map((part) => part.replace(/\.git$/i, ""));
  if (host === "gitlab") {
    const separator = parts.indexOf("-");
    const repositoryParts = separator >= 2 ? parts.slice(0, separator) : parts;
    if (repositoryParts.length < 2) throw new Error("Invalid gitlab repository URL");
    return repositoryParts.join("/");
  }
  if (parts.length < 2) throw new Error(`Invalid ${host} repository URL`);
  return `${parts[0]}/${parts[1]}`;
}

async function fetchJson(url, token) {
  const headers = { Accept: "application/json", "User-Agent": "stack127-source-refresh/1.0" };
  if (token) headers.Authorization = `Bearer ${token}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // Refuse redirects so credentials cannot cross instance boundaries.
      const response = await fetch(url, { headers, redirect: "error", signal: AbortSignal.timeout(20_000) });
      if (!response.ok) {
        const error = new Error(`${response.status}: ${url}`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      if (attempt === 2 || (error.status && ![408, 429].includes(error.status) && error.status < 500)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
}

async function optionalJson(url, token, unavailableStatuses = [404]) {
  try {
    return await fetchJson(url, token);
  } catch (error) {
    if (unavailableStatuses.includes(error.status)) return null;
    throw error;
  }
}

function maintenanceStatus(archived, lastCommitAt) {
  if (archived) return "archived";
  if (!lastCommitAt) return "unknown";
  const ageDays = (Date.now() - new Date(lastCommitAt).getTime()) / 86_400_000;
  if (ageDays <= 365) return "active";
  if (ageDays <= 730) return "slow";
  return "stale";
}

function normalizedLicense(value) {
  const license = String(value ?? "").trim();
  if (!license || /^(unknown|noassertion)$/i.test(license)) return null;
  return license;
}

export async function gitlabFacts(row) {
  const path = repositoryPath(row.source_code_url, "gitlab");
  const id = encodeURIComponent(path);
  const origin = new URL(row.source_code_url).origin;
  const token = origin === "https://gitlab.com" ? process.env.GITLAB_TOKEN ?? "" : "";
  const base = `${origin}/api/v4/projects/${id}`;
  const [project, languages, releases, commits] = await Promise.all([
    fetchJson(`${base}?license=true`, token),
    optionalJson(`${base}/languages`, token),
    // The latest permalink redirects. Releases can also be disabled (403)
    // on a public project; neither should prevent refreshing its stars.
    optionalJson(`${base}/releases?per_page=1&order_by=released_at&sort=desc`, token, [403, 404]),
    optionalJson(`${base}/repository/commits?per_page=1`, token),
  ]);
  const release = releases?.[0] ?? null;
  const lastCommitAt = commits?.[0]?.committed_date ?? commits?.[0]?.created_at ?? null;
  const license = normalizedLicense(
    project.license?.key ?? project.license?.spdx_identifier ?? project.license?.name,
  );

  return {
    source_repo_id: String(project.id),
    source_full_name: project.path_with_namespace,
    source_stars: project.star_count ?? null,
    source_forks: project.forks_count ?? null,
    source_watchers: null,
    source_open_issues: project.open_issues_count ?? null,
    source_primary_language: Object.keys(languages ?? {})[0] ?? null,
    source_languages: languages ?? {},
    source_topics: project.topics ?? [],
    source_created_at: project.created_at ?? null,
    source_updated_at: project.last_activity_at ?? null,
    source_pushed_at: lastCommitAt,
    source_default_branch: project.default_branch ?? null,
    source_repo_size_kb: project.statistics?.repository_size
      ? Math.round(project.statistics.repository_size / 1024)
      : null,
    source_archived: project.archived ?? null,
    source_disabled: null,
    source_is_fork: Boolean(project.forked_from_project),
    source_is_template: null,
    source_latest_release: release?.tag_name ?? null,
    source_latest_release_at: release?.released_at ?? null,
    source_last_commit_at: lastCommitAt,
    license,
    raw: { project, languages, release, latest_commit: commits?.[0] ?? null },
  };
}

async function codebergFacts(row) {
  const path = repositoryPath(row.source_code_url, "codeberg");
  const token = process.env.CODEBERG_TOKEN ?? "";
  const base = `https://codeberg.org/api/v1/repos/${path}`;
  const [project, languages, releases, commits] = await Promise.all([
    fetchJson(base, token),
    optionalJson(`${base}/languages`, token),
    optionalJson(`${base}/releases?limit=10`, token),
    optionalJson(`${base}/commits?limit=1`, token),
  ]);
  const release = releases?.find((item) => !item.draft && !item.prerelease)
    ?? releases?.find((item) => !item.draft)
    ?? null;
  const lastCommitAt = commits?.[0]?.commit?.committer?.date
    ?? commits?.[0]?.created
    ?? project.updated_at
    ?? null;
  const license = normalizedLicense(project.license?.spdx_id ?? project.license?.name ?? project.license);

  return {
    source_repo_id: String(project.id),
    source_full_name: project.full_name ?? path,
    source_stars: project.stars_count ?? null,
    source_forks: project.forks_count ?? null,
    source_watchers: project.watchers_count ?? null,
    source_open_issues: project.open_issues_count ?? null,
    source_primary_language: project.language ?? Object.keys(languages ?? {})[0] ?? null,
    source_languages: languages ?? {},
    source_topics: project.topics ?? [],
    source_created_at: project.created_at ?? null,
    source_updated_at: project.updated_at ?? null,
    source_pushed_at: lastCommitAt,
    source_default_branch: project.default_branch ?? null,
    source_repo_size_kb: project.size ?? null,
    source_archived: project.archived ?? null,
    source_disabled: project.empty ?? null,
    source_is_fork: project.fork ?? null,
    source_is_template: project.template ?? null,
    source_latest_release: release?.tag_name ?? null,
    source_latest_release_at: release?.published_at ?? release?.created_at ?? null,
    source_last_commit_at: lastCommitAt,
    license,
    raw: { project, languages, latest_release: release, latest_commit: commits?.[0] ?? null },
  };
}

export async function rowsToRefresh(client, host, args) {
  const params = [host];
  const conditions = ["source_code_host = $1", "source_code_url is not null"];
  if (args.slug !== undefined) {
    if (typeof args.slug !== "string" || !args.slug.trim()) throw new Error("--slug needs an app slug");
    const app = await client.query("select source_code_host, source_code_url from public.self_host_apps where slug = $1", [args.slug]);
    if (!app.rows[0]) throw new Error(`App not found: ${args.slug}`);
    if (app.rows[0].source_code_host !== host) {
      throw new Error(`App ${args.slug} belongs to host ${app.rows[0].source_code_host}, not ${host}`);
    }
    if (!app.rows[0].source_code_url) throw new Error(`App ${args.slug} has no repository URL`);
    params.push(args.slug);
    conditions.push(`slug = $${params.length}`);
  }
  if (args["published-only"]) conditions.push("published = true");
  if (args["max-age-hours"]) {
    params.push(numberArg(args, "max-age-hours", 24));
    conditions.push(`(greatest(source_checked_at, data_checked_at) is null or greatest(source_checked_at, data_checked_at) < now() - ($${params.length} * interval '1 hour'))`);
  }
  const limit = numberArg(args, "limit", 500);
  params.push(limit);
  const result = await client.query(
    `
      select id, slug, source_code_url
      from public.self_host_apps
      where ${conditions.join(" and ")}
      order by greatest(source_checked_at, data_checked_at) nulls first, slug
      limit $${params.length}
    `,
    params,
  );
  return result.rows;
}

export async function writeFacts(client, row, host, facts, checkedAt) {
  const licenseType = licenseTypeFromSpdx(facts.license);
  await refreshApps(client, `with ${starRecipientCtes} select app.*, ${starRecipientColumn} from public.self_host_apps app where app.id = $1`, [row.id], app => {
    const sourceFacts = Object.fromEntries(Object.entries(facts).filter(([key]) => key.startsWith('source_')));
    // Preserve the check time when the facts are unchanged: it is part of the
    // page-date trigger's comparison, so rewriting it would invalidate pages.
    return {
      ...sourceFacts,
      maintenance_status: maintenanceStatus(facts.source_archived, facts.source_last_commit_at),
      license: !app.license || app.license.toLowerCase() === 'unknown' ? facts.license ?? app.license : app.license,
      license_spdx_id: app.license_spdx_id ?? facts.license,
      license_type: app.license_type === 'unknown' && licenseType !== 'unknown' ? licenseType : app.license_type,
      data_source_urls: [...new Set([...(app.data_source_urls ?? []), row.source_code_url])].sort(),
      data_confidence: 'high',
      ...derivedPatch(app, { stars: facts.source_stars, version: facts.source_latest_release, publishedAt: facts.source_latest_release_at }, checkedAt),
    };
  }, checkedAt);
}

export async function refreshSourceHost(client, args) {
  const host = args.host;
  if (!supportedHosts.has(host)) throw new Error("--host must be gitlab or codeberg");
  const checkedAt = new Date().toISOString();

  const rows = await rowsToRefresh(client, host, args);
  let refreshed = 0;
  const failures = [];

  for (const row of rows) {
    try {
      const facts = host === "gitlab" ? await gitlabFacts(row) : await codebergFacts(row);
      if (!args["dry-run"]) await writeFacts(client, row, host, facts, checkedAt);
      refreshed += 1;
      console.log(`${args["dry-run"] ? "Checked" : "Refreshed"} ${host} facts: ${row.slug}`);
    } catch (error) {
      failures.push({ slug: row.slug, error: error.message });
      console.warn(`warning ${row.slug}: ${error.message}`);
    }
  }

  const report = { host, dry_run: Boolean(args["dry-run"]), selected: rows.length, refreshed, failed: failures.length, failures };
  console.log(JSON.stringify(report, null, 2));
  jobSummary(`${host} facts`, { Selected: rows.length, Refreshed: refreshed, Failed: failures.length, "Allowed failure percentage": 20, "Dry run": Boolean(args["dry-run"]) }, failures);
  return report;
}

import { databaseOptions } from "./lib/environment.mjs";

async function main() {
  const args = parseArgs();
  const report = await withClient((client) => refreshSourceHost(client, args), args.environment ? databaseOptions(args) : args["database-url"]);
  if (refreshFailed(report)) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => {
  console.error(error);
  process.exit(1);
});
