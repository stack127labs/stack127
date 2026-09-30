
export const SAAS_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export type SaaSCurrency = (typeof SAAS_CURRENCIES)[number];
export type SaaSField =
  | "reportingMonth"
  | "currency"
  | "startingMrr"
  | "newMrr"
  | "expansionMrr"
  | "contractionMrr"
  | "churnedMrr"
  | "startingAccounts"
  | "newAccounts"
  | "churnedAccounts"
  | "recognizedRevenue"
  | "recurringCogs"
  | "acquisitionSpend"
  | "netCashBurn";

export type SaaSCalculatorInput = Record<SaaSField, string>;

export type SaaSMetrics = {
  reportingMonth: string;
  monthLabel: string;
  currency: SaaSCurrency;
  startingMrrCents: number;
  newMrrCents: number;
  expansionMrrCents: number;
  contractionMrrCents: number;
  churnedMrrCents: number;
  endingMrrCents: number;
  endingArrCents: number;
  netNewMrrCents: number;
  mrrGrowth: number | null;
  nrr: number | null;
  grr: number | null;
  accounts: {
    starting: number;
    new: number;
    churned: number;
    ending: number;
  } | null;
  customerChurn: number | null;
  recognizedRevenueCents: number | null;
  recurringCogsCents: number | null;
  grossMargin: number | null;
  monthlyArpa: number | null;
  acquisitionSpendCents: number | null;
  cac: number | null;
  simpleLtv: number | null;
  cacPaybackMonths: number | null;
  netCashBurnCents: number | null;
  burnMultiple: number | null;
};

export type SaaSCalculation =
  | { status: "valid"; values: SaaSMetrics; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: Partial<Record<SaaSField, string>> };

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const moneyMaximumCents = 100_000_000_000_000;
const countMaximum = 1_000_000_000;
const fieldLabels: Record<SaaSField, string> = {
  reportingMonth: "Reporting month",
  currency: "Currency",
  startingMrr: "Starting MRR",
  newMrr: "New MRR",
  expansionMrr: "Expansion MRR",
  contractionMrr: "Contraction MRR",
  churnedMrr: "Churned MRR",
  startingAccounts: "Starting paying accounts",
  newAccounts: "New paying accounts",
  churnedAccounts: "Churned starting accounts",
  recognizedRevenue: "Recognized recurring revenue",
  recurringCogs: "Recurring service COGS",
  acquisitionSpend: "Acquisition sales and marketing spend",
  netCashBurn: "Net cash burn",
};

function recordInput(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
}

function isBlank(value: unknown, present: boolean): boolean {
  return !present || (typeof value === "string" && value.trim() === "");
}

function fail(field: SaaSField, message: string, errors: Partial<Record<SaaSField, string>>) {
  if (!errors[field]) errors[field] = message;
}

function parseMonth(value: unknown, errors: Partial<Record<SaaSField, string>>): { raw: string; year: number; month: number } | null {
  if (typeof value !== "string") {
    fail("reportingMonth", "Enter a month in YYYY-MM format.", errors);
    return null;
  }
  const raw = value.trim();
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(raw);
  if (!match) {
    fail("reportingMonth", "Use a month from 2000-01 through 2100-12.", errors);
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 2000 || year > 2100) {
    fail("reportingMonth", "Use a month from 2000-01 through 2100-12.", errors);
    return null;
  }
  return { raw, year, month };
}

