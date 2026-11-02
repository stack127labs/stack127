import assert from "node:assert/strict";
import test from "node:test";
import pg from "pg";
import { applyDecisions } from "../../scripts/self-host-apps/dedupe-candidates.mjs";
import { claimIds } from "../../scripts/self-host-apps/select-candidate-batch.mjs";
import { resolveDatabaseUrl } from "../../scripts/stack127/tool-pages/lib.mjs";

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const expectedCandidates = [1, 2, 3, 4].map((n) => ({ id: id(n), status: "new", duplicate_reason: null }));
function staleDecisions() {
  return {
    expectedCandidates,
    appDuplicates: [{ target_id: id(1), app_id: id(10), reason: "exact_source_code_match" }],
    candidateDuplicates: [{ target_id: id(2), duplicate_candidate_id: id(10), reason: "exact_source_code_match" }],
    nameReviews: [{ target_id: id(3), app_id: id(10) }],
    queuedIds: [id(4)],
  };
}

for (const status of ["enriching", "published"]) {
  test(`stale dedupe skips every write path and source preservation after a row becomes ${status}`, async () => {
    let queries = 0;
    const client = { async query(sql, params) {
      queries++;
      // A claim/review completed after dedupe read its original targets. None
      // still match that snapshot when the guarded locking query runs.
      assert.match(sql, /candidate.status = expected.status/);
      assert.match(sql, /candidate.duplicate_reason is not distinct from expected.duplicate_reason/);
      assert.match(sql, /for no key update of candidate/);
      const expected = JSON.parse(params[0]);
      const current = expected.map((row) => ({ ...row, status }));
      return { rows: current.filter((row) => expected.some((old) => old.id === row.id && old.status === row.status)) };
    } };
    const report = await applyDecisions(client, staleDecisions());
    assert.equal(queries, 1); // No app evidence writes or candidate updates.
    assert.deepEqual(report, { skipped_changed: 4, queued: 0, app_duplicates: 0, candidate_duplicates: 0, name_reviews: 0, sources_preserved: 0 });
  });
}

test("unchanged dedupe targets still move forward while changed targets are skipped", async () => {
  const writes = [];
  const client = { async query(sql, params) {
    if (sql.includes("for no key update of candidate")) return { rows: [{ id: id(4) }] };
    writes.push(params);
    assert.match(sql, /set status = 'queued'/);
    return { rows: [] };
  } };
  const report = await applyDecisions(client, staleDecisions());
  assert.equal(report.skipped_changed, 3);
  assert.equal(report.queued, 1);
  assert.deepEqual(writes, [[[id(4)]]]);
});

// Opt-in real SQL regression: original dedupe read -> manual claim -> stale
// dedupe write. Temporary tables only; no public rows or schema are changed.
test("database: a manual claim between dedupe read and write survives all stale decisions", {
  skip: process.env.SELF_HOST_APPS_TEST_ENVIRONMENT !== "development",
}, async () => {
  const client = new pg.Client({ connectionString: resolveDatabaseUrl({ environment: "development" }), connectionTimeoutMillis: 15000, query_timeout: 30000 });
  try {
    await client.connect();
    await client.query("begin");
    await client.query(`create temporary table dedupe_candidates_fixture (
      id uuid primary key, status text, duplicate_reason text, updated_at timestamptz
    ) on commit drop`);
    await client.query("insert into dedupe_candidates_fixture (id, status) select id, 'new' from unnest($1::uuid[]) id", [expectedCandidates.map((row) => row.id)]);
    const isolated = { query(sql, params) {
      // Source preservation must not run for claimed/published rows.
      assert.doesNotMatch(sql, /public.self_host_apps/);
      return client.query(sql.replaceAll("public.self_host_app_candidates", "pg_temp.dedupe_candidates_fixture"), params);
    } };
    const snapshot = (await isolated.query("select * from public.self_host_app_candidates order by id")).rows;
    await claimIds(isolated, snapshot.map((row) => row.id));
    await client.query("update dedupe_candidates_fixture set status = 'published' where id = $1", [id(1)]);
    const report = await applyDecisions(isolated, { ...staleDecisions(), expectedCandidates: snapshot });
    assert.equal(report.skipped_changed, 4);
    const after = await client.query("select status from dedupe_candidates_fixture order by id");
    assert.deepEqual(after.rows.map((row) => row.status), ["published", "enriching", "enriching", "enriching"]);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
});

// A claim must not block dedupe's foreign-key check on the row it holds. Otherwise a
// claim waiting on dedupe's next row and dedupe waiting on the claimed row would deadlock.
test("database: a claimed candidate can still be referenced by a concurrent dedupe write", {
  skip: process.env.SELF_HOST_APPS_TEST_ENVIRONMENT !== "development",
}, async () => {
  const connect = () => new pg.Client({ connectionString: resolveDatabaseUrl({ environment: "development" }), connectionTimeoutMillis: 15000, query_timeout: 30000 });
  const claimer = connect();
  const deduper = connect();
  try {
    await claimer.connect();
    await deduper.connect();
    const { rows } = await claimer.query("select id from public.self_host_app_candidates where status = 'queued' order by id limit 2");
    assert.equal(rows.length, 2, "needs two queued development candidates");
    const [claimed, referencing] = rows.map((row) => row.id);
    await claimer.query("begin");
    await claimIds(claimer, [claimed], false);
    await deduper.query("begin");
    await deduper.query("set local lock_timeout = '3s'");
    // Rolled back below. A blocking lock would fail here with a lock timeout.
    await deduper.query("update public.self_host_app_candidates set duplicate_candidate_id = $1 where id = $2", [claimed, referencing]);
  } finally {
    await deduper.query("rollback").catch(() => {});
    await claimer.query("rollback").catch(() => {});
    await deduper.end().catch(() => {});
    await claimer.end().catch(() => {});
  }
});
