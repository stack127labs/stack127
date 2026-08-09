#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const receiptDirectory = resolve(scriptDirectory, "receipts");
const allowedSeries = new Set(["2.3", "2.4"]);
const requiredCases = new Set([
  "mirror",
  "raidz1",
  "raidz2",
  "raidz3",
  "mixed-members",
  "ashift-13",
]);

function fail(message) {
  console.error(`OpenZFS fixture check failed: ${message}`);
  process.exitCode = 1;
}

function exactInteger(value, label) {
  if (typeof value !== "string" || !/^(?:0|[1-9]\d*)$/.test(value)) {
    throw new Error(`${label} must be a decimal integer string`);
  }
  return BigInt(value);
}

function validateReceipt(fileName) {
  const path = resolve(receiptDirectory, fileName);
  const receipt = JSON.parse(readFileSync(path, "utf8"));
  const series = typeof receipt.openZfsVersion === "string"
    ? receipt.openZfsVersion.match(/^(2\.[34])(?:\.|$)/)?.[1]
    : null;

  if (!series || !allowedSeries.has(series)) throw new Error("unsupported OpenZFS version");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(receipt.date ?? "")) throw new Error("invalid fixture date");
  if (typeof receipt.operatingSystem !== "string" || receipt.operatingSystem.length < 3) throw new Error("missing operating system");
  if (!Array.isArray(receipt.fixtures) || receipt.fixtures.length === 0) throw new Error("missing fixtures");
  if (JSON.stringify(receipt).match(/(?:\/dev\/|disk\d|nvme\d|sd[a-z])/i)) throw new Error("real device path is forbidden");

  const seenCases = new Set();
  for (const fixture of receipt.fixtures) {
    if (typeof fixture.id !== "string" || typeof fixture.case !== "string") throw new Error("fixture identity is missing");
    if (!requiredCases.has(fixture.case)) throw new Error(`${fixture.id} has an unknown case`);
    if (![12, 13].includes(fixture.ashift)) throw new Error(`${fixture.id} has an unsupported ashift`);
    if (![4096, 8192, 16384, 131072].includes(fixture.blockBytes)) throw new Error(`${fixture.id} has an unsupported block size`);
    if (fixture.tolerance !== "exact") throw new Error(`${fixture.id} must use exact tolerance`);
    const logical = exactInteger(fixture.logicalBytes, `${fixture.id} logicalBytes`);
    const expected = exactInteger(fixture.expectedAsizeBytes, `${fixture.id} expectedAsizeBytes`);
    const observed = exactInteger(fixture.observedAsizeBytes, `${fixture.id} observedAsizeBytes`);
    if (logical !== BigInt(fixture.blockBytes)) throw new Error(`${fixture.id} LSIZE does not match its block size`);
    if (expected !== observed) throw new Error(`${fixture.id} ASIZE differs from the exact oracle`);
    if (!Array.isArray(fixture.commands) || fixture.commands.length === 0) throw new Error(`${fixture.id} has no command record`);
    seenCases.add(fixture.case);
  }

  for (const requiredCase of requiredCases) {
    if (!seenCases.has(requiredCase)) throw new Error(`missing ${requiredCase} fixture`);
  }
  return { fileName, series, count: receipt.fixtures.length };
}

if (process.argv.some((argument) => argument !== "--check" && argument !== process.argv[0] && argument !== process.argv[1])) {
  fail("only --check is supported in this repository");
} else if (!existsSync(receiptDirectory)) {
  fail(`receipt directory is missing: ${receiptDirectory}`);
} else {
  const files = readdirSync(receiptDirectory).filter((file) => file.endsWith(".json")).sort();
  const verifiedSeries = new Set();
  for (const fileName of files) {
    try {
      const result = validateReceipt(fileName);
      verifiedSeries.add(result.series);
      console.log(`${result.fileName}: OpenZFS ${result.series}, ${result.count} exact fixtures`);
    } catch (error) {
      fail(`${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  for (const series of allowedSeries) {
    if (!verifiedSeries.has(series)) fail(`missing an OpenZFS ${series} receipt`);
  }
}
