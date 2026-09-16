import type { DomainEntity, RdapFetch, RdapFetchStatus } from "../domain/types.ts";

export type NetworkQuery = {
  raw: string;
  normalized: string;
  kind: "ip" | "asn";
  ipVersion: 4 | 6 | null;
  address: string | null;
  asn: number | null;
};

export type NetworkService = {
  baseUrl: string;
  registryName: "AFRINIC" | "APNIC" | "ARIN" | "RIPE NCC" | "LACNIC";
  family: "ipv4" | "ipv6" | "asn";
};

export type NetworkRouting = {
  source: "Team Cymru";
  asn: number | null;
  prefix: string | null;
  countryCode: string | null;
  networkName: string | null;
};

export type NetworkHolder = {
  name: string | null;
  organization: string | null;
  country: string | null;
  handle: string | null;
  source: "network-registry";
};

export type NetworkAbuse = {
  name: string | null;
  email: string | null;
  phone: string | null;
  contactUri: string | null;
  source: "network-registry";
};

export type NetworkAllocation = {
  range: string | null;
  startAddress: string | null;
  endAddress: string | null;
  ipVersion: string | null;
  handle: string | null;
  name: string | null;
  type: string | null;
  status: string[];
  country: string | null;
  parentHandle: string | null;
};

export type NetworkAutnum = {
  range: string | null;
  start: number | null;
  end: number | null;
  handle: string | null;
  name: string | null;
  status: string[];
  country: string | null;
};

export type NetworkEvent = {
  action: string;
  date: string | null;
};

export type NetworkRegistryInfo = {
  name: NetworkService["registryName"];
  host: string;
  url: string | null;
  fetchedAt: string | null;
  fromCache: boolean;
  httpStatus: number | null;
};

export type NetworkLookupResult = {
  query: NetworkQuery;
  status: RdapFetchStatus;
  checkedAt: string;
  durationMs: number;
  registry: NetworkRegistryInfo | null;
  allocation: NetworkAllocation | null;
  autnum: NetworkAutnum | null;
  holder: NetworkHolder | null;
  abuse: NetworkAbuse | null;
  events: NetworkEvent[];
  remarks: Array<{ title: string | null; description: string[] }>;
  notices: Array<{ title: string | null; description: string[] }>;
  routing: NetworkRouting | null;
  notes: string[];
  raw: unknown;
};

export type NetworkFetch = RdapFetch;
