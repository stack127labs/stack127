#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseEnv } from "node:util";
import { setTimeout as sleep } from "node:timers/promises";
import pg from "pg";
import { getDomain } from "tldts";
import { factsArgs } from "./import-facts.mjs";
import { resolveDatabaseUrl, printResult } from "../stack127/tool-pages/lib.mjs";

export function metricDomain(website) {
  const url = new URL(website);
  const domain = getDomain(url.hostname, { allowPrivateDomains: false });
  if (url.protocol !== "https:" || url.username || url.password || !domain) throw new Error("Invalid listing domain");
  return domain;
}

export function trafficBucket(rank) {
  if (rank === null) return "below_1m";
  if (!Number.isSafeInteger(rank) || rank < 1) throw new Error("Invalid Tranco rank");
  return rank <= 1000 ? "top_1k" : rank <= 10000 ? "top_10k" : rank <= 100000 ? "top_100k" : rank <= 1000000 ? "top_1m" : "below_1m";
}

// Validate the entire million before treating an absent domain as below_1m.
// A truncated download must never downgrade every missing listing.
export function parseTrancoCsv(csv, wantedDomains, expectedRows = 1000000) {
  const ranks = new Map();
  let count = 0;
  const lines = csv.trimEnd().split(/\r?\n/);
  for (const line of lines) {
    // Tranco includes reserved _wildcard_ placeholders. They occupy ranks but
    // cannot match a listing's registrable domain.
    const match = /^(\d+),((?:_wildcard_\.)?[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)$/.exec(line);
    if (!match || Number(match[1]) !== ++count || !match[2].includes(".") || match[2].includes("..")) throw new Error("Invalid or incomplete Tranco CSV");
    if (wantedDomains.has(match[2])) {
      if (ranks.has(match[2])) throw new Error("Duplicate Tranco domain");
      ranks.set(match[2], count);
    }
  }
  if (count !== expectedRows) throw new Error(`Expected ${expectedRows} Tranco rows; received ${count}`);
  return ranks;
}

async function boundedText(response, maxBytes) {
  if (Number(response.headers.get("content-length")) > maxBytes) throw new Error("Response is too large");
  const chunks = [];
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > maxBytes) { await response.body.cancel().catch(() => {}); throw new Error("Response is too large"); }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function latestTranco(wantedDomains, { fetchImplementation = fetch } = {}) {
  const meta = await fetchImplementation("https://tranco-list.eu/api/lists/date/latest", { signal: AbortSignal.timeout(30000), redirect: "error" });
  if (!meta.ok) throw new Error(`Tranco metadata HTTP ${meta.status}`);
  const list = JSON.parse(await boundedText(meta, 64000));
  if (!list.available || list.failed || !/^[A-Za-z0-9]+$/.test(list.list_id)) throw new Error("Latest Tranco list is unavailable");
  // Use the immutable ID so midnight cannot pair one list's ID with another CSV.
  const response = await fetchImplementation(`https://tranco-list.eu/download/${list.list_id}/1000000`, { signal: AbortSignal.timeout(120000), redirect: "error" });
  if (!response.ok) throw new Error(`Tranco CSV HTTP ${response.status}`);
  return { list_id: list.list_id, ranks: parseTrancoCsv(await boundedText(response, 40 * 1024 * 1024), wantedDomains) };
}

export function parseDomainRating(body) {
  const value = body?.domain_rating?.domain_rating;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) throw new Error("Invalid Ahrefs Domain Rating response");
  // The existing schema and UI use whole-number DR. Ahrefs returns a float.
  return Math.round(value);
}

export function retryDelay(header, attempt, now = Date.now()) {
  const seconds = header && /^\d+(?:\.\d+)?$/.test(header.trim()) ? Number(header) * 1000 : null;
  const date = header && seconds === null ? Date.parse(header) - now : null;
  return Math.max(30000 * 2 ** attempt, seconds ?? (Number.isFinite(date) ? date : 0));
}

