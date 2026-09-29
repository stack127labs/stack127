import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Route } from "lucide-react";
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
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className={styles.main}>
        <ToolPageHeader
          icon={<Route strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DnsTraceTool
          initialName={firstValue(params.name)}
          initialRecordType={initialRecordType(firstValue(params.type))}
        />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
