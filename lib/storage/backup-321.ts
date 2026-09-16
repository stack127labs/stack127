import { formatBytes } from "./bytes.ts";
import { createStorageCalculatorRegistry } from "./calculator.ts";
import { createStorageCalculationResult, storageValue } from "./result.ts";
import { decodeStorageState, encodeStorageState } from "./state.ts";
import {
  STORAGE_ENGINE_VERSION,
  StorageStateError,
  type StorageCalculationResult,
  type StorageIssue,
  type StorageValue,
} from "./types.ts";

export const BACKUP_321_CALCULATOR_ID = "backup-321-capacity" as const;
export const BACKUP_321_CALCULATION_VERSION = 1 as const;
export const BACKUP_321_INPUT_VERSION = 1 as const;
export const BACKUP_321_VERSION = BACKUP_321_CALCULATION_VERSION;

export const BACKUP_321_SOURCE_UNITS = ["GB", "TB", "GiB", "TiB"] as const;
export type Backup321SourceUnit = (typeof BACKUP_321_SOURCE_UNITS)[number];
export const BACKUP_321_DISPLAY_UNITS = ["TB", "TiB"] as const;
export type Backup321DisplayUnit = (typeof BACKUP_321_DISPLAY_UNITS)[number];
export const BACKUP_321_MODELS = ["full-only", "full-plus-incremental"] as const;
export type Backup321Model = (typeof BACKUP_321_MODELS)[number];

export type Backup321Input = Readonly<{
  sourceData: string;
  sourceUnit: Backup321SourceUnit;
  annualGrowth: string;
  horizonYears: string;
  backupModel: Backup321Model;
  retainedPoints: string;
  changedPerBackup: string;
  headroom: string;
  recoveryChecksEnabled: boolean;
  backupIntervalHours: string;
  targetRpoHours: string;
  targetRtoHours: string;
  localRestoreMbps: string;
  offsiteRestoreMbps: string;
  transferEfficiency: string;
  displayUnit: Backup321DisplayUnit;
}>;

export type Backup321RecoveryValues = Readonly<{
  rpoPasses: boolean;
  localRestoreSeconds: StorageValue<bigint>;
  offsiteRestoreSeconds: StorageValue<bigint>;
  localRtoPasses: boolean;
  offsiteRtoPasses: boolean;
}>;

export type Backup321CopyRelationship = Readonly<{
  positions: Readonly<{ source: 1; localTarget: 2; offsiteTarget: 3 }>;
  limitation: string;
}>;

export type Backup321CalculationValues = Readonly<{
  calculatorId: typeof BACKUP_321_CALCULATOR_ID;
  calculationVersion: typeof BACKUP_321_CALCULATION_VERSION;
  inputVersion: typeof BACKUP_321_INPUT_VERSION;
  engineVersion: typeof STORAGE_ENGINE_VERSION;
  sourceBytes: StorageValue<bigint>;
  growthSeriesBytes: readonly bigint[];
  projectedSourceBytes: StorageValue<bigint>;
  changedPerPointBytes: StorageValue<bigint>;
  fullOnlyRepositoryBytes: StorageValue<bigint>;
  fullPlusIncrementalRepositoryBytes: StorageValue<bigint>;
  repositoryBytes: StorageValue<bigint>;
  headroomBytes: StorageValue<bigint>;
  targetBytes: StorageValue<bigint>;
  localTargetBytes: StorageValue<bigint>;
  offsiteTargetBytes: StorageValue<bigint>;
  totalTargetBytes: StorageValue<bigint>;
  retainedPoints: number;
  backupModel: Backup321Model;
  annualGrowthBasisPoints: number;
  changedPerBackupBasisPoints: number;
  headroomBasisPoints: number;
  copyRelationship: Backup321CopyRelationship;
  recovery: Backup321RecoveryValues | null;
}>;

