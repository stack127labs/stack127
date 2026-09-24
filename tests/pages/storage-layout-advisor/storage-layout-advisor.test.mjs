import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  MAX_DRIVE_CAPACITY_BYTES,
  decodeStorageState,
} from "../../../lib/storage/index.ts";
import {
  ADVISOR_CALCULATION_VERSION,
  ADVISOR_INPUT_VERSION,
  calculateStorageLayoutAdvisor,
  decodeStorageLayoutAdvisorState,
  encodeStorageLayoutAdvisorState,
  validateStorageLayoutAdvisorInput,
} from "../../../app/(site)/(tools)/(storage)/storage-layout-advisor/storage-layout-advisor-engine.ts";

const TB = 1_000_000_000_000n;
const TiB = 1_099_511_627_776n;

function drive(size, unit = "TB", id) {
  return { id: id ?? "drive-1", size: String(size), unit };
}

function input(overrides = {}) {
  return {
    drives: [drive(4, "TB", "drive-1"), drive(4, "TB", "drive-2")],
    platform: "any",
    workload: "general",
    protectedFailures: 1,
    displayUnit: "TiB",
    ...overrides,
  };
}

function validValues(candidate) {
  const result = calculateStorageLayoutAdvisor(candidate);
  assert.equal(result.status, "valid", JSON.stringify(result.issues));
  assert.ok(result.values);
  return result.values;
}

test("parses exact decimal and binary capacities", () => {
  const result = validValues(input({
    drives: [drive("1.5", "TB", "drive-1"), drive("1.5", "TiB", "drive-2")],
  }));
  assert.equal(result.drives[0].capacityBytes, 1_500_000_000_000n);
  assert.equal(result.drives[1].capacityBytes, 1_649_267_441_664n);
  assert.equal(result.rawCapacityBytes, 3_149_267_441_664n);
});

test("reconciles equal-drive layout fixtures", () => {
  const values = validValues(input({
    drives: [1, 2, 3, 4].map((index) => drive(4, "TB", `drive-${index}`)),
    protectedFailures: 0,
  }));
  const byId = new Map(values.candidates.map((candidate) => [candidate.id, candidate]));
  assert.deepEqual({
    stripe: [byId.get("stripe").usableBytes, byId.get("stripe").redundancyBytes, byId.get("stripe").mismatchBytes],
    stripedMirrors: [byId.get("striped-mirrors").usableBytes, byId.get("striped-mirrors").redundancyBytes, byId.get("striped-mirrors").mismatchBytes],
    parity1: [byId.get("single-parity").usableBytes, byId.get("single-parity").redundancyBytes, byId.get("single-parity").mismatchBytes],
    parity2: [byId.get("dual-parity").usableBytes, byId.get("dual-parity").redundancyBytes, byId.get("dual-parity").mismatchBytes],
  }, {
    stripe: [16n * TB, 0n, 0n],
    stripedMirrors: [8n * TB, 8n * TB, 0n],
    parity1: [12n * TB, 4n * TB, 0n],
    parity2: [8n * TB, 8n * TB, 0n],
  });
  for (const candidate of values.candidates) {
    assert.equal(candidate.rawBytes, candidate.usableBytes + candidate.redundancyBytes + candidate.mismatchBytes, candidate.id);
  }
});

test("keeps mixed-size mismatch and adjacent mirror placement exact", () => {
  const values = validValues(input({
    drives: [4, 8, 8, 4].map((size, index) => drive(size, "TB", `drive-${index + 1}`)),
    protectedFailures: 1,
  }));
  const candidate = values.candidates.find((row) => row.id === "striped-mirrors");
  assert.ok(candidate);
  assert.equal(candidate.usableBytes, 8n * TB);
  assert.equal(candidate.redundancyBytes, 8n * TB);
  assert.equal(candidate.mismatchBytes, 8n * TB);
  assert.deepEqual(candidate.groups.map((group) => group.driveIds), [["drive-1", "drive-2"], ["drive-3", "drive-4"]]);
  assert.equal(candidate.groups[0].commonBytes, 4n * TB);
  assert.equal(candidate.groups[1].commonBytes, 4n * TB);
});

test("filters platform candidates before ranking", () => {
  const drives = [1, 2, 3, 4, 5, 6].map((index) => drive(4, "TB", `drive-${index}`));
  const openzfs = validValues(input({ drives, platform: "openzfs", protectedFailures: 3 }));
  assert.ok(openzfs.candidates.some((candidate) => candidate.id === "triple-parity"));
  const linux = calculateStorageLayoutAdvisor(input({ drives, platform: "linux-md", protectedFailures: 3 }));
  assert.equal(linux.status, "invalid");
  assert.equal(linux.values, null);
  assert.match(linux.issues[0].message, /eligible/i);
  const nas = validValues(input({ drives, platform: "nas-raid", protectedFailures: 2 }));
  assert.ok(nas.candidates.some((candidate) => candidate.id === "dual-parity"));
  assert.equal(nas.candidates.some((candidate) => candidate.id === "triple-parity"), false);
});

