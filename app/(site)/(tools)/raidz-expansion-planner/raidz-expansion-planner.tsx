"use client";

import { Copy, RotateCcw, Share2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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

type Calculated = { input: RaidzExpansionInput; result: StorageCalculationResult<RaidzExpansionValues> };
const blockSizes = Array.from({ length: 16 }, (_, index) => 512 * 2 ** index);

function defaults(): Editor {
  return { level: "raidz2", currentWidth: "6", finalWidth: "7", memberValue: "8", memberUnit: "TB", addedValue: "8", addedUnit: "TB", allocatedValue: "", allocatedUnit: "TB", workload: "filesystem", blockSizeBytes: "131072", customBlock: false, customBlockValue: "128", customBlockUnit: "KiB", ashift: "12" };
}

function editorFromInput(input: RaidzExpansionInput): Editor {
  const member = formatRaidzExpansionEditorCapacity(input.memberBytes);
  const added = formatRaidzExpansionEditorCapacity(input.addedDiskBytes);
  const allocated = formatRaidzExpansionEditorCapacity(input.allocatedBytes);
  return {
    level: input.level, currentWidth: String(input.currentWidth), finalWidth: String(input.finalWidth),
    memberValue: member.value, memberUnit: member.unit, addedValue: added.value, addedUnit: added.unit,
    allocatedValue: allocated.value, allocatedUnit: allocated.unit, workload: input.workload,
    blockSizeBytes: input.blockSizeBytes.toString(), customBlock: false, customBlockValue: input.blockSizeBytes.toString(), customBlockUnit: "B", ashift: String(input.ashift) as Editor["ashift"],
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
  try { blockSizeBytes = editor.customBlock ? parseZfsPaddingBlockSize(editor.customBlockValue, editor.customBlockUnit) : BigInt(editor.blockSizeBytes); }
  catch { errors.blockSizeBytes = "Enter an exact block size."; }
  const input: RaidzExpansionInput = { level: editor.level, currentWidth, finalWidth, memberBytes, addedDiskBytes, allocatedBytes, workload: editor.workload, blockSizeBytes, ashift: Number(editor.ashift) as RaidzExpansionInput["ashift"] };
  const result = calculateRaidzExpansion(input);
  for (const item of result.issues) errors[item.path ?? "form"] ??= item.message;
  return { input, errors, valid: Object.keys(errors).length === 0 && validateRaidzExpansionInput(input) };
}

function submitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
}

function blockLabel(bytes: number) {
  return bytes >= 1048576 ? `${bytes / 1048576} MiB` : bytes >= 1024 ? `${bytes / 1024} KiB` : `${bytes} B`;
}

export function RaidzExpansionPlanner({ initialState }: { initialState: string }) {
  const [editor, setEditor] = useState(defaults);
  const [calculated, setCalculated] = useState<Calculated | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [answerAnnouncement, setAnswerAnnouncement] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [displayUnit, setDisplayUnit] = useState<"TB" | "TiB">("TB");
  const firstRadio = useRef<HTMLInputElement>(null);
  const currentRef = useRef<HTMLInputElement>(null);
  const finalRef = useRef<HTMLInputElement>(null);
  const memberRef = useRef<HTMLInputElement>(null);
  const addedRef = useRef<HTMLInputElement>(null);
  const allocatedRef = useRef<HTMLInputElement>(null);
  const blockRef = useRef<HTMLSelectElement>(null);
  const customBlockRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!initialState) return;
    try {
      const state = decodeStorageState(initialState);
      if (state.calculatorId !== "raidz-expansion" || state.calculatorVersion !== RAIDZ_EXPANSION_CALCULATION_VERSION || state.inputVersion !== RAIDZ_EXPANSION_INPUT_VERSION || !validateRaidzExpansionInput(state.payload)) throw new Error("state");
      const result = calculateRaidzExpansion(state.payload);
      if (!result.values) throw new Error("state");
      setEditor(editorFromInput(state.payload));
      setCalculated({ input: state.payload, result });
      setRestoreStatus("Shared plan loaded");
      setShareUrl(window.location.href);
    } catch {
      setEditor(defaults()); setCalculated(null); setRestoreStatus("Shared plan could not load");
      history.replaceState(null, "", window.location.pathname);
    }
  }, [initialState]);

  const update = (next: Editor, dependent = false) => {
    setEditor(next); setCalculated(null); setStatus("Inputs changed"); setAnswerAnnouncement(""); setRestoreStatus(""); setShareUrl("");
    setErrors(dependent ? compile(next).errors : {});
    if (window.location.search) history.replaceState(null, "", window.location.pathname);
  };

  const focusError = (nextErrors: Record<string, string>) => {
    const refs = { currentWidth: currentRef, finalWidth: finalRef, memberBytes: memberRef, addedDiskBytes: addedRef, allocatedBytes: allocatedRef, blockSizeBytes: editor.customBlock ? customBlockRef : blockRef };
    for (const key of ["currentWidth", "finalWidth", "memberBytes", "addedDiskBytes", "allocatedBytes", "blockSizeBytes"] as const) if (nextErrors[key]) { refs[key].current?.focus(); return; }
  };

  const plan = () => {
    const next = compile(editor); setErrors(next.errors); setRestoreStatus("");
    if (!next.valid) { setCalculated(null); setStatus(""); setAnswerAnnouncement(""); focusError(next.errors); return; }
    try {
      const result = calculateRaidzExpansion(next.input);
      if (!result.values) throw new Error("result");
      setCalculated({ input: next.input, result }); setStatus(""); setAnswerAnnouncement(buildRaidzExpansionLiveSummary(result.values, displayUnit));
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch { setCalculated(null); setAnswerAnnouncement(""); setStatus("Planning failed. Try again."); }
  };

  const reset = () => {
    setEditor(defaults()); setCalculated(null); setErrors({}); setStatus(""); setAnswerAnnouncement(""); setRestoreStatus(""); setShareUrl(""); setDisplayUnit("TB");
    history.replaceState(null, "", window.location.pathname); firstRadio.current?.focus();
  };
  const copy = async () => {
    if (!calculated?.result.values) return;
    setAnswerAnnouncement("");
    try { await navigator.clipboard.writeText(buildRaidzExpansionCopySummary(calculated.input, calculated.result.values, displayUnit)); setStatus("Copied"); }
    catch { setStatus("Copy failed"); }
  };
  const share = async () => {
    if (!calculated?.result.values) return;
    setAnswerAnnouncement("");
    try {
      const url = new URL(window.location.href); url.search = ""; url.searchParams.set("state", raidzExpansionCalculatorRegistry.encode("raidz-expansion", calculated.input));
      history.replaceState(null, "", url);
      setShareUrl(url.toString());
      try { await navigator.clipboard.writeText(url.toString()); setStatus("Share link copied"); }
      catch { setStatus("Link ready. Copy failed."); }
    } catch { setStatus("Share failed"); }
  };

  const values = calculated?.result.values ?? null;
  const stepRows = values ? [values.current, ...values.steps] : [];
  const finalTotal = values?.final.nativeLogicalBytes ?? 1n;
  const segmentWidth = (bytes: bigint) => `${Number(bytes * 10000n / finalTotal) / 100}%`;
  const unitOptions = (label: string, value: RaidzExpansionCapacityUnit, set: (unit: RaidzExpansionCapacityUnit) => void) => (
    <select aria-label={label} onChange={(event) => set(event.target.value as RaidzExpansionCapacityUnit)} value={value}>{["GB", "TB", "GiB", "TiB"].map((unit) => <option key={unit}>{unit}</option>)}</select>
  );
  const changeCapacityUnit = (field: "member" | "added" | "allocated", unit: RaidzExpansionCapacityUnit) => {
    const valueKey = field === "member" ? "memberValue" : field === "added" ? "addedValue" : "allocatedValue";
    const unitKey = field === "member" ? "memberUnit" : field === "added" ? "addedUnit" : "allocatedUnit";
    const errorKey = field === "member" ? "memberBytes" : field === "added" ? "addedDiskBytes" : "allocatedBytes";
    try {
      const converted = convertRaidzExpansionEditorCapacity(editor[valueKey], editor[unitKey], unit);
      update({ ...editor, [valueKey]: converted.value, [unitKey]: converted.unit });
    } catch {
      const next = { ...editor, [unitKey]: unit };
      setEditor(next); setCalculated(null); setStatus(""); setAnswerAnnouncement(""); setRestoreStatus(""); setShareUrl("");
      setErrors({ [errorKey]: "Convert a valid capacity first." });
      if (window.location.search) history.replaceState(null, "", window.location.pathname);
    }
  };
  const invalidEntries = Object.entries(errors);

  return (
    <section aria-label="RAIDZ expansion planner" className={styles.tool}>
      <form className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); plan(); }}>
        <div className={styles.controlGrid}>
          <fieldset className={styles.fieldset}><legend>RAIDZ level</legend><div className={styles.choiceRow}>{(["raidz1", "raidz2", "raidz3"] as const).map((level, index) => <label className={styles.choice} key={level}><input checked={editor.level === level} name="level" onChange={() => update({ ...editor, level }, true)} ref={index === 0 ? firstRadio : undefined} type="radio"/><span>{level.toUpperCase()}</span></label>)}</div></fieldset>
          <label className={styles.field}><span>Current width</span><input aria-describedby={errors.currentWidth ? "current-error" : undefined} aria-invalid={Boolean(errors.currentWidth)} inputMode="numeric" onChange={(event) => update({ ...editor, currentWidth: event.target.value })} onKeyDown={submitOnEnter} ref={currentRef} value={editor.currentWidth}/>{errors.currentWidth && <small className={styles.error} id="current-error">{errors.currentWidth}</small>}</label>
          <label className={styles.field}><span>Final width</span><input aria-describedby={errors.finalWidth ? "final-error" : undefined} aria-invalid={Boolean(errors.finalWidth)} inputMode="numeric" onChange={(event) => update({ ...editor, finalWidth: event.target.value })} onKeyDown={submitOnEnter} ref={finalRef} value={editor.finalWidth}/>{errors.finalWidth && <small className={styles.error} id="final-error">{errors.finalWidth}</small>}</label>
          <div className={styles.field}><label htmlFor="member-capacity">Smallest member</label><span className={styles.valueUnit}><input aria-describedby={errors.memberBytes ? "member-error" : undefined} aria-invalid={Boolean(errors.memberBytes)} id="member-capacity" inputMode="decimal" onChange={(event) => update({ ...editor, memberValue: event.target.value })} onKeyDown={submitOnEnter} ref={memberRef} value={editor.memberValue}/>{unitOptions("Smallest member unit", editor.memberUnit, (unit) => changeCapacityUnit("member", unit))}</span>{errors.memberBytes && <small className={styles.error} id="member-error">{errors.memberBytes}</small>}</div>
          <div className={styles.field}><label htmlFor="added-capacity">Each added disk</label><span className={styles.valueUnit}><input aria-describedby={errors.addedDiskBytes ? "added-error" : undefined} aria-invalid={Boolean(errors.addedDiskBytes)} id="added-capacity" inputMode="decimal" onChange={(event) => update({ ...editor, addedValue: event.target.value })} onKeyDown={submitOnEnter} ref={addedRef} value={editor.addedValue}/>{unitOptions("Each added disk unit", editor.addedUnit, (unit) => changeCapacityUnit("added", unit))}</span>{errors.addedDiskBytes && <small className={styles.error} id="added-error">{errors.addedDiskBytes}</small>}</div>
          <div className={styles.field}><label htmlFor="allocated-capacity">Current physical allocation</label><span className={styles.valueUnit}><input aria-describedby={errors.allocatedBytes ? "allocated-error" : undefined} aria-invalid={Boolean(errors.allocatedBytes)} id="allocated-capacity" inputMode="decimal" onChange={(event) => update({ ...editor, allocatedValue: event.target.value })} onKeyDown={submitOnEnter} ref={allocatedRef} value={editor.allocatedValue}/>{unitOptions("Current physical allocation unit", editor.allocatedUnit, (unit) => changeCapacityUnit("allocated", unit))}</span>{errors.allocatedBytes && <small className={styles.error} id="allocated-error">{errors.allocatedBytes}</small>}</div>
          <fieldset className={styles.fieldset}><legend>Workload</legend><div className={styles.choiceRow}>{(["filesystem", "zvol"] as const).map((workload) => <label className={styles.choice} key={workload}><input checked={editor.workload === workload} name="workload" onChange={() => update({ ...editor, workload }, true)} type="radio"/><span>{workload === "filesystem" ? "Filesystem" : "Zvol"}</span></label>)}</div></fieldset>
          <div className={styles.blockGroup}><label className={styles.field}><span>{editor.workload === "filesystem" ? "recordsize" : "volblocksize"}</span><select aria-label={editor.workload === "filesystem" ? "recordsize" : "volblocksize"} aria-describedby={errors.blockSizeBytes ? "block-error" : undefined} aria-invalid={Boolean(errors.blockSizeBytes)} onChange={(event) => update({ ...editor, customBlock: event.target.value === "custom", blockSizeBytes: event.target.value === "custom" ? editor.blockSizeBytes : event.target.value })} ref={blockRef} value={editor.customBlock ? "custom" : editor.blockSizeBytes}>{blockSizes.filter((bytes) => editor.workload === "filesystem" || bytes <= 131072).map((bytes) => <option key={bytes} value={bytes}>{blockLabel(bytes)}</option>)}<option value="custom">Custom</option></select></label>{editor.customBlock && <span className={styles.valueUnit}><label className={styles.field}><span>Custom block size</span><input aria-describedby={errors.blockSizeBytes ? "block-error" : undefined} aria-invalid={Boolean(errors.blockSizeBytes)} inputMode="decimal" onChange={(event) => update({ ...editor, customBlockValue: event.target.value })} onKeyDown={submitOnEnter} ref={customBlockRef} value={editor.customBlockValue}/></label><label className={styles.field}><span>Custom block unit</span><select aria-label="Custom block unit" onChange={(event) => update({ ...editor, customBlockUnit: event.target.value as ZfsPaddingUnit })} value={editor.customBlockUnit}><option>B</option><option>KiB</option><option>MiB</option></select></label></span>}{errors.blockSizeBytes && <small className={styles.error} id="block-error">{errors.blockSizeBytes}</small>}</div>
          <label className={styles.field}><span>ashift</span><select aria-label="ashift" onChange={(event) => update({ ...editor, ashift: event.target.value as Editor["ashift"] })} value={editor.ashift}>{[9, 12, 13, 14].map((ashift) => <option key={ashift} value={ashift}>{ashift} ({1 << ashift} B)</option>)}</select></label>
        </div>
        {invalidEntries.length > 0 && <div className={styles.errorSummary} role="alert"><strong>Fix these inputs</strong><ul>{invalidEntries.map(([key, message]) => <li key={key}>{message}</li>)}</ul></div>}
        <div className={styles.formActions}><button className={styles.resetButton} onClick={reset} type="button"><RotateCcw size={18}/>Reset</button><button className={styles.primaryButton} type="submit">Plan expansion</button></div>
        {restoreStatus && <p className={styles.meta}>{restoreStatus}</p>}
      </form>
      {values && calculated ? <div className={styles.result}>
        <section className={styles.answer}><div className={styles.answerTop}><h2 ref={resultRef} tabIndex={-1}>Capacity plan</h2><label className={styles.displayUnit}>Display <select aria-label="Display unit" onChange={(event) => setDisplayUnit(event.target.value as "TB" | "TiB")} value={displayUnit}><option>TB</option><option>TiB</option></select></label></div><p className={styles.verdict}><strong>{formatRaidzExpansionBytes(values.final.immediateGainBytes, displayUnit)} gained</strong><span>{values.finalWidth} members</span><span>{values.level.toUpperCase()} unchanged</span></p>
          <div className={styles.metrics}><div><span>Current</span><strong>{formatRaidzExpansionBytes(values.current.immediateLogicalBytes, displayUnit)}</strong></div><div><span>Immediate</span><strong>{formatRaidzExpansionBytes(values.final.immediateLogicalBytes, displayUnit)}</strong></div><div><span>Fresh {values.finalWidth}-wide</span><strong>{formatRaidzExpansionBytes(values.final.nativeLogicalBytes, displayUnit)}</strong></div><div><span>Geometry gap</span><strong>{formatRaidzExpansionBytes(values.final.geometryGapBytes, displayUnit)}</strong></div><div><span>Reported capacity</span><strong data-testid="reported-capacity">Unknown</strong></div></div>
        </section>
        <section className={styles.composition} aria-labelledby="composition-title"><h3 id="composition-title">Final-width composition</h3><div aria-hidden="true" className={styles.bar}><span className={styles.old} style={{ width: segmentWidth(values.oldLogicalBytes) }}/><span className={styles.writable} style={{ width: segmentWidth(values.final.newWritableLogicalBytes) }}/><span className={styles.gap} style={{ width: segmentWidth(values.final.geometryGapBytes) }}/></div><div className={styles.legend}>{[["Old logical", values.oldLogicalBytes, styles.oldKey], ["New writable", values.final.newWritableLogicalBytes, styles.writableKey], ["Gap", values.final.geometryGapBytes, styles.gapKey]].map(([label, bytes, className]) => <div key={String(label)}><span className={String(className)} aria-hidden="true"/><span>{String(label)}</span><strong>{formatRaidzExpansionBytes(bytes as bigint, displayUnit)}</strong></div>)}</div></section>
        <section className={styles.timeline} aria-labelledby="steps-title"><h3 id="steps-title">Expansion steps</h3><div className={styles.stepTable} role="table"><div className={styles.stepHead} role="row"><span role="columnheader">Width</span><span role="columnheader">Gain now</span><span role="columnheader">Immediate</span><span role="columnheader">Fresh</span><span role="columnheader">Gap</span></div>{stepRows.map((step) => <div className={styles.stepRow} role="row" key={step.width}><strong role="cell">{step.width} wide</strong><span data-label="Gain now" role="cell">{formatRaidzExpansionBytes(step.immediateGainBytes, displayUnit)}</span><span data-label="Immediate" role="cell">{formatRaidzExpansionBytes(step.immediateLogicalBytes, displayUnit)}</span><span data-label="Fresh" role="cell">{formatRaidzExpansionBytes(step.nativeLogicalBytes, displayUnit)}</span><span data-label="Gap" role="cell">{formatRaidzExpansionBytes(step.geometryGapBytes, displayUnit)}</span></div>)}</div></section>
        <details className={styles.trace}><summary>Show calculation</summary><dl><div><dt>Old block count</dt><dd>{values.oldBlockCount.toString()}</dd></div><div><dt>Old logical bytes</dt><dd>{values.oldLogicalBytes.toString()} B</dd></div><div><dt>Physical remainder</dt><dd>{values.occupancyRemainderBytes.toString()} B</dd></div><div><dt>Added-disk excess</dt><dd>{values.totalAddedDiskExcessBytes.toString()} B</dd></div><div><dt>Formula</dt><dd>v{RAIDZ_EXPANSION_CALCULATION_VERSION}</dd></div></dl><h3>Width derivation</h3><div className={styles.traceTable} role="table"><div className={styles.traceHead} role="row"><span role="columnheader">Width</span><span role="columnheader">Sectors per block</span><span role="columnheader">Free physical bytes</span><span role="columnheader">New block count</span><span role="columnheader">New writable bytes</span><span role="columnheader">Immediate bytes</span><span role="columnheader">Native bytes</span><span role="columnheader">Gap bytes</span></div>{stepRows.map((step) => <div className={styles.traceRow} data-trace-width={step.width} key={step.width} role="row"><strong role="cell">{step.width}</strong><span data-label="Sectors per block" role="cell">{step.allocation.allocatedSectors.toString()}</span><span data-label="Free physical bytes" role="cell">{step.freePhysicalBytes.toString()}</span><span data-label="New block count" role="cell">{step.newBlockCount.toString()}</span><span data-label="New writable bytes" role="cell">{step.newWritableLogicalBytes.toString()}</span><span data-label="Immediate bytes" role="cell">{step.immediateLogicalBytes.toString()}</span><span data-label="Native bytes" role="cell">{step.nativeLogicalBytes.toString()}</span><span data-label="Gap bytes" role="cell">{step.geometryGapBytes.toString()}</span></div>)}</div><h3>Assumptions</h3><ul>{calculated.result.assumptions.map((assumption) => <li key={assumption.id}>{assumption.statement}</li>)}</ul><h3>Sources</h3><ul>{calculated.result.sources.map((source) => <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a> · {source.checkedAt}</li>)}</ul></details>
        <div className={styles.resultActions}><button onClick={copy} type="button"><Copy size={18}/>Copy summary</button><button onClick={share} type="button"><Share2 size={18}/>Share plan</button></div>{shareUrl && <label className={styles.shareLink}>Share link<input aria-label="Share link" onFocus={(event) => event.currentTarget.select()} readOnly value={shareUrl}/></label>}
      </div> : null}
      {status && <p aria-live="polite" className={styles.status}>{status}</p>}
      {answerAnnouncement && <p aria-live="polite" className={styles.srOnly}>{answerAnnouncement}</p>}
    </section>
  );
}
