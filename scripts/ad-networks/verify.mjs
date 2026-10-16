#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import pg from "pg";
import { normalizeDomain } from "./lib.mjs";
import { defaultLocalDatabasePath, loadLocalNetworks, openLocalDatabase } from "./local-db.mjs";
import {
  claimLocalPublishers,
  releaseLocalLease,
  saveLocalVerification,
  selectLocalPublishers,
} from "./local-verifier-store.mjs";
import { verifyPublisher } from "./verify-publisher.mjs";
import {
  claimPublishers,
  releaseLease,
  saveVerification,
  selectPublishers,
} from "./verifier-store.mjs";

const { values } = parseArgs({
  options: {
    "unchecked-only": { type: "boolean", default: false },
    apply: { type: "boolean", default: false },
    store: { type: "string", default: "local" },
    "local-database": { type: "string", default: defaultLocalDatabasePath },
    limit: { type: "string", default: "100" },
    concurrency: { type: "string", default: "8" },
    domain: { type: "string", multiple: true },
    "lease-minutes": { type: "string", default: "100" },
    "time-budget-minutes": { type: "string", default: "80" },
    "summary-file": { type: "string", default: "tmp/ad-networks/verification-summary.json" },
    "list-rules": { type: "boolean", default: false },
    verbose: { type: "boolean", default: false },
  },
});

function boundedInteger(value, name, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return number;
}

const apply = values.apply;
if (!new Set(["local", "postgres"]).has(values.store)) throw new Error("--store must be local or postgres");
if (values.store === "postgres" && apply) throw new Error("PostgreSQL verification is preview-only; apply local verification and sync reviewed results.");
const limit = boundedInteger(values.limit, "--limit", 1, 100_000);
const concurrency = boundedInteger(values.concurrency, "--concurrency", 1, 100);
const leaseMinutes = boundedInteger(values["lease-minutes"], "--lease-minutes", 10, 360);
const timeBudgetMinutes = boundedInteger(values["time-budget-minutes"], "--time-budget-minutes", 1, 350);
const requestedDomains = [...new Set((values.domain ?? []).map(normalizeDomain))];
if (requestedDomains.includes(null)) throw new Error("Every --domain value must be a valid domain");
const databaseUrl = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
if (values.store === "postgres" && !databaseUrl) {
  throw new Error("DATABASE_POOLER_URL or DATABASE_URL is required with --store postgres");
}

const pool = values.store === "postgres" ? new pg.Pool({
  connectionString: databaseUrl,
  max: Math.min(concurrency + 2, 20),
  connectionTimeoutMillis: 15_000,
  query_timeout: 60_000,
  application_name: apply ? "stack127-ad-network-verifier" : "stack127-ad-network-verifier-dry-run",
}) : null;
if (values["unchecked-only"] && values.store !== "local") throw new Error("--unchecked-only requires --store local");
const localDatabase = values.store === "local" ? openLocalDatabase(values["local-database"]) : null;

async function loadNetworks() {
  const networks = localDatabase ? loadLocalNetworks(localDatabase) : (await pool.query(`
      select id, slug, name, manager_domains, ad_system_domains,
        program_signatures, identity_sources, identity_reviewed_at
      from public.ad_networks
      order by id
    `)).rows;
  const incomplete = networks.filter((network) =>
    !network.identity_reviewed_at
    || (!network.manager_domains?.length && !network.program_signatures?.length)
  );
  if (incomplete.length) {
    throw new Error(`Network identity rules are incomplete: ${incomplete.map((network) => network.slug).join(", ")}`);
  }
  return networks;
}

function claim(args) {
  args.uncheckedOnly = values["unchecked-only"];
  return localDatabase ? claimLocalPublishers(localDatabase, args) : claimPublishers(pool, args);
}

function select(args) {
  args.uncheckedOnly = values["unchecked-only"];
  return localDatabase ? selectLocalPublishers(localDatabase, args) : selectPublishers(pool, args);
}

function save(publisher, result) {
  return localDatabase
    ? saveLocalVerification(localDatabase, publisher, result)
    : saveVerification(pool, publisher, result);
}

function release(publisherId) {
  return localDatabase ? releaseLocalLease(localDatabase, publisherId) : releaseLease(pool, publisherId);
}

