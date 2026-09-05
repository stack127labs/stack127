import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { root } from "./workflow.mjs";

const file = path.join(root, "lib/amazon-affiliate/data/asin-results.jsonl");
const byAsin = new Map();
for (const line of (await readFile(file, "utf8").catch(() => "")).split("\n")) {
  if (!line.trim()) continue;
  const entry = JSON.parse(line);
  if (entry.title) entry.title = entry.title.replace(/\s+(?:-|:)\s+Amazon\.com\s*$/i, "").trim();
  if (entry.title && !entry.availability) entry.availability = "listed";
  const previous = byAsin.get(entry.asin);
  if (!previous || previous.error || !entry.error) byAsin.set(entry.asin, entry);
}
const entries = [...byAsin.values()].sort((left, right) => left.asin.localeCompare(right.asin));
await writeFile(file, `${entries.map(JSON.stringify).join("\n")}\n`);
console.log(`Compacted ${entries.length.toLocaleString("en-US")} ASIN checks.`);
