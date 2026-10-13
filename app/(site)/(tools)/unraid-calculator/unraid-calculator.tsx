"use client";

import { UiButton, UiChoiceGroup, UiDisclosure, UiQuantityInput, UiRepeatableList, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import { RotateCcw } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  calculateUnraidCapacity,
  decodeUnraidState,
  encodeUnraidState,
  formatUnraidBytes,
  parseUnraidCapacity,
  type UnraidCalculationResult,
  type UnraidCalculatorInput,
  type UnraidInputUnit,
  type UnraidParityMode,
  type UnraidRoleInput,
} from "./unraid-calculator-engine";
import styles from "./unraid-calculator.module.css";

type DraftRole = { id: string; size: string; unit: UnraidInputUnit };
type DraftState = {
  parityMode: UnraidParityMode;
  parity: DraftRole[];
  data: DraftRole[];
  proposed: DraftRole;
};
type InitialView = {
  draft: DraftState;
  result: UnraidCalculationResult | null;
  notice: string;
  restored: boolean;
};

const inputUnits: readonly UnraidInputUnit[] = ["TB", "GB", "TiB", "GiB"];
const inputUnitOptions = inputUnits.map((unit) => uiOption(unit, unit));
const outputUnitOptions = [uiOption("TiB", "TiB"), uiOption("TB", "TB")];
const parityOptions = [
  uiOption("none", "None"),
  uiOption("single", "Single parity"),
  uiOption("dual", "Dual parity"),
];
const TB_BYTES = 1_000_000_000_000n;
const TIB_BYTES = 1_099_511_627_776n;
const GB_BYTES = 1_000_000_000n;
const GIB_BYTES = 1_073_741_824n;

function blankRole(id: string): DraftRole {
  return { id, size: "", unit: "TB" };
}

function defaultDraft(): DraftState {
  return {
    parityMode: "single",
    parity: [blankRole("parity-1")],
    data: [],
    proposed: blankRole("proposed-data-1"),
  };
}

function inputUnitForBytes(bytes: bigint): UnraidInputUnit {
  if (bytes % TB_BYTES === 0n) return "TB";
  if (bytes % TIB_BYTES === 0n) return "TiB";
  if (bytes % GB_BYTES === 0n) return "GB";
  return "GiB";
}

