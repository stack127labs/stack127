#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const linkFields = ["website_url", "repository_url", "docs_url", "install_docs_url", "docker_url", "publisher_url"];
const blockedStatuses = new Set([403, 429]);
let cachedGithubToken;

function githubToken() {
  if (cachedGithubToken !== undefined) return cachedGithubToken;
  if (process.env.GITHUB_TOKEN) {
    cachedGithubToken = process.env.GITHUB_TOKEN;
    return cachedGithubToken;
  }

  try {
    cachedGithubToken = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    cachedGithubToken = "";
  }

  return cachedGithubToken;
}

function headersFor(url) {
  const headers = {
    Accept: "*/*",
    "User-Agent": "version127-self-host-apps",
  };

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "github.com") {
      const token = githubToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    return headers;
  }

  return headers;
}

async function checkUrl(item, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = headersFor(item.url);
    let response = await fetch(item.url, { method: "HEAD", redirect: "follow", signal: controller.signal, headers });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(item.url, { method: "GET", redirect: "follow", signal: controller.signal, headers });
    }
    const status = response.status;
    const state = response.ok ? "ok" : blockedStatuses.has(status) ? "blocked" : "bad";
    return { ...item, state, status, final_url: response.url };
  } catch (error) {
    return { ...item, state: "bad", status: "error", final_url: item.url, error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function runPool(items, concurrency, timeoutMs) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      const result = await checkUrl(current, timeoutMs);
      results.push(result);
      if (result.state !== "ok") {
        console.warn(`${result.state} ${result.slug}.${result.field} ${result.status} ${result.final_url}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results.sort((a, b) => a.slug.localeCompare(b.slug) || a.field.localeCompare(b.field));
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);
  const concurrency = numberArg(args, "concurrency", 24);
  const timeoutMs = numberArg(args, "timeout-ms", 8000);
  const publishedOnly = args["all"] ? false : true;

  const rows = await withClient(async (client) => {
    const where = publishedOnly ? "where published = true" : "";
    const result = await client.query(
      `
        select slug, ${linkFields.join(", ")}
        from public.self_host_apps
        ${where}
        order by slug
        limit $1
      `,
      [limit],
    );
    return result.rows;
  }, args["database-url"]);

  const items = [];
  for (const row of rows) {
    for (const field of linkFields) {
      if (row[field]) items.push({ slug: row.slug, field, url: row[field] });
    }
  }

  const results = await runPool(items, concurrency, timeoutMs);
  const bad = results.filter((result) => result.state === "bad");
  const blocked = results.filter((result) => result.state === "blocked");
  const report = {
    generated_at: new Date().toISOString(),
    rows_checked: rows.length,
    urls_checked: results.length,
    ok_count: results.length - bad.length - blocked.length,
    blocked_count: blocked.length,
    bad_count: bad.length,
    blocked,
    bad,
  };

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(JSON.stringify({
    rows_checked: report.rows_checked,
    urls_checked: report.urls_checked,
    ok_count: report.ok_count,
    blocked_count: report.blocked_count,
    bad_count: report.bad_count,
  }, null, 2));

  if (bad.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
