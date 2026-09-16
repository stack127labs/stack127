export type DiagnosticSeverity = "Error" | "Warning" | "Advisory" | "Info";
export type DiagnosticLayer = "Input" | "YAML syntax" | "Compose model" | "Static advisories";

export type Diagnostic = {
  severity: DiagnosticSeverity;
  code: string;
  layer: DiagnosticLayer;
  path: string | null;
  line: number | null;
  column: number | null;
  excerpt: string | null;
  message: string;
  fix: string;
  input?: "compose" | "environment";
  reason?: string;
};

export type LayerStatus = "Pass" | "Error" | "Warning" | "Advisory" | "Partial";

export type Counts = {
  services: number;
  publishedPorts: number;
  namedVolumes: number;
  networks: number;
  secrets: number;
  configs: number;
  profiles: number;
  interpolationTokens: number;
  errors: number;
  warnings: number;
  advisories: number;
};

export type Completeness = {
  status: "complete" | "incomplete";
  reasons: string[];
};

export type NormalizedSummary = {
  services: string[];
  resources: {
    volumes: string[];
    networks: string[];
    secrets: string[];
    configs: string[];
  };
  profiles: string[];
  publishedPortKeys: string[];
  dependencyEdges: number;
  interpolationStates: Record<string, number>;
  completeness: Completeness;
  incompleteReasons: string[];
};

export type Provenance = {
  schemaVersion: 1;
  engineVersion: "compose-checker-resolution-1";
  composeSpecSnapshotDate: "2026-09-10";
  schemaSnapshotId: "compose-spec-2026-09-10-targeted";
  parser: "yaml";
  parserVersion: string;
};

export type ParsedResult = {
  status: "parsed";
  lead: "Cannot fully resolve this file" | "Compose model has blocking issues" | "No blocking static issues found";
  layers: Array<{ name: DiagnosticLayer; status: LayerStatus }>;
  counts: Counts;
  findings: Diagnostic[];
  summary: NormalizedSummary;
  provenance: Provenance;
  completeness: Completeness;
};

type InvalidResultBase = {
  lead: "Input needs attention" | "YAML syntax needs fixing" | "Compose model needs fixing";
  layers: null;
  counts: null;
  findings: Diagnostic[];
  summary: null;
  provenance: Provenance;
  completeness: null;
};

export type InputInvalidResult = InvalidResultBase & { status: "input-invalid" };
export type SyntaxInvalidResult = InvalidResultBase & { status: "syntax-invalid" };
export type ModelInvalidResult = InvalidResultBase & { status: "model-invalid" };
export type EngineResult = ParsedResult | InputInvalidResult | SyntaxInvalidResult | ModelInvalidResult;

export type CopyReport = {
  schemaVersion: 1;
  engineVersion: string;
  counts: Counts;
  completeness: Completeness;
  summary: NormalizedSummary;
  diagnostics: Diagnostic[];
};
