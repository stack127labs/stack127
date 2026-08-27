"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  bytesFromUnit,
  createDriveInventory,
  decodeStorageState,
  formatBytes,
  type StorageCapacityUnit,
  type StorageDrive,
} from "@/lib/storage/index.ts";
import {
  calculateRaidCapacity,
  raidCalculatorRegistry,
  raidLevelDetails,
  raidLevels,
  validateRaidCalculatorInput,
  type RaidCalculationValues,
  type RaidCalculatorInput,
  type RaidLevel,
} from "@/lib/storage/raid.ts";
import styles from "../../(catalogs)/storage-tools/storage-tools.module.css";

type InputUnit = "TB" | "GB" | "TiB" | "GiB";
type OutputUnit = "TB" | "TiB";

type DriveRow = Readonly<{
  id: string;
  size: string;
  unit: InputUnit;
}>;

type UiState = Readonly<{
  level: RaidLevel;
  groupSize: number | null;
  drives: readonly DriveRow[];
}>;

const DEFAULT_STATE: UiState = Object.freeze({
  level: "raid5",
  groupSize: null,
  drives: Object.freeze([]),
});

const inputUnits: readonly InputUnit[] = ["TB", "GB", "TiB", "GiB"];
const nestedLevels = new Set<RaidLevel>(["raid10", "raid50", "raid60"]);
const MAX_UI_DRIVES = 64;

function capacityForDisplay(bytes: bigint): Pick<DriveRow, "size" | "unit"> {
  const candidates: ReadonlyArray<readonly [InputUnit, bigint]> = [
    ["TB", 1_000_000_000_000n],
    ["TiB", 1_099_511_627_776n],
    ["GB", 1_000_000_000n],
    ["GiB", 1_073_741_824n],
  ];
  for (const [unit, multiplier] of candidates) {
    if (bytes % multiplier === 0n) return { size: (bytes / multiplier).toString(), unit };
  }
  return { size: formatBytes(bytes, "GB", { maximumFractionDigits: 6 }).replace(" GB", ""), unit: "GB" };
}

function uiStateFromEncoded(encoded: string): UiState {
  if (!encoded) return DEFAULT_STATE;
  try {
    const state = decodeStorageState(encoded);
    if (state.calculatorId !== "raid-capacity" || !validateRaidCalculatorInput(state.payload)) {
      return DEFAULT_STATE;
    }
    return Object.freeze({
      level: state.payload.level,
      groupSize: state.payload.groupSize,
      drives: Object.freeze(state.payload.drives.map((drive) => Object.freeze({
        id: drive.id,
        ...capacityForDisplay(drive.capacityBytes),
      }))),
    });
  } catch {
    return DEFAULT_STATE;
  }
}

function calculationInput(state: UiState): RaidCalculatorInput {
  return {
    level: state.level,
    groupSize: state.groupSize,
    drives: createDriveInventory(state.drives.map((drive) => ({
      id: drive.id,
      capacityBytes: bytesFromUnit(drive.size, drive.unit as StorageCapacityUnit),
      role: "data",
    }))),
  };
}

function defaultGroupSize(level: RaidLevel) {
  if (level === "raid10") return 2;
  if (level === "raid50") return 3;
  if (level === "raid60") return 4;
  return null;
}

