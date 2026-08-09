import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const route = new URL("../../../app/(site)/(tools)/zfs-capacity-calculator/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("zfs-capacity-calculator.tsx", route);
const guidePath = new URL("zfs-capacity-guide.tsx", route);
const stylesPath = new URL("zfs-capacity-calculator.module.css", route);
const enginePath = new URL("../../../lib/storage/zfs.ts", import.meta.url);
const hubPath = new URL("../../../app/(site)/storage-tools/page.tsx", import.meta.url);
const sidebarPath = new URL("../../../app/(site)/storage-tools/storage-tools-sidebar.tsx", import.meta.url);
const previewPath = new URL("../../../scripts/storage-tools/preview-local-pages.mjs", import.meta.url);

const manifestPath = new URL("page.json", import.meta.url);
const migrationPath = new URL(
  "../../../supabase/migrations/20260809140000_publish_storage_tools.sql",
  import.meta.url,
);

test("the published ZFS route has every owned source file", () => {
  for (const file of [pagePath, clientPath, guidePath, stylesPath, enginePath, migrationPath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/zfs-capacity-calculator");
  assert.equal(manifest.state, "published");
  assert.match(readFileSync(migrationPath, "utf8"), /'zfs-capacity-calculator'/);
});

test("the page renders the tool and the approved planning guide", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const guide = readFileSync(guidePath, "utf8");
  const routeSource = `${page}\n${guide}`;
  assert.match(page, /ZFS pool capacity/);
  assert.match(page, /<mark>calculator<\/mark>/);
  assert.match(page, /Plan a fresh OpenZFS pool/);
  assert.match(page, /calculation stays in your\s+browser/);
  assert.match(page, /<ZfsCapacityGuide \/>/);
  assert.match(client, /Add data vdev/);
  assert.match(client, /Add auxiliary role/);
  assert.match(client, /Set all drives/);
  assert.match(client, /Calculate pool/);
  assert.match(client, /Estimated writable/);
  assert.match(client, /Planning target/);
  assert.match(client, /Vdev topology/);
  assert.match(client, /Capacity accounting/);
  assert.match(client, /Zero-value categories/);
  assert.match(client, /zpool create -n/);
  assert.match(guide, /<article/);
  assert.match(guide, /proseClassName/);
  assert.match(guide, /Each vdev is its own failure boundary/);
  assert.match(guide, /Why ashift and block size change RAIDZ capacity/);
  assert.match(guide, /Slop and planning headroom are different/);
  assert.match(guide, /Why an installed pool can show less free space/);
  assert.match(guide, /openzfs\.github\.io/);
  assert.ok((guide.match(/<h2>/g) ?? []).length <= 5, "the guide stays focused");
  const visibleWords = guide
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}()=\"'`;,:./]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  assert.ok(visibleWords.length <= 650, `guide source contains ${visibleWords.length} tokens`);
  assert.doesNotMatch(routeSource, /FAQ|How it works|Methodology/);
  assert.doesNotMatch(`${routeSource}\n${client}`, /—|–/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots/);
});

test("formula and state behavior remain outside React", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(engine, /bigint/);
  assert.match(engine, /calculateZfsPoolCapacity/);
  assert.match(engine, /zfsSlopBytes/);
  assert.match(engine, /buildZfsCommandTokens/);
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|Worker|child_process|exec\(|spawn\(/i);
  assert.doesNotMatch(client, /fetch\(|localStorage|sessionStorage|WebSocket|Worker/);
});

test("the tool uses one frame and responsive drive rows", () => {
  const styles = readFileSync(stylesPath, "utf8");
  assert.match(styles, /\.tool\s*\{[^}]*border:\s*1\.5px solid var\(--color-border-strong\);/s);
  assert.match(styles, /\.driveRow\s*\{[^}]*grid-template-columns:/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /\.quickSetup\s*\{[^}]*grid-template-columns:/s);
  assert.match(styles, /\.resultSummary\s*\{[^}]*grid-template-columns:/s);
  assert.match(styles, /\.result\s*>\s*\*\s*\{[^}]*min-width:\s*0;/s);
  assert.match(styles, /\.commandBlock\s*\{[^}]*min-width:\s*0;[^}]*overflow:\s*hidden;/s);
  assert.match(styles, /\.accountingTable:not\(\.auxiliaryTable\)\s+tbody\s+tr\s*\{[^}]*display:\s*grid;/s);
  assert.match(styles, /\.auxiliaryTable\s+tbody\s+tr\s*\{[^}]*display:\s*grid;/s);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
  assert.match(styles, /\.barWritable\s*\{[^}]*--ma-good/s);
  assert.match(styles, /\.barRedundancy\s*\{[^}]*--ma-note/s);
  assert.match(styles, /\.barMixed\s*\{[^}]*--ma-warn/s);
  for (const declaration of styles.match(/font-size\s*:[^;]+;/g) ?? []) {
    assert.match(declaration, /var\(--text-(?:body|small|h1|h2|h3)\)/);
  }
});

test("the storage family owns the published route across every surface", () => {
  const hub = readFileSync(hubPath, "utf8");
  const sidebar = readFileSync(sidebarPath, "utf8");
  const preview = readFileSync(previewPath, "utf8");
  assert.match(hub, /\/zfs-capacity-calculator/);
  assert.match(sidebar, /\/zfs-capacity-calculator/);
  assert.match(readFileSync(migrationPath, "utf8"), /'zfs-capacity-calculator'/);
  assert.match(preview, /127\.0\.0\.1|localhost/);
});

test("the command preview cannot execute or accept paths", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const engine = readFileSync(enginePath, "utf8");
  assert.doesNotMatch(`${page}\n${client}\n${engine}`, /child_process|execFile|spawn|\/dev\/sda|contentEditable/);
  assert.match(engine, /<pool-name>/);
});
