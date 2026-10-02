import type { HardwareDirectoryRecord } from "@/lib/hardware-directories";
import { hardwareCardName } from "@/lib/hardware-directories/card-name";
import { pageParamHref, paramPage, paramString, paramValues, type DirectoryParams } from "./directory-params";

export const hardwarePageSize = 30;

export type HardwareDirectorySearchParams = DirectoryParams;
export type HardwareDirectorySort = "name" | "vendor";

type FilterableRecord = Pick<HardwareDirectoryRecord, "name" | "vendor" | "model" | "category" | "search_terms" | "features">;
type SortableRecord = Pick<HardwareDirectoryRecord, "name" | "vendor" | "model">;

export { hardwareIndexRecord, type HardwareIndexRecord } from "@/lib/hardware-directories/search-index";

export const getDirectoryValues = paramValues;
export const getDirectoryString = paramString;
export const getDirectoryPage = paramPage;

export function getDirectorySort(params: HardwareDirectorySearchParams): HardwareDirectorySort {
  const value = getDirectoryString(params, "sort");
  return value === "vendor" ? value : "name";
}

export function filterHardwareRecords<T extends FilterableRecord>(records: T[], params: HardwareDirectorySearchParams) {
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

export function sortHardwareRecords<T extends SortableRecord>(records: T[], sort: HardwareDirectorySort) {
  return [...records].sort((left, right) => {
    if (sort === "vendor") {
      return left.vendor.localeCompare(right.vendor) || left.model.localeCompare(right.model);
    }
    return hardwareCardName(left.name, left.vendor, left.model).localeCompare(hardwareCardName(right.name, right.vendor, right.model))
      || left.model.localeCompare(right.model);
  });
}

export function hardwareDirectoryPageHref(route: string, params: HardwareDirectorySearchParams, page: number) {
  return pageParamHref(route, params, page);
}