export const DEFAULT_BACKUP_321_INPUT: Backup321Input = Object.freeze({
  sourceData: "2",
  sourceUnit: "TB",
  annualGrowth: "20",
  horizonYears: "3",
  backupModel: "full-plus-incremental",
  retainedPoints: "30",
  changedPerBackup: "5",
  headroom: "20",
  recoveryChecksEnabled: false,
  backupIntervalHours: "24",
  targetRpoHours: "24",
  targetRtoHours: "12",
  localRestoreMbps: "1000",
  offsiteRestoreMbps: "100",
  transferEfficiency: "80",
  displayUnit: "TB",
});

const SOURCE_BYTES: Readonly<Record<Backup321SourceUnit, bigint>> = Object.freeze({
  GB: 1_000_000_000n,
  TB: 1_000_000_000_000n,
  GiB: 1_073_741_824n,
  TiB: 1_099_511_627_776n,
});
const MIN_SOURCE_BYTES = 1_000_000n;
const MAX_SOURCE_BYTES = 1_000n * SOURCE_BYTES.TB;
const MAX_INPUT_TEXT_LENGTH = 128;
const SOURCES = Object.freeze([
  {
    title: "CISA data backup options",
    url: "https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf",
    checkedAt: "2026-09-10",
  },
  {
    title: "CISA ransomware guide",
    url: "https://www.cisa.gov/stopransomware/ransomware-guide",
    checkedAt: "2026-09-10",
  },
  {
    title: "NIST SP 800-34 Rev. 1",
    url: "https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf",
    checkedAt: "2026-09-10",
  },
  {
    title: "Synology backup storage calculation",
    url: "https://kb.synology.com/en-in/DSM/tutorial/How_do_I_calculate_storage_size_for_backups",
    checkedAt: "2026-09-10",
  },
] as const);

const COPY_LIMITATION = "Placement, isolation, media, encryption, and restore tests are not verified.";

type DecimalParts = Readonly<{
  numerator: bigint;
  denominator: bigint;
  integer: string;
  fraction: string;
}>;

type ParsedInput = Readonly<{
  normalized: Backup321Input;
  sourceBytes: bigint;
  annualGrowthBasisPoints: number;
  horizonYears: number;
  retainedPoints: number;
  changedPerBackupBasisPoints: number;
  headroomBasisPoints: number;
  backupIntervalHours: number;
  targetRpoHours: number;
  targetRtoHours: number;
  localRestoreMbpsHundredths: bigint;
  offsiteRestoreMbpsHundredths: bigint;
  transferEfficiencyBasisPoints: number;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>) {
  const expected = Object.keys(DEFAULT_BACKUP_321_INPUT).sort();
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isSourceUnit(value: unknown): value is Backup321SourceUnit {
  return typeof value === "string" && (BACKUP_321_SOURCE_UNITS as readonly string[]).includes(value);
}

function isDisplayUnit(value: unknown): value is Backup321DisplayUnit {
  return typeof value === "string" && (BACKUP_321_DISPLAY_UNITS as readonly string[]).includes(value);
}

function isBackupModel(value: unknown): value is Backup321Model {
  return typeof value === "string" && (BACKUP_321_MODELS as readonly string[]).includes(value);
}

function parseDecimalParts(value: unknown, maxMeaningfulFractionDigits = 18): DecimalParts | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_INPUT_TEXT_LENGTH) return null;
  const match = /^(0|[1-9]\d*)(?:\.(\d+))?$/.exec(trimmed);
  if (!match) return null;
  const integer = match[1];
  const fraction = (match[2] ?? "").replace(/0+$/, "");
  if (fraction.length > maxMeaningfulFractionDigits) return null;
  const denominator = 10n ** BigInt(fraction.length);
  const numerator = BigInt(`${integer}${fraction}`) || 0n;
  return { numerator, denominator, integer, fraction };
}

function canonicalDecimal(parts: DecimalParts) {
  return parts.fraction ? `${parts.integer}.${parts.fraction}` : parts.integer;
}

function decimalWithin(parts: DecimalParts, minimum: bigint, maximum: bigint) {
  return parts.numerator >= minimum * parts.denominator
    && parts.numerator <= maximum * parts.denominator;
}

