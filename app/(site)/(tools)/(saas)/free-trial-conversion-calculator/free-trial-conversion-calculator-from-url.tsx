"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { freeTrialInputFromQuery } from "@/lib/free-trial-conversion-calculator/engine";
import { FreeTrialConversionCalculator } from "./free-trial-conversion-calculator";

// Reads a shared link in the browser so the page stays static. A clean URL opens on the example.
export function FreeTrialConversionFromUrl() {
  const query = useInitialQuery();
  const shared = query.key !== "default";
  return (
    <FreeTrialConversionCalculator
      key={query.key}
      initialInput={shared ? freeTrialInputFromQuery(query.get) : undefined}
    />
  );
}
