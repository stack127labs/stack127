export const DRIVE_RELIABILITY_SCHEMA_VERSION = "drive-reliability-snapshot-v1" as const;
export const DRIVE_RELIABILITY_CALCULATION_VERSION = "drive-reliability-v1" as const;
export const DRIVE_RELIABILITY_INPUT_VERSION = "drive-reliability-input-v1" as const;
export const DRIVE_RELIABILITY_INTERVAL_VERSION = "poisson-normal-v1" as const;

const MAX_SEARCH_LENGTH = 120;
const MAX_MANUFACTURER_LENGTH = 40;
const MAX_SHARE_LENGTH = 4_000;
const MAX_SELECTED_MODELS = 3;
const Z95 = 1.96;

export type DriveReliabilityPeriodKind = "quarterly" | "annual" | "lifetime";
export type DriveReliabilityCohortType = "model" | "fleet";

export type DriveReliabilityPeriod = Readonly<{
  id: string;
  label: string;
  kind: DriveReliabilityPeriodKind;
  start: string | null;
  end: string;
  driveCountMinimum: number;
  driveDaysMinimum: number;
  isDefault?: boolean;
}>;

export type DriveReliabilityRow = Readonly<{
  id: string;
  periodId: string;
  cohortType: DriveReliabilityCohortType;
  manufacturer: string;
  model: string;
  capacityTb: number | null;
  driveCount: number | null;
  averageAgeMonths: number | null;
  driveDays: number;
  failures: number;
  includedBySource: boolean;
  qualification: "qualified" | "summary" | "excluded";
}>;

export type DriveReliabilitySnapshot = Readonly<{
  schemaVersion: string;
  datasetVersion: string;
  sourceName: string;
  sourceUrl: string;
  sourceReportUrl: string;
  sourceCheckedAt: string;
  periods: readonly DriveReliabilityPeriod[];
  rows: readonly DriveReliabilityRow[];
}>;

export type DriveReliabilityInput = Readonly<{
  periodId: string;
  search: string;
  manufacturer: string;
  minCapacityTb: number | null;
  maxCapacityTb: number | null;
  showSmallCohorts: boolean;
  selectedModelIds: readonly string[];
}>;

export type DriveReliabilityEvidenceRange = Readonly<{
  lowPercent: number;
  highPercent: number;
  standardErrorPercent: number;
  method: typeof DRIVE_RELIABILITY_INTERVAL_VERSION;
}>;

export type ResolvedDriveReliabilityRow = DriveReliabilityRow & Readonly<{
  period: DriveReliabilityPeriod;
  afrPercent: number;
  displayAfrPercent: string;
  evidenceRange: DriveReliabilityEvidenceRange;
  displayEvidenceRange: string;
  isQualified: boolean;
  evidenceLabel: "Fleet summary" | "Qualified cohort" | "Thin cohort" | "Below source threshold";
}>;

export type DriveReliabilityResolution = Readonly<{
  status: "ready" | "no-data" | "invalid";
  rows: readonly ResolvedDriveReliabilityRow[];
  selected: readonly ResolvedDriveReliabilityRow[];
  primary: ResolvedDriveReliabilityRow | null;
  period: DriveReliabilityPeriod | null;
  warnings: readonly string[];
  errors: readonly string[];
}>;

