import { createStorageCalculatorRegistry } from "./calculator.ts";
import { createDriveInventory, summarizeDriveInventory, validateDriveInventory } from "./inventory.ts";
import { createStorageCalculationResult, storageValue } from "./result.ts";
import type {
  StorageCalculationResult,
  StorageDrive,
  StorageIssue,
  StorageValue,
} from "./types.ts";

export const RAID_CALCULATION_VERSION = 1 as const;
export const RAID_INPUT_VERSION = 1 as const;

export const raidLevels = [
  "raid0",
  "raid1",
  "raid5",
  "raid6",
  "raid10",
  "raid50",
  "raid60",
  "linear",
  "jbod",
] as const;

export type RaidLevel = (typeof raidLevels)[number];

export const raidLevelDetails: Readonly<Record<RaidLevel, Readonly<{
  label: string;
  shortLabel: string;
  minimumDrives: number;
}>>> = Object.freeze({
  raid0: { label: "RAID 0", shortLabel: "0", minimumDrives: 2 },
  raid1: { label: "RAID 1", shortLabel: "1", minimumDrives: 2 },
  raid5: { label: "RAID 5", shortLabel: "5", minimumDrives: 3 },
  raid6: { label: "RAID 6", shortLabel: "6", minimumDrives: 4 },
  raid10: { label: "RAID 10", shortLabel: "10", minimumDrives: 4 },
  raid50: { label: "RAID 50", shortLabel: "50", minimumDrives: 6 },
  raid60: { label: "RAID 60", shortLabel: "60", minimumDrives: 8 },
  linear: { label: "Linear", shortLabel: "Linear", minimumDrives: 1 },
  jbod: { label: "JBOD", shortLabel: "JBOD", minimumDrives: 1 },
});

export type RaidCalculatorInput = Readonly<{
  level: RaidLevel;
  drives: readonly StorageDrive[];
  groupSize: number | null;
}>;

export type RaidGroupResult = Readonly<{
  id: string;
  label: string;
  kind: "stripe" | "mirror" | "raid5" | "raid6" | "linear" | "jbod";
  driveIds: readonly string[];
  rawCapacityBytes: bigint;
  componentCapacityBytes: bigint | null;
  usableCapacityBytes: bigint;
  redundancyBytes: bigint;
  sizeMismatchBytes: bigint;
}>;

export type RaidFailureTolerance = Readonly<{
  guaranteedFailures: number;
  maximumFailures: number;
  statement: string;
}>;

export type RaidSmallRandomWrite = Readonly<{
  operations: number;
  statement: string;
}>;

export type RaidCalculationValues = Readonly<{
  level: RaidLevel;
  levelLabel: string;
  driveCount: number;
  minimumDriveCount: number;
  rawCapacityBytes: StorageValue<bigint>;
  usableCapacityBytes: StorageValue<bigint>;
  redundancyBytes: StorageValue<bigint>;
  sizeMismatchBytes: StorageValue<bigint>;
  unavailableCapacityBytes: StorageValue<bigint>;
  groups: readonly RaidGroupResult[];
  failureTolerance: RaidFailureTolerance;
  smallRandomWrite: RaidSmallRandomWrite;
}>;

const raidSource = {
  title: "Linux kernel RAID array documentation",
  url: "https://docs.kernel.org/admin-guide/md.html",
  checkedAt: "2026-08-01",
} as const;

const mdadmSource = {
  title: "mdadm(8) manual",
  url: "https://man7.org/linux/man-pages/man8/mdadm.8.html",
  checkedAt: "2026-08-01",
} as const;

const writeSource = {
  title: "Dell Unity drive IOPS by RAID type",
  url: "https://www.dell.com/support/manuals/en-us/unity-880f/unity_p_pool_config/drive-iops-by-raid-type?guid=guid-b32204b2-a11b-4f25-b086-e8c135df04f1&lang=en-us",
  checkedAt: "2026-08-01",
} as const;

function isRaidLevel(value: unknown): value is RaidLevel {
  return typeof value === "string" && (raidLevels as readonly string[]).includes(value);
}

