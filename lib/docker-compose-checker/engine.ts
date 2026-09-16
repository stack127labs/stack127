import { parseYamlDocument, type SourceLocation } from "./parser.ts";
import type {
  Completeness,
  CopyReport,
  Counts,
  Diagnostic,
  DiagnosticLayer,
  EngineResult,
  NormalizedSummary,
  ParsedResult,
  Provenance,
} from "./types";

export const ENGINE_VERSION = "compose-checker-resolution-1" as const;
export const LIMITS = {
  composeBytes: 262_144,
  composeLines: 4_000,
  environmentBytes: 65_536,
  environmentLines: 2_000,
  services: 100,
  resources: 512,
  interpolationTokens: 512,
  diagnostics: 1_000,
} as const;

const PARSER_VERSION = "2.8.1";
const provenance: Provenance = {
  schemaVersion: 1,
  engineVersion: ENGINE_VERSION,
  composeSpecSnapshotDate: "2026-09-10",
  schemaSnapshotId: "compose-spec-2026-09-10-targeted",
  parser: "yaml",
  parserVersion: PARSER_VERSION,
};

const modelLayer: DiagnosticLayer = "Compose model";
const advisoryLayer: DiagnosticLayer = "Static advisories";
const initialInterpolationStates = () => ({
  known: 0,
  empty: 0,
  defaulted: 0,
  "required-present": 0,
  "required-missing": 0,
  unresolved: 0,
  escaped: 0,
});

function emptyCounts(): Counts {
  return {
    services: 0,
    publishedPorts: 0,
    namedVolumes: 0,
    networks: 0,
    secrets: 0,
    configs: 0,
    profiles: 0,
    interpolationTokens: 0,
    errors: 0,
    warnings: 0,
    advisories: 0,
  };
}

function locationFor(locations: Map<string, SourceLocation>, path: string | null): SourceLocation {
  return locations.get(path ?? "") ?? { line: null, column: null, excerpt: null };
}

function diagnostic(
  locations: Map<string, SourceLocation>,
  severity: Diagnostic["severity"],
  code: string,
  layer: DiagnosticLayer,
  path: string | null,
  message: string,
  fix: string,
  reason?: string,
): Diagnostic {
  return { severity, code, layer, path, ...locationFor(locations, path), message, fix, ...(reason ? { reason } : {}) };
}

function invalidLead(status: "input-invalid" | "syntax-invalid" | "model-invalid") {
  if (status === "input-invalid") return "Input needs attention" as const;
  if (status === "model-invalid") return "Compose model needs fixing" as const;
  return "YAML syntax needs fixing" as const;
}

function invalid(status: "input-invalid" | "syntax-invalid" | "model-invalid", findings: Diagnostic[]): EngineResult {
  return {
    status,
    lead: invalidLead(status),
    layers: null,
    counts: null,
    findings,
    summary: null,
    provenance,
    completeness: null,
  };
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

function physicalLineCount(value: string) {
  if (!value) return 0;
  return (value.match(/\r\n|\r|\n/g)?.length ?? 0) + 1;
}

function firstControl(value: string): number | null {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if ((code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) || code === 0x7f) return code;
  }
  return null;
}

function inputFinding(code: string, message: string, fix: string, line: number | null = null, input: "compose" | "environment" = "compose"): Diagnostic {
  return {
    severity: "Error",
    code,
    layer: "Input",
    path: null,
    line,
    column: line ? 1 : null,
    excerpt: null,
    message,
    fix,
    input,
  };
}

function parseEnvironment(source: string): { values: Record<string, string>; finding: Diagnostic | null } {
  const values: Record<string, string> = {};
  const lines = source.split(/\r\n|\r|\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index] ?? "";
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = raw.match(/^\s*([_A-Za-z][_A-Za-z0-9]*)\s*= ?(.*?)\s*$/);
    if (!match) {
      return { values, finding: inputFinding("INPUT-ENV-ASSIGNMENT", "This line is not a KEY=VALUE assignment.", "Use a valid environment name followed by = and a value.", index + 1, "environment") };
    }
    const key = match[1];
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      return { values, finding: inputFinding("INPUT-ENV-DUPLICATE", `The environment key ${key} is repeated.`, "Keep one assignment for this key.", index + 1, "environment") };
    }
    values[key] = match[2] ?? "";
  }
  return { values, finding: null };
}

function objectRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

const unresolvedInterpolationMarker = "__stack127_unresolved__";

function hasUnresolvedInterpolation(value: unknown): value is string {
  return typeof value === "string" && value.includes(unresolvedInterpolationMarker);
}

function containsUnresolvedInterpolation(value: unknown) {
  if (hasUnresolvedInterpolation(value)) return true;
  if (!value || typeof value !== "object") return false;
  return JSON.stringify(value).includes(unresolvedInterpolationMarker);
}

function pathValue(value: unknown, path: string): unknown {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let current = value as any;
  for (const part of parts) current = current?.[part];
  return current;
}

