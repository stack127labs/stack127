export type RsyncAction = "include" | "exclude";
export type RsyncDefault = "include" | "exclude";

export type RsyncInput = Readonly<{
  rules: string;
  paths: string;
  unmatched: RsyncDefault;
}>;

export type RsyncRule = Readonly<{
  line: number;
  action: RsyncAction;
  pattern: string;
}>;

type CompiledRule = RsyncRule & Readonly<{
  directoryOnly: boolean;
  literal: string | null;
  matchesFullPath: boolean;
  regex: RegExp;
}>;

export type RsyncRow = Readonly<{
  path: string;
  state: "included" | "excluded" | "unvisited";
  matchingRule: { line: number; action: RsyncAction; pattern: string } | null;
  note: string;
}>;

export type RsyncValues = Readonly<{
  rows: RsyncRow[];
  includedCount: number;
  excludedCount: number;
  unvisitedCount: number;
  rules: RsyncRule[];
  resolutionVersion: "rsync-filter-v1";
}>;

export type RsyncResult = Readonly<{
  status: "valid" | "invalid";
  values: RsyncValues | null;
  issues: string[];
}>;

export const DEFAULT_RSYNC_INPUT: RsyncInput = {
  rules: "- .git/\n- *.tmp\n+ .env.example\n+ **/*.conf",
  paths: ".git/\n.git/config\n.env.example\nlogs/app.tmp\netc/app.conf\nreadme.md",
  unmatched: "include",
};

function objectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePath(value: string) {
  const trimmed = value.trim();
  const directory = trimmed.endsWith("/");
  const withoutPrefix = trimmed.replace(/^\.\//, "");
  return { path: directory ? withoutPrefix.replace(/\/+$/g, "/") : withoutPrefix.replace(/\/+$/g, ""), directory };
}

function parseRules(source: string): { rules: CompiledRule[]; issues: string[] } {
  const issues: string[] = [];
  const rules: CompiledRule[] = [];
  const lines = source.split(/\r?\n/);
  if (lines.filter((line) => line.trim() && !line.trim().startsWith("#")).length > 1000) {
    issues.push("Use 1000 filter rules or fewer.");
  }
  lines.forEach((line, index) => {
    const raw = line.trim();
    if (!raw || raw.startsWith("#")) return;
    if (raw === "!") {
      rules.length = 0;
      return;
    }
    const prefix = raw[0];
    if (prefix !== "+" && prefix !== "-") {
      issues.push(`Rule ${index + 1} needs +, -, or !.`);
      return;
    }
    if (/^[+-][A-Za-z,]+\s+/.test(raw)) {
      issues.push(`Rule ${index + 1} modifiers are not supported.`);
      return;
    }
    const pattern = raw.slice(1).trim();
    if (!pattern) {
      issues.push(`Rule ${index + 1} needs a pattern.`);
      return;
    }
    if (pattern.includes("[") || pattern.includes("]")) {
      issues.push(`Rule ${index + 1} character classes are not supported.`);
      return;
    }
    const compiled = compilePattern(pattern);
    if (!compiled) {
      issues.push(`Rule ${index + 1} pattern is not supported.`);
      return;
    }
    rules.push({
      line: index + 1,
      action: prefix === "+" ? "include" : "exclude",
      pattern,
      ...compiled,
    });
  });
  if (!rules.length) issues.push("Add at least one filter rule.");
  return { rules, issues };
}

function compilePattern(source: string): { directoryOnly: boolean; literal: string | null; matchesFullPath: boolean; regex: RegExp } | null {
  let pattern = source.trim();
  const anchored = pattern.startsWith("/");
  const directoryOnly = pattern.endsWith("/");
  pattern = pattern.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!pattern) return null;
  let output = "";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === "*" && pattern[index + 1] === "*") {
      index += 1;
      if (pattern[index + 1] === "/") {
        index += 1;
        output += "(?:.*/)?";
      } else output += ".*";
    } else if (char === "*") output += "[^/]*";
    else if (char === "?") output += "[^/]";
    else output += char.replace(/[\\^$+?.()|{}]/g, "\\$&");
  }
  const hasSlash = pattern.includes("/");
  const prefix = anchored || hasSlash ? "^" : "^(?:.*/)?";
  try {
    return {
      directoryOnly,
      literal: /[*?]/.test(pattern) ? null : pattern,
      matchesFullPath: anchored || hasSlash,
      regex: new RegExp(`${prefix}${output}$`),
    };
  } catch {
    return null;
  }
}

