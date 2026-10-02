#!/usr/bin/env node
// PreToolUse hook for Claude Code and Codex. Blocks a session from changing
// files owned by the other lane, and requires coordinator approval for worker production work.
//
//   node scripts/stack127/agents/lane-guard.mjs claude   (Claude Code hook)
//   node scripts/stack127/agents/lane-guard.mjs codex    (Codex hook)
//
// Exit 2 blocks the tool call and shows the reason to the agent.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { laneNames, ownerOf } from "./lanes.mjs";
import { shellSegments, writeTargets } from "./shell.mjs";
import { readTaskException, taskSession } from "./task-exception.mjs";
import { readWorkerApproval } from "./worker-approval.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const sessionLane = ["opus", "sol", "luna"].includes(process.env.STACK127_LANE) ? process.env.STACK127_LANE : process.argv[2] === "codex" ? "sol" : "opus";

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

function scriptInvocation(words) {
  if (!['node', 'bash', 'sh'].includes(path.basename(words[0] ?? ''))) return null;
  const args = words.slice(1);
  for (let i = 0; i < args.length; i += 1) {
    if (path.basename(words[0]) === 'node' && args[i] === '--check') return null;
    if (['-e', '--eval', '-p', '--print', '-c', '-lc'].includes(args[i])) return null;
    if (['-r', '--require', '--import', '--loader', '--env-file', '--env-file-if-exists'].includes(args[i])) { i += 1; continue; }
    if (!args[i].startsWith('-')) return args[i];
  }
  return null;
}

function startsAgent(verb, args) {
  return ['claude', 'codex', 'grok', 'agy'].includes(verb) && !['models', 'help'].includes(args[0]) && !args.some(arg => ['--help', '-h', '--version', '-V'].includes(arg));
}

const developmentScripts = new Set(['update-content', 'update-catalogs', 'update-version', 'record-repo-sync'].map(name => `scripts/stack127/tool-pages/${name}.mjs`));
const developmentCommands = new Set(['content:update', 'catalogs:update', 'version:update', 'repo:sync'].map(name => `stack127:tool-page:${name}`));

function developmentApply(words, directory) {
  if (directory !== repoRoot) return false;
  const [command, ...args] = words;
  const verb = path.basename(command ?? '');
  let known = false;
  if (verb === 'node') {
    const script = scriptInvocation(words);
    known = script !== null && developmentScripts.has(relative(path.resolve(directory, script)));
  } else if (['npm', 'pnpm', 'yarn', 'bun'].includes(verb)) {
    if (args.some(arg => /^(?:--prefix|--workspace|-w|--filter|--dir|-C)(?:=|$)/.test(arg))) return false;
    const bare = operands(args);
    known = developmentCommands.has(['run', 'run-script'].includes(bare[0]) ? bare[1] : bare[0]);
  }
  if (!known || args.some(arg => /^(?:--confirm|--database-url)(?:=|$)/.test(arg))) return false;
  const environments = args.flatMap((arg, index) => arg === '--environment' ? [args[index + 1]] : arg.startsWith('--environment=') ? [arg.slice(14)] : []);
  return environments.length <= 1 && environments.every(value => value === 'development');
}

function currentRevision(directory, ref = 'HEAD') {
  const run = spawnSync('git', ['rev-parse', ref], { cwd: directory, encoding: 'utf8', timeout: 5000 });
  return run.status === 0 ? run.stdout.trim() : null;
}

function blockedCommand(words, delegated, { approval, directory = repoRoot, revision = currentRevision } = {}) {
  if (!delegated) return null;
  const [command, ...args] = words;
  const verb = command ? path.basename(command) : "";
  const releaseApproved = Boolean(approval?.releaseSha && revision(directory) === approval.releaseSha);
  const productionApproved = Boolean(approval?.productionData);
  const scriptPath = scriptInvocation(words);
  if (scriptPath && /(?:^|\/)scripts\/stack127\/agents\/delegate\.mjs$/.test(scriptPath)) return 'Delegated workers must not delegate again';
  if (startsAgent(verb, args)) return 'Delegated workers must not start other CLI agents';
  if (scriptPath && /(?:^|\/)scripts\/stack127\/agents\/(?:task-exception|worker-approval)\.mjs$/.test(scriptPath) && args.some(arg => ["create", "extend", "renew", "remove"].includes(arg))) return "Only the coordinator may change task exceptions or worker approvals";
  if (args.includes('--apply') && developmentApply(words, directory)) return null;
  if (verb === 'git' && operands(args, ['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--config-env'])[0] === 'push' && releaseApproved) {
    const allowed = (args.join(' ') === 'push origin main' && revision(directory, 'refs/heads/main') === approval.releaseSha) || args.join(' ') === 'push origin HEAD:main' || args.join(' ') === `push origin ${approval.releaseSha}:main`;
    return allowed ? null : 'Worker release approval permits only the reviewed commit pushed to origin/main';
  }
  if (releaseApproved && ((verb === 'docker' && operands(args, ['-H', '--host', '--context', '--config', '-c'])[0] === 'push') || verb === 'dokploy')) return null;
  if (verb === "git" && operands(args, ["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"])[0] === "push") return "Only the coordinator may push";
  if ((verb === "docker" && operands(args, ["-H", "--host", "--context", "--config", "-c"])[0] === "push") || verb === "dokploy") return "Only the coordinator may deploy";
  if (["npm", "pnpm", "yarn", "bun"].includes(verb)) {
    const bare = operands(args, ["--prefix", "--workspace", "-w", "--filter", "--dir", "-C"]);
    const script = ["run", "run-script"].includes(bare[0]) ? bare[1] : bare[0];
    if (/^stack127:deploy(?::(?!preflight(?:$|:))[^:]*)?$/.test(script ?? "")) return releaseApproved ? null : "Only the coordinator may deploy, or approve this worker for the reviewed commit";
  }
  if (scriptPath && /(?:^|\/)scripts\/stack127\/deployment\/dokploy-release\.mjs$/.test(scriptPath) && args.includes("release")) return releaseApproved ? null : "Only the coordinator may deploy";
  if (verb === "gh" && args[0] === "workflow" && args[1] === "run" && args.some((arg) => /^(?:stack127-release-e2e(?:\.yml)?|Stack127 Release)$/.test(arg))) return releaseApproved && args.includes(`commit_sha=${approval.releaseSha}`) ? null : "Only the coordinator may deploy, or approve this worker for the exact workflow commit";
  if (verb === "supabase" && operands(args, ["--workdir", "--project-ref"])[0] === "functions" && operands(args, ["--workdir", "--project-ref"])[1] === "deploy") return releaseApproved ? null : "Only the coordinator may deploy";
  if (verb === "supabase" && operands(args, ["--workdir", "--project-ref"])[0] === "db" && operands(args, ["--workdir", "--project-ref"])[1] === "push") return productionApproved ? null : "Only the coordinator may apply database migrations";
  if (args.includes("--apply") && (["npm", "pnpm", "yarn", "bun"].includes(verb) || scriptPath?.includes('scripts/'))) return productionApproved ? null : "Only the coordinator may apply data changes, or approve this worker for production data";
  return null;
}

