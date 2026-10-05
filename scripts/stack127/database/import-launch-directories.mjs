#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { parseArgs, requireArg, runMutation, printResult } from "../tool-pages/lib.mjs";
import { validateLaunchDirectoryUpdates } from "./update-launch-directories.mjs";
import { validateLaunchPublication } from "./publish-launch-directories.mjs";

const fields = [
  "slug", "name", "website_url", "submit_url", "submission_status", "categories",
  "summary", "best_for", "cost_kind", "cost_label", "cost_tag", "cost_note",
  "review_time_label", "link_type_kind", "link_type_label", "eligibility_label",
  "example_listing_url", "sources", "research_notes", "evidence", "checked_on", "is_published",
];
const identityFields = new Set(["slug", "name", "categories", "is_published"]);
const categories = new Set([
  "launch-boards", "prelaunch-beta", "startup-software", "software-reviews-alternatives",
  "ai-tools", "developer-open-source", "design-nocode-creator", "specialist-regional",
]);
const costs = new Set(["free", "free_and_paid", "paid", "unknown"]);
const links = new Set(["dofollow", "nofollow", "ugc", "sponsored", "multiple", "varies", "estimated_nofollow", "none", "unknown"]);

function host(row) {
  return new URL(row.website_url).hostname.toLowerCase().replace(/^www\./, "");
}

export function validateLaunchDirectoryRecords(records) {
  if (!Array.isArray(records) || !records.length || records.length > 50) throw new Error("Expected 1 to 50 new listing records");
  const hosts = new Set();
  for (const row of records) {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("Invalid listing record");
    for (const field of Object.keys(row)) if (!fields.includes(field)) throw new Error(`Unexpected field ${field}`);
    for (const field of fields) if (!Object.hasOwn(row, field)) throw new Error(`Missing ${field} for ${row.slug}`);
    if (typeof row.name !== "string" || !row.name.trim() || row.name !== row.name.trim()) throw new Error(`Invalid name for ${row.slug}`);
    if (row.is_published !== true) throw new Error(`New listing must be reviewed for publication: ${row.slug}`);
    if (!Array.isArray(row.categories) || !row.categories.length || new Set(row.categories).size !== row.categories.length || row.categories.some(value => !categories.has(value))) throw new Error(`Invalid categories for ${row.slug}`);
    if (!costs.has(row.cost_kind) || !links.has(row.link_type_kind)) throw new Error(`Invalid cost or link kind for ${row.slug}`);
    for (const key of ["submission", "cost", "review_time", "eligibility", "link_type"]) {
      const source = row.evidence?.[key];
      if (!source || typeof source !== "object" || Array.isArray(source)
        || typeof source.source_url !== "string" || typeof source.checked_at !== "string"
        || !["status", "method", "note"].every(field => typeof source[field] === "string" && source[field].trim())) throw new Error(`Missing ${key} evidence for ${row.slug}`);
    }
  }
  validateLaunchDirectoryUpdates(records.map(row => ({ slug: row.slug, changes: Object.fromEntries(Object.entries(row).filter(([key]) => !identityFields.has(key))) })));
  validateLaunchPublication(records);
  for (const row of records) {
    const domain = host(row);
    if (hosts.has(domain)) throw new Error(`Duplicate website host: ${domain}`);
    hosts.add(domain);
  }
  return records;
}

export async function importLaunchDirectoryRecords(client, records) {
  validateLaunchDirectoryRecords(records);
  // Serialize the collision check and insert, including concurrent editorial updates.
  await client.query("lock table public.launch_directories in share row exclusive mode");
  const existing = (await client.query("select to_jsonb(directory) as record from public.launch_directories directory")).rows.map(row => row.record);
  const slugs = new Map(existing.map(row => [row.slug, row]));
  const hosts = new Map(existing.map(row => [host(row), row.slug]));
  const inserts = [];
  const skipped = [];
  for (const row of records) {
    const previous = slugs.get(row.slug);
    if (previous) {
      if (!fields.every(field => isDeepStrictEqual(previous[field], row[field]))) throw new Error(`Existing listing differs from the reviewed record: ${row.slug}`);
      skipped.push(row.slug);
      continue;
    }
    if (hosts.has(host(row))) throw new Error(`Website already listed as ${hosts.get(host(row))}: ${row.slug}`);
    inserts.push(row);
  }
  if (inserts.length) {
    const columns = fields.map(field => `"${field}"`).join(", ");
    const result = await client.query(`insert into public.launch_directories (${columns})
      select ${columns} from jsonb_populate_recordset(null::public.launch_directories, $1::jsonb)`, [JSON.stringify(inserts)]);
    if (result.rowCount !== inserts.length) throw new Error("The listing insert count changed during the transaction");
  }
  return { inserted_count: inserts.length, inserted: inserts.map(row => row.slug), skipped };
}

async function main() {
  const args = parseArgs();
  const records = validateLaunchDirectoryRecords(JSON.parse(readFileSync(requireArg(args, "input-file"), "utf8")));
  printResult(await runMutation(args, client => importLaunchDirectoryRecords(client, records)));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
