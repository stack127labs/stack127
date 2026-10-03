import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function publicationProxy({ published = false } = {}) {
  const lookups = [];
  const exports = {};
  const source = readFileSync(new URL("../../proxy.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, {
    exports, Headers, URLSearchParams, process: { env: { NODE_ENV: "production" } },
    require(name) {
      if (name === "next/server") return {
        NextResponse: {
          next: () => ({ status: 200, headers: new Headers() }),
          rewrite: (url, options) => ({ status: options.status, url, headers: new Headers() }),
        },
      };
      if (name === "@/lib/page-registry") return {
        slugFromPathname: pathname => pathname.slice(1),
        getExactPublishedPage: async slug => { lookups.push(slug); return published ? { slug, page_family: "site" } : null; },
      };
      if (name === "@/lib/tool-catalogs") return { getPublishedToolCatalog: async () => null };
      if (name === "@/lib/directory-pages") return { getPublishedDirectoryPage: async () => null };
      if (name === "@/lib/tool-pages") return { getPublishedToolPage: async () => null };
      if (name === "@/lib/page-source") return { sitePageAvailable: () => published };
      if (name === "@/lib/seo") return { absoluteUrl: pathname => new URL(pathname, "https://stack127.com").toString() };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return { proxy: exports.proxy, lookups };
}

function request(pathname) {
  const url = new URL(pathname, "https://stack127.com");
  url.clone = () => new URL(url);
  return { method: "POST", headers: new Headers(), nextUrl: url };
}

test("Umami collection reaches its handler without a published page record", async () => {
  const { proxy, lookups } = publicationProxy();
  const response = await proxy(request("/vitals/api/send"));
  assert.equal(response.status, 200);
  assert.deepEqual(lookups, []);
  assert.equal(response.headers.get("X-Stack127-Cache-Class"), null);
});

test("CLI app pages and their index share the Cloudflare catalog purge tag", async () => {
  const { proxy } = publicationProxy({ published: true });
  for (const pathname of ["/cli-apps", "/api/cli-apps/index"]) {
    const response = await proxy(request(pathname));
    assert.equal(response.status, 200);
    const tags = response.headers.get("Cache-Tag").split(",");
    assert.ok(tags.includes("stack127-public"));
    assert.ok(tags.includes("cli-apps-catalog"));
    assert.ok(tags.includes(`page:${pathname.slice(1).replaceAll("/", ":")}`));
  }
});

test("hardware indexes and details share their directory's publication purge tag", async () => {
  const { proxy } = publicationProxy({ published: true });
  for (const pathname of ["/api/hardware-directory/zigbee-devices", "/api/hardware-directory/zigbee-devices/sensor"]) {
    const response = await proxy(request(pathname));
    assert.ok(response.headers.get("Cache-Tag").split(",").includes("page:zigbee-devices"));
  }
});

test("the analytics exception leaves unpublished pages and other vitals paths blocked", async () => {
  const { proxy, lookups } = publicationProxy();
  for (const pathname of ["/missing-page", "/vitals", "/vitals/api/send/extra"]) {
    const response = await proxy(request(pathname));
    assert.equal(response.status, 404, pathname);
    assert.equal(response.url.pathname, "/publication-not-found");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
  assert.equal(lookups.length, 3);
});

test("query responses send noindex and a clean canonical on every proxy response path", async () => {
  for (const published of [false, true]) {
    const { proxy } = publicationProxy({ published });
    for (const pathname of ["/about", "/missing-page", "/vitals/api/send", "/api/health", "/sitemap.xml", "/robots.txt", "/publication-not-found"]) {
      for (const query of ["?q=word&page=2", "?q=", "?_rsc=internal"]) {
        const response = await proxy(request(pathname + query));
        assert.equal(response.headers.get("X-Robots-Tag"), "noindex, follow", pathname + query);
        assert.equal(response.headers.get("Link"), `<https://stack127.com${pathname}>; rel="canonical"`, pathname + query);
      }
      const clean = await proxy(request(pathname));
      assert.equal(clean.headers.get("X-Robots-Tag"), null, pathname);
      assert.equal(clean.headers.get("Link"), null, pathname);
    }
  }
});
