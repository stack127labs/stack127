import test from "node:test";
import assert from "node:assert/strict";

import {
  deploymentId,
  deploymentState,
  extractDeploymentRecords,
  isFailureState,
  isSuccessState,
} from "../../scripts/version127/deployment/dokploy-release.mjs";

test("Dokploy deployment responses are normalized across common wrappers", () => {
  const records = extractDeploymentRecords({ data: { deployments: [{ id: "new", status: "running" }] } });
  assert.deepEqual(records, [{ id: "new", status: "running" }]);
  assert.equal(deploymentId(records[0]), "new");
  assert.equal(deploymentState(records[0]), "running");
});

test("Dokploy deployment state helpers fail closed on explicit failures", () => {
  assert.equal(isSuccessState("completed"), true);
  assert.equal(isFailureState("failed"), true);
  assert.equal(isFailureState("running"), false);
});
