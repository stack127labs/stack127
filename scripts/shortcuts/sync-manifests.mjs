#!/usr/bin/env node
/**
 * Regenerate the per-app ownership manifests under tests/pages/shortcuts/<slug>/
 * from the shortcut data in lib/shortcuts. Run after adding or removing an app.
 *
 *   node --env-file=.env.local scripts/shortcuts/sync-manifests.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const testsDir = path.join(root, "tests", "pages", "shortcuts");

function loadSlugs() {
  const listing = execFileSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "-e",
      `import { shortcutApps } from "./lib/shortcuts/index.ts"; console.log(JSON.stringify(shortcutApps.map((app) => app.slug)));`,
    ],
    { cwd: root, encoding: "utf8" },
  );
  return JSON.parse(listing);
}

function main() {
  const slugs = loadSlugs();
  const sharedTests = ["tests/pages/shortcuts/shared/data.test.mjs"];
  const seen = new Set();

  for (const slug of slugs) {
    if (seen.has(slug)) throw new Error(`Duplicate app slug in data: ${slug}`);
    seen.add(slug);

    const dir = path.join(testsDir, slug);
    mkdirSync(dir, { recursive: true });
    const manifest = {
      route: `/shortcuts/${slug}`,
      state: "published",
      docs: ["content_docs/shortcuts"],
      tests: ["tests/stack127/seo.spec.ts", ...sharedTests],
      scripts: ["scripts/shortcuts/sync-manifests.mjs"],
      skills: [
        "skills/stack127/test-driven-page",
        "skills/stack127/visual-first-content",
      ],
      repositories: [],
    };
    writeFileSync(path.join(dir, "page.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  }

  // Remove manifests for apps that no longer exist.
  for (const entry of existsSync(testsDir) ? readdirSync(testsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : []) {
    if (!seen.has(entry) && existsSync(path.join(testsDir, entry, "page.json"))) {
      const stale = JSON.parse(readFileSync(path.join(testsDir, entry, "page.json"), "utf8"));
      if (stale.route?.startsWith("/shortcuts/")) {
        throw new Error(
          `tests/pages/shortcuts/${entry}/page.json has no matching app. Remove it by hand after checking.`,
        );
      }
    }
  }

  console.log(`Synced ${slugs.length} shortcuts app manifests.`);
}

main();
