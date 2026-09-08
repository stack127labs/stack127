import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const route = new URL("../../../app/(site)/(tools)/dockerignore-tester/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("dockerignore-tester.tsx", route);
const stylesPath = new URL("dockerignore-tester.module.css", route);
const parserPath = new URL("../../../lib/dockerignore/parser.ts", import.meta.url);
const matcherPath = new URL("../../../lib/dockerignore/matcher.ts", import.meta.url);
const evaluatePath = new URL("../../../lib/dockerignore/evaluate.ts", import.meta.url);
const manifestPath = new URL("page.json", import.meta.url);

test("owns one flat published route", () => {
  for (const file of [pagePath, clientPath, stylesPath, parserPath, matcherPath, evaluatePath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/dockerignore-tester");
  assert.equal(manifest.state, "published");
  assert.equal("reason" in manifest, false);
  assert.equal(existsSync(new URL("../../../app/(site)/developer-tools/dockerignore-tester/", import.meta.url)), false);
});

test("keeps matcher behavior pure and local", () => {
  const engine = [parserPath, matcherPath, evaluatePath].map((file) => readFileSync(file, "utf8")).join("\n");
  const client = readFileSync(clientPath, "utf8");
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|history\.|document\.|window\./i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML/i);
  assert.doesNotMatch(engine, /minimatch|picomatch|glob-to-regex|WebAssembly/i);
});

test("server content keeps the tool primary and states its exact boundaries", () => {
  const page = readFileSync(pagePath, "utf8");
  const guide = readToolPageSeed("dockerignore-tester");
  const client = readFileSync(clientPath, "utf8");
  const server = `${page}\n${guide}`;
  for (const text of [
    ".dockerignore Pattern Tester: see which rule decides each path",
    "Paste the .dockerignore file Docker will use",
    "path probes, not a filesystem scan or Docker build",
    "Start with the file Docker will actually use",
    "Docker patterns are ordered, not combined",
    "The deciding rule is the answer; the trace explains it",
    "When a result surprises you, check these four things",
    "What this tester proves, and what it cannot",
    "Confirm the final context with Docker",
    "**/*.go",
    "column 1",
    "last matching line",
    "official Docker documentation",
    "They need not exist",
    "trace evidence, not the final verdict",
    "Path probes",
    "Matching",
    "Included",
    "Builder control files",
    "Effective source",
    "Compatibility",
    "TypeScript compatibility port",
    "Moby",
    "v0.6.1",
    "not a claim about every current Docker build",
    "/self-hosting-for-beginners/install-docker",
    "https://docs.docker.com/build/concepts/context/#dockerignore-files",
  ]) assert.match(server, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const text of ["Root .dockerignore", "Dockerfile-specific", ".dockerignore rules", "Context-relative paths", "Load example", "Reset", "Test patterns", "Rules and paths stay in your browser"]) assert.match(client, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.equal((server.match(/need not exist/gi) ?? []).length, 1);
  assert.equal((`${server}\n${client}`.match(/Rules and paths stay in your browser\./g) ?? []).length, 1);
  assert.doesNotMatch(server, /matching stays in your browser|exact-current-Docker/);
  assert.doesNotMatch(`${server}\n${client}`, /FAQ|How to use|Methodology|Related reading|—|–/i);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
});

test("uses one responsive semantic workbench", () => {
  const styles = readFileSync(stylesPath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(client, /data-tool-workbench/);
  assert.doesNotMatch(styles, /\.tool\s*\{[^}]*(?:border:\s*1\.5px|border-radius:)/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
  for (const declaration of styles.match(/font-size\s*:[^;]+;/g) ?? []) assert.match(declaration, /var\(--text-(?:body|small|h1|h2|h3)\)/);
});
