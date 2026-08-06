"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { lookupStatus } from "@/lib/domain/status-codes.ts";
import type { DomainRegistration } from "@/lib/domain/types.ts";
import {
  DomainForm,
  DownloadReportButton,
  Notes,
  RawResponses,
  ResultHeader,
  SourceNote,
  StatePill,
  Timeline,
  UnavailableNote,
  daysBetween,
  formatDate,
  reportJson,
  useDomainLookup,
  type Tone,
} from "../../domain-tools/domain-lookup-client";

function Fact({
  term,
  children,
  emphasis,
  tone,
  unknown,
}: {
  term: string;
  children: ReactNode;
  emphasis?: boolean;
  tone?: Tone;
  unknown?: boolean;
}) {
  return (
    <div>
      <dt>{term}</dt>
      <dd data-emphasis={emphasis ? "true" : undefined} data-tone={tone} data-unknown={unknown ? "true" : undefined}>
        {children}
      </dd>
    </div>
  );
}

/** One pill that says what this domain is, before any prose. */
function headlinePill(registration: DomainRegistration): { tone: Tone; label: string } {
  if (registration.status === "not_registered") return { tone: "quiet", label: "Not registered" };
  const codes = registration.statuses.map((status) => status.rdap);
  if (codes.includes("pending delete")) return { tone: "bad", label: "Pending delete" };
  if (codes.includes("redemption period")) return { tone: "bad", label: "In redemption" };
  if (codes.includes("client hold") || codes.includes("server hold")) {
    return { tone: "bad", label: "On hold, not resolving" };
  }
  const days = daysBetween(registration.registryExpiryDate);
  if (days !== null && days < 0) return { tone: "bad", label: "Past its expiry date" };
  if (days !== null && days <= 30) return { tone: "warn", label: `Expires in ${days} days` };
  return { tone: "good", label: "Registered" };
}

function leadSentence(registration: DomainRegistration) {
  const name = registration.query.unicode;
  if (registration.status === "not_registered") {
    return `${name} is not registered. The registry for .${registration.query.tld} has no record of it.`;
  }
  const registrar = registration.registrar.name;
  const created = formatDate(registration.registrationDate);
  const expires = formatDate(registration.registryExpiryDate);
  const parts = [`${name} is registered`];
  if (registrar) parts.push(`through ${registrar}`);
  if (created) parts.push(`It was created on ${created}`);
  if (expires) parts.push(`and the registry expiry date is ${expires}`);
  return `${parts[0]}${parts[1] ? ` ${parts[1]}` : ""}. ${parts.slice(2).join(" ")}${parts.length > 2 ? "." : ""}`;
}

