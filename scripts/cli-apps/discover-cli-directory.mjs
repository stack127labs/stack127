#!/usr/bin/env node

// CLI Directory (cli.directory) discovery: exhaust the /cli/ URLs in the
// sitemap, then fetch each page for the repository and maker links.

import { parseArgs } from "./lib/args.mjs";
import { fetchText, mapConcurrent } from "./lib/http.mjs";
import { extractSitemapLocs, decodeEntities } from "./lib/html.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "cli_directory";
const baseUrl = "https://www.cli.directory";

function parseToolPage(html, pageUrl) {
  const slug = new URL(pageUrl).pathname.split("/").pop();
  const nameMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
  const repoMatch = html.match(/href="(https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:\?[^"]*)?"/);
  const tags = [...html.matchAll(/class="inline-flex items-center[^"]*"[^>]*>([^<]{2,40})<\/span>/g)]
    .map((m) => decodeEntities(m[1]).trim())
    .filter((t) => t && t.length < 30)
    .slice(0, 8);

  return {
    name: decodeEntities(nameMatch?.[1] ?? "").replace(/\s+/g, " ").trim() || slug,
    summary: decodeEntities(descMatch?.[1] ?? "").trim() || null,
    repository_url: repoMatch?.[1] ?? null,
    categories: tags,
    payload: { cli_directory_slug: slug },
  };
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const concurrency = Number(args.concurrency ?? 4);

  let candidates;
  try {
    const sitemapXml = await fetchText(`${baseUrl}/sitemap.xml`, { minIntervalMs: 400 });
    const toolUrls = extractSitemapLocs(sitemapXml)
      .map((loc) => loc.replace("clidirectory.com", "www.cli.directory"))
      .filter((loc) => /\/cli\/[^/]+\/?$/.test(loc));

    console.log(`cli.directory sitemap: ${toolUrls.length} tool pages`);

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

    console.log(`parsed ${candidates.length} cli.directory candidates`);
  } catch (error) {
    console.error(`cli.directory failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: `${baseUrl}/sitemap.xml`, error }));
    }
    process.exit(1);
  }

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: baseUrl,
      notes: "CLI Directory sitemap crawl",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
