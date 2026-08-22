/** Curated collection, course, reference, and utility pages shown by the home surface. */
export const homePageSlugs = [
  "about",
  "cli-apps",
  "dns-tools",
  "dockerignore-tester",
  "domain-tools",
  "home-assistant-energy-entity-checker",
  "keyboard-shortcuts",
  "labs",
  "nfs-firewall-rules",
  "nginx-proxy-pass-calculator",
  "privacy",
  "self-host-apps",
  "self-hosting-for-beginners",
  "software-licenses-for-self-hosting",
  "storage-tools",
  "terms",
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
