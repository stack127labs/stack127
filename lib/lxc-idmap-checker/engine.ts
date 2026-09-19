export type LxcMapType = "u" | "g";
export type LxcQueryType = "uid" | "gid";

export type LxcInput = Readonly<{
  uidMap: string;
  gidMap: string;
  grantOwner: string;
  uidGrants: string;
  gidGrants: string;
  queryType: LxcQueryType;
  queryId: string;
}>;

export type LxcRange = Readonly<{
  type: LxcMapType;
  containerStart: string;
  hostStart: string;
  length: string;
  line: number;
  containerEnd: string;
  hostEnd: string;
}>;

export type LxcFinding = Readonly<{
  severity: "error" | "warning";
  code: string;
  message: string;
  line?: number;
  field?: "uidMap" | "gidMap" | "grantOwner" | "uidGrants" | "gidGrants" | "queryType" | "queryId";
}>;

export type LxcQuery = Readonly<{
  type: LxcQueryType;
  id: string;
  hostId: string | null;
  range: LxcRange | null;
  grantStatus: "covered" | "missing" | "unknown";
}>;

export type LxcValues = Readonly<{
  ranges: LxcRange[];
  findings: LxcFinding[];
  query: LxcQuery;
  errorCount: number;
  warningCount: number;
  resolutionVersion: "lxc-idmap-v1";
}>;

export type LxcResult = Readonly<{
  status: "valid" | "invalid";
  values: LxcValues | null;
  issues: LxcFinding[];
}>;

export const DEFAULT_LXC_INPUT: LxcInput = {
  uidMap: "u 0 100000 65536",
  gidMap: "g 0 100000 65536",
  grantOwner: "root",
  uidGrants: "root:100000:65536",
  gidGrants: "root:100000:65536",
  queryType: "uid",
  queryId: "1000",
};

function objectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function bigintString(value: bigint) {
  return value.toString(10);
}

const MAX_ID = 4_294_967_294n;

function parseNonNegative(value: string) {
  if (!/^\d+$/.test(value)) return null;
  try {
    const parsed = BigInt(value);
    return parsed <= MAX_ID ? parsed : null;
  } catch {
    return null;
  }
}

function parseMap(source: string, expected: LxcMapType) {
  const field = expected === "u" ? "uidMap" : "gidMap";
  const findings: LxcFinding[] = [];
  const ranges: LxcRange[] = [];
  source.split(/\r?\n/).forEach((line, index) => {
    const raw = line.trim();
    if (!raw || raw.startsWith("#")) return;
    const parts = raw.split(/\s+/);
    if (parts.length !== 4 || parts[0] !== expected) {
      findings.push({ severity: "error", code: "map.syntax", field, line: index + 1, message: `Line ${index + 1} must be ${expected} container host length.` });
      return;
    }
    const container = parseNonNegative(parts[1]);
    const host = parseNonNegative(parts[2]);
    const length = parseNonNegative(parts[3]);
    if (container === null || host === null || length === null || length === 0n) {
      findings.push({ severity: "error", code: "map.number", field, line: index + 1, message: `Line ${index + 1} needs non-negative starts and a positive length.` });
      return;
    }
    if (container + length - 1n > MAX_ID || host + length - 1n > MAX_ID) {
      findings.push({ severity: "error", code: "map.overflow", field, line: index + 1, message: `Line ${index + 1} ends beyond the usable ID range.` });
      return;
    }
    ranges.push({
      type: expected,
      containerStart: bigintString(container),
      hostStart: bigintString(host),
      length: bigintString(length),
      line: index + 1,
      containerEnd: bigintString(container + length - 1n),
      hostEnd: bigintString(host + length - 1n),
    });
  });
  if (!ranges.length) findings.push({ severity: "error", code: "map.empty", field, message: `Add at least one ${expected === "u" ? "UID" : "GID"} map line.` });
  return { ranges, findings };
}

function parseGrants(source: string, field: "uidGrants" | "gidGrants") {
  const findings: LxcFinding[] = [];
  const grants: { owner: string; start: bigint; length: bigint }[] = [];
  source.split(/\r?\n/).forEach((line, index) => {
    const raw = line.trim();
    if (!raw || raw.startsWith("#")) return;
    const parts = raw.split(":");
    if (parts.length !== 3) {
      findings.push({ severity: "error", code: "grant.syntax", field, line: index + 1, message: `Grant line ${index + 1} must be owner:start:length.` });
      return;
    }
    const start = parseNonNegative(parts[1]);
    const length = parseNonNegative(parts[2]);
    if (!parts[0].trim() || start === null || length === null || length === 0n) {
      findings.push({ severity: "error", code: "grant.number", field, line: index + 1, message: `Grant line ${index + 1} needs an owner and positive range.` });
      return;
    }
    if (start + length - 1n > MAX_ID) {
      findings.push({ severity: "error", code: "grant.overflow", field, line: index + 1, message: `Grant line ${index + 1} ends beyond the usable ID range.` });
      return;
    }
    grants.push({ owner: parts[0].trim(), start, length });
  });
  return { grants, findings };
}

function rangeBigints(range: LxcRange) {
  return {
    containerStart: BigInt(range.containerStart),
    hostStart: BigInt(range.hostStart),
    length: BigInt(range.length),
  };
}

