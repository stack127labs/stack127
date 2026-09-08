import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const route = new URL("../../../app/(site)/(tools)/nginx-proxy-pass-calculator/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("nginx-proxy-pass-calculator.tsx", route);
const stylesPath = new URL("nginx-proxy-pass-calculator.module.css", route);
const sharedControlsPath = new URL("../../../app/tool-ui/tool-controls.module.css", import.meta.url);
const enginePath = new URL("../../../lib/nginx/proxy-pass-uri.ts", import.meta.url);
const previewPath = new URL("../../../scripts/nginx-proxy-pass-calculator/preview-local-page.mjs", import.meta.url);
const verifierPath = new URL("../../../scripts/nginx-proxy-pass-calculator/verify-nginx-fixtures.mjs", import.meta.url);
const migrationPath = new URL("../../../supabase/migrations/20260809120000_publish_three_tools.sql", import.meta.url);
const manifestPath = new URL("page.json", import.meta.url);

test("owns one flat published route", () => {
  for (const file of [pagePath, clientPath, stylesPath, enginePath, previewPath, verifierPath, migrationPath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/nginx-proxy-pass-calculator");
  assert.equal(manifest.state, "published");
  assert.match(readFileSync(migrationPath, "utf8"), /'nginx-proxy-pass-calculator'/);
});

test("keeps URI calculation pure, local, and untrusted input inert", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|history\.|document\.|window\.|eval\(|Function\(/i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML|eval\(|Function\(/i);
});

test("keeps the primary result when slash comparison visibility changes", () => {
  const client = readFileSync(clientPath, "utf8");
  assert.match(client, /function toggleSlashComparison/);
  assert.doesNotMatch(client, /update\("compareSlash"/);
});

test("keeps the technical build tool-only and centrally managed", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");
  const controlStyles = readFileSync(sharedControlsPath, "utf8");
  assert.match(page, /NGINX proxy_pass URI Calculator/);
  assert.match(client, /Calculate upstream URL/);
  assert.match(client, /Final upstream URL/);
  assert.match(client, /Compare the final slash/);
  assert.match(`${client}\n${readFileSync(enginePath, "utf8")}`, /1\.30\.4/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
  assert.doesNotMatch(`${page}\n${client}`, /<h2>FAQ|Methodology|Related reading|How to use|—|–/i);
  assert.match(client, /data-tool-workbench/);
  assert.doesNotMatch(styles, /\.tool\s*\{[^}]*(?:border:\s*1\.5px|border-radius:)/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(`${styles}\n${controlStyles}`, /min-height:\s*44px/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
});

test("guards preview mutations to a local database", () => {
  const preview = readFileSync(previewPath, "utf8");
  assert.match(preview, /127\.0\.0\.1/);
  assert.match(preview, /localhost/);
  assert.match(preview, /Refusing to change a non-local database/);
  assert.match(preview, /--remove/);
});

test("serves a concise server-rendered guide around the stable calculator", () => {
  const page = readFileSync(pagePath, "utf8");
  const guide = readToolPageSeed("nginx-proxy-pass-calculator");
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(guide, /Use the location NGINX actually matched/);
  assert.match(guide, /Common static cases/);
  assert.match(guide, /Read the result as one replacement chain/);
  assert.match(guide, /When the answer needs live NGINX/);
  assert.match(guide, /Verify the target in the running configuration/);
  assert.match(guide, /https:\/\/nginx\.org\/en\/docs\/http\/ngx_http_proxy_module\.html#proxy_pass/);
  assert.match(guide, /https:\/\/nginx\.org\/en\/docs\/http\/ngx_http_rewrite_module\.html#rewrite/);
  assert.doesNotMatch(`${page}\n${guide}`, /FAQ|best tool|guarantee|always correct|—|–/i);
});
