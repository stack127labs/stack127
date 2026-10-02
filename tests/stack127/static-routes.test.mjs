import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { verifyStaticRoutes } from "../../scripts/stack127/deployment/preflight.mjs";

const script = fileURLToPath(new URL("../../scripts/stack127/check-static-routes.mjs", import.meta.url));

function fixture(t) {
  const directory = mkdtempSync(path.join(os.tmpdir(), "stack127-static-routes-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const write = (file, value) => {
    const target = path.join(directory, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, typeof value === "string" ? value : JSON.stringify(value));
  };
  write("app/page.tsx", "export const revalidate = false; export default function Page() { return null; }");
  const run = (...args) => spawnSync(process.execPath, [script, "--strict", ...args], {
    cwd: directory, env: { ...process.env, STACK127_TEST_DIST_DIR: path.join(directory, ".next") }, encoding: "utf8",
  });
  return { directory, write, run };
}

test("the release gate accepts static pages and built parameters with dynamic exceptions", t => {
  const { write, run } = fixture(t);
  write(".next/app-path-routes-manifest.json", {
    "/(site)/page": "/", "/(site)/fees/[section]/page": "/fees/[section]",
    "/publication-not-found/page": "/publication-not-found", "/vitals/page": "/vitals",
    "/api/search/route": "/api/search",
  });
  write(".next/prerender-manifest.json", {
    routes: { "/": { initialRevalidateSeconds: false }, "/fees/books": { initialRevalidateSeconds: false } },
    dynamicRoutes: { "/fees/[section]": { fallback: null } },
  });
  write("app/api/search/route.ts", 'export const dynamic = "force-dynamic"; export const revalidate = 0;');
  const result = run();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Total problems: 0/);
});

test("missing manifests fail full preflight but CI can check source before its build", t => {
  const { directory, run } = fixture(t);
  const result = run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /Cannot read build manifests/);
  assert.equal(run("--source-only").status, 0);
  const errors = verifyStaticRoutes({ environment: { ...process.env, STACK127_TEST_DIST_DIR: path.join(directory, ".next") } });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Cannot read build manifests/);
});

test("dynamic pages and timed page or fallback revalidation fail a release", t => {
  const { write, run } = fixture(t);
  write(".next/app-path-routes-manifest.json", { "/(site)/page": "/", "/(site)/live/page": "/live" });
  write(".next/prerender-manifest.json", {
    routes: { "/": { initialRevalidateSeconds: 60 } },
    dynamicRoutes: { "/fees/[section]": { fallbackRevalidate: 300 }, "/uncached/[id]": { fallbackRevalidate: 0 } },
  });
  const result = run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /Dynamic page problems: 1/);
  assert.match(result.stdout, /timed revalidate = 60/);
  assert.match(result.stdout, /timed fallback revalidate = 300/);
  assert.match(result.stdout, /dynamic fallback revalidate = 0/);
});

test("server URL reads and route settings fail before an image is built", t => {
  const { write, run } = fixture(t);
  write("app/page.tsx", `
    import { headers as readHeaders, cookies } from "next/headers";
    export const dynamic = "force-dynamic";
    export const revalidate = 60;
    export default async function Page({ searchParams }) { await readHeaders(); await cookies(); return searchParams.q; }
  `);
  write("app/no-cache/page.tsx", "export const revalidate = 0;");
  const result = run("--source-only");
  assert.equal(result.status, 1, result.stdout + result.stderr);
  for (const reason of ["server searchParams", "server headers()", "server cookies()", "timed revalidate = 60", "dynamic revalidate = 0"]) {
    assert.ok(result.stdout.includes(reason), result.stdout);
  }
});
