#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync, readlinkSync, statSync } from "node:fs";
import path from "node:path";
import { docFolderForRoute, routeFromPageFile, walk } from "./route-utils.mjs";
import { pageLayoutFailures } from "./page-layout-policy.mjs";

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function selfHostingSlugFromRoute(route) {
  if (route === "/self-hosting-for-beginners") return "";
  return route.replace(/^\/self-hosting-for-beginners\/?/, "");
}

function parseLessons() {
  const source = read("lib/self-hosting-for-beginners.ts");
  const arrayMatch = source.match(/export const lessons: Lesson\[\] = \[([\s\S]*?)\];/);
  if (!arrayMatch) {
    fail("Could not find exported self-hosting lessons array.");
    return [];
  }

  const objectMatches = [...arrayMatch[1].matchAll(/\{([\s\S]*?)\}/g)];
  return objectMatches.map((match) => {
    const block = match[1];
    const value = (key) => block.match(new RegExp(`${key}:\\s*"([^"]*)"`))?.[1] ?? "";
    const order = Number(block.match(/order:\s*(\d+)/)?.[1] ?? 0);
    const published = block.match(/published:\s*(true|false)/)?.[1] === "true";

    return {
      heading: value("heading"),
      order,
      published,
      sidebarLabel: value("sidebarLabel"),
      slug: value("slug"),
    };
  });
}

function checkRouteSeoPolicy(pageFiles) {
  const banned = [
    ["export const metadata", "route-owned metadata"],
    ["export async function generateMetadata", "route-owned generateMetadata"],
    ["export function generateMetadata", "route-owned generateMetadata"],
    ["application/ld+json", "route-owned JSON-LD"],
    ["<JsonLd", "route-owned JSON-LD component"],
    ["canonical:", "route-owned canonical metadata"],
    ["robots:", "route-owned robots metadata"],
  ];

  for (const file of pageFiles) {
    const source = read(file);
    for (const [needle, label] of banned) {
      if (source.includes(needle)) {
        fail(`${file} contains ${label}. Keep SEO in public.stack127_pages and shared layouts.`);
      }
    }
  }
}

function checkDocsForRoutes(pageFiles) {
  const missing = new Set();

  for (const file of pageFiles) {
    const route = routeFromPageFile(file);
    const docFolder = docFolderForRoute(route);
    if (!existsSync(path.join(root, "content_docs", docFolder))) {
      missing.add(`content_docs/${docFolder}`);
    }
  }

  for (const folder of missing) {
    fail(`Missing page docs folder: ${folder}`);
  }
}

function checkSelfHostingLessons(pageFiles) {
  const lessons = parseLessons();
  const lessonsBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  const orders = new Set();

  for (const lesson of lessons) {
    if (!lesson.order || orders.has(lesson.order)) {
      fail(`Invalid or duplicate self-hosting lesson order: ${lesson.order}`);
    }
    orders.add(lesson.order);
    if (!lesson.heading || !lesson.sidebarLabel) {
      fail(`Self-hosting lesson "${lesson.slug}" is missing heading or sidebarLabel.`);
    }
  }

  const routeFiles = pageFiles.filter((file) => routeFromPageFile(file).startsWith("/self-hosting-for-beginners"));
  const routeSlugs = new Set(routeFiles.map((file) => selfHostingSlugFromRoute(routeFromPageFile(file))));

  for (const lesson of lessons) {
    if (lesson.published && !routeSlugs.has(lesson.slug)) {
      fail(`Self-hosting lesson "${lesson.slug}" is marked published but has no route file.`);
    }
  }

  for (const file of routeFiles) {
    const route = routeFromPageFile(file);
    const slug = selfHostingSlugFromRoute(route);
    const source = read(file);
    const lesson = lessonsBySlug.get(slug);

    if (!lesson) {
      fail(`${file} has no matching entry in lib/self-hosting-for-beginners.ts.`);
    }
    if (!source.includes("LessonPage")) {
      fail(`${file} must render through the shared LessonPage shell.`);
    }
    if (source.includes("<AppShell")) {
      fail(`${file} should not bypass LessonPage with AppShell directly.`);
    }
    if (!source.includes(`getLesson("${slug}")`)) {
      fail(`${file} should call getLesson("${slug}") so heading/sidebar state stays central.`);
    }
  }
}

function checkProxyHeaders() {
  if (!existsSync(path.join(root, "proxy.ts"))) {
    fail("proxy.ts is missing. The SEO layout needs request path/query headers.");
    return;
  }

  const source = read("proxy.ts");
  for (const header of ["x-stack127-pathname", "x-stack127-has-query"]) {
    if (!source.includes(header)) {
      fail(`proxy.ts does not set ${header}.`);
    }
  }
}

function checkStack127DocsShape() {
  for (const file of walk("stack127_docs")) {
    if (statSync(path.join(root, file)).isFile() && !file.endsWith(".md")) {
      fail(`${file} is not a Markdown doc. Keep automation/config out of stack127_docs.`);
    }
  }
}

function checkUiTextCasing() {
  const cssFiles = walk("app").filter((file) => file.endsWith(".css"));
  const positiveTracking = /letter-spacing:\s*\+?(?:0*\.)?0*[1-9]\d*(?:em|rem|px)\s*;/i;

  for (const file of cssFiles) {
    const source = read(file);
    if (/text-transform:\s*uppercase/i.test(source)) {
      fail(`${file} forces UI text to uppercase. Write the intended casing in the UI copy instead.`);
    }
    if (positiveTracking.test(source)) {
      fail(`${file} adds positive letter spacing. Stack127 UI does not use spaced label text.`);
    }
  }
}

