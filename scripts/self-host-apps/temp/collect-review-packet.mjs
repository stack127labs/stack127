#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { mapConcurrent } from "../lib/http.mjs";

const batchPath = process.argv[2];
const evidencePath = process.argv[3];
const outputPath = process.argv[4];

if (!batchPath || !evidencePath || !outputPath) {
  throw new Error("Usage: collect-review-packet.mjs <batch> <github-evidence> <output>");
}

const batch = JSON.parse(await readFile(batchPath, "utf8"));
const github = JSON.parse(await readFile(evidencePath, "utf8"));
const candidates = new Map(batch.candidates.map((candidate) => [candidate.id, candidate]));

function officialLinks(markdown) {
  const urls = [...markdown.matchAll(/https?:\/\/[^\s)>"']+/g)].map((match) => match[0].replace(/[.,;:]$/, ""));
  return [...new Set(urls)]
    .filter((url) => /docs?|install|deploy|docker|compose|self.?host|setup|getting.?started/i.test(url))
    .slice(0, 40);
}

function evidenceLines(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && /self.?host|docker|compose|install|deploy|setup|license/i.test(line))
    .slice(0, 80);
}

async function fetchReadme(item) {
  const candidate = candidates.get(item.candidate_id);
  try {
    const response = await fetch(item.readme.download_url, {
      headers: { Accept: "text/plain", "User-Agent": "version127-candidate-review/1.0" },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    return {
      candidate,
      github: item,
      readme: {
        source_url: item.readme.html_url,
        text: markdown.slice(0, 60000),
        official_links: officialLinks(markdown),
        evidence_lines: evidenceLines(markdown),
      },
    };
  } catch (error) {
    return { candidate, github: item, readme: { error: error.message } };
  }
}

const records = await mapConcurrent(github.evidence, 8, fetchReadme);
await writeFile(
  outputPath,
  `${JSON.stringify({ collected_at: new Date().toISOString(), records, failures: github.failures }, null, 2)}\n`,
);
console.log(`Wrote ${records.length} review record(s) to ${outputPath}.`);
