import {
  bytesFromUnit,
  createStorageCalculationResult,
  decodeStorageState,
  encodeStorageState,
  MAX_DRIVE_CAPACITY_BYTES,
  StorageValidationError,
  type StorageCalculationResult,
  type StorageIssue,
  type StorageCapacityUnit,
} from "../../../../../lib/storage/index.ts";

export const STORAGE_LAYOUT_ADVISOR_ID = "storage-layout-advisor" as const;
export const ADVISOR_CALCULATION_VERSION = 1 as const;
export const ADVISOR_INPUT_VERSION = 1 as const;
export const MAX_ADVISOR_DRIVES = 64 as const;

export const advisorInputUnits = ["TB", "GB", "TiB", "GiB"] as const;
export type AdvisorInputUnit = (typeof advisorInputUnits)[number];
export const advisorDisplayUnits = ["TB", "TiB"] as const;
export type AdvisorDisplayUnit = (typeof advisorDisplayUnits)[number];
export const advisorPlatforms = ["any", "linux-md", "openzfs", "nas-raid"] as const;
export type AdvisorPlatform = (typeof advisorPlatforms)[number];
export const advisorWorkloads = ["general", "bulk", "vm-db"] as const;
export type AdvisorWorkload = (typeof advisorWorkloads)[number];
export type AdvisorProtectionTarget = 0 | 1 | 2 | 3;

export type StorageLayoutAdvisorDriveInput = Readonly<{
  id: string;
  size: string;
  unit: AdvisorInputUnit;
}>;

export type StorageLayoutAdvisorInput = Readonly<{
  drives: readonly StorageLayoutAdvisorDriveInput[];
  platform: AdvisorPlatform;
  workload: AdvisorWorkload;
  protectedFailures: AdvisorProtectionTarget;
  displayUnit: AdvisorDisplayUnit;
}>;

export type NormalizedAdvisorDrive = Readonly<StorageLayoutAdvisorDriveInput & {
  capacityBytes: bigint;
}>;

export type NormalizedStorageLayoutAdvisorInput = Readonly<Omit<StorageLayoutAdvisorInput, "drives"> & {
  drives: readonly NormalizedAdvisorDrive[];
}>;

export type AdvisorLayoutGroup = Readonly<{
  id: string;
  label: string;
  driveIds: readonly string[];
  rawBytes: bigint;
  commonBytes: bigint;
  usableBytes: bigint;
  redundancyBytes: bigint;
  mismatchBytes: bigint;
}>;

export type AdvisorLayoutCandidate = Readonly<{
  id: string;
  family: "single" | "stripe" | "mirror" | "striped-mirrors" | "parity";
  label: string;
  implementation: string;
  minimumDrives: number;
  rawBytes: bigint;
  usableBytes: bigint;
  redundancyBytes: bigint;
  mismatchBytes: bigint;
  efficiencyBasisPoints: number;
  guaranteedTolerance: number;
  toleranceStatement: string;
  fitScore: number;
  fitReason: string;
  groups: readonly AdvisorLayoutGroup[];
}>;

export type StorageLayoutAdvisorValues = Readonly<{
  drives: readonly NormalizedAdvisorDrive[];
  platform: AdvisorPlatform;
  workload: AdvisorWorkload;
  protectedFailures: AdvisorProtectionTarget;
  displayUnit: AdvisorDisplayUnit;
  rawCapacityBytes: bigint;
  candidates: readonly AdvisorLayoutCandidate[];
  eligibleCandidates: readonly AdvisorLayoutCandidate[];
  bestCandidate: AdvisorLayoutCandidate;
}>;

export type StorageLayoutAdvisorResult = StorageCalculationResult<StorageLayoutAdvisorValues>;

const sources = [
  {
    title: "Linux MD RAID documentation",
    url: "https://docs.kernel.org/admin-guide/md.html",
    checkedAt: "2026-08-23",
  },
  {
    title: "OpenZFS RAIDZ documentation",
    url: "https://openzfs.github.io/",
    checkedAt: "2026-08-23",
  },
] as const;

const assumptions = [
  { id: "static-inventory", statement: "Static inventory model." },
  { id: "theoretical-capacity", statement: "Theoretical array envelope." },
  { id: "no-backup", statement: "Redundancy is not backup." },
] as const;

