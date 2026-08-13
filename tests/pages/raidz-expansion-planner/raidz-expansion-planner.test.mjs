import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  RAIDZ_EXPANSION_CALCULATION_VERSION,
  RAIDZ_EXPANSION_INPUT_VERSION,
  buildRaidzExpansionCopySummary,
  buildRaidzExpansionLiveSummary,
  calculateRaidzExpansion,
  convertRaidzExpansionEditorCapacity,
  formatRaidzExpansionEditorCapacity,
  parseRaidzExpansionCapacity,
  raidzExpansionCalculatorRegistry,
  validateRaidzExpansionInput,
} from "../../../lib/storage/zfs-expansion.ts";

const GiB = 1_073_741_824n;
const TiB = 1_099_511_627_776n;

function input(overrides = {}) {
  return {
    level: "raidz2",
    currentWidth: 4,
    finalWidth: 8,
    memberBytes: GiB,
    addedDiskBytes: GiB,
    allocatedBytes: 270_337_234n,
    workload: "filesystem",
    blockSizeBytes: 131_072n,
    ashift: 12,
    ...overrides,
  };
}

function values(candidate) {
  const result = calculateRaidzExpansion(candidate);
  assert.equal(result.status, "valid", JSON.stringify(result.issues));
  assert.ok(result.values);
  return result.values;
}

test("FF-001 reconciles old, current, future, native, and gap bytes", () => {
  const result = values(input());
  assert.deepEqual({
    block: result.current.blockPhysicalBytes,
    oldCount: result.oldBlockCount,
    old: result.oldLogicalBytes,
    remainder: result.occupancyRemainderBytes,
    currentFree: result.current.freePhysicalBytes,
    currentWritable: result.current.newWritableLogicalBytes,
    currentImmediate: result.current.immediateLogicalBytes,
  }, {
    block: 270_336n,
    oldCount: 1_000n,
    old: 131_072_000n,
    remainder: 1_234n,
    currentFree: 4_024_630_062n,
    currentWritable: 1_951_268_864n,
    currentImmediate: 2_082_340_864n,
  });
  assert.deepEqual(result.steps.map((step) => ({
    width: step.width,
    block: step.blockPhysicalBytes,
    immediate: step.immediateLogicalBytes,
    native: step.nativeLogicalBytes,
    gap: step.geometryGapBytes,
    gain: step.immediateGainBytes,
  })), [
    { width: 5, block: 221_184n, immediate: 3_152_281_600n, native: 3_181_379_584n, gap: 29_097_984n, gain: 1_069_940_736n },
    { width: 6, block: 196_608n, immediate: 4_245_684_224n, native: 4_294_967_296n, gap: 49_283_072n, gain: 2_163_343_360n },
    { width: 7, block: 196_608n, immediate: 4_961_599_488n, native: 5_010_751_488n, gap: 49_152_000n, gain: 2_879_258_624n },
    { width: 8, block: 184_320n, immediate: 6_047_137_792n, native: 6_108_348_416n, gap: 61_210_624n, gain: 3_964_796_928n },
  ]);
  assert.equal(result.oldLogicalBytes + result.final.newWritableLogicalBytes + result.final.geometryGapBytes, result.final.nativeLogicalBytes);
});

test("unit edits preserve exact bytes or return a recoverable conversion error", () => {
  const converted = convertRaidzExpansionEditorCapacity("8", "TB", "TiB");
  assert.deepEqual(converted, { value: "7.2759576141834259033203125", unit: "TiB" });
  assert.equal(parseRaidzExpansionCapacity(converted.value, converted.unit), 8_000_000_000_000n);
  assert.deepEqual(convertRaidzExpansionEditorCapacity("8", "TiB", "TB"), { value: "8.796093022208", unit: "TB" });
  assert.throws(() => convertRaidzExpansionEditorCapacity("not-a-capacity", "TB", "TiB"), /Capacity/);
});

