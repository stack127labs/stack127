import {
  type SaasEconomicsCurrency,
  SAAS_ECONOMICS_MAX_MONEY_CENTS,
  divideCeil,
  isSaasEconomicsCurrency,
  parseMoneyCents,
  parsePercentHundredths,
} from "../saas-economics/shared.ts";
import {
  type ExactFraction,
  addExact,
  compareExact,
  cumulativeGrossProfit,
  divideExact,
  exactFraction,
  isWholeAtScale,
  multiplyExact,
  roundExact,
} from "../saas-economics/unit-economics.ts";

export const ANNUAL_PLAN_OFFER_MODES = ["annualPrice", "discount", "monthsFree"] as const;
export type AnnualPlanOfferMode = (typeof ANNUAL_PLAN_OFFER_MODES)[number];
export const ANNUAL_PLAN_HORIZONS = [12, 24, 36] as const;
export type AnnualPlanHorizon = (typeof ANNUAL_PLAN_HORIZONS)[number];
export const ANNUAL_PLAN_FEE_PRESET_IDS = ["none", "stripeCard", "stripeCardBilling", "paddle", "lemonSqueezy", "custom"] as const;
export type AnnualPlanFeePresetId = (typeof ANNUAL_PLAN_FEE_PRESET_IDS)[number];

export type AnnualPlanFeePreset = {
  id: Exclude<AnnualPlanFeePresetId, "none" | "custom">;
  label: string;
  percentHundredths: bigint;
  fixedCents: bigint;
  currency: "USD";
  scope: string;
  sourceUrl: string;
  checked: "2026-10-10";
};
export const ANNUAL_PLAN_FEE_PRESETS: readonly AnnualPlanFeePreset[] = [
  {
    id: "stripeCard", label: "Stripe, card", percentHundredths: 290n, fixedCents: 30n,
    currency: "USD", scope: "Standard US online card rate. Leaves out Stripe Billing's 0.7%.",
    sourceUrl: "https://stripe.com/pricing", checked: "2026-10-10",
  },
  {
    id: "stripeCardBilling", label: "Stripe, card and Billing", percentHundredths: 360n, fixedCents: 30n,
    currency: "USD", scope: "Card rate plus Stripe Billing's pay-as-you-go 0.7%.",
    sourceUrl: "https://stripe.com/pricing", checked: "2026-10-10",
  },
  {
    id: "paddle", label: "Paddle", percentHundredths: 500n, fixedCents: 50n,
    currency: "USD", scope: "Pay-as-you-go checkout rate. Custom plans may differ.",
    sourceUrl: "https://www.paddle.com/pricing", checked: "2026-10-10",
  },
  {
    id: "lemonSqueezy", label: "Lemon Squeezy, subscription", percentHundredths: 550n, fixedCents: 50n,
    currency: "USD", scope: "5% + $0.50, plus 0.5% on subscription payments. Leaves out the 1.5% fees for international and PayPal payments.",
    sourceUrl: "https://docs.lemonsqueezy.com/help/getting-started/fees", checked: "2026-10-10",
  },
];

export type AnnualPlanInput = {
  currency: string;
  monthlyPrice: string;
  offerMode: string;
  annualPrice: string;
  discountPercent: string;
  monthsFree: string;
  monthlyChurnPercent: string;
  annualRenewalPercent: string;
  feePreset: string;
  feePercent: string;
  feeFixed: string;
};
export type AnnualPlanFieldKey = "form" | keyof AnnualPlanInput;
export type AnnualPlanErrors = Partial<Record<AnnualPlanFieldKey, string>>;
export type AnnualPlanMoney = { cents: bigint; exact: ExactFraction };
export type AnnualPlanPercent = { tenths: bigint; nearZero: boolean; exact: ExactFraction };
export type AnnualPlanMonths = { tenths: bigint; exact: boolean };