const platformNames: Record<AdvisorPlatform, Readonly<Record<string, string>>> = {
  any: {
    single: "Single disk / JBOD",
    stripe: "Stripe / RAID 0",
    mirror: "Mirror / RAID 1",
    "striped-mirrors": "Striped mirrors / RAID 10",
    "single-parity": "RAID 5 / RAIDZ1",
    "dual-parity": "RAID 6 / RAIDZ2",
    "triple-parity": "RAIDZ3",
  },
  "linux-md": {
    single: "Single disk / JBOD",
    stripe: "Linux MD RAID 0",
    mirror: "Linux MD RAID 1",
    "striped-mirrors": "Linux MD RAID 10",
    "single-parity": "Linux MD RAID 5",
    "dual-parity": "Linux MD RAID 6",
  },
  openzfs: {
    single: "Single disk",
    stripe: "ZFS stripe",
    mirror: "ZFS mirror",
    "striped-mirrors": "Striped ZFS mirrors",
    "single-parity": "RAIDZ1",
    "dual-parity": "RAIDZ2",
    "triple-parity": "RAIDZ3",
  },
  "nas-raid": {
    single: "Single disk / JBOD",
    stripe: "NAS RAID 0",
    mirror: "NAS RAID 1",
    "striped-mirrors": "NAS RAID 10",
    "single-parity": "NAS RAID 5",
    "dual-parity": "NAS RAID 6",
  },
};

