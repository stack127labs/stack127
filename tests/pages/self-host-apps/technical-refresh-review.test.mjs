import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("legacy category reset cannot connect or rewrite editorial categories", () => {
  const source = readFileSync("scripts/self-host-apps/reset-categories.mjs", "utf8");
  assert.ok(!source.includes("withClient"), "retired command must not open a database connection");
  assert.ok(!source.includes("inferCategories"), "keyword-based categorization must be removed");
  assert.match(source, /process\.exitCode = 1/);
  assert.match(source, /source-reviewed category corrections/);
});

test("technical evidence collection cannot publish with an apply flag", () => {
  const collector = readFileSync("scripts/self-host-apps/refresh-primary-technical-facts.mjs", "utf8");
  assert.match(collector, /args\["apply-reviewed"\].*?throw new Error\("This command collects evidence only/s);
  assert.ok(
    collector.indexOf("--apply-reviewed") < collector.indexOf("await withClient"),
    "must reject write flags before connecting to the database",
  );
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
  assert.match(source, /args\["apply-reviewed"\].*?throw new Error\("This command collects evidence only/s);
  assert.ok(
    source.indexOf('args["apply-reviewed"]') < source.indexOf("await withClient"),
    "must reject write flags before connecting to the database",
  );
});
