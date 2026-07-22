#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const [batchPath, decisionsPath, outputPath] = process.argv.slice(2);
if (!batchPath || !decisionsPath || !outputPath) {
  throw new Error("Usage: build-legacy-decisions.mjs <batch> <decisions> <output>");
}

const batch = JSON.parse(await readFile(batchPath, "utf8"));
const decisions = JSON.parse(await readFile(decisionsPath, "utf8"));
const candidatesByName = new Map(batch.candidates.map((candidate) => [candidate.name, candidate]));
const records = [];

for (const [name, reason] of Object.entries(decisions.reject)) {
  const candidate = candidatesByName.get(name);
  if (!candidate) throw new Error(`Missing candidate: ${name}`);
  records.push({ candidate_id: candidate.id, decision: "reject", reason });
}
for (const [name, reason] of Object.entries(decisions.needs_review)) {
  const candidate = candidatesByName.get(name);
  if (!candidate) throw new Error(`Missing candidate: ${name}`);
  records.push({ candidate_id: candidate.id, decision: "needs_review", reason });
}

if (records.length !== 63) throw new Error(`Expected 63 decisions, found ${records.length}`);
await writeFile(outputPath, `${JSON.stringify({ reviewed_at: new Date().toISOString(), records }, null, 2)}\n`);
console.log(JSON.stringify({ reject: Object.keys(decisions.reject).length, needs_review: Object.keys(decisions.needs_review).length }));
