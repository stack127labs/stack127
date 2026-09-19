import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

export const SCOPE_STAGES = [
  "research",
  "product",
  "interface",
  "tests",
  "engine",
  "usage",
  "content",
  "media",
  "integration",
];

export const WORKER_CONFIG = {
  research: { model: "gpt-5.6-luna", reasoning: "max" },
  product: { model: "gpt-6-astra", reasoning: "low" },
  interface: { model: "gpt-6-astra", reasoning: "low" },
  "test-design": { model: "gpt-5.6-luna", reasoning: "max" },
  build: { model: "gpt-5.6-luna", reasoning: "max" },
  "content-plan": { model: "gpt-6-astra", reasoning: "low" },
  content: { model: "gpt-6-astra", reasoning: "low" },
  integration: { model: "gpt-5.6-luna", reasoning: "max" },
  audit: { model: "gpt-5.6-sol", reasoning: "high" },
};

export const SHARED_SESSION_GROUPS = [
  new Set(["product", "interface"]),
  new Set(["test-design", "build"]),
  new Set(["content-plan", "content"]),
];

export const CHECKS = [
  "contracts",
  "technical",
  "interaction",
  "content",
  "media",
  "rendered",
  "database",
  "focused-tests",
  "build",
  "repository-quality",
  "independent-review",
];

export function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function sha256Text(value) {
  return sha256Bytes(Buffer.from(value, "utf8"));
}

export function targetDigest(target) {
  return sha256Text(JSON.stringify({
    commit: target.commit,
    files: target.files,
    inputs: target.inputs,
    content: target.content,
  }));
}

export function safeRepoFile(root, name) {
  if (typeof name !== "string" || !name || isAbsolute(name)) return null;
  const absolute = resolve(root, name);
  const rel = relative(root, absolute);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) return null;
  try {
    const stat = lstatSync(absolute);
    return stat.isFile() && !stat.isSymbolicLink() ? absolute : null;
  } catch {
    return null;
  }
}

export function verifyFile(root, entry) {
  const path = safeRepoFile(root, entry?.path);
  if (!path) return { ok: false, error: `unsafe or missing file: ${entry?.path ?? "(missing path)"}` };
  const actual = sha256Bytes(readFileSync(path));
  return actual === entry.sha256
    ? { ok: true, path }
    : { ok: false, error: `${entry.path}: sha256 mismatch (recorded ${entry.sha256}, actual ${actual})`, path };
}

export function requiredWorkerRoles(scope) {
  const owned = new Set(scope.owns ?? []);
  const roles = new Set(["audit"]);
  if (owned.has("research")) roles.add("research");
  if (owned.has("product")) roles.add("product");
  if (owned.has("interface")) roles.add("interface");
  if (owned.has("tests")) roles.add("test-design");
  if (owned.has("engine")) roles.add("build");
  if (["usage", "content", "media"].some((stage) => owned.has(stage))) {
    roles.add("content-plan");
    roles.add("content");
    roles.add("integration");
  }
  if (owned.has("integration")) roles.add("integration");
  return [...roles];
}

export function requiredChecks(scope) {
  const owned = new Set(scope.owns ?? []);
  const required = new Set(["contracts", "independent-review"]);
  const implementation = ["tests", "engine", "usage", "content", "media", "integration"]
    .some((stage) => owned.has(stage));

  if (implementation) {
    required.add("focused-tests");
    required.add("build");
    required.add("repository-quality");
  }
  if (["engine", "tests", "interface", "integration"].some((stage) => owned.has(stage))) {
    required.add("technical");
  }
  if (["interface", "usage", "integration"].some((stage) => owned.has(stage))) {
    required.add("interaction");
  }
  if (["usage", "content"].some((stage) => owned.has(stage))) required.add("content");
  if (owned.has("media")) required.add("media");
  if (["interface", "usage", "content", "media", "integration"].some((stage) => owned.has(stage))) {
    required.add("rendered");
  }
  if (["usage", "content", "integration"].some((stage) => owned.has(stage))) {
    required.add("database");
  }
  return [...required];
}
