"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { UiButton, UiDisclosure, UiDownloadAction, UiRawOutput, UiTextField } from "@/app/ui/controls";
import { UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import { parseRedactions } from "@/lib/domain/redaction.ts";
import { lookupStatus } from "@/lib/domain/status-codes.ts";
import type { DomainEntity, DomainRegistration, RdapFetch } from "@/lib/domain/types.ts";
import {
  dateRows,
  filteredLookupNotes,
  formatLookupDate,
  lookupSourceHost,
  lookupVerdict,
  sourceForRecordGroup,
} from "./domain-lookup-view";
import styles from "./domain-lookup-tool.module.css";

const sourceText = (source: string) => source === "registrar" ? "Registrar" : "Registry";

function NormalizationNote({ result }: { result: DomainRegistration }) {
  if (!result.query.reduced && !result.query.isIdn && !result.query.guessedSuffix) return null;
  const parts = [`Checked ${result.query.unicode}`];
  if (result.query.reduced) parts.push(`after reducing ${result.query.input} to its registrable domain`);
  if (result.query.isIdn) parts.push(`using the registry name ${result.query.domain}`);
  if (result.query.guessedSuffix) parts.push("using a best-guess public suffix");
  return <p className={styles.normalization}>{parts.join(", ")}.</p>;
}

function providerContributions(result: DomainRegistration, source: "Registry" | "Registrar") {
  const contributions = new Set<string>();
  if (source === "Registry" && result.registryFetch?.status === "registered") contributions.add("registration state");
  if (dateRows(result).some((row) => row.value !== "Not published" && row.source === source)) contributions.add("dates");
  if (result.statuses.length && sourceForRecordGroup(result, "statuses") === source) contributions.add("status");
  if (result.nameservers.length && sourceForRecordGroup(result, "nameservers") === source) contributions.add("nameservers");
  if (result.dnssecSigned !== null && sourceForRecordGroup(result, "dnssec") === source) contributions.add("DNSSEC");
  const registrarEntities = result.entities.filter((entity) => entity.roles.includes("registrar") || entity.roles.includes("abuse"));
  if (registrarEntities.some((entity) => sourceText(entity.source) === source)) contributions.add("registrar facts");
  if (source === "Registrar" && result.registrar.rdapUrl) contributions.add("registrar facts");
  if (result.entities.some((entity) => sourceText(entity.source) === source && !entity.roles.includes("registrar") && !entity.roles.includes("abuse"))) contributions.add("contacts");
  const fetch = source === "Registry" ? result.registryFetch : result.registrarFetch;
  if (fetch && parseRedactions(fetch.body).length) contributions.add("redaction");
  return [...contributions];
}

function SourceMap({ result }: { result: DomainRegistration }) {
  if (result.status !== "registered") return null;
  const providers = [
    result.registryFetch ? { fetch: result.registryFetch, source: "Registry" as const } : null,
    result.registrarFetch?.status === "registered" ? { fetch: result.registrarFetch, source: "Registrar" as const } : null,
  ].filter((entry): entry is { fetch: RdapFetch; source: "Registry" | "Registrar" } => Boolean(entry))
    .map((entry) => ({ ...entry, contributions: providerContributions(result, entry.source) }))
    .filter((entry) => entry.contributions.length);
  if (!providers.length) return null;
  return (
    <figure aria-label="Sources contributing to the current registration record" className={styles.sourceMap}>
      <figcaption>Where this record came from</figcaption>
      <div className={styles.sourceNodes}>
        {providers.map(({ contributions, fetch, source }) => (
          <div className={styles.sourceNode} key={source}>
            <strong>{source}</strong>
            <code>{lookupSourceHost(fetch.url) ?? "Source host not reported"}</code>
            <span>{contributions.join(", ")}</span>
          </div>
        ))}
        <div className={styles.recordNode}>Current registration record</div>
      </div>
    </figure>
  );
}

function Dates({ result }: { result: DomainRegistration }) {
  return (
    <section className={styles.group}>
      <h3>Dates</h3>
      <UiDataTable
        ariaLabel="Registration dates and sources"
        columns={[{ id: "date", label: "Date" }, { id: "value", label: "Published value" }, { id: "source", label: "Source" }]}
        rows={dateRows(result).map((row) => ({ id: row.id, cells: { date: row.label, value: row.value, source: row.source } }))}
      />
    </section>
  );
}

function sourced(value: ReactNode, source = "Registry") {
  return <span className={styles.sourcedValue}>{value}<small>{source}</small></span>;
}

function RegistrarFacts({ result }: { result: DomainRegistration }) {
  const rows: Array<{ label: string; value: ReactNode }> = [];
  const registrarEntity = result.entities.find((entity) => entity.roles.includes("registrar"));
  const abuseEntity = result.entities.find((entity) => entity.roles.includes("abuse"));
  const registrarSource = registrarEntity ? sourceText(registrarEntity.source) : "Registry";
  const abuseSource = abuseEntity ? sourceText(abuseEntity.source) : registrarSource;
  if (result.registrar.ianaId) rows.push({ label: "IANA ID", value: sourced(result.registrar.ianaId, registrarSource) });
  if (result.registrar.abuseEmail) rows.push({ label: "Abuse email", value: sourced(<a href={`mailto:${result.registrar.abuseEmail}`}>{result.registrar.abuseEmail}</a>, abuseSource) });
  if (result.registrar.abusePhone) rows.push({ label: "Abuse phone", value: sourced(result.registrar.abusePhone, abuseSource) });
  if (result.registrar.url) rows.push({ label: "Website", value: sourced(<a href={result.registrar.url}>{result.registrar.url}</a>, registrarSource) });
  if (result.registrar.rdapUrl) rows.push({ label: "Registrar RDAP", value: sourced(<a href={result.registrar.rdapUrl}>{lookupSourceHost(result.registrar.rdapUrl) ?? result.registrar.rdapUrl}</a>, "Registrar") });
  if (!rows.length) return null;
  return <section className={styles.group}><h3>Registrar</h3><UiKeyValueList rows={rows} /></section>;
}

function actor(status: string) {
  const known = lookupStatus(status);
  if (!known) return "Unknown";
  if (known.group === "registrar_lock") return "Registrar";
  if (known.group === "registry_lock") return "Registry";
  return "Lifecycle";
}

function Statuses({ result }: { result: DomainRegistration }) {
  if (!result.statuses.length) return null;
  const source = sourceForRecordGroup(result, "statuses");
  return (
    <section className={styles.group}>
      <h3>Status codes</h3>
      <UiDataTable ariaLabel="Registration status codes" columns={[{ id: "status", label: "Status" }, { id: "actor", label: "Set by" }, { id: "meaning", label: "Meaning and action" }, { id: "source", label: "Source" }]} rows={result.statuses.map((status) => {
        const known = lookupStatus(status.rdap);
        return { id: status.rdap, cells: {
          status: <span className={styles.statusCode}><code>{status.epp ?? status.rdap}</code>{status.epp ? <small>{status.rdap}</small> : null}</span>,
          actor: actor(status.rdap),
          meaning: known ? `${known.meaning}${known.action ? ` ${known.action}` : ""}` : "No explanation is available for this returned status.",
          source,
        } };
      })} />
    </section>
  );
}

function Nameservers({ result }: { result: DomainRegistration }) {
  const source = sourceForRecordGroup(result, "nameservers");
  const rows = result.nameservers.length ? result.nameservers.map((nameserver) => ({ id: nameserver.hostname, cells: {
    hostname: <code>{nameserver.hostname}</code>,
    addresses: nameserver.addresses.length ? nameserver.addresses.map((address) => <code className={styles.address} key={address}>{address}</code>) : "Not published",
    source,
  } })) : [{ id: "none", cells: { hostname: "None published", addresses: "Not published", source } }];
  return <section className={styles.group}><h3>Nameservers</h3><UiDataTable ariaLabel="Nameservers on record" columns={[{ id: "hostname", label: "Nameserver" }, { id: "addresses", label: "Glue addresses" }, { id: "source", label: "Source" }]} rows={rows} /><Link href={`/nameserver-checker?name=${encodeURIComponent(result.query.unicode)}`}>Check the live delegation</Link></section>;
}

function Dnssec({ result }: { result: DomainRegistration }) {
  const delegation = result.dnssecSigned === null ? "Not reported" : result.dnssecSigned ? "DS record published" : "No DS record published";
  const rows = [{ label: "Delegation", value: sourced(delegation, sourceForRecordGroup(result, "dnssec")) }];
  if (result.dsRecordCount !== null) rows.push({ label: "DS records", value: sourced(result.dsRecordCount.toLocaleString("en-US"), sourceForRecordGroup(result, "dnssec")) });
  return <section className={styles.group}><h3>DNSSEC delegation</h3><UiKeyValueList rows={rows} /><Link href={`/dnssec-checker?name=${encodeURIComponent(result.query.unicode)}`}>Validate the DNSSEC chain</Link></section>;
}

function contactRows(entities: DomainEntity[]) {
  return entities.filter((entity) => !entity.roles.includes("registrar") && !entity.roles.includes("abuse")).flatMap((entity, entityIndex) => entity.fields.filter((field) => field.value.trim()).map((field, fieldIndex) => ({
    id: `${entityIndex}-${fieldIndex}-${field.label}`,
    cells: { role: entity.roles.join(", ") || "Contact", field: field.label, value: field.value, source: sourceText(entity.source) },
  })));
}

function RedactionRows(result: DomainRegistration) {
  const rows = ([{ fetch: result.registryFetch, source: "Registry" }, { fetch: result.registrarFetch, source: "Registrar" }] as const).flatMap(({ fetch, source }) => fetch ? parseRedactions(fetch.body).map((item, index) => ({ id: `${source}-${index}-${item.field}`, cells: { field: item.field, treatment: item.explanation, source } })) : []);
  if (rows.length) return rows;
  return result.redactions.map((item, index) => ({ id: `reported-${index}-${item.field}`, cells: { field: item.field, treatment: item.explanation, source: result.registrarFetch ? "Registrar" : "Registry" } }));
}

function Contacts({ result }: { result: DomainRegistration }) {
  const contacts = contactRows(result.entities);
  const redactions = RedactionRows(result);
  return (
    <section className={styles.group}>
      <h3>Contacts and redaction</h3>
      {contacts.length ? <UiDataTable ariaLabel="Published domain contacts" columns={[{ id: "role", label: "Role" }, { id: "field", label: "Field" }, { id: "value", label: "Value" }, { id: "source", label: "Source" }]} rows={contacts} /> : null}
      {redactions.length ? <UiDataTable ariaLabel="Declared contact redactions" columns={[{ id: "field", label: "Field" }, { id: "treatment", label: "Treatment" }, { id: "source", label: "Source" }]} rows={redactions} /> : null}
      {!contacts.length && !redactions.length ? <p className={styles.unknownContacts}>{result.redactionDeclared ? "The provider declared redaction without naming fields." : "No public contacts or redaction declaration were published."}</p> : null}
      <Link href={`/domain-owner?name=${encodeURIComponent(result.query.unicode)}`}>Check ways to contact the domain owner</Link>
    </section>
  );
}

function Freshness({ result }: { result: DomainRegistration }) {
  const rows = [{ fetch: result.registryFetch, label: "Registry response" }, { fetch: result.registrarFetch, label: "Registrar response" }].filter((entry): entry is { fetch: RdapFetch; label: string } => Boolean(entry.fetch) && entry.fetch?.status !== "no_service");
  if (!rows.length) return null;
  return <dl aria-label="Source freshness" className={styles.metadata}>{rows.map(({ fetch, label }) => <div key={label}><dt>{label}</dt><dd><span>{lookupSourceHost(fetch.url) ?? "Host not reported"}</span><time dateTime={fetch.fetchedAt}>{formatLookupDate(fetch.fetchedAt)}</time>{fetch.fromCache ? <span>Cached</span> : null}</dd></div>)}</dl>;
}

function RawEvidence({ result }: { result: DomainRegistration }) {
  return <div className={styles.evidence}>{[{ fetch: result.registryFetch, label: "Registry response" }, { fetch: result.registrarFetch, label: "Registrar response" }].filter((entry): entry is { fetch: RdapFetch; label: string } => Boolean(entry.fetch)).map(({ fetch, label }) => <UiRawOutput key={label} label={`${label}${lookupSourceHost(fetch.url) ? ` from ${lookupSourceHost(fetch.url)}` : ""}`} value={fetch.body ?? { error: fetch.error }} />)}</div>;
}

function LookupResult({ result }: { result: DomainRegistration }) {
  const verdict = lookupVerdict(result);
  const notes = filteredLookupNotes(result);
  const report = JSON.stringify({ tool: "Domain Registration Lookup", reportVersion: 1, ...result }, null, 2);
  const registered = result.status === "registered";
  const registrarFailure = result.registrarFetch && result.registrarFetch.status !== "registered";
  return <section aria-label="Domain registration result" className={styles.results} data-domain-lookup-result>
    <RegistrationLead detail={verdict.detail} value={verdict.value} />
    <NormalizationNote result={result} />
    <SourceMap result={result} />
    {registrarFailure ? <UiStatus tone="warning">The registrar response was incomplete. Registry facts remain available.</UiStatus> : null}
    {registered ? <><Dates result={result} /><RegistrarFacts result={result} /><Statuses result={result} /><Nameservers result={result} /><Dnssec result={result} /><Contacts result={result} /></> : null}
    {result.status === "no_service" ? <p className={styles.recovery}>See RDAP coverage in the <Link href="/tld-directory">TLD directory</Link>.</p> : null}
    <Freshness result={result} />
    <div className={styles.download}><UiDownloadAction contents={report} filename={`${result.query.domain}-registration.json`} label="Download report" mimeType="application/json;charset=utf-8" /></div>
    {notes.length ? <UiDisclosure label="Lookup notes"><ul className={styles.notes}>{notes.map((note) => <li key={note}>{note}</li>)}</ul></UiDisclosure> : null}
    <RawEvidence result={result} />
  </section>;
}

function RegistrationLead({ announce = true, detail, value }: { announce?: boolean; detail: string; value: string }) {
  return <div aria-atomic={announce ? "true" : undefined} aria-live={announce ? "polite" : undefined}><UiPrimaryResult detail={detail} label="Registration record" value={value} /></div>;
}

export function DomainLookupTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<DomainRegistration | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setResult(null);
    if (!name.trim()) { setFieldError("Enter a domain name."); setRequestError(null); requestAnimationFrame(() => inputRef.current?.focus()); return; }
    setLoading(true); setFieldError(null); setRequestError(null);
    try {
      const response = await fetch("/api/domain/lookup", { body: JSON.stringify({ name }), headers: { "content-type": "application/json" }, method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message ?? "The registration lookup failed.";
        if (response.status === 400) { setFieldError(message); requestAnimationFrame(() => inputRef.current?.focus()); return; }
        throw new Error(message);
      }
      setResult(data as DomainRegistration);
    } catch (caught) { setRequestError(caught instanceof Error ? caught.message : "The registration lookup failed."); }
    finally { setLoading(false); }
  }

  return <section aria-label="Domain registration lookup" className={`domain-tool ${styles.workbench}`} data-tool-workbench>
    <form aria-busy={loading} className={styles.form} onSubmit={submit}>
      <UiTextField autoCapitalize="none" autoComplete="off" className={styles.queryField} error={fieldError} inputMode="url" inputRef={inputRef} label="Domain name" name="name" onChange={(value) => { setName(value); if (fieldError) setFieldError(null); if (requestError) setRequestError(null); }} placeholder="example.com" required spellCheck={false} type="text" value={name} />
      <UiButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">{loading ? "Looking up registration..." : "Look up registration"}</UiButton>
      {loading ? <div className={styles.formStatus}><UiStatus>Looking up registration...</UiStatus></div> : null}
    </form>
    {result ? <LookupResult result={result} /> : requestError ? (
      <section aria-label="Domain registration result" className={styles.results} data-domain-lookup-result>
        <RegistrationLead announce={false} detail={`${name.trim()} could not be checked.`} value="Cannot determine" />
        <UiStatus tone="danger">{requestError}</UiStatus>
      </section>
    ) : null}
  </section>;
}
