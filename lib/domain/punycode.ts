/**
 * RFC 3492 Punycode plus UTS-46 processing.
 *
 * Implemented here rather than pulled from a package because Node's `punycode`
 * module is deprecated, browsers expose ToASCII through `new URL()` but have no
 * reverse, and both the domain engine and the converter page need the same
 * behavior against the same pinned Unicode version.
 *
 * The UTS-46 mapping table is complete, not a practical subset. A partial table
 * is indistinguishable from a full one on ordinary input and silently wrong on
 * exactly the adversarial input this is used to examine.
 */

const BASE = 36;
const TMIN = 1;
const TMAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const DELIMITER = "-";
const PREFIX = "xn--";

export const MAX_LABEL_OCTETS = 63;
export const MAX_NAME_OCTETS = 253;

function adapt(delta: number, numPoints: number, firstTime: boolean) {
  let scaled = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
  scaled += Math.floor(scaled / numPoints);
  let k = 0;
  while (scaled > ((BASE - TMIN) * TMAX) >> 1) {
    scaled = Math.floor(scaled / (BASE - TMIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - TMIN + 1) * scaled) / (scaled + SKEW));
}

function digitToBasic(digit: number) {
  // 0..25 map to a..z, 26..35 map to 0..9
  return digit + 22 + (digit < 26 ? 75 : 0);
}

function basicToDigit(codePoint: number) {
  if (codePoint >= 0x30 && codePoint <= 0x39) return codePoint - 0x30 + 26;
  if (codePoint >= 0x41 && codePoint <= 0x5a) return codePoint - 0x41;
  if (codePoint >= 0x61 && codePoint <= 0x7a) return codePoint - 0x61;
  return BASE;
}

export class PunycodeError extends Error {}

/** Encode one Unicode label to its punycode body, without the xn-- prefix. */
export function punycodeEncode(input: string): string {
  const codePoints = Array.from(input, (character) => character.codePointAt(0) as number);
  const basic = codePoints.filter((point) => point < 0x80);
  const output = basic.map((point) => String.fromCodePoint(point));
  let handled = basic.length;
  const basicLength = handled;
  if (basicLength > 0) output.push(DELIMITER);

  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;

  while (handled < codePoints.length) {
    let m = Number.MAX_SAFE_INTEGER;
    for (const point of codePoints) if (point >= n && point < m) m = point;
    if (m - n > Math.floor((Number.MAX_SAFE_INTEGER - delta) / (handled + 1))) {
      throw new PunycodeError("This label is too complex to encode.");
    }
    delta += (m - n) * (handled + 1);
    n = m;

    for (const point of codePoints) {
      if (point < n) delta += 1;
      if (point !== n) continue;
      let q = delta;
      for (let k = BASE; ; k += BASE) {
        const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
        if (q < t) break;
        output.push(String.fromCodePoint(digitToBasic(t + ((q - t) % (BASE - t)))));
        q = Math.floor((q - t) / (BASE - t));
      }
      output.push(String.fromCodePoint(digitToBasic(q)));
      bias = adapt(delta, handled + 1, handled === basicLength);
      delta = 0;
      handled += 1;
    }
    delta += 1;
    n += 1;
  }

  return output.join("");
}

/** Decode one punycode body, without the xn-- prefix, back to Unicode. */
export function punycodeDecode(input: string): string {
  const output: number[] = [];
  const lastDelimiter = input.lastIndexOf(DELIMITER);
  let index = 0;

  if (lastDelimiter > 0) {
    for (let i = 0; i < lastDelimiter; i += 1) {
      const codePoint = input.charCodeAt(i);
      if (codePoint >= 0x80) throw new PunycodeError("This label mixes non-ASCII characters into a punycode body.");
      output.push(codePoint);
    }
    index = lastDelimiter + 1;
  }

  let n = INITIAL_N;
  let i = 0;
  let bias = INITIAL_BIAS;

  while (index < input.length) {
    const previous = i;
    let w = 1;
    for (let k = BASE; ; k += BASE) {
      if (index >= input.length) throw new PunycodeError("This punycode label ends part way through a character.");
      const digit = basicToDigit(input.charCodeAt(index));
      index += 1;
      if (digit >= BASE) throw new PunycodeError("This punycode label contains a character that is not valid punycode.");
      if (digit > Math.floor((Number.MAX_SAFE_INTEGER - i) / w)) throw new PunycodeError("This punycode label overflows.");
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) break;
      if (w > Math.floor(Number.MAX_SAFE_INTEGER / (BASE - t))) throw new PunycodeError("This punycode label overflows.");
      w *= BASE - t;
    }
    const outLength = output.length + 1;
    bias = adapt(i - previous, outLength, previous === 0);
    if (Math.floor(i / outLength) > Number.MAX_SAFE_INTEGER - n) throw new PunycodeError("This punycode label overflows.");
    n += Math.floor(i / outLength);
    i %= outLength;
    if (n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) {
      throw new PunycodeError("This punycode label decodes to a code point that cannot exist.");
    }
    output.splice(i, 0, n);
    i += 1;
  }

  return String.fromCodePoint(...output);
}

export function octetLength(value: string) {
  return new TextEncoder().encode(value).length;
}

export type LabelProblem =
  | "empty_label"
  | "label_too_long"
  | "name_too_long"
  | "leading_hyphen"
  | "trailing_hyphen"
  | "hyphen_third_fourth"
  | "invalid_punycode"
  | "punycode_not_canonical"
  | "disallowed_character"
  | "leading_combining_mark";

