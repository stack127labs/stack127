import test from "node:test";
import assert from "node:assert/strict";
import { generatedEstimatePlan, generatedBases } from "../../../scripts/self-host-apps/lib/resource-quarantine.mjs";

test("only estimates with the identified generated basis enter quarantine", () => {
  const row = { id: "a", slug: "example", resource_estimate_record: { app_id: "a", ram_estimate_basis: generatedBases.ram, storage_estimate_basis: "Measured workload" } };
  const plan = generatedEstimatePlan({ schema_version: 2, records: [{ directory: "self-host-apps", record: row }] });
  assert.equal(plan.length, 1);
  assert.equal(plan[0].ram, true);
  assert.equal(plan[0].storage, false);
  assert.deepEqual(plan[0].record, row.resource_estimate_record);
  row.resource_estimate_record.ram_estimate_basis = "Documented calculation";
  assert.equal(generatedEstimatePlan({ schema_version: 2, records: [{ directory: "self-host-apps", record: row }] }).length, 0);
});

test("partial snapshots and mismatched identities cannot drive resource removal", () => {
  assert.throws(() => generatedEstimatePlan({ records: [] }), /version-2/);
  const row = { id: "a", resource_estimate_record: { app_id: "b", ram_estimate_basis: generatedBases.ram } };
  assert.throws(() => generatedEstimatePlan({ schema_version: 2, records: [{ directory: "self-host-apps", record: row }] }), /identity/);
});
