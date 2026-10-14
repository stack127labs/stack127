#!/usr/bin/env node

/**
 * Fetches every external reference dataset the domain tools depend on and writes
 * committed JSON into lib/domain/data/. Nothing here runs at request time.
 *
 * Sources, all public and stable:
 *   IANA RDAP bootstrap (dns, ipv4, ipv6, asn)  endpoint discovery
 *   IANA root zone TLD list                     coverage denominator
 *   IANA port-43 WHOIS                          discovery for RDAP gaps (serial)
 *   Public Suffix List                          registrable-domain reduction
 *   Unicode IdnaMappingTable + Scripts          IDN conversion and script checks
 *
 * Run: npm run domain-tools:refresh-datasets
 * Pass --check to fail when a committed file is out of date instead of writing.
 * --whois-only refreshes discovery; --whois-retry-failed resumes interrupted
 * discovery; --skip-whois refreshes HTTP datasets without a port-43 scan.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readWhois } from "../../lib/domain/whois-transport.ts";
import { parseIanaDomain, parseIanaWhoisServer } from "./iana-whois.mjs";

const root = process.cwd();
const dataDir = path.join(root, "lib/domain/data");
const checkOnly = process.argv.includes("--check");
const fetchedAt = new Date().toISOString().slice(0, 10);
const whoisOnly = process.argv.includes("--whois-only");
const skipWhois = process.argv.includes("--skip-whois");

const UNICODE_VERSION = "16.0.0";

const SOURCES = {
  rdapDns: "https://data.iana.org/rdap/dns.json",
  rdapIpv4: "https://data.iana.org/rdap/ipv4.json",
  rdapIpv6: "https://data.iana.org/rdap/ipv6.json",
  rdapAsn: "https://data.iana.org/rdap/asn.json",
  tlds: "https://data.iana.org/TLD/tlds-alpha-by-domain.txt",
  psl: "https://publicsuffix.org/list/public_suffix_list.dat",
  idnaMapping: `https://www.unicode.org/Public/idna/${UNICODE_VERSION}/IdnaMappingTable.txt`,
  scripts: `https://www.unicode.org/Public/${UNICODE_VERSION}/ucd/Scripts.txt`,
};

async function get(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Stack127-domain-tools/1.0 (+https://stack127.com)" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

/**
 * The Unicode range tables are large and are shipped to the browser as a lazily
 * imported chunk, so they are written compactly. Everything else stays readable
 * because a human reviews its diff.
 */
const COMPACT = new Set(["idna-mapping.json", "unicode-scripts.json"]);

async function emit(name, value) {
  const file = path.join(dataDir, name);
  const next = COMPACT.has(name)
    ? `${JSON.stringify(value)}\n`
    : `${JSON.stringify(value, null, 2)}\n`;
  let current = null;
  try { current = await readFile(file, "utf8"); } catch {}

  // The fetch date changes on every run and would make --check permanently dirty,
  // so compare everything except that field.
  const strip = (text) => JSON.stringify({ ...JSON.parse(text), fetchedAt: undefined });
  if (current !== null && strip(current) === strip(next)) {
    console.log(`  unchanged  ${name}`);
    return false;
  }
  if (checkOnly) {
    console.error(`  STALE      ${name}`);
    return true;
  }
  await writeFile(file, next);
  console.log(`  wrote      ${name}`);
  return false;
}

/** The bootstrap maps many TLDs to one service; flatten to tld -> base URL. */
function flattenBootstrap(raw) {
  const parsed = JSON.parse(raw);
  const map = {};
  for (const [keys, urls] of parsed.services) {
    // Prefer https and a trailing slash so URL joining is predictable.
    const base = urls.find((url) => url.startsWith("https://")) ?? urls[0];
    if (!base) continue;
    const normalized = base.endsWith("/") ? base : `${base}/`;
    for (const key of keys) map[key.toLowerCase()] = normalized;
  }
  return { publication: parsed.publication, services: map };
}

/** Range bootstraps (ipv4, ipv6, asn) keep their key list; the ranges need parsing at use time. */
function rangeBootstrap(raw) {
  const parsed = JSON.parse(raw);
  return {
    publication: parsed.publication,
    services: parsed.services.map(([keys, urls]) => {
      const base = urls.find((url) => url.startsWith("https://")) ?? urls[0];
      return { keys, url: base.endsWith("/") ? base : `${base}/` };
    }),
  };
}

