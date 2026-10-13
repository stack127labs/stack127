"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  calculateCacPayback,
  type CacPaybackCacSource,
  type CacPaybackComparison,
  type CacPaybackErrors,
  type CacPaybackFieldKey,
  type CacPaybackInput,
  type CacPaybackScenarioField,
  type CacPaybackScenarioInput,
  type CacPaybackScenarioKey,
  type CacPaybackScenarioValues,
  type CacPaybackValues,
} from "@/lib/cac-payback-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import styles from "./cac-payback-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };

const CHANGED = "Inputs changed. Calculate again.";

function emptyScenario(): CacPaybackScenarioInput {
  return {
    cac: "",
    acquisitionSpend: "",
    newCustomers: "",
    monthlyArpa: "",
    grossMarginPercent: "",
    monthlyChurnPercent: "",
  };
}

function emptyInput(): CacPaybackInput {
  return {
    currency: "USD",
    cacSource: "direct",
    compare: false,
    includeChurn: false,
    baseline: emptyScenario(),
    alternative: emptyScenario(),
  };
}

function scenarioFields(cacSource: string, includeChurn: boolean): CacPaybackScenarioField[] {
  return [
    ...(cacSource === "spend" ? ["acquisitionSpend", "newCustomers"] as const : ["cac"] as const),
    "monthlyArpa",
    "grossMarginPercent",
    ...(includeChurn ? ["monthlyChurnPercent"] as const : []),
  ];
}

/* ---------------- formatting ---------------- */

function currencySymbol(currency: SaasEconomicsCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatInteger(value: bigint): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
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
  return `${formatInteger(tenths / 10n)}.${tenths % 10n}`;
}

function formatMonthCount(months: bigint): string {
  return `${formatInteger(months)} ${months === 1n ? "month" : "months"}`;
}

/** Sign of the exact monthly gross profit, from ARPA and margin. */
function grossProfitSign(values: CacPaybackScenarioValues): -1 | 0 | 1 {
  if (values.monthlyArpaCents === 0n || values.grossMarginHundredths === 0n) return 0;
  return values.grossMarginHundredths < 0n ? -1 : 1;
}

function grossProfitAmount(values: CacPaybackScenarioValues, currency: SaasEconomicsCurrency): string {
  if (values.monthlyGrossProfitRoundedToZero) return `under ${formatMoney(1n, currency)}`;
  const cents = values.monthlyGrossProfitCents;
  return formatMoney(cents < 0n ? -cents : cents, currency);
}

function grossProfitCell(values: CacPaybackScenarioValues, currency: SaasEconomicsCurrency): string {
  if (values.monthlyGrossProfitRoundedToZero) {
    return grossProfitSign(values) < 0 ? `Loss under ${formatMoney(1n, currency)}` : `Under ${formatMoney(1n, currency)}`;
  }
  return formatMoney(values.monthlyGrossProfitCents, currency);
}

/** The reason a positive CAC is never earned back, or the loss beside a zero CAC. */
function lossSentence(values: CacPaybackScenarioValues, currency: SaasEconomicsCurrency, still: boolean): string | null {
  const sign = grossProfitSign(values);
  if (sign > 0) return null;
  const amount = grossProfitAmount(values, currency);
  const stillWord = still ? " still" : "";
  return sign === 0
    ? `Each customer${stillWord} leaves ${amount} a month after serving costs.`
    : `Each customer${stillWord} costs ${amount} a month more to serve than they pay.`;
}

function churnLine(values: CacPaybackScenarioValues, currency: SaasEconomicsCurrency): string | null {
  const retention = values.retention;
  if (retention === null || values.monthlyChurnHundredths === null) return null;
  const prefix = `With ${formatPercent(values.monthlyChurnHundredths)} monthly churn:`;
  switch (retention.kind) {
    case "zeroAcquisitionCost":
      return null;
    case "finite":
      return `${prefix} earned back during month ${formatInteger(retention.recoveryMonth)}.`;
    case "beyondHorizon":
      return `${prefix} not within ${formatInteger(BigInt(retention.horizonMonths))} months.`;
    case "never":
      return retention.reason === "churnLimit"
        ? `${prefix} never. A customer returns at most ${formatMoney(retention.lifetimeGrossProfitCents, currency)} in gross profit.`
        : `${prefix} also never.`;
  }
}

function tenthsDeltaText(delta: bigint): string {
  if (delta === 0n) return "Same as baseline.";
  const magnitude = delta < 0n ? -delta : delta;
  const unit = magnitude === 10n ? "month" : "months";
  return `${formatTenths(magnitude)} ${unit} ${delta < 0n ? "sooner" : "later"} than baseline.`;
}

function monthDeltaText(delta: bigint): string {
  if (delta === 0n) return "With churn: same month as baseline.";
  const magnitude = delta < 0n ? -delta : delta;
  return `With churn: ${formatMonthCount(magnitude)} ${delta < 0n ? "sooner" : "later"} than baseline.`;
}

