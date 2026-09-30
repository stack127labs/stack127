export const ARPU_ARPA_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export type ArpuArpaCurrency = (typeof ARPU_ARPA_CURRENCIES)[number];
export type ArpuArpaMode = "arpu" | "arpa";
export type ArpuArpaField = "mode" | "currency" | "period" | "revenue" | "count";
export type ArpuArpaValidationErrors = Partial<Record<ArpuArpaField, string>>;

export type ArpuArpaInput = {
  mode: unknown;
  currency: unknown;
  period: unknown;
  revenue: unknown;
  count: unknown;
};

export type ArpuArpaValues = {
  mode: ArpuArpaMode;
  currency: ArpuArpaCurrency;
  period: string;
  revenueCents: bigint;
  count: bigint;
};

export type ArpuArpaCalculation =
  | { status: "invalid"; values: null; errors: ArpuArpaValidationErrors }
  | {
      status: "valid";
      values: ArpuArpaValues & {
        /** Rounded half up to the nearest 0.0001 unit of the selected currency. */
        averageTenThousandths: bigint;
        /** The true nonzero average rounded to 0.0000 at the display precision. */
        nonzeroRoundedToZero: boolean;
      };
      errors: Record<string, never>;
    }
  | {
      status: "unavailable";
      values: ArpuArpaValues & { checkSourceConsistency: boolean };
      errors: Record<string, never>;
    };

const maximumMoneyCents = 100_000_000_000_000n;
const maximumPopulation = 1_000_000_000n;
const maximumPeriodCharacters = 80;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function parseMode(value: unknown): { value: ArpuArpaMode | null; error?: string } {
  return value === "arpu" || value === "arpa"
    ? { value }
    : { value: null, error: "Choose active users (ARPU) or paying accounts (ARPA)." };
}

function parseCurrency(value: unknown): { value: ArpuArpaCurrency | null; error?: string } {
  const currency = typeof value === "string" ? value.trim() : "";
  if (ARPU_ARPA_CURRENCIES.includes(currency as ArpuArpaCurrency)) {
    return { value: currency as ArpuArpaCurrency };
  }
  return { value: null, error: "Choose USD, EUR, GBP, INR, CAD, or AUD." };
}

function parsePeriod(value: unknown, mode: ArpuArpaMode): { value: string | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: mode === "arpa" ? "Enter a reporting month in YYYY-MM form." : "Enter a reporting period." };
  }

  const period = value.trim();
  if (!period) {
    return { value: null, error: mode === "arpa" ? "Enter a reporting month in YYYY-MM form." : "Enter a reporting period." };
  }
  if (Array.from(period).length > maximumPeriodCharacters) {
    return { value: null, error: "Use a period label with 80 characters or fewer." };
  }
  if (mode === "arpu") return { value: period };

  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return { value: null, error: "Use a real month in YYYY-MM form, from 1900-01 to 2100-12." };
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 1900 || year > 2100 || month < 1 || month > 12) {
    return { value: null, error: "Use a real month in YYYY-MM form, from 1900-01 to 2100-12." };
  }
  return { value: period };
}

