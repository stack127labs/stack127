"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import {
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
import { declaresRedaction } from "@/lib/domain/redaction.ts";
import type { DomainRegistration, RdapFetch, RdapSource } from "@/lib/domain/types.ts";
import {
  contactRoutes,
  filteredOwnerNotes,
  formatOwnerDate,
  isRegistrarHopIncomplete,
  ownerVerdict,
  publishedRegistrantRows,
  redactionDeclarationOnly,
  redactionRows,
  sourceHost,
  type ContactRoute,
} from "./domain-owner-view";
import styles from "./domain-owner-tool.module.css";

const sourceText = (source: RdapSource) => source === "registrar" ? "Registrar" : "Registry";

function CheckedNameNotice({ result }: { result: DomainRegistration }) {
  if (!result.query.reduced && !result.query.isIdn && !result.query.guessedSuffix) return null;
  const parts = [`Checked ${result.query.unicode}`];
  if (result.query.reduced) parts.push(`after reducing ${result.query.input} to its registrable domain`);
  if (result.query.isIdn) parts.push(`using the registry name ${result.query.domain}`);
  if (result.query.guessedSuffix) parts.push("using a best-guess public suffix");
  return <p className={styles.checkedName}>{parts.join(", ")}.</p>;
}

function contributionText(result: DomainRegistration, source: RdapSource) {
  const entities = result.entities.filter((entity) => entity.source === source);
  const roles = [...new Set(entities.flatMap((entity) => entity.roles))];
  const labels = roles.map((role) => role === "registrant" ? "Registrant contact" : role === "abuse" ? "Abuse contact" : role === "registrar" ? "Registrar contact" : `${role} contact`);
  const fetch = source === "registry" ? result.registryFetch : result.registrarFetch;
  const hasRedactions = redactionRows(result).some((row) => row.source === sourceText(source)) || declaresRedaction(fetch?.body);
  if (hasRedactions) labels.push("Declared redaction evidence");
  return labels.length ? labels : ["No contact entities returned"];
}

function SourceMap({ result }: { result: DomainRegistration }) {
  if (result.status !== "registered") return null;
  const responses = [
    result.registryFetch?.status === "registered" ? { fetch: result.registryFetch, source: "registry" as const } : null,
    result.registrarFetch?.status === "registered" ? { fetch: result.registrarFetch, source: "registrar" as const } : null,
  ].filter((item): item is { fetch: RdapFetch; source: "registry" | "registrar" } => Boolean(item));
  if (!responses.length) return null;
  return (
    <figure aria-label="Registry and registrar contributions to the public registrant record" className={styles.sourceMap}>
      <figcaption>Where this evidence came from</figcaption>
      <div className={styles.sourceNodes}>
        <div className={styles.providerNodes}>
          {responses.map(({ fetch, source }) => (
            <div className={styles.sourceNode} key={source}>
              <strong>{sourceText(source)}</strong>
              <code>{sourceHost(fetch) ?? "Source host not reported"}</code>
              <span>{contributionText(result, source).join("; ")}</span>
            </div>
          ))}
        </div>
        <div className={styles.recordNode}>Public registrant record</div>
      </div>
    </figure>
  );
}

function routeValue(route: ContactRoute) {
  const href = route.kind.endsWith("email") ? `mailto:${route.value}` : route.kind === "abuse-phone" ? `tel:${route.value}` : route.value;
  const external = route.kind === "registrant-form";
  const abuse = route.kind.startsWith("abuse");
  return (
    <span className={styles.routeValue}>
      <a href={href} {...(external ? { rel: "nofollow noreferrer", target: "_blank" } : {})}>{route.value}</a>
      <small>{route.source}</small>
      {abuse ? <small>For phishing, malware, spam, and other abuse reports only. This is not a general owner contact.</small> : null}
    </span>
  );
}

