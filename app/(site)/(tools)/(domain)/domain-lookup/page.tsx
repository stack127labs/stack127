import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { FileSearch } from "lucide-react";
import { DomainLookupFromUrl } from "./domain-lookup-from-url";

export default async function DomainLookupPage() {
  const toolPage = await getRequiredToolPage("domain-lookup");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<FileSearch strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <DomainLookupFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
