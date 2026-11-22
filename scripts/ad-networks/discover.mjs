#!/usr/bin/env node

import { readFile, mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import pg from "pg";
import {
  checkRobots,
  fetchWithRetry,
  majesticDomains,
  publisherLinkDomains,
  sellerDomainsStream,
} from "./lib.mjs";
import { downloadToFile } from "./discovery-download.mjs";
import { runDiscoverySources } from "./discovery-run.mjs";
import { SELLERS_ACCEPT } from "./fetch-policy.mjs";
import { createLocalDiscoveryStore } from "./local-discovery-store.mjs";
import { defaultLocalDatabasePath, openLocalDatabase } from "./local-db.mjs";
import { selectSources, sources } from "./sources.mjs";

const { values } = parseArgs({
  options: {
    source: { type: "string", multiple: true },
    kind: { type: "string" },
    apply: { type: "boolean", default: false },
    store: { type: "string", default: "local" },
    "local-database": { type: "string", default: defaultLocalDatabasePath },
    "include-majestic": { type: "boolean", default: false },
    "list-sources": { type: "boolean", default: false },
    "state-file": { type: "string", default: "tmp/ad-networks/discovery-state.json" },
  },
});

if (values["list-sources"]) {
  console.log(JSON.stringify(sources, null, 2));
  process.exit(0);
}

if (!new Set(["local", "postgres"]).has(values.store)) throw new Error("--store must be local or postgres");
const explicitlySelectedMajestic = (values.source ?? []).includes("majestic-million");
const selected = selectSources(values.source ?? [])
  .filter((source) => !values.kind || source.kind === values.kind)
  .filter((source) => values["include-majestic"] || explicitlySelectedMajestic || source.kind !== "majestic-csv");
if (!selected.length) throw new Error(`No active sources match kind ${values.kind}`);
const apply = values.apply;
const stateFile = resolve(values["state-file"]);
const databaseUrl = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
if (apply && values.store === "postgres" && !databaseUrl) {
  throw new Error("DATABASE_POOLER_URL or DATABASE_URL is required with --apply --store postgres");
}

async function readState() {
  try { return JSON.parse(await readFile(stateFile, "utf8")); }
  catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function saveState(state) {
  await mkdir(dirname(stateFile), { recursive: true });
  const temporary = `${stateFile}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, stateFile);
}

const upsertSql = `
  with input as materialized (
    select domain, supplied
    from jsonb_to_recordset($1::jsonb) as row(domain text, supplied text)
  ), candidates as materialized (
    select input.domain, input.supplied
    from input
    left join public.ad_network_publishers existing on existing.normalized_domain = input.domain
    where existing.id is null
      or (
        jsonb_array_length(existing.discovery_sources) < 50
        and not (existing.discovery_sources @> jsonb_build_array(jsonb_build_object('source_key', $2::text)))
      )
  )
  insert into public.ad_network_publishers as publisher
    (normalized_domain, display_domain, discovery_sources, first_seen_at, last_discovered_at,
      verification_priority, next_check_at)
  select candidates.domain, candidates.domain,
    jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'source_key', $2::text,
      'source_url', $3::text,
      'seen_at', $4::text,
      'domain_as_supplied', candidates.supplied,
      'license_attribution', $5::text
    ))), now(), now(), $6::smallint, now()
  from candidates
  on conflict (normalized_domain) do update set
    discovery_sources = publisher.discovery_sources || excluded.discovery_sources,
    last_discovered_at = now(),
    verification_priority = greatest(publisher.verification_priority, excluded.verification_priority),
    next_check_at = least(coalesce(publisher.next_check_at, now()), now())
  where jsonb_array_length(publisher.discovery_sources) < 50
    and not (publisher.discovery_sources @> jsonb_build_array(jsonb_build_object('source_key', $2::text)))
  returning (xmax = 0) as inserted
