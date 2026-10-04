"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  CAC_ALLOCATION_METHODS,
  CAC_COST_CATEGORIES,
  CAC_TIMINGS,
  calculateCustomerAcquisitionCost,
  type CacAllocationMethod,
  type CacComparison,
  type CacCostCategory,
  type CacFieldKey,
  type CacPerCustomer,
  type CacScenarioField,
  type CacScenarioInput,
  type CacScenarioKey,
  type CacScenarioValues,
  type CacSharedCost,
  type CacTiming,
  type CustomerAcquisitionCostErrors,
  type CustomerAcquisitionCostInput,
  type CustomerAcquisitionCostValues,
} from "@/lib/customer-acquisition-cost-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import styles from "./customer-acquisition-cost-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };

const CHANGED = "Inputs changed. Calculate again.";
const PAY_HELP = "Only people who work on acquisition full time. Put mixed roles in shared costs.";
const SHARED_HELP = "Costs that partly serve acquisition, like a mixed role, rent, or general software.";
const HOURLY_HELP = "What an hour of your time is worth to you. This doesn't change cash CAC.";
const CUSTOMER_HELP = "First-time paying customers only. Leave out trials, leads, and renewals.";

const CATEGORY_LABELS: Record<CacCostCategory, string> = {
  paidMedia: "Paid media",
  salesMarketingPay: "Sales and marketing pay",
  agencies: "Agencies and freelancers",
  toolsContentEvents: "Tools, content, and events",
};

function emptyScenario(): CacScenarioInput {
  return {
    paidMedia: "",
    salesMarketingPay: "",
    agencies: "",
    toolsContentEvents: "",
    sharedCosts: "",
    allocationMethod: "share",
    sharePercent: "",
    acquisitionHours: "",
    totalHours: "",
    acquisitionHeadcount: "",
    totalHeadcount: "",
    founderHours: "",
    founderHourlyValue: "",
    newCustomers: "",
    paidCustomers: "",
    timing: "samePeriod",
  };
}

function emptyInput(): CustomerAcquisitionCostInput {
  return {
    currency: "USD",
    includeShared: false,
    includeFounderTime: false,
    compare: false,
    baseline: emptyScenario(),
    alternative: emptyScenario(),
  };
}

function isTiming(value: string): value is CacTiming {
  return CAC_TIMINGS.includes(value as CacTiming);
}

function isAllocation(value: string): value is CacAllocationMethod {
  return CAC_ALLOCATION_METHODS.includes(value as CacAllocationMethod);
}

function formatInteger(value: bigint): string {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "−" : ""}${grouped}`;
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

function formatHundredths(value: bigint): string {
  const negative = value < 0n;
  const magnitude = negative ? -value : value;
  const fraction = (magnitude % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${negative ? "−" : ""}${formatInteger(magnitude / 100n)}${fraction ? `.${fraction}` : ""}`;
}

function perCustomerText(value: CacPerCustomer, currency: SaasEconomicsCurrency): string {
  if (value.kind === "noCustomers") return "No new customers";
  if (value.roundedToZero) return `Under ${formatMoney(1n, currency)}`;
  return formatMoney(value.cents, currency);
}

function moneyDifference(delta: bigint, currency: SaasEconomicsCurrency): string {
  if (delta === 0n) return "Same as baseline";
  const magnitude = delta < 0n ? -delta : delta;
  return `${formatMoney(magnitude, currency)} ${delta < 0n ? "less" : "more"}`;
}

function allocationNote(shared: CacSharedCost, currency: SaasEconomicsCurrency): string {
  const ofAmount = `of ${formatMoney(shared.sharedCents, currency)}`;
  if (shared.driver.method === "share") return `${ofAmount}, ${formatHundredths(shared.driver.shareHundredths)}%`;
  const noun = shared.driver.method === "hours" ? "hours" : "people";
  return `${ofAmount}, ${formatHundredths(shared.driver.partHundredths)} of ${formatHundredths(shared.driver.wholeHundredths)} ${noun}`;
}

function founderNote(scenario: CacScenarioValues, currency: SaasEconomicsCurrency): string | null {
  if (!scenario.founderTime) return null;
  const hours = formatHundredths(scenario.founderTime.hoursHundredths);
  const noun = scenario.founderTime.hoursHundredths === 100n ? "hour" : "hours";
  return `${hours} ${noun} at ${formatMoney(scenario.founderTime.hourlyValueCents, currency)}`;
}

function linePerCustomer(cents: bigint | null, currency: SaasEconomicsCurrency): string {
  return cents === null ? "n/a" : formatMoney(cents, currency);
}

