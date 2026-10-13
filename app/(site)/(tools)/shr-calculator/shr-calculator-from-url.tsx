"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { ShrCalculator } from "./shr-calculator";

// Reads ?state= in the browser so the page stays static.
export function ShrCalculatorFromUrl() {
  const query = useInitialQuery();
  return <ShrCalculator key={query.key} initialState={query.get("state")} />;
}
