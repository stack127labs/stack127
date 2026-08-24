"use client";

import {
  Copy,
  Plus,
  RotateCcw,
  Share2,
  Trash2,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type DraftRole = {
  id: string;
  size: string;
  unit: UnraidInputUnit;
};

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
const outputUnits = ["TiB", "TB"] as const;
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

function inputUnitForBytes(bytes: bigint): DraftRole["unit"] {
  if (bytes % TB_BYTES === 0n) return "TB";
  if (bytes % TIB_BYTES === 0n) return "TiB";
  if (bytes % GB_BYTES === 0n) return "GB";
  if (bytes % GIB_BYTES === 0n) return "GiB";
  return "GB";
}

function draftRoleFromInput(role: UnraidRoleInput): DraftRole {
  const unit = inputUnitForBytes(role.capacityBytes);
  const divisor = unit === "TB"
    ? TB_BYTES
    : unit === "TiB"
      ? TIB_BYTES
      : unit === "GB"
        ? GB_BYTES
        : GIB_BYTES;
  if (role.capacityBytes % divisor === 0n) {
    return { id: role.id, size: (role.capacityBytes / divisor).toString(), unit };
  }
  return { id: role.id, size: role.capacityBytes.toString(), unit: "GB" };
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
    if (result.status !== "valid") {
      return {
        draft: defaultDraft(),
        result: null,
        notice: "Shared configuration could not be restored.",
        restored: false,
      };
    }
    return {
      draft: draftFromInput(state.payload),
      result,
      notice: "Shared configuration loaded.",
      restored: true,
    };
  } catch {
    return {
      draft: defaultDraft(),
      result: null,
      notice: "Shared configuration could not be restored.",
      restored: false,
    };
  }
}

function nextRoleId(rows: readonly DraftRole[], prefix: "data" | "parity") {
  const used = new Set(rows.map((row) => row.id));
  let index = rows.length + 1;
  while (used.has(`${prefix}-${index}`)) index += 1;
  return `${prefix}-${index}`;
}

function labelForRole(role: DraftRole, kind: "data" | "parity" | "proposed", index?: number) {
  if (kind === "proposed") return "Proposed data drive";
  return `${kind === "parity" ? "Parity" : "Data"} ${(index ?? 0) + 1}`;
}

function labelForTopology(role: "parity" | "data", index: number) {
  return `${role === "parity" ? "PARITY" : "DATA"} ${index + 1}`;
}

function labelForDependency(id: string) {
  return id.replace(/^parity-(\d+)$/, "Parity $1");
}

function percentage(value: bigint, total: bigint) {
  if (total <= 0n || value <= 0n) return "0%";
  const hundredths = (value * 10_000n) / total;
  return `${Number(hundredths) / 100}%`;
}

function displayCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function compileDraft(draft: DraftState) {
  const errors: Record<string, string> = {};
  const parseRole = (role: DraftRole, roleLabel: string): UnraidRoleInput | null => {
    if (!role.size.trim()) {
      errors[role.id] = "Capacity is required.";
      return null;
    }
    try {
      return { id: role.id, capacityBytes: parseUnraidCapacity(role.size, role.unit).bytes };
    } catch {
      errors[role.id] = `${roleLabel} needs a positive decimal.`;
      return null;
    }
  };

  const parity = draft.parity.map((role, index) => parseRole(role, labelForRole(role, "parity", index)));
  const data = draft.data.map((role, index) => parseRole(role, labelForRole(role, "data", index)));
  if (draft.data.length === 0) errors.data = "Add at least one data drive.";
  const proposed = draft.proposed.size.trim()
    ? parseRole(draft.proposed, "Proposed data drive")
    : null;

  if (Object.keys(errors).length > 0) return { input: null, errors };
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
  for (const item of result.issues) {
    if (item.severity !== "error") continue;
    const key = item.path?.match(/^(parity-\d+|data-\d+|proposed-data-1)$/)?.[1]
      ?? (item.path === "data" ? "data" : "form");
    errors[key] ??= item.message;
  }
  return errors;
}

function errorId(key: string) {
  return `unraid-error-${key.replace(/[^a-z0-9-]/gi, "-")}`;
}

function roleError(errors: Record<string, string>, id: string) {
  return errors[id];
}

