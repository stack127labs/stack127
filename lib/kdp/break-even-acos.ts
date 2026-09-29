const MAX_MONEY_CENTS = 100_000n;
const PERCENT_BASIS_POINTS = 10_000n;

export type KdpBreakEvenField = "royalty" | "profitTarget" | "purchaseRate" | "cpc" | "salesValue";

export type KdpBreakEvenInput = Readonly<{
  royaltyText: string;
  profitTargetText: string;
  purchaseRateText: string;
  cpcText: string;
  salesValueText: string;
}>;

export type KdpBreakEvenFieldErrors = Readonly<Partial<Record<KdpBreakEvenField, string>>>;

type RequiredRateState =
  | Readonly<{ kind: "rate"; hundredthsOfPercent: number }>
  | Readonly<{ kind: "any-positive" }>
  | Readonly<{ kind: "above-100" }>
  | Readonly<{ kind: "no-headroom" }>
  | Readonly<{ kind: "target-exceeds-royalty" }>;

export type KdpBreakEvenValues = Readonly<{
  royaltyCents: number;
  profitTargetCents: number;
  purchaseRateBasisPoints: number;
  cpcCents: number;
  salesValueCents: number | null;
  headroomCents: number;
  maximumCpcCents: number | null;
  meetsTarget: boolean | null;
  modeledClickCostCents: bigint | null;
  modeledAmountLeftCents: bigint | null;
  requiredRate: RequiredRateState;
  modeledAcosTenthsPercent: bigint | null;
  targetAcosTenthsPercent: bigint | null;
}>;

export type KdpBreakEvenResult =
  | Readonly<{ status: "invalid"; fieldErrors: KdpBreakEvenFieldErrors }>
  | Readonly<{ status: "calculated"; values: KdpBreakEvenValues }>
  | Readonly<{ status: "unavailable"; message: string }>;

type ParseResult = Readonly<{ value: number; error?: never }>
  | Readonly<{ value: null; error?: string }>;