const issue = (code: string, message: string, path?: string): StorageIssue => ({
  code,
  severity: "error",
  message,
  ...(path ? { path } : {}),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

function isProtectionTarget(value: unknown): value is AdvisorProtectionTarget {
  return Number.isInteger(value) && typeof value === "number" && value >= 0 && value <= 3;
}

function emptyIssues(): StorageIssue[] {
  return [];
}

function normalizeInput(input: unknown): { value: NormalizedStorageLayoutAdvisorInput | null; issues: StorageIssue[] } {
  const issues = emptyIssues();
  if (!isRecord(input)) return { value: null, issues: [issue("invalid_input", "Enter a storage layout.")] };

  if (!Array.isArray(input.drives)) {
    issues.push(issue("invalid_drives", "Add at least one drive.", "drives"));
  } else if (input.drives.length < 1 || input.drives.length > MAX_ADVISOR_DRIVES) {
    issues.push(issue("drive_count", "Use one to 64 drives.", "drives"));
  }

  if (!isOneOf(advisorPlatforms, input.platform)) {
    issues.push(issue("platform", "Choose a platform.", "platform"));
  }
  if (!isOneOf(advisorWorkloads, input.workload)) {
    issues.push(issue("workload", "Choose a workload.", "workload"));
  }
  if (!isProtectionTarget(input.protectedFailures)) {
    issues.push(issue("protected_failures", "Choose zero to three failures.", "protectedFailures"));
  }
  if (!isOneOf(advisorDisplayUnits, input.displayUnit)) {
    issues.push(issue("display_unit", "Choose a display unit.", "displayUnit"));
  }

  const normalizedDrives: NormalizedAdvisorDrive[] = [];
  const seenIds = new Set<string>();
  if (Array.isArray(input.drives)) {
    input.drives.forEach((rawDrive, index) => {
      const path = `drives[${index}]`;
      if (!isRecord(rawDrive)) {
        issues.push(issue("drive_row", "Complete this drive row.", path));
        return;
      }
      const id = typeof rawDrive.id === "string" ? rawDrive.id : "";
      const size = typeof rawDrive.size === "string" ? rawDrive.size.trim() : "";
      const unit = rawDrive.unit;
      if (!/^drive-[1-9]\d*$/.test(id)) {
        issues.push(issue("drive_id", "Drive row has an invalid ID.", `${path}.id`));
      } else if (seenIds.has(id)) {
        issues.push(issue("duplicate_drive", "Drive IDs must be unique.", `${path}.id`));
      }
      seenIds.add(id);
      if (!isOneOf(advisorInputUnits, unit)) {
        issues.push(issue("drive_unit", "Choose a drive unit.", `${path}.unit`));
        return;
      }
      if (!size) {
        issues.push(issue("drive_size", "Enter a positive capacity.", `${path}.size`));
        return;
      }
      try {
        const capacityBytes = bytesFromUnit(size, unit as StorageCapacityUnit);
        if (capacityBytes <= 0n) {
          issues.push(issue("drive_size", "Enter a positive capacity.", `${path}.size`));
        } else if (capacityBytes > MAX_DRIVE_CAPACITY_BYTES) {
          issues.push(issue("drive_size", "Capacity exceeds the limit.", `${path}.size`));
        } else {
          normalizedDrives.push({ id, size, unit, capacityBytes });
        }
      } catch {
        issues.push(issue("drive_size", "Enter whole bytes of capacity.", `${path}.size`));
      }
    });
  }

  if (issues.length > 0) return { value: null, issues };
  return {
    value: {
      drives: normalizedDrives,
      platform: input.platform as AdvisorPlatform,
      workload: input.workload as AdvisorWorkload,
      protectedFailures: input.protectedFailures as AdvisorProtectionTarget,
      displayUnit: input.displayUnit as AdvisorDisplayUnit,
    },
    issues,
  };
}

export function validateStorageLayoutAdvisorInput(input: unknown): input is StorageLayoutAdvisorInput {
  return normalizeInput(input).issues.length === 0;
}

function sum(values: readonly bigint[]) {
  return values.reduce((total, value) => total + value, 0n);
}

function smallest(values: readonly bigint[]) {
  return values.reduce((minimum, value) => (value < minimum ? value : minimum), values[0]);
}

function efficiencyBasisPoints(usableBytes: bigint, rawBytes: bigint) {
  if (rawBytes === 0n) return 0;
  return Number((usableBytes * 10_000n + rawBytes / 2n) / rawBytes);
}

function supportsPlatform(id: string, platform: AdvisorPlatform) {
  if (platform === "any" || platform === "openzfs") return true;
  return id !== "triple-parity";
}

function toleranceStatement(family: AdvisorLayoutCandidate["family"], tolerance: number) {
  if (family === "striped-mirrors") return "One per mirror pair.";
  if (family === "mirror") return "One drive.";
  if (family === "parity") return `${tolerance} drives.`;
  return "No drive guarantee.";
}

function candidateScore(
  id: string,
  efficiency: number,
  workload: AdvisorWorkload,
  protectedFailures: AdvisorProtectionTarget,
) {
  let score = efficiency;
  if (workload === "general" && id === "dual-parity") score += 1_000;
  if (workload === "general" && id === "single-parity") score += 200;
  if (workload === "bulk" && id.endsWith("parity")) score += 300;
  if (workload === "vm-db" && id === "striped-mirrors") score += 3_000;
  if (workload === "vm-db" && id === "mirror") score += 1_000;
  if (protectedFailures >= 2 && id === "dual-parity") score += 700;
  if (protectedFailures >= 3 && id === "triple-parity") score += 900;
  return score;
}

function fitReason(candidate: AdvisorLayoutCandidate, workload: AdvisorWorkload) {
  if (workload === "vm-db" && candidate.family === "striped-mirrors") return "Mirrors fit this workload.";
  if (workload === "vm-db" && candidate.family === "mirror") return "Mirroring fits this workload.";
  if (workload === "bulk" && candidate.family === "parity") return "Parity retains more capacity.";
  if (candidate.family === "parity") return "Meets the protection target.";
  if (candidate.family === "mirror" || candidate.family === "striped-mirrors") return "Mirrored placement is explicit.";
  return "Meets the selected target.";
}

function group(
  id: string,
  label: string,
  drives: readonly NormalizedAdvisorDrive[],
  commonBytes: bigint,
  usableBytes: bigint,
  redundancyBytes: bigint,
  mismatchBytes: bigint,
): AdvisorLayoutGroup {
  return {
    id,
    label,
    driveIds: drives.map((drive) => drive.id),
    rawBytes: sum(drives.map((drive) => drive.capacityBytes)),
    commonBytes,
    usableBytes,
    redundancyBytes,
    mismatchBytes,
  };
}

function makeCandidate(input: Readonly<{
  id: string;
  family: AdvisorLayoutCandidate["family"];
  drives: readonly NormalizedAdvisorDrive[];
  minimumDrives: number;
  usableBytes: bigint;
  redundancyBytes: bigint;
  mismatchBytes: bigint;
  groups: readonly AdvisorLayoutGroup[];
  protectedFailures: AdvisorProtectionTarget;
  workload: AdvisorWorkload;
  platform: AdvisorPlatform;
}>): AdvisorLayoutCandidate {
  const rawBytes = sum(input.drives.map((drive) => drive.capacityBytes));
  const tolerance = input.family === "parity"
    ? input.id === "single-parity" ? 1 : input.id === "dual-parity" ? 2 : 3
    : input.family === "mirror" || input.family === "striped-mirrors" ? 1 : 0;
  const candidate = {
    id: input.id,
    family: input.family,
    label: platformNames[input.platform][input.id] ?? platformNames.any[input.id],
    implementation: platformNames[input.platform][input.id] ?? platformNames.any[input.id],
    minimumDrives: input.minimumDrives,
    rawBytes,
    usableBytes: input.usableBytes,
    redundancyBytes: input.redundancyBytes,
    mismatchBytes: input.mismatchBytes,
    efficiencyBasisPoints: efficiencyBasisPoints(input.usableBytes, rawBytes),
    guaranteedTolerance: tolerance,
    toleranceStatement: toleranceStatement(input.family, tolerance),
    fitScore: 0,
    fitReason: "",
    groups: input.groups,
  } satisfies AdvisorLayoutCandidate;
  return {
    ...candidate,
    fitScore: candidateScore(candidate.id, candidate.efficiencyBasisPoints, input.workload, input.protectedFailures),
    fitReason: fitReason(candidate, input.workload),
  };
}

function buildCandidates(input: NormalizedStorageLayoutAdvisorInput) {
  const drives = input.drives;
  const rawBytes = sum(drives.map((drive) => drive.capacityBytes));
  const values: AdvisorLayoutCandidate[] = [];
  const min = smallest(drives.map((drive) => drive.capacityBytes));
  const allGroup = (id: string, label: string, common: bigint, usable: bigint, redundancy: bigint, mismatch: bigint) => group(id, label, drives, common, usable, redundancy, mismatch);

  values.push(makeCandidate({
    id: "single-disk",
    family: "single",
    drives,
    minimumDrives: 1,
    usableBytes: rawBytes,
    redundancyBytes: 0n,
    mismatchBytes: 0n,
    groups: [allGroup("single", "One disk", rawBytes, rawBytes, 0n, 0n)],
    protectedFailures: input.protectedFailures,
    workload: input.workload,
    platform: input.platform,
  }));

  if (drives.length >= 2) {
    const stripeUsable = BigInt(drives.length) * min;
    values.push(makeCandidate({
      id: "stripe",
      family: "stripe",
      drives,
      minimumDrives: 2,
      usableBytes: stripeUsable,
      redundancyBytes: 0n,
      mismatchBytes: rawBytes - stripeUsable,
      groups: [allGroup("stripe", "One stripe", min, stripeUsable, 0n, rawBytes - stripeUsable)],
      protectedFailures: input.protectedFailures,
      workload: input.workload,
      platform: input.platform,
    }));
  }

  if (drives.length === 2) {
    values.push(makeCandidate({
      id: "mirror",
      family: "mirror",
      drives,
      minimumDrives: 2,
      usableBytes: min,
      redundancyBytes: min,
      mismatchBytes: rawBytes - 2n * min,
      groups: [group("mirror-1", "Mirror pair", drives, min, min, min, rawBytes - 2n * min)],
      protectedFailures: input.protectedFailures,
      workload: input.workload,
      platform: input.platform,
    }));
  }

  if (drives.length >= 4 && drives.length % 2 === 0) {
    const groups: AdvisorLayoutGroup[] = [];
    let usable = 0n;
    let redundancy = 0n;
    for (let index = 0; index < drives.length; index += 2) {
      const pair = drives.slice(index, index + 2);
      const common = smallest(pair.map((drive) => drive.capacityBytes));
      usable += common;
      redundancy += common;
      groups.push(group(`mirror-${index / 2 + 1}`, `Mirror ${index / 2 + 1}`, pair, common, common, common, sum(pair.map((drive) => drive.capacityBytes)) - 2n * common));
    }
    values.push(makeCandidate({
      id: "striped-mirrors",
      family: "striped-mirrors",
      drives,
      minimumDrives: 4,
      usableBytes: usable,
      redundancyBytes: redundancy,
      mismatchBytes: rawBytes - usable - redundancy,
      groups,
      protectedFailures: input.protectedFailures,
      workload: input.workload,
      platform: input.platform,
    }));
  }

  const parityDefinitions = [
    ["single-parity", 1, 3],
    ["dual-parity", 2, 4],
    ["triple-parity", 3, 5],
  ] as const;
  for (const [id, parity, minimumDrives] of parityDefinitions) {
    if (drives.length < minimumDrives || !supportsPlatform(id, input.platform)) continue;
    const usable = BigInt(drives.length - parity) * min;
    const redundancy = BigInt(parity) * min;
    values.push(makeCandidate({
      id,
      family: "parity",
      drives,
      minimumDrives,
      usableBytes: usable,
      redundancyBytes: redundancy,
      mismatchBytes: rawBytes - BigInt(drives.length) * min,
      groups: [allGroup("parity", `Parity ${parity}`, min, usable, redundancy, rawBytes - BigInt(drives.length) * min)],
      protectedFailures: input.protectedFailures,
      workload: input.workload,
      platform: input.platform,
    }));
  }

  return values.filter((candidate) => supportsPlatform(candidate.id, input.platform));
}

export function calculateStorageLayoutAdvisor(input: unknown): StorageLayoutAdvisorResult {
  const normalized = normalizeInput(input);
  if (!normalized.value) {
    return createStorageCalculationResult({
      calculator: { id: STORAGE_LAYOUT_ADVISOR_ID, version: ADVISOR_CALCULATION_VERSION },
      values: null,
      issues: normalized.issues,
      assumptions,
      derivation: [],
      sources,
      uncertainty: { kind: "unknown", statement: "Invalid input has no result." },
    });
  }

  const candidates = buildCandidates(normalized.value);
  const eligibleCandidates = candidates
    .filter((candidate) => candidate.guaranteedTolerance >= normalized.value!.protectedFailures)
    .sort((left, right) => right.fitScore - left.fitScore || left.id.localeCompare(right.id));
  if (eligibleCandidates.length === 0) {
    return createStorageCalculationResult({
      calculator: { id: STORAGE_LAYOUT_ADVISOR_ID, version: ADVISOR_CALCULATION_VERSION },
      values: null,
      issues: [issue("no_eligible_layout", "No eligible layout for target.")],
      assumptions,
      derivation: [
        { id: "candidate-count", expression: "eligible candidates", result: "0" },
      ],
      sources,
      uncertainty: { kind: "modelled", statement: "Static layout model." },
    });
  }

  return createStorageCalculationResult({
    calculator: { id: STORAGE_LAYOUT_ADVISOR_ID, version: ADVISOR_CALCULATION_VERSION },
    values: {
      drives: normalized.value.drives,
      platform: normalized.value.platform,
      workload: normalized.value.workload,
      protectedFailures: normalized.value.protectedFailures,
      displayUnit: normalized.value.displayUnit,
      rawCapacityBytes: sum(normalized.value.drives.map((drive) => drive.capacityBytes)),
      candidates,
      eligibleCandidates,
      bestCandidate: eligibleCandidates[0],
    },
    issues: [],
    assumptions,
    derivation: [
      { id: "raw-capacity", expression: "sum drive bytes", result: "exact" },
      { id: "candidate-accounting", expression: "usable + redundancy + mismatch", result: "raw" },
      { id: "protection-filter", expression: "guaranteed tolerance >= target", result: `${eligibleCandidates.length}` },
    ],
    sources,
    uncertainty: { kind: "modelled", statement: "Static layout model." },
  });
}

export function encodeStorageLayoutAdvisorState(input: StorageLayoutAdvisorInput) {
  const normalized = normalizeInput(input);
  if (!normalized.value) throw new StorageValidationError("Cannot share invalid layout input.", normalized.issues);
  return encodeStorageState({
    calculatorId: STORAGE_LAYOUT_ADVISOR_ID,
    calculatorVersion: ADVISOR_CALCULATION_VERSION,
    inputVersion: ADVISOR_INPUT_VERSION,
    payload: {
      drives: normalized.value.drives.map(({ id, size, unit }) => ({ id, size, unit })),
      platform: normalized.value.platform,
      workload: normalized.value.workload,
      protectedFailures: normalized.value.protectedFailures,
      displayUnit: normalized.value.displayUnit,
    },
  });
}

export function decodeStorageLayoutAdvisorState(encoded: string): StorageLayoutAdvisorInput {
  const state = decodeStorageState(encoded);
  if (state.calculatorId !== STORAGE_LAYOUT_ADVISOR_ID
    || state.calculatorVersion !== ADVISOR_CALCULATION_VERSION
    || state.inputVersion !== ADVISOR_INPUT_VERSION) {
    throw new StorageValidationError("Shared layout version is unsupported.");
  }
  const normalized = normalizeInput(state.payload);
  if (!normalized.value) throw new StorageValidationError("Shared layout is invalid.", normalized.issues);
  return {
    drives: normalized.value.drives.map(({ id, size, unit }) => ({ id, size, unit })),
    platform: normalized.value.platform,
    workload: normalized.value.workload,
    protectedFailures: normalized.value.protectedFailures,
    displayUnit: normalized.value.displayUnit,
  };
}
