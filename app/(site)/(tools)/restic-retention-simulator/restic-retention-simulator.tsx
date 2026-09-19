"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolChoiceGroup,
  ToolCopyAction,
  ToolDataTable,
  ToolDisclosure,
  ToolNumberField,
  ToolResultLead,
  ToolStatus,
  ToolTextArea,
  ToolTextField,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  DEFAULT_RESTIC_INPUT,
  formatResticResult,
  simulateResticRetention,
  type ResticGroupBy,
  type ResticInput,
  type ResticResult,
} from "@/lib/restic-retention-simulator/engine";
import styles from "./restic-retention-simulator.module.css";

const groupOptions = [toolOption("host", "Host"), toolOption("paths", "Paths"), toolOption("tags", "Tags")];
const policyKeys = ["keepLast", "keepDaily", "keepWeekly", "keepMonthly", "keepYearly"] as const;
type PolicyKey = (typeof policyKeys)[number];
type FieldErrors = Partial<Record<"snapshots" | "timezone" | PolicyKey, string>>;

function defaultJson() {
  return JSON.stringify(DEFAULT_RESTIC_INPUT.snapshots, null, 2);
}

function displayTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    hour12: false,
    timeStyle: "long",
    timeZone: timezone,
  }).format(new Date(value));
}

export function ResticRetentionSimulator() {
  const [snapshots, setSnapshots] = useState(defaultJson);
  const [policy, setPolicy] = useState(DEFAULT_RESTIC_INPUT.policy);
  const [groupBy, setGroupBy] = useState<ResticGroupBy>(DEFAULT_RESTIC_INPUT.groupBy);
  const [timezone, setTimezone] = useState(DEFAULT_RESTIC_INPUT.timezone);
  const [result, setResult] = useState<ResticResult | null>(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const resultRef = useRef<HTMLElement>(null);
  const snapshotsRef = useRef<HTMLTextAreaElement>(null);
  const timezoneRef = useRef<HTMLInputElement>(null);
  const policyRefs = useRef<Partial<Record<PolicyKey, HTMLInputElement | null>>>({});

  function clearResult() {
    setResult(null);
    setStatus("Inputs changed");
    setErrors({});
  }

  function focusError(next: FieldErrors) {
    if (next.snapshots) snapshotsRef.current?.focus();
    else {
      const policyKey = policyKeys.find((key) => next[key]);
      if (policyKey) policyRefs.current[policyKey]?.focus();
      else if (next.timezone) timezoneRef.current?.focus();
    }
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    let parsed: unknown;
    try {
      parsed = JSON.parse(snapshots);
    } catch {
      setResult(null);
      setErrors({ snapshots: "Snapshot JSON is not valid." });
      setStatus("");
      snapshotsRef.current?.focus();
      return;
    }
    const next = simulateResticRetention({ snapshots: parsed, policy, groupBy, timezone });
    setResult(next);
    if (next.status === "valid") {
      setErrors({});
      setStatus(`Kept ${next.values?.keptCount ?? 0} snapshots`);
      requestAnimationFrame(() => resultRef.current?.focus());
    } else {
      setResult(null);
      const fieldErrors: FieldErrors = {};
      for (const issue of next.issues) {
        const policyKey = policyKeys.find((key) => issue.startsWith(key));
        if (policyKey) fieldErrors[policyKey] ??= issue;
        else if (issue.startsWith("Set at least one retention")) fieldErrors.keepLast ??= issue;
        else if (/timezone/i.test(issue)) fieldErrors.timezone ??= issue;
        else fieldErrors.snapshots ??= issue;
      }
      setErrors(fieldErrors);
      setStatus("");
      requestAnimationFrame(() => focusError(fieldErrors));
    }
  }

  function loadExample() {
    setSnapshots(defaultJson());
    setPolicy(DEFAULT_RESTIC_INPUT.policy);
    setGroupBy(DEFAULT_RESTIC_INPUT.groupBy);
    setTimezone(DEFAULT_RESTIC_INPUT.timezone);
    setResult(null);
    setErrors({});
    setStatus("Example loaded");
    snapshotsRef.current?.focus();
  }

  function reset() {
    setSnapshots("");
    setPolicy({ keepLast: 1, keepDaily: 0, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 });
    setGroupBy("host");
    setTimezone("UTC");
    setResult(null);
    setErrors({});
    setStatus("Tester reset");
    snapshotsRef.current?.focus();
  }

  return (
    <section aria-label="Restic retention inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.inputs}>
          <ToolTextArea
            autoCapitalize="none"
            className={styles.editor}
            inputRef={snapshotsRef}
            error={errors.snapshots}
            label="Snapshot JSON"
            onChange={(value) => { setSnapshots(value); clearResult(); }}
            placeholder="Paste snapshot JSON"
            required
            rows={10}
            spellCheck={false}
            value={snapshots}
          />
          <div className={styles.settings}>
            <ToolChoiceGroup
              label="Group snapshots by"
              onChange={(value) => { setGroupBy(value as ResticGroupBy); clearResult(); }}
              options={groupOptions}
              value={groupBy}
            />
            <div className={styles.policyGrid}>
              {policyKeys.map((key) => (
                <ToolNumberField
                  key={key}
                  error={errors[key]}
                  inputRef={(node) => { policyRefs.current[key] = node; }}
                  label={key.replace("keep", "Keep ")}
                  max={365}
                  min={0}
                  onChange={(value) => { setPolicy((current) => ({ ...current, [key]: value })); clearResult(); }}
                  value={policy[key]}
                />
              ))}
            </div>
            <ToolTextField
              error={errors.timezone}
              inputRef={timezoneRef}
              label="Timezone"
              onChange={(value) => { setTimezone(value); clearResult(); }}
              value={timezone}
            />
          </div>
        </div>
        <ToolActionRow>
          <ToolButton onPress={loadExample} type="button">Load example</ToolButton>
          <ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</ToolButton>
          <ToolButton type="submit" variant="primary">Preview retention</ToolButton>
        </ToolActionRow>
        {status ? <ToolStatus>{status}</ToolStatus> : null}
      </form>

      {result?.status === "valid" && result.values ? (
        <section aria-label="Retention result" className={styles.result} ref={resultRef} tabIndex={-1}>
          <div className={styles.resultHeader}>
            <div>
              <ToolResultLead>{`Kept ${result.values.keptCount} of ${result.values.rows.length} snapshots.`}</ToolResultLead>
              <p className={styles.meta}>{`${result.values.groups} group${result.values.groups === 1 ? "" : "s"}; ${result.values.timezone}${result.values.timezoneWarning ? `; ${result.values.timezoneWarning}` : ""}`}</p>
            </div>
            <ToolCopyAction label="Copy trace" successLabel="Trace copied" value={formatResticResult(result)} />
          </div>
          <ToolDataTable
            ariaLabel="Snapshot retention decisions"
            columns={[{ id: "id", label: "Snapshot" }, { id: "time", label: "Time" }, { id: "state", label: "State" }, { id: "group", label: "Group" }, { id: "reason", label: "Reasons" }]}
            rows={result.values.rows.map((row) => ({
              id: row.id,
              cells: { id: <code>{row.id}</code>, time: <time dateTime={row.time}>{displayTime(row.time, result.values?.timezone ?? "UTC")}</time>, state: <strong className={row.state === "kept" ? styles.kept : styles.pruned}>{row.state}</strong>, group: row.group, reason: row.reasons.join(", ") },
            }))}
          />
          <ToolDisclosure label="Assumptions">
            <p className={styles.note}>Supplied metadata; selected timezone.</p>
            <p className={styles.note}>No repository access or changes.</p>
          </ToolDisclosure>
        </section>
      ) : null}
    </section>
  );
}
