import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { claimIds, requestedIds, findMatches } from "../../scripts/self-host-apps/select-candidate-batch.mjs";
import { applyReviews } from "../../scripts/self-host-apps/apply-candidate-review.mjs";
import { applyResourceEstimates } from "../../scripts/self-host-apps/apply-resource-estimates.mjs";
import { databaseOptions } from "../../scripts/self-host-apps/lib/environment.mjs";
import { rowsToRefresh } from "../../scripts/self-host-apps/refresh-source-host.mjs";

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
function candidateClient(rows) {
  const writes = [];
  return { writes, async query(sql, params) {
    if (sql.startsWith("select")) return { rows: rows.filter((row) => params[0].includes(row.id)).map((row) => ({ ...row })) };
    writes.push(params[0]);
    for (const row of rows) if (params[0].includes(row.id)) row.status = "enriching";
    return { rows: [] };
  } };
}

test("missing ID stops the entire claim before any write", async () => {
  const rows = [{ id: id(1), status: "queued" }];
  const client = candidateClient(rows);
  await assert.rejects(claimIds(client, [id(1), id(2)]), /Missing candidate/);
  assert.deepEqual(client.writes, []);
  assert.equal(rows[0].status, "queued");
});
for (const status of ["published", "rejected", "duplicate", "unexpected"]) {
  test(`${status} stops the entire claim`, async () => {
    const client = candidateClient([{ id: id(1), status: "new" }, { id: id(2), status }]);
    await assert.rejects(claimIds(client, [id(1), id(2)]), /Cannot claim/);
    assert.deepEqual(client.writes, []);
  });
}

test("exact claim accepts new and already enriching, never touches unrelated rows, and can repeat", async () => {
  const rows = ["new", "needs_review", "enriching", "queued"].map((status, n) => ({ id: id(n + 1), status }));
  const client = candidateClient(rows);
  const result = await claimIds(client, [id(1), id(2), id(3)]);
  assert.equal(result.filter((row) => row.already_enriching).length, 1);
  assert.deepEqual(client.writes, [[id(1), id(2)]]);
  assert.equal(rows[3].status, "queued");
  assert.equal((await claimIds(client, [id(1), id(2), id(3)])).every((row) => row.already_enriching), true);
  assert.equal(client.writes.length, 1);
});

test("claim dry run reports original statuses and writes nothing", async () => {
  const client = candidateClient([{ id: id(1), status: "new" }]);
  assert.equal((await claimIds(client, [id(1)], true))[0].previous_status, "new");
  assert.deepEqual(client.writes, []);
});

test("IDs come from every review decision, with strict validation", async () => {
  const file = new URL("../../scripts/self-host-apps/batches/2026-11-01-forge-error-tracking-reviewed.json", import.meta.url);
  const ids = await requestedIds({ "ids-from": file });
  assert.equal(ids.length, 10);
  await assert.rejects(requestedIds({ ids: id(1), "ids-from": file }), /not both/);
  await assert.rejects(requestedIds({ ids: id(1), limit: "1" }), /cannot be combined/);
  await assert.rejects(requestedIds({ ids: "not-an-id" }), /UUID/);
  await assert.rejects(requestedIds({ ids: "" }), /UUID/);
  assert.deepEqual(await requestedIds({ ids: `${id(1)},${id(1)}` }), [id(1)]);
});

