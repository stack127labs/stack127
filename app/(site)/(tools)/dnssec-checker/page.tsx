import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/dns-tools/dns-tools.css";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../../(catalogs)/dns-tools/dns-tools-sidebar";
import { DnssecChecker } from "./dnssec-checker";
import { DNSSEC_RECORD_TYPES, type DnssecRecordType } from "@/lib/dns/dnssec-types.ts";
import styles from "./dnssec-checker.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
function initialType(value: string): DnssecRecordType { const upper = value.toUpperCase(); return DNSSEC_RECORD_TYPES.includes(upper as DnssecRecordType) ? upper as DnssecRecordType : "A"; }

export default async function DnssecCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("dnssec-checker");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="DNSSEC Chain Checker"
      menuLabel="DNS tools"
      sidebar={<DnsToolsSidebar active="dnssec" />}
      sidebarLabel="DNS tools sidebar"
    >
      <main className={styles.main}>
        <ToolPageHeader
          icon={<ShieldCheck strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DnssecChecker
          initialName={first(params.name)}
          initialRecordType={initialType(first(params.type))}
        />

        <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
