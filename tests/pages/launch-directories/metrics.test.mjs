import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ahrefsRequester, applyMetricPatches, collectMetrics, latestTranco, metricDomain, metricsConnection,
  parseDomainRating, parseTrancoCsv, retryDelay, trafficBucket } from "../../../scripts/launch-directories/refresh-metrics.mjs";
import { factsArgs } from "../../../scripts/launch-directories/import-facts.mjs";

const checkedOn = "2026-10-21";
const record = (slug = "example") => ({ slug, website_url: `https://${slug}.com/submit`, updated_at: "2026-10-20T01:02:03.123456Z",
  domain_rating: 50, domain_rating_checked_on: checkedOn, traffic_bucket: "top_1k", traffic_checked_on: checkedOn });
const rating = value => new Response(JSON.stringify({ domain_rating: { domain_rating: value, license: "https://ahrefs.com/legal/domain-rating-license" } }));

test("Ahrefs nested DR handles zero and rounds its float to the existing whole-number column", () => {
  for (const value of [0, 25, 75.4, 99.9, 100]) assert.equal(parseDomainRating({ domain_rating: { domain_rating: value } }), Math.round(value));
  for (const value of [null, -1, 101, "50", NaN, Infinity]) assert.throws(() => parseDomainRating({ domain_rating: { domain_rating: value } }));
  for (const body of [null, {}, { domain_rating: 50 }]) assert.throws(() => parseDomainRating(body));
});

test("domains and popularity buckets match the reviewed importer", () => {
  assert.equal(metricDomain("https://www.example.co.uk/submit"), "example.co.uk");
  assert.equal(metricDomain("https://thing.github.io/"), "github.io");
  assert.throws(() => metricDomain("https://127.0.0.1/"));
  assert.throws(() => metricDomain("https://user:pass@example.com/"));
  assert.deepEqual([1, 1000, 1001, 10000, 10001, 100000, 100001, 1000000, 1000001, null].map(trafficBucket),
    ["top_1k", "top_1k", "top_10k", "top_10k", "top_100k", "top_100k", "top_1m", "top_1m", "below_1m", "below_1m"]);
  assert.throws(() => trafficBucket(0));
});

test("Tranco accepts only a complete ordered list before deciding a domain is absent", () => {
  const wanted = new Set(["a.com", "b.com", "absent.com"]);
  assert.deepEqual([...parseTrancoCsv("1,a.com\r\n2,b.com\r\n3,c.com\r\n", wanted, 3)], [["a.com", 1], ["b.com", 2]]);
  assert.deepEqual([...parseTrancoCsv("1,a.com\n2,_wildcard_.ph\n3,b.com\n", wanted, 3)], [["a.com", 1], ["b.com", 3]]);
  for (const csv of ["1,a.com\n2,b.com", "1,a.com\n3,b.com\n4,c.com", "1,a.com\n2,a.com\n3,c.com", "<html>failure</html>", "1,a..com\n2,b.com\n3,c.com"]) {
    assert.throws(() => parseTrancoCsv(csv, wanted, 3));
  }
});

test("Tranco pins the latest immutable list ID and refuses unavailable metadata", async () => {
  const urls = [];
  await assert.rejects(latestTranco(new Set(), { fetchImplementation: async url => {
    urls.push(url);
    return urls.length === 1 ? new Response(JSON.stringify({ available: true, list_id: "ABC12", failed: false })) : new Response("1,a.com\n");
  } }), /1000000/);
  assert.equal(urls[1], "https://tranco-list.eu/download/ABC12/1000000");
  await assert.rejects(latestTranco(new Set(), { fetchImplementation: async () => new Response(JSON.stringify({ available: false, list_id: "ABC" })) }), /unavailable/);
});

test("Ahrefs requests are sequential, paced, authenticated, and use dr3", async () => {
  let time = 100;
  const times = [], waits = [];
  const request = ahrefsRequester({ apiKey: "test-only", now: () => time,
    sleepImplementation: async ms => { waits.push(ms); time += ms; },
    fetchImplementation: async (url, init) => {
      times.push(time);
      assert.equal(url.searchParams.get("version"), "dr3");
      assert.equal(url.searchParams.get("target"), times.length === 1 ? "a.com" : "b.com");
      assert.equal(init.headers.Authorization, "Bearer test-only");
      return rating(50);
    } });
  assert.deepEqual(await request("a.com"), { value: 50 });
  assert.deepEqual(await request("b.com"), { value: 50 });
  assert.deepEqual(times, [100, 3100]);
  assert.deepEqual(waits, [3000]);
});