function parseMoney(
  value: unknown,
  field: SaaSField,
  options: { optional?: boolean; signed?: boolean; maximumCents?: number } = {},
  errors: Partial<Record<SaaSField, string>>,
): number | null {
  if (typeof value !== "string") {
    if (options.optional && value === undefined) return null;
    fail(field, "Enter the amount as digits with up to two decimal places.", errors);
    return null;
  }

  const raw = value.trim();
  if (options.optional && raw === "") return null;
  if (!options.optional && raw === "") {
    fail(field, "Enter an amount, including 0 when there was no movement.", errors);
    return null;
  }

  const pattern = options.signed
    ? /^-?\d+(?:\.\d{1,2})?$/
    : /^\d+(?:\.\d{1,2})?$/;
  if (!pattern.test(raw)) {
    const signNote = options.signed ? "" : " and cannot be negative";
    fail(field, "Use digits with up to two decimal places" + signNote + ".", errors);
    return null;
  }

  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const parts = unsigned.split(".");
  const whole = Number(parts[0]);
  const fractional = (parts[1] ?? "").padEnd(2, "0");
  const cents = whole * 100 + Number(fractional || "0");
  const signedCents = negative ? -cents : cents;
  const maximumCents = options.maximumCents ?? moneyMaximumCents;
  if (!Number.isSafeInteger(cents) || Math.abs(signedCents) > maximumCents) {
    const maximum = (maximumCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const bounds = options.signed ? "-" + maximum + " to " + maximum : "0 to " + maximum;
    fail(field, "Enter an amount from " + bounds + ".", errors);
    return null;
  }
  return signedCents;
}

function parseCount(value: unknown, field: SaaSField, optional: boolean, errors: Partial<Record<SaaSField, string>>): number | null {
  if (typeof value !== "string") {
    if (optional && value === undefined) return null;
    fail(field, "Enter a whole-number count.", errors);
    return null;
  }
  const raw = value.trim();
  if (optional && raw === "") return null;
  if (!optional && raw === "") {
    fail(field, "Enter a count, including 0 when there were no accounts.", errors);
    return null;
  }
  if (!/^\d+$/.test(raw)) {
    fail(field, "Use a whole number from 0 to 1,000,000,000.", errors);
    return null;
  }
  const count = Number(raw);
  if (!Number.isSafeInteger(count) || count > countMaximum) {
    fail(field, "Use a whole number from 0 to 1,000,000,000.", errors);
    return null;
  }
  return count;
}

function optionalGroupIsBlank(input: Record<string, unknown>, fields: SaaSField[]): boolean {
  return fields.every((field) => isBlank(input[field], Object.hasOwn(input, field)));
}

function addMissingGroupFields(
  input: Record<string, unknown>,
  fields: SaaSField[],
  errors: Partial<Record<SaaSField, string>>,
) {
  for (const field of fields) {
    if (isBlank(input[field], Object.hasOwn(input, field))) {
      fail(field, "Complete this optional group by entering " + fieldLabels[field] + ".", errors);
    }
  }
}

export function calculateSaasMetrics(inputValue: unknown): SaaSCalculation {
  const input = recordInput(inputValue);
  const errors: Partial<Record<SaaSField, string>> = {};
  const month = parseMonth(input.reportingMonth, errors);
  const currencyValue = input.currency;
  let currency: SaaSCurrency = "USD";
  if (typeof currencyValue !== "string" || !SAAS_CURRENCIES.includes(currencyValue as SaaSCurrency)) {
    fail("currency", "Choose USD, EUR, GBP, INR, CAD, or AUD.", errors);
  } else {
    currency = currencyValue as SaaSCurrency;
  }

  const startingMrrCents = parseMoney(input.startingMrr, "startingMrr", {}, errors);
  const newMrrCents = parseMoney(input.newMrr, "newMrr", {}, errors);
  const expansionMrrCents = parseMoney(input.expansionMrr, "expansionMrr", {}, errors);
  const contractionMrrCents = parseMoney(input.contractionMrr, "contractionMrr", {}, errors);
  const churnedMrrCents = parseMoney(input.churnedMrr, "churnedMrr", {}, errors);

  const accountFields: SaaSField[] = ["startingAccounts", "newAccounts", "churnedAccounts"];
  const accountGroupBlank = optionalGroupIsBlank(input, accountFields);
  if (!accountGroupBlank) addMissingGroupFields(input, accountFields, errors);
  const startingAccounts = parseCount(input.startingAccounts, "startingAccounts", true, errors);
  const newAccounts = parseCount(input.newAccounts, "newAccounts", true, errors);
  const churnedAccounts = parseCount(input.churnedAccounts, "churnedAccounts", true, errors);
  const accountsComplete = !accountGroupBlank
    && startingAccounts !== null && newAccounts !== null && churnedAccounts !== null;

  const marginFields: SaaSField[] = ["recognizedRevenue", "recurringCogs"];
  const marginGroupBlank = optionalGroupIsBlank(input, marginFields);
  if (!marginGroupBlank) addMissingGroupFields(input, marginFields, errors);
  const recognizedRevenueCents = parseMoney(input.recognizedRevenue, "recognizedRevenue", { optional: true }, errors);
  const recurringCogsCents = parseMoney(input.recurringCogs, "recurringCogs", { optional: true }, errors);
  const marginComplete = !marginGroupBlank
    && recognizedRevenueCents !== null && recurringCogsCents !== null;

  const acquisitionSpendCents = parseMoney(input.acquisitionSpend, "acquisitionSpend", { optional: true }, errors);
  const netCashBurnCents = parseMoney(input.netCashBurn, "netCashBurn", { optional: true, signed: true }, errors);

  if (acquisitionSpendCents !== null && accountGroupBlank) {
    fail("acquisitionSpend", "Enter all three customer counts to calculate acquisition cost.", errors);
  }

  const requiredValues = [
    startingMrrCents, newMrrCents, expansionMrrCents, contractionMrrCents, churnedMrrCents,
  ];
  if (requiredValues.every((value) => value !== null)) {
    const starting = startingMrrCents as number;
    const expansion = expansionMrrCents as number;
    const contraction = contractionMrrCents as number;
    const churned = churnedMrrCents as number;

    if (contraction + churned > starting) {
      fail("churnedMrr", "Contraction and churned MRR cannot exceed starting MRR.", errors);
    }
    if (starting === 0) {
      if (expansion > 0) fail("expansionMrr", "Expansion MRR must be 0 when starting MRR is 0.", errors);
      if (contraction > 0) fail("contractionMrr", "Contraction MRR must be 0 when starting MRR is 0.", errors);
      if (churned > 0) fail("churnedMrr", "Churned MRR must be 0 when starting MRR is 0.", errors);
    }
  }

  const endingMrrCents = requiredValues.every((value) => value !== null)
    ? (startingMrrCents as number) + (newMrrCents as number) + (expansionMrrCents as number)
      - (contractionMrrCents as number) - (churnedMrrCents as number)
    : null;

  let endingAccounts: number | null = null;
  if (accountsComplete) {
    const start = startingAccounts as number;
    const fresh = newAccounts as number;
    const lost = churnedAccounts as number;
    endingAccounts = start + fresh - lost;
    if (lost > start) fail("churnedAccounts", "Churned starting accounts cannot exceed starting paying accounts.", errors);

    if (startingMrrCents !== null && ((startingMrrCents === 0) !== (start === 0))) {
      fail("startingAccounts", "Starting MRR is zero exactly when starting paying accounts are zero.", errors);
    }
    if (newMrrCents !== null && ((newMrrCents === 0) !== (fresh === 0))) {
      fail("newAccounts", "New MRR is zero exactly when new paying accounts are zero.", errors);
    }
    if (churnedMrrCents !== null && ((churnedMrrCents === 0) !== (lost === 0))) {
      fail("churnedAccounts", "Churned MRR is zero exactly when churned starting accounts are zero.", errors);
    }
    if (endingMrrCents !== null && ((endingMrrCents === 0) !== (endingAccounts === 0))) {
      fail("churnedAccounts", "Ending MRR is zero exactly when ending paying accounts are zero.", errors);
    }
  }

  if (Object.keys(errors).length > 0 || !month || endingMrrCents === null) {
    return { status: "invalid", values: null, errors };
  }

  const accounts = accountsComplete
    ? {
        starting: startingAccounts as number,
        new: newAccounts as number,
        churned: churnedAccounts as number,
        ending: endingAccounts as number,
      }
    : null;
  const netNewMrrCents = endingMrrCents - (startingMrrCents as number);
  const mrrGrowth = startingMrrCents === 0 ? null : netNewMrrCents / (startingMrrCents as number);
  const nrr = startingMrrCents === 0
    ? null
    : ((startingMrrCents as number) + (expansionMrrCents as number)
      - (contractionMrrCents as number) - (churnedMrrCents as number)) / (startingMrrCents as number);
  const grr = startingMrrCents === 0
    ? null
    : ((startingMrrCents as number) - (contractionMrrCents as number) - (churnedMrrCents as number))
      / (startingMrrCents as number);
  const customerChurn = accounts && accounts.starting > 0 ? accounts.churned / accounts.starting : null;
  const grossMargin = marginComplete && (recognizedRevenueCents as number) > 0
    ? ((recognizedRevenueCents as number) - (recurringCogsCents as number)) / (recognizedRevenueCents as number)
    : null;
  const monthlyArpa = accounts && accounts.ending > 0
    ? endingMrrCents / 100 / accounts.ending
    : null;
  const cac = accounts && acquisitionSpendCents !== null && accounts.new > 0
    ? acquisitionSpendCents / 100 / accounts.new
    : null;
  const simpleLtv = monthlyArpa !== null && grossMargin !== null && grossMargin > 0
    && customerChurn !== null && customerChurn > 0
    ? monthlyArpa * grossMargin / customerChurn
    : null;
  const monthlyGrossProfitPerAccount = monthlyArpa !== null && grossMargin !== null && grossMargin > 0
    ? monthlyArpa * grossMargin
    : null;
  const cacPaybackMonths = cac !== null && monthlyGrossProfitPerAccount !== null
    ? cac / monthlyGrossProfitPerAccount
    : null;
  const burnMultiple = netCashBurnCents !== null && netCashBurnCents >= 0 && netNewMrrCents > 0
    ? netCashBurnCents / (12 * netNewMrrCents)
    : null;

  return {
    status: "valid",
    errors: {},
    values: {
      reportingMonth: month.raw,
      monthLabel: monthNames[month.month - 1] + " " + month.year,
      currency,
      startingMrrCents: startingMrrCents as number,
      newMrrCents: newMrrCents as number,
      expansionMrrCents: expansionMrrCents as number,
      contractionMrrCents: contractionMrrCents as number,
      churnedMrrCents: churnedMrrCents as number,
      endingMrrCents,
      endingArrCents: 12 * endingMrrCents,
      netNewMrrCents,
      mrrGrowth,
      nrr,
      grr,
      accounts,
      customerChurn,
      recognizedRevenueCents: marginComplete ? recognizedRevenueCents : null,
      recurringCogsCents: marginComplete ? recurringCogsCents : null,
      grossMargin,
      monthlyArpa,
      acquisitionSpendCents,
      cac,
      simpleLtv,
      cacPaybackMonths,
      netCashBurnCents,
      burnMultiple,
    },
  };
}
