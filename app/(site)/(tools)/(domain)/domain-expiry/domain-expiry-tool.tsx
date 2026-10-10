"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { UiButton, UiDisclosure, UiDownloadAction, UiRawOutput, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiMetricGroup, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import { lookupStatus } from "@/lib/domain/status-codes.ts";
import type { DomainRegistration, RdapFetch } from "@/lib/domain/types.ts";
import {
  daysBetween,
  formatDate,
  humanDuration,
  reportJson,
  useDomainLookup,
} from "@/app/(site)/(tools)/(domain)/domain-lookup-client";
import styles from "./domain-expiry-tool.module.css";

const EXPIRY_PATH = [
  { id: "auto renew period", label: "Grace period", duration: "Up to 45 days", meaning: "Registrar may renew or delete" },
  { id: "redemption period", label: "Redemption", duration: "30 days", meaning: "Previous owner can restore" },
  { id: "pending delete", label: "Pending delete", duration: "5 days", meaning: "Cannot be restored" },
  { id: "released", label: "Released", duration: "No fixed time", meaning: "May become registrable. Release time varies" },
] as const;

type StageId = "registered" | (typeof EXPIRY_PATH)[number]["id"];

const EXPIRY_STATUSES = new Set([
  "auto renew period",
  "client hold",
  "pending delete",
  "pending restore",
  "redemption period",
  "server hold",
]);

function currentStage(registration: DomainRegistration): StageId {
  const codes = registration.statuses.map((status) => status.rdap.toLowerCase());
  if (codes.includes("pending delete")) return "pending delete";
  if (codes.includes("redemption period") || codes.includes("pending restore")) return "redemption period";
  if (codes.includes("auto renew period")) return "auto renew period";
  return "registered";
}

function sourceHost(fetch: RdapFetch | null) {
  if (!fetch?.url) return "Host not reported";
  try {
    return new URL(fetch.url).host;
  } catch {
    return "Host not reported";
  }
}

