import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const slugs = [
  "zigbee-devices",
  "zigbee-coordinators",
  "z-wave-devices",
  "nut-compatible-ups",
  "local-security-cameras",
  "matter-devices",
];

test("the approved hardware directories are published by one reviewed migration", async () => {
  const migration = await readFile(
    "supabase/migrations/20260905185000_publish_hardware_directories.sql",
    "utf8",
  );

  assert.match(migration, /insert into public\.stack127_pages/u);
  assert.match(migration, /page_family/u);
  assert.match(migration, /'catalog'/u);
  assert.match(migration, /is_published/u);
  assert.match(migration, /true/u);
  assert.match(migration, /updated_at/u);
  assert.doesNotMatch(migration, /updated_at = now\(\)/u);

  for (const slug of slugs) {
    assert.match(migration, new RegExp(`'${slug}'`, "u"));
    const manifest = JSON.parse(await readFile(`tests/pages/${slug}/page.json`, "utf8"));
    assert.equal(manifest.state, "published", `${slug} must be marked published`);
    assert.ok(
      manifest.tests.includes("tests/pages/hardware-directories/shared/publication.test.mjs"),
      `${slug} must own the publication test`,
    );
  }
});
