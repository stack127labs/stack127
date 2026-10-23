"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { adRevenueInputFromQuery } from "@/lib/ad-revenue-calculator/engine";
import { AdRevenueCalculator } from "./ad-revenue-calculator";

// Reads a shared link in the browser so the page stays static. A clean URL opens on the example.
export function AdRevenueCalculatorFromUrl() {
  const query = useInitialQuery();
  const input = query.key === "default" ? null : adRevenueInputFromQuery(query.get);
  return <AdRevenueCalculator key={input ? query.key : "default"} initialInput={input ?? undefined} />;
}
