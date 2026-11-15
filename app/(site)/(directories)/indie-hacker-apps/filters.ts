import { paramPage, paramString, paramValues, type DirectoryParams } from "@/app/ui/directories/directory-params";
import { costSetFor, sizeParam, type IndieAppCard, type IndieCategory } from "@/lib/indie-hacker-apps/model";

export const indiePageSize = 24;
export const sortOptions = [
  { label: "Lowest cost", value: "cost" },
  { label: "Name", value: "name" },
  { label: "Recently checked", value: "checked" },
] as const;
const sortValues: string[] = sortOptions.map((option) => option.value);

export function paramKeys(category: IndieCategory) {
  return ["q", "sort", "page", "job", "free", "feature", ...Object.keys(category.sets).map(sizeParam)];
}

export function getSort(params: DirectoryParams) {
  const value = paramString(params, "sort");
  return sortValues.includes(value) ? value : "cost";
}

export function getJob(category: IndieCategory, params: DirectoryParams) {
  const value = paramString(params, "job");
  return category.jobs.some(([id]) => id === value) ? value : "";
}

/** The chosen level for each cost set, from ?size_<set>=, else the set's default. */
export function getLevels(category: IndieCategory, params: DirectoryParams) {
  const levels: Record<string, number> = {};
  for (const [key, set] of Object.entries(category.sets)) {
    const raw = paramString(params, sizeParam(key));
    const value = raw === "" ? Number.NaN : Number(raw);
    levels[key] = Number.isInteger(value) && value >= 0 && value < set.levels.length ? value : set.default;
  }
  return levels;
}

export const getPage = paramPage;

const freeGroup = (kind: IndieAppCard["free"]["kind"]) => (kind === "credits" ? "trial" : kind);

export const freeOptions = [
  { label: "Free plan", value: "free" },
  { label: "Free to self-host", value: "selfhost" },
  { label: "Trial or credits", value: "trial" },
];

export function cellMatches(app: IndieAppCard, cell: string, value: string) {
  const text = app.cells[cell] ?? "";
  return text === value || new RegExp(`^${value}\\b`).test(text);
}

export function filterApps(category: IndieCategory, apps: IndieAppCard[], params: DirectoryParams) {
  const query = paramString(params, "q").trim().toLowerCase();
  const job = getJob(category, params);
  const free = paramValues(params, "free");
  const features = paramValues(params, "feature").filter((key) => category.signals.some(([cell]) => cell === key));
  return apps.filter((app) => {
    if (query && !`${app.name} ${app.line}`.toLowerCase().includes(query)) return false;
    if (job && !app.jobs.includes(job)) return false;
    if (free.length && !free.includes(freeGroup(app.free.kind))) return false;
    for (const key of features) {
      const signal = category.signals.find(([cell]) => cell === key);
      if (signal && !cellMatches(app, signal[0], signal[1])) return false;
    }
    return true;
  });
}

/** First number in a price, for sorting. Unknown, quote-only, and "—" sort last. */
function costNumber(value: string | undefined) {
  const match = value?.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

export function cardCost(category: IndieCategory, app: IndieAppCard, levels: Record<string, number>, job?: string) {
  const set = costSetFor(category, app, job);
  const level = levels[set] ?? category.sets[set].default;
  return { set, level, row: app.costs[set]?.[level] };
}

export function sortApps(category: IndieCategory, apps: IndieAppCard[], sort: string, levels: Record<string, number>, job?: string) {
  const sorted = [...apps];
  if (sort === "name") return sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "checked") return sorted.sort((a, b) => b.checked.localeCompare(a.checked) || a.name.localeCompare(b.name));
  const order = Object.keys(category.sets);
  return sorted.sort((a, b) => {
    const left = cardCost(category, a, levels, job);
    const right = cardCost(category, b, levels, job);
    if (left.set !== right.set) return order.indexOf(left.set) - order.indexOf(right.set);
    const leftNa = !left.row || left.row.state === "not_applicable";
    const rightNa = !right.row || right.row.state === "not_applicable";
    if (leftNa !== rightNa) return leftNa ? 1 : -1;
    return costNumber(left.row?.v) - costNumber(right.row?.v) || a.name.localeCompare(b.name);
  });
}

/** The default view: no filters, default sizes, lowest cost first. */
export function defaultView(category: IndieCategory, apps: IndieAppCard[]) {
  return sortApps(category, apps, "cost", getLevels(category, {}));
}
