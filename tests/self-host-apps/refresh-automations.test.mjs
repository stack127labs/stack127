import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { refreshFailed } from "../../scripts/self-host-apps/lib/refresh-health.mjs";
import { gitlabFacts, refreshSourceHost } from "../../scripts/self-host-apps/refresh-source-host.mjs";
import { refreshGithub, writeFailureAttempt } from "../../scripts/self-host-apps/refresh-github.mjs";
import { fetchJson } from "../../scripts/self-host-apps/discover-app-catalogs.mjs";

function env(t, key, value) {
  const previous = process.env[key];
  process.env[key] = value;
  t.after(() => {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  });
}

// Mock remote APIs only; importing a CLI must not connect to a database.
test("nested GitLab repositories use their own instance without the gitlab.com token", async (t) => {
  env(t, "GITLAB_TOKEN", "gitlab-com-test-token");
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith("?license=true")) return Response.json({
      id: 42, path_with_namespace: "tpo/applications/mullvad-browser", star_count: 12,
      license: { spdx_identifier: "MPL-2.0" },
    });
    if (url.endsWith("/languages")) return Response.json({ C: 100 });
    if (url.includes("/releases?")) return Response.json({}, { status: 404 });
    return Response.json([{ committed_date: "2026-10-31T00:00:00Z" }]);
  });
  const facts = await gitlabFacts({ source_code_url: "https://gitlab.torproject.org/tpo/applications/mullvad-browser.git/-/tree/main" });
  assert.equal(facts.source_full_name, "tpo/applications/mullvad-browser");
  assert.equal(facts.source_stars, 12);
  assert.equal(facts.source_latest_release, null);
  assert.equal(calls.length, 4);
  for (const { url, options } of calls) {
    assert.ok(url.startsWith("https://gitlab.torproject.org/api/v4/projects/tpo%2Fapplications%2Fmullvad-browser"));
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.redirect, "error");
  }
  calls.length = 0;
  await gitlabFacts({ source_code_url: "https://gitlab.com/tpo/applications/mullvad-browser/" });
  assert.ok(calls.every(({ options }) => options.headers.Authorization === "Bearer gitlab-com-test-token"));
});

test("GitLab release list refreshes stars and the latest release without following redirects", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith("?license=true")) return Response.json({ id: 1, star_count: 42 });
    if (url.endsWith("/languages")) return Response.json({ Python: 100 });
    if (url.endsWith("/releases?per_page=1&order_by=released_at&sort=desc")) {
      return Response.json([{ tag_name: "v6.0.0", released_at: "2026-11-01T00:00:00Z" }]);
    }
    if (url.endsWith("/repository/commits?per_page=1")) return Response.json([]);
    throw new Error(`Unexpected request: ${url}`);
  });
  const facts = await gitlabFacts({ source_code_url: "https://gitlab.com/glitchtip/glitchtip" });
  assert.equal(facts.source_stars, 42);
  assert.equal(facts.source_latest_release, "v6.0.0");
  assert.equal(facts.source_latest_release_at, "2026-11-01T00:00:00Z");
  assert.equal(facts.raw.release.tag_name, "v6.0.0");
  assert.ok(calls.every(({ options }) => options.redirect === "error"));
});

for (const status of [200, 403, 404]) {
  test(`GitLab stars are written when releases are unavailable or empty (${status})`, async (t) => {
    t.mock.method(globalThis, "fetch", async (url) => {
      if (url.endsWith("?license=true")) return Response.json({ id: 1, star_count: 123 });
      if (url.endsWith("/languages")) return Response.json({ Ruby: 100 });
      if (url.includes("/releases?")) return Response.json(status === 200 ? [] : {}, { status });
      return Response.json([]);
    });
    const writes = [];
    const client = { async query(sql, values) {
      if (sql.includes("select id, slug, source_code_url")) return { rows: [{ id: "app-id", slug: "gitlab", source_code_url: "https://gitlab.com/gitlab-org/gitlab" }] };
      if (sql.includes('select app.*')) return { rows: [{ id:'app-id', slug:'gitlab', star_recipient:true, popularity_score:0, popularity_basis:[] }] };
      if (sql.includes('jsonb_populate_recordset')) writes.push(...JSON.parse(values[0]));
      return { rows: [], rowCount:1 };
    } };
    const report = await refreshSourceHost(client, { host: "gitlab" });
    assert.equal(report.refreshed, 1);
    assert.equal(report.failed, 0);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].source_stars, 123);
    assert.equal(writes[0].popularity_score, 50);
    assert.equal(writes[0].source_latest_release, undefined);
  });
}

test("GitLab project permission errors still fail the refresh", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    if (url.endsWith("?license=true")) return Response.json({}, { status: 403 });
    return Response.json([]);
  });
  await assert.rejects(gitlabFacts({ source_code_url: "https://gitlab.com/private/app" }), { status: 403 });
});

