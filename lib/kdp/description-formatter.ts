import {
  isKdpDescriptionTag,
  isKdpDescriptionVoidTag,
  KDP_DESCRIPTION_LIMIT,
} from "./description-rules.ts";

import { decodeKdpCharacterReferences } from "./character-references.ts";

export type KdpDescriptionMode = "plain-text" | "html-source";
export type KdpDescriptionInput = Readonly<{ source: string; mode: KdpDescriptionMode }>;

export type KdpDescriptionTreeNode =
  | Readonly<{ type: "text"; value: string }>
  | Readonly<{ type: "element"; tag: string; children: readonly KdpDescriptionTreeNode[] }>;

export type KdpDescriptionChange = Readonly<{
  type: "whitespace" | "unsupported-tags" | "converted-tags" | "invisible-characters" | "attributes" | "dropped-content" | "entities" | "comments" | "declarations";
  count: number;
  details: readonly string[];
}>;

export type KdpDescriptionFormatResult =
  | Readonly<{ status: "invalid"; message: string }>
  | Readonly<{
      status: "no-output";
      message: string;
      changes: readonly KdpDescriptionChange[];
    }>
  | Readonly<{
      status: "formatted";
      mode: KdpDescriptionMode;
      html: string;
      htmlCharacters: number;
      visibleTextCharacters: number;
      sourceOverhead: number;
      copyAllowed: boolean;
      overBy: number;
      changes: readonly KdpDescriptionChange[];
      tree: readonly KdpDescriptionTreeNode[];
    }>;

const MAX_INPUT_BYTES = 64 * 1024;
const DROP_CONTENT_TAGS = new Set(["script", "style", "iframe", "object", "embed", "svg", "math", "template"]);
const VOID_HTML_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

type MutableNode = { type: "text"; value: string } | { type: "element"; tag: string; children: MutableNode[] };
type Frame = { tag: string; outputTag: string; supported: boolean; children: MutableNode[] };
type ParsedTag = { end: number; name: string; closing: boolean; selfClosing: boolean; attributes: string };

class UnsafeMarkupError extends Error {}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function characterCount(value: string): number {
  return Array.from(value).length;
}

function escapeText(value: string): string {
  return value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");
}

function decodeText(value: string): { value: string; changed: boolean } {
  const normalized = decodeKdpCharacterReferences(value).replace(/\u00a0/gu, " ");
  return { value: normalized, changed: normalized !== value };
}

function scanThroughTagEnd(source: string, start: number): number {
  let quote = "";
  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote) quote = "";
    } else if (character === "\"" || character === "'") {
      quote = character;
    } else if (character === ">") {
      return index;
    }
  }
  return -1;
}

function readTag(source: string, start: number): ParsedTag | null {
  const prefix = /^<(\/?)\s*([a-z][a-z\d:-]*)/iu.exec(source.slice(start));
  if (!prefix) return null;
  const end = scanThroughTagEnd(source, start);
  if (end < 0) throw new UnsafeMarkupError("A tag does not end with `>`. Close the tag or remove it, then format again.");
  const name = prefix[2].toLowerCase();
  const closing = Boolean(prefix[1]);
  const rawTail = source.slice(start + prefix[0].length, end);
  const trimmedTail = rawTail.trim();
  const selfClosing = !closing && /\/$/u.test(trimmedTail);
  const attributes = selfClosing ? trimmedTail.slice(0, -1).trim() : trimmedTail;
  if (closing && attributes) throw new UnsafeMarkupError(`The closing tag for <${name}> has extra text. Remove it, then format again.`);
  return { end, name, closing, selfClosing, attributes };
}

function findDroppedElementEnd(source: string, contentStart: number, name: string): number {
  if (name === "script" || name === "style") {
    const close = new RegExp(`<\\/\\s*${name}\\s*>`, "iu").exec(source.slice(contentStart));
    return close ? contentStart + close.index + close[0].length : source.length;
  }
  const tagPattern = new RegExp(`<\\s*(\\/?)\\s*${name}\\b[^>]*>`, "giu");
  tagPattern.lastIndex = contentStart;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(source))) {
    const closing = Boolean(match[1]);
    const selfClosing = /\/\s*>$/u.test(match[0]);
    if (closing) depth -= 1;
    else if (!selfClosing) depth += 1;
    if (depth === 0) return tagPattern.lastIndex;
  }
  return source.length;
}

