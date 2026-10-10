import { cache } from "react";
import { getExactPublishedPage, pathFromSlug, type Stack127Page } from "./page-registry";
import { getPrimaryToolCatalog } from "./tool-catalogs";
import { courseLessonHref, type CourseDefinition, type CourseLesson } from "./courses";
import { directoryTitleParts } from "./directory-page-content";

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

/** Course headings and registry JSON-LD share the course title and lesson's sidebar name. */
export function buildCourseBreadcrumbs(course: CourseDefinition, lesson: CourseLesson) {
  return [
    { name: home.name, path: home.href },
    { name: directoryTitleParts(course.title).map(part => part.text).join(""), path: course.basePath },
    ...(lesson.slug ? [{ name: lesson.sidebarLabel, path: courseLessonHref(course, lesson) }] : []),
  ];
}

/** Resolve the same trail as the page header without relying on route-owned structured data. */
export const getPageBreadcrumbs = cache(async (page: Stack127Page): Promise<Breadcrumb[]> => {
  if (!page.slug) return [];
  if (page.page_family === "tool") {
    const { getRequiredToolPage } = await import("./tool-pages");
    const tool = await getRequiredToolPage(page.slug);
    return getToolBreadcrumbs(page.id, page.slug, tool.card_name);
  }
  if (page.page_family === "course") {
    const { getRequiredCourse } = await import("./course-pages");
    const courseSlug = page.slug.split("/")[0];
    const course = await getRequiredCourse(courseSlug);
    const lesson = course.lessons.find(entry => entry.slug === page.slug.slice(courseSlug.length + 1));
    if (!lesson?.published) throw new Error(`Published course lesson is missing: ${page.slug}`);
    return buildCourseBreadcrumbs(course, lesson).map((crumb, index) => ({
      name: crumb.name, href: crumb.path, section: index < 2,
    }));
  }
  if (page.slug.startsWith("keyboard-shortcuts/")) {
    const { loadShortcutApp } = await import("./shortcuts/index");
    const app = await loadShortcutApp(page.slug.slice("keyboard-shortcuts/".length));
    if (!app) throw new Error(`Published shortcut app is missing: ${page.slug}`);
    return getBreadcrumbs(page.slug, app.name);
  }
  return getBreadcrumbs(page.slug);
});
