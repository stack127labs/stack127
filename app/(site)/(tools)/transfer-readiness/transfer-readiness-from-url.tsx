"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { TransferReadinessTool } from "./transfer-readiness-tool";

// Reads ?name= in the browser so the page stays static.
export function TransferReadinessFromUrl() {
  const query = useInitialQuery();
  return <TransferReadinessTool key={query.key} initialName={query.get("name")} />;
}
