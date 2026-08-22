#!/usr/bin/env node

// TerminalDock discovery: exhaust the tools sitemap, then fetch every tool
// page for kind, categories, language, tags, license, and repository links.

import { parseArgs } from "./lib/args.mjs";
import { fetchText, mapConcurrent } from "./lib/http.mjs";
import { extractSitemapLocs, decodeEntities } from "./lib/html.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "terminaldock";
const baseUrl = "https://terminaldock.com";

function lastSegment(url) {
  return decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() ?? "");
}

function parseToolPage(html, pageUrl) {
  const slug = lastSegment(pageUrl);

  const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const descMatch = html.match(/<h2 class="max-w-2xl[^"]*"[^>]*>([\s\S]*?)<\/h2>/);
  const repoPattern = /href="(https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:\?[^"]*)?"/g;
  const githubLinks = [...html.matchAll(repoPattern)].map((m) => m[1]);
  // The primary repository is the first GitHub link inside the tool header.
  const headerArea = html.match(/<h1[\s\S]{0,4000}?href="(https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:\?[^"]*)?"/);
  const headerGithub = headerArea ? [headerArea[1]] : [];

  // Badge rows sit directly under the description; sidebar links use other markup.
  const badgeArea = descMatch ? html.slice(html.indexOf(descMatch[0]), html.indexOf(descMatch[0]) + 4000) : "";
  const kinds = [...badgeArea.matchAll(/class="inline-flex items-center rounded-sm[^"]*"\s*href="\/kinds\/([a-z0-9-]+)"/g)].map((m) => m[1]);
  const categories = [...html.matchAll(/class="inline-flex items-center text-secondary-foreground font-medium border border-transparent[^"]*"\s*href="\/categories\/([a-z0-9-]+)"/g)].map((m) => m[1]);
  const languages = [...html.matchAll(/href="\/languages\/([a-z0-9-]+)"[\s\S]{0,80}?--lang-color/g)].map((m) => m[1]);
  const tags = [...html.matchAll(/href="\/tags\/([a-z0-9-]+)"/g)].map((m) => m[1]);
  const licenseMatch = html.match(/href="https:\/\/spdx\.org\/licenses\/([A-Za-z0-9.-]+)\.html/);

  return {
    name: decodeEntities(nameMatch?.[1] ?? "").trim() || slug,
    summary: decodeEntities(descMatch?.[1] ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || null,
    repository_url: headerGithub[0] ?? githubLinks.find((u) => u.toLowerCase().includes(`/${slug.toLowerCase()}`)) ?? githubLinks[0] ?? null,
    license: licenseMatch ? licenseMatch[1] : null,
    categories: [...new Set([...kinds.map((k) => `kind:${k}`), ...categories, ...tags.map((t) => `tag:${t}`)])],
    platforms: [],
    install_methods: [],
    payload: {
      kinds: [...new Set(kinds)],
      categories,
      languages,
      tags,
      all_github_links: [...new Set(githubLinks)].slice(0, 8),
      terminaldock_slug: slug,
    },
  };
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const concurrency = Number(args.concurrency ?? 4);

  let candidates;
  try {
    const sitemapXml = await fetchText(`${baseUrl}/sitemap/tools.xml`, { minIntervalMs: 400 });
    const toolUrls = extractSitemapLocs(sitemapXml)
      .filter((loc) => !loc.includes("/sitemap/") && loc !== `${baseUrl}/` && loc !== `${baseUrl}`);

    console.log(`terminaldock tools sitemap: ${toolUrls.length} tool pages`);

    const results = await mapConcurrent(toolUrls, concurrency, async (url) => {
      const html = await fetchText(url, { minIntervalMs: 350 });
      return parseToolPage(html, url);
    });

    candidates = [];
    for (let index = 0; index < results.length; index += 1) {
      const result = results[index];
      if (!result.ok) {
        console.warn(`page failed ${toolUrls[index]}: ${result.error.message}`);
        continue;
      }
      const normalized = normalizeCandidate(result.value, {
        source,
        sourceType: "directory",
        sourceUrl: toolUrls[index],
      });
      if (normalized) candidates.push(normalized);
    }

    console.log(`parsed ${candidates.length} terminaldock candidates`);
  } catch (error) {
    console.error(`terminaldock failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, {
        source,
        sourceUrl: `${baseUrl}/sitemap/tools.xml`,
        error,
      }));
    }
    process.exit(1);
  }

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    const path = await import("node:path");
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
    console.log(`wrote report to ${args.out}`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: `${baseUrl}/tools`,
      notes: "TerminalDock tools sitemap crawl",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
