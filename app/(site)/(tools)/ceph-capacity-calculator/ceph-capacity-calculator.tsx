"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiChoiceGroup, UiNumberField, UiQuantityInput, UiRepeatableList, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
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

type CalculatedState = { input: CephCalculatorInput; values: CephCalculationValues };
type FieldErrors = Record<string, string>;

const inputUnits: readonly CapacityUnit[] = ["TB", "GB", "TiB", "GiB"];
const unitOptions = inputUnits.map((unit) => uiOption(unit, unit));
const modeOptions = [uiOption("replicated", "Replicated"), uiOption("erasure", "Erasure coding")];
const replicaOptions = [2, 3, 4, 5].map((size) => uiOption(String(size), `${size} copies`));
const domainOptions = (["osd", "host", "rack", "datacenter"] as const).map((domain) =>
  uiOption(domain, domain === "osd" ? "OSD" : `${domain[0].toUpperCase()}${domain.slice(1)}`),
);

function emptyEditor(): EditorState {
  return { mode: "replicated", replicaSize: "3", k: "4", m: "2", failureDomain: "host", reserve: "20", batches: [] };
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
  const basisPoints = Number(value.split(".")[0]) * 100 + Number((match[1] ?? "").padEnd(2, "0"));
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
  const addError = (field: string, message: string) => { if (!errors[field]) errors[field] = message; };
  const reserveBasisPoints = parseReserve(editor.reserve);
  if (reserveBasisPoints === null) addError("reserve", "Use 0 to 50 percent.");
  if (!editor.batches.length) addError("batches", "Add one OSD batch.");

  const batches: CephBatch[] = editor.batches.map((batch) => {
    const domain = batch.domain.trim();
    if (!domain) addError(`batch-${batch.id}-domain`, "Domain label is required.");
    const osdCount = /^\d+$/.test(batch.osdCount.trim()) ? Number(batch.osdCount) : 0;
    if (!osdCount) addError(`batch-${batch.id}-count`, "Enter an OSD count.");
    let capacityBytes = 0n;
    try {
      capacityBytes = parseCapacityBytes(batch.capacity, batch.unit);
    } catch (error) {
      addError(`batch-${batch.id}-capacity`, error instanceof Error ? error.message : "Enter a capacity.");
    }
    return { id: batch.id, domain, osdCount, capacityBytes };
  });

  if (Object.keys(errors).length) return { input: null, errors };
  const input: CephCalculatorInput = {
    mode: editor.mode,
    replicaSize: editor.mode === "replicated" ? Number(editor.replicaSize) : null,
    k: editor.mode === "erasure" ? Number(editor.k) : null,
    m: editor.mode === "erasure" ? Number(editor.m) : null,
    failureDomain: editor.failureDomain,
    reserveBasisPoints: reserveBasisPoints as number,
    batches,
  };
  const result = calculateCephCapacity(input);
  if (result.status === "invalid") {
    for (const issue of result.issues) addError(mapEngineField(issue.field, editor.batches), issue.message);
    return { input: null, errors };
  }
  return { input, errors: {} };
}

function displayCapacity(bytes: bigint) {
  return formatBytes(bytes, "TB");
}

function placementLabel(status: "minimum-met" | "extra-domain-headroom" | "degraded-placement") {
  if (status === "minimum-met") return "Minimum domains met";
  if (status === "extra-domain-headroom") return "Extra domain headroom";
  return "Placement minimum not met";
}

function profileLabel(input: CephCalculatorInput) {
  return input.mode === "replicated" ? `${input.replicaSize} copies` : `${input.k}+${input.m} erasure coding`;
}

