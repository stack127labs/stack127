import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSelfHostAppsSearchParams as parse,
  selectSelfHostApps as select,
  selfHostAppsFacets,
} from "../../lib/self-host-apps-search.ts";

const app = (slug, overrides = {}) => ({
  slug, name: slug, summary: "A photo server", publisher_name: "Publisher", icon_url: null,
  categories: [{ slug: "photos", name: "Photos", icon_key: "camera" }],
  license: "MIT", license_spdx_id: "MIT", source_model: "open_source", pricing_model: "free",
  maintenance_status: "active", docker_support: "official", install_methods: ["docker", "compose"],
  compose_support: true, requires_database: true, surfaces: ["android"], popularity_score: 10,
  ram_min_mb: null, ram_recommended_mb: null, ram_default_limit_mb: null, ram_researched: false,
  storage_min_gb: null, storage_profile: "unknown", storage_researched: false,
  ram_estimate_min_mb: 512, ram_estimate_max_mb: 1024,
  storage_estimate_min_gb: 2, storage_estimate_max_gb: 8,
  release_published_at: null, github_last_commit_at: null, ...overrides,
});
const params = query => parse(new URLSearchParams(query));
const slugs = result => result.apps.map(app => app.slug);

test("defaults and repeated filters are validated, while invalid inputs fail", () => {
  assert.equal(params("").sort, "popular");
  assert.equal(params("").page, 1);
  assert.deepEqual(params("source=open_source&source=closed_source&source=open_source").source, ["open_source", "closed_source"]);
  assert.equal(params("page=2000000").page, 1000000);
  for (const query of ["page=0", "page=-1", "page=1.5", "page=1e3", "page=9007199254740992", "page=1&page=2", "sort=stars", "ram=bad", "storage=bad", "install=bad", "source=bad", "license=bad", "signal=bad", "category=bad/slug", "unexpected=1", "q=" + "a".repeat(201), "q=a%00b"]) {
    assert.throws(() => params(query), undefined, query);
  }
  assert.throws(() => select([app("one")], params("category=missing")), /Unknown category/);
});

test("search matches publishers and categories, OR applies within groups and AND across groups", () => {
  const apps = [app("one"), app("two", { source_model: "closed_source", publisher_name: "Different", categories: [{ slug: "backup", name: "Backups", icon_key: null }] }), app("three", { maintenance_status: "stale" })];
  assert.deepEqual(slugs(select(apps, params("q=different"))), ["two"]);
  assert.deepEqual(slugs(select(apps, params("q=backups"))), ["two"]);
  assert.deepEqual(slugs(select(apps, params("category=photos&category=backup&source=open_source&maintenance=active"))), ["one"]);
  assert.deepEqual(slugs(select(apps, params("license=mit&install=compose&docker=supported&signal=mobile&signal=database&signal=compose"))), ["one", "three", "two"]);
  assert.deepEqual(slugs(select([app("no-mobile", { surfaces: ["web"] }), app("one")], params("signal=mobile"))), ["one"]);
});

test("resource filters exclude unknown estimates, include boundaries, and preserve tier ordering", () => {
  const apps = [app("small"), app("medium", { ram_estimate_min_mb: 2048, popularity_score: 1 }), app("large", { ram_estimate_min_mb: 2049 }), app("unknown", { ram_estimate_min_mb: null, storage_estimate_min_gb: null })];
  assert.deepEqual(slugs(select(apps, params("ram=1-2gb"))), ["medium", "small"]);
  assert.deepEqual(slugs(select(apps, params("ram=1-2gb&sort=lowest-ram"))), ["small", "medium"]);
  assert.deepEqual(slugs(select(apps, params("storage=depends"))), ["large", "small", "medium"]);
  const storageApps = [app("tiny", { storage_estimate_min_gb: 0.5 }), app("low", { storage_estimate_min_gb: 1 }), app("medium", { storage_estimate_min_gb: 10 }), app("high", { storage_estimate_min_gb: 100 })];
  assert.deepEqual(slugs(select(storageApps, params("storage=low"))), ["low", "tiny"]);
});

