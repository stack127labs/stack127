import { deepFreeze } from "./freeze.ts";
import { StorageValidationError } from "./types.ts";

export type RaidzAllocation = Readonly<{
  dataColumns: number;
  logicalSectors: bigint;
  fullRows: bigint;
  remainingDataSectors: bigint;
  parityRows: bigint;
  paritySectors: bigint;
  rawSectors: bigint;
  allocatedSectors: bigint;
  paddingSectors: bigint;
  roundedDataBytes: bigint;
  sectorRoundingBytes: bigint;
  parityBytes: bigint;
  paddingBytes: bigint;
  physicalBytes: bigint;
}>;

function ceilDiv(value: bigint, divisor: bigint) {
  return (value + divisor - 1n) / divisor;
}

export function calculateRaidzAllocation(input: Readonly<{
  logicalBytes: bigint;
  sectorBytes: bigint;
  width: number;
  parity: number;
}>): RaidzAllocation {
  if (input.logicalBytes <= 0n || input.sectorBytes <= 0n) {
    throw new StorageValidationError("RAIDZ allocation needs positive byte values.");
  }
  if (!Number.isSafeInteger(input.parity) || input.parity < 1 || input.parity > 3) {
    throw new StorageValidationError("RAIDZ parity must be 1, 2, or 3.");
  }
  if (!Number.isSafeInteger(input.width) || input.width <= input.parity || input.width > 64) {
    throw new StorageValidationError("RAIDZ width is outside the supported range.");
  }

  const dataColumns = input.width - input.parity;
  const logicalSectors = ceilDiv(input.logicalBytes, input.sectorBytes);
  const fullRows = logicalSectors / BigInt(dataColumns);
  const remainingDataSectors = logicalSectors % BigInt(dataColumns);
  const parityRows = fullRows + (remainingDataSectors > 0n ? 1n : 0n);
  const paritySectors = BigInt(input.parity) * parityRows;
  const rawSectors = logicalSectors + paritySectors;
  const allocationUnit = BigInt(input.parity + 1);
  const allocatedSectors = ceilDiv(rawSectors, allocationUnit) * allocationUnit;
  const paddingSectors = allocatedSectors - rawSectors;
  const roundedDataBytes = logicalSectors * input.sectorBytes;
  const sectorRoundingBytes = roundedDataBytes - input.logicalBytes;
  const parityBytes = paritySectors * input.sectorBytes;
  const paddingBytes = paddingSectors * input.sectorBytes;
  const physicalBytes = allocatedSectors * input.sectorBytes;

  if (physicalBytes !== input.logicalBytes + sectorRoundingBytes + parityBytes + paddingBytes) {
    throw new StorageValidationError("RAIDZ allocation did not reconcile.");
  }

  return deepFreeze({
    dataColumns,
    logicalSectors,
    fullRows,
    remainingDataSectors,
    parityRows,
    paritySectors,
    rawSectors,
    allocatedSectors,
    paddingSectors,
    roundedDataBytes,
    sectorRoundingBytes,
    parityBytes,
    paddingBytes,
    physicalBytes,
  });
}
