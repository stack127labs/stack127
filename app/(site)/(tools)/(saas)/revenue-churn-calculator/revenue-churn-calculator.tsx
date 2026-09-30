"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent, type RefObject } from "react";
import { UiButton, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  calculateRevenueChurn,
  formatRevenueMoneyCents,
  REVENUE_CHURN_CURRENCIES,
  type RevenueChurnCurrency,
  type RevenueChurnErrors,
  type RevenueChurnField,
  type RevenueChurnValues,
} from "@/lib/revenue-churn-calculator/engine";
import styles from "./revenue-churn-calculator.module.css";

type Draft = {
  month: string;
  currency: string;
  openingMrr: string;
  canceledOpeningMrr: string;
  reducedOpeningMrr: string;
};

type StatusMessage = { text: string; tone: "neutral" | "danger" };

function emptyDraft(): Draft {
  return {
    month: "",
    currency: "USD",
    openingMrr: "",
    canceledOpeningMrr: "",
    reducedOpeningMrr: "",
  };
}

const FIELD_ORDER: RevenueChurnField[] = [
  "month",
  "currency",
  "openingMrr",
  "canceledOpeningMrr",
  "reducedOpeningMrr",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthName(month: string) {
  const [year, monthNumber] = month.split("-");
  return MONTH_NAMES[Number(monthNumber) - 1] + " " + year;
}

function money(cents: number, currency: RevenueChurnCurrency) {
  return <span className={styles.money}>{formatRevenueMoneyCents(cents, currency)}</span>;
}

function focusFirstError(form: HTMLFormElement | null, errors: RevenueChurnErrors) {
  const firstField = FIELD_ORDER.find((field) => errors[field]);
  if (!firstField) return;
  requestAnimationFrame(() => {
    form?.querySelector<HTMLElement>('[data-focus-key="' + firstField + '"]')?.focus();
  });
}

function RevenueChurnResults({
  result,
  resultRef,
}: {
  result: RevenueChurnValues;
  resultRef: RefObject<HTMLOutputElement | null>;
}) {
  const detail = result.percentage === null
    ? monthName(result.month) + " · " + result.currency + " · Opening MRR is zero."
    : monthName(result.month) + " · " + result.currency + " · Opening MRR dollars missing at month end.";

  return (
    <section aria-label="Revenue churn calculation result" className={styles.results}>
      <UiPrimaryResult
        detail={detail}
        inputRef={resultRef}
        label="Gross revenue churn"
        tone="neutral"
        value={result.percentage ?? "Unavailable"}
      />
      <section aria-labelledby="revenue-churn-breakdown-title" className={styles.breakdown}>
        <h2 id="revenue-churn-breakdown-title">Opening MRR breakdown</h2>
        <UiKeyValueList rows={[
          { label: "Opening MRR", value: money(result.openingCents, result.currency) },
          { label: "Canceled opening MRR", value: money(result.canceledCents, result.currency) },
          { label: "Reduced opening MRR", value: money(result.reducedCents, result.currency) },
          { label: "Total lost opening MRR", value: money(result.totalLostCents, result.currency) },
          { label: "Opening MRR still present", value: money(result.stillPresentCents, result.currency) },
        ]} />
        <p className={styles.resultNote}>
          This excludes gains and MRR from new customers. It is not total ending MRR.
        </p>
      </section>
    </section>
  );
}

export function RevenueChurnCalculator() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<RevenueChurnErrors>({});
  const [result, setResult] = useState<RevenueChurnValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function updateField(field: keyof Draft, value: string) {
    const hadResult = result !== null;
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors({});
    setResult(null);
    if (hadResult) {
      setStatus({ text: "Inputs changed. Calculate again.", tone: "neutral" });
    } else if (status?.text !== "Inputs changed. Calculate again.") {
      setStatus(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateRevenueChurn(draft);
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        focusFirstError(formRef.current, calculation.errors);
        return;
      }
      setErrors({});
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setErrors({});
      setResult(null);
      setStatus({ text: "Revenue churn could not be calculated. Try again.", tone: "danger" });
    }
  }

  function reset() {
    setDraft(emptyDraft());
    setErrors({});
    setResult(null);
    setStatus({ text: "Calculator reset.", tone: "neutral" });
    requestAnimationFrame(() => monthRef.current?.focus());
  }

  return (
    <section aria-label="Revenue churn calculator workbench" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form
          aria-label="Revenue churn inputs"
          className={styles.form}
          noValidate
          onSubmit={submit}
          ref={formRef}
        >
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
              description="Formats results only; it does not convert amounts."
              error={errors.currency ?? null}
              label="Currency"
              onChange={(value) => updateField("currency", value)}
              options={REVENUE_CHURN_CURRENCIES.map((currency) => uiOption(currency, currency))}
              required
              value={draft.currency}
            />
          </div>

          <div className={styles.openingField}>
            <UiTextField
              autoCapitalize="off"
              dataFocusKey="openingMrr"
              description="From customers with an active, billable subscription at the start of the month."
              error={errors.openingMrr ?? null}
              inputMode="decimal"
              label="Opening MRR"
              onChange={(value) => updateField("openingMrr", value)}
              required
              spellCheck={false}
              value={draft.openingMrr}
            />
          </div>

          <section aria-labelledby="revenue-churn-losses-title" className={styles.amountGroup}>
            <div className={styles.amountHeading}>
              <h2 id="revenue-churn-losses-title">Losses from opening MRR</h2>
              <span>All amounts in {draft.currency}</span>
            </div>
            <div className={styles.lossFields}>
              <UiTextField
                autoCapitalize="off"
                dataFocusKey="canceledOpeningMrr"
                description="Opening MRR for those customers with no active, billable subscription at month end."
                error={errors.canceledOpeningMrr ?? null}
                inputMode="decimal"
                label="Canceled opening MRR"
                onChange={(value) => updateField("canceledOpeningMrr", value)}
                required
                spellCheck={false}
                value={draft.canceledOpeningMrr}
              />
              <UiTextField
                autoCapitalize="off"
                dataFocusKey="reducedOpeningMrr"
                description="Opening minus closing MRR for customers still billable at month end, including a zero-MRR billable subscription."
                error={errors.reducedOpeningMrr ?? null}
                inputMode="decimal"
                label="Reduced opening MRR"
                onChange={(value) => updateField("reducedOpeningMrr", value)}
                required
                spellCheck={false}
                value={draft.reducedOpeningMrr}
              />
            </div>
            <p className={styles.guidance}>
              Count each opening dollar once at month end. Don&apos;t use raw event totals. Enter 0 when none.
            </p>
          </section>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate revenue churn</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>

        {result ? <RevenueChurnResults result={result} resultRef={resultRef} /> : null}
      </div>
    </section>
  );
}
