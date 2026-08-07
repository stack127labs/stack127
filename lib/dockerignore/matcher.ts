import type { ParsedRuleLine } from "./parser.ts";

export type CompiledDockerignoreRule = ParsedRuleLine & {
  matches(path: string): boolean;
};

export type RuleTrace = {
  sourceLine: number;
  raw: string;
  normalized: string;
  exclusion: boolean;
  eligible: boolean;
  matched: boolean;
  matchSource: "self" | "parent" | null;
  ignoredAfter: boolean;
};

export type NodeEvaluation = {
  ignored: boolean;
  parentMatches: boolean[];
  decidingLine: number | null;
  trace: RuleTrace[];
};

type ClassToken = { low: string; high: string | null };

function badPattern(): never {
  throw new Error("bad-pattern");
}

function takeClassCharacter(codePoints: string[], position: number) {
  if (position >= codePoints.length || codePoints[position] === "-" || codePoints[position] === "]") badPattern();
  if (codePoints[position] === "\\") {
    if (position + 1 >= codePoints.length) badPattern();
    return { value: codePoints[position + 1], next: position + 2 };
  }
  return { value: codePoints[position], next: position + 1 };
}

function parseClass(codePoints: string[], start: number) {
  let position = start + 1;
  let negated = false;
  if (codePoints[position] === "^") {
    negated = true;
    position += 1;
  }
  const tokens: ClassToken[] = [];
  while (true) {
    if (codePoints[position] === "]" && tokens.length > 0) {
      return { negated, tokens, next: position + 1 };
    }
    const low = takeClassCharacter(codePoints, position);
    position = low.next;
    let high: string | null = null;
    if (codePoints[position] === "-") {
      const highResult = takeClassCharacter(codePoints, position + 1);
      high = highResult.value;
      position = highResult.next;
    }
    tokens.push({ low: low.value, high });
  }
}

function escapeClassCharacter(value: string) {
  if (value === "\\") return "\\\\";
  if (value === "]") return "\\]";
  if (value === "-") return "\\-";
  if (value === "^") return "\\^";
  return value;
}

function classSource(negated: boolean, tokens: ClassToken[]) {
  const body = tokens.map((token) => {
    if (!token.high) return escapeClassCharacter(token.low);
    if (token.low.codePointAt(0)! > token.high.codePointAt(0)!) badPattern();
    return `${escapeClassCharacter(token.low)}-${escapeClassCharacter(token.high)}`;
  }).join("");
  return `[${negated ? "^" : ""}${body}]`;
}

function escapeRegex(value: string) {
  return value.replace(/[\\^$.*+?()[\]{}|]/gu, "\\$&");
}

function validatePattern(pattern: string) {
  const codePoints = Array.from(pattern);
  for (let position = 0; position < codePoints.length;) {
    if (codePoints[position] === "\\") {
      if (position + 1 >= codePoints.length) badPattern();
      position += 2;
    } else if (codePoints[position] === "[") {
      position = parseClass(codePoints, position).next;
    } else {
      position += 1;
    }
  }
}

function compilePattern(pattern: string) {
  validatePattern(pattern);
  const codePoints = Array.from(pattern);
  let source = "^";
  let detected: "exact" | "prefix" | "suffix" | "regexp" = "exact";
  let position = 0;
  let logicalIndex = 0;
  while (position < codePoints.length) {
    const character = codePoints[position];
    if (character === "*" && codePoints[position + 1] === "*") {
      position += 2;
      if (codePoints[position] === "/") position += 1;
      if (position >= codePoints.length) {
        if (detected === "exact") detected = "prefix";
        else {
          source += ".*";
          detected = "regexp";
        }
      } else {
        source += "(.*\\/)?";
        detected = "regexp";
      }
      if (logicalIndex === 0) detected = "suffix";
    } else if (character === "*") {
      source += "[^/]*";
      detected = "regexp";
      position += 1;
    } else if (character === "?") {
      source += "[^/]";
      detected = "regexp";
      position += 1;
    } else if (character === "\\") {
      source += escapeRegex(codePoints[position + 1]);
      detected = "regexp";
      position += 2;
    } else if (character === "[") {
      const parsed = parseClass(codePoints, position);
      source += classSource(parsed.negated, parsed.tokens);
      detected = "regexp";
      position = parsed.next;
    } else {
      source += escapeRegex(character);
      position += 1;
    }
    logicalIndex += 1;
  }

  if (detected === "exact") return (path: string) => path === pattern;
  if (detected === "prefix") return (path: string) => path.startsWith(pattern.slice(0, -2));
  if (detected === "suffix") {
    const suffix = pattern.slice(2);
    return (path: string) => path.endsWith(suffix) || (suffix.startsWith("/") && path === suffix.slice(1));
  }
  let expression: RegExp;
  try {
    expression = new RegExp(`${source}$`, "u");
  } catch {
    badPattern();
  }
  return (path: string) => expression.test(path);
}

export function compileDockerignoreRules(lines: ParsedRuleLine[]):
  | { status: "valid"; rules: CompiledDockerignoreRule[] }
  | { status: "invalid"; sourceLine: number; message: string } {
  const rules: CompiledDockerignoreRule[] = [];
  for (const line of lines) {
    if (line.exclusion && !line.pattern) {
      return { status: "invalid", sourceLine: line.sourceLine, message: `Rule line ${line.sourceLine} is only !.` };
    }
    try {
      rules.push({ ...line, matches: compilePattern(line.pattern) });
    } catch {
      return { status: "invalid", sourceLine: line.sourceLine, message: `Rule line ${line.sourceLine} has invalid syntax.` };
    }
  }
  return { status: "valid", rules };
}

export function evaluateNode(
  rules: CompiledDockerignoreRule[],
  path: string,
  parentMatches: boolean[] | null,
  collectTrace = true,
): NodeEvaluation {
  let ignored = false;
  let decidingLine: number | null = null;
  const nextParentMatches = new Array<boolean>(rules.length).fill(false);
  const trace: RuleTrace[] = [];
  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];
    const inherited = parentMatches?.[index] ?? false;
    const eligible = inherited || rule.exclusion === ignored;
    const ownMatch = !inherited && eligible ? rule.matches(path) : false;
    const matched = inherited || ownMatch;
    nextParentMatches[index] = matched;
    if (matched) {
      ignored = !rule.exclusion;
      decidingLine = rule.sourceLine;
    }
    if (collectTrace) {
      trace.push({
        sourceLine: rule.sourceLine,
        raw: rule.raw,
        normalized: rule.normalized,
        exclusion: rule.exclusion,
        eligible,
        matched,
        matchSource: inherited ? "parent" : ownMatch ? "self" : null,
        ignoredAfter: ignored,
      });
    }
  }
  return { ignored, parentMatches: nextParentMatches, decidingLine, trace };
}
