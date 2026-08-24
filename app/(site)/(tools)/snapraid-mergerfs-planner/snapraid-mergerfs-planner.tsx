"use client";

import { Clipboard, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  MERGERFS_POLICY_OPTIONS,
  buildSnapraidMergerfsPlan,
  displayPlanSummary,
  type CapacityUnit,
  type DiskRowInput,
  type SnapraidBlocksize,
  type SnapraidMergerfsInput,
  type SnapraidMergerfsReady,
  type SnapraidMergerfsResult,
} from "./snapraid-merfs-engine";
import styles from "./snapraid-mergerfs-planner.module.css";

const defaultInput: SnapraidMergerfsInput = {
  data: [
    { path: "/mnt/disk1", capacity: "8", unit: "TB" },
    { path: "/mnt/disk2", capacity: "8", unit: "TB" },
    { path: "/mnt/disk3", capacity: "8", unit: "TB" },
    { path: "/mnt/disk4", capacity: "8", unit: "TB" },
  ],
  parity: [{ path: "/mnt/parity1", capacity: "12", unit: "TB" }],
  content: ["/mnt/disk1/.snapraid.content", "/mnt/disk2/.snapraid.content"],
  poolPath: "/mnt/storage",
  policy: "balanced",
  blocksize: 256,
  standardExcludes: true,
};

const newDataRow = (index: number): DiskRowInput => ({ path: `/mnt/disk${index}`, capacity: "8", unit: "TB" });
const newParityRow = (index: number): DiskRowInput => ({ path: `/mnt/parity${index}`, capacity: "12", unit: "TB" });

function cloneInput(input: SnapraidMergerfsInput): SnapraidMergerfsInput {
  return { ...input, data: input.data.map((row) => ({ ...row })), parity: input.parity.map((row) => ({ ...row })), content: [...input.content] };
}

function fieldError(result: SnapraidMergerfsResult | null, field: string): string | undefined {
  if (!result || result.status !== "invalid") return undefined;
  return result.errors[field];
}

function RowActions({ onRemove, label, disabled = false }: { onRemove: () => void; label: string; disabled?: boolean }) {
  return (
    <button className={styles.removeButton} type="button" onClick={onRemove} disabled={disabled} aria-label={`Remove ${label}`}>
      <Trash2 aria-hidden="true" size={16} />
      <span>Remove</span>
    </button>
  );
}

