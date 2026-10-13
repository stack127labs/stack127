
"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type ComponentProps, type FormEvent, type ReactNode, type RefObject } from "react";
import { UiButton, UiDisclosure, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  calculateSaasMetrics,
  SAAS_CURRENCIES,
  type SaaSCalculation,
  type SaaSCalculatorInput,
  type SaaSCurrency,
  type SaaSField,
  type SaaSMetrics,
} from "@/lib/saas-metrics-calculator/engine";
import styles from "./saas-metrics-calculator.module.css";

const fieldsInOrder: SaaSField[] = [
  "reportingMonth",
  "currency",
  "startingMrr",
  "newMrr",
  "expansionMrr",
  "contractionMrr",
  "churnedMrr",
  "startingAccounts",
  "newAccounts",
  "churnedAccounts",
  "recognizedRevenue",
  "recurringCogs",
  "acquisitionSpend",
  "netCashBurn",
];

const optionalFields = new Set<SaaSField>(fieldsInOrder.slice(7));

type RawTextFieldProps = ComponentProps<typeof UiTextField>;

function RawTextField(props: RawTextFieldProps) {
  return <UiTextField autoCapitalize="none" autoComplete="off" spellCheck={false} {...props} />;
}

function emptyInput(): SaaSCalculatorInput {
  return {
    reportingMonth: "",
    currency: "USD",
    startingMrr: "",
    newMrr: "",
    expansionMrr: "",
    contractionMrr: "",
    churnedMrr: "",
    startingAccounts: "",
    newAccounts: "",
    churnedAccounts: "",
    recognizedRevenue: "",
    recurringCogs: "",
    acquisitionSpend: "",
    netCashBurn: "",
  };
}

function safeCurrency(value: string): SaaSCurrency {
  return SAAS_CURRENCIES.find((currency) => currency === value) ?? "USD";
}