function basisPointsFromDecimal(value: unknown, maximum: number) {
  const parts = parseDecimalParts(value, 2);
  if (!parts) return null;
  const basisPoints = (parts.numerator * 100n) / parts.denominator;
  if (!decimalWithin(parts, 0n, BigInt(maximum))) return null;
  return { basisPoints: Number(basisPoints), text: canonicalDecimal(parts) };
}

function percentageText(basisPoints: number) {
  const whole = Math.floor(basisPoints / 100);
  const fraction = basisPoints % 100;
  return fraction === 0 ? String(whole) : `${whole}.${String(fraction).padStart(2, "0").replace(/0+$/, "")}`;
}

function parseInteger(value: unknown, minimum: number, maximum: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > MAX_INPUT_TEXT_LENGTH || !/^(0|[1-9]\d*)$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) return null;
  return { value: parsed, text: String(parsed) };
}

function parseCapacityBytes(value: unknown, unit: unknown) {
  if (!isSourceUnit(unit)) return null;
  const parts = parseDecimalParts(value);
  if (!parts) return null;
  const multiplier = SOURCE_BYTES[unit];
  const numerator = parts.numerator * multiplier;
  if (numerator % parts.denominator !== 0n) return null;
  const bytes = numerator / parts.denominator;
  if (bytes < MIN_SOURCE_BYTES || bytes > MAX_SOURCE_BYTES) return null;
  return { bytes, text: canonicalDecimal(parts) };
}

function parseRestoreSpeed(value: unknown) {
  const parts = parseDecimalParts(value, 2);
  if (!parts) return null;
  const hundredths = (parts.numerator * 100n) / parts.denominator;
  if (hundredths < 1n || hundredths > 10_000_000n) return null;
  return { hundredths, text: canonicalDecimal(parts) };
}

function fieldIssue(path: string, message: string, code = "invalid_input") : StorageIssue {
  return { code, severity: "error", message, path };
}

function shapeIssues(input: unknown): StorageIssue[] {
  if (!isRecord(input) || !hasExactKeys(input)) {
    return [fieldIssue("form", "Enter all 16 plan inputs.", "invalid_input_shape")];
  }
  const candidate = input;
  const issues: StorageIssue[] = [];
  const stringKeys = [
    "sourceData", "annualGrowth", "horizonYears", "retainedPoints", "changedPerBackup", "headroom",
    "backupIntervalHours", "targetRpoHours", "targetRtoHours", "localRestoreMbps", "offsiteRestoreMbps",
    "transferEfficiency",
  ];
  for (const key of stringKeys) {
    if (typeof candidate[key] !== "string") issues.push(fieldIssue(key, "Enter a plain text value.", "invalid_input_type"));
  }
  if (!isSourceUnit(candidate.sourceUnit)) issues.push(fieldIssue("sourceUnit", "Choose a source unit.", "invalid_source_unit"));
  if (!isBackupModel(candidate.backupModel)) issues.push(fieldIssue("backupModel", "Choose a backup model.", "invalid_backup_model"));
  if (typeof candidate.recoveryChecksEnabled !== "boolean") issues.push(fieldIssue("recoveryChecksEnabled", "Choose whether to check recovery.", "invalid_recovery_toggle"));
  if (!isDisplayUnit(candidate.displayUnit)) issues.push(fieldIssue("displayUnit", "Choose a display unit.", "invalid_display_unit"));
  return issues;
}

