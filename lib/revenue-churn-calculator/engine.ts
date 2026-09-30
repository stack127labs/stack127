export const REVENUE_CHURN_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export type RevenueChurnCurrency = (typeof REVENUE_CHURN_CURRENCIES)[number];
export type RevenueChurnAmountField = "openingMrr" | "canceledOpeningMrr" | "reducedOpeningMrr";
export type RevenueChurnField = "month" | "currency" | RevenueChurnAmountField;

export type RevenueChurnInput = {
  month: unknown;
  currency: unknown;
  openingMrr: unknown;
  canceledOpeningMrr: unknown;
  reducedOpeningMrr: unknown;
};

export type RevenueChurnErrors = Partial<Record<RevenueChurnField, string>>;

export type RevenueChurnValues = {
  month: string;
  currency: RevenueChurnCurrency;
  openingCents: number;
  canceledCents: number;
  reducedCents: number;
  totalLostCents: number;
  stillPresentCents: number;
  percentage: string | null;
};

export type RevenueChurnCalculation =
  | { status: "valid"; values: RevenueChurnValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: RevenueChurnErrors };

const MAX_AMOUNT_CENTS = 100_000_000_000_000n;
const AMOUNT_FIELDS: RevenueChurnAmountField[] = [
  "openingMrr",
  "canceledOpeningMrr",
  "reducedOpeningMrr",
];

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function parseMonth(value: unknown): { value: string | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Enter the reporting month as YYYY-MM." };
  }

  const month = value.trim();
  const match = /^([0-9]{4})-([0-9]{2})$/.exec(month);
  if (!match) {
    return { value: null, error: "Use YYYY-MM, from 2000-01 to 2100-12." };
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  if (year < 2000 || year > 2100 || monthNumber < 1 || monthNumber > 12) {
    return { value: null, error: "Use a month from 2000-01 to 2100-12." };
  }
  return { value: month };
}

function parseCurrency(value: unknown): { value: RevenueChurnCurrency | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Choose USD, EUR, GBP, INR, CAD, or AUD." };
  }

  const currency = value.trim();
  return REVENUE_CHURN_CURRENCIES.includes(currency as RevenueChurnCurrency)
    ? { value: currency as RevenueChurnCurrency }
    : { value: null, error: "Choose USD, EUR, GBP, INR, CAD, or AUD." };
}

function parseAmount(value: unknown): { value: number | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Enter an amount with up to two decimal places." };
  }

  const raw = value.trim();
  if (!raw) {
    return { value: null, error: "Enter an amount. Use 0 when no loss occurred." };
  }
  if (!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(raw)) {
    return { value: null, error: "Use digits with up to two decimal places, without commas or currency symbols." };
  }

  const [whole, fraction = ""] = raw.split(".");
  const normalizedWhole = whole.replace(/^0+/, "") || "0";
  if (normalizedWhole.length > 13) {
    return { value: null, error: "Enter an amount from 0 to 1,000,000,000,000.00." };
  }

  const cents = BigInt(normalizedWhole) * 100n + BigInt(fraction.padEnd(2, "0") || "0");
  if (cents > MAX_AMOUNT_CENTS) {
    return { value: null, error: "Enter an amount from 0 to 1,000,000,000,000.00." };
  }
  return { value: Number(cents) };
}

/** Formats a nonnegative, exact integer-cent ratio as a percent. */
export function formatRevenueChurnPercentage(lostCents: number, openingCents: number): string | null {
  if (!Number.isSafeInteger(lostCents) || lostCents < 0
    || !Number.isSafeInteger(openingCents) || openingCents < 0) {
    throw new RangeError("Revenue churn amounts must be nonnegative safe integer cents.");
  }
  if (openingCents === 0) return null;
  if (lostCents === 0) return "0.00%";

  const lost = BigInt(lostCents);
  const opening = BigInt(openingCents);
  const numerator = lost * 10_000n;
  if (numerator < opening) return "<0.01%";

  const roundedHundredths = (numerator * 2n + opening) / (opening * 2n);
  const whole = roundedHundredths / 100n;
  const fraction = String(roundedHundredths % 100n).padStart(2, "0");
  const groupedWhole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(whole);
  return groupedWhole + "." + fraction + "%";
}

/** Formats safe integer cents without converting the fractional part through floating point. */
export function formatRevenueMoneyCents(cents: number, currency: RevenueChurnCurrency): string {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new RangeError("Money must be nonnegative safe integer cents.");
  }
  const whole = Math.trunc(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.formatToParts(whole)
    .map((part) => part.type === "fraction" ? fraction : part.value)
    .join("");
}

export function calculateRevenueChurn(inputValue: unknown): RevenueChurnCalculation {
  const input = asRecord(inputValue);
  const errors: RevenueChurnErrors = {};
  const month = parseMonth(input.month);
  const currency = parseCurrency(input.currency);
  if (month.error) errors.month = month.error;
  if (currency.error) errors.currency = currency.error;

  const amounts: Partial<Record<RevenueChurnAmountField, number>> = {};
  for (const field of AMOUNT_FIELDS) {
    const parsed = parseAmount(input[field]);
    if (parsed.error) errors[field] = parsed.error;
    else amounts[field] = parsed.value as number;
  }

  const amountsAreValid = AMOUNT_FIELDS.every((field) => amounts[field] !== undefined);
  if (amountsAreValid) {
    const openingCents = amounts.openingMrr as number;
    const canceledCents = amounts.canceledOpeningMrr as number;
    const reducedCents = amounts.reducedOpeningMrr as number;
    const totalLostCents = BigInt(canceledCents) + BigInt(reducedCents);

    if (openingCents === 0 && totalLostCents > 0n) {
      const firstPositiveLoss = canceledCents > 0 ? "canceledOpeningMrr" : "reducedOpeningMrr";
      errors[firstPositiveLoss] = "Opening MRR is zero. Enter 0 for every loss amount.";
    } else if (totalLostCents > BigInt(openingCents)) {
      errors.reducedOpeningMrr = "Canceled and reduced opening MRR cannot exceed opening MRR when each opening dollar is counted once.";
    }
  }

  if (Object.keys(errors).length > 0 || !month.value || !currency.value || !amountsAreValid) {
    return { status: "invalid", values: null, errors };
  }

  const openingCents = amounts.openingMrr as number;
  const canceledCents = amounts.canceledOpeningMrr as number;
  const reducedCents = amounts.reducedOpeningMrr as number;
  const totalLostCents = canceledCents + reducedCents;
  const stillPresentCents = openingCents - totalLostCents;

  return {
    status: "valid",
    errors: {},
    values: {
      month: month.value,
      currency: currency.value,
      openingCents,
      canceledCents,
      reducedCents,
      totalLostCents,
      stillPresentCents,
      percentage: formatRevenueChurnPercentage(totalLostCents, openingCents),
    },
  };
}
