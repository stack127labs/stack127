import type { PageCardCount } from "@/app/ui/cards/page-card";
import { appDirectorySlugs, getAppDirectoryData } from "@/lib/indie-hacker-apps";

/** Home and menu counts of one app directory: its apps, including the ones that also do its job. */
export async function appDirectoryCardCounts(slug: string): Promise<PageCardCount[]> {
  const { apps } = await getAppDirectoryData(slug);
  return [{ label: "apps", value: apps.length }];
}

export const appDirectoryCardCountLoaders = Object.fromEntries(
  appDirectorySlugs.map((slug) => [slug, () => appDirectoryCardCounts(slug)]),
);