function DataRow({
  row,
  index,
  error,
  firstRef,
  onChange,
  onRemove,
  canRemove,
}: {
  row: DiskRowInput;
  index: number;
  error?: (suffix: string) => string | undefined;
  firstRef?: React.Ref<HTMLInputElement>;
  onChange: (next: DiskRowInput) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const label = `Data disk ${index + 1}`;
  return (
    <div className={styles.inventoryRow}>
      <div className={styles.rowName} aria-label={`${label} generated name`}><code>d{index + 1}</code><span>{label}</span></div>
      <label className={styles.field} htmlFor={`data-path-${index}`}>
        <span>Mount path</span>
        <input ref={firstRef} id={`data-path-${index}`} data-error-field={`data.${index}.path`} aria-label={`${label} mount path`} aria-invalid={Boolean(error?.("path"))} aria-describedby={error?.("path") ? `data-path-${index}-error` : undefined} value={row.path} onChange={(event) => onChange({ ...row, path: event.target.value })} spellCheck={false} />
        {error?.("path") ? <small id={`data-path-${index}-error`} className={styles.error}>{error("path")}</small> : null}
      </label>
      <div className={styles.capacityField}>
        <label className={styles.field} htmlFor={`data-capacity-${index}`}>
          <span>Capacity</span>
          <input id={`data-capacity-${index}`} data-error-field={`data.${index}.capacity`} aria-label={`${label} capacity`} aria-invalid={Boolean(error?.("capacity"))} aria-describedby={error?.("capacity") ? `data-capacity-${index}-error` : undefined} inputMode="decimal" value={row.capacity} onChange={(event) => onChange({ ...row, capacity: event.target.value })} />
          {error?.("capacity") ? <small id={`data-capacity-${index}-error`} className={styles.error}>{error("capacity")}</small> : null}
        </label>
        <label className={styles.unitField} htmlFor={`data-unit-${index}`}>
          <span>Unit</span>
          <select id={`data-unit-${index}`} aria-label={`${label} capacity unit`} value={row.unit} onChange={(event) => onChange({ ...row, unit: event.target.value as CapacityUnit })}>
            <option value="TB">TB</option>
            <option value="TiB">TiB</option>
          </select>
        </label>
      </div>
      <RowActions label={label.toLowerCase()} onRemove={onRemove} disabled={!canRemove} />
    </div>
  );
}

function ParityRow({
  row,
  index,
  error,
  onChange,
  onRemove,
  canRemove,
}: {
  row: DiskRowInput;
  index: number;
  error?: (suffix: string) => string | undefined;
  onChange: (next: DiskRowInput) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const label = `Parity disk ${index + 1}`;
  return (
    <div className={styles.inventoryRow}>
      <div className={styles.rowName} aria-label={`${label} generated name`}><code>{index === 0 ? "parity" : `${index + 1}-parity`}</code><span>{label}</span></div>
      <label className={styles.field} htmlFor={`parity-path-${index}`}>
        <span>Mount path</span>
        <input id={`parity-path-${index}`} data-error-field={`parity.${index}.path`} aria-label={`${label} mount path`} aria-invalid={Boolean(error?.("path"))} aria-describedby={error?.("path") ? `parity-path-${index}-error` : undefined} value={row.path} onChange={(event) => onChange({ ...row, path: event.target.value })} spellCheck={false} />
        {error?.("path") ? <small id={`parity-path-${index}-error`} className={styles.error}>{error("path")}</small> : null}
      </label>
      <div className={styles.capacityField}>
        <label className={styles.field} htmlFor={`parity-capacity-${index}`}>
          <span>Capacity</span>
          <input id={`parity-capacity-${index}`} data-error-field={`parity.${index}.capacity`} aria-label={`${label} capacity`} aria-invalid={Boolean(error?.("capacity"))} aria-describedby={error?.("capacity") ? `parity-capacity-${index}-error` : undefined} inputMode="decimal" value={row.capacity} onChange={(event) => onChange({ ...row, capacity: event.target.value })} />
          {error?.("capacity") ? <small id={`parity-capacity-${index}-error`} className={styles.error}>{error("capacity")}</small> : null}
        </label>
        <label className={styles.unitField} htmlFor={`parity-unit-${index}`}>
          <span>Unit</span>
          <select id={`parity-unit-${index}`} aria-label={`${label} capacity unit`} value={row.unit} onChange={(event) => onChange({ ...row, unit: event.target.value as CapacityUnit })}>
            <option value="TB">TB</option>
            <option value="TiB">TiB</option>
          </select>
        </label>
      </div>
      <RowActions label={label.toLowerCase()} onRemove={onRemove} disabled={!canRemove} />
    </div>
  );
}

function CopyButton({ label, onCopy }: { label: string; onCopy: () => void }) {
  return <button className={styles.secondaryButton} type="button" onClick={onCopy}><Clipboard aria-hidden="true" size={17} /> {label}</button>;
}

function Result({ result, onCopy }: { result: SnapraidMergerfsReady; onCopy: (kind: "config" | "fstab") => Promise<boolean> }) {
  const [copyStatus, setCopyStatus] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function copy(kind: "config" | "fstab") {
    const copied = await onCopy(kind);
    setCopyStatus(copied
      ? `${kind === "config" ? "snapraid.conf" : "fstab line"} copied.`
      : "Copy failed. The code remains selectable above.");
  }

  return (
    <section className={styles.result} aria-label="Configuration result" aria-live="polite">
      <div className={styles.resultHeader}>
        <div>
          <h2 ref={headingRef} tabIndex={-1}>Review both files before touching /etc.</h2>
        </div>
        <p className={styles.statusText}>{displayPlanSummary(result)}</p>
      </div>
      <p className={styles.summary}>Configuration ready for review. {result.normalized.content.length} content copies.</p>
      <div className={styles.audit} role="region" aria-label="Configuration checks" tabIndex={0}>
        <table>
          <thead><tr><th>Check</th><th>Status</th><th>What it means</th></tr></thead>
          <tbody>{result.checks.map((check) => <tr key={check.label}><th scope="row">{check.label}</th><td><span className={check.status === "pass" ? styles.pass : styles.note}>{check.status === "pass" ? "Pass" : "Verify"}</span></td><td>{check.detail}</td></tr>)}</tbody>
        </table>
      </div>
      <div className={styles.codeHeader}><div><h3>/etc/snapraid.conf</h3><p>Generated directives.</p></div><CopyButton label="Copy snapraid.conf" onCopy={() => copy("config")} /></div>
      <pre className={styles.codeBlock} tabIndex={0}><code>{result.snapraidConfig}</code></pre>
      <div className={styles.codeHeader}><div><h3>/etc/fstab mergerfs line</h3><p>Data branches only.</p></div><CopyButton label="Copy fstab line" onCopy={() => copy("fstab")} /></div>
      <pre className={styles.codeBlock} tabIndex={0}><code>{result.fstabLine}</code></pre>
      <p className={styles.copyStatus} aria-live="polite">{copyStatus}</p>
      <details className={styles.assumptions}>
        <summary>Review boundaries</summary>
        <ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
      </details>
      <p className={styles.exactNote}>Data bytes: {result.dataTotalBytes.toString()} · Largest: {result.largestDataBytes.toString()} · Parity: {result.parityTotalBytes.toString()}</p>
    </section>
  );
}

export function SnapraidMergerfsPlanner() {
  const [input, setInput] = useState<SnapraidMergerfsInput>(() => cloneInput(defaultInput));
  const [result, setResult] = useState<SnapraidMergerfsResult | null>(null);
  const firstDataPathRef = useRef<HTMLInputElement>(null);

  function update(next: SnapraidMergerfsInput, focusId?: string) {
    setInput(next);
    setResult(null);
    if (focusId) requestAnimationFrame(() => document.getElementById(focusId)?.focus());
  }

  function updateData(index: number, row: DiskRowInput) {
    const next = cloneInput(input);
    next.data[index] = row;
    update(next);
  }

  function updateParity(index: number, row: DiskRowInput) {
    const next = cloneInput(input);
    next.parity[index] = row;
    update(next);
  }

  function removeData(index: number) {
    const next = cloneInput(input);
    next.data.splice(index, 1);
    update(next, `data-path-${Math.max(0, Math.min(index, next.data.length - 1))}`);
  }

  function removeParity(index: number) {
    const next = cloneInput(input);
    next.parity.splice(index, 1);
    update(next, `parity-path-${Math.max(0, Math.min(index, next.parity.length - 1))}`);
  }

  function removeContent(index: number) {
    const next = cloneInput(input);
    next.content.splice(index, 1);
    update(next, `content-path-${Math.max(0, Math.min(index, next.content.length - 1))}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = buildSnapraidMergerfsPlan(input);
    setResult(next);
    requestAnimationFrame(() => {
      if (next.status === "invalid") {
        const first = next.issues.find((item) => item.field !== "form");
        const target = first
          ? document.querySelector<HTMLElement>(`input[data-error-field="${first.field}"], select[data-error-field="${first.field}"]`)
          : null;
        if (target) target.focus();
        else if (first?.field === "data") document.getElementById("data-path-0")?.focus();
        else if (first?.field === "parity") document.getElementById("parity-path-0")?.focus();
        else if (first?.field === "content") document.getElementById("content-path-0")?.focus();
      }
    });
  }

  function reset() {
    setInput(cloneInput(defaultInput));
    setResult(null);
    requestAnimationFrame(() => firstDataPathRef.current?.focus());
  }

  async function copyResult(kind: "config" | "fstab"): Promise<boolean> {
    if (!result || result.status !== "ready") return false;
    const text = kind === "config" ? result.snapraidConfig : result.fstabLine;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // The code block remains selectable when clipboard permission is denied.
      return false;
    }
  }

  const invalid = result?.status === "invalid" ? result : null;
  const error = (prefix: string, index: number) => (suffix: string) => fieldError(result, `${prefix}.${index}.${suffix}`) ?? (suffix === "path" ? fieldError(result, `${prefix}.${index}`) : undefined);

  return (
    <section className={styles.tool} aria-label="SnapRAID and mergerfs configuration planner">
      <form className={styles.form} noValidate onSubmit={submit}>
        <section className={styles.inventory} aria-labelledby="data-disks-heading">
          <div className={styles.sectionHeading}><div><h2 id="data-disks-heading">Data disks</h2></div><span className={styles.count}>{input.data.length} of 42</span></div>
          <p className={styles.sectionHint}>Ordered branches.</p>
          <div className={styles.rows}>{input.data.map((row, index) => <DataRow key={`data-${index}`} row={row} index={index} firstRef={index === 0 ? firstDataPathRef : undefined} error={error("data", index)} onChange={(next) => updateData(index, next)} onRemove={() => removeData(index)} canRemove={input.data.length > 2} />)}</div>
          {fieldError(result, "data") ? <p className={styles.error} data-error-field="data" role="alert">{fieldError(result, "data")}</p> : null}
          <button className={styles.addButton} type="button" disabled={input.data.length >= 42} onClick={() => { const next = cloneInput(input); next.data.push(newDataRow(next.data.length + 1)); update(next, `data-path-${next.data.length - 1}`); }}><Plus aria-hidden="true" size={17} /> Add data disk</button>
        </section>

        <section className={styles.inventory} aria-labelledby="parity-disks-heading">
          <div className={styles.sectionHeading}><div><h2 id="parity-disks-heading">Parity disks</h2></div><span className={styles.count}>{input.parity.length} of 3</span></div>
          <p className={styles.sectionHint}>Parity mount; filename generated.</p>
          <div className={styles.rows}>{input.parity.map((row, index) => <ParityRow key={`parity-${index}`} row={row} index={index} error={error("parity", index)} onChange={(next) => updateParity(index, next)} onRemove={() => removeParity(index)} canRemove={input.parity.length > 1} />)}</div>
          {fieldError(result, "parity") ? <p className={styles.error} data-error-field="parity" role="alert">{fieldError(result, "parity")}</p> : null}
          <button className={styles.addButton} type="button" disabled={input.parity.length >= 3} onClick={() => { const next = cloneInput(input); next.parity.push(newParityRow(next.parity.length + 1)); update(next, `parity-path-${next.parity.length - 1}`); }}><Plus aria-hidden="true" size={17} /> Add parity disk</button>
        </section>

        <section className={styles.inventory} aria-labelledby="content-files-heading">
          <div className={styles.sectionHeading}><div><h2 id="content-files-heading">Content files</h2></div><span className={styles.count}>{input.content.length} of 12</span></div>
          <p className={styles.sectionHint}>Minimum exceeds parity count.</p>
          <div className={styles.contentRows}>{input.content.map((path, index) => <div className={styles.contentRow} key={`content-${index}`}>
            <label className={styles.field} htmlFor={`content-path-${index}`}>
              <span>Content file {index + 1}</span>
              <input id={`content-path-${index}`} data-error-field={`content.${index}`} aria-label={`Content file ${index + 1} path`} aria-invalid={Boolean(fieldError(result, `content.${index}`))} aria-describedby={fieldError(result, `content.${index}`) ? `content-path-${index}-error` : undefined} value={path} onChange={(event) => { const next = cloneInput(input); next.content[index] = event.target.value; update(next); }} spellCheck={false} />
              {fieldError(result, `content.${index}`) ? <small id={`content-path-${index}-error`} className={styles.error}>{fieldError(result, `content.${index}`)}</small> : null}
            </label>
            <RowActions label={`content file ${index + 1}`} onRemove={() => removeContent(index)} disabled={input.content.length <= 2} />
          </div>)}</div>
          {fieldError(result, "content") ? <p className={styles.error} data-error-field="content" role="alert">{fieldError(result, "content")}</p> : null}
          <button className={styles.addButton} type="button" disabled={input.content.length >= 12} onClick={() => { const next = cloneInput(input); const number = next.content.length + 1; next.content.push(number <= next.data.length ? `/mnt/disk${number}/.snapraid.content` : `/srv/content${number}/.snapraid.content`); update(next, `content-path-${next.content.length - 1}`); }}><Plus aria-hidden="true" size={17} /> Add content file</button>
        </section>

        <section className={styles.settings} aria-labelledby="planner-settings-heading">
          <div className={styles.sectionHeading}><div><h2 id="planner-settings-heading">Mount and output settings</h2></div></div>
          <div className={styles.settingsGrid}>
            <label className={styles.field} htmlFor="pool-path"><span>Mergerfs pool mount</span><input id="pool-path" data-error-field="poolPath" aria-invalid={Boolean(fieldError(result, "poolPath"))} aria-describedby={fieldError(result, "poolPath") ? "pool-path-error" : "pool-path-hint"} value={input.poolPath} onChange={(event) => update({ ...input, poolPath: event.target.value })} spellCheck={false} />{fieldError(result, "poolPath") ? <small id="pool-path-error" className={styles.error}>{fieldError(result, "poolPath")}</small> : <small id="pool-path-hint" className={styles.fieldHint}>Outside data and parity mounts.</small>}</label>
            <label className={styles.field} htmlFor="mergerfs-policy"><span>Mergerfs policy preset</span><select id="mergerfs-policy" data-error-field="policy" aria-invalid={Boolean(fieldError(result, "policy"))} value={input.policy} onChange={(event) => update({ ...input, policy: event.target.value as SnapraidMergerfsInput["policy"] })}><option value="balanced">Balanced (epmfs)</option><option value="most-free">Most free (mfs)</option></select><small className={styles.fieldHint}>{MERGERFS_POLICY_OPTIONS[input.policy]}</small></label>
            <label className={styles.field} htmlFor="snapraid-blocksize"><span>SnapRAID blocksize</span><select id="snapraid-blocksize" data-error-field="blocksize" aria-invalid={Boolean(fieldError(result, "blocksize"))} value={input.blocksize} onChange={(event) => update({ ...input, blocksize: Number(event.target.value) as SnapraidBlocksize })}><option value="256">256 KiB</option><option value="512">512 KiB</option><option value="1024">1024 KiB</option></select><small className={styles.fieldHint}>Expert setting.</small></label>
            <label className={styles.checkChoice} htmlFor="standard-excludes"><input id="standard-excludes" data-error-field="standardExcludes" type="checkbox" checked={input.standardExcludes} onChange={(event) => update({ ...input, standardExcludes: event.target.checked })} /><span>Include standard excludes</span></label>
          </div>
        </section>

        {invalid ? <div className={styles.errorSummary} role="alert" aria-live="polite"><strong>Fix the marked inputs before generating files.</strong><ul>{invalid.issues.map((item, index) => <li key={`${item.field}-${index}`}>{item.message}</li>)}</ul><p>No partial configuration was created.</p></div> : null}
        <div className={styles.actions}><button className={styles.secondaryButton} type="button" onClick={reset}><RotateCcw aria-hidden="true" size={17} /> Reset</button><button className={styles.primaryButton} type="submit">Check and generate</button></div>
      </form>
      {result?.status === "ready" ? <Result result={result} onCopy={copyResult} /> : null}
    </section>
  );
}

export { defaultInput };
