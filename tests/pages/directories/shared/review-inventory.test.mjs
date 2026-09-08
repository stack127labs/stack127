import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readAuditCursor } from "../../../../scripts/stack127/directory-quality/read-audit-cursor.mjs";

test("large snapshots are read in bounded batches without losing rows", async () => {
  const calls = [];
  const pages = [[{ slug: "a" }, { slug: "b" }], [{ slug: "c" }], []];
  const client = { query: async sql => { calls.push(sql); return { rows: sql.startsWith("fetch") ? pages.shift() : [] }; } };
  assert.deepEqual(await readAuditCursor(client, "apps_audit", "select slug from apps"), [{ slug: "a" }, { slug: "b" }, { slug: "c" }]);
  assert.equal(calls.filter(sql => sql.startsWith("fetch forward 100")).length, 3);
  assert.equal(calls.at(-1), "close apps_audit");
});

test("the audit snapshot includes joined evidence, not just card fields", () => {
  const code = readFileSync("scripts/stack127/directory-quality/inventory.mjs", "utf8");
  for (const table of ["self_host_app_install_options", "self_host_app_resource_estimates", "github_projects", "terminal_app_field_sources"]) {
    assert.ok(code.includes(`public.${table}`), `${table} must be captured`);
  }
  assert.match(code, /select app\.\*/);
  assert.match(code, /repeatable read read only/);
  assert.match(code, /flag: "wx"/, "audit snapshots must not overwrite an existing baseline");
  assert.match(code, /review_status: "pending"/);
});
