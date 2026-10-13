export const SNAPRAID_MERGERFS_CALCULATION_VERSION = 1 as const;
export const SNAPRAID_MERGERFS_INPUT_VERSION = 1 as const;

export type CapacityUnit = "TB" | "TiB";
export type MergerfsPolicy = "balanced" | "most-free";
export type SnapraidBlocksize = 256 | 512 | 1024;

export type DiskRowInput = {
  path: string;
  capacity: string;
  unit: CapacityUnit;
};

export type SnapraidMergerfsInput = {
  data: DiskRowInput[];
  parity: DiskRowInput[];
  content: string[];
  poolPath: string;
  policy: MergerfsPolicy;
  blocksize: SnapraidBlocksize;
  standardExcludes: boolean;
};

export type Issue = {
  field: string;
  message: string;
};

export type AuditCheck = {
  label: string;
  status: "pass" | "note";
  detail: string;
};

type ParsedDisk = DiskRowInput & { normalizedPath: string; bytes: bigint };

export type SnapraidMergerfsReady = {
  status: "ready";
  input: SnapraidMergerfsInput;
  normalized: {
    data: ParsedDisk[];
    parity: ParsedDisk[];
    content: string[];
    poolPath: string;
  };
  dataTotalBytes: bigint;
  largestDataBytes: bigint;
  parityTotalBytes: bigint;
  parityCount: number;
  contentMinimum: number;
  checks: AuditCheck[];
  snapraidConfig: string;
  fstabLine: string;
  policyOptions: string;
  assumptions: string[];
};

export type SnapraidMergerfsInvalid = {
  status: "invalid";
  issues: Issue[];
  errors: Record<string, string>;
  snapraidConfig: null;
  fstabLine: null;
};

export type SnapraidMergerfsResult = SnapraidMergerfsReady | SnapraidMergerfsInvalid;

export const MERGERFS_POLICY_OPTIONS: Readonly<Record<MergerfsPolicy, string>> = {
  balanced: ["defaults", "allow_other", "cache.files=off", "dropcacheonclose=true", "category.create=epmfs", "func.getattr=newest", "moveonenospc=true", "minfreespace=4G", "fsname=mergerfs"].join(","),
  "most-free": ["defaults", "allow_other", "cache.files=off", "dropcacheonclose=true", "category.create=mfs", "func.getattr=newest", "moveonenospc=true", "minfreespace=4G", "fsname=mergerfs"].join(","),
};

export const STANDARD_EXCLUDES = [
  "/lost+found/",
  ".Trash-*/",
  ".recycle/",
  "*.unrecoverable",
] as const;

const CAPACITY_FACTORS: Record<CapacityUnit, bigint> = {
  TB: 1_000_000_000_000n,
  TiB: 1_099_511_627_776n,
};

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

function issue(issues: Issue[], field: string, message: string) {
  issues.push({ field, message });
}

function normalizePath(value: unknown): { path?: string; error?: string } {
  if (typeof value !== "string") return { error: "Enter an absolute POSIX path." };
  const trimmed = value.trim();
  if (!trimmed) return { error: "Enter an absolute POSIX path." };
  if (!trimmed.startsWith("/")) return { error: "Use an absolute POSIX path starting with /." };
  if (/\s|[:,\\]/.test(trimmed)) return { error: "Unsafe path characters." };
  if (trimmed.includes("//")) return { error: "Keep path segments separated by one slash." };
  const normalized = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  if (!normalized || normalized === "/") return { error: "Root path is too broad." };
  const segments = normalized.slice(1).split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return { error: "Invalid path segments." };
  }
  return { path: normalized };
}

function pathOverlaps(a: string, b: string): boolean {
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function pathIsUnder(child: string, parent: string): boolean {
  return child.startsWith(`${parent}/`);
}

export function parseCapacity(value: unknown, unit: unknown): bigint {
  if (typeof value !== "string" || !hasOwn(CAPACITY_FACTORS, String(unit))) throw new Error("capacity");
  const normalized = value.trim();
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) throw new Error("capacity");
  const [whole, fraction = ""] = normalized.split(".");
  const factor = CAPACITY_FACTORS[unit as CapacityUnit];
  const scale = 10n ** BigInt(fraction.length);
  const numerator = BigInt(whole) * scale + BigInt(fraction || "0");
  const scaled = numerator * factor;
  if (scaled % scale !== 0n) throw new Error("fractional-byte");
  return scaled / scale;
}

