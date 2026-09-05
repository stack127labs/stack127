import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { parseArgs, root } from "./workflow.mjs";

const args = parseArgs(process.argv);
const baseUrl = args["base-url"] ?? "http://127.0.0.1:3333";
const output = args.output ?? "/tmp/stack127-amazon-affiliate-qa";
const ledger = JSON.parse(await readFile(path.join(root, "lib/amazon-affiliate/data/confirmed.json"), "utf8"));
const snapshots = new Map();
for (const review of ledger.reviews) {
  if (snapshots.has(review.directory)) continue;
  const file = review.directory === "zigbee-devices"
    ? "lib/zigbee-devices/data/devices.json"
    : `lib/hardware-directories/data/${review.directory}.json`;
  const snapshot = JSON.parse(await readFile(path.join(root, file), "utf8"));
  snapshots.set(review.directory, new Map((snapshot.devices ?? snapshot.records).map((record) => [record.slug, record])));
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks = [];

try {
  const firstByDirectory = new Map();
  for (const review of ledger.reviews) if (!firstByDirectory.has(review.directory)) firstByDirectory.set(review.directory, review);
  for (const [directory, review] of firstByDirectory) {
    const record = snapshots.get(directory)?.get(review.record_slug);
    if (!record) throw new Error(`Missing directory record for ${directory}/${review.record_slug}`);
    for (const width of checks.length === 0 ? [1280, 375] : [1280]) {
      const page = await browser.newPage({ viewport: { height: 900, width } });
      await page.route("**/*", (route) => route.request().resourceType() === "image" ? route.abort() : route.continue());
      const response = await page.goto(`${baseUrl}/${directory}?q=${encodeURIComponent(record.model)}`, { timeout: 45_000, waitUntil: "domcontentloaded" });
      if (response?.status() !== 200) throw new Error(`${directory} returned HTTP ${response?.status()}.`);
      await page.locator('[data-live-filter-ready="true"]').waitFor({ state: "attached" });
      const card = page.locator(".directory-card").filter({ hasText: record.model }).first();
      await card.waitFor();
      await card.click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      const link = dialog.getByRole("link", { name: "Check price on Amazon" });
      const expected = `https://www.amazon.com/dp/${review.asin}/ref=nosim?tag=stack127-20`;
      if (await link.getAttribute("href") !== expected) throw new Error(`${directory} rendered the wrong Amazon URL.`);
      const rel = (await link.getAttribute("rel") ?? "").split(/\s+/);
      if (!rel.includes("sponsored") || !rel.includes("noreferrer")) throw new Error(`${directory} rendered an unsafe or undisclosed Amazon link.`);
      if (/Amazon price|Amazon rating|Amazon image/i.test(await dialog.innerText())) throw new Error(`${directory} rendered unsupported Amazon product content.`);
      if (!await page.getByText("As an Amazon Associate I earn from qualifying purchases.", { exact: true }).count()) throw new Error(`${directory} is missing the Amazon disclosure.`);
      await page.screenshot({ path: path.join(output, `${directory}-${width}.png`) });
      checks.push({ asin: review.asin, directory, model: record.model, url: expected, width });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(path.join(output, "report.json"), `${JSON.stringify({ baseUrl, checks, confirmed_records: ledger.reviews.length }, null, 2)}\n`);
console.log(`Rendered Amazon affiliate QA passed for ${checks.length} route and viewport checks across ${ledger.reviews.length} confirmed records.`);
