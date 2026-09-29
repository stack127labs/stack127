import { isKdpDescriptionTag, isKdpDescriptionVoidTag, KDP_DESCRIPTION_LIMIT } from "./description-rules.ts";

export { KDP_DESCRIPTION_LIMIT } from "./description-rules.ts";
export const KDP_TITLE_SUBTITLE_LIMIT = 200;
export const KDP_KEYWORD_LIMIT = 7;
export const KDP_KEYWORD_LOCAL_LIMIT = 50;
export const KDP_LOCAL_INPUT_BYTES = 64 * 1024;

export type KdpMetadataInput = Readonly<{
  title: string;
  subtitle: string;
  description: string;
  keywords: readonly string[];
}>;

export type KdpMetadataFinding = Readonly<{
  code: string;
  field: string;
  severity: "warning" | "error";
  message: string;
  index?: number;
}>;

export type KdpDescriptionToken =
  | Readonly<{ type: "text"; value: string }>
  | Readonly<{ type: "tag"; name: string; closing: boolean; selfClosing: boolean }>;

export type KdpMetadataValues = Readonly<{
  titleCharacters: number;
  subtitleCharacters: number;
  titleWithSubtitleCharacters: number;
  descriptionCharacters: number;
  descriptionVisibleCharacters: number;
  supportedTagCount: number;
  keywordCount: number;
  normalizedKeywords: readonly string[];
}>;

export type KdpMetadataResult = Readonly<{
  status: "clean" | "possible-issues" | "input-error";
  values: KdpMetadataValues | null;
  findings: readonly KdpMetadataFinding[];
}>;

function finding(
  code: string,
  field: string,
  message: string,
  severity: KdpMetadataFinding["severity"] = "error",
  index?: number,
): KdpMetadataFinding {
  return { code, field, message, severity, ...(index === undefined ? {} : { index }) };
}

