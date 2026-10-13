"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { SeriesReadThroughCalculator, inputFromQuery, isSharedLink } from "./series-read-through-calculator";

// Reads a shared link in the browser so the page stays static. A clean URL, or one with only
// other parameters such as tracking tags, opens on the example and leaves the address alone.
export function SeriesReadThroughCalculatorFromUrl() {
  const query = useInitialQuery();
  const shared = isSharedLink(query.get);
  return <SeriesReadThroughCalculator initialInput={shared ? inputFromQuery(query.get) : undefined} key={query.key} />;
}
