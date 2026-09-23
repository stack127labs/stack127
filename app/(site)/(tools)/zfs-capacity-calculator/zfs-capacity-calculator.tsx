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
import { UiButton, UiCheckbox, UiChoiceGroup, UiCopyAction, UiDisclosure, UiNumberField, UiQuantityInput, UiSelect } from "@/app/ui/controls";
import { UiAllocationBar, UiCodeOutput, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
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
const inputUnitOptions = inputUnits.map((unit) => ({ id: unit, label: unit }));

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
        <span>Drive</span><span>Capacity</span><span />
      </div>
      {rows.map((drive, index) => {
        const name = `${groupLabel} drive ${index + 1}`;
        const error = errors[`capacity-${drive.id}`];
        return (
          <div className={styles.driveRow} data-testid={drive.id} key={drive.id}>
            <span className={styles.driveNumber}>{String(index + 1).padStart(2, "0")}</span>
            <UiQuantityInput
              ariaLabel={`${name} capacity`}
              dataFocusKey={`capacity-${drive.id}`}
              error={error}
              hideLabel
              label={`${name} capacity`}
              onChange={(size) => onChange(drive.id, { size })}
              onUnitChange={(unit) => onChange(drive.id, { unit: unit as InputUnit })}
              placeholder="12"
              unit={drive.unit}
              unitAriaLabel={`${name} unit`}
              units={inputUnitOptions}
              value={drive.size}
            />
            <UiButton
              aria-label={`Remove ${name.toLowerCase()}`}
              className={styles.iconButton}
              onPress={() => onRemove(drive.id)}
              variant="icon"
            >
              <Trash2 aria-hidden="true" size={17} />
            </UiButton>
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
  const [count, setCount] = useState(rows.length || minimum);
  const [size, setSize] = useState("");
  const [unit, setUnit] = useState<InputUnit>("TB");

  useEffect(() => {
    setCount(rows.length || minimum);
  }, [minimum, rows.length]);

  const parsedCount = count;
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
        <UiNumberField
          ariaLabel={`${groupLabel} drive count`}
          label="Drives"
          max={maximum}
          min={minimum}
          onChange={setCount}
          value={count}
        />
        <UiQuantityInput
          ariaLabel={`${groupLabel} shared capacity`}
          label="Same capacity"
          onChange={setSize}
          onUnitChange={(value) => setUnit(value as InputUnit)}
          placeholder="18"
          unit={unit}
          unitAriaLabel={`${groupLabel} shared unit`}
          units={inputUnitOptions}
          value={size}
        />
        <UiButton
          aria-label={`Set all drives for ${groupLabel.toLowerCase()}`}
          className={styles.secondaryButton}
          isDisabled={!canApply}
          onPress={() => onApply(parsedCount, size, unit)}
          variant="secondary"
        >
          Set all drives
        </UiButton>
      </div>
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
  const allocation = [
    { id: "writable", label: "Writable", value: values.estimatedWritableBytes.value, tone: "chartreuse" as const },
    { id: "slop", label: "OpenZFS slop", value: values.slopBytes.value, tone: "yellow" as const },
    { id: "redundancy", label: "Redundancy", value: values.losses.redundancyBytes, tone: "cyan" as const },
    { id: "rounding", label: "Block rounding", value: values.losses.sectorRoundingBytes, tone: "blue" as const },
    { id: "padding", label: "RAIDZ padding", value: values.losses.raidzPaddingBytes, tone: "red" as const },
    { id: "mixed", label: "Mixed sizes", value: values.losses.mixedSizeBytes, tone: "violet" as const },
    { id: "alignment", label: "Alignment", value: values.losses.alignmentBytes, tone: "green" as const },
    { id: "tails", label: "Tails", value: values.losses.tailBytes, tone: "strong" as const },
  ];
  const specialEnvelope = values.specialVdevs.reduce((total, special) => total + special.envelopeBytes, 0n);
  const summaryRows = [
    {
      label: "Planning target",
      value: `${display(values.planningTargetBytes.value)} at ${calculated.input.reserveBasisPoints / 100}% headroom`,
    },
    ...(values.conditionalLogicalBytes ? [{
      label: "Conditional logical capacity",
      value: `${display(values.conditionalLogicalBytes.value)} at ${calculated.input.compressionRatio?.numerator ? calculated.input.compressionRatio.numerator / 100 : 1}x compression`,
    }] : []),
  ];

  return (
    <div className={styles.result}>
      <div className={styles.resultHeader}>
        <UiChoiceGroup
          label="Result unit"
          onChange={(unit) => onOutputUnitChange(unit as OutputUnit)}
          options={[{ id: "TiB", label: "TiB" }, { id: "TB", label: "TB" }]}
          value={outputUnit}
        />
      </div>
      <div className={styles.answer}>
        <h2 className={styles.visuallyHidden} ref={resultHeadingRef} tabIndex={-1}>Estimated writable</h2>
        <UiPrimaryResult
          detail="After allocation losses and OpenZFS slop"
          label="Estimated writable"
          value={display(values.estimatedWritableBytes.value)}
        />
        <div data-testid={values.conditionalLogicalBytes ? "conditional-logical" : undefined}>
          <UiKeyValueList rows={summaryRows} />
        </div>
      </div>

      <section className={styles.resultSection}>
        <h2>Vdev boundaries</h2>
        <UiDataTable
          ariaLabel="Vdev boundaries"
          columns={[
            { id: "vdev", label: "Vdev" },
            { id: "layout", label: "Layout" },
            { id: "drives", label: "Drives" },
            { id: "smallest", label: "Smallest" },
            { id: "data", label: "Data" },
            { id: "failure", label: "Failure boundary" },
          ]}
          rows={values.dataVdevs.map((vdev) => ({
            id: vdev.id,
            cells: {
              vdev: vdev.label,
              layout: typeLabel(vdev.type),
              drives: vdev.driveCount,
              smallest: display(vdev.commonMemberBytes),
              data: display(vdev.logicalDataBytes),
              failure: vdev.failureStatement,
            },
          }))}
        />
      </section>

      <section className={styles.resultSection}>
        <div className={styles.sectionHeading}>
          <h2>Capacity allocation</h2>
          <span>Entered: {display(raw)}</span>
        </div>
        <UiAllocationBar
          ariaLabel="Capacity allocation"
          formatValue={(value) => display(value as bigint)}
          palette="categorical"
          segments={allocation}
          total={raw}
        />
      </section>

      {values.roleInventory.length > 0 ? (
        <section className={styles.resultSection}>
          <h2>Auxiliary inventory</h2>
          <UiDataTable
            ariaLabel="Auxiliary inventory"
            columns={[
              { id: "role", label: "Role" },
              { id: "drives", label: "Drives" },
              { id: "inventory", label: "Inventory" },
              { id: "general", label: "General data" },
              { id: "special", label: "Special envelope" },
              { id: "note", label: "Failure note" },
            ]}
            rows={values.roleInventory.map((row) => ({
              id: row.role,
              cells: {
                role: roleLabel(row.role),
                drives: row.driveCount,
                inventory: display(row.inventoryBytes),
                general: display(row.generalDataBytes),
                special: row.role === "special" ? display(specialEnvelope) : "None",
                note: row.role === "special" ? "Special loss can lose pools." : "None",
              },
            }))}
          />
        </section>
      ) : null}

      <UiCodeOutput
        actions={<UiCopyAction label="Copy command" value={values.command} />}
        code={values.command}
        label="Dry-run command"
      />

      <UiDisclosure label="Formula details">
        <UiKeyValueList rows={[
          { label: "Calculation version", value: ZFS_CALCULATION_VERSION },
          { label: "Input version", value: ZFS_INPUT_VERSION },
          { label: "Workload", value: values.workload === "filesystem" ? "Filesystem" : "Zvol" },
          { label: "ashift", value: values.ashift },
          { label: "Block size", value: formatBytes(values.blockSizeBytes, "KiB") },
          { label: "Block model", value: "Selected size only" },
          { label: "Pool state", value: "Fresh topology" },
          { label: "Slop model", value: "Embedded log excluded" },
        ]} />
        <ul className={styles.sourceList}>
          {calculated.result.sources.map((source) => (
            <li key={source.url}><a href={source.url}>{source.title}</a></li>
          ))}
        </ul>
      </UiDisclosure>

      <div className={styles.resultActions}>
        <UiButton className={styles.secondaryButton} onPress={onCopySummary} variant="secondary">
          <Copy aria-hidden="true" size={17} /> Copy summary
        </UiButton>
        <UiButton className={styles.secondaryButton} onPress={onShare} variant="secondary">
          <Share2 aria-hidden="true" size={17} /> Share configuration
        </UiButton>
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
      setStatus("Shared configuration could not be restored.");
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
    <section aria-label="ZFS pool capacity calculator" className={styles.tool} data-tool-workbench>
      <div className={styles.form}>
        <div className={styles.settingsGrid}>
          <UiChoiceGroup
            label="Workload"
            onChange={(value) => changeWorkload(value as ZfsWorkload)}
            options={[{ id: "filesystem", label: "Filesystem" }, { id: "zvol", label: "Zvol" }]}
            required
            value={editor.workload}
          />
          <UiSelect
            label={blockLabel}
            onChange={(value) => mutate((current) => ({ ...current, blockSizeBytes: value }))}
            options={blockOptions.map((size) => ({ id: String(size * 1_024), label: size >= 1_024 ? `${size / 1_024} MiB` : `${size} KiB` }))}
            required
            value={editor.blockSizeBytes}
          />
          <UiSelect
            label="ashift"
            onChange={(value) => mutate((current) => ({ ...current, ashift: value as EditorState["ashift"] }))}
            options={[9, 12, 13, 14].map((value) => ({ id: String(value), label: String(value) }))}
            required
            value={editor.ashift}
          />
          <UiNumberField
            dataFocusKey="slop"
            error={errors.slop}
            label="Slop shift"
            max={31}
            min={1}
            onChange={(value) => mutate((current) => ({ ...current, slopShift: Number.isNaN(value) ? "" : String(value) }))}
            required
            value={Number(editor.slopShift)}
          />
          <UiNumberField
            dataFocusKey="headroom"
            error={errors.headroom}
            label="Planning headroom"
            max={100}
            min={0}
            onChange={(value) => mutate((current) => ({ ...current, headroom: Number.isNaN(value) ? "" : String(value) }))}
            required
            step={1}
            suffix="%"
            value={Number(editor.headroom)}
          />
        </div>

        <div className={styles.advanced}>
          <UiDisclosure label={`Logical capacity scenario, ${editor.compressionEnabled ? `${editor.compressionRatio}x` : "off"}`}>
          <div className={styles.optionalGrid}>
            <UiCheckbox
              isSelected={editor.compressionEnabled}
              onChange={(compressionEnabled) => mutate((current) => ({ ...current, compressionEnabled }))}
            >
              Compression scenario
            </UiCheckbox>
            {editor.compressionEnabled ? (
              <UiNumberField
                dataFocusKey="compression"
                error={errors.compression}
                label="Compression ratio"
                min={1}
                onChange={(value) => mutate((current) => ({ ...current, compressionRatio: Number.isNaN(value) ? "" : String(value) }))}
                required
                step={0.1}
                suffix="×"
                value={Number(editor.compressionRatio)}
              />
            ) : null}
          </div>
          </UiDisclosure>
        </div>

        <section className={styles.editorSection} aria-labelledby="data-vdevs-heading">
          <div className={styles.editorHeading}>
            <div><h2 id="data-vdevs-heading">Data vdevs</h2><span>{editor.dataVdevs.length} configured</span></div>
            <UiButton
              className={styles.secondaryButton}
              data-focus-key="add-data"
              isDisabled={editor.dataVdevs.length >= 64}
              onPress={addDataVdev}
              variant="secondary"
            >
              <Plus aria-hidden="true" size={17} /> Add data vdev
            </UiButton>
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
                      <div className={styles.vdevTypeField}>
                        <UiSelect
                          ariaLabel={`${label} type`}
                          dataFocusKey={`type-${vdev.id}`}
                          hideLabel
                          label="Layout"
                          onChange={(value) => updateDataVdev(vdev.id, { type: value as ZfsDataVdevType })}
                          options={vdevTypes.map((type) => ({ id: type, label: typeLabel(type) }))}
                          value={vdev.type}
                        />
                      </div>
                      <UiButton aria-label={`Duplicate ${label.toLowerCase()}`} className={styles.iconButton} onPress={() => duplicateVdev(vdev.id)} title="Duplicate vdev" variant="icon"><Copy aria-hidden="true" size={16} /></UiButton>
                      <UiButton aria-label={`Move ${label.toLowerCase()} up`} className={styles.iconButton} isDisabled={index === 0} onPress={() => moveVdev(vdev.id, -1)} title="Move vdev up" variant="icon"><ChevronUp aria-hidden="true" size={17} /></UiButton>
                      <UiButton aria-label={`Move ${label.toLowerCase()} down`} className={styles.iconButton} isDisabled={index === editor.dataVdevs.length - 1} onPress={() => moveVdev(vdev.id, 1)} title="Move vdev down" variant="icon"><ChevronDown aria-hidden="true" size={17} /></UiButton>
                      <UiButton aria-label={`Remove ${label.toLowerCase()}`} className={styles.iconButton} onPress={() => removeVdev(vdev.id)} title="Remove vdev" variant="icon"><Trash2 aria-hidden="true" size={17} /></UiButton>
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
                  <UiButton className={styles.addDriveButton} isDisabled={vdev.drives.length >= 64 || totalDriveCount(editor) >= MAX_UI_DRIVES} onPress={() => addDataDrive(vdev.id)} variant="secondary">
                    <Plus aria-hidden="true" size={16} /> Add drive to {label.toLowerCase()}
                  </UiButton>
                </section>
              );
            })}
          </div>
        </section>

        <div className={styles.advanced}>
          <UiDisclosure label={`Optional devices, ${editor.auxiliaryGroups.length} ${editor.auxiliaryGroups.length === 1 ? "group" : "groups"}`}>
          <section className={styles.optionalSection} aria-label="Optional devices">
          <div className={styles.auxiliaryAdd}>
            <UiSelect
              ariaLabel="Optional device role"
              label="Auxiliary role"
              onChange={(value) => setEditor((current) => ({ ...current, auxiliaryChoice: value as ZfsAuxiliaryRole }))}
              options={auxiliaryRoles.map((role) => ({ id: role, label: roleLabel(role) }))}
              value={editor.auxiliaryChoice}
            />
            <UiButton className={styles.secondaryButton} isDisabled={editor.auxiliaryGroups.length >= 64} onPress={addAuxiliary} variant="secondary">
              <Plus aria-hidden="true" size={17} /> Add auxiliary role
            </UiButton>
          </div>
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
                        <UiSelect
                          ariaLabel={`${label} layout`}
                          hideLabel
                          label={`${label} layout`}
                          onChange={(value) => updateAuxiliary(group.id, { layout: value as ZfsAuxiliaryLayout })}
                          options={[{ id: "single", label: "Single" }, { id: "mirror", label: "Mirror" }]}
                          value={group.layout}
                        />
                      ) : null}
                      <UiButton aria-label={`Remove ${label.toLowerCase()}`} className={styles.iconButton} onPress={() => removeAuxiliary(group.id)} variant="icon"><Trash2 aria-hidden="true" size={17} /></UiButton>
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
                    <UiButton className={styles.addDriveButton} onPress={() => addAuxiliaryDrive(group.id)} variant="secondary">
                      <Plus aria-hidden="true" size={16} /> Add drive to {label.toLowerCase()}
                    </UiButton>
                  ) : null}
                </section>
              );
            })}
          </div>
          </section>
          </UiDisclosure>
        </div>

        {errors._form ? <p className={styles.formError} role="alert">{errors._form}</p> : null}
        <div className={styles.actionRow}>
          <UiButton aria-label="Reset calculator" className={styles.resetButton} onPress={resetCalculator} variant="secondary">
            <RotateCcw aria-hidden="true" size={17} /> Reset
          </UiButton>
          <UiButton className={styles.primaryButton} isDisabled={editor.dataVdevs.length === 0} onPress={calculatePool} variant="primary">
            Calculate pool
          </UiButton>
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
        {status ? <UiStatus tone={status.includes("blocked") || status.includes("failed") ? "danger" : "neutral"}>{status}</UiStatus> : null}
        {shareUrl ? <input aria-label="Shared URL" className={styles.shareUrl} readOnly value={shareUrl} /> : null}
      </div>
    </section>
  );
}