function serialize(nodes: readonly MutableNode[]): string {
  return nodes.map((node) => {
    if (node.type === "text") return escapeText(node.value);
    const children = serialize(node.children);
    return node.tag === "br" ? "<br>" : `<${node.tag}>${children}</${node.tag}>`;
  }).join("");
}

function visibleText(nodes: readonly MutableNode[]): string {
  return nodes.map((node) => node.type === "text" ? node.value : visibleText(node.children)).join("");
}

function addChange(changes: Map<KdpDescriptionChange["type"], { count: number; details: Set<string> }>, type: KdpDescriptionChange["type"], detail?: string) {
  const change = changes.get(type) ?? { count: 0, details: new Set<string>() };
  change.count += 1;
  if (detail) change.details.add(detail);
  changes.set(type, change);
}

function finishChanges(changes: Map<KdpDescriptionChange["type"], { count: number; details: Set<string> }>): KdpDescriptionChange[] {
  return [...changes.entries()].map(([type, value]) => ({ type, count: value.count, details: [...value.details] }));
}

function plainTextTree(source: string, changes: Map<KdpDescriptionChange["type"], { count: number; details: Set<string> }>): MutableNode[] {
  const normalizedSource = source.replace(/\r\n?/gu, "\n");
  const lines = normalizedSource.split("\n").map((line) => line.trim().replace(/[ \t]+/gu, " "));
  const paragraphs: string[][] = [];
  let group: string[] = [];
  for (const line of lines) {
    if (!line) {
      if (group.length) paragraphs.push(group);
      group = [];
      continue;
    }
    group.push(line);
  }
  if (group.length) paragraphs.push(group);
  const canonicalWhitespace = paragraphs.map((paragraph) => paragraph.join("\n")).join("\n\n");
  if (canonicalWhitespace !== normalizedSource) {
    addChange(changes, "whitespace", "Trimmed line edges, collapsed spaces or tabs, or removed extra blank lines.");
  }
  return paragraphs.map((paragraph) => ({
    type: "element" as const,
    tag: "p",
    children: paragraph.flatMap((line, index) => [
      ...(index ? [{ type: "element" as const, tag: "br", children: [] as MutableNode[] }] : []),
      { type: "text" as const, value: line },
    ]),
  }));
}

function htmlSourceTree(source: string, changes: Map<KdpDescriptionChange["type"], { count: number; details: Set<string> }>): MutableNode[] {
  const roots: MutableNode[] = [];
  const stack: Frame[] = [];
  const append = (nodes: MutableNode[]) => (stack.at(-1)?.children ?? roots).push(...nodes);
  let cursor = 0;

  while (cursor < source.length) {
    const next = source.indexOf("<", cursor);
    if (next < 0) {
      const text = decodeText(source.slice(cursor));
      if (text.changed) addChange(changes, "entities", "Decoded a recognized character reference or normalized a nonbreaking space.");
      if (text.value) append([{ type: "text", value: text.value }]);
      break;
    }
    if (next > cursor) {
      const text = decodeText(source.slice(cursor, next));
      if (text.changed) addChange(changes, "entities", "Decoded a recognized character reference or normalized a nonbreaking space.");
      if (text.value) append([{ type: "text", value: text.value }]);
    }

    if (source.startsWith("<!--", next)) {
      const close = source.indexOf("-->", next + 4);
      if (close < 0) throw new UnsafeMarkupError("A comment is not closed. Close or remove it, then format again.");
      addChange(changes, "comments", "Removed an HTML comment.");
      cursor = close + 3;
      continue;
    }
    if (source.startsWith("<!", next) || source.startsWith("<?", next)) {
      const end = scanThroughTagEnd(source, next);
      if (end < 0) throw new UnsafeMarkupError("A declaration is not closed. Remove it, then format again.");
      addChange(changes, "declarations", "Removed a declaration or processing instruction.");
      cursor = end + 1;
      continue;
    }

    const tag = readTag(source, next);
    if (!tag) {
      append([{ type: "text", value: "<" }]);
      cursor = next + 1;
      continue;
    }
    cursor = tag.end + 1;
    if (tag.closing) {
      const frame = stack.at(-1);
      if (!frame || frame.tag !== tag.name) {
        throw new UnsafeMarkupError(`The closing tag </${tag.name}> does not match the open tags. Fix the nesting, then format again.`);
      }
      stack.pop();
      append(frame.supported ? [{ type: "element", tag: frame.outputTag, children: frame.children }] : frame.children);
      continue;
    }

    if (DROP_CONTENT_TAGS.has(tag.name)) {
      addChange(changes, "dropped-content", `Dropped <${tag.name}> and its contents.`);
      if (!tag.selfClosing && !VOID_HTML_TAGS.has(tag.name)) cursor = findDroppedElementEnd(source, cursor, tag.name);
      continue;
    }
    if (VOID_HTML_TAGS.has(tag.name)) {
      if (tag.name !== "br") addChange(changes, "dropped-content", `Dropped the void <${tag.name}> element.`);
      else {
        if (tag.attributes) addChange(changes, "attributes", "Removed attributes from <br>.");
        if (isKdpDescriptionTag(tag.name)) append([{ type: "element", tag: "br", children: [] }]);
      }
      continue;
    }
    if (tag.attributes) addChange(changes, "attributes", `Removed attributes from <${tag.name}>.`);
    const outputTag = tag.name === "strong" ? "b" : /^h[1-3]$/u.test(tag.name) ? "h4" : tag.name;
    const supported = isKdpDescriptionTag(outputTag);
    if (outputTag !== tag.name) addChange(changes, "converted-tags", `Converted <${tag.name}> to <${outputTag}> to keep its formatting.`);
    if (!supported) addChange(changes, "unsupported-tags", `Unwrapped the unsupported <${tag.name}> element.`);
    if (tag.selfClosing) {
      if (supported) append([{ type: "element", tag: outputTag, children: [] }]);
    } else {
      stack.push({ tag: tag.name, outputTag, supported, children: [] });
    }
  }

  if (stack.length) {
    const unclosed = stack.at(-1)?.tag ?? "element";
    throw new UnsafeMarkupError(`The <${unclosed}> tag is not closed. Close it, then format again.`);
  }
  return roots;
}

