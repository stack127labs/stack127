"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { UiButton, UiDisclosure, UiDownloadAction, UiRawOutput, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiPrimaryResult, UiStatus, UiTimeline, type UiTimelineEvent } from "@/app/ui/display";
import type { DomainRegistration, RdapFetch } from "@/lib/domain/types.ts";
import {
  daysBetween,
  formatDate,
  humanDuration,
  reportJson,
  useDomainLookup,
} from "@/app/ui/tools/domain/domain-lookup-client";
import styles from "./domain-age-tool.module.css";

function sourceHost(fetch: RdapFetch | null) {
  if (!fetch?.url) return "Host not reported";
  try {
    return new URL(fetch.url).host;
  } catch {
    return "Host not reported";
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

function timelineEvents(result: DomainRegistration): UiTimelineEvent[] {
  const now = new Date();
  const events: Array<UiTimelineEvent & { timestamp: number }> = [];

  function add(id: string, label: string, value: string | null, state?: UiTimelineEvent["state"]) {
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
      <UiPrimaryResult
        detail={`${result.query.unicode} has no current registration age.`}
        label="Domain age"
        value="Not registered"
      />
    );
  }

  if (result.status === "no_service") {
    return (
      <UiPrimaryResult
        detail={`stack127 has no lookup service it can use for .${result.query.tld}.`}
        label="Domain age"
        tone="warning"
        value="Unavailable"
      />
    );
  }

  if (result.status === "rate_limited" || result.status === "blocked") {
    return (
      <UiPrimaryResult
        detail="The registry limited this request. Try again in a few minutes."
        label="Domain age"
        tone="warning"
        value="Could not check"
      />
    );
  }

  if (result.status === "timeout" || result.status === "registry_error") {
    return (
      <UiPrimaryResult
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
  // With no RDAP service for the ending, nothing was fetched, so there is no source to show.
  if (!fetch || fetch.status === "no_service") return null;

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
    <UiRawOutput
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
        <UiButton
          aria-busy={loading}
          className={styles.submit}
          isDisabled={loading}
          type="submit"
          variant="primary"
        >
          {loading ? "Checking domain age..." : "Check domain age"}
        </UiButton>
        {error ? (
          <div className={styles.requestError}>
            <UiStatus tone="danger">{error}</UiStatus>
          </div>
        ) : null}
      </form>

      {result ? (
        <section aria-label="Domain age result" aria-live="polite" className={styles.results} role="region">
          {result.status === "registered" ? (
            ageDays === null ? (
              <UiPrimaryResult
                detail={`The registry for .${result.query.tld} does not publish a registration date.`}
                label="Current registration age"
                value="Unknown"
              />
            ) : (
              <>
                <UiPrimaryResult
                  detail={`${result.query.unicode}, since ${formatDate(start)}.`}
                  label="Current registration age"
                  value={humanDuration(ageDays)}
                />

                <div className={styles.timeline}>
                  <UiTimeline ariaLabel="Registration timeline" events={timelineEvents(result)} />
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
            <UiDisclosure label="Lookup notes">
              <ul className={styles.notes}>
                {result.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </UiDisclosure>
          ) : null}

          <UiActionRow>
            <UiDownloadAction
              contents={report}
              filename={`${result.query.domain}-age.json`}
              label="Download report"
              mimeType="application/json;charset=utf-8"
            />
          </UiActionRow>

          <RawEvidence result={result} />
        </section>
      ) : null}
    </section>
  );
}