function parseRevenue(value: unknown, mode: ArpuArpaMode): { value: bigint | null; error?: string } {
  const prompt = mode === "arpa"
    ? "Enter nonnegative monthly MRR with up to two decimal places."
    : "Enter net revenue with up to two decimal places.";
  if (typeof value !== "string") return { value: null, error: prompt };

  const raw = value.trim();
  if (!raw) return { value: null, error: prompt };
  if (mode === "arpa" && raw.startsWith("-")) {
    return { value: null, error: "Monthly MRR cannot be negative." };
  }
  if (/^[+-]?\d+\.\d{3,}$/.test(raw)) {
    return { value: null, error: "Use no more than two decimal places." };
  }

  const pattern = mode === "arpu" ? /^(-?)(\d+)(?:\.(\d{1,2}))?$/ : /^(\d+)(?:\.(\d{1,2}))?$/;
  const match = pattern.exec(raw);
  if (!match) {
    return {
      value: null,
      error: mode === "arpa"
        ? "Use digits with up to two decimal places and no commas or currency symbols."
        : "Use digits with an optional leading minus sign and up to two decimal places, with no commas or currency symbols.",
    };
  }

  const negative = mode === "arpu" && match[1] === "-";
  const whole = (mode === "arpu" ? match[2] : match[1]).replace(/^0+/, "") || "0";
  const fraction = (mode === "arpu" ? match[3] : match[2]) ?? "";
  if (whole.length > 13) {
    return { value: null, error: "Revenue must be from -1,000,000,000,000.00 to 1,000,000,000,000.00." };
  }

  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0") || "0");
  if (cents > maximumMoneyCents) {
    return { value: null, error: "Revenue must be from -1,000,000,000,000.00 to 1,000,000,000,000.00." };
  }
  return { value: negative ? -cents : cents };
}

function parseCount(value: unknown): { value: bigint | null; error?: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { value: null, error: "Enter a whole count from 0 to 1,000,000,000." };
  }

  const raw = value.trim();
  if (!/^\d+$/.test(raw)) {
    return { value: null, error: "Use a whole, non-negative count with digits only." };
  }

  const normalized = raw.replace(/^0+/, "") || "0";
  if (normalized.length > 10) {
    return { value: null, error: "Count must be from 0 to 1,000,000,000." };
  }
  const count = BigInt(normalized);
  if (count > maximumPopulation) {
    return { value: null, error: "Count must be from 0 to 1,000,000,000." };
  }
  return { value: count };
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

export function calculateArpuArpa(inputValue: unknown): ArpuArpaCalculation {
  const input = asRecord(inputValue);
  if (!input) {
    return {
      status: "invalid",
      values: null,
      errors: {
        mode: "Choose active users (ARPU) or paying accounts (ARPA).",
        currency: "Choose USD, EUR, GBP, INR, CAD, or AUD.",
        period: "Enter a reporting period.",
        revenue: "Enter net revenue with up to two decimal places.",
        count: "Enter a whole count from 0 to 1,000,000,000.",
      },
    };
  }

  const mode = parseMode(input.mode);
  const currency = parseCurrency(input.currency);
  const resolvedMode = mode.value ?? "arpu";
  const period = parsePeriod(input.period, resolvedMode);
  const revenue = parseRevenue(input.revenue, resolvedMode);
  const count = parseCount(input.count);
  const errors: ArpuArpaValidationErrors = {};

  if (mode.error) errors.mode = mode.error;
  if (currency.error) errors.currency = currency.error;
  if (period.error) errors.period = period.error;
  if (revenue.error) errors.revenue = revenue.error;
  if (count.error) errors.count = count.error;

  if (Object.keys(errors).length || !mode.value || !currency.value || period.value === null || revenue.value === null || count.value === null) {
    return { status: "invalid", values: null, errors };
  }

  const values: ArpuArpaValues = {
    mode: mode.value,
    currency: currency.value,
    period: period.value,
    revenueCents: revenue.value,
    count: count.value,
  };

  if (count.value === 0n) {
    return {
      status: "unavailable",
      values: {
        ...values,
        checkSourceConsistency: mode.value === "arpa" && revenue.value > 0n,
      },
      errors: {},
    };
  }

  const numerator = (revenue.value < 0n ? -revenue.value : revenue.value) * 100n;
  const roundedMagnitude = roundHalfUp(numerator, count.value);
  const averageTenThousandths = revenue.value < 0n ? -roundedMagnitude : roundedMagnitude;
  return {
    status: "valid",
    values: {
      ...values,
      averageTenThousandths,
      nonzeroRoundedToZero: revenue.value !== 0n && averageTenThousandths === 0n,
    },
    errors: {},
  };
}
