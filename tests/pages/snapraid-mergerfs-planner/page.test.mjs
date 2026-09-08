import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const route = new URL("../../../app/(site)/(tools)/snapraid-mergerfs-planner/", import.meta.url);
const sharedControls = new URL("../../../app/tool-ui/tool-controls.module.css", import.meta.url);
const files = {
  page: new URL("page.tsx", route),
  client: new URL("snapraid-mergerfs-planner.tsx", route),
  engine: new URL("snapraid-merfs-engine.ts", route),
  styles: new URL("snapraid-mergerfs-planner.module.css", route),
  preview: new URL("../../../scripts/storage-tools/preview-local-pages.mjs", import.meta.url),
  manifest: new URL("page.json", import.meta.url),
};

const source = (url) => readFileSync(url, "utf8");

test("owns one published flat route and only route-local build files", () => {
  for (const [label, url] of Object.entries(files)) assert.equal(existsSync(url), true, `${label}: ${url.pathname}`);
  const manifest = JSON.parse(source(files.manifest));
  assert.equal(manifest.route, "/snapraid-mergerfs-planner");
  assert.equal(manifest.state, "published");
  assert.deepEqual(manifest.repositories, []);
  assert.equal(manifest.docs[0], "content_docs/snapraid-mergerfs-planner");
  assert.equal(manifest.scripts[0], "scripts/storage-tools/preview-local-pages.mjs");
});

test("keeps identity and supporting content server rendered", () => {
  const page = source(files.page);
  const client = source(files.client);
  const guide = readToolPageSeed("snapraid-mergerfs-planner");
  assert.match(page, /getRequiredToolPage\("snapraid-mergerfs-planner"\)/);
  assert.match(page, /<AppShell[\s\S]*sidebar=\{<StorageToolsSidebar active="snapraid-mergerfs" \/>\}/);
  assert.match(page, /<SnapraidMergerfsPlanner \/>/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.doesNotMatch(guide, /^\s*["']use client["'];/m);
  assert.match(guide, /Keep parity outside the pool/);
  assert.match(guide, /Choose paths and verify boundaries/);
  assert.match(guide, /What happens to entered paths/);
  assert.match(guide, /findmnt/);
  assert.match(guide, /lsblk/);
  assert.match(guide, /physical disk separation/i);
  assert.match(guide, /installed.*versions/i);
  assert.match(guide, /backup/i);
  assert.match(guide, /does not save or send/i);
  assert.match(guide, /\]\(\/privacy\)/);
  assert.match(guide, /manpages\.debian\.org/);
  assert.match(guide, /trapexit\.github\.io\/mergerfs/);
  assert.match(guide, /^\| Layer \| Role/m);
  assert.doesNotMatch(`${page}\n${guide}`, /<h2>FAQ|Methodology|Related reading|How to use|[—–]/i);
  assert.match(client, /Check and generate/);
  assert.match(client, /Configuration ready for review/);
  assert.match(client, /Copy snapraid\.conf/);
  assert.match(client, /Copy fstab line/);
  assert.match(client, /ToolTextField/);
  assert.match(client, /ToolQuantityInput/);
  assert.match(client, /ToolChoiceGroup/);
  assert.match(client, /ToolCheckbox/);
  assert.match(client, /ToolCodeOutput/);
  assert.match(client, /ToolKeyValueList/);
  assert.doesNotMatch(client, /Review both files before touching|Configuration checks|Review boundaries|Data bytes:|Generated directives|Data branches only|Ordered branches|Expert setting/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
});

test("keeps the engine pure and input text inert", () => {
  const engine = source(files.engine);
  const client = source(files.client);
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|history\.|document\.|window\.|eval\(|Function\(/i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML|eval\(|Function\(/i);
  assert.match(client, /ToolCopyAction/);
  assert.doesNotMatch(`${engine}\n${client}`, /child_process|exec\(|spawn\(|shell/i);
});

test("protects route-local visual constraints and contained code output", () => {
  const styles = source(files.styles);
  const controls = source(sharedControls);
  assert.match(source(files.client), /data-tool-workbench/);
  assert.doesNotMatch(styles, /\.tool\s*\{[^}]*(?:border:\s*1\.5px|border-radius:)/s);
  assert.match(styles, /min-width:\s*0/);
  assert.match(controls, /\.codeViewport[\s\S]*?overflow:\s*auto/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
});

test("guards local preview mutations and supports cleanup", () => {
  const preview = source(files.preview);
  assert.match(preview, /phhrfvmncpqqmmgruktx/);
  assert.match(preview, /Refusing.*production/i);
  assert.match(preview, /Refusing.*managed development/i);
  assert.match(preview, /--remove/);
  assert.match(preview, /snapraid-mergerfs-planner/);
});
