import assert from "node:assert/strict";
import test from "node:test";
import pg from "pg";
import { resolveDatabaseUrl } from "../../scripts/stack127/tool-pages/lib.mjs";
import {
  hasRefreshAttemptColumns, rowsToRefresh, writeFailureAttempt, writeRepositoryFacts, refreshGithub,
} from "../../scripts/self-host-apps/refresh-github.mjs";

// Opt in with SELF_HOST_APPS_TEST_ENVIRONMENT=development. Like the isolated
// niche-seed test, execute the real SQL against transaction-local temporary
// tables only. No public rows, migrations, triggers or grants are changed.
const databaseTest = { skip: process.env.SELF_HOST_APPS_TEST_ENVIRONMENT !== "development" };

async function fixture(t, work) {
  const client = new pg.Client({ connectionString: resolveDatabaseUrl({ environment: "development" }),
    connectionTimeoutMillis: 15000, query_timeout: 30000 });
  try {
    await client.connect();
    await client.query("begin");
    await client.query("set local statement_timeout = '30s'");
    await client.query(`
      create temporary table github_projects_fixture
        (like public.github_projects including defaults including constraints including indexes) on commit drop;
      alter table github_projects_fixture drop column if exists last_attempt_at cascade,
        drop column if exists consecutive_failures;
      create temporary table self_host_apps_fixture (
        slug text primary key, source_code_url text, github_owner text, github_repo text, github_project_id uuid,
        source_code_host text default 'github', published boolean default true,
        source_model public.self_host_app_source_model default 'unknown',
        license text, license_spdx_id text, license_type public.self_host_app_license_type default 'unknown',
        maintenance_status text, data_source_urls text[], data_checked_at timestamptz, data_confidence text, updated_at timestamptz
      ) on commit drop;
    `);
    let schemaChecks = 0;
    const isolated = { query(sql, params) {
      if (sql.includes("from pg_attribute")) schemaChecks++;
      return client.query(sql.replaceAll("public.github_projects", "pg_temp.github_projects_fixture")
        .replaceAll("public.self_host_apps", "pg_temp.self_host_apps_fixture")
        .replaceAll("github_projects.consecutive_failures", "github_projects_fixture.consecutive_failures"), params);
    } };
    await work(client, isolated, () => schemaChecks);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

const oldCheck = "2026-10-01T00:00:00.000Z";
const attempt = "2026-11-01T12:00:00.000Z";
const recoveredAt = "2026-11-01T13:00:00.000Z";

async function seed(client) {
  await client.query(`
    insert into github_projects_fixture (owner,repo,full_name,repository_url,checked_at) values
      ('example','failed','example/failed','https://github.com/example/failed',$1),
      ('example','older','example/older','https://github.com/example/older','2026-10-02T00:00:00Z');
  `, [oldCheck]);
  await client.query(`
    insert into self_host_apps_fixture (slug,source_code_url,github_owner,github_repo,github_project_id)
      select repo,repository_url,owner,repo,id from github_projects_fixture;
    insert into self_host_apps_fixture (slug,source_code_url,github_owner,github_repo)
      values ('unlinked','https://github.com/example/unlinked','example','unlinked');
  `);
}

test("failed repositories move behind older work without claiming fresh facts, link missing projects, and recover", databaseTest, async (t) => {
  await fixture(t, async (client, isolated) => {
    // Reproduce the old schema first, then add the migration's retry fields.
    assert.equal(await hasRefreshAttemptColumns(isolated), false);
    await client.query(`alter table github_projects_fixture add column last_attempt_at timestamptz,
      add column consecutive_failures integer not null default 0 check (consecutive_failures >= 0)`);
    assert.equal(await hasRefreshAttemptColumns(isolated), true);
    await seed(client);
    const queue = async () => (await rowsToRefresh(isolated, { "published-only": true })).map(row => row.slug);
    const state = async repo => (await client.query(`select checked_at,last_attempt_at,consecutive_failures,stars
      from github_projects_fixture where repo=$1`, [repo])).rows[0];
    const apps = Object.fromEntries((await rowsToRefresh(isolated, {})).map(row => [row.slug, row]));
    assert.deepEqual(await queue(), ["unlinked", "failed", "older"]);

    await writeFailureAttempt(isolated, apps.failed, attempt, false);
    assert.deepEqual(await queue(), ["unlinked", "older", "failed"]);
    assert.equal((await state("failed")).checked_at.toISOString(), oldCheck);
    assert.equal((await state("failed")).last_attempt_at.toISOString(), attempt);
    assert.equal((await state("failed")).consecutive_failures, 1);
    await writeFailureAttempt(isolated, apps.failed, recoveredAt, false);
    assert.equal((await state("failed")).consecutive_failures, 2);
    assert.equal((await state("failed")).checked_at.toISOString(), oldCheck);

    await writeFailureAttempt(isolated, apps.unlinked, attempt, false);
    const linked = (await client.query(`select a.github_project_id,p.id,p.checked_at,p.consecutive_failures
      from self_host_apps_fixture a join github_projects_fixture p on p.owner=a.github_owner and p.repo=a.github_repo
      where a.slug='unlinked'`)).rows[0];
    assert.equal(linked.github_project_id, linked.id);
    assert.equal(linked.checked_at, null);
    assert.equal(linked.consecutive_failures, 1);
    assert.equal((await queue())[0], "older");

    await writeRepositoryFacts(isolated, apps.failed, { nameWithOwner: "example/failed", stargazerCount: 42 }, recoveredAt, false);
    const recovered = await state("failed");
    assert.equal(recovered.consecutive_failures, 0);
    assert.equal(recovered.checked_at.toISOString(), recoveredAt);
    assert.equal(recovered.last_attempt_at.toISOString(), recoveredAt);
    assert.equal(recovered.stars, 42);
  });
});

test("an unmigrated schema checks once, keeps the old queue, and writes successful mixed GraphQL results", databaseTest, async (t) => {
  const previousToken = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = "github-test-token";
  t.after(() => {
    if (previousToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = previousToken;
  });
  await fixture(t, async (client, isolated, schemaChecks) => {
    await seed(client);
    t.mock.method(globalThis, "fetch", async () => Response.json({
      data: { repo0: null, repo1: { nameWithOwner: "example/failed", stargazerCount: 99 } },
      errors: [{ path: ["repo0"], message: "Repository example/unlinked is inaccessible" }],
    }));
    const report = await refreshGithub(isolated, { limit: 2, "published-only": true });
    assert.equal(report.retryMetadataAvailable, false);
    assert.equal(report.selected, 2);
    assert.equal(report.refreshed, 1);
    assert.equal(report.failed, 1);
    assert.equal(schemaChecks(), 1);
    const project = (await client.query("select stars,checked_at from github_projects_fixture where repo='failed'")).rows[0];
    assert.equal(project.stars, 99);
    assert.ok(project.checked_at > new Date(oldCheck));
    assert.equal((await client.query("select github_project_id from self_host_apps_fixture where slug='unlinked'")).rows[0].github_project_id, null);
    assert.deepEqual((await rowsToRefresh(isolated, {}, false)).map(row => row.slug), ["unlinked", "older", "failed"]);
  });
});