function Result({ calculated, shareUrl, status, onShare }: { calculated: CalculatedState; shareUrl: string; status: string; onShare: () => void }) {
  const { input, values } = calculated;
  const extraDomains = values.distinctDomains - values.requiredDomains;
  const afterLoss = values.largestDomainLoss;
  return (
    <section aria-live="polite" className={styles.result} data-testid="ceph-result">
      <h2 className={styles.resultHeading} id="ceph-result-heading" tabIndex={-1}>Ceph capacity plan</h2>
      <UiPrimaryResult
        detail={`${formatBytes(values.targetBytes, "TiB")} · ${profileLabel(input)} · ${input.reserveBasisPoints / 100}% reserve`}
        label="Planning target"
        value={displayCapacity(values.targetBytes)}
      />

      <section className={styles.resultSection} data-testid="capacity-accounting">
        <h2>Capacity allocation</h2>
        <UiAllocationBar
          ariaLabel="Capacity allocation"
          formatValue={(value) => displayCapacity(value as bigint)}
          palette="categorical"
          segments={[
            { id: "target", label: "Planning target", tone: "chartreuse", value: values.targetBytes },
            { id: "reserve", label: "Reserve", tone: "yellow", value: values.reserveBytes },
            { id: "protection", label: "Protection overhead", tone: "cyan", value: values.protectionOverheadBytes },
          ]}
          total={values.rawBytes}
        />
      </section>

      <section className={styles.resultSection}>
        <h2>Placement</h2>
        <UiStatus tone={values.placementStatus === "extra-domain-headroom" ? "success" : "neutral"}>
          {placementLabel(values.placementStatus)}
        </UiStatus>
        <UiKeyValueList rows={[
          { label: "Required domains", value: values.requiredDomains },
          { label: "Entered domains", value: values.distinctDomains },
          { label: "Extra domains", value: Math.max(0, extraDomains) },
        ]} />
      </section>

      <section className={styles.resultSection}>
        <h2>Largest-domain loss</h2>
        <p className={styles.lossSummary}>
          Losing {afterLoss.domainLabel} leaves {afterLoss.remainingDomains} domains. {placementLabel(afterLoss.placementStatus)}.
        </p>
        <UiKeyValueList rows={[
          { label: "Raw capacity lost", value: displayCapacity(afterLoss.lostRawBytes) },
          { label: "Raw capacity remaining", value: displayCapacity(afterLoss.survivingRawBytes) },
        ]} />
      </section>

      <section className={styles.resultSection} data-testid="domain-table">
        <h2>Domain inventory</h2>
        <UiDataTable
          ariaLabel="Ceph failure-domain inventory"
          columns={[
            { id: "domain", label: "Domain" },
            { id: "osds", label: "OSDs" },
            { id: "raw", label: "Raw capacity" },
            { id: "share", label: "Raw share" },
          ]}
          rows={values.domains.map((domain) => ({
            id: domain.normalizedLabel,
            cells: {
              domain: <>{domain.label}{domain.isLargest ? <span className={styles.largest}> largest</span> : null}</>,
              osds: domain.osdCount,
              raw: displayCapacity(domain.rawBytes),
              share: formatPercent(domain.rawBytes, values.rawBytes),
            },
          }))}
        />
      </section>

      <UiActionRow>
        <UiButton onPress={onShare}>Share plan</UiButton>
      </UiActionRow>
      {shareUrl ? <UiTextField label="Share URL" readOnly value={shareUrl} /> : null}
      {status ? <UiStatus>{status}</UiStatus> : null}
      <p className={styles.boundary}>Verify the inventory, CRUSH hierarchy, and pool profile on the live cluster.</p>
    </section>
  );
}

