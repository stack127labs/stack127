#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const input = JSON.parse(await readFile(process.argv[2], "utf8"));
const checks = [];

function hasImageMagic(bytes) {
  return (
    (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) ||
    (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) ||
    (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46)
  );
}

for (const review of input.records ?? []) {
  if (review.decision !== "publish") continue;
  checks.push({ candidate_id: review.candidate_id, slug: review.project.slug, field: "icon_url", url: review.project.icon_url });
  checks.push({ candidate_id: review.candidate_id, slug: review.project.slug, field: "install_docs_url", url: review.project.install_docs_url });
  checks.push({ candidate_id: review.candidate_id, slug: review.project.slug, field: "source_code_url", url: review.project.source_code_url });
  checks.push({ candidate_id: review.candidate_id, slug: review.project.slug, field: "website_url", url: review.project.website_url });
  checks.push({ candidate_id: review.candidate_id, slug: review.project.slug, field: "docker_url", url: review.project.docker_url });
}

let cursor = 0;
const results = [];
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url, options) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
    } catch (error) {
      lastError = error;
      if (attempt < 2) await wait(750 * (attempt + 1));
    }
  }
  throw lastError;
}

const workers = Array.from({ length: 4 }, async () => {
  while (cursor < checks.length) {
    const check = checks[cursor++];
    if (!check.url) continue;
    try {
      let response = await fetchWithRetry(check.url, {
        method: "HEAD",
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 stack127-link-review" },
      });
      if (response.status === 405 || response.status === 403 || (check.field === "icon_url" && !response.headers.get("content-type")?.startsWith("image/"))) {
        response = await fetchWithRetry(check.url, {
          method: "GET",
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0 stack127-link-review", Range: "bytes=0-1023" },
        });
      }
      const contentType = response.headers.get("content-type") ?? "";
      const bytes = check.field === "icon_url" && response.ok ? new Uint8Array(await response.arrayBuffer()) : null;
      const validImage = check.field !== "icon_url" || contentType.startsWith("image/") || (bytes && hasImageMagic(bytes));
      results.push({ ...check, ok: response.ok && validImage, status: response.status, content_type: contentType, final_url: response.url });
    } catch (error) {
      results.push({ ...check, ok: false, error: String(error.message ?? error) });
    }
  }
});

await Promise.all(workers);
const failures = results.filter((result) => !result.ok).sort((a, b) => a.slug.localeCompare(b.slug) || a.field.localeCompare(b.field));
console.log(JSON.stringify({ checked: results.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
