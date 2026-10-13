"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { ZfsCapacityCalculator } from "./zfs-capacity-calculator";

// Reads ?state= in the browser so the page stays static.
export function ZfsCapacityCalculatorFromUrl() {
  const query = useInitialQuery();
  return <ZfsCapacityCalculator key={query.key} initialState={query.get("state")} />;
}
