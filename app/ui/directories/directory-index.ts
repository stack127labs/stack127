"use client";

import { useEffect, useState } from "react";

/** Records shipped with the page, or a cached JSON route loaded when a filter needs them. */
export type DirectoryIndexSource<T> = { records: T[] } | { url: string };

const loaded = new Map<string, Promise<unknown[]>>(); // pending loads only

function loadIndex(url: string) {
  let request = loaded.get(url);
  if (!request) {
    request = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`Directory index failed with ${response.status}.`);
      return response.json() as Promise<unknown[]>;
    });
    loaded.set(url, request);
    // Share one request between components on this visit; a later visit fetches again.
    request.finally(() => loaded.delete(url)).catch(() => {});
  }
  return request;
}

export function useDirectoryIndex<T>(source: DirectoryIndexSource<T>, needed: boolean) {
  const url = "url" in source ? source.url : null;
  const [state, setState] = useState<{ url: string; records?: T[]; failed?: boolean } | null>(null);

  useEffect(() => {
    if (!url || !needed) return;
    let active = true;
    loadIndex(url)
      .then((records) => { if (active) setState({ url, records: records as T[] }); })
      .catch(() => { if (active) setState({ url, failed: true }); });
    return () => { active = false; };
  }, [needed, url]);

  if ("records" in source) return { records: source.records, failed: false };
  return { records: state?.url === url ? state.records : undefined, failed: Boolean(state?.url === url && state.failed) };
}
