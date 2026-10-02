#!/usr/bin/env node
// Explicit user instructions can change routing for one session and task.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const agentTools = ["claude", "codex", "grok", "agy"];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const maxDuration = 24 * 60 * 60 * 1000;

export function taskSession(payload = {}, env = process.env) {
  return payload.session_id ?? payload.sessionId ?? payload.thread_id ?? payload.threadId ?? env.CODEX_THREAD_ID ?? env.CLAUDE_SESSION_ID ?? null;
}

function exceptionPath(root, session) {
  if (typeof session !== "string" || !/^[a-zA-Z0-9_-]{1,160}$/.test(session)) throw new Error("A valid current session ID is required.");
  return path.join(root, "tmp/agent-task-exceptions", `${session}.json`);
}

export function validateTaskException(value, { root = repoRoot, session, now = Date.now() } = {}) {
  if (!value || value.version !== 1 || value.session !== session || value.root !== fs.realpathSync(root)) throw new Error("Task exception does not match this checkout and session.");
  if (typeof value.task !== "string" || !value.task.trim() || typeof value.userInstruction !== "string" || !value.userInstruction.trim()) throw new Error("Name the task and quote the user's explicit routing instruction.");
  const created = Date.parse(value.createdAt);
  const expires = Date.parse(value.expiresAt);
  if (!Number.isFinite(created) || !Number.isFinite(expires) || created > now || expires <= now || expires <= created || expires - created > maxDuration) throw new Error("Task exception has expired or has invalid dates. Renew it only while the authorized task is unfinished.");
  if (!Array.isArray(value.files) || value.files.some(file => typeof file !== "string" || !file || path.isAbsolute(file) || file.startsWith("../") || file === ".." || file !== path.posix.normalize(file) || /[\\*?]/.test(file))) throw new Error("Task exception files must be exact checkout-relative paths, without wildcards or parent traversal.");
  const routing = value.delegation;
  if (!routing || !["none", "restricted"].includes(routing.mode) || !Array.isArray(routing.tools) || new Set(routing.tools).size !== routing.tools.length || routing.tools.some(tool => !agentTools.includes(tool)) || (routing.mode === "none" ? routing.tools.length !== 0 : routing.tools.length === 0)) throw new Error("Choose no delegation, or list the tools the user permits in attempt order.");
  if (!routing.models || typeof routing.models !== "object" || Array.isArray(routing.models) || Object.entries(routing.models).some(([tool, model]) => !routing.tools.includes(tool) || typeof model !== "string" || !model.trim() || model.startsWith("-") || /\s/.test(model))) throw new Error("Named models must belong to a permitted tool.");
  return value;
}

export function readTaskException({ root = repoRoot, session = taskSession(), now = Date.now() } = {}) {
  if (!session) return null;
  const file = exceptionPath(root, session);
  let value;
  try { value = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return null; throw new Error(`Cannot read task exception: ${error.message}`); }
  return validateTaskException(value, { root, session, now });
}

