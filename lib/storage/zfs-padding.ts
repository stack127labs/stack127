import { bytesFromUnit, formatBytes, type StorageCapacityUnit } from "./bytes.ts";
import { createStorageCalculatorRegistry } from "./calculator.ts";
import { createStorageCalculationResult } from "./result.ts";
import { StorageValidationError, type StorageCalculationResult, type StorageIssue } from "./types.ts";
import { calculateRaidzAllocation, type RaidzAllocation } from "./zfs-raidz-allocation.ts";

export const ZFS_PADDING_CALCULATION_VERSION = 1 as const;
export const ZFS_PADDING_INPUT_VERSION = 1 as const;
export const zfsPaddingLevels = ["raidz1", "raidz2", "raidz3"] as const;
export const zfsPaddingWorkloads = ["filesystem", "zvol"] as const;
export const zfsPaddingAshifts = [9, 12, 13, 14] as const;
export const zfsPaddingUnits = ["B", "KiB", "MiB"] as const;

export type ZfsPaddingLevel = (typeof zfsPaddingLevels)[number];
export type ZfsPaddingWorkload = (typeof zfsPaddingWorkloads)[number];
export type ZfsPaddingAshift = (typeof zfsPaddingAshifts)[number];
export type ZfsPaddingUnit = (typeof zfsPaddingUnits)[number];

export type ZfsPaddingInput = Readonly<{
  level: ZfsPaddingLevel;
  width: number;
  workload: ZfsPaddingWorkload;
  blockSizeBytes: bigint;
  ashift: ZfsPaddingAshift;
}>;

export type ZfsPaddingComparison = Readonly<{
  blockSizeBytes: bigint;
  physicalBytes: bigint;
  efficiencyBasisPoints: bigint;
  selected: boolean;
}>;

export type ZfsPaddingValues = RaidzAllocation & Readonly<{
  level: ZfsPaddingLevel;
  width: number;
  parity: number;
  workload: ZfsPaddingWorkload;
  blockSizeBytes: bigint;
  sectorBytes: bigint;
  ashift: ZfsPaddingAshift;
  overheadBytes: bigint;
  efficiencyBasisPoints: bigint;
  allocationMultiplierMillionths: bigint;
  comparisons: readonly ZfsPaddingComparison[];
}>;

const levelSet = new Set<string>(zfsPaddingLevels);
const workloadSet = new Set<string>(zfsPaddingWorkloads);
const ashiftSet = new Set<number>(zfsPaddingAshifts);
const MIN_BLOCK_BYTES = 512n;
const FILESYSTEM_MAX_BYTES = 16n * 1_048_576n;
const ZVOL_MAX_BYTES = 128n * 1_024n;

