import { cache } from "react";
import { getExactPublishedPage, pathFromSlug } from "./page-registry";
import { getPrimaryToolCatalog } from "./tool-catalogs";

/** One step in a page's trail. Sections are the site's top-level areas and show lowercase, like the main menu. */
export type Breadcrumb = { name: string; href: string; section: boolean };

const home: Breadcrumb = { name: "stack127", href: "/", section: true };

/**
 * stack127, each published parent path, then the page. The registry label names each step,
 * unless the page passes a shorter name for itself, such as an app name. Home has no trail.
 */
export const getBreadcrumbs = cache(async (slug: string, current?: string): Promise<Breadcrumb[]> => {
  if (!slug) return [];
  const parts = slug.split("/");
  const trail: Breadcrumb[] = [home];
  for (let depth = 1; depth < parts.length; depth += 1) {
    const parentSlug = parts.slice(0, depth).join("/");
    const parent = await getExactPublishedPage(parentSlug);
    if (parent) trail.push({ name: parent.label, href: pathFromSlug(parentSlug), section: depth === 1 && parent.page_family !== "site" });
  }
  const page = await getExactPublishedPage(slug);
  const topLevel = parts.length === 1;
  trail.push({
    name: current ?? page?.label ?? parts.at(-1)!,
    href: pathFromSlug(slug),
    section: !current && topLevel && page?.page_family !== "tool" && page?.page_family !== "site",
  });
  return trail;
});

/** A tool sits under its primary catalog: stack127 / domain tools / Domain age checker. */
export const getToolBreadcrumbs = cache(async (toolPageId: number | string, slug: string, name: string): Promise<Breadcrumb[]> => {
  const catalog = await getPrimaryToolCatalog(toolPageId);
  return [
    home,
    ...(catalog ? [{ name: catalog.page.label, href: pathFromSlug(catalog.page.slug), section: true }] : []),
    { name, href: pathFromSlug(slug), section: false },
  ];
});
