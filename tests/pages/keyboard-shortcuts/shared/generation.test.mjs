import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = new URL("../../../../", import.meta.url);
const appRoot = new URL("lib/shortcuts/apps/", root);
const routeRoot = new URL("app/(site)/(references)/keyboard-shortcuts/", root);
const manifestRoot = new URL("tests/pages/keyboard-shortcuts/", root);

function appSlugs() {
  return readdirSync(appRoot)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => name.slice(0, -3))
    .sort();
}

const publishedSlugs = new Set(appSlugs());

test("every shortcut app module has a default export", async () => {
  for (const slug of appSlugs()) {
    const module = await import(new URL(`${slug}.ts`, appRoot));
    assert.equal(module.default?.slug, slug, `${slug}.ts needs its app record as the default export`);
  }
});

test("the generated compact catalog matches every full app record", async () => {
  const { shortcutAppCatalog } = await import(
    new URL("lib/shortcuts/catalog.generated.ts", root)
  );
  assert.deepEqual(shortcutAppCatalog.map((app) => app.slug).sort(), appSlugs());

  for (const summary of shortcutAppCatalog) {
    const module = await import(new URL(`lib/shortcuts/apps/${summary.slug}.ts`, root));
    const app = module.default;
    const count = app.groups.reduce((total, group) => total + group.shortcuts.length, 0);
    assert.deepEqual(summary, {
      slug: app.slug,
      name: app.name,
      category: app.category,
      platforms: app.platforms,
      shortcutCount: count,
    });
  }
});

test("the generated lazy registry loads one app without an eager full-app array", async () => {
  const source = readFileSync(new URL("lib/shortcuts/loaders.generated.ts", root), "utf8");
  assert.doesNotMatch(source, /shortcutApps\s*=\s*\[/);

  const { loadShortcutApp, shortcutAppLoaders } = await import(
    new URL("lib/shortcuts/loaders.generated.ts", root)
  );
  assert.deepEqual(Object.keys(shortcutAppLoaders).sort(), appSlugs());
  assert.equal((await loadShortcutApp("brave"))?.slug, "brave");
  assert.equal(await loadShortcutApp("missing"), undefined);
});

test("the sync script owns generated routes and preserves publication state", () => {
  const result = spawnSync(process.execPath, ["scripts/keyboard-shortcuts/sync-pages.mjs", "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  for (const slug of appSlugs()) {
    const route = readFileSync(new URL(`${slug}/page.tsx`, routeRoot), "utf8");
    assert.match(route, new RegExp(`@/lib/shortcuts/apps/${slug}`));

    const manifest = JSON.parse(readFileSync(new URL(`${slug}/page.json`, manifestRoot), "utf8"));
    assert.equal(manifest.route, `/keyboard-shortcuts/${slug}`);
    assert.ok(["published", "noindex"].includes(manifest.state));
    assert.ok(manifest.scripts.includes("scripts/keyboard-shortcuts"));
    assert.ok(manifest.tests.includes("tests/pages/keyboard-shortcuts/shared/publication.test.mjs"));
  }

  const published = appSlugs().filter((slug) => {
    const manifest = JSON.parse(readFileSync(new URL(`${slug}/page.json`, manifestRoot), "utf8"));
    return manifest.state === "published";
  });
  assert.deepEqual(new Set(published), publishedSlugs);
});
