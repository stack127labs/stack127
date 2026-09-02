import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/dns-tools/dns-tools.css";
import { Server } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../../(catalogs)/dns-tools/dns-tools-sidebar";
import { NameserverChecker } from "./nameserver-checker";
import styles from "../../(catalogs)/dns-tools/dns-diagnostics.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function NameserverCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("nameserver-checker");
  const params = await searchParams;
  return (
    <AppShell mainLabel="Nameserver Delegation Checker" menuLabel="DNS tools" sidebar={<DnsToolsSidebar active="nameserver" />} sidebarLabel="DNS tools sidebar">
      <main className={styles.main}>
        <ToolPageHeader
          icon={<Server strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <NameserverChecker initialName={first(params.name)} />
        <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
