#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { runMutation, printResult } from "../stack127/tool-pages/lib.mjs";
import { launchDirectoryDate, parseLaunchPriceTiers } from "../../lib/launch-directories-data.ts";

const factKeys = ["domain_rating", "traffic", "listing_indexed", "review_wait", "lowest_paid_price_usd", "price_tiers"];
const buckets = ["top_1k", "top_10k", "top_100k", "top_1m", "below_1m"];
const fail = (path, message) => { throw new Error(`${path}: ${message}`); };
function object(value, keys, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(path, "expected an object");
  for (const key of Object.keys(value)) if (!keys.includes(key)) fail(`${path}.${key}`, "unknown key");
}
function required(value, keys, path) {
  object(value, keys, path);
  for (const key of keys) if (!Object.hasOwn(value, key)) fail(`${path}.${key}`, "missing required key");
}
function number(value, path, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false, nullable = false, money = false } = {}) {
  if (value === null && nullable) return;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max
    || (integer && !Number.isSafeInteger(value)) || (money && !/^\d+(?:\.\d{1,2})?$/.test(String(value)))) fail(path, "invalid number");
}
function date(value, path) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-") || launchDirectoryDate(value) !== value) fail(path, "expected a real YYYY-MM-DD date");
}
function text(value, path, max) {
  if (typeof value !== "string" || !value.length || value !== value.trim() || [...value].length > max) fail(path, `expected trimmed text, 1 to ${max} characters`);
}
function source(value, path) {
  try {
    if (typeof value !== "string") throw new Error();
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || value !== value.trim()) throw new Error();
  } catch { fail(path, "expected an HTTPS source URL"); }
}

/** Omitted facts stay unchanged. Explicit null clears only that fact's new columns. */
export function validateLaunchFacts(records, knownSlugs) {
  if (!Array.isArray(records)) fail("facts", "expected an array of records");
  const seen = new Set();
  return records.map((record, index) => {
    const path = `facts[${index}]`;
    object(record, ["slug", ...factKeys], path);
    if (typeof record.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) fail(`${path}.slug`, "invalid slug");
    if (seen.has(record.slug)) fail(`${path}.slug`, `duplicate slug ${record.slug}`);
    if (knownSlugs && !knownSlugs.has(record.slug)) fail(`${path}.slug`, `unknown slug ${record.slug}`);
    seen.add(record.slug);
    const changes = {};
    for (const key of factKeys) {
      if (!Object.hasOwn(record, key)) continue;
      const value = record[key];
      const at = `${record.slug}.${key}`;
      if (key === "domain_rating") {
        if (value !== null) {
          required(value, ["value", "checked_on", "source_url"], at);
          number(value.value, `${at}.value`, { max: 100, integer: true }); date(value.checked_on, `${at}.checked_on`); source(value.source_url, `${at}.source_url`);
        }
        changes.domain_rating = value?.value ?? null;
        changes.domain_rating_checked_on = value?.checked_on ?? null;
      } else if (key === "traffic") {
        if (value !== null) {
          required(value, ["bucket", "rank", "checked_on", "source"], at);
          if (!buckets.includes(value.bucket)) fail(`${at}.bucket`, "unknown traffic bucket");
          // A domain below the top million has no Tranco rank at all.
          number(value.rank, `${at}.rank`, { min: 1, integer: true, nullable: value.bucket === "below_1m" });
          const expected = value.rank === null || value.rank > 1000000 ? "below_1m" : value.rank <= 1000 ? "top_1k" : value.rank <= 10000 ? "top_10k" : value.rank <= 100000 ? "top_100k" : "top_1m";
          if (value.bucket !== expected) fail(`${at}.bucket`, "bucket disagrees with rank");
          date(value.checked_on, `${at}.checked_on`);
          if (typeof value.source !== "string" || !/^tranco:[A-Za-z0-9_-]+$/.test(value.source)) fail(`${at}.source`, "expected tranco:LIST_ID");
        }
        changes.traffic_bucket = value?.bucket ?? null;
        changes.traffic_checked_on = value?.checked_on ?? null;
      } else if (key === "listing_indexed") {
        if (value !== null) {
          required(value, ["value", "checked_on", "query"], at);
          if (typeof value.value !== "boolean") fail(`${at}.value`, "expected a boolean");
          date(value.checked_on, `${at}.checked_on`); text(value.query, `${at}.query`, 2000);
          if (!value.query.startsWith("site:")) fail(`${at}.query`, "expected a site: query");
        }
        changes.listing_indexed = value?.value ?? null;
        changes.listing_indexed_checked_on = value?.checked_on ?? null;
      } else if (key === "review_wait") {
        if (value !== null) {
          required(value, ["label", "min_days", "max_days", "source_url"], at);
          text(value.label, `${at}.label`, 40);
          number(value.min_days, `${at}.min_days`, { nullable: true }); number(value.max_days, `${at}.max_days`, { nullable: true });
          if (value.min_days !== null && value.max_days !== null && value.min_days > value.max_days) fail(at, "min_days must not exceed max_days");
          source(value.source_url, `${at}.source_url`);
        }
        changes.review_wait_label = value?.label ?? null;
        changes.review_wait_min_days = value?.min_days ?? null;
        changes.review_wait_max_days = value?.max_days ?? null;
      } else if (key === "lowest_paid_price_usd") {
        if (value !== null) {
          required(value, ["value", "source_url"], at);
          number(value.value, `${at}.value`, { min: 0.01, max: 99999999.99, money: true }); source(value.source_url, `${at}.source_url`);
        }
        changes.lowest_paid_price_usd = value?.value ?? null;
      } else if (key === "price_tiers") {
        if (value !== null) {
          required(value, ["tiers", "source_url", "checked_on"], at);
          source(value.source_url, `${at}.source_url`); date(value.checked_on, `${at}.checked_on`);
          if (!Array.isArray(value.tiers)) fail(`${at}.tiers`, "expected an array");
          value.tiers.forEach((tier, index) => {
            const tierPath = `${at}.tiers[${index}]`;
            required(tier, ["name", "price_usd", "billing", "gets", "link_type"], tierPath);
            number(tier.price_usd, `${tierPath}.price_usd`, { nullable: true, max: 99999999.99, money: true });
            if (parseLaunchPriceTiers([tier]).length !== 1) fail(tierPath, "invalid tier name, billing, gets, or link_type");
          });
        }
        changes.price_tiers = value?.tiers ?? null;
      }
    }
    if (!Object.keys(changes).length) fail(record.slug, "no facts supplied");
    return { slug: record.slug, changes };
  });
}

