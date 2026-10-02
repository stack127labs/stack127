"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { DNSSEC_RECORD_TYPES, type DnssecRecordType } from "@/lib/dns/dnssec-types.ts";
import { DnssecChecker } from "./dnssec-checker";

function initialType(value: string): DnssecRecordType {
  const upper = value.toUpperCase();
  return DNSSEC_RECORD_TYPES.includes(upper as DnssecRecordType) ? upper as DnssecRecordType : "A";
}

// Reads ?name= and ?type= in the browser so the page stays static.
export function DnssecCheckerFromUrl() {
  const query = useInitialQuery();
  return (
    <DnssecChecker
      key={query.key}
      initialName={query.get("name")}
      initialRecordType={initialType(query.get("type"))}
    />
  );
}
