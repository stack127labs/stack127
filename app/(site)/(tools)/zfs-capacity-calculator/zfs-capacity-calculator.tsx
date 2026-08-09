"use client";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  RotateCcw,
  Share2,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CodeBlock } from "../../../code-block";
import {
  ZFS_CALCULATION_VERSION,
  ZFS_INPUT_VERSION,
  bytesFromUnit,
  decodeStorageState,
  formatBytes,
  validateZfsCalculatorInput,
  zfsCalculatorRegistry,
  calculateZfsPoolCapacity,
  type StorageCalculationResult,
  type StorageCapacityUnit,
  type ZfsAuxiliaryLayout,
  type ZfsAuxiliaryRole,
  type ZfsCalculationValues,
  type ZfsCalculatorInput,
  type ZfsDataVdevType,
  type ZfsWorkload,
} from "@/lib/storage/index.ts";
import styles from "./zfs-capacity-calculator.module.css";

type InputUnit = "GB" | "TB" | "GiB" | "TiB";
type OutputUnit = "TB" | "TiB";

type DriveRow = {
  id: string;
  size: string;
  unit: InputUnit;
};

type DataVdevRow = {
  id: string;
  type: ZfsDataVdevType;
  drives: DriveRow[];
};

type AuxiliaryRow = {
  id: string;
  role: ZfsAuxiliaryRole;
  layout: ZfsAuxiliaryLayout;
  drives: DriveRow[];
};

type EditorState = {
  workload: ZfsWorkload;
  blockSizeBytes: string;
  ashift: "9" | "12" | "13" | "14";
  slopShift: string;
  headroom: string;
  compressionEnabled: boolean;
  compressionRatio: string;
  auxiliaryChoice: ZfsAuxiliaryRole;
  dataVdevs: DataVdevRow[];
  auxiliaryGroups: AuxiliaryRow[];
};

type CalculatedState = {
  input: ZfsCalculatorInput;
  result: StorageCalculationResult<ZfsCalculationValues>;
};

type CompileResult = {
  input: ZfsCalculatorInput | null;
  errors: Record<string, string>;
  firstError: string | null;
};

const inputUnits: readonly InputUnit[] = ["TB", "GB", "TiB", "GiB"];
const vdevTypes: readonly ZfsDataVdevType[] = ["mirror", "raidz1", "raidz2", "raidz3"];
const auxiliaryRoles: readonly ZfsAuxiliaryRole[] = ["spare", "slog", "l2arc", "special"];
const filesystemBlocks = [4, 8, 16, 32, 64, 128, 256, 512, 1_024, 2_048, 4_096, 8_192, 16_384];
const zvolBlocks = [4, 8, 16, 32, 64, 128];
const MAX_UI_DRIVES = 256;

function emptyEditor(): EditorState {
  return {
    workload: "filesystem",
    blockSizeBytes: "131072",
    ashift: "12",
    slopShift: "5",
    headroom: "20",
    compressionEnabled: false,
    compressionRatio: "1.5",
    auxiliaryChoice: "spare",
    dataVdevs: [],
    auxiliaryGroups: [],
  };
}

function typeLabel(type: ZfsDataVdevType) {
  return type === "mirror" ? "Mirror" : type.toUpperCase();
}

function roleLabel(role: ZfsAuxiliaryRole) {
  return role === "slog" ? "SLOG" : role === "l2arc" ? "L2ARC" : `${role[0].toUpperCase()}${role.slice(1)}`;
}

function capacityForDisplay(bytes: bigint): Pick<DriveRow, "size" | "unit"> {
  const units: ReadonlyArray<readonly [InputUnit, bigint]> = [
    ["TB", 1_000_000_000_000n],
    ["TiB", 1_099_511_627_776n],
    ["GB", 1_000_000_000n],
    ["GiB", 1_073_741_824n],
  ];
  for (const [unit, multiplier] of units) {
    if (bytes % multiplier === 0n) return { size: (bytes / multiplier).toString(), unit };
  }
  return {
    size: formatBytes(bytes, "GB", { maximumFractionDigits: 9 }).replace(" GB", ""),
    unit: "GB",
  };
}

function editorFromInput(input: ZfsCalculatorInput): EditorState {
  const row = (drive: ZfsCalculatorInput["dataVdevs"][number]["drives"][number]): DriveRow => ({
    id: drive.id,
    ...capacityForDisplay(drive.capacityBytes),
  });
  return {
    workload: input.workload,
    blockSizeBytes: input.blockSizeBytes.toString(),
    ashift: String(input.ashift) as EditorState["ashift"],
    slopShift: String(input.slopShift),
    headroom: `${Math.floor(input.reserveBasisPoints / 100)}${input.reserveBasisPoints % 100 ? `.${String(input.reserveBasisPoints % 100).padStart(2, "0").replace(/0$/, "")}` : ""}`,
    compressionEnabled: input.compressionRatio !== null,
    compressionRatio: input.compressionRatio === null
      ? "1.5"
      : `${Math.floor(input.compressionRatio.numerator / 100)}${input.compressionRatio.numerator % 100 ? `.${String(input.compressionRatio.numerator % 100).padStart(2, "0").replace(/0$/, "")}` : ""}`,
    auxiliaryChoice: "spare",
    dataVdevs: input.dataVdevs.map((vdev) => ({
      id: vdev.id,
      type: vdev.type,
      drives: vdev.drives.map(row),
    })),
    auxiliaryGroups: input.auxiliaryGroups.map((group) => ({
      id: group.id,
      role: group.role,
      layout: group.layout,
      drives: group.drives.map(row),
    })),
  };
}

function nextNumber(ids: readonly string[], prefix: string) {
  return ids.reduce((highest, id) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0) + 1;
}

