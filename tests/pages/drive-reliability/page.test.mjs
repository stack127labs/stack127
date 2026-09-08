import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const root = path.resolve(import.meta.dirname, "../../..");
const routeDirectory = path.join(root, "app/(site)/(tools)/drive-reliability");
const pagePath = path.join(routeDirectory, "page.tsx");
const clientPath = path.join(routeDirectory, "drive-reliability.tsx");
const stylePath = path.join(routeDirectory, "drive-reliability.module.css");
const dataPath = path.join(routeDirectory, "data/drive-reliability-snapshot.json");
const enginePath = path.join(root, "lib/drive-reliability.ts");
const manifestPath = path.join(import.meta.dirname, "page.json");
const refreshPath = path.join(root, "scripts/drive-reliability/refresh-snapshot.mjs");

test("the published route owns its source, dataset, engine, tests, and refresh script", () => {
  for (const file of [pagePath, clientPath, stylePath, dataPath, enginePath, refreshPath]) {
    assert.equal(existsSync(file), true, file);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/drive-reliability");
  assert.equal(manifest.state, "published");
});

test("the page uses the shared shell and has no route-local SEO or publication logic", () => {
  const page = readFileSync(pagePath, "utf8");
  assert.match(page, /<AppShell/);
  assert.match(page, /<DriveReliabilityExplorer/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|stack127_pages|sitemap/i);
  const client = readFileSync(clientPath, "utf8");
  assert.match(client, /Select one to three cohorts to inspect their observed result/);
});

test("the supporting guide is server-rendered, bounded, and points to the next check", () => {
  const guide = readToolPageSeed("drive-reliability");
  for (const phrase of [
    "Choose a period that matches the question",
    "AFR uses drive days, not drive count",
    "data-center",
    "local",
    "SMART",
    "/storage-tools",
    "/zfs-capacity-calculator",
  ]) {
    assert.match(guide, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), phrase);
  }
  assert.doesNotMatch(guide, /best drive|personal failure probability|guarantee/i);
});

test("the technical core stays outside React and remains local-first", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(engine, /calculateAnnualizedFailureRate/);
  assert.match(engine, /calculateEvidenceRange/);
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|Worker|child_process|exec\(|spawn\(/i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|Worker|localStorage|sessionStorage/);
  assert.match(client, /ToolStatus/);
  assert.match(client, /Show cohorts below the Backblaze source threshold/);
});

test("the interface follows the ready selection and result contract", () => {
  const client = readFileSync(clientPath, "utf8");
  for (const component of [
    "ToolChoiceGroup",
    "ToolDisclosure",
    "ToolNumberField",
    "ToolPrimaryResult",
    "ToolResultLead",
    "ToolSearchField",
    "ToolSelect",
  ]) {
    assert.match(client, new RegExp(`\\b${component}\\b`), component);
  }
  assert.match(client, /Filter model list/);
  assert.match(client, /Selected cohort evidence/);
  assert.match(client, /Share selection/);
  assert.match(client, /Approximate 95% evidence range/);
  assert.doesNotMatch(client, /metricGrid|Compare selected|Drive days, failures, and evidence range\./);
  assert.doesNotMatch(client, /hasResultIntent\s*\?\s*resolution\.primary/);
});

test("the route styling follows the shared workbench and responsive contract", () => {
  const styles = readFileSync(stylePath, "utf8");
  assert.match(readFileSync(clientPath, "utf8"), /data-tool-workbench/);
  assert.doesNotMatch(styles, /\.tool\s*\{[^}]*(?:border:\s*1\.5px|border-radius:)/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
  for (const declaration of styles.match(/font-size\s*:[^;]+;/g) ?? []) {
    assert.match(declaration, /var\(--text-(?:body|small|h1|h2|h3)\)/);
  }
});

test("the route stays isolated from shared storage surfaces", () => {
  const changed = [];
  const allowed = [
    "content_docs/drive-reliability/",
    "app/(site)/(tools)/drive-reliability/",
    "lib/drive-reliability.ts",
    "tests/pages/drive-reliability/",
    "scripts/drive-reliability/",
  ];
  const files = [pagePath, clientPath, stylePath, dataPath, enginePath, manifestPath, refreshPath];
  for (const file of files) {
    const relative = path.relative(root, file);
    assert.equal(allowed.some((prefix) => relative === prefix || relative.startsWith(prefix)), true, relative);
    changed.push(relative);
  }
  assert.ok(changed.length >= 7);
});
