"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { DomainEntity, DomainRegistration } from "@/lib/domain/types.ts";
import {
  DomainForm,
  DownloadReportButton,
  Notes,
  RawResponses,
  ResultHeader,
  SourceNote,
  StatePill,
  UnavailableNote,
  reportJson,
  useDomainLookup,
} from "../../domain-tools/domain-lookup-client";

const ROLE_LABELS: Record<string, string> = {
  registrant: "Registrant",
  administrative: "Administrative contact",
  technical: "Technical contact",
  billing: "Billing contact",
  abuse: "Abuse contact",
  registrar: "Registrar",
};

function EntityCard({ entity }: { entity: DomainEntity }) {
  const title = entity.roles.map((role) => ROLE_LABELS[role] ?? role).join(", ") || "Contact";
  const published = entity.fields.filter((field) => field.value);
  return (
    <div className="domain-finding" data-tone={published.length ? "quiet" : "warn"}>
      <div className="domain-finding-head">
        <h3>{title}</h3>
        <StatePill tone={published.length ? "good" : "warn"}>
          {published.length ? `${published.length} field${published.length === 1 ? "" : "s"} published` : "Nothing published"}
        </StatePill>
      </div>
      {published.length ? (
        <dl className="domain-fact-list">
          {published.map((field) => (
            <div key={`${field.label}-${field.value}`}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>This contact exists in the record but every field has been withheld.</p>
      )}
      <p className="domain-meta">From the {entity.source} response.</p>
    </div>
  );
}

export function DomainOwnerTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const { result, error, loading, run, setError } = useDomainLookup<DomainRegistration>();
  const report = useMemo(() => (result ? reportJson("Domain Registrant Lookup", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain name.");
    void run({ name });
  }

  const registrant = result?.entities.find((entity) => entity.roles.includes("registrant")) ?? null;
  const contactUri = registrant?.contactUri ?? null;
  const identified = Boolean(registrant?.name || registrant?.organization);
  const contacts = result?.entities.filter((entity) => !entity.roles.includes("registrar")) ?? [];

  return (
    <section className="domain-tool" aria-label="Domain registrant lookup">
      <DomainForm
        busyLabel="Looking..."
        error={error}
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        submitLabel="Look up the registrant"
        value={name}
      />

      {result ? (
        <section className="domain-results" aria-live="polite">
          <ResultHeader
            action={<DownloadReportButton contents={report} filename={`${result.query.domain}-registrant.json`} />}
            hostname={result.query.unicode}
          />

          <UnavailableNote registration={result} />

          {result.status === "not_registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                <StatePill tone="quiet">Not registered</StatePill>
              </div>
              <p className="domain-answer-lead">
                {result.query.unicode} is not registered, so there is no registrant.
              </p>
            </div>
          ) : null}

          {result.status === "registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                {identified ? (
                  <StatePill tone="good">Registrant published</StatePill>
                ) : (
                  <StatePill tone="quiet">Registrant withheld</StatePill>
                )}
                {result.redactions.length ? (
                  <StatePill tone="warn">
                    {result.redactions.length} field{result.redactions.length === 1 ? "" : "s"} redacted
                  </StatePill>
                ) : null}
              </div>

              {identified ? (
                <p className="domain-answer-lead">
                  {result.query.unicode} is registered to {registrant?.organization ?? registrant?.name}.
                </p>
              ) : (
                <p className="domain-answer-lead">
                  The registrant of {result.query.unicode} is not published.
                </p>
              )}

              <p>
                {result.registrar.name
                  ? `${result.registrar.name} is the registrar. `
                  : ""}
                {result.redactions.length
                  ? `It removed or emptied ${result.redactions.length} contact field${result.redactions.length === 1 ? "" : "s"} before publishing this record.`
                  : "This registry publishes no contact object at all, which is normal for thin registries such as .com."}
                {contactUri ? " There is a contact form for reaching the registrant without disclosing their details." : ""}
              </p>

              {!result.registrarFetch ? (
                <p>
                  We could not read the registrar&apos;s own record, so contact details may exist that are not shown
                  here. That is a failure on our side, not evidence that nothing is published.
                </p>
              ) : null}

              <SourceNote registration={result} />
            </div>
          ) : null}

          <Notes notes={result.notes} />

          {result.status === "registered" ? (
            <>
              {contactUri || result.registrar.abuseEmail ? (
                <section>
                  <h2>How to make contact</h2>
                  <dl className="domain-fact-list">
                    {contactUri ? (
                      <div>
                        <dt>Registrant contact form</dt>
                        <dd>
                          <a href={contactUri} rel="nofollow noreferrer" target="_blank">
                            {contactUri}
                          </a>
                          <small>Goes to the registrant without revealing who they are.</small>
                        </dd>
                      </div>
                    ) : null}
                    {result.registrar.abuseEmail ? (
                      <div>
                        <dt>Registrar abuse contact</dt>
                        <dd>
                          {result.registrar.abuseEmail}
                          <small>For phishing, malware and spam coming from the domain. Not for general questions.</small>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              {contacts.length ? (
                <section>
                  <h2>What is published</h2>
                  <div className="domain-findings">
                    {contacts.map((entity, index) => (
                      <EntityCard entity={entity} key={`${entity.roles.join("-")}-${index}`} />
                    ))}
                  </div>
                </section>
              ) : null}

              {result.redactions.length ? (
                <section>
                  <h2>What was withheld, field by field</h2>
                  <p>
                    The registrar publishes a machine readable list of what it removed and how, so you can see exactly
                    what exists in the record without it being public.
                  </p>
                  <div className="domain-table-scroll">
                    <table className="domain-table">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>What was done to it</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.redactions.map((redaction) => (
                          <tr key={`${redaction.field}-${redaction.method}`}>
                            <td>{redaction.field}</td>
                            <td>{redaction.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

          <RawResponses registration={result} />
        </section>
      ) : null}
    </section>
  );
}
