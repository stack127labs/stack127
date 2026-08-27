import type { TerminalApp } from "@/lib/terminal-apps";

export type SearchParams = Record<string, string | string[] | undefined>;

export const sortOptions = [
  { label: "Most popular", value: "popular" },
  { label: "Name", value: "name" },
  { label: "Recent release", value: "recent" },
  { label: "Healthiest", value: "healthy" },
] as const;

export const sortValues = sortOptions.map((option) => option.value);
export type SortValue = (typeof sortValues)[number];

export function getValues(params: SearchParams, key: string) {
  const value = params[key];

  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function getString(params: SearchParams, key: string) {
  const value = params[key];

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function getKnownValue(params: SearchParams, key: string, values: readonly string[]) {
  const value = getString(params, key);

  return values.includes(value) ? value : "";
}

export function getPage(params: SearchParams) {
  const value = Number(getString(params, "page"));

  return Number.isInteger(value) && value > 1 ? value : 1;
}

function haystack(app: TerminalApp) {
  return [
    app.name,
    app.summary,
    ...app.aliases,
    app.language ?? "",
    ...app.categories,
    ...app.platforms,
    ...app.install_methods,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesSearch(app: TerminalApp, query: string) {
  if (!query) {
    return true;
  }

  return haystack(app).includes(query.toLowerCase());
}

/**
 * A multi-select field matches when the app carries at least one selected
 * value. Unknown values only match an explicit "unknown" selection.
 */
export function matchesMulti(app: TerminalApp, key: keyof TerminalApp, selected: string[]) {
  if (selected.length === 0) {
    return true;
  }

  const values = app[key];
  const list = Array.isArray(values) ? values.map(String) : [String(values)];

  return selected.some((value) => list.includes(value));
}

export function filterApps(apps: TerminalApp[], params: SearchParams) {
  const query = getString(params, "q").trim();
  const types = getValues(params, "type");
  const categories = getValues(params, "category");
  const platforms = getValues(params, "platform");
  const languages = getValues(params, "language");
  const installs = getValues(params, "install");
  const pricing = getValues(params, "pricing");
  const sources = getValues(params, "source");
  const maintenance = getValues(params, "maintenance");
  const licenses = getValues(params, "license");

  return apps.filter((app) => {
    if (!matchesSearch(app, query)) {
      return false;
    }

    const typeMatches = matchesMulti(app, "primary_type", types) ||
      (types.length > 0 && app.additional_types.some((type) => types.includes(type)));

    if (types.length > 0 && !typeMatches) {
      return false;
    }

    if (!matchesMulti(app, "categories", categories)) {
      return false;
    }

    if (!matchesMulti(app, "platforms", platforms)) {
      return false;
    }

    if (!matchesMulti(app, "install_methods", installs)) {
      return false;
    }

    if (!matchesMulti(app, "pricing_model", pricing)) {
      return false;
    }

    if (!matchesMulti(app, "source_model", sources)) {
      return false;
    }

    if (!matchesMulti(app, "maintenance_status", maintenance)) {
      return false;
    }

    if (languages.length > 0) {
      const language = (app.language ?? "unknown").toLowerCase();
      if (!languages.includes(language)) {
        return false;
      }
    }

    if (licenses.length > 0) {
      const license = (app.license ?? "unknown").toLowerCase();
      if (!licenses.includes(license)) {
        return false;
      }
    }

    return true;
  });
}

export function compareBySort(a: TerminalApp, b: TerminalApp, sort: string) {
  if (sort === "name") {
    return a.name.localeCompare(b.name);
  }

  if (sort === "recent") {
    const aTime = a.latest_release_at ? new Date(a.latest_release_at).getTime() : 0;
    const bTime = b.latest_release_at ? new Date(b.latest_release_at).getTime() : 0;

    return bTime - aTime || a.name.localeCompare(b.name);
  }

  if (sort === "healthy") {
    const healthRank = (value: TerminalApp["maintenance_status"]) =>
      value === "active" ? 0 : value === "slow" ? 1 : value === "unknown" ? 2 : 3;

    return healthRank(a.maintenance_status) - healthRank(b.maintenance_status) ||
      (b.stars ?? 0) - (a.stars ?? 0);
  }

  return (b.stars ?? 0) - (a.stars ?? 0) || a.name.localeCompare(b.name);
}

export function sortApps(apps: TerminalApp[], sort: string) {
  return [...apps].sort((a, b) => compareBySort(a, b, sort));
}

/** Page numbers to render: first, last, and a window around the current page. */
export function paginationPages(currentPage: number, totalPages: number): (number | null)[] {
  const wanted = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages: (number | null)[] = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (wanted.has(page)) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null);
    }
  }

  return pages;
}
