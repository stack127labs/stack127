import "server-only";
import { DIRECTORY_PAGES_TAG, INDIE_HACKER_APPS_TAG, PAGE_REGISTRY_TAG } from "@/lib/cache-tags";
import { getPublishedDirectoryPage } from "@/lib/directory-pages";
import { appDirectories, getAppDirectoryData, indieAppsCategoryTag } from "@/lib/indie-hacker-apps";

/** The heading the 12 app directories share in the directories menu and on the home page. */
export const appStackGroup = { name: "For your app's stack", iconKey: "layers" } as const;

export type AppStackPage = { slug: string; name: string; iconKey: string | null; apps: number };

/**
 * The published app directories, in table order, with their app counts. An unpublished
 * directory is left out before its app data loads, so production stays quiet until they go live.
 */
export async function getAppStackPages(): Promise<AppStackPage[]> {
  const pages = await Promise.all(appDirectories.map((directory) => getPublishedDirectoryPage(directory.slug)));
  const published = pages.filter((page) => page !== null);
  const data = await Promise.all(published.map((page) => getAppDirectoryData(page.slug)));
  return published.map((page, index) => ({
    slug: page.slug,
    name: page.card_name,
    iconKey: page.card_icon_key,
    apps: data[index].apps.length,
  }));
}

/** Cache tags of everything getAppStackPages reads, for an outer cache entry. */
export const appStackCacheTags = [...new Set([
  INDIE_HACKER_APPS_TAG,
  ...appDirectories.map((directory) => indieAppsCategoryTag(directory.category)),
  ...appDirectories.flatMap(({ slug }) => [`${DIRECTORY_PAGES_TAG}:${slug}`, `${PAGE_REGISTRY_TAG}:${slug}`]),
])];
