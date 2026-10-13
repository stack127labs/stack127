"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { UiButton, UiSelect, UiTextField } from "@/app/ui/controls";
import { UiDataTable } from "@/app/ui/display";
import { dnsRecordsCsv } from "@/lib/dns/export.ts";
import { websiteFaviconUrl } from "@/lib/dns/favicon.ts";
import { formatAuthoritativeTtl, formatResolverTtl, recordFields } from "@/lib/dns/format-record.ts";
import { caaPropertyCounts, traceLinkForLookup } from "@/lib/dns/result-presentation.ts";
import { dnsResolverProfiles, resolverLabel } from "@/lib/dns/resolvers.ts";
import type {
  DnsAliasEdge,
  DnsAddressDetail,
  DnsLookupResponse,
  DnsNameserverAddress,
  DnsQueryResult,
  DnsRecordType,
  DnsResolver,
  DnsSelection,
  NormalizedDnsRecord,
} from "@/lib/dns/types.ts";

const commonRecordOptions: { label: string; value: DnsSelection }[] = [
  { label: "All", value: "all" },
  ...(["A", "AAAA", "CNAME", "MX", "NS", "TXT", "PTR"] as DnsRecordType[])
    .map((value) => ({ label: value, value })),
];
const specializedRecordOptions: { label: string; value: DnsSelection }[] = [
  ...(["CAA", "SOA", "SRV", "DS", "DNSKEY"] as DnsRecordType[])
    .map((value) => ({ label: value, value })),
];
type DnsLookupToolProps = {
  initialName?: string;
  initialResolver?: DnsResolver;
  initialSelection?: DnsSelection;
};

function ownerGroups(records: NormalizedDnsRecord[]) {
  const groups = new Map<string, NormalizedDnsRecord[]>();
  for (const record of records) groups.set(record.ownerName, [...(groups.get(record.ownerName) ?? []), record]);
  return [...groups.entries()];
}

/** Lets a long hostname wrap after a dot before it ever breaks inside a label. */
function Hostname({ name }: { name: string }) {
  const labels = name.split(".");
  return labels.map((label, index) => (
    <Fragment key={index}>{label}{index < labels.length - 1 ? <>.<wbr /></> : null}</Fragment>
  ));
}

const HOSTNAME_RECORD_TYPES = new Set<string>(["CNAME", "NS", "PTR"]);

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

