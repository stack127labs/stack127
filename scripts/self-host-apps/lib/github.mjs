import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { slugify } from "./content-schema.mjs";

const githubApiBase = "https://api.github.com";
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
let cachedGitHubToken;

function githubToken() {
  if (cachedGitHubToken !== undefined) return cachedGitHubToken;
  if (process.env.GITHUB_TOKEN) {
    cachedGitHubToken = process.env.GITHUB_TOKEN;
    return cachedGitHubToken;
  }

  try {
    cachedGitHubToken = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    cachedGitHubToken = "";
  }

  return cachedGitHubToken;
}

function githubHeaders(extra = {}) {
  const token = githubToken();
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "version127-self-host-app-workflow",
    ...extra,
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function parseRepo(value) {
  const input = String(value ?? "").trim();
  const match =
    input.match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+)(?:[/?#].*)?$/i) ??
    input.match(/^([^/\s]+)\/([^/\s]+)$/);

  if (!match) throw new Error("Use --repo owner/name or a GitHub repository URL.");

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
  };
}

async function githubFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: githubHeaders(options.headers),
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 403 && body.includes("rate limit")) {
      throw new Error(
        "GitHub API rate limit exceeded. Set GITHUB_TOKEN or run `gh auth login` so automation can use authenticated requests.",
      );
    }
    throw new Error(`GitHub request failed ${response.status} ${url}: ${body.slice(0, 300)}`);
  }

  return response;
}

