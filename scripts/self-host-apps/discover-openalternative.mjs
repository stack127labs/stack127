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

const source = "openalternative-self-hosted";
const sourceUrl = "https://openalternative.co/collections/self-hosted";

function sourcePage(page) {
  return page === 1 ? sourceUrl : `${sourceUrl}?page=${page}`;
}

async function discoverListings(maxPages) {
  const seen = new Set();
  const listings = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const url = sourcePage(page);
    const html = await fetchText(url);
    const entries = itemListEntries(html).filter(
      (entry) => entry.name && /^https:\/\/openalternative\.co\/[^/]+\/?$/i.test(entry.url ?? ""),
    );
    const fresh = entries.filter((entry) => !seen.has(canonicalUrl(entry.url)));
    if (fresh.length === 0) break;

    for (const entry of fresh) {
      seen.add(canonicalUrl(entry.url));
      listings.push({ ...entry, collection_page: url });
    }
  }

  return listings;
}

async function addDetail(listing) {
  try {
    const html = await fetchText(listing.url);
    const application = softwareApplication(html);
    const sourceCodeUrl = canonicalSourceCodeUrl(
      application?.downloadUrl ?? application?.codeRepository ?? null,
    );

    return {
      name: application?.name ?? listing.name,
      summary: application?.description ?? listing.description,
      source_url: listing.url,
      source_key: canonicalUrl(listing.url),
      source_code_url: sourceCodeUrl,
      surfaces: typeof application?.operatingSystem === "string"
        ? application.operatingSystem.split(",").map((value) => value.trim()).filter(Boolean)
        : [],
      payload: { listing: listing.payload, detail: application, collection_page: listing.collection_page },
    };
  } catch (error) {
    return {
      name: listing.name,
      summary: listing.description,
      source_url: listing.url,
      source_key: canonicalUrl(listing.url),
      payload: {
        listing: listing.payload,
        collection_page: listing.collection_page,
        detail_error: error.message,
      },
    };
  }
}

function listingCandidate(listing) {
  return {
    name: listing.name,
    summary: listing.description,
    source_url: listing.url,
    source_key: canonicalUrl(listing.url),
    payload: { listing: listing.payload, collection_page: listing.collection_page },
  };
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);
  const maxPages = numberArg(args, "pages", 50);
  const concurrency = numberArg(args, "concurrency", 4);
  const listings = (await discoverListings(maxPages)).slice(0, limit);
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
      notes: `OpenAlternative self-hosted collection discovery${args.details ? " with detail evidence" : ""}.`,
    });
    console.log(JSON.stringify(stored, null, 2));
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
