#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPrefix, rawSize = "8"] = process.argv.slice(2);
if (!inputPath || !outputPrefix) {
  throw new Error("Usage: split-reviewed-batch.mjs <input> <output-prefix> [size]");
}

const input = JSON.parse(await readFile(inputPath, "utf8"));
const size = Number.parseInt(rawSize, 10);
for (let offset = 0; offset < input.records.length; offset += size) {
  const number = String(offset / size + 1).padStart(2, "0");
  await writeFile(
    `${outputPrefix}-${number}.json`,
    `${JSON.stringify({ reviewed_at: input.reviewed_at, records: input.records.slice(offset, offset + size) }, null, 2)}\n`,
  );
}

console.log(JSON.stringify({ records: input.records.length, files: Math.ceil(input.records.length / size), size }));
