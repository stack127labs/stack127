import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ownerOf } from "./lanes.mjs";

export const toolNames = { claude: "Claude Code", codex: "Codex", grok: "Grok", agy: "Gemini in Antigravity" };

export function workerExecutable(tool) {
  const local = tool === "grok" ? path.join(os.homedir(), ".grok/bin/grok") : tool === "agy" ? path.join(os.homedir(), ".local/bin/agy") : null;
  return local && fs.existsSync(local) ? local : tool;
}

export function grokDenyRules(lane, files, approval = null) {
  const otherOwner = lane === "opus" ? "codex" : "opus";
  const rules = [...new Set(files)].filter((file) => ownerOf(file) === otherOwner).flatMap((file) => {
    const literal = file.replace(/[[?*]/g, (character) => `[${character}]`);
    return [`Edit(${literal})`, `Write(${literal})`];
  });
  const denied = ['node *scripts/stack127/agents/delegate.mjs *', 'node *scripts/stack127/agents/task-exception.mjs create*', 'node *scripts/stack127/agents/task-exception.mjs extend*', 'node *scripts/stack127/agents/task-exception.mjs renew*', 'node *scripts/stack127/agents/task-exception.mjs remove*', 'claude *', 'codex exec*', 'grok *', 'agy *'];
  if (!approval?.releaseSha) denied.push('git *push*', 'docker *push*', 'dokploy *', 'npm run stack127:deploy', 'npm run stack127:deploy:release*', 'gh workflow run *', 'supabase functions deploy*');
  if (!approval?.productionData) denied.push('*--environment*production*', '*--confirm*stack127-production*', 'supabase db push*');
  return [...rules, ...denied.map(command => `Bash(${command})`), 'MCPTool(*)'];
}

export function workerProtection(tool, approval = null) {
  const scope = approval ? 'Follow only the production approval stated in this task.' : 'Production work requires coordinator approval.';
  if (tool === "grok") return `Grok uses native deny rules for existing files owned by another lane and unapproved production commands. Reads and development tool-page updates remain available. Native rules cannot enforce exact commits, all new paths, or indirect writes. ${scope} Have Sol review the diff.`;
  if (tool === "agy") return `Antigravity uses --sandbox without permission bypass. It does not enforce lane ownership or production approval. ${scope} Have Sol review the diff.`;
  return null;
}

// Send the prompt over stdin, keeping it out of the child process's argv.
export function runWorker({ lane, tool = lane === "opus" ? "claude" : "codex", model, effort, session, resume, resultPath, promptPath, repoRoot, env, prompt, approval = null, denyRules = [], readOnly = false, timeout }, spawn = spawnSync) {
  const executable = workerExecutable(tool);
  let args;
  let input = prompt;
  if (tool === "claude") {
    const sessionArgs = resume ? ["--resume", session] : ["--session-id", session];
    args = ["-p", "--model", model, "--effort", effort, "--permission-mode", "bypassPermissions", ...sessionArgs, "--output-format", "json"];
  } else if (tool === "codex") {
    const shared = ["-m", model, "-c", `model_reasoning_effort="${effort}"`, "-c", 'sandbox_mode="workspace-write"', "-c", "sandbox_workspace_write.network_access=true", "--json", "-o", resultPath];
    // Approved production tasks can request automatic review of sandbox restrictions.
    const review = approval?.releaseSha || approval?.productionData ? ['--approve-for-me'] : [];
    args = resume ? ["exec", ...review, "resume", ...shared, session, "-"] : ["exec", ...review, ...shared, "-C", repoRoot, "-"];
  } else if (tool === "grok") {
    if (!promptPath) throw new Error("Grok requires a private prompt file.");
    args = ["--prompt-file", promptPath, "--model", model, "--reasoning-effort", effort, "--cwd", repoRoot, "--output-format", "json", "--always-approve", "--no-subagents", "--disallowed-tools", "Agent", ...(resume ? ["--resume", session] : ["--session-id", session]), ...denyRules.flatMap((rule) => ["--deny", rule])];
    if (readOnly) args.push("--tools", "read_file,grep,list_dir", "--deny", "Bash", "--deny", "Edit", "--deny", "Write", "--deny", "MCPTool(*)");
    input = undefined;
  } else if (tool === "agy") {
    const mappedEffort = effort === "xhigh" ? "max" : effort;
    args = ["--input-format", "stream-json", "--output-format", "stream-json", "--model", model, "--effort", mappedEffort, "--mode", readOnly ? "plan" : "accept-edits", "--sandbox", "--disable-slash-commands", ...(resume ? ["--conversation", session] : [])];
    input = `${JSON.stringify({ event: "user", message: { content: prompt } })}\n`;
  } else {
    throw new Error(`Unknown worker tool: ${tool}`);
  }
  return spawn(executable, args, { cwd: repoRoot, env, input, timeout, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["pipe", "pipe", "pipe"] });
}
