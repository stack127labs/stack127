import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const routeDirectory = new URL("../../../app/(site)/(tools)/shr-calculator/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("page.json", import.meta.url), "utf8"));

test("owns a published route without route-local shared publication files", () => {
  assert.equal(manifest.route, "/shr-calculator");
  assert.equal(manifest.state, "published");
  assert.deepEqual(manifest.repositories, []);
  assert.equal(existsSync(new URL("page.tsx", routeDirectory)), true);
  assert.equal(existsSync(new URL("shr-capacity.ts", routeDirectory)), true);
  assert.equal(existsSync(new URL("shr-calculator.tsx", routeDirectory)), true);
  assert.equal(existsSync(new URL("shr-calculator.module.css", routeDirectory)), true);
  assert.equal(existsSync(new URL("shr-guide.tsx", routeDirectory)), true);
  assert.doesNotMatch(JSON.stringify(manifest), /supabase\/migrations|storage-tools\/storage-tools-sidebar/);
});

test("keeps the page in the shared shell and route-local ownership boundary", () => {
  const page = readFileSync(new URL("page.tsx", routeDirectory), "utf8");
  const client = readFileSync(new URL("shr-calculator.tsx", routeDirectory), "utf8");
  const engine = readFileSync(new URL("shr-capacity.ts", routeDirectory), "utf8");
  const guide = readFileSync(new URL("shr-guide.tsx", routeDirectory), "utf8");
  const styles = readFileSync(new URL("shr-calculator.module.css", routeDirectory), "utf8");

  assert.match(page, /AppShell/);
  assert.match(page, /SHR capacity/);
  assert.match(page, /<mark>calculator<\/mark>/);
  assert.match(page, /shr-calculator/);
  assert.match(page, /Enter individual drive capacities/);
  assert.match(page, /<ShrGuide \/>/);
  assert.match(client, /"use client"/);
  assert.match(client, /Calculate capacity/);
  assert.match(client, /Add drive/);
  assert.match(engine, /calculateShrCapacity/);
  assert.doesNotMatch(`${page}\n${client}\n${engine}`, /export const metadata|generateMetadata|application\/ld\+json/);
  assert.doesNotMatch(`${page}\n${client}\n${engine}`, /fetch\(|localStorage|sessionStorage/);
  assert.match(guide, /<article/);
  assert.match(guide, /proseClassName/);
  assert.match(guide, /Read the capacity bands/);
  assert.match(guide, /Treat this as a fresh-pool estimate/);
  assert.match(guide, /Verify the layout before you build/);
  assert.match(guide, /SHR-2/);
  assert.match(guide, /stays in your browser/);
  assert.match(guide, /\/storage-tools/);
  assert.match(guide, /\/raid-calculator/);
  assert.match(guide, /synology\.com|kb\.synology\.com/i);
  assert.doesNotMatch(guide, /FAQ|Methodology/);
  assert.doesNotMatch(`${page}\n${guide}`, /—|–/);
  const visibleWords = guide
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}()=\"'`;,:./]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  assert.ok(visibleWords.length <= 560, `guide source contains ${visibleWords.length} words`);
  assert.doesNotMatch(styles, /border-left\s*:/);
  for (const declaration of styles.match(/font-size\s*:[^;]+;/g) ?? []) {
    assert.match(declaration, /var\(--text-(?:body|small|h1|h2|h3)\)/);
  }
});

test("keeps the tool visually primary and explicit", () => {
  const client = readFileSync(new URL("shr-calculator.tsx", routeDirectory), "utf8");
  const styles = readFileSync(new URL("shr-calculator.module.css", routeDirectory), "utf8");
  assert.match(client, /aria-label="SHR capacity calculator"/);
  assert.match(client, /type="submit"/);
  assert.match(client, /Reset calculator/);
  assert.match(client, /Copy result/);
  assert.match(client, /Share configuration/);
  assert.match(client, /editor\.drives\.length === 0/);
  assert.match(client, /aria-live="polite"/);
  assert.match(client, /Capacity bands/);
  assert.match(client, /Estimated pool capacity/);
  assert.match(styles, /\.tool\s*\{[\s\S]*border:/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /min-width:\s*0/);
});
