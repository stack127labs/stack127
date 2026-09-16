#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync } from "node:fs";
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

function ensureProductionAssetLink(source, target) {
  if (existsSync(target)) return;
  rmSync(target, { recursive: true, force: true });
  mkdirSync(path.dirname(target), { recursive: true });
  symlinkSync(path.relative(path.dirname(target), source), target, "dir");
}

if (serverMode !== "production") {
  rmSync(path.join(process.cwd(), distDir), { recursive: true, force: true });
} else {
  ensureProductionAssetLink(
    path.join(process.cwd(), ".next", "static"),
    path.join(process.cwd(), ".next", "standalone", ".next", "static"),
  );
  ensureProductionAssetLink(
    path.join(process.cwd(), "public"),
    path.join(process.cwd(), ".next", "standalone", "public"),
  );
}

const env = {
  ...process.env,
  ...readEnvFile(path.join(process.cwd(), databaseEnvFile)),
  NODE_OPTIONS: process.env.STACK127_TEST_NODE_OPTIONS ?? process.env.NODE_OPTIONS ?? "--max-old-space-size=6144",
  STACK127_TEST_DIST_DIR: distDir,
  HOSTNAME: serverMode === "production" ? "127.0.0.1" : process.env.HOSTNAME,
  PORT: port,
};

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const standaloneServer = path.join(process.cwd(), ".next", "standalone", "server.js");
const bundler = process.env.STACK127_TEST_BUNDLER ?? "webpack";
const bundlerFlag = bundler === "turbopack" ? "--turbopack" : "--webpack";
const nextArgs = serverMode === "production"
  ? [standaloneServer]
  : [nextBin, "dev", bundlerFlag, "-p", port];
let child;
let stopping = false;

function startChild() {
  child = spawn(process.execPath, nextArgs, {
    env,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (stopping) {
      if (signal) process.kill(process.pid, signal);
      process.exit(code ?? 0);
    }

    console.error(
      `[playwright-web-server] Next.js exited unexpectedly (code=${code ?? "none"}, signal=${signal ?? "none"}).`,
    );

    // Next.js exits with 77 when its dev server reaches the memory safety
    // threshold. Keep the Playwright web-server process alive and replace the
    // child so a request in the restart window is not reported as a page bug.
    if (serverMode !== "production" && code === 77) {
      setTimeout(startChild, 100);
      return;
    }

    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopping = true;
    child?.kill(signal);
  });
}

startChild();
