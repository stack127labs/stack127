"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { StorageGrowthPlanner } from "./storage-growth-planner";

// Reads ?state= in the browser so the page stays static.
export function StorageGrowthPlannerFromUrl() {
  const query = useInitialQuery();
  return <StorageGrowthPlanner key={query.key} initialState={query.get("state")} />;
}
