import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  orderedTransferFindings,
  transferConclusion,
  transferPolicyApplies,
} from "../../../app/(site)/(tools)/transfer-readiness/transfer-readiness-view.ts";

const source = readFileSync(path.join(process.cwd(), "app/(site)/(tools)/transfer-readiness/transfer-readiness-tool.tsx"), "utf8");

function result(overrides = {}) {
  return {
    registration: { query: { domain: "example.com", unicode: "example.com", tld: "com", tldType: "generic" }, status: "registered" },
    findings: [], policy: {}, pendingPolicyChange: null, cannotCheck: [], summary: "legacy", ...overrides,
  };
}

test("conclusion never promises readiness while private checks remain", () => {
  const clear = transferConclusion(result());
  assert.match(clear, /No public blocker was found/);
  assert.match(clear, /can still stop the transfer/);
  assert.doesNotMatch(clear, /ready to transfer|all clear|can transfer now/i);
});

test("blocked conclusion counts self-service and external blockers", () => {
  const findings = [
    { id: "client-lock", state: "blocked", selfServiceable: true },
    { id: "server-lock", state: "blocked", selfServiceable: false },
  ];
  const lead = transferConclusion(result({ findings }));
  assert.match(lead, /Two public blockers/);
  assert.match(lead, /one you can clear/);
  assert.match(lead, /one requires waiting or registrar help/);
});

test("blocked conclusion keeps plural ownership grammar", () => {
  const findings = [
    { id: "client-lock", state: "blocked", selfServiceable: true },
    { id: "server-lock", state: "blocked", selfServiceable: false },
    { id: "registration-lock", state: "blocked", selfServiceable: false },
  ];
  const lead = transferConclusion(result({ findings }));
  assert.match(lead, /Three public blockers/);
  assert.match(lead, /two require waiting or registrar help/);
  assert.doesNotMatch(lead, /two requires/);
});

test("ICANN timing rules are not applied to country-code endings", () => {
  assert.equal(transferPolicyApplies(result()), true);
  assert.equal(transferPolicyApplies(result({ registration: { query: { tldType: "country-code" }, status: "registered" } })), false);
});

test("public checks sort by severity then fixed subject order", () => {
  const findings = [
    { id: "dnssec", state: "risk" },
    { id: "transfer-lock", state: "unknown" },
    { id: "client-lock", state: "blocked" },
    { id: "server-lock", state: "blocked" },
  ];
  assert.deepEqual(orderedTransferFindings(findings).map((finding) => finding.id), ["client-lock", "server-lock", "dnssec", "transfer-lock"]);
});

test("interface uses shared controls and omits the legacy dashboard shell", () => {
  for (const component of ["ToolTextField", "ToolButton", "ToolResultLead", "ToolKeyValueList", "ToolRawOutput", "ToolStatus"]) assert.match(source, new RegExp(component));
  assert.doesNotMatch(source, /StatePill|ResultHeader|DownloadReportButton|domain-answer|Nothing visible is blocking it|What we cannot see/);
});
