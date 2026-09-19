#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { resolveDatabaseUrl } from "../tool-pages/lib.mjs";
import {
  CHECKS,
  SHARED_SESSION_GROUPS,
  SCOPE_STAGES,
  WORKER_CONFIG,
  requiredChecks,
  requiredWorkerRoles,
  safeRepoFile,
  sha256Text,
  targetDigest,
  verifyFile,
} from "./helpers.mjs";

const MEDIA = new Set([
  "sentence",
  "ordered list",
  "unordered list",
  "definition list",
  "table",
  "exact chart",
  "clean chart",
  "conceptual marker figure",
  "diagram",
  "screenshot",
  "interactive output",
  "tool ui",
]);
const EVIDENCE_KINDS = new Set(["command", "browser", "review", "database"]);
const HEX_64 = /^[a-f0-9]{64}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const { Pool } = pg;

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function add(errors, message) {
  errors.push(message);
}

function rejectUnknown(value, allowed, label, errors) {
  if (!object(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) add(errors, `${label}: unknown property ${key}`);
  }
}

function uniqueIds(values, label, errors) {
  const ids = new Set();
  for (const item of values ?? []) {
    if (!item?.id) add(errors, `${label}: missing id`);
    else if (ids.has(item.id)) add(errors, `${label}: duplicate id ${item.id}`);
    else ids.add(item.id);
  }
  return ids;
}

function markdownSection(content, title) {
  const marker = `## ${title}`;
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === marker);
  if (start === -1) return "";
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith("## ")) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

function isSortedByPath(entries) {
  const paths = entries.map((entry) => entry.path);
  return paths.every((path, index) => index === 0 || paths[index - 1].localeCompare(path) <= 0);
}

function structural(record, errors) {
  const top = new Set([
    "schemaVersion",
    "route",
    "scope",
    "status",
    "authors",
    "target",
    "feasibility",
    "mode",
    "coverage",
    "checks",
    "evidence",
    "findings",
  ]);
  if (!object(record)) {
    add(errors, "acceptance record must be an object");
    return { owns: new Set() };
  }
  rejectUnknown(record, top, "record", errors);
  if (record.schemaVersion !== 1) add(errors, "schemaVersion must be 1");
  if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.route ?? "")) {
    add(errors, "route must be a flat canonical path");
  }
  if (!object(record.scope) || !["new", "retrofit"].includes(record.scope?.kind)) {
    add(errors, "scope.kind must be new or retrofit");
  }
  rejectUnknown(record.scope, new Set(["kind", "owns", "excludes"]), "scope", errors);
  const owns = Array.isArray(record.scope?.owns) ? record.scope.owns : [];
  if (!owns.length) add(errors, "scope.owns must be nonempty");
  if (new Set(owns).size !== owns.length) add(errors, "scope.owns must not contain duplicates");
  for (const stage of owns) {
    if (!SCOPE_STAGES.includes(stage)) add(errors, `scope.owns: unsupported stage ${stage}`);
  }
  if (!Array.isArray(record.scope?.excludes)) add(errors, "scope.excludes must be an array");
  if (record.scope?.kind === "new" && SCOPE_STAGES.some((stage) => !owns.includes(stage))) {
    add(errors, "new scope must own every pipeline stage");
  }
  if (!new Set(["draft", "blocked", "accepted"]).has(record.status)) {
    add(errors, "status must be draft, blocked, or accepted");
  }
  for (const name of ["authors", "feasibility", "coverage", "checks", "evidence", "findings"]) {
    if (!Array.isArray(record[name])) add(errors, `${name} must be an array`);
  }
  return { owns: new Set(owns) };
}

