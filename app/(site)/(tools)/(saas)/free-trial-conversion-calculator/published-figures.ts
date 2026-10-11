import type { TrialModel } from "@/lib/free-trial-conversion-calculator/engine";

// Copied from content_docs/free-trial-conversion-calculator/research.md, checked 2026-10-10.
// Each source counts conversion its own way, so these are directional only.
export type PublishedFigureSource = {
  id: string;
  name: string;
  url: string;
  date: string;
  measured: string;
  figures: Partial<Record<TrialModel, string>>;
};

export const PUBLISHED_FIGURES: readonly PublishedFigureSource[] = [
  {
    id: "chartmogul-2026",
    name: "ChartMogul, Growth Unhinged, and ProductLed",
    url: "https://chartmogul.com/reports/saas-conversion-report/",
    date: "Survey, January 2026",
    measured: "200 software products, self-reported. A typical respondent had $1m to $10m in ARR. B2B, consumer, and hybrid. All models counted conversions within six months.",
    figures: {
      trialNoCard: "Median 4 to 6%. Top quarter 10 to 15%.",
      trialCardRequired: "Median 25 to 35%. Top quarter 50 to 60%.",
      freemium: "Median 3 to 5%. Top quarter 8 to 12%.",
    },
  },
  {
    id: "first-page-sage-2025",
    name: "First Page Sage",
    url: "https://firstpagesage.com/seo-blog/saas-free-trial-conversion-rate-benchmarks/",
    date: "Updated September 2025",
    measured: "86 of the agency's clients, 2022 to 2025. 71% B2B. Converted means one paid month.",
    figures: {
      trialNoCard: "18.2% from organic, 17.4% from paid ads.",
      trialCardRequired: "48.8% from organic, 51% from paid ads.",
      freemium: "2.6% from organic, 2.8% from paid ads.",
    },
  },
  {
    id: "recurly-2022",
    name: "Recurly",
    url: "https://recurly.com/resources/report/state-of-subscriptions-acquisition/",
    date: "2022 data",
    measured: "22 million trials on 803 subscription sites, not only SaaS. Average trials ran 29 days with a card and 39 without. Recurly counted subscriptions, not accounts, so one account could count more than once.",
    figures: {
      trialNoCard: "12% average across sites.",
      trialCardRequired: "39% average across sites.",
    },
  },
];
