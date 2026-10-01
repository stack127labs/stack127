#!/usr/bin/env node

import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { DatabaseSync, backup } from "node:sqlite";
import { parseArgs } from "node:util";
import { defaultLocalDatabasePath } from "./local-db.mjs";

const { values } = parseArgs({
  options: {
    "local-database": { type: "string", default: defaultLocalDatabasePath },
    "backup-directory": { type: "string", default: `${homedir()}/.local/share/stack127/backups` },
    keep: { type: "string", default: "7" },
  },
});
const keep = Number(values.keep);
if (!Number.isInteger(keep) || keep < 2 || keep > 60) throw new Error("--keep must be from 2 to 60");

const sourcePath = resolve(values["local-database"]);
const backupDirectory = resolve(values["backup-directory"]);
await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
const day = new Date().toISOString().slice(0, 10);
const destination = join(backupDirectory, `ad-networks-${day}.sqlite`);
const temporary = `${destination}.${process.pid}.tmp`;
const source = new DatabaseSync(sourcePath, { readOnly: true, timeout: 10_000 });
try {
  await backup(source, temporary);
} finally {
  source.close();
}
const check = new DatabaseSync(temporary, { readOnly: true });
try {
  const result = check.prepare("pragma integrity_check").get();
  if (result.integrity_check !== "ok") throw new Error(`Backup integrity check failed: ${result.integrity_check}`);
} finally {
  check.close();
}
await rm(`${temporary}-shm`, { force: true });
await rm(`${temporary}-wal`, { force: true });
await rename(temporary, destination);

const prefix = `${basename(sourcePath, ".sqlite").replace(/[^a-z0-9-]/gi, "-")}-`;
const files = (await readdir(backupDirectory))
  .filter((name) => name.startsWith(prefix) && name.endsWith(".sqlite"))
  .sort()
  .reverse();
for (const name of files.slice(keep)) await rm(join(backupDirectory, name), { force: true });
console.log(JSON.stringify({ source: sourcePath, backup: destination, retained: Math.min(files.length, keep) }));
