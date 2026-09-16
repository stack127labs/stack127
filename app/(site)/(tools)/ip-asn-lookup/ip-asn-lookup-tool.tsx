"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import {
  ToolActionRow,
  ToolButton,
  ToolDataTable,
  ToolDisclosure,
  ToolDownloadAction,
  ToolKeyValueList,
  ToolPrimaryResult,
  ToolRawOutput,
  ToolStatus,
  ToolTextField,
} from "@/app/tool-ui/tool-controls";
import type { NetworkLookupResult } from "@/lib/ip-asn/types";
import styles from "./ip-asn-lookup.module.css";

type Props = { initialQuery?: string };

function valueOrUnknown(value: string | number | null | undefined): ReactNode {
  return value === null || value === undefined || value === "" ? "Not published" : <code>{String(value)}</code>;
}

function holderLabel(result: NetworkLookupResult) {
  return result.holder?.organization ?? result.holder?.name ?? "no holder published";
}

function leadText(result: NetworkLookupResult) {
  if (result.status === "not_registered") return `No RIR record for ${result.query.normalized}.`;
  if (result.status !== "registered") return "Cannot determine";
  if (result.query.kind === "ip") {
    return `${result.query.normalized}: ${holderLabel(result)} (${result.registry?.name ?? "RIR"}).`;
  }
  return `${result.query.normalized}: ${holderLabel(result)} (${result.registry?.name ?? "RIR"}).`;
}

function statusMessage(result: NetworkLookupResult) {
  if (result.status === "not_registered") return "No RIR record for this input.";
  if (result.status === "rate_limited") return "Registry rate limited. Try shortly.";
  if (result.status === "blocked") return "Registry blocked this request. Retry later.";
  if (result.status === "timeout") return "Registry timeout. Retry.";
  if (result.status === "no_service") return "No RIR service matched.";
  return "Registry response unavailable. Retry.";
}

function safeExternalHref(value: string | null) {
  if (!value) return null;
  return value.startsWith("https://") || value.startsWith("mailto:") ? value : null;
}

function eventRows(result: NetworkLookupResult) {
  return result.events.map((event, index) => ({
    id: `${event.action}-${index}`,
    cells: {
      event: event.action,
      date: event.date ? <time dateTime={event.date}>{event.date}</time> : "Not published",
    },
  }));
}

function Allocation({ result }: { result: NetworkLookupResult }) {
  const allocation = result.allocation;
  const autnum = result.autnum;
  const rows = result.query.kind === "ip" ? [
    { label: "Range", value: valueOrUnknown(allocation?.range) },
    { label: "Name", value: valueOrUnknown(allocation?.name) },
    { label: "Handle", value: valueOrUnknown(allocation?.handle) },
    { label: "IP version", value: valueOrUnknown(allocation?.ipVersion) },
    { label: "Type", value: valueOrUnknown(allocation?.type) },
    { label: "Registered country", value: valueOrUnknown(allocation?.country) },
    { label: "Parent allocation", value: valueOrUnknown(allocation?.parentHandle) },
    { label: "Status", value: allocation?.status?.length ? allocation.status.join(", ") : "Not published" },
  ] : [
    { label: "ASN range", value: valueOrUnknown(autnum?.range) },
    { label: "Name", value: valueOrUnknown(autnum?.name) },
    { label: "Handle", value: valueOrUnknown(autnum?.handle) },
    { label: "Registered country", value: valueOrUnknown(autnum?.country) },
    { label: "Status", value: autnum?.status?.length ? autnum.status.join(", ") : "Not published" },
  ];
  return (
    <section className={styles.section}>
      <h2>{result.query.kind === "ip" ? "Allocation" : "ASN record"}</h2>
      <ToolKeyValueList rows={rows} />
      {result.events.length ? (
        <ToolDataTable
          ariaLabel="RIR registration dates"
          columns={[{ id: "event", label: "Event" }, { id: "date", label: "Published date" }]}
          rows={eventRows(result)}
        />
      ) : null}
    </section>
  );
}

