import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { RefreshCw } from "lucide-react";
import { DnsChangeChecker } from "./dns-change-checker";
import { CHANGE_RECORD_TYPES, type ChangeRecordType } from "@/lib/dns/diagnostic-types.ts";
import styles from "./dns-change-checker.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

function initialType(value: string): ChangeRecordType {
  const upper = value.toUpperCase();
  return CHANGE_RECORD_TYPES.includes(upper as ChangeRecordType) ? upper as ChangeRecordType : "A";
}

export default async function DnsChangeCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("dns-change-checker");
  const params = await searchParams;
  return (
    <PageCanvas as="main" className={styles.main}>
      <ToolPageHeader
        icon={<RefreshCw strokeWidth={2.2} />}
        toolPage={toolPage}
      />
      <DnsChangeChecker initialName={first(params.name)} initialRecordType={initialType(first(params.type))} />
      <ToolPageMarkdown toolPage={toolPage} />
    </PageCanvas>
  );
}
