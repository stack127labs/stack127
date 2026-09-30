"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent, type RefObject } from "react";
import { UiButton, UiChoiceGroup, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  calculateSaasGrossMargin,
  SAAS_GROSS_MARGIN_COST_CATEGORIES,
  SAAS_GROSS_MARGIN_CURRENCIES,
  type SaaSGrossMarginCalculation,
  type SaaSGrossMarginCostField,
  type SaaSGrossMarginCurrency,
  type SaaSGrossMarginField,
  type SaaSGrossMarginInput,
  type SaaSGrossMarginScope,
  type SaaSGrossMarginValues,
} from "@/lib/saas-gross-margin-calculator/engine";
import styles from "./saas-gross-margin-calculator.module.css";

type StringInputField = Exclude<keyof SaaSGrossMarginInput, "currency" | "revenueScope">;
type StatusMessage = { text: string; tone: "neutral" | "danger" };

function emptyInput(): SaaSGrossMarginInput {
  return {
    reportingPeriod: "",
    revenueScope: "company",
    scopeName: "",
    currency: "USD",
    recognizedRevenue: "",
    hostingInfrastructure: "",
    thirdPartyDelivery: "",
    paymentProcessing: "",
    supportPeople: "",
    otherCostOfRevenue: "",
  };
}

