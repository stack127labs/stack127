"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { CHANGE_RECORD_TYPES, type ChangeRecordType } from "@/lib/dns/diagnostic-types.ts";
import { DnsChangeChecker } from "./dns-change-checker";

function initialType(value: string): ChangeRecordType {
  const upper = value.toUpperCase();
  return CHANGE_RECORD_TYPES.includes(upper as ChangeRecordType) ? upper as ChangeRecordType : "A";
}

// Reads ?name= and ?type= in the browser so the page stays static.
export function DnsChangeCheckerFromUrl() {
  const query = useInitialQuery();
  return (
    <DnsChangeChecker
      key={query.key}
      initialName={query.get("name")}
      initialRecordType={initialType(query.get("type"))}
    />
  );
}
