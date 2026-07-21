#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  throw new Error("Usage: collect-license-evidence.mjs <review-packet.json> <output.json>");
}

const input = JSON.parse(await readFile(inputPath, "utf8"));
let token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;
if (!token) {
  try {
    token = execFileSync("gh", ["auth", "token"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    token = null;
  }
}
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "version127-license-review",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

const results = [];

for (const record of input.records ?? []) {
  const repository = record.github?.repository;
  if (!repository || (repository.license?.spdx_id && repository.license.spdx_id !== "NOASSERTION")) continue;

  const paths = (record.github?.relevant_repository_files ?? [])
    .filter((path) => /(^|\/)(license|licence|copying)(\.|$)/i.test(path))
    .filter((path) => !path.includes("/node_modules/"))
    .slice(0, 4);
  const files = [];

  for (const path of paths) {
    try {
      const data = await getJson(`https://api.github.com/repos/${repository.full_name}/contents/${encodeURIComponent(path).replaceAll("%2F", "/")}`);
      if (data.type !== "file" || !data.content) continue;
      files.push({
        path,
        html_url: data.html_url,
        text: Buffer.from(data.content, "base64").toString("utf8").slice(0, 12000),
      });
    } catch (error) {
      files.push({ path, error: String(error.message ?? error) });
    }
  }

  results.push({
    candidate_id: record.candidate.id,
    name: record.candidate.name,
    repository: repository.full_name,
    files,
  });
}

await writeFile(outputPath, `${JSON.stringify({ collected_at: new Date().toISOString(), records: results }, null, 2)}\n`);
console.log(JSON.stringify({ records: results.length, output: outputPath }));
