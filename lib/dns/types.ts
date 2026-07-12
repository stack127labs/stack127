export const dnsRecordTypes = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "TXT",
  "CAA",
  "SOA",
  "SRV",
  "DS",
  "DNSKEY",
] as const;

export type DnsRecordType = (typeof dnsRecordTypes)[number];
export type DnsSelection = "common" | DnsRecordType;
export type DnsResolver = "cloudflare" | "google";

export type DnsFlags = {
  authenticatedData: boolean | null;
  checkingDisabled: boolean | null;
  recursionDesired: boolean | null;
  recursionAvailable: boolean | null;
  truncated: boolean | null;
};

export type DnsAliasEdge = {
  from: string;
  to: string;
  resolverTtlSeconds: number | null;
};

export type NormalizedDnsRecord = {
  ownerName: string;
  type: string;
  typeCode: number | null;
  value: string;
  resolverTtlSeconds: number | null;
};

export type DnsQuestion = {
  name: string;
  type: string;
  typeCode: number | null;
};

export type DnsWarningCode =
  | "alias_chain_inconsistent"
  | "alias_loop_detected"
  | "alias_depth_exceeded"
  | "provider_field_invalid"
  | "partial_lookup_failure";

export type DnsWarning = {
  code: DnsWarningCode;
  message: string;
  requestedType?: string;
};

export type DnsQueryOutcome =
  | "found"
  | "no_answer"
  | "nxdomain"
  | "dns_error"
  | "provider_error"
  | "timeout";

export type DnsQueryError = {
  code: string;
  message: string;
} | null;

export type DnsAliasObservation = {
  requestedType: string;
  aliasChain: DnsAliasEdge[];
};

export type DnsQueryResult = {
  requestedName: string;
  requestedType: string;
  responseCode: string | null;
  responseCodeNumber: number | null;
  outcome: DnsQueryOutcome;
  flags: DnsFlags;
  questions: DnsQuestion[] | null;
  terminalRecords: NormalizedDnsRecord[];
  aliasChain: DnsAliasEdge[];
  authorityRecords: NormalizedDnsRecord[] | null;
  additionalRecords: NormalizedDnsRecord[] | null;
  comments: string[] | null;
  warnings: DnsWarning[];
  error: DnsQueryError;
  rawResponse: unknown;
};

export type DnsLookupRequest = {
  name: string;
  selection: DnsSelection;
  resolver: DnsResolver;
};

export type DnsLookupResponse = {
  query: {
    originalInput: string;
    normalizedName: string;
    selection: DnsSelection;
    resolver: DnsResolver;
    dnssecRecordsRequested: false;
    checkingDisabled: false;
  };
  checkedAt: string;
  durationMs: number;
  aliasChain: DnsAliasEdge[];
  aliasObservations: DnsAliasObservation[];
  queryResults: DnsQueryResult[];
  warnings: DnsWarning[];
};
