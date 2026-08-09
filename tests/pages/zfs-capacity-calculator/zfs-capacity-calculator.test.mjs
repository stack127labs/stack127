import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  MAX_DRIVE_CAPACITY_BYTES,
  bytesFromUnit,
  decodeStorageState,
} from "../../../lib/storage/index.ts";
import {
  ZFS_CALCULATION_VERSION,
  ZFS_INPUT_VERSION,
  buildZfsCommandTokens,
  calculateZfsPoolCapacity,
  validateZfsCalculatorInput,
  zfsCalculatorRegistry,
  zfsSlopBytes,
} from "../../../lib/storage/zfs.ts";

const KiB = 1_024n;
const MiB = 1_048_576n;
const GiB = 1_073_741_824n;
const TiB = 1_099_511_627_776n;

function drive(id, capacityBytes, role = "data", groupId = "vdev-1") {
  return { id, capacityBytes, role, groupId };
}

function vdev(type, capacities, id = "vdev-1") {
  return {
    id,
    type,
    drives: capacities.map((capacity, index) => drive(`${id}-drive-${index + 1}`, capacity, "data", id)),
  };
}

function baseInput(dataVdevs, overrides = {}) {
  return {
    dataVdevs,
    auxiliaryGroups: [],
    workload: "filesystem",
    blockSizeBytes: 128n * KiB,
    ashift: 12,
    slopShift: 5,
    reserveBasisPoints: 2_000,
    compressionRatio: null,
    ...overrides,
  };
}

function values(input) {
  const result = calculateZfsPoolCapacity(input);
  assert.equal(result.status, "valid", JSON.stringify(result.issues));
  assert.ok(result.values);
  return result.values;
}

test("parses exact decimal and binary capacities", () => {
  assert.equal(bytesFromUnit("1.5", "TB"), 1_500_000_000_000n);
  assert.equal(bytesFromUnit("1.5", "TiB"), 1_649_267_441_664n);
  assert.equal(bytesFromUnit("0.000000001", "GB"), 1n);
  for (const candidate of ["1e3", "-1", "0.1"]) {
    assert.throws(() => bytesFromUnit(candidate, candidate === "0.1" ? "B" : "GB"));
  }
});

test("matches the mirror fixtures exactly", () => {
  const normal = values(baseInput([vdev("mirror", [MiB, MiB])]));
  const first = normal.dataVdevs[0];
  assert.deepEqual({
    logicalSectors: first.logicalSectors,
    blockCount: first.blockCount,
    commonCapacityBytes: first.commonCapacityBytes,
    logicalDataBytes: first.logicalDataBytes,
    redundancyBytes: first.redundancyBytes,
    sectorRoundingBytes: first.sectorRoundingBytes,
    tailBytes: first.tailBytes,
  }, {
    logicalSectors: 32n,
    blockCount: 8n,
    commonCapacityBytes: 2n * MiB,
    logicalDataBytes: MiB,
    redundancyBytes: MiB,
    sectorRoundingBytes: 0n,
    tailBytes: 0n,
  });

  const small = values(baseInput([vdev("mirror", [MiB, MiB])], {
    ashift: 14,
    blockSizeBytes: 4n * KiB,
  })).dataVdevs[0];
  assert.equal(small.logicalSectors, 1n);
  assert.equal(small.blockCount, 64n);
  assert.equal(small.logicalDataBytes, 262_144n);
  assert.equal(small.redundancyBytes, MiB);
  assert.equal(small.sectorRoundingBytes, 786_432n);
  assert.equal(small.tailBytes, 0n);
});

