export const HOME_ASSISTANT_ENERGY_FORMULA_VERSION = 1 as const;
export const HOME_ASSISTANT_CORE_VERSION = "2026.8.1" as const;
export const HOME_ASSISTANT_FRONTEND_VERSION = "20260729.6" as const;
export const HOME_ASSISTANT_ENERGY_SOURCE_DATE = "2026-08-09" as const;

export const energyEntityRoles = [
  "grid_import",
  "grid_export",
  "solar",
  "battery_charge",
  "battery_discharge",
  "individual_device",
  "power",
  "gas",
  "water",
] as const;
export const energyEntityStateKinds = ["numeric", "non_numeric", "unknown", "unavailable"] as const;
export const energyCounterBehaviors = ["never_resets", "resets_to_zero", "can_decrease", "unknown"] as const;

export type EnergyEntityRole = (typeof energyEntityRoles)[number];
export type EnergyEntityStateKind = (typeof energyEntityStateKinds)[number];
export type EnergyCounterBehavior = (typeof energyCounterBehaviors)[number];

export type EnergyEntityInput = Readonly<{
  role: EnergyEntityRole;
  entityId: string;
  stateKind: EnergyEntityStateKind;
  deviceClass: string;
  stateClass: string;
  unit: string;
  counterBehavior: EnergyCounterBehavior;
}>;

export type EligibilityRule = Readonly<{
  scope: "both" | "energy" | "statistics";
  field: "domain" | "state" | "device_class" | "state_class" | "unit";
  received: string;
  accepted: readonly string[];
  status: "pass" | "fail";
  reason: string;
  correction: string | null;
}>;

type CounterResult = Readonly<{
  status: "pass" | "fail" | "unknown" | "not_applicable";
  reason: string;
  correction: null;
}>;

type Conclusion<T extends string> = Readonly<{ status: T; instanceCheck: "not_inspected" }>;

export type ValidEnergyEntityResult = Readonly<{
  status: "valid";
  input: EnergyEntityInput;
  energy: Conclusion<"attributes_match_instance_check_required" | "fails_attributes">;
  statistics: Conclusion<"attributes_match_recorder_check_required" | "fails_attributes">;
  rules: readonly EligibilityRule[];
  counter: CounterResult;
  provenance: Readonly<{
    formulaVersion: typeof HOME_ASSISTANT_ENERGY_FORMULA_VERSION;
    coreVersion: typeof HOME_ASSISTANT_CORE_VERSION;
    frontendVersion: typeof HOME_ASSISTANT_FRONTEND_VERSION;
    sourceDate: typeof HOME_ASSISTANT_ENERGY_SOURCE_DATE;
  }>;
}>;

export type InvalidEnergyEntityResult = Readonly<{
  status: "invalid";
  field: "form";
  message: string;
}>;

const energyUnits = Object.freeze(["J", "kJ", "MJ", "GJ", "mWh", "Wh", "kWh", "MWh", "GWh", "TWh", "cal", "kcal", "Mcal", "Gcal"]);
const powerUnits = Object.freeze(["mW", "W", "kW", "MW", "GW", "TW", "BTU/h"]);
const gasUnits = Object.freeze(["CCF", "ft³", "m³", "L", "MCF"]);
const waterUnits = Object.freeze(["CCF", "ft³", "m³", "gal", "L", "MCF"]);
const statisticsStateClasses = Object.freeze(["measurement", "measurement_angle", "total", "total_increasing"]);
const roleSet = new Set<string>(energyEntityRoles);
const stateKindSet = new Set<string>(energyEntityStateKinds);
const counterSet = new Set<string>(energyCounterBehaviors);
const inputKeys = Object.freeze(["counterBehavior", "deviceClass", "entityId", "role", "stateClass", "stateKind", "unit"]);
const supportedPasteKeys = new Set(["entity_id", "state", "device_class", "state_class", "unit_of_measurement", "last_reset"]);
const dangerousKeys = new Set(["__proto__", "constructor", "prototype"]);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeInput(value: unknown): EnergyEntityInput | null {
  if (!isPlainRecord(value) || Object.keys(value).length !== inputKeys.length || !inputKeys.every((key) => key in value)) return null;
  if (typeof value.role !== "string" || !roleSet.has(value.role)) return null;
  if (typeof value.stateKind !== "string" || !stateKindSet.has(value.stateKind)) return null;
  if (typeof value.counterBehavior !== "string" || !counterSet.has(value.counterBehavior)) return null;
  if (typeof value.entityId !== "string" || value.entityId.length > 255) return null;
  if (typeof value.deviceClass !== "string" || value.deviceClass.length > 64) return null;
  if (typeof value.stateClass !== "string" || value.stateClass.length > 64) return null;
  if (typeof value.unit !== "string" || value.unit.length > 32) return null;
  return Object.freeze({
    role: value.role as EnergyEntityRole,
    entityId: value.entityId.trim(),
    stateKind: value.stateKind as EnergyEntityStateKind,
    deviceClass: value.deviceClass.trim(),
    stateClass: value.stateClass.trim(),
    unit: value.unit.trim(),
    counterBehavior: value.counterBehavior as EnergyCounterBehavior,
  });
}

