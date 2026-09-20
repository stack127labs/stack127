#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_SECTIONS = [
  "User task",
  "Information decisions",
  "Input contract",
  "Result contract",
  "Visual semantics",
  "State contract",
  "Component contract",
  "Responsive contract",
  "Interface wireframes",
  "Removed or rejected",
  "Acceptance criteria",
  "Open questions and blockers",
];

function preamble(content) {
  const index = content.search(/^##\s/m);
  return index === -1 ? content : content.slice(0, index);
}

function readHeader(content, label) {
  const matcher = new RegExp(`^${label}:\\s*(.+?)\\s*$`, "gmi");
  const matches = [...preamble(content).matchAll(matcher)];
  if (matches.length !== 1) return null;
  return matches[0][1].replace(/^`|`$/g, "").trim();
}

function sectionBody(content, title) {
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith("```")) inFence = !inFence;
    else if (!inFence && lines[index].trim() === `## ${title}`) {
      start = index;
      break;
    }
  }
  if (start === -1) return null;
  let end = lines.length;
  inFence = false;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith("```")) inFence = !inFence;
    else if (!inFence && lines[index].startsWith("## ")) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

function markdownRows(content = "") {
  const rows = content
    .split(/\r?\n/)
    .filter((line) => /^\s*\|.*\|\s*$/.test(line))
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)));
  return rows.slice(1);
}