function findExpressionEnd(value: string, start: number): number {
  let depth = 1;
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === "{") depth += 1;
    if (value[index] === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

type InterpolationContext = {
  environment: Record<string, string>;
  locations: Map<string, SourceLocation>;
  findings: Diagnostic[];
  states: Record<string, number>;
  tokens: number;
};

function operatorFor(expression: string): { name: string; operator: string; fallback: string } {
  const match = expression.match(/^([_A-Za-z][_A-Za-z0-9]*)(?:(:?[-?+])(.*))?$/s);
  return { name: match?.[1] ?? expression, operator: match?.[2] ?? "", fallback: match?.[3] ?? "" };
}

function resolveExpression(expression: string, path: string, context: InterpolationContext, depth: number): { text: string; state: string } {
  if (depth > 8) {
    context.findings.push(diagnostic(context.locations, "Warning", "COMPOSE-INTERPOLATION-DEPTH", modelLayer, path, "This interpolation is nested beyond the checked depth.", "Reduce the interpolation nesting before checking the file again."));
    return { text: `__stack127_unresolved__${expression}__stack127_unresolved__`, state: "unresolved" };
  }
  const { name, operator, fallback } = operatorFor(expression);
  const hasValue = Object.prototype.hasOwnProperty.call(context.environment, name);
  const value = context.environment[name] ?? "";
  const isEmpty = hasValue && value === "";
  const fallbackValue = () => interpolateString(fallback, path, context, depth + 1).text;
  if (!operator) {
    if (!hasValue) return { text: `__stack127_unresolved__${expression}__stack127_unresolved__`, state: "unresolved" };
    return { text: value, state: isEmpty ? "empty" : "known" };
  }
  if (operator === "-" || operator === ":-") {
    if (!hasValue || (operator === ":-" && isEmpty)) return { text: fallbackValue(), state: "defaulted" };
    return { text: value, state: isEmpty ? "empty" : "known" };
  }
  if (operator === "?" || operator === ":?") {
    if (!hasValue || (operator === ":?" && isEmpty)) {
      context.findings.push(diagnostic(context.locations, "Error", "COMPOSE-INTERPOLATION-REQUIRED", modelLayer, path, fallback || `${name} is required for interpolation.`, "Provide this variable in the interpolation environment."));
      return { text: `__stack127_unresolved__${expression}__stack127_unresolved__`, state: "required-missing" };
    }
    return { text: value, state: "required-present" };
  }
  if (operator === "+" || operator === ":+") {
    if (hasValue && (operator === "+" || !isEmpty)) {
      context.findings.push(diagnostic(context.locations, "Info", "COMPOSE-INTERPOLATION-ALTERNATIVE", modelLayer, path, `The ${name} value selects an alternative interpolation value.`, "Keep the explicit environment value or remove the alternative expression."));
      return { text: fallbackValue(), state: "known" };
    }
    return { text: "", state: "empty" };
  }
  return { text: `__stack127_unresolved__${expression}__stack127_unresolved__`, state: "unresolved" };
}

function interpolateString(value: string, path: string, context: InterpolationContext, depth = 0): { text: string; textStates: string[] } {
  let output = "";
  const textStates: string[] = [];
  for (let index = 0; index < value.length;) {
    if (value[index] !== "$") {
      output += value[index++];
      continue;
    }
    if (value[index + 1] === "$") {
      context.tokens += 1;
      context.states.escaped += 1;
      output += "$";
      textStates.push("escaped");
      index += 2;
      continue;
    }
    if (value[index + 1] === "{") {
      const end = findExpressionEnd(value, index + 2);
      if (end < 0) {
        output += value[index++];
        continue;
      }
      const expression = value.slice(index + 2, end);
      context.tokens += 1;
      const resolved = resolveExpression(expression, path, context, depth);
      context.states[resolved.state] = (context.states[resolved.state] ?? 0) + 1;
      textStates.push(resolved.state);
      if (resolved.state === "defaulted") context.findings.push(diagnostic(context.locations, "Info", "COMPOSE-INTERPOLATION-DEFAULT", modelLayer, path, `The ${operatorFor(expression).name} variable uses its default value.`, "Provide the variable if the default is not intended."));
      if (resolved.state === "unresolved") context.findings.push(diagnostic(context.locations, "Warning", "COMPOSE-INTERPOLATION-UNRESOLVED", modelLayer, path, `The ${operatorFor(expression).name} variable is not available in the pasted environment.`, "Provide the variable or use an explicit Compose default."));
      output += resolved.text;
      index = end + 1;
      continue;
    }
    const short = value.slice(index + 1).match(/^([_A-Za-z][_A-Za-z0-9]*)/);
    if (short) {
      const expression = short[1];
      context.tokens += 1;
      const resolved = resolveExpression(expression, path, context, depth);
      context.states[resolved.state] = (context.states[resolved.state] ?? 0) + 1;
      textStates.push(resolved.state);
      if (resolved.state === "unresolved") context.findings.push(diagnostic(context.locations, "Warning", "COMPOSE-INTERPOLATION-UNRESOLVED", modelLayer, path, `The ${expression} variable is not available in the pasted environment.`, "Provide the variable or use an explicit Compose default."));
      output += resolved.text;
      index += expression.length + 1;
      continue;
    }
    output += value[index++];
  }
  return { text: output, textStates };
}

function walkValues(value: any, path: string, context: InterpolationContext): any {
  if (typeof value === "string") return interpolateString(value, path, context).text;
  if (Array.isArray(value)) return value.map((item, index) => walkValues(item, `${path}[${index}]`, context));
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) value[key] = walkValues(child, path ? `${path}.${key}` : key, context);
  }
  return value;
}

function hasPathLikeSource(value: string) {
  return value.startsWith("/") || value.startsWith("./") || value.startsWith("../") || value.startsWith("~") || value.startsWith(".");
}

function resourceSource(value: unknown): string | null {
  if (typeof value === "string") return value.split(":", 1)[0] || null;
  const object = objectRecord(value);
  return asString(object?.source) ?? asString(object?.target);
}

