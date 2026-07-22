#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { execFileSync } from "node:child_process";
import { parseRepo } from "./lib/github.mjs";
import { licenseTypeFromSpdx } from "./lib/schema.mjs";

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

  return `query Version127SelfHostGitHubRefresh {${fields}}`;
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
      "User-Agent": "version127-self-host-apps",
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
  let where = "where (source_code_host = 'github' or source_code_url like 'https://github.com/%')";
  if (args.slug) {
    params.push(args.slug);
    where += " and slug = $1";
  }
  if (args["published-only"]) {
    where += " and published = true";
  }
  if (args["max-age-hours"]) {
    params.push(`${numberArg(args, "max-age-hours", 12)} hours`);
    where += ` and (github_checked_at is null or github_checked_at <= now() - $${params.length}::interval)`;
  }

  const result = await client.query(
    `
      select slug, source_code_url
      from public.open_projects
      ${where}
      order by github_checked_at nulls first, slug
      ${args.all ? "" : `limit $${params.length + 1}`}
    `,
    args.all ? params : [...params, limit],
  );
  return result.rows;
}

async function writeRepositoryFacts(client, row, repository, checkedAt, dryRun) {
  if (!repository) throw new Error("repository not found or inaccessible");

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
    github_owner: row.github_owner,
    github_repo: row.github_repo,
    github_repo_id: repository.databaseId ?? null,
    github_node_id: repository.id ?? null,
    github_full_name: repository.nameWithOwner ?? `${row.github_owner}/${row.github_repo}`,
    github_owner_type: repository.owner?.__typename ?? null,
    github_stars: repository.stargazerCount,
    github_forks: repository.forkCount ?? null,
    github_watchers: repository.watchers?.totalCount ?? null,
    github_open_issues: repository.issues?.totalCount ?? null,
    github_primary_language: repository.primaryLanguage?.name ?? null,
    github_languages: languages,
    github_topics: topics,
    github_created_at: repository.createdAt ?? null,
    github_updated_at: repository.updatedAt ?? null,
    github_pushed_at: repository.pushedAt ?? null,
    github_default_branch: repository.defaultBranchRef?.name ?? null,
    github_repo_size_kb: repository.diskUsage ?? null,
    github_archived: repository.isArchived ?? null,
    github_disabled: repository.isDisabled ?? null,
    github_is_fork: repository.isFork ?? null,
    github_is_template: repository.isTemplate ?? null,
    github_latest_release: release.tag,
    github_latest_release_at: release.publishedAt,
    github_last_commit_at: lastCommitAt,
    github_checked_at: checkedAt,
    license,
    license_type: licenseTypeFromSpdx(license),
    maintenance_status: maintenanceStatus(repository, lastCommitAt),
  };

  if (!dryRun) {
    await client.query(
      `
        update public.open_projects
        set
          github_owner = $2,
          github_repo = $3,
          github_repo_id = $4,
          github_node_id = $5,
          github_full_name = $6,
          github_owner_type = $7,
          github_stars = $8,
          github_forks = $9,
          github_watchers = $10,
          github_open_issues = $11,
          github_primary_language = $12,
          github_languages = $13::jsonb,
          github_topics = $14::text[],
          github_created_at = $15,
          github_updated_at = $16,
          github_pushed_at = $17,
          github_default_branch = $18,
          github_repo_size_kb = $19,
          github_archived = $20,
          github_disabled = $21,
          github_is_fork = $22,
          github_is_template = $23,
          source_repo_id = $4::text,
          source_full_name = $6,
          source_stars = $8,
          source_forks = $9,
          source_watchers = $10,
          source_open_issues = $11,
          source_primary_language = $12,
          source_languages = $13::jsonb,
          source_topics = $14::text[],
          source_created_at = $15,
          source_updated_at = $16,
          source_pushed_at = $17,
          source_default_branch = $18,
          source_repo_size_kb = $19,
          source_archived = $20,
          source_disabled = $21,
          source_is_fork = $22,
          source_is_template = $23,
          github_latest_release = $24,
          github_latest_release_at = $25,
          github_last_commit_at = $26,
          github_checked_at = $27,
          source_latest_release = $24,
          source_latest_release_at = $25,
          source_last_commit_at = $26,
          source_checked_at = $27,
          source_code_host = 'github',
          license = case
            when license is null or lower(license) = 'unknown' then coalesce($28, license)
            else license
          end,
          license_spdx_id = coalesce($28, license_spdx_id),
          license_type = case
            when $29 = 'unknown' then license_type
            else $29::public.open_project_license_type
          end,
          maintenance_status = $30,
          updated_at = now()
        where slug = $1
      `,
      [
        row.slug,
        facts.github_owner,
        facts.github_repo,
        facts.github_repo_id,
        facts.github_node_id,
        facts.github_full_name,
        facts.github_owner_type,
        facts.github_stars,
        facts.github_forks,
        facts.github_watchers,
        facts.github_open_issues,
        facts.github_primary_language,
        JSON.stringify(facts.github_languages),
        facts.github_topics,
        facts.github_created_at,
        facts.github_updated_at,
        facts.github_pushed_at,
        facts.github_default_branch,
        facts.github_repo_size_kb,
        facts.github_archived,
        facts.github_disabled,
        facts.github_is_fork,
        facts.github_is_template,
        facts.github_latest_release,
        facts.github_latest_release_at,
        facts.github_last_commit_at,
        facts.github_checked_at,
        facts.license,
        facts.license_type,
        facts.maintenance_status,
      ],
    );

    const mutableFields = [
      "source_repo_id",
      "source_full_name",
      "source_stars",
      "source_forks",
      "source_watchers",
      "source_open_issues",
      "source_primary_language",
      "source_languages",
      "source_topics",
      "source_created_at",
      "source_updated_at",
      "source_pushed_at",
      "source_default_branch",
      "source_repo_size_kb",
      "source_archived",
      "source_disabled",
      "source_is_fork",
      "source_is_template",
      "source_latest_release",
      "source_latest_release_at",
      "source_last_commit_at",
      "source_checked_at",
    ];
    await client.query(
      `
        insert into public.open_project_field_sources (
          project_id, field_name, source, source_url, confidence, checked_at, note
        )
        select project.id, field_name, 'github_api', project.source_code_url,
               'high', $3, 'Mutable repository fact.'
        from public.open_projects project
        cross join unnest($2::text[]) as field_name
        where project.slug = $1
        on conflict (project_id, field_name) do update set
          source = excluded.source,
          source_url = excluded.source_url,
          confidence = excluded.confidence,
          checked_at = excluded.checked_at,
          note = excluded.note
      `,
      [row.slug, mutableFields, checkedAt],
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
