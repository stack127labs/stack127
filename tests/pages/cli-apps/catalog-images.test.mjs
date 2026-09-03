import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isManagedMediaUrl } from "../../../scripts/stack127/media/storage.mjs";

const root = new URL("../../../", import.meta.url);
const batchPath = new URL("scripts/cli-apps/batches/curated-publish.json", root);

async function curatedRecords() {
  const batch = JSON.parse(await readFile(batchPath, "utf8"));
  return batch.records ?? [];
}

test("every reviewed CLI app uses the shared Supabase media bucket", async () => {
  const records = await curatedRecords();

  assert.ok(records.length >= 200, "expected the reviewed catalog batch");

  for (const record of records) {
    assert.equal(
      isManagedMediaUrl(record.icon_url, { directory: "cli-apps", kind: "icons" }),
      true,
      `${record.slug} needs its managed media URL`,
    );
    assert.ok(record.icon_source_url, `${record.slug} needs icon source provenance`);
  }
});

test("the CLI publisher stores icon URLs and their provenance", async () => {
  const publisher = await readFile(new URL("scripts/cli-apps/publish-apps.mjs", root), "utf8");

  assert.match(publisher, /const iconUrl = record\.icon_url \?\? null/);
  assert.match(publisher, /maintenance_status, icon_url, screenshot_url/);
  assert.match(publisher, /icon_url = excluded\.icon_url/);
  assert.match(publisher, /\["icon_url", "media_storage"/);
});

test("the directory uses the database URL and a generated fallback", async () => {
  const browser = await readFile(new URL("app/(site)/(catalogs)/cli-apps/cli-app-browser.tsx", root), "utf8");

  assert.match(browser, /app\.icon_url \?\? fallback/);
  assert.doesNotMatch(browser, /\/cli-app-icons\//);
  assert.doesNotMatch(browser, /google\.com\/s2\/favicons/);
});

test("the icon cache uses official sites or repository owners before a generated fallback", async () => {
  const cache = await readFile(new URL("scripts/cli-apps/cache-icons.mjs", root), "utf8");

  assert.match(cache, /icon_source_url/);
  assert.match(cache, /github\.com/);
  assert.match(cache, /favicon/);
  assert.match(cache, /sharp/);
  assert.match(cache, /uploadMediaObject/);
  assert.doesNotMatch(cache, /public\/cli-app-icons/);
});
