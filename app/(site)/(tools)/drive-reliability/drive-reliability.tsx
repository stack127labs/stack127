"use client";

import { Copy, RotateCcw, Share2 } from "lucide-react";
import type { CSSProperties, ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_DRIVE_RELIABILITY_INPUT,
  encodeDriveReliabilityState,
  normalizeDriveReliabilityInput,
  parseDriveReliabilityState,
  resolveDriveReliability,
  type DriveReliabilityInput,
  type DriveReliabilityRow,
  type DriveReliabilitySnapshot,
  type ResolvedDriveReliabilityRow,
} from "@/lib/drive-reliability";
import styles from "./drive-reliability.module.css";

type Props = Readonly<{
  initialState: string;
  snapshot: DriveReliabilitySnapshot;
}>;

const numberFormat = new Intl.NumberFormat("en-US");

function formatNumber(value: number | null) {
  return value === null ? "Not reported" : numberFormat.format(value);
}

function formatCapacity(value: number | null) {
  return value === null ? "Not reported" : `${value} TB`;
}

function formatAge(value: number | null) {
  return value === null ? "Not reported" : `${value} months`;
}

function modelKey(row: DriveReliabilityRow) {
  return row.id;
}

function chartStyle(row: ResolvedDriveReliabilityRow, maximum: number): CSSProperties {
  const left = Math.max(0, Math.min(100, (row.evidenceRange.lowPercent / maximum) * 100));
  const right = Math.max(left, Math.min(100, (row.evidenceRange.highPercent / maximum) * 100));
  const point = Math.max(0, Math.min(100, (row.afrPercent / maximum) * 100));
  return {
    "--range-left": `${left}%`,
    "--range-width": `${Math.max(1, right - left)}%`,
    "--point-left": `${point}%`,
  } as CSSProperties;
}

