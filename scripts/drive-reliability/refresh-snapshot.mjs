#!/usr/bin/env node

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const target = path.join(root, "app/(site)/(tools)/(storage)/drive-reliability/data/drive-reliability-snapshot.json");
const allowedSource = "https://www.backblaze.com/";

function fail(message) {
  console.error(`Drive reliability snapshot: ${message}`);
  process.exitCode = 1;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isDate(value, nullable = false) {
  return (nullable && value === null) || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)));
}

function validate(snapshot) {
  const errors = [];
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return ["root must be an object"];
  if (snapshot.schemaVersion !== "drive-reliability-snapshot-v1") errors.push("unsupported schemaVersion");
  for (const field of ["datasetVersion", "sourceName", "sourceUrl", "sourceReportUrl", "sourceCheckedAt"]) {
    if (typeof snapshot[field] !== "string" || snapshot[field].trim() === "") errors.push(`${field} is required`);
  }
  if (!isDate(snapshot.sourceCheckedAt)) errors.push("sourceCheckedAt is invalid");
  for (const field of ["sourceUrl", "sourceReportUrl"]) {
    if (typeof snapshot[field] === "string" && !snapshot[field].startsWith(allowedSource)) errors.push(`${field} is outside the Backblaze source allow-list`);
  }
  if (!Array.isArray(snapshot.periods) || snapshot.periods.length === 0) errors.push("periods must be non-empty");
  const periods = new Map();
  for (const [index, period] of (snapshot.periods ?? []).entries()) {
    if (!period || typeof period !== "object") {
      errors.push(`periods[${index}] must be an object`);
      continue;
    }
    if (typeof period.id !== "string" || periods.has(period.id)) errors.push(`periods[${index}] has a duplicate or missing id`);
    if (typeof period.id === "string") periods.set(period.id, period);
    if (typeof period.label !== "string" || period.label.trim() === "") errors.push(`periods[${index}].label is required`);
    if (!isDate(period.start, true) || !isDate(period.end)) errors.push(`periods[${index}] date is invalid`);
    if (!isFiniteNumber(period.driveCountMinimum) || period.driveCountMinimum < 0) errors.push(`periods[${index}].driveCountMinimum is invalid`);
    if (!isFiniteNumber(period.driveDaysMinimum) || period.driveDaysMinimum < 0) errors.push(`periods[${index}].driveDaysMinimum is invalid`);
  }
  if (!Array.isArray(snapshot.rows)) errors.push("rows must be an array");
  const rowIds = new Set();
  for (const [index, row] of (snapshot.rows ?? []).entries()) {
    if (!row || typeof row !== "object") {
      errors.push(`rows[${index}] must be an object`);
      continue;
    }
    if (typeof row.id !== "string" || rowIds.has(row.id)) errors.push(`rows[${index}] has a duplicate or missing id`);
    if (typeof row.id === "string") rowIds.add(row.id);
    if (!periods.has(row.periodId)) errors.push(`rows[${index}] references an unknown period`);
    if (!new Set(["model", "fleet"]).has(row.cohortType)) errors.push(`rows[${index}].cohortType is invalid`);
    for (const field of ["manufacturer", "model"]) if (typeof row[field] !== "string" || row[field].trim() === "") errors.push(`rows[${index}].${field} is required`);
    if (row.capacityTb !== null && !isFiniteNumber(row.capacityTb)) errors.push(`rows[${index}].capacityTb is invalid`);
    if (row.driveCount !== null && (!isFiniteNumber(row.driveCount) || row.driveCount <= 0 || !Number.isInteger(row.driveCount))) errors.push(`rows[${index}].driveCount is invalid`);
    if (!isFiniteNumber(row.driveDays) || row.driveDays <= 0) errors.push(`rows[${index}].driveDays is invalid`);
    if (!isFiniteNumber(row.failures) || row.failures < 0 || !Number.isInteger(row.failures)) errors.push(`rows[${index}].failures is invalid`);
    if (row.averageAgeMonths !== null && !isFiniteNumber(row.averageAgeMonths)) errors.push(`rows[${index}].averageAgeMonths is invalid`);
    if (typeof row.includedBySource !== "boolean") errors.push(`rows[${index}].includedBySource is invalid`);
    if (!new Set(["qualified", "summary", "excluded"]).has(row.qualification)) errors.push(`rows[${index}].qualification is invalid`);
  }
  return errors;
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`cannot read JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const inputIndex = process.argv.indexOf("--input");
const check = process.argv.includes("--check");
const input = inputIndex === -1 ? target : path.resolve(root, process.argv[inputIndex + 1] ?? "");

if (inputIndex !== -1 && !process.argv[inputIndex + 1]) {
  fail("--input needs a JSON path");
} else if (!existsSync(input)) {
  fail(`input does not exist: ${input}`);
} else {
  try {
    const snapshot = readJson(input);
    const errors = validate(snapshot);
    if (errors.length > 0) {
      fail(errors.join("; "));
    } else if (!check && input !== target) {
      const temporary = `${target}.tmp-${process.pid}`;
      writeFileSync(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
      renameSync(temporary, target);
      console.log(`Validated and replaced ${path.relative(root, target)}`);
    } else {
      console.log(`Validated ${path.relative(root, input)}`);
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}
