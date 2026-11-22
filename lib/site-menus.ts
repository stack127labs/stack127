/** Top bar menus: which rows each menu shows and which menu the current page belongs to. */

export type SiteMenuSection = "tools" | "directories";

export type SiteMenuItem = {
  href: string;
  label: string;
  iconKey: string | null;
  /** The card's first count, such as tools, apps, or lessons. */
  count: number | null;
};

export type SiteMenus = {
  tools: SiteMenuItem[];
  directories: SiteMenuItem[];
  /** The course and Labs, shown below a divider in the directories menu. */
  more: SiteMenuItem[];
  /** Exact catalog and tool paths that mark the tools menu. */
  toolPaths: string[];
  /** Paths whose page and children mark the directories menu. */
  directoryPaths: string[];
};

type CatalogSource = { slug: string; name: string; iconKey: string | null; toolCount: number };
type FeatureSource = {
  slug: string;
  family: string;
  name: string;
  iconKey: string | null;
  counts: Array<{ value: number }>;
};

const path = (slug: string) => `/${slug}`;

/** Splits the home feature pages like the home cards: directories first, then the course and Labs. */
export function buildSiteMenus({ catalogs, features, toolSlugs }: {
  catalogs: CatalogSource[];
  features: FeatureSource[];
  toolSlugs: string[];
}): SiteMenus {
  const featureItem = (page: FeatureSource): SiteMenuItem => ({
    href: path(page.slug),
    label: page.name.toLowerCase(),
    iconKey: page.iconKey,
    count: page.counts[0]?.value ?? null,
  });
  const isMore = (page: FeatureSource) => page.family === "course" || page.slug === "labs";

  return {
    tools: catalogs.map((catalog) => ({
      href: path(catalog.slug),
      label: catalog.name.toLowerCase(),
      iconKey: catalog.iconKey,
      count: catalog.toolCount,
    })),
    directories: features.filter((page) => !isMore(page)).map(featureItem),
    more: features.filter(isMore).map(featureItem),
    toolPaths: [...new Set([...catalogs.map((catalog) => catalog.slug), ...toolSlugs])].map(path).sort(),
    directoryPaths: features.map((page) => path(page.slug)),
  };
}

function cleanPath(pathname: string) {
  const pathOnly = pathname.split(/[?#]/)[0] || "/";
  return pathOnly.replace(/\/{2,}/g, "/").replace(/(.)\/$/, "$1");
}

/** The menu that holds the current page: catalogs and tools, or directories and their child pages. */
export function siteMenuSection(
  pathname: string,
  menus: Pick<SiteMenus, "toolPaths" | "directoryPaths">,
): SiteMenuSection | null {
  const current = cleanPath(pathname);
  if (menus.toolPaths.includes(current)) return "tools";
  if (menus.directoryPaths.some((base) => current === base || current.startsWith(`${base}/`))) return "directories";
  return null;
}

/** Keep one request in memory, including its result. Failed requests can retry. */
export function createSiteMenusLoader(fetchMenus: () => Promise<SiteMenus>) {
  let request: Promise<SiteMenus> | null = null;
  return () => {
    request ??= fetchMenus().catch((error) => {
      request = null;
      throw error;
    });
    return request;
  };
}