function scenarioRoundsPerCustomer(scenario: CacScenarioValues): boolean {
  if (scenario.newCustomers === 0n) return false;
  const views = [scenario.cashCac, scenario.cacWithFounderTime, scenario.paidMediaCac];
  if (views.some((view) => view?.kind === "finite" && view.isRounded)) return true;
  if (scenario.costs.some((line) => line.enteredCents !== null && line.enteredCents % scenario.newCustomers !== 0n)) return true;
  if (scenario.shared && (scenario.shared.allocatedIsRounded || scenario.shared.allocatedCents % scenario.newCustomers !== 0n)) return true;
  if (scenario.founderTime && (scenario.founderTime.valueIsRounded || scenario.founderTime.valueCents % scenario.newCustomers !== 0n)) return true;
  return false;
}

function fieldOrder(input: CustomerAcquisitionCostInput, key: CacScenarioKey): CacFieldKey[] {
  const scenario = input[key];
  const fields: CacScenarioField[] = ["timing", ...CAC_COST_CATEGORIES];
  if (input.includeShared) {
    fields.push("sharedCosts", "allocationMethod");
    if (scenario.allocationMethod === "share") fields.push("sharePercent");
    else if (scenario.allocationMethod === "hours") fields.push("acquisitionHours", "totalHours");
    else if (scenario.allocationMethod === "headcount") fields.push("acquisitionHeadcount", "totalHeadcount");
  }
  if (input.includeFounderTime) fields.push("founderHours", "founderHourlyValue");
  fields.push("newCustomers", "paidCustomers");
  return fields.map((field) => `${key}.${field}` as const);
}

function stack(amount: ReactNode, ...notes: Array<string | null | undefined>) {
  const lines = notes.filter((note): note is string => Boolean(note));
  if (lines.length === 0 && typeof amount === "string") return amount;
  return (
    <span className={styles.cellStack}>
      <span>{amount}</span>
      {lines.map((line) => <span className={styles.cellNote} key={line}>{line}</span>)}
    </span>
  );
}

function ScenarioLead({
  comparison,
  currency,
  inputRef,
  label,
  values,
}: {
  comparison: string | null;
  currency: SaasEconomicsCurrency;
  inputRef?: RefObject<HTMLOutputElement | null>;
  label: string;
  values: CacScenarioValues;
}) {
  const lines: string[] = [];
  if (values.cashCac.kind === "noCustomers") {
    lines.push(`${formatMoney(values.cashTotalCents, currency)} spent and no new paying customers, so there's no CAC.`);
  } else {
    const customers = values.newCustomers === 1n ? "new paying customer" : "new paying customers";
    lines.push(`${formatMoney(values.cashTotalCents, currency)} ÷ ${formatInteger(values.newCustomers)} ${customers}.`);
    if (values.cacWithFounderTime?.kind === "finite") {
      lines.push(`With founder time: ${perCustomerText(values.cacWithFounderTime, currency)}.`);
    }
  }
  if (values.paidMediaCac) {
    lines.push(values.paidMediaCac.kind === "noCustomers"
      ? "No paid-sourced customers, so there's no paid media CAC."
      : `Paid media per paid-sourced customer: ${perCustomerText(values.paidMediaCac, currency)}.`);
  }
  lines.push(values.timing === "samePeriod"
    ? "Costs and customers from the same period."
    : "Costs matched to the customers they won.");
  if (comparison) lines.push(comparison);

  return (
    <UiPrimaryResult
      detail={<span className={styles.detailLines}>{lines.map((line) => <span key={line}>{line}</span>)}</span>}
      inputRef={inputRef}
      label={label}
      value={values.cashCac.kind === "noCustomers" ? "No new customers" : perCustomerText(values.cashCac, currency)}
    />
  );
}

