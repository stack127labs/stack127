import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { contentSnapshotFromRow, sha256Text, targetDigest, validateRecord } from "../../scripts/stack127/tool-pipeline/validate-acceptance.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "stack127-acceptance-"));
  const source = "export const answer = 42;\n";
  const contract = "# Interface contract\n\n## Optional mode and state visibility\n\n- Control mode: single\n";
  writeFileSync(join(root, "tool.ts"), source);
  writeFileSync(join(root, "interface-contract.md"), contract);
  writeFileSync(join(root, "receipt.log"), "exit 0: focused test\n");
  const target = { commit: "0123456789abcdef0123456789abcdef01234567", files: [{ path: "tool.ts", sha256: hash(source) }], inputs: [{ path: "interface-contract.md", sha256: hash(contract), validation: "current" }], content: { environment: "development", revision: 1, toolVersion: "1.0.0", fields: { title: hash("Tool"), intro_markdown: hash("Intro"), usage_markdown: hash("Usage"), content_markdown: hash("Content") } } };
  const authors = [
    { stage: "research", model: "gpt-5.6-luna", reasoning: "max", session: "luna-research" },
    { stage: "audit", model: "gpt-5.6-sol", reasoning: "high", session: "sol-audit" },
  ];
  const evidence = [
    { id: "ev-contracts", kind: "command", author: "luna-research", recordedAt: "2026-09-16T00:00:00.000Z", targetDigest: targetDigest(target), path: "receipt.log", sha256: hash("exit 0: focused test\n"), command: "node test.mjs", exitCode: 0 },
    { id: "ev-audit", kind: "review", author: "sol-audit", recordedAt: "2026-09-16T00:01:00.000Z", targetDigest: targetDigest(target), path: "receipt.log", sha256: hash("exit 0: focused test\n") },
  ];
  const checks = [
    { id: "c-contracts", kind: "contracts", required: true, status: "passed", targetDigest: target.digest, evidenceIds: ["ev-contracts"] },
    { id: "c-independent-review", kind: "independent-review", required: true, status: "passed", targetDigest: target.digest, evidenceIds: ["ev-audit"] },
  ];
  const base = { schemaVersion: 1, route: "/example-tool", scope: { kind: "retrofit", owns: ["research"], excludes: ["engine remains unchanged"] }, status: "draft", authors, target, feasibility: [{ stage: "research", status: "feasible", reason: "Reviewed", evidenceIds: ["ev-contracts"] }], mode: { decision: "single", rationale: "One task", contractPath: "interface-contract.md" }, coverage: [{ id: "R1", kind: "requirement", requirement: "Research is current", disposition: "required", checkIds: ["c-contracts"] }], checks, evidence, findings: [] };
  target.digest = targetDigest(target); for (const check of checks) check.targetDigest = target.digest; evidence[0].targetDigest = target.digest;
  return { root, record: base };
}

test("rejects stale target file hashes and unknown properties", () => {
  const { root, record } = fixture();
  try { record.extra = true; record.target.files[0].sha256 = "0".repeat(64); const result = validateRecord(record, { repositoryRoot: root, final: false }); assert.equal(result.ok, false); assert.match(result.errors.join("\n"), /unknown property|target\.files.*mismatch/); } finally { rmSync(root, { recursive: true, force: true }); }
});

