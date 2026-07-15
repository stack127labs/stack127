import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const repo = path.join(root, "repos", "dns-tools");
const tools = [
  ["dns-lookup", "lookup", "DNS Lookup"],
  ["dns-trace", "trace", "DNS Trace Explorer"],
  ["dns-change-checker", "change-checker", "DNS Change Checker"],
  ["nameserver-checker", "nameserver-checker", "Nameserver Delegation Checker"],
  ["dnssec-checker", "dnssec-checker", "DNSSEC Chain Checker"],
  ["soa-checker", "soa-checker", "SOA Consistency Checker"],
  ["caa-checker", "caa-checker", "CAA Policy Checker"],
];

test("the canonical DNS Tools repository is complete and uses flat public routes", () => {
  assert.ok(existsSync(repo), "repos/dns-tools is required");
  assert.ok(existsSync(path.join(repo, "app", "(site)", "page.tsx")), "the hub must own /");

  for (const [slug, apiSlug] of tools) {
    assert.ok(existsSync(path.join(repo, "app", "(site)", slug, "page.tsx")), `missing flat page /${slug}`);
    assert.ok(existsSync(path.join(repo, "app", "api", "dns", apiSlug, "route.ts")), `missing API ${apiSlug}`);
    assert.ok(existsSync(path.join(repo, "docs", "tools", `${slug}.md`)), `missing docs ${slug}`);
  }

  for (const required of [
    "README.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "Dockerfile",
    "docker-compose.yml",
    ".env.example",
    "openapi.yaml",
    "app/robots.ts",
    "app/sitemap.ts",
    "app/api/health/route.ts",
    "docs/launch-checklist.md",
    "tests/e2e/dns-tools.spec.ts",
  ]) {
    assert.ok(existsSync(path.join(repo, required)), `missing ${required}`);
  }

  assert.equal(existsSync(path.join(root, "templates", "github-dns-tools")), false, "the standalone repo must not remain a template");
  assert.equal(existsSync(path.join(repo, ".git")), false, "do not create a nested Git repository");

  const packageJson = JSON.parse(readFileSync(path.join(repo, "package.json"), "utf8"));
  assert.match(packageJson.scripts.dev, /1273/);
  assert.equal(packageJson.dependencies.pg, undefined);

  const header = readFileSync(path.join(repo, "app", "site-header.tsx"), "utf8");
  assert.match(header, /version127-logo-white\.png/);
  assert.match(header, />DNS Tools</);
  assert.doesNotMatch(header, /Built by Version127/);

  const toolStyles = [
    "app/(site)/_dns-tools/dns-tools.css",
    "app/(site)/_dns-tools/dns-diagnostics.module.css",
    "app/(site)/dns-trace/dns-trace.module.css",
  ].map((file) => readFileSync(path.join(repo, file), "utf8")).join("\n");
  const leftEdges = [...toolStyles.matchAll(/border-(?:left|inline-start)(?:-color)?:\s*([^;]+);/g)]
    .map((match) => match[1].trim());
  assert.deepEqual(leftEdges, ["1px solid var(--color-border-strong)"]);

  const siteConfig = readFileSync(path.join(repo, "app", "site-config.ts"), "utf8");
  assert.match(siteConfig, /"\/"/);
  for (const [slug] of tools) assert.match(siteConfig, new RegExp(`"/${slug}"`));
  assert.doesNotMatch(siteConfig, /"\/dns-tools(?:\/|\")/);

  const nextConfig = readFileSync(path.join(repo, "next.config.ts"), "utf8");
  assert.match(nextConfig, /source: "\/dns-tools"/);
  assert.match(nextConfig, /destination: "\/"/);
  assert.match(nextConfig, /source: "\/dns-tools\/:tool"/);

  const hub = readFileSync(path.join(repo, "app", "(site)", "page.tsx"), "utf8");
  for (const [slug, , name] of tools) {
    assert.match(hub, new RegExp(`href="/${slug}"`));
    assert.match(hub, new RegExp(`>${name}<`));
  }

  const allText = [
    readFileSync(path.join(repo, "README.md"), "utf8"),
    readFileSync(path.join(repo, "app", "sitemap.ts"), "utf8"),
    readFileSync(path.join(repo, "app", "layout.tsx"), "utf8"),
    ...tools.map(([slug]) => readFileSync(path.join(repo, "docs", "tools", `${slug}.md`), "utf8")),
  ].join("\n");
  assert.doesNotMatch(allText, /public\.version127_pages|DATABASE_URL|the Version127 site/);
  assert.match(allText, /DNS Lookup/);
  assert.match(allText, /DNSSEC Chain Checker/);

  const dockerfile = readFileSync(path.join(repo, "Dockerfile"), "utf8");
  assert.match(dockerfile, /USER nextjs/);
  assert.match(dockerfile, /EXPOSE 1273/);

  const openapi = readFileSync(path.join(repo, "openapi.yaml"), "utf8");
  for (const [, apiSlug] of tools) assert.match(openapi, new RegExp(`/api/dns/${apiSlug.replaceAll("-", "\\-")}:`));
});
