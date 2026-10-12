"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { KdpRoyaltyCalculator, inputFromQuery, isSharedLink } from "./kdp-royalty-calculator";

// Reads a shared link in the browser so the page stays static. A clean URL, or one with only
// other parameters such as tracking tags, opens on the example and leaves the address alone.
export function KdpRoyaltyCalculatorFromUrl() {
  const query = useInitialQuery();
  const shared = isSharedLink(query.get);
  return <KdpRoyaltyCalculator initialInput={shared ? inputFromQuery(query.get) : undefined} key={query.key} />;
}