function inputIssues(input: unknown): StorageIssue[] {
  const issues = shapeIssues(input);
  if (issues.length > 0 || !isRecord(input)) return issues;
  const candidate = input;
  const source = parseCapacityBytes(candidate.sourceData, candidate.sourceUnit);
  if (!source) issues.push(fieldIssue("sourceData", "Use 1 MB to 1,000 TB.", "invalid_source_data"));

  const growth = basisPointsFromDecimal(candidate.annualGrowth, 100);
  if (!growth) issues.push(fieldIssue("annualGrowth", "Use 0 to 100 percent.", "invalid_annual_growth"));
  const horizon = parseInteger(candidate.horizonYears, 0, 10);
  if (!horizon) issues.push(fieldIssue("horizonYears", "Use 0 to 10 years.", "invalid_horizon"));
  const points = parseInteger(candidate.retainedPoints, 1, 1_000);
  if (!points) issues.push(fieldIssue("retainedPoints", "Use 1 to 1,000 points.", "invalid_retained_points"));
  const changed = basisPointsFromDecimal(candidate.changedPerBackup, 100);
  if (!changed) issues.push(fieldIssue("changedPerBackup", "Use 0 to 100 percent.", "invalid_changed_data"));
  const headroom = basisPointsFromDecimal(candidate.headroom, 50);
  if (!headroom) issues.push(fieldIssue("headroom", "Use 0 to 50 percent.", "invalid_headroom"));

  if (candidate.recoveryChecksEnabled === true) {
    const interval = parseInteger(candidate.backupIntervalHours, 1, 168);
    if (!interval) issues.push(fieldIssue("backupIntervalHours", "Use 1 to 168 hours.", "invalid_backup_interval"));
    const rpo = parseInteger(candidate.targetRpoHours, 1, 720);
    if (!rpo) issues.push(fieldIssue("targetRpoHours", "Use 1 to 720 hours.", "invalid_rpo"));
    const rto = parseInteger(candidate.targetRtoHours, 1, 720);
    if (!rto) issues.push(fieldIssue("targetRtoHours", "Use 1 to 720 hours.", "invalid_rto"));
    const local = parseRestoreSpeed(candidate.localRestoreMbps);
    if (!local) issues.push(fieldIssue("localRestoreMbps", "Use 0.01 to 100,000 Mbps.", "invalid_local_speed"));
    const offsite = parseRestoreSpeed(candidate.offsiteRestoreMbps);
    if (!offsite) issues.push(fieldIssue("offsiteRestoreMbps", "Use 0.01 to 100,000 Mbps.", "invalid_offsite_speed"));
    const efficiency = basisPointsFromDecimal(candidate.transferEfficiency, 100);
    if (!efficiency || efficiency.basisPoints < 100) {
      issues.push(fieldIssue("transferEfficiency", "Use 1 to 100 percent.", "invalid_transfer_efficiency"));
    }
  }
  return issues;
}

export function validateBackup321Input(input: unknown): input is Backup321Input {
  return inputIssues(input).length === 0;
}

