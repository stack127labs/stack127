export type RegistryPublicationPage = { is_published: boolean; is_indexable: boolean };

export type RegistryPublicationState<Page extends RegistryPublicationPage> =
  | { kind: "exact"; index: boolean; page: Page; pathname: string; slug: string }
  | { kind: "child"; index: false; page: Page; parentSlug: string; pathname: string; slug: string }
  | { kind: "missing"; pathname: string; slug: string };

/** Publication controls access. Indexability controls search and the sitemap. */
export function isIndexablePage(page: RegistryPublicationPage) {
  return page.is_published && page.is_indexable;
}

export async function resolvePagePublicationState<Page extends RegistryPublicationPage>(
  pathname: string,
  readPage: (slug: string) => Promise<Page | null>,
): Promise<RegistryPublicationState<Page>> {
  const pathOnly = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const cleaned = `/${pathOnly}`.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
  const slug = cleaned === "/" ? "" : decodeURIComponent(cleaned.slice(1));
  const missing = { kind: "missing" as const, pathname: cleaned, slug };
  const exact = await readPage(slug);
  if (exact) {
    return exact.is_published
      ? { kind: "exact", index: isIndexablePage(exact), page: exact, pathname: cleaned, slug }
      : missing;
  }
  const parts = slug.split("/").filter(Boolean);
  for (let index = parts.length - 1; index > 0; index -= 1) {
    const parentSlug = parts.slice(0, index).join("/");
    const parent = await readPage(parentSlug);
    if (parent) {
      return parent.is_published
        ? { kind: "child", index: false, page: parent, parentSlug, pathname: cleaned, slug }
        : missing;
    }
  }
  return missing;
}

/** Curated collection, course, reference, and utility pages shown on the homepage. */
export const homePageSlugs = [
  "about",
  "ad-networks",
  "cli-apps",
  "epp-status-codes",
  "keyboard-shortcuts",
  "labs",
  "launch-directories",
  "platform-fees",
  "privacy",
  "self-host-apps",
  "self-hosting-for-beginners",
  "software-licenses-for-self-hosting",
  "terms",
  "tld-directory",
] as const;

const homePageSlugSet = new Set<string>(homePageSlugs);

export function isHomePageSlug(slug: string) {
  return homePageSlugSet.has(slug);
}

/** Compatibility name for callers that mean a curated home-level page. */
export const isMainPageSlug = isHomePageSlug;

/** Keep retired Immich pages out of home navigation and feature cards if stale registry rows remain. */
export function isHomeVisiblePage(page: { slug: string; label?: string; meta_title?: string }) {
  if (!isHomePageSlug(page.slug)) return false;
  const identity = [page.slug, page.label, page.meta_title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return !identity.includes("immich");
}

const homeUtilityPageTypes = new Set([
  "AboutPage",
  "PrivacyPolicy",
  "TermsOfService",
]);

/** Main product/reference pages that belong in home feature cards. */
export function isHomeFeaturePage(page: { slug: string; page_type: string }) {
  return isHomePageSlug(page.slug) && !homeUtilityPageTypes.has(page.page_type);
}
