"use client";

import { useEffect, useState } from "react";

// Tool pages are static, so the server never sees the query string. A tool reads its
// shared-link values here after hydration, and again on back and forward. Until then
// it shows its default state.
//
// Key the tool with `query.key` so it remounts with the URL values. Clean URLs keep the
// "default" key and never remount.
export function useInitialQuery() {
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    const read = () => {
      const next = new URLSearchParams(window.location.search);
      next.delete("_rsc");
      setParams(next.size ? next : null);
    };
    read();
    // Back and forward restore the tool from that history entry.
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  return {
    key: params?.toString() ?? "default",
    get: (name: string) => params?.get(name) ?? "",
  };
}
