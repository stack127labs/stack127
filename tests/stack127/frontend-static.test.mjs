import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { inspectAssets, assertNoPrivateCredentials, routeParameters, staticRedirects, freeFileSizeLimit } from "../../scripts/stack127/frontend/assets.mjs";
import { prepareFrontend } from "../../scripts/stack127/frontend/prepare.mjs";
import { activateFrontend } from "../../scripts/stack127/frontend/cloudflare.mjs";
import { verifyFrontend } from "../../scripts/stack127/frontend/deploy.mjs";

async function temporary(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "stack127-static-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("export contains published pages and registry-selected dynamic parameters", async t => {
  const root = await temporary(t);
  const source = path.join(root, "source");
  for (const folder of ["app/(site)/live", "app/(site)/draft", "app/(site)/(catalogs)/[slug]", "app/api/private", "app/vitals", "app/publication-not-found", "lib", "public", "node_modules"]) {
    await mkdir(path.join(source, folder), { recursive: true });
  }
  for (const filename of ["next.config.ts", "mdx-components.tsx", "next-env.d.ts", "tsconfig.json", "package.json", "package-lock.json"]) await writeFile(path.join(source, filename), "{}");
  for (const route of ["live", "draft", "(catalogs)/[slug]"]) {
    await writeFile(path.join(source, "app/(site)", route, "page.tsx"), "export default function Page() { return null; }\n");
    await writeFile(path.join(source, "app/(site)", route, "layout.tsx"), 'const registry = registryLayout("/x");\nexport function generateStaticParams() { return []; }\n');
  }
  await writeFile(path.join(source, ".env.local"), "PRIVATE_TOKEN=never-copy-this-value");
  await writeFile(path.join(source, "proxy.ts"), "private request runtime");
  await writeFile(path.join(source, "node_modules/dependency.js"), "export default 1;");
  await symlink("dependency.js", path.join(source, "node_modules/linked.js"));
  const target = path.join(root, "export");
  await prepareFrontend(source, target, [{ slug: "live", page_family: "site" }, { slug: "tools", page_family: "catalog" }]);
  await rm(path.join(source, "node_modules"), { recursive: true });
  assert.equal(await readFile(path.join(target, "node_modules/linked.js"), "utf8"), "export default 1;");
  await mkdir(path.join(source, "node_modules"));
  assert.match(await readFile(path.join(target, "app/(site)/(catalogs)/[slug]/page.tsx"), "utf8"), /return \[\{"slug":"tools"\}\]/);
  for (const removed of ["app/(site)/draft/page.tsx", "app/(site)/draft/layout.tsx", "app/api", "app/vitals", "app/publication-not-found", ".env.local", "proxy.ts"]) {
    await assert.rejects(readFile(path.join(target, removed)), { code: "ENOENT" });
  }
  await assert.rejects(prepareFrontend(source, path.join(root, "missing"), [{ slug: "absent", page_family: "site" }]), /no exportable source/);
  assert.deepEqual(routeParameters("/platform-fees/[section]", [{ slug: "platform-fees/payments", page_family: "directory" }, { slug: "unrelated", page_family: "directory" }]), [{ section: "payments" }]);
});

test("static upload rejects missing pages, oversized assets, symlinks and private credentials", async t => {
  const directory = await temporary(t);
  await assert.rejects(inspectAssets(directory), /homepage and a real 404/);
  await writeFile(path.join(directory, "index.html"), "public page");
  await writeFile(path.join(directory, "404.html"), "missing page");
  assert.equal((await inspectAssets(directory)).files, 2);
  await writeFile(path.join(directory, "large.bin"), Buffer.alloc(freeFileSizeLimit + 1));
  await assert.rejects(inspectAssets(directory), /25 MiB/);
  await rm(path.join(directory, "large.bin"));
  await symlink("index.html", path.join(directory, "link.html"));
  await assert.rejects(inspectAssets(directory), /non-file/);
  await rm(path.join(directory, "link.html"));
  await writeFile(path.join(directory, "leak.html"), "private-credential-value");
  await assert.rejects(assertNoPrivateCredentials(directory, { SUPABASE_SECRET_KEY: "private-credential-value" }), /SUPABASE_SECRET_KEY.*leak.html/);
  await assertNoPrivateCredentials(directory, { NEXT_PUBLIC_TOKEN: "private-credential-value" });
});

test("activation installs API exclusions before the frontend and refuses another worker", async () => {
  const calls = [];
  const api = async (url, options) => {
    calls.push({ url, ...options });
    return url.endsWith("/workers/routes") && !options.method ? [] : url.endsWith("/rulesets") && !options.method ? [] : {};
  };
  await activateFrontend({ environment: { CLOUDFLARE_ZONE_ID: "zone" }, api });
  const routes = calls.filter(call => call.url.endsWith("/workers/routes") && call.method);
  assert.deepEqual(routes.map(call => call.body.pattern), ["stack127.com/api/*", "stack127.com/vitals/*", "stack127.com/*"]);
  assert.deepEqual(routes.map(call => call.body.script), [null, null, "stack127-frontend"]);
  const writes = [];
  await assert.rejects(activateFrontend({ environment: { CLOUDFLARE_ZONE_ID: "zone" }, api: async (url, options) => {
    if (options.method) writes.push(url);
    return [{ pattern: "stack127.com/*", script: "another-site" }];
  } }), /Another Worker owns/);
  assert.deepEqual(writes, []);
});