function sameIds(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function DriveReliabilityExplorer({ initialState, snapshot }: Props) {
  const restored = useMemo(() => parseDriveReliabilityState(initialState), [initialState]);
  const [input, setInput] = useState<DriveReliabilityInput>(restored.input);
  const [notice, setNotice] = useState(restored.warnings.join(" "));
  const [copied, setCopied] = useState(false);

  const resolution = useMemo(
    () => resolveDriveReliability(snapshot, input),
    [input, snapshot],
  );

  useEffect(() => {
    const visible = new Set(resolution.rows.map((row) => row.id));
    const nextSelected = input.selectedModelIds.filter((id) => visible.has(id)).slice(0, 3);
    if (sameIds(nextSelected, input.selectedModelIds)) return;
    setInput((current) => ({ ...current, selectedModelIds: nextSelected }));
  }, [input.selectedModelIds, resolution.rows]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const encoded = encodeDriveReliabilityState(input);
    if (encoded === initialState) return;
    url.searchParams.set("state", encoded);
    window.history.replaceState(window.history.state, "", url);
  }, [initialState, input]);

  const manufacturers = useMemo(() => {
    const values = new Set(
      snapshot.rows
        .filter((row) => row.periodId === input.periodId && row.cohortType === "model")
        .map((row) => row.manufacturer),
    );
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [input.periodId, snapshot.rows]);

  const hasResultIntent = input.selectedModelIds.length > 0
    || input.search.trim().length > 0
    || input.manufacturer.trim().length > 0
    || input.minCapacityTb !== null
    || input.maxCapacityTb !== null;
  const visiblePrimary = hasResultIntent ? resolution.primary : null;
  const visibleWarnings = visiblePrimary ? resolution.warnings : [];
  const chartRows = resolution.selected.length > 0
    ? resolution.selected
    : visiblePrimary
      ? [visiblePrimary]
      : [];
  const chartMaximum = Math.max(
    0.1,
    ...chartRows.map((row) => row.evidenceRange.highPercent),
  );

  function updateInput(patch: Partial<DriveReliabilityInput>) {
    setInput((current) => normalizeDriveReliabilityInput({ ...current, ...patch }));
    setNotice("");
    setCopied(false);
  }

  function onCapacityChange(key: "minCapacityTb" | "maxCapacityTb", event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.trim();
    updateInput({ [key]: value === "" ? null : Number(value) });
  }

  function toggleSelected(row: ResolvedDriveReliabilityRow) {
    const id = modelKey(row);
    if (input.selectedModelIds.includes(id)) {
      updateInput({ selectedModelIds: input.selectedModelIds.filter((value) => value !== id) });
      return;
    }
    if (input.selectedModelIds.length >= 3) {
      setNotice("Select up to three cohorts.");
      return;
    }
    updateInput({ selectedModelIds: [...input.selectedModelIds, id] });
  }

  function reset() {
    setInput(DEFAULT_DRIVE_RELIABILITY_INPUT);
    setNotice("Explorer reset.");
    setCopied(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("state");
      window.history.replaceState(window.history.state, "", url);
    }
  }

  async function copyShareLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setNotice("Share link copied.");
    } catch {
      setCopied(false);
      setNotice("Copy unavailable. Copy the address bar.");
    }
  }

  return (
    <section className={styles.tool} aria-labelledby="drive-reliability-tool-title">
      <div className={styles.form}>
        <div className={styles.toolHeading}>
          <div>
            <h2 id="drive-reliability-tool-title">Explore Backblaze evidence</h2>
            <p className={styles.annotation}>Drive days, failures, and evidence range.</p>
          </div>
          <span className={styles.version}>Snapshot {snapshot.datasetVersion}</span>
        </div>

        <fieldset className={styles.periodFieldset}>
          <legend>Period</legend>
          <div className={styles.periodChoices}>
            {snapshot.periods.map((period) => (
              <label className={styles.periodChoice} key={period.id}>
                <input
                  type="radio"
                  name="drive-reliability-period"
                  value={period.id}
                  checked={input.periodId === period.id}
                  onChange={() => updateInput({ periodId: period.id, selectedModelIds: [] })}
                />
                <span>{period.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.filterGrid}>
          <label className={`${styles.field} ${styles.searchField}`}>
            <span>Model or manufacturer</span>
            <input
              type="search"
              aria-label="Search model or manufacturer"
              value={input.search}
              maxLength={120}
              onChange={(event) => updateInput({ search: event.target.value })}
              placeholder="Search model"
            />
          </label>
          <label className={styles.field}>
            <span>Manufacturer</span>
            <select
              aria-label="Manufacturer"
              value={input.manufacturer}
              onChange={(event) => updateInput({ manufacturer: event.target.value })}
            >
              <option value="">All manufacturers</option>
              {manufacturers.map((manufacturer) => <option key={manufacturer}>{manufacturer}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>Min TB</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              aria-label="Minimum capacity TB"
              value={input.minCapacityTb ?? ""}
              onChange={(event) => onCapacityChange("minCapacityTb", event)}
            />
          </label>
          <label className={styles.field}>
            <span>Max TB</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              aria-label="Maximum capacity TB"
              value={input.maxCapacityTb ?? ""}
              onChange={(event) => onCapacityChange("maxCapacityTb", event)}
            />
          </label>
        </div>

        <div className={styles.formActions}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={input.showSmallCohorts}
              onChange={(event) => updateInput({ showSmallCohorts: event.target.checked })}
            />
            <span>Show small cohorts</span>
          </label>
          <button className={styles.secondaryButton} type="button" onClick={reset}>
            <RotateCcw aria-hidden="true" size={16} />
            Reset explorer
          </button>
        </div>
      </div>

      <div className={styles.result} data-drive-reliability-result>
        <div className={styles.resultBar}>
          <p className={styles.status} role="status" aria-live="polite">
            {notice || (resolution.status === "ready" ? `${resolution.rows.length} matching cohorts.` : "No matching cohorts.")}
          </p>
          <button className={styles.secondaryButton} type="button" onClick={copyShareLink}>
            {copied ? <Copy aria-hidden="true" size={16} /> : <Share2 aria-hidden="true" size={16} />}
            {copied ? "Copied" : "Share state"}
          </button>
        </div>

        {resolution.status === "invalid" ? (
          <div className={styles.emptyState} role="alert">
            <h3>Snapshot unavailable</h3>
            <p>Refresh the reviewed snapshot.</p>
            <button className={styles.secondaryButton} type="button" onClick={reset}>Reset explorer</button>
          </div>
        ) : resolution.status === "no-data" ? (
          <div className={styles.emptyState}>
            <h3>No matching cohorts</h3>
            <p>Change a filter or reset the explorer.</p>
            <button className={styles.secondaryButton} type="button" onClick={reset}>Reset explorer</button>
          </div>
        ) : (
          <>
            {visibleWarnings.map((warning) => (
              <p className={styles.warning} key={warning} role="note">
                <strong>Limited evidence.</strong> {warning}
              </p>
            ))}

            {visiblePrimary ? (
              <section className={styles.answer} aria-labelledby="drive-reliability-answer-title">
                <div className={styles.answerHeading}>
                  <div>
                    <h3 id="drive-reliability-answer-title">{visiblePrimary.model}</h3>
                    <p className={styles.answerMeta}>{visiblePrimary.period.label} · {visiblePrimary.manufacturer} · {formatCapacity(visiblePrimary.capacityTb)}</p>
                  </div>
                  <span className={styles.evidenceLabel}>{visiblePrimary.evidenceLabel}</span>
                </div>

                <div className={styles.primaryRate}>
                  <span>Observed AFR</span>
                  <strong>{visiblePrimary.displayAfrPercent}</strong>
                </div>

                <div className={styles.metricGrid}>
                  <div className={styles.metric}>
                    <span>Evidence range</span>
                    <strong>{visiblePrimary.displayEvidenceRange}</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Drive count</span>
                    <strong>{formatNumber(visiblePrimary.driveCount)}</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Drive days</span>
                    <strong>{formatNumber(visiblePrimary.driveDays)}</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Failures</span>
                    <strong>{formatNumber(visiblePrimary.failures)}</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Average age</span>
                    <strong>{formatAge(visiblePrimary.averageAgeMonths)}</strong>
                  </div>
                </div>

                <div className={styles.plotGroup} aria-label="AFR and evidence ranges">
                  <div className={styles.plotLegend}>
                    <span>AFR</span>
                    <span>Approx. 95% evidence range</span>
                  </div>
                  <div className={styles.plotList}>
                    {chartRows.map((row) => (
                      <div className={styles.plotRow} key={row.id} data-chart-model-id={row.id}>
                        <span className={styles.plotLabel}>{row.model}</span>
                        <span className={styles.plotTrack} style={chartStyle(row, chartMaximum)}>
                          <span className={styles.plotRange} />
                          <span className={styles.plotPoint} />
                        </span>
                        <span className={styles.plotValue}>{row.displayAfrPercent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <p className={styles.selectionPrompt}>Select a cohort to inspect its observed result.</p>
            )}

            <section className={styles.cohortSection} aria-labelledby="drive-reliability-cohorts-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h3 id="drive-reliability-cohorts-title">Cohorts</h3>
                  <p className={styles.annotation}>Select up to three.</p>
                </div>
                <span className={styles.count}>{input.selectedModelIds.length} selected</span>
              </div>
              <div className={styles.tableScroll}>
                <table className={styles.cohortTable}>
                  <caption className={styles.visuallyHidden}>Drive reliability cohorts</caption>
                  <thead>
                    <tr>
                      <th scope="col">Cohort</th>
                      <th scope="col">TB</th>
                      <th scope="col">AFR</th>
                      <th scope="col">Failures</th>
                      <th scope="col">Drive days</th>
                      <th scope="col"><span className={styles.visuallyHidden}>Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolution.rows.map((row) => {
                      const selected = input.selectedModelIds.includes(row.id);
                      return (
                        <tr key={row.id} data-cohort-row={row.id} data-selected={selected ? "true" : "false"}>
                          <th scope="row">
                            <span className={styles.modelName}>{row.model}</span>
                            <span className={styles.modelMeta}>{row.manufacturer} · {row.evidenceLabel}</span>
                          </th>
                          <td data-field="capacity" data-label="TB">{row.capacityTb ?? "Not reported"}</td>
                          <td data-field="afr" data-label="AFR">{row.displayAfrPercent}</td>
                          <td data-field="failures" data-label="Failures">{formatNumber(row.failures)}</td>
                          <td data-field="drive-days" data-label="Drive days">{formatNumber(row.driveDays)}</td>
                          <td data-label="Action">
                            <button
                              className={styles.selectButton}
                              type="button"
                              aria-pressed={selected}
                              aria-label={`${selected ? "Remove" : "Select"} ${row.model}`}
                              onClick={() => toggleSelected(row)}
                            >
                              {selected ? "Selected" : "Select"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {resolution.selected.length > 0 && (
              <section className={styles.comparisonSection} aria-labelledby="drive-reliability-comparison-title">
                <div className={styles.sectionHeading}>
                  <h3 id="drive-reliability-comparison-title">Compare selected</h3>
                  <span className={styles.count}>{resolution.selected.length} of 3</span>
                </div>
                <div className={styles.tableScroll}>
                  <table className={styles.comparisonTable} data-comparison-table>
                    <caption className={styles.visuallyHidden}>Selected drive reliability comparison</caption>
                    <thead>
                      <tr><th scope="col">Model</th><th scope="col">AFR</th><th scope="col">Evidence range</th><th scope="col">Drive days</th><th scope="col">Failures</th></tr>
                    </thead>
                    <tbody>
                      {resolution.selected.map((row) => (
                        <tr key={row.id} data-comparison-row={row.id}>
                          <th scope="row">{row.model}</th>
                          <td data-label="AFR">{row.displayAfrPercent}</td>
                          <td data-label="Evidence range">{row.displayEvidenceRange}</td>
                          <td data-label="Drive days">{formatNumber(row.driveDays)}</td>
                          <td data-label="Failures">{formatNumber(row.failures)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <div className={styles.sourceRow}>
              <span>Source {snapshot.sourceName} · checked {snapshot.sourceCheckedAt}</span>
              <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">Open source</a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
