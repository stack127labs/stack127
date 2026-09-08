#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const EXPECTATIONS = ["intake", "research", "product", "interface", "test", "build", "handoff"];
const REQUIRED_ARTIFACTS = {
  intake: [],
  research: ["competitive-report.md"],
  product: ["competitive-report.md", "implementation-report.md", "brief.md"],
  interface: ["competitive-report.md", "implementation-report.md", "brief.md", "interface-contract.md"],
  test: ["competitive-report.md", "implementation-report.md", "brief.md", "interface-contract.md", "edge-cases-and-tests.md"],
  build: ["competitive-report.md", "implementation-report.md", "brief.md", "interface-contract.md", "edge-cases-and-tests.md"],
  handoff: ["competitive-report.md", "implementation-report.md", "brief.md", "interface-contract.md", "edge-cases-and-tests.md", "writing-and-seo.md"],
};
const REPORT_FILES = new Set([
  "competitive-report.md",
  "implementation-report.md",
  "interface-contract.md",
  "edge-cases-and-tests.md",
  "writing-and-seo.md",
]);

export function findRepositoryRoot(start) {
  let current = resolve(start);
  while (true) {
    if (existsSync(resolve(current, "AGENTS.md")) && existsSync(resolve(current, "package.json"))) return current;
    const parent = dirname(current);
    if (parent === current) throw new Error(`Cannot find repository root from ${start}`);
    current = parent;
  }
}

export function normalizeRoute(value) {
  if (!value || typeof value !== "string") throw new Error("A route or content_docs directory is required");
  let normalized = value.trim().replaceAll("\\", "/");
  const contentMarker = "/content_docs/";
  if (normalized.includes(contentMarker)) normalized = normalized.slice(normalized.indexOf(contentMarker) + contentMarker.length);
  else if (normalized.startsWith("content_docs/")) normalized = normalized.slice("content_docs/".length);
  normalized = normalized.replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized.includes("?") || normalized.includes("#")) throw new Error(`Invalid stable route: ${value}`);
  const parts = normalized.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) throw new Error(`Invalid stable route: ${value}`);
  return `/${parts.join("/")}`;
}