export function validateRaidCalculatorInput(input: unknown): input is RaidCalculatorInput {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return false;
  const candidate = input as Record<string, unknown>;
  if (!isRaidLevel(candidate.level)) return false;
  if (!validateDriveInventory(candidate.drives).valid) return false;
  if (!(candidate.drives as readonly StorageDrive[]).every((drive) => drive.role === "data")) return false;
  return candidate.groupSize === null
    || (Number.isSafeInteger(candidate.groupSize) && (candidate.groupSize as number) >= 1);
}

function invalidResult(issues: readonly StorageIssue[]): StorageCalculationResult<RaidCalculationValues> {
  return createStorageCalculationResult({
    calculator: { id: "raid-capacity", version: RAID_CALCULATION_VERSION },
    values: null,
    issues,
    assumptions: [],
    derivation: [],
    sources: [raidSource, mdadmSource, writeSource],
    uncertainty: {
      kind: "unknown",
      statement: "No capacity result is available until the array topology is valid.",
    },
  });
}

function topologyIssues(input: RaidCalculatorInput): StorageIssue[] {
  const issues: StorageIssue[] = [];
  const details = raidLevelDetails[input.level];
  if (input.drives.length < details.minimumDrives) {
    issues.push({
      code: "not_enough_drives",
      severity: "error",
      message: `${details.label} needs at least ${details.minimumDrives} drives.`,
      path: "drives",
    });
  }

  if (input.level === "raid10") {
    if (input.groupSize !== 2) {
      issues.push({
        code: "invalid_group_size",
        severity: "error",
        message: "Conventional RAID 10 uses visible two-drive mirror pairs in this calculator.",
        path: "groupSize",
      });
    }
    if (input.drives.length % 2 !== 0) {
      issues.push({
        code: "uneven_mirror_pairs",
        severity: "error",
        message: "RAID 10 needs an even number of drives so every drive has one mirror partner.",
        path: "drives",
      });
    }
  } else if (input.level === "raid50" || input.level === "raid60") {
    const minimumGroupSize = input.level === "raid50" ? 3 : 4;
    if (input.groupSize === null || input.groupSize < minimumGroupSize) {
      issues.push({
        code: "invalid_group_size",
        severity: "error",
        message: `${details.label} needs at least ${minimumGroupSize} drives in each subgroup.`,
        path: "groupSize",
      });
    } else {
      if (input.drives.length % input.groupSize !== 0) {
        issues.push({
          code: "incomplete_subgroup",
          severity: "error",
          message: `The ${input.drives.length} drives do not divide into equal groups of ${input.groupSize}.`,
          path: "groupSize",
        });
      }
      if (input.drives.length / input.groupSize < 2) {
        issues.push({
          code: "not_enough_subgroups",
          severity: "error",
          message: `${details.label} needs at least two subgroups.`,
          path: "groupSize",
        });
      }
    }
  } else if (input.groupSize !== null) {
    issues.push({
      code: "group_size_not_applicable",
      severity: "error",
      message: `${details.label} does not use nested subgroups in this calculator.`,
      path: "groupSize",
    });
  }

  return issues;
}

function groupLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function calculateClippedGroup(
  drives: readonly StorageDrive[],
  index: number,
  kind: RaidGroupResult["kind"],
  dataMembers: number,
  nested: boolean,
): RaidGroupResult {
  const rawCapacityBytes = drives.reduce((total, drive) => total + drive.capacityBytes, 0n);
  const componentCapacityBytes = drives.reduce(
    (smallest, drive) => drive.capacityBytes < smallest ? drive.capacityBytes : smallest,
    drives[0].capacityBytes,
  );
  const commonCapacityBytes = componentCapacityBytes * BigInt(drives.length);
  const usableCapacityBytes = componentCapacityBytes * BigInt(dataMembers);
  const labelPrefix = nested ? `Group ${groupLetter(index)}` : "Array";
  const kindLabel = kind === "mirror" ? "mirror"
    : kind === "raid5" ? "RAID 5"
      : kind === "raid6" ? "RAID 6"
        : "stripe";

  return Object.freeze({
    id: nested ? `group-${groupLetter(index).toLowerCase()}` : "array",
    label: `${labelPrefix}, ${kindLabel}`,
    kind,
    driveIds: Object.freeze(drives.map((drive) => drive.id)),
    rawCapacityBytes,
    componentCapacityBytes,
    usableCapacityBytes,
    redundancyBytes: commonCapacityBytes - usableCapacityBytes,
    sizeMismatchBytes: rawCapacityBytes - commonCapacityBytes,
  });
}

