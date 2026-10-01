import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const routes = JSON.parse(readFileSync(new URL("../../lib/registered-site-pages.json", import.meta.url), "utf8"));
const source = readFileSync(new URL("../../lib/page-source.ts", import.meta.url), "utf8")
  .replace('import registeredSitePages from "./registered-site-pages.json";', `const registeredSitePages = ${JSON.stringify(routes)};`);
const { sitePageAvailable } = await import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText).toString("base64")}`);
const directory = { is_published: true, page_family: "directory", has_tool_content: false, has_catalog_content: false };

test("published directory detail routes render only when their route exists", () => {
  assert.equal(sitePageAvailable("/platform-fees/digital-downloads", directory), true);
  assert.equal(sitePageAvailable("/ad-networks/mediavine", directory), true);
  assert.equal(sitePageAvailable("/platform-fees/digital-downloads", { ...directory, is_published: false }), false);
  assert.equal(sitePageAvailable("/platform-fees/missing/deeper", directory), false);
  assert.equal(sitePageAvailable("/unknown-directory/item", directory), false);
  assert.equal(sitePageAvailable("/unknown-page", directory), false);
});

test("catalog fallback still requires real catalog content", () => {
  const catalog = { ...directory, page_family: "catalog" };
  assert.equal(sitePageAvailable("/new-catalog", catalog), false);
  assert.equal(sitePageAvailable("/new-catalog", { ...catalog, has_catalog_content: true }), true);
  assert.equal(sitePageAvailable("/new-catalog/child", { ...catalog, has_catalog_content: true }), false);
});
