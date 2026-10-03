import registeredSitePages from "./registered-site-pages.json";

const staticPaths = new Set(registeredSitePages);
const directoryRoutes = registeredSitePages.filter(route => route.includes("["))
  .map(route => route.split("/"));
type PageAvailability = { is_published: boolean; page_family: string; has_page_content: boolean };

/** A registry row controls publication, but the release must also render it. */
export function sitePageAvailable(pathname: string, page: PageAvailability | null | undefined) {
  if (!page?.is_published) return false;
  const parts = pathname.split("/");
  const hasSource = staticPaths.has(pathname) || directoryRoutes.some(route =>
    (route.length > 2 || page.page_family === "catalog") && route.length === parts.length && route.every((part, index) =>
      /^\[[^.[\]]+\]$/.test(part) ? Boolean(parts[index]) : part === parts[index]));
  return hasSource && page.has_page_content;
}
