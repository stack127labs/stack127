#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { routeFromPageFile, walk } from "./route-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const smokeSpec = "tests/stack127/release-smoke.spec.ts";

const sharedRiskPaths = [
  ".github/workflows/",
  "app/(site)/layout.tsx",
  "app/(site)/(tools)/layout.tsx",
  "app/app-shell",
  "app/globals.css",
  "app/json-ld",
  "app/layout.tsx",
  "app/page-canvas",
  "app/robots.ts",
  "app/site-nav",
  "app/sitemap.ts",
  "app/tool-page-content",
  "app/tool-ui/",
  "lib/tool-pages",
  "migrations/",
  "next.config",
  "package-lock.json",
  "package.json",
  "playwright.config.ts",
  "proxy.ts",
  "scripts/stack127/quality/",
  "tests/stack127/",
];

function normalize(file) {
  return file.split(path.sep).join("/").replace(/^\.\//, "");
}

function isDocumentationOnly(file) {
  return file === "AGENTS.md"
    || file.startsWith("content_docs/")
    || file.startsWith("skills/")
    || file.startsWith("stack127_docs/")
    || file.startsWith("stack127_records/")
    || file.endsWith(".md");
}

function hasSharedRisk(file) {
  return sharedRiskPaths.some((entry) => file === entry || file.startsWith(entry));
}

function readManifests(repositoryRoot) {
  const manifests = [];
  const pagesRoot = path.join(repositoryRoot, "tests/pages");

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      if (!entry.isFile() || entry.name !== "page.json") continue;
      const relative = normalize(path.relative(repositoryRoot, absolute));
      const data = JSON.parse(readFileSync(absolute, "utf8"));
      manifests.push({
        directory: normalize(path.dirname(relative)),
        route: data.route,
        state: data.state,
        tests: Array.isArray(data.tests) ? data.tests.map(normalize) : [],
        scripts: Array.isArray(data.scripts) ? data.scripts.map(normalize) : [],
      });
    }
  }

  visit(pagesRoot);
  return manifests;
}

function readRouteSources(repositoryRoot) {
  return walk("app/(site)", repositoryRoot)
    .filter((file) => file.endsWith("/page.tsx"))
    .map((file) => ({
      directory: normalize(path.dirname(file)),
      route: routeFromPageFile(normalize(file)),
    }))
    .sort((left, right) => right.directory.length - left.directory.length);
}

function manifestForFile(file, manifests, routeSources) {
  const manifestMatch = manifests
    .filter((entry) => file === entry.directory || file.startsWith(`${entry.directory}/`))
    .sort((left, right) => right.directory.length - left.directory.length)[0];
  if (manifestMatch) return manifestMatch;

  const source = routeSources.find((entry) => file === entry.directory || file.startsWith(`${entry.directory}/`));
  if (source) return manifests.find((entry) => entry.route === source.route) ?? null;

  const apiMatch = file.match(/^app\/api\/([^/]+)\//);
  if (apiMatch) return manifests.find((entry) => entry.route === `/${apiMatch[1]}`) ?? null;

  return manifests.find((entry) => entry.scripts.some((script) => file === script || file.startsWith(`${path.dirname(script)}/`))) ?? null;
}

export function planChanges(files, { repositoryRoot = root } = {}) {
  const changedFiles = [...new Set(files.map(normalize).filter(Boolean))].sort();
  if (!changedFiles.length) {
    return { mode: "full", reason: "No change base was available.", routes: [], specs: [] };
  }
  if (changedFiles.every(isDocumentationOnly)) {
    return { mode: "none", reason: "Only documentation or agent instructions changed.", routes: [], specs: [] };
  }

  const manifests = readManifests(repositoryRoot);
  const routeSources = readRouteSources(repositoryRoot);
  const routes = new Set();
  const unknown = [];

  for (const file of changedFiles) {
    if (isDocumentationOnly(file)) continue;
    if (hasSharedRisk(file)) {
      return { mode: "full", reason: `Shared-risk file changed: ${file}`, routes: [], specs: [] };
    }
    const manifest = manifestForFile(file, manifests, routeSources);
    if (manifest) routes.add(manifest.route);
    else unknown.push(file);
  }

  if (unknown.length) {
    return { mode: "full", reason: `Unmapped runtime file changed: ${unknown[0]}`, routes: [...routes].sort(), specs: [] };
  }

  const selected = [...routes]
    .map((route) => manifests.find((entry) => entry.route === route))
    .filter((entry) => entry?.state === "published");
  const specs = [...new Set([
    smokeSpec,
    ...selected.flatMap((entry) => entry.tests.filter((test) => test.endsWith(".spec.ts"))),
  ])].filter((file) => existsSync(path.join(repositoryRoot, file))).sort();

  if (!specs.length) {
    return {
      mode: "none",
      reason: "Changed routes are unpublished or have no browser specification.",
      routes: [...routes].sort(),
      specs: [],
    };
  }
  return {
    mode: "focused",
    reason: `Run browser coverage for ${selected.length} published changed route${selected.length === 1 ? "" : "s"}.`,
    routes: [...routes].sort(),
    specs,
  };
}

function gitLines(args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function resolveChangedFiles() {
  const args = process.argv.slice(2);
  const baseArgument = args.find((argument) => argument.startsWith("--base="))?.slice(7);
  const headArgument = args.find((argument) => argument.startsWith("--head="))?.slice(7) ?? "HEAD";
  const base = baseArgument ?? process.env.STACK127_BASE_SHA;
  if (base && !/^0+$/.test(base)) return gitLines(["diff", "--name-only", `${base}...${headArgument}`]);

  const working = [
    ...gitLines(["diff", "--name-only", "HEAD"]),
    ...gitLines(["ls-files", "--others", "--exclude-standard"]),
  ];
  if (working.length) return [...new Set(working)];
  return gitLines(["diff", "--name-only", "HEAD~1..HEAD"]);
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, env: process.env, stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const plan = planChanges(resolveChangedFiles());
    console.log(JSON.stringify(plan, null, 2));
    if (!process.argv.includes("--run") || plan.mode === "none") process.exitCode = 0;
    else if (plan.mode === "full") {
      const buildStatus = run("npm", ["run", "build"]);
      process.exitCode = buildStatus === 0 ? run("npm", ["run", "test:seo:shared"]) : buildStatus;
    } else {
      const browserStatus = run("npx", ["playwright", "test", ...plan.specs, "--project=chromium"]);
      process.exitCode = browserStatus === 0 ? run("npm", ["run", "build"]) : browserStatus;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
