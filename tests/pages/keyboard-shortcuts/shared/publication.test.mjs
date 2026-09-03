import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shortcutAppCatalog } from "../../../../lib/shortcuts/index.ts";

const originalMigration = readFileSync(
  new URL("../../../../supabase/migrations/20260828032950_restore_keyboard_shortcut_pages.sql", import.meta.url),
  "utf8",
);
const expansionMigration = readFileSync(
  new URL("../../../../supabase/migrations/20260903053518_publish_keyboard_shortcut_expansion.sql", import.meta.url),
  "utf8",
);

function shortcutSlugs(sql) {
  return [...sql.matchAll(/'keyboard-shortcuts\/([^']+)'/g)].map((match) => match[1]);
}

test("the publication migrations cover every verified shortcut app once", () => {
  const originalSlugs = shortcutSlugs(originalMigration);
  const expansionSlugs = shortcutSlugs(expansionMigration);
  const publishedSlugs = [...originalSlugs, ...expansionSlugs];
  const expectedSlugs = shortcutAppCatalog.map((app) => app.slug);

  assert.equal(originalSlugs.length, 26);
  assert.equal(expansionSlugs.length, 192);
  assert.equal(new Set(publishedSlugs).size, 218);
  assert.deepEqual([...publishedSlugs].sort(), [...expectedSlugs].sort());
  assert.match(expansionMigration, /'catalog'/);
  assert.match(expansionMigration, /'2026-09-03T00:00:00\.000Z'/);
});
