import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function publicationProxy() {
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
        getExactPublishedPage: async slug => { lookups.push(slug); return null; },
      };
      if (name === "@/lib/tool-catalogs") return { getPublishedToolCatalogs: async () => [] };
      if (name === "@/lib/tool-pages") return { getPublishedToolPage: async () => null };
      if (name === "@/lib/page-source") return { sitePageAvailable: () => false };
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
