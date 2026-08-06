#!/usr/bin/env node

import {
  cpSync,
  existsSync,
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
    .replaceAll("the version127 site", "this DNS Tools installation")
    .replaceAll("the version127 server", "this DNS Tools server")
    .replaceAll("version127 does not store", "DNS Tools does not store")
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

const unitTestMappings = [
  ["tests/pages/dns-lookup/dns-lookup.test.mjs", "tests/pages/dns-lookup/dns-lookup.test.mjs", "../../../lib/dns"],
  ["tests/pages/dns-trace/dns-trace.test.mjs", "tests/pages/dns-trace/dns-trace.test.mjs", "../../../lib/dns"],
  ["tests/pages/dns-tools/shared/dns-diagnostics.test.mjs", "tests/shared/dns-diagnostics.test.mjs", "../../lib/dns"],
  ["tests/pages/dns-tools/shared/dns-resolvers.test.mjs", "tests/shared/dns-resolvers.test.mjs", "../../lib/dns"],
  ["tests/pages/dns-tools/shared/dns-tool-box-style.test.mjs", "tests/shared/dns-tool-box-style.test.mjs", "../../lib/dns"],
];

function copyUnitTests(stage) {
  for (const [sourceRelative, targetRelative, importPrefix] of unitTestMappings) {
    const target = path.join(stage, targetRelative);
    mkdirSync(path.dirname(target), { recursive: true });
    const content = readFileSync(path.join(root, sourceRelative), "utf8")
      .replaceAll("../../../../lib/dns", importPrefix);
    writeFileSync(target, standaloneText(content));
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
  copyUnitTests(stage);
  rewriteTextTree(stage);

  const managedDirectories = ["lib/dns", "app/api/dns"];
  const managedFiles = unitTestMappings.map(([, targetRelative]) => targetRelative);
  if (checkOnly) {
    const drift = [
      ...managedDirectories.filter((relative) => !directoriesMatch(path.join(stage, relative), path.join(repo, relative))),
      ...managedFiles.filter((relative) => {
        const expected = path.join(stage, relative);
        const actual = path.join(repo, relative);
        return !existsSync(actual) || !readFileSync(expected).equals(readFileSync(actual));
      }),
    ];
    if (drift.length) throw new Error(`DNS Tools shared core is out of sync: ${drift.join(", ")}`);
    console.log("DNS Tools shared core is in sync.");
  } else {
    for (const relative of managedDirectories) replaceDirectory(path.join(stage, relative), path.join(repo, relative));
    for (const relative of managedFiles) {
      const target = path.join(repo, relative);
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(path.join(stage, relative), target);
    }
    rmSync(path.join(repo, "tests", "unit"), { recursive: true, force: true });
    console.log("Updated the DNS Tools shared core without touching repository-owned pages, docs, configuration, or screenshots.");
  }
} finally {
  rmSync(stage, { recursive: true, force: true });
}
