import { bytesFromUnit, formatBytes, type StorageCapacityUnit } from "./bytes.ts";
import { createStorageCalculatorRegistry } from "./calculator.ts";
import { createStorageCalculationResult } from "./result.ts";
import { calculateRaidzAllocation, type RaidzAllocation } from "./zfs-raidz-allocation.ts";
import { StorageValidationError, type StorageCalculationResult, type StorageIssue } from "./types.ts";

export const RAIDZ_EXPANSION_CALCULATION_VERSION = 1 as const;
export const RAIDZ_EXPANSION_INPUT_VERSION = 1 as const;
export const raidzExpansionLevels = ["raidz1", "raidz2", "raidz3"] as const;
export const raidzExpansionWorkloads = ["filesystem", "zvol"] as const;
export const raidzExpansionAshifts = [9, 12, 13, 14] as const;
export const raidzExpansionCapacityUnits = ["GB", "TB", "GiB", "TiB"] as const;

export type RaidzExpansionLevel = (typeof raidzExpansionLevels)[number];
export type RaidzExpansionWorkload = (typeof raidzExpansionWorkloads)[number];
export type RaidzExpansionAshift = (typeof raidzExpansionAshifts)[number];
export type RaidzExpansionCapacityUnit = (typeof raidzExpansionCapacityUnits)[number];

export type RaidzExpansionInput = Readonly<{
  level: RaidzExpansionLevel;
  currentWidth: number;
  finalWidth: number;
  memberBytes: bigint;
  addedDiskBytes: bigint;
  allocatedBytes: bigint;
  workload: RaidzExpansionWorkload;
  blockSizeBytes: bigint;
  ashift: RaidzExpansionAshift;
}>;

export type RaidzExpansionStep = Readonly<{
  width: number;
  commonRawBytes: bigint;
  freePhysicalBytes: bigint;
  blockPhysicalBytes: bigint;
  newBlockCount: bigint;
  newWritableLogicalBytes: bigint;
  immediateLogicalBytes: bigint;
  nativeBlockCount: bigint;
  nativeLogicalBytes: bigint;
  geometryGapBytes: bigint;
  immediateGainBytes: bigint;
  allocation: RaidzAllocation;
}>;

export type RaidzExpansionValues = Readonly<{
  level: RaidzExpansionLevel;
  parity: number;
  currentWidth: number;
  finalWidth: number;
  sectorBytes: bigint;
  alignedMemberBytes: bigint;
  oldBlockCount: bigint;
  oldLogicalBytes: bigint;
  occupancyRemainderBytes: bigint;
  addedDiskExcessBytes: bigint;
  totalAddedDiskExcessBytes: bigint;
  current: RaidzExpansionStep;
  steps: readonly RaidzExpansionStep[];
  final: RaidzExpansionStep;
  reportedCapacity: null;
}>;

const MAX_CAPACITY_BYTES = 10_000_000_000_000_000n;
const MIN_BLOCK_BYTES = 512n;
const FILESYSTEM_MAX_BYTES = 16n * 1_048_576n;
const ZVOL_MAX_BYTES = 128n * 1_024n;
const EDITOR_UNIT_BYTES: Readonly<Record<RaidzExpansionCapacityUnit, bigint>> = Object.freeze({
  GB: 1_000_000_000n,
  TB: 1_000_000_000_000n,
  GiB: 1_073_741_824n,
  TiB: 1_099_511_627_776n,
});
const levelSet = new Set<string>(raidzExpansionLevels);
const workloadSet = new Set<string>(raidzExpansionWorkloads);
const ashiftSet = new Set<number>(raidzExpansionAshifts);

