import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/dns-tools/dns-tools.css";
import { FileKey } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../../(catalogs)/dns-tools/dns-tools-sidebar";
import { CaaChecker } from "./caa-checker";
import styles from "../../(catalogs)/dns-tools/dns-diagnostics.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function CaaCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("caa-checker");
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="CAA Policy Checker"
      menuLabel="DNS tools"
      sidebar={<DnsToolsSidebar active="caa" />}
      sidebarLabel="DNS tools sidebar"
    >
      <main className={styles.main}>
        <ToolPageHeader
          icon={<FileKey strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <CaaChecker initialName={first(params.name)} />

        <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
