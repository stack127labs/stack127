#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { launchChromium, parseOptions, requiredOption } from "./browser-runtime.mjs";

const help = `Usage: node scripts/launch-directories/retry-submissions.mjs --input <snapshot.json> --previous <checks.json> --output <retries.json> [--timeout-ms 30000]

Retries only rows whose previous browser check timed out and which had a submit_url in the input snapshot. Each result gets its own check timestamp. Playwright resolves normally, or use STACK127_PLAYWRIGHT_MODULE and STACK127_BROWSER_EXECUTABLE.`;
const parsed = parseOptions(process.argv.slice(2), { valueOptions: ["--input", "--previous", "--output", "--timeout-ms"] });
if (parsed.help) {
  console.log(help);
  process.exit(0);
}
const inputPath = resolve(requiredOption(parsed, "--input"));
const previousPath = resolve(requiredOption(parsed, "--previous"));
const outputPath = resolve(requiredOption(parsed, "--output"));
const timeoutMs = Number(parsed.values.get("--timeout-ms") ?? 30000);
if (!Number.isInteger(timeoutMs) || timeoutMs < 1000) throw new Error("--timeout-ms must be an integer of at least 1000");

const snapshot = JSON.parse(await readFile(inputPath, "utf8"));
const previous = JSON.parse(await readFile(previousPath, "utf8"));
if (!Array.isArray(snapshot) || !Array.isArray(previous.results)) throw new Error("Input must be a row array and previous results must contain a results array");
const previousBySlug = new Map(previous.results.map((item) => [item.slug, item]));
const rows = snapshot.filter((row) => row.is_published && row.submit_url && previousBySlug.get(row.slug)?.error === "TimeoutError");
const browser = await launchChromium();
const context = await browser.newContext({ ignoreHTTPSErrors: true, userAgent: "Mozilla/5.0 stack127-directory-research/1.0" });
const results = [];

try {
  for (const row of rows) {
    const page = await context.newPage();
    let result = { slug: row.slug, url: row.submit_url, method: "browser GET retry" };
    try {
      const response = await page.goto(row.submit_url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
      const status = response?.status() ?? null;
      const finalUrl = page.url();
      const title = await page.title().catch(() => "");
      const body = (await page.locator("body").innerText({ timeout: 4000 }).catch(() => "")).replace(/\s+/g, " ").slice(0, 700);
      const lower = `${title} ${body}`.toLowerCase();
      const explicitNotFound = status === 404 || /\b(404|page not found|file does not exist|this page could not be found|nothing here)\b/.test(lower);
      const browserStatus = status && status < 400 && !explicitNotFound ? "reachable" : "unavailable";
      result = {
        ...result,
        checked_at: new Date().toISOString(),
        browser_status: browserStatus,
        http_status: status,
        final_url: finalUrl,
        title,
        note: browserStatus === "reachable"
          ? `Retry browser GET loaded the page (HTTP ${status ?? "unknown"}); login and payment steps were not completed.`
          : `Retry browser GET could not verify the page (HTTP ${status ?? "unknown"}); this does not prove the service is closed.`,
        body_excerpt: body,
      };
    } catch (error) {
      result = {
        ...result,
        checked_at: new Date().toISOString(),
        browser_status: "unavailable",
        error: error.name ?? "browser error",
        note: `Retry browser GET failed with ${error.name ?? "an error"}; this does not prove the service is closed.`,
      };
    } finally {
      await page.close();
    }
    results.push(result);
    console.log(`${row.slug}: ${result.browser_status} ${result.http_status ?? result.error ?? ""}`);
  }
} finally {
  await context.close();
  await browser.close();
}

await writeFile(outputPath, `${JSON.stringify({ results }, null, 2)}\n`);
console.log(`Wrote ${results.length} retry results to ${outputPath}`);
