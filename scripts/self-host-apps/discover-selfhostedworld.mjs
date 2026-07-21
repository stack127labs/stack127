#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import {
  canonicalSourceCodeUrl,
  canonicalUrl,
  normalizeCandidate,
  storeCandidates,
} from "./lib/candidates.mjs";
import { withClient } from "./lib/db.mjs";
import { fetchText, mapConcurrent } from "./lib/http.mjs";
import { itemListEntries, softwareApplication } from "./lib/structured-data.mjs";

const source = "selfhostedworld";
const sourceUrl = "https://selfhostedworld.com/software";
const sitemapUrl = "https://selfhostedworld.com/sitemap.xml";

function nameFromUrl(value) {
  const slug = new URL(value).pathname.split("/").filter(Boolean).at(-1) ?? "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function sitemapSoftwareUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].replace(/&amp;/g, "&"))
    .filter((url) => /^https:\/\/selfhostedworld\.com\/software\/.+/i.test(url));
}

function externalWebsite(application, detailUrl, sourceCodeUrl) {
  const values = Array.isArray(application?.sameAs) ? application.sameAs : [application?.sameAs];
  return values.find((value) => {
    if (typeof value !== "string") return false;
    const key = canonicalUrl(value);
    return key && key !== canonicalUrl(detailUrl) && key !== canonicalUrl(sourceCodeUrl);
  }) ?? null;
}

async function addDetail(listing) {
  try {
    const html = await fetchText(listing.url);
    const application = softwareApplication(html);
    const sourceCodeUrl = canonicalSourceCodeUrl(
      application?.codeRepository ?? application?.downloadUrl ?? null,
    );

    return {
      name: application?.name ?? listing.name,
      summary: application?.description ?? listing.description,
      source_url: listing.url,
      source_key: canonicalUrl(listing.url),
      source_code_url: sourceCodeUrl,
      website_url: externalWebsite(application, listing.url, sourceCodeUrl),
      payload: { listing: listing.payload, detail: application },
    };
  } catch (error) {
    return {
      name: listing.name,
      source_url: listing.url,
      source_key: canonicalUrl(listing.url),
      payload: { listing: listing.payload, detail_error: error.message },
    };
  }
}

function listingCandidate(listing) {
  return {
    name: listing.name,
    summary: listing.description,
    source_url: listing.url,
    source_key: canonicalUrl(listing.url),
    payload: { listing: listing.payload },
  };
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);
  const concurrency = numberArg(args, "concurrency", 4);
  const [html, sitemap] = await Promise.all([fetchText(sourceUrl), fetchText(sitemapUrl)]);
  const featured = new Map(
    itemListEntries(html)
      .filter((entry) => entry.name && /^https:\/\/selfhostedworld\.com\/software\//i.test(entry.url ?? ""))
      .map((entry) => [canonicalUrl(entry.url), entry]),
  );
  const listings = sitemapSoftwareUrls(sitemap)
    .map((url, index) => featured.get(canonicalUrl(url)) ?? {
      name: nameFromUrl(url),
      url,
      description: null,
      position: index + 1,
      payload: { source: "sitemap", url },
    })
    .slice(0, limit);

  const rawCandidates = args.details
    ? await mapConcurrent(listings, concurrency, addDetail)
    : listings.map(listingCandidate);
  const candidates = rawCandidates
    .map((candidate) => normalizeCandidate(candidate, { source, sourceUrl, baseUrl: sourceUrl }))
    .filter(Boolean);
  const result = {
    source,
    source_url: sourceUrl,
    fetched_at: new Date().toISOString(),
    details_fetched: Boolean(args.details),
    candidate_count: candidates.length,
    candidates,
  };

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify(result, null, 2)}\n`);
    console.log(`Wrote ${candidates.length} candidate(s) to ${args.out}`);
  }

  if (!args.write) {
    console.log(JSON.stringify({ ...result, candidates: candidates.slice(0, 20) }, null, 2));
    return;
  }

  await withClient(async (client) => {
    const stored = await storeCandidates(client, candidates, {
      source,
      sourceUrl,
      notes: `Selfhostedworld ItemList discovery${args.details ? " with detail evidence" : ""}.`,
    });
    console.log(JSON.stringify(stored, null, 2));
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
