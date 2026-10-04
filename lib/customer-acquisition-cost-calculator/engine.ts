import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import { SAAS_ECONOMICS_MAX_MONEY_CENTS, isSaasEconomicsCurrency, parseMoneyCents, parsePercentHundredths, parseWholeNumber } from "../saas-economics/shared.ts";
import { type ExactFraction, exactFraction, addExact, divideExact, multiplyExact, isWholeAtScale, roundExact } from "../saas-economics/unit-economics.ts";

export const CAC_COST_CATEGORIES = ["paidMedia", "salesMarketingPay", "agencies", "toolsContentEvents"] as const;
export type CacCostCategory = (typeof CAC_COST_CATEGORIES)[number];
export const CAC_ALLOCATION_METHODS = ["share", "hours", "headcount"] as const;
export type CacAllocationMethod = (typeof CAC_ALLOCATION_METHODS)[number];
export const CAC_TIMINGS = ["samePeriod", "matched"] as const;
export type CacTiming = (typeof CAC_TIMINGS)[number];

export const CAC_SCENARIO_FIELDS = [
  ...CAC_COST_CATEGORIES,
  "sharedCosts", "allocationMethod", "sharePercent",
  "acquisitionHours", "totalHours", "acquisitionHeadcount", "totalHeadcount",
  "founderHours", "founderHourlyValue",
  "newCustomers", "paidCustomers", "timing",
] as const;
export type CacScenarioField = (typeof CAC_SCENARIO_FIELDS)[number];
export type CacScenarioKey = "baseline" | "alternative";
export type CacFieldKey = "form" | "currency" | `${CacScenarioKey}.${CacScenarioField}`;

export type CacScenarioInput = Record<CacScenarioField, string>;
export type CustomerAcquisitionCostInput = {
  currency: string;
  includeShared: boolean;
  includeFounderTime: boolean;
  compare: boolean;
  baseline: CacScenarioInput;
  alternative: CacScenarioInput;
};

export type CacPerCustomer =
  | { kind: "finite"; cents: bigint; isRounded: boolean; roundedToZero: boolean }
  | { kind: "noCustomers" };

export type CacCostLine = {
  category: CacCostCategory;
  enteredCents: bigint | null;      // null = not counted
  perCustomerCents: bigint | null;  // null when not counted or newCustomers is 0
};

export type CacAllocationDriver =
  | { method: "share"; shareHundredths: bigint }
  | { method: "hours"; partHundredths: bigint; wholeHundredths: bigint }
  | { method: "headcount"; partHundredths: bigint; wholeHundredths: bigint };

export type CacSharedCost = {
  sharedCents: bigint;
  driver: CacAllocationDriver;
  allocatedCents: bigint;           // half away from zero
  allocatedIsRounded: boolean;
  perCustomerCents: bigint | null;  // from the exact allocation
};

export type CacFounderTime = {
  hoursHundredths: bigint;
  hourlyValueCents: bigint;
  valueCents: bigint;               // half away from zero
  valueIsRounded: boolean;
  perCustomerCents: bigint | null;
};

export type CacScenarioValues = {
  timing: CacTiming;
  costs: CacCostLine[];             // always four, in CAC_COST_CATEGORIES order
  shared: CacSharedCost | null;     // null when shared costs are off
  cashTotalCents: bigint;
  cashTotalIsRounded: boolean;
  cashCac: CacPerCustomer;
  founderTime: CacFounderTime | null;          // null when founder time is off
  totalWithFounderTimeCents: bigint | null;
  cacWithFounderTime: CacPerCustomer | null;
  newCustomers: bigint;
  paidCustomers: bigint | null;     // null when blank
  paidMediaCac: CacPerCustomer | null;         // null when paidCustomers is blank
};

export type CacComparison = {
  /** alternative - baseline, from the rounded cents; null unless both are finite. Negative means cheaper. */
  cashCacDeltaCents: bigint | null;
  cacWithFounderTimeDeltaCents: bigint | null;
  paidMediaCacDeltaCents: bigint | null;
};

export type CustomerAcquisitionCostValues = {
  currency: SaasEconomicsCurrency;
  includeShared: boolean;
  includeFounderTime: boolean;
  baseline: CacScenarioValues;
  alternative: CacScenarioValues | null;
  comparison: CacComparison | null;
};

