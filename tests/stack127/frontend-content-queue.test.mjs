import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createHmac } from "node:crypto";
import ts from "typescript";
import { targetsForEvents } from "../../scripts/stack127/cache/targets.mjs";
import { cacheBodyDigest } from "../../scripts/stack127/cache/refresh.mjs";
import {
  acknowledgeSnapshot, checkCurrentRelease, completeRefresh, contentQueueMain, dispatchFrontendRefresh,
  exportProofs, frontendLatencyMinutes, frontendStatus, refreshApiRecords, refreshCommittedContent,
  retrySnapshot, snapshotQueue, verifyPublicAssets, verifyResourcePlannerQueries,
} from "../../scripts/stack127/frontend/content-queue.mjs";

const sha = "a".repeat(40);
const revision = "2026-10-05T10:00:00.123Z";
const event = { id: "9007199254740993", entity_type: "page", slug: "about", created_at: "2026-10-05 10:00:00.123456+00", fingerprint: "b".repeat(32) };
const json = (body, status = 200) => Response.json(body, { status });
const pages = ["", "about"].map(slug => ({ slug, is_published: true, page_family: "site", has_content: true, revision }));
const snapshot = (events = [event]) => ({ schema_version: 1, sha, captured_at: revision, build_required: true, events, pages, targets: targetsForEvents(events), launch_revision: "c".repeat(32) });

test("dispatch coalesces a queued, running, or approval-waiting refresh", async () => {
  for (const busy of ["queued", "in_progress", "waiting", "requested", "pending"]) {
    const calls = [];
    const result = await dispatchFrontendRefresh({ token: "scoped-token", fetchImplementation: async (url, init) => {
      calls.push({ url, init });
      const active = new URL(url).searchParams.get("status") === busy;
      return json({ total_count: active ? 1 : 0, workflow_runs: active ? [{ id: 1, status: busy }] : [] });
    } });
    assert.deepEqual(result, { dispatched: false, active: true });
    assert.equal(calls.length, 5);
    assert(calls.every(call => !call.init.method && new URL(call.url).searchParams.get("branch") === "main"));
  }
});

test("dispatch targets main once with the separate frontend token", async () => {
  const calls = [];
  const result = await dispatchFrontendRefresh({ token: "frontend-only", fetchImplementation: async (url, init) => {
    calls.push({ url, init });
    return init.method === "POST" ? new Response(null, { status: 204 }) : json({ total_count: 0, workflow_runs: [] });
  } });
  assert.equal(result.dispatched, true);
  const posts = calls.filter(call => call.init.method === "POST");
  assert.equal(posts.length, 1);
  assert.deepEqual(JSON.parse(posts[0].init.body), { ref: "main", inputs: { force: "false", dry_run: "false" } });
  assert.equal(posts[0].init.headers.Authorization, "Bearer frontend-only");
});

test("dispatch failures and invalid run lists stop without dispatch or acknowledgement", async () => {
  for (const response of [() => json({}, 401), () => json({ workflow_runs: [] })]) {
    let posted = false;
    await assert.rejects(dispatchFrontendRefresh({ token: "bad", fetchImplementation: async (_url, init) => {
      posted ||= init.method === "POST";
      return response();
    } }));
    assert.equal(posted, false);
  }
  await assert.rejects(dispatchFrontendRefresh({ token: "scoped", fetchImplementation: async (_url, init) =>
    init.method === "POST" ? json({}, 422) : json({ total_count: 0, workflow_runs: [] }) }), /HTTP 422/);
});

test("dispatch dry run requires no token and makes no external request", async () => {
  assert.deepEqual(await dispatchFrontendRefresh({ dryRun: true, fetchImplementation: () => assert.fail("Unexpected request") }), { dispatched: false, dryRun: true });
});

test("release checks reject stale main and a different backend revision", async () => {
  for (const [mainSha, backendSha, expected] of [["d".repeat(40), sha, /current main/], [sha, "d".repeat(40), /live backend/]]) {
    await assert.rejects(checkCurrentRelease({ sha, token: "read", fetchImplementation: async url =>
      url.includes("api.github.com") ? json({ object: { sha: mainSha } }) : json({ ok: true, build: { sha: backendSha } }) }), expected);
  }
});

