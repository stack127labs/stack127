"use client";

import { Copy, HardDrive, Plus, RotateCcw, Share2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MAX_SHR_DRIVES,
  calculateShrCapacity,
  decodeShrState,
  encodeShrState,
  formatCapacity,
  formatPercent,
  parseCapacity,
  type ShrCapacityUnit,
  type ShrCalculationResult,
  type ShrInput,
  type ShrMode,
  type ShrValues,
} from "./shr-capacity";
import styles from "./shr-calculator.module.css";

type InputUnit = ShrCapacityUnit;
type OutputUnit = "TB" | "TiB";

type DriveRow = {
  id: string;
  size: string;
  unit: InputUnit;
};

type EditorState = {
  mode: ShrMode;
  drives: DriveRow[];
};

type CalculatedState = {
  input: ShrInput;
  values: ShrValues;
  comparison: ShrValues | null;
};

type CompileResult = {
  input: ShrInput | null;
  errors: Record<string, string>;
  firstError: string | null;
};

const inputUnits: readonly InputUnit[] = ["TB", "GB", "TiB", "GiB"];

function emptyEditor(): EditorState {
  return { mode: "shr1", drives: [] };
}

function decimalForBytes(bytes: bigint, factor: bigint, fractionDigits: number): string {
  const whole = bytes / factor;
  const fraction = (bytes % factor).toString().padStart(fractionDigits, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function capacityForDisplay(bytes: bigint): Pick<DriveRow, "size" | "unit"> {
  const units: readonly (readonly [InputUnit, bigint])[] = [
    ["TB", 1_000_000_000_000n],
    ["TiB", 1_099_511_627_776n],
    ["GB", 1_000_000_000n],
    ["GiB", 1_073_741_824n],
  ];
  for (const [unit, factor] of units) {
    if (bytes % factor === 0n) return { size: (bytes / factor).toString(), unit };
  }
  return { size: decimalForBytes(bytes, 1_000_000_000n, 9), unit: "GB" };
}

function editorFromInput(input: ShrInput): EditorState {
  return {
    mode: input.mode,
    drives: input.drives.map((drive) => ({ id: drive.id, ...capacityForDisplay(drive.capacityBytes) })),
  };
}

function nextDriveNumber(rows: readonly DriveRow[]): number {
  return rows.reduce((highest, row) => {
    const match = /^drive-(\d+)$/.exec(row.id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0) + 1;
}

function compileEditor(editor: EditorState): CompileResult {
  const errors: Record<string, string> = {};
  let firstError: string | null = null;
  const addError = (key: string, message: string) => {
    if (!errors[key]) errors[key] = message;
    firstError ??= key;
  };

  const drives = editor.drives.map((drive) => {
    const key = `capacity-${drive.id}`;
    if (!drive.size.trim()) {
      addError(key, "Capacity is required.");
      return { id: drive.id, capacityBytes: 0n };
    }
    try {
      return { id: drive.id, capacityBytes: parseCapacity(drive.size, drive.unit) };
    } catch (error) {
      addError(key, error instanceof Error ? error.message : "Enter a plain decimal capacity.");
      return { id: drive.id, capacityBytes: 0n };
    }
  });

  if (Object.keys(errors).length > 0) return { input: null, errors, firstError };
  return { input: { mode: editor.mode, drives }, errors, firstError };
}

function mapCalculationIssues(result: ShrCalculationResult, input: ShrInput | null): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of result.issues) {
    if (issue.severity !== "error") continue;
    const driveMatch = /^drives\.(\d+)/.exec(issue.path);
    if (driveMatch && input) {
      const drive = input.drives[Number(driveMatch[1])];
      errors[drive ? `capacity-${drive.id}` : "inventory"] = issue.message;
    } else {
      errors.inventory = issue.message;
    }
  }
  return errors;
}

function displayValue(bytes: bigint, unit: OutputUnit): string {
  const formatted = formatCapacity(bytes, unit, 2);
  return bytes > 0n && /^0(?:\.0+)?$/.test(formatted) ? `<0.01 ${unit}` : `${formatted} ${unit}`;
}

function formatBarWidth(bytes: bigint, raw: bigint): string {
  return formatPercent(bytes, raw).replace(/^</, "");
}

function resultSummary(calculated: CalculatedState, unit: OutputUnit): string {
  const { values } = calculated;
  return [
    `Synology ${values.mode === "shr1" ? "SHR-1" : "SHR-2"} capacity estimate`,
    `Drives: ${values.driveCount}`,
    `Estimated pool capacity: ${displayValue(values.estimatedPoolCapacityBytes, unit)}`,
    `Protection: ${displayValue(values.protectionBytes, unit)}`,
    `Unused: ${displayValue(values.unusedBytes, unit)}`,
    "Fresh pool model only",
  ].join("\n");
}

function DriveRows({
  rows,
  errors,
  onChange,
  onRemove,
}: {
  rows: readonly DriveRow[];
  errors: Readonly<Record<string, string>>;
  onChange: (id: string, patch: Partial<DriveRow>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={styles.driveTable}>
      <div aria-hidden="true" className={styles.driveHeader}>
        <span>Drive</span>
        <span>Capacity</span>
        <span>Unit</span>
        <span />
      </div>
      {rows.map((drive, index) => {
        const label = `Drive ${index + 1}`;
        const error = errors[`capacity-${drive.id}`];
        return (
          <div className={styles.driveRow} data-testid={`drive-row-${drive.id}`} key={drive.id}>
            <span className={styles.driveNumber}>{String(index + 1).padStart(2, "0")}</span>
            <label>
              <span className={styles.visuallyHidden}>{label} capacity</span>
              <input
                aria-describedby={error ? `error-${drive.id}` : undefined}
                aria-invalid={Boolean(error)}
                aria-label={`${label} capacity`}
                data-focus-key={`capacity-${drive.id}`}
                inputMode="decimal"
                onChange={(event) => onChange(drive.id, { size: event.target.value })}
                placeholder="e.g. 12"
                value={drive.size}
              />
              {error ? <span className={styles.fieldError} id={`error-${drive.id}`}>{error}</span> : null}
            </label>
            <label>
              <span className={styles.visuallyHidden}>{label} unit</span>
              <select
                aria-label={`${label} unit`}
                onChange={(event) => onChange(drive.id, { unit: event.target.value as InputUnit })}
                value={drive.unit}
              >
                {inputUnits.map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </label>
            <button
              aria-label={`Remove drive ${index + 1}`}
              className={styles.iconButton}
              onClick={() => onRemove(drive.id)}
              type="button"
            >
              <Trash2 aria-hidden="true" size={17} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function CapacityResult({
  calculated,
  outputUnit,
  onOutputUnitChange,
  onCopy,
  onShare,
}: {
  calculated: CalculatedState;
  outputUnit: OutputUnit;
  onOutputUnitChange: (unit: OutputUnit) => void;
  onCopy: () => void;
  onShare: () => void;
}) {
  const { values } = calculated;
  const raw = values.rawCapacityBytes;
  const reservedData = values.dataBeforeSystemBytes < values.systemReserveBytes
    ? values.dataBeforeSystemBytes
    : values.systemReserveBytes;
  const barParts = [
    ["Estimated pool", values.estimatedPoolCapacityBytes, styles.barData],
    ["System reserve", reservedData, styles.barReserve],
    ["Protection", values.protectionBytes, styles.barProtection],
    ["Unused", values.unusedBytes, styles.barUnused],
  ] as const;

  return (
    <section className={styles.result} data-testid="capacity-result" aria-live="polite">
      <div className={styles.resultHeader}>
        <div>
          <span className={styles.resultKicker}>SHR result</span>
          <p className={styles.resultSentence}>
            This is the modeled capacity for a fresh {values.mode === "shr1" ? "SHR-1" : "SHR-2"} pool with {values.driveCount} drives.
          </p>
        </div>
        <fieldset className={styles.outputUnit}>
          <legend className={styles.visuallyHidden}>Result unit</legend>
          <div className={styles.choiceRow}>
            {(["TB", "TiB"] as const).map((unit) => (
              <label className={styles.choice} key={unit}>
                <input
                  aria-label={unit}
                  checked={outputUnit === unit}
                  name="shr-output-unit"
                  onChange={() => onOutputUnitChange(unit)}
                  type="radio"
                />
                <span>{unit}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.resultSummary}>
        <section className={`${styles.resultMetric} ${styles.resultMetricPrimary}`}>
          <h2>Estimated pool capacity</h2>
          <strong data-testid="primary-capacity">{displayValue(values.estimatedPoolCapacityBytes, outputUnit)}</strong>
          <span>After the modeled system reserve</span>
        </section>
        <section className={styles.resultMetric}>
          <h2>Protection</h2>
          <strong data-testid="result-protection">{displayValue(values.protectionBytes, outputUnit)}</strong>
          <span>{values.parityDrives} parity drive tier{values.parityDrives === 1 ? "" : "s"}</span>
        </section>
        <section className={styles.resultMetric}>
          <h2>Unused high tiers</h2>
          <strong data-testid="result-unused">{displayValue(values.unusedBytes, outputUnit)}</strong>
          <span>Drive space the selected mode cannot use</span>
        </section>
      </div>

      <section className={styles.resultSection}>
        <h2>Capacity allocation</h2>
        <div aria-label={barParts.map(([label, bytes]) => `${label}: ${displayValue(bytes, outputUnit)}`).join(", ")} className={styles.capacityBar} role="img">
          {barParts.map(([label, bytes, className]) => bytes > 0n ? (
            <span
              aria-hidden="true"
              className={className}
              key={label}
              style={{ width: formatBarWidth(bytes, raw) }}
            />
          ) : null)}
        </div>
        <ul aria-label="Capacity allocation legend" className={styles.allocationLegend}>
          {barParts.map(([label, bytes, className]) => (
            <li key={label}>
              <i aria-hidden="true" className={`${styles.legendSwatch} ${className}`} />
              <span>{label}</span>
              <strong>{displayValue(bytes, outputUnit)}</strong>
              <small>{formatPercent(bytes, raw)}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.resultSection}>
        <div className={styles.sectionHeading}>
          <h2>Capacity bands</h2>
          <span>{values.driveCount} drives, {values.parityDrives} parity</span>
        </div>
        <div className={styles.tableScroll} tabIndex={0}>
          <table aria-label="SHR capacity bands" className={styles.bandsTable}>
            <thead>
              <tr><th scope="col">Band</th><th scope="col">Active drives</th><th scope="col">Data</th><th scope="col">Protection</th><th scope="col">Unused</th></tr>
            </thead>
            <tbody>
              {values.tiers.map((tier) => (
                <tr key={`${tier.startBytes}-${tier.endBytes}`}>
                  <th data-label="Band" scope="row">{formatCapacity(tier.startBytes, outputUnit)} to {formatCapacity(tier.endBytes, outputUnit)} {outputUnit}</th>
                  <td data-label="Active drives">{tier.activeDrives}</td>
                  <td data-label="Data">{displayValue(tier.dataBytes, outputUnit)}</td>
                  <td data-label="Protection">{displayValue(tier.protectionBytes, outputUnit)}</td>
                  <td data-label="Unused">{displayValue(tier.unusedBytes, outputUnit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.resultNote}>
        <HardDrive aria-hidden="true" size={19} />
        <p>Configuration is for a fresh pool. It does not model expansion history, filesystem overhead, snapshots, or rebuild safety.</p>
      </section>

      {values.warnings.map((warning) => <p className={styles.warning} key={warning}>{warning}</p>)}

      <div className={styles.resultActions}>
        <button className={styles.secondaryButton} onClick={onCopy} type="button">
          <Copy aria-hidden="true" size={17} /> Copy result
        </button>
        <button className={styles.secondaryButton} onClick={onShare} type="button">
          <Share2 aria-hidden="true" size={17} /> Share configuration
        </button>
      </div>
    </section>
  );
}

export function ShrCalculator({ initialState }: { initialState: string }) {
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [calculated, setCalculated] = useState<CalculatedState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [outputUnit, setOutputUnit] = useState<OutputUnit>("TB");
  const [status, setStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const pendingFocus = useRef<string | null>(null);
  const focusResult = useRef(false);
  const addDriveButtonRef = useRef<HTMLButtonElement>(null);

  function cleanStateUrl() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("state")) return;
    url.searchParams.delete("state");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  useEffect(() => {
    if (!initialState) return;
    try {
      const envelope = decodeShrState(initialState);
      const result = calculateShrCapacity(envelope.payload);
      if (result.status !== "valid" || !result.values) throw new Error("restore");
      const comparisonResult = calculateShrCapacity({
        mode: envelope.payload.mode === "shr1" ? "shr2" : "shr1",
        drives: envelope.payload.drives,
      });
      setEditor(editorFromInput(envelope.payload));
      setCalculated({ input: envelope.payload, values: result.values, comparison: comparisonResult.values });
      setStatus("Configuration restored");
    } catch {
      cleanStateUrl();
      setEditor(emptyEditor());
      setCalculated(null);
      setStatus("Configuration restore failed");
    }
  }, [initialState]);

  useEffect(() => {
    if (pendingFocus.current) {
      const target = document.querySelector<HTMLElement>(`[data-focus-key="${pendingFocus.current}"]`);
      pendingFocus.current = null;
      target?.focus();
    }
    if (focusResult.current && calculated) {
      focusResult.current = false;
      document.querySelector<HTMLElement>("[data-testid='capacity-result'] h2")?.focus({ preventScroll: true });
    }
  }, [editor, calculated, errors]);

  function mutate(updater: (current: EditorState) => EditorState, focusKey?: string) {
    if (focusKey) pendingFocus.current = focusKey;
    setEditor(updater);
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    setStatus("");
    cleanStateUrl();
  }

  function addDrive() {
    if (editor.drives.length >= MAX_SHR_DRIVES) return;
    const id = `drive-${nextDriveNumber(editor.drives)}`;
    mutate((current) => ({ ...current, drives: [...current.drives, { id, size: "", unit: "TB" }] }), `capacity-${id}`);
  }

  function updateDrive(id: string, patch: Partial<DriveRow>) {
    mutate((current) => ({
      ...current,
      drives: current.drives.map((drive) => drive.id === id ? { ...drive, ...patch } : drive),
    }));
  }

  function removeDrive(id: string) {
    mutate((current) => ({ ...current, drives: current.drives.filter((drive) => drive.id !== id) }));
  }

  function updateMode(mode: ShrMode) {
    mutate((current) => ({ ...current, mode }));
  }

  function calculate(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const compiled = compileEditor(editor);
    if (!compiled.input) {
      setCalculated(null);
      setErrors(compiled.errors);
      setStatus("Add valid capacities before calculating.");
      return;
    }
    const result = calculateShrCapacity(compiled.input);
    if (result.status !== "valid" || !result.values) {
      setCalculated(null);
      setErrors(mapCalculationIssues(result, compiled.input));
      setStatus("Check the configuration before calculating.");
      return;
    }
    const comparisonResult = calculateShrCapacity({
      mode: compiled.input.mode === "shr1" ? "shr2" : "shr1",
      drives: compiled.input.drives,
    });
    setErrors({});
    setCalculated({ input: compiled.input, values: result.values, comparison: comparisonResult.values });
    setStatus("Capacity calculated");
    focusResult.current = true;
  }

  async function copyResult() {
    if (!calculated) return;
    try {
      await navigator.clipboard.writeText(resultSummary(calculated, outputUnit));
      setStatus("Result copied");
    } catch {
      setStatus("Copy failed. Select the result text manually.");
    }
  }

  async function shareConfiguration() {
    if (!calculated) return;
    try {
      const encoded = encodeShrState(calculated.input);
      const url = new URL(window.location.href);
      url.searchParams.set("state", encoded);
      const fullUrl = url.toString();
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      setShareUrl(fullUrl);
      try {
        await navigator.clipboard.writeText(fullUrl);
        setStatus("Configuration URL copied");
      } catch {
        setStatus("Configuration URL ready");
      }
    } catch {
      setStatus("Could not create a share URL.");
    }
  }

  function resetCalculator() {
    setEditor(emptyEditor());
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    cleanStateUrl();
    setStatus("Calculator reset");
    window.setTimeout(() => addDriveButtonRef.current?.focus(), 0);
  }

  const hasBlankCapacity = editor.drives.some((drive) => !drive.size.trim());
  const calculateDisabled = editor.drives.length === 0 || hasBlankCapacity;

  return (
    <div className={styles.tool}>
      <form aria-label="SHR capacity calculator" className={styles.form} onSubmit={calculate}>
        <div className={styles.formIntro}>
          <div>
            <h2>Build the drive inventory</h2>
            <p>Enter the marketed capacity and unit for every drive. Mixed sizes are handled in separate capacity bands.</p>
          </div>
          <span className={styles.formMeta}>2 to {MAX_SHR_DRIVES} drives</span>
        </div>

        <fieldset className={styles.modeFieldset}>
          <legend>Protection mode</legend>
          <div className={styles.choiceRow}>
            <label className={styles.choice}>
              <input
                aria-label="SHR-1"
                checked={editor.mode === "shr1"}
                name="shr-mode"
                onChange={() => updateMode("shr1")}
                type="radio"
              />
              <span><strong>SHR-1</strong> · one-drive protection</span>
            </label>
            <label className={styles.choice}>
              <input
                aria-label="SHR-2"
                checked={editor.mode === "shr2"}
                name="shr-mode"
                onChange={() => updateMode("shr2")}
                type="radio"
              />
              <span><strong>SHR-2</strong> · two-drive protection</span>
            </label>
          </div>
        </fieldset>

        <section className={styles.inventorySection}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Drive inventory</h2>
              <p>Use decimal or binary units exactly as entered on the drive label.</p>
            </div>
            <span className={styles.sectionCount}>{editor.drives.length} / {MAX_SHR_DRIVES}</span>
          </div>
          {editor.drives.length > 0 ? (
            <DriveRows rows={editor.drives} errors={errors} onChange={updateDrive} onRemove={removeDrive} />
          ) : (
            <p className={styles.emptyState}>Add the drives you are considering to start the estimate.</p>
          )}
          {errors.inventory ? <p className={styles.formError}>{errors.inventory}</p> : null}
          <button
            ref={addDriveButtonRef}
            className={styles.addDriveButton}
            disabled={editor.drives.length >= MAX_SHR_DRIVES}
            onClick={addDrive}
            type="button"
          >
            <Plus aria-hidden="true" size={17} /> Add drive
          </button>
        </section>

        <div className={styles.actionRow}>
          <button className={styles.resetButton} onClick={resetCalculator} type="button">
            <RotateCcw aria-hidden="true" size={17} /> Reset calculator
          </button>
          <button className={styles.primaryButton} disabled={calculateDisabled} type="submit">
            Calculate capacity
          </button>
        </div>
        <p aria-live="polite" className={styles.status}>{status}</p>
        {shareUrl ? <input aria-label="Shared configuration URL" className={styles.shareUrl} readOnly value={shareUrl} /> : null}
      </form>

      {calculated ? (
        <CapacityResult
          calculated={calculated}
          onCopy={copyResult}
          onOutputUnitChange={setOutputUnit}
          onShare={shareConfiguration}
          outputUnit={outputUnit}
        />
      ) : null}
    </div>
  );
}
