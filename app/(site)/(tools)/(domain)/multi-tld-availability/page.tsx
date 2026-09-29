import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Layers } from "lucide-react";
import { MultiTldTool } from "./multi-tld-tool";

export default async function MultiTldAvailabilityPage() {
  const toolPage = await getRequiredToolPage("multi-tld-availability");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas as="main" className="domain-tool-main">
        <ToolPageHeader
          icon={<Layers strokeWidth={2.2} />}
          toolPage={toolPage}
        />

        <MultiTldTool />

        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
