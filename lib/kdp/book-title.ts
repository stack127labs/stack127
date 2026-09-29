import { KDP_TITLE_SUBTITLE_LIMIT } from "./metadata.ts";

export type KdpBookTitleInput = Readonly<{
  title: string;
  subtitle: string;
  topic: string;
  intendedReader: string;
  targetPhrases: string;
}>;

export type KdpBookTitleField = keyof KdpBookTitleInput;
export type KdpBookTitleFieldErrors = Partial<Record<KdpBookTitleField, string>>;

export type KdpBookTitleTermComparison = Readonly<{
  source: "topic" | "reader";
  found: readonly string[];
  onlyInContext: readonly string[];
}>;

export type KdpBookTitlePhraseMatch = Readonly<{
  line: number;
  phrase: string;
  status: "title" | "subtitle" | "both" | "not-found";
}>;

export type KdpBookTitlePrompt = Readonly<{
  field: "title" | "subtitle" | "both";
  text: string;
  message: string;
  kind: "wording" | "kdp-guidance";
}>;

export type KdpBookTitleResult =
  | Readonly<{ status: "invalid"; fieldErrors: KdpBookTitleFieldErrors }>
  | Readonly<{
      status: "reviewed";
      partial: boolean;
      comparisons: readonly KdpBookTitleTermComparison[];
      phraseMatches: readonly KdpBookTitlePhraseMatch[];
      titleCharacters: number;
      subtitleCharacters: number;
      combinedCharacters: number;
      titleWords: number;
      subtitleWords: number;
      lengthState: "under" | "ambiguous" | "over";
      prompts: readonly KdpBookTitlePrompt[];
    }>;

const FUNCTION_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into", "is", "it", "of", "on", "or", "that", "the", "this", "to", "was", "were", "with",
]);

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/gu, "\n");
}

function codePoints(value: string): number {
  return Array.from(value).length;
}