test("live verification rejects a fallback homepage for a missing URL", async () => {
  const sha = "a".repeat(40);
  const fetchImplementation = async url => new Response(url.endsWith("/frontend-release.json") ? JSON.stringify({ sha }) : url.endsWith("/robots.txt") ? "Sitemap: https://stack127.com/sitemap.xml" : url.endsWith("/sitemap.xml") ? "<urlset>" : "<main>page</main>", { status: 200, headers: { "x-stack127-frontend-sha": sha } });
  await assert.rejects(verifyFrontend("https://stack127.com", sha, { fetchImplementation }), /real 404/);
});

function frontendResponse(url, sha) {
  const route = new URL(url).pathname;
  const body = route === "/frontend-release.json" ? JSON.stringify({ sha })
    : route === "/robots.txt" ? "Sitemap: https://stack127.com/sitemap.xml"
    : route === "/sitemap.xml" ? "<urlset></urlset>" : "<main>page</main>";
  return new Response(body, { status: route.startsWith("/stack127-static-missing-") ? 404 : 200,
    headers: { "x-stack127-frontend-sha": sha } });
}

test("deployment verification waits for unavailable and stale edges to serve the current release", async () => {
  const sha = "a".repeat(40);
  let homepageRequests = 0;
  const waits = [];
  const routes = [];
  await verifyFrontend("https://stack127.com", sha, {
    attempts: 4, delayMs: 123,
    waitImplementation: async milliseconds => { waits.push(milliseconds); },
    fetchImplementation: async url => {
      routes.push(new URL(url).pathname);
      if (new URL(url).pathname === "/") {
        homepageRequests++;
        if (homepageRequests === 1) return new Response("not ready", { status: 503 });
        if (homepageRequests === 2) return frontendResponse(url, "b".repeat(40));
        if (homepageRequests === 3) throw new Error("temporary network failure");
      }
      return frontendResponse(url, sha);
    },
  });
  assert.equal(homepageRequests, 4);
  assert.deepEqual(waits, [123, 123, 123]);
  assert.deepEqual(routes.slice(-5), ["/", "/robots.txt", "/sitemap.xml", "/frontend-release.json", `/stack127-static-missing-${sha.slice(0, 12)}`]);
});

test("deployment verification stops at its retry limit when the release never arrives", async () => {
  const sha = "a".repeat(40);
  let requests = 0;
  let waits = 0;
  await assert.rejects(verifyFrontend("https://stack127.com", sha, {
    attempts: 2, waitImplementation: async () => { waits++; },
    fetchImplementation: async url => { requests++; return frontendResponse(url, "b".repeat(40)); },
  }), /expected SHA a{40}, received b{40}/);
  assert.equal(requests, 2);
  assert.equal(waits, 1);
});

test("deployment retries preserve release-body, document and missing-page checks", async () => {
  const sha = "a".repeat(40);
  const invalid = [
    ["/", "invalid page", /homepage is invalid/],
    ["/robots.txt", "invalid robots", /robots file is invalid/],
    ["/sitemap.xml", "invalid sitemap", /sitemap is invalid/],
    ["/frontend-release.json", JSON.stringify({ sha: "b".repeat(40) }), /release differs/],
    [`/stack127-static-missing-${sha.slice(0, 12)}`, "<main>fallback homepage</main>", /real 404/],
  ];
  for (const [route, body, error] of invalid) {
    let waits = 0;
    await assert.rejects(verifyFrontend("https://stack127.com", sha, {
      attempts: 2, waitImplementation: async () => { waits++; },
      fetchImplementation: async url => new URL(url).pathname === route
        ? new Response(body, { headers: { "x-stack127-frontend-sha": sha } }) : frontendResponse(url, sha),
    }), error);
    assert.equal(waits, 1);
  }
});

test("static redirects preserve explicit HTTP status and existing permanent/temporary defaults", () => {
  assert.equal(staticRedirects([
    {source: "/old-company", destination: "/merged-company", statusCode: 301},
    {source: "/old", destination: "/new", permanent: true},
    {source: "/temporary", destination: "/current", permanent: false},
  ]), "/old-company /merged-company 301\n/old /new 308\n/temporary /current 307\n");
  assert.throws(() => staticRedirects([{source: "/:path*", destination: "/new", permanent: true}]), /non-exact/);
  assert.throws(() => staticRedirects([{source: "/old", destination: "/new", statusCode: 200}]), /Unsupported redirect status/);
});
