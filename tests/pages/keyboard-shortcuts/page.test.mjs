import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routeRoot = new URL("../../../app/(site)/(catalogs)/keyboard-shortcuts/", import.meta.url);
const page = readFileSync(new URL("page.tsx", routeRoot), "utf8");
const directory = readFileSync(new URL("keyboard-shortcuts-directory.tsx", routeRoot), "utf8");
const styles = readFileSync(new URL("keyboard-shortcuts.module.css", routeRoot), "utf8");

test("the keyboard shortcut catalog owns one public directory route", () => {
  assert.match(page, /KeyboardShortcutsDirectory/);
  assert.match(directory, /export function KeyboardShortcutsDirectory/);
  assert.doesNotMatch(directory, /ShortcutsReference/);
  assert.match(styles, /var\(--container-gutter\)/);
  assert.match(styles, /grid-template-columns: repeat\(3/);
});

test("the catalog does not use the discarded cramped layout", () => {
  assert.doesNotMatch(directory, /shortcutSourceNote|shortcutsTableWrap/);
  assert.doesNotMatch(styles, /padding: 0;[\s\S]*\\.shortcutsPage/);
});

test("the directory keeps repeated app facts in a table and opens configured sheets", () => {
  assert.match(directory, /<table/);
  assert.match(directory, /Platforms/);
  assert.match(directory, /Shortcuts/);
  assert.match(directory, /directoryCategoryIntro/);
  assert.match(directory, /<mark>Keyboard shortcuts<\/mark>/);
  assert.match(directory, /shortcuts-cheatsheet-generator\?apps=/);
  assert.doesNotMatch(directory, /href=\{?"?\/shortcuts\//);
  assert.doesNotMatch(directory, /source-checked|Keys checked against|Last verified/);
});
