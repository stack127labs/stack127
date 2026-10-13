export const CEPH_CALCULATION_VERSION = "ceph-capacity-1" as const;
export const CEPH_INPUT_VERSION = "ceph-capacity-input-1" as const;

export const MAX_ROWS = 32;
export const MAX_OSDS = 256;
export const MAX_OSD_CAPACITY_BYTES = 100_000_000_000_000_000n;
export const MAX_DOMAIN_LABEL_LENGTH = 120;

export const CAPACITY_UNITS = {
  GB: 1_000_000_000n,
  TB: 1_000_000_000_000n,
  GiB: 1_073_741_824n,
  TiB: 1_099_511_627_776n,
} as const;

export type CapacityUnit = keyof typeof CAPACITY_UNITS;
export type ProtectionMode = "replicated" | "erasure";
export type FailureDomain = "osd" | "host" | "rack" | "datacenter";

export type CephBatch = {
  id: string;
  domain: string;
  osdCount: number;
  capacityBytes: bigint;
};

export type CephCalculatorInput = {
  mode: ProtectionMode;
  replicaSize: number | null;
  k: number | null;
  m: number | null;
  failureDomain: FailureDomain;
  reserveBasisPoints: number;
  batches: readonly CephBatch[];
};

export type CephIssue = {
  field: string;
  message: string;
};

export type CephValidationResult =
  | { status: "valid"; input: CephCalculatorInput; issues: readonly [] }
  | { status: "invalid"; input: null; issues: readonly CephIssue[] };

export type PlacementStatus = "minimum-met" | "extra-domain-headroom";
export type LossPlacementStatus = "minimum-met" | "degraded-placement";

export type CephDomainResult = {
  label: string;
  normalizedLabel: string;
  osdCount: number;
  rawBytes: bigint;
  isLargest: boolean;
};

export type CephLossResult = {
  domainLabel: string;
  lostRawBytes: bigint;
  survivingRawBytes: bigint;
  modeledUsableBytes: bigint;
  remainingDomains: number;
  requiredDomains: number;
  placementStatus: LossPlacementStatus;
};

export type CephCalculationValues = {
  calculationVersion: typeof CEPH_CALCULATION_VERSION;
  rawBytes: bigint;
  modeledUsableBytes: bigint;
  protectionOverheadBytes: bigint;
  reserveBytes: bigint;
  targetBytes: bigint;
  protectionRatio: { dataShards: number; totalShards: number };
  requiredDomains: number;
  distinctDomains: number;
  osdCount: number;
  batchCount: number;
  placementStatus: PlacementStatus;
  domains: readonly CephDomainResult[];
  largestDomainLoss: CephLossResult;
};

export type CephCalculationResult =
  | { status: "valid"; values: CephCalculationValues; issues: readonly [] }
  | { status: "invalid"; values: null; issues: readonly CephIssue[] };

