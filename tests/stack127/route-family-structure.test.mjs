import assert from "node:assert/strict";
import { access } from "node:fs/promises";
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

test("site routes are owned by explicit non-URL page families", async () => {
  for (const route of [
    "app/(site)/(catalogs)/cli-apps/page.tsx",
    "app/(site)/(catalogs)/self-host-apps/page.tsx",
    "app/(site)/(catalogs)/keyboard-shortcuts/page.tsx",
    "app/(site)/(catalogs)/dns-tools/page.tsx",
    "app/(site)/(catalogs)/domain-tools/page.tsx",
    "app/(site)/(catalogs)/storage-tools/page.tsx",
    "app/(site)/(catalogs)/software-licenses-for-self-hosting/page.tsx",
    "app/(site)/(courses)/self-hosting-for-beginners/page.tsx",
    "app/(site)/(legal)/about/page.tsx",
    "app/(site)/(legal)/privacy/page.tsx",
    "app/(site)/(legal)/terms/page.tsx",
  ]) {
    assert.equal(await exists(route), true, `${route} should exist`);
  }
});

test("catalog and legal routes have one structural owner", async () => {
  assert.equal(await exists("app/(site)/software-licenses-for-self-hosting"), false);
  assert.equal(await exists("app/(site)/about"), false);
});

test("the duplicate shortcuts route family is absent", async () => {
  assert.equal(await exists("app/(site)/shortcuts"), false);
  assert.equal(await exists("tests/pages/shortcuts"), false);
  assert.equal(await exists("content_docs/shortcuts"), false);
});

test("route-family names do not appear in public URLs", async () => {
  assert.equal(await exists("app/(site)/(catalogs)/catalogs"), false);
  assert.equal(await exists("app/(site)/(courses)/courses"), false);
  assert.equal(await exists("app/(site)/(legal)/legal"), false);
});
