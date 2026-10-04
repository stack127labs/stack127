"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  LTV_CAC_CAC_SCOPES,
  LTV_CAC_CAC_SOURCES,
  LTV_CAC_LTV_SOURCES,
  LTV_CAC_SCENARIO_FIELDS,
  calculateLtvCac,
  type LtvCacCac,
  type LtvCacCacScope,
  type LtvCacCacSource,
  type LtvCacErrors,
  type LtvCacFieldKey,
  type LtvCacLtvSource,
  type LtvCacMoney,
  type LtvCacRatio,
  type LtvCacScenarioField,
  type LtvCacScenarioInput,
  type LtvCacScenarioKey,
  type LtvCacScenarioValues,
  type LtvCacValues,
} from "@/lib/ltv-cac-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import { SAAS_PERIOD_BASES, type SaasPeriodBasis, type StraightLinePayback } from "@/lib/saas-economics/unit-economics";
import styles from "./ltv-cac-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };
type ProfitSign = "positive" | "zero" | "negative";
type CalculatorInput = {
  currency: string;
  ltvSource: LtvCacLtvSource;
  cacSource: LtvCacCacSource;
  basis: SaasPeriodBasis;
  compare: boolean;
  baseline: LtvCacScenarioInput;
  alternative: LtvCacScenarioInput;
};

const CHANGED = "Inputs changed. Calculate again.";
const MARGIN_HELP = "After hosting, support, payment fees, and other costs to serve.";
const CHURN_HELP = "Use customer churn, not revenue churn.";
const DIRECT_LTV_HELP = "Gross profit per customer, not revenue.";
const SCOPE_HELP = "Ads, sales and marketing pay, tools, and agencies.";
const SCENARIO_NOTE = "Use the same customers for LTV and CAC.";

function emptyScenario(): LtvCacScenarioInput {
  return {
    arpa: "",
    grossMarginPercent: "",
    churnPercent: "",
    ltv: "",
    cac: "",
    acquisitionSpend: "",
    newCustomers: "",
    cacScope: "",
  };
}

function emptyInput(): CalculatorInput {
  return {
    currency: "USD",
    ltvSource: "model",
    cacSource: "direct",
    basis: "month",
    compare: false,
    baseline: emptyScenario(),
    alternative: emptyScenario(),
  };
}

function isLtvSource(value: string): value is LtvCacLtvSource {
  return LTV_CAC_LTV_SOURCES.includes(value as LtvCacLtvSource);
}

function isCacSource(value: string): value is LtvCacCacSource {
  return LTV_CAC_CAC_SOURCES.includes(value as LtvCacCacSource);
}

function isBasis(value: string): value is SaasPeriodBasis {
  return SAAS_PERIOD_BASES.includes(value as SaasPeriodBasis);
}

function isScope(value: string): value is LtvCacCacScope {
  return LTV_CAC_CAC_SCOPES.includes(value as LtvCacCacScope);
}

function formatInteger(value: bigint): string {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString();
  return `${negative ? "−" : ""}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function currencySymbol(currency: SaasEconomicsCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatMoney(cents: bigint, currency: SaasEconomicsCurrency): string {
  const negative = cents < 0n;
  const magnitude = negative ? -cents : cents;
  const fraction = (magnitude % 100n).toString().padStart(2, "0");
  return `${negative ? "−" : ""}${currencySymbol(currency)}${formatInteger(magnitude / 100n)}.${fraction}`;
}

function formatPercent(hundredths: bigint): string {
  const negative = hundredths < 0n;
  const magnitude = negative ? -hundredths : hundredths;
  const fraction = (magnitude % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${negative ? "−" : ""}${formatInteger(magnitude / 100n)}${fraction ? `.${fraction}` : ""}%`;
}

function formatTenths(tenths: bigint): string {
  const magnitude = tenths < 0n ? -tenths : tenths;
  return `${formatInteger(magnitude / 10n)}.${magnitude % 10n}`;
}

function formatRatio(hundredths: bigint): string {
  const magnitude = hundredths < 0n ? -hundredths : hundredths;
  return `${formatInteger(magnitude / 100n)}.${(magnitude % 100n).toString().padStart(2, "0")}:1`;
}

function signedMoney(money: LtvCacMoney, currency: SaasEconomicsCurrency, sign: ProfitSign): string {
  if (!money.roundedToZero) return formatMoney(money.cents, currency);
  return sign === "negative" ? `Loss under ${formatMoney(1n, currency)}` : `Under ${formatMoney(1n, currency)}`;
}

