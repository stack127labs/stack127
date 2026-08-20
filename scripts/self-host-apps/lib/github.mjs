import { execFileSync } from "node:child_process";

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

export async function githubJson(pathName, searchParams) {
  const url = new URL(`${githubApiBase}${pathName}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "stack127-self-host-apps",
  };
  const token = githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${url}`);
  return response.json();
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
