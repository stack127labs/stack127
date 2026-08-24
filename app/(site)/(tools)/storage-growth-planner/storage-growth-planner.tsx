"use client";

import { Copy, RotateCcw, Share2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  DEFAULT_STORAGE_GROWTH_INPUT,
  buildStorageGrowthCopySummary,
  calculateStorageGrowthPlan,
  capacityNumber,
  decodeStorageGrowthState,
  encodeStorageGrowthState,
  formatCapacity,
  formatMoney,
  type StorageGrowthCalculationResult,
  type StorageGrowthCurrency,
  type StorageGrowthDisplayUnit,
  type StorageGrowthInput,
  type StorageGrowthIssue,
  type StorageGrowthLayout,
  type StorageGrowthValues,
} from "./storage-growth-planner-engine";
import styles from "./storage-growth-planner.module.css";

type Calculated = { values: StorageGrowthValues };
type FieldKey = keyof StorageGrowthInput;

const errorOrder: FieldKey[] = [
  "currentData", "annualGrowth", "horizonYears", "reserve", "layout", "driveCount", "driveSize",
  "drivePrice", "enclosureCost", "averagePowerWatts", "hoursPerDay", "electricityRate",
  "replacementReserve", "backupAnnualBudget", "currency", "displayUnit",
];

function defaults(): StorageGrowthInput {
  return { ...DEFAULT_STORAGE_GROWTH_INPUT };
}

function issueMap(issues: StorageGrowthIssue[]) {
  return Object.fromEntries(issues.map((issue) => [issue.field, issue.message]));
}

function signedCapacity(bytes: bigint, unit: StorageGrowthDisplayUnit) {
  return bytes < 0n ? `-${formatCapacity(-bytes, unit)}` : formatCapacity(bytes, unit);
}

function chartPoints(values: bigint[], planningCapacityBytes: bigint, unit: StorageGrowthDisplayUnit) {
  const width = 720;
  const height = 250;
  const left = 48;
  const right = 12;
  const top = 20;
  const bottom = 36;
  const max = Math.max(1, capacityNumber(planningCapacityBytes, unit), ...values.map((value) => capacityNumber(value, unit)));
  const x = (index: number) => left + (index * (width - left - right)) / Math.max(1, values.length - 1);
  const y = (value: number) => height - bottom - (value / max) * (height - top - bottom);
  return {
    width,
    height,
    x,
    y,
    demand: values.map((value, index) => `${x(index)},${y(capacityNumber(value, unit))}`).join(" "),
    capacity: `${x(0)},${y(capacityNumber(planningCapacityBytes, unit))} ${x(values.length - 1)},${y(capacityNumber(planningCapacityBytes, unit))}`,
  };
}

function GrowthChart({ values, unit }: { values: StorageGrowthValues; unit: StorageGrowthDisplayUnit }) {
  const chart = chartPoints(values.demandBytes, values.planningCapacityBytes, unit);
  return (
    <div className={styles.chartFrame}>
      <svg className={styles.chart} role="img" aria-labelledby="growth-chart-title growth-chart-description" viewBox={`0 0 ${chart.width} ${chart.height}`}>
        <title id="growth-chart-title">Projected demand and planning capacity</title>
        <desc id="growth-chart-description">Demand versus capacity after reserve.</desc>
        <line className={styles.chartAxis} x1="48" x2="48" y1="20" y2="214" />
        <line className={styles.chartAxis} x1="48" x2="708" y1="214" y2="214" />
        <polyline className={styles.capacityLine} fill="none" points={chart.capacity} />
        <polyline className={styles.demandLine} fill="none" points={chart.demand} />
        {values.demandBytes.map((value, index) => (
          <g key={index}>
            <circle className={styles.demandDot} cx={chart.x(index)} cy={chart.y(capacityNumber(value, unit))} r="4" />
            <text className={styles.chartLabel} x={chart.x(index)} y="235" textAnchor="middle">{index}</text>
          </g>
        ))}
      </svg>
      <div className={styles.legend} aria-label="Chart legend">
        <span><i className={styles.legendDemand} />Projected demand</span>
        <span><i className={styles.legendCapacity} />Capacity after reserve</span>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  inputMode = "decimal",
  suffix,
  min,
  max,
  inputRef,
}: {
  id: FieldKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputMode?: "decimal" | "numeric";
  suffix?: string;
  min?: string;
  max?: string;
  inputRef: (node: HTMLElement | null) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <span className={styles.inputWithSuffix}>
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="text"
          inputMode={inputMode}
          value={value}
          min={min}
          max={max}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? <i>{suffix}</i> : null}
      </span>
      {error ? <small className={styles.error} id={errorId}>{error}</small> : null}
    </label>
  );
}

