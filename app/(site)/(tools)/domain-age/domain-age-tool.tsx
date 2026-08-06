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
  Timeline,
  UnavailableNote,
  daysBetween,
  formatDate,
  humanDuration,
  reportJson,
  useDomainLookup,
  type Tone,
} from "../../domain-tools/domain-lookup-client";

/**
 * Age reads as trust, and that is exactly the mistake. Very new is worth a second
 * look, re-registered is worth knowing about, and everything else is just a fact.
 */
function agePill(days: number | null, reregistered: boolean): { tone: Tone; label: string } {
  if (days === null) return { tone: "quiet", label: "No date published" };
  if (reregistered) return { tone: "warn", label: "Re-registered" };
  if (days < 30) return { tone: "warn", label: "Registered this month" };
  if (days < 365) return { tone: "quiet", label: "Under a year old" };
  return { tone: "quiet", label: `${Math.floor(days / 365)} years old` };
}

export function DomainAgeTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const { result, error, loading, run, setError } = useDomainLookup<DomainRegistration>();
  const report = useMemo(() => (result ? reportJson("Domain Age Checker", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain name.");
    void run({ name, includeRegistrar: false });
  }

  const start = result?.reregistrationDate ?? result?.registrationDate ?? null;
  const ageDays = start ? Math.abs(daysBetween(start) ?? 0) : null;
  const pill = agePill(ageDays, Boolean(result?.reregistrationDate));

  return (
    <section className="domain-tool" aria-label="Domain age checker">
      <DomainForm
        busyLabel="Checking..."
        error={error}
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        submitLabel="Check the age"
        value={name}
      />

      {result ? (
        <section className="domain-results" aria-live="polite">
          <ResultHeader
            action={<DownloadReportButton contents={report} filename={`${result.query.domain}-age.json`} />}
            hostname={result.query.unicode}
          />

          <UnavailableNote registration={result} />

          {result.status === "not_registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                <StatePill tone="quiet">Not registered</StatePill>
              </div>
              <p className="domain-answer-lead">
                {result.query.unicode} is not registered, so it has no age.
              </p>
            </div>
          ) : null}

          {result.status === "registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                <StatePill tone={pill.tone}>{pill.label}</StatePill>
              </div>
              {ageDays === null ? (
                <>
                  <p className="domain-answer-lead">
                    The registry for <code>.{result.query.tld}</code> does not publish a registration date for{" "}
                    {result.query.unicode}.
                  </p>
                  <p>
                    That is a gap in what this registry chooses to publish, not a sign of anything unusual about the
                    domain. Several country endings work this way.
                  </p>
                </>
              ) : result.reregistrationDate ? (
                <>
                  <p className="domain-answer-lead">
                    {result.query.unicode} was first registered on {formatDate(result.registrationDate)}, but the
                    registry records a re-registration on {formatDate(result.reregistrationDate)}.
                  </p>
                  <p>
                    This means the domain was registered subsequently to its initial registration. The current
                    registration is {humanDuration(ageDays)} old. This event does not say why the domain was registered
                    again or whether its owner changed.
                  </p>
                </>
              ) : (
                <>
                  <p className="domain-answer-lead">
                    {result.query.unicode} has been registered for {humanDuration(ageDays)}.
                  </p>
                  <p>
                    The registration was created on {formatDate(result.registrationDate)}. The registry does not publish
                    a re-registration date for it. This current record does not reveal whether the domain existed under
                    an earlier registration before that date.
                  </p>
                </>
              )}
              <SourceNote registration={result} />
            </div>
          ) : null}

          <Notes notes={result.notes} />

          {result.status === "registered" && start ? (
            <section>
              <h2>Where it sits in its term</h2>
              <Timeline
                end={result.registryExpiryDate}
                start={start}
                startLabel={result.reregistrationDate ? "Re-registered" : "Registered"}
              />
              {result.lastChangedDate ? (
                <p>
                  The registry says information in this registration record last changed on{" "}
                  {formatDate(result.lastChangedDate)}. RDAP does not identify what changed, why it changed, or whether
                  the website itself changed.
                </p>
              ) : null}
            </section>
          ) : null}

          <RawResponses registration={result} />
        </section>
      ) : null}
    </section>
  );
}