export function CephCapacityCalculator({ initialState }: { initialState: string }) {
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [calculated, setCalculated] = useState<CalculatedState | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const pendingFocus = useRef<string | null>(null);
  const focusResult = useRef(false);

  function clearQuery() {
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  }

  useEffect(() => {
    if (!initialState) return;
    const restored = decodeCephInput(initialState);
    const result = restored ? calculateCephCapacity(restored) : null;
    if (!restored || result?.status !== "valid") {
      clearQuery();
      setStatus("Shared plan could not load.");
      return;
    }
    setEditor(editorFromInput(restored));
    setCalculated({ input: restored, values: result.values });
    setStatus("Shared plan loaded.");
  }, [initialState]);

  useEffect(() => {
    if (pendingFocus.current) {
      document.querySelector<HTMLElement>(`[data-focus-key="${pendingFocus.current}"]`)?.focus();
      pendingFocus.current = null;
    }
    if (focusResult.current && calculated) {
      document.getElementById("ceph-result-heading")?.focus({ preventScroll: true });
      focusResult.current = false;
    }
  }, [editor, errors, calculated]);

  function mutate(updater: (current: EditorState) => EditorState) {
    setEditor(updater);
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    setStatus("");
    clearQuery();
  }

  function addBatch() {
    if (editor.batches.length >= MAX_ROWS) return;
    const id = nextBatchId(editor.batches);
    mutate((current) => ({
      ...current,
      batches: [...current.batches, { id, domain: "", osdCount: "1", capacity: "", unit: "TB" }],
    }));
  }

  function removeBatch(id: string) {
    mutate((current) => ({ ...current, batches: current.batches.filter((batch) => batch.id !== id) }));
  }

  function updateBatch(id: string, patch: Partial<BatchDraft>) {
    mutate((current) => ({
      ...current,
      batches: current.batches.map((batch) => batch.id === id ? { ...batch, ...patch } : batch),
    }));
  }

  function changeUnit(id: string, unit: CapacityUnit) {
    const batch = editor.batches.find((candidate) => candidate.id === id);
    if (!batch) return;
    if (!batch.capacity.trim()) return updateBatch(id, { unit });
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const compiled = compileEditor(editor);
    if (!compiled.input) {
      setCalculated(null);
      setErrors(compiled.errors);
      setStatus("Check the marked inputs.");
      const first = Object.keys(compiled.errors)[0];
      pendingFocus.current = first === "domains" || first === "batches" ? `batch-${editor.batches[0]?.id}-domain` : first;
      return;
    }
    const result = calculateCephCapacity(compiled.input);
    if (result.status !== "valid") return;
    setErrors({});
    setCalculated({ input: compiled.input, values: result.values });
    setShareUrl("");
    setStatus("");
    focusResult.current = true;
  }

  async function share() {
    if (!calculated) return;
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("state", serializeCephInput(calculated.input));
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setShareUrl(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus("Share URL copied.");
    } catch {
      setStatus("Share URL ready.");
    }
  }

  function reset() {
    setEditor(emptyEditor());
    setCalculated(null);
    setErrors({});
    setShareUrl("");
    clearQuery();
    setStatus("Plan reset.");
    window.setTimeout(() => document.querySelector<HTMLElement>("section[aria-label='OSD batches'] button")?.focus(), 0);
  }

  const osdCount = editor.batches.reduce((total, batch) => total + (Number(batch.osdCount) || 0), 0);

  return (
    <div className={styles.tool} data-tool-workbench>
      <form aria-label="Ceph capacity planner" className={styles.form} noValidate onSubmit={submit}>
        <div className={styles.profileGrid}>
          <UiChoiceGroup label="Protection mode" onChange={(mode) => mutate((current) => ({ ...current, mode: mode as ProtectionMode }))} options={modeOptions} required value={editor.mode} />
          {editor.mode === "replicated" ? (
            <UiChoiceGroup error={errors.replicaSize} label="Replica size" onChange={(replicaSize) => mutate((current) => ({ ...current, replicaSize }))} options={replicaOptions} required value={editor.replicaSize} />
          ) : (
            <div className={styles.chunkGrid}>
              <UiNumberField dataFocusKey="k" error={errors.k} label="Data chunks k" max={12} min={2} onChange={(value) => mutate((current) => ({ ...current, k: Number.isNaN(value) ? "" : String(value) }))} required value={Number(editor.k)} />
              <UiNumberField dataFocusKey="m" error={errors.m} label="Coding chunks m" max={8} min={1} onChange={(value) => mutate((current) => ({ ...current, m: Number.isNaN(value) ? "" : String(value) }))} required value={Number(editor.m)} />
            </div>
          )}
          <UiChoiceGroup error={errors.failureDomain} label="Failure domain" onChange={(failureDomain) => mutate((current) => ({ ...current, failureDomain: failureDomain as FailureDomain }))} options={domainOptions} required value={editor.failureDomain} />
          <UiNumberField dataFocusKey="reserve" error={errors.reserve} label="Planning reserve" max={50} min={0} onChange={(value) => mutate((current) => ({ ...current, reserve: Number.isNaN(value) ? "" : String(value) }))} required step={1} suffix="%" value={Number(editor.reserve)} />
        </div>

        <section className={styles.inventorySection}>
          <div className={styles.sectionHeading}>
            <h2>OSD batches</h2>
            <span>{editor.batches.length} / {MAX_ROWS} batches · {osdCount} / {MAX_OSDS} OSDs</span>
          </div>
          <UiRepeatableList
            addDisabled={editor.batches.length >= MAX_ROWS}
            addLabel="Add OSD batch"
            ariaLabel="OSD batches"
            items={editor.batches}
            onAdd={addBatch}
            onRemove={removeBatch}
            removeLabel={(_, index) => `Remove OSD batch ${index + 1}`}
            renderItem={(batch, index) => (
              <div className={styles.batchEditor} data-testid="osd-batch">
                <span aria-hidden="true" className={styles.batchNumber}>{String(index + 1).padStart(2, "0")}</span>
                <UiTextField
                  dataFocusKey={`batch-${batch.id}-domain`}
                  error={errors[`batch-${batch.id}-domain`]}
                  label="Failure-domain label"
                  onChange={(domain) => updateBatch(batch.id, { domain })}
                  placeholder="host-a"
                  required
                  value={batch.domain}
                />
                <UiNumberField
                  dataFocusKey={`batch-${batch.id}-count`}
                  error={errors[`batch-${batch.id}-count`]}
                  label="OSD count"
                  max={64}
                  min={1}
                  onChange={(value) => updateBatch(batch.id, { osdCount: Number.isNaN(value) ? "" : String(value) })}
                  required
                  value={Number(batch.osdCount)}
                />
                <UiQuantityInput
                  ariaLabel="OSD capacity"
                  dataFocusKey={`batch-${batch.id}-capacity`}
                  error={errors[`batch-${batch.id}-capacity`]}
                  label="OSD capacity"
                  onChange={(capacity) => updateBatch(batch.id, { capacity })}
                  onUnitChange={(unit) => changeUnit(batch.id, unit as CapacityUnit)}
                  placeholder="12"
                  required
                  unit={batch.unit}
                  unitAriaLabel="Capacity unit"
                  units={unitOptions}
                  value={batch.capacity}
                />
              </div>
            )}
          />
          {errors.batches || errors.domains || errors.osds || errors.profile ? (
            <p className={styles.formError}>{errors.batches ?? errors.domains ?? errors.osds ?? errors.profile}</p>
          ) : null}
        </section>

        <UiActionRow>
          <UiButton type="submit" variant="primary">Plan capacity</UiButton>
          <UiButton onPress={reset}>Reset</UiButton>
        </UiActionRow>
        {status && !calculated ? <UiStatus tone={Object.keys(errors).length ? "danger" : "neutral"}>{status}</UiStatus> : null}
      </form>

      {calculated ? <Result calculated={calculated} onShare={share} shareUrl={shareUrl} status={status} /> : null}
    </div>
  );
}