test("matches RAIDZ1, RAIDZ2, and RAIDZ3 fixtures", () => {
  const cases = [
    ["raidz1", 3, 128n * KiB, { logicalSectors: 32n, paritySectors: 16n, allocatedSectors: 48n, blockCount: 16n, data: 2n * MiB, parity: MiB, padding: 0n, tail: 0n }],
    ["raidz1", 3, 4n * KiB, { logicalSectors: 1n, paritySectors: 1n, allocatedSectors: 2n, blockCount: 384n, data: 1_572_864n, parity: 1_572_864n, padding: 0n, tail: 0n }],
    ["raidz2", 6, 8n * KiB, { logicalSectors: 2n, paritySectors: 2n, allocatedSectors: 6n, blockCount: 256n, data: 2n * MiB, parity: 2n * MiB, padding: 2n * MiB, tail: 0n }],
    ["raidz2", 5, 128n * KiB, { logicalSectors: 32n, paritySectors: 22n, allocatedSectors: 54n, blockCount: 23n, data: 3_014_656n, parity: 2_072_576n, padding: 0n, tail: 155_648n }],
    ["raidz3", 4, 4n * KiB, { logicalSectors: 1n, paritySectors: 3n, allocatedSectors: 4n, blockCount: 256n, data: MiB, parity: 3n * MiB, padding: 0n, tail: 0n }],
  ];

  for (const [type, width, blockSizeBytes, expected] of cases) {
    const result = values(baseInput([vdev(type, Array(width).fill(MiB))], { blockSizeBytes })).dataVdevs[0];
    assert.equal(result.logicalSectors, expected.logicalSectors, type);
    assert.equal(result.paritySectors, expected.paritySectors, type);
    assert.equal(result.allocatedSectors, expected.allocatedSectors, type);
    assert.equal(result.blockCount, expected.blockCount, type);
    assert.equal(result.logicalDataBytes, expected.data, type);
    assert.equal(result.redundancyBytes, expected.parity, type);
    assert.equal(result.raidzPaddingBytes, expected.padding, type);
    assert.equal(result.tailBytes, expected.tail, type);
  }
});

test("keeps mixed-size and alignment losses inside each vdev", () => {
  const mixed = values(baseInput([
    vdev("mirror", [1_048_577n, 2_101_247n], "mirror-1"),
    vdev("raidz1", [3n * MiB, 3n * MiB, 4n * MiB], "raidz-1"),
  ], { blockSizeBytes: 4n * KiB }));
  const mirror = mixed.dataVdevs[0];
  assert.equal(mirror.alignmentLossBytes, 4_096n);
  assert.equal(mirror.mixedSizeWasteBytes, MiB);
  assert.equal(mirror.logicalDataBytes, MiB);
  assert.equal(mirror.redundancyBytes, MiB);
  assert.equal(mirror.enteredCapacityBytes, 3_149_824n);
  assert.equal(mixed.dataVdevs[1].mixedSizeWasteBytes, MiB);
  assert.equal(
    mixed.rawDataCapacityBytes.value,
    mixed.dataBeforeSlopBytes.value
      + mixed.losses.alignmentBytes
      + mixed.losses.mixedSizeBytes
      + mixed.losses.redundancyBytes
      + mixed.losses.sectorRoundingBytes
      + mixed.losses.raidzPaddingBytes
      + mixed.losses.tailBytes,
  );
});

test("uses the documented slop branches and custom shift", () => {
  assert.deepEqual(
    [64n * MiB, 256n * MiB, 4n * GiB, 8n * GiB, 4n * TiB, 8n * TiB].map((size) => zfsSlopBytes(size, 5)),
    [33_554_432n, 134_217_728n, 134_217_728n, 268_435_456n, 137_438_953_472n, 137_438_953_472n],
  );
  assert.equal(zfsSlopBytes(TiB, 5), 34_359_738_368n);
  assert.equal(zfsSlopBytes(TiB, 4), 68_719_476_736n);
});

test("keeps headroom and compression separate", () => {
  const result = values(baseInput([
    vdev("mirror", [MiB, MiB], "mirror-1"),
    vdev("raidz1", [MiB, MiB, MiB], "raidz-1"),
  ], { compressionRatio: { numerator: 150, denominator: 100 } }));
  assert.equal(result.dataBeforeSlopBytes.value, 3_145_728n);
  assert.equal(result.slopBytes.value, 1_572_864n);
  assert.equal(result.estimatedWritableBytes.value, 1_572_864n);
  assert.equal(result.planningReserveBytes.value, 314_572n);
  assert.equal(result.planningTargetBytes.value, 1_258_292n);
  assert.equal(result.conditionalLogicalBytes.value, 1_887_438n);

  const noReserve = values(baseInput([vdev("mirror", [TiB, TiB])], { reserveBasisPoints: 0 }));
  const halfReserve = values(baseInput([vdev("mirror", [TiB, TiB])], { reserveBasisPoints: 5_000 }));
  assert.equal(noReserve.estimatedWritableBytes.value, halfReserve.estimatedWritableBytes.value);
  assert.notEqual(noReserve.planningTargetBytes.value, halfReserve.planningTargetBytes.value);
});

