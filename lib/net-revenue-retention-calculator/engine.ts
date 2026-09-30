export const NRR_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export type NrrCurrency = (typeof NRR_CURRENCIES)[number];
export type NrrAmountField =
  | "openingMrr"
  | "expansionMrr"
  | "reactivationMrr"
  | "contractionMrr"
  | "churnedMrr";
export type NrrField = "month" | "currency" | NrrAmountField;

export type NrrInput = {
  month: unknown;
  currency: unknown;
  openingMrr: unknown;
  expansionMrr: unknown;
  reactivationMrr: unknown;
  contractionMrr: unknown;
  churnedMrr: unknown;
};

export type NrrErrors = Partial<Record<NrrField, string>>;

export type NrrValues = {
  month: string;
  currency: NrrCurrency;
  openingCents: number;
  expansionCents: number;
  reactivationCents: number;
  contractionCents: number;
  churnedCents: number;
  endingCents: number;
  percentage: string | null;
};

export type NrrCalculation =
  | { status: "valid"; values: NrrValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: NrrErrors };

const MAX_AMOUNT_CENTS = 100_000_000_000_000n;
const AMOUNT_FIELDS: NrrAmountField[] = [
  "openingMrr",
  "expansionMrr",
  "reactivationMrr",
  "contractionMrr",
  "churnedMrr",
];
const MOVEMENT_FIELDS: NrrAmountField[] = [
  "expansionMrr",
  "reactivationMrr",
  "contractionMrr",
  "churnedMrr",
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

function parseCurrency(value: unknown): { value: NrrCurrency | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Choose USD, EUR, GBP, INR, CAD, or AUD." };
  }

  const currency = value.trim();
  return NRR_CURRENCIES.includes(currency as NrrCurrency)
    ? { value: currency as NrrCurrency }
    : { value: null, error: "Choose USD, EUR, GBP, INR, CAD, or AUD." };
}

function parseAmount(value: unknown): { value: number | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Enter an amount with up to two decimal places." };
  }

  const raw = value.trim();
  if (!raw) {
    return { value: null, error: "Enter an amount. Use 0 when no movement occurred." };
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

/**
 * Formats an exact integer-cent ratio as a percent. A positive rate below
 * 0.01% is shown explicitly so it cannot look like a zero rate.
 */
export function formatNrrPercentage(endingCents: number, openingCents: number): string | null {
  if (!Number.isSafeInteger(endingCents) || endingCents < 0
    || !Number.isSafeInteger(openingCents) || openingCents < 0) {
    throw new RangeError("NRR amounts must be nonnegative safe integer cents.");
  }
  if (openingCents === 0) return null;
  if (endingCents === 0) return "0.00%";

  const ending = BigInt(endingCents);
  const opening = BigInt(openingCents);
  const numerator = ending * 10_000n;
  if (numerator < opening) return "<0.01%";

  const roundedHundredths = (numerator * 2n + opening) / (opening * 2n);
  const whole = roundedHundredths / 100n;
  const fraction = String(roundedHundredths % 100n).padStart(2, "0");
  const groupedWhole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(whole);
  return groupedWhole + "." + fraction + "%";
}

export function formatMoneyCents(cents: number, currency: NrrCurrency): string {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError("Money must be a safe integer number of cents.");
  }
  const absoluteCents = Math.abs(cents);
  const whole = Math.trunc(absoluteCents / 100);
  const fraction = String(absoluteCents % 100).padStart(2, "0");
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

export function formatSignedMoneyCents(cents: number, currency: NrrCurrency): string {
  if (cents > 0) return "+" + formatMoneyCents(cents, currency);
  if (cents < 0) return "-" + formatMoneyCents(cents, currency);
  return formatMoneyCents(0, currency);
}

export function calculateNetRevenueRetention(inputValue: unknown): NrrCalculation {
  const input = asRecord(inputValue);
  const errors: NrrErrors = {};
  const month = parseMonth(input.month);
  const currency = parseCurrency(input.currency);
  if (month.error) errors.month = month.error;
  if (currency.error) errors.currency = currency.error;

  const amounts: Partial<Record<NrrAmountField, number>> = {};
  for (const field of AMOUNT_FIELDS) {
    const parsed = parseAmount(input[field]);
    if (parsed.error) errors[field] = parsed.error;
    else amounts[field] = parsed.value as number;
  }

  const amountsAreValid = AMOUNT_FIELDS.every((field) => amounts[field] !== undefined);
  if (amountsAreValid) {
    const openingCents = amounts.openingMrr as number;
    const movements = MOVEMENT_FIELDS.map((field) => [field, amounts[field] as number] as const);

    if (openingCents === 0) {
      const firstMovement = movements.find(([, cents]) => cents > 0);
      if (firstMovement) {
        errors[firstMovement[0]] = "Opening cohort MRR is zero. Enter 0 for every movement.";
      }
    }

    if ((amounts.reactivationMrr as number) > 0 && (amounts.churnedMrr as number) === 0) {
      errors.reactivationMrr ??= "Reactivation requires a recorded churn event from this opening cohort.";
    }

    const endingCents = openingCents
      + (amounts.expansionMrr as number)
      + (amounts.reactivationMrr as number)
      - (amounts.contractionMrr as number)
      - (amounts.churnedMrr as number);
    if (endingCents < 0) {
      errors.churnedMrr ??= "These cohort movements would make ending MRR negative. Check contraction and churn.";
    }
  }

  if (Object.keys(errors).length > 0 || !month.value || !currency.value || !amountsAreValid) {
    return { status: "invalid", values: null, errors };
  }

  const openingCents = amounts.openingMrr as number;
  const expansionCents = amounts.expansionMrr as number;
  const reactivationCents = amounts.reactivationMrr as number;
  const contractionCents = amounts.contractionMrr as number;
  const churnedCents = amounts.churnedMrr as number;
  const endingCents = openingCents
    + expansionCents
    + reactivationCents
    - contractionCents
    - churnedCents;

  return {
    status: "valid",
    errors: {},
    values: {
      month: month.value,
      currency: currency.value,
      openingCents,
      expansionCents,
      reactivationCents,
      contractionCents,
      churnedCents,
      endingCents,
      percentage: formatNrrPercentage(endingCents, openingCents),
    },
  };
}
