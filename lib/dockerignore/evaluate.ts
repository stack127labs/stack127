import { compileDockerignoreRules, evaluateNode, type NodeEvaluation, type RuleTrace } from "./matcher.ts";
import { parseIgnoreRules, parseProbePaths, type DockerignoreIssue, type ParsedRuleLine } from "./parser.ts";

export const MOBY_PATTERNMATCHER_VERSION = "v0.6.1";
export const MOBY_PATTERNMATCHER_COMMIT = "5a6d8429a19bb6948a372ff19e86fe83599a04b7";
export const DOCKERIGNORE_CONTRACT = "moby-patternmatcher-v0.6.1-linux-slash";
export const DOCKERIGNORE_COPY_SCHEMA = 1;

export type DockerignoreSourceMode = "root" | "dockerfile-specific";
export type DockerignoreVerdict = "Included" | "Excluded";

export type DockerignoreRow = {
  sourceLine: number;
  rawPath: string;
  normalizedPath: string;
  verdict: DockerignoreVerdict;
  ignored: boolean;
  decidingLine: number | null;
  decidingRule: string | null;
  trace: RuleTrace[];
  builderControlFile: boolean;
};

export type DockerignoreValidResult = {
  status: "valid";
  sourceMode: DockerignoreSourceMode;
  counts: { excluded: number; included: number; total: number };
  rows: DockerignoreRow[];
  diagnostics: ParsedRuleLine[];
  contract: typeof DOCKERIGNORE_CONTRACT;
  version: typeof MOBY_PATTERNMATCHER_VERSION;
  commit: typeof MOBY_PATTERNMATCHER_COMMIT;
};

function invalidRules(sourceLine: number, message: string): DockerignoreIssue {
  return { status: "invalid", field: "rules", message, sourceLine };
}

function ancestors(path: string) {
  const segments = path.split("/");
  return segments.slice(0, -1).map((_, index) => segments.slice(0, index + 1).join("/"));
}

function decidingRule(lines: ParsedRuleLine[], sourceLine: number | null) {
  if (sourceLine === null) return null;
  return lines.find((line) => line.sourceLine === sourceLine)?.normalized ?? null;
}

function isBuilderControlFile(path: string) {
  const basename = path.split("/").at(-1) ?? "";
  return basename === "Dockerfile" || basename === ".dockerignore" || basename.endsWith(".Dockerfile.dockerignore");
}

export function evaluateDockerignore(input: {
  rules: string;
  paths: string;
  sourceMode: DockerignoreSourceMode;
}): DockerignoreValidResult | DockerignoreIssue {
  if (input.sourceMode !== "root" && input.sourceMode !== "dockerfile-specific") {
    return { status: "invalid", field: "rules", message: "Choose an effective file.", sourceLine: null };
  }
  const parsedRules = parseIgnoreRules(input.rules);
  if (parsedRules.status === "invalid") return parsedRules;
  const compiled = compileDockerignoreRules(parsedRules.activeRules);
  if (compiled.status === "invalid") return invalidRules(compiled.sourceLine, compiled.message);
  const parsedPaths = parseProbePaths(input.paths);
  if (parsedPaths.status === "invalid") return parsedPaths;

  const rows: DockerignoreRow[] = [];
  const ancestorCache = new Map<string, boolean[]>();
  const finalCache = new Map<string, NodeEvaluation>();
  const fullyInheritedCache = new WeakMap<boolean[], NodeEvaluation>();
  for (const path of parsedPaths.paths) {
    let parentMatches: boolean[] | null = null;
    for (const ancestor of ancestors(path.normalized)) {
      const cached = ancestorCache.get(ancestor);
      if (cached) {
        parentMatches = cached;
      } else {
        const evaluation = evaluateNode(compiled.rules, ancestor, parentMatches, false);
        ancestorCache.set(ancestor, evaluation.parentMatches);
        parentMatches = evaluation.parentMatches;
      }
    }
    let evaluation = finalCache.get(path.normalized);
    if (!evaluation && parentMatches?.every(Boolean)) {
      evaluation = fullyInheritedCache.get(parentMatches);
      if (!evaluation) {
        evaluation = evaluateNode(compiled.rules, path.normalized, parentMatches);
        fullyInheritedCache.set(parentMatches, evaluation);
      }
    }
    if (!evaluation) {
      evaluation = evaluateNode(compiled.rules, path.normalized, parentMatches);
      finalCache.set(path.normalized, evaluation);
    }
    const verdict: DockerignoreVerdict = evaluation.ignored ? "Excluded" : "Included";
    rows.push({
      sourceLine: path.sourceLine,
      rawPath: path.raw,
      normalizedPath: path.normalized,
      verdict,
      ignored: evaluation.ignored,
      decidingLine: evaluation.decidingLine,
      decidingRule: decidingRule(parsedRules.lines, evaluation.decidingLine),
      trace: evaluation.trace,
      builderControlFile: isBuilderControlFile(path.normalized),
    });
  }

  const excluded = rows.filter((row) => row.ignored).length;
  return {
    status: "valid",
    sourceMode: input.sourceMode,
    counts: { excluded, included: rows.length - excluded, total: rows.length },
    rows,
    diagnostics: parsedRules.lines,
    contract: DOCKERIGNORE_CONTRACT,
    version: MOBY_PATTERNMATCHER_VERSION,
    commit: MOBY_PATTERNMATCHER_COMMIT,
  };
}

export function buildDockerignoreCopySummary(result: DockerignoreValidResult) {
  const lines = [
    `schema\t${DOCKERIGNORE_COPY_SCHEMA}`,
    `contract\t${result.contract}`,
    `source\t${result.sourceMode}`,
    `excluded\t${result.counts.excluded}`,
    `included\t${result.counts.included}`,
    "raw path\tnormalized path\tverdict\tdeciding line",
  ];
  for (const row of result.rows) {
    const deciding = row.decidingLine === null ? "No rule matched" : `line ${row.decidingLine}`;
    lines.push(`${row.rawPath}\t${row.normalizedPath}\t${row.verdict}\t${deciding}`);
  }
  return lines.join("\n");
}
