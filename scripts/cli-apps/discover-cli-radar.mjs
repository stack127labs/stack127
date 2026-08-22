#!/usr/bin/env node

// CLI Radar discovery: exhaust the /tool/ URLs in the sitemap, then read the
// SoftwareApplication JSON-LD each page publishes.

import { parseArgs } from "./lib/args.mjs";
import { fetchText, mapConcurrent } from "./lib/http.mjs";
import { extractSitemapLocs, extractJsonLd, decodeEntities } from "./lib/html.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "cli_radar";
const baseUrl = "https://cliradar.com";

function parseToolPage(html, pageUrl) {
  const slug = new URL(pageUrl).pathname.split("/").pop();
  const software = extractJsonLd(html).find((entry) => entry["@type"] === "SoftwareApplication");
  const nameMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);

  if (!software && !nameMatch) return null;

  const stars = software?.interactionStatistic?.userInteractionCount;

  return {
    name: decodeEntities(software?.name ?? nameMatch?.[1] ?? "").replace(/\s+/g, " ").trim() || slug,
    summary: software?.description ? decodeEntities(software.description).trim() : null,
    repository_url: typeof software?.sameAs === "string" && software.sameAs.includes("github.com")
      ? software.sameAs
      : null,
    website_url: null,
    language: software?.programmingLanguage ?? null,
    license: software?.license ?? null,
    latest_version: software?.softwareVersion ?? null,
    latest_release_at: software?.dateModified ?? null,
    stars: Number.isFinite(Number(stars)) ? Number(stars) : null,
    categories: [software?.applicationCategory].filter(Boolean),
    payload: {
      cli_radar_slug: slug,
      is_accessible_for_free: software?.isAccessibleForFree ?? null,
      author: software?.author?.name ?? null,
      date_published: software?.datePublished ?? null,
    },
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
      .map((loc) => (loc.endsWith("/") ? loc.slice(0, -1) : loc))
      .filter((loc) => /\/tool\/[^/]+$/.test(loc));

    console.log(`cli radar sitemap: ${toolUrls.length} tool pages`);

    const results = await mapConcurrent(toolUrls, concurrency, async (url) => {
      const html = await fetchText(url, { minIntervalMs: 350 });
      return parseToolPage(html, url);
    });

    candidates = [];
    let failedPages = 0;
    for (let index = 0; index < results.length; index += 1) {
      const result = results[index];
      if (!result.ok || !result.value) {
        failedPages += 1;
        if (!result.ok) console.warn(`page failed ${toolUrls[index]}: ${result.error.message}`);
        continue;
      }
      const normalized = normalizeCandidate(result.value, {
        source,
        sourceType: "directory",
        sourceUrl: toolUrls[index],
      });
      if (normalized) candidates.push(normalized);
    }

    console.log(`parsed ${candidates.length} cli radar candidates (${failedPages} pages unusable)`);
  } catch (error) {
    console.error(`cli radar failed: ${error.message}`);
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
      notes: "CLI Radar sitemap + SoftwareApplication JSON-LD crawl",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
