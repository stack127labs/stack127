import { bytesFromUnit, formatBytes } from "../../../../../lib/storage/bytes.ts";
import { createStorageCalculationResult, storageValue } from "../../../../../lib/storage/result.ts";
import { decodeStorageState, encodeStorageState } from "../../../../../lib/storage/state.ts";
import {
  MAX_DRIVE_CAPACITY_BYTES,
  StorageStateError,
  StorageValidationError,
  type StorageCalculationResult,
  type StorageIssue,
  type StorageStateEnvelope,
  type StorageValue,
} from "../../../../../lib/storage/types.ts";

export { bytesFromUnit, MAX_DRIVE_CAPACITY_BYTES };

export const UNRAID_CALCULATOR_ID = "unraid-main-array" as const;
export const UNRAID_CALCULATION_VERSION = 1 as const;
export const UNRAID_INPUT_VERSION = 1 as const;
export const UNRAID_CURRENT_ROW_LIMIT = 64 as const;

export const unraidInputUnits = ["GB", "TB", "GiB", "TiB"] as const;
export type UnraidInputUnit = (typeof unraidInputUnits)[number];
export type UnraidOutputUnit = "TB" | "TiB";
export type UnraidParityMode = "none" | "single" | "dual";

export type UnraidRoleInput = Readonly<{
  id: string;
  capacityBytes: bigint;
}>;

export type UnraidCalculatorInput = Readonly<{
  parityMode: UnraidParityMode;
  parity: readonly UnraidRoleInput[];
  data: readonly UnraidRoleInput[];
  proposed: UnraidRoleInput | null;
}>;

type UnraidProtection = Readonly<{
  mode: UnraidParityMode;
  guaranteedFailures: number;
  statement: string;
}>;

type UnraidGrowth = Readonly<{
  status: "absent";
  dependencies: readonly string[];
}> | Readonly<{
  status: "eligible";
  proposedCapacityBytes: bigint;
  capacityGainBytes: bigint;
  projectedDataCapacityBytes: bigint;
  projectedRawInstalledCapacityBytes: bigint;
  dependencies: readonly string[];
}> | Readonly<{
  status: "blocked";
  proposedCapacityBytes: bigint;
  dependencies: readonly string[];
}>;

export type UnraidCalculationValues = Readonly<{
  dataCapacityBytes: StorageValue<bigint>;
  assignedParityCapacityBytes: StorageValue<bigint>;
  rawInstalledCapacityBytes: StorageValue<bigint>;
  largestDataDriveBytes: bigint;
  parityFloorBytes: bigint | null;
  parityHeadroomBytes: bigint;
  protection: UnraidProtection;
  topology: readonly Readonly<{
    id: string;
    role: "parity" | "data";
    capacityBytes: bigint;
  }>[];
  growth: UnraidGrowth;
}>;

export type UnraidCalculationResult = StorageCalculationResult<UnraidCalculationValues>;

const calculator = Object.freeze({
  id: UNRAID_CALCULATOR_ID,
  version: UNRAID_CALCULATION_VERSION,
});

const sources = Object.freeze([
  {
    title: "Unraid Arrays overview",
    url: ["https://docs.unraid.net", "/unraid-os/using-unraid-to/manage-storage/array/overview/"].join(""),
    checkedAt: "2026-08-23",
  },
  {
    title: "Unraid adding disks to array",
    url: ["https://docs.unraid.net", "/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/"].join(""),
    checkedAt: "2026-08-23",
  },
  {
    title: "Unraid replacing disks in array",
    url: ["https://docs.unraid.net", "/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/"].join(""),
    checkedAt: "2026-08-23",
  },
  {
    title: "BIPM SI prefixes and NIST binary prefixes",
    url: "https://www.bipm.org/en/measurement-units/si-prefixes",
    checkedAt: "2026-08-23",
  },
] as const);

const assumptions = Object.freeze([
  { id: "array-level", statement: "This is array-level data capacity." },
  { id: "explicit-roles", statement: "Entered parity and data roles stay explicit." },
  { id: "filesystem-unknown", statement: "Filesystem-visible space remains unknown." },
  { id: "parity-not-backup", statement: "Parity is redundancy, not a backup." },
] as const);

function baseMetadata() {
  return {
    calculator,
    assumptions,
    sources,
    uncertainty: {
      kind: "exact" as const,
      statement: "Exact for the entered array-level role model.",
    },
  };
}

function issue(code: string, message: string, path?: string): StorageIssue {
  return { code, severity: "error", message, ...(path ? { path } : {}) };
}

