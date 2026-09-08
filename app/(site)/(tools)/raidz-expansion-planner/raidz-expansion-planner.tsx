"use client";

import {
  ToolActionRow,
  ToolAllocationBar,
  ToolButton,
  ToolChoiceGroup,
  ToolDataTable,
  ToolDisclosure,
  ToolKeyValueList,
  ToolPrimaryResult,
  ToolQuantityInput,
  ToolSelect,
  ToolStatus,
  ToolTextField,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  RAIDZ_EXPANSION_CALCULATION_VERSION,
  RAIDZ_EXPANSION_INPUT_VERSION,
  buildRaidzExpansionCopySummary,
  buildRaidzExpansionLiveSummary,
  calculateRaidzExpansion,
  convertRaidzExpansionEditorCapacity,
  decodeStorageState,
  formatRaidzExpansionEditorCapacity,
  formatRaidzExpansionBytes,
  parseRaidzExpansionCapacity,
  raidzExpansionCalculatorRegistry,
  validateRaidzExpansionInput,
  type RaidzExpansionCapacityUnit,
  type RaidzExpansionInput,
  type RaidzExpansionLevel,
  type RaidzExpansionValues,
  type RaidzExpansionWorkload,
  type StorageCalculationResult,
} from "@/lib/storage/index.ts";
import { parseZfsPaddingBlockSize, type ZfsPaddingUnit } from "@/lib/storage/zfs-padding.ts";
import { Copy, RotateCcw, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./raidz-expansion-planner.module.css";

type Editor = {
  level: RaidzExpansionLevel;
  currentWidth: string;
  finalWidth: string;
  memberValue: string;
  memberUnit: RaidzExpansionCapacityUnit;
  addedValue: string;
  addedUnit: RaidzExpansionCapacityUnit;
  allocatedValue: string;
  allocatedUnit: RaidzExpansionCapacityUnit;
  workload: RaidzExpansionWorkload;
  blockSizeBytes: string;
  customBlock: boolean;
  customBlockValue: string;
  customBlockUnit: ZfsPaddingUnit;
  ashift: "9" | "12" | "13" | "14";
};

type Calculated = {
  input: RaidzExpansionInput;
  result: StorageCalculationResult<RaidzExpansionValues>;
};

const blockSizes = Array.from({ length: 16 }, (_, index) => 512 * 2 ** index);
const capacityUnits = ["GB", "TB", "GiB", "TiB"].map((unit) => toolOption(unit, unit));
const blockUnits = ["B", "KiB", "MiB"].map((unit) => toolOption(unit, unit));
const displayUnits = ["TB", "TiB"].map((unit) => toolOption(unit, unit));
const ashiftOptions = [9, 12, 13, 14].map((ashift) => toolOption(String(ashift), `${ashift} (${1 << ashift} B)`));

function defaults(): Editor {
  return {
    level: "raidz2",
    currentWidth: "6",
    finalWidth: "7",
    memberValue: "8",
    memberUnit: "TB",
    addedValue: "8",
    addedUnit: "TB",
    allocatedValue: "",
    allocatedUnit: "TB",
    workload: "filesystem",
    blockSizeBytes: "131072",
    customBlock: false,
    customBlockValue: "128",
    customBlockUnit: "KiB",
    ashift: "12",
  };
}

function editorFromInput(input: RaidzExpansionInput): Editor {
  const member = formatRaidzExpansionEditorCapacity(input.memberBytes);
  const added = formatRaidzExpansionEditorCapacity(input.addedDiskBytes);
  const allocated = formatRaidzExpansionEditorCapacity(input.allocatedBytes);
  const preset = blockSizes.some((size) => BigInt(size) === input.blockSizeBytes);
  return {
    level: input.level,
    currentWidth: String(input.currentWidth),
    finalWidth: String(input.finalWidth),
    memberValue: member.value,
    memberUnit: member.unit,
    addedValue: added.value,
    addedUnit: added.unit,
    allocatedValue: allocated.value,
    allocatedUnit: allocated.unit,
    workload: input.workload,
    blockSizeBytes: input.blockSizeBytes.toString(),
    customBlock: !preset,
    customBlockValue: input.blockSizeBytes.toString(),
    customBlockUnit: "B",
    ashift: String(input.ashift) as Editor["ashift"],
  };
}

function parseInteger(value: string) {
  if (!/^\d+$/.test(value) || value.length > 3) throw new Error("integer");
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error("integer");
  return parsed;
}

function compile(editor: Editor) {
  const errors: Record<string, string> = {};
  let currentWidth = 0;
  let finalWidth = 0;
  try { currentWidth = parseInteger(editor.currentWidth); } catch { errors.currentWidth = "Use a whole member count."; }
  try { finalWidth = parseInteger(editor.finalWidth); } catch { errors.finalWidth = "Use a whole member count."; }

  let memberBytes = 0n;
  let addedDiskBytes = 0n;
  let allocatedBytes = -1n;
  try { memberBytes = parseRaidzExpansionCapacity(editor.memberValue, editor.memberUnit); } catch { errors.memberBytes = "Enter an exact capacity."; }
  try { addedDiskBytes = parseRaidzExpansionCapacity(editor.addedValue, editor.addedUnit); } catch { errors.addedDiskBytes = "Enter an exact capacity."; }
  if (!editor.allocatedValue) errors.allocatedBytes = "Enter physical allocation.";
  else try { allocatedBytes = parseRaidzExpansionCapacity(editor.allocatedValue, editor.allocatedUnit); } catch { errors.allocatedBytes = "Enter an exact allocation."; }

  let blockSizeBytes = 0n;
  try {
    blockSizeBytes = editor.customBlock
      ? parseZfsPaddingBlockSize(editor.customBlockValue, editor.customBlockUnit)
      : BigInt(editor.blockSizeBytes);
  } catch {
    errors.blockSizeBytes = "Enter an exact block size.";
  }

  const input: RaidzExpansionInput = {
    level: editor.level,
    currentWidth,
    finalWidth,
    memberBytes,
    addedDiskBytes,
    allocatedBytes,
    workload: editor.workload,
    blockSizeBytes,
    ashift: Number(editor.ashift) as RaidzExpansionInput["ashift"],
  };
  const result = calculateRaidzExpansion(input);
  for (const item of result.issues) errors[item.path ?? "form"] ??= item.message;
  return { input, errors, valid: Object.keys(errors).length === 0 && validateRaidzExpansionInput(input) };
}

function blockLabel(bytes: number) {
  if (bytes >= 1_048_576) return `${bytes / 1_048_576} MiB`;
  if (bytes >= 1_024) return `${bytes / 1_024} KiB`;
  return `${bytes} B`;
}

function displayUnitFor(unit: RaidzExpansionCapacityUnit): "TB" | "TiB" {
  return unit.endsWith("iB") ? "TiB" : "TB";
}

export function RaidzExpansionPlanner({ initialState }: { initialState: string }) {
  const [editor, setEditor] = useState(defaults);
  const [calculated, setCalculated] = useState<Calculated | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"neutral" | "success" | "danger">("neutral");
  const [shareUrl, setShareUrl] = useState("");
  const [displayUnit, setDisplayUnit] = useState<"TB" | "TiB">("TB");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialState) return;
    try {
      const state = decodeStorageState(initialState);
      if (
        state.calculatorId !== "raidz-expansion"
        || state.calculatorVersion !== RAIDZ_EXPANSION_CALCULATION_VERSION
        || state.inputVersion !== RAIDZ_EXPANSION_INPUT_VERSION
        || !validateRaidzExpansionInput(state.payload)
      ) throw new Error("state");
      const result = calculateRaidzExpansion(state.payload);
      if (!result.values) throw new Error("state");
      const restored = editorFromInput(state.payload);
      setEditor(restored);
      setCalculated({ input: state.payload, result });
      setDisplayUnit(displayUnitFor(restored.memberUnit));
      setFeedback("Shared plan loaded");
      setFeedbackTone("neutral");
      setShareUrl(window.location.href);
    } catch {
      setEditor(defaults());
      setCalculated(null);
      setFeedback("Shared plan could not load");
      setFeedbackTone("danger");
      history.replaceState(null, "", window.location.pathname);
    }
  }, [initialState]);

  function update(next: Editor, dependent = false) {
    setEditor(next);
    setCalculated(null);
    setFeedback("");
    setShareUrl("");
    setErrors(dependent ? compile(next).errors : {});
    if (window.location.search) history.replaceState(null, "", window.location.pathname);
  }

  function focusError(nextErrors: Record<string, string>, customBlock: boolean) {
    const keys = ["currentWidth", "finalWidth", "memberBytes", "addedDiskBytes", "allocatedBytes", "blockSizeBytes"];
    const focusKeys: Record<string, string> = {
      currentWidth: "current-width",
      finalWidth: "final-width",
      memberBytes: "member-bytes",
      addedDiskBytes: "added-bytes",
      allocatedBytes: "allocated-bytes",
      blockSizeBytes: customBlock ? "custom-block" : "block-size",
    };
    const first = keys.find((key) => nextErrors[key]);
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusKeys[first]}"]`)?.focus();
  }

  function plan() {
    const next = compile(editor);
    setErrors(next.errors);
    setFeedback("");
    if (!next.valid) {
      setCalculated(null);
      focusError(next.errors, editor.customBlock);
      return;
    }
    try {
      const result = calculateRaidzExpansion(next.input);
      if (!result.values) throw new Error("result");
      setCalculated({ input: next.input, result });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setCalculated(null);
      setFeedback("Planning failed. Try again.");
      setFeedbackTone("danger");
    }
  }

  function reset() {
    setEditor(defaults());
    setCalculated(null);
    setErrors({});
    setFeedback("");
    setShareUrl("");
    setDisplayUnit("TB");
    history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLInputElement>('input[type="radio"][value="raidz1"]')?.focus();
    });
  }

  async function copy() {
    if (!calculated?.result.values) return;
    try {
      await navigator.clipboard.writeText(buildRaidzExpansionCopySummary(calculated.input, calculated.result.values, displayUnit));
      setFeedback("Copied");
      setFeedbackTone("success");
    } catch {
      setFeedback("Copy failed");
      setFeedbackTone("danger");
    }
  }

  async function share() {
    if (!calculated?.result.values) return;
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("state", raidzExpansionCalculatorRegistry.encode("raidz-expansion", calculated.input));
      history.replaceState(null, "", url);
      setShareUrl(url.toString());
      try {
        await navigator.clipboard.writeText(url.toString());
        setFeedback("Share link copied");
        setFeedbackTone("success");
      } catch {
        setFeedback("Link ready. Copy failed.");
        setFeedbackTone("danger");
      }
    } catch {
      setFeedback("Share failed");
      setFeedbackTone("danger");
    }
  }

  function changeCapacityUnit(field: "member" | "added" | "allocated", unit: RaidzExpansionCapacityUnit) {
    const valueKey = field === "member" ? "memberValue" : field === "added" ? "addedValue" : "allocatedValue";
    const unitKey = field === "member" ? "memberUnit" : field === "added" ? "addedUnit" : "allocatedUnit";
    const errorKey = field === "member" ? "memberBytes" : field === "added" ? "addedDiskBytes" : "allocatedBytes";
    try {
      const converted = convertRaidzExpansionEditorCapacity(editor[valueKey], editor[unitKey], unit);
      update({ ...editor, [valueKey]: converted.value, [unitKey]: converted.unit });
    } catch {
      setEditor({ ...editor, [unitKey]: unit });
      setCalculated(null);
      setFeedback("");
      setShareUrl("");
      setErrors({ [errorKey]: "Convert a valid capacity first." });
      if (window.location.search) history.replaceState(null, "", window.location.pathname);
    }
  }

  function changeWorkload(workload: RaidzExpansionWorkload) {
    const selectedBytes = BigInt(editor.blockSizeBytes);
    const needsCustom = workload === "zvol" && selectedBytes > 131_072n;
    update({
      ...editor,
      workload,
      customBlock: needsCustom || editor.customBlock,
      customBlockValue: needsCustom ? selectedBytes.toString() : editor.customBlockValue,
      customBlockUnit: needsCustom ? "B" : editor.customBlockUnit,
    }, true);
  }

  const values = calculated?.result.values ?? null;
  const modelProperty = editor.workload === "filesystem" ? "recordsize" : "volblocksize";
  const blockOptions = blockSizes
    .filter((bytes) => editor.workload === "filesystem" || bytes <= 131_072)
    .map((bytes) => toolOption(String(bytes), blockLabel(bytes)))
    .concat(toolOption("custom", "Custom"));
  const stepRows = values ? values.steps.map((step, index) => ({
    id: String(step.width),
    cells: {
      attach: `Disk ${index + 1}`,
      width: String(step.width),
      gain: formatRaidzExpansionBytes(step.immediateGainBytes, displayUnit),
      modeled: formatRaidzExpansionBytes(step.immediateLogicalBytes, displayUnit),
      fresh: formatRaidzExpansionBytes(step.nativeLogicalBytes, displayUnit),
      gap: formatRaidzExpansionBytes(step.geometryGapBytes, displayUnit),
    },
  })) : [];

  return (
    <section aria-label="RAIDZ expansion planner" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); plan(); }} ref={formRef}>
        <ToolChoiceGroup
          label="RAIDZ level"
          onChange={(level) => update({ ...editor, level: level as RaidzExpansionLevel }, true)}
          options={[toolOption("raidz1", "RAIDZ1"), toolOption("raidz2", "RAIDZ2"), toolOption("raidz3", "RAIDZ3")]}
          required
          value={editor.level}
        />

        <div className={styles.widthFields}>
          <ToolTextField autoCapitalize="none" dataFocusKey="current-width" error={errors.currentWidth} inputMode="numeric" label="Current width" onChange={(currentWidth) => update({ ...editor, currentWidth })} required spellCheck={false} value={editor.currentWidth} />
          <ToolTextField autoCapitalize="none" dataFocusKey="final-width" error={errors.finalWidth} inputMode="numeric" label="Final width" onChange={(finalWidth) => update({ ...editor, finalWidth })} required spellCheck={false} value={editor.finalWidth} />
        </div>

        <div className={styles.capacityFields}>
          <ToolQuantityInput dataFocusKey="member-bytes" error={errors.memberBytes} label="Smallest existing member" onChange={(memberValue) => update({ ...editor, memberValue })} onUnitChange={(memberUnit) => changeCapacityUnit("member", memberUnit as RaidzExpansionCapacityUnit)} required unit={editor.memberUnit} unitAriaLabel="Smallest member unit" units={capacityUnits} value={editor.memberValue} />
          <ToolQuantityInput dataFocusKey="added-bytes" error={errors.addedDiskBytes} label="Each added disk" onChange={(addedValue) => update({ ...editor, addedValue })} onUnitChange={(addedUnit) => changeCapacityUnit("added", addedUnit as RaidzExpansionCapacityUnit)} required unit={editor.addedUnit} unitAriaLabel="Each added disk unit" units={capacityUnits} value={editor.addedValue} />
          <ToolQuantityInput dataFocusKey="allocated-bytes" description="Use this vdev's ALLOC value from zpool list -vp." error={errors.allocatedBytes} label="Current physical allocation" onChange={(allocatedValue) => update({ ...editor, allocatedValue })} onUnitChange={(allocatedUnit) => changeCapacityUnit("allocated", allocatedUnit as RaidzExpansionCapacityUnit)} required unit={editor.allocatedUnit} unitAriaLabel="Current physical allocation unit" units={capacityUnits} value={editor.allocatedValue} />
        </div>

        <div className={styles.modelFields}>
          <ToolChoiceGroup label="Workload" onChange={(workload) => changeWorkload(workload as RaidzExpansionWorkload)} options={[toolOption("filesystem", "Filesystem"), toolOption("zvol", "Zvol")]} required value={editor.workload} />
          <div className={styles.blockFields}>
            <ToolSelect dataFocusKey="block-size" error={!editor.customBlock ? errors.blockSizeBytes : undefined} label={modelProperty} onChange={(value) => update({ ...editor, customBlock: value === "custom", blockSizeBytes: value === "custom" ? editor.blockSizeBytes : value }, true)} options={blockOptions} required value={editor.customBlock ? "custom" : editor.blockSizeBytes} />
            {editor.customBlock ? <ToolQuantityInput dataFocusKey="custom-block" error={errors.blockSizeBytes} label="Custom block size" onChange={(customBlockValue) => update({ ...editor, customBlockValue })} onUnitChange={(customBlockUnit) => update({ ...editor, customBlockUnit: customBlockUnit as ZfsPaddingUnit }, true)} required unit={editor.customBlockUnit} unitAriaLabel="Custom block unit" units={blockUnits} value={editor.customBlockValue} /> : null}
          </div>
          <ToolSelect label="ashift" onChange={(ashift) => update({ ...editor, ashift: ashift as Editor["ashift"] }, true)} options={ashiftOptions} required value={editor.ashift} />
        </div>

        <div className={styles.formActions}>
          <ToolActionRow>
            <ToolButton className={styles.actionButton} type="submit" variant="primary">Plan expansion</ToolButton>
            <ToolButton className={styles.actionButton} onPress={reset} type="button" variant="ghost"><RotateCcw aria-hidden="true" size={18} />Reset</ToolButton>
          </ToolActionRow>
        </div>
      </form>

      {values && calculated ? (
        <div className={styles.result}>
          <div className={styles.answerHeader} data-result-lead ref={resultRef} tabIndex={-1}>
            <ToolPrimaryResult
              detail={<>Modeled logical capacity rises from {formatRaidzExpansionBytes(values.current.immediateLogicalBytes, displayUnit)} to {formatRaidzExpansionBytes(values.final.immediateLogicalBytes, displayUnit)} at {values.finalWidth} members. {values.level.toUpperCase()} stays {values.level.toUpperCase()}.</>}
              label="Modeled capacity gained"
              value={formatRaidzExpansionBytes(values.final.immediateGainBytes, displayUnit)}
            />
            <div className={styles.displayUnit}><ToolSelect ariaLabel="Display unit" hideLabel label="Display unit" onChange={(unit) => setDisplayUnit(unit as "TB" | "TiB")} options={displayUnits} value={displayUnit} /></div>
          </div>
          <p className={styles.reportingBoundary}>Live reported capacity is not predicted by this model.</p>

          <section aria-labelledby="composition-title" className={styles.composition}>
            <h3 id="composition-title">Fresh {values.finalWidth}-member logical envelope: {formatRaidzExpansionBytes(values.final.nativeLogicalBytes, displayUnit)}</h3>
            <ToolAllocationBar
              ariaLabel={`Fresh ${values.finalWidth}-member logical envelope`}
              formatValue={(value) => formatRaidzExpansionBytes(value as bigint, displayUnit)}
              palette="categorical"
              segments={[
                { id: "old", label: "Old-width logical data", tone: "chartreuse", value: values.oldLogicalBytes },
                { id: "writable", label: "Writable at final width", tone: "cyan", value: values.final.newWritableLogicalBytes },
                { id: "gap", label: "Geometry gap", tone: "violet", value: values.final.geometryGapBytes },
              ]}
              total={values.final.nativeLogicalBytes}
            />
            <p className={styles.srOnly}>{values.oldLogicalBytes} B plus {values.final.newWritableLogicalBytes} B plus {values.final.geometryGapBytes} B equals the fresh comparator of {values.final.nativeLogicalBytes} B.</p>
          </section>

          <section className={styles.steps} aria-labelledby="steps-title">
            <h3 id="steps-title">Expansion steps</h3>
            <ToolDataTable ariaLabel="Expansion steps" columns={[{ id: "attach", label: "After attach" }, { id: "width", label: "Width" }, { id: "gain", label: "Gain from current" }, { id: "modeled", label: "Modeled capacity" }, { id: "fresh", label: "Fresh comparator" }, { id: "gap", label: "Gap" }]} rows={stepRows} />
          </section>

          <ToolDisclosure label="Calculation details">
            <div className={styles.details}>
              <h3>Scenario and model</h3>
              <ToolKeyValueList rows={[
                { label: "RAIDZ level", value: values.level.toUpperCase() },
                { label: "Widths", value: `${values.currentWidth} to ${values.finalWidth} members` },
                { label: "Smallest member", value: `${calculated.input.memberBytes} B` },
                { label: "Each added disk", value: `${calculated.input.addedDiskBytes} B` },
                { label: "Current physical allocation", value: `${calculated.input.allocatedBytes} B` },
                { label: "Workload", value: calculated.input.workload === "filesystem" ? "Filesystem" : "Zvol" },
                { label: modelProperty, value: `${calculated.input.blockSizeBytes} B` },
                { label: "ashift", value: `${calculated.input.ashift}, ${values.sectorBytes} B sectors` },
                { label: "Aligned member bytes", value: `${values.alignedMemberBytes} B` },
                { label: "Old block count", value: values.oldBlockCount.toString() },
                { label: "Old logical bytes", value: `${values.oldLogicalBytes} B` },
                { label: "Physical remainder", value: `${values.occupancyRemainderBytes} B` },
                ...(values.totalAddedDiskExcessBytes > 0n ? [
                  { label: "Excluded excess per disk", value: `${values.addedDiskExcessBytes} B` },
                  { label: "Total excluded disk excess", value: `${values.totalAddedDiskExcessBytes} B` },
                ] : []),
                { label: "Formula", value: `v${RAIDZ_EXPANSION_CALCULATION_VERSION}` },
              ]} />

              <h3>Exact allocation by width</h3>
              <div className={styles.tableScroll}>
                <table aria-label="Exact allocation by width" className={styles.exactTable}>
                  <thead><tr><th scope="col">Width</th><th scope="col">Sectors per block</th><th scope="col">Block physical bytes</th><th scope="col">Common raw bytes</th><th scope="col">Free physical bytes</th><th scope="col">New block count</th><th scope="col">Writable logical bytes</th><th scope="col">Modeled capacity</th><th scope="col">Fresh comparator</th><th scope="col">Gap bytes</th></tr></thead>
                  <tbody>{[values.current, ...values.steps].map((step) => <tr data-trace-width={step.width} key={step.width}><th scope="row">{step.width}</th><td>{step.allocation.allocatedSectors.toString()}</td><td>{step.blockPhysicalBytes.toString()} B</td><td>{step.commonRawBytes.toString()} B</td><td>{step.freePhysicalBytes.toString()} B</td><td>{step.newBlockCount.toString()}</td><td>{step.newWritableLogicalBytes.toString()} B</td><td>{step.immediateLogicalBytes.toString()} B</td><td>{step.nativeLogicalBytes.toString()} B</td><td>{step.geometryGapBytes.toString()} B</td></tr>)}</tbody>
                </table>
              </div>

              <h3>Assumptions</h3>
              <ul>{calculated.result.assumptions.map((assumption) => <li key={assumption.id}>{assumption.statement}</li>)}</ul>
              <h3>Sources</h3>
              <ul>{calculated.result.sources.map((source) => <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a>, checked {source.checkedAt}</li>)}</ul>
            </div>
          </ToolDisclosure>

          <div className={styles.resultActions}>
            <ToolActionRow>
              <ToolButton className={styles.actionButton} onPress={copy} type="button" variant="secondary"><Copy aria-hidden="true" size={18} />Copy summary</ToolButton>
              <ToolButton className={styles.actionButton} onPress={share} type="button" variant="secondary"><Share2 aria-hidden="true" size={18} />Share plan</ToolButton>
            </ToolActionRow>
          </div>
          {shareUrl && feedback === "Link ready. Copy failed." ? <ToolTextField label="Share link" onChange={() => {}} readOnly value={shareUrl} /> : null}
        </div>
      ) : null}

      {feedback ? <ToolStatus tone={feedbackTone}>{feedback}</ToolStatus> : null}
      {values ? <p aria-live="polite" className={styles.srOnly}>{buildRaidzExpansionLiveSummary(values, displayUnit)}</p> : null}
    </section>
  );
}