export type AnnualPlanOffer = {
  monthlyPriceCents: bigint;
  annualPriceCents: bigint;
  annualPriceRounded: boolean;
  listAnnualCents: bigint;
  customerSavingsCents: bigint;
  discount: AnnualPlanPercent;
  monthsFree: AnnualPlanMonths;
  mrr: { monthlyPlanCents: bigint; annualPlan: AnnualPlanMoney; differenceCents: bigint };
  invoiceEquivalent: { months: AnnualPlanMonths; wholePayments: bigint };
};
export type AnnualPlanFeeAmounts = { feesCents: bigint; netCents: bigint };
export type AnnualPlanUpfront = {
  monthly: { grossCents: bigint; fee: AnnualPlanFeeAmounts | null };
  annual: { grossCents: bigint; fee: AnnualPlanFeeAmounts | null };
  differenceCents: bigint;
};
export type AnnualPlanHorizonResult = {
  months: AnnualPlanHorizon;
  monthly: { grossCents: bigint; expectedChargesHundredths: bigint; fee: AnnualPlanFeeAmounts | null };
  annual: { grossCents: bigint; expectedChargesHundredths: bigint; fee: AnnualPlanFeeAmounts | null } | null;
  differenceCents: bigint | null;
  netDifferenceCents: bigint | null;
  annualVsMonthly: "more" | "same" | "less" | null;
  breakEvenDiscount: AnnualPlanPercent | null;
};
export type AnnualPlanComparison = {
  monthlyChurnHundredths: bigint;
  annualRenewalHundredths: bigint | null;
  horizons: AnnualPlanHorizonResult[];
  runningTotals: { month: number; monthlyCents: bigint; annualCents: bigint | null }[];
};
export type AnnualPlanFee = {
  preset: Exclude<AnnualPlanFeePresetId, "none">;
  percentHundredths: bigint;
  fixedCents: bigint;
  edited: boolean;
};
export type AnnualPlanValues = {
  currency: SaasEconomicsCurrency;
  offerMode: AnnualPlanOfferMode;
  offer: AnnualPlanOffer;
  upfront: AnnualPlanUpfront;
  fee: AnnualPlanFee | null;
  comparison: AnnualPlanComparison | null;
};
export type AnnualPlanCalculation =
  | { status: "valid"; values: AnnualPlanValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: AnnualPlanErrors };

function moneyValue(exact: ExactFraction): AnnualPlanMoney {
  return { cents: roundExact(exact), exact };
}

function percentValue(exact: ExactFraction): AnnualPlanPercent {
  const tenths = roundExact(exact, 1000n);
  return { tenths, nearZero: exact.numerator !== 0n && tenths === 0n, exact };
}

function monthsValue(exact: ExactFraction): AnnualPlanMonths {
  return { tenths: roundExact(exact, 10n), exact: isWholeAtScale(exact, 1n) };
}

