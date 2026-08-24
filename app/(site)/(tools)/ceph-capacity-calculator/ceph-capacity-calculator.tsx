"use client";

import { Copy, Plus, RotateCcw, Share2, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  CAPACITY_UNITS,
  MAX_OSDS,
  MAX_ROWS,
  calculateCephCapacity,
  decodeCephInput,
  formatBytes,
  formatPercent,
  parseCapacityBytes,
  serializeCephInput,
  type CapacityUnit,
  type CephBatch,
  type CephCalculationValues,
  type CephCalculatorInput,
  type FailureDomain,
  type ProtectionMode,
} from "./ceph-capacity-engine";
import styles from "./ceph-capacity-calculator.module.css";

type BatchDraft = {
  id: string;
  domain: string;
  osdCount: string;
  capacity: string;
  unit: CapacityUnit;
};

type EditorState = {
  mode: ProtectionMode;
  replicaSize: string;
  k: string;
  m: string;
  failureDomain: FailureDomain;
  reserve: string;
  batches: BatchDraft[];
};

type CalculatedState = {
  input: CephCalculatorInput;
  values: CephCalculationValues;
};

type FieldErrors = Record<string, string>;

const inputUnits: readonly CapacityUnit[] = ["TB", "GB", "TiB", "GiB"];
const failureDomains: readonly FailureDomain[] = ["osd", "host", "rack", "datacenter"];

function emptyEditor(): EditorState {
  return {
    mode: "replicated",
    replicaSize: "3",
    k: "4",
    m: "2",
    failureDomain: "host",
    reserve: "20",
    batches: [],
  };
}

function nextBatchId(batches: readonly BatchDraft[]) {
  const numbers = batches.map((batch) => Number(/^batch-(\d+)$/.exec(batch.id)?.[1] ?? 0));
  return `batch-${Math.max(0, ...numbers) + 1}`;
}

function decimalForUnit(bytes: bigint, unit: CapacityUnit) {
  const divisor = CAPACITY_UNITS[unit];
  const whole = bytes / divisor;
  const remainder = bytes % divisor;
  if (remainder === 0n) return whole.toString();
  const scaled = remainder * 1_000_000_000n;
  if (scaled % divisor !== 0n) return null;
  const fraction = (scaled / divisor).toString().padStart(9, "0").replace(/0+$/, "");
  return `${whole}.${fraction}`;
}

function capacityForDisplay(bytes: bigint): Pick<BatchDraft, "capacity" | "unit"> {
  for (const unit of ["TB", "TiB", "GB", "GiB"] as const) {
    const value = decimalForUnit(bytes, unit);
    if (value !== null && !value.includes(".")) return { capacity: value, unit };
  }
  return { capacity: decimalForUnit(bytes, "GB") ?? "", unit: "GB" };
}

function editorFromInput(input: CephCalculatorInput): EditorState {
  return {
    mode: input.mode,
    replicaSize: input.replicaSize?.toString() ?? "3",
    k: input.k?.toString() ?? "4",
    m: input.m?.toString() ?? "2",
    failureDomain: input.failureDomain,
    reserve: `${Math.floor(input.reserveBasisPoints / 100)}${input.reserveBasisPoints % 100 ? `.${String(input.reserveBasisPoints % 100).padStart(2, "0")}` : ""}`,
    batches: input.batches.map((batch) => ({
      id: batch.id,
      domain: batch.domain,
      osdCount: batch.osdCount.toString(),
      ...capacityForDisplay(batch.capacityBytes),
    })),
  };
}

function parseReserve(value: string) {
  const match = /^(?:0|[1-9]\d?|50)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const whole = Number(value.split(".")[0]);
  const fraction = Number((match[1] ?? "").padEnd(2, "0"));
  const basisPoints = whole * 100 + fraction;
  return basisPoints <= 5_000 ? basisPoints : null;
}

