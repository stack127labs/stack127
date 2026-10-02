"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { DomainReportTool } from "./domain-report-tool";

// Reads ?name= in the browser so the page stays static.
export function DomainReportFromUrl() {
  const query = useInitialQuery();
  return <DomainReportTool key={query.key} initialName={query.get("name")} />;
}
