"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { RaidCalculator } from "./raid-calculator";

// Reads ?state= in the browser so the page stays static.
export function RaidCalculatorFromUrl() {
  const query = useInitialQuery();
  return <RaidCalculator key={query.key} initialState={query.get("state")} />;
}
