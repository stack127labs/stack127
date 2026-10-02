"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { StorageLayoutAdvisor } from "./storage-layout-advisor";

// Reads ?state= in the browser so the page stays static.
export function StorageLayoutAdvisorFromUrl() {
  const query = useInitialQuery();
  return <StorageLayoutAdvisor key={query.key} initialState={query.get("state")} />;
}
