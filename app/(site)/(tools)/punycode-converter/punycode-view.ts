import type { LabelResult } from "../../../../lib/domain/punycode.ts";
import type { CharacterDetail, ScriptAnalysis } from "../../../../lib/domain/unicode.ts";

export type AnalysedLabel = {
  label: LabelResult;
  scripts: ScriptAnalysis;
  characters: CharacterDetail[];
  octets: number;
};

export type PunycodeOutcome = {
  ascii: string;
  asciiHostname: string;
  hostnameOctets: number;
  kind: "domain" | "url";
  labels: AnalysedLabel[];
  problems: string[];
  problemText: string[];
  unicode: string;
  unicodeHostname: string;
  unicodeVersion: string;
};

export function inspectInput(raw: string) {
  const value = raw.trim();
  if (!value) throw new Error("Enter a domain name or URL.");
  if (!value.includes("://") && /^[^\s/@]+@[^\s/@]+$/.test(value)) {
    throw new Error("Enter a domain name or URL, not an email address.");
  }
  const absolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
  if (!absolute && /[/?#]/.test(value)) {
    throw new Error("Include the scheme, such as https://, when entering a full URL.");
  }
  if (!absolute) {
    const hostname = value.replace(/\.$/, "");
    return { hostname, kind: "domain" as const, reconstruct: (next: string) => next };
  }

  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error("That URL does not contain a readable hostname."); }
  if (!parsed.hostname) throw new Error("That URL does not contain a readable hostname.");

  const match = value.match(/^([a-z][a-z0-9+.-]*:\/\/)([^/?#]*)([\s\S]*)$/i);
  if (!match) throw new Error("That URL does not contain a readable hostname.");
  const [, prefix, authority, suffix] = match;
  const at = authority.lastIndexOf("@");
  const credentials = at >= 0 ? authority.slice(0, at + 1) : "";
  const hostAndPort = at >= 0 ? authority.slice(at + 1) : authority;
  if (!hostAndPort || hostAndPort.startsWith("[")) throw new Error("That URL does not contain a readable hostname.");
  const portMatch = hostAndPort.match(/(:\d+)$/);
  const port = portMatch?.[1] ?? "";
  const hostname = hostAndPort.slice(0, hostAndPort.length - port.length);
  if (!hostname) throw new Error("That URL does not contain a readable hostname.");
  return {
    hostname: hostname.replace(/\.$/, ""),
    kind: "url" as const,
    reconstruct: (next: string) => `${prefix}${credentials}${next}${port}${suffix}`,
  };
}

export function scriptAssessment(labels: Array<Pick<AnalysedLabel, "label" | "scripts">>) {
  const mixed = labels.filter((entry) => entry.scripts.mixed);
  if (!mixed.length) return "No label mixes writing systems. This does not clear same-script or ASCII lookalikes.";
  if (mixed.length === 1) {
    const [entry] = mixed;
    return `The label ${entry.label.unicode} mixes ${entry.scripts.scripts.join(" and ")}. Inspect its characters. This does not prove spoofing.`;
  }
  const details = mixed.map((entry) => `${entry.label.unicode} (${entry.scripts.scripts.join(" and ")})`).join("; ");
  return `The labels ${details} mix writing systems. Inspect their characters. This does not prove spoofing.`;
}

export function labelRows(labels: Array<Pick<AnalysedLabel, "label" | "octets" | "scripts">>) {
  return labels.map((entry, index) => ({
    ascii: entry.label.ascii,
    conversion: entry.label.converted ? "Converted" : "Unchanged",
    id: `label-${index + 1}`,
    label: `Label ${index + 1}`,
    length: `${entry.octets} of 63 bytes`,
    overLimit: entry.octets > 63,
    scripts: entry.scripts.scripts.length ? entry.scripts.scripts.join(", ") : "No script characters",
    unicode: entry.label.unicode,
  }));
}

export function characterRows(labels: AnalysedLabel[]) {
  return labels.flatMap((entry, labelIndex) => entry.characters.map((character, characterIndex) => {
    const differsFromLatin = entry.scripts.latinMixedWithOther
      && !["Latin", "Common", "Inherited"].includes(character.script);
    return {
      character: character.character,
      codePoint: character.codePoint,
      id: `${labelIndex}-${characterIndex}`,
      name: character.name,
      position: `Label ${labelIndex + 1}, character ${characterIndex + 1}`,
      script: `${character.script}${differsFromLatin ? ". Differs from Latin in this label" : ""}`,
    };
  }));
}
