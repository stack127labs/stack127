import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../../../app/(site)/storage-tools/page.tsx", import.meta.url), "utf8");
const sidebar = readFileSync(new URL("../../../app/(site)/storage-tools/storage-tools-sidebar.tsx", import.meta.url), "utf8");
const manifestPath = new URL("page.json", import.meta.url);
const migrationPath = new URL(
  "../../../supabase/migrations/20260809140000_publish_storage_tools.sql",
  import.meta.url,
);

test("the published storage hub lists all three completed calculators", () => {
  assert.match(page, /RAID Capacity and Level Explorer/);
  assert.match(page, /\/raid-calculator/);
  assert.match(page, /ZFS Pool Capacity Calculator/);
  assert.match(page, /\/zfs-capacity-calculator/);
  assert.match(sidebar, /RAID calculator/);
  assert.match(sidebar, /ZFS calculator/);
  assert.match(page, /ZFS Block Size and Padding Calculator/);
  assert.match(page, /\/zfs-padding-calculator/);
  assert.match(sidebar, /ZFS padding/);
});

test("the hub is registry published and exposes its tool count to the home card", () => {
  assert.equal(existsSync(migrationPath), true);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/storage-tools");
  assert.equal(manifest.state, "published");
  assert.match(readFileSync(migrationPath, "utf8"), /'storage-tools'/);
  assert.match(sidebar, /export const storageToolCount = availableStorageTools\.length;/);
});

test("the hub route declares no page-local metadata", () => {
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
});
