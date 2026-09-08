"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ToolButton,
  ToolDisclosure,
  ToolKeyValueList,
  ToolPrimaryResult,
  ToolRawOutput,
  ToolStatus,
  ToolTextField,
} from "@/app/tool-ui/tool-controls";
import type { DomainRegistration, RdapFetch } from "@/lib/domain/types.ts";
import {
  availabilityVerdict,
  filterAvailabilityNotes,
  formatAvailabilityDate,
  hasExpiryFollowUp,
  registrationFacts,
  registrySourceMetadata,
} from "./domain-availability-view";
import styles from "./domain-availability-tool.module.css";

function CheckedNameNotice({ result }: { result: DomainRegistration }) {
  if (!result.query.reduced) return null;
  return (
    <p className={styles.checkedName}>
      Checked <code>{result.query.unicode}</code> after reducing <code>{result.query.input}</code> to its registrable domain.
    </p>
  );
}

function RegistrationFacts({ result }: { result: DomainRegistration }) {
  const facts = registrationFacts(result);
  if (!facts.length && !hasExpiryFollowUp(result)) return null;
  return (
    <section className={styles.facts}>
      <h3>Registration facts</h3>
      {facts.length ? <ToolKeyValueList rows={facts} /> : null}
      {hasExpiryFollowUp(result) ? (
        <Link href={`/domain-expiry?name=${encodeURIComponent(result.query.unicode)}`}>
          Check the domain expiry and lifecycle
        </Link>
      ) : null}
    </section>
  );
}

function SourceMetadata({ result }: { result: DomainRegistration }) {
  const metadata = registrySourceMetadata(result);
  if (!metadata) return null;
  return (
    <dl aria-label="Registry source" className={styles.metadata}>
      {metadata.host ? <div><dt>Registry</dt><dd>{metadata.host}</dd></div> : null}
      <div>
        <dt>Fetched</dt>
        <dd>
          <time dateTime={metadata.fetchedAt}>{formatAvailabilityDate(metadata.fetchedAt)}</time>
          {metadata.cached ? ", cached" : ""}
        </dd>
      </div>
      {metadata.registryDatabaseUpdated ? (
        <div>
          <dt>Registry data</dt>
          <dd><time dateTime={metadata.registryDatabaseUpdated}>{formatAvailabilityDate(metadata.registryDatabaseUpdated)}</time></dd>
        </div>
      ) : null}
    </dl>
  );
}

function rawLabel(label: string, fetch: RdapFetch) {
  if (!fetch.url) return label;
  try {
    return `${label} from ${new URL(fetch.url).host}`;
  } catch {
    return label;
  }
}

function RawEvidence({ result }: { result: DomainRegistration }) {
  const responses = [
    { fetch: result.registryFetch, label: "Registry response" },
    { fetch: result.registrarFetch, label: "Registrar response" },
  ].filter((entry): entry is { fetch: RdapFetch; label: string } => Boolean(entry.fetch));
  if (!responses.length) return null;
  return (
    <div className={styles.evidence}>
      {responses.map(({ fetch, label }) => (
        <ToolRawOutput
          key={label}
          label={rawLabel(label, fetch)}
          value={fetch.body ?? { error: fetch.error }}
        />
      ))}
    </div>
  );
}

function AvailabilityLead({ detail, value }: { detail: string; value: string }) {
  return (
    <div aria-atomic="true" aria-live="polite">
      <ToolPrimaryResult detail={detail} label="Registry result" value={value} />
    </div>
  );
}

function AvailabilityResult({ result }: { result: DomainRegistration }) {
  const verdict = availabilityVerdict(result);
  const notes = filterAvailabilityNotes(result);
  return (
    <section aria-label="Domain availability result" className={styles.results} data-availability-result>
      <AvailabilityLead detail={verdict.detail} value={verdict.value} />

      <CheckedNameNotice result={result} />
      <RegistrationFacts result={result} />

      {result.status === "no_service" ? (
        <p className={styles.recovery}>
          See RDAP coverage in the <Link href="/tld-directory">TLD directory</Link>.
        </p>
      ) : null}

      <SourceMetadata result={result} />

      {notes.length ? (
        <ToolDisclosure label="Lookup notes">
          <ul className={styles.notes}>{notes.map((note) => <li key={note}>{note}</li>)}</ul>
        </ToolDisclosure>
      ) : null}

      <RawEvidence result={result} />
    </section>
  );
}

export function DomainAvailabilityTool({ initialName = "" }: { initialName?: string }) {
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
      const response = await fetch("/api/domain/lookup", {
        body: JSON.stringify({ includeRegistrar: true, name }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message ?? "The domain check failed.";
        if (response.status === 400) {
          setFieldError(message);
          requestAnimationFrame(() => inputRef.current?.focus());
          return;
        }
        setRequestError(message);
        return;
      }
      setResult(data as DomainRegistration);
    } catch {
      setRequestError("The registry check could not be completed. Try again.");
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
    <section aria-label="Domain availability checker" className={`domain-tool ${styles.workbench}`} data-hydrated={hydrated ? "true" : undefined} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <ToolTextField
          autoCapitalize="none"
          autoComplete="off"
          className={styles.queryField}
          error={fieldError}
          inputMode="url"
          inputRef={inputRef}
          label="Domain name"
          name="name"
          onChange={changeName}
          placeholder="example.com"
          required
          spellCheck={false}
          type="text"
          value={name}
        />
        <ToolButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">
          {loading ? "Checking domain availability..." : "Check domain availability"}
        </ToolButton>
        {loading ? <div className={styles.status}><ToolStatus>Checking domain availability...</ToolStatus></div> : null}
      </form>

      {result ? (
        <AvailabilityResult result={result} />
      ) : requestError ? (
        <section aria-label="Domain availability result" className={styles.results} data-availability-result>
          <AvailabilityLead detail={requestError} value="Cannot determine" />
        </section>
      ) : null}
    </section>
  );
}
