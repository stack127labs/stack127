"use client";

import { RotateCcw } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiChoiceGroup, UiCopyAction, UiDisclosure, UiTextArea, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiResultLead, UiStatus } from "@/app/ui/display";
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
  const answerRef = useRef<HTMLElement>(null);
  const failureRef = useRef<HTMLElement>(null);

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

  return (
    <section aria-label=".dockerignore tester inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.sourceFieldset}>
          <UiChoiceGroup
            label="Effective file"
            onChange={(next) => {
              setSourceMode(next as DockerignoreSourceMode);
              clearResult();
            }}
            options={[uiOption("root", "Root .dockerignore"), uiOption("dockerfile-specific", "Dockerfile-specific")]}
            value={sourceMode}
          />
          <p className={styles.sourceNote}>
            {sourceMode === "root" ? "Tests the root file." : "This file replaces the root file."}
          </p>
        </div>

        <div className={styles.editors}>
          <UiTextArea
              className={styles.editor}
              error={errors.rules}
              autoCapitalize="none"
              inputRef={rulesRef}
              label=".dockerignore rules"
              onChange={(next) => {
                setRules(next);
                setErrors((current) => ({ ...current, rules: undefined }));
                clearResult();
              }}
              placeholder={"node_modules\n*.log"}
              rows={8}
              spellCheck={false}
              value={rules}
          />
          <UiTextArea
              className={styles.editor}
              error={errors.paths}
              autoCapitalize="none"
              inputRef={pathsRef}
              label="Context-relative paths"
              onChange={(next) => {
                setPaths(next);
                setErrors((current) => ({ ...current, paths: undefined }));
                clearResult();
              }}
              placeholder={"src/index.ts\ndebug.log"}
              required
              rows={8}
              spellCheck={false}
              value={paths}
          />
        </div>

        <p className={styles.privacy}>Rules and paths stay in your browser.</p>
        <p className={styles.verdictNote}>Final rules decide Included or Excluded.</p>
        {notice ? <UiStatus>{notice}</UiStatus> : null}
        <UiActionRow>
          <UiButton onPress={loadExample} type="button">Load example</UiButton>
          <UiButton onPress={reset} type="button">
            <RotateCcw aria-hidden="true" size={18} /> Reset
          </UiButton>
          <UiButton type="submit" variant="primary">Test patterns</UiButton>
        </UiActionRow>
      </form>

      {failed ? (
        <section className={styles.failure} ref={failureRef} role="alert" tabIndex={-1}>
          <UiStatus tone="danger">The matcher could not finish. Your inputs are still here.</UiStatus>
          <UiButton onPress={() => submit()} type="button">Try again</UiButton>
        </section>
      ) : null}

      {result ? (
        <section className={styles.result} ref={answerRef} tabIndex={-1}>
          <header className={styles.resultHeader}>
            <UiResultLead>{answerFor(result)}</UiResultLead>
            <UiCopyAction label="Copy results" successLabel="Results copied" value={buildDockerignoreCopySummary(result)} />
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
                    {row.trace.length ? <div className={styles.trace}><UiDisclosure label={`Show trace for ${row.rawPath}`}>
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
                    </UiDisclosure></div> : null}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>

          <div className={styles.diagnostics}><UiDisclosure label="Rule diagnostics">
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
          </UiDisclosure></div>
          <p className={styles.provenance}>Moby {result.version} · Linux slash · {result.commit}</p>
        </section>
      ) : null}
      <p aria-live="polite" className={styles.srOnly}>{status}</p>
    </section>
  );
}
