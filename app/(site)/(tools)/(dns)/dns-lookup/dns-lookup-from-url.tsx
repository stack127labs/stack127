"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { isDnsResolver } from "@/lib/dns/resolvers.ts";
import type { DnsSelection } from "@/lib/dns/types.ts";
import { DnsLookupTool } from "./dns-lookup-tool";

const selections = new Set(["all", "A", "AAAA", "CNAME", "MX", "NS", "TXT", "CAA", "SOA", "SRV", "DS", "DNSKEY", "PTR"]);

function initialSelection(value: string): DnsSelection {
  const normalized = value === "all" || value === "common" ? "all" : value.toUpperCase();
  return selections.has(normalized) ? normalized as DnsSelection : "all";
}

// Reads ?name=, ?resolver=, and ?type= in the browser so the page stays static.
export function DnsLookupFromUrl() {
  const query = useInitialQuery();
  const resolver = query.get("resolver");
  return (
    <DnsLookupTool
      key={query.key}
      initialName={query.get("name")}
      initialResolver={isDnsResolver(resolver) ? resolver : "cloudflare"}
      initialSelection={initialSelection(query.get("type"))}
    />
  );
}
