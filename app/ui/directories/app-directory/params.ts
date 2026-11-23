// URL state of an app directory page: search, sort, job, size, free start, features,
// main job only, and page. Empty or invalid values fall back to the default view.
import { paramPage, paramString, paramValues, type DirectoryParams } from "@/app/ui/directories/directory-params";
import { costLevels, sizeParam, sortOptions, type DirectoryFilter, type IndieCategory } from "@/lib/indie-hacker-apps/model";

export const appDirectoryPageSize = 30;
export const defaultSort = "cost";
const sortValues: string[] = sortOptions.map((option) => option.value);

/** Every param that moves the page off its static default view. */
export function appDirectoryParamKeys(view: IndieCategory) {
  return ["q", "sort", "page", "job", "free", "feature", "main", ...Object.keys(view.sets).map(sizeParam)];
}

export function getSort(params: DirectoryParams) {
  const value = paramString(params, "sort");
  return sortValues.includes(value) ? value : defaultSort;
}

export function getJob(view: IndieCategory, params: DirectoryParams) {
  const value = paramString(params, "job");
  return view.jobs.some(([id]) => id === value) ? value : "";
}

/** The chosen size level per cost set, from ?size_<set>=, else the set's default. */
export function getLevels(view: IndieCategory, params: DirectoryParams) {
  return costLevels(view, Object.fromEntries(Object.keys(view.sets).map((key) => {
    const raw = paramString(params, sizeParam(key));
    return [key, raw === "" ? undefined : Number(raw)];
  })));
}

export const getMainOnly = (params: DirectoryParams) => paramString(params, "main") === "1";

export function getFilter(view: IndieCategory, params: DirectoryParams): DirectoryFilter {
  return {
    q: paramString(params, "q"),
    job: getJob(view, params),
    free: paramValues(params, "free"),
    features: paramValues(params, "feature"),
    mainOnly: getMainOnly(params),
  };
}

export const getPage = paramPage;
