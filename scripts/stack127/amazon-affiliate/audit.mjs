import { scoreAmazonCandidate } from "./lib.mjs";
import { loadDirectoryRecords, parseArgs, readJson } from "./workflow.mjs";

const args = parseArgs(process.argv);
const ledger = await readJson("lib/amazon-affiliate/data/reviews.json");
const expected = new Map((await loadDirectoryRecords()).map(({ directory, record }) => [`${directory}/${record.slug}`, record]));
const actual = new Map();
const errors = [];

if (ledger.marketplace !== "US") errors.push("Ledger marketplace is not US.");
if (ledger.partner_tag !== "stack127-20") errors.push("Ledger partner tag is not stack127-20.");

for (const review of ledger.reviews) {
  const key = `${review.directory}/${review.record_slug}`;
  if (actual.has(key)) errors.push(`Duplicate review: ${key}`);
  actual.set(key, review);
  if (!expected.has(key)) errors.push(`Review has no current directory record: ${key}`);
  if (review.status === "confirmed") {
    const record = expected.get(key);
    const amazonEvidence = review.evidence.find((item) => item.url.includes(`/dp/${review.asin}`));
    if (!amazonEvidence) errors.push(`Confirmed review has no ASIN evidence: ${key}`);
    else if (!scoreAmazonCandidate(record, { asin: review.asin, title: amazonEvidence.title, url: amazonEvidence.url }).vendor_match) {
      errors.push(`Amazon title does not match the record vendor: ${key}`);
    }
  }
}

for (const key of expected.keys()) if (!actual.has(key)) errors.push(`Missing review: ${key}`);
const pending = ledger.reviews.filter((review) => review.status === "needs-review");
if (pending.length > 0 && !args["allow-pending"]) errors.push(`${pending.length} records still need Amazon review.`);

if (errors.length > 0) {
  console.error(errors.slice(0, 50).join("\n"));
  if (errors.length > 50) console.error(`...and ${errors.length - 50} more errors.`);
  process.exitCode = 1;
} else {
  console.log(`Amazon affiliate audit passed for ${ledger.reviews.length.toLocaleString("en-US")} records.`);
}
