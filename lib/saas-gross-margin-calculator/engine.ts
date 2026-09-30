export const SAAS_GROSS_MARGIN_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;
export const SAAS_GROSS_MARGIN_SCOPES = ["company", "subscription", "named"] as const;

export type SaaSGrossMarginCurrency = (typeof SAAS_GROSS_MARGIN_CURRENCIES)[number];
export type SaaSGrossMarginScope = (typeof SAAS_GROSS_MARGIN_SCOPES)[number];

export const SAAS_GROSS_MARGIN_COST_CATEGORIES = [
  { field: "hostingInfrastructure", label: "Hosting and infrastructure" },
  { field: "thirdPartyDelivery", label: "Third-party APIs and delivery software" },
  { field: "paymentProcessing", label: "Payment processing" },
  { field: "supportPeople", label: "Support and service delivery people" },
  { field: "otherCostOfRevenue", label: "Other cost of revenue" },
] as const;

export type SaaSGrossMarginCostField = (typeof SAAS_GROSS_MARGIN_COST_CATEGORIES)[number]["field"];
export type SaaSGrossMarginField =
  | "reportingPeriod"
  | "revenueScope"
  | "scopeName"
  | "currency"
  | "recognizedRevenue"
  | SaaSGrossMarginCostField;

export type SaaSGrossMarginInput = {
  reportingPeriod: string;
  revenueScope: SaaSGrossMarginScope;
  scopeName: string;
  currency: SaaSGrossMarginCurrency;
  recognizedRevenue: string;
} & Record<SaaSGrossMarginCostField, string>;

export type SaaSGrossMarginValues = {
  reportingPeriod: string;
  revenueScope: SaaSGrossMarginScope;
  scopeName?: string;
  currency: SaaSGrossMarginCurrency;
  recognizedRevenueCents: bigint;
  costsCents: Record<SaaSGrossMarginCostField, bigint>;
  costOfRevenueCents: bigint;
  grossProfitCents: bigint;
  /** Integer hundredths of a percentage point, rounded half up in magnitude. Null means revenue is zero. */
  grossMarginHundredths: bigint | null;
  /** True when a nonzero margin rounds to 0.00%; its sign is preserved in the display. */
  grossMarginRoundedToZero: boolean;
};

export type SaaSGrossMarginCalculation =
  | { status: "valid"; values: SaaSGrossMarginValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: Partial<Record<SaaSGrossMarginField, string>> };

export const SAAS_GROSS_MARGIN_MAX_CENTS = 100_000_000_000_000n;

