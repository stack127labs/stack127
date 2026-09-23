import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { ClipboardList } from "lucide-react";
import { AppShell } from "../../../ui/site/app-shell";
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
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<ClipboardList strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainReportTool initialName={first(params.name)} />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
