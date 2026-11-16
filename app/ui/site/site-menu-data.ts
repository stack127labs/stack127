import { cache } from "react";
import { unstable_cache } from "next/cache";
import { directoryCardCounts } from "@/app/(site)/(directories)/card-counts";
import { labProjects } from "@/app/(site)/(site-pages)/labs/projects";
import type { PageCardCount } from "@/app/ui/cards/page-card";
import {
  AD_NETWORKS_TAG,
  CLI_APPS_TAG,
  COURSE_PAGES_TAG,
  HOME_PAGES_TAG,
  LAUNCH_DIRECTORIES_TAG,
  PLATFORM_FEES_TAG,
  SELF_HOST_INDEX_TAG,
  SITEMAP_TAG,
  TOOL_CATALOGS_TAG,
} from "@/lib/cache-tags";
import { getCourse } from "@/lib/course-pages";
import { getMainPublishedPages, isHomeFeaturePage, isHomeVisiblePage, type Stack127Page } from "@/lib/page-registry";
import { buildSiteMenus, type SiteMenus } from "@/lib/site-menus";
import { getPublishedToolCatalog, getPublishedToolCatalogs } from "@/lib/tool-catalogs";

/** The home feature cards' counts: course lessons, Labs projects, or the directory's own counts. */
export async function homeFeatureCounts(page: Stack127Page): Promise<PageCardCount[]> {
  if (page.page_family === "course") {
    const course = await getCourse(page.slug);
    if (!course) throw new Error(`Course is missing for published page ${page.slug}`);
    return [{ label: "lessons", value: course.lessons.filter((lesson) => lesson.published).length }];
  }
  if (page.slug === "labs") return [{ label: "projects", value: labProjects.length }];
  return directoryCardCounts(page.slug);
}

/** The published home feature pages and their counts, in home card order. */
export async function getHomeFeaturePages() {
  const pages = (await getMainPublishedPages()).filter((page) => isHomeVisiblePage(page) && isHomeFeaturePage(page));
  const counts = await Promise.all(pages.map(homeFeatureCounts));
  return pages.map((page, index) => ({ page, counts: counts[index] }));
}

/**
 * One cached entry for /site-menus.json, outside the shared layout.
 * The tags are the ones the home cards and the
 * catalog sidebars use; a page, card, or directory record event refreshes it.
 * Inner caches are bypassed while this entry rebuilds, so their tags are listed here.
 */
const loadSiteMenus = unstable_cache(async (): Promise<SiteMenus> => {
  const [catalogs, features] = await Promise.all([getPublishedToolCatalogs(), getHomeFeaturePages()]);
  const catalogTools = await Promise.all(catalogs.map((catalog) => getPublishedToolCatalog(catalog.page.slug)));
  return buildSiteMenus({
    catalogs: catalogs.map((catalog) => ({
      slug: catalog.page.slug,
      name: catalog.card_name,
      iconKey: catalog.card_icon_key,
      toolCount: catalog.tool_count,
    })),
    features: features.map(({ page, counts }) => ({
      slug: page.slug,
      family: page.page_family,
      name: page.card_name,
      iconKey: page.card_icon_key ?? page.slug,
      counts,
    })),
    toolSlugs: catalogTools.flatMap((catalog) => catalog?.tools.map((tool) => tool.slug) ?? []),
  });
}, ["stack127-site-menus"], {
  revalidate: false,
  tags: [
    HOME_PAGES_TAG,
    TOOL_CATALOGS_TAG,
    SITEMAP_TAG,
    COURSE_PAGES_TAG,
    SELF_HOST_INDEX_TAG,
    CLI_APPS_TAG,
    AD_NETWORKS_TAG,
    LAUNCH_DIRECTORIES_TAG,
    PLATFORM_FEES_TAG,
  ],
});

export const getSiteMenus = cache(loadSiteMenus);
