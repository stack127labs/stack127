import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const migration = readFileSync(
  new URL("../../../../supabase/migrations/20260728090000_add_rdap_cache.sql", import.meta.url),
  "utf8",
);

test("RDAP cache is protected from public Data API roles", () => {
  assert.match(migration, /alter table public\.rdap_cache enable row level security\s*;/i);
  assert.match(migration, /revoke all on table public\.rdap_cache from anon, authenticated\s*;/i);
});

test("RDAP cache schema contains registry facts but no requester identity", () => {
  const tableDefinition = migration.match(
    /create table if not exists public\.rdap_cache\s*\(([\s\S]*?)\)\s*;/i,
  )?.[1];

  assert.ok(tableDefinition, "rdap_cache table definition is present");
  assert.doesNotMatch(tableDefinition, /\b(ip|requester|visitor|session|client_key|user_id)\b/i);
  assert.match(tableDefinition, /\burl text primary key\b/i);
  assert.match(tableDefinition, /\bbody jsonb\b/i);
});