test("isolates auxiliary roles and special capacity", () => {
  const baseline = baseInput([vdev("mirror", [4n * TiB, 4n * TiB])]);
  const withRoles = {
    ...baseline,
    auxiliaryGroups: [
      { id: "spare-1", role: "spare", layout: "single", drives: [drive("spare-drive-1", 4n * TiB, "spare", "spare-1")] },
      { id: "cache-1", role: "l2arc", layout: "single", drives: [drive("cache-drive-1", TiB, "l2arc", "cache-1")] },
      { id: "log-1", role: "slog", layout: "single", drives: [drive("log-drive-1", 32n * GiB, "slog", "log-1")] },
      { id: "log-2", role: "slog", layout: "mirror", drives: [drive("log-drive-2", 32n * GiB, "slog", "log-2"), drive("log-drive-3", 64n * GiB, "slog", "log-2")] },
      { id: "special-1", role: "special", layout: "mirror", drives: [drive("special-drive-1", TiB, "special", "special-1"), drive("special-drive-2", 2n * TiB, "special", "special-1")] },
    ],
  };
  const plain = values(baseline);
  const roles = values(withRoles);
  assert.equal(roles.estimatedWritableBytes.value, plain.estimatedWritableBytes.value);
  assert.equal(roles.planningTargetBytes.value, plain.planningTargetBytes.value);
  assert.equal(roles.specialVdevs[0].envelopeBytes, TiB);
  assert.equal(roles.specialVdevs[0].mixedSizeWasteBytes, TiB);
  assert.equal(roles.roleInventory.find((row) => row.role === "spare").generalDataBytes, 0n);
  assert.equal(roles.roleInventory.find((row) => row.role === "slog").generalDataBytes, 0n);
  assert.equal(roles.roleInventory.find((row) => row.role === "l2arc").generalDataBytes, 0n);
});

test("rejects invalid topology and assumption boundaries", () => {
  const invalid = [
    baseInput([]),
    baseInput([vdev("mirror", [MiB])]),
    baseInput([vdev("raidz1", [MiB])]),
    baseInput([vdev("raidz2", [MiB, MiB])]),
    baseInput([vdev("raidz3", [MiB, MiB, MiB])]),
    baseInput([vdev("mirror", [0n, MiB])]),
    baseInput([vdev("mirror", [MAX_DRIVE_CAPACITY_BYTES + 1n, MiB])]),
    baseInput([vdev("mirror", [MiB, MiB])], { ashift: 11 }),
    baseInput([vdev("mirror", [MiB, MiB])], { slopShift: 0 }),
    baseInput([vdev("mirror", [MiB, MiB])], { reserveBasisPoints: 5_001 }),
    baseInput([vdev("mirror", [MiB, MiB])], { compressionRatio: { numerator: 99, denominator: 100 } }),
  ];
  for (const candidate of invalid) {
    const result = calculateZfsPoolCapacity(candidate);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.equal(validateZfsCalculatorInput(candidate), false);
  }
});

test("rejects duplicate identifiers and excessive inventory", () => {
  const duplicate = baseInput([
    vdev("mirror", [MiB, MiB], "same"),
    vdev("mirror", [MiB, MiB], "same"),
  ]);
  assert.equal(calculateZfsPoolCapacity(duplicate).status, "invalid");

  const tooWide = baseInput([vdev("raidz1", Array(65).fill(MiB))]);
  assert.equal(calculateZfsPoolCapacity(tooWide).status, "invalid");

  const tooMany = baseInput(Array.from({ length: 17 }, (_, index) => (
    vdev("raidz1", Array(64).fill(MiB), `vdev-${index + 1}`)
  )));
  assert.equal(calculateZfsPoolCapacity(tooMany).status, "invalid");
});

