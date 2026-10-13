"use client";

import { RotateCcw } from "lucide-react";
import { Fragment, useRef, useState, type FormEvent } from "react";
import { UiButton, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  BURN_MULTIPLE_CURRENCIES,
  calculateBurnMultiple,
  type BurnMultipleCurrency,
  type BurnMultipleField,
  type BurnMultipleValidationErrors,
  type BurnMultipleValues,
} from "@/lib/burn-multiple-calculator/engine";
import styles from "./burn-multiple-calculator.module.css";

function groupedInteger(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
}

function currencySymbol(currency: BurnMultipleCurrency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(0).find((part) => part.type === "currency")?.value ?? currency;
}

function formatMoneyCents(cents: number, currency: BurnMultipleCurrency): string {
  const amount = BigInt(cents);
  const magnitude = amount < 0n ? -amount : amount;
  const whole = groupedInteger(magnitude / 100n);
  const fraction = (magnitude % 100n).toString().padStart(2, "0");
  return `${amount < 0n ? "-" : ""}${currencySymbol(currency)}${whole}.${fraction}`;
}

function withCommaBreaks(value: string) {
  return value.split(/(,)/u).map((part, index) => (
    <Fragment key={index}>{part}{part === "," ? <wbr /> : null}</Fragment>
  ));
}

function resultReason(values: BurnMultipleValues): string | null {
  switch (values.outcome.kind) {
    case "multiple":
      return null;
    case "cash-generating":
      if (values.outcome.arrChange === "zero") {
        return "Net cash was generated during this period. There was no positive net new ARR.";
      }
      if (values.outcome.arrChange === "negative") {
        return "Net cash was generated during this period. ARR declined, so there was no positive net new ARR.";
      }
      return "Net cash was generated during this period, so a burn multiple does not apply.";
    case "undefined":
      return "There is no growth denominator because net new ARR is zero.";
    case "unavailable":
      return "ARR declined, so a burn multiple cannot measure cash used per unit of growth.";
  }
}

function firstError(errors: BurnMultipleValidationErrors): BurnMultipleField | null {
  return (["period", "currency", "netCashBurn", "netNewArr"] as const).find((field) => errors[field]) ?? null;
}

export function BurnMultipleCalculator() {
  const [period, setPeriod] = useState("");
  const [currency, setCurrency] = useState<BurnMultipleCurrency>("USD");
  const [netCashBurn, setNetCashBurn] = useState("");
  const [netNewArr, setNetNewArr] = useState("");
  const [errors, setErrors] = useState<BurnMultipleValidationErrors>({});
  const [result, setResult] = useState<BurnMultipleValues | null>(null);
  const [status, setStatus] = useState("");
  const [unexpectedFailure, setUnexpectedFailure] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const periodRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function focusField(field: BurnMultipleField) {
    requestAnimationFrame(() => {
      if (field === "period") {
        periodRef.current?.focus();
        return;
      }
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${field}"]`)?.focus();
    });
  }

  function clearForEdit() {
    const hadResult = result !== null;
    setResult(null);
    setErrors({});
    setUnexpectedFailure(false);
    setStatus((current) => {
      if (hadResult) return "Inputs changed. Calculate again.";
      return current === "Calculator reset." ? "" : current;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setUnexpectedFailure(false);

    try {
      const calculation = calculateBurnMultiple({ period, currency, netCashBurn, netNewArr });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        const field = firstError(calculation.errors);
        if (field) focusField(field);
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
    setPeriod("");
    setCurrency("USD");
    setNetCashBurn("");
    setNetNewArr("");
    setErrors({});
    setResult(null);
    setUnexpectedFailure(false);
    setStatus("Calculator reset.");
    focusField("period");
  }

  return (
    <section aria-label="Burn multiple inputs and result" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Burn multiple inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <div className={styles.periodFields}>
            <UiTextField
              autoCapitalize="none"
              autoComplete="off"
              dataFocusKey="period"
              error={errors.period ?? null}
              inputRef={periodRef}
              label="Reporting period"
              onChange={(value) => {
                setPeriod(value);
                clearForEdit();
              }}
              placeholder="Q1 2026"
              required
              spellCheck={false}
              value={period}
            />
            <UiSelect
              dataFocusKey="currency"
              description="Used for both amounts. Changing it changes their formatting without converting either amount."
              error={errors.currency ?? null}
              label="Currency"
              onChange={(value) => {
                setCurrency(value as BurnMultipleCurrency);
                clearForEdit();
              }}
              options={BURN_MULTIPLE_CURRENCIES.map((code) => uiOption(code, code))}
              required
              value={currency}
            />
          </div>

          <div className={styles.amountGroup}>
            <p className={styles.guidance}>Use net cash burn and the change in ARR from the same period.</p>
            <div className={styles.amountFields}>
              <UiTextField
                autoCapitalize="none"
                autoComplete="off"
                dataFocusKey="netCashBurn"
                description="Cash spent on operations minus cash collected from customers. Exclude funding and loan proceeds."
                error={errors.netCashBurn ?? null}
                inputMode="text"
                label="Net cash burn"
                onChange={(value) => {
                  setNetCashBurn(value);
                  clearForEdit();
                }}
                placeholder="For example, 12000.00"
                required
                spellCheck={false}
                value={netCashBurn}
              />
              <UiTextField
                autoCapitalize="none"
                autoComplete="off"
                dataFocusKey="netNewArr"
                description="ARR is already an annualized run rate. Enter its change for this period."
                error={errors.netNewArr ?? null}
                inputMode="text"
                label="Net new ARR"
                onChange={(value) => {
                  setNetNewArr(value);
                  clearForEdit();
                }}
                placeholder="For example, 24000.00"
                required
                spellCheck={false}
                value={netNewArr}
              />
            </div>
          </div>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate burn multiple</UiButton>
            <UiButton onPress={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>

          {status ? <UiStatus>{status}</UiStatus> : null}
          {unexpectedFailure ? <UiStatus tone="danger">The calculation could not finish. Your inputs are still here. Try again.</UiStatus> : null}
        </form>

        {result ? (
          <div className={styles.results}>
            <UiPrimaryResult
              detail={<span className={styles.resultDetail}>Period: {result.period} · {result.currency}</span>}
              inputRef={resultRef}
              label="Burn multiple"
              value={result.outcome.kind === "multiple" ? withCommaBreaks(result.outcome.displayValue) : result.outcome.kind === "cash-generating" ? "Cash generating" : result.outcome.kind === "undefined" ? "Undefined" : "Unavailable"}
            />

            {result.outcome.kind === "multiple" ? (
              <p className={styles.division}>
                <span>Net cash burn</span> <span>{withCommaBreaks(formatMoneyCents(result.netCashBurnCents, result.currency))}</span>
                <span aria-hidden="true"> ÷ </span>
                <span>Net new ARR</span> <span>{withCommaBreaks(formatMoneyCents(result.netNewArrCents, result.currency))}</span>
              </p>
            ) : (
              <dl className={styles.amountBasis}>
                <div><dt>Net cash burn</dt><dd>{withCommaBreaks(formatMoneyCents(result.netCashBurnCents, result.currency))}</dd></div>
                <div><dt>Net new ARR</dt><dd>{withCommaBreaks(formatMoneyCents(result.netNewArrCents, result.currency))}</dd></div>
              </dl>
            )}

            {resultReason(result) ? <p className={styles.reason}>{resultReason(result)}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