export const DEFAULT_DRIVE_RELIABILITY_INPUT: DriveReliabilityInput = Object.freeze({
  periodId: "q1-2026",
  search: "",
  manufacturer: "",
  minCapacityTb: null,
  maxCapacityTb: null,
  showSmallCohorts: false,
  selectedModelIds: Object.freeze([]),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidDate(value: unknown, allowNull = false): value is string | null {
  if (allowNull && value === null) return true;
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function boundedText(value: unknown, maximum: number): string {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maximum)
    : "";
}

export function normalizeModel(value: string): string {
  return value.normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function normalizeManufacturer(value: string): string {
  return boundedText(value, MAX_MANUFACTURER_LENGTH).toLowerCase();
}

function rowIdForState(value: string): string {
  return boundedText(value, 140).toLowerCase();
}

export function calculateAnnualizedFailureRate(failures: number, driveDays: number): number {
  if (!Number.isFinite(failures) || !Number.isFinite(driveDays) || driveDays <= 0 || failures < 0) return NaN;
  return (failures * 36500) / driveDays;
}

export function calculateEvidenceRange(failures: number, driveDays: number): DriveReliabilityEvidenceRange {
  const afrPercent = calculateAnnualizedFailureRate(failures, driveDays);
  if (!Number.isFinite(afrPercent) || !Number.isFinite(failures) || !Number.isFinite(driveDays) || driveDays <= 0 || failures < 0) {
    return {
      lowPercent: NaN,
      highPercent: NaN,
      standardErrorPercent: NaN,
      method: DRIVE_RELIABILITY_INTERVAL_VERSION,
    };
  }
  const exposureYears = driveDays / 365;
  const standardErrorPercent = (Math.sqrt(Math.max(failures, 0.5)) / exposureYears) * 100;
  return {
    lowPercent: Math.max(0, afrPercent - Z95 * standardErrorPercent),
    highPercent: afrPercent + Z95 * standardErrorPercent,
    standardErrorPercent,
    method: DRIVE_RELIABILITY_INTERVAL_VERSION,
  };
}

function fixedPercent(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : "Unavailable";
}

function displayRange(range: DriveReliabilityEvidenceRange): string {
  if (!Number.isFinite(range.lowPercent) || !Number.isFinite(range.highPercent)) return "Unavailable";
  return `${fixedPercent(range.lowPercent)} to ${fixedPercent(range.highPercent)}`;
}

function periodFor(snapshot: DriveReliabilitySnapshot, periodId: string): DriveReliabilityPeriod | null {
  return snapshot.periods.find((period) => period.id === periodId)
    ?? snapshot.periods.find((period) => period.isDefault)
    ?? snapshot.periods[0]
    ?? null;
}

function isAboveSourceThreshold(row: DriveReliabilityRow, period: DriveReliabilityPeriod): boolean {
  if (row.cohortType === "fleet") return true;
  return row.driveCount !== null
    && row.driveCount > period.driveCountMinimum
    && row.driveDays > period.driveDaysMinimum;
}

function evidenceLabel(row: DriveReliabilityRow, qualified: boolean): ResolvedDriveReliabilityRow["evidenceLabel"] {
  if (row.cohortType === "fleet") return "Fleet summary";
  if (!qualified) return "Below source threshold";
  if ((row.driveCount ?? 0) < 500 || row.failures <= 1) return "Thin cohort";
  return "Qualified cohort";
}

function toResolved(row: DriveReliabilityRow, period: DriveReliabilityPeriod): ResolvedDriveReliabilityRow {
  const qualified = isAboveSourceThreshold(row, period) && row.includedBySource;
  const afrPercent = calculateAnnualizedFailureRate(row.failures, row.driveDays);
  const evidenceRange = calculateEvidenceRange(row.failures, row.driveDays);
  return {
    ...row,
    period,
    afrPercent,
    displayAfrPercent: fixedPercent(afrPercent),
    evidenceRange,
    displayEvidenceRange: displayRange(evidenceRange),
    isQualified: qualified,
    evidenceLabel: evidenceLabel(row, qualified),
  };
}

export function validateDriveReliabilitySnapshot(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ["snapshot must be an object"] };
  if (value.schemaVersion !== DRIVE_RELIABILITY_SCHEMA_VERSION) errors.push("schemaVersion is unsupported");
  for (const key of ["datasetVersion", "sourceName", "sourceUrl", "sourceReportUrl", "sourceCheckedAt"]) {
    if (typeof value[key] !== "string" || value[key].trim() === "") errors.push(`${key} is required`);
  }
  if (!isValidDate(value.sourceCheckedAt)) errors.push("sourceCheckedAt is invalid");
  if (!Array.isArray(value.periods) || value.periods.length === 0) {
    errors.push("periods must be a non-empty array");
  } else {
    const periodIds = new Set<string>();
    for (const [index, period] of value.periods.entries()) {
      if (!isRecord(period)) {
        errors.push(`periods[${index}] must be an object`);
        continue;
      }
      if (typeof period.id !== "string" || period.id.trim() === "") errors.push(`periods[${index}].id is required`);
      if (typeof period.label !== "string" || period.label.trim() === "") errors.push(`periods[${index}].label is required`);
      if (!new Set(["quarterly", "annual", "lifetime"]).has(period.kind as string)) errors.push(`periods[${index}].kind is invalid`);
      if (!isValidDate(period.start, true) || !isValidDate(period.end)) errors.push(`periods[${index}] dates are invalid`);
      if (!isFiniteNumber(period.driveCountMinimum) || period.driveCountMinimum < 0) errors.push(`periods[${index}].driveCountMinimum is invalid`);
      if (!isFiniteNumber(period.driveDaysMinimum) || period.driveDaysMinimum < 0) errors.push(`periods[${index}].driveDaysMinimum is invalid`);
      if (typeof period.id === "string") {
        if (periodIds.has(period.id)) errors.push(`duplicate period id ${period.id}`);
        periodIds.add(period.id);
      }
    }
  }
  if (!Array.isArray(value.rows)) {
    errors.push("rows must be an array");
  } else {
    const rowIds = new Set<string>();
    const periodIds = new Set(isRecord(value) && Array.isArray(value.periods) ? value.periods.flatMap((period) => isRecord(period) && typeof period.id === "string" ? [period.id] : []) : []);
    for (const [index, row] of value.rows.entries()) {
      if (!isRecord(row)) {
        errors.push(`rows[${index}] must be an object`);
        continue;
      }
      for (const key of ["id", "periodId", "manufacturer", "model"]) {
        if (typeof row[key] !== "string" || row[key].trim() === "") errors.push(`rows[${index}].${key} is required`);
      }
      if (typeof row.id === "string") {
        if (rowIds.has(row.id)) errors.push(`duplicate row id ${row.id}`);
        rowIds.add(row.id);
      }
      if (typeof row.periodId === "string" && !periodIds.has(row.periodId)) errors.push(`rows[${index}].periodId is unknown`);
      if (!new Set(["model", "fleet"]).has(row.cohortType as string)) errors.push(`rows[${index}].cohortType is invalid`);
      if (row.capacityTb !== null && !isFiniteNumber(row.capacityTb)) errors.push(`rows[${index}].capacityTb is invalid`);
      if (row.driveCount !== null && (!isFiniteNumber(row.driveCount) || row.driveCount <= 0 || !Number.isInteger(row.driveCount))) errors.push(`rows[${index}].driveCount is invalid`);
      if (!isFiniteNumber(row.driveDays) || row.driveDays <= 0) errors.push(`rows[${index}].driveDays is invalid`);
      if (!isFiniteNumber(row.failures) || row.failures < 0 || !Number.isInteger(row.failures)) errors.push(`rows[${index}].failures is invalid`);
      if (typeof row.averageAgeMonths !== "number" && row.averageAgeMonths !== null) errors.push(`rows[${index}].averageAgeMonths is invalid`);
      if (typeof row.includedBySource !== "boolean") errors.push(`rows[${index}].includedBySource is invalid`);
      if (!new Set(["qualified", "summary", "excluded"]).has(row.qualification as string)) errors.push(`rows[${index}].qualification is invalid`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function normalizeDriveReliabilityInput(input: Partial<DriveReliabilityInput> = {}): DriveReliabilityInput {
  const minCapacityTb = isFiniteNumber(input.minCapacityTb) && input.minCapacityTb >= 0 ? input.minCapacityTb : null;
  const maxCapacityTb = isFiniteNumber(input.maxCapacityTb) && input.maxCapacityTb >= 0 ? input.maxCapacityTb : null;
  const selected = Array.isArray(input.selectedModelIds)
    ? input.selectedModelIds.filter((value): value is string => typeof value === "string").map(rowIdForState).filter(Boolean).slice(0, MAX_SELECTED_MODELS)
    : [];
  return {
    periodId: boundedText(input.periodId, 40) || DEFAULT_DRIVE_RELIABILITY_INPUT.periodId,
    search: boundedText(input.search, MAX_SEARCH_LENGTH),
    manufacturer: boundedText(input.manufacturer, MAX_MANUFACTURER_LENGTH),
    minCapacityTb,
    maxCapacityTb,
    showSmallCohorts: input.showSmallCohorts === true,
    selectedModelIds: [...new Set(selected)],
  };
}

export function encodeDriveReliabilityState(input: DriveReliabilityInput): string {
  const normalized = normalizeDriveReliabilityInput(input);
  return encodeURIComponent(JSON.stringify({
    v: DRIVE_RELIABILITY_INPUT_VERSION,
    periodId: normalized.periodId,
    search: normalized.search,
    manufacturer: normalized.manufacturer,
    minCapacityTb: normalized.minCapacityTb,
    maxCapacityTb: normalized.maxCapacityTb,
    showSmallCohorts: normalized.showSmallCohorts,
    selectedModelIds: normalized.selectedModelIds,
  }));
}

export function parseDriveReliabilityState(encoded: string | null | undefined): { input: DriveReliabilityInput; warnings: string[] } {
  if (!encoded) return { input: DEFAULT_DRIVE_RELIABILITY_INPUT, warnings: [] };
  const warnings: string[] = [];
  if (encoded.length > MAX_SHARE_LENGTH) return { input: DEFAULT_DRIVE_RELIABILITY_INPUT, warnings: ["Share state was too large to restore."] };
  let decoded: unknown;
  try {
    decoded = JSON.parse(decodeURIComponent(encoded));
  } catch {
    return { input: DEFAULT_DRIVE_RELIABILITY_INPUT, warnings: ["Share state could not be restored."] };
  }
  if (!isRecord(decoded) || decoded.v !== DRIVE_RELIABILITY_INPUT_VERSION) {
    return { input: DEFAULT_DRIVE_RELIABILITY_INPUT, warnings: ["Share state uses an unsupported version."] };
  }
  const periodId = typeof decoded.periodId === "string" && ["q1-2026", "annual-2025", "lifetime"].includes(decoded.periodId)
    ? decoded.periodId
    : DEFAULT_DRIVE_RELIABILITY_INPUT.periodId;
  if (periodId !== decoded.periodId) warnings.push("Period was not restored.");
  const search = boundedText(decoded.search, MAX_SEARCH_LENGTH);
  if (typeof decoded.search === "string" && decoded.search.length > MAX_SEARCH_LENGTH) warnings.push("Search text was shortened.");
  const manufacturer = boundedText(decoded.manufacturer, MAX_MANUFACTURER_LENGTH);
  let minCapacityTb = isFiniteNumber(decoded.minCapacityTb) && decoded.minCapacityTb >= 0 && decoded.minCapacityTb <= 1_000 ? decoded.minCapacityTb : null;
  let maxCapacityTb = isFiniteNumber(decoded.maxCapacityTb) && decoded.maxCapacityTb >= 0 && decoded.maxCapacityTb <= 1_000 ? decoded.maxCapacityTb : null;
  if (decoded.minCapacityTb !== null && decoded.minCapacityTb !== undefined && minCapacityTb === null) warnings.push("Minimum capacity was not restored.");
  if (decoded.maxCapacityTb !== null && decoded.maxCapacityTb !== undefined && maxCapacityTb === null) warnings.push("Maximum capacity was not restored.");
  if (minCapacityTb !== null && maxCapacityTb !== null && minCapacityTb > maxCapacityTb) {
    [minCapacityTb, maxCapacityTb] = [maxCapacityTb, minCapacityTb];
    warnings.push("Capacity limits were reordered.");
  }
  const rawSelected = Array.isArray(decoded.selectedModelIds) ? decoded.selectedModelIds : [];
  const selectedModelIds = rawSelected.filter((value): value is string => typeof value === "string" && value.length <= 140).map(rowIdForState).filter(Boolean).slice(0, MAX_SELECTED_MODELS);
  if (rawSelected.length > MAX_SELECTED_MODELS) warnings.push("Only three selected cohorts can be restored.");
  return {
    input: normalizeDriveReliabilityInput({
      periodId,
      search,
      manufacturer,
      minCapacityTb,
      maxCapacityTb,
      showSmallCohorts: decoded.showSmallCohorts === true,
      selectedModelIds,
    }),
    warnings,
  };
}

function rowMatches(row: DriveReliabilityRow, input: DriveReliabilityInput): boolean {
  const search = normalizeModel(input.search);
  const manufacturer = normalizeManufacturer(input.manufacturer);
  const rowModel = normalizeModel(row.model);
  const rowManufacturer = normalizeManufacturer(row.manufacturer);
  const searchableManufacturer = normalizeModel(row.manufacturer);
  if (search && !rowModel.includes(search) && !searchableManufacturer.includes(search)) return false;
  if (manufacturer && rowManufacturer !== manufacturer) return false;
  if (input.minCapacityTb !== null && (row.capacityTb === null || row.capacityTb < input.minCapacityTb)) return false;
  if (input.maxCapacityTb !== null && (row.capacityTb === null || row.capacityTb > input.maxCapacityTb)) return false;
  return true;
}

export function resolveDriveReliability(snapshot: DriveReliabilitySnapshot, rawInput: Partial<DriveReliabilityInput> = {}): DriveReliabilityResolution {
  const validation = validateDriveReliabilitySnapshot(snapshot);
  if (!validation.valid) {
    return { status: "invalid", rows: [], selected: [], primary: null, period: null, warnings: [], errors: validation.errors };
  }
  const input = normalizeDriveReliabilityInput(rawInput);
  const period = periodFor(snapshot, input.periodId);
  if (!period) return { status: "invalid", rows: [], selected: [], primary: null, period: null, warnings: [], errors: ["No snapshot periods are available."] };
  const rows = snapshot.rows
    .filter((row) => row.periodId === period.id && rowMatches(row, input))
    .filter((row) => input.showSmallCohorts || row.cohortType === "fleet" || (row.includedBySource && isAboveSourceThreshold(row, period)))
    .map((row) => toResolved(row, period))
    .sort((a, b) => a.afrPercent - b.afrPercent || a.model.localeCompare(b.model));
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const selected = input.selectedModelIds.map((id) => rowById.get(id)).filter((row): row is ResolvedDriveReliabilityRow => Boolean(row)).slice(0, MAX_SELECTED_MODELS);
  const primary = selected[0] ?? rows[0] ?? null;
  const warnings = [...(primary?.evidenceLabel === "Thin cohort" ? ["Small cohorts can move sharply after one failure."] : [])];
  return {
    status: rows.length > 0 ? "ready" : "no-data",
    rows,
    selected,
    primary,
    period,
    warnings,
    errors: [],
  };
}
