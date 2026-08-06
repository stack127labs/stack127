"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { TransferFinding, TransferReadiness } from "@/lib/domain/transfer-readiness.ts";
import {
  DomainForm,
  DownloadReportButton,
  RawResponses,
  ResultHeader,
  SourceNote,
  StatePill,
  UnavailableNote,
  reportJson,
  useDomainLookup,
  type Tone,
} from "../../domain-tools/domain-lookup-client";

const STATE_TONE: Record<TransferFinding["state"], Tone> = {
  blocked: "bad",
  risk: "warn",
  clear: "good",
  unknown: "quiet",
};

const STATE_LABEL: Record<TransferFinding["state"], string> = {
  blocked: "Blocking",
  risk: "Worth planning for",
  clear: "Clear",
  unknown: "Cannot tell",
};

function Finding({ finding }: { finding: TransferFinding }) {
  return (
    <div className="domain-finding" data-tone={STATE_TONE[finding.state]}>
      <div className="domain-finding-head">
        <h3>{finding.title}</h3>
        <StatePill tone={STATE_TONE[finding.state]}>{STATE_LABEL[finding.state]}</StatePill>
      </div>
      <p>{finding.detail}</p>
      {finding.evidence ? <p className="domain-finding-evidence">{finding.evidence}</p> : null}
      {finding.state === "blocked" ? (
        <p className="domain-finding-state">
          {finding.selfServiceable
            ? "You can clear this one yourself."
            : "You cannot clear this one yourself. It goes through your registrar."}
        </p>
      ) : null}
    </div>
  );
}

export function TransferReadinessTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const { result, error, loading, run, setError } = useDomainLookup<TransferReadiness>(
    "/api/domain/transfer-readiness",
  );
  const report = useMemo(() => (result ? reportJson("Domain Transfer Readiness", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain name.");
    void run({ name });
  }

  const blocked = result?.findings.filter((finding) => finding.state === "blocked") ?? [];
  const yours = blocked.filter((finding) => finding.selfServiceable);
  const registration = result?.registration;

  // Blockers first, then risks, then everything else. The eye should hit what
  // stops the transfer before it hits what is fine.
  const ordered = result
    ? [...result.findings].sort((a, b) => {
        const rank = { blocked: 0, risk: 1, unknown: 2, clear: 3 };
        return rank[a.state] - rank[b.state];
      })
    : [];

  return (
    <section className="domain-tool" aria-label="Domain transfer readiness">
      <DomainForm
        busyLabel="Checking..."
        error={error}
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        submitLabel="Check if it can move"
        value={name}
      />

      {result && registration ? (
        <section className="domain-results" aria-live="polite">
          <ResultHeader
            action={<DownloadReportButton contents={report} filename={`${registration.query.domain}-transfer.json`} />}
            hostname={registration.query.unicode}
          />

          <UnavailableNote registration={registration} />

          {registration.status === "registered" ? (
            <div className="domain-answer">
              <div className="domain-answer-head">
                {blocked.length === 0 ? (
                  <StatePill tone="good">Nothing visible is blocking it</StatePill>
                ) : yours.length === blocked.length ? (
                  <StatePill tone="warn">Blocked, but by things you control</StatePill>
                ) : (
                  <StatePill tone="bad">Blocked</StatePill>
                )}
              </div>
              <p className="domain-answer-lead">{result.summary}</p>
              <p className="domain-meta">
                Checked against the {result.policy.label.toLowerCase()}, which applies a{" "}
                {result.policy.afterRegistrationDays} day lock after registration and after a transfer.
                {result.pendingPolicyChange
                  ? " ICANN adopted a shorter replacement on 7 June 2026 that has not been implemented yet, so it does not apply."
                  : ""}
              </p>
              <SourceNote registration={registration} />
            </div>
          ) : null}

          {registration.status === "registered" ? (
            <>
              <section>
                <h2>What we checked</h2>
                <div className="domain-findings">
                  {ordered.map((finding) => (
                    <Finding finding={finding} key={finding.id} />
                  ))}
                </div>
              </section>

              <section>
                <h2>What we cannot see</h2>
                <p>
                  All of this lives in your registrar account rather than the public record, and any one of it can stop
                  a transfer even when everything above is clear.
                </p>
                <ul>
                  {result.cannotCheck.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}

          <RawResponses registration={registration} />
        </section>
      ) : null}
    </section>
  );
}
