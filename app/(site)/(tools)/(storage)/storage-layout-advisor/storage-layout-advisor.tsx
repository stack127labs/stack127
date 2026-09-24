"use client";

import { useEffect, useRef, useState } from "react";
import { UiButton, UiChoiceGroup, UiQuantityInput, UiRepeatableList, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import { formatBytes } from "../../../../../lib/storage/index.ts";
import {
  MAX_ADVISOR_DRIVES,
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
const inputUnitOptions = advisorInputUnits.map((unit) => uiOption(unit, unit));
const platformOptions = advisorPlatforms.map((platform) => uiOption(platform, platformLabels[platform]));
const workloadOptions = advisorWorkloads.map((workload) => uiOption(workload, workloadLabels[workload]));
const protectionOptions = [0, 1, 2, 3].map((count) => uiOption(String(count), String(count)));
const displayUnitOptions = advisorDisplayUnits.map((unit) => uiOption(unit, unit));

function parseInitialState(encoded: string) {
  if (!encoded) return { state: DEFAULT_STATE, submitted: false, message: "" };
  try {
    return { state: decodeStorageLayoutAdvisorState(encoded), submitted: true, message: "Layout restored." };
  } catch {
    return { state: DEFAULT_STATE, submitted: false, message: "Shared layout could not load." };
  }
}

function fieldIssue(values: ReturnType<typeof calculateStorageLayoutAdvisor>["issues"], path: string) {
  return values.find((item) => item.path === path)?.message ?? "";
}

function displayBytes(value: bigint, unit: AdvisorDisplayUnit) {
  return formatBytes(value, unit, { maximumFractionDigits: 2 });
}

function Result({ values, sharedUrl, status, onShare }: {
  values: StorageLayoutAdvisorValues;
  sharedUrl: string;
  status: string;
  onShare: () => void;
}) {
  const best = values.bestCandidate;
  const alternatives = values.eligibleCandidates.filter((candidate) => candidate.id !== best.id);
  const failureLabel = `${best.guaranteedTolerance} protected failure${best.guaranteedTolerance === 1 ? "" : "s"}`;
  return (
    <section aria-live="polite" className={styles.result} data-testid="layout-result">
      <h2 className={styles.resultHeading} id="best-fit-title" tabIndex={-1}>Layout recommendation</h2>
      <UiPrimaryResult
        detail={`${displayBytes(best.usableBytes, values.displayUnit)} usable · ${failureLabel} · ${best.efficiencyBasisPoints / 100}% efficient · ${best.fitReason}`}
        label="Best fit"
        value={best.label}
      />

      <section className={styles.resultSection} data-testid="capacity-accounting">
        <h2>Capacity allocation</h2>
        <UiAllocationBar
          ariaLabel="Capacity allocation"
          formatValue={(value) => displayBytes(value as bigint, values.displayUnit)}
          palette="categorical"
          segments={[
            { id: "usable", label: "Usable", tone: "chartreuse", value: best.usableBytes },
            { id: "redundancy", label: "Redundancy", tone: "cyan", value: best.redundancyBytes },
            { id: "mismatch", label: "Mismatch", tone: "yellow", value: best.mismatchBytes },
          ]}
          total={best.rawBytes}
        />
      </section>

      <section className={styles.resultSection} data-testid="layout-comparison">
        <div className={styles.sectionHeading}>
          <h2>Eligible alternatives</h2>
          <span>{alternatives.length}</span>
        </div>
        {alternatives.length ? (
          <UiDataTable
            ariaLabel="Eligible layout alternatives"
            columns={[
              { id: "layout", label: "Layout" },
              { id: "usable", label: "Usable" },
              { id: "redundancy", label: "Redundancy" },
              { id: "mismatch", label: "Mismatch" },
              { id: "tolerance", label: "Tolerance" },
              { id: "fit", label: "Fit" },
            ]}
            rows={alternatives.map((candidate) => ({
              id: candidate.id,
              cells: {
                layout: candidate.label,
                usable: displayBytes(candidate.usableBytes, values.displayUnit),
                redundancy: displayBytes(candidate.redundancyBytes, values.displayUnit),
                mismatch: displayBytes(candidate.mismatchBytes, values.displayUnit),
                tolerance: candidate.guaranteedTolerance,
                fit: candidate.fitReason,
              },
            }))}
          />
        ) : <p className={styles.emptyAlternatives}>No other layout meets the selected goals.</p>}
      </section>

      <section className={styles.resultSection} data-testid="layout-topology">
        <div className={styles.sectionHeading}>
          <h2>Top-fit topology</h2>
          <span>{best.toleranceStatement}</span>
        </div>
        <div className={styles.topology} role="img" aria-label={`${best.label} topology`}>
          {best.groups.map((group) => (
            <section className={styles.topologyGroup} key={group.id}>
              <header>
                <strong>{group.label}</strong>
                <span>{displayBytes(group.commonBytes, values.displayUnit)} common</span>
              </header>
              <div className={styles.topologyDrives}>
                {group.driveIds.map((driveId) => <span key={driveId}>{driveId.replace("drive-", "Drive ")}</span>)}
              </div>
            </section>
          ))}
        </div>
      </section>

      <UiActionRow>
        <UiButton onPress={onShare}>Share layout</UiButton>
      </UiActionRow>
      {sharedUrl ? <UiTextField label="Shared URL" readOnly value={sharedUrl} /> : null}
      {status ? <UiStatus>{status}</UiStatus> : null}
      <p className={styles.boundary}>Theoretical capacity. Verify the platform layout, grouping, and expansion rules.</p>
    </section>
  );
}

export function StorageLayoutAdvisor({ initialState }: { initialState: string }) {
  const [initial] = useState(() => parseInitialState(initialState));
  const [state, setState] = useState<UiState>(initial.state);
  const [submitted, setSubmitted] = useState(initial.submitted);
  const [statusMessage, setStatusMessage] = useState(initial.message);
  const [sharedUrl, setSharedUrl] = useState("");
  const pendingFocus = useRef<string | null>(null);
  const focusResult = useRef(false);

  const calculation = calculateStorageLayoutAdvisor(state);
  const invalidIssues = calculation.status === "invalid" ? calculation.issues : [];
  const noEligible = invalidIssues.some((item) => item.code === "no_eligible_layout");
  const showResult = submitted && calculation.status === "valid";
  const showNoEligible = submitted && noEligible;

  useEffect(() => {
    if (initialState && initial.message.includes("could not")) window.history.replaceState(null, "", window.location.pathname);
  }, [initial.message, initialState]);

  useEffect(() => {
    if (pendingFocus.current) {
      document.querySelector<HTMLElement>(`[data-focus-key="${pendingFocus.current}"]`)?.focus();
      pendingFocus.current = null;
    }
    if (focusResult.current && showResult) {
      document.getElementById("best-fit-title")?.focus({ preventScroll: true });
      focusResult.current = false;
    }
  }, [state, submitted, showResult]);

  function handleChange(change: (current: UiState) => UiState) {
    setState(change);
    setSubmitted(false);
    setSharedUrl("");
    setStatusMessage("");
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  }

  function addDrive() {
    if (state.drives.length >= MAX_ADVISOR_DRIVES) return;
    const nextNumber = state.drives.reduce((max, drive) => Math.max(max, Number(/^drive-(\d+)$/.exec(drive.id)?.[1] ?? 0)), 0) + 1;
    handleChange((current) => ({
      ...current,
      drives: [...current.drives, { id: `drive-${nextNumber}`, size: "4", unit: "TB" }],
    }));
  }

  function updateDrive(id: string, patch: Partial<StorageLayoutAdvisorDriveInput>) {
    handleChange((current) => ({
      ...current,
      drives: current.drives.map((drive) => drive.id === id ? { ...drive, ...patch } : drive),
    }));
  }

  function removeDrive(id: string) {
    handleChange((current) => ({ ...current, drives: current.drives.filter((drive) => drive.id !== id) }));
  }

  function compare() {
    setSubmitted(true);
    setSharedUrl("");
    if (calculation.status === "invalid") {
      if (noEligible) {
        setStatusMessage("No eligible layout.");
        window.setTimeout(() => document.getElementById("no-layout-title")?.focus(), 0);
        return;
      }
      const firstDriveIssue = invalidIssues.find((item) => item.path?.startsWith("drives["));
      const match = firstDriveIssue?.path?.match(/^drives\[(\d+)\]\.(size|unit)$/);
      if (match) {
        pendingFocus.current = `drive-${Number(match[1]) + 1}-capacity`;
        window.setTimeout(() => {
          if (!pendingFocus.current) return;
          document.querySelector<HTMLElement>(`[data-focus-key="${pendingFocus.current}"]`)?.focus();
          pendingFocus.current = null;
        }, 0);
      }
      setSubmitted(false);
      setStatusMessage("Check the marked inputs.");
      return;
    }
    setStatusMessage("");
    focusResult.current = true;
  }

  async function shareLayout() {
    if (calculation.status !== "valid") return;
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("state", encodeStorageLayoutAdvisorState(state));
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      setSharedUrl(url.toString());
      try {
        await navigator.clipboard.writeText(url.toString());
        setStatusMessage("Shared URL copied.");
      } catch {
        setStatusMessage("Shared URL ready.");
      }
    } catch {
      setStatusMessage("Share failed.");
    }
  }

  function resetLayout() {
    window.history.replaceState(null, "", window.location.pathname);
    setState(DEFAULT_STATE);
    setSubmitted(false);
    setSharedUrl("");
    setStatusMessage("Layout reset.");
    window.setTimeout(() => document.querySelector<HTMLElement>("section[aria-label='Drive inventory'] input")?.focus(), 0);
  }

  return (
    <div className={styles.tool} data-tool-workbench>
      <form aria-label="Storage layout advisor" className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); compare(); }}>
        <section className={styles.inventorySection}>
          <div className={styles.sectionHeading}>
            <h2>Drives</h2>
            <span>{state.drives.length} / {MAX_ADVISOR_DRIVES}</span>
          </div>
          <UiRepeatableList
            addDisabled={state.drives.length >= MAX_ADVISOR_DRIVES}
            addLabel="Add drive"
            ariaLabel="Drive inventory"
            items={[...state.drives]}
            onAdd={addDrive}
            onRemove={removeDrive}
            removeLabel={(_, index) => `Remove drive ${index + 1}`}
            renderItem={(drive, index) => {
              const sizeError = fieldIssue(invalidIssues, `drives[${index}].size`);
              const unitError = fieldIssue(invalidIssues, `drives[${index}].unit`);
              return (
                <div className={styles.driveEditor}>
                  <span aria-hidden="true" className={styles.driveNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <UiQuantityInput
                    ariaLabel={`Drive ${index + 1} capacity`}
                    dataFocusKey={`drive-${index + 1}-capacity`}
                    error={sizeError || unitError}
                    hideLabel
                    label={`Drive ${index + 1} capacity`}
                    onChange={(size) => updateDrive(drive.id, { size })}
                    onUnitChange={(unit) => updateDrive(drive.id, { unit: unit as AdvisorInputUnit })}
                    required
                    unit={drive.unit}
                    unitAriaLabel={`Drive ${index + 1} unit`}
                    units={inputUnitOptions}
                    value={drive.size}
                  />
                </div>
              );
            }}
          />
        </section>

        <div className={styles.goalGrid}>
          <UiChoiceGroup label="Platform" onChange={(platform) => handleChange((current) => ({ ...current, platform: platform as AdvisorPlatform }))} options={platformOptions} required value={state.platform} />
          <UiChoiceGroup label="Workload" onChange={(workload) => handleChange((current) => ({ ...current, workload: workload as AdvisorWorkload }))} options={workloadOptions} required value={state.workload} />
          <UiChoiceGroup label="Protected failures" onChange={(count) => handleChange((current) => ({ ...current, protectedFailures: Number(count) as AdvisorProtectionTarget }))} options={protectionOptions} required value={String(state.protectedFailures)} />
          <UiChoiceGroup label="Display unit" onChange={(unit) => handleChange((current) => ({ ...current, displayUnit: unit as AdvisorDisplayUnit }))} options={displayUnitOptions} required value={state.displayUnit} />
        </div>

        <UiActionRow>
          <UiButton type="submit" variant="primary">Compare layouts</UiButton>
          <UiButton onPress={resetLayout}>Reset</UiButton>
        </UiActionRow>
        {statusMessage && !showResult ? <UiStatus tone={showNoEligible || calculation.status === "invalid" ? "danger" : "neutral"}>{statusMessage}</UiStatus> : null}
      </form>

      {showNoEligible ? (
        <section className={styles.noEligible}>
          <h2 id="no-layout-title" tabIndex={-1}>No eligible layout</h2>
          <p>Add drives or lower the protected-failure target.</p>
        </section>
      ) : null}
      {showResult && calculation.values ? <Result onShare={shareLayout} sharedUrl={sharedUrl} status={statusMessage} values={calculation.values} /> : null}
    </div>
  );
}
