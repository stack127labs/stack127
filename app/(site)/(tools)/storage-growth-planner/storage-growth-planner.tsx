"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiChoiceGroup, UiCopyAction, UiDisclosure, UiNumberField, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
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
const layoutOptions = [
  uiOption("mirror", "Mirror"),
  uiOption("single-parity", "Single parity"),
  uiOption("dual-parity", "Dual parity"),
];
const currencyOptions = ["USD", "EUR", "GBP", "INR"].map((currency) => uiOption(currency, currency));
const displayUnitOptions = [uiOption("TB", "TB"), uiOption("TiB", "TiB")];

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
  const height = 280;
  const left = 88;
  const right = 12;
  const top = 24;
  const bottom = 52;
  const maxBytes = values.reduce((maximum, value) => value > maximum ? value : maximum, planningCapacityBytes);
  const max = Math.max(1, capacityNumber(maxBytes, unit));
  const x = (index: number) => left + (index * (width - left - right)) / Math.max(1, values.length - 1);
  const y = (value: number) => height - bottom - (value / max) * (height - top - bottom);
  return {
    width,
    height,
    left,
    top,
    bottom,
    maxBytes,
    x,
    y,
    demand: values.map((value, index) => `${x(index)},${y(capacityNumber(value, unit))}`).join(" "),
    capacity: `${x(0)},${y(capacityNumber(planningCapacityBytes, unit))} ${x(values.length - 1)},${y(capacityNumber(planningCapacityBytes, unit))}`,
  };
}

function GrowthChart({ values, unit }: { values: StorageGrowthValues; unit: StorageGrowthDisplayUnit }) {
  const chart = chartPoints(values.demandBytes, values.planningCapacityBytes, unit);
  return (
    <figure className={styles.chartFigure}>
      <div className={styles.chartFrame}>
        <svg className={styles.chart} role="img" aria-labelledby="growth-chart-title growth-chart-description" viewBox={`0 0 ${chart.width} ${chart.height}`}>
          <title id="growth-chart-title">Projected demand and capacity after reserve</title>
          <desc id="growth-chart-description">Projected demand by year compared with fixed planning capacity.</desc>
          <line className={styles.chartAxis} x1={chart.left} x2={chart.left} y1={chart.top} y2={chart.height - chart.bottom} />
          <line className={styles.chartAxis} x1={chart.left} x2={chart.width - 12} y1={chart.height - chart.bottom} y2={chart.height - chart.bottom} />
          <text className={styles.chartLabel} x={chart.left - 10} y={chart.top + 4} textAnchor="end">{formatCapacity(chart.maxBytes, unit)}</text>
          <text className={styles.chartLabel} x={chart.left - 10} y={chart.height - chart.bottom + 4} textAnchor="end">0 {unit}</text>
          <polyline className={styles.capacityLine} fill="none" points={chart.capacity} />
          <polyline className={styles.demandLine} fill="none" points={chart.demand} />
          {values.demandBytes.map((value, index) => (
            <g key={index}>
              <circle className={styles.demandDot} cx={chart.x(index)} cy={chart.y(capacityNumber(value, unit))} r="4" />
              <text className={styles.chartLabel} x={chart.x(index)} y={chart.height - 30} textAnchor="middle">{index}</text>
            </g>
          ))}
          <text className={styles.chartLabel} x={(chart.left + chart.width - 12) / 2} y={chart.height - 8} textAnchor="middle">Year</text>
        </svg>
      </div>
      <figcaption className={styles.legend}>
        <span><i className={styles.legendDemand} />Projected demand</span>
        <span><i className={styles.legendCapacity} />Capacity after reserve</span>
      </figcaption>
    </figure>
  );
}