function validateRanges(ranges: LxcRange[], field: "uidMap" | "gidMap") {
  const findings: LxcFinding[] = [];
  const byContainer = [...ranges].sort((a, b) => BigInt(a.containerStart) < BigInt(b.containerStart) ? -1 : 1);
  let previous: LxcRange | null = null;
  for (const range of byContainer) {
    if (previous) {
      const previousEnd = BigInt(previous.containerEnd);
      const start = BigInt(range.containerStart);
      if (start <= previousEnd) findings.push({ severity: "error", code: "map.overlap", field, line: range.line, message: `Line ${range.line} overlaps line ${previous.line}.` });
      else if (start > previousEnd + 1n) findings.push({ severity: "warning", code: "map.gap", field, line: range.line, message: `Container IDs gap between lines ${previous.line} and ${range.line}.` });
    }
    previous = range;
  }
  const byHost = [...ranges].sort((a, b) => BigInt(a.hostStart) < BigInt(b.hostStart) ? -1 : 1);
  previous = null;
  for (const range of byHost) {
    if (previous && BigInt(range.hostStart) <= BigInt(previous.hostEnd)) {
      findings.push({ severity: "error", code: "map.host-overlap", field, line: range.line, message: `Host range on line ${range.line} overlaps line ${previous.line}.` });
    }
    previous = range;
  }
  return findings;
}

export function checkLxcIdmap(input: unknown): LxcResult {
  if (!objectLike(input)) return { status: "invalid", values: null, issues: [{ severity: "error", code: "input.object", message: "Input must be an object." }] };
  const issues: LxcFinding[] = [];
  if (input.queryType !== "uid" && input.queryType !== "gid") issues.push({ severity: "error", code: "query.type", field: "queryType", message: "Choose UID or GID." });
  if (typeof input.queryId !== "string" || parseNonNegative(input.queryId.trim()) === null) issues.push({ severity: "error", code: "query.id", field: "queryId", message: "Query ID must be a usable non-negative ID." });
  if (typeof input.uidMap !== "string" || typeof input.gidMap !== "string" || typeof input.uidGrants !== "string" || typeof input.gidGrants !== "string" || typeof input.grantOwner !== "string") {
    issues.push({ severity: "error", code: "input.text", message: "Map, owner, and grant fields must be text." });
  }
  if (typeof input.grantOwner === "string"
    && typeof input.uidGrants === "string"
    && typeof input.gidGrants === "string"
    && (input.uidGrants.trim() || input.gidGrants.trim())
    && !input.grantOwner.trim()) {
    issues.push({ severity: "error", code: "grant.owner", field: "grantOwner", message: "Add the account that owns these grants." });
  }
  if (issues.length) return { status: "invalid", values: null, issues };
  const uid = parseMap(input.uidMap as string, "u");
  const gid = parseMap(input.gidMap as string, "g");
  const uidGrantResult = parseGrants(input.uidGrants as string, "uidGrants");
  const gidGrantResult = parseGrants(input.gidGrants as string, "gidGrants");
  const ranges = [...uid.ranges, ...gid.ranges];
  issues.push(...uid.findings, ...gid.findings, ...uidGrantResult.findings, ...gidGrantResult.findings, ...validateRanges(uid.ranges, "uidMap"), ...validateRanges(gid.ranges, "gidMap"));
  const queryType = input.queryType as LxcQueryType;
  const queryId = BigInt((input.queryId as string).trim());
  const selected = queryType === "uid" ? uid.ranges : gid.ranges;
  const selectedGrants = queryType === "uid" ? uidGrantResult.grants : gidGrantResult.grants;
  const matched = selected.find((range) => queryId >= BigInt(range.containerStart) && queryId <= BigInt(range.containerEnd)) ?? null;
  let hostId: string | null = null;
  let grantStatus: LxcQuery["grantStatus"] = "unknown";
  if (matched) {
    const parts = rangeBigints(matched);
    hostId = bigintString(parts.hostStart + queryId - parts.containerStart);
    if (selectedGrants.length) {
      const rangeStart = BigInt(matched.hostStart);
      const rangeEnd = BigInt(matched.hostEnd);
      const owner = (input.grantOwner as string).trim();
      grantStatus = selectedGrants.some((grant) => (
        grant.owner === owner
        && rangeStart >= grant.start
        && rangeEnd < grant.start + grant.length
      )) ? "covered" : "missing";
    }
  } else if (selectedGrants.length) grantStatus = "missing";
  const errorCount = issues.filter((item) => item.severity === "error").length;
  const warningCount = issues.filter((item) => item.severity === "warning").length;
  const values: LxcValues = {
    ranges,
    findings: issues,
    query: { type: queryType, id: queryId.toString(), hostId, range: matched, grantStatus },
    errorCount,
    warningCount,
    resolutionVersion: "lxc-idmap-v1",
  };
  if (errorCount) return { status: "invalid", values: null, issues };
  return { status: "valid", values, issues };
}

export function formatLxcReport(result: LxcResult) {
  if (!result.values) return result.issues.map((issue) => `${issue.severity.toUpperCase()} ${issue.message}`).join("\n");
  const query = result.values.query;
  return [
    query.hostId ? `${query.type.toUpperCase()} ${query.id} maps to host ${query.hostId} (${query.grantStatus})` : `${query.type.toUpperCase()} ${query.id} is unmapped (${query.grantStatus})`,
    ...result.values.ranges.map((range) => `${range.type.toUpperCase()} ${range.containerStart}-${range.containerEnd} -> ${range.hostStart}-${range.hostEnd}`),
    ...result.values.findings.map((issue) => `${issue.severity.toUpperCase()} ${issue.message}`),
  ].join("\n");
}