test("reconciles deterministic mirror and RAIDZ matrices", () => {
  for (const ashift of [9, 12, 13, 14]) {
    for (const blockSizeBytes of [4n * KiB, 8n * KiB, 16n * KiB, 128n * KiB]) {
      for (const type of ["mirror", "raidz1", "raidz2", "raidz3"]) {
        const minimum = type === "mirror" || type === "raidz1" ? 2 : type === "raidz2" ? 3 : 4;
        for (const width of [minimum, Math.min(64, minimum + 3), 64]) {
          const capacities = Array.from({ length: width }, (_, index) => MiB + BigInt(index % 3));
          const result = values(baseInput([vdev(type, capacities)], { ashift, blockSizeBytes })).dataVdevs[0];
          assert.equal(
            result.enteredCapacityBytes,
            result.logicalDataBytes
              + result.redundancyBytes
              + result.sectorRoundingBytes
              + result.raidzPaddingBytes
              + result.tailBytes
              + result.mixedSizeWasteBytes
              + result.alignmentLossBytes,
            `${type}, width ${width}, ashift ${ashift}`,
          );
          if (type.startsWith("raidz")) {
            assert.equal(result.allocatedSectors % BigInt(result.parityCount + 1), 0n);
          }
        }
      }
    }
  }
});

test("round-trips versioned state without serializing results", () => {
  const input = baseInput([
    vdev("mirror", [4n * TiB, 8n * TiB], "mirror-1"),
    vdev("raidz2", [18n * TiB, 18n * TiB, 18n * TiB], "raidz-1"),
  ], { compressionRatio: { numerator: 150, denominator: 100 } });
  const encoded = zfsCalculatorRegistry.encode("zfs-pool-capacity", input);
  const state = decodeStorageState(encoded);
  assert.equal(state.calculatorVersion, ZFS_CALCULATION_VERSION);
  assert.equal(state.inputVersion, ZFS_INPUT_VERSION);
  assert.equal(state.payload.dataVdevs[0].drives[0].capacityBytes, 4n * TiB);
  assert.equal(Object.hasOwn(state.payload, "values"), false);
  assert.deepEqual(zfsCalculatorRegistry.runEncoded(encoded).values, calculateZfsPoolCapacity(input).values);
});

test("builds a placeholder-only dry-run command", () => {
  const input = baseInput([
    vdev("mirror", [MiB, MiB], "mirror-1"),
    vdev("raidz2", [MiB, MiB, MiB], "raidz-1"),
  ], {
    auxiliaryGroups: [
      { id: "log-1", role: "slog", layout: "mirror", drives: [drive("log-a", GiB, "slog", "log-1"), drive("log-b", GiB, "slog", "log-1")] },
      { id: "cache-1", role: "l2arc", layout: "single", drives: [drive("cache-a", GiB, "l2arc", "cache-1")] },
      { id: "spare-1", role: "spare", layout: "single", drives: [drive("spare-a", GiB, "spare", "spare-1")] },
      { id: "special-1", role: "special", layout: "mirror", drives: [drive("special-a", GiB, "special", "special-1"), drive("special-b", GiB, "special", "special-1")] },
    ],
  });
  const tokens = buildZfsCommandTokens(input);
  assert.deepEqual(tokens.slice(0, 8), ["zpool", "create", "-n", "-o", "ashift=12", "<pool-name>", "mirror", "<data-vdev-1-drive-1>"]);
  const command = tokens.join(" ");
  for (const required of ["raidz2", "log mirror", "cache", "spare", "special mirror"]) assert.match(command, new RegExp(required));
  for (const forbidden of [" -f ", "/dev/", "\n", ";", "&&", "|"]) assert.equal(command.includes(forbidden), false, forbidden);
});

test("calculates the 256-drive UI maximum within budget", () => {
  const input = baseInput(Array.from({ length: 64 }, (_, vdevIndex) => (
    vdev("raidz2", Array(4).fill(18n * 1_000_000_000_000n), `vdev-${vdevIndex + 1}`)
  )), { blockSizeBytes: 16n * KiB, ashift: 13, reserveBasisPoints: 1_750 });
  calculateZfsPoolCapacity(input);
  const samples = [];
  for (let index = 0; index < 10; index += 1) {
    const start = performance.now();
    const result = calculateZfsPoolCapacity(input);
    samples.push(performance.now() - start);
    assert.equal(result.status, "valid");
  }
  assert.ok(Math.max(...samples) < 50, `slowest sample was ${Math.max(...samples).toFixed(2)} ms`);
});
