"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import type { UiChartSpec } from "@/app/ui/charts/chart-option";
import { UiLiveChart } from "@/app/ui/charts/chart-client";
import {
  UiButton,
  UiChoiceGroup,
  UiDisclosure,
  UiHint,
  UiRepeatableList,
  UiSelect,
  UiShareAction,
  UiTextField,
  uiOption,
  uiSetSummary,
} from "@/app/ui/controls";
import {
  UiActionRow,
  UiMetricGroup,
  UiPrimaryResult,
  UiRangeMarker,
  UiStatus,
  UiStatusWord,
  UiUnitGrid,
  type UiMetric,
} from "@/app/ui/display";
import { ToolFieldRow, ToolResult, ToolWorkbench } from "@/app/ui/tools/tool-workbench";
import {
  FREE_TRIAL_EXAMPLE_INPUT,
  TRIAL_MAX_COHORTS,
  calculateFreeTrialConversion,
  freeTrialShareParams,
  type FreeTrialErrors,
  type FreeTrialInput,
  type FreeTrialValues,
  type TrialCohortRowInput,
  type TrialMaturity,
  type TrialRate,
  type TrialType,
} from "@/lib/free-trial-conversion-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import { PUBLISHED_WINDOW_DAYS, publishedRanges } from "./published-figures";
import styles from "./free-trial-conversion-calculator.module.css";

type Shown = { input: FreeTrialInput; values: FreeTrialValues | null };
type TextKey = Exclude<keyof FreeTrialInput, "cohorts" | "trialType" | "currency">;

const trialTypeOptions = [
  uiOption("noCard", "No card"),
  uiOption("cardUpfront", "Card upfront"),
  uiOption("freePlan", "Free plan"),
];
const currencyOptions = SAAS_ECONOMICS_CURRENCIES.map((currency) => uiOption(currency, currency));
const advancedKeys: readonly TextKey[] = ["windowDays", "ageDays", "activated", "targetRate", "monthlyPrice", "annualPrice", "annualAccounts"];
const basicKeys = new Set(["form", "trialType", "starts", "paid"]);
const focusOrder = ["trialType", "starts", "paid", "windowDays", "ageDays", "activated", "targetRate", "currency", "monthlyPrice", "annualPrice", "annualAccounts"];

/* ---------------- formatting ---------------- */

