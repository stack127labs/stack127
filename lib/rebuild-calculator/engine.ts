export const FORMULA_VERSION = "rebuild-exposure-v1" as const;

export const DEFAULT_INPUT = Object.freeze({
  raidLevel: "raid6",
  driveCount: "6",
  driveCapacity: "8",
  capacityUnit: "TB",
  rebuildThroughput: "150",
  memberReadScope: "100",
  ureExponent: "15",
  replacementDelay: "0",
});

export const RAID_LEVELS = ["raid1", "raid5", "raid6", "raid10"] as const;
export type RaidLevel = (typeof RAID_LEVELS)[number];
export const CAPACITY_UNITS = ["GB", "TB", "PB"] as const;
export type CapacityUnit = (typeof CAPACITY_UNITS)[number];
export const URE_EXPONENTS = [14, 15, 16] as const;

export type RebuildInput = Readonly<{
  raidLevel: unknown;
  driveCount: unknown;
  driveCapacity: unknown;
  capacityUnit: unknown;
  rebuildThroughput: unknown;
  memberReadScope: unknown;
  ureExponent: unknown;
  replacementDelay: unknown;
}>;

export type RebuildField = keyof RebuildInput;

export type NormalizedRebuildInput = Readonly<{
  raidLevel: RaidLevel;
  driveCount: number;
  driveCapacity: number;
  capacityUnit: CapacityUnit;
  memberReadScope: number;
  readScopeFraction: number;
  rebuildThroughput: number;
  bytesPerSecond: number;
  ureExponent: number;
  ureBits: number;
  replacementDelay: number;
  replacementDelaySeconds: number;
}>;

export type InvalidRebuildResult = Readonly<{
  status: "invalid";
  errors: Partial<Record<RebuildField, string>>;
  firstInvalidField: RebuildField;
}>;

export type NormalizeResult =
  | Readonly<{ status: "success"; value: NormalizedRebuildInput }>
  | InvalidRebuildResult;

export type RebuildExposureResult =
  | Readonly<{
      status: "success";
      formulaVersion: typeof FORMULA_VERSION;
      input: NormalizedRebuildInput;
      memberBytes: number;
      sourceDriveEquivalents: number;
      readBytes: number;
      copySeconds: number;
      replacementDelaySeconds: number;
      degradedSeconds: number;
      lambda: number;
      readErrorProbability: number;
      readErrorTolerance: number;
    }>
  | InvalidRebuildResult;

const CAPACITY_BYTES: Record<CapacityUnit, number> = {
  GB: 1e9,
  TB: 1e12,
  PB: 1e15,
};

const EXPECTED_FIELDS = new Set<RebuildField>([
  "raidLevel",
  "driveCount",
  "driveCapacity",
  "capacityUnit",
  "rebuildThroughput",
  "memberReadScope",
  "ureExponent",
  "replacementDelay",
]);