test("sorts and pagination return matching totals and clamp the page", () => {
  const apps = Array.from({ length: 65 }, (_, index) => app(`app-${String(index).padStart(2, "0")}`, { popularity_score: index }));
  const second = select(apps, params("sort=name&page=2"));
  assert.equal(second.total, 65);
  assert.equal(second.pageSize, 24);
  assert.equal(second.totalPages, 3);
  assert.equal(second.currentPage, 2);
  assert.equal(second.apps.length, 24);
  assert.equal(second.apps[0].slug, "app-24");
  assert.equal(second.apps[0].ram_estimated, true);
  const last = select(apps, params("page=100"));
  assert.equal(last.currentPage, 3);
  assert.equal(last.apps.length, 17);
  assert.deepEqual(slugs(select([app("stale", { maintenance_status: "stale", popularity_score: 100 }), app("active")], params("sort=healthy"))), ["active", "stale"]);
  assert.deepEqual(slugs(select([app("unknown", { ram_estimate_min_mb: null }), app("small")], params("sort=lowest-ram"))), ["small", "unknown"]);
  const empty = select(apps, params("q=no-match"));
  assert.equal(empty.total, 0);
  assert.equal(empty.currentPage, 1);
  assert.equal(empty.totalPages, 1);
});

test("sidebar counts use the complete index and preserve the existing option shapes", () => {
  const facets = selfHostAppsFacets([app("one"), app("two", { install_methods: ["native"] })]);
  assert.deepEqual(facets.categories, [{ value: "photos", label: "Photos", iconKey: "camera" }]);
  assert.equal(facets.licenses.find(option => option.value === "mit").count, 2);
  assert.deepEqual(facets.installMethods, [
    { value: "docker", label: "Docker image", count: 1 },
    { value: "compose", label: "Docker Compose", count: 1 },
    { value: "native", label: "Native", count: 1 },
  ]);
});

async function loadWithImports(path, imports, globals = {}) {
  const { readFileSync } = await import("node:fs");
  const { default: ts } = await import("typescript");
  const { default: vm } = await import("node:vm");
  const exports = {};
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, {
    exports, URL, URLSearchParams, Response, AbortSignal, console: { error() {} }, process: { env: {} },
    require(name) {
      if (name in imports) return imports[name];
      throw new Error(`Unexpected import: ${name}`);
    }, ...globals,
  });
  return exports;
}
const nextServer = { NextResponse: { json: (value, options = {}) => Response.json(value, options) } };

test("the search API caches successful results and never caches bad input, unpublished data, or load failures", async () => {
  const searchModule = await import("../../lib/self-host-apps-search.ts");
  let published = true;
  let fail = false;
  let calls = 0;
  const body = { ...select([app("one")], params("")), detailApps: [app("one")], facets: selfHostAppsFacets([app("one")]) };
  const { GET } = await loadWithImports("../../app/api/self-host-apps/search/route.ts", {
    "next/server": nextServer,
    "@/lib/self-host-apps-search": searchModule,
    "@/lib/page-registry": { getPublishedPage: async () => published ? {} : null },
    "@/lib/self-host-apps-search-data": { getSelfHostAppsSearch: async () => { calls++; if (fail) throw new Error("database unavailable"); return body; } },
  });
  const request = query => new Request(`https://stack127.com/api/self-host-apps/search${query}`);
  const ok = await GET(request("?sort=name"));
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("Cache-Control"), /s-maxage=604800/);
  assert.ok(ok.headers.get("Cache-Tag").includes("page:api:self-host-apps:search"));
  assert.ok(ok.headers.get("Cache-Tag").includes("self-host-catalog"));
  assert.deepEqual(await ok.json(), body);
  const invalid = await GET(request("?page=-1"));
  assert.equal(invalid.status, 400);
  assert.equal(invalid.headers.get("Cache-Control"), "no-store");
  assert.equal(calls, 1);
  published = false;
  const hidden = await GET(request(""));
  assert.equal(hidden.status, 404);
  assert.equal(hidden.headers.get("Cache-Control"), "no-store");
  assert.equal(calls, 1);
  published = true; fail = true;
  const unavailable = await GET(request(""));
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers.get("Cache-Control"), "no-store");
});

