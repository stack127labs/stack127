import assert from "node:assert/strict";
import test from "node:test";
import { buildSiteMenus, createSiteMenusLoader, siteMenuSection } from "../../lib/site-menus.ts";

const feature = (slug, family, name, counts = [{ value: 3 }]) => ({ slug, family, name, iconKey: slug, counts });

const menus = buildSiteMenus({
  catalogs: [
    { slug: "saas-tools", name: "SaaS tools", iconKey: "trending-up", toolCount: 20 },
    { slug: "dns-tools", name: "DNS tools", iconKey: "network", toolCount: 0 },
  ],
  features: [
    feature("self-host-apps", "directory", "Self-host apps", [{ value: 1200 }]),
    feature("ad-networks", "directory", "Ad networks", [{ value: 40 }, { value: 9000 }]),
    feature("self-hosting-for-beginners", "course", "Self-hosting for beginners"),
    feature("labs", "site", "Labs"),
    feature("epp-status-codes", "directory", "EPP status codes", []),
  ],
  toolSlugs: ["mrr-calculator", "dns-lookup", "mrr-calculator"],
});

test("menus list catalogs and directories in source order with lowercase names and first counts", () => {
  assert.deepEqual(menus.tools.map(({ href, label, count }) => [href, label, count]), [
    ["/saas-tools", "saas tools", 20],
    ["/dns-tools", "dns tools", 0],
  ]);
  assert.deepEqual(menus.directories.map(({ href, label, count }) => [href, label, count]), [
    ["/self-host-apps", "self-host apps", 1200],
    ["/ad-networks", "ad networks", 40],
    ["/epp-status-codes", "epp status codes", null],
  ]);
});

test("the course and Labs move below the directories", () => {
  assert.deepEqual(menus.more.map((item) => item.href), ["/self-hosting-for-beginners", "/labs"]);
});

test("catalogs and tools mark the tools menu; directories and their children mark the directories menu", () => {
  assert.equal(siteMenuSection("/saas-tools", menus), "tools");
  assert.equal(siteMenuSection("/mrr-calculator/", menus), "tools");
  assert.equal(siteMenuSection("/dns-lookup?name=example.com", menus), "tools");
  assert.equal(siteMenuSection("/self-host-apps", menus), "directories");
  assert.equal(siteMenuSection("/self-host-apps/categories/media", menus), "directories");
  assert.equal(siteMenuSection("/self-hosting-for-beginners/what-is-self-hosting", menus), "directories");
  assert.equal(siteMenuSection("/self-host-apps-old", menus), null);
  assert.equal(siteMenuSection("/mrr-calculator/extra", menus), null);
  assert.equal(siteMenuSection("/", menus), null);
  assert.equal(siteMenuSection("/about", menus), null);
});

test("the JSON payload preserves rows, icons, counts, and active paths", () => {
  const payload = JSON.parse(JSON.stringify(menus));
  assert.deepEqual(payload, menus);
  assert.equal(payload.tools[0].iconKey, "trending-up");
  assert.equal(payload.directories[0].iconKey, "self-host-apps");
  assert.equal(siteMenuSection("/self-host-apps", payload), "directories");
});

test("idle loading and opening share one request and reuse the result", async () => {
  let calls = 0;
  let resolve;
  const load = createSiteMenusLoader(() => {
    calls++;
    return new Promise(done => { resolve = done; });
  });
  const idle = load();
  const opened = load();
  assert.equal(idle, opened);
  assert.equal(calls, 1);
  resolve(menus);
  assert.equal(await idle, menus);
  assert.equal(await load(), menus);
  assert.equal(calls, 1);
});

test("a failed menu request can retry, then stays cached", async () => {
  let calls = 0;
  const load = createSiteMenusLoader(async () => {
    if (++calls === 1) throw new Error("offline");
    return menus;
  });
  const failed = load();
  assert.equal(load(), failed);
  await assert.rejects(failed, /offline/);
  assert.equal(await load(), menus);
  assert.equal(await load(), menus);
  assert.equal(calls, 2);
});

test("app directories sit under one heading and mark the directories menu", () => {
  const withStack = buildSiteMenus({
    catalogs: [],
    features: [],
    toolSlugs: [],
    appStack: { label: "For your app's stack", pages: [{ slug: "file-storage", name: "File storage", iconKey: "files", apps: 65 }] },
  });
  assert.deepEqual(withStack.appStack, { label: "for your app's stack", items: [{ href: "/file-storage", label: "file storage", iconKey: "files", count: 65 }] });
  assert.equal(siteMenuSection("/file-storage", withStack), "directories");
  assert.deepEqual(menus.appStack.items, []);
});
