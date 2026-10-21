import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateLaunchFacts, importLaunchFacts, developmentArgs } from "../../../scripts/launch-directories/import-facts.mjs";
import { parseLaunchPriceTiers, launchDirectoryNumber, LAUNCH_DIRECTORY_REVISION_SQL, LAUNCH_DIRECTORY_FACT_SELECT_SQL } from "../../../lib/launch-directories-data.ts";
import { launchMetaDescription, syncLaunchPages } from "../../../scripts/launch-directories/sync-pages.mjs";
import { targetsForEvents } from "../../../scripts/stack127/cache/targets.mjs";
import { launchDirectoryPageSlugs } from "../../../scripts/launch-directories/page-slugs.mjs";

const source_url = "https://example.com/pricing";
const checked_on = "2026-10-21";
const tier = () => ({ name: "Free", price_usd: 0, billing: null, gets: "Queue: 30 days to 5 months", link_type: "nofollow" });
const facts = () => ({
  slug: "uneed", domain_rating: { value: 63, checked_on, source_url },
  traffic: { bucket: "top_1m", rank: 412345, checked_on, source: "tranco:TEST_LIST" },
  listing_indexed: { value: false, checked_on, query: "site:example.com/listing" },
  review_wait: { label: "30 days to 5 months", min_days: 30, max_days: 150, source_url },
  lowest_paid_price_usd: { value: 14.99, source_url },
  price_tiers: { tiers: [tier()], source_url, checked_on },
});

test("reviewed JSON fixture maps only the new fact columns, including zero and false", () => {
  const directory = mkdtempSync(join(tmpdir(), "launch-facts-"));
  try {
    const file = join(directory, "reviewed.json");
    writeFileSync(file, JSON.stringify([facts()]));
    const [{ changes }] = validateLaunchFacts(JSON.parse(readFileSync(file, "utf8")), new Set(["uneed"]));
    assert.deepEqual(changes, {
      domain_rating: 63, domain_rating_checked_on: checked_on, traffic_bucket: "top_1m", traffic_checked_on: checked_on,
      listing_indexed: false, listing_indexed_checked_on: checked_on,
      review_wait_label: "30 days to 5 months", review_wait_min_days: 30, review_wait_max_days: 150,
      lowest_paid_price_usd: 14.99, price_tiers: [tier()],
    });
  } finally { rmSync(directory, { recursive: true }); }
});

test("null clears a fact and omitted facts do not enter its patch", () => {
  assert.deepEqual(validateLaunchFacts([{ slug: "uneed", domain_rating: null }])[0].changes,
    { domain_rating: null, domain_rating_checked_on: null });
  const allNull = Object.fromEntries(Object.keys(facts()).map(key => [key, key === "slug" ? "uneed" : null]));
  assert.ok(Object.values(validateLaunchFacts([allNull])[0].changes).every(value => value === null));
  assert.equal(validateLaunchFacts([{ slug: "uneed", lowest_paid_price_usd: { value: 99999999.39, source_url } }])[0].changes.lowest_paid_price_usd, 99999999.39);
  assert.equal(validateLaunchFacts([{ slug: "uneed", review_wait: { ...facts().review_wait, min_days: null, max_days: null } }])[0].changes.review_wait_min_days, null);
});

