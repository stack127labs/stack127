#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import path from "node:path";

const unicodeVersion = "16.0.0";
const source = `https://www.unicode.org/Public/${unicodeVersion}/ucd/UnicodeData.txt`;
const response = await fetch(source, {
  headers: { "user-agent": "stack127-punycode-converter/1.0 (+https://stack127.com)" },
  signal: AbortSignal.timeout(60_000),
});
if (!response.ok) throw new Error(`${source} returned ${response.status}`);

const names = {};
for (const line of (await response.text()).split("\n")) {
  const [hex, name] = line.split(";");
  if (!hex || !name || name.startsWith("<")) continue;
  names[Number.parseInt(hex, 16).toString(16).toUpperCase()] = name;
}

const output = JSON.stringify({ source, unicodeVersion, names });
await writeFile(path.join(process.cwd(), "lib/domain/data/unicode-names.json"), `${output}\n`);
console.log(`Wrote ${Object.keys(names).length} Unicode names for ${unicodeVersion}.`);
