"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiCopyAction, UiTextArea } from "@/app/ui/controls";
import { UiActionRow, UiResultLead, UiStatus } from "@/app/ui/display";
import {
  buildCopyReport,
  checkCompose,
} from "@/lib/docker-compose-checker/engine";
import type { Diagnostic, EngineResult, ParsedResult } from "@/lib/docker-compose-checker/types";
import styles from "./docker-compose-checker.module.css";

const exampleCompose = `services:
  web:
    image: nginx:\${APP_TAG}
    depends_on:
      - db`;
const exampleEnvironment = "APP_TAG=latest";

function removeStateParameter() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("state")) return false;
  url.searchParams.delete("state");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}

function locationText(item: Diagnostic) {
  if (item.line === null || item.column === null) return "line and column unavailable";
  return `line ${item.line}, column ${item.column}`;
}

function resultIsParsed(result: EngineResult): result is ParsedResult {
  return result.status === "parsed";
}

function statusAnnouncement(result: EngineResult) {
  if (result.status === "parsed") {
    return result.completeness.status === "incomplete" ? `${result.lead}. Incomplete model.` : result.lead;
  }
  return result.lead;
}

function focusAtTop(element: HTMLElement | null) {
  if (!element) return;
  element.scrollIntoView({ block: "start", inline: "nearest" });
  element.focus({ preventScroll: true });
}

function FindingRow({ finding }: { finding: Diagnostic }) {
  const path = finding.path ?? (finding.input === "environment" ? "interpolation environment" : finding.input === "compose" ? "Compose file" : "path unavailable");
  return (
    <tr>
      <td data-label="Severity">
        <strong className={styles[`severity${finding.severity}`]}>{finding.severity}</strong>
        <span className={styles.layer}>{finding.layer}</span>
      </td>
      <td data-label="Code"><code>{finding.code}</code></td>
      <td data-label="Path"><code>{path}</code></td>
      <td data-label="Location">{locationText(finding)}</td>
      <td data-label="Finding">
        <p>{finding.message}</p>
        {finding.excerpt ? <code className={styles.excerpt}>{finding.excerpt}</code> : null}
      </td>
      <td data-label="Fix">{finding.fix}</td>
    </tr>
  );
}

