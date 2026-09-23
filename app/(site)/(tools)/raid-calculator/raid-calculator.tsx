"use client";

import { UiButton, UiChoiceGroup, UiDisclosure, UiNumberField, UiQuantityInput, UiRepeatableList, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  bytesFromUnit,
  createDriveInventory,
  decodeStorageState,
  formatBytes,
  type StorageCalculationResult,
  type StorageCapacityUnit,
} from "@/lib/storage/index.ts";
import {
  RAID_CALCULATION_VERSION,
  RAID_INPUT_VERSION,
  calculateRaidCapacity,
  raidCalculatorRegistry,
  raidLevelDetails,
  raidLevels,
  validateRaidCalculatorInput,
  type RaidCalculationValues,
  type RaidCalculatorInput,
  type RaidLevel,
} from "@/lib/storage/raid.ts";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./raid-calculator.module.css";

type InputUnit = "TB" | "GB" | "TiB" | "GiB";
type OutputUnit = "TB" | "TiB";

type DriveRow = Readonly<{ id: string; size: string; unit: InputUnit }>;
type UiState = Readonly<{ level: RaidLevel; groupSize: number | null; drives: readonly DriveRow[] }>;
type EditorErrors = { driveErrors: Record<string, string>; groupSizeError: string; inventoryError: string };
type Calculated = { input: RaidCalculatorInput; result: StorageCalculationResult<RaidCalculationValues> };

const DEFAULT_STATE: UiState = Object.freeze({ level: "raid5", groupSize: null, drives: Object.freeze([]) });
const EMPTY_ERRORS: EditorErrors = { driveErrors: {}, groupSizeError: "", inventoryError: "" };
const inputUnits = ["TB", "GB", "TiB", "GiB"].map((unit) => uiOption(unit, unit));
const outputUnits = ["TiB", "TB"].map((unit) => uiOption(unit, unit));
const levelOptions = raidLevels.map((level) => uiOption(level, raidLevelDetails[level].label));
const nestedLevels = new Set<RaidLevel>(["raid10", "raid50", "raid60"]);
const MAX_UI_DRIVES = 64;

function capacityForDisplay(bytes: bigint): Pick<DriveRow, "size" | "unit"> {
  const candidates: ReadonlyArray<readonly [InputUnit, bigint]> = [
    ["TB", 1_000_000_000_000n], ["TiB", 1_099_511_627_776n],
    ["GB", 1_000_000_000n], ["GiB", 1_073_741_824n],
  ];
  for (const [unit, multiplier] of candidates) {
    if (bytes % multiplier === 0n) return { size: (bytes / multiplier).toString(), unit };
  }
  return { size: formatBytes(bytes, "GB", { maximumFractionDigits: 6 }).replace(" GB", ""), unit: "GB" };
}

function defaultGroupSize(level: RaidLevel) {
  if (level === "raid10") return 2;
  if (level === "raid50") return 3;
  if (level === "raid60") return 4;
  return null;
}

function restoreState(encoded: string): { state: UiState; calculated: Calculated | null; recovery: string } {
  if (!encoded) return { state: DEFAULT_STATE, calculated: null, recovery: "" };
  try {
    const envelope = decodeStorageState(encoded);
    if (
      envelope.calculatorId !== "raid-capacity"
      || envelope.calculatorVersion !== RAID_CALCULATION_VERSION
      || envelope.inputVersion !== RAID_INPUT_VERSION
      || !validateRaidCalculatorInput(envelope.payload)
    ) throw new Error("state");
    const result = calculateRaidCapacity(envelope.payload);
    if (!result.values) throw new Error("state");
    const state = Object.freeze({
      level: envelope.payload.level,
      groupSize: envelope.payload.groupSize,
      drives: Object.freeze(envelope.payload.drives.map((drive) => Object.freeze({
        id: drive.id,
        ...capacityForDisplay(drive.capacityBytes),
      }))),
    });
    return { state, calculated: { input: envelope.payload, result }, recovery: "Shared array loaded." };
  } catch {
    return { state: DEFAULT_STATE, calculated: null, recovery: "Shared array could not load." };
  }
}

