"use client";

import { useEffect, useRef, useState } from "react";
import {
  ToolActionRow,
  ToolAllocationBar,
  ToolButton,
  ToolChoiceGroup,
  ToolDataTable,
  ToolKeyValueList,
  ToolPrimaryResult,
  ToolQuantityInput,
  ToolRepeatableList,
  ToolStatus,
  ToolTextField,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  MAX_SHR_DRIVES,
  calculateShrCapacity,
  decodeShrState,
  encodeShrState,
  formatCapacity,
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
};

type CompileResult = {
  input: ShrInput | null;
  errors: Record<string, string>;
  firstError: string | null;
};

const inputUnits: readonly InputUnit[] = ["TB", "GB", "TiB", "GiB"];
const inputUnitOptions = inputUnits.map((unit) => toolOption(unit, unit));
const modeOptions = [
  toolOption("shr1", "SHR-1 · 1-drive protection"),
  toolOption("shr2", "SHR-2 · 2-drive protection"),
];
const outputUnitOptions = [toolOption("TB", "TB"), toolOption("TiB", "TiB")];

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
  onAdd,
  onChange,
  onRemove,
}: {
  rows: DriveRow[];
  errors: Readonly<Record<string, string>>;
  onAdd: () => void;
  onChange: (id: string, patch: Partial<DriveRow>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <ToolRepeatableList
      addDisabled={rows.length >= MAX_SHR_DRIVES}
      addLabel="Add drive"
      ariaLabel="Drive inventory"
      items={rows}
      onAdd={onAdd}
      onRemove={onRemove}
      renderItem={(drive, index) => {
        const label = `Drive ${index + 1}`;
        return (
          <div className={styles.driveEditor} data-testid={`drive-row-${drive.id}`}>
            <span aria-hidden="true" className={styles.driveNumber}>{String(index + 1).padStart(2, "0")}</span>
            <ToolQuantityInput
              ariaLabel={`${label} capacity`}
              dataFocusKey={`capacity-${drive.id}`}
              error={errors[`capacity-${drive.id}`]}
              hideLabel
              label={`${label} capacity`}
              onChange={(size) => onChange(drive.id, { size })}
              onUnitChange={(unit) => onChange(drive.id, { unit: unit as InputUnit })}
              placeholder="12"
              required
              unit={drive.unit}
              unitAriaLabel={`${label} unit`}
              units={inputUnitOptions}
              value={drive.size}
            />
          </div>
        );
      }}
    />
  );
}

