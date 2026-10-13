"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { SoaChecker } from "./soa-checker";

// Reads ?name= in the browser so the page stays static.
export function SoaCheckerFromUrl() {
  const query = useInitialQuery();
  return <SoaChecker key={query.key} initialName={query.get("name")} />;
}
