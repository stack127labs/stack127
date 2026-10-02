"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { DomainAvailabilityTool } from "./domain-availability-tool";

// Reads ?name= in the browser so the page stays static.
export function DomainAvailabilityFromUrl() {
  const query = useInitialQuery();
  return <DomainAvailabilityTool key={query.key} initialName={query.get("name")} />;
}