function validateTarget(record, repositoryRoot, errors) {
  const target = record.target;
  rejectUnknown(target, new Set(["commit", "files", "inputs", "content", "digest"]), "target", errors);
  if (!object(target) || !/^[a-f0-9]{40}$/.test(target?.commit ?? "")) {
    add(errors, "target.commit must be a full lowercase Git SHA");
  }
  if (!Array.isArray(target?.files) || !target.files.length) {
    add(errors, "target.files must be a nonempty array");
  }
  if (!Array.isArray(target?.inputs)) add(errors, "target.inputs must be an array");
  const entries = [...(target?.files ?? []), ...(target?.inputs ?? [])];
  const paths = entries.map((entry) => entry.path);
  if (new Set(paths).size !== paths.length) add(errors, "target file/input paths must be unique");
  if (Array.isArray(target?.files) && !isSortedByPath(target.files)) add(errors, "target.files must sort by path");
  if (Array.isArray(target?.inputs) && !isSortedByPath(target.inputs)) add(errors, "target.inputs must sort by path");

  for (const entry of target?.files ?? []) {
    rejectUnknown(entry, new Set(["path", "sha256"]), `target.files ${entry?.path ?? "entry"}`, errors);
    if (!HEX_64.test(entry?.sha256 ?? "")) add(errors, `target.files ${entry?.path ?? "entry"}: invalid sha256`);
    const result = verifyFile(repositoryRoot, entry);
    if (!result.ok) add(errors, `target.files ${result.error}`);
  }
  for (const entry of target?.inputs ?? []) {
    rejectUnknown(entry, new Set(["path", "sha256", "validation"]), `target.inputs ${entry?.path ?? "entry"}`, errors);
    if (!HEX_64.test(entry?.sha256 ?? "")) add(errors, `target.inputs ${entry?.path ?? "entry"}: invalid sha256`);
    if (!["current", "legacy-unverified"].includes(entry?.validation)) {
      add(errors, `${entry?.path ?? "target input"}: invalid input validation`);
    }
    const result = verifyFile(repositoryRoot, entry);
    if (!result.ok) add(errors, `target.inputs ${result.error}`);
  }

  const content = target?.content;
  rejectUnknown(content, new Set(["environment", "revision", "toolVersion", "fields"]), "target.content", errors);
  if (!object(content) || !["development", "production"].includes(content?.environment)) {
    add(errors, "target.content.environment must be development or production");
  }
  if (!Number.isInteger(content?.revision) || content.revision < 1) {
    add(errors, "target.content.revision must be a positive integer");
  }
  if (!/^\d+\.\d+\.\d+$/.test(content?.toolVersion ?? "")) {
    add(errors, "target.content.toolVersion must be semantic version x.y.z");
  }
  const fields = content?.fields;
  const fieldNames = ["title", "intro_markdown", "usage_markdown", "content_markdown"];
  rejectUnknown(fields, new Set(fieldNames), "target.content.fields", errors);
  for (const name of fieldNames) {
    if (!HEX_64.test(fields?.[name] ?? "")) add(errors, `target.content.fields.${name} must be a SHA-256 hash`);
  }
  if (!HEX_64.test(target?.digest ?? "") || target.digest !== targetDigest(target ?? {})) {
    add(errors, "target.digest does not match target fingerprints");
  }
}

function validateAuthors(record, owns, errors) {
  const authorsByStage = new Map();
  const authorsBySession = new Map();
  for (const author of record.authors ?? []) {
    rejectUnknown(author, new Set(["stage", "model", "reasoning", "session"]), `author ${author?.stage ?? "entry"}`, errors);
    const required = WORKER_CONFIG[author?.stage];
    if (!required) {
      add(errors, `authors: unsupported worker role ${author?.stage ?? "(missing)"}`);
      continue;
    }
    const validSession = typeof author.session === "string" && author.session.length > 0;
    if (!validSession) add(errors, `author ${author.stage}: session is required`);
    if (authorsByStage.has(author.stage)) add(errors, `authors: duplicate worker role ${author.stage}`);
    authorsByStage.set(author.stage, author);
    if (validSession) {
      const sessionAuthors = authorsBySession.get(author.session) ?? [];
      sessionAuthors.push(author);
      authorsBySession.set(author.session, sessionAuthors);
    }
    if (author.model !== required.model || author.reasoning !== required.reasoning) {
      add(errors, `${author.stage}: required model configuration is ${required.model} with ${required.reasoning} reasoning`);
    }
  }
  for (const role of requiredWorkerRoles({ owns: [...owns] })) {
    if (!authorsByStage.has(role)) add(errors, `authors: missing required worker role ${role}`);
  }
  for (const [session, sessionAuthors] of authorsBySession) {
    if (sessionAuthors.length < 2) continue;
    const stages = new Set(sessionAuthors.map((author) => author.stage));
    const allowed = SHARED_SESSION_GROUPS.some((group) => (
      stages.size === group.size && [...stages].every((stage) => group.has(stage))
    ));
    if (!allowed) add(errors, `authors: session ${session} may not span worker roles ${[...stages].join(", ")}`);
  }
  return { authorsByStage, authorsBySession };
}

