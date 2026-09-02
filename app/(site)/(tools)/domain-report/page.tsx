import { ToolPageHeader, ToolPageMarkdown } from "@/app/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { DomainReportTool } from "./domain-report-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainReportPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("domain-report");
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Registration Report"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="report" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <ToolPageHeader
          icon={<ClipboardList strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainReportTool initialName={first(params.name)} />

        <hr className="domain-divider" />

          <ToolPageMarkdown toolPage={toolPage} />
      </main>
    </AppShell>
  );
}
