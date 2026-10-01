#!/usr/bin/env node

import { parseArgs } from "node:util";
import { createLocalDiscoveryStore } from "./local-discovery-store.mjs";
import { defaultLocalDatabasePath, openLocalDatabase } from "./local-db.mjs";
import { normalizeDomain, sellerDomains } from "./lib.mjs";
import { phase2Sources } from "./phase2-sources.mjs";

const { values } = parseArgs({
  options: {
    apply: { type: "boolean", default: false },
    fresh: { type: "boolean", default: false },
    source: { type: "string", multiple: true },
    kind: { type: "string", multiple: true },
    "local-database": { type: "string", default: defaultLocalDatabasePath },
    "delay-ms": { type: "string", default: "350" },
    "max-pages": { type: "string" },
    "list-sources": { type: "boolean", default: false },
  },
});

if (values["list-sources"]) {
  console.log(JSON.stringify(phase2Sources, null, 2));
  process.exit(0);
}

const delayMs = Number(values["delay-ms"]);
if (!Number.isInteger(delayMs) || delayMs < 100 || delayMs > 10_000) {
  throw new Error("--delay-ms must be from 100 to 10000");
}
const maxPages = values["max-pages"] === undefined ? Infinity : Number(values["max-pages"]);
if (!(maxPages === Infinity || (Number.isInteger(maxPages) && maxPages >= 1))) {
  throw new Error("--max-pages must be a positive integer");
}
const selected = phase2Sources.filter((source) => {
  const sourceMatch = !values.source?.length || values.source.some((value) =>
    value === source.key || value === source.networkSlug || source.key.startsWith(`${value}:`)
  );
  const kindMatch = !values.kind?.length || values.kind.includes(source.kind);
  return sourceMatch && kindMatch;
});
if (!selected.length) throw new Error("No Phase 2 sources matched the selection");

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
let lastRequestAt = 0;

async function fetchResponse(url, accept = "text/html") {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < delayMs) await wait(delayMs - elapsed);
  let finalError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    let retryDelay = Math.min(1000 * (2 ** attempt), 15_000);
    lastRequestAt = Date.now();
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          Accept: accept,
          "User-Agent": "stack127bot/1.0 (+https://stack127.com/ad-networks)",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (response.status === 404 || response.status === 410) return response;
      if (response.ok) return response;
      if (response.status === 429 && response.headers.get("x-vercel-mitigated") === "challenge") {
        return response;
      }
      if (![408, 425, 429, 500, 502, 503, 504].includes(response.status)) {
        const error = new Error(`${url} returned HTTP ${response.status}`);
        error.retryable = false;
        throw error;
      }
      finalError = new Error(`${url} returned HTTP ${response.status}`);
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after"));
        retryDelay = Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter * 1000, 120_000)
          : Math.min(30_000 * (attempt + 1), 120_000);
      }
    } catch (error) {
      if (error.retryable === false) throw error;
      finalError = error;
    }
    if (attempt < 5) await wait(retryDelay);
  }
  throw finalError;
}

function uniqueCandidates(valuesToNormalize) {
  const candidates = new Map();
  for (const supplied of valuesToNormalize) {
    const domain = normalizeDomain(supplied);
    if (domain) candidates.set(domain, { domain, supplied });
  }
  return [...candidates.values()];
}

function htmlTextDomains(html) {
  return uniqueCandidates([...html.matchAll(/>([a-z0-9](?:[a-z0-9.-]{1,251})\.[a-z]{2,})</gi)]
    .map((match) => match[1]));
}

function checkpoint(database, sourceKey) {
  return database.prepare("select * from collector_checkpoints where source_key = ?").get(sourceKey) ?? {
    cursor: 0,
    collected: 0,
    status: "pending",
  };
}

function saveCheckpoint(database, sourceKey, valuesToSave) {
  database.prepare(`
    insert into collector_checkpoints (
      source_key, cursor, collected, status, last_error, updated_at
    ) values (?, ?, ?, ?, ?, ?)
    on conflict(source_key) do update set
      cursor = excluded.cursor,
      collected = excluded.collected,
      status = excluded.status,
      last_error = excluded.last_error,
      updated_at = excluded.updated_at
  `).run(
    sourceKey,
    valuesToSave.cursor,
    valuesToSave.collected,
    valuesToSave.status,
    valuesToSave.lastError ?? null,
    new Date().toISOString(),
  );
}

function appliedStats() {
  return { candidates: 0, newDomains: 0, newSightings: 0, pages: 0 };
}

