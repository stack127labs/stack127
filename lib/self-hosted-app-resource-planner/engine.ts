export const RESOURCE_PLANNER_FORMULA_VERSION = 1;
export const RESOURCE_PLANNER_INPUT_VERSION = 1;
export const DEFAULT_HEADROOM_PERCENT = "20";

export type ResourceEstimateKind = "derived" | "estimated";
export type ResourceConfidence = "high" | "medium" | "low";

export type ResourceRange = {
  minMb?: number;
  maxMb?: number;
  minGb?: number;
  maxGb?: number;
  kind: ResourceEstimateKind | "user-supplied";
  confidence: ResourceConfidence | "user-supplied";
  basis: string;
  sourceUrls: string[];
  note: string | null;
  checkedAt: string | null;
};

export type ResourcePlannerCatalogueEntry = {
  slug: string;
  name: string;
  ram: ResourceRange | null;
  storage: ResourceRange | null;
};

export type ResourcePlannerCatalogue = Record<string, ResourcePlannerCatalogueEntry>;

export type ResourcePlannerRowInput = {
  id: string;
  kind: "curated" | "custom";
  appSlug: string;
  name: string;
  quantity: string;
  ramMinGiB: string;
  ramMaxGiB: string;
  storageMinGb: string;
  storageMaxGb: string;
};

export type ResourcePlannerInput = {
  rows: ResourcePlannerRowInput[];
  ramBudgetGiB: string;
  storageBudgetGb: string;
  headroomPercent: string;
};

export const DEFAULT_RESOURCE_PLANNER_INPUT: ResourcePlannerInput = {
  rows: [],
  ramBudgetGiB: "",
  storageBudgetGb: "",
  headroomPercent: DEFAULT_HEADROOM_PERCENT,
};

export type ResourcePlannerIssue = {
  field: string;
  message: string;
};

export type ResourcePlannerFit = "within" | "tight" | "over" | "unknown";
export type ResourceDimension = "ram" | "storage";

export type ResourceContribution = {
  id: string;
  name: string;
  quantity: number;
  min: number | null;
  max: number | null;
  evidence: "reviewed" | "user-supplied" | "unknown";
  kind: ResourceEstimateKind | "user-supplied" | "unknown";
  confidence: ResourceConfidence | "user-supplied" | "unknown";
  sourceUrls: string[];
  note: string | null;
};

export type ResourceDimensionResult = {
  knownMinMb?: number;
  knownMaxMb?: number;
  knownMinGb?: number;
  knownMaxGb?: number;
  availableMb?: number;
  availableGb?: number;
  fit: ResourcePlannerFit;
  ratio: number | null;
  contributions: ResourceContribution[];
  unknownRows: Array<{ id: string; name: string; quantity: number }>;
};

export type ResourcePlannerValues = {
  formulaVersion: number;
  inputVersion: number;
  headroomPercent: number;
  rows: Array<{ id: string; name: string; quantity: number; kind: "curated" | "custom"; appSlug: string }>;
  ram: ResourceDimensionResult;
  storage: ResourceDimensionResult;
  bindingResource: ResourceDimension | null;
};

export type ResourcePlannerResult =
  | { status: "invalid"; values: null; issues: ResourcePlannerIssue[] }
  | { status: "valid"; values: ResourcePlannerValues; issues: [] };

const DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const MAX_APP_NAME_LENGTH = 120;

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function readDecimal(value: unknown, field: string, min: number, max: number, issues: ResourcePlannerIssue[], options: { optional?: boolean; integer?: boolean } = {}) {
  if (value === "" || value === null || value === undefined) {
    if (options.optional) return null;
    issues.push({ field, message: "Enter a value." });
    return null;
  }
  if (typeof value !== "string" || !DECIMAL_PATTERN.test(value.trim())) {
    issues.push({ field, message: "Use a positive decimal value without a unit." });
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (options.integer && !Number.isInteger(parsed)) || parsed < min || parsed > max) {
    issues.push({ field, message: `Enter a value from ${min} to ${max}.` });
    return null;
  }
  return round(parsed);
}

function normalizedName(value: unknown, field: string, issues: ResourcePlannerIssue[]) {
  if (typeof value !== "string") {
    issues.push({ field, message: "Enter an app name." });
    return "";
  }
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) {
    issues.push({ field, message: "Enter an app name." });
    return "";
  }
  if (name.length > MAX_APP_NAME_LENGTH) {
    issues.push({ field, message: `Use ${MAX_APP_NAME_LENGTH} characters or fewer.` });
    return "";
  }
  return name;
}

function invalid(message: string, field: string) {
  return { field, message } satisfies ResourcePlannerIssue;
}

