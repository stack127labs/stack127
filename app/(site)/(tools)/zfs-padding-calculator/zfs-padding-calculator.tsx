"use client";

import {
  ToolActionRow,
  ToolAllocationBar,
  ToolButton,
  ToolChoiceGroup,
  ToolCopyAction,
  ToolDataTable,
  ToolDisclosure,
  ToolKeyValueList,
  ToolPrimaryResult,
  ToolQuantityInput,
  ToolSelect,
  ToolTextField,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  ZFS_PADDING_CALCULATION_VERSION,
  ZFS_PADDING_INPUT_VERSION,
  buildZfsPaddingCopySummary,
  calculateZfsPadding,
  decodeStorageState,
  formatZfsPaddingBytes,
  formatZfsPaddingPercentage,
  parseZfsPaddingBlockSize,
  validateZfsPaddingInput,
  zfsPaddingCalculatorRegistry,
  type StorageCalculationResult,
  type ZfsPaddingInput,
  type ZfsPaddingLevel,
  type ZfsPaddingUnit,
  type ZfsPaddingValues,
  type ZfsPaddingWorkload,
} from "@/lib/storage/index.ts";
import { RotateCcw, Share2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import styles from "./zfs-padding-calculator.module.css";

type EditorState = {
  level: ZfsPaddingLevel;
  width: string;
  workload: ZfsPaddingWorkload;
  blockSize: string;
  custom: boolean;
  customValue: string;
  customUnit: ZfsPaddingUnit;
  ashift: "9" | "12" | "13" | "14";
};

type Calculated = {
  input: ZfsPaddingInput;
  result: StorageCalculationResult<ZfsPaddingValues>;
};

const KiB = 1_024;
const MiB = 1_048_576;
const allBlockSizes = Array.from({ length: 16 }, (_, index) => 512 * 2 ** index);
const levelOptions = ["raidz1", "raidz2", "raidz3"].map((level) => toolOption(level, level.toUpperCase()));
const workloadOptions = [toolOption("filesystem", "Filesystem"), toolOption("zvol", "Zvol")];
const ashiftOptions = [
  toolOption("9", "9, 512 B"),
  toolOption("12", "12, 4 KiB"),
  toolOption("13", "13, 8 KiB"),
  toolOption("14", "14, 16 KiB"),
];
const sizeUnits = ["B", "KiB", "MiB"].map((unit) => toolOption(unit, unit));

function defaultEditor(): EditorState {
  return {
    level: "raidz2",
    width: "6",
    workload: "filesystem",
    blockSize: String(128 * KiB),
    custom: false,
    customValue: "128",
    customUnit: "KiB",
    ashift: "12",
  };
}

function editorFromInput(input: ZfsPaddingInput): EditorState {
  return {
    level: input.level,
    width: String(input.width),
    workload: input.workload,
    blockSize: input.blockSizeBytes.toString(),
    custom: false,
    customValue: input.blockSizeBytes.toString(),
    customUnit: "B",
    ashift: String(input.ashift) as EditorState["ashift"],
  };
}

function presetLabel(bytes: number) {
  if (bytes >= MiB) return `${bytes / MiB} MiB`;
  if (bytes >= KiB) return `${bytes / KiB} KiB`;
  return `${bytes} B`;
}

function compileEditor(editor: EditorState) {
  const errors: Record<string, string> = {};
  const trimmedWidth = editor.width.trim();
  let width = 0;
  if (trimmedWidth.length > 3 || !/^\d+$/.test(trimmedWidth)) {
    errors.width = "Use a whole member count.";
  } else {
    width = Number(trimmedWidth);
    const minimum = Number(editor.level.at(-1)) + 1;
    if (width < minimum) errors.width = `${editor.level.toUpperCase()} needs at least ${minimum} members.`;
    else if (width > 64) errors.width = "Use at most 64 members.";
  }

  let blockSizeBytes = 0n;
  try {
    blockSizeBytes = editor.custom
      ? parseZfsPaddingBlockSize(editor.customValue, editor.customUnit)
      : BigInt(editor.blockSize);
  } catch {
    errors.blockSizeBytes = "Enter an exact block size.";
  }

  const input: ZfsPaddingInput = {
    level: editor.level,
    width,
    workload: editor.workload,
    blockSizeBytes,
    ashift: Number(editor.ashift) as ZfsPaddingInput["ashift"],
  };
  const result = calculateZfsPadding(input);
  for (const issue of result.issues) {
    if (issue.path === "width") errors.width ??= issue.message;
    if (issue.path === "blockSizeBytes") errors.blockSizeBytes ??= issue.message;
  }
  return { input, errors, valid: Object.keys(errors).length === 0 && validateZfsPaddingInput(input) };
}

function derivationLabel(id: string) {
  return id.split("_").map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ");
}

export function ZfsPaddingCalculator({ initialState }: { initialState: string }) {
  const [editor, setEditor] = useState(defaultEditor);
  const [calculated, setCalculated] = useState<Calculated | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const failureRef = useRef<HTMLParagraphElement>(null);
  const focusCustom = useRef(false);

  useEffect(() => {
    if (!initialState) return;
    try {
      const state = decodeStorageState(initialState);
      if (
        state.calculatorId !== "zfs-padding"
        || state.calculatorVersion !== ZFS_PADDING_CALCULATION_VERSION
        || state.inputVersion !== ZFS_PADDING_INPUT_VERSION
        || !validateZfsPaddingInput(state.payload)
      ) throw new Error("Unsupported state");
      const result = calculateZfsPadding(state.payload);
      if (!result.values) throw new Error("Invalid result");
      setEditor(editorFromInput(state.payload));
      setCalculated({ input: state.payload, result });
      setRestoreStatus("Shared configuration loaded");
    } catch {
      setEditor(defaultEditor());
      setCalculated(null);
      setRestoreStatus("Shared configuration could not be restored");
      history.replaceState(null, "", window.location.pathname);
    }
  }, [initialState]);

  useEffect(() => {
    if (!editor.custom || !focusCustom.current) return;
    formRef.current?.querySelector<HTMLElement>('[data-focus-key="custom-block"]')?.focus();
    focusCustom.current = false;
  }, [editor.custom]);

  function updateEditor(next: EditorState, validateDependencies = false) {
    setEditor(next);
    setCalculated(null);
    setFeedback("");
    setErrors(validateDependencies ? compileEditor(next).errors : {});
  }

  function focusError(nextErrors: Record<string, string>) {
    const key = nextErrors.width ? "width" : editor.custom ? "custom-block" : "block-size";
    formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
  }

  function calculate() {
    const compiled = compileEditor(editor);
    setErrors(compiled.errors);
    setRestoreStatus("");
    setFeedback("");
    if (!compiled.valid) {
      setCalculated(null);
      setFeedback("Fix the highlighted input");
      focusError(compiled.errors);
      return;
    }
    try {
      const result = calculateZfsPadding(compiled.input);
      if (result.status !== "valid" || !result.values) throw new Error("Invalid result");
      setCalculated({ input: compiled.input, result });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setCalculated(null);
      setFeedback("Calculation failed. Try again.");
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  }

  function reset() {
    setEditor(defaultEditor());
    setCalculated(null);
    setErrors({});
    setFeedback("");
    setRestoreStatus("");
    history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus());
  }

  async function share() {
    if (!calculated?.result.values) return;
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("state", zfsPaddingCalculatorRegistry.encode("zfs-padding", calculated.input));
      history.replaceState(null, "", url);
      try {
        await navigator.clipboard.writeText(url.toString());
        setFeedback("Share link copied");
      } catch {
        setFeedback("Link ready. Copy failed.");
      }
    } catch {
      setFeedback("Share failed");
    }
  }

  function submitTextInput(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (!(event.target instanceof HTMLInputElement) || event.target.type === "radio") return;
    event.preventDefault();
    event.currentTarget.requestSubmit();
  }

  const allowedPresets = allBlockSizes.filter((bytes) => (
    editor.workload === "filesystem" ? bytes <= 16 * MiB : bytes <= 128 * KiB
  ));
  const availablePresets = editor.custom || allowedPresets.includes(Number(editor.blockSize))
    ? allowedPresets
    : [...allowedPresets, Number(editor.blockSize)].sort((a, b) => a - b);
  const blockProperty = editor.workload === "filesystem" ? "recordsize" : "volblocksize";
  const blockOptions = availablePresets
    .map((bytes) => toolOption(String(bytes), presetLabel(bytes)))
    .concat(toolOption("custom", "Custom"));
  const values = calculated?.result.values ?? null;
  const allocationSegments = values ? [
    { id: "logical-data", label: "Logical data", tone: "chartreuse" as const, value: values.blockSizeBytes },
    { id: "sector-rounding", label: "Sector rounding", tone: "cyan" as const, value: values.sectorRoundingBytes },
    { id: "parity", label: "Parity", tone: "blue" as const, value: values.parityBytes },
    { id: "padding", label: "Padding", tone: "violet" as const, value: values.paddingBytes },
  ] : [];
  const comparisonRows = values ? values.comparisons.map((row) => ({
    id: row.blockSizeBytes.toString(),
    cells: {
      blockSize: row.selected ? `${formatZfsPaddingBytes(row.blockSizeBytes)} Current` : formatZfsPaddingBytes(row.blockSizeBytes),
      physical: formatZfsPaddingBytes(row.physicalBytes),
      efficiency: formatZfsPaddingPercentage(row.efficiencyBasisPoints),
    },
  })) : [];
  const calculationRows = calculated ? calculated.result.derivation.map((step) => ({
    id: step.id,
    cells: {
      step: derivationLabel(step.id),
      calculation: step.expression,
      result: step.result,
    },
  })) : [];

  return (
    <section aria-label="ZFS allocation calculator" className={styles.tool} data-tool-workbench>
      <form
        className={styles.form}
        noValidate
        onKeyDown={submitTextInput}
        onSubmit={(event) => { event.preventDefault(); calculate(); }}
        ref={formRef}
      >
        <section aria-labelledby="geometry-heading" className={styles.inputGroup}>
          <h2 id="geometry-heading">Geometry</h2>
          <div className={styles.geometryGrid}>
            <ToolChoiceGroup
              label="RAIDZ level"
              onChange={(level) => updateEditor({ ...editor, level: level as ZfsPaddingLevel }, true)}
              options={levelOptions}
              required
              value={editor.level}
            />
            <ToolTextField
              dataFocusKey="width"
              error={errors.width}
              inputMode="numeric"
              inputRef={undefined}
              label="Vdev width"
              onChange={(width) => updateEditor({ ...editor, width })}
              required
              value={editor.width}
            />
          </div>
        </section>

        <section aria-labelledby="block-model-heading" className={styles.inputGroup}>
          <h2 id="block-model-heading">Block model</h2>
          <div className={styles.blockGrid}>
            <ToolChoiceGroup
              label="Workload"
              onChange={(workload) => updateEditor({ ...editor, workload: workload as ZfsPaddingWorkload }, true)}
              options={workloadOptions}
              required
              value={editor.workload}
            />
            <div className={styles.blockSizeColumn}>
              <ToolSelect
                dataFocusKey="block-size"
                error={editor.custom ? null : errors.blockSizeBytes}
                label={blockProperty}
                onChange={(value) => {
                  const custom = value === "custom";
                  focusCustom.current = custom;
                  updateEditor({ ...editor, custom, blockSize: custom ? editor.blockSize : value });
                }}
                options={blockOptions}
                required
                value={editor.custom ? "custom" : editor.blockSize}
              />
              {editor.custom ? (
                <ToolQuantityInput
                  dataFocusKey="custom-block"
                  error={errors.blockSizeBytes}
                  label="Custom block size"
                  onChange={(customValue) => updateEditor({ ...editor, customValue })}
                  onUnitChange={(customUnit) => updateEditor({ ...editor, customUnit: customUnit as ZfsPaddingUnit })}
                  required
                  unit={editor.customUnit}
                  unitAriaLabel="Custom block size unit"
                  units={sizeUnits}
                  value={editor.customValue}
                />
              ) : null}
            </div>
            <div className={styles.ashiftField}>
              <ToolChoiceGroup
                label="ashift"
                onChange={(ashift) => updateEditor({ ...editor, ashift: ashift as EditorState["ashift"] })}
                options={ashiftOptions}
                required
                value={editor.ashift}
              />
            </div>
          </div>
        </section>

        <div className={styles.formActions}>
          <ToolActionRow>
            <ToolButton type="submit" variant="primary">Calculate allocation</ToolButton>
            <ToolButton onPress={reset} type="button" variant="ghost"><RotateCcw aria-hidden="true" size={18} />Reset</ToolButton>
          </ToolActionRow>
        </div>
        {restoreStatus ? <p className={styles.metadata}>{restoreStatus}</p> : null}
        {feedback.startsWith("Calculation failed") ? <p className={styles.error} ref={failureRef} role="alert" tabIndex={-1}>{feedback}</p> : null}
      </form>

      {values && calculated ? (
        <div className={styles.result}>
          <div className={styles.resultLead} data-testid="result-lead" ref={resultRef} tabIndex={-1}>
            <ToolPrimaryResult
              detail={`For one ${formatZfsPaddingBytes(calculated.input.blockSizeBytes)} logical block at ${formatZfsPaddingPercentage(values.efficiencyBasisPoints)} efficiency.`}
              label="Physical allocation"
              value={<span data-testid="physical-bytes">{formatZfsPaddingBytes(values.physicalBytes)}</span>}
            />
          </div>

          <section aria-labelledby="allocation-heading" className={styles.resultSection}>
            <h2 id="allocation-heading">Allocation composition</h2>
            <ToolAllocationBar
              ariaLabel="Physical allocation composition"
              formatValue={(value) => formatZfsPaddingBytes(value as bigint)}
              palette="categorical"
              segments={allocationSegments}
              total={values.physicalBytes}
            />
          </section>

          <section aria-labelledby="comparison-heading" className={styles.resultSection}>
            <h2 id="comparison-heading">Nearby block sizes</h2>
            <ToolDataTable
              ariaLabel="Nearby block sizes"
              columns={[
                { id: "blockSize", label: "Block size" },
                { id: "physical", label: "Physical allocation" },
                { id: "efficiency", label: "Efficiency" },
              ]}
              rows={comparisonRows}
            />
          </section>

          <div className={styles.calculationDetails}>
            <ToolDisclosure label="Calculation details">
              <div className={styles.calculationFlow}>
                <ToolDataTable
                  ariaLabel="Calculation steps"
                  columns={[
                    { id: "step", label: "Step" },
                    { id: "calculation", label: "Calculation" },
                    { id: "result", label: "Result" },
                  ]}
                  rows={calculationRows}
                />
                <ToolKeyValueList rows={[
                  { label: "Formula version", value: `v${ZFS_PADDING_CALCULATION_VERSION}` },
                  { label: "Assumption", value: "Uncompressed block" },
                  { label: "Excluded", value: "Pool effects excluded" },
                ]} />
                <ul className={styles.sources}>
                  {calculated.result.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url}>{source.title}</a>
                      <time dateTime={source.checkedAt}>{source.checkedAt}</time>
                    </li>
                  ))}
                </ul>
              </div>
            </ToolDisclosure>
          </div>

          <div className={styles.resultActions}>
            <ToolActionRow>
              <ToolCopyAction label="Copy summary" value={buildZfsPaddingCopySummary(calculated.input, values)} />
              <ToolButton onPress={share} type="button" variant="secondary"><Share2 aria-hidden="true" size={18} />Share configuration</ToolButton>
            </ToolActionRow>
          </div>
          {feedback && !feedback.startsWith("Fix") && !feedback.startsWith("Calculation failed") ? <p className={styles.metadata}>{feedback}</p> : null}
        </div>
      ) : null}

      {feedback === "Fix the highlighted input" ? <p aria-live="polite" className={styles.srOnly}>{feedback}</p> : null}
    </section>
  );
}
