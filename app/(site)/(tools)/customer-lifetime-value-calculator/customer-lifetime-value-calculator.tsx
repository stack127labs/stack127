"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  calculateCustomerLifetimeValue,
  type CustomerLtvCheckpoint,
  type CustomerLtvErrors,
  type CustomerLtvFieldKey,
  type CustomerLtvMoney,
  type CustomerLtvScenarioField,
  type CustomerLtvScenarioInput,
  type CustomerLtvScenarioKey,
  type CustomerLtvScenarioValues,
  type CustomerLtvShare,
  type CustomerLtvValues,
} from "@/lib/customer-lifetime-value-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import { SAAS_PERIOD_BASES, type SaasPeriodBasis } from "@/lib/saas-economics/unit-economics";
import styles from "./customer-lifetime-value-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };
type ProfitSign = CustomerLtvScenarioValues["grossProfitSign"];

const CHANGED = "Inputs changed. Calculate again.";
const MARGIN_HELP = "After hosting, support, payment fees, and other costs to serve.";
const SCENARIO_FIELDS: CustomerLtvScenarioField[] = ["arpa", "grossMarginPercent", "churnPercent"];

function emptyScenario(): CustomerLtvScenarioInput {
  return { arpa: "", grossMarginPercent: "", churnPercent: "" };
}

function emptyInput() {
  return {
    currency: "USD",
    basis: "month" as SaasPeriodBasis,
    compare: false,
    baseline: emptyScenario(),
    alternative: emptyScenario(),
  };
}

