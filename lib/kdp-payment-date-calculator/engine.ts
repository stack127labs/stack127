export type KdpPaymentDistribution = "standard" | "expanded";

export type KdpPaymentMonth = Readonly<{
  year: number;
  month: number;
}>;

export type KdpPaymentDateIssue = Readonly<{
  code: "month-required" | "month-format" | "month-year-range" | "distribution-invalid";
  field: "reportedMonth" | "distribution";
  message: string;
}>;

export type KdpPaymentDateValues = Readonly<{
  reportedMonth: KdpPaymentMonth;
  distribution: KdpPaymentDistribution;
  paymentMonth: KdpPaymentMonth;
  monthOffset: 2 | 3;
}>;

export type KdpPaymentDateResult =
  | Readonly<{ status: "valid"; values: KdpPaymentDateValues; issues: readonly [] }>
  | Readonly<{ status: "invalid"; values: null; issues: readonly KdpPaymentDateIssue[] }>;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const MONTH_REQUIRED: KdpPaymentDateIssue = {
  code: "month-required",
  field: "reportedMonth",
  message: "Enter a reported earnings month.",
};

const MONTH_FORMAT: KdpPaymentDateIssue = {
  code: "month-format",
  field: "reportedMonth",
  message: "Use YYYY-MM, with a month from 01 to 12.",
};

const MONTH_YEAR_RANGE: KdpPaymentDateIssue = {
  code: "month-year-range",
  field: "reportedMonth",
  message: "Use a year from 2007 to 2100.",
};

const DISTRIBUTION_INVALID: KdpPaymentDateIssue = {
  code: "distribution-invalid",
  field: "distribution",
  message: "Choose Standard or Expanded Distribution.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(issues: KdpPaymentDateIssue[]): KdpPaymentDateResult {
  return { status: "invalid", values: null, issues };
}

export function calculateKdpPaymentDate(input: unknown): KdpPaymentDateResult {
  if (!isRecord(input)) {
    return invalid([MONTH_REQUIRED, DISTRIBUTION_INVALID]);
  }

  const issues: KdpPaymentDateIssue[] = [];
  const rawMonth = input.reportedMonth;
  let reportedMonth: KdpPaymentMonth | null = null;

  if (rawMonth === undefined || rawMonth === null || (typeof rawMonth === "string" && rawMonth.trim() === "")) {
    issues.push(MONTH_REQUIRED);
  } else if (typeof rawMonth !== "string") {
    issues.push(MONTH_FORMAT);
  } else {
    const match = /^(\d{4})-(\d{2})$/.exec(rawMonth.trim());
    if (!match) {
      issues.push(MONTH_FORMAT);
    } else {
      const year = Number(match[1]);
      const month = Number(match[2]);
      if (year < 2007 || year > 2100) {
        issues.push(MONTH_YEAR_RANGE);
      } else if (month < 1 || month > 12) {
        issues.push(MONTH_FORMAT);
      } else {
        reportedMonth = { year, month };
      }
    }
  }

  const rawDistribution = input.distribution;
  const distribution: KdpPaymentDistribution | null = rawDistribution === "standard" || rawDistribution === "expanded"
    ? rawDistribution
    : null;
  if (!distribution) issues.push(DISTRIBUTION_INVALID);

  if (issues.length || !reportedMonth || !distribution) return invalid(issues);

  const monthOffset = distribution === "standard" ? 2 : 3;
  const reportedIndex = reportedMonth.year * 12 + reportedMonth.month - 1;
  const paymentIndex = reportedIndex + monthOffset;
  const paymentMonth = {
    year: Math.floor(paymentIndex / 12),
    month: (paymentIndex % 12) + 1,
  };

  return {
    status: "valid",
    values: { reportedMonth, distribution, paymentMonth, monthOffset },
    issues: [],
  };
}

export function formatKdpPaymentMonth(month: KdpPaymentMonth): string {
  return `${MONTHS[month.month - 1]} ${String(month.year).padStart(4, "0")}`;
}
