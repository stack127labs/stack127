import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

test("legacy category reset cannot connect or rewrite editorial categories", () => {
  const source = readFileSync("scripts/self-host-apps/reset-categories.mjs", "utf8");
  assert.ok(!source.includes("withClient"), "retired command must not open a database connection");
  assert.ok(!source.includes("inferCategories"), "keyword-based categorization must be removed");
  for (const args of [[], ["--dry-run"], ["--apply"]]) {
    const result = spawnSync(process.execPath, ["scripts/self-host-apps/reset-categories.mjs", ...args], { encoding: "utf8", timeout: 10000 });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /source-reviewed category corrections/);
  }
});

test("technical evidence collection cannot publish with an apply flag", () => {
  const result = spawnSync(process.execPath, ["scripts/self-host-apps/refresh-primary-technical-facts.mjs", "--apply-reviewed", "--requirements-file", "/nonexistent-review.json"], { encoding: "utf8", timeout: 10000 });
  assert.notEqual(result.status, 0);
  assert.ok(result.stderr.includes("collects evidence only"), "must stop before reading a review file or connecting to the database");
});

test("the scheduled collector cannot rewrite facts or verification dates", () => {
  const workflow = readFileSync(".github/workflows/self-host-apps-refresh-technical.yml", "utf8");
  const collector = readFileSync("scripts/self-host-apps/refresh-primary-technical-facts.mjs", "utf8");
  assert.ok(!workflow.includes("--apply-reviewed"));
  assert.ok(!collector.includes("update public.self_host_apps"));
  assert.ok(!collector.includes("data_checked_at ="));
});

test("appliance evidence collection cannot write or claim a general fact review", () => {
  const source = readFileSync("scripts/self-host-apps/refresh-app-catalog-facts.mjs", "utf8");
  assert.ok(!source.includes("update public.self_host_apps"));
  assert.ok(!source.includes("data_checked_at ="));
  assert.ok(source.includes('review_status: "pending"'));
  const result = spawnSync(process.execPath, ["scripts/self-host-apps/refresh-app-catalog-facts.mjs", "--apply-reviewed"], { encoding: "utf8", timeout: 10000 });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /collects evidence only/);
});
