#!/usr/bin/env node
// Partial corrections only. No publishing, deletion, or whole-record date changes.
import { readFile } from "node:fs/promises";
import { parseArgs, parseEnv } from "node:util";
import pg from "pg";
import { applyCorrections, validateBatch } from "./lib/reviewed-corrections.mjs";

const { values } = parseArgs({ options: { env: { type: "string" }, file: { type: "string" }, apply: { type: "boolean", default: false }, "chunk-size": { type: "string", default: "25" } } });
if (!values.env || !values.file) throw new Error("Use --env <env file> --file <reviewed batch> [--apply] [--chunk-size 25]. Default is a rollback-only dry run.");
const environment = parseEnv(await readFile(values.env, "utf8"));
if (!environment.DATABASE_URL) throw new Error("Selected env file has no DATABASE_URL");
const batch = JSON.parse(await readFile(values.file, "utf8"));
const chunkSize = Number(values["chunk-size"]);
validateBatch(batch, chunkSize);
// Small transactions bound upload size; allow time for slow uplinks on each query.
const pool = new pg.Pool({ connectionString: environment.DATABASE_URL, max: 1, connectionTimeoutMillis: 30000, query_timeout: 180000, statement_timeout: 120000, lock_timeout: 15000 });
try {
  const client = await pool.connect();
  try {
    const totals = await applyCorrections(client, batch, { apply: values.apply, chunkSize });
    console.log(`${values.apply ? "Committed" : "Dry run passed for"} ${totals.apps} CLI correction(s); ${totals.changedApps} changed, ${totals.skippedApps} identical apps skipped.`);
  } finally { client.release(); }
} finally { await pool.end(); }
