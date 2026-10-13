"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { CaaChecker } from "./caa-checker";

// Reads ?name= in the browser so the page stays static.
export function CaaCheckerFromUrl() {
  const query = useInitialQuery();
  return <CaaChecker key={query.key} initialName={query.get("name")} />;
}