function CustomerAcquisitionCostResults({
  resultRef,
  values,
}: {
  resultRef: RefObject<HTMLOutputElement | null>;
  values: CustomerAcquisitionCostValues;
}) {
  const { alternative, baseline, comparison, currency } = values;
  const scenarios: [CacScenarioKey, CacScenarioValues][] = alternative
    ? [["baseline", baseline], ["alternative", alternative]]
    : [["baseline", baseline]];
  const comparing = alternative !== null;

  function row(id: string, cost: string, cell: (scenario: CacScenarioValues, key: CacScenarioKey) => ReactNode) {
    return {
      id,
      cells: Object.fromEntries([["cost", cost], ...scenarios.map(([key, scenario]) => [key, cell(scenario, key)])]),
    };
  }

  function perCustomerColumn(scenario: CacScenarioValues, cents: bigint | null): string {
    return scenario.newCustomers === 0n && cents === null ? "n/a" : linePerCustomer(cents, currency);
  }

  const rows = [
    ...CAC_COST_CATEGORIES.map((category) => row(category, CATEGORY_LABELS[category], (scenario, key) => {
      const line = scenario.costs.find((item) => item.category === category);
      const amount = line?.enteredCents == null ? "Not counted" : formatMoney(line.enteredCents, currency);
      const paidDelta = key === "alternative" && category === "paidMedia" && comparison?.paidMediaCacDeltaCents != null
        ? `Paid media CAC ${moneyDifference(comparison.paidMediaCacDeltaCents, currency)}`
        : null;
      if (!comparing) return amount;
      return stack(amount, paidDelta);
    })),
    ...(values.includeShared ? [row("shared", "Shared costs, allocated", (scenario) => {
      if (!scenario.shared) return "n/a";
      const amount = formatMoney(scenario.shared.allocatedCents, currency);
      const note = allocationNote(scenario.shared, currency);
      return comparing ? stack(amount, note) : stack(amount, note);
    })] : []),
    row("cash", "Cash total", (scenario) => {
      const total = formatMoney(scenario.cashTotalCents, currency);
      const perCustomer = scenario.cashCac.kind === "noCustomers"
        ? "No new customers"
        : perCustomerText(scenario.cashCac, currency);
      return comparing ? stack(total, perCustomer === "No new customers" ? perCustomer : `${perCustomer} per new customer`) : total;
    }),
    ...(values.includeFounderTime ? [
      row("founder", "Founder time, not cash", (scenario) => {
        if (!scenario.founderTime) return "n/a";
        return stack(formatMoney(scenario.founderTime.valueCents, currency), founderNote(scenario, currency));
      }),
      row("founder-total", "Total with founder time", (scenario, key) => {
        const total = scenario.totalWithFounderTimeCents === null ? "n/a" : formatMoney(scenario.totalWithFounderTimeCents, currency);
        const perCustomer = scenario.cacWithFounderTime ? perCustomerText(scenario.cacWithFounderTime, currency) : "n/a";
        const delta = key === "alternative" && comparison?.cacWithFounderTimeDeltaCents != null
          ? moneyDifference(comparison.cacWithFounderTimeDeltaCents, currency)
          : null;
        if (!comparing) return total;
        return stack(total, perCustomer === "No new customers" || perCustomer === "n/a" ? perCustomer : `${perCustomer} per new customer`, delta);
      }),
    ] : []),
    row("new", "New paying customers", (scenario) => formatInteger(scenario.newCustomers)),
    ...(baseline.paidCustomers !== null || alternative?.paidCustomers !== null
      ? [row("paid", "Paid-sourced customers", (scenario) => scenario.paidCustomers === null ? "n/a" : formatInteger(scenario.paidCustomers))]
      : []),
  ];

  const perCustomerHeader = comparing ? [] : [{ id: "perCustomer", label: "Per new customer", align: "right" as const }];
  const tableRows = comparing
    ? rows
    : rows.map((item) => {
      const scenario = baseline;
      let perCustomer = "n/a";
      if (CAC_COST_CATEGORIES.includes(item.id as CacCostCategory)) {
        const line = scenario.costs.find((cost) => cost.category === item.id);
        perCustomer = line?.enteredCents == null ? "n/a" : perCustomerColumn(scenario, line.perCustomerCents);
      } else if (item.id === "shared") perCustomer = linePerCustomer(scenario.shared?.perCustomerCents ?? null, currency);
      else if (item.id === "cash") perCustomer = perCustomerText(scenario.cashCac, currency);
      else if (item.id === "founder") perCustomer = linePerCustomer(scenario.founderTime?.perCustomerCents ?? null, currency);
      else if (item.id === "founder-total" && scenario.cacWithFounderTime) perCustomer = perCustomerText(scenario.cacWithFounderTime, currency);
      return { ...item, cells: { ...item.cells, perCustomer } };
    });

  const rounded = scenarioRoundsPerCustomer(baseline) || (alternative ? scenarioRoundsPerCustomer(alternative) : false);
  const cashComparison = comparison?.cashCacDeltaCents == null
    ? null
    : comparison.cashCacDeltaCents === 0n
      ? "Same as baseline."
      : `${moneyDifference(comparison.cashCacDeltaCents, currency)} than baseline.`;

  return (
    <section aria-label="Customer acquisition cost results" className={styles.results}>
      <div className={comparing ? styles.leadPair : styles.leadSingle}>
        <ScenarioLead
          comparison={null}
          currency={currency}
          inputRef={resultRef}
          label={comparing ? "Baseline CAC" : "CAC from cash costs"}
          values={baseline}
        />
        {alternative ? (
          <ScenarioLead
            comparison={cashComparison}
            currency={currency}
            label="Alternative CAC"
            values={alternative}
          />
        ) : null}
      </div>
      <UiDataTable
        ariaLabel="Acquisition cost breakdown"
        caption={`Acquisition costs, in ${currency}`}
        columns={[
          { id: "cost", label: "Cost" },
          { id: "baseline", label: comparing ? "Baseline" : "Amount", align: "right" },
          ...(comparing ? [{ id: "alternative", label: "Alternative", align: "right" as const }] : perCustomerHeader),
        ]}
        rows={tableRows}
      />
      <div className={styles.formula}>
        <p>CAC = acquisition costs ÷ new paying customers. Founder time is listed apart because it isn't cash.</p>
        {rounded ? <p>Per-customer amounts are rounded one by one, so they may not add up to the CAC.</p> : null}
      </div>
    </section>
  );
}

