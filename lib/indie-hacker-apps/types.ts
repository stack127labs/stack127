// Types shared by the server loaders, the API routes and the browser views. No imports.

export type FactState = "confirmed" | "not_published" | "unclear" | "conflicting" | "not_applicable" | "check_failed";

export type IndieCost = { v: string; plan: string; state: FactState; math: string };
export type IndieStatus = { label: string; tone: "warning" | "neutral"; text: string; date: string };
export type IndieFact = { label: string; value: string; state: FactState; url: string; checked: string };
export type FreeKind = "free" | "trial" | "credits" | "selfhost" | "none";

/** The card fields of one app in one research category. */
export type IndieAppCard = {
  slug: string;
  name: string;
  url: string;
  /** Ordered category job ids. The first one is the app's main job. */
  jobs: string[];
  line: string;
  free: { kind: FreeKind; text: string };
  cells: Record<string, string>;
  /** Cost rows per cost set, one per size level. */
  costs: Record<string, IndieCost[]>;
  /** Status events, newest first. */
  status: IndieStatus[];
  /** Latest checked date (YYYY-MM-DD), or "" when unknown. */
  checked: string;
  /** Public path of the 128×128 icon, or "" when there is none yet. */
  icon: string;
};

/** Card fields plus the side panel facts. */
export type IndieApp = IndieAppCard & {
  news: string;
  sections: Array<{ title: string; facts: IndieFact[] }>;
};

/** What a directory adds to an app: whether this directory covers its main job. */
export type DirectoryFlags = {
  /** True when the app's first job is one of this directory's jobs. */
  main: boolean;
  /** Label of the app's first job in its research category, e.g. "Backend platform". */
  mainJob: string;
};

export type DirectoryAppCard = IndieAppCard & DirectoryFlags;
export type DirectoryApp = IndieApp & DirectoryFlags;

export type IndieChange = IndieStatus & { app: string; slug: string };

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

/** Filter counts for a directory's sidebar. */
export type DirectoryCounts = {
  total: number;
  /** Apps whose main job is one of this directory's jobs. */
  main: number;
  jobs: Record<string, number>;
  free: { free: number; selfhost: number; trial: number };
  features: Record<string, number>;
};

/** Browser filter state, parsed from the URL by the page. Empty values mean "any". */
export type DirectoryFilter = {
  q?: string;
  job?: string;
  /** Free groups: "free", "selfhost", "trial" (trial includes credits). */
  free?: string[];
  /** Signal cell keys that must match, e.g. "selfhost". */
  features?: string[];
  /** Only apps whose main job is in this directory. */
  mainOnly?: boolean;
};
