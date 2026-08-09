import { deepFreeze } from "./freeze.ts";
import {
  MAX_DRIVE_CAPACITY_BYTES,
  MAX_STORAGE_DRIVES,
  StorageValidationError,
  storageDriveRoles,
  type StorageDrive,
  type StorageDriveRole,
  type StorageIssue,
} from "./types.ts";

const roleSet = new Set<string>(storageDriveRoles);

export type DriveInventoryValidation = Readonly<{
  valid: boolean;
  issues: readonly StorageIssue[];
}>;

export type DriveInventorySummary = Readonly<{
  driveCount: number;
  totalCapacityBytes: bigint;
  smallestCapacityBytes: bigint;
  largestCapacityBytes: bigint;
  equalSized: boolean;
  byRole: Readonly<Partial<Record<StorageDriveRole, Readonly<{
    driveCount: number;
    totalCapacityBytes: bigint;
  }>>>>;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalTrimmed(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateDriveInventory(
  input: unknown,
  options: Readonly<{ allowEmpty?: boolean }> = {},
): DriveInventoryValidation {
  const issues: StorageIssue[] = [];
  if (!Array.isArray(input)) {
    return deepFreeze({
      valid: false,
      issues: [{ code: "invalid_inventory", severity: "error", message: "Drive inventory must be an array." }],
    });
  }

  if (input.length === 0 && !options.allowEmpty) {
    issues.push({ code: "empty_inventory", severity: "error", message: "Add at least one drive." });
  }
  if (input.length > MAX_STORAGE_DRIVES) {
    issues.push({
      code: "too_many_drives",
      severity: "error",
      message: `A storage inventory can contain at most ${MAX_STORAGE_DRIVES} drives.`,
    });
  }

  const seenIds = new Set<string>();
  input.forEach((candidate, index) => {
    const path = `drives[${index}]`;
    if (!isRecord(candidate)) {
      issues.push({ code: "invalid_drive", severity: "error", message: "Each drive must be an object.", path });
      return;
    }

    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
    if (id.length === 0) {
      issues.push({ code: "empty_drive_id", severity: "error", message: "Every drive needs a stable ID.", path: `${path}.id` });
    } else if (seenIds.has(id)) {
      issues.push({ code: "duplicate_drive_id", severity: "error", message: `Drive ID ${id} is duplicated.`, path: `${path}.id` });
    } else {
      seenIds.add(id);
    }

    if (typeof candidate.capacityBytes !== "bigint" || candidate.capacityBytes <= 0n) {
      issues.push({
        code: "invalid_capacity",
        severity: "error",
        message: "Drive capacity must be a positive whole number of bytes.",
        path: `${path}.capacityBytes`,
      });
    } else if (candidate.capacityBytes > MAX_DRIVE_CAPACITY_BYTES) {
      issues.push({
        code: "capacity_too_large",
        severity: "error",
        message: "Drive capacity exceeds the engine's supported per-drive limit.",
        path: `${path}.capacityBytes`,
      });
    }

    if (typeof candidate.role !== "string" || !roleSet.has(candidate.role)) {
      issues.push({
        code: "invalid_drive_role",
        severity: "error",
        message: `Drive role must be one of: ${storageDriveRoles.join(", ")}.`,
        path: `${path}.role`,
      });
    }

    if (candidate.costMinorUnits !== undefined
      && (typeof candidate.costMinorUnits !== "bigint" || candidate.costMinorUnits < 0n)) {
      issues.push({
        code: "invalid_drive_cost",
        severity: "error",
        message: "Drive cost must be a non-negative whole number in the selected currency's minor unit.",
        path: `${path}.costMinorUnits`,
      });
    }

    if (candidate.powerWatts !== undefined
      && (typeof candidate.powerWatts !== "number" || !Number.isFinite(candidate.powerWatts) || candidate.powerWatts < 0)) {
      issues.push({
        code: "invalid_drive_power",
        severity: "error",
        message: "Drive power must be a non-negative finite number of watts.",
        path: `${path}.powerWatts`,
      });
    }
  });

  return deepFreeze({ valid: issues.length === 0, issues });
}

export function createDriveInventory(input: readonly unknown[]): readonly StorageDrive[] {
  const validation = validateDriveInventory(input);
  if (!validation.valid) {
    throw new StorageValidationError("Drive inventory is invalid.", validation.issues);
  }

  const inventory = input.map((candidate) => {
    const drive = candidate as Record<string, unknown>;
    const normalized: {
      id: string;
      capacityBytes: bigint;
      role: StorageDriveRole;
      label?: string;
      path?: string;
      groupId?: string;
      model?: string;
      costMinorUnits?: bigint;
      powerWatts?: number;
    } = {
      id: (drive.id as string).trim(),
      capacityBytes: drive.capacityBytes as bigint,
      role: drive.role as StorageDriveRole,
    };

    for (const key of ["label", "path", "groupId", "model"] as const) {
      const value = optionalTrimmed(drive[key]);
      if (value !== undefined) normalized[key] = value;
    }
    if (typeof drive.costMinorUnits === "bigint") normalized.costMinorUnits = drive.costMinorUnits;
    if (typeof drive.powerWatts === "number") normalized.powerWatts = drive.powerWatts;
    return deepFreeze(normalized);
  });

  return deepFreeze(inventory);
}

export function canonicalizeDriveInventory(inventory: readonly StorageDrive[]) {
  return deepFreeze([...inventory].sort((left, right) => {
    const leftKey = `${left.groupId ?? ""}\u0000${left.role}\u0000${left.id}`;
    const rightKey = `${right.groupId ?? ""}\u0000${right.role}\u0000${right.id}`;
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  }));
}

export function sumDriveCapacity(
  inventory: readonly StorageDrive[],
  options: Readonly<{ roles?: readonly StorageDriveRole[] }> = {},
) {
  const roles = options.roles ? new Set<StorageDriveRole>(options.roles) : null;
  return inventory.reduce(
    (total, drive) => total + (roles === null || roles.has(drive.role) ? drive.capacityBytes : 0n),
    0n,
  );
}

export function summarizeDriveInventory(inventory: readonly StorageDrive[]): DriveInventorySummary {
  if (inventory.length === 0) {
    throw new StorageValidationError("Cannot summarize an empty drive inventory.");
  }

  let smallestCapacityBytes = inventory[0].capacityBytes;
  let largestCapacityBytes = inventory[0].capacityBytes;
  let totalCapacityBytes = 0n;
  const byRole: Partial<Record<StorageDriveRole, { driveCount: number; totalCapacityBytes: bigint }>> = {};

  for (const drive of inventory) {
    totalCapacityBytes += drive.capacityBytes;
    if (drive.capacityBytes < smallestCapacityBytes) smallestCapacityBytes = drive.capacityBytes;
    if (drive.capacityBytes > largestCapacityBytes) largestCapacityBytes = drive.capacityBytes;
    const current = byRole[drive.role] ?? { driveCount: 0, totalCapacityBytes: 0n };
    byRole[drive.role] = {
      driveCount: current.driveCount + 1,
      totalCapacityBytes: current.totalCapacityBytes + drive.capacityBytes,
    };
  }

  return deepFreeze({
    driveCount: inventory.length,
    totalCapacityBytes,
    smallestCapacityBytes,
    largestCapacityBytes,
    equalSized: smallestCapacityBytes === largestCapacityBytes,
    byRole,
  });
}
