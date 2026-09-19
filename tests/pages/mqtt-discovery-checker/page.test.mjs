import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/mqtt-discovery-checker/", root);

test("owns an unpublished flat route with local source and docs", () => {
  for (const file of ["page.tsx", "mqtt-discovery-checker.tsx", "mqtt-discovery-checker.module.css"]) assert.equal(existsSync(new URL(file, route)), true, file);
  const manifest = JSON.parse(readFileSync(new URL("page.json", import.meta.url), "utf8"));
  assert.equal(manifest.route, "/mqtt-discovery-checker");
  assert.equal(manifest.state, "unpublished");
  assert.deepEqual(manifest.repositories, []);
  assert.ok(manifest.docs.includes("content_docs/mqtt-discovery-checker"));
});

test("keeps the shared server shell and offline evaluator", () => {
  const page = readFileSync(new URL("page.tsx", route), "utf8");
  const client = readFileSync(new URL("mqtt-discovery-checker.tsx", route), "utf8");
  const engine = readFileSync(new URL("lib/mqtt-discovery-checker/engine.ts", root), "utf8");
  assert.match(page, /getRequiredToolPage\("mqtt-discovery-checker"\)/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<MqttDiscoveryChecker/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(client, /Check discovery/);
  assert.match(client, /ToolResultLead/);
  assert.doesNotMatch(client, /ToolPrimaryResult/);
  assert.doesNotMatch(client, /Fix input|styles\.failure/);
  assert.match(client, /ToolDataTable/);
  assert.doesNotMatch(`${page}\n${client}`, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap|content_markdown/);
  assert.doesNotMatch(engine, /react|fetch\(|localStorage|sessionStorage|navigator\.|document\.|window\./i);
});

test("keeps styles local and responsive", () => {
  const styles = readFileSync(new URL("mqtt-discovery-checker.module.css", route), "utf8");
  assert.match(styles, /\.tool\s*\{/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /@media/);
  assert.doesNotMatch(styles, /(^|\n)\s*(body|html|:root)\s*\{/);
  assert.doesNotMatch(styles, /linear-gradient|radial-gradient|box-shadow|border-left/);
});