function unknownContribution(row: { id: string; name: string; quantity: number }): ResourceContribution {
  return {
    ...row,
    min: null,
    max: null,
    evidence: "unknown",
    kind: "unknown",
    confidence: "unknown",
    sourceUrls: [],
    note: null,
  };
}

function customRange(
  row: ResourcePlannerRowInput,
  dimension: ResourceDimension,
  quantity: number,
  issues: ResourcePlannerIssue[],
) {
  const minField = dimension === "ram" ? "ramMinGiB" : "storageMinGb";
  const maxField = dimension === "ram" ? "ramMaxGiB" : "storageMaxGb";
  const minValue = row[minField];
  const maxValue = row[maxField];
  if (minValue === "" && maxValue === "") {
    return unknownContribution({ id: row.id, name: row.name, quantity });
  }

  const min = readDecimal(minValue, `rows.${row.id}.${minField}`, dimension === "ram" ? 0.05 : 0.1, dimension === "ram" ? 4096 : 100000, issues, { optional: true });
  const max = readDecimal(maxValue, `rows.${row.id}.${maxField}`, dimension === "ram" ? 0.05 : 0.1, dimension === "ram" ? 4096 : 100000, issues, { optional: true });
  if (min === null || max === null) {
    if (minValue !== "" || maxValue !== "") {
      issues.push(invalid("Enter both bounds for a custom range.", `rows.${row.id}.${min === null ? minField : maxField}`));
    }
    return unknownContribution({ id: row.id, name: row.name, quantity });
  }
  if (max < min) {
    issues.push(invalid("The upper bound must be at least the lower bound.", `rows.${row.id}.${maxField}`));
  }
  const minBase = dimension === "ram" ? round(min * 1024) : min;
  const maxBase = dimension === "ram" ? round(max * 1024) : max;
  return {
    id: row.id,
    name: row.name,
    quantity,
    min: round(minBase * quantity),
    max: round(maxBase * quantity),
    evidence: "user-supplied" as const,
    kind: "user-supplied" as const,
    confidence: "user-supplied" as const,
    sourceUrls: [],
    note: null,
  } satisfies ResourceContribution;
}

function curatedRange(
  row: ResourcePlannerRowInput,
  dimension: ResourceDimension,
  quantity: number,
  catalogue: ResourcePlannerCatalogue,
  issues: ResourcePlannerIssue[],
) {
  const app = catalogue[row.appSlug];
  if (!app) {
    issues.push(invalid("Choose an app from the list.", `rows.${row.id}.appSlug`));
    return unknownContribution({ id: row.id, name: row.name, quantity });
  }
  const source = app[dimension];
  if (!source) {
    return unknownContribution({ id: row.id, name: app.name, quantity });
  }
  const min = dimension === "ram" ? source.minMb : source.minGb;
  const max = dimension === "ram" ? source.maxMb : source.maxGb;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === undefined || max === undefined || max < min || min < 0) {
    issues.push(invalid("This source range is unavailable.", `rows.${row.id}.${dimension}`));
    return unknownContribution({ id: row.id, name: app.name, quantity });
  }
  return {
    id: row.id,
    name: app.name,
    quantity,
    min: round(min * quantity),
    max: round(max * quantity),
    evidence: "reviewed" as const,
    kind: source.kind,
    confidence: source.confidence,
    sourceUrls: source.sourceUrls,
    note: source.note,
  } satisfies ResourceContribution;
}

function dimensionResult(
  dimension: ResourceDimension,
  contributions: ResourceContribution[],
  available: number,
): ResourceDimensionResult {
  const known = contributions.filter((contribution) => contribution.min !== null && contribution.max !== null);
  const unknownRows = contributions
    .filter((contribution) => contribution.min === null || contribution.max === null)
    .map(({ id, name, quantity }) => ({ id, name, quantity }));
  const min = round(known.reduce((sum, contribution) => sum + (contribution.min ?? 0), 0));
  const max = round(known.reduce((sum, contribution) => sum + (contribution.max ?? 0), 0));
  const fit: ResourcePlannerFit = unknownRows.length > 0
    ? "unknown"
    : min <= available && max <= available
      ? "within"
      : min <= available
        ? "tight"
        : "over";
  const ratio = unknownRows.length > 0 ? null : round(max / available);
  return dimension === "ram"
    ? { knownMinMb: min, knownMaxMb: max, availableMb: available, fit, ratio, contributions, unknownRows }
    : { knownMinGb: min, knownMaxGb: max, availableGb: available, fit, ratio, contributions, unknownRows };
}

