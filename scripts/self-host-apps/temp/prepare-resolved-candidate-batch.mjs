#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { canonicalUrl } from "../lib/candidates.mjs";
import { withClient } from "../lib/db.mjs";

const [batchPath, evidencePath, resolvedPath, duplicatesPath] = process.argv.slice(2);
if (!batchPath || !evidencePath || !resolvedPath || !duplicatesPath) {
  throw new Error(
    "Usage: prepare-resolved-candidate-batch.mjs <batch> <directory-evidence> <resolved-output> <duplicates-output>",
  );
}

function sourceHost(value) {
  const host = new URL(value).hostname.toLowerCase();
  if (host === "github.com") return "github";
  if (host === "gitlab.com") return "gitlab";
  if (host === "codeberg.org") return "codeberg";
  return "other";
}

const batch = JSON.parse(await readFile(batchPath, "utf8"));
const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
const byCandidate = new Map(evidence.records.map((record) => [record.candidate_id, record]));
const resolved = batch.candidates.map((candidate) => {
  const record = byCandidate.get(candidate.id);
  const sourceCodeUrl = record?.evidence?.source_code_url ?? candidate.source_code_url;
  if (!sourceCodeUrl) throw new Error(`Missing source identity for ${candidate.name}`);
  return {
    ...candidate,
    source_code_url: sourceCodeUrl,
    source_code_host: sourceHost(sourceCodeUrl),
    canonical_source_code_key: canonicalUrl(sourceCodeUrl),
    payload: {
      ...candidate.payload,
      identity_review: {
        source_url: candidate.source_url,
        source_code_url: sourceCodeUrl,
        directory_title: record?.evidence?.title ?? candidate.name,
        directory_description: record?.evidence?.description ?? candidate.payload?.description ?? null,
        directory_image_url: record?.evidence?.image_url ?? candidate.payload?.icon_url ?? null,
        checked_at: evidence.collected_at,
      },
    },
  };
});

const duplicates = await withClient(async (client) => {
  const result = await client.query(
    `
      select id, name, slug, source_code_url
      from public.open_projects
    `,
  );
  const projects = new Map(result.rows.map((project) => [canonicalUrl(project.source_code_url), project]));
  return resolved.flatMap((candidate) => {
    const project = projects.get(candidate.canonical_source_code_key);
    if (!project) return [];
    return [{
      candidate_id: candidate.id,
      decision: "duplicate",
      project_id: project.id,
      reason: `Exact source-code URL match with ${project.name} (${project.slug}).`,
    }];
  });
});

const duplicateIds = new Set(duplicates.map((record) => record.candidate_id));
await writeFile(
  resolvedPath,
  `${JSON.stringify({ ...batch, candidates: resolved.filter((candidate) => !duplicateIds.has(candidate.id)) }, null, 2)}\n`,
);
await writeFile(duplicatesPath, `${JSON.stringify({ records: duplicates }, null, 2)}\n`);
console.log(JSON.stringify({ resolved: resolved.length, duplicates: duplicates.length, new_projects: resolved.length - duplicates.length }));
