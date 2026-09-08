"use client";

import { useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolChoiceGroup,
  ToolDataTable,
  ToolDisclosure,
  ToolKeyValueList,
  ToolNumberField,
  ToolPrimaryResult,
  ToolProgressBar,
  ToolQuantityField,
  ToolSelect,
  ToolStatus,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  CAPACITY_UNITS,
  calculateRebuildExposure,
  DEFAULT_INPUT,
  normalizeRebuildInput,
  RAID_LEVELS,
  URE_EXPONENTS,
  type RebuildExposureResult,
  type RebuildField,
} from "@/lib/rebuild-calculator/engine";
import styles from "./rebuild-calculator.module.css";

type InputState = typeof DEFAULT_INPUT;
type ErrorState = Partial<Record<RebuildField, string>>;
type SuccessResult = Extract<RebuildExposureResult, { status: "success" }>;

const RAID_LABELS = {
  raid1: "RAID 1",
  raid5: "RAID 5",
  raid6: "RAID 6",
  raid10: "RAID 10",
} as const;

const raidOptions = RAID_LEVELS.map((level) => toolOption(level, RAID_LABELS[level]));
const capacityUnitOptions = CAPACITY_UNITS.map((unit) => toolOption(unit, unit));
const ureOptions = URE_EXPONENTS.map((exponent) => toolOption(String(exponent), `1 error per 10^${exponent} bits`));

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

function resultOrNull(value: RebuildExposureResult): SuccessResult | null {
  return value.status === "success" ? value : null;
}

function numericValue(value: string) {
  return value === "" ? Number.NaN : Number(value);
}

function Result({ result, resultRef }: { result: SuccessResult; resultRef: RefObject<HTMLHeadingElement | null> }) {
  const exposurePercentage = Math.max(0, Math.min(100, result.readErrorProbability * 100));
  const evidenceRows = [
    { id: "layout", cells: { item: "Layout", value: RAID_LABELS[result.input.raidLevel] } },
    { id: "drives", cells: { item: "Drive count", value: result.input.driveCount } },
    { id: "member-capacity", cells: { item: "Member capacity", value: `${formatNumber(result.input.driveCapacity)} ${result.input.capacityUnit}` } },
    { id: "sources", cells: { item: "Reconstruction sources", value: `${result.sourceDriveEquivalents} drive equivalents` } },
    { id: "throughput", cells: { item: "Rebuild throughput", value: `${formatNumber(result.input.rebuildThroughput)} MB/s` } },
    { id: "scope", cells: { item: "Member read scope", value: `${formatNumber(result.input.memberReadScope)}%` } },
    { id: "ure", cells: { item: "URE specification", value: `1 error per 10^${result.input.ureExponent} bits` } },
    { id: "formula", cells: { item: "Formula", value: result.formulaVersion } },
  ];

  return (
    <section aria-labelledby="rebuild-result-title" aria-live="polite" className={styles.result}>
      <h2 className={styles.resultHeading} id="rebuild-result-title" ref={resultRef} tabIndex={-1}>Rebuild result</h2>
      <ToolPrimaryResult label="Total degraded window" value={formatDuration(result.degradedSeconds)} />

      <ToolKeyValueList rows={[
        { label: "Rebuild copy time", value: formatDuration(result.copySeconds) },
        { label: "Replacement delay", value: formatDuration(result.replacementDelaySeconds) },
        { label: "Source media read", value: formatBytes(result.readBytes) },
        { label: "Additional errors tolerated", value: result.readErrorTolerance },
      ]} />

      <ToolProgressBar
        label="Modeled read-error exposure"
        value={exposurePercentage}
        valueText={formatPercentage(result.readErrorProbability)}
      />

      <ToolDisclosure label="Model details">
        <div className={styles.details}>
          <ToolDataTable
            ariaLabel="Rebuild model details"
            columns={[
              { id: "item", label: "Input" },
              { id: "value", label: "Normalized value" },
            ]}
            rows={evidenceRows}
          />
          <div className={styles.detailCopy}>
            {result.input.raidLevel === "raid6" ? (
              <p>RAID 6 uses the minimum reconstruction source reads in this model.</p>
            ) : null}
            <p>Modeled exposure is the chance of at least one specified read error. It is not a data-loss probability.</p>
          </div>
        </div>
      </ToolDisclosure>
    </section>
  );
}