function checkGlobalCssOwnership() {
  const source = read("app/globals.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const selectorLine = source.split("\n").find((line) => {
    const trimmed = line.trim();
    return /[.#][A-Za-z_-][\w-]*/.test(trimmed) && (trimmed.includes("{") || !trimmed.includes(":"));
  });

  if (selectorLine) {
    fail(
      `app/globals.css contains a class or ID selector: ${selectorLine.trim()} Move it to a colocated CSS Module or route-family stylesheet.`,
    );
  }
}

function checkPackageScripts() {
  const pkg = JSON.parse(read("package.json"));
  const required = ["prebuild", "typecheck", "test:unit", "test:static", "test:seo", "test:seo:registry", "quality"];
  for (const script of required) {
    if (!pkg.scripts?.[script]) {
      fail(`package.json is missing required script "${script}".`);
    }
  }
}

function checkSkillAdapters() {
  const adapters = [".agents/skills", ".claude/skills"];

  for (const adapter of adapters) {
    const absolutePath = path.join(root, adapter);
    if (!existsSync(absolutePath)) {
      fail(`${adapter} is missing. Agent skill adapters must point to the canonical skills/ folder.`);
      continue;
    }

    const stats = lstatSync(absolutePath);
    if (!stats.isSymbolicLink()) {
      fail(`${adapter} must be a symlink to ../skills, not a copied folder.`);
      continue;
    }

    const target = readlinkSync(absolutePath);
    if (target !== "../skills") {
      fail(`${adapter} points to ${target}; expected ../skills.`);
    }
  }
}

function pageManifestPath(route) {
  return route === "/"
    ? "tests/pages/home/page.json"
    : path.join("tests/pages", route.replace(/^\//, ""), "page.json");
}

function checkPageCoverage(pageFiles) {
  const pageRoutes = new Set(pageFiles.map(routeFromPageFile));
  const manifestFiles = walk("tests/pages").filter((file) => file.endsWith("/page.json"));
  const manifests = new Map();
  const validStates = new Set(["published", "unpublished", "noindex"]);

  for (const route of pageRoutes) {
    const manifestPath = pageManifestPath(route);
    if (!existsSync(path.join(root, manifestPath))) {
      fail(`${manifestPath} is missing. Every site route needs a page-scoped ownership manifest.`);
      continue;
    }

    let entry;
    try {
      entry = JSON.parse(read(manifestPath));
    } catch (error) {
      fail(`${manifestPath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    manifests.set(route, { entry, manifestPath });
    if (entry?.route !== route) {
      fail(`${manifestPath} declares route ${entry?.route ?? "nothing"}; expected ${route}.`);
    }
    if (!validStates.has(entry?.state)) {
      fail(`${manifestPath} route ${route} must use state published, unpublished, or noindex.`);
    }
    if (!Array.isArray(entry?.tests) || entry.tests.length === 0) {
      fail(`${manifestPath} route ${route} must list at least one test file.`);
    }
    for (const testFile of entry?.tests ?? []) {
      if (!existsSync(path.join(root, testFile))) {
        fail(`${manifestPath} route ${route} references missing test file: ${testFile}`);
      }
    }
    if (entry?.state !== "published" && !String(entry?.reason ?? "").trim()) {
      fail(`${manifestPath} route ${route} needs a reason when it is not published.`);
    }

    for (const field of ["docs", "scripts", "skills", "repositories"]) {
      if (!Array.isArray(entry?.[field])) {
        fail(`${manifestPath} route ${route} must declare a ${field} array.`);
        continue;
      }
      for (const ownedPath of entry[field]) {
        if (!existsSync(path.join(root, ownedPath))) {
          fail(`${manifestPath} route ${route} references missing ${field} path: ${ownedPath}`);
        }
      }
    }
    if (entry?.docs?.length === 0) {
      fail(`${manifestPath} route ${route} must reference at least one documentation path.`);
    }
  }

  for (const manifestFile of manifestFiles) {
    let entry;
    try {
      entry = JSON.parse(read(manifestFile));
    } catch {
      continue;
    }
    if (!pageRoutes.has(entry?.route)) {
      fail(`${manifestFile} declares ${entry?.route ?? "no route"}, but no matching app/(site) page exists.`);
    }
  }
}

const pageFiles = walk("app/(site)").filter((file) => file.endsWith("/page.tsx"));

checkRouteSeoPolicy(pageFiles);
checkDocsForRoutes(pageFiles);
checkSelfHostingLessons(pageFiles);
checkProxyHeaders();
checkStack127DocsShape();
checkUiTextCasing();
checkGlobalCssOwnership();
checkPackageScripts();
checkSkillAdapters();
checkPageCoverage(pageFiles);
const appFiles = walk("app");
for (const failure of pageLayoutFailures(
  new Map(appFiles.filter(file => file.endsWith(".tsx")).map(file => [file, read(file)])),
  new Map(appFiles.filter(file => file.endsWith(".css")).map(file => [file, read(file)])),
)) fail(failure);

if (failures.length > 0) {
  console.error("Stack127 static policy failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Stack127 static policy passed (${pageFiles.length} route page files checked).`);
