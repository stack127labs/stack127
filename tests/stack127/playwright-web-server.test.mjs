import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const serverSource = readFileSync(
  new URL("../../scripts/stack127/quality/playwright-web-server.mjs", import.meta.url),
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
