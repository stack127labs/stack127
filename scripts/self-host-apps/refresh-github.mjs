#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { execFileSync } from "node:child_process";
import { parseRepo } from "./lib/github.mjs";
import { licenseTypeFromSpdx, sourceModelFromSpdx } from "./lib/schema.mjs";
import { pathToFileURL } from "node:url";
import { jobSummary } from "./lib/job-summary.mjs";
import { maintenanceFrom as cliMaintenanceFrom } from "../cli-apps/lib/maintenance.mjs";
import { refreshFailed } from "./lib/refresh-health.mjs";

const githubGraphqlUrl = "https://api.github.com/graphql";
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

function latestReleaseFrom(repository) {
  const release = repository?.latestRelease;
  if (!release?.tagName) return { tag: null, publishedAt: null };
  return {
    tag: release.tagName,
    publishedAt: release.publishedAt ?? null,
  };
}

function lastCommitFrom(repository) {
  const target = repository?.defaultBranchRef?.target;
  return target?.committedDate ?? null;
}

function maintenanceStatus(repository, lastCommitAt) {
  if (repository?.isArchived) return "archived";
  if (!lastCommitAt) return "unknown";

  const days = (Date.now() - new Date(lastCommitAt).getTime()) / 86_400_000;
  if (days <= 365) return "active";
  if (days <= 730) return "slow";
  return "stale";
}

function graphqlString(value) {
  return JSON.stringify(String(value));
}

function repositoryQuery(rows) {
  const fields = rows
    .map((row, index) => {
      if (!row.github_owner || !row.github_repo) {
        const repo = parseRepo(row.source_code_url);
        row.github_owner = repo.owner;
        row.github_repo = repo.repo;
      }

      return `
        repo${index}: repository(owner: ${graphqlString(row.github_owner)}, name: ${graphqlString(row.github_repo)}) {
          id
          databaseId
          nameWithOwner
          owner {
            login
            __typename
          }
          stargazerCount
          forkCount
          watchers {
            totalCount
          }
          issues(states: OPEN) {
            totalCount
          }
          primaryLanguage {
            name
          }
          languages(first: 25, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
              }
            }
          }
          repositoryTopics(first: 25) {
            nodes {
              topic {
                name
              }
            }
          }
          createdAt
          updatedAt
          pushedAt
          diskUsage
          isArchived
          isDisabled
          isFork
          isTemplate
          licenseInfo {
            spdxId
          }
          latestRelease {
            tagName
            publishedAt
          }
          defaultBranchRef {
            name
            target {
              ... on Commit {
                committedDate
              }
            }
          }
        }
      `;
    })
    .join("\n");

  return `query Stack127SelfHostGitHubRefresh {${fields}}`;
}

export async function githubGraphql(query) {
  const token = githubToken();
  if (!token) throw new Error("GITHUB_TOKEN is required for scheduled GitHub fact refresh.");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(githubGraphqlUrl, {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "stack127-self-host-apps",
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(30_000),
      });

      const payload = await response.json();
      if (!response.ok || !payload.data || payload.errors?.some((error) => !error.path?.length)) {
        const message = payload.errors?.map((error) => error.message).join("; ") ?? `GitHub ${response.status}`;
        const error = new Error(message);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }

      // GitHub returns successful aliases beside errors for deleted/private repos.
      return payload;
    } catch (error) {
      if (attempt === 2 || error.retryable === false) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
}

export async function hasRefreshAttemptColumns(client) {
  const result = await client.query(`
    select count(*) = 2 as available
    from pg_attribute
    where attrelid = 'public.github_projects'::regclass
      and attname in ('last_attempt_at', 'consecutive_failures')
      and not attisdropped
  `);
  return result.rows[0].available;
}

