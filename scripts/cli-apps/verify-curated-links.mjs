#!/usr/bin/env node

import { curatedExpansion } from "./curated-expansion.mjs";

const concurrency = 10;
const timeoutMs = 15_000;
const attempts = 2;

async function checkUrl(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "stack127-cli-catalog-link-check" },
        redirect: "follow",
        signal: controller.signal,
      });

      if (response.ok) {
        return { final_url: response.url, status: response.status };
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(lastError ?? "link check failed");
}

async function main() {
  const queue = Object.entries(curatedExpansion).map(([slug, entry]) => ({
    slug,
    url: entry.repository_url ?? entry.website_url,
  }));
  const failures = [];
  let cursor = 0;

  async function worker() {
    while (cursor < queue.length) {
      const item = queue[cursor];
      cursor += 1;

      try {
        await checkUrl(item.url);
      } catch (error) {
        failures.push({
          ...item,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  console.log(JSON.stringify({ checked: queue.length, failures }, null, 2));

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
