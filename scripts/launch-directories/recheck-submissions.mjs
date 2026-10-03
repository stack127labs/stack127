#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { launchChromium, parseOptions, requiredOption } from "./browser-runtime.mjs";

const help = `Usage: node scripts/launch-directories/recheck-submissions.mjs --input <snapshot.json> --output <checks.json> [--timeout-ms 15000] [--concurrency 6]

The input is a JSON array of launch-directory rows. The output records one browser GET result and timestamp per row. Playwright resolves normally, or use STACK127_PLAYWRIGHT_MODULE and STACK127_BROWSER_EXECUTABLE.`;
const parsed = parseOptions(process.argv.slice(2), { valueOptions: ["--input", "--output", "--timeout-ms", "--concurrency"] });
if (parsed.help) {
  console.log(help);
  process.exit(0);
}
const inputPath = resolve(requiredOption(parsed, "--input"));
const outputPath = resolve(requiredOption(parsed, "--output"));
const timeoutMs = Number(parsed.values.get("--timeout-ms") ?? 15000);
const concurrency = Number(parsed.values.get("--concurrency") ?? 6);
if (!Number.isInteger(timeoutMs) || timeoutMs < 1000) throw new Error("--timeout-ms must be an integer of at least 1000");
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 12) throw new Error("--concurrency must be an integer from 1 to 12");

const rows = JSON.parse(await readFile(inputPath, "utf8"));
if (!Array.isArray(rows)) throw new Error("--input must contain a JSON array");
const visibleRows = rows.filter((row) => row.is_published);
const browser = await launchChromium();
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
  userAgent: "Mozilla/5.0 stack127-directory-research/1.0",
});
const queue = visibleRows.map((row) => ({
  row,
  url: row.submit_url ?? row.evidence?.submission?.source_url ?? row.sources?.[0] ?? row.website_url,
  had_submit_url: Boolean(row.submit_url),
}));
const results = [];
let next = 0;

async function inspect(item) {
  const page = await context.newPage();
  let result = { slug: item.row.slug, url: item.url, had_submit_url: item.had_submit_url, method: "browser GET" };
  try {
    const response = await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    const status = response?.status() ?? null;
    const finalUrl = page.url();
    const title = await page.title().catch(() => "");
    const body = (await page.locator("body").innerText({ timeout: 2500 }).catch(() => "")).replace(/\s+/g, " ").slice(0, 700);
    const lower = `${title} ${body}`.toLowerCase();
    const explicitNotFound = status === 404 || /\b(404|page not found|file does not exist|this page could not be found|nothing here)\b/.test(lower);
    const browserStatus = status && status < 400 && !explicitNotFound ? "reachable" : "unavailable";
    const checkedAt = new Date().toISOString();
    result = {
      ...result,
      checked_at: checkedAt,
      browser_status: browserStatus,
      http_status: status,
      final_url: finalUrl,
      title,
      note: browserStatus === "reachable"
        ? `Browser GET loaded the page (HTTP ${status ?? "unknown"}); redirects and login gates are kept as reachable.`
        : `Browser GET could not verify the page (HTTP ${status ?? "unknown"}); this does not prove the service is closed.`,
      body_excerpt: body,
    };
  } catch (error) {
    result = {
      ...result,
      checked_at: new Date().toISOString(),
      browser_status: "unavailable",
      error: error.name ?? "browser error",
      note: `Browser GET failed with ${error.name ?? "an error"}; this does not prove the service is closed.`,
    };
  } finally {
    await page.close();
  }
  return result;
}

async function worker() {
  while (true) {
    const index = next++;
    if (index >= queue.length) return;
    const result = await inspect(queue[index]);
    results.push(result);
    console.log(`${results.length}/${queue.length} ${result.slug}: ${result.browser_status} ${result.http_status ?? result.error ?? ""}`);
  }
}

try {
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
} finally {
  await context.close();
  await browser.close();
}
results.sort((a, b) => a.slug.localeCompare(b.slug));
await writeFile(outputPath, `${JSON.stringify({ results }, null, 2)}\n`);
console.log(`Wrote ${results.length} browser checks to ${outputPath}`);
