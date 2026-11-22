/** Required beside every published Ahrefs Domain Rating value or summary. */
export const AHREFS_ATTRIBUTION = {
  text: "Domain Rating by Ahrefs",
  url: "https://ahrefs.com",
} as const;

export type AhrefsAttribution = { attribution?: typeof AHREFS_ATTRIBUTION };

export function ahrefsAttribution(ratings: readonly (number | null | undefined)[]): AhrefsAttribution {
  return ratings.some(value => typeof value === "number") ? { attribution: AHREFS_ATTRIBUTION } : {};
}