function captureClient(events = [event]) {
  const calls = [];
  return { calls, async query(text, values) {
    calls.push({ text, values });
    if (text.includes("select id::text")) return { rows: events };
    if (text.includes("stack127_cache_source_revisions")) return { rows: events.map(item => ({ entity_type: item.entity_type, slug: item.slug, fingerprint: item.fingerprint })) };
    if (text.includes("from public.stack127_pages page")) return { rows: pages.map(page => ({ ...page, row_updated_at: new Date(revision) })) };
    if (text.includes("from public.launch_directories")) return { rows: [{ fingerprint: "c".repeat(32) }] };
    return { rows: [] };
  } };
}

test("snapshot reads event versions and fingerprints in one read-only transaction", async () => {
  const client = captureClient();
  const result = await snapshotQueue(client, { sha, now: () => new Date(revision) });
  assert.match(client.calls[0].text, /repeatable read read only/);
  assert.equal(client.calls.at(-1).text, "commit");
  assert.equal(result.events[0].id, event.id);
  assert.equal(result.events[0].created_at, event.created_at);
  assert.equal(result.events[0].fingerprint, event.fingerprint);
  assert.deepEqual(client.calls.find(call => call.text.includes("select id::text")).values, [false]);
  assert.equal(result.build_required, true);
  assert(client.calls.every(call => !/update |delete |insert /i.test(call.text)));
});

test("empty queues skip a build, while manual recovery captures delayed work", async () => {
  assert.equal((await snapshotQueue(captureClient([]), { sha })).build_required, false);
  assert.equal((await snapshotQueue(captureClient([]), { sha, force: true })).build_required, true);
  const client = captureClient();
  assert.equal((await snapshotQueue(client, { sha, force: true })).events.length, 1);
  assert.deepEqual(client.calls.find(call => call.text.includes("select id::text")).values, [true]);
});

test("large app edits share catalog targets and keep every captured fingerprint", async () => {
  const events = Array.from({ length: 30 }, (_, index) => ({ ...event, id: String(index + 1), entity_type: "self_host_app", slug: `app-${index}` }));
  const result = await snapshotQueue(captureClient(events), { sha });
  assert.equal(result.events.length, 30);
  assert(result.events.every(item => item.fingerprint === event.fingerprint));
  assert(result.targets.nextTags.includes("stack127-self-host-apps"));
  assert(result.targets.edgeTags.includes("self-host-detail"));
  assert.equal(result.targets.paths.filter(value => value.startsWith("/api/self-host-apps/app-")).length, 0);
});

// Model only the queue transaction. Assert the SQL's version predicates too so
// driver rounding or a later unconditional delete cannot bypass this scenario.
function ackClient(currentEvent = event, fingerprint = event.fingerprint, fail = false) {
  const calls = [];
  let queued = currentEvent;
  let done = null;
  return { calls, get queued() { return queued; }, get done() { return done; }, async query(text, values) {
    calls.push({ text, values });
    if (!text.startsWith("with captured")) return { rows: [] };
    assert.match(text, /event\.created_at = captured\.created_at::timestamptz/);
    assert.match(text, /event\.id = captured\.id::bigint/);
    assert.match(text, /captured\.fingerprint = coalesce/);
    assert.match(text, /from captured join removed using/);
    if (fail) throw new Error("Fingerprint write failed");
    const captured = JSON.parse(values[0])[0];
    assert.equal(captured.created_at, event.created_at);
    const matches = queued && queued.id === captured.id && queued.created_at === captured.created_at && fingerprint === captured.fingerprint;
    if (matches) { queued = null; done = captured.fingerprint; }
    return { rowCount: matches ? 1 : 0 };
  } };
}

test("acknowledgement preserves a newer edit one microsecond after capture", async () => {
  const client = ackClient({ ...event, created_at: "2026-10-05 10:00:00.123457+00" });
  assert.deepEqual(await acknowledgeSnapshot(client, snapshot()), { acknowledged: 0, captured: 1 });
  assert.equal(client.queued.created_at, "2026-10-05 10:00:00.123457+00");
  assert.equal(client.done, null);
});