test("production gate ignores inherited NODE_ENV and DATABASE_URL and requires confirmation even for previews", () => {
  const previous = process.cwd();
  const dir = mkdtempSync(join(tmpdir(), "self-host-target-"));
  const oldNodeEnv = process.env.NODE_ENV;
  const oldUrl = process.env.DATABASE_URL;
  try {
    writeFileSync(join(dir, ".env.local"), "DATABASE_URL=postgres://development/db\n");
    writeFileSync(join(dir, ".env.database"), "DATABASE_URL=postgres://production/db\n");
    process.chdir(dir);
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgres://unintended/db";
    assert.equal(databaseOptions({}), "postgres://development/db");
    for (const flags of [{}, { "dry-run": true }, { "apply-reviewed": true }]) {
      assert.throws(() => databaseOptions({ environment: "production", ...flags }), /stack127-production/);
      assert.equal(databaseOptions({ environment: "production", confirm: "stack127-production", ...flags }), "postgres://production/db");
    }
    assert.throws(() => databaseOptions({ "database-url": "postgres://override/db" }), /not supported/);
    assert.throws(() => databaseOptions({ "dry-run": true, "apply-reviewed": true }), /not both/);
    assert.throws(() => databaseOptions({ "dry-run": "false" }), /flag/);
  } finally {
    process.chdir(previous);
    if (oldNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldNodeEnv;
    if (oldUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = oldUrl;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("review dry run checks all ten reviewed records using only reads", async () => {
  const reviews = JSON.parse(readFileSync(new URL("../../scripts/self-host-apps/batches/2026-11-01-forge-error-tracking-reviewed.json", import.meta.url))).records;
  const queries = [];
  const client = { async query(sql, params) {
    queries.push(sql);
    if (["begin read only", "rollback"].includes(sql)) return { rows: [] };
    assert.match(sql, /^select/i);
    assert.doesNotMatch(sql, /for update/i);
    if (sql.includes("self_host_app_candidates")) return { rows: [{ id: params[0], status: "enriching" }] };
    const review = reviews.find((row) => row.app?.slug === params[0]);
    return { rows: [{ id: review?.app_id ?? params[0] }] };
  } };
  assert.equal((await applyReviews(client, reviews, true)).length, 10);
  assert.equal(queries[0], "begin read only");
  assert.equal(queries.at(-1), "rollback");
});

test("review preview rejects unclaimed candidates and rolls back", async () => {
  const queries = [];
  const client = { async query(sql) {
    queries.push(sql);
    return { rows: [{ id: id(1), status: "new" }] };
  } };
  await assert.rejects(applyReviews(client, [{ candidate_id: id(1), decision: "reject", reason: "test" }], true), /claim it/);
  assert.equal(queries.at(-1), "rollback");
});

test("estimate preview performs only a lookup", async () => {
  const records = [{ slug: "example", resource_kind: "ram" }];
  const client = { async query(sql) {
    assert.match(sql.trim(), /^select/i);
    return { rows: [{ id: id(1), slug: "example" }] };
  } };
  assert.equal((await applyResourceEstimates(client, records, false)).mode, "dry-run");
});

test("find is read only and matches names and repositories literally", async () => {
  const queries = [];
  const client = { async query(sql, params) {
    assert.match(sql.trim(), /^select/i);
    assert.deepEqual(params, ["org/a_b"]);
    queries.push(sql);
    return { rows: [{ id: id(1) }] };
  } };
  const matches = await findMatches(client, "org/a_b");
  assert.equal(matches.candidates.length, 1);
  assert.equal(matches.apps.length, 1);
  assert.equal(queries.length, 2);
});

test("source-host refresh scopes a single slug with a bound parameter", async () => {
  const client = { async query(sql, params) {
    if (sql.includes("select source_code_host")) {
      assert.deepEqual(params, ["glitchtip"]);
      return { rows: [{ source_code_host: "gitlab", source_code_url: "https://gitlab.com/glitchtip/glitchtip" }] };
    }
    assert.match(sql, /slug = \$2/);
    assert.deepEqual(params, ["gitlab", "glitchtip", 500]);
    return { rows: [] };
  } };
  await rowsToRefresh(client, "gitlab", { slug: "glitchtip" });
});

 test("empty lookup and slug flags cannot fall back to broad operations", async () => {
  const client = { query() { throw new Error("Must reject before querying"); } };
  await assert.rejects(findMatches(client, ""), /needs a name/);
  await assert.rejects(rowsToRefresh(client, "codeberg", { slug: "" }), /needs an app slug/);
});

for (const [label, rows, message] of [
  ["missing app", [], /App not found: gitlab/],
  ["wrong host", [{ source_code_host: "gitlab", source_code_url: "https://gitlab.com/gitlab-org/gitlab" }], /belongs to host gitlab, not codeberg/],
  ["missing repository", [{ source_code_host: "codeberg", source_code_url: null }], /has no repository URL/],
]) {
  test(`targeted source refresh rejects ${label}`, async () => {
    let queries = 0;
    const client = { async query() { queries++; return { rows }; } };
    await assert.rejects(rowsToRefresh(client, "codeberg", { slug: "gitlab" }), message);
    assert.equal(queries, 1);
  });
}

test("an empty scheduled source-host queue is successful", async () => {
  const client = { async query() { return { rows: [] }; } };
  assert.deepEqual(await rowsToRefresh(client, "codeberg", {}), []);
});

test("release CLI requires production confirmation and ignores inherited production defaults", () => {
  const script = new URL("../../scripts/self-host-apps/release-candidate-batch.mjs", import.meta.url).pathname;
  const dir = mkdtempSync(join(tmpdir(), "self-host-release-"));
  try {
    writeFileSync(join(dir, ".env.local"), "DATABASE_URL=postgres://development/db\n");
    writeFileSync(join(dir, ".env.database"), "DATABASE_URL=postgres://production/db\n");
    const run = (...args) => spawnSync(process.execPath, [script, ...args], {
      cwd: dir, encoding: "utf8", env: { ...process.env, NODE_ENV: "production", DATABASE_URL: "postgres://unintended/db" },
    });
    const missingGate = run("--environment", "production");
    assert.equal(missingGate.status, 1);
    assert.match(missingGate.stderr, /Production requires --confirm stack127-production/);
    const explicitProduction = run("--environment", "production", "--confirm", "stack127-production");
    assert.match(explicitProduction.stderr, /Pass --file/);
    const development = run();
    assert.match(development.stderr, /Pass --file/);
    assert.doesNotMatch(development.stderr, /Production requires/);
    assert.match(run("--database-url", "postgres://override/db").stderr, /not supported/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