function formatPercent(part: bigint, total: bigint) {
  if (total === 0n) return "0%";
  const hundredths = (part * 10_000n + total / 2n) / total;
  const whole = hundredths / 100n;
  const fraction = (hundredths % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}%` : `${whole}%`;
}

function groupNumber(level: RaidLevel, groupSize: number | null, index: number) {
  if (!nestedLevels.has(level)) return null;
  const size = level === "raid10" ? 2 : groupSize;
  return size ? Math.floor(index / size) + 1 : null;
}

function nextDriveNumber(drives: readonly DriveRow[]) {
  return drives.reduce((highest, drive) => {
    const number = Number(drive.id.replace("disk-", ""));
    return Number.isSafeInteger(number) ? Math.max(highest, number) : highest;
  }, 0) + 1;
}

function HardDriveGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 6.5h16l1 7.5v3.5H3V14l1-7.5Z" />
      <path d="M3 14h18" />
      <circle cx="17.5" cy="15.8" r=".8" />
    </svg>
  );
}

function Result({
  drives,
  values,
  outputUnit,
  onOutputUnitChange,
}: {
  drives: readonly StorageDrive[];
  values: RaidCalculationValues;
  outputUnit: OutputUnit;
  onOutputUnitChange: (unit: OutputUnit) => void;
}) {
  const display = (value: bigint) => formatBytes(value, outputUnit, { maximumFractionDigits: 2 });
  const raw = values.rawCapacityBytes.value;
  const driveById = new Map(drives.map((drive) => [drive.id, drive]));
  const capacityParts = [
    {
      key: "usable",
      label: "Usable",
      value: values.usableCapacityBytes.value,
      className: styles.capacityUsable,
    },
    {
      key: "redundancy",
      label: "Redundancy",
      value: values.redundancyBytes.value,
      className: styles.capacityRedundancy,
    },
    {
      key: "mismatch",
      label: "Size mismatch",
      value: values.sizeMismatchBytes.value,
      className: styles.capacityMismatch,
    },
  ] as const;

  return (
    <div className={styles.result} aria-live="polite">
      <div className={styles.resultHeader}>
        <div aria-label="Theoretical usable capacity" className={styles.resultHeadline}>
          <p><strong>{display(values.usableCapacityBytes.value)}</strong> theoretically usable</p>
          <span>{values.levelLabel} · {values.driveCount} drives · {display(raw)} raw</span>
        </div>
        <fieldset className={styles.resultUnit}>
          <legend className={styles.visuallyHidden}>Result unit</legend>
          <div className={styles.choiceRow}>
            {(["TiB", "TB"] as const).map((unit) => (
              <label className={styles.choice} key={unit}>
                <input
                  checked={outputUnit === unit}
                  name="output-unit"
                  onChange={() => onOutputUnitChange(unit)}
                  type="radio"
                />
                <span>{unit}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {values.sizeMismatchBytes.value > 0n ? (
        <p className={styles.warningText}>
          {display(values.sizeMismatchBytes.value)} is stranded because at least one group contains
          drives larger than its smallest member.
        </p>
      ) : null}

      <section aria-labelledby="capacity-breakdown-title" className={styles.resultSection}>
        <div className={styles.resultSectionHeading}>
          <h2 id="capacity-breakdown-title">Where the raw capacity goes</h2>
          <span>{display(raw)} total</span>
        </div>
        <div
          aria-label={`${formatPercent(values.usableCapacityBytes.value, raw)} usable, ${formatPercent(values.redundancyBytes.value, raw)} redundancy, and ${formatPercent(values.sizeMismatchBytes.value, raw)} size mismatch`}
          className={styles.capacityBar}
          role="img"
        >
          {capacityParts.map((part) => part.value > 0n ? (
            <span
              className={part.className}
              key={part.key}
              style={{ width: formatPercent(part.value, raw) }}
            />
          ) : null)}
        </div>
        <dl className={styles.capacityValues}>
          {capacityParts.map((part) => (
            <div key={part.key}>
              <dt><span className={`${styles.capacitySwatch} ${part.className}`} />{part.label}</dt>
              <dd><strong>{display(part.value)}</strong><span>{formatPercent(part.value, raw)}</span></dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="array-topology-title" className={styles.resultSection}>
        <h2 id="array-topology-title">Drive arrangement</h2>
        <div className={styles.topology}>
          {values.groups.map((group) => (
            <div className={styles.topologyStrip} key={group.id}>
              <div className={styles.topologyHeading}>
                <strong>{group.label}</strong>
                <span>
                  {display(group.usableCapacityBytes)} usable
                  {group.sizeMismatchBytes > 0n ? ` · ${display(group.sizeMismatchBytes)} mismatch` : ""}
                </span>
              </div>
              <div className={styles.topologyDrives}>
                {group.driveIds.map((driveId) => (
                  <div className={styles.topologyDrive} key={driveId}>
                    <HardDriveGlyph />
                    <span>
                      {driveId.replace("disk-", "Drive ")}
                      <small>{driveById.has(driveId) ? display(driveById.get(driveId)!.capacityBytes) : "Unknown"}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className={styles.topologyNote}>
          {values.level === "linear" || values.level === "jbod"
            ? "Every supplied byte contributes to this concatenated layout."
            : values.groups.length > 1
              ? "Groups use the entered drive order, so placement changes capacity and the failure boundary."
              : "Every member is capped by the smallest drive in this group."}
        </p>
      </section>

      <dl className={styles.resultFacts}>
        <div>
          <dt>Failure tolerance</dt>
          <dd>{values.failureTolerance.statement}</dd>
        </div>
        <div>
          <dt>Small random write</dt>
          <dd>{values.smallRandomWrite.statement}</dd>
        </div>
      </dl>

      <aside className={styles.backupNote}>
        <strong>RAID is not backup.</strong> It does not recover deletion, corruption, ransomware,
        theft, fire, or a bad command. Keep an independent copy and check that it restores.
      </aside>

      <details className={styles.methodDetails}>
        <summary>Formula, assumptions, and sources</summary>
        <div>
          <p><code>usable + redundancy + size mismatch = raw capacity</code></p>
          <ul>
            <li>Each striped or redundant group is clipped to its smallest member.</li>
            <li>The result excludes controller metadata, partitions, filesystems, and reserved space.</li>
            <li>Nested groups use drives in the order shown.</li>
          </ul>
          <p>
            Sources: <a href="https://docs.kernel.org/admin-guide/md.html">Linux kernel RAID documentation</a>,{" "}
            <a href="https://man7.org/linux/man-pages/man8/mdadm.8.html"><code>mdadm(8)</code></a>, and{" "}
            <a href="https://www.dell.com/support/manuals/en-us/unity-880f/unity_p_pool_config/drive-iops-by-raid-type?guid=guid-b32204b2-a11b-4f25-b086-e8c135df04f1&amp;lang=en-us">Dell Unity&apos;s random-write operation reference</a>. Checked 2026-08-01.
          </p>
        </div>
      </details>
    </div>
  );
}

export function RaidCalculator({ initialState }: { initialState: string }) {
  const [state, setState] = useState<UiState>(() => uiStateFromEncoded(initialState));
  const [resultRequested, setResultRequested] = useState(
    () => uiStateFromEncoded(initialState).drives.length > 0,
  );
  const [outputUnit, setOutputUnit] = useState<OutputUnit>("TiB");
  const userHasEdited = useRef(false);

  const calculation = useMemo(() => {
    if (state.drives.length === 0) return { input: null, result: null, inputError: null };
    try {
      const input = calculationInput(state);
      return { input, result: calculateRaidCapacity(input), inputError: null };
    } catch {
      return { input: null, result: null, inputError: "Every drive needs a positive capacity written as a plain decimal number." };
    }
  }, [state]);

  useEffect(() => {
    if (!userHasEdited.current) return;
    const url = new URL(window.location.href);
    if (state.drives.length === 0 || !calculation.input) {
      url.searchParams.delete("state");
    } else {
      const encoded = raidCalculatorRegistry.encode("raid-capacity", calculation.input);
      url.searchParams.set("state", encoded);
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [calculation.input, state.drives.length]);

  function updateStateFromUser(nextState: UiState | ((current: UiState) => UiState)) {
    userHasEdited.current = true;
    setResultRequested(false);
    setState(nextState);
  }

  function changeLevel(level: RaidLevel) {
    updateStateFromUser((current) => ({ ...current, level, groupSize: defaultGroupSize(level) }));
  }

  function updateDrive(id: string, patch: Partial<DriveRow>) {
    updateStateFromUser((current) => ({
      ...current,
      drives: current.drives.map((drive) => drive.id === id ? { ...drive, ...patch } : drive),
    }));
  }

  function addDrive() {
    if (state.drives.length >= MAX_UI_DRIVES) return;
    updateStateFromUser((current) => ({
      ...current,
      drives: [...current.drives, {
        id: `disk-${nextDriveNumber(current.drives)}`,
        size: "",
        unit: "TB",
      }],
    }));
  }

  function showResult() {
    setResultRequested(true);
  }

  function removeDrive(id: string) {
    updateStateFromUser((current) => ({
      ...current,
      drives: current.drives.filter((drive) => drive.id !== id),
    }));
  }

  function resetCalculator() {
    userHasEdited.current = true;
    setResultRequested(false);
    setState(DEFAULT_STATE);
    setOutputUnit("TiB");
  }

  const groupSizeMinimum = state.level === "raid60" ? 4 : 3;
  const groupSizeMaximum = Math.max(groupSizeMinimum, Math.floor(state.drives.length / 2));
  const groupSizeOptions = Array.from(new Set([
    ...Array.from({ length: groupSizeMaximum - groupSizeMinimum + 1 }, (_, index) => groupSizeMinimum + index),
    ...(state.groupSize ? [state.groupSize] : []),
  ])).sort((left, right) => left - right);

  return (
    <section className={styles.tool} aria-label="RAID capacity calculator">
      <div className={styles.toolForm}>
        <fieldset className={styles.fieldset}>
          <legend>RAID level</legend>
          <div className={styles.choiceRow} role="radiogroup" aria-label="RAID level">
            {raidLevels.map((level) => (
              <label className={styles.choice} key={level}>
                <input
                  checked={state.level === level}
                  name="raid-level"
                  onChange={() => changeLevel(level)}
                  type="radio"
                  value={level}
                />
                <span>{raidLevelDetails[level].label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className={styles.inventory} aria-labelledby="drive-inventory-title">
          <div className={styles.inventoryHeading}>
            <div>
              <h2 id="drive-inventory-title">Drive inventory</h2>
              <p>
                {state.drives.length === 0
                  ? "Empty array"
                  : `${state.drives.length} drive${state.drives.length === 1 ? "" : "s"} in entered order`}
              </p>
            </div>
            <div className={styles.inventoryControls}>
              <button
                className={styles.addButton}
                disabled={state.drives.length >= MAX_UI_DRIVES}
                onClick={addDrive}
                type="button"
              >
                <Plus aria-hidden="true" size={18} /> Add drive
              </button>
              {state.drives.length > 0 ? (
                <button className={styles.resetButton} onClick={resetCalculator} type="button">
                  <RotateCcw aria-hidden="true" size={17} /> Reset
                </button>
              ) : null}
            </div>
          </div>

          <div className={styles.driveTable}>
            {state.drives.length === 0 ? (
              <p className={styles.emptyInventory}>No drives in this array yet.</p>
            ) : (
              <>
              <div aria-hidden="true" className={styles.driveTableHeader}>
                <span>Drive</span><span>Capacity</span><span>Unit</span><span />
              </div>
              {state.drives.map((drive, index) => {
                const group = groupNumber(state.level, state.groupSize, index);
                return (
                  <div className={styles.driveRow} key={drive.id}>
                    <div className={styles.driveIdentity}>
                      <span className={styles.driveNumber}>{String(index + 1).padStart(2, "0")}</span>
                      {group ? <span className={styles.groupTag}>G{group}</span> : null}
                    </div>
                    <label>
                      <span className={styles.visuallyHidden}>Drive {index + 1} capacity</span>
                      <input
                        aria-label={`Drive ${index + 1} capacity`}
                        inputMode="decimal"
                        onChange={(event) => updateDrive(drive.id, { size: event.target.value })}
                        value={drive.size}
                      />
                    </label>
                    <label>
                      <span className={styles.visuallyHidden}>Drive {index + 1} unit</span>
                      <select
                        aria-label={`Drive ${index + 1} unit`}
                        onChange={(event) => updateDrive(drive.id, { unit: event.target.value as InputUnit })}
                        value={drive.unit}
                      >
                        {inputUnits.map((unit) => <option key={unit}>{unit}</option>)}
                      </select>
                    </label>
                    <button
                      aria-label={`Remove drive ${index + 1}`}
                      className={styles.removeButton}
                      onClick={() => removeDrive(drive.id)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={17} />
                    </button>
                  </div>
                );
              })}
              </>
            )}
          </div>

          {state.level === "raid10" && state.drives.length > 0 ? (
            <p className={styles.groupingNote}>Adjacent drives form mirror pairs: 1 + 2, 3 + 4, and so on.</p>
          ) : null}

          {(state.level === "raid50" || state.level === "raid60") && state.drives.length > 0 ? (
            <label className={styles.groupSizeControl}>
              <span>Drives per {state.level === "raid50" ? "RAID 5" : "RAID 6"} group</span>
              <select
                onChange={(event) => updateStateFromUser((current) => ({ ...current, groupSize: Number(event.target.value) }))}
                value={state.groupSize ?? groupSizeMinimum}
              >
                {groupSizeOptions.map((size) => (
                  <option key={size} value={size}>{size} drives</option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            className={styles.inventoryCalculate}
            disabled={state.drives.length === 0}
            onClick={showResult}
            type="button"
          >
            Show result
          </button>
        </section>
      </div>

      {resultRequested ? (
        calculation.inputError ? (
          <div className={styles.invalidResult} aria-live="polite">
            <h2>One drive capacity needs attention</h2>
            <p>{calculation.inputError}</p>
          </div>
        ) : calculation.result?.status === "invalid" ? (
          <div className={styles.invalidResult} aria-live="polite">
            <h2>This {raidLevelDetails[state.level].label} layout is not valid yet</h2>
            <ul>{calculation.result.issues.map((issue) => <li key={issue.code}>{issue.message}</li>)}</ul>
          </div>
        ) : calculation.result?.values ? (
          <Result
            drives={calculation.input?.drives ?? []}
            onOutputUnitChange={setOutputUnit}
            outputUnit={outputUnit}
            values={calculation.result.values}
          />
        ) : null
      ) : null}
    </section>
  );
}
