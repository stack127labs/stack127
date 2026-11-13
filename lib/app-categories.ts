import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getDirectoryAppIndex } from "./apps";
import { getTerminalApps, terminalAppCategories } from "./terminal-apps";
import { getPool } from "./db";
import { HOME_PAGES_TAG } from "./cache-tags";
import { countAppCategories, publishedAppCategories, type AppDirectory } from "./app-category-model";

// Every page event invalidates HOME_PAGES_TAG, including a child's publication change.
const getCategoryRegistry = unstable_cache(async () => (await getPool().query<{
  slug: string; is_published: boolean; page_family: string;
}>(`select slug,is_published,page_family from public.stack127_pages where page_family='directory'
  and is_published and (slug like 'self-host-apps/categories/%' or slug like 'cli-apps/categories/%')`)).rows,
["app-category-registry"], { revalidate: false, tags: [HOME_PAGES_TAG] });

export const getAppCategoryLinks = cache(async (directory: AppDirectory) => {
  const pages = await getCategoryRegistry();
  if (directory === "cli-apps") {
    const apps = await getTerminalApps();
    return publishedAppCategories(directory, countAppCategories(apps, terminalAppCategories, app => app.categories), pages);
  }
  const apps = await getDirectoryAppIndex();
  const categories = [...new Map(apps.flatMap(app => app.categories).map(category => [category.slug, category])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  return publishedAppCategories(directory, countAppCategories(apps, categories, app => app.categories.map(category => category.slug)), pages);
});
