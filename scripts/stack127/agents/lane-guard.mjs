#!/usr/bin/env node
// PreToolUse hook for Claude Code and Codex. Blocks a session from changing
// files owned by the other lane, and blocks Claude from pushing or deploying.
//
//   node scripts/stack127/agents/lane-guard.mjs claude   (Claude Code hook)
//   node scripts/stack127/agents/lane-guard.mjs codex    (Codex hook)
//
// Exit 2 blocks the tool call and shows the reason to the agent.
// Set STACK127_LANE_GUARD=off to turn it off for one session.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { laneNames, ownerOf } from "./lanes.mjs";
import { shellSegments, writeTargets } from "./shell.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const sessionLane = process.argv[2] === "codex" ? (process.env.STACK127_LANE === "luna" ? "luna" : "sol") : "opus";

function readPayload() {
  return JSON.parse(fs.readFileSync(0, "utf8"));
}

function relative(absolute) {
  const rel = path.relative(repoRoot, absolute);
  return rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel) ? null : rel.split(path.sep).join("/");
}

// Resolve existing parent symlinks even when the destination file is new.
function realTarget(absolute) {
  try { return fs.realpathSync(absolute); }
  catch {
    const parent = path.dirname(absolute);
    return parent === absolute ? absolute : path.join(realTarget(parent), path.basename(absolute));
  }
}

function collectStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

// Paths a shell command writes to: redirects, tee, sed -i, cp/mv/rm targets.
export function shellWriteTargets(command) {
  const collect = (segments) => segments.flatMap((segment) => [...writeTargets(segment), ...collect(segment.children)]);
  return collect(shellSegments(command));
}

function operands(args, valueOptions = []) {
  const out = [];
  for (let i = 0; i < args.length; i += 1) {
    if (valueOptions.includes(args[i])) i += 1;
    else if (!args[i].startsWith("-")) out.push(args[i]);
  }
  return out;
}

function blockedCommand(words, lane) {
  const [command, ...args] = words;
  const verb = command ? path.basename(command) : "";
  if (lane !== "sol") {
    if (verb === "git" && operands(args, ["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"])[0] === "push") return "Pushing is Sol's job";
    if ((verb === "docker" && operands(args, ["-H", "--host", "--context", "--config", "-c"])[0] === "push") || verb === "dokploy") return "Deploys are Sol's job";
    if (["npm", "pnpm", "yarn", "bun"].includes(verb)) {
      const bare = operands(args, ["--prefix", "--workspace", "-w", "--filter", "--dir", "-C"]);
      const script = ["run", "run-script"].includes(bare[0]) ? bare[1] : bare[0];
      if (/^stack127:deploy(?::(?!preflight(?:$|:))[^:]*)?$/.test(script ?? "")) return "Deploys are Sol's job";
    }
    if (["node", "bash", "sh"].includes(verb) && args.some((arg, index) => /(?:^|\/)scripts\/stack127\/deployment\/dokploy-release\.mjs$/.test(arg) && args[index + 1] === "release")) return "Deploys are Sol's job";
    if (verb === "gh" && args[0] === "workflow" && args[1] === "run" && args.some((arg) => /^(?:stack127-release-e2e(?:\.yml)?|Stack127 Release)$/.test(arg))) return "Deploys are Sol's job";
    if (verb === "supabase" && operands(args, ["--workdir", "--project-ref"])[0] === "functions" && operands(args, ["--workdir", "--project-ref"])[1] === "deploy") return "Deploys are Sol's job";
    if (verb === "supabase" && operands(args, ["--workdir", "--project-ref"])[0] === "db" && operands(args, ["--workdir", "--project-ref"])[1] === "push") return "Database migrations are Sol's job";
  }
  if (lane === "opus" && args.includes("--apply") && (["npm", "pnpm", "yarn", "bun"].includes(verb) || args.some((arg) => /(?:^|\/)scripts\//.test(arg)))) return "Applying database changes is Sol or Luna's job";
  return null;
}

function block(reason) {
  const next = process.env.STACK127_DELEGATED === "1" ? "Report this under 'Needs other lanes'; workers must not delegate." : `Delegate it: node scripts/stack127/agents/delegate.mjs ${sessionLane === "sol" ? "opus" : "sol"} "<task with context>"`;
  console.error(`stack127 lanes: ${reason}\n${next}\nSee "Agent roles" in AGENTS.md.`);
  process.exit(2);
}

export function check(payload, { lane = sessionLane, delegated = process.env.STACK127_DELEGATED === "1" } = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "Invalid hook payload.";
  const input = payload.tool_input ?? payload.toolInput ?? payload.input ?? {};
  const toolName = String(payload.tool_name ?? payload.toolName ?? "");
  if (delegated && /^(?:Agent|Task|spawn_agent)$/.test(toolName)) return "Delegated workers must not start other agents.";
  const blockedOwner = lane === "opus" ? "codex" : "opus";
  const cwd = path.resolve(repoRoot, input.cwd ?? input.workdir ?? payload.cwd ?? repoRoot);
  const paths = new Set();

  const readOnly = /^(?:Read|Glob|Grep|view_image)$/.test(toolName) || /(?:^|_)(?:read|list|search|get|fetch)(?:_|$)/i.test(toolName);
  if (!readOnly) for (const key of ["file_path", "path", "notebook_path"]) if (typeof input[key] === "string") paths.add(path.resolve(cwd, input[key]));
  for (const text of collectStrings(input)) {
    for (const match of text.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$|^\*\*\* Move to: (.+)$/gm)) paths.add(path.resolve(cwd, (match[1] ?? match[2]).trim()));
  }

  const rawCommand = input.command ?? input.cmd;
  const command = typeof rawCommand === "string" ? rawCommand : Array.isArray(rawCommand) ? rawCommand.map((word) => `'${String(word).replaceAll("'", "'\\''")}'`).join(" ") : "";
  if (command && !(toolName === "apply_patch" && command.trimStart().startsWith("*** Begin Patch"))) {
    const inspect = (segments, directory) => {
      let currentDirectory = directory;
      for (const segment of segments) {
        const reason = blockedCommand(segment.words, lane) ?? inspect(segment.children, currentDirectory);
        if (reason) return reason;
        for (const target of writeTargets(segment)) {
          paths.add(path.resolve(currentDirectory, target));
          if (/\$(?:PWD\b|\{PWD\})/.test(target)) paths.add(path.resolve(currentDirectory, target.replace(/\$(?:PWD\b|\{PWD\})/g, currentDirectory)));
        }
        if (segment.words[0] === "cd" && segment.words[1]) currentDirectory = path.resolve(currentDirectory, segment.words[1]);
      }
      return null;
    };
    const reason = inspect(shellSegments(command), cwd);
    if (reason) return `${reason}. This session is ${lane}.`;
  }

  for (const filePath of paths) {
    for (const target of new Set([filePath, realTarget(filePath)])) {
      const rel = relative(target);
      if (rel && ownerOf(rel) === blockedOwner) {
        return `${rel} belongs to ${laneNames[blockedOwner]}. This session is ${lane}${toolName ? ` (tool: ${toolName})` : ""}.`;
      }
    }
  }
  return null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.STACK127_LANE_GUARD === "off") process.exit(0);
  let reason;
  try { reason = check(readPayload()); }
  catch { reason = "Could not inspect the hook payload."; }
  if (reason) block(reason);
  process.exit(0);
}
