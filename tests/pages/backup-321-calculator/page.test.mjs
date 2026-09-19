import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/backup-321-calculator/", root);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("backup-321-calculator.tsx", route);
const stylesPath = new URL("backup-321-calculator.module.css", route);
const enginePath = new URL("lib/storage/backup-321.ts", root);
const manifestPath = new URL("tests/pages/backup-321-calculator/page.json", root);
const hubPath = new URL("app/(site)/(catalogs)/storage-tools/page.tsx", root);
const sidebarPath = new URL("app/(site)/(catalogs)/storage-tools/storage-tools-sidebar.tsx", root);
const migrationPath = new URL("supabase/migrations/20260902080436_add_stack127_tool_pages.sql", root);

test("owns a published flat route with complete local files and no repositories", () => {
  for (const file of [pagePath, clientPath, stylesPath, enginePath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/backup-321-calculator");
  assert.equal(manifest.state, "published");
  assert.deepEqual(manifest.repositories, []);
  assert.ok(manifest.docs.includes("content_docs/backup-321-calculator"));
  assert.ok(manifest.tests.includes("tests/pages/backup-321-calculator/backup-321-calculator.test.mjs"));
});

test("keeps the route in the shared server shell and leaves copy to the database", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(page, /getRequiredToolPage\("backup-321-calculator"\)/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<Backup321Calculator/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(client, /Calculate backup plan/);
  assert.match(client, /ToolPrimaryResult/);
  assert.match(client, /ToolAllocationBar/);
  assert.match(client, /ToolDisclosure/);
  assert.match(client, /Copy summary/);
  assert.match(client, /Share plan/);
  assert.doesNotMatch(`${page}\n${client}`, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap|intro_markdown|content_markdown|FAQ|Methodology/);
  assert.doesNotMatch(client, /<select|fetch\(|localStorage|sessionStorage|sendBeacon|dangerouslySetInnerHTML/);
});

test("keeps the engine pure and the styles local, responsive, and unornamented", () => {
  const engine = readFileSync(enginePath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|document\.|window\./i);
  assert.match(styles, /\.tool\s*\{/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.doesNotMatch(styles, /(^|\n)\s*(body|html|:root)\s*\{/);
  assert.doesNotMatch(styles, /linear-gradient|radial-gradient|box-shadow|border-left/);
  assert.doesNotMatch(styles, /border-radius:\s*(?:[3-9]|[1-9]\d)px/);
});

test("adds one flat storage catalog and sidebar link without touching publication migration", () => {
  const hub = readFileSync(hubPath, "utf8");
  const sidebar = readFileSync(sidebarPath, "utf8");
  const migration = readFileSync(migrationPath, "utf8");
  assert.match(hub, /href: "\/backup-321-calculator"/);
  assert.match(sidebar, /href: "\/backup-321-calculator"/);
  assert.match(sidebar, /id: "backup-321"/);
  assert.doesNotMatch(hub, /\/storage-tools\/backup-321-calculator/);
  assert.doesNotMatch(sidebar, /\/storage-tools\/backup-321-calculator/);
  assert.doesNotMatch(migration, /backup-321-calculator/);
});

test("does not add production registry, migration, or route-local SEO behavior", () => {
  const files = [
    readFileSync(pagePath, "utf8"),
    readFileSync(clientPath, "utf8"),
    readFileSync(enginePath, "utf8"),
  ].join("\n");
  assert.doesNotMatch(files, /public\.stack127_pages|supabase|migration|sitemap|robots|\bcanonical\s*[:=]|application\/ld\+json/);
});
