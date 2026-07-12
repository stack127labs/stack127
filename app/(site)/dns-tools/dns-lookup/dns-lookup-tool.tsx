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
const examples = ["example.com", "www.example.com", "mail.example.com"];

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

function dnssecCopy(value: boolean | null) {
  if (value === true) {
    return {
      label: "DNSSEC authentication reported: Yes",
      explanation: "The selected resolver reports that it authenticated the returned data. This is not a complete diagnosis of the domain's DNSSEC configuration.",
    };
  }
  if (value === false) {
    return {
      label: "DNSSEC authentication reported: No",
      explanation: "The resolver did not report this answer as authenticated. This alone does not prove DNSSEC is broken; the name may be unsigned.",
    };
  }
  return { label: "DNSSEC authentication reported: Not reported", explanation: null };
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
    <section className="dns-alias-summary" aria-labelledby="dns-alias-title">
      <h2 id="dns-alias-title">Alias chain</h2>
      {edges.length === 1 ? (
        <>
          <p><code>{edges[0].from}</code> is an alias for <code>{edges[0].to}</code>. The records below may belong to the alias target.</p>
          <small>Resolver TTL: {formatResolverTtl(edges[0].resolverTtlSeconds)}</small>
        </>
      ) : (
        <ol>
          {edges.map((edge) => (
            <li key={`${edge.from}-${edge.to}`}>
              <code>{edge.from}</code> → <code>{edge.to}</code>
              <small>Resolver TTL: {formatResolverTtl(edge.resolverTtlSeconds)}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function RecordCard({ record }: { record: NormalizedDnsRecord }) {
  const [copied, setCopied] = useState(false);
  const fields = recordFields(record);
  return (
    <article className="dns-record-card">
      <dl>
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd><code>{field.value}</code></dd>
          </div>
        ))}
        <div>
          <dt>Resolver TTL</dt>
          <dd>{formatResolverTtl(record.resolverTtlSeconds)}</dd>
        </div>
      </dl>
      <button
        className="dns-copy-button"
        onClick={async () => {
          await copyText(record.value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        type="button"
      >
        {copied ? "Copied" : "Copy value"}
      </button>
    </article>
  );
}

function OwnerRecords({ ownerName, records, type }: { ownerName: string; records: NormalizedDnsRecord[]; type: string }) {
  const [expanded, setExpanded] = useState(false);
  const visibleRecords = expanded ? records : records.slice(0, 5);
  const remaining = records.length - visibleRecords.length;
  return (
    <div className="dns-owner-group">
      <h2>{type} records for {ownerName}</h2>
      <div className="dns-record-grid">
        {visibleRecords.map((record, index) => (
          <RecordCard key={`${record.ownerName}-${record.type}-${record.value}-${index}`} record={record} />
        ))}
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
    <section className="dns-record-group">
      {ownerGroups(result.terminalRecords).map(([ownerName, records]) => (
        <OwnerRecords key={ownerName} ownerName={ownerName} records={records} type={result.requestedType} />
      ))}
    </section>
  );
}

function DnssecSummary({ queryResults }: { queryResults: DnsQueryResult[] }) {
  const reported = new Set(queryResults.map((result) => result.flags.authenticatedData));
  if (reported.size === 1) {
    const copy = dnssecCopy(queryResults[0]?.flags.authenticatedData ?? null);
    return (
      <section className="dns-dnssec-note">
        <strong>{copy.label}</strong>
        {copy.explanation ? <p>{copy.explanation}</p> : null}
      </section>
    );
  }
  return (
    <section className="dns-dnssec-note">
      <strong>DNSSEC authentication reporting varies by query</strong>
      <p>Open Technical details to see what the resolver reported for each record type. Mixed AD values are not a complete diagnosis of the domain's DNSSEC configuration.</p>
    </section>
  );
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
        <section>
          <h3>Raw response</h3>
          <pre>{JSON.stringify(result.rawResponse, null, 2)}</pre>
        </section>
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

  const shareUrl = typeof window === "undefined" ? "" : (() => {
    const url = new URL("/dns-tools/dns-lookup", window.location.origin);
    url.searchParams.set("name", result.query.normalizedName);
    url.searchParams.set("type", result.query.selection);
    url.searchParams.set("resolver", result.query.resolver);
    return url.toString();
  })();

  return (
    <div className="dns-results">
      <section className="dns-results-summary" aria-live="polite" tabIndex={-1}>
        <div>
          <p className="dns-page-kicker">Lookup complete</p>
          <h2>{result.query.normalizedName}</h2>
          <p>{result.queryResults.length} record types checked through {resolver}. {found.length} returned terminal records, {noAnswer.length} returned no terminal record, and {failed.length} failed.</p>
          <small>Checked {new Date(result.checkedAt).toLocaleString()} in {result.durationMs.toLocaleString("en-US")} ms.</small>
        </div>
        <div className="dns-result-actions">
          <button onClick={() => copyText(shareUrl)} type="button">Copy lookup link</button>
          <button onClick={() => copyText(JSON.stringify(result, null, 2))} type="button">Copy results</button>
        </div>
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

      <p className="dns-ttl-explanation">
        This is the remaining cache lifetime reported by {resolver}. It may be lower than the TTL configured by the domain owner.
      </p>

      <DnssecSummary queryResults={result.queryResults} />

      {found.map((query) => <RecordResult key={query.requestedType} result={query} />)}

      {noAnswer.length > 0 ? (
        <details className="dns-empty-results">
          <summary>No terminal records returned for {noAnswer.length} {noAnswer.length === 1 ? "query" : "queries"}</summary>
          <ul>{noAnswer.map((query) => <li key={query.requestedType}><strong>{query.requestedType}</strong>: {query.responseCode ?? query.outcome}</li>)}</ul>
        </details>
      ) : null}

      {failed.length > 0 ? (
        <section className="dns-failed-results">
          <h2>Could not complete</h2>
          <ul>{failed.map((query) => <li key={query.requestedType}><strong>{query.requestedType}</strong>: {query.error?.message ?? "Provider error"}</li>)}</ul>
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
    <section className="dns-tool" id="lookup" aria-labelledby="lookup-form-title">
      <form className="dns-lookup-form" onSubmit={submit}>
        <div className="dns-form-heading">
          <h2 id="lookup-form-title">Look up DNS records</h2>
          <p>Enter an exact DNS name. Pasted HTTP and HTTPS URLs are reduced to their hostname.</p>
        </div>
        <label className="dns-name-field">
          <span>DNS name</span>
          <input
            autoCapitalize="none"
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            placeholder="example.com"
            spellCheck={false}
            type="text"
            value={name}
          />
        </label>
        <div className="dns-examples" aria-label="Quick examples">
          <span>Try:</span>
          {examples.map((example) => <button key={example} onClick={() => setName(example)} type="button">{example}</button>)}
        </div>
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
