import "server-only";
import type { AmazonProductMatch, AmazonProductReview } from "./index";
import { getAmazonMatch } from "./index";
import confirmed from "./data/confirmed.json" with { type: "json" };

type ReviewLedger = {
  reviews: AmazonProductReview[];
};

const confirmedByRecord = new Map((confirmed as ReviewLedger).reviews.flatMap((review) => {
  const match = getAmazonMatch(review);
  return match ? [[`${review.directory}/${review.record_slug}`, match] as const] : [];
}));

export async function addAmazonMatches<T extends { slug: string }>(directory: string, records: T[]) {
  return records.map((record) => ({
    ...record,
    amazon: confirmedByRecord.get(`${directory}/${record.slug}`),
  }));
}