function normalized(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

function words(value: string): string[] {
  return normalized(value).split(" ").filter((word) => word.length > 2);
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function characterCount(value: string): number {
  return Array.from(value).length;
}

function byteCount(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function tokenizeKdpDescription(value: string): KdpDescriptionToken[] {
  const tokens: KdpDescriptionToken[] = [];
  const tagPattern = /<\/?([a-z][a-z0-9-]*)([^>]*)>/gi;
  let cursor = 0;
  for (const match of value.matchAll(tagPattern)) {
    const index = match.index ?? cursor;
    if (index > cursor) tokens.push({ type: "text", value: value.slice(cursor, index) });
    const raw = match[0];
    const tail = match[2] ?? "";
    tokens.push({
      type: "tag",
      name: match[1].toLowerCase(),
      closing: raw.startsWith("</"),
      selfClosing: /\/\s*>$/.test(raw) || isKdpDescriptionVoidTag(match[1].toLowerCase()),
    });
    cursor = index + raw.length;
  }
  if (cursor < value.length) tokens.push({ type: "text", value: value.slice(cursor) });
  return tokens;
}

function checkDescription(value: string, findings: KdpMetadataFinding[]) {
  const stack: string[] = [];
  let supportedTagCount = 0;
  const tagPattern = /<\/?([a-z][a-z0-9-]*)([^>]*)>/gi;
  for (const match of value.matchAll(tagPattern)) {
    const index = match.index ?? 0;
    const raw = match[0];
    const name = match[1].toLowerCase();
    const tail = (match[2] ?? "").replace(/\/\s*$/, "").trim();
    const closing = raw.startsWith("</");
    const selfClosing = /\/\s*>$/.test(raw) || isKdpDescriptionVoidTag(name);
    if (!isKdpDescriptionTag(name)) {
      findings.push(finding("description-unsupported-tag", "description", `Unsupported HTML tag <${name}>.`, "error", index));
    } else {
      supportedTagCount += 1;
      if (tail) findings.push(finding("description-tag-attributes", "description", `Remove attributes from <${name}>.`, "error", index));
    }
    if (closing) {
      if (stack[stack.length - 1] !== name) {
        findings.push(finding("description-mismatched-tag", "description", `Closing tag </${name}> does not match the open tag.`, "error", index));
      } else {
        stack.pop();
      }
    } else if (!selfClosing) {
      stack.push(name);
    }
  }
  for (const name of stack.reverse()) {
    findings.push(finding("description-unclosed-tag", "description", `HTML tag <${name}> is not closed.`, "error"));
  }
  return supportedTagCount;
}

function checkRestrictedDescriptionText(value: string, findings: KdpMetadataFinding[]) {
  const checks: Array<[string, RegExp, string]> = [
    ["description-url", /(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63})(?:\/\S*)?/i, "Remove URLs from the description."],
    ["description-email", /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/i, "Remove email addresses from the description."],
    ["description-phone", /\+?\d[\d\s().-]{6,}\d/, "Review phone-like contact details in the description."],
    ["description-price", /(?:[$€£]\s?\d+(?:[.,]\d{2})?|\b(?:USD|EUR|GBP)\s?\d+)/i, "Review price claims in the description."],
    ["description-review-request", /\b(?:please\s+)?(?:review|rate|leave\s+(?:a\s+)?review|feedback)\b/i, "Remove review requests from the description."],
    ["description-promotion", /\b(?:buy\s+now|free|sale|discount|best\s*seller|#1|limited\s+time|available\s+now)\b/i, "Check promotional wording against KDP metadata rules."],
    ["description-emoji", /\p{Extended_Pictographic}/u, "Remove emoji from the description."],
  ];
  for (const [code, pattern, message] of checks) {
    const match = pattern.exec(value);
    if (match) findings.push(finding(code, "description", message, "warning", match.index));
  }
}

function checkRestrictedFieldText(value: string, field: string, findings: KdpMetadataFinding[]) {
  const checks: Array<[string, RegExp, string]> = [
    ["url", /(?:https?:\/\/|www\.)\S+/i, "Review the URL-like text in this field."],
    ["email", /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/i, "Review the email-like text in this field."],
    ["phone", /\+?\d[\d\s().-]{6,}\d/, "Review the phone-like text in this field."],
    ["price", /(?:[$€£]\s?\d+(?:[.,]\d{2})?|\b(?:USD|EUR|GBP)\s?\d+)/i, "Review the price-like text in this field."],
    ["review", /\b(?:please\s+)?(?:review|rate|leave\s+(?:a\s+)?review|feedback)\b/i, "Review the request for ratings or reviews in this field."],
    ["promotion", /\b(?:buy\s+now|free|sale|discount|best\s*seller|#1|limited\s+time|available\s+now)\b/i, "Review the promotional wording in this field."],
  ];
  for (const [code, pattern, message] of checks) {
    const match = pattern.exec(value);
    if (match) findings.push(finding(`${field}-${code}`, field, message, "warning", match.index));
  }
}

function containsHtml(value: string): boolean {
  return /<\/?[a-z][a-z0-9-]*(?:\s[^>]*)?>/i.test(value);
}

export function checkKdpMetadata(input: KdpMetadataInput): KdpMetadataResult {
  const findings: KdpMetadataFinding[] = [];
  const title = typeof input?.title === "string" ? normalizeLineEndings(input.title) : "";
  const subtitle = typeof input?.subtitle === "string" ? normalizeLineEndings(input.subtitle) : "";
  const description = typeof input?.description === "string" ? normalizeLineEndings(input.description) : "";
  const rawKeywords = Array.isArray(input?.keywords) ? input.keywords : [];
  if (!Array.isArray(input?.keywords) || rawKeywords.length !== KDP_KEYWORD_LIMIT || rawKeywords.some((keyword) => typeof keyword !== "string")) {
    return {
      status: "input-error",
      values: null,
      findings: [finding("keywords-invalid", "keywords", "Provide exactly seven keyword fields.")],
    };
  }
  const keywords = Array.from({ length: KDP_KEYWORD_LIMIT }, (_, index) => typeof rawKeywords[index] === "string" ? normalizeLineEndings(rawKeywords[index]) : "");
  const titleWithSubtitleCharacters = characterCount(title) + characterCount(subtitle) + (title && subtitle ? 1 : 0);
  const supportedTagCount = checkDescription(description, findings);
  const descriptionVisibleCharacters = tokenizeKdpDescription(description)
    .filter((token): token is Extract<KdpDescriptionToken, { type: "text" }> => token.type === "text")
    .reduce((total, token) => total + characterCount(token.value), 0);

  if (!title.trim()) findings.push(finding("title-empty", "title", "Enter a book title."));
  if (!description.trim()) findings.push(finding("description-empty", "description", "Enter a book description."));
  if (containsHtml(title)) findings.push(finding("title-html", "title", "Remove HTML from the title."));
  if (containsHtml(subtitle)) findings.push(finding("subtitle-html", "subtitle", "Remove HTML from the subtitle."));
  if (titleWithSubtitleCharacters >= KDP_TITLE_SUBTITLE_LIMIT) findings.push(finding("title-too-long", "title", "Keep title and subtitle under 200 characters."));
  if (characterCount(description) > KDP_DESCRIPTION_LIMIT) findings.push(finding("description-too-long", "description", "Keep the description at 4,000 characters or fewer."));
  if (byteCount(title) > KDP_LOCAL_INPUT_BYTES) findings.push(finding("title-input-too-large", "title", "Shorten this field before running a local check."));
  if (byteCount(subtitle) > KDP_LOCAL_INPUT_BYTES) findings.push(finding("subtitle-input-too-large", "subtitle", "Shorten this field before running a local check."));
  if (byteCount(description) > KDP_LOCAL_INPUT_BYTES) findings.push(finding("description-input-too-large", "description", "Shorten this field before running a local check."));
  checkRestrictedFieldText(title, "title", findings);
  checkRestrictedFieldText(subtitle, "subtitle", findings);
  checkRestrictedDescriptionText(description, findings);

  const seen = new Map<string, number>();
  const titleWords = new Set(words(`${title} ${subtitle}`));
  keywords.forEach((keyword, index) => {
    const field = `keyword-${index + 1}`;
    const value = keyword.trim();
    if (containsHtml(value)) findings.push(finding("keyword-html", field, "Remove HTML from keyword fields."));
    if (characterCount(value) > KDP_KEYWORD_LOCAL_LIMIT) {
      findings.push(finding("keyword-too-long", field, "Local review: this keyword is over 50 Unicode characters; KDP does not publish a universal per-field limit.", "warning"));
    }
    if (byteCount(value) > KDP_LOCAL_INPUT_BYTES) findings.push(finding("keyword-input-too-large", field, "Shorten this keyword before running a local check."));
    checkRestrictedFieldText(value, field, findings);
    if (!value) return;
    const key = normalized(value);
    const prior = seen.get(key);
    if (prior !== undefined) findings.push(finding("keyword-duplicate", field, `This repeats keyword ${prior}.`, "warning"));
    else seen.set(key, index + 1);
    const keywordWords = words(value);
    if (keywordWords.length && keywordWords.every((word) => titleWords.has(word))) {
      findings.push(finding("keyword-title-repeat", field, "This keyword repeats title wording.", "warning"));
    }
  });

  const values: KdpMetadataValues = {
    titleCharacters: characterCount(title),
    subtitleCharacters: characterCount(subtitle),
    titleWithSubtitleCharacters,
    descriptionCharacters: characterCount(description),
    descriptionVisibleCharacters,
    supportedTagCount,
    keywordCount: keywords.filter((keyword) => keyword.trim()).length,
    normalizedKeywords: keywords.map(normalized),
  };
  return { status: findings.length ? "possible-issues" : "clean", values, findings };
}

export function formatKdpMetadataReport(result: KdpMetadataResult): string {
  if (!result.values) return `Status: ${result.status}\n${result.findings.map((next) => `${next.severity}: ${next.message}`).join("\n")}`;
  const lines = [
    `Title and subtitle: ${result.values.titleWithSubtitleCharacters} characters`,
    `Description: ${result.values.descriptionCharacters} characters`,
    `Keywords: ${result.values.keywordCount} of ${KDP_KEYWORD_LIMIT}`,
    `Status: ${result.status}`,
  ];
  for (const next of result.findings) lines.push(`${next.severity}: ${next.message}`);
  return lines.join("\n");
}
