import { collectEntities } from "../domain/vcard.ts";
import type { RdapFetch, RdapFetchStatus } from "../domain/types.ts";
import type { NetworkLookupResult, NetworkRouting, NetworkService } from "./types.ts";
import type { NetworkQuery } from "./types.ts";

export function rdapStatusFromHttp(httpStatus: number): RdapFetchStatus {
  if (httpStatus === 200) return "registered";
  if (httpStatus === 404) return "not_registered";
  if (httpStatus === 429) return "rate_limited";
  if (httpStatus === 403) return "blocked";
  return "registry_error";
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())).map((entry) => entry.trim()) : [];
}

function descriptions(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function noteRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as { title?: unknown; description?: unknown };
    return [{ title: stringValue(record.title), description: descriptions(record.description) }];
  });
}

function eventRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as { eventAction?: unknown; eventDate?: unknown };
    if (typeof record.eventAction !== "string") return [];
    return [{ action: record.eventAction, date: stringValue(record.eventDate) }];
  });
}

function entityName(entity: ReturnType<typeof collectEntities>[number]) {
  return entity.organization ?? entity.name;
}

function holderFrom(body: Record<string, unknown>, entities: ReturnType<typeof collectEntities>) {
  const holder = entities.find((entity) => entity.roles.includes("registrant"))
    ?? entities.find((entity) => entity.roles.includes("administrative"))
    ?? entities.find((entity) => entity.roles.includes("technical"));
  if (holder) {
    return {
      name: holder.name,
      organization: holder.organization,
      country: holder.country ?? stringValue(body.country),
      handle: holder.handle,
      source: "network-registry" as const,
    };
  }
  const objectName = stringValue(body.name);
  if (!objectName && !stringValue(body.country)) return null;
  return {
    name: objectName,
    organization: null,
    country: stringValue(body.country),
    handle: stringValue(body.handle),
    source: "network-registry" as const,
  };
}

function abuseFrom(entities: ReturnType<typeof collectEntities>) {
  const abuse = entities.find((entity) => entity.roles.includes("abuse"));
  if (!abuse) return null;
  return {
    name: entityName(abuse),
    email: abuse.email,
    phone: abuse.phone,
    contactUri: abuse.contactUri,
    source: "network-registry" as const,
  };
}

function registryInfo(service: NetworkService | null, fetchResult: RdapFetch | null) {
  if (!service) return null;
  let host = service.baseUrl;
  try { host = new URL(service.baseUrl).host; } catch {}
  return {
    name: service.registryName,
    host,
    url: fetchResult?.url ?? null,
    fetchedAt: fetchResult?.fetchedAt ?? null,
    fromCache: fetchResult?.fromCache ?? false,
    httpStatus: fetchResult?.httpStatus ?? null,
  };
}

function rangeForIp(body: Record<string, unknown>) {
  const start = stringValue(body.startAddress);
  const end = stringValue(body.endAddress);
  if (start && end) return `${start} to ${end}`;
  return stringValue(body.handle);
}

function rangeForAsn(start: number | null, end: number | null, handle: string | null) {
  if (start !== null && end !== null) return start === end ? `AS${start}` : `AS${start} to AS${end}`;
  return handle;
}

function bodyRecord(fetchResult: RdapFetch) {
  return fetchResult.body && typeof fetchResult.body === "object" ? fetchResult.body as Record<string, unknown> : null;
}

export function buildNetworkResult({
  query,
  service,
  fetchResult,
  routing,
  startedAt,
  now = () => new Date(),
}: {
  query: NetworkQuery;
  service: NetworkService | null;
  fetchResult: RdapFetch | null;
  routing: NetworkRouting | null;
  startedAt: number;
  now?: () => Date;
}): NetworkLookupResult {
  const checkedAt = now().toISOString();
  const body = fetchResult ? bodyRecord(fetchResult) : null;
  const status = fetchResult?.status ?? "no_service";
  const expectedClass = query.kind === "ip" ? "ip network" : "autnum";
  const validBody = status === "registered" && body?.objectClassName === expectedClass;
  const effectiveStatus = status === "registered" && !validBody ? "registry_error" : status;
  const entities = validBody ? collectEntities(body?.entities, "network-registry") : [];
  const startAutnum = validBody && typeof body?.startAutnum === "number" ? body.startAutnum : null;
  const endAutnum = validBody && typeof body?.endAutnum === "number" ? body.endAutnum : null;
  const allocation = validBody && query.kind === "ip" ? {
    range: rangeForIp(body),
    startAddress: stringValue(body.startAddress),
    endAddress: stringValue(body.endAddress),
    ipVersion: stringValue(body.ipVersion),
    handle: stringValue(body.handle),
    name: stringValue(body.name),
    type: stringValue(body.type),
    status: stringList(body.status),
    country: stringValue(body.country),
    parentHandle: stringValue(body.parentHandle),
  } : null;
  const autnum = validBody && query.kind === "asn" ? {
    range: rangeForAsn(startAutnum, endAutnum, stringValue(body.handle)),
    start: startAutnum,
    end: endAutnum,
    handle: stringValue(body.handle),
    name: stringValue(body.name),
    status: stringList(body.status),
    country: stringValue(body.country),
  } : null;
  const notes: string[] = [];
  if (effectiveStatus === "registered" && query.kind === "ip") {
    if (routing) notes.push("RIR registration and current routing answer different questions.");
    else notes.push("Current routing context was not available for this address.");
  }
  if (effectiveStatus === "registry_error" && status === "registered") notes.push("The registry response did not match the expected network object.");
  return {
    query,
    status: effectiveStatus,
    checkedAt,
    durationMs: Math.max(0, Date.now() - startedAt),
    registry: registryInfo(service, fetchResult),
    allocation,
    autnum,
    holder: validBody ? holderFrom(body, entities) : null,
    abuse: validBody ? abuseFrom(entities) : null,
    events: validBody ? eventRows(body.events) : [],
    remarks: validBody ? noteRows(body.remarks) : [],
    notices: validBody ? noteRows(body.notices) : [],
    routing: effectiveStatus === "registered" && query.kind === "ip" ? routing : null,
    notes,
    raw: fetchResult?.body ?? null,
  };
}
