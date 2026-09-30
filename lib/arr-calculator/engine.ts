export const ARR_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export type ArrCurrency = (typeof ARR_CURRENCIES)[number];

export type ArrValues = {
  currency: ArrCurrency;
  mrrCents: number;
  annualizedArrCents: number;
};

export type ArrValidationErrors = {
  mrr?: string;
  currency?: string;
};

export type ArrCalculation =
  | { status: "valid"; values: ArrValues }
  | { status: "invalid"; errors: ArrValidationErrors };

const MAX_MRR_CENTS = 100_000_000_000_000;
const MAX_MRR_WHOLE_DIGITS = 13;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseMrrCents(value: unknown): { cents: number | null; error?: string } {
  if (typeof value !== "string") {
    return { cents: null, error: "Enter a monthly recurring revenue amount." };
  }

  const raw = value.trim();
  if (!raw) return { cents: null, error: "Enter a monthly recurring revenue amount." };

  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    if (/^\d+\.\d{3,}$/.test(raw)) {
      return { cents: null, error: "Use no more than two decimal places." };
    }
    return {
      cents: null,
      error: "Use digits with up to two decimal places, without a sign, comma, or currency symbol.",
    };
  }

  const [whole, fraction = ""] = raw.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
  if (normalizedWhole.length > MAX_MRR_WHOLE_DIGITS) {
    return { cents: null, error: "Enter an amount from 0 to 1,000,000,000,000.00." };
  }

  const cents = Number(
    BigInt(normalizedWhole) * 100n + BigInt(fraction.padEnd(2, "0") || "0"),
  );
  if (!Number.isSafeInteger(cents) || cents > MAX_MRR_CENTS) {
    return { cents: null, error: "Enter an amount from 0 to 1,000,000,000,000.00." };
  }

  return { cents };
}

/** Converts one already-normalized monthly recurring revenue amount to its annualized run rate. */
export function calculateArr(inputValue: unknown): ArrCalculation {
  const input = isRecord(inputValue) ? inputValue : {};
  const errors: ArrValidationErrors = {};

  const parsedMrr = parseMrrCents(input.mrr);
  if (parsedMrr.error) errors.mrr = parsedMrr.error;

  const currency = typeof input.currency === "string" ? input.currency.trim() : "";
  if (!ARR_CURRENCIES.includes(currency as ArrCurrency)) {
    errors.currency = "Choose USD, EUR, GBP, INR, CAD, or AUD.";
  }

  if (Object.keys(errors).length) return { status: "invalid", errors };

  const mrrCents = parsedMrr.cents as number;
  const annualizedArrCents = mrrCents * 12;
  if (!Number.isSafeInteger(annualizedArrCents)) {
    return {
      status: "invalid",
      errors: { mrr: "Enter an amount from 0 to 1,000,000,000,000.00." },
    };
  }

  return {
    status: "valid",
    values: {
      currency: currency as ArrCurrency,
      mrrCents,
      annualizedArrCents,
    },
  };
}
