"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { parseRecommendationQuery } from "@/lib/ad-network-requirements/engine";
import type { RequirementsPageData } from "@/lib/ad-network-requirements/types";
import { AdNetworkRequirementsChecker } from "./ad-network-requirements-checker-tool";

export function AdNetworkRequirementsCheckerFromUrl({ data }: { data: RequirementsPageData }) {
  const query = useInitialQuery();
  const parsed = parseRecommendationQuery(new URLSearchParams(query.key === "default" ? "" : query.key));
  return <AdNetworkRequirementsChecker data={data} initialRaw={parsed.shared ? parsed.raw : undefined} key={query.key} />;
}
