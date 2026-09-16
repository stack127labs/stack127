import { enrichDnsAddresses } from "../dns/network-enrichment.ts";
import type { NetworkRouting } from "./types.ts";

function fields(value: string) {
  return value.replace(/^"|"$/g, "").split("|").map((part) => part.trim());
}

export function parseCymruOriginText(_address: string, value: string): NetworkRouting | null {
  const parts = fields(value);
  const asn = Number.parseInt(parts[0] ?? "", 10);
  if (!Number.isInteger(asn) || asn <= 0) return null;
  return {
    source: "Team Cymru",
    asn,
    prefix: parts[1] || null,
    countryCode: parts[2] || null,
    networkName: parts[4] || null,
  };
}

export function parseCymruAsnText(value: string) {
  return fields(value)[4] || null;
}

export async function lookupCurrentRoute(
  address: string,
  options: { fetchImpl?: typeof fetch; signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<NetworkRouting | null> {
  const [detail] = await enrichDnsAddresses([address], options);
  if (!detail || (!detail.asn && !detail.prefix && !detail.networkName)) return null;
  return {
    source: "Team Cymru",
    asn: detail.asn,
    prefix: detail.prefix,
    countryCode: detail.countryCode,
    networkName: detail.networkName,
  };
}
