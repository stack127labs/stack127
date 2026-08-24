export const STORAGE_GROWTH_CALCULATOR_ID = "storage-growth-tco" as const;
export const STORAGE_GROWTH_CALCULATION_VERSION = 1 as const;
export const STORAGE_GROWTH_INPUT_VERSION = 1 as const;

export type StorageGrowthLayout = "mirror" | "single-parity" | "dual-parity";
export type StorageGrowthCurrency = "USD" | "EUR" | "GBP" | "INR";
export type StorageGrowthDisplayUnit = "TB" | "TiB";

export type StorageGrowthInput = {
  currentData: string;
  annualGrowth: string;
  horizonYears: string;
  reserve: string;
  layout: StorageGrowthLayout;
  driveCount: string;
  driveSize: string;
  drivePrice: string;
  enclosureCost: string;
  averagePowerWatts: string;
  hoursPerDay: string;
  electricityRate: string;
  replacementReserve: string;
  backupAnnualBudget: string;
  currency: StorageGrowthCurrency;
  displayUnit: StorageGrowthDisplayUnit;
};

export const DEFAULT_STORAGE_GROWTH_INPUT: StorageGrowthInput = {
  currentData: "10",
  annualGrowth: "20",
  horizonYears: "5",
  reserve: "20",
  layout: "dual-parity",
  driveCount: "6",
  driveSize: "12",
  drivePrice: "200",
  enclosureCost: "400",
  averagePowerWatts: "60",
  hoursPerDay: "24",
  electricityRate: "0.15",
  replacementReserve: "0",
  backupAnnualBudget: "0",
  currency: "USD",
  displayUnit: "TB",
};

export type StorageGrowthIssue = {
  field: string;
  message: string;
};

type NormalizedStorageGrowthInput = {
  currentDataBytes: bigint;
  annualGrowthBasisPoints: number;
  horizonYears: number;
  reserveBasisPoints: number;
  layout: StorageGrowthLayout;
  driveCount: number;
  driveSizeBytes: bigint;
  drivePriceMinor: bigint;
  enclosureCostMinor: bigint;
  averagePowerWatts: number;
  hoursPerDay: number;
  electricityRateMinor: bigint;
  replacementReserveBasisPoints: number;
  backupAnnualBudgetMinor: bigint;
  currency: StorageGrowthCurrency;
  displayUnit: StorageGrowthDisplayUnit;
};

export type StorageGrowthCosts = {
  hardwareMinor: bigint;
  powerMinor: bigint;
  replacementMinor: bigint;
  backupMinor: bigint;
  totalMinor: bigint;
};

export type StorageGrowthValues = {
  input: NormalizedStorageGrowthInput;
  dataMembers: number;
  rawCapacityBytes: bigint;
  modeledUsableBytes: bigint;
  redundancyBytes: bigint;
  reserveBytes: bigint;
  planningCapacityBytes: bigint;
  demandBytes: bigint[];
  shortfallYear: number | null;
  energyWattHours: bigint;
  costs: StorageGrowthCosts;
  costPerPlanningTbYearMinor: bigint | null;
  metadata: {
    calculatorId: typeof STORAGE_GROWTH_CALCULATOR_ID;
    calculationVersion: typeof STORAGE_GROWTH_CALCULATION_VERSION;
    inputVersion: typeof STORAGE_GROWTH_INPUT_VERSION;
    engineVersion: "1";
  };
};

export type StorageGrowthCalculationResult =
  | { status: "valid"; values: StorageGrowthValues; issues: [] }
  | { status: "invalid"; values: null; issues: StorageGrowthIssue[] };

export type StorageGrowthStateResult =
  | { status: "valid"; input: StorageGrowthInput; message: "Shared plan loaded." }
  | { status: "invalid"; input: null; message: "Shared plan could not load." };

const TB_BYTES = 1_000_000_000_000n;
const TIB_BYTES = 1_099_511_627_776n;
const MIN_DRIVE_BYTES = 100_000_000_000n;
const MAX_DRIVE_BYTES = 100n * TB_BYTES;
const MAX_CURRENT_BYTES = 1_000n * TB_BYTES;
const MAX_STATE_LENGTH = 4096;
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const INPUT_KEYS = [
  "currentData", "annualGrowth", "horizonYears", "reserve", "layout", "driveCount", "driveSize",
  "drivePrice", "enclosureCost", "averagePowerWatts", "hoursPerDay", "electricityRate",
  "replacementReserve", "backupAnnualBudget", "currency", "displayUnit",
] as const;
const STATE_KEYS = ["calculatorId", "calculationVersion", "inputVersion", "input"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function hasExactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const ownKeys = Object.keys(value).sort();
  return ownKeys.length === keys.length && ownKeys.every((key, index) => key === [...keys].sort()[index]);
}

