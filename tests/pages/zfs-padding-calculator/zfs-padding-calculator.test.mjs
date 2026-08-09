import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  ZFS_PADDING_CALCULATION_VERSION,
  ZFS_PADDING_INPUT_VERSION,
  buildZfsPaddingCopySummary,
  calculateZfsPadding,
  parseZfsPaddingBlockSize,
  validateZfsPaddingInput,
  zfsPaddingCalculatorRegistry,
} from "../../../lib/storage/zfs-padding.ts";
import { calculateRaidzAllocation } from "../../../lib/storage/zfs-raidz-allocation.ts";

const KiB = 1_024n;
const MiB = 1_048_576n;

function input(overrides = {}) {
  return {
    level: "raidz2",
    width: 6,
    workload: "filesystem",
    blockSizeBytes: 128n * KiB,
    ashift: 12,
    ...overrides,
  };
}

function values(candidate) {
  const result = calculateZfsPadding(candidate);
  assert.equal(result.status, "valid", JSON.stringify(result.issues));
  assert.ok(result.values);
  return result.values;
}

const fixtures = [
  ["FF-001", input(), { dataColumns: 4, logicalSectors: 32n, fullRows: 8n, remainingDataSectors: 0n, parityRows: 8n, paritySectors: 16n, rawSectors: 48n, allocatedSectors: 48n, paddingSectors: 0n, sectorRoundingBytes: 0n, parityBytes: 65_536n, paddingBytes: 0n, physicalBytes: 196_608n, overheadBytes: 65_536n, efficiencyBasisPoints: 6_666n, allocationMultiplierMillionths: 1_500_000n }],
  ["FF-002", input({ blockSizeBytes: 8n * KiB }), { dataColumns: 4, logicalSectors: 2n, fullRows: 0n, remainingDataSectors: 2n, parityRows: 1n, paritySectors: 2n, rawSectors: 4n, allocatedSectors: 6n, paddingSectors: 2n, sectorRoundingBytes: 0n, parityBytes: 8_192n, paddingBytes: 8_192n, physicalBytes: 24_576n, overheadBytes: 16_384n, efficiencyBasisPoints: 3_333n, allocationMultiplierMillionths: 3_000_000n }],
  ["FF-003", input({ level: "raidz1", width: 3, blockSizeBytes: 4n * KiB }), { dataColumns: 2, logicalSectors: 1n, fullRows: 0n, remainingDataSectors: 1n, parityRows: 1n, paritySectors: 1n, rawSectors: 2n, allocatedSectors: 2n, paddingSectors: 0n, sectorRoundingBytes: 0n, parityBytes: 4_096n, paddingBytes: 0n, physicalBytes: 8_192n, overheadBytes: 4_096n, efficiencyBasisPoints: 5_000n, allocationMultiplierMillionths: 2_000_000n }],
  ["FF-004", input({ level: "raidz3", width: 6, blockSizeBytes: 8n * KiB }), { dataColumns: 3, logicalSectors: 2n, fullRows: 0n, remainingDataSectors: 2n, parityRows: 1n, paritySectors: 3n, rawSectors: 5n, allocatedSectors: 8n, paddingSectors: 3n, sectorRoundingBytes: 0n, parityBytes: 12_288n, paddingBytes: 12_288n, physicalBytes: 32_768n, overheadBytes: 24_576n, efficiencyBasisPoints: 2_500n, allocationMultiplierMillionths: 4_000_000n }],
  ["FF-005", input({ level: "raidz1", width: 2, blockSizeBytes: 512n }), { dataColumns: 1, logicalSectors: 1n, fullRows: 1n, remainingDataSectors: 0n, parityRows: 1n, paritySectors: 1n, rawSectors: 2n, allocatedSectors: 2n, paddingSectors: 0n, sectorRoundingBytes: 3_584n, parityBytes: 4_096n, paddingBytes: 0n, physicalBytes: 8_192n, overheadBytes: 7_680n, efficiencyBasisPoints: 625n, allocationMultiplierMillionths: 16_000_000n }],
  ["FF-006", input({ workload: "zvol", blockSizeBytes: 8n * KiB, ashift: 14 }), { dataColumns: 4, logicalSectors: 1n, fullRows: 0n, remainingDataSectors: 1n, parityRows: 1n, paritySectors: 2n, rawSectors: 3n, allocatedSectors: 3n, paddingSectors: 0n, sectorRoundingBytes: 8_192n, parityBytes: 32_768n, paddingBytes: 0n, physicalBytes: 49_152n, overheadBytes: 40_960n, efficiencyBasisPoints: 1_666n, allocationMultiplierMillionths: 6_000_000n }],
  ["FF-007", input({ level: "raidz3", width: 64, blockSizeBytes: 16n * MiB, ashift: 9 }), { dataColumns: 61, logicalSectors: 32_768n, fullRows: 537n, remainingDataSectors: 11n, parityRows: 538n, paritySectors: 1_614n, rawSectors: 34_382n, allocatedSectors: 34_384n, paddingSectors: 2n, sectorRoundingBytes: 0n, parityBytes: 826_368n, paddingBytes: 1_024n, physicalBytes: 17_604_608n, overheadBytes: 827_392n, efficiencyBasisPoints: 9_530n, allocationMultiplierMillionths: 1_049_316n }],
  ["FF-008", input({ width: 5 }), { dataColumns: 3, logicalSectors: 32n, fullRows: 10n, remainingDataSectors: 2n, parityRows: 11n, paritySectors: 22n, rawSectors: 54n, allocatedSectors: 54n, paddingSectors: 0n, sectorRoundingBytes: 0n, parityBytes: 90_112n, paddingBytes: 0n, physicalBytes: 221_184n, overheadBytes: 90_112n, efficiencyBasisPoints: 5_925n, allocationMultiplierMillionths: 1_687_500n }],
];

