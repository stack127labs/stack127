import type { StorageDrive } from "./types.ts";

function decimalTerabytes(value: bigint) {
  return value * 1_000_000_000_000n;
}

export const equalFourTerabyteDrives = Object.freeze([
  Object.freeze({ id: "disk-1", capacityBytes: decimalTerabytes(4n), role: "data" as const }),
  Object.freeze({ id: "disk-2", capacityBytes: decimalTerabytes(4n), role: "data" as const }),
  Object.freeze({ id: "disk-3", capacityBytes: decimalTerabytes(4n), role: "data" as const }),
  Object.freeze({ id: "disk-4", capacityBytes: decimalTerabytes(4n), role: "data" as const }),
] satisfies readonly StorageDrive[]);
export const mixedTwoThreeFourFourDrives = Object.freeze([
  Object.freeze({ id: "disk-1", capacityBytes: decimalTerabytes(2n), role: "data" as const }),
  Object.freeze({ id: "disk-2", capacityBytes: decimalTerabytes(3n), role: "data" as const }),
  Object.freeze({ id: "disk-3", capacityBytes: decimalTerabytes(4n), role: "data" as const }),
  Object.freeze({ id: "disk-4", capacityBytes: decimalTerabytes(4n), role: "data" as const }),
] satisfies readonly StorageDrive[]);