export type LabelResult = {
  unicode: string;
  ascii: string;
  converted: boolean;
  problems: LabelProblem[];
};

/**
 * Mechanical label rules that hold regardless of Unicode version. These catch the
 * malformed-punycode cases that a mapping table alone will not.
 */
function mechanicalProblems(unicode: string, ascii: string): LabelProblem[] {
  const problems: LabelProblem[] = [];
  if (!ascii) return ["empty_label"];
  if (octetLength(ascii) > MAX_LABEL_OCTETS) problems.push("label_too_long");
  if (unicode.startsWith("-")) problems.push("leading_hyphen");
  if (unicode.endsWith("-")) problems.push("trailing_hyphen");
  // Positions 3 and 4 are reserved for tagged labels such as xn--.
  if (unicode.length > 4 && unicode[2] === "-" && unicode[3] === "-" && !unicode.toLowerCase().startsWith(PREFIX)) {
    problems.push("hyphen_third_fourth");
  }
  return problems;
}

/**
 * Convert one label in whichever direction it needs, and report what is wrong
 * with it. Never throws: a broken label comes back with problems attached so the
 * page can show the rest of the name.
 */
export function convertLabel(
  label: string,
  map?: (input: string) => { output: string; disallowed: boolean },
  validate?: (decoded: string) => { disallowed: boolean },
): LabelResult {
  const lower = label.toLowerCase();

  if (lower.startsWith(PREFIX)) {
    try {
      const unicode = punycodeDecode(lower.slice(PREFIX.length));
      const problems = mechanicalProblems(unicode, lower);
      // A canonical A-label re-encodes to itself. Anything else is malformed
      // punycode that happens to decode to something plausible.
      const reencoded = `${PREFIX}${punycodeEncode(unicode)}`;
      if (reencoded !== lower) problems.push("punycode_not_canonical");
      // Decoding is not validation. "xn--abc" is perfectly canonical punycode for
      // three C1 control characters, so the decoded text has to be checked against
      // UTS-46 as well or a hostile label passes as clean.
      if (validate && validate(unicode).disallowed) problems.push("disallowed_character");
      if (/^\p{Mn}|^\p{Mc}/u.test(unicode)) problems.push("leading_combining_mark");
      return { unicode, ascii: lower, converted: true, problems };
    } catch {
      return { unicode: label, ascii: lower, converted: false, problems: ["invalid_punycode"] };
    }
  }

  const mapped = map ? map(label) : { output: label, disallowed: false };
  const normalized = mapped.output.normalize("NFC");
  const extra: LabelProblem[] = [];
  if (mapped.disallowed) extra.push("disallowed_character");
  // A label may not start with a combining mark.
  if (/^\p{Mn}|^\p{Mc}/u.test(normalized)) extra.push("leading_combining_mark");

  if (/^[\x00-\x7f]*$/.test(normalized)) {
    const ascii = normalized.toLowerCase();
    return { unicode: normalized, ascii, converted: false, problems: [...mechanicalProblems(normalized, ascii), ...extra] };
  }

  try {
    const ascii = `${PREFIX}${punycodeEncode(normalized)}`;
    return { unicode: normalized, ascii, converted: true, problems: [...mechanicalProblems(normalized, ascii), ...extra] };
  } catch {
    return { unicode: normalized, ascii: label, converted: false, problems: [...extra, "invalid_punycode"] };
  }
}

export type NameResult = {
  unicode: string;
  ascii: string;
  labels: LabelResult[];
  problems: LabelProblem[];
};

/** Convert a whole dotted name. Trailing dots are preserved as a root marker. */
export function convertName(
  input: string,
  map?: (label: string) => { output: string; disallowed: boolean },
  validate?: (decoded: string) => { disallowed: boolean },
): NameResult {
  const trimmed = input.trim().replace(/\.$/, "");
  // When a mapper is supplied it doubles as the validator for decoded A-labels,
  // so callers cannot accidentally validate one direction and not the other.
  const validator = validate ?? map;
  const labels = trimmed.split(".").map((label) => convertLabel(label, map, validator));
  const ascii = labels.map((label) => label.ascii).join(".");
  const unicode = labels.map((label) => label.unicode).join(".");
  const problems = [...new Set(labels.flatMap((label) => label.problems))];
  if (octetLength(ascii) > MAX_NAME_OCTETS) problems.push("name_too_long");
  return { unicode, ascii, labels, problems };
}

export const LABEL_PROBLEM_TEXT: Record<LabelProblem, string> = {
  empty_label: "One part of the name is empty, which usually means there are two dots in a row.",
  label_too_long: "One part of the name is longer than the 63 byte limit DNS allows.",
  name_too_long: "The whole name is longer than the 253 byte limit DNS allows.",
  leading_hyphen: "A part of the name starts with a hyphen, which is not allowed.",
  trailing_hyphen: "A part of the name ends with a hyphen, which is not allowed.",
  hyphen_third_fourth: "A part of the name has hyphens in the third and fourth positions, which is reserved for encoded labels.",
  invalid_punycode: "This is not valid punycode, so it cannot be decoded.",
  punycode_not_canonical: "This punycode decodes, but re-encoding the result does not give the same text back. That is a sign of a hand-made or damaged label.",
  disallowed_character: "This contains a character that is not allowed in domain names.",
  leading_combining_mark: "A part of the name starts with a combining mark, which is not allowed.",
};