function formatInteger(value: bigint): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatHundredths(hundredths: bigint): string {
  const fraction = (hundredths % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${formatInteger(hundredths / 100n)}${fraction ? `.${fraction}` : ""}%`;
}

function formatRate(rate: TrialRate): string {
  if (rate.kind === "none") return "—";
  return rate.roundedToZero ? "Under 0.01%" : formatHundredths(rate.hundredths);
}

function rateNumber(rate: TrialRate): number {
  return rate.kind === "rate" ? Number(rate.hundredths) / 100 : NaN;
}

function currencySymbol(currency: SaasEconomicsCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatMoney(cents: bigint, currency: SaasEconomicsCurrency): string {
  return `${currencySymbol(currency)}${formatInteger(cents / 100n)}.${(cents % 100n).toString().padStart(2, "0")}`;
}

function startsWord(type: TrialType, plural = true): string {
  if (type === "freePlan") return plural ? "free signups" : "free signup";
  return plural ? "trial starts" : "trial start";
}

/* ---------------- input helpers ---------------- */

let rowCounter = 0;
function emptyRow(): TrialCohortRowInput {
  rowCounter += 1;
  return { id: `cohort-${rowCounter}`, name: "", starts: "", paid: "", ageDays: "" };
}

function rowIsBlank(row: TrialCohortRowInput): boolean {
  return [row.name, row.starts, row.paid, row.ageDays].every((value) => value.trim() === "");
}

function advancedCount(input: FreeTrialInput): number {
  const filled = advancedKeys.filter((key) => input[key].trim() !== "").length;
  const priced = input.monthlyPrice.trim() !== "" || input.annualPrice.trim() !== "";
  return filled + (priced ? 1 : 0) + input.cohorts.filter((row) => !rowIsBlank(row)).length;
}

function hasAdvancedError(errors: FreeTrialErrors): boolean {
  return Object.keys(errors).some((key) => !basicKeys.has(key));
}

function firstErrorKey(errors: FreeTrialErrors, input: FreeTrialInput): string | null {
  const rowKeys = input.cohorts.flatMap((_, index) => ["name", "starts", "paid", "ageDays"].map((field) => `cohorts.${index}.${field}`));
  return [...focusOrder, ...rowKeys, "cohorts"].find((key) => key in errors) ?? null;
}

function calculate(input: FreeTrialInput) {
  try {
    return calculateFreeTrialConversion(input);
  } catch {
    return null;
  }
}

/* ---------------- the tool ---------------- */

export function FreeTrialConversionCalculator({ initialInput }: { initialInput?: FreeTrialInput }) {
  const shared = initialInput !== undefined;
  const [first] = useState(() => {
    const input = initialInput ?? { ...FREE_TRIAL_EXAMPLE_INPUT, cohorts: [] };
    const calculation = calculate(input);
    return {
      input,
      shown: { input, values: calculation?.status === "valid" ? calculation.values : null } satisfies Shown,
      errors: shared ? calculation?.errors ?? {} : {},
    };
  });
  const [input, setInput] = useState<FreeTrialInput>(first.input);
  const [shown, setShown] = useState<Shown>(first.shown);
  const [errors, setErrors] = useState<FreeTrialErrors>(first.errors);
  const [isExample, setIsExample] = useState(!shared);
  const [isStale, setIsStale] = useState(false);
  const [failed, setFailed] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(hasAdvancedError(first.errors));
  const [focusTarget, setFocusTarget] = useState<string | null>(shared ? firstErrorKey(first.errors, first.input) : null);
  const formRef = useRef<HTMLFormElement>(null);
  const answerRef = useRef<HTMLOutputElement>(null);

  // Focus waits for a render, so a field inside Advanced exists before it gets focus.
  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget === "answer") answerRef.current?.focus();
    else {
      const target = focusTarget === "cohorts"
        ? formRef.current?.querySelector<HTMLElement>("[data-repeatable-add]")
        : formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusTarget}"]`);
      target?.focus();
    }
    setFocusTarget(null);
  }, [focusTarget]);

  function edit(next: FreeTrialInput, clearKeys: string[]) {
    setInput(next);
    setIsStale(true);
    setFailed(false);
    if (clearKeys.some((key) => key in errors)) {
      setErrors((current) => {
        const rest = { ...current };
        for (const key of clearKeys) delete rest[key as keyof FreeTrialErrors];
        return rest;
      });
    }
  }

  function setField(key: TextKey | "trialType" | "currency", value: string) {
    edit({ ...input, [key]: value }, [key]);
  }

  function setRow(id: string, field: keyof Omit<TrialCohortRowInput, "id">, value: string) {
    const index = input.cohorts.findIndex((row) => row.id === id);
    edit(
      { ...input, cohorts: input.cohorts.map((row) => (row.id === id ? { ...row, [field]: value } : row)) },
      [`cohorts.${index}.${field}`, ...(field === "ageDays" ? ["windowDays"] : [])],
    );
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const calculation = calculate(input);
    if (!calculation) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setErrors(calculation.errors);
    if (calculation.status === "valid") {
      setShown({ input, values: calculation.values });
      setIsExample(false);
      setIsStale(false);
    }
    const firstError = firstErrorKey(calculation.errors, input);
    // Open Advanced whenever it holds an error, even when focus goes to a Basic field first.
    if (hasAdvancedError(calculation.errors)) setAdvancedOpen(true);
    setFocusTarget(firstError ?? "answer");
  }

  function reset() {
    const example = { ...FREE_TRIAL_EXAMPLE_INPUT, cohorts: [] };
    const calculation = calculate(example);
    setInput(example);
    setShown({ input: example, values: calculation?.status === "valid" ? calculation.values : null });
    setErrors({});
    setIsExample(true);
    setIsStale(false);
    setFailed(false);
    setAdvancedOpen(false);
  }

  const type = (TRIAL_TYPES_SET.has(input.trialType) ? input.trialType : "noCard") as TrialType;
  const startsLabel = type === "freePlan" ? "Free signups" : "Trial starts";
  const currency = (SAAS_ECONOMICS_CURRENCIES as readonly string[]).includes(input.currency)
    ? input.currency as SaasEconomicsCurrency : "USD";
  const atMax = input.cohorts.length >= TRIAL_MAX_COHORTS;
  // Advanced fields that become required once their partner is filled.
  const needsWindow = [input.ageDays, ...input.cohorts.map((row) => row.ageDays)].some((value) => value.trim() !== "");
  const needsPrices = input.annualAccounts.trim() !== "";
  const needsAnnualAccounts = input.monthlyPrice.trim() !== "" && input.annualPrice.trim() !== "";

  return (
    <ToolWorkbench label="Free trial conversion calculator">
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <UiChoiceGroup
          dataFocusKey="trialType"
          error={errors.trialType}
          hint="Card upfront means people enter payment details to start the trial."
          label="Trial type"
          required
          onChange={(value) => setField("trialType", value)}
          options={trialTypeOptions}
          value={input.trialType}
        />
        <ToolFieldRow>
          <UiTextField
            dataFocusKey="starts"
            error={errors.starts}
            hint="Everyone who started in one period, such as August, counting each account once."
            inputMode="numeric"
            label={startsLabel}
            onChange={(value) => setField("starts", value)}
            required
            value={input.starts}
          />
          <UiTextField
            dataFocusKey="paid"
            error={errors.paid}
            hint="Accounts from those starts whose first payment went through."
            inputMode="numeric"
            label="Paid"
            onChange={(value) => setField("paid", value)}
            required
            value={input.paid}
          />
        </ToolFieldRow>

        <UiDisclosure
          isExpanded={advancedOpen}
          label="Window, activation, revenue, and cohorts"
          onExpandedChange={setAdvancedOpen}
          summary={uiSetSummary(advancedCount(input))}
        >
          <div className={styles.advanced}>
            <ToolFieldRow>
              <UiTextField
                dataFocusKey="windowDays"
                error={errors.windowDays}
                hint="Days each account had to pay, counted from its own start."
                inputMode="numeric"
                label="Follow-up window"
                onChange={(value) => setField("windowDays", value)}
                required={needsWindow}
                suffix="days"
                value={input.windowDays}
              />
              <UiTextField
                dataFocusKey="ageDays"
                error={errors.ageDays}
                hint="Days from this cohort's last start to the day you counted paid."
                inputMode="numeric"
                label="Cohort age"
                onChange={(value) => edit({ ...input, ageDays: value }, ["ageDays", "windowDays"])}
                suffix="days"
                value={input.ageDays}
              />
              <UiTextField
                dataFocusKey="activated"
                error={errors.activated}
                hint="Starts that reached your activation event, counting everyone who paid."
                inputMode="numeric"
                label="Activated"
                onChange={(value) => setField("activated", value)}
                value={input.activated}
              />
              <UiTextField
                dataFocusKey="targetRate"
                error={errors.targetRate}
                hint="The conversion rate you're aiming for."
                inputMode="decimal"
                label="Target conversion"
                onChange={(value) => setField("targetRate", value)}
                suffix="%"
                value={input.targetRate}
              />
            </ToolFieldRow>
            <ToolFieldRow>
              <UiSelect
                dataFocusKey="currency"
                error={errors.currency}
                label="Currency"
                onChange={(value) => setField("currency", value)}
                options={currencyOptions}
                value={input.currency || "USD"}
              />
              <UiTextField
                dataFocusKey="monthlyPrice"
                error={errors.monthlyPrice}
                hint="Average monthly plan price for a new customer, without one-time fees."
                inputMode="decimal"
                label="Monthly price"
                onChange={(value) => edit({ ...input, monthlyPrice: value }, ["monthlyPrice", "annualAccounts"])}
                required={needsPrices}
                suffix={currency}
                value={input.monthlyPrice}
              />
              <UiTextField
                dataFocusKey="annualPrice"
                error={errors.annualPrice}
                hint="Average yearly plan price, which counts as a twelfth each month."
                inputMode="decimal"
                label="Annual price"
                onChange={(value) => edit({ ...input, annualPrice: value }, ["annualPrice", "annualAccounts"])}
                required={needsPrices}
                suffix={currency}
                value={input.annualPrice}
              />
              <UiTextField
                dataFocusKey="annualAccounts"
                error={errors.annualAccounts}
                hint="How many of the paid accounts chose a yearly plan."
                inputMode="numeric"
                label="On annual plans"
                onChange={(value) => setField("annualAccounts", value)}
                required={needsAnnualAccounts}
                value={input.annualAccounts}
              />
            </ToolFieldRow>
            <div className={styles.cohorts}>
              <div className={styles.cohortsLabel}>
                <span>Other cohorts</span>
                <UiHint label="Other cohorts" text="Earlier months, channels, or plans, each with its own accounts." />
              </div>
              <UiRepeatableList
                addDescription={errors.cohorts ?? (atMax ? "Up to 12 cohorts" : undefined)}
                addDescriptionIsError={Boolean(errors.cohorts)}
                addDisabled={atMax}
                addLabel="Add cohort"
                ariaLabel="Other cohorts"
                items={input.cohorts}
                onAdd={() => edit({ ...input, cohorts: [...input.cohorts, emptyRow()] }, [])}
                onRemove={(id) => {
                  // Row errors are keyed by position, so they no longer match after a removal.
                  setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith("cohorts"))));
                  edit({ ...input, cohorts: input.cohorts.filter((row) => row.id !== id) }, []);
                }}
                removeLabel={(row, index) => `Remove ${row.name.trim() || `cohort ${index + 2}`}`}
                renderItem={(row, index) => (
                  <div aria-label={row.name.trim() || `Cohort ${index + 2}`} className={styles.cohortRow} role="group">
                    <UiTextField
                      dataFocusKey={`cohorts.${index}.name`}
                      error={errors[`cohorts.${index}.name`]}
                      label="Name"
                      onChange={(value) => setRow(row.id, "name", value)}
                      placeholder={`Cohort ${index + 2}`}
                      value={row.name}
                    />
                    <UiTextField
                      dataFocusKey={`cohorts.${index}.starts`}
                      error={errors[`cohorts.${index}.starts`]}
                      inputMode="numeric"
                      label={startsLabel}
                      onChange={(value) => setRow(row.id, "starts", value)}
                      required={!rowIsBlank(row)}
                      value={row.starts}
                    />
                    <UiTextField
                      dataFocusKey={`cohorts.${index}.paid`}
                      error={errors[`cohorts.${index}.paid`]}
                      inputMode="numeric"
                      label="Paid"
                      onChange={(value) => setRow(row.id, "paid", value)}
                      required={!rowIsBlank(row)}
                      value={row.paid}
                    />
                    <UiTextField
                      dataFocusKey={`cohorts.${index}.ageDays`}
                      error={errors[`cohorts.${index}.ageDays`]}
                      inputMode="numeric"
                      label="Age"
                      onChange={(value) => setRow(row.id, "ageDays", value)}
                      suffix="days"
                      value={row.ageDays}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </UiDisclosure>

        <UiActionRow>
          {failed ? <UiStatus tone="danger">Couldn&apos;t calculate. Try again.</UiStatus> : isStale ? <UiStatus>Inputs changed</UiStatus> : null}
          <UiButton type="submit" variant="primary">Calculate conversion</UiButton>
          <UiButton onPress={reset} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </UiButton>
        </UiActionRow>
        {errors.form ? <UiStatus tone="danger">{errors.form}</UiStatus> : null}
      </form>

      <ToolResult label="Conversion result" stale={isStale}>
        <ResultView answerRef={answerRef} isExample={isExample} shown={shown} />
      </ToolResult>
    </ToolWorkbench>
  );
}

