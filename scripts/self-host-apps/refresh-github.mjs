#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { execFileSync } from "node:child_process";
import { parseRepo } from "./lib/github.mjs";
import { licenseTypeFromSpdx, sourceModelFromSpdx } from "./lib/schema.mjs";

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

async function githubGraphql(query) {
  const token = githubToken();
  if (!token) throw new Error("GITHUB_TOKEN is required for scheduled GitHub fact refresh.");

  const response = await fetch(githubGraphqlUrl, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "stack127-self-host-apps",
    },
    body: JSON.stringify({ query }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((error) => error.message).join("; ") ?? `GitHub ${response.status}`;
    throw new Error(message);
  }

  return payload.data;
}

async function rowsToRefresh(client, args) {
  if (args.repo) return [{ slug: args.slug ?? args.repo, source_code_url: args.repo }];
  const limit = numberArg(args, "limit", 500);
  const params = [];
  let where = "where (app.source_code_host = 'github' or app.source_code_url like 'https://github.com/%')";
  if (args.slug) {
    params.push(args.slug);
    where += " and app.slug = $1";
  }
  if (args["published-only"]) {
    where += " and app.published = true";
  }
  if (args["source-model"]) {
    params.push(args["source-model"]);
    where += ` and app.source_model = $${params.length}::public.self_host_app_source_model`;
  }
  if (args["max-age-hours"]) {
    params.push(`${numberArg(args, "max-age-hours", 12)} hours`);
    where += ` and (project.checked_at is null or project.checked_at <= now() - $${params.length}::interval)`;
  }

  const result = await client.query(
    `
      select app.slug, app.source_code_url, app.github_owner, app.github_repo
      from public.self_host_apps app
      left join public.github_projects project on project.id = app.github_project_id
      ${where}
      order by project.checked_at nulls first, app.slug
      ${args.all ? "" : `limit $${params.length + 1}`}
    `,
    args.all ? params : [...params, limit],
  );
  return result.rows;
}

async function writeRepositoryFacts(client, row, repository, checkedAt, dryRun) {
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
          last_commit_at, license_spdx_id, checked_at, source_url
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb,
          $14::text[], $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
          $25, $26, $27, $28, $29
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
          and app.slug = $1
      `,
      [row.slug, facts.license, facts.license_type, facts.maintenance_status, facts.source_model, facts.repository_url, checkedAt, facts.owner, facts.repo],
    );
  }
}

async function main() {
  const args = parseArgs();
  const batchSize = Math.min(numberArg(args, "batch-size", 40), 80);
  const checkedAt = new Date().toISOString();

  await withClient(async (client) => {
    const rows = await rowsToRefresh(client, args);

    let refreshed = 0;
    let failed = 0;

    for (let index = 0; index < rows.length; index += batchSize) {
      const selectedBatch = rows.slice(index, index + batchSize);
      const batch = [];

      for (const row of selectedBatch) {
        try {
          const repo = parseRepo(row.source_code_url);
          row.github_owner = repo.owner;
          row.github_repo = repo.repo;
          batch.push(row);
        } catch (error) {
          failed += 1;
          console.warn(`warning ${row.slug}: ${error.message}`);
        }
      }

      if (batch.length === 0) continue;
      let data;

      try {
        data = await githubGraphql(repositoryQuery(batch));
      } catch (error) {
        console.warn(`warning batch ${index / batchSize + 1}: ${error.message}`);
        for (const row of batch) {
          try {
            const singleData = await githubGraphql(repositoryQuery([row]));
            await writeRepositoryFacts(client, row, singleData.repo0, checkedAt, Boolean(args["dry-run"]));
            refreshed += 1;
            console.log(`Refreshed GitHub facts: ${row.slug}`);
          } catch (singleError) {
            failed += 1;
            console.warn(`warning ${row.slug}: ${singleError.message}`);
          }
        }
        continue;
      }

      for (const [batchIndex, row] of batch.entries()) {
        try {
          const repository = data[`repo${batchIndex}`];
          await writeRepositoryFacts(client, row, repository, checkedAt, Boolean(args["dry-run"]));
          refreshed += 1;
          console.log(`Refreshed GitHub facts: ${row.slug}`);
        } catch (error) {
          failed += 1;
          console.warn(`warning ${row.slug}: ${error.message}`);
        }
      }
    }

    if (args["dry-run"]) console.log("Dry run OK. No GitHub facts committed.");
    console.log(`GitHub refresh complete: ${refreshed} refreshed, ${failed} failed.`);
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
