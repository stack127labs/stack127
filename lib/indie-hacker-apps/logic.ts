// Pure directory logic: membership, the main flag, counts, filtering, sorting and the
// cost a card shows. Shared by the server loaders and the browser views. Tested by
// lib/indie-hacker-apps/logic.test.mjs.
import type { AppDirectory } from "./directories.ts";
import type {
  DirectoryAppCard,
  DirectoryCounts,
  DirectoryFilter,
  DirectoryFlags,
  FreeKind,
  IndieAppCard,
  IndieCategory,
  IndieChange,
} from "./types.ts";

/**
 * The research category as one directory sees it: only the directory's jobs and cost
 * sets. Cells and signals stay the category's. Pass this view to the functions below.
 */
export function directoryCategory(category: IndieCategory, directory: AppDirectory): IndieCategory {
  if (category.slug !== directory.category) throw new Error(`Directory ${directory.slug} uses category ${directory.category}, not ${category.slug}`);
  const sets = Object.fromEntries(directory.sets.map((key) => {
    const set = category.sets[key];
    if (!set) throw new Error(`Directory ${directory.slug}: unknown cost set ${key}`);
    return [key, set];
  }));
  const jobs = directory.jobs.map((id) => {
    const job = category.jobs.find(([jobId]) => jobId === id);
    if (!job) throw new Error(`Directory ${directory.slug}: unknown job ${id}`);
    return job;
  });
  const jobSets = Object.fromEntries(Object.entries(category.job_sets).filter(([job, set]) => directory.jobs.includes(job) && set in sets));
  return { ...category, jobs, sets, job_sets: jobSets };
}

/** An app is listed when it does at least one of the directory's jobs. */
export const inDirectory = (directory: AppDirectory, jobs: readonly string[]) => jobs.some((job) => directory.jobs.includes(job));

/** Main means the app's first job is one of the directory's jobs. */
export const isMainIn = (directory: AppDirectory, jobs: readonly string[]) => jobs.length > 0 && directory.jobs.includes(jobs[0]);

/** Label of the app's first job in its full research category. */
export function mainJobLabel(category: IndieCategory, jobs: readonly string[]) {
  return category.jobs.find(([id]) => id === jobs[0])?.[1] ?? "";
}

export function directoryFlags(category: IndieCategory, directory: AppDirectory, jobs: readonly string[]): DirectoryFlags {
  return { main: isMainIn(directory, jobs), mainJob: mainJobLabel(category, jobs) };
}

/** The directory's apps, each with its main flag. Takes the full research category. */
export function directoryCards(category: IndieCategory, directory: AppDirectory, cards: IndieAppCard[]): DirectoryAppCard[] {
  return cards
    .filter((card) => inDirectory(directory, card.jobs))
    .map((card) => ({ ...card, ...directoryFlags(category, directory, card.jobs) }));
}

export const freeGroup = (kind: FreeKind) => (kind === "credits" ? "trial" : kind);

export function cellMatches(app: Pick<IndieAppCard, "cells">, cell: string, value: string) {
  const text = app.cells[cell] ?? "";
  return text === value || new RegExp(`^${value}\\b`).test(text);
}

/** Sidebar counts. `view` is directoryCategory(...). */
export function directoryCounts(view: IndieCategory, apps: DirectoryAppCard[]): DirectoryCounts {
  return {
    total: apps.length,
    main: apps.filter((app) => app.main).length,
    jobs: Object.fromEntries(view.jobs.map(([id]) => [id, apps.filter((app) => app.jobs.includes(id)).length])),
    free: {
      free: apps.filter((app) => app.free.kind === "free").length,
      selfhost: apps.filter((app) => app.free.kind === "selfhost").length,
      trial: apps.filter((app) => app.free.kind === "trial" || app.free.kind === "credits").length,
    },
    features: Object.fromEntries(view.signals.map(([cell, value]) => [cell, apps.filter((app) => cellMatches(app, cell, value)).length])),
  };
}

