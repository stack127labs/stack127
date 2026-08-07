#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function readEnvFile(file) {
  if (!existsSync(file)) return {};

  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equals = trimmed.indexOf("=");
    if (equals === -1) continue;

    const key = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

const databaseEnvFile = process.env.VERSION127_TEST_DATABASE_ENV ?? ".env.database";

const env = {
  ...process.env,
  ...readEnvFile(path.join(process.cwd(), databaseEnvFile)),
  VERSION127_TEST_DIST_DIR: ".next-playwright",
};

const port = process.env.VERSION127_TEST_PORT ?? process.env.PORT ?? "3334";
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const nextArguments = [nextBin, "dev", "-p", port];
if (process.env.VERSION127_TEST_WEBPACK === "1") nextArguments.push("--webpack");

const child = spawn(process.execPath, nextArguments, {
  env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
