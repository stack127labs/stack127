import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260817170257_secure_set_updated_at_search_path.sql",
    import.meta.url,
  ),
  "utf8",
);

test("updated-at trigger function has a fixed search path", () => {
  assert.match(migration, /alter function public\.set_updated_at\(\)/);
  assert.match(migration, /set search_path = pg_catalog/);
});