test("search cards and details stay in the same order, and missing details fail instead of returning an incomplete result", async () => {
  const searchModule = await import("../../lib/self-host-apps-search.ts");
  let details = [app("z"), app("a")];
  const loaders = {
    getDirectoryAppIndex: async () => [app("z"), app("a")],
    getDirectoryAppsBySlugs: async () => details,
    loadDirectoryAppIndex: async () => [app("fresh")],
    loadDirectoryAppsBySlugs: async () => [app("fresh")],
  };
  const data = await loadWithImports("../../lib/self-host-apps-search-data.ts", {
    "./apps": loaders, "./self-host-apps-search": searchModule,
  });
  const result = await data.getSelfHostAppsSearch(params("sort=name"));
  assert.deepEqual(result.apps.map(app => app.slug), ["a", "z"]);
  assert.deepEqual(Array.from(result.detailApps, app => app.slug), ["a", "z"]);
  assert.equal((await data.loadSelfHostAppsSearch(params(""))).apps[0].slug, "fresh");
  details = [app("a")];
  await assert.rejects(data.getSelfHostAppsSearch(params("")), /Missing search detail/);
});

test("origin verification checks search against the source and rejects a stale response before the edge purge", async () => {
  const searchModule = await import("../../lib/self-host-apps-search.ts");
  const expected = { ...select([app("one")], params("")), detailApps: [app("one")], facets: selfHostAppsFacets([app("one")]) };
  let served = expected;
  let published = true;
  const { POST } = await loadWithImports("../../app/api/cache/refresh/route.ts", {
    "next/server": nextServer,
    "@/scripts/stack127/cache/refresh.mjs": { cacheBodyDigest: async () => "digest" },
    "@/lib/cache-auth": { cacheAuthorized: async () => true },
    "@/lib/apps": { loadDirectoryAppsBySlugs: async () => { throw new Error("Search cannot be treated as an app slug"); } },
    "@/lib/terminal-apps": {},
    "@/lib/hardware-directories": {},
    "@/lib/hardware-directories/search-index": {},
    "@/lib/zigbee-devices": {},
    "@/lib/zigbee-devices/search-index": {},
    "@/lib/amazon-affiliate/server": {},
    "@/lib/self-host-apps-search-data": { loadSelfHostAppsSearch: async () => expected },
    "@/lib/self-host-apps-search": searchModule,
    "@/lib/self-hosted-app-resource-planner/data": {},
    "@/lib/db": { getPool: () => ({ query: async () => ({ rows: [{ is_published: published }] }) }) },
    "@/lib/page-source": {},
    "@/lib/platform-fees/groups": {},
    "@/lib/launch-directories-data": {},
  }, { fetch: async () => published ? Response.json(served) : Response.json({ error: "Directory not found." }, { status: 404 }) });
  const request = () => new Request("https://stack127.com/api/cache/refresh", {
    method: "POST", body: JSON.stringify({ paths: ["/api/self-host-apps/search"] }),
  });
  const fresh = await POST(request());
  assert.equal(fresh.status, 200);
  assert.equal((await fresh.json()).verified[0].digest, "digest");
  served = { ...expected, total: 0 };
  assert.equal((await POST(request())).status, 503);
  published = false;
  const removed = await POST(request());
  assert.equal(removed.status, 200);
  assert.equal((await removed.json()).verified[0].status, 404);
});

