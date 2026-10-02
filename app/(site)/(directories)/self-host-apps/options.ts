import type { DirectoryFilterOption as FilterOption } from "@/app/ui/directories/directory-filters";
import type { DirectoryParams } from "@/app/ui/directories/directory-params";
import type { SelfHostAppsSearchFacets } from "@/lib/self-host-apps-search";

export const route = "/self-host-apps";

export const dockerOptions: FilterOption[] = [
  { label: "Has Docker support", value: "supported" },
];

export const sourceOptions: FilterOption[] = [
  { label: "Open source", value: "open_source" },
  { label: "Source available", value: "source_available" },
  { label: "Closed source", value: "closed_source" },
  { label: "Not verified", value: "unknown" },
];

export const ramOptions: FilterOption[] = [
  { label: "Under 1GB", value: "under 1gb" },
  { label: "Up to 2GB", value: "1-2gb" },
  { label: "Up to 4GB", value: "2-4gb" },
  { label: "4GB+ ok", value: "4gb+" },
];

export const storageOptions: FilterOption[] = [
  { label: "Tiny", value: "tiny" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Depends", value: "depends" },
];

export const maintenanceOptions: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Slow", value: "slow" },
  { label: "Stale", value: "stale" },
  { label: "Archived", value: "archived" },
  { label: "Not verified", value: "unknown" },
];

export const signalOptions: FilterOption[] = [
  { label: "Has mobile app", value: "mobile" },
  { label: "Needs database", value: "database" },
  { label: "Compose ready", value: "compose" },
];

export const sortOptions: FilterOption[] = [
  { label: "Most popular", value: "popular" },
  { label: "Name", value: "name" },
  { label: "Lowest RAM", value: "lowest-ram" },
  { label: "Healthiest", value: "healthy" },
];

export const defaultSort = "popular";

const values = (options: FilterOption[]) => options.map((option) => option.value);

// The keys the search API accepts, in a fixed order so equal views share one cached response.
function allowedValues(facets: SelfHostAppsSearchFacets): Array<[key: string, allowed: string[], multiple: boolean]> {
  return [
    ["sort", values(sortOptions), false],
    ["category", values(facets.categories), true],
    ["license", values(facets.licenses), true],
    ["source", values(sourceOptions), true],
    ["docker", values(dockerOptions), true],
    ["install", values(facets.installMethods), true],
    ["ram", values(ramOptions), false],
    ["storage", values(storageOptions), false],
    ["maintenance", values(maintenanceOptions), true],
    ["signal", values(signalOptions), true],
  ];
}

function list(params: DirectoryParams, key: string) {
  const value = params[key];
  return (Array.isArray(value) ? value : value ? [value] : []).map((item) => item.trim()).filter(Boolean);
}

/**
 * The URL view as a clean set of parameters. Unknown keys, tracking tags, and
 * values that are no longer offered are dropped, as the server page used to do,
 * so old shared links still open. Empty when the URL shows the default view.
 */
export function cleanParams(params: DirectoryParams, facets: SelfHostAppsSearchFacets): DirectoryParams {
  const clean: DirectoryParams = {};
  const q = list(params, "q")[0]?.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200);
  if (q) clean.q = q;

  for (const [key, allowed, multiple] of allowedValues(facets)) {
    const picked = [...new Set(list(params, key).filter((value) => allowed.includes(value)))].sort();
    if (key === "sort" && picked[0] === defaultSort) continue;
    if (picked.length === 0) continue;
    clean[key] = multiple ? picked : picked[0];
  }

  const page = Number(list(params, "page")[0]);
  if (Number.isSafeInteger(page) && page > 1) clean.page = String(page);
  return clean;
}

export function searchQuery(params: DirectoryParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : value ? [value] : []) query.append(key, item);
  }
  return query.toString();
}
