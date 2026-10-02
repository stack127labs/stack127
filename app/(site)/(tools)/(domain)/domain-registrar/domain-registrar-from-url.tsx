"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { DomainRegistrarTool } from "./domain-registrar-tool";

// Reads ?name= in the browser so the page stays static.
export function DomainRegistrarFromUrl() {
  const query = useInitialQuery();
  return <DomainRegistrarTool key={query.key} initialName={query.get("name")} />;
}
