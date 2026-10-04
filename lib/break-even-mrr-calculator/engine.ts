import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import {
  SAAS_ECONOMICS_MAX_MONEY_CENTS,
  divideCeil,
  divideHalfAwayFromZero,
  isSaasEconomicsCurrency,
  parseMoneyCents,
  parseOptionalLabel,
  parsePercentHundredths,
} from "../saas-economics/shared.ts";

export const BREAK_EVEN_MRR_MAX_FIXED_COST_LINES = 20;
export const BREAK_EVEN_MRR_LINE_NAME_MAX_LENGTH = 60;
export const BREAK_EVEN_MRR_VARIABLE_METHODS = ["perAccount", "shareOfMrr"] as const;
export type BreakEvenMrrVariableMethod = (typeof BREAK_EVEN_MRR_VARIABLE_METHODS)[number];
export const BREAK_EVEN_MRR_COST_PERIODS = ["month", "year"] as const;
export type BreakEvenMrrCostPeriod = (typeof BREAK_EVEN_MRR_COST_PERIODS)[number];

export type BreakEvenMrrFixedCostInput = { id: string; name: string; amount: string; period: string };
export type BreakEvenMrrInput = {
  currency: string;
  fixedCosts: BreakEvenMrrFixedCostInput[];
  monthlyArpa: string;
  variableMethod: string;
  variableCostPerAccount: string;
  variableCostSharePercent: string;
  currentMrr: string;
};

export type BreakEvenMrrFieldKey =
  | "form" | "currency" | "fixedCosts" | "monthlyArpa" | "variableMethod"
  | "variableCostPerAccount" | "variableCostSharePercent" | "currentMrr"
  | `fixedCosts.${string}.name` | `fixedCosts.${string}.amount` | `fixedCosts.${string}.period`;

export type BreakEvenMrrFixedCostLine = {
  id: string;
  name: string;               // trimmed entry, or "Fixed cost N" when blank
  nameWasBlank: boolean;
  period: BreakEvenMrrCostPeriod;
  enteredCents: bigint;
  monthlyCents: bigint;       // half away from zero
  monthlyIsRounded: boolean;
};

export type BreakEvenMrrOutcome =
  | {
      kind: "finite";
      breakEvenMrrCents: bigint;           // ceil
      accounts: bigint | null;             // ceil; null only when ARPA is missing in share mode
      mrrAtAccountsCents: bigint | null;
      leftAfterFixedCents: bigint | null;  // >= 0
      accountsUnknownReason: "arpaMissing" | null;
    }
  | { kind: "zeroFixedCosts" }
  | { kind: "noFiniteThreshold"; contribution: "zero" | "negative"; fixedCosts: "positive" | "zero" };

export type BreakEvenMrrCurrent = {
  mrrCents: bigint;
  monthlyResultCents: bigint;        // signed
  mrrGapCents: bigint | null;        // positive = shortfall, negative = above
  additionalAccounts: bigint | null;
};

export type BreakEvenMrrValues = {
  currency: SaasEconomicsCurrency;
  variableMethod: BreakEvenMrrVariableMethod;
  fixedCosts: BreakEvenMrrFixedCostLine[];
  fixedMonthlyCents: bigint;         // displayed total, half away from zero
  fixedMonthlyIsRounded: boolean;
  monthlyArpaCents: bigint | null;   // null only when blank in share mode
  variableCostPerAccountCents: bigint | null; // perAccount only
  variableCostShareHundredths: bigint | null; // shareOfMrr only
  contributionPerAccountCents: bigint | null; // signed; null when ARPA is unknown
  contributionRatioHundredths: bigint;        // signed percent x 100
  outcome: BreakEvenMrrOutcome;
  current: BreakEvenMrrCurrent | null;        // null when current MRR is blank
};

export type BreakEvenMrrErrors = Partial<Record<BreakEvenMrrFieldKey, string>>;

export type BreakEvenMrrCalculation =
  | { status: "valid"; values: BreakEvenMrrValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: BreakEvenMrrErrors };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