function normalizedQuestion(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function validateInterfaceContractText(content) {
  const errors = [];
  if (/\[TODO\]|\[\[[^\]\n]{1,200}\]\]/.test(content)) errors.push("interface-contract.md: contains an unfilled template placeholder");

  const status = readHeader(content, "Status");
  const tool = readHeader(content, "Tool");
  const route = readHeader(content, "Route");
  const mode = readHeader(content, "Mode")?.toLowerCase();
  if (status !== "ready") errors.push("interface-contract.md: Status must be ready");
  if (!tool) errors.push("interface-contract.md: expected exactly one Tool header");
  if (!route?.startsWith("/")) errors.push("interface-contract.md: Route must be absolute");
  if (!new Set(["pipeline", "retrofit"]).has(mode)) errors.push("interface-contract.md: Mode must be pipeline or retrofit");

  for (const title of REQUIRED_SECTIONS) {
    const body = sectionBody(content, title);
    if (body === null) errors.push(`interface-contract.md: missing heading ## ${title}`);
    else if (body.replace(/\s+/g, " ").length < 30) errors.push(`interface-contract.md: section ## ${title} is not substantive`);
  }

  const userTask = sectionBody(content, "User task") ?? "";
  for (const label of ["Primary user:", "Question:", "Lead answer:", "Next decision:"]) {
    if (!userTask.includes(label)) errors.push(`interface-contract.md: user task missing ${label}`);
  }

  const informationRows = markdownRows(sectionBody(content, "Information decisions"));
  if (informationRows.length < 3) errors.push("interface-contract.md: information decisions need at least three concrete rows");
  const dispositions = new Set(["input", "lead", "supporting", "evidence", "omit"]);
  for (const row of informationRows) {
    if (row.length < 6 || row.some((cell) => !cell)) errors.push("interface-contract.md: every information decision needs six filled cells");
    if (!dispositions.has((row[3] ?? "").toLowerCase())) errors.push(`interface-contract.md: invalid information disposition "${row[3] ?? ""}"`);
  }
  if (informationRows.filter((row) => (row[3] ?? "").toLowerCase() === "lead").length !== 1) {
    errors.push("interface-contract.md: information decisions need exactly one lead");
  }

  const inputRows = markdownRows(sectionBody(content, "Input contract"));
  if (inputRows.length < 2) errors.push("interface-contract.md: input contract needs the primary input and action");
  if (inputRows.some((row) => row.length < 9 || row.some((cell) => !cell))) errors.push("interface-contract.md: every input row needs nine filled cells");
  if (inputRows.filter((row) => /\bprimary action\b/i.test(row[2] ?? "")).length !== 1) {
    errors.push("interface-contract.md: input contract needs exactly one primary action");
  }
  for (const row of inputRows) {
    const requirement = (row[2] ?? "").toLowerCase();
    const affectsLead = (row[3] ?? "").toLowerCase();
    const placement = (row[5] ?? "").toLowerCase();
    if (!/^(yes|no|not applicable)\b/.test(affectsLead)) {
      errors.push(`interface-contract.md: ${row[1] ?? "input"} must say whether it affects the lead answer`);
    }
    if (!/^(visible|disclosure|conditional|omitted|result)\b/.test(placement)) {
      errors.push(`interface-contract.md: ${row[1] ?? "input"} needs an explicit placement`);
    }
    if (/^yes\b/.test(affectsLead) && /\b(?:required|default)/.test(requirement) && /^disclosure\b/.test(placement)) {
      errors.push(`interface-contract.md: result-driving required or defaulted input "${row[1] ?? "input"}" must stay visible`);
    }
  }

  const resultRows = markdownRows(sectionBody(content, "Result contract"));
  if (resultRows.length < 1) errors.push("interface-contract.md: result contract needs at least one region");
  if (resultRows.some((row) => row.length < 6 || row.some((cell) => !cell))) errors.push("interface-contract.md: every result row needs six filled cells");
  const resultQuestions = resultRows.map((row) => normalizedQuestion(row[2])).filter(Boolean);
  if (new Set(resultQuestions).size !== resultQuestions.length) errors.push("interface-contract.md: result regions repeat the same user question");

  const tableMinimums = [
    ["Visual semantics", 1, 4],
    ["State contract", 4, 6],
    ["Component contract", 2, 6],
    ["Responsive contract", 3, 4],
  ];
  for (const [title, minimum, cells] of tableMinimums) {
    const rows = markdownRows(sectionBody(content, title));
    if (rows.length < minimum) errors.push(`interface-contract.md: ${title.toLowerCase()} needs at least ${minimum} concrete rows`);
    if (rows.some((row) => row.length < cells || row.some((cell) => !cell))) errors.push(`interface-contract.md: every ${title.toLowerCase()} row needs ${cells} filled cells`);
  }

  const visualRows = markdownRows(sectionBody(content, "Visual semantics"));
  for (const row of visualRows) {
    if (!/^(yes|no|not applicable)\b/i.test(row[2] ?? "")) errors.push("interface-contract.md: each visual truth test must start with yes, no, or not applicable");
    if (/^no\b/i.test(row[2] ?? "") && /\b(?:use|keep)\b/i.test(row[3] ?? "") && !/\b(?:replace|omit|reject|do not use)\b/i.test(row[3] ?? "")) {
      errors.push(`interface-contract.md: ${row[0] ?? "visual"} cannot be used when its geometry fails the truth test`);
    }
  }

  const componentContract = sectionBody(content, "Component contract") ?? "";
  if (!/^- Generic or native-looking fallback allowed:\s*no\s*$/mi.test(componentContract)) {
    errors.push("interface-contract.md: component contract must reject generic or native-looking fallback");
  }
  const componentDispositions = new Set(["reuse shared", "new shared", "route-specific"]);
  for (const row of markdownRows(componentContract)) {
    if (!componentDispositions.has((row[2] ?? "").toLowerCase())) {
      errors.push(`interface-contract.md: invalid component disposition "${row[2] ?? ""}"`);
    }
  }

  const optionalMode = sectionBody(content, "Optional mode and state visibility");
  if (optionalMode !== null) {
    const controlMode = optionalMode.match(/^- Control mode:\s*`?(single|disclosure|basic-advanced)`?\s*$/mi)?.[1];
    if (!controlMode) errors.push("interface-contract.md: optional mode section must declare Control mode as single, disclosure, or basic-advanced");
    if (controlMode === "basic-advanced") {
      for (const phrase of [
        "Shared engine and normalized input mapping:",
        "Basic assumptions and sources:",
        "Custom-value visibility in Basic:",
        "Switch retention and reset:",
        "Hidden invalid-value recovery:",
        "URL, reload, and history restoration:",
        "Equivalent-input parity evidence:",
      ]) {
        if (!optionalMode.includes(phrase)) errors.push(`interface-contract.md: basic-advanced mode is missing ${phrase}`);
      }
    }
  }

  const wireframes = sectionBody(content, "Interface wireframes") ?? "";
  if ([...wireframes.matchAll(/```text/g)].length < 2) errors.push("interface-contract.md: interface wireframes need desktop and narrow mobile text diagrams");

  const removed = sectionBody(content, "Removed or rejected") ?? "";
  if (!/^\s*-\s+\S.{18,}$/m.test(removed)) errors.push("interface-contract.md: removed or rejected needs a concrete removal decision");

  const acceptanceRows = markdownRows(sectionBody(content, "Acceptance criteria"));
  const acceptanceIds = acceptanceRows.map((row) => row[0]).filter((value) => /^UI-\d{3}$/.test(value ?? ""));
  if (acceptanceIds.length < 4) errors.push("interface-contract.md: acceptance criteria need at least four UI- IDs");
  if (new Set(acceptanceIds).size !== acceptanceIds.length) errors.push("interface-contract.md: duplicate UI acceptance ID");
  if (acceptanceRows.some((row) => row.length < 4 || row.some((cell) => !cell))) errors.push("interface-contract.md: every acceptance row needs four filled cells");
  const acceptanceCategories = new Set(acceptanceRows.map((row) => (row[1] ?? "").toLowerCase()));
  for (const category of ["lead", "deduplication", "visual-truth", "component-consistency", "responsive", "url"]) {
    if (!acceptanceCategories.has(category)) errors.push(`interface-contract.md: acceptance criteria need category ${category}`);
  }

  return { errors, headers: { status, tool, route, mode } };
}

export function validateInterfaceContractDirectory(directory) {
  const docsDirectory = resolve(directory);
  const contractPath = resolve(docsDirectory, "interface-contract.md");
  if (!existsSync(contractPath) || !statSync(contractPath).isFile()) {
    return { ok: false, errors: ["interface-contract.md: missing required file"] };
  }
  const content = readFileSync(contractPath, "utf8");
  const result = validateInterfaceContractText(content);
  const errors = [...result.errors];
  const fingerprints = new Map(
    [...preamble(content).matchAll(/^Input fingerprint:\s*`([^\s`]+) sha256:([a-f0-9]{64})`\s*$/gmi)]
      .map((match) => [match[1], match[2]]),
  );
  const requiredUpstream = ["brief.md", ...(result.headers.mode === "pipeline" ? ["implementation-report.md"] : [])];
  for (const fileName of requiredUpstream) {
    const filePath = resolve(docsDirectory, fileName);
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      errors.push(`interface-contract.md: missing upstream ${fileName}`);
      continue;
    }
    if (fingerprints.get(fileName) !== sha256(readFileSync(filePath, "utf8"))) {
      errors.push(`interface-contract.md: stale or missing fingerprint for ${fileName}`);
    }
  }
  if (result.headers.route && `/${basename(docsDirectory)}` !== result.headers.route) {
    errors.push(`interface-contract.md: route ${result.headers.route} does not match docs directory /${basename(docsDirectory)}`);
  }
  return { ok: errors.length === 0, errors, headers: result.headers };
}

const directExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (directExecution) {
  const directory = process.argv[2];
  if (!directory) {
    console.error("Usage: node validate-interface-contract.mjs <content-docs-tool-directory>");
    process.exitCode = 2;
  } else {
    const result = validateInterfaceContractDirectory(directory);
    if (result.ok) console.log(`Interface contract ready: ${result.headers.route}`);
    else result.errors.forEach((error) => console.error(`FAIL ${error}`));
    process.exitCode = result.ok ? 0 : 1;
  }
}
