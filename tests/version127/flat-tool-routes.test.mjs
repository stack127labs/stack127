import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");

const toolMoves = [
  ...[
    "caa-checker",
    "dns-change-checker",
    "dns-lookup",
    "dns-trace",
    "dnssec-checker",
    "nameserver-checker",
    "soa-checker",
  ].map((slug) => ({ family: "dns-tools", published: true, slug })),
  ...[
    "domain-age",
    "domain-availability",
    "domain-expiry",
    "domain-lookup",
    "domain-owner",
    "domain-registrar",
    "domain-report",
    "epp-status-codes",
    "multi-tld-availability",
    "punycode-converter",
    "tld-directory",
    "transfer-readiness",
  ].map((slug) => ({ family: "domain-tools", published: true, slug })),
  ...[
    "raid-calculator",
    "zfs-capacity-calculator",
    "zfs-padding-calculator",
  ].map((slug) => ({ family: "storage-tools", published: true, slug })),
];

function source(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("every existing tool has flat route, docs, tests, and ownership", () => {
  for (const { family, published, slug } of toolMoves) {
    const routeDirectory = path.join(root, "app/(site)/(tools)", slug);
    const docsDirectory = path.join(root, "content_docs", slug);
    const testsDirectory = path.join(root, "tests/pages", slug);
    const manifest = JSON.parse(source(`tests/pages/${slug}/page.json`));

    assert.equal(existsSync(path.join(routeDirectory, "page.tsx")), true, slug);
    assert.equal(existsSync(docsDirectory), true, slug);
    assert.equal(existsSync(testsDirectory), true, slug);
    assert.equal(manifest.route, `/${slug}`, slug);
    assert.equal(manifest.state, published ? "published" : "unpublished", slug);
    assert.ok(manifest.docs.includes(`content_docs/${slug}`), slug);

    assert.equal(existsSync(path.join(root, `app/(site)/${family}/${slug}`)), false, slug);
    assert.equal(existsSync(path.join(root, `content_docs/${family}/${slug}`)), false, slug);
    assert.equal(existsSync(path.join(root, `tests/pages/${family}/${slug}`)), false, slug);
  }
});

test("the main app permanently redirects every previous nested tool URL", () => {
  const config = source("next.config.ts");

  for (const { family, slug } of toolMoves) {
    assert.match(
      config,
      new RegExp(`source: ["']/${family}/${slug}["'][\\s\\S]{0,160}destination: ["']/${slug}["'][\\s\\S]{0,80}permanent: true`),
      `${family}/${slug}`,
    );
  }
});

test("published flat tools are not inferred to be home collection pages", () => {
  const helpers = source("lib/page-registry-helpers.ts");
  const registry = source("lib/page-registry.ts");

  assert.doesNotMatch(registry, /position\('\/' in slug\) = 0/);
  assert.match(helpers, /homePageSlugs/);
  assert.match(helpers, /isHomePageSlug/);
});

test("new public tool repositories link to the flat hosted URL", () => {
  const creator = source("scripts/version127/github/create-tool-repo.mjs");

  assert.match(creator, /https:\/\/version127\.com\/\$\{slug\}/);
  assert.doesNotMatch(creator, /version127\.com\/tools\//);
});