function invalidResult(issues: readonly StorageIssue[]): UnraidCalculationResult {
  return createStorageCalculationResult({
    ...baseMetadata(),
    values: null,
    issues: issues.length > 0 ? issues : [issue("invalid-input", "Enter a valid array.")],
    derivation: [],
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const expected = new Set(keys);
  return Object.keys(value).length === expected.size && Object.keys(value).every((key) => expected.has(key));
}

function validRole(value: unknown, role: "parity" | "data" | "proposed", path: string, issues: StorageIssue[]) {
  if (!isRecord(value) || !hasExactKeys(value, ["id", "capacityBytes"])) {
    issues.push(issue("invalid-role", "Role row is invalid.", path));
    return null;
  }
  if (typeof value.id !== "string") {
    issues.push(issue("invalid-role-id", "Role row needs an ID.", path));
    return null;
  }
  const pattern = role === "parity" ? /^parity-\d+$/ : role === "data" ? /^data-\d+$/ : /^proposed-data-1$/;
  if (!pattern.test(value.id)) {
    issues.push(issue("invalid-role-id", "Role ID is invalid.", path));
  }
  if (typeof value.capacityBytes !== "bigint" || value.capacityBytes <= 0n) {
    issues.push(issue("invalid-capacity", "Capacity must be positive whole bytes.", path));
  } else if (value.capacityBytes > MAX_DRIVE_CAPACITY_BYTES) {
    issues.push(issue("capacity-too-large", "Capacity exceeds the per-drive limit.", path));
  }
  return { id: value.id, capacityBytes: value.capacityBytes } as UnraidRoleInput;
}

function inputIssues(value: unknown): StorageIssue[] {
  const issues: StorageIssue[] = [];
  if (!isRecord(value) || !hasExactKeys(value, ["parityMode", "parity", "data", "proposed"])) {
    return [issue("invalid-input", "Array input shape is invalid.")];
  }
  if (value.parityMode !== "none" && value.parityMode !== "single" && value.parityMode !== "dual") {
    issues.push(issue("invalid-parity-mode", "Choose none, single, or dual parity.", "parityMode"));
  }
  const parity = Array.isArray(value.parity) ? value.parity : [];
  const data = Array.isArray(value.data) ? value.data : [];
  if (!Array.isArray(value.parity)) issues.push(issue("invalid-parity-rows", "Parity rows are invalid.", "parity"));
  if (!Array.isArray(value.data)) issues.push(issue("invalid-data-rows", "Data rows are invalid.", "data"));

  const expectedParityCount = value.parityMode === "none" ? 0 : value.parityMode === "single" ? 1 : 2;
  if (parity.length !== expectedParityCount) {
    issues.push(issue("parity-count-mismatch", "Parity row count is invalid.", "parity"));
  }
  if (data.length < 1) issues.push(issue("data-required", "Add at least one data drive.", "data"));
  if (parity.length + data.length > UNRAID_CURRENT_ROW_LIMIT) {
    issues.push(issue("row-limit", "Current roles exceed the 64-row limit."));
  }
  if (data.length > UNRAID_CURRENT_ROW_LIMIT - expectedParityCount) {
    issues.push(issue("data-row-limit", "Data rows exceed the current-array limit.", "data"));
  }

  const seen = new Set<string>();
  const checkRows = (rows: readonly unknown[], role: "parity" | "data", path: string) => {
    rows.forEach((row, index) => {
      const parsed = validRole(row, role, `${path}[${index}]`, issues);
      if (!parsed) return;
      if (seen.has(parsed.id)) issues.push(issue("duplicate-role-id", "Role IDs must be unique.", `${path}[${index}]`));
      seen.add(parsed.id);
    });
  };
  checkRows(parity, "parity", "parity");
  checkRows(data, "data", "data");

  if (value.proposed !== null) {
    const parsed = validRole(value.proposed, "proposed", "proposed", issues);
    if (parsed && seen.has(parsed.id)) issues.push(issue("duplicate-role-id", "Role IDs must be unique.", "proposed"));
  }
  return issues;
}

export function validateUnraidCalculatorInput(value: unknown): value is UnraidCalculatorInput {
  return inputIssues(value).length === 0;
}

export function parseUnraidCapacity(value: string, unit: UnraidInputUnit): Readonly<{ bytes: bigint }> {
  if (!unraidInputUnits.includes(unit)) throw new StorageValidationError("Unsupported capacity unit.");
  if (typeof value !== "string" || !value.trim()) throw new StorageValidationError("Capacity is required.");
  const bytes = bytesFromUnit(value.trim(), unit);
  if (bytes <= 0n) throw new StorageValidationError("Capacity must be positive.");
  if (bytes > MAX_DRIVE_CAPACITY_BYTES) throw new StorageValidationError("Capacity exceeds the per-drive limit.");
  return { bytes };
}

function sum(rows: readonly UnraidRoleInput[]) {
  return rows.reduce((total, row) => total + row.capacityBytes, 0n);
}

function maxCapacity(rows: readonly UnraidRoleInput[]) {
  return rows.reduce((largest, row) => row.capacityBytes > largest ? row.capacityBytes : largest, 0n);
}

function value(label: string, bytes: bigint, explanation: string): StorageValue<bigint> {
  return storageValue({ label, value: bytes, unit: "bytes", classification: "theoretical", explanation });
}

export function calculateUnraidCapacity(valueToCalculate: unknown): UnraidCalculationResult {
  const issues = inputIssues(valueToCalculate);
  if (issues.length > 0) return invalidResult(issues);
  const candidate = valueToCalculate as UnraidCalculatorInput;
  const dataCapacity = sum(candidate.data);
  const assignedParity = sum(candidate.parity);
  const rawInstalled = dataCapacity + assignedParity;
  const largestData = maxCapacity(candidate.data);
  const parityFloor = candidate.parity.length > 0
    ? candidate.parity.reduce((smallest, row) => row.capacityBytes < smallest ? row.capacityBytes : smallest, candidate.parity[0].capacityBytes)
    : null;
  const parityIssues = candidate.parity
    .filter((row) => row.capacityBytes < largestData)
    .map((row) => issue(
      "parity-too-small",
      "Must be at least as large as the largest data drive.",
      row.id,
    ));
  if (parityIssues.length > 0) return invalidResult(parityIssues);

  const parityHeadroom = candidate.parity.reduce(
    (total, row) => total + (row.capacityBytes > largestData ? row.capacityBytes - largestData : 0n),
    0n,
  );
  let growth: UnraidGrowth = { status: "absent", dependencies: [] };
  if (candidate.proposed) {
    const proposed = candidate.proposed.capacityBytes;
    const dependencies = candidate.parity.filter((row) => row.capacityBytes < proposed).map((row) => row.id);
    if (dependencies.length > 0) {
      growth = { status: "blocked", proposedCapacityBytes: proposed, dependencies };
    } else {
      growth = {
        status: "eligible",
        proposedCapacityBytes: proposed,
        capacityGainBytes: proposed,
        projectedDataCapacityBytes: dataCapacity + proposed,
        projectedRawInstalledCapacityBytes: rawInstalled + proposed,
        dependencies: [],
      };
    }
  }

  const protection: UnraidProtection = candidate.parityMode === "none"
    ? { mode: "none", guaranteedFailures: 0, statement: "No parity protection." }
    : candidate.parityMode === "single"
      ? { mode: "single", guaranteedFailures: 1, statement: "One drive failure under the parity model." }
      : { mode: "dual", guaranteedFailures: 2, statement: "Two drive failures under the parity model." };
  const topology = [
    ...candidate.parity.map((row) => ({ ...row, role: "parity" as const })),
    ...candidate.data.map((row) => ({ ...row, role: "data" as const })),
  ];

  return createStorageCalculationResult({
    ...baseMetadata(),
    values: {
      dataCapacityBytes: value("Data capacity", dataCapacity, "Sum of current data roles."),
      assignedParityCapacityBytes: value("Assigned parity capacity", assignedParity, "Sum of current parity roles."),
      rawInstalledCapacityBytes: value("Raw installed capacity", rawInstalled, "Data plus assigned parity."),
      largestDataDriveBytes: largestData,
      parityFloorBytes: parityFloor,
      parityHeadroomBytes: parityHeadroom,
      protection,
      topology,
      growth,
    },
    issues: candidate.proposed && growth.status === "blocked"
      ? [{
        code: "growth-blocked",
        severity: "warning",
        message: "Upgrade parity before proposed drive.",
        path: "proposed",
      }]
      : [],
    derivation: [
      { id: "data-sum", expression: "sum(data roles)", result: "data capacity" },
      { id: "parity-sum", expression: "sum(parity roles)", result: "assigned parity capacity" },
      { id: "raw-sum", expression: "data capacity + assigned parity capacity", result: "raw installed capacity" },
    ],
  });
}

export function encodeUnraidState(input: UnraidCalculatorInput) {
  if (!validateUnraidCalculatorInput(input)) throw new StorageStateError("invalid_payload", "Unraid input is invalid.");
  return encodeStorageState({
    calculatorId: UNRAID_CALCULATOR_ID,
    calculatorVersion: UNRAID_CALCULATION_VERSION,
    inputVersion: UNRAID_INPUT_VERSION,
    payload: input,
  });
}

export function decodeUnraidState(encoded: string): StorageStateEnvelope<UnraidCalculatorInput> {
  const state = decodeStorageState(encoded);
  if (state.calculatorId !== UNRAID_CALCULATOR_ID) {
    throw new StorageStateError("wrong_calculator", "Storage state belongs to another calculator.");
  }
  if (state.calculatorVersion !== UNRAID_CALCULATION_VERSION || state.inputVersion !== UNRAID_INPUT_VERSION) {
    throw new StorageStateError("unsupported_version", "Storage state uses an unsupported calculator version.");
  }
  if (!validateUnraidCalculatorInput(state.payload)) {
    throw new StorageStateError("invalid_payload", "Storage state contains invalid array input.");
  }
  return state as StorageStateEnvelope<UnraidCalculatorInput>;
}

export function formatUnraidBytes(bytes: bigint, unit: UnraidOutputUnit) {
  return formatBytes(bytes, unit, { maximumFractionDigits: 2 });
}
