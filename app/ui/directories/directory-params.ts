// URL helpers shared by the directory filters, chips, and pagination.
export type DirectoryParams = Record<string, string | string[] | undefined>;

export function paramValues(params: DirectoryParams, key: string) {
  const value = params[key];
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

export function paramString(params: DirectoryParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function paramPage(params: DirectoryParams) {
  const value = Number(paramString(params, "page"));
  return Number.isInteger(value) && value > 1 ? value : 1;
}

function hrefFor(route: string, next: URLSearchParams) {
  const query = next.toString();
  return query ? `${route}?${query}` : route;
}

/** The current view without one filter value, or without the whole key when no value is given. */
export function removeParamHref(route: string, params: DirectoryParams, key: string, value?: string) {
  const next = new URLSearchParams();
  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (paramKey === "page") continue;
    for (const current of Array.isArray(paramValue) ? paramValue : paramValue ? [paramValue] : []) {
      if (paramKey === key && (!value || current === value)) continue;
      next.append(paramKey, current);
    }
  }
  return hrefFor(route, next);
}

export function pageParamHref(route: string, params: DirectoryParams, page: number) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    for (const current of Array.isArray(value) ? value : value ? [value] : []) next.append(key, current);
  }
  if (page > 1) next.set("page", String(page));
  return hrefFor(route, next);
}