function parseTlds(raw) {
  const lines = raw.split("\n");
  const version = lines[0]?.match(/Version (\d+)/)?.[1] ?? null;
  const tlds = lines
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);
  return { version, tlds };
}

/**
 * Public Suffix List, ICANN section only.
 *
 * The PRIVATE DOMAINS section would make github.io a suffix, so myproject.github.io
 * would reduce to itself and we would query a registry for a name that has no
 * registration. That is the wrong answer for every tool here, so it is excluded
 * deliberately. See stack127_docs/rdap.md.
 */
function parsePsl(raw) {
  const rules = [];
  let inIcann = false;
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("// ===BEGIN ICANN DOMAINS===")) { inIcann = true; continue; }
    if (trimmed.startsWith("// ===END ICANN DOMAINS===")) { inIcann = false; continue; }
    if (!inIcann || !trimmed || trimmed.startsWith("//")) continue;
    rules.push(trimmed);
  }
  const exceptions = rules.filter((rule) => rule.startsWith("!")).map((rule) => rule.slice(1));
  const wildcards = rules.filter((rule) => rule.startsWith("*.")).map((rule) => rule.slice(2));
  const normal = rules.filter((rule) => !rule.startsWith("!") && !rule.startsWith("*."));
  return { exceptions, normal, wildcards };
}

/** Collapse consecutive code points sharing a value into [start, end, value] triples. */
function toRanges(entries) {
  entries.sort((a, b) => a[0] - b[0]);
  const ranges = [];
  for (const [start, end, value] of entries) {
    const last = ranges[ranges.length - 1];
    if (last && last[1] + 1 === start && last[2] === value) last[1] = end;
    else ranges.push([start, end, value]);
  }
  return ranges;
}

/**
 * UTS-46 mapping table. Statuses we keep:
 *   valid, ignored, disallowed, deviation  no mapping data needed
 *   mapped, disallowed_STD3_mapped         carry the replacement code points
 * Everything is kept, not a subset: a partial table looks identical to a complete
 * one on ordinary input and is silently wrong on exactly the adversarial input
 * this tooling exists to examine.
 */
function parseIdnaMapping(raw) {
  const entries = [];
  for (const line of raw.split("\n")) {
    const body = line.split("#")[0].trim();
    if (!body) continue;
    const fields = body.split(";").map((field) => field.trim());
    const [range, status, mapping] = fields;
    const [startHex, endHex] = range.split("..");
    const start = parseInt(startHex, 16);
    const end = endHex ? parseInt(endHex, 16) : start;
    let value = status;
    if ((status === "mapped" || status === "disallowed_STD3_mapped") && mapping) {
      value = `${status}:${mapping.split(" ").filter(Boolean).join(",")}`;
    }
    entries.push([start, end, value]);
  }
  return toRanges(entries);
}

function parseScripts(raw) {
  const entries = [];
  for (const line of raw.split("\n")) {
    const body = line.split("#")[0].trim();
    if (!body) continue;
    const [range, script] = body.split(";").map((field) => field.trim());
    const [startHex, endHex] = range.split("..");
    const start = parseInt(startHex, 16);
    const end = endHex ? parseInt(endHex, 16) : start;
    entries.push([start, end, script]);
  }
  return toRanges(entries);
}