test("FF-001 receipts expose the complete live answer and copy audit", () => {
  const candidate = input();
  const result = calculateRaidzExpansion(candidate);
  assert.ok(result.values);
  const live = buildRaidzExpansionLiveSummary(result.values, "TB");
  for (const text of ["3964796928 B gained", "8 members", "2082340864 B current", "6047137792 B immediate", "6108348416 B fresh", "61210624 B gap", "RAIDZ2 unchanged", "reported capacity unknown"]) assert.match(live, new RegExp(text, "i"));

  const copy = buildRaidzExpansionCopySummary(candidate, result.values, "TB");
  for (const text of [
    "RAIDZ2", "4 to 8", "member 1073741824 B", "each added disk 1073741824 B", "current physical allocation 270337234 B",
    "filesystem", "block 131072 B", "ashift 12", "old logical 131072000 B", "current 2082340864 B",
    "immediate 6047137792 B", "fresh 6108348416 B", "gap 61210624 B", "unchanged parity",
    "reported capacity unknown", "current vdev has not been expanded", "no allocations change between planned steps",
    "reported capacity remains unknown", "Formula v1",
  ]) assert.match(copy, new RegExp(text, "i"));
});

test("FF-002 zero occupancy has no geometry gap", () => {
  const result = values(input({ allocatedBytes: 0n }));
  assert.equal(result.oldBlockCount, 0n);
  assert.equal(result.oldLogicalBytes, 0n);
  assert.equal(result.occupancyRemainderBytes, 0n);
  assert.deepEqual(result.steps.map((step) => step.immediateLogicalBytes), [3_181_379_584n, 4_294_967_296n, 5_010_751_488n, 6_108_348_416n]);
  assert.ok(result.steps.every((step) => step.geometryGapBytes === 0n));
  assert.equal(result.final.immediateGainBytes, 4_026_007_552n);
});

test("FF-003 full current envelope gains only added space", () => {
  const result = values(input({ finalWidth: 5, allocatedBytes: 4_294_967_296n }));
  assert.equal(result.current.freePhysicalBytes, 0n);
  assert.equal(result.current.newWritableLogicalBytes, 0n);
  assert.equal(result.oldBlockCount, 15_887n);
  assert.equal(result.occupancyRemainderBytes, 139_264n);
  assert.deepEqual({ immediate: result.final.immediateLogicalBytes, native: result.final.nativeLogicalBytes, gap: result.final.geometryGapBytes }, {
    immediate: 2_718_564_352n, native: 3_181_379_584n, gap: 462_815_232n,
  });
});

test("FF-004 covers minimum RAIDZ3 and one-sector blocks", () => {
  const result = values(input({ level: "raidz3", currentWidth: 4, finalWidth: 7, allocatedBytes: 16_384_001n, blockSizeBytes: 4_096n }));
  assert.equal(result.oldBlockCount, 1_000n);
  assert.equal(result.occupancyRemainderBytes, 1n);
  assert.ok([result.current, ...result.steps].every((step) => step.blockPhysicalBytes === 16_384n && step.geometryGapBytes === 4_096n));
  assert.equal(result.final.immediateLogicalBytes, 1_879_044_096n);
});

test("FF-005 excludes larger added-disk capacity", () => {
  const result = values(input({ level: "raidz1", currentWidth: 3, finalWidth: 5, memberBytes: 1_000_000_000_000n, addedDiskBytes: 2_000_000_000_000n, allocatedBytes: 1_000_000_000_000n }));
  assert.equal(result.addedDiskExcessBytes, 1_000_000_000_000n);
  assert.equal(result.totalAddedDiskExcessBytes, 2_000_000_000_000n);
  assert.equal(result.final.immediateLogicalBytes, 3_866_666_598_400n);
  assert.equal(result.final.nativeLogicalBytes, 3_999_999_983_616n);
  assert.equal(result.final.geometryGapBytes, 133_333_385_216n);
});

