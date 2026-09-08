import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const routeRoot = new URL("../../../app/(site)/(references)/keyboard-shortcuts/", import.meta.url);
const page = readFileSync(new URL("page.tsx", routeRoot), "utf8");
const directory = readFileSync(new URL("keyboard-shortcuts-directory.tsx", routeRoot), "utf8");
const reference = readFileSync(new URL("keyboard-shortcuts-reference.tsx", routeRoot), "utf8");
const styles = readFileSync(new URL("keyboard-shortcuts.module.css", routeRoot), "utf8");

function directoryNames(url) {
  return readdirSync(url, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

test("the keyboard shortcut catalog owns the directory and app references", () => {
  assert.match(page, /KeyboardShortcutsDirectory/);
  assert.match(directory, /export function KeyboardShortcutsDirectory/);
  assert.match(reference, /export function KeyboardShortcutsReference/);
  assert.match(styles, /var\(--container-gutter\)/);
  assert.match(styles, /grid-template-columns: 1fr/);
});

test("the catalog does not use the discarded cramped layout", () => {
  assert.doesNotMatch(directory, /shortcutSourceNote|shortcutsTableWrap/);
  assert.doesNotMatch(styles, /padding: 0;[\s\S]*\\.shortcutsPage/);
});

test("the directory keeps repeated app facts in a table and opens canonical app pages", () => {
  assert.match(directory, /<table/);
  assert.match(directory, /Platforms/);
  assert.match(directory, /Shortcuts/);
  assert.doesNotMatch(directory, /directoryCategoryIntro/);
  assert.match(directory, /<mark>Keyboard shortcuts<\/mark>/);
  assert.match(directory, /keyboard-shortcuts\//);
  assert.doesNotMatch(directory, /href=\{?"?\/shortcuts\//);
  assert.doesNotMatch(directory, /source-checked|Keys checked against|Last verified/);
});

test("app references use grouped platform tables and link to the configured sheet", () => {
  assert.match(reference, /app\.groups\.map/);
  assert.match(reference, /platformLabels/);
  assert.match(reference, /<kbd/);
  assert.match(reference, /shortcuts-cheatsheet-generator\?apps=/);
  assert.doesNotMatch(reference, /href=\{?"?\/shortcuts\//);
});

test("every shortcut data file has one canonical route and ownership manifest", () => {
  const appSlugs = readdirSync(
    new URL("../../../lib/shortcuts/apps/", import.meta.url),
  )
    .filter((name) => name.endsWith(".ts"))
    .map((name) => name.slice(0, -3))
    .sort();
  const routeSlugs = directoryNames(routeRoot);
  const manifestSlugs = directoryNames(new URL("./", import.meta.url))
    .filter((name) => name !== "shared");

  assert.deepEqual(routeSlugs, appSlugs);
  assert.deepEqual(manifestSlugs, appSlugs);
});

test("app routes import one record directly instead of loading the full registry", () => {
  const appSlugs = readdirSync(
    new URL("../../../lib/shortcuts/apps/", import.meta.url),
  )
    .filter((name) => name.endsWith(".ts"))
    .map((name) => name.slice(0, -3));

  for (const slug of appSlugs) {
    const source = readFileSync(new URL(`${slug}/page.tsx`, routeRoot), "utf8");
    assert.match(source, new RegExp(`@/lib/shortcuts/apps/${slug}`));
    assert.match(source, /<KeyboardShortcutsAppPage app=\{app\} \/>/);
    assert.doesNotMatch(source, /slug=/);
  }
});

test("the directory and sidebar use the compact catalog", () => {
  const sidebar = readFileSync(
    new URL("../_components/keyboard-shortcuts-sidebar.tsx", routeRoot),
    "utf8",
  );

  assert.match(directory, /shortcutAppCatalog/);
  assert.match(directory, /appsInCategory/);
  assert.match(sidebar, /shortcutAppCatalog/);
  assert.match(sidebar, /appsInCategory/);
  assert.match(sidebar, /\/keyboard-shortcuts#category-/);
  assert.doesNotMatch(sidebar, /apps\.map\(/);
});