const RAID_RULES: Record<RaidLevel, Readonly<{
  minimumDrives: number;
  maximumDrives: number;
  sourceDriveEquivalents: (driveCount: number) => number;
  readErrorTolerance: number;
}>> = {
  raid1: {
    minimumDrives: 2,
    maximumDrives: 2,
    sourceDriveEquivalents: () => 1,
    readErrorTolerance: 0,
  },
  raid5: {
    minimumDrives: 3,
    maximumDrives: 20,
    sourceDriveEquivalents: (driveCount) => driveCount - 1,
    readErrorTolerance: 0,
  },
  raid6: {
    minimumDrives: 4,
    maximumDrives: 20,
    sourceDriveEquivalents: (driveCount) => driveCount - 2,
    readErrorTolerance: 1,
  },
  raid10: {
    minimumDrives: 4,
    maximumDrives: 20,
    sourceDriveEquivalents: () => 1,
    readErrorTolerance: 0,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function parseDecimal(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseInteger(value: unknown): number | null {
  const parsed = parseDecimal(value);
  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
}

function invalid(errors: Partial<Record<RebuildField, string>>): InvalidRebuildResult {
  const firstInvalidField = Object.keys(errors)[0] as RebuildField | undefined;
  return {
    status: "invalid",
    errors,
    firstInvalidField: firstInvalidField ?? "raidLevel",
  };
}

function hasOnlyExpectedFields(value: Record<string, unknown>): boolean {
  return Object.keys(value).every((key) => EXPECTED_FIELDS.has(key as RebuildField));
}

function enumValue<T extends string>(value: unknown, values: readonly T[]): T | null {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : null;
}

function parseUreExponent(value: unknown): number | null {
  const parsed = parseInteger(value);
  return parsed !== null && URE_EXPONENTS.includes(parsed as (typeof URE_EXPONENTS)[number]) ? parsed : null;
}

function raidLabel(raidLevel: RaidLevel) {
  return `RAID ${raidLevel.slice(4)}`;
}

function validateDriveCount(raidLevel: RaidLevel, driveCount: number): string | null {
  const rule = RAID_RULES[raidLevel];
  if (raidLevel === "raid1" && driveCount !== 2) return "RAID 1 uses exactly 2 drives in this model.";
  const label = raidLabel(raidLevel);
  if (driveCount < rule.minimumDrives) return `${label} needs at least ${rule.minimumDrives} drives.`;
  if (driveCount > rule.maximumDrives) return `${label} supports at most ${rule.maximumDrives} drives.`;
  if (raidLevel === "raid10" && driveCount % 2 !== 0) return "RAID 10 needs an even drive count.";
  return null;
}

export function normalizeRebuildInput(candidate: unknown): NormalizeResult {
  if (!isRecord(candidate) || !hasOnlyExpectedFields(candidate)) {
    return invalid({ raidLevel: "Enter a supported RAID level." });
  }

  const raidLevel = enumValue(candidate.raidLevel, RAID_LEVELS);
  const capacityUnit = enumValue(candidate.capacityUnit, CAPACITY_UNITS);
  const driveCount = parseInteger(candidate.driveCount);
  const driveCapacity = parseDecimal(candidate.driveCapacity);
  const rebuildThroughput = parseDecimal(candidate.rebuildThroughput);
  const memberReadScope = parseDecimal(candidate.memberReadScope);
  const ureExponent = parseUreExponent(candidate.ureExponent);
  const replacementDelay = parseDecimal(candidate.replacementDelay);
  const errors: Partial<Record<RebuildField, string>> = {};

  if (!raidLevel) errors.raidLevel = "Choose a supported RAID level.";
  if (driveCount === null) errors.driveCount = "Enter a whole number of drives.";
  if (driveCapacity === null || driveCapacity <= 0 || driveCapacity > 100_000) {
    errors.driveCapacity = "Enter a capacity from 0 to 100000.";
  }
  if (!capacityUnit) errors.capacityUnit = "Choose a supported capacity unit.";
  if (rebuildThroughput === null || rebuildThroughput <= 0 || rebuildThroughput > 100_000) {
    errors.rebuildThroughput = "Enter throughput from 0 to 100000 MB/s.";
  }
  if (memberReadScope === null || memberReadScope < 1 || memberReadScope > 100) {
    errors.memberReadScope = "Enter a read scope from 1 to 100%.";
  }
  if (ureExponent === null) errors.ureExponent = "Choose a URE specification.";
  if (replacementDelay === null || replacementDelay < 0 || replacementDelay > 8760) {
    errors.replacementDelay = "Enter a delay from 0 to 8760 hours.";
  }

  if (raidLevel && driveCount !== null) {
    const driveCountError = validateDriveCount(raidLevel, driveCount);
    if (driveCountError) errors.driveCount = driveCountError;
  }

  if (Object.keys(errors).length > 0) return invalid(errors);

  const normalized: NormalizedRebuildInput = {
    raidLevel: raidLevel as RaidLevel,
    driveCount: driveCount as number,
    driveCapacity: driveCapacity as number,
    capacityUnit: capacityUnit as CapacityUnit,
    memberReadScope: memberReadScope as number,
    readScopeFraction: (memberReadScope as number) / 100,
    rebuildThroughput: rebuildThroughput as number,
    bytesPerSecond: (rebuildThroughput as number) * 1e6,
    ureExponent: ureExponent as number,
    ureBits: 10 ** (ureExponent as number),
    replacementDelay: replacementDelay as number,
    replacementDelaySeconds: (replacementDelay as number) * 3600,
  };
  return { status: "success", value: Object.freeze(normalized) };
}

export function calculateRebuildExposure(candidate: unknown): RebuildExposureResult {
  const normalized = normalizeRebuildInput(candidate);
  if (normalized.status === "invalid") return normalized;

  const { value } = normalized;
  const rule = RAID_RULES[value.raidLevel];
  const memberBytes = value.driveCapacity * CAPACITY_BYTES[value.capacityUnit];
  const sourceDriveEquivalents = rule.sourceDriveEquivalents(value.driveCount);
  const readBytes = sourceDriveEquivalents * memberBytes * value.readScopeFraction;
  const copySeconds = readBytes / value.bytesPerSecond;
  const degradedSeconds = value.replacementDelaySeconds + copySeconds;
  const lambda = (readBytes * 8) / value.ureBits;
  const readErrorProbability = -Math.expm1(-lambda);

  return {
    status: "success",
    formulaVersion: FORMULA_VERSION,
    input: value,
    memberBytes,
    sourceDriveEquivalents,
    readBytes,
    copySeconds,
    replacementDelaySeconds: value.replacementDelaySeconds,
    degradedSeconds,
    lambda,
    readErrorProbability,
    readErrorTolerance: rule.readErrorTolerance,
  };
}
