"use client";

import { useMemo, useState, type FormEvent } from "react";
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
  humanDuration,
  reportJson,
  useDomainLookup,
  type Tone,
} from "../../domain-tools/domain-lookup-client";

/** The lifecycle stages, in the order a domain moves through them. */
const STAGES = [
  { id: "registered", label: "Registered", duration: "up to 10 years" },
  { id: "auto renew period", label: "Auto renew grace", duration: "up to 45 days" },
  { id: "redemption period", label: "Redemption", duration: "30 days" },
  { id: "pending delete", label: "Pending delete", duration: "5 days" },
  { id: "released", label: "Released", duration: "immediate" },
] as const;

function currentStage(registration: DomainRegistration) {
  const codes = registration.statuses.map((status) => status.rdap);
  if (codes.includes("pending delete")) return "pending delete";
  if (codes.includes("redemption period")) return "redemption period";
  if (codes.includes("auto renew period")) return "auto renew period";
  return "registered";
}

function expiryPill(registration: DomainRegistration): { tone: Tone; label: string } {
  const stage = currentStage(registration);
  if (stage === "pending delete") return { tone: "bad", label: "Pending delete" };
  if (stage === "redemption period") return { tone: "bad", label: "In redemption" };
  if (stage === "auto renew period") return { tone: "warn", label: "Past expiry, in grace" };
  const days = daysBetween(registration.registryExpiryDate);
  if (days === null) return { tone: "quiet", label: "No expiry date published" };
  if (days < 0) return { tone: "bad", label: "Expiry date has passed" };
  if (days <= 30) return { tone: "warn", label: `${days} days left` };
  return { tone: "good", label: `${humanDuration(days)} left` };
}

export function DomainExpiryTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const { result, error, loading, run, setError } = useDomainLookup<DomainRegistration>();
  const report = useMemo(() => (result ? reportJson("Domain Expiry Checker", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain name.");
    void run({ name });
  }

  const pill = result ? expiryPill(result) : null;
  const stage = result ? currentStage(result) : null;
  const days = result ? daysBetween(result.registryExpiryDate) : null;
  const lifecycleCodes = result
    ? result.statuses.filter((status) => lookupStatus(status.rdap)?.group === "lifecycle")
    : [];

  return (
    <section className="domain-tool" aria-label="Domain expiry checker">
      <DomainForm
        busyLabel="Checking..."
        error={error}
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        submitLabel="Check the expiry"
        value={name}
      />

      {result ? (
        <section className="domain-results" aria-live="polite">
          <ResultHeader
            action={<DownloadReportButton contents={report} filename={`${result.query.domain}-expiry.json`} />}
            hostname={result.query.unicode}
          />

          <UnavailableNote registration={result} />

          {result.status === "not_registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                <StatePill tone="quiet">Not registered</StatePill>
              </div>
              <p className="domain-answer-lead">
                {result.query.unicode} is not registered, so there is no expiry date.
              </p>
            </div>
          ) : null}

          {result.status === "registered" ? (
            <div className="domain-answer">
              {pill ? (
                <div className="domain-answer-head">
                  <StatePill tone={pill.tone}>{pill.label}</StatePill>
                </div>
              ) : null}

              {stage === "redemption period" ? (
                <p className="domain-answer-lead">
                  {result.query.unicode} passed its expiry date and has been deleted. It is in the redemption period,
                  which means the previous owner can still get it back by paying a redemption fee. Nobody else can
                  register it while it sits here.
                </p>
              ) : stage === "pending delete" ? (
                <p className="domain-answer-lead">
                  {result.query.unicode} is in pending delete. It can no longer be restored by anyone, and it will be
                  released in a few days.
                </p>
              ) : stage === "auto renew period" ? (
                <p className="domain-answer-lead">
                  {result.query.unicode} passed its expiry date and the registry renewed it automatically. The registrar
                  now decides whether to bill for it or delete it, and it has up to 45 days to make that choice.
                </p>
              ) : days === null ? (
                <p className="domain-answer-lead">
                  The registry for <code>.{result.query.tld}</code> does not publish an expiry date for{" "}
                  {result.query.unicode}.
                </p>
              ) : (
                <p className="domain-answer-lead">
                  {result.query.unicode} expires in {humanDuration(days)}, on {formatDate(result.registryExpiryDate)}.
                </p>
              )}

              {result.registrarExpiryDate &&
              result.registrarExpiryDate !== result.registryExpiryDate ? (
                <p>
                  The registrar publishes a different date, {formatDate(result.registrarExpiryDate)}. The registry date
                  is the one that decides when the domain is actually deleted, so plan around that one.
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
                <h2>Where it is in the life cycle</h2>
                <div className="domain-table-scroll">
                  <table className="domain-table">
                    <thead>
                      <tr>
                        <th>Stage</th>
                        <th>How long</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {STAGES.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.label}</td>
                          <td className="domain-state-quiet">{entry.duration}</td>
                          <td>
                            {entry.id === stage ? (
                              <StatePill tone={entry.id === "registered" ? "good" : "bad"}>Here now</StatePill>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="domain-meta">
                  These durations are the ICANN shape for generic endings. The 30 day redemption and 5 day pending
                  delete are required of registries; the grace period is up to 45 days and registrars use it very
                  differently. Country endings run their own life cycles and several look nothing like this.
                </p>
              </section>

              {lifecycleCodes.length ? (
                <section>
                  <h2>Life cycle status codes on this domain</h2>
                  <div className="domain-table-scroll">
                    <table className="domain-table">
                      <tbody>
                        {lifecycleCodes.map((status) => {
                          const known = lookupStatus(status.rdap);
                          return (
                            <tr key={status.rdap}>
                              <th>
                                <code>{status.rdap}</code>
                              </th>
                              <td>{known?.meaning}</td>
                            </tr>
                          );
                        })}
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
