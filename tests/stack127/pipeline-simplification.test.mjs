import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function text(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("package scripts expose fast, changed, smoke, full, and nightly gates", async () => {
  const pkg = JSON.parse(await text("package.json"));
  for (const name of ["test:fast", "test:changed", "test:smoke", "test:seo:shared", "test:seo:production", "quality:ci", "quality:full", "quality:nightly"]) {
    assert.equal(typeof pkg.scripts[name], "string", name);
  }
  assert.equal(pkg.scripts.quality, "npm run quality:changed");
  assert.equal(pkg.scripts["quality:changed"], "npm run quality:ci");
  assert.match(pkg.scripts["quality:full"], /build && npm run test:seo:production/);
});

test("main CI is change-aware and documentation-only pushes do not deploy", async () => {
  const workflow = await text(".github/workflows/stack127-ci.yml");
  assert.match(workflow, /paths-ignore:/);
  assert.match(workflow, /stack127_docs\/\*\*/);
  assert.match(workflow, /npm run quality:ci/);
  assert.match(workflow, /STACK127_BASE_SHA/);
  assert.doesNotMatch(workflow, /Build pull requests before merge/);
});

test("release waits for CI and tests one image before pushing it", async () => {
  const workflow = await text(".github/workflows/stack127-release-e2e.yml");
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /Stack127 CI/);
  assert.match(workflow, /load: true/);
  assert.match(workflow, /push: false/);
  assert.doesNotMatch(workflow, /npm run quality:release/);
  assert.doesNotMatch(workflow, /\n\s+npm run build\s*\n/);
  assert.match(workflow, /Run safety checks for a manual release/);
  assert.match(workflow, /npm run quality:ci/);

  const build = workflow.indexOf("Build the immutable production image once");
  const smoke = workflow.indexOf("Run smoke tests against the exact production image");
  const push = workflow.indexOf("Push the tested immutable image");
  const deploy = workflow.indexOf("Deploy the tested image through Dokploy API");
  assert.ok(build < smoke && smoke < push && push < deploy);
});

test("nightly workflow owns the complete browser matrix", async () => {
  const workflow = await text(".github/workflows/stack127-full-regression.yml");
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /npm run quality:nightly/);
});