function revenueOnlyCell(values: CacPaybackScenarioValues): string {
  const revenueOnly = values.revenueOnly;
  if (revenueOnly.kind === "zeroAcquisitionCost") return "Nothing to earn back";
  if (revenueOnly.kind === "zeroArpa") return "n/a";
  return revenueOnly.tenthsUnderOne ? "Under 0.1 months" : `${formatTenths(revenueOnly.tenths)} months`;
}

function cacCell(values: CacPaybackScenarioValues, currency: SaasEconomicsCurrency): ReactNode {
  const amount = values.cacCents === 0n && values.cacIsRounded
    ? `Under ${formatMoney(1n, currency)}`
    : formatMoney(values.cacCents, currency);
  if (values.acquisitionSpendCents === null || values.newCustomers === null) return amount;
  const customers = values.newCustomers === 1n ? "customer" : "customers";
  return (
    <span className={styles.cellStack}>
      <span>{amount}</span>
      <span className={styles.cellNote}>
        {formatMoney(values.acquisitionSpendCents, currency)} ÷ {formatInteger(values.newCustomers)} {customers}
      </span>
    </span>
  );
}

/* ---------------- results ---------------- */

function ScenarioLead({
  comparison,
  currency,
  inputRef,
  label,
  values,
}: {
  comparison: CacPaybackComparison | null;
  currency: SaasEconomicsCurrency;
  inputRef?: RefObject<HTMLOutputElement | null>;
  label: string;
  values: CacPaybackScenarioValues;
}) {
  const straightLine = values.straightLine;
  const lines: string[] = [];
  let value: string;
  let unit: string | undefined;

  if (straightLine.kind === "zeroAcquisitionCost") {
    value = "Nothing to earn back";
    lines.push(`CAC is ${formatMoney(0n, currency)}, so there's no acquisition cost to earn back.`);
    const loss = lossSentence(values, currency, true);
    if (loss) lines.push(loss);
  } else if (straightLine.kind === "never") {
    value = "Never";
    lines.push(lossSentence(values, currency, false) ?? "");
  } else {
    value = straightLine.tenthsUnderOne ? "Under 0.1" : formatTenths(straightLine.tenths);
    unit = straightLine.tenths === 10n ? "month" : "months";
    lines.push(`Earned back during month ${formatInteger(straightLine.recoveryMonth)}.`);
  }

  const churn = churnLine(values, currency);
  if (churn) lines.push(churn);
  if (comparison?.straightLineTenthsDelta != null) lines.push(tenthsDeltaText(comparison.straightLineTenthsDelta));
  if (comparison?.retentionMonthDelta != null) lines.push(monthDeltaText(comparison.retentionMonthDelta));

  return (
    <UiPrimaryResult
      detail={(
        <span className={styles.detailLines}>
          {lines.filter(Boolean).map((line) => <span key={line}>{line}</span>)}
        </span>
      )}
      inputRef={inputRef}
      label={label}
      unit={unit}
      value={value}
    />
  );
}

function CacPaybackResults({ resultRef, values }: { resultRef: RefObject<HTMLOutputElement | null>; values: CacPaybackValues }) {
  const { alternative, baseline, currency } = values;
  const scenarios: [CacPaybackScenarioKey, CacPaybackScenarioValues][] = alternative
    ? [["baseline", baseline], ["alternative", alternative]]
    : [["baseline", baseline]];

  function row(id: string, item: string, cell: (scenario: CacPaybackScenarioValues) => ReactNode) {
    return {
      id,
      cells: Object.fromEntries([["item", item], ...scenarios.map(([key, scenario]) => [key, cell(scenario)])]),
    };
  }

  const rows = [
    row("cac", "CAC", (scenario) => cacCell(scenario, currency)),
    row("arpa", "Monthly ARPA", (scenario) => formatMoney(scenario.monthlyArpaCents, currency)),
    row("margin", "Gross margin", (scenario) => formatPercent(scenario.grossMarginHundredths)),
    row("gross-profit", "Monthly gross profit per customer", (scenario) => grossProfitCell(scenario, currency)),
    ...(values.includeChurn
      ? [row("churn", "Monthly churn", (scenario) => formatPercent(scenario.monthlyChurnHundredths ?? 0n))]
      : []),
    row("revenue-only", "Months if you ignore serving costs", revenueOnlyCell),
  ];

  return (
    <section aria-label="CAC payback results" className={styles.results}>
      <div className={alternative ? styles.leadPair : styles.leadSingle}>
        <ScenarioLead
          comparison={null}
          currency={currency}
          inputRef={resultRef}
          label={alternative ? "Baseline payback" : "CAC payback"}
          values={baseline}
        />
        {alternative ? (
          <ScenarioLead
            comparison={values.comparison}
            currency={currency}
            label="Alternative payback"
            values={alternative}
          />
        ) : null}
      </div>
      <UiDataTable
        ariaLabel="How each answer is built"
        caption={`How each answer is built, in ${currency}`}
        columns={[
          { id: "item", label: "Item" },
          { id: "baseline", label: alternative ? "Baseline" : "Value", align: "right" },
          ...(alternative ? [{ id: "alternative", label: "Alternative", align: "right" as const }] : []),
        ]}
        rows={rows}
      />
      <div className={styles.formula}>
        <p>Payback months = CAC ÷ (monthly ARPA × gross margin)</p>
        {values.includeChurn ? (
          <p>With churn, month 1 counts every customer, and each later month counts the share still paying.</p>
        ) : null}
      </div>
    </section>
  );
}