function AbuseContact({ result }: { result: NetworkLookupResult }) {
  if (!result.abuse) return null;
  const email = safeExternalHref(result.abuse.email ? `mailto:${result.abuse.email}` : null);
  const contact = safeExternalHref(result.abuse.contactUri);
  return (
    <section className={styles.abuse}>
      <h2>Abuse contact</h2>
      {result.abuse.name ? <p>{result.abuse.name}</p> : null}
      {email ? <a className={styles.externalLink} href={email}>{result.abuse.email}</a> : null}
      {result.abuse.phone ? <p>{result.abuse.phone}</p> : null}
      {contact ? <a className={styles.externalLink} href={contact} rel="noreferrer" target="_blank">Contact form</a> : null}
      {!email && !result.abuse.phone && !contact ? <p>Not published</p> : null}
    </section>
  );
}

function Routing({ result }: { result: NetworkLookupResult }) {
  if (result.query.kind !== "ip") return null;
  return (
    <section className={styles.section}>
      <h2>Current BGP route</h2>
      {result.routing ? (
        <>
          <ToolKeyValueList rows={[
            { label: "Origin ASN", value: valueOrUnknown(result.routing.asn ? `AS${result.routing.asn}` : null) },
            { label: "Announced prefix", value: valueOrUnknown(result.routing.prefix) },
            { label: "Network", value: valueOrUnknown(result.routing.networkName) },
            { label: "Route country", value: valueOrUnknown(result.routing.countryCode) },
            { label: "Source", value: result.routing.source },
          ]} />
          <p className={styles.primaryText}>Routing context, not registration.</p>
        </>
      ) : <ToolStatus tone="warning">Current route unavailable.</ToolStatus>}
    </section>
  );
}

function SourceMetadata({ result }: { result: NetworkLookupResult }) {
  const sourceUrl = safeExternalHref(result.registry?.url ?? null);
  return (
    <dl aria-label="Lookup source and freshness" className={styles.metadata}>
      <div><dt>RIR registration</dt><dd>{result.registry?.name ?? "Unknown"}{sourceUrl ? <a href={sourceUrl} rel="noreferrer" target="_blank">Registry record</a> : null}</dd></div>
      <div><dt>Fetched</dt><dd>{result.registry?.fetchedAt ? <time dateTime={result.registry.fetchedAt}>{result.registry.fetchedAt}</time> : "Unknown"}{result.registry?.fromCache ? <span>Cached</span> : null}</dd></div>
    </dl>
  );
}

function Notes({ result }: { result: NetworkLookupResult }) {
  const items = [
    ...result.notes,
    ...result.remarks.flatMap((remark) => remark.description),
    ...result.notices.flatMap((notice) => notice.description),
  ].filter(Boolean);
  if (!items.length) return null;
  return <ToolDisclosure label="Lookup notes"><ul className={styles.notes}>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></ToolDisclosure>;
}

function Result({ result, onReset }: { result: NetworkLookupResult; onReset: () => void }) {
  const resultRef = useRef<HTMLElement>(null);
  useEffect(() => { resultRef.current?.focus({ preventScroll: true }); }, [result]);
  const report = JSON.stringify({ tool: "IP and ASN registration lookup", reportVersion: 1, networkLookupVersion: 1, ...result }, null, 2);
  const registered = result.status === "registered";
  return (
    <section aria-label="IP and ASN registration result" className={styles.result} data-ip-asn-result ref={resultRef} tabIndex={-1}>
      <div aria-atomic="true" aria-live="polite" className={styles.primary}>
        <ToolPrimaryResult detail={registered ? undefined : statusMessage(result)} label="RIR registration" value={leadText(result)} />
      </div>
      {registered ? <>
        <Allocation result={result} />
        <AbuseContact result={result} />
        <Routing result={result} />
        <SourceMetadata result={result} />
        <Notes result={result} />
        <ToolRawOutput label={`Raw RDAP response${result.registry?.name ? ` from ${result.registry.name}` : ""}`} value={result.raw ?? { status: result.status }} />
        <ToolActionRow>
          <ToolDownloadAction contents={report} filename={`${result.query.normalized.toLowerCase()}-rdap.json`} label="Download report" mimeType="application/json;charset=utf-8" />
          <ToolButton aria-label="Reset lookup" onPress={onReset} variant="secondary"><RotateCcw aria-hidden="true" size={17} />Reset lookup</ToolButton>
        </ToolActionRow>
      </> : <ToolActionRow>
        <ToolButton aria-label="Reset lookup" onPress={onReset} variant="secondary"><RotateCcw aria-hidden="true" size={17} />Reset lookup</ToolButton>
      </ToolActionRow>}
    </section>
  );
}