function normalizeInput(input: Backup321Input): ParsedInput | null {
  if (inputIssues(input).length > 0) return null;
  const source = parseCapacityBytes(input.sourceData, input.sourceUnit);
  const growth = basisPointsFromDecimal(input.annualGrowth, 100);
  const horizon = parseInteger(input.horizonYears, 0, 10);
  const points = parseInteger(input.retainedPoints, 1, 1_000);
  const changed = basisPointsFromDecimal(input.changedPerBackup, 100);
  const headroom = basisPointsFromDecimal(input.headroom, 50);
  if (!source || !growth || !horizon || !points || !changed || !headroom) return null;

  const interval = parseInteger(input.backupIntervalHours, 1, 168);
  const rpo = parseInteger(input.targetRpoHours, 1, 720);
  const rto = parseInteger(input.targetRtoHours, 1, 720);
  const local = parseRestoreSpeed(input.localRestoreMbps);
  const offsite = parseRestoreSpeed(input.offsiteRestoreMbps);
  const efficiency = basisPointsFromDecimal(input.transferEfficiency, 100);
  const recoveryValid = !input.recoveryChecksEnabled || (interval && rpo && rto && local && offsite && efficiency && efficiency.basisPoints >= 100);
  if (!recoveryValid) return null;

  const normalized: Backup321Input = Object.freeze({
    sourceData: source.text,
    sourceUnit: input.sourceUnit,
    annualGrowth: percentageText(growth.basisPoints),
    horizonYears: horizon.text,
    backupModel: input.backupModel,
    retainedPoints: points.text,
    changedPerBackup: percentageText(changed.basisPoints),
    headroom: percentageText(headroom.basisPoints),
    recoveryChecksEnabled: input.recoveryChecksEnabled,
    backupIntervalHours: interval?.text ?? DEFAULT_BACKUP_321_INPUT.backupIntervalHours,
    targetRpoHours: rpo?.text ?? DEFAULT_BACKUP_321_INPUT.targetRpoHours,
    targetRtoHours: rto?.text ?? DEFAULT_BACKUP_321_INPUT.targetRtoHours,
    localRestoreMbps: local?.text ?? DEFAULT_BACKUP_321_INPUT.localRestoreMbps,
    offsiteRestoreMbps: offsite?.text ?? DEFAULT_BACKUP_321_INPUT.offsiteRestoreMbps,
    transferEfficiency: efficiency ? percentageText(efficiency.basisPoints) : DEFAULT_BACKUP_321_INPUT.transferEfficiency,
    displayUnit: input.displayUnit,
  });
  return {
    normalized,
    sourceBytes: source.bytes,
    annualGrowthBasisPoints: growth.basisPoints,
    horizonYears: horizon.value,
    retainedPoints: points.value,
    changedPerBackupBasisPoints: changed.basisPoints,
    headroomBasisPoints: headroom.basisPoints,
    backupIntervalHours: interval?.value ?? Number(DEFAULT_BACKUP_321_INPUT.backupIntervalHours),
    targetRpoHours: rpo?.value ?? Number(DEFAULT_BACKUP_321_INPUT.targetRpoHours),
    targetRtoHours: rto?.value ?? Number(DEFAULT_BACKUP_321_INPUT.targetRtoHours),
    localRestoreMbpsHundredths: local?.hundredths ?? 100_000n,
    offsiteRestoreMbpsHundredths: offsite?.hundredths ?? 10_000n,
    transferEfficiencyBasisPoints: efficiency?.basisPoints ?? 8_000,
  };
}

function ceilDiv(numerator: bigint, denominator: bigint) {
  return numerator === 0n ? 0n : (numerator + denominator - 1n) / denominator;
}

function roundHalfUp(numerator: bigint, denominator: bigint) {
  return (numerator + denominator / 2n) / denominator;
}

function value(label: string, bytes: bigint) {
  return storageValue({ label, value: bytes, unit: "bytes", classification: "estimated" });
}

function secondsValue(label: string, seconds: bigint) {
  return storageValue({ label, value: seconds, unit: "seconds", classification: "estimated" });
}

function invalidResult(issues: readonly StorageIssue[]): StorageCalculationResult<Backup321CalculationValues> {
  return createStorageCalculationResult({
    calculator: { id: BACKUP_321_CALCULATOR_ID, version: BACKUP_321_CALCULATION_VERSION },
    values: null,
    issues,
    assumptions: [],
    derivation: [],
    sources: SOURCES,
    uncertainty: { kind: "modelled", statement: "The plan cannot be estimated until every input is valid." },
  });
}

