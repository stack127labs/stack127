export const KDP_BACKEND_KEYWORD_FIELD_COUNT = 7;
export const KDP_BACKEND_KEYWORD_DEFAULT_CAP = 50;

export type KdpBackendKeywordsInput = Readonly<{
  candidatePhrases: string;
  planningCapText: string;
  title: string;
  subtitle: string;
  categories: string;
}>;

export type KdpBackendKeywordsFieldErrorKey = keyof KdpBackendKeywordsInput;
export type KdpBackendKeywordsFieldErrors = Partial<Record<KdpBackendKeywordsFieldErrorKey, string>>;

export type KdpBackendKeywordsFinding = Readonly<{
  kind: "kdp-guidance" | "local-prompt";
  line: number;
  phrase: string;
  message: string;
}>;

export type KdpBackendKeywordsPlacedField = Readonly<{
  index: number;
  text: string;
  characters: number;
}>;

export type KdpBackendKeywordsResult =
  | Readonly<{ status: "invalid"; fieldErrors: KdpBackendKeywordsFieldErrors }>
  | Readonly<{
      status: "built";
      planningCap: number;
      placedCount: number;
      distinctCount: number;
      fields: readonly KdpBackendKeywordsPlacedField[];
      duplicates: readonly { line: number; phrase: string; firstLine: number }[];
      needsEdit: readonly { line: number; phrase: string }[];
      unplaced: readonly { line: number; phrase: string; characters: number; reason: "over-cap" | "no-room" }[];
      kdpFindings: readonly KdpBackendKeywordsFinding[];
      localFindings: readonly KdpBackendKeywordsFinding[];
      metadataCompared: boolean;
    }>;

const MAX_BYTES = 64 * 1024;
const FUNCTION_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into", "is", "it", "of", "on", "or", "that", "the", "this", "to", "was", "were", "with",
]);

