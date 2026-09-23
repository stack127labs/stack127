import type { HardwareDirectoryRecord } from "@/lib/hardware-directories";

export type HardwareDirectorySearchParams = Record<string, string | string[] | undefined>;
export type HardwareDirectorySort = "name" | "vendor" | "features" | "newest";

export function getDirectoryValues(params: HardwareDirectorySearchParams, key: string) {
  const value = params[key];
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

export function getDirectoryString(params: HardwareDirectorySearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function getDirectorySort(params: HardwareDirectorySearchParams): HardwareDirectorySort {
  const value = getDirectoryString(params, "sort");
  return value === "vendor" || value === "features" || value === "newest" ? value : "name";
}

export function getDirectoryPage(params: HardwareDirectorySearchParams) {
  const page = Number.parseInt(getDirectoryString(params, "page"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function filterHardwareRecords(
  records: HardwareDirectoryRecord[],
  params: HardwareDirectorySearchParams,
) {
  const query = getDirectoryString(params, "q").trim().toLocaleLowerCase();
  const categories = new Set(getDirectoryValues(params, "category"));
  const vendors = new Set(getDirectoryValues(params, "vendor"));
  const features = new Set(getDirectoryValues(params, "feature"));

  return records.filter((record) => {
    if (categories.size > 0 && !categories.has(record.category)) return false;
    if (vendors.size > 0 && !vendors.has(record.vendor)) return false;
    if (features.size > 0 && ![...features].every((feature) => record.features.includes(feature))) return false;
    if (!query) return true;

    return [record.name, record.vendor, record.model, record.category, ...record.search_terms, ...record.features]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query);
  });
}

export function sortHardwareRecords(records: HardwareDirectoryRecord[], sort: HardwareDirectorySort) {
  return [...records].sort((left, right) => {
    if (sort === "vendor") {
      return left.vendor.localeCompare(right.vendor) || left.model.localeCompare(right.model);
    }
    if (sort === "features") {
      return right.features.length - left.features.length || left.name.localeCompare(right.name);
    }
    if (sort === "newest") {
      return (right.added ?? "").localeCompare(left.added ?? "") || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name) || left.model.localeCompare(right.model);
  });
}

export function hardwareDirectoryPageHref(
  route: string,
  params: HardwareDirectorySearchParams,
  page: number,
) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    for (const item of Array.isArray(value) ? value : value ? [value] : []) next.append(key, item);
  }
  if (page > 1) next.set("page", String(page));
  const query = next.toString();
  return query ? `${route}?${query}` : route;
}
