import type { DomainEntity, DomainRegistration, RdapSource } from "../../../../lib/domain/types.ts";

type RegistrarCandidate = { id: string | null; name: string | null; source: RdapSource };

function sourceLabel(source: RdapSource) {
  return source === "registry" ? "Registry" : "Registrar";
}

function candidates(result: DomainRegistration): RegistrarCandidate[] {
  const found = result.entities
    .filter((entity) => entity.roles.includes("registrar"))
    .map((entity) => ({ id: entity.handle, name: entity.name ?? entity.organization, source: entity.source }));
  if (found.length) return found;
  if (result.registrar.name || result.registrar.ianaId) {
    return [{ id: result.registrar.ianaId, name: result.registrar.name, source: "registry" }];
  }
  return [];
}

export function registrarIdentity(result: DomainRegistration) {
  if (result.status === "not_registered") {
    return { conflict: false, detail: `${result.query.unicode} has no current registry record.`, id: null, name: null, source: null, value: "No registrar" };
  }
  if (result.status !== "registered") {
    const reason = result.status === "no_service"
      ? `stack127 has no lookup service it can use for .${result.query.tld}.`
      : result.status === "timeout"
        ? "The registry did not answer in time. Try again."
        : result.status === "rate_limited" || result.status === "blocked"
          ? "The registry did not accept this request. Try again shortly."
          : "The registry did not return a usable answer. Try again.";
    return { conflict: false, detail: reason, id: null, name: null, source: null, value: "Cannot determine" };
  }

  const available = candidates(result);
  const ids = [...new Set(available.flatMap((candidate) => candidate.id ? [candidate.id] : []))];
  if (ids.length > 1) {
    return { conflict: true, detail: `${result.query.unicode} has conflicting published registrar IDs: ${ids.join(" and ")}.`, id: null, name: null, source: null, value: "Cannot determine" };
  }
  const selected = available.find((candidate) => candidate.source === "registry" && candidate.name)
    ?? available.find((candidate) => candidate.name)
    ?? available.find((candidate) => candidate.source === "registry")
    ?? available[0]
    ?? null;
  const id = selected?.id ?? ids[0] ?? result.registrar.ianaId;
  if (!selected?.name && !result.registrar.name) {
    return {
      conflict: false,
      detail: id
        ? `${result.query.unicode} publishes registrar ID ${id}, but no registrar name.`
        : `${result.query.unicode} does not publish a registrar identity in the available responses.`,
      id,
      name: null,
      source: selected?.source ?? null,
      value: "Not published",
    };
  }
  const name = selected?.name ?? result.registrar.name;
  return { conflict: false, detail: `${name} manages ${result.query.unicode}.`, id, name, source: selected?.source ?? "registry", value: name as string };
}

export function isRegistrarHopIncomplete(result: DomainRegistration) {
  if (result.status !== "registered") return false;
  // WHOIS registries have no registrar hop, so nothing is missing.
  if (result.registryFetch?.protocol === "whois") return false;
  if (result.registrarFetch) return result.registrarFetch.status !== "registered";
  return Boolean(result.registrar.name || result.registrar.ianaId || result.registrar.rdapUrl);
}

type DetailKind = "text" | "email" | "url";
export type RegistrarDetail = { kind: DetailKind; label: string; source: string; value: string };

function combinedSource(sources: Set<RdapSource>) {
  if (sources.size > 1) return "Registry and registrar";
  return sourceLabel([...sources][0] ?? "registry");
}

function addValue(map: Map<string, { kind: DetailKind; label: string; sources: Set<RdapSource>; value: string }>, label: string, value: string | null, source: RdapSource, kind: DetailKind = "text") {
  const normalized = value?.trim();
  if (!normalized) return;
  const key = `${label.toLowerCase()}|${normalized.toLowerCase()}`;
  const row = map.get(key);
  if (row) row.sources.add(source);
  else map.set(key, { kind, label, sources: new Set([source]), value: normalized });
}

function entityWebsites(entity: DomainEntity) {
  return entity.fields.filter((field) => /website|url/i.test(field.label)).map((field) => field.value);
}

