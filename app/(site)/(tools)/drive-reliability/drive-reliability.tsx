"use client";

import { RotateCcw, Share2 } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolCheckbox,
  ToolChoiceGroup,
  ToolDataTable,
  ToolDisclosure,
  ToolNumberField,
  ToolPrimaryResult,
  ToolResultLead,
  ToolSearchField,
  ToolSelect,
  ToolStatus,
} from "@/app/tool-ui/tool-controls";
import {
  DEFAULT_DRIVE_RELIABILITY_INPUT,
  DRIVE_RELIABILITY_INTERVAL_VERSION,
  encodeDriveReliabilityState,
  normalizeDriveReliabilityInput,
  normalizeModel,
  parseDriveReliabilityState,
  resolveDriveReliability,
  type DriveReliabilityInput,
  type DriveReliabilityPeriod,
  type DriveReliabilitySnapshot,
  type ResolvedDriveReliabilityRow,
} from "@/lib/drive-reliability";
import styles from "./drive-reliability.module.css";

type Props = Readonly<{
  initialState: string;
  snapshot: DriveReliabilitySnapshot;
}>;

type CapacityErrors = Readonly<{
  group: string | null;
  maximum: string | null;
  minimum: string | null;
}>;

const BACKBLAZE_DATASET_URL = "https://www.backblaze.com/cloud-storage/resources/hard-drive-test-data";
const BACKBLAZE_REPORT_URL = "https://www.backblaze.com/blog/backblaze-drive-stats-for-q1-2026/";
const numberFormat = new Intl.NumberFormat("en-US");
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function formatNumber(value: number | null) {
  return value === null ? "Not reported" : numberFormat.format(value);
}

function formatCapacity(value: number | null) {
  return value === null ? "Not reported" : `${value} TB`;
}

function formatAge(value: number | null) {
  return value === null ? "Not reported" : `${value} months`;
}

function formatDate(value: string) {
  return dateFormat.format(new Date(`${value}T00:00:00Z`));
}

function formatPeriodDates(period: DriveReliabilityPeriod) {
  if (period.start === null) return `Through ${formatDate(period.end)}`;
  return `${formatDate(period.start)} to ${formatDate(period.end)}`;
}

function safeBackblazeUrl(value: string, fallback: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "backblaze.com" || url.hostname.endsWith(".backblaze.com"))
      ? url.href
      : fallback;
  } catch {
    return fallback;
  }
}

