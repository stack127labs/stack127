"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent, type RefObject } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiRepeatableList, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import {
  UiActionRow,
  UiDataTable,
  UiKeyValueList,
  UiPrimaryResult,
  UiStatus,
  UiStatusWord,
} from "@/app/ui/display";
import {
  TRIAL_MAX_COHORTS,
  calculateFreeTrialConversion,
  type FreeTrialConversionErrors,
  type FreeTrialConversionInput,
  type FreeTrialConversionValues,
  type TrialCohortField,
  type TrialCohortInput,
  type TrialConversionRate,
  type TrialFieldKey,
  type TrialModel,
  type TrialMrrMethod,
} from "@/lib/free-trial-conversion-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import { PUBLISHED_FIGURES } from "./published-figures";
import styles from "./free-trial-conversion-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };
type CohortDraft = TrialCohortInput & { id: string };
type FormFields = Omit<FreeTrialConversionInput, "cohorts">;

const CHANGED = "Inputs changed. Calculate again.";

const MODEL_OPTIONS = [
  uiOption("trialNoCard", "Free trial, no card", "They try it without entering a card."),
  uiOption("trialCardRequired", "Free trial, card upfront", "They enter a card to start, and they're charged when the trial ends unless they cancel."),
  uiOption("freemium", "Free plan", "They sign up for a free plan with no end date."),
];

function emptyCohort(id: string): CohortDraft {
  return { id, label: "", starts: "", paid: "", ageDays: "" };
}

function emptyFields(): FormFields {
  return {
    model: "trialNoCard",
    windowDays: "",
    includeMrr: false,
    currency: "USD",
    mrrMethod: "average",
    averageMonthly: "",
    monthlyCustomers: "",
    monthlyPrice: "",
    annualCustomers: "",
    annualPrice: "",
  };
}

/* ---------------- formatting ---------------- */

const integerFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function formatInteger(value: bigint | number): string {
  return integerFormat.format(value);
}

function currencySymbol(currency: SaasEconomicsCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatMoney(cents: bigint, currency: SaasEconomicsCurrency): string {
  const fraction = (cents % 100n).toString().padStart(2, "0");
  return `${currencySymbol(currency)}${formatInteger(cents / 100n)}.${fraction}`;
}

function formatRate(rate: TrialConversionRate): string {
  if (rate.kind === "notAvailable") return "Not available";
  if (rate.roundedToZero) return "Under 0.01%";
  const fraction = (rate.hundredths % 100n).toString().padStart(2, "0");
  return `${formatInteger(rate.hundredths / 100n)}.${fraction}%`;
}

function days(count: bigint | number): string {
  return `${formatInteger(count)} ${count === 1n || count === 1 ? "day" : "days"}`;
}

function plural(count: number, one: string, many: string): string {
  return `${formatInteger(count)} ${count === 1 ? one : many}`;
}

function cohortName(label: string, index: number): string {
  return label.trim() || `Cohort ${index + 1}`;
}

function windowLabel(raw: string): string | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value >= 1 && value <= 730 ? days(value) : null;
}

function nouns(model: TrialModel) {
  return model === "freemium"
    ? { count: "Free signups", column: "Signups", lower: "free signups", lead: "Free plan to paid", none: "No signups", figures: "Published rates for free plans" }
    : { count: "Trial starts", column: "Starts", lower: "trial starts", lead: "Free trial to paid", none: "No starts", figures: model === "trialCardRequired" ? "Published rates for trials with a card upfront" : "Published rates for trials with no card" };
}

/* ---------------- results ---------------- */