function parseDecimal(value: unknown, multiplier: bigint, maximumFractionDigits: number): bigint | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null;
  const [wholeText, fractionText = ""] = text.split(".");
  if (fractionText.length > maximumFractionDigits && /[1-9]/.test(fractionText.slice(maximumFractionDigits))) return null;
  const fraction = fractionText.slice(0, maximumFractionDigits).padEnd(maximumFractionDigits, "0");
  return BigInt(wholeText) * multiplier + (fraction ? BigInt(fraction) * (multiplier / (10n ** BigInt(maximumFractionDigits))) : 0n);
}

function parseBoundedDecimal(value: unknown, multiplier: bigint, maximum: bigint, maximumFractionDigits: number): bigint | null {
  const parsed = parseDecimal(value, multiplier, maximumFractionDigits);
  return parsed !== null && parsed >= 0n && parsed <= maximum ? parsed : null;
}

function parseInteger(value: unknown, minimum: number, maximum: number): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value.trim());
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

function parseEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? value as T : null;
}

function percentText(value: unknown, maximum: number): number | null {
  const parsed = parseBoundedDecimal(value, 100n, BigInt(maximum) * 100n, 2);
  return parsed === null ? null : Number(parsed);
}

function currencyText(value: unknown, maximum: number): bigint | null {
  return parseBoundedDecimal(value, 100n, BigInt(maximum) * 100n, 2);
}

function capacityText(value: unknown, minimum: bigint, maximum: bigint): bigint | null {
  return parseBoundedDecimal(value, TB_BYTES, maximum, 12) !== null
    ? (() => {
      const parsed = parseBoundedDecimal(value, TB_BYTES, maximum, 12);
      return parsed !== null && parsed >= minimum ? parsed : null;
    })()
    : null;
}

