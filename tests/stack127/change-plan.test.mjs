import assert from "node:assert/strict";
import test from "node:test";
import { planChanges } from "../../scripts/stack127/quality/change-plan.mjs";

test("documentation-only changes skip browser tests", () => {
  const plan = planChanges(["stack127_docs/tool-pipeline.md", "skills/stack127/stack127-tool-build/SKILL.md"]);
  assert.equal(plan.mode, "none");
});

test("a published route change selects its owned browser coverage and smoke test", () => {
  const plan = planChanges(["app/(site)/(tools)/backup-321-calculator/backup-321-calculator.tsx"]);
  assert.equal(plan.mode, "focused");
  assert.deepEqual(plan.routes, ["/backup-321-calculator"]);
  assert.ok(plan.specs.includes("tests/pages/backup-321-calculator/backup-321-calculator.spec.ts"));
  assert.ok(plan.specs.includes("tests/stack127/release-smoke.spec.ts"));
});

test("shared layout and quality changes select the complete release browser gate", () => {
  for (const file of ["app/app-shell.tsx", "scripts/stack127/quality/change-plan.mjs", "playwright.config.ts"]) {
    const plan = planChanges([file]);
    assert.equal(plan.mode, "full", file);
  }
});

test("an unknown runtime file fails safe to the complete browser gate", () => {
  const plan = planChanges(["lib/new-runtime-system.ts"]);
  assert.equal(plan.mode, "full");
  assert.match(plan.reason, /Unmapped runtime file/);
});

