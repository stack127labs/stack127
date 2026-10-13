export const SHR_CALCULATION_VERSION = 1 as const;
export const SHR_INPUT_VERSION = 1 as const;
export const MAX_SHR_DRIVES = 32 as const;
export const MAX_SHR_DRIVE_BYTES = 10n ** 24n;
export const SHR_SYSTEM_RESERVE_BYTES_PER_DRIVE = 10_000_000_000n;
export const MAX_SHR_STATE_BYTES = 8_192;

export type ShrMode = "shr1" | "shr2";
export type ShrCapacityUnit = "GB" | "GiB" | "TB" | "TiB";

export type ShrDrive = {
  id: string;
  capacityBytes: bigint;
};

export type ShrInput = {
  mode: ShrMode;
  drives: readonly ShrDrive[];
};

export type ShrIssue = {
  path: string;
  message: string;
  severity: "error" | "warning";
};

export type ShrTier = {
  startBytes: bigint;
  endBytes: bigint;
  activeDrives: number;
  dataBytes: bigint;
  protectionBytes: bigint;
  unusedBytes: bigint;
};

export type ShrValues = {
  mode: ShrMode;
  parityDrives: 1 | 2;
  driveCount: number;
  rawCapacityBytes: bigint;
  dataBeforeSystemBytes: bigint;
  protectionBytes: bigint;
  unusedBytes: bigint;
  systemReserveBytes: bigint;
  estimatedPoolCapacityBytes: bigint;
  tiers: readonly ShrTier[];
  warnings: readonly string[];
};

export type ShrCalculationResult = {
  status: "valid" | "invalid";
  values: ShrValues | null;
  issues: readonly ShrIssue[];
  warnings: readonly string[];
};

export type DecodedShrState = {
  calculatorId: "shr-capacity";
  calculationVersion: typeof SHR_CALCULATION_VERSION;
  inputVersion: typeof SHR_INPUT_VERSION;
  payload: ShrInput;
};

const UNIT_FACTORS: Readonly<Record<ShrCapacityUnit, bigint>> = {
  GB: 1_000_000_000n,
  GiB: 1_073_741_824n,
  TB: 1_000_000_000_000n,
  TiB: 1_099_511_627_776n,
};

const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export class ShrInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShrInputError";
  }
}

export class ShrStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShrStateError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isShrUnit(value: unknown): value is ShrCapacityUnit {
  return value === "GB" || value === "GiB" || value === "TB" || value === "TiB";
}

function isShrMode(value: unknown): value is ShrMode {
  return value === "shr1" || value === "shr2";
}

function addIssue(issues: ShrIssue[], path: string, message: string, severity: ShrIssue["severity"] = "error") {
  issues.push({ path, message, severity });
}

export function parseCapacity(value: string, unit: ShrCapacityUnit): bigint {
  if (typeof value !== "string" || !isShrUnit(unit)) {
    throw new ShrInputError("Enter a plain decimal capacity and a supported unit.");
  }
  const normalized = value.trim();
  const match = /^(\d+)(?:\.(\d{1,12}))?$/.exec(normalized);
  if (!match) throw new ShrInputError("Enter a plain decimal capacity.");

  const wholeText = match[1].replace(/^0+(?=\d)/, "");
  const fractionText = match[2] ?? "";
  const scale = 10n ** BigInt(fractionText.length);
  const factor = UNIT_FACTORS[unit];
  const numerator = BigInt(wholeText) * factor * scale + BigInt(fractionText || "0") * factor;
  if (numerator % scale !== 0n) throw new ShrInputError("Use a capacity that resolves to whole bytes.");
  const bytes = numerator / scale;
  if (bytes <= 0n) throw new ShrInputError("Enter a positive capacity.");
  if (bytes > MAX_SHR_DRIVE_BYTES) throw new ShrInputError("Capacity is above the supported limit.");
  return bytes;
}