test("catalog requests send a GitHub credential only to the GitHub API", async (t) => {
  env(t, "GITHUB_TOKEN", "github-test-token");
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return Response.json({ results: [] });
  });
  await fetchJson("https://registry.hub.docker.com/v2/search/repositories/?query=self-hosted");
  await fetchJson("https://api.github.com/repos/example/app/contents");
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(calls[1].options.headers.Authorization, "Bearer github-test-token");
});

test("one inaccessible GraphQL repository does not discard successful repository writes", async (t) => {
  env(t, "GITHUB_TOKEN", "github-test-token");
  const payload = {
    data: { repo0: { nameWithOwner: "example/available", stargazerCount: 42 }, repo1: null },
    errors: [{ path: ["repo1"], message: "Could not resolve repository example/deleted" }],
  };
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(payload));
  const writes = [];
  let schemaChecks = 0;
  const client = { async query(sql, values) {
    if (sql.includes("from pg_attribute")) { schemaChecks++; return { rows: [{ available: true }] }; }
    if (sql.includes("with memberships as")) return { rows: ["available", "deleted"].map(slug => ({
      slug, source_code_url: `https://github.com/example/${slug}`,
    })) };
    writes.push({ sql, values });
    return { rows: [{ id: "00000000-0000-0000-0000-000000000001" }] };
  } };
  const report = await refreshGithub(client, {});
  assert.equal(report.refreshed, 1);
  assert.equal(report.failed, 1);
  assert.ok(writes.some(({ sql, values }) => sql.includes("insert into public.github_projects")
    && values[0] === "example" && values[1] === "available" && values[7] === 42),
  "The successful alias must persist its stars, even when another repository fails");
  assert.ok(writes.some(({ sql, values }) => sql.includes("update public.self_host_apps app") && values[0].includes("available")),
    "The successful repository must also update its app link");
  assert.equal(schemaChecks, 1);
  assert.equal(fetch.mock.callCount(), 1);
});

test("a dry-run failure does not write attempt metadata or link an app", async () => {
  await writeFailureAttempt({ query() { assert.fail("Dry run attempted a database write"); } }, {
    slug: "example", github_owner: "example", github_repo: "deleted",
  }, "2026-11-01T00:00:00Z", true);
});

async function cliFixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "stack127-refresh-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const hook = join(directory, "mock-db.mjs");
  await writeFile(hook, `
    import { registerHooks } from 'node:module';
    registerHooks({ load(url, context, nextLoad) {
      if (url.endsWith('/scripts/self-host-apps/lib/db.mjs')) return {
        format: 'module', shortCircuit: true,
        source: 'export async function withClient(callback) { return callback({query: async (sql) => ({ rows: sql.includes("from pg_attribute") ? [{available:true}] : sql.includes("count(*)") ? [{count:0}] : JSON.parse(process.env.TEST_ROWS) })}); }'
      };
      return nextLoad(url, context);
    }});
    globalThis.fetch = async (url) => String(url).includes('api.github.com/graphql')
      ? (() => {
        const rows = JSON.parse(process.env.TEST_ROWS);
        const failures = process.env.TEST_FAILURES === 'all' ? Infinity : Number(process.env.TEST_FAILURES);
        return Response.json({
          data: Object.fromEntries(Array.from({length:rows.length || 1}, (_,i) => ['repo'+i,i<failures ? null : {nameWithOwner:'example/'+rows[i].slug,stargazerCount:5}])),
          errors: Array.from({length:Math.min(failures,rows.length || 1)},(_,i)=>({path:['repo'+i],message:'Repository is inaccessible'})),
        });
      })()
      : String(url).includes('unreadable')
      ? new Response('', {status:404}) : new Response('Run this app on your server.');
  `);
  return { directory, run(script, rows, args = [], failureCount) {
    return spawnSync(process.execPath, ["--import", pathToFileURL(hook).href, script, ...args], {
      encoding: "utf8", env: { ...process.env, TEST_ROWS: JSON.stringify(rows), TEST_FAILURES: failureCount === undefined ? "all" : String(failureCount), GITHUB_TOKEN: "github-test-token", GITHUB_STEP_SUMMARY: join(directory, "summary.md") },
    });
  } };
}

test("technical evidence keeps useful output with 5% unreadable sources but rejects broader failures", async (t) => {
  const { directory, run } = await cliFixture(t);
  for (const [failures, selected, status] of [[1, 20, 0], [2, 20, 1], [1, 1, 1]]) {
    const rows = Array.from({ length: selected }, (_, i) => ({
      slug: `app-${i}`, name: `App ${i}`, website_url: `https://${i < failures ? "unreadable" : "readable"}.example/${i}`,
    }));
    const out = join(directory, `evidence-${failures}-${selected}.json`);
    const result = run("scripts/self-host-apps/refresh-primary-technical-facts.mjs", rows, ["--out", out]);
    assert.equal(result.status, status, result.stderr);
    const report = JSON.parse(await readFile(out, "utf8"));
    assert.equal(report.selected, selected);
    assert.equal(report.passed, selected - failures);
    assert.equal(report.failed_count, failures);
    assert.equal(report.records.length, selected - failures);
  }
});

