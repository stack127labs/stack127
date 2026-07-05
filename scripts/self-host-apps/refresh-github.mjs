#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { execFileSync } from "node:child_process";
import { parseRepo } from "./lib/github.mjs";

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
      const repo = parseRepo(row.repository_url);
      row.github_owner = repo.owner;
      row.github_repo = repo.repo;

      return `
        repo${index}: repository(owner: ${graphqlString(repo.owner)}, name: ${graphqlString(repo.repo)}) {
          stargazerCount
          isArchived
          licenseInfo {
            spdxId
          }
          latestRelease {
            tagName
            publishedAt
          }
          defaultBranchRef {
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
  if (args.repo) return [{ slug: args.slug ?? args.repo, repository_url: args.repo }];
  const limit = numberArg(args, "limit", 500);
  const params = [];
  let where = "where repository_url like 'https://github.com/%'";
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
      select slug, repository_url
      from public.self_host_apps
      ${where}
      order by github_checked_at nulls first, slug
      ${args.all ? "" : `limit $${params.length + 1}`}
    `,
    args.all ? params : [...params, limit],
  );
  return result.rows;
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
      const batch = rows.slice(index, index + batchSize);
      let data;

      try {
        data = await githubGraphql(repositoryQuery(batch));
      } catch (error) {
        failed += batch.length;
        console.warn(`warning batch ${index / batchSize + 1}: ${error.message}`);
        continue;
      }

      for (const [batchIndex, row] of batch.entries()) {
        try {
          const repository = data[`repo${batchIndex}`];
          if (!repository) throw new Error("repository not found or inaccessible");

          const release = latestReleaseFrom(repository);
          const lastCommitAt = lastCommitFrom(repository);
          const license = repository.licenseInfo?.spdxId && repository.licenseInfo.spdxId !== "NOASSERTION"
            ? repository.licenseInfo.spdxId
            : null;

          const facts = {
            github_owner: row.github_owner,
            github_repo: row.github_repo,
            github_stars: repository.stargazerCount,
            github_latest_release: release.tag,
            github_latest_release_at: release.publishedAt,
            github_last_commit_at: lastCommitAt,
            github_checked_at: checkedAt,
            license,
            maintenance_status: maintenanceStatus(repository, lastCommitAt),
          };

          if (!args["dry-run"]) {
            await client.query(
              `
                update public.self_host_apps
                set
                  github_owner = $2,
                  github_repo = $3,
                  github_stars = $4,
                  github_latest_release = $5,
                  github_latest_release_at = $6,
                  github_last_commit_at = $7,
                  github_checked_at = $8,
                  license = coalesce(license, $9),
                  maintenance_status = $10,
                  updated_at = now()
                where slug = $1
              `,
              [
                row.slug,
                facts.github_owner,
                facts.github_repo,
                facts.github_stars,
                facts.github_latest_release,
                facts.github_latest_release_at,
                facts.github_last_commit_at,
                facts.github_checked_at,
                facts.license,
                facts.maintenance_status,
              ],
            );
          }
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
