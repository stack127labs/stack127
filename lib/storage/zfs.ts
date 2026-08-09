import { createStorageCalculatorRegistry } from "./calculator.ts";
import { createStorageCalculationResult, storageValue } from "./result.ts";
import { calculateRaidzAllocation } from "./zfs-raidz-allocation.ts";
import {
  MAX_DRIVE_CAPACITY_BYTES,
  MAX_STORAGE_DRIVES,
  StorageValidationError,
  type StorageCalculationResult,
  type StorageDrive,
  type StorageIssue,
  type StorageValue,
} from "./types.ts";

export const ZFS_CALCULATION_VERSION = 1 as const;
export const ZFS_INPUT_VERSION = 1 as const;

export const zfsDataVdevTypes = ["mirror", "raidz1", "raidz2", "raidz3"] as const;
export type ZfsDataVdevType = (typeof zfsDataVdevTypes)[number];

export const zfsAuxiliaryRoles = ["spare", "slog", "l2arc", "special"] as const;
export type ZfsAuxiliaryRole = (typeof zfsAuxiliaryRoles)[number];
export type ZfsAuxiliaryLayout = "single" | "mirror";
export type ZfsWorkload = "filesystem" | "zvol";

export type ZfsDataVdevInput = Readonly<{
  id: string;
  type: ZfsDataVdevType;
  drives: readonly StorageDrive[];
}>;

export type ZfsAuxiliaryGroupInput = Readonly<{
  id: string;
  role: ZfsAuxiliaryRole;
  layout: ZfsAuxiliaryLayout;
  drives: readonly StorageDrive[];
}>;

export type ZfsCompressionRatio = Readonly<{
  numerator: number;
  denominator: 100;
}>;

export type ZfsCalculatorInput = Readonly<{
  dataVdevs: readonly ZfsDataVdevInput[];
  auxiliaryGroups: readonly ZfsAuxiliaryGroupInput[];
  workload: ZfsWorkload;
  blockSizeBytes: bigint;
  ashift: 9 | 12 | 13 | 14;
  slopShift: number;
  reserveBasisPoints: number;
  compressionRatio: ZfsCompressionRatio | null;
}>;

export type ZfsDataVdevResult = Readonly<{
  id: string;
  type: ZfsDataVdevType;
  label: string;
  driveIds: readonly string[];
  driveCount: number;
  parityCount: number;
  failureTolerance: number;
  failureStatement: string;
  enteredCapacityBytes: bigint;
  alignedCapacityBytes: bigint;
  commonMemberBytes: bigint;
  commonCapacityBytes: bigint;
  alignmentLossBytes: bigint;
  mixedSizeWasteBytes: bigint;
  logicalSectors: bigint;
  paritySectors: bigint;
  allocatedSectors: bigint;
  blockCount: bigint;
  logicalDataBytes: bigint;
  redundancyBytes: bigint;
  sectorRoundingBytes: bigint;
  raidzPaddingBytes: bigint;
  tailBytes: bigint;
}>;

export type ZfsSpecialVdevResult = Readonly<{
  id: string;
  driveCount: number;
  inventoryBytes: bigint;
  envelopeBytes: bigint;
  alignmentLossBytes: bigint;
  mixedSizeWasteBytes: bigint;
  failureTolerance: number;
}>;

export type ZfsRoleInventoryResult = Readonly<{
  role: ZfsAuxiliaryRole;
  driveCount: number;
  inventoryBytes: bigint;
  generalDataBytes: 0n;
}>;

export type ZfsCalculationValues = Readonly<{
  rawDataCapacityBytes: StorageValue<bigint>;
  dataBeforeSlopBytes: StorageValue<bigint>;
  slopBytes: StorageValue<bigint>;
  estimatedWritableBytes: StorageValue<bigint>;
  planningReserveBytes: StorageValue<bigint>;
  planningTargetBytes: StorageValue<bigint>;
  conditionalLogicalBytes: StorageValue<bigint> | null;
  losses: Readonly<{
    alignmentBytes: bigint;
    mixedSizeBytes: bigint;
    redundancyBytes: bigint;
    sectorRoundingBytes: bigint;
    raidzPaddingBytes: bigint;
    tailBytes: bigint;
  }>;
  dataVdevs: readonly ZfsDataVdevResult[];
  roleInventory: readonly ZfsRoleInventoryResult[];
  specialVdevs: readonly ZfsSpecialVdevResult[];
  commandTokens: readonly string[];
  command: string;
  ashift: number;
  blockSizeBytes: bigint;
  workload: ZfsWorkload;
  reserveBasisPoints: number;
  slopShift: number;
}>;

