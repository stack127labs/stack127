import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { edgeFunctionRetired, revalidationToken, runCacheWorker, workerSettings } from "../../scripts/stack127/cache/worker.mjs";

const key = "a".repeat(64);
const token = createHmac("sha256", key).update("stack127-cache-revalidation-v1").digest("hex");
const pageEvent = { id: "9007199254740993", entity_type: "page", slug: "about", created_at: "2026-10-19 10:00:00.123456+00" };
const fingerprint = "b".repeat(32);
const json = (body, status = 200) => Response.json(body, { status });
const quiet = { log() {}, warn() {}, error() {} };
const legacyEnv = { CLOUDFLARE_API_TOKEN: "cf-token", CLOUDFLARE_ZONE_ID: "zone1", GITHUB_ALERT_TOKEN: "alert-token" };

// Routes the worker's SQL by its distinctive text, like the content-queue tests.
function fakeClient({ events = [], wiring = {}, cronJobs = 0, leaseTaken = false, queue = { pending: 0, minutes: null },
  alertIssue = null, lastReconcileAt = new Date().toISOString(), recovered = 0, history = true, deleted } = {}) {
  const calls = [];
  const rows = list => ({ rows: list, rowCount: list.length });
  const client = { calls, async query(text, values = []) {
    calls.push({ text: text.replace(/\s+/g, " ").trim(), values });
    const sql = calls.at(-1).text;
    if (sql.includes("from public.stack127_cache_worker_wake wake")) return rows([{ wake_url: wiring.wakeUrl ?? false, wake_trigger: wiring.wakeTrigger ?? false, has_cron: wiring.hasCron ?? false }]);
    if (sql.includes("from cron.job")) return rows([{ count: cronJobs }]);
    if (sql.includes("select signing_key")) return rows([{ signing_key: key }]);
    if (sql.startsWith("update public.stack127_cache_worker_state set lease_id = $1")) return rows(leaseTaken ? [] : [{ 1: 1 }]);
    if (sql.includes("select last_reconcile_at")) return rows([{ last_reconcile_at: lastReconcileAt }]);
    if (sql.includes("with sources as materialized")) return rows(Array.from({ length: recovered }, () => ({})));
    if (sql.includes("from public.stack127_cache_processed limit 1")) return rows(history ? [{ 1: 1 }] : []);
    if (sql.includes("entity_type <> 'self_host_app'")) return rows(events.filter(event => event.entity_type !== "self_host_app"));
    if (sql.includes("entity_type = 'self_host_app' and")) return rows(events.filter(event => event.entity_type === "self_host_app"));
    if (sql.includes("where page.page_family = 'catalog'")) return rows([]);
    if (sql.includes("stack127_cache_source_revisions($1")) return rows(events.map(event => ({ entity_type: event.entity_type, slug: event.slug, fingerprint })));
    if (sql.startsWith("delete from public.stack127_revalidation_events")) return rows(deleted ?? events.map(event => ({ entity_type: event.entity_type, slug: event.slug })));
    if (sql.includes("count(*)::int as pending")) return rows([queue]);
    if (sql.includes("select alert_issue_number")) return rows([{ alert_issue_number: alertIssue }]);
    if (sql.includes("extract(epoch from min(greatest")) return rows([{ seconds: null }]);
    return rows([]);
  } };
  return client;
}

function fakeFetch({ verified, warmBody, github } = {}) {
  const calls = [];
  const fetchImplementation = async (url, init = {}) => {
    calls.push({ url, init });
    const { pathname, hostname } = new URL(url);
    if (pathname === "/api/cache/revalidate") return json({ ok: true });
    if (pathname === "/api/cache/refresh") {
      const { paths } = JSON.parse(init.body);
      return json({ verified: verified ? verified(paths) : paths.map(path => ({ path, status: 200, revision: "rev-1", digest: null })) });
    }
    if (hostname === "api.cloudflare.com") return json({ success: true });
    if (hostname === "api.github.com") return github ? github(url, init) : json({ number: 42 });
    return new Response(warmBody ?? '<meta name="stack127-content-revision" content="rev-1">', { status: 200 });
  };
  return { calls, fetchImplementation };
}

const statements = client => client.calls.map(call => call.text);
const updates = client => statements(client).filter(text => /^(update|delete|insert|begin|commit|rollback)/.test(text));

