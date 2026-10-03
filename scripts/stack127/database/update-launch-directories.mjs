#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { parseArgs, requireArg, runMutation, printResult } from "../tool-pages/lib.mjs";
import { launchDirectoryDate, latestLaunchEvidenceDate } from "../../../lib/launch-directories-data.ts";

const fields = new Set([
  "website_url", "submit_url", "submission_status", "summary", "best_for", "cost_kind",
  "cost_label", "cost_tag", "cost_note", "review_time_label", "link_type_kind", "link_type_label", "eligibility_label",
  "example_listing_url", "sources", "research_notes", "evidence", "checked_on",
]);
const nullable = new Set(["submit_url", "example_listing_url", "checked_on", "cost_note"]);
const shortTextLimits = { cost_tag: 20, cost_note: 40 };

function https(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}

function validateEvidence(value, slug, depth = 0) {
  if (depth > 10) throw new Error(`Evidence is too deeply nested for ${slug}`);
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if ((key === "checked_at" || key === "date") && item !== null && !launchDirectoryDate(item)) throw new Error(`Invalid evidence date for ${slug}`);
    if (key === "source_url" && item !== null && !https(item)) throw new Error(`Invalid evidence source URL for ${slug}`);
    if (key === "related_source_urls" && (!Array.isArray(item) || !item.every(https))) throw new Error(`Invalid related source URLs for ${slug}`);
    validateEvidence(item, slug, depth + 1);
  }
}

export function validateLaunchDirectoryUpdates(updates) {
  if (!Array.isArray(updates) || updates.length > 165) throw new Error("Expected at most 165 listing patches");
  const slugs = new Set();
  for (const update of updates) {
    if (!update || typeof update.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(update.slug) || slugs.has(update.slug)) throw new Error("Listing slugs must be valid and unique");
    slugs.add(update.slug);
    if (update.expected_updated_at !== undefined && (typeof update.expected_updated_at !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(update.expected_updated_at) || !Number.isFinite(new Date(update.expected_updated_at).getTime()))) throw new Error(`Invalid reviewed row version for ${update.slug}`);
    if (!update.changes || typeof update.changes !== "object" || Array.isArray(update.changes)) throw new Error(`Missing changes for ${update.slug}`);
    for (const [key, value] of Object.entries(update.changes)) {
      if (!fields.has(key)) throw new Error(`Field ${key} cannot be changed by this importer`);
      if (nullable.has(key) && value === null) continue;
      if (key === "sources") {
        if (!Array.isArray(value) || !value.length || !value.every(https)) throw new Error(`Invalid source URLs for ${update.slug}`);
      } else if (key === "evidence") {
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid evidence for ${update.slug}`);
        validateEvidence(value, update.slug);
      } else if (typeof value !== "string" || (!value.trim() && key !== "research_notes")) {
        throw new Error(`Invalid ${key} for ${update.slug}`);
      }
      if (Object.hasOwn(shortTextLimits, key)
        && (value !== value.trim() || [...value].length > shortTextLimits[key])) {
        throw new Error(`Invalid ${key} for ${update.slug}: must be trimmed and at most ${shortTextLimits[key]} characters`);
      }
      if (["website_url", "submit_url", "example_listing_url"].includes(key) && !https(value)) throw new Error(`Invalid ${key} URL for ${update.slug}`);
      if (key === "checked_on" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value)) throw new Error(`Invalid check date for ${update.slug}`);
    }
  }
  return updates;
}

export async function applyLaunchDirectoryUpdates(client, updates) {
  validateLaunchDirectoryUpdates(updates);
  if (!updates.length) return { changed_count: 0, proposed: [] };
  const result = await client.query("select to_jsonb(directory) as record from public.launch_directories directory where slug = any($1::text[]) and is_published order by slug for update", [updates.map((update) => update.slug)]);
  const records = new Map(result.rows.map(({ record }) => [record.slug, record]));
  const proposed = [];
  const patches = [];
  const changedFields = new Set();
  for (const update of updates) {
    const row = records.get(update.slug);
    if (!row) throw new Error(`Visible listing not found: ${update.slug}`);
    const next = { ...row, ...update.changes };
    const newest = latestLaunchEvidenceDate(next.evidence);
    const recordDate = launchDirectoryDate(next.checked_on);
    if (newest && (!recordDate || recordDate < newest)) throw new Error(`Record check date is older than its evidence for ${update.slug}`);
    if (!["verified", "unavailable", "not_found"].includes(next.submission_status)
      || (next.submission_status === "verified") !== Boolean(next.submit_url)) {
      throw new Error(`Submission status and URL disagree for ${update.slug}`);
    }
    const changed = Object.entries(update.changes).filter(([key, value]) => !isDeepStrictEqual(row[key], value));
    if (!changed.length) continue;
    if (!update.expected_updated_at || new Date(row.updated_at).getTime() !== new Date(update.expected_updated_at).getTime()) throw new Error(`Listing changed after the reviewed snapshot: ${update.slug}`);
    patches.push({ slug: update.slug, expected_updated_at: update.expected_updated_at, changes: Object.fromEntries(changed) });
    for (const [key] of changed) changedFields.add(key);
    proposed.push({
      slug: row.slug, name: row.name, fields: changed.map(([key]) => key),
      submission_status: next.submission_status, submit_url: next.submit_url,
      cost_label: next.cost_label, cost_tag: next.cost_tag, cost_note: next.cost_note, link_type_label: next.link_type_label,
    });
  }
  if (patches.length) {
    const assignments = [...changedFields].map((key) => `"${key}" = (jsonb_populate_record(null::public.launch_directories, to_jsonb(directory) || patch.changes))."${key}"`).join(", ");
    const applied = await client.query(`update public.launch_directories directory set ${assignments}
      from jsonb_to_recordset($1::jsonb) as patch(slug text, expected_updated_at timestamptz, changes jsonb)
      where directory.slug = patch.slug and directory.is_published
        and directory.updated_at = patch.expected_updated_at`, [JSON.stringify(patches)]);
    if (applied.rowCount !== patches.length) throw new Error("The listing update count changed during the transaction");
  }
  return { changed_count: proposed.length, proposed };
}

async function main() {
  const args = parseArgs();
  const updates = validateLaunchDirectoryUpdates(JSON.parse(readFileSync(requireArg(args, "input-file"), "utf8")));
  const result = await runMutation(args, (client) => applyLaunchDirectoryUpdates(client, updates));
  printResult(result);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
