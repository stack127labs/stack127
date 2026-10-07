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
  { value: "verified", label: "Has a checked submission page" },
  { value: "unverified", label: "No checked submission page" },
];

export const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "ready", label: "Checked pages first" },
  { value: "name", label: "Name A to Z" },
] as const;

export const correctionEmail = "stack127@proton.me";
