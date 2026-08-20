"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { DomainReport, ReportFinding } from "@/lib/domain/report.ts";
import {
  DomainForm,
  DownloadReportButton,
  ResultHeader,
  StatePill,
  reportJson,
  useDomainLookup,
  type Tone,
} from "../../domain-tools/domain-lookup-client";

const STATE_TONE: Record<ReportFinding["state"], Tone> = {
  attention: "bad",
  decide: "warn",
  context: "quiet",
};

const STATE_LABEL: Record<ReportFinding["state"], string> = {
  attention: "Worth a look",
  decide: "Your call",
  context: "Context",
};

const GROUPS: { state: ReportFinding["state"]; title: string; intro: string }[] = [
  {
    state: "attention",
    title: "Worth a look",
    intro: "Things that usually mean something is misconfigured or about to become a problem.",
  },
  {
    state: "decide",
    title: "Your call",
    intro: "Not wrong, but they depend on what you intended.",
  },
  {
    state: "context",
    title: "Context",
    intro: "Confirmed as expected. Here so you can see it was actually checked.",
  },
];

function Finding({ finding }: { finding: ReportFinding }) {
  return (
    <div className="domain-finding" data-tone={STATE_TONE[finding.state]}>
      <div className="domain-finding-head">
        <h3>{finding.title}</h3>
        <StatePill tone={STATE_TONE[finding.state]}>{STATE_LABEL[finding.state]}</StatePill>
      </div>
      <p>{finding.detail}</p>
      {finding.evidence ? <p className="domain-finding-evidence">{finding.evidence}</p> : null}
      {finding.tool ? (
        <p className="domain-finding-state">
          <a href={finding.tool.href}>Investigate with {finding.tool.label}</a>
        </p>
      ) : null}
    </div>
  );
}

export function DomainReportTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const { result, error, loading, run, setError } = useDomainLookup<DomainReport>("/api/domain/report");
  const report = useMemo(() => (result ? reportJson("Domain Registration Report", result) : ""), [result]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain name.");
    void run({ name });
  }

  const attention = result?.findings.filter((finding) => finding.state === "attention").length ?? 0;
  const hostname = result?.registration?.query.unicode ?? name;

  return (
    <section className="domain-tool" aria-label="Domain registration report">
      <DomainForm
        busyLabel="Running both checks..."
        error={error}
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        submitLabel="Run the report"
        value={name}
      />

      {result ? (
        <section className="domain-results" aria-live="polite">
          <ResultHeader
            action={<DownloadReportButton contents={report} filename={`${hostname}-report.json`} />}
            hostname={hostname}
          />

          <div className="domain-answer">
            <div className="domain-answer-head">
              {attention === 0 ? (
                <StatePill tone="good">Nothing needs attention</StatePill>
              ) : (
                <StatePill tone="bad">
                  {attention} thing{attention === 1 ? "" : "s"} to look at
                </StatePill>
              )}
              {result.skippedChecks.length ? (
                <StatePill tone="warn">
                  {result.skippedChecks.length} check{result.skippedChecks.length === 1 ? "" : "s"} did not run
                </StatePill>
              ) : null}
            </div>
            <p className="domain-answer-lead">{result.summary}</p>
            <p className="domain-meta">
              Ran {result.ranChecks.join(" and ").toLowerCase() || "nothing"} in{" "}
              {result.durationMs.toLocaleString("en-US")} ms. This is a snapshot from the stack127 server, not a view
              of what every resolver worldwide sees.
            </p>
          </div>

          {result.skippedChecks.length ? (
            <section>
              <h2>What did not run</h2>
              <div className="domain-findings">
                {result.skippedChecks.map((skipped) => (
                  <div className="domain-finding" data-tone="warn" key={skipped.name}>
                    <div className="domain-finding-head">
                      <h3>{skipped.name}</h3>
                      <StatePill tone="warn">Skipped</StatePill>
                    </div>
                    <p>{skipped.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {GROUPS.map((group) => {
            const findings = result.findings.filter((finding) => finding.state === group.state);
            if (!findings.length) return null;
            return (
              <section key={group.state}>
                <div className="domain-answer-head">
                  <h2>{group.title}</h2>
                  <StatePill tone={STATE_TONE[group.state]}>{findings.length}</StatePill>
                </div>
                <p>{group.intro}</p>
                <div className="domain-findings">
                  {findings.map((finding) => (
                    <Finding finding={finding} key={finding.id} />
                  ))}
                </div>
              </section>
            );
          })}
        </section>
      ) : null}
    </section>
  );
}
