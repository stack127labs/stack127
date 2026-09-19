import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260916124925_add_tool_page_usage_markdown.sql", "utf8");
const renderer = readFileSync("app/tool-page-content.tsx", "utf8");
const registry = readFileSync("app/marker-art-registry.ts", "utf8");
const registryData = JSON.parse(readFileSync("app/marker-art-registry.json", "utf8"));
const contentUpdater = readFileSync("scripts/stack127/tool-pages/update-content.mjs", "utf8");
const contentStyles = readFileSync("app/tool-page-content.module.css", "utf8");

test("usage Markdown is nullable during staged backfill and validates supplied text", () => {
  assert.match(migration, /add column if not exists usage_markdown text/i);
  assert.match(migration, /usage_markdown is null[\s\S]*length\(usage_markdown\) > 0/i);
  assert.match(migration, /new\.usage_markdown/);
  assert.match(migration, /new\.content_revision = old\.content_revision \+ 1/);
});

test("public date trigger treats usage as content and leaves tool version separate", () => {
  assert.match(migration, /new\.usage_markdown[\s\S]*new\.content_markdown[\s\S]*new\.tool_version/);
  assert.match(migration, /set updated_at = case when is_published then now\(\) else null end/);
});

test("marker references resolve through an explicit registry", () => {
  assert.match(registry, /markerArtRegistry/);
  assert.match(registry, /Unknown marker art reference/);
  assert.match(renderer, /resolveMarkerArtReference/);
  assert.match(renderer, /defaultUrlTransform/);
  assert.match(renderer, /url\.startsWith\("marker-art:\/\/"\)/);
  assert.match(renderer, /function MarkdownParagraph/);
  assert.doesNotMatch(renderer, /dangerouslySetInnerHTML/);
  assert.ok(registryData["catalog/zfs-capacity"]);
  assert.match(contentUpdater, /validateToolMarkdown/);
  assert.match(renderer, /remarkDefinitionLists/);
  assert.match(contentStyles, /\.content dl/);
});
