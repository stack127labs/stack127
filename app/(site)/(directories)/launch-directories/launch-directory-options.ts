export const costOptions = [
  { value: "free", label: "Free" },
  { value: "free_and_paid", label: "Free and paid" },
  { value: "paid", label: "Paid" },
  { value: "unknown", label: "Price not known" },
];

export const linkOptions = [
  { value: "dofollow", label: "Dofollow" },
  { value: "nofollow", label: "Nofollow" },
  { value: "ugc", label: "UGC" },
  { value: "sponsored", label: "Sponsored" },
  { value: "multiple", label: "More than one type" },
  { value: "varies", label: "Varies by plan or listing" },
  { value: "estimated_nofollow", label: "Likely nofollow" },
  { value: "none", label: "No maker website link" },
  { value: "unknown", label: "Couldn't verify" },
];

export const submissionOptions = [
  { value: "", label: "Any" },
  { value: "verified", label: "Has a checked submission page" },
  { value: "unverified", label: "No checked submission page" },
];

export const sortOptions = [
  { value: "ready", label: "Ready to submit first" },
  { value: "name", label: "Name A to Z" },
] as const;

export const correctionEmail = "stack127@proton.me";
