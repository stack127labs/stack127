import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("the directory loads lightweight filter rows before detailed page records", async () => {
  const apps = await read("lib/apps.ts");
  const page = await read("app/(site)/(directories)/self-host-apps/page.tsx");

  assert.match(apps, /export type DirectoryAppIndex/);
  assert.match(apps, /export async function getDirectoryAppIndex/);
  assert.match(apps, /export async function getDirectoryAppsBySlugs/);
  assert.match(apps, /app\.slug = any\(\$1::text\[\]\)/);
  assert.match(apps, /jsonb_array_elements\(coalesce\(install_option\.options/);
  assert.match(apps, /const DIRECTORY_APP_INDEX_BATCH_SIZE = 750/);
  assert.match(apps, /async function loadDirectoryAppIndexBatch/);
  assert.match(apps, /limit \$1\s+offset \$2/);
  assert.match(apps, /Math\.ceil\(appCount \/ DIRECTORY_APP_INDEX_BATCH_SIZE\)/);
  assert.match(page, /getDirectoryAppIndex\(\)/);
  assert.match(page, /getDirectoryAppsBySlugs\(paginatedIndexApps\.map/);
  assert.doesNotMatch(page, /getDirectoryApps\(\)/);
});
