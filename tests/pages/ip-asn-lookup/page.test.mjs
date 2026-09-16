import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/ip-asn-lookup/", root);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("ip-asn-lookup-tool.tsx", route);
const stylesPath = new URL("ip-asn-lookup.module.css", route);
const enginePath = new URL("lib/ip-asn/resolve.ts", root);
const manifestPath = new URL("tests/pages/ip-asn-lookup/page.json", root);

test("owns the flat unpublished route with complete local files", () => {
  for (const file of [pagePath, clientPath, stylesPath, enginePath, manifestPath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/ip-asn-lookup");
  assert.equal(manifest.state, "unpublished");
  assert.deepEqual(manifest.repositories, []);
  assert.ok(manifest.docs.includes("content_docs/ip-asn-lookup"));
  assert.ok(manifest.tests.includes("tests/pages/ip-asn-lookup/ip-asn-lookup.test.mjs"));
});

test("keeps copy in the tool page content layer and uses the shared workbench", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(page, /getRequiredToolPage\("ip-asn-lookup"\)/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<IpAsnLookupTool/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(client, /data-tool-workbench/);
  assert.match(client, /ToolPrimaryResult/);
  assert.match(client, /ToolDataTable|ToolKeyValueList/);
  assert.doesNotMatch(`${page}\n${client}`, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap|intro_markdown|content_markdown|FAQ|Methodology/);
  assert.doesNotMatch(client, /<select|localStorage|sessionStorage|sendBeacon|dangerouslySetInnerHTML/);
});

test("keeps engine and page styles local", () => {
  const engine = readFileSync(enginePath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");
  assert.doesNotMatch(engine, /react|document\.|window\.|localStorage|sessionStorage|dangerouslySetInnerHTML/i);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.doesNotMatch(styles, /(^|\n)\s*(body|html|:root)\s*\{/);
  assert.doesNotMatch(styles, /linear-gradient|radial-gradient|box-shadow|border-left/);
  assert.doesNotMatch(styles, /border-radius:\s*(?:[3-9]|[1-9]\d)px/);
});

test("does not create route-local publication or SEO behavior", () => {
  const files = [pagePath, clientPath, enginePath].map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(files, /public\.stack127_pages|supabase|migration|sitemap|robots|\bcanonical\s*[:=]|application\/ld\+json/);
});
