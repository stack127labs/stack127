export const BURN_MULTIPLE_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export type BurnMultipleCurrency = (typeof BURN_MULTIPLE_CURRENCIES)[number];

export type BurnMultipleField = "period" | "currency" | "netCashBurn" | "netNewArr";

export type BurnMultipleValidationErrors = Partial<Record<BurnMultipleField, string>>;

export type BurnMultipleOutcome =
  | { kind: "multiple"; ratioHundredths: bigint; displayValue: string }
  | { kind: "cash-generating"; arrChange: "positive" | "zero" | "negative" }
  | { kind: "undefined" }
  | { kind: "unavailable" };

export type BurnMultipleValues = {
  period: string;
  currency: BurnMultipleCurrency;
  netCashBurnCents: number;
  netNewArrCents: number;
  outcome: BurnMultipleOutcome;
};

export type BurnMultipleCalculation =
  | { status: "valid"; values: BurnMultipleValues }
  | { status: "invalid"; errors: BurnMultipleValidationErrors };

const MAX_AMOUNT_CENTS = 100_000_000_000_000;
const MAX_WHOLE_DIGITS = 13;
const RANGE_ERROR = "Enter an amount from -1,000,000,000,000.00 to 1,000,000,000,000.00.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parsePeriod(value: unknown): { period: string | null; error?: string } {
  if (typeof value !== "string") return { period: null, error: "Enter a reporting period." };
  if (/[\u0000-\u001f\u007f-\u009f]/u.test(value)) {
    return { period: null, error: "Remove control characters from the reporting period." };
  }

  const period = value.trim();
  const length = Array.from(period).length;
  if (length === 0) return { period: null, error: "Enter a reporting period." };
  if (length > 80) return { period: null, error: "Use a reporting period from 1 to 80 characters." };
  return { period };
}

function parseAmountCents(
  value: unknown,
  label: "net cash burn" | "net new ARR",
): { cents: number | null; error?: string } {
  const requiredError = `Enter ${label}.`;
  if (typeof value !== "string") return { cents: null, error: requiredError };

  const raw = value.trim();
  if (!raw) return { cents: null, error: requiredError };

  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(raw);
  if (!match) {
    if (/^-?\d+\.\d+$/.test(raw)) {
      return { cents: null, error: "Use no more than two decimal places." };
    }
    return {
      cents: null,
      error: "Use digits with an optional leading minus and up to two decimal places, without commas or a currency symbol.",
    };
  }

  const [, sign, whole, fraction = ""] = match;
  const normalizedWhole = whole.replace(/^0+(?=\d)/u, "");
  if (normalizedWhole.length > MAX_WHOLE_DIGITS) return { cents: null, error: RANGE_ERROR };

  const magnitude = BigInt(normalizedWhole) * 100n + BigInt(fraction.padEnd(2, "0") || "0");
  if (magnitude > BigInt(MAX_AMOUNT_CENTS)) return { cents: null, error: RANGE_ERROR };

  const signed = sign === "-" && magnitude !== 0n ? -magnitude : magnitude;
  return { cents: Number(signed) };
}

function groupedInteger(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
}

function roundedRatioDisplay(ratioHundredths: bigint, burnCents: number): string {
  if (ratioHundredths === 0n) return burnCents === 0 ? "0.00×" : "<0.01×";
  const whole = groupedInteger(ratioHundredths / 100n);
  const fraction = (ratioHundredths % 100n).toString().padStart(2, "0");
  return `${whole}.${fraction}×`;
}

/** Validates one reporting snapshot and calculates its burn multiple with exact cent arithmetic. */
export function calculateBurnMultiple(inputValue: unknown): BurnMultipleCalculation {
  const input = isRecord(inputValue) ? inputValue : {};
  const errors: BurnMultipleValidationErrors = {};

  const parsedPeriod = parsePeriod(input.period);
  if (parsedPeriod.error) errors.period = parsedPeriod.error;

  const currencyValue = typeof input.currency === "string" ? input.currency.trim() : "";
  if (!BURN_MULTIPLE_CURRENCIES.includes(currencyValue as BurnMultipleCurrency)) {
    errors.currency = "Choose USD, EUR, GBP, INR, CAD, or AUD.";
  }

  const parsedBurn = parseAmountCents(input.netCashBurn, "net cash burn");
  if (parsedBurn.error) errors.netCashBurn = parsedBurn.error;

  const parsedArr = parseAmountCents(input.netNewArr, "net new ARR");
  if (parsedArr.error) errors.netNewArr = parsedArr.error;

  if (Object.keys(errors).length) return { status: "invalid", errors };

  const period = parsedPeriod.period as string;
  const currency = currencyValue as BurnMultipleCurrency;
  const netCashBurnCents = parsedBurn.cents as number;
  const netNewArrCents = parsedArr.cents as number;

  let outcome: BurnMultipleOutcome;
  if (netCashBurnCents < 0) {
    outcome = {
      kind: "cash-generating",
      arrChange: netNewArrCents > 0 ? "positive" : netNewArrCents === 0 ? "zero" : "negative",
    };
  } else if (netNewArrCents === 0) {
    outcome = { kind: "undefined" };
  } else if (netNewArrCents < 0) {
    outcome = { kind: "unavailable" };
  } else {
    const burn = BigInt(netCashBurnCents);
    const arrChange = BigInt(netNewArrCents);
    const ratioHundredths = (burn * 100n + arrChange / 2n) / arrChange;
    outcome = {
      kind: "multiple",
      ratioHundredths,
      displayValue: roundedRatioDisplay(ratioHundredths, netCashBurnCents),
    };
  }

  return {
    status: "valid",
    values: {
      period,
      currency,
      netCashBurnCents,
      netNewArrCents,
      outcome,
    },
  };
}
