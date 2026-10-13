"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import type { DriveReliabilitySnapshot } from "@/lib/drive-reliability";
import { DriveReliabilityExplorer } from "./drive-reliability";

// Reads ?state= in the browser so the page stays static.
export function DriveReliabilityFromUrl({ snapshot }: { snapshot: DriveReliabilitySnapshot }) {
  const query = useInitialQuery();
  return <DriveReliabilityExplorer key={query.key} initialState={query.get("state")} snapshot={snapshot} />;
}