function parseMoney(raw: string, { allowBlank = false, minimum = 0 } = {}): ParseResult {
  const value = raw.trim();
  if (!value && allowBlank) return { value: null };
  const match = /^\$?(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return { value: null, error: "Use dollars with up to two decimal places and no commas or signs." };

  const whole = match[1].replace(/^0+(?=\d)/, "");
  if (whole.length > 4) return { value: null, error: "Enter an amount from $0.00 to $1,000.00." };
  const cents = BigInt(whole) * 100n + BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  if (cents < BigInt(minimum) || cents > MAX_MONEY_CENTS) {
    return { value: null, error: `Enter an amount from ${formatKdpBreakEvenMoneyCents(minimum)} to $1,000.00.` };
  }
  return { value: Number(cents) };
}

function parsePurchaseRate(raw: string): ParseResult {
  const value = raw.trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return { value: null, error: "Enter a percentage from 0.00 to 100.00, with up to two decimal places." };
  const whole = match[1].replace(/^0+(?=\d)/, "");
  if (whole.length > 3) return { value: null, error: "Enter a purchase rate from 0.00% to 100.00%." };
  const hundredthsOfPercent = BigInt(whole) * 100n + BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  if (hundredthsOfPercent > PERCENT_BASIS_POINTS) {
    return { value: null, error: "Enter a purchase rate from 0.00% to 100.00%." };
  }
  return { value: Number(hundredthsOfPercent) };
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError("A positive denominator is required.");
  if (numerator < 0n) return -((-numerator + denominator / 2n) / denominator);
  return (numerator + denominator / 2n) / denominator;
}

function ceilDivide(numerator: bigint, denominator: bigint): bigint {
  if (numerator <= 0n || denominator <= 0n) throw new RangeError("Positive values are required.");
  return (numerator + denominator - 1n) / denominator;
}

function requiredRateState(headroomCents: number, cpcCents: number): RequiredRateState {
  if (headroomCents < 0) return { kind: "target-exceeds-royalty" };
  if (cpcCents === 0) return { kind: "any-positive" };
  if (headroomCents === 0) return { kind: "no-headroom" };
  const required = ceilDivide(BigInt(cpcCents) * PERCENT_BASIS_POINTS, BigInt(headroomCents));
  if (required > PERCENT_BASIS_POINTS) return { kind: "above-100" };
  return { kind: "rate", hundredthsOfPercent: Number(required) };
}

export function formatKdpBreakEvenMoneyCents(cents: number | bigint): string {
  const amount = typeof cents === "bigint" ? cents : BigInt(cents);
  const negative = amount < 0n;
  const absolute = negative ? -amount : amount;
  const dollars = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return `${negative ? "-" : ""}$${dollars.toLocaleString("en-US")}.${fraction}`;
}

export function formatKdpBreakEvenPurchaseRate(hundredthsOfPercent: number): string {
  const whole = Math.floor(hundredthsOfPercent / 100);
  const fraction = (hundredthsOfPercent % 100).toString().padStart(2, "0");
  return `${whole.toLocaleString("en-US")}.${fraction}%`;
}

export function formatKdpBreakEvenAcos(tenthsOfPercent: bigint): string {
  const whole = tenthsOfPercent / 10n;
  const fraction = (tenthsOfPercent % 10n).toString();
  return `${whole.toLocaleString("en-US")}.${fraction}%`;
}

export function calculateKdpBreakEvenAcos(input: KdpBreakEvenInput): KdpBreakEvenResult {
  const errors: Partial<Record<KdpBreakEvenField, string>> = {};

  const royalty = parseMoney(input.royaltyText);
  if (royalty.value === null) {
    errors.royalty = royalty.error ?? "Enter a net royalty from $0.00 to $1,000.00, with up to two decimal places.";
  }

  const profitTarget = parseMoney(input.profitTargetText);
  if (profitTarget.value === null) {
    errors.profitTarget = profitTarget.error ?? "Enter an amount left per sale from $0.00 to $1,000.00, with up to two decimal places.";
  }

  const purchaseRate = parsePurchaseRate(input.purchaseRateText);
  if (purchaseRate.value === null) errors.purchaseRate = purchaseRate.error;

  const cpc = parseMoney(input.cpcText);
  if (cpc.value === null) {
    errors.cpc = cpc.error ?? "Enter an average CPC from $0.00 to $1,000.00, with up to two decimal places.";
  }

  const salesValue = parseMoney(input.salesValueText, { allowBlank: true, minimum: 1 });
  if (salesValue.value === null && "error" in salesValue) {
    errors.salesValue = salesValue.error ?? "Enter ad-attributed sales value from $0.01 to $1,000.00, with up to two decimal places.";
  }

  if (Object.keys(errors).length > 0) return { status: "invalid", fieldErrors: errors };
  if (royalty.value === null || profitTarget.value === null || purchaseRate.value === null || cpc.value === null) {
    return { status: "unavailable", message: "The bid check could not be calculated. Check the inputs and try again." };
  }

  const royaltyCents = royalty.value;
  const profitTargetCents = profitTarget.value;
  const purchaseRateBasisPoints = purchaseRate.value;
  const cpcCents = cpc.value;
  const salesValueCents = salesValue.value;
  const headroomCents = royaltyCents - profitTargetCents;
  const rateBasisPoints = BigInt(purchaseRateBasisPoints);
  const positiveRate = purchaseRateBasisPoints > 0;
  const maximumCpcCents = headroomCents >= 0 && positiveRate
    ? Number((BigInt(headroomCents) * rateBasisPoints) / PERCENT_BASIS_POINTS)
    : null;
  const meetsTarget = positiveRate
    ? BigInt(cpcCents) * PERCENT_BASIS_POINTS <= BigInt(headroomCents) * rateBasisPoints
    : null;
  const modeledClickCostCents = positiveRate
    ? roundHalfUp(BigInt(cpcCents) * PERCENT_BASIS_POINTS, rateBasisPoints)
    : null;
  const modeledAmountLeftCents = positiveRate
    ? roundHalfUp(BigInt(royaltyCents) * rateBasisPoints - BigInt(cpcCents) * PERCENT_BASIS_POINTS, rateBasisPoints)
    : null;

  let modeledAcosTenthsPercent: bigint | null = null;
  let targetAcosTenthsPercent: bigint | null = null;
  if (salesValueCents !== null) {
    if (positiveRate) {
      modeledAcosTenthsPercent = roundHalfUp(
        BigInt(cpcCents) * 10_000_000n,
        rateBasisPoints * BigInt(salesValueCents),
      );
    }
    if (headroomCents >= 0) {
      targetAcosTenthsPercent = roundHalfUp(BigInt(headroomCents) * 1_000n, BigInt(salesValueCents));
    }
  }

  return {
    status: "calculated",
    values: {
      royaltyCents,
      profitTargetCents,
      purchaseRateBasisPoints,
      cpcCents,
      salesValueCents,
      headroomCents,
      maximumCpcCents,
      meetsTarget,
      modeledClickCostCents,
      modeledAmountLeftCents,
      requiredRate: requiredRateState(headroomCents, cpcCents),
      modeledAcosTenthsPercent,
      targetAcosTenthsPercent,
    },
  };
}
