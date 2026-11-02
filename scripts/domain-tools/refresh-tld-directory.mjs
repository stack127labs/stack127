#!/usr/bin/env node

/**
 * Builds the committed dataset behind /tld-directory.
 *
 * Three sources, all public:
 *   IANA root zone database  type and sponsoring organisation (HTML, parsed)
 *   The root zone file       which endings are signed, from real DS records
 *   Our committed services   RDAP bootstrap, reviewed RDAP and reviewed WHOIS
 *
 * The root zone file is used rather than 1,438 individual DS queries: it is one
 * fetch and it is the same data the queries would return.
 *
 * The IANA HTML parse is the fragile part of this pipeline, so it fails loudly
 * rather than writing a partial file. Rows going stale is recoverable; rows going
 * silently wrong is not.
 *
 * Run: npm run domain-tools:refresh-tld-directory
 * Pass --check to fail when the committed file is out of date.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outFile = path.join(root, "lib/domain/data/tld-directory.json");
const checkOnly = process.argv.includes("--check");
const fetchedAt = new Date().toISOString().slice(0, 10);

const SOURCES = {
  rootDb: "https://www.iana.org/domains/root/db",
  rootZone: "https://www.internic.net/domain/root.zone",
};

/** Below this many parsed rows something has changed at IANA and we should stop. */
const MIN_EXPECTED_ROWS = 1200;

async function get(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Stack127-domain-tools/1.0 (+https://stack127.com)" },
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

function stripTags(value) {
  return value
    .replace(/<[^>]+>/g, "")
    // Numeric entities have to be decoded before the bidi marks can be stripped:
    // IANA writes the RTL wrappers as &#x200f; rather than as literal characters.
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const KNOWN_TYPES = new Set([
  "generic", "country-code", "sponsored", "infrastructure", "generic-restricted", "test",
]);

/**
 * Current columns: TLD, Status, Type, TLD Manager / Purpose, then script metadata.
 * Only the anchor's leading text is the display name; its children contain icons,
 * script pills and the A-label. The href is the authority for the ASCII name.
 */
export function parseRootDb(html, requiredTlds = null) {
  const required = requiredTlds === null ? null : new Set(requiredTlds);
  const headers = [...html.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)]
    .slice(0, 4).map((match) => stripTags(match[1]));
  if (headers.join("|") !== "TLD|Status|Type|TLD Manager / Purpose") {
    throw new Error("IANA root database columns changed. Refusing to write a partial dataset.");
  }

  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  const entries = [];
  for (const row of rows) {
    if (!row.includes("/domains/root/db/")) continue;
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1]);
    const [nameCell = "", statusCell = "", typeCell = "", organisationCell = ""] = cells;
    const link = nameCell.match(/<a\b[^>]*href=["']\/domains\/root\/db\/([a-z0-9-]+)(?:\.html)?["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!link || cells.length < 4) {
      throw new Error("Malformed IANA root database row. Refusing to write a partial dataset.");
    }
    const tld = link[1].toLowerCase();
    // IANA also lists retired and eligible names, sometimes without managers.
    // Validate every current root-zone ending, not those historical records.
    if (required && !required.has(tld)) continue;
    const displayed = stripTags(link[2].split("<")[0])
      .replace(/[‎‏‪-‮⁦-⁩]/g, "")
      .trim().replace(/^\.|\.$/g, "");
    if (!displayed) throw new Error(`Missing IANA display name for .${tld}. Refusing to write.`);

    const rawType = stripTags(typeCell).toLowerCase();
    // The new table includes reserved names outside the root zone. They are not
    // TLDs in this dataset. .arpa is the active Special Use (infrastructure) row.
    if (rawType === "special use" && stripTags(statusCell) === "Reserved") continue;
    const type = rawType === "country code" ? "country-code"
      : rawType === "special use" && tld === "arpa" ? "infrastructure" : rawType;
    const organisation = stripTags(organisationCell);
    entries.push({
      tld,
      displayed: displayed !== tld ? displayed : null,
      type,
      organisation: organisation === "Not assigned" ? null : organisation,
      assigned: organisation !== "Not assigned",
    });
  }
  validateRootDb(entries);
  return entries;
}

/** Validate both parsed facts and coverage before the caller can write anything. */
export function validateRootDb(entries, requiredTlds = []) {
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.tld)) throw new Error(`Duplicate IANA row for .${entry.tld}. Refusing to write.`);
    seen.add(entry.tld);
    if (!KNOWN_TYPES.has(entry.type)) {
      throw new Error(`Invalid IANA type for .${entry.tld}: "${entry.type}". Refusing to write.`);
    }
    if (!entry.organisation && !(entry.organisation === null && entry.assigned === false)) {
      throw new Error(`Missing IANA organisation for .${entry.tld}. Refusing to write.`);
    }
  }
  const missing = requiredTlds.filter((tld) => !seen.has(tld));
  if (missing.length) throw new Error(`Missing IANA rows for: ${missing.join(", ")}. Refusing to write a partial dataset.`);
}

