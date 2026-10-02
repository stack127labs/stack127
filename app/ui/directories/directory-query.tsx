"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DirectoryParams } from "./directory-params";

type DirectoryQueryState = {
  params: DirectoryParams;
  /** Changes when the URL changes outside the filter form, so the form resets to match it. */
  formKey: number;
  replace: (href: string) => void;
};

const DirectoryQueryContext = createContext<DirectoryQueryState | null>(null);

const emptyParams: DirectoryParams = {};

function readParams(): DirectoryParams {
  const search = new URLSearchParams(window.location.search);
  const params: DirectoryParams = {};
  for (const key of new Set(search.keys())) {
    const values = search.getAll(key);
    params[key] = values.length > 1 ? values : values[0];
  }
  return params;
}

function isPlainClick(event: MouseEvent) {
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

// Directory pages are static and render the default view. This provider reads
// filters, sort, and ?page= from the URL after hydration, so shared links still
// open the same view. Links back to the same route (chips, pagination, reset)
// change the URL in place instead of loading the page again.
export function DirectoryQueryProvider({ children, route }: { children: ReactNode; route: string }) {
  const [state, setState] = useState({ params: emptyParams, formKey: 0 });

  useEffect(() => {
    const sync = () => setState((current) => ({ params: readParams(), formKey: current.formKey + 1 }));
    if (window.location.search) sync();

    const handleClick = (event: MouseEvent) => {
      if (!isPlainClick(event) || !(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname !== route || url.hash) return;
      event.preventDefault();
      window.history.pushState(null, "", `${url.pathname}${url.search}`);
      sync();
      window.scrollTo({ top: 0 });
    };

    window.addEventListener("popstate", sync);
    // Capture runs before Next.js links handle the click.
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("popstate", sync);
      document.removeEventListener("click", handleClick, true);
    };
  }, [route]);

  const replace = useCallback((href: string) => {
    window.history.replaceState(null, "", href);
    setState((current) => ({ params: readParams(), formKey: current.formKey }));
  }, []);

  const value = useMemo(() => ({ ...state, replace }), [state, replace]);
  return <DirectoryQueryContext.Provider value={value}>{children}</DirectoryQueryContext.Provider>;
}

/** Null outside a DirectoryQueryProvider, where filters still reload the page. */
export function useOptionalDirectoryQuery() {
  return useContext(DirectoryQueryContext);
}

export function useDirectoryQuery() {
  const query = useContext(DirectoryQueryContext);
  if (!query) throw new Error("useDirectoryQuery needs a DirectoryQueryProvider.");
  return query;
}

/** True when the URL sets any of the directory's own keys. Tracking parameters don't count. */
export function hasDirectoryParams(params: DirectoryParams, keys: readonly string[]) {
  return keys.some((key) => {
    const value = params[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
}
