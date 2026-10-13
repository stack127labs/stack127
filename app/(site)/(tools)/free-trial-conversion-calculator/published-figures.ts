import type { UiRangeBand } from "@/app/ui/display";
import type { TrialType } from "@/lib/free-trial-conversion-calculator/engine";

const chartMogul = "ChartMogul survey of 200 software products, January 2026, counting paid within six months.";

/** The survey counts paid within six months: 180 to 184 days, depending on the months. */
export const PUBLISHED_WINDOW_DAYS = { min: 180n, max: 184n };

/**
 * Published ranges by trial type, with the scale each starts on. Labels name the six-month window,
 * so a reader who hasn't set a window sees what the ranges measure.
 */
export const publishedRanges: Record<TrialType, { bands: UiRangeBand[]; scaleMax: number }> = {
  noCard: {
    bands: [
      { id: "median", from: 4, to: 6, label: "No-card median, paid within 6 months", valueText: "4 to 6%", hint: chartMogul },
      { id: "top", from: 10, to: 15, label: "No-card top quarter, paid within 6 months", valueText: "10 to 15%", hint: chartMogul },
    ],
    scaleMax: 30,
  },
  cardUpfront: {
    bands: [
      { id: "median", from: 25, to: 35, label: "Card-upfront median, paid within 6 months", valueText: "25 to 35%", hint: chartMogul },
      { id: "top", from: 50, to: 60, label: "Card-upfront top quarter, paid within 6 months", valueText: "50 to 60%", hint: chartMogul },
    ],
    scaleMax: 80,
  },
  freePlan: {
    bands: [
      { id: "median", from: 3, to: 5, label: "Free plan median, paid within 6 months", valueText: "3 to 5%", hint: chartMogul },
      { id: "top", from: 8, to: 12, label: "Free plan top quarter, paid within 6 months", valueText: "8 to 12%", hint: chartMogul },
    ],
    scaleMax: 30,
  },
};
