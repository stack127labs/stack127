import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { INDIE_HACKER_APPS_TAG } from "../cache-tags";
import { getPool } from "../db";
import {
  directoryCards,
  directoryCounts,
  directoryFlags,
  getAppDirectoryView,
  inDirectory,
  indieAppsCategoryTag,
  statusChanges,
  type AppDirectory,
  type DirectoryApp,
  type DirectoryAppCard,
  type DirectoryCounts,
  type IndieApp,
  type IndieAppCard,
  type IndieCategory,
  type IndieChange,
} from "./model";

export * from "./model";

// App records live in public.indie_hacker_apps, written by scripts/indie-hacker-apps/import-apps.mjs.
// Each research category is one cache entry for the cards (under 300 KB) and one per app
// for the side panel facts (a whole category is 3 to 6 MB, over the 2 MB cache limit).
// The table triggers queue an indie_hacker_apps event per changed directory; the cache
// worker revalidates the category tag (scripts/stack127/cache/targets.mjs).

const CARD_COLUMNS = `slug, name, url, jobs, line, free_kind, free_text, cells, costs, status,
  coalesce(to_char(checked, 'YYYY-MM-DD'), '') as checked, icon`;

type CardRow = Omit<IndieAppCard, "free"> & { free_kind: IndieAppCard["free"]["kind"]; free_text: string };
type AppRow = CardRow & Pick<IndieApp, "news" | "sections">;

const toCard = ({ free_kind, free_text, ...row }: CardRow): IndieAppCard => ({ ...row, free: { kind: free_kind, text: free_text } });

const cacheOptions = (category: string) => ({ revalidate: false as const, tags: [INDIE_HACKER_APPS_TAG, indieAppsCategoryTag(category)] });

/** Every app card in one research category, by slug, read from the database. */
async function loadCategoryCards(category: string): Promise<IndieAppCard[]> {
  const result = await getPool().query<CardRow>(
    `select ${CARD_COLUMNS} from public.indie_hacker_apps where category = $1 order by slug`,
    [category],
  );
  return result.rows.map(toCard);
}

const getCategoryCards = cache((category: string) => unstable_cache(
  () => loadCategoryCards(category), ["indie-hacker-apps-cards", category], cacheOptions(category))());

/** One app's card and panel facts, or null. */
const getCategoryApp = cache((category: string, slug: string) => unstable_cache(async (): Promise<IndieApp | null> => {
  const result = await getPool().query<AppRow>(
    `select ${CARD_COLUMNS}, news, sections from public.indie_hacker_apps where category = $1 and slug = $2`,
    [category, slug],
  );
  const row = result.rows[0];
  if (!row) return null;
  const { news, sections, ...card } = row;
  return { ...toCard(card), news, sections };
}, ["indie-hacker-apps-app", category, slug], cacheOptions(category))());

export type AppDirectoryData = {
  directory: AppDirectory;
  /** The category as this directory sees it: only its jobs and cost sets. Pass it to the logic helpers. */
  view: IndieCategory;
  /** The directory's apps, by slug, each with `main` and `mainJob`. */
  apps: DirectoryAppCard[];
  counts: DirectoryCounts;
  /** Status events of the directory's apps, newest first. */
  changes: IndieChange[];
};

/**
 * Cards, counts and recent changes for one directory. Throws for an unknown slug, a failed
 * load, or a directory with no apps (the import has not run), so no error page is cached.
 * Check the page is published before calling it.
 */
export const getAppDirectoryData = cache(async (slug: string): Promise<AppDirectoryData> => {
  const { directory, category, view } = getAppDirectoryView(slug);
  const apps = directoryCards(category, directory, await getCategoryCards(directory.category));
  if (!apps.length) throw new Error(`App directory ${slug} has no apps. Run scripts/indie-hacker-apps/import-apps.mjs.`);
  return { directory, view, apps, counts: directoryCounts(view, apps), changes: statusChanges(apps) };
});

/**
 * The body of /api/app-directories/<slug>/index, read past the cache. /api/cache/refresh
 * compares the served index with it.
 */
export async function loadAppDirectoryIndex(slug: string): Promise<DirectoryAppCard[]> {
  const { directory, category } = getAppDirectoryView(slug);
  return directoryCards(category, directory, await loadCategoryCards(directory.category));
}

/** Slugs of the directory's apps. Empty when nothing is imported; never throws for that. */
export async function listAppDirectoryAppSlugs(slug: string): Promise<string[]> {
  const { directory } = getAppDirectoryView(slug);
  return (await getCategoryCards(directory.category)).filter((card) => inDirectory(directory, card.jobs)).map((card) => card.slug);
}

/** One app's side panel data in a directory, or undefined when the app is not listed there. */
export async function getAppDirectoryApp(directorySlug: string, appSlug: string): Promise<DirectoryApp | undefined> {
  const { directory, category } = getAppDirectoryView(directorySlug);
  const app = await getCategoryApp(directory.category, appSlug);
  if (!app || !inDirectory(directory, app.jobs)) return undefined;
  return { ...app, ...directoryFlags(category, directory, app.jobs) };
}

/** Side panel data for several apps, in the given order. Throws if one is not listed. */
export async function getAppDirectoryApps(directorySlug: string, appSlugs: string[]): Promise<DirectoryApp[]> {
  return Promise.all(appSlugs.map(async (appSlug) => {
    const app = await getAppDirectoryApp(directorySlug, appSlug);
    if (!app) throw new Error(`App ${appSlug} is not listed in ${directorySlug}`);
    return app;
  }));
}