async function githubJson(pathName, searchParams) {
  const url = new URL(`${githubApiBase}${pathName}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }

  const response = await githubFetch(url);
  return response.json();
}

function parseLastPage(linkHeader) {
  if (!linkHeader) return null;
  const last = linkHeader
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.endsWith('rel="last"'));
  if (!last) return null;

  const pageMatch = last.match(/[?&]page=(\d+)/);
  return pageMatch ? Number(pageMatch[1]) : null;
}

async function countByPagination(pathName, searchParams = {}) {
  const url = new URL(`${githubApiBase}${pathName}`);
  for (const [key, value] of Object.entries({ per_page: 1, ...searchParams })) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const response = await githubFetch(url);
  const data = await response.json();
  const lastPage = parseLastPage(response.headers.get("link"));
  return lastPage ?? (Array.isArray(data) ? data.length : 0);
}

async function countSearch(query) {
  const data = await githubJson("/search/issues", {
    q: query,
    per_page: 1,
  });
  return data.total_count ?? 0;
}

function latestStableRelease(releases) {
  return (
    releases.find((release) => !release.draft && !release.prerelease) ??
    releases.find((release) => !release.draft) ??
    null
  );
}

function resolveReadmeImageUrl(url, repo, branch) {
  if (!url || /^#/.test(url)) return null;
  if (/^https?:\/\//i.test(url)) return url.match(/^(\S+)/)?.[1] ?? url;

  const cleanUrl = path.posix.normalize(url.split("#")[0].split("?")[0].replace(/^\.\//, ""));
  if (!imageExtensions.has(path.extname(cleanUrl).toLowerCase())) return null;
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}/${cleanUrl}`;
}

function resolveRepoLinkUrl(url, repo, branch) {
  if (!url || /^#/.test(url)) return null;
  if (/^https?:\/\//i.test(url)) return url.match(/^(\S+)/)?.[1] ?? url;

  const [withoutHash, hash] = url.split("#");
  const cleanUrl = path.posix.normalize(withoutHash.split("?")[0].replace(/^\.\//, ""));
  const suffix = hash ? `#${hash}` : "";
  return `https://github.com/${repo.owner}/${repo.repo}/blob/${branch}/${cleanUrl}${suffix}`;
}

function readmeLinks(readmeText, repo, branch) {
  const links = [];
  const images = [];
  const markdownLinkRegex = /!?\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownLinkRegex.exec(readmeText)) !== null) {
    const full = match[0];
    const label = match[1]?.trim() ?? "";
    const href = match[2]?.trim().replace(/^<|>$/g, "").match(/^(\S+)/)?.[1] ?? "";
    if (!href || href.startsWith("#")) continue;

    if (full.startsWith("!")) {
      const imageUrl = resolveReadmeImageUrl(href, repo, branch);
      if (imageUrl) images.push({ url: imageUrl, label });
      continue;
    }

    if (label.startsWith("!") || imageExtensions.has(path.extname(href.split("#")[0].split("?")[0]).toLowerCase())) {
      continue;
    }

    links.push({ label, url: resolveRepoLinkUrl(href, repo, branch) ?? href });
  }

  return { links, images };
}

function candidateLinks(links, { homepage } = {}) {
  let homepageHost = null;
  try {
    homepageHost = homepage ? new URL(homepage).hostname.replace(/^www\./, "") : null;
  } catch {
    homepageHost = null;
  }

  const score = (link, type) => {
    const label = `${link.label} ${link.url}`.toLowerCase();
    let host = "";
    try {
      host = new URL(link.url).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      host = "";
    }

    let value = 0;
    let signal = false;
    if (
      /\b(dev\s*containers?|vscode|contributors?|contributing|crowdin|discord|sponsors?|donate|translation|translate|bug|issues?|pull requests?)\b/.test(
        label,
      )
    ) {
      value -= 8;
    }
    if (/\b(code\.visualstudio\.com|github\.com\/sponsors|buymeacoffee\.com|crowdin\.com)\b/.test(label)) {
      value -= 15;
    }

    if (type === "docs") {
      if (/\bdocs?\b|documentation|wiki\b/.test(label)) value += 4;
      if (/^\s*(docs?|documentation|manual|user guide)\s*$/i.test(link.label)) value += 7;
      if (/docs\/(readme|get(ting)?-started|index)\.md\b/.test(label)) value += 5;
      if (/\/docs($|[/?#])/.test(label)) value += 3;
      if (/\b(cli|agent|contributing|changelog|release|move|announcement)\b/.test(label)) value -= 3;
      if (/\/src\/lang\//.test(label)) value -= 8;
      if (value > 0) signal = true;
    }

    if (type === "install") {
      if (/\binstall|installation|deploy|deployment|setup|get started|getting started\b/.test(label)) value += 5;
      if (/\/install(ation)?($|[/?#])/.test(label)) value += 4;
      if (/\b(readme|install)\.md\b/.test(label)) value += 2;
      if (/\b(pnpm\.io|npmjs\.com|nodejs\.org|yarnpkg\.com)\b/.test(label)) value -= 10;
      if (/\/src\/lang\//.test(label)) value -= 8;
      if (value > 0) signal = true;
    }

    if (type === "demo" && /\b(demo|try|sandbox|live preview)\b/.test(label)) {
      value += 5;
      signal = true;
    }
    if (type === "docker") {
      if (/\b(ghcr\.io|hub\.docker\.com|quay\.io|packages\/container|container registry)\b/.test(label)) {
        value += 7;
        signal = true;
      }
      if (/github\.com\/[^/]+\/[^/]+\/pkgs\/container\//.test(label)) {
        value += 7;
        signal = true;
      }
      if (/\bdev\s*containers?\b/.test(label)) value -= 12;
    }

    if (!signal) return 0;
    if (homepageHost && host === homepageHost) value += 5;
    return value;
  };

  const choose = (type) =>
    links
      .map((link) => ({ link, score: score(link, type) }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.link.url ?? null;

  return {
    docs_url: choose("docs"),
    install_docs_url: choose("install"),
    demo_url: choose("demo"),
    docker_url: choose("docker"),
  };
}

function inspectTreeFiles(tree) {
  const paths = tree.map((entry) => entry.path);
  const lowerPaths = paths.map((entryPath) => entryPath.toLowerCase());
  const hasFile = (predicate) => lowerPaths.some(predicate);

  const dockerfiles = paths.filter((entryPath) => /(^|\/)dockerfile$/i.test(entryPath));
  const composeFiles = paths.filter((entryPath) =>
    /(^|\/)(docker-compose|compose)\.(ya?ml)$/i.test(entryPath),
  );
  const docsFiles = paths.filter((entryPath) => /(^|\/)(docs?|documentation|wiki)\//i.test(entryPath));
  const packageFiles = paths.filter((entryPath) =>
    /(^|\/)(package\.json|pnpm-lock\.yaml|yarn\.lock|go\.mod|cargo\.toml|pyproject\.toml|requirements\.txt)$/i.test(entryPath),
  );
  const imageFiles = paths.filter((entryPath) => {
    const normalized = entryPath.toLowerCase();
    return (
      imageExtensions.has(path.extname(normalized)) &&
      /\b(screenshot|screen|demo|docs|assets|static|public|media|logo|icon)\b/.test(normalized) &&
      !/\b(placeholder|favicon|apple-touch-icon|badge|shield|repobeats)\b/.test(normalized)
    );
  });

  return {
    dockerfiles,
    composeFiles,
    docsFiles: docsFiles.slice(0, 20),
    packageFiles,
    imageFiles: imageFiles.slice(0, 20),
    hasDocker: dockerfiles.length > 0,
    hasCompose: composeFiles.length > 0,
    hasDocs: docsFiles.length > 0,
    hasNode: hasFile((entryPath) => entryPath.endsWith("package.json")),
    hasGo: hasFile((entryPath) => entryPath.endsWith("go.mod")),
    hasRust: hasFile((entryPath) => entryPath.endsWith("cargo.toml")),
    hasPython: hasFile((entryPath) => entryPath.endsWith("pyproject.toml") || entryPath.endsWith("requirements.txt")),
  };
}

function rawUrlForPath(repo, branch, filePath) {
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}/${filePath}`;
}

function imageCandidateScore(image) {
  const label = `${image.caption ?? ""} ${image.url}`.toLowerCase();
  let score = 0;

  if (/\b(home|main|dashboard|overview|screenshot|screen|ui|app|web)\b/.test(label)) score += 5;
  if (/\b(home_screenshot|product-screenshot|screenshot)\b/.test(label)) score += 8;
  if (/\b(demo|preview)\b/.test(label)) score += 5;
  if (/\b(mobile|phone|iphone|android|ios)\b/.test(label)) score += 3;
  if (/\b(docs|assets|public|static)\b/.test(label)) score += 1;

  if (/\b(diagram|drawio|architecture|flow|workflow|logo|icon|wordmark)\b/.test(label)) score -= 7;
  if (/\b(banner|background|wallpaper|blur)\b/.test(label)) score -= 6;
  if (/\b(home-assistant|n8n|shortcut|api|setup|url|integration|webhook)\b/.test(label)) score -= 4;
  if (/\b(badge|shield|sponsor|opencollective|buymeacoffee|favicon|placeholder)\b/.test(label)) score -= 12;

  return score;
}

function categorySuggestions({ repoData, topics }) {
  const text = [repoData.name, repoData.description, ...(topics ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const suggestions = [];
  const add = (slug, reason) => {
    if (!suggestions.some((suggestion) => suggestion.slug === slug)) suggestions.push({ slug, reason });
  };

  if (/\b(photo|photos|gallery|image|images|immich)\b/.test(text)) add("photos", "photo or gallery signals");
  if (/\b(media|movie|movies|music|stream|streaming|video|jellyfin|plex)\b/.test(text)) add("media", "media library signals");
  if (/\b(home automation|smart home|iot|home-assistant|zigbee|zwave)\b/.test(text)) add("home-automation", "home automation signals");
  if (/\b(password|vault|secret|bitwarden|passkey)\b/.test(text)) add("password-managers", "password or vault signals");
  if (/\b(document|documents|paperless|ocr|pdf|scanner|archive)\b/.test(text)) add("documents", "document management signals");
  if (/\b(monitor|monitoring|uptime|status page|observability|metrics|kuma)\b/.test(text)) add("monitoring", "monitoring signals");
  if (/\b(dns|adblock|ad-block|adguard|pi-hole|pihole)\b/.test(text)) add("dns", "DNS or network filtering signals");
  if (/\b(git|developer|development|source control|ci|forge|repository|repositories)\b/.test(text)) add("development-tools", "developer tooling signals");
  if (/\b(cms|content management|headless|editorial|wordpress|database editor)\b/.test(text)) add("content-management", "CMS or editorial workflow signals");
  if (/\b(bookmark|bookmarks|read-it-later|read later|web archive|linkwarden|pocket|raindrop)\b/.test(text)) add("bookmarks", "bookmark or read-it-later signals");
  if (/\b(recipe|recipes|meal|meals|mealie|shopping list|kitchen)\b/.test(text)) add("recipes", "recipe or meal planning signals");
  if (/\b(homepage|startpage|start page|dashboard|dashboards|service dashboard|application dashboard)\b/.test(text)) add("dashboards", "dashboard or start page signals");
  if (/\b(file sync|files|drive|cloud workspace|calendar|contacts|nextcloud)\b/.test(text)) add("cloud-workspace", "private workspace signals");

  return suggestions;
}

export async function collectGitHubAppFacts(repoInput) {
  const repo = parseRepo(repoInput);
  const checkedAt = new Date().toISOString();
  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const repoData = await githubJson(`/repos/${repo.owner}/${repo.repo}`);
  const releases = await githubJson(`/repos/${repo.owner}/${repo.repo}/releases`, { per_page: 100 });
  const latestRelease = latestStableRelease(releases);
  const commitCount90d = await countByPagination(`/repos/${repo.owner}/${repo.repo}/commits`, {
    since: since90d,
  });
  const releaseCount = await countByPagination(`/repos/${repo.owner}/${repo.repo}/releases`);
  const openPrCount = await countSearch(`repo:${repo.owner}/${repo.repo} is:pr is:open`);
  const openIssueCount = await countSearch(`repo:${repo.owner}/${repo.repo} is:issue is:open`);
  const latestCommits = await githubJson(`/repos/${repo.owner}/${repo.repo}/commits`, {
    per_page: 1,
    sha: repoData.default_branch,
  });

  let readme = null;
  try {
    const readmeData = await githubJson(`/repos/${repo.owner}/${repo.repo}/readme`);
    readme = Buffer.from(readmeData.content ?? "", "base64").toString("utf8");
  } catch {
    readme = null;
  }

  let treeInspection = {
    dockerfiles: [],
    composeFiles: [],
    docsFiles: [],
    packageFiles: [],
    imageFiles: [],
    hasDocker: false,
    hasCompose: false,
    hasDocs: false,
    hasNode: false,
    hasGo: false,
    hasRust: false,
    hasPython: false,
  };

  try {
    const tree = await githubJson(`/repos/${repo.owner}/${repo.repo}/git/trees/${repoData.default_branch}`, {
      recursive: "1",
    });
    if (!tree.truncated && Array.isArray(tree.tree)) treeInspection = inspectTreeFiles(tree.tree);
  } catch {
    // Tree inspection is useful, but a truncated or unavailable tree should not block a draft.
  }

  const homepage = repoData.homepage && /^https?:\/\//i.test(repoData.homepage) ? repoData.homepage : null;
  const readmeInfo = readme ? readmeLinks(readme, repo, repoData.default_branch) : { links: [], images: [] };
  const linkCandidates = candidateLinks(readmeInfo.links, { homepage });
  const allImageCandidates = [
    ...readmeInfo.images.map((image) => ({
      url: image.url,
      type: "web",
      caption: image.label || "Image referenced in the official README",
      source: "official_repo",
    })),
    ...treeInspection.imageFiles.slice(0, 10).map((filePath) => ({
      url: rawUrlForPath(repo, repoData.default_branch, filePath),
      type: /mobile|phone|android|ios/i.test(filePath) ? "mobile" : "web",
      caption: path.basename(filePath).replace(/[-_]+/g, " ").replace(/\.[^.]+$/, ""),
      source: "official_repo",
    })),
  ];
  const seenImageUrls = new Set();
  const uniqueImageCandidates = allImageCandidates.filter((image) => {
    if (/\b(placeholder|badge|shield|repobeats|opencollective|sponsor)\b/i.test(image.url)) return false;
    if (seenImageUrls.has(image.url)) return false;
    seenImageUrls.add(image.url);
    return true;
  });
  const iconCandidates = uniqueImageCandidates
    .filter((image) => /\b(icon|logo|wordmark)\b/i.test(image.url))
    .sort((a, b) => {
      const scoreIcon = (image) => {
        const url = image.url.toLowerCase();
        let score = 0;
        if (/\bicon\b/.test(url)) score += 6;
        if (/\blogo\b/.test(url)) score += 3;
        if (/\bwordmark\b/.test(url)) score -= 2;
        if (url.endsWith(".svg")) score += 2;
        return score;
      };
      return scoreIcon(b) - scoreIcon(a);
    });
  const screenshotCandidates = uniqueImageCandidates
    .filter((image) => !/\b(icon|logo|wordmark)\b/i.test(image.url))
    .map((image, index) => ({ image, index, score: imageCandidateScore(image) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((candidate) => candidate.image);

  const languageHints = [
    repoData.language,
    treeInspection.hasNode ? "Node" : null,
    treeInspection.hasGo ? "Go" : null,
    treeInspection.hasRust ? "Rust" : null,
    treeInspection.hasPython ? "Python" : null,
  ].filter(Boolean);

  return {
    repo,
    repoData,
    checkedAt,
    github: {
      owner: repo.owner,
      repo: repo.repo,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      open_issues: openIssueCount,
      open_pull_requests: openPrCount,
      latest_release: latestRelease?.tag_name ?? null,
      latest_release_at: latestRelease?.published_at ?? null,
      last_commit_at: latestCommits[0]?.commit?.committer?.date ?? null,
      commit_count_90d: commitCount90d,
      release_count_90d: releases.filter(
        (release) => release.published_at && new Date(release.published_at) >= new Date(since90d),
      ).length,
      release_count: releaseCount,
      updated_at: repoData.updated_at,
      checked_at: checkedAt,
    },
    inferred: {
      slug: slugify(repoData.name),
      name: repoData.name,
      repo_description: repoData.description,
      homepage,
      license: repoData.license?.spdx_id && repoData.license.spdx_id !== "NOASSERTION" ? repoData.license.spdx_id : null,
      topics: repoData.topics ?? [],
      category_suggestions: categorySuggestions({ repoData, topics: repoData.topics ?? [] }),
      primary_language: repoData.language,
      language_hints: languageHints,
      archived: repoData.archived,
      fork: repoData.fork,
      deployment_methods: [
        treeInspection.hasDocker ? "docker" : null,
        treeInspection.hasCompose ? "docker-compose" : null,
        !treeInspection.hasDocker && treeInspection.hasNode ? "node" : null,
        !treeInspection.hasDocker && (treeInspection.hasGo || treeInspection.hasRust) ? "binary" : null,
        !treeInspection.hasDocker && treeInspection.hasPython ? "python" : null,
      ].filter(Boolean),
      docker_support: treeInspection.hasDocker ? "official" : "unknown",
      compose_support: treeInspection.hasCompose ? true : null,
      has_docs_folder: treeInspection.hasDocs,
      package_files: treeInspection.packageFiles,
      dockerfiles: treeInspection.dockerfiles,
      compose_files: treeInspection.composeFiles,
      docs_files: treeInspection.docsFiles,
      image_candidates: screenshotCandidates.slice(0, 12),
      icon_candidates: iconCandidates.slice(0, 8),
      readme_link_candidates: linkCandidates,
      readme_links: readmeInfo.links.slice(0, 30),
    },
  };
}