/** Every status event of the given apps, newest first. */
export function statusChanges(apps: Array<Pick<IndieAppCard, "name" | "slug" | "status">>): IndieChange[] {
  return apps
    .flatMap((app) => app.status.map((event) => ({ app: app.name, slug: app.slug, ...event })))
    .sort((a, b) => b.date.localeCompare(a.date) || a.app.localeCompare(b.app));
}

/** The cost set a card shows: the one for the chosen job, else the app's first priced set. */
export function costSetFor(view: IndieCategory, app: Pick<IndieAppCard, "jobs" | "costs">, job?: string) {
  const sets = Object.keys(view.sets);
  if (sets.length === 1) return sets[0];
  if (job && view.job_sets[job]) return view.job_sets[job];
  const priced = (set: string) => (app.costs[set] ?? []).some((row) => row.state !== "not_applicable");
  for (const appJob of app.jobs) {
    const set = view.job_sets[appJob];
    if (set && priced(set)) return set;
  }
  return sets.find(priced) ?? sets[0];
}

/** Valid size level per cost set; anything missing or out of range falls back to the set's default. */
export function costLevels(view: IndieCategory, chosen: Record<string, number | undefined> = {}) {
  const levels: Record<string, number> = {};
  for (const [key, set] of Object.entries(view.sets)) {
    const value = chosen[key];
    levels[key] = Number.isInteger(value) && (value as number) >= 0 && (value as number) < set.levels.length ? (value as number) : set.default;
  }
  return levels;
}

export function cardCost(view: IndieCategory, app: Pick<IndieAppCard, "jobs" | "costs">, levels: Record<string, number>, job?: string) {
  const set = costSetFor(view, app, job);
  const level = levels[set] ?? view.sets[set].default;
  return { set, level, row: app.costs[set]?.[level] };
}

export function filterApps<T extends DirectoryAppCard>(view: IndieCategory, apps: T[], filter: DirectoryFilter): T[] {
  const query = (filter.q ?? "").trim().toLowerCase();
  const job = view.jobs.some(([id]) => id === filter.job) ? filter.job : "";
  const free = filter.free ?? [];
  const signals = view.signals.filter(([cell]) => (filter.features ?? []).includes(cell));
  return apps.filter((app) => {
    if (query && !`${app.name} ${app.line}`.toLowerCase().includes(query)) return false;
    if (job && !app.jobs.includes(job)) return false;
    if (filter.mainOnly && !app.main) return false;
    if (free.length && !free.includes(freeGroup(app.free.kind))) return false;
    return signals.every(([cell, value]) => cellMatches(app, cell, value));
  });
}

export const sortOptions = [
  { label: "Lowest cost", value: "cost" },
  { label: "Name", value: "name" },
  { label: "Recently checked", value: "checked" },
] as const;
export type SortValue = (typeof sortOptions)[number]["value"];

export const freeOptions = [
  { label: "Free plan", value: "free" },
  { label: "Free to self-host", value: "selfhost" },
  { label: "Trial or credits", value: "trial" },
] as const;

/** First number in a price, for sorting. Unknown, quote-only, and "—" sort last. */
export function costNumber(value: string | undefined) {
  const match = value?.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

export function sortApps<T extends IndieAppCard>(view: IndieCategory, apps: T[], sort: string, levels: Record<string, number>, job?: string): T[] {
  const sorted = [...apps];
  if (sort === "name") return sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "checked") return sorted.sort((a, b) => b.checked.localeCompare(a.checked) || a.name.localeCompare(b.name));
  const order = Object.keys(view.sets);
  return sorted.sort((a, b) => {
    const left = cardCost(view, a, levels, job);
    const right = cardCost(view, b, levels, job);
    if (left.set !== right.set) return order.indexOf(left.set) - order.indexOf(right.set);
    const leftNa = !left.row || left.row.state === "not_applicable";
    const rightNa = !right.row || right.row.state === "not_applicable";
    if (leftNa !== rightNa) return leftNa ? 1 : -1;
    return costNumber(left.row?.v) - costNumber(right.row?.v) || a.name.localeCompare(b.name);
  });
}

/** The default view: no filters, default sizes, lowest cost first. */
export function defaultView<T extends IndieAppCard>(view: IndieCategory, apps: T[]): T[] {
  return sortApps(view, apps, "cost", costLevels(view));
}