export function calculateSelfHostedResourcePlan(
  input: ResourcePlannerInput,
  catalogue: ResourcePlannerCatalogue,
): ResourcePlannerResult {
  const issues: ResourcePlannerIssue[] = [];
  if (!input || typeof input !== "object" || !Array.isArray(input.rows)) {
    return { status: "invalid", values: null, issues: [invalid("Add at least one app.", "rows")] };
  }

  const ramBudgetGiB = readDecimal(input.ramBudgetGiB, "ramBudgetGiB", 0.25, 4096, issues);
  const storageBudgetGb = readDecimal(input.storageBudgetGb, "storageBudgetGb", 1, 1_000_000, issues);
  const headroomPercent = readDecimal(input.headroomPercent, "headroomPercent", 0, 80, issues, { integer: true });
  if (input.rows.length === 0) {
    issues.push(invalid("Add at least one app.", "rows"));
  }

  const rows: Array<{ input: ResourcePlannerRowInput; name: string; quantity: number }> = [];
  for (const row of input.rows) {
    if (!row || typeof row !== "object") {
      issues.push(invalid("Add a valid app row.", "rows"));
      continue;
    }
    const quantity = readDecimal(row.quantity, `rows.${row.id}.quantity`, 1, 99, issues, { integer: true });
    if (quantity === null) continue;
    const name = row.kind === "custom"
      ? normalizedName(row.name, `rows.${row.id}.name`, issues)
      : catalogue[row.appSlug]?.name ?? row.name;
    if (!name) continue;
    rows.push({ input: row, name, quantity });
  }

  if (issues.length > 0 || ramBudgetGiB === null || storageBudgetGb === null || headroomPercent === null) {
    return { status: "invalid", values: null, issues };
  }

  const availableRamMb = round(ramBudgetGiB * 1024 * (1 - headroomPercent / 100));
  const availableStorageGb = round(storageBudgetGb * (1 - headroomPercent / 100));
  const ramContributions = rows.map(({ input: row, name, quantity }) => (
    row.kind === "custom"
      ? customRange({ ...row, name }, "ram", quantity, issues)
      : curatedRange({ ...row, name }, "ram", quantity, catalogue, issues)
  ));
  const storageContributions = rows.map(({ input: row, name, quantity }) => (
    row.kind === "custom"
      ? customRange({ ...row, name }, "storage", quantity, issues)
      : curatedRange({ ...row, name }, "storage", quantity, catalogue, issues)
  ));
  if (issues.length > 0) {
    return { status: "invalid", values: null, issues };
  }

  const ram = dimensionResult("ram", ramContributions, availableRamMb);
  const storage = dimensionResult("storage", storageContributions, availableStorageGb);
  const complete = [
    { dimension: "ram" as const, ratio: ram.ratio },
    { dimension: "storage" as const, ratio: storage.ratio },
  ].filter((item): item is { dimension: ResourceDimension; ratio: number } => item.ratio !== null);
  const bindingResource = complete.sort((a, b) => b.ratio - a.ratio)[0]?.dimension ?? null;

  return {
    status: "valid",
    issues: [],
    values: {
      formulaVersion: RESOURCE_PLANNER_FORMULA_VERSION,
      inputVersion: RESOURCE_PLANNER_INPUT_VERSION,
      headroomPercent,
      rows: rows.map(({ input: row, name, quantity }) => ({ id: row.id, name, quantity, kind: row.kind, appSlug: row.appSlug })),
      ram,
      storage,
      bindingResource,
    },
  };
}

function formatNumber(value: number, digits: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function formatResourcePlannerDisplayValue(value: number, dimension: ResourceDimension) {
  const displayValue = dimension === "ram" ? value / 1024 : value;
  const digits = displayValue < 10 ? 1 : 0;
  return `${formatNumber(displayValue, digits)} ${dimension === "ram" ? "GiB" : "GB"}`;
}

export function formatResourcePlannerRange(result: ResourceDimensionResult, dimension: ResourceDimension) {
  const hasKnownContribution = result.contributions.some((contribution) => contribution.min !== null && contribution.max !== null);
  if (result.fit === "unknown" && !hasKnownContribution) return "Unknown";
  const prefix = result.fit === "unknown" ? "Known subtotal: " : "";
  if (dimension === "ram") {
    if (result.knownMinMb === undefined || result.knownMaxMb === undefined) return "Unknown";
    return `${prefix}${formatResourcePlannerDisplayValue(result.knownMinMb, dimension)} to ${formatResourcePlannerDisplayValue(result.knownMaxMb, dimension)}`;
  }
  if (result.knownMinGb === undefined || result.knownMaxGb === undefined) return "Unknown";
  return `${prefix}${formatResourcePlannerDisplayValue(result.knownMinGb, dimension)} to ${formatResourcePlannerDisplayValue(result.knownMaxGb, dimension)}`;
}

export function formatResourcePlannerAvailable(result: ResourceDimensionResult, dimension: ResourceDimension) {
  return formatResourcePlannerDisplayValue(dimension === "ram" ? result.availableMb ?? 0 : result.availableGb ?? 0, dimension);
}