/** Every TLD with at least one DS record in the root is signed. */
function parseSignedTlds(zone) {
  const signed = new Set();
  for (const line of zone.split("\n")) {
    if (!line || line.startsWith(";")) continue;
    const fields = line.split(/\s+/);
    if (fields[3] !== "DS") continue;
    const owner = fields[0].replace(/\.$/, "").toLowerCase();
    if (owner) signed.add(owner);
  }
  return signed;
}

async function main() {
  console.log(checkOnly ? "Checking the TLD directory dataset" : "Refreshing the TLD directory dataset");

  const [{ rdapServiceForTld }, { default: tldData }] = await Promise.all([
    import("../../lib/domain/bootstrap.ts"),
    import("../../lib/domain/data/tlds.json", { with: { type: "json" } }),
  ]);

  const [rootDbHtml, rootZone] = await Promise.all([get(SOURCES.rootDb), get(SOURCES.rootZone)]);

  const iana = parseRootDb(rootDbHtml, tldData.tlds);
  if (iana.length < MIN_EXPECTED_ROWS) {
    throw new Error(
      `Only parsed ${iana.length} rows from the IANA root database, expected at least ${MIN_EXPECTED_ROWS}. ` +
        "The page layout has probably changed. Refusing to write a partial dataset.",
    );
  }

  validateRootDb(iana, tldData.tlds);

  const signed = parseSignedTlds(rootZone);
  if (signed.size < 500) {
    throw new Error(`Only found ${signed.size} signed endings in the root zone, which looks wrong. Refusing to write.`);
  }

  const ianaByTld = new Map(iana.map((entry) => [entry.tld, entry]));
  const rows = [];

  // The root zone list is the authority on which endings exist right now.
  for (const tld of tldData.tlds) {
    const info = ianaByTld.get(tld) ?? null;
    const coverage = rdapServiceForTld(tld);
    rows.push({
      tld,
      unicode: info?.displayed ?? null,
      type: info?.type ?? null,
      organisation: info?.organisation ?? null,
      assigned: info?.assigned ?? null,
      rdap: coverage.source,
      rdapOperator: coverage.operator,
      lookupSource: coverage.source,
      lookupHost: coverage.host,
      dnssec: signed.has(tld),
      isIdn: tld.startsWith("xn--"),
    });
  }

  const missingType = rows.filter((row) => !row.type).length;
  const payload = {
    sources: SOURCES,
    fetchedAt,
    tldListVersion: tldData.version,
    counts: {
      total: rows.length,
      signed: rows.filter((row) => row.dnssec).length,
      rdapCovered: rows.filter((row) => row.lookupSource === "bootstrap" || row.lookupSource === "override").length,
      whoisCovered: rows.filter((row) => row.lookupSource === "whois").length,
      lookupCovered: rows.filter((row) => row.lookupSource !== "none").length,
      uncovered: rows.filter((row) => row.lookupSource === "none").length,
      unassigned: rows.filter((row) => row.assigned === false).length,
      missingType,
    },
    rows,
  };

  const next = `${JSON.stringify(payload, null, 2)}\n`;
  let current = null;
  try {
    current = await readFile(outFile, "utf8");
  } catch {}

  const strip = (text) => text.replace(/"fetchedAt": "[^"]*",?\n/, "");
  if (current !== null && strip(current) === strip(next)) {
    console.log("  unchanged  tld-directory.json");
  } else if (checkOnly) {
    console.error("  STALE      tld-directory.json");
    process.exit(1);
  } else {
    await writeFile(outFile, next);
    console.log("  wrote      tld-directory.json");
  }

  console.log(`\nEndings: ${payload.counts.total}`);
  console.log(`Signed with DNSSEC: ${payload.counts.signed}`);
  console.log(`We can look up: ${payload.counts.lookupCovered} (${payload.counts.rdapCovered} RDAP, ${payload.counts.whoisCovered} WHOIS)`);
  console.log(`Delegated but not assigned: ${payload.counts.unassigned}`);
  if (missingType) console.log(`No type from IANA: ${missingType}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
