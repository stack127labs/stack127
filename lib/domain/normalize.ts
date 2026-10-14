/**
 * Turn registry and registrar RDAP responses into one result.
 *
 * Two rules run through all of this:
 *   Every field is optional. Missing means null, never a default and never false.
 *   Registry and registrar facts stay labelled with the server that said them.
 */

import { collectEntities, findByRole } from "./vcard.ts";
import { declaresRedaction, parseRedactions } from "./redaction.ts";
import { eppSpellingFor, lookupStatus } from "./status-codes.ts";
import type {
  DomainEntity,
  DomainEvent,
  DomainRegistration,
  DomainStatus,
  NameserverRecord,
  RdapFetch,
  RdapSource,
} from "./types.ts";

function eventsFrom(body: unknown, source: RdapSource): DomainEvent[] {
  if (!body || typeof body !== "object") return [];
  const events = (body as { events?: unknown }).events;
  if (!Array.isArray(events)) return [];
  const parsed: DomainEvent[] = [];
  for (const event of events) {
    if (!event || typeof event !== "object") continue;
    const { eventAction, eventDate } = event as { eventAction?: unknown; eventDate?: unknown };
    if (typeof eventAction !== "string") continue;
    parsed.push({
      action: eventAction,
      date: typeof eventDate === "string" && eventDate.trim() ? eventDate : null,
      source,
    });
  }
  return parsed;
}

function firstEventDate(events: DomainEvent[], action: string, source?: RdapSource): string | null {
  const match = events.find((event) => event.action === action && (!source || event.source === source));
  return match?.date ?? null;
}

function statusesFrom(body: unknown): DomainStatus[] {
  if (!body || typeof body !== "object") return [];
  const statuses = (body as { status?: unknown }).status;
  if (!Array.isArray(statuses)) return [];
  return statuses
    .filter((value): value is string => typeof value === "string")
    .map((value) => ({
      rdap: value,
      epp: eppSpellingFor(value),
      known: lookupStatus(value) !== null,
    }));
}

function nameserversFrom(body: unknown): NameserverRecord[] {
  if (!body || typeof body !== "object") return [];
  const nameservers = (body as { nameservers?: unknown }).nameservers;
  if (!Array.isArray(nameservers)) return [];
  const records: NameserverRecord[] = [];
  for (const entry of nameservers) {
    if (!entry || typeof entry !== "object") continue;
    const { ldhName, ipAddresses } = entry as { ldhName?: unknown; ipAddresses?: unknown };
    if (typeof ldhName !== "string") continue;
    const addresses: string[] = [];
    if (ipAddresses && typeof ipAddresses === "object") {
      for (const family of ["v4", "v6"] as const) {
        const list = (ipAddresses as Record<string, unknown>)[family];
        if (Array.isArray(list)) addresses.push(...list.filter((ip): ip is string => typeof ip === "string"));
      }
    }
    // Nominet and DENIC return fully qualified names with a trailing dot;
    // Verisign does not. Strip it so the same nameserver compares equal.
    records.push({ hostname: ldhName.toLowerCase().replace(/\.$/, ""), addresses });
  }
  return records;
}

/**
 * secureDNS.delegationSigned is a delegation fact, not a validation result. A
 * missing object means the registry did not say, which is not the same as unsigned.
 */
function dnssecFrom(body: unknown): { signed: boolean | null; dsCount: number | null } {
  if (!body || typeof body !== "object") return { signed: null, dsCount: null };
  const secureDns = (body as { secureDNS?: unknown }).secureDNS;
  if (!secureDns || typeof secureDns !== "object") return { signed: null, dsCount: null };
  const { delegationSigned, dsData } = secureDns as { delegationSigned?: unknown; dsData?: unknown };
  return {
    signed: typeof delegationSigned === "boolean" ? delegationSigned : null,
    dsCount: Array.isArray(dsData) ? dsData.length : null,
  };
}

function registrarFrom(entities: DomainEntity[]) {
  const registrar = findByRole(entities, "registrar");
  const abuse = entities.find((entity) => entity.roles.includes("abuse"));
  return {
    name: registrar?.name ?? registrar?.organization ?? null,
    ianaId: registrar?.handle ?? null,
    abuseEmail: abuse?.email ?? null,
    abusePhone: abuse?.phone ?? null,
    url: registrar?.fields.find((field) => field.label === "Website")?.value ?? null,
    rdapUrl: null as string | null,
  };
}

