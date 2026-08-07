export const MAX_INPUT_BYTES = 65_536;
export const MAX_RULE_LINES = 200;
export const MAX_PATH_LINES = 500;
export const MAX_LINE_CODE_POINTS = 1_024;
export const MAX_PATH_SEGMENTS = 64;

export type DockerignoreField = "rules" | "paths";

export type DockerignoreIssue = {
  status: "invalid";
  field: DockerignoreField;
  message: string;
  sourceLine: number | null;
};

export type ParsedRuleLine = {
  sourceLine: number;
  raw: string;
  normalized: string;
  active: boolean;
  reason: "blank" | "comment" | "historical-dot" | null;
  exclusion: boolean;
  pattern: string;
};

export type ParsedPath = {
  sourceLine: number;
  raw: string;
  normalized: string;
};

const encoder = new TextEncoder();
const controlCharacter = /[\u0000-\u001f\u007f]/u;

function invalid(field: DockerignoreField, message: string, sourceLine: number | null = null): DockerignoreIssue {
  return { status: "invalid", field, message, sourceLine };
}

function physicalLines(value: string) {
  return value.replace(/\r\n/gu, "\n").split("\n");
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

function cleanSlashPath(value: string) {
  const absolute = value.startsWith("/");
  const output: string[] = [];
  for (const segment of value.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (output.length > 0 && output.at(-1) !== "..") output.pop();
      else if (!absolute) output.push("..");
      continue;
    }
    output.push(segment);
  }
  const joined = output.join("/");
  if (absolute) return joined ? `/${joined}` : "/";
  return joined || ".";
}

export function parseIgnoreRules(value: string):
  | { status: "valid"; lines: ParsedRuleLine[]; activeRules: ParsedRuleLine[] }
  | DockerignoreIssue {
  if (encoder.encode(value).byteLength > MAX_INPUT_BYTES) {
    return invalid("rules", "Rules exceed 64 KiB.");
  }
  const lines = physicalLines(value);
  if (lines.length > MAX_RULE_LINES) {
    return invalid("rules", "Use at most 200 rule lines.");
  }

  const parsed: ParsedRuleLine[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const sourceLine = index + 1;
    const raw = index === 0 ? lines[index].replace(/^\uFEFF/u, "") : lines[index];
    if (codePointLength(raw) > MAX_LINE_CODE_POINTS) {
      return invalid("rules", `Rule line ${sourceLine} exceeds 1,024 characters.`, sourceLine);
    }
    if (raw.startsWith("#")) {
      parsed.push({ sourceLine, raw, normalized: "", active: false, reason: "comment", exclusion: false, pattern: "" });
      continue;
    }
    let normalized = raw.trim();
    if (!normalized) {
      parsed.push({ sourceLine, raw, normalized: "", active: false, reason: "blank", exclusion: false, pattern: "" });
      continue;
    }
    const exclusion = normalized.startsWith("!");
    if (exclusion) normalized = normalized.slice(1).trim();
    if (normalized) {
      normalized = cleanSlashPath(normalized);
      if (normalized.length > 1 && normalized.startsWith("/")) normalized = normalized.slice(1);
    }
    if (exclusion) normalized = `!${normalized}`;
    const pattern = exclusion ? normalized.slice(1) : normalized;
    const historicalDot = !exclusion && pattern === ".";
    parsed.push({
      sourceLine,
      raw,
      normalized,
      active: !historicalDot,
      reason: historicalDot ? "historical-dot" : null,
      exclusion,
      pattern,
    });
  }
  return { status: "valid", lines: parsed, activeRules: parsed.filter((line) => line.active) };
}

export function parseProbePaths(value: string):
  | { status: "valid"; paths: ParsedPath[] }
  | DockerignoreIssue {
  if (encoder.encode(value).byteLength > MAX_INPUT_BYTES) {
    return invalid("paths", "Paths exceed 64 KiB.");
  }
  const lines = physicalLines(value);
  const paths: ParsedPath[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const sourceLine = index + 1;
    const raw = lines[index];
    if (codePointLength(raw) > MAX_LINE_CODE_POINTS) {
      return invalid("paths", `Path line ${sourceLine} exceeds 1,024 characters.`, sourceLine);
    }
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (controlCharacter.test(raw)) {
      return invalid("paths", `Path line ${sourceLine} contains a control character.`, sourceLine);
    }

    let candidate = trimmed.replace(/\\/gu, "/");
    while (candidate.startsWith("./")) candidate = candidate.slice(2);
    if (candidate.startsWith("/")) candidate = candidate.slice(1);
    const segments: string[] = [];
    let escaped = false;
    for (const segment of candidate.split("/")) {
      if (!segment || segment === ".") continue;
      if (segment === "..") {
        if (segments.length === 0) {
          escaped = true;
          break;
        }
        segments.pop();
      } else {
        segments.push(segment);
      }
    }
    if (escaped) return invalid("paths", `Path line ${sourceLine} escapes the context.`, sourceLine);
    if (segments.length === 0) return invalid("paths", `Path line ${sourceLine} must name a context path.`, sourceLine);
    if (segments.length > MAX_PATH_SEGMENTS) {
      return invalid("paths", `Path line ${sourceLine} exceeds 64 segments.`, sourceLine);
    }
    paths.push({ sourceLine, raw, normalized: segments.join("/") });
    if (paths.length > MAX_PATH_LINES) return invalid("paths", "Use at most 500 path lines.");
  }
  if (paths.length === 0) return invalid("paths", "Add at least one path.");
  return { status: "valid", paths };
}