function parseDisk(value: unknown, field: string, issues: Issue[], allowZero = false): ParsedDisk | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issue(issues, field, "Enter path, capacity, and unit.");
    return null;
  }
  if (!hasOwn(value, "path") || !hasOwn(value, "capacity") || !hasOwn(value, "unit")) {
    issue(issues, field, "Enter path, capacity, and unit.");
    return null;
  }
  const row = value as Record<string, unknown>;
  const pathResult = normalizePath(row.path);
  if (!pathResult.path) issue(issues, `${field}.path`, pathResult.error ?? "Enter an absolute POSIX path.");
  let bytes = 0n;
  try {
    bytes = parseCapacity(row.capacity, row.unit);
    if (!allowZero && bytes <= 0n) throw new Error("zero");
  } catch (error) {
    const reason = error instanceof Error && error.message === "fractional-byte"
      ? "Capacity must resolve to bytes."
      : allowZero && row.capacity === "0"
        ? "Capacity must be greater than zero."
        : "Enter a non-negative decimal capacity.";
    issue(issues, `${field}.capacity`, reason);
  }
  if (!pathResult.path || bytes <= 0n) return null;
  return {
    path: row.path as string,
    capacity: row.capacity as string,
    unit: row.unit as CapacityUnit,
    normalizedPath: pathResult.path,
    bytes,
  };
}

function validateDiskShape(value: unknown, field: string, issues: Issue[]): value is DiskRowInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  if (typeof row.path !== "string" || typeof row.capacity !== "string" || !["TB", "TiB"].includes(String(row.unit))) {
    issue(issues, field, "Enter path, capacity, and unit.");
    return false;
  }
  return true;
}

function validatePathList(
  paths: unknown,
  field: string,
  issues: Issue[],
): string[] {
  if (!Array.isArray(paths)) {
    issue(issues, field, "Enter an ordered list of paths.");
    return [];
  }
  const normalized: string[] = [];
  paths.forEach((value, index) => {
    const parsed = normalizePath(value);
    if (!parsed.path) issue(issues, `${field}.${index}`, parsed.error ?? "Enter an absolute POSIX path.");
    else normalized.push(parsed.path);
  });
  return normalized;
}

function addPairwisePathIssues(rows: Array<{ path: string; field: string }>, issues: Issue[], relationship: string) {
  for (let index = 0; index < rows.length; index += 1) {
    for (let next = index + 1; next < rows.length; next += 1) {
      if (!pathOverlaps(rows[index].path, rows[next].path)) continue;
      issue(issues, rows[index].field, `${relationship} overlaps ${rows[next].path}.`);
      issue(issues, rows[next].field, `${relationship} overlaps ${rows[index].path}.`);
    }
  }
}

