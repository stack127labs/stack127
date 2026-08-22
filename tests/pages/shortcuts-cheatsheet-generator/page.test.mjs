import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routeRoot = new URL("../../../app/(site)/(tools)/shortcuts-cheatsheet-generator/", import.meta.url);
const page = readFileSync(new URL("page.tsx", routeRoot), "utf8");
const client = readFileSync(new URL("shortcuts-cheatsheet-generator.tsx", routeRoot), "utf8");
const guide = readFileSync(new URL("shortcuts-cheatsheet-guide.tsx", routeRoot), "utf8");
const styles = readFileSync(new URL("shortcuts-cheatsheet-generator.module.css", routeRoot), "utf8");

test("the generator keeps the live sheet as the primary output", () => {
  assert.match(page, /ShortcutsCheatSheetGenerator/);
  assert.match(page, /<mark>Keyboard shortcuts<\/mark> cheat sheet generator/);
  assert.match(page, /your daily tools/);
  assert.match(page, /ShortcutsCheatSheetGuide/);
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
  assert.match(guide, /href=\"\/shortcuts\"/);
});

test("the generator has no route-changing or reload effect", () => {
  assert.doesNotMatch(client, /useEffect|router\\.refresh|location\\.reload|history\\.replaceState/);
});

test("the generator handles the empty state before printing", () => {
  assert.match(client, /Choose an app to see the sheet/);
  assert.match(client, /disabled=\{!result\.ok\}/);
  assert.doesNotMatch(client, /sheetSources|Last verified|Keys checked against/);
});
