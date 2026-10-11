"use client";

import { RotateCcw } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import { UiLiveChart } from "@/app/ui/charts/chart-client";
import type { UiChartSpec } from "@/app/ui/charts/chart-option";
import { UiButton, UiDisclosure, UiRepeatableList, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import {
  UiActionRow,
  UiDataTable,
  UiKeyValueList,
  UiMetricGroup,
  UiPrimaryResult,
  UiStatus,
  type UiMetric,
} from "@/app/ui/display";
import {
  STARTUP_RUNWAY_HORIZON_MONTHS,
  STARTUP_RUNWAY_MAX_PLANNED_CHANGES,
  calculateStartupRunway,
  type StartupRunwayErrors,
  type StartupRunwayFieldKey,
  type StartupRunwayInput,
  type StartupRunwayPlannedChange,
  type StartupRunwayPlannedChangeInput,
  type StartupRunwayProjection,
  type StartupRunwayValues,
} from "@/lib/startup-runway-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import styles from "./startup-runway-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };
type FormFields = Omit<StartupRunwayInput, "plannedChanges">;
type ChangeField = Exclude<keyof StartupRunwayPlannedChangeInput, "id">;
type Result = { values: StartupRunwayValues; calculatedAt: Date };

const CHANGED = "Inputs changed. Calculate again.";
const HORIZON = STARTUP_RUNWAY_HORIZON_MONTHS;

const FREQUENCY_OPTIONS = [
  uiOption("once", "Once"),
  uiOption("monthly", "Every month"),
  uiOption("yearly", "Every 12 months"),
];
const DIRECTION_OPTIONS = [uiOption("out", "Money out"), uiOption("in", "Money in")];

function emptyFields(): FormFields {
  return {
    currency: "USD",
    cashNow: "",
    collectedPerMonth: "",
    paidOutPerMonth: "",
    revenueGrowthPercent: "",
    expenseGrowthPercent: "",
  };
}

function emptyChange(id: string): StartupRunwayPlannedChangeInput {
  return { id, name: "", direction: "out", amount: "", startMonth: "", frequency: "once" };
}

/* ---------------- formatting ---------------- */