function currencyFormatter(currency: SaaSCurrency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMoney(value: number, currency: SaaSCurrency): string {
  const formatter = currencyFormatter(currency);
  const rounded = Math.round(Math.abs(value) * 100) / 100;
  if (value !== 0 && rounded === 0) {
    return (value < 0 ? "-<" : "<") + formatter.format(0.01);
  }
  return formatter.format(value);
}

function formatMoneyCents(cents: number, currency: SaaSCurrency): string {
  return formatMoney(cents / 100, currency);
}

function formatSignedMoneyCents(cents: number, currency: SaaSCurrency): string {
  if (cents > 0) return "+" + formatMoneyCents(cents, currency);
  if (cents < 0) return "−" + formatMoneyCents(Math.abs(cents), currency);
  return formatMoneyCents(0, currency);
}

function formatPercent(value: number): string {
  if (value === 0) return "0.00%";
  if (Math.abs(value) < 0.00005) return value < 0 ? "−<0.01%" : "<0.01%";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMonths(value: number): string {
  if (value === 0) return "0.00 months";
  if (Math.abs(value) < 0.005) return value < 0 ? "−<0.01 months" : "<0.01 months";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " months";
}

function formatMultiple(value: number): string {
  if (value > 0 && value < 0.005) return "<0.01×";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + "×";
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatRawMoney(value: string, currency: SaaSCurrency): string {
  const raw = value.trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) return raw;
  const amount = Number(raw);
  return Number.isFinite(amount) ? formatMoney(amount, currency) : raw;
}

function optionalSummary(input: SaaSCalculatorInput): string | undefined {
  const currency = safeCurrency(input.currency);
  const entries: string[] = [];
  const accountValues = [
    ["start", input.startingAccounts],
    ["new", input.newAccounts],
    ["churned", input.churnedAccounts],
  ] as const;
  if (accountValues.some(([, value]) => value.trim() !== "")) {
    const present = accountValues.filter(([, value]) => value.trim() !== "");
    const complete = present.length === accountValues.length;
    const details = present.map(([label, value]) => value.trim() + " " + label).join(", ");
    entries.push("Accounts" + (complete ? ": " : " (incomplete): ") + details);
  }

  const marginValues = [
    ["recognized revenue", input.recognizedRevenue],
    ["COGS", input.recurringCogs],
  ] as const;
  if (marginValues.some(([, value]) => value.trim() !== "")) {
    const present = marginValues.filter(([, value]) => value.trim() !== "");
    const complete = present.length === marginValues.length;
    const details = present.map(([label, value]) => label + " " + formatRawMoney(value, currency)).join("; ");
    entries.push("Recurring revenue and COGS" + (complete ? ": " : " (incomplete): ") + details);
  }

  if (input.acquisitionSpend.trim() !== "") {
    const needsAccounts = accountValues.some(([, value]) => value.trim() === "");
    entries.push(
      "Acquisition spend" + (needsAccounts ? " (requires customer counts)" : "")
      + ": " + formatRawMoney(input.acquisitionSpend, currency),
    );
  }
  if (input.netCashBurn.trim() !== "") {
    entries.push("Net cash burn: " + formatRawMoney(input.netCashBurn, currency));
  }
  return entries.length ? entries.join("; ") : undefined;
}

function fieldError(errors: Partial<Record<SaaSField, string>>, field: SaaSField): string | null {
  return errors[field] ?? null;
}

function calculationRows(
  rows: { id: string; label: string; result: ReactNode; basis: ReactNode }[],
) {
  return rows.map((row) => ({
    id: row.id,
    cells: { metric: row.label, result: row.result, basis: row.basis },
  }));
}

function missingOptional(reason: string) {
  return { result: "Unavailable", basis: reason };
}

function ltvUnavailableReason(values: SaaSMetrics): string | null {
  if (!values.accounts) return "Add the customer-count group and recurring revenue/COGS group.";
  if (values.accounts.ending === 0) return "Unavailable because ending paying accounts are 0.";
  if (values.recognizedRevenueCents === null) return "Add the recognized revenue and COGS group.";
  if (values.recognizedRevenueCents === 0) return "Unavailable because recognized recurring revenue is 0.";
  if (values.grossMargin === null || values.grossMargin <= 0) return "Unavailable because gross margin must be positive.";
  if (values.accounts.starting === 0) return "Unavailable because customer churn is undefined at 0 starting accounts.";
  if (values.customerChurn === 0) return "Unavailable because customer churn is 0.";
  return null;
}

function paybackUnavailableReason(values: SaaSMetrics): string | null {
  if (!values.accounts) return "Add the customer-count group.";
  if (values.accounts.new === 0) return "Undefined because new paying accounts are 0.";
  if (values.acquisitionSpendCents === null) return "Add acquisition sales and marketing spend.";
  if (values.accounts.ending === 0) return "Unavailable because ending paying accounts are 0.";
  if (values.recognizedRevenueCents === null) return "Add the recognized revenue and COGS group.";
  if (values.recognizedRevenueCents === 0) return "Unavailable because recognized recurring revenue is 0.";
  if (values.grossMargin === null || values.grossMargin <= 0) return "Unavailable because gross margin must be positive.";
  return null;
}

function renderResults(
  values: SaaSMetrics,
  resultRef: RefObject<HTMLOutputElement | null>,
) {
  const currency = values.currency;
  const accountGroupMissing = "Add the customer-count group.";
  const movementRows = [
    { id: "starting", cells: { movement: "Starting MRR", amount: formatMoneyCents(values.startingMrrCents, currency) } },
    { id: "new", cells: { movement: "New MRR", amount: formatSignedMoneyCents(values.newMrrCents, currency) } },
    { id: "expansion", cells: { movement: "Expansion MRR", amount: formatSignedMoneyCents(values.expansionMrrCents, currency) } },
    { id: "contraction", cells: { movement: "Contraction MRR", amount: values.contractionMrrCents === 0 ? formatMoneyCents(0, currency) : "−" + formatMoneyCents(values.contractionMrrCents, currency) } },
    { id: "churned", cells: { movement: "Churned MRR", amount: values.churnedMrrCents === 0 ? formatMoneyCents(0, currency) : "−" + formatMoneyCents(values.churnedMrrCents, currency) } },
  ];
  const revenueRows = calculationRows([
    {
      id: "arr",
      label: "Ending ARR",
      result: formatMoneyCents(values.endingArrCents, currency),
      basis: "12 × ending MRR; annualized month-end run rate.",
    },
    {
      id: "net-new-mrr",
      label: "Net new MRR",
      result: formatSignedMoneyCents(values.netNewMrrCents, currency),
      basis: "Ending MRR − starting MRR.",
    },
    values.mrrGrowth === null
      ? { id: "mrr-growth", label: "MRR growth", ...missingOptional("Undefined because starting MRR is 0.") }
      : { id: "mrr-growth", label: "MRR growth", result: formatPercent(values.mrrGrowth), basis: "Net new MRR ÷ starting MRR." },
    values.nrr === null
      ? { id: "nrr", label: "Net revenue retention (NRR)", ...missingOptional("Undefined because starting MRR is 0.") }
      : { id: "nrr", label: "Net revenue retention (NRR)", result: formatPercent(values.nrr), basis: "(Starting MRR + expansion − contraction − churned MRR) ÷ starting MRR; excludes new MRR." },
    values.grr === null
      ? { id: "grr", label: "Gross revenue retention (GRR)", ...missingOptional("Undefined because starting MRR is 0.") }
      : { id: "grr", label: "Gross revenue retention (GRR)", result: formatPercent(values.grr), basis: "(Starting MRR − contraction − churned MRR) ÷ starting MRR; excludes new MRR." },
    values.accounts === null
      ? { id: "ending-accounts", label: "Ending paying accounts", ...missingOptional(accountGroupMissing) }
      : { id: "ending-accounts", label: "Ending paying accounts", result: formatCount(values.accounts.ending), basis: "Starting + new − churned starting accounts." },
    values.accounts === null
      ? { id: "customer-churn", label: "Customer churn", ...missingOptional(accountGroupMissing) }
      : values.customerChurn === null
        ? { id: "customer-churn", label: "Customer churn", ...missingOptional("Undefined because starting paying accounts are 0.") }
        : { id: "customer-churn", label: "Customer churn", result: formatPercent(values.customerChurn), basis: "Churned starting accounts ÷ starting paying accounts." },
  ]);

  const marginRows = calculationRows([
    values.recognizedRevenueCents === null
      ? { id: "gross-margin", label: "Gross margin", ...missingOptional("Add the recognized revenue and COGS group.") }
      : values.recognizedRevenueCents === 0
        ? { id: "gross-margin", label: "Gross margin", ...missingOptional("Undefined because recognized recurring revenue is 0.") }
        : { id: "gross-margin", label: "Gross margin", result: formatPercent(values.grossMargin ?? 0), basis: "(Recognized recurring revenue − recurring service COGS) ÷ recognized recurring revenue." },
    values.accounts === null
      ? { id: "arpa", label: "Monthly ARPA", ...missingOptional(accountGroupMissing) }
      : values.monthlyArpa === null
        ? { id: "arpa", label: "Monthly ARPA", ...missingOptional("Undefined because ending paying accounts are 0.") }
        : { id: "arpa", label: "Monthly ARPA", result: formatMoney(values.monthlyArpa, currency), basis: "Ending MRR ÷ ending paying accounts." },
    values.accounts === null
      ? { id: "cac", label: "Customer acquisition cost (CAC)", ...missingOptional("Add customer counts and acquisition spend.") }
      : values.accounts.new === 0
        ? { id: "cac", label: "Customer acquisition cost (CAC)", ...missingOptional("Undefined because new paying accounts are 0.") }
        : values.acquisitionSpendCents === null
          ? { id: "cac", label: "Customer acquisition cost (CAC)", ...missingOptional("Add acquisition sales and marketing spend.") }
          : { id: "cac", label: "Customer acquisition cost (CAC)", result: formatMoneyCents(values.acquisitionSpendCents / values.accounts.new, currency), basis: "Acquisition spend ÷ new paying accounts." },
    values.simpleLtv === null
      ? { id: "ltv", label: "Simple LTV estimate", ...missingOptional(ltvUnavailableReason(values) ?? "Unavailable from the supplied inputs.") }
      : { id: "ltv", label: "Simple LTV estimate", result: formatMoney(values.simpleLtv, currency), basis: "ARPA × gross-margin fraction ÷ monthly customer churn. Estimate assumes churn and margin stay stable." },
    values.cacPaybackMonths === null
      ? { id: "payback", label: "Margin-aware CAC payback", ...missingOptional(paybackUnavailableReason(values) ?? "Unavailable from the supplied inputs.") }
      : { id: "payback", label: "Margin-aware CAC payback", result: formatMonths(values.cacPaybackMonths), basis: "CAC ÷ (monthly ARPA × gross-margin fraction)." },
  ]);

  const burnRow = values.netCashBurnCents === null
    ? { id: "burn", label: "Burn multiple", ...missingOptional("Add net cash burn.") }
    : values.netNewMrrCents <= 0
      ? { id: "burn", label: "Burn multiple", ...missingOptional("Undefined because net new MRR is 0 or negative.") }
      : values.netCashBurnCents < 0
        ? { id: "burn", label: "Burn multiple", ...missingOptional("Cash generating.") }
        : { id: "burn", label: "Burn multiple", result: formatMultiple(values.burnMultiple ?? 0), basis: "Net cash burn ÷ (12 × net new MRR); net new MRR is annualized for the same month." };

  return (
    <section aria-label="SaaS metrics results" className={styles.results}>
      <UiPrimaryResult
        detail={values.monthLabel + " · ARR below is an annualized end-of-month run rate."}
        inputRef={resultRef}
        label="Ending MRR"
        value={formatMoneyCents(values.endingMrrCents, currency)}
      />
      <UiDataTable
        ariaLabel="Monthly MRR movements"
        columns={[{ id: "movement", label: "Movement" }, { id: "amount", label: "Amount", align: "right" }]}
        rows={movementRows}
      />
      <p className={styles.formula}>Ending MRR = starting MRR + new MRR + expansion MRR − contraction MRR − churned MRR.</p>

      <section aria-labelledby="revenue-title" className={styles.resultGroup}>
        <h2 id="revenue-title">Revenue and retention</h2>
        <UiDataTable
          ariaLabel="Revenue and retention metrics"
          columns={[{ id: "metric", label: "Metric" }, { id: "result", label: "Result" }, { id: "basis", label: "Calculation basis or unavailable reason" }]}
          rows={revenueRows}
        />
      </section>

      <section aria-labelledby="margin-title" className={styles.resultGroup}>
        <h2 id="margin-title">Margin and acquisition</h2>
        <UiDataTable
          ariaLabel="Margin and acquisition metrics"
          columns={[{ id: "metric", label: "Metric" }, { id: "result", label: "Result" }, { id: "basis", label: "Calculation basis or unavailable reason" }]}
          rows={marginRows}
        />
      </section>

      <section aria-labelledby="cash-title" className={styles.resultGroup}>
        <h2 id="cash-title">Cash efficiency</h2>
        <UiDataTable
          ariaLabel="Cash efficiency metrics"
          columns={[{ id: "metric", label: "Metric" }, { id: "result", label: "Result" }, { id: "basis", label: "Calculation basis or unavailable reason" }]}
          rows={calculationRows([burnRow])}
        />
      </section>

      <p className={styles.note}>Check ledger classification, cost allocation, and customer acquisition attribution separately; the calculator cannot verify those inputs.</p>
    </section>
  );
}

export function SaaSMetricsCalculator() {
  const [input, setInput] = useState<SaaSCalculatorInput>(emptyInput);
  const [errors, setErrors] = useState<Partial<Record<SaaSField, string>>>({});
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);
  const [status, setStatus] = useState("");
  const [unexpectedFailure, setUnexpectedFailure] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function update(field: SaaSField, value: string) {
    const hadResult = metrics !== null;
    setInput((current) => ({ ...current, [field]: value }));
    setErrors({});
    setMetrics(null);
    setUnexpectedFailure(false);
    setStatus(hadResult ? "Inputs changed. Calculate again." : "");
  }

  function focusField(field: SaaSField) {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[data-focus-key="' + field + '"]')?.focus();
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setUnexpectedFailure(false);
    try {
      const result: SaaSCalculation = calculateSaasMetrics(input);
      if (result.status === "invalid") {
        setErrors(result.errors);
        setMetrics(null);
        const firstError = fieldsInOrder.find((field) => Boolean(result.errors[field]));
        if (firstError) {
          if (optionalFields.has(firstError)) setOptionalOpen(true);
          focusField(firstError);
        }
        return;
      }
      setErrors({});
      setMetrics(result.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setMetrics(null);
      setErrors({});
      setUnexpectedFailure(true);
    }
  }

  function reset() {
    setInput(emptyInput());
    setErrors({});
    setMetrics(null);
    setUnexpectedFailure(false);
    setOptionalOpen(false);
    setStatus("Calculator reset.");
    requestAnimationFrame(() => monthRef.current?.focus());
  }

  const currency = safeCurrency(input.currency);
  const summary = optionalSummary(input);

  return (
    <section aria-label="SaaS metrics inputs and results" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={submit} ref={formRef}>
          <div className={styles.fieldGrid}>
            <RawTextField
              dataFocusKey="reportingMonth"
              description="Use the same calendar month for all figures."
              error={fieldError(errors, "reportingMonth")}
              inputMode="text"
              inputRef={monthRef}
              label="Reporting month"
              onChange={(value) => update("reportingMonth", value)}
              placeholder="YYYY-MM"
              required
              value={input.reportingMonth}
            />
            <UiSelect
              dataFocusKey="currency"
              error={fieldError(errors, "currency")}
              label="Currency"
              onChange={(value) => update("currency", value)}
              options={SAAS_CURRENCIES.map((option) => uiOption(option, option))}
              required
              value={input.currency}
            />
          </div>

          <section aria-labelledby="mrr-fields-title" className={styles.inputGroup}>
            <h2 id="mrr-fields-title">Monthly MRR ({currency})</h2>
            <div className={styles.fieldGrid}>
              <RawTextField
                className={styles.wide}
                dataFocusKey="startingMrr"
                error={fieldError(errors, "startingMrr")}
                inputMode="decimal"
                label="Starting MRR"
                onChange={(value) => update("startingMrr", value)}
                required
                value={input.startingMrr}
              />
            </div>
            <h3>During the month</h3>
            <p className={styles.helper}>Enter 0 for a movement that did not happen.</p>
            <div className={styles.fieldGrid}>
              <RawTextField
                dataFocusKey="newMrr"
                error={fieldError(errors, "newMrr")}
                inputMode="decimal"
                label="New MRR"
                onChange={(value) => update("newMrr", value)}
                required
                value={input.newMrr}
              />
              <RawTextField
                dataFocusKey="expansionMrr"
                error={fieldError(errors, "expansionMrr")}
                inputMode="decimal"
                label="Expansion MRR"
                onChange={(value) => update("expansionMrr", value)}
                required
                value={input.expansionMrr}
              />
              <RawTextField
                dataFocusKey="contractionMrr"
                error={fieldError(errors, "contractionMrr")}
                inputMode="decimal"
                label="Contraction MRR"
                onChange={(value) => update("contractionMrr", value)}
                required
                value={input.contractionMrr}
              />
              <RawTextField
                dataFocusKey="churnedMrr"
                error={fieldError(errors, "churnedMrr")}
                inputMode="decimal"
                label="Churned MRR"
                onChange={(value) => update("churnedMrr", value)}
                required
                value={input.churnedMrr}
              />
            </div>
          </section>

          <UiDisclosure
            isExpanded={optionalOpen}
            label="Add customer, cost, and cash metrics"
            onExpandedChange={setOptionalOpen}
            summary={summary}
          >
            <div className={styles.optionalFields}>
              <section aria-labelledby="account-fields-title" className={styles.inputGroup}>
                <h2 id="account-fields-title">Customer counts</h2>
                <p className={styles.helper}>Use the same paying-account unit for all three counts.</p>
                <div className={styles.fieldGrid}>
                  <RawTextField
                    dataFocusKey="startingAccounts"
                    error={fieldError(errors, "startingAccounts")}
                    inputMode="numeric"
                    label="Starting paying accounts"
                    onChange={(value) => update("startingAccounts", value)}
                    value={input.startingAccounts}
                  />
                  <RawTextField
                    dataFocusKey="newAccounts"
                    error={fieldError(errors, "newAccounts")}
                    inputMode="numeric"
                    label="New paying accounts"
                    onChange={(value) => update("newAccounts", value)}
                    value={input.newAccounts}
                  />
                  <RawTextField
                    dataFocusKey="churnedAccounts"
                    error={fieldError(errors, "churnedAccounts")}
                    inputMode="numeric"
                    label="Churned starting accounts"
                    onChange={(value) => update("churnedAccounts", value)}
                    value={input.churnedAccounts}
                  />
                </div>
              </section>

              <section aria-labelledby="margin-inputs-title" className={styles.inputGroup}>
                <h2 id="margin-inputs-title">Recurring revenue and service costs ({currency})</h2>
                <p className={styles.helper}>Recognized revenue is not cash collected.</p>
                <div className={styles.fieldGrid}>
                  <RawTextField
                    dataFocusKey="recognizedRevenue"
                    error={fieldError(errors, "recognizedRevenue")}
                    inputMode="decimal"
                    label="Recognized recurring revenue"
                    onChange={(value) => update("recognizedRevenue", value)}
                    value={input.recognizedRevenue}
                  />
                  <RawTextField
                    dataFocusKey="recurringCogs"
                    error={fieldError(errors, "recurringCogs")}
                    inputMode="decimal"
                    label="Recurring service COGS"
                    onChange={(value) => update("recurringCogs", value)}
                    value={input.recurringCogs}
                  />
                </div>
              </section>

              <section aria-labelledby="acquisition-input-title" className={styles.inputGroup}>
                <h2 id="acquisition-input-title">Acquisition spend ({currency}; requires customer counts)</h2>
                <RawTextField
                  dataFocusKey="acquisitionSpend"
                  error={fieldError(errors, "acquisitionSpend")}
                  inputMode="decimal"
                  label="Acquisition sales and marketing spend"
                  onChange={(value) => update("acquisitionSpend", value)}
                  value={input.acquisitionSpend}
                />
              </section>

              <section aria-labelledby="cash-input-title" className={styles.inputGroup}>
                <h2 id="cash-input-title">Net cash burn ({currency})</h2>
                <RawTextField
                  dataFocusKey="netCashBurn"
                  description="Negative means cash generated."
                  error={fieldError(errors, "netCashBurn")}
                  inputMode="decimal"
                  label="Net cash burn"
                  onChange={(value) => update("netCashBurn", value)}
                  value={input.netCashBurn}
                />
              </section>
            </div>
          </UiDisclosure>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate SaaS metrics</UiButton>
            <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
          </UiActionRow>

          {status ? <UiStatus>{status}</UiStatus> : null}
          {unexpectedFailure
            ? <UiStatus tone="danger">Metrics could not be calculated. Try again.</UiStatus>
            : null}
        </form>

        {metrics
          ? renderResults(metrics, resultRef)
          : <p className={styles.initial}>The five required MRR figures produce an ending MRR snapshot.</p>}
      </div>
    </section>
  );
}
