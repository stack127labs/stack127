import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const route = new URL("../../../app/(site)/(tools)/nfs-firewall-rules/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("nfs-firewall-rules-planner.tsx", route);
const stylesPath = new URL("nfs-firewall-rules.module.css", route);
const enginePath = new URL("../../../lib/nfs-firewall/plan.ts", import.meta.url);
const previewPath = new URL("../../../scripts/nfs-firewall-rules/preview-local-page.mjs", import.meta.url);
const migrationPath = new URL("../../../supabase/migrations/20260809120000_publish_three_tools.sql", import.meta.url);
const manifestPath = new URL("page.json", import.meta.url);

test("owns one flat published route", () => {
  for (const file of [pagePath, clientPath, stylesPath, enginePath, previewPath, migrationPath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/nfs-firewall-rules");
  assert.equal(manifest.state, "published");
  assert.match(readFileSync(migrationPath, "utf8"), /'nfs-firewall-rules'/);
});

test("keeps calculation pure, local, and untrusted text inert", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|history\.|document\.|window\.|eval\(|Function\(/i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML|eval\(|Function\(/i);
});

test("keeps the tool primary and identity server rendered", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const guide = readToolPageSeed("nfs-firewall-rules");
  const styles = readFileSync(stylesPath, "utf8");
  assert.match(page, /getRequiredToolPage\("nfs-firewall-rules"\)/);
  assert.match(page, /import \{ AppShell \} from "\.\.\/\.\.\/\.\.\/app-shell"/);
  assert.match(page, /<AppShell mainLabel="NFS Firewall Rules Planner">/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(client, /Plan firewall rules/);
  assert.match(client, /Protected host/);
  assert.match(client, /Allowed .* CIDR/);
  assert.match(client, /Listener plan/);
  assert.doesNotMatch(client, /<li key=\{step\}><code>\{step\}<\/code><\/li>/);
  assert.match(page, /<NfsFirewallRulesPlanner \/>[\s\S]*<ToolPageMarkdown/);
  assert.doesNotMatch(guide, /^\s*["']use client["'];/m);
  assert.match(guide, /What changes between NFSv3 and NFSv4/);
  assert.match(guide, /Verify NFSv3 helper ports on the protected host/);
  assert.match(guide, /Treat the output as a review plan/);
  assert.match(guide, /What the planner cannot verify/);
  assert.match(guide, /rpcinfo -p/);
  assert.match(guide, /ss -lntup/);
  assert.match(guide, /fixed by the protocol/i);
  assert.match(guide, /assigned locally/i);
  assert.match(guide, /existing.*inet.*input chain/is);
  assert.match(guide, /cannot prove/i);
  assert.match(guide, /entered values stay in this browser/i);
  assert.match(guide, /\]\(\/privacy\)/);
  assert.match(guide, /docs\.redhat\.com/);
  assert.match(guide, /man7\.org\/linux\/man-pages\/man5\/nfs\.conf\.5\.html/);
  assert.doesNotMatch(client, /What changes between NFSv3 and NFSv4|What the planner cannot verify/);
  assert.match(styles, /\.tool\s*\{[^}]*border:\s*1\.5px solid var\(--color-border-strong\);/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
  assert.doesNotMatch(`${page}\n${client}\n${guide}`, /<h2>FAQ|Methodology|Related reading|How to use|—|–/i);
});

test("guards preview mutations to a local database", () => {
  const preview = readFileSync(previewPath, "utf8");
  assert.match(preview, /127\.0\.0\.1/);
  assert.match(preview, /localhost/);
  assert.match(preview, /Refusing to change a non-local database/);
  assert.match(preview, /--remove/);
});