const KiB = 1_024n;
const MiB = 1_048_576n;
const GiB = 1_073_741_824n;
const MAX_VDEVS = 64;
const MAX_DRIVES_PER_GROUP = 64;
const MAX_AUXILIARY_GROUPS = 64;
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const dataTypeSet = new Set<string>(zfsDataVdevTypes);
const auxiliaryRoleSet = new Set<string>(zfsAuxiliaryRoles);
const ashiftSet = new Set([9, 12, 13, 14]);
const filesystemBlockSizes = new Set([
  4n * KiB, 8n * KiB, 16n * KiB, 32n * KiB, 64n * KiB, 128n * KiB,
  256n * KiB, 512n * KiB, MiB, 2n * MiB, 4n * MiB, 8n * MiB, 16n * MiB,
]);
const zvolBlockSizes = new Set([4n * KiB, 8n * KiB, 16n * KiB, 32n * KiB, 64n * KiB, 128n * KiB]);

const sources = Object.freeze([
  {
    title: "OpenZFS RAIDZ documentation",
    url: "https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html",
    checkedAt: "2026-08-04",
  },
  {
    title: "OpenZFS vdev_raidz.c",
    url: "https://github.com/openzfs/zfs/blob/master/module/zfs/vdev_raidz.c",
    checkedAt: "2026-08-04",
  },
  {
    title: "OpenZFS spa_misc.c",
    url: "https://github.com/openzfs/zfs/blob/master/module/zfs/spa_misc.c",
    checkedAt: "2026-08-04",
  },
  {
    title: "OpenZFS VDEVs documentation",
    url: "https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html",
    checkedAt: "2026-08-04",
  },
  {
    title: "OpenZFS zpool-create manual",
    url: "https://openzfs.github.io/openzfs-docs/man/master/8/zpool-create.8.html",
    checkedAt: "2026-08-04",
  },
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function issue(code: string, message: string, path?: string): StorageIssue {
  return { code, severity: "error", message, ...(path ? { path } : {}) };
}

function safeIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length <= 64 && identifierPattern.test(value);
}

function parityCount(type: ZfsDataVdevType) {
  return type === "raidz1" ? 1 : type === "raidz2" ? 2 : type === "raidz3" ? 3 : 0;
}

function minimumMembers(type: ZfsDataVdevType) {
  return type === "raidz2" ? 3 : type === "raidz3" ? 4 : 2;
}

function sum(values: readonly bigint[]) {
  return values.reduce((total, value) => total + value, 0n);
}

function minimum(values: readonly bigint[]) {
  return values.reduce((smallest, value) => value < smallest ? value : smallest, values[0]);
}

function validateDrive(
  candidate: unknown,
  expectedRole: "data" | ZfsAuxiliaryRole,
  expectedGroupId: string,
  path: string,
  seenDriveIds: Set<string>,
) {
  const issues: StorageIssue[] = [];
  if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["id", "capacityBytes", "role", "groupId"])) {
    return [issue("invalid_drive", "Drive input is invalid.", path)];
  }
  if (!safeIdentifier(candidate.id)) {
    issues.push(issue("invalid_drive_id", "Drive ID is invalid.", `${path}.id`));
  } else if (seenDriveIds.has(candidate.id)) {
    issues.push(issue("duplicate_drive_id", "Drive ID is duplicated.", `${path}.id`));
  } else {
    seenDriveIds.add(candidate.id);
  }
  if (typeof candidate.capacityBytes !== "bigint" || candidate.capacityBytes <= 0n) {
    issues.push(issue("invalid_capacity", "Capacity must be positive bytes.", `${path}.capacityBytes`));
  } else if (candidate.capacityBytes > MAX_DRIVE_CAPACITY_BYTES) {
    issues.push(issue("capacity_too_large", "Capacity exceeds the drive limit.", `${path}.capacityBytes`));
  }
  if (candidate.role !== expectedRole) {
    issues.push(issue("invalid_drive_role", "Drive role does not match.", `${path}.role`));
  }
  if (candidate.groupId !== expectedGroupId) {
    issues.push(issue("invalid_group_reference", "Drive group does not match.", `${path}.groupId`));
  }
  return issues;
}

