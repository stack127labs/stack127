"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { UiLiveChart } from "@/app/ui/charts/chart-client";
import type { UiChartSpec } from "@/app/ui/charts/chart-option";
import { UiButton, UiChoiceGroup, UiDisclosure, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  ANNUAL_PLAN_FEE_PRESETS,
  calculateAnnualPlanDiscount,
  type AnnualPlanErrors,
  type AnnualPlanFeeAmounts,
  type AnnualPlanFeePreset,
  type AnnualPlanFieldKey,
  type AnnualPlanInput,
  type AnnualPlanMonths,
  type AnnualPlanOfferMode,
  type AnnualPlanPercent,
  type AnnualPlanValues,
} from "@/lib/annual-plan-discount-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import styles from "./annual-plan-discount-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };

const CHANGED = "Inputs changed. Compare again.";
const PRESET_CHANGED = "Fee preset changed to Custom fee.";
const CHECKED = "Published US rate, checked 10 Oct 2026.";
const OFFER_FIELDS: Record<AnnualPlanOfferMode, "annualPrice" | "discountPercent" | "monthsFree"> = {
  annualPrice: "annualPrice",
  discount: "discountPercent",
  monthsFree: "monthsFree",
};
const FOCUS_ORDER: AnnualPlanFieldKey[] = [
  "currency", "monthlyPrice", "offerMode", "annualPrice", "discountPercent", "monthsFree",
  "monthlyChurnPercent", "annualRenewalPercent", "feePreset", "feePercent", "feeFixed",
];
const FEE_KEYS: AnnualPlanFieldKey[] = ["feePreset", "feePercent", "feeFixed"];

function emptyInput(): AnnualPlanInput {
  return {
    currency: "USD",
    monthlyPrice: "",
    offerMode: "discount",
    annualPrice: "",
    discountPercent: "",
    monthsFree: "",
    monthlyChurnPercent: "",
    annualRenewalPercent: "",
    feePreset: "none",
    feePercent: "",
    feeFixed: "",
  };
}

function presetById(id: string): AnnualPlanFeePreset | null {
  return ANNUAL_PLAN_FEE_PRESETS.find((preset) => preset.id === id) ?? null;
}

