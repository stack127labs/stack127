"use client";

import { useRef, useState, type RefObject } from "react";
import {
  advisorDisplayUnits,
  advisorInputUnits,
  advisorPlatforms,
  advisorWorkloads,
  calculateStorageLayoutAdvisor,
  decodeStorageLayoutAdvisorState,
  encodeStorageLayoutAdvisorState,
  type AdvisorDisplayUnit,
  type AdvisorInputUnit,
  type AdvisorPlatform,
  type AdvisorProtectionTarget,
  type AdvisorWorkload,
  type StorageLayoutAdvisorDriveInput,
  type StorageLayoutAdvisorInput,
  type StorageLayoutAdvisorValues,
} from "./storage-layout-advisor-engine";
import { formatBytes } from "../../../../lib/storage/index.ts";
import styles from "./storage-layout-advisor.module.css";

type UiState = StorageLayoutAdvisorInput;

const DEFAULT_STATE: UiState = {
  drives: [
    { id: "drive-1", size: "4", unit: "TB" },
    { id: "drive-2", size: "4", unit: "TB" },
  ],
  platform: "any",
  workload: "general",
  protectedFailures: 1,
  displayUnit: "TiB",
};

const platformLabels: Record<AdvisorPlatform, string> = {
  any: "Any platform",
  "linux-md": "Linux md",
  openzfs: "OpenZFS",
  "nas-raid": "NAS RAID",
};

const workloadLabels: Record<AdvisorWorkload, string> = {
  general: "General",
  bulk: "Bulk files",
  "vm-db": "VMs and databases",
};

function parseInitialState(encoded: string) {
  if (!encoded) return { state: DEFAULT_STATE, submitted: false, message: "" };
  try {
    const state = decodeStorageLayoutAdvisorState(encoded);
    return { state, submitted: true, message: "Layout restored." };
  } catch {
    return { state: DEFAULT_STATE, submitted: false, message: "Restore failed. Clean defaults loaded." };
  }
}