export function IpAsnLookupTool({ initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<NetworkLookupResult | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<{ controller: AbortController; id: number } | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setClientReady(true);
    return () => requestRef.current?.controller.abort();
  }, []);

  function clearOnEdit() {
    requestRef.current?.controller.abort();
    requestRef.current = null;
    setLoading(false);
    if (result) setResult(null);
    if (requestError) setRequestError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const formInput = event.currentTarget.elements.namedItem("query");
    const submittedQuery = formInput instanceof HTMLInputElement ? formInput.value : query;
    setResult(null);
    setRequestError(null);
    if (!submittedQuery.trim()) {
      setFieldError("Enter an IP address or ASN.");
      window.setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }
    setFieldError(null);
    requestRef.current?.controller.abort();
    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    requestRef.current = { controller, id: requestId };
    setLoading(true);
    try {
      const response = await fetch("/api/ip-asn-lookup", {
        body: JSON.stringify({ query: submittedQuery }),
        headers: { "content-type": "application/json" },
        method: "POST",
        signal: controller.signal,
      });
      const data = await response.json();
      if (requestRef.current?.id !== requestId) return;
      if (!response.ok) {
        const message = data?.error?.message ?? "We could not complete this lookup.";
        if (response.status === 400) {
          setFieldError(message);
          window.setTimeout(() => inputRef.current?.focus(), 0);
          return;
        }
        setRequestError(message);
        return;
      }
      setResult(data as NetworkLookupResult);
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
      if (requestRef.current?.id !== requestId) return;
      setRequestError("We could not complete this lookup.");
    } finally {
      if (requestRef.current?.id === requestId) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  function handleInputCapture(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.name !== "query") return;
    setQuery(target.value);
    clearOnEdit();
  }

  function reset() {
    requestRef.current?.controller.abort();
    requestRef.current = null;
    setLoading(false);
    setQuery("");
    setResult(null);
    setFieldError(null);
    setRequestError(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <section aria-label="IP and ASN registration lookup workbench" className={styles.tool} data-client-ready={clientReady ? "true" : undefined} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} noValidate onInputCapture={handleInputCapture} onSubmit={submit}>
        <ToolTextField autoCapitalize="none" autoComplete="off" className={styles.queryField} error={fieldError} inputMode="text" inputRef={inputRef} label="IP address or ASN" name="query" onChange={(value) => { setQuery(value); if (fieldError) setFieldError(null); }} placeholder="1.1.1.1 or AS13335" required spellCheck={false} type="text" value={query} />
        <ToolButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">{loading ? "Looking up registration..." : "Look up registration"}</ToolButton>
        {loading ? <div className={styles.formStatus}><ToolStatus>Looking up registration...</ToolStatus></div> : null}
      </form>
      {result ? <Result onReset={reset} result={result} /> : requestError ? (
        <section aria-label="IP and ASN registration result" className={styles.requestFailure} data-ip-asn-result tabIndex={-1}>
          <ToolPrimaryResult detail={requestError} label="RIR registration" value="Cannot determine" />
          <ToolStatus tone="danger">{requestError}</ToolStatus>
          <ToolButton aria-label="Reset lookup" onPress={reset} variant="secondary"><RotateCcw aria-hidden="true" size={17} />Reset lookup</ToolButton>
        </section>
      ) : null}
    </section>
  );
}