export function validateShrInput(input: unknown): readonly ShrIssue[] {
  const issues: ShrIssue[] = [];
  if (!isObject(input)) {
    addIssue(issues, "input", "Enter a valid SHR configuration.");
    return issues;
  }

  if (!isShrMode(input.mode)) addIssue(issues, "mode", "Choose SHR-1 or SHR-2.");
  if (!Array.isArray(input.drives)) {
    addIssue(issues, "drives", "Add drives to the inventory.");
    return issues;
  }
  if (input.drives.length === 0) addIssue(issues, "drives", "Add at least one drive.");
  if (input.drives.length > MAX_SHR_DRIVES) addIssue(issues, "drives", `Use at most ${MAX_SHR_DRIVES} drives.`);
  if (isShrMode(input.mode)) {
    const minimum = input.mode === "shr1" ? 2 : 4;
    if (input.drives.length > 0 && input.drives.length < minimum) {
      addIssue(issues, "drives", `${input.mode === "shr1" ? "SHR-1" : "SHR-2"} needs at least ${minimum} drives.`);
    }
  }

  const ids = new Set<string>();
  input.drives.forEach((drive, index) => {
    const path = `drives.${index}`;
    if (!isObject(drive)) {
      addIssue(issues, path, "Enter a valid drive.");
      return;
    }
    if (typeof drive.id !== "string" || !/^drive-\d+$/.test(drive.id)) {
      addIssue(issues, `${path}.id`, "Drive identity is invalid.");
    } else if (ids.has(drive.id)) {
      addIssue(issues, `${path}.id`, "Drive identities must be unique.");
    } else {
      ids.add(drive.id);
    }
    if (typeof drive.capacityBytes !== "bigint" || drive.capacityBytes <= 0n) {
      addIssue(issues, `${path}.capacityBytes`, "Drive capacity must be positive.");
    } else if (drive.capacityBytes > MAX_SHR_DRIVE_BYTES) {
      addIssue(issues, `${path}.capacityBytes`, "Drive capacity is above the supported limit.");
    }
  });

  return issues;
}

function parityForMode(mode: ShrMode): 1 | 2 {
  return mode === "shr1" ? 1 : 2;
}

export function calculateShrCapacity(input: ShrInput): ShrCalculationResult {
  const issues = validateShrInput(input);
  if (issues.some((issue) => issue.severity === "error")) {
    return { status: "invalid", values: null, issues, warnings: [] };
  }

  const parityDrives = parityForMode(input.mode);
  const sorted = [...input.drives].sort((left, right) => (
    left.capacityBytes < right.capacityBytes ? -1 : left.capacityBytes > right.capacityBytes ? 1 : 0
  ));
  const rawCapacityBytes = sorted.reduce((total, drive) => total + drive.capacityBytes, 0n);
  const thresholds = [...new Set(sorted.map((drive) => drive.capacityBytes.toString()))]
    .map((value) => BigInt(value))
    .sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
  const tiers: ShrTier[] = [];
  let previous = 0n;
  let dataBeforeSystemBytes = 0n;
  let protectionBytes = 0n;
  let unusedBytes = 0n;

  for (const threshold of thresholds) {
    const band = threshold - previous;
    const activeDrives = sorted.filter((drive) => drive.capacityBytes >= threshold).length;
    const dataBytes = activeDrives > parityDrives ? BigInt(activeDrives - parityDrives) * band : 0n;
    const protectionBand = activeDrives > parityDrives ? BigInt(parityDrives) * band : 0n;
    const unusedBand = activeDrives <= parityDrives ? BigInt(activeDrives) * band : 0n;
    dataBeforeSystemBytes += dataBytes;
    protectionBytes += protectionBand;
    unusedBytes += unusedBand;
    tiers.push({
      startBytes: previous,
      endBytes: threshold,
      activeDrives,
      dataBytes,
      protectionBytes: protectionBand,
      unusedBytes: unusedBand,
    });
    previous = threshold;
  }

  const systemReserveBytes = BigInt(sorted.length) * SHR_SYSTEM_RESERVE_BYTES_PER_DRIVE;
  const estimatedPoolCapacityBytes = dataBeforeSystemBytes > systemReserveBytes
    ? dataBeforeSystemBytes - systemReserveBytes
    : 0n;
  const warnings = dataBeforeSystemBytes <= systemReserveBytes
    ? ["The modeled system reserve leaves no estimated pool capacity."]
    : [];
  const values: ShrValues = {
    mode: input.mode,
    parityDrives,
    driveCount: sorted.length,
    rawCapacityBytes,
    dataBeforeSystemBytes,
    protectionBytes,
    unusedBytes,
    systemReserveBytes,
    estimatedPoolCapacityBytes,
    tiers,
    warnings,
  };
  return { status: "valid", values, issues: [], warnings };
}