test("changed source fingerprints remain queued even if a trigger missed the edit", async () => {
  const client = ackClient(event, "e".repeat(32));
  assert.equal((await acknowledgeSnapshot(client, snapshot())).acknowledged, 0);
  assert.equal(client.queued.id, event.id);
  assert.equal(client.done, null);
});

test("acknowledgement writes the captured fingerprint in the queue deletion transaction", async () => {
  const client = ackClient();
  assert.equal((await acknowledgeSnapshot(client, snapshot())).acknowledged, 1);
  assert.equal(client.queued, null);
  assert.equal(client.done, event.fingerprint);
  assert.equal(client.calls[0].text, "begin");
  assert.equal(client.calls.at(-1).text, "commit");
  assert(client.calls.every(call => !call.text.includes("last_success_at")));
  const failed = ackClient(event, event.fingerprint, true);
  await assert.rejects(acknowledgeSnapshot(failed, snapshot()), /Fingerprint write failed/);
  assert.equal(failed.calls.at(-1).text, "rollback");
  assert.equal(failed.queued.id, event.id);
});

test("retry updates only captured versions and never acknowledges them", async () => {
  const calls = [];
  await retrySnapshot({ query: async (text, values) => { calls.push({ text, values }); } }, snapshot(), "Build failed");
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /event\.created_at = captured\.created_at::timestamptz/);
  assert.equal(JSON.parse(calls[0].values[0])[0].created_at, event.created_at);
  assert.equal(calls[0].values[1], "Build failed");
  assert.doesNotMatch(calls[0].text, /delete /i);
});

async function fixture() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "stack127-frontend-queue-"));
  const bodies = new Map([
    ["/", `<html><meta name="stack127-content-revision" content="${revision}"><main>Home</main></html>`],
    ["/about", `<html><meta name="stack127-content-revision" content="${revision}"><main>About</main></html>`],
    ["/robots.txt", "User-agent: *\nSitemap: https://stack127.com/sitemap.xml\n"],
    ["/sitemap.xml", "<urlset><url><loc>https://stack127.com/about</loc></url></urlset>"],
    ["/frontend-release.json", JSON.stringify({ sha })],
  ]);
  for (const [pathname, body] of bodies) {
    const file = pathname === "/" ? "index.html" : pathname.includes(".") ? pathname.slice(1) : `${pathname.slice(1)}.html`;
    await writeFile(path.join(directory, file), body);
  }
  await writeFile(path.join(directory, "404.html"), "<main>Page not found</main>");
  const fetchImplementation = async url => {
    if (url.includes("api.github.com")) return json({ object: { sha } });
    const pathname = new URL(url).pathname;
    if (pathname === "/api/health") return json({ ok: true, build: { sha } });
    return new Response(bodies.get(pathname) ?? "<main>Page not found</main>", { status: bodies.has(pathname) ? 200 : 404, headers: { "X-Stack127-Frontend-SHA": sha } });
  };
  return { directory, bodies, fetchImplementation, close: () => rm(directory, { recursive: true, force: true }) };
}

test("public verification catches stale content from an earlier build of the same commit", async () => {
  const files = await fixture();
  try {
    assert.equal((await verifyPublicAssets(snapshot(), files.directory, files)).length, 5);
    files.bodies.set("/about", "<main>Earlier content from the same SHA</main>");
    await assert.rejects(verifyPublicAssets(snapshot(), files.directory, files), /differs from the deployed export/);
    await writeFile(path.join(files.directory, "about.html"), `<meta name="stack127-content-revision" content="2026-10-04T00:00:00.000Z">`);
    await assert.rejects(exportProofs(snapshot(), files.directory), /content revision differs/);
  } finally { await files.close(); }
});

test("deleted pages require the exported 404 rather than an old static page", async () => {
  const files = await fixture();
  const captured = snapshot([{ ...event, slug: "removed", fingerprint: "deleted" }]);
  try {
    const proofs = await verifyPublicAssets(captured, files.directory, files);
    assert.equal(proofs.find(proof => proof.path === "/removed").status, 404);
    await writeFile(path.join(files.directory, "removed.html"), "<main>Old page</main>");
    await assert.rejects(exportProofs(captured, files.directory), /unpublished/);
  } finally { await files.close(); }
});

