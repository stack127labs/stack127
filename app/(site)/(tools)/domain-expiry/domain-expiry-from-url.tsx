"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { DomainExpiryTool } from "./domain-expiry-tool";

// Reads ?name= in the browser so the page stays static.
export function DomainExpiryFromUrl() {
  const query = useInitialQuery();
  return <DomainExpiryTool key={query.key} initialName={query.get("name")} />;
}