export function registrarDetails(result: DomainRegistration): RegistrarDetail[] {
  if (result.status !== "registered") return [];
  const identity = registrarIdentity(result);
  const rows = new Map<string, { kind: DetailKind; label: string; sources: Set<RdapSource>; value: string }>();
  const registrarEntities = result.entities.filter((entity) => entity.roles.includes("registrar"));
  const abuseEntities = result.entities.filter((entity) => entity.roles.includes("abuse"));
  if (identity.conflict) {
    for (const entity of registrarEntities) {
      addValue(rows, "IANA registrar ID", entity.handle, entity.source);
      addValue(rows, "Published registrar", entity.name ?? entity.organization, entity.source);
    }
  }
  const idSources = registrarEntities.filter((entity) => entity.handle === identity.id).map((entity) => entity.source);
  addValue(rows, "IANA registrar ID", identity.id, idSources[0] ?? "registry");
  for (const source of idSources.slice(1)) addValue(rows, "IANA registrar ID", identity.id, source);

  for (const entity of registrarEntities) {
    const name = entity.name ?? entity.organization;
    if (name && identity.name && name !== identity.name && (!identity.id || !entity.handle || entity.handle === identity.id)) {
      addValue(rows, "Alternate published name", name, entity.source);
    }
    for (const website of entityWebsites(entity)) addValue(rows, "Website", website, entity.source, "url");
  }
  const entityWebsiteValues = registrarEntities.flatMap(entityWebsites);
  if (!result.registrar.url || !entityWebsiteValues.some((value) => value.toLowerCase() === result.registrar.url?.toLowerCase())) {
    addValue(rows, "Website", result.registrar.url, identity.source ?? "registry", "url");
  }

  for (const entity of abuseEntities) {
    addValue(rows, "Abuse email", entity.email, entity.source, "email");
    addValue(rows, "Abuse phone", entity.phone, entity.source);
    for (const field of entity.fields) {
      if (/email/i.test(field.label)) addValue(rows, "Abuse email", field.value, entity.source, "email");
      if (/phone|tel/i.test(field.label)) addValue(rows, "Abuse phone", field.value, entity.source);
    }
  }
  const abuseEmails = abuseEntities.flatMap((entity) => [entity.email, ...entity.fields.filter((field) => /email/i.test(field.label)).map((field) => field.value)]).filter(Boolean);
  const abusePhones = abuseEntities.flatMap((entity) => [entity.phone, ...entity.fields.filter((field) => /phone|tel/i.test(field.label)).map((field) => field.value)]).filter(Boolean);
  if (!result.registrar.abuseEmail || !abuseEmails.some((value) => value?.toLowerCase() === result.registrar.abuseEmail?.toLowerCase())) addValue(rows, "Abuse email", result.registrar.abuseEmail, "registry", "email");
  if (!result.registrar.abusePhone || !abusePhones.some((value) => value?.toLowerCase() === result.registrar.abusePhone?.toLowerCase())) addValue(rows, "Abuse phone", result.registrar.abusePhone, "registry");
  addValue(rows, "Registrar RDAP endpoint", result.registrar.rdapUrl ?? result.registrarFetch?.url ?? null, "registrar", "url");

  const order = new Map([["IANA registrar ID", 0], ["Website", 1], ["Abuse email", 2], ["Abuse phone", 3], ["Alternate published name", 4], ["Registrar RDAP endpoint", 5]]);
  return [...rows.values()]
    .map((row) => ({ kind: row.kind, label: row.label, source: combinedSource(row.sources), value: row.value }))
    .sort((left, right) => (order.get(left.label) ?? 99) - (order.get(right.label) ?? 99) || left.value.localeCompare(right.value));
}

export function registrarResellers(result: DomainRegistration) {
  return [...new Set(result.entities.filter((entity) => entity.roles.includes("reseller")).flatMap((entity) => {
    const value = entity.name ?? entity.organization ?? entity.handle;
    return value ? [value] : [];
  }))];
}

export function registryOperator(result: DomainRegistration) {
  if (result.coverage.operator) return result.coverage.operator;
  const url = result.registryFetch?.url;
  if (url) {
    try { return `Registry service at ${new URL(url).host}`; } catch { /* keep fallback */ }
  }
  return `Registry for .${result.query.tld}`;
}

export function formatRegistrarDate(value: string | null) {
  if (!value) return "Not published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC", year: "numeric" });
}

function eventSource(result: DomainRegistration, action: string, value: string | null) {
  const event = result.events.find((item) => item.action === action && item.date === value);
  return event ? sourceLabel(event.source) : "Registry";
}

export function registrarDateRows(result: DomainRegistration) {
  return [
    { id: "transfer", event: "Last transferred", date: formatRegistrarDate(result.transferDate), source: eventSource(result, "transfer", result.transferDate), meaning: result.transferDate ? "Published registrar move" : "Move date is unknown" },
    { id: "change", event: "Record last changed", date: formatRegistrarDate(result.lastChangedDate), source: eventSource(result, "last changed", result.lastChangedDate), meaning: "Record change, not proof of transfer" },
  ];
}

export function registrarSourceHost(url: string | null) {
  if (!url) return null;
  try { return new URL(url).host; } catch { return null; }
}

export function registrarNotes(result: DomainRegistration) {
  const hidden = new Set([
    `We looked up ${result.query.domain}, which is the registrable part of what you entered.`,
    "We could not read the registrar's own record, so contact details and the registrar expiry date are missing.",
    "This ending is not in our copy of the public suffix list, so the registrable part is a best guess.",
  ]);
  return [...new Set(result.notes.filter((note) => !hidden.has(note)))];
}
