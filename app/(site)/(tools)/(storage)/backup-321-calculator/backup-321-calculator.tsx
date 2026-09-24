"use client";

import {
  Check,
  Copy,
  RotateCcw,
  Share2,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiDisclosure, UiQuantityInput, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  BACKUP_321_DISPLAY_UNITS,
  BACKUP_321_MODELS,
  BACKUP_321_SOURCE_UNITS,
  DEFAULT_BACKUP_321_INPUT,
  calculateBackup321Capacity,
  decodeBackup321State,
  encodeBackup321State,
  formatBackup321Capacity,
  formatBackup321Seconds,
  normalizeBackup321Input,
  type Backup321CalculationValues,
  type Backup321DisplayUnit,
  type Backup321Input,
  type Backup321Model,
  type Backup321SourceUnit,
} from "@/lib/storage/backup-321";
import type { StorageCalculationResult } from "@/lib/storage/types";
import styles from "./backup-321-calculator.module.css";

type Calculated = Readonly<{
  input: Backup321Input;
  values: Backup321CalculationValues;
} & Pick<StorageCalculationResult<Backup321CalculationValues>, "assumptions" | "derivation" | "sources" | "uncertainty">>;
type FieldErrors = Record<string, string>;
type InputKey = keyof Backup321Input;

const sourceUnits = BACKUP_321_SOURCE_UNITS.map((unit) => uiOption(unit, unit));
const displayUnits = BACKUP_321_DISPLAY_UNITS.map((unit) => uiOption(unit, unit));
const models = BACKUP_321_MODELS.map((model) => uiOption(
  model,
  model === "full-only" ? "Full-only" : "Full plus incremental",
));
const errorOrder: InputKey[] = [
  "sourceData", "sourceUnit", "annualGrowth", "horizonYears", "backupModel", "retainedPoints",
  "changedPerBackup", "headroom", "backupIntervalHours", "targetRpoHours", "targetRtoHours",
  "localRestoreMbps", "offsiteRestoreMbps", "transferEfficiency", "displayUnit",
];

function defaults(): Backup321Input {
  return { ...DEFAULT_BACKUP_321_INPUT };
}

function modelLabel(model: Backup321Model) {
  return model === "full-only" ? "Full-only" : "Full plus incremental";
}

function calculatedResult(
  input: Backup321Input,
  result: StorageCalculationResult<Backup321CalculationValues>,
): Calculated | null {
  if (result.status !== "valid" || !result.values) return null;
  return {
    input,
    values: result.values,
    assumptions: result.assumptions,
    derivation: result.derivation,
    sources: result.sources,
    uncertainty: result.uncertainty,
  };
}

function percentageLabel(basisPoints: number) {
  const whole = Math.floor(basisPoints / 100);
  const fraction = basisPoints % 100;
  return fraction === 0 ? `${whole}%` : `${whole}.${String(fraction).padStart(2, "0").replace(/0+$/, "")}%`;
}

function copySummary(input: Backup321Input, values: Backup321CalculationValues) {
  return [
    `One target: ${formatBackup321Capacity(values.targetBytes.value, input.displayUnit)}`,
    `Both targets: ${formatBackup321Capacity(values.totalTargetBytes.value, input.displayUnit)}`,
    `Model: ${modelLabel(values.backupModel)}`,
    `Formula ${values.calculationVersion}; input ${values.inputVersion}`,
    `Uncertainty: ${"modelled"}`,
  ].join("\n");
}

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Use the selectable fallback below when the clipboard is blocked.
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

function statusText(passes: boolean, value: string) {
  return `${value}; ${passes ? "Pass" : "Miss"}`;
}