function AliasChain({ authoritative, edges }: { authoritative: boolean; edges: DnsAliasEdge[] }) {
  if (edges.length === 0) return null;
  return (
    <div className="dns-alias-summary" aria-label="Alias chain">
      {edges.length === 1 ? (
        <>
          <p><code><Hostname name={edges[0].from} /></code> points to <code><Hostname name={edges[0].to} /></code>, so the records below may belong to the second name.</p>
          <p>{authoritative ? "The nameserver reports an authoritative TTL of" : "The resolver reported"} {authoritative ? formatAuthoritativeTtl(edges[0].resolverTtlSeconds) : formatResolverTtl(edges[0].resolverTtlSeconds)} for this alias.</p>
        </>
      ) : (
        <>
          <p>The name passes through this alias chain before reaching the records below.</p>
          <ol>
            {edges.map((edge) => (
              <li key={`${edge.from}-${edge.to}`}>
                <code><Hostname name={edge.from} /></code> → <code><Hostname name={edge.to} /></code>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function CopyRecordButton({ record }: { record: NormalizedDnsRecord }) {
  const [copied, setCopied] = useState(false);
  const fields = recordFields(record);
  const value = fields.map((field) => field.value).join(" ");

  return (
    <button
      aria-label={`Copy ${record.type} record`}
      className="dns-copy-icon"
      onClick={async () => {
        await copyText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      title={copied ? "Copied" : `Copy ${record.type} record`}
      type="button"
    >
      {copied ? (
        <span aria-hidden="true">✓</span>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <rect height="10" rx="1.5" width="10" x="7" y="3" />
          <path d="M5 7H4.5A1.5 1.5 0 0 0 3 8.5v7A1.5 1.5 0 0 0 4.5 17h7a1.5 1.5 0 0 0 1.5-1.5V15" />
        </svg>
      )}
    </button>
  );
}

function NetworkLine({ address, detail }: { address?: string; detail?: DnsAddressDetail }) {
  if (!detail || (!detail.networkName && !detail.asn && !detail.prefix)) return null;
  return (
    <span className="dns-network-line">
      {address ? <code>{address}</code> : null}
      {detail.networkName ? <span>{detail.networkName}</span> : null}
      {detail.asn ? <strong>AS{detail.asn}</strong> : null}
      {detail.prefix ? <code>{detail.prefix}</code> : null}
    </span>
  );
}

function ttlHelp(authoritative: boolean) {
  return authoritative
    ? "This is the TTL published by the authoritative nameserver. It is not remaining resolver cache time."
    : "This is the remaining cache lifetime reported by the selected resolver. It may be lower than the TTL configured by the domain owner.";
}

function RecordRow({
  addressDetails,
  authoritative,
  nameserverAddresses,
  record,
}: {
  addressDetails: Map<string, DnsAddressDetail>;
  authoritative: boolean;
  nameserverAddresses: Map<string, string[]>;
  record: NormalizedDnsRecord;
}) {
  const fields = recordFields(record);
  const addressDetail = (record.type === "A" || record.type === "AAAA") ? addressDetails.get(record.value) : undefined;
  const nsAddresses = record.type === "NS" ? nameserverAddresses.get(record.value.replace(/\.$/, "").toLowerCase()) ?? [] : [];
  const recordMeta = (
    <div className="dns-record-meta">
      <span>
        <strong>
          {authoritative ? "Authoritative TTL" : "Resolver TTL"}
          <span aria-label={`About ${authoritative ? "Authoritative TTL" : "Resolver TTL"}`} className="dns-ttl-help" tabIndex={0} title={ttlHelp(authoritative)}>i</span>
        </strong>
        {authoritative ? formatAuthoritativeTtl(record.resolverTtlSeconds) : formatResolverTtl(record.resolverTtlSeconds)}
      </span>
      <CopyRecordButton record={record} />
    </div>
  );

  if (nsAddresses.length > 0) {
    return (
      <li className="dns-record-item dns-record-item-nameserver" data-record-type={record.type}>
        <div className="dns-nameserver-record-heading">
          <code className="dns-record-value"><Hostname name={fields[0]?.value ?? record.value} /></code>
          {recordMeta}
        </div>
        <div className="dns-nameserver-addresses">
          <UiDataTable
            ariaLabel={`Addresses for ${record.value.replace(/\.$/, "")}`}
            columns={[
              { id: "address", label: "Address" },
              { id: "network", label: "Network" },
              { id: "provider", label: "Provider" },
              { id: "country", label: "Country" },
              { id: "asn", label: "ASN" },
            ]}
            rows={nsAddresses.map((address) => {
              const detail = addressDetails.get(address);
              return {
                id: address,
                cells: {
                  address,
                  network: detail?.prefix ?? "Unknown",
                  provider: detail?.networkName ?? "Unknown",
                  country: detail?.countryCode ?? "Unknown",
                  asn: detail?.asn ? `AS${detail.asn}` : "Unknown",
                },
              };
            })}
          />
        </div>
      </li>
    );
  }

  return (
    <li className="dns-record-item" data-record-type={record.type}>
      <div className="dns-record-primary">
        {fields.length === 1 ? (
          <code className="dns-record-value">
            {HOSTNAME_RECORD_TYPES.has(record.type) ? <Hostname name={fields[0].value} /> : fields[0].value}
          </code>
        ) : (
          <dl className="dns-record-fields">
            {fields.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd><code>{field.value}</code></dd>
              </div>
            ))}
          </dl>
        )}
        <NetworkLine detail={addressDetail} />
      </div>
      {recordMeta}
    </li>
  );
}

function OwnerRecords({
  addressDetails,
  authoritative,
  expandAll,
  nameserverAddresses,
  ownerName,
  records,
  type,
}: {
  addressDetails: Map<string, DnsAddressDetail>;
  authoritative: boolean;
  expandAll: boolean;
  nameserverAddresses: Map<string, string[]>;
  ownerName: string;
  records: NormalizedDnsRecord[];
  type: string;
}) {
  const visibleRecords = type === "CAA" || expandAll ? records : records.slice(0, 5);
  const caaCounts = type === "CAA" ? caaPropertyCounts(records) : [];
  return (
    <div className="dns-owner-group">
      <p className="dns-record-owner">Records for <code>{ownerName}</code></p>
      {caaCounts.length > 0 ? (
        <p className="dns-caa-summary">{caaCounts.map(({ count, property }) => `${count} ${property}`).join(" · ")}</p>
      ) : null}
      <ul className="dns-record-list">
        {visibleRecords.map((record, index) => (
          <RecordRow
            addressDetails={addressDetails}
            authoritative={authoritative}
            key={`${record.ownerName}-${record.type}-${record.value}-${index}`}
            nameserverAddresses={nameserverAddresses}
            record={record}
          />
        ))}
      </ul>
    </div>
  );
}

function emptyResultMessage(result: DnsQueryResult) {
  if (result.outcome === "nxdomain") return `No ${result.requestedType} record returned. The resolver reported NXDOMAIN for this name.`;
  if (result.outcome === "dns_error") return `No ${result.requestedType} record returned. The resolver reported ${result.responseCode ?? "a DNS error"}.`;
  return `No ${result.requestedType} record returned.`;
}

function RecordResult({
  addressDetails,
  authoritative,
  expandAll,
  nameserverAddresses,
  result,
}: {
  addressDetails: Map<string, DnsAddressDetail>;
  authoritative: boolean;
  expandAll: boolean;
  nameserverAddresses: Map<string, string[]>;
  result: DnsQueryResult;
}) {
  const failed = result.outcome === "provider_error" || result.outcome === "timeout";
  return (
    <section
      className={`dns-record-group${failed ? " dns-record-group-failed" : result.terminalRecords.length === 0 ? " dns-record-group-empty" : ""}`}
      data-record-type={result.requestedType}
      id={`dns-result-${result.requestedType.toLowerCase()}`}
    >
      <header className="dns-record-group-heading">
        <h2>{result.requestedType}</h2>
      </header>
      {result.terminalRecords.length > 0 ? ownerGroups(result.terminalRecords).map(([ownerName, records]) => (
        <OwnerRecords
          addressDetails={addressDetails}
          authoritative={authoritative}
          expandAll={expandAll}
          key={ownerName}
          nameserverAddresses={nameserverAddresses}
          ownerName={ownerName}
          records={records}
          type={result.requestedType}
        />
      )) : (
        <p className="dns-record-state">
          {failed ? result.error?.message ?? `The ${result.requestedType} lookup could not be completed.` : emptyResultMessage(result)}
        </p>
      )}
      <RawResponse result={result} />
    </section>
  );
}

function RawResponse({ result }: { result: DnsQueryResult }) {
  return (
    <details className="dns-inline-raw">
      <summary>Raw {result.requestedType} response</summary>
      <pre>{JSON.stringify(result.rawResponse, null, 2)}</pre>
    </details>
  );
}

function WebsiteFavicon({ hostname }: { hostname: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  const src = websiteFaviconUrl(hostname);
  if (!src) return null;

  // A failed favicon stays mounted at opacity 0: the slot keeps the title from
  // shifting, and the element's presence stays deterministic for tests.
  return (
    <img
      alt=""
      className={`dns-site-favicon${state === "loaded" ? " dns-site-favicon-loaded" : ""}`}
      data-favicon-state={state}
      decoding="async"
      height="32"
      onError={() => setState("failed")}
      onLoad={() => setState("loaded")}
      referrerPolicy="no-referrer"
      src={src}
      width="32"
    />
  );
}

function dnssecStatus(queryResults: DnsQueryResult[], resolver: string) {
  if (resolver === "Authoritative nameserver") {
    return {
      detail: "Authoritative nameservers do not validate their own answers for the client.",
      tone: "neutral",
      value: "Not checked",
    };
  }
  const reported = new Set(queryResults.map((result) => result.flags.authenticatedData));
  if (reported.size !== 1) {
    return {
      detail: `${resolver} returned different authentication flags across the queries.`,
      tone: "warning",
      value: "Mixed",
    };
  }
  const value = queryResults[0]?.flags.authenticatedData ?? null;
  if (value === true) {
    return {
      detail: `${resolver} marked the answer as authenticated.`,
      tone: "success",
      value: "Authenticated",
    };
  }
  if (value === false) {
    return {
      detail: `${resolver} did not mark the answer as authenticated. This can be normal for an unsigned name.`,
      tone: "neutral",
      value: "Not authenticated",
    };
  }
  return {
    detail: `${resolver} did not report an authentication flag.`,
    tone: "neutral",
    value: "Not reported",
  };
}

function joinedRecordTypes(types: string[]) {
  if (types.length < 2) return types[0] ?? "";
  if (types.length === 2) return `${types[0]} and ${types[1]}`;
  return `${types.slice(0, -1).join(", ")}, and ${types[types.length - 1]}`;
}

function resultHeadline(result: DnsLookupResponse) {
  const foundTypes = result.queryResults
    .filter((query) => query.terminalRecords.length > 0)
    .map((query) => query.requestedType);
  const failedCount = result.queryResults.filter(
    (query) => query.outcome === "provider_error" || query.outcome === "timeout",
  ).length;
  const name = result.query.normalizedName;

  if (foundTypes.length > 3) {
    return `Found records in ${foundTypes.length} of ${result.queryResults.length} types for ${name}`;
  }
  if (foundTypes.length > 0) {
    return `Found ${joinedRecordTypes(foundTypes)} records for ${name}`;
  }
  if (failedCount === result.queryResults.length) {
    return `Could not complete the DNS lookup for ${name}`;
  }
  if (failedCount > 0) {
    return `No records returned for ${name}; some queries failed`;
  }
  return `No DNS records returned for ${name}`;
}

function LookupResults({ result }: { result: DnsLookupResponse }) {
  const [expandAll, setExpandAll] = useState(false);
  const resolver = resolverLabel(result.query.resolver);
  const authoritative = result.query.resolver === "authoritative";
  const hasInconsistentAliases = result.warnings.some((warning) => warning.code === "alias_chain_inconsistent");
  const addressDetails = new Map((result.addressDetails ?? []).map((detail) => [detail.address, detail]));
  const nameserverAddresses = new Map((result.nameserverAddresses ?? []).map((entry: DnsNameserverAddress) => [entry.nameserver, entry.addresses]));
  const hasLongGroups = result.queryResults.some((query) => query.requestedType !== "CAA" && ownerGroups(query.terminalRecords).some(([, records]) => records.length > 5));
  const traceLink = traceLinkForLookup(result);
  const checkedDnssecRecords = result.queryResults.some((query) => query.requestedType === "DS" || query.requestedType === "DNSKEY");
  const dnssec = dnssecStatus(result.queryResults, resolver);

  function downloadRecords() {
    const csv = dnsRecordsCsv({ authoritative, queryResults: result.queryResults, resolverLabel: resolver });
    const href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = href;
    link.download = `${result.query.normalizedName.replace(/[^a-z0-9.-]+/gi, "-")}-dns-records.csv`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="dns-results">
      <section className="dns-results-summary" aria-live="polite" tabIndex={-1}>
        <div className="dns-results-heading-row">
          <div className="dns-result-site">
            <WebsiteFavicon hostname={result.query.normalizedName} key={result.query.normalizedName} />
            <h2 className="dns-result-answer">{resultHeadline(result)}</h2>
          </div>
          <div className="dns-result-controls">
            {traceLink ? <a href={traceLink.href}>Trace this name</a> : null}
            {checkedDnssecRecords ? <a href={`/dnssec-checker?name=${encodeURIComponent(result.query.normalizedName)}&type=A`}>Check the full DNSSEC chain</a> : null}
            {hasLongGroups ? (
              <button onClick={() => setExpandAll((value) => !value)} type="button">
                {expandAll ? "Collapse long record lists" : "Expand all records"}
              </button>
            ) : null}
            <button onClick={downloadRecords} type="button">Download records</button>
          </div>
        </div>
        <nav aria-label="DNS record results" className="dns-result-nav">
          {result.queryResults.map((query) => {
            const hasRecords = query.terminalRecords.length > 0;
            const didFail = query.outcome === "provider_error" || query.outcome === "timeout";
            const className = `dns-result-nav-item ${hasRecords ? "dns-result-nav-found" : didFail ? "dns-result-nav-failed" : "dns-result-nav-empty"}`;
            return (
              <a
                aria-label={`${query.requestedType}: ${hasRecords ? "records returned" : didFail ? "lookup failed" : "no record returned"}`}
                className={className}
                href={`#dns-result-${query.requestedType.toLowerCase()}`}
                key={query.requestedType}
              >
                {query.requestedType}
              </a>
            );
          })}
        </nav>
        <p className="dns-results-meta">Checked with {resolver} in {result.durationMs.toLocaleString("en-US")} ms on {new Date(result.checkedAt).toLocaleString()}.</p>
      </section>

      {result.warnings.length > 0 ? (
        <section className="dns-warning-list" aria-label="Lookup warnings">
          {result.warnings.map((warning, index) => <p key={`${warning.code}-${index}`}>{warning.message}</p>)}
        </section>
      ) : null}

      {hasInconsistentAliases ? (
        <section className="dns-alias-variants">
          <h2>Alias observations differ</h2>
          {result.aliasObservations.map((observation) => (
            <div key={observation.requestedType}>
              <strong>{observation.requestedType} query</strong>
              <ol>{observation.aliasChain.map((edge) => <li key={`${edge.from}-${edge.to}`}><code><Hostname name={edge.from} /></code> → <code><Hostname name={edge.to} /></code></li>)}</ol>
            </div>
          ))}
        </section>
      ) : <AliasChain authoritative={authoritative} edges={result.aliasChain} />}

      <div
        aria-label={`DNSSEC authentication: ${dnssec.value}. ${dnssec.detail}`}
        className="dns-dnssec-status"
      >
        <span>DNSSEC authentication</span>
        <strong data-tone={dnssec.tone}>{dnssec.value}</strong>
      </div>

      <div className="dns-record-stack">
        {result.queryResults.map((query) => (
          <RecordResult
            addressDetails={addressDetails}
            authoritative={authoritative}
            expandAll={expandAll}
            key={query.requestedType}
            nameserverAddresses={nameserverAddresses}
            result={query}
          />
        ))}
      </div>

    </div>
  );
}

export function DnsLookupTool({
  initialName = "",
  initialResolver = "cloudflare",
  initialSelection = "all",
}: DnsLookupToolProps) {
  const [name, setName] = useState(initialName);
  const [resolver, setResolver] = useState<DnsResolver>(initialResolver);
  const [selection, setSelection] = useState<DnsSelection>(initialSelection);
  const [specializedOpen, setSpecializedOpen] = useState(
    specializedRecordOptions.some((option) => option.value === initialSelection),
  );
  const [result, setResult] = useState<DnsLookupResponse | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const initialRun = useRef(false);

  const requestBody = useMemo(() => ({ name, resolver, selection }), [name, resolver, selection]);

  async function runLookup(body = requestBody) {
    if (!body.name.trim()) {
      setNameError(body.selection === "PTR" ? "Enter an IP address." : "Enter a DNS name.");
      nameInputRef.current?.focus();
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setNameError(null);
    setRequestError(null);
    setResult(null);
    try {
      const response = await fetch("/api/dns/lookup", {
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
        method: "POST",
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "The DNS lookup failed.");
      setResult(data as DnsLookupResponse);
    } catch (lookupError) {
      if (controller.signal.aborted) return;
      setRequestError(lookupError instanceof Error ? lookupError.message : "The DNS lookup failed.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    if (initialRun.current || !initialName) return;
    initialRun.current = true;
    void runLookup({ name: initialName, resolver: initialResolver, selection: initialSelection });
  }, [initialName, initialResolver, initialSelection]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runLookup();
  }

  function chooseSelection(nextSelection: DnsSelection) {
    setSelection(nextSelection);
    setNameError(null);
    setRequestError(null);
  }

  return (
    <section aria-busy={loading} className="dns-tool dns-lookup-tool" data-tool-workbench id="lookup" aria-label="DNS lookup form">
      <form className="dns-lookup-form" noValidate onSubmit={submit}>
        <div className="dns-name-field">
          <UiTextField
            autoCapitalize="none"
            autoComplete="off"
            error={nameError}
            inputRef={nameInputRef}
            label={selection === "PTR" ? "IP address" : "DNS name"}
            onChange={(value) => {
              setName(value);
              if (nameError) setNameError(null);
              if (requestError) setRequestError(null);
            }}
            placeholder={selection === "PTR" ? "8.8.8.8" : "google.com"}
            required
            spellCheck={false}
            value={name}
          />
        </div>
        <fieldset className="dns-record-type-picker" role="radiogroup">
          <legend>Record type</legend>
          <div className="dns-record-type-options">
            {commonRecordOptions.map((option) => (
              <label key={option.value}>
                <input
                  checked={selection === option.value}
                  name="record-type"
                  onChange={() => chooseSelection(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <details
            className="dns-record-type-specialized"
            onToggle={(event) => setSpecializedOpen(event.currentTarget.open)}
            open={specializedOpen}
          >
            <summary>
              <span>More record types</span>
              {specializedRecordOptions.some((option) => option.value === selection) ? <small>{selection} selected</small> : null}
            </summary>
            <div className="dns-record-type-options">
              {specializedRecordOptions.map((option) => (
                <label key={option.value}>
                  <input
                    checked={selection === option.value}
                    name="record-type"
                    onChange={() => chooseSelection(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </details>
        </fieldset>
        <div className="dns-form-options">
          <UiSelect
            label="Resolver"
            onChange={(value) => {
              setResolver(value as DnsResolver);
              setRequestError(null);
            }}
            options={dnsResolverProfiles.map((profile) => ({ id: profile.id, label: profile.label }))}
            required
            value={resolver}
          />
          <UiButton className="dns-submit" isDisabled={loading} type="submit" variant="primary">
            {loading ? "Looking up…" : "Look up DNS"}
          </UiButton>
        </div>
        {requestError ? <p className="dns-form-error dns-request-error" role="alert">{requestError}</p> : null}
      </form>
      {loading ? <p className="dns-loading" aria-live="polite">Querying {resolverLabel(resolver)}…</p> : null}
      {result ? <LookupResults result={result} /> : null}
    </section>
  );
}
