export const bannedSummaryPatterns = [
  /\bopen[- ]?source\b/i,
  /\bself[- ]?hosted\b/i,
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
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u00A0\u200B-\u200F\u202A-\u202E]|`|\*\*|\[[^\]]+\]\([^)]*\)|\[\/?(?:br|b|i|u|url|img|span|color|size)(?:\]|[=\s])|<\/?[a-z][^>]*>/i.test(text)) {
    errors.push("summary contains imported markup; write a reviewed plain-text description");
  }
  if (/&#(?:x[0-9a-f]+|[0-9]+);|&[a-z][a-z0-9]+;/i.test(text)) {
    errors.push("summary contains an HTML entity; write a reviewed plain-text description");
  }
  if (/https?:\/\/|www\./i.test(text)) {
    errors.push("summary contains a URL; keep links in the app's source fields");
  }
  if (/\b(?:see here|for examples|required in|click here|learn more|visit|how to run|quick setup|setup process|before installing|after installing|please)\b|\benvironment variables?\s*:/i.test(text)) {
    errors.push("summary contains setup or reference instructions; write a direct app description");
  }
  if (/\b(?:dockerfile|docker[- ]compose\.(?:ya?ml)|locustfile(?:\.py)?|(?:the\s+)?readme|(?:this|the)\s+repo(?:sitory)?|note\s*:|demo credentials|docker pull)\b|\/(?:mnt|app|config|data)\//i.test(text)) {
    errors.push("summary contains source or setup artifacts; write a reviewed app description");
  }
  if (/\b(?:and|or|the|a|an|your|when|which|that|it|this|is|are|has|have|can|will|requires|provides|supports)\s*[.!?]*$|(?:,|;)\s*(?:and|or|the|a|an|your|when|which|that|it|this|for|to|with|from|of|like|via|because|including|such as|is|are|has|have|can|will|requires|provides|supports)\s*[.!?]*$/i.test(text)) {
    errors.push("summary appears unfinished; review the complete sentence");
  }
  if (/\b(?:a|an)\s+(?:analytics|continuous|office|binary|application|mcp|captcha)\b|\ba,\s*[.!?]/i.test(text)) {
    errors.push("summary contains a malformed article or phrase; review the complete sentence");
  }
  if (/;\s+/.test(text)) {
    errors.push("summary should use a full stop instead of a semicolon");
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
