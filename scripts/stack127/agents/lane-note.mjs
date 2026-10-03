#!/usr/bin/env node
// Hook for Claude Code and Codex. When a session edits a file another lane
// usually owns, it adds a short note for the agent. It never blocks.
//
//   node scripts/stack127/agents/lane-note.mjs claude   (Claude Code hook)
//   node scripts/stack127/agents/lane-note.mjs codex    (Codex hook)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { laneNames, ownerOf } from "./lanes.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

// Paths a file-editing tool call touches, relative to the repo.
export function editedFiles(payload) {
  const toolName = String(payload?.tool_name ?? payload?.toolName ?? "");
  if (/^(?:Read|Glob|Grep|LS|view_image)$/.test(toolName)) return [];
  const input = payload?.tool_input ?? payload?.toolInput ?? {};
  const cwd = path.resolve(repoRoot, payload?.cwd ?? repoRoot);
  const files = new Set();
  for (const key of ["file_path", "notebook_path", "target_file", "path"]) {
    if (typeof input[key] === "string") files.add(path.resolve(cwd, input[key]));
  }
  // Codex apply_patch carries file names inside the patch text.
  for (const text of [input.command, input.patch, input.input]) {
    if (typeof text !== "string") continue;
    for (const match of text.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$|^\*\*\* Move to: (.+)$/gm)) {
      files.add(path.resolve(cwd, (match[1] ?? match[2]).trim()));
    }
  }
  return [...files]
    .map((file) => path.relative(repoRoot, file))
    .filter((rel) => rel && !rel.startsWith("..") && !path.isAbsolute(rel))
    .map((rel) => rel.split(path.sep).join("/"));
}

export function laneNote(payload, tool = "claude") {
  const other = tool === "codex" ? "opus" : "codex";
  const files = editedFiles(payload).filter((file) => ownerOf(file) === other);
  if (!files.length) return null;
  return `Lane note: ${files.join(", ")} is usually ${laneNames[other]} work. That's fine if it's part of your task. If not, consider handing it to that lane. See "Agent roles" in AGENTS.md.`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const payload = JSON.parse(fs.readFileSync(0, "utf8"));
    const note = laneNote(payload, process.argv[2]);
    if (note) {
      console.log(JSON.stringify({
        systemMessage: note,
        hookSpecificOutput: { hookEventName: payload.hook_event_name ?? "PreToolUse", additionalContext: note },
      }));
    }
  } catch {
    // A note is optional. Never block a tool call over it.
  }
  process.exit(0);
}
