import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/dns-tools/dns-tools.css";
import { Route } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../../(catalogs)/dns-tools/dns-tools-sidebar";
import { DnsTraceTool } from "./dns-trace-tool";
import { TRACE_RECORD_TYPES, type DnsTraceRecordType } from "@/lib/dns/trace-types.ts";
import styles from "./dns-trace.module.css";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function initialRecordType(value: string): DnsTraceRecordType {
  const normalized = value.toUpperCase();
  return TRACE_RECORD_TYPES.includes(normalized as DnsTraceRecordType)
    ? normalized as DnsTraceRecordType
    : "A";
}

export default async function DnsTracePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("dns-trace");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="DNS Trace Explorer"
      menuLabel="DNS tools"
      sidebar={<DnsToolsSidebar active="trace" />}
      sidebarLabel="DNS tools sidebar"
    >
      <main className={styles.main}>
        <ToolPageHeader
          icon={<Route strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DnsTraceTool
          initialName={firstValue(params.name)}
          initialRecordType={initialRecordType(firstValue(params.type))}
        />

        <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
