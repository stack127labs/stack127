"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { TRACE_RECORD_TYPES, type DnsTraceRecordType } from "@/lib/dns/trace-types.ts";
import { DnsTraceTool } from "./dns-trace-tool";

function initialRecordType(value: string): DnsTraceRecordType {
  const normalized = value.toUpperCase();
  return TRACE_RECORD_TYPES.includes(normalized as DnsTraceRecordType)
    ? normalized as DnsTraceRecordType
    : "A";
}

// Reads ?name= and ?type= in the browser so the page stays static.
export function DnsTraceFromUrl() {
  const query = useInitialQuery();
  return (
    <DnsTraceTool
      key={query.key}
      initialName={query.get("name")}
      initialRecordType={initialRecordType(query.get("type"))}
    />
  );
}
