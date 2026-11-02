import { parseRepo } from "../../self-host-apps/lib/github.mjs";
import { isDeepStrictEqual } from "node:util";
import { validateSummary } from "../../self-host-apps/lib/summary-rules.mjs";
import { platformOptions, pricingOptions, sourceModelOptions, installLabels } from "../../../app/(site)/(directories)/cli-apps/cli-app-options.ts";
import { terminalAppTypes, terminalAppCategories } from "../../../lib/terminal-app-taxonomy.ts";

const arrayValues = {
  platforms: new Set(platformOptions.map(option => option.value)),
  categories: new Set(terminalAppCategories.map(category => category.slug)),
  additional_types: new Set(terminalAppTypes),
  install_methods: new Set(installLabels.keys()),
  aliases: null,
};
const scalarValues = {
  primary_type: new Set(terminalAppTypes),
  pricing_model: new Set(pricingOptions.map(option => option.value)),
  source_model: new Set(sourceModelOptions.map(option => option.value)),
};
// These columns are nullable in terminal_apps. Repository removal is outside this workflow.
const nullableFields = new Set(["website_url", "docs_url", "license", "language"]);
export const correctionFields = new Set(["name", "summary", "website_url", "repository_url", "docs_url", "license", "language", ...Object.keys(arrayValues), ...Object.keys(scalarValues)]);

function isHttps(value) {
  if (typeof value !== "string" || !value.startsWith("https://") || /\s/.test(value)) return false;
  try { return new URL(value).protocol === "https:" && Boolean(new URL(value).hostname); }
  catch { return false; }
}

export function guardCorrection(record, current) {
  if (!record || typeof record.slug !== "string" || !record.slug.trim() || !record.fields || Array.isArray(record.fields) || typeof record.fields !== "object" || Object.keys(record.fields).length === 0) throw new Error("A slug and reviewed fields are required");
  const reviewTimestamp = Date.parse(record.reviewed_at);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.reviewed_at ?? "") || !Number.isFinite(reviewTimestamp) || new Date(reviewTimestamp).toISOString().slice(0, 10) !== record.reviewed_at) throw new Error("A valid review date is required");
  for (const [field, value] of Object.entries(record.fields)) {
    if (!correctionFields.has(field)) throw new Error(`${field}: partial correction not allowed`);
    if (Object.hasOwn(arrayValues, field)) {
      if (!Array.isArray(value) || new Set(value).size !== value.length || value.some(item => typeof item !== "string" || !item.trim() || (arrayValues[field] && !arrayValues[field].has(item)))) throw new Error(`${field}: expected unique allowed text values`);
      if (field === "categories" && (value.length < 1 || value.length > 3)) throw new Error("categories: expected 1 to 3 reviewed values");
    } else if (value === null ? !nullableFields.has(field) : typeof value !== "string" || !value.trim()) throw new Error(`${field}: expected nonempty text${nullableFields.has(field) ? " or null" : ""}`);
    if (Object.hasOwn(scalarValues, field) && !scalarValues[field].has(value)) throw new Error(`${field}: invalid value`);
    if (!Object.hasOwn(record.expected ?? {}, field)) throw new Error(`${field}: expected value required`);
    // A committed chunk can be replayed, but a third value still blocks the chunk.
    if (!isDeepStrictEqual(current[field], record.expected[field]) && !isDeepStrictEqual(current[field], value)) throw new Error(`${record.slug}: ${field} changed since review`);
    if (!isHttps(record.sources?.[field])) throw new Error(`${field}: reviewed source URL required`);
    if (field.endsWith("_url") && value !== null && !isHttps(value)) throw new Error(`${field}: HTTPS URL required`);
    if (field === "repository_url") githubRepository(value);
    if (field === "summary") {
      const { errors } = validateSummary(value);
      if (errors.length) throw new Error(`${record.slug}: ${errors.join("; ")}`);
    }
  }
}

export function validateBatch(batch, chunkSize) {
  if (!Number.isSafeInteger(chunkSize) || chunkSize < 1 || chunkSize > 25) throw new Error("chunk-size must be an integer from 1 to 25");
  if (!Array.isArray(batch?.apps) || batch.apps.length === 0) throw new Error("Batch must contain reviewed apps");
  if (new Set(batch.apps.map(app => app?.slug)).size !== batch.apps.length) throw new Error("Duplicate slug in correction batch");
  // Validate all input before committing even the first chunk. DB comparisons happen under row locks.
  for (const record of batch.apps) guardCorrection(record, record?.expected ?? {});
}

function githubRepository(url) {
  if (new URL(url).hostname.toLowerCase() !== "github.com") return null;
  const parsed = parseRepo(url);
  const owner = parsed.owner.trim().toLowerCase();
  const repo = parsed.repo.trim().toLowerCase();
  if (!owner || !repo) throw new Error("GitHub owner and repository are required");
  return { owner, repo };
}

