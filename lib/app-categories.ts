import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getDirectoryAppIndex } from "./apps";
import { getTerminalApps, terminalAppCategories } from "./terminal-apps";
import { getPool } from "./db";
import { HOME_PAGES_TAG, SELF_HOST_INDEX_TAG } from "./cache-tags";
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

export type SelfHostCategoryApp = {
  name: string; summary: string; href: string | null; license: string | null;
  source_model: string; maintenance_status: string; docker_support: string; ram_min_mb: number | null;
};

// No details, images, hidden panels, or client props. One lean cached query per category.
export const getSelfHostCategoryApps = unstable_cache(async (slug: string): Promise<SelfHostCategoryApp[]> => {
  const result = await getPool().query<SelfHostCategoryApp & { popularity_score: number }>(`select app.name,app.summary,app.popularity_score::float8 as popularity_score,
    coalesce(app.source_code_url,app.website_url) as href,coalesce(app.license_spdx_id,app.license) as license,
    app.source_model,app.maintenance_status,app.docker_support,app.ram_min_mb
    from public.self_host_apps app
    where app.published and app.self_hosting_status='self_hostable' and exists (
      select 1 from public.self_host_app_category_links link join public.self_host_app_categories category on category.id=link.category_id
      where link.app_id=app.id and category.slug=$1)
    order by app.popularity_score desc, app.name asc`, [slug]);
  // Match the hub's locale-aware name tie-break, rather than database collation.
  return result.rows.sort((a, b) => b.popularity_score - a.popularity_score || a.name.localeCompare(b.name));
}, ["self-host-category-apps"], { revalidate: false, tags: [SELF_HOST_INDEX_TAG] });
