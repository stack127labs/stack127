export const AMAZON_US_PARTNER_TAG = "stack127-20";

export const amazonReviewStatuses = [
  "confirmed",
  "no-confirmed-match",
  "not-retail",
  "regional-mismatch",
  "needs-review",
] as const;

export type AmazonReviewStatus = typeof amazonReviewStatuses[number];

export type AmazonReviewEvidence = {
  kind: "amazon-result" | "manufacturer" | "search-result" | "source-record";
  title: string;
  url: string;
};

export type AmazonProductReview = {
  asin?: string;
  directory: string;
  evidence: AmazonReviewEvidence[];
  identity_hash?: string;
  matched_identifiers?: string[];
  marketplace: "US";
  reason?: string;
  record_slug: string;
  reviewed_at?: string | null;
  status: AmazonReviewStatus;
};

export type AmazonProductMatch = {
  asin: string;
  marketplace: "US";
  url: string;
  verified_at: string;
};

const asinPattern = /^[A-Z0-9]{10}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function compactIdentity(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isAmazonUsHost(hostname: string) {
  return hostname === "amazon.com" || hostname.endsWith(".amazon.com");
}

export function extractAmazonAsin(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !isAmazonUsHost(url.hostname.toLowerCase())) return null;
    const match = url.pathname.match(/\/(?:dp|gp\/product)\/([A-Za-z0-9]{10})(?:[/?]|$)/);
    return match && asinPattern.test(match[1].toUpperCase()) ? match[1].toUpperCase() : null;
  } catch {
    return null;
  }
}

export function buildAmazonAffiliateUrl(asin: string) {
  const normalized = String(asin).trim().toUpperCase();
  if (!asinPattern.test(normalized)) throw new Error(`Invalid Amazon ASIN: ${asin}`);
  return `https://www.amazon.com/dp/${normalized}/ref=nosim?tag=${AMAZON_US_PARTNER_TAG}`;
}

export function validateAmazonReview(review: AmazonProductReview | Record<string, unknown>) {
  const value = review as Partial<AmazonProductReview>;
  const errors: string[] = [];

  if (!value.directory) errors.push("directory is required");
  if (!value.record_slug) errors.push("record_slug is required");
  if (value.marketplace !== "US") errors.push("marketplace must be US");
  if (!amazonReviewStatuses.includes(value.status as AmazonReviewStatus)) errors.push("status is invalid");
  if (!Array.isArray(value.evidence) || value.evidence.length === 0) errors.push("at least one evidence source is required");
  for (const item of value.evidence ?? []) {
    try {
      const url = new URL(item.url);
      if (url.protocol !== "https:") errors.push("evidence URLs must use HTTPS");
    } catch {
      errors.push("evidence URL is invalid");
    }
    if (!item.title?.trim()) errors.push("evidence title is required");
  }

  if (value.status === "confirmed") {
    if (!value.asin || !asinPattern.test(value.asin)) errors.push("a confirmed review needs a valid ASIN");
    if (!value.reviewed_at || !datePattern.test(value.reviewed_at)) errors.push("a confirmed review needs a review date");
    if (!Array.isArray(value.matched_identifiers) || new Set(value.matched_identifiers.map((item) => item.trim().toLowerCase()).filter(Boolean)).size < 2) {
      errors.push("a confirmed review needs at least two matched identifiers");
    }
    if (value.asin && !(value.evidence ?? []).some((item) => extractAmazonAsin(item.url) === value.asin)) {
      errors.push("a confirmed review needs Amazon evidence for its ASIN");
    }
    const evidenceText = compactIdentity((value.evidence ?? []).map((item) => item.title).join(" "));
    for (const identifier of value.matched_identifiers ?? []) {
      const normalized = compactIdentity(identifier);
      if (normalized && !evidenceText.includes(normalized)) errors.push("matched identifiers must appear in evidence titles");
    }
    const amazonEvidenceText = compactIdentity((value.evidence ?? []).filter((item) => extractAmazonAsin(item.url) === value.asin).map((item) => item.title).join(" "));
    if ((value.matched_identifiers ?? []).every((identifier) => !amazonEvidenceText.includes(compactIdentity(identifier)))) {
      errors.push("Amazon evidence must match at least one identity identifier");
    }
  } else if (value.status !== "needs-review") {
    if (!value.reason?.trim()) errors.push("a reviewed non-match needs a reason");
    if (!value.reviewed_at || !datePattern.test(value.reviewed_at)) errors.push("a reviewed non-match needs a review date");
    if (value.asin) errors.push("a reviewed non-match must not publish an ASIN");
  }

  return [...new Set(errors)];
}

export function getAmazonMatch(review: AmazonProductReview | undefined | null): AmazonProductMatch | null {
  if (!review || review.status !== "confirmed" || !review.asin || !review.reviewed_at) return null;
  if (validateAmazonReview(review).length > 0) return null;
  return {
    asin: review.asin,
    marketplace: "US",
    url: buildAmazonAffiliateUrl(review.asin),
    verified_at: review.reviewed_at,
  };
}
