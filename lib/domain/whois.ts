/** Port-43 fallback for reviewed TLDs only. RDAP always takes precedence. */
import { readCachedRdap, writeCachedRdap } from "./cache.ts";
import { acquireEndpointSlot, reportEndpointResult } from "./throttle.ts";
import { readWhois } from "./whois-transport.ts";
import { parseWhoisResponse, type WhoisService } from "./whois-parser.ts";
import type { FetchOptions } from "./rdap.ts";
import type { RdapFetch } from "./types.ts";
import { whoisQueryFor } from "./whois-query.ts";

export async function fetchWhois(domain: string, tld: string, service: WhoisService, options: FetchOptions = {}): Promise<RdapFetch> {
  // Changing the parser or query format invalidates previously interpreted text.
  const query = whoisQueryFor(domain, service);
  // Older versions may have mistaken contact data or privacy labels for facts.
  const url = `whois://${service.server}/${encodeURIComponent(domain)}?query=${encodeURIComponent(query)}&parser=5&review=${service.verifiedAt}`;
  const base = { httpStatus: null, url, source: "registry" as const, protocol: "whois" as const,
    fetchedAt: new Date().toISOString(), fromCache: false };
  if (!options.bypassCache) {
    const cached = await readCachedRdap(url, "registry");
    if (cached) return { ...cached, protocol: "whois", fromCache: true };
  }
  const slot = acquireEndpointSlot(url, Date.now(), tld);
  if (!slot.allowed) return { ...base, status: "rate_limited", body: null,
    retryAfterSeconds: slot.retryAfterSeconds,
    error: slot.reason === "circuit_open" ? "This WHOIS server recently refused our requests, so we have paused contacting it."
      : "We are contacting this WHOIS server too often right now." };
  try {
    const raw = await readWhois(service.server, query, options);
    const parsed = parseWhoisResponse(raw, domain, service);
    reportEndpointResult(url, parsed.status === "rate_limited" ? 429 : parsed.status === "blocked" ? 403
      : parsed.status === "registered" || parsed.status === "not_registered" ? 200 : null);
    const result: RdapFetch = { ...base, ...parsed };
    if (!options.bypassCache && (result.status === "registered" || result.status === "not_registered")) await writeCachedRdap(url, result);
    return result;
  } catch (error) {
    reportEndpointResult(url, null);
    const message = error instanceof Error ? error.message : "";
    const timeout = message === "whois_timeout" || message === "whois_aborted";
    return { ...base, status: timeout ? "timeout" : "registry_error", body: null,
      error: timeout ? "The WHOIS server did not answer in time."
        : message === "oversized_response" ? "The WHOIS server sent a response that was too large to read."
          : "We could not reach the WHOIS server." };
  }
}