export function calculateBackup321Capacity(input: unknown): StorageCalculationResult<Backup321CalculationValues> {
  const issues = inputIssues(input);
  if (issues.length > 0 || !isRecord(input)) return invalidResult(issues);
  const parsed = normalizeInput(input as Backup321Input);
  if (!parsed) return invalidResult([fieldIssue("form", "Check the marked inputs.", "invalid_input")]);

  const growthSeriesBytes: bigint[] = [parsed.sourceBytes];
  for (let year = 0; year < parsed.horizonYears; year += 1) {
    const next = roundHalfUp(
      (growthSeriesBytes[year] ?? parsed.sourceBytes) * BigInt(10_000 + parsed.annualGrowthBasisPoints),
      10_000n,
    );
    growthSeriesBytes.push(next);
  }
  const projectedSourceBytes = growthSeriesBytes.at(-1) ?? parsed.sourceBytes;
  const changedPerPointBytes = ceilDiv(
    projectedSourceBytes * BigInt(parsed.changedPerBackupBasisPoints),
    10_000n,
  );
  const fullOnlyRepositoryBytes = projectedSourceBytes * BigInt(parsed.retainedPoints);
  const fullPlusIncrementalRepositoryBytes = projectedSourceBytes
    + changedPerPointBytes * BigInt(parsed.retainedPoints - 1);
  const repositoryBytes = parsed.normalized.backupModel === "full-only"
    ? fullOnlyRepositoryBytes
    : fullPlusIncrementalRepositoryBytes;
  const headroomBytes = ceilDiv(repositoryBytes * BigInt(parsed.headroomBasisPoints), 10_000n);
  const targetBytes = repositoryBytes + headroomBytes;
  const totalTargetBytes = targetBytes * 2n;

  let recovery: Backup321RecoveryValues | null = null;
  if (parsed.normalized.recoveryChecksEnabled) {
    const restoreNumerator = projectedSourceBytes * 8n * 10_000n;
    const localBitsPerSecond = parsed.localRestoreMbpsHundredths * 10_000n;
    const offsiteBitsPerSecond = parsed.offsiteRestoreMbpsHundredths * 10_000n;
    const localRestoreSeconds = ceilDiv(restoreNumerator, localBitsPerSecond * BigInt(parsed.transferEfficiencyBasisPoints));
    const offsiteRestoreSeconds = ceilDiv(restoreNumerator, offsiteBitsPerSecond * BigInt(parsed.transferEfficiencyBasisPoints));
    recovery = Object.freeze({
      rpoPasses: parsed.backupIntervalHours <= parsed.targetRpoHours,
      localRestoreSeconds: secondsValue("Estimated local full restore", localRestoreSeconds),
      offsiteRestoreSeconds: secondsValue("Estimated off-site full restore", offsiteRestoreSeconds),
      localRtoPasses: localRestoreSeconds <= BigInt(parsed.targetRtoHours) * 3_600n,
      offsiteRtoPasses: offsiteRestoreSeconds <= BigInt(parsed.targetRtoHours) * 3_600n,
    });
  }

  return createStorageCalculationResult({
    calculator: { id: BACKUP_321_CALCULATOR_ID, version: BACKUP_321_CALCULATION_VERSION },
    values: {
      calculatorId: BACKUP_321_CALCULATOR_ID,
      calculationVersion: BACKUP_321_CALCULATION_VERSION,
      inputVersion: BACKUP_321_INPUT_VERSION,
      engineVersion: STORAGE_ENGINE_VERSION,
      sourceBytes: value("Protected source data", parsed.sourceBytes),
      growthSeriesBytes: Object.freeze(growthSeriesBytes),
      projectedSourceBytes: value("Projected source data", projectedSourceBytes),
      changedPerPointBytes: value("Changed data per point", changedPerPointBytes),
      fullOnlyRepositoryBytes: value("Full-only repository", fullOnlyRepositoryBytes),
      fullPlusIncrementalRepositoryBytes: value("Full-plus-incremental repository", fullPlusIncrementalRepositoryBytes),
      repositoryBytes: value("Repository before headroom", repositoryBytes),
      headroomBytes: value("Headroom", headroomBytes),
      targetBytes: value("One backup target", targetBytes),
      localTargetBytes: value("Local target", targetBytes),
      offsiteTargetBytes: value("Off-site target", targetBytes),
      totalTargetBytes: value("Both targets", totalTargetBytes),
      retainedPoints: parsed.retainedPoints,
      backupModel: parsed.normalized.backupModel,
      annualGrowthBasisPoints: parsed.annualGrowthBasisPoints,
      changedPerBackupBasisPoints: parsed.changedPerBackupBasisPoints,
      headroomBasisPoints: parsed.headroomBasisPoints,
      copyRelationship: {
        positions: { source: 1, localTarget: 2, offsiteTarget: 3 },
        limitation: COPY_LIMITATION,
      },
      recovery,
    },
    issues: [],
    assumptions: [
      { id: "projected_source", statement: "Growth compounds to the selected planning horizon." },
      { id: "retention_model", statement: "Every retained point uses the projected horizon source size." },
      { id: "changed_data", statement: "Changed data is an average allowance per additional point." },
      { id: "headroom", statement: "Headroom is added independently to each target." },
      { id: "copy_count", statement: "The source is copy 1; local and off-site targets are copies 2 and 3." },
    ],
    derivation: [
      { id: "projected_source", expression: "roundHalfUp(previous source x (10,000 + annual growth basis points) / 10,000) per year", result: `${projectedSourceBytes} bytes` },
      { id: "changed_allowance", expression: "ceilDiv(projected source x changed rate basis points, 10,000)", result: `${changedPerPointBytes} bytes` },
      { id: "repository_model", expression: parsed.normalized.backupModel === "full-only" ? "projected source x retained points" : "projected source + changed allowance x (retained points - 1)", result: `${repositoryBytes} bytes` },
      { id: "headroom", expression: "ceilDiv(repository x headroom rate basis points, 10,000)", result: `${headroomBytes} bytes` },
      { id: "targets", expression: "repository + headroom; local = off-site = one target; total = target x 2", result: `${targetBytes} bytes each; ${totalTargetBytes} bytes combined` },
    ],
    sources: SOURCES,
    uncertainty: {
      kind: "modelled",
      statement: "Capacity is an estimated product-neutral retention model; compression, deduplication, and filesystem overhead are excluded.",
    },
  });
}

