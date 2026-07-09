/** Root-level pages only: not home, not child routes. */
export function isMainPageSlug(slug: string) {
  return slug !== "" && !slug.includes("/");
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