export function DomainLookupTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const { result, error, loading, run, setError } = useDomainLookup<DomainRegistration>();
  const report = useMemo(() => (result ? reportJson("Domain Registration Lookup", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain name.");
    void run({ name });
  }

  const headline = result ? headlinePill(result) : null;
  const expiryDays = result ? daysBetween(result.registryExpiryDate) : null;

  return (
    <section className="domain-tool" aria-label="Domain registration lookup">
      <DomainForm
        error={error}
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        value={name}
      />

      {result ? (
        <section className="domain-results" aria-live="polite">
          <ResultHeader
            action={
              <DownloadReportButton contents={report} filename={`${result.query.domain}-registration.json`} />
            }
            hostname={result.query.unicode}
          />

          <UnavailableNote registration={result} />

          {result.status === "registered" || result.status === "not_registered" ? (
            <div className="domain-answer">
              {headline ? (
                <div className="domain-answer-head">
                  <StatePill tone={headline.tone}>{headline.label}</StatePill>
                </div>
              ) : null}
              <p className="domain-answer-lead">{leadSentence(result)}</p>
              {result.statuses.length ? (
                <p>
                  The registry currently has {result.statuses.length === 1 ? "one status" : `${result.statuses.length} statuses`}{" "}
                  on it: {result.statuses.map((status) => status.rdap).join(", ")}.
                </p>
              ) : null}
              <Timeline end={result.registryExpiryDate} start={result.registrationDate} />
              <SourceNote registration={result} />
            </div>
          ) : null}

          <Notes notes={result.notes} />

          {result.status === "registered" ? (
            <>
              <section>
                <h2>Dates</h2>
                <dl className="domain-fact-list">
                  <Fact term="Registered" unknown={!result.registrationDate}>
                    {formatDate(result.registrationDate) ?? "Not published by this registry"}
                  </Fact>
                  {result.reregistrationDate ? (
                    <Fact term="Re-registered" tone="warn">
                      {formatDate(result.reregistrationDate)}
                      <small>The name was dropped at some point and picked up again.</small>
                    </Fact>
                  ) : null}
                  <Fact
                    emphasis
                    term="Registry expiry"
                    tone={expiryDays === null ? undefined : expiryDays < 0 ? "bad" : expiryDays <= 30 ? "warn" : undefined}
                    unknown={!result.registryExpiryDate}
                  >
                    {formatDate(result.registryExpiryDate) ?? "Not published"}
                    <small>This is the date the registry acts on.</small>
                  </Fact>
                  <Fact term="Registrar expiry" unknown={!result.registrarExpiryDate}>
                    {formatDate(result.registrarExpiryDate) ?? "Not published by the registrar"}
                    <small>A separate field. It can differ from the registry date when a renewal has not caught up.</small>
                  </Fact>
                  {result.transferDate ? (
                    <Fact term="Last transferred">{formatDate(result.transferDate)}</Fact>
                  ) : null}
                  <Fact term="Record last changed" unknown={!result.lastChangedDate}>
                    {formatDate(result.lastChangedDate) ?? "Not published"}
                    <small>When the registry record changed. It does not say what changed.</small>
                  </Fact>
                  <Fact term="Registry database updated" unknown={!result.registryDatabaseUpdated}>
                    {formatDate(result.registryDatabaseUpdated) ?? "Not published"}
                    <small>When the registry refreshed its own copy. Nothing to do with this domain.</small>
                  </Fact>
                </dl>
              </section>

              <section>
                <h2>Registrar</h2>
                <dl className="domain-fact-list">
                  <Fact emphasis term="Registrar" unknown={!result.registrar.name}>
                    {result.registrar.name ?? "Not published"}
                  </Fact>
                  <Fact term="IANA ID" unknown={!result.registrar.ianaId}>{result.registrar.ianaId ?? "Not published"}</Fact>
                  <Fact term="Abuse contact" unknown={!result.registrar.abuseEmail}>
                    {result.registrar.abuseEmail ?? "Not published"}
                    {result.registrar.abusePhone ? <small>{result.registrar.abusePhone}</small> : null}
                  </Fact>
                </dl>
              </section>

              {result.statuses.length ? (
                <section>
                  <h2>Status codes</h2>
                  <div className="domain-table-scroll">
                    <table className="domain-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Who set it</th>
                          <th>What it means</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.statuses.map((status) => {
                          const known = lookupStatus(status.rdap);
                          const tone: Tone = !known
                            ? "quiet"
                            : known.removesFromDns
                              ? "bad"
                              : known.group === "registry_lock"
                                ? "warn"
                                : known.group === "normal"
                                  ? "good"
                                  : "quiet";
                          return (
                            <tr key={status.rdap}>
                              <td>
                                <code>{status.rdap}</code>
                                {status.epp && status.epp !== status.rdap ? (
                                  <small style={{ display: "block" }}>
                                    <code>{status.epp}</code>
                                  </small>
                                ) : null}
                              </td>
                              <td>
                                <StatePill tone={tone}>
                                  {!known
                                    ? "Not in our reference"
                                    : known.removesFromDns
                                      ? "Stops DNS"
                                      : known.group === "registrar_lock"
                                        ? "Your registrar set it"
                                        : known.group === "registry_lock"
                                          ? "The registry set it"
                                          : known.group === "normal"
                                            ? "Normal"
                                            : "In progress"}
                                </StatePill>
                              </td>
                              <td>
                                {known ? (
                                  <>
                                    {known.meaning}{" "}
                                    <a href="/epp-status-codes">More on status codes</a>
                                  </>
                                ) : (
                                  "We do not have an explanation for this one, so it is shown exactly as the registry returned it."
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              <section>
                <h2>Nameservers and DNSSEC</h2>
                <dl className="domain-fact-list">
                  <Fact term="Nameservers on record" tone={result.nameservers.length ? undefined : "warn"} unknown={!result.nameservers.length}>
                    {result.nameservers.length
                      ? result.nameservers.map((nameserver) => nameserver.hostname).join(", ")
                      : "None on record, so nothing resolves under this domain"}
                    <small>
                      This is what the registry holds. It can differ from what DNS is actually serving.{" "}
                      <a href="/nameserver-checker">Check the delegation</a>.
                    </small>
                  </Fact>
                  <Fact term="DNSSEC" unknown={result.dnssecSigned === null}>
                    {result.dnssecSigned === null
                      ? "Not reported by this registry"
                      : result.dnssecSigned
                        ? "Signed, so a DS record is published"
                        : "Not signed"}
                    <small>
                      This says whether a DS record exists, not whether the chain validates.{" "}
                      <a href="/dnssec-checker">Validate the chain</a>.
                    </small>
                  </Fact>
                </dl>
              </section>

              {result.redactions.length ? (
                <section>
                  <h2>What the registrar withheld</h2>
                  <p>
                    The registrar published a machine readable list of the contact fields it removed, so you can see
                    exactly what exists without it being public. There is more on this, including how to make contact,
                    on the <a href="/domain-owner">registrant lookup</a>.
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
