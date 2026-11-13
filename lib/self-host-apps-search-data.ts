import {
  getDirectoryAppIndex, getDirectoryAppsBySlugs,
  loadDirectoryAppIndex, loadDirectoryAppsBySlugs,
} from "./apps";
import {
  selectSelfHostApps, selfHostAppsFacets,
  type SelfHostAppsSearchParams, type SelfHostAppsSearchResponse,
} from "./self-host-apps-search";

async function search(
  params: SelfHostAppsSearchParams,
  loadIndex: typeof getDirectoryAppIndex,
  loadDetails: typeof getDirectoryAppsBySlugs,
  missing: "fail" | "drop" = "fail",
): Promise<{ response: SelfHostAppsSearchResponse; complete: boolean }> {
  const index = await loadIndex();
  const results = selectSelfHostApps(index, params);
  const details = await loadDetails(results.apps.map(app => app.slug));
  const bySlug = new Map(details.map(app => [app.slug, app]));
  const apps = results.apps.filter(app => {
    if (bySlug.has(app.slug)) return true;
    if (missing === "fail") throw new Error(`Missing search detail: ${app.slug}`);
    return false;
  });
  // A page with nothing left would look like "no matches" and hide the other pages, so fail and let the reader retry.
  if (results.apps.length > 0 && apps.length === 0) throw new Error("Missing search details for every app on the page.");
  const detailApps = apps.map(app => bySlug.get(app.slug)!);
  return {
    response: { ...results, apps, detailApps, facets: selfHostAppsFacets(index, params.category) },
    complete: apps.length === results.apps.length,
  };
}

export const getSelfHostAppsSearch = (params: SelfHostAppsSearchParams) =>
  search(params, getDirectoryAppIndex, getDirectoryAppsBySlugs).then(result => result.response);

/**
 * For the public API. An app retired moments ago can still be in the cached
 * index while its details are gone. The API leaves that app out and reports
 * the result as incomplete, so one retired app does not fail every search
 * that would have shown it. Pages and cache verification still fail loudly.
 */
export const getSelfHostAppsSearchForApi = (params: SelfHostAppsSearchParams) =>
  search(params, getDirectoryAppIndex, getDirectoryAppsBySlugs, "drop");

export const loadSelfHostAppsSearch = (params: SelfHostAppsSearchParams) =>
  search(params, loadDirectoryAppIndex, loadDirectoryAppsBySlugs).then(result => result.response);
