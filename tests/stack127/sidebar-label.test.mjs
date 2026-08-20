import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../", import.meta.url);

function source(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("shared sidebar titles use a paragraph with heading-like styling", () => {
  const appShell = source("app/app-shell.tsx");
  const sidebarStyles = source("app/sidebar-panel.module.css");
  assert.match(
    appShell,
    /function SidebarLabel[\s\S]*return <p className=\{sidebarPanelTitleClassName\}>\{children\}<\/p>/,
  );
  assert.match(sidebarStyles, /\.title\s*\{[\s\S]*font-size: var\(--text-h3\)/);
  assert.match(sidebarStyles, /\.title\s*\{[\s\S]*font-weight: var\(--weight-bold\)/);
  assert.doesNotMatch(
    sidebarStyles,
    /\.heading p\s*\{/,
    "a generic heading paragraph rule must not override the shared title class",
  );

  const sidebarOwners = [
    "app/(site)/page.tsx",
    "app/info-page.tsx",
    "app/(site)/dns-tools/dns-tools-sidebar.tsx",
    "app/(site)/self-host-apps/page.tsx",
    "app/(site)/self-hosting-for-beginners/course.tsx",
    "app/(site)/software-licenses-for-self-hosting/page.tsx",
  ];

  for (const path of sidebarOwners) {
    const file = source(path);
    assert.match(file, /<SidebarLabel>/, `${path} should use the shared SidebarLabel`);
    assert.doesNotMatch(file, /<h[1-6][^>]*sidebar/i, `${path} should not use a heading element for its sidebar title`);
  }
});

test("DNS sidebars list only tools that are available now", () => {
  const sidebar = source("app/(site)/dns-tools/dns-tools-sidebar.tsx");
  const lookupPage = source("app/(site)/(tools)/dns-lookup/page.tsx");

  assert.match(sidebar, /const availableDnsTools = \[/);
  assert.match(sidebar, /href: "\/dns-lookup"/);
  assert.match(sidebar, /label: "DNS lookup"/);
  assert.match(sidebar, /href: "\/dns-trace"/);
  assert.match(sidebar, /label: "DNS Trace Explorer"/);
  assert.match(sidebar, /href: "\/dns-change-checker"/);
  assert.match(sidebar, /href: "\/nameserver-checker"/);
  assert.match(sidebar, /href: "\/dnssec-checker"/);
  assert.match(sidebar, /href: "\/soa-checker"/);
  assert.match(sidebar, /href: "\/caa-checker"/);
  assert.match(sidebar, /<SidebarList/);
  assert.doesNotMatch(sidebar, />Overview</);
  assert.doesNotMatch(sidebar, /coming soon|planned next/i);
  assert.doesNotMatch(sidebar, /On this page|dns-tools-page-nav|showPageLinks/);
  assert.doesNotMatch(lookupPage, /showPageLinks/);
});
