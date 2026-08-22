import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

test("every approved source has a collector script", async () => {
  const scripts = await readdir(new URL("scripts/cli-apps", root));
  const requiredCollectors = [
    "discover-terminaldock.mjs",
    "discover-terminal-apps-dev.mjs",
    "discover-cli-directory.mjs",
    "discover-clis-dev.mjs",
    "discover-cli-radar.mjs",
    "discover-getcli.mjs",
    "discover-awesome-csv.mjs",
    "discover-awesome-markdown.mjs",
    "discover-github-topics.mjs",
    "discover-homebrew.mjs",
    "discover-winget.mjs",
    "discover-scoop.mjs",
    "discover-nixos.mjs",
    "discover-arch.mjs",
    "discover-ubuntu.mjs",
    "discover-npm.mjs",
    "discover-pypi.mjs",
    "discover-crates.mjs",
    "discover-golang.mjs",
    "discover-community-attempts.mjs",
  ];

  for (const collector of requiredCollectors) {
    assert.ok(scripts.includes(collector), `missing collector ${collector}`);
  }
});

test("collectors record failures instead of discarding them", async () => {
  const storeLib = await readFile(
    new URL("scripts/cli-apps/lib/store.mjs", root),
    "utf8",
  );

  assert.match(storeLib, /recordFailedRun/);
  assert.match(storeLib, /status: "failed"/);
});

test("coverage reports carry every required count per source", async () => {
  const coverageLib = await readFile(
    new URL("scripts/cli-apps/lib/coverage.mjs", root),
    "utf8",
  );

  for (const count of [
    "discovered",
    "deduplicated",
    "excluded",
    "enriched",
    "published_candidate_rows",
    "failed_records",
    "queue_total",
    "total_candidate_rows",
    "unique_candidate_keys",
  ]) {
    assert.match(coverageLib, new RegExp(count));
  }

  assert.match(coverageLib, /published_unique_apps/);
  assert.match(coverageLib, /failed_sources/);
  assert.match(coverageLib, /partial_sources/);
});

test("coverage JSON distinguishes unique apps from candidate rows", async () => {
  const report = JSON.parse(await readFile(new URL("scripts/cli-apps/batches/coverage.json", root), "utf8"));
  assert.ok(typeof report.totals.published_unique_apps === "number", "published_unique_apps is numeric");
  assert.ok(typeof report.totals.published_candidate_rows === "number", "published_candidate_rows is numeric");
  assert.ok(typeof report.totals.total_candidate_rows === "number", "total_candidate_rows is numeric");
  assert.ok(typeof report.totals.unique_candidate_keys === "number", "unique_candidate_keys is numeric");
  assert.equal(report.totals.published, report.totals.published_candidate_rows, "legacy published aliases new field");
  assert.ok(report.totals.total_candidate_rows >= report.totals.unique_candidate_keys);
});

test("coverage reports state their scope honestly", async () => {
  const coverageLib = await readFile(
    new URL("scripts/cli-apps/lib/coverage.mjs", root),
    "utf8",
  );

  assert.match(coverageLib, /attempted approved source set only/);
  assert.match(coverageLib, /not proof that every terminal app in existence has been found/);
});

test("coverage status follows the latest attempt and preserves historical failures", async () => {
  const coverageLib = await readFile(
    new URL("scripts/cli-apps/lib/coverage.mjs", root),
    "utf8",
  );

  assert.match(coverageLib, /latest_status/);
  assert.match(coverageLib, /historical_failed_runs/);
  assert.match(coverageLib, /latest_status === "failed"/);
});

test("non-terminal-scoped registries document their relevance filter", async () => {
  const relevanceLib = await readFile(
    new URL("scripts/cli-apps/lib/relevance.mjs", root),
    "utf8",
  );
  const nixosCollector = await readFile(
    new URL("scripts/cli-apps/discover-nixos.mjs", root),
    "utf8",
  );

  assert.match(relevanceLib, /isTerminalRelevant/);
  assert.match(nixosCollector, /relevance filter/);
  assert.match(nixosCollector, /rejected/);
});
