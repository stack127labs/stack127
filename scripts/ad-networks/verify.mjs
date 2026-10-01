#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import pg from "pg";
import { getDomain } from "tldts";
import { PARSER_VERSION, parseAdsTxt } from "./ads-txt.mjs";
import {
  fetchAdsTxt,
  fetchDeclaredSubdomainAdsTxt,
  fetchHomepage,
} from "./fetch-policy.mjs";
import { normalizeDomain } from "./lib.mjs";
import { defaultLocalDatabasePath, loadLocalNetworks, openLocalDatabase } from "./local-db.mjs";
import {
  claimLocalPublishers,
  releaseLocalLease,
  saveLocalVerification,
  selectLocalPublishers,
} from "./local-verifier-store.mjs";
import { MATCHER_VERSION, matchNetworks, needsHomepage } from "./matcher.mjs";
import {
  claimPublishers,
  releaseLease,
  saveVerification,
  selectPublishers,
} from "./verifier-store.mjs";

const { values } = parseArgs({
  options: {
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
const limit = boundedInteger(values.limit, "--limit", 1, 100_000);
const concurrency = boundedInteger(values.concurrency, "--concurrency", 1, 25);
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
  return localDatabase ? claimLocalPublishers(localDatabase, args) : claimPublishers(pool, args);
}

function select(args) {
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

function publicEvidence(fetchResult, parsed, matches, checkedAt) {
  return {
    checked_url: fetchResult.checkedUrl ?? null,
    final_url: fetchResult.finalUrl ?? null,
    checked_at: checkedAt,
    http_status: fetchResult.httpStatus ?? null,
    content_type: fetchResult.contentType ?? null,
    redirects: fetchResult.redirects ?? 0,
    external_redirects: fetchResult.externalRedirects ?? 0,
    ads_txt_sha256: fetchResult.sha256 ?? null,
    parser_version: parsed?.parserVersion ?? null,
    matcher_version: MATCHER_VERSION,
    seller_records: parsed?.sellers.length ?? null,
    manager_domains: parsed?.managerDomains.map(({ value, country }) => ({ value, country: country ?? null })) ?? [],
    parse_errors: parsed?.errors.length ?? null,
    confirmed_networks: matches?.confirmed.map((match) => match.slug) ?? [],
    review_networks: matches?.review.map((match) => match.slug) ?? [],
    reason: fetchResult.reason ?? null,
  };
}

async function verifyPublisher(publisher, networks) {
  const checkedAt = new Date().toISOString();
  const mayUseConditional = publisher.last_check_evidence?.parser_version === PARSER_VERSION
    && publisher.last_check_evidence?.matcher_version === MATCHER_VERSION;
  let fetchResult = await fetchAdsTxt(publisher.normalized_domain, {
    etag: mayUseConditional ? publisher.ads_txt_etag : null,
    lastModified: mayUseConditional ? publisher.ads_txt_last_modified : null,
  });

  if (fetchResult.outcome !== "parsed") {
    if (fetchResult.outcome === "no_ads_txt") {
      const emptyParsed = parseAdsTxt("");
      const pageOnlyNetworks = networks.filter((network) => (network.program_signatures ?? [])
        .some((signature) => signature.kind === "html_substring" && signature.allow_without_ads_txt));
      if (needsHomepage(emptyParsed, pageOnlyNetworks, publisher.discovery_sources)) {
        const homepage = await fetchHomepage(publisher.normalized_domain).catch(() => null);
        const matches = matchNetworks({
          parsed: emptyParsed,
          networks: pageOnlyNetworks,
          fetchEvidence: { ...fetchResult, checkedAt },
          homepage,
          discoverySources: publisher.discovery_sources,
        });
        if (matches.confirmed.length) {
          return {
            outcome: "matched",
            checkedAt,
            matches,
            evidence: publicEvidence(fetchResult, emptyParsed, matches, checkedAt),
            etag: fetchResult.etag,
            lastModified: fetchResult.lastModified,
          };
        }
      }
    }
    const unchangedSlugs = fetchResult.outcome === "not_modified"
      ? publisher.last_check_evidence?.confirmed_networks ?? []
      : [];
    const unchangedNetworkIds = networks
      .filter((network) => unchangedSlugs.includes(network.slug))
      .map((network) => network.id);
    const evidence = publicEvidence(fetchResult, null, null, checkedAt);
    if (fetchResult.outcome === "not_modified") {
      evidence.ads_txt_sha256 = publisher.ads_txt_hash ?? publisher.last_check_evidence?.ads_txt_sha256 ?? null;
      evidence.parser_version = publisher.last_check_evidence?.parser_version ?? null;
      evidence.matcher_version = publisher.last_check_evidence?.matcher_version ?? MATCHER_VERSION;
      evidence.seller_records = publisher.last_check_evidence?.seller_records ?? null;
      evidence.manager_domains = publisher.last_check_evidence?.manager_domains ?? [];
      evidence.parse_errors = publisher.last_check_evidence?.parse_errors ?? null;
      evidence.confirmed_networks = unchangedSlugs;
      evidence.review_networks = publisher.last_check_evidence?.review_networks ?? [];
    }
    return {
      outcome: fetchResult.outcome,
      checkedAt,
      evidence,
      unchangedNetworkIds,
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
    };
  }

  let parsed = parseAdsTxt(fetchResult.text);
  const registrableDomain = getDomain(publisher.normalized_domain, { allowPrivateDomains: true });
  if (
    registrableDomain
    && publisher.normalized_domain !== registrableDomain
    && parsed.subdomains.some((entry) => entry.value === publisher.normalized_domain)
  ) {
    const subdomainResult = await fetchDeclaredSubdomainAdsTxt(publisher.normalized_domain);
    if (subdomainResult.outcome !== "parsed") {
      return {
        outcome: subdomainResult.outcome,
        checkedAt,
        evidence: publicEvidence(subdomainResult, null, null, checkedAt),
        etag: subdomainResult.etag,
        lastModified: subdomainResult.lastModified,
      };
    }
    fetchResult = subdomainResult;
    parsed = parseAdsTxt(fetchResult.text);
  }

  if (!parsed.sellers.length && !parsed.variables.length && parsed.errors.length) {
    fetchResult.reason = "no_valid_ads_txt_records";
    return {
      outcome: "invalid_ads_txt",
      checkedAt,
      evidence: publicEvidence(fetchResult, parsed, null, checkedAt),
      sha256: fetchResult.sha256,
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
    };
  }

  const homepage = needsHomepage(parsed, networks, publisher.discovery_sources)
    ? await fetchHomepage(publisher.normalized_domain).catch(() => null)
    : null;
  const evidenceInput = { ...fetchResult, checkedAt };
  const matches = matchNetworks({
    parsed,
    networks,
    fetchEvidence: evidenceInput,
    homepage,
    discoverySources: publisher.discovery_sources,
  });
  const outcome = matches.confirmed.length ? "matched" : "no_match";
  return {
    outcome,
    checkedAt,
    matches,
    evidence: publicEvidence(fetchResult, parsed, matches, checkedAt),
    sha256: fetchResult.sha256,
    etag: fetchResult.etag,
    lastModified: fetchResult.lastModified,
  };
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
    while (cursor < publishers.length) {
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
        console.log(JSON.stringify({ status: "progress", processed: summary.processed, outcomes: summary.outcomes }));
      }
    }
  });
  await Promise.all(workers);
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
    while (summary.attempted < limit && Date.now() < deadline) {
      const batchSize = Math.min(concurrency * 4, limit - summary.attempted);
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