function sameIds(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validateCapacity(minimum: number, maximum: number): CapacityErrors {
  const hasMinimum = Number.isFinite(minimum);
  const hasMaximum = Number.isFinite(maximum);
  const minimumError = hasMinimum && (minimum < 1 || minimum > 100)
    ? "Minimum capacity must be between 1 and 100 TB."
    : null;
  const maximumError = hasMaximum && (maximum < 1 || maximum > 100)
    ? "Maximum capacity must be between 1 and 100 TB."
    : null;
  const group = !minimumError && !maximumError && hasMinimum && hasMaximum && minimum > maximum
    ? "Minimum capacity must not exceed maximum capacity."
    : null;
  return { group, maximum: maximumError, minimum: minimumError };
}

function locatorOrder(left: ResolvedDriveReliabilityRow, right: ResolvedDriveReliabilityRow) {
  if (left.cohortType !== right.cohortType) return left.cohortType === "fleet" ? -1 : 1;
  return left.manufacturer.localeCompare(right.manufacturer) || left.model.localeCompare(right.model);
}

function chartStyle(row: ResolvedDriveReliabilityRow, maximum: number): CSSProperties {
  const low = Math.max(0, Math.min(maximum, row.evidenceRange.lowPercent));
  const high = Math.max(low, Math.min(maximum, row.evidenceRange.highPercent));
  const point = Math.max(0, Math.min(maximum, row.afrPercent));
  return {
    "--range-left": `${(low / maximum) * 100}%`,
    "--range-width": `${((high - low) / maximum) * 100}%`,
    "--point-left": `${(point / maximum) * 100}%`,
  } as CSSProperties;
}

function rangeMaximum(rows: readonly ResolvedDriveReliabilityRow[]) {
  const largest = Math.max(0.25, ...rows.map((row) => row.evidenceRange.highPercent));
  return Math.ceil(largest * 4) / 4;
}

function filterSummary(input: DriveReliabilityInput, minimum: number, maximum: number) {
  const parts: string[] = [];
  if (input.manufacturer) parts.push(input.manufacturer);
  if (Number.isFinite(minimum) || Number.isFinite(maximum)) parts.push(`${Number.isFinite(minimum) ? minimum : 1} to ${Number.isFinite(maximum) ? maximum : 100} TB`);
  if (input.showSmallCohorts) parts.push("below threshold shown");
  return parts.length > 0 ? `Filter model list, ${parts.join(", ")}` : "Filter model list";
}

function ShareAction({ input, onNotice }: { input: DriveReliabilityInput; onNotice: (message: string, link?: string) => void }) {
  async function share() {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("state", encodeDriveReliabilityState(input));
    try {
      await navigator.clipboard.writeText(url.href);
      onNotice("Share link copied.");
    } catch {
      onNotice("Copy unavailable. Copy this link:", url.href);
    }
  }

  return (
    <ToolButton onPress={share} variant="secondary">
      <Share2 aria-hidden="true" size={17} />
      Share selection
    </ToolButton>
  );
}

export function DriveReliabilityExplorer({ initialState, snapshot }: Props) {
  const restored = useMemo(() => parseDriveReliabilityState(initialState), [initialState]);
  const [input, setInput] = useState<DriveReliabilityInput>(restored.input);
  const [minimumCapacity, setMinimumCapacity] = useState(restored.input.minCapacityTb ?? Number.NaN);
  const [maximumCapacity, setMaximumCapacity] = useState(restored.input.maxCapacityTb ?? Number.NaN);
  const [notice, setNotice] = useState(restored.warnings.join(" "));
  const [manualShareLink, setManualShareLink] = useState("");
  const [validationAttempted, setValidationAttempted] = useState(false);
  const minimumRef = useRef<HTMLInputElement>(null);
  const maximumRef = useRef<HTMLInputElement>(null);

  const resolution = useMemo(() => resolveDriveReliability(snapshot, input), [input, snapshot]);
  const capacityErrors = validateCapacity(minimumCapacity, maximumCapacity);
  const hasCapacityError = Boolean(capacityErrors.group || capacityErrors.maximum || capacityErrors.minimum);
  const visibleCapacityErrors = validationAttempted ? capacityErrors : { group: null, maximum: null, minimum: null };
  const activePeriod = resolution.period ?? snapshot.periods.find((period) => period.id === input.periodId) ?? snapshot.periods[0];
  const locatorRows = useMemo(() => [...resolution.rows].sort(locatorOrder), [resolution.rows]);
  const selectedRows = resolution.selected;
  const maximumPlotValue = rangeMaximum(selectedRows);
  const datasetUrl = safeBackblazeUrl(snapshot.sourceUrl, BACKBLAZE_DATASET_URL);
  const reportUrl = safeBackblazeUrl(snapshot.sourceReportUrl, BACKBLAZE_REPORT_URL);

  const manufacturers = useMemo(() => {
    const values = new Set(
      snapshot.rows
        .filter((row) => row.periodId === input.periodId && row.cohortType === "model")
        .map((row) => row.manufacturer),
    );
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [input.periodId, snapshot.rows]);

  const hasBelowThresholdRows = useMemo(() => {
    const period = snapshot.periods.find((item) => item.id === input.periodId);
    if (!period) return false;
    return snapshot.rows.some((row) => row.periodId === period.id
      && row.cohortType === "model"
      && (!row.includedBySource
        || row.driveCount === null
        || row.driveCount <= period.driveCountMinimum
        || row.driveDays <= period.driveDaysMinimum));
  }, [input.periodId, snapshot.periods, snapshot.rows]);

  useEffect(() => {
    const visible = new Set(resolution.rows.map((row) => row.id));
    const nextSelected = input.selectedModelIds.filter((id) => visible.has(id)).slice(0, 3);
    if (sameIds(nextSelected, input.selectedModelIds)) return;
    setInput((current) => ({ ...current, selectedModelIds: nextSelected }));
    if (initialState && input.selectedModelIds.some((id) => !visible.has(id))) {
      setNotice("Some shared selections were not available in this snapshot.");
    }
  }, [initialState, input.selectedModelIds, resolution.rows]);

  useEffect(() => {
    if (!initialState || !restored.warnings.some((warning) => warning.startsWith("Share state"))) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("state");
    window.history.replaceState(window.history.state, "", url);
  }, [initialState, restored.warnings]);

  function updateInput(patch: Partial<DriveReliabilityInput>, message = "") {
    setInput((current) => normalizeDriveReliabilityInput({ ...current, ...patch }));
    setNotice(message);
    setManualShareLink("");
  }

  function changeMinimum(value: number) {
    const next = Number.isFinite(value) ? value : Number.NaN;
    setMinimumCapacity(next);
    updateInput({ minCapacityTb: Number.isFinite(next) && next >= 1 && next <= 100 ? next : null });
    setValidationAttempted(false);
  }

  function changeMaximum(value: number) {
    const next = Number.isFinite(value) ? value : Number.NaN;
    setMaximumCapacity(next);
    updateInput({ maxCapacityTb: Number.isFinite(next) && next >= 1 && next <= 100 ? next : null });
    setValidationAttempted(false);
  }

  function focusFirstCapacityError() {
    window.requestAnimationFrame(() => {
      if (capacityErrors.minimum || capacityErrors.group) minimumRef.current?.focus();
      else maximumRef.current?.focus();
    });
  }

  function attemptValidation() {
    if (!hasCapacityError) return false;
    setValidationAttempted(true);
    focusFirstCapacityError();
    return true;
  }

  function toggleSelected(row: ResolvedDriveReliabilityRow) {
    if (attemptValidation()) return;
    if (input.selectedModelIds.includes(row.id)) {
      updateInput({ selectedModelIds: input.selectedModelIds.filter((value) => value !== row.id) });
      return;
    }
    if (input.selectedModelIds.length >= 3) {
      setNotice("Select up to three cohorts.");
      return;
    }
    updateInput({ selectedModelIds: [...input.selectedModelIds, row.id] });
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement)) return;
    event.preventDefault();
    if (attemptValidation()) return;
    const exact = locatorRows.filter((row) => row.cohortType === "model" && normalizeModel(row.model) === normalizeModel(input.search));
    if (exact.length === 1) toggleSelected(exact[0]);
    else setNotice(`${locatorRows.length} matching ${locatorRows.length === 1 ? "cohort" : "cohorts"}.`);
  }

  function handleCapacityKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement)) return;
    event.preventDefault();
    attemptValidation();
  }

  function reset() {
    setInput(DEFAULT_DRIVE_RELIABILITY_INPUT);
    setMinimumCapacity(Number.NaN);
    setMaximumCapacity(Number.NaN);
    setValidationAttempted(false);
    setManualShareLink("");
    setNotice("Explorer reset.");
    const url = new URL(window.location.href);
    url.searchParams.delete("state");
    window.history.replaceState(window.history.state, "", url);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[role="radiogroup"] [role="radio"]')?.focus();
    });
  }

  function setShareNotice(message: string, link = "") {
    setNotice(message);
    setManualShareLink(link);
  }

  const selectionWarning = selectedRows.find((row) => row.evidenceLabel === "Below source threshold")
    ?? selectedRows.find((row) => row.evidenceLabel === "Thin cohort");
  const selectedAfrs = selectedRows.map((row) => row.afrPercent);
  const displayedSpan = selectedRows.length > 1
    ? `${Math.min(...selectedAfrs).toFixed(2)}% to ${Math.max(...selectedAfrs).toFixed(2)}%`
    : "";

  const evidenceRows = selectedRows.map((row) => ({
    id: row.id,
    cells: {
      action: (
        <ToolButton aria-label={`Remove ${row.model}`} onPress={() => toggleSelected(row)} variant="ghost">
          Remove
        </ToolButton>
      ),
      age: formatAge(row.averageAgeMonths),
      afr: row.displayAfrPercent,
      capacity: formatCapacity(row.capacityTb),
      drives: formatNumber(row.driveCount),
      evidence: row.evidenceLabel,
      failures: formatNumber(row.failures),
      manufacturer: row.manufacturer,
      model: row.model,
      range: row.displayEvidenceRange,
      days: formatNumber(row.driveDays),
    },
  }));

  return (
    <section className={styles.tool} data-tool-workbench aria-labelledby="drive-reliability-tool-title">
      <div className={styles.form}>
        <div className={styles.toolHeading}>
          <h2 id="drive-reliability-tool-title">Explore Backblaze evidence</h2>
          {resolution.status !== "invalid" ? (
            <ToolButton onPress={reset} variant="ghost">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </ToolButton>
          ) : null}
        </div>

        <ToolChoiceGroup
          label="Period"
          onChange={(periodId) => updateInput({ periodId, selectedModelIds: [] }, "Period changed. Select a cohort.")}
          options={snapshot.periods.map((period) => ({ id: period.id, label: period.label }))}
          value={input.periodId}
        />

        <div onKeyDown={handleSearchKeyDown}>
          <ToolSearchField
            label="Model or manufacturer"
            onChange={(search) => updateInput({ search })}
            placeholder="WUH722222ALE6L4"
            value={input.search}
          />
        </div>

        <ToolDisclosure label={filterSummary(input, minimumCapacity, maximumCapacity)}>
          <div className={styles.filterGrid} data-advanced-filters>
            <div>
              <ToolSelect
                label="Manufacturer"
                onChange={(manufacturer) => updateInput({ manufacturer })}
                options={[
                  { id: "", label: "All manufacturers" },
                  ...manufacturers.map((manufacturer) => ({ id: manufacturer, label: manufacturer })),
                ]}
                value={input.manufacturer}
              />
            </div>
            <div className={styles.capacityGroup} data-capacity-fields>
              <ToolNumberField
                ariaLabel="Minimum capacity"
                error={visibleCapacityErrors.minimum}
                inputRef={minimumRef}
                label="Minimum capacity"
                max={100}
                min={1}
                onChange={changeMinimum}
                onKeyDown={handleCapacityKeyDown}
                step={1}
                suffix="TB"
                value={minimumCapacity}
              />
              <ToolNumberField
                ariaLabel="Maximum capacity"
                error={visibleCapacityErrors.maximum}
                inputRef={maximumRef}
                label="Maximum capacity"
                max={100}
                min={1}
                onChange={changeMaximum}
                onKeyDown={handleCapacityKeyDown}
                step={1}
                suffix="TB"
                value={maximumCapacity}
              />
              {visibleCapacityErrors.group ? (
                <p className={styles.capacityError} role="alert">{visibleCapacityErrors.group}</p>
              ) : null}
            </div>
            {hasBelowThresholdRows ? (
              <ToolCheckbox
                isSelected={input.showSmallCohorts}
                onChange={(showSmallCohorts) => updateInput({ showSmallCohorts })}
              >
                Show cohorts below the Backblaze source threshold
              </ToolCheckbox>
            ) : null}
          </div>
        </ToolDisclosure>

        {notice ? <ToolStatus tone={notice.startsWith("Select up") ? "warning" : "neutral"}>{notice}</ToolStatus> : null}
        {manualShareLink ? <input aria-label="Share link" className={styles.manualLink} readOnly value={manualShareLink} /> : null}
      </div>

      <div className={styles.result} data-drive-reliability-result>
        {resolution.status === "invalid" ? (
          <div className={styles.failureState}>
            <ToolStatus tone="danger">Drive data is unavailable.</ToolStatus>
            <p>Check the Backblaze sources for the current data.</p>
            <ToolActionRow>
              <a href={datasetUrl} rel="noreferrer" target="_blank">Dataset</a>
              <a href={reportUrl} rel="noreferrer" target="_blank">Source report</a>
            </ToolActionRow>
          </div>
        ) : hasCapacityError && validationAttempted ? null : (
          <>
            <section className={styles.locator} aria-labelledby="drive-reliability-cohorts-title">
              <div className={styles.sectionHeading}>
                <h3 id="drive-reliability-cohorts-title">Available cohorts</h3>
                <p>{locatorRows.length} matching, {selectedRows.length} selected</p>
              </div>

              {resolution.status === "no-data" ? (
                <div className={styles.emptyState}>
                  <p>{input.periodId === "annual-2025" && input.search.trim()
                    ? "Annual 2025 has a fleet summary but no matching model rows in this snapshot."
                    : "No cohorts match these filters."}</p>
                  <ToolButton onPress={reset} variant="secondary">Reset filters</ToolButton>
                </div>
              ) : (
                <div className={styles.locatorViewport}>
                  <table aria-label="Available drive cohorts" className={styles.locatorTable}>
                    <thead>
                      <tr>
                        <th scope="col">Model</th>
                        <th scope="col">Manufacturer</th>
                        <th scope="col">Capacity</th>
                        <th scope="col">Evidence</th>
                        <th scope="col"><span className={styles.visuallyHidden}>Action</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {locatorRows.map((row) => {
                        const selected = input.selectedModelIds.includes(row.id);
                        return (
                          <tr data-selected={selected || undefined} key={row.id}>
                            <th data-label="Model" scope="row">{row.model}</th>
                            <td data-label="Manufacturer">{row.manufacturer}</td>
                            <td data-label="Capacity">{formatCapacity(row.capacityTb)}</td>
                            <td data-label="Evidence">{row.evidenceLabel}</td>
                            <td data-label="Action">
                              <ToolButton
                                aria-label={`${selected ? "Remove" : "Select"} ${row.model}`}
                                aria-pressed={selected}
                                onPress={() => toggleSelected(row)}
                                variant="secondary"
                              >
                                {selected ? "Remove" : "Select"}
                              </ToolButton>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className={styles.answerRegion}>
              {selectedRows.length === 0 ? (
                <p className={styles.selectionPrompt}>Select one to three cohorts to inspect their observed result.</p>
              ) : (
                <>
                  {selectedRows.length === 1 ? (
                    <ToolPrimaryResult
                      detail={<>{selectedRows[0].model} in {selectedRows[0].period.label}. Approximate 95% evidence range {selectedRows[0].displayEvidenceRange}.</>}
                      label="Observed AFR"
                      value={selectedRows[0].displayAfrPercent}
                    />
                  ) : (
                    <ToolResultLead>
                      The selected {activePeriod.label} cohorts span {displayedSpan} observed AFR.
                    </ToolResultLead>
                  )}

                  {selectionWarning ? (
                    <p className={styles.warning} role="note">
                      {selectionWarning.evidenceLabel === "Below source threshold" ? (
                        <><strong>Below source threshold.</strong> This cohort does not meet the active minimum of more than {numberFormat.format(activePeriod.driveCountMinimum)} drives and more than {numberFormat.format(activePeriod.driveDaysMinimum)} drive days.</>
                      ) : (
                        <><strong>Limited evidence.</strong> One failure can move the observed rate sharply for {selectionWarning.model}.</>
                      )}
                    </p>
                  ) : null}

                  <figure aria-labelledby="drive-reliability-plot-title" className={styles.plot}>
                    <figcaption>
                      <h3 id="drive-reliability-plot-title">AFR and approximate evidence range</h3>
                    </figcaption>
                    <div aria-hidden="true" className={styles.axisLabels}>
                      <span>0%</span>
                      <span>{(maximumPlotValue / 2).toFixed(2)}%</span>
                      <span>{maximumPlotValue.toFixed(2)}%</span>
                    </div>
                    <div className={styles.plotRows}>
                      {selectedRows.map((row) => (
                        <div
                          aria-label={`${row.model}: AFR ${row.displayAfrPercent}, approximate 95% evidence range ${row.displayEvidenceRange}`}
                          className={styles.plotRow}
                          data-chart-model-id={row.id}
                          key={row.id}
                        >
                          <div className={styles.plotCopy}>
                            <strong>{row.model}</strong>
                            <span>AFR {row.displayAfrPercent}, range {row.displayEvidenceRange}</span>
                          </div>
                          <div aria-hidden="true" className={styles.plotTrack} style={chartStyle(row, maximumPlotValue)}>
                            <span className={styles.plotRange} />
                            <span className={styles.plotPoint} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </figure>

                  <section className={styles.evidence} aria-labelledby="drive-reliability-evidence-title">
                    <h3 id="drive-reliability-evidence-title">Selected cohort evidence</h3>
                    <p className={styles.scrollHint}>Scroll for all evidence</p>
                    <div className={styles.evidenceViewport} data-evidence-scroll>
                      <ToolDataTable
                        ariaLabel="Selected drive cohort evidence"
                        columns={[
                          { id: "model", label: "Model" },
                          { id: "manufacturer", label: "Maker" },
                          { id: "capacity", label: "Capacity" },
                          { id: "afr", label: "AFR" },
                          { id: "range", label: "Approx. range" },
                          { id: "days", label: "Drive days" },
                          { id: "failures", label: "Failures" },
                          { id: "drives", label: "Drives" },
                          { id: "age", label: "Age" },
                          { id: "evidence", label: "Evidence" },
                          { id: "action", label: "Action" },
                        ]}
                        rows={evidenceRows}
                      />
                    </div>
                  </section>

                  <section className={styles.source} aria-labelledby="drive-reliability-source-title">
                    <h3 id="drive-reliability-source-title">Source and method</h3>
                    <dl>
                      <div><dt>Source</dt><dd>{snapshot.sourceName}</dd></div>
                      <div><dt>Period</dt><dd>{activePeriod.label}, {formatPeriodDates(activePeriod)}</dd></div>
                      <div><dt>Inclusion rule</dt><dd>More than {numberFormat.format(activePeriod.driveCountMinimum)} drives and more than {numberFormat.format(activePeriod.driveDaysMinimum)} drive days</dd></div>
                      <div><dt>Snapshot</dt><dd>{snapshot.datasetVersion}</dd></div>
                      <div><dt>Range method</dt><dd>{DRIVE_RELIABILITY_INTERVAL_VERSION}</dd></div>
                      <div><dt>Checked</dt><dd>{formatDate(snapshot.sourceCheckedAt)}</dd></div>
                    </dl>
                    <ToolActionRow>
                      <a href={datasetUrl} rel="noreferrer" target="_blank">Dataset</a>
                      <a href={reportUrl} rel="noreferrer" target="_blank">Source report</a>
                      <ShareAction input={input} onNotice={setShareNotice} />
                    </ToolActionRow>
                  </section>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