function currencySymbol(currency: SaaSGrossMarginCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatInteger(value: bigint): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatMoney(cents: bigint, currency: SaaSGrossMarginCurrency): string {
  const negative = cents < 0n;
  const magnitude = negative ? -cents : cents;
  const whole = formatInteger(magnitude / 100n);
  const fraction = (magnitude % 100n).toString().padStart(2, "0");
  return `${negative ? "−" : ""}${currencySymbol(currency)}${whole}.${fraction}`;
}

function formatMargin(values: SaaSGrossMarginValues): string {
  const hundredths = values.grossMarginHundredths;
  if (hundredths === null) return "Undefined";
  if (values.grossMarginRoundedToZero) return hundredths < 0n || values.grossProfitCents < 0n ? "−<0.01%" : "<0.01%";

  const negative = hundredths < 0n;
  const magnitude = negative ? -hundredths : hundredths;
  return `${negative ? "−" : ""}${formatInteger(magnitude / 100n)}.${(magnitude % 100n).toString().padStart(2, "0")}%`;
}

function scopeLabel(values: SaaSGrossMarginValues): string {
  if (values.revenueScope === "company") return "Entire company";
  if (values.revenueScope === "subscription") return "Subscription service";
  return `Named product or service: ${values.scopeName ?? ""}`;
}

function GrossMarginResults({
  values,
  resultRef,
}: {
  values: SaaSGrossMarginValues;
  resultRef: RefObject<HTMLOutputElement | null>;
}) {
  const scope = scopeLabel(values);
  const detail = values.grossMarginHundredths === null
    ? `${values.reportingPeriod} · ${scope}. Undefined because recognized revenue is zero.`
    : `${values.reportingPeriod} · ${scope}.`;
  const rows = [
    { id: "revenue", cells: { item: "Recognized revenue", amount: formatMoney(values.recognizedRevenueCents, values.currency) } },
    ...SAAS_GROSS_MARGIN_COST_CATEGORIES.map((category) => ({
      id: category.field,
      cells: { item: category.label, amount: formatMoney(values.costsCents[category.field], values.currency) },
    })),
    { id: "total-cost", cells: { item: "Total cost of revenue", amount: formatMoney(values.costOfRevenueCents, values.currency) } },
  ];

  return (
    <section aria-label="Gross margin results" className={styles.results}>
      <UiPrimaryResult
        detail={detail}
        inputRef={resultRef}
        label="Gross margin"
        value={formatMargin(values)}
      />
      <UiKeyValueList rows={[{ label: "Gross profit", value: formatMoney(values.grossProfitCents, values.currency) }]} />
      <p className={styles.formula}>Gross margin = gross profit ÷ recognized revenue × 100.</p>
      <section aria-labelledby="delivery-costs-title" className={styles.resultGroup}>
        <h2 id="delivery-costs-title">Revenue and delivery costs</h2>
        <UiDataTable
          ariaLabel="Revenue and delivery costs"
          caption={`${values.currency} amounts for ${values.reportingPeriod} and ${scope}.`}
          columns={[{ id: "item", label: "Item" }, { id: "amount", label: "Amount", align: "right" }]}
          rows={rows}
        />
      </section>
    </section>
  );
}

export function SaaSGrossMarginCalculator() {
  const [input, setInput] = useState<SaaSGrossMarginInput>(emptyInput);
  const [errors, setErrors] = useState<Partial<Record<SaaSGrossMarginField, string>>>({});
  const [result, setResult] = useState<SaaSGrossMarginValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const periodRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function updateString(field: StringInputField, value: string) {
    const hadResult = result !== null;
    setInput((current) => ({ ...current, [field]: value }));
    setErrors({});
    setResult(null);
    if (hadResult) {
      setStatus({ text: "Inputs changed. Calculate again.", tone: "neutral" });
    } else if (status?.text !== "Inputs changed. Calculate again.") {
      setStatus(null);
    }
  }

  function updateScope(value: string) {
    if (value !== "company" && value !== "subscription" && value !== "named") return;
    const hadResult = result !== null;
    setInput((current) => ({ ...current, revenueScope: value as SaaSGrossMarginScope }));
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: "Inputs changed. Calculate again.", tone: "neutral" });
    else if (status?.text !== "Inputs changed. Calculate again.") setStatus(null);
  }

  function updateCurrency(value: string) {
    if (!SAAS_GROSS_MARGIN_CURRENCIES.includes(value as SaaSGrossMarginCurrency)) return;
    const hadResult = result !== null;
    setInput((current) => ({ ...current, currency: value as SaaSGrossMarginCurrency }));
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: "Inputs changed. Calculate again.", tone: "neutral" });
    else if (status?.text !== "Inputs changed. Calculate again.") setStatus(null);
  }

  function focusField(field: SaaSGrossMarginField) {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${field}"]`)?.focus();
    });
  }

  function focusFirstError(nextErrors: Partial<Record<SaaSGrossMarginField, string>>) {
    const visibleOrder: SaaSGrossMarginField[] = [
      "reportingPeriod",
      "revenueScope",
      ...(input.revenueScope === "named" ? ["scopeName" as const] : []),
      "recognizedRevenue",
      "currency",
      ...SAAS_GROSS_MARGIN_COST_CATEGORIES.map(({ field }) => field),
    ];
    const first = visibleOrder.find((field) => nextErrors[field]);
    if (first) focusField(first);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation: SaaSGrossMarginCalculation = calculateSaasGrossMargin(input);
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        focusFirstError(calculation.errors);
        return;
      }
      setErrors({});
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setErrors({});
      setResult(null);
      setStatus({ text: "The gross margin could not be calculated. Try again.", tone: "danger" });
    }
  }

  function reset() {
    setInput(emptyInput());
    setErrors({});
    setResult(null);
    setStatus({ text: "Calculator reset.", tone: "neutral" });
    requestAnimationFrame(() => periodRef.current?.focus());
  }

  return (
    <section aria-label="SaaS gross margin calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Gross margin inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <UiTextField
            autoCapitalize="none"
            dataFocusKey="reportingPeriod"
            error={errors.reportingPeriod ?? null}
            inputMode="text"
            inputRef={periodRef}
            label="Reporting period"
            onChange={(value) => updateString("reportingPeriod", value)}
            placeholder="April 2026"
            required
            spellCheck={false}
            value={input.reportingPeriod}
          />

          <UiChoiceGroup
            dataFocusKey="revenueScope"
            description="Use recognized revenue and delivery costs for the same period and scope."
            error={errors.revenueScope ?? null}
            label="Revenue scope"
            onChange={updateScope}
            options={[
              uiOption("company", "Entire company"),
              uiOption("subscription", "Subscription service"),
              uiOption("named", "Named product or service"),
            ]}
            required
            value={input.revenueScope}
          />

          {input.revenueScope === "named" ? (
            <UiTextField
              autoCapitalize="none"
              dataFocusKey="scopeName"
              error={errors.scopeName ?? null}
              inputMode="text"
              label="Product or service name"
              onChange={(value) => updateString("scopeName", value)}
              required
              spellCheck={false}
              value={input.scopeName}
            />
          ) : null}

          <div className={styles.fieldGrid}>
            <UiTextField
              autoCapitalize="none"
              dataFocusKey="recognizedRevenue"
              description="Use revenue recognized for this period and scope."
              error={errors.recognizedRevenue ?? null}
              inputMode="decimal"
              label="Recognized revenue"
              onChange={(value) => updateString("recognizedRevenue", value)}
              required
              spellCheck={false}
              value={input.recognizedRevenue}
            />
            <UiSelect
              dataFocusKey="currency"
              error={errors.currency ?? null}
              label="Currency"
              onChange={updateCurrency}
              options={SAAS_GROSS_MARGIN_CURRENCIES.map((currency) => uiOption(currency, currency))}
              required
              value={input.currency}
            />
          </div>

          <section aria-labelledby="cost-inputs-title" className={styles.inputGroup}>
            <h2 id="cost-inputs-title">Cost of revenue ({input.currency})</h2>
            <p className={styles.helper}>Enter 0 when a cost does not apply.</p>
            <div className={styles.fieldGrid}>
              {SAAS_GROSS_MARGIN_COST_CATEGORIES.map((category) => (
                <UiTextField
                  autoCapitalize="none"
                  dataFocusKey={category.field}
                  error={errors[category.field] ?? null}
                  inputMode="decimal"
                  key={category.field}
                  label={category.label}
                  onChange={(value) => updateString(category.field as SaaSGrossMarginCostField, value)}
                  required
                  spellCheck={false}
                  value={input[category.field]}
                />
              ))}
            </div>
          </section>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate gross margin</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <GrossMarginResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}
