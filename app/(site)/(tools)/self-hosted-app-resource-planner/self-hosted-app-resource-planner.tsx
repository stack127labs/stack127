"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { UiButton, UiComboBox, UiNumberField, UiQuantityInput, UiRepeatableList, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiDataTable, UiKeyValueList, UiPrimaryResult, UiResultLead, UiStatus } from "@/app/ui/display";
import {
  DEFAULT_RESOURCE_PLANNER_INPUT,
  calculateSelfHostedResourcePlan,
  formatResourcePlannerAvailable,
  formatResourcePlannerDisplayValue,
  formatResourcePlannerRange,
  type ResourcePlannerCatalogue,
  type ResourcePlannerInput,
  type ResourceRange,
  type ResourcePlannerResult,
  type ResourcePlannerRowInput,
  type ResourceDimension,
} from "@/lib/self-hosted-app-resource-planner/engine";
import type { ResourcePlannerAppSummary } from "@/lib/self-hosted-app-resource-planner/data";
import styles from "./self-hosted-app-resource-planner.module.css";

type Props = { appIndex: ResourcePlannerAppSummary[] };
type FieldErrors = Record<string, string>;

const ramUnitOptions = [uiOption("GiB", "GiB")];
const storageUnitOptions = [uiOption("GB", "GB")];

function emptyRow(id: string, kind: "curated" | "custom", appSlug = ""): ResourcePlannerRowInput {
  return {
    id,
    kind,
    appSlug,
    name: kind === "custom" ? "" : "",
    quantity: "1",
    ramMinGiB: "",
    ramMaxGiB: "",
    storageMinGb: "",
    storageMaxGb: "",
  };
}

function inputDefaults(): ResourcePlannerInput {
  return { ...DEFAULT_RESOURCE_PLANNER_INPUT, rows: [] };
}

function issueMap(result: Extract<ResourcePlannerResult, { status: "invalid" }>) {
  return Object.fromEntries(result.issues.map((issue) => [issue.field, issue.message]));
}

function rowError(errors: FieldErrors, id: string, field: string) {
  return errors[`rows.${id}.${field}`] ?? errors[`rows.${id}.${field.split(".").at(-1) ?? field}`];
}

function fitLabel(fit: "within" | "tight" | "over" | "unknown") {
  if (fit === "within") return "Within";
  if (fit === "tight") return "Tight";
  if (fit === "over") return "Over";
  return "Unknown";
}

function fitTone(fit: "within" | "tight" | "over" | "unknown") {
  if (fit === "within") return "success" as const;
  if (fit === "over") return "danger" as const;
  if (fit === "tight" || fit === "unknown") return "warning" as const;
  return "neutral" as const;
}

function formatContributionRange(
  contribution: { min: number | null; max: number | null },
  dimension: ResourceDimension,
) {
  if (contribution.min === null || contribution.max === null) return "Unknown";
  return `${formatResourcePlannerDisplayValue(contribution.min, dimension)} to ${formatResourcePlannerDisplayValue(contribution.max, dimension)}`;
}

function resourceSourceLabel(contribution: { evidence: string; kind: string; sourceUrls: string[] }) {
  if (contribution.evidence === "user-supplied") return "User supplied";
  if (contribution.evidence === "unknown") return "Unknown";
  return contribution.kind === "derived" ? "Derived" : "Estimated";
}

function ResourceEvidence({ label, range }: { label: string; range: ResourceRange | null }) {
  if (!range) return <span>{label}: Unknown</span>;
  return (
    <div className={styles.evidenceItem}>
      <span>{label}: {range.kind}, {range.confidence} confidence</span>
      <span>Basis: {range.basis}</span>
      {range.note ? <span>Note: {range.note}</span> : null}
      <span>Checked: {range.checkedAt ?? "Unknown"}</span>
      <span className={styles.sourceLinks}>
        {range.sourceUrls.map((url, index) => (
          <a href={url} key={url} rel="noreferrer" target="_blank">{range.sourceUrls.length === 1 ? "Source" : `Source ${index + 1}`}</a>
        ))}
      </span>
    </div>
  );
}