export function calculateBreakEvenMrr(inputValue: unknown): BreakEvenMrrCalculation {
  const input = asRecord(inputValue);
  const errors: BreakEvenMrrErrors = {};
  const formError = "Something in the form is out of date. Reset and try again.";
  if (!input) return { status: "invalid", values: null, errors: { form: formError } };

  const currency = typeof input.currency === "string" ? input.currency.trim() : input.currency;
  if (!isSaasEconomicsCurrency(currency)) errors.currency = "Choose one of the listed options.";
  const variableMethod = input.variableMethod;
  if (variableMethod !== "perAccount" && variableMethod !== "shareOfMrr") {
    errors.variableMethod = "Choose one of the listed options.";
  }

  function money(raw: unknown, key: BreakEvenMrrFieldKey, missing: string, positive = false): bigint | null {
    const parsed = parseMoneyCents(raw, { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
    if (!parsed.ok) {
      errors[key] = parsed.reason === "missing" ? missing
        : parsed.reason === "range" ? "Enter an amount up to 1,000,000,000.00."
        : "Use digits with up to two decimals. No signs, commas, or currency symbols.";
      return null;
    }
    if (positive && parsed.value === 0n) {
      errors[key] = "Enter an ARPA above 0.";
      return null;
    }
    return parsed.value;
  }

  const fixedCosts: BreakEvenMrrFixedCostLine[] = [];
  let fixedTwelfthCents = 0n;
  if (!Array.isArray(input.fixedCosts)) errors.form = formError;
  else {
    if (input.fixedCosts.length === 0) errors.fixedCosts = "Add at least one fixed cost. Enter 0 if you have none.";
    if (input.fixedCosts.length > BREAK_EVEN_MRR_MAX_FIXED_COST_LINES) {
      errors.fixedCosts = "Use up to 20 fixed costs. Combine small ones.";
    }
    const ids = new Set<string>();
    input.fixedCosts.slice(0, BREAK_EVEN_MRR_MAX_FIXED_COST_LINES).forEach((raw, index) => {
      const row = asRecord(raw);
      if (!row || typeof row.id !== "string" || !/^[A-Za-z0-9_-]{1,40}$/.test(row.id) || ids.has(row.id)) {
        errors.fixedCosts = "Use a different valid ID for each fixed cost. Reset and try again.";
        return;
      }
      ids.add(row.id);
      const name = parseOptionalLabel(row.name, BREAK_EVEN_MRR_LINE_NAME_MAX_LENGTH);
      if (!name.ok) errors[`fixedCosts.${row.id}.name`] = "Use up to 60 characters without control characters.";
      const amount = money(row.amount, `fixedCosts.${row.id}.amount`, "Enter an amount, or remove this line.");
      const period = row.period;
      if (period !== "month" && period !== "year") errors[`fixedCosts.${row.id}.period`] = "Choose one of the listed options.";
      if (!name.ok || amount === null || (period !== "month" && period !== "year")) return;
      const monthlyNumerator = period === "year" ? amount : amount * 12n;
      fixedTwelfthCents += monthlyNumerator;
      fixedCosts.push({
        id: row.id, name: name.value || `Fixed cost ${index + 1}`, nameWasBlank: name.value === "",
        period, enteredCents: amount,
        monthlyCents: divideHalfAwayFromZero(monthlyNumerator, 12n),
        monthlyIsRounded: monthlyNumerator % 12n !== 0n,
      });
    });
  }

  const arpaMissing = parseMoneyCents(input.monthlyArpa, { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
  const monthlyArpaCents = variableMethod === "shareOfMrr" && !arpaMissing.ok && arpaMissing.reason === "missing"
    ? null : money(input.monthlyArpa, "monthlyArpa", "Enter monthly ARPA.", true);
  let variableCostPerAccountCents: bigint | null = null;
  let variableCostShareHundredths: bigint | null = null;
  if (variableMethod === "perAccount") {
    variableCostPerAccountCents = money(input.variableCostPerAccount, "variableCostPerAccount", "Enter variable cost per account. Use 0 if there is none.");
  } else if (variableMethod === "shareOfMrr") {
    const share = parsePercentHundredths(input.variableCostSharePercent, { min: 0n, max: 10000n });
    if (!share.ok) errors.variableCostSharePercent = "Enter a percent from 0 to 100, with up to two decimals.";
    else variableCostShareHundredths = share.value;
  }
  const parsedCurrent = parseMoneyCents(input.currentMrr, { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
  const currentMrrCents = !parsedCurrent.ok && parsedCurrent.reason === "missing"
    ? null : money(input.currentMrr, "currentMrr", "Enter current MRR.");

  if (Object.keys(errors).length || !isSaasEconomicsCurrency(currency)
    || (variableMethod !== "perAccount" && variableMethod !== "shareOfMrr")) {
    return { status: "invalid", values: null, errors };
  }

  const ratioNumerator = variableMethod === "perAccount"
    ? monthlyArpaCents! - variableCostPerAccountCents! : 10000n - variableCostShareHundredths!;
  const ratioDenominator = variableMethod === "perAccount" ? monthlyArpaCents! : 10000n;
  const contributionPerAccountCents = monthlyArpaCents === null ? null
    : divideHalfAwayFromZero(monthlyArpaCents * ratioNumerator, ratioDenominator);
  let outcome: BreakEvenMrrOutcome;
  if (ratioNumerator <= 0n) {
    outcome = { kind: "noFiniteThreshold", contribution: ratioNumerator === 0n ? "zero" : "negative", fixedCosts: fixedTwelfthCents === 0n ? "zero" : "positive" };
  } else if (fixedTwelfthCents === 0n) outcome = { kind: "zeroFixedCosts" };
  else {
    const breakEvenMrrCents = divideCeil(fixedTwelfthCents * ratioDenominator, 12n * ratioNumerator);
    const accounts = monthlyArpaCents === null ? null
      : divideCeil(fixedTwelfthCents * ratioDenominator, 12n * ratioNumerator * monthlyArpaCents);
    const mrrAtAccountsCents = accounts === null ? null : accounts * monthlyArpaCents!;
    outcome = {
      kind: "finite", breakEvenMrrCents, accounts, mrrAtAccountsCents,
      leftAfterFixedCents: mrrAtAccountsCents === null ? null
        : divideHalfAwayFromZero(12n * mrrAtAccountsCents * ratioNumerator - fixedTwelfthCents * ratioDenominator, 12n * ratioDenominator),
      accountsUnknownReason: accounts === null ? "arpaMissing" : null,
    };
  }

  let current: BreakEvenMrrCurrent | null = null;
  if (currentMrrCents !== null) {
    const resultNumerator = 12n * currentMrrCents * ratioNumerator - fixedTwelfthCents * ratioDenominator;
    const additional = outcome.kind === "finite" && monthlyArpaCents !== null
      ? divideCeil(-resultNumerator, 12n * ratioNumerator * monthlyArpaCents) : null;
    current = {
      mrrCents: currentMrrCents,
      monthlyResultCents: divideHalfAwayFromZero(resultNumerator, 12n * ratioDenominator),
      mrrGapCents: outcome.kind === "finite" ? outcome.breakEvenMrrCents - currentMrrCents
        : outcome.kind === "zeroFixedCosts" ? -currentMrrCents : null,
      additionalAccounts: additional === null ? null : additional > 0n ? additional : 0n,
    };
  }
  return { status: "valid", errors: {}, values: {
    currency, variableMethod, fixedCosts,
    fixedMonthlyCents: divideHalfAwayFromZero(fixedTwelfthCents, 12n),
    fixedMonthlyIsRounded: fixedTwelfthCents % 12n !== 0n,
    monthlyArpaCents, variableCostPerAccountCents, variableCostShareHundredths,
    contributionPerAccountCents,
    contributionRatioHundredths: divideHalfAwayFromZero(10000n * ratioNumerator, ratioDenominator),
    outcome, current,
  } };
}
