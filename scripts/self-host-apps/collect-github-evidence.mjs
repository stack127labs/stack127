#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { githubJson, parseRepo } from "./lib/github.mjs";

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.candidates)) return input.candidates;
  return [input];
}

async function optionalGithubJson(pathName, searchParams) {
  try {
    return await githubJson(pathName, searchParams);
  } catch {
    return null;
  }
}

function latestStableRelease(releases) {
  return releases?.find((release) => !release.draft && !release.prerelease)
    ?? releases?.find((release) => !release.draft)
    ?? null;
}

function relevantRepositoryFiles(tree) {
  const patterns = [
    /(^|\/)dockerfile$/i,
    /(^|\/)containerfile$/i,
    /(^|\/)(docker-)?compose[^/]*\.ya?ml$/i,
    /(^|\/)helm\//i,
    /(^|\/)charts?\//i,
    /(^|\/)docs?\//i,
    /(^|\/)install(?:ation)?[^/]*\.md$/i,
    /(^|\/)deploy(?:ment)?[^/]*\.md$/i,
    /(^|\/)license(?:\.[^/]+)?$/i,
  ];
  return (tree ?? [])
    .filter((item) => item.type === "blob" && patterns.some((pattern) => pattern.test(item.path)))
    .map((item) => item.path)
    .slice(0, 500);
}

async function collect(candidate) {
  const parsed = parseRepo(candidate.source_code_url);
  const repoPath = `/repos/${parsed.owner}/${parsed.repo}`;
  const repo = await githubJson(repoPath);
  const [languages, releases, commits, readme, tree] = await Promise.all([
    optionalGithubJson(`${repoPath}/languages`),
    optionalGithubJson(`${repoPath}/releases`, { per_page: 20 }),
    optionalGithubJson(`${repoPath}/commits`, { per_page: 1, sha: repo.default_branch }),
    optionalGithubJson(`${repoPath}/readme`),
    optionalGithubJson(`${repoPath}/git/trees/${encodeURIComponent(repo.default_branch)}`, { recursive: 1 }),
  ]);
  const latestRelease = latestStableRelease(releases);

  return {
    candidate_id: candidate.id ?? null,
    candidate_slug: candidate.slug,
    provider: "github",
    checked_at: new Date().toISOString(),
    repository_url: repo.html_url,
    repository_api_url: repo.url,
    repository: {
      id: repo.id,
      node_id: repo.node_id,
      full_name: repo.full_name,
      name: repo.name,
      description: repo.description,
      homepage: repo.homepage,
      owner: repo.owner
        ? {
            login: repo.owner.login,
            type: repo.owner.type,
            html_url: repo.owner.html_url,
            avatar_url: repo.owner.avatar_url,
          }
        : null,
      license: repo.license,
      topics: repo.topics ?? [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.subscribers_count ?? repo.watchers_count,
      open_issues: repo.open_issues_count,
      primary_language: repo.language,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      default_branch: repo.default_branch,
      size_kb: repo.size,
      archived: repo.archived,
      disabled: repo.disabled,
      is_fork: repo.fork,
      is_template: repo.is_template,
    },
    languages: languages ?? {},
    latest_release: latestRelease
      ? {
          tag_name: latestRelease.tag_name,
          name: latestRelease.name,
          html_url: latestRelease.html_url,
          published_at: latestRelease.published_at,
          prerelease: latestRelease.prerelease,
        }
      : null,
    latest_commit: commits?.[0]
      ? {
          sha: commits[0].sha,
          html_url: commits[0].html_url,
          committed_at: commits[0].commit?.committer?.date ?? null,
        }
      : null,
    readme: readme
      ? {
          path: readme.path,
          html_url: readme.html_url,
          download_url: readme.download_url,
        }
      : null,
    relevant_repository_files: relevantRepositoryFiles(tree?.tree),
  };
}

function defaultOutput(file) {
  const extension = path.extname(file);
  const base = extension ? file.slice(0, -extension.length) : file;
  return `${base}-github-evidence.json`;
}

async function main() {
  const args = parseArgs();
  if (!args.file) throw new Error("Pass --file with a candidate batch.");
  const input = JSON.parse(await readFile(args.file, "utf8"));
  const candidates = recordsFromInput(input)
    .filter((candidate) => candidate.source_code_host === "github" || /github\.com/i.test(candidate.source_code_url ?? ""))
    .slice(0, numberArg(args, "limit", Number.MAX_SAFE_INTEGER));
  const evidence = [];
  const failures = [];

  for (const candidate of candidates) {
    try {
      evidence.push(await collect(candidate));
      console.log(`Collected GitHub evidence: ${candidate.slug}`);
    } catch (error) {
      failures.push({ candidate_id: candidate.id ?? null, slug: candidate.slug, error: error.message });
      console.warn(`warning ${candidate.slug}: ${error.message}`);
    }
  }

  const outPath = args.out ?? defaultOutput(args.file);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify({ collected_at: new Date().toISOString(), evidence, failures }, null, 2)}\n`);
  console.log(`Wrote ${evidence.length} evidence record(s) to ${outPath}; ${failures.length} failure(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