function ResourceBar({
  label,
  result,
  dimension,
}: {
  label: string;
  result: { knownMaxMb?: number; knownMaxGb?: number; availableMb?: number; availableGb?: number; fit: string };
  dimension: ResourceDimension;
}) {
  const known = dimension === "ram" ? result.knownMaxMb ?? 0 : result.knownMaxGb ?? 0;
  const available = dimension === "ram" ? result.availableMb ?? 0 : result.availableGb ?? 0;
  const overBudget = known > available;
  return (
    <section className={styles.resourceBar}>
      <h3>{label}</h3>
      <UiAllocationBar
        ariaLabel={`${label} known maximum against available budget`}
        formatValue={(value) => formatResourcePlannerDisplayValue(Number(value), dimension)}
        palette="neutral"
        segments={overBudget ? [
          { id: "within", label: "Within available budget", tone: "accent", value: available },
          { id: "overage", label: "Over budget", tone: "red", value: known - available },
        ] : [
          { id: "known", label: "Known maximum", tone: "accent", value: known },
          { id: "remaining", label: "Remaining budget", tone: "empty", value: available - known },
        ]}
        total={overBudget ? known : available}
      />
    </section>
  );
}

export function SelfHostedAppResourcePlanner({ appIndex }: Props) {
  const [input, setInput] = useState<ResourcePlannerInput>(inputDefaults);
  const [catalogue, setCatalogue] = useState<ResourcePlannerCatalogue>({});
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [loadingApp, setLoadingApp] = useState(false);
  const [calculated, setCalculated] = useState<Extract<ResourcePlannerResult, { status: "valid" }> | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const focusResult = useRef(false);

  useEffect(() => setHydrated(true), []);

  const appOptions = useMemo(() => [
    ...appIndex.map((app) => uiOption(app.slug, app.name, app.hasRam && app.hasStorage ? "RAM and storage ranges" : "Some requirements unknown")),
    uiOption("custom", "Custom app", "Range optional"),
  ], [appIndex]);

  useEffect(() => {
    if (!focusResult.current || !calculated) return;
    focusResult.current = false;
    window.setTimeout(() => {
      const heading = document.getElementById("resource-plan-result-heading");
      heading?.scrollIntoView({ block: "start", inline: "nearest" });
      heading?.focus({ preventScroll: true });
    }, 0);
  }, [calculated]);

  function updateInput(next: (current: ResourcePlannerInput) => ResourcePlannerInput) {
    setInput(next);
    setCalculated(null);
    setErrors({});
    setStatus("Changes not calculated.");
  }

  async function addSelectedApp() {
    if (!selectedApp) {
      setStatus("Choose an app to add.");
      window.setTimeout(() => document.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus(), 0);
      return;
    }
    const kind = selectedApp === "custom" ? "custom" : "curated";
    if (kind === "curated" && !catalogue[selectedApp]) {
      setLoadingApp(true);
      setStatus("Loading app requirements…");
      try {
        const response = await fetch(`/api/resource-planner-app/${encodeURIComponent(selectedApp)}`);
        if (!response.ok) throw new Error("App requirements could not be loaded.");
        const app = await response.json() as ResourcePlannerCatalogue[string];
        if (app.slug !== selectedApp) throw new Error("App requirements could not be loaded.");
        setCatalogue((current) => ({ ...current, [app.slug]: app }));
      } catch {
        setStatus("App requirements could not be loaded. Try adding the app again.");
        setLoadingApp(false);
        return;
      }
      setLoadingApp(false);
    }
    updateInput((current) => ({
      ...current,
      rows: [...current.rows, emptyRow(`row-${Date.now()}-${current.rows.length}`, kind, kind === "curated" ? selectedApp : "")],
    }));
    setSelectedApp(null);
  }

  function removeRow(id: string) {
    updateInput((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) }));
    window.setTimeout(() => {
      document.querySelector<HTMLElement>("[data-repeatable-row] input")?.focus()
        ?? document.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus();
    }, 0);
  }

  function updateRow(id: string, patch: Partial<ResourcePlannerRowInput>) {
    updateInput((current) => ({
      ...current,
      rows: current.rows.map((row) => row.id === id ? { ...row, ...patch } : row),
    }));
  }

  function focusFirstError(nextErrors: FieldErrors) {
    const first = Object.keys(nextErrors)[0];
    if (!first) return;
    if (first === "rows" || input.rows.length === 0) {
      document.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus();
      return;
    }
    const key = first.replace(/^rows\./, "");
    fieldRefs.current[key]?.focus()
      ?? document.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = calculateSelfHostedResourcePlan(input, catalogue);
    if (result.status === "invalid") {
      const nextErrors = issueMap(result);
      setErrors(nextErrors);
      setCalculated(null);
      setStatus(input.rows.length === 0 ? "Add an app and host budget." : "Check the marked inputs.");
      window.setTimeout(() => focusFirstError(nextErrors), 0);
      return;
    }
    setErrors({});
    setStatus("Plan calculated.");
    setCalculated(result);
    focusResult.current = true;
  }

  function reset() {
    setInput(inputDefaults());
    setSelectedApp(null);
    setCalculated(null);
    setErrors({});
    setStatus("Plan reset.");
    window.setTimeout(() => document.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus(), 0);
  }

  function clearCalculatedOnEdit() {
    if (!calculated) return;
    setCalculated(null);
    setStatus("Changes not calculated.");
  }

  const updateNumber = (field: "ramBudgetGiB" | "storageBudgetGb" | "headroomPercent", value: number) => {
    updateInput((current) => ({ ...current, [field]: Number.isNaN(value) ? "" : String(value) }));
  };

  return (
    <div aria-label="self-hosted app resource planner workbench" className={styles.tool} data-hydrated={hydrated ? "true" : undefined} data-tool-workbench role="region">
      <form className={styles.form} noValidate onInputCapture={clearCalculatedOnEdit} onSubmit={submit}>
        <section className={styles.formSection}>
          <div className={styles.sectionHeading}>
            <h2>App mix</h2>
            <p>Choose the services you want to compare.</p>
          </div>
          <UiComboBox
            label="App to add"
            onChange={setSelectedApp}
            options={appOptions}
            placeholder="Choose a published app or custom row"
            value={selectedApp}
          />
          <UiRepeatableList
            addDisabled={!selectedApp || loadingApp}
            addLabel="Add app"
            ariaLabel="Selected app rows"
            items={input.rows}
            onAdd={() => { void addSelectedApp(); }}
            onRemove={removeRow}
            removeLabel={(row) => `Remove ${row.name || "custom app"}`}
            renderItem={(row) => {
              const app = row.kind === "curated" ? catalogue[row.appSlug] : null;
              const normalizedName = app?.name ?? row.name;
              return (
                <div className={styles.appRow}>
                  {row.kind === "custom" ? (
                    <UiTextField
                      dataFocusKey={`${row.id}.name`}
                      error={rowError(errors, row.id, "name")}
                      inputRef={(node) => { fieldRefs.current[`${row.id}.name`] = node; }}
                      label="Custom app name"
                      onChange={(value) => updateRow(row.id, { name: value })}
                      required
                      value={row.name}
                    />
                  ) : (
                    <div className={styles.appIdentity}>
                      <strong>{normalizedName}</strong>
                      <span>{app?.ram && app?.storage ? "Reviewed RAM and storage ranges" : "Some requirements unknown"}</span>
                    </div>
                  )}
                  <UiNumberField
                    dataFocusKey={`${row.id}.quantity`}
                    error={rowError(errors, row.id, "quantity")}
                    inputRef={(node) => { fieldRefs.current[`${row.id}.quantity`] = node; }}
                    label="Quantity"
                    min={1}
                    max={99}
                    onChange={(value) => updateRow(row.id, { quantity: Number.isNaN(value) ? "" : String(value) })}
                    required
                    value={row.quantity === "" ? Number.NaN : Number(row.quantity)}
                  />
                  {row.kind === "custom" ? (
                    <div className={styles.customRanges}>
                      <UiQuantityInput
                        dataFocusKey={`${row.id}.ramMinGiB`}
                        error={rowError(errors, row.id, "ramMinGiB")}
                        label="RAM lower bound"
                        onChange={(value) => updateRow(row.id, { ramMinGiB: value })}
                        unit="GiB"
                        units={ramUnitOptions}
                        value={row.ramMinGiB}
                      />
                      <UiQuantityInput
                        dataFocusKey={`${row.id}.ramMaxGiB`}
                        error={rowError(errors, row.id, "ramMaxGiB")}
                        label="RAM upper bound"
                        onChange={(value) => updateRow(row.id, { ramMaxGiB: value })}
                        unit="GiB"
                        units={ramUnitOptions}
                        value={row.ramMaxGiB}
                      />
                      <UiQuantityInput
                        dataFocusKey={`${row.id}.storageMinGb`}
                        error={rowError(errors, row.id, "storageMinGb")}
                        label="Storage lower bound"
                        onChange={(value) => updateRow(row.id, { storageMinGb: value })}
                        unit="GB"
                        units={storageUnitOptions}
                        value={row.storageMinGb}
                      />
                      <UiQuantityInput
                        dataFocusKey={`${row.id}.storageMaxGb`}
                        error={rowError(errors, row.id, "storageMaxGb")}
                        label="Storage upper bound"
                        onChange={(value) => updateRow(row.id, { storageMaxGb: value })}
                        unit="GB"
                        units={storageUnitOptions}
                        value={row.storageMaxGb}
                      />
                    </div>
                  ) : (
                    <div className={styles.rowEvidence}>
                      <span>RAM: {app?.ram ? `${formatResourcePlannerDisplayValue(app.ram.minMb!, "ram")} to ${formatResourcePlannerDisplayValue(app.ram.maxMb!, "ram")}` : "Unknown"}</span>
                      <span>Storage: {app?.storage ? `${formatResourcePlannerDisplayValue(app.storage.minGb!, "storage")} to ${formatResourcePlannerDisplayValue(app.storage.maxGb!, "storage")}` : "Unknown"}</span>
                      <details className={styles.evidenceDetails}>
                        <summary>Evidence</summary>
                        <div className={styles.evidenceGrid}>
                          <ResourceEvidence label="RAM" range={app?.ram ?? null} />
                          <ResourceEvidence label="Storage" range={app?.storage ?? null} />
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </section>

        <section className={styles.formSection}>
          <div className={styles.sectionHeading}>
            <h2>Host budget</h2>
            <p>Reserve host headroom.</p>
          </div>
          <div className={styles.budgetGrid}>
            <UiNumberField
              dataFocusKey="ramBudgetGiB"
              error={errors.ramBudgetGiB}
              inputRef={(node) => { fieldRefs.current.ramBudgetGiB = node; }}
              label="RAM budget"
              min={0.25}
              max={4096}
              onChange={(value) => updateNumber("ramBudgetGiB", value)}
              required
              step={0.25}
              suffix="GiB"
              value={input.ramBudgetGiB === "" ? Number.NaN : Number(input.ramBudgetGiB)}
            />
            <UiNumberField
              dataFocusKey="storageBudgetGb"
              error={errors.storageBudgetGb}
              inputRef={(node) => { fieldRefs.current.storageBudgetGb = node; }}
              label="App storage budget"
              min={1}
              max={1_000_000}
              onChange={(value) => updateNumber("storageBudgetGb", value)}
              required
              step={1}
              suffix="GB"
              value={input.storageBudgetGb === "" ? Number.NaN : Number(input.storageBudgetGb)}
            />
            <UiNumberField
              dataFocusKey="headroomPercent"
              error={errors.headroomPercent}
              inputRef={(node) => { fieldRefs.current.headroomPercent = node; }}
              label="Headroom reserve"
              min={0}
              max={80}
              onChange={(value) => updateNumber("headroomPercent", value)}
              required
              step={1}
              suffix="%"
              value={input.headroomPercent === "" ? Number.NaN : Number(input.headroomPercent)}
            />
          </div>
        </section>

        <UiActionRow>
          <UiButton type="submit" variant="primary">Calculate plan</UiButton>
          <UiButton onPress={reset} type="button">Reset plan</UiButton>
        </UiActionRow>
        {status ? <UiStatus tone={status === "Check the marked inputs." ? "danger" : "neutral"}>{status}</UiStatus> : null}
      </form>

      {calculated ? <ResourcePlanResult calculation={calculated} /> : null}
    </div>
  );
}

function ResourcePlanResult({ calculation }: { calculation: Extract<ResourcePlannerResult, { status: "valid" }> }) {
  const { values } = calculation;
  const incomplete = values.ram.fit === "unknown" || values.storage.fit === "unknown";
  const binding = values.bindingResource;
  const lead = incomplete
    ? "Some app requirements are unknown."
    : values.ram.fit === "over" || values.storage.fit === "over"
      ? `Over budget. ${binding === "ram" ? "RAM" : "Storage"} exceeds the available amount.`
      : values.ram.fit === "tight" || values.storage.fit === "tight"
        ? `${binding === "ram" ? "RAM" : "Storage"} may exceed the available amount.`
        : "Within the available budget.";
  const leadTone: "success" | "warning" | "danger" = incomplete ? "warning" : values.ram.fit === "over" || values.storage.fit === "over" ? "danger" : values.ram.fit === "tight" || values.storage.fit === "tight" ? "warning" : "success";
  const summaryRows = [
    { label: "RAM", value: formatResourcePlannerRange(values.ram, "ram"), detail: `${formatResourcePlannerAvailable(values.ram, "ram")} available`, fit: values.ram.fit },
    { label: "Storage", value: formatResourcePlannerRange(values.storage, "storage"), detail: `${formatResourcePlannerAvailable(values.storage, "storage")} available`, fit: values.storage.fit },
  ];
  const tableRows = values.rows.map((row) => {
    const ram = values.ram.contributions.find((item) => item.id === row.id);
    const storage = values.storage.contributions.find((item) => item.id === row.id);
    return {
      id: row.id,
      cells: {
        app: row.name,
        quantity: row.quantity,
        ram: formatContributionRange(ram ?? { min: null, max: null }, "ram"),
        storage: formatContributionRange(storage ?? { min: null, max: null }, "storage"),
        evidence: resourceSourceLabel(ram ?? storage ?? { evidence: "unknown", kind: "unknown", sourceUrls: [] }),
      },
    };
  });
  const unknowns = [
    ...values.ram.unknownRows.map((row) => `${row.name}: RAM`),
    ...values.storage.unknownRows.map((row) => `${row.name}: storage`),
  ];

  return (
    <section aria-label="Resource plan result" aria-live="polite" className={styles.result} data-testid="resource-plan-result">
      <h2 id="resource-plan-result-heading" tabIndex={-1}>Resource plan result</h2>
      <UiPrimaryResult detail="Planning estimate." label="Plan status" tone={leadTone} value={lead} />
      <UiResultLead>{binding ? `${binding === "ram" ? "RAM" : "Storage"} has the least room left.` : "No complete resource comparison is available."}</UiResultLead>

      <div className={styles.summaryGrid}>
        {summaryRows.map((row) => (
          <section className={styles.summaryRow} key={row.label}>
            <div>
              <h3>{row.label}</h3>
              <strong>{row.value}</strong>
              <span>{row.detail}</span>
            </div>
            <span className={styles.fitState} data-tone={fitTone(row.fit as "within" | "tight" | "over" | "unknown")}>{fitLabel(row.fit as "within" | "tight" | "over" | "unknown")}</span>
          </section>
        ))}
      </div>

      <div className={styles.bars}>
        {values.ram.fit !== "unknown" ? <ResourceBar dimension="ram" label="RAM budget" result={values.ram} /> : null}
        {values.storage.fit !== "unknown" ? <ResourceBar dimension="storage" label="Storage budget" result={values.storage} /> : null}
      </div>

      {unknowns.length > 0 ? (
        <section className={styles.resultSection}>
          <h3>Unknown requirements</h3>
          <ul className={styles.unknownList}>{unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul>
        </section>
      ) : null}

      <section className={styles.resultSection}>
        <h3>Per-app contribution</h3>
        <div aria-label="Per-app contribution table" className={styles.tableViewport} tabIndex={0}>
          <UiDataTable
            ariaLabel="Per-app resource contribution"
            columns={[{ id: "app", label: "App" }, { id: "quantity", label: "Qty" }, { id: "ram", label: "RAM range" }, { id: "storage", label: "Storage range" }, { id: "evidence", label: "Evidence" }]}
            rows={tableRows}
          />
        </div>
      </section>

      <UiKeyValueList rows={[
        { label: "Headroom reserve", value: `${values.headroomPercent}%` },
        { label: "Formula", value: `Version ${values.formulaVersion}` },
      ]} />
      <p className={styles.verification}>Verify against running usage.</p>
    </section>
  );
}