async function apiOptions(stale = false) {
  const body = JSON.stringify([{ slug: "updated-cli" }]);
  const digest = await cacheBodyDigest(body);
  const calls = [];
  return { calls, zone: "zone", cloudflareToken: "purge-only", token: "read-main", fetchImplementation: async (url, init) => {
    const pathname = new URL(url).pathname;
    calls.push(pathname);
    if (pathname === "/api/cache/revalidate") {
      assert.deepEqual(JSON.parse(init.body).paths, ["/api/cli-apps/index"]);
      assert.equal(init.headers.Authorization, `Bearer ${createHmac("sha256", "cache-key").update("stack127-cache-revalidation-v1").digest("hex")}`);
      return json({ ok: true });
    }
    if (pathname === "/api/cache/refresh") return json({ verified: [{ path: "/api/cli-apps/index", status: 200, digest }] });
    if (pathname.endsWith("/purge_cache")) return json({ success: true });
    if (pathname === "/api/cli-apps/index") return new Response(stale ? "[]" : body);
    throw new Error(`Unexpected request ${url}`);
  } };
}

test("retained APIs invalidate, verify origin data, purge, then verify public bytes", async () => {
  const captured = snapshot([{ ...event, entity_type: "cli_apps", slug: "cli-apps" }]);
  const options = await apiOptions();
  await refreshApiRecords(captured, "cache-key", options);
  assert.deepEqual(options.calls, ["/api/cache/revalidate", "/api/cache/refresh", "/client/v4/zones/zone/purge_cache", "/api/cli-apps/index"]);
  await assert.rejects(refreshApiRecords(captured, "cache-key", await apiOptions(true)), /Public API content is stale/);
});

test("a large page edit batch invalidates every tag without exceeding the backend limit", async () => {
  const events = Array.from({ length: 50 }, (_, index) => ({ ...event, id: String(index + 1), slug: `page-${index}` }));
  const captured = snapshot(events);
  assert(captured.targets.nextTags.length > 200);
  const batches = [];
  await refreshApiRecords(captured, "cache-key", {
    zone: "zone", cloudflareToken: "token",
    fetchImplementation: async (url, init) => {
      if (new URL(url).pathname === "/api/cache/revalidate") {
        const body = JSON.parse(init.body);
        if (body.paths.length > 200 || body.tags.length > 200) return json({ error: "Invalid targets" }, 400);
        batches.push(body);
        return json({ ok: true });
      }
      if (url.includes("purge_cache")) return json({ success: true });
      throw new Error(`Unexpected request: ${url}`);
    },
  });
  assert.equal(batches.length, 2);
  assert.deepEqual(batches.flatMap(batch => batch.tags), captured.targets.nextTags);
});

test("completion never acknowledges a deployment with stale retained APIs", async () => {
  const files = await fixture();
  const captured = snapshot([{ ...event, entity_type: "cli_apps", slug: "cli-apps" }]);
  captured.targets.verifyPaths = captured.targets.verifyPaths.filter(value => value.startsWith("/api/"));
  const options = await apiOptions(true);
  const queries = [];
  const client = { query: async text => { queries.push(text); return { rows: [{ signing_key: "cache-key" }] }; } };
  try {
    await assert.rejects(completeRefresh(client, captured, files.directory, { ...options,
      fetchImplementation: (url, init) => new URL(url).pathname.startsWith("/api/") && !url.includes("/api/health") || url.includes("purge_cache")
        ? options.fetchImplementation(url, init) : files.fetchImplementation(url, init),
    }), /Public API content is stale/);
    assert(queries.every(text => !/delete |insert |update /i.test(text)));
  } finally { await files.close(); }
});

