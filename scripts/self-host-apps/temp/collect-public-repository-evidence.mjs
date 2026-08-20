#!/usr/bin/env node

import { setDefaultResultOrder } from "node:dns";
import { readFile, writeFile } from "node:fs/promises";
import { mapConcurrent } from "../lib/http.mjs";

setDefaultResultOrder("ipv4first");

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error("Usage: collect-public-repository-evidence.mjs <resolved-batch> <output>");
}

const input = JSON.parse(await readFile(inputPath, "utf8"));
const candidates = input.candidates.filter((candidate) => candidate.source_code_host === "github");

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchText(url, accept = "text/plain") {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: accept, "User-Agent": "stack127-candidate-review/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(45000),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { url: response.url, text };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw lastError;
}

async function firstFile(owner, repo, paths) {
  for (const path of paths) {
    try {
      const result = await fetchText(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`);
      return { path, source_url: result.url, text: result.text.slice(0, 80000) };
    } catch {
      // Try the next conventional path.
    }
  }
  return null;
}

function parseRepositoryUrl(value) {
  const url = new URL(value);
  const parts = url.pathname.split("/").filter(Boolean);
  if (url.hostname !== "github.com" || parts.length < 2) throw new Error(`Unsupported GitHub URL: ${value}`);
  return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
}

function repositoryPageEvidence(html) {
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? null;
  const imageUrl = html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] ?? null;
  const homepageUrl = html.match(/itemprop="url"[^>]*href="([^"]+)"/i)?.[1]
    ?? html.match(/href="([^"]+)"[^>]*itemprop="url"/i)?.[1]
    ?? null;
  return {
    description: description ? decodeHtml(description) : null,
    image_url: imageUrl ? decodeHtml(imageUrl) : null,
    homepage_url: homepageUrl ? decodeHtml(homepageUrl) : null,
  };
}

async function collect(candidate) {
  const initial = parseRepositoryUrl(candidate.source_code_url);
  const page = await fetchText(candidate.source_code_url, "text/html");
  const canonical = parseRepositoryUrl(page.url);
  const readme = await firstFile(canonical.owner, canonical.repo, ["README.md", "README", "README.rst", "README.txt"]);
  const license = await firstFile(canonical.owner, canonical.repo, [
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "LICENCE",
    "LICENCE.md",
    "COPYING",
    "COPYING.md",
  ]);
  return {
    candidate_id: candidate.id,
    candidate_slug: candidate.slug,
    checked_at: new Date().toISOString(),
    requested_repository_url: candidate.source_code_url,
    repository_url: `https://github.com/${canonical.owner}/${canonical.repo}`,
    redirected: initial.owner.toLowerCase() !== canonical.owner.toLowerCase()
      || initial.repo.toLowerCase() !== canonical.repo.toLowerCase(),
    repository: {
      full_name: `${canonical.owner}/${canonical.repo}`,
      owner: canonical.owner,
      name: canonical.repo,
      ...repositoryPageEvidence(page.text),
    },
    readme,
    license,
  };
}

const records = await mapConcurrent(candidates, 4, async (candidate) => {
  try {
    return { ok: true, ...(await collect(candidate)) };
  } catch (error) {
    return {
      ok: false,
      candidate_id: candidate.id,
      candidate_slug: candidate.slug,
      repository_url: candidate.source_code_url,
      error: String(error.message ?? error),
    };
  }
});

await writeFile(outputPath, `${JSON.stringify({ collected_at: new Date().toISOString(), records }, null, 2)}\n`);
console.log(JSON.stringify({
  checked: records.length,
  passed: records.filter((record) => record.ok).length,
  failed: records.filter((record) => !record.ok).length,
  readmes: records.filter((record) => record.readme).length,
  licenses: records.filter((record) => record.license).length,
}));
