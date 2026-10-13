"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { UnraidCalculator } from "./unraid-calculator";

// Reads ?state= in the browser so the page stays static.
export function UnraidCalculatorFromUrl() {
  const query = useInitialQuery();
  return <UnraidCalculator key={query.key} initialState={query.get("state")} />;
}