function applyCandidates(store, source, candidates, stats) {
  stats.candidates += candidates.length;
  if (!values.apply || !candidates.length) return;
  const result = store.upsertBatch({ ...source, kind: "phase2-once" }, candidates, new Date().toISOString());
  stats.newDomains += result.inserted;
  stats.newSightings += result.newSightings;
}

async function collectFathom(source, database, store) {
  const prior = checkpoint(database, source.key);
  if (!values.fresh && prior.status === "complete") return { status: "skipped_complete" };
  let page = values.fresh ? 1 : prior.cursor + 1;
  let cumulative = values.fresh ? 0 : prior.collected;
  const stats = appliedStats();
  let totalPages = page;
  while (page <= totalPages && stats.pages < maxPages) {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: "100",
      sort: "monthlyVisits",
      order: "desc",
    });
    if (source.filter) query.set("network", source.filter);
    const response = await fetchResponse(`${source.apiUrl}?${query}`, "application/json");
    if (!response.ok) return { status: "unavailable", httpStatus: response.status, ...stats };
    const payload = await response.json();
    if (!Array.isArray(payload.data) || !Number.isInteger(payload.totalPages)) {
      throw new Error(`${source.key} returned an unexpected API response`);
    }
    totalPages = payload.totalPages;
    const candidates = uniqueCandidates(payload.data.map((item) => item?.domain));
    if (!candidates.length && page <= totalPages) throw new Error(`${source.key} page ${page} returned no domains`);
    applyCandidates(store, source, candidates, stats);
    cumulative += candidates.length;
    stats.pages += 1;
    saveCheckpoint(database, source.key, {
      cursor: page,
      collected: cumulative,
      status: page >= totalPages ? "complete" : "running",
    });
    if (page === 1 || page % 25 === 0 || page === totalPages) {
      console.log(JSON.stringify({ source: source.key, status: "progress", page, totalPages, ...stats }));
    }
    page += 1;
  }
  const complete = page > totalPages;
  if (complete && values.apply) {
    store.saveSourceState(source.key, {
      url: source.url,
      candidates: cumulative,
      completedAt: new Date().toISOString(),
    });
  }
  return { status: complete ? "complete" : "partial", totalPages, ...stats };
}