test("strictly validates shape, widths, dependencies, blocks, and bounds", () => {
  const valid = input();
  assert.equal(validateRaidzExpansionInput(valid), true);
  for (const candidate of [
    { ...valid, extra: true },
    { ...valid, level: "mirror" },
    { ...valid, currentWidth: 2 },
    { ...valid, currentWidth: 64 },
    { ...valid, finalWidth: 4 },
    { ...valid, finalWidth: 65 },
    { ...valid, memberBytes: 0n },
    { ...valid, memberBytes: 10_000_000_000_000_001n },
    { ...valid, addedDiskBytes: GiB - 1n },
    { ...valid, allocatedBytes: 4n * GiB + 1n },
    { ...valid, workload: "database" },
    { ...valid, workload: "zvol", blockSizeBytes: 256n * 1_024n },
    { ...valid, blockSizeBytes: 3_000n },
    { ...valid, ashift: 10 },
  ]) assert.equal(validateRaidzExpansionInput(candidate), false);
  assert.equal(calculateRaidzExpansion({ ...valid, currentWidth: 2 }).values, null);
});

test("capacity parser is exact and rejects unsupported grammar", () => {
  assert.equal(parseRaidzExpansionCapacity("8", "TB"), 8_000_000_000_000n);
  assert.equal(parseRaidzExpansionCapacity("8.5", "GiB"), 9_126_805_504n);
  assert.equal(parseRaidzExpansionCapacity("0", "TB"), 0n);
  for (const [text, unit] of [["8e1", "TB"], [" 8", "TB"], ["+8", "TB"], ["8,5", "TB"], ["0.0000000001", "GB"], ["8", "PB"], ["1".repeat(257), "TB"]]) {
    assert.throws(() => parseRaidzExpansionCapacity(text, unit));
  }
});

test("restored byte values have exact supported editor representations", () => {
  for (const [bytes, expected] of [
    [8_000_000_000_000n, { value: "8", unit: "TB" }],
    [8n * TiB, { value: "8", unit: "TiB" }],
    [270_337_234n, { value: "0.270337234", unit: "GB" }],
    [1n, { value: "0.000000001", unit: "GB" }],
  ]) {
    const editor = formatRaidzExpansionEditorCapacity(bytes);
    assert.deepEqual(editor, expected);
    assert.equal(parseRaidzExpansionCapacity(editor.value, editor.unit), bytes);
  }
});

test("state shares input only and restores by formula version", () => {
  assert.equal(RAIDZ_EXPANSION_CALCULATION_VERSION, 1);
  assert.equal(RAIDZ_EXPANSION_INPUT_VERSION, 1);
  const candidate = input();
  const encoded = raidzExpansionCalculatorRegistry.encode("raidz-expansion", candidate);
  const decoded = Buffer.from(encoded.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString("utf8");
  assert.doesNotMatch(decoded, /geometryGap|immediateLogical|reported/i);
  assert.deepEqual(raidzExpansionCalculatorRegistry.runEncoded(encoded), calculateRaidzExpansion(candidate));
  assert.throws(() => raidzExpansionCalculatorRegistry.runEncoded("not_base64!"));
});

test("copy summary states exact plan, unchanged parity, and unknown reporting", () => {
  const candidate = input();
  const summary = buildRaidzExpansionCopySummary(candidate, values(candidate), "TiB");
  for (const phrase of ["RAIDZ2", "4 to 8", "stays RAIDZ2", "immediate", "fresh", "gap", "reported capacity unknown", "formula v1"]) assert.match(summary, new RegExp(phrase, "i"));
  assert.doesNotMatch(summary, /https?:\/\//);
});

test("all exact invariants are deterministic under legal boundaries", () => {
  const durations = [];
  for (const level of ["raidz1", "raidz2", "raidz3"]) {
    const parity = Number(level.at(-1));
    for (const ashift of [9, 12, 13, 14]) {
      const candidate = input({ level, currentWidth: parity + 1, finalWidth: 64, memberBytes: 10_000_000_000_000_000n, addedDiskBytes: 10_000_000_000_000_000n, allocatedBytes: 0n, ashift });
      const started = performance.now();
      const first = values(candidate);
      durations.push(performance.now() - started);
      assert.deepEqual(values(candidate), first);
      assert.equal(first.steps.length, 64 - (parity + 1));
      for (const step of first.steps) {
        assert.ok(step.geometryGapBytes >= 0n);
        assert.equal(first.oldLogicalBytes + step.newWritableLogicalBytes + step.geometryGapBytes, step.nativeLogicalBytes);
      }
    }
  }
  durations.sort((a, b) => a - b);
  assert.ok(durations[Math.floor(durations.length * 0.95)] < 50);
});