function leadLines(values: FreeTrialConversionValues): { detail: string; maturity: { word: string; tone: "neutral" | "warning"; text: string } | null } {
  const { combined, cohorts, model } = values;
  const noun = nouns(model);
  const window = days(values.windowDays);
  const single = cohorts.length === 1;
  const included = combined.includedIndexes.length;

  let detail: string;
  if (combined.rate.kind === "notAvailable") {
    detail = `${noun.none} in ${single ? "this cohort" : "these cohorts"}, so there's no rate.`;
  } else if (single) {
    detail = `${formatInteger(combined.paid)} of ${formatInteger(combined.starts)} ${noun.lower} paid within ${window}. ${formatInteger(combined.notPaid)} didn't.`;
  } else if (combined.basis === "complete") {
    detail = `${formatInteger(combined.paid)} of ${formatInteger(combined.starts)} ${noun.lower} in ${plural(included, "complete cohort", "complete cohorts")} paid within ${window}.`;
    if (combined.excludedMaturing > 0) {
      detail += combined.excludedMaturing === 1
        ? " 1 newer cohort is left out until its window ends."
        : ` ${formatInteger(combined.excludedMaturing)} newer cohorts are left out until their windows end.`;
    }
  } else {
    detail = `${formatInteger(combined.paid)} of ${formatInteger(combined.starts)} ${noun.lower} across ${plural(included, "cohort", "cohorts")} paid within ${window}.`;
  }

  if (combined.rate.kind === "notAvailable") return { detail, maturity: null };
  if (combined.status === "complete") {
    return {
      detail,
      maturity: {
        word: "Complete",
        tone: "neutral",
        text: single ? `Every account had the full ${window}.` : `Every account in these cohorts had the full ${window}.`,
      },
    };
  }
  const first = cohorts[0];
  const text = single && first.maturity.status === "maturing"
    ? `The last accounts to start have ${formatInteger(first.maturity.daysLeft)} more ${first.maturity.daysLeft === 1n ? "day" : "days"} to pay. This rate can still rise.`
    : `No cohort with starts has had the full ${window} yet.`;
  return { detail, maturity: { word: "Provisional", tone: "warning", text } };
}

