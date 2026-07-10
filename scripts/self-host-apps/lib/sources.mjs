import { readFile, writeFile } from "node:fs/promises";

export async function readSource({ file, url }) {
  if (file) return readFile(file, "utf8");
  if (url) {
    const response = await fetch(url, {
      headers: { "User-Agent": "version127-self-host-apps" },
    });
    if (!response.ok) throw new Error(`Source fetch failed ${response.status}: ${url}`);
    return response.text();
  }
  throw new Error("Pass --file or --url.");
}

export function parseAwesomeSource(text) {
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.apps)) return json.apps;
    if (Array.isArray(json.projects)) return json.projects;
  } catch {
    // Fall through to Markdown parsing.
  }

  const rows = [];
  const linkPattern = /[-*]\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)(?:\s+-\s+(.+))?/g;
  let match;
  while ((match = linkPattern.exec(text)) !== null) {
    const [, name, url, description] = match;
    rows.push({ name, url, description });
  }
  return rows;
}

export function githubUrlFromCandidate(candidate) {
  const values = [
    candidate.source_code_url,
    candidate.repository_url,
    candidate.source,
    candidate.url,
    candidate.website,
  ].filter(Boolean);

  return values.find((value) => /^https:\/\/github\.com\/[^/]+\/[^/#?]+/i.test(value)) ?? null;
}

export async function writeJsonl(filePath, records) {
  await writeFile(filePath, `${records.map((record) => JSON.stringify(record)).join("\n")}\n`);
}
