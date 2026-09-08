import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/dns-tools/dns-tools.css";
import { FileClock } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../../(catalogs)/dns-tools/dns-tools-sidebar";
import { SoaChecker } from "./soa-checker";
import styles from "./soa-checker.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function SoaCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("soa-checker");
  const params = await searchParams;
  return <AppShell mainLabel="SOA Consistency Checker" menuLabel="DNS tools" sidebar={<DnsToolsSidebar active="soa" />} sidebarLabel="DNS tools sidebar">
    <main className={styles.main}>
      <ToolPageHeader
        icon={<FileClock strokeWidth={2.2} />}
        toolPage={toolPage}
      />
      <SoaChecker initialName={first(params.name)} />
      <ToolPageMarkdown toolPage={toolPage} />
    </main>
  </AppShell>;
}
