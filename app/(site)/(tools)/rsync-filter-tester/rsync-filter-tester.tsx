"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolChoiceGroup,
  ToolCopyAction,
  ToolDataTable,
  ToolResultLead,
  ToolStatus,
  ToolTextArea,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  DEFAULT_RSYNC_INPUT,
  formatRsyncResult,
  testRsyncFilters,
  type RsyncDefault,
  type RsyncResult,
} from "@/lib/rsync-filter-tester/engine";
import styles from "./rsync-filter-tester.module.css";

export function RsyncFilterTester() {
  const [rules, setRules] = useState("");
  const [paths, setPaths] = useState("");
  const [unmatched, setUnmatched] = useState<RsyncDefault>(DEFAULT_RSYNC_INPUT.unmatched);
  const [result, setResult] = useState<RsyncResult | null>(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<{ rules?: string; paths?: string }>({});
  const resultRef = useRef<HTMLElement>(null);
  const rulesRef = useRef<HTMLTextAreaElement>(null);
  const pathsRef = useRef<HTMLTextAreaElement>(null);

  function clearResult() { setResult(null); setStatus("Inputs changed"); setErrors({}); }

  function focusError(next = errors) {
    if (next.rules) rulesRef.current?.focus();
    else if (next.paths) pathsRef.current?.focus();
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const next = testRsyncFilters({ rules, paths, unmatched });
    setResult(next);
    if (next.status === "valid") {
      setErrors({});
      setStatus(`Included ${next.values?.includedCount ?? 0} paths`);
      requestAnimationFrame(() => resultRef.current?.focus());
    } else {
      setResult(null);
      const fieldErrors: { rules?: string; paths?: string } = {};
      for (const issue of next.issues) {
        if (/^(Rule|Add at least one filter|Use 1000 filter)/.test(issue)) fieldErrors.rules ??= issue;
        else fieldErrors.paths ??= issue;
      }
      setErrors(fieldErrors);
      setStatus("");
      requestAnimationFrame(() => focusError(fieldErrors));
    }
  }

  function loadExample() {
    setRules(DEFAULT_RSYNC_INPUT.rules);
    setPaths(DEFAULT_RSYNC_INPUT.paths);
    setUnmatched(DEFAULT_RSYNC_INPUT.unmatched);
    setResult(null);
    setErrors({});
    setStatus("Example loaded");
    rulesRef.current?.focus();
  }

  function reset() {
    setRules("");
    setPaths("");
    setUnmatched("include");
    setResult(null);
    setErrors({});
    setStatus("Tester reset");
    rulesRef.current?.focus();
  }

  return (
    <section aria-label="Rsync filter inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.inputs}>
          <ToolTextArea
            autoCapitalize="none"
            className={styles.editor}
            inputRef={rulesRef}
            error={errors.rules}
            label="Filter rules"
            onChange={(value) => { setRules(value); clearResult(); }}
            placeholder="- *.tmp\n+ keep.tmp"
            required
            rows={9}
            spellCheck={false}
            value={rules}
          />
          <ToolTextArea
            autoCapitalize="none"
            className={styles.editor}
            error={errors.paths}
            inputRef={pathsRef}
            label="Representative paths"
            onChange={(value) => { setPaths(value); clearResult(); }}
            placeholder="src/index.ts\nlogs/app.tmp"
            required
            rows={9}
            spellCheck={false}
            value={paths}
          />
        </div>
        <ToolChoiceGroup
          label="Unmatched paths"
          onChange={(value) => { setUnmatched(value as RsyncDefault); clearResult(); }}
          options={[toolOption("include", "Include"), toolOption("exclude", "Exclude")]}
          value={unmatched}
        />
        <ToolActionRow>
          <ToolButton onPress={loadExample} type="button">Load example</ToolButton>
          <ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</ToolButton>
          <ToolButton type="submit" variant="primary">Test filters</ToolButton>
        </ToolActionRow>
        {status ? <ToolStatus>{status}</ToolStatus> : null}
      </form>

      {result?.status === "valid" && result.values ? (
        <section aria-label="Rsync filter result" className={styles.result} ref={resultRef} tabIndex={-1}>
          <div className={styles.resultHeader}>
            <div>
              <ToolResultLead>{`Included ${result.values.includedCount}, excluded ${result.values.excludedCount}, unvisited ${result.values.unvisitedCount}.`}</ToolResultLead>
              <p className={styles.meta}>First matching rule decides.</p>
            </div>
            <ToolCopyAction label="Copy report" successLabel="Report copied" value={formatRsyncResult(result)} />
          </div>
          <ToolDataTable
            ariaLabel="Rsync path decisions"
            columns={[{ id: "path", label: "Path" }, { id: "state", label: "State" }, { id: "rule", label: "Winning rule" }, { id: "note", label: "Note" }]}
            rows={result.values.rows.map((row) => ({
              id: row.path,
              cells: { path: <code>{row.path}</code>, state: <strong className={styles[row.state]}>{row.state}</strong>, rule: row.matchingRule ? `line ${row.matchingRule.line}: ${row.matchingRule.pattern}` : "Default", note: row.note },
            }))}
          />
        </section>
      ) : null}
    </section>
  );
}
