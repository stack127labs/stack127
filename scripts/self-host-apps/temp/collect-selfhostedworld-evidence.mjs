#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { setDefaultResultOrder } from "node:dns";

setDefaultResultOrder("ipv4first");

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error("Usage: collect-selfhostedworld-evidence.mjs <claimed-batch> <output>");
}

const input = JSON.parse(await readFile(inputPath, "utf8"));
const previous = await readFile(outputPath, "utf8").then(JSON.parse).catch(() => ({ records: [] }));
const completedIds = new Set(previous.records.filter((record) => record.ok).map((record) => record.candidate_id));
const candidates = input.candidates.filter(
  (candidate) => candidate.source === "selfhostedworld" && !candidate.source_code_url && !completedIds.has(candidate.id),
);
const records = previous.records.filter((record) => record.ok);
let cursor = 0;

function relayUrl(value) {
  const url = new URL(value);
  const host = url.hostname.replace(/\./g, "-");
  return `https://${host}.translate.goog${url.pathname}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en`;
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function originalUrl(value) {
  if (!value) return null;
  const decoded = decodeHtml(value);
  try {
    const url = new URL(decoded);
    if (url.hostname === "translate.google.com") return url.searchParams.get("u") ?? decoded;
    if (url.hostname.endsWith(".translate.goog")) {
      const sourceHost = url.hostname.replace(/\.translate\.goog$/, "").replace(/-/g, ".");
      return `https://${sourceHost}${url.pathname}`;
    }
    return decoded;
  } catch {
    return decoded;
  }
}

function repositoryFromUrl(value) {
  const original = originalUrl(value);
  if (!original) return null;
  try {
    const url = new URL(original);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    if (host === "api.github.com" && parts[0] === "repos" && parts.length >= 3) {
      return `https://github.com/${parts[1]}/${parts[2]}`;
    }
    if (host === "github.com" && parts.length >= 2) {
      return `https://github.com/${parts[0]}/${parts[1].replace(/\.git$/i, "")}`;
    }
    if (host === "gitlab.com" && parts.length >= 2) {
      const separator = parts.indexOf("-");
      return `https://gitlab.com/${(separator >= 2 ? parts.slice(0, separator) : parts).join("/")}`;
    }
    if (host === "codeberg.org" && parts.length >= 2) {
      return `https://codeberg.org/${parts[0]}/${parts[1].replace(/\.git$/i, "")}`;
    }
  } catch {
    return null;
  }
  return null;
}

function extractEvidence(html) {
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null;
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? null;
  const imageUrl = html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] ?? null;
  const metadataHref = html.match(/<a href="([^"]+)"[^>]*>extracted from README<\/a>/i)?.[1] ?? null;
  const sourceCodeHref = html.match(/<a href="([^"]+)"[^>]*>Source Code<\/a>/i)?.[1] ?? null;
  const hrefs = [...html.matchAll(/href="([^"]+)"/gi)].map((match) => match[1]);
  const repositoryUrls = hrefs.map(repositoryFromUrl).filter(Boolean);
  const metadataRepository = repositoryFromUrl(metadataHref);
  return {
    title: title ? decodeHtml(title) : null,
    description: description ? decodeHtml(description) : null,
    image_url: originalUrl(imageUrl),
    metadata_url: originalUrl(metadataHref),
    source_code_url: repositoryFromUrl(sourceCodeHref) ?? metadataRepository ?? repositoryUrls[0] ?? null,
    repository_urls: [...new Set(repositoryUrls)],
  };
}

const workers = Array.from({ length: 2 }, async () => {
  while (cursor < candidates.length) {
    const candidate = candidates[cursor++];
    const resolvedRelayUrl = relayUrl(candidate.source_url);
    try {
      const response = await fetch(resolvedRelayUrl, {
        headers: { Accept: "text/html", "User-Agent": "version127-candidate-review/1.0" },
        signal: AbortSignal.timeout(60000),
      });
      const text = await response.text();
      records.push({
        candidate_id: candidate.id,
        name: candidate.name,
        source_url: candidate.source_url,
        relay_url: resolvedRelayUrl,
        ok: response.ok,
        status: response.status,
        evidence: extractEvidence(text),
      });
    } catch (error) {
      records.push({ candidate_id: candidate.id, name: candidate.name, source_url: candidate.source_url, relay_url: resolvedRelayUrl, ok: false, error: String(error.message ?? error) });
    }
  }
});

await Promise.all(workers);
const inputOrder = new Map(input.candidates.map((candidate, index) => [candidate.id, index]));
for (const record of records) {
  if (/\/(repo-avatars|uploads|user-attachments)\//.test(record.evidence?.source_code_url ?? "")) {
    record.evidence.source_code_url = record.evidence.repository_urls.find(
      (url) => !/\/(repo-avatars|uploads|user-attachments)\//.test(url),
    ) ?? null;
  }
}
records.sort((left, right) => inputOrder.get(left.candidate_id) - inputOrder.get(right.candidate_id));
await writeFile(outputPath, `${JSON.stringify({ collected_at: new Date().toISOString(), records }, null, 2)}\n`);
console.log(JSON.stringify({ checked: records.length, passed: records.filter((record) => record.ok).length, failed: records.filter((record) => !record.ok).length }));
