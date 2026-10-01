#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const linkFields = ["website_url", "source_code_url", "docs_url", "install_docs_url", "docker_url", "publisher_url"];
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
    "User-Agent": "stack127-self-host-apps",
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
  if (/https?:\/\/https\/\//i.test(item.url) || /\/r\/https?:\/\//i.test(item.url)) {
    return { ...item, state: "bad", status: "malformed_url", final_url: item.url };
  }

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
    return { ...item, state: "error", status: "error", final_url: item.url, error: error.message };
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
        console.warn(`${result.state} ${result.slug}.${result.field} ${result.status} ${result.final_url}${result.error ? ` ${result.error}` : ""}`);
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
    const where = publishedOnly
      ? "where published = true and self_hosting_status = 'self_hostable'"
      : "where self_hosting_status = 'self_hostable'";
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

  const uniqueItems = [...new Map(items.map((item) => [item.url, item])).values()];
  const uniqueResults = await runPool(uniqueItems, concurrency, timeoutMs);
  const byUrl = new Map(uniqueResults.map((result) => [result.url, result]));
  const results = items.map((item) => ({ ...byUrl.get(item.url), ...item }));
  const bad = results.filter((result) => result.state === "bad");
  const blocked = results.filter((result) => result.state === "blocked");
  const errors = results.filter((result) => result.state === "error");
  const report = {
    generated_at: new Date().toISOString(),
    rows_checked: rows.length,
    link_references_checked: results.length,
    urls_checked: uniqueResults.length,
    ok_count: results.length - bad.length - blocked.length - errors.length,
    blocked_count: blocked.length,
    bad_count: bad.length,
    error_count: errors.length,
    blocked,
    bad,
    errors,
  };

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
  }

  const summary = JSON.stringify({
    rows_checked: report.rows_checked,
    link_references_checked: report.link_references_checked,
    urls_checked: report.urls_checked,
    ok_count: report.ok_count,
    blocked_count: report.blocked_count,
    bad_count: report.bad_count,
    error_count: report.error_count,
  }, null, 2);

  const exitCode = bad.length > 0 ? 1 : errors.length > 0 ? 2 : 0;
  await new Promise((resolve) => process.stdout.write(`${summary}\n`, resolve));
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