function validateModeContract(record, repositoryRoot, errors) {
  const path = safeRepoFile(repositoryRoot, record.mode?.contractPath);
  if (!path) {
    add(errors, "mode.contractPath must name a current repository file");
    return;
  }
  const content = readFileSync(path, "utf8");
  const section = markdownSection(content, "Optional mode and state visibility");
  if (!section.trim()) {
    add(errors, "mode contract must include ## Optional mode and state visibility");
    return;
  }
  const declared = section.match(/^- Control mode:\s*`?(single|disclosure|basic-advanced)`?\s*$/mi)?.[1];
  if (!declared) add(errors, "mode contract must declare Control mode as single, disclosure, or basic-advanced");
  else if (declared !== record.mode.decision) add(errors, "mode decision does not match the interface contract");
  if (record.mode.decision === "basic-advanced") {
    for (const phrase of [
      "Shared engine and normalized input mapping:",
      "Basic assumptions and sources:",
      "Custom-value visibility in Basic:",
      "Switch retention and reset:",
      "Hidden invalid-value recovery:",
      "URL, reload, and history restoration:",
      "Equivalent-input parity evidence:",
    ]) {
      if (!section.includes(phrase)) add(errors, `basic-advanced mode contract is missing ${phrase}`);
    }
  }
}

