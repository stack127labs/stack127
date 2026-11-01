import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { gitlabFacts } from "../../scripts/self-host-apps/refresh-source-host.mjs";
import { githubGraphql, writeFailureAttempt } from "../../scripts/self-host-apps/refresh-github.mjs";
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
    if (url.endsWith("/releases/permalink/latest")) return Response.json({}, { status: 404 });
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

test("one inaccessible GraphQL repository does not discard successful repositories", async (t) => {
  env(t, "GITHUB_TOKEN", "github-test-token");
  const payload = {
    data: { repo0: { nameWithOwner: "example/available" }, repo1: null },
    errors: [{ path: ["repo1"], message: "Could not resolve repository example/deleted" }],
  };
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(payload));
  assert.deepEqual(await githubGraphql("query { repo0: repository(owner: \"example\", name: \"available\") { nameWithOwner } }"), payload);
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
        source: 'export async function withClient(callback) { return callback({query: async (sql) => ({ rows: sql.includes("count(*)") ? [{count:0}] : JSON.parse(process.env.TEST_ROWS) })}); }'
      };
      return nextLoad(url, context);
    }});
    globalThis.fetch = async (url) => String(url).includes('api.github.com/graphql')
      ? Response.json({data:{repo0:null},errors:[{path:['repo0'],message:'Repository is inaccessible'}]})
      : String(url).includes('unreadable')
      ? new Response('', {status:404}) : new Response('Run this app on your server.');
  `);
  return { directory, run(script, rows, args = []) {
    return spawnSync(process.execPath, ["--import", pathToFileURL(hook).href, script, ...args], {
      encoding: "utf8", env: { ...process.env, TEST_ROWS: JSON.stringify(rows), GITHUB_TOKEN: "github-test-token", GITHUB_STEP_SUMMARY: join(directory, "summary.md") },
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