function codePoints(value: string): number {
  return Array.from(value).length;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function cleanPhrase(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

function duplicateKey(value: string): string {
  return value.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/gu, " ");
}

function words(value: string): string[] {
  return value.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function addFinding(
  target: KdpBackendKeywordsFinding[],
  kind: KdpBackendKeywordsFinding["kind"],
  line: number,
  phrase: string,
  message: string,
) {
  target.push({ kind, line, phrase, message });
}

function validateInput(input: KdpBackendKeywordsInput): KdpBackendKeywordsFieldErrors {
  const errors: KdpBackendKeywordsFieldErrors = {};
  for (const key of ["candidatePhrases", "planningCapText", "title", "subtitle", "categories"] as const) {
    if (typeof input?.[key] !== "string") errors[key] = "Enter text in this field.";
  }
  if (Object.keys(errors).length) return errors;

  const candidateSource = input.candidatePhrases;
  const nonblankLines = candidateSource.split(/\r\n?|\n/u).filter((line) => line.trim());
  if (!candidateSource.trim()) errors.candidatePhrases = "Enter at least one candidate phrase, one per line.";
  else if (byteLength(candidateSource) > MAX_BYTES) errors.candidatePhrases = "Keep the candidate list under 64 KiB of UTF-8 text.";
  else if (nonblankLines.length > 100) errors.candidatePhrases = "Use no more than 100 nonblank candidate lines.";
  else if (nonblankLines.some((line) => codePoints(cleanPhrase(line)) > 200)) errors.candidatePhrases = "Shorten each candidate to 200 characters or fewer for this local tool.";

  const cap = input.planningCapText.trim();
  if (!/^\d+$/u.test(cap) || !Number.isSafeInteger(Number(cap)) || Number(cap) < 10 || Number(cap) > 200) {
    errors.planningCapText = "Enter a whole-number planning cap from 10 to 200.";
  }
  if (codePoints(input.title) > 500) errors.title = "Keep the title at 500 characters or fewer.";
  if (codePoints(input.subtitle) > 500) errors.subtitle = "Keep the subtitle at 500 characters or fewer.";
  const categories = input.categories.split(/\r\n?|\n/u).filter((line) => line.trim());
  if (categories.length > 10 || categories.some((line) => codePoints(cleanPhrase(line)) > 200)) {
    errors.categories = "Use at most 10 category labels, with no label over 200 characters.";
  }
  return errors;
}

export function buildKdpBackendKeywords(input: KdpBackendKeywordsInput): KdpBackendKeywordsResult {
  const fieldErrors = validateInput(input);
  if (Object.keys(fieldErrors).length) return { status: "invalid", fieldErrors };

  const cap = Number(input.planningCapText.trim());
  const lines = input.candidatePhrases.replace(/\r\n?/gu, "\n").split("\n");
  const seen = new Map<string, number>();
  const candidates: { line: number; phrase: string; words: string[] }[] = [];
  const duplicates: { line: number; phrase: string; firstLine: number }[] = [];
  const needsEdit: { line: number; phrase: string }[] = [];

  lines.forEach((raw, index) => {
    if (!raw.trim()) return;
    const line = index + 1;
    const phrase = cleanPhrase(raw);
    const key = duplicateKey(phrase);
    if (!key) {
      needsEdit.push({ line, phrase: raw });
      return;
    }
    const firstLine = seen.get(key);
    if (firstLine !== undefined) {
      duplicates.push({ line, phrase: raw, firstLine });
      return;
    }
    seen.set(key, line);
    candidates.push({ line, phrase, words: words(phrase) });
  });

  if (!candidates.length) {
    return {
      status: "invalid",
      fieldErrors: { candidatePhrases: "Add at least one phrase with a letter or number. Punctuation-only lines need editing." },
    };
  }

  const fieldTexts = Array.from({ length: KDP_BACKEND_KEYWORD_FIELD_COUNT }, () => "");
  const placed = new Set<number>();
  const unplaced: { line: number; phrase: string; characters: number; reason: "over-cap" | "no-room" }[] = [];

  candidates.forEach((candidate, candidateIndex) => {
    const length = codePoints(candidate.phrase);
    if (length > cap) {
      unplaced.push({ line: candidate.line, phrase: candidate.phrase, characters: length, reason: "over-cap" });
      return;
    }
    const fieldIndex = fieldTexts.findIndex((text) => codePoints(text) + (text ? 1 : 0) + length <= cap);
    if (fieldIndex < 0) {
      unplaced.push({ line: candidate.line, phrase: candidate.phrase, characters: length, reason: "no-room" });
      return;
    }
    fieldTexts[fieldIndex] = fieldTexts[fieldIndex] ? `${fieldTexts[fieldIndex]} ${candidate.phrase}` : candidate.phrase;
    placed.add(candidateIndex);
  });

  const fields = fieldTexts.map((text, index) => ({ index: index + 1, text, characters: codePoints(text) }));
  const contextWords = new Set([
    ...words(input.title),
    ...words(input.subtitle),
    ...input.categories.split(/\r\n?|\n/u).flatMap((line) => words(line)),
  ]);
  const kdpFindings: KdpBackendKeywordsFinding[] = [];
  const localFindings: KdpBackendKeywordsFinding[] = [];
  const placedWordLines = new Map<string, Set<number>>();

  candidates.forEach((candidate, candidateIndex) => {
    const candidateWords = candidate.words;
    const contentWords = candidateWords.filter((word) => codePoints(word) > 2);
    if (contentWords.length && contentWords.every((word) => contextWords.has(word))) {
      addFinding(localFindings, "local-prompt", candidate.line, candidate.phrase, "All meaningful words also appear in the supplied title, subtitle, or category labels; review whether this phrase adds anything new.");
    }
    if (/<\/?[A-Za-z][^>]*>/u.test(candidate.phrase)) {
      addFinding(kdpFindings, "kdp-guidance", candidate.line, candidate.phrase, "KDP says to avoid HTML tags in keyword metadata. Check this phrase before using it.");
    }
    if (/["“”]/u.test(candidate.phrase)) {
      addFinding(kdpFindings, "kdp-guidance", candidate.line, candidate.phrase, "KDP says to avoid quotation marks in keyword metadata. Check this phrase before using it.");
    }
    if (/(?:^|[^\p{L}\p{N}])(?:free|sale|#1|bestseller|latest|kdp|kindle\s+unlimited)(?![\p{L}\p{N}])/iu.test(candidate.phrase)) {
      addFinding(kdpFindings, "kdp-guidance", candidate.line, candidate.phrase, "This includes wording from a bounded KDP review prompt. The prompt is not a complete policy check or a rejection verdict.");
    }
    if (candidateWords.length === 1 || candidateWords.length > 3) {
      addFinding(localFindings, "local-prompt", candidate.line, candidate.phrase, "KDP recommends short keyword phrases of about two to three words; this phrase has a different word count.");
    }
    if (placed.has(candidateIndex)) {
      for (const word of new Set(contentWords)) {
        const sourceLines = placedWordLines.get(word) ?? new Set<number>();
        sourceLines.add(candidate.line);
        placedWordLines.set(word, sourceLines);
      }
    }
  });

  candidates.forEach((candidate, candidateIndex) => {
    if (!placed.has(candidateIndex)) return;
    const repeated = [...new Set(candidate.words.filter((word) => codePoints(word) > 2 && !FUNCTION_WORDS.has(word)))].filter(
      (word) => (placedWordLines.get(word)?.size ?? 0) > 1,
    );
    for (const word of repeated) {
      addFinding(localFindings, "local-prompt", candidate.line, candidate.phrase, `The content word "${word}" also appears in another placed phrase. KDP does not separately ban this kind of repeated word; this is an organization prompt.`);
    }
  });

  return {
    status: "built",
    planningCap: cap,
    placedCount: placed.size,
    distinctCount: candidates.length,
    fields,
    duplicates,
    needsEdit,
    unplaced,
    kdpFindings,
    localFindings,
    metadataCompared: Boolean(input.title.trim() || input.subtitle.trim() || input.categories.trim()),
  };
}