test("completion waits for static and API proofs before the acknowledgement transaction", async () => {
  const files = await fixture();
  const captured = snapshot([{ ...event, entity_type: "cli_apps", slug: "cli-apps" }]);
  captured.targets.verifyPaths = captured.targets.verifyPaths.filter(value => value.startsWith("/api/"));
  const options = await apiOptions();
  const client = ackClient(captured.events[0]);
  const query = client.query.bind(client);
  client.query = async (text, values) => {
    if (text.includes("signing_key")) return { rows: [{ signing_key: "cache-key" }] };
    if (text === "begin") assert.equal(options.calls.at(-1), "/api/cli-apps/index");
    return await query(text, values);
  };
  try {
    assert.equal((await completeRefresh(client, captured, files.directory, { ...options,
      fetchImplementation: (url, init) => new URL(url).pathname.startsWith("/api/") && !url.includes("/api/health") || url.includes("purge_cache")
        ? options.fetchImplementation(url, init) : files.fetchImplementation(url, init),
    })).acknowledged, 1);
    const recorded = client.calls.findIndex(call => call.text.includes("last_success_at=now()"));
    assert(recorded > 0 && recorded < client.calls.length - 1);
    assert(client.calls.some(call => call.text.includes("healthy_since=null")));
  } finally { await files.close(); }
});

test("a verified forced build with no captured events still records actual completion", async () => {
  const files = await fixture();
  const captured = { ...snapshot([]), force: true };
  const calls = [];
  const client = { async query(text) {
    calls.push(text);
    return text.includes("signing_key") ? { rows: [{ signing_key: "cache-key" }] } : { rows: [] };
  } };
  try {
    assert.equal((await completeRefresh(client, captured, files.directory, { token: "read", fetchImplementation: async (url, init) =>
      url.endsWith("/api/cache/revalidate") ? json({ ok: true }) : files.fetchImplementation(url, init),
    })).acknowledged, 0);
    assert(calls.some(text => text.includes("last_success_at=now()")));
    assert(calls.indexOf("begin") < calls.findIndex(text => text.includes("last_success_at=now()")));
    assert.equal(calls.at(-1), "commit");
  } finally { await files.close(); }
});

test("Cloudflare status reports a 30-minute queue target and excludes legacy reliability gates", async () => {
  const calls = [];
  const result = await frontendStatus({ query: async (text, values) => {
    calls.push({ text, values });
    return { rows: [{ pending: 2, delayed: false, last_success_at: revision }] };
  } });
  assert.equal(frontendLatencyMinutes, 30);
  assert.deepEqual(calls[0].values, [30]);
  assert.equal(result.latency_target_minutes, 30);
  assert.equal(result.last_success_at, revision);
  assert.equal(result.legacy_reliability_applicable, false);
  assert.equal(result.github_schedule_can_retire, false);
  assert.equal(result.longer_ttl_ready, false);
  assert(calls.every(call => !/update |delete |insert /i.test(call.text)));
});

function plannerClient({ published = true, stale = false } = {}) {
  const calls = [];
  const requested = [];
  const rows = [{ slug: "changed_app", name: "Changed app", has_ram: true, has_storage: false }];
  return { calls, requested, async query(text, values) {
    calls.push({ text, values });
    if (text.startsWith("select is_published")) return { rows: [{ is_published: published }] };
    if (text.startsWith("select slug from")) return { rows: [{ slug: "changed_app" }] };
    if (text.includes("ram_estimate_min_mb")) {
      assert(text.includes("self_hosting_status='self_hostable'"));
      assert(text.includes("order by app.name asc, app.slug asc limit 50"));
      return { rows: values[0] === "%changed\\_app%" ? rows : [] };
    }
    throw new Error(`Unexpected query ${text}`);
  }, fetchImplementation: async url => {
    const query = new URL(url).searchParams.get("q");
    requested.push(query);
    if (!published) return json({ error: "Tool not found." }, 404);
    return json(query === "changed_app" ? [{ slug: "changed_app", name: "Changed app", hasRam: !stale, hasStorage: false }] : []);
  } };
}

function plannerSnapshot() {
  const captured = snapshot([{ ...event, entity_type: "self_host_app", slug: "changed_app" }]);
  captured.targets.verifyPaths = [];
  return captured;
}

