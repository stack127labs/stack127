"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DirectoryApp } from "@/lib/apps";
import type { DirectoryParams } from "@/app/ui/directories/directory-params";
import { useDirectoryQuery } from "@/app/ui/directories/directory-query";
import type { SelfHostAppsSearchResponse } from "@/lib/self-host-apps-search";
import { cleanParams, searchQuery } from "./options";

/** The static page ships results without detail data. Its details are hidden HTML in the page. */
export type SelfHostAppsResults = Omit<SelfHostAppsSearchResponse, "detailApps"> & { detailApps?: DirectoryApp[] };

type SearchState = {
  /** The page path: the hub, or a category page. Links and the form stay on it. */
  route: string;
  /** The locked category on a category page. Every request sends it. */
  category?: string;
  params: DirectoryParams;
  /** Sidebar options: the static page's options plus any new ones from loaded results. */
  facets: Facets;
  results: SelfHostAppsResults;
  status: "ready" | "loading" | "error" | "invalid";
  retry: () => void;
};

type Outcome = { query: string; attempt: number } & (
  | { results: SelfHostAppsSearchResponse }
  | { failure: "error" | "invalid" }
);

const SearchContext = createContext<SearchState | null>(null);

type Facets = SelfHostAppsSearchResponse["facets"];

function union<T extends { value: string }>(left: T[], right: T[]) {
  const seen = new Set(left.map((option) => option.value));
  return [...left, ...right.filter((option) => !seen.has(option.value))];
}

function mergeFacets(base: Facets, latest: Facets): Facets {
  if (base === latest) return base;
  return {
    ...base,
    categories: union(base.categories, latest.categories),
    installMethods: union(base.installMethods, latest.installMethods),
    licenses: union(base.licenses, latest.licenses),
  };
}

// The static page shows the default view. Any filter, search, sort, or page in
// the URL loads matching apps from the cached search API. Older results stay
// visible while the next ones load, and a newer request cancels an older one.
// A category page passes its path and category: its static page is that
// category's default view, and every request asks only for that category.
export function SelfHostAppsSearchProvider({ category, children, initial, route }: {
  category?: string;
  children: ReactNode;
  initial: SelfHostAppsResults;
  route: string;
}) {
  const { params: urlParams } = useDirectoryQuery();
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [lastResults, setLastResults] = useState<SelfHostAppsResults>(initial);
  // Filtered results can offer values the default view does not, so accept both.
  const facets = useMemo(() => mergeFacets(initial.facets, lastResults.facets), [initial.facets, lastResults.facets]);
  const params = useMemo(() => cleanParams(urlParams, facets, category), [urlParams, facets, category]);
  const query = searchQuery(params);
  // Same key order as the main page sends (q, sort, category, then the rest), so equal views share one cached response.
  const { q, sort, ...rest } = params;
  const requestQuery = category && query ? searchQuery({ ...(q ? { q } : {}), ...(sort ? { sort } : {}), category: [category], ...rest }) : query;

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const finish = (next: Outcome) => {
      if (controller.signal.aborted) return;
      setOutcome(next);
      if ("results" in next) setLastResults(next.results);
    };

    fetch(`/api/self-host-apps/search?${requestQuery}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 400) return finish({ attempt, failure: "invalid", query });
        if (!response.ok) throw new Error(`Search failed with ${response.status}.`);
        finish({ attempt, query, results: await response.json() as SelfHostAppsSearchResponse });
      })
      .catch(() => finish({ attempt, failure: "error", query }));

    return () => controller.abort();
  }, [attempt, query, requestQuery]);

  const value = useMemo<SearchState>(() => {
    const retry = () => setAttempt((current) => current + 1);
    const base = { category, facets, params, retry, route };
    if (!query) return { ...base, results: initial, status: "ready" };
    const current = outcome?.query === query && outcome.attempt === attempt ? outcome : null;
    if (!current) return { ...base, results: lastResults, status: "loading" };
    if ("failure" in current) return { ...base, results: lastResults, status: current.failure };
    return { ...base, results: current.results, status: "ready" };
  }, [attempt, category, facets, initial, lastResults, outcome, params, query, route]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSelfHostAppsSearch() {
  const search = useContext(SearchContext);
  if (!search) throw new Error("useSelfHostAppsSearch needs a SelfHostAppsSearchProvider.");
  return search;
}