test("strict facts validation rejects unknown keys, missing keys, unsafe sources and bad values", () => {
  for (const mutate of [
    row => { row.extra = true; }, row => { row.slug = "bad/slug"; }, row => { row.evidence = {}; },
    row => { row.domain_rating.value = "63"; }, row => { row.domain_rating.value = 101; }, row => { row.domain_rating.value = 1.5; },
    row => { row.domain_rating.checked_on = "0000-01-01"; }, row => { row.domain_rating.checked_on = "2026-02-30"; }, row => { row.domain_rating.checked_on += "T00:00:00Z"; },
    row => { row.domain_rating.source_url = "https://user:password@example.com"; }, row => { row.domain_rating.source_url = "javascript:alert(1)"; },
    row => { row.domain_rating.extra = true; }, row => { delete row.domain_rating.checked_on; },
    row => { row.traffic.bucket = "top_5k"; }, row => { row.traffic.bucket = "top_1k"; }, row => { row.traffic.rank = 0; }, row => { row.traffic.source = "unverified"; },
    row => { row.listing_indexed.value = "false"; }, row => { row.listing_indexed.query = "example.com"; },
    row => { row.review_wait.min_days = -1; }, row => { row.review_wait.min_days = 151; }, row => { row.review_wait.label = "x".repeat(41); },
    row => { row.lowest_paid_price_usd.value = 0; }, row => { row.lowest_paid_price_usd.value = 2.999; }, row => { row.lowest_paid_price_usd.value = Infinity; },
    row => { row.price_tiers.tiers[0].price_usd = "0"; }, row => { row.price_tiers.tiers[0].billing = "daily"; },
    row => { row.price_tiers.tiers[0].extra = true; }, row => { delete row.price_tiers.tiers[0].gets; },
    row => { row.price_tiers.tiers[0].link_type = "follow"; }, row => { row.price_tiers.tiers = {}; },
  ]) {
    const row = facts(); mutate(row);
    assert.throws(() => validateLaunchFacts([row]), /facts|uneed/);
  }
  assert.throws(() => validateLaunchFacts([facts(), facts()]), /duplicate/);
  assert.throws(() => validateLaunchFacts([facts()], new Set()), /unknown slug uneed/);
  assert.throws(() => validateLaunchFacts([{ slug: "uneed" }]), /no facts/);
  assert.throws(() => validateLaunchFacts({ uneed: facts() }), /array/);
});

test("unknown slugs fail before updates, and an empty file writes nothing", async () => {
  const calls = [];
  const client = { query: async sql => { calls.push(sql); return { rows: [] }; } };
  await assert.rejects(importLaunchFacts(client, [facts()]), /unknown slug/);
  assert.equal(calls.length, 1);
  assert.ok(calls.every(sql => sql.startsWith("select")));
  calls.length = 0;
  assert.equal((await importLaunchFacts(client, [])).changed, 0);
  assert.equal(calls.length, 0);
});

test("facts commands default to a development dry run and refuse production and unknown flags", () => {
  assert.equal(developmentArgs([]).environment, "development");
  assert.equal(Boolean(developmentArgs([]).apply), false);
  assert.equal(developmentArgs(["--apply"]).apply, true);
  for (const args of [["--environment", "production"], ["--apply=false"], ["--database-url", "anything"], ["--force"]]) assert.throws(() => developmentArgs(args));
});

test("tier reads drop malformed entries, keep nullable fields, and return numbers", () => {
  const valid = { ...tier(), price_usd: "14.99", billing: "once" };
  const unknown = { ...tier(), name: "Contact sales", price_usd: null, gets: null, link_type: null };
  const bad = [null, false, [], {}, { ...tier(), name: " " }, { ...tier(), price_usd: "" },
    { ...tier(), price_usd: -1 }, { ...tier(), price_usd: NaN }, { ...tier(), price_usd: Infinity },
    { ...tier(), billing: "day" }, { ...tier(), gets: 123 }, { ...tier(), link_type: "follow" }, { ...tier(), extra: true }];
  assert.deepEqual(parseLaunchPriceTiers([tier(), ...bad, valid, unknown]), [tier(), { ...valid, price_usd: 14.99 }, unknown]);
  for (const value of [null, {}, "[]"]) assert.deepEqual(parseLaunchPriceTiers(value), []);
  assert.equal(launchDirectoryNumber("0"), 0);
  assert.equal(launchDirectoryNumber("14.99"), 14.99);
  for (const value of ["", " ", "NaN", "Infinity", "0x10", -1, undefined, true]) assert.equal(launchDirectoryNumber(value), null);
});

test("meta descriptions stop at a word boundary within 155 characters", () => {
  const summary = Array.from({ length: 45 }, () => "launch").join(" ");
  const result = launchMetaDescription(summary);
  assert.ok(result.length <= 155);
  assert.ok(summary.startsWith(`${result} `));
  assert.equal(launchMetaDescription("  A launch\nboard.  "), "A launch board.");
});

