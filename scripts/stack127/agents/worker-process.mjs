import { spawnSync } from "node:child_process";

// Send the prompt over stdin, keeping it out of the child process's argv.
export function runWorker({ lane, model, effort, session, resume, resultPath, repoRoot, env, prompt }, spawn = spawnSync) {
  const executable = lane === "opus" ? "claude" : "codex";
  let args;
  if (lane === "opus") {
    const sessionArgs = resume ? ["--resume", session] : ["--session-id", session];
    args = ["-p", "--model", "opus", "--effort", effort, "--permission-mode", "bypassPermissions", ...sessionArgs, "--output-format", "json"];
  } else {
    const shared = ["-m", model, "-c", `model_reasoning_effort="${effort}"`, "-c", 'sandbox_mode="workspace-write"', "-c", "sandbox_workspace_write.network_access=true", "--json", "-o", resultPath];
    args = resume ? ["exec", "resume", ...shared, session, "-"] : ["exec", ...shared, "-C", repoRoot, "-"];
  }
  return spawn(executable, args, { cwd: repoRoot, env, input: prompt, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["pipe", "pipe", "pipe"] });
}