test("workload changes only the named fit rubric", () => {
  const drives = [1, 2, 3, 4, 5, 6].map((index) => drive(4, "TB", `drive-${index}`));
  const results = ["general", "bulk", "vm-db"].map((workload) => validValues(input({ drives, workload })));
  const shape = (values) => values.candidates.map((candidate) => ({
    id: candidate.id,
    rawBytes: candidate.rawBytes,
    usableBytes: candidate.usableBytes,
    redundancyBytes: candidate.redundancyBytes,
    mismatchBytes: candidate.mismatchBytes,
    tolerance: candidate.guaranteedTolerance,
    groups: candidate.groups.map((group) => group.driveIds),
  }));
  assert.deepEqual(shape(results[0]), shape(results[1]));
  assert.deepEqual(shape(results[1]), shape(results[2]));
  assert.notDeepEqual(results[0].eligibleCandidates.map((candidate) => candidate.id), results[2].eligibleCandidates.map((candidate) => candidate.id));
});

test("filters protection targets and returns no eligible values", () => {
  const drives = [1, 2, 3, 4].map((index) => drive(4, "TB", `drive-${index}`));
  const targetTwo = calculateStorageLayoutAdvisor(input({ drives, protectedFailures: 2 }));
  assert.equal(targetTwo.status, "valid");
  assert.deepEqual(targetTwo.values.eligibleCandidates.map((candidate) => candidate.id), ["dual-parity"]);
  const targetThree = calculateStorageLayoutAdvisor(input({ drives, protectedFailures: 3 }));
  assert.equal(targetThree.status, "invalid");
  assert.equal(targetThree.values, null);
  assert.match(targetThree.issues.map((issue) => issue.message).join(" "), /drive|target|eligible/i);
  const oneDrive = calculateStorageLayoutAdvisor(input({ drives: [drive(4, "TB", "drive-1")], protectedFailures: 1 }));
  assert.equal(oneDrive.status, "invalid");
  assert.equal(oneDrive.values, null);
});

test("rejects grammar, limits, duplicates, and invalid enum state", () => {
  const invalidRows = ["", "   ", "letters", "1,000", "1e3", "-1", "0", "0.0000000001"];
  for (const size of invalidRows) {
    const candidate = input({ drives: [drive(size, size === "0.0000000001" ? "GB" : "TB", "drive-1"), drive(4, "TB", "drive-2")] });
    assert.equal(validateStorageLayoutAdvisorInput(candidate), false, size);
    assert.equal(calculateStorageLayoutAdvisor(candidate).status, "invalid", size);
  }
  assert.equal(validateStorageLayoutAdvisorInput(input({ drives: [drive(MAX_DRIVE_CAPACITY_BYTES.toString(), "B", "drive-1")] })), false);
  assert.equal(validateStorageLayoutAdvisorInput(input({ drives: [drive(4, "TB", "drive-1"), drive(4, "TB", "drive-1")] })), false);
  assert.equal(validateStorageLayoutAdvisorInput(input({ platform: "unknown" })), false);
  assert.equal(validateStorageLayoutAdvisorInput(input({ protectedFailures: 4 })), false);
  assert.equal(validateStorageLayoutAdvisorInput(input({ drives: Array.from({ length: 65 }, (_, index) => drive(1, "TB", `drive-${index + 1}`)) })), false);
});

test("round-trips normalized state without serializing result values", () => {
  const original = input({
    drives: [drive("1.5", "TB", "drive-1"), drive(4, "TB", "drive-2")],
    platform: "openzfs",
    workload: "bulk",
    protectedFailures: 2,
    displayUnit: "TB",
  });
  const encoded = encodeStorageLayoutAdvisorState(original);
  const envelope = decodeStorageState(encoded);
  assert.equal(envelope.calculatorId, "storage-layout-advisor");
  assert.equal(envelope.calculatorVersion, ADVISOR_CALCULATION_VERSION);
  assert.equal(envelope.inputVersion, ADVISOR_INPUT_VERSION);
  assert.equal(Object.hasOwn(envelope.payload, "values"), false);
  const decoded = decodeStorageLayoutAdvisorState(encoded);
  assert.deepEqual(decoded.drives, original.drives);
  assert.equal(decoded.platform, "openzfs");
  assert.equal(decoded.protectedFailures, 2);
  assert.throws(() => decodeStorageLayoutAdvisorState("broken"));
});

test("rejects oversized or wrong-calculator state", () => {
  const original = input();
  const encoded = encodeStorageLayoutAdvisorState(original);
  const other = decodeStorageState(encoded);
  assert.equal(other.calculatorId, "storage-layout-advisor");
  assert.throws(() => decodeStorageLayoutAdvisorState(`${encoded}!`));
  assert.throws(() => decodeStorageLayoutAdvisorState("eyJzY2hlbWEiOiJzdGFjazEyNy1zdG9yYWdlLXN0YXRlIn0"));
});

test("calculates the 64-row maximum within a small synchronous budget", () => {
  const candidate = input({
    drives: Array.from({ length: 64 }, (_, index) => drive(18, "TB", `drive-${index + 1}`)),
    platform: "openzfs",
    workload: "bulk",
    protectedFailures: 2,
  });
  const samples = [];
  for (let index = 0; index < 5; index += 1) {
    const start = performance.now();
    const result = calculateStorageLayoutAdvisor(candidate);
    samples.push(performance.now() - start);
    assert.equal(result.status, "valid");
  }
  assert.ok(Math.max(...samples) < 50, `slowest sample ${Math.max(...samples).toFixed(2)} ms`);
});
