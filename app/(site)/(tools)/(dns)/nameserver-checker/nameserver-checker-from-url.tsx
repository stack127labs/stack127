"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { NameserverChecker } from "./nameserver-checker";

// Reads ?name= in the browser so the page stays static.
export function NameserverCheckerFromUrl() {
  const query = useInitialQuery();
  return <NameserverChecker key={query.key} initialName={query.get("name")} />;
}
