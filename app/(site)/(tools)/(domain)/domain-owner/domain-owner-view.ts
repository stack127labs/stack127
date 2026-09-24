import { declaresRedaction, parseRedactions } from "../../../../../lib/domain/redaction.ts";
import type {
  DomainEntity,
  DomainRegistration,
  RdapFetch,
  RdapFetchStatus,
  RdapSource,
} from "../../../../../lib/domain/types.ts";

const ROLE_LABELS: Record<string, string> = {
  registrant: "Registrant",
  administrative: "Administrative contact",
  technical: "Technical contact",
  billing: "Billing contact",
  abuse: "Abuse contact",
  registrar: "Registrar",
};

const ROLE_ORDER = Object.keys(ROLE_LABELS);

const sourceLabel = (source: RdapSource) => source === "registrar" ? "Registrar" : "Registry";

function mergedSource(sources: Set<RdapSource>) {
  return sources.size > 1 ? "Registry and registrar" : sourceLabel([...sources][0] ?? "registry");
}

function rolesLabel(entity: DomainEntity) {
  return [...new Set(entity.roles)]
    .sort((a, b) => {
      const aIndex = ROLE_ORDER.indexOf(a);
      const bIndex = ROLE_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .map((role) => ROLE_LABELS[role] ?? role)
    .join(", ") || "Contact";
}

function registrants(result: DomainRegistration) {
  return result.entities.filter((entity) => entity.roles.includes("registrant"));
}

function identityValues(result: DomainRegistration) {
  return [...new Set(registrants(result).map((entity) => entity.organization ?? entity.name)
    .filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))];
}

function failureDetail(status: RdapFetchStatus, tld: string) {
  if (status === "no_service") return `stack127 has no known RDAP service for .${tld}.`;
  if (status === "rate_limited") return "The registry limited this request. Try again shortly.";
  if (status === "blocked") return "The registry refused this request. Try again shortly.";
  if (status === "timeout") return "The registry did not answer in time. Try again.";
  return "The registry did not return a usable answer. Try again.";
}

export function isRegistrarHopIncomplete(result: DomainRegistration) {
  if (result.registrarFetch) return result.registrarFetch.status !== "registered";
  return Boolean(result.registrar.name || result.registrar.ianaId || result.registrar.rdapUrl);
}

function declaredSources(result: DomainRegistration) {
  return [
    result.registryFetch && declaresRedaction(result.registryFetch.body) ? "Registry" : null,
    result.registrarFetch && declaresRedaction(result.registrarFetch.body) ? "Registrar" : null,
  ].filter((value): value is "Registry" | "Registrar" => Boolean(value));
}

export function ownerVerdict(result: DomainRegistration) {
  if (result.status === "not_registered") {
    return {
      detail: `${result.query.unicode} has no current registry record, so it has no current registrant.`,
      value: "No registrant",
    };
  }
  if (result.status !== "registered") {
    return { detail: failureDetail(result.status, result.query.tld), value: "Cannot determine" };
  }

  const identities = identityValues(result);
  if (identities.length > 1) {
    return {
      detail: `The available responses for ${result.query.unicode} disagree about the public registrant identity. Public registration data does not prove who operates the site.`,
      value: "Published",
    };
  }
  if (identities.length === 1) {
    return {
      detail: `${result.query.unicode} publishes ${identities[0]} as the public registrant. This public record does not prove that it operates the site.`,
      value: "Published",
    };
  }
  if (isRegistrarHopIncomplete(result)) {
    const registrarState = result.registrarFetch
      ? "the registrar response could not be retrieved"
      : "no registrar response was advertised";
    return {
      detail: `The registry returned no public registrant identity for ${result.query.unicode}, and ${registrarState}. Retry before treating the data as unpublished.`,
      value: "Cannot determine",
    };
  }

  const declared = declaredSources(result);
  if (declared.length) {
    const providers = declared.length === 2 ? "The registry and registrar declared redaction" : `${declared[0]} declared redaction`;
    return {
      detail: `No public registrant identity was returned for ${result.query.unicode}. ${providers}, but that does not explain every absent field.`,
      value: "Not published",
    };
  }
  return {
    detail: `No public registrant identity was returned for ${result.query.unicode}, and the available responses did not declare why.`,
    value: "Not published",
  };
}

export type ContactRoute = {
  kind: "registrant-form" | "registrant-email" | "abuse-email" | "abuse-phone";
  label: string;
  source: string;
  value: string;
};

function addRoute(
  routes: Map<string, ContactRoute & { sources: Set<RdapSource> }>,
  route: Omit<ContactRoute, "source">,
  source: RdapSource,
) {
  const key = route.value.trim().toLowerCase();
  if (!key) return;
  const existing = routes.get(key);
  if (existing) {
    existing.sources.add(source);
    existing.source = mergedSource(existing.sources);
    return;
  }
  routes.set(key, { ...route, source: sourceLabel(source), sources: new Set([source]) });
}

export function contactRoutes(result: DomainRegistration): ContactRoute[] {
  const routes = new Map<string, ContactRoute & { sources: Set<RdapSource> }>();
  for (const entity of result.entities.filter((item) => !item.roles.includes("registrar") && !item.roles.includes("abuse"))) {
    if (entity.email) addRoute(routes, { kind: "registrant-email", label: `${rolesLabel(entity)} email`, value: entity.email }, entity.source);
    if (entity.contactUri) addRoute(routes, { kind: "registrant-form", label: `${rolesLabel(entity)} contact form`, value: entity.contactUri }, entity.source);
  }

  const abuseEntities = result.entities.filter((entity) => entity.roles.includes("abuse"));
  if (result.registrar.abuseEmail) {
    const source = abuseEntities.find((entity) => entity.email === result.registrar.abuseEmail)?.source ?? "registry";
    addRoute(routes, { kind: "abuse-email", label: "Registrar abuse email", value: result.registrar.abuseEmail }, source);
  }
  if (result.registrar.abusePhone) {
    const source = abuseEntities.find((entity) => entity.phone === result.registrar.abusePhone)?.source ?? "registry";
    addRoute(routes, { kind: "abuse-phone", label: "Registrar abuse phone", value: result.registrar.abusePhone }, source);
  }
  return [...routes.values()].map(({ sources: _sources, ...route }) => route);
}

function visibleFields(entity: DomainEntity) {
  const fields = entity.fields.filter((field) => field.value.trim()).map((field) => ({ ...field, value: field.value.trim() }));
  const add = (label: string, value: string | null) => {
    if (value?.trim() && !fields.some((field) => field.label === label && field.value === value.trim())) {
      fields.push({ label, value: value.trim() });
    }
  };
  add("Name", entity.name);
  add("Organization", entity.organization);
  add("State or province", entity.stateProvince);
  add("Country", entity.country);
  return fields;
}

export type PublishedRegistrantRow = { field: string; role: string; source: string; value: string };

export function publishedRegistrantRows(result: DomainRegistration): PublishedRegistrantRow[] {
  const routedValues = new Set(contactRoutes(result).map((route) => route.value.trim().toLowerCase()));
  const merged = new Map<string, PublishedRegistrantRow & { sources: Set<RdapSource> }>();
  for (const entity of result.entities) {
    const role = rolesLabel(entity);
    for (const field of visibleFields(entity)) {
      if (routedValues.has(field.value.toLowerCase())) continue;
      const key = `${role}\u0000${field.label}\u0000${field.value}`;
      const existing = merged.get(key);
      if (existing) {
        existing.sources.add(entity.source);
        existing.source = mergedSource(existing.sources);
      } else {
        merged.set(key, { role, field: field.label, value: field.value, source: sourceLabel(entity.source), sources: new Set([entity.source]) });
      }
    }
  }
  return [...merged.values()].map(({ sources: _sources, ...row }) => row);
}

export type SourcedRedaction = ReturnType<typeof parseRedactions>[number] & { source: "Registry" | "Registrar" };

export function redactionRows(result: DomainRegistration): SourcedRedaction[] {
  const rows = ([
    { fetch: result.registryFetch, source: "Registry" },
    { fetch: result.registrarFetch, source: "Registrar" },
  ] as const).flatMap(({ fetch, source }) => fetch ? parseRedactions(fetch.body).map((row) => ({ ...row, source })) : []);
  const unique = new Map<string, SourcedRedaction>();
  for (const row of rows) {
    const key = `${row.source}\u0000${row.field}\u0000${row.method}\u0000${row.explanation}`;
    if (!unique.has(key)) unique.set(key, row);
  }
  return [...unique.values()];
}

export function redactionDeclarationOnly(result: DomainRegistration) {
  if (redactionRows(result).length) return false;
  return Boolean(result.registryFetch && declaresRedaction(result.registryFetch.body))
    || Boolean(result.registrarFetch && declaresRedaction(result.registrarFetch.body));
}

export function sourceHost(fetch: RdapFetch | null) {
  if (!fetch?.url) return null;
  try { return new URL(fetch.url).host; } catch { return null; }
}

export function formatOwnerDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC", year: "numeric" });
}

export function filteredOwnerNotes(result: DomainRegistration) {
  const duplicate = new Set([
    `We looked up ${result.query.domain}, which is the registrable part of what you entered.`,
    "This ending is not in our copy of the public suffix list, so the registrable part is a best guess.",
    "We could not read the registrar's own record, so contact details and the registrar expiry date are missing.",
  ]);
  return result.notes.filter((note) => !duplicate.has(note));
}