function inputIssues(input: unknown): StorageIssue[] {
  if (!isRecord(input) || !hasOnlyKeys(input, [
    "dataVdevs", "auxiliaryGroups", "workload", "blockSizeBytes", "ashift",
    "slopShift", "reserveBasisPoints", "compressionRatio",
  ])) {
    return [issue("invalid_input", "Pool input is invalid.")];
  }

  const issues: StorageIssue[] = [];
  if (!Array.isArray(input.dataVdevs)) {
    issues.push(issue("invalid_data_vdevs", "Data vdevs must be an array.", "dataVdevs"));
  } else if (input.dataVdevs.length === 0) {
    issues.push(issue("empty_pool", "Add a data vdev.", "dataVdevs"));
  } else if (input.dataVdevs.length > MAX_VDEVS) {
    issues.push(issue("too_many_vdevs", "Too many data vdevs.", "dataVdevs"));
  }

  if (!Array.isArray(input.auxiliaryGroups)) {
    issues.push(issue("invalid_auxiliary_groups", "Auxiliary groups must be an array.", "auxiliaryGroups"));
  } else if (input.auxiliaryGroups.length > MAX_AUXILIARY_GROUPS) {
    issues.push(issue("too_many_auxiliary_groups", "Too many auxiliary groups.", "auxiliaryGroups"));
  }

  if (input.workload !== "filesystem" && input.workload !== "zvol") {
    issues.push(issue("invalid_workload", "Workload is invalid.", "workload"));
  }
  const blockSizes = input.workload === "zvol" ? zvolBlockSizes : filesystemBlockSizes;
  if (typeof input.blockSizeBytes !== "bigint" || !blockSizes.has(input.blockSizeBytes)) {
    issues.push(issue("invalid_block_size", "Block size is invalid.", "blockSizeBytes"));
  }
  if (typeof input.ashift !== "number" || !ashiftSet.has(input.ashift)) {
    issues.push(issue("invalid_ashift", "ashift is invalid.", "ashift"));
  }
  if (!Number.isSafeInteger(input.slopShift) || (input.slopShift as number) < 1 || (input.slopShift as number) > 31) {
    issues.push(issue("invalid_slop_shift", "Slop shift must be 1 to 31.", "slopShift"));
  }
  if (!Number.isSafeInteger(input.reserveBasisPoints)
    || (input.reserveBasisPoints as number) < 0
    || (input.reserveBasisPoints as number) > 5_000) {
    issues.push(issue("invalid_headroom", "Headroom must be 0 to 50%.", "reserveBasisPoints"));
  }
  if (input.compressionRatio !== null) {
    if (!isRecord(input.compressionRatio)
      || !hasOnlyKeys(input.compressionRatio, ["numerator", "denominator"])
      || input.compressionRatio.denominator !== 100
      || !Number.isSafeInteger(input.compressionRatio.numerator)
      || (input.compressionRatio.numerator as number) < 100
      || (input.compressionRatio.numerator as number) > 1_000) {
      issues.push(issue("invalid_compression", "Compression ratio is invalid.", "compressionRatio"));
    }
  }

  const seenGroupIds = new Set<string>();
  const seenDriveIds = new Set<string>();
  let totalDrives = 0;
  if (Array.isArray(input.dataVdevs)) {
    input.dataVdevs.forEach((candidate, index) => {
      const path = `dataVdevs[${index}]`;
      if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["id", "type", "drives"])) {
        issues.push(issue("invalid_data_vdev", "Data vdev is invalid.", path));
        return;
      }
      if (!safeIdentifier(candidate.id)) {
        issues.push(issue("invalid_vdev_id", "Vdev ID is invalid.", `${path}.id`));
      } else if (seenGroupIds.has(candidate.id)) {
        issues.push(issue("duplicate_vdev_id", "Vdev ID is duplicated.", `${path}.id`));
      } else {
        seenGroupIds.add(candidate.id);
      }
      if (typeof candidate.type !== "string" || !dataTypeSet.has(candidate.type)) {
        issues.push(issue("invalid_vdev_type", "Vdev type is invalid.", `${path}.type`));
      }
      if (!Array.isArray(candidate.drives)) {
        issues.push(issue("invalid_vdev_drives", "Vdev drives must be an array.", `${path}.drives`));
        return;
      }
      totalDrives += candidate.drives.length;
      if (candidate.drives.length > MAX_DRIVES_PER_GROUP) {
        issues.push(issue("vdev_too_wide", "A vdev supports at most 64 drives.", `${path}.drives`));
      }
      if (typeof candidate.type === "string" && dataTypeSet.has(candidate.type)
        && candidate.drives.length < minimumMembers(candidate.type as ZfsDataVdevType)) {
        issues.push(issue("not_enough_drives", `${candidate.type} needs more drives.`, `${path}.drives`));
      }
      if (safeIdentifier(candidate.id)) {
        candidate.drives.forEach((entry, driveIndex) => {
          issues.push(...validateDrive(entry, "data", candidate.id as string, `${path}.drives[${driveIndex}]`, seenDriveIds));
        });
      }
    });
  }

  if (Array.isArray(input.auxiliaryGroups)) {
    input.auxiliaryGroups.forEach((candidate, index) => {
      const path = `auxiliaryGroups[${index}]`;
      if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["id", "role", "layout", "drives"])) {
        issues.push(issue("invalid_auxiliary_group", "Auxiliary group is invalid.", path));
        return;
      }
      if (!safeIdentifier(candidate.id)) {
        issues.push(issue("invalid_auxiliary_id", "Auxiliary ID is invalid.", `${path}.id`));
      } else if (seenGroupIds.has(candidate.id)) {
        issues.push(issue("duplicate_group_id", "Group ID is duplicated.", `${path}.id`));
      } else {
        seenGroupIds.add(candidate.id);
      }
      if (typeof candidate.role !== "string" || !auxiliaryRoleSet.has(candidate.role)) {
        issues.push(issue("invalid_auxiliary_role", "Auxiliary role is invalid.", `${path}.role`));
      }
      if (candidate.layout !== "single" && candidate.layout !== "mirror") {
        issues.push(issue("invalid_auxiliary_layout", "Auxiliary layout is invalid.", `${path}.layout`));
      }
      if (!Array.isArray(candidate.drives)) {
        issues.push(issue("invalid_auxiliary_drives", "Auxiliary drives must be an array.", `${path}.drives`));
        return;
      }
      totalDrives += candidate.drives.length;
      if (candidate.drives.length > MAX_DRIVES_PER_GROUP) {
        issues.push(issue("auxiliary_too_wide", "An auxiliary supports at most 64 drives.", `${path}.drives`));
      }
      if ((candidate.role === "spare" || candidate.role === "l2arc")
        && (candidate.layout !== "single" || candidate.drives.length !== 1)) {
        issues.push(issue("invalid_single_auxiliary", "This role needs one drive.", `${path}.drives`));
      }
      if (candidate.role === "slog") {
        const validSlog = candidate.layout === "single"
          ? candidate.drives.length === 1
          : candidate.layout === "mirror" && candidate.drives.length >= 2;
        if (!validSlog) issues.push(issue("invalid_slog", "SLOG layout is incomplete.", `${path}.drives`));
      }
      if (candidate.role === "special" && (candidate.layout !== "mirror" || candidate.drives.length < 2)) {
        issues.push(issue("invalid_special", "Special requires a mirror.", `${path}.drives`));
      }
      if (safeIdentifier(candidate.id) && typeof candidate.role === "string" && auxiliaryRoleSet.has(candidate.role)) {
        candidate.drives.forEach((entry, driveIndex) => {
          issues.push(...validateDrive(
            entry,
            candidate.role as ZfsAuxiliaryRole,
            candidate.id as string,
            `${path}.drives[${driveIndex}]`,
            seenDriveIds,
          ));
        });
      }
    });
  }

  if (totalDrives > MAX_STORAGE_DRIVES) {
    issues.push(issue("too_many_drives", `At most ${MAX_STORAGE_DRIVES} drives are supported.`, "dataVdevs"));
  }
  return issues;
}

