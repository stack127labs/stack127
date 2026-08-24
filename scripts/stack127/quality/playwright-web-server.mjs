#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
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

const databaseEnvFile = process.env.STACK127_TEST_DATABASE_ENV ?? ".env.database";
const serverMode = process.env.STACK127_TEST_SERVER ?? "dev";
const distDir = serverMode === "production" ? ".next" : ".next-playwright";
const port = process.env.STACK127_TEST_PORT ?? process.env.PORT ?? "3334";

if (serverMode !== "production") {
  rmSync(path.join(process.cwd(), distDir), { recursive: true, force: true });
}

const env = {
  ...process.env,
  ...readEnvFile(path.join(process.cwd(), databaseEnvFile)),
  NODE_OPTIONS: process.env.STACK127_TEST_NODE_OPTIONS ?? process.env.NODE_OPTIONS ?? "--max-old-space-size=6144",
  STACK127_TEST_DIST_DIR: distDir,
  PORT: port,
};

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const standaloneServer = path.join(process.cwd(), ".next", "standalone", "server.js");
const bundler = process.env.STACK127_TEST_BUNDLER ?? "webpack";
const bundlerFlag = bundler === "turbopack" ? "--turbopack" : "--webpack";
const nextArgs = serverMode === "production"
  ? existsSync(standaloneServer)
    ? [standaloneServer]
    : [nextBin, "start", "-p", port]
  : [nextBin, "dev", bundlerFlag, "-p", port];
const child = spawn(process.execPath, nextArgs, {
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
