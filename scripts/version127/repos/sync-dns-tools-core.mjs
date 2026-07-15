#!/usr/bin/env node

import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = path.join(root, "repos", "dns-tools");
const checkOnly = process.argv.includes("--check");
const textExtensions = new Set([".js", ".mjs", ".ts", ".tsx"]);

function standaloneText(content) {
  return content
    .replaceAll("the Version127 site", "this DNS Tools installation")
    .replaceAll("the Version127 server", "this DNS Tools server")
    .replaceAll("Version127 does not store", "DNS Tools does not store")
    .replaceAll("/dns-tools/", "/");
}

function rewriteTextTree(dir) {
  for (const entry of readdirSync(dir)) {
    const filePath = path.join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) rewriteTextTree(filePath);
    else if (stat.isFile() && textExtensions.has(path.extname(filePath))) {
      const before = readFileSync(filePath, "utf8");
      const after = standaloneText(before);
      if (after !== before) writeFileSync(filePath, after);
    }
  }
}

function copyUnitTests(target) {
  mkdirSync(target, { recursive: true });
  const source = path.join(root, "tests", "version127");
  for (const entry of readdirSync(source)) {
    if (!entry.startsWith("dns-") || !entry.endsWith(".test.mjs") || entry === "dns-tools-repository.test.mjs") continue;
    cpSync(path.join(source, entry), path.join(target, entry));
  }
}

function filesBelow(dir, prefix = "") {
  return readdirSync(dir).flatMap((entry) => {
    const filePath = path.join(dir, entry);
    const relative = path.join(prefix, entry);
    return statSync(filePath).isDirectory() ? filesBelow(filePath, relative) : [relative];
  }).sort();
}

function directoriesMatch(expected, actual) {
  const expectedFiles = filesBelow(expected);
  const actualFiles = filesBelow(actual);
  if (expectedFiles.join("\n") !== actualFiles.join("\n")) return false;
  return expectedFiles.every((file) => readFileSync(path.join(expected, file)).equals(readFileSync(path.join(actual, file))));
}

function replaceDirectory(source, target) {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

const stage = mkdtempSync(path.join(os.tmpdir(), "dns-tools-core-"));
try {
  cpSync(path.join(root, "lib", "dns"), path.join(stage, "lib", "dns"), { recursive: true });
  cpSync(path.join(root, "app", "api", "dns"), path.join(stage, "app", "api", "dns"), { recursive: true });
  copyUnitTests(path.join(stage, "tests", "unit"));
  rewriteTextTree(stage);

  const managed = ["lib/dns", "app/api/dns", "tests/unit"];
  if (checkOnly) {
    const drift = managed.filter((relative) => !directoriesMatch(path.join(stage, relative), path.join(repo, relative)));
    if (drift.length) throw new Error(`DNS Tools shared core is out of sync: ${drift.join(", ")}`);
    console.log("DNS Tools shared core is in sync.");
  } else {
    for (const relative of managed) replaceDirectory(path.join(stage, relative), path.join(repo, relative));
    console.log("Updated the DNS Tools shared core without touching repository-owned pages, docs, configuration, or screenshots.");
  }
} finally {
  rmSync(stage, { recursive: true, force: true });
}
