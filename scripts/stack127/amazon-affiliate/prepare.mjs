import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  amazonCandidatesFromRecord,
  blakadderCandidates,
  identityFor,
  identityHash,
  loadBlakadderIndex,
  loadDirectoryRecords,
  parseArgs,
  queryFor,
  root,
  sourceEvidence,
} from "./workflow.mjs";

const args = parseArgs(process.argv);
const outputDirectory = path.join(root, "lib/amazon-affiliate/data");
const reviewsFile = path.join(outputDirectory, "reviews.json");
const candidatesFile = path.join(outputDirectory, "candidates.json");
const previous = await readFile(reviewsFile, "utf8").then(JSON.parse).catch(() => ({ reviews: [] }));
const previousByKey = new Map(previous.reviews.map((review) => [`${review.directory}/${review.record_slug}`, review]));
const blakadder = await loadBlakadderIndex(args["blakadder-root"]);
const candidates = [];
const reviews = [];

for (const { directory, record } of await loadDirectoryRecords()) {
  const key = `${directory}/${record.slug}`;
  const hash = identityHash(record);
  const previousReview = previousByKey.get(key);
  const sourceCandidates = new Map([
    ...amazonCandidatesFromRecord(record),
    ...blakadderCandidates(record, blakadder),
  ].map((item) => [item.asin, item]));
  const identity = identityFor(record);
  candidates.push({
    directory,
    identity,
    identity_hash: hash,
    query: queryFor(identity),
    record_slug: record.slug,
    source_candidates: [...sourceCandidates.values()],
    source_evidence: sourceEvidence(record),
  });
  reviews.push(previousReview?.identity_hash === hash && previousReview.status !== "needs-review"
    ? previousReview
    : {
        directory,
        evidence: [sourceEvidence(record)],
        identity_hash: hash,
        marketplace: "US",
        record_slug: record.slug,
        status: "needs-review",
      });
}

await mkdir(outputDirectory, { recursive: true });
await writeFile(candidatesFile, `${JSON.stringify({ generated_at: new Date().toISOString(), marketplace: "US", records: candidates }, null, 2)}\n`);
await writeFile(reviewsFile, `${JSON.stringify({ generated_at: new Date().toISOString(), marketplace: "US", partner_tag: "stack127-20", reviews }, null, 2)}\n`);
console.log(JSON.stringify({ records: reviews.length, source_candidates: candidates.reduce((sum, item) => sum + item.source_candidates.length, 0) }));
