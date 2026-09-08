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

export function validateSummary(summary) {
  const errors = [];
  const warnings = [];
  const text = String(summary ?? "").trim();

  if (!text) {
    errors.push("summary is required");
    return { errors, warnings };
  }

  const sentenceCount = (text.match(/[.!?](\s|$)/g) ?? []).length;
  if (/\[\/?(?:br|b|i|u|url|img|span|color|size)(?:\]|[=\s])|<\/?[a-z][^>]*>/i.test(text)) {
    errors.push("summary contains imported markup; write a reviewed plain-text description");
  }
  if (/\b(?:and|or|the|a|an|your|when)\s*[.!?]*$/i.test(text) || /\b(?:and|which|that|it|this)\s+(?:is|are)\s*[.!?]*$/i.test(text)) {
    errors.push("summary appears unfinished; review the complete sentence");
  }
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