export async function rowsToRefresh(client, args, retryMetadataAvailable = true) {
  if (args.repo) return [{ slug: args.slug ?? args.repo, source_code_url: args.repo }];
  const limit = numberArg(args, "limit", 500);
  const params = [];
  const selfHostConditions = ["(app.github_project_id is not null or app.source_code_host = 'github' or app.source_code_url like 'https://github.com/%')"];
  const cliConditions = ["app.published = true"];
  if (args.slug) {
    params.push(args.slug);
    selfHostConditions.push(`app.slug = $${params.length}`);
    cliConditions.push(`app.slug = $${params.length}`);
  }
  if (args["published-only"]) selfHostConditions.push("app.published = true");
  if (args["source-model"]) {
    params.push(args["source-model"]);
    selfHostConditions.push(`app.source_model::text = $${params.length}`);
    cliConditions.push(`app.source_model::text = $${params.length}`);
  }
  let ageCondition = "true";
  if (args["max-age-hours"]) {
    params.push(`${numberArg(args, "max-age-hours", 12)} hours`);
    ageCondition = `(project.checked_at is null or project.checked_at <= now() - $${params.length}::interval)`;
  }

  const result = await client.query(
    `
      with memberships as (
        select app.slug, app.github_project_id, app.source_code_url as repository_url, app.slug as self_host_slug
        from public.self_host_apps app
        where ${selfHostConditions.join(" and ")}
        union all
        select app.slug, project.id, project.repository_url, null::text
        from public.terminal_apps app
        join public.github_projects project on project.id = app.github_project_id
        where ${cliConditions.join(" and ")}
      ), resolved as (
        select member.slug, member.self_host_slug,
          coalesce(linked.id, existing.id) as github_project_id,
          coalesce(linked.repository_url, existing.repository_url, member.repository_url) as source_code_url,
          coalesce(linked.owner, existing.owner, lower(parsed.parts[1])) as github_owner,
          coalesce(linked.repo, existing.repo, lower(regexp_replace(parsed.parts[2], '[.]git$', '', 'i'))) as github_repo
        from memberships member
        cross join lateral (select regexp_match(member.repository_url, '^https://github[.]com/([a-z0-9][a-z0-9-]{0,38})/([a-z0-9_.-]+)(?:[/?#].*)?$', 'i') as parts) parsed
        left join public.github_projects linked on linked.id = member.github_project_id
        left join public.github_projects existing on linked.id is null
          and existing.owner = lower(parsed.parts[1])
          and existing.repo = lower(regexp_replace(parsed.parts[2], '[.]git$', '', 'i'))
      ), repositories as (
        select min(slug) as slug, github_project_id, min(source_code_url) as source_code_url,
          min(github_owner) as github_owner, min(github_repo) as github_repo,
          coalesce(array_agg(distinct self_host_slug) filter (where self_host_slug is not null), '{}') as self_host_slugs
        from resolved
        where github_project_id is not null
          or (github_owner is not null and github_repo is not null and github_repo not in ('', '.', '..'))
        group by github_project_id, case when github_project_id is null then coalesce(github_owner || '/' || github_repo, lower(source_code_url)) end
      )
      select app.*
      from repositories app
      left join public.github_projects project on project.id = app.github_project_id
      where ${ageCondition}
      order by ${retryMetadataAvailable ? "greatest(project.last_attempt_at, project.checked_at)" : "project.checked_at"} nulls first, app.slug
      ${args.all ? "" : `limit $${params.length + 1}`}
    `,
    args.all ? params : [...params, limit],
  );
  return result.rows;
}

