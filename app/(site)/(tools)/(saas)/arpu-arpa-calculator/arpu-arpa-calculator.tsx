"use client";

import { RotateCcw } from "lucide-react";
import { Fragment, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  UiButton,
  UiChoiceGroup,
  UiQuantityInput,
  UiTextField,
  uiOption,
} from "@/app/ui/controls";
import { UiActionRow, UiPrimaryResult, UiResultLead, UiStatus } from "@/app/ui/display";
import {
  ARPU_ARPA_CURRENCIES,
  calculateArpuArpa,
  type ArpuArpaCalculation,
  type ArpuArpaCurrency,
  type ArpuArpaField,
  type ArpuArpaMode,
  type ArpuArpaValidationErrors,
} from "@/lib/arpu-arpa-calculator/engine";
import styles from "./arpu-arpa-calculator.module.css";

type ModeDraft = { period: string; revenue: string; count: string };
type Drafts = Record<ArpuArpaMode, ModeDraft>;
type DraftField = keyof ModeDraft;

function emptyDraft(): ModeDraft {
  return { period: "", revenue: "", count: "" };
}

function emptyDrafts(): Drafts {
  return { arpu: emptyDraft(), arpa: emptyDraft() };
}

function formatInteger(value: bigint): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function currencySymbol(currency: ArpuArpaCurrency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(0).find((part) => part.type === "currency")?.value ?? currency;
}

function formatMoneyCents(cents: bigint, currency: ArpuArpaCurrency): string {
  const magnitude = cents < 0n ? -cents : cents;
  const whole = formatInteger(magnitude / 100n);
  const fraction = (magnitude % 100n).toString().padStart(2, "0");
  return `${cents < 0n ? "-" : ""}${currencySymbol(currency)}${whole}.${fraction}`;
}

function formatAverage(result: Extract<ArpuArpaCalculation, { status: "valid" }>): string {
  const { averageTenThousandths, currency, nonzeroRoundedToZero } = result.values;
  const symbol = currencySymbol(currency);
  if (nonzeroRoundedToZero) {
    return result.values.revenueCents < 0n
      ? `Negative, under ${symbol}0.0001 in magnitude`
      : `<${symbol}0.0001`;
  }

  const magnitude = averageTenThousandths < 0n ? -averageTenThousandths : averageTenThousandths;
  const whole = formatInteger(magnitude / 10_000n);
  const allDecimals = (magnitude % 10_000n).toString().padStart(4, "0");
  const trimmedDecimals = allDecimals.replace(/0+$/, "");
  const fraction = trimmedDecimals.length < 2 ? trimmedDecimals.padEnd(2, "0") : trimmedDecimals;
  return `${averageTenThousandths < 0n ? "-" : ""}${symbol}${whole}.${fraction}`;
}

function withCommaBreaks(value: string): ReactNode {
  return value.split(/(,)/).map((part, index) => (
    <Fragment key={index}>{part}{part === "," ? <wbr /> : null}</Fragment>
  ));
}

function basisText(result: ArpuArpaCalculation & { status: "valid" | "unavailable" }): string {
  const { count, currency, mode, period, revenueCents } = result.values;
  if (mode === "arpu") {
    return `Basis: ${formatMoneyCents(revenueCents, currency)} net revenue ÷ ${formatInteger(count)} distinct active users during ${period}.`;
  }
  return `Basis: ${formatMoneyCents(revenueCents, currency)} month-end MRR ÷ ${formatInteger(count)} distinct paying customer accounts at ${period}.`;
}

function modeRule(mode: ArpuArpaMode): string {
  return mode === "arpu"
    ? "Net revenue and distinct active users across the same reporting window, including nonpaying users who meet your active-user rule."
    : "Month-end MRR and distinct paying customer accounts at that same month end.";
}

function labelForResult(mode: ArpuArpaMode, period: string): string {
  return mode === "arpu"
    ? `Period ARPU per active user for ${period}`
    : `Monthly ARPA per paying account for ${period}`;
}