function nextDriveNumber(drives: readonly DriveRow[]) {
  return drives.reduce((highest, drive) => {
    const number = Number(drive.id.replace("disk-", ""));
    return Number.isSafeInteger(number) ? Math.max(highest, number) : highest;
  }, 0) + 1;
}

function buildInput(state: UiState): RaidCalculatorInput {
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

function validateEditor(state: UiState): { errors: EditorErrors; calculated: Calculated | null } {
  const errors: EditorErrors = { driveErrors: {}, groupSizeError: "", inventoryError: "" };
  const minimum = raidLevelDetails[state.level].minimumDrives;

  for (const drive of state.drives) {
    try {
      if (bytesFromUnit(drive.size, drive.unit as StorageCapacityUnit) <= 0n) throw new Error("capacity");
    } catch {
      errors.driveErrors[drive.id] = "Enter a positive capacity as a plain decimal.";
    }
  }

  if (state.drives.length < minimum) {
    errors.inventoryError = `Add at least ${minimum} drive${minimum === 1 ? "" : "s"} for ${raidLevelDetails[state.level].label}.`;
  }
  if (state.level === "raid10" && state.drives.length % 2 !== 0 && state.drives.length >= minimum) {
    errors.inventoryError = "RAID 10 needs an even number of drives.";
  }
  if (state.level === "raid50" || state.level === "raid60") {
    const groupSize = state.groupSize ?? 0;
    const groupMinimum = state.level === "raid50" ? 3 : 4;
    if (groupSize < groupMinimum) {
      errors.groupSizeError = `${raidLevelDetails[state.level].label} needs at least ${groupMinimum} drives in each subgroup.`;
    } else if (state.drives.length >= minimum && state.drives.length % groupSize !== 0) {
      errors.groupSizeError = `${state.drives.length} drives do not divide into equal groups of ${groupSize}.`;
    } else if (state.drives.length >= minimum && state.drives.length / groupSize < 2) {
      errors.groupSizeError = `${raidLevelDetails[state.level].label} needs at least two subgroups.`;
    }
  }

  if (Object.keys(errors.driveErrors).length || errors.inventoryError || errors.groupSizeError) {
    return { errors, calculated: null };
  }
  try {
    const input = buildInput(state);
    const result = calculateRaidCapacity(input);
    if (!result.values) {
      errors.groupSizeError = result.issues.find((issue) => issue.path === "groupSize")?.message ?? "";
      errors.inventoryError = result.issues.find((issue) => issue.path === "drives")?.message ?? "";
      return { errors, calculated: null };
    }
    return { errors, calculated: { input, result } };
  } catch {
    errors.inventoryError = "Check the drive capacities and try again.";
    return { errors, calculated: null };
  }
}

function formatOperationCount(values: RaidCalculationValues) {
  const count = values.smallRandomWrite.operations;
  return `${count} backend operation${count === 1 ? "" : "s"} in the classic model.`;
}

function Result({ calculated, outputUnit, onOutputUnitChange }: {
  calculated: Calculated;
  outputUnit: OutputUnit;
  onOutputUnitChange: (unit: OutputUnit) => void;
}) {
  const values = calculated.result.values as RaidCalculationValues;
  const display = (value: bigint) => formatBytes(value, outputUnit, { maximumFractionDigits: 2 });
  const positions = new Map(calculated.input.drives.map((drive, index) => [drive.id, index + 1]));
  const groupRows = values.groups.map((group) => ({
    id: group.id,
    cells: {
      group: group.label,
      members: group.driveIds.map((id) => `Drive ${positions.get(id) ?? "?"}`).join(", "),
      usable: display(group.usableCapacityBytes),
      mismatch: display(group.sizeMismatchBytes),
    },
  }));
  const groupDetailRows = values.groups.flatMap((group) => [
    { label: `${group.label} raw`, value: `${group.rawCapacityBytes.toLocaleString("en-US")} bytes` },
    ...(group.componentCapacityBytes === null ? [] : [{
      label: `${group.label} component`,
      value: `${group.componentCapacityBytes.toLocaleString("en-US")} bytes`,
    }]),
  ]);

  return (
    <div className={styles.result}>
      <div className={styles.answerHeader}>
        <UiPrimaryResult
          detail={`${values.levelLabel} across ${values.driveCount} drive${values.driveCount === 1 ? "" : "s"}.`}
          label="Theoretical usable capacity"
          value={display(values.usableCapacityBytes.value)}
        />
        <div className={styles.outputUnit}>
          <UiChoiceGroup
            label="Output unit"
            onChange={(unit) => onOutputUnitChange(unit as OutputUnit)}
            options={outputUnits}
            value={outputUnit}
          />
        </div>
      </div>

      <section aria-labelledby="raw-allocation-title" className={styles.resultRegion}>
        <div className={styles.regionHeading}>
          <h3 id="raw-allocation-title">Raw capacity allocation</h3>
          <span>{display(values.rawCapacityBytes.value)} raw</span>
        </div>
        <UiAllocationBar
          ariaLabel="Raw capacity allocation"
          formatValue={(value) => display(value as bigint)}
          palette="categorical"
          segments={[
            { id: "usable", label: "Usable", tone: "chartreuse", value: values.usableCapacityBytes.value },
            { id: "redundancy", label: "Redundancy", tone: "cyan", value: values.redundancyBytes.value },
            { id: "mismatch", label: "Size mismatch", tone: "violet", value: values.sizeMismatchBytes.value },
          ]}
          total={values.rawCapacityBytes.value}
        />
      </section>

      {nestedLevels.has(values.level) ? (
        <section aria-labelledby="nested-groups-title" className={styles.resultRegion}>
          <h3 id="nested-groups-title">Nested drive groups</h3>
          <div className={styles.groupTable}>
            <UiDataTable
              ariaLabel="Nested drive groups"
              columns={[
                { id: "group", label: "Group" }, { id: "members", label: "Members" },
                { id: "usable", label: "Usable" }, { id: "mismatch", label: "Mismatch" },
              ]}
              rows={groupRows}
            />
          </div>
          <div aria-label="Nested drive groups" className={styles.groupRecords}>
            {groupRows.map((row) => (
              <dl key={row.id}>
                <div><dt>Group</dt><dd>{row.cells.group}</dd></div>
                <div><dt>Members</dt><dd>{row.cells.members}</dd></div>
                <div><dt>Usable</dt><dd>{row.cells.usable}</dd></div>
                <div><dt>Mismatch</dt><dd>{row.cells.mismatch}</dd></div>
              </dl>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="array-behavior-title" className={styles.resultRegion}>
        <h3 id="array-behavior-title">Array behavior</h3>
        <UiKeyValueList rows={[
          { label: "Failure tolerance", value: values.failureTolerance.statement },
          { label: "Small random write", value: formatOperationCount(values) },
        ]} />
      </section>

      <UiDisclosure label="Calculation details">
        <div className={styles.details} data-testid="calculation-details">
          <UiKeyValueList rows={[
            { label: "Scenario", value: `${values.levelLabel}, ${values.driveCount} drives` },
            { label: "Formula version", value: String(RAID_CALCULATION_VERSION) },
            ...groupDetailRows,
          ]} />
          <code>{calculated.result.derivation.find((item) => item.id === "capacity_balance")?.result}</code>
          <ul>{calculated.result.assumptions.map((item) => <li key={item.id}>{item.statement}</li>)}</ul>
          <p className={styles.sources}>
            Sources:{" "}
            {calculated.result.sources.map((source, index) => (
              <span key={source.url}>
                {index ? ", " : ""}<a href={source.url}>{source.title}</a>, checked {source.checkedAt}
              </span>
            ))}.
          </p>
        </div>
      </UiDisclosure>
    </div>
  );
}

export function RaidCalculator({ initialState }: { initialState: string }) {
  const restored = useRef<ReturnType<typeof restoreState> | null>(null);
  if (!restored.current) restored.current = restoreState(initialState);
  const [state, setState] = useState<UiState>(restored.current.state);
  const [calculated, setCalculated] = useState<Calculated | null>(restored.current.calculated);
  const [errors, setErrors] = useState<EditorErrors>(EMPTY_ERRORS);
  const [attempted, setAttempted] = useState(false);
  const [outputUnit, setOutputUnit] = useState<OutputUnit>("TiB");
  const [status, setStatus] = useState(restored.current.recovery);
  const userHasEdited = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialState && restored.current?.calculated === null) history.replaceState(null, "", window.location.pathname);
  }, [initialState]);

  useEffect(() => {
    if (!userHasEdited.current) return;
    const url = new URL(window.location.href);
    if (state.drives.length === 0) {
      url.searchParams.delete("state");
    } else {
      try {
        const input = buildInput(state);
        url.searchParams.set("state", raidCalculatorRegistry.encode("raid-capacity", input));
      } catch {
        url.searchParams.delete("state");
      }
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [state]);

  function updateState(nextState: UiState | ((current: UiState) => UiState)) {
    userHasEdited.current = true;
    setCalculated(null);
    setStatus("");
    const next = typeof nextState === "function" ? nextState(state) : nextState;
    setState(next);
    if (attempted) setErrors(validateEditor(next).errors);
  }

  function changeLevel(level: RaidLevel) {
    updateState((current) => ({ ...current, level, groupSize: defaultGroupSize(level) }));
  }

  function updateDrive(id: string, patch: Partial<DriveRow>) {
    updateState((current) => ({
      ...current,
      drives: current.drives.map((drive) => drive.id === id ? { ...drive, ...patch } : drive),
    }));
  }

  function addDrive() {
    if (state.drives.length >= MAX_UI_DRIVES) return;
    updateState((current) => ({
      ...current,
      drives: [...current.drives, { id: `disk-${nextDriveNumber(current.drives)}`, size: "", unit: "TB" }],
    }));
  }

  function removeDrive(id: string) {
    const removedIndex = state.drives.findIndex((drive) => drive.id === id);
    const nextCount = state.drives.length - 1;
    updateState((current) => ({ ...current, drives: current.drives.filter((drive) => drive.id !== id) }));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const focusNumber = Math.min(removedIndex + 1, nextCount);
      const target = nextCount > 0
        ? formRef.current?.querySelector<HTMLElement>(`[aria-label="Remove drive ${focusNumber}"]`)
        : formRef.current?.querySelector<HTMLElement>("[data-add-drive] button");
      target?.focus();
    }));
  }

  function focusFirstError(nextErrors: EditorErrors) {
    if (nextErrors.groupSizeError) {
      formRef.current?.querySelector<HTMLElement>('[data-focus-key="group-size"]')?.focus();
      return;
    }
    const firstDrive = state.drives.find((drive) => nextErrors.driveErrors[drive.id]);
    if (firstDrive) {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${firstDrive.id}"]`)?.focus();
      return;
    }
    if (nextErrors.inventoryError) formRef.current?.querySelector<HTMLElement>("[data-add-drive] button, [data-repeatable-row]:last-child input")?.focus();
  }

  function submit() {
    setAttempted(true);
    setStatus("");
    const checked = validateEditor(state);
    setErrors(checked.errors);
    setCalculated(checked.calculated);
    if (!checked.calculated) {
      focusFirstError(checked.errors);
      return;
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  function reset() {
    userHasEdited.current = true;
    setState(DEFAULT_STATE);
    setCalculated(null);
    setErrors(EMPTY_ERRORS);
    setAttempted(false);
    setOutputUnit("TiB");
    setStatus("");
    history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input[type="radio"][value="raid5"]')?.focus());
  }

  const groupMinimum = state.level === "raid60" ? 4 : 3;

  return (
    <section aria-label="RAID capacity calculator" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); submit(); }} ref={formRef}>
        <UiChoiceGroup
          label="RAID level"
          onChange={(level) => changeLevel(level as RaidLevel)}
          options={levelOptions}
          required
          value={state.level}
        />

        {(state.level === "raid50" || state.level === "raid60") ? (
          <div className={styles.groupSize}>
            <UiNumberField
              dataFocusKey="group-size"
              error={errors.groupSizeError}
              label={`Drives per ${state.level === "raid50" ? "RAID 5" : "RAID 6"} group`}
              min={groupMinimum}
              onChange={(groupSize) => updateState((current) => ({ ...current, groupSize }))}
              required
              step={1}
              suffix="drives"
              value={state.groupSize ?? groupMinimum}
            />
          </div>
        ) : null}

        <section aria-labelledby="drive-inventory-title" className={styles.inventory}>
          <div className={styles.inventoryHeading}>
            <h2 id="drive-inventory-title">Drive inventory</h2>
            {state.drives.length ? <p>{state.drives.length} drive{state.drives.length === 1 ? "" : "s"}</p> : null}
          </div>

          {state.drives.length ? (
            <UiRepeatableList
              addDisabled={state.drives.length >= MAX_UI_DRIVES}
              addLabel="Add drive"
              ariaLabel="Drive inventory"
              items={[...state.drives]}
              onAdd={addDrive}
              onRemove={removeDrive}
              removeLabel={(_, index) => `Remove drive ${index + 1}`}
              renderItem={(drive, index) => (
                <div className={styles.driveEditor}>
                  <span className={styles.driveNumber}>Drive {String(index + 1).padStart(2, "0")}</span>
                  <UiQuantityInput
                    ariaLabel={`Drive ${index + 1} capacity`}
                    dataFocusKey={drive.id}
                    error={errors.driveErrors[drive.id]}
                    label="Capacity"
                    onChange={(size) => updateDrive(drive.id, { size })}
                    onUnitChange={(unit) => updateDrive(drive.id, { unit: unit as InputUnit })}
                    placeholder="4"
                    required
                    unit={drive.unit}
                    unitAriaLabel={`Drive ${index + 1} unit`}
                    units={inputUnits}
                    value={drive.size}
                  />
                </div>
              )}
            />
          ) : (
            <div className={styles.emptyInventory}>
              <p>No drives added.</p>
              <span data-add-drive><UiButton onPress={addDrive} variant="secondary">Add drive</UiButton></span>
            </div>
          )}

          {state.drives.length >= MAX_UI_DRIVES ? <UiStatus>Maximum 64 drives.</UiStatus> : null}
          {errors.inventoryError ? <p className={styles.inventoryError} role="alert">{errors.inventoryError}</p> : null}
        </section>

        <div className={styles.formActions}>
          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate capacity</UiButton>
            {state.drives.length || state.level !== DEFAULT_STATE.level ? (
              <UiButton onPress={reset} type="button" variant="ghost">
                <RotateCcw aria-hidden="true" size={17} /> Reset
              </UiButton>
            ) : null}
          </UiActionRow>
        </div>
        {status ? <UiStatus tone={status.includes("could not") ? "danger" : "neutral"}>{status}</UiStatus> : null}
      </form>

      {calculated ? (
        <div aria-label="RAID capacity result" className={styles.resultFocus} ref={resultRef} tabIndex={-1}>
          <Result calculated={calculated} onOutputUnitChange={setOutputUnit} outputUnit={outputUnit} />
        </div>
      ) : null}
    </section>
  );
}