test("429 retries honor Retry-After, back off, then stop without calling another domain", async () => {
  let time = 0, calls = 0;
  const waits = [];
  const request = ahrefsRequester({ apiKey: "test-only", now: () => time,
    sleepImplementation: async ms => { waits.push(ms); time += ms; },
    fetchImplementation: async () => { calls++; return new Response("limited", { status: 429, headers: { "Retry-After": "40" } }); } });
  assert.deepEqual(await request("a.com"), { stopped: "rate_limited" });
  assert.deepEqual(waits, [40000, 60000]);
  assert.equal(calls, 3);
  assert.deepEqual(await request("b.com"), { stopped: "rate_limited" });
  assert.equal(calls, 3);
  assert.equal(retryDelay("Wed, 21 Oct 2026 00:01:00 GMT", 0, Date.parse("2026-10-21T00:00:00Z")), 60000);
  assert.equal(retryDelay("bad", 1), 60000);
});

test("a long rate limit or auth failure stops immediately; a successful retry recovers", async () => {
  for (const response of [new Response("", { status: 429, headers: { "Retry-After": "3600" } }), new Response("", { status: 401 })]) {
    let calls = 0;
    const request = ahrefsRequester({ apiKey: "test-only", fetchImplementation: async () => { calls++; return response; }, sleepImplementation: async () => assert.fail("must not sleep") });
    assert.ok((await request("a.com")).stopped);
    await request("b.com");
    assert.equal(calls, 1);
  }
  let calls = 0, time = 0;
  const request = ahrefsRequester({ apiKey: "test-only", now: () => time, sleepImplementation: async ms => { time += ms; },
    fetchImplementation: async () => ++calls === 1 ? new Response("", { status: 429 }) : rating(50) });
  assert.deepEqual(await request("a.com"), { value: 50 });
});

test("same-day unchanged checks issue no UPDATE; later checks write only their dates", async () => {
  const options = { checkedOn, requestRating: async () => ({ value: 50 }), loadTranco: async () => ({ list_id: "ABC", ranks: new Map([["example.com", 100]]) }) };
  const unchanged = await collectMetrics([record()], options);
  assert.equal(unchanged.unchanged, 1);
  assert.deepEqual(unchanged.patches, []);
  assert.deepEqual(await applyMetricPatches({ query: () => assert.fail("no SQL on no-change path") }, unchanged.patches), { changed: 0, conflicts: [] });
  const later = await collectMetrics([record()], { ...options, checkedOn: "2026-11-02" });
  assert.deepEqual(later.patches[0].changes, { domain_rating_checked_on: "2026-11-02", traffic_checked_on: "2026-11-02" });
});

test("failed lookups preserve each metric and date while other sources continue", async () => {
  const result = await collectMetrics([record()], { checkedOn: "2026-11-02", requestRating: async () => ({ error: "failed" }), loadTranco: async () => { throw new Error("failed"); } });
  assert.deepEqual(result.patches, []);
  assert.equal(result.failures.length, 2);
  let calls = 0;
  const stopped = await collectMetrics([record("a"), record("b")], { checkedOn: "2026-11-02", requestRating: async () => { calls++; return { stopped: "rate_limited" }; }, loadTranco: async () => ({ ranks: new Map(), list_id: "ABC" }) });
  assert.equal(calls, 1);
  assert.equal(stopped.stopped, "rate_limited");
  assert.ok(stopped.patches.every(patch => patch.changes.traffic_bucket === "below_1m" && !Object.hasOwn(patch.changes, "domain_rating_checked_on")));
});

test("one invalid domain does not block other listings and shared domains use one DR lookup", async () => {
  let calls = 0;
  const result = await collectMetrics([{ ...record("bad"), website_url: "https://localhost" }, record(), { ...record("other"), website_url: "https://www.example.com/" }], {
    checkedOn, requestRating: async () => { calls++; return { value: 60 }; },
    loadTranco: async () => ({ list_id: "ABC", ranks: new Map([["example.com", 100]]) }),
  });
  assert.equal(calls, 1);
  assert.equal(result.failures[0].slug, "bad");
  assert.deepEqual(result.patches.map(patch => patch.slug), ["example", "other"]);
});

test("writes change only metrics and guard the exact original row version", async () => {
  const patches = [{ slug: "a", expected_updated_at: record().updated_at, changes: { domain_rating: 0 } }, { slug: "b", expected_updated_at: record().updated_at, changes: { traffic_bucket: "top_10k" } }];
  const client = { query: async (sql, values) => {
    assert.match(sql, /directory.updated_at=patch.expected_updated_at/);
    assert.deepEqual(JSON.parse(values[0]), patches);
    assert.match(sql, /directory.is_published/);
    assert.doesNotMatch(sql, /set checked_on|set updated_at/);
    return { rowCount: 1, rows: [{ slug: "a" }] };
  } };
  assert.deepEqual(await applyMetricPatches(client, patches), { changed: 1, conflicts: ["b"] });
  await assert.rejects(applyMetricPatches(client, [{ changes: { cost_label: "wrong" } }]), /Only metric/);
});

