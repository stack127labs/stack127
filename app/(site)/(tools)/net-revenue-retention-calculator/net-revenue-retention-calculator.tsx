"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { UiButton, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  NRR_CURRENCIES,
  calculateNetRevenueRetention,
  formatMoneyCents,
  formatSignedMoneyCents,
  type NrrCurrency,
  type NrrErrors,
  type NrrField,
  type NrrValues,
} from "@/lib/net-revenue-retention-calculator/engine";
import styles from "./net-revenue-retention-calculator.module.css";

type Draft = {
  month: string;
  currency: string;
  openingMrr: string;
  expansionMrr: string;
  reactivationMrr: string;
  contractionMrr: string;
  churnedMrr: string;
};

const EMPTY_DRAFT: Draft = {
  month: "",
  currency: "USD",
  openingMrr: "",
  expansionMrr: "",
  reactivationMrr: "",
  contractionMrr: "",
  churnedMrr: "",
};

const FIELDS_IN_ORDER: NrrField[] = [
  "month",
  "currency",
  "openingMrr",
  "expansionMrr",
  "reactivationMrr",
  "contractionMrr",
  "churnedMrr",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthName(month: string) {
  const [year, monthNumber] = month.split("-");
  return MONTH_NAMES[Number(monthNumber) - 1] + " " + year;
}

function focusFirstInvalidField(form: HTMLFormElement | null, errors: NrrErrors) {
  const firstField = FIELDS_IN_ORDER.find((field) => errors[field]);
  if (!firstField) return;
  requestAnimationFrame(() => {
    form?.querySelector<HTMLElement>('[data-focus-key="' + firstField + '"]')?.focus();
  });
}

function breakdownRows(values: NrrValues) {
  const currency = values.currency;
  return [
    {
      id: "opening",
      cells: { component: "Opening cohort MRR", mrr: formatMoneyCents(values.openingCents, currency) },
    },
    {
      id: "expansion",
      cells: { component: "Expansion MRR", mrr: formatSignedMoneyCents(values.expansionCents, currency) },
    },
    {
      id: "reactivation",
      cells: { component: "Reactivation MRR", mrr: formatSignedMoneyCents(values.reactivationCents, currency) },
    },
    {
      id: "contraction",
      cells: { component: "Contraction MRR", mrr: formatSignedMoneyCents(-values.contractionCents, currency) },
    },
    {
      id: "churned",
      cells: { component: "Churned MRR", mrr: formatSignedMoneyCents(-values.churnedCents, currency) },
    },
    {
      id: "ending",
      cells: { component: "Ending cohort MRR", mrr: formatMoneyCents(values.endingCents, currency) },
    },
  ];
}

export function NetRevenueRetentionCalculator() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<NrrErrors>({});
  const [result, setResult] = useState<NrrValues | null>(null);
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
    setStatus((current) => {
      if (hadResult) return "Inputs changed. Calculate again.";
      return current === "Inputs changed. Calculate again." ? current : "";
    });
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
      const calculation = calculateNetRevenueRetention(draft);
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
      setStatus("NRR could not be calculated. Try again.");
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
    <section aria-label="NRR inputs and results" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Net revenue retention inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
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
              description="Currency labels all amounts; it does not convert them."
              error={errors.currency ?? null}
              label="Currency"
              onChange={(value) => updateField("currency", value)}
              options={NRR_CURRENCIES.map((code) => uiOption(code, code))}
              required
              value={draft.currency}
            />
          </div>

          <section aria-labelledby="nrr-amounts-title" className={styles.amountsGroup}>
            <div className={styles.amountHeading}>
              <h2 id="nrr-amounts-title">MRR amounts</h2>
              <span>{draft.currency}</span>
            </div>
            <div className={styles.openingField}>
              <UiTextField
                autoCapitalize="off"
                dataFocusKey="openingMrr"
                description="From customers active when this month began."
                error={errors.openingMrr ?? null}
                inputMode="decimal"
                label="Opening cohort MRR"
                onChange={(value) => updateField("openingMrr", value)}
                required
                spellCheck={false}
                value={draft.openingMrr}
              />
            </div>

            <section aria-labelledby="nrr-gains-title" className={styles.movementGroup}>
              <h3 id="nrr-gains-title">Gains</h3>
              <div className={styles.movementFields}>
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
                  description="For those same customers if they churned and returned."
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

            <section aria-labelledby="nrr-losses-title" className={styles.movementGroup}>
              <h3 id="nrr-losses-title">Losses</h3>
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
            <p className={styles.guidance}>Enter 0 if a movement did not occur. Exclude new customers.</p>
          </section>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate NRR</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={statusTone}>{status}</UiStatus> : null}
        </form>

        {result ? (
          <section aria-label="NRR calculation result" className={styles.results}>
            <div className={styles.resultSummary}>
              <UiPrimaryResult
                detail={result.percentage === null
                  ? "Opening cohort MRR is zero · " + monthName(result.month) + " · " + result.currency + " · opening active cohort"
                  : monthName(result.month) + " · " + result.currency + " · opening active cohort"}
                inputRef={resultRef}
                label="Net revenue retention"
                tone="neutral"
                value={result.percentage ?? "Unavailable"}
              />
              <p className={styles.formula}>Ending cohort MRR ÷ opening cohort MRR × 100</p>
            </div>
            <UiDataTable
              ariaLabel="Opening cohort MRR breakdown"
              caption="Opening cohort MRR breakdown"
              columns={[
                { id: "component", label: "Component" },
                { id: "mrr", label: "MRR", align: "right" },
              ]}
              rows={breakdownRows(result)}
            />
          </section>
        ) : null}
      </div>
    </section>
  );
}