test("resource planner query proof checks current flags, literal search, and empty results", async () => {
  const client = plannerClient();
  const proofs = await verifyResourcePlannerQueries(client, plannerSnapshot(), client);
  assert.equal(proofs.length, 2);
  assert(client.requested.includes("changed_app"));
  assert(client.requested.includes(`__stack127_missing_${sha.slice(0, 12)}__`));
  assert(client.calls.some(call => call.values?.[0] === "%changed\\_app%"));
  assert(client.calls.every(call => !/update |delete |insert /i.test(call.text)));
  const stale = plannerClient({ stale: true });
  await assert.rejects(verifyResourcePlannerQueries(stale, plannerSnapshot(), stale), /query is stale/);
});

test("resource planner query proof requires a public 404 after unpublishing", async () => {
  const client = plannerClient({ published: false });
  assert((await verifyResourcePlannerQueries(client, plannerSnapshot(), client)).every(proof => proof.status === 404));
  await assert.rejects(verifyResourcePlannerQueries(client, plannerSnapshot(), { fetchImplementation: async () => json([]) }), /query failed/);
});

test("stale resource planner queries block both acknowledgement and the success timestamp", async () => {
  const files = await fixture();
  const planner = plannerClient({ stale: true });
  const calls = [];
  const client = { async query(text, values) {
    calls.push(text);
    if (text.includes("signing_key")) return { rows: [{ signing_key: "cache-key" }] };
    return await planner.query(text, values);
  } };
  const order = [];
  try {
    await assert.rejects(completeRefresh(client, plannerSnapshot(), files.directory, { token: "read", zone: "zone", cloudflareToken: "purge",
      fetchImplementation: async (url, init) => {
        if (url.endsWith("/api/cache/revalidate")) { order.push("invalidate"); return json({ ok: true }); }
        if (url.includes("purge_cache")) { order.push("purge"); return json({ success: true }); }
        if (url.includes("/api/resource-planner-index?")) { order.push("query"); return planner.fetchImplementation(url, init); }
        return files.fetchImplementation(url, init);
      },
    }), /query is stale/);
    assert.deepEqual(order.slice(0, 3), ["invalidate", "purge", "query"]);
    assert(calls.every(text => !/delete |insert |update /i.test(text)));
  } finally { await files.close(); }
});

test("dry completion, acknowledgement, and failure handling make no writes or requests", async () => {
  const client = { query: () => assert.fail("Unexpected database operation") };
  await completeRefresh(client, snapshot(), "/unused", { dryRun: true, fetchImplementation: () => assert.fail("Unexpected request") });
  await acknowledgeSnapshot(client, snapshot(), { dryRun: true });
  await retrySnapshot(client, snapshot(), "Ignored", { dryRun: true });
});

