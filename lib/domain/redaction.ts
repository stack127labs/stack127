/**
 * RFC 9537 redaction parsing.
 *
 * The registrar publishes a machine readable list of what it withheld and how.
 * That is the most useful thing on the registrant page, because it lets us show
 * exactly what exists but is not public instead of a wall of "REDACTED".
 *
 * We match on the declared field name and never evaluate the JSONPath
 * expressions. They are documentation of intent, not something to run.
 */

import type { RedactedField, RedactionMethod } from "./types.ts";

const METHOD_TEXT: Record<RedactionMethod, string> = {
  removal: "The field was taken out of the record completely.",
  emptyValue: "The field is still there but its value was blanked.",
  replacementValue: "The real value was swapped for a stand-in, usually a contact form or a relay address.",
  partialValue: "Part of the value was kept and the rest was hidden.",
  unknown: "The registrar withheld this but did not say how.",
};

function methodOf(value: unknown): RedactionMethod {
  if (value === "removal" || value === "emptyValue" || value === "replacementValue" || value === "partialValue") {
    return value;
  }
  return "unknown";
}

/** Turn "Registrant Postal Code" into something a person would say. */
function readableField(name: string) {
  return name
    .replace(/^Registry /, "")
    .replace(/^Registrar /, "")
    .replace(/\bID\b/, "ID")
    .trim();
}

export function parseRedactions(body: unknown): RedactedField[] {
  if (!body || typeof body !== "object") return [];
  const redacted = (body as { redacted?: unknown }).redacted;
  if (!Array.isArray(redacted)) return [];

  const fields: RedactedField[] = [];
  for (const entry of redacted) {
    if (!entry || typeof entry !== "object") continue;
    const name = (entry as { name?: unknown }).name;
    let label: string | null = null;
    if (name && typeof name === "object") {
      const typed = name as { type?: unknown; description?: unknown };
      if (typeof typed.type === "string") label = typed.type;
      else if (typeof typed.description === "string") label = typed.description;
    }
    if (!label) continue;
    const method = methodOf((entry as { method?: unknown }).method);
    fields.push({ field: readableField(label), method, explanation: METHOD_TEXT[method] });
  }
  return fields;
}

/** True when the response declares RFC 9537 conformance, even with an empty list. */
export function declaresRedaction(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const conformance = (body as { rdapConformance?: unknown }).rdapConformance;
  if (Array.isArray(conformance) && conformance.includes("redacted")) return true;
  return Array.isArray((body as { redacted?: unknown }).redacted);
}