export function createTaskException({ root = repoRoot, session = taskSession(), task, userInstruction, files = [], tools = [], models = {}, now = Date.now() }, env = process.env) {
  if (env.STACK127_DELEGATED === "1") throw new Error("Only the coordinator may create a task exception.");
  const actual = taskSession({}, env);
  if (actual && actual !== session) throw new Error("Cannot create an exception for another session.");
  const file = exceptionPath(root, session);
  const value = validateTaskException({ version: 1, root: fs.realpathSync(root), session, task, userInstruction, files: [...new Set(files)], createdAt: new Date(now).toISOString(), expiresAt: new Date(now + maxDuration).toISOString(), delegation: { mode: tools.length ? "restricted" : "none", tools, models } }, { root, session, now });
  if (fs.existsSync(file)) {
    const current = readTaskException({ root, session, now });
    if (current.task !== task || current.userInstruction !== userInstruction || JSON.stringify(current.delegation) !== JSON.stringify(value.delegation)) throw new Error("This session already has another unfinished task or routing instruction. Finish or cancel it before creating another exception.");
    return extendTaskException({ root, session, files, now }, env);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  // Do not overwrite another unfinished task in this session.
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  return value;
}

export function removeTaskException({ root = repoRoot, session = taskSession() } = {}, env = process.env) {
  if (env.STACK127_DELEGATED === "1") throw new Error("Only the coordinator may remove a task exception.");
  const actual = taskSession({}, env);
  if (actual && actual !== session) throw new Error("Cannot remove an exception for another session.");
  fs.rmSync(exceptionPath(root, session), { force: true });
}

export function extendTaskException({ root = repoRoot, session = taskSession(), files = [], now = Date.now() } = {}, env = process.env) {
  if (env.STACK127_DELEGATED === "1") throw new Error("Only the coordinator may extend a task exception.");
  const actual = taskSession({}, env);
  if (actual && actual !== session) throw new Error("Cannot extend an exception for another session.");
  const current = readTaskException({ root, session, now });
  if (!current) throw new Error("Create an explicit-user task exception before extending its file list.");
  const value = validateTaskException({ ...current, files: [...new Set([...current.files, ...files])] }, { root, session, now });
  fs.writeFileSync(exceptionPath(root, session), `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  return value;
}

export function renewTaskException({ root = repoRoot, session = taskSession(), now = Date.now() } = {}, env = process.env) {
  if (env.STACK127_DELEGATED === "1") throw new Error("Only the coordinator may renew a task exception.");
  const actual = taskSession({}, env);
  if (actual && actual !== session) throw new Error("Cannot renew an exception for another session.");
  const file = exceptionPath(root, session);
  const previous = JSON.parse(fs.readFileSync(file, "utf8"));
  // Check the original scope even when its access window has ended.
  validateTaskException(previous, { root, session, now: Date.parse(previous.createdAt) });
  if (Date.parse(previous.createdAt) > now) throw new Error("Cannot renew an exception created in the future.");
  const value = validateTaskException({ ...previous, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + maxDuration).toISOString() }, { root, session, now });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  return value;
}

export function delegationRoute(exception, { tool, model, previous, resume = false } = {}) {
  if (!exception) {
    if (tool || model) throw new Error("Custom tools and models require an explicit-user task exception.");
    return { toolChain: undefined, model: undefined };
  }
  const routing = exception.delegation;
  if (routing.mode === "none") throw new Error("The user prohibited delegation for this task. Complete it in the coordinator session.");
  if (tool && !routing.tools.includes(tool)) throw new Error(`The user did not permit ${tool} for this task.`);
  if (resume && (!routing.tools.includes(previous) || (tool && tool !== previous))) throw new Error("The resumed worker does not match the user's permitted tools.");
  const selected = tool ?? (resume ? previous : routing.tools[0]);
  if (model && routing.models[selected] !== model) throw new Error("The requested model does not match the user's task exception.");
  const toolChain = routing.tools.slice(routing.tools.indexOf(selected));
  return { toolChain, model: routing.models[selected] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const command = args.shift();
    const options = { files: [], tools: [], models: {} };
    let noDelegate = false;
    while (args.length) {
      const flag = args.shift();
      if (flag === "--no-delegate") { noDelegate = true; continue; }
      const value = args.shift();
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${flag}.`);
      if (flag === "--file") options.files.push(value);
      else if (flag === "--tool") options.tools.push(value);
      else if (flag === "--model") {
        const separator = value.indexOf("=");
        if (separator < 1) throw new Error("Use --model tool=model-id.");
        options.models[value.slice(0, separator)] = value.slice(separator + 1);
      } else {
        const key = { "--session": "session", "--task": "task", "--user-instruction": "userInstruction" }[flag];
        if (!key) throw new Error(`Unknown option: ${flag}`);
        options[key] = value;
      }
    }
    options.session ??= taskSession();
    if (command === "create") {
      if (noDelegate === Boolean(options.tools.length)) throw new Error("Choose --no-delegate or one or more --tool values.");
      const value = createTaskException(options);
      console.log(`Task exception created for ${value.session}. Expires ${value.expiresAt}. Remove it when '${value.task}' ends.`);
    } else if (command === "extend") {
      const value = extendTaskException(options);
      console.log(`Task exception now includes ${value.files.length} files. Task, routing, and expiry are unchanged.`);
    } else if (command === "renew") {
      const value = renewTaskException(options);
      console.log(`Task exception renewed for the same task and routing. Expires ${value.expiresAt}.`);
    } else if (command === "remove") {
      removeTaskException(options);
      console.log("Task exception removed. Default lane rules apply.");
    } else if (command === "status") {
      console.log(JSON.stringify(readTaskException(options), null, 2));
    } else throw new Error("Usage: task-exception.mjs create|status|extend|renew|remove [--session id] [--task name --user-instruction quote --file path ... --no-delegate | --tool tool ... --model tool=model-id]");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
