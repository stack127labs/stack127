// Coordinator approval belongs to one worker task and expires after one day.
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const duration = 24 * 60 * 60 * 1000;

export function workerEnvironment(parent, lane, approval) {
  const env = { ...parent, STACK127_DELEGATED: '1', STACK127_LANE: lane, STACK127_LANE_GUARD: 'on' };
  // A new worker receives only approval created for this invocation.
  for (const key of ['CODEX_THREAD_ID', 'CLAUDE_SESSION_ID', 'STACK127_WORKER_APPROVAL', 'STACK127_WORKER_RUN_ID']) delete env[key];
  if (approval) {
    env.STACK127_WORKER_APPROVAL = approval.file;
    env.STACK127_WORKER_RUN_ID = approval.id;
  }
  return env;
}

export function createWorkerApproval({ root, lane, runDir, task, releaseSha = null, productionData = false, now = Date.now() }, env = process.env) {
  if (env.STACK127_DELEGATED === "1") throw new Error("Only the coordinator may approve worker production work.");
  if (!releaseSha && !productionData) return null;
  if (releaseSha && !/^[a-f0-9]{40}$/.test(releaseSha)) throw new Error("Worker release approval requires the full reviewed commit SHA.");
  if (!["opus", "sol", "luna"].includes(lane) || !task?.trim()) throw new Error("Worker approval requires a lane and task.");
  const approval = { version: 1, id: randomUUID(), root: fs.realpathSync(root), lane, task, releaseSha, productionData, expiresAt: new Date(now + duration).toISOString() };
  const file = path.join(runDir, "worker-approval.json");
  fs.writeFileSync(file, `${JSON.stringify(approval, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  return { ...approval, file };
}

export function readWorkerApproval({ root, env = process.env, now = Date.now() }) {
  if (!env.STACK127_WORKER_APPROVAL || !env.STACK127_WORKER_RUN_ID) return null;
  try {
    const approval = JSON.parse(fs.readFileSync(env.STACK127_WORKER_APPROVAL, "utf8"));
    const expires = Date.parse(approval.expiresAt);
    if (approval.version !== 1 || approval.root !== fs.realpathSync(root) || approval.id !== env.STACK127_WORKER_RUN_ID || approval.lane !== env.STACK127_LANE || !approval.task?.trim() || !Number.isFinite(expires) || expires <= now || expires > now + duration) return null;
    if (approval.releaseSha !== null && !/^[a-f0-9]{40}$/.test(approval.releaseSha)) return null;
    if (typeof approval.productionData !== "boolean") return null;
    return { ...approval, file: path.resolve(env.STACK127_WORKER_APPROVAL) };
  } catch { return null; }
}
