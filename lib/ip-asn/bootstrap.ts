import networkBootstrap from "../domain/data/rdap-bootstrap-ip.json" with { type: "json" };
import { parseIpLiteral } from "./input.ts";
import type { NetworkQuery, NetworkService } from "./types.ts";

type BootstrapService = { keys: string[]; url: string };
type BootstrapData = {
  ipv4: { services: BootstrapService[] };
  ipv6: { services: BootstrapService[] };
  asn: { services: BootstrapService[] };
};

const data = networkBootstrap as BootstrapData;

const registryNames = new Map<string, NetworkService["registryName"]>([
  ["rdap.afrinic.net", "AFRINIC"],
  ["rdap.apnic.net", "APNIC"],
  ["rdap.arin.net", "ARIN"],
  ["rdap.db.ripe.net", "RIPE NCC"],
  ["rdap.lacnic.net", "LACNIC"],
]);

function normalizedBase(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

export function networkRegistryName(baseUrl: string): NetworkService["registryName"] {
  try {
    return registryNames.get(new URL(baseUrl).hostname) ?? "ARIN";
  } catch {
    return "ARIN";
  }
}

export function reviewedNetworkBase(baseUrl: string) {
  if (!baseUrl.startsWith("https://")) return false;
  return [data.ipv4, data.ipv6, data.asn].some((family) => family.services.some((service) => normalizedBase(service.url) === normalizedBase(baseUrl)));
}

function cidrMatches(address: string, cidr: string) {
  const [base, prefixText] = cidr.split("/");
  const parsedAddress = parseIpLiteral(address);
  const parsedBase = parseIpLiteral(base);
  const prefix = Number(prefixText);
  if (!parsedAddress || !parsedBase || parsedAddress.version !== parsedBase.version) return false;
  const bits = parsedAddress.version === 4 ? 32 : 128;
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > bits) return false;
  const shift = BigInt(bits - prefix);
  const mask = prefix === 0 ? 0n : ((1n << BigInt(bits)) - 1n) ^ ((1n << shift) - 1n);
  return (parsedAddress.value & mask) === (parsedBase.value & mask);
}

function serviceForCidr(address: string, family: "ipv4" | "ipv6") {
  const services = family === "ipv4" ? data.ipv4.services : data.ipv6.services;
  let match: { service: BootstrapService; prefix: number } | null = null;
  for (const service of services) {
    for (const key of service.keys) {
      if (!cidrMatches(address, key)) continue;
      const prefix = Number(key.split("/")[1]);
      if (!match || prefix > match.prefix) match = { service, prefix };
    }
  }
  return match?.service ?? null;
}

function serviceForAsn(asn: number) {
  for (const service of data.asn.services) {
    for (const key of service.keys) {
      const [startText, endText] = key.split("-");
      const start = Number(startText);
      const end = Number(endText ?? startText);
      if (Number.isInteger(start) && Number.isInteger(end) && asn >= start && asn <= end) return service;
    }
  }
  return null;
}

export function networkServiceForQuery(query: NetworkQuery): NetworkService | null {
  const selected = query.kind === "asn"
    ? serviceForAsn(query.asn ?? -1)
    : serviceForCidr(query.address ?? "", query.ipVersion === 6 ? "ipv6" : "ipv4");
  if (!selected) return null;
  return {
    baseUrl: normalizedBase(selected.url),
    registryName: networkRegistryName(selected.url),
    family: query.kind === "asn" ? "asn" : query.ipVersion === 6 ? "ipv6" : "ipv4",
  };
}