function formatBytes(bytes: bigint, unit: CapacityUnit): string {
  const factor = CAPACITY_FACTORS[unit];
  const scaled = (bytes * 100n + factor / 2n) / factor;
  const whole = scaled / 100n;
  const fraction = String(scaled % 100n).padStart(2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction} ${unit}` : `${whole} ${unit}`;
}

function exactInputShape(value: unknown): value is SnapraidMergerfsInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const object = value as Record<string, unknown>;
  const keys = ["data", "parity", "content", "poolPath", "policy", "blocksize", "standardExcludes"];
  return Object.keys(object).length === keys.length && keys.every((key) => hasOwn(object, key));
}

function emptyInvalid(issues: Issue[]): SnapraidMergerfsInvalid {
  const errors: Record<string, string> = {};
  for (const item of issues) errors[item.field] ??= item.message;
  return { status: "invalid", issues, errors, snapraidConfig: null, fstabLine: null };
}

export function buildSnapraidMergerfsPlan(value: unknown): SnapraidMergerfsResult {
  const issues: Issue[] = [];
  if (!exactInputShape(value)) {
    issue(issues, "form", "Enter the planner fields without unknown options.");
    return emptyInvalid(issues);
  }
  const input = value;
  if (!Array.isArray(input.data) || input.data.length < 2 || input.data.length > 42) {
    issue(issues, "data", "Use between 2 and 42 data disks.");
  }
  if (!Array.isArray(input.parity) || input.parity.length < 1 || input.parity.length > 3) {
    issue(issues, "parity", "Use between 1 and 3 parity disks.");
  }
  if (!Array.isArray(input.content) || input.content.length < 2 || input.content.length > 12) {
    issue(issues, "content", "Use between 2 and 12 content-file paths.");
  }
  if (!Object.hasOwn(MERGERFS_POLICY_OPTIONS, input.policy)) issue(issues, "policy", "Choose one of the provided mergerfs policies.");
  if (![256, 512, 1024].includes(input.blocksize)) issue(issues, "blocksize", "Choose 256, 512, or 1024 KiB.");
  if (typeof input.standardExcludes !== "boolean") issue(issues, "standardExcludes", "Choose whether to include standard excludes.");

  const data: ParsedDisk[] = [];
  const parity: ParsedDisk[] = [];
  if (Array.isArray(input.data)) {
    input.data.forEach((row, index) => {
      if (validateDiskShape(row, `data.${index}`, issues)) {
        const parsed = parseDisk(row, `data.${index}`, issues);
        if (parsed) data.push(parsed);
      } else issue(issues, `data.${index}`, "Enter path, capacity, and unit.");
    });
  }
  if (Array.isArray(input.parity)) {
    input.parity.forEach((row, index) => {
      if (validateDiskShape(row, `parity.${index}`, issues)) {
        const parsed = parseDisk(row, `parity.${index}`, issues);
        if (parsed) parity.push(parsed);
      } else issue(issues, `parity.${index}`, "Enter path, capacity, and unit.");
    });
  }
  const content = validatePathList(input.content, "content", issues);
  const poolResult = normalizePath(input.poolPath);
  if (!poolResult.path) issue(issues, "poolPath", poolResult.error ?? "Enter an absolute POSIX path.");
  const poolPath = poolResult.path ?? "";

  addPairwisePathIssues(data.map((row, index) => ({ path: row.normalizedPath, field: `data.${index}.path` })), issues, "Data paths");
  addPairwisePathIssues(parity.map((row, index) => ({ path: row.normalizedPath, field: `parity.${index}.path` })), issues, "Parity paths");
  for (const [dataIndex, dataRow] of data.entries()) {
    for (const [parityIndex, parityRow] of parity.entries()) {
      if (!pathOverlaps(dataRow.normalizedPath, parityRow.normalizedPath)) continue;
      issue(issues, `data.${dataIndex}.path`, `Data path overlaps parity path ${parityRow.normalizedPath}.`);
      issue(issues, `parity.${parityIndex}.path`, `Parity path overlaps data path ${dataRow.normalizedPath}.`);
    }
  }
  if (poolPath) {
    for (const [index, row] of data.entries()) if (pathOverlaps(poolPath, row.normalizedPath)) issue(issues, "poolPath", `Pool path overlaps data path ${row.normalizedPath}.`);
    for (const [index, row] of parity.entries()) if (pathOverlaps(poolPath, row.normalizedPath)) issue(issues, "poolPath", `Pool path overlaps parity path ${row.normalizedPath}.`);
  }
  const contentSeen = new Map<string, number>();
  content.forEach((path, index) => {
    const previous = contentSeen.get(path);
    if (previous !== undefined) {
      issue(issues, `content.${index}`, `Content path duplicates content.${previous}.`);
    } else contentSeen.set(path, index);
    if (path === poolPath || (poolPath && pathIsUnder(path, poolPath)) || (poolPath && pathIsUnder(poolPath, path))) {
      issue(issues, `content.${index}`, "Content path overlaps pool.");
    }
    for (const [dataIndex, row] of data.entries()) if (path === row.normalizedPath) issue(issues, `content.${index}`, `Use a file below data.${dataIndex}.`);
    for (const [parityIndex, row] of parity.entries()) if (pathIsUnder(path, row.normalizedPath) || path === row.normalizedPath) issue(issues, `content.${index}`, `Content paths must stay outside parity.${parityIndex}.`);
  });
  for (let index = 0; index < content.length; index += 1) {
    for (let next = index + 1; next < content.length; next += 1) {
      if (!pathOverlaps(content[index], content[next])) continue;
      issue(issues, `content.${index}`, `Content path overlaps ${content[next]}.`);
      issue(issues, `content.${next}`, `Content path overlaps ${content[index]}.`);
    }
  }
  const contentMinimum = parity.length + 1;
  if (Array.isArray(input.content) && input.content.length < contentMinimum) issue(issues, "content", `Need ${contentMinimum} content files for parity.`);

  if (data.length > 0 && parity.length > 0) {
    const largestDataBytes = data.reduce((max, row) => row.bytes > max ? row.bytes : max, 0n);
    parity.forEach((row, index) => {
      if (row.bytes < largestDataBytes) issue(issues, `parity.${index}.capacity`, `Parity is smaller than data (${formatBytes(largestDataBytes, row.unit)}).`);
    });
  }

  const knownRoots = [...data.map((row) => row.normalizedPath), ...parity.map((row) => row.normalizedPath)];
  if (content.length >= contentMinimum) {
    const roots = new Set(content.map((path) => knownRoots.find((root) => pathIsUnder(path, root)) ?? path));
    if (roots.size < contentMinimum) issue(issues, "content", "Content roots are not distinct enough.");
  }

  if (issues.length > 0) return emptyInvalid(issues);

  const dataTotalBytes = data.reduce((total, row) => total + row.bytes, 0n);
  const largestDataBytes = data.reduce((max, row) => row.bytes > max ? row.bytes : max, 0n);
  const parityTotalBytes = parity.reduce((total, row) => total + row.bytes, 0n);
  const policyOptions = MERGERFS_POLICY_OPTIONS[input.policy];
  const parityLines = parity.map((row, index) => `${index === 0 ? "parity" : `${index + 1}-parity`} ${row.normalizedPath}/snapraid.parity`);
  const contentLines = content.map((path) => `content ${path}`);
  const dataLines = data.map((row, index) => `data d${index + 1} ${row.normalizedPath}`);
  const excludeLines = input.standardExcludes ? STANDARD_EXCLUDES.map((pattern) => `exclude ${pattern}`) : [];
  const snapraidConfig = [
    ...parityLines,
    ...contentLines,
    ...dataLines,
    `blocksize ${input.blocksize}`,
    ...excludeLines,
  ].join("\n") + "\n";
  const branchList = data.map((row) => row.normalizedPath).join(":");
  const fstabLine = `${branchList} ${poolPath} fuse.mergerfs ${policyOptions} 0 0`;
  const checks: AuditCheck[] = [
    { label: "Parity size check", status: "pass", detail: `${parity.length} parity levels.` },
    { label: "Branch separation", status: "pass", detail: `${data.length} data branches.` },
    { label: "Content count check", status: "pass", detail: `${content.length} content copies.` },
    { label: "Host verification", status: "note", detail: "Verify host state separately." },
  ];
  const assumptions = [
    "Structural plan only.",
    "Verify selected mergerfs options.",
    "Parity filename is generated.",
    "No storage, network, or URL state.",
  ];
  const normalizedInput: SnapraidMergerfsInput = {
    data: input.data.map((row) => ({ ...row })),
    parity: input.parity.map((row) => ({ ...row })),
    content: [...input.content],
    poolPath: input.poolPath,
    policy: input.policy,
    blocksize: input.blocksize,
    standardExcludes: input.standardExcludes,
  };
  return Object.freeze({
    status: "ready",
    input: normalizedInput,
    normalized: { data, parity, content: [...content], poolPath },
    dataTotalBytes,
    largestDataBytes,
    parityTotalBytes,
    parityCount: parity.length,
    contentMinimum,
    checks,
    snapraidConfig,
    fstabLine,
    policyOptions,
    assumptions,
  });
}

export function displayPlanSummary(result: SnapraidMergerfsReady): string {
  const unit = result.input.data[0]?.unit ?? "TB";
  return `${result.normalized.data.length} data · ${formatBytes(result.dataTotalBytes, unit)}`
    + ` · ${result.parityCount} parity · ${formatBytes(result.parityTotalBytes, unit)}`
    + ` · ${result.normalized.content.length} content`;
}

export function formatPlanBytes(bytes: bigint, unit: CapacityUnit): string {
  return formatBytes(bytes, unit);
}