function TrialResults({ resultRef, values }: { resultRef: RefObject<HTMLOutputElement | null>; values: FreeTrialConversionValues }) {
  const noun = nouns(values.model);
  const lead = leadLines(values);
  const several = values.cohorts.length > 1;
  const label = several && values.combined.basis === "complete" ? `${noun.lead}, complete cohorts` : noun.lead;
  const figures = PUBLISHED_FIGURES.filter((source) => source.figures[values.model]);
  const mrr = values.newMrr;
  const anyMaturing = values.cohorts.some((cohort) => cohort.maturity.status === "maturing");

  const mrrRows = mrr ? [
    { label: "New MRR", value: formatMoney(mrr.mrrCents, mrr.currency) },
    {
      label: "How",
      value: mrr.method === "average"
        ? `${plural(Number(mrr.paidCustomers), "paid customer", "paid customers")} × ${formatMoney(mrr.averageMonthlyCents ?? 0n, mrr.currency)}`
        : `${formatInteger(mrr.monthlyPlan?.customers ?? 0n)} monthly × ${formatMoney(mrr.monthlyPlan?.priceCents ?? 0n, mrr.currency)} + ${formatInteger(mrr.annualPlan?.customers ?? 0n)} annual × ${formatMoney(mrr.annualPlan?.annualPriceCents ?? 0n, mrr.currency)} ÷ 12`,
    },
    {
      label: "ARR run rate",
      value: (
        <span className={styles.valueLines}>
          <span>{formatMoney(mrr.runRateArrCents, mrr.currency)}</span>
          <span className={styles.helper}>New MRR × 12. Not what you'll earn this year.</span>
        </span>
      ),
    },
  ] : [];
  const mrrNotes = mrr ? [
    mrr.mrrIsRounded ? "Rounded to the cent." : null,
    anyMaturing ? "Includes customers from cohorts that still have days left." : null,
  ].filter((note): note is string => note !== null) : [];

  return (
    <section aria-label="Conversion results" className={styles.results}>
      <UiPrimaryResult
        detail={(
          <span className={styles.valueLines}>
            <span>{lead.detail}</span>
            {lead.maturity ? (
              <span>
                <UiStatusWord tone={lead.maturity.tone}>{lead.maturity.word}</UiStatusWord>{" "}
                {lead.maturity.text}
              </span>
            ) : null}
          </span>
        )}
        inputRef={resultRef}
        label={label}
        value={formatRate(values.combined.rate)}
      />

      {several ? (
        <section aria-labelledby="trial-cohorts-title" className={styles.resultGroup}>
          <h2 id="trial-cohorts-title">By cohort</h2>
          <UiDataTable
            ariaLabel="Conversion by cohort"
            columns={[
              { id: "cohort", label: "Cohort" },
              { id: "starts", label: noun.column, align: "right" },
              { id: "paid", label: "Paid", align: "right" },
              { id: "rate", label: "Rate", align: "right" },
              { id: "status", label: "Status" },
            ]}
            rows={values.cohorts.map((cohort) => ({
              id: String(cohort.index),
              cells: {
                cohort: cohortName(cohort.label, cohort.index),
                starts: formatInteger(cohort.starts),
                paid: formatInteger(cohort.paid),
                rate: formatRate(cohort.rate),
                status: cohort.maturity.status === "complete"
                  ? <UiStatusWord>Complete</UiStatusWord>
                  : <UiStatusWord tone="warning">{`${days(cohort.maturity.daysLeft)} left`}</UiStatusWord>,
              },
            }))}
          />
        </section>
      ) : null}

      {mrr ? (
        <section aria-labelledby="trial-mrr-title" className={styles.resultGroup}>
          <h2 id="trial-mrr-title">New MRR from these customers</h2>
          <UiKeyValueList rows={mrrRows} />
          {mrrNotes.length > 0 ? <p className={styles.helper}>{mrrNotes.join(" ")}</p> : null}
        </section>
      ) : null}

      <section aria-labelledby="trial-figures-title" className={styles.resultGroup}>
        <h2 id="trial-figures-title">{noun.figures}</h2>
        <UiDataTable
          ariaLabel="Published conversion figures"
          columns={[
            { id: "source", label: "Source" },
            { id: "measured", label: "Who was measured" },
            { id: "reported", label: "Reported" },
          ]}
          rows={figures.map((source) => ({
            id: source.id,
            cells: {
              source: (
                <span className={styles.valueLines}>
                  <a href={source.url} rel="noopener" target="_blank">{source.name}</a>
                  <span className={styles.helper}>{source.date}</span>
                </span>
              ),
              measured: source.measured,
              reported: source.figures[values.model],
            },
          }))}
        />
        <p className={styles.helper}>
          Rough guides, not targets. Each source counts conversion its own way. None of these sources reports figures for small indie SaaS by trial type and follow-up window.
        </p>
      </section>
    </section>
  );
}

/* ---------------- form ---------------- */