function plainMoney(money: LtvCacMoney, currency: SaasEconomicsCurrency): string {
  return money.roundedToZero ? `Under ${formatMoney(1n, currency)}` : formatMoney(money.cents, currency);
}

function cacText(cac: LtvCacCac, currency: SaasEconomicsCurrency): string {
  return cac.roundedToZero ? `Under ${formatMoney(1n, currency)}` : formatMoney(cac.cents, currency);
}

function ltvText(scenario: LtvCacScenarioValues, currency: SaasEconomicsCurrency): string {
  if (scenario.ltv.source === "direct") return plainMoney(scenario.ltv.value, currency);
  if (!scenario.ltv.value) return "Not estimable";
  return signedMoney(scenario.ltv.value, currency, scenario.ltv.grossProfitSign);
}

function ratioValue(ratio: LtvCacRatio): string {
  if (ratio.kind === "finite") return ratio.hundredthsUnderOne ? "Under 0.01:1" : formatRatio(ratio.hundredths);
  if (ratio.kind === "ltvNotEstimable") return "Not estimable";
  if (ratio.kind === "zeroAcquisitionCost") return "No CAC to compare";
  return "LTV below zero";
}

function ratioLabel(scope: LtvCacCacScope, prefix: string | null): string {
  const name = scope === "paidMedia" ? "LTV to paid media CAC" : "LTV:CAC";
  return prefix ? `${prefix} ${name}` : name;
}

function scopeLabel(scope: LtvCacCacScope): string {
  return scope === "paidMedia" ? "Paid media only" : "All acquisition costs";
}

function formatLifetime(tenths: bigint, basis: SaasPeriodBasis): string {
  const unit = basis === "month" ? (tenths === 10n ? "month" : "months") : (tenths === 10n ? "year" : "years");
  return `${formatInteger(tenths / 10n)}.${tenths % 10n} ${unit}`;
}

function paybackSentence(payback: StraightLinePayback, currency: SaasEconomicsCurrency): string | null {
  if (payback.kind === "zeroAcquisitionCost") return null;
  if (payback.kind === "never") {
    return payback.reason === "zeroGrossProfit"
      ? `CAC payback: never, because gross profit per customer is ${formatMoney(0n, currency)}.`
      : "CAC payback: never, because gross profit per customer is negative.";
  }
  if (payback.tenthsUnderOne) return "CAC payback: under 0.1 months of gross profit.";
  const unit = payback.tenths === 10n ? "month" : "months";
  return `CAC payback: ${formatTenths(payback.tenths)} ${unit} of gross profit.`;
}

function ratioDelta(delta: bigint): string {
  if (delta === 0n) return "Same ratio as baseline.";
  const magnitude = delta < 0n ? -delta : delta;
  const amount = `${formatInteger(magnitude / 100n)}.${(magnitude % 100n).toString().padStart(2, "0")}`;
  return `${amount} ${delta < 0n ? "lower" : "higher"} than baseline.`;
}

function paybackDelta(delta: bigint): string {
  if (delta === 0n) return "Same payback.";
  const magnitude = delta < 0n ? -delta : delta;
  const unit = magnitude === 10n ? "month" : "months";
  return `Payback ${formatTenths(magnitude)} ${unit} ${delta < 0n ? "sooner" : "later"}.`;
}

function activeFields(input: CalculatorInput): LtvCacScenarioField[] {
  return [
    ...(input.ltvSource === "model" ? ["arpa", "grossMarginPercent", "churnPercent"] as const : ["ltv"] as const),
    ...(input.cacSource === "direct" ? ["cac"] as const : ["acquisitionSpend", "newCustomers"] as const),
    "cacScope",
  ];
}

