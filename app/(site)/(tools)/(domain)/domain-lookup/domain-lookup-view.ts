import { lookupStatus } from "../../../../../lib/domain/status-codes.ts";
import type { DomainRegistration, RdapFetchStatus, RdapSource } from "../../../../../lib/domain/types.ts";

export function formatLookupDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC", year: "numeric" });
}

function consequentialStatus(result: DomainRegistration) {
  const priority = [
    "pending delete", "redemption period", "server hold", "client hold",
    "server renew prohibited", "pending transfer", "server transfer prohibited", "client transfer prohibited",
  ];
  return priority.map((value) => result.statuses.find((status) => status.rdap.toLowerCase() === value)).find(Boolean)
    ?? result.statuses[0]
    ?? null;
}

function statusClause(result: DomainRegistration) {
  const status = consequentialStatus(result);
  if (!status) return "";
  const name = status.epp ?? status.rdap;
  const rdap = status.rdap.toLowerCase();
  if (rdap === "pending delete") return `${name} means it cannot be restored.`;
  if (rdap === "redemption period") return `${name} means the previous owner may still restore it.`;
  const known = lookupStatus(status.rdap);
  if (known?.removesFromDns) return `${name} currently stops DNS.`;
  if (rdap.includes("transfer prohibited")) return `${name} currently blocks transfer.`;
  if (rdap.includes("renew prohibited")) return `${name} currently blocks renewal.`;
  if (rdap.includes("update prohibited")) return `${name} currently blocks record changes.`;
  if (rdap.includes("delete prohibited")) return `${name} currently blocks deletion.`;
  return `${name} is the most consequential returned status.`;
}

function unavailableDetail(status: RdapFetchStatus, tld: string) {
  if (status === "no_service") return `stack127 has no known RDAP service for .${tld}.`;
  if (status === "rate_limited") return "The registry limited this request. Try again shortly.";
  if (status === "blocked") return "The registry refused this request. Try again shortly.";
  if (status === "timeout") return "The registry did not answer in time. Try again.";
  return "The registry did not return a usable answer. Try again.";
}

export function lookupVerdict(result: DomainRegistration) {
  if (result.status === "registered") {
    const registrar = result.registrar.name ? ` through ${result.registrar.name}` : "";
    const status = statusClause(result);
    return { detail: `${result.query.unicode} is registered${registrar}.${status ? ` ${status}` : ""}`, value: "Registered" };
  }
  if (result.status === "not_registered") {
    return { detail: `${result.query.unicode} has no current registry record. This does not guarantee that the name can be bought.`, value: "No registration found" };
  }
  return { detail: unavailableDetail(result.status, result.query.tld), value: "Cannot determine" };
}

function sourceLabel(source: RdapSource | null, fallback: "Registry" | "Registrar") {
  return source === "registrar" ? "Registrar" : source === "registry" ? "Registry" : fallback;
}

function eventSource(result: DomainRegistration, date: string | null, actions: string[], fallback: "Registry" | "Registrar") {
  if (!date) return fallback;
  const event = result.events.find((item) => item.date === date && actions.includes(item.action));
  return sourceLabel(event?.source ?? null, fallback);
}

export function dateRows(result: DomainRegistration) {
  const rows: Array<{ id: string; label: string; source: string; value: string }> = [];
  const add = (id: string, label: string, value: string | null, actions: string[], fallback: "Registry" | "Registrar") => {
    rows.push({ id, label, source: eventSource(result, value, actions, fallback), value: formatLookupDate(value) ?? "Not published" });
  };
  add("registration", "Registered", result.registrationDate, ["registration"], "Registry");
  if (result.reregistrationDate) add("reregistration", "Re-registered", result.reregistrationDate, ["reregistration"], "Registry");
  add("registry-expiry", "Registry expiry", result.registryExpiryDate, ["expiration"], "Registry");
  add("registrar-expiry", "Registrar expiry", result.registrarExpiryDate, ["registrar expiration"], "Registrar");
  if (result.transferDate) add("transfer", "Last transferred", result.transferDate, ["transfer"], "Registry");
  add("last-changed", "Record last changed", result.lastChangedDate, ["last changed"], "Registry");
  add("registry-data", "Registry database updated", result.registryDatabaseUpdated, ["last update of RDAP database"], "Registry");
  return rows;
}

function rawBody(result: DomainRegistration, source: RdapSource) {
  const fetch = source === "registry" ? result.registryFetch : result.registrarFetch;
  return fetch?.body && typeof fetch.body === "object" ? fetch.body as Record<string, unknown> : {};
}

function suppliesRecordGroup(result: DomainRegistration, source: RdapSource, group: "statuses" | "nameservers" | "dnssec") {
  const body = rawBody(result, source);
  if (group === "statuses") {
    return Array.isArray(body.status) && body.status.some((value) => typeof value === "string");
  }
  if (group === "nameservers") {
    return Array.isArray(body.nameservers) && body.nameservers.some((value) => (
      value !== null && typeof value === "object" && typeof (value as { ldhName?: unknown }).ldhName === "string"
    ));
  }
  if (!body.secureDNS || typeof body.secureDNS !== "object") return false;
  return typeof (body.secureDNS as { delegationSigned?: unknown }).delegationSigned === "boolean";
}

export function sourceForRecordGroup(result: DomainRegistration, group: "statuses" | "nameservers" | "dnssec") {
  if (suppliesRecordGroup(result, "registry", group)) return "Registry";
  if (suppliesRecordGroup(result, "registrar", group)) return "Registrar";
  return "Registry";
}

export function lookupSourceHost(url: string | null) {
  if (!url) return null;
  try { return new URL(url).host; } catch { return null; }
}

export function filteredLookupNotes(result: DomainRegistration) {
  const duplicate = new Set([
    `We looked up ${result.query.domain}, which is the registrable part of what you entered.`,
    "The registry and the registrar publish different expiry dates. The registry date is the one that decides when the domain is deleted.",
    "We could not read the registrar's own record, so contact details and the registrar expiry date are missing.",
  ]);
  return result.notes.filter((note) => !duplicate.has(note));
}
