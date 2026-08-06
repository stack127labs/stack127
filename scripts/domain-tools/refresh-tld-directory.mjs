#!/usr/bin/env node

/**
 * Builds the committed dataset behind /tld-directory.
 *
 * Three sources, all public:
 *   IANA root zone database  type and sponsoring organisation (HTML, parsed)
 *   The root zone file       which endings are signed, from real DS records
 *   Our committed bootstrap  whether we can look the ending up at all
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
    headers: { "user-agent": "Version127-domain-tools/1.0 (+https://version127.com)" },
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

/**
 * IANA renders one row per TLD: name, type, sponsoring organisation.
 *
 * The A-label comes from the row's link href rather than from the visible text.
 * Right-to-left endings are displayed wrapped in bidi control marks, so
 * ".ישראל" arrives as U+200F + ".ישראל" + U+200E and does not convert back to its
 * A-label. The href is unambiguous, so use that and keep the cleaned display name
 * only for showing to a reader.
 */
function parseRootDb(html) {
  const rows = html.match(/<tr>([\s\S]*?)<\/tr>/g) ?? [];
  const entries = [];
  for (const row of rows) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)];
    if (cells.length < 3) continue;
    const [nameCell, typeCell, organisationCell] = cells.map((match) => match[1]);

    const href = nameCell.match(/\/domains\/root\/db\/([^."]+)\.html/);
    const displayed = stripTags(nameCell)
      // Strip the bidi control characters IANA wraps RTL names in.
      .replace(/[‎‏‪-‮⁦-⁩]/g, "")
      .replace(/^\./, "")
      .trim();

    const tld = (href?.[1] ?? displayed).toLowerCase();
    if (!tld) continue;

    const type = stripTags(typeCell);
    const organisation = stripTags(organisationCell);

    entries.push({
      tld,
      displayed: displayed && displayed !== tld ? displayed : null,
      type,
      // IANA writes "Not assigned" for delegated-but-unused endings.
      organisation: organisation && organisation !== "Not assigned" ? organisation : null,
      assigned: organisation !== "Not assigned",
    });
  }
  return entries;
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

  const iana = parseRootDb(rootDbHtml);
  if (iana.length < MIN_EXPECTED_ROWS) {
    throw new Error(
      `Only parsed ${iana.length} rows from the IANA root database, expected at least ${MIN_EXPECTED_ROWS}. ` +
        "The page layout has probably changed. Refusing to write a partial dataset.",
    );
  }

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
      rdapCovered: rows.filter((row) => row.rdap !== "none").length,
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
  console.log(`We can look up: ${payload.counts.rdapCovered}`);
  console.log(`Delegated but not assigned: ${payload.counts.unassigned}`);
  if (missingType) console.log(`No type from IANA: ${missingType}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
