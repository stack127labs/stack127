#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual, parseArgs } from "node:util";
import pg from "pg";
import { resolveDatabaseUrl } from "../stack127/tool-pages/lib.mjs";
import { validateLaunchDirectoryUpdates } from "../stack127/database/update-launch-directories.mjs";

/** Rebase only row versions after the facts import. The reviewed old field values
 * must still match in full, so an intervening price/evidence edit is never lost. */
export function rebaseReviewedCorrections(review, records) {
  if (!Array.isArray(review)) throw new Error("Expected reviewed correction rows");
  validateLaunchDirectoryUpdates(review.map(({ slug, expected_updated_at, changes }) => ({ slug, expected_updated_at, changes })));
  const bySlug = new Map(records.map(row => [row.slug, row]));
  return review.map(row => {
    if (!row.before || Object.keys(row.before).length !== Object.keys(row.changes).length
      || Object.keys(row.changes).some(key => !Object.hasOwn(row.before, key))) throw new Error(`Missing reviewed before values: ${row.slug}`);
    const current = bySlug.get(row.slug);
    if (!current?.is_published) throw new Error(`Published listing missing: ${row.slug}`);
    const matches = values => Object.entries(values).every(([key, value]) => isDeepStrictEqual(current[key], value));
    if (!matches(row.before) && !matches(row.changes)) throw new Error(`Reviewed fields changed in production: ${row.slug}`);
    return { slug: row.slug, expected_updated_at: current.updated_at, changes: row.changes };
  });
}

async function main() {
  const { values } = parseArgs({ options: { "review-file": { type: "string", default: "content_docs/launch-directories/record-corrections-2026-10.json" }, out: { type: "string" } } });
  if (!values.out) throw new Error("--out is required (a new file)");
  const review = JSON.parse(readFileSync(values["review-file"], "utf8"));
  const pool = new pg.Pool({ connectionString: resolveDatabaseUrl({ environment: "production" }), max: 1, connectionTimeoutMillis: 15000 });
  const client = await pool.connect();
  try {
    await client.query("begin isolation level repeatable read read only");
    const records = (await client.query("select to_jsonb(directory) record from public.launch_directories directory where slug=any($1::text[])", [review.map(row => row.slug)])).rows.map(row => row.record);
    const updates = rebaseReviewedCorrections(review, records);
    await client.query("rollback");
    writeFileSync(values.out, JSON.stringify(updates, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    console.log(JSON.stringify({ prepared: true, file: values.out, records: updates.length, production_written: false }));
  } finally { await client.query("rollback").catch(() => {}); client.release(); await pool.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
