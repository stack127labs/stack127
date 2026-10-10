"use client";

import { RotateCcw } from "lucide-react";
import { Fragment, useRef, useState, type FormEvent } from "react";
import { UiButton, UiQuantityInput, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  ARR_CURRENCIES,
  calculateArr,
  type ArrCurrency,
  type ArrValidationErrors,
  type ArrValues,
} from "@/lib/arr-calculator/engine";
import styles from "./arr-calculator.module.css";

function formatCents(cents: number, currency: ArrCurrency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatResultCents(cents: number, currency: ArrCurrency) {
  return formatCents(cents, currency).split(",").map((group, index) => (
    <Fragment key={index}>
      {index > 0 ? <>,<wbr /></> : null}
      {group}
    </Fragment>
  ));
}

export function ArrCalculator() {
  const [mrr, setMrr] = useState("");
  const [currency, setCurrency] = useState<ArrCurrency>("USD");
  const [errors, setErrors] = useState<ArrValidationErrors>({});
  const [result, setResult] = useState<ArrValues | null>(null);
  const [status, setStatus] = useState("");
  const [unexpectedFailure, setUnexpectedFailure] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function focusAmount() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLInputElement>('[data-focus-key="mrr"]')?.focus();
    });
  }

  function clearForEdit() {
    const hadResult = result !== null;
    setResult(null);
    setErrors({});
    setUnexpectedFailure(false);
    setStatus((current) => {
      if (hadResult) return "Amount or currency changed. Calculate ARR again.";
      return current === "Calculator reset." ? "" : current;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setUnexpectedFailure(false);

    try {
      const calculation = calculateArr({ mrr, currency });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        focusAmount();
        return;
      }

      setErrors({});
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setResult(null);
      setErrors({});
      setUnexpectedFailure(true);
    }
  }

  function reset() {
    setMrr("");
    setCurrency("USD");
    setErrors({});
    setResult(null);
    setUnexpectedFailure(false);
    setStatus("Calculator reset.");
    focusAmount();
  }

  return (
    <section aria-label="ARR inputs and results" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="ARR inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <UiQuantityInput
            dataFocusKey="mrr"
            description="Choose the currency of your MRR. Changing the currency won't convert the amount."
            error={errors.mrr ?? null}
            label="Monthly recurring revenue (MRR)"
            onChange={(value) => {
              setMrr(value);
              clearForEdit();
            }}
            onUnitChange={(value) => {
              setCurrency(value as ArrCurrency);
              clearForEdit();
            }}
            placeholder="For example, 10000.00"
            required
            unit={currency}
            unitAriaLabel="MRR currency"
            units={ARR_CURRENCIES.map((code) => uiOption(code, code))}
            value={mrr}
          />

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate ARR</UiButton>
            <UiButton onPress={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>

          {status ? <UiStatus>{status}</UiStatus> : null}
          {unexpectedFailure
            ? <UiStatus tone="danger">ARR could not be calculated. Try again.</UiStatus>
            : null}
        </form>

        {result ? (
          <div className={styles.results}>
            <UiPrimaryResult
              inputRef={resultRef}
              label="ARR (12 × MRR)"
              value={formatResultCents(result.annualizedArrCents, result.currency)}
            />
            <p className={styles.basis}>
              Calculated from: {formatCents(result.mrrCents, result.currency)} × 12
            </p>
            <p className={styles.qualification}>
              This is your current MRR expressed as an annual rate. It does not measure cash collected
              or revenue already earned, and it does not predict future revenue.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
