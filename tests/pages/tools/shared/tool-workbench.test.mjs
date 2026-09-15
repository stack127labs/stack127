import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const toolsRoot = path.join(root, "app/(site)/(tools)");
const expectedToolSlugs = [
  "caa-checker",
  "ceph-capacity-calculator",
  "dns-change-checker",
  "dns-lookup",
  "dns-trace",
  "dnssec-checker",
  "dockerignore-tester",
  "domain-age",
  "domain-availability",
  "domain-expiry",
  "domain-lookup",
  "domain-owner",
  "domain-registrar",
  "domain-report",
  "drive-reliability",
  "home-assistant-energy-entity-checker",
  "multi-tld-availability",
  "nameserver-checker",
  "nfs-firewall-rules",
  "nginx-proxy-pass-calculator",
  "punycode-converter",
  "raid-calculator",
  "raidz-expansion-planner",
  "rebuild-calculator",
  "shortcuts-cheatsheet-generator",
  "shr-calculator",
  "snapraid-mergerfs-planner",
  "soa-checker",
  "storage-growth-planner",
  "storage-layout-advisor",
  "transfer-readiness",
  "unraid-calculator",
  "zfs-capacity-calculator",
  "zfs-padding-calculator",
];

function toolComponentSource(slug) {
  const routeRoot = path.join(toolsRoot, slug);
  return readdirSync(routeRoot)
    .filter((file) => file.endsWith(".tsx") && file !== "page.tsx")
    .map((file) => readFileSync(path.join(routeRoot, file), "utf8"))
    .join("\n");
}

test("the tool route inventory remains explicit", () => {
  const actual = readdirSync(toolsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(actual, [...expectedToolSlugs].sort());
});

test("every interactive tool uses the shared workbench hook", () => {
  for (const slug of expectedToolSlugs) {
    const source = toolComponentSource(slug);
    assert.match(source, /data-tool-workbench/, `${slug} must expose the workbench for browser checks`);
  }
});

test("tool routes do not add a divider below the workbench", () => {
  for (const slug of expectedToolSlugs) {
    const page = readFileSync(path.join(toolsRoot, slug, "page.tsx"), "utf8");
    assert.doesNotMatch(page, /<hr\b/, `${slug} must rely on the workbench container instead of a page divider`);
  }
});

test("the shared workbench is a full-width band, not a rounded box", () => {
  const stylePath = path.join(root, "app/(site)/_components/tool-workbench.css");
  const shellStylePath = path.join(root, "app/app-shell.module.css");
  assert.equal(existsSync(stylePath), true, "the shared workbench stylesheet must exist");

  const styles = readFileSync(stylePath, "utf8");
  const shellStyles = readFileSync(shellStylePath, "utf8");
  assert.match(shellStyles, /\.content\s*\{[^}]*container-type:\s*inline-size/s);
  assert.match(styles, /\[data-tool-workbench\]::before\s*\{/);
  assert.match(styles, /background:\s*var\(--color-surface\)/);
  assert.match(styles, /border-block:\s*1\.5px solid var\(--color-border-strong\)/);
  assert.match(styles, /border-inline:\s*0/);
  assert.match(styles, /border-radius:\s*0/);
  assert.match(styles, /width:\s*100cqw/);
  assert.doesNotMatch(styles, /margin-inline:\s*calc\(-1/);
});
