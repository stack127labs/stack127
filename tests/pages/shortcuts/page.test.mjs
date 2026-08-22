import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routeRoot = new URL("../../../app/(site)/shortcuts/", import.meta.url);
const directory = readFileSync(new URL("page.tsx", routeRoot), "utf8");
const reference = readFileSync(new URL("shortcuts-reference.tsx", routeRoot), "utf8");
const styles = readFileSync(new URL("shortcuts.module.css", routeRoot), "utf8");

test("the directory and app pages use the new shared reference components", () => {
  assert.match(directory, /ShortcutsDirectory/);
  assert.match(reference, /export function ShortcutsReference/);
  assert.match(styles, /var\(--container-gutter\)/);
  assert.match(styles, /grid-template-columns: repeat\(3/);
});

test("shortcut pages do not use the discarded cramped layout", () => {
  assert.doesNotMatch(reference, /shortcutSourceNote|shortcutsTableWrap|Generate a .* cheat sheet/);
  assert.doesNotMatch(styles, /padding: 0;[\s\S]*\\.shortcutsPage/);
});

test("the directory keeps all repeated app facts in a table", () => {
  assert.match(reference, /<table/);
  assert.match(reference, /Platforms/);
  assert.match(reference, /Shortcuts/);
  assert.match(reference, /directoryCategoryIntro/);
  assert.match(reference, /<mark>Keyboard shortcuts<\/mark>/);
  assert.match(reference, /shortcutPageGuidance/);
  assert.match(reference, /shortcutPageClosing/);
  assert.match(reference, /Make the useful keys stick/);
  assert.doesNotMatch(reference, /referenceFacts|referenceFact/);
  assert.doesNotMatch(reference, /source-checked|Keys checked against|Last verified/);
});