function calculateFullCapacityGroup(
  drives: readonly StorageDrive[],
  kind: "linear" | "jbod",
): RaidGroupResult {
  const capacity = drives.reduce((total, drive) => total + drive.capacityBytes, 0n);
  return Object.freeze({
    id: "array",
    label: kind === "linear" ? "Array, linear" : "Array, JBOD",
    kind,
    driveIds: Object.freeze(drives.map((drive) => drive.id)),
    rawCapacityBytes: capacity,
    componentCapacityBytes: null,
    usableCapacityBytes: capacity,
    redundancyBytes: 0n,
    sizeMismatchBytes: 0n,
  });
}

function buildGroups(input: RaidCalculatorInput): readonly RaidGroupResult[] {
  const { drives, level } = input;
  if (level === "linear" || level === "jbod") {
    return Object.freeze([calculateFullCapacityGroup(drives, level)]);
  }
  if (level === "raid10") {
    return Object.freeze(Array.from({ length: drives.length / 2 }, (_, index) => (
      calculateClippedGroup(drives.slice(index * 2, index * 2 + 2), index, "mirror", 1, true)
    )));
  }
  if (level === "raid50" || level === "raid60") {
    const groupSize = input.groupSize as number;
    const parityMembers = level === "raid50" ? 1 : 2;
    const kind = level === "raid50" ? "raid5" : "raid6";
    return Object.freeze(Array.from({ length: drives.length / groupSize }, (_, index) => (
      calculateClippedGroup(
        drives.slice(index * groupSize, index * groupSize + groupSize),
        index,
        kind,
        groupSize - parityMembers,
        true,
      )
    )));
  }

  const kind = level === "raid1" ? "mirror"
    : level === "raid5" ? "raid5"
      : level === "raid6" ? "raid6"
        : "stripe";
  const dataMembers = level === "raid1" ? 1
    : level === "raid5" ? drives.length - 1
      : level === "raid6" ? drives.length - 2
        : drives.length;
  return Object.freeze([calculateClippedGroup(drives, 0, kind, dataMembers, false)]);
}

function failureTolerance(level: RaidLevel, driveCount: number, groupCount: number): RaidFailureTolerance {
  if (level === "raid1") {
    return Object.freeze({
      guaranteedFailures: driveCount - 1,
      maximumFailures: driveCount - 1,
      statement: `Any ${driveCount - 1} of the ${driveCount} mirror members can fail while one complete copy remains.`,
    });
  }
  if (level === "raid5") {
    return Object.freeze({ guaranteedFailures: 1, maximumFailures: 1, statement: "Any one drive can fail." });
  }
  if (level === "raid6") {
    return Object.freeze({ guaranteedFailures: 2, maximumFailures: 2, statement: "Any two drives can fail." });
  }
  if (level === "raid10") {
    return Object.freeze({
      guaranteedFailures: 1,
      maximumFailures: groupCount,
      statement: `Any one drive can fail. Up to ${groupCount} can fail only when no mirror pair loses both members, which means one drive in each mirror pair.`,
    });
  }
  if (level === "raid50") {
    return Object.freeze({
      guaranteedFailures: 1,
      maximumFailures: groupCount,
      statement: `Any one drive can fail. Up to ${groupCount} can fail only when there is one failed drive in every RAID 5 group.`,
    });
  }
  if (level === "raid60") {
    return Object.freeze({
      guaranteedFailures: 2,
      maximumFailures: groupCount * 2,
      statement: `Any two drives can fail. Up to ${groupCount * 2} can fail only when no RAID 6 group loses more than two drives.`,
    });
  }
  return Object.freeze({
    guaranteedFailures: 0,
    maximumFailures: 0,
    statement: level === "raid0"
      ? "There is no redundancy. One failed member makes the striped array incomplete."
      : "There is no array-level redundancy in this capacity model.",
  });
}

