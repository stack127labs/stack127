"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { RaidzExpansionPlanner } from "./raidz-expansion-planner";

// Reads ?state= in the browser so the page stays static.
export function RaidzExpansionPlannerFromUrl() {
  const query = useInitialQuery();
  return <RaidzExpansionPlanner key={query.key} initialState={query.get("state")} />;
}