const sources = Object.freeze([
  {
    title: "OpenZFS RAIDZ structure",
    url: "https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html",
    checkedAt: "2026-08-05",
  },
  {
    title: "OpenZFS vdev_raidz.c",
    url: "https://github.com/openzfs/zfs/blob/master/module/zfs/vdev_raidz.c",
    checkedAt: "2026-08-05",
  },
  {
    title: "OpenZFS workload tuning",
    url: "https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Workload%20Tuning.html",
    checkedAt: "2026-08-05",
  },
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function issue(code: string, message: string, path: string): StorageIssue {
  return { code, severity: "error", message, path };
}

function parityFor(level: ZfsPaddingLevel) {
  return level === "raidz1" ? 1 : level === "raidz2" ? 2 : 3;
}

function isPowerOfTwo(value: bigint) {
  return value > 0n && (value & (value - 1n)) === 0n;
}

function maxBlockSize(workload: ZfsPaddingWorkload) {
  return workload === "filesystem" ? FILESYSTEM_MAX_BYTES : ZVOL_MAX_BYTES;
}

function inputIssues(input: unknown): StorageIssue[] {
  if (!isRecord(input) || Object.keys(input).length !== 5
    || !["ashift", "blockSizeBytes", "level", "width", "workload"].every((key) => key in input)) {
    return [issue("invalid_input", "Configuration is invalid.", "form")];
  }
  const issues: StorageIssue[] = [];
  if (typeof input.level !== "string" || !levelSet.has(input.level)) {
    issues.push(issue("invalid_level", "Choose a RAIDZ level.", "level"));
  }
  if (typeof input.workload !== "string" || !workloadSet.has(input.workload)) {
    issues.push(issue("invalid_workload", "Choose a workload.", "workload"));
  }
  if (typeof input.ashift !== "number" || !ashiftSet.has(input.ashift)) {
    issues.push(issue("invalid_ashift", "Choose a supported ashift.", "ashift"));
  }
  if (!Number.isSafeInteger(input.width) || (input.width as number) < 1 || (input.width as number) > 64) {
    issues.push(issue("invalid_width", "Use 2 to 64 members.", "width"));
  } else if (typeof input.level === "string" && levelSet.has(input.level)) {
    const minimum = parityFor(input.level as ZfsPaddingLevel) + 1;
    if ((input.width as number) < minimum) {
      issues.push(issue("width_too_small", `${input.level.toUpperCase()} needs at least ${minimum} members.`, "width"));
    }
  }
  if (typeof input.blockSizeBytes !== "bigint") {
    issues.push(issue("invalid_block_size", "Enter a block size.", "blockSizeBytes"));
  } else if (input.blockSizeBytes < MIN_BLOCK_BYTES) {
    issues.push(issue("block_size_too_small", "Use at least 512 B.", "blockSizeBytes"));
  } else if (!isPowerOfTwo(input.blockSizeBytes)) {
    issues.push(issue("block_size_power", "Use a power of two.", "blockSizeBytes"));
  } else if (typeof input.workload === "string" && workloadSet.has(input.workload)
    && input.blockSizeBytes > maxBlockSize(input.workload as ZfsPaddingWorkload)) {
    const ceiling = input.workload === "filesystem" ? "16 MiB" : "128 KiB";
    issues.push(issue("block_size_too_large", `${input.workload === "filesystem" ? "recordsize" : "volblocksize"} stops at ${ceiling}.`, "blockSizeBytes"));
  }
  return issues;
}

export function validateZfsPaddingInput(input: unknown): input is ZfsPaddingInput {
  return inputIssues(input).length === 0;
}

export function parseZfsPaddingBlockSize(value: string, unit: ZfsPaddingUnit) {
  if (value.length > 256 || !zfsPaddingUnits.includes(unit)) {
    throw new StorageValidationError("Block size is invalid.");
  }
  return bytesFromUnit(value, unit as StorageCapacityUnit);
}

function calculateOne(input: ZfsPaddingInput, blockSizeBytes: bigint) {
  const parity = parityFor(input.level);
  const sectorBytes = 1n << BigInt(input.ashift);
  const allocation = calculateRaidzAllocation({
    logicalBytes: blockSizeBytes,
    sectorBytes,
    width: input.width,
    parity,
  });
  const overheadBytes = allocation.physicalBytes - blockSizeBytes;
  const efficiencyBasisPoints = blockSizeBytes * 10_000n / allocation.physicalBytes;
  const allocationMultiplierMillionths = allocation.physicalBytes * 1_000_000n / blockSizeBytes;
  return { parity, sectorBytes, allocation, overheadBytes, efficiencyBasisPoints, allocationMultiplierMillionths };
}

function nearbySizes(input: ZfsPaddingInput): readonly bigint[] {
  const maximum = maxBlockSize(input.workload);
  const powers: bigint[] = [];
  for (let value = MIN_BLOCK_BYTES; value <= maximum; value *= 2n) powers.push(value);
  const selected = powers.indexOf(input.blockSizeBytes);
  return Object.freeze(powers.slice(Math.max(0, selected - 2), Math.min(powers.length, selected + 3)));
}

function invalidResult(issues: readonly StorageIssue[]): StorageCalculationResult<ZfsPaddingValues> {
  return createStorageCalculationResult({
    calculator: { id: "zfs-padding", version: ZFS_PADDING_CALCULATION_VERSION },
    values: null,
    issues,
    assumptions: [],
    derivation: [],
    sources,
    uncertainty: { kind: "unknown", statement: "No result for invalid input." },
  });
}

export function calculateZfsPadding(input: unknown): StorageCalculationResult<ZfsPaddingValues> {
  const issues = inputIssues(input);
  if (issues.length > 0) return invalidResult(issues);
  const normalized = input as ZfsPaddingInput;
  const current = calculateOne(normalized, normalized.blockSizeBytes);
  const comparisons = nearbySizes(normalized).map((blockSizeBytes) => {
    const row = calculateOne(normalized, blockSizeBytes);
    return {
      blockSizeBytes,
      physicalBytes: row.allocation.physicalBytes,
      efficiencyBasisPoints: row.efficiencyBasisPoints,
      selected: blockSizeBytes === normalized.blockSizeBytes,
    };
  });

  return createStorageCalculationResult({
    calculator: { id: "zfs-padding", version: ZFS_PADDING_CALCULATION_VERSION },
    values: {
      level: normalized.level,
      width: normalized.width,
      parity: current.parity,
      workload: normalized.workload,
      blockSizeBytes: normalized.blockSizeBytes,
      sectorBytes: current.sectorBytes,
      ashift: normalized.ashift,
      ...current.allocation,
      overheadBytes: current.overheadBytes,
      efficiencyBasisPoints: current.efficiencyBasisPoints,
      allocationMultiplierMillionths: current.allocationMultiplierMillionths,
      comparisons,
    },
    issues: [],
    assumptions: [
      { id: "uncompressed", statement: "The block is uncompressed." },
      { id: "block_scope", statement: "This models one RAIDZ block." },
      { id: "pool_excluded", statement: "Pool-level effects are excluded." },
    ],
    derivation: [
      { id: "data_columns", expression: "width minus parity", result: `${current.allocation.dataColumns}` },
      { id: "logical_sectors", expression: "logical bytes rounded to sectors", result: `${current.allocation.logicalSectors}` },
      { id: "full_rows", expression: "logical sectors divided by data columns", result: `${current.allocation.fullRows}` },
      { id: "remainder", expression: "remaining data sectors", result: `${current.allocation.remainingDataSectors}` },
      { id: "parity_rows", expression: "full rows plus partial row", result: `${current.allocation.parityRows}` },
      { id: "parity_sectors", expression: "parity rows times parity", result: `${current.allocation.paritySectors}` },
      { id: "raw_sectors", expression: "data plus parity sectors", result: `${current.allocation.rawSectors}` },
      { id: "allocated_sectors", expression: "rounded to parity plus one", result: `${current.allocation.allocatedSectors}` },
      { id: "padding_sectors", expression: "allocated minus raw sectors", result: `${current.allocation.paddingSectors}` },
    ],
    sources,
    uncertainty: { kind: "modelled", statement: "Theoretical uncompressed block allocation." },
  });
}

function formatInteger(value: bigint) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPercentage(basisPoints: bigint) {
  return `${basisPoints / 100n}.${(basisPoints % 100n).toString().padStart(2, "0")}%`;
}

function formatMultiplier(millionths: bigint) {
  const hundredths = millionths / 10_000n;
  return `${hundredths / 100n}.${(hundredths % 100n).toString().padStart(2, "0")}x`;
}

export function formatZfsPaddingBytes(bytes: bigint) {
  if (bytes >= 1_048_576n) return formatBytes(bytes, "MiB", { maximumFractionDigits: 2 });
  if (bytes >= 1_024n) return formatBytes(bytes, "KiB", { maximumFractionDigits: 2 });
  return formatBytes(bytes, "B");
}

export function formatZfsPaddingPercentage(basisPoints: bigint) {
  return formatPercentage(basisPoints);
}

export function formatZfsPaddingMultiplier(millionths: bigint) {
  return formatMultiplier(millionths);
}

export function buildZfsPaddingCopySummary(input: ZfsPaddingInput, values: ZfsPaddingValues) {
  const property = input.workload === "filesystem" ? "recordsize" : "volblocksize";
  return [
    `${input.level.toUpperCase()}, ${input.width} members, ${property} ${formatZfsPaddingBytes(input.blockSizeBytes)}, ashift ${input.ashift} (${formatZfsPaddingBytes(values.sectorBytes)} sectors).`,
    `${formatInteger(input.blockSizeBytes)} B logical, ${formatInteger(values.sectorRoundingBytes)} B rounding, ${formatInteger(values.parityBytes)} B parity, ${formatInteger(values.paddingBytes)} B padding, ${formatInteger(values.physicalBytes)} B physical.`,
    `${formatPercentage(values.efficiencyBasisPoints)} efficiency, ${formatMultiplier(values.allocationMultiplierMillionths)} allocation.`,
    `Theoretical uncompressed block allocation, formula v${ZFS_PADDING_CALCULATION_VERSION}.`,
  ].join(" ");
}

export const zfsPaddingCalculatorAdapter = Object.freeze({
  calculatorId: "zfs-padding",
  calculationVersion: ZFS_PADDING_CALCULATION_VERSION,
  inputVersion: ZFS_PADDING_INPUT_VERSION,
  validateInput: validateZfsPaddingInput,
  calculate: calculateZfsPadding,
});

export const zfsPaddingCalculatorRegistry = createStorageCalculatorRegistry();
zfsPaddingCalculatorRegistry.register(zfsPaddingCalculatorAdapter);