export function CustomerAcquisitionCostCalculator() {
  const [input, setInput] = useState<CustomerAcquisitionCostInput>(emptyInput);
  const [errors, setErrors] = useState<CustomerAcquisitionCostErrors>({});
  const [result, setResult] = useState<CustomerAcquisitionCostValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const alternativeSeeded = useRef(false);
  const focusRequest = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

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

  function change(update: (current: CustomerAcquisitionCostInput) => CustomerAcquisitionCostInput) {
    const hadResult = result !== null;
    setInput(update);
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: CHANGED, tone: "neutral" });
    else if (status?.text !== CHANGED) setStatus(null);
  }

  function updateField(scenario: CacScenarioKey, field: CacScenarioField, value: string) {
    change((current) => ({ ...current, [scenario]: { ...current[scenario], [field]: value } }));
  }

  function toggleCompare(selected: boolean) {
    const seed = selected && !alternativeSeeded.current;
    if (seed) alternativeSeeded.current = true;
    change((current) => {
      if (!seed) return { ...current, compare: selected };
      const alternative = { ...current.alternative };
      for (const field of Object.keys(alternative) as CacScenarioField[]) {
        if (!alternative[field].trim() || field === "timing" || field === "allocationMethod") alternative[field] = current.baseline[field];
      }
      return { ...current, compare: selected, alternative };
    });
  }

  function focusFirstError(nextErrors: CustomerAcquisitionCostErrors) {
    const order: CacFieldKey[] = [
      "currency",
      ...fieldOrder(input, "baseline"),
      ...(input.compare ? fieldOrder(input, "alternative") : []),
    ];
    const first = order.find((key) => nextErrors[key]);
    if (first) requestFocus(first);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateCustomerAcquisitionCost(input);
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
    requestFocus("currency");
  }

  function decimalField(
    scenario: CacScenarioKey,
    field: CacScenarioField,
    label: string,
    suffix: string,
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
        inputMode="decimal"
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

  function moneyField(scenario: CacScenarioKey, field: CacScenarioField, label: string, required = false, description?: string) {
    const key = `${scenario}.${field}` as const;
    return (
      <UiTextField
        autoCapitalize="none"
        autoComplete="off"
        dataFocusKey={key}
        description={description}
        error={errors[key] ?? null}
        inputMode="decimal"
        key={key}
        label={label}
        onChange={(value) => updateField(scenario, field, value)}
        required={required}
        spellCheck={false}
        suffix={input.currency}
        value={input[scenario][field]}
      />
    );
  }

  function scenarioFields(scenario: CacScenarioKey) {
    const method = input[scenario].allocationMethod;
    return (
      <>
        <UiChoiceGroup
          dataFocusKey={`${scenario}.timing`}
          error={errors[`${scenario}.timing`] ?? null}
          label="Costs and customers from"
          onChange={(value) => {
            if (isTiming(value)) updateField(scenario, "timing", value);
          }}
          options={[uiOption("samePeriod", "The same period"), uiOption("matched", "Matched to these customers")]}
          required
          value={input[scenario].timing}
        />
        <fieldset className={styles.group}>
          <legend>Acquisition costs</legend>
          <p className={styles.helper}>Leave a cost blank to leave it out. Enter 0 to count it as zero.</p>
          {moneyField(scenario, "paidMedia", "Paid media")}
          {moneyField(scenario, "salesMarketingPay", "Sales and marketing pay", false, input.includeShared ? undefined : PAY_HELP)}
          {moneyField(scenario, "agencies", "Agencies and freelancers")}
          {moneyField(scenario, "toolsContentEvents", "Tools, content, and events")}
        </fieldset>
        {input.includeShared ? (
          <fieldset className={styles.group}>
            <legend>Shared costs</legend>
            {moneyField(scenario, "sharedCosts", "Shared costs", true, SHARED_HELP)}
            <UiChoiceGroup
              dataFocusKey={`${scenario}.allocationMethod`}
              error={errors[`${scenario}.allocationMethod`] ?? null}
              label="Split by"
              onChange={(value) => {
                if (isAllocation(value)) updateField(scenario, "allocationMethod", value);
              }}
              options={[uiOption("share", "Fixed share"), uiOption("hours", "Hours"), uiOption("headcount", "Headcount")]}
              required
              value={method}
            />
            {method === "share" ? decimalField(scenario, "sharePercent", "Share", "%") : null}
            {method === "hours" ? (
              <div className={styles.pair}>
                {decimalField(scenario, "acquisitionHours", "Acquisition hours", "hours")}
                {decimalField(scenario, "totalHours", "Total hours", "hours")}
              </div>
            ) : null}
            {method === "headcount" ? (
              <div className={styles.pair}>
                {decimalField(scenario, "acquisitionHeadcount", "Acquisition headcount", "people")}
                {decimalField(scenario, "totalHeadcount", "Total headcount", "people")}
              </div>
            ) : null}
          </fieldset>
        ) : null}
        {input.includeFounderTime ? (
          <fieldset className={styles.group}>
            <legend>Founder time</legend>
            <div className={styles.pair}>
              {decimalField(scenario, "founderHours", "Founder hours", "hours")}
              {moneyField(scenario, "founderHourlyValue", "Hourly value", true, HOURLY_HELP)}
            </div>
          </fieldset>
        ) : null}
        <fieldset className={styles.group}>
          <legend>Customers</legend>
          <div className={styles.pair}>
            <CountField
              description={CUSTOMER_HELP}
              error={errors[`${scenario}.newCustomers`] ?? null}
              field="newCustomers"
              label="New paying customers"
              onChange={(value) => updateField(scenario, "newCustomers", value)}
              required
              scenario={scenario}
              value={input[scenario].newCustomers}
            />
            <CountField
              error={errors[`${scenario}.paidCustomers`] ?? null}
              field="paidCustomers"
              label="Paid-sourced customers"
              onChange={(value) => updateField(scenario, "paidCustomers", value)}
              scenario={scenario}
              value={input[scenario].paidCustomers}
            />
          </div>
        </fieldset>
      </>
    );
  }

  const scenarioRows = 4 + (input.includeShared ? 1 : 0) + (input.includeFounderTime ? 1 : 0);

  return (
    <section aria-label="Customer acquisition cost calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Customer acquisition cost inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
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
          </div>
          {input.compare ? (
            <div className={styles.scenarioPair}>
              {(["baseline", "alternative"] as const).map((scenario) => (
                <fieldset className={styles.scenario} key={scenario} style={{ ["--scenario-span" as string]: `span ${scenarioRows}` }}>
                  <legend>{scenario === "baseline" ? "Baseline" : "Alternative"}</legend>
                  {scenarioFields(scenario)}
                </fieldset>
              ))}
            </div>
          ) : (
            <div className={styles.scenarioSingle}>{scenarioFields("baseline")}</div>
          )}
          <div className={styles.toggles}>
            <UiCheckbox
              isSelected={input.includeShared}
              onChange={(selected) => change((current) => ({ ...current, includeShared: selected }))}
            >
              Include shared costs
            </UiCheckbox>
            <UiCheckbox
              isSelected={input.includeFounderTime}
              onChange={(selected) => change((current) => ({ ...current, includeFounderTime: selected }))}
            >
              Include founder time
            </UiCheckbox>
            <UiCheckbox isSelected={input.compare} onChange={toggleCompare}>Compare a second scenario</UiCheckbox>
          </div>
          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate CAC</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <CustomerAcquisitionCostResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}

function CountField({
  description,
  error,
  field,
  label,
  onChange,
  required,
  scenario,
  value,
}: {
  description?: string;
  error: string | null;
  field: "newCustomers" | "paidCustomers";
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  scenario: CacScenarioKey;
  value: string;
}) {
  return (
    <UiTextField
      autoCapitalize="none"
      autoComplete="off"
      dataFocusKey={`${scenario}.${field}`}
      description={description}
      error={error}
      inputMode="numeric"
      label={label}
      onChange={onChange}
      required={required}
      spellCheck={false}
      value={value}
    />
  );
}
