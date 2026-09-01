#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { licenseTypeFromSpdx } from "./lib/schema.mjs";

const supportedHosts = new Set(["gitlab", "codeberg"]);

function repositoryPath(value, host) {
  const url = new URL(value);
  const parts = url.pathname.split("/").filter(Boolean).map((part) => part.replace(/\.git$/i, ""));
  if (host === "gitlab") {
    const separator = parts.indexOf("-");
    return (separator >= 2 ? parts.slice(0, separator) : parts).join("/");
  }
  if (parts.length < 2) throw new Error(`Invalid ${host} repository URL`);
  return `${parts[0]}/${parts[1]}`;
}

async function fetchJson(url, token) {
  const headers = { Accept: "application/json", "User-Agent": "stack127-source-refresh/1.0" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.json();
}

async function optionalJson(url, token) {
  try {
    return await fetchJson(url, token);
  } catch {
    return null;
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

async function gitlabFacts(row) {
  const path = repositoryPath(row.source_code_url, "gitlab");
  const id = encodeURIComponent(path);
  const token = process.env.GITLAB_TOKEN ?? "";
  const base = `https://gitlab.com/api/v4/projects/${id}`;
  const [project, languages, release, commits] = await Promise.all([
    fetchJson(`${base}?license=true`, token),
    optionalJson(`${base}/languages`, token),
    optionalJson(`${base}/releases/permalink/latest`, token),
    optionalJson(`${base}/repository/commits?per_page=1`, token),
  ]);
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

async function rowsToRefresh(client, host, args) {
  const params = [host];
  const conditions = ["source_code_host = $1", "source_code_url is not null"];
  if (args["published-only"]) conditions.push("published = true");
  if (args["max-age-hours"]) {
    params.push(numberArg(args, "max-age-hours", 24));
    conditions.push(`(source_checked_at is null or source_checked_at < now() - ($${params.length} * interval '1 hour'))`);
  }
  const limit = numberArg(args, "limit", 500);
  params.push(limit);
  const result = await client.query(
    `
      select id, slug, source_code_url
      from public.self_host_apps
      where ${conditions.join(" and ")}
      order by source_checked_at nulls first, slug
      limit $${params.length}
    `,
    params,
  );
  return result.rows;
}

async function writeFacts(client, row, host, facts, checkedAt) {
  const values = [
    facts.source_repo_id,
    facts.source_full_name,
    facts.source_stars,
    facts.source_forks,
    facts.source_watchers,
    facts.source_open_issues,
    facts.source_primary_language,
    JSON.stringify(facts.source_languages),
    facts.source_topics,
    facts.source_created_at,
    facts.source_updated_at,
    facts.source_pushed_at,
    facts.source_default_branch,
    facts.source_repo_size_kb,
    facts.source_archived,
    facts.source_disabled,
    facts.source_is_fork,
    facts.source_is_template,
    facts.source_latest_release,
    facts.source_latest_release_at,
    facts.source_last_commit_at,
    checkedAt,
  ];
  const licenseType = licenseTypeFromSpdx(facts.license);
  const maintenance = maintenanceStatus(facts.source_archived, facts.source_last_commit_at);
  await client.query(
    `
      update public.self_host_apps
      set source_repo_id = $2, source_full_name = $3, source_stars = $4,
          source_forks = $5, source_watchers = $6, source_open_issues = $7,
          source_primary_language = $8, source_languages = $9::jsonb,
          source_topics = $10::text[], source_created_at = $11, source_updated_at = $12,
          source_pushed_at = $13, source_default_branch = $14, source_repo_size_kb = $15,
          source_archived = $16, source_disabled = $17, source_is_fork = $18,
          source_is_template = $19, source_latest_release = $20,
          source_latest_release_at = $21, source_last_commit_at = $22,
          source_checked_at = $23, maintenance_status = $24,
          license = case when license is null or lower(license) = 'unknown' then coalesce($25, license) else license end,
          license_spdx_id = coalesce(license_spdx_id, $25),
          license_type = case
            when license_type = 'unknown' and $26 <> 'unknown' then $26::public.self_host_app_license_type
            else license_type
          end,
          data_source_urls = coalesce((
            select array_agg(distinct url order by url)
            from unnest(coalesce(data_source_urls, '{}') || array[$27]::text[]) as values(url)
          ), '{}'),
          data_checked_at = $23,
          data_confidence = 'high',
          updated_at = now()
      where id = $1
    `,
    [row.id, ...values, maintenance, facts.license, licenseType, row.source_code_url],
  );
}

async function main() {
  const args = parseArgs();
  const host = args.host;
  if (!supportedHosts.has(host)) throw new Error("--host must be gitlab or codeberg");
  const checkedAt = new Date().toISOString();

  await withClient(async (client) => {
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

    console.log(JSON.stringify({ host, dry_run: Boolean(args["dry-run"]), selected: rows.length, refreshed, failures }, null, 2));
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