export function readHeader(content, label) {
  const preambleEnd = content.search(/^##\s/m);
  const preamble = preambleEnd === -1 ? content : content.slice(0, preambleEnd);
  const matcher = new RegExp(`^${label}:\\s*(.+?)\\s*$`, "gmi");
  const matches = [...preamble.matchAll(matcher)];
  if (matches.length !== 1) return null;
  return matches[0][1].replace(/^`|`$/g, "").trim();
}

function routeRelative(route) {
  return route.slice(1).split("/").join(sep);
}

function listedPathExists(repositoryRoot, listedPath) {
  if (typeof listedPath !== "string" || listedPath.length === 0) return false;
  const absolute = resolve(repositoryRoot, listedPath);
  const rel = relative(repositoryRoot, absolute);
  return rel !== "" && !rel.startsWith(`..${sep}`) && rel !== ".." && existsSync(absolute);
}

function runValidator(repositoryRoot, docsDirectory, args) {
  const validator = resolve(repositoryRoot, "skills/stack127/stack127-tool-build/scripts/validate-pipeline.mjs");
  if (!existsSync(validator)) return { ok: false, output: `Missing validator: ${relative(repositoryRoot, validator)}` };
  const result = spawnSync(process.execPath, [validator, docsDirectory, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim(),
  };
}

function gitDirtyCount(repositoryRoot) {
  const result = spawnSync("git", ["status", "--porcelain=v1"], { cwd: repositoryRoot, encoding: "utf8" });
  if (result.status !== 0) return null;
  return result.stdout.split(/\r?\n/).filter(Boolean).length;
}

export function inspectPipeline({ repositoryRoot, routeInput, expectation, runValidators = true }) {
  if (!EXPECTATIONS.includes(expectation)) throw new Error(`Unknown expectation: ${expectation}`);
  const route = normalizeRoute(routeInput);
  const routePath = routeRelative(route);
  const docsDirectory = resolve(repositoryRoot, "content_docs", routePath);
  const routeDirectory = resolve(repositoryRoot, "app", "(site)", "(tools)", routePath);
  const manifestPath = resolve(repositoryRoot, "tests", "pages", routePath, "page.json");
  const errors = [];
  const warnings = [];
  const checks = [];

  for (const artifact of REQUIRED_ARTIFACTS[expectation]) {
    const filePath = resolve(docsDirectory, artifact);
    if (!existsSync(filePath)) {
      errors.push(`${artifact}: missing required artifact`);
      continue;
    }
    checks.push(`${artifact}: present`);
    if (!REPORT_FILES.has(artifact)) continue;
    const content = readFileSync(filePath, "utf8");
    const status = readHeader(content, "Status");
    const artifactRoute = readHeader(content, "Route");
    if (status !== "ready") errors.push(`${artifact}: Status must be ready`);
    if (artifactRoute !== route) errors.push(`${artifact}: Route ${artifactRoute ?? "is missing"} does not match ${route}`);
  }

  const stageByExpectation = {
    research: "research",
    product: "product",
    interface: "interface",
    test: "test",
    build: "test",
    handoff: "content",
  };
  const validationStage = stageByExpectation[expectation];
  if (runValidators && validationStage) {
    const result = runValidator(repositoryRoot, docsDirectory, [`--stage=${validationStage}`]);
    if (result.ok) checks.push(`pipeline validator (${validationStage}): passed`);
    else errors.push(`pipeline validator (${validationStage}) failed:\n${result.output}`);
  }

  if (["build", "handoff"].includes(expectation)) {
    if (!existsSync(routeDirectory)) errors.push(`route source missing: ${relative(repositoryRoot, routeDirectory)}`);
    else checks.push(`route source: present`);

    let manifest = null;
    if (!existsSync(manifestPath)) {
      errors.push(`ownership manifest missing: ${relative(repositoryRoot, manifestPath)}`);
    } else {
      try {
        manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        checks.push("ownership manifest: readable");
      } catch (error) {
        errors.push(`ownership manifest is invalid JSON: ${error.message}`);
      }
    }

    if (manifest) {
      if (manifest.route !== route) errors.push(`ownership manifest route ${manifest.route ?? "is missing"} does not match ${route}`);
      if (manifest.state !== "unpublished") errors.push(`ownership manifest must remain unpublished; found ${manifest.state ?? "missing state"}`);

      for (const key of ["docs", "tests", "scripts", "skills"]) {
        if (!Array.isArray(manifest[key])) {
          errors.push(`ownership manifest ${key} must be an array`);
          continue;
        }
        for (const listedPath of manifest[key]) {
          if (!listedPathExists(repositoryRoot, listedPath)) errors.push(`ownership manifest ${key} path is missing or unsafe: ${listedPath}`);
        }
      }
      if (!Array.isArray(manifest.tests) || manifest.tests.length === 0) errors.push("ownership manifest must list automated tests");
      if (!manifest.skills?.includes("skills/stack127/stack127-tool-orchestrator")) {
        errors.push("ownership manifest must list skills/stack127/stack127-tool-orchestrator");
      }
      if (!manifest.skills?.includes("skills/stack127/stack127-tool-build")) {
        errors.push("ownership manifest must list skills/stack127/stack127-tool-build");
      }
      if (!manifest.skills?.includes("skills/stack127/stack127-tool-interface-plan")) {
        errors.push("ownership manifest must list skills/stack127/stack127-tool-interface-plan");
      }
      if (expectation === "handoff" && !manifest.skills?.includes("skills/stack127/stack127-tool-writing")) {
        errors.push("ownership manifest must list skills/stack127/stack127-tool-writing at handoff");
      }
    }

    if (runValidators && expectation === "build") {
      const result = runValidator(repositoryRoot, docsDirectory, ["--tool-only"]);
      if (result.ok) checks.push("tool-only audit: passed");
      else errors.push(`tool-only audit failed:\n${result.output}`);
    }
  }

  const dirtyCount = gitDirtyCount(repositoryRoot);
  if (dirtyCount === null) warnings.push("Git worktree state could not be read");
  else if (dirtyCount > 0) warnings.push(`Git worktree has ${dirtyCount} changed path${dirtyCount === 1 ? "" : "s"}; preserve unrelated work`);
  else checks.push("Git worktree: clean");

  return {
    ok: errors.length === 0,
    route,
    expectation,
    docsDirectory: relative(repositoryRoot, docsDirectory),
    routeDirectory: relative(repositoryRoot, routeDirectory),
    manifestPath: relative(repositoryRoot, manifestPath),
    checks,
    warnings,
    errors,
  };
}

function parseArguments(argumentsList) {
  const routeInput = argumentsList.find((argument) => !argument.startsWith("--"));
  const expectationArgument = argumentsList.find((argument) => argument.startsWith("--expect="));
  const expectation = expectationArgument?.slice("--expect=".length);
  if (!routeInput || !EXPECTATIONS.includes(expectation)) {
    throw new Error(`Usage: node inspect-tool-pipeline.mjs <route-or-content_docs-directory> --expect=${EXPECTATIONS.join("|")} [--json]`);
  }
  return {
    routeInput,
    expectation,
    json: argumentsList.includes("--json"),
  };
}

function printHuman(result) {
  console.log(`Tool pipeline ${result.ok ? "ready" : "blocked"}: ${result.route} (${result.expectation})`);
  for (const check of result.checks) console.log(`PASS ${check}`);
  for (const warning of result.warnings) console.log(`WARN ${warning}`);
  for (const error of result.errors) console.error(`FAIL ${error}`);
}

const directExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (directExecution) {
  try {
    const args = parseArguments(process.argv.slice(2));
    const repositoryRoot = findRepositoryRoot(process.cwd());
    const result = inspectPipeline({ repositoryRoot, ...args });
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else printHuman(result);
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
