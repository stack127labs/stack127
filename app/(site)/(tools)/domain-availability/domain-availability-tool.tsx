"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { DomainRegistration } from "@/lib/domain/types.ts";
import {
  DomainForm,
  DownloadReportButton,
  Notes,
  RawResponses,
  ResultHeader,
  SourceNote,
  StatePill,
  UnavailableNote,
  formatDate,
  reportJson,
  useDomainLookup,
} from "../../(catalogs)/domain-tools/domain-lookup-client";

export function DomainAvailabilityTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const { result, error, loading, run, setError } = useDomainLookup<DomainRegistration>();
  const report = useMemo(() => (result ? reportJson("Domain Availability Checker", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain name, including the ending.");
    void run({ name });
  }

  return (
    <section className="domain-tool" aria-label="Domain availability checker">
      <DomainForm
        busyLabel="Asking the registry..."
        error={error}
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        submitLabel="Check it"
        value={name}
      />

      {result ? (
        <section className="domain-results" aria-live="polite">
          <ResultHeader
            action={<DownloadReportButton contents={report} filename={`${result.query.domain}-availability.json`} />}
            hostname={result.query.unicode}
          />

          {/* A failed or throttled check must never look like "available". */}
          <UnavailableNote registration={result} />

          {result.status === "not_registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                <StatePill tone="good">No registration found</StatePill>
              </div>
              <p className="domain-answer-lead">
                {result.query.unicode} is not registered.
              </p>
              <p>
                The registry for <code>.{result.query.tld}</code> has no record of it. That usually means you can
                register it, but not always: reserved names, registry blocklists and premium priced names all look
                exactly like this from the outside. Worth reading the note below before you plan around it.
              </p>
              <SourceNote registration={result} />
            </div>
          ) : null}

          {result.status === "registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                <StatePill tone="bad">Taken</StatePill>
                {result.statuses.some((status) => status.rdap === "redemption period" || status.rdap === "pending delete") ? (
                  <StatePill tone="warn">On its way out</StatePill>
                ) : null}
              </div>
              <p className="domain-answer-lead">{result.query.unicode} is already registered.</p>
              <p>
                {result.registrationDate ? `It was created on ${formatDate(result.registrationDate)}` : "The registry holds a record for it"}
                {result.registryExpiryDate ? ` and expires on ${formatDate(result.registryExpiryDate)}` : ""}
                {result.registrar.name ? `, through ${result.registrar.name}` : ""}.
              </p>
              {result.statuses.some((status) => status.rdap === "redemption period" || status.rdap === "pending delete") ? (
                <p>
                  It is also on its way out of the system. That does not make it available yet, and names in this state
                  are watched closely by people who catch them the moment they release.{" "}
                  <a href="/domain-expiry">See where it sits in the life cycle</a>.
                </p>
              ) : null}
              <SourceNote registration={result} />
            </div>
          ) : null}

          <Notes notes={result.notes} />
          <RawResponses registration={result} />
        </section>
      ) : null}
    </section>
  );
}