export function RebuildCalculator() {
  const [input, setInput] = useState<InputState>(() => ({ ...DEFAULT_INPUT }));
  const [result, setResult] = useState<SuccessResult | null>(() => resultOrNull(calculateRebuildExposure(DEFAULT_INPUT)));
  const [errors, setErrors] = useState<ErrorState>({});
  const [announcement, setAnnouncement] = useState("");
  const [unexpectedError, setUnexpectedError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const raidGroupRef = useRef<HTMLDivElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  function focusField(field: RebuildField) {
    const selectors: Record<RebuildField, string> = {
      raidLevel: "[role='radio']",
      driveCount: "[data-focus-key='driveCount']",
      driveCapacity: "[aria-label='Drive capacity']",
      capacityUnit: "[data-tool-label='Drive capacity unit']",
      rebuildThroughput: "[data-focus-key='rebuildThroughput']",
      memberReadScope: "[data-focus-key='memberReadScope']",
      ureExponent: "[data-focus-key='ureExponent']",
      replacementDelay: "[data-focus-key='replacementDelay']",
    };
    formRef.current?.querySelector<HTMLElement>(selectors[field])?.focus();
  }

  function updateField(field: RebuildField, value: string) {
    const next = { ...input, [field]: value } as InputState;
    setInput(next);
    const validation = normalizeRebuildInput(next);
    setErrors(validation.status === "invalid" ? validation.errors : {});
    setResult(null);
    setAnnouncement("");
    setUnexpectedError("");
  }

  function captureNumericInput(event: FormEvent<HTMLFormElement>) {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "text") return;
    const fieldsByLabel: Record<string, RebuildField> = {
      "Drive count": "driveCount",
      "Drive capacity": "driveCapacity",
      "Rebuild throughput": "rebuildThroughput",
      "Member read scope": "memberReadScope",
      "Replacement delay": "replacementDelay",
    };
    const field = fieldsByLabel[event.target.getAttribute("aria-label") ?? ""];
    if (field) updateField(field, event.target.value);
  }

  function calculate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    try {
      const calculation = calculateRebuildExposure(input);
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        setUnexpectedError("");
        setAnnouncement("Fix the marked inputs.");
        requestAnimationFrame(() => focusField(calculation.firstInvalidField));
        return;
      }
      setErrors({});
      setResult(calculation);
      setUnexpectedError("");
      setAnnouncement(`Total degraded window: ${formatDuration(calculation.degradedSeconds)}.`);
      requestAnimationFrame(() => resultHeadingRef.current?.focus());
    } catch {
      setResult(null);
      setUnexpectedError("The calculation could not finish. Check the inputs and try again.");
      setAnnouncement("The calculation could not finish.");
    }
  }

  function reset() {
    const defaults = { ...DEFAULT_INPUT };
    setInput(defaults);
    setErrors({});
    setResult(resultOrNull(calculateRebuildExposure(defaults)));
    setUnexpectedError("");
    setAnnouncement("Defaults restored.");
    requestAnimationFrame(() => raidGroupRef.current?.querySelector<HTMLElement>("input[type='radio']:checked")?.focus());
  }

  return (
    <section aria-label="rebuild exposure calculator" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onInputCapture={captureNumericInput} onSubmit={calculate} ref={formRef}>
        <div ref={raidGroupRef}>
          <ToolChoiceGroup
            error={errors.raidLevel}
            label="RAID level"
            onChange={(value) => updateField("raidLevel", value)}
            options={raidOptions}
            required
            value={input.raidLevel}
          />
        </div>

        <div className={styles.fields}>
          <ToolNumberField
            dataFocusKey="driveCount"
            error={errors.driveCount}
            label="Drive count"
            onChange={(value) => updateField("driveCount", Number.isNaN(value) ? "" : String(value))}
            required
            step={1}
            suffix="drives"
            value={numericValue(input.driveCount)}
          />
          <ToolQuantityField
            error={errors.driveCapacity ?? errors.capacityUnit}
            label="Drive capacity"
            onChange={(value) => updateField("driveCapacity", Number.isNaN(value) ? "" : String(value))}
            onUnitChange={(value) => updateField("capacityUnit", value)}
            required
            step={0.1}
            unit={input.capacityUnit}
            units={capacityUnitOptions}
            value={numericValue(input.driveCapacity)}
          />
          <ToolNumberField
            dataFocusKey="rebuildThroughput"
            error={errors.rebuildThroughput}
            label="Rebuild throughput"
            onChange={(value) => updateField("rebuildThroughput", Number.isNaN(value) ? "" : String(value))}
            required
            step={10}
            suffix="MB/s"
            value={numericValue(input.rebuildThroughput)}
          />
          <ToolNumberField
            dataFocusKey="memberReadScope"
            error={errors.memberReadScope}
            label="Member read scope"
            onChange={(value) => updateField("memberReadScope", Number.isNaN(value) ? "" : String(value))}
            required
            step={1}
            suffix="%"
            value={numericValue(input.memberReadScope)}
          />
          <ToolSelect
            dataFocusKey="ureExponent"
            error={errors.ureExponent}
            label="URE specification"
            onChange={(value) => updateField("ureExponent", value)}
            options={ureOptions}
            required
            value={input.ureExponent}
          />
          <ToolNumberField
            dataFocusKey="replacementDelay"
            error={errors.replacementDelay}
            label="Replacement delay"
            onChange={(value) => updateField("replacementDelay", Number.isNaN(value) ? "" : String(value))}
            required
            step={1}
            suffix="hours"
            value={numericValue(input.replacementDelay)}
          />
        </div>

        <div className={styles.formActions}>
          <ToolActionRow>
            <ToolButton type="submit" variant="primary">Calculate</ToolButton>
            <ToolButton onPress={reset} type="button">Reset</ToolButton>
          </ToolActionRow>
        </div>
        {unexpectedError ? <ToolStatus tone="danger">{unexpectedError}</ToolStatus> : null}
        <p aria-live="polite" className={styles.visuallyHidden}>{announcement}</p>
      </form>

      {result ? <Result result={result} resultRef={resultHeadingRef} /> : null}
    </section>
  );
}