export function formatCapacity(bytes: bigint, unit: ShrCapacityUnit, maximumFractionDigits = 2): string {
  if (!isShrUnit(unit)) throw new ShrInputError("Unsupported output unit.");
  if (bytes < 0n) throw new ShrInputError("Capacity cannot be negative.");
  const factor = UNIT_FACTORS[unit];
  const scale = 10n ** BigInt(maximumFractionDigits);
  const rounded = (bytes * scale + factor / 2n) / factor;
  const whole = rounded / scale;
  const fraction = maximumFractionDigits === 0
    ? ""
    : `.${(rounded % scale).toString().padStart(maximumFractionDigits, "0")}`.replace(/0+$/, "").replace(/\.$/, "");
  return `${whole}${fraction}`;
}

export function formatPercent(part: bigint, total: bigint): string {
  if (total <= 0n || part <= 0n) return "0%";
  const hundredths = (part * 10_000n + total / 2n) / total;
  if (hundredths === 0n) return "<0.01%";
  const whole = hundredths / 100n;
  const fraction = (hundredths % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}%` : `${whole}%`;
}

function assertSafeKeys(value: unknown, depth = 0): void {
  if (depth > 12) throw new ShrStateError("Shared configuration is too deeply nested.");
  if (Array.isArray(value)) {
    if (value.length > MAX_SHR_DRIVES + 16) throw new ShrStateError("Shared configuration is too large.");
    value.forEach((item) => assertSafeKeys(item, depth + 1));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (UNSAFE_KEYS.has(key)) throw new ShrStateError("Shared configuration contains unsafe data.");
    assertSafeKeys(child, depth + 1);
  }
}

function encodeUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeUtf8(value: string): string {
  if (!/^[A-Za-z0-9_-]*$/.test(value) || value.length % 4 === 1) throw new ShrStateError("Shared configuration is malformed.");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  let binary: string;
  try {
    binary = atob(padded);
  } catch {
    throw new ShrStateError("Shared configuration is malformed.");
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new ShrStateError("Shared configuration is not valid UTF-8.");
  }
}

export function encodeShrState(input: ShrInput): string {
  const result = calculateShrCapacity(input);
  if (result.status !== "valid") throw new ShrStateError("Only a valid configuration can be shared.");
  const envelope = {
    schema: 1,
    calculatorId: "shr-capacity",
    calculationVersion: SHR_CALCULATION_VERSION,
    inputVersion: SHR_INPUT_VERSION,
    payload: {
      mode: input.mode,
      drives: input.drives.map((drive) => ({ id: drive.id, capacityBytes: drive.capacityBytes.toString() })),
    },
  };
  return encodeUtf8(JSON.stringify(envelope));
}

export function decodeShrState(encoded: string): DecodedShrState {
  if (typeof encoded !== "string" || encoded.length === 0 || encoded.length > MAX_SHR_STATE_BYTES) {
    throw new ShrStateError("Shared configuration is too large or empty.");
  }
  const json = decodeUtf8(encoded);
  if (json.length > MAX_SHR_STATE_BYTES) throw new ShrStateError("Shared configuration is too large.");
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new ShrStateError("Shared configuration is malformed.");
  }
  assertSafeKeys(value);
  if (!isObject(value)
    || value.schema !== 1
    || value.calculatorId !== "shr-capacity"
    || value.calculationVersion !== SHR_CALCULATION_VERSION
    || value.inputVersion !== SHR_INPUT_VERSION
    || !isObject(value.payload)
    || !isShrMode(value.payload.mode)
    || !Array.isArray(value.payload.drives)) {
    throw new ShrStateError("Shared configuration version is not supported.");
  }
  const drives: ShrDrive[] = value.payload.drives.map((drive, index) => {
    if (!isObject(drive) || typeof drive.id !== "string" || typeof drive.capacityBytes !== "string") {
      throw new ShrStateError(`Shared drive ${index + 1} is invalid.`);
    }
    if (!/^(0|[1-9]\d*)$/.test(drive.capacityBytes)) {
      throw new ShrStateError(`Shared drive ${index + 1} is invalid.`);
    }
    let capacityBytes: bigint;
    try {
      capacityBytes = BigInt(drive.capacityBytes);
    } catch {
      throw new ShrStateError(`Shared drive ${index + 1} is invalid.`);
    }
    return { id: drive.id, capacityBytes };
  });
  const payload: ShrInput = { mode: value.payload.mode, drives };
  const result = calculateShrCapacity(payload);
  if (result.status !== "valid") throw new ShrStateError("Shared configuration is not a valid SHR pool.");
  return {
    calculatorId: "shr-capacity",
    calculationVersion: SHR_CALCULATION_VERSION,
    inputVersion: SHR_INPUT_VERSION,
    payload,
  };
}