function block(reason) {
  const next = process.env.STACK127_DELEGATED === "1" ? "Report this back to the coordinator under 'Needs other lanes'; workers must not delegate." : /user prohibited delegation/i.test(reason) ? "Follow the user's instruction and finish this task in the coordinator session." : `Delegate it: node scripts/stack127/agents/delegate.mjs ${sessionLane === "sol" ? "opus" : "sol"} "<task with context>"`;
  console.error(`stack127 lanes: ${reason}\n${next}\nSee "Agent roles" in AGENTS.md.`);
  process.exit(2);
}

export function check(payload, { lane = sessionLane, delegated = process.env.STACK127_DELEGATED === "1", exceptionRoot = repoRoot, now = Date.now(), workerEnv = process.env, revision = currentRevision } = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "Invalid hook payload.";
  const input = payload.tool_input ?? payload.toolInput ?? payload.input ?? {};
  const toolName = String(payload.tool_name ?? payload.toolName ?? "");
  if (delegated && /^(?:Agent|Task|spawn_agent|spawn_subagent)$/.test(toolName)) return "Delegated workers must not start other agents.";
  let exception;
  try { exception = delegated ? null : readTaskException({ root: exceptionRoot, session: taskSession(payload), now }); }
  catch { exception = null; } // Invalid or expired exceptions grant no extra access; cleanup remains possible.
  if (exception && /^(?:Agent|Task|spawn_agent|spawn_subagent)$/.test(toolName)) return exception.delegation.mode === "none" ? "The user prohibited delegation for this task." : "Use delegate.mjs so the user's permitted tools and models are enforced.";
  const blockedOwner = lane === "opus" ? "codex" : "opus";
  const cwd = path.resolve(repoRoot, input.cwd ?? input.workdir ?? payload.cwd ?? repoRoot);
  const paths = new Set();
  const approval = delegated ? readWorkerApproval({ root: repoRoot, env: workerEnv, now }) : null;

  const mutating = /(?:^|_)(?:replace|write|edit|remove|delete|update|patch|move|copy)(?:_|$)/i.test(toolName);
  const readOnly = !mutating && (/^(?:Read|Glob|Grep|view_image)$/.test(toolName) || /(?:^|_)(?:read|list|search|get|fetch)(?:_|$)/i.test(toolName));
  if (!readOnly) for (const key of ["file_path", "target_file", "path", "notebook_path"]) if (typeof input[key] === "string") paths.add(path.resolve(cwd, input[key]));
  if (!readOnly) for (const text of collectStrings(input)) {
    for (const match of text.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$|^\*\*\* Move to: (.+)$/gm)) paths.add(path.resolve(cwd, (match[1] ?? match[2]).trim()));
  }

  const rawCommand = input.command ?? input.cmd;
  const command = typeof rawCommand === "string" ? rawCommand : Array.isArray(rawCommand) ? rawCommand.map((word) => `'${String(word).replaceAll("'", "'\\''")}'`).join(" ") : "";
  if (command && !(toolName === "apply_patch" && command.trimStart().startsWith("*** Begin Patch"))) {
    const inspect = (segments, directory) => {
      let currentDirectory = directory;
      for (const segment of segments) {
        if (exception) {
          const [executable, ...args] = segment.words;
          const verb = path.basename(executable ?? "");
          const directWorker = startsAgent(verb, args);
          const script = scriptInvocation(segment.words);
          const delegate = script && /(?:^|\/)scripts\/stack127\/agents\/delegate\.mjs$/.test(script);
          if (directWorker || (delegate && exception.delegation.mode === "none")) return exception.delegation.mode === "none" ? "The user prohibited delegation for this task." : "Use delegate.mjs so the user's permitted tools and models are enforced.";
        }
        const reason = blockedCommand(segment.words, delegated, { approval, directory: currentDirectory, revision }) ?? inspect(segment.children, currentDirectory);
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
      if (delegated && (target === path.resolve(workerEnv.STACK127_WORKER_APPROVAL ?? '/nonexistent-worker-approval') || path.basename(target) === 'worker-approval.json')) return "Only the coordinator may change worker approvals.";
      if (delegated && rel?.startsWith("tmp/agent-task-exceptions/")) return "Only the coordinator may change task exceptions.";
      if (rel && ownerOf(rel) === blockedOwner && !exception?.files.includes(rel)) {
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
