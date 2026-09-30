"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  UiButton,
  UiRepeatableList,
  UiSelect,
  UiTextField,
  uiOption,
} from "@/app/ui/controls";
import {
  UiActionRow,
  UiDataTable,
  UiPrimaryResult,
  UiStatus,
} from "@/app/ui/display";
import {
  BILLING_INTERVALS,
  MRR_CURRENCIES,
  calculateMrr,
  type MrrPlanField,
  type MrrPlanFieldErrors,
  type MrrValidationErrors,
  type MrrValues,
} from "@/lib/mrr-calculator/engine";
import styles from "./mrr-calculator.module.css";

type PlanDraft = {
  id: string;
  name: string;
  subscriptions: string;
  price: string;
  interval: string;
};

function emptyPlan(id: string): PlanDraft {
  return {
    id,
    name: "",
    subscriptions: "",
    price: "",
    interval: "monthly",
  };
}

function moneyFormatter(currency: MrrValues["currency"]) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCents(cents: number, currency: MrrValues["currency"]) {
  return moneyFormatter(currency).format(cents / 100);
}

function formatContribution(twelfthCents: number, roundedCents: number, currency: MrrValues["currency"]) {
  if (twelfthCents > 0 && twelfthCents < 12) {
    return "<" + formatCents(1, currency);
  }
  return formatCents(roundedCents, currency);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function rowErrors(errors: MrrValidationErrors, index: number): MrrPlanFieldErrors {
  return errors.rows[index] ?? {};
}

export function MrrCalculator() {
  const [plans, setPlans] = useState<PlanDraft[]>(() => [emptyPlan("1")]);
  const [currency, setCurrency] = useState<MrrValues["currency"]>("USD");
  const [errors, setErrors] = useState<MrrValidationErrors>({ rows: [] });
  const [result, setResult] = useState<MrrValues | null>(null);
  const [status, setStatus] = useState("");
  const [unexpectedFailure, setUnexpectedFailure] = useState(false);
  const nextPlanId = useRef(2);
  const formRef = useRef<HTMLFormElement>(null);
  const planListRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function clearForEdit() {
    const hasResult = result !== null;
    setResult(null);
    setErrors({ rows: [] });
    setUnexpectedFailure(false);
    setStatus((current) => {
      if (hasResult) return "Inputs changed. Calculate again.";
      return current === "Calculator reset." ? "" : current;
    });
  }

  function updatePlan(id: string, field: MrrPlanField, value: string) {
    setPlans((current) => current.map((plan) => plan.id === id ? { ...plan, [field]: value } : plan));
    clearForEdit();
  }

  function addPlan() {
    if (plans.length >= 20) return;
    const plan = emptyPlan(String(nextPlanId.current++));
    setPlans((current) => current.length >= 20 ? current : [...current, plan]);
    clearForEdit();
  }

  function removePlan(id: string) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
    clearForEdit();
  }

  function focusInvalidField(validationErrors: MrrValidationErrors) {
    let focusKey: string | null = null;
    if (validationErrors.currency) {
      focusKey = "currency";
    } else {
      const fieldOrder: MrrPlanField[] = ["name", "subscriptions", "price", "interval"];
      for (let index = 0; index < plans.length && focusKey === null; index += 1) {
        const rowError = validationErrors.rows[index] ?? {};
        const firstField = fieldOrder.find((field) => rowError[field]);
        if (firstField) focusKey = "plan-" + plans[index].id + "-" + firstField;
      }
    }

    requestAnimationFrame(() => {
      if (validationErrors.plans) {
        planListRef.current?.querySelector<HTMLButtonElement>("[data-repeatable-add]")?.focus();
        return;
      }
      if (focusKey) {
        formRef.current
          ?.querySelector<HTMLElement>('[data-focus-key="' + focusKey + '"]')
          ?.focus();
      }
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setUnexpectedFailure(false);
    try {
      const calculation = calculateMrr({ currency, plans });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        focusInvalidField(calculation.errors);
        return;
      }

      setErrors({ rows: [] });
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setResult(null);
      setErrors({ rows: [] });
      setStatus("");
      setUnexpectedFailure(true);
    }
  }

  function reset() {
    const firstPlan = emptyPlan(String(nextPlanId.current++));
    setPlans([firstPlan]);
    setCurrency("USD");
    setErrors({ rows: [] });
    setResult(null);
    setUnexpectedFailure(false);
    setStatus("Calculator reset.");
    requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[data-focus-key="plan-' + firstPlan.id + '-name"]')
        ?.focus();
    });
  }

  return (
    <section aria-label="MRR inputs and results" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="MRR inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <div className={styles.currencyGroup}>
            <UiSelect
              dataFocusKey="currency"
              description="Enter all prices in this currency. The selector does not convert them."
              error={errors.currency ?? null}
              label="Currency"
              onChange={(value) => {
                setCurrency(value as MrrValues["currency"]);
                clearForEdit();
              }}
              options={MRR_CURRENCIES.map((code) => uiOption(code, code))}
              required
              value={currency}
            />
          </div>

          <section aria-labelledby="mrr-plans-title" className={styles.group}>
            <h2 id="mrr-plans-title">Plans</h2>
            <p className={styles.guidance}>Enter the recurring price for the selected full billing term.</p>
            <div className={styles.planList} ref={planListRef}>
              <UiRepeatableList
                addDescription={
                  errors.plans ?? (plans.length === 20 ? "Maximum 20 plans" : undefined)
                }
                addDescriptionIsError={Boolean(errors.plans)}
                addDisabled={plans.length >= 20}
                addLabel="Add plan"
                ariaLabel="Plans"
                items={plans}
                onAdd={addPlan}
                onRemove={removePlan}
                removeLabel={(plan, index) => "Remove " + (plan.name.trim() || "Plan " + (index + 1))}
                renderItem={(plan, index) => {
                  const currentErrors = rowErrors(errors, index);
                  return (
                    <div className={styles.planContent}>
                      <p className={styles.planTitle}>Plan {index + 1}</p>
                      <div className={styles.planFields}>
                        <UiTextField
                          autoCapitalize="none"
                          autoComplete="off"
                          dataFocusKey={"plan-" + plan.id + "-name"}
                          error={currentErrors.name ?? null}
                          label="Plan name"
                          onChange={(value) => updatePlan(plan.id, "name", value)}
                          spellCheck={false}
                          value={plan.name}
                        />
                        <UiTextField
                          dataFocusKey={"plan-" + plan.id + "-subscriptions"}
                          error={currentErrors.subscriptions ?? null}
                          inputMode="numeric"
                          label="Active subscriptions"
                          onChange={(value) => updatePlan(plan.id, "subscriptions", value)}
                          required
                          value={plan.subscriptions}
                        />
                        <UiTextField
                          dataFocusKey={"plan-" + plan.id + "-price"}
                          error={currentErrors.price ?? null}
                          inputMode="decimal"
                          label={"Price per subscription (" + currency + ")"}
                          onChange={(value) => updatePlan(plan.id, "price", value)}
                          required
                          value={plan.price}
                        />
                        <UiSelect
                          dataFocusKey={"plan-" + plan.id + "-interval"}
                          error={currentErrors.interval ?? null}
                          label="Billing interval"
                          onChange={(value) => updatePlan(plan.id, "interval", value)}
                          options={BILLING_INTERVALS.map((interval) =>
                            uiOption(interval.value, interval.label)
                          )}
                          required
                          value={plan.interval}
                        />
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </section>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate MRR</UiButton>
            <UiButton onPress={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>

          {status ? <UiStatus>{status}</UiStatus> : null}
          {unexpectedFailure
            ? <UiStatus tone="danger">MRR could not be calculated. Try again.</UiStatus>
            : null}
        </form>

        <div className={styles.results}>
          {result
            ? (
              <>
                <UiPrimaryResult
                  detail={
                    result.totalMrrTwelfthCents === 0
                      ? "The entered plans currently contribute no recurring revenue."
                      : undefined
                  }
                  inputRef={resultRef}
                  label="Monthly recurring revenue"
                  value={formatContribution(
                    result.totalMrrTwelfthCents,
                    result.totalMrrRoundedCents,
                    result.currency,
                  )}
                />

                <dl className={styles.arr}>
                  <div>
                    <dt>Annualized ARR</dt>
                    <dd>{formatCents(result.annualizedArrCents, result.currency)}</dd>
                  </div>
                </dl>
                <p className={styles.qualification}>
                  12 × MRR is a run rate. It does not mean that revenue was earned or is guaranteed.
                </p>

                <UiDataTable
                  ariaLabel="Monthly contribution by plan"
                  caption="Monthly contribution by plan"
                  columns={[
                    { id: "plan", label: "Plan" },
                    { id: "subscriptions", label: "Active subscriptions", align: "right" },
                    { id: "billed", label: "Recurring price and interval" },
                    { id: "contribution", label: "Monthly contribution", align: "right" },
                  ]}
                  rows={result.rows.map((row) => ({
                    id: String(row.rowNumber),
                    cells: {
                      plan: (
                        <span className={styles.tablePlan}>
                          <span className={styles.rowNumber}>#{row.rowNumber}</span>
                          <span>{row.name}</span>
                        </span>
                      ),
                      subscriptions: formatCount(row.subscriptions),
                      billed: (
                        <span className={styles.billedPrice}>
                          <span className={styles.price}>{formatCents(row.priceCents, result.currency)}</span>
                          {" / " + row.intervalLabel}
                        </span>
                      ),
                      contribution: formatContribution(
                        row.mrrTwelfthCents,
                        row.mrrRoundedCents,
                        result.currency,
                      ),
                    },
                  }))}
                />

                {result.roundingDifference
                  ? (
                    <p className={styles.roundingNote}>
                      Displayed plan contributions are rounded; the total uses exact values.
                    </p>
                  )
                  : null}
              </>
            )
            : <p className={styles.initial}>Enter at least one plan to calculate MRR.</p>}
        </div>
      </div>
    </section>
  );
}
