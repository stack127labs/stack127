"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { formatResolverTtl, recordFields } from "@/lib/dns/format-record.ts";
import type {
  DnsAliasEdge,
  DnsLookupResponse,
  DnsQueryResult,
  DnsRecordType,
  DnsResolver,
  DnsSelection,
  NormalizedDnsRecord,
} from "@/lib/dns/types.ts";

const recordOptions: { label: string; value: DnsSelection }[] = [
  { label: "Common records", value: "common" },
  ...(["A", "AAAA", "CNAME", "MX", "NS", "TXT", "CAA", "SOA", "SRV", "DS", "DNSKEY"] as DnsRecordType[])
    .map((value) => ({ label: value, value })),
];
type DnsLookupToolProps = {
  initialName?: string;
  initialResolver?: DnsResolver;
  initialSelection?: DnsSelection;
};

function resolverName(resolver: DnsResolver) {
  return resolver === "cloudflare" ? "Cloudflare" : "Google Public DNS";
}

function yesNoUnknown(value: boolean | null) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not reported";
}

function ownerGroups(records: NormalizedDnsRecord[]) {
  const groups = new Map<string, NormalizedDnsRecord[]>();
  for (const record of records) groups.set(record.ownerName, [...(groups.get(record.ownerName) ?? []), record]);
  return [...groups.entries()];
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

function AliasChain({ edges }: { edges: DnsAliasEdge[] }) {
  if (edges.length === 0) return null;
  return (
    <div className="dns-alias-summary" aria-label="Alias chain">
      {edges.length === 1 ? (
        <>
          <p><code>{edges[0].from}</code> points to <code>{edges[0].to}</code>, so the records below may belong to the second name.</p>
          <p>The resolver reported {formatResolverTtl(edges[0].resolverTtlSeconds)} for this alias.</p>
        </>
      ) : (
        <>
          <p>The name passes through this alias chain before reaching the records below.</p>
          <ol>
            {edges.map((edge) => (
              <li key={`${edge.from}-${edge.to}`}>
                <code>{edge.from}</code> → <code>{edge.to}</code>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function RecordRow({ record }: { record: NormalizedDnsRecord }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fields = recordFields(record);
  return (
    <tr>
      {fields.map((field) => (
        <td key={field.label}>
          <span className="dns-value-with-copy">
            <code>{field.value}</code>
            <button
              aria-label={`Copy ${field.label}`}
              className="dns-copy-icon"
              onClick={async () => {
                await copyText(field.value);
                setCopiedField(field.label);
                window.setTimeout(() => setCopiedField(null), 1500);
              }}
              title={copiedField === field.label ? "Copied" : `Copy ${field.label}`}
              type="button"
            >
              {copiedField === field.label ? (
                <span aria-hidden="true">✓</span>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 20 20">
                  <rect height="10" rx="1.5" width="10" x="7" y="3" />
                  <path d="M5 7H4.5A1.5 1.5 0 0 0 3 8.5v7A1.5 1.5 0 0 0 4.5 17h7a1.5 1.5 0 0 0 1.5-1.5V15" />
                </svg>
              )}
            </button>
          </span>
        </td>
      ))}
      <td>{formatResolverTtl(record.resolverTtlSeconds)}</td>
    </tr>
  );
}

function OwnerRecords({ ownerName, records, type }: { ownerName: string; records: NormalizedDnsRecord[]; type: string }) {
  const [expanded, setExpanded] = useState(false);
  const visibleRecords = expanded ? records : records.slice(0, 5);
  const remaining = records.length - visibleRecords.length;
  const fields = recordFields(records[0]);
  return (
    <div className="dns-owner-group">
      <h2>{type} records for {ownerName}</h2>
      <div className="dns-table-scroll">
        <table className="dns-answer-table">
          <thead>
            <tr>
              {fields.map((field) => <th key={field.label} scope="col">{field.label}</th>)}
              <th scope="col">Resolver TTL</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record, index) => (
              <RecordRow key={`${record.ownerName}-${record.type}-${record.value}-${index}`} record={record} />
            ))}
          </tbody>
        </table>
      </div>
      {records.length > 5 ? (
        <button className="dns-show-more" onClick={() => setExpanded((value) => !value)} type="button">
          {expanded ? "Show fewer records" : `Show ${remaining} more ${type} records`}
        </button>
      ) : null}
    </div>
  );
}

function RecordResult({ result }: { result: DnsQueryResult }) {
  if (result.terminalRecords.length === 0) return null;
  return (
    <section className="dns-record-group" id={`dns-result-${result.requestedType.toLowerCase()}`}>
      {ownerGroups(result.terminalRecords).map(([ownerName, records]) => (
        <OwnerRecords key={ownerName} ownerName={ownerName} records={records} type={result.requestedType} />
      ))}
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

function dnssecSummary(queryResults: DnsQueryResult[], resolver: string) {
  const reported = new Set(queryResults.map((result) => result.flags.authenticatedData));
  if (reported.size !== 1) {
    return `${resolver} reported different DNSSEC authentication states across the queries. The individual flags are in Technical details.`;
  }
  const value = queryResults[0]?.flags.authenticatedData ?? null;
  if (value === true) return `${resolver} authenticated this answer with DNSSEC. This does not replace a full check of the domain's DNSSEC setup.`;
  if (value === false) return `${resolver} did not mark this answer as authenticated. That is normal for unsigned names and does not by itself mean DNSSEC is broken.`;
  return `${resolver} did not report whether this answer was authenticated with DNSSEC.`;
}

function RecordsList({ records }: { records: NormalizedDnsRecord[] | null }) {
  if (records === null) return <p>Not reported</p>;
  if (records.length === 0) return <p>Reported as empty</p>;
  return (
    <ul className="dns-technical-records">
      {records.map((record, index) => (
        <li key={`${record.ownerName}-${record.type}-${index}`}>
          <code>{record.ownerName} {record.type} {record.value}</code>
          <span>Resolver TTL: {formatResolverTtl(record.resolverTtlSeconds)}</span>
        </li>
      ))}
    </ul>
  );
}

function TechnicalDetails({ result }: { result: DnsQueryResult }) {
  return (
    <details className="dns-query-details">
      <summary>{result.requestedType}: Technical details</summary>
      <div className="dns-query-details-body">
        <dl className="dns-flag-grid">
          <div><dt>Response code</dt><dd>{result.responseCode ?? "Not reported"}</dd></div>
          <div><dt>Authenticated data</dt><dd>{yesNoUnknown(result.flags.authenticatedData)}</dd></div>
          <div><dt>Checking disabled</dt><dd>{yesNoUnknown(result.flags.checkingDisabled)}</dd></div>
          <div><dt>Recursion desired</dt><dd>{yesNoUnknown(result.flags.recursionDesired)}</dd></div>
          <div><dt>Recursion available</dt><dd>{yesNoUnknown(result.flags.recursionAvailable)}</dd></div>
          <div><dt>Truncated</dt><dd>{yesNoUnknown(result.flags.truncated)}</dd></div>
        </dl>
        <section><h3>Authority records</h3><RecordsList records={result.authorityRecords} /></section>
        <section><h3>Additional records</h3><RecordsList records={result.additionalRecords} /></section>
        <section><h3>Comments</h3>{result.comments === null ? <p>Not reported</p> : result.comments.length === 0 ? <p>Reported as empty</p> : <ul>{result.comments.map((comment) => <li key={comment}>{comment}</li>)}</ul>}</section>
      </div>
    </details>
  );
}

function LookupResults({ result }: { result: DnsLookupResponse }) {
  const found = result.queryResults.filter((query) => query.terminalRecords.length > 0);
  const noAnswer = result.queryResults.filter((query) => query.outcome === "no_answer" || query.outcome === "nxdomain" || query.outcome === "dns_error");
  const failed = result.queryResults.filter((query) => query.outcome === "provider_error" || query.outcome === "timeout");
  const resolver = resolverName(result.query.resolver);
  const hasInconsistentAliases = result.warnings.some((warning) => warning.code === "alias_chain_inconsistent");

  return (
    <div className="dns-results">
      <section className="dns-results-summary" aria-live="polite" tabIndex={-1}>
        <h2>{result.query.normalizedName}</h2>
        <nav aria-label="DNS record results" className="dns-result-nav">
          {result.queryResults.map((query) => {
            const hasRecords = query.terminalRecords.length > 0;
            const didFail = query.outcome === "provider_error" || query.outcome === "timeout";
            const className = `dns-result-nav-item ${hasRecords ? "dns-result-nav-found" : didFail ? "dns-result-nav-failed" : "dns-result-nav-empty"}`;
            return hasRecords ? (
              <a aria-label={`${query.requestedType}: records returned`} className={className} href={`#dns-result-${query.requestedType.toLowerCase()}`} key={query.requestedType}>{query.requestedType}</a>
            ) : (
              <span aria-label={`${query.requestedType}: ${didFail ? "lookup failed" : "no record returned"}`} className={className} key={query.requestedType}>{query.requestedType}</span>
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
              <ol>{observation.aliasChain.map((edge) => <li key={`${edge.from}-${edge.to}`}><code>{edge.from}</code> → <code>{edge.to}</code></li>)}</ol>
            </div>
          ))}
        </section>
      ) : <AliasChain edges={result.aliasChain} />}

      <p className="dns-dnssec-summary">{dnssecSummary(result.queryResults, resolver)}</p>

      {found.map((query) => <RecordResult key={query.requestedType} result={query} />)}

      {noAnswer.length > 0 ? (
        <details className="dns-empty-results">
          <summary>No terminal records returned for {noAnswer.length} {noAnswer.length === 1 ? "query" : "queries"}</summary>
          <ul>{noAnswer.map((query) => <li key={query.requestedType}><p><strong>{query.requestedType}</strong>: {query.responseCode ?? query.outcome}</p><RawResponse result={query} /></li>)}</ul>
        </details>
      ) : null}

      {failed.length > 0 ? (
        <section className="dns-failed-results">
          <h2>Could not complete</h2>
          <ul>{failed.map((query) => <li key={query.requestedType}><p><strong>{query.requestedType}</strong>: {query.error?.message ?? "Provider error"}</p><RawResponse result={query} /></li>)}</ul>
        </section>
      ) : null}

      <details className="dns-technical-details">
        <summary>Technical details</summary>
        <div>{result.queryResults.map((query) => <TechnicalDetails key={query.requestedType} result={query} />)}</div>
      </details>

    </div>
  );
}

export function DnsLookupTool({
  initialName = "",
  initialResolver = "cloudflare",
  initialSelection = "common",
}: DnsLookupToolProps) {
  const [name, setName] = useState(initialName);
  const [resolver, setResolver] = useState<DnsResolver>(initialResolver);
  const [selection, setSelection] = useState<DnsSelection>(initialSelection);
  const [result, setResult] = useState<DnsLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const initialRun = useRef(false);

  const requestBody = useMemo(() => ({ name, resolver, selection }), [name, resolver, selection]);

  async function runLookup(body = requestBody) {
    if (!body.name.trim()) {
      setError("Enter a DNS name.");
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
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
      setError(lookupError instanceof Error ? lookupError.message : "The DNS lookup failed.");
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

  return (
    <section className="dns-tool" id="lookup" aria-label="DNS lookup form">
      <form className="dns-lookup-form" onSubmit={submit}>
        <label className="dns-name-field">
          <span>DNS name</span>
          <input
            autoCapitalize="none"
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            placeholder="google.com"
            spellCheck={false}
            type="text"
            value={name}
          />
        </label>
        <div className="dns-form-options">
          <label>
            <span>Record type</span>
            <select onChange={(event) => setSelection(event.target.value as DnsSelection)} value={selection}>
              {recordOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>Resolver</span>
            <select onChange={(event) => setResolver(event.target.value as DnsResolver)} value={resolver}>
              <option value="cloudflare">Cloudflare</option>
              <option value="google">Google Public DNS</option>
            </select>
          </label>
          <button className="dns-submit" disabled={loading} type="submit">{loading ? "Looking up..." : "Look up DNS"}</button>
        </div>
        {error ? <p className="dns-form-error" role="alert">{error}</p> : null}
      </form>
      {loading ? <p className="dns-loading" aria-live="polite">Querying {resolverName(resolver)}...</p> : null}
      {result ? <LookupResults result={result} /> : null}
    </section>
  );
}
