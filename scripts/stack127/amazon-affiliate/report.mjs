import { readFile } from "node:fs/promises";
import path from "node:path";
import { readJson, root } from "./workflow.mjs";

const ledger = await readJson("lib/amazon-affiliate/data/reviews.json");
const candidates = await readJson("lib/amazon-affiliate/data/candidates.json");
const asinResults = new Map();
for (const line of (await readFile(path.join(root, "lib/amazon-affiliate/data/asin-results.jsonl"), "utf8").catch(() => "")).split("\n")) {
  if (!line.trim()) continue;
  try {
    const item = JSON.parse(line);
    if (!item.error) asinResults.set(item.asin, item);
  } catch {
    // Ignore a partial final line while verification is still running.
  }
}
const counts = {};
const directories = {};
for (const review of ledger.reviews) {
  counts[review.status] = (counts[review.status] ?? 0) + 1;
  directories[review.directory] ??= { total: 0 };
  directories[review.directory].total += 1;
  directories[review.directory][review.status] = (directories[review.directory][review.status] ?? 0) + 1;
}

console.log(JSON.stringify({
  directories,
  marketplace: ledger.marketplace,
  partner_tag: ledger.partner_tag,
  source_review: {
    candidate_links: candidates.records.reduce((sum, item) => sum + item.source_candidates.length, 0),
    listed_asins_checked: [...asinResults.values()].filter((item) => item.availability === "listed").length,
    unavailable_asins_checked: [...asinResults.values()].filter((item) => item.availability === "unavailable").length,
    unique_candidate_asins: new Set(candidates.records.flatMap((item) => item.source_candidates.map((candidate) => candidate.asin))).size,
  },
  statuses: counts,
  total: ledger.reviews.length,
}, null, 2));