export function ArpuArpaCalculator() {
  const [mode, setMode] = useState<ArpuArpaMode>("arpu");
  const [currency, setCurrency] = useState<ArpuArpaCurrency>("USD");
  const [drafts, setDrafts] = useState<Drafts>(emptyDrafts);
  const [errors, setErrors] = useState<ArpuArpaValidationErrors>({});
  const [result, setResult] = useState<ArpuArpaCalculation | null>(null);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "danger">("neutral");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);
  const unavailableRef = useRef<HTMLParagraphElement>(null);

  const activeDraft = drafts[mode];

  function focusChoiceGroup() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[data-focus-key="mode"]')?.focus();
    });
  }

  function focusResult() {
    requestAnimationFrame(() => {
      (resultRef.current ?? unavailableRef.current)?.focus();
    });
  }

  function focusFirstError(nextErrors: ArpuArpaValidationErrors) {
    const order: ArpuArpaField[] = ["mode", "period", "revenue", "currency", "count"];
    const first = order.find((field) => nextErrors[field]);
    if (!first) return;
    const focusKey = first === "mode" ? "mode" : first;
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus();
    });
  }

  function clearForEdit() {
    const hadResult = result !== null;
    setResult(null);
    setErrors({});
    setStatusTone("neutral");
    setStatus(hadResult ? "Inputs changed. Calculate the average again." : "");
  }

  function updateDraft(field: DraftField, value: string) {
    setDrafts((current) => ({
      ...current,
      [mode]: { ...current[mode], [field]: value },
    }));
    clearForEdit();
  }

  function chooseMode(value: string) {
    if (value !== "arpu" && value !== "arpa") return;
    if (value === mode) return;
    setMode(value);
    clearForEdit();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setStatusTone("neutral");

    try {
      const calculation = calculateArpuArpa({ mode, currency, ...activeDraft });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        focusFirstError(calculation.errors);
        return;
      }

      setErrors({});
      setResult(calculation);
      focusResult();
    } catch {
      setResult(null);
      setErrors({});
      setStatusTone("danger");
      setStatus("The average could not be calculated. Try again.");
    }
  }

  function reset() {
    setMode("arpu");
    setCurrency("USD");
    setDrafts(emptyDrafts());
    setErrors({});
    setResult(null);
    setStatusTone("neutral");
    setStatus("Calculator reset.");
    focusChoiceGroup();
  }

  const resultMode = result?.status === "valid" || result?.status === "unavailable"
    ? result.values.mode
    : mode;
  const resultPeriod = result?.status === "valid" || result?.status === "unavailable"
    ? result.values.period
    : "";

  return (
    <section aria-label="ARPU and ARPA calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Average revenue inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <UiChoiceGroup
            dataFocusKey="mode"
            description={modeRule(mode)}
            error={errors.mode ?? null}
            label="Average for"
            onChange={chooseMode}
            options={[
              uiOption("arpu", "Active users (ARPU)"),
              uiOption("arpa", "Paying accounts (ARPA)"),
            ]}
            required
            value={mode}
          />

          <div className={styles.fieldGrid}>
            <UiTextField
              autoCapitalize="none"
              dataFocusKey="period"
              error={errors.period ?? null}
              label={mode === "arpu" ? "Reporting period" : "Reporting month"}
              onChange={(value) => updateDraft("period", value)}
              placeholder={mode === "arpu" ? "Apr to Jun 2026" : "2026-04"}
              required
              spellCheck={false}
              value={activeDraft.period}
            />

            <UiQuantityInput
              dataFocusKey="revenue"
              description={mode === "arpu"
                ? "Use net revenue for the full reporting window in the selected currency."
                : "Use MRR already normalized to one month at the named month end."}
              error={errors.revenue ?? errors.currency ?? null}
              label={mode === "arpu" ? "Net revenue during the reporting period" : "Month-end monthly recurring revenue (MRR)"}
              onChange={(value) => updateDraft("revenue", value)}
              onUnitChange={(value) => {
                setCurrency(value as ArpuArpaCurrency);
                clearForEdit();
              }}
              placeholder={mode === "arpu" ? "For example, 75000.00" : "For example, 12000.00"}
              required
              unit={currency}
              unitAriaLabel="Revenue currency"
              units={ARPU_ARPA_CURRENCIES.map((code) => uiOption(code, code))}
              value={activeDraft.revenue}
            />

            <UiTextField
              dataFocusKey="count"
              description={mode === "arpu"
                ? "Count each distinct active person once, including qualifying nonpaying users."
                : "Count each distinct paying customer account once, even if it has several seats or subscriptions."}
              error={errors.count ?? null}
              inputMode="numeric"
              label={mode === "arpu" ? "Distinct active users" : "Distinct paying customer accounts"}
              onChange={(value) => updateDraft("count", value)}
              placeholder={mode === "arpu" ? "For example, 5000" : "For example, 120"}
              required
              value={activeDraft.count}
            />
          </div>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate average</UiButton>
            <UiButton onPress={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>

          {status ? <UiStatus tone={statusTone}>{status}</UiStatus> : null}
        </form>

        {result?.status === "valid" ? (
          <div className={styles.results}>
            <UiPrimaryResult
              detail={result.values.mode === "arpu" ? "For the named reporting period." : "Monthly amount at the named month end."}
              inputRef={resultRef}
              label={labelForResult(resultMode, resultPeriod)}
              unit={result.values.mode === "arpu" ? "per active user" : "per paying account per month"}
              value={withCommaBreaks(formatAverage(result))}
            />
            <p className={styles.basis}>{withCommaBreaks(basisText(result))}</p>
          </div>
        ) : null}

        {result?.status === "unavailable" ? (
          <div className={styles.results}>
            <UiResultLead inputRef={unavailableRef}>
              {result.values.mode === "arpu" ? "ARPU unavailable" : "ARPA unavailable"}
            </UiResultLead>
            <p className={styles.reason}>
              Undefined because the {result.values.mode === "arpu" ? "distinct active user" : "distinct paying account"} count is 0.
              {result.values.checkSourceConsistency ? " Check that the MRR and account reports describe the same month-end population." : ""}
            </p>
            <p className={styles.basis}>{withCommaBreaks(basisText(result))}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
