#!/usr/bin/env node
// Partial corrections only. No publishing, deletion, or whole-record date changes.
import { readFile } from "node:fs/promises";
import { parseArgs, parseEnv } from "node:util";
import pg from "pg";
import { guardCorrection } from "./lib/reviewed-corrections.mjs";

const { values } = parseArgs({ options: { env: { type: "string" }, file: { type: "string" }, apply: { type: "boolean", default: false } } });
if (!values.env || !values.file) throw new Error("Use --env <env file> --file <reviewed batch> [--apply]. Default is a rollback-only dry run.");
const environment = parseEnv(await readFile(values.env, "utf8"));
if (!environment.DATABASE_URL) throw new Error("Selected env file has no DATABASE_URL");
const batch = JSON.parse(await readFile(values.file, "utf8"));
if (!Array.isArray(batch.apps) || batch.apps.length === 0) throw new Error("Batch must contain reviewed apps");
if (new Set(batch.apps.map(app => app.slug)).size !== batch.apps.length) throw new Error("Duplicate slug in correction batch");
const pool = new pg.Pool({ connectionString: environment.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000, query_timeout: 15000 });
try {
  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const record of batch.apps) {
      const current = (await client.query("select * from public.terminal_apps where slug = $1 for update", [record.slug])).rows[0];
      if (!current) throw new Error(`Missing CLI app: ${record.slug}`);
      guardCorrection(record, current);
      const fields = Object.keys(record.fields);
      // Identifiers come exclusively from the guard's fixed allowlist.
      await client.query(`update public.terminal_apps set ${fields.map((field, index) => `${field} = $${index + 2}`).join(", ")}, updated_at = now() where id = $1`, [current.id, ...fields.map(field => record.fields[field])]);
      for (const field of fields) {
        await client.query(`insert into public.terminal_app_field_sources (app_id, field_name, source, source_url, confidence, checked_at, note)
          values ($1, $2, 'stack127_primary_source_review', $3, 'high', $4::timestamptz, $5)
          on conflict (app_id, field_name) do update set source = excluded.source, source_url = excluded.source_url,
          confidence = excluded.confidence, checked_at = excluded.checked_at, note = excluded.note`,
        [current.id, field, record.sources[field], record.reviewed_at, record.notes?.[field] ?? "Partial field review; other app facts remain unverified by this batch."]);
      }
      console.log(`${values.apply ? "Applied" : "Checked"} CLI correction: ${record.slug}`);
    }
    await client.query(values.apply ? "commit" : "rollback");
    console.log(`${values.apply ? "Committed" : "Dry run passed for"} ${batch.apps.length} CLI correction(s).`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally { client.release(); }
} finally { await pool.end(); }
