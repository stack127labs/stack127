"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { UiButton, UiChoiceGroup, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiAllocationBar, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  CHURN_PERIODS,
  convertChurnRate,
  type ChurnConversion,
  type ChurnLifetime,
  type ChurnLinearEstimate,
  type ChurnPercent,
  type ChurnPeriod,
  type ChurnRateErrors,
} from "@/lib/churn-rate-converter/engine";
import styles from "./churn-rate-converter.module.css";

const CHANGED = "Inputs changed. Convert again.";
const RESET = "Converter reset.";

const PERIOD_ADJECTIVE: Record<ChurnPeriod, string> = { month: "monthly", quarter: "quarterly", year: "annual" };
const PERIOD_TITLE: Record<ChurnPeriod, string> = { month: "Monthly", quarter: "Quarterly", year: "Annual" };

function isPeriod(value: string): value is ChurnPeriod {
  return CHURN_PERIODS.includes(value as ChurnPeriod);
}

function withCommas(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Hundredths of a percent to a fixed two-decimal percent, such as 4596 to 45.96%. */
function fixedPercent(hundredths: number) {
  const whole = Math.floor(hundredths / 100);
  const fraction = String(hundredths % 100).padStart(2, "0");
  return `${withCommas(String(whole))}.${fraction}%`;
}

/** The entered rate as people typed it, without padded zeros: 500 to 5%, 425 to 4.25%. */
function enteredPercent(hundredths: number) {
  const whole = Math.floor(hundredths / 100);
  const fraction = String(hundredths % 100).padStart(2, "0").replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""}%`;
}

function formatPercent(value: ChurnPercent) {
  if (value.roundedToZero) return "Under 0.01%";
  if (value.nearlyAll) return "Over 99.99%";
  return fixedPercent(value.hundredths);
}

function formatLinear(value: ChurnLinearEstimate) {
  return value.roundedToZero ? "Under 0.01%" : fixedPercent(value.hundredths);
}

function formatLifetime(lifetime: ChurnLifetime) {
  if (lifetime.kind === "notEstimable") return "Not estimable at 0% churn";
  const whole = Math.floor(lifetime.tenths / 10);
  const tenth = lifetime.tenths % 10;
  const amount = `${withCommas(String(whole))}${tenth ? `.${tenth}` : ""}`;
  return `${amount} ${lifetime.period}${lifetime.tenths === 10 ? "" : "s"}`;
}

export function ChurnRateConverter() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [rate, setRate] = useState("");
  const [period, setPeriod] = useState<ChurnPeriod>("month");
  const [errors, setErrors] = useState<ChurnRateErrors>({});
  const [result, setResult] = useState<ChurnConversion | null>(null);
  const [status, setStatus] = useState("");
  const [unexpectedFailure, setUnexpectedFailure] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  function focusField(field: "rate" | "period") {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${field}"]`)?.focus();
    });
  }

  function clearForEdit() {
    const hadResult = result !== null;
    setResult(null);
    setErrors({});
    setUnexpectedFailure(false);
    setStatus((current) => {
      if (hadResult) return CHANGED;
      return current === RESET ? "" : current;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setUnexpectedFailure(false);

    try {
      const calculation = convertChurnRate({ rate, period });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        focusField(calculation.errors.rate ? "rate" : "period");
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
    setRate("");
    setPeriod("month");
    setErrors({});
    setResult(null);
    setUnexpectedFailure(false);
    setStatus(RESET);
    focusField("rate");
  }

  return (
    <section aria-label="Churn rate converter inputs and results" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Churn rate converter inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <div className={styles.fieldGrid}>
            <UiTextField
              autoCapitalize="none"
              dataFocusKey="rate"
              error={errors.rate?.message ?? null}
              inputMode="decimal"
              label="Customer churn rate"
              onChange={(value) => {
                // The field already shows a % suffix, so drop a typed or pasted one.
                setRate(value.replace(/\s*%\s*$/, ""));
                clearForEdit();
              }}
              placeholder="5"
              required
              spellCheck={false}
              suffix="%"
              value={rate}
            />
            <UiChoiceGroup
              dataFocusKey="period"
              error={errors.period?.message ?? null}
              label="Period this rate covers"
              name="period"
              onChange={(value) => {
                if (!isPeriod(value)) return;
                setPeriod(value);
                clearForEdit();
              }}
              options={CHURN_PERIODS.map((id) => uiOption(id, PERIOD_TITLE[id]))}
              required
              value={period}
            />
          </div>

          <UiActionRow>
            <UiButton isDisabled={!isHydrated} type="submit" variant="primary">Convert churn rate</UiButton>
            <UiButton onPress={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>

          {status ? <UiStatus>{status}</UiStatus> : null}
          {unexpectedFailure
            ? <UiStatus tone="danger">The rate couldn&apos;t be converted. Try again.</UiStatus>
            : null}
        </form>

        {result ? <ChurnRateResults result={result} resultRef={resultRef} /> : null}
      </div>
    </section>
  );
}

function ChurnRateResults({ result, resultRef }: { result: ChurnConversion; resultRef: RefObject<HTMLOutputElement | null> }) {
  const { source, rows, leadPeriod, yearOf100, lifetime } = result;
  const lead = rows.find((row) => row.period === leadPeriod)!;
  const exactEnds = source.hundredths === 0 || source.hundredths === 10000;

  function formatOf100(value: number | bigint) {
    const count = Number(value);
    if (count === 0 && (yearOf100.lostUnderOne || yearOf100.remainingUnderOne)) return "fewer than 1";
    return exactEnds ? String(count) : `about ${count}`;
  }

  return (
    <div className={styles.results}>
      <UiPrimaryResult
        detail={`Modeled from ${enteredPercent(source.hundredths)} ${PERIOD_ADJECTIVE[source.period]} churn.`}
        inputRef={resultRef}
        label={leadPeriod === "year" ? "Annualized churn" : "Monthly equivalent churn"}
        value={formatPercent(lead.churn)}
      />

      <UiDataTable
        ariaLabel="Equivalent churn by period"
        caption="Your churn rate for each period. The wrong shortcut just multiplies or divides it."
        columns={[
          { id: "period", label: "Period" },
          { id: "churn", label: "Churn", align: "right" },
          { id: "retention", label: "Retention", align: "right" },
          { id: "linear", label: "Wrong shortcut", align: "right" },
        ]}
        rows={rows.map((row) => ({
          id: row.period,
          cells: {
            period: PERIOD_TITLE[row.period],
            churn: row.isSource
              ? <span className={styles.entered}>{formatPercent(row.churn)} <span className={styles.enteredTag}>(entered)</span></span>
              : formatPercent(row.churn),
            retention: formatPercent(row.retention),
            linear: row.linearEstimate
              ? formatLinear(row.linearEstimate)
              : <><span aria-hidden="true">—</span><span className={styles.visuallyHidden}>Not applicable</span></>,
          },
        }))}
      />

      <div className={styles.region}>
        <h3 className={styles.regionTitle}>Out of 100 customers, after one year</h3>
        <UiAllocationBar
          ariaLabel="Expected customers who leave and stay over a year, out of 100"
          formatValue={formatOf100}
          palette="accent"
          segments={[
            { id: "lost", label: "Leave", tone: "accent", value: yearOf100.lost },
            { id: "remaining", label: "Stay", tone: "light", value: yearOf100.remaining },
          ]}
          total={100}
        />
      </div>

      <UiKeyValueList rows={[{ label: "Average lifetime (estimate)", value: formatLifetime(lifetime) }]} />

      <div className={styles.notes}>
        <p>Assumes the same share of your remaining customers leaves every {source.period}.</p>
        {source.period === "year"
          ? <p>Annual-plan customers usually leave only at renewal, not each month.</p>
          : null}
      </div>
    </div>
  );
}
