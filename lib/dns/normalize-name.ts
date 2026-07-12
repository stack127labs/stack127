import { domainToASCII } from "node:url";

export type NormalizedDnsInput = {
  originalInput: string;
  normalizedName: string;
};

function hostnameFromUrl(input: string) {
  if (!/^https?:\/\//i.test(input)) return null;

  const url = new URL(input);
  if (url.username || url.password) {
    throw new Error("URLs with credentials are not accepted.");
  }
  return url.hostname;
}

function validateLabels(name: string) {
  if (!name || name.length > 253) {
    throw new Error("Enter a DNS name no longer than 253 characters.");
  }

  const labels = name.split(".");
  for (const label of labels) {
    if (!label || label.length > 63) {
      throw new Error("Each DNS label must contain 1 to 63 characters.");
    }
    if (!/^[a-z0-9_](?:[a-z0-9_-]*[a-z0-9_])?$/i.test(label)) {
      throw new Error("Enter a valid DNS name or HTTP/HTTPS URL.");
    }
  }
}

export function normalizeDnsInput(input: string): NormalizedDnsInput {
  const originalInput = String(input ?? "").trim();
  if (!originalInput) throw new Error("Enter a DNS name.");
  if (/[\u0000-\u001f\u007f]/.test(originalInput)) {
    throw new Error("The DNS name contains unsupported control characters.");
  }

  let candidate: string;
  try {
    candidate = hostnameFromUrl(originalInput) ?? originalInput;
  } catch (error) {
    if (error instanceof Error && error.message.includes("credentials")) throw error;
    throw new Error("Enter a valid DNS name or HTTP/HTTPS URL.");
  }

  candidate = candidate.replace(/\.$/, "").toLowerCase();
  if (candidate.includes(":") && !candidate.includes("::")) {
    throw new Error("Enter a valid DNS name or HTTP/HTTPS URL.");
  }

  const ascii = domainToASCII(candidate);
  if (!ascii) throw new Error("Enter a valid DNS name or HTTP/HTTPS URL.");
  validateLabels(ascii);

  return { originalInput, normalizedName: ascii.toLowerCase() };
}

export function canonicalDnsName(value: string) {
  return value.trim().replace(/\.$/, "").toLowerCase();
}