export async function writeRepositoryFacts(client, row, repository, checkedAt, dryRun, retryMetadataAvailable = true) {
  if (!repository) throw new Error("repository not found or inaccessible");

  const owner = String(row.github_owner ?? "").trim().toLowerCase();
  const repo = String(row.github_repo ?? "").trim().replace(/\.git$/i, "").toLowerCase();
  if (!owner || !repo) throw new Error("GitHub owner and repository are required");

  const release = latestReleaseFrom(repository);
  const lastCommitAt = lastCommitFrom(repository);
  const license =
    repository.licenseInfo?.spdxId && repository.licenseInfo.spdxId !== "NOASSERTION"
      ? repository.licenseInfo.spdxId
      : null;
  const languages = Object.fromEntries(
    (repository.languages?.edges ?? [])
      .filter((edge) => edge?.node?.name)
      .map((edge) => [edge.node.name, edge.size ?? 0]),
  );
  const topics = (repository.repositoryTopics?.nodes ?? [])
    .map((node) => node?.topic?.name)
    .filter(Boolean);

  const facts = {
    owner,
    repo,
    repo_id: repository.databaseId ?? null,
    node_id: repository.id ?? null,
    full_name: repository.nameWithOwner ?? `${owner}/${repo}`,
    owner_type: repository.owner?.__typename ?? null,
    stars: repository.stargazerCount,
    forks: repository.forkCount ?? null,
    watchers: repository.watchers?.totalCount ?? null,
    open_issues: repository.issues?.totalCount ?? null,
    primary_language: repository.primaryLanguage?.name ?? null,
    languages,
    topics,
    created_at: repository.createdAt ?? null,
    updated_at: repository.updatedAt ?? null,
    pushed_at: repository.pushedAt ?? null,
    default_branch: repository.defaultBranchRef?.name ?? null,
    repo_size_kb: repository.diskUsage ?? null,
    archived: repository.isArchived ?? null,
    disabled: repository.isDisabled ?? null,
    is_fork: repository.isFork ?? null,
    is_template: repository.isTemplate ?? null,
    latest_release: release.tag,
    latest_release_at: release.publishedAt,
    last_commit_at: lastCommitAt,
    checked_at: checkedAt,
    repository_url: `https://github.com/${owner}/${repo}`,
    license,
    license_type: licenseTypeFromSpdx(license),
    source_model: sourceModelFromSpdx(license),
    maintenance_status: maintenanceStatus(repository, lastCommitAt),
  };

  if (!dryRun) {
    await client.query(
      `
        insert into public.github_projects (
          owner, repo, full_name, repository_url, repo_id, node_id, owner_type,
          stars, forks, watchers, open_issues, primary_language, languages, topics,
          created_at, updated_at, pushed_at, default_branch, repo_size_kb, archived,
          disabled, is_fork, is_template, latest_release, latest_release_at,
          last_commit_at, license_spdx_id, checked_at, source_url${retryMetadataAvailable ? ", last_attempt_at, consecutive_failures" : ""}
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb,
          $14::text[], $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
          $25, $26, $27, $28, $29${retryMetadataAvailable ? ", $28, 0" : ""}
        )
        on conflict (owner, repo) do update set
          full_name = excluded.full_name,
          repository_url = excluded.repository_url,
          repo_id = excluded.repo_id,
          node_id = excluded.node_id,
          owner_type = excluded.owner_type,
          stars = excluded.stars,
          forks = excluded.forks,
          watchers = excluded.watchers,
          open_issues = excluded.open_issues,
          primary_language = excluded.primary_language,
          languages = excluded.languages,
          topics = excluded.topics,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          pushed_at = excluded.pushed_at,
          default_branch = excluded.default_branch,
          repo_size_kb = excluded.repo_size_kb,
          archived = excluded.archived,
          disabled = excluded.disabled,
          is_fork = excluded.is_fork,
          is_template = excluded.is_template,
          latest_release = excluded.latest_release,
          latest_release_at = excluded.latest_release_at,
          last_commit_at = excluded.last_commit_at,
          license_spdx_id = excluded.license_spdx_id,
          checked_at = excluded.checked_at,
          ${retryMetadataAvailable ? "last_attempt_at = excluded.last_attempt_at, consecutive_failures = 0," : ""}
          source_url = excluded.source_url,
          row_updated_at = now()
        returning id
      `,
      [
        facts.owner,
        facts.repo,
        facts.full_name,
        facts.repository_url,
        facts.repo_id,
        facts.node_id,
        facts.owner_type,
        facts.stars,
        facts.forks,
        facts.watchers,
        facts.open_issues,
        facts.primary_language,
        JSON.stringify(facts.languages),
        facts.topics,
        facts.created_at,
        facts.updated_at,
        facts.pushed_at,
        facts.default_branch,
        facts.repo_size_kb,
        facts.archived,
        facts.disabled,
        facts.is_fork,
        facts.is_template,
        facts.latest_release,
        facts.latest_release_at,
        facts.last_commit_at,
        facts.license,
        facts.checked_at,
        facts.repository_url,
      ],
    );
    await client.query(
      `
        update public.self_host_apps app
        set github_project_id = project.id,
            license = case when app.license is null or lower(app.license) = 'unknown' then coalesce($2, app.license) else app.license end,
            license_spdx_id = coalesce($2, app.license_spdx_id),
            license_type = case when $3 = 'unknown' then app.license_type else $3::public.self_host_app_license_type end,
            source_model = case when app.source_model = 'unknown' and $5 <> 'unknown' then $5::public.self_host_app_source_model else app.source_model end,
            maintenance_status = $4,
            data_source_urls = coalesce((
              select array_agg(distinct url order by url)
              from unnest(coalesce(app.data_source_urls, '{}') || array[$6]::text[]) as values(url)
            ), '{}'),
            data_checked_at = $7,
            data_confidence = 'high',
            updated_at = now()
        from public.github_projects project
        where project.owner = $8 and project.repo = $9
          and app.slug = any($1::text[])
      `,
      [row.self_host_slugs ?? [row.slug], facts.license, facts.license_type, facts.maintenance_status, facts.source_model, facts.repository_url, checkedAt, facts.owner, facts.repo],
    );
    // A normal terminal_apps UPDATE lets the existing statement trigger touch
    // /cli-apps and enqueue cli_apps revalidation; identical values do no work.
    await client.query(`
      update public.terminal_apps app
      set maintenance_status = $3::public.terminal_app_maintenance_status
      from public.github_projects project
      where app.github_project_id = project.id and project.owner = $1 and project.repo = $2
        and app.published = true
        and app.maintenance_status is distinct from $3::public.terminal_app_maintenance_status
    `, [facts.owner, facts.repo, cliMaintenanceFrom({ archived: repository.isArchived, pushed_at: repository.pushedAt }, null, new Date(checkedAt).getTime())]);
  }
}

