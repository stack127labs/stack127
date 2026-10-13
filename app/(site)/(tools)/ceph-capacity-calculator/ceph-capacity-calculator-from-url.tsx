"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { CephCapacityCalculator } from "./ceph-capacity-calculator";

// Reads ?state= in the browser so the page stays static.
export function CephCapacityCalculatorFromUrl() {
  const query = useInitialQuery();
  return <CephCapacityCalculator key={query.key} initialState={query.get("state")} />;
}
