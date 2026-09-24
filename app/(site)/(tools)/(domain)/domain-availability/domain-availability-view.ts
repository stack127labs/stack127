import type { DomainRegistration, RdapFetchStatus } from "../../../../../lib/domain/types.ts";

const releaseStatuses = new Set(["redemption period", "pending delete"]);

export function formatAvailabilityDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
}

function failureDetail(status: RdapFetchStatus, tld: string) {
  if (status === "no_service") return `stack127 has no known RDAP service for .${tld}.`;
  if (status === "rate_limited") return "The registry limited this request. Try again shortly.";
  if (status === "blocked") return "The registry refused this request. Try again shortly.";
  if (status === "timeout") return "The registry did not answer in time. Try again.";
  return "The registry did not return a usable answer. Try again.";
}

export function availabilityVerdict(result: DomainRegistration) {
  if (result.status === "registered") {
    return {
      detail: `${result.query.unicode} has a current registry record.`,
      value: "Registered",
    };
  }
  if (result.status === "not_registered") {
    return {
      detail: `${result.query.unicode} has no registry record. It may still be reserved, blocked, premium-priced, or newly released and already being registered.`,
      value: "No registration found",
    };
  }
  return {
    detail: failureDetail(result.status, result.query.tld),
    value: "Cannot determine",
  };
}

function lifecycleValue(result: DomainRegistration) {
  const values = [...new Set(result.statuses
    .map((status) => status.rdap.toLowerCase())
    .filter((status) => releaseStatuses.has(status)))]
    .map((status) => status[0].toUpperCase() + status.slice(1));
  return values.join(" and ");
}

export function registrationFacts(result: DomainRegistration) {
  if (result.status !== "registered") return [];
  const facts: Array<{ label: string; value: string }> = [];
  const registered = formatAvailabilityDate(result.registrationDate);
  const expiry = formatAvailabilityDate(result.registryExpiryDate);
  const lifecycle = lifecycleValue(result);
  if (registered) facts.push({ label: "Registered", value: registered });
  if (expiry) facts.push({ label: "Registry expiry", value: expiry });
  if (result.registrar.name) facts.push({ label: "Registrar", value: result.registrar.name });
  if (lifecycle) facts.push({ label: "Lifecycle", value: lifecycle });
  return facts;
}

export function hasExpiryFollowUp(result: DomainRegistration) {
  return result.status === "registered" && Boolean(result.registryExpiryDate || lifecycleValue(result));
}

export function registrySourceMetadata(result: DomainRegistration) {
  const fetch = result.registryFetch;
  if (!fetch) return null;
  let host: string | null = null;
  if (fetch.url) {
    try {
      host = new URL(fetch.url).host;
    } catch {
      host = null;
    }
  }
  return {
    cached: fetch.fromCache,
    fetchedAt: fetch.fetchedAt,
    host,
    registryDatabaseUpdated: result.registryDatabaseUpdated,
  };
}

export function filterAvailabilityNotes(result: DomainRegistration) {
  const reductionNote = `We looked up ${result.query.domain}, which is the registrable part of what you entered.`;
  return result.notes.filter((note) => note !== reductionNote);
}
