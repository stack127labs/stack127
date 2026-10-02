"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { DomainAgeTool } from "./domain-age-tool";

// Reads ?name= in the browser so the page stays static.
export function DomainAgeFromUrl() {
  const query = useInitialQuery();
  return <DomainAgeTool key={query.key} initialName={query.get("name")} />;
}