test("publication QA writes its report into a new output directory", async (t) => {
  const { directory, run } = await cliFixture(t);
  const out = join(directory, "new", "qa.json");
  const result = run("scripts/self-host-apps/qa-gate.mjs", [], ["--out", out]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(await readFile(out, "utf8")).published, 0);
});


test("GitHub dry runs name failed repositories and failure counts in the job summary", async (t) => {
  const { directory, run } = await cliFixture(t);
  const result = run("scripts/self-host-apps/refresh-github.mjs", [], ["--repo", "example/deleted", "--dry-run"]);
  assert.equal(result.status, 1, result.stderr);
  const summary = await readFile(join(directory, "summary.md"), "utf8");
  assert.match(summary, /Failed: 1/);
  assert.match(summary, /example\/deleted/);
  assert.match(summary, /Repository is inaccessible/);
});


test("failed-attempt bookkeeping never aborts for missing identity or a database error", async (t) => {
  const warnings = [];
  t.mock.method(console, "warn", message => warnings.push(message));
  await writeFailureAttempt({ query() { assert.fail("Missing identity must not issue SQL"); } }, { slug: "binhex-emby" }, "2026-11-02T00:00:00Z", false);
  await writeFailureAttempt({ async query() { throw new Error("database unavailable"); } }, { slug: "deleted", github_owner: "example", github_repo: "deleted" }, "2026-11-02T00:00:00Z", false);
  assert.ok(warnings.some(message => message.includes("binhex-emby") && message.includes("missing repository identity")));
  assert.ok(warnings.some(message => message.includes("deleted") && message.includes("database unavailable")));
});

test("a selected identity-less row stays in the failure summary while later repositories refresh", async (t) => {
  env(t, "GITHUB_TOKEN", "github-test-token");
  const { directory } = await cliFixture(t);
  env(t, "GITHUB_STEP_SUMMARY", join(directory, "missing-identity.md"));
  const rows = [{ slug: "binhex-emby", source_code_url: null }, { slug: "valid", source_code_url: "https://github.com/example/valid" }];
  const client = { async query(sql) {
    if (sql.includes("from pg_attribute")) return { rows: [{ available: true }] };
    if (sql.includes("with memberships as")) return { rows };
    return { rows: [{ id: "00000000-0000-0000-0000-000000000001" }] };
  } };
  t.mock.method(globalThis, "fetch", async () => Response.json({ data: { repo0: { stargazerCount: 5 } } }));
  const report = await refreshGithub(client, {});
  assert.equal(report.refreshed, 1);
  assert.equal(report.failures[0].slug, "binhex-emby");
  assert.match(await readFile(join(directory, "missing-identity.md"), "utf8"), /binhex-emby/);
});

test("GitHub CLI tolerates up to 20% failed repositories, but fails broader outages and complete failure", async (t) => {
  const { directory, run } = await cliFixture(t);
  const rows = Array.from({length:10},(_,i)=>({slug:`app-${i}`,source_code_url:`https://github.com/example/app-${i}`}));
  for (const [failed, status] of [[1,0],[2,0],[3,1],[10,1]]) {
    const result = run("scripts/self-host-apps/refresh-github.mjs", rows, ["--published-only", "--limit", "500", "--dry-run"], failed);
    assert.equal(result.status, status, result.stderr);
    assert.match(await readFile(join(directory, "summary.md"), "utf8"), new RegExp(`Failed: ${failed}`));
  }
  assert.equal(refreshFailed({selected:0,refreshed:0,failed:0}), false);
  assert.equal(refreshFailed({selected:1,refreshed:0,failed:0}), true);
});

test("GitLab and Codeberg tolerate isolated dead sources and still reject broad or total failures", async (t) => {
  t.mock.method(globalThis, "fetch", async url => String(url).includes("dead")
    ? Response.json({}, {status:404}) : Response.json(/\/(releases|commits)/.test(String(url)) ? [] : {id:1,path_with_namespace:"apps/valid",full_name:"apps/valid"}));
  for (const host of ["gitlab", "codeberg"]) {
    for (const failed of [1,2,5]) {
      const rows = Array.from({length:5},(_,i)=>({slug:`app-${i}`,source_code_url:`https://${host === "gitlab" ? "gitlab.example" : "codeberg.org"}/apps/${i < failed ? "dead" : "valid"}-${i}`}));
      const client = { async query() { return {rows}; } };
      const report = await refreshSourceHost(client, {host,"dry-run":true});
      assert.equal(report.failed, failed);
      assert.equal(report.refreshed, 5-failed);
      assert.equal(report.failures.length, failed);
      assert.equal(refreshFailed(report), failed > 1);
    }
  }
});