const labels: Record<SaaSGrossMarginField, string> = {
  reportingPeriod: "Reporting period",
  revenueScope: "Revenue scope",
  scopeName: "Product or service name",
  currency: "Currency",
  recognizedRevenue: "Recognized revenue",
  hostingInfrastructure: "Hosting and infrastructure",
  thirdPartyDelivery: "Third-party APIs and delivery software",
  paymentProcessing: "Payment processing",
  supportPeople: "Support and service delivery people",
  otherCostOfRevenue: "Other cost of revenue",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function fail(
  errors: Partial<Record<SaaSGrossMarginField, string>>,
  field: SaaSGrossMarginField,
  message: string,
) {
  if (!errors[field]) errors[field] = message;
}

function parseText(
  value: unknown,
  field: "reportingPeriod" | "scopeName",
  errors: Partial<Record<SaaSGrossMarginField, string>>,
): string | null {
  if (typeof value !== "string" || value.trim() === "") {
    fail(errors, field, `Enter a ${field === "reportingPeriod" ? "reporting period" : "product or service name"}.`);
    return null;
  }

  const trimmed = value.trim();
  const length = Array.from(trimmed).length;
  if (/[\u0000-\u001f\u007f-\u009f]/u.test(trimmed) || length > 80) {
    fail(errors, field, "Use 1 to 80 characters without control characters.");
    return null;
  }
  return trimmed;
}

function parseAmount(
  value: unknown,
  field: "recognizedRevenue" | SaaSGrossMarginCostField,
  errors: Partial<Record<SaaSGrossMarginField, string>>,
): bigint | null {
  if (typeof value !== "string") {
    fail(errors, field, `Enter ${labels[field].toLowerCase()} as digits with up to two decimal places.`);
    return null;
  }

  const raw = value.trim();
  if (!raw) {
    const message = field === "recognizedRevenue"
      ? "Enter recognized revenue. Use 0 when no revenue was recognized."
      : `Enter an amount for ${labels[field].toLowerCase()}. Use 0 when a cost does not apply.`;
    fail(errors, field, message);
    return null;
  }
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(raw);
  if (!match) {
    fail(errors, field, "Use digits with up to two decimal places. Do not use signs, commas, or currency symbols.");
    return null;
  }

  const whole = BigInt(match[1]);
  const fraction = BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  const cents = whole * 100n + fraction;
  if (cents > SAAS_GROSS_MARGIN_MAX_CENTS) {
    fail(errors, field, "Enter an amount from 0 to 1,000,000,000,000.00.");
    return null;
  }
  return cents;
}

function roundPercentHundredths(profitCents: bigint, revenueCents: bigint): bigint {
  const negative = profitCents < 0n;
  const magnitude = negative ? -profitCents : profitCents;
  const numerator = magnitude * 10_000n;
  let rounded = numerator / revenueCents;
  const remainder = numerator % revenueCents;
  if (remainder * 2n >= revenueCents) rounded += 1n;
  return negative ? -rounded : rounded;
}

export function calculateSaasGrossMargin(inputValue: unknown): SaaSGrossMarginCalculation {
  const input = asRecord(inputValue);
  const errors: Partial<Record<SaaSGrossMarginField, string>> = {};
  const reportingPeriod = parseText(input.reportingPeriod, "reportingPeriod", errors);

  let revenueScope: SaaSGrossMarginScope = "company";
  if (typeof input.revenueScope !== "string" || !SAAS_GROSS_MARGIN_SCOPES.includes(input.revenueScope as SaaSGrossMarginScope)) {
    fail(errors, "revenueScope", "Choose Entire company, Subscription service, or Named product or service.");
  } else {
    revenueScope = input.revenueScope as SaaSGrossMarginScope;
  }

  const scopeName = revenueScope === "named" ? parseText(input.scopeName, "scopeName", errors) : undefined;

  let currency: SaaSGrossMarginCurrency = "USD";
  if (typeof input.currency !== "string" || !SAAS_GROSS_MARGIN_CURRENCIES.includes(input.currency as SaaSGrossMarginCurrency)) {
    fail(errors, "currency", "Choose USD, EUR, GBP, INR, CAD, or AUD.");
  } else {
    currency = input.currency as SaaSGrossMarginCurrency;
  }

  const recognizedRevenueCents = parseAmount(input.recognizedRevenue, "recognizedRevenue", errors);
  const costsCents = {} as Record<SaaSGrossMarginCostField, bigint>;
  for (const category of SAAS_GROSS_MARGIN_COST_CATEGORIES) {
    const amount = parseAmount(input[category.field], category.field, errors);
    if (amount !== null) costsCents[category.field] = amount;
  }

  if (Object.keys(errors).length > 0
    || reportingPeriod === null
    || (revenueScope === "named" && scopeName === null)
    || recognizedRevenueCents === null
    || SAAS_GROSS_MARGIN_COST_CATEGORIES.some(({ field }) => costsCents[field] === undefined)) {
    return { status: "invalid", values: null, errors };
  }

  const costOfRevenueCents = SAAS_GROSS_MARGIN_COST_CATEGORIES.reduce(
    (sum, category) => sum + costsCents[category.field],
    0n,
  );
  const grossProfitCents = recognizedRevenueCents - costOfRevenueCents;
  const grossMarginHundredths = recognizedRevenueCents === 0n
    ? null
    : roundPercentHundredths(grossProfitCents, recognizedRevenueCents);

  return {
    status: "valid",
    errors: {},
    values: {
      reportingPeriod,
      revenueScope,
      ...(revenueScope === "named" ? { scopeName: scopeName as string } : {}),
      currency,
      recognizedRevenueCents,
      costsCents,
      costOfRevenueCents,
      grossProfitCents,
      grossMarginHundredths,
      grossMarginRoundedToZero: grossMarginHundredths === 0n && grossProfitCents !== 0n,
    },
  };
}