test("the worker refuses to run while the Edge Function is still wired to the database", async () => {
  for (const setup of [{ wiring: { wakeUrl: true } }, { wiring: { wakeTrigger: true } }, { wiring: { hasCron: true }, cronJobs: 1 }]) {
    const client = fakeClient({ events: [pageEvent], ...setup });
    const fetch = fakeFetch();
    await assert.rejects(runCacheWorker(client, { env: legacyEnv, fetchImplementation: fetch.fetchImplementation, log: quiet }), /still wired/);
    assert.deepEqual(updates(client), []);
    assert.equal(fetch.calls.length, 0);
  }
  assert.equal(edgeFunctionRetired({ wakeUrl: false, wakeTrigger: false, cronJob: false }), true);
  const client = fakeClient({ wiring: { hasCron: true }, cronJobs: 0 });
  assert.equal((await runCacheWorker(client, { env: legacyEnv, fetchImplementation: fakeFetch().fetchImplementation, log: quiet })).leased, true);
});

test("a dry run reports ready events and wiring without a lease, retry, reconcile, or alert", async () => {
  const client = fakeClient({ events: [pageEvent], wiring: { wakeUrl: true }, queue: { pending: 1, minutes: 40 } });
  const fetch = fakeFetch();
  const result = await runCacheWorker(client, { env: { ...legacyEnv, CACHE_WORKER_DRY_RUN: "1" }, fetchImplementation: fetch.fetchImplementation, log: quiet });
  assert.equal(result.dryRun, true);
  assert.equal(result.events, 1);
  assert.equal(result.edgeFunctionRetired, false);
  assert.equal(result.leased, false);
  assert.deepEqual(updates(client), []);
  assert.equal(fetch.calls.length, 0);
});

test("another lease holder stops the run before any work", async () => {
  const client = fakeClient({ events: [pageEvent], leaseTaken: true });
  const fetch = fakeFetch();
  const result = await runCacheWorker(client, { env: legacyEnv, fetchImplementation: fetch.fetchImplementation, log: quiet });
  assert.deepEqual(result, { processed: 0, error: null, leased: false, dryRun: false, hosting: "legacy" });
  assert.equal(fetch.calls.length, 0);
  assert.ok(!statements(client).some(text => text.includes("select signing_key")));
});

test("a page change is invalidated, verified, purged, warmed, then acknowledged with its fingerprint", async () => {
  const client = fakeClient({ events: [pageEvent] });
  const fetch = fakeFetch();
  const result = await runCacheWorker(client, { env: legacyEnv, fetchImplementation: fetch.fetchImplementation, log: quiet });
  assert.equal(result.processed, 1);
  assert.equal(result.error, null);

  const steps = fetch.calls.map(call => new URL(call.url)).map(url => url.hostname === "api.cloudflare.com" ? "purge" : url.pathname);
  assert.equal(steps[0], "/api/cache/revalidate");
  assert.ok(steps.indexOf("/api/cache/refresh") < steps.indexOf("purge"), "origin verifies before the edge purge");
  assert.ok(steps.indexOf("purge") < steps.indexOf("/about"), "public pages warm after the purge");
  assert.equal(fetch.calls[0].init.headers.Authorization, `Bearer ${token}`);
  assert.equal(revalidationToken(key), token);
  const purge = fetch.calls.find(call => call.url.includes("api.cloudflare.com"));
  assert.equal(purge.init.headers.Authorization, "Bearer cf-token");
  assert.ok(purge.url.includes("/zones/zone1/purge_cache"));
  assert.ok(JSON.parse(purge.init.body).tags.includes("page:about"));

  // Settle times for legacy mode, then the acknowledgement of the exact event version.
  const ready = client.calls.find(call => call.text.includes("entity_type <> 'self_host_app'"));
  assert.deepEqual(ready.values, [10, 60]);
  const acknowledged = client.calls.find(call => call.text.startsWith("delete from public.stack127_revalidation_events"));
  assert.deepEqual(acknowledged.values, [[pageEvent.id], [pageEvent.created_at]]);
  const processed = client.calls.find(call => call.text.startsWith("insert into public.stack127_cache_processed"));
  assert.deepEqual(processed.values, [["page"], ["about"], [fingerprint]]);
  const order = statements(client);
  assert.ok(order.indexOf("begin") < order.indexOf("commit"));
  assert.ok(!order.includes("rollback"));
  assert.ok(!order.some(text => text.includes("attempts = event.attempts + 1")), "no retry was scheduled");

  const release = client.calls.at(-1);
  assert.ok(release.text.includes("lease_id = null"));
  assert.deepEqual(release.values.slice(1), [false, null, false]);
  assert.ok(statements(client).at(-2).startsWith("update public.stack127_cache_observation"));
});

