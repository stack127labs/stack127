import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { Tags } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBackendKeywordsBuilder } from "./kdp-backend-keywords-builder";

export default async function KdpBackendKeywordsBuilderPage() {
  const toolPage = await getRequiredToolPage("kdp-backend-keywords-builder");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Tags strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpBackendKeywordsBuilder />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