test("dry CLI completion and retry require no database or credentials", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "stack127-frontend-dry-"));
  const filename = path.join(directory, "snapshot.json");
  try {
    await writeFile(filename, JSON.stringify(snapshot()));
    const before = await readFile(filename, "utf8");
    await contentQueueMain(["complete", "--snapshot", filename, "--directory", "/unused", "--dry-run"], {});
    await contentQueueMain(["fail", "--snapshot", filename, "--dry-run"], {});
    assert.equal(await readFile(filename, "utf8"), before);
    await assert.rejects(contentQueueMain(["complete", "--snapshot", filename, "--directory", "/unused"], {}), /STACK127_FRONTEND_HOSTING=cloudflare/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("main advancing during API refresh prevents acknowledgement", async () => {
  const files = await fixture();
  const captured = snapshot([{ ...event, entity_type: "cli_apps", slug: "cli-apps" }]);
  captured.targets.verifyPaths = captured.targets.verifyPaths.filter(value => value.startsWith("/api/"));
  const options = await apiOptions();
  const queries = [];
  let checks = 0;
  try {
    await assert.rejects(completeRefresh({ query: async text => { queries.push(text); return { rows: [{ signing_key: "cache-key" }] }; } }, captured, files.directory, {
      ...options, fetchImplementation: (url, init) => {
        if (url.includes("api.github.com")) return json({ object: { sha: ++checks === 1 ? sha : "d".repeat(40) } });
        if ((new URL(url).pathname.startsWith("/api/") && !url.includes("/api/health")) || url.includes("purge_cache")) return options.fetchImplementation(url, init);
        return files.fetchImplementation(url, init);
      },
    }), /current main/);
    assert.equal(options.calls.at(-1), "/api/cli-apps/index");
    assert(queries.every(text => !/delete |insert |update /i.test(text)));
  } finally { await files.close(); }
});

test("the publishing callback is inactive by default and preserves failed captured edits", async () => {
  assert.deepEqual(await refreshCommittedContent(null, { hosting: "legacy" }), { skipped: true, hosting: "legacy" });
  const client = captureClient();
  const fetchImplementation = async url => url.includes("api.github.com") ? json({ object: { sha } }) : json({ ok: true, build: { sha } });
  await assert.rejects(refreshCommittedContent(client, { hosting: "cloudflare", sha, directory: "/unused", token: "read", fetchImplementation,
    buildDeploy: async captured => {
      assert.equal(client.calls.at(-1).text, "commit");
      assert.equal(captured.events[0].created_at, event.created_at);
      throw new Error("Build failed");
    },
  }), /Build failed/);
  const retry = client.calls.at(-1);
  assert.match(retry.text, /update public.stack127_revalidation_events/);
  assert.equal(JSON.parse(retry.values[0])[0].created_at, event.created_at);
});

test("the publishing callback dry run captures without building, deploying, or writing", async () => {
  const client = captureClient();
  const result = await refreshCommittedContent(client, { hosting: "cloudflare", sha, directory: "/unused", token: "read", dryRun: true,
    fetchImplementation: async url => url.includes("api.github.com") ? json({ object: { sha } }) : json({ ok: true, build: { sha } }),
    buildDeploy: () => assert.fail("Unexpected build or deploy"),
  });
  assert.equal(result.acknowledged, 0);
  assert.equal(result.captured, 1);
  assert(client.calls.every(call => !/update |delete |insert /i.test(call.text)));
});

// Exercise the real Edge Function entry point without a Supabase connection.
// Deno's environment, postgres, fetch, and waitUntil are the external boundaries.
async function runWorker(environment, githubStatus = 204, queueMinutes = 0) {
  const source = await readFile(new URL("../../supabase/functions/cache-worker/index.ts", import.meta.url), "utf8");
  const queries = [];
  const requests = [];
  const work = [];
  let handler;
  const original = { Deno: globalThis.Deno, EdgeRuntime: globalThis.EdgeRuntime, fetch: globalThis.fetch };
  globalThis.__frontendWorkerPostgres = () => function sql(strings, ...values) {
    const text = strings.join("?");
    queries.push({ text, values });
    if (text.includes("select signing_key")) return Promise.resolve([{ signing_key: "cache-key" }]);
    if (text.includes("returning 1")) return Promise.resolve([{ id: true }]);
    if (text.includes("last_reconcile_at")) return Promise.resolve([{ last_reconcile_at: new Date().toISOString() }]);
    if (text.includes("entity_type <> 'self_host_app'")) return Promise.resolve([event]);
    if (text.includes("count(*)::int as pending")) return Promise.resolve([{ pending: 1, minutes: queueMinutes }]);
    if (text.includes("alert_issue_number")) return Promise.resolve([{ alert_issue_number: null }]);
    return Promise.resolve([]);
  };
  globalThis.Deno = { env: { get: name => environment[name] }, serve: fn => { handler = fn; } };
  globalThis.EdgeRuntime = { waitUntil: promise => work.push(promise) };
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url, init });
    if (!url.includes("api.github.com")) return json({}, 503);
    if (url.endsWith("/issues") && init.method === "POST") return json({ number: 42 });
    return init.method === "POST" ? new Response(null, { status: githubStatus }) : json({ total_count: 0, workflow_runs: [] });
  };
  try {
    let compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
    compiled = compiled.replace('import postgres from "npm:postgres@3.4.7";', "const postgres = globalThis.__frontendWorkerPostgres;");
    compiled = compiled.replaceAll(/from "(\.\.[^"]+)"/g, (_match, relative) => `from "${new URL(relative, new URL("../../supabase/functions/cache-worker/index.ts", import.meta.url)).href}"`);
    await import(`data:text/javascript;base64,${Buffer.from(compiled + `\n// ${Math.random()}`).toString("base64")}`);
    const token = createHmac("sha256", "cache-key").update("stack127-cache-worker-v1").digest("hex");
    assert.equal((await handler(new Request("https://example.invalid/functions/v1/cache-worker", { method: "POST", headers: { Authorization: `Bearer ${token}` } }))).status, 202);
    await Promise.all(work);
    return { queries, requests };
  } finally {
    Object.assign(globalThis, original);
    delete globalThis.__frontendWorkerPostgres;
  }
}