function mapEngineField(field: string, batches: readonly BatchDraft[]) {
  const match = /^batch-(\d+)-(domain|count|capacity|id)$/.exec(field);
  if (!match) return field;
  const batch = batches[Number(match[1])];
  return batch ? `batch-${batch.id}-${match[2]}` : field;
}

function compileEditor(editor: EditorState): { input: CephCalculatorInput | null; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const addError = (field: string, message: string) => {
    if (!errors[field]) errors[field] = message;
  };
  const replicaSize = Number(editor.replicaSize);
  const k = Number(editor.k);
  const m = Number(editor.m);
  const reserveBasisPoints = parseReserve(editor.reserve);
  if (reserveBasisPoints === null) addError("reserve", "Use 0 to 50 percent.");
  if (!editor.batches.length) addError("batches", "Add one OSD batch.");
  const batches: CephBatch[] = [];
  for (const batch of editor.batches) {
    const domain = batch.domain.trim();
    if (!domain) addError(`batch-${batch.id}-domain`, "Enter a domain label.");
    const osdCount = /^\d+$/.test(batch.osdCount.trim()) ? Number(batch.osdCount) : 0;
    if (!osdCount) addError(`batch-${batch.id}-count`, "Enter an OSD count.");
    let capacityBytes = 0n;
    if (!batch.capacity.trim()) {
      addError(`batch-${batch.id}-capacity`, "Enter a capacity.");
    } else {
      try {
        capacityBytes = parseCapacityBytes(batch.capacity, batch.unit);
      } catch {
        addError(`batch-${batch.id}-capacity`, "Use a plain decimal.");
      }
    }
    batches.push({ id: batch.id, domain, osdCount, capacityBytes });
  }
  if (Object.keys(errors).length) return { input: null, errors };
  const candidate: CephCalculatorInput = {
    mode: editor.mode,
    replicaSize: editor.mode === "replicated" ? replicaSize : null,
    k: editor.mode === "erasure" ? k : null,
    m: editor.mode === "erasure" ? m : null,
    failureDomain: editor.failureDomain,
    reserveBasisPoints: reserveBasisPoints as number,
    batches,
  };
  const result = calculateCephCapacity(candidate);
  if (result.status === "invalid") {
    for (const issue of result.issues) addError(mapEngineField(issue.field, editor.batches), issue.message);
    return { input: null, errors };
  }
  return { input: candidate, errors: {} };
}

function capacityPair(bytes: bigint) {
  return `${formatBytes(bytes, "TB")} / ${formatBytes(bytes, "TiB")}`;
}

function statusLabel(status: "minimum-met" | "extra-domain-headroom" | "degraded-placement") {
  if (status === "minimum-met") return "Minimum domains met";
  if (status === "extra-domain-headroom") return "Extra-domain headroom";
  return "Degraded placement";
}

