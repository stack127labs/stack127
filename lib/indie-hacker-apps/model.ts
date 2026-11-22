// Shared by the server pages and the browser views. No server-only imports here.
import categoriesFile from "./categories.json";
import { getAppDirectory, type AppDirectory } from "./directories";
import { directoryCategory } from "./logic";
import type { IndieAppCard, IndieCategory, FactState } from "./types";

export * from "./types";
export * from "./directories";
export * from "./logic";

export const indieCategories = (categoriesFile as unknown as { categories: IndieCategory[] }).categories;

export function getIndieCategory(slug: string) {
  return indieCategories.find((category) => category.slug === slug);
}

/** The directory and its category view (only its jobs and cost sets). Throws for an unknown slug. */
export function getAppDirectoryView(slug: string): { directory: AppDirectory; category: IndieCategory; view: IndieCategory } {
  const directory = getAppDirectory(slug);
  if (!directory) throw new Error(`Unknown app directory: ${slug}`);
  const category = getIndieCategory(directory.category);
  if (!category) throw new Error(`App directory ${slug} uses unknown category ${directory.category}`);
  return { directory, category, view: directoryCategory(category, directory) };
}

export const appDirectoryPath = (slug: string) => `/${slug}`;

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

/** Size param per cost set, e.g. ?size_subs=1. */
export const sizeParam = (set: string) => `size_${set}`;
