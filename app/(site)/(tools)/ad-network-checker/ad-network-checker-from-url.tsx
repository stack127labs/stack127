"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { AdNetworkCheckerTool, type NetworkLogos } from "./ad-network-checker-tool";

// Reads ?site= in the browser so the page stays static. A shared link checks that site right away.
export function AdNetworkCheckerFromUrl({ logos }: { logos: NetworkLogos }) {
  const query = useInitialQuery();
  return <AdNetworkCheckerTool initialSite={query.get("site").trim()} key={query.key} logos={logos} />;
}
