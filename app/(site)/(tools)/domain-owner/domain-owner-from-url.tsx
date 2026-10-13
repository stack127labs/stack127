"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { DomainOwnerTool } from "./domain-owner-tool";

// Reads ?name= in the browser so the page stays static.
export function DomainOwnerFromUrl() {
  const query = useInitialQuery();
  return <DomainOwnerTool key={query.key} initialName={query.get("name")} />;
}