async function repositoryProjectId(client, url) {
  const repository = githubRepository(url);
  if (!repository) return null;
  const { owner, repo } = repository;
  // Older imports preserve casing, and some repos already have multiple case variants.
  // Prefer the most recently checked row, with a stable ID tie-breaker.
  const find = () => client.query("select id from public.github_projects where lower(owner) = $1 and lower(repo) = $2 order by checked_at desc nulls last, id limit 1", [owner, repo]);
  const existing = (await find()).rows[0];
  if (existing) return existing.id;
  // There is only a case-sensitive unique index. Serialize missing-project inserts
  // with every writer (including importers that do not use advisory locks), then
  // recheck after the lock has waited for any in-flight inserts to commit.
  await client.query("lock table public.github_projects in share row exclusive mode");
  const afterLock = (await find()).rows[0];
  if (afterLock) return afterLock.id;
  const inserted = await client.query(`insert into public.github_projects (owner, repo, full_name, repository_url, checked_at)
    values ($1, $2, $3, $4, null) on conflict (owner, repo) do nothing returning id`,
  [owner, repo, `${owner}/${repo}`, `https://github.com/${owner}/${repo}`]);
  // A concurrent importer may have created the project after the first lookup.
  return inserted.rows[0]?.id ?? (await find()).rows[0].id;
}

export async function applyCorrections(client, batch, { apply = false, chunkSize = 25, report = console.log } = {}) {
  validateBatch(batch, chunkSize);
  const totals = { apps: 0, changedApps: 0, changedFields: 0, skippedApps: 0 };
  const chunkCount = Math.ceil(batch.apps.length / chunkSize);
  for (let offset = 0; offset < batch.apps.length; offset += chunkSize) {
    const records = batch.apps.slice(offset, offset + chunkSize);
    const label = `Chunk ${offset / chunkSize + 1}/${chunkCount}`;
    const counts = { apps: records.length, changedApps: 0, changedFields: 0, skippedApps: 0 };
    let finishing = false;
    try {
      await client.query("begin");
      // No trigger suppression: public dates and cache jobs commit/roll back with the app changes.
      for (const record of records) {
        const current = (await client.query("select * from public.terminal_apps where slug = $1 for update", [record.slug])).rows[0];
        if (!current) throw new Error(`Missing CLI app: ${record.slug}`);
        guardCorrection(record, current);
        const fields = Object.keys(record.fields).filter(field => !isDeepStrictEqual(current[field], record.fields[field]));
        if (!fields.length) { counts.skippedApps++; continue; }
        // Identifiers come exclusively from the guard's fixed allowlist.
        const updateFields = [...fields];
        const updateValues = fields.map(field => record.fields[field]);
        if (fields.includes("repository_url")) {
          updateFields.push("github_project_id");
          updateValues.push(await repositoryProjectId(client, record.fields.repository_url));
        }
        await client.query(`update public.terminal_apps set ${updateFields.map((field, index) => `${field} = $${index + 2}`).join(", ")}, updated_at = now() where id = $1`, [current.id, ...updateValues]);
        // One small provenance query per app rather than one round trip per field.
        await client.query(`insert into public.terminal_app_field_sources (app_id, field_name, source, source_url, confidence, checked_at, note)
          select $1, data.field_name, 'stack127_primary_source_review', data.source_url, 'high', $2::timestamptz, data.note
          from unnest($3::text[], $4::text[], $5::text[]) as data(field_name, source_url, note)
          on conflict (app_id, field_name) do update set source = excluded.source, source_url = excluded.source_url,
          confidence = excluded.confidence, checked_at = excluded.checked_at, note = excluded.note`,
        [current.id, record.reviewed_at, fields, fields.map(field => record.sources[field]), fields.map(field => record.notes?.[field] ?? "Partial field review; other app facts remain unverified by this batch.")]);
        counts.changedApps++;
        counts.changedFields += fields.length;
      }
      finishing = true;
      await client.query(apply ? "commit" : "rollback");
    } catch (error) {
      let rolledBack = false;
      try { await client.query("rollback"); rolledBack = true; } catch { /* Preserve the original error if the connection is lost. */ }
      const outcome = finishing || !rolledBack ? "failed; commit outcome may be uncertain" : "rolled back";
      report(`${label}: ${outcome}; stopped. Earlier committed chunks remain applied. Re-run the same file to resume (identical fields skip).`);
      throw new Error(`${label}: ${error.message}`, { cause: error });
    }
    for (const key of Object.keys(totals)) totals[key] += counts[key];
    report(`${label}: ${apply ? "committed" : "dry-run rolled back"}; ${counts.apps} apps, ${counts.changedApps} changed, ${counts.changedFields} fields, ${counts.skippedApps} identical apps skipped.`);
  }
  return totals;
}
