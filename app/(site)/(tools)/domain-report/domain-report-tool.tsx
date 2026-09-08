"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ToolButton,
  ToolDataTable,
  ToolDownloadAction,
  ToolResultLead,
  ToolStatus,
  ToolTextField,
} from "@/app/tool-ui/tool-controls";
import type { DomainReport, ReportFinding } from "@/lib/domain/report.ts";
import {
  coverageRows,
  findingDetail,
  findingEvidence,
  findingGroups,
  findingSource,
  nameserverStageAgreement,
  nameserverStages,
  reportLead,
  reportSourceRows,
} from "./domain-report-view";
import styles from "./domain-report-tool.module.css";

function NameserverSources({ result }: { result: DomainReport }) {
  const stages = nameserverStages(result);
  if (!stages.length) return null;
  return (
    <section className={styles.section}>
      <h3>{nameserverStageAgreement(stages)}</h3>
      <ol aria-label="Registration, parent, and child nameserver sources" className={styles.sourceChain}>
        {stages.map((stage) => (
          <li key={stage.id}>
            <span>{stage.label}</span>
            {stage.names?.length ? <ul>{stage.names.map((name) => <li key={name}><code>{name}</code></li>)}</ul> : <strong>{stage.names === null ? "Unavailable" : "Not published"}</strong>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function FindingRow({ finding }: { finding: ReportFinding }) {
  const evidence = findingEvidence(finding);
  return (
    <article className={styles.finding}>
      <h4>{finding.title}</h4>
      <p>{findingDetail(finding)}</p>
      <small>Source: {findingSource(finding)}</small>
      {evidence ? <code>{evidence}</code> : null}
      {finding.tool ? <Link href={finding.tool.href}>Investigate with {finding.tool.label}</Link> : null}
    </article>
  );
}

function FindingGroups({ result }: { result: DomainReport }) {
  const groups = findingGroups(result);
  if (!groups.length) return null;
  return (
    <div className={styles.findingGroups}>
      {groups.map((group) => <section className={styles.section} key={group.state}><h3>{group.title}</h3><div className={styles.findings}>{group.findings.map((finding) => <FindingRow finding={finding} key={finding.id} />)}</div></section>)}
    </div>
  );
}

function Sources({ result }: { result: DomainReport }) {
  const rows = reportSourceRows(result);
  if (!rows.length) return null;
  return (
    <section className={styles.section}>
      <h3>Source snapshot</h3>
      <dl className={styles.metadata}>{rows.map((row) => <div key={row.id}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
      <p className={styles.vantage}>This is a snapshot from the stack127 server, not propagation history or every resolver's view.</p>
    </section>
  );
}

function ReportResult({ result, fallback }: { result: DomainReport; fallback: string }) {
  const domain = result.registration?.query.domain ?? result.delegation?.zone ?? fallback;
  const report = JSON.stringify({ tool: "Domain Registration Report", reportVersion: 1, ...result }, null, 2);
  const noChecks = result.ranChecks.length === 0;
  return (
    <section aria-label="Domain registration report result" className={styles.results} data-domain-report-result>
      <div aria-atomic="true" aria-live="polite"><ToolResultLead>{reportLead(result, fallback)}</ToolResultLead></div>
      <section className={styles.section}>
        <h3>Checks in this report</h3>
        <ToolDataTable ariaLabel="Registration and nameserver check coverage" columns={[{ id: "check", label: "Check" }, { id: "state", label: "State" }, { id: "source", label: "Source" }, { id: "note", label: "Note" }]} rows={coverageRows(result).map((row) => ({ id: row.id, cells: row }))} />
      </section>
      <NameserverSources result={result} />
      <FindingGroups result={result} />
      <Sources result={result} />
      {noChecks ? <ToolStatus tone="warning">Try the report again.</ToolStatus> : null}
      <div className={styles.download}><ToolDownloadAction contents={report} filename={`${domain}-report.json`} label="Download report" mimeType="application/json;charset=utf-8" /></div>
    </section>
  );
}

export function DomainReportTool({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<DomainReport | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setHydrated(true), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlightRef.current) return;
    setResult(null);
    if (!name.trim()) {
      setRequestError(null);
      setFieldError("Enter a domain name, including the ending.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    inFlightRef.current = true;
    setLoading(true);
    setFieldError(null);
    setRequestError(null);
    try {
      const response = await fetch("/api/domain/report", { body: JSON.stringify({ name }), headers: { "content-type": "application/json" }, method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message ?? "The report could not run just now. Try again.";
        if (response.status === 400) {
          setFieldError(message);
          requestAnimationFrame(() => inputRef.current?.focus());
          return;
        }
        throw new Error(message);
      }
      setResult(data as DomainReport);
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "The report could not run just now. Try again.");
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }

  return (
    <section aria-label="Domain registration report" className={`domain-tool ${styles.workbench}`} data-hydrated={hydrated ? "true" : undefined} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <ToolTextField autoCapitalize="none" autoComplete="off" className={styles.queryField} error={fieldError} inputMode="url" inputRef={inputRef} label="Domain name" name="name" onChange={(value) => { setName(value); if (fieldError) setFieldError(null); if (requestError) setRequestError(null); }} placeholder="example.com" required spellCheck={false} type="text" value={name} />
        <ToolButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">{loading ? "Running registration and DNS checks..." : "Run the report"}</ToolButton>
        {loading ? <div className={styles.formStatus}><ToolStatus>Running registration and DNS checks...</ToolStatus></div> : null}
        {requestError ? <div className={styles.formStatus}><ToolStatus tone="danger">{requestError}</ToolStatus></div> : null}
      </form>
      {result ? <ReportResult fallback={name.trim()} result={result} /> : null}
    </section>
  );
}
