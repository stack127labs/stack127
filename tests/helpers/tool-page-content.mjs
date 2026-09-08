import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const migrationsDirectory = path.join(process.cwd(), "supabase", "migrations");
const migrationName = readdirSync(migrationsDirectory)
  .filter((name) => name.endsWith("_add_stack127_tool_pages.sql"))
  .sort()
  .at(-1);

if (!migrationName) throw new Error("Missing add_stack127_tool_pages migration");

const migration = readFileSync(path.join(migrationsDirectory, migrationName), "utf8");

export function readToolPageSeed(slug) {
  const marker = `-- tool-slug: ${slug}`;
  const start = migration.indexOf(marker);
  if (start === -1) throw new Error(`Missing tool-page seed: ${slug}`);

  const next = migration.indexOf("-- tool-slug: ", start + marker.length);
  return migration.slice(start, next === -1 ? migration.length : next);
}
