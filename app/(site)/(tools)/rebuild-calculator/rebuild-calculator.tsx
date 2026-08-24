"use client";

import { useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import {
  CAPACITY_UNITS,
  calculateRebuildExposure,
  DEFAULT_INPUT,
  normalizeRebuildInput,
  RAID_LEVELS,
  type RebuildField,
  type RebuildExposureResult,
} from "@/lib/rebuild-calculator/engine";
import styles from "./rebuild-calculator.module.css";

type InputState = typeof DEFAULT_INPUT;
type ErrorState = Partial<Record<RebuildField, string>>;

const RAID_LABELS = {
  raid1: "RAID 1",
  raid5: "RAID 5",
  raid6: "RAID 6",
  raid10: "RAID 10",
} as const;

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 1,
  }).format(value);
}

function formatBytes(bytes: number) {
  const units = [
    [1e15, "PB"],
    [1e12, "TB"],
    [1e9, "GB"],
  ] as const;
  const [divisor, unit] = units.find(([size]) => Math.abs(bytes) >= size) ?? [1, "B"];
  const value = bytes / divisor;
  return `${formatNumber(value, value >= 100 ? 1 : 2)} ${unit}`;
}

function formatExactBytes(bytes: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(bytes)} bytes`;
}

function formatDuration(seconds: number) {
  const hours = seconds / 3600;
  if (hours < 48) {
    const precision = Number.isInteger(hours) ? 0 : 1;
    return `${formatNumber(hours, precision)} hours`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours - days * 24);
  if (remainingHours === 24) return `${days + 1} days`;
  return remainingHours > 0 ? `${days} days ${remainingHours} hours` : `${days} days`;
}

function formatPercentage(probability: number) {
  if (probability === 0) return "0%";
  const percentage = probability * 100;
  if (percentage < 0.01) return "less than 0.01%";
  return `${formatNumber(percentage, percentage < 10 ? 2 : 1)}%`;
}

function formatPercentageForLabel(probability: number) {
  return formatPercentage(probability).replace("%", " percent");
}

function fieldId(field: RebuildField) {
  return `rebuild-${field}`;
}

function fieldErrorId(field: RebuildField) {
  return `${fieldId(field)}-error`;
}

function resultOrNull(value: RebuildExposureResult): Extract<RebuildExposureResult, { status: "success" }> | null {
  return value.status === "success" ? value : null;
}

function durationLabel(seconds: number) {
  return formatDuration(seconds);
}

function InputField({
  field,
  label,
  value,
  error,
  type = "text",
  suffix,
  onChange,
  inputRef,
}: {
  field: RebuildField;
  label: string;
  value: string;
  error?: string;
  type?: "text" | "number";
  suffix?: string;
  onChange: (value: string) => void;
  inputRef?: (element: HTMLInputElement | null) => void;
}) {
  const id = fieldId(field);
  const errorId = fieldErrorId(field);
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <span className={styles.inputRow}>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? "true" : undefined}
          id={id}
          inputMode={type === "number" ? "decimal" : undefined}
          onChange={(event) => onChange(event.target.value)}
          ref={inputRef}
          type={type}
          value={value}
        />
        {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
      </span>
      {error ? <span className={styles.error} id={errorId} role="alert">{error}</span> : null}
    </label>
  );
}

function Result({
  result,
  resultHeadingRef,
}: {
  result: Extract<RebuildExposureResult, { status: "success" }>;
  resultHeadingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const copyShare = result.copySeconds / result.degradedSeconds * 100;
  const delayShare = result.replacementDelaySeconds / result.degradedSeconds * 100;
  const exposureWidth = Math.max(0, Math.min(100, result.readErrorProbability * 100));
  return (
    <section className={styles.result} aria-labelledby="rebuild-result-title">
      <h2 id="rebuild-result-title" ref={resultHeadingRef} tabIndex={-1} aria-live="polite">
        Total degraded window
      </h2>
      <p className={styles.resultHeadline}>{durationLabel(result.degradedSeconds)}</p>

      <dl className={styles.metrics}>
        <div>
          <dt>Rebuild copy time</dt>
          <dd>{durationLabel(result.copySeconds)}</dd>
        </div>
        <div>
          <dt>Source media read</dt>
          <dd>{formatBytes(result.readBytes)}</dd>
        </div>
        <div>
          <dt>Modeled read-error exposure</dt>
          <dd>{formatPercentage(result.readErrorProbability)}</dd>
        </div>
        <div>
          <dt>Additional read errors tolerated</dt>
          <dd>{result.readErrorTolerance}</dd>
        </div>
      </dl>

      <div className={styles.visualGroup}>
        <div className={styles.visualHeading}>
          <h3>Degraded window</h3>
          <span>{durationLabel(result.replacementDelaySeconds)} before rebuild</span>
        </div>
        <div className={styles.durationBar} role="img" aria-label={`${durationLabel(result.replacementDelaySeconds)} delay; ${durationLabel(result.copySeconds)} copy`}>
          {delayShare > 0 ? <span className={styles.delaySegment} style={{ width: `${delayShare}%` }} /> : null}
          <span className={styles.copySegment} style={{ width: `${copyShare}%` }} />
        </div>
        <div className={styles.legend}>
          <span><i className={styles.delayKey} />Replacement delay</span>
          <span><i className={styles.copyKey} />Rebuild copy</span>
        </div>
      </div>

      <div className={styles.visualGroup}>
        <div className={styles.visualHeading}>
          <h3>Read-error exposure</h3>
          <span>{formatBytes(result.readBytes)} read</span>
        </div>
        <div
          aria-label={`${formatPercentageForLabel(result.readErrorProbability)} modeled read-error exposure`}
          className={styles.exposureBar}
          role="img"
        >
          <span style={{ width: `${exposureWidth}%` }} />
        </div>
        <div className={styles.exposureLabels}>
          <span>0%</span>
          <strong>{formatPercentage(result.readErrorProbability)}</strong>
          <span>100%</span>
        </div>
      </div>

      <div className={styles.trace}>
        <p>Source-drive equivalents: <strong>{result.sourceDriveEquivalents}</strong></p>
        <p>Formula: <code>{result.formulaVersion}</code></p>
      </div>

      <details className={styles.modelDetails}>
        <summary role="button">How this model works</summary>
        <div className={styles.modelCopy}>
          {result.input.raidLevel === "raid6" ? <p>RAID 6 uses minimum source reads.</p> : <p>Source reads follow the RAID model.</p>}
          <p>Real implementations may read more.</p>
          <p>Modeled exposure is not data loss.</p>
        </div>
        <table className={styles.detailsTable}>
          <caption>Calculation details</caption>
          <tbody>
            <tr><th scope="row">Layout</th><td>{RAID_LABELS[result.input.raidLevel]}</td></tr>
            <tr><th scope="row">Member capacity</th><td>{formatBytes(result.memberBytes)}</td></tr>
            <tr><th scope="row">Exact source read</th><td>{formatExactBytes(result.readBytes)}</td></tr>
            <tr><th scope="row">URE denominator</th><td>1 error per 10^{result.input.ureExponent} bits</td></tr>
            <tr><th scope="row">Read scope</th><td>{formatNumber(result.input.memberReadScope, 1)}%</td></tr>
          </tbody>
        </table>
      </details>
    </section>
  );
}

export function RebuildCalculator() {
  const [input, setInput] = useState<InputState>(() => ({ ...DEFAULT_INPUT }));
  const [result, setResult] = useState(() => resultOrNull(calculateRebuildExposure(DEFAULT_INPUT)));
  const [errors, setErrors] = useState<ErrorState>({});
  const [announcement, setAnnouncement] = useState("");
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Partial<Record<RebuildField, HTMLInputElement | HTMLSelectElement | null>>>({});

  function updateField(field: RebuildField, value: string) {
    const next = { ...input, [field]: value } as InputState;
    setInput(next);
    const validation = normalizeRebuildInput(next);
    setErrors(validation.status === "invalid" ? validation.errors : {});
    setResult(null);
    setAnnouncement("");
  }

  function calculate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const calculation = calculateRebuildExposure(input);
    if (calculation.status === "invalid") {
      setErrors(calculation.errors);
      setResult(null);
      setAnnouncement("Fix the marked inputs.");
      requestAnimationFrame(() => fieldRefs.current[calculation.firstInvalidField]?.focus());
      return;
    }
    setErrors({});
    setResult(calculation);
    setAnnouncement("Calculation updated.");
    requestAnimationFrame(() => resultHeadingRef.current?.focus());
  }

  function reset() {
    const defaults = { ...DEFAULT_INPUT };
    setInput(defaults);
    setErrors({});
    setResult(resultOrNull(calculateRebuildExposure(defaults)));
    setAnnouncement("Defaults restored.");
    requestAnimationFrame(() => firstInputRef.current?.focus());
  }

  return (
    <section aria-label="rebuild exposure calculator" className={styles.tool}>
      <form className={styles.form} onSubmit={calculate} noValidate>
        <fieldset className={styles.choiceFieldset} aria-label="RAID level">
          <legend>RAID level</legend>
          <div className={styles.choiceRow}>
            {RAID_LEVELS.map((level, index) => (
              <label className={styles.choice} key={level}>
                <input
                  checked={input.raidLevel === level}
                  name="raid-level"
                  onChange={() => updateField("raidLevel", level)}
                  ref={(element) => {
                    if (index === 0) firstInputRef.current = element;
                    fieldRefs.current.raidLevel = element;
                  }}
                  type="radio"
                  value={level}
                />
                <span>{RAID_LABELS[level]}</span>
              </label>
            ))}
          </div>
          {errors.raidLevel ? <span className={styles.error} id={fieldErrorId("raidLevel")} role="alert">{errors.raidLevel}</span> : null}
        </fieldset>

        <div className={styles.fields}>
          <InputField field="driveCount" label="Drive count" value={input.driveCount} error={errors.driveCount} inputRef={(element) => { fieldRefs.current.driveCount = element; }} onChange={(value) => updateField("driveCount", value)} />
          <InputField field="driveCapacity" label="Drive capacity" value={input.driveCapacity} error={errors.driveCapacity} suffix={input.capacityUnit} inputRef={(element) => { fieldRefs.current.driveCapacity = element; }} onChange={(value) => updateField("driveCapacity", value)} />
          <label className={styles.field} htmlFor={fieldId("capacityUnit")}>
            <span>Capacity unit</span>
            <select
              aria-describedby={errors.capacityUnit ? fieldErrorId("capacityUnit") : undefined}
              aria-invalid={errors.capacityUnit ? "true" : undefined}
              id={fieldId("capacityUnit")}
              onChange={(event) => updateField("capacityUnit", event.target.value)}
              ref={(element) => { fieldRefs.current.capacityUnit = element; }}
              value={input.capacityUnit}
            >
              {CAPACITY_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
            {errors.capacityUnit ? <span className={styles.error} id={fieldErrorId("capacityUnit")} role="alert">{errors.capacityUnit}</span> : null}
          </label>
          <InputField field="rebuildThroughput" label="Rebuild throughput" value={input.rebuildThroughput} error={errors.rebuildThroughput} suffix="MB/s" inputRef={(element) => { fieldRefs.current.rebuildThroughput = element; }} onChange={(value) => updateField("rebuildThroughput", value)} />
          <InputField field="memberReadScope" label="Member read scope" value={input.memberReadScope} error={errors.memberReadScope} suffix="%" inputRef={(element) => { fieldRefs.current.memberReadScope = element; }} onChange={(value) => updateField("memberReadScope", value)} />
          <label className={styles.field} htmlFor={fieldId("ureExponent")}>
            <span>URE specification</span>
            <select
              aria-describedby={errors.ureExponent ? fieldErrorId("ureExponent") : undefined}
              aria-invalid={errors.ureExponent ? "true" : undefined}
              id={fieldId("ureExponent")}
              onChange={(event) => updateField("ureExponent", event.target.value)}
              ref={(element) => { fieldRefs.current.ureExponent = element; }}
              value={input.ureExponent}
            >
              { [14, 15, 16].map((exponent) => <option key={exponent} value={exponent}>1 error per 10^{exponent} bits</option>)}
            </select>
            {errors.ureExponent ? <span className={styles.error} id={fieldErrorId("ureExponent")} role="alert">{errors.ureExponent}</span> : null}
          </label>
          <InputField field="replacementDelay" label="Replacement delay" value={input.replacementDelay} error={errors.replacementDelay} suffix="hours" inputRef={(element) => { fieldRefs.current.replacementDelay = element; }} onChange={(value) => updateField("replacementDelay", value)} />
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} type="submit">Calculate</button>
          <button className={styles.secondaryButton} onClick={reset} type="button">Reset</button>
        </div>
        <p className={styles.visuallyHidden} aria-live="polite">{announcement}</p>
      </form>

      {result ? <Result result={result} resultHeadingRef={resultHeadingRef} /> : (
        <section className={styles.failure} aria-live="polite">
          <h2>{Object.keys(errors).length > 0 ? "Fix the marked inputs" : "Ready to calculate"}</h2>
          <p>{Object.keys(errors).length > 0 ? "No result until inputs are valid." : "Enter values and calculate."}</p>
        </section>
      )}
    </section>
  );
}
