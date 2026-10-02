"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { IpAsnLookupTool } from "./ip-asn-lookup-tool";

// Reads ?query= in the browser so the page stays static.
export function IpAsnLookupFromUrl() {
  const query = useInitialQuery();
  return <IpAsnLookupTool key={query.key} initialQuery={query.get("query")} />;
}