function arulDomains(html) {
  const activeTable = html.match(/<table[^>]+id=['"]tpublishers['"][^>]*>([\s\S]*?)<\/table>/i)?.[1] ?? "";
  return uniqueCandidates([...activeTable.matchAll(/<tr><td>\d+<\/td><td>[\s\S]*?<\/td><td>([^<]+)<\/td><\/tr>/gi)]
    .map((match) => match[1].trim()));
}

function arulTotalPages(html) {
  const valuesFound = [...html.matchAll(/\/page\/(\d+)/g)].map((match) => Number(match[1]));
  const textTotal = Number(html.match(/page\s+\d+\s*\/\s*(\d+)/i)?.[1]);
  return Math.max(1, textTotal || 0, ...valuesFound);
}

async function collectArul(source, database, store) {
  const prior = checkpoint(database, source.key);
  if (!values.fresh && prior.status === "complete") return { status: "skipped_complete" };
  let page = values.fresh ? 1 : prior.cursor + 1;
  let cumulative = values.fresh ? 0 : prior.collected;
  const stats = appliedStats();
  let totalPages = page;
  while (page <= totalPages && stats.pages < maxPages) {
    const url = page === 1 ? source.url : `${source.url}/page/${page}`;
    const response = await fetchResponse(url);
    if (!response.ok) return { status: "unavailable", httpStatus: response.status, ...stats };
    const html = await response.text();
    totalPages = arulTotalPages(html);
    const candidates = arulDomains(html);
    if (!candidates.length) throw new Error(`${source.key} page ${page} returned no publisher rows`);
    applyCandidates(store, source, candidates, stats);
    cumulative += candidates.length;
    stats.pages += 1;
    saveCheckpoint(database, source.key, {
      cursor: page,
      collected: cumulative,
      status: page >= totalPages ? "complete" : "running",
    });
    if (page === 1 || page % 25 === 0 || page === totalPages) {
      console.log(JSON.stringify({ source: source.key, status: "progress", page, totalPages, ...stats }));
    }
    page += 1;
  }
  const complete = page > totalPages;
  if (complete && values.apply) {
    store.saveSourceState(source.key, {
      url: source.url,
      candidates: cumulative,
      completedAt: new Date().toISOString(),
    });
  }
  return { status: complete ? "complete" : "partial", totalPages, ...stats };
}

function singlePageDomains(source, html) {
  if (source.kind === "which-html") {
    return uniqueCandidates([...html.matchAll(/href=["']\/sites\/([^"'/?#]+)["']/gi)].map((match) => match[1]));
  }
  if (source.kind === "wappalyzer-html") {
    return uniqueCandidates([...html.matchAll(/href=["']\/lookup\/([^"'/?#]+)\/["']/gi)].map((match) => match[1]));
  }
  if (source.kind === "listof-html") {
    return uniqueCandidates([...html.matchAll(/<a[^>]+class=["'][^"']*domain[^"']*["'][^>]+href=["'](https?:\/\/[^"']+)["']/gi)]
      .map((match) => match[1]));
  }
  if (source.kind === "sitestats-html") {
    return htmlTextDomains(html).filter((candidate) => !new Set([
      "sitestatsdb.com", "vercel.link", "vercel.com",
    ]).has(candidate.domain));
  }
  if (source.kind === "redvolcano-html") {
    const table = html.match(/id=["']publishers-table["'][\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i)?.[1] ?? "";
    return htmlTextDomains(table);
  }
  if (source.kind === "portfolio-html") {
    const excluded = new Set(["publisher-collective.com", "facebook.com", "instagram.com", "linkedin.com", "x.com", "youtube.com"]);
    return uniqueCandidates([...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)]
      .map((match) => match[1]))
      .filter((candidate) => !excluded.has(candidate.domain));
  }
  if (source.kind === "exploding-html") {
    return htmlTextDomains(html).filter((candidate) => !new Set([
      "explodingweb.io", "fonts.googleapis.com", "fonts.gstatic.com",
    ]).has(candidate.domain));
  }
  throw new Error(`No parser for ${source.kind}`);
}

async function collectSinglePage(source, database, store) {
  const prior = checkpoint(database, source.key);
  if (!values.fresh && prior.status === "complete") return { status: "skipped_complete" };
  const response = await fetchResponse(source.url);
  if (!response.ok) {
    saveCheckpoint(database, source.key, { cursor: 0, collected: 0, status: "unavailable" });
    return { status: "unavailable", httpStatus: response.status, candidates: 0, newDomains: 0, newSightings: 0, pages: 1 };
  }
  let candidates;
  if (source.kind === "sellers-json-once") {
    const payload = await response.json();
    candidates = sellerDomains(payload);
  } else {
    const html = await response.text();
    candidates = singlePageDomains(source, html);
  }
  const stats = appliedStats();
  stats.pages = 1;
  applyCandidates(store, source, candidates, stats);
  const status = candidates.length ? "complete" : "empty";
  saveCheckpoint(database, source.key, { cursor: 1, collected: candidates.length, status });
  if (values.apply && candidates.length) {
    store.saveSourceState(source.key, {
      url: source.url,
      candidates: candidates.length,
      completedAt: new Date().toISOString(),
    });
  }
  return { status, ...stats };
}

const database = openLocalDatabase(values["local-database"]);
const store = createLocalDiscoveryStore(database);
let failed = 0;
const totals = { sources: selected.length, complete: 0, unavailable: 0, empty: 0, skipped: 0, failed: 0, candidates: 0, newDomains: 0, newSightings: 0, pages: 0 };
try {
  for (const source of selected) {
    try {
      let result;
      if (source.kind === "fathom-api") result = await collectFathom(source, database, store);
      else if (source.kind === "arul-html") result = await collectArul(source, database, store);
      else result = await collectSinglePage(source, database, store);
      if (result.status === "complete") totals.complete += 1;
      else if (result.status === "unavailable") totals.unavailable += 1;
      else if (result.status === "empty") totals.empty += 1;
      else if (result.status === "skipped_complete") totals.skipped += 1;
      for (const key of ["candidates", "newDomains", "newSightings", "pages"]) totals[key] += result[key] ?? 0;
      console.log(JSON.stringify({ source: source.key, ...result }));
    } catch (error) {
      failed += 1;
      totals.failed += 1;
      const prior = checkpoint(database, source.key);
      saveCheckpoint(database, source.key, {
        cursor: prior.cursor,
        collected: prior.collected,
        status: "failed",
        lastError: error.message.slice(0, 2000),
      });
      console.error(JSON.stringify({ source: source.key, status: "failed", error: error.message }));
    }
  }
} finally {
  database.close();
}
console.log(JSON.stringify({ status: failed ? "completed_with_failures" : "complete", ...totals }));
if (failed) process.exitCode = 1;