/* ---------------- form ---------------- */

const FIELD_COPY: Record<CacPaybackScenarioField, { label: string; inputMode: "decimal" | "numeric"; percent?: boolean }> = {
  cac: { label: "CAC", inputMode: "decimal" },
  acquisitionSpend: { label: "Sales and marketing spend", inputMode: "decimal" },
  newCustomers: { label: "New paying customers", inputMode: "numeric" },
  monthlyArpa: { label: "Monthly ARPA", inputMode: "decimal" },
  grossMarginPercent: { label: "Gross margin", inputMode: "decimal", percent: true },
  monthlyChurnPercent: { label: "Monthly customer churn", inputMode: "decimal", percent: true },
};

export function CacPaybackCalculator() {
  const [input, setInput] = useState<CacPaybackInput>(emptyInput);
  const [errors, setErrors] = useState<CacPaybackErrors>({});
  const [result, setResult] = useState<CacPaybackValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const alternativeSeeded = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  const fields = scenarioFields(input.cacSource, input.includeChurn);

  function change(update: (current: CacPaybackInput) => CacPaybackInput) {
    const hadResult = result !== null;
    setInput(update);
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: CHANGED, tone: "neutral" });
    else if (status?.text !== CHANGED) setStatus(null);
  }

  function updateField(scenario: CacPaybackScenarioKey, field: CacPaybackScenarioField, value: string) {
    change((current) => ({ ...current, [scenario]: { ...current[scenario], [field]: value } }));
  }

  function toggleCompare(selected: boolean) {
    const seed = selected && !alternativeSeeded.current;
    if (seed) alternativeSeeded.current = true;
    change((current) => {
      if (!seed) return { ...current, compare: selected };
      const alternative = { ...current.alternative };
      for (const field of Object.keys(alternative) as CacPaybackScenarioField[]) {
        if (!alternative[field].trim()) alternative[field] = current.baseline[field];
      }
      return { ...current, compare: selected, alternative };
    });
  }

  function focusKey(key: string) {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
    });
  }

  function focusFirstError(nextErrors: CacPaybackErrors) {
    const order: CacPaybackFieldKey[] = [
      "currency",
      "cacSource",
      ...fields.map((field) => `baseline.${field}` as const),
      ...(input.compare ? fields.map((field) => `alternative.${field}` as const) : []),
    ];
    const first = order.find((key) => nextErrors[key]);
    if (first) focusKey(first);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateCacPayback(input);
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        if (calculation.errors.form) setStatus({ text: calculation.errors.form, tone: "danger" });
        focusFirstError(calculation.errors);
        return;
      }
      setErrors({});
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
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
    focusKey("cacSource");
  }

  function scenarioFieldList(scenario: CacPaybackScenarioKey) {
    return fields.map((field) => {
      const copy = FIELD_COPY[field];
      const key = `${scenario}.${field}` as const;
      return (
        <UiTextField
          autoCapitalize="none"
          className={styles.scenarioField}
          dataFocusKey={key}
          description={field === "grossMarginPercent" ? "After hosting, support, payment fees, and other costs to serve." : undefined}
          error={errors[key] ?? null}
          inputMode={copy.inputMode}
          key={key}
          label={copy.label}
          onChange={(value) => updateField(scenario, field, value)}
          required
          spellCheck={false}
          suffix={copy.percent ? "%" : field === "newCustomers" ? undefined : input.currency}
          value={input[scenario][field]}
        />
      );
    });
  }

  return (
    <section aria-label="CAC payback calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="CAC payback inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
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
              dataFocusKey="cacSource"
              error={errors.cacSource ?? null}
              label="CAC source"
              onChange={(value) => {
                if (value !== "direct" && value !== "spend") return;
                change((current) => ({ ...current, cacSource: value as CacPaybackCacSource }));
              }}
              options={[uiOption("direct", "Enter CAC"), uiOption("spend", "From spend and new customers")]}
              required
              value={input.cacSource}
            />
          </div>

          {input.compare ? (
            <div className={styles.scenarioPair} style={{ ["--scenario-span" as string]: `span ${fields.length + 1}` }}>
              <fieldset className={styles.scenario}>
                <legend>Baseline</legend>
                {scenarioFieldList("baseline")}
              </fieldset>
              <fieldset className={styles.scenario}>
                <legend>Alternative</legend>
                {scenarioFieldList("alternative")}
              </fieldset>
            </div>
          ) : (
            <div className={styles.scenarioSingle}>{scenarioFieldList("baseline")}</div>
          )}

          <div className={styles.toggles}>
            <UiCheckbox isSelected={input.compare} onChange={toggleCompare}>Compare a second scenario</UiCheckbox>
            <UiCheckbox
              isSelected={input.includeChurn}
              onChange={(selected) => change((current) => ({ ...current, includeChurn: selected }))}
            >
              Include monthly churn
            </UiCheckbox>
          </div>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate payback</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <CacPaybackResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}
