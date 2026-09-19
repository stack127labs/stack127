import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/self-hosted-app-resource-planner/", root);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("self-hosted-app-resource-planner.tsx", route);
const stylesPath = new URL("self-hosted-app-resource-planner.module.css", route);
const enginePath = new URL("lib/self-hosted-app-resource-planner/engine.ts", root);
const dataPath = new URL("lib/self-hosted-app-resource-planner/data.ts", root);
const manifestPath = new URL("tests/pages/self-hosted-app-resource-planner/page.json", root);

test("owns a published flat route with complete local files", () => {
  for (const file of [pagePath, clientPath, stylesPath, enginePath, manifestPath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/self-hosted-app-resource-planner");
  assert.equal(manifest.state, "published");
  assert.deepEqual(manifest.repositories, []);
  assert.ok(manifest.docs.includes("content_docs/self-hosted-app-resource-planner"));
  assert.ok(manifest.tests.includes("tests/pages/self-hosted-app-resource-planner/self-hosted-app-resource-planner.test.mjs"));
});

test("uses the shared page shell and keeps copy and SEO out of route code", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(page, /getRequiredToolPage\("self-hosted-app-resource-planner"\)/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<SelfHostedAppResourcePlanner/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(client, /data-tool-workbench/);
  assert.match(client, /ToolComboBox/);
  assert.match(client, /ToolAllocationBar/);
  assert.match(client, /ToolDataTable/);
  assert.doesNotMatch(`${page}\n${client}`, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap|intro_markdown|content_markdown|FAQ|Methodology/);
  assert.doesNotMatch(client, /<select|fetch\(|localStorage|sessionStorage|sendBeacon|dangerouslySetInnerHTML/);
});

test("keeps the pure engine and page styles local", () => {
  const engine = readFileSync(enginePath, "utf8");
  const data = readFileSync(dataPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|navigator\.|document\.|window\.|localStorage|sessionStorage/i);
  assert.match(styles, /\.tool\s*\{/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.doesNotMatch(styles, /(^|\n)\s*(body|html|:root)\s*\{/);
  assert.doesNotMatch(styles, /linear-gradient|radial-gradient|box-shadow|border-left/);
  assert.doesNotMatch(styles, /border-radius:\s*(?:[3-9]|[1-9]\d)px/);
  assert.match(data, /where app\.published = true/);
  assert.match(data, /app\.self_hosting_status = 'self_hostable'/);
  assert.match(data, /source_urls/);
  assert.match(data, /normalizeResourcePlannerRange/);
  assert.doesNotMatch(data, /select\s+\*/i);
});

test("does not create publication or route-local SEO behavior", () => {
  const files = [pagePath, clientPath, enginePath].map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(files, /public\.stack127_pages|supabase|migration|sitemap|robots|\bcanonical\s*[:=]|application\/ld\+json/);
});