export function formatBackup321Capacity(bytes: bigint, unit: Backup321DisplayUnit) {
  const formatted = formatBytes(bytes, unit, { maximumFractionDigits: 2 });
  return bytes > 0n && formatted.startsWith("0 ") ? `<0.01 ${unit}` : formatted;
}

export function formatBackup321Seconds(seconds: bigint) {
  if (seconds < 3_600n) {
    return `${seconds} ${seconds === 1n ? "second" : "seconds"}`;
  }
  const tenths = (seconds * 10n + 1_800n) / 3_600n;
  const whole = tenths / 10n;
  const fraction = tenths % 10n;
  if (fraction === 0n) return `${whole} ${whole === 1n ? "hour" : "hours"}`;
  return `${whole}.${fraction} hours`;
}

export function normalizeBackup321Input(input: Backup321Input) {
  return normalizeInput(input)?.normalized ?? null;
}

export function encodeBackup321State(input: unknown) {
  if (!isRecord(input) || !validateBackup321Input(input)) {
    throw new StorageStateError("invalid_input", "Backup plan inputs are invalid.");
  }
  const normalized = normalizeInput(input);
  if (!normalized) throw new StorageStateError("invalid_input", "Backup plan inputs are invalid.");
  return encodeStorageState({
    calculatorId: BACKUP_321_CALCULATOR_ID,
    calculatorVersion: BACKUP_321_CALCULATION_VERSION,
    inputVersion: BACKUP_321_INPUT_VERSION,
    payload: normalized.normalized,
  });
}

export function decodeBackup321State(encoded: string) {
  const state = decodeStorageState(encoded);
  if (state.calculatorId !== BACKUP_321_CALCULATOR_ID
    || state.calculatorVersion !== BACKUP_321_CALCULATION_VERSION
    || state.inputVersion !== BACKUP_321_INPUT_VERSION
    || !validateBackup321Input(state.payload)) {
    throw new StorageStateError("unsupported_calculator", "Backup plan state is not supported.");
  }
  const normalized = normalizeInput(state.payload);
  if (!normalized) throw new StorageStateError("invalid_input", "Backup plan state is invalid.");
  return normalized.normalized;
}

export const backup321CalculatorAdapter = Object.freeze({
  calculatorId: BACKUP_321_CALCULATOR_ID,
  calculationVersion: BACKUP_321_CALCULATION_VERSION,
  inputVersion: BACKUP_321_INPUT_VERSION,
  validateInput: validateBackup321Input,
  calculate: calculateBackup321Capacity,
});

export const backup321CalculatorRegistry = createStorageCalculatorRegistry();
backup321CalculatorRegistry.register(backup321CalculatorAdapter);