function normalizeInput(input: unknown): { input: NormalizedStorageGrowthInput | null; issues: StorageGrowthIssue[] } {
  const issues: StorageGrowthIssue[] = [];
  const add = (field: string, message: string) => issues.push({ field, message });
  if (!hasExactKeys(input, INPUT_KEYS)) return { input: null, issues: [{ field: "form", message: "Use the supported fields." }] };

  const currentDataBytes = capacityText(input.currentData, 0n, MAX_CURRENT_BYTES);
  if (currentDataBytes === null) add("currentData", "Use 0 to 1,000 TB.");
  const annualGrowthBasisPoints = percentText(input.annualGrowth, 100);
  if (annualGrowthBasisPoints === null) add("annualGrowth", "Use 0 to 100%.");
  const horizonYears = parseInteger(input.horizonYears, 1, 10);
  if (horizonYears === null) add("horizonYears", "Use 1 to 10 years.");
  const reserveBasisPoints = percentText(input.reserve, 50);
  if (reserveBasisPoints === null) add("reserve", "Use 0 to 50%.");
  const layout = parseEnum(input.layout, ["mirror", "single-parity", "dual-parity"] as const);
  if (layout === null) add("layout", "Choose a supported layout.");
  const driveCount = parseInteger(input.driveCount, 2, 24);
  if (driveCount === null) add("driveCount", "Use 2 to 24 drives.");
  const driveSizeBytes = capacityText(input.driveSize, MIN_DRIVE_BYTES, MAX_DRIVE_BYTES);
  if (driveSizeBytes === null) add("driveSize", "Use 0.1 to 100 TB.");
  const drivePriceMinor = currencyText(input.drivePrice, 100_000);
  if (drivePriceMinor === null) add("drivePrice", "Use 0 to 100,000.");
  const enclosureCostMinor = currencyText(input.enclosureCost, 100_000);
  if (enclosureCostMinor === null) add("enclosureCost", "Use 0 to 100,000.");
  const averagePowerWatts = parseInteger(input.averagePowerWatts, 0, 2_000);
  if (averagePowerWatts === null) add("averagePowerWatts", "Use 0 to 2,000 W.");
  const hoursPerDay = parseInteger(input.hoursPerDay, 0, 24);
  if (hoursPerDay === null) add("hoursPerDay", "Use 0 to 24 hours.");
  const electricityRateMinor = currencyText(input.electricityRate, 10);
  if (electricityRateMinor === null) add("electricityRate", "Use 0 to 10 per kWh.");
  const replacementReserveBasisPoints = percentText(input.replacementReserve, 25);
  if (replacementReserveBasisPoints === null) add("replacementReserve", "Use 0 to 25%.");
  const backupAnnualBudgetMinor = currencyText(input.backupAnnualBudget, 100_000);
  if (backupAnnualBudgetMinor === null) add("backupAnnualBudget", "Use 0 to 100,000.");
  const currency = parseEnum(input.currency, ["USD", "EUR", "GBP", "INR"] as const);
  if (currency === null) add("currency", "Choose a supported currency.");
  const displayUnit = parseEnum(input.displayUnit, ["TB", "TiB"] as const);
  if (displayUnit === null) add("displayUnit", "Choose TB or TiB.");

  if (layout !== null && driveCount !== null) {
    const impossible = layout === "mirror" ? driveCount % 2 !== 0 : driveCount < (layout === "single-parity" ? 3 : 4);
    if (impossible) add("driveCount", layout === "mirror" ? "Mirror needs an even count." : `${layout === "single-parity" ? "Single parity" : "Dual parity"} needs more drives.`);
  }
  if (issues.length > 0) return { input: null, issues };
  return {
    input: {
      currentDataBytes: currentDataBytes as bigint,
      annualGrowthBasisPoints: annualGrowthBasisPoints as number,
      horizonYears: horizonYears as number,
      reserveBasisPoints: reserveBasisPoints as number,
      layout: layout as StorageGrowthLayout,
      driveCount: driveCount as number,
      driveSizeBytes: driveSizeBytes as bigint,
      drivePriceMinor: drivePriceMinor as bigint,
      enclosureCostMinor: enclosureCostMinor as bigint,
      averagePowerWatts: averagePowerWatts as number,
      hoursPerDay: hoursPerDay as number,
      electricityRateMinor: electricityRateMinor as bigint,
      replacementReserveBasisPoints: replacementReserveBasisPoints as number,
      backupAnnualBudgetMinor: backupAnnualBudgetMinor as bigint,
      currency: currency as StorageGrowthCurrency,
      displayUnit: displayUnit as StorageGrowthDisplayUnit,
    },
    issues,
  };
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

function canonicalDecimal(value: bigint, multiplier: bigint, maximumFractionDigits: number): string {
  const whole = value / multiplier;
  const remainder = value % multiplier;
  if (remainder === 0n) return whole.toString();
  const factor = 10n ** BigInt(maximumFractionDigits);
  const fractionValue = remainder * factor / multiplier;
  return `${whole}.${fractionValue.toString().padStart(maximumFractionDigits, "0").replace(/0+$/, "")}`;
}

function canonicalInput(input: NormalizedStorageGrowthInput): StorageGrowthInput {
  return {
    currentData: canonicalDecimal(input.currentDataBytes, TB_BYTES, 12),
    annualGrowth: canonicalDecimal(BigInt(input.annualGrowthBasisPoints), 100n, 2),
    horizonYears: String(input.horizonYears),
    reserve: canonicalDecimal(BigInt(input.reserveBasisPoints), 100n, 2),
    layout: input.layout,
    driveCount: String(input.driveCount),
    driveSize: canonicalDecimal(input.driveSizeBytes, TB_BYTES, 12),
    drivePrice: canonicalDecimal(input.drivePriceMinor, 100n, 2),
    enclosureCost: canonicalDecimal(input.enclosureCostMinor, 100n, 2),
    averagePowerWatts: String(input.averagePowerWatts),
    hoursPerDay: String(input.hoursPerDay),
    electricityRate: canonicalDecimal(input.electricityRateMinor, 100n, 2),
    replacementReserve: canonicalDecimal(BigInt(input.replacementReserveBasisPoints), 100n, 2),
    backupAnnualBudget: canonicalDecimal(input.backupAnnualBudgetMinor, 100n, 2),
    currency: input.currency,
    displayUnit: input.displayUnit,
  };
}

export function calculateStorageGrowthPlan(input: unknown): StorageGrowthCalculationResult {
  const normalized = normalizeInput(input);
  if (!normalized.input) return { status: "invalid", values: null, issues: normalized.issues };
  const value = normalized.input;
  const dataMembers = value.layout === "mirror"
    ? value.driveCount / 2
    : value.driveCount - (value.layout === "single-parity" ? 1 : 2);
  const rawCapacityBytes = BigInt(value.driveCount) * value.driveSizeBytes;
  const modeledUsableBytes = BigInt(dataMembers) * value.driveSizeBytes;
  const redundancyBytes = rawCapacityBytes - modeledUsableBytes;
  const reserveBytes = modeledUsableBytes * BigInt(value.reserveBasisPoints) / 10_000n;
  const planningCapacityBytes = modeledUsableBytes - reserveBytes;
  const demandBytes = [value.currentDataBytes];
  for (let year = 1; year <= value.horizonYears; year += 1) {
    demandBytes.push(roundHalfUp(demandBytes[year - 1] * BigInt(10_000 + value.annualGrowthBasisPoints), 10_000n));
  }
  const shortfallYear = demandBytes.findIndex((demand) => demand > planningCapacityBytes);
  const energyWattHours = BigInt(value.averagePowerWatts) * BigInt(value.hoursPerDay) * 365n * BigInt(value.horizonYears);
  const hardwareMinor = value.enclosureCostMinor + BigInt(value.driveCount) * value.drivePriceMinor;
  const powerMinor = roundHalfUp(energyWattHours * value.electricityRateMinor, 1_000n);
  const replacementMinor = roundHalfUp(
    BigInt(value.driveCount) * value.drivePriceMinor * BigInt(value.replacementReserveBasisPoints) * BigInt(value.horizonYears),
    10_000n,
  );
  const backupMinor = value.backupAnnualBudgetMinor * BigInt(value.horizonYears);
  const totalMinor = hardwareMinor + powerMinor + replacementMinor + backupMinor;
  const costPerPlanningTbYearMinor = planningCapacityBytes > 0n
    ? roundHalfUp(totalMinor * TB_BYTES, planningCapacityBytes * BigInt(value.horizonYears))
    : null;
  return {
    status: "valid",
    issues: [],
    values: {
      input: value,
      dataMembers,
      rawCapacityBytes,
      modeledUsableBytes,
      redundancyBytes,
      reserveBytes,
      planningCapacityBytes,
      demandBytes,
      shortfallYear: shortfallYear === -1 ? null : shortfallYear,
      energyWattHours,
      costs: { hardwareMinor, powerMinor, replacementMinor, backupMinor, totalMinor },
      costPerPlanningTbYearMinor,
      metadata: {
        calculatorId: STORAGE_GROWTH_CALCULATOR_ID,
        calculationVersion: STORAGE_GROWTH_CALCULATION_VERSION,
        inputVersion: STORAGE_GROWTH_INPUT_VERSION,
        engineVersion: "1",
      },
    },
  };
}

export function validateStorageGrowthInput(input: unknown): input is StorageGrowthInput {
  return calculateStorageGrowthPlan(input).status === "valid";
}

function displayDivisor(unit: StorageGrowthDisplayUnit): bigint {
  return unit === "TB" ? TB_BYTES : TIB_BYTES;
}

function groupedInteger(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatCapacity(bytes: bigint, unit: StorageGrowthDisplayUnit, maximumFractionDigits = 2): string {
  const digits = Math.max(0, Math.min(12, maximumFractionDigits));
  const factor = 10n ** BigInt(digits);
  const scaled = roundHalfUp(bytes * factor, displayDivisor(unit));
  const whole = scaled / factor;
  const fraction = scaled % factor;
  if (fraction === 0n) return `${groupedInteger(whole.toString())} ${unit}`;
  return `${groupedInteger(whole.toString())}.${fraction.toString().padStart(digits, "0")} ${unit}`;
}

export function capacityNumber(bytes: bigint, unit: StorageGrowthDisplayUnit): number {
  return Number(bytes) / Number(displayDivisor(unit));
}

export function formatMoney(minor: bigint, currency: StorageGrowthCurrency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(minor) / 100);
}

function base64UrlEncode(value: string): string {
  let output = "";
  for (let index = 0; index < value.length; index += 3) {
    const first = value.charCodeAt(index);
    const second = index + 1 < value.length ? value.charCodeAt(index + 1) : 0;
    const third = index + 2 < value.length ? value.charCodeAt(index + 2) : 0;
    if (first > 255 || second > 255 || third > 255) throw new Error("state encoding");
    output += BASE64_ALPHABET[first >> 2];
    output += BASE64_ALPHABET[((first & 3) << 4) | (second >> 4)];
    output += index + 1 < value.length ? BASE64_ALPHABET[((second & 15) << 2) | (third >> 6)] : "=";
    output += index + 2 < value.length ? BASE64_ALPHABET[third & 63] : "=";
  }
  return output.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("state encoding");
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  let output = "";
  for (let index = 0; index < base64.length; index += 4) {
    const first = BASE64_ALPHABET.indexOf(base64[index]);
    const second = BASE64_ALPHABET.indexOf(base64[index + 1]);
    const third = base64[index + 2] === "=" ? 0 : BASE64_ALPHABET.indexOf(base64[index + 2]);
    const fourth = base64[index + 3] === "=" ? 0 : BASE64_ALPHABET.indexOf(base64[index + 3]);
    if (first < 0 || second < 0 || third < 0 || fourth < 0) throw new Error("state encoding");
    output += String.fromCharCode((first << 2) | (second >> 4));
    if (base64[index + 2] !== "=") output += String.fromCharCode(((second & 15) << 4) | (third >> 2));
    if (base64[index + 3] !== "=") output += String.fromCharCode(((third & 3) << 6) | fourth);
  }
  return output;
}

export function encodeStorageGrowthState(input: StorageGrowthInput): string {
  const result = calculateStorageGrowthPlan(input);
  if (result.status !== "valid") throw new Error("Cannot share an invalid plan");
  const payload = {
    calculatorId: STORAGE_GROWTH_CALCULATOR_ID,
    calculationVersion: STORAGE_GROWTH_CALCULATION_VERSION,
    inputVersion: STORAGE_GROWTH_INPUT_VERSION,
    input: canonicalInput(result.values.input),
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  if (encoded.length > MAX_STATE_LENGTH) throw new Error("Share state is too large");
  return encoded;
}

export function decodeStorageGrowthState(encoded: string): StorageGrowthStateResult {
  try {
    if (typeof encoded !== "string" || encoded.length === 0 || encoded.length > MAX_STATE_LENGTH) throw new Error("state size");
    const source = base64UrlDecode(encoded);
    if (source.includes("__proto__") || source.includes("constructor") || source.includes("prototype")) throw new Error("state keys");
    const parsed: unknown = JSON.parse(source);
    if (!hasExactKeys(parsed, STATE_KEYS)) throw new Error("state shape");
    if (parsed.calculatorId !== STORAGE_GROWTH_CALCULATOR_ID || parsed.calculationVersion !== STORAGE_GROWTH_CALCULATION_VERSION || parsed.inputVersion !== STORAGE_GROWTH_INPUT_VERSION) throw new Error("state version");
    if (!hasExactKeys(parsed.input, INPUT_KEYS)) throw new Error("input shape");
    const result = calculateStorageGrowthPlan(parsed.input);
    if (result.status !== "valid") throw new Error("input invalid");
    return { status: "valid", input: canonicalInput(result.values.input), message: "Shared plan loaded." };
  } catch {
    return { status: "invalid", input: null, message: "Shared plan could not load." };
  }
}

export function buildStorageGrowthCopySummary(input: StorageGrowthInput, values: StorageGrowthValues): string {
  const verdict = values.shortfallYear === null ? `Clears ${values.input.horizonYears} years.` : `Shortfall starts in year ${values.shortfallYear}.`;
  return [
    `Storage plan: ${verdict}`,
    `Planning capacity: ${formatCapacity(values.planningCapacityBytes, input.displayUnit)}.`,
    `Horizon demand: ${formatCapacity(values.demandBytes.at(-1) ?? 0n, input.displayUnit)}.`,
    `TCO: ${formatMoney(values.costs.totalMinor, input.currency)}.`,
    `Formula v${values.metadata.calculationVersion}.`,
  ].join("\n");
}

export function canonicalStorageGrowthInput(input: StorageGrowthInput): StorageGrowthInput | null {
  const result = calculateStorageGrowthPlan(input);
  return result.status === "valid" ? canonicalInput(result.values.input) : null;
}
