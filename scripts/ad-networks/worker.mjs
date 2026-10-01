#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { defaultLocalDatabasePath, openLocalDatabase, recordWorkerRun } from "./local-db.mjs";

const { values } = parseArgs({
  options: {
    role: { type: "string" },
    once: { type: "boolean", default: false },
    "local-database": { type: "string", default: defaultLocalDatabasePath },
    "interval-seconds": { type: "string", default: "30" },
    concurrency: { type: "string", default: "12" },
    limit: { type: "string", default: "2500" },
  },
});
if (!new Set(["discovery", "verification"]).has(values.role)) {
  throw new Error("--role must be discovery or verification");
}
const intervalSeconds = Number(values["interval-seconds"]);
if (!Number.isInteger(intervalSeconds) || intervalSeconds < 5 || intervalSeconds > 3600) {
  throw new Error("--interval-seconds must be from 5 to 3600");
}

let child = null;
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopping = true;
    child?.kill(signal);
  });
}

function runNode(args) {
  return new Promise((resolveRun) => {
    child = spawn(process.execPath, args, {
      cwd: resolve(import.meta.dirname, "../.."),
      env: { ...process.env, AD_NETWORK_DB_PATH: values["local-database"] },
      stdio: "inherit",
    });
    child.on("exit", (code, signal) => {
      child = null;
      resolveRun({ code: code ?? 1, signal });
    });
  });
}

async function record(worker, startedAt, result, summary = {}) {
  const database = openLocalDatabase(values["local-database"]);
  try {
    const status = result.signal ? "interrupted" : result.code === 0 ? "complete" : "failed";
    recordWorkerRun(database, worker, status, {
      exitCode: result.code,
      signal: result.signal,
      ...summary,
    }, startedAt);
  } finally {
    database.close();
  }
}

async function discoveryRun() {
  const startedAt = new Date().toISOString();
  const result = await runNode([
    "scripts/ad-networks/discover.mjs",
    "--apply",
    "--store", "local",
    "--local-database", values["local-database"],
    "--kind", "sellers-json",
  ]);
  await record("discovery", startedAt, result);
  return result;
}

async function verificationRun() {
  const startedAt = new Date().toISOString();
  const summaryFile = resolve("tmp/ad-networks/local-verification-summary.json");
  const result = await runNode([
    "scripts/ad-networks/verify.mjs",
    "--apply",
    "--store", "local",
    "--local-database", values["local-database"],
    "--limit", values.limit,
    "--concurrency", values.concurrency,
    "--lease-minutes", "70",
    "--time-budget-minutes", "55",
    "--summary-file", summaryFile,
  ]);
  let summary = {};
  try { summary = JSON.parse(await readFile(summaryFile, "utf8")); } catch {}
  await record("verification", startedAt, result, summary);
  return { result, summary };
}

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
let lastExitCode = 0;
do {
  const run = values.role === "discovery" ? await discoveryRun() : await verificationRun();
  lastExitCode = values.role === "discovery" ? run.code : run.result.code;
  if (values.once || stopping) break;
  const failed = lastExitCode !== 0;
  await wait((failed ? Math.max(intervalSeconds, 300) : intervalSeconds) * 1000);
} while (!stopping);
if (values.once && lastExitCode !== 0) process.exitCode = lastExitCode;
