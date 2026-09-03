import assert from "node:assert/strict";
import { access, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function exists(path) {
  try {
    await access(new URL(path, root));
    return true;
  } catch {
    return false;
  }
}

async function routeDirectories(group) {
  const entries = await readdir(new URL(`app/(site)/(${group})/`, root), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();
}

test("catalogs contain only collections of stack127 pages", async () => {
  assert.deepEqual(await routeDirectories("catalogs"), ["dns-tools", "domain-tools", "storage-tools"]);
});

test("directories contain only third-party software listings", async () => {
  assert.deepEqual(await routeDirectories("directories"), ["cli-apps", "self-host-apps"]);
});

test("references contain stable fact and lookup pages", async () => {
  assert.deepEqual(await routeDirectories("references"), [
    "epp-status-codes",
    "keyboard-shortcuts",
    "software-licenses-for-self-hosting",
    "tld-directory",
  ]);
});

test("site routes are owned by explicit non-URL page families", async () => {
  for (const route of [
    "app/(site)/(catalogs)/dns-tools/page.tsx",
    "app/(site)/(catalogs)/domain-tools/page.tsx",
    "app/(site)/(catalogs)/storage-tools/page.tsx",
    "app/(site)/(directories)/cli-apps/page.tsx",
    "app/(site)/(directories)/self-host-apps/page.tsx",
    "app/(site)/(references)/epp-status-codes/page.tsx",
    "app/(site)/(references)/keyboard-shortcuts/page.tsx",
    "app/(site)/(references)/software-licenses-for-self-hosting/page.tsx",
    "app/(site)/(references)/tld-directory/page.tsx",
    "app/(site)/(courses)/self-hosting-for-beginners/page.tsx",
    "app/(site)/(legal)/about/page.tsx",
    "app/(site)/(legal)/privacy/page.tsx",
    "app/(site)/(legal)/terms/page.tsx",
  ]) {
    assert.equal(await exists(route), true, `${route} should exist`);
  }
});

test("routes have one structural owner", async () => {
  assert.equal(await exists("app/(site)/software-licenses-for-self-hosting"), false);
  assert.equal(await exists("app/(site)/about"), false);
  assert.equal(await exists("app/(site)/(catalogs)/self-host-apps"), false);
  assert.equal(await exists("app/(site)/(catalogs)/keyboard-shortcuts"), false);
  assert.equal(await exists("app/(site)/(catalogs)/tld-directory"), false);
});

test("the duplicate shortcuts route family is absent", async () => {
  assert.equal(await exists("app/(site)/shortcuts"), false);
  assert.equal(await exists("tests/pages/shortcuts"), false);
  assert.equal(await exists("content_docs/shortcuts"), false);
});

test("keyboard shortcut app pages stay inside the reference family", async () => {
  assert.equal(await exists("app/(site)/(references)/keyboard-shortcuts/notion/page.tsx"), true);
  assert.equal(await exists("tests/pages/keyboard-shortcuts/notion/page.json"), true);
});

test("route-family names do not appear in public URLs", async () => {
  assert.equal(await exists("app/(site)/(catalogs)/catalogs"), false);
  assert.equal(await exists("app/(site)/(directories)/directories"), false);
  assert.equal(await exists("app/(site)/(references)/references"), false);
  assert.equal(await exists("app/(site)/(courses)/courses"), false);
  assert.equal(await exists("app/(site)/(legal)/legal"), false);
});
