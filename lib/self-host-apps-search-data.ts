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
): Promise<SelfHostAppsSearchResponse> {
  const index = await loadIndex();
  const results = selectSelfHostApps(index, params);
  const details = await loadDetails(results.apps.map(app => app.slug));
  const bySlug = new Map(details.map(app => [app.slug, app]));
  const detailApps = results.apps.map(app => {
    const detail = bySlug.get(app.slug);
    if (!detail) throw new Error(`Missing search detail: ${app.slug}`);
    return detail;
  });
  return { ...results, detailApps, facets: selfHostAppsFacets(index) };
}

export const getSelfHostAppsSearch = (params: SelfHostAppsSearchParams) =>
  search(params, getDirectoryAppIndex, getDirectoryAppsBySlugs);

export const loadSelfHostAppsSearch = (params: SelfHostAppsSearchParams) =>
  search(params, loadDirectoryAppIndex, loadDirectoryAppsBySlugs);
