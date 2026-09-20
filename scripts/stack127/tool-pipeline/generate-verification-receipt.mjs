#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const routePattern = /^\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const risks = new Set(["simple", "standard", "high"]);

export function validateVerificationReceipt(receipt, { root = repositoryRoot } = {}) {
  const errors = [];
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) return ["receipt must be an object"];
  const allowed = new Set(["schemaVersion", "route", "risk", "status", "generatedAt", "baseCommit", "publicationState", "spec", "checks", "review"]);
  for (const key of Object.keys(receipt)) if (!allowed.has(key)) errors.push(`unknown receipt property: ${key}`);
  if (receipt.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!routePattern.test(receipt.route ?? "")) errors.push("route must be a flat canonical path");
  if (!risks.has(receipt.risk)) errors.push("risk must be simple, standard, or high");
  if (!["accepted", "blocked"].includes(receipt.status)) errors.push("status must be accepted or blocked");
  if (Number.isNaN(Date.parse(receipt.generatedAt ?? ""))) errors.push("generatedAt must be an ISO date");
  if (!/^[a-f0-9]{40}$/.test(receipt.baseCommit ?? "")) errors.push("baseCommit must be a full Git SHA");
  if (!["published", "unpublished", "noindex"].includes(receipt.publicationState)) errors.push("publicationState is invalid");
  if (typeof receipt.spec !== "string" || receipt.spec.startsWith("/") || receipt.spec.includes("..") || !existsSync(path.join(root, receipt.spec))) {
    errors.push("spec must name an existing repository file");
  }
  const checks = Array.isArray(receipt.checks) ? receipt.checks : [];
  if (checks.length !== 3) errors.push("receipt must contain exactly three checks");
  for (const name of ["fast", "browser", "build"]) {
    if (checks.filter((check) => check?.name === name).length !== 1) errors.push(`receipt needs one ${name} check`);
  }
  for (const check of checks) {
    if (!["fast", "browser", "build"].includes(check?.name) || !check?.command || !["passed", "failed"].includes(check.status) || !Number.isInteger(check.durationMs) || check.durationMs < 0) {
      errors.push(`invalid ${check?.name ?? "unknown"} check`);
    }
  }
  if (!["passed", "failed"].includes(receipt.review?.status) || !receipt.review?.summary?.trim()) errors.push("review status and summary are required");
  const allPassed = checks.length === 3 && checks.every((check) => check.status === "passed") && receipt.review?.status === "passed";
  if (receipt.status === "accepted" && !allPassed) errors.push("accepted receipt requires passing checks and review");
  if (receipt.status === "blocked" && allPassed) errors.push("blocked receipt must retain a failed check or review");
  return [...new Set(errors)];
}

function argument(name) {
  return process.argv.slice(2).find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

function runCheck(name, command, args, env = process.env) {
  const started = Date.now();
  const result = spawnSync(command, args, { cwd: repositoryRoot, env, stdio: "inherit" });
  if (result.error) throw result.error;
  return {
    name,
    command: [command, ...args].join(" "),
    status: result.status === 0 ? "passed" : "failed",
    durationMs: Date.now() - started,
  };
}

function gitSha() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr.trim() || "Could not resolve HEAD");
  return result.stdout.trim();
}

function main() {
  const route = process.argv.slice(2).find((value) => !value.startsWith("--"));
  const risk = argument("risk");
  const reviewStatus = argument("review");
  const reviewSummary = argument("review-summary");
  if (!routePattern.test(route ?? "") || !risks.has(risk) || !["passed", "failed"].includes(reviewStatus) || !reviewSummary?.trim()) {
    throw new Error("Usage: generate-verification-receipt.mjs /tool-slug --risk=simple|standard|high --review=passed|failed --review-summary=\"Independent review result\"");
  }

  const slug = route.slice(1);
  const manifestPath = path.join(repositoryRoot, "tests/pages", slug, "page.json");
  const specPath = path.join(repositoryRoot, "content_docs", slug, "tool-spec.md");
  if (!existsSync(manifestPath)) throw new Error(`Missing ownership manifest: tests/pages/${slug}/page.json`);
  if (!existsSync(specPath)) throw new Error(`Missing concise tool specification: content_docs/${slug}/tool-spec.md`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const browserSpecs = (manifest.tests ?? []).filter((file) => file.endsWith(".spec.ts") && file !== "tests/stack127/seo.spec.ts");
  if (!browserSpecs.length) throw new Error(`Ownership manifest needs at least one route-owned browser specification: tests/pages/${slug}/page.json`);
  const browserEnv = manifest.state === "published"
    ? process.env
    : {
        ...process.env,
        STACK127_INCLUDE_NONPUBLISHED_BROWSER_TESTS: "1",
        STACK127_TEST_DATABASE_ENV: ".env.local",
      };

  const checks = [];
  checks.push(runCheck("fast", "npm", ["run", "test:fast"]));
  if (checks.at(-1).status === "passed") {
    checks.push(runCheck("browser", "npx", ["playwright", "test", ...browserSpecs, "--project=chromium"], browserEnv));
  } else {
    checks.push({ name: "browser", command: `npx playwright test ${browserSpecs.join(" ")} --project=chromium`, status: "failed", durationMs: 0 });
  }
  if (checks.every((check) => check.status === "passed")) checks.push(runCheck("build", "npm", ["run", "build"]));
  else checks.push({ name: "build", command: "npm run build", status: "failed", durationMs: 0 });

  const allPassed = checks.every((check) => check.status === "passed") && reviewStatus === "passed";
  const receipt = {
    schemaVersion: 1,
    route,
    risk,
    status: allPassed ? "accepted" : "blocked",
    generatedAt: new Date().toISOString(),
    baseCommit: gitSha(),
    publicationState: manifest.state,
    spec: `content_docs/${slug}/tool-spec.md`,
    checks,
    review: { status: reviewStatus, summary: reviewSummary.trim() },
  };
  const errors = validateVerificationReceipt(receipt);
  if (errors.length) throw new Error(errors.join("\n"));
  const output = path.join(repositoryRoot, "content_docs", slug, "verification-receipt.json");
  writeFileSync(output, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`Wrote ${path.relative(repositoryRoot, output)} with status ${receipt.status}.`);
  if (!allPassed) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