function Result({ values, input, shareUrl, status, onShare }: {
  values: StorageGrowthValues;
  input: StorageGrowthInput;
  shareUrl: string;
  status: string;
  onShare: () => void;
}) {
  const unit = input.displayUnit;
  const horizon = values.demandBytes.length - 1;
  const horizonDemand = values.demandBytes[horizon] ?? 0n;
  const answer = values.shortfallYear === null ? `Covers ${input.horizonYears} years` : `Shortfall in year ${values.shortfallYear}`;
  const tone = values.shortfallYear === null ? "success" : "warning";
  return (
    <section aria-live="polite" className={styles.result} data-testid="growth-result">
      <h2 className={styles.resultHeading} id="storage-growth-result-heading" tabIndex={-1}>Storage runway</h2>
      <UiPrimaryResult
        detail={`Year ${horizon} demand ${formatCapacity(horizonDemand, unit)} · Capacity after reserve ${formatCapacity(values.planningCapacityBytes, unit)}`}
        label="Storage runway"
        tone={tone}
        value={answer}
      />

      <section className={styles.resultSection}>
        <h2>Growth runway</h2>
        <GrowthChart unit={unit} values={values} />
      </section>

      <section className={styles.resultSection}>
        <h2>Year-by-year plan</h2>
        <UiDataTable
          ariaLabel="Storage growth by year"
          columns={[
            { id: "year", label: "Year" },
            { id: "demand", label: "Projected demand" },
            { id: "headroom", label: "Headroom after reserve" },
            { id: "state", label: "State" },
          ]}
          rows={values.demandBytes.map((demand, year) => {
            const headroom = values.planningCapacityBytes - demand;
            return {
              id: String(year),
              cells: {
                year,
                demand: formatCapacity(demand, unit),
                headroom: signedCapacity(headroom, unit),
                state: demand > values.planningCapacityBytes ? "Over reserve" : demand === values.planningCapacityBytes ? "At reserve" : "Within reserve",
              },
            };
          })}
        />
      </section>

      <section className={styles.resultSection}>
        <h2>Cost breakdown</h2>
        <UiDataTable
          ariaLabel={`Cost breakdown in ${input.currency}`}
          columns={[{ id: "category", label: "Category" }, { id: "cost", label: `Cost (${input.currency})` }]}
          rows={[
            { id: "hardware", cells: { category: "Hardware", cost: formatMoney(values.costs.hardwareMinor, input.currency) } },
            { id: "power", cells: { category: "Power", cost: formatMoney(values.costs.powerMinor, input.currency) } },
            { id: "replacement", cells: { category: "Replacement reserve", cost: formatMoney(values.costs.replacementMinor, input.currency) } },
            { id: "backup", cells: { category: "Backup budget", cost: formatMoney(values.costs.backupMinor, input.currency) } },
            { id: "total", cells: { category: <strong>Total TCO</strong>, cost: <strong>{formatMoney(values.costs.totalMinor, input.currency)}</strong> } },
          ]}
        />
      </section>

      <UiActionRow>
        <UiCopyAction label="Copy summary" value={buildStorageGrowthCopySummary(input, values)} />
        <UiButton onPress={onShare}>Share plan</UiButton>
      </UiActionRow>
      {shareUrl ? <UiTextField label="Share URL" readOnly value={shareUrl} /> : null}
      {status ? <UiStatus>{status}</UiStatus> : null}

      <UiDisclosure label="Formula receipt">
        <UiKeyValueList rows={[
          { label: "Layout", value: `${input.layout}; ${values.dataMembers} data members` },
          { label: "Capacity model", value: `${formatCapacity(values.modeledUsableBytes, unit)} usable; ${formatCapacity(values.reserveBytes, unit)} reserve` },
          { label: "Growth", value: `${input.annualGrowth}% compounded yearly` },
          { label: "Cost categories", value: "Drive, enclosure, power, replacement, backup" },
          { label: "Version", value: `Formula ${values.metadata.calculationVersion}; input ${values.metadata.inputVersion}` },
        ]} />
      </UiDisclosure>
    </section>
  );
}

