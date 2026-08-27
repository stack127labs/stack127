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

export function DomainRegistrarTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const { result, error, loading, run, setError } = useDomainLookup<DomainRegistration>();
  const report = useMemo(() => (result ? reportJson("Registrar Lookup", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain name.");
    void run({ name });
  }

  return (
    <section className="domain-tool" aria-label="Registrar lookup">
      <DomainForm
        busyLabel="Looking..."
        error={error}
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        submitLabel="Find the registrar"
        value={name}
      />

      {result ? (
        <section className="domain-results" aria-live="polite">
          <ResultHeader
            action={<DownloadReportButton contents={report} filename={`${result.query.domain}-registrar.json`} />}
            hostname={result.query.unicode}
          />

          <UnavailableNote registration={result} />

          {result.status === "not_registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                <StatePill tone="quiet">Not registered</StatePill>
              </div>
              <p className="domain-answer-lead">
                {result.query.unicode} is not registered, so it has no registrar.
              </p>
            </div>
          ) : null}

          {result.status === "registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                {result.registrar.name ? (
                  <StatePill tone="good">Registrar identified</StatePill>
                ) : (
                  <StatePill tone="quiet">No registrar published</StatePill>
                )}
                {result.registrar.abuseEmail ? <StatePill tone="quiet">Abuse contact published</StatePill> : null}
              </div>
              <p className="domain-answer-lead">
                {result.registrar.name
                  ? `${result.query.unicode} is registered through ${result.registrar.name}.`
                  : `The registry for .${result.query.tld} does not publish a registrar for ${result.query.unicode}.`}
              </p>
              <p>
                The registry that runs <code>.{result.query.tld}</code> holds the record. The registrar is the company
                the domain was bought through, and it is the one with an account you can log into. If the name above is
                unfamiliar, a reseller is the likely explanation.
              </p>
              <SourceNote registration={result} />
            </div>
          ) : null}

          <Notes notes={result.notes} />

          {result.status === "registered" ? (
            <section>
              <h2>Details</h2>
              <dl className="domain-fact-list">
                <div>
                  <dt>Registrar</dt>
                  <dd data-emphasis="true" data-unknown={result.registrar.name ? undefined : "true"}>
                    {result.registrar.name ?? "Not published"}
                  </dd>
                </div>
                <div>
                  <dt>IANA registrar ID</dt>
                  <dd data-unknown={result.registrar.ianaId ? undefined : "true"}>
                    {result.registrar.ianaId ?? "Not published"}
                    <small>The number ICANN uses to identify an accredited registrar.</small>
                  </dd>
                </div>
                <div>
                  <dt>Abuse contact</dt>
                  <dd data-unknown={result.registrar.abuseEmail ? undefined : "true"}>
                    {result.registrar.abuseEmail ?? "Not published"}
                    {result.registrar.abusePhone ? <small>{result.registrar.abusePhone}</small> : null}
                  </dd>
                </div>
                <div>
                  <dt>Registry</dt>
                  <dd>
                    Operator of <code>.{result.query.tld}</code>
                    <small>
                      {result.coverage.operator
                        ? `${result.coverage.operator}, from our reviewed list.`
                        : "Discovered through the official IANA directory."}
                    </small>
                  </dd>
                </div>
                <div>
                  <dt>Last transferred</dt>
                  <dd data-unknown={result.transferDate ? undefined : "true"}>
                    {result.transferDate
                      ? formatDate(result.transferDate)
                      : "Not published by this registry"}
                    <small>
                      {result.transferDate
                        ? "The date the domain last moved registrar."
                        : "Most registries omit this, so a recent move can be invisible."}
                    </small>
                  </dd>
                </div>
                <div>
                  <dt>Record last changed</dt>
                  <dd data-unknown={result.lastChangedDate ? undefined : "true"}>
                    {formatDate(result.lastChangedDate) ?? "Not published"}
                    <small>Moves for many reasons. Do not read it as a transfer date.</small>
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          <RawResponses registration={result} />
        </section>
      ) : null}
    </section>
  );
}