function smallRandomWrite(level: RaidLevel, driveCount: number): RaidSmallRandomWrite {
  if (level === "raid1") {
    return Object.freeze({
      operations: driveCount,
      statement: `One host write is written to all ${driveCount} mirror members. This is an architecture reference, not a performance prediction.`,
    });
  }
  const operations = level === "raid5" || level === "raid50" ? 4
    : level === "raid6" || level === "raid60" ? 6
      : level === "raid10" ? 2
        : 1;
  return Object.freeze({
    operations,
    statement: `${operations} backend I/O operation${operations === 1 ? "" : "s"} in the classic small random write model. This is not a performance prediction.`,
  });
}

export function calculateRaidCapacity(input: RaidCalculatorInput): StorageCalculationResult<RaidCalculationValues> {
  const drives = createDriveInventory(input.drives);
  const normalizedInput = { ...input, drives };
  const errors = topologyIssues(normalizedInput);
  if (errors.length > 0) return invalidResult(errors);

  const groups = buildGroups(normalizedInput);
  const summary = summarizeDriveInventory(drives);
  const usableCapacityBytes = groups.reduce((total, group) => total + group.usableCapacityBytes, 0n);
  const redundancyBytes = groups.reduce((total, group) => total + group.redundancyBytes, 0n);
  const sizeMismatchBytes = groups.reduce((total, group) => total + group.sizeMismatchBytes, 0n);
  const unavailableCapacityBytes = redundancyBytes + sizeMismatchBytes;
  const details = raidLevelDetails[input.level];
  const issues: StorageIssue[] = [];
  if (sizeMismatchBytes > 0n) {
    issues.push({
      code: "mixed_drive_sizes",
      severity: "warning",
      message: "At least one group contains mixed-size drives, so capacity above that group's smallest member is unavailable in this model.",
      path: "drives",
    });
  }

  const capacityValue = (label: string, value: bigint) => storageValue({
    label,
    value,
    unit: "bytes",
    classification: "theoretical",
  });

  return createStorageCalculationResult({
    calculator: { id: "raid-capacity", version: RAID_CALCULATION_VERSION },
    values: {
      level: input.level,
      levelLabel: details.label,
      driveCount: drives.length,
      minimumDriveCount: details.minimumDrives,
      rawCapacityBytes: capacityValue("Raw drive capacity", summary.totalCapacityBytes),
      usableCapacityBytes: capacityValue("Theoretical usable capacity", usableCapacityBytes),
      redundancyBytes: capacityValue("Redundancy", redundancyBytes),
      sizeMismatchBytes: capacityValue("Unavailable from size mismatch", sizeMismatchBytes),
      unavailableCapacityBytes: capacityValue("Total unavailable capacity", unavailableCapacityBytes),
      groups,
      failureTolerance: failureTolerance(input.level, drives.length, groups.length),
      smallRandomWrite: smallRandomWrite(input.level, drives.length),
    },
    issues,
    assumptions: [
      {
        id: "smallest_member",
        statement: "Every striped or redundant group uses the capacity of its smallest member; Linear and JBOD use every supplied byte.",
      },
      {
        id: "array_only",
        statement: "The result excludes array metadata, partitions, filesystem overhead, reserved space, snapshots, and application data layout.",
      },
      {
        id: "entered_order",
        statement: "RAID 10, RAID 50, and RAID 60 groups are built from the drives in the order shown.",
      },
    ],
    derivation: [
      {
        id: "raw_capacity",
        expression: "sum of supplied drive capacities",
        result: `${summary.totalCapacityBytes} bytes`,
      },
      {
        id: "capacity_balance",
        expression: "theoretical usable + redundancy + size mismatch",
        result: `${usableCapacityBytes} + ${redundancyBytes} + ${sizeMismatchBytes} = ${summary.totalCapacityBytes} bytes`,
      },
    ],
    sources: [raidSource, mdadmSource, writeSource],
    uncertainty: {
      kind: "exact",
      statement: "The integer result is exact for the stated smallest-member model and supplied topology, before implementation and filesystem overhead.",
    },
  });
}

export const raidCalculatorAdapter = Object.freeze({
  calculatorId: "raid-capacity",
  calculationVersion: RAID_CALCULATION_VERSION,
  inputVersion: RAID_INPUT_VERSION,
  validateInput: validateRaidCalculatorInput,
  calculate: calculateRaidCapacity,
});

export const raidCalculatorRegistry = createStorageCalculatorRegistry();
raidCalculatorRegistry.register(raidCalculatorAdapter);