function roleRequirements(input: EnergyEntityInput) {
  if (input.role === "power") return { deviceClasses: ["power"], stateClasses: ["measurement"], units: powerUnits } as const;
  if (input.role === "gas") {
    const units = input.deviceClass === "energy" ? energyUnits : input.deviceClass === "gas" ? gasUnits : Object.freeze([...gasUnits, ...energyUnits]);
    return { deviceClasses: ["gas", "energy"], stateClasses: ["total", "total_increasing"], units } as const;
  }
  if (input.role === "water") return { deviceClasses: ["water"], stateClasses: ["total", "total_increasing"], units: waterUnits } as const;
  return { deviceClasses: ["energy"], stateClasses: ["total", "total_increasing"], units: energyUnits } as const;
}

function domainOf(entityId: string) {
  const dot = entityId.indexOf(".");
  return dot === -1 ? entityId : entityId.slice(0, dot);
}

function rule(
  scope: EligibilityRule["scope"],
  field: EligibilityRule["field"],
  received: string,
  accepted: readonly string[],
  reason: string,
): EligibilityRule {
  const passed = accepted.includes(received);
  return Object.freeze({
    scope,
    field,
    received: received || "missing",
    accepted: Object.freeze([...accepted]),
    status: passed ? "pass" : "fail",
    reason,
    correction: !passed && accepted.length === 1 ? accepted[0] : null,
  });
}

function counterResult(input: EnergyEntityInput): CounterResult {
  if (input.role === "power") return Object.freeze({ status: "not_applicable", reason: "Power is a current measurement.", correction: null });
  if (input.stateClass === "total") return Object.freeze({ status: "pass", reason: "Total can increase or decrease.", correction: null });
  if (input.stateClass !== "total_increasing") return Object.freeze({ status: "not_applicable", reason: "Choose a total state class first.", correction: null });
  if (input.counterBehavior === "unknown") return Object.freeze({ status: "unknown", reason: "Counter behavior still needs verification.", correction: null });
  if (input.counterBehavior === "can_decrease") return Object.freeze({ status: "fail", reason: "A decreasing counter can create false meter cycles.", correction: null });
  return Object.freeze({ status: "pass", reason: "The counter fits total_increasing.", correction: null });
}

export function evaluateEnergyEntity(value: unknown): ValidEnergyEntityResult | InvalidEnergyEntityResult {
  const input = normalizeInput(value);
  if (!input) return Object.freeze({ status: "invalid", field: "form", message: "Configuration is invalid." });
  const requirements = roleRequirements(input);
  const rules = Object.freeze([
    rule("both", "domain", domainOf(input.entityId), ["sensor"], "Both checks require sensor entities."),
    rule("both", "state", input.stateKind, ["numeric"], "The current state must be numeric."),
    rule("energy", "device_class", input.deviceClass, requirements.deviceClasses, "The device class must fit this field."),
    rule("energy", "state_class", input.stateClass, requirements.stateClasses, "The state class must fit this quantity."),
    rule("energy", "unit", input.unit, requirements.units, "The unit must match exactly."),
    rule("statistics", "state_class", input.stateClass, statisticsStateClasses, "The state class must create statistics."),
  ]);
  const energyFailed = rules.some((entry) => entry.status === "fail" && entry.scope !== "statistics");
  const statisticsFailed = rules.some((entry) => entry.status === "fail" && entry.scope !== "energy");
  return Object.freeze({
    status: "valid",
    input,
    energy: Object.freeze({ status: energyFailed ? "fails_attributes" : "attributes_match_instance_check_required", instanceCheck: "not_inspected" }),
    statistics: Object.freeze({ status: statisticsFailed ? "fails_attributes" : "attributes_match_recorder_check_required", instanceCheck: "not_inspected" }),
    rules,
    counter: counterResult(input),
    provenance: Object.freeze({
      formulaVersion: HOME_ASSISTANT_ENERGY_FORMULA_VERSION,
      coreVersion: HOME_ASSISTANT_CORE_VERSION,
      frontendVersion: HOME_ASSISTANT_FRONTEND_VERSION,
      sourceDate: HOME_ASSISTANT_ENERGY_SOURCE_DATE,
    }),
  });
}