function totalDriveCount(state: EditorState) {
  return state.dataVdevs.reduce((total, vdev) => total + vdev.drives.length, 0)
    + state.auxiliaryGroups.reduce((total, group) => total + group.drives.length, 0);
}

function minimumDrives(type: ZfsDataVdevType) {
  return type === "raidz2" ? 3 : type === "raidz3" ? 4 : 2;
}

function parseBasisPoints(value: string) {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

function compileEditor(state: EditorState): CompileResult {
  const errors: Record<string, string> = {};
  let firstError: string | null = null;
  const addError = (key: string, message: string) => {
    if (!errors[key]) errors[key] = message;
    firstError ??= key;
  };
  const parseDrive = (drive: DriveRow, key: string, role: "data" | ZfsAuxiliaryRole, groupId: string) => {
    if (!drive.size.trim()) {
      addError(key, "Capacity is required.");
      return null;
    }
    try {
      const capacityBytes = bytesFromUnit(drive.size, drive.unit as StorageCapacityUnit);
      if (capacityBytes <= 0n) {
        addError(key, "Enter a positive capacity.");
        return null;
      }
      return { id: drive.id, capacityBytes, role, groupId };
    } catch {
      addError(key, "Enter a plain decimal.");
      return null;
    }
  };

  const dataVdevs = state.dataVdevs.map((vdev, vdevIndex) => {
    if (vdev.drives.length < minimumDrives(vdev.type)) {
      addError(`heading-${vdev.id}`, `${typeLabel(vdev.type)} needs ${minimumDrives(vdev.type)} drives.`);
    }
    const drives = vdev.drives.map((drive, driveIndex) => (
      parseDrive(drive, `capacity-${drive.id}`, "data", vdev.id)
        ?? { id: drive.id, capacityBytes: 0n, role: "data" as const, groupId: vdev.id }
    ));
    return { id: vdev.id, type: vdev.type, drives, index: vdevIndex };
  });

  const auxiliaryGroups = state.auxiliaryGroups.map((group, groupIndex) => {
    if ((group.role === "spare" || group.role === "l2arc") && group.drives.length !== 1) {
      addError(`heading-${group.id}`, "This role needs one drive.");
    }
    if (group.role === "slog") {
      const minimum = group.layout === "mirror" ? 2 : 1;
      if (group.drives.length < minimum) addError(`heading-${group.id}`, `SLOG needs ${minimum} drives.`);
    }
    if (group.role === "special" && group.drives.length < 2) {
      addError(`heading-${group.id}`, "Special needs two drives.");
    }
    const drives = group.drives.map((drive) => (
      parseDrive(drive, `capacity-${drive.id}`, group.role, group.id)
        ?? { id: drive.id, capacityBytes: 0n, role: group.role, groupId: group.id }
    ));
    return { id: group.id, role: group.role, layout: group.layout, drives, index: groupIndex };
  });

  const reserveBasisPoints = parseBasisPoints(state.headroom);
  if (reserveBasisPoints === null || reserveBasisPoints > 5_000) {
    addError("headroom", "Use 0 to 50 percent.");
  }
  const slopShift = Number(state.slopShift);
  if (!Number.isSafeInteger(slopShift) || slopShift < 1 || slopShift > 31) {
    addError("slop", "Use a shift from 1 to 31.");
  }
  let compressionRatio: ZfsCalculatorInput["compressionRatio"] = null;
  if (state.compressionEnabled) {
    const numerator = parseBasisPoints(state.compressionRatio);
    if (numerator === null || numerator < 100 || numerator > 1_000) {
      addError("compression", "Use a ratio from 1 to 10.");
    } else {
      compressionRatio = { numerator, denominator: 100 };
    }
  }

  if (Object.keys(errors).length > 0) return { input: null, errors, firstError };
  return {
    errors,
    firstError,
    input: {
      dataVdevs: dataVdevs.map(({ index: _index, ...vdev }) => vdev),
      auxiliaryGroups: auxiliaryGroups.map(({ index: _index, ...group }) => group),
      workload: state.workload,
      blockSizeBytes: BigInt(state.blockSizeBytes),
      ashift: Number(state.ashift) as ZfsCalculatorInput["ashift"],
      slopShift,
      reserveBasisPoints: reserveBasisPoints as number,
      compressionRatio,
    },
  };
}

function formatPercent(part: bigint, total: bigint) {
  if (total === 0n) return "0%";
  const hundredths = (part * 10_000n + total / 2n) / total;
  if (part > 0n && hundredths === 0n) return "<0.01%";
  const whole = hundredths / 100n;
  const fraction = (hundredths % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}%` : `${whole}%`;
}

function DriveRows({
  groupLabel,
  rows,
  errors,
  onChange,
  onRemove,
}: {
  groupLabel: string;
  rows: readonly DriveRow[];
  errors: Readonly<Record<string, string>>;
  onChange: (driveId: string, patch: Partial<DriveRow>) => void;
  onRemove: (driveId: string) => void;
}) {
  return (
    <div className={styles.driveTable}>
      <div aria-hidden="true" className={styles.driveHeader}>
        <span>Drive</span><span>Capacity</span><span>Unit</span><span />
      </div>
      {rows.map((drive, index) => {
        const name = `${groupLabel} drive ${index + 1}`;
        const error = errors[`capacity-${drive.id}`];
        return (
          <div className={styles.driveRow} data-testid={drive.id} key={drive.id}>
            <span className={styles.driveNumber}>{String(index + 1).padStart(2, "0")}</span>
            <label>
              <span className={styles.visuallyHidden}>{name} capacity</span>
              <input
                aria-describedby={error ? `error-${drive.id}` : undefined}
                aria-invalid={Boolean(error)}
                aria-label={`${name} capacity`}
                data-focus-key={`capacity-${drive.id}`}
                inputMode="decimal"
                onChange={(event) => onChange(drive.id, { size: event.target.value })}
                placeholder="e.g. 12"
                value={drive.size}
              />
              {error ? <span className={styles.fieldError} id={`error-${drive.id}`}>{error}</span> : null}
            </label>
            <label>
              <span className={styles.visuallyHidden}>{name} unit</span>
              <select
                aria-label={`${name} unit`}
                onChange={(event) => onChange(drive.id, { unit: event.target.value as InputUnit })}
                value={drive.unit}
              >
                {inputUnits.map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </label>
            <button
              aria-label={`Remove ${name.toLowerCase()}`}
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

function QuickDriveSetup({
  groupLabel,
  minimum,
  rows,
  maximum,
  onApply,
}: {
  groupLabel: string;
  minimum: number;
  rows: readonly DriveRow[];
  maximum: number;
  onApply: (count: number, size: string, unit: InputUnit) => void;
}) {
  const [count, setCount] = useState(String(rows.length || minimum));
  const [size, setSize] = useState("");
  const [unit, setUnit] = useState<InputUnit>("TB");

  useEffect(() => {
    setCount(String(rows.length || minimum));
  }, [minimum, rows.length]);

  const parsedCount = Number(count);
  let validCapacity = false;
  try {
    validCapacity = bytesFromUnit(size, unit) > 0n;
  } catch {
    validCapacity = false;
  }
  const canApply = Number.isSafeInteger(parsedCount)
    && parsedCount >= minimum
    && parsedCount <= maximum
    && validCapacity;

  return (
    <div className={styles.quickSetupPanel}>
      <div className={styles.quickSetup}>
        <label>
          <span>Drives</span>
          <input
            aria-label={`${groupLabel} drive count`}
            inputMode="numeric"
            max={maximum}
            min={minimum}
            onChange={(event) => setCount(event.target.value)}
            type="number"
            value={count}
          />
        </label>
        <label>
          <span>Same capacity</span>
          <input
            aria-label={`${groupLabel} shared capacity`}
            inputMode="decimal"
            onChange={(event) => setSize(event.target.value)}
            placeholder="e.g. 18"
            value={size}
          />
        </label>
        <label>
          <span>Unit</span>
          <select
            aria-label={`${groupLabel} shared unit`}
            onChange={(event) => setUnit(event.target.value as InputUnit)}
            value={unit}
          >
            {inputUnits.map((candidate) => <option key={candidate}>{candidate}</option>)}
          </select>
        </label>
        <button
          aria-label={`Set all drives for ${groupLabel.toLowerCase()}`}
          className={styles.secondaryButton}
          disabled={!canApply}
          onClick={() => onApply(parsedCount, size, unit)}
          type="button"
        >
          Set all drives
        </button>
      </div>
      <p>Edit any drive afterward for a mixed-size vdev.</p>
    </div>
  );
}

function Result({
  calculated,
  outputUnit,
  onOutputUnitChange,
  onCopySummary,
  onShare,
  resultHeadingRef,
}: {
  calculated: CalculatedState;
  outputUnit: OutputUnit;
  onOutputUnitChange: (unit: OutputUnit) => void;
  onCopySummary: () => void;
  onShare: () => void;
  resultHeadingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const values = calculated.result.values as ZfsCalculationValues;
  const display = (bytes: bigint) => {
    const formatted = formatBytes(bytes, outputUnit, { maximumFractionDigits: 2 });
    return bytes > 0n && /^0(?:\.0+)?\s/.test(formatted) ? `<0.01 ${outputUnit}` : formatted;
  };
  const raw = values.rawDataCapacityBytes.value;
  const barParts = [
    ["Writable", values.estimatedWritableBytes.value, styles.barWritable],
    ["Slop", values.slopBytes.value, styles.barSlop],
    ["Redundancy", values.losses.redundancyBytes, styles.barRedundancy],
    ["Block rounding", values.losses.sectorRoundingBytes, styles.barRounding],
    ["RAIDZ padding", values.losses.raidzPaddingBytes, styles.barPadding],
    ["Mixed sizes", values.losses.mixedSizeBytes, styles.barMixed],
    ["Alignment", values.losses.alignmentBytes, styles.barAlignment],
    ["Tails", values.losses.tailBytes, styles.barTail],
  ] as const;
  const tableRows = [
    ["Entered data devices", raw],
    ["Alignment loss", values.losses.alignmentBytes],
    ["Mixed-size loss", values.losses.mixedSizeBytes],
    ["Mirror and parity", values.losses.redundancyBytes],
    ["Sector rounding", values.losses.sectorRoundingBytes],
    ["RAIDZ padding", values.losses.raidzPaddingBytes],
    ["Block tails", values.losses.tailBytes],
    ["Before slop", values.dataBeforeSlopBytes.value],
    ["OpenZFS slop", values.slopBytes.value],
    ["Estimated writable", values.estimatedWritableBytes.value],
    ["Planning headroom", values.planningReserveBytes.value],
    ["Planning target", values.planningTargetBytes.value],
  ] as const;
  const alwaysVisibleRows = new Set([
    "Entered data devices",
    "Before slop",
    "Estimated writable",
    "Planning headroom",
    "Planning target",
  ]);
  const visibleTableRows = tableRows.filter(([label, bytes]) => bytes > 0n || alwaysVisibleRows.has(label));
  const zeroTableRows = tableRows.filter(([label, bytes]) => bytes === 0n && !alwaysVisibleRows.has(label));
  const barLabel = barParts.map(([label, bytes]) => `${label}: ${display(bytes)}`).join(", ");

  return (
    <div className={styles.result}>
      <div className={styles.resultHeader}>
        <span>Pool result</span>
        <fieldset className={styles.outputUnit}>
          <legend className={styles.visuallyHidden}>Result unit</legend>
          <div className={styles.choiceRow}>
            {(["TiB", "TB"] as const).map((unit) => (
              <label className={styles.choice} key={unit}>
                <input
                  aria-label={unit}
                  checked={outputUnit === unit}
                  name="zfs-output-unit"
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
        <section className={styles.resultMetric}>
          <h2 ref={resultHeadingRef} tabIndex={-1}>Estimated writable</h2>
          <strong data-testid="writable-value">{display(values.estimatedWritableBytes.value)}</strong>
          <span>After modeled allocation losses and OpenZFS slop</span>
        </section>
        <section className={styles.resultMetric}>
          <h2>Planning target</h2>
          <strong>{display(values.planningTargetBytes.value)}</strong>
          <span>After {calculated.input.reserveBasisPoints / 100}% planning headroom</span>
        </section>
        {values.conditionalLogicalBytes ? (
          <section className={styles.resultMetric} data-testid="conditional-logical">
            <h2>Conditional logical</h2>
            <strong>{display(values.conditionalLogicalBytes.value)}</strong>
            <span>Only if your data reaches the entered compression ratio</span>
          </section>
        ) : null}
      </div>

      <section className={styles.resultSection} data-testid="vdev-topology">
        <h2>Vdev topology</h2>
        <ol className={styles.topologyList}>
          {values.dataVdevs.map((vdev, index) => (
            <li className={styles.topologyRow} key={vdev.id}>
              <span className={styles.topologyNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span><strong>{vdev.label}</strong><small>{vdev.driveCount} drives</small></span>
              <span><strong>{display(vdev.logicalDataBytes)}</strong><small>{vdev.failureStatement}</small></span>
              <span className={styles.drivePips} aria-label={`${vdev.driveCount} drives`}>
                {vdev.driveIds.map((driveId) => <i aria-hidden="true" key={driveId} />)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.resultSection}>
        <div className={styles.sectionHeading}>
          <h2>Capacity allocation</h2>
          <span>{display(raw)}</span>
        </div>
        <div aria-label={barLabel} className={styles.capacityBar} role="img">
          {barParts.map(([label, bytes, className]) => bytes > 0n ? (
            <span
              aria-hidden="true"
              className={className}
              key={label}
              style={{ width: formatPercent(bytes, raw).replace("<", "") }}
            />
          ) : null)}
        </div>
        <ul aria-label="Capacity allocation legend" className={styles.allocationLegend}>
          {barParts.map(([label, bytes, className]) => bytes > 0n ? (
            <li key={label}>
              <i aria-hidden="true" className={`${styles.legendSwatch} ${className}`} />
              <span>{label}</span>
              <strong>{display(bytes)}</strong>
              <small>{formatPercent(bytes, raw)}</small>
            </li>
          ) : null)}
        </ul>
      </section>

      <section className={styles.resultSection} data-testid="capacity-accounting">
        <h2>Capacity accounting</h2>
        <div className={styles.tableScroll} tabIndex={0}>
          <table className={styles.accountingTable}>
            <tbody>
              {visibleTableRows.map(([label, bytes]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{display(bytes)}</td>
                  <td>{formatPercent(bytes, raw)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {zeroTableRows.length > 0 ? (
          <details className={styles.zeroDetails}>
            <summary>Zero-value categories ({zeroTableRows.length})</summary>
            <ul>
              {zeroTableRows.map(([label]) => <li key={label}><span>{label}</span><strong>{display(0n)}</strong></li>)}
            </ul>
          </details>
        ) : null}
      </section>

      {values.roleInventory.length > 0 ? (
        <section className={styles.resultSection}>
          <h2>Auxiliary inventory</h2>
          <div className={styles.tableScroll} tabIndex={0}>
            <table className={`${styles.accountingTable} ${styles.auxiliaryTable}`}>
              <thead><tr><th>Role</th><th>Drives</th><th>Inventory</th><th>General data</th></tr></thead>
              <tbody>
                {values.roleInventory.map((row) => (
                  <tr key={row.role}>
                    <th scope="row">{roleLabel(row.role)}</th>
                    <td data-label="Drives">{row.driveCount}</td>
                    <td data-label="Inventory">{display(row.inventoryBytes)}</td>
                    <td data-label="General data">{display(row.generalDataBytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {values.specialVdevs.map((special) => (
            <div className={styles.specialRow} key={special.id}>
              <strong>Special envelope</strong>
              <span>{display(special.envelopeBytes)}</span>
              <small>Special loss can lose pools.</small>
            </div>
          ))}
        </section>
      ) : null}

      <section className={styles.resultSection} data-testid="dry-run-command">
        <h2>Dry-run command</h2>
        <CodeBlock className={styles.commandBlock} label="zpool create -n preview">{values.command}</CodeBlock>
      </section>

      <details className={styles.metadata}>
        <summary>Formula metadata</summary>
        <dl>
          <div><dt>Calculation</dt><dd>{ZFS_CALCULATION_VERSION}</dd></div>
          <div><dt>Input</dt><dd>{ZFS_INPUT_VERSION}</dd></div>
          <div><dt>ashift</dt><dd>{values.ashift}</dd></div>
          <div><dt>Block size</dt><dd>{formatBytes(values.blockSizeBytes, "KiB")}</dd></div>
          <div><dt>Block model</dt><dd>Selected size only</dd></div>
          <div><dt>Pool state</dt><dd>Fresh topology</dd></div>
          <div><dt>Slop model</dt><dd>Embedded log excluded</dd></div>
        </dl>
        <ul className={styles.sourceList}>
          {calculated.result.sources.map((source) => (
            <li key={source.url}><a href={source.url}>{source.title}</a></li>
          ))}
        </ul>
      </details>

      <div className={styles.resultActions}>
        <button className={styles.secondaryButton} onClick={onCopySummary} type="button">
          <Copy aria-hidden="true" size={17} /> Copy summary
        </button>
        <button className={styles.secondaryButton} onClick={onShare} type="button">
          <Share2 aria-hidden="true" size={17} /> Share configuration
        </button>
      </div>
    </div>
  );
}

export function ZfsCapacityCalculator({ initialState }: { initialState: string }) {
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [calculated, setCalculated] = useState<CalculatedState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [outputUnit, setOutputUnit] = useState<OutputUnit>("TiB");
  const [status, setStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const pendingFocus = useRef<string | null>(null);
  const focusResult = useRef(false);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  function cleanStateUrl() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("state")) return;
    url.searchParams.delete("state");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  useEffect(() => {
    if (!initialState) return;
    try {
      const envelope = decodeStorageState(initialState);
      if (envelope.calculatorId !== "zfs-pool-capacity"
        || envelope.calculatorVersion !== ZFS_CALCULATION_VERSION
        || envelope.inputVersion !== ZFS_INPUT_VERSION
        || !validateZfsCalculatorInput(envelope.payload)) {
        throw new Error("restore");
      }
      const result = zfsCalculatorRegistry.runEncoded(initialState) as StorageCalculationResult<ZfsCalculationValues>;
      if (result.status !== "valid") throw new Error("restore");
      setEditor(editorFromInput(envelope.payload));
      setCalculated({ input: envelope.payload, result });
      setStatus("Configuration restored");
    } catch {
      cleanStateUrl();
      setEditor(emptyEditor());
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
      resultHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [editor, calculated, errors]);

  function mutate(updater: (current: EditorState) => EditorState, focusKey?: string) {
    if (focusKey) pendingFocus.current = focusKey;
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    setStatus("");
    cleanStateUrl();
    setEditor(updater);
  }

  function addDataVdev() {
    if (editor.dataVdevs.length >= 64) return;
    const number = nextNumber(editor.dataVdevs.map((vdev) => vdev.id), "data-vdev");
    const id = `data-vdev-${number}`;
    mutate((current) => ({
      ...current,
      dataVdevs: [...current.dataVdevs, { id, type: "raidz2", drives: [] }],
    }), `type-${id}`);
    setStatus(`Data vdev ${number} added`);
  }

  function updateDataVdev(id: string, patch: Partial<DataVdevRow>) {
    mutate((current) => ({
      ...current,
      dataVdevs: current.dataVdevs.map((vdev) => vdev.id === id ? { ...vdev, ...patch } : vdev),
    }));
  }

  function addDataDrive(vdevId: string) {
    if (totalDriveCount(editor) >= MAX_UI_DRIVES) return;
    const target = editor.dataVdevs.find((vdev) => vdev.id === vdevId);
    if (!target || target.drives.length >= 64) return;
    const number = nextNumber(target.drives.map((drive) => drive.id), `${vdevId}-drive`);
    const id = `${vdevId}-drive-${number}`;
    mutate((current) => ({
      ...current,
      dataVdevs: current.dataVdevs.map((vdev) => vdev.id === vdevId
        ? { ...vdev, drives: [...vdev.drives, { id, size: "", unit: "TB" }] }
        : vdev),
    }), `capacity-${id}`);
    setStatus("Drive added");
  }

  function updateDataDrive(vdevId: string, driveId: string, patch: Partial<DriveRow>) {
    mutate((current) => ({
      ...current,
      dataVdevs: current.dataVdevs.map((vdev) => vdev.id === vdevId
        ? { ...vdev, drives: vdev.drives.map((drive) => drive.id === driveId ? { ...drive, ...patch } : drive) }
        : vdev),
    }));
  }

  function setAllDataDrives(vdevId: string, count: number, size: string, unit: InputUnit) {
    const target = editor.dataVdevs.find((vdev) => vdev.id === vdevId);
    if (!target || count < minimumDrives(target.type) || count > 64) return;
    const otherDrives = totalDriveCount(editor) - target.drives.length;
    if (otherDrives + count > MAX_UI_DRIVES) return;
    mutate((current) => ({
      ...current,
      dataVdevs: current.dataVdevs.map((vdev) => vdev.id === vdevId
        ? {
          ...vdev,
          drives: Array.from({ length: count }, (_, index) => ({
            id: `${vdevId}-drive-${index + 1}`,
            size,
            unit,
          })),
        }
        : vdev),
    }), `capacity-${vdevId}-drive-1`);
    setStatus(`${count} drives set to ${size} ${unit}`);
  }

  function removeDataDrive(vdevId: string, driveId: string) {
    mutate((current) => ({
      ...current,
      dataVdevs: current.dataVdevs.map((vdev) => vdev.id === vdevId
        ? { ...vdev, drives: vdev.drives.filter((drive) => drive.id !== driveId) }
        : vdev),
    }), `heading-${vdevId}`);
    setStatus("Drive removed");
  }

  function duplicateVdev(id: string) {
    const source = editor.dataVdevs.find((vdev) => vdev.id === id);
    if (!source || editor.dataVdevs.length >= 64 || totalDriveCount(editor) + source.drives.length > MAX_UI_DRIVES) return;
    const number = nextNumber(editor.dataVdevs.map((vdev) => vdev.id), "data-vdev");
    const newId = `data-vdev-${number}`;
    const duplicate = {
      id: newId,
      type: source.type,
      drives: source.drives.map((drive, index) => ({ ...drive, id: `${newId}-drive-${index + 1}` })),
    };
    mutate((current) => {
      const index = current.dataVdevs.findIndex((vdev) => vdev.id === id);
      return {
        ...current,
        dataVdevs: [...current.dataVdevs.slice(0, index + 1), duplicate, ...current.dataVdevs.slice(index + 1)],
      };
    }, `heading-${newId}`);
    setStatus("Data vdev duplicated");
  }

  function moveVdev(id: string, direction: -1 | 1) {
    const index = editor.dataVdevs.findIndex((vdev) => vdev.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= editor.dataVdevs.length) return;
    mutate((current) => {
      const next = [...current.dataVdevs];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, dataVdevs: next };
    }, `heading-${id}`);
    setStatus("Data vdev moved");
  }

  function removeVdev(id: string) {
    mutate((current) => ({ ...current, dataVdevs: current.dataVdevs.filter((vdev) => vdev.id !== id) }), "add-data");
    setStatus("Data vdev removed");
  }

  function addAuxiliary() {
    const role = editor.auxiliaryChoice;
    const sameRole = editor.auxiliaryGroups.filter((group) => group.role === role);
    const number = nextNumber(sameRole.map((group) => group.id), role);
    const id = `${role}-${number}`;
    const driveCount = role === "special" ? 2 : 1;
    const group: AuxiliaryRow = {
      id,
      role,
      layout: role === "special" ? "mirror" : "single",
      drives: Array.from({ length: driveCount }, (_, index) => ({
        id: `${id}-drive-${index + 1}`,
        size: "",
        unit: "TB",
      })),
    };
    if (totalDriveCount(editor) + driveCount > MAX_UI_DRIVES) return;
    mutate((current) => ({ ...current, auxiliaryGroups: [...current.auxiliaryGroups, group] }), `capacity-${group.drives[0].id}`);
    setStatus(`${roleLabel(role)} added`);
  }

  function updateAuxiliary(id: string, patch: Partial<AuxiliaryRow>) {
    mutate((current) => ({
      ...current,
      auxiliaryGroups: current.auxiliaryGroups.map((group) => group.id === id ? { ...group, ...patch } : group),
    }));
  }

  function addAuxiliaryDrive(groupId: string) {
    const group = editor.auxiliaryGroups.find((candidate) => candidate.id === groupId);
    if (!group || group.drives.length >= 64 || totalDriveCount(editor) >= MAX_UI_DRIVES) return;
    const number = nextNumber(group.drives.map((drive) => drive.id), `${groupId}-drive`);
    const id = `${groupId}-drive-${number}`;
    mutate((current) => ({
      ...current,
      auxiliaryGroups: current.auxiliaryGroups.map((candidate) => candidate.id === groupId
        ? { ...candidate, drives: [...candidate.drives, { id, size: "", unit: "TB" }] }
        : candidate),
    }), `capacity-${id}`);
    setStatus("Drive added");
  }

  function updateAuxiliaryDrive(groupId: string, driveId: string, patch: Partial<DriveRow>) {
    mutate((current) => ({
      ...current,
      auxiliaryGroups: current.auxiliaryGroups.map((group) => group.id === groupId
        ? { ...group, drives: group.drives.map((drive) => drive.id === driveId ? { ...drive, ...patch } : drive) }
        : group),
    }));
  }

  function removeAuxiliaryDrive(groupId: string, driveId: string) {
    mutate((current) => ({
      ...current,
      auxiliaryGroups: current.auxiliaryGroups.map((group) => group.id === groupId
        ? { ...group, drives: group.drives.filter((drive) => drive.id !== driveId) }
        : group),
    }), `heading-${groupId}`);
    setStatus("Drive removed");
  }

  function removeAuxiliary(id: string) {
    mutate((current) => ({ ...current, auxiliaryGroups: current.auxiliaryGroups.filter((group) => group.id !== id) }));
    setStatus("Auxiliary removed");
  }

  function changeWorkload(workload: ZfsWorkload) {
    mutate((current) => ({
      ...current,
      workload,
      blockSizeBytes: workload === "filesystem" ? "131072" : "16384",
    }));
  }

  function calculatePool() {
    const compiled = compileEditor(editor);
    if (!compiled.input) {
      setCalculated(null);
      setErrors({ ...compiled.errors, _form: "Fix the marked inputs." });
      pendingFocus.current = compiled.firstError;
      setStatus("Calculation blocked");
      return;
    }
    const result = calculateZfsPoolCapacity(compiled.input);
    if (result.status !== "valid") {
      setCalculated(null);
      setErrors({ _form: "Pool topology is invalid." });
      setStatus("Calculation blocked");
      return;
    }
    focusResult.current = calculated === null;
    setErrors({});
    setCalculated({ input: compiled.input, result });
    setStatus("Calculation complete");
  }

  function resetCalculator() {
    pendingFocus.current = "add-data";
    setEditor(emptyEditor());
    setCalculated(null);
    setErrors({});
    setOutputUnit("TiB");
    setShareUrl("");
    cleanStateUrl();
    setStatus("Calculator reset");
  }

  async function copySummary() {
    if (!calculated?.result.values) return;
    const values = calculated.result.values;
    const display = (bytes: bigint) => formatBytes(bytes, outputUnit, { maximumFractionDigits: 2 });
    const summary = [
      `Estimated writable: ${display(values.estimatedWritableBytes.value)}`,
      `Planning target: ${display(values.planningTargetBytes.value)}`,
      `Data vdevs: ${values.dataVdevs.length}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("Summary copied");
    } catch {
      setStatus("Summary copy failed");
    }
  }

  async function shareConfiguration() {
    if (!calculated) return;
    const encoded = zfsCalculatorRegistry.encode("zfs-pool-capacity", calculated.input);
    const url = new URL(window.location.href);
    url.searchParams.set("state", encoded);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    const fullUrl = url.toString();
    setShareUrl(fullUrl);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setStatus("Share link copied");
    } catch {
      setStatus("Share link ready");
    }
  }

  const blockLabel = editor.workload === "filesystem" ? "recordsize" : "volblocksize";
  const blockOptions = editor.workload === "filesystem" ? filesystemBlocks : zvolBlocks;

  return (
    <section aria-label="ZFS pool capacity calculator" className={styles.tool}>
      <div className={styles.form}>
        <div className={styles.settingsGrid}>
          <fieldset className={styles.fieldset}>
            <legend>Workload</legend>
            <div className={styles.choiceRow}>
              {(["filesystem", "zvol"] as const).map((workload) => (
                <label className={styles.choice} key={workload}>
                  <input
                    aria-label={workload === "filesystem" ? "Filesystem" : "Zvol"}
                    checked={editor.workload === workload}
                    name="zfs-workload"
                    onChange={() => changeWorkload(workload)}
                    type="radio"
                  />
                  <span>{workload === "filesystem" ? "Filesystem" : "Zvol"}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className={styles.field}>
            <span>{blockLabel}</span>
            <select
              aria-label={blockLabel}
              onChange={(event) => mutate((current) => ({ ...current, blockSizeBytes: event.target.value }))}
              value={editor.blockSizeBytes}
            >
              {blockOptions.map((size) => <option key={size} value={size * 1_024}>{size >= 1_024 ? `${size / 1_024} MiB` : `${size} KiB`}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>ashift</span>
            <select
              aria-label="ashift"
              onChange={(event) => mutate((current) => ({ ...current, ashift: event.target.value as EditorState["ashift"] }))}
              value={editor.ashift}
            >
              {[9, 12, 13, 14].map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>Planning headroom</span>
            <span className={styles.inputSuffix}>
              <input
                aria-describedby={errors.headroom ? "headroom-error" : undefined}
                aria-invalid={Boolean(errors.headroom)}
                aria-label="Planning headroom"
                data-focus-key="headroom"
                inputMode="decimal"
                onChange={(event) => mutate((current) => ({ ...current, headroom: event.target.value }))}
                value={editor.headroom}
              />
              <i>%</i>
            </span>
            {errors.headroom ? <small className={styles.fieldError} id="headroom-error">{errors.headroom}</small> : null}
          </label>
        </div>

        <details className={styles.advanced}>
          <summary>Advanced assumptions</summary>
          <div className={styles.advancedGrid}>
            <label className={styles.field}>
              <span>Slop shift</span>
              <input
                aria-describedby={errors.slop ? "slop-error" : undefined}
                aria-invalid={Boolean(errors.slop)}
                aria-label="Slop shift"
                data-focus-key="slop"
                inputMode="numeric"
                onChange={(event) => mutate((current) => ({ ...current, slopShift: event.target.value }))}
                value={editor.slopShift}
              />
              {errors.slop ? <small className={styles.fieldError} id="slop-error">{errors.slop}</small> : null}
            </label>
            <label className={styles.toggle}>
              <input
                aria-label="Compression scenario"
                checked={editor.compressionEnabled}
                onChange={(event) => mutate((current) => ({ ...current, compressionEnabled: event.target.checked }))}
                type="checkbox"
              />
              <span>Compression scenario</span>
            </label>
            {editor.compressionEnabled ? (
              <label className={styles.field}>
                <span>Compression ratio</span>
                <span className={styles.inputSuffix}>
                  <input
                    aria-describedby={errors.compression ? "compression-error" : undefined}
                    aria-invalid={Boolean(errors.compression)}
                    aria-label="Compression ratio"
                    data-focus-key="compression"
                    inputMode="decimal"
                    onChange={(event) => mutate((current) => ({ ...current, compressionRatio: event.target.value }))}
                    value={editor.compressionRatio}
                  />
                  <i>×</i>
                </span>
                {errors.compression ? <small className={styles.fieldError} id="compression-error">{errors.compression}</small> : null}
              </label>
            ) : null}
          </div>
        </details>

        <section className={styles.editorSection} aria-labelledby="data-vdevs-heading">
          <div className={styles.editorHeading}>
            <div><h2 id="data-vdevs-heading">Data vdevs</h2><span>{editor.dataVdevs.length} configured</span></div>
            <button
              className={styles.secondaryButton}
              data-focus-key="add-data"
              disabled={editor.dataVdevs.length >= 64}
              onClick={addDataVdev}
              type="button"
            >
              <Plus aria-hidden="true" size={17} /> Add data vdev
            </button>
          </div>
          {editor.dataVdevs.length === 0 ? <p className={styles.emptyState}>No data vdevs yet.</p> : null}
          <div className={styles.vdevList}>
            {editor.dataVdevs.map((vdev, index) => {
              const label = `Data vdev ${index + 1}`;
              const groupError = errors[`heading-${vdev.id}`];
              return (
                <section className={styles.vdev} key={vdev.id}>
                  <div className={styles.vdevHeading}>
                    <h3 data-focus-key={`heading-${vdev.id}`} tabIndex={-1}>{label}</h3>
                    <div className={styles.vdevControls}>
                      <label className={styles.vdevTypeField}>
                        <span>Layout</span>
                        <select
                          aria-label={`${label} type`}
                          data-focus-key={`type-${vdev.id}`}
                          onChange={(event) => updateDataVdev(vdev.id, { type: event.target.value as ZfsDataVdevType })}
                          value={vdev.type}
                        >
                          {vdevTypes.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}
                        </select>
                      </label>
                      <button aria-label={`Duplicate ${label.toLowerCase()}`} className={styles.iconButton} onClick={() => duplicateVdev(vdev.id)} title="Duplicate vdev" type="button"><Copy aria-hidden="true" size={16} /></button>
                      <button aria-label={`Move ${label.toLowerCase()} up`} className={styles.iconButton} disabled={index === 0} onClick={() => moveVdev(vdev.id, -1)} title="Move vdev up" type="button"><ChevronUp aria-hidden="true" size={17} /></button>
                      <button aria-label={`Move ${label.toLowerCase()} down`} className={styles.iconButton} disabled={index === editor.dataVdevs.length - 1} onClick={() => moveVdev(vdev.id, 1)} title="Move vdev down" type="button"><ChevronDown aria-hidden="true" size={17} /></button>
                      <button aria-label={`Remove ${label.toLowerCase()}`} className={styles.iconButton} onClick={() => removeVdev(vdev.id)} title="Remove vdev" type="button"><Trash2 aria-hidden="true" size={17} /></button>
                    </div>
                  </div>
                  {groupError ? <p className={styles.groupError}>{groupError}</p> : null}
                  <QuickDriveSetup
                    groupLabel={label}
                    maximum={Math.min(64, MAX_UI_DRIVES - totalDriveCount(editor) + vdev.drives.length)}
                    minimum={minimumDrives(vdev.type)}
                    onApply={(count, size, unit) => setAllDataDrives(vdev.id, count, size, unit)}
                    rows={vdev.drives}
                  />
                  {vdev.drives.length > 0 ? (
                    <DriveRows
                      errors={errors}
                      groupLabel={label}
                      onChange={(driveId, patch) => updateDataDrive(vdev.id, driveId, patch)}
                      onRemove={(driveId) => removeDataDrive(vdev.id, driveId)}
                      rows={vdev.drives}
                    />
                  ) : <p className={styles.emptyGroup}>No drives</p>}
                  <button className={styles.addDriveButton} disabled={vdev.drives.length >= 64 || totalDriveCount(editor) >= MAX_UI_DRIVES} onClick={() => addDataDrive(vdev.id)} type="button">
                    <Plus aria-hidden="true" size={16} /> Add drive to {label.toLowerCase()}
                  </button>
                </section>
              );
            })}
          </div>
        </section>

        <section className={styles.editorSection} aria-labelledby="auxiliary-heading">
          <div className={styles.editorHeading}>
            <div><h2 id="auxiliary-heading">Auxiliary devices</h2><span>{editor.auxiliaryGroups.length} groups</span></div>
            <div className={styles.auxiliaryAdd}>
              <label>
                <span className={styles.visuallyHidden}>Auxiliary role</span>
                <select aria-label="Auxiliary role" onChange={(event) => setEditor((current) => ({ ...current, auxiliaryChoice: event.target.value as ZfsAuxiliaryRole }))} value={editor.auxiliaryChoice}>
                  {auxiliaryRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                </select>
              </label>
              <button className={styles.secondaryButton} disabled={editor.auxiliaryGroups.length >= 64} onClick={addAuxiliary} type="button">
                <Plus aria-hidden="true" size={17} /> Add auxiliary role
              </button>
            </div>
          </div>
          {editor.auxiliaryGroups.length === 0 ? <p className={styles.emptyState}>No auxiliary devices.</p> : null}
          <div className={styles.vdevList}>
            {editor.auxiliaryGroups.map((group) => {
              const roleIndex = editor.auxiliaryGroups.filter((candidate) => candidate.role === group.role).findIndex((candidate) => candidate.id === group.id) + 1;
              const label = `${roleLabel(group.role)} ${roleIndex}`;
              const groupError = errors[`heading-${group.id}`];
              return (
                <section className={styles.vdev} key={group.id}>
                  <div className={styles.vdevHeading}>
                    <h3 data-focus-key={`heading-${group.id}`} tabIndex={-1}>{label}</h3>
                    <div className={styles.vdevControls}>
                      {group.role === "slog" ? (
                        <label>
                          <span className={styles.visuallyHidden}>{label} layout</span>
                          <select aria-label={`${label} layout`} onChange={(event) => updateAuxiliary(group.id, { layout: event.target.value as ZfsAuxiliaryLayout })} value={group.layout}>
                            <option value="single">Single</option><option value="mirror">Mirror</option>
                          </select>
                        </label>
                      ) : null}
                      <button aria-label={`Remove ${label.toLowerCase()}`} className={styles.iconButton} onClick={() => removeAuxiliary(group.id)} type="button"><Trash2 aria-hidden="true" size={17} /></button>
                    </div>
                  </div>
                  {group.role === "special" ? <p className={styles.specialWarning}>Special vdev loss can lose pools.</p> : null}
                  {groupError ? <p className={styles.groupError}>{groupError}</p> : null}
                  <DriveRows
                    errors={errors}
                    groupLabel={label}
                    onChange={(driveId, patch) => updateAuxiliaryDrive(group.id, driveId, patch)}
                    onRemove={(driveId) => removeAuxiliaryDrive(group.id, driveId)}
                    rows={group.drives}
                  />
                  {(group.role === "slog" || group.role === "special") ? (
                    <button className={styles.addDriveButton} onClick={() => addAuxiliaryDrive(group.id)} type="button">
                      <Plus aria-hidden="true" size={16} /> Add drive to {label.toLowerCase()}
                    </button>
                  ) : null}
                </section>
              );
            })}
          </div>
        </section>

        {errors._form ? <p className={styles.formError} role="alert">{errors._form}</p> : null}
        <div className={styles.actionRow}>
          <button aria-label="Reset calculator" className={styles.resetButton} onClick={resetCalculator} type="button">
            <RotateCcw aria-hidden="true" size={17} /> Reset
          </button>
          <button className={styles.primaryButton} disabled={editor.dataVdevs.length === 0} onClick={calculatePool} type="button">
            Calculate pool
          </button>
        </div>
      </div>

      {calculated ? (
        <Result
          calculated={calculated}
          onCopySummary={copySummary}
          onOutputUnitChange={setOutputUnit}
          onShare={shareConfiguration}
          outputUnit={outputUnit}
          resultHeadingRef={resultHeadingRef}
        />
      ) : null}

      <div className={styles.statusArea}>
        <p aria-live="polite" className={styles.status}>{status}</p>
        {calculated ? <p className={styles.shareDisclosure}>Shared URLs expose inputs.</p> : null}
        {shareUrl ? <input aria-label="Shared URL" className={styles.shareUrl} readOnly value={shareUrl} /> : null}
      </div>
    </section>
  );
}