function Result({
  calculated,
  copyState,
  onCopy,
  onShare,
  shareUrl,
}: {
  calculated: Calculated;
  copyState: "idle" | "copied" | "failed";
  onCopy: () => void;
  onShare: () => void;
  shareUrl: string;
}) {
  const { input, values, assumptions, derivation, sources, uncertainty } = calculated;
  const display = (bytes: bigint) => formatBackup321Capacity(bytes, input.displayUnit);
  const summary = copySummary(input, values);
  const recovery = values.recovery;

  return (
    <section aria-label="Backup plan result" className={styles.result} data-testid="backup-321-result">
      <h2 className={styles.resultHeading} id="backup-321-result-heading" tabIndex={-1}>Backup plan result</h2>
      <UiPrimaryResult
        label="One backup target capacity"
        value={display(values.targetBytes.value)}
      />

      <section aria-labelledby="target-summary-heading" className={styles.resultSection}>
        <h3 id="target-summary-heading">Target summary</h3>
        <UiKeyValueList rows={[
          { label: "Local target", value: "Copy 2, equal to one target" },
          { label: "Off-site target", value: "Copy 3, equal to one target" },
          { label: "Both targets", value: display(values.totalTargetBytes.value) },
        ]} />
      </section>

      <section aria-labelledby="capacity-breakdown-heading" className={styles.resultSection}>
        <h3 id="capacity-breakdown-heading">Capacity breakdown</h3>
        <UiAllocationBar
          ariaLabel="Repository and headroom allocation"
          formatValue={(value) => display(value as bigint)}
          palette="categorical"
          segments={[
            { id: "repository", label: "Repository before headroom", tone: "cyan", value: values.repositoryBytes.value },
            { id: "headroom", label: "Headroom", tone: "chartreuse", value: values.headroomBytes.value },
          ]}
          total={values.targetBytes.value}
        />
      </section>

      <section aria-labelledby="model-summary-heading" className={styles.resultSection}>
        <h3 id="model-summary-heading">Model and source</h3>
        <UiKeyValueList rows={[
          { label: "Backup model", value: modelLabel(values.backupModel) },
          { label: "Retained points", value: `${values.retainedPoints} restore points` },
          { label: "Projected source", value: display(values.projectedSourceBytes.value) },
          { label: "Changed data / additional point", value: display(values.changedPerPointBytes.value) },
        ]} />
      </section>

      {recovery ? (
        <section aria-labelledby="recovery-heading" className={styles.resultSection}>
          <h3 id="recovery-heading">Recovery goals</h3>
          <UiKeyValueList rows={[
            { label: "RPO", value: statusText(recovery.rpoPasses, `${input.backupIntervalHours}h interval / ${input.targetRpoHours}h target`) },
            { label: "Local full restore", value: statusText(recovery.localRtoPasses, `Estimated ${formatBackup321Seconds(recovery.localRestoreSeconds.value)} / ${input.targetRtoHours}h target`) },
            { label: "Off-site full restore", value: statusText(recovery.offsiteRtoPasses, `Estimated ${formatBackup321Seconds(recovery.offsiteRestoreSeconds.value)} / ${input.targetRtoHours}h target`) },
          ]} />
        </section>
      ) : null}

      <section aria-labelledby="copy-relationship-heading" className={styles.resultSection}>
        <h3 id="copy-relationship-heading">Copy relationship</h3>
        <UiKeyValueList rows={[
          { label: "Copy 1", value: "Source" },
          { label: "Copy 2", value: "Local" },
          { label: "Copy 3", value: "Off-site" },
          { label: "Limit", value: values.copyRelationship.limitation },
        ]} />
      </section>

      <div className={styles.resultActions} data-result-actions>
        <UiActionRow>
          <UiButton aria-label={copyState === "copied" ? "Copied" : "Copy summary"} onPress={onCopy}>
            {copyState === "copied" ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
            {copyState === "copied" ? "Copied" : "Copy summary"}
          </UiButton>
          <UiButton aria-label="Share plan" onPress={onShare}>
            <Share2 aria-hidden="true" size={17} />
            Share plan
          </UiButton>
        </UiActionRow>
      </div>
      {copyState === "failed" ? (
        <UiTextField label="Copy summary" readOnly value={summary.replaceAll("\n", " | ")} />
      ) : null}
      {shareUrl ? <UiTextField label="Share URL" readOnly value={shareUrl} /> : null}

      <UiDisclosure label="Formula receipt">
        <div className={styles.receipt}>
          <UiKeyValueList rows={[
            { label: "Versions", value: `Formula ${values.calculationVersion}; input ${values.inputVersion}; engine ${values.engineVersion}` },
            { label: "Classification", value: "Estimated" },
            { label: "Uncertainty", value: uncertainty.statement },
            { label: "Rates", value: `${percentageLabel(values.annualGrowthBasisPoints)} growth; ${percentageLabel(values.changedPerBackupBasisPoints)} additional-point change; ${percentageLabel(values.headroomBasisPoints)} headroom` },
            ...(recovery ? [{ label: "Restore seconds", value: `Local ${recovery.localRestoreSeconds.value}; off-site ${recovery.offsiteRestoreSeconds.value}` }] : []),
          ]} />
          <div>
            <h4>Assumptions</h4>
            <ul>
              {assumptions.map((assumption) => <li key={assumption.id}>{assumption.statement}</li>)}
            </ul>
          </div>
          <div>
            <h4>Formula and rounding</h4>
            <ul>
              <li>Annual growth: half-up whole-byte rounding yearly.</li>
              <li>Changed data and headroom: ceiling division.</li>
              <li>Restore durations: seconds below one hour.</li>
            </ul>
          </div>
          <div>
            <h4>Derivation</h4>
            <ol>
              {derivation.map((step) => (
                <li key={step.id}><code>{step.expression}</code> = {step.result}</li>
              ))}
            </ol>
          </div>
          <div>
            <h4>Sources</h4>
            <ul>
              {sources.map((source) => (
                <li key={source.url}><a href={source.url}>{source.title}</a> <span>({source.checkedAt})</span></li>
              ))}
            </ul>
          </div>
        </div>
      </UiDisclosure>
    </section>
  );
}

export function Backup321Calculator({ initialState }: { initialState: string }) {
  const [input, setInput] = useState<Backup321Input>(defaults);
  const [calculated, setCalculated] = useState<Calculated | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [isHydrated, setIsHydrated] = useState(false);
  const focusResult = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!initialState) return;
    try {
      const restored = decodeBackup321State(initialState);
      const result = calculateBackup321Capacity(restored);
      if (result.status !== "valid" || !result.values) throw new Error("state");
      setInput(restored);
      const restoredCalculation = calculatedResult(restored, result);
      if (!restoredCalculation) throw new Error("state");
      setCalculated(restoredCalculation);
      setStatus("Shared plan loaded.");
      setCopyState("idle");
    } catch {
      setInput(defaults());
      setCalculated(null);
      setErrors({});
      setShareUrl("");
      setCopyState("idle");
      setStatus("Shared plan could not load.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [initialState]);

  useEffect(() => {
    if (!focusResult.current || !calculated) return;
    focusResult.current = false;
    window.setTimeout(() => {
      const heading = document.getElementById("backup-321-result-heading");
      heading?.scrollIntoView({ block: "start", inline: "nearest" });
      heading?.focus({ preventScroll: true });
    }, 0);
  }, [calculated]);

  function clearUrl() {
    if (window.location.search) window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  }

  function update(key: InputKey, value: string | boolean) {
    setInput((current) => ({ ...current, [key]: value } as Backup321Input));
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    setCopyState("idle");
    setStatus(key === "recoveryChecksEnabled"
      ? value ? "Recovery fields available." : "Recovery checks disabled."
      : "");
    clearUrl();
  }

  function updateDisplayUnit(displayUnit: Backup321DisplayUnit) {
    setInput((current) => ({ ...current, displayUnit }));
    setCalculated((current) => current ? { ...current, input: { ...current.input, displayUnit } } : current);
    setShareUrl("");
    setCopyState("idle");
    setStatus("");
  }

  function focusFirstError(nextErrors: FieldErrors) {
    for (const key of errorOrder) {
      if (nextErrors[key]) {
        document.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
        return;
      }
    }
  }

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const result = calculateBackup321Capacity(input);
    if (result.status === "invalid" || !result.values) {
      const nextErrors = Object.fromEntries(result.issues.filter((issue) => issue.path).map((issue) => [issue.path, issue.message]));
      setErrors(nextErrors);
      setCalculated(null);
      setShareUrl("");
      setCopyState("idle");
      setStatus("Check the marked inputs.");
      window.setTimeout(() => focusFirstError(nextErrors), 0);
      return;
    }
    const normalized = normalizeBackup321Input(input);
    if (!normalized) return;
    setInput(normalized);
    setErrors({});
    const nextCalculation = calculatedResult(normalized, result);
    if (!nextCalculation) return;
    setCalculated(nextCalculation);
    setShareUrl("");
    setCopyState("idle");
    setStatus("Backup plan calculated.");
    focusResult.current = true;
  }

  function reset() {
    setInput(defaults());
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    setCopyState("idle");
    setStatus("Plan reset.");
    window.history.replaceState(null, "", window.location.pathname);
    window.setTimeout(() => document.querySelector<HTMLElement>('[data-focus-key="sourceData"]')?.focus(), 0);
  }

  async function copy() {
    if (!calculated) return;
    const didCopy = await copyText(copySummary(calculated.input, calculated.values));
    setCopyState(didCopy ? "copied" : "failed");
    setStatus(didCopy ? "Summary copied." : "Copy failed. UiSelect summary.");
    if (didCopy) window.setTimeout(() => setCopyState("idle"), 1600);
  }

  async function share() {
    if (!calculated) return;
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("state", encodeBackup321State(calculated.input));
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      setShareUrl(url.toString());
      const didCopy = await copyText(url.toString());
      setStatus(didCopy ? "Share URL copied." : "Share copy failed. URL ready.");
    } catch {
      setStatus("Share failed.");
    }
  }

  const textField = (key: InputKey, label: string, inputMode: "decimal" | "numeric" = "decimal") => (
    <UiTextField
      dataFocusKey={key}
      error={errors[key]}
      inputMode={inputMode}
      label={label}
      onChange={(value) => update(key, value)}
      required
      value={input[key] as string}
    />
  );

  const numberField = (key: InputKey, label: string) => (
    <UiTextField
      dataFocusKey={key}
      error={errors[key]}
      inputMode="numeric"
      label={label}
      onChange={(value) => update(key, value)}
      required
      value={input[key] as string}
    />
  );

  return (
    <div aria-label="backup plan inputs and results" className={styles.tool} data-tool-workbench role="region">
      <form className={styles.form} noValidate onSubmit={submit}>
        <section className={styles.formSection}>
          <h2>Protected data and planning</h2>
          <div className={styles.controlGrid}>
            <UiQuantityInput
              ariaLabel="Protected data"
              dataFocusKey="sourceData"
              error={errors.sourceData}
              label="Protected data"
              onChange={(value) => update("sourceData", value)}
              onUnitChange={(value) => update("sourceUnit", value as Backup321SourceUnit)}
              required
              unit={input.sourceUnit}
              unitAriaLabel="Protected data unit"
              units={sourceUnits}
              value={input.sourceData}
            />
            {textField("annualGrowth", "Annual growth (%)")}
            {numberField("horizonYears", "Plan horizon (years)")}
          </div>
        </section>

        <section className={styles.formSection}>
          <h2>Backup policy</h2>
          <UiChoiceGroup
            error={errors.backupModel}
            label="Backup model"
            onChange={(value) => update("backupModel", value as Backup321Model)}
            options={models}
            required
            value={input.backupModel}
          />
          <div className={styles.controlGrid}>
            {numberField("retainedPoints", "Retained points")}
            {textField("changedPerBackup", "Changed data per additional point (%)")}
            {textField("headroom", "Headroom (%)")}
          </div>
        </section>

        <div className={styles.recoveryToggle}>
          <UiCheckbox
            isSelected={input.recoveryChecksEnabled}
            onChange={(selected) => update("recoveryChecksEnabled", selected)}
          >
            Check recovery goals
          </UiCheckbox>
        </div>

        {input.recoveryChecksEnabled ? (
          <section aria-labelledby="recovery-input-heading" className={styles.formSection}>
            <h2 id="recovery-input-heading">Recovery goals</h2>
            <div className={styles.controlGrid}>
              {numberField("backupIntervalHours", "Backup interval (hours)")}
              {numberField("targetRpoHours", "Target RPO (hours)")}
              {numberField("targetRtoHours", "Target RTO (hours)")}
              {textField("localRestoreMbps", "Local restore (Mbps)")}
              {textField("offsiteRestoreMbps", "Off-site restore (Mbps)")}
              {textField("transferEfficiency", "Transfer efficiency (%)")}
            </div>
          </section>
        ) : null}

        <UiChoiceGroup
          label="Show capacities in"
          onChange={(value) => updateDisplayUnit(value as Backup321DisplayUnit)}
          options={displayUnits}
          required
          value={input.displayUnit}
        />

        <div className={styles.formActions}>
          <UiActionRow>
            <UiButton isDisabled={!isHydrated} type="submit" variant="primary">
              Calculate backup plan
            </UiButton>
            <UiButton onPress={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
        </div>
        {status ? <UiStatus tone={status.includes("failed") || status.includes("could not") ? "danger" : "neutral"}>{status}</UiStatus> : null}
      </form>

      {calculated ? (
        <Result calculated={calculated} copyState={copyState} onCopy={copy} onShare={share} shareUrl={shareUrl} />
      ) : null}
    </div>
  );
}