/** One requester per run. All domains and retries share its pacing clock. */
export function ahrefsRequester({ apiKey, fetchImplementation = fetch, sleepImplementation = sleep,
  now = Date.now, paceMs = 3000, maxRetries = 2, maxBackoffMs = 60000 } = {}) {
  if (!apiKey?.trim()) throw new Error("AHREFS_API_KEY is required");
  let nextRequestAt = 0;
  let stopped = null;
  return async domain => {
    if (stopped) return { stopped };
    for (let attempt = 0; ; attempt++) {
      const wait = Math.max(0, nextRequestAt - now());
      if (wait) await sleepImplementation(wait);
      const url = new URL("https://api.ahrefs.com/v3/public/domain-rating-free");
      url.search = new URLSearchParams({ target: domain, version: "dr3", output: "json" });
      let response;
      try {
        response = await fetchImplementation(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }, signal: AbortSignal.timeout(30000), redirect: "error" });
      } catch { nextRequestAt = now() + paceMs; return { error: "Ahrefs request failed" }; }
      nextRequestAt = now() + paceMs;
      if (response.status === 429) {
        const delay = retryDelay(response.headers.get("retry-after"), attempt, now());
        await response.body?.cancel().catch(() => {});
        if (attempt >= maxRetries || delay > maxBackoffMs) { stopped = "rate_limited"; return { stopped }; }
        nextRequestAt = now() + Math.max(paceMs, delay);
        continue;
      }
      if (response.status === 401 || response.status === 403) {
        await response.body?.cancel().catch(() => {});
        stopped = "authentication_failed";
        return { stopped };
      }
      if (!response.ok) { await response.body?.cancel().catch(() => {}); return { error: `Ahrefs HTTP ${response.status}` }; }
      try { return { value: parseDomainRating(JSON.parse(await boundedText(response, 64000))) }; }
      catch { return { error: "Invalid Ahrefs response" }; }
    }
  };
}

const metricKeys = ["domain_rating", "domain_rating_checked_on", "traffic_bucket", "traffic_checked_on"];
export async function collectMetrics(records, { apiKey, checkedOn = new Date().toISOString().slice(0, 10),
  loadTranco = latestTranco, requestRating = ahrefsRequester({ apiKey }) } = {}) {
  const domains = new Map();
  let tranco;
  const failures = [];
  for (const row of records) {
    try { domains.set(row.slug, metricDomain(row.website_url)); }
    catch { failures.push({ slug: row.slug, source: "domain", error: "Invalid listing domain; previous values kept" }); }
  }
  if (domains.size) {
    try { tranco = await loadTranco(new Set(domains.values())); }
    catch { failures.push({ source: "tranco", error: "Tranco lookup failed; previous values kept" }); }
  }
  const ratings = new Map();
  const patches = [];
  let stopped = null;
  for (const row of records) {
    const domain = domains.get(row.slug);
    if (!domain) continue;
    const changes = {};
    if (tranco) Object.assign(changes, { traffic_bucket: trafficBucket(tranco.ranks.get(domain) ?? null), traffic_checked_on: checkedOn });
    if (!stopped) {
      if (!ratings.has(domain)) ratings.set(domain, await requestRating(domain));
      const rating = ratings.get(domain);
      if (rating.stopped) stopped = rating.stopped;
      else if (rating.error) failures.push({ slug: row.slug, source: "ahrefs", error: rating.error });
      else Object.assign(changes, { domain_rating: rating.value, domain_rating_checked_on: checkedOn });
    }
    // Successful checks advance the checked date, even when the score is the same.
    // A repeated same-day run with the same facts has no write at all.
    for (const key of metricKeys) if (Object.hasOwn(changes, key) && row[key] === changes[key]) delete changes[key];
    if (Object.keys(changes).length) patches.push({ slug: row.slug, expected_updated_at: row.updated_at, changes });
  }
  return { records: records.length, patches, unchanged: records.length - patches.length,
    tranco_list: tranco?.list_id ?? null, stopped, failures };
}