function isBasis(value: string): value is SaasPeriodBasis {
  return SAAS_PERIOD_BASES.includes(value as SaasPeriodBasis);
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

function signedMoney(money: CustomerLtvMoney, currency: SaasEconomicsCurrency, sign: ProfitSign): string {
  if (!money.roundedToZero) return formatMoney(money.cents, currency);
  return sign === "negative" ? `Loss under ${formatMoney(1n, currency)}` : `Under ${formatMoney(1n, currency)}`;
}

function unsignedMoney(money: CustomerLtvMoney, currency: SaasEconomicsCurrency): string {
  return money.roundedToZero ? `Under ${formatMoney(1n, currency)}` : formatMoney(money.cents, currency);
}

function formatShare(share: CustomerLtvShare | null): string {
  if (!share) return "n/a";
  if (share.underOneTenth) return "Under 0.1%";
  if (share.nearlyAll) return "Over 99.9%";
  if (share.tenths === 1000n) return "100%";
  return `${formatInteger(share.tenths / 10n)}.${share.tenths % 10n}%`;
}

function formatLifetime(tenths: bigint, basis: SaasPeriodBasis): string {
  const unit = basis === "month"
    ? (tenths === 10n ? "month" : "months")
    : (tenths === 10n ? "year" : "years");
  return `${formatInteger(tenths / 10n)}.${tenths % 10n} ${unit}`;
}

function perPeriod(basis: SaasPeriodBasis): string {
  return basis === "month" ? "a month" : "a year";
}

function periodAdjective(basis: SaasPeriodBasis): string {
  return basis === "month" ? "monthly" : "yearly";
}

function checkpointLabel(checkpoint: CustomerLtvCheckpoint, basis: SaasPeriodBasis): string {
  return basis === "month" ? `Month ${checkpoint.periods}` : `Year ${checkpoint.periods}`;
}

function serviceLine(scenario: CustomerLtvScenarioValues, currency: SaasEconomicsCurrency, basis: SaasPeriodBasis): string | null {
  if (scenario.grossProfitSign === "positive") return null;
  const period = perPeriod(basis);
  if (scenario.grossProfitSign === "zero") return `Each customer leaves ${formatMoney(0n, currency)} ${period} after serving costs.`;
  if (scenario.periodGrossProfit.roundedToZero) {
    return `Each customer costs under ${formatMoney(1n, currency)} ${period} more to serve than they pay.`;
  }
  const cents = scenario.periodGrossProfit.cents < 0n ? -scenario.periodGrossProfit.cents : scenario.periodGrossProfit.cents;
  return `Each customer costs ${formatMoney(cents, currency)} ${period} more to serve than they pay.`;
}

function ltvDifference(delta: bigint | null, currency: SaasEconomicsCurrency): string | null {
  if (delta === null) return null;
  if (delta === 0n) return "Same as baseline.";
  const magnitude = delta < 0n ? -delta : delta;
  return `${formatMoney(magnitude, currency)} ${delta < 0n ? "less" : "more"} than baseline.`;
}

function ScenarioLead({
  basis,
  comparison,
  currency,
  inputRef,
  label,
  values,
}: {
  basis: SaasPeriodBasis;
  comparison: string | null;
  currency: SaasEconomicsCurrency;
  inputRef?: RefObject<HTMLOutputElement | null>;
  label: string;
  values: CustomerLtvScenarioValues;
}) {
  const lines: string[] = [];
  if (values.estimate.kind === "notEstimable") {
    lines.push("With 0% churn, this model has no finite lifetime. The totals below still apply.");
  } else {
    const profit = signedMoney(values.periodGrossProfit, currency, values.grossProfitSign);
    lines.push(`${profit} gross profit ${perPeriod(basis)} ÷ ${formatPercent(values.churnHundredths)} ${periodAdjective(basis)} churn.`);
  }
  const service = serviceLine(values, currency, basis);
  if (service) lines.push(service);
  if (values.lessThanHalfByLastCheckpoint) lines.push("Less than half of this arrives in the first 5 years.");
  if (comparison) lines.push(comparison);
  const value = values.estimate.kind === "notEstimable"
    ? "Not estimable"
    : signedMoney(values.estimate.grossProfit, currency, values.grossProfitSign);

  return (
    <UiPrimaryResult
      detail={<span className={styles.detailLines}>{lines.map((line) => <span key={line}>{line}</span>)}</span>}
      inputRef={inputRef}
      label={label}
      value={value}
    />
  );
}

function checkpointCell(checkpoint: CustomerLtvCheckpoint, currency: SaasEconomicsCurrency, sign: ProfitSign, withShare: boolean): ReactNode {
  const amount = signedMoney(checkpoint.grossProfit, currency, sign);
  if (!withShare) return amount;
  const share = checkpoint.shareOfLtv ? `${formatShare(checkpoint.shareOfLtv)} of LTV` : "n/a";
  return (
    <span className={styles.cellStack}>
      <span>{amount}</span>
      <span className={styles.cellNote}>{share}</span>
    </span>
  );
}

function CustomerLifetimeValueResults({
  resultRef,
  values,
}: {
  resultRef: RefObject<HTMLOutputElement | null>;
  values: CustomerLtvValues;
}) {
  const { alternative, baseline, basis, comparison, currency } = values;
  const scenarios: [CustomerLtvScenarioKey, CustomerLtvScenarioValues][] = alternative
    ? [["baseline", baseline], ["alternative", alternative]]
    : [["baseline", baseline]];
  const comparing = alternative !== null;
  const valueLabel = comparing ? "Baseline" : "Value";

  function row(id: string, item: string, cell: (scenario: CustomerLtvScenarioValues) => ReactNode) {
    return {
      id,
      cells: Object.fromEntries([["item", item], ...scenarios.map(([key, scenario]) => [key, cell(scenario)])]),
    };
  }

  const checkpointRows = baseline.checkpoints.map((checkpoint, index) => row(
    `checkpoint-${checkpoint.periods}`,
    checkpointLabel(checkpoint, basis),
    (scenario) => checkpointCell(scenario.checkpoints[index], currency, scenario.grossProfitSign, comparing),
  ));
  if (!comparing) {
    checkpointRows.forEach((item, index) => {
      item.cells.share = formatShare(baseline.checkpoints[index].shareOfLtv);
    });
  }

  const buildRows = [
    row("arpa", "ARPA", (scenario) => formatMoney(scenario.arpaCents, currency)),
    row("margin", "Gross margin", (scenario) => formatPercent(scenario.grossMarginHundredths)),
    row("profit", basis === "month" ? "Gross profit per month" : "Gross profit per year", (scenario) => signedMoney(scenario.periodGrossProfit, currency, scenario.grossProfitSign)),
    row("churn", "Customer churn", (scenario) => formatPercent(scenario.churnHundredths)),
    row("lifetime", "Model lifetime", (scenario) => scenario.estimate.kind === "finite" ? formatLifetime(scenario.estimate.lifetimeTenths, basis) : "n/a"),
    row("revenue", "Revenue LTV, before serving costs", (scenario) => scenario.estimate.kind === "finite" ? unsignedMoney(scenario.estimate.revenue, currency) : "n/a"),
  ];

  return (
    <section aria-label="Customer lifetime value results" className={styles.results}>
      <div className={comparing ? styles.leadPair : styles.leadSingle}>
        <ScenarioLead
          basis={basis}
          comparison={null}
          currency={currency}
          inputRef={resultRef}
          label={comparing ? "Baseline LTV" : "Lifetime gross profit per customer"}
          values={baseline}
        />
        {alternative ? (
          <ScenarioLead
            basis={basis}
            comparison={ltvDifference(comparison?.ltvDeltaCents ?? null, currency)}
            currency={currency}
            label="Alternative LTV"
            values={alternative}
          />
        ) : null}
      </div>
      <UiDataTable
        ariaLabel="Gross profit by checkpoint"
        caption="If customers keep leaving at this rate"
        columns={[
          { id: "item", label: "By the end of" },
          { id: "baseline", label: comparing ? "Baseline" : "Gross profit", align: "right" },
          ...(comparing
            ? [{ id: "alternative", label: "Alternative", align: "right" as const }]
            : [{ id: "share", label: "Share of LTV", align: "right" as const }]),
        ]}
        rows={checkpointRows}
      />
      <UiDataTable
        ariaLabel="How the estimate is built"
        caption={`How the estimate is built, in ${currency}`}
        columns={[
          { id: "item", label: "Item" },
          { id: "baseline", label: valueLabel, align: "right" },
          ...(comparing ? [{ id: "alternative", label: "Alternative", align: "right" as const }] : []),
        ]}
        rows={buildRows}
      />
      <div className={styles.formula}>
        <p>LTV = ARPA × gross margin ÷ customer churn, all per {basis === "month" ? "month" : "year"}.</p>
        <p>Assumes churn, ARPA, and margin stay the same. Model lifetime is 1 ÷ churn, not a measured lifetime.</p>
      </div>
    </section>
  );
}

export function CustomerLifetimeValueCalculator() {
  const [input, setInput] = useState(emptyInput);
  const [errors, setErrors] = useState<CustomerLtvErrors>({});
  const [result, setResult] = useState<CustomerLtvValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const alternativeSeeded = useRef(false);
  const focusRequest = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);
  const churnHelp = input.basis === "month"
    ? "Share of paying customers who cancel each month. Use customer churn, not revenue churn."
    : "Share of paying customers who cancel each year. Use customer churn, not revenue churn.";

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

  function change(update: (current: ReturnType<typeof emptyInput>) => ReturnType<typeof emptyInput>) {
    const hadResult = result !== null;
    setInput(update);
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: CHANGED, tone: "neutral" });
    else if (status?.text !== CHANGED) setStatus(null);
  }

  function updateField(scenario: CustomerLtvScenarioKey, field: CustomerLtvScenarioField, value: string) {
    change((current) => ({ ...current, [scenario]: { ...current[scenario], [field]: value } }));
  }

  function toggleCompare(selected: boolean) {
    const seed = selected && !alternativeSeeded.current;
    if (seed) alternativeSeeded.current = true;
    change((current) => {
      if (!seed) return { ...current, compare: selected };
      const alternative = { ...current.alternative };
      for (const field of SCENARIO_FIELDS) {
        if (!alternative[field].trim()) alternative[field] = current.baseline[field];
      }
      return { ...current, compare: selected, alternative };
    });
  }

  function focusFirstError(nextErrors: CustomerLtvErrors) {
    const order: CustomerLtvFieldKey[] = [
      "currency",
      "basis",
      ...SCENARIO_FIELDS.map((field) => `baseline.${field}` as const),
      ...(input.compare ? SCENARIO_FIELDS.map((field) => `alternative.${field}` as const) : []),
    ];
    const first = order.find((key) => nextErrors[key]);
    if (first) requestFocus(first);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateCustomerLifetimeValue(input);
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
    requestFocus("basis");
  }

  function fieldsFor(scenario: CustomerLtvScenarioKey) {
    const arpaLabel = input.basis === "month" ? "Monthly ARPA" : "Yearly ARPA";
    const churnLabel = input.basis === "month" ? "Monthly customer churn" : "Yearly customer churn";
    return SCENARIO_FIELDS.map((field) => {
      const key = `${scenario}.${field}` as const;
      const percent = field !== "arpa";
      return (
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          dataFocusKey={key}
          description={field === "grossMarginPercent" ? MARGIN_HELP : field === "churnPercent" ? churnHelp : undefined}
          error={errors[key] ?? null}
          inputMode="decimal"
          key={key}
          label={field === "arpa" ? arpaLabel : field === "churnPercent" ? churnLabel : "Gross margin"}
          onChange={(value) => updateField(scenario, field, value)}
          required
          spellCheck={false}
          suffix={percent ? "%" : input.currency}
          value={input[scenario][field]}
        />
      );
    });
  }

  return (
    <section aria-label="Customer lifetime value calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Customer lifetime value inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <div className={styles.settings}>
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
          </div>
          {input.compare ? (
            <div className={styles.scenarioPair}>
              {(["baseline", "alternative"] as const).map((scenario) => (
                <fieldset className={styles.scenario} key={scenario} style={{ ["--scenario-span" as string]: "span 4" }}>
                  <legend>{scenario === "baseline" ? "Baseline" : "Alternative"}</legend>
                  {fieldsFor(scenario)}
                </fieldset>
              ))}
            </div>
          ) : (
            <div className={styles.scenarioSingle}>{fieldsFor("baseline")}</div>
          )}
          <div className={styles.toggles}>
            <UiCheckbox isSelected={input.compare} onChange={toggleCompare}>Compare a second scenario</UiCheckbox>
          </div>
          <UiActionRow>
            <UiButton type="submit" variant="primary">Estimate LTV</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <CustomerLifetimeValueResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}