test("an unverified origin keeps the event, schedules a retry, and leaves Cloudflare alone", async () => {
  const client = fakeClient({ events: [pageEvent] });
  const fetch = fakeFetch({ verified: () => [] });
  const result = await runCacheWorker(client, { env: legacyEnv, fetchImplementation: fetch.fetchImplementation, log: quiet });
  assert.equal(result.processed, 0);
  assert.match(result.error, /did not verify every path/);
  assert.ok(!fetch.calls.some(call => call.url.includes("api.cloudflare.com")));
  assert.ok(!statements(client).some(text => text.startsWith("delete from")));
  const retry = client.calls.find(call => call.text.includes("attempts = event.attempts + 1"));
  assert.deepEqual(retry.values.slice(0, 2), [[pageEvent.id], [pageEvent.created_at]]);
  assert.match(retry.values[2], /did not verify every path/);
  assert.ok(retry.text.includes("interval '15 seconds'") && retry.text.includes("interval '5 minutes'"));
  const release = client.calls.at(-1);
  assert.equal(release.values[1], false);
  assert.match(release.values[2], /did not verify/);
});

test("a stale public response after the purge is never acknowledged", async () => {
  const client = fakeClient({ events: [pageEvent] });
  const fetch = fakeFetch({ warmBody: '<meta name="stack127-content-revision" content="old">' });
  const result = await runCacheWorker(client, { env: legacyEnv, fetchImplementation: fetch.fetchImplementation, log: quiet });
  assert.match(result.error, /Public content is stale/);
  assert.ok(!statements(client).some(text => text.startsWith("delete from")));
  assert.ok(statements(client).some(text => text.includes("attempts = event.attempts + 1")));
});

test("an event superseded during processing stays queued and records no fingerprint", async () => {
  const client = fakeClient({ events: [pageEvent], deleted: [] });
  const result = await runCacheWorker(client, { env: legacyEnv, fetchImplementation: fakeFetch().fetchImplementation, log: quiet });
  assert.equal(result.processed, 0);
  assert.equal(result.error, null);
  assert.ok(!statements(client).some(text => text.startsWith("insert into public.stack127_cache_processed")));
  assert.ok(statements(client).includes("commit"));
});

test("Cloudflare mode dispatches one frontend build, acknowledges nothing, and keeps the lease", async () => {
  const client = fakeClient({ events: [pageEvent] });
  const github = (url, init) => init.method === "POST" ? new Response(null, { status: 204 }) : json({ total_count: 0, workflow_runs: [] });
  const fetch = fakeFetch({ github });
  const env = { STACK127_FRONTEND_HOSTING: "cloudflare", GITHUB_FRONTEND_TOKEN: "frontend-token" };
  const result = await runCacheWorker(client, { env, fetchImplementation: fetch.fetchImplementation, log: quiet });
  assert.equal(result.error, null);
  assert.equal(result.hosting, "cloudflare");
  assert.ok(fetch.calls.every(call => call.url.startsWith("https://api.github.com/")));
  const dispatch = fetch.calls.filter(call => call.init.method === "POST");
  assert.equal(dispatch.length, 1);
  assert.equal(dispatch[0].init.headers.Authorization, "Bearer frontend-token");
  assert.ok(dispatch[0].url.endsWith("/stack127-frontend-refresh.yml/dispatches"));
  const ready = client.calls.find(call => call.text.includes("entity_type <> 'self_host_app'"));
  assert.deepEqual(ready.values, [60, 300]);
  assert.ok(!statements(client).some(text => text.startsWith("delete from")));
  const release = client.calls.at(-1);
  assert.deepEqual(release.values.slice(1), [true, null, true]);
  assert.ok(statements(client).some(text => text.includes("healthy_since = null, last_check_at = now()")));
});

