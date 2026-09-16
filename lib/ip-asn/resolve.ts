import type { RdapFetch } from "../domain/types.ts";
import { networkServiceForQuery } from "./bootstrap.ts";
import { parseNetworkQuery } from "./input.ts";
import { buildNetworkResult } from "./normalize.ts";
import { lookupCurrentRoute } from "./routing.ts";
import type { NetworkLookupResult, NetworkQuery, NetworkRouting, NetworkService } from "./types.ts";

export function rdapUrlForNetworkQuery(query: NetworkQuery, service: NetworkService | null) {
  if (!service) return null;
  const path = query.kind === "ip" ? `ip/${query.address}` : `autnum/${query.asn}`;
  return `${service.baseUrl}${path}`;
}

type NetworkFetchOptions = { signal?: AbortSignal; timeoutMs?: number; bypassCache?: boolean };
type FetchNetworkRdap = (url: string, source: "network-registry", options?: NetworkFetchOptions) => Promise<RdapFetch>;
type RoutingLookup = (address: string, options?: { signal?: AbortSignal }) => Promise<NetworkRouting | null>;

export type NetworkLookupOptions = {
  fetchRdap?: FetchNetworkRdap;
  routingLookup?: RoutingLookup;
  signal?: AbortSignal;
  now?: () => Date;
};

export async function lookupNetwork(input: unknown, options: NetworkLookupOptions = {}): Promise<NetworkLookupResult> {
  const query = parseNetworkQuery(input);
  const service = networkServiceForQuery(query);
  const startedAt = Date.now();
  const url = rdapUrlForNetworkQuery(query, service);
  if (!service || !url) {
    return buildNetworkResult({ query, service, fetchResult: null, routing: null, startedAt, now: options.now });
  }

  const fetchRdap = options.fetchRdap ?? (async (target, source, fetchOptions) => {
    const { fetchRdapObject } = await import("../domain/rdap.ts");
    return fetchRdapObject(target, source, fetchOptions);
  });
  const fetchResult = await fetchRdap(url, "network-registry", { signal: options.signal });
  let routing: NetworkRouting | null = null;
  if (query.kind === "ip" && fetchResult.status === "registered") {
    try {
      routing = await (options.routingLookup ?? lookupCurrentRoute)(query.address as string, { signal: options.signal });
    } catch {
      routing = null;
    }
  }
  return buildNetworkResult({ query, service, fetchResult, routing, startedAt, now: options.now });
}