test("dataset refresh includes the main page, compare, every mapped child, and cache tags", () => {
  const targets = targetsForEvents([{ entity_type: "launch_directories", slug: "launch-directories" }]);
  for (const slug of ["launch-directories", "launch-directories/compare", ...launchDirectoryPageSlugs]) {
    for (const key of ["paths", "warmPaths", "verifyPaths"]) assert.ok(targets[key].includes(`/${slug}`), `${key}: ${slug}`);
    assert.ok(targets.edgeTags.includes(`page:${slug.replaceAll("/", ":")}`));
  }
  assert.ok(targets.nextTags.includes("stack127-launch-directories"));
  assert.ok(targets.nextTags.length <= 200);
  const parent = targetsForEvents([{ entity_type: "page", slug: "launch-directories" }]);
  for (const slug of launchDirectoryPageSlugs) assert.ok(parent.paths.includes(`/${slug}`));
});

test("development imports are idempotent, preserve existing evidence, and refresh child dates", { skip: process.env.STACK127_TEST_DEVELOPMENT_DATABASE !== "1" }, async () => {
  const { default: pg } = await import("pg");
  const { resolveDatabaseUrl } = await import("../../../scripts/stack127/tool-pages/lib.mjs");
  const pool = new pg.Pool({ connectionString: resolveDatabaseUrl({ environment: "development" }), max: 1, connectionTimeoutMillis: 15000 });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const legacy = (await client.query(`select ${LAUNCH_DIRECTORY_FACT_SELECT_SQL} from (select 'legacy'::text slug) directory`)).rows[0];
    assert.ok(Object.values(legacy).every(value => value === null), "PR builds can read production before the additive migration");
    const row = (await client.query("select to_jsonb(d) record from public.launch_directories d where is_published order by slug limit 1 for update")).rows[0].record;
    const pages = (await client.query("select slug,updated_at::text from public.stack127_pages where slug='launch-directories' or slug=$1 or slug='launch-directories/compare' order by slug", [`launch-directories/${row.slug}`])).rows;
    const revision = (await client.query(LAUNCH_DIRECTORY_REVISION_SQL)).rows[0].fingerprint;
    const fixture = { ...facts(), slug: row.slug, domain_rating: { ...facts().domain_rating, value: row.domain_rating === 63 ? 64 : 63 } };
    const first = await importLaunchFacts(client, [fixture]);
    assert.equal(first.changed, 1);
    const after = (await client.query("select to_jsonb(d) record from public.launch_directories d where slug=$1", [row.slug])).rows[0].record;
    for (const key of ["evidence", "sources", "summary", "checked_on", "cost_label", "research_notes"]) assert.deepEqual(after[key], row[key]);
    assert.notEqual((await client.query(LAUNCH_DIRECTORY_REVISION_SQL)).rows[0].fingerprint, revision);
    const dates = (await client.query("select slug,updated_at::text from public.stack127_pages where slug=any($1::text[]) order by slug", [pages.map(page => page.slug)])).rows;
    assert.equal(dates.length, 3);
    assert.ok(dates.every((page, index) => page.updated_at !== pages[index].updated_at));
    assert.equal((await importLaunchFacts(client, [fixture])).changed, 0);
    assert.deepEqual((await client.query("select to_jsonb(d) record from public.launch_directories d where slug=$1", [row.slug])).rows[0].record, after);
    assert.deepEqual((await client.query("select slug,updated_at::text from public.stack127_pages where slug=any($1::text[]) order by slug", [pages.map(page => page.slug)])).rows, dates);
    const cleared = await importLaunchFacts(client, [{ slug: row.slug, domain_rating: null }]);
    assert.equal(cleared.changed, 1);
    assert.equal((await client.query("select domain_rating from public.launch_directories where slug=$1", [row.slug])).rows[0].domain_rating, null);
    const sync = await syncLaunchPages(client);
    assert.equal(sync.registry_inserted, 0);
    assert.equal(sync.directory_inserted, 0);
    assert.equal(sync.published, 0);
    await client.query("update public.launch_directories set is_published=false where slug=$1", [row.slug]);
    assert.equal((await syncLaunchPages(client)).unpublished, 1);
    assert.equal((await client.query("select is_published from public.stack127_pages where slug=$1", [`launch-directories/${row.slug}`])).rows[0].is_published, false);
    await client.query("update public.launch_directories set is_published=true where slug=$1", [row.slug]);
    assert.equal((await syncLaunchPages(client)).published, 0);
    assert.equal((await client.query("select is_published from public.stack127_pages where slug=$1", [`launch-directories/${row.slug}`])).rows[0].is_published, false);
  } finally { await client.query("rollback"); client.release(); await pool.end(); }
});
