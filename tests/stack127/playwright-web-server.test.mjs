import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const serverSource = readFileSync(
  new URL("../../scripts/stack127/quality/playwright-web-server.mjs", import.meta.url),
  "utf8",
);
const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);
const configSource = readFileSync(
  new URL("../../playwright.config.ts", import.meta.url),
  "utf8",
);

test("the Playwright quality server defaults to Webpack and keeps both bundler overrides", () => {
  assert.match(
    serverSource,
    /const bundler = process\.env\.STACK127_TEST_BUNDLER \?\? "webpack";/,
  );
  assert.match(
    serverSource,
    /const bundlerFlag = bundler === "turbopack" \? "--turbopack" : "--webpack";/,
  );
});

test("production browser checks run the standalone artifact with its public assets", () => {
  assert.match(serverSource, /\.next", "standalone", "server\.js"/);
  assert.match(serverSource, /ensureProductionAssetLink/);
  assert.match(serverSource, /\.next", "standalone", "\.next", "static"/);
  assert.match(serverSource, /\.next", "standalone", "public"/);
});

test("the SEO command gives each Playwright project a fresh web-server lifetime", () => {
  assert.deepEqual(
    packageJson.scripts["test:seo"].split("&&").map((command) => command.trim()),
    ["playwright test --project=chromium", "playwright test --project=mobile"],
  );
});

test("the release browser gate keeps full desktop coverage and a focused mobile suite", () => {
  assert.deepEqual(
    packageJson.scripts["test:seo:release"].split("&&").map((command) => command.trim()),
    [
      "STACK127_TEST_SERVER=production playwright test --project=chromium",
      "STACK127_TEST_SERVER=production playwright test tests/stack127/site-direction.spec.ts tests/stack127/shell-layout.spec.ts tests/pages/self-host-apps/layout.spec.ts tests/pages/keyboard-shortcuts/clean-layout.spec.ts --project=mobile",
    ],
  );

  assert.equal(
    packageJson.scripts["quality:release"],
    "npm run test && npm run test:seo:registry && npm run test:seo:release",
  );
});

test("browser gates exclude non-published page specs unless preview testing is explicit", () => {
  assert.match(configSource, /manifest\.state !== "published"/);
  assert.match(configSource, /STACK127_INCLUDE_NONPUBLISHED_BROWSER_TESTS/);
  assert.match(configSource, /testIgnore: nonPublishedBrowserSpecs/);
});
