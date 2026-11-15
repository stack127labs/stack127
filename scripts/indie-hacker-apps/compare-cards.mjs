#!/usr/bin/env node
// Compares card files with a snapshot after a wording-only pass.
// Fails if anything other than `math` text changed, or if a number in `math` was dropped or added.
// Usage: node scripts/indie-hacker-apps/compare-cards.mjs <snapshot-root> [research_dir ...]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const [snapshot, ...dirs] = process.argv.slice(2);
const root = path.join(process.cwd(), "dev-space/indie-hacker-apps");
// Fact references such as "(F12)", "C11-C3" or "fact 15" may be dropped; every other number must stay.
const nums = (t) => (String(t)
  .replace(/\b[A-Z]\d{2}(?:-[A-Z]?\d+)?\b/g, "")
  .replace(/\bfacts? \d+\b/gi, "")
  .replace(/(\d),(\d{3})/g, "$1$2")
  .match(/\d+(?:\.\d+)?/g) ?? []).sort().join(" ");
let bad = 0, changed = 0;
for (const dir of dirs.length ? dirs : readdirSync(snapshot)) {
  for (const file of readdirSync(path.join(snapshot, dir))) {
    const before = JSON.parse(readFileSync(path.join(snapshot, dir, file), "utf8"));
    const afterPath = path.join(root, dir, "cards", file);
    if (!existsSync(afterPath)) { console.log(`MISSING ${dir}/${file}`); bad++; continue; }
    const after = JSON.parse(readFileSync(afterPath, "utf8"));
    const strip = (card) => JSON.stringify({ ...card, costs: Object.fromEntries(Object.entries(card.costs).map(([k, rows]) => [k, rows.map(({ math, ...rest }) => rest)])) });
    if (strip(before) !== strip(after)) { console.log(`CHANGED-OUTSIDE-MATH ${dir}/${file}`); bad++; }
    for (const [k, rows] of Object.entries(before.costs)) rows.forEach((row, i) => {
      const next = after.costs[k]?.[i];
      if (!next || next.math === row.math) return;
      changed++;
      if (nums(row.math) !== nums(next.math)) { console.log(`NUMBERS ${dir}/${file} ${k}[${i}]\n  before: ${row.math}\n  after:  ${next.math}`); bad++; }
    });
  }
}
console.log(`math rows reworded ${changed}, problems ${bad}`);
process.exit(bad ? 1 : 0);
