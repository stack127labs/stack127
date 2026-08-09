import { StorageValidationError } from "./types.ts";

export const storageCapacityUnits = ["B", "KB", "MB", "GB", "TB", "KiB", "MiB", "GiB", "TiB"] as const;
export type StorageCapacityUnit = (typeof storageCapacityUnits)[number];

const UNIT_BYTES: Readonly<Record<StorageCapacityUnit, bigint>> = Object.freeze({
  B: 1n,
  KB: 1_000n,
  MB: 1_000_000n,
  GB: 1_000_000_000n,
  TB: 1_000_000_000_000n,
  KiB: 1_024n,
  MiB: 1_048_576n,
  GiB: 1_073_741_824n,
  TiB: 1_099_511_627_776n,
});

function unitMultiplier(unit: StorageCapacityUnit) {
  const multiplier = UNIT_BYTES[unit];
  if (multiplier === undefined) {
    throw new StorageValidationError(`Unsupported capacity unit: ${String(unit)}.`);
  }
  return multiplier;
}

export function bytesFromUnit(value: string | bigint, unit: StorageCapacityUnit): bigint {
  const multiplier = unitMultiplier(unit);

  if (typeof value === "bigint") {
    if (value < 0n) {
      throw new StorageValidationError("Capacity cannot be negative.");
    }
    return value * multiplier;
  }

  const match = /^(0|[1-9]\d*)(?:\.(\d+))?$/.exec(value);
  if (!match) {
    throw new StorageValidationError("Capacity must be a non-negative decimal number without exponent notation.");
  }

  const fraction = match[2] ?? "";
  const denominator = 10n ** BigInt(fraction.length);
  const digits = BigInt(`${match[1]}${fraction}`);
  const numerator = digits * multiplier;

  if (numerator % denominator !== 0n) {
    throw new StorageValidationError("Capacity cannot be represented as a whole number of bytes.");
  }

  return numerator / denominator;
}

export function formatBytes(
  bytes: bigint,
  unit: StorageCapacityUnit,
  options: Readonly<{ maximumFractionDigits?: number; minimumFractionDigits?: number }> = {},
) {
  if (bytes < 0n) {
    throw new StorageValidationError("Capacity cannot be negative.");
  }

  const maximumFractionDigits = options.maximumFractionDigits ?? 2;
  const minimumFractionDigits = options.minimumFractionDigits ?? 0;
  if (!Number.isInteger(maximumFractionDigits) || maximumFractionDigits < 0 || maximumFractionDigits > 12) {
    throw new StorageValidationError("maximumFractionDigits must be an integer from 0 through 12.");
  }
  if (!Number.isInteger(minimumFractionDigits)
    || minimumFractionDigits < 0
    || minimumFractionDigits > maximumFractionDigits) {
    throw new StorageValidationError("minimumFractionDigits must be between zero and maximumFractionDigits.");
  }

  const multiplier = unitMultiplier(unit);
  const scale = 10n ** BigInt(maximumFractionDigits);
  const scaled = (bytes * scale + multiplier / 2n) / multiplier;
  const integerPart = scaled / scale;

  if (maximumFractionDigits === 0) {
    return `${integerPart} ${unit}`;
  }

  let fraction = (scaled % scale).toString().padStart(maximumFractionDigits, "0");
  while (fraction.length > minimumFractionDigits && fraction.endsWith("0")) {
    fraction = fraction.slice(0, -1);
  }

  return fraction.length > 0
    ? `${integerPart}.${fraction} ${unit}`
    : `${integerPart} ${unit}`;
}
