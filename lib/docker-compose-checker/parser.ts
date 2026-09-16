import YAML from "yaml";
import type { Diagnostic } from "./types";

const CORE_TAGS = new Set([
  "tag:yaml.org,2002:str",
  "tag:yaml.org,2002:int",
  "tag:yaml.org,2002:float",
  "tag:yaml.org,2002:bool",
  "tag:yaml.org,2002:null",
  "tag:yaml.org,2002:map",
  "tag:yaml.org,2002:seq",
  "tag:yaml.org,2002:binary",
  "tag:yaml.org,2002:timestamp",
]);

export type SourceLocation = {
  line: number | null;
  column: number | null;
  excerpt: string | null;
};

export type ParsedYaml = {
  value: unknown;
  root: unknown;
  locations: Map<string, SourceLocation>;
};

export function sourceLocation(source: string, node: unknown, fallbackPosition?: number): SourceLocation {
  const range = (node as { range?: [number, number, number] } | null)?.range;
  const position = range?.[0] ?? fallbackPosition;
  if (position === undefined || position === null || position < 0) {
    return { line: null, column: null, excerpt: null };
  }
  const before = source.slice(0, position);
  const line = before.split("\n").length;
  const column = position - (before.lastIndexOf("\n") + 1) + 1;
  const rawLine = source.split("\n")[line - 1] ?? "";
  return {
    line,
    column,
    excerpt: rawLine.trim().slice(0, 240),
  };
}

function parseDiagnostic(source: string, error: { code?: string; message?: string; pos?: [number, number] }): Diagnostic {
  const location = sourceLocation(source, null, error.pos?.[0]);
  const code = error.code === "DUPLICATE_KEY" ? "YAML-DUPLICATE-KEY" : "YAML-PARSE-ERROR";
  return {
    severity: "Error",
    code,
    layer: "YAML syntax",
    path: null,
    line: location.line,
    column: location.column,
    excerpt: location.excerpt,
    message: error.message ?? "The YAML document could not be parsed.",
    fix: code === "YAML-DUPLICATE-KEY" ? "Remove the duplicate mapping key, then check the file again." : "Fix the YAML syntax, then check the file again.",
  };
}

function scanUnsafeTags(source: string, node: any, diagnostics: Diagnostic[]) {
  if (!node || typeof node !== "object") return;
  if (node.tag && !CORE_TAGS.has(node.tag)) {
    const location = sourceLocation(source, node);
    diagnostics.push({
      severity: "Error",
      code: "YAML-UNSAFE-TAG",
      layer: "YAML syntax",
      path: null,
      line: location.line,
      column: location.column,
      excerpt: location.excerpt,
      message: "The document uses a YAML tag this checker will not evaluate.",
      fix: "Remove the custom tag, then check the file again.",
    });
  }
  if (YAML.isAlias(node)) return;
  if (YAML.isMap(node)) {
    for (const pair of node.items as any[]) {
      scanUnsafeTags(source, pair.key, diagnostics);
      scanUnsafeTags(source, pair.value, diagnostics);
    }
  } else if (YAML.isSeq(node)) {
    for (const item of node.items) scanUnsafeTags(source, item, diagnostics);
  }
}

function recordLocations(source: string, node: any, path: string, locations: Map<string, SourceLocation>) {
  if (!node || typeof node !== "object") return;
  locations.set(path, sourceLocation(source, node));
  if (YAML.isAlias(node)) return;
  if (YAML.isMap(node)) {
    for (const pair of node.items as any[]) {
      const key = typeof pair.key?.value === "string" || typeof pair.key?.value === "number" ? String(pair.key.value) : "";
      if (!key) continue;
      const nextPath = path ? `${path}.${key}` : key;
      recordLocations(source, pair.value, nextPath, locations);
      locations.set(nextPath, sourceLocation(source, pair.key));
    }
  } else if (YAML.isSeq(node)) {
    node.items.forEach((item: unknown, index: number) => recordLocations(source, item, `${path}[${index}]`, locations));
  }
}

export function parseYamlDocument(source: string): { parsed: ParsedYaml | null; diagnostics: Diagnostic[] } {
  const lineCounter = new YAML.LineCounter();
  const documents = YAML.parseAllDocuments(source, {
    version: "1.2",
    schema: "core",
    uniqueKeys: true,
    lineCounter,
  });
  const diagnostics = documents.flatMap((document) => document.errors.map((error) => parseDiagnostic(source, error)));
  if (documents.length !== 1) {
    const location = sourceLocation(source, null, source.indexOf("---", 1));
    diagnostics.push({
      severity: "Error",
      code: "YAML-MULTIPLE-DOCUMENTS",
      layer: "YAML syntax",
      path: null,
      line: location.line,
      column: location.column,
      excerpt: location.excerpt,
      message: "Only one YAML document is accepted.",
      fix: "Remove the extra document separator and keep one Compose file.",
    });
  }
  const document = documents[0];
  if (!document || diagnostics.length > 0) return { parsed: null, diagnostics };
  scanUnsafeTags(source, document.contents, diagnostics);
  if (diagnostics.length > 0) return { parsed: null, diagnostics };
  try {
    const value = document.toJS({ mapAsMap: false, maxAliasCount: 100 });
    const locations = new Map<string, SourceLocation>();
    recordLocations(source, document.contents, "", locations);
    return { parsed: { value, root: document.contents, locations }, diagnostics: [] };
  } catch (error) {
    const location = sourceLocation(source, null, (error as { pos?: number }).pos);
    return {
      parsed: null,
      diagnostics: [{
        severity: "Error",
        code: "YAML-ALIAS-ERROR",
        layer: "YAML syntax",
        path: null,
        line: location.line,
        column: location.column,
        excerpt: location.excerpt,
        message: "The YAML aliases could not be resolved safely.",
        fix: "Remove the alias cycle or simplify the YAML, then check the file again.",
      }],
    };
  }
}