function errorId(field: string) {
  return `error-${field.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function CephCapacityCalculator({ initialState }: { initialState: string }) {
  const [editor, setEditor] = useState<EditorState>(() => emptyEditor());
  const [calculated, setCalculated] = useState<CalculatedState | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [focusTarget, setFocusTarget] = useState("");
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!initialState) return;
    const restored = decodeCephInput(initialState);
    if (!restored) {
      window.history.replaceState(null, "", window.location.pathname);
      setStatus("Invalid shared plan cleared.");
      return;
    }
    const result = calculateCephCapacity(restored);
    if (result.status !== "valid") {
      window.history.replaceState(null, "", window.location.pathname);
      setStatus("Invalid shared plan cleared.");
      return;
    }
    setEditor(editorFromInput(restored));
    setCalculated({ input: restored, values: result.values });
    setStatus("Shared plan loaded.");
  }, [initialState]);

  useEffect(() => {
    if (!focusTarget) return;
    const target = document.querySelector<HTMLElement>(`[data-focus-key="${focusTarget}"]`);
    target?.focus();
    setFocusTarget("");
  }, [editor.batches.length, focusTarget]);

  function clearQuery() {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  function updateEditor(updater: (current: EditorState) => EditorState) {
    setEditor(updater);
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    setStatus("");
    clearQuery();
  }

  function updateBatch(id: string, patch: Partial<BatchDraft>) {
    updateEditor((current) => ({
      ...current,
      batches: current.batches.map((batch) => batch.id === id ? { ...batch, ...patch } : batch),
    }));
  }

  function changeUnit(id: string, unit: CapacityUnit) {
    const batch = editor.batches.find((candidate) => candidate.id === id);
    if (!batch) return;
    if (!batch.capacity.trim()) {
      updateBatch(id, { unit });
      return;
    }
    try {
      const bytes = parseCapacityBytes(batch.capacity, batch.unit);
      const capacity = decimalForUnit(bytes, unit);
      if (capacity === null) {
        setErrors({ [`batch-${id}-capacity`]: "Use a smaller unit for this value." });
        return;
      }
      updateBatch(id, { unit, capacity });
    } catch {
      updateBatch(id, { unit });
    }
  }

  function addBatch() {
    if (editor.batches.length >= MAX_ROWS) {
      setErrors({ batches: `Use ${MAX_ROWS} batches or fewer.` });
      return;
    }
    const id = nextBatchId(editor.batches);
    updateEditor((current) => ({
      ...current,
      batches: [...current.batches, { id, domain: "", osdCount: "1", capacity: "", unit: "TB" }],
    }));
    setFocusTarget(`batch-${id}-domain`);
  }

  function removeBatch(id: string) {
    updateEditor((current) => ({ ...current, batches: current.batches.filter((batch) => batch.id !== id) }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const compiled = compileEditor(editor);
    if (!compiled.input) {
      setCalculated(null);
      setErrors(compiled.errors);
      setStatus("Plan needs attention.");
      const first = Object.keys(compiled.errors)[0];
      if (first) setFocusTarget(first);
      return;
    }
    const result = calculateCephCapacity(compiled.input);
    if (result.status !== "valid") {
      setErrors(Object.fromEntries(result.issues.map((issue) => [issue.field, issue.message])));
      setCalculated(null);
      setStatus("Plan needs attention.");
      return;
    }
    setErrors({});
    setCalculated({ input: compiled.input, values: result.values });
    setShareUrl("");
    setStatus("Capacity plan ready.");
    window.setTimeout(() => document.getElementById("ceph-result-heading")?.focus(), 0);
  }

  async function share() {
    if (!calculated) return;
    const encoded = serializeCephInput(calculated.input);
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("state", encoded);
    window.history.replaceState(null, "", url.toString());
    setShareUrl(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus("Share URL copied.");
    } catch {
      setStatus("Share URL ready. Copy failed.");
    }
  }

  function reset() {
    setEditor(emptyEditor());
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    clearQuery();
    setStatus("Plan reset.");
    window.setTimeout(() => addButtonRef.current?.focus(), 0);
  }

  const firstError = Object.entries(errors)[0];

  return (
    <section className={styles.tool} aria-label="Ceph capacity planner">
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.formHeader}>
          <div>
            <h2>Enter cluster shape</h2>
            <p>Plan locally. Share URLs include entered labels.</p>
          </div>
          <button
            className={styles.secondaryButton}
            data-focus-key="add-batch"
            onClick={addBatch}
            ref={addButtonRef}
            type="button"
          >
            <Plus aria-hidden="true" size={18} /> Add OSD batch
          </button>
        </div>

        {Object.keys(errors).length > 0 ? (
          <div aria-live="assertive" className={styles.errorSummary} role="alert">
            <strong>Check the plan.</strong>
            <ul>
              {Object.entries(errors).map(([field, message]) => <li key={field}>{message}</li>)}
            </ul>
            {firstError ? <span className={styles.visuallyHidden}>First issue: {firstError[1]}</span> : null}
          </div>
        ) : null}

        <div className={styles.controlGrid}>
          <fieldset className={styles.fieldset}>
            <legend>Protection mode</legend>
            <div className={styles.choiceRow}>
              <label className={styles.choice}>
                <input
                  checked={editor.mode === "replicated"}
                  data-focus-key="mode"
                  name="mode"
                  onChange={() => updateEditor((current) => ({ ...current, mode: "replicated" }))}
                  type="radio"
                />
                <span>Replicated</span>
              </label>
              <label className={styles.choice}>
                <input
                  checked={editor.mode === "erasure"}
                  name="mode"
                  onChange={() => updateEditor((current) => ({ ...current, mode: "erasure" }))}
                  type="radio"
                />
                <span>Erasure coding</span>
              </label>
            </div>
          </fieldset>

          {editor.mode === "replicated" ? (
            <label className={styles.field}>
              <span>Replica size</span>
              <select
                aria-describedby={errors.replicaSize ? errorId("replicaSize") : undefined}
                aria-invalid={Boolean(errors.replicaSize)}
                data-focus-key="replicaSize"
                onChange={(event) => updateEditor((current) => ({ ...current, replicaSize: event.target.value }))}
                value={editor.replicaSize}
              >
                {[2, 3, 4, 5].map((size) => <option key={size} value={size}>{size} copies</option>)}
              </select>
              {errors.replicaSize ? <span className={styles.fieldError} id={errorId("replicaSize")}>{errors.replicaSize}</span> : null}
            </label>
          ) : (
            <div className={styles.inlineFields}>
              <label className={styles.field}>
                <span>Data chunks k</span>
                <input
                  aria-describedby={errors.k ? errorId("k") : undefined}
                  aria-invalid={Boolean(errors.k)}
                  data-focus-key="k"
                  inputMode="numeric"
                  onChange={(event) => updateEditor((current) => ({ ...current, k: event.target.value }))}
                  value={editor.k}
                />
                {errors.k ? <span className={styles.fieldError} id={errorId("k")}>{errors.k}</span> : null}
              </label>
              <label className={styles.field}>
                <span>Coding chunks m</span>
                <input
                  aria-describedby={errors.m ? errorId("m") : undefined}
                  aria-invalid={Boolean(errors.m)}
                  data-focus-key="m"
                  inputMode="numeric"
                  onChange={(event) => updateEditor((current) => ({ ...current, m: event.target.value }))}
                  value={editor.m}
                />
                {errors.m ? <span className={styles.fieldError} id={errorId("m")}>{errors.m}</span> : null}
              </label>
            </div>
          )}

          <label className={styles.field}>
            <span>Failure domain</span>
            <select
              aria-describedby={errors.failureDomain ? errorId("failureDomain") : undefined}
              aria-invalid={Boolean(errors.failureDomain)}
              data-focus-key="failureDomain"
              onChange={(event) => updateEditor((current) => ({ ...current, failureDomain: event.target.value as FailureDomain }))}
              value={editor.failureDomain}
            >
              {failureDomains.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
            </select>
            {errors.failureDomain ? <span className={styles.fieldError} id={errorId("failureDomain")}>{errors.failureDomain}</span> : null}
          </label>

          <label className={styles.field}>
            <span>Planning reserve</span>
            <span className={styles.inputSuffix}>
              <input
                aria-describedby={errors.reserve ? errorId("reserve") : undefined}
                aria-invalid={Boolean(errors.reserve)}
                data-focus-key="reserve"
                inputMode="decimal"
                onChange={(event) => updateEditor((current) => ({ ...current, reserve: event.target.value }))}
                value={editor.reserve}
              />
              <span aria-hidden="true">%</span>
            </span>
            {errors.reserve ? <span className={styles.fieldError} id={errorId("reserve")}>{errors.reserve}</span> : null}
          </label>
        </div>

        <div className={styles.batchSection}>
          <div className={styles.sectionHeading}>
            <div>
              <h3>OSD batches</h3>
              <p>Group equal OSDs by domain.</p>
            </div>
            <span className={styles.count}>{editor.batches.length}/{MAX_ROWS} batches</span>
          </div>
          {editor.batches.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Add a batch to start.</p>
            </div>
          ) : (
            <div className={styles.batchList}>
              {editor.batches.map((batch, index) => {
                const domainError = errors[`batch-${batch.id}-domain`];
                const countError = errors[`batch-${batch.id}-count`];
                const capacityError = errors[`batch-${batch.id}-capacity`];
                return (
                  <div className={styles.batchRow} data-testid="osd-batch" key={batch.id}>
                    <span className={styles.batchNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <label className={styles.field}>
                      <span>Failure-domain label</span>
                      <input
                        aria-describedby={domainError ? errorId(`batch-${batch.id}-domain`) : undefined}
                        aria-invalid={Boolean(domainError)}
                        data-focus-key={`batch-${batch.id}-domain`}
                        onChange={(event) => updateBatch(batch.id, { domain: event.target.value })}
                        placeholder="host-a"
                        value={batch.domain}
                      />
                      {domainError ? <span className={styles.fieldError} id={errorId(`batch-${batch.id}-domain`)}>{domainError}</span> : null}
                    </label>
                    <label className={styles.field}>
                      <span>OSD count</span>
                      <input
                        aria-describedby={countError ? errorId(`batch-${batch.id}-count`) : undefined}
                        aria-invalid={Boolean(countError)}
                        data-focus-key={`batch-${batch.id}-count`}
                        inputMode="numeric"
                        onChange={(event) => updateBatch(batch.id, { osdCount: event.target.value })}
                        value={batch.osdCount}
                      />
                      {countError ? <span className={styles.fieldError} id={errorId(`batch-${batch.id}-count`)}>{countError}</span> : null}
                    </label>
                    <div className={styles.capacityField}>
                      <label className={styles.field}>
                        <span>OSD capacity</span>
                        <input
                          aria-describedby={capacityError ? errorId(`batch-${batch.id}-capacity`) : undefined}
                          aria-invalid={Boolean(capacityError)}
                          data-focus-key={`batch-${batch.id}-capacity`}
                          inputMode="decimal"
                          onChange={(event) => updateBatch(batch.id, { capacity: event.target.value })}
                          placeholder="12"
                          value={batch.capacity}
                        />
                        {capacityError ? <span className={styles.fieldError} id={errorId(`batch-${batch.id}-capacity`)}>{capacityError}</span> : null}
                      </label>
                      <label className={styles.field}>
                        <span>Unit</span>
                        <select aria-label="Capacity unit" onChange={(event) => changeUnit(batch.id, event.target.value as CapacityUnit)} value={batch.unit}>
                          {inputUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                      </label>
                    </div>
                    <button
                      aria-label={`Remove OSD batch ${index + 1}`}
                      className={styles.iconButton}
                      onClick={() => removeBatch(batch.id)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {errors.batches ? <p className={styles.fieldError}>{errors.batches}</p> : null}
        </div>

        <div className={styles.formActions}>
          <button className={styles.primaryButton} type="submit">Plan capacity</button>
          <button className={styles.secondaryButton} onClick={reset} type="button"><RotateCcw aria-hidden="true" size={18} /> Reset</button>
          <span className={styles.formMeta}>{editor.batches.reduce((total, batch) => total + (Number(batch.osdCount) || 0), 0)}/{MAX_OSDS} OSDs</span>
        </div>
        {status ? <p aria-live="polite" className={styles.status} role="status">{status}</p> : null}
      </form>

      {calculated ? (
        <section className={styles.result} aria-labelledby="ceph-result-heading">
          <div className={styles.resultHeader}>
            <div>
              <h2 id="ceph-result-heading" tabIndex={-1}>Modeled capacity</h2>
            <p>{calculated.values.protectionRatio.dataShards}/{calculated.values.protectionRatio.totalShards} ratio. {statusLabel(calculated.values.placementStatus)}.</p>
            </div>
            <div className={styles.resultActions}>
              <button className={styles.secondaryButton} onClick={share} type="button"><Share2 aria-hidden="true" size={18} /> Share plan</button>
            </div>
          </div>

          <div className={styles.metricGrid} data-testid="capacity-accounting">
            <div className={styles.metric}><span>Raw capacity</span><strong>{capacityPair(calculated.values.rawBytes)}</strong></div>
            <div className={styles.metric}><span>Modeled capacity</span><strong>{capacityPair(calculated.values.modeledUsableBytes)}</strong></div>
            <div className={styles.metric}><span>Protection overhead</span><strong>{capacityPair(calculated.values.protectionOverheadBytes)}</strong></div>
            <div className={styles.metric}><span>Planning reserve</span><strong>{capacityPair(calculated.values.reserveBytes)}</strong></div>
            <div className={styles.metric}><span>Planning target</span><strong>{capacityPair(calculated.values.targetBytes)}</strong></div>
          </div>

          <div className={styles.visualBlock} data-testid="capacity-bar">
            <div className={styles.visualHeader}><h3>Raw allocation</h3><span>{formatPercent(calculated.values.modeledUsableBytes, calculated.values.rawBytes)} modeled</span></div>
            <div aria-label="Capacity allocation" className={styles.barTrack} role="img">
              <span className={styles.barModeled} style={{ width: `${Number((calculated.values.modeledUsableBytes * 10_000n) / calculated.values.rawBytes) / 100}%` }} />
              <span className={styles.barOverhead} style={{ width: `${Number((calculated.values.protectionOverheadBytes * 10_000n) / calculated.values.rawBytes) / 100}%` }} />
            </div>
            <div className={styles.legend}><span><i className={styles.legendModeled} /> Modeled</span><span><i className={styles.legendOverhead} /> Protection overhead</span></div>
          </div>

          <div className={styles.resultNotes}>
            <p><strong>{statusLabel(calculated.values.placementStatus)}.</strong> {calculated.values.distinctDomains} domains; {calculated.values.requiredDomains} required.</p>
            <p>Reserve is a policy, not a threshold.</p>
          </div>

          <div className={styles.domainSection} data-testid="domain-table">
            <div className={styles.sectionHeading}><div><h3>Failure-domain contribution</h3><p>Largest grouped capacity: modeled loss.</p></div></div>
            <div className={styles.tableWrap}>
              <table className={styles.domainTable}>
                <thead><tr><th scope="col">Domain</th><th scope="col">OSDs</th><th scope="col">Raw capacity</th><th scope="col">Largest loss</th></tr></thead>
                <tbody>
                  {calculated.values.domains.map((domain) => <tr key={domain.normalizedLabel}>
                    <th data-label="Domain" scope="row">{domain.label}{domain.isLargest ? <span className={styles.inlineTag}> largest</span> : null}</th>
                    <td data-label="OSDs">{domain.osdCount}</td>
                    <td data-label="Raw capacity">{capacityPair(domain.rawBytes)}</td>
                    <td data-label="Largest loss">{domain.isLargest ? "Selected" : "-"}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <dl className={styles.domainFacts}>
              <div><dt>Required domains</dt><dd>{calculated.values.requiredDomains}</dd></div>
              <div><dt>Largest-domain loss</dt><dd>{calculated.values.largestDomainLoss.domainLabel}</dd></div>
              <div><dt>Raw remaining</dt><dd>{capacityPair(calculated.values.largestDomainLoss.survivingRawBytes)}</dd></div>
              <div><dt>Placement after loss</dt><dd>{statusLabel(calculated.values.largestDomainLoss.placementStatus)}</dd></div>
            </dl>
          </div>

          {shareUrl ? (
            <label className={styles.shareLink}>
              <span>Share URL</span>
              <span className={styles.shareInputRow}>
                <input aria-label="Share URL" readOnly value={shareUrl} />
                <button aria-label="Copy share URL" className={styles.iconButton} onClick={() => navigator.clipboard.writeText(shareUrl).catch(() => setStatus("Share URL ready. Copy failed."))} type="button"><Copy aria-hidden="true" size={18} /></button>
              </span>
            </label>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
