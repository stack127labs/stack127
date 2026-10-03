import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Calculator } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { StorageGrowthPlannerFromUrl } from "./storage-growth-planner-from-url";

export default async function StorageGrowthPlannerPage() {
  const toolPage = await getRequiredToolPage("storage-growth-planner");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Calculator strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <StorageGrowthPlannerFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
