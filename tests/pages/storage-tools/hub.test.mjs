import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../../../app/(site)/(catalogs)/storage-tools/page.tsx", import.meta.url), "utf8");
const sidebar = readFileSync(new URL("../../../app/(site)/(catalogs)/storage-tools/storage-tools-sidebar.tsx", import.meta.url), "utf8");
const routeRoot = new URL("../../../", import.meta.url);
const manifestPath = new URL("page.json", import.meta.url);
const migrationPath = new URL(
  "../../../supabase/migrations/20260809140000_publish_storage_tools.sql",
  import.meta.url,
);

const expectedStorageTools = [
  {
    href: "/backup-321-calculator",
    name: "3-2-1 backup calculator",
    sidebarLabel: "3-2-1 backup",
  },
  {
    href: "/raid-calculator",
    name: "RAID calculator",
    sidebarLabel: "RAID calculator",
  },
  {
    href: "/zfs-capacity-calculator",
    name: "ZFS capacity calculator",
    sidebarLabel: "ZFS calculator",
  },
  {
    href: "/zfs-padding-calculator",
    name: "ZFS padding calculator",
    sidebarLabel: "ZFS padding",
  },
  {
    href: "/raidz-expansion-planner",
    name: "RAIDZ expansion planner",
    sidebarLabel: "RAIDZ expansion",
  },
  {
    href: "/shr-calculator",
    name: "SHR calculator",
    sidebarLabel: "SHR calculator",
  },
  {
    href: "/unraid-calculator",
    name: "Unraid calculator",
    sidebarLabel: "Unraid calculator",
  },
  {
    href: "/snapraid-mergerfs-planner",
    name: "SnapRAID and mergerfs planner",
    sidebarLabel: "SnapRAID and mergerfs",
  },
  {
    href: "/drive-reliability",
    name: "Drive reliability explorer",
    sidebarLabel: "Drive reliability",
  },
  {
    href: "/rebuild-calculator",
    name: "Rebuild exposure calculator",
    sidebarLabel: "Rebuild exposure",
  },
  {
    href: "/ceph-capacity-calculator",
    name: "Ceph capacity planner",
    sidebarLabel: "Ceph capacity",
  },
  {
    href: "/storage-growth-planner",
    name: "Storage growth planner",
    sidebarLabel: "Storage growth",
  },
  {
    href: "/storage-layout-advisor",
    name: "Storage layout advisor",
    sidebarLabel: "Layout advisor",
  },
];

test("the published storage hub lists all completed calculators", () => {
  const hubHrefs = [...page.matchAll(/href: "([^"]+)",/g)].map(
    (match) => match[1],
  );
  const availableToolsBlock = sidebar.match(
    /const availableStorageTools = \[(?<tools>[\s\S]*?)\] as const;/,
  )?.groups?.tools;
  assert.ok(availableToolsBlock, "the sidebar should declare availableStorageTools");
  const sidebarHrefs = [...availableToolsBlock.matchAll(/\{ href: "([^"]+)", icon:/g)].map(
    (match) => match[1],
  );

  assert.deepEqual(
    hubHrefs,
    expectedStorageTools.map((tool) => tool.href),
    "the hub should expose the thirteen exact flat routes in order",
  );
  assert.deepEqual(
    sidebarHrefs,
    expectedStorageTools.map((tool) => tool.href),
    "the sidebar should expose the same thirteen exact flat routes in order",
  );
  assert.equal(new Set(hubHrefs).size, 13);
  assert.equal(new Set(sidebarHrefs).size, 13);

  for (const tool of expectedStorageTools) {
    assert.match(page, new RegExp(`name: "${tool.name}"`));
    assert.match(sidebar, new RegExp(`label: "${tool.sidebarLabel}"`));
  }
});

test("the hub is registry published and exposes its tool count to the home card", () => {
  assert.equal(existsSync(migrationPath), true);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/storage-tools");
  assert.equal(manifest.state, "published");
  assert.match(readFileSync(migrationPath, "utf8"), /'storage-tools'/);
  assert.match(sidebar, /export const storageToolCount = availableStorageTools\.length;/);

  const availableToolsBlock = sidebar.match(
    /const availableStorageTools = \[(?<tools>[\s\S]*?)\] as const;/,
  )?.groups?.tools;
  assert.ok(availableToolsBlock, "the sidebar should declare availableStorageTools");
  const availableToolCount = [...availableToolsBlock.matchAll(/\{ href: "([^"]+)", icon:/g)].length;
  assert.equal(availableToolCount, 13);
  assert.equal(availableToolCount, expectedStorageTools.length);
});

test("the hub route declares no page-local metadata", () => {
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
});

test("every storage tool route marks its own sidebar item active", () => {
  const routeShells = [
    ["app/(site)/(tools)/backup-321-calculator/page.tsx", "backup-321"],
    ["app/(site)/(tools)/raid-calculator/page.tsx", "raid"],
    ["app/(site)/(tools)/zfs-capacity-calculator/page.tsx", "zfs"],
    ["app/(site)/(tools)/zfs-padding-calculator/page.tsx", "zfs-padding"],
    ["app/(site)/(tools)/raidz-expansion-planner/page.tsx", "raidz-expansion"],
    ["app/(site)/(tools)/shr-calculator/page.tsx", "shr"],
    ["app/(site)/(tools)/unraid-calculator/page.tsx", "unraid"],
    ["app/(site)/(tools)/snapraid-mergerfs-planner/page.tsx", "snapraid-mergerfs"],
    ["app/(site)/(tools)/drive-reliability/page.tsx", "drive-reliability"],
    ["app/(site)/(tools)/rebuild-calculator/page.tsx", "rebuild"],
    ["app/(site)/(tools)/ceph-capacity-calculator/page.tsx", "ceph"],
    ["app/(site)/(tools)/storage-growth-planner/page.tsx", "storage-growth"],
    ["app/(site)/(tools)/storage-layout-advisor/page.tsx", "layout-advisor"],
  ];

  for (const [relativePath, active] of routeShells) {
    const source = readFileSync(new URL(relativePath, routeRoot), "utf8");
    assert.match(source, new RegExp(`<StorageToolsSidebar active="${active}" \\/>`), relativePath);
  }
});