export function StorageGrowthPlanner({ initialState }: { initialState: string }) {
  const [input, setInput] = useState<StorageGrowthInput>(defaults);
  const [calculated, setCalculated] = useState<Calculated | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const focusResult = useRef(false);

  useEffect(() => {
    if (!initialState) return;
    const restored = decodeStorageGrowthState(initialState);
    if (restored.status === "valid") {
      const result = calculateStorageGrowthPlan(restored.input);
      if (result.status === "valid") {
        setInput(restored.input);
        setCalculated({ values: result.values });
        setStatus(restored.message);
        return;
      }
    }
    setInput(defaults());
    setCalculated(null);
    setStatus(restored.message);
    window.history.replaceState(null, "", window.location.pathname);
  }, [initialState]);

  useEffect(() => {
    if (focusResult.current && calculated) {
      focusResult.current = false;
      window.setTimeout(() => document.getElementById("storage-growth-result-heading")?.focus({ preventScroll: true }), 0);
    }
  }, [calculated]);

  function clearUrl() {
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  }

  function update(field: FieldKey, value: string) {
    setInput((current) => ({ ...current, [field]: value } as StorageGrowthInput));
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    setStatus("");
    clearUrl();
  }

  function changeDisplayUnit(displayUnit: StorageGrowthDisplayUnit) {
    setInput((current) => ({ ...current, displayUnit }));
    setShareUrl("");
    setStatus("");
    clearUrl();
  }

  function focusFirstError(nextErrors: Record<string, string>) {
    for (const field of errorOrder) {
      if (nextErrors[field]) {
        fieldRefs.current[field]?.focus();
        return;
      }
    }
  }

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const result: StorageGrowthCalculationResult = calculateStorageGrowthPlan(input);
    if (result.status === "invalid") {
      const nextErrors = issueMap(result.issues);
      setErrors(nextErrors);
      setCalculated(null);
      setShareUrl("");
      setStatus("Check the marked inputs.");
      window.setTimeout(() => focusFirstError(nextErrors), 0);
      return;
    }
    setErrors({});
    setCalculated({ values: result.values });
    setStatus("");
    focusResult.current = true;
  }

  function reset() {
    setInput(defaults());
    setCalculated(null);
    setErrors({});
    setStatus("Plan reset.");
    setShareUrl("");
    window.history.replaceState(null, "", window.location.pathname);
    window.setTimeout(() => fieldRefs.current.currentData?.focus(), 0);
  }

  async function share() {
    if (!calculated) return;
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("state", encodeStorageGrowthState(input));
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      setShareUrl(url.toString());
      try {
        await navigator.clipboard.writeText(url.toString());
        setStatus("Share URL copied.");
      } catch {
        setStatus("Share URL ready.");
      }
    } catch {
      setStatus("Share failed.");
    }
  }

  const numberField = (field: FieldKey, label: string, suffix?: string, options?: { min?: number; max?: number; step?: number }) => (
    <UiNumberField
      dataFocusKey={field}
      error={errors[field]}
      inputRef={(node) => { fieldRefs.current[field] = node; }}
      label={label}
      max={options?.max}
      min={options?.min}
      onChange={(value) => update(field, Number.isNaN(value) ? "" : String(value))}
      required
      step={options?.step}
      suffix={suffix}
      value={Number(input[field])}
    />
  );

  return (
    <div aria-label="storage growth planner inputs and results" className={styles.tool} data-tool-workbench role="region">
      <form className={styles.form} noValidate onSubmit={submit}>
        <section className={styles.formSection}>
          <h2>Demand</h2>
          <div className={styles.controlGrid}>
            {numberField("currentData", "Current data", "TB", { min: 0, max: 1000, step: 0.1 })}
            {numberField("annualGrowth", "Annual growth", "%", { min: 0, max: 100, step: 0.1 })}
            {numberField("horizonYears", "Horizon", "years", { min: 1, max: 10 })}
            {numberField("reserve", "Operating reserve", "%", { min: 0, max: 50, step: 0.1 })}
          </div>
        </section>

        <section className={styles.formSection}>
          <h2>Local plan</h2>
          <UiChoiceGroup error={errors.layout} label="Layout" onChange={(layout) => update("layout", layout)} options={layoutOptions} required value={input.layout} />
          <div className={styles.controlGrid}>
            {numberField("driveCount", "Drive count", undefined, { min: 2, max: 24 })}
            {numberField("driveSize", "Drive size", "TB", { min: 0.1, max: 100, step: 0.1 })}
          </div>
        </section>

        <section className={styles.formSection}>
          <h2>Costs</h2>
          <div className={styles.controlGrid}>
            <UiSelect error={errors.currency} label="Currency" onChange={(currency) => update("currency", currency)} options={currencyOptions} required value={input.currency} />
            {numberField("drivePrice", "Drive price", input.currency, { min: 0, max: 100000, step: 0.01 })}
            {numberField("enclosureCost", "Enclosure cost", input.currency, { min: 0, max: 100000, step: 0.01 })}
            {numberField("averagePowerWatts", "Average draw", "W", { min: 0, max: 2000 })}
            {numberField("hoursPerDay", "Hours per day", "hours", { min: 0, max: 24 })}
            {numberField("electricityRate", "Electricity rate", `${input.currency}/kWh`, { min: 0, max: 10, step: 0.01 })}
            {numberField("replacementReserve", "Replacement reserve", "%", { min: 0, max: 25, step: 0.1 })}
            {numberField("backupAnnualBudget", "Backup budget", `${input.currency}/year`, { min: 0, max: 100000, step: 0.01 })}
          </div>
        </section>

        <UiChoiceGroup label="Result unit" onChange={(unit) => changeDisplayUnit(unit as StorageGrowthDisplayUnit)} options={displayUnitOptions} required value={input.displayUnit} />

        <UiActionRow>
          <UiButton type="submit" variant="primary">Calculate plan</UiButton>
          <UiButton onPress={reset}>Reset</UiButton>
        </UiActionRow>
        {status && !calculated ? <UiStatus tone={Object.keys(errors).length ? "danger" : "neutral"}>{status}</UiStatus> : null}
      </form>

      {calculated ? <Result input={input} onShare={share} shareUrl={shareUrl} status={status} values={calculated.values} /> : null}
    </div>
  );
}
