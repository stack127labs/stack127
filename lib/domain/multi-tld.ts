/**
 * One name checked across a fixed set of TLDs.
 *
 * Every row settles on its own and states its own outcome. A failed or throttled
 * row must never render as available, because that is the answer people act on.
 */

import { rdapServiceForTld } from "./bootstrap.ts";
import { convertName } from "./punycode.ts";
import { fetchRegistry } from "./rdap.ts";
import { mapLabel } from "./unicode.ts";
import { DomainInputError } from "./public-suffix.ts";
import { MAX_TLDS, type MultiTldRow } from "./multi-tld-shared.ts";
import type { RdapFetchStatus } from "./types.ts";

export { DEFAULT_TLDS, MAX_TLDS, type MultiTldRow, type MultiTldResult } from "./multi-tld-shared.ts";

const CONCURRENCY = 4;

function rowFor(tld: string, domain: string, status: RdapFetchStatus, extra: Partial<MultiTldRow>): MultiTldRow {
  const base: MultiTldRow = {
    tld,
    domain,
    state: "check_failed",
    detail: "",
    registrar: null,
    expiryDate: null,
    fetchedAt: null,
    fromCache: false,
    ...extra,
  };
  if (status === "not_registered") {
    return { ...base, state: "not_registered", detail: "No registration in this registry." };
  }
  if (status === "registered") {
    return { ...base, state: "registered", detail: "Already registered." };
  }
  if (status === "no_service") {
    return { ...base, state: "cannot_check", detail: `We do not know of an RDAP service for .${tld}.` };
  }
  if (status === "rate_limited") {
    return { ...base, state: "check_failed", detail: "We are being rate limited by this registry right now." };
  }
  if (status === "blocked") {
    return { ...base, state: "check_failed", detail: "This registry refused our request." };
  }
  if (status === "timeout") {
    return { ...base, state: "check_failed", detail: "This registry did not answer in time." };
  }
  return { ...base, state: "check_failed", detail: "This registry returned an error." };
}

export function normalizeBareName(raw: string) {
  const trimmed = String(raw ?? "").trim().toLowerCase();
  if (!trimmed) throw new DomainInputError("empty", "Enter a name to check.");
  if (trimmed.includes(".")) {
    throw new DomainInputError("has_tld", "Enter the name only, without an ending. Pick the endings below.");
  }
  if (trimmed.includes(" ")) throw new DomainInputError("has_space", "A domain name cannot contain spaces.");
  const converted = convertName(trimmed, mapLabel);
  if (converted.problems.length) {
    throw new DomainInputError("invalid_name", "That name contains characters that are not allowed in a domain.");
  }
  return { ascii: converted.ascii, unicode: converted.unicode };
}

export async function checkMultipleTlds(rawName: string, requestedTlds: string[], signal?: AbortSignal) {
  const name = normalizeBareName(rawName);
  const tlds = [...new Set(requestedTlds.map((tld) => tld.toLowerCase().replace(/^\./, "")))]
    .filter(Boolean)
    .slice(0, MAX_TLDS);

  if (!tlds.length) throw new DomainInputError("no_tlds", "Choose at least one ending to check.");

  const rows: MultiTldRow[] = new Array(tlds.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tlds.length) {
      const index = cursor;
      cursor += 1;
      const tld = tlds[index];
      const domain = `${name.ascii}.${tld}`;
      const coverage = rdapServiceForTld(tld);
      if (coverage.source === "none") {
        rows[index] = rowFor(tld, domain, "no_service", {});
        continue;
      }
      const { fetch: result } = await fetchRegistry(domain, tld, { signal });
      const body = result.body as { entities?: unknown; events?: unknown } | null;
      let registrar: string | null = null;
      let expiryDate: string | null = null;
      if (result.status === "registered" && body) {
        const entities = Array.isArray(body.entities) ? body.entities : [];
        for (const entity of entities) {
          if (!entity || typeof entity !== "object") continue;
          const roles = (entity as { roles?: unknown }).roles;
          if (!Array.isArray(roles) || !roles.includes("registrar")) continue;
          const vcard = (entity as { vcardArray?: unknown }).vcardArray;
          if (Array.isArray(vcard) && Array.isArray(vcard[1])) {
            const fn = vcard[1].find((entry: unknown) => Array.isArray(entry) && entry[0] === "fn");
            if (Array.isArray(fn) && typeof fn[3] === "string") registrar = fn[3];
          }
        }
        const events = Array.isArray(body.events) ? body.events : [];
        for (const event of events) {
          if (!event || typeof event !== "object") continue;
          const { eventAction, eventDate } = event as { eventAction?: unknown; eventDate?: unknown };
          if (eventAction === "expiration" && typeof eventDate === "string") expiryDate = eventDate;
        }
      }
      rows[index] = rowFor(tld, domain, result.status, {
        registrar,
        expiryDate,
        fetchedAt: result.fetchedAt,
        fromCache: result.fromCache,
      });
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tlds.length) }, worker));

  return {
    name: name.ascii,
    unicode: name.unicode,
    checkedAt: new Date().toISOString(),
    rows,
    // Stated so a partial answer is never mistaken for a complete one.
    checkedCount: tlds.length,
    maxTlds: MAX_TLDS,
  };
}
