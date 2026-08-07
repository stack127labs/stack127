"use client";

import { Copy, RotateCcw } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import {
  buildDockerignoreCopySummary,
  evaluateDockerignore,
  type DockerignoreSourceMode,
  type DockerignoreValidResult,
} from "@/lib/dockerignore/evaluate.ts";
import styles from "./dockerignore-tester.module.css";

const exampleRules = "docs\n!docs/README.md";
const examplePaths = "docs/README.md\ndocs/guide\nsrc";

function answerFor(result: DockerignoreValidResult) {
  const noun = result.counts.total === 1 ? "path line" : "path lines";
  return `${result.counts.total} ${noun}: ${result.counts.excluded} Excluded, ${result.counts.included} Included.`;
}

function removeStateParameter() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("state")) return false;
  url.searchParams.delete("state");
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}

function diagnosticStatus(active: boolean, reason: string | null) {
  if (active) return "Active";
  if (reason === "comment") return "Comment";
  if (reason === "historical-dot") return "Historical dot";
  return "Blank";
}

export function DockerignoreTester() {
  const [rules, setRules] = useState("");
  const [paths, setPaths] = useState("");
  const [sourceMode, setSourceMode] = useState<DockerignoreSourceMode>("root");
  const [result, setResult] = useState<DockerignoreValidResult | null>(null);
  const [errors, setErrors] = useState<{ rules?: string; paths?: string }>({});
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const rulesRef = useRef<HTMLTextAreaElement>(null);
  const pathsRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (removeStateParameter()) {
      setNotice("Shared inputs are not supported");
      setStatus("Shared inputs are not supported");
    }
  }, []);

  const clearResult = () => {
    setResult(null);
    setFailed(false);
    setStatus("Inputs changed");
    removeStateParameter();
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    setErrors({});
    setNotice("");
    try {
      const next = evaluateDockerignore({ rules, paths, sourceMode });
      if (next.status === "invalid") {
        setResult(null);
        setFailed(false);
        setErrors({ [next.field]: next.message });
        setStatus("Fix the highlighted input");
        if (next.field === "rules") rulesRef.current?.focus();
        else pathsRef.current?.focus();
        return;
      }
      setResult(next);
      setFailed(false);
      setStatus(answerFor(next));
      requestAnimationFrame(() => answerRef.current?.focus());
    } catch {
      setResult(null);
      setFailed(true);
      setStatus("Matcher failed");
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  };

  const loadExample = () => {
    setRules(exampleRules);
    setPaths(examplePaths);
    setErrors({});
    setResult(null);
    setFailed(false);
    setNotice("");
    setStatus("Example loaded");
    removeStateParameter();
    rulesRef.current?.focus();
  };

  const reset = () => {
    setRules("");
    setPaths("");
    setSourceMode("root");
    setErrors({});
    setResult(null);
    setFailed(false);
    setNotice("");
    setStatus("Tester reset");
    removeStateParameter();
    rulesRef.current?.focus();
  };

  const copyResults = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildDockerignoreCopySummary(result));
      setStatus("Results copied");
    } catch {
      setStatus("Copy failed");
    }
  };

  return (
    <section aria-label=".dockerignore tester inputs and results" className={styles.tool}>
      <form className={styles.form} onSubmit={submit}>
        <fieldset className={styles.sourceFieldset}>
          <legend>Effective file</legend>
          <div className={styles.choiceRow}>
            <label className={styles.choice}>
              <input
                checked={sourceMode === "root"}
                name="source-mode"
                onChange={() => {
                  setSourceMode("root");
                  clearResult();
                }}
                type="radio"
              />
              <span>Root .dockerignore</span>
            </label>
            <label className={styles.choice}>
              <input
                checked={sourceMode === "dockerfile-specific"}
                name="source-mode"
                onChange={() => {
                  setSourceMode("dockerfile-specific");
                  clearResult();
                }}
                type="radio"
              />
              <span>Dockerfile-specific</span>
            </label>
          </div>
          <p className={styles.sourceNote}>
            {sourceMode === "root" ? "Tests the root file." : "This file replaces the root file."}
          </p>
        </fieldset>

        <div className={styles.editors}>
          <label className={styles.editor}>
            <span>.dockerignore rules</span>
            <textarea
              aria-describedby={errors.rules ? "dockerignore-rules-error" : undefined}
              aria-invalid={Boolean(errors.rules)}
              autoCapitalize="none"
              onChange={(event) => {
                setRules(event.target.value);
                setErrors((current) => ({ ...current, rules: undefined }));
                clearResult();
              }}
              placeholder={"node_modules\n*.log"}
              ref={rulesRef}
              spellCheck={false}
              value={rules}
            />
            {errors.rules ? <span className={styles.error} id="dockerignore-rules-error">{errors.rules}</span> : null}
          </label>
          <label className={styles.editor}>
            <span>Context-relative paths</span>
            <textarea
              aria-describedby={errors.paths ? "dockerignore-paths-error" : undefined}
              aria-invalid={Boolean(errors.paths)}
              autoCapitalize="none"
              onChange={(event) => {
                setPaths(event.target.value);
                setErrors((current) => ({ ...current, paths: undefined }));
                clearResult();
              }}
              placeholder={"src/index.ts\ndebug.log"}
              ref={pathsRef}
              spellCheck={false}
              value={paths}
            />
            {errors.paths ? <span className={styles.error} id="dockerignore-paths-error">{errors.paths}</span> : null}
          </label>
        </div>

        <p className={styles.privacy}>Rules and paths stay in your browser.</p>
        <p className={styles.verdictNote}>Final rules decide Included or Excluded.</p>
        {notice ? <p className={styles.notice}>{notice}</p> : null}
        <div className={styles.formActions}>
          <button className={styles.secondaryButton} onClick={loadExample} type="button">Load example</button>
          <button className={styles.secondaryButton} onClick={reset} type="button">
            <RotateCcw aria-hidden="true" size={18} /> Reset
          </button>
          <button className={styles.primaryButton} type="submit">Test patterns</button>
        </div>
      </form>

      {failed ? (
        <section className={styles.failure} role="alert">
          <h2 ref={failureRef} tabIndex={-1}>Matcher failed</h2>
          <button className={styles.secondaryButton} onClick={() => submit()} type="button">Try again</button>
        </section>
      ) : null}

      {result ? (
        <section className={styles.result}>
          <header className={styles.resultHeader}>
            <div>
              <h2 ref={answerRef} tabIndex={-1}>{answerFor(result)}</h2>
              <p className={styles.counts}>Excluded {result.counts.excluded} · Included {result.counts.included}</p>
            </div>
            <button className={styles.secondaryButton} onClick={copyResults} type="button">
              <Copy aria-hidden="true" size={18} /> Copy results
            </button>
          </header>

          <table className={styles.resultTable}>
            <thead>
              <tr><th>Path</th><th>Verdict</th><th>Deciding rule</th></tr>
            </thead>
            <tbody>
              {result.rows.map((row, index) => (
                <Fragment key={`${row.sourceLine}-${index}`}>
                  <tr>
                    <td data-label="Path">
                      <code>{row.rawPath}</code>
                      {row.rawPath === row.normalizedPath ? null : <span className={styles.normalized}>{row.normalizedPath}</span>}
                    </td>
                    <td data-label="Verdict"><strong className={row.ignored ? styles.excluded : styles.included}>{row.verdict}</strong></td>
                    <td data-label="Deciding rule">
                      {row.decidingLine === null ? "No rule matched" : <><span>line {row.decidingLine}</span> <code>{row.decidingRule}</code></>}
                      {row.builderControlFile ? <span className={styles.limitation}>Builder control behavior differs.</span> : null}
                    </td>
                  </tr>
                  <tr className={styles.traceRow}>
                    <td colSpan={3} data-label="Details">
                    <details className={styles.trace}>
                      <summary>Show trace</summary>
                      <table>
                        <thead><tr><th>Line</th><th>Rule</th><th>Match</th><th>State</th></tr></thead>
                        <tbody>
                          {row.trace.map((entry) => (
                            <tr key={entry.sourceLine}>
                              <td data-label="Line">{entry.sourceLine}</td>
                              <td data-label="Rule"><code>{entry.normalized}</code></td>
                              <td data-label="Match">{entry.matchSource === "self" ? "Direct" : entry.matchSource === "parent" ? "Parent" : entry.eligible ? "No" : "Skipped"}</td>
                              <td data-label="State">{entry.ignoredAfter ? "Excluded" : "Included"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>

          <details className={styles.diagnostics}>
            <summary>Rule diagnostics</summary>
            <table>
              <thead><tr><th>Line</th><th>Source</th><th>Normalized</th><th>Status</th></tr></thead>
              <tbody>
                {result.diagnostics.map((line) => (
                  <tr key={line.sourceLine}>
                    <td data-label="Line">{line.sourceLine}</td>
                    <td data-label="Source"><code>{line.raw || "Blank"}</code></td>
                    <td data-label="Normalized"><code>{line.normalized || "Blank"}</code></td>
                    <td data-label="Status">{diagnosticStatus(line.active, line.reason)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <p className={styles.provenance}>Moby {result.version} · Linux slash · {result.commit}</p>
        </section>
      ) : null}
      <p aria-live="polite" className={styles.srOnly}>{status}</p>
    </section>
  );
}