function validateOwnership(record, repositoryRoot, errors) {
  const slug = record.route?.replace(/^\//, "");
  const manifestPath = safeRepoFile(repositoryRoot, `tests/pages/${slug}/page.json`);
  if (!manifestPath) {
    add(errors, "final acceptance requires the route ownership manifest");
    return;
  }
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.route !== record.route) add(errors, "ownership manifest route does not match acceptance route");
    const docs = Array.isArray(manifest.docs) ? manifest.docs : [];
    const docsDirectory = `content_docs/${slug}`;
    const ownsDocsDirectory = docs.includes(docsDirectory);
    const acceptancePath = `content_docs/${slug}/pipeline-acceptance.json`;
    if (!ownsDocsDirectory && !docs.includes(acceptancePath)) add(errors, `ownership manifest must list ${acceptancePath} or ${docsDirectory}`);
    if (!ownsDocsDirectory && !docs.includes(record.mode?.contractPath)) add(errors, "ownership manifest must list the mode contract");
    const evidencePaths = (record.evidence ?? []).map((item) => item.path).filter(Boolean);
    const evidenceDirectory = `content_docs/${slug}/pipeline-evidence`;
    if (evidencePaths.length && !ownsDocsDirectory && !docs.includes(evidenceDirectory) && !evidencePaths.every((path) => docs.includes(path))) {
      add(errors, "ownership manifest must list pipeline-evidence or every acceptance evidence file");
    }
  } catch (error) {
    add(errors, `ownership manifest is invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function validateEvidence(record, repositoryRoot, authorsBySession, errors) {
  const evidenceIds = uniqueIds(record.evidence, "evidence", errors);
  const evidence = new Map();
  for (const item of record.evidence ?? []) {
    rejectUnknown(
      item,
      new Set(["id", "kind", "author", "recordedAt", "targetDigest", "path", "sha256", "command", "exitCode", "backend", "viewport", "theme", "scenario"]),
      `evidence ${item?.id ?? "entry"}`,
      errors,
    );
    if (!EVIDENCE_KINDS.has(item.kind)) add(errors, `evidence ${item.id}: unsupported kind`);
    if (!authorsBySession.has(item.author)) add(errors, `evidence ${item.id}: unknown author session ${item.author}`);
    if (!ISO_DATE.test(item.recordedAt ?? "") || Number.isNaN(Date.parse(item.recordedAt))) {
      add(errors, `evidence ${item.id}: recordedAt must be an ISO UTC timestamp`);
    }
    if (item.targetDigest !== record.target?.digest) add(errors, `evidence ${item.id}: targetDigest is stale`);
    if (!item.path || !HEX_64.test(item.sha256 ?? "")) {
      add(errors, `evidence ${item.id}: path and sha256 are required`);
    } else {
      const result = verifyFile(repositoryRoot, item);
      if (!result.ok) add(errors, `evidence ${item.id} ${result.error}`);
    }
    if (item.kind === "command" && (!item.command || !Number.isInteger(item.exitCode))) {
      add(errors, `evidence ${item.id}: command evidence needs command and integer exitCode`);
    }
    if (item.kind === "browser") {
      if (!item.backend || !item.scenario || !["dark", "light"].includes(item.theme)) {
        add(errors, `evidence ${item.id}: browser evidence needs backend, scenario, and theme`);
      }
      if (!Number.isInteger(item.viewport?.width) || !Number.isInteger(item.viewport?.height)) {
        add(errors, `evidence ${item.id}: browser evidence needs integer viewport dimensions`);
      }
    }
    evidence.set(item.id, item);
  }
  return { evidence, evidenceIds };
}

function validateChecks(record, evidence, errors) {
  const checkIds = uniqueIds(record.checks, "checks", errors);
  const checks = new Map();
  for (const item of record.checks ?? []) {
    rejectUnknown(item, new Set(["id", "kind", "required", "status", "targetDigest", "evidenceIds", "reason"]), `check ${item?.id ?? "entry"}`, errors);
    if (!CHECKS.includes(item.kind)) add(errors, `check ${item.id}: unsupported kind`);
    if (typeof item.required !== "boolean") add(errors, `check ${item.id}: required must be boolean`);
    if (!["pending", "passed", "failed", "not-applicable"].includes(item.status)) {
      add(errors, `check ${item.id}: invalid status`);
    }
    if (item.targetDigest !== record.target?.digest) add(errors, `check ${item.id}: targetDigest is stale or missing`);
    if (!Array.isArray(item.evidenceIds)) add(errors, `check ${item.id}: evidenceIds must be an array`);
    for (const id of item.evidenceIds ?? []) {
      if (!evidence.has(id)) add(errors, `check ${item.id}: unknown evidence ${id}`);
    }
    if (item.status === "passed" && !item.evidenceIds?.length) add(errors, `check ${item.id}: passing check needs evidence`);
    if (["failed", "not-applicable"].includes(item.status) && !item.reason) {
      add(errors, `check ${item.id}: ${item.status} check needs a reason`);
    }
    checks.set(item.id, item);
  }

  for (const kind of requiredChecks(record.scope ?? { owns: [] })) {
    const passing = [...checks.values()].filter((check) => (
      check.kind === kind
      && check.required === true
      && check.status === "passed"
      && check.targetDigest === record.target?.digest
    ));
    if (!passing.length) add(errors, `required check missing or not passing: ${kind}`);
  }

  const review = [...checks.values()].find((check) => check.kind === "independent-review" && check.status === "passed");
  if (review) {
    const roles = new Set((review.evidenceIds ?? []).map((id) => {
      const item = evidence.get(id);
      return (record.authors ?? []).find((author) => author.session === item?.author)?.stage;
    }));
    if (!roles.has("audit")) {
      add(errors, "independent-review must include current evidence from the final Sol audit session");
    }
  }

  const rendered = [...checks.values()].find((check) => check.kind === "rendered" && check.status === "passed");
  if (rendered) {
    const browserEvidence = (rendered.evidenceIds ?? []).map((id) => evidence.get(id)).filter((item) => item?.kind === "browser");
    for (const theme of ["dark", "light"]) {
      if (!browserEvidence.some((item) => item.theme === theme && item.viewport.width >= 760)) {
        add(errors, `rendered check needs ${theme} desktop browser evidence`);
      }
      if (!browserEvidence.some((item) => item.theme === theme && item.viewport.width <= 390)) {
        add(errors, `rendered check needs ${theme} narrow browser evidence`);
      }
    }
  }
  return { checks, checkIds };
}

export function validateRecord(record, { repositoryRoot, dbSnapshot = null, final = true } = {}) {
  const errors = [];
  const warnings = [];
  const { owns } = structural(record, errors);
  validateTarget(record, repositoryRoot, errors);
  const { authorsByStage, authorsBySession } = validateAuthors(record, owns, errors);
  const { evidence, evidenceIds } = validateEvidence(record, repositoryRoot, authorsBySession, errors);
  const { checks, checkIds } = validateChecks(record, evidence, errors);
  if (final) validateOwnership(record, repositoryRoot, errors);

  const feasibilityStages = new Set();
  for (const item of record.feasibility ?? []) {
    rejectUnknown(item, new Set(["stage", "status", "reason", "evidenceIds", "options"]), `feasibility ${item?.stage ?? "entry"}`, errors);
    if (!owns.has(item.stage)) add(errors, `feasibility references unowned stage ${item.stage}`);
    if (feasibilityStages.has(item.stage)) add(errors, `feasibility: duplicate owned stage ${item.stage}`);
    feasibilityStages.add(item.stage);
    if (!["feasible", "blocked"].includes(item.status) || !item.reason || !Array.isArray(item.evidenceIds)) {
      add(errors, `feasibility ${item.stage}: invalid entry`);
    }
    for (const id of item.evidenceIds ?? []) {
      if (!evidenceIds.has(id)) add(errors, `feasibility ${item.stage}: unknown evidence ${id}`);
    }
    if (item.status === "blocked") {
      const options = item.options;
      if (!Array.isArray(options) || options.length < 2 || options.length > 4 || options.some((option) => typeof option !== "string" || !option.trim())) {
        add(errors, `feasibility ${item.stage}: blocked work needs two to four concrete decision options`);
      } else if (new Set(options.map((option) => option.trim())).size !== options.length) {
        add(errors, `feasibility ${item.stage}: blocked decision options must be distinct`);
      }
    } else if (Object.hasOwn(item, "options")) {
      add(errors, `feasibility ${item.stage}: feasible work must omit decision options`);
    }
    if (item.status === "blocked" && record.status === "accepted") {
      add(errors, `feasibility ${item.stage}: blocked work cannot be accepted`);
    }
  }
  for (const stage of owns) {
    if (!feasibilityStages.has(stage)) add(errors, `feasibility: missing owned stage ${stage}`);
  }

  rejectUnknown(record.mode, new Set(["decision", "rationale", "contractPath"]), "mode", errors);
  if (!object(record.mode) || !["single", "disclosure", "basic-advanced"].includes(record.mode?.decision) || !record.mode?.rationale) {
    add(errors, "mode decision and rationale are required");
  }
  validateModeContract(record, repositoryRoot, errors);

  uniqueIds(record.coverage, "coverage", errors);
  const requiredCoverageKinds = new Set();
  if (["interface", "engine", "usage"].some((stage) => owns.has(stage))) {
    requiredCoverageKinds.add("input");
    requiredCoverageKinds.add("output");
  }
  if (owns.has("usage")) requiredCoverageKinds.add("usage");
  if (owns.has("media")) requiredCoverageKinds.add("media");
  for (const item of record.coverage ?? []) {
    rejectUnknown(item, new Set(["id", "kind", "requirement", "disposition", "reason", "checkIds"]), `coverage ${item?.id ?? "entry"}`, errors);
    if (!["input", "output", "media", "usage", "requirement"].includes(item.kind)) {
      add(errors, `coverage ${item.id}: invalid kind`);
    }
    if (!["required", "omitted"].includes(item.disposition)) add(errors, `coverage ${item.id}: invalid disposition`);
    if (item.disposition === "required" && (!item.requirement || !item.checkIds?.length)) {
      add(errors, `coverage ${item.id}: required items need requirement and checks`);
    }
    if (item.disposition === "omitted" && !item.reason) add(errors, `coverage ${item.id}: omitted items need reason`);
    if (item.kind === "media" && item.requirement && ![...MEDIA].some((format) => item.requirement.toLowerCase().includes(format))) {
      add(errors, `coverage ${item.id}: unsupported media vocabulary`);
    }
    for (const id of item.checkIds ?? []) {
      if (!checkIds.has(id)) add(errors, `coverage ${item.id}: unknown check ${id}`);
    }
    if (item.disposition === "required" && !item.checkIds?.some((id) => checks.get(id)?.status === "passed")) {
      add(errors, `coverage ${item.id}: no current passing check`);
    }
    const allowedCheckKinds = {
      input: new Set(["technical", "interaction"]),
      output: new Set(["technical", "interaction"]),
      usage: new Set(["content", "interaction"]),
      media: new Set(["media", "rendered"]),
      requirement: new Set(CHECKS),
    }[item.kind];
    if (
      item.disposition === "required"
      && !item.checkIds?.some((id) => allowedCheckKinds?.has(checks.get(id)?.kind) && checks.get(id)?.status === "passed")
    ) {
      add(errors, `coverage ${item.id}: no passing ${item.kind} check of an applicable kind`);
    }
  }
  for (const kind of requiredCoverageKinds) {
    if (!(record.coverage ?? []).some((item) => item.kind === kind && item.disposition === "required")) {
      add(errors, `coverage: owned scope requires at least one required ${kind} item`);
    }
  }

  uniqueIds(record.findings, "findings", errors);
  for (const finding of record.findings ?? []) {
    rejectUnknown(finding, new Set(["id", "severity", "status", "description", "checkIds", "fix", "recheckEvidenceIds"]), `finding ${finding?.id ?? "entry"}`, errors);
    if (!["P0", "P1", "P2"].includes(finding.severity) || !["open", "fixed", "deferred"].includes(finding.status)) {
      add(errors, `finding ${finding.id}: invalid severity or status`);
    }
    if (!finding.description) add(errors, `finding ${finding.id}: description is required`);
    for (const id of finding.checkIds ?? []) {
      if (!checkIds.has(id)) add(errors, `finding ${finding.id}: unknown check ${id}`);
    }
    if (["open", "deferred"].includes(finding.status) && ["P0", "P1"].includes(finding.severity)) {
      add(errors, `finding ${finding.id}: P0/P1 must be closed`);
    }
    if (finding.status === "fixed") {
      if (!object(finding.fix) || !Array.isArray(finding.fix.paths) || !finding.fix.paths.length || !finding.fix.description) {
        add(errors, `finding ${finding.id}: fixed finding needs paths and a fix description`);
      }
      if (finding.fix?.targetDigest !== record.target?.digest) add(errors, `finding ${finding.id}: fix target is stale`);
      if (!finding.recheckEvidenceIds?.length) add(errors, `finding ${finding.id}: fixed finding needs current recheck evidence`);
      for (const id of finding.recheckEvidenceIds ?? []) {
        const item = evidence.get(id);
        const author = (record.authors ?? []).find((entry) => entry.session === item?.author);
        if (!item || author?.stage !== "audit") {
          add(errors, `finding ${finding.id}: recheck evidence must come from the final Sol audit session`);
        }
      }
    }
  }

  const required = requiredChecks(record.scope ?? { owns: [] });
  if (dbSnapshot) {
    const expected = record.target?.content;
    if (
      dbSnapshot.route !== record.route
      || dbSnapshot.revision !== expected?.revision
      || dbSnapshot.toolVersion !== expected?.toolVersion
      || JSON.stringify(dbSnapshot.fields) !== JSON.stringify(expected?.fields)
    ) {
      add(errors, "database snapshot does not match target.content");
    }
    if (owns.has("usage") && !dbSnapshot.nonempty?.usage_markdown) {
      add(errors, "owned usage scope requires nonempty live usage_markdown");
    }
  } else if (required.includes("database")) {
    warnings.push("current database freshness is unverified");
    if (final) add(errors, "database evidence requires a live snapshot adapter for final acceptance");
  }

  if (record.status === "accepted" && errors.length) {
    add(errors, "status accepted is not permitted while acceptance errors exist");
  }
  if (record.status !== "accepted" && final) add(errors, "final acceptance requires status accepted");

  const uniqueErrors = [...new Set(errors)];
  return {
    ok: uniqueErrors.length === 0,
    accepted: uniqueErrors.length === 0 && record.status === "accepted" && final,
    final,
    errors: uniqueErrors,
    warnings: [...new Set(warnings)],
    requiredChecks: required,
    requiredWorkerRoles: requiredWorkerRoles(record.scope ?? { owns: [] }),
    workerConfigurations: Object.fromEntries(
      [...authorsByStage.keys()].map((stage) => [stage, WORKER_CONFIG[stage]]),
    ),
  };
}

export function loadAcceptance(repositoryRoot, route) {
  const path = resolve(repositoryRoot, "content_docs", route.replace(/^\//, ""), "pipeline-acceptance.json");
  if (!existsSync(path)) throw new Error(`Missing acceptance record: ${path}`);
  return JSON.parse(readFileSync(path, "utf8"));
}

export function contentSnapshotFromRow(route, row) {
  return {
    route,
    revision: row.content_revision,
    toolVersion: row.tool_version,
    fields: {
      title: sha256Text(row.title ?? ""),
      intro_markdown: sha256Text(row.intro_markdown ?? ""),
      usage_markdown: sha256Text(row.usage_markdown ?? ""),
      content_markdown: sha256Text(row.content_markdown ?? ""),
    },
    nonempty: {
      title: Boolean(row.title?.trim()),
      intro_markdown: Boolean(row.intro_markdown?.trim()),
      usage_markdown: Boolean(row.usage_markdown?.trim()),
      content_markdown: Boolean(row.content_markdown?.trim()),
    },
  };
}

export async function loadContentSnapshot(record) {
  const environment = record.target?.content?.environment;
  const pool = new Pool({
    connectionString: resolveDatabaseUrl({ environment }),
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: 1,
    query_timeout: 60000,
  });
  const client = await pool.connect();
  try {
    await client.query("begin read only");
    const result = await client.query(
      `select tool.title, tool.intro_markdown, tool.usage_markdown, tool.content_markdown,
              tool.content_revision, tool.tool_version
         from public.stack127_pages page
         join public.stack127_tool_pages tool on tool.page_id = page.id
        where page.slug = $1 and page.page_family = 'tool'`,
      [record.route.replace(/^\//, "")],
    );
    await client.query("rollback");
    if (!result.rows[0]) throw new Error(`Tool page not found for live acceptance: ${record.route}`);
    return contentSnapshotFromRow(record.route, result.rows[0]);
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export { sha256Text, targetDigest };

if (!process.env.NODE_TEST_CONTEXT && process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const input = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  const final = !process.argv.includes("--integrity-only");
  if (!input) {
    console.error("Usage: node validate-acceptance.mjs <route-or-acceptance-file> [--integrity-only]");
    process.exitCode = 2;
  } else {
    try {
      const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
      const route = input.endsWith(".json")
        ? input.split("/content_docs/")[1]?.replace(/\/pipeline-acceptance\.json$/, "")
        : input.replace(/^\//, "");
      const record = input.endsWith(".json")
        ? JSON.parse(readFileSync(resolve(input), "utf8"))
        : loadAcceptance(root, `/${route}`);
      const needsDatabase = final && requiredChecks(record.scope ?? { owns: [] }).includes("database");
      const dbSnapshot = needsDatabase ? await loadContentSnapshot(record) : null;
      const result = validateRecord(record, { repositoryRoot: root, final, dbSnapshot });
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.ok && (final ? result.accepted : true) ? 0 : 1;
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
    }
  }
}
