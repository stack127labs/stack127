import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const route = new URL("../../../app/(site)/(tools)/home-assistant-energy-entity-checker/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("home-assistant-energy-entity-checker.tsx", route);
const stylesPath = new URL("home-assistant-energy-entity-checker.module.css", route);
const enginePath = new URL("../../../lib/home-assistant-energy/eligibility.ts", import.meta.url);
const previewPath = new URL("../../../scripts/home-assistant-energy-entity-checker/preview-local-page.mjs", import.meta.url);
const migrationPath = new URL("../../../supabase/migrations/20260809120000_publish_three_tools.sql", import.meta.url);
const manifestPath = new URL("page.json", import.meta.url);

test("owns one flat published route", () => {
  for (const file of [pagePath, clientPath, stylesPath, enginePath, previewPath, migrationPath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/home-assistant-energy-entity-checker");
  assert.equal(manifest.state, "published");
  assert.match(readFileSync(migrationPath, "utf8"), /'home-assistant-energy-entity-checker'/);
});

test("keeps evaluation pure, local, and untrusted text inert", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|history\.|document\.|window\.|eval\(|Function\(/i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML|eval\(|Function\(/i);
});

test("keeps the tool primary and the complete guide server-rendered", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const guide = readToolPageSeed("home-assistant-energy-entity-checker");
  const styles = readFileSync(stylesPath, "utf8");
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(client, /Check entity/);
  assert.match(client, /Energy picker/);
  assert.match(client, /Long-term statistics/);
  assert.match(page, /<HomeAssistantEnergyEntityChecker \/>[\s\S]*<ToolPageMarkdown/);
  assert.doesNotMatch(guide, /^\s*["']use client["'];/m);
  assert.match(guide, /Choose the Energy field before judging the sensor/);
  assert.match(guide, /Each Energy field accepts a specific attribute combination/);
  assert.match(guide, /Energy and statistics answer different questions/);
  assert.match(guide, /A matching result still needs Home Assistant/);
  assert.match(guide, /power[\s\S]*measurement[\s\S]*W/i);
  assert.match(guide, /grid import[\s\S]*grid export[\s\S]*solar production[\s\S]*battery charge[\s\S]*battery discharge[\s\S]*individual device[\s\S]*optional power[\s\S]*gas[\s\S]*water/i);
  assert.match(guide, /recorder inclusion/i);
  assert.match(guide, /cannot\s+guarantee/i);
  assert.match(guide, /home-assistant\.io\/docs\/energy\/faq/);
  assert.match(guide, /developers\.home-assistant\.io\/docs\/core\/entity\/sensor/);
  assert.match(guide, /\]\(\/privacy\)/);
  assert.doesNotMatch(client, /Choose the Energy field before judging|A matching result still needs Home Assistant/);
  assert.match(`${client}\n${readFileSync(enginePath, "utf8")}`, /2026\.8\.1/);
  assert.match(styles, /\.tool\s*\{[^}]*border:\s*1\.5px solid var\(--color-border-strong\);/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
  assert.doesNotMatch(`${page}\n${client}\n${guide}`, /<h2>FAQ|Methodology|Related reading|How to use|—|–/i);
});

test("guards preview mutations to a local database", () => {
  const preview = readFileSync(previewPath, "utf8");
  assert.match(preview, /127\.0\.0\.1/);
  assert.match(preview, /localhost/);
  assert.match(preview, /Refusing to change a non-local database/);
  assert.match(preview, /--remove/);
});
