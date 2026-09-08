import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const routeRoot = new URL("../../../app/(site)/(tools)/shortcuts-cheatsheet-generator/", import.meta.url);
const page = readFileSync(new URL("page.tsx", routeRoot), "utf8");
const client = readFileSync(new URL("shortcuts-cheatsheet-generator.tsx", routeRoot), "utf8");
const guide = readToolPageSeed("shortcuts-cheatsheet-generator");
const styles = readFileSync(new URL("shortcuts-cheatsheet-generator.module.css", routeRoot), "utf8");

test("the generator keeps the live sheet as the primary output", () => {
  assert.match(page, /ShortcutsCheatSheetGenerator/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(client, /data-print-root/);
  assert.match(client, /keyboard shortcuts/);
  assert.match(client, /Print sheet/);
  assert.match(styles, /grid-template-columns/);
});

test("the generator has a complete server-rendered content layer", () => {
  assert.match(guide, /Build a sheet for the work you actually do/);
  assert.match(guide, /Choose the platform before you print/);
  assert.match(guide, /What this sheet does not promise/);
  assert.match(guide, /Your selections stay in this browser/);
  assert.match(guide, /\]\(\/keyboard-shortcuts\)/);
});

test("the generator has no route-changing or reload effect", () => {
  assert.doesNotMatch(client, /useEffect|router\\.refresh|location\\.reload|history\\.replaceState/);
});

test("the generator handles the empty state before printing", () => {
  assert.match(client, /Choose an app to see the sheet/);
  assert.match(client, /isDisabled=\{!result\.ok\}/);
  assert.doesNotMatch(client, /sheetSources|Last verified|Keys checked against/);
});

test("the generator uses shared controls and prints one sourced document", () => {
  assert.match(client, /ToolSearchField/);
  assert.match(client, /ToolCheckbox/);
  assert.match(client, /ToolChoiceGroup/);
  assert.match(client, /ToolButton/);
  assert.match(client, /sourceUrl/);
  assert.match(client, /lastVerified/);
  assert.equal((client.match(/data-print-root/g) ?? []).length, 1);
  assert.doesNotMatch(client, /<details|<select|type="radio"|type="checkbox"/);
});