function CapacityResult({
  calculated,
  outputUnit,
  shareUrl,
  onOutputUnitChange,
  onCopy,
  onShare,
}: {
  calculated: CalculatedState;
  outputUnit: OutputUnit;
  shareUrl: string;
  onOutputUnitChange: (unit: OutputUnit) => void;
  onCopy: () => void;
  onShare: () => void;
}) {
  const { values } = calculated;
  const reservedData = values.dataBeforeSystemBytes < values.systemReserveBytes
    ? values.dataBeforeSystemBytes
    : values.systemReserveBytes;
  const barParts = [
    { id: "pool", label: "Estimated pool", tone: "chartreuse" as const, value: values.estimatedPoolCapacityBytes },
    { id: "reserve", label: "System reserve", tone: "yellow" as const, value: reservedData },
    { id: "protection", label: "Protection", tone: "cyan" as const, value: values.protectionBytes },
    { id: "unused", label: "Unused", tone: "violet" as const, value: values.unusedBytes },
  ];

  return (
    <section className={styles.result} data-testid="capacity-result" aria-live="polite">
      <div className={styles.resultUnit}>
        <ToolChoiceGroup
          label="Result unit"
          onChange={(unit) => onOutputUnitChange(unit as OutputUnit)}
          options={outputUnitOptions}
          value={outputUnit}
        />
      </div>

      <h2 className={styles.resultHeading} tabIndex={-1}>{values.mode === "shr1" ? "SHR-1" : "SHR-2"} capacity</h2>
      <div data-testid="primary-capacity">
        <ToolPrimaryResult
          detail={`${values.driveCount} drives · after modeled system reserve`}
          label="Estimated pool capacity"
          value={displayValue(values.estimatedPoolCapacityBytes, outputUnit)}
        />
      </div>

      <ToolKeyValueList rows={[{
        label: "Fault tolerance",
        value: `${values.parityDrives} drive${values.parityDrives === 1 ? "" : "s"}`,
      }]} />

      <section className={styles.resultSection}>
        <h2>Capacity allocation</h2>
        <ToolAllocationBar
          ariaLabel="Capacity allocation"
          formatValue={(value) => displayValue(value as bigint, outputUnit)}
          palette="categorical"
          segments={barParts}
          total={values.rawCapacityBytes}
        />
      </section>

      <section className={styles.resultSection}>
        <h2>Capacity bands</h2>
        <ToolDataTable
          ariaLabel="SHR capacity bands"
          columns={[
            { id: "band", label: "Band" },
            { id: "drives", label: "Drives" },
            { id: "data", label: "Data" },
            { id: "protection", label: "Protection" },
            { id: "unused", label: "Unused" },
          ]}
          rows={values.tiers.map((tier) => ({
            id: `${tier.startBytes}-${tier.endBytes}`,
            cells: {
              band: `${formatCapacity(tier.startBytes, outputUnit)} to ${formatCapacity(tier.endBytes, outputUnit)} ${outputUnit}`,
              drives: tier.activeDrives,
              data: displayValue(tier.dataBytes, outputUnit),
              protection: displayValue(tier.protectionBytes, outputUnit),
              unused: displayValue(tier.unusedBytes, outputUnit),
            },
          }))}
        />
      </section>

      <p className={styles.resultNote}>Fresh-pool estimate. Filesystem overhead and expansion history are not modeled.</p>

      {values.warnings.map((warning) => <p className={styles.warning} key={warning}>{warning}</p>)}

      <ToolActionRow>
        <ToolButton onPress={onCopy}>Copy result</ToolButton>
        <ToolButton onPress={onShare}>Share configuration</ToolButton>
      </ToolActionRow>
      {shareUrl ? (
        <ToolTextField label="Shared configuration URL" readOnly value={shareUrl} />
      ) : null}
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
      setEditor(editorFromInput(envelope.payload));
      setCalculated({ input: envelope.payload, values: result.values });
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
    setErrors({});
    setCalculated({ input: compiled.input, values: result.values });
    setStatus("");
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
    window.setTimeout(() => document.querySelector<HTMLElement>("section[aria-label='Drive inventory'] button")?.focus(), 0);
  }

  const hasBlankCapacity = editor.drives.some((drive) => !drive.size.trim());
  const calculateDisabled = editor.drives.length === 0 || hasBlankCapacity;

  return (
    <div className={styles.tool} data-tool-workbench>
      <form aria-label="SHR capacity calculator" className={styles.form} onSubmit={calculate}>
        <ToolChoiceGroup
          label="Protection mode"
          onChange={(mode) => updateMode(mode as ShrMode)}
          options={modeOptions}
          required
          value={editor.mode}
        />

        <section className={styles.inventorySection}>
          <div className={styles.sectionHeading}>
            <h2>Drives</h2>
            <span className={styles.sectionCount}>{editor.drives.length} / {MAX_SHR_DRIVES}</span>
          </div>
          <DriveRows rows={editor.drives} errors={errors} onAdd={addDrive} onChange={updateDrive} onRemove={removeDrive} />
          {errors.inventory ? <p className={styles.formError}>{errors.inventory}</p> : null}
        </section>

        <ToolActionRow>
          <ToolButton isDisabled={calculateDisabled} type="submit" variant="primary">Calculate capacity</ToolButton>
          <ToolButton onPress={resetCalculator}>Reset</ToolButton>
        </ToolActionRow>
        {status ? <ToolStatus tone={Object.keys(errors).length ? "danger" : "neutral"}>{status}</ToolStatus> : null}
      </form>

      {calculated ? (
        <CapacityResult
          calculated={calculated}
          onCopy={copyResult}
          onOutputUnitChange={setOutputUnit}
          onShare={shareConfiguration}
          outputUnit={outputUnit}
          shareUrl={shareUrl}
        />
      ) : null}
    </div>
  );
}