async function main() {
  console.log(checkOnly ? "Checking committed datasets" : "Refreshing committed datasets");

  if (whoisOnly) {
    const bootstrap = JSON.parse(await readFile(path.join(dataDir, "rdap-bootstrap.json"), "utf8"));
    const tldList = JSON.parse(await readFile(path.join(dataDir, "tlds.json"), "utf8"));
    if (await refreshWhois(bootstrap, tldList)) process.exitCode = 1;
    return;
  }

  const [dns, ipv4, ipv6, asn, tlds, psl, idna, scripts] = await Promise.all([
    get(SOURCES.rdapDns), get(SOURCES.rdapIpv4), get(SOURCES.rdapIpv6), get(SOURCES.rdapAsn),
    get(SOURCES.tlds), get(SOURCES.psl), get(SOURCES.idnaMapping), get(SOURCES.scripts),
  ]);

  const bootstrap = flattenBootstrap(dns);
  const tldList = parseTlds(tlds);

  let stale = false;
  stale = await emit("rdap-bootstrap.json", { source: SOURCES.rdapDns, fetchedAt, ...bootstrap }) || stale;
  stale = await emit("rdap-bootstrap-ip.json", {
    fetchedAt,
    ipv4: rangeBootstrap(ipv4),
    ipv6: rangeBootstrap(ipv6),
    asn: rangeBootstrap(asn),
  }) || stale;
  stale = await emit("tlds.json", { source: SOURCES.tlds, fetchedAt, ...tldList }) || stale;
  stale = await emit("public-suffix.json", {
    source: SOURCES.psl,
    fetchedAt,
    section: "ICANN",
    ...parsePsl(psl),
  }) || stale;
  stale = await emit("idna-mapping.json", {
    source: SOURCES.idnaMapping,
    unicodeVersion: UNICODE_VERSION,
    fetchedAt,
    ranges: parseIdnaMapping(idna),
  }) || stale;
  stale = await emit("unicode-scripts.json", {
    source: SOURCES.scripts,
    unicodeVersion: UNICODE_VERSION,
    fetchedAt,
    ranges: parseScripts(scripts),
  }) || stale;

  // An IANA entry always wins. Retire reviewed URLs when the bootstrap catches up.
  const overrideData = JSON.parse(await readFile(path.join(dataDir, "rdap-overrides.json"), "utf8"));
  for (const tld of Object.keys(overrideData.overrides)) {
    if (bootstrap.services[tld]) delete overrideData.overrides[tld];
  }
  stale = await emit("rdap-overrides.json", overrideData) || stale;
  if (!skipWhois) stale = await refreshWhois(bootstrap, tldList) || stale;

  const covered = tldList.tlds.filter((tld) => bootstrap.services[tld]).length;
  console.log(`\nRoot zone TLDs: ${tldList.tlds.length}`);
  console.log(`With an IANA bootstrap RDAP entry: ${covered}`);
  console.log(`Without one: ${tldList.tlds.length - covered} (some are covered by reviewed overrides)`);

  if (stale) {
    console.error("\nCommitted datasets are out of date. Run without --check to update.");
    process.exit(1);
  }
}

/** Discovery is not permission to query a registry; whois-reviewed.json owns that. */
async function refreshWhois(bootstrap, tldList) {
  const { overrides } = JSON.parse(await readFile(path.join(dataDir, "rdap-overrides.json"), "utf8"));
  const gaps = tldList.tlds.filter(tld => !bootstrap.services[tld] && !overrides[tld]);
  const reviewed = JSON.parse(await readFile(path.join(dataDir, "whois-reviewed.json"), "utf8"));
  // Retire fallback profiles when RDAP takes over; discovery never creates one.
  for (const tld of Object.keys(reviewed.services)) {
    if (!gaps.includes(tld)) delete reviewed.services[tld];
  }
  const reviewedStale = await emit("whois-reviewed.json", reviewed);
  let services = {};
  if (process.argv.includes("--whois-retry-failed")) {
    const prior = JSON.parse(await readFile(path.join(dataDir, "whois-servers.json"), "utf8"));
    services = Object.fromEntries(Object.entries(prior.services).filter(([tld]) => gaps.includes(tld)));
  }
  const failedTlds = [];
  for (const [index, tld] of gaps.entries()) {
    if (Object.hasOwn(services, tld)) continue;
    try {
      const raw = await readWhois("whois.iana.org", tld, { timeoutMs: 8_000 });
      // An empty, throttled or unrelated answer is not an empty whois field.
      const returnedTld = parseIanaDomain(raw);
      if (returnedTld !== tld) throw new Error("iana_non_answer");
      services[tld] = parseIanaWhoisServer(raw);
    } catch {
      failedTlds.push(tld);
    }
    if ((index + 1) % 20 === 0) console.log(`  IANA WHOIS ${index + 1}/${gaps.length}`);
    // Parallel IANA queries are throttled hard. Keep this serial, including failures.
    await new Promise(resolve => setTimeout(resolve, 700));
  }
  const stale = await emit("whois-servers.json", { source: "whois.iana.org:43", fetchedAt,
    comment: "IANA discovery only. A server is enabled only by whois-reviewed.json.",
    services: Object.fromEntries(Object.entries(services).sort(([a], [b]) => a.localeCompare(b))), failedTlds });
  console.log(`IANA WHOIS servers: ${Object.values(services).filter(Boolean).length}; failed queries: ${failedTlds.length}`);
  if (failedTlds.length) throw new Error(`IANA WHOIS discovery incomplete: ${failedTlds.join(", ")}. Retry before committing.`);
  return stale || reviewedStale;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