function formatPercent(part: bigint, total: bigint) {
  if (total === 0n) return "0%";
  const hundredths = (part * 10_000n + total / 2n) / total;
  const whole = hundredths / 100n;
  const fraction = (hundredths % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}%` : `${whole}%`;
}

function fieldIssue(values: ReturnType<typeof calculateStorageLayoutAdvisor>["issues"], path: string) {
  return values.find((item) => item.path === path)?.message ?? "";
}

function displayBytes(value: bigint, unit: AdvisorDisplayUnit) {
  return formatBytes(value, unit, { maximumFractionDigits: 2 });
}

function Result({
  values,
  headingRef,
  onDisplayUnitChange,
}: {
  values: StorageLayoutAdvisorValues;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onDisplayUnitChange: (unit: AdvisorDisplayUnit) => void;
}) {
  const raw = values.rawCapacityBytes;
  const best = values.bestCandidate;
  const parts = [
    { id: "usable", label: "Usable", value: best.usableBytes },
    { id: "redundancy", label: "Redundancy", value: best.redundancyBytes },
    { id: "mismatch", label: "Mismatch", value: best.mismatchBytes },
  ] as const;

  return (
    <section className={styles.result} data-testid="layout-result" aria-labelledby="best-fit-title">
      <div className={styles.resultLead}>
        <div>
          <h2 id="best-fit-title" ref={headingRef} tabIndex={-1}>
            Best fit: {best.label}
          </h2>
          <p className={styles.resultAnswer}>
            <strong>{displayBytes(best.usableBytes, values.displayUnit)}</strong> usable
          </p>
          <p className={styles.resultMeta}>
            {best.guaranteedTolerance} failures · {best.efficiencyBasisPoints / 100}% efficient
          </p>
          <p className={styles.fitReason}>{best.fitReason}</p>
        </div>
        <div className={styles.resultChoice}>
          <label htmlFor="display-unit">Display unit</label>
          <select id="display-unit" onChange={(event) => onDisplayUnitChange(event.currentTarget.value as AdvisorDisplayUnit)} value={values.displayUnit} aria-label="Display unit">
            {advisorDisplayUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.resultRule} />

      <section className={styles.resultSection} data-testid="layout-comparison" aria-labelledby="comparison-title">
        <div className={styles.sectionHeading}>
          <h3 id="comparison-title">Layout comparison</h3>
          <span>{values.eligibleCandidates.length} eligible</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th scope="col">Layout</th>
                <th scope="col">Usable</th>
                <th scope="col">Redundancy</th>
                <th scope="col">Mismatch</th>
                <th scope="col">Tolerance</th>
                <th scope="col">Fit</th>
              </tr>
            </thead>
            <tbody>
              {values.eligibleCandidates.map((candidate, index) => (
                <tr key={candidate.id}>
                  <th scope="row" data-label="Layout">
                    {candidate.label}
                    {index === 0 ? <span className={styles.bestTag}>Best</span> : null}
                  </th>
                  <td data-label="Usable">{displayBytes(candidate.usableBytes, values.displayUnit)}</td>
                  <td data-label="Redundancy">{displayBytes(candidate.redundancyBytes, values.displayUnit)}</td>
                  <td data-label="Mismatch">{displayBytes(candidate.mismatchBytes, values.displayUnit)}</td>
                  <td data-label="Tolerance">{candidate.guaranteedTolerance}</td>
                  <td data-label="Fit">{candidate.fitReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.resultSection} data-testid="capacity-accounting" aria-labelledby="accounting-title">
        <div className={styles.sectionHeading}>
          <h3 id="accounting-title">Capacity accounting</h3>
          <span>{displayBytes(raw, values.displayUnit)} raw</span>
        </div>
        <div className={styles.capacityBar} role="img" aria-label="Capacity accounting">
          {parts.map((part) => part.value > 0n ? (
            <span
              className={`${styles[`capacity${part.id[0].toUpperCase()}${part.id.slice(1)}`]}`}
              key={part.id}
              style={{ width: formatPercent(part.value, raw) }}
            />
          ) : null)}
        </div>
        <dl className={styles.capacityValues}>
          {parts.map((part) => (
            <div key={part.id}>
              <dt>{part.label}</dt>
              <dd>
                <strong>{displayBytes(part.value, values.displayUnit)}</strong>
                <span>{formatPercent(part.value, raw)}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.resultSection} data-testid="layout-topology" aria-labelledby="topology-title">
        <div className={styles.sectionHeading}>
          <h3 id="topology-title">Topology</h3>
          <span>{best.toleranceStatement}</span>
        </div>
        <div className={styles.topology}>
          {best.groups.map((group) => (
            <div className={styles.topologyGroup} key={group.id}>
              <div className={styles.topologyLabel}>
                <strong>{group.label}</strong>
                <span>{displayBytes(group.commonBytes, values.displayUnit)} common</span>
              </div>
              <div className={styles.topologyDrives}>
                {group.driveIds.map((driveId) => (
                  <span className={styles.driveChip} key={driveId}>{driveId.replace("drive-", "Drive ")}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className={styles.modelNote}>Theoretical layout model.</p>
      </section>
    </section>
  );
}

export function StorageLayoutAdvisor({ initialState }: { initialState: string }) {
  const [initial] = useState(() => parseInitialState(initialState));
  const [state, setState] = useState<UiState>(initial.state);
  const [submitted, setSubmitted] = useState(initial.submitted);
  const [statusMessage, setStatusMessage] = useState(initial.message);
  const [sharedUrl, setSharedUrl] = useState("");
  const driveRefs = useRef<Array<HTMLInputElement | null>>([]);
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const noEligibleRef = useRef<HTMLHeadingElement | null>(null);

  const calculation = calculateStorageLayoutAdvisor(state);
  const invalidIssues = calculation.status === "invalid" ? calculation.issues : [];
  const noEligible = invalidIssues.some((item) => item.code === "no_eligible_layout");
  const showResult = submitted && calculation.status === "valid";
  const showNoEligible = submitted && noEligible;

  function focusCorrection() {
    const firstDriveIssue = invalidIssues.find((item) => item.path?.startsWith("drives["));
    const match = firstDriveIssue?.path?.match(/^drives\[(\d+)\]\.(size|unit)$/);
    if (match) {
      const index = Number(match[1]);
      if (match[2] === "size") driveRefs.current[index]?.focus();
      return;
    }
    document.getElementById(firstDriveIssue?.path ?? "protected-failures")?.focus();
  }

  function handleChange(change: (current: UiState) => UiState, keepResult = false) {
    setState(change);
    if (!keepResult) setSubmitted(false);
    setSharedUrl("");
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  }

  function handleCompare() {
    setSubmitted(true);
    if (calculation.status === "invalid" && !noEligible) {
      setSubmitted(false);
      setStatusMessage("Fix the highlighted field.");
      window.requestAnimationFrame(focusCorrection);
      return;
    }
    setStatusMessage(noEligible ? "No eligible layout." : "Layouts compared.");
    window.requestAnimationFrame(() => (noEligible ? noEligibleRef.current : resultHeadingRef.current)?.focus());
  }

  function addDrive() {
    if (state.drives.length >= 64) return;
    const next: StorageLayoutAdvisorDriveInput = {
      id: `drive-${state.drives.length + 1}`,
      size: "4",
      unit: "TB",
    };
    const nextIndex = state.drives.length;
    handleChange((current) => ({ ...current, drives: [...current.drives, next] }));
    window.requestAnimationFrame(() => driveRefs.current[nextIndex]?.focus());
  }

  function removeDrive(index: number) {
    handleChange((current) => ({
      ...current,
      drives: current.drives.filter((_, driveIndex) => driveIndex !== index),
    }));
    window.requestAnimationFrame(() => driveRefs.current[Math.max(0, index - 1)]?.focus());
  }

  function shareLayout() {
    if (calculation.status !== "valid") return;
    try {
      const encoded = encodeStorageLayoutAdvisorState(state);
      const url = new URL(window.location.href);
      url.searchParams.set("state", encoded);
      window.history.replaceState(null, "", url);
      setSharedUrl(url.toString());
      setStatusMessage("Shared layout URL ready.");
      void navigator.clipboard?.writeText(url.toString()).catch(() => undefined);
    } catch {
      setStatusMessage("Share failed.");
    }
  }

  function resetLayout() {
    window.history.replaceState(null, "", window.location.pathname);
    setState(DEFAULT_STATE);
    setSubmitted(false);
    setSharedUrl("");
    setStatusMessage("Reset complete.");
    window.requestAnimationFrame(() => driveRefs.current[0]?.focus());
  }

  return (
    <form className={styles.tool} onSubmit={(event) => { event.preventDefault(); handleCompare(); }} noValidate>
      <div className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <h2>Drives</h2>
          <span>{state.drives.length} / 64</span>
        </div>
        <div className={styles.driveList}>
          {state.drives.map((drive, index) => {
            const sizePath = `drives[${index}].size`;
            const unitPath = `drives[${index}].unit`;
            const sizeError = fieldIssue(invalidIssues, sizePath);
            const unitError = fieldIssue(invalidIssues, unitPath);
            return (
              <div className={styles.driveRow} key={drive.id}>
                <label htmlFor={`${drive.id}-size`}>Drive {index + 1} capacity</label>
                <div className={styles.driveControls}>
                  <input
                    aria-describedby={sizeError ? `${drive.id}-error` : undefined}
                    aria-invalid={sizeError ? true : undefined}
                    id={`${drive.id}-size`}
                    inputMode="decimal"
                    onChange={(event) => {
                      const size = event.currentTarget.value;
                      handleChange((current) => ({
                        ...current,
                        drives: current.drives.map((item, itemIndex) => itemIndex === index ? { ...item, size } : item),
                      }));
                    }}
                    ref={(node) => { driveRefs.current[index] = node; }}
                    value={drive.size}
                  />
                  <label className={styles.visuallyHidden} htmlFor={`${drive.id}-unit`}>Drive {index + 1} unit</label>
                  <select
                    aria-describedby={unitError ? `${drive.id}-error` : undefined}
                    aria-invalid={unitError ? true : undefined}
                    id={`${drive.id}-unit`}
                    onChange={(event) => {
                      const unit = event.currentTarget.value as AdvisorInputUnit;
                      handleChange((current) => ({
                        ...current,
                        drives: current.drives.map((item, itemIndex) => itemIndex === index ? { ...item, unit } : item),
                      }));
                    }}
                    value={drive.unit}
                  >
                    {advisorInputUnits.map((unit) => <option key={unit}>{unit}</option>)}
                  </select>
                  <button className={styles.removeButton} disabled={state.drives.length <= 1} onClick={() => removeDrive(index)} type="button">Remove</button>
                </div>
                {sizeError || unitError ? <p className={styles.fieldError} id={`${drive.id}-error`}>{sizeError || unitError}</p> : null}
              </div>
            );
          })}
        </div>
        <button className={styles.secondaryButton} disabled={state.drives.length >= 64} onClick={addDrive} type="button">Add drive</button>
      </div>

      <div className={styles.formSection}>
        <fieldset>
          <legend>Platform</legend>
          <div className={styles.choiceRow}>
            {advisorPlatforms.map((platform) => (
              <label className={styles.choice} key={platform}>
                <input checked={state.platform === platform} name="platform" onChange={() => handleChange((current) => ({ ...current, platform }))} type="radio" />
                <span>{platformLabels[platform]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Workload</legend>
          <div className={styles.choiceRow}>
            {advisorWorkloads.map((workload) => (
              <label className={styles.choice} key={workload}>
                <input checked={state.workload === workload} name="workload" onChange={() => handleChange((current) => ({ ...current, workload }))} type="radio" />
                <span>{workloadLabels[workload]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className={styles.targetRow}>
          <label htmlFor="protected-failures">Protected failures</label>
          <select
            id="protected-failures"
            onChange={(event) => {
              const protectedFailures = Number(event.currentTarget.value) as AdvisorProtectionTarget;
              handleChange((current) => ({ ...current, protectedFailures }));
            }}
            value={state.protectedFailures}
          >
            {[0, 1, 2, 3].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryButton} type="submit">Compare layouts</button>
        <button className={styles.secondaryButton} onClick={resetLayout} type="button">Reset layout</button>
      </div>

      <div aria-live="polite" className={styles.status} role="status">{statusMessage}</div>

      {showNoEligible ? (
        <section className={styles.noResult} aria-labelledby="no-layout-title">
          <h2 id="no-layout-title" ref={noEligibleRef} tabIndex={-1}>No eligible layout</h2>
          <p>Add drives or lower target.</p>
        </section>
      ) : null}
      {showResult && calculation.values ? (
        <Result
          headingRef={resultHeadingRef}
          onDisplayUnitChange={(displayUnit) => handleChange((current) => ({ ...current, displayUnit }), true)}
          values={calculation.values}
        />
      ) : null}

      {showResult ? (
        <div className={styles.shareRow}>
          <button className={styles.secondaryButton} onClick={shareLayout} type="button">Share layout</button>
          {sharedUrl ? <input aria-label="Shared URL" className={styles.sharedUrl} readOnly value={sharedUrl} /> : null}
        </div>
      ) : null}
    </form>
  );
}