test("a failed dispatch schedules a retry without removing work", async () => {
  const client = fakeClient({ events: [pageEvent] });
  const fetch = fakeFetch({ github: () => json({}, 401) });
  const env = { STACK127_FRONTEND_HOSTING: "cloudflare", GITHUB_FRONTEND_TOKEN: "frontend-token" };
  const result = await runCacheWorker(client, { env, fetchImplementation: fetch.fetchImplementation, log: quiet });
  assert.match(result.error, /HTTP 401/);
  assert.ok(statements(client).some(text => text.includes("attempts = event.attempts + 1")));
  assert.ok(!statements(client).some(text => text.startsWith("delete from")));
  assert.equal(client.calls.at(-1).values[1], false);
});

test("a delayed queue opens one GitHub issue and recovery closes it", async () => {
  const delayed = fakeClient({ queue: { pending: 3, minutes: 7 } });
  const fetch = fakeFetch();
  await runCacheWorker(delayed, { env: legacyEnv, fetchImplementation: fetch.fetchImplementation, log: quiet });
  const issue = fetch.calls.find(call => call.url.endsWith("/repos/stack127labs/stack127/issues"));
  assert.equal(issue.init.method, "POST");
  assert.equal(issue.init.headers.Authorization, "Bearer alert-token");
  assert.match(JSON.parse(issue.init.body).body, /3 site changes have been waiting for 7 minutes/);
  const stored = delayed.calls.find(call => call.text.includes("set alert_issue_number = $1"));
  assert.deepEqual(stored.values, [42]);

  const recovered = fakeClient({ alertIssue: 42 });
  const closing = fakeFetch();
  await runCacheWorker(recovered, { env: legacyEnv, fetchImplementation: closing.fetchImplementation, log: quiet });
  const github = closing.calls.filter(call => call.url.includes("api.github.com"));
  assert.deepEqual(github.map(call => [call.init.method, new URL(call.url).pathname]), [
    ["POST", "/repos/stack127labs/stack127/issues/42/comments"],
    ["PATCH", "/repos/stack127labs/stack127/issues/42"],
  ]);
  assert.deepEqual(JSON.parse(github[1].init.body), { state: "closed" });
  assert.ok(statements(recovered).some(text => text.includes("set alert_issue_number = null")));

  // Below the five-minute limit, nothing is opened.
  const fresh = fakeClient({ queue: { pending: 3, minutes: 4 } });
  const silent = fakeFetch();
  await runCacheWorker(fresh, { env: legacyEnv, fetchImplementation: silent.fetchImplementation, log: quiet });
  assert.ok(!silent.calls.some(call => call.url.includes("api.github.com")));
});

test("the 15-minute reconcile recovers missed updates and marks the observation", async () => {
  const stale = fakeClient({ lastReconcileAt: new Date(Date.now() - 20 * 60_000).toISOString(), recovered: 1 });
  await runCacheWorker(stale, { env: legacyEnv, fetchImplementation: fakeFetch().fetchImplementation, log: quiet });
  assert.ok(statements(stale).some(text => text.includes("stack127_enqueue_revalidation(changes.entity_type")));
  assert.ok(statements(stale).some(text => text.includes("recovered an update missing from the queue")));
  assert.ok(statements(stale).some(text => text.includes("set last_reconcile_at = now()")));

  const recent = fakeClient({ lastReconcileAt: new Date().toISOString(), recovered: 1 });
  await runCacheWorker(recent, { env: legacyEnv, fetchImplementation: fakeFetch().fetchImplementation, log: quiet });
  assert.ok(!statements(recent).some(text => text.includes("stack127_enqueue_revalidation(changes.entity_type")));
});

test("settings follow the Edge Function defaults", () => {
  const legacy = workerSettings({});
  assert.equal(legacy.hosting, "legacy");
  assert.equal(legacy.alertAfterMinutes, 5);
  assert.equal(legacy.siteUrl, "https://stack127.com");
  const cloudflare = workerSettings({ STACK127_FRONTEND_HOSTING: "cloudflare", STACK127_SITE_URL: "https://stack127.com/" });
  assert.equal(cloudflare.alertAfterMinutes, 30);
  assert.equal(cloudflare.siteUrl, "https://stack127.com");
});
