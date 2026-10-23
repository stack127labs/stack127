// Ad revenue and RPM calculator. Three tabs share one monthly traffic number and one unit:
//   Revenue:    revenue = traffic × RPM ÷ 1,000
//   CPM to RPM: RPM = CPM × ad impressions per pageview (or per session)
//   Find RPM:   RPM = revenue ÷ traffic × 1,000
// Money is kept in cents and every answer is worked out as an exact fraction before one
// half-up rounding, so yearly figures are exact rather than 12 × a rounded month.

export const AD_REVENUE_TABS = ["revenue", "cpm", "rpm"] as const;
export type AdRevenueTab = (typeof AD_REVENUE_TABS)[number];
export const TRAFFIC_UNITS = ["pageviews", "sessions"] as const;
export type TrafficUnit = (typeof TRAFFIC_UNITS)[number];

export type AdRevenueInput = {
  tab: string;
  unit: string;
  traffic: string;
  rpm: string;
  cpm: string;
  impressions: string;
  revenue: string;
};
export type AdRevenueField = "traffic" | "rpm" | "cpm" | "impressions" | "revenue";
export type AdRevenueErrors = Partial<Record<AdRevenueField, string>>;

export const AD_REVENUE_EXAMPLE_INPUT: AdRevenueInput = {
  tab: "revenue",
  unit: "pageviews",
  traffic: "50,000",
  rpm: "12.00",
  cpm: "3.00",
  impressions: "4",
  revenue: "600.00",
};

/** A money amount in cents, after rounding. `underCent` marks a positive amount that rounds to 0. */
export type Cents = { cents: bigint; underCent: boolean };

export type AdRevenueValues = {
  tab: AdRevenueTab;
  unit: TrafficUnit;
  /** Monthly traffic, or null when the CPM to RPM tab leaves it blank. */
  traffic: bigint | null;
  rpm: Cents;
  monthly: Cents | null;
  yearly: Cents | null;
  /** CPM to RPM only: the inputs behind the RPM, and ad impressions when traffic is known. */
  cpmCents: bigint | null;
  impressionsHundredths: bigint | null;
  impressions: { monthly: bigint; yearly: bigint } | null;
  /** Find RPM only: the monthly revenue entered. */
  revenueCents: bigint | null;
};

export type AdRevenueCalculation =
  | { status: "valid"; values: AdRevenueValues; errors: AdRevenueErrors }
  | { status: "invalid"; values: null; errors: AdRevenueErrors };

export const MAX_TRAFFIC = 10_000_000_000n;
export const MAX_MONEY_CENTS = 10_000_000_000n; // $100,000,000
export const MAX_IMPRESSIONS_HUNDREDTHS = 100_000n; // 1,000 per pageview or session

export function isAdRevenueTab(value: unknown): value is AdRevenueTab {
  return typeof value === "string" && (AD_REVENUE_TABS as readonly string[]).includes(value);
}

export function isTrafficUnit(value: unknown): value is TrafficUnit {
  return typeof value === "string" && (TRAFFIC_UNITS as readonly string[]).includes(value);
}

/* ---------------- parsing ---------------- */

type Parsed = { ok: true; value: bigint } | { ok: false; error: string } | { ok: true; value: null };

function clean(raw: string): string {
  return raw.replace(/[\s,$]/g, "");
}

/** A non-negative decimal with up to `decimals` places, scaled to a whole number. Blank gives null. */
function parseScaled(raw: string, decimals: number, max: bigint, maxText: string, example: string): Parsed {
  const text = clean(raw);
  if (!text) return { ok: true, value: null };
  if (text.startsWith("-")) return { ok: false, error: "Enter 0 or more." };
  const match = /^(\d*)(?:\.(\d*))?$/.exec(text);
  if (!match || (!match[1] && !match[2])) return { ok: false, error: `Enter a number, such as ${example}.` };
  const fraction = match[2] ?? "";
  if (fraction.length > decimals) {
    return { ok: false, error: decimals === 0 ? "Enter a whole number." : `Use up to ${decimals} decimals.` };
  }
  const whole = match[1] || "0";
  if (whole.replace(/^0+/, "").length > 15) return { ok: false, error: `Enter ${maxText} or less.` };
  const value = BigInt(whole + fraction.padEnd(decimals, "0"));
  if (value > max) return { ok: false, error: `Enter ${maxText} or less.` };
  return { ok: true, value };
}

function parseTraffic(raw: string): Parsed {
  return parseScaled(raw, 0, MAX_TRAFFIC, "10,000,000,000", "50,000");
}

function parseMoney(raw: string): Parsed {
  return parseScaled(raw, 2, MAX_MONEY_CENTS, "100,000,000", "12.50");
}

function parseImpressions(raw: string): Parsed {
  return parseScaled(raw, 2, MAX_IMPRESSIONS_HUNDREDTHS, "1,000", "4");
}

/* ---------------- exact math ---------------- */

/** numerator ÷ denominator, rounded half up. Both are non-negative here. */
function roundDiv(numerator: bigint, denominator: bigint): bigint {
  return (numerator * 2n + denominator) / (denominator * 2n);
}