const TRIAL_TYPES_SET = new Set<string>(["noCard", "cardUpfront", "freePlan"]);

/* ---------------- the result ---------------- */

function maturityWord(maturity: TrialMaturity) {
  if (maturity.status === "complete") return <UiStatusWord>Complete</UiStatusWord>;
  if (maturity.status === "provisional") {
    return <UiStatusWord tone="warning">Provisional, {formatInteger(maturity.daysLeft)} {maturity.daysLeft === 1n ? "day" : "days"} left</UiStatusWord>;
  }
  return null;
}

function ResultView({ answerRef, isExample, shown }: {
  answerRef: RefObject<HTMLOutputElement | null>;
  isExample: boolean;
  shown: Shown;
}) {
  const { values } = shown;
  const type = (values?.trialType ?? (TRIAL_TYPES_SET.has(shown.input.trialType) ? shown.input.trialType : "noCard")) as TrialType;
  const label = type === "freePlan" ? "Free signup to paid" : "Trial to paid";
  const hasRate = values?.rate.kind === "rate";
  const rate = values ? rateNumber(values.rate) : NaN;
  const status = isExample ? <UiStatusWord>Example</UiStatusWord> : values ? maturityWord(values.maturity) : null;

  const detail = !values
    ? "Enter your counts and calculate"
    : !hasRate
      ? `No ${startsWord(type)}`
      : `${formatInteger(values.paid)} of ${formatInteger(values.starts)} ${startsWord(type, values.starts !== 1n)} paid${values.windowDays !== null ? ` within ${formatInteger(values.windowDays)} days` : ""}`;

  const target = values?.target ?? null;
  const targetText = target ? formatHundredths(target.hundredths) : "";
  const targetAmount = target ? Number(target.hundredths) / 100 : NaN;

  const metrics: UiMetric[] = [
    { id: "not-paid", label: "Didn't pay", value: values ? formatInteger(values.notPaid) : "—" },
    {
      id: "per-paid",
      label: type === "freePlan" ? "Signups per paying customer" : "Trials per paying customer",
      hint: `How many ${startsWord(type)} it took, on average, for each one that paid.`,
      value: values?.trialsPerPaidTenths != null ? `${formatInteger(values.trialsPerPaidTenths / 10n)}.${values.trialsPerPaidTenths % 10n}` : "—",
    },
  ];
  if (values?.revenue) {
    const { currency } = values.revenue;
    metrics.push(
      { id: "mrr", label: "New MRR", hint: "Paid accounts × their monthly amount, with annual plans as a twelfth.", value: formatMoney(values.revenue.mrrCents, currency) },
      { id: "arr", label: "ARR run rate", hint: "New MRR × 12, a run rate, not revenue earned this year.", value: formatMoney(values.revenue.arrRunRateCents, currency) },
    );
  }
  if (target) {
    metrics.push({ id: "extra-paid", label: `Extra paid at ${targetText}`, value: formatInteger(target.extraPaid) });
    if (target.extraMrrCents !== null && values?.revenue) {
      metrics.push({ id: "extra-mrr", label: `Extra MRR at ${targetText}`, value: formatMoney(target.extraMrrCents, values.revenue.currency) });
    }
  }
  if (values?.cohorts) metrics.push(allCohortsMetric(values.cohorts, values.windowDays));

  // The published ranges count paid within six months. A different window isn't the same measure,
  // so it gets no range. An unset window keeps them, and their labels name the six months.
  const { bands: publishedBands, scaleMax } = publishedRanges[type];
  const windowDays = values?.windowDays ?? null;
  const windowMatches = windowDays === null || (windowDays >= PUBLISHED_WINDOW_DAYS.min && windowDays <= PUBLISHED_WINDOW_DAYS.max);
  const bands = windowMatches ? publishedBands : [];
  const high = values?.likely ? Number(values.likely.highHundredths) / 100 : 0;
  const max = high > scaleMax ? Math.min(100, Math.ceil(high / 10) * 10) : scaleMax;

  return (
    <>
      <div className={styles.summary}>
        <div className={styles.answer}>
          <UiPrimaryResult
            detail={<span className={styles.detail}>{detail}{status ? <span className={styles.status}>{status}</span> : null}</span>}
            inputRef={answerRef}
            label={label}
            value={values ? formatRate(values.rate) : "—"}
          />
        </div>
        <div className={styles.grid}>
          <UiUnitGrid
            ariaLabel={`Paid out of every 100 ${startsWord(type)}`}
            emptyLabel="Didn't pay"
            filled={Number.isFinite(rate) ? rate : 0}
            filledLabel="Paid"
            target={target && targetAmount > rate ? { amount: targetAmount, label: `At ${targetText}`, valueText: `${targetText.replace("%", "")} of every 100` } : undefined}
            valueText={hasRate ? `${formatRate(values!.rate).replace("%", "")} of every 100` : "none"}
          />
        </div>
        <div className={styles.position}>
          <UiRangeMarker
            ariaLabel={bands.length ? "Your conversion rate next to published ranges" : "Your conversion rate and its likely range"}
            bands={bands}
            max={max}
            maxText={`${max}%`}
            minText="0%"
            range={values?.likely ? {
              from: Number(values.likely.lowHundredths) / 100,
              to: Number(values.likely.highHundredths) / 100,
              label: `Likely range at ${formatInteger(values.starts)} ${startsWord(type, values.starts !== 1n)}`,
              valueText: `${formatHundredths(values.likely.lowHundredths).replace("%", "")} to ${formatHundredths(values.likely.highHundredths)}`,
              hint: "Your true rate probably sits here, and fewer starts widen it.",
            } : undefined}
            value={rate}
            valueText={values ? formatRate(values.rate) : "—"}
          />
          {!windowMatches && windowDays !== null ? (
            <UiStatusWord>No published range for a {formatInteger(windowDays)}-day window</UiStatusWord>
          ) : null}
        </div>
        <div className={styles.numbers}>
          <UiMetricGroup ariaLabel="Supporting numbers" items={metrics} layout="list" />
        </div>
      </div>

      {values?.activation ? <FunnelChart type={type} values={values} /> : null}
      {values?.cohorts ? <CohortChart values={values} /> : null}

      {values ? (
        <div className={styles.share}>
          <UiShareAction params={freeTrialShareParams(shown.input)} />
        </div>
      ) : null}
    </>
  );
}

