import { execFileSync } from "node:child_process";
import { slugify, rewriteSummaryFromInputs } from "./summary-rules.mjs";

const githubApiBase = "https://api.github.com";
let cachedToken;

function githubToken() {
  if (cachedToken !== undefined) return cachedToken;
  if (process.env.GITHUB_TOKEN) {
    cachedToken = process.env.GITHUB_TOKEN;
    return cachedToken;
  }

  try {
    cachedToken = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    cachedToken = "";
  }

  return cachedToken;
}

export function parseRepo(value) {
  const input = String(value ?? "").trim();
  const match =
    input.match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+)(?:[/?#].*)?$/i) ??
    input.match(/^([^/\s]+)\/([^/\s]+)$/);

  if (!match) throw new Error("Use owner/name or a GitHub repository URL.");

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
  };
}

async function githubJson(pathName, searchParams) {
  const url = new URL(`${githubApiBase}${pathName}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "version127-self-host-apps",
  };
  const token = githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${url}`);
  return response.json();
}

function latestStableRelease(releases) {
  return releases.find((release) => !release.draft && !release.prerelease) ??
    releases.find((release) => !release.draft) ??
    null;
}

export async function collectGitHubFacts(repoInput) {
  const repo = parseRepo(repoInput);
  const checkedAt = new Date().toISOString();
  const repoData = await githubJson(`/repos/${repo.owner}/${repo.repo}`);
  const releases = await githubJson(`/repos/${repo.owner}/${repo.repo}/releases`, { per_page: 20 });
  const latestRelease = latestStableRelease(releases);
  const commits = await githubJson(`/repos/${repo.owner}/${repo.repo}/commits`, {
    per_page: 1,
    sha: repoData.default_branch,
  });

  return {
    slug: slugify(repoData.name),
    name: repoData.name,
    summary: rewriteSummaryFromInputs({
      name: repoData.name,
      description: repoData.description,
      topics: repoData.topics ?? [],
    }),
    website_url: repoData.homepage && /^https?:\/\//i.test(repoData.homepage) ? repoData.homepage : null,
    repository_url: repoData.html_url,
    license: repoData.license?.spdx_id && repoData.license.spdx_id !== "NOASSERTION" ? repoData.license.spdx_id : null,
    published: false,
    maintenance_status: repoData.archived ? "archived" : "active",
    github_owner: repo.owner,
    github_repo: repo.repo,
    github_stars: repoData.stargazers_count,
    github_latest_release: latestRelease?.tag_name ?? null,
    github_latest_release_at: latestRelease?.published_at ?? null,
    github_last_commit_at: commits[0]?.commit?.committer?.date ?? null,
    github_checked_at: checkedAt,
    docker_support: "unknown",
    compose_support: null,
    requires_database: null,
    database_types: [],
    ram_mb: null,
    storage_profile: "unknown",
    platforms: ["web"],
    categories: [],
    summary_source: "github_rewrite",
    summary_confidence: "low",
    source_payload: {
      source: "github_api",
      source_key: `${repo.owner}/${repo.repo}`,
      source_url: repoData.html_url,
      payload: repoData,
    },
  };
}

export async function searchTopic(topic, { limit = 30 } = {}) {
  const data = await githubJson("/search/repositories", {
    q: `topic:${topic} archived:false`,
    sort: "stars",
    order: "desc",
    per_page: Math.min(limit, 100),
  });

  return data.items ?? [];
}