export type ParsedHomeAssistantAttributes = Readonly<{
  entityId?: string;
  stateKind?: EnergyEntityStateKind;
  deviceClass?: string;
  stateClass?: string;
  unit?: string;
  lastReset?: string;
}>;

export type PasteParseResult =
  | Readonly<{ status: "valid"; values: ParsedHomeAssistantAttributes }>
  | Readonly<{ status: "invalid"; message: string }>;

function scalarToString(value: unknown): string | null {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function stateKind(value: string): EnergyEntityStateKind {
  const normalized = value.trim();
  if (normalized === "unknown") return "unknown";
  if (normalized === "unavailable") return "unavailable";
  if (normalized !== "" && Number.isFinite(Number(normalized))) return "numeric";
  return "non_numeric";
}

function parsedValues(entries: ReadonlyMap<string, string>): ParsedHomeAssistantAttributes {
  const values: ParsedHomeAssistantAttributes = {
    ...(entries.has("entity_id") ? { entityId: entries.get("entity_id") } : {}),
    ...(entries.has("state") ? { stateKind: stateKind(entries.get("state") ?? "") } : {}),
    ...(entries.has("device_class") ? { deviceClass: entries.get("device_class") } : {}),
    ...(entries.has("state_class") ? { stateClass: entries.get("state_class") } : {}),
    ...(entries.has("unit_of_measurement") ? { unit: entries.get("unit_of_measurement") } : {}),
    ...(entries.has("last_reset") ? { lastReset: entries.get("last_reset") } : {}),
  };
  return Object.freeze(values);
}

function parseJsonPaste(text: string): PasteParseResult {
  const supportedMatches = [...text.matchAll(/"(entity_id|state|device_class|state_class|unit_of_measurement|last_reset)"\s*:/g)];
  if (new Set(supportedMatches.map((match) => match[1])).size !== supportedMatches.length) return Object.freeze({ status: "invalid", message: "Remove duplicate supported keys." });
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return Object.freeze({ status: "invalid", message: "Paste a valid attribute object." });
  }
  if (!isPlainRecord(value)) return Object.freeze({ status: "invalid", message: "Paste one flat attribute object." });
  const entries = new Map<string, string>();
  for (const [key, candidate] of Object.entries(value)) {
    if (dangerousKeys.has(key)) return Object.freeze({ status: "invalid", message: "Remove unsafe object keys." });
    if (!supportedPasteKeys.has(key)) continue;
    const scalar = scalarToString(candidate);
    if (scalar === null) return Object.freeze({ status: "invalid", message: "Supported attributes must be scalar values." });
    entries.set(key, scalar);
  }
  return Object.freeze({ status: "valid", values: parsedValues(entries) });
}

function unquote(value: string): string | null {
  if (!value.startsWith("\"") && !value.startsWith("'")) return value;
  const quote = value[0];
  if (value.length < 2 || !value.endsWith(quote)) return null;
  return value.slice(1, -1);
}

function parseLinePaste(text: string): PasteParseResult {
  const entries = new Map<string, string>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 1) return Object.freeze({ status: "invalid", message: "Use one key and value per line." });
    const key = line.slice(0, colon).trim();
    if (dangerousKeys.has(key)) return Object.freeze({ status: "invalid", message: "Remove unsafe object keys." });
    if (!supportedPasteKeys.has(key)) continue;
    if (entries.has(key)) return Object.freeze({ status: "invalid", message: "Remove duplicate supported keys." });
    const candidate = unquote(line.slice(colon + 1).trim());
    if (candidate === null) return Object.freeze({ status: "invalid", message: "Close quoted attribute values." });
    entries.set(key, candidate);
  }
  return Object.freeze({ status: "valid", values: parsedValues(entries) });
}

export function parseHomeAssistantAttributes(value: string): PasteParseResult {
  if (typeof value !== "string" || value.length > 20_000) return Object.freeze({ status: "invalid", message: "Keep pasted attributes under 20,000 characters." });
  const text = value.trim();
  if (!text) return Object.freeze({ status: "invalid", message: "Paste entity attributes first." });
  if (text.startsWith("{") || text.startsWith("[")) return parseJsonPaste(text);
  return parseLinePaste(text);
}
