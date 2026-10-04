export const SAAS_ECONOMICS_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;
export type SaasEconomicsCurrency = (typeof SAAS_ECONOMICS_CURRENCIES)[number];
export const SAAS_ECONOMICS_MAX_MONEY_CENTS = 100_000_000_000n;
export type SaasParseFailure = "missing" | "format" | "range";
export type SaasParseResult<T> = { ok: true; value: T } | { ok: false; reason: SaasParseFailure };

export function isSaasEconomicsCurrency(value: unknown): value is SaasEconomicsCurrency {
  return typeof value === "string" && SAAS_ECONOMICS_CURRENCIES.includes(value as SaasEconomicsCurrency);
}

function parseDecimal(raw: unknown, bounds: { min: bigint; max: bigint }): SaasParseResult<bigint> {
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, reason: "missing" };
  const text = raw.trim();
  const pattern = bounds.min < 0n ? /^-?\d+(?:\.\d{1,2})?$/ : /^\d+(?:\.\d{1,2})?$/;
  if (!pattern.test(text)) return { ok: false, reason: "format" };
  const negative = text.startsWith("-");
  const [whole, fraction = ""] = (negative ? text.slice(1) : text).split(".");
  // Check significant digits before constructing a potentially large integer.
  if (whole.replace(/^0+/, "").length > 12) return { ok: false, reason: "range" };
  const magnitude = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  const value = negative ? -magnitude : magnitude;
  return value < bounds.min || value > bounds.max
    ? { ok: false, reason: "range" }
    : { ok: true, value };
}

export function parseMoneyCents(raw: unknown, bounds: { min: bigint; max: bigint }): SaasParseResult<bigint> {
  // Money never accepts a sign, including when a caller supplies a negative bound.
  if (typeof raw === "string" && raw.trim().startsWith("-")) return { ok: false, reason: "format" };
  return parseDecimal(raw, bounds);
}

export function parsePercentHundredths(raw: unknown, bounds: { min: bigint; max: bigint }): SaasParseResult<bigint> {
  return parseDecimal(raw, bounds);
}

export function parseWholeNumber(raw: unknown, bounds: { min: bigint; max: bigint }): SaasParseResult<bigint> {
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, reason: "missing" };
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return { ok: false, reason: "format" };
  if (text.replace(/^0+/, "").length > 12) return { ok: false, reason: "range" };
  const value = BigInt(text);
  return value < bounds.min || value > bounds.max
    ? { ok: false, reason: "range" }
    : { ok: true, value };
}

export function parseOptionalLabel(raw: unknown, maxLength: number): SaasParseResult<string> {
  if (typeof raw !== "string") return { ok: false, reason: "missing" };
  // Check controls before trimming so a pasted newline cannot disappear silently.
  if (/[\u0000-\u001f\u007f-\u009f]/.test(raw)) return { ok: false, reason: "format" };
  const value = raw.trim();
  return Array.from(value).length > maxLength
    ? { ok: false, reason: "range" }
    : { ok: true, value };
}

export function divideHalfAwayFromZero(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError("Denominator must be positive.");
  const magnitude = numerator < 0n ? -numerator : numerator;
  const quotient = magnitude / denominator;
  const rounded = quotient + (2n * (magnitude % denominator) >= denominator ? 1n : 0n);
  return numerator < 0n ? -rounded : rounded;
}

export function divideCeil(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError("Denominator must be positive.");
  return numerator / denominator + (numerator > 0n && numerator % denominator !== 0n ? 1n : 0n);
}
