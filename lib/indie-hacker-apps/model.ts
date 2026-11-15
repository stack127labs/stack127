// Shared by the server pages and the browser filters. No server-only imports here.
import categoriesFile from "./categories.json";

export type FactState = "confirmed" | "not_published" | "unclear" | "conflicting" | "not_applicable" | "check_failed";

export type IndieCost = { v: string; plan: string; state: FactState; math: string };
export type IndieStatus = { label: string; tone: "warning" | "neutral"; text: string; date: string };
export type IndieFact = { label: string; value: string; state: FactState; url: string; checked: string };

export type IndieAppCard = {
  slug: string;
  name: string;
  url: string;
  jobs: string[];
  line: string;
  free: { kind: "free" | "trial" | "credits" | "selfhost" | "none"; text: string };
  cells: Record<string, string>;
  costs: Record<string, IndieCost[]>;
  status: IndieStatus[];
  checked: string;
  /** Public path of the 128×128 icon, or "" when there is none yet. */
  icon: string;
};

export type IndieApp = IndieAppCard & {
  news: string;
  sections: Array<{ title: string; facts: IndieFact[] }>;
};

export type IndieChange = IndieStatus & { app: string; slug: string };
export type IndieCategoryData = { slug: string; apps: IndieApp[]; changes: IndieChange[] };

export type IndieCostSet = {
  label: string;
  unit: string;
  levels: string[];
  short: string[];
  default: number;
  note: string;
};

export type IndieCategory = {
  slug: string;
  research_dir: string;
  name: string;
  summary: string;
  jobs: Array<[id: string, label: string, hint: string]>;
  cells: Array<[key: string, label: string, hint: string]>;
  signals: Array<[cell: string, value: string, label: string]>;
  show_free: boolean;
  sets: Record<string, IndieCostSet>;
  job_sets: Record<string, string>;
};

export const indieRoute = "/indie-hacker-apps";
export const indieCategories = (categoriesFile as unknown as { categories: IndieCategory[] }).categories;

export function getIndieCategory(slug: string) {
  return indieCategories.find((category) => category.slug === slug);
}

export const indieCategoryPath = (slug: string) => `${indieRoute}/${slug}`;

export const stateLabels: Record<FactState, string> = {
  confirmed: "",
  not_published: "vendor doesn't say",
  unclear: "unclear",
  conflicting: "sources disagree",
  not_applicable: "not applicable",
  check_failed: "couldn't check",
};

export const freeKindLabels: Record<IndieAppCard["free"]["kind"], string> = {
  free: "Free plan",
  selfhost: "Free to self-host",
  trial: "Trial",
  credits: "Credits",
  none: "No free start",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatIndieDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${months[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
}

/** The cost set a card shows: the one for the chosen job, else the app's first priced set. */
export function costSetFor(category: IndieCategory, app: Pick<IndieAppCard, "jobs" | "costs">, job?: string) {
  const sets = Object.keys(category.sets);
  if (sets.length === 1) return sets[0];
  if (job && category.job_sets[job]) return category.job_sets[job];
  const priced = (set: string) => (app.costs[set] ?? []).some((row) => row.state !== "not_applicable");
  for (const appJob of app.jobs) {
    const set = category.job_sets[appJob];
    if (set && priced(set)) return set;
  }
  return sets.find(priced) ?? sets[0];
}

/** Size param per cost set, e.g. ?size_subs=1. */
export const sizeParam = (set: string) => `size_${set}`;