export function validateZfsCalculatorInput(input: unknown): input is ZfsCalculatorInput {
  return inputIssues(input).length === 0;
}

function invalidResult(issues: readonly StorageIssue[]): StorageCalculationResult<ZfsCalculationValues> {
  return createStorageCalculationResult({
    calculator: { id: "zfs-pool-capacity", version: ZFS_CALCULATION_VERSION },
    values: null,
    issues,
    assumptions: [],
    derivation: [],
    sources,
    uncertainty: { kind: "unknown", statement: "No capacity is available for invalid input." },
  });
}

function calculateDataVdev(vdev: ZfsDataVdevInput, ashift: number, blockSizeBytes: bigint): ZfsDataVdevResult {
  const sectorBytes = 1n << BigInt(ashift);
  const capacities = vdev.drives.map((drive) => drive.capacityBytes);
  const aligned = capacities.map((capacity) => capacity / sectorBytes * sectorBytes);
  const enteredCapacityBytes = sum(capacities);
  const alignedCapacityBytes = sum(aligned);
  const alignmentLossBytes = enteredCapacityBytes - alignedCapacityBytes;
  const commonMemberBytes = minimum(aligned);
  const commonCapacityBytes = commonMemberBytes * BigInt(vdev.drives.length);
  const mixedSizeWasteBytes = alignedCapacityBytes - commonCapacityBytes;
  const logicalSectors = (blockSizeBytes + sectorBytes - 1n) / sectorBytes;
  const physicalCopyBytes = logicalSectors * sectorBytes;
  const sectorRoundingPerBlock = physicalCopyBytes - blockSizeBytes;
  const parity = parityCount(vdev.type);
  let paritySectors = 0n;
  let allocatedSectors = logicalSectors;
  if (parity > 0) {
    const allocation = calculateRaidzAllocation({
      logicalBytes: blockSizeBytes,
      sectorBytes,
      width: vdev.drives.length,
      parity,
    });
    paritySectors = allocation.paritySectors;
    allocatedSectors = allocation.allocatedSectors;
  }
  const blockCount = parity === 0
    ? commonMemberBytes / physicalCopyBytes
    : (commonCapacityBytes / sectorBytes) / allocatedSectors;
  const logicalDataBytes = blockCount * blockSizeBytes;
  const redundancyBytes = parity === 0
    ? blockCount * BigInt(vdev.drives.length - 1) * physicalCopyBytes
    : blockCount * paritySectors * sectorBytes;
  const sectorRoundingBytes = blockCount * sectorRoundingPerBlock;
  const raidzPaddingBytes = parity === 0
    ? 0n
    : blockCount * (allocatedSectors - logicalSectors - paritySectors) * sectorBytes;
  const consumedCommonBytes = parity === 0
    ? blockCount * BigInt(vdev.drives.length) * physicalCopyBytes
    : blockCount * allocatedSectors * sectorBytes;
  const tailBytes = commonCapacityBytes - consumedCommonBytes;
  const failureTolerance = parity === 0 ? vdev.drives.length - 1 : parity;
  const label = vdev.type === "mirror" ? "Mirror" : vdev.type.toUpperCase();
  return {
    id: vdev.id,
    type: vdev.type,
    label,
    driveIds: vdev.drives.map((drive) => drive.id),
    driveCount: vdev.drives.length,
    parityCount: parity,
    failureTolerance,
    failureStatement: `Any ${failureTolerance} member${failureTolerance === 1 ? "" : "s"} in this vdev.`,
    enteredCapacityBytes,
    alignedCapacityBytes,
    commonMemberBytes,
    commonCapacityBytes,
    alignmentLossBytes,
    mixedSizeWasteBytes,
    logicalSectors,
    paritySectors,
    allocatedSectors,
    blockCount,
    logicalDataBytes,
    redundancyBytes,
    sectorRoundingBytes,
    raidzPaddingBytes,
    tailBytes,
  };
}