function cleanInvisibleCharacters(nodes: MutableNode[], changes: Map<KdpDescriptionChange["type"], { count: number; details: Set<string> }>) {
  for (const node of nodes) {
    if (node.type === "element") cleanInvisibleCharacters(node.children, changes);
    else node.value = node.value.replace(/[\u200b\u2060\ufeff]/gu, (character) => {
      const code = character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0");
      addChange(changes, "invisible-characters", `Removed invisible U+${code}.`);
      return "";
    });
  }
}

function freezeTree(nodes: readonly MutableNode[]): KdpDescriptionTreeNode[] {
  return nodes.map((node) => node.type === "text"
    ? { type: "text", value: node.value }
    : { type: "element", tag: node.tag, children: freezeTree(node.children) });
}

export function formatKdpDescription(input: KdpDescriptionInput): KdpDescriptionFormatResult {
  if (!input || typeof input.source !== "string" || (input.mode !== "plain-text" && input.mode !== "html-source")) {
    return { status: "invalid", message: "Enter description text and choose Plain text or HTML source." };
  }
  if (!input.source.trim()) return { status: "invalid", message: "Enter description text before formatting." };
  if (byteLength(input.source) > MAX_INPUT_BYTES) return { status: "invalid", message: "Keep the source under 64 KiB of UTF-8 text for this local formatter." };

  const mutableChanges = new Map<KdpDescriptionChange["type"], { count: number; details: Set<string> }>();
  try {
    const tree = input.mode === "plain-text"
      ? plainTextTree(input.source, mutableChanges)
      : htmlSourceTree(input.source, mutableChanges);
    cleanInvisibleCharacters(tree, mutableChanges);
    const html = serialize(tree);
    const visibleTextCharacters = characterCount(visibleText(tree));
    const changes = finishChanges(mutableChanges);
    if (!visibleText(tree).trim()) {
      return { status: "no-output", message: "No visible text remains after formatting. Add description text or choose a different source mode.", changes };
    }
    const htmlCharacters = characterCount(html);
    const overBy = Math.max(0, htmlCharacters - KDP_DESCRIPTION_LIMIT);
    return {
      status: "formatted",
      mode: input.mode,
      html,
      htmlCharacters,
      visibleTextCharacters,
      sourceOverhead: htmlCharacters - visibleTextCharacters,
      copyAllowed: overBy === 0,
      overBy,
      changes,
      tree: freezeTree(tree),
    };
  } catch (error) {
    if (error instanceof UnsafeMarkupError) return { status: "invalid", message: error.message };
    return { status: "invalid", message: "The source could not be formatted safely. Check the markup and try again." };
  }
}
