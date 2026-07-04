export const bannedSummaryPatterns = [
  /\bopen[- ]source\b/i,
  /\bself[- ]hosted\b/i,
  /\bsolution\b/i,
  /\bplatform\b/i,
  /\bpowerful\b/i,
  /\bultimate\b/i,
  /\ball[- ]in[- ]one\b/i,
  /\bseamless\b/i,
  /\brobust\b/i,
];

const cleanupPatterns = [
  [/\bopen[- ]source\b/gi, ""],
  [/\bopen[- ]sourced\b/gi, ""],
  [/\bself[- ]hosted\b/gi, ""],
  [/\bself[- ]hostable\b/gi, ""],
  [/\bsolution\b/gi, "app"],
  [/\bplatform\b/gi, "app"],
  [/\s+/g, " "],
  [/\ball[- ]in[- ]one\b/gi, ""],
  [/\bpowerful\b/gi, ""],
  [/\bultimate\b/gi, ""],
  [/\bseamless\b/gi, ""],
  [/\brobust\b/gi, ""],
  [/\bfree software\b/gi, "software"],
  [/\bweb application\b/gi, "web app"],
  [/\bweb-based\b/gi, "web"],
];

export function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sentenceCase(value) {
  const text = String(value ?? "").trim();
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

export function trimSentence(value, maxLength = 158) {
  let text = String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  text = text.replace(/([.!?])\s+/g, ", ");
  text = text.replace(/[.!?]+$/g, "");
  if (text.length > maxLength) {
    text = text.slice(0, maxLength).replace(/\s+\S*$/, "");
  }
  text = text
    .replace(/\s*\([^)]*$/g, "")
    .replace(/(?:,\s*)+$/g, "")
    .trim();
  return `${sentenceCase(text)}.`;
}

export function rewriteSummaryFromInputs({ name, description, topics = [] }) {
  let text = String(description ?? "").trim();
  for (const [pattern, replacement] of cleanupPatterns) {
    text = text.replace(pattern, replacement);
  }
  text = text
    .replace(/\(\s*[,;\s]*\)/g, " ")
    .replace(/\s*\([^)]*$/g, "")
    .replace(/\bfully\s+and\s+/gi, "")
    .replace(/\bfast,\s*secure,\s*and\s+/gi, "fast and secure ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([)\]}])/g, "$1")
    .replace(/\s*,\s*,+/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/^[-:,\s]+|[-:,\s]+$/g, "");

  if (!text && Array.isArray(topics) && topics.length > 0) {
    text = `${name} app for ${topics.slice(0, 3).join(", ").replace(/-/g, " ")}`;
  }

  return trimSentence(text || `${name} app.`);
}

export function validateSummary(summary) {
  const errors = [];
  const warnings = [];
  const text = String(summary ?? "").trim();

  if (!text) {
    errors.push("summary is required");
    return { errors, warnings };
  }

  const sentenceCount = (text.match(/[.!?](\s|$)/g) ?? []).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (sentenceCount > 1) errors.push("summary must be one sentence");
  if (text.length > 160) warnings.push("summary should stay under 160 characters");
  if (text.length < 50) warnings.push("summary is too short to be useful");
  if (wordCount < 8) warnings.push("summary should explain the app in at least 8 words");
  if (text.includes("—")) errors.push("summary must not contain an em dash");
  if (/^[^:]{2,48}:\s+\S/.test(text)) {
    warnings.push("summary should not repeat the app name with a colon");
  }
  if (/^A[n]?\s+/i.test(text)) {
    warnings.push("summary should start with the useful thing, not an article");
  }
  if (
    wordCount <= 6 &&
    /\b(app|tool|platform|dashboard|manager|server|system|repository|software|project)\.$/i.test(text)
  ) {
    warnings.push("summary is too generic");
  }

  for (const pattern of bannedSummaryPatterns) {
    if (pattern.test(text)) {
      warnings.push(`summary contains weak phrase: ${pattern.source}`);
    }
  }

  return { errors, warnings };
}
