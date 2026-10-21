// `label` is the filter text. `card` is a fallback for a row without its own `cost_tag` or link label on the card.
export const costOptions = [
  { value: "free", label: "Has a free option", card: "Free" },
  { value: "free_and_paid", label: "Free and paid", card: "Free and paid" },
  { value: "paid", label: "Paid", card: "Paid" },
  { value: "unknown", label: "No confirmed price", card: "See details" },
];

export const backlinkOptions = [
  { value: "", label: "Any" },
  { value: "not_required", label: "Free without required backlink" },
];

export const linkOptions = [
  { value: "dofollow", label: "Dofollow", card: "Dofollow" },
  { value: "nofollow", label: "Nofollow", card: "Nofollow" },
  { value: "ugc", label: "UGC", card: "UGC" },
  { value: "sponsored", label: "Sponsored", card: "Sponsored" },
  { value: "multiple", label: "More than one type", card: "Mixed" },
  { value: "varies", label: "Varies by plan or listing", card: "Varies" },
  { value: "estimated_nofollow", label: "Likely nofollow", card: "Likely nofollow" },
  { value: "none", label: "No maker website link", card: "No link" },
  { value: "unknown", label: "Couldn't verify", card: "Couldn't verify" },
];

export const submissionOptions = [
  { value: "", label: "Any" },
  { value: "verified", label: "Submit page works" },
  { value: "unverified", label: "No working submit page" },
];

export const drOptions = [
  { value: "", label: "Any" },
  { value: "20", label: "20 and up" },
  { value: "40", label: "40 and up" },
  { value: "60", label: "60 and up" },
];

export const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "dr", label: "Highest DR" },
  { value: "popular", label: "Most popular" },
  { value: "cost", label: "Lowest cost" },
  { value: "checked", label: "Recently checked" },
  { value: "name", label: "Name A to Z" },
] as const;

/** One-click views in the sidebar. Each sets ordinary filters, so the chips and URL stay the same. */
export const quickPicks = [
  { value: "free-dofollow", label: "Free with a dofollow link", params: [["cost", "free"], ["link", "dofollow"]] },
  { value: "no-backlink", label: "Free, no backlink needed", params: [["backlink", "not_required"]] },
  { value: "ai-tools", label: "AI tool directories", params: [["category", "ai-tools"]] },
] as const;

export const correctionEmail = "stack127@proton.me";
