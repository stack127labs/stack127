import type { LaunchDirectory } from "./launch-directories";

export const LAUNCH_DIRECTORY_PAGE_SIZE = 24;

export type LaunchDirectoryQuery = {
  q?: string;
  categories?: string[];
  costs?: string[];
  links?: string[];
  submission?: string;
  sort?: string;
  page?: string | number;
  pageSize?: number;
};

function searchable(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Each filter group is an alternative; different groups narrow the same result. */
export function filterLaunchDirectories(
  directories: LaunchDirectory[],
  query: LaunchDirectoryQuery,
  categoryLabels: Record<string, string> = {},
) {
  const search = searchable(query.q ?? "");
  return directories.filter((directory) => {
    const haystack = searchable([
      directory.name, directory.slug, directory.website_url, directory.summary,
      directory.best_for, directory.eligibility_label,
      ...directory.categories.map((category) => categoryLabels[category] ?? category.replaceAll("-", " ")),
    ].join(" "));
    const verified = directory.submission_status === "verified" && Boolean(directory.submit_url);
    return (!search || haystack.includes(search))
      && (!query.categories?.length || query.categories.some((category) => directory.categories.includes(category)))
      && (!query.costs?.length || query.costs.includes(directory.cost_kind))
      && (!query.links?.length || query.links.includes(directory.link_type_kind))
      && (query.submission !== "verified" || verified)
      && (query.submission !== "unverified" || !verified);
  });
}

export function sortLaunchDirectories(directories: LaunchDirectory[], sort = "ready") {
  return [...directories].sort((left, right) => {
    if (sort !== "name") {
      const ready = (directory: LaunchDirectory) => Number(directory.submission_status === "verified" && Boolean(directory.submit_url));
      const availability = ready(right) - ready(left);
      if (availability) return availability;
      const knownCost = Number(right.cost_kind !== "unknown") - Number(left.cost_kind !== "unknown");
      if (knownCost) return knownCost;
    }
    return left.name.localeCompare(right.name, "en", { sensitivity: "base" }) || left.slug.localeCompare(right.slug, "en");
  });
}

export function paginateLaunchDirectories(directories: LaunchDirectory[], page: string | number = 1, pageSize = LAUNCH_DIRECTORY_PAGE_SIZE) {
  const size = Number.isSafeInteger(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : LAUNCH_DIRECTORY_PAGE_SIZE;
  const requested = typeof page === "number" ? page : /^\d+$/.test(page) ? Number(page) : 1;
  const total = directories.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const currentPage = Math.min(totalPages, Number.isSafeInteger(requested) && requested > 0 ? requested : 1);
  const offset = (currentPage - 1) * size;
  return {
    items: directories.slice(offset, offset + size),
    total, totalPages, currentPage,
    start: total ? offset + 1 : 0,
    end: Math.min(total, offset + size),
  };
}

export function queryLaunchDirectories(directories: LaunchDirectory[], query: LaunchDirectoryQuery = {}, categoryLabels: Record<string, string> = {}) {
  return paginateLaunchDirectories(sortLaunchDirectories(filterLaunchDirectories(directories, query, categoryLabels), query.sort), query.page, query.pageSize);
}