export type CustomerAcquisitionCostErrors = Partial<Record<CacFieldKey, string>>;

export type CustomerAcquisitionCostCalculation =
  | { status: "valid"; values: CustomerAcquisitionCostValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: CustomerAcquisitionCostErrors };

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const blank = (value: unknown) => typeof value === "string" && value.trim() === "";

function perCustomer(amount: ExactFraction, count: bigint): CacPerCustomer {
  if (count === 0n) return { kind: "noCustomers" };
  const value = divideExact(amount, exactFraction(count));
  const cents = roundExact(value);
  return { kind: "finite", cents, isRounded: !isWholeAtScale(value, 1n), roundedToZero: value.numerator > 0n && cents === 0n };
}

export function calculateCustomerAcquisitionCost(raw: unknown): CustomerAcquisitionCostCalculation {
  const input = record(raw);
  const errors: CustomerAcquisitionCostErrors = {};
  const formError = "Something in the form is out of date. Reset and try again.";
  if (!input) return { status: "invalid", values: null, errors: { form: formError } };
  const currency = typeof input.currency === "string" ? input.currency.trim() : input.currency;
  if (!isSaasEconomicsCurrency(currency)) errors.currency = "Choose one of the listed options.";
  if ([input.includeShared, input.includeFounderTime, input.compare].some(v => typeof v !== "boolean")) errors.form = formError;

  function scenario(rawScenario: unknown, key: CacScenarioKey): CacScenarioValues | null {
    const source = record(rawScenario);
    if (!source) { errors.form = formError; return null; }
    let failed = false;
    function error(field: CacScenarioField, message: string) { failed = true; errors[`${key}.${field}`] = message; }
    function money(field: CacScenarioField, label: string, max = SAAS_ECONOMICS_MAX_MONEY_CENTS): bigint | null {
      const parsed = parseMoneyCents(source![field], { min: 0n, max });
      if (parsed.ok) return parsed.value;
      error(field, parsed.reason === "missing" ? `Enter ${label}.`
        : parsed.reason === "range" ? `Enter an amount up to ${max === 100000000n ? "1,000,000.00" : "1,000,000,000.00"}.`
        : "Use digits with up to two decimals. No signs, commas, or currency symbols.");
      return null;
    }
    function decimal(field: CacScenarioField): bigint | null {
      const parsed = parsePercentHundredths(source![field], { min: 0n, max: 10000000n });
      if (parsed.ok) return parsed.value;
      error(field, "Enter a number from 0 to 100,000, with up to two decimals.");
      return null;
    }
    function count(field: "newCustomers" | "paidCustomers"): bigint | null {
      const parsed = parseWholeNumber(source![field], { min: 0n, max: 10000000n });
      if (parsed.ok) return parsed.value;
      error(field, "Enter a whole number from 0 to 10,000,000.");
      return null;
    }
    const timing = source.timing;
    if (timing !== "samePeriod" && timing !== "matched") error("timing", "Choose one of the listed options.");
    const amounts = CAC_COST_CATEGORIES.map(category => blank(source[category]) ? null : money(category, "this cost"));
    const anyCostEntered = CAC_COST_CATEGORIES.some(category => !blank(source[category])) || input!.includeShared === true || input!.includeFounderTime === true;
    if (!anyCostEntered) error("paidMedia", "Enter at least one cost. Use 0 if there were none.");
    const newCustomers = count("newCustomers");
    const paidCustomers = blank(source.paidCustomers) ? null : count("paidCustomers");
    if (newCustomers !== null && paidCustomers !== null && paidCustomers > newCustomers) error("paidCustomers", "This can't be more than new paying customers.");
    if (!blank(source.paidCustomers) && blank(source.paidMedia)) error("paidMedia", "Enter paid media, or clear paid-sourced customers.");

    let shared: CacSharedCost | null = null;
    let allocated = exactFraction(0n);
    if (input!.includeShared === true) {
      const sharedCents = money("sharedCosts", "shared costs");
      const method = source.allocationMethod;
      let driver: CacAllocationDriver | null = null;
      if (method === "share") {
        const share = parsePercentHundredths(source.sharePercent, { min: 0n, max: 10000n });
        if (!share.ok) error("sharePercent", "Enter a percent from 0 to 100, with up to two decimals.");
        else {
          driver = { method, shareHundredths: share.value };
          if (sharedCents !== null) allocated = exactFraction(sharedCents * share.value, 10000n);
        }
      } else if (method === "hours" || method === "headcount") {
        const partField = method === "hours" ? "acquisitionHours" : "acquisitionHeadcount";
        const totalField = method === "hours" ? "totalHours" : "totalHeadcount";
        const part = decimal(partField);
        const whole = decimal(totalField);
        if (whole === 0n) error(totalField, "Enter a total above 0.");
        if (part !== null && whole !== null && part > whole) error(partField, "This can't be more than the total.");
        if (part !== null && whole !== null && whole > 0n && part <= whole) {
          driver = { method, partHundredths: part, wholeHundredths: whole };
          if (sharedCents !== null) allocated = exactFraction(sharedCents * part, whole);
        }
      } else error("allocationMethod", "Choose one of the listed options.");
      if (sharedCents !== null && driver !== null) shared = {
        sharedCents, driver, allocatedCents: roundExact(allocated), allocatedIsRounded: !isWholeAtScale(allocated, 1n),
        perCustomerCents: newCustomers === null || newCustomers === 0n ? null : roundExact(divideExact(allocated, exactFraction(newCustomers))),
      };
    }
    let founderTime: CacFounderTime | null = null;
    let founderValue = exactFraction(0n);
    if (input!.includeFounderTime === true) {
      const hours = decimal("founderHours");
      const rate = money("founderHourlyValue", "founder hourly value", 100000000n);
      if (hours !== null && rate !== null) {
        founderValue = multiplyExact(exactFraction(hours, 100n), exactFraction(rate));
        founderTime = {
          hoursHundredths: hours, hourlyValueCents: rate, valueCents: roundExact(founderValue), valueIsRounded: !isWholeAtScale(founderValue, 1n),
          perCustomerCents: newCustomers === null || newCustomers === 0n ? null : roundExact(divideExact(founderValue, exactFraction(newCustomers))),
        };
      }
    }
    if (failed || newCustomers === null || (timing !== "samePeriod" && timing !== "matched")) return null;
    const cashTotal = addExact(...amounts.map(value => exactFraction(value ?? 0n)), allocated);
    const totalWithFounder = addExact(cashTotal, founderValue);
    return {
      timing, costs: CAC_COST_CATEGORIES.map((category, index) => ({
        category, enteredCents: amounts[index], perCustomerCents: amounts[index] === null || newCustomers === 0n ? null
          : roundExact(exactFraction(amounts[index]!, newCustomers)),
      })),
      shared, cashTotalCents: roundExact(cashTotal), cashTotalIsRounded: !isWholeAtScale(cashTotal, 1n), cashCac: perCustomer(cashTotal, newCustomers),
      founderTime, totalWithFounderTimeCents: founderTime === null ? null : roundExact(totalWithFounder),
      cacWithFounderTime: founderTime === null ? null : perCustomer(totalWithFounder, newCustomers),
      newCustomers, paidCustomers,
      paidMediaCac: paidCustomers === null ? null : perCustomer(exactFraction(amounts[0]!), paidCustomers),
    };
  }
  const baseline = scenario(input.baseline, "baseline");
  const alternative = input.compare === true ? scenario(input.alternative, "alternative") : null;
  if (Object.keys(errors).length || !baseline || (input.compare === true && !alternative) || !isSaasEconomicsCurrency(currency)) {
    return { status: "invalid", values: null, errors };
  }
  function delta(a: CacPerCustomer | null, b: CacPerCustomer | null) {
    return a?.kind === "finite" && b?.kind === "finite" ? b.cents - a.cents : null;
  }
  return { status: "valid", errors: {}, values: {
    currency, includeShared: input.includeShared as boolean, includeFounderTime: input.includeFounderTime as boolean, baseline, alternative,
    comparison: alternative === null ? null : {
      cashCacDeltaCents: delta(baseline.cashCac, alternative.cashCac),
      cacWithFounderTimeDeltaCents: delta(baseline.cacWithFounderTime, alternative.cacWithFounderTime),
      paidMediaCacDeltaCents: delta(baseline.paidMediaCac, alternative.paidMediaCac),
    },
  } };
}