export function FreeTrialConversionCalculator() {
  const [cohorts, setCohorts] = useState<CohortDraft[]>(() => [emptyCohort("cohort-1")]);
  const [fields, setFields] = useState<FormFields>(emptyFields);
  const [errors, setErrors] = useState<FreeTrialConversionErrors>({});
  const [result, setResult] = useState<FreeTrialConversionValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const nextCohortId = useRef(2);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  const model = fields.model as TrialModel;
  const noun = nouns(model);
  const paidLabel = windowLabel(fields.windowDays);
  const atLimit = cohorts.length >= TRIAL_MAX_COHORTS;
  const split = fields.mrrMethod === "split";

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

  function updateCohort(id: string, field: TrialCohortField, value: string) {
    setCohorts((current) => current.map((cohort) => cohort.id === id ? { ...cohort, [field]: value } : cohort));
    clearForEdit();
  }

  function focusKey(key: string) {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
    });
  }

  function addCohort() {
    if (atLimit) return;
    const cohort = emptyCohort(`cohort-${nextCohortId.current++}`);
    setCohorts((current) => current.length >= TRIAL_MAX_COHORTS ? current : [...current, cohort]);
    clearForEdit(`Cohort ${cohorts.length + 1} added.`);
  }

  function removeCohort(id: string) {
    const index = cohorts.findIndex((cohort) => cohort.id === id);
    const name = index >= 0 ? cohortName(cohorts[index].label, index) : "Cohort";
    if (cohorts.length === 1) {
      // The list always keeps one row, so removing the only cohort clears it.
      const cohort = emptyCohort(`cohort-${nextCohortId.current++}`);
      setCohorts([cohort]);
      clearForEdit(`${name} cleared.`);
      focusKey("cohorts.0.label");
      return;
    }
    setCohorts((current) => current.filter((cohort) => cohort.id !== id));
    clearForEdit(`${name} removed.`);
  }

  function focusFirstError(nextErrors: FreeTrialConversionErrors) {
    const order: TrialFieldKey[] = [
      "model",
      "windowDays",
      ...cohorts.flatMap((_, index) => (["label", "starts", "paid", "ageDays"] as const)
        .map((field) => `cohorts.${index}.${field}` as const)),
      "cohorts",
      "currency",
      "mrrMethod",
      ...(split
        ? ["monthlyCustomers", "monthlyPrice", "annualCustomers", "annualPrice"] as const
        : ["averageMonthly"] as const),
    ];
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    if (first === "cohorts") {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[data-repeatable-add]")?.focus());
    } else {
      focusKey(first);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateFreeTrialConversion({
        ...fields,
        cohorts: cohorts.map(({ label, starts, paid, ageDays }) => ({ label, starts, paid, ageDays })),
      });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        if (calculation.errors.form) setStatus({ text: calculation.errors.form, tone: "danger" });
        focusFirstError(calculation.errors);
        return;
      }
      setErrors({});
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setErrors({});
      setResult(null);
      setStatus({ text: "Couldn't calculate. Try again.", tone: "danger" });
    }
  }

  function reset() {
    setCohorts([emptyCohort(`cohort-${nextCohortId.current++}`)]);
    setFields(emptyFields());
    setErrors({});
    setResult(null);
    setStatus({ text: "Form reset.", tone: "neutral" });
    focusKey("model");
  }

  const listNote = errors.cohorts ?? (atLimit ? `Up to ${TRIAL_MAX_COHORTS} cohorts` : undefined);

  function moneyField(field: "averageMonthly" | "monthlyPrice" | "annualPrice", label: string) {
    return (
      <UiTextField
        autoCapitalize="none"
        dataFocusKey={field}
        error={errors[field] ?? null}
        inputMode="decimal"
        label={label}
        onChange={(value) => updateField(field, value)}
        required
        spellCheck={false}
        suffix={fields.currency}
        value={fields[field]}
      />
    );
  }

  function countField(field: "monthlyCustomers" | "annualCustomers", label: string) {
    return (
      <UiTextField
        autoCapitalize="none"
        dataFocusKey={field}
        error={errors[field] ?? null}
        inputMode="numeric"
        label={label}
        onChange={(value) => updateField(field, value)}
        required
        spellCheck={false}
        value={fields[field]}
      />
    );
  }

  return (
    <section aria-label="Free trial conversion calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Free trial conversion inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <UiChoiceGroup
            dataFocusKey="model"
            error={errors.model ?? null}
            label="What people sign up for"
            onChange={(value) => {
              if (!MODEL_OPTIONS.some((option) => option.id === value)) return;
              updateField("model", value);
            }}
            options={MODEL_OPTIONS}
            required
            value={fields.model}
          />

          <div className={styles.window}>
            <UiTextField
              autoCapitalize="none"
              dataFocusKey="windowDays"
              description="Days each account gets to pay, counted from the day it started."
              error={errors.windowDays ?? null}
              inputMode="numeric"
              label="Follow-up window"
              onChange={(value) => updateField("windowDays", value)}
              required
              spellCheck={false}
              suffix="days"
              value={fields.windowDays}
            />
          </div>

          <section aria-labelledby="trial-cohort-title" className={styles.group}>
            <div className={styles.groupTitle}>
              <h2 id="trial-cohort-title">Cohorts</h2>
              <p className={styles.helper}>A cohort is everyone who started in the same period, such as one month. Count each account once. Paid means the first payment went through. A card on file isn&apos;t a payment.</p>
            </div>
            <div className={styles.cohortList}>
              <UiRepeatableList
                addDescription={listNote}
                addDescriptionIsError={Boolean(errors.cohorts)}
                addDisabled={atLimit}
                addLabel="Add cohort"
                ariaLabel="Cohorts"
                items={cohorts}
                onAdd={addCohort}
                onRemove={removeCohort}
                removeLabel={(cohort, index) => `Remove ${cohortName(cohort.label, index)}`}
                renderItem={(cohort, index) => (
                  <fieldset className={styles.cohort}>
                    <legend className={styles.visuallyHidden}>{cohortName(cohort.label, index)}</legend>
                    <UiTextField
                      autoCapitalize="none"
                      className={styles.cohortName}
                      dataFocusKey={`cohorts.${index}.label`}
                      error={errors[`cohorts.${index}.label`] ?? null}
                      label="Cohort name"
                      onChange={(value) => updateCohort(cohort.id, "label", value)}
                      placeholder="Aug 2026"
                      value={cohort.label}
                    />
                    <UiTextField
                      autoCapitalize="none"
                      dataFocusKey={`cohorts.${index}.starts`}
                      error={errors[`cohorts.${index}.starts`] ?? null}
                      inputMode="numeric"
                      label={noun.count}
                      onChange={(value) => updateCohort(cohort.id, "starts", value)}
                      required
                      spellCheck={false}
                      value={cohort.starts}
                    />
                    <UiTextField
                      autoCapitalize="none"
                      dataFocusKey={`cohorts.${index}.paid`}
                      error={errors[`cohorts.${index}.paid`] ?? null}
                      inputMode="numeric"
                      label={paidLabel ? `Paid within ${paidLabel}` : "Paid within window"}
                      onChange={(value) => updateCohort(cohort.id, "paid", value)}
                      required
                      spellCheck={false}
                      value={cohort.paid}
                    />
                    <UiTextField
                      autoCapitalize="none"
                      dataFocusKey={`cohorts.${index}.ageDays`}
                      description={index === 0 ? "Days from the last start in this cohort to the day you counted." : undefined}
                      error={errors[`cohorts.${index}.ageDays`] ?? null}
                      inputMode="numeric"
                      label="Cohort age"
                      onChange={(value) => updateCohort(cohort.id, "ageDays", value)}
                      required
                      spellCheck={false}
                      suffix="days"
                      value={cohort.ageDays}
                    />
                  </fieldset>
                )}
              />
            </div>
          </section>

          <section aria-label="New MRR" className={styles.group}>
            <UiCheckbox isSelected={fields.includeMrr} onChange={(selected) => updateField("includeMrr", selected)}>
              Add new MRR from these customers
            </UiCheckbox>
            {fields.includeMrr ? (
              <div className={styles.mrr}>
                <div className={styles.mrrSettings}>
                  <div className={styles.currency}>
                    <UiSelect
                      dataFocusKey="currency"
                      error={errors.currency ?? null}
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
                  <UiChoiceGroup
                    dataFocusKey="mrrMethod"
                    error={errors.mrrMethod ?? null}
                    label="Prices"
                    onChange={(value) => {
                      if (value !== "average" && value !== "split") return;
                      updateField("mrrMethod", value satisfies TrialMrrMethod);
                    }}
                    options={[uiOption("average", "One average amount"), uiOption("split", "Monthly and annual plans")]}
                    required
                    value={fields.mrrMethod}
                  />
                </div>
                {split ? (
                  <>
                    <div className={styles.fieldGrid}>
                      {countField("monthlyCustomers", "Monthly-plan customers")}
                      {moneyField("monthlyPrice", "Average monthly price")}
                    </div>
                    <div className={styles.fieldGrid}>
                      {countField("annualCustomers", "Annual-plan customers")}
                      {moneyField("annualPrice", "Average annual price")}
                    </div>
                  </>
                ) : (
                  <div className={styles.fieldGrid}>{moneyField("averageMonthly", "Average monthly price")}</div>
                )}
                <p className={styles.helper}>Recurring price only. Leave out setup and other one-time fees.</p>
              </div>
            ) : null}
          </section>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate conversion</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <TrialResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}