function buildSummary(
  result: UnraidCalculationResult,
  unit: "TB" | "TiB",
) {
  if (result.status !== "valid" || !result.values) return "";
  const values = result.values;
  const growth = values.growth.status === "absent"
    ? "No proposed drive"
    : values.growth.status === "eligible"
      ? `Eligible, gain ${formatUnraidBytes(values.growth.capacityGainBytes, unit)}`
      : `Blocked, upgrade ${values.growth.dependencies.map(labelForDependency).join(", ")}`;
  const topologyIndexes = { parity: 0, data: 0 };
  const roles = values.topology
    .map((role) => {
      const index = topologyIndexes[role.role];
      topologyIndexes[role.role] += 1;
      return `${labelForTopology(role.role, index)} ${formatUnraidBytes(role.capacityBytes, unit)}`;
    })
    .join(", ");
  return [
    "Unraid Main Array Calculator",
    `Data capacity: ${formatUnraidBytes(values.dataCapacityBytes.value, unit)}`,
    `Assigned parity: ${formatUnraidBytes(values.assignedParityCapacityBytes.value, unit)}`,
    `Raw installed: ${formatUnraidBytes(values.rawInstalledCapacityBytes.value, unit)}`,
    `Protection: ${values.protection.statement}`,
    `Roles: ${roles}`,
    `Growth: ${growth}`,
    "Formula: unraid-main-array-v1, exact bytes, array-level only.",
  ].join("\n");
}

function InputUnitSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: UnraidInputUnit;
  onChange: (value: UnraidInputUnit) => void;
}) {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value as UnraidInputUnit)}>
      {inputUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
    </select>
  );
}

function AddRowsControl({
  max,
  onChange,
  onSubmit,
  value,
}: {
  max: number;
  onChange: (value: string) => void;
  onSubmit: () => void;
  value: string;
}) {
  if (max < 1) return null;
  return (
    <div className={styles.addRowsControl}>
      <label className={styles.addRowsField}>
        <span>Rows to add</span>
        <input
          aria-label="Data rows to add"
          inputMode="numeric"
          max={max}
          min="1"
          onChange={(event) => onChange(event.target.value)}
          type="number"
          value={value}
        />
      </label>
      <button className={styles.secondaryButton} onClick={onSubmit} type="button">
        <Plus aria-hidden="true" size={17} /> Add rows
      </button>
    </div>
  );
}