const FAILURE_DOMAINS: readonly FailureDomain[] = ["osd", "host", "rack", "datacenter"];
const DECIMAL_PATTERN = /^(\d+)(?:\.(\d{1,9}))?$/;
const SHARED_STATE_MAX_LENGTH = 32_768;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizedDomain(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

function displayDomain(value: string) {
  return value.trim();
}

function requiredDomainsFor(input: Pick<CephCalculatorInput, "mode" | "replicaSize" | "k" | "m">) {
  return input.mode === "replicated" ? input.replicaSize ?? 0 : (input.k ?? 0) + (input.m ?? 0);
}

function ratioFor(input: Pick<CephCalculatorInput, "mode" | "replicaSize" | "k" | "m">) {
  return input.mode === "replicated"
    ? { dataShards: 1, totalShards: input.replicaSize ?? 1 }
    : { dataShards: input.k ?? 1, totalShards: (input.k ?? 1) + (input.m ?? 0) };
}

function addIssue(issues: CephIssue[], field: string, message: string) {
  if (!issues.some((issue) => issue.field === field)) issues.push({ field, message });
}

function normalizedInput(input: CephCalculatorInput): CephCalculatorInput {
  return {
    ...input,
    batches: input.batches.map((batch) => ({
      ...batch,
      domain: displayDomain(batch.domain),
    })),
  };
}

export function validateCephInput(input: CephCalculatorInput): CephValidationResult {
  const issues: CephIssue[] = [];
  if (!isRecord(input)) {
    return { status: "invalid", input: null, issues: [{ field: "form", message: "Enter a complete plan." }] };
  }

  if (input.mode !== "replicated" && input.mode !== "erasure") {
    addIssue(issues, "mode", "Choose a protection mode.");
  }
  if (input.mode === "replicated") {
    if (!Number.isInteger(input.replicaSize) || (input.replicaSize ?? 0) < 2 || (input.replicaSize ?? 0) > 5) {
      addIssue(issues, "replicaSize", "Replica size: 2 to 5.");
    }
  } else if (input.mode === "erasure") {
    if (!Number.isInteger(input.k) || (input.k ?? 0) < 2 || (input.k ?? 0) > 12) {
      addIssue(issues, "k", "Use data chunks from 2 to 12.");
    }
    if (!Number.isInteger(input.m) || (input.m ?? 0) < 1 || (input.m ?? 0) > 8) {
      addIssue(issues, "m", "Use coding chunks from 1 to 8.");
    }
    if (Number.isInteger(input.k) && Number.isInteger(input.m) && (input.k as number) + (input.m as number) > 16) {
      addIssue(issues, "profile", "Keep total chunks at 16 or fewer.");
    }
  }
  if (!FAILURE_DOMAINS.includes(input.failureDomain)) {
    addIssue(issues, "failureDomain", "Choose a failure domain.");
  }
  if (!Number.isInteger(input.reserveBasisPoints) || input.reserveBasisPoints < 0 || input.reserveBasisPoints > 5_000) {
    addIssue(issues, "reserve", "Reserve: 0 to 50 percent.");
  }
  if (!Array.isArray(input.batches) || input.batches.length < 1 || input.batches.length > MAX_ROWS) {
    addIssue(issues, "batches", `Use 1 to ${MAX_ROWS} OSD batches.`);
  }

  const rows = Array.isArray(input.batches) ? input.batches : [];
  const ids = new Set<string>();
  let osdCount = 0;
  for (const [index, batch] of rows.entries()) {
    const field = `batch-${index}`;
    if (!isRecord(batch)) {
      addIssue(issues, field, "Enter a complete OSD batch.");
      continue;
    }
    if (typeof batch.id !== "string" || !batch.id || batch.id.length > 64 || ids.has(batch.id)) {
      addIssue(issues, `${field}-id`, "Each batch needs a unique identifier.");
    } else {
      ids.add(batch.id);
    }
    if (typeof batch.domain !== "string" || !displayDomain(batch.domain) || displayDomain(batch.domain).length > MAX_DOMAIN_LABEL_LENGTH) {
      addIssue(issues, `${field}-domain`, `Domain label: ${MAX_DOMAIN_LABEL_LENGTH} characters max.`);
    }
    const rowCount = typeof batch.osdCount === "number" ? batch.osdCount : null;
    if (rowCount === null || !Number.isInteger(rowCount) || rowCount < 1 || rowCount > 64) {
      addIssue(issues, `${field}-count`, "Use 1 to 64 OSDs.");
    } else {
      osdCount += rowCount;
    }
    if (typeof batch.capacityBytes !== "bigint" || batch.capacityBytes <= 0n || batch.capacityBytes > MAX_OSD_CAPACITY_BYTES) {
      addIssue(issues, `${field}-capacity`, "Capacity: positive, up to 100 PB.");
    }
  }
  if (osdCount < 1 || osdCount > MAX_OSDS) addIssue(issues, "osds", `Use 1 to ${MAX_OSDS} OSDs total.`);

  const normalized = normalizedInput(input);
  const domains = new Set(
    rows
      .filter((batch): batch is CephBatch => isRecord(batch) && typeof batch.domain === "string")
      .map((batch) => normalizedDomain(batch.domain)),
  );
  const required = requiredDomainsFor(input);
  if (required > 0 && domains.size < required) {
    addIssue(issues, "domains", `Use ${required} distinct ${input.failureDomain ?? "failure"} domains.`);
  }

  if (issues.length > 0) return { status: "invalid", input: null, issues };
  return { status: "valid", input: normalized, issues: [] };
}

export function parseCapacityBytes(value: string, unit: CapacityUnit): bigint {
  if (!Object.prototype.hasOwnProperty.call(CAPACITY_UNITS, unit)) throw new Error("Unsupported capacity unit.");
  const match = DECIMAL_PATTERN.exec(value.trim());
  if (!match) throw new Error("Enter a plain decimal capacity.");
  const integerPart = BigInt(match[1]);
  const fraction = match[2] ?? "";
  const scale = 10n ** BigInt(fraction.length);
  const numerator = (integerPart * scale + BigInt(fraction || "0")) * CAPACITY_UNITS[unit];
  if (numerator % scale !== 0n) throw new Error("Capacity must resolve to whole bytes.");
  const bytes = numerator / scale;
  if (bytes <= 0n) throw new Error("Capacity must be positive.");
  return bytes;
}

function floorRatio(value: bigint, numerator: number, denominator: number) {
  return (value * BigInt(numerator)) / BigInt(denominator);
}

export function calculateCephCapacity(input: CephCalculatorInput): CephCalculationResult {
  const validation = validateCephInput(input);
  if (validation.status === "invalid") return { status: "invalid", values: null, issues: validation.issues };
  const normalized = validation.input;
  const ratio = ratioFor(normalized);
  const requiredDomains = ratio.totalShards;
  const domainMap = new Map<string, { label: string; osdCount: number; rawBytes: bigint }>();
  let rawBytes = 0n;
  let osdCount = 0;
  for (const batch of normalized.batches) {
    const batchRaw = batch.capacityBytes * BigInt(batch.osdCount);
    rawBytes += batchRaw;
    osdCount += batch.osdCount;
    const key = normalizedDomain(batch.domain);
    const current = domainMap.get(key);
    if (current) {
      current.osdCount += batch.osdCount;
      current.rawBytes += batchRaw;
    } else {
      domainMap.set(key, { label: batch.domain, osdCount: batch.osdCount, rawBytes: batchRaw });
    }
  }

  const modeledUsableBytes = floorRatio(rawBytes, ratio.dataShards, ratio.totalShards);
  const protectionOverheadBytes = rawBytes - modeledUsableBytes;
  const reserveBytes = (modeledUsableBytes * BigInt(normalized.reserveBasisPoints)) / 10_000n;
  const targetBytes = modeledUsableBytes - reserveBytes;
  const domains = [...domainMap.entries()].map(([normalizedLabel, domain]) => ({
    normalizedLabel,
    label: domain.label,
    osdCount: domain.osdCount,
    rawBytes: domain.rawBytes,
    isLargest: false,
  }));
  let largestIndex = 0;
  for (let index = 1; index < domains.length; index += 1) {
    if (domains[index].rawBytes > domains[largestIndex].rawBytes) largestIndex = index;
  }
  const largest = domains[largestIndex];
  const displayDomains = domains.map((domain, index) => ({ ...domain, isLargest: index === largestIndex }));
  const remainingDomains = Math.max(0, displayDomains.length - 1);
  const largestDomainLoss: CephLossResult = {
    domainLabel: largest.label,
    lostRawBytes: largest.rawBytes,
    survivingRawBytes: rawBytes - largest.rawBytes,
    modeledUsableBytes: floorRatio(rawBytes - largest.rawBytes, ratio.dataShards, ratio.totalShards),
    remainingDomains,
    requiredDomains,
    placementStatus: remainingDomains >= requiredDomains ? "minimum-met" : "degraded-placement",
  };

  return {
    status: "valid",
    issues: [],
    values: {
      calculationVersion: CEPH_CALCULATION_VERSION,
      rawBytes,
      modeledUsableBytes,
      protectionOverheadBytes,
      reserveBytes,
      targetBytes,
      protectionRatio: ratio,
      requiredDomains,
      distinctDomains: displayDomains.length,
      osdCount,
      batchCount: normalized.batches.length,
      placementStatus: displayDomains.length === requiredDomains ? "minimum-met" : "extra-domain-headroom",
      domains: displayDomains,
      largestDomainLoss,
    },
  };
}

function formatHundredths(bytes: bigint, divisor: bigint, unit: string) {
  const hundredths = (bytes * 100n + divisor / 2n) / divisor;
  if (bytes > 0n && hundredths === 0n) return `<0.01 ${unit}`;
  const whole = hundredths / 100n;
  const fraction = (hundredths % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""} ${unit}`;
}

export function formatBytes(bytes: bigint, unit: "TB" | "TiB") {
  return formatHundredths(bytes, CAPACITY_UNITS[unit], unit);
}

export function formatPercent(part: bigint, total: bigint) {
  if (total === 0n) return "0%";
  const hundredths = (part * 10_000n + total / 2n) / total;
  if (part > 0n && hundredths === 0n) return "<0.01%";
  const whole = hundredths / 100n;
  const fraction = (hundredths % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""}%`;
}

function base64UrlEncode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  if (!value || value.length > SHARED_STATE_MAX_LENGTH || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = globalThis.atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function serializeCephInput(input: CephCalculatorInput) {
  const validation = validateCephInput(input);
  if (validation.status === "invalid") throw new Error("Cannot share an invalid plan.");
  const normalized = validation.input;
  return base64UrlEncode(JSON.stringify({
    version: CEPH_INPUT_VERSION,
    mode: normalized.mode,
    replicaSize: normalized.replicaSize,
    k: normalized.k,
    m: normalized.m,
    failureDomain: normalized.failureDomain,
    reserveBasisPoints: normalized.reserveBasisPoints,
    batches: normalized.batches.map((batch) => ({
      id: batch.id,
      domain: batch.domain,
      osdCount: batch.osdCount,
      capacityBytes: batch.capacityBytes.toString(),
    })),
  }));
}

function decodeBatch(value: unknown): CephBatch | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.domain !== "string" || typeof value.osdCount !== "number" || typeof value.capacityBytes !== "string") return null;
  if (!/^\d+$/.test(value.capacityBytes)) return null;
  try {
    return {
      id: value.id,
      domain: value.domain,
      osdCount: value.osdCount,
      capacityBytes: BigInt(value.capacityBytes),
    };
  } catch {
    return null;
  }
}

export function decodeCephInput(encoded: string): CephCalculatorInput | null {
  const text = base64UrlDecode(encoded);
  if (!text) return null;
  try {
    const value: unknown = JSON.parse(text);
    if (!isRecord(value) || value.version !== CEPH_INPUT_VERSION || !Array.isArray(value.batches)) return null;
    const batches = value.batches.map(decodeBatch);
    if (batches.some((batch): batch is null => batch === null)) return null;
    const candidate: CephCalculatorInput = {
      mode: value.mode as ProtectionMode,
      replicaSize: typeof value.replicaSize === "number" ? value.replicaSize : null,
      k: typeof value.k === "number" ? value.k : null,
      m: typeof value.m === "number" ? value.m : null,
      failureDomain: value.failureDomain as FailureDomain,
      reserveBasisPoints: value.reserveBasisPoints as number,
      batches: batches as CephBatch[],
    };
    const result = validateCephInput(candidate);
    return result.status === "valid" ? result.input : null;
  } catch {
    return null;
  }
}
