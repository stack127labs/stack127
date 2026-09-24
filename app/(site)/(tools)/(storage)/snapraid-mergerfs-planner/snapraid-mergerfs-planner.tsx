"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type Ref } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiCopyAction, UiQuantityInput, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiCodeOutput, UiKeyValueList, UiStatus } from "@/app/ui/display";
import {
  buildSnapraidMergerfsPlan,
  formatPlanBytes,
  type CapacityUnit,
  type DiskRowInput,
  type SnapraidBlocksize,
  type SnapraidMergerfsInput,
  type SnapraidMergerfsReady,
  type SnapraidMergerfsResult,
} from "./snapraid-merfs-engine";
import styles from "./snapraid-mergerfs-planner.module.css";

const capacityUnits = [uiOption("TB", "TB"), uiOption("TiB", "TiB")];
const policyOptions = [uiOption("balanced", "Balanced"), uiOption("most-free", "Most free")];
const blocksizeOptions = [uiOption("256", "256 KiB"), uiOption("512", "512 KiB"), uiOption("1024", "1024 KiB")];

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
  return {
    ...input,
    content: [...input.content],
    data: input.data.map((row) => ({ ...row })),
    parity: input.parity.map((row) => ({ ...row })),
  };
}

function fieldError(result: SnapraidMergerfsResult | null, field: string): string | undefined {
  if (!result || result.status !== "invalid") return undefined;
  return result.errors[field];
}

function RemoveButton({ disabled, label, onPress }: { disabled: boolean; label: string; onPress: () => void }) {
  return (
    <UiButton aria-label={`Remove ${label}`} className={styles.removeButton} isDisabled={disabled} onPress={onPress} variant="ghost">
      <Trash2 aria-hidden="true" size={17} />
      Remove
    </UiButton>
  );
}

function DiskInputRow({
  canRemove,
  code,
  error,
  firstRef,
  label,
  onChange,
  onRemove,
  row,
}: {
  canRemove: boolean;
  code: string;
  error: (suffix: string) => string | undefined;
  firstRef?: Ref<HTMLInputElement>;
  label: string;
  onChange: (next: DiskRowInput) => void;
  onRemove: () => void;
  row: DiskRowInput;
}) {
  const focusPrefix = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div className={styles.diskRow}>
      <code className={styles.rowCode}>{code}</code>
      <UiTextField
        autoCapitalize="none"
        className={styles.pathField}
        dataFocusKey={`${focusPrefix}-path`}
        error={error("path")}
        inputRef={firstRef}
        label={`${label} mount path`}
        onChange={(path) => onChange({ ...row, path })}
        required
        spellCheck={false}
        value={row.path}
      />
      <UiQuantityInput
        ariaLabel={`${label} capacity`}
        dataFocusKey={`${focusPrefix}-capacity`}
        error={error("capacity")}
        label={`${label} capacity`}
        onChange={(capacity) => onChange({ ...row, capacity })}
        onUnitChange={(unit) => onChange({ ...row, unit: unit as CapacityUnit })}
        required
        unit={row.unit}
        unitAriaLabel={`${label} capacity unit`}
        units={capacityUnits}
        value={row.capacity}
      />
      <RemoveButton disabled={!canRemove} label={label.toLowerCase()} onPress={onRemove} />
    </div>
  );
}

function Result({ result }: { result: SnapraidMergerfsReady }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const displayUnit = result.input.data[0]?.unit ?? "TB";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section aria-label="Configuration result" aria-live="polite" className={styles.result}>
      <h2 ref={headingRef} tabIndex={-1}>Configuration ready for review</h2>
      <UiKeyValueList rows={[
        {
          label: "Data",
          value: `${result.normalized.data.length} ${result.normalized.data.length === 1 ? "disk" : "disks"} · ${formatPlanBytes(result.dataTotalBytes, displayUnit)}`,
        },
        {
          label: "Parity",
          value: `${result.parityCount} ${result.parityCount === 1 ? "disk" : "disks"} · ${formatPlanBytes(result.parityTotalBytes, displayUnit)}`,
        },
        {
          label: "Content",
          value: `${result.normalized.content.length} ${result.normalized.content.length === 1 ? "copy" : "copies"}`,
        },
      ]} />
      <UiCodeOutput
        actions={<UiCopyAction label="Copy snapraid.conf" successLabel="snapraid.conf copied" value={result.snapraidConfig} />}
        code={result.snapraidConfig}
        label="/etc/snapraid.conf"
      />
      <UiCodeOutput
        actions={<UiCopyAction label="Copy fstab line" successLabel="fstab line copied" value={result.fstabLine} />}
        code={result.fstabLine}
        label="/etc/fstab mergerfs line"
      />
      <p className={styles.boundary}>Verify mounts, permissions, installed versions, and physical disk separation on the host.</p>
    </section>
  );
}

