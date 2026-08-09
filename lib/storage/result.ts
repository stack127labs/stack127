import { deepFreeze } from "./freeze.ts";
import {
  STORAGE_ENGINE_VERSION,
  StorageValidationError,
  type StorageAssumption,
  type StorageCalculationResult,
  type StorageDerivationStep,
  type StorageIssue,
  type StorageSource,
  type StorageUncertainty,
  type StorageValue,
  type StorageValueClassification,
} from "./types.ts";

export function storageValue<T>(input: Readonly<{
  label: string;
  value: T;
  unit: string;
  classification: StorageValueClassification;
  explanation?: string;
}>): StorageValue<T> {
  if (!input.label.trim() || !input.unit.trim()) {
    throw new StorageValidationError("Storage values need a label and unit.");
  }
  if (!["theoretical", "filesystem-adjusted", "observed", "estimated"].includes(input.classification)) {
    throw new StorageValidationError("Storage value has an invalid evidence classification.");
  }
  return deepFreeze({ ...input, label: input.label.trim(), unit: input.unit.trim() });
}

function validIdentifier(value: string) {
  return /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(value);
}

function validWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function createStorageCalculationResult<TValues>(input: Readonly<{
  calculator: Readonly<{ id: string; version: number }>;
  values: TValues | null;
  issues: readonly StorageIssue[];
  assumptions: readonly StorageAssumption[];
  derivation: readonly StorageDerivationStep[];
  sources: readonly StorageSource[];
  uncertainty: StorageUncertainty;
}>): StorageCalculationResult<TValues> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.calculator.id)) {
    throw new StorageValidationError("Calculator ID must be a lowercase, hyphen-separated identifier.");
  }
  if (!Number.isSafeInteger(input.calculator.version) || input.calculator.version < 1) {
    throw new StorageValidationError("Calculator version must be a positive safe integer.");
  }
  for (const issue of input.issues) {
    if (!validIdentifier(issue.code) || !issue.message.trim()
      || !["error", "warning", "notice"].includes(issue.severity)) {
      throw new StorageValidationError("Calculation contains invalid issue metadata.");
    }
  }
  for (const assumption of input.assumptions) {
    if (!validIdentifier(assumption.id) || !assumption.statement.trim()) {
      throw new StorageValidationError("Calculation contains invalid assumption metadata.");
    }
  }
  for (const step of input.derivation) {
    if (!validIdentifier(step.id) || !step.expression.trim() || !step.result.trim()) {
      throw new StorageValidationError("Calculation contains an invalid derivation step.");
    }
  }
  for (const source of input.sources) {
    if (!source.title.trim() || !validWebUrl(source.url) || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt)) {
      throw new StorageValidationError("Calculation contains invalid source metadata.");
    }
  }
  if (!input.uncertainty.statement.trim()
    || !["exact", "range", "modelled", "unknown"].includes(input.uncertainty.kind)) {
    throw new StorageValidationError("Calculation needs a valid uncertainty statement.");
  }

  const hasError = input.issues.some((issue) => issue.severity === "error");
  if (hasError && input.values !== null) {
    throw new StorageValidationError("Invalid calculations cannot expose result values.");
  }
  if (!hasError && input.values === null) {
    throw new StorageValidationError("A calculation without errors must expose result values.");
  }

  return deepFreeze({
    engineVersion: STORAGE_ENGINE_VERSION,
    calculator: { ...input.calculator },
    status: hasError ? "invalid" : "valid",
    values: input.values,
    issues: [...input.issues],
    assumptions: [...input.assumptions],
    derivation: [...input.derivation],
    sources: [...input.sources],
    uncertainty: { ...input.uncertainty },
  });
}