function MetricList({ result }: { result: ParsedResult }) {
  const entries = [
    ["Services", result.counts.services],
    ["Published ports", result.counts.publishedPorts],
    ["Named volumes", result.counts.namedVolumes],
    ["Networks", result.counts.networks],
    ["Secrets", result.counts.secrets],
    ["Configs", result.counts.configs],
    ["Profiles", result.counts.profiles],
    ["Interpolation tokens", result.counts.interpolationTokens],
    ["Errors", result.counts.errors],
    ["Warnings", result.counts.warnings],
    ["Advisories", result.counts.advisories],
  ] as const;
  return (
    <dl className={styles.metrics} aria-label="Compose check counts">
      {entries.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ModelSummary({ result }: { result: ParsedResult }) {
  const states = Object.entries(result.summary.interpolationStates)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${key} ${value}`)
    .join(", ") || "none";
  const resources = Object.entries(result.summary.resources)
    .map(([key, values]) => `${key}: ${values.length ? values.join(", ") : "none"}`)
    .join("; ");
  return (
    <section className={styles.section} aria-labelledby="compose-model-summary">
      <h3 id="compose-model-summary">Normalized model</h3>
      <dl className={styles.summary}>
        <div><dt>Services</dt><dd><code>{result.summary.services.join(", ") || "none"}</code></dd></div>
        <div><dt>Profiles</dt><dd><code>{result.summary.profiles.join(", ") || "none"}</code></dd></div>
        <div><dt>Published port keys</dt><dd><code>{result.summary.publishedPortKeys.join(", ") || "none"}</code></dd></div>
        <div><dt>Dependency edges</dt><dd>{result.summary.dependencyEdges}</dd></div>
        <div><dt>Interpolation states</dt><dd><code>{states}</code></dd></div>
        <div><dt>Resources</dt><dd><code>{resources}</code></dd></div>
        <div><dt>Completeness</dt><dd>{result.completeness.status === "complete" ? "One pasted file" : "Incomplete model"}</dd></div>
        {result.completeness.reasons.length ? <div><dt>Incomplete reasons</dt><dd><code>{result.completeness.reasons.join("; ")}</code></dd></div> : null}
      </dl>
    </section>
  );
}

function ParsedResultView({ result }: { result: ParsedResult }) {
  return (
    <>
      <section className={styles.section} aria-labelledby="compose-findings">
        <h3 id="compose-findings">Findings</h3>
        {result.findings.length ? (
          <table className={styles.findings}>
            <caption className={styles.visuallyHidden}>Compose checker findings</caption>
            <thead><tr><th>Severity</th><th>Code</th><th>Path</th><th>Location</th><th>Finding</th><th>Fix</th></tr></thead>
            <tbody>{result.findings.map((finding, index) => <FindingRow finding={finding} key={`${finding.code}-${finding.path}-${index}`} />)}</tbody>
          </table>
        ) : <p className={styles.emptyFinding}>No findings.</p>}
      </section>
      <section className={styles.section} aria-labelledby="compose-layers">
        <h3 id="compose-layers">Check layers</h3>
        <dl className={styles.layers}>
          {result.layers.map((layer) => <div key={layer.name}><dt>{layer.name}</dt><dd>{layer.status}</dd></div>)}
        </dl>
      </section>
      <section className={styles.section} aria-labelledby="compose-counts">
        <h3 id="compose-counts">Counts</h3>
        <MetricList result={result} />
      </section>
      <ModelSummary result={result} />
      <div className={styles.resultActions}>
        <UiCopyAction label="Copy report" successLabel="Report copied" failureLabel="Copy failed" value={buildCopyReport(result)} />
      </div>
      <dl className={styles.provenance}>
        <div><dt>Engine</dt><dd>{result.provenance.engineVersion}</dd></div>
        <div><dt>Spec snapshot</dt><dd>{result.provenance.composeSpecSnapshotDate}</dd></div>
        <div><dt>Schema</dt><dd>{result.provenance.schemaSnapshotId}</dd></div>
        <div><dt>Parser</dt><dd>yaml {result.provenance.parserVersion}</dd></div>
      </dl>
      <section className={styles.section} aria-labelledby="compose-limitations">
        <h3 id="compose-limitations">Limitations</h3>
        <p className={styles.limitations}>Referenced files are not merged.</p>
        <p className={styles.limitations}>Docker and live services are not inspected.</p>
      </section>
    </>
  );
}

function InvalidResultView({ result }: { result: Extract<EngineResult, { status: "input-invalid" | "syntax-invalid" | "model-invalid" }> }) {
  const heading = result.status === "input-invalid" ? "Input findings" : result.status === "model-invalid" ? "Compose model findings" : "Syntax findings";
  const caption = result.status === "input-invalid" ? "Input findings" : result.status === "model-invalid" ? "Compose model findings" : "YAML syntax findings";
  const boundary = result.status === "input-invalid"
    ? "No model output until input is fixed."
    : result.status === "model-invalid"
      ? "No normalized model until root is fixed."
      : "No model output after syntax errors.";
  return (
    <section className={styles.section} aria-labelledby="compose-invalid-findings">
      <h3 id="compose-invalid-findings">{heading}</h3>
      <table className={styles.findings}>
        <caption className={styles.visuallyHidden}>{caption}</caption>
        <thead><tr><th>Severity</th><th>Code</th><th>Path</th><th>Location</th><th>Finding</th><th>Fix</th></tr></thead>
        <tbody>{result.findings.map((finding, index) => <FindingRow finding={finding} key={`${finding.code}-${index}`} />)}</tbody>
      </table>
      <p className={styles.syntaxBoundary}>{boundary}</p>
    </section>
  );
}

export function DockerComposeChecker() {
  const [hydrated, setHydrated] = useState(false);
  const [compose, setCompose] = useState("");
  const [environment, setEnvironment] = useState("");
  const [result, setResult] = useState<EngineResult | null>(null);
  const [errors, setErrors] = useState<{ compose?: string; environment?: string }>({});
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const environmentRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const failureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHydrated(true);
    if (removeStateParameter()) setStatus("Shared inputs are not supported");
  }, []);

  function clearResult() {
    setResult(null);
    setFailed(false);
    setStatus("Inputs changed");
    removeStateParameter();
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    setErrors({});
    setFailed(false);
    try {
      const next = checkCompose(compose, environment);
      const first = next.findings[0];
      if (next.status === "input-invalid" && first?.code === "INPUT-COMPOSE-EMPTY") {
        setResult(null);
        setErrors({ compose: first.message });
        setStatus("Fix the highlighted input");
        composeRef.current?.focus();
        return;
      }
      if (next.status === "input-invalid" && first?.code.startsWith("INPUT-ENV")) {
        setResult(null);
        setErrors({ environment: first.message });
        setStatus("Fix the highlighted input");
        environmentRef.current?.focus();
        return;
      }
      setResult(next);
      setStatus(statusAnnouncement(next));
      requestAnimationFrame(() => {
        if (next.status === "syntax-invalid") composeRef.current?.focus();
        else if (next.status === "input-invalid") {
          if (first?.input === "environment" || first?.code.startsWith("INPUT-ENV")) environmentRef.current?.focus();
          else composeRef.current?.focus();
        }
        else focusAtTop(resultRef.current);
      });
    } catch {
      setResult(null);
      setFailed(true);
      setStatus("The checker stopped. Try again.");
      requestAnimationFrame(() => focusAtTop(failureRef.current));
    }
  }

  function loadExample() {
    setCompose(exampleCompose);
    setEnvironment(exampleEnvironment);
    setErrors({});
    setResult(null);
    setFailed(false);
    setStatus("Example loaded");
    removeStateParameter();
    composeRef.current?.focus();
  }

  function reset() {
    setCompose("");
    setEnvironment("");
    setErrors({});
    setResult(null);
    setFailed(false);
    setStatus("Checker reset");
    removeStateParameter();
    composeRef.current?.focus();
  }

  return (
    <section aria-label="Docker Compose checker inputs and results" className={styles.tool} data-hydrated={hydrated ? "true" : undefined} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <UiTextArea
          autoCapitalize="none"
          className={styles.editor}
          description="Paste one Compose YAML document."
          error={errors.compose}
          inputRef={composeRef}
          label="Compose file"
          onChange={(value) => { setCompose(value); setErrors((current) => ({ ...current, compose: undefined })); clearResult(); }}
          placeholder={'services:\n  web:\n    image: nginx:latest'}
          required
          rows={12}
          spellCheck={false}
          value={compose}
        />
        <UiTextArea
          autoCapitalize="none"
          className={styles.editor}
          description="Optional KEY=VALUE interpolation lines. Not service env_file."
          error={errors.environment}
          inputRef={environmentRef}
          label="Interpolation environment"
          onChange={(value) => { setEnvironment(value); setErrors((current) => ({ ...current, environment: undefined })); clearResult(); }}
          placeholder={'APP_TAG=latest\nDB_HOST=db.internal'}
          rows={5}
          spellCheck={false}
          value={environment}
        />
        <p className={styles.privacy}>Your text stays in this browser.</p>
        {status ? <UiStatus>{status}</UiStatus> : null}
        <UiActionRow>
          <UiButton onPress={loadExample} type="button">Load example</UiButton>
          <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={18} /> Reset</UiButton>
          <UiButton type="submit" variant="primary">Check Compose file</UiButton>
        </UiActionRow>
      </form>

      {failed ? (
        <section className={styles.failure} ref={failureRef} role="alert" tabIndex={-1}>
          <UiStatus tone="danger">Inputs remain. Try again.</UiStatus>
          <UiButton onPress={() => submit()} type="button">Try again</UiButton>
        </section>
      ) : null}

      {result ? (
        <section aria-labelledby="compose-result-heading" className={styles.result} id="compose-result" ref={resultRef} tabIndex={-1}>
          <header className={styles.resultHeader}>
            <h2 id="compose-result-heading">{result.lead}</h2>
            {resultIsParsed(result) ? <UiResultLead>{result.completeness.status === "incomplete" ? "Checked without referenced files." : "Checked this pasted file."}</UiResultLead> : null}
          </header>
          {resultIsParsed(result) ? <ParsedResultView result={result} /> : <InvalidResultView result={result} />}
        </section>
      ) : null}
    </section>
  );
}