test("matches all locked allocation fixtures", () => {
  for (const [id, candidate, expected] of fixtures) {
    const actual = values(candidate);
    for (const [key, expectedValue] of Object.entries(expected)) {
      assert.equal(actual[key], expectedValue, `${id} ${key}`);
    }
    assert.equal(actual.physicalBytes, candidate.blockSizeBytes + actual.sectorRoundingBytes + actual.parityBytes + actual.paddingBytes, id);
  }
});

test("builds the exact nearby-size set without ranking", () => {
  const result = values(input({ blockSizeBytes: 8n * KiB }));
  assert.deepEqual(result.comparisons.map((row) => [row.blockSizeBytes, row.physicalBytes, row.efficiencyBasisPoints, row.selected]), [
    [2n * KiB, 12_288n, 1_666n, false],
    [4n * KiB, 12_288n, 3_333n, false],
    [8n * KiB, 24_576n, 3_333n, true],
    [16n * KiB, 24_576n, 6_666n, false],
    [32n * KiB, 49_152n, 6_666n, false],
  ]);
  assert.equal("best" in result, false);
  assert.equal("recommended" in result, false);
});

test("parses exact custom bytes and rejects ambiguous grammar", () => {
  assert.equal(parseZfsPaddingBlockSize("0.5", "KiB"), 512n);
  assert.equal(parseZfsPaddingBlockSize("0.00048828125", "MiB"), 512n);
  assert.equal(parseZfsPaddingBlockSize("512", "B"), 512n);
  for (const [value, unit] of [["", "B"], [" ", "B"], ["128 KiB", "B"], ["1e3", "B"], ["+1", "B"], ["-1", "B"], ["1,024", "B"], ["1_024", "B"], ["0x200", "B"], ["0512", "B"], ["0.1", "B"], ["0.0001", "KiB"]]) {
    assert.throws(() => parseZfsPaddingBlockSize(value, unit));
  }
});

test("rejects malformed enums, widths, values, bounds, and extra keys", () => {
  const invalid = [
    input({ level: "RAIDZ2" }), input({ level: "raidz" }), input({ workload: "dataset" }),
    input({ ashift: 11 }), input({ ashift: "12" }), input({ width: 2 }), input({ width: 65 }),
    input({ width: 6.5 }), input({ blockSizeBytes: 0n }), input({ blockSizeBytes: 511n }),
    input({ blockSizeBytes: 513n }), input({ blockSizeBytes: 32n * MiB }),
    input({ workload: "zvol", blockSizeBytes: 256n * KiB }),
    { ...input(), result: "hostile" },
  ];
  for (const candidate of invalid) {
    assert.equal(validateZfsPaddingInput(candidate), false);
    const result = calculateZfsPadding(candidate);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
  }
});

test("the shared primitive reconciles every result", () => {
  for (const parity of [1, 2, 3]) {
    for (const width of [parity + 1, parity + 4, 64]) {
      for (const ashift of [9, 12, 13, 14]) {
        for (const logicalBytes of [512n, 4n * KiB, 8n * KiB, 128n * KiB, 16n * MiB]) {
          const row = calculateRaidzAllocation({ logicalBytes, sectorBytes: 1n << BigInt(ashift), width, parity });
          assert.equal(row.allocatedSectors % BigInt(parity + 1), 0n);
          assert.ok(row.paddingSectors >= 0n && row.paddingSectors < BigInt(parity + 1));
          assert.equal(row.physicalBytes, logicalBytes + row.sectorRoundingBytes + row.parityBytes + row.paddingBytes);
        }
      }
    }
  }
});

test("shares input only and restores an identical result", () => {
  assert.equal(ZFS_PADDING_CALCULATION_VERSION, 1);
  assert.equal(ZFS_PADDING_INPUT_VERSION, 1);
  const candidate = input({ blockSizeBytes: 8n * KiB });
  const encoded = zfsPaddingCalculatorRegistry.encode("zfs-padding", candidate);
  const restored = zfsPaddingCalculatorRegistry.runEncoded(encoded);
  assert.deepEqual(restored, calculateZfsPadding(candidate));
  assert.throws(() => zfsPaddingCalculatorRegistry.runEncoded("not_base64!"));
});

test("copy summary contains exact inputs, result, and limitation", () => {
  const candidate = input({ blockSizeBytes: 8n * KiB });
  const summary = buildZfsPaddingCopySummary(candidate, values(candidate));
  for (const text of ["RAIDZ2", "6 members", "recordsize 8 KiB", "ashift 12", "8,192 B logical", "8,192 B parity", "8,192 B padding", "24,576 B physical", "33.33%", "3.00x", "theoretical", "formula v1"]) assert.match(summary, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.doesNotMatch(summary, /https?:\/\//);
});

test("is deterministic and stays within the performance budget", () => {
  let slowest = 0;
  for (const level of ["raidz1", "raidz2", "raidz3"]) {
    const parity = Number(level.at(-1));
    for (const width of [parity + 1, 8, 64]) {
      if (width < parity + 1) continue;
      for (const ashift of [9, 12, 13, 14]) {
        const candidate = input({ level, width, ashift, blockSizeBytes: 16n * MiB });
        const first = calculateZfsPadding(candidate);
        const started = performance.now();
        for (let count = 0; count < 10; count += 1) assert.deepEqual(calculateZfsPadding(candidate), first);
        slowest = Math.max(slowest, (performance.now() - started) / 10);
      }
    }
  }
  assert.ok(slowest < 10, `slowest sample was ${slowest.toFixed(3)}ms`);
});