function Result({ values, input, onDisplayUnitChange, onCopy, onShare, status, shareUrl, headingRef }: {
  values: StorageGrowthValues;
  input: StorageGrowthInput;
  onDisplayUnitChange: (unit: StorageGrowthDisplayUnit) => void;
  onCopy: () => void;
  onShare: () => void;
  status: string;
  shareUrl: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const unit = input.displayUnit;
  const horizonIndex = values.demandBytes.length - 1;
  const horizonDemand = values.demandBytes[horizonIndex] ?? 0n;
  const verdict = values.shortfallYear === null
    ? `Your plan clears ${input.horizonYears} years.`
    : `Your plan reaches reserve in year ${values.shortfallYear}.`;
  return (
    <section className={styles.result} aria-labelledby="storage-growth-result-heading">
      <div className={styles.answerTop}>
        <div>
          <h2 id="storage-growth-result-heading" ref={headingRef} tabIndex={-1}>Your plan</h2>
          <p className={styles.verdict}>{verdict}</p>
          <p className={styles.answerDetail}>
            Year {horizonIndex}: {formatCapacity(horizonDemand, unit)} demand; {formatCapacity(values.planningCapacityBytes, unit)} after reserve.
          </p>
        </div>
        <label className={styles.displayUnit} htmlFor="displayUnit">
          Display unit
          <select id="displayUnit" value={unit} onChange={(event) => onDisplayUnitChange(event.target.value as StorageGrowthDisplayUnit)}>
            <option value="TB">TB</option>
            <option value="TiB">TiB</option>
          </select>
        </label>
      </div>

      <div className={styles.metrics} aria-label="Plan summary">
        <div><span>Capacity after reserve</span><strong>{formatCapacity(values.planningCapacityBytes, unit)}</strong></div>
        <div><span>Year {horizonIndex} demand</span><strong>{formatCapacity(horizonDemand, unit)}</strong></div>
        <div><span>Total TCO</span><strong>{formatMoney(values.costs.totalMinor, input.currency)}</strong></div>
        <div><span>Power cost</span><strong>{formatMoney(values.costs.powerMinor, input.currency)}</strong></div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.sectionHeading}>
          <h3>Growth runway</h3>
          <span>Years 0-{horizonIndex}</span>
        </div>
        <GrowthChart values={values} unit={unit} />
      </div>

      <div className={styles.tableSection}>
        <div className={styles.sectionHeading}><h3>Year-by-year plan</h3></div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Year</th><th>Projected demand</th><th>Headroom after reserve</th><th>State</th></tr></thead>
            <tbody>
              {values.demandBytes.map((demand, year) => {
                const headroom = values.planningCapacityBytes - demand;
                return <tr key={year}>
                  <th scope="row" data-label="Year">{year}</th>
                  <td data-label="Projected demand">{formatCapacity(demand, unit)}</td>
                  <td data-label="Headroom after reserve">{signedCapacity(headroom, unit)}</td>
                  <td data-label="State">{demand > values.planningCapacityBytes ? "Over reserve" : demand === values.planningCapacityBytes ? "At reserve" : "Within reserve"}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.sectionHeading}><h3>Cost over the horizon</h3><span>{input.currency}</span></div>
        <table className={`${styles.table} ${styles.costTable}`}>
          <tbody>
            <tr><th scope="row">Hardware</th><td>{formatMoney(values.costs.hardwareMinor, input.currency)}</td></tr>
            <tr><th scope="row">Power</th><td>{formatMoney(values.costs.powerMinor, input.currency)}</td></tr>
            <tr><th scope="row">Replacement reserve</th><td>{formatMoney(values.costs.replacementMinor, input.currency)}</td></tr>
            <tr><th scope="row">Backup budget</th><td>{formatMoney(values.costs.backupMinor, input.currency)}</td></tr>
            <tr className={styles.totalRow}><th scope="row">Total TCO</th><td>{formatMoney(values.costs.totalMinor, input.currency)}</td></tr>
          </tbody>
        </table>
      </div>

      <div className={styles.resultActions}>
        <button type="button" onClick={onCopy}><Copy size={17} />Copy summary</button>
        <button type="button" onClick={onShare}><Share2 size={17} />Share plan</button>
      </div>
      {shareUrl ? <label className={styles.shareLink} htmlFor="shareUrl">Share URL<input id="shareUrl" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} /></label> : null}
      {status ? <p className={styles.actionStatus} role="status" aria-live="polite">{status}</p> : null}

      <details className={styles.receipt}>
        <summary>Formula receipt</summary>
        <dl>
          <div><dt>Layout</dt><dd>{input.layout}; {values.dataMembers} data members</dd></div>
          <div><dt>Capacity</dt><dd>{formatCapacity(values.modeledUsableBytes, unit)} usable; {formatCapacity(values.reserveBytes, unit)} reserve</dd></div>
          <div><dt>Growth</dt><dd>{input.annualGrowth}% compounded once yearly</dd></div>
          <div><dt>Costs</dt><dd>Drive, enclosure, power, replacement, backup</dd></div>
          <div><dt>Version</dt><dd>Formula v{values.metadata.calculationVersion}; input v{values.metadata.inputVersion}</dd></div>
        </dl>
      </details>
    </section>
  );
}

export function StorageGrowthPlanner({ initialState }: { initialState: string }) {
  const [input, setInput] = useState<StorageGrowthInput>(defaults);
  const [calculated, setCalculated] = useState<Calculated | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const resultRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!initialState) return;
    const restored = decodeStorageGrowthState(initialState);
    if (restored.status === "valid") {
      const result = calculateStorageGrowthPlan(restored.input);
      if (result.status === "valid") {
        setInput(restored.input);
        setCalculated({ values: result.values });
        setRestoreStatus(restored.message);
        setShareUrl(window.location.href);
        return;
      }
    }
    setInput(defaults());
    setCalculated(null);
    setRestoreStatus(restored.message);
    window.history.replaceState(null, "", window.location.pathname);
  }, [initialState]);

  useEffect(() => {
    if (calculated) resultRef.current?.focus({ preventScroll: true });
  }, [calculated]);

  const clearUrl = () => {
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  };

  const update = (field: FieldKey, value: string) => {
    const hadResult = calculated !== null;
    setInput((current) => ({ ...current, [field]: value } as StorageGrowthInput));
    setCalculated(null);
    setErrors({});
    setRestoreStatus("");
    setShareUrl("");
    setStatus(hadResult ? "Result cleared." : "");
    clearUrl();
  };

  const changeDisplayUnit = (displayUnit: StorageGrowthDisplayUnit) => {
    setInput((current) => ({ ...current, displayUnit }));
    setStatus("");
  };

  const focusFirstError = (nextErrors: Record<string, string>) => {
    for (const field of errorOrder) {
      if (nextErrors[field]) {
        fieldRefs.current[field]?.focus();
        return;
      }
    }
  };

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const result: StorageGrowthCalculationResult = calculateStorageGrowthPlan(input);
    if (result.status === "invalid") {
      const nextErrors = issueMap(result.issues);
      setErrors(nextErrors);
      setCalculated(null);
      setShareUrl("");
      setStatus("Fix the marked input.");
      focusFirstError(nextErrors);
      return;
    }
    setErrors({});
    setCalculated({ values: result.values });
    setStatus("Plan calculated.");
  };

  const reset = () => {
    setInput(defaults());
    setCalculated(null);
    setErrors({});
    setStatus("");
    setRestoreStatus("");
    setShareUrl("");
    window.history.replaceState(null, "", window.location.pathname);
    fieldRefs.current.currentData?.focus();
  };

  const copy = async () => {
    if (!calculated) return;
    try {
      await navigator.clipboard.writeText(buildStorageGrowthCopySummary(input, calculated.values));
      setStatus("Summary copied.");
    } catch {
      setStatus("Copy failed. Select the result.");
    }
  };

  const share = async () => {
    if (!calculated) return;
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("state", encodeStorageGrowthState(input));
      window.history.replaceState(null, "", url.toString());
      setShareUrl(url.toString());
      try {
        await navigator.clipboard.writeText(url.toString());
        setStatus("Share link copied.");
      } catch {
        setStatus("Share link ready.");
      }
    } catch {
      setStatus("Share failed.");
    }
  };

  const errorSummary = Object.entries(errors);
  return (
    <section className={styles.tool} aria-label="storage growth planner inputs and results">
      <form className={styles.form} onSubmit={submit} noValidate>
        {restoreStatus ? <p className={styles.restoreStatus} role="status" aria-live="polite">{restoreStatus}</p> : null}
        {errorSummary.length > 0 ? <div className={styles.errorSummary} role="alert">
          <h2>Fix the marked input</h2>
          <ul>{errorSummary.map(([field, message]) => <li key={field}>{message}</li>)}</ul>
        </div> : null}
        <fieldset className={styles.fieldset}>
          <legend>Demand and horizon</legend>
          <div className={styles.controlGrid}>
            <Field id="currentData" label="Current data" value={input.currentData} suffix="TB" error={errors.currentData} inputRef={(node) => { fieldRefs.current.currentData = node; }} onChange={(value) => update("currentData", value)} />
            <Field id="annualGrowth" label="Annual growth" value={input.annualGrowth} suffix="%" error={errors.annualGrowth} inputRef={(node) => { fieldRefs.current.annualGrowth = node; }} onChange={(value) => update("annualGrowth", value)} />
            <Field id="horizonYears" label="Horizon" value={input.horizonYears} suffix="years" error={errors.horizonYears} inputMode="numeric" inputRef={(node) => { fieldRefs.current.horizonYears = node; }} onChange={(value) => update("horizonYears", value)} />
            <Field id="reserve" label="Operating reserve" value={input.reserve} suffix="%" error={errors.reserve} inputRef={(node) => { fieldRefs.current.reserve = node; }} onChange={(value) => update("reserve", value)} />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Local drive plan</legend>
          <fieldset className={styles.layoutFieldset} aria-labelledby="layout-legend">
            <legend id="layout-legend">Layout</legend>
            <div className={styles.choiceRow}>
              {(["mirror", "single-parity", "dual-parity"] as StorageGrowthLayout[]).map((layout) => (
                <label className={styles.choice} key={layout}>
                  <input type="radio" name="layout" value={layout} checked={input.layout === layout} aria-invalid={Boolean(errors.layout)} aria-describedby={errors.layout ? "layout-error" : undefined} onChange={() => update("layout", layout)} />
                  <span>{layout === "single-parity" ? "Single parity" : layout === "dual-parity" ? "Dual parity" : "Mirror"}</span>
                </label>
              ))}
            </div>
            {errors.layout ? <small className={styles.error} id="layout-error">{errors.layout}</small> : null}
          </fieldset>
          <div className={styles.controlGrid}>
            <Field id="driveCount" label="Drive count" value={input.driveCount} error={errors.driveCount} inputMode="numeric" inputRef={(node) => { fieldRefs.current.driveCount = node; }} onChange={(value) => update("driveCount", value)} />
            <Field id="driveSize" label="Drive size" value={input.driveSize} suffix="TB" error={errors.driveSize} inputRef={(node) => { fieldRefs.current.driveSize = node; }} onChange={(value) => update("driveSize", value)} />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Cost assumptions</legend>
          <div className={styles.controlGrid}>
            <label className={styles.field} htmlFor="currency"><span>Currency</span><select id="currency" value={input.currency} aria-invalid={Boolean(errors.currency)} onChange={(event) => update("currency", event.target.value)} ref={(node) => { fieldRefs.current.currency = node; }}><option>USD</option><option>EUR</option><option>GBP</option><option>INR</option></select>{errors.currency ? <small className={styles.error}>{errors.currency}</small> : null}</label>
            <Field id="drivePrice" label="Drive price" value={input.drivePrice} error={errors.drivePrice} inputRef={(node) => { fieldRefs.current.drivePrice = node; }} onChange={(value) => update("drivePrice", value)} />
            <Field id="enclosureCost" label="Enclosure cost" value={input.enclosureCost} error={errors.enclosureCost} inputRef={(node) => { fieldRefs.current.enclosureCost = node; }} onChange={(value) => update("enclosureCost", value)} />
            <Field id="averagePowerWatts" label="Average draw" value={input.averagePowerWatts} suffix="W" error={errors.averagePowerWatts} inputMode="numeric" inputRef={(node) => { fieldRefs.current.averagePowerWatts = node; }} onChange={(value) => update("averagePowerWatts", value)} />
            <Field id="hoursPerDay" label="Hours per day" value={input.hoursPerDay} suffix="hours" error={errors.hoursPerDay} inputMode="numeric" inputRef={(node) => { fieldRefs.current.hoursPerDay = node; }} onChange={(value) => update("hoursPerDay", value)} />
            <Field id="electricityRate" label="Electricity rate" value={input.electricityRate} suffix="/kWh" error={errors.electricityRate} inputRef={(node) => { fieldRefs.current.electricityRate = node; }} onChange={(value) => update("electricityRate", value)} />
            <Field id="replacementReserve" label="Replacement reserve" value={input.replacementReserve} suffix="%" error={errors.replacementReserve} inputRef={(node) => { fieldRefs.current.replacementReserve = node; }} onChange={(value) => update("replacementReserve", value)} />
            <Field id="backupAnnualBudget" label="Backup budget" value={input.backupAnnualBudget} suffix="/year" error={errors.backupAnnualBudget} inputRef={(node) => { fieldRefs.current.backupAnnualBudget = node; }} onChange={(value) => update("backupAnnualBudget", value)} />
          </div>
        </fieldset>

        <div className={styles.formActions}>
          <button className={styles.primaryAction} type="submit">Calculate plan</button>
          <button type="button" onClick={reset}><RotateCcw size={17} />Reset</button>
          {status && !calculated ? <p className={styles.actionStatus} role="status" aria-live="polite">{status}</p> : null}
        </div>
        <p className={styles.privacyNote}>Runs locally. Values stay in this browser.</p>
      </form>
      {calculated ? <Result values={calculated.values} input={input} onDisplayUnitChange={changeDisplayUnit} onCopy={copy} onShare={share} status={status} shareUrl={shareUrl} headingRef={resultRef} /> : null}
    </section>
  );
}