test("production requires explicit confirmation, and OVH env is limited to its two keys", () => {
  assert.equal(factsArgs([]).apply, undefined);
  assert.throws(() => factsArgs(["--environment", "production"]), /confirm/);
  assert.equal(factsArgs(["--environment", "production", "--confirm", "stack127-production"]).environment, "production");
  const directory = mkdtempSync(join(tmpdir(), "launch-metrics-env-"));
  const file = join(directory, "job.env");
  const args = { environment: "production", confirm: "stack127-production", "env-file": file };
  try {
    writeFileSync(file, 'DATABASE_URL="postgresql://stack127_app:test@127.0.0.1:5432/postgres?sslmode=disable"\nAHREFS_API_KEY="test-only"\n');
    assert.match(metricsConnection(args), /127.0.0.1/);
    assert.throws(() => metricsConnection({ ...args, environment: "development" }), /only for/);
    assert.throws(() => metricsConnection({ ...args, confirm: undefined }), /confirm/);
    writeFileSync(file, 'DATABASE_URL="postgresql://postgres:test@database.stack127.com:5432/postgres?sslmode=verify-full"\n');
    assert.throws(() => metricsConnection(args), /Unexpected/);
    writeFileSync(file, 'DATABASE_URL="postgresql://stack127_app:test@127.0.0.1:5432/postgres"\nOTHER_SECRET="no"\n');
    assert.throws(() => metricsConnection(args), /only DATABASE_URL/);
  } finally { rmSync(directory, { recursive: true }); }
});

test("development metric writes move source revisions, child dates, and events while preserving editorial facts", { skip: process.env.STACK127_TEST_DEVELOPMENT_DATABASE !== "1" }, async () => {
  const { default: pg } = await import("pg");
  const { resolveDatabaseUrl } = await import("../../../scripts/stack127/tool-pages/lib.mjs");
  const { LAUNCH_DIRECTORY_REVISION_SQL } = await import("../../../lib/launch-directories-data.ts");
  const pool = new pg.Pool({ connectionString: resolveDatabaseUrl({ environment: "development" }), max: 1, connectionTimeoutMillis: 15000 });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const row = (await client.query("select to_jsonb(directory) record from public.launch_directories directory where is_published order by slug limit 1 for update")).rows[0].record;
    const beforeRevision = (await client.query(LAUNCH_DIRECTORY_REVISION_SQL)).rows[0].fingerprint;
    const childSlugs = [`launch-directories/${row.slug}`, "launch-directories/compare"];
    const beforeDates = (await client.query("select slug,updated_at::text from public.stack127_pages where slug=any($1::text[]) order by slug", [childSlugs])).rows;
    const patch = { slug: row.slug, expected_updated_at: row.updated_at, changes: { domain_rating: row.domain_rating === 0 ? 1 : 0, domain_rating_checked_on: checkedOn } };
    assert.deepEqual(await applyMetricPatches(client, [patch]), { changed: 1, conflicts: [] });
    const after = (await client.query("select to_jsonb(directory) record from public.launch_directories directory where slug=$1", [row.slug])).rows[0].record;
    for (const key of ["cost_label", "summary", "evidence", "checked_on", "sources", "research_notes", "traffic_bucket"]) assert.deepEqual(after[key], row[key]);
    assert.notEqual((await client.query(LAUNCH_DIRECTORY_REVISION_SQL)).rows[0].fingerprint, beforeRevision);
    const dates = (await client.query("select slug,updated_at::text from public.stack127_pages where slug=any($1::text[]) order by slug", [childSlugs])).rows;
    assert.equal(dates.length, 2);
    assert.ok(dates.every((page, index) => page.updated_at !== beforeDates[index].updated_at));
    const events = (await client.query("select slug from public.stack127_revalidation_events where entity_type='page' and slug=any($1::text[])", [childSlugs])).rows;
    assert.equal(events.length, 2);
    const stale = { ...patch, changes: { domain_rating: 99 } };
    assert.deepEqual(await applyMetricPatches(client, [stale]), { changed: 0, conflicts: [row.slug] });
    assert.deepEqual((await client.query("select to_jsonb(directory) record from public.launch_directories directory where slug=$1", [row.slug])).rows[0].record, after);
  } finally { await client.query("rollback"); client.release(); await pool.end(); }
});
