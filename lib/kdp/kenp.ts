const KENP_RATE_SCALE = 100_000_000n;
const KENP_READ_MAX = 1_000_000_000;
const KENP_RATE_MAX_UNITS = 1_000n * KENP_RATE_SCALE;

export const KDP_KENP_SOURCES = {
  unlimitedRoyalties: "https://kdp.amazon.com/en_US/help/topic/G201541130",
  royaltiesEstimator: "https://kdp.amazon.com/en_US/help/topic/G6BZ4M9PVJ8YSCW8",
  reports: "https://kdp.amazon.com/en_US/help/topic/GVTTXHKHVPAPBEDQ",
} as const;

export type KdpKenpRateBasis = "kdp-reported" | "planning-assumption";

export type KdpKenpInput = Readonly<{
  earningsMonthText: string;
  marketplaceText: string;
  currencyCodeText: string;
  kenpReadText: string;
  rateText: string;
  rateBasis: string;
}>;

export type KdpKenpFieldErrors = Readonly<Record<string, string>>;

export type KdpKenpResult =
  | Readonly<{ status: "invalid"; fieldErrors: KdpKenpFieldErrors }>
  | Readonly<{
      status: "calculated";
      values: Readonly<{
        earningsMonth: string;
        marketplace: string;
        currencyCode: string;
        kenpRead: number;
        rateText: string;
        rateBasis: KdpKenpRateBasis;
        rateBasisLabel: string;
        fractionDigits: number;
        amountMinorUnits: string;
        amountDisplay: string;
        minorUnitDisplay: string;
        lessThanMinorUnit: boolean;
      }>;
    }>
  | Readonly<{ status: "unavailable"; message: string }>;

const supportedCurrencyCodes = new Set(Intl.supportedValuesOf("currency"));

type CurrencyInfo = Readonly<{ code: string; fractionDigits: number }>;

export function normalizeKdpKenpCurrencyCode(raw: string): string | null {
  const value = raw.trim();
  if (!/^[A-Za-z]{3}$/.test(value)) return null;
  const code = value.toUpperCase();
  if (!supportedCurrencyCodes.has(code)) return null;
  try {
    new Intl.NumberFormat("en-US", { style: "currency", currency: code });
    return code;
  } catch {
    return null;
  }
}

function currencyInfo(code: string): CurrencyInfo | null {
  const normalized = normalizeKdpKenpCurrencyCode(code);
  if (!normalized) return null;
  try {
    const numberFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: normalized });
    const fractionDigits = numberFormat.resolvedOptions().maximumFractionDigits;
    if (typeof fractionDigits !== "number" || !Number.isInteger(fractionDigits) || fractionDigits < 0 || fractionDigits > 8) return null;
    return { code: normalized, fractionDigits };
  } catch {
    return null;
  }
}

export function parseKdpKenpRead(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= KENP_READ_MAX ? parsed : null;
}

export function parseKdpKenpRate(raw: string): Readonly<{ text: string; units: bigint }> | null {
  const text = raw.trim();
  const match = /^(\d+)(?:\.(\d{1,8}))?$/.exec(text);
  if (!match) return null;
  const fraction = match[2] ?? "";
  const units = BigInt(match[1]) * KENP_RATE_SCALE + BigInt(fraction.padEnd(8, "0") || "0");
  if (units <= 0n || units > KENP_RATE_MAX_UNITS) return null;
  return { text, units };
}

export function formatKdpKenpCurrencyMinorUnits(currencyCode: string, minorUnitsText: string): string | null {
  const currency = currencyInfo(currencyCode);
  if (!currency || !/^\d+$/.test(minorUnitsText)) return null;
  const minorUnits = BigInt(minorUnitsText);
  const divisor = 10n ** BigInt(currency.fractionDigits);
  const whole = minorUnits / divisor;
  const fraction = minorUnits % divisor;
  const decimal = currency.fractionDigits > 0
    ? `.${fraction.toString().padStart(currency.fractionDigits, "0")}`
    : "";
  return `${whole.toLocaleString("en-US")}${decimal} ${currency.code}`;
}

export function isValidKdpKenpMonth(raw: string): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(raw.trim());
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return year >= 1 && year <= 9_999 && month >= 1 && month <= 12;
}

function invalid(fieldErrors: Record<string, string>): KdpKenpResult {
  return { status: "invalid", fieldErrors };
}

export function calculateKdpKenpEarnings(input: KdpKenpInput): KdpKenpResult {
  const errors: Record<string, string> = {};

  const earningsMonth = input.earningsMonthText.trim();
  if (!isValidKdpKenpMonth(earningsMonth)) {
    errors.earningsMonth = "Enter a month as YYYY-MM, from 0001-01 through 9999-12.";
  }

  const marketplace = input.marketplaceText.trim();
  const marketplaceLength = Array.from(marketplace).length;
  if (marketplaceLength < 2 || marketplaceLength > 80 || /[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\p{Zl}\p{Zp}]/u.test(marketplace)) {
    errors.marketplace = "Enter a marketplace name from 2 to 80 printable characters.";
  }

  const currencyCode = normalizeKdpKenpCurrencyCode(input.currencyCodeText);
  if (!currencyCode) {
    errors.currencyCode = "Enter a supported three-letter ISO currency code.";
  }

  const kenpRead = parseKdpKenpRead(input.kenpReadText);
  if (kenpRead === null) {
    errors.kenpRead = "Enter whole KENP Read pages from 0 to 1,000,000,000.";
  }

  const rate = parseKdpKenpRate(input.rateText);
  if (!rate) {
    errors.rate = "Enter a rate greater than 0 and no more than 1,000, with up to eight decimal places.";
  }

  if (input.rateBasis !== "kdp-reported" && input.rateBasis !== "planning-assumption") {
    errors.rateBasis = "Choose whether this is a rate entered from KDP for this month or a planning assumption.";
  }

  if (Object.keys(errors).length) return invalid(errors);

  const resolvedCurrency = currencyInfo(currencyCode as string);
  if (!resolvedCurrency || kenpRead === null || !rate) {
    return { status: "unavailable", message: "The estimate could not be calculated. Try again." };
  }

  const exactProductAtScale = BigInt(kenpRead) * rate.units;
  const minorUnitDivisor = 10n ** BigInt(8 - resolvedCurrency.fractionDigits);
  const amountMinorUnits = (exactProductAtScale + minorUnitDivisor / 2n) / minorUnitDivisor;
  const amountMinorUnitsText = amountMinorUnits.toString();
  const amountDisplay = formatKdpKenpCurrencyMinorUnits(resolvedCurrency.code, amountMinorUnitsText);
  const minorUnitDisplay = formatKdpKenpCurrencyMinorUnits(resolvedCurrency.code, "1");
  if (!amountDisplay || !minorUnitDisplay) {
    return { status: "unavailable", message: "The estimate could not be calculated. Try again." };
  }

  const rateBasis = input.rateBasis as KdpKenpRateBasis;
  return {
    status: "calculated",
    values: {
      earningsMonth,
      marketplace,
      currencyCode: resolvedCurrency.code,
      kenpRead,
      rateText: rate?.text as string,
      rateBasis,
      rateBasisLabel: rateBasis === "kdp-reported" ? "Rate I entered from KDP for this month" : "My planning assumption",
      fractionDigits: resolvedCurrency.fractionDigits,
      amountMinorUnits: amountMinorUnitsText,
      amountDisplay,
      minorUnitDisplay,
      lessThanMinorUnit: exactProductAtScale > 0n && amountMinorUnits === 0n,
    },
  };
}
