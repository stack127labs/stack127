#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const [batchPath, directoryPath, repositoryPath, outputPath] = process.argv.slice(2);
if (!batchPath || !directoryPath || !repositoryPath || !outputPath) {
  throw new Error(
    "Usage: build-editorial-worksheet.mjs <resolved-batch> <directory-evidence> <repository-evidence> <output>",
  );
}

const batch = JSON.parse(await readFile(batchPath, "utf8"));
const directory = JSON.parse(await readFile(directoryPath, "utf8"));
const repositories = JSON.parse(await readFile(repositoryPath, "utf8"));
const directoryByCandidate = new Map(directory.records.map((record) => [record.candidate_id, record]));
const repositoryByCandidate = new Map(repositories.records.map((record) => [record.candidate_id, record]));

function plainText(markdown) {
  return String(markdown ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}[#>*+-]+\s*/gm, "")
    .replace(/[`*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function links(markdown) {
  return [...new Set([...String(markdown ?? "").matchAll(/https?:\/\/[^\s)>"']+/g)].map((match) => match[0].replace(/[.,;:]$/, "")))]
    .filter((url) => /docs?|install|deploy|docker|compose|setup|getting.?started|guide|wiki/i.test(url))
    .slice(0, 20);
}

function evidenceLines(markdown) {
  return String(markdown ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && /self.?host|docker|compose|install|deploy|setup|database|postgres|mysql|mariadb|sqlite|license/i.test(line))
    .slice(0, 30);
}

const records = batch.candidates.flatMap((candidate) => {
  const repo = repositoryByCandidate.get(candidate.id);
  if (!repo?.ok) return [];
  const directoryRecord = directoryByCandidate.get(candidate.id);
  return [{
    candidate_id: candidate.id,
    slug: candidate.slug,
    name: candidate.name,
    repository_url: repo.repository_url,
    directory_url: candidate.source_url,
    directory_description: directoryRecord?.evidence?.description ?? null,
    directory_image_url: directoryRecord?.evidence?.image_url ?? null,
    repository_description: repo.repository?.description ?? null,
    repository_homepage_url: repo.repository?.homepage_url ?? null,
    repository_image_url: repo.repository?.image_url ?? null,
    readme_url: repo.readme?.source_url ?? null,
    readme_excerpt: plainText(repo.readme?.text).slice(0, 2400),
    evidence_lines: evidenceLines(repo.readme?.text),
    official_links: links(repo.readme?.text),
    license_path: repo.license?.path ?? null,
    license_url: repo.license?.source_url ?? null,
    license_excerpt: plainText(repo.license?.text).slice(0, 1200),
  }];
});

await writeFile(outputPath, `${JSON.stringify({ created_at: new Date().toISOString(), records }, null, 2)}\n`);
console.log(JSON.stringify({ records: records.length, output: outputPath }));