function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function formatInteger(value: bigint): string {
  return abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function currencySymbol(currency: SaasEconomicsCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatMoney(cents: bigint, currency: SaasEconomicsCurrency): string {
  const magnitude = abs(cents);
  const fraction = (magnitude % 100n).toString().padStart(2, "0");
  return `${cents < 0n ? "−" : ""}${currencySymbol(currency)}${formatInteger(magnitude / 100n)}.${fraction}`;
}

/** A difference always carries its sign, so the direction never depends on color. */
function signedMoney(cents: bigint, currency: SaasEconomicsCurrency): string {
  return cents > 0n ? `+${formatMoney(cents, currency)}` : formatMoney(cents, currency);
}

/** Hundredths of a percent, as entered: 3% or 2.5%. */
function formatHundredths(value: bigint): string {
  const fraction = (abs(value) % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${value < 0n ? "−" : ""}${formatInteger(value / 100n)}${fraction ? `.${fraction}` : ""}`;
}

function formatTenths(value: bigint): string {
  return `${value < 0n ? "−" : ""}${formatInteger(value / 10n)}.${abs(value) % 10n}`;
}

/** Magnitude of a percent, for sentences that say "more" or "off" themselves. */
function percentSize(percent: AnnualPlanPercent): string {
  return percent.nearZero ? "under 0.1%" : `${formatTenths(abs(percent.tenths))}%`;
}

function formatPercent(percent: AnnualPlanPercent): string {
  if (percent.nearZero) return percent.exact.numerator < 0n ? "Under −0.1%" : "Under 0.1%";
  return `${formatTenths(percent.tenths)}%`;
}

function formatMonths(months: AnnualPlanMonths): string {
  return months.exact ? formatInteger(months.tenths / 10n) : formatTenths(months.tenths);
}

function ordinal(value: bigint): string {
  const last = value % 10n;
  const lastTwo = value % 100n;
  const suffix = lastTwo >= 11n && lastTwo <= 13n ? "th" : last === 1n ? "st" : last === 2n ? "nd" : last === 3n ? "rd" : "th";
  return `${formatInteger(value)}${suffix}`;
}

function sameNumber(draft: string, value: string): boolean {
  return draft.trim() !== "" && Number(draft) === Number(value);
}

function feeDraftSummary(input: AnnualPlanInput): string {
  if (input.feePreset === "none") return "None";
  const preset = presetById(input.feePreset);
  const valid = /^\d+(?:\.\d{1,2})?$/.test(input.feePercent.trim()) && /^\d+(?:\.\d{1,2})?$/.test(input.feeFixed.trim());
  const name = preset?.label ?? "Custom fee";
  if (!valid) return name;
  const currency = SAAS_ECONOMICS_CURRENCIES.includes(input.currency as SaasEconomicsCurrency) ? input.currency as SaasEconomicsCurrency : "USD";
  const [whole, fraction = ""] = input.feeFixed.trim().split(".");
  const fixed = formatMoney(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")), currency);
  const edited = preset && !(sameNumber(input.feePercent, presetPercent(preset)) && sameNumber(input.feeFixed, presetFixed(preset)));
  return `${name} · ${Number(input.feePercent)}% + ${fixed}${edited ? " (edited)" : ""}`;
}

function presetPercent(preset: AnnualPlanFeePreset): string {
  return formatHundredths(preset.percentHundredths);
}

function presetFixed(preset: AnnualPlanFeePreset): string {
  return `${preset.fixedCents / 100n}.${(preset.fixedCents % 100n).toString().padStart(2, "0")}`;
}

function OfferLead({ resultRef, values }: { resultRef: RefObject<HTMLOutputElement | null>; values: AnnualPlanValues }) {
  const { currency, offer, offerMode } = values;
  const surcharge = offer.customerSavingsCents < 0n;
  const twelve = `12 payments of ${formatMoney(offer.monthlyPriceCents, currency)}`;
  const parts: string[] = [];
  if (surcharge) {
    if (offerMode !== "annualPrice") parts.push(`${percentSize(offer.discount)} more than ${twelve}`);
    parts.push(`Customer pays ${formatMoney(abs(offer.customerSavingsCents), currency)} more a year${offerMode === "annualPrice" ? ` than ${twelve}` : ""}`);
  } else {
    if (offerMode === "monthsFree") parts.push(`${percentSize(offer.discount)} off ${twelve}`);
    else {
      const months = formatMonths(offer.monthsFree);
      parts.push(`${months} ${months === "1" ? "month" : "months"} free`);
    }
    parts.push(`Customer saves ${formatMoney(offer.customerSavingsCents, currency)} a year${offerMode === "discount" ? ` against ${twelve}` : ""}`);
  }
  const leadIsDiscount = offerMode === "annualPrice";
  return (
    <UiPrimaryResult
      detail={(
        <span className={styles.detailLines}>
          <span>{parts.join(" · ")}</span>
          {offer.annualPriceRounded ? <span>Rounded to the nearest cent.</span> : null}
        </span>
      )}
      inputRef={resultRef}
      label={leadIsDiscount ? (surcharge ? "Annual surcharge" : "Annual discount") : "Annual price"}
      value={leadIsDiscount
        ? (surcharge ? `${percentSize(offer.discount)} more` : formatPercent(offer.discount))
        : formatMoney(offer.annualPriceCents, currency)}
    />
  );
}

function ValueLines({ lines, value }: { lines: string[]; value: string }) {
  return (
    <span className={styles.threshold}>
      <strong>{value}</strong>
      {lines.map((line) => <span className={styles.thresholdLine} key={line}>{line}</span>)}
    </span>
  );
}

function breakEvenLabel(percent: AnnualPlanPercent | null): string {
  if (!percent) return "unknown";
  return percent.exact.numerator < 0n ? `none, annual would need to cost ${percentSize(percent)} more` : formatPercent(percent);
}

function Thresholds({ values }: { values: AnnualPlanValues }) {
  const { comparison, currency, offer } = values;
  const equivalent = offer.invoiceEquivalent;
  const paymentLine = `The ${ordinal(equivalent.wholePayments)} monthly payment ${equivalent.months.exact ? "equals" : "passes"} ${formatMoney(offer.annualPriceCents, currency)}.`;

  let breakEven: { label: string; lines: string[]; value: string };
  if (!comparison) {
    breakEven = { label: "Break-even discount", lines: ["Needed to compare what each plan collects."], value: "Add monthly churn" };
  } else {
    const [year1, year2, year3] = comparison.horizons;
    const point = year1.breakEvenDiscount!;
    const negative = point.exact.numerator < 0n;
    const gap = abs(year1.differenceCents ?? 0n);
    const yours = offer.customerSavingsCents < 0n
      ? "Your annual price is above 12 monthly payments."
      : `Your ${formatPercent(offer.discount)} is ${year1.annualVsMonthly === "more" ? "below" : year1.annualVsMonthly === "less" ? "above" : "equal to"} it.`;
    const yearOne = year1.annualVsMonthly === "same"
      ? "In year one, both plans collect the same on average."
      : `In year one, annual collects ${formatMoney(gap, currency)} ${year1.annualVsMonthly === "more" ? "more" : "less"} than monthly, on average.`;
    const lines = negative
      ? [`Annual would need to cost ${percentSize(point)} more than 12 payments to match.`, yearOne]
      : [`${yours} ${yearOne}`];
    if (comparison.annualRenewalHundredths !== null) {
      lines.push(`Over 24 months: ${breakEvenLabel(year2.breakEvenDiscount)}. Over 36 months: ${breakEvenLabel(year3.breakEvenDiscount)}, at ${formatHundredths(comparison.annualRenewalHundredths)}% renewal.`);
    }
    breakEven = {
      label: `Break-even discount at ${formatHundredths(comparison.monthlyChurnHundredths)}% churn`,
      lines,
      value: negative ? "None" : formatPercent(point),
    };
  }

  return (
    <UiKeyValueList
      rows={[
        { label: "Annual price in monthly payments", value: <ValueLines lines={[paymentLine]} value={formatMonths(equivalent.months)} /> },
        { label: breakEven.label, value: <ValueLines lines={breakEven.lines} value={breakEven.value} /> },
      ]}
    />
  );
}

function amountCell(cents: bigint, fee: AnnualPlanFeeAmounts | null, currency: SaasEconomicsCurrency): ReactNode {
  if (!fee) return formatMoney(cents, currency);
  return (
    <span className={styles.cellStack}>
      <span>{formatMoney(cents, currency)}</span>
      <span className={styles.cellNote}>{formatMoney(fee.feesCents, currency)} fees</span>
    </span>
  );
}

function ComparisonTable({ values }: { values: AnnualPlanValues }) {
  const { comparison, currency, fee, offer, upfront } = values;
  const rows: { id: string; cells: Record<string, ReactNode> }[] = [
    {
      id: "signup",
      cells: {
        item: "Charged at signup",
        monthly: amountCell(upfront.monthly.grossCents, upfront.monthly.fee, currency),
        annual: amountCell(upfront.annual.grossCents, upfront.annual.fee, currency),
        difference: signedMoney(upfront.differenceCents, currency),
      },
    },
    {
      id: "mrr",
      cells: {
        item: (
          <span className={styles.rowLabel}>
            <span>MRR</span>
            <span className={styles.cellNote}>Annual price ÷ 12, not cash</span>
          </span>
        ),
        monthly: formatMoney(offer.mrr.monthlyPlanCents, currency),
        annual: formatMoney(offer.mrr.annualPlan.cents, currency),
        difference: signedMoney(offer.mrr.differenceCents, currency),
      },
    },
  ];
  if (comparison) {
    for (const horizon of comparison.horizons) {
      rows.push({
        id: `billings-${horizon.months}`,
        cells: {
          item: `Average collected by month ${horizon.months}`,
          monthly: formatMoney(horizon.monthly.grossCents, currency),
          annual: horizon.annual ? formatMoney(horizon.annual.grossCents, currency) : <span className={styles.cellNote}>Needs renewal rate</span>,
          difference: horizon.differenceCents === null ? "—" : signedMoney(horizon.differenceCents, currency),
        },
      });
    }
    if (fee) {
      for (const horizon of comparison.horizons) {
        const monthlyFee = horizon.monthly.fee!;
        const annualFee = horizon.annual?.fee ?? null;
        rows.push({
          id: `net-${horizon.months}`,
          cells: {
            item: `After fees by month ${horizon.months}`,
            monthly: amountCell(monthlyFee.netCents, monthlyFee, currency),
            annual: annualFee ? amountCell(annualFee.netCents, annualFee, currency) : <span className={styles.cellNote}>Needs renewal rate</span>,
            difference: horizon.netDifferenceCents === null ? "—" : signedMoney(horizon.netDifferenceCents, currency),
          },
        });
      }
    }
  }
  return (
    <UiDataTable
      ariaLabel="Monthly and annual plan per customer"
      caption="Per customer who signs up"
      columns={[
        { id: "item", label: "Item" },
        { id: "monthly", label: "Monthly plan", align: "right" },
        { id: "annual", label: "Annual plan", align: "right" },
        { id: "difference", label: "Difference", align: "right" },
      ]}
      rows={rows}
    />
  );
}

function RunningTotalChart({ values }: { values: AnnualPlanValues }) {
  const { comparison, currency } = values;
  const spec = useMemo<UiChartSpec | null>(() => {
    if (!comparison) return null;
    const withRenewal = comparison.annualRenewalHundredths !== null;
    const totals = comparison.runningTotals.filter((point) => withRenewal || point.month <= 12);
    const usd = currency === "USD";
    return {
      caption: withRenewal
        ? "Annual jumps when customers renew at months 13 and 25."
        : "Months 1 to 12. Add an annual renewal rate to see months 13 to 36.",
      format: usd ? "currency" : "number",
      kind: "line",
      series: [
        { id: "monthly", label: "Monthly plan", points: totals.map((point) => [point.month, Number(point.monthlyCents) / 100] as const) },
        { id: "annual", label: "Annual plan", points: totals.map((point) => [point.month, Number(point.annualCents ?? 0n) / 100] as const) },
      ],
      title: `Average collected per customer, running total${usd ? "" : ` in ${currency}`}`,
      xFormat: "number",
    };
  }, [comparison, currency]);
  return spec ? <UiLiveChart spec={spec} /> : null;
}

function Assumptions({ values }: { values: AnnualPlanValues }) {
  const { comparison, currency, fee } = values;
  const sentences: string[] = [];
  if (comparison) {
    sentences.push(`Monthly customers pay at signup, then ${formatHundredths(comparison.monthlyChurnHundredths)}% cancel before each later payment.`);
    sentences.push(comparison.annualRenewalHundredths === null
      ? "Annual customers pay at signup. Add a renewal rate to see later years."
      : `Annual customers pay at signup, and ${formatHundredths(comparison.annualRenewalHundredths)}% renew each year.`);
  }
  if (fee) {
    const preset = presetById(fee.preset);
    const name = preset ? `${preset.label}${fee.edited ? ", edited" : ""}` : "custom fee";
    sentences.push(`Fees are ${formatHundredths(fee.percentHundredths)}% + ${formatMoney(fee.fixedCents, currency)} per successful charge (${name}). They don't change MRR.`);
  }
  sentences.push("Before refunds, taxes, and failed payments. Not profit.");
  return <p className={styles.assumptions}>{sentences.join(" ")}</p>;
}

function AnnualPlanResults({ resultRef, values }: { resultRef: RefObject<HTMLOutputElement | null>; values: AnnualPlanValues }) {
  return (
    <section aria-label="Annual plan results" className={styles.results}>
      <OfferLead resultRef={resultRef} values={values} />
      <Thresholds values={values} />
      <ComparisonTable values={values} />
      <RunningTotalChart values={values} />
      <Assumptions values={values} />
    </section>
  );
}

export function AnnualPlanDiscountCalculator() {
  const [input, setInput] = useState(emptyInput);
  const [errors, setErrors] = useState<AnnualPlanErrors>({});
  const [result, setResult] = useState<AnnualPlanValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [feesOpen, setFeesOpen] = useState(false);
  const focusRequest = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);
  const usd = input.currency === "USD";
  const offerMode = input.offerMode as AnnualPlanOfferMode;
  const offerField = OFFER_FIELDS[offerMode] ?? "discountPercent";
  const selectedPreset = presetById(input.feePreset);

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

  function change(update: (current: AnnualPlanInput) => AnnualPlanInput, message?: string) {
    const hadResult = result !== null;
    setInput(update);
    setErrors({});
    setResult(null);
    if (message) setStatus({ text: message, tone: "neutral" });
    else if (hadResult) setStatus({ text: CHANGED, tone: "neutral" });
    else if (status?.text !== CHANGED) setStatus(null);
  }

  function setField(key: keyof AnnualPlanInput, value: string) {
    change((current) => ({ ...current, [key]: value }));
  }

  function changeCurrency(value: string) {
    if (!SAAS_ECONOMICS_CURRENCIES.includes(value as SaasEconomicsCurrency)) return;
    const demote = value !== "USD" && presetById(input.feePreset) !== null;
    change((current) => ({ ...current, currency: value, feePreset: demote ? "custom" : current.feePreset }), demote ? PRESET_CHANGED : undefined);
  }

  function changePreset(value: string) {
    const preset = presetById(value);
    change((current) => preset
      ? { ...current, feePreset: value, feePercent: presetPercent(preset), feeFixed: presetFixed(preset) }
      : { ...current, feePreset: value });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateAnnualPlanDiscount(input);
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        if (calculation.errors.form) setStatus({ text: calculation.errors.form, tone: "danger" });
        const first = FOCUS_ORDER.find((key) => calculation.errors[key]);
        if (first) {
          if (FEE_KEYS.includes(first)) setFeesOpen(true);
          focusRequest.current = first;
        }
        return;
      }
      setErrors({});
      setResult(calculation.values);
      focusRequest.current = "result";
    } catch {
      setErrors({});
      setResult(null);
      setStatus({ text: "Couldn't calculate. Try again.", tone: "danger" });
    }
  }

  function reset() {
    setInput(emptyInput());
    setErrors({});
    setResult(null);
    setFeesOpen(false);
    setStatus({ text: "Form reset.", tone: "neutral" });
    focusRequest.current = "monthlyPrice";
  }

  const offerCopy = {
    annualPrice: { label: "Annual price", suffix: input.currency },
    discountPercent: { label: "Annual discount", suffix: "%" },
    monthsFree: { label: "Months free", suffix: "months" },
  }[offerField];

  const presetOptions = [
    uiOption("none", "None"),
    ...(usd ? ANNUAL_PLAN_FEE_PRESETS.map((preset) => uiOption(preset.id, preset.label)) : []),
    uiOption("custom", "Custom fee"),
  ];

  function textField(key: keyof AnnualPlanInput, label: string, suffix: string, options: { description?: string; required?: boolean } = {}) {
    return (
      <UiTextField
        autoCapitalize="none"
        autoComplete="off"
        dataFocusKey={key}
        description={options.description}
        error={errors[key] ?? null}
        inputMode="decimal"
        key={key}
        label={label}
        onChange={(value) => setField(key, value)}
        required={options.required}
        spellCheck={false}
        suffix={suffix}
        value={input[key]}
      />
    );
  }

  return (
    <section aria-label="Annual plan discount calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Annual plan inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <div className={styles.priceRow}>
            <div className={styles.currency}>
              <UiSelect
                dataFocusKey="currency"
                error={errors.currency ?? null}
                label="Currency"
                onChange={changeCurrency}
                options={SAAS_ECONOMICS_CURRENCIES.map((currency) => uiOption(currency, currency))}
                required
                value={input.currency}
              />
            </div>
            {textField("monthlyPrice", "Monthly price", input.currency, { required: true })}
          </div>
          <div className={styles.offer}>
            <UiChoiceGroup
              dataFocusKey="offerMode"
              error={errors.offerMode ?? null}
              label="Annual offer as"
              onChange={(value) => setField("offerMode", value)}
              options={[uiOption("discount", "Discount"), uiOption("monthsFree", "Months free"), uiOption("annualPrice", "Annual price")]}
              required
              value={input.offerMode}
            />
            <div className={styles.offerField}>
              {textField(offerField, offerCopy.label, offerCopy.suffix, { required: true })}
            </div>
          </div>
          <div className={styles.pair}>
            {textField("monthlyChurnPercent", "Monthly churn (optional)", "%", {
              description: "Share of paying monthly customers who cancel each month. Leave blank to see the price only.",
            })}
            {textField("annualRenewalPercent", "Annual renewal rate (optional)", "%", {
              description: "Share of annual customers who renew at year end. Not the same as monthly churn.",
            })}
          </div>
          <UiDisclosure isExpanded={feesOpen} label="Processor fees" onExpandedChange={setFeesOpen} summary={feeDraftSummary(input)}>
            <div className={styles.fees}>
              <div className={styles.presetField}>
                <UiSelect
                  dataFocusKey="feePreset"
                  error={errors.feePreset ?? null}
                  label="Fee preset"
                  onChange={changePreset}
                  options={presetOptions}
                  value={input.feePreset}
                />
              </div>
              {input.feePreset !== "none" ? (
                <>
                  <div className={styles.pair}>
                    {textField("feePercent", "Fee percent", "%", { required: true })}
                    {textField("feeFixed", "Fixed fee per charge", input.currency, { required: true })}
                  </div>
                  <p className={styles.feeNote}>
                    {selectedPreset ? (
                      <>
                        {selectedPreset.scope} {CHECKED}{" "}
                        <a href={selectedPreset.sourceUrl} rel="noreferrer" target="_blank">Current rates</a>
                      </>
                    ) : "Percent of each charge, plus a fixed amount per successful charge."}
                  </p>
                </>
              ) : null}
            </div>
          </UiDisclosure>
          <UiActionRow>
            <UiButton type="submit" variant="primary">Compare plans</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <AnnualPlanResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}
