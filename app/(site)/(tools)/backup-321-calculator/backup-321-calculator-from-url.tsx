"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { Backup321Calculator } from "./backup-321-calculator";

// Reads ?state= in the browser so the page stays static.
export function Backup321CalculatorFromUrl() {
  const query = useInitialQuery();
  return <Backup321Calculator key={query.key} initialState={query.get("state")} />;
}
