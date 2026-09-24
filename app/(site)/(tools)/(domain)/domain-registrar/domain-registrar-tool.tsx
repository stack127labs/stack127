"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { UiButton, UiDisclosure, UiDownloadAction, UiRawOutput, UiTextField } from "@/app/ui/controls";
import { UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import type { DomainRegistration, RdapFetch } from "@/lib/domain/types.ts";
import {
  formatRegistrarDate,
  isRegistrarHopIncomplete,
  registrarDateRows,
  registrarDetails,
  registrarIdentity,
  registrarNotes,
  registrarResellers,
  registrarSourceHost,
  registryOperator,
} from "./domain-registrar-view";
import styles from "./domain-registrar-tool.module.css";

function CheckedNameNotice({ result }: { result: DomainRegistration }) {
  if (!result.query.reduced && !result.query.isIdn && !result.query.guessedSuffix) return null;
  const details = [];
  if (result.query.reduced) details.push(`reduced ${result.query.input} to its registrable domain`);
  if (result.query.isIdn) details.push(`queried ${result.query.domain} at the registry`);
  if (result.query.guessedSuffix) details.push("used a best-guess public suffix");
  return <p className={styles.checkedName}>Checked <code>{result.query.unicode}</code>; {details.join(" and ")}.</p>;
}

function DetailValue({ kind, source, value }: { kind: "text" | "email" | "url"; source: string; value: string }) {
  let output: ReactNode = value;
  if (kind === "email") output = <a href={`mailto:${value}`}>{value}</a>;
  if (kind === "url") output = <a href={value} rel="nofollow noreferrer">{registrarSourceHost(value) ?? value}</a>;
  return <span className={styles.sourcedValue}>{output}<small>{source}</small></span>;
}

function RegistrarDetails({ result }: { result: DomainRegistration }) {
  const details = registrarDetails(result);
  if (!details.length) return null;
  const groups = new Map<string, typeof details>();
  for (const detail of details) groups.set(detail.label, [...(groups.get(detail.label) ?? []), detail]);
  return (
    <section className={styles.section}>
      <h3>Registrar contacts and identifiers</h3>
      <UiKeyValueList rows={[...groups].map(([label, rows]) => ({
        label,
        value: <span className={styles.detailValues}>{rows.map((row) => <DetailValue key={`${row.label}-${row.source}-${row.value}`} kind={row.kind} source={row.source} value={row.value} />)}</span>,
      }))} />
      {details.some((detail) => detail.label.startsWith("Abuse")) ? <p className={styles.note}>Abuse contacts are for phishing, malware, spam, or other abuse reports, not account access.</p> : null}
    </section>
  );
}

function RoleChain({ result }: { result: DomainRegistration }) {
  const identity = registrarIdentity(result);
  const resellers = registrarResellers(result);
  return (
    <section className={styles.section}>
      <h3>Who does what</h3>
      <ol aria-label="Registry, registrar, reseller, and registrant account roles" className={styles.roleChain}>
        <li><span>Registry</span><strong>{registryOperator(result)}</strong><small>Operates .{result.query.tld} and holds the registry record</small></li>
        <li><span>Registrar</span><strong>{identity.name ?? (identity.id ? `IANA ID ${identity.id}` : "Not published")}</strong><small>Manages registration, account access, and transfer</small></li>
        <li><span>Reseller</span><strong>{resellers.length ? resellers.join(", ") : "Not published"}</strong><small>{resellers.length ? "Published between the registrar and customer" : "One may still have sold or supported the domain"}</small></li>
        <li><span>Registrant account</span><strong>Domain holder</strong><small>Access depends on the provider's identity checks</small></li>
      </ol>
    </section>
  );
}

function RegistrarDates({ result }: { result: DomainRegistration }) {
  return (
    <section className={styles.section}>
      <h3>Registrar dates</h3>
      <UiDataTable
        ariaLabel="Registrar transfer and record-change dates"
        columns={[{ id: "event", label: "Event" }, { id: "date", label: "Published date" }, { id: "source", label: "Source" }, { id: "meaning", label: "What it tells you" }]}
        rows={registrarDateRows(result).map((row) => ({ id: row.id, cells: row }))}
      />
    </section>
  );
}

function NextSteps({ result }: { result: DomainRegistration }) {
  const identity = registrarIdentity(result);
  const details = registrarDetails(result);
  const website = details.some((detail) => detail.label === "Website");
  const hasAbuse = details.some((detail) => detail.label.startsWith("Abuse"));
  return (
    <section className={styles.section}>
      <h3>Next steps</h3>
      <dl className={styles.nextSteps}>
        <div><dt>Account access</dt><dd>{website ? "Start at the published registrar website above. Expect identity verification." : identity.name || identity.id ? "Contact the registrar using the published identity above. Expect identity verification." : "No customer-access website or registrar identity was published."}</dd></div>
        <div><dt>Report abuse</dt><dd>{hasAbuse ? "Use the published abuse routes above." : "No abuse route was published in the available record."}</dd></div>
        <div><dt>Transfer</dt><dd><Link href={`/transfer-readiness?name=${encodeURIComponent(result.query.unicode)}`}>Check domain transfer readiness</Link>.</dd></div>
      </dl>
    </section>
  );
}

function Freshness({ result }: { result: DomainRegistration }) {
  const rows = [{ fetch: result.registryFetch, label: "Registry response" }, { fetch: result.registrarFetch, label: "Registrar response" }]
    .filter((entry): entry is { fetch: RdapFetch; label: string } => Boolean(entry.fetch));
  if (!rows.length) return null;
  return (
    <dl aria-label="Source freshness" className={styles.metadata}>
      {rows.map(({ fetch, label }) => <div key={label}><dt>{label}</dt><dd><span>{registrarSourceHost(fetch.url) ?? "Host not reported"}</span><time dateTime={fetch.fetchedAt}>{formatRegistrarDate(fetch.fetchedAt)}</time><span>{fetch.fromCache ? "Cached" : "Live response"}</span></dd></div>)}
    </dl>
  );
}

function RawEvidence({ result }: { result: DomainRegistration }) {
  const responses = [{ fetch: result.registryFetch, label: "Registry response" }, { fetch: result.registrarFetch, label: "Registrar response" }]
    .filter((entry): entry is { fetch: RdapFetch; label: string } => Boolean(entry.fetch));
  if (!responses.length) return null;
  return <div className={styles.evidence}>{responses.map(({ fetch, label }) => <UiRawOutput key={label} label={`${label}${registrarSourceHost(fetch.url) ? ` from ${registrarSourceHost(fetch.url)}` : ""}`} value={fetch.body ?? { error: fetch.error }} />)}</div>;
}

function RegistrarResult({ result }: { result: DomainRegistration }) {
  const identity = registrarIdentity(result);
  const notes = registrarNotes(result);
  const registered = result.status === "registered";
  const registrarHopFailed = isRegistrarHopIncomplete(result);
  const report = JSON.stringify({ tool: "Registrar Lookup", reportVersion: 1, ...result }, null, 2);
  return (
    <section aria-label="Registrar result" className={styles.results} data-registrar-result>
      <div aria-atomic="true" aria-live="polite"><UiPrimaryResult detail={identity.detail} label="Registrar" value={identity.value} /></div>
      <CheckedNameNotice result={result} />
      {registered ? <RegistrarDetails result={result} /> : null}
      {registered ? <RoleChain result={result} /> : null}
      {registered ? <RegistrarDates result={result} /> : null}
      {registered && !identity.conflict ? <NextSteps result={result} /> : null}
      {registrarHopFailed ? <UiStatus tone="warning">{result.registrarFetch ? "The registrar response failed." : "The registry did not advertise a registrar response."} Website, alternate-name, and additional abuse details may be missing.</UiStatus> : null}
      {result.status === "no_service" ? <p className={styles.recovery}>See RDAP coverage in the <Link href="/tld-directory">TLD directory</Link>.</p> : null}
      {registered && !identity.name && !identity.id ? <p className={styles.recovery}>Check the wider <Link href={`/domain-lookup?name=${encodeURIComponent(result.query.unicode)}`}>domain registration record</Link>.</p> : null}
      <Freshness result={result} />
      <div className={styles.download}><UiDownloadAction contents={report} filename={`${result.query.domain}-registrar.json`} label="Download report" mimeType="application/json;charset=utf-8" /></div>
      {notes.length ? <UiDisclosure label="Lookup notes"><ul className={styles.notes}>{notes.map((note) => <li key={note}>{note}</li>)}</ul></UiDisclosure> : null}
      <RawEvidence result={result} />
    </section>
  );
}

export function DomainRegistrarTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<DomainRegistration | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setHydrated(true), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlightRef.current) return;
    setResult(null);
    if (!name.trim()) {
      setRequestError(null);
      setFieldError("Enter a domain name, including the ending.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    inFlightRef.current = true;
    setLoading(true);
    setFieldError(null);
    setRequestError(null);
    try {
      const response = await fetch("/api/domain/lookup", { body: JSON.stringify({ includeRegistrar: true, name }), headers: { "content-type": "application/json" }, method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message ?? "The registrar lookup failed.";
        if (response.status === 400) {
          setFieldError(message);
          requestAnimationFrame(() => inputRef.current?.focus());
          return;
        }
        throw new Error(message);
      }
      setResult(data as DomainRegistration);
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "The registrar lookup failed.");
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }

  return (
    <section aria-label="Registrar lookup" className={`domain-tool ${styles.workbench}`} data-hydrated={hydrated ? "true" : undefined} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <UiTextField autoCapitalize="none" autoComplete="off" className={styles.queryField} error={fieldError} inputMode="url" inputRef={inputRef} label="Domain name" name="name" onChange={(value) => { setName(value); if (fieldError) setFieldError(null); if (requestError) setRequestError(null); }} placeholder="example.com" required spellCheck={false} type="text" value={name} />
        <UiButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">{loading ? "Finding the registrar..." : "Find the registrar"}</UiButton>
        {loading ? <div className={styles.formStatus}><UiStatus>Finding the registrar...</UiStatus></div> : null}
      </form>
      {result ? <RegistrarResult result={result} /> : requestError ? <section aria-label="Registrar result" className={styles.results} data-registrar-result><div><UiPrimaryResult detail={`${name.trim()} could not be checked.`} label="Registrar" value="Cannot determine" /></div><UiStatus tone="danger">{requestError}</UiStatus></section> : null}
    </section>
  );
}