const sources = Object.freeze([
  { title: "OpenZFS 2.3.0", url: "https://github.com/openzfs/zfs/releases/tag/zfs-2.3.0", checkedAt: "2026-08-13" },
  { title: "OpenZFS zpool-attach", url: "https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html", checkedAt: "2026-08-13" },
  { title: "OpenZFS RAIDZ", url: "https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html", checkedAt: "2026-08-13" },
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function issue(code: string, message: string, path: string): StorageIssue {
  return { code, severity: "error", message, path };
}

function parityFor(level: RaidzExpansionLevel) {
  return level === "raidz1" ? 1 : level === "raidz2" ? 2 : 3;
}

function isPowerOfTwo(value: bigint) {
  return value > 0n && (value & (value - 1n)) === 0n;
}

function inputIssues(input: unknown): StorageIssue[] {
  const keys = ["addedDiskBytes", "allocatedBytes", "ashift", "blockSizeBytes", "currentWidth", "finalWidth", "level", "memberBytes", "workload"];
  if (!isRecord(input) || Object.keys(input).length !== keys.length || !keys.every((key) => key in input)) {
    return [issue("invalid_input", "Configuration is invalid.", "form")];
  }
  const issues: StorageIssue[] = [];
  if (typeof input.level !== "string" || !levelSet.has(input.level)) issues.push(issue("invalid_level", "Choose a RAIDZ level.", "level"));
  if (typeof input.workload !== "string" || !workloadSet.has(input.workload)) issues.push(issue("invalid_workload", "Choose a workload.", "workload"));
  if (typeof input.ashift !== "number" || !ashiftSet.has(input.ashift)) issues.push(issue("invalid_ashift", "Choose a supported ashift.", "ashift"));
  const parity = typeof input.level === "string" && levelSet.has(input.level) ? parityFor(input.level as RaidzExpansionLevel) : 3;
  if (!Number.isSafeInteger(input.currentWidth) || (input.currentWidth as number) < parity + 1 || (input.currentWidth as number) > 63) {
    issues.push(issue("invalid_current_width", `Use ${parity + 1} to 63 members.`, "currentWidth"));
  }
  if (!Number.isSafeInteger(input.finalWidth) || (input.finalWidth as number) > 64) {
    issues.push(issue("invalid_final_width", "Use at most 64 members.", "finalWidth"));
  } else if (Number.isSafeInteger(input.currentWidth) && (input.finalWidth as number) <= (input.currentWidth as number)) {
    issues.push(issue("final_not_larger", "Must exceed current width.", "finalWidth"));
  }
  for (const [key, label] of [["memberBytes", "Member size"], ["addedDiskBytes", "Each added disk"]] as const) {
    const value = input[key];
    if (typeof value !== "bigint" || value <= 0n || value > MAX_CAPACITY_BYTES) issues.push(issue(`invalid_${key}`, `${label} is outside range.`, key));
  }
  if (typeof input.memberBytes === "bigint" && typeof input.addedDiskBytes === "bigint" && input.addedDiskBytes < input.memberBytes) {
    issues.push(issue("added_disk_too_small", "Each added disk is too small.", "addedDiskBytes"));
  }
  if (typeof input.allocatedBytes !== "bigint" || input.allocatedBytes < 0n) {
    issues.push(issue("invalid_allocation", "Enter physical allocation.", "allocatedBytes"));
  } else if (typeof input.memberBytes === "bigint" && Number.isSafeInteger(input.currentWidth) && typeof input.ashift === "number" && ashiftSet.has(input.ashift)) {
    const sector = 1n << BigInt(input.ashift);
    const aligned = input.memberBytes / sector * sector;
    if (input.allocatedBytes > aligned * BigInt(input.currentWidth as number)) issues.push(issue("allocation_too_large", "Allocation exceeds this vdev.", "allocatedBytes"));
  }
  if (typeof input.blockSizeBytes !== "bigint" || input.blockSizeBytes < MIN_BLOCK_BYTES || !isPowerOfTwo(input.blockSizeBytes)) {
    issues.push(issue("invalid_block_size", "Choose a power-of-two block size.", "blockSizeBytes"));
  } else if (typeof input.workload === "string" && workloadSet.has(input.workload)) {
    const maximum = input.workload === "filesystem" ? FILESYSTEM_MAX_BYTES : ZVOL_MAX_BYTES;
    if (input.blockSizeBytes > maximum) issues.push(issue("block_size_too_large", `${input.workload === "filesystem" ? "recordsize" : "volblocksize"} is too large.`, "blockSizeBytes"));
  }
  return issues;
}

export function validateRaidzExpansionInput(input: unknown): input is RaidzExpansionInput {
  return inputIssues(input).length === 0;
}

export function parseRaidzExpansionCapacity(value: string, unit: unknown) {
  if (value.length > 256 || typeof unit !== "string" || !raidzExpansionCapacityUnits.includes(unit as RaidzExpansionCapacityUnit)) throw new StorageValidationError("Capacity is invalid.");
  return bytesFromUnit(value, unit as StorageCapacityUnit);
}

function exactCapacityValue(bytes: bigint, unit: RaidzExpansionCapacityUnit) {
  const multiplier = EDITOR_UNIT_BYTES[unit];
  const whole = bytes / multiplier;
  let remainder = bytes % multiplier;
  if (remainder === 0n) return whole.toString();
  let fraction = "";
  while (remainder > 0n) {
    remainder *= 10n;
    fraction += (remainder / multiplier).toString();
    remainder %= multiplier;
  }
  return `${whole}.${fraction}`;
}

export function convertRaidzExpansionEditorCapacity(value: string, fromUnit: RaidzExpansionCapacityUnit, toUnit: RaidzExpansionCapacityUnit) {
  const bytes = parseRaidzExpansionCapacity(value, fromUnit);
  return { value: exactCapacityValue(bytes, toUnit), unit: toUnit } as const;
}

export function formatRaidzExpansionEditorCapacity(bytes: bigint): Readonly<{ value: string; unit: RaidzExpansionCapacityUnit }> {
  if (bytes < 0n) throw new StorageValidationError("Capacity cannot be negative.");
  const units = [
    ["TiB", 1_099_511_627_776n],
    ["TB", 1_000_000_000_000n],
    ["GiB", 1_073_741_824n],
    ["GB", 1_000_000_000n],
  ] as const;
  for (const [unit, multiplier] of units) {
    if (bytes > 0n && bytes % multiplier === 0n) return { value: (bytes / multiplier).toString(), unit };
  }
  const whole = bytes / 1_000_000_000n;
  const remainder = (bytes % 1_000_000_000n).toString().padStart(9, "0").replace(/0+$/, "");
  return { value: remainder ? `${whole}.${remainder}` : whole.toString(), unit: "GB" };
}

function invalidResult(issues: readonly StorageIssue[]): StorageCalculationResult<RaidzExpansionValues> {
  return createStorageCalculationResult({
    calculator: { id: "raidz-expansion", version: RAIDZ_EXPANSION_CALCULATION_VERSION },
    values: null, issues, assumptions: [], derivation: [], sources,
    uncertainty: { kind: "unknown", statement: "No result for invalid input." },
  });
}

export function calculateRaidzExpansion(input: unknown): StorageCalculationResult<RaidzExpansionValues> {
  const issues = inputIssues(input);
  if (issues.length > 0) return invalidResult(issues);
  const normalized = input as RaidzExpansionInput;
  const parity = parityFor(normalized.level);
  const sectorBytes = 1n << BigInt(normalized.ashift);
  const alignedMemberBytes = normalized.memberBytes / sectorBytes * sectorBytes;
  const initialAllocation = calculateRaidzAllocation({ logicalBytes: normalized.blockSizeBytes, sectorBytes, width: normalized.currentWidth, parity });
  const oldBlockCount = normalized.allocatedBytes / initialAllocation.physicalBytes;
  const oldLogicalBytes = oldBlockCount * normalized.blockSizeBytes;
  const occupancyRemainderBytes = normalized.allocatedBytes - oldBlockCount * initialAllocation.physicalBytes;

  const makeStep = (width: number): RaidzExpansionStep => {
    const allocation = calculateRaidzAllocation({ logicalBytes: normalized.blockSizeBytes, sectorBytes, width, parity });
    const commonRawBytes = alignedMemberBytes * BigInt(width);
    const freePhysicalBytes = commonRawBytes - normalized.allocatedBytes;
    const newBlockCount = freePhysicalBytes / allocation.physicalBytes;
    const newWritableLogicalBytes = newBlockCount * normalized.blockSizeBytes;
    const immediateLogicalBytes = oldLogicalBytes + newWritableLogicalBytes;
    const nativeBlockCount = commonRawBytes / allocation.physicalBytes;
    const nativeLogicalBytes = nativeBlockCount * normalized.blockSizeBytes;
    const preClampGap = nativeLogicalBytes - immediateLogicalBytes;
    if (preClampGap < 0n) throw new StorageValidationError("Expansion calculation did not reconcile.");
    return {
      width, commonRawBytes, freePhysicalBytes, blockPhysicalBytes: allocation.physicalBytes,
      newBlockCount, newWritableLogicalBytes, immediateLogicalBytes, nativeBlockCount,
      nativeLogicalBytes, geometryGapBytes: preClampGap, immediateGainBytes: 0n, allocation,
    };
  };
  const currentBase = makeStep(normalized.currentWidth);
  const current = { ...currentBase, immediateGainBytes: 0n };
  const steps = [];
  for (let width = normalized.currentWidth + 1; width <= normalized.finalWidth; width += 1) {
    const step = makeStep(width);
    steps.push({ ...step, immediateGainBytes: step.immediateLogicalBytes - current.immediateLogicalBytes });
  }
  const final = steps.at(-1)!;
  if (oldLogicalBytes + final.newWritableLogicalBytes + final.geometryGapBytes !== final.nativeLogicalBytes) throw new StorageValidationError("Expansion composition did not reconcile.");
  const addedDiskExcessBytes = normalized.addedDiskBytes - normalized.memberBytes;
  const values: RaidzExpansionValues = {
    level: normalized.level, parity, currentWidth: normalized.currentWidth, finalWidth: normalized.finalWidth,
    sectorBytes, alignedMemberBytes, oldBlockCount, oldLogicalBytes, occupancyRemainderBytes,
    addedDiskExcessBytes, totalAddedDiskExcessBytes: addedDiskExcessBytes * BigInt(normalized.finalWidth - normalized.currentWidth),
    current, steps, final, reportedCapacity: null,
  };
  return createStorageCalculationResult({
    calculator: { id: "raidz-expansion", version: RAIDZ_EXPANSION_CALCULATION_VERSION }, values,
    issues: [],
    assumptions: [
      { id: "one_generation", statement: "The current vdev has not been expanded." },
      { id: "no_writes", statement: "No allocations change between planned steps." },
      { id: "reported_unknown", statement: "Reported capacity remains unknown." },
    ],
    derivation: [
      { id: "old_blocks", expression: "allocated bytes divided by initial block allocation", result: oldBlockCount.toString() },
      { id: "occupancy_remainder", expression: "allocated bytes minus modelled old blocks", result: occupancyRemainderBytes.toString() },
      ...[current, ...steps].map((step) => ({ id: `width_${step.width}`, expression: "old logical plus new-width writable", result: step.immediateLogicalBytes.toString() })),
    ], sources, uncertainty: { kind: "modelled", statement: "Physical-allocation planning model." },
  });
}

export function formatRaidzExpansionBytes(bytes: bigint, unit: "TB" | "TiB") {
  if (bytes === 0n) return `0 ${unit}`;
  const formatted = formatBytes(bytes, unit, { maximumFractionDigits: 2 });
  return formatted === `0 ${unit}` ? `<0.01 ${unit}` : formatted;
}

export function buildRaidzExpansionLiveSummary(values: RaidzExpansionValues, _unit: "TB" | "TiB") {
  return `${values.final.immediateGainBytes} B gained; ${values.finalWidth} members; ${values.current.immediateLogicalBytes} B current; ${values.final.immediateLogicalBytes} B immediate; ${values.final.nativeLogicalBytes} B fresh; ${values.final.geometryGapBytes} B gap; ${values.level.toUpperCase()} unchanged; reported capacity unknown.`;
}

export function buildRaidzExpansionCopySummary(input: RaidzExpansionInput, values: RaidzExpansionValues, unit: "TB" | "TiB") {
  return [
    `${input.level.toUpperCase()} ${input.currentWidth} to ${input.finalWidth}; member ${input.memberBytes} B; each added disk ${input.addedDiskBytes} B; current physical allocation ${input.allocatedBytes} B; ${input.workload}; block ${input.blockSizeBytes} B; ashift ${input.ashift}.`,
    `Old logical ${values.oldLogicalBytes} B; current ${values.current.immediateLogicalBytes} B; immediate ${values.final.immediateLogicalBytes} B; fresh ${values.final.nativeLogicalBytes} B; gap ${values.final.geometryGapBytes} B (${formatRaidzExpansionBytes(values.final.geometryGapBytes, unit)}).`,
    `Unchanged parity; stays ${input.level.toUpperCase()}; reported capacity unknown. Current vdev has not been expanded. No allocations change between planned steps. Reported capacity remains unknown. Formula v${RAIDZ_EXPANSION_CALCULATION_VERSION}.`,
  ].join(" ");
}

export const raidzExpansionCalculatorAdapter = Object.freeze({
  calculatorId: "raidz-expansion", calculationVersion: RAIDZ_EXPANSION_CALCULATION_VERSION,
  inputVersion: RAIDZ_EXPANSION_INPUT_VERSION, validateInput: validateRaidzExpansionInput,
  calculate: calculateRaidzExpansion,
});
export const raidzExpansionCalculatorRegistry = createStorageCalculatorRegistry();
raidzExpansionCalculatorRegistry.register(raidzExpansionCalculatorAdapter);
