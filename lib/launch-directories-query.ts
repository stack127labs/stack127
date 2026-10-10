import type { LaunchDirectory } from "./launch-directories";

export const LAUNCH_DIRECTORY_PAGE_SIZE = 24;

// A short editorial pick of the launch sites most makers start with.
const recommendedPins = new Map([
  ["product-hunt", 0], ["betalist", 1], ["devhunt", 2],
  ["peerlist-launchpad", 3], ["alternativeto", 4], ["saashub", 5],
]);
const categoryTiers = new Map([
  ["launch-boards", 0], ["prelaunch-beta", 0],
  ["startup-software", 1], ["software-reviews-alternatives", 1],
  ["ai-tools", 2], ["developer-open-source", 2],
  ["design-nocode-creator", 2], ["specialist-regional", 2],
]);
const costRanks: Record<LaunchDirectory["cost_kind"], number> = {
  free: 0, free_and_paid: 0, paid: 1, unknown: 2,
};
const linkRanks: Record<LaunchDirectory["link_type_kind"], number> = {
  dofollow: 0, varies: 1, multiple: 1,
  nofollow: 2, ugc: 2, sponsored: 2, estimated_nofollow: 2, none: 2,
  unknown: 3,
};

function categoryTier(directory: LaunchDirectory) {
  return directory.categories.reduce((tier, category) => Math.min(tier, categoryTiers.get(category) ?? 3), 3);
}

export type LaunchDirectoryQuery = {
  q?: string;
  categories?: string[];
  costs?: string[];
  links?: string[];
  submission?: string;
  backlink?: string;
  sort?: string;
  page?: string | number;
  pageSize?: number;
};

function searchable(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

export function launchDirectoryHasFreeOption(directory: LaunchDirectory) {
  return directory.cost_kind === "free" || directory.cost_kind === "free_and_paid";
}

/**
 * A free plan whose checked submission flow says a backlink is optional or not required.
 * Unchecked records don't qualify: unknown isn't the same as "not required".
 */
export function launchDirectoryFreeWithoutRequiredBacklink(directory: LaunchDirectory) {
  if (!launchDirectoryHasFreeOption(directory)) return false;
  const backlink = directory.submission_details?.backlink;
  return backlink === "optional" || backlink === "not_required";
}

function matchesCost(directory: LaunchDirectory, cost: string) {
  if (cost === "free") return launchDirectoryHasFreeOption(directory);
  return directory.cost_kind === cost;
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
      ...(directory.submission_details?.requirements ?? []),
      ...directory.categories.map((category) => categoryLabels[category] ?? category.replaceAll("-", " ")),
    ].join(" "));
    const verified = directory.submission_status === "verified" && Boolean(directory.submit_url);
    return (!search || haystack.includes(search))
      && (!query.categories?.length || query.categories.some((category) => directory.categories.includes(category)))
      && (!query.costs?.length || query.costs.some((cost) => matchesCost(directory, cost)))
      && (!query.links?.length || query.links.includes(directory.link_type_kind))
      && (query.backlink !== "not_required" || launchDirectoryFreeWithoutRequiredBacklink(directory))
      && (query.submission !== "verified" || verified)
      && (query.submission !== "unverified" || !verified);
  });
}

export function sortLaunchDirectories(directories: LaunchDirectory[], sort = "recommended") {
  return [...directories].sort((left, right) => {
    if (sort === "recommended") {
      const pinned = (recommendedPins.get(left.slug) ?? recommendedPins.size) - (recommendedPins.get(right.slug) ?? recommendedPins.size);
      if (pinned) return pinned;
      const ready = (directory: LaunchDirectory) => Number(directory.submission_status === "verified" && Boolean(directory.submit_url));
      const availability = ready(right) - ready(left);
      if (availability) return availability;
      const tier = categoryTier(left) - categoryTier(right);
      if (tier) return tier;
      const cost = costRanks[left.cost_kind] - costRanks[right.cost_kind];
      if (cost) return cost;
      const link = linkRanks[left.link_type_kind] - linkRanks[right.link_type_kind];
      if (link) return link;
    } else if (sort !== "name") {
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
