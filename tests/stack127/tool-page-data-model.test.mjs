import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

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
].sort();
const expectedRouteSlugs = [
  ...expectedToolSlugs,
  "backup-321-calculator",
  "docker-compose-checker",
  "ip-asn-lookup",
  "self-hosted-app-resource-planner",
  "restic-retention-simulator",
  "rsync-filter-tester",
  "mqtt-discovery-checker",
  "lxc-idmap-checker",
  "kdp-book-setup-calculator",
  "kdp-metadata-checker",
  "kdp-page-count-estimator",
  "kdp-pdf-preflight-checker",
  "kdp-royalty-calculator",
].sort();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function toolRouteSlugs() {
  return readdirSync(path.join(root, "app", "(site)", "(tools)"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();
}

function toolPageMigration() {
  const migration = readdirSync(path.join(root, "supabase", "migrations"))
    .filter((name) => name.endsWith("_add_stack127_tool_pages.sql"))
    .sort()
    .at(-1);

  assert.ok(migration, "missing add_stack127_tool_pages migration");
  return read(path.join("supabase", "migrations", migration));
}

test("the tools route group contains only interactive tools", () => {
  assert.deepEqual(toolRouteSlugs(), expectedRouteSlugs);
  assert.ok(existsSync(path.join(root, "app", "(site)", "(references)", "epp-status-codes", "page.tsx")));
  assert.ok(existsSync(path.join(root, "app", "(site)", "(references)", "tld-directory", "page.tsx")));
});

test("stack127_pages separates row timestamps from public dates", () => {
  const sql = toolPageMigration();

  assert.match(sql, /add column row_created_at timestamptz/i);
  assert.match(sql, /row_created_at = created_at/i);
  assert.doesNotMatch(sql, /rename column created_at to row_created_at/i);
  assert.doesNotMatch(sql, /drop column created_at/i);
  assert.match(sql, /add column row_updated_at timestamptz/i);
  assert.match(sql, /add column id bigint generated always as identity/i);
  assert.match(sql, /add column page_family text/i);
  assert.match(sql, /primary key \(id\)/i);
  assert.match(sql, /unique \(slug\)/i);

  const registry = read("lib/page-registry.ts");
  const sitemap = read("app/sitemap.ts");
  assert.doesNotMatch(registry, /published_at\s*\?\?\s*state\.page\.row_created_at/);
  assert.doesNotMatch(sitemap, /row_created_at/);
});

test("stack127_tool_pages stores Markdown, versions, and stack127 repo state", () => {
  const sql = toolPageMigration();
  const requiredColumns = [
    "page_id",
    "title",
    "intro_markdown",
    "content_markdown",
    "content_revision",
    "tool_version",
    "tool_version_updated_at",
    "stack127_repo_url",
    "stack127_repo_version",
    "stack127_repo_commit_sha",
    "stack127_repo_synced_at",
    "row_updated_at",
  ];

  assert.match(sql, /create table public\.stack127_tool_pages/i);
  for (const column of requiredColumns) {
    assert.match(sql, new RegExp(`\\b${column}\\b`, "i"), `missing ${column}`);
  }
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /Published stack127 tool pages are readable/i);
  assert.match(sql, /validate_stack127_tool_page_family/i);
  assert.match(sql, /protect_stack127_tool_page_family/i);
  assert.match(sql, /prepare_stack127_tool_page_update/i);
  assert.match(sql, /touch_stack127_tool_page_public_date/i);

  const seededSlugs = [...sql.matchAll(/^\s*-- tool-slug: ([a-z0-9-]+)$/gmu)]
    .map((match) => match[1])
    .sort();
  assert.deepEqual(seededSlugs, expectedToolSlugs);
});

test("every tool route loads its copy through the shared database content layer", () => {
  for (const slug of expectedRouteSlugs) {
    const page = read(path.join("app", "(site)", "(tools)", slug, "page.tsx"));
    assert.match(page, /getRequiredToolPage\(/, `${slug} does not load its tool-page row`);
    assert.match(page, /<ToolPageHeader\b/, `${slug} does not use ToolPageHeader`);
    assert.match(page, /<ToolPageMarkdown\b/, `${slug} does not render database Markdown`);
  }
});

test("stack127-owned repository workflows use stack127 repo naming", () => {
  assert.ok(existsSync(path.join(root, "stack127_docs", "stack127-repos.md")));
  assert.ok(existsSync(path.join(root, "scripts", "stack127", "repos", "create-tool-repo.mjs")));
  assert.ok(existsSync(path.join(root, "templates", "stack127-tool-repo", "README.md")));
  assert.equal(existsSync(path.join(root, "stack127_docs", "github-public-repos.md")), false);
  assert.equal(existsSync(path.join(root, "stack127_docs", "public-repositories.md")), false);
  assert.equal(existsSync(path.join(root, "scripts", "stack127", "github")), false);
  assert.equal(existsSync(path.join(root, "templates", "github-tool")), false);

  const packageJson = JSON.parse(read("package.json"));
  assert.equal(
    packageJson.scripts["stack127:repo:tool:new"],
    "node scripts/stack127/repos/create-tool-repo.mjs",
  );
  assert.equal(
    packageJson.scripts["stack127:repo:dataset:export"],
    "node scripts/stack127/repos/export-dataset.mjs",
  );
  assert.equal(
    packageJson.scripts["stack127:repo:dataset:sync"],
    "node scripts/stack127/repos/sync-dataset-repo.mjs",
  );
});

test("tool page operating docs define content and functional update workflows", () => {
  const docs = read(path.join("stack127_docs", "tool-pages.md"));
  assert.match(docs, /Content-only changes/i);
  assert.match(docs, /Functional tool changes/i);
  assert.match(docs, /content_revision/);
  assert.match(docs, /tool_version/);
  assert.match(docs, /row_created_at/);
  assert.match(docs, /row_updated_at/);
  assert.match(docs, /temporary compatibility column/i);
  assert.match(docs, /stack127_repo_/);
  assert.match(docs, /github_projects/);
});

test("tool page mutations use separate reviewed commands", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(
    packageJson.scripts["stack127:tool-page:content:update"],
    "node scripts/stack127/tool-pages/update-content.mjs",
  );
  assert.equal(
    packageJson.scripts["stack127:tool-page:version:update"],
    "node scripts/stack127/tool-pages/update-version.mjs",
  );
  assert.equal(
    packageJson.scripts["stack127:tool-page:repo:sync"],
    "node scripts/stack127/tool-pages/record-repo-sync.mjs",
  );

  const contentScript = read("scripts/stack127/tool-pages/update-content.mjs");
  assert.match(contentScript, /content_revision = content_revision \+ 1/);
  assert.doesNotMatch(contentScript, /tool_version\s*=/);

  const versionScript = read("scripts/stack127/tool-pages/update-version.mjs");
  assert.match(versionScript, /tool_version = \$2/);
  assert.match(versionScript, /tool_version_updated_at = now\(\)/);
  assert.doesNotMatch(versionScript, /content_revision\s*=/);

  const repoScript = read("scripts/stack127/tool-pages/record-repo-sync.mjs");
  assert.match(repoScript, /stack127_repo_url = \$2/);
  assert.match(repoScript, /stack127_repo_version = \$3/);
  assert.match(repoScript, /stack127_repo_commit_sha = \$4/);
  assert.match(repoScript, /stack127_repo_synced_at = now\(\)/);

  const helper = read("scripts/stack127/tool-pages/lib.mjs");
  assert.match(helper, /\.env\.local/);
  assert.match(helper, /\.env\.database/);
  assert.match(helper, /--database-url is not supported/);
  assert.match(helper, /\.env\.local points to production/);
  assert.match(helper, /--confirm stack127-production/);
});

test("durable page scripts are compatible with page families and tool content ownership", () => {
  const scriptsRoot = path.join(root, "scripts");
  const scriptFiles = [];

  function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(fullPath);
      else if (entry.isFile() && entry.name.endsWith(".mjs")) scriptFiles.push(fullPath);
    }
  }

  collect(scriptsRoot);
  for (const file of scriptFiles) {
    const source = readFileSync(file, "utf8");
    if (/insert into public\.stack127_pages/i.test(source)) {
      assert.match(source, /page_family/i, path.relative(root, file));
    }
  }

  for (const relativePath of [
    "scripts/dockerignore-tester/preview-local-page.mjs",
    "scripts/home-assistant-energy-entity-checker/preview-local-page.mjs",
    "scripts/nfs-firewall-rules/preview-local-page.mjs",
    "scripts/nginx-proxy-pass-calculator/preview-local-page.mjs",
    "scripts/storage-tools/preview-local-pages.mjs",
  ]) {
    const source = read(relativePath);
    assert.doesNotMatch(source, /delete from public\.stack127_pages/i, relativePath);
    assert.match(source, /update public\.stack127_pages/i, relativePath);
  }
});