export function SnapraidMergerfsPlanner() {
  const [input, setInput] = useState<SnapraidMergerfsInput>(() => cloneInput(defaultInput));
  const [result, setResult] = useState<SnapraidMergerfsResult | null>(null);
  const [unexpectedError, setUnexpectedError] = useState("");
  const firstDataPathRef = useRef<HTMLInputElement>(null);

  function update(next: SnapraidMergerfsInput, focusKey?: string) {
    setInput(next);
    setResult(null);
    setUnexpectedError("");
    if (focusKey) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus());
    }
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
    const focusIndex = Math.max(0, Math.min(index, next.data.length - 1));
    update(next, `data-disk-${focusIndex + 1}-path`);
  }

  function removeParity(index: number) {
    const next = cloneInput(input);
    next.parity.splice(index, 1);
    const focusIndex = Math.max(0, Math.min(index, next.parity.length - 1));
    update(next, `parity-disk-${focusIndex + 1}-path`);
  }

  function removeContent(index: number) {
    const next = cloneInput(input);
    next.content.splice(index, 1);
    const focusIndex = Math.max(0, Math.min(index, next.content.length - 1));
    update(next, `content-${focusIndex + 1}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUnexpectedError("");
    try {
      const next = buildSnapraidMergerfsPlan(input);
      setResult(next);
      if (next.status === "invalid") {
        requestAnimationFrame(() => {
          const first = next.issues.find((item) => item.field !== "form");
          if (!first) return;
          const [group, rawIndex = "0", suffix = "path"] = first.field.split(".");
          const index = Number(rawIndex) + 1;
          const focusKey = group === "data"
            ? `data-disk-${index}-${suffix}`
            : group === "parity"
              ? `parity-disk-${index}-${suffix}`
              : group === "content"
                ? `content-${Number.isFinite(index) ? index : 1}`
                : group === "poolPath"
                  ? "pool-path"
                  : "";
          if (focusKey) document.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus();
        });
      }
    } catch {
      setResult(null);
      setUnexpectedError("Could not generate the files. Check the inputs and try again.");
    }
  }

  function reset() {
    setInput(cloneInput(defaultInput));
    setResult(null);
    setUnexpectedError("");
    requestAnimationFrame(() => firstDataPathRef.current?.focus());
  }

  const invalid = result?.status === "invalid" ? result : null;
  const invalidGroups = invalid ? new Set(invalid.issues.map((item) => item.field.split(".")[0])) : new Set<string>();
  const rowError = (prefix: "data" | "parity", index: number) => (suffix: string) => (
    fieldError(result, `${prefix}.${index}.${suffix}`)
    ?? (suffix === "path" ? fieldError(result, `${prefix}.${index}`) : undefined)
  );

  return (
    <section aria-label="SnapRAID and mergerfs configuration planner" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={submit}>
        <section aria-labelledby="data-disks-heading" className={styles.inputGroup}>
          <div className={styles.groupHeading}>
            <h2 id="data-disks-heading">Data disks</h2>
            <span>{input.data.length} / 42</span>
          </div>
          <div className={styles.diskRows}>
            {input.data.map((row, index) => (
              <DiskInputRow
                canRemove={input.data.length > 2}
                code={`d${index + 1}`}
                error={rowError("data", index)}
                firstRef={index === 0 ? firstDataPathRef : undefined}
                key={`data-${index}`}
                label={`Data disk ${index + 1}`}
                onChange={(next) => updateData(index, next)}
                onRemove={() => removeData(index)}
                row={row}
              />
            ))}
          </div>
          {fieldError(result, "data") ? <p className={styles.groupError} role="alert">{fieldError(result, "data")}</p> : null}
          <UiButton
            isDisabled={input.data.length >= 42}
            onPress={() => {
              const next = cloneInput(input);
              next.data.push(newDataRow(next.data.length + 1));
              update(next, `data-disk-${next.data.length}-path`);
            }}
          >
            <Plus aria-hidden="true" size={17} /> Add data disk
          </UiButton>
        </section>

        <section aria-labelledby="parity-disks-heading" className={styles.inputGroup}>
          <div className={styles.groupHeading}>
            <h2 id="parity-disks-heading">Parity disks</h2>
            <span>{input.parity.length} / 3</span>
          </div>
          <div className={styles.diskRows}>
            {input.parity.map((row, index) => (
              <DiskInputRow
                canRemove={input.parity.length > 1}
                code={index === 0 ? "parity" : `${index + 1}-parity`}
                error={rowError("parity", index)}
                key={`parity-${index}`}
                label={`Parity disk ${index + 1}`}
                onChange={(next) => updateParity(index, next)}
                onRemove={() => removeParity(index)}
                row={row}
              />
            ))}
          </div>
          {fieldError(result, "parity") ? <p className={styles.groupError} role="alert">{fieldError(result, "parity")}</p> : null}
          <UiButton
            isDisabled={input.parity.length >= 3}
            onPress={() => {
              const next = cloneInput(input);
              next.parity.push(newParityRow(next.parity.length + 1));
              update(next, `parity-disk-${next.parity.length}-path`);
            }}
          >
            <Plus aria-hidden="true" size={17} /> Add parity disk
          </UiButton>
        </section>

        <section aria-labelledby="content-files-heading" className={styles.inputGroup}>
          <div className={styles.groupHeading}>
            <h2 id="content-files-heading">Content files</h2>
            <span>{input.content.length} / 12</span>
          </div>
          <div className={styles.contentRows}>
            {input.content.map((path, index) => (
              <div className={styles.contentRow} key={`content-${index}`}>
                <UiTextField
                  autoCapitalize="none"
                  dataFocusKey={`content-${index + 1}`}
                  error={fieldError(result, `content.${index}`)}
                  label={`Content file ${index + 1} path`}
                  onChange={(value) => {
                    const next = cloneInput(input);
                    next.content[index] = value;
                    update(next);
                  }}
                  required
                  spellCheck={false}
                  value={path}
                />
                <RemoveButton disabled={input.content.length <= 2} label={`content file ${index + 1}`} onPress={() => removeContent(index)} />
              </div>
            ))}
          </div>
          {fieldError(result, "content") ? <p className={styles.groupError} data-error-field="content" role="alert">{fieldError(result, "content")}</p> : null}
          <UiButton
            isDisabled={input.content.length >= 12}
            onPress={() => {
              const next = cloneInput(input);
              const number = next.content.length + 1;
              next.content.push(number <= next.data.length ? `/mnt/disk${number}/.snapraid.content` : `/srv/content${number}/.snapraid.content`);
              update(next, `content-${next.content.length}`);
            }}
          >
            <Plus aria-hidden="true" size={17} /> Add content file
          </UiButton>
        </section>

        <section aria-labelledby="output-settings-heading" className={styles.inputGroup}>
          <div className={styles.groupHeading}><h2 id="output-settings-heading">Output settings</h2></div>
          <div className={styles.settingsGrid}>
            <UiTextField
              autoCapitalize="none"
              dataFocusKey="pool-path"
              error={fieldError(result, "poolPath")}
              label="Mergerfs pool mount"
              onChange={(poolPath) => update({ ...input, poolPath })}
              required
              spellCheck={false}
              value={input.poolPath}
            />
            <UiChoiceGroup
              error={fieldError(result, "policy")}
              label="Mergerfs policy"
              onChange={(policy) => update({ ...input, policy: policy as SnapraidMergerfsInput["policy"] })}
              options={policyOptions}
              required
              value={input.policy}
            />
            <UiChoiceGroup
              error={fieldError(result, "blocksize")}
              label="SnapRAID blocksize"
              onChange={(blocksize) => update({ ...input, blocksize: Number(blocksize) as SnapraidBlocksize })}
              options={blocksizeOptions}
              required
              value={String(input.blocksize)}
            />
            <UiCheckbox isSelected={input.standardExcludes} onChange={(standardExcludes) => update({ ...input, standardExcludes })}>
              Include standard excludes
            </UiCheckbox>
          </div>
        </section>

        {invalid && invalidGroups.size > 1 ? <UiStatus tone="danger">Fix the marked inputs before generating files.</UiStatus> : null}
        {unexpectedError ? <UiStatus tone="danger">{unexpectedError}</UiStatus> : null}
        <UiActionRow>
          <UiButton type="submit" variant="primary">Check and generate</UiButton>
          <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
        </UiActionRow>
      </form>
      {result?.status === "ready" ? <Result result={result} /> : null}
    </section>
  );
}

export { defaultInput };
