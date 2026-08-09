"use client";

import { Copy, RotateCcw, Share2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ZFS_PADDING_CALCULATION_VERSION,
  ZFS_PADDING_INPUT_VERSION,
  buildZfsPaddingCopySummary,
  calculateZfsPadding,
  decodeStorageState,
  formatZfsPaddingBytes,
  formatZfsPaddingMultiplier,
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

function answerFor(input: ZfsPaddingInput, values: ZfsPaddingValues) {
  return `${formatZfsPaddingBytes(input.blockSizeBytes)} occupies ${formatZfsPaddingBytes(values.physicalBytes)}.`;
}

function submitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}

export function ZfsPaddingCalculator({ initialState }: { initialState: string }) {
  const [editor, setEditor] = useState(defaultEditor);
  const [calculated, setCalculated] = useState<Calculated | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLParagraphElement>(null);
  const firstRadioRef = useRef<HTMLInputElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);
  const blockRef = useRef<HTMLSelectElement>(null);
  const customRef = useRef<HTMLInputElement>(null);
  const focusCustom = useRef(false);

  useEffect(() => {
    if (!initialState) return;
    try {
      const state = decodeStorageState(initialState);
      if (state.calculatorId !== "zfs-padding"
        || state.calculatorVersion !== ZFS_PADDING_CALCULATION_VERSION
        || state.inputVersion !== ZFS_PADDING_INPUT_VERSION
        || !validateZfsPaddingInput(state.payload)) {
        throw new Error("Unsupported state");
      }
      const result = calculateZfsPadding(state.payload);
      setEditor(editorFromInput(state.payload));
      setCalculated({ input: state.payload, result });
      setRestoreStatus("Shared configuration loaded");
    } catch {
      setEditor(defaultEditor());
      setCalculated(null);
      setRestoreStatus("Shared configuration could not be restored");
      try {
        history.replaceState(null, "", window.location.pathname);
      } catch {
        setStatus("URL cleanup failed");
      }
    }
  }, [initialState]);

  useEffect(() => {
    if (editor.custom && focusCustom.current) {
      customRef.current?.focus();
      focusCustom.current = false;
    }
  }, [editor.custom]);

  const updateEditor = (next: EditorState, validateDependencies = false) => {
    setEditor(next);
    setCalculated(null);
    setStatus("Inputs changed");
    setErrors(validateDependencies ? compileEditor(next).errors : {});
  };

  const calculate = () => {
    const compiled = compileEditor(editor);
    setErrors(compiled.errors);
    setRestoreStatus("");
    if (!compiled.valid) {
      setCalculated(null);
      setStatus("Fix the highlighted input");
      if (compiled.errors.width) widthRef.current?.focus();
      else if (editor.custom) customRef.current?.focus();
      else blockRef.current?.focus();
      return;
    }
    try {
      const result = calculateZfsPadding(compiled.input);
      if (result.status !== "valid" || !result.values) throw new Error("Invalid result");
      setCalculated({ input: compiled.input, result });
      setStatus(answerFor(compiled.input, result.values));
      requestAnimationFrame(() => resultHeadingRef.current?.focus());
    } catch {
      setCalculated(null);
      setStatus("Calculation failed. Try again.");
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  };

  const reset = () => {
    setEditor(defaultEditor());
    setCalculated(null);
    setErrors({});
    setStatus("");
    setRestoreStatus("");
    try {
      history.replaceState(null, "", window.location.pathname);
    } catch {
      setStatus("URL reset failed");
    }
    firstRadioRef.current?.focus();
  };

  const copy = async () => {
    if (!calculated?.result.values) return;
    try {
      await navigator.clipboard.writeText(buildZfsPaddingCopySummary(calculated.input, calculated.result.values));
      setStatus("Copied");
    } catch {
      setStatus("Copy failed");
    }
  };

  const share = async () => {
    if (!calculated?.result.values) return;
    try {
      const encoded = zfsPaddingCalculatorRegistry.encode("zfs-padding", calculated.input);
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("state", encoded);
      await navigator.clipboard.writeText(url.toString());
      history.replaceState(null, "", url);
      setStatus("Share link copied");
    } catch {
      setStatus("Share failed");
    }
  };

  const allowedPresets = allBlockSizes.filter((bytes) => (
    editor.workload === "filesystem" ? bytes <= 16 * MiB : bytes <= 128 * KiB
  ));
  const availablePresets = editor.custom || allowedPresets.includes(Number(editor.blockSize))
    ? allowedPresets
    : [...allowedPresets, Number(editor.blockSize)].sort((a, b) => a - b);
  const values = calculated?.result.values ?? null;
  const allocationParts = values ? [
    ["Logical data", values.blockSizeBytes, styles.logical],
    ["Sector rounding", values.sectorRoundingBytes, styles.rounding],
    ["Parity", values.parityBytes, styles.parity],
    ["Padding", values.paddingBytes, styles.padding],
  ] as const : [];

  return (
    <section className={styles.tool} aria-label="ZFS allocation calculator">
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          calculate();
        }}
      >
        <div className={styles.controlGrid}>
          <fieldset className={styles.fieldset}>
            <legend>RAIDZ level</legend>
            <div className={styles.choiceRow}>
              {(["raidz1", "raidz2", "raidz3"] as const).map((level, index) => (
                <label className={styles.choice} key={level}>
                  <input
                    checked={editor.level === level}
                    onChange={() => updateEditor({ ...editor, level }, true)}
                    ref={index === 0 ? firstRadioRef : undefined}
                    type="radio"
                    name="level"
                    value={level}
                  />
                  <span>{level.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.field}>
            <span>Vdev width</span>
            <input
              aria-describedby={errors.width ? "width-error" : undefined}
              aria-invalid={Boolean(errors.width)}
              inputMode="numeric"
              onChange={(event) => updateEditor({ ...editor, width: event.target.value })}
              onKeyDown={submitOnEnter}
              ref={widthRef}
              value={editor.width}
            />
            {errors.width ? <small className={styles.error} id="width-error">{errors.width}</small> : null}
          </label>

          <fieldset className={styles.fieldset}>
            <legend>Workload</legend>
            <div className={styles.choiceRow}>
              {(["filesystem", "zvol"] as const).map((workload) => (
                <label className={styles.choice} key={workload}>
                  <input
                    checked={editor.workload === workload}
                    onChange={() => updateEditor({ ...editor, workload }, true)}
                    type="radio"
                    name="workload"
                    value={workload}
                  />
                  <span>{workload === "filesystem" ? "Filesystem" : "Zvol"}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.field}>
            <span>{editor.workload === "filesystem" ? "recordsize" : "volblocksize"}</span>
            <select
              aria-describedby={errors.blockSizeBytes ? "block-error" : undefined}
              aria-invalid={Boolean(errors.blockSizeBytes)}
              onChange={(event) => {
                const custom = event.target.value === "custom";
                focusCustom.current = custom;
                updateEditor({ ...editor, custom, blockSize: custom ? editor.blockSize : event.target.value });
              }}
              ref={blockRef}
              value={editor.custom ? "custom" : editor.blockSize}
            >
              {availablePresets.map((bytes) => <option key={bytes} value={bytes}>{presetLabel(bytes)}</option>)}
              <option value="custom">Custom</option>
            </select>
            {errors.blockSizeBytes ? <small className={styles.error} id="block-error">{errors.blockSizeBytes}</small> : null}
          </label>

          {editor.custom ? (
            <div className={styles.customGroup}>
              <label className={styles.field}>
                <span>Custom size</span>
                <input
                  aria-describedby={errors.blockSizeBytes ? "block-error" : undefined}
                  aria-invalid={Boolean(errors.blockSizeBytes)}
                  inputMode="decimal"
                  onChange={(event) => updateEditor({ ...editor, customValue: event.target.value })}
                  onKeyDown={submitOnEnter}
                  ref={customRef}
                  value={editor.customValue}
                />
              </label>
              <label className={styles.field}>
                <span>Unit</span>
                <select
                  onChange={(event) => updateEditor({ ...editor, customUnit: event.target.value as ZfsPaddingUnit })}
                  value={editor.customUnit}
                >
                  <option>B</option>
                  <option>KiB</option>
                  <option>MiB</option>
                </select>
              </label>
            </div>
          ) : null}

          <label className={styles.field}>
            <span>ashift</span>
            <select
              onChange={(event) => updateEditor({ ...editor, ashift: event.target.value as EditorState["ashift"] })}
              value={editor.ashift}
            >
              <option value="9">9, 512 B</option>
              <option value="12">12, 4 KiB</option>
              <option value="13">13, 8 KiB</option>
              <option value="14">14, 16 KiB</option>
            </select>
          </label>
        </div>

        <div className={styles.formActions}>
          <button className={styles.resetButton} type="button" onClick={reset}>
            <RotateCcw aria-hidden="true" size={18} /> Reset
          </button>
          <button className={styles.primaryButton} type="submit">Calculate allocation</button>
        </div>
        {restoreStatus ? <p className={styles.restoreStatus}>{restoreStatus}</p> : null}
        {status.startsWith("Calculation failed") ? <p className={styles.error} ref={failureRef} tabIndex={-1}>{status}</p> : null}
      </form>

      {values && calculated ? (
        <div className={styles.result}>
          <section className={styles.answer}>
            <h2 ref={resultHeadingRef} tabIndex={-1}>{answerFor(calculated.input, values)}</h2>
            <div className={styles.primaryMetrics}>
              <div><span>Physical</span><strong data-testid="physical-bytes">{formatZfsPaddingBytes(values.physicalBytes)}</strong></div>
              <div><span>Overhead</span><strong>{formatZfsPaddingBytes(values.overheadBytes)}</strong></div>
              <div><span>Efficiency</span><strong data-testid="efficiency">{formatZfsPaddingPercentage(values.efficiencyBasisPoints)}</strong></div>
              <div><span>Multiplier</span><strong data-testid="multiplier">{formatZfsPaddingMultiplier(values.allocationMultiplierMillionths)}</strong></div>
            </div>
          </section>

          <section className={styles.allocation} aria-labelledby="allocation-heading">
            <h3 id="allocation-heading">Allocation split</h3>
            <div className={styles.allocationBar} aria-label="Logical data, rounding, parity, and padding">
              {allocationParts.filter(([, bytes]) => bytes > 0n).map(([label, bytes, className]) => (
                <span
                  aria-hidden="true"
                  className={className}
                  key={label}
                  style={{ flexGrow: Number(bytes) }}
                />
              ))}
            </div>
            <dl className={styles.allocationLegend}>
              {allocationParts.map(([label, bytes, className]) => (
                <div data-testid={`allocation-${label.toLowerCase().replaceAll(" ", "-")}`} key={label}>
                  <dt><i className={className} aria-hidden="true" />{label}</dt>
                  <dd>{formatZfsPaddingBytes(bytes)}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.sectorEquation} aria-label="Sector equation">
              <span>{values.logicalSectors.toString()} data</span>
              <i aria-hidden="true">+</i>
              <span>{values.paritySectors.toString()} parity</span>
              <i aria-hidden="true">+</i>
              <span>{values.paddingSectors.toString()} padding</span>
              <i aria-hidden="true">=</i>
              <span>{values.allocatedSectors.toString()} allocated</span>
            </div>
          </section>

          <section className={styles.comparison} aria-labelledby="comparison-heading">
            <h3 id="comparison-heading">Nearby block sizes</h3>
            <div className={styles.comparisonRows}>
              {values.comparisons.map((row) => {
                const maximum = values.comparisons.reduce((largest, item) => item.physicalBytes > largest ? item.physicalBytes : largest, 0n);
                const width = Number(row.physicalBytes * 100n / maximum);
                return (
                  <div className={styles.comparisonRow} key={row.blockSizeBytes.toString()}>
                    <span>{formatZfsPaddingBytes(row.blockSizeBytes)}</span>
                    <span className={styles.comparisonTrack} aria-hidden="true">
                      <i style={{ width: `${width}%` }} />
                    </span>
                    <strong>{formatZfsPaddingBytes(row.physicalBytes)}</strong>
                    <span>{formatZfsPaddingPercentage(row.efficiencyBasisPoints)}{row.selected ? " selected" : ""}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <details className={styles.trace}>
            <summary>Show calculation</summary>
            <ol>
              {calculated.result.derivation.map((step) => (
                <li key={step.id}><span>{step.expression}</span><strong>{step.result}</strong></li>
              ))}
            </ol>
            <div className={styles.traceMeta}>
              <span>Formula v{ZFS_PADDING_CALCULATION_VERSION}</span>
              <span>Uncompressed block</span>
              <span>Pool effects excluded</span>
            </div>
            <ul>
              {calculated.result.sources.map((source) => (
                <li key={source.url}><a href={source.url}>{source.title}</a> <span>{source.checkedAt}</span></li>
              ))}
            </ul>
          </details>

          <div className={styles.resultActions}>
            <button type="button" onClick={copy}><Copy aria-hidden="true" size={18} />Copy summary</button>
            <button type="button" onClick={share}><Share2 aria-hidden="true" size={18} />Share configuration</button>
            <button type="button" onClick={reset}><RotateCcw aria-hidden="true" size={18} />Reset</button>
          </div>
        </div>
      ) : null}

      <p aria-live="polite" className={styles.srOnly}>{status}</p>
    </section>
  );
}
