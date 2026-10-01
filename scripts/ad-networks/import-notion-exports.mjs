#!/usr/bin/env node

import { basename } from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { createLocalDiscoveryStore } from "./local-discovery-store.mjs";
import { defaultLocalDatabasePath, openLocalDatabase } from "./local-db.mjs";
import { normalizeDomain } from "./lib.mjs";
import { networkIdentities } from "./network-identities.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    apply: { type: "boolean", default: false },
    "local-database": { type: "string", default: defaultLocalDatabasePath },
  },
});
if (!positionals.length) throw new Error("Pass one or more Notion CSV export ZIP paths");

function csvRecords(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value.length)) rows.push(row);
      row = [];
    } else field += character;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function zipCsv(zipPath) {
  const listing = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  if (listing.status !== 0) throw new Error(`Could not list ${zipPath}: ${listing.stderr.trim()}`);
  const entries = listing.stdout.split(/\r?\n/).filter((name) => name.toLowerCase().endsWith(".csv"));
  const entry = entries.find((name) => !/_all\.csv$/i.test(name)) ?? entries[0];
  if (!entry) throw new Error(`${zipPath} contains no CSV file`);
  const extracted = spawnSync("unzip", ["-p", zipPath, entry], { encoding: "utf8", maxBuffer: 100 * 1024 * 1024 });
  if (extracted.status !== 0) throw new Error(`Could not read ${entry}: ${extracted.stderr.trim()}`);
  return { entry, text: extracted.stdout.replace(/^\uFEFF/, "") };
}

function slugify(value) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const networkAliases = new Map();
for (const network of networkIdentities) {
  networkAliases.set(slugify(network.name), network.slug);
  networkAliases.set(network.slug, network.slug);
}
networkAliases.set("journey", "journey-by-mediavine");
networkAliases.set("media-net", "media-net");
networkAliases.set("anymind-anymanager", "anymind-anymanager");

function sourceFor(record, fallbackKey) {
  const network = networkAliases.get(slugify(record["Ad Network"] ?? ""));
  const sourceUrl = (record["Source / Discovery"] ?? "").trim() || null;
  if (network) return { key: `notion-import:${network}`, url: sourceUrl, networkSlug: network };
  if (sourceUrl) {
    try {
      const host = new URL(/^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`).hostname.toLowerCase();
      return { key: `notion-list:${host}`, url: sourceUrl };
    } catch {}
  }
  return { key: fallbackKey, url: null };
}

const database = values.apply ? openLocalDatabase(values["local-database"]) : null;
const store = database ? createLocalDiscoveryStore(database) : null;
const totals = { files: 0, rows: 0, validDomains: 0, invalidDomains: 0, newDomains: 0, newSightings: 0 };
try {
  for (const zipPath of positionals) {
    const { entry, text } = zipCsv(zipPath);
    const rows = csvRecords(text);
    const headers = rows.shift()?.map((header) => header.replace(/^\uFEFF/, "").trim()) ?? [];
    const groups = new Map();
    const fallbackKey = `notion-export:${slugify(basename(entry, ".csv"))}`;
    for (const cells of rows) {
      totals.rows += 1;
      const record = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
      const supplied = record.Domain?.trim() || record.Website?.trim();
      const domain = normalizeDomain(supplied);
      if (!domain) {
        totals.invalidDomains += 1;
        continue;
      }
      totals.validDomains += 1;
      const source = sourceFor(record, fallbackKey);
      const groupKey = `${source.key}\u0000${source.url ?? ""}`;
      if (!groups.has(groupKey)) groups.set(groupKey, { source, candidates: new Map() });
      groups.get(groupKey).candidates.set(domain, { domain, supplied });
    }
    if (store) {
      const seenAt = new Date().toISOString();
      for (const { source, candidates } of groups.values()) {
        const result = store.upsertBatch({
          key: source.key,
          url: source.url,
          kind: "notion-export",
          networkSlug: source.networkSlug,
        }, [...candidates.values()], seenAt);
        totals.newDomains += result.inserted;
        totals.newSightings += result.newSightings;
      }
    }
    totals.files += 1;
    console.log(JSON.stringify({ zip: zipPath, entry, rows: rows.length, groups: groups.size }));
  }
} finally {
  database?.close();
}
console.log(JSON.stringify({ mode: values.apply ? "applied" : "dry_run", ...totals }));