test("origin verification rejects stale CLI and hardware indexes and verifies unpublished 404s", async () => {
  for (const [path, parent] of [
    ["/api/cli-apps/index", "cli-apps"],
    ["/api/hardware-directory/matter-devices", "matter-devices"],
    ["/api/hardware-directory/zigbee-devices", "zigbee-devices"],
  ]) {
    const expected = [{ slug: "fresh" }];
    let served = expected;
    let published = true;
    let status = 200;
    const { POST } = await loadWithImports("../../app/api/cache/refresh/route.ts", {
      "next/server": nextServer,
      "@/scripts/stack127/cache/refresh.mjs": { cacheBodyDigest: async () => "digest" },
      "@/lib/cache-auth": { cacheAuthorized: async () => true },
      "@/lib/apps": {},
      "@/lib/terminal-apps": { loadTerminalApps: async () => expected },
      "@/lib/hardware-directories": {
        isHardwareDirectorySlug: slug => slug === "matter-devices",
        getHardwareDirectorySnapshot: async () => ({ records: expected }),
      },
      "@/lib/hardware-directories/search-index": { hardwareIndexRecord: record => record },
      "@/lib/zigbee-devices": { getZigbeeDevices: () => expected, zigbeeCategoryLabels: new Map() },
      "@/lib/zigbee-devices/search-index": { zigbeeIndexRecord: record => record },
      "@/lib/amazon-affiliate/server": { addAmazonMatches: async (_directory, records) => records },
      "@/lib/self-host-apps-search-data": {},
      "@/lib/self-host-apps-search": {},
      "@/lib/self-hosted-app-resource-planner/data": {},
      "@/lib/db": { getPool: () => ({ query: async (_sql, values) => {
        assert.equal(values[0], parent);
        return { rows: [{ is_published: published }] };
      } }) },
      "@/lib/page-source": {},
      "@/lib/platform-fees/groups": {},
      "@/lib/launch-directories-data": {},
    }, { fetch: async () => Response.json(served, { status }) });
    const request = () => new Request("https://stack127.com/api/cache/refresh", {
      method: "POST", body: JSON.stringify({ paths: [path] }),
    });
    assert.equal((await POST(request())).status, 200, path);
    served = [{ slug: "stale" }];
    assert.equal((await POST(request())).status, 503, path);
    published = false;
    assert.equal((await POST(request())).status, 503, path);
    status = 404;
    const removed = await POST(request());
    assert.equal(removed.status, 200, path);
    assert.equal((await removed.json()).verified[0].status, 404);
  }
});

test("deleted directory detail sources accept only 404s even when their registry rows remain published", async () => {
  const { getFeeGroup } = await import("../../lib/platform-fees/groups.ts");
  for (const [path, sourceId] of [
    ["/ad-networks/mediavine", "mediavine"],
    ["/platform-fees/creators-and-communities", "Creators and communities"],
  ]) {
    let exists = true;
    let status = 200;
    const revision = "2026-01-01T00:00:00.000Z";
    const { POST } = await loadWithImports("../../app/api/cache/refresh/route.ts", {
      "next/server": nextServer,
      "@/scripts/stack127/cache/refresh.mjs": {},
      "@/lib/cache-auth": { cacheAuthorized: async () => true },
      "@/lib/apps": {}, "@/lib/terminal-apps": {}, "@/lib/hardware-directories": {},
      "@/lib/hardware-directories/search-index": {}, "@/lib/zigbee-devices": {},
      "@/lib/zigbee-devices/search-index": {}, "@/lib/amazon-affiliate/server": {},
      "@/lib/self-host-apps-search-data": {}, "@/lib/self-host-apps-search": {},
      "@/lib/self-hosted-app-resource-planner/data": {},
      "@/lib/page-source": { sitePageAvailable: () => true },
      "@/lib/platform-fees/groups": { getFeeGroup },
      "@/lib/launch-directories-data": {},
      "@/lib/db": { getPool: () => ({ query: async (sql, values) => {
        if (sql.includes("public.stack127_pages")) return { rows: [{ is_published: true, row_updated_at: new Date(revision) }] };
        assert.equal(values[0], sourceId);
        return { rows: exists ? [{}] : [] };
      } }) },
    }, { fetch: async () => new Response(`<meta name="stack127-content-revision" content="${revision}">`, { status }) });
    const request = () => new Request("https://stack127.com/api/cache/refresh", {
      method: "POST", body: JSON.stringify({ paths: [path] }),
    });
    assert.equal((await POST(request())).status, 200, path);
    exists = false;
    assert.equal((await POST(request())).status, 503, path);
    status = 404;
    const removed = await POST(request());
    assert.equal(removed.status, 200, path);
    assert.equal((await removed.json()).verified[0].status, 404);
  }
});