`;

async function upsertBatch(pool, source, batch, seenAt) {
  const result = await pool.query(upsertSql, [
    JSON.stringify(batch), source.key, source.url, seenAt,
    source.licenseAttribution ?? null,
    source.verificationPriority ?? (source.kind === "majestic-csv" ? 10 : 80),
  ]);
  const inserted = result.rows.filter((row) => row.inserted).length;
  return { inserted, newSightings: result.rowCount - inserted };
}

async function existingSourceDomains(pool, sourceKey) {
  const result = await pool.query({
    text: `select normalized_domain from public.ad_network_publishers
      where discovery_sources @> jsonb_build_array(jsonb_build_object('source_key', $1::text))`,
    values: [sourceKey],
    query_timeout: 180_000,
  });
  const domains = new Set();
  for (const row of result.rows) domains.add(row.normalized_domain);
  result.rows.length = 0;
  return domains;
}


async function sourceResponse(source, previous) {
  if (!source.skipRobotsCheck) await checkRobots(source.url);
  if (source.kind === "majestic-csv") {
    const response = await downloadToFile(source, previous, { maxTimeSeconds: 600, accept: "text/csv", apply });
    if (response.url !== source.url) {
      try { await checkRobots(response.url); }
      catch (error) { await response.cleanup(); throw error; }
    }
    return response;
  }
  if (source.transport === "curl-file") {
    const response = await downloadToFile(source, previous, {
      apply,
      maxTimeSeconds: Math.ceil((source.timeoutMs ?? 180_000) / 1000),
      accept: source.kind === "sellers-json" ? SELLERS_ACCEPT : "text/html",
    });
    if (response.url !== source.url) {
      try { await checkRobots(response.url); }
      catch (error) { await response.cleanup(); throw error; }
    }
    return response;
  }
  const accept = source.kind === "sellers-json"
    ? SELLERS_ACCEPT
    : source.kind === "publisher-list-html"
      ? "text/html"
      : "text/csv";
  const headers = { Accept: accept };
  if (apply && previous?.url === source.url) {
    if (previous.etag) headers["If-None-Match"] = previous.etag;
    if (previous.lastModified) headers["If-Modified-Since"] = previous.lastModified;
  }
  const response = await fetchWithRetry(source.url, {
    headers,
    timeoutMs: source.kind === "majestic-csv" ? 600_000 : (source.timeoutMs ?? 45_000),
  });
  if (response.status === 404) throw new Error(`${source.url} returned HTTP 404`);
  if (response.status === 304 && !previous?.completedAt) throw new Error(`${source.url} returned 304 without completed state`);
  if (response.url !== source.url && !source.skipRobotsCheck) await checkRobots(response.url);
  return response;
}

async function processSource(source, storage, state) {
  const previous = state[source.key];
  const response = await sourceResponse(source, previous);
  if (response.status === 304) {
    await response.cleanup?.();
    return { source: source.key, status: "unchanged", previousCandidates: previous.candidates };
  }

  const seenAt = new Date().toISOString();
  const stats = { source: source.key, status: apply ? "applied" : "dry_run", candidates: 0, newDomains: 0, newSightings: 0 };
  let previouslyAttributed = null;
  if (source.kind === "majestic-csv" && storage) {
    try { previouslyAttributed = await storage.existingSourceDomains(source.key); }
    catch (error) { error.discoveryStorage = true; throw error; }
  }
  const batch = [];
  const flush = async () => {
    if (!batch.length) return;
    if (storage) {
      const unique = [...new Map(batch.map((candidate) => [candidate.domain, candidate])).values()];
      let result;
      try { result = await storage.upsertBatch(source, unique, seenAt); }
      catch (error) { error.discoveryStorage = true; throw error; }
      stats.newDomains += result.inserted;
      stats.newSightings += result.newSightings;
    }
    batch.length = 0;
  };

  if (source.kind === "sellers-json") {
    const uniqueDomains = new Set();
    try {
      for await (const candidate of sellerDomainsStream(response.body)) {
        if (uniqueDomains.has(candidate.domain)) continue;
        uniqueDomains.add(candidate.domain);
        stats.candidates += 1;
        batch.push(candidate);
        if (batch.length === 2000) await flush();
      }
    } finally {
      await response.cleanup?.();
    }
    if (previous?.candidates && uniqueDomains.size < previous.candidates / 2) {
      throw new Error(`Seller feed shrank from ${previous.candidates} to ${uniqueDomains.size} domains; review before accepting`);
    }
  } else if (source.kind === "publisher-list-html") {
    const html = await response.text();
    for (const candidate of publisherLinkDomains(html, source.url)) {
      stats.candidates += 1;
      batch.push(candidate);
    }
  } else if (source.kind === "majestic-csv") {
    try {
      for await (const candidate of majesticDomains(response.body)) {
        stats.candidates += 1;
        if (!previouslyAttributed?.has(candidate.domain)) batch.push(candidate);
        if (batch.length === 2000) await flush();
        if (apply && stats.candidates % 100_000 === 0) {
          console.log(JSON.stringify({ source: source.key, status: "progress", candidates: stats.candidates }));
        }
      }
    } finally {
      await response.cleanup();
    }
    if (previous?.candidates && stats.candidates < previous.candidates / 2) {
      throw new Error(`Majestic file shrank from ${previous.candidates} to ${stats.candidates} domains; review before accepting`);
    }
  } else throw new Error(`Unsupported source type: ${source.kind}`);
  await flush();

  if (apply) {
    state[source.key] = {
      url: source.url,
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
      candidates: stats.candidates,
      completedAt: seenAt,
    };
  }
  return stats;
}

const pool = apply && values.store === "postgres" ? new pg.Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 15_000,
  query_timeout: 60_000,
  application_name: "stack127-ad-network-discovery",
}) : null;
const localDatabase = apply && values.store === "local"
  ? openLocalDatabase(values["local-database"])
  : null;
const localStore = localDatabase ? createLocalDiscoveryStore(localDatabase) : null;
const storage = localStore ?? (pool ? {
  upsertBatch: (source, batch, seenAt) => upsertBatch(pool, source, batch, seenAt),
  existingSourceDomains: (sourceKey) => existingSourceDomains(pool, sourceKey),
} : null);

try {
  const state = apply ? (localStore ? localStore.readState() : await readState()) : {};
  process.exitCode = await runDiscoverySources({
    sources: selected, state,
    processSource: source => processSource(source, storage, state),
    saveSuccess: async (source, entry) => {
      if (!apply) return;
      if (localStore) localStore.saveSourceState(source.key, entry);
      else await saveState(state);
    },
    saveFailure: async (source, error) => {
      if (!apply) return;
      if (localStore) localStore.saveSourceFailure(source, error);
      else await saveState(state);
    },
  });
} finally {
  if (pool) await pool.end();
  localDatabase?.close();
}
