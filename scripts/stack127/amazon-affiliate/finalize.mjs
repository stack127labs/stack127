import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  chooseExactCandidate,
  hasUsMarketplaceVariant,
  isRetailIdentity,
  isUsProductTitle,
  readJson,
  reviewDate,
  root,
  sourceIdentityMatches,
} from "./workflow.mjs";
import { scoreAmazonCandidate } from "./lib.mjs";

const candidates = await readJson("lib/amazon-affiliate/data/candidates.json");
const creatorsFile = path.join(root, "lib/amazon-affiliate/data/creators-api-results.jsonl");
const creatorsByKey = new Map();
for (const line of (await readFile(creatorsFile, "utf8").catch(() => "")).split("\n")) {
  if (!line.trim()) continue;
  try {
    const item = JSON.parse(line);
    if (!item.error) creatorsByKey.set(`${item.directory}/${item.record_slug}`, item);
  } catch {
    // Ignore a partial final line; the discovery command will retry it.
  }
}
const asinUseCount = new Map();
for (const item of candidates.records) {
  for (const candidate of item.source_candidates) asinUseCount.set(candidate.asin, (asinUseCount.get(candidate.asin) ?? 0) + 1);
}
const asinFile = path.join(root, "lib/amazon-affiliate/data/asin-results.jsonl");
const asinById = new Map();
for (const line of (await readFile(asinFile, "utf8").catch(() => "")).split("\n")) {
  if (!line.trim()) continue;
  try {
    const item = JSON.parse(line);
    if (!item.error) asinById.set(item.asin, item);
  } catch {
    // Ignore a partial final line; the verification command will retry it.
  }
}
const snapshots = new Map();
for (const item of candidates.records) {
  if (snapshots.has(item.directory)) continue;
  const file = item.directory === "zigbee-devices"
    ? "lib/zigbee-devices/data/devices.json"
    : `lib/hardware-directories/data/${item.directory}.json`;
  const snapshot = await readJson(file);
  snapshots.set(item.directory, new Map((snapshot.devices ?? snapshot.records).map((record) => [record.slug, record])));
}

const reviews = [];
for (const item of candidates.records) {
  const record = snapshots.get(item.directory).get(item.record_slug);
  const key = `${item.directory}/${item.record_slug}`;
  const creators = creatorsByKey.get(key);
  const resultPool = [
    ...(creators?.results ?? []),
    ...item.source_candidates.flatMap((candidate) => asinById.has(candidate.asin) ? [asinById.get(candidate.asin)] : []),
  ];
  const exact = chooseExactCandidate(item.identity, resultPool);
  const sourceBacked = exact ?? item.source_candidates.flatMap((candidate) => {
    const product = asinById.get(candidate.asin);
    if (!product || !candidate.source_identity || asinUseCount.get(candidate.asin) !== 1) return [];
    const amazonMatch = scoreAmazonCandidate(item.identity, product);
    return sourceIdentityMatches(item.identity, candidate.source_identity) && amazonMatch.vendor_match && amazonMatch.name_overlap >= 1 ? [product] : [];
  })[0] ?? null;
  const evidence = [{
    ...item.source_evidence,
    title: `${item.identity.vendor} ${item.identity.model} — ${item.source_evidence.title}`,
  }];

  if (!isRetailIdentity(item.directory, record)) {
    reviews.push({
      directory: item.directory,
      evidence,
      identity_hash: item.identity_hash,
      marketplace: "US",
      reason: "The source record does not identify a distinct retail hardware model.",
      record_slug: item.record_slug,
      reviewed_at: reviewDate,
      status: "not-retail",
    });
    continue;
  }

  if (!hasUsMarketplaceVariant(record)) {
    reviews.push({
      directory: item.directory,
      evidence,
      identity_hash: item.identity_hash,
      marketplace: "US",
      reason: record.certification_variant_kind === "z-wave"
        ? "The source record does not document a US-frequency Z-Wave variant."
        : "The source identity or electrical facts identify a non-US retail variant.",
      record_slug: item.record_slug,
      reviewed_at: reviewDate,
      status: "regional-mismatch",
    });
    continue;
  }

  if (sourceBacked && !isUsProductTitle(sourceBacked.title)) {
    reviews.push({
      directory: item.directory,
      evidence: [...evidence, { kind: "amazon-result", title: sourceBacked.title, url: `https://www.amazon.com/dp/${sourceBacked.asin}` }],
      identity_hash: item.identity_hash,
      marketplace: "US",
      reason: "The Amazon listing identifies a non-US plug, socket, outlet, or regional model.",
      record_slug: item.record_slug,
      reviewed_at: reviewDate,
      status: "regional-mismatch",
    });
    continue;
  }

  if (sourceBacked) {
    evidence.push({
      kind: "amazon-result",
      title: sourceBacked.title,
      url: `https://www.amazon.com/dp/${sourceBacked.asin}`,
    });
    reviews.push({
      asin: sourceBacked.asin,
      directory: item.directory,
      evidence,
      identity_hash: item.identity_hash,
      matched_identifiers: [item.identity.vendor, item.identity.model],
      marketplace: "US",
      record_slug: item.record_slug,
      reviewed_at: reviewDate,
      status: "confirmed",
    });
    continue;
  }

  if (creators) {
    if (creators.search_url) evidence.push({
      kind: "amazon-result",
      title: `Amazon Creators API search for ${item.identity.vendor} ${item.identity.model}`,
      url: creators.search_url,
    });
    reviews.push({
      directory: item.directory,
      evidence,
      identity_hash: item.identity_hash,
      marketplace: "US",
      reason: "Amazon Creators API SearchItems returned no listing that matched both the exact model and vendor identity.",
      record_slug: item.record_slug,
      reviewed_at: reviewDate,
      status: "no-confirmed-match",
    });
    continue;
  }

  reviews.push({
    directory: item.directory,
    evidence,
    identity_hash: item.identity_hash,
    marketplace: "US",
    record_slug: item.record_slug,
    status: "needs-review",
  });
}

const confirmed = reviews.filter((review) => review.status === "confirmed");
const header = { generated_at: new Date().toISOString(), marketplace: "US", partner_tag: "stack127-20" };
await writeFile(path.join(root, "lib/amazon-affiliate/data/reviews.json"), `${JSON.stringify({ ...header, reviews }, null, 2)}\n`);
await writeFile(path.join(root, "lib/amazon-affiliate/data/confirmed.json"), `${JSON.stringify({ ...header, reviews: confirmed }, null, 2)}\n`);
console.log(JSON.stringify(reviews.reduce((counts, review) => ({ ...counts, [review.status]: (counts[review.status] ?? 0) + 1 }), {}), null, 2));