function uniqueRouteLabels(routes: ContactRoute[]) {
  const totals = new Map<string, number>();
  for (const route of routes) totals.set(route.label, (totals.get(route.label) ?? 0) + 1);
  const seen = new Map<string, number>();
  return routes.map((route) => {
    const count = (seen.get(route.label) ?? 0) + 1;
    seen.set(route.label, count);
    return { ...route, displayLabel: (totals.get(route.label) ?? 0) > 1 ? `${route.label} ${count}` : route.label };
  });
}

function ContactRoutes({ result, verdict }: { result: DomainRegistration; verdict: ReturnType<typeof ownerVerdict> }) {
  const routes = uniqueRouteLabels(contactRoutes(result));
  const showRdrs = verdict.value === "Not published" && result.query.tldType === "generic";
  if (!routes.length && !showRdrs) return null;
  const rows: Array<{ label: string; value: ReactNode }> = routes.map((route) => ({ label: route.displayLabel, value: routeValue(route) }));
  if (showRdrs) rows.push({
    label: "Nonpublic gTLD request",
    value: <span className={styles.routeValue}><a href="https://www.icann.org/rdrs-en" rel="noreferrer" target="_blank">Request nonpublic gTLD data through ICANN</a><small>This submits a documented-interest request. It does not guarantee disclosure.</small></span>,
  });
  return <section className={styles.group}><h3>How to make contact</h3><ToolKeyValueList rows={rows} /></section>;
}

function PublishedFields({ result }: { result: DomainRegistration }) {
  const rows = publishedRegistrantRows(result);
  return (
    <section className={styles.group}>
      <h3>What is published</h3>
      {rows.length ? (
        <ToolDataTable
          ariaLabel="Published domain contact fields"
          columns={[{ id: "role", label: "Role" }, { id: "field", label: "Field" }, { id: "value", label: "Published value" }, { id: "source", label: "Source" }]}
          rows={rows.map((row, index) => ({ id: `${index}-${row.role}-${row.field}-${row.value}`, cells: { role: row.role, field: row.field, value: row.value, source: row.source } }))}
        />
      ) : <p className={styles.empty}>No public contact fields were returned.</p>}
    </section>
  );
}

function Redactions({ result }: { result: DomainRegistration }) {
  const rows = redactionRows(result);
  const declarationOnly = redactionDeclarationOnly(result);
  if (!rows.length && !declarationOnly) return null;
  return (
    <section className={styles.group}>
      <h3>What was withheld</h3>
      {rows.length ? (
        <ToolDataTable
          ariaLabel="Declared domain contact redactions"
          columns={[{ id: "field", label: "Field" }, { id: "method", label: "Method" }, { id: "meaning", label: "What it means" }, { id: "source", label: "Source" }]}
          rows={rows.map((row, index) => ({ id: `${row.source}-${index}-${row.field}`, cells: { field: row.field, method: <code className={styles.method}>{row.method}</code>, meaning: row.explanation, source: row.source } }))}
        />
      ) : <p className={styles.empty}>An available response declared redaction without naming any fields.</p>}
    </section>
  );
}