function ScenarioLead({
  comparison,
  currency,
  inputRef,
  label,
  showPayback,
  values,
}: {
  comparison: string[];
  currency: SaasEconomicsCurrency;
  inputRef?: RefObject<HTMLOutputElement | null>;
  label: string;
  showPayback: boolean;
  values: LtvCacScenarioValues;
}) {
  const lines: string[] = [];
  if (values.ratio.kind === "ltvNotEstimable") lines.push("With 0% churn, LTV has no finite estimate in this model.");
  else if (values.ratio.kind === "zeroAcquisitionCost") lines.push(`CAC is ${formatMoney(0n, currency)}, so there's nothing to divide by.`);
  else if (values.ratio.kind === "negativeLtv") lines.push(`Estimated gross-profit LTV: ${ltvText(values, currency)}. Each customer costs more to serve than they pay.`);
  else lines.push(`${ltvText(values, currency)} LTV ÷ ${cacText(values.cac, currency)} CAC.`);
  if (showPayback && values.payback) {
    const payback = paybackSentence(values.payback, currency);
    if (payback) lines.push(payback);
  }
  if (values.cohortRecovers === false) lines.push("At this churn, a group of new customers never earns back CAC.");
  if (values.cacScope === "paidMedia") lines.push("Leaves out pay, tools, agencies, and other acquisition costs.");
  lines.push(...comparison);

  return (
    <UiPrimaryResult
      detail={<span className={styles.detailLines}>{lines.map((line) => <span key={line}>{line}</span>)}</span>}
      inputRef={inputRef}
      label={label}
      value={ratioValue(values.ratio)}
    />
  );
}

function cellStack(amount: ReactNode, note?: string | null) {
  if (!note) return amount;
  return (
    <span className={styles.cellStack}>
      <span>{amount}</span>
      <span className={styles.cellNote}>{note}</span>
    </span>
  );
}

function LtvCacResults({ resultRef, values }: { resultRef: RefObject<HTMLOutputElement | null>; values: LtvCacValues }) {
  const { alternative, baseline, basis, comparison, currency, ltvSource } = values;
  const scenarios: [LtvCacScenarioKey, LtvCacScenarioValues][] = alternative
    ? [["baseline", baseline], ["alternative", alternative]]
    : [["baseline", baseline]];
  const comparing = alternative !== null;
  const period = basis === "year" ? "year" : "month";

  function row(id: string, item: string, cell: (scenario: LtvCacScenarioValues) => ReactNode) {
    return {
      id,
      cells: Object.fromEntries([["item", item], ...scenarios.map(([key, scenario]) => [key, cell(scenario)])]),
    };
  }

  const rows = [
    ...(ltvSource === "model" ? [
      row("arpa", "ARPA", (scenario) => scenario.ltv.source === "model" ? formatMoney(scenario.ltv.arpaCents, currency) : "n/a"),
      row("margin", "Gross margin", (scenario) => scenario.ltv.source === "model" ? formatPercent(scenario.ltv.grossMarginHundredths) : "n/a"),
      row("profit", period === "year" ? "Gross profit per year" : "Gross profit per month", (scenario) => (
        scenario.ltv.source === "model" ? signedMoney(scenario.ltv.periodGrossProfit, currency, scenario.ltv.grossProfitSign) : "n/a"
      )),
      row("churn", "Customer churn", (scenario) => scenario.ltv.source === "model" ? formatPercent(scenario.ltv.churnHundredths) : "n/a"),
      row("lifetime", "Model lifetime", (scenario) => (
        scenario.ltv.source === "model" && scenario.ltv.lifetimeTenths !== null && basis
          ? formatLifetime(scenario.ltv.lifetimeTenths, basis)
          : "n/a"
      )),
      row("ltv", "LTV", (scenario) => ltvText(scenario, currency)),
    ] : [row("ltv", "LTV, entered", (scenario) => ltvText(scenario, currency))]),
    row("cac", "CAC", (scenario) => {
      const note = scenario.cac.acquisitionSpendCents !== null && scenario.cac.newCustomers !== null
        ? `${formatMoney(scenario.cac.acquisitionSpendCents, currency)} ÷ ${formatInteger(scenario.cac.newCustomers)} ${scenario.cac.newCustomers === 1n ? "customer" : "customers"}`
        : null;
      return cellStack(cacText(scenario.cac, currency), note);
    }),
    row("scope", "CAC includes", (scenario) => scopeLabel(scenario.cacScope)),
  ];

  const alternativeLines = [
    comparison?.ratioHundredthsDelta == null ? null : ratioDelta(comparison.ratioHundredthsDelta),
    comparison?.paybackTenthsDelta == null ? null : paybackDelta(comparison.paybackTenthsDelta),
  ].filter((line): line is string => line !== null);

  return (
    <section aria-label="LTV to CAC results" className={styles.results}>
      <div className={comparing ? styles.leadPair : styles.leadSingle}>
        <ScenarioLead
          comparison={[]}
          currency={currency}
          inputRef={resultRef}
          label={ratioLabel(baseline.cacScope, comparing ? "Baseline" : null)}
          showPayback={ltvSource === "model"}
          values={baseline}
        />
        {alternative ? (
          <ScenarioLead
            comparison={alternativeLines}
            currency={currency}
            label={ratioLabel(alternative.cacScope, "Alternative")}
            showPayback={ltvSource === "model"}
            values={alternative}
          />
        ) : null}
      </div>
      <UiDataTable
        ariaLabel="How each answer is built"
        caption={`How each answer is built, in ${currency}`}
        columns={[
          { id: "item", label: "Item" },
          { id: "baseline", label: comparing ? "Baseline" : "Value", align: "right" },
          ...(comparing ? [{ id: "alternative", label: "Alternative", align: "right" as const }] : []),
        ]}
        rows={rows}
      />
      <div className={styles.formula}>
        <p>
          {ltvSource === "direct"
            ? "LTV:CAC = LTV ÷ CAC."
            : basis === "year"
              ? "LTV:CAC = LTV ÷ CAC. Payback = CAC ÷ (yearly gross profit ÷ 12)."
              : "LTV:CAC = LTV ÷ CAC. Payback = CAC ÷ monthly gross profit."}
        </p>
      </div>
    </section>
  );
}

