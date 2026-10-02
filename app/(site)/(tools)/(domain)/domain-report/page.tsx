import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ClipboardList } from "lucide-react";
import { DomainReportFromUrl } from "./domain-report-from-url";

export default async function DomainReportPage() {
  const toolPage = await getRequiredToolPage("domain-report");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<ClipboardList strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainReportFromUrl />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
