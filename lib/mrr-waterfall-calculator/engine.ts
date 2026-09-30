export const MRR_WATERFALL_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export type MrrWaterfallCurrency = (typeof MRR_WATERFALL_CURRENCIES)[number];
export type MrrWaterfallAmountField =
  | "startingMrr"
  | "newMrr"
  | "expansionMrr"
  | "reactivationMrr"
  | "contractionMrr"
  | "churnedMrr";
export type MrrWaterfallField = "month" | "currency" | MrrWaterfallAmountField;

export type MrrWaterfallInput = {
  month: unknown;
  currency: unknown;
  startingMrr: unknown;
  newMrr: unknown;
  expansionMrr: unknown;
  reactivationMrr: unknown;
  contractionMrr: unknown;
  churnedMrr: unknown;
};

export type MrrWaterfallErrors = Partial<Record<MrrWaterfallField, string>>;

export type MrrWaterfallStep = {
  id: Exclude<MrrWaterfallAmountField, "startingMrr">;
  label: string;
  signedCents: number;
  fromCents: number;
  toCents: number;
};

export type MrrWaterfallStage = {
  id: string;
  label: string;
  signedCents: number | null;
  balanceCents: number;
};

export type MrrWaterfallValues = {
  month: string;
  currency: MrrWaterfallCurrency;
  startingCents: number;
  netNewCents: number;
  endingCents: number;
  steps: MrrWaterfallStep[];
  stages: MrrWaterfallStage[];
};

export type MrrWaterfallCalculation =
  | { status: "valid"; values: MrrWaterfallValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: MrrWaterfallErrors };

const MAX_AMOUNT_CENTS = 100_000_000_000_000n;
const AMOUNT_FIELDS: MrrWaterfallAmountField[] = [
  "startingMrr",
  "newMrr",
  "expansionMrr",
  "reactivationMrr",
  "contractionMrr",
  "churnedMrr",
];

const AMOUNT_LABELS: Record<Exclude<MrrWaterfallAmountField, "startingMrr">, string> = {
  newMrr: "New MRR",
  expansionMrr: "Expansion MRR",
  reactivationMrr: "Reactivation MRR",
  contractionMrr: "Contraction MRR",
  churnedMrr: "Churned MRR",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function parseMonth(value: unknown): { value: string | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Enter the reporting month as YYYY-MM." };
  }

  const month = value.trim();
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) {
    return { value: null, error: "Use a reporting month in YYYY-MM format, from 2000-01 to 2100-12." };
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  if (year < 2000 || year > 2100 || monthNumber < 1 || monthNumber > 12) {
    return { value: null, error: "Use a reporting month from 2000-01 to 2100-12." };
  }
  return { value: month };
}

function parseCurrency(value: unknown): { value: MrrWaterfallCurrency | null; error?: string } {
  if (typeof value !== "string") {
    return { value: null, error: "Choose USD, EUR, GBP, INR, CAD, or AUD." };
  }

  const currency = value.trim();
  return MRR_WATERFALL_CURRENCIES.includes(currency as MrrWaterfallCurrency)
    ? { value: currency as MrrWaterfallCurrency }
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
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    return { value: null, error: "Use digits with up to two decimal places, without commas or currency symbols." };
  }

  const [whole, fraction = ""] = raw.split(".");
  const normalizedWhole = whole.replace(/^0+/, "") || "0";
  // The largest accepted whole amount has thirteen digits. This check also
  // avoids converting arbitrarily long pasted values to an imprecise Number.
  if (normalizedWhole.length > 13) {
    return { value: null, error: "Enter an amount from 0 to 1,000,000,000,000.00." };
  }

  const cents = BigInt(normalizedWhole) * 100n + BigInt(fraction.padEnd(2, "0") || "0");
  if (cents > MAX_AMOUNT_CENTS) {
    return { value: null, error: "Enter an amount from 0 to 1,000,000,000,000.00." };
  }
  return { value: Number(cents) };
}

export function calculateMrrWaterfall(inputValue: unknown): MrrWaterfallCalculation {
  const input = asRecord(inputValue) ?? {};
  const errors: MrrWaterfallErrors = {};
  const month = parseMonth(input.month);
  const currency = parseCurrency(input.currency);
  if (month.error) errors.month = month.error;
  if (currency.error) errors.currency = currency.error;

  const amounts: Partial<Record<MrrWaterfallAmountField, number>> = {};
  for (const field of AMOUNT_FIELDS) {
    const parsed = parseAmount(input[field]);
    if (parsed.error) errors[field] = parsed.error;
    else amounts[field] = parsed.value as number;
  }

  const amountsAreValid = AMOUNT_FIELDS.every((field) => amounts[field] !== undefined);
  if (amountsAreValid) {
    const impliedEnding = (amounts.startingMrr as number)
      + (amounts.newMrr as number)
      + (amounts.expansionMrr as number)
      + (amounts.reactivationMrr as number)
      - (amounts.contractionMrr as number)
      - (amounts.churnedMrr as number);
    if (impliedEnding < 0) {
      errors.churnedMrr = "These reductions would make ending MRR negative. Check contraction and churn.";
    }
  }

  if (Object.keys(errors).length > 0 || !month.value || !currency.value || !amountsAreValid) {
    return { status: "invalid", values: null, errors };
  }

  let balance = amounts.startingMrr as number;
  const startingCents = balance;
  const stages: MrrWaterfallStage[] = [{
    id: "startingMrr",
    label: "Starting MRR",
    signedCents: null,
    balanceCents: balance,
  }];
  const steps: MrrWaterfallStep[] = [];
  const orderedMovements = [
    { id: "newMrr", label: AMOUNT_LABELS.newMrr, cents: amounts.newMrr as number, direction: 1 },
    { id: "expansionMrr", label: AMOUNT_LABELS.expansionMrr, cents: amounts.expansionMrr as number, direction: 1 },
    { id: "reactivationMrr", label: AMOUNT_LABELS.reactivationMrr, cents: amounts.reactivationMrr as number, direction: 1 },
    { id: "contractionMrr", label: AMOUNT_LABELS.contractionMrr, cents: amounts.contractionMrr as number, direction: -1 },
    { id: "churnedMrr", label: AMOUNT_LABELS.churnedMrr, cents: amounts.churnedMrr as number, direction: -1 },
  ] as const;

  for (const movement of orderedMovements) {
    const fromCents = balance;
    const signedCents = movement.cents * movement.direction;
    balance += signedCents;
    steps.push({ id: movement.id, label: movement.label, signedCents, fromCents, toCents: balance });
    stages.push({
      id: movement.id,
      label: movement.label,
      signedCents,
      balanceCents: balance,
    });
  }

  const netNewCents = steps.reduce((total, step) => total + step.signedCents, 0);
  return {
    status: "valid",
    errors: {},
    values: {
      month: month.value,
      currency: currency.value,
      startingCents,
      netNewCents,
      endingCents: balance,
      steps,
      stages,
    },
  };
}
