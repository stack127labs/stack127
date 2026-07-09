#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync, readlinkSync, statSync } from "node:fs";
import path from "node:path";
import { docFolderForRoute, routeFromPageFile, walk } from "./route-utils.mjs";

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
        fail(`${file} contains ${label}. Keep SEO in public.version127_pages and shared layouts.`);
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
  for (const header of ["x-version127-pathname", "x-version127-has-query"]) {
    if (!source.includes(header)) {
      fail(`proxy.ts does not set ${header}.`);
    }
  }
}

function checkVersion127DocsShape() {
  for (const file of walk("version127_docs")) {
    if (statSync(path.join(root, file)).isFile() && !file.endsWith(".md")) {
      fail(`${file} is not a Markdown doc. Keep automation/config out of version127_docs.`);
    }
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

function checkPageCoverage(pageFiles) {
  const manifestPath = "tests/version127/page-coverage.json";
  if (!existsSync(path.join(root, manifestPath))) {
    fail(`${manifestPath} is missing. Every site route needs an explicit test/publication decision.`);
    return;
  }

  const manifest = JSON.parse(read(manifestPath));
  const routes = manifest.routes ?? {};
  const pageRoutes = new Set(pageFiles.map(routeFromPageFile));
  const manifestRoutes = new Set(Object.keys(routes));
  const validStates = new Set(["published", "unpublished", "noindex"]);

  for (const route of pageRoutes) {
    if (!manifestRoutes.has(route)) {
      fail(`${manifestPath} is missing coverage for route ${route}.`);
    }
  }

  for (const route of manifestRoutes) {
    const entry = routes[route];
    if (!pageRoutes.has(route)) {
      fail(`${manifestPath} lists ${route}, but no matching app/(site) page exists.`);
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
  }
}

const pageFiles = walk("app/(site)").filter((file) => file.endsWith("/page.tsx"));

checkRouteSeoPolicy(pageFiles);
checkDocsForRoutes(pageFiles);
checkSelfHostingLessons(pageFiles);
checkProxyHeaders();
checkVersion127DocsShape();
checkPackageScripts();
checkSkillAdapters();
checkPageCoverage(pageFiles);

if (failures.length > 0) {
  console.error("Version127 static policy failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Version127 static policy passed (${pageFiles.length} route page files checked).`);
