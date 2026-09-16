import type { CoverageSource } from "./bootstrap.ts";

/** Which server produced a fact. Never collapse these into one. */
export type RdapSource = "registry" | "registrar" | "network-registry" | "network-routing";

export type RdapFetchStatus =
  | "registered"
  | "not_registered"
  | "rate_limited"
  | "blocked"
  | "registry_error"
  | "timeout"
  | "no_service";

export type RdapFetch = {
  status: RdapFetchStatus;
  httpStatus: number | null;
  url: string | null;
  source: RdapSource;
  body: unknown;
  error: string | null;
  /** When this response was retrieved. Differs from the registry's own publish time. */
  fetchedAt: string;
  fromCache: boolean;
};

/**
 * The twelve registered RDAP event actions, from the IANA RDAP JSON Values
 * registry. Every one is optional; absence always means unknown.
 */
export type EventAction =
  | "registration"
  | "reregistration"
  | "last changed"
  | "expiration"
  | "deletion"
  | "reinstantiation"
  | "transfer"
  | "locked"
  | "unlocked"
  | "last update of RDAP database"
  | "registrar expiration"
  | "enum validation expiration";

export type DomainEvent = {
  action: string;
  date: string | null;
  source: RdapSource;
};

export type ContactField = {
  label: string;
  value: string;
};

export type DomainEntity = {
  roles: string[];
  handle: string | null;
  name: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  stateProvince: string | null;
  contactUri: string | null;
  fields: ContactField[];
  source: RdapSource;
};

export type RedactionMethod = "removal" | "emptyValue" | "replacementValue" | "partialValue" | "unknown";

export type RedactedField = {
  field: string;
  method: RedactionMethod;
  explanation: string;
};

export type DomainStatus = {
  /** The RDAP value as returned, for example "client transfer prohibited". */
  rdap: string;
  /** The EPP spelling readers have seen elsewhere, for example "clientTransferProhibited". */
  epp: string | null;
  known: boolean;
};

export type NameserverRecord = {
  hostname: string;
  addresses: string[];
};

export type DomainRegistration = {
  query: {
    input: string;
    domain: string;
    unicode: string;
    tld: string;
    /** IANA category from the committed TLD directory. */
    tldType?: "country-code" | "generic" | "infrastructure" | "sponsored" | null;
    suffix: string;
    reduced: boolean;
    isIdn: boolean;
    guessedSuffix: boolean;
  };
  coverage: {
    source: CoverageSource;
    operator: string | null;
    url: string | null;
    unknownTld: boolean;
  };
  /** registered, not_registered, or one of the failure states. Never guess. */
  status: RdapFetchStatus;
  checkedAt: string;
  durationMs: number;

  registrationDate: string | null;
  reregistrationDate: string | null;
  registryExpiryDate: string | null;
  registrarExpiryDate: string | null;
  lastChangedDate: string | null;
  transferDate: string | null;
  lockedDate: string | null;
  registryDatabaseUpdated: string | null;

  events: DomainEvent[];
  statuses: DomainStatus[];
  nameservers: NameserverRecord[];
  dnssecSigned: boolean | null;
  dsRecordCount: number | null;

  registrar: {
    name: string | null;
    ianaId: string | null;
    abuseEmail: string | null;
    abusePhone: string | null;
    url: string | null;
    rdapUrl: string | null;
  };

  entities: DomainEntity[];
  redactions: RedactedField[];
  /** True when the registrar published an RFC 9537 redaction block. */
  redactionDeclared: boolean;

  registryFetch: RdapFetch | null;
  registrarFetch: RdapFetch | null;

  notes: string[];
};