export async function writeFailureAttempt(client, row, attemptedAt, dryRun, retryMetadataAvailable = true) {
  if (dryRun || !retryMetadataAvailable) return;
  try {
    const owner = String(row.github_owner ?? "").trim().toLowerCase();
    const repo = String(row.github_repo ?? "").trim().replace(/\.git$/i, "").toLowerCase();
    if (!owner || !repo) {
      if (!row.github_project_id) {
        console.warn(`warning ${row.slug}: skipping failed-attempt write: missing repository identity`);
        return;
      }
      await client.query(`update public.github_projects set last_attempt_at = $2, consecutive_failures = consecutive_failures + 1 where id = $1`, [row.github_project_id, attemptedAt]);
      return;
    }
    const result = await client.query(`
      insert into public.github_projects (owner, repo, full_name, repository_url, last_attempt_at, consecutive_failures)
      values ($1, $2, $1 || '/' || $2, $3, $4, 1)
      on conflict (owner, repo) do update set
        last_attempt_at = excluded.last_attempt_at,
        consecutive_failures = github_projects.consecutive_failures + 1
      returning id
    `, [owner, repo, `https://github.com/${owner}/${repo}`, attemptedAt]);
    // Even a previously unlinked repository must move to the back of the queue.
    // Do not change checked_at or any app fact/verification date on failure.
    await client.query(`update public.self_host_apps set github_project_id = $2 where slug = any($1::text[]) and github_project_id is distinct from $2::uuid`, [row.self_host_slugs ?? [row.slug], result.rows[0].id]);
  } catch (error) {
    // Failure bookkeeping must not prevent the remaining repositories or summary.
    console.warn(`warning ${row.slug}: unable to record failed attempt: ${error.message}`);
  }
}

export async function refreshGithub(client, args) {
  const batchSize = Math.max(1, Math.min(numberArg(args, "batch-size", 40), 80));
  const checkedAt = new Date().toISOString();

  // Actions can pick up main before the independently deployed migration lands.
  // Detect once per run and keep the old writer/queue usable until both columns exist.
  const retryMetadataAvailable = await hasRefreshAttemptColumns(client);
  if (!retryMetadataAvailable) console.warn("GitHub retry metadata unavailable (migration pending); using checked_at ordering and skipping failed-attempt writes.");
  const rows = await rowsToRefresh(client, args, retryMetadataAvailable);

  let refreshed = 0;
  const failures = [];
  async function failed(row, error) {
    failures.push({ slug: row.slug, repository: row.source_code_url, error: error.message });
    console.warn(`warning ${row.slug}: ${error.message}`);
    await writeFailureAttempt(client, row, checkedAt, Boolean(args["dry-run"]), retryMetadataAvailable);
  }

  for (let index = 0; index < rows.length; index += batchSize) {
    const selectedBatch = rows.slice(index, index + batchSize);
    const batch = [];

    for (const row of selectedBatch) {
      try {
        const repo = parseRepo(row.github_owner && row.github_repo ? `${row.github_owner}/${row.github_repo}` : row.source_code_url);
        row.github_owner = repo.owner;
        row.github_repo = repo.repo;
        batch.push(row);
      } catch (error) {
        await failed(row, error);
      }
    }

    if (batch.length === 0) continue;
    let payload;

    try {
      payload = await githubGraphql(repositoryQuery(batch));
    } catch (error) {
      console.warn(`warning batch ${index / batchSize + 1}: ${error.message}`);
      for (const row of batch) {
        await failed(row, error);
      }
      continue;
    }

    for (const [batchIndex, row] of batch.entries()) {
      try {
        const alias = `repo${batchIndex}`;
        const repository = payload.data[alias];
        const errors = payload.errors?.filter((error) => error.path?.[0] === alias);
        if (errors?.length) throw new Error(errors.map((error) => error.message).join("; "));
        await writeRepositoryFacts(client, row, repository, checkedAt, Boolean(args["dry-run"]), retryMetadataAvailable);
        refreshed += 1;
        console.log(`Refreshed GitHub facts: ${row.slug}`);
      } catch (error) {
        await failed(row, error);
      }
    }
  }

  if (args["dry-run"]) console.log("Dry run OK. No GitHub facts committed.");
  console.log(`GitHub refresh complete: ${refreshed} refreshed, ${failures.length} failed.`);
  jobSummary("GitHub facts", { Selected: rows.length, Refreshed: refreshed, Failed: failures.length, "Allowed failure percentage": 20, "Dry run": Boolean(args["dry-run"]), "Retry metadata available": retryMetadataAvailable }, failures);
  return { selected: rows.length, refreshed, failed: failures.length, failures, retryMetadataAvailable };
}

import { databaseOptions } from "./lib/environment.mjs";

async function main() {
  const args = parseArgs();
  if (args.slug !== undefined && (typeof args.slug !== "string" || !args.slug.trim())) throw new Error("--slug needs an app slug");
  const report = await withClient((client) => refreshGithub(client, args), args.environment ? databaseOptions(args) : args["database-url"]);
  if (refreshFailed(report)) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