function allCohortsMetric(cohorts: NonNullable<FreeTrialValues["cohorts"]>, windowDays: bigint | null): UiMetric {
  const { combined, rows } = cohorts;
  const counts = `${formatInteger(combined.paid)} of ${formatInteger(combined.starts)} starts`;
  let hint = `${counts} across every cohort.`;
  if (combined.basis === "settled" && combined.leftOut > 0 && windowDays !== null) {
    const left = rows.filter((row) => row.maturity.status === "provisional").map((row) => row.name);
    const names = left.length === 1 ? left[0] : `${left.slice(0, -1).join(", ")} and ${left.at(-1)}`;
    hint = `${counts}, leaving out ${names} until ${left.length === 1 ? "it has" : "they have"} had ${formatInteger(windowDays)} days.`;
  } else if (combined.status === "provisional") {
    hint = `${counts}, all from cohorts still inside the window.`;
  }
  return { id: "all-cohorts", label: "All cohorts", hint, value: formatRate(combined.rate) };
}

function FunnelChart({ type, values }: { type: TrialType; values: FreeTrialValues }) {
  const activation = values.activation!;
  const share = (rate: TrialRate) => (rate.kind === "rate" ? `, ${formatRate(rate)}` : "");
  const spec: UiChartSpec = {
    kind: "funnel",
    title: `Where ${startsWord(type)} drop off`,
    format: "number",
    height: 260,
    stages: [
      { id: "starts", label: type === "freePlan" ? "Free signups" : "Trial starts", value: Number(values.starts) },
      { id: "activated", label: `Activated${share(activation.activationRate)}`, value: Number(activation.activated) },
      { id: "paid", label: `Paid${share(activation.activatedToPaid)}`, value: Number(values.paid) },
    ],
  };
  return <UiLiveChart spec={spec} />;
}

function CohortChart({ values }: { values: FreeTrialValues }) {
  const rows = values.cohorts!.rows;
  const spec: UiChartSpec = {
    kind: "horizontal-bar",
    title: values.windowDays !== null ? `Paid within ${formatInteger(values.windowDays)} days, by cohort` : "Paid, by cohort",
    format: "percent",
    height: Math.max(260, rows.length * 40 + 48),
    // Long names would squeeze the bars on phones, so the axis shows a short name and the status on a second line.
    categories: rows.map((row) => {
      const name = row.name.length > 18 ? `${row.name.slice(0, 17).trimEnd()}…` : row.name;
      if (row.rate.kind === "none") return `${name}\nno starts`;
      if (row.maturity.status === "provisional") return `${name}\n${formatInteger(row.maturity.daysLeft)} ${row.maturity.daysLeft === 1n ? "day" : "days"} left`;
      return name;
    }),
    series: [{ id: "rate", label: "Paid", values: rows.map((row) => (row.rate.kind === "rate" ? Number(row.rate.hundredths) / 100 : 0)) }],
  };
  return <UiLiveChart spec={spec} />;
}