function matches(rule: CompiledRule, path: string, directory: boolean, basename: string) {
  if (rule.directoryOnly && !directory) return false;
  if (rule.literal !== null) return rule.matchesFullPath ? path === rule.literal : basename === rule.literal;
  return rule.regex.test(path);
}

function parsePaths(source: string) {
  const issues: string[] = [];
  const paths: { path: string; directory: boolean }[] = [];
  const seen = new Set<string>();
  const lines = source.split(/\r?\n/);
  if (lines.filter((line) => line.trim()).length > 1000) issues.push("Use 1000 paths or fewer.");
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const normalized = normalizePath(line);
    if (!normalized.path || normalized.path.startsWith("/") || normalized.path.split("/").includes("..")) {
      issues.push(`Path ${index + 1} must be relative.`);
      return;
    }
    if (seen.has(normalized.path)) issues.push(`Path ${normalized.path} is duplicated.`);
    else {
      seen.add(normalized.path);
      paths.push(normalized);
    }
  });
  if (!paths.length) issues.push("Add at least one relative path.");
  return { paths, issues };
}

function ancestors(path: string) {
  const parts = path.replace(/\/$/, "").split("/");
  const result: string[] = [];
  for (let index = 1; index < parts.length; index += 1) result.push(`${parts.slice(0, index).join("/")}/`);
  return result;
}

export function testRsyncFilters(input: unknown): RsyncResult {
  if (!objectLike(input)) return { status: "invalid", values: null, issues: ["Input must be an object."] };
  const issues: string[] = [];
  if (typeof input.rules !== "string") issues.push("Rules must be text.");
  if (typeof input.paths !== "string") issues.push("Paths must be text.");
  if (input.unmatched !== "include" && input.unmatched !== "exclude") issues.push("Choose an unmatched default.");
  if (issues.length) return { status: "invalid", values: null, issues };
  const parsedRules = parseRules(input.rules as string);
  const parsedPaths = parsePaths(input.paths as string);
  issues.push(...parsedRules.issues, ...parsedPaths.issues);
  if (issues.length) return { status: "invalid", values: null, issues };
  const resolutionCache = new Map<string, CompiledRule | null>();
  const resolve = (path: string, directory: boolean) => {
    const normalizedPath = path.replace(/\/+$/, "");
    const key = `${directory ? "d" : "f"}:${normalizedPath}`;
    if (resolutionCache.has(key)) return resolutionCache.get(key) ?? null;
    const basename = normalizedPath.slice(normalizedPath.lastIndexOf("/") + 1);
    const rule = parsedRules.rules.find((candidate) => matches(candidate, normalizedPath, directory, basename)) ?? null;
    resolutionCache.set(key, rule);
    return rule;
  };
  const rows: RsyncRow[] = parsedPaths.paths.map(({ path, directory }) => {
    for (const ancestor of ancestors(path)) {
      const rule = resolve(ancestor, true);
      const action = rule?.action ?? input.unmatched;
      if (action === "exclude") return { path, state: "unvisited", matchingRule: rule, note: `Parent ${ancestor} is excluded.` };
    }
    const rule = resolve(path, directory);
    if (rule) return {
      path,
      state: rule.action === "include" ? "included" : "excluded",
      matchingRule: rule,
      note: directory ? "Directory rule evaluated." : "First matching rule evaluated.",
    };
    const state = input.unmatched === "include" ? "included" : "excluded";
    return { path, state, matchingRule: null, note: "No rule matched; default applied." };
  });
  return {
    status: "valid",
    issues: [],
    values: {
      rows,
      includedCount: rows.filter((row) => row.state === "included").length,
      excludedCount: rows.filter((row) => row.state === "excluded").length,
      unvisitedCount: rows.filter((row) => row.state === "unvisited").length,
      rules: parsedRules.rules,
      resolutionVersion: "rsync-filter-v1",
    },
  };
}

export function formatRsyncResult(result: RsyncResult) {
  if (result.status === "invalid" || !result.values) return result.issues.join("\n");
  return [
    `Included ${result.values.includedCount}; excluded ${result.values.excludedCount}; unvisited ${result.values.unvisitedCount}`,
    ...result.values.rows.map((row) => `${row.state.toUpperCase()} ${row.path} ${row.matchingRule ? `line ${row.matchingRule.line} ${row.matchingRule.pattern}` : row.note}`),
  ].join("\n");
}
