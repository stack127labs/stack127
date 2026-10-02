import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ChevronsRight } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { RaidzExpansionPlannerFromUrl } from "./raidz-expansion-planner-from-url";

export default async function RaidzExpansionPlannerPage() {
  const toolPage = await getRequiredToolPage("raidz-expansion-planner");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ChevronsRight strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <RaidzExpansionPlannerFromUrl />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
