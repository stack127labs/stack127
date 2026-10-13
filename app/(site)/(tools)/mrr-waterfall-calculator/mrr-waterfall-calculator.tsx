"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { UiButton, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  MRR_WATERFALL_CURRENCIES,
  calculateMrrWaterfall,
  type MrrWaterfallCurrency,
  type MrrWaterfallErrors,
  type MrrWaterfallField,
  type MrrWaterfallValues,
} from "@/lib/mrr-waterfall-calculator/engine";
import styles from "./mrr-waterfall-calculator.module.css";

type Draft = {
  month: string;
  currency: string;
  startingMrr: string;
  newMrr: string;
  expansionMrr: string;
  reactivationMrr: string;
  contractionMrr: string;
  churnedMrr: string;
};

const EMPTY_DRAFT: Draft = {
  month: "",
  currency: "USD",
  startingMrr: "",
  newMrr: "",
  expansionMrr: "",
  reactivationMrr: "",
  contractionMrr: "",
  churnedMrr: "",
};

const FIELDS_IN_ORDER: MrrWaterfallField[] = [
  "month",
  "currency",
  "startingMrr",
  "newMrr",
  "expansionMrr",
  "reactivationMrr",
  "contractionMrr",
  "churnedMrr",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatMoneyCents(cents: number, currency: MrrWaterfallCurrency) {
  const absoluteCents = Math.abs(cents);
  const whole = Math.trunc(absoluteCents / 100);
  const fraction = String(absoluteCents % 100).padStart(2, "0");
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.formatToParts(whole)
    .map((part) => part.type === "fraction" ? fraction : part.value)
    .join("");
}

function formatSignedMoneyCents(cents: number, currency: MrrWaterfallCurrency) {
  if (cents > 0) return "+" + formatMoneyCents(cents, currency);
  if (cents < 0) return "-" + formatMoneyCents(cents, currency);
  return formatMoneyCents(0, currency);
}

function monthName(month: string) {
  const [year, monthNumber] = month.split("-");
  return MONTH_NAMES[Number(monthNumber) - 1] + " " + year;
}

function focusFirstInvalidField(form: HTMLFormElement | null, errors: MrrWaterfallErrors) {
  const firstField = FIELDS_IN_ORDER.find((field) => errors[field]);
  if (!firstField) return;
  requestAnimationFrame(() => {
    form?.querySelector<HTMLElement>(`[data-focus-key="${firstField}"]`)?.focus();
  });
}

type WaterfallChartProps = { values: MrrWaterfallValues };

function WaterfallChart({ values }: WaterfallChartProps) {
  const bars = [
    { id: "startingMrr", kind: "anchor" as const, fromCents: 0, toCents: values.startingCents },
    ...values.steps.map((step) => ({
      id: step.id,
      kind: step.signedCents > 0 ? "addition" as const : step.signedCents < 0 ? "reduction" as const : "zero" as const,
      fromCents: step.fromCents,
      toCents: step.toCents,
    })),
    { id: "endingMrr", kind: "anchor" as const, fromCents: 0, toCents: values.endingCents },
  ];
  const levels = [values.startingCents, ...values.steps.map((step) => step.toCents), values.endingCents];
  const maximumBalance = Math.max(...levels);
  const baseline = 226;
  const plotHeight = 178;
  const barWidth = 38;
  const centers = bars.map((_, index) => 103 + index * 108);
  const yForBalance = (balance: number) => maximumBalance === 0
    ? baseline
    : baseline - (balance / maximumBalance) * plotHeight;
  const labels = [
    ["Starting", "MRR"],
    ["New", "MRR"],
    ["Expansion", "MRR"],
    ["Reactivation", "MRR"],
    ["Contraction", "MRR"],
    ["Churned", "MRR"],
    ["Ending", "MRR"],
  ];

  return (
    <figure aria-labelledby="mrr-waterfall-figure-title" className={styles.figure}>
      <h3 id="mrr-waterfall-figure-title">Running MRR waterfall</h3>
      <div aria-hidden="true" className={styles.chartViewport} data-waterfall-viewport>
        <svg aria-hidden="true" className={styles.chartSvg} focusable="false" viewBox="0 0 860 304">
          <line className={styles.baseline} x1="62" x2="812" y1={baseline} y2={baseline} />
          <text className={styles.axisLabel} textAnchor="end" x="51" y={baseline + 5}>0</text>
          {bars.slice(0, -1).map((_, index) => (
            <line
              className={styles.connector}
              key={`connector-${index}`}
              x1={centers[index] + barWidth / 2}
              x2={centers[index + 1] - barWidth / 2}
              y1={yForBalance(levels[index])}
              y2={yForBalance(levels[index])}
            />
          ))}
          {bars.map((bar, index) => {
            const fromY = yForBalance(bar.fromCents);
            const toY = yForBalance(bar.toCents);
            const height = Math.abs(fromY - toY);
            if (height === 0) return null;
            const className = bar.kind === "anchor"
              ? styles.anchorBar
              : bar.kind === "addition"
                ? styles.additionBar
                : bar.kind === "reduction"
                  ? styles.reductionBar
                  : styles.zeroBar;
            return (
              <rect
                className={className}
                height={height}
                key={bar.id}
                width={barWidth}
                x={centers[index] - barWidth / 2}
                y={Math.min(fromY, toY)}
              />
            );
          })}
          {labels.map((label, index) => (
            <text className={styles.stageLabel} key={bars[index].id} textAnchor="middle" x={centers[index]} y="258">
              <tspan x={centers[index]}>{label[0]}</tspan>
              <tspan dy="17" x={centers[index]}>{label[1]}</tspan>
            </text>
          ))}
        </svg>
      </div>
      <figcaption>
        Each bar follows the running balance for {monthName(values.month)}. Additions and reductions use separate colors; the table gives exact amounts.
      </figcaption>
    </figure>
  );
}

function waterfallTableRows(values: MrrWaterfallValues) {
  return values.stages.map((stage) => ({
    id: stage.id,
    cells: {
      stage: stage.label,
      movement: stage.signedCents === null
        ? "Not applicable"
        : <span className={styles.money}>{formatSignedMoneyCents(stage.signedCents, values.currency)}</span>,
      balance: <span className={styles.money}>{formatMoneyCents(stage.balanceCents, values.currency)}</span>,
    },
  }));
}

export function MrrWaterfallCalculator() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<MrrWaterfallErrors>({});
  const [result, setResult] = useState<MrrWaterfallValues | null>(null);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "warning">("neutral");
  const formRef = useRef<HTMLFormElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function clearForEdit() {
    const hadResult = result !== null;
    setResult(null);
    setErrors({});
    setStatusTone("neutral");
    setStatus(hadResult ? "Inputs changed. Calculate again." : "");
  }

  function updateField(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    clearForEdit();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setStatusTone("neutral");
    try {
      const calculation = calculateMrrWaterfall(draft);
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        focusFirstInvalidField(formRef.current, calculation.errors);
        return;
      }

      setErrors({});
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setErrors({});
      setResult(null);
      setStatusTone("warning");
      setStatus("The bridge could not be calculated. Try again.");
    }
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setResult(null);
    setStatusTone("neutral");
    setStatus("Calculator reset.");
    requestAnimationFrame(() => monthRef.current?.focus());
  }

  return (
    <section aria-label="MRR inputs and results" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="MRR waterfall inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <div className={styles.periodFields}>
            <UiTextField
              autoCapitalize="off"
              dataFocusKey="month"
              error={errors.month ?? null}
              inputMode="text"
              inputRef={monthRef}
              label="Reporting month"
              onChange={(value) => updateField("month", value)}
              placeholder="YYYY-MM"
              required
              spellCheck={false}
              value={draft.month}
            />
            <UiSelect
              dataFocusKey="currency"
              description="Labels all amounts; it does not convert them."
              error={errors.currency ?? null}
              label="Currency"
              onChange={(value) => updateField("currency", value)}
              options={MRR_WATERFALL_CURRENCIES.map((code) => uiOption(code, code))}
              required
              value={draft.currency}
            />
          </div>

          <section aria-labelledby="mrr-waterfall-inputs-title" className={styles.amountsGroup}>
            <div className={styles.amountHeading}>
              <h2 id="mrr-waterfall-inputs-title">MRR amounts</h2>
              <span>{draft.currency}</span>
            </div>
            <div className={styles.startingField}>
              <UiTextField
                autoCapitalize="off"
                dataFocusKey="startingMrr"
                error={errors.startingMrr ?? null}
                inputMode="decimal"
                label="Starting MRR"
                onChange={(value) => updateField("startingMrr", value)}
                required
                spellCheck={false}
                value={draft.startingMrr}
              />
            </div>

            <p className={styles.guidance}>Enter 0 if a movement did not occur.</p>

            <section aria-labelledby="mrr-additions-title" className={styles.movementGroup}>
              <h3 id="mrr-additions-title">Added during the month</h3>
              <div className={styles.movementFields}>
                <UiTextField
                  autoCapitalize="off"
                  dataFocusKey="newMrr"
                  error={errors.newMrr ?? null}
                  inputMode="decimal"
                  label="New MRR"
                  onChange={(value) => updateField("newMrr", value)}
                  required
                  spellCheck={false}
                  value={draft.newMrr}
                />
                <UiTextField
                  autoCapitalize="off"
                  dataFocusKey="expansionMrr"
                  error={errors.expansionMrr ?? null}
                  inputMode="decimal"
                  label="Expansion MRR"
                  onChange={(value) => updateField("expansionMrr", value)}
                  required
                  spellCheck={false}
                  value={draft.expansionMrr}
                />
                <UiTextField
                  autoCapitalize="off"
                  dataFocusKey="reactivationMrr"
                  error={errors.reactivationMrr ?? null}
                  inputMode="decimal"
                  label="Reactivation MRR"
                  onChange={(value) => updateField("reactivationMrr", value)}
                  required
                  spellCheck={false}
                  value={draft.reactivationMrr}
                />
              </div>
            </section>

            <section aria-labelledby="mrr-losses-title" className={styles.movementGroup}>
              <h3 id="mrr-losses-title">Lost during the month</h3>
              <div className={styles.movementFields}>
                <UiTextField
                  autoCapitalize="off"
                  dataFocusKey="contractionMrr"
                  error={errors.contractionMrr ?? null}
                  inputMode="decimal"
                  label="Contraction MRR"
                  onChange={(value) => updateField("contractionMrr", value)}
                  required
                  spellCheck={false}
                  value={draft.contractionMrr}
                />
                <UiTextField
                  autoCapitalize="off"
                  dataFocusKey="churnedMrr"
                  error={errors.churnedMrr ?? null}
                  inputMode="decimal"
                  label="Churned MRR"
                  onChange={(value) => updateField("churnedMrr", value)}
                  required
                  spellCheck={false}
                  value={draft.churnedMrr}
                />
              </div>
            </section>
          </section>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate MRR waterfall</UiButton>
            <UiButton onPress={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>

          {status ? <UiStatus tone={statusTone}>{status}</UiStatus> : null}
        </form>

        {result ? (
          <section aria-label="MRR waterfall result" className={styles.results}>
            <UiPrimaryResult
              detail={`For ${monthName(result.month)} in ${result.currency}.`}
              inputRef={resultRef}
              label="Ending MRR"
              value={formatMoneyCents(result.endingCents, result.currency)}
            />
            <p className={styles.netNew}>
              <span>Net new MRR</span>
              <strong className={styles.money}>{formatSignedMoneyCents(result.netNewCents, result.currency)}</strong>
            </p>

            <section aria-labelledby="mrr-waterfall-results-title" className={styles.waterfallRegion}>
              <h2 id="mrr-waterfall-results-title">How MRR changed</h2>
              <WaterfallChart values={result} />
              <UiDataTable
                ariaLabel="MRR waterfall values"
                caption="Exact signed movement and running balance amounts for the waterfall."
                columns={[
                  { id: "stage", label: "MRR stage" },
                  { id: "movement", label: "Movement", align: "right" },
                  { id: "balance", label: "Balance after stage", align: "right" },
                ]}
                rows={waterfallTableRows(result)}
              />
            </section>
          </section>
        ) : null}
      </div>
    </section>
  );
}