export function calculateAnnualPlanDiscount(inputValue: unknown): AnnualPlanCalculation {
  const formError = "Something in the form is out of date. Reset and try again.";
  if (inputValue === null || typeof inputValue !== "object" || Array.isArray(inputValue)) {
    return { status: "invalid", values: null, errors: { form: formError } };
  }
  const input = inputValue as Record<string, unknown>;
  const errors: AnnualPlanErrors = {};
  const fields: (keyof AnnualPlanInput)[] = [
    "currency", "monthlyPrice", "offerMode", "annualPrice", "discountPercent", "monthsFree",
    "monthlyChurnPercent", "annualRenewalPercent", "feePreset", "feePercent", "feeFixed",
  ];
  if (fields.some(key => typeof input[key] !== "string")) errors.form = formError;
  const optionError = "Choose one of the listed options.";
  const currency = typeof input.currency === "string" ? input.currency.trim() : input.currency;
  if (!isSaasEconomicsCurrency(currency)) errors.currency = optionError;
  const offerMode = input.offerMode as AnnualPlanOfferMode;
  if (!ANNUAL_PLAN_OFFER_MODES.includes(offerMode)) errors.offerMode = optionError;
  const feePreset = input.feePreset as AnnualPlanFeePresetId;
  if (!ANNUAL_PLAN_FEE_PRESET_IDS.includes(feePreset)) errors.feePreset = optionError;

  function money(key: "monthlyPrice" | "annualPrice" | "feeFixed", missing: string): bigint | null {
    const fixed = key === "feeFixed";
    const parsed = parseMoneyCents(input[key], { min: 0n, max: fixed ? 10000n : SAAS_ECONOMICS_MAX_MONEY_CENTS });
    if (!parsed.ok) {
      errors[key] = parsed.reason === "missing" ? missing
        : parsed.reason === "range" ? fixed ? "Enter a fixed fee up to 100.00." : "Enter an amount up to 1,000,000,000.00."
        : "Use digits with up to two decimals. No signs, commas, or currency symbols.";
      return null;
    }
    if (!fixed && parsed.value === 0n) {
      errors[key] = key === "monthlyPrice" ? "Enter a monthly price above 0." : "Enter an annual price above 0.";
      return null;
    }
    return parsed.value;
  }

  function percent(key: "discountPercent" | "monthsFree" | "monthlyChurnPercent" | "annualRenewalPercent" | "feePercent", max: bigint, message: string, missing = message): bigint | null {
    const parsed = parsePercentHundredths(input[key], { min: 0n, max });
    if (!parsed.ok) {
      errors[key] = parsed.reason === "missing" ? missing : message;
      return null;
    }
    return parsed.value;
  }

  const monthlyPriceCents = money("monthlyPrice", "Enter the monthly price.");
  let annualPriceCents: bigint | null = null;
  let annualPriceRounded = false;
  if (offerMode === "annualPrice") annualPriceCents = money("annualPrice", "Enter the annual price.");
  else if (offerMode === "discount" || offerMode === "monthsFree") {
    const discountMode = offerMode === "discount";
    const key = discountMode ? "discountPercent" : "monthsFree";
    const value = percent(key, discountMode ? 9999n : 1199n,
      discountMode ? "Enter a number from 0 to 99.99, without the % sign. To charge more than 12 monthly payments, choose Annual price."
        : "Enter months free from 0 to 11.99.",
      discountMode ? "Enter the annual discount." : "Enter the number of months free.");
    if (monthlyPriceCents !== null && value !== null) {
      const derived = discountMode
        ? exactFraction(12n * monthlyPriceCents * (10000n - value), 10000n)
        : exactFraction(monthlyPriceCents * (1200n - value), 100n);
      annualPriceCents = roundExact(derived);
      annualPriceRounded = !isWholeAtScale(derived, 1n);
      if (annualPriceCents === 0n) {
        errors[key] = discountMode ? "This makes the annual price 0.00. Use a smaller discount."
          : "This makes the annual price 0.00. Use fewer months free.";
      }
    }
  }

  function optionalPercent(key: "monthlyChurnPercent" | "annualRenewalPercent"): bigint | null {
    if (typeof input[key] === "string" && !input[key].trim()) return null;
    return percent(key, 10000n, "Enter a percent from 0 to 100, with up to two decimals, or leave it blank.");
  }
  const monthlyChurnHundredths = optionalPercent("monthlyChurnPercent");
  const annualRenewalHundredths = optionalPercent("annualRenewalPercent");
  let fee: AnnualPlanFee | null = null;
  if (feePreset !== "none" && ANNUAL_PLAN_FEE_PRESET_IDS.includes(feePreset)) {
    const preset = ANNUAL_PLAN_FEE_PRESETS.find(value => value.id === feePreset);
    if (preset && currency !== "USD") {
      errors.feePreset = "These presets are US rates in USD. Choose Custom fee for other currencies.";
    }
    const percentHundredths = percent("feePercent", 5000n, "Enter a fee percent from 0 to 50, with up to two decimals.");
    const fixedCents = money("feeFixed", "Enter a fixed fee per charge. Use 0 if there is none.");
    if (percentHundredths !== null && fixedCents !== null) {
      fee = { preset: feePreset, percentHundredths, fixedCents,
        edited: preset !== undefined && (percentHundredths !== preset.percentHundredths || fixedCents !== preset.fixedCents) };
    }
  }
  if (Object.keys(errors).length || !isSaasEconomicsCurrency(currency) || monthlyPriceCents === null || annualPriceCents === null) {
    return { status: "invalid", values: null, errors };
  }

  const listAnnualCents = 12n * monthlyPriceCents;
  const customerSavingsCents = listAnnualCents - annualPriceCents;
  const annualMrr = moneyValue(exactFraction(annualPriceCents, 12n));
  const offer: AnnualPlanOffer = {
    monthlyPriceCents, annualPriceCents, annualPriceRounded, listAnnualCents, customerSavingsCents,
    discount: percentValue(exactFraction(customerSavingsCents, listAnnualCents)),
    monthsFree: monthsValue(exactFraction(customerSavingsCents, monthlyPriceCents)),
    mrr: { monthlyPlanCents: monthlyPriceCents, annualPlan: annualMrr, differenceCents: annualMrr.cents - monthlyPriceCents },
    invoiceEquivalent: {
      months: monthsValue(exactFraction(annualPriceCents, monthlyPriceCents)),
      wholePayments: divideCeil(annualPriceCents, monthlyPriceCents),
    },
  };

  function feeAmounts(gross: ExactFraction, charges: ExactFraction): AnnualPlanFeeAmounts | null {
    if (fee === null) return null;
    const feesCents = roundExact(addExact(
      multiplyExact(gross, exactFraction(fee.percentHundredths, 10000n)),
      multiplyExact(charges, exactFraction(fee.fixedCents)),
    ));
    return { feesCents, netCents: roundExact(gross) - feesCents };
  }
  const upfront: AnnualPlanUpfront = {
    monthly: { grossCents: monthlyPriceCents, fee: feeAmounts(exactFraction(monthlyPriceCents), exactFraction(1n)) },
    annual: { grossCents: annualPriceCents, fee: feeAmounts(exactFraction(annualPriceCents), exactFraction(1n)) },
    differenceCents: annualPriceCents - monthlyPriceCents,
  };

  let comparison: AnnualPlanComparison | null = null;
  if (monthlyChurnHundredths !== null) {
    const monthlyTotals = Array.from({ length: 36 }, (_, index) => cumulativeGrossProfit({
      arpaCents: monthlyPriceCents, grossMarginHundredths: 10000n, churnHundredths: monthlyChurnHundredths,
    }, index + 1));
    const q = annualRenewalHundredths === null ? null : exactFraction(annualRenewalHundredths, 10000n);
    const annualCharges = [exactFraction(1n), q === null ? null : addExact(exactFraction(1n), q),
      q === null ? null : addExact(exactFraction(1n), q, multiplyExact(q, q))];
    const annualTotals = annualCharges.map(charges => charges === null ? null : multiplyExact(exactFraction(annualPriceCents), charges));
    const horizons: AnnualPlanHorizonResult[] = ANNUAL_PLAN_HORIZONS.map((months, index) => {
      const monthlyGross = monthlyTotals[months - 1];
      const monthlyCharges = divideExact(monthlyGross, exactFraction(monthlyPriceCents));
      const monthly = {
        grossCents: roundExact(monthlyGross), expectedChargesHundredths: roundExact(monthlyCharges, 100n),
        fee: feeAmounts(monthlyGross, monthlyCharges),
      };
      const annualGross = annualTotals[index];
      const charges = annualCharges[index];
      const annual = annualGross === null || charges === null ? null : {
        grossCents: roundExact(annualGross), expectedChargesHundredths: roundExact(charges, 100n),
        fee: feeAmounts(annualGross, charges),
      };
      const direction = annualGross === null ? null : compareExact(annualGross, monthlyGross);
      const breakEvenDiscount = charges === null ? null : percentValue(addExact(exactFraction(1n),
        multiplyExact(exactFraction(-1n), divideExact(monthlyGross, multiplyExact(exactFraction(listAnnualCents), charges))),
      ));
      return {
        months, monthly, annual,
        differenceCents: annual === null ? null : annual.grossCents - monthly.grossCents,
        netDifferenceCents: annual?.fee && monthly.fee ? annual.fee.netCents - monthly.fee.netCents : null,
        annualVsMonthly: direction === null ? null : direction < 0 ? "less" : direction > 0 ? "more" : "same",
        breakEvenDiscount,
      };
    });
    comparison = {
      monthlyChurnHundredths, annualRenewalHundredths, horizons,
      runningTotals: monthlyTotals.map((gross, index) => {
        const annual = annualTotals[Math.floor(index / 12)];
        return { month: index + 1, monthlyCents: roundExact(gross), annualCents: annual === null ? null : roundExact(annual) };
      }),
    };
  }
  return { status: "valid", errors: {}, values: { currency, offerMode, offer, upfront, fee, comparison } };
}
