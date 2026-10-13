"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { DomainLookupTool } from "./domain-lookup-tool";

// Reads ?name= in the browser so the page stays static.
export function DomainLookupFromUrl() {
  const query = useInitialQuery();
  return <DomainLookupTool key={query.key} initialName={query.get("name")} />;
}
