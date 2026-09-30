export const MRR_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export type MrrCurrency = (typeof MRR_CURRENCIES)[number];

export const BILLING_INTERVALS = [
  { value: "monthly", label: "Monthly", months: 1 },
  { value: "quarterly", label: "Quarterly", months: 3 },
  { value: "semiannual", label: "Every six months", months: 6 },
  { value: "annual", label: "Annually", months: 12 },
] as const;

export type MrrBillingInterval = (typeof BILLING_INTERVALS)[number]["value"];
export type MrrPlanField = "name" | "subscriptions" | "price" | "interval";
export type MrrPlanFieldErrors = Partial<Record<MrrPlanField, string>>;

export type MrrValidationErrors = {
  currency?: string;
  plans?: string;
  rows: MrrPlanFieldErrors[];
};

export type MrrPlanResult = {
  rowNumber: number;
  name: string;
  subscriptions: number;
  priceCents: number;
  interval: MrrBillingInterval;
  intervalLabel: string;
  /** Exact monthly contribution in twelfths of a cent. */
  mrrTwelfthCents: number;
  /** Half-up rounded monthly contribution in cents. */
  mrrRoundedCents: number;
};

export type MrrValues = {
  currency: MrrCurrency;
  rows: MrrPlanResult[];
  /** Exact monthly total in twelfths of a cent. */
  totalMrrTwelfthCents: number;
  /** Half-up rounded monthly total in cents. */
  totalMrrRoundedCents: number;
  /** Exact annualized run rate in cents. */
  annualizedArrCents: number;
  roundingDifference: boolean;
};

export type MrrCalculation =
  | { status: "valid"; values: MrrValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: MrrValidationErrors };

const maximumPlans = 20;
const maximumSubscriptions = 1_000_000;
const maximumPriceCents = 10_000_000;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function roundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((numerator + denominator / 2) / denominator);
}

function parseName(value: unknown): { value: string | null; error?: string } {
  if (value === undefined) return { value: "" };
  if (typeof value !== "string") return { value: null, error: "Enter a plan name as text." };

  const name = value.trim();
  if (Array.from(name).length > 80) {
    return { value: null, error: "Use a plan name with 80 characters or fewer." };
  }
  return { value: name };
}

function parseSubscriptions(value: unknown): { value: number | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Enter a whole number of active subscriptions." };
  }

  const raw = value.trim();
  if (!/^\d+$/.test(raw)) {
    return { value: null, error: "Use a whole number from 0 to 1,000,000." };
  }

  const count = Number(raw);
  if (!Number.isSafeInteger(count) || count > maximumSubscriptions) {
    return { value: null, error: "Use a whole number from 0 to 1,000,000." };
  }
  return { value: count };
}

function parsePrice(value: unknown): { value: number | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Enter a price from 0 to 100,000 with up to two decimal places." };
  }

  const raw = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    return { value: null, error: "Use digits with up to two decimal places, from 0 to 100,000." };
  }

  const [whole, fraction = ""] = raw.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0") || "0");
  if (!Number.isSafeInteger(cents) || cents > maximumPriceCents) {
    return { value: null, error: "Enter a price from 0 to 100,000.00." };
  }
  return { value: cents };
}

function parseInterval(value: unknown): { value: (typeof BILLING_INTERVALS)[number] | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Choose a billing interval." };
  }
  const interval = BILLING_INTERVALS.find((item) => item.value === value.trim());
  return interval
    ? { value: interval }
    : { value: null, error: "Choose monthly, quarterly, every six months, or annually." };
}

export function calculateMrr(inputValue: unknown): MrrCalculation {
  const input = asRecord(inputValue);
  const errors: MrrValidationErrors = { rows: [] };
  if (!input) {
    return {
      status: "invalid",
      values: null,
      errors: {
        currency: "Choose USD, EUR, GBP, INR, CAD, or AUD.",
        plans: "Add at least one plan.",
        rows: [],
      },
    };
  }

  const currencyValue = typeof input.currency === "string" ? input.currency.trim() : "";
  if (!MRR_CURRENCIES.includes(currencyValue as MrrCurrency)) {
    errors.currency = "Choose USD, EUR, GBP, INR, CAD, or AUD.";
  }

  if (!Array.isArray(input.plans) || input.plans.length === 0) {
    errors.plans = "Add at least one plan.";
    return { status: "invalid", values: null, errors };
  }
  if (input.plans.length > maximumPlans) {
    errors.plans = "Use no more than 20 plans.";
    return { status: "invalid", values: null, errors };
  }

  const rows: MrrPlanResult[] = [];
  let totalMrrTwelfthCents = 0;

  input.plans.forEach((rawPlan: unknown, index: number) => {
    const plan = asRecord(rawPlan) ?? {};
    const rowErrors: MrrPlanFieldErrors = {};
    const name = parseName(plan.name);
    const subscriptions = parseSubscriptions(plan.subscriptions);
    const price = parsePrice(plan.price);
    const interval = parseInterval(plan.interval);

    if (name.error) rowErrors.name = name.error;
    if (subscriptions.error) rowErrors.subscriptions = subscriptions.error;
    if (price.error) rowErrors.price = price.error;
    if (interval.error) rowErrors.interval = interval.error;
    errors.rows[index] = rowErrors;

    if (name.value === null || subscriptions.value === null || price.value === null || interval.value === null) {
      return;
    }

    const mrrTwelfthCents = subscriptions.value
      * price.value
      * (12 / interval.value.months);
    totalMrrTwelfthCents += mrrTwelfthCents;
    rows.push({
      rowNumber: index + 1,
      name: name.value || "Plan " + (index + 1),
      subscriptions: subscriptions.value,
      priceCents: price.value,
      interval: interval.value.value,
      intervalLabel: interval.value.label,
      mrrTwelfthCents,
      mrrRoundedCents: roundHalfUp(mrrTwelfthCents, 12),
    });
  });

  if (errors.currency || errors.rows.some((row) => Object.keys(row).length > 0)) {
    return { status: "invalid", values: null, errors };
  }

  const totalMrrRoundedCents = roundHalfUp(totalMrrTwelfthCents, 12);
  const roundedRowsCents = rows.reduce((sum, row) => sum + row.mrrRoundedCents, 0);

  return {
    status: "valid",
    errors: {},
    values: {
      currency: currencyValue as MrrCurrency,
      rows,
      totalMrrTwelfthCents,
      totalMrrRoundedCents,
      annualizedArrCents: totalMrrTwelfthCents,
      roundingDifference: roundedRowsCents !== totalMrrRoundedCents,
    },
  };
}
