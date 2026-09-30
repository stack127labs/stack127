import registeredSitePages from "./registered-site-pages.json";

const staticPaths = new Set(registeredSitePages);
type PageAvailability = { is_published: boolean; page_family: string; has_tool_content: boolean; has_catalog_content: boolean };

/** A registry row controls publication, but the release must also render it. */
export function sitePageAvailable(pathname: string, page: PageAvailability | null | undefined) {
  if (!page?.is_published) return false;
  const hasSource = staticPaths.has(pathname) ||
    (page.page_family === "catalog" && pathname.split("/").filter(Boolean).length === 1 && page.has_catalog_content);
  return hasSource && (page.page_family !== "tool" || page.has_tool_content);
}