function cents(numerator: bigint, denominator: bigint): Cents {
  const value = roundDiv(numerator, denominator);
  return { cents: value, underCent: value === 0n && numerator > 0n };
}

export function unitWord(unit: TrafficUnit, plural = true): string {
  if (unit === "sessions") return plural ? "sessions" : "session";
  return plural ? "pageviews" : "pageview";
}

/* ---------------- calculation ---------------- */

export function calculateAdRevenue(input: AdRevenueInput): AdRevenueCalculation {
  const tab: AdRevenueTab = isAdRevenueTab(input.tab) ? input.tab : "revenue";
  const unit: TrafficUnit = isTrafficUnit(input.unit) ? input.unit : "pageviews";
  const errors: AdRevenueErrors = {};
  const word = unitWord(unit);

  function read(field: AdRevenueField, parsed: Parsed, required: string | null): bigint | null {
    if (!parsed.ok) {
      errors[field] = parsed.error;
      return null;
    }
    if (parsed.value === null && required) errors[field] = required;
    return parsed.value;
  }

  const traffic = read("traffic", parseTraffic(input.traffic), tab === "cpm" ? null : `Enter monthly ${word}.`);

  // RPM in cents, as an exact fraction rpmNumerator / rpmDenominator.
  let rpmNumerator = 0n;
  let rpmDenominator = 1n;
  let cpmCents: bigint | null = null;
  let impressionsHundredths: bigint | null = null;
  let revenueCents: bigint | null = null;

  if (tab === "revenue") {
    const rpm = read("rpm", parseMoney(input.rpm), `Enter your ${unit === "sessions" ? "session" : "page"} RPM.`);
    if (rpm !== null) rpmNumerator = rpm;
  } else if (tab === "cpm") {
    cpmCents = read("cpm", parseMoney(input.cpm), "Enter your CPM.");
    impressionsHundredths = read(
      "impressions",
      parseImpressions(input.impressions),
      `Enter ad impressions per ${unitWord(unit, false)}.`,
    );
    if (cpmCents !== null && impressionsHundredths !== null) {
      rpmNumerator = cpmCents * impressionsHundredths;
      rpmDenominator = 100n;
    }
  } else {
    revenueCents = read("revenue", parseMoney(input.revenue), "Enter your monthly ad revenue.");
    if (traffic === 0n && !errors.traffic) errors.traffic = `Enter more than 0 ${word} to find RPM.`;
    if (revenueCents !== null && traffic) {
      rpmNumerator = revenueCents * 1000n;
      rpmDenominator = traffic;
    }
  }

  if (Object.keys(errors).length) return { status: "invalid", values: null, errors };

  // Revenue in cents = traffic × RPM ÷ 1,000.
  const revenueDenominator = rpmDenominator * 1000n;
  const monthly = traffic === null ? null : cents(traffic * rpmNumerator, revenueDenominator);
  const yearly = traffic === null ? null : cents(traffic * rpmNumerator * 12n, revenueDenominator);
  const impressions = tab === "cpm" && traffic !== null && impressionsHundredths !== null
    ? {
      monthly: roundDiv(traffic * impressionsHundredths, 100n),
      yearly: roundDiv(traffic * impressionsHundredths * 12n, 100n),
    }
    : null;

  return {
    status: "valid",
    errors,
    values: {
      tab,
      unit,
      traffic,
      rpm: cents(rpmNumerator, rpmDenominator),
      monthly,
      yearly,
      cpmCents,
      impressionsHundredths,
      impressions,
      revenueCents,
    },
  };
}

/* ---------------- shared links ---------------- */

const TAB_FIELDS: Record<AdRevenueTab, readonly (keyof AdRevenueInput)[]> = {
  revenue: ["traffic", "rpm"],
  cpm: ["cpm", "impressions", "traffic"],
  rpm: ["revenue", "traffic"],
};

/** Only the active tab's fields go in the link, so it reopens exactly what was shown. */
export function adRevenueShareParams(input: AdRevenueInput): Record<string, string> {
  const tab = isAdRevenueTab(input.tab) ? input.tab : "revenue";
  const params: Record<string, string> = { tab, unit: isTrafficUnit(input.unit) ? input.unit : "pageviews" };
  for (const field of TAB_FIELDS[tab]) {
    const value = input[field].trim();
    if (value) params[field] = value;
  }
  return params;
}

/**
 * A link counts as shared only when it names a tab. The active tab's fields come from the link,
 * blank where the link leaves them out, so a CPM link without traffic stays without traffic.
 * The other tabs keep the example values.
 */
export function adRevenueInputFromQuery(get: (key: string) => string): AdRevenueInput | null {
  const tab = get("tab");
  if (!isAdRevenueTab(tab)) return null;
  const unit = get("unit");
  const input: AdRevenueInput = {
    ...AD_REVENUE_EXAMPLE_INPUT,
    tab,
    unit: isTrafficUnit(unit) ? unit : "pageviews",
  };
  for (const field of TAB_FIELDS[tab]) input[field] = get(field);
  return input;
}