export type BuildInput = {
  query: DomainRegistration["query"];
  coverage: DomainRegistration["coverage"];
  registry: RdapFetch | null;
  registrar: RdapFetch | null;
  startedAt: number;
};

export function buildRegistration(input: BuildInput): DomainRegistration {
  const { query, coverage, registry, registrar } = input;
  const notes: string[] = [];

  const registryEvents = eventsFrom(registry?.body, "registry");
  const registrarEvents = eventsFrom(registrar?.body, "registrar");
  const events = [...registryEvents, ...registrarEvents];

  const registryEntities = collectEntities((registry?.body as { entities?: unknown })?.entities, "registry");
  const registrarEntities = collectEntities((registrar?.body as { entities?: unknown })?.entities, "registrar");
  const entities = [...registryEntities, ...registrarEntities];

  // The registry is authoritative for dates, statuses, nameservers and DNSSEC.
  // Fall back to the registrar only when the registry did not publish the field.
  const registrationDate =
    firstEventDate(registryEvents, "registration") ?? firstEventDate(registrarEvents, "registration");
  const reregistrationDate =
    firstEventDate(registryEvents, "reregistration") ?? firstEventDate(registrarEvents, "reregistration");
  const registryExpiryDate = firstEventDate(registryEvents, "expiration") ?? firstEventDate(registrarEvents, "expiration");
  const registrarExpiryDate =
    firstEventDate(registrarEvents, "registrar expiration") ?? firstEventDate(registryEvents, "registrar expiration");
  const lastChangedDate = firstEventDate(registryEvents, "last changed") ?? firstEventDate(registrarEvents, "last changed");
  const transferDate = firstEventDate(registryEvents, "transfer") ?? firstEventDate(registrarEvents, "transfer");
  const lockedDate = firstEventDate(registryEvents, "locked");
  const registryDatabaseUpdated =
    firstEventDate(registryEvents, "last update of RDAP database") ??
    firstEventDate(registrarEvents, "last update of RDAP database");

  const registryStatuses = statusesFrom(registry?.body);
  const statuses = registryStatuses.length ? registryStatuses : statusesFrom(registrar?.body);

  const registryNameservers = nameserversFrom(registry?.body);
  const nameservers = registryNameservers.length ? registryNameservers : nameserversFrom(registrar?.body);

  const registryDnssec = dnssecFrom(registry?.body);
  const dnssec = registryDnssec.signed === null ? dnssecFrom(registrar?.body) : registryDnssec;

  const registrarDetails = registrarFrom(entities);
  if (registrar?.url) registrarDetails.rdapUrl = registrar.url;

  const redactions = parseRedactions(registrar?.body).concat(parseRedactions(registry?.body));
  const redactionDeclared = declaresRedaction(registrar?.body) || declaresRedaction(registry?.body);

  if (registryExpiryDate && registrarExpiryDate && registryExpiryDate !== registrarExpiryDate) {
    notes.push(
      "The registry and the registrar publish different expiry dates. The registry date is the one that decides when the domain is deleted.",
    );
  }
  if (registrar && registrar.status !== "registered" && registry?.status === "registered") {
    notes.push("We could not read the registrar's own record, so contact details and the registrar expiry date are missing.");
  }
  if (query.reduced) {
    notes.push(`We looked up ${query.domain}, which is the registrable part of what you entered.`);
  }
  if (query.guessedSuffix) {
    notes.push("This ending is not in our copy of the public suffix list, so the registrable part is a best guess.");
  }
  if (coverage.source === "whois") {
    notes.push("This answer came from the registry's WHOIS service. Fields it did not clearly publish are unknown.");
  }

  return {
    query,
    coverage,
    status: registry?.status ?? "no_service",
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - input.startedAt,

    registrationDate,
    reregistrationDate,
    registryExpiryDate,
    registrarExpiryDate,
    lastChangedDate,
    transferDate,
    lockedDate,
    registryDatabaseUpdated,

    events,
    statuses,
    nameservers,
    dnssecSigned: dnssec.signed,
    dsRecordCount: dnssec.dsCount,

    registrar: registrarDetails,
    entities,
    redactions,
    redactionDeclared,

    registryFetch: registry,
    registrarFetch: registrar,
    notes,
  };
}