function createSummary() {
  return {
    mode: apply ? "apply" : "dry_run",
    startedAt: new Date().toISOString(),
    requested: limit,
    attempted: 0,
    processed: 0,
    databaseFailures: 0,
    outcomes: {},
    confirmedRelationships: 0,
    reviewRelationships: 0,
  };
}

async function processBatch(publishers, networks, summary) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, publishers.length) }, async () => {
    while (!stopping && cursor < publishers.length) {
      const publisher = publishers[cursor++];
      let result;
      try {
        result = await verifyPublisher(publisher, networks);
      } catch (error) {
        result = {
          outcome: "temporary_error",
          checkedAt: new Date().toISOString(),
          evidence: { checked_at: new Date().toISOString(), reason: error.message },
        };
      }
      summary.attempted += 1;
      if (apply) {
        try {
          await save(publisher, result);
        } catch (error) {
          summary.databaseFailures += 1;
          await Promise.resolve(release(publisher.id)).catch(() => {});
          console.error(JSON.stringify({ domain: publisher.normalized_domain, status: "database_failed", error: error.message }));
          continue;
        }
      }
      summary.processed += 1;
      summary.outcomes[result.outcome] = (summary.outcomes[result.outcome] ?? 0) + 1;
      summary.confirmedRelationships += result.matches?.confirmed.length ?? 0;
      summary.reviewRelationships += result.matches?.review.length ?? 0;
      if (values.verbose) {
        console.log(JSON.stringify({
          domain: publisher.normalized_domain,
          outcome: result.outcome,
          confirmed: result.matches?.confirmed.map((match) => match.slug) ?? [],
          review: result.matches?.review.map((match) => match.slug) ?? [],
          reason: result.evidence.reason ?? null,
        }));
      } else if (summary.processed % 100 === 0) {
        const elapsed = (Date.now() - Date.parse(summary.startedAt)) / 1000;
        const remaining = localDatabase?.prepare("select count(*) n from publishers where last_check_outcome is null").get().n;
        const progress = { ...summary, outcomes: {...summary.outcomes}, status: "progress", remaining, elapsedSeconds: Math.round(elapsed),
          sitesPerSecond: summary.processed / elapsed, etaSeconds: remaining == null ? null : Math.round(remaining * elapsed / summary.processed) };
        const file = resolve(values["summary-file"]);
        await mkdir(dirname(file), { recursive: true });
        const temporary = `${file}.${summary.processed}.tmp`;
        await writeFile(temporary, JSON.stringify(progress), { mode: 0o600 });
        await (await import("node:fs/promises")).rename(temporary, file);
        console.log(JSON.stringify(progress));
      }
    }
  });
  await Promise.all(workers);
  if (apply && stopping) for (const publisher of publishers.slice(cursor)) await release(publisher.id);
}

async function saveSummary(summary) {
  summary.finishedAt = new Date().toISOString();
  summary.elapsedSeconds = Math.round((new Date(summary.finishedAt) - new Date(summary.startedAt)) / 1000);
  const file = resolve(values["summary-file"]);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify(summary));
}

const summary = createSummary();
let stopping = false;
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { stopping = true; summary.interrupted = true; });
try {
  const networks = await loadNetworks();
  if (values["list-rules"]) {
    console.log(JSON.stringify(networks, null, 2));
    process.exitCode = 0;
  } else if (requestedDomains.length) {
    const publishers = apply
      ? await claim({ limit, leaseMinutes, domains: requestedDomains })
      : await select({ limit, domains: requestedDomains });
    await processBatch(publishers, networks, summary);
    await saveSummary(summary);
  } else if (!apply) {
    const publishers = await select({ limit, domains: [] });
    await processBatch(publishers, networks, summary);
    await saveSummary(summary);
  } else {
    const deadline = Date.now() + timeBudgetMinutes * 60_000;
    while (!stopping && summary.attempted < limit && Date.now() < deadline) {
      const batchSize = Math.min(concurrency * 32, limit - summary.attempted);
      const publishers = await claim({ limit: batchSize, leaseMinutes, domains: [] });
      if (!publishers.length) break;
      await processBatch(publishers, networks, summary);
    }
    await saveSummary(summary);
  }
} finally {
  if (pool) await pool.end();
  localDatabase?.close();
}

if (summary.databaseFailures) process.exitCode = 1;
