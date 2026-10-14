/**
 * Registrable-domain reduction over the pinned Public Suffix List.
 *
 * ICANN section only. The private section would make github.io a suffix, so
 * myproject.github.io would reduce to itself and we would query a registry for a
 * name that has no registration. See stack127_docs/rdap.md.
 */

import pslData from "./data/public-suffix.json" with { type: "json" };
import { convertName } from "./punycode.ts";
import { mapLabel } from "./unicode.ts";

const normalRules = new Set(pslData.normal as string[]);
const wildcardRules = new Set(pslData.wildcards as string[]);
const exceptionRules = new Set(pslData.exceptions as string[]);

export const PSL_FETCHED_AT = pslData.fetchedAt as string;

export type SuffixResult = {
  /** The public suffix, for example "co.uk". */
  suffix: string;
  /** The registrable domain, for example "example.co.uk". Null when the input is itself a suffix. */
  registrableDomain: string | null;
  /** The label immediately left of the suffix, for example "example". */
  registrableLabel: string | null;
  /** True when the suffix was not in the list and we fell back to the last label. */
  guessed: boolean;
};

/**
 * Find the public suffix of an A-label name.
 *
 * Rule order is defined by the PSL algorithm: an exception rule wins outright, a
 * wildcard rule matches one extra label, and otherwise the longest matching
 * normal rule wins.
 */
export function publicSuffix(asciiName: string): SuffixResult {
  const labels = asciiName.toLowerCase().replace(/\.$/, "").split(".");
  // An empty label means a leading dot or two dots in a row. That is not a name,
  // and dropping the empty part would silently turn ".example.com" into a valid
  // answer. The official PSL vectors check exactly this.
  if (labels.length === 0 || labels.some((label) => label === "")) {
    return { suffix: "", registrableDomain: null, registrableLabel: null, guessed: false };
  }

  // An exception rule means the listed name is registrable, so its suffix is one label shorter.
  for (let index = 0; index < labels.length; index += 1) {
    const candidate = labels.slice(index).join(".");
    if (exceptionRules.has(candidate)) {
      const suffix = labels.slice(index + 1).join(".");
      return {
        suffix,
        registrableDomain: candidate,
        registrableLabel: labels[index],
        guessed: false,
      };
    }
  }

  let suffixLabels: number | null = null;

  for (let index = 0; index < labels.length; index += 1) {
    const candidate = labels.slice(index).join(".");
    const remaining = labels.length - index;
    if (normalRules.has(candidate)) {
      if (suffixLabels === null || remaining > suffixLabels) suffixLabels = remaining;
    }
    // A wildcard rule such as *.ck matches any single label in that position.
    if (index > 0) {
      const parent = labels.slice(index).join(".");
      if (wildcardRules.has(parent)) {
        const withWildcard = remaining + 1;
        if (suffixLabels === null || withWildcard > suffixLabels) suffixLabels = withWildcard;
      }
    }
  }

  const guessed = suffixLabels === null;
  // An unknown TLD is not automatically invalid, so fall back to the last label
  // and mark the answer as lower confidence rather than refusing to answer.
  const count = Math.min(suffixLabels ?? 1, labels.length);
  const suffix = labels.slice(labels.length - count).join(".");

  if (labels.length <= count) {
    return { suffix, registrableDomain: null, registrableLabel: null, guessed };
  }

  const registrableLabel = labels[labels.length - count - 1];
  return {
    suffix,
    registrableDomain: `${registrableLabel}.${suffix}`,
    registrableLabel,
    guessed,
  };
}

export type NormalizedInput = {
  /** What the reader typed, trimmed. */
  input: string;
  /** The name we will actually query, in A-label form. */
  domain: string;
  /** The same name in Unicode, for display. */
  unicode: string;
  /** The public suffix of the input. */
  suffix: string;
  /** The TLD, used for RDAP endpoint discovery. */
  tld: string;
  /** True when we shortened a hostname to its registrable domain. */
  reduced: boolean;
  /** True when the input contained non-ASCII and we converted it. */
  isIdn: boolean;
  /** True when the suffix was not in the pinned list. */
  guessedSuffix: boolean;
};

export class DomainInputError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/** Validate the final ASCII query before it can reach an RDAP or WHOIS server. */
export function assertValidDomainLabels(domain: string): void {
  const labels = domain.split(".");
  if (domain.length > 253 || labels.length < 2 ||
    labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)) ||
    (labels.some(label => /^xn--/i.test(label)) && convertName(domain, mapLabel).problems.length > 0)) {
    throw new DomainInputError("invalid_name", "Domain labels must use letters, numbers, or hyphens, and cannot start or end with a hyphen.");
  }
}

/**
 * Turn whatever the reader typed into the exact name we query.
 *
 * Accepts a bare name, a hostname, a URL, or an IDN. Always reports when it
 * shortened the input, because a reader who typed a hostname and gets data for a
 * different name has to be able to see why.
 */
export function normalizeDomainInput(raw: string): NormalizedInput {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) throw new DomainInputError("empty", "Enter a domain name.");
  if (trimmed.length > 2048) throw new DomainInputError("too_long", "That is too long to be a domain name.");

  let host = trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(host)) {
    try {
      host = new URL(host).hostname;
    } catch {
      throw new DomainInputError("invalid_url", "That looks like a URL but it could not be read.");
    }
  }
  // Strip anything after the hostname if the reader pasted a bare path or port.
  host = host.replace(/^[^@]*@/, "").split("/")[0].split("?")[0].split("#")[0].replace(/:\d+$/, "");
  host = host.replace(/\.$/, "");

  if (!host) throw new DomainInputError("empty", "Enter a domain name.");
  if (IPV4.test(host) || host.includes(":")) {
    throw new DomainInputError("ip_address", "That is an IP address. This tool looks up domain names.");
  }
  if (!host.includes(".")) {
    throw new DomainInputError("no_tld", "Include the ending, such as .com or .org.");
  }

  const converted = convertName(host, mapLabel);
  if (converted.problems.includes("invalid_punycode")) {
    throw new DomainInputError("invalid_name", "That name contains an encoded part that cannot be read.");
  }
  if (converted.problems.includes("disallowed_character")) {
    throw new DomainInputError("invalid_name", "That name contains a character that is not allowed in domain names.");
  }
  if (converted.problems.includes("name_too_long") || converted.problems.includes("label_too_long")) {
    throw new DomainInputError("invalid_name", "That name is longer than DNS allows.");
  }
  if (converted.problems.includes("empty_label")) {
    throw new DomainInputError("invalid_name", "That name has an empty part, which usually means two dots in a row.");
  }

  const ascii = converted.ascii;
  const found = publicSuffix(ascii);
  if (!found.registrableDomain) {
    throw new DomainInputError("suffix_only", `${ascii} is a public suffix, not a domain someone can register.`);
  }

  const reducedName = found.registrableDomain;
  assertValidDomainLabels(reducedName);
  const tld = reducedName.slice(reducedName.lastIndexOf(".") + 1);

  return {
    input: trimmed,
    domain: reducedName,
    unicode: convertName(reducedName).unicode,
    suffix: found.suffix,
    tld,
    reduced: reducedName !== ascii,
    isIdn: converted.labels.some((label) => label.converted),
    guessedSuffix: found.guessed,
  };
}