function Freshness({ result }: { result: DomainRegistration }) {
  const responses = [
    { fetch: result.registryFetch, label: "Registry response" },
    { fetch: result.registrarFetch, label: "Registrar response" },
  ].filter((item): item is { fetch: RdapFetch; label: string } => Boolean(item.fetch));
  if (!responses.length) return null;
  return (
    <dl aria-label="Source freshness" className={styles.metadata}>
      {responses.map(({ fetch, label }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            <span>{sourceHost(fetch) ?? "Host not reported"}</span>
            <time dateTime={fetch.fetchedAt}>{formatOwnerDate(fetch.fetchedAt)}</time>
            <span>{fetch.fromCache ? "Cached" : "Live response"}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function RawEvidence({ result }: { result: DomainRegistration }) {
  const responses = [
    { fetch: result.registryFetch, label: "Registry response" },
    { fetch: result.registrarFetch, label: "Registrar response" },
  ].filter((item): item is { fetch: RdapFetch; label: string } => Boolean(item.fetch));
  return <div className={styles.evidence}>{responses.map(({ fetch, label }) => <ToolRawOutput key={label} label={`${label}${sourceHost(fetch) ? ` from ${sourceHost(fetch)}` : ""}`} value={fetch.body ?? { error: fetch.error }} />)}</div>;
}

function ResultLead({ announce = true, detail, value }: { announce?: boolean; detail: string; value: string }) {
  return <div aria-atomic={announce ? "true" : undefined} aria-live={announce ? "polite" : undefined}><ToolPrimaryResult detail={detail} label="Public registrant information" value={value} /></div>;
}

function OwnerResult({ result }: { result: DomainRegistration }) {
  const verdict = ownerVerdict(result);
  const notes = filteredOwnerNotes(result);
  const registered = result.status === "registered";
  const registrarFailure = isRegistrarHopIncomplete(result);
  const report = JSON.stringify({ tool: "Domain Registrant Lookup", reportVersion: 1, ...result }, null, 2);
  return (
    <section aria-label="Domain registrant result" className={styles.results} data-domain-owner-result>
      <ResultLead detail={verdict.detail} value={verdict.value} />
      <CheckedNameNotice result={result} />
      <SourceMap result={result} />
      {registrarFailure ? <ToolStatus tone="warning">{result.registrarFetch ? "The registrar response failed." : "The registry did not advertise a registrar response."} Retry the lookup before treating missing contact data as unpublished.</ToolStatus> : null}
      {registered ? <><ContactRoutes result={result} verdict={verdict} /><PublishedFields result={result} /><Redactions result={result} /><p className={styles.broader}><Link href={`/domain-lookup?name=${encodeURIComponent(result.query.unicode)}`}>See the full registration record</Link> for dates, status, nameservers, and DNSSEC.</p></> : null}
      {result.status === "no_service" ? <p className={styles.recovery}>See RDAP coverage in the <Link href="/tld-directory">TLD directory</Link>.</p> : null}
      <Freshness result={result} />
      {notes.length ? <ToolDisclosure label="Lookup notes"><ul className={styles.notes}>{notes.map((note) => <li key={note}>{note}</li>)}</ul></ToolDisclosure> : null}
      <div className={styles.download}><ToolDownloadAction contents={report} filename={`${result.query.domain}-registrant.json`} label="Download report" mimeType="application/json;charset=utf-8" /></div>
      <RawEvidence result={result} />
    </section>
  );
}

export function DomainOwnerTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<DomainRegistration | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        const message = data?.error?.message ?? "The registrant lookup failed.";
        if (response.status === 400) {
          setFieldError(message);
          requestAnimationFrame(() => inputRef.current?.focus());
          return;
        }
        throw new Error(message);
      }
      setResult(data as DomainRegistration);
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "The registrant lookup failed.");
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }

  function changeName(value: string) {
    setName(value);
    if (fieldError) setFieldError(null);
    if (requestError) setRequestError(null);
  }

  return (
    <section aria-label="Domain registrant lookup" className={`domain-tool ${styles.workbench}`} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <ToolTextField autoCapitalize="none" autoComplete="off" className={styles.queryField} error={fieldError} inputMode="url" inputRef={inputRef} label="Domain name" name="name" onChange={changeName} placeholder="example.com" required spellCheck={false} type="text" value={name} />
        <ToolButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">{loading ? "Looking up the registrant..." : "Look up the registrant"}</ToolButton>
        {loading ? <div className={styles.formStatus}><ToolStatus>Looking up the registrant...</ToolStatus></div> : null}
      </form>
      {result ? <OwnerResult result={result} /> : requestError ? <section aria-label="Domain registrant result" className={styles.results} data-domain-owner-result><ResultLead announce={false} detail={`${name.trim()} could not be checked.`} value="Cannot determine" /><ToolStatus tone="danger">{requestError}</ToolStatus></section> : null}
    </section>
  );
}
