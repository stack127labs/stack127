import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const route = new URL("../../../app/(site)/(tools)/rebuild-calculator/", import.meta.url);
const enginePath = new URL("../../../lib/rebuild-calculator/engine.ts", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("rebuild-calculator.tsx", route);
const stylesPath = new URL("rebuild-calculator.module.css", route);
const guidePath = new URL("rebuild-calculator-guide.tsx", route);
const manifestPath = new URL("page.json", import.meta.url);

test("owns one published flat route and route-local formula engine", () => {
  for (const file of [route, enginePath, pagePath, clientPath, stylesPath, guidePath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/rebuild-calculator");
  assert.equal(manifest.state, "published");
  assert.deepEqual(manifest.repositories, []);
});

test("keeps the engine pure and the client local", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|history\.|document\.|window\.|eval\(|Function\(/i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML|eval\(|Function\(/i);
  assert.match(engine, /rebuild-exposure-v1/);
});

test("keeps the technical route tool-only and avoids shared changes", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");
  assert.match(page, /Rebuild window and read-error exposure/);
  assert.match(client, /Total degraded window/);
  assert.match(client, /Source media read/);
  assert.match(client, /Modeled read-error exposure/);
  assert.match(`${page}\n${client}`, /rebuild-exposure-v1|minimum source reads/i);
  assert.doesNotMatch(`${page}\n${client}`, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
  assert.doesNotMatch(`${page}\n${client}`, /FAQ|Methodology|Related reading|How to use|—|–/i);
  assert.match(styles, /border:\s*1\.5px solid var\(--color-border-strong\)/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
});

test("serves concise content around the calculator", () => {
  const page = readFileSync(pagePath, "utf8");
  const guide = readFileSync(guidePath, "utf8");
  assert.match(page, /Estimate how long one simplified rebuild/);
  assert.match(page, /RebuildCalculatorGuide/);
  assert.match(guide, /Choose inputs that match the rebuild/);
  assert.match(guide, /Why layouts read different amounts/);
  assert.match(guide, /Read the result as exposure, not a verdict/);
  assert.match(guide, /What this model leaves out/);
  assert.match(guide, /Verify the live rebuild next/);
  assert.match(guide, /proseClassName/);
  assert.match(guide, /runs only in this browser|stays in this browser/i);
  assert.match(guide, /https:\/\/www\.seagate\.com/);
  assert.match(guide, /https:\/\/cdrdv2-public\.intel\.com/);
  assert.match(guide, /\/raid-calculator/);
  assert.match(guide, /\/zfs-capacity-calculator/);
  assert.doesNotMatch(`${page}\n${guide}`, /FAQ|Methodology|best tool|guarantee that this|—|–/i);
});
