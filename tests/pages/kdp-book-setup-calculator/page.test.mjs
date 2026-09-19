import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/kdp-book-setup-calculator/", root);

test("owns an unpublished flat route and shared server shell", () => {
  for (const file of ["page.tsx", "kdp-book-setup-calculator.tsx"]) assert.equal(existsSync(new URL(file, route)), true, file);
  const page = readFileSync(new URL("page.tsx", route), "utf8");
  const client = readFileSync(new URL("kdp-book-setup-calculator.tsx", route), "utf8");
  const manifest = JSON.parse(readFileSync(new URL("page.json", import.meta.url), "utf8"));
  assert.equal(manifest.state, "unpublished");
  assert.match(page, /getRequiredToolPage\("kdp-book-setup-calculator"\)/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(client, /data-tool-workbench/);
  assert.match(client, /Calculate setup/);
  assert.doesNotMatch(`${page}\n${client}`, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap|content_markdown/);
});