export async function applyMetricPatches(client, patches) {
  if (!patches.length) return { changed: 0, conflicts: [] };
  for (const patch of patches) if (Object.keys(patch.changes).some(key => !metricKeys.includes(key))) throw new Error("Only metric columns can be changed");
  const columns = metricKeys.filter(key => patches.some(patch => Object.hasOwn(patch.changes, key)));
  const assignments = columns.map(column => `"${column}"=(jsonb_populate_record(null::public.launch_directories,to_jsonb(directory) || patch.changes))."${column}"`).join(",");
  const result = await client.query(`update public.launch_directories directory set ${assignments}
    from jsonb_to_recordset($1::jsonb) patch(slug text,expected_updated_at timestamptz,changes jsonb)
    where directory.slug=patch.slug and directory.is_published and directory.updated_at=patch.expected_updated_at
      and not to_jsonb(directory) @> patch.changes returning directory.slug`, [JSON.stringify(patches)]);
  const changed = new Set(result.rows.map(row => row.slug));
  return { changed: result.rowCount, conflicts: patches.filter(patch => !changed.has(patch.slug)).map(patch => patch.slug) };
}

export function metricsConnection(args) {
  if (!args["env-file"]) return resolveDatabaseUrl(args);
  if (args.environment !== "production") throw new Error("--env-file is only for the OVH production job");
  if (args.confirm !== "stack127-production") throw new Error("Production requires --confirm stack127-production");
  const env = parseEnv(readFileSync(args["env-file"], "utf8"));
  if (Object.keys(env).some(key => !["DATABASE_URL", "AHREFS_API_KEY"].includes(key))) throw new Error("Metrics env file must contain only DATABASE_URL and AHREFS_API_KEY");
  const url = new URL(env.DATABASE_URL);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || url.username !== "stack127_app" || url.pathname !== "/postgres"
    || !["127.0.0.1", "database.stack127.com"].includes(url.hostname) || (url.port || "5432") !== "5432"
    || (url.hostname !== "127.0.0.1" && url.searchParams.get("sslmode") !== "verify-full")) throw new Error("Unexpected production metrics database target");
  return env.DATABASE_URL;
}

async function main() {
  const args = factsArgs(process.argv.slice(2), { "env-file": { type: "string" }, limit: { type: "string" } });
  if (args.limit !== undefined && (!/^[1-9]\d*$/.test(args.limit) || Number(args.limit) > 1000)) throw new Error("--limit must be 1 to 1000");
  const env = args["env-file"] ? parseEnv(readFileSync(args["env-file"], "utf8")) : parseEnv(readFileSync(".env.analytics", "utf8"));
  const apiKey = env.AHREFS_API_KEY || process.env.AHREFS_API_KEY;
  if (!apiKey?.trim()) throw new Error("AHREFS_API_KEY is required");
  const connectionString = metricsConnection(args);
  const poolOptions = { connectionString, max: 1, connectionTimeoutMillis: 15000, query_timeout: 60000 };
  const pool = new pg.Pool(poolOptions);
  let records;
  try {
    // to_jsonb preserves timestamp microseconds for the later concurrency guard.
    records = (await pool.query(`select to_jsonb(directory) record from public.launch_directories directory
      where is_published order by slug limit $1`, [Number(args.limit ?? 2147483647)])).rows.map(row => row.record);
  } finally { await pool.end(); }
  // No database connection or transaction is held during external lookups.
  const { patches, ...summary } = await collectMetrics(records, { apiKey });
  let result = { changed: 0, conflicts: [] };
  if (args.apply && patches.length) {
    const writer = new pg.Pool(poolOptions);
    const client = await writer.connect();
    try {
      await client.query("begin");
      await client.query("set local lock_timeout='10s'");
      result = await applyMetricPatches(client, patches);
      await client.query("commit");
    } catch (error) { await client.query("rollback").catch(() => {}); throw error; }
    finally { client.release(); await writer.end(); }
  }
  printResult({ ...summary, proposed: patches.length, ...result, applied: Boolean(args.apply), changes: patches.map(({ slug, changes }) => ({ slug, changes })) });
  if (summary.stopped || summary.failures.length || result.conflicts.length) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main().catch(() => {
  // Connection errors can include target details. Never echo credentials or provider bodies.
  console.error("Metrics refresh failed. Check AHREFS_API_KEY, the env file, database access, and source availability.");
  process.exitCode = 1;
});