function tokens(value: string): string[] {
  return normalizeLineEndings(value).replace(/<\/?[a-z][^>]*>/giu, " ").normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function phraseContains(haystack: readonly string[], needle: readonly string[]): boolean {
  if (!needle.length || needle.length > haystack.length) return false;
  for (let start = 0; start <= haystack.length - needle.length; start += 1) {
    if (needle.every((word, offset) => haystack[start + offset] === word)) return true;
  }
  return false;
}

function fieldError(input: KdpBookTitleInput): KdpBookTitleFieldErrors {
  const errors: KdpBookTitleFieldErrors = {};
  for (const key of ["title", "subtitle", "topic", "intendedReader", "targetPhrases"] as const) {
    if (typeof input?.[key] !== "string") errors[key] = "Enter text in this field.";
  }
  if (Object.keys(errors).length) return errors;

  if (!input.title.trim()) errors.title = "Enter a book title.";
  if (codePoints(input.title) > 500) errors.title = "Keep the title at 500 characters or fewer for this local tool.";
  if (codePoints(input.subtitle) > 500) errors.subtitle = "Keep the subtitle at 500 characters or fewer for this local tool.";
  if (codePoints(input.topic) > 500) errors.topic = "Keep the book topic at 500 characters or fewer.";
  if (codePoints(input.intendedReader) > 200) errors.intendedReader = "Keep the intended reader at 200 characters or fewer.";

  const phraseLines = normalizeLineEndings(input.targetPhrases).split("\n").filter((line) => line.trim());
  if (phraseLines.length > 3) errors.targetPhrases = "Enter no more than three target phrases, one per line.";
  else if (phraseLines.some((line) => codePoints(line) > 80)) errors.targetPhrases = "Keep each target phrase at 80 characters or fewer.";
  else if (phraseLines.some((line) => !/[\p{L}\p{N}]/u.test(line))) errors.targetPhrases = "Each target phrase needs at least one letter or number.";
  else {
    const seen = new Set<string>();
    for (const line of phraseLines) {
      const key = tokens(line).join(" ");
      if (!key || seen.has(key)) {
        errors.targetPhrases = "Remove duplicate target phrases or any phrase without a letter or number.";
        break;
      }
      seen.add(key);
    }
  }
  return errors;
}

function contextComparison(source: "topic" | "reader", value: string, draftTerms: Set<string>): KdpBookTitleTermComparison | null {
  if (!value.trim()) return null;
  const terms = unique(tokens(value).filter((term) => !FUNCTION_WORDS.has(term)));
  return {
    source,
    found: terms.filter((term) => draftTerms.has(term)),
    onlyInContext: terms.filter((term) => !draftTerms.has(term)),
  };
}

function repeatedWords(value: string, field: "title" | "subtitle"): KdpBookTitlePrompt[] {
  const found: KdpBookTitlePrompt[] = [];
  const wordList = tokens(value);
  for (let index = 1; index < wordList.length; index += 1) {
    if (wordList[index] === wordList[index - 1]) {
      found.push({ field, text: wordList[index], kind: "wording", message: `The word "${wordList[index]}" repeats immediately in the ${field}.` });
    }
  }
  return found;
}

function twoWordSequences(value: string): string[] {
  const wordList = tokens(value);
  const found: string[] = [];
  for (let index = 0; index + 1 < wordList.length; index += 1) {
    const pair = wordList.slice(index, index + 2);
    if (pair.some((word) => !FUNCTION_WORDS.has(word))) found.push(pair.join(" "));
  }
  return found;
}

export function reviewKdpBookTitle(input: KdpBookTitleInput): KdpBookTitleResult {
  const errors = fieldError(input);
  if (Object.keys(errors).length) return { status: "invalid", fieldErrors: errors };

  const title = normalizeLineEndings(input.title);
  const subtitle = normalizeLineEndings(input.subtitle);
  const titleWords = tokens(title);
  const subtitleWords = tokens(subtitle);
  const draftTerms = new Set([...titleWords, ...subtitleWords]);
  const comparisons = [
    contextComparison("topic", input.topic, draftTerms),
    contextComparison("reader", input.intendedReader, draftTerms),
  ].filter((item): item is KdpBookTitleTermComparison => item !== null);
  const phraseLines = normalizeLineEndings(input.targetPhrases).split("\n");
  const phraseMatches = phraseLines.flatMap((phrase, index) => {
    if (!phrase.trim()) return [];
    const phraseTokens = tokens(phrase);
    const inTitle = phraseContains(titleWords, phraseTokens);
    const inSubtitle = phraseContains(subtitleWords, phraseTokens);
    return [{
      line: index + 1,
      phrase,
      status: inTitle && inSubtitle ? "both" as const : inTitle ? "title" as const : inSubtitle ? "subtitle" as const : "not-found" as const,
    }];
  });

  const titleCharacters = codePoints(title);
  const subtitleCharacters = codePoints(subtitle);
  const combinedCharacters = titleCharacters + subtitleCharacters + (title.trim() && subtitle.trim() ? 1 : 0);
  const lengthState = combinedCharacters < KDP_TITLE_SUBTITLE_LIMIT
    ? "under"
    : combinedCharacters === KDP_TITLE_SUBTITLE_LIMIT ? "ambiguous" : "over";
  const prompts: KdpBookTitlePrompt[] = [
    ...repeatedWords(title, "title"),
    ...repeatedWords(subtitle, "subtitle"),
  ];
  const titlePairs = new Set(twoWordSequences(title));
  const repeatedPairs = unique(twoWordSequences(subtitle).filter((pair) => titlePairs.has(pair)));
  for (const pair of repeatedPairs) {
    prompts.push({ field: "both", text: pair, kind: "wording", message: `The phrase "${pair}" appears in both the title and subtitle.` });
  }

  if (/<\/?[a-z][^>]*>/iu.test(title)) {
    prompts.push({ field: "title", text: "HTML-like tag", kind: "kdp-guidance", message: "KDP's book-details guidance says title and subtitle fields should not contain HTML tags." });
  }
  if (/<\/?[a-z][^>]*>/iu.test(subtitle)) {
    prompts.push({ field: "subtitle", text: "HTML-like tag", kind: "kdp-guidance", message: "KDP's book-details guidance says title and subtitle fields should not contain HTML tags." });
  }
  if (title.trim() && !/[\p{L}\p{N}]/u.test(title)) {
    prompts.push({ field: "title", text: title, kind: "kdp-guidance", message: "KDP's title guidance says the title must contain at least one letter or number." });
  }
  if (lengthState === "ambiguous") {
    prompts.push({ field: "both", text: "200 characters", kind: "kdp-guidance", message: "KDP's official pages disagree at 200 characters, and its counting method is unpublished. The existing metadata checker follows the stricter under-200 guidance; 199 or fewer avoids this local boundary prompt." });
  } else if (lengthState === "over") {
    prompts.push({ field: "both", text: `${combinedCharacters} characters`, kind: "kdp-guidance", message: "This local count is above both published numerical boundaries. KDP's counting method is unpublished, so confirm the fields in KDP." });
  }

  return {
    status: "reviewed",
    partial: !input.topic.trim() && !input.intendedReader.trim() && !input.targetPhrases.trim(),
    comparisons,
    phraseMatches,
    titleCharacters,
    subtitleCharacters,
    combinedCharacters,
    titleWords: titleWords.length,
    subtitleWords: subtitleWords.length,
    lengthState,
    prompts,
  };
}
