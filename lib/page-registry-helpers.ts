/** Root-level pages only: not home, not child routes. */
export function isMainPageSlug(slug: string) {
  return slug !== "" && !slug.includes("/");
}

/** Keep retired Immich pages out of home navigation and feature cards if stale registry rows remain. */
export function isHomeVisiblePage(page: { slug: string; label?: string; meta_title?: string }) {
  if (!isMainPageSlug(page.slug)) return false;
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
  return isMainPageSlug(page.slug) && !homeUtilityPageTypes.has(page.page_type);
}