export function LtvCacCalculator() {
  const [input, setInput] = useState<CalculatorInput>(emptyInput);
  const [errors, setErrors] = useState<LtvCacErrors>({});
  const [result, setResult] = useState<LtvCacValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const alternativeSeeded = useRef(false);
  const focusRequest = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);
  const fields = activeFields(input);
  const arpaLabel = input.basis === "month" ? "Monthly ARPA" : "Yearly ARPA";
  const churnLabel = input.basis === "month" ? "Monthly customer churn" : "Yearly customer churn";

  useEffect(() => {
    const key = focusRequest.current;
    if (!key) return;
    focusRequest.current = null;
    if (key === "result") {
      resultRef.current?.focus();
      return;
    }
    formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
  });

  function requestFocus(key: string) {
    focusRequest.current = key;
  }

  function change(update: (current: CalculatorInput) => CalculatorInput) {
    const hadResult = result !== null;
    setInput(update);
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: CHANGED, tone: "neutral" });
    else if (status?.text !== CHANGED) setStatus(null);
  }

  function updateField(scenario: LtvCacScenarioKey, field: LtvCacScenarioField, value: string) {
    change((current) => ({ ...current, [scenario]: { ...current[scenario], [field]: value } }));
  }

  function toggleCompare(selected: boolean) {
    const seed = selected && !alternativeSeeded.current;
    if (seed) alternativeSeeded.current = true;
    change((current) => {
      if (!seed) return { ...current, compare: selected };
      const alternative = { ...current.alternative };
      for (const field of LTV_CAC_SCENARIO_FIELDS) {
        if (!alternative[field].trim()) alternative[field] = current.baseline[field];
      }
      return { ...current, compare: selected, alternative };
    });
  }

  function focusFirstError(nextErrors: LtvCacErrors) {
    const order: LtvCacFieldKey[] = [
      "currency",
      "ltvSource",
      ...(input.ltvSource === "model" ? ["basis" as const] : []),
      "cacSource",
      ...fields.map((field) => `baseline.${field}` as const),
      ...(input.compare ? fields.map((field) => `alternative.${field}` as const) : []),
    ];
    const first = order.find((key) => nextErrors[key]);
    if (first) requestFocus(first);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateLtvCac(input);
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        if (calculation.errors.form) setStatus({ text: calculation.errors.form, tone: "danger" });
        focusFirstError(calculation.errors);
        return;
      }
      setErrors({});
      setResult(calculation.values);
      requestFocus("result");
    } catch {
      setErrors({});
      setResult(null);
      setStatus({ text: "Couldn't calculate. Try again.", tone: "danger" });
    }
  }

  function reset() {
    alternativeSeeded.current = false;
    setInput(emptyInput());
    setErrors({});
    setResult(null);
    setStatus({ text: "Form reset.", tone: "neutral" });
    requestFocus("ltvSource");
  }

  function textField(
    scenario: LtvCacScenarioKey,
    field: LtvCacScenarioField,
    label: string,
    suffix: string | undefined,
    inputMode: "decimal" | "numeric",
    description?: string,
  ) {
    const key = `${scenario}.${field}` as const;
    return (
      <UiTextField
        autoCapitalize="none"
        autoComplete="off"
        dataFocusKey={key}
        description={description}
        error={errors[key] ?? null}
        inputMode={inputMode}
        key={key}
        label={label}
        onChange={(value) => updateField(scenario, field, value)}
        required
        spellCheck={false}
        suffix={suffix}
        value={input[scenario][field]}
      />
    );
  }

  function scenarioFields(scenario: LtvCacScenarioKey) {
    return (
      <>
        <p className={styles.helper}>{SCENARIO_NOTE}</p>
        <fieldset className={styles.group}>
          <legend>Customer value</legend>
          {input.ltvSource === "model" ? (
            <>
              {textField(scenario, "arpa", arpaLabel, input.currency, "decimal")}
              {textField(scenario, "grossMarginPercent", "Gross margin", "%", "decimal", MARGIN_HELP)}
              {textField(scenario, "churnPercent", churnLabel, "%", "decimal", CHURN_HELP)}
            </>
          ) : textField(scenario, "ltv", "LTV", input.currency, "decimal", DIRECT_LTV_HELP)}
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Acquisition cost</legend>
          {input.cacSource === "direct"
            ? textField(scenario, "cac", "CAC", input.currency, "decimal")
            : (
              <>
                {textField(scenario, "acquisitionSpend", "Acquisition spend", input.currency, "decimal")}
                {textField(scenario, "newCustomers", "New paying customers", undefined, "numeric")}
              </>
            )}
          <UiChoiceGroup
            dataFocusKey={`${scenario}.cacScope`}
            description={SCOPE_HELP}
            error={errors[`${scenario}.cacScope`] ?? null}
            label="CAC includes"
            onChange={(value) => {
              if (isScope(value)) updateField(scenario, "cacScope", value);
            }}
            options={[uiOption("allAcquisition", "All acquisition costs"), uiOption("paidMedia", "Paid media only")]}
            required
            value={input[scenario].cacScope}
          />
        </fieldset>
      </>
    );
  }

  return (
    <section aria-label="LTV to CAC calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="LTV to CAC inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <div className={input.ltvSource === "model" ? styles.settings : `${styles.settings} ${styles.settingsDirect}`}>
            <div className={styles.currency}>
              <UiSelect
                dataFocusKey="currency"
                error={errors.currency ?? null}
                label="Currency"
                onChange={(value) => {
                  if (!SAAS_ECONOMICS_CURRENCIES.includes(value as SaasEconomicsCurrency)) return;
                  change((current) => ({ ...current, currency: value }));
                }}
                options={SAAS_ECONOMICS_CURRENCIES.map((currency) => uiOption(currency, currency))}
                required
                value={input.currency}
              />
            </div>
            <UiChoiceGroup
              dataFocusKey="ltvSource"
              error={errors.ltvSource ?? null}
              label="LTV from"
              onChange={(value) => {
                if (isLtvSource(value)) change((current) => ({ ...current, ltvSource: value }));
              }}
              options={[uiOption("model", "ARPA, margin, and churn"), uiOption("direct", "Enter LTV")]}
              required
              value={input.ltvSource}
            />
            {input.ltvSource === "model" ? (
              <UiChoiceGroup
                dataFocusKey="basis"
                error={errors.basis ?? null}
                label="Basis"
                onChange={(value) => {
                  if (isBasis(value)) change((current) => ({ ...current, basis: value }));
                }}
                options={[uiOption("month", "Per month"), uiOption("year", "Per year")]}
                required
                value={input.basis}
              />
            ) : null}
          </div>
          <div className={styles.cacSource}>
            <UiChoiceGroup
              dataFocusKey="cacSource"
              error={errors.cacSource ?? null}
              label="CAC from"
              onChange={(value) => {
                if (isCacSource(value)) change((current) => ({ ...current, cacSource: value }));
              }}
              options={[uiOption("direct", "Enter CAC"), uiOption("spend", "From spend and new customers")]}
              required
              value={input.cacSource}
            />
          </div>
          {input.compare ? (
            <div className={styles.scenarioPair}>
              {(["baseline", "alternative"] as const).map((scenario) => (
                <fieldset className={styles.scenario} key={scenario} style={{ ["--scenario-span" as string]: "span 4" }}>
                  <legend>{scenario === "baseline" ? "Baseline" : "Alternative"}</legend>
                  {scenarioFields(scenario)}
                </fieldset>
              ))}
            </div>
          ) : (
            <div className={styles.scenarioSingle}>{scenarioFields("baseline")}</div>
          )}
          <div className={styles.toggles}>
            <UiCheckbox isSelected={input.compare} onChange={toggleCompare}>Compare a second scenario</UiCheckbox>
          </div>
          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate LTV:CAC</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <LtvCacResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}