test("the Edge Function dry run never leases or changes queue state", async () => {
  const result = await runWorker({ CACHE_WORKER_DRY_RUN: "1", STACK127_FRONTEND_HOSTING: "cloudflare" });
  assert.equal(result.requests.length, 0);
  assert(result.queries.every(query => !/update |delete |insert /i.test(query.text)));
});

test("Cloudflare worker dispatch success holds its lease and leaves the queue intact", async () => {
  const result = await runWorker({ STACK127_FRONTEND_HOSTING: "cloudflare", GITHUB_FRONTEND_TOKEN: "scoped" });
  assert.equal(result.requests.filter(request => request.init.method === "POST").length, 1);
  assert(result.requests.every(request => request.url.includes("api.github.com")));
  assert(result.queries.every(query => !/delete from public.stack127_revalidation_events|insert into public.stack127_cache_processed/.test(query.text)));
  const release = result.queries.findLast(query => query.text.includes("lease_id = null"));
  assert.equal(release.values[0], true);
  const observation = result.queries.find(query => query.text.includes("healthy_since = null") && query.text.includes("last_check_at = now()"));
  assert(observation);
  assert(!observation.text.includes("2 minutes"));
  assert(observation.values.includes(30));
  assert(result.queries.every(query => !query.text.includes("last_success_at=now()")));
});

test("Cloudflare queue alerts wait 30 minutes while legacy alerts still wait five", async () => {
  const environment = { STACK127_FRONTEND_HOSTING: "cloudflare", GITHUB_FRONTEND_TOKEN: "scoped", GITHUB_ALERT_TOKEN: "existing-alert-token" };
  const waiting = await runWorker(environment, 204, 29);
  assert(waiting.requests.every(request => !request.url.endsWith("/issues")));
  const late = await runWorker(environment, 204, 30);
  assert(late.requests.some(request => request.url.endsWith("/issues")));
  const legacy = await runWorker({ GITHUB_ALERT_TOKEN: "existing-alert-token" }, 204, 5);
  assert(legacy.requests.some(request => request.url.endsWith("/issues")));
});

test("Cloudflare worker dispatch errors retry the captured version without acknowledgement", async () => {
  const result = await runWorker({ STACK127_FRONTEND_HOSTING: "cloudflare", GITHUB_FRONTEND_TOKEN: "scoped" }, 401);
  assert(result.queries.some(query => query.text.includes("attempts = event.attempts + 1") && query.text.includes("event.created_at = done.created_at")));
  assert(result.queries.every(query => !/delete from public.stack127_revalidation_events|insert into public.stack127_cache_processed/.test(query.text)));
});

test("failed dispatches still open the overdue content alert", async () => {
  const result = await runWorker({
    STACK127_FRONTEND_HOSTING: "cloudflare", GITHUB_FRONTEND_TOKEN: "scoped", GITHUB_ALERT_TOKEN: "existing-alert-token",
  }, 401, 30);
  const alert = result.requests.find(request => request.url.endsWith("/issues") && request.init.method === "POST");
  assert(alert);
  assert.match(JSON.parse(alert.init.body).body, /HTTP 401/);
  assert(result.queries.every(query => !/delete from public.stack127_revalidation_events|insert into public.stack127_cache_processed/.test(query.text)));
});

test("without the hosting secret the Edge Function still calls legacy Next.js revalidation", async () => {
  const result = await runWorker({});
  assert(result.requests.some(request => request.url.endsWith("/api/cache/revalidate")));
  assert(result.requests.every(request => !request.url.includes("api.github.com")));
});