function addReferenceFindings(
  model: Record<string, any>,
  serviceName: string,
  service: Record<string, any>,
  key: "volumes" | "networks" | "secrets" | "configs",
  declarations: Record<string, any>,
  locations: Map<string, SourceLocation>,
  findings: Diagnostic[],
) {
  const entries = service[key];
  if (entries === undefined) return;
  if (key === "networks" && objectRecord(entries)) {
    for (const [networkName, config] of Object.entries(entries)) {
      if (hasUnresolvedInterpolation(networkName)) continue;
      const networkPath = `services.${serviceName}.networks.${networkName}`;
      if (config !== null && !objectRecord(config)) {
        findings.push(diagnostic(locations, "Error", "COMPOSE-NETWORK-CONFIG-TYPE", modelLayer, networkPath, "A service network mapping value must be null or a mapping.", "Use null or a network options mapping."));
        continue;
      }
      if (!Object.prototype.hasOwnProperty.call(declarations, networkName)) {
        findings.push(diagnostic(locations, "Error", "COMPOSE-NETWORK-MISSING", modelLayer, networkPath, `The named network ${networkName} is not declared in the pasted file.`, `Declare ${networkName} under the top-level networks.`));
      } else if (objectRecord(declarations[networkName])?.external === true) {
        findings.push(diagnostic(locations, "Info", "COMPOSE-EXTERNAL-UNKNOWN", modelLayer, networkPath, `The external network ${networkName} may exist outside this file.`, "Confirm the external resource with the real Compose project."));
      }
    }
    return;
  }
  if (!Array.isArray(entries)) {
    findings.push(diagnostic(locations, "Error", "COMPOSE-TYPE", modelLayer, `services.${serviceName}.${key}`, `${key} must be a list.`, `Use a list of ${key} declarations.`));
    return;
  }
  for (const [index, entry] of entries.entries()) {
    const source = resourceSource(entry);
    if (!source || hasUnresolvedInterpolation(source) || hasPathLikeSource(source)) continue;
    if (!Object.prototype.hasOwnProperty.call(declarations, source)) {
      findings.push(diagnostic(locations, "Error", `COMPOSE-${key.toUpperCase().replace(/S$/, "")}-MISSING`, modelLayer, `services.${serviceName}.${key}[${index}]`, `The named ${key.slice(0, -1)} ${source} is not declared in the pasted file.`, `Declare ${source} under the top-level ${key}.`));
    } else if (objectRecord(declarations[source])?.external === true) {
      findings.push(diagnostic(locations, "Info", "COMPOSE-EXTERNAL-UNKNOWN", modelLayer, `services.${serviceName}.${key}[${index}]`, `The external ${key.slice(0, -1)} ${source} may exist outside this file.`, "Confirm the external resource with the real Compose project."));
    }
  }
}

type PortRange = { start: number; end: number };
type PortTuple = { hostIp: string; published: PortRange | null; target: PortRange | null; protocol: string };

function parsePortRange(value: unknown): PortRange | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 1 && value <= 65_535 ? { start: value, end: value } : null;
  }
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(match[2] ?? match[1]);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > 65_535) return null;
  return { start, end };
}

function rangeSize(range: PortRange) {
  return range.end - range.start + 1;
}

function formatRange(range: PortRange) {
  return range.start === range.end ? String(range.start) : `${range.start}-${range.end}`;
}

function rangesOverlap(left: PortRange, right: PortRange) {
  return left.start <= right.end && right.start <= left.end;
}

function normalizedHostIp(hostIp: string) {
  return hostIp.trim().toLowerCase() || "*";
}

function isWildcardHostIp(hostIp: string) {
  return ["*", "0.0.0.0", "::"].includes(normalizedHostIp(hostIp));
}

function hostBindingsOverlap(left: string, right: string) {
  const leftHost = normalizedHostIp(left);
  const rightHost = normalizedHostIp(right);
  return isWildcardHostIp(leftHost) || isWildcardHostIp(rightHost) || leftHost === rightHost;
}

function parsePort(value: unknown): PortTuple | null {
  if (typeof value === "number") {
    const target = parsePortRange(value);
    return target ? { hostIp: "*", published: null, target, protocol: "tcp" } : null;
  }
  if (typeof value !== "string") {
    const object = objectRecord(value);
    if (!object || containsUnresolvedInterpolation(object)) return null;
    const target = parsePortRange(object.target);
    const published = object.published === undefined ? null : parsePortRange(object.published);
    const protocol = asString(object.protocol)?.toLowerCase() ?? "tcp";
    if (!target || (object.published !== undefined && !published) || !["tcp", "udp", "sctp"].includes(protocol)) return null;
    if (published && rangeSize(published) !== rangeSize(target)) return null;
    return { hostIp: normalizedHostIp(asString(object.host_ip) ?? "*"), published, target, protocol };
  }
  const slash = value.lastIndexOf("/");
  const withoutProtocol = slash >= 0 ? value.slice(0, slash) : value;
  const protocol = slash >= 0 ? value.slice(slash + 1).toLowerCase() : "tcp";
  if (!withoutProtocol || !["tcp", "udp", "sctp"].includes(protocol)) return null;
  let hostIp = "*";
  let pieces: string[];
  if (withoutProtocol.startsWith("[")) {
    const close = withoutProtocol.indexOf("]");
    if (close < 0 || !withoutProtocol.slice(close + 1).startsWith(":")) return null;
    hostIp = withoutProtocol.slice(1, close);
    pieces = withoutProtocol.slice(close + 2).split(":");
    if (pieces.length !== 2) return null;
  } else {
    pieces = withoutProtocol.split(":");
    if (pieces.length === 3) hostIp = pieces.shift() || "*";
    else if (pieces.length > 3) return null;
  }
  const published = pieces.length === 2 ? parsePortRange(pieces[0]) : null;
  const target = parsePortRange(pieces.length === 2 ? pieces[1] : pieces[0]);
  if (!target || (pieces.length === 2 && !published)) return null;
  if (published && rangeSize(published) !== rangeSize(target)) return null;
  return { hostIp: normalizedHostIp(hostIp), published, target, protocol };
}

