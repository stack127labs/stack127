import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ClipboardList } from "lucide-react";
import { DomainReportTool } from "./domain-report-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainReportPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("domain-report");
  const params = await searchParams;

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<ClipboardList strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainReportTool initialName={first(params.name)} />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
