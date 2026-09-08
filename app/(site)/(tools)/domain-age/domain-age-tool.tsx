"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolDisclosure,
  ToolDownloadAction,
  ToolPrimaryResult,
  ToolRawOutput,
  ToolStatus,
  ToolTextField,
  ToolTimeline,
  type ToolTimelineEvent,
} from "@/app/tool-ui/tool-controls";
import type { DomainRegistration, RdapFetch } from "@/lib/domain/types.ts";
import {
  daysBetween,
  formatDate,
  humanDuration,
  reportJson,
  useDomainLookup,
} from "../../(catalogs)/domain-tools/domain-lookup-client";
import styles from "./domain-age-tool.module.css";

function sourceHost(fetch: RdapFetch | null) {
  if (!fetch?.url) return "Registry";
  try {
    return new URL(fetch.url).host;
  } catch {
    return "Registry";
  }
}

function timelineDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}

function timelineEvents(result: DomainRegistration): ToolTimelineEvent[] {
  const now = new Date();
  const events: Array<ToolTimelineEvent & { timestamp: number }> = [];

  function add(id: string, label: string, value: string | null, state?: ToolTimelineEvent["state"]) {
    if (!value) return;
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return;
    events.push({
      dateTime: value,
      id,
      label,
      state: state ?? (timestamp < now.getTime() ? "past" : "future"),
      timestamp,
      value: timelineDate(value),
    });
  }

  add("registration", result.reregistrationDate ? "First registered" : "Registered", result.registrationDate);
  add("reregistration", "Re-registered", result.reregistrationDate);
  add("transfer", "Transferred", result.transferDate);
  add("changed", "Last changed", result.lastChangedDate);
  add("today", "Today", now.toISOString(), "current");
  add("expiry", "Registry expiry", result.registryExpiryDate);

  return events.sort((left, right) => left.timestamp - right.timestamp);
}

function unavailableResult(result: DomainRegistration) {
  if (result.status === "not_registered") {
    return (
      <ToolPrimaryResult
        detail={`${result.query.unicode} has no current registration age.`}
        label="Domain age"
        value="Not registered"
      />
    );
  }

  if (result.status === "no_service") {
    return (
      <ToolPrimaryResult
        detail={`No RDAP registration service is published for .${result.query.tld}.`}
        label="Domain age"
        tone="warning"
        value="Unavailable"
      />
    );
  }

  if (result.status === "rate_limited" || result.status === "blocked") {
    return (
      <ToolPrimaryResult
        detail="The registry limited this request. Try again in a few minutes."
        label="Domain age"
        tone="warning"
        value="Could not check"
      />
    );
  }

  if (result.status === "timeout" || result.status === "registry_error") {
    return (
      <ToolPrimaryResult
        detail="The registry did not answer properly. Try again shortly."
        label="Domain age"
        tone="warning"
        value="Could not check"
      />
    );
  }

  return null;
}

function SourceMetadata({ result }: { result: DomainRegistration }) {
  const fetch = result.registryFetch;
  if (!fetch) return null;

  return (
    <dl aria-label="Registry source" className={styles.metadata}>
      <div>
        <dt>Registry</dt>
        <dd>{sourceHost(fetch)}</dd>
      </div>
      <div>
        <dt>Fetched</dt>
        <dd><time dateTime={fetch.fetchedAt}>{formatDate(fetch.fetchedAt)}</time>{fetch.fromCache ? ", cached" : ""}</dd>
      </div>
      {result.registryDatabaseUpdated ? (
        <div>
          <dt>Registry data</dt>
          <dd><time dateTime={result.registryDatabaseUpdated}>{formatDate(result.registryDatabaseUpdated)}</time></dd>
        </div>
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
    <ToolRawOutput
      key={label}
      label={label}
      value={fetch.body ?? { error: fetch.error }}
    />
  ));
}

export function DomainAgeTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { result, error, loading, run } = useDomainLookup<DomainRegistration>();
  const report = useMemo(() => (result ? reportJson("Domain Age Checker", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setValidationError("Enter a domain name.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setValidationError(null);
    void run({ name, includeRegistrar: false });
  }

  const start = result?.reregistrationDate ?? result?.registrationDate ?? null;
  const ageDays = start ? Math.abs(daysBetween(start) ?? 0) : null;

  return (
    <section aria-label="Domain age checker" className={`domain-tool ${styles.workbench}`} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <ToolTextField
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
        <ToolButton
          aria-busy={loading}
          className={styles.submit}
          isDisabled={loading}
          type="submit"
          variant="primary"
        >
          {loading ? "Checking domain age..." : "Check domain age"}
        </ToolButton>
        {error ? (
          <div className={styles.requestError}>
            <ToolStatus tone="danger">{error}</ToolStatus>
          </div>
        ) : null}
      </form>

      {result ? (
        <section aria-label="Domain age result" aria-live="polite" className={styles.results} role="region">
          {result.status === "registered" ? (
            ageDays === null ? (
              <ToolPrimaryResult
                detail={`The registry for .${result.query.tld} does not publish a registration date.`}
                label="Current registration age"
                value="Unknown"
              />
            ) : (
              <>
                <ToolPrimaryResult
                  detail={`${result.query.unicode}, since ${formatDate(start)}.`}
                  label="Current registration age"
                  value={humanDuration(ageDays)}
                />

                <div className={styles.timeline}>
                  <ToolTimeline ariaLabel="Registration timeline" events={timelineEvents(result)} />
                </div>

                {result.reregistrationDate ? (
                  <p className={styles.caveat}>
                    The registry records a later registration date but does not say why the domain was registered
                    again or whether ownership changed.
                  </p>
                ) : (
                  <p className={styles.caveat}>
                    Registration date only. It does not date the website or its current owner. Older registration
                    history may not be published.
                  </p>
                )}
              </>
            )
          ) : unavailableResult(result)}

          <SourceMetadata result={result} />

          {result.notes.length ? (
            <ToolDisclosure label="Lookup notes">
              <ul className={styles.notes}>
                {result.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </ToolDisclosure>
          ) : null}

          <ToolActionRow>
            <ToolDownloadAction
              contents={report}
              filename={`${result.query.domain}-age.json`}
              label="Download report"
              mimeType="application/json;charset=utf-8"
            />
          </ToolActionRow>

          <RawEvidence result={result} />
        </section>
      ) : null}
    </section>
  );
}