function decimalForBytes(bytes: bigint, divisor: bigint, fractionDigits: number) {
  const whole = bytes / divisor;
  const fraction = (bytes % divisor).toString().padStart(fractionDigits, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function draftRoleFromInput(role: UnraidRoleInput): DraftRole {
  const unit = inputUnitForBytes(role.capacityBytes);
  const divisor = unit === "TB" ? TB_BYTES : unit === "TiB" ? TIB_BYTES : unit === "GB" ? GB_BYTES : GIB_BYTES;
  return {
    id: role.id,
    size: role.capacityBytes % divisor === 0n
      ? (role.capacityBytes / divisor).toString()
      : decimalForBytes(role.capacityBytes, GB_BYTES, 9),
    unit: role.capacityBytes % divisor === 0n ? unit : "GB",
  };
}

function draftFromInput(input: UnraidCalculatorInput): DraftState {
  return {
    parityMode: input.parityMode,
    parity: input.parity.map(draftRoleFromInput),
    data: input.data.map(draftRoleFromInput),
    proposed: input.proposed ? draftRoleFromInput(input.proposed) : blankRole("proposed-data-1"),
  };
}

function initialView(encoded: string): InitialView {
  if (!encoded) return { draft: defaultDraft(), result: null, notice: "", restored: false };
  try {
    const state = decodeUnraidState(encoded);
    const result = calculateUnraidCapacity(state.payload);
    if (result.status !== "valid") throw new Error("restore");
    return { draft: draftFromInput(state.payload), result, notice: "Shared configuration loaded.", restored: true };
  } catch {
    return {
      draft: defaultDraft(),
      result: null,
      notice: "Shared configuration could not be restored.",
      restored: false,
    };
  }
}

function nextRoleId(rows: readonly DraftRole[]) {
  const used = new Set(rows.map((row) => row.id));
  let index = rows.length + 1;
  while (used.has(`data-${index}`)) index += 1;
  return `data-${index}`;
}

function displayCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function compileDraft(draft: DraftState) {
  const errors: Record<string, string> = {};
  const parseRole = (role: DraftRole): UnraidRoleInput | null => {
    if (!role.size.trim()) {
      errors[role.id] = "Capacity is required.";
      return null;
    }
    try {
      return { id: role.id, capacityBytes: parseUnraidCapacity(role.size, role.unit).bytes };
    } catch (error) {
      errors[role.id] = error instanceof Error ? error.message : "Enter a positive decimal capacity.";
      return null;
    }
  };
  const parity = draft.parity.map(parseRole);
  const data = draft.data.map(parseRole);
  if (draft.data.length === 0) errors.data = "Add at least one data drive.";
  const proposed = draft.proposed.size.trim() ? parseRole(draft.proposed) : null;
  if (Object.keys(errors).length) return { input: null, errors };
  return {
    input: {
      parityMode: draft.parityMode,
      parity: parity as UnraidRoleInput[],
      data: data as UnraidRoleInput[],
      proposed,
    } satisfies UnraidCalculatorInput,
    errors,
  };
}

function engineErrors(result: UnraidCalculationResult) {
  const errors: Record<string, string> = {};
  for (const issue of result.issues) {
    if (issue.severity !== "error") continue;
    const key = issue.path?.match(/^(parity-\d+|data-\d+|proposed-data-1)$/)?.[1]
      ?? (issue.path === "data" ? "data" : "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

function dependencyLabel(id: string) {
  return id.replace(/^parity-(\d+)$/, "Parity $1");
}

function protectionLabel(mode: UnraidParityMode, failures: number) {
  if (mode === "none") return "No parity";
  return `${failures} drive${failures === 1 ? "" : "s"}`;
}

function buildSummary(result: UnraidCalculationResult, unit: "TB" | "TiB") {
  if (result.status !== "valid" || !result.values) return "";
  const values = result.values;
  const growth = values.growth.status === "absent"
    ? "Not planned"
    : values.growth.status === "eligible"
      ? `Fits, projected capacity ${formatUnraidBytes(values.growth.projectedDataCapacityBytes, unit)}`
      : `Blocked, upgrade ${values.growth.dependencies.map(dependencyLabel).join(", ")}`;
  return [
    `Current data capacity: ${formatUnraidBytes(values.dataCapacityBytes.value, unit)}`,
    `Protection: ${protectionLabel(values.protection.mode, values.protection.guaranteedFailures)}`,
    `Parity ceiling: ${values.parityFloorBytes === null ? "None" : formatUnraidBytes(values.parityFloorBytes, unit)}`,
    `Future drive: ${growth}`,
  ].join("\n");
}

export function UnraidCalculator({ initialState }: { initialState: string }) {
  const initial = useMemo(() => initialView(initialState), [initialState]);
  const [draft, setDraft] = useState<DraftState>(() => initial.draft);
  const [result, setResult] = useState<UnraidCalculationResult | null>(() => initial.result);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [outputUnit, setOutputUnit] = useState<"TB" | "TiB">("TiB");
  const [status, setStatus] = useState(initial.notice);
  const [shareUrl, setShareUrl] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function cleanStateUrl() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("state")) return;
    url.searchParams.delete("state");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  useEffect(() => {
    if (!initialState || initial.restored) return;
    cleanStateUrl();
  }, [initial.restored, initialState]);

  function updateDraft(update: DraftState | ((current: DraftState) => DraftState)) {
    setDraft(update);
    setResult(null);
    setErrors({});
    setStatus("");
    setShareUrl("");
    cleanStateUrl();
  }

  function changeParityMode(mode: UnraidParityMode) {
    updateDraft((current) => {
      const count = mode === "none" ? 0 : mode === "single" ? 1 : 2;
      return {
        ...current,
        parityMode: mode,
        parity: Array.from({ length: count }, (_, index) => current.parity[index] ?? blankRole(`parity-${index + 1}`)),
      };
    });
  }

  function updateRole(kind: "parity" | "data" | "proposed", id: string, patch: Partial<DraftRole>) {
    updateDraft((current) => kind === "proposed"
      ? { ...current, proposed: { ...current.proposed, ...patch } }
      : { ...current, [kind]: current[kind].map((role) => role.id === id ? { ...role, ...patch } : role) });
  }

  function addDataDrive() {
    if (draft.parity.length + draft.data.length >= 64) return;
    updateDraft((current) => ({ ...current, data: [...current.data, blankRole(nextRoleId(current.data))] }));
  }

  function removeDataDrive(id: string) {
    updateDraft((current) => ({ ...current, data: current.data.filter((role) => role.id !== id) }));
  }

  function focusError(key: string | undefined) {
    requestAnimationFrame(() => {
      if (key === "data") formRef.current?.querySelector<HTMLButtonElement>("[data-add-data] button")?.focus();
      else if (key) formRef.current?.querySelector<HTMLInputElement>(`[data-focus-key="${key}"]`)?.focus();
    });
  }

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const compiled = compileDraft(draft);
    if (!compiled.input) {
      setResult(null);
      setErrors(compiled.errors);
      setStatus("Fix the marked fields.");
      focusError(Object.keys(compiled.errors)[0]);
      return;
    }
    const next = calculateUnraidCapacity(compiled.input);
    if (next.status !== "valid") {
      const nextErrors = engineErrors(next);
      setResult(null);
      setErrors(nextErrors);
      setStatus("Fix the marked fields.");
      focusError(Object.keys(nextErrors)[0]);
      return;
    }
    setErrors({});
    setResult(next);
    setStatus("Data capacity calculated.");
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  function reset() {
    setDraft(defaultDraft());
    setResult(null);
    setErrors({});
    setStatus("");
    setShareUrl("");
    cleanStateUrl();
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input[type="radio"][value="single"]')?.focus());
  }

  async function copySummary() {
    if (!result || result.status !== "valid") return;
    try {
      await navigator.clipboard.writeText(buildSummary(result, outputUnit));
      setStatus("Summary copied.");
    } catch {
      setStatus("Copy failed.");
    }
  }

  async function shareConfiguration() {
    const compiled = compileDraft(draft);
    if (!compiled.input) {
      setErrors(compiled.errors);
      setStatus("Fix the marked fields.");
      focusError(Object.keys(compiled.errors)[0]);
      return;
    }
    const next = calculateUnraidCapacity(compiled.input);
    if (next.status !== "valid") {
      const nextErrors = engineErrors(next);
      setErrors(nextErrors);
      setStatus("Fix the marked fields.");
      focusError(Object.keys(nextErrors)[0]);
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("state", encodeUnraidState(compiled.input));
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setShareUrl(url.href);
    try {
      await navigator.clipboard.writeText(url.href);
      setStatus("Share link copied.");
    } catch {
      setStatus("Share link ready. Copy it from the field below.");
    }
  }

  const values = result?.status === "valid" ? result.values : null;
  const growth = values?.growth ?? null;
  const display = (bytes: bigint) => formatUnraidBytes(bytes, outputUnit);
  const topologyIndexes = { parity: 0, data: 0 };

  return (
    <section aria-label="Unraid Main Array calculator inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <UiChoiceGroup
          label="Parity protection"
          onChange={(value) => changeParityMode(value as UnraidParityMode)}
          options={parityOptions}
          required
          value={draft.parityMode}
        />

        {draft.parity.length ? (
          <section aria-labelledby="parity-drives-title" className={styles.inventorySection}>
            <div className={styles.sectionHeading}>
              <h2 id="parity-drives-title">Parity drives</h2>
              <span>{displayCount(draft.parity.length, "drive")}</span>
            </div>
            <div className={styles.fixedRows}>
              {draft.parity.map((role, index) => {
                const label = `Parity ${index + 1}`;
                return (
                  <div className={styles.driveEditor} key={role.id}>
                    <span aria-hidden="true" className={styles.driveNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <UiQuantityInput
                      ariaLabel={`${label} capacity`}
                      dataFocusKey={role.id}
                      error={errors[role.id]}
                      hideLabel
                      label={`${label} capacity`}
                      onChange={(size) => updateRole("parity", role.id, { size })}
                      onUnitChange={(unit) => updateRole("parity", role.id, { unit: unit as UnraidInputUnit })}
                      placeholder="8"
                      required
                      unit={role.unit}
                      unitAriaLabel={`${label} unit`}
                      units={inputUnitOptions}
                      value={role.size}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="data-drives-title" className={styles.inventorySection}>
          <div className={styles.sectionHeading}>
            <h2 id="data-drives-title">Data drives <span aria-hidden="true" className={styles.requiredMark}>*</span></h2>
            <span>{displayCount(draft.data.length, "drive")}</span>
          </div>
          <div data-add-data>
            <UiRepeatableList
              addDisabled={draft.parity.length + draft.data.length >= 64}
              addLabel="Add data drive"
              ariaLabel="Data drives"
              items={draft.data}
              onAdd={addDataDrive}
              onRemove={removeDataDrive}
              removeLabel={(_, index) => `Remove data drive ${index + 1}`}
              renderItem={(role, index) => {
                const label = `Data ${index + 1}`;
                return (
                  <div className={styles.driveEditor}>
                    <span aria-hidden="true" className={styles.driveNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <UiQuantityInput
                      ariaLabel={`${label} capacity`}
                      dataFocusKey={role.id}
                      error={errors[role.id]}
                      hideLabel
                      label={`${label} capacity`}
                      onChange={(size) => updateRole("data", role.id, { size })}
                      onUnitChange={(unit) => updateRole("data", role.id, { unit: unit as UnraidInputUnit })}
                      placeholder="8"
                      required
                      unit={role.unit}
                      unitAriaLabel={`${label} unit`}
                      units={inputUnitOptions}
                      value={role.size}
                    />
                  </div>
                );
              }}
            />
          </div>
          {errors.data ? <p className={styles.fieldError} role="alert">{errors.data}</p> : null}
        </section>

        <UiDisclosure label="Plan a future data drive">
          <div className={styles.futureField}>
            <UiQuantityInput
              ariaLabel="Future data drive capacity"
              dataFocusKey={draft.proposed.id}
              error={errors[draft.proposed.id]}
              label="Future data drive"
              onChange={(size) => updateRole("proposed", draft.proposed.id, { size })}
              onUnitChange={(unit) => updateRole("proposed", draft.proposed.id, { unit: unit as UnraidInputUnit })}
              placeholder="12"
              unit={draft.proposed.unit}
              unitAriaLabel="Future data drive unit"
              units={inputUnitOptions}
              value={draft.proposed.size}
            />
          </div>
        </UiDisclosure>

        {errors.form ? <p className={styles.fieldError} role="alert">{errors.form}</p> : null}
        <UiActionRow>
          <UiButton type="submit" variant="primary">Calculate capacity</UiButton>
          <UiButton onPress={reset} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={17} /> Reset
          </UiButton>
        </UiActionRow>
        {status ? (
          <div data-testid={initialState && !initial.restored ? "state-notice" : undefined}>
            <UiStatus tone={status.includes("failed") || status.includes("could not") ? "danger" : "neutral"}>{status}</UiStatus>
          </div>
        ) : null}
      </form>

      {values ? (
        <div aria-label="Unraid capacity result" className={styles.result} ref={resultRef} tabIndex={-1}>
          <div className={styles.resultUnit}>
            <UiChoiceGroup
              label="Result unit"
              onChange={(unit) => setOutputUnit(unit as "TB" | "TiB")}
              options={outputUnitOptions}
              value={outputUnit}
            />
          </div>
          <div data-testid="primary-capacity">
            <UiPrimaryResult
              detail={`${displayCount(draft.data.length, "data drive")} · ${displayCount(draft.parity.length, "parity drive")}`}
              label="Current data capacity"
              value={display(values.dataCapacityBytes.value)}
            />
          </div>

          <UiKeyValueList rows={[
            { label: "Protection", value: protectionLabel(values.protection.mode, values.protection.guaranteedFailures) },
            { label: "Parity ceiling", value: values.parityFloorBytes === null ? "None" : display(values.parityFloorBytes) },
          ]} />

          <section aria-labelledby="capacity-accounting-title" className={styles.resultSection} data-testid="capacity-accounting">
            <h3 id="capacity-accounting-title">Installed allocation</h3>
            <UiAllocationBar
              ariaLabel="Installed capacity allocation"
              formatValue={(value) => display(value as bigint)}
              palette="accent"
              segments={[
                { id: "data", label: "Data", tone: "accent", value: values.dataCapacityBytes.value },
                { id: "parity", label: "Assigned parity", tone: "strong", value: values.assignedParityCapacityBytes.value },
              ]}
              total={values.rawInstalledCapacityBytes.value}
            />
          </section>

          {growth && growth.status !== "absent" ? (
            <section className={styles.resultSection} data-testid="growth-status">
              <h3>Future drive</h3>
              {growth.status === "eligible" ? (
                <>
                  <UiStatus tone="success">Fits the current parity ceiling</UiStatus>
                  <UiKeyValueList rows={[
                    { label: "Capacity gain", value: display(growth.capacityGainBytes) },
                    { label: "Projected data capacity", value: display(growth.projectedDataCapacityBytes) },
                  ]} />
                </>
              ) : (
                <>
                  <UiStatus tone="warning">Parity upgrade required</UiStatus>
                  <ol className={styles.dependencyList}>
                    {growth.dependencies.map((dependency) => (
                      <li key={dependency}>Upgrade {dependencyLabel(dependency)} to at least {display(growth.proposedCapacityBytes)}</li>
                    ))}
                    <li>Add the future data drive</li>
                  </ol>
                </>
              )}
            </section>
          ) : null}

          <UiDisclosure label="Assigned drives">
            <UiDataTable
              ariaLabel="Assigned drives"
              columns={[
                { id: "role", label: "Role" },
                { id: "id", label: "ID" },
                { id: "capacity", label: "Capacity" },
              ]}
              rows={values.topology.map((role) => {
                const index = topologyIndexes[role.role];
                topologyIndexes[role.role] += 1;
                return {
                  id: role.id,
                  cells: {
                    role: `${role.role === "parity" ? "Parity" : "Data"} ${index + 1}`,
                    id: role.id,
                    capacity: display(role.capacityBytes),
                  },
                };
              })}
            />
          </UiDisclosure>

          <UiDisclosure label="Formula and sources">
            <div className={styles.method}>
              <p>Data capacity = sum of current data drives.</p>
              <p>Parity ceiling = the smallest assigned parity drive.</p>
              <p>TB = 10^12 bytes; TiB = 2^40 bytes. Calculations use exact bytes.</p>
              <p>
                <a href="https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/">Unraid array overview</a>
                {" · "}
                <a href="https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/">Adding disks</a>
              </p>
            </div>
          </UiDisclosure>

          <UiActionRow>
            <UiButton onPress={copySummary}>Copy summary</UiButton>
            <UiButton onPress={shareConfiguration}>Share configuration</UiButton>
          </UiActionRow>
          {shareUrl ? <UiTextField label="Shared configuration URL" readOnly value={shareUrl} /> : null}
        </div>
      ) : null}
    </section>
  );
}