function currencySymbol(currency: SaasEconomicsCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatInteger(value: bigint | number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatMoney(cents: bigint, currency: SaasEconomicsCurrency): string {
  const negative = cents < 0n;
  const magnitude = negative ? -cents : cents;
  const fraction = (magnitude % 100n).toString().padStart(2, "0");
  return `${negative ? "−" : ""}${currencySymbol(currency)}${formatInteger(magnitude / 100n)}.${fraction}`;
}

function formatRate(hundredths: bigint): string {
  const negative = hundredths < 0n;
  const magnitude = negative ? -hundredths : hundredths;
  const fraction = (magnitude % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${negative ? "−" : ""}${formatInteger(magnitude / 100n)}${fraction ? `.${fraction}` : ""}%`;
}

function formatRunway(tenths: bigint): string {
  if (tenths === 0n) return "0";
  return `${formatInteger(tenths / 10n)}.${tenths % 10n}`;
}

function formatMonths(count: number): string {
  return `${formatInteger(count)} ${count === 1 ? "month" : "months"}`;
}

/** "about 1 year 6 months" for runways of a year or more. */
function yearsPhrase(tenths: bigint): string | null {
  const whole = tenths / 10n;
  if (whole < 12n) return null;
  const years = whole / 12n;
  const months = Number(whole % 12n);
  const yearText = `${formatInteger(years)} ${years === 1n ? "year" : "years"}`;
  return `about ${yearText}${months ? ` ${formatMonths(months)}` : ""}`;
}

/** Calendar month for a runway, from the date Calculate ran. Only for runways up to the horizon. */
function calendarMonth(tenths: bigint, from: Date): string | null {
  if (tenths <= 0n || tenths > BigInt(HORIZON * 10)) return null;
  const whole = Number(tenths / 10n);
  const date = new Date(from.getFullYear(), from.getMonth(), 1);
  date.setMonth(date.getMonth() + whole);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(from.getDate(), lastDay) + Number(tenths % 10n) * 3);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function changeLabel(change: { name: string }, index: number): string {
  return change.name.trim() || `Planned change ${index + 1}`;
}

function changeSummary(change: StartupRunwayPlannedChange, currency: SaasEconomicsCurrency): string {
  const direction = change.direction === "in" ? "money in" : "money out";
  const amount = formatMoney(change.amountCents, currency);
  const when = change.frequency === "once"
    ? `once in month ${change.startMonth}`
    : change.frequency === "monthly"
      ? `every month from month ${change.startMonth}`
      : `every 12 months from month ${change.startMonth}`;
  return `${change.name} · ${direction} · ${amount} ${when}`;
}

/* ---------------- results ---------------- */

type Lead = { label: string; value: string; unit?: string; lines: string[] };

function todayLead(values: StartupRunwayValues, calculatedAt: Date): Lead {
  const { currency, today } = values;
  const label = "At today's numbers";
  if (today.kind === "cashFlowPositive") {
    return { label, value: "Cash-flow positive", lines: [`Cash grows by ${formatMoney(today.surplusCents, currency)} a month.`] };
  }
  if (today.kind === "breakEven") {
    return {
      label,
      value: "Break-even",
      lines: [`Cash in equals cash out, so your balance stays at ${formatMoney(values.cashNowCents, currency)}.`],
    };
  }
  if (today.cashOutMonth === 0n) {
    return {
      label,
      value: "0",
      unit: "months",
      lines: [`You have no cash to cover the ${formatMoney(today.netBurnCents, currency)} you're short this month.`],
    };
  }
  const years = yearsPhrase(today.runwayTenths);
  const calendar = calendarMonth(today.runwayTenths, calculatedAt);
  return {
    label,
    value: formatRunway(today.runwayTenths),
    unit: "months",
    lines: [
      `Cash runs out in month ${formatInteger(today.cashOutMonth)}${calendar ? `, around ${calendar}` : ""}.`,
      ...(years ? [`That's ${years}.`] : []),
    ],
  };
}

function lowestLine(projection: StartupRunwayProjection, currency: SaasEconomicsCurrency): string | null {
  const { lowestBalance } = projection;
  if (lowestBalance.month === 0) return null;
  return `Lowest balance: ${formatMoney(lowestBalance.cents, currency)} in month ${lowestBalance.month}.`;
}

function forecastLead(values: StartupRunwayValues, projection: StartupRunwayProjection, calculatedAt: Date): Lead {
  const { currency } = values;
  const label = "With your forecast";
  const { cashOut, coversCostsFromMonth, firstCoversCostsMonth, outcome } = projection;

  if (outcome.kind === "runsOut" && cashOut) {
    const lines: string[] = [];
    const coveredBeforeCashOut = coversCostsFromMonth !== null && coversCostsFromMonth <= cashOut.month;
    if (cashOut.month === 0) {
      lines.push("You have no cash to cover the shortfall in month 1.");
    } else if (coveredBeforeCashOut) {
      const balance = projection.path[cashOut.month]?.balanceCents ?? -1n;
      lines.push(balance === 0n
        ? `A planned payment uses up the rest of your cash in month ${cashOut.month}.`
        : `A planned payment takes cash below zero in month ${cashOut.month}.`);
    } else {
      const calendar = calendarMonth(cashOut.runwayTenths, calculatedAt);
      lines.push(`Cash runs out in month ${cashOut.month}${calendar ? `, around ${calendar}` : ""}.`);
    }
    if (!coveredBeforeCashOut) {
      lines.push(coversCostsFromMonth !== null
        ? `Monthly income covers monthly costs from month ${coversCostsFromMonth}.`
        : `Monthly costs still aren't covered by month ${HORIZON}.`);
    }
    return { label, value: formatRunway(cashOut.runwayTenths), unit: "months", lines };
  }

  if (outcome.kind === "coversCostsBeforeCashOut") {
    const lines: string[] = [];
    if (firstCoversCostsMonth !== null && firstCoversCostsMonth < outcome.month) {
      lines.push(`Costs are covered in month ${firstCoversCostsMonth}, then rise above income again. They're covered for good from month ${outcome.month}.`);
    }
    lines.push(`No cash-out in the next ${HORIZON} months.`);
    const lowest = lowestLine(projection, currency);
    if (lowest) lines.push(lowest);
    return { label, value: `Covers costs from month ${outcome.month}`, lines };
  }

  if (outcome.kind === "coversCostsThroughout") {
    const lowest = lowestLine(projection, currency);
    return {
      label,
      value: "Covers costs every month",
      lines: [`No cash-out in the next ${HORIZON} months.`, ...(lowest ? [lowest] : [])],
    };
  }

  return {
    label,
    value: `More than ${HORIZON} months`,
    lines: [`No cash-out in the next ${HORIZON} months, but monthly costs still aren't covered by month ${HORIZON}.`],
  };
}

function LeadOutput({ lead, resultRef }: { lead: Lead; resultRef?: RefObject<HTMLOutputElement | null> }) {
  return (
    <UiPrimaryResult
      detail={(
        <span className={styles.detailLines}>
          {lead.lines.map((line) => <span key={line}>{line}</span>)}
        </span>
      )}
      inputRef={resultRef}
      label={lead.label}
      unit={lead.unit}
      value={lead.value}
    />
  );
}

function chartEndMonth(projection: StartupRunwayProjection): number {
  if (projection.outcome.kind === "lastsBeyondHorizon") return HORIZON;
  const key = Math.max(projection.cashOut?.month ?? 0, projection.coversCostsFromMonth ?? 0, projection.lowestBalance.month);
  return Math.min(HORIZON, Math.max(12, key + 3));
}

function CashChart({ currency, projection }: { currency: SaasEconomicsCurrency; projection: StartupRunwayProjection }) {
  const spec = useMemo<UiChartSpec>(() => {
    const end = chartEndMonth(projection);
    const months = projection.path.filter((point) => point.month <= end);
    const usd = currency === "USD";
    const count = projection.plannedChanges.length;
    const changes = count ? `, ${count} planned ${count === 1 ? "change" : "changes"}` : "";
    return {
      caption: `Revenue ${formatRate(projection.revenueGrowthHundredths)} a month, expenses ${formatRate(projection.expenseGrowthHundredths)} a month${changes}. Months 0 to ${end}.`,
      format: usd ? "currency" : "number",
      kind: "line",
      series: [
        { id: "forecast", label: "With your forecast", points: months.map((point) => [point.month, Number(point.balanceCents) / 100] as const) },
        { id: "today", label: "At today's numbers", points: months.map((point) => [point.month, Number(point.atTodaysRateCents) / 100] as const) },
      ],
      title: `Cash balance by month${usd ? "" : ` in ${currency}`}`,
      xFormat: "number",
    };
  }, [currency, projection]);
  // The chart's hidden data table lays out at full width; clip it so the page doesn't scroll sideways.
  return <div className={styles.chart}><UiLiveChart spec={spec} /></div>;
}

function MonthTable({ currency, projection }: { currency: SaasEconomicsCurrency; projection: StartupRunwayProjection }) {
  const rows = projection.path.map((point) => {
    const marks: string[] = [];
    if (projection.cashOut && point.month === Math.max(projection.cashOut.month, 1)) marks.push("Cash runs out");
    if (point.month === projection.coversCostsFromMonth) marks.push("Covers costs");
    return {
      id: `month-${point.month}`,
      cells: {
        month: marks.length ? `${point.month} · ${marks.join(" · ")}` : String(point.month),
        collected: formatMoney(point.collectedCents, currency),
        paidOut: formatMoney(point.paidOutCents, currency),
        planned: point.plannedCents === 0n ? "None" : formatMoney(point.plannedCents, currency),
        balance: formatMoney(point.balanceCents, currency),
      },
    };
  });
  return (
    <UiDisclosure label="Month by month" summary={`Months 0 to ${HORIZON}`}>
      <UiDataTable
        ariaLabel="Cash by month"
        columns={[
          { id: "month", label: "Month" },
          { id: "collected", label: "Collected", align: "right" },
          { id: "paidOut", label: "Paid out", align: "right" },
          { id: "planned", label: "Planned", align: "right" },
          { id: "balance", label: "Balance", align: "right" },
        ]}
        rows={rows}
      />
    </UiDisclosure>
  );
}

function Assumptions({ values }: { values: StartupRunwayValues }) {
  const { currency, projection } = values;
  if (!projection) {
    return <p className={styles.formula}>Runway = cash now ÷ (cash paid out − cash collected), with both staying the same each month.</p>;
  }
  const rate = (hundredths: bigint, wasBlank: boolean) => `${formatRate(hundredths)} a month${wasBlank ? " (left blank)" : ""}`;
  const rows = [
    { label: "Revenue growth", value: rate(projection.revenueGrowthHundredths, projection.revenueGrowthWasBlank) },
    { label: "Expense growth", value: rate(projection.expenseGrowthHundredths, projection.expenseGrowthWasBlank) },
    {
      label: "Planned changes",
      value: projection.plannedChanges.length ? (
        <ul className={styles.changeList}>
          {projection.plannedChanges.map((change) => <li key={change.id}>{changeSummary(change, currency)}</li>)}
        </ul>
      ) : "None",
    },
    { label: "Month rule", value: "Month 1 uses the numbers you entered. Growth starts in month 2." },
    { label: "Horizon", value: formatMonths(HORIZON) },
  ];
  return <UiKeyValueList rows={rows} />;
}

function RunwayResults({ result, resultRef }: { result: Result; resultRef: RefObject<HTMLOutputElement | null> }) {
  const { values, calculatedAt } = result;
  const { currency, projection } = values;
  const compare = projection !== null && !projection.matchesToday;
  const today = todayLead(values, calculatedAt);
  const forecast = compare && projection ? forecastLead(values, projection, calculatedAt) : null;
  const single = forecast ? null : { ...today, label: "Runway at today's numbers" };

  const net = values.netBurnCents;
  const burnItems: UiMetric[] = [
    { id: "gross", label: "Cash paid out (gross burn)", value: formatMoney(values.grossBurnCents, currency) },
    { id: "collected", label: "Cash collected", value: formatMoney(values.collectedPerMonthCents, currency) },
    net < 0n
      ? { id: "net", label: "Net cash in", value: formatMoney(-net, currency) }
      : { id: "net", label: "Net burn", value: formatMoney(net, currency) },
  ];

  return (
    <section aria-label="Startup runway results" className={styles.results}>
      <div className={styles.answer}>
        {forecast ? (
          <div className={styles.leads}>
            <LeadOutput lead={today} resultRef={resultRef} />
            <LeadOutput lead={forecast} />
          </div>
        ) : single ? (
          <LeadOutput lead={single} resultRef={resultRef} />
        ) : null}
        {projection?.matchesToday ? <p className={styles.note}>Your forecast matches today&apos;s numbers. Add a growth rate or a planned change to compare.</p> : null}
        {compare && projection?.cashShortfallCents != null ? (
          <UiMetricGroup
            ariaLabel="Cash gap"
            items={[{
              id: "gap",
              label: projection.coversCostsFromMonth !== null && projection.cashOut !== null && projection.coversCostsFromMonth <= projection.cashOut.month
                ? "Extra cash needed to stay above zero"
                : "Extra cash needed to reach break-even",
              unit: `lowest balance in month ${projection.lowestBalance.month}`,
              value: formatMoney(projection.cashShortfallCents, currency),
            }]}
          />
        ) : null}
      </div>

      <section aria-labelledby="runway-burn-title" className={styles.resultGroup}>
        <h2 id="runway-burn-title">Monthly burn today</h2>
        <UiMetricGroup ariaLabel="Monthly burn today" items={burnItems} />
      </section>

      {compare && projection ? (
        <section aria-label="Cash by month" className={styles.resultGroup}>
          <CashChart currency={currency} projection={projection} />
          <MonthTable currency={currency} projection={projection} />
        </section>
      ) : null}

      <section aria-labelledby="runway-assumptions-title" className={styles.resultGroup}>
        <h2 id="runway-assumptions-title">What the answer uses</h2>
        <Assumptions values={values} />
      </section>
    </section>
  );
}

/* ---------------- form ---------------- */

const MAIN_ORDER: StartupRunwayFieldKey[] = [
  "currency",
  "cashNow",
  "collectedPerMonth",
  "paidOutPerMonth",
  "revenueGrowthPercent",
  "expenseGrowthPercent",
];

export function StartupRunwayCalculator() {
  const [fields, setFields] = useState<FormFields>(emptyFields);
  const [changes, setChanges] = useState<StartupRunwayPlannedChangeInput[]>([]);
  const [changesOpen, setChangesOpen] = useState(false);
  const [errors, setErrors] = useState<StartupRunwayErrors>({});
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const nextChangeId = useRef(1);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  const atLimit = changes.length >= STARTUP_RUNWAY_MAX_PLANNED_CHANGES;

  // Row fields share visible labels, so give each a row-specific accessible name.
  useLayoutEffect(() => {
    const form = formRef.current;
    if (!form) return;
    changes.forEach((change, index) => {
      const row = `Planned change ${index + 1}`;
      form.querySelector<HTMLElement>(`[data-focus-key="plannedChanges.${change.id}.amount"]`)?.setAttribute("aria-label", `${row} amount`);
      form.querySelector<HTMLElement>(`[data-focus-key="plannedChanges.${change.id}.startMonth"]`)?.setAttribute("aria-label", `${row} start month`);
      form.querySelector<HTMLElement>(`[data-focus-key="plannedChanges.${change.id}.name"]`)?.setAttribute("aria-label", `${row} name`);
    });
  });

  function errorText(key: StartupRunwayFieldKey): string | null {
    return errors[key]?.message ?? null;
  }

  function clearForEdit(announce?: string) {
    const hadResult = result !== null;
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: CHANGED, tone: "neutral" });
    else if (announce) setStatus({ text: announce, tone: "neutral" });
    else if (status?.text !== CHANGED) setStatus(null);
  }

  function updateField<K extends keyof FormFields>(field: K, value: FormFields[K]) {
    setFields((current) => ({ ...current, [field]: value }));
    clearForEdit();
  }

  function updateChange(id: string, field: ChangeField, value: string) {
    setChanges((current) => current.map((change) => change.id === id ? { ...change, [field]: value } : change));
    clearForEdit();
  }

  function addChange() {
    if (atLimit) return;
    const change = emptyChange(`change-${nextChangeId.current++}`);
    setChanges((current) => current.length >= STARTUP_RUNWAY_MAX_PLANNED_CHANGES ? current : [...current, change]);
    clearForEdit(`Planned change ${changes.length + 1} added.`);
  }

  function removeChange(id: string) {
    const index = changes.findIndex((change) => change.id === id);
    const label = index >= 0 ? changeLabel(changes[index], index) : "Planned change";
    setChanges((current) => current.filter((change) => change.id !== id));
    clearForEdit(`${label} removed.`);
  }

  function focusKey(key: string) {
    // Two frames, so a disclosure opened by the same submit has rendered its fields.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
    }));
  }

  function focusFirstError(nextErrors: StartupRunwayErrors) {
    const order: StartupRunwayFieldKey[] = [
      ...MAIN_ORDER,
      ...changes.flatMap((change) => [
        `plannedChanges.${change.id}.amount`,
        `plannedChanges.${change.id}.direction`,
        `plannedChanges.${change.id}.startMonth`,
        `plannedChanges.${change.id}.frequency`,
        `plannedChanges.${change.id}.name`,
      ] as const),
      "plannedChanges",
    ];
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    if (first.startsWith("plannedChanges")) setChangesOpen(true);
    if (first === "plannedChanges") {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>("[data-repeatable-add]")?.focus();
      }));
    } else {
      focusKey(first);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateStartupRunway({ ...fields, plannedChanges: changes });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        if (calculation.errors.form) setStatus({ text: calculation.errors.form.message, tone: "danger" });
        focusFirstError(calculation.errors);
        return;
      }
      setErrors({});
      setResult({ values: calculation.values, calculatedAt: new Date() });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setErrors({});
      setResult(null);
      setStatus({ text: "Couldn't calculate. Try again.", tone: "danger" });
    }
  }

  function reset() {
    setFields(emptyFields());
    setChanges([]);
    setChangesOpen(false);
    setErrors({});
    setResult(null);
    setStatus({ text: "Form reset.", tone: "neutral" });
    focusKey("cashNow");
  }

  const listNote = errors.plannedChanges?.message ?? (atLimit ? `Up to ${STARTUP_RUNWAY_MAX_PLANNED_CHANGES} planned changes.` : undefined);
  const changeCount = changes.length ? `${changes.length} planned` : undefined;

  return (
    <section aria-label="Startup runway calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Startup runway inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <section aria-labelledby="runway-today-title" className={styles.group}>
            <div className={styles.groupHeader}>
              <h2 id="runway-today-title">Today</h2>
              <div className={styles.currency}>
                <UiSelect
                  dataFocusKey="currency"
                  error={errorText("currency")}
                  label="Currency"
                  onChange={(value) => {
                    if (!SAAS_ECONOMICS_CURRENCIES.includes(value as SaasEconomicsCurrency)) return;
                    updateField("currency", value);
                  }}
                  options={SAAS_ECONOMICS_CURRENCIES.map((currency) => uiOption(currency, currency))}
                  required
                  value={fields.currency}
                />
              </div>
            </div>
            <div className={styles.fieldGrid}>
              <UiTextField
                autoCapitalize="none"
                dataFocusKey="cashNow"
                error={errorText("cashNow")}
                inputMode="decimal"
                description="Business cash you can spend today. Not personal savings."
                label="Cash now"
                onChange={(value) => updateField("cashNow", value)}
                required
                spellCheck={false}
                suffix={fields.currency}
                value={fields.cashNow}
              />
            </div>
            <div className={styles.fieldGrid}>
              <UiTextField
                autoCapitalize="none"
                dataFocusKey="collectedPerMonth"
                description="Customer payments received in a normal month, not MRR. Add yearly payments as planned changes instead."
                error={errorText("collectedPerMonth")}
                inputMode="decimal"
                label="Cash collected in a typical month"
                onChange={(value) => updateField("collectedPerMonth", value)}
                required
                spellCheck={false}
                suffix={fields.currency}
                value={fields.collectedPerMonth}
              />
              <UiTextField
                autoCapitalize="none"
                dataFocusKey="paidOutPerMonth"
                description="Everything that leaves the account, including your own pay, fees, and taxes."
                error={errorText("paidOutPerMonth")}
                inputMode="decimal"
                label="Cash paid out in a typical month"
                onChange={(value) => updateField("paidOutPerMonth", value)}
                required
                spellCheck={false}
                suffix={fields.currency}
                value={fields.paidOutPerMonth}
              />
            </div>
          </section>

          <section aria-labelledby="runway-forecast-title" className={styles.group}>
            <div className={styles.groupTitle}>
              <h2 id="runway-forecast-title">Forecast <span className={styles.optional}>(optional)</span></h2>
              <p className={styles.helper}>Month 1 uses the numbers above. Growth starts in month 2.</p>
            </div>
            <div className={styles.fieldGrid}>
              <UiTextField
                autoCapitalize="none"
                dataFocusKey="revenueGrowthPercent"
                error={errorText("revenueGrowthPercent")}
                label="Monthly revenue growth"
                onChange={(value) => updateField("revenueGrowthPercent", value)}
                spellCheck={false}
                suffix="%"
                value={fields.revenueGrowthPercent}
              />
              <UiTextField
                autoCapitalize="none"
                dataFocusKey="expenseGrowthPercent"
                error={errorText("expenseGrowthPercent")}
                label="Monthly expense growth"
                onChange={(value) => updateField("expenseGrowthPercent", value)}
                spellCheck={false}
                suffix="%"
                value={fields.expenseGrowthPercent}
              />
            </div>
            <UiDisclosure
              isExpanded={changesOpen}
              label="Planned changes"
              onExpandedChange={setChangesOpen}
              summary={changeCount}
            >
              <div className={styles.changes}>
                <p className={styles.helper}>A hire, a yearly renewal, a one-off bill, or money you&apos;re sure is coming. Month 1 is the first month from today. Amounts don&apos;t grow.</p>
                <UiRepeatableList
                  addDescription={listNote}
                  addDescriptionIsError={Boolean(errors.plannedChanges)}
                  addDisabled={atLimit}
                  addLabel="Add a planned change"
                  ariaLabel="Planned changes"
                  items={changes}
                  onAdd={addChange}
                  onRemove={removeChange}
                  removeLabel={(change, index) => `Remove ${changeLabel(change, index)}`}
                  renderItem={(change, index) => (
                    <fieldset className={styles.change}>
                      <legend className={styles.visuallyHidden}>Planned change {index + 1}</legend>
                      <UiTextField
                        autoCapitalize="none"
                        className={styles.changeAmount}
                        dataFocusKey={`plannedChanges.${change.id}.amount`}
                        error={errorText(`plannedChanges.${change.id}.amount`)}
                        inputMode="decimal"
                        label="Amount"
                        onChange={(value) => updateChange(change.id, "amount", value)}
                        required
                        spellCheck={false}
                        suffix={fields.currency}
                        value={change.amount}
                      />
                      <div className={styles.changeDirection}>
                        <UiSelect
                          ariaLabel={`Planned change ${index + 1} type`}
                          dataFocusKey={`plannedChanges.${change.id}.direction`}
                          error={errorText(`plannedChanges.${change.id}.direction`)}
                          label="Type"
                          onChange={(value) => updateChange(change.id, "direction", value)}
                          options={DIRECTION_OPTIONS}
                          value={change.direction}
                        />
                      </div>
                      <UiTextField
                        autoCapitalize="none"
                        className={styles.changeMonth}
                        dataFocusKey={`plannedChanges.${change.id}.startMonth`}
                        error={errorText(`plannedChanges.${change.id}.startMonth`)}
                        inputMode="numeric"
                        label="Start month"
                        onChange={(value) => updateChange(change.id, "startMonth", value)}
                        required
                        spellCheck={false}
                        value={change.startMonth}
                      />
                      <div className={styles.changeFrequency}>
                        <UiSelect
                          ariaLabel={`Planned change ${index + 1} repeats`}
                          dataFocusKey={`plannedChanges.${change.id}.frequency`}
                          error={errorText(`plannedChanges.${change.id}.frequency`)}
                          label="Repeats"
                          onChange={(value) => updateChange(change.id, "frequency", value)}
                          options={FREQUENCY_OPTIONS}
                          value={change.frequency}
                        />
                      </div>
                      <UiTextField
                        autoCapitalize="sentences"
                        className={styles.changeName}
                        dataFocusKey={`plannedChanges.${change.id}.name`}
                        error={errorText(`plannedChanges.${change.id}.name`)}
                        label="Name"
                        onChange={(value) => updateChange(change.id, "name", value)}
                        placeholder={`Planned change ${index + 1}`}
                        value={change.name}
                      />
                    </fieldset>
                  )}
                />
              </div>
            </UiDisclosure>
          </section>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate runway</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <RunwayResults result={result} resultRef={resultRef} /> : null}
      </div>
    </section>
  );
}
