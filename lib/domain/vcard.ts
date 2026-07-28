/**
 * jCard (RFC 7095) parsing.
 *
 * RDAP entities carry contacts as `vcardArray`, a nested array format. Naive
 * property access produces wrong labels, and the redaction rules depend on
 * telling "absent" apart from "present but emptied", so this has to be exact.
 */

import type { ContactField, DomainEntity, RdapSource } from "./types.ts";

type JCardProperty = [string, Record<string, unknown>, string, unknown];

function properties(vcardArray: unknown): JCardProperty[] {
  if (!Array.isArray(vcardArray) || vcardArray[0] !== "vcard") return [];
  const entries = vcardArray[1];
  if (!Array.isArray(entries)) return [];
  return entries.filter(
    (entry): entry is JCardProperty => Array.isArray(entry) && typeof entry[0] === "string" && entry.length >= 4,
  );
}

function textOf(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    const joined = value.filter((part) => typeof part === "string" && part.trim()).join(", ");
    return joined || null;
  }
  return null;
}

const ADR_LABELS = [
  "Post office box",
  "Extended address",
  "Street",
  "City",
  "State or province",
  "Postal code",
  "Country",
];

const FIELD_LABELS: Record<string, string> = {
  fn: "Name",
  org: "Organization",
  email: "Email",
  tel: "Phone",
  url: "Website",
  title: "Title",
  role: "Role",
  "contact-uri": "Contact form",
  lang: "Language",
};

export function parseEntity(raw: unknown, source: RdapSource): DomainEntity | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { roles?: unknown; handle?: unknown; vcardArray?: unknown };
  const roles = Array.isArray(entity.roles) ? entity.roles.filter((role): role is string => typeof role === "string") : [];
  const props = properties(entity.vcardArray);

  const find = (name: string) => props.find((property) => property[0] === name);
  const fields: ContactField[] = [];

  let country: string | null = null;
  let stateProvince: string | null = null;

  for (const [name, parameters, , value] of props) {
    if (name === "version") continue;
    if (name === "adr") {
      // The seven part address. Positions can be emptied independently, and the
      // cc parameter often survives when the address itself does not.
      const parts = Array.isArray(value) ? value : [];
      const cc = parameters && typeof parameters === "object" ? (parameters as { cc?: unknown }).cc : undefined;
      if (typeof cc === "string" && cc.trim()) country = cc.trim().toUpperCase();
      parts.forEach((part, index) => {
        const text = textOf(part);
        if (!text) return;
        if (index === 4) stateProvince = text;
        if (index === 6 && !country) country = text;
        fields.push({ label: ADR_LABELS[index] ?? `Address part ${index + 1}`, value: text });
      });
      continue;
    }
    const text = textOf(value);
    if (!text) continue;
    fields.push({ label: FIELD_LABELS[name] ?? name, value: text });
  }

  const nameValue = textOf(find("fn")?.[3]);
  const orgValue = textOf(find("org")?.[3]);

  return {
    roles,
    handle: typeof entity.handle === "string" ? entity.handle : null,
    name: nameValue,
    organization: orgValue,
    email: textOf(find("email")?.[3]),
    phone: textOf(find("tel")?.[3]),
    country,
    stateProvince,
    contactUri: textOf(find("contact-uri")?.[3]),
    fields,
    source,
  };
}

/** Entities nest: an abuse contact usually sits inside the registrar entity. */
export function collectEntities(raw: unknown, source: RdapSource, depth = 0): DomainEntity[] {
  if (!Array.isArray(raw) || depth > 3) return [];
  const collected: DomainEntity[] = [];
  for (const item of raw) {
    const parsed = parseEntity(item, source);
    if (parsed) collected.push(parsed);
    if (item && typeof item === "object") {
      collected.push(...collectEntities((item as { entities?: unknown }).entities, source, depth + 1));
    }
  }
  return collected;
}

export function findByRole(entities: DomainEntity[], role: string) {
  return entities.find((entity) => entity.roles.includes(role)) ?? null;
}
