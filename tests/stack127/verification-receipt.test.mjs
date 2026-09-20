import assert from "node:assert/strict";
import test from "node:test";
import { validateVerificationReceipt } from "../../scripts/stack127/tool-pipeline/generate-verification-receipt.mjs";

function receipt() {
  return {
    schemaVersion: 1,
    route: "/backup-321-calculator",
    risk: "simple",
    status: "accepted",
    generatedAt: "2026-09-20T00:00:00.000Z",
    baseCommit: "0".repeat(40),
    publicationState: "published",
    spec: "content_docs/backup-321-calculator/brief.md",
    checks: [
      { name: "fast", command: "npm run test:fast", status: "passed", durationMs: 1 },
      { name: "browser", command: "npx playwright test", status: "passed", durationMs: 2 },
      { name: "build", command: "npm run build", status: "passed", durationMs: 3 },
    ],
    review: { status: "passed", summary: "Independent review found no open release blocker." },
  };
}

test("accepts a compact generated receipt without authors, hashes, or screenshots", () => {
  assert.deepEqual(validateVerificationReceipt(receipt()), []);
});

test("blocks acceptance when a check or independent review failed", () => {
  const failed = receipt();
  failed.checks[1].status = "failed";
  assert.match(validateVerificationReceipt(failed).join("\n"), /accepted receipt requires passing checks and review/);

  failed.status = "blocked";
  assert.deepEqual(validateVerificationReceipt(failed), []);
});

test("rejects duplicate checks and unknown process metadata", () => {
  const invalid = receipt();
  invalid.checks.push({ ...invalid.checks[0] });
  invalid.authors = [];
  const errors = validateVerificationReceipt(invalid).join("\n");
  assert.match(errors, /unknown receipt property: authors/);
  assert.match(errors, /one fast check/);
  assert.match(errors, /exactly three checks/);
});
