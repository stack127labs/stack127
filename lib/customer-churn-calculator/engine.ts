export const CUSTOMER_CHURN_MAX_ACCOUNTS = 1_000_000_000;

export type CustomerChurnField = "openingAccounts" | "lostAccounts";

export type CustomerChurnValidationErrors = Partial<Record<CustomerChurnField, string>>;

export type CustomerChurnValues = {
  openingAccounts: number;
  lostAccounts: number;
  retainedOpeningAccounts: number;
  churnBasisPoints: number | null;
};

export type CustomerChurnCalculation =
  | { status: "invalid"; errors: CustomerChurnValidationErrors }
  | { status: "valid"; values: CustomerChurnValues };

type CustomerChurnInput = {
  openingAccounts?: unknown;
  lostAccounts?: unknown;
};

function parseCount(value: unknown, label: string): { value: number } | { error: string } {
  if (value === undefined) {
    return { error: `Enter the ${label} count.` };
  }
  if (typeof value !== "string") {
    return { error: `Enter the ${label} as a whole number.` };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { error: `Enter the ${label} count.` };
  }
  if (!/^[0-9]+$/.test(trimmed)) {
    return { error: "Use digits only, without commas, signs, or decimals." };
  }

  const normalized = trimmed.replace(/^0+(?=[0-9])/, "");
  const maximum = String(CUSTOMER_CHURN_MAX_ACCOUNTS);
  if (normalized.length > maximum.length || (normalized.length === maximum.length && normalized > maximum)) {
    return { error: "Enter a count from 0 to 1,000,000,000." };
  }

  return { value: Number(normalized) };
}

export function calculateCustomerChurn(input: unknown): CustomerChurnCalculation {
  const candidate = input && typeof input === "object" ? input as CustomerChurnInput : {};
  const opening = parseCount(candidate.openingAccounts, "opening paying accounts");
  const lost = parseCount(candidate.lostAccounts, "lost opening accounts");
  const errors: CustomerChurnValidationErrors = {};

  if ("error" in opening) errors.openingAccounts = opening.error;
  if ("error" in lost) errors.lostAccounts = lost.error;

  if ("value" in opening && "value" in lost && lost.value > opening.value) {
    errors.lostAccounts = "Lost opening accounts cannot exceed opening paying accounts.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "invalid", errors };
  }

  const openingAccounts = (opening as { value: number }).value;
  const lostAccounts = (lost as { value: number }).value;
  const retainedOpeningAccounts = openingAccounts - lostAccounts;

  if (openingAccounts === 0) {
    return {
      status: "valid",
      values: {
        openingAccounts,
        lostAccounts,
        retainedOpeningAccounts,
        churnBasisPoints: null,
      },
    };
  }

  const scaledRate = BigInt(lostAccounts) * 10_000n;
  const openingBase = BigInt(openingAccounts);
  let churnBasisPoints = scaledRate / openingBase;
  if ((scaledRate % openingBase) * 2n >= openingBase) churnBasisPoints += 1n;

  return {
    status: "valid",
    values: {
      openingAccounts,
      lostAccounts,
      retainedOpeningAccounts,
      churnBasisPoints: Number(churnBasisPoints),
    },
  };
}
