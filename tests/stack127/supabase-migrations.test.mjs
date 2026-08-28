import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const updatedAtMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260817170257_secure_set_updated_at_search_path.sql",
    import.meta.url,
  ),
  "utf8",
);

test("updated-at trigger function has a fixed search path", () => {
  assert.match(updatedAtMigration, /alter function public\.set_updated_at\(\)/);
  assert.match(updatedAtMigration, /set search_path = pg_catalog/);
});

const provenanceMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260820164032_rebrand_open_project_provenance.sql",
    import.meta.url,
  ),
  "utf8",
);

test("legacy public provenance labels migrate to stack127 values", () => {
  assert.match(provenanceMigration, /update public\.open_projects/);
  assert.match(provenanceMigration, /replace\(summary_source, 'version127', 'stack127'\)/);
  assert.match(provenanceMigration, /'version127_enriched'/);
  assert.match(provenanceMigration, /'version127_manual_refinement'/);
});

const rlsAutoEnableMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260820164412_secure_rls_auto_enable_execute.sql",
    import.meta.url,
  ),
  "utf8",
);

test("managed RLS event trigger is not exposed as a public RPC", () => {
  assert.match(rlsAutoEnableMigration, /to_regprocedure\('public\.rls_auto_enable\(\)'\)/);
  assert.match(
    rlsAutoEnableMigration,
    /revoke execute on function public\.rls_auto_enable\(\) from public, anon, authenticated/,
  );
});

const removeShortcutRoutesMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260827122558_remove_shortcut_routes.sql",
    import.meta.url,
  ),
  "utf8",
);

test("the removed shortcut route family leaves the publication registry", () => {
  assert.match(removeShortcutRoutesMigration, /delete from public\.stack127_pages/);
  assert.match(removeShortcutRoutesMigration, /slug = 'shortcuts'/);
  assert.match(removeShortcutRoutesMigration, /slug like 'shortcuts\/%'/);
  assert.doesNotMatch(removeShortcutRoutesMigration, /redirect/i);
});

const restoreKeyboardShortcutPagesMigration = readFileSync(
  new URL(
    "../../supabase/migrations/20260828032950_restore_keyboard_shortcut_pages.sql",
    import.meta.url,
  ),
  "utf8",
);

test("keyboard shortcut app pages return under the canonical directory", () => {
  const canonicalSlugs = [
    ...restoreKeyboardShortcutPagesMigration.matchAll(/'keyboard-shortcuts\/([^']+)'/g),
  ].map((match) => match[1]);

  assert.equal(canonicalSlugs.length, 26);
  assert.equal(new Set(canonicalSlugs).size, 26);
  assert.ok(canonicalSlugs.includes("notion"));
  assert.ok(canonicalSlugs.includes("vscode"));
  assert.doesNotMatch(restoreKeyboardShortcutPagesMigration, /'shortcuts\//);
  assert.doesNotMatch(restoreKeyboardShortcutPagesMigration, /redirect/i);
});