test("final acceptance requires live database freshness for content scopes", () => {
  const { root, record } = fixture();
  try {
    record.scope.owns = ["content"];
    record.authors.splice(0, 1,
      { stage: "content-plan", model: "gpt-6-astra", reasoning: "low", session: "astra-content-plan" },
      { stage: "content", model: "gpt-6-astra", reasoning: "low", session: "astra-content" },
      { stage: "integration", model: "gpt-5.6-luna", reasoning: "max", session: "luna-integration" },
    );
    record.feasibility = [{ stage: "content", status: "feasible", reason: "Reviewed", evidenceIds: ["ev-contracts"] }];
    const result = validateRecord(record, { repositoryRoot: root, final: true });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), /database evidence requires a live snapshot adapter/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("offline integrity validation is explicitly non-final", () => {
  const { root, record } = fixture();
  try { const result = validateRecord(record, { repositoryRoot: root, final: false }); assert.equal(result.ok, true, result.errors.join("\n")); assert.equal(result.accepted, false); } finally { rmSync(root, { recursive: true, force: true }); }
});

test("blocked feasibility requires two to four decision options", () => {
  const { root, record } = fixture();
  try {
    record.feasibility[0].status = "blocked";
    let result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), /blocked work needs two to four concrete decision options/);

    record.feasibility[0].options = [
      "Approve the paid data service and its monthly cost so the live result can be delivered.",
      "Change to a complete manual import workflow with no recurring service cost.",
    ];
    result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, true, result.errors.join("\n"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("feasible work cannot carry stale blocker options", () => {
  const { root, record } = fixture();
  try {
    record.feasibility[0].options = ["Old option one", "Old option two"];
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), /feasible work must omit decision options/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("requires the exact model and reasoning assignment for every worker role", () => {
  const { root, record } = fixture();
  try {
    record.authors[0].reasoning = "medium";
    let result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), /research: required model configuration is gpt-5\.6-luna with max reasoning/);

    record.authors[0].reasoning = "max";
    record.authors[1].model = "gpt-5.6-luna";
    result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), /audit: required model configuration is gpt-5\.6-sol with high reasoning/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("accepts final-audit fixes rechecked by the same Sol audit session", () => {
  const { root, record } = fixture();
  try {
    record.findings = [{
      id: "F1",
      severity: "P1",
      status: "fixed",
      description: "The final audit found a broken result state.",
      checkIds: ["c-independent-review"],
      fix: { paths: ["tool.ts"], description: "Corrected the state.", targetDigest: record.target.digest },
      recheckEvidenceIds: ["ev-audit"],
    }];
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, true, result.errors.join("\n"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("rejects fixed findings without a current Sol audit recheck", () => {
  const { root, record } = fixture();
  try {
    record.findings = [{
      id: "F1",
      severity: "P1",
      status: "fixed",
      description: "The final audit found a broken result state.",
      checkIds: ["c-independent-review"],
      fix: { paths: ["tool.ts"], description: "Corrected the state.", targetDigest: record.target.digest },
      recheckEvidenceIds: [],
    }];
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), /fixed finding needs current recheck evidence/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("rejects obsolete technical-review and verification worker roles", () => {
  const { root, record } = fixture();
  try {
    record.authors.push({ stage: "verification", model: "gpt-5.6-sol", reasoning: "high", session: "sol-recheck" });
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), /unsupported worker role verification/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("allows the approved adjacent stages to share one exact-model session", () => {
  const { root, record } = fixture();
  try {
    record.scope.owns = ["product", "interface", "tests", "engine", "content"];
    record.feasibility = record.scope.owns.map((stage) => ({ stage, status: "feasible", reason: "Reviewed", evidenceIds: ["ev-contracts"] }));
    record.authors.splice(0, 1,
      { stage: "product", model: "gpt-6-astra", reasoning: "low", session: "astra-planning" },
      { stage: "interface", model: "gpt-6-astra", reasoning: "low", session: "astra-planning" },
      { stage: "test-design", model: "gpt-5.6-luna", reasoning: "max", session: "luna-build" },
      { stage: "build", model: "gpt-5.6-luna", reasoning: "max", session: "luna-build" },
      { stage: "content-plan", model: "gpt-6-astra", reasoning: "low", session: "astra-content" },
      { stage: "content", model: "gpt-6-astra", reasoning: "low", session: "astra-content" },
      { stage: "integration", model: "gpt-5.6-luna", reasoning: "max", session: "luna-integration" },
    );
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.doesNotMatch(result.errors.join("\n"), /duplicate session|may not span worker roles|missing required worker role/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("rejects sharing a session across unrelated worker roles", () => {
  const { root, record } = fixture();
  try {
    record.authors[0].session = "sol-audit";
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.match(result.errors.join("\n"), /may not span worker roles research, audit/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("content scope requires Astra light planning and writing plus Luna max integration", () => {
  const { root, record } = fixture();
  try {
    record.scope.owns = ["usage", "content", "integration"];
    record.feasibility = record.scope.owns.map((stage) => ({ stage, status: "feasible", reason: "Reviewed", evidenceIds: ["ev-contracts"] }));
    record.authors.splice(0, 1,
      { stage: "content-plan", model: "gpt-6-astra", reasoning: "low", session: "astra-content" },
      { stage: "content", model: "gpt-6-astra", reasoning: "low", session: "astra-content" },
      { stage: "integration", model: "gpt-5.6-luna", reasoning: "max", session: "luna-integrate" },
    );
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.doesNotMatch(result.errors.join("\n"), /missing required worker role/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("basic-advanced acceptance requires a complete state and parity contract", () => {
  const { root, record } = fixture();
  try {
    record.mode.decision = "basic-advanced";
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.equal(result.ok, false);
    assert.match(result.errors.join("\n"), /basic-advanced mode contract is missing/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("database snapshots hash the exact row text and normalize nullable usage to empty", () => {
  const snapshot = contentSnapshotFromRow("/example-tool", {
    title: "Tool",
    intro_markdown: "Intro\n",
    usage_markdown: null,
    content_markdown: "Content",
    content_revision: 7,
    tool_version: "1.2.3",
  });
  assert.deepEqual(snapshot, {
    route: "/example-tool",
    revision: 7,
    toolVersion: "1.2.3",
    fields: {
      title: sha256Text("Tool"),
      intro_markdown: sha256Text("Intro\n"),
      usage_markdown: sha256Text(""),
      content_markdown: sha256Text("Content"),
    },
    nonempty: {
      title: true,
      intro_markdown: true,
      usage_markdown: false,
      content_markdown: true,
    },
  });
});

test("usage scope cannot pass without explicit input, output, and usage coverage", () => {
  const { root, record } = fixture();
  try {
    record.scope.owns = ["usage"];
    record.feasibility = [{ stage: "usage", status: "feasible", reason: "Reviewed", evidenceIds: ["ev-contracts"] }];
    record.authors.splice(0, 1,
      { stage: "content-plan", model: "gpt-6-astra", reasoning: "low", session: "astra-content" },
      { stage: "content", model: "gpt-6-astra", reasoning: "low", session: "astra-content" },
      { stage: "integration", model: "gpt-5.6-luna", reasoning: "max", session: "luna-integrate" },
    );
    const result = validateRecord(record, { repositoryRoot: root, final: false });
    assert.match(result.errors.join("\n"), /requires at least one required input item/);
    assert.match(result.errors.join("\n"), /requires at least one required output item/);
    assert.match(result.errors.join("\n"), /requires at least one required usage item/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("the acceptance CLI resolves the repository root from its script directory", () => {
  const source = readFileSync(join(process.cwd(), "scripts/stack127/tool-pipeline/validate-acceptance.mjs"), "utf8");
  assert.match(source, /resolve\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.\/\.\.\/\.\."\)/);
  assert.doesNotMatch(source, /resolve\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.\/\.\.\/\.\.\/\.\."\)/);
});