export async function importLaunchFacts(client, records) {
  const patches = validateLaunchFacts(records);
  if (!patches.length) return { records: 0, changed: 0, unchanged: 0, changed_slugs: [] };
  const { rows } = await client.query("select slug from public.launch_directories where slug=any($1::text[]) order by slug for update", [patches.map(row => row.slug)]);
  validateLaunchFacts(records, new Set(rows.map(row => row.slug)));
  const columns = [...new Set(patches.flatMap(row => Object.keys(row.changes)))];
  const assignments = columns.map(column => `"${column}"=(jsonb_populate_record(null::public.launch_directories,to_jsonb(directory) || patch.changes))."${column}"`).join(",");
  const result = await client.query(`update public.launch_directories directory set ${assignments}
    from jsonb_to_recordset($1::jsonb) patch(slug text,changes jsonb)
    where directory.slug=patch.slug and not to_jsonb(directory) @> patch.changes returning directory.slug`, [JSON.stringify(patches)]);
  return { records: patches.length, changed: result.rowCount, unchanged: patches.length - result.rowCount, changed_slugs: result.rows.map(row => row.slug).sort() };
}

export function developmentArgs(args = process.argv.slice(2), extraOptions = {}) {
  const values = factsArgs(args, extraOptions, { developmentOnly: true });
  return values;
}

export function factsArgs(args = process.argv.slice(2), extraOptions = {}, { developmentOnly = false } = {}) {
  const { values } = parseArgs({ args, options: {
    environment: { type: "string", default: "development" }, apply: { type: "boolean" },
    confirm: { type: "string" }, ...extraOptions,
  } });
  if (!["development", "production"].includes(values.environment)) throw new Error("Use --environment development or production");
  if (developmentOnly && values.environment !== "development") throw new Error("Only --environment development is supported; production is refused");
  if (values.environment === "production" && values.confirm !== "stack127-production") throw new Error("Production requires --confirm stack127-production (including dry runs)");
  return values;
}

async function main() {
  const args = factsArgs(process.argv.slice(2), { "input-file": { type: "string", default: "content_docs/launch-directories/facts-2026-10.json" } });
  const records = JSON.parse(readFileSync(args["input-file"], "utf8"));
  validateLaunchFacts(records);
  printResult(await runMutation(args, client => importLaunchFacts(client, records)));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main().catch(error => { console.error(error.message); process.exitCode = 1; });