function profileNames(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function environmentEntries(value: unknown): Array<[string, unknown]> {
  if (Array.isArray(value)) {
    const entries: Array<[string, unknown]> = [];
    for (const entry of value) {
      if (typeof entry !== "string") continue;
      const separator = entry.indexOf("=");
      if (separator < 0) entries.push([entry, null]);
      else entries.push([entry.slice(0, separator), entry.slice(separator + 1)]);
    }
    return entries;
  }
  return Object.entries(objectRecord(value) ?? {});
}

function isSecretLooking(key: string) {
  return /pass(word)?|token|secret|api[_-]?key/i.test(key);
}

function addAdvisories(serviceName: string, service: Record<string, any>, locations: Map<string, SourceLocation>, findings: Diagnostic[]) {
  const path = (key: string) => `services.${serviceName}.${key}`;
  if (service.privileged === true) findings.push(diagnostic(locations, "Advisory", "COMPOSE-PRIVILEGED", advisoryLayer, path("privileged"), "privileged enables broad container capabilities. This is a static review clue, not a configuration verdict.", "Review whether privileged mode is required."));
  if (service.pid === "host") findings.push(diagnostic(locations, "Advisory", "COMPOSE-HOST-PID", advisoryLayer, path("pid"), "The service shares the host PID namespace. This is a static review clue, not proof of process state.", "Review whether host PID access is required."));
  if (service.network_mode === "host") findings.push(diagnostic(locations, "Advisory", "COMPOSE-HOST-NETWORK", advisoryLayer, path("network_mode"), "The service uses the host network namespace. This is a static review clue, not proof of process state.", "Review whether host networking is required."));
  if (Array.isArray(service.cap_add)) {
    for (const [index, capability] of service.cap_add.entries()) {
      if (/SYS_ADMIN|NET_ADMIN|SYS_PTRACE/i.test(String(capability))) findings.push(diagnostic(locations, "Advisory", "COMPOSE-HIGH-IMPACT-CAPABILITY", advisoryLayer, `${path("cap_add")}[${index}]`, `The service adds the ${capability} capability. This is a static review clue, not a configuration verdict.`, "Review whether this capability is required."));
    }
  }
  if (typeof service.image === "string" && (service.image.endsWith(":latest") || !service.image.includes(":"))) findings.push(diagnostic(locations, "Advisory", "COMPOSE-IMAGE-TAG-FLOATING", advisoryLayer, path("image"), "The image reference does not pin a specific tag. This is a review clue, not proof about the image.", "Pin an intentional image tag or digest."));
  if (Array.isArray(service.ports)) {
    for (const [index, port] of service.ports.entries()) {
      if (containsUnresolvedInterpolation(port)) continue;
      const tuple = parsePort(port);
      if (tuple && tuple.published !== null && isWildcardHostIp(tuple.hostIp)) findings.push(diagnostic(locations, "Advisory", "COMPOSE-HOST-EXPOSURE", advisoryLayer, `${path("ports")}[${index}]`, "The published port has no explicit host address. This is a review clue, not proof that the port is reachable.", "Set an explicit host address when broad binding is not intended."));
    }
  }
  if (Array.isArray(service.volumes)) {
    for (const [index, volume] of service.volumes.entries()) {
      const source = resourceSource(volume);
      if (source === "/var/run/docker.sock") findings.push(diagnostic(locations, "Advisory", "COMPOSE-DOCKER-SOCKET", advisoryLayer, `${path("volumes")}[${index}]`, "The service mounts the Docker socket. This is a static review clue, not a configuration verdict.", "Review whether the Docker socket mount is required."));
      if (source === "/" || source === "/etc" || source === "/var/lib") findings.push(diagnostic(locations, "Advisory", "COMPOSE-BROAD-HOST-BIND", advisoryLayer, `${path("volumes")}[${index}]`, "The service mounts a broad host path. This is a static review clue, not a configuration verdict.", "Narrow the host path to the smallest required directory."));
    }
  }
  for (const [key, value] of environmentEntries(service.environment)) {
    if (isSecretLooking(key) && typeof value === "string" && value && !value.includes("$")) findings.push(diagnostic(locations, "Advisory", "COMPOSE-PLAINTEXT-SECRET", advisoryLayer, `${path("environment")}.${key}`, `The ${key} environment value is pasted as plain text. This is a static review clue, not a secret scan.`, "Use the Compose secret mechanisms or another deliberate secret source."));
  }
}

function addServiceTypeFinding(
  serviceName: string,
  field: string,
  code: string,
  message: string,
  fix: string,
  locations: Map<string, SourceLocation>,
  findings: Diagnostic[],
  suffix = "",
) {
  findings.push(diagnostic(locations, "Error", code, modelLayer, `services.${serviceName}.${field}${suffix}`, message, fix));
}

function validateKnownServiceTypes(serviceName: string, service: Record<string, any>, locations: Map<string, SourceLocation>, findings: Diagnostic[]) {
  if (service.image !== undefined && !hasUnresolvedInterpolation(service.image) && typeof service.image !== "string") {
    addServiceTypeFinding(serviceName, "image", "COMPOSE-IMAGE-TYPE", "image must be a string.", "Use an image reference such as nginx:1.27.", locations, findings);
  }
  if (service.build !== undefined && !containsUnresolvedInterpolation(service.build) && typeof service.build !== "string" && !objectRecord(service.build)) {
    addServiceTypeFinding(serviceName, "build", "COMPOSE-BUILD-TYPE", "build must be a path string or mapping.", "Use a build context path or a build options mapping.", locations, findings);
  }
  if (service.healthcheck !== undefined && !containsUnresolvedInterpolation(service.healthcheck) && !objectRecord(service.healthcheck)) {
    addServiceTypeFinding(serviceName, "healthcheck", "COMPOSE-HEALTHCHECK-TYPE", "healthcheck must be a mapping.", "Use a healthcheck mapping with test, interval, timeout, retries, or disable.", locations, findings);
  }
  if (service.environment !== undefined && !containsUnresolvedInterpolation(service.environment)) {
    if (!Array.isArray(service.environment) && !objectRecord(service.environment)) {
      addServiceTypeFinding(serviceName, "environment", "COMPOSE-ENVIRONMENT-TYPE", "environment must be a mapping or list.", "Use environment names and values in a mapping or KEY=VALUE entries in a list.", locations, findings);
    } else if (Array.isArray(service.environment)) {
      for (const [index, entry] of service.environment.entries()) {
        if (typeof entry !== "string" && !hasUnresolvedInterpolation(entry)) addServiceTypeFinding(serviceName, "environment", "COMPOSE-ENVIRONMENT-ENTRY-TYPE", "Each environment list entry must be a string.", "Use KEY or KEY=VALUE text for each environment entry.", locations, findings, `[${index}]`);
      }
    }
  }
  if (service.env_file !== undefined && !containsUnresolvedInterpolation(service.env_file)) {
    const entries = typeof service.env_file === "string" ? [service.env_file] : Array.isArray(service.env_file) ? service.env_file : null;
    if (!entries) {
      addServiceTypeFinding(serviceName, "env_file", "COMPOSE-ENV-FILE-TYPE", "env_file must be a path string or list.", "Use a path or a list of path strings and mappings.", locations, findings);
    } else {
      for (const [index, entry] of entries.entries()) {
        if (typeof entry === "string") continue;
        const mapping = objectRecord(entry);
        const entryPath = Array.isArray(service.env_file) ? `[${index}]` : "";
        if (!mapping) {
          addServiceTypeFinding(serviceName, "env_file", "COMPOSE-ENV-FILE-ENTRY-TYPE", "Each env_file entry must be a path string or mapping.", "Use a path or a mapping with path, required, and format.", locations, findings, entryPath);
          continue;
        }
        if (typeof mapping.path !== "string" || !mapping.path.trim()) {
          addServiceTypeFinding(serviceName, "env_file", "COMPOSE-ENV-FILE-PATH", "An env_file mapping needs a path string.", "Set path to the environment file.", locations, findings, `${entryPath}.path`);
        }
        if (mapping.required !== undefined && typeof mapping.required !== "boolean") {
          addServiceTypeFinding(serviceName, "env_file", "COMPOSE-ENV-FILE-REQUIRED", "env_file required must be a boolean.", "Use true or false for required.", locations, findings, `${entryPath}.required`);
        }
        if (mapping.format !== undefined && mapping.format !== "raw") {
          addServiceTypeFinding(serviceName, "env_file", "COMPOSE-ENV-FILE-FORMAT", "The supported env_file format is raw.", "Use raw or remove format.", locations, findings, `${entryPath}.format`);
        }
      }
    }
  }
  if (service.networks !== undefined && !containsUnresolvedInterpolation(service.networks)) {
    if (!Array.isArray(service.networks) && !objectRecord(service.networks)) {
      addServiceTypeFinding(serviceName, "networks", "COMPOSE-NETWORKS-TYPE", "networks must be a list or mapping.", "Use network names in a list or a mapping with per-network options.", locations, findings);
    } else if (Array.isArray(service.networks)) {
      for (const [index, entry] of service.networks.entries()) {
        if (typeof entry !== "string" && !hasUnresolvedInterpolation(entry)) addServiceTypeFinding(serviceName, "networks", "COMPOSE-NETWORK-ENTRY-TYPE", "Each network list entry must be a string.", "Use declared network names in the list.", locations, findings, `[${index}]`);
      }
    }
  }
  if (service.profiles !== undefined && !containsUnresolvedInterpolation(service.profiles) && (!Array.isArray(service.profiles) || service.profiles.some((entry: unknown) => typeof entry !== "string"))) {
    addServiceTypeFinding(serviceName, "profiles", "COMPOSE-PROFILE-TYPE", "profiles must be a list of names.", "Use non-empty profile names in a list.", locations, findings);
  }
  if (service.depends_on !== undefined && !containsUnresolvedInterpolation(service.depends_on) && Array.isArray(service.depends_on)) {
    for (const [index, entry] of service.depends_on.entries()) {
      if (typeof entry !== "string" && !hasUnresolvedInterpolation(entry)) addServiceTypeFinding(serviceName, "depends_on", "COMPOSE-DEPENDENCY-ENTRY-TYPE", "Each short-form dependency must be a service name.", "Use service names in the depends_on list.", locations, findings, `[${index}]`);
    }
  }
}

function healthcheckIsDisabled(service: Record<string, any>) {
  const healthcheck = objectRecord(service.healthcheck);
  if (!healthcheck) return false;
  if (healthcheck.disable === true) return true;
  return Array.isArray(healthcheck.test) && healthcheck.test[0] === "NONE";
}

function validateModel(model: Record<string, any>, locations: Map<string, SourceLocation>, findings: Diagnostic[], interpolation: InterpolationContext): NormalizedSummary {
  const services = objectRecord(model.services) ?? {};
  const topVolumes = objectRecord(model.volumes) ?? {};
  const topNetworks = objectRecord(model.networks) ?? {};
  const topSecrets = objectRecord(model.secrets) ?? {};
  const topConfigs = objectRecord(model.configs) ?? {};
  const incompleteReasons: string[] = [];
  const incomplete = Array.isArray(model.include) && model.include.length > 0;
  if (model.include !== undefined && !Array.isArray(model.include)) findings.push(diagnostic(locations, "Error", "COMPOSE-TYPE", modelLayer, "include", "include must be a list.", "Use a list of include entries."));
  if (incomplete) {
    for (const [index, entry] of model.include.entries()) {
      const text = typeof entry === "string" ? entry : JSON.stringify(entry);
      incompleteReasons.push(`include: ${text}`);
      findings.push(diagnostic(locations, "Warning", "COMPOSE-INCOMPLETE-MODEL", modelLayer, `include[${index}]`, "This included Compose file was not read or merged.", "Check the referenced file with the real Compose project.", "Referenced Compose files are outside this browser check."));
    }
  }
  const serviceNames = Object.keys(services);
  if (!objectRecord(model.services) || serviceNames.length === 0) findings.push(diagnostic(locations, "Error", "COMPOSE-SERVICES-MISSING", modelLayer, "services", "The Compose file needs at least one service mapping.", "Add a services mapping with one or more services."));
  const profiles = new Set<string>();
  let dependencyEdges = 0;
  const publishedPortKeys: string[] = [];
  const seenPorts: Array<{ hostIp: string; published: PortRange; protocol: string; path: string }> = [];

  const topKeys = new Set(["name", "services", "volumes", "networks", "secrets", "configs", "include", "version"]);
  for (const key of Object.keys(model)) {
    if (!topKeys.has(key) && !key.startsWith("x-")) findings.push(diagnostic(locations, "Warning", "COMPOSE-UNKNOWN-KEY", modelLayer, key, `The top-level key ${key} is outside the checked Compose field set.`, "Confirm this key with the current Compose Specification."));
  }
  if (Object.prototype.hasOwnProperty.call(model, "version")) findings.push(diagnostic(locations, "Warning", "COMPOSE-VERSION-OBSOLETE", modelLayer, "version", "The version key is accepted but does not select a legacy Compose schema.", "Remove version when older tooling no longer needs it."));

  if (model.services !== undefined && !objectRecord(model.services)) findings.push(diagnostic(locations, "Error", "COMPOSE-TYPE", modelLayer, "services", "services must be a mapping.", "Use service names as mapping keys under services."));
  for (const serviceName of serviceNames) {
    const service = objectRecord(services[serviceName]);
    const servicePath = `services.${serviceName}`;
    if (!service) {
      findings.push(diagnostic(locations, "Error", "COMPOSE-SERVICE-TYPE", modelLayer, servicePath, "A service must be a mapping.", "Use a mapping of service fields."));
      continue;
    }
    validateKnownServiceTypes(serviceName, service, locations, findings);
    const knownServiceKeys = new Set(["image", "build", "depends_on", "ports", "volumes", "networks", "secrets", "configs", "profiles", "healthcheck", "environment", "env_file", "privileged", "cap_add", "network_mode", "pid", "extends", "provider"]);
    for (const key of Object.keys(service)) if (!knownServiceKeys.has(key) && !key.startsWith("x-")) findings.push(diagnostic(locations, "Warning", "COMPOSE-SERVICE-UNKNOWN-KEY", modelLayer, `${servicePath}.${key}`, `The service key ${key} is outside the checked field set.`, "Confirm this service key with the current Compose Specification."));
    if (service.image === undefined && service.build === undefined && service.extends === undefined && service.provider === undefined) {
      findings.push(diagnostic(locations, "Error", "COMPOSE-SERVICE-IMAGE-MISSING", modelLayer, servicePath, "This service has no image or build declaration.", "Add image or build so Compose can create the service container."));
    }
    const serviceProfiles = profileNames(service.profiles);
    if (service.profiles !== undefined && !Array.isArray(service.profiles)) findings.push(diagnostic(locations, "Error", "COMPOSE-PROFILE-TYPE", modelLayer, `${servicePath}.profiles`, "profiles must be a list of names.", "Use non-empty profile names in a list."));
    for (const [index, profile] of serviceProfiles.entries()) {
      if (!profile) findings.push(diagnostic(locations, "Error", "COMPOSE-PROFILE-EMPTY", modelLayer, `${servicePath}.profiles[${index}]`, "A profile name cannot be empty.", "Remove the empty profile entry."));
      if (serviceProfiles.indexOf(profile) !== index) findings.push(diagnostic(locations, "Error", "COMPOSE-PROFILE-DUPLICATE", modelLayer, `${servicePath}.profiles[${index}]`, `The profile ${profile} is repeated for this service.`, "Keep each profile name once."));
      profiles.add(profile);
    }
    if (service.depends_on !== undefined) {
      const depends = Array.isArray(service.depends_on)
        ? service.depends_on.map((name: unknown) => [String(name), null] as const)
        : Object.entries(objectRecord(service.depends_on) ?? {});
      if (!Array.isArray(service.depends_on) && !objectRecord(service.depends_on)) findings.push(diagnostic(locations, "Error", "COMPOSE-DEPENDENCY-TYPE", modelLayer, `${servicePath}.depends_on`, "depends_on must be a list or mapping.", "Use service names in the short or long depends_on form."));
      for (const [index, [dependency, config]] of depends.entries()) {
        dependencyEdges += 1;
        const dependencyPath = Array.isArray(service.depends_on) ? `${servicePath}.depends_on[${index}]` : `${servicePath}.depends_on.${dependency}`;
        const dependencyUnknown = hasUnresolvedInterpolation(dependency);
        if (!dependencyUnknown && !Object.prototype.hasOwnProperty.call(services, dependency)) {
          const canBeExternal = incompleteReasons.length > 0 || service.extends !== undefined;
          findings.push(diagnostic(locations, canBeExternal ? "Warning" : "Error", "COMPOSE-DEPENDENCY-MISSING", modelLayer, dependencyPath, `The dependency ${dependency} is not present in the pasted services mapping.`, canBeExternal ? "Check the referenced Compose files with the real project." : "Add the service or remove this dependency.", canBeExternal ? "The missing service may come from an unread Compose file." : undefined));
        }
        const configObject = objectRecord(config);
        if (configObject) {
          const condition = configObject.condition;
          if (condition !== undefined && !["service_started", "service_healthy", "service_completed_successfully"].includes(condition)) findings.push(diagnostic(locations, "Error", "COMPOSE-DEPENDENCY-CONDITION", modelLayer, `${dependencyPath}.condition`, "This depends_on condition is not supported by the Compose Specification.", "Use service_started, service_healthy, or service_completed_successfully."));
          const targetService = dependencyUnknown ? null : objectRecord(services[dependency]);
          if (condition === "service_healthy" && targetService && healthcheckIsDisabled(targetService)) findings.push(diagnostic(locations, "Error", "COMPOSE-HEALTHCHECK-DISABLED", modelLayer, `${dependencyPath}.condition`, "service_healthy targets a service with a disabled healthcheck.", "Enable the healthcheck or use another dependency condition."));
          else if (condition === "service_healthy" && targetService && targetService.healthcheck === undefined) findings.push(diagnostic(locations, "Warning", "COMPOSE-HEALTHCHECK-UNVERIFIED", modelLayer, `${dependencyPath}.condition`, "No Compose healthcheck is declared for this dependency.", "Confirm that its image defines a healthcheck, or declare one here.", "The image may define a Dockerfile healthcheck that this static check cannot inspect."));
          if (configObject.required !== undefined && typeof configObject.required !== "boolean") findings.push(diagnostic(locations, "Error", "COMPOSE-DEPENDENCY-REQUIRED", modelLayer, `${dependencyPath}.required`, "depends_on required must be a boolean.", "Use true or false for required."));
          if (configObject.restart !== undefined && typeof configObject.restart !== "boolean") findings.push(diagnostic(locations, "Error", "COMPOSE-DEPENDENCY-RESTART", modelLayer, `${dependencyPath}.restart`, "depends_on restart must be a boolean.", "Use true or false for restart."));
        }
        const targetProfiles = dependencyUnknown ? [] : profileNames(services[dependency]?.profiles);
        if (!dependencyUnknown && targetProfiles.length > 0 && serviceProfiles.length > 0 && !serviceProfiles.some((profile) => targetProfiles.includes(profile))) findings.push(diagnostic(locations, "Warning", "COMPOSE-PROFILE-DEPENDENCY", modelLayer, dependencyPath, "This dependency crosses profile boundaries, but no active profile set was supplied.", "Review the profile selection before running the real Compose project."));
      }
    }
    if (service.ports !== undefined) {
      if (!Array.isArray(service.ports)) findings.push(diagnostic(locations, "Error", "COMPOSE-PORTS-TYPE", modelLayer, `${servicePath}.ports`, "ports must be a list.", "Use short or long port declarations in a list."));
      else for (const [index, port] of service.ports.entries()) {
        if (containsUnresolvedInterpolation(port)) continue;
        const tuple = parsePort(port);
        const portPath = `${servicePath}.ports[${index}]`;
        if (!tuple || !tuple.target) {
          findings.push(diagnostic(locations, "Error", "COMPOSE-PORT-INVALID", modelLayer, portPath, "This port declaration is malformed or outside the 1 to 65535 range.", "Use valid published and target port numbers."));
          continue;
        }
        if (tuple.published === null) continue;
        const key = `${tuple.hostIp}:${formatRange(tuple.published)}/${tuple.protocol}`;
        publishedPortKeys.push(key);
        for (const existing of seenPorts) {
          const sameBinding = existing.protocol === tuple.protocol && rangesOverlap(existing.published, tuple.published) && hostBindingsOverlap(existing.hostIp, tuple.hostIp);
          if (sameBinding) findings.push(diagnostic(locations, "Error", "COMPOSE-PORT-COLLISION", modelLayer, portPath, `This published host-port overlaps ${existing.path} for the same protocol.`, "Use a different published port, address, or protocol."));
        }
        seenPorts.push({ hostIp: tuple.hostIp, published: tuple.published, protocol: tuple.protocol, path: portPath });
      }
    }
    addReferenceFindings(model, serviceName, service, "volumes", topVolumes, locations, findings);
    addReferenceFindings(model, serviceName, service, "networks", topNetworks, locations, findings);
    addReferenceFindings(model, serviceName, service, "secrets", topSecrets, locations, findings);
    addReferenceFindings(model, serviceName, service, "configs", topConfigs, locations, findings);
    if (service.env_file !== undefined) findings.push(diagnostic(locations, "Info", "COMPOSE-ENV-FILE-NOT-READ", modelLayer, `${servicePath}.env_file`, "This service env_file is not read and does not provide interpolation values here.", "Paste only interpolation values into the separate environment field."));
    if (service.extends !== undefined) {
      const extendsObject = objectRecord(service.extends);
      const reference = typeof service.extends === "string" ? service.extends : JSON.stringify(service.extends);
      incompleteReasons.push(`extends: ${serviceName} ${reference}`);
      findings.push(diagnostic(locations, "Warning", "COMPOSE-INCOMPLETE-MODEL", modelLayer, `${servicePath}.extends`, "This service extends a declaration that was not read or merged.", "Check the referenced service with the real Compose project.", "Referenced Compose files are outside this browser check."));
      if (extendsObject?.file === undefined && extendsObject?.service === undefined) findings.push(diagnostic(locations, "Error", "COMPOSE-EXTENDS-TYPE", modelLayer, `${servicePath}.extends`, "extends needs a service and optional file reference.", "Provide a valid extends mapping."));
    }
    addAdvisories(serviceName, service, locations, findings);
  }
  const summary: NormalizedSummary = {
    services: serviceNames,
    resources: { volumes: Object.keys(topVolumes), networks: Object.keys(topNetworks), secrets: Object.keys(topSecrets), configs: Object.keys(topConfigs) },
    profiles: [...profiles].filter(Boolean),
    publishedPortKeys,
    dependencyEdges,
    interpolationStates: interpolation.states,
    completeness: { status: incompleteReasons.length ? "incomplete" : "complete", reasons: incompleteReasons },
    incompleteReasons,
  };
  return summary;
}

function layerStatus(findings: Diagnostic[], layer: DiagnosticLayer, incomplete: boolean): ParsedResult["layers"][number]["status"] {
  const layerFindings = findings.filter((item) => item.layer === layer);
  if (layer === "YAML syntax") return "Pass";
  if (layer === "Static advisories") return layerFindings.length ? "Advisory" : "Pass";
  if (layerFindings.some((item) => item.severity === "Error")) return "Error";
  if (incomplete) return "Partial";
  if (layerFindings.some((item) => item.severity === "Warning")) return "Warning";
  return "Pass";
}

function sortFindings(findings: Diagnostic[]) {
  const rank = (item: Diagnostic) => item.layer === "YAML syntax" ? 0 : item.severity === "Error" ? 1 : item.severity === "Warning" ? 2 : item.severity === "Advisory" ? 3 : 4;
  return findings.slice().sort((left, right) => rank(left) - rank(right) || (left.line ?? Number.MAX_SAFE_INTEGER) - (right.line ?? Number.MAX_SAFE_INTEGER) || (left.column ?? Number.MAX_SAFE_INTEGER) - (right.column ?? Number.MAX_SAFE_INTEGER) || left.code.localeCompare(right.code));
}

function finishParsed(findings: Diagnostic[], summary: NormalizedSummary): ParsedResult {
  const ordered = sortFindings(findings);
  const counts = emptyCounts();
  counts.services = summary.services.length;
  counts.publishedPorts = summary.publishedPortKeys.length;
  counts.namedVolumes = summary.resources.volumes.length;
  counts.networks = summary.resources.networks.length;
  counts.secrets = summary.resources.secrets.length;
  counts.configs = summary.resources.configs.length;
  counts.profiles = summary.profiles.length;
  counts.interpolationTokens = Object.values(summary.interpolationStates).reduce((total, value) => total + value, 0);
  for (const item of ordered) {
    if (item.severity === "Error") counts.errors += 1;
    if (item.severity === "Warning") counts.warnings += 1;
    if (item.severity === "Advisory") counts.advisories += 1;
  }
  const incomplete = summary.completeness.status === "incomplete";
  const modelErrors = ordered.some((item) => item.layer === modelLayer && item.severity === "Error");
  const lead = incomplete ? "Cannot fully resolve this file" : modelErrors ? "Compose model has blocking issues" : "No blocking static issues found";
  return {
    status: "parsed",
    lead,
    layers: [
      { name: "YAML syntax", status: "Pass" },
      { name: "Compose model", status: layerStatus(ordered, modelLayer, incomplete) },
      { name: "Static advisories", status: layerStatus(ordered, advisoryLayer, incomplete) },
    ],
    counts,
    findings: ordered,
    summary,
    provenance,
    completeness: summary.completeness,
  };
}

export function checkCompose(input: string, environmentInput: string): EngineResult {
  const compose = input.startsWith("\uFEFF") ? input.slice(1) : input;
  const composeControl = firstControl(compose);
  if (!compose) return invalid("input-invalid", [inputFinding("INPUT-COMPOSE-EMPTY", "Paste a Compose file before checking.", "Paste one Compose YAML document, then check it again.")]);
  if (composeControl !== null) return invalid("input-invalid", [inputFinding("INPUT-CONTROL-CHARACTER", `The Compose input contains a disallowed control character (U+${composeControl.toString(16).padStart(4, "0")}).`, "Remove the control character, then check the file again.")]);
  if (byteLength(compose) > LIMITS.composeBytes) return invalid("input-invalid", [inputFinding("INPUT-COMPOSE-BYTES", "The Compose input is larger than 256 KiB.", "Paste a smaller Compose document.")]);
  if (physicalLineCount(compose) > LIMITS.composeLines) return invalid("input-invalid", [inputFinding("INPUT-COMPOSE-LINES", "The Compose input has more than 4,000 physical lines.", "Paste a smaller Compose document.")]);
  if (firstControl(environmentInput) !== null) return invalid("input-invalid", [inputFinding("INPUT-ENV-CONTROL-CHARACTER", "The interpolation environment contains a disallowed control character.", "Remove the control character from the environment input.", null, "environment")]);
  if (byteLength(environmentInput) > LIMITS.environmentBytes) return invalid("input-invalid", [inputFinding("INPUT-ENV-BYTES", "The interpolation environment is larger than 64 KiB.", "Paste fewer environment assignments.", null, "environment")]);
  if (physicalLineCount(environmentInput) > LIMITS.environmentLines) return invalid("input-invalid", [inputFinding("INPUT-ENV-LINES", "The interpolation environment has more than 2,000 lines.", "Paste fewer environment assignments.", null, "environment")]);
  const environment = parseEnvironment(environmentInput);
  if (environment.finding) return invalid("input-invalid", [environment.finding]);
  const parsed = parseYamlDocument(compose);
  if (!parsed.parsed) return invalid("syntax-invalid", sortFindings(parsed.diagnostics));
  const rawModel = parsed.parsed.value;
  if (!objectRecord(rawModel)) return invalid("model-invalid", [diagnostic(parsed.parsed.locations, "Error", "COMPOSE-ROOT-MAPPING", modelLayer, null, "The Compose document root must be a mapping.", "Use top-level Compose keys in a mapping.")]);
  const model = structuredClone(rawModel) as Record<string, any>;
  const interpolation: InterpolationContext = { environment: environment.values, locations: parsed.parsed.locations, findings: [], states: initialInterpolationStates(), tokens: 0 };
  walkValues(model, "", interpolation);
  const serviceCount = Object.keys(objectRecord(model.services) ?? {}).length;
  const resourceCount = ["volumes", "networks", "secrets", "configs"].reduce((total, key) => total + Object.keys(objectRecord(model[key]) ?? {}).length, 0);
  if (serviceCount > LIMITS.services) return invalid("input-invalid", [inputFinding("INPUT-SERVICES-LIMIT", "The Compose input contains more than 100 services.", "Paste a smaller Compose document.")]);
  if (resourceCount > LIMITS.resources) return invalid("input-invalid", [inputFinding("INPUT-RESOURCES-LIMIT", "The Compose input contains more than 512 declared resources.", "Paste a smaller Compose document.")]);
  if (interpolation.tokens > LIMITS.interpolationTokens) return invalid("input-invalid", [inputFinding("INPUT-INTERPOLATION-LIMIT", "The Compose input contains more than 512 interpolation tokens.", "Paste a smaller Compose document or fewer tokens.")]);
  const findings: Diagnostic[] = [...interpolation.findings];
  const summary = validateModel(model, parsed.parsed.locations, findings, interpolation);
  if (findings.length > LIMITS.diagnostics) return invalid("input-invalid", [inputFinding("INPUT-DIAGNOSTIC-LIMIT", "The check produced more than 1,000 diagnostics.", "Reduce the document before checking it again.")]);
  return finishParsed(findings, summary);
}

export function buildCopyReport(result: ParsedResult): string {
  const payload: CopyReport = {
    schemaVersion: 1,
    engineVersion: result.provenance.engineVersion,
    counts: result.counts,
    completeness: result.completeness,
    summary: result.summary,
    diagnostics: result.findings,
  };
  return JSON.stringify(payload, null, 2);
}