export function UnraidCalculator({ initialState }: { initialState: string }) {
  const initial = useMemo(() => initialView(initialState), [initialState]);
  const [draft, setDraft] = useState<DraftState>(() => initial.draft);
  const [result, setResult] = useState<UnraidCalculationResult | null>(() => initial.result);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [outputUnit, setOutputUnit] = useState<"TB" | "TiB">("TiB");
  const [announcement, setAnnouncement] = useState(initial.notice);
  const [recoveryNotice, setRecoveryNotice] = useState(() =>
    initial.notice === "Shared configuration could not be restored." ? initial.notice : "",
  );
  const [copyStatus, setCopyStatus] = useState("");
  const [rowsToAdd, setRowsToAdd] = useState("4");
  const inputRefs = useRef(new Map<string, HTMLInputElement>());
  const addDataButtonRef = useRef<HTMLButtonElement>(null);
  const parityGroupRef = useRef<HTMLDivElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusAfterRender = useRef<string | null>(null);
  const announcedParityMode = useRef<UnraidParityMode | null>(null);

  useEffect(() => {
    if (!initialState || initial.restored) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("state");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [initial.restored, initialState]);

  useEffect(() => {
    const focusKey = focusAfterRender.current;
    if (!focusKey) return;
    focusAfterRender.current = null;
    if (focusKey === "add-data") {
      addDataButtonRef.current?.focus();
    } else {
      inputRefs.current.get(focusKey)?.focus();
    }
  }, [draft]);

  useEffect(() => {
    if (announcedParityMode.current === null) {
      announcedParityMode.current = draft.parityMode;
      return;
    }
    if (announcedParityMode.current === draft.parityMode) return;
    announcedParityMode.current = draft.parityMode;
    const count = draft.parity.length;
    setAnnouncement(draft.parityMode === "none"
      ? "No parity selected. 0 parity drives."
      : `${draft.parityMode} parity selected. ${displayCount(count, "parity drive")}.`);
  }, [draft.parity.length, draft.parityMode]);

  function cleanStateUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("state");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function updateDraft(next: DraftState | ((current: DraftState) => DraftState), focusKey?: string) {
    if (focusKey) focusAfterRender.current = focusKey;
    setDraft(next);
    setResult(null);
    setErrors({});
    setCopyStatus("");
    setAnnouncement("");
    setRecoveryNotice("");
    cleanStateUrl();
  }

  function changeParityMode(mode: UnraidParityMode) {
    updateDraft((current) => {
      const count = mode === "none" ? 0 : mode === "single" ? 1 : 2;
      const parity = Array.from({ length: count }, (_, index) => current.parity[index] ?? blankRole(`parity-${index + 1}`));
      return { ...current, parityMode: mode, parity };
    });
  }

  function updateRole(kind: "parity" | "data" | "proposed", id: string, patch: Partial<DraftRole>) {
    updateDraft((current) => {
      if (kind === "proposed") return { ...current, proposed: { ...current.proposed, ...patch } };
      return {
        ...current,
        [kind]: current[kind].map((role) => role.id === id ? { ...role, ...patch } : role),
      };
    });
  }

  function addDataDrives(requestedCount: number) {
    const available = 64 - draft.parity.length - draft.data.length;
    const count = Math.min(Math.max(1, requestedCount), Math.max(0, available));
    if (count < 1) return;
    let focusKey = "";
    updateDraft((current) => {
      const data = [...current.data];
      for (let index = 0; index < count; index += 1) {
        const id = nextRoleId(data, "data");
        if (!focusKey) focusKey = id;
        data.push(blankRole(id));
      }
      return { ...current, data };
    }, focusKey);
  }

  function addDataDrive() {
    addDataDrives(1);
  }

  function addRequestedDataDrives() {
    const requested = Number.parseInt(rowsToAdd, 10);
    if (!Number.isInteger(requested) || requested < 1) return;
    addDataDrives(requested);
  }

  function removeDataDrive(id: string) {
    const index = draft.data.findIndex((role) => role.id === id);
    if (index < 0) return;
    const focusKey = draft.data[index + 1]?.id ?? draft.data[index - 1]?.id ?? "add-data";
    updateDraft((current) => ({ ...current, data: current.data.filter((role) => role.id !== id) }), focusKey);
  }

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const compiled = compileDraft(draft);
    if (!compiled.input) {
      setResult(null);
      setErrors(compiled.errors);
      setAnnouncement("Fix the marked fields.");
      requestAnimationFrame(() => {
        const firstKey = Object.keys(compiled.errors)[0];
        if (firstKey === "data") addDataButtonRef.current?.focus();
        else if (firstKey) inputRefs.current.get(firstKey)?.focus();
      });
      return;
    }

    const next = calculateUnraidCapacity(compiled.input);
    setResult(next);
    const nextErrors = next.status === "invalid" ? engineErrors(next) : {};
    setErrors(nextErrors);
    if (next.status === "invalid") {
      setAnnouncement("Fix the marked fields.");
      requestAnimationFrame(() => {
        const firstKey = Object.keys(nextErrors)[0];
        if (firstKey) inputRefs.current.get(firstKey)?.focus();
      });
      return;
    }
    setAnnouncement("Data capacity calculated.");
    requestAnimationFrame(() => resultHeadingRef.current?.focus());
  }

  function reset() {
    setDraft(defaultDraft());
    setResult(null);
    setErrors({});
    setCopyStatus("");
    setAnnouncement("");
    setRecoveryNotice("");
    cleanStateUrl();
    requestAnimationFrame(() => parityGroupRef.current?.focus());
  }

  async function copySummary() {
    if (!result || result.status !== "valid") return;
    try {
      await navigator.clipboard.writeText(buildSummary(result, outputUnit));
      setCopyStatus("Summary copied.");
      setAnnouncement("Summary copied.");
    } catch {
      setCopyStatus("Copy failed.");
      setAnnouncement("Copy failed.");
    }
  }

  async function shareConfiguration() {
    const compiled = compileDraft(draft);
    if (!compiled.input) {
      setErrors(compiled.errors);
      setAnnouncement("Fix the marked fields.");
      return;
    }
    const next = calculateUnraidCapacity(compiled.input);
    if (next.status !== "valid") {
      setResult(next);
      setErrors(engineErrors(next));
      setAnnouncement("Fix the marked fields.");
      return;
    }
    setResult(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("state", encodeUnraidState(compiled.input));
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      await navigator.clipboard.writeText(url.href);
      setCopyStatus("Share link copied.");
      setAnnouncement("Share link copied.");
    } catch {
      setCopyStatus("Share failed.");
      setAnnouncement("Share failed.");
    }
  }

  const values = result?.status === "valid" ? result.values : null;
  const errorEntries = Object.entries(errors);
  const display = (bytes: bigint) => formatUnraidBytes(bytes, outputUnit);
  const topologyIndexes = { parity: 0, data: 0 };

  function renderRoleRow(role: DraftRole, kind: "parity" | "data", index: number) {
    const label = labelForRole(role, kind, index);
    const error = roleError(errors, role.id);
    const describedBy = error ? errorId(role.id) : undefined;
    return (
      <div className={styles.roleRow} key={role.id}>
        <label className={styles.field}>
          <span>{label}</span>
          <input
            ref={(element) => {
              if (element) inputRefs.current.set(role.id, element);
              else inputRefs.current.delete(role.id);
            }}
            aria-describedby={describedBy}
            aria-invalid={error ? "true" : undefined}
            aria-label={`${label} capacity`}
            inputMode="decimal"
            onChange={(event) => updateRole(kind, role.id, { size: event.target.value })}
            type="text"
            value={role.size}
          />
          {error ? <span className={styles.fieldError} id={describedBy}>{error}</span> : null}
        </label>
        <label className={styles.field}>
          <span>Unit</span>
          <InputUnitSelect
            label={`${label} unit`}
            onChange={(unit) => updateRole(kind, role.id, { unit })}
            value={role.unit}
          />
        </label>
        <span className={styles.resultUnitLabel}>{role.id}</span>
        {kind === "data" ? (
          <button
            aria-label={`Remove ${label}`}
            className={styles.removeButton}
            onClick={() => removeDataDrive(role.id)}
            type="button"
          >
            <Trash2 aria-hidden="true" size={17} /> Remove
          </button>
        ) : <span aria-hidden="true" />}
      </div>
    );
  }

  return (
    <section aria-label="Unraid Main Array calculator inputs and results" className={styles.tool}>
      <form className={styles.form} noValidate onSubmit={submit}>
        <fieldset className={styles.fieldset}>
          <legend>Parity protection</legend>
          <div
            aria-label="Parity protection"
            className={`${styles.choiceRow} ${styles.parityGroup}`}
            ref={parityGroupRef}
            role="radiogroup"
            tabIndex={-1}
          >
            {(["none", "single", "dual"] as const).map((mode) => (
              <label className={styles.choice} key={mode}>
                <input
                  checked={draft.parityMode === mode}
                  name="parity-mode"
                  onChange={() => changeParityMode(mode)}
                  type="radio"
                  value={mode}
                />
                <span>{mode[0].toUpperCase() + mode.slice(1)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <section aria-labelledby="parity-drives-title">
          <div className={styles.sectionHeading}>
            <h3 id="parity-drives-title">Parity drives</h3>
            <span>{displayCount(draft.parity.length, "drive")}</span>
          </div>
          <div className={styles.roleRows}>
            {draft.parity.map((role, index) => renderRoleRow(role, "parity", index))}
          </div>
        </section>

        <section aria-labelledby="data-drives-title">
          <div className={styles.sectionHeading}>
            <h3 id="data-drives-title">Data drives</h3>
            <span>{displayCount(draft.data.length, "drive")}</span>
          </div>
          {draft.data.length > 0 ? (
            <div className={styles.roleRows}>{draft.data.map((role, index) => renderRoleRow(role, "data", index))}</div>
          ) : (
            <div className={styles.emptyState}>
              <p>No data drives yet.</p>
              <div className={styles.addRowsActions}>
                <button
                  className={styles.secondaryButton}
                  onClick={addDataDrive}
                  ref={addDataButtonRef}
                  type="button"
                >
                  <Plus aria-hidden="true" size={17} /> Add data drive
                </button>
                <AddRowsControl
                  max={64 - draft.parity.length - draft.data.length}
                  onChange={setRowsToAdd}
                  onSubmit={addRequestedDataDrives}
                  value={rowsToAdd}
                />
              </div>
            </div>
          )}
          {draft.data.length > 0 ? (
            <div className={styles.addRowsActions}>
              <button className={styles.secondaryButton} onClick={addDataDrive} ref={addDataButtonRef} type="button">
                <Plus aria-hidden="true" size={17} /> Add data drive
              </button>
              <AddRowsControl
                max={64 - draft.parity.length - draft.data.length}
                onChange={setRowsToAdd}
                onSubmit={addRequestedDataDrives}
                value={rowsToAdd}
              />
            </div>
          ) : null}
          {errors.data ? <p className={styles.fieldError} id={errorId("data")}>{errors.data}</p> : null}
        </section>

        <section aria-labelledby="proposed-drive-title">
          <div className={styles.sectionHeading}>
            <h3 id="proposed-drive-title">Proposed data drive</h3>
            <span>Optional</span>
          </div>
          <div className={styles.roleRow}>
            <label className={styles.field}>
              <span>Future data</span>
              <input
                aria-describedby={roleError(errors, draft.proposed.id) ? errorId(draft.proposed.id) : undefined}
                aria-invalid={roleError(errors, draft.proposed.id) ? "true" : undefined}
                aria-label="Proposed data drive capacity"
                inputMode="decimal"
                onChange={(event) => updateRole("proposed", draft.proposed.id, { size: event.target.value })}
                type="text"
                value={draft.proposed.size}
              />
              {roleError(errors, draft.proposed.id) ? (
                <span className={styles.fieldError} id={errorId(draft.proposed.id)}>{errors[draft.proposed.id]}</span>
              ) : null}
            </label>
            <label className={styles.field}>
              <span>Unit</span>
              <InputUnitSelect
                label="Proposed data drive unit"
                onChange={(unit) => updateRole("proposed", draft.proposed.id, { unit })}
                value={draft.proposed.unit}
              />
            </label>
          </div>
        </section>

        {errorEntries.length > 0 ? (
          <div className={styles.errorSummary} role="alert">
            <p>Fix the marked fields.</p>
            <ul className={styles.errorList}>
              {errorEntries.map(([key, message]) => <li key={key}>{message}</li>)}
            </ul>
          </div>
        ) : null}

        <div className={styles.actions}>
          <div className={styles.actionGroup}>
            <button className={styles.primaryButton} disabled={draft.data.length === 0} type="submit">
              Calculate capacity
            </button>
            <button className={styles.secondaryButton} onClick={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} /> Reset
            </button>
          </div>
        </div>
      </form>

      {recoveryNotice ? (
        <p aria-live="polite" className={styles.recoveryNotice} data-testid="state-notice">
          {recoveryNotice}
        </p>
      ) : null}
      <div aria-live="polite" className={styles.visuallyHidden} role="status">{announcement}</div>

      {values ? (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <div>
              <h2 ref={resultHeadingRef} tabIndex={-1}>{display(values.dataCapacityBytes.value)} data capacity</h2>
              <p className={styles.resultHeadlineNote}>Array-level result.</p>
              <p className={styles.resultMeta}>
                {displayCount(draft.data.length, "data drive")} + {displayCount(draft.parity.length, "parity")} · {display(values.rawInstalledCapacityBytes.value)} raw
              </p>
            </div>
            <fieldset className={styles.resultUnit}>
              <legend>Result unit</legend>
              <span className={styles.resultUnitLabel}>Display only</span>
              <div className={styles.unitChoiceRow}>
                {outputUnits.map((unit) => (
                  <label className={styles.unitChoice} key={unit}>
                    <input
                      checked={outputUnit === unit}
                      name="result-unit"
                      onChange={() => setOutputUnit(unit)}
                      type="radio"
                      value={unit}
                    />
                    <span>{unit}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <section aria-labelledby="capacity-accounting-title" className={styles.resultSection} data-testid="capacity-accounting">
            <div className={styles.sectionHeading}>
              <h3 id="capacity-accounting-title">Capacity accounting</h3>
              <span>{display(values.rawInstalledCapacityBytes.value)} raw</span>
            </div>
            <div
              aria-label={`Data ${display(values.dataCapacityBytes.value)}, assigned parity ${display(values.assignedParityCapacityBytes.value)}, raw ${display(values.rawInstalledCapacityBytes.value)}`}
              className={styles.capacityBar}
              role="img"
            >
              <span className={styles.dataSegment} style={{ width: percentage(values.dataCapacityBytes.value, values.rawInstalledCapacityBytes.value) }} />
              <span className={styles.paritySegment} style={{ width: percentage(values.assignedParityCapacityBytes.value, values.rawInstalledCapacityBytes.value) }} />
            </div>
            <dl className={styles.capacityValues}>
              <div><dt>Data capacity</dt><dd>{display(values.dataCapacityBytes.value)}</dd></div>
              <div><dt>Assigned parity capacity</dt><dd>{display(values.assignedParityCapacityBytes.value)}</dd></div>
              <div><dt>Raw installed capacity</dt><dd>{display(values.rawInstalledCapacityBytes.value)}</dd></div>
            </dl>
            <p className={styles.accountingNote}>Data plus parity equals raw.</p>
          </section>

          <section aria-labelledby="array-facts-title" className={styles.resultSection}>
            <div className={styles.sectionHeading}><h3 id="array-facts-title">Array facts</h3></div>
            <dl className={styles.facts}>
              <div><dt>Largest data drive</dt><dd>{display(values.largestDataDriveBytes)}</dd></div>
              <div><dt>Parity ceiling</dt><dd>{values.parityFloorBytes === null ? "None" : display(values.parityFloorBytes)}</dd></div>
              <div><dt>Parity headroom</dt><dd>{display(values.parityHeadroomBytes)}</dd></div>
              <div><dt>Protection</dt><dd>{values.protection.statement}</dd></div>
            </dl>
          </section>

          <section aria-labelledby="role-topology-title" className={styles.resultSection} data-testid="role-topology">
            <div className={styles.sectionHeading}><h3 id="role-topology-title">Assigned roles</h3></div>
            <div className={styles.roleTableWrap}>
              <table className={styles.roleTable}>
                <caption className={styles.visuallyHidden}>Assigned roles</caption>
                <thead><tr><th scope="col">Role</th><th scope="col">ID</th><th scope="col">Capacity</th></tr></thead>
                <tbody>
                  {values.topology.map((role) => {
                    const index = topologyIndexes[role.role];
                    topologyIndexes[role.role] += 1;
                    return (
                      <tr key={role.id}>
                        <td data-label="Role">{labelForTopology(role.role, index)}</td>
                        <td data-label="ID">{role.id}</td>
                        <td data-label="Capacity">{display(role.capacityBytes)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {values.growth.status !== "absent" ? (
            <section className={styles.growth} data-status={values.growth.status} data-testid="growth-status">
              <h3>Growth {values.growth.status}</h3>
              <p>{display(values.growth.proposedCapacityBytes)} proposed data drive.</p>
              {values.growth.status === "eligible" ? (
                <>
                  <p>Eligible. Gain {display(values.growth.capacityGainBytes)}.</p>
                  <p>Projected data {display(values.growth.projectedDataCapacityBytes)}.</p>
                  <p>Projected raw {display(values.growth.projectedRawInstalledCapacityBytes)}.</p>
                </>
              ) : (
                <>
                  <p>Upgrade each undersized parity drive.</p>
                  <ul className={styles.dependencyList}>
                    {values.growth.dependencies.map((dependency) => <li key={dependency}>{labelForDependency(dependency)}</li>)}
                  </ul>
                  <p className={styles.growthNote}>Then add the proposed drive.</p>
                </>
              )}
            </section>
          ) : null}

          <details className={styles.method}>
            <summary>Formula details</summary>
            <ul className={styles.methodList}>
              <li>Formula v1.</li>
              <li>Data capacity = sum of current data drives.</li>
              <li>Assigned parity = sum of current parity drives.</li>
              <li>Raw installed = data capacity + assigned parity.</li>
              <li>Parity ceiling = the smallest current parity drive.</li>
              <li>Parity headroom is assigned parity space, not extra data capacity.</li>
              <li>Exact byte math. TB = 10^12 bytes; TiB = 2^40 bytes.</li>
              <li>Array-level only.</li>
              <li>Parity is not backup.</li>
              <li>Filesystem space remains unknown.</li>
            </ul>
            <p>Sources:</p>
            <p>
              <a href="https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/">Unraid array overview</a>{" "}
              and <a href="https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/">adding disks</a>.{" "}
              Unit references: <a href="https://www.bipm.org/en/measurement-units/si-prefixes">SI prefixes</a>{" "}
              and <a href="https://physics.nist.gov/cuu/Units/binary.html">binary prefixes</a>.
            </p>
          </details>

          <div className={styles.actionGroup}>
            <button className={styles.secondaryButton} onClick={copySummary} type="button">
              <Copy aria-hidden="true" size={17} /> Copy summary
            </button>
            <button className={styles.secondaryButton} onClick={shareConfiguration} type="button">
              <Share2 aria-hidden="true" size={17} /> Share configuration
            </button>
            {copyStatus ? <span aria-live="polite" className={styles.copyStatus}>{copyStatus}</span> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
