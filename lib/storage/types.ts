export const STORAGE_ENGINE_VERSION = 1 as const;
export const STORAGE_STATE_SCHEMA = "stack127-storage-state" as const;
export const STORAGE_STATE_SCHEMA_VERSION = 1 as const;
export const MAX_STORAGE_DRIVES = 1_024 as const;
export const MAX_DRIVE_CAPACITY_BYTES = 1_000_000_000_000_000_000_000_000n;
export const MAX_STORAGE_STATE_JSON_BYTES = 65_536 as const;

export const storageDriveRoles = [
  "data",
  "parity",
  "spare",
  "slog",
  "l2arc",
  "special",
  "cache",
  "metadata",
  "journal",
  "other",
] as const;

export type StorageDriveRole = (typeof storageDriveRoles)[number];

export type StorageDrive = Readonly<{
  id: string;
  capacityBytes: bigint;
  role: StorageDriveRole;
  label?: string;
  path?: string;
  groupId?: string;
  model?: string;
  costMinorUnits?: bigint;
  powerWatts?: number;
}>;

export type StorageIssueSeverity = "error" | "warning" | "notice";

export type StorageIssue = Readonly<{
  code: string;
  severity: StorageIssueSeverity;
  message: string;
  path?: string;
}>;

export type StorageAssumption = Readonly<{
  id: string;
  statement: string;
}>;

export type StorageDerivationStep = Readonly<{
  id: string;
  expression: string;
  result: string;
}>;

export type StorageSource = Readonly<{
  title: string;
  url: string;
  checkedAt: string;
  version?: string;
}>;

export type StorageUncertainty = Readonly<{
  kind: "exact" | "range" | "modelled" | "unknown";
  statement: string;
}>;

export type StorageValueClassification =
  | "theoretical"
  | "filesystem-adjusted"
  | "observed"
  | "estimated";

export type StorageValue<T> = Readonly<{
  label: string;
  value: T;
  unit: string;
  classification: StorageValueClassification;
  explanation?: string;
}>;

export type StorageCalculationResult<TValues> = Readonly<{
  engineVersion: typeof STORAGE_ENGINE_VERSION;
  calculator: Readonly<{
    id: string;
    version: number;
  }>;
  status: "valid" | "invalid";
  values: TValues | null;
  issues: readonly StorageIssue[];
  assumptions: readonly StorageAssumption[];
  derivation: readonly StorageDerivationStep[];
  sources: readonly StorageSource[];
  uncertainty: StorageUncertainty;
}>;

export type StorageStateEnvelope<TPayload = unknown> = Readonly<{
  schema: typeof STORAGE_STATE_SCHEMA;
  schemaVersion: typeof STORAGE_STATE_SCHEMA_VERSION;
  engineVersion: number;
  calculatorId: string;
  calculatorVersion: number;
  inputVersion: number;
  payload: TPayload;
}>;

export type StorageCalculatorAdapter<TInput, TValues> = Readonly<{
  calculatorId: string;
  calculationVersion: number;
  inputVersion: number;
  validateInput: (input: unknown) => input is TInput;
  calculate: (input: TInput) => StorageCalculationResult<TValues>;
}>;

export type StorageCalculatorRegistry = Readonly<{
  register: <TInput, TValues>(adapter: StorageCalculatorAdapter<TInput, TValues>) => void;
  latest: (calculatorId: string) => StorageCalculatorAdapter<unknown, unknown>;
  encode: (calculatorId: string, input: unknown, calculationVersion?: number) => string;
  run: (calculatorId: string, calculationVersion: number, input: unknown) => StorageCalculationResult<unknown>;
  runEncoded: (encodedState: string) => StorageCalculationResult<unknown>;
}>;

export class StorageValidationError extends Error {
  readonly issues: readonly StorageIssue[];

  constructor(message: string, issues: readonly StorageIssue[] = []) {
    super(message);
    this.name = "StorageValidationError";
    this.issues = issues;
  }
}

export class StorageStateError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "StorageStateError";
    this.code = code;
  }
}