export function zfsSlopBytes(dataBytes: bigint, slopShift: number) {
  if (dataBytes < 0n || !Number.isSafeInteger(slopShift) || slopShift < 1 || slopShift > 31) {
    throw new StorageValidationError("Slop input is invalid.");
  }
  const minimumSlop = 128n * MiB;
  const maximumSlop = 128n * GiB;
  const shifted = dataBytes >> BigInt(slopShift);
  const capped = shifted < maximumSlop ? shifted : maximumSlop;
  const smallPoolLimit = dataBytes >> 1n;
  const floor = smallPoolLimit < minimumSlop ? smallPoolLimit : minimumSlop;
  return capped > floor ? capped : floor;
}

function specialResult(group: ZfsAuxiliaryGroupInput, ashift: number): ZfsSpecialVdevResult {
  const sectorBytes = 1n << BigInt(ashift);
  const capacities = group.drives.map((drive) => drive.capacityBytes);
  const aligned = capacities.map((capacity) => capacity / sectorBytes * sectorBytes);
  const inventoryBytes = sum(capacities);
  const alignedBytes = sum(aligned);
  const envelopeBytes = minimum(aligned);
  return {
    id: group.id,
    driveCount: group.drives.length,
    inventoryBytes,
    envelopeBytes,
    alignmentLossBytes: inventoryBytes - alignedBytes,
    mixedSizeWasteBytes: alignedBytes - envelopeBytes * BigInt(group.drives.length),
    failureTolerance: group.drives.length - 1,
  };
}