function ExpiryPath({ stage }: { stage: StageId }) {
  return (
    <section aria-label="Expiry path" className={styles.lifecycle}>
      <h2>Typical path after expiry</h2>
      <div aria-hidden="true" className={styles.pathHeader}>
        <span>Stage</span>
        <span>Typical length</span>
        <span>What it means</span>
      </div>
      <ol aria-label="Typical path after expiry" className={styles.pathList}>
        {EXPIRY_PATH.map((entry) => (
          <li aria-current={entry.id === stage ? "step" : undefined} className={styles.pathStep} key={entry.id}>
            <span className={styles.pathStage}>{entry.label}</span>
            <strong className={styles.pathDuration}>{entry.duration}</strong>
            <span className={styles.pathMeaning}>{entry.meaning}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function registeredAnswer(result: DomainRegistration, stage: StageId) {
  const days = daysBetween(result.registryExpiryDate);

  if (stage === "pending delete") {
    return (
      <UiPrimaryResult
        detail={`${result.query.unicode}. Not restorable and not yet released.`}
        label="Expiry state"
        tone="danger"
        value="Pending delete"
      />
    );
  }

  if (stage === "redemption period") {
    return (
      <UiPrimaryResult
        detail={`${result.query.unicode}. Not available to register. The previous registrant may still restore it.`}
        label="Expiry state"
        tone="danger"
        value="Redemption period"
      />
    );
  }

  if (stage === "auto renew period") {
    return (
      <UiPrimaryResult
        detail={`${result.query.unicode}. The registrar now decides whether to renew or delete it.`}
        label="Expiry state"
        tone="warning"
        value="Auto-renew grace"
      />
    );
  }

  if (days === null) {
    return (
      <UiPrimaryResult
        detail={`The registry for .${result.query.tld} does not publish an expiry date.`}
        label="Registry expiry"
        value="Unknown"
      />
    );
  }

  if (days < 0) {
    return (
      <UiPrimaryResult
        detail={`${result.query.unicode}, registry expiry was ${formatDate(result.registryExpiryDate)}.`}
        label="Time since registry expiry"
        tone="warning"
        value={humanDuration(Math.abs(days))}
      />
    );
  }

  return (
    <UiPrimaryResult
      detail={`${result.query.unicode}, expires ${formatDate(result.registryExpiryDate)}.`}
      label="Time until registry expiry"
      tone={days <= 30 ? "warning" : "neutral"}
      value={humanDuration(days)}
    />
  );
}

function unavailableAnswer(result: DomainRegistration) {
  if (result.status === "not_registered") {
    return <UiPrimaryResult detail={`${result.query.unicode} has no current expiry date.`} label="Domain expiry" value="Not registered" />;
  }
  if (result.status === "no_service") {
    return <UiPrimaryResult detail={`No RDAP registration service is published for .${result.query.tld}.`} label="Domain expiry" tone="warning" value="Unavailable" />;
  }
  if (result.status === "rate_limited" || result.status === "blocked") {
    return <UiPrimaryResult detail="The registry limited this request. Try again in a few minutes." label="Domain expiry" tone="warning" value="Could not check" />;
  }
  if (result.status === "timeout" || result.status === "registry_error") {
    return <UiPrimaryResult detail="The registry did not answer properly. Try again shortly." label="Domain expiry" tone="warning" value="Could not check" />;
  }
  return null;
}

function SourceMetadata({ result }: { result: DomainRegistration }) {
  const fetch = result.registryFetch;
  // With no RDAP service for the ending, nothing was fetched, so there is no source to show.
  if (!fetch || fetch.status === "no_service") return null;
  return (
    <dl aria-label="Registry source" className={styles.metadata}>
      <div><dt>Registry</dt><dd>{sourceHost(fetch)}</dd></div>
      <div><dt>Fetched</dt><dd><time dateTime={fetch.fetchedAt}>{formatDate(fetch.fetchedAt)}</time>{fetch.fromCache ? ", cached" : ""}</dd></div>
      {result.registryDatabaseUpdated ? (
        <div><dt>Registry data</dt><dd><time dateTime={result.registryDatabaseUpdated}>{formatDate(result.registryDatabaseUpdated)}</time></dd></div>
      ) : null}
    </dl>
  );
}

function RawEvidence({ result }: { result: DomainRegistration }) {
  const responses = [
    { fetch: result.registryFetch, label: "Registry response" },
    { fetch: result.registrarFetch, label: "Registrar response" },
  ].filter((entry): entry is { fetch: RdapFetch; label: string } => Boolean(entry.fetch));

  return responses.map(({ fetch, label }) => (
    <UiRawOutput key={label} label={label} value={fetch.body ?? { error: fetch.error }} />
  ));
}

export function DomainExpiryTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { result, error, loading, run } = useDomainLookup<DomainRegistration>();
  const report = useMemo(() => (result ? reportJson("Domain Expiry Checker", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setValidationError("Enter a domain name.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setValidationError(null);
    void run({ name });
  }

  const stage = result ? currentStage(result) : null;
  const expiryStatuses = result
    ? result.statuses.filter((status) => EXPIRY_STATUSES.has(status.rdap.toLowerCase()))
    : [];
  const datesDiffer = Boolean(
    result?.registryExpiryDate
    && result.registrarExpiryDate
    && formatDate(result.registryExpiryDate) !== formatDate(result.registrarExpiryDate),
  );

  return (
    <section aria-label="Domain expiry checker" className={`domain-tool ${styles.workbench}`} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          className={styles.queryField}
          error={validationError}
          inputMode="url"
          inputRef={inputRef}
          label="Domain name"
          onChange={(value) => {
            setName(value);
            if (validationError) setValidationError(null);
          }}
          placeholder="example.com"
          required
          spellCheck={false}
          value={name}
        />
        <UiButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">
          {loading ? "Checking domain expiry..." : "Check domain expiry"}
        </UiButton>
        {error ? <div className={styles.requestError}><UiStatus tone="danger">{error}</UiStatus></div> : null}
      </form>

      {result ? (
        <section aria-label="Domain expiry result" aria-live="polite" className={styles.results} role="region">
          {result.status === "registered" && stage ? registeredAnswer(result, stage) : unavailableAnswer(result)}

          {datesDiffer ? (
            <div className={styles.dateDifference}>
              <UiMetricGroup
                ariaLabel="Published expiry dates"
                items={[
                  { id: "registry", label: "Registry expiry", value: formatDate(result.registryExpiryDate) },
                  { id: "registrar", label: "Registrar expiry", value: formatDate(result.registrarExpiryDate) },
                ]}
              />
              <p>Confirm the renewal deadline with your registrar.</p>
            </div>
          ) : null}

          {result.status === "registered" && stage ? (
            <ExpiryPath stage={stage} />
          ) : null}

          {expiryStatuses.length ? (
            <section aria-label="Expiry status codes" className={styles.statuses}>
              <h2>Expiry status evidence</h2>
              <UiDataTable
                ariaLabel="Expiry status evidence"
                columns={[{ id: "status", label: "EPP status" }, { id: "meaning", label: "Meaning" }]}
                rows={expiryStatuses.map((status) => {
                  const known = lookupStatus(status.rdap);
                  return {
                    id: status.rdap,
                    cells: {
                      status: <code>{status.epp ?? known?.epp ?? status.rdap}</code>,
                      meaning: known?.meaning ?? "The registry returned this status without a known explanation.",
                    },
                  };
                })}
              />
            </section>
          ) : null}

          <SourceMetadata result={result} />

          {result.notes.length ? (
            <UiDisclosure label="Lookup notes">
              <ul className={styles.notes}>{result.notes.map((note) => <li key={note}>{note}</li>)}</ul>
            </UiDisclosure>
          ) : null}

          <UiActionRow>
            <UiDownloadAction contents={report} filename={`${result.query.domain}-expiry.json`} label="Download report" mimeType="application/json;charset=utf-8" />
          </UiActionRow>

          <RawEvidence result={result} />
        </section>
      ) : null}
    </section>
  );
}
