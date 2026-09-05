import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { extractAmazonMarkdownProduct } from "./lib.mjs";
import { parseArgs, readJson, root } from "./workflow.mjs";

const args = parseArgs(process.argv);
const concurrency = Math.max(1, Number(args.concurrency ?? 3));
const delay = Math.max(0, Number(args.delay ?? 400));
const limit = Number(args.limit ?? Number.POSITIVE_INFINITY);
const outputFile = path.join(root, "lib/amazon-affiliate/data/asin-results.jsonl");
const ledger = await readJson("lib/amazon-affiliate/data/candidates.json");
const completed = new Set();
for (const line of (await readFile(outputFile, "utf8").catch(() => "")).split("\n")) {
  if (!line.trim()) continue;
  try {
    const item = JSON.parse(line);
    if (!item.error) completed.add(item.asin);
  } catch {
    // A partial final line can be retried safely.
  }
}

const pending = [...new Set(ledger.records.flatMap((item) => item.source_candidates.map((candidate) => candidate.asin)))]
  .filter((asin) => !completed.has(asin))
  .slice(0, limit);
let cursor = 0;
let success = 0;
let failed = 0;

async function verify(asin) {
  const proxyUrl = `https://r.jina.ai/http://www.amazon.com/dp/${asin}`;
  let lastError = "verification failed";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(proxyUrl, {
        headers: { "Accept-Language": "en-US,en;q=0.9", "User-Agent": "stack127-catalog-review/1.0" },
        signal: AbortSignal.timeout(45_000),
      });
      const markdown = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const product = extractAmazonMarkdownProduct(markdown, asin);
      if (!product && /Title:\s*Page Not Found|returned error 404|currently unavailable and we don't know when/i.test(markdown)) {
        await appendFile(outputFile, `${JSON.stringify({ asin, availability: "unavailable", checked_at: new Date().toISOString(), evidence_method: "Amazon page rendered through Jina Reader", url: `https://www.amazon.com/dp/${asin}` })}\n`);
        success += 1;
        return;
      }
      if (!product) throw new Error("Amazon product identity was not present");
      await appendFile(outputFile, `${JSON.stringify({ ...product, availability: "listed", checked_at: new Date().toISOString(), evidence_method: "Amazon page rendered through Jina Reader" })}\n`);
      success += 1;
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  failed += 1;
  await appendFile(outputFile, `${JSON.stringify({ asin, checked_at: new Date().toISOString(), error: lastError, evidence_method: "Amazon page rendered through Jina Reader" })}\n`);
}

async function worker() {
  while (cursor < pending.length) {
    const asin = pending[cursor];
    cursor += 1;
    await verify(asin);
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if ((success + failed) % 25 === 0) console.log(JSON.stringify({ failed, processed: success + failed, remaining: pending.length - success - failed, success }));
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
console.log(JSON.stringify({ failed, processed: success + failed, remaining: pending.length - success - failed, success }));