function placeholder(role: string, groupIndex: number, driveIndex: number) {
  return `<${role}-${groupIndex + 1}-drive-${driveIndex + 1}>`;
}

export function buildZfsCommandTokens(input: ZfsCalculatorInput): readonly string[] {
  if (!validateZfsCalculatorInput(input)) throw new StorageValidationError("ZFS input is invalid.");
  const tokens = ["zpool", "create", "-n", "-o", `ashift=${input.ashift}`, "<pool-name>"];
  input.dataVdevs.forEach((vdev, groupIndex) => {
    tokens.push(vdev.type);
    vdev.drives.forEach((_drive, driveIndex) => tokens.push(placeholder("data-vdev", groupIndex, driveIndex)));
  });
  input.auxiliaryGroups.forEach((group, groupIndex) => {
    if (group.role === "slog") tokens.push("log");
    if (group.role === "l2arc") tokens.push("cache");
    if (group.role === "spare") tokens.push("spare");
    if (group.role === "special") tokens.push("special");
    if (group.layout === "mirror") tokens.push("mirror");
    group.drives.forEach((_drive, driveIndex) => tokens.push(placeholder(group.role, groupIndex, driveIndex)));
  });
  return Object.freeze(tokens);
}

export function calculateZfsPoolCapacity(input: unknown): StorageCalculationResult<ZfsCalculationValues> {
  const issues = inputIssues(input);
  if (issues.length > 0) return invalidResult(issues);
  const normalized = input as ZfsCalculatorInput;
  const dataVdevs = normalized.dataVdevs.map((vdev) => (
    calculateDataVdev(vdev, normalized.ashift, normalized.blockSizeBytes)
  ));
  const rawDataCapacityBytes = sum(dataVdevs.map((vdev) => vdev.enteredCapacityBytes));
  const dataBeforeSlopBytes = sum(dataVdevs.map((vdev) => vdev.logicalDataBytes));
  const losses = {
    alignmentBytes: sum(dataVdevs.map((vdev) => vdev.alignmentLossBytes)),
    mixedSizeBytes: sum(dataVdevs.map((vdev) => vdev.mixedSizeWasteBytes)),
    redundancyBytes: sum(dataVdevs.map((vdev) => vdev.redundancyBytes)),
    sectorRoundingBytes: sum(dataVdevs.map((vdev) => vdev.sectorRoundingBytes)),
    raidzPaddingBytes: sum(dataVdevs.map((vdev) => vdev.raidzPaddingBytes)),
    tailBytes: sum(dataVdevs.map((vdev) => vdev.tailBytes)),
  };
  const reconciled = dataBeforeSlopBytes
    + losses.alignmentBytes
    + losses.mixedSizeBytes
    + losses.redundancyBytes
    + losses.sectorRoundingBytes
    + losses.raidzPaddingBytes
    + losses.tailBytes;
  if (reconciled !== rawDataCapacityBytes) {
    throw new StorageValidationError("ZFS capacity accounting did not reconcile.");
  }

  const slopBytes = zfsSlopBytes(dataBeforeSlopBytes, normalized.slopShift);
  const estimatedWritableBytes = dataBeforeSlopBytes > slopBytes ? dataBeforeSlopBytes - slopBytes : 0n;
  const planningReserveBytes = estimatedWritableBytes * BigInt(normalized.reserveBasisPoints) / 10_000n;
  const planningTargetBytes = estimatedWritableBytes - planningReserveBytes;
  const conditionalLogicalBytes = normalized.compressionRatio === null
    ? null
    : planningTargetBytes * BigInt(normalized.compressionRatio.numerator)
      / BigInt(normalized.compressionRatio.denominator);

  const roleMap = new Map<ZfsAuxiliaryRole, { driveCount: number; inventoryBytes: bigint }>();
  for (const group of normalized.auxiliaryGroups) {
    const current = roleMap.get(group.role) ?? { driveCount: 0, inventoryBytes: 0n };
    roleMap.set(group.role, {
      driveCount: current.driveCount + group.drives.length,
      inventoryBytes: current.inventoryBytes + sum(group.drives.map((drive) => drive.capacityBytes)),
    });
  }
  const roleInventory = zfsAuxiliaryRoles.flatMap((role) => {
    const row = roleMap.get(role);
    return row ? [{ role, ...row, generalDataBytes: 0n as const }] : [];
  });
  const specialVdevs = normalized.auxiliaryGroups
    .filter((group) => group.role === "special")
    .map((group) => specialResult(group, normalized.ashift));
  const commandTokens = buildZfsCommandTokens(normalized);
  const value = (label: string, bytes: bigint, classification: "theoretical" | "estimated" = "estimated") => storageValue({
    label,
    value: bytes,
    unit: "bytes",
    classification,
  });

  return createStorageCalculationResult({
    calculator: { id: "zfs-pool-capacity", version: ZFS_CALCULATION_VERSION },
    values: {
      rawDataCapacityBytes: value("Entered data-device capacity", rawDataCapacityBytes, "theoretical"),
      dataBeforeSlopBytes: value("Estimated data before slop", dataBeforeSlopBytes),
      slopBytes: value("OpenZFS slop estimate", slopBytes),
      estimatedWritableBytes: value("Estimated writable physical data", estimatedWritableBytes),
      planningReserveBytes: value("Planning headroom", planningReserveBytes),
      planningTargetBytes: value("Planning target", planningTargetBytes),
      conditionalLogicalBytes: conditionalLogicalBytes === null
        ? null
        : value("Conditional logical data", conditionalLogicalBytes),
      losses,
      dataVdevs,
      roleInventory,
      specialVdevs,
      commandTokens,
      command: commandTokens.join(" "),
      ashift: normalized.ashift,
      blockSizeBytes: normalized.blockSizeBytes,
      workload: normalized.workload,
      reserveBasisPoints: normalized.reserveBasisPoints,
      slopShift: normalized.slopShift,
    },
    issues: [],
    assumptions: [
      { id: "fresh_pool", statement: "The topology is a fresh planned pool." },
      { id: "selected_block", statement: "Every modelled block uses the selected block size." },
      { id: "entered_capacity", statement: "Entered capacity is offered to OpenZFS." },
      { id: "slop_boundary", statement: "Embedded-log space is excluded from slop." },
    ],
    derivation: [
      { id: "data_balance", expression: "data plus allocation losses", result: `${reconciled} bytes` },
      { id: "writable", expression: "data before slop minus slop", result: `${estimatedWritableBytes} bytes` },
      { id: "planning", expression: "writable minus user headroom", result: `${planningTargetBytes} bytes` },
    ],
    sources,
    uncertainty: {
      kind: "modelled",
      statement: "The result models a fresh pool using one selected logical block size.",
    },
  });
}

export const zfsCalculatorAdapter = Object.freeze({
  calculatorId: "zfs-pool-capacity",
  calculationVersion: ZFS_CALCULATION_VERSION,
  inputVersion: ZFS_INPUT_VERSION,
  validateInput: validateZfsCalculatorInput,
  calculate: calculateZfsPoolCapacity,
});

export const zfsCalculatorRegistry = createStorageCalculatorRegistry();
zfsCalculatorRegistry.register(zfsCalculatorAdapter);
